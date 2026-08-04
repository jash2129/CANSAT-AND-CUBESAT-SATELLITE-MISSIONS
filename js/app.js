/**
 * INDIA SPACE LAB - CANSAT & CUBESAT GROUND CONTROL SOFTWARE (GCS)
 * Master Application Bootstrap & Pipeline Coordinator
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Subsystems
    const telemetry = new TelemetryEngine();
    let isStreamActive = true;
    let isTerminalPaused = false;

    // Mission Analytics KPI State
    const kpiState = {
        maxAltitude: 0.0,
        maxGForce: 1.0,
        maxDescent: 0.0,
        totalPackets: 0,
        droppedPackets: 0
    };

    // Serial Manager
    const serial = new SerialManager(
        (line) => {
            if (isStreamActive) {
                telemetry.parsePacketString(line);
                appendTerminalLine(line);
            }
        },
        (status) => {
            const btnConnect = document.getElementById('btnConnectSerial');
            if (btnConnect) {
                if (status.connected) {
                    btnConnect.innerHTML = '<span class="btn-dot" style="background:#00e676;"></span> DISCONNECT';
                    btnConnect.className = 'gcs-btn gcs-btn-danger';
                } else {
                    btnConnect.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v10m-4-6l4 4 4-4M5 12h14v7a3 3 0 01-3 3H8a3 3 0 01-3-3v-7z"/></svg> CONNECT';
                    btnConnect.className = 'gcs-btn gcs-btn-primary';
                }
            }
        }
    );

    // Simulator
    const simulator = new MissionSimulator(telemetry);

    // Visualizers
    const charts = new TelemetryCharts();
    window.gcsCharts = charts;
    const map = new GpsTrackingMap('leafletMap');
    window.gcsMap = map;
    const orientation = new OrientationVisualizer('threeOrientationContainer');
    window.gcsOrientation = orientation;
    const camera = new CameraManager();
    window.gcsCamera = camera;

    // Controls
    const controls = new MissionControls(telemetry, serial, simulator);
    window.gcsControls = controls;
    window.gcsTelemetry = telemetry;

    // 2. Start Default Mode (Mission Simulator)
    simulator.start();

    // 3. Telemetry Pipeline Subscription
    telemetry.subscribe((packet, isUpdateOnly) => {
        // Update KPI Analytics
        updateKPIs(packet);

        // UI Text Elements Update
        updateTelemetryUI(packet);

        // 4-Digit Error System Update
        updateErrorSystemUI(packet);

        // Flight State Vocal Announcements
        if (packet.flightState) {
            controls.announceFlightState(packet.flightState);
        }

        // Visualizations Update
        if (!isUpdateOnly) {
            charts.update(packet);
            map.update(packet);
            orientation.update(packet);
            camera.update(packet);

            // Audio heartbeat or alarm
            if (packet.errorCode && packet.errorCode !== '0000') {
                controls.playAlarm();
            } else {
                controls.playBeep(1200, 'sine', 0.03);
            }

            // Raw terminal
            appendTerminalLine(packet.raw || JSON.stringify(packet));
        }
    });

    // 4. Update Mission KPI Analytics
    function updateKPIs(p) {
        kpiState.totalPackets++;

        if (p.altitude > kpiState.maxAltitude) {
            kpiState.maxAltitude = p.altitude;
            setText('kpiMaxAlt', `${kpiState.maxAltitude.toFixed(1)} <small>m</small>`);
        }

        const gTotal = Math.sqrt(p.accX * p.accX + p.accY * p.accY + p.accZ * p.accZ);
        if (gTotal > kpiState.maxGForce) {
            kpiState.maxGForce = gTotal;
            setText('kpiMaxG', `${kpiState.maxGForce.toFixed(2)} <small>G</small>`);
        }

        const descent = Math.abs(p.descentRate || 0);
        if (descent > kpiState.maxDescent) {
            kpiState.maxDescent = descent;
            setText('kpiMaxDescent', `${kpiState.maxDescent.toFixed(1)} <small>m/s</small>`);
        }

        const integrity = 100.0;
        setText('kpiLossRate', `${integrity.toFixed(1)}%`);

        const flightSeconds = Math.floor(simulator.missionTimeSeconds);
        const mins = Math.floor(flightSeconds / 60).toString().padStart(2, '0');
        const secs = (flightSeconds % 60).toString().padStart(2, '0');
        setText('kpiFlightTime', `${mins}:${secs}`);
    }

    // 5. Update Telemetry UI Displays
    function updateTelemetryUI(p) {
        // Container Telemetry
        setText('telPacketCount', p.packetCount);
        setText('telAltitude', `${p.altitude.toFixed(1)} <small>m</small>`);
        setText('telPressure', `${p.pressure.toFixed(2)} <small>hPa</small>`);
        setText('telTempExt', `${p.tempExt.toFixed(1)} <small>°C</small>`);
        setText('telDescentRate', `${Math.abs(p.descentRate || 0).toFixed(1)} <small>m/s</small>`);
        setText('telContainerState', p.flightState);

        // Payload Telemetry
        setText('telVoltage', `${p.voltage.toFixed(2)} <small>V</small>`);
        setText('telTempInt', `${p.tempInt.toFixed(1)} <small>°C</small>`);
        setText('telAttitude', `${p.gyroR.toFixed(0)}° / ${p.gyroP.toFixed(0)}° / ${p.gyroY.toFixed(0)}°`);
        setText('telAccel', `${p.accX.toFixed(1)} / ${p.accY.toFixed(1)} / ${p.accZ.toFixed(1)} <small>G</small>`);
        setText('telGpsSats', `${p.gpsSats} Sats`);
        setText('telRssi', `${p.rssi || -68} <small>dBm</small>`);

        // Flight State Status Pill
        const stateLabel = document.getElementById('flightStateLabel');
        if (stateLabel) {
            stateLabel.textContent = p.flightState.replace(/_/g, ' ');
        }
    }

    // 6. Update 4-Digit Error System UI
    function updateErrorSystemUI(p) {
        const code = p.errorCode || '0000';
        const d1 = code[0] || '0';
        const d2 = code[1] || '0';
        const d3 = code[2] || '0';
        const d4 = code[3] || '0';

        const isFault = code !== '0000';

        // Badge
        const badge = document.getElementById('errorCodeBadge');
        if (badge) {
            badge.textContent = `${code} ${isFault ? 'FAULT DETECTED' : 'NORMAL'}`;
            badge.className = `error-code-badge ${isFault ? 'fault' : ''}`;
        }

        // Card Border
        const errCard = document.getElementById('errorCodeCard');
        if (errCard) {
            if (isFault) errCard.classList.add('fault-active');
            else errCard.classList.remove('fault-active');
        }

        // Digit 1: Descent Rate
        setDigitBox('errDigit1Box', 'errDigit1', d1, 'errDigit1Desc', 
            d1 === '0' ? 'Within 8–10 m/s' : 'Unsafe Velocity');

        // Digit 2: GPS Lock
        setDigitBox('errDigit2Box', 'errDigit2', d2, 'errDigit2Desc',
            d2 === '0' ? 'Data Available' : 'No GPS Fix / Lost');

        // Digit 3: Separation
        setDigitBox('errDigit3Box', 'errDigit3', d3, 'errDigit3Desc',
            d3 === '0' ? 'Separated OK' : 'Separation Failure');

        // Digit 4: Parachute
        setDigitBox('errDigit4Box', 'errDigit4', d4, 'errDigit4Desc',
            d4 === '0' ? 'Inactive' : 'Emergency Chute Active');
    }

    function setDigitBox(boxId, numId, val, descId, descText) {
        const box = document.getElementById(boxId);
        const num = document.getElementById(numId);
        const desc = document.getElementById(descId);

        if (num) num.textContent = val;
        if (desc) desc.textContent = descText;
        if (box) {
            if (val === '1') box.classList.add('fault');
            else box.classList.remove('fault');
        }
    }

    function setText(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }

    // 7. Terminal Viewport
    function appendTerminalLine(text) {
        if (isTerminalPaused) return;
        const term = document.getElementById('terminalViewport');
        if (!term) return;

        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.textContent = text;

        term.appendChild(line);

        while (term.children.length > 150) {
            term.removeChild(term.firstChild);
        }

        term.scrollTop = term.scrollHeight;
    }

    // Terminal Controls
    const btnPauseTerm = document.getElementById('btnPauseTerminal');
    if (btnPauseTerm) {
        btnPauseTerm.addEventListener('click', () => {
            isTerminalPaused = !isTerminalPaused;
            btnPauseTerm.textContent = isTerminalPaused ? 'RESUME' : 'PAUSE';
        });
    }

    const btnClearTerm = document.getElementById('btnClearTerminal');
    if (btnClearTerm) {
        btnClearTerm.addEventListener('click', () => {
            const term = document.getElementById('terminalViewport');
            if (term) term.innerHTML = '<div class="terminal-line system-line">[SYSTEM] Terminal buffer cleared.</div>';
        });
    }

    // 8. Mission Clocks Timer
    setInterval(() => {
        const now = new Date();

        // UTC Clock
        const utcEl = document.getElementById('utcClock');
        if (utcEl) {
            utcEl.textContent = `${now.toISOString().substring(11, 19)} UTC`;
        }

        // Local Clock
        const localEl = document.getElementById('localClock');
        if (localEl) {
            localEl.textContent = `${now.toTimeString().substring(0, 8)} IST`;
        }

        // MET Clock
        const metEl = document.getElementById('metClock');
        if (metEl && simulator.isRunning) {
            metEl.textContent = simulator.formatSecondsToHMS(simulator.missionTimeSeconds);
        }
    }, 100);

    // 9. Stream Start/Stop Toggle
    const btnToggleStream = document.getElementById('btnToggleStream');
    const streamBtnText = document.getElementById('streamBtnText');
    if (btnToggleStream && streamBtnText) {
        btnToggleStream.addEventListener('click', () => {
            isStreamActive = !isStreamActive;
            if (isStreamActive) {
                streamBtnText.textContent = 'STOP STREAM';
                btnToggleStream.className = 'gcs-btn gcs-btn-danger';
                if (document.getElementById('dataSourceSelect').value === 'simulator') {
                    simulator.start();
                }
            } else {
                streamBtnText.textContent = 'START STREAM';
                btnToggleStream.className = 'gcs-btn gcs-btn-success';
                simulator.stop();
            }
        });
    }

    // 10. Simulator Quick Controls
    const btnLaunch = document.getElementById('btnLaunchSim');
    if (btnLaunch) {
        btnLaunch.addEventListener('click', () => {
            simulator.launch();
            controls.logCommand('🚀 Rocket boost ignition commanded! Ascent initiated.', 'success');
            controls.playBeep(900, 'square', 0.2);
        });
    }

    const btnResetSim = document.getElementById('btnResetSim');
    if (btnResetSim) {
        btnResetSim.addEventListener('click', () => {
            simulator.resetFlightProfile();
            telemetry.reset();
            charts.reset();
            map.clearTrail();
            kpiState.maxAltitude = 0.0;
            kpiState.maxGForce = 1.0;
            kpiState.maxDescent = 0.0;
            setText('kpiMaxAlt', '0.0 <small>m</small>');
            setText('kpiMaxG', '1.00 <small>G</small>');
            setText('kpiMaxDescent', '0.0 <small>m/s</small>');
            controls.logCommand('Mission Simulator profile reset to PRE-LAUNCH.', 'warn');
        });
    }

    // 11. Data Source Selector
    const sourceSelect = document.getElementById('dataSourceSelect');
    const serialGroup = document.getElementById('serialControlsGroup');
    const simGroup = document.getElementById('simControlsGroup');
    const fileInput = document.getElementById('logFileInput');

    if (sourceSelect) {
        sourceSelect.addEventListener('change', (e) => {
            const mode = e.target.value;
            if (mode === 'serial') {
                simulator.stop();
                if (serialGroup) serialGroup.style.display = 'flex';
                if (simGroup) simGroup.style.display = 'none';
                controls.logCommand('Mode changed: Web Serial Hardware Port.', 'info');
            } else if (mode === 'simulator') {
                serial.disconnect();
                simulator.start();
                if (serialGroup) serialGroup.style.display = 'none';
                if (simGroup) simGroup.style.display = 'flex';
                controls.logCommand('Mode changed: Mission Flight Simulator.', 'info');
            } else if (mode === 'file') {
                simulator.stop();
                if (fileInput) fileInput.click();
            }
        });
    }

    // Replay File Input
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const text = ev.target.result;
                const lines = text.split(/\r\n|\n/);
                controls.logCommand(`Replaying log file: ${file.name} (${lines.length} lines)...`, 'info');
                let idx = 0;
                const replayTimer = setInterval(() => {
                    if (idx >= lines.length) {
                        clearInterval(replayTimer);
                        controls.logCommand('Log replay completed.', 'success');
                        return;
                    }
                    const line = lines[idx++].trim();
                    if (line) telemetry.parsePacketString(line);
                }, 1000);
            };
            reader.readAsText(file);
        });
    }

    // Serial Connect Button
    const btnConnectSerial = document.getElementById('btnConnectSerial');
    if (btnConnectSerial) {
        btnConnectSerial.addEventListener('click', async () => {
            if (serial.isConnected) {
                await serial.disconnect();
                controls.logCommand('Web Serial Port Disconnected.', 'warn');
            } else {
                const baud = document.getElementById('baudRateSelect').value;
                try {
                    await serial.connect(baud);
                    controls.logCommand(`Web Serial Port connected @ ${baud} baud.`, 'success');
                } catch (err) {
                    controls.logCommand(`Serial connection error: ${err.message}`, 'danger');
                }
            }
        });
    }

    // 12. Fault Injection Chips
    const faultChips = [
        { btnId: 'btnFaultDescent', key: 'descent', label: 'Descent Rate Fault' },
        { btnId: 'btnFaultGPS', key: 'gps', label: 'GPS Loss Fault' },
        { btnId: 'btnFaultSep', key: 'separation', label: 'Separation Fault' },
        { btnId: 'btnFaultChute', key: 'parachute', label: 'Emergency Parachute Fault' }
    ];

    faultChips.forEach(fc => {
        const btn = document.getElementById(fc.btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                const isActive = !btn.classList.contains('active');
                if (isActive) btn.classList.add('active');
                else btn.classList.remove('active');

                telemetry.setFault(fc.key, isActive);
                controls.logCommand(`Fault Injection [${fc.label}]: ${isActive ? 'ENABLED (FAULT)' : 'DISABLED (NORMAL)'}`, isActive ? 'danger' : 'success');
            });
        }
    });

    // 13. Graph Tabs
    const graphTabs = document.querySelectorAll('.graph-tab');
    graphTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            graphTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.graphTarget;
            document.querySelectorAll('.chart-wrapper').forEach(wrapper => {
                wrapper.classList.remove('active');
            });
            const activeWrapper = document.getElementById(`chartTab-${target}`);
            if (activeWrapper) activeWrapper.classList.add('active');
        });
    });

    // 14. Map Center & Clear Controls
    const btnCenterMap = document.getElementById('btnCenterMap');
    if (btnCenterMap) {
        btnCenterMap.addEventListener('click', () => map.centerOnCanSat());
    }
    const btnClearTrail = document.getElementById('btnClearTrail');
    if (btnClearTrail) {
        btnClearTrail.addEventListener('click', () => map.clearTrail());
    }

    // 15. Camera Controls
    const camSelect = document.getElementById('cameraSelect');
    const btnToggleCam = document.getElementById('btnToggleCam');
    const btnSnapCam = document.getElementById('btnSnapCam');

    if (camSelect) {
        camSelect.addEventListener('change', (e) => {
            camera.startCamera(e.target.value);
        });
    }

    if (btnToggleCam) {
        btnToggleCam.addEventListener('click', () => {
            if (camera.isStreaming) {
                camera.stopWebcam();
                camera.startSimulatedFeed();
                btnToggleCam.textContent = 'START CAM';
            } else {
                camera.startCamera(camSelect ? camSelect.value : null);
                btnToggleCam.textContent = 'STOP CAM';
            }
        });
    }

    if (btnSnapCam) {
        btnSnapCam.addEventListener('click', () => {
            camera.takeSnapshot();
            controls.logCommand('Optical snapshot image downloaded.', 'success');
        });
    }

    controls.logCommand('Ground Control Station ready. Autonomous flight telemetry active.', 'success');
});
