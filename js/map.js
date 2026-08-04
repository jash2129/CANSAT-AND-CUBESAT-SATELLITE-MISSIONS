/**
 * INDIA SPACE LAB - CANSAT & CUBESAT GROUND CONTROL SOFTWARE (GCS)
 * Leaflet.js GPS Tracking & Recovery Trajectory Engine
 * Haversine Distance, Ground Station Azimuth & Trajectory Breadcrumbs
 */

class GpsTrackingMap {
    constructor(elementId = 'leafletMap') {
        this.elementId = elementId;
        this.map = null;
        this.canSatMarker = null;
        this.groundStationMarker = null;
        this.trajectoryLine = null;
        this.sightLine = null;
        this.trajectoryCoords = [];

        // Ground Station Coordinates (India Space Lab - Janakpuri, New Delhi)
        this.gsLat = 28.613939;
        this.gsLon = 77.209021;
        this.gsAlt = 216.0;

        this.initMap();
    }

    initMap() {
        const container = document.getElementById(this.elementId);
        if (!container) return;

        // Create Leaflet Map instance
        this.map = L.map(this.elementId, {
            center: [this.gsLat, this.gsLon],
            zoom: 15,
            zoomControl: true,
            attributionControl: false
        });

        // Add CartoDB Dark Matter tile layer for aerospace aesthetic
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd'
        }).addTo(this.map);

        // Custom Ground Station Icon
        const gsIcon = L.divIcon({
            className: 'custom-gs-marker',
            html: `
                <div style="background:#7c4dff; width:16px; height:16px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 10px #7c4dff; display:flex; align-items:center; justify-content:center;">
                    <div style="background:#fff; width:4px; height:4px; border-radius:50%;"></div>
                </div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        this.groundStationMarker = L.marker([this.gsLat, this.gsLon], { icon: gsIcon })
            .addTo(this.map)
            .bindPopup('<b>ISL Ground Station</b><br>Janakpuri, New Delhi');

        // Custom CanSat Marker
        const cansatIcon = L.divIcon({
            className: 'custom-cansat-marker',
            html: `
                <div style="position:relative; width:22px; height:22px;">
                    <div style="position:absolute; inset:0; background:rgba(0,240,255,0.4); border-radius:50%; animation:pulseGlow 1.5s infinite;"></div>
                    <div style="position:absolute; inset:4px; background:#00f0ff; border-radius:50%; border:2px solid #fff; box-shadow:0 0 12px #00f0ff;"></div>
                </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });

        this.canSatMarker = L.marker([this.gsLat, this.gsLon], { icon: cansatIcon })
            .addTo(this.map)
            .bindPopup('<b>CanSat Payload</b><br>Altitude: 0m');

        // Trajectory Polyline
        this.trajectoryLine = L.polyline([], {
            color: '#00f0ff',
            weight: 3,
            opacity: 0.85,
            dashArray: '2, 6'
        }).addTo(this.map);

        // Ground Station to CanSat Sightline Vector
        this.sightLine = L.polyline([], {
            color: '#ffab00',
            weight: 1.5,
            opacity: 0.6,
            dashArray: '4, 4'
        }).addTo(this.map);

        // Invalidate map size after layout render
        setTimeout(() => {
            if (this.map) this.map.invalidateSize();
        }, 500);
    }

    /**
     * Update GPS marker and flight trajectory
     */
    update(packet) {
        if (!this.map || isNaN(packet.gpsLat) || isNaN(packet.gpsLon)) return;

        const currentPos = [packet.gpsLat, packet.gpsLon];

        // Update CanSat Marker
        this.canSatMarker.setLatLng(currentPos);
        this.canSatMarker.setPopupContent(`
            <div style="font-family:'JetBrains Mono', monospace; font-size:11px; color:#000;">
                <b>🛰️ CanSat / CubeSat</b><br>
                Alt: ${packet.altitude.toFixed(1)} m<br>
                Lat: ${packet.gpsLat.toFixed(6)}°<br>
                Lon: ${packet.gpsLon.toFixed(6)}°<br>
                Sats: ${packet.gpsSats}
            </div>
        `);

        // Append to Trajectory
        this.trajectoryCoords.push(currentPos);
        this.trajectoryLine.setLatLngs(this.trajectoryCoords);

        // Update Sightline Vector
        this.sightLine.setLatLngs([
            [this.gsLat, this.gsLon],
            currentPos
        ]);

        // Calculate Geodesic Metrics
        const distanceKm = this.calculateHaversineDistance(this.gsLat, this.gsLon, packet.gpsLat, packet.gpsLon);
        const azimuthDeg = this.calculateBearing(this.gsLat, this.gsLon, packet.gpsLat, packet.gpsLon);

        // Update UI displays
        const elLat = document.getElementById('mapLat');
        const elLon = document.getElementById('mapLon');
        const elDist = document.getElementById('mapDistance');
        const elAz = document.getElementById('mapAzimuth');

        if (elLat) elLat.textContent = `${packet.gpsLat.toFixed(4)}° ${packet.gpsLat >= 0 ? 'N' : 'S'}`;
        if (elLon) elLon.textContent = `${packet.gpsLon.toFixed(4)}° ${packet.gpsLon >= 0 ? 'E' : 'W'}`;
        if (elDist) elDist.textContent = `${distanceKm < 1 ? (distanceKm * 1000).toFixed(0) + ' m' : distanceKm.toFixed(2) + ' km'}`;
        if (elAz) elAz.textContent = `${azimuthDeg.toFixed(1)}°`;
    }

    centerOnCanSat() {
        if (this.map && this.canSatMarker) {
            this.map.panTo(this.canSatMarker.getLatLng());
        }
    }

    clearTrail() {
        this.trajectoryCoords = [];
        if (this.trajectoryLine) {
            this.trajectoryLine.setLatLngs([]);
        }
    }

    /**
     * Haversine formula for spherical distance (km)
     */
    calculateHaversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Calculate initial compass bearing/azimuth from GS to CanSat
     */
    calculateBearing(lat1, lon1, lat2, lon2) {
        const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
        const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
                  Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
        const brng = Math.atan2(y, x) * 180 / Math.PI;
        return (brng + 360) % 360;
    }
}

// Attach to window
window.GpsTrackingMap = GpsTrackingMap;
