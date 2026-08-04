/**
 * INDIA SPACE LAB - CANSAT & CUBESAT GROUND CONTROL SOFTWARE (GCS)
 * Telemetry Parser & Error Code Engine
 * Standard 20-Field CanSat / CubeSat CSV Protocol
 */

class TelemetryEngine {
    constructor() {
        this.history = [];
        this.maxHistoryLength = 5000; // Store up to 5000 packets in RAM
        this.packetCounter = 0;
        this.latestPacket = null;
        this.manualFaults = {
            descent: false,
            gps: false,
            separation: false,
            parachute: false
        };

        // Callbacks for subscribers
        this.listeners = [];
    }

    /**
     * Subscribe to new parsed telemetry packets
     * @param {Function} callback 
     */
    subscribe(callback) {
        this.listeners.push(callback);
    }

    /**
     * Set manual fault override for live testing
     */
    setFault(faultKey, state) {
        if (this.manualFaults.hasOwnProperty(faultKey)) {
            this.manualFaults[faultKey] = !!state;
            if (this.latestPacket) {
                // Re-evaluate error code on latest packet
                this.latestPacket.errorCode = this.evaluateErrorCode(this.latestPacket);
                this.notifySubscribers(this.latestPacket, true);
            }
        }
    }

    /**
     * Parse raw string line (CSV or JSON)
     * Format: TEAM_ID,MISSION_TIME,PACKET_COUNT,ALTITUDE,PRESSURE,TEMP_EXT,TEMP_INT,VOLTAGE,GYRO_R,GYRO_P,GYRO_Y,ACC_X,ACC_Y,ACC_Z,GPS_LAT,GPS_LON,GPS_ALT,GPS_SATS,STATE,ERROR_CODE
     */
    parsePacketString(rawString) {
        if (!rawString || typeof rawString !== 'string') return null;
        const line = rawString.trim();
        if (line.length === 0 || line.startsWith('#') || line.startsWith('//')) return null;

        // Try JSON parsing first
        if (line.startsWith('{') && line.endsWith('}')) {
            try {
                const jsonObj = JSON.parse(line);
                return this.processPacketObject(jsonObj, rawString);
            } catch (e) {
                // Fall back to CSV parsing
            }
        }

        // CSV parsing
        const parts = line.split(',').map(s => s.trim());
        if (parts.length < 5) return null; // Too short to be a valid packet

        const packet = {
            raw: line,
            timestamp: Date.now(),
            teamId: parts[0] || 'ISL_1001',
            missionTime: parts[1] || '00:00:00.0',
            packetCount: parseInt(parts[2], 10) || ++this.packetCounter,
            altitude: parseFloat(parts[3]) || 0.0,
            pressure: parseFloat(parts[4]) || 1013.25,
            tempExt: parseFloat(parts[5]) || 24.0,
            tempInt: parseFloat(parts[6]) || 28.0,
            voltage: parseFloat(parts[7]) || 8.4,
            gyroR: parseFloat(parts[8]) || 0.0,
            gyroP: parseFloat(parts[9]) || 0.0,
            gyroY: parseFloat(parts[10]) || 0.0,
            accX: parseFloat(parts[11]) || 0.0,
            accY: parseFloat(parts[12]) || 0.0,
            accZ: parseFloat(parts[13]) || 1.0,
            gpsLat: parseFloat(parts[14]) || 28.6139,
            gpsLon: parseFloat(parts[15]) || 77.2090,
            gpsAlt: parseFloat(parts[16]) || 0.0,
            gpsSats: parseInt(parts[17], 10) || 10,
            flightState: parts[18] || 'PRE_LAUNCH',
            errorCode: parts[19] || '0000'
        };

        return this.finalizePacket(packet);
    }

    /**
     * Process object directly
     */
    processPacketObject(obj, rawStr) {
        const packet = {
            raw: rawStr || JSON.stringify(obj),
            timestamp: Date.now(),
            teamId: obj.teamId || 'ISL_1001',
            missionTime: obj.missionTime || this.formatTimeMs(Date.now()),
            packetCount: parseInt(obj.packetCount ?? ++this.packetCounter, 10),
            altitude: parseFloat(obj.altitude ?? 0.0),
            pressure: parseFloat(obj.pressure ?? 1013.25),
            tempExt: parseFloat(obj.tempExt ?? 24.0),
            tempInt: parseFloat(obj.tempInt ?? 28.0),
            voltage: parseFloat(obj.voltage ?? 8.4),
            gyroR: parseFloat(obj.gyroR ?? 0.0),
            gyroP: parseFloat(obj.gyroP ?? 0.0),
            gyroY: parseFloat(obj.gyroY ?? 0.0),
            accX: parseFloat(obj.accX ?? 0.0),
            accY: parseFloat(obj.accY ?? 0.0),
            accZ: parseFloat(obj.accZ ?? 1.0),
            gpsLat: parseFloat(obj.gpsLat ?? 28.6139),
            gpsLon: parseFloat(obj.gpsLon ?? 77.2090),
            gpsAlt: parseFloat(obj.gpsAlt ?? 0.0),
            gpsSats: parseInt(obj.gpsSats ?? 10, 10),
            flightState: obj.flightState || 'PRE_LAUNCH',
            errorCode: obj.errorCode || '0000'
        };

        return this.finalizePacket(packet);
    }

