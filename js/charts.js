/**
 * INDIA SPACE LAB - CANSAT & CUBESAT GROUND CONTROL SOFTWARE (GCS)
 * Real-Time Telemetry Graphing Engine (Chart.js v4)
 * Synced Multi-Channel Dynamics & High-Resolution Export
 */

class TelemetryCharts {
    constructor() {
        this.maxPoints = 45; // Max data points shown in rolling window
        this.charts = {};
        this.initCharts();
    }

    /**
     * Common Chart.js options for dark aerospace HUD theme
     */
    getBaseOptions(y1Label, y2Label = null) {
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 250 },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Inter', size: 10, weight: '600' },
                        boxWidth: 12,
                        padding: 8
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 16, 32, 0.9)',
                    titleColor: '#00f0ff',
                    bodyColor: '#f0f4fc',
                    borderColor: 'rgba(0, 240, 255, 0.3)',
                    borderWidth: 1,
                    padding: 8,
                    titleFont: { family: 'JetBrains Mono', size: 10 },
                    bodyFont: { family: 'JetBrains Mono', size: 10 }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#64748b',
                        font: { family: 'JetBrains Mono', size: 9 },
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 8
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    title: {
                        display: true,
                        text: y1Label,
                        color: '#00f0ff',
                        font: { family: 'Inter', size: 9, weight: 'bold' }
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'JetBrains Mono', size: 9 }
                    }
                }
            }
        };

        if (y2Label) {
            options.scales.y1 = {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false },
                title: {
                    display: true,
                    text: y2Label,
                    color: '#00e676',
                    font: { family: 'Inter', size: 9, weight: 'bold' }
                },
                ticks: {
                    color: '#00e676',
                    font: { family: 'JetBrains Mono', size: 9 }
                }
            };
        }

        return options;
    }

    /**
     * Initialize all 4 multi-channel charts
     */
    initCharts() {
        // Chart 1: Altitude & Descent Rate
        const ctxAlt = document.getElementById('chartAltitudeDescent');
        if (ctxAlt) {
            this.charts.altDescent = new Chart(ctxAlt, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Altitude (m)',
                            data: [],
                            borderColor: '#00f0ff',
                            backgroundColor: 'rgba(0, 240, 255, 0.12)',
                            fill: true,
                            tension: 0.25,
                            borderWidth: 2,
                            pointRadius: 0,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Descent Rate (m/s)',
                            data: [],
                            borderColor: '#00e676',
                            backgroundColor: 'transparent',
                            borderWidth: 1.8,
                            borderDash: [4, 4],
                            pointRadius: 0,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: this.getBaseOptions('Altitude (m)', 'Descent (m/s)')
            });
        }

        // Chart 2: Pressure & Temperature
        const ctxPress = document.getElementById('chartPressureTemp');
        if (ctxPress) {
            this.charts.pressTemp = new Chart(ctxPress, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Pressure (hPa)',
                            data: [],
                            borderColor: '#7c4dff',
                            backgroundColor: 'rgba(124, 77, 255, 0.1)',
                            fill: true,
                            tension: 0.25,
                            borderWidth: 2,
                            pointRadius: 0,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Ext Temp (°C)',
                            data: [],
                            borderColor: '#00b4d8',
                            backgroundColor: 'transparent',
                            borderWidth: 1.5,
                            pointRadius: 0,
                            yAxisID: 'y1'
                        },
                        {
                            label: 'Int Temp (°C)',
                            data: [],
                            borderColor: '#ffab00',
                            backgroundColor: 'transparent',
                            borderWidth: 1.5,
                            pointRadius: 0,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: this.getBaseOptions('Pressure (hPa)', 'Temp (°C)')
            });
        }

        // Chart 3: Battery & RSSI
        const ctxBatt = document.getElementById('chartBatteryRssi');
        if (ctxBatt) {
            this.charts.battRssi = new Chart(ctxBatt, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Battery (V)',
                            data: [],
                            borderColor: '#ffab00',
                            backgroundColor: 'rgba(255, 171, 0, 0.1)',
                            fill: true,
                            tension: 0.2,
                            borderWidth: 2,
                            pointRadius: 0,
                            yAxisID: 'y'
                        },
                        {
                            label: 'RSSI (dBm)',
                            data: [],
                            borderColor: '#3d8bfd',
                            backgroundColor: 'transparent',
                            borderWidth: 1.5,
                            pointRadius: 0,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: this.getBaseOptions('Battery (V)', 'RSSI (dBm)')
            });
        }

        // Chart 4: IMU Accelerometer & Gyro
        const ctxImu = document.getElementById('chartImuDynamics');
        if (ctxImu) {
            this.charts.imuDynamics = new Chart(ctxImu, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Roll (°)',
                            data: [],
                            borderColor: '#ff1744',
                            borderWidth: 1.5,
                            pointRadius: 0,
                            tension: 0.2
                        },
                        {
                            label: 'Pitch (°)',
                            data: [],
                            borderColor: '#00e676',
                            borderWidth: 1.5,
                            pointRadius: 0,
                            tension: 0.2
                        },
                        {
                            label: 'Yaw (°)',
                            data: [],
                            borderColor: '#00f0ff',
                            borderWidth: 1.5,
                            pointRadius: 0,
                            tension: 0.2
                        },
                        {
                            label: 'Acc Z (G)',
                            data: [],
                            borderColor: '#ffab00',
                            borderDash: [3, 3],
                            borderWidth: 1.5,
                            pointRadius: 0,
                            tension: 0.2
                        }
                    ]
                },
                options: this.getBaseOptions('Angle (°) / Accel (G)')
            });
        }
    }

    /**
     * Feed new telemetry packet into charts
     */
    update(packet) {
        const timeLabel = packet.missionTime ? packet.missionTime.split('.')[0] : String(packet.packetCount);

        // Update Chart 1 (Alt & Descent)
        if (this.charts.altDescent) {
            const chart = this.charts.altDescent;
            this.pushData(chart, timeLabel, [packet.altitude, Math.abs(packet.descentRate || 0)]);
        }

        // Update Chart 2 (Press & Temp)
        if (this.charts.pressTemp) {
            const chart = this.charts.pressTemp;
            this.pushData(chart, timeLabel, [packet.pressure, packet.tempExt, packet.tempInt]);
        }

        // Update Chart 3 (Batt & RSSI)
        if (this.charts.battRssi) {
            const chart = this.charts.battRssi;
            const rssiVal = packet.rssi || -65;
            this.pushData(chart, timeLabel, [packet.voltage, rssiVal]);
        }

        // Update Chart 4 (IMU)
        if (this.charts.imuDynamics) {
            const chart = this.charts.imuDynamics;
            this.pushData(chart, timeLabel, [packet.gyroR, packet.gyroP, packet.gyroY, packet.accZ]);
        }
    }

    /**
     * Helper to append data and slide rolling window
     */
    pushData(chart, label, values) {
        chart.data.labels.push(label);
        values.forEach((val, idx) => {
            if (chart.data.datasets[idx]) {
                chart.data.datasets[idx].data.push(val);
            }
        });

        if (chart.data.labels.length > this.maxPoints) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(ds => ds.data.shift());
        }

        chart.update('none'); // Update without full slow animation for high FPS
    }

    /**
     * Clear all chart data
     */
    reset() {
        Object.values(this.charts).forEach(chart => {
            chart.data.labels = [];
            chart.data.datasets.forEach(ds => {
                ds.data = [];
            });
            chart.update();
        });
    }

    /**
     * Export currently active chart as high-res PNG image
     */
    exportActiveChart(chartKey = 'altDescent') {
        const chart = this.charts[chartKey] || this.charts.altDescent;
        if (!chart) return;

        const imageUri = chart.toBase64Image('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `CANSAT_CHART_${chartKey.toUpperCase()}_${Date.now()}.png`;
        link.href = imageUri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Attach to window
window.TelemetryCharts = TelemetryCharts;
