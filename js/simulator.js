/**
 * INDIA SPACE LAB - CANSAT & CUBESAT GROUND CONTROL SOFTWARE (GCS)
 * Autonomous Mission Flight Simulator
 * Physics-Engine for Atmospheric Ascent, Separation, Parachute Dynamics & GPS Drift
 */

class MissionSimulator {
    constructor(telemetryEngine) {
        this.engine = telemetryEngine;
        this.timer = null;
        this.isRunning = false;
        this.sampleRateMs = 1000; // 1 Hz standard telemetry rate
        this._speedMultiplier = 1;

        // Mission parameters & state
        this.teamId = 'ISL_1001';
        this.packetIndex = 0;
        this.missionTimeSeconds = 0;

        // Launch site coordinates (ISL Ground Station reference: New Delhi)
        this.baseLat = 28.613939;
        this.baseLon = 77.209021;
        this.baseAlt = 216.0; // MSL ground altitude (meters)

        // Dynamic flight state variables
        this.resetFlightProfile();
    }

    get speedMultiplier() {
        return this._speedMultiplier;
    }

    set speedMultiplier(val) {
        this._speedMultiplier = Math.max(0.5, Math.min(20, val));
        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }

    resetFlightProfile() {
        this.flightPhase = 'PRE_LAUNCH';
        this.simTime = 0; // seconds from launch
        this.relativeAltitude = 0.0; // meters above ground
        this.verticalVelocity = 0.0; // m/s (positive upwards)
        this.lat = this.baseLat;
        this.lon = this.baseLon;
        this.roll = 0.0;
        this.pitch = 0.0;
        this.yaw = 0.0;
        this.batteryVoltage = 8.40;
        this.isSeparated = false;
        this.isEmergencyChute = false;
        this.isRedundantActive = false;
        this.isBeaconActive = false;
        this.gpsLost = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        const interval = Math.max(50, Math.round(this.sampleRateMs / this._speedMultiplier));
        this.timer = setInterval(() => this.step(), interval);
    }

