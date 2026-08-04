/**
 * INDIA SPACE LAB - CANSAT & CUBESAT GROUND CONTROL SOFTWARE (GCS)
 * Mission Controls, Command Dispatcher, Web Audio Synthesizer,
 * CAPCOM Voice Announcer, Shortcuts & Configuration Manager
 */

class MissionControls {
    constructor(telemetryEngine, serialManager, simulator) {
        this.engine = telemetryEngine;
        this.serial = serialManager;
        this.sim = simulator;

        this.audioEnabled = true;
        this.voiceEnabled = true;
        this.audioCtx = null;
        this.lastAlarmTime = 0;
        this.lastSpokenPhase = '';

        // Pending critical command for modal confirmation
        this.pendingCommand = null;

        this.initAudio();
        this.loadSettings();
        this.bindEvents();
        this.bindShortcuts();
    }

    /**
     * Initialize Web Audio API Synthesizer
     */
    initAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        } catch (e) {
            console.warn('[MissionControls] Web Audio not available:', e);
        }
    }

    ensureAudioUnlocked() {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    /**
     * Synthesize short telemetry ping / click
     */
    playBeep(freq = 880, type = 'sine', duration = 0.05) {
        if (!this.audioEnabled || !this.audioCtx) return;
        this.ensureAudioUnlocked();

        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

            gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {}
    }

    /**
     * Synthesize emergency warning alarm tone
     */
    playAlarm() {
        if (!this.audioEnabled || !this.audioCtx) return;
        const now = Date.now();
        if (now - this.lastAlarmTime < 1500) return;
        this.lastAlarmTime = now;

        this.ensureAudioUnlocked();

        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(650, this.audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(900, this.audioCtx.currentTime + 0.25);
            osc.frequency.linearRampToValueAtTime(650, this.audioCtx.currentTime + 0.5);

            gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.5);
        } catch (e) {}
    }

    /**
     * Web Speech API Vocal Announcements (CAPCOM Flight Communicator)
     */
    speak(phrase) {
        if (!this.voiceEnabled || !this.audioEnabled) return;
        if ('speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(phrase);
                utterance.rate = 1.05;
                utterance.pitch = 0.95;
                utterance.volume = 0.85;

                const voices = window.speechSynthesis.getVoices();
                const engVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('English')));
                if (engVoice) utterance.voice = engVoice;

                window.speechSynthesis.speak(utterance);
            } catch (e) {}
        }
    }

    /**
     * Flight phase transition voice dispatcher
     */
    announceFlightState(phase) {
        if (phase === this.lastSpokenPhase) return;
        this.lastSpokenPhase = phase;

        switch (phase) {
            case 'BOOST':
                this.speak('Rocket boost ignition confirmed. Vehicle ascending.');
                break;
            case 'APOGEE':
                this.speak('CanSat has reached mission apogee.');
                break;
            case 'SEPARATION':
                this.speak('Canister separation initiated. Payload release nominal.');
                break;
            case 'DROGUE':
                this.speak('Drogue stabilizer chute deployed.');
                break;
            case 'MAIN_CHUTE':
                this.speak('Main recovery parachute deployed. Terminal velocity nominal.');
                break;
            case 'LANDED':
                this.speak('Touchdown detected. CanSat payload landed safely.');
                break;
        }
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('ISL_GCS_CONFIG');
            if (saved) {
                const cfg = JSON.parse(saved);
                if (cfg.teamId && document.getElementById('cfgTeamId')) document.getElementById('cfgTeamId').value = cfg.teamId;
                if (cfg.gsLat && document.getElementById('cfgGsLat')) document.getElementById('cfgGsLat').value = cfg.gsLat;
                if (cfg.gsLon && document.getElementById('cfgGsLon')) document.getElementById('cfgGsLon').value = cfg.gsLon;
                if (cfg.minDescent && document.getElementById('cfgMinDescent')) document.getElementById('cfgMinDescent').value = cfg.minDescent;
                if (cfg.maxDescent && document.getElementById('cfgMaxDescent')) document.getElementById('cfgMaxDescent').value = cfg.maxDescent;
                if (typeof cfg.voice === 'boolean') {
                    this.voiceEnabled = cfg.voice;
                    if (document.getElementById('cfgVoiceAnnouncer')) document.getElementById('cfgVoiceAnnouncer').checked = cfg.voice;
                }
            }
        } catch (e) {}
    }

    /**
     * Save settings to localStorage and apply
     */
    saveSettings() {
        const teamId = document.getElementById('cfgTeamId')?.value || 'ISL_1001';
        const gsLat = parseFloat(document.getElementById('cfgGsLat')?.value) || 28.6139;
        const gsLon = parseFloat(document.getElementById('cfgGsLon')?.value) || 77.2090;
        const minDescent = parseFloat(document.getElementById('cfgMinDescent')?.value) || 6.5;
        const maxDescent = parseFloat(document.getElementById('cfgMaxDescent')?.value) || 12.0;
        const voice = document.getElementById('cfgVoiceAnnouncer')?.checked ?? true;

        this.voiceEnabled = voice;

        if (window.gcsMap) {
            window.gcsMap.groundStation = { lat: gsLat, lon: gsLon, alt: 216 };
            window.gcsMap.updateGSMarker();
        }

        const configObj = { teamId, gsLat, gsLon, minDescent, maxDescent, voice };
        localStorage.setItem('ISL_GCS_CONFIG', JSON.stringify(configObj));

        this.logCommand(`Mission configuration updated. Team ID: ${teamId}, GS: ${gsLat.toFixed(4)}, ${gsLon.toFixed(4)}`, 'success');
        this.playBeep(950, 'sine', 0.08);

        const modal = document.getElementById('settingsModal');
        if (modal) modal.style.display = 'none';
    }

    /**
     * Bind UI event listeners
     */
    bindEvents() {
        // Audio Mute Toggle
        const btnAudio = document.getElementById('btnToggleAudio');
        const iconOn = document.getElementById('audioIconOn');
        const iconOff = document.getElementById('audioIconOff');

        if (btnAudio) {
            btnAudio.addEventListener('click', () => {
                this.audioEnabled = !this.audioEnabled;
                if (iconOn) iconOn.style.display = this.audioEnabled ? 'block' : 'none';
                if (iconOff) iconOff.style.display = this.audioEnabled ? 'none' : 'block';
                this.logCommand(`Audio alerts & voice ${this.audioEnabled ? 'UNMUTED' : 'MUTED'}`, 'info');
            });
        }

        // Fullscreen Toggle
        const btnFullscreen = document.getElementById('btnToggleFullscreen');
        if (btnFullscreen) {
            btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
        }

        // Simulation Speed Selector
        const speedSelect = document.getElementById('simSpeedSelect');
        if (speedSelect && this.sim) {
            speedSelect.addEventListener('change', (e) => {
                const speed = parseFloat(e.target.value) || 1;
                this.sim.speedMultiplier = speed;
                this.logCommand(`Simulation physics rate adjusted to ${speed}x`, 'info');
            });
        }

        // Settings Modal Open/Close
        const btnOpenSettings = document.getElementById('btnOpenSettings');
        const modalSettings = document.getElementById('settingsModal');
        const btnSaveSettings = document.getElementById('btnSettingsSave');
        const btnCancelSettings = document.getElementById('btnSettingsCancel');

        if (btnOpenSettings && modalSettings) {
            btnOpenSettings.addEventListener('click', () => {
                modalSettings.style.display = 'flex';
            });
        }
        if (btnCancelSettings && modalSettings) {
            btnCancelSettings.addEventListener('click', () => {
                modalSettings.style.display = 'none';
            });
        }
        if (btnSaveSettings) {
            btnSaveSettings.addEventListener('click', () => this.saveSettings());
        }

        // Shortcuts Modal Open/Close
        const btnOpenShortcuts = document.getElementById('btnOpenShortcuts');
        const modalShortcuts = document.getElementById('shortcutsModal');
        const btnCloseShortcuts = document.getElementById('btnShortcutsClose');

        if (btnOpenShortcuts && modalShortcuts) {
            btnOpenShortcuts.addEventListener('click', () => {
                modalShortcuts.style.display = 'flex';
            });
        }
        if (btnCloseShortcuts && modalShortcuts) {
            btnCloseShortcuts.addEventListener('click', () => {
                modalShortcuts.style.display = 'none';
            });
        }

        // 3D Model Toggle (CanSat vs CubeSat)
        const btnCanSat = document.getElementById('btnModelCanSat');
        const btnCubeSat = document.getElementById('btnModelCubeSat');
        if (btnCanSat && btnCubeSat) {
            btnCanSat.addEventListener('click', () => {
                btnCanSat.classList.add('active');
                btnCubeSat.classList.remove('active');
                if (window.gcsOrientation) window.gcsOrientation.setModelType('cansat');
                this.logCommand('3D Viewport: Render mode set to CanSat Body.', 'info');
            });
            btnCubeSat.addEventListener('click', () => {
                btnCubeSat.classList.add('active');
                btnCanSat.classList.remove('active');
                if (window.gcsOrientation) window.gcsOrientation.setModelType('cubesat');
                this.logCommand('3D Viewport: Render mode set to 1U CubeSat Frame.', 'info');
            });
        }

        // Export CSV
        const btnExportCsv = document.getElementById('btnExportCSV');
        if (btnExportCsv) {
            btnExportCsv.addEventListener('click', () => this.exportCSV());
        }

        // Export Graph
        const btnExportGraph = document.getElementById('btnExportGraph');
        if (btnExportGraph) {
            btnExportGraph.addEventListener('click', () => {
                if (window.gcsCharts) {
                    window.gcsCharts.exportActiveChart();
                    this.logCommand('Active graph exported as high-res PNG image.', 'success');
                }
            });
        }

        // Sync Time
        const btnSync = document.getElementById('btnSyncTime');
        if (btnSync) {
            btnSync.addEventListener('click', () => {
                const now = new Date();
                this.logCommand(`PC RTC Time Synchronized: ${now.toTimeString().split(' ')[0]}`, 'success');
                this.playBeep(1200, 'sine', 0.08);
            });
        }

        // Reset Packet Counter
        const btnResetPacket = document.getElementById('btnResetPacket');
        if (btnResetPacket) {
            btnResetPacket.addEventListener('click', () => {
                this.engine.reset();
                if (window.gcsCharts) window.gcsCharts.reset();
                this.logCommand('Telemetry Packet Counter & History Buffer Reset.', 'warn');
                this.playBeep(440, 'triangle', 0.1);
            });
        }

        // Mission Critical Command Buttons
        const btnSep = document.getElementById('btnCmdSeparation');
        if (btnSep) {
            btnSep.addEventListener('click', () => this.requestCriticalCommand({
                code: 'CMD,1001,SEPARATION',
                title: 'MANUAL PAYLOAD SEPARATION',
                warning: 'You are triggering physical separation of the CanSat payload from the container canister. Ensure proper altitude envelope.'
            }));
        }

        const btnChute = document.getElementById('btnCmdParachute');
        if (btnChute) {
            btnChute.addEventListener('click', () => this.requestCriticalCommand({
                code: 'CMD,1001,EMG_PARACHUTE',
                title: 'EMERGENCY PARACHUTE DEPLOYMENT',
                warning: 'Deploying the backup recovery parachute will immediately alter descent dynamics. This action is irreversible.'
            }));
        }

        const btnRedundant = document.getElementById('btnCmdRedundant');
        if (btnRedundant) {
            btnRedundant.addEventListener('click', () => {
                this.executeCommand('CMD,1001,REDUNDANT_ACT');
            });
        }

        const btnBeacon = document.getElementById('btnCmdBeacon');
        if (btnBeacon) {
            btnBeacon.addEventListener('click', () => {
                this.executeCommand('CMD,1001,BEACON_TOGGLE');
            });
        }

        const btnTare = document.getElementById('btnCmdTare');
        if (btnTare) {
            btnTare.addEventListener('click', () => {
                this.executeCommand('CMD,1001,CALIBRATE_TARE');
            });
        }

        // Critical Command Modal Handlers
        const modal = document.getElementById('cmdConfirmModal');
        const chkArm = document.getElementById('chkModalSafetyArm');
        const btnModalExec = document.getElementById('btnModalExecute');
        const btnModalCancel = document.getElementById('btnModalCancel');

        if (chkArm && btnModalExec) {
            chkArm.addEventListener('change', () => {
                btnModalExec.disabled = !chkArm.checked;
            });
        }

        if (btnModalCancel) {
            btnModalCancel.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
                this.pendingCommand = null;
                this.logCommand('Critical command transmission ABORTED by operator.', 'warn');
            });
        }

        if (btnModalExec) {
            btnModalExec.addEventListener('click', () => {
                if (this.pendingCommand) {
                    this.executeCommand(this.pendingCommand.code);
                }
                if (modal) modal.style.display = 'none';
                this.pendingCommand = null;
            });
        }
    }

    /**
     * Operator Keyboard Shortcuts Listener
     */
    bindShortcuts() {
        window.addEventListener('keydown', (e) => {
            // Ignore key events when typing inside inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                const btnToggle = document.getElementById('btnToggleStream');
                if (btnToggle) btnToggle.click();
            } else if (e.code === 'KeyL') {
                const btnLaunch = document.getElementById('btnLaunchSim');
                if (btnLaunch && !btnLaunch.disabled) btnLaunch.click();
            } else if (e.code === 'KeyR') {
                const btnReset = document.getElementById('btnResetSim');
                if (btnReset) btnReset.click();
            } else if (e.code === 'KeyM') {
                const btnAudio = document.getElementById('btnToggleAudio');
                if (btnAudio) btnAudio.click();
            } else if (e.code === 'KeyC') {
                const btnCenter = document.getElementById('btnCenterMap');
                if (btnCenter) btnCenter.click();
            } else if (e.code === 'KeyS') {
                const btnSnap = document.getElementById('btnSnapCam');
                if (btnSnap) btnSnap.click();
            } else if (e.code === 'KeyF') {
                this.toggleFullscreen();
            } else if (e.code === 'Digit1') {
                document.querySelector('.graph-tab[data-graph-target="altitude-descent"]')?.click();
            } else if (e.code === 'Digit2') {
                document.querySelector('.graph-tab[data-graph-target="pressure-temp"]')?.click();
            } else if (e.code === 'Digit3') {
                document.querySelector('.graph-tab[data-graph-target="battery-rssi"]')?.click();
            } else if (e.code === 'Digit4') {
                document.querySelector('.graph-tab[data-graph-target="imu-dynamics"]')?.click();
            }
        });
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    }

    /**
     * Prompt operator with safety confirmation modal for irreversible actions
     */
    requestCriticalCommand(cmdConfig) {
        this.pendingCommand = cmdConfig;
        const modal = document.getElementById('cmdConfirmModal');
        const titleEl = document.getElementById('modalCmdTitle');
        const warnEl = document.getElementById('modalCmdWarning');
        const detailsEl = document.getElementById('modalCmdDetails');
        const chkArm = document.getElementById('chkModalSafetyArm');
        const btnModalExec = document.getElementById('btnModalExecute');

        if (modal) {
            if (titleEl) titleEl.textContent = cmdConfig.title;
            if (warnEl) warnEl.textContent = cmdConfig.warning;
            if (detailsEl) detailsEl.textContent = `TARGET: ${cmdConfig.code}`;
            if (chkArm) chkArm.checked = false;
            if (btnModalExec) btnModalExec.disabled = true;

            modal.style.display = 'flex';
            this.playBeep(600, 'sawtooth', 0.15);
        }
    }

    /**
     * Transmit and process command
     */
    async executeCommand(cmdStr) {
        const timestamp = new Date().toTimeString().split(' ')[0];
        this.playBeep(1040, 'square', 0.1);

        // Update top status tag
        const tagEl = document.getElementById('lastCmdTag');
        if (tagEl) {
            tagEl.textContent = `SENT: ${cmdStr.split(',')[2] || 'CMD'}`;
        }

        // Send via Web Serial if connected
        if (this.serial && this.serial.isConnected) {
            try {
                await this.serial.sendCommand(cmdStr);
                this.logCommand(`[${timestamp}] TX: ${cmdStr} [ACK RECEIVED]`, 'success');
            } catch (err) {
                this.logCommand(`[${timestamp}] TX FAILED: ${cmdStr} (${err.message})`, 'danger');
            }
        } else {
            // Apply directly in Simulator mode
            if (this.sim) {
                if (cmdStr.includes('SEPARATION')) {
                    this.sim.flightPhase = 'SEPARATION';
                    this.sim.isSeparated = true;
                } else if (cmdStr.includes('EMG_PARACHUTE')) {
                    this.sim.flightPhase = 'MAIN_CHUTE';
                    this.sim.isEmergencyChute = true;
                    this.sim.verticalVelocity = -8.5;
                } else if (cmdStr.includes('REDUNDANT_ACT')) {
                    this.sim.isRedundantActive = !this.sim.isRedundantActive;
                } else if (cmdStr.includes('BEACON_TOGGLE')) {
                    this.sim.isBeaconActive = !this.sim.isBeaconActive;
                } else if (cmdStr.includes('CALIBRATE_TARE')) {
                    this.sim.relativeAltitude = 0.0;
                }
            }
            this.logCommand(`[${timestamp}] TX (SIM): ${cmdStr} [ACK SIMULATED OK]`, 'success');
        }
    }

    /**
     * Add log entry to command console
     */
    logCommand(msg, level = 'info') {
        const logBox = document.getElementById('commandExecutionLog');
        if (!logBox) return;

        const entry = document.createElement('div');
        entry.className = `cmd-log-entry ${level}`;
        entry.textContent = msg;

        logBox.appendChild(entry);
        logBox.scrollTop = logBox.scrollHeight;
    }

    /**
     * Export telemetry records to CSV file
     */
    exportCSV() {
        const csvContent = this.engine.exportToCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `ISL_CANSAT_TELEMETRY_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.logCommand(`Telemetry CSV exported successfully (${this.engine.history.length} packets recorded).`, 'success');
    }
}

// Attach to window
window.MissionControls = MissionControls;
