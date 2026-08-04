/**
 * INDIA SPACE LAB - CANSAT & CUBESAT GROUND CONTROL SOFTWARE (GCS)
 * Optical Video Streaming & Aerospace Flight HUD Engine
 * MediaDevices API, Camera Selector, Simulated Earth Stream & Snapshot Exporter
 */

class CameraManager {
    constructor() {
        this.videoEl = document.getElementById('webcamVideo');
        this.simCanvas = document.getElementById('simulatedVideoCanvas');
        this.cameraSelect = document.getElementById('cameraSelect');
        this.stream = null;
        this.isStreaming = false;
        this.isSimulated = true;
        this.simAnimationId = null;

        // Simulated camera state
        this.simAngle = 0;
        this.latestAltitude = 0;
        this.latestDescentRate = 0;

        this.initDevices();
        this.startSimulatedFeed();
    }

    /**
     * Populate camera selection list
     */
    async initDevices() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return;
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === 'videoinput');

            if (this.cameraSelect) {
                // Keep simulated option
                this.cameraSelect.innerHTML = '<option value="simulated">🛰️ Simulated Earth View</option>';
                videoDevices.forEach((device, index) => {
                    const opt = document.createElement('option');
                    opt.value = device.deviceId;
                    opt.textContent = device.label || `📷 Camera ${index + 1}`;
                    this.cameraSelect.appendChild(opt);
                });
            }
        } catch (err) {
            console.warn('[CameraManager] Could not enumerate devices:', err);
        }
    }

    /**
     * Start physical webcam or simulated feed
     */
    async startCamera(deviceId = null) {
        if (deviceId === 'simulated' || !deviceId) {
            this.stopWebcam();
            this.startSimulatedFeed();
            return;
        }

        try {
            this.stopSimulatedFeed();
            const constraints = {
                video: deviceId ? { deviceId: { exact: deviceId } } : true,
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (this.videoEl) {
                this.videoEl.srcObject = this.stream;
                this.videoEl.style.display = 'block';
            }
            if (this.simCanvas) {
                this.simCanvas.style.display = 'none';
            }
            this.isStreaming = true;
            this.isSimulated = false;
        } catch (err) {
            console.error('[CameraManager] Camera access error, falling back to simulated:', err);
            this.startSimulatedFeed();
        }
    }

    /**
     * Stop physical webcam stream
     */
    stopWebcam() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.videoEl) {
            this.videoEl.srcObject = null;
            this.videoEl.style.display = 'none';
        }
        this.isStreaming = false;
    }

    /**
     * Simulated high-altitude earth atmosphere & terrain video feed generator
     */
    startSimulatedFeed() {
        this.isSimulated = true;
        if (this.simCanvas) {
            this.simCanvas.style.display = 'block';
        }
        if (this.videoEl) {
            this.videoEl.style.display = 'none';
        }

        const ctx = this.simCanvas ? this.simCanvas.getContext('2d') : null;
        if (!ctx) return;

        // Resize canvas to parent
        this.simCanvas.width = 320;
        this.simCanvas.height = 200;

        const renderSimFrame = () => {
            this.simAngle += 0.015;
            const w = this.simCanvas.width;
            const h = this.simCanvas.height;

            // Sky Gradient (altitude dependent)
            const altRatio = Math.min(1.0, this.latestAltitude / 1000.0);
            const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
            skyGrad.addColorStop(0, `rgb(${Math.floor(10 * (1 - altRatio))}, ${Math.floor(20 * (1 - altRatio))}, ${Math.floor(60 + 100 * (1 - altRatio))})`);
            skyGrad.addColorStop(0.6, `rgb(${Math.floor(120 * (1 - altRatio * 0.5))}, ${Math.floor(180 * (1 - altRatio * 0.3))}, 240)`);
            skyGrad.addColorStop(1.0, '#3a5a40');

            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, w, h);

            // Earth Curvature Horizon
            ctx.save();
            ctx.beginPath();
            const horizonY = h * 0.6 + Math.sin(this.simAngle * 0.8) * 8;
            ctx.arc(w / 2, horizonY + 300, 320, Math.PI, 2 * Math.PI, false);
            const groundGrad = ctx.createRadialGradient(w / 2, horizonY, 10, w / 2, horizonY, 200);
            groundGrad.addColorStop(0, '#2d6a4f');
            groundGrad.addColorStop(0.5, '#1b4332');
            groundGrad.addColorStop(1, '#081c15');
            ctx.fillStyle = groundGrad;
            ctx.fill();
            ctx.restore();

            // Drifting Clouds
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            for (let i = 0; i < 4; i++) {
                const cx = ((this.simAngle * 30 + i * 90) % (w + 100)) - 50;
                const cy = horizonY - 20 + (i * 12);
                ctx.beginPath();
                ctx.arc(cx, cy, 25, 0, Math.PI * 2);
                ctx.arc(cx + 15, cy - 8, 18, 0, Math.PI * 2);
                ctx.arc(cx - 15, cy - 4, 20, 0, Math.PI * 2);
                ctx.fill();
            }

            // High-tech Scanlines
            ctx.fillStyle = 'rgba(0, 240, 255, 0.04)';
            for (let y = 0; y < h; y += 4) {
                ctx.fillRect(0, y, w, 1);
            }

            this.simAnimationId = requestAnimationFrame(renderSimFrame);
        };

        if (this.simAnimationId) cancelAnimationFrame(this.simAnimationId);
        this.simAnimationId = requestAnimationFrame(renderSimFrame);
    }

    stopSimulatedFeed() {
        if (this.simAnimationId) {
            cancelAnimationFrame(this.simAnimationId);
            this.simAnimationId = null;
        }
    }

    /**
     * Update telemetry overlay values
     */
    update(packet) {
        this.latestAltitude = packet.altitude || 0;
        this.latestDescentRate = Math.abs(packet.descentRate || 0);

        const elAlt = document.getElementById('hudAlt');
        const elSpd = document.getElementById('hudSpd');
        if (elAlt) elAlt.textContent = `${this.latestAltitude.toFixed(1)}m`;
        if (elSpd) elSpd.textContent = `${this.latestDescentRate.toFixed(1)}m/s`;
    }

    /**
     * Capture still snapshot PNG from active feed
     */
    takeSnapshot() {
        const offscreen = document.createElement('canvas');
        offscreen.width = 640;
        offscreen.height = 480;
        const ctx = offscreen.getContext('2d');

        if (!this.isSimulated && this.videoEl && this.videoEl.videoWidth) {
            ctx.drawImage(this.videoEl, 0, 0, offscreen.width, offscreen.height);
        } else if (this.simCanvas) {
            ctx.drawImage(this.simCanvas, 0, 0, offscreen.width, offscreen.height);
        }

        // Draw Telemetry Watermark
        ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
        ctx.font = 'bold 14px "JetBrains Mono", monospace';
        ctx.fillText(`ISL CANSAT OPTICAL SNAPSHOT | ALT: ${this.latestAltitude.toFixed(1)}m | ${new Date().toISOString()}`, 15, 30);

        // Download
        const link = document.createElement('a');
        link.download = `CANSAT_OPTICAL_SNAPSHOT_${Date.now()}.png`;
        link.href = offscreen.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Attach to window
window.CameraManager = CameraManager;