    /**
     * Calculate derived parameters (descent rate, dynamic error code) and push to history
     */
    finalizePacket(packet) {
        // Calculate descent velocity based on previous packet
        if (this.latestPacket && this.latestPacket.timestamp) {
            const dt = (packet.timestamp - this.latestPacket.timestamp) / 1000.0;
            if (dt > 0.05 && dt < 10) {
                // Negative altitude delta means descending (rate is positive downwards)
                const dAlt = this.latestPacket.altitude - packet.altitude;
                packet.descentRate = parseFloat((dAlt / dt).toFixed(2));
            } else {
                packet.descentRate = 0.0;
            }
        } else {
            packet.descentRate = 0.0;
        }

        // Evaluate 4-digit error code according to ISL specification
        packet.errorCode = this.evaluateErrorCode(packet);

        this.latestPacket = packet;
        this.history.push(packet);
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }

        this.notifySubscribers(packet);
        return packet;
    }

    /**
     * Evaluates the 4-digit error code:
     * Digit 1: Descent rate (0 = Safe 8-10 m/s, 1 = Outside safe range during descent)
     * Digit 2: GPS Availability (0 = Available, 1 = Unavailable / <4 sats)
     * Digit 3: Payload Separation (0 = Separated / Normal, 1 = Separation Failure)
     * Digit 4: Emergency Parachute (0 = Inactive, 1 = Activated)
     */
    evaluateErrorCode(packet) {
        // Check manual fault overrides first
        let d1 = this.manualFaults.descent ? '1' : '0';
        let d2 = this.manualFaults.gps ? '1' : '0';
        let d3 = this.manualFaults.separation ? '1' : '0';
        let d4 = this.manualFaults.parachute ? '1' : '0';

        // Digit 1: Descent rate check during active descent phases
        if (!this.manualFaults.descent) {
            const state = (packet.flightState || '').toUpperCase();
            if (state.includes('DESCENT') || state.includes('PARACHUTE') || state.includes('DROGUE')) {
                // Safe descent range is 8 to 10 m/s (tolerance: 7.0 - 11.5 m/s)
                if (packet.descentRate < 6.5 || packet.descentRate > 12.0) {
                    d1 = '1';
                }
            }
        }

        // Digit 2: GPS check
        if (!this.manualFaults.gps) {
            if (packet.gpsSats < 4 || isNaN(packet.gpsLat) || isNaN(packet.gpsLon) || (packet.gpsLat === 0 && packet.gpsLon === 0)) {
                d2 = '1';
            }
        }

        // Digit 3: Separation failure check
        if (!this.manualFaults.separation) {
            const state = (packet.flightState || '').toUpperCase();
            if (state.includes('SEP_FAIL') || state.includes('JAMMED')) {
                d3 = '1';
            }
        }

        // Digit 4: Emergency parachute check
        if (!this.manualFaults.parachute) {
            const state = (packet.flightState || '').toUpperCase();
            if (state.includes('EMG_CHUTE') || state.includes('EMERGENCY')) {
                d4 = '1';
            }
        }

        return `${d1}${d2}${d3}${d4}`;
    }

    /**
     * Notify all registered callbacks
     */
    notifySubscribers(packet, isUpdateOnly = false) {
        for (const cb of this.listeners) {
            try {
                cb(packet, isUpdateOnly);
            } catch (e) {
                console.error('[TelemetryEngine] Listener error:', e);
            }
        }
    }

    /**
     * Reset packet counts and buffers
     */
    reset() {
        this.packetCounter = 0;
        this.history = [];
        this.latestPacket = null;
    }

    /**
     * Format milliseconds to HH:MM:SS.s
     */
    formatTimeMs(ms) {
        const date = new Date(ms);
        const h = String(date.getUTCHours()).padStart(2, '0');
        const m = String(date.getUTCMinutes()).padStart(2, '0');
        const s = String(date.getUTCSeconds()).padStart(2, '0');
        const tenths = Math.floor(date.getUTCMilliseconds() / 100);
        return `${h}:${m}:${s}.${tenths}`;
    }

    /**
     * Export all telemetry history as CSV formatted string
     */
    exportToCSV() {
        const headers = [
            'TEAM_ID', 'MISSION_TIME', 'PACKET_COUNT', 'ALTITUDE_M', 'PRESSURE_HPA',
            'TEMP_EXT_C', 'TEMP_INT_C', 'VOLTAGE_V', 'GYRO_R_DEG', 'GYRO_P_DEG', 'GYRO_Y_DEG',
            'ACC_X_G', 'ACC_Y_G', 'ACC_Z_G', 'GPS_LAT', 'GPS_LON', 'GPS_ALT_M', 'GPS_SATS',
            'FLIGHT_STATE', 'ERROR_CODE', 'DESCENT_RATE_MS'
        ];

        const rows = this.history.map(p => [
            p.teamId,
            p.missionTime,
            p.packetCount,
            p.altitude.toFixed(2),
            p.pressure.toFixed(2),
            p.tempExt.toFixed(2),
            p.tempInt.toFixed(2),
            p.voltage.toFixed(2),
            p.gyroR.toFixed(2),
            p.gyroP.toFixed(2),
            p.gyroY.toFixed(2),
            p.accX.toFixed(2),
            p.accY.toFixed(2),
            p.accZ.toFixed(2),
            p.gpsLat.toFixed(6),
            p.gpsLon.toFixed(6),
            p.gpsAlt.toFixed(2),
            p.gpsSats,
            p.flightState,
            p.errorCode,
            p.descentRate.toFixed(2)
        ]);

        return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    }
}

// Attach to window
window.TelemetryEngine = TelemetryEngine;