    stop() {
        this.isRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    launch() {
        if (this.flightPhase === 'PRE_LAUNCH' || this.flightPhase === 'LANDED') {
            this.resetFlightProfile();
            this.flightPhase = 'BOOST';
            this.verticalVelocity = 95.0; // initial rocket boost velocity
        }
    }

    /**
     * Advance simulation by 1 step (1 second dt)
     */
    step() {
        if (!this.isRunning) return;

        this.packetIndex++;
        this.missionTimeSeconds += (this.sampleRateMs / 1000.0);
        const dt = this.sampleRateMs / 1000.0;

        // Battery slow discharge
        this.batteryVoltage = Math.max(7.2, this.batteryVoltage - 0.0008 * dt);

        // State Machine Flight Dynamics
        switch (this.flightPhase) {
            case 'PRE_LAUNCH':
                this.relativeAltitude = 0.0;
                this.verticalVelocity = 0.0;
                this.roll = (Math.sin(this.missionTimeSeconds * 0.5) * 0.5);
                this.pitch = (Math.cos(this.missionTimeSeconds * 0.5) * 0.5);
                this.yaw = 45.0;
                break;

            case 'BOOST':
                this.simTime += dt;
                // Boost phase accelerates up to ~1000m
                this.verticalVelocity -= 9.81 * 0.3 * dt; // aerodynamic drag deceleration
                this.relativeAltitude += this.verticalVelocity * dt;

                // High acceleration & vibration
                this.roll += (Math.random() - 0.5) * 15;
                this.pitch = 85.0 + (Math.random() - 0.5) * 4;
                this.yaw = (this.yaw + 12 * dt) % 360;

                if (this.relativeAltitude >= 1000.0 || this.verticalVelocity <= 0) {
                    this.flightPhase = 'APOGEE';
                    this.verticalVelocity = 0.0;
                }
                break;

            case 'APOGEE':
                this.simTime += dt;
                this.flightPhase = 'SEPARATION';
                this.isSeparated = true;
                break;

            case 'SEPARATION':
                this.simTime += dt;
                this.flightPhase = 'DROGUE_DESCENT';
                this.verticalVelocity = -18.5; // Fast descent with drogue chute
                break;

            case 'DROGUE_DESCENT':
                this.simTime += dt;
                this.verticalVelocity = -18.0 + (Math.random() - 0.5) * 1.5;
                this.relativeAltitude += this.verticalVelocity * dt;

                // Wind drift during descent
                this.lat += 0.00004 * dt;
                this.lon += 0.00006 * dt;

                // Moderate tumble
                this.roll = Math.sin(this.simTime * 2.0) * 25.0;
                this.pitch = Math.cos(this.simTime * 1.8) * 20.0;
                this.yaw = (this.yaw + 35 * dt) % 360;

                // Deploy Main Parachute at 500m
                if (this.relativeAltitude <= 500.0) {
                    this.flightPhase = 'MAIN_CHUTE';
                    this.verticalVelocity = -8.8; // Safe 8–10 m/s standard descent rate
                }
                break;

            case 'MAIN_CHUTE':
                this.simTime += dt;
                // Safe steady descent rate: 8.5 to 9.2 m/s
                this.verticalVelocity = -8.8 + (Math.sin(this.simTime * 0.8) * 0.4);
                this.relativeAltitude += this.verticalVelocity * dt;

                // Gentle drift
                this.lat += 0.000025 * dt;
                this.lon += 0.00004 * dt;

                // Parachute pendulum oscillation
                this.roll = Math.sin(this.simTime * 1.2) * 10.0;
                this.pitch = Math.cos(this.simTime * 1.2) * 8.0;
                this.yaw = (this.yaw + 8 * dt) % 360;

                // Touchdown check
                if (this.relativeAltitude <= 0.0) {
                    this.relativeAltitude = 0.0;
                    this.verticalVelocity = 0.0;
                    this.flightPhase = 'LANDED';
                    this.isBeaconActive = true;
                }
                break;

            case 'LANDED':
                this.relativeAltitude = 0.0;
                this.verticalVelocity = 0.0;
                this.roll = 15.0; // resting on ground angle
                this.pitch = 5.0;
                break;
        }

        // Generate barometric pressure based on altitude (US Standard Atmosphere)
        // P = P0 * (1 - 0.0065 * h / 288.15)^5.25588
        const absoluteAlt = this.baseAlt + this.relativeAltitude;
        const tempExt = 24.5 - (0.0065 * this.relativeAltitude) + (Math.random() - 0.5) * 0.2;
        const pressureHpa = 1013.25 * Math.pow(1 - (0.0065 * absoluteAlt) / 288.15, 5.25588);
        const tempInt = 28.0 + (this.isRedundantActive ? 4.0 : 0.0) + (Math.random() - 0.5) * 0.1;

        // Accelerometer vector
        let accX = (Math.sin(this.roll * Math.PI / 180) + (Math.random() - 0.5) * 0.1);
        let accY = (Math.sin(this.pitch * Math.PI / 180) + (Math.random() - 0.5) * 0.1);
        let accZ = 1.0;
        if (this.flightPhase === 'BOOST') {
            accZ = 5.5 + (Math.random() - 0.5) * 0.8;
        } else if (this.flightPhase === 'LANDED') {
            accZ = 0.98;
        }

        // GPS Satellite count
        const gpsSats = this.gpsLost ? 1 : (10 + Math.floor(Math.sin(this.simTime * 0.2) * 2));

        // Format telemetry packet string
        const missionTimeStr = this.formatSecondsToHMS(this.missionTimeSeconds);
        const packetObj = {
            teamId: this.teamId,
            missionTime: missionTimeStr,
            packetCount: this.packetIndex,
            altitude: parseFloat(this.relativeAltitude.toFixed(2)),
            pressure: parseFloat(pressureHpa.toFixed(2)),
            tempExt: parseFloat(tempExt.toFixed(2)),
            tempInt: parseFloat(tempInt.toFixed(2)),
            voltage: parseFloat(this.batteryVoltage.toFixed(2)),
            gyroR: parseFloat(this.roll.toFixed(1)),
            gyroP: parseFloat(this.pitch.toFixed(1)),
            gyroY: parseFloat(this.yaw.toFixed(1)),
            accX: parseFloat(accX.toFixed(2)),
            accY: parseFloat(accY.toFixed(2)),
            accZ: parseFloat(accZ.toFixed(2)),
            gpsLat: parseFloat(this.lat.toFixed(6)),
            gpsLon: parseFloat(this.lon.toFixed(6)),
            gpsAlt: parseFloat((this.baseAlt + this.relativeAltitude).toFixed(2)),
            gpsSats: gpsSats,
            flightState: this.flightPhase,
            errorCode: '0000' // Telemetry engine will dynamically evaluate this
        };

        this.engine.processPacketObject(packetObj);
    }

    /**
     * Convert seconds to HH:MM:SS.s
     */
    formatSecondsToHMS(sec) {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        const tenths = Math.floor((sec % 1) * 10);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${tenths}`;
    }
}

// Attach to window
window.MissionSimulator = MissionSimulator;
