# INDIA SPACE LAB
## CanSat & CubeSat Satellite Ground Control Software (GCS)
### Comprehensive Mission Project Report

**Course Domain**: Aerospace Engineering / Embedded Systems / Avionics / Ground Systems  
**Project Category**: Real-Time Telemetry Monitoring and Mission Operations Software  
**Organization**: India Space Lab (ISL), Janakpuri, New Delhi, India  

---

## 1. Executive Summary & Mission Overview

The **Single-Page Ground Control Software (GCS)** is an aerospace operations dashboard engineered to monitor, analyze, and control CanSat and CubeSat missions in real time. Designed in accordance with international aerospace standards (NASA, ESA, and ISRO mission control paradigms), the software provides real-time telemetry decoding, fault diagnosis via a 4-digit condition matrix, 3D attitude visualization, dynamic orbital/trajectory GPS mapping, optical payload video streaming, and mission-critical telecommand capabilities.

The software interfaces directly with onboard microcontrollers (such as the **WeGyanik Kit / Arduino / ESP32**) over the **Web Serial API** (USB-UART), while featuring an integrated physics-based **Autonomous Mission Flight Simulator** for pre-flight testing and operational training.

---

## 2. System Architecture & High-Level Design

```
+--------------------------------------------------------------------------------------------------------------------+
|                                    CANSAT / CUBESAT FLIGHT SYSTEM & WEGYANIK KIT                                   |
|   [BMP280 Baro]   [MPU6050 6-DOF IMU]   [NEO-6M GPS]   [Battery Mon]   [Pyro Separation]   [Recovery Beacon]       |
+--------------------------------------------------------------------------------------------------------------------+
                                                        │ (115200 Baud UART / RF Transceiver)
                                                        ▼
+--------------------------------------------------------------------------------------------------------------------+
|                                 GROUND STATION INTERFACE (WEB SERIAL / SIMULATOR)                                  |
+--------------------------------------------------------------------------------------------------------------------+
                                                        │
                      ┌─────────────────────────────────┼─────────────────────────────────┐
                      ▼                                 ▼                                 ▼
+-----------------------------+   +-----------------------------+   +-----------------------------+
|    TELEMETRY ENGINE (JS)    |   |     DATA VISUALIZATION      |   |   MISSION COMMAND CONSOLE   |
| - CSV & JSON Stream Parsing |   | - Chart.js Live Graphs      |   | - Manual Separation         |
| - Container / Payload Split |   | - Leaflet GPS Trajectory    |   | - Emergency Parachute       |
| - Dynamic 4-Digit Error Sys |   | - Three.js 3D Orientation   |   | - Redundant Avionics Switch |
| - Time & Checksum Handling  |   | - Attitude Director (ADI)   |   | - Tare / Sensor Calibrate   |
| - CSV & Log Archival Engine |   | - Optical Video Stream HUD  |   | - Safety Arming Interlocks  |
+-----------------------------+   +-----------------------------+   +-----------------------------+
```

### Module Directory Structure
```
cansat_and_cubesat_project/
├── index.html                     # Unified Single-Page Aerospace Dashboard
├── css/
│   └── styles.css                 # Dark Glassmorphic Aerospace Theme & HUD Styles
├── js/
│   ├── telemetry.js               # 20-Field Telemetry Decoder & 4-Digit Error Matrix
│   ├── serial.js                  # Native Web Serial API USB UART Driver
│   ├── simulator.js               # Physics-Based Flight Dynamics Simulator
│   ├── charts.js                  # Multi-Channel Chart.js v4 Real-Time Graphing
│   ├── map.js                     # Leaflet.js GPS Tracking & Trajectory Mapper
│   ├── orientation.js             # Three.js 3D Attitude Model & Artificial Horizon
│   ├── camera.js                  # Optical Video Stream, Flight HUD & Snapshot Tool
│   ├── controls.js                # Mission Command Dispatcher, Audio Synth & Exporter
│   └── app.js                     # Master Bootstrap & Pipeline Coordinator
├── arduino/
│   └── cansat_telemetry_firmware/
│       └── cansat_telemetry_firmware.ino # WeGyanik Kit / Arduino C++ Firmware
├── sample_telemetry_flight_log.csv# Flight Test Telemetry Log for Simulation & Replay
├── PROJECT_REPORT.md              # Academic & Technical Engineering Report
└── USER_MANUAL.md                 # Operator Quick Start & Flight Procedures
```

---

## 3. Mathematical Models & Aerodynamic Equations

### 3.1 Barometric Altitude & Pressure Formula
The barometric altitude $h$ is computed from atmospheric pressure $P$ using the US Standard Atmosphere Barometric Equation:

$$P = P_0 \cdot \left(1 - \frac{L \cdot h}{T_0}\right)^{\frac{g \cdot M}{R \cdot L}}$$

Inverting to solve for altitude $h$ above sea level:

$$h = \frac{T_0}{L} \cdot \left(1 - \left(\frac{P}{P_0}\right)^{\frac{R \cdot L}{g \cdot M}}\right)$$

Where:
- $P_0 = 1013.25\text{ hPa}$ (Standard sea-level atmospheric pressure)
- $T_0 = 288.15\text{ K}$ (Standard sea-level temperature)
- $L = 0.0065\text{ K/m}$ (Temperature lapse rate)
- $g = 9.80665\text{ m/s}^2$ (Gravitational acceleration)
- $M = 0.0289644\text{ kg/mol}$ (Molar mass of Earth's dry air)
- $R = 8.31447\text{ J/(mol}\cdot\text{K)}$ (Universal gas constant)

### 3.2 Terminal Descent Velocity under Parachute
During parachute descent, equilibrium is reached when gravitational force equals aerodynamic drag:

$$m \cdot g = \frac{1}{2} \cdot \rho \cdot v_t^2 \cdot C_d \cdot A$$

Solving for terminal descent velocity $v_t$:

$$v_t = \sqrt{\frac{2 \cdot m \cdot g}{\rho \cdot C_d \cdot A}}$$

Where:
- $m = 0.500\text{ kg}$ (CanSat total mass)
- $\rho \approx 1.225\text{ kg/m}^3$ (Air density at sea level)
- $C_d \approx 1.50$ (Hemispherical parachute drag coefficient)
- $A = \pi \cdot r^2$ (Parachute cross-sectional canopy area)
- Designed Safe Descent Velocity Envelope: **8.0 to 10.0 m/s**

### 3.3 Geodesic Distance (Haversine) & Compass Bearing
The Great Circle distance $d$ between Ground Station $(\phi_1, \lambda_1)$ and CanSat $(\phi_2, \lambda_2)$ is:

$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$d = 2 \cdot R_{\text{earth}} \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$

The initial azimuth heading angle $\theta$ is given by:

$$\theta = \text{atan2}\left(\sin(\Delta\lambda)\cos(\phi_2), \; \cos(\phi_1)\sin(\phi_2) - \sin(\phi_1)\cos(\phi_2)\cos(\Delta\lambda)\right)$$

---

## 4. Telemetry Communication Protocol

The software implements a standardized **20-field comma-separated values (CSV)** telemetry format transmitted at **1 Hz (1000 ms)** over serial UART or wireless downlink:

```csv
TEAM_ID,MISSION_TIME,PACKET_COUNT,ALTITUDE,PRESSURE,TEMP_EXT,TEMP_INT,VOLTAGE,GYRO_R,GYRO_P,GYRO_Y,ACC_X,ACC_Y,ACC_Z,GPS_LAT,GPS_LON,GPS_ALT,GPS_SATS,STATE,ERROR_CODE
```

### Packet Field Definitions

| Index | Field Name | Unit / Format | Example | Description |
|---|---|---|---|---|
| 0 | `TEAM_ID` | String | `ISL_1001` | Unique mission/team identifier |
| 1 | `MISSION_TIME`| `HH:MM:SS.s` | `00:04:12.3` | Mission elapsed time since power-up |
| 2 | `PACKET_COUNT` | Integer | `252` | Monotonically increasing packet sequence ID |
| 3 | `ALTITUDE` | Meters (m) | `748.20` | Barometric relative altitude above pad |
| 4 | `PRESSURE` | Hectopascals (hPa) | `928.45` | Ambient atmospheric pressure |
| 5 | `TEMP_EXT` | Celsius (°C) | `19.80` | External atmospheric temperature |
| 6 | `TEMP_INT` | Celsius (°C) | `28.40` | Internal payload avionics temperature |
| 7 | `VOLTAGE` | Volts (V) | `8.34` | Primary 2S LiPo battery bus voltage |
| 8 | `GYRO_R` | Degrees (°) | `4.2` | Roll angle ($\phi$) |
| 9 | `GYRO_P` | Degrees (°) | `-2.8` | Pitch angle ($\theta$) |
| 10 | `GYRO_Y` | Degrees (°) | `145.0` | Yaw heading angle ($\psi$) |
| 11 | `ACC_X` | G ($9.81\text{ m/s}^2$) | `0.05` | Lateral X-axis acceleration |
| 12 | `ACC_Y` | G | `-0.02` | Lateral Y-axis acceleration |
| 13 | `ACC_Z` | G | `1.01` | Vertical Z-axis acceleration |
| 14 | `GPS_LAT` | Decimal Degrees | `28.614120` | Geodetic latitude (WGS84) |
| 15 | `GPS_LON` | Decimal Degrees | `77.209350` | Geodetic longitude (WGS84) |
| 16 | `GPS_ALT` | Meters (m) | `964.20` | GPS ellipsoid altitude MSL |
| 17 | `GPS_SATS` | Integer | `11` | Number of tracked GNSS satellites |
| 18 | `STATE` | String | `MAIN_CHUTE` | Current flight state machine phase |
| 19 | `ERROR_CODE` | 4-Digit String | `0000` | Real-time system fault condition status |

---

## 5. 4-Digit Error Code Monitoring System

The 4-digit error code system provides immediate operational health visibility. Each digit maps to a specific mission subsystem where `0` denotes **NORMAL** and `1` denotes **FAULT / WARNING**:

| Digit | Condition Monitored | State `0` (Normal) | State `1` (Fault / Warning) | Trigger Logic |
|---|---|---|---|---|
| **Digit 1** | Descent Rate | Descent rate within safe 8–10 m/s range | Descent rate outside safe range | $v_{\text{descent}} < 6.5\text{ m/s}$ or $v_{\text{descent}} > 12.0\text{ m/s}$ during descent |
| **Digit 2** | GPS Availability | GPS data valid & satellite lock active | GPS data lost or unavailable | $\text{GPS Satellites} < 4$ or NaN coordinates |
| **Digit 3** | Payload Separation | Payload separated successfully | Separation mechanism failure | Separation command acknowledged false or mechanical jam |
| **Digit 4** | Emergency Parachute | Parachute system standby / nominal | Emergency backup chute activated | Secondary parachute pyrotechnic deployment triggered |

### Error Permutations Examples:
- `0000` : All flight parameters nominal.
- `1000` : Descent rate anomaly detected (possible parachute tear or high velocity descent).
- `0100` : GPS telemetry link lost; dead-reckoning active.
- `0010` : Separation failure; payload still trapped in canister.
- `0001` : Emergency backup recovery parachute deployed.
- `1111` : Critical multi-subsystem failure.

---

## 6. Mission Control & Telecommand System

Commands are transmitted from the GCS to the onboard flight computer using structured ASCII frames:

| Command Frame | Action | Safety Interlock Required |
|---|---|---|
| `CMD,1001,SEPARATION` | Triggers canister pyrotechnic release | **YES** (Dual Operator Arm Confirmation) |
| `CMD,1001,EMG_PARACHUTE`| Deploys backup emergency parachute | **YES** (Dual Operator Arm Confirmation) |
| `CMD,1001,REDUNDANT_ACT`| Switches to backup secondary MCU/avionics | No |
| `CMD,1001,BEACON_TOGGLE`| Activates acoustic recovery beeper | No |
| `CMD,1001,CALIBRATE_TARE`| Tares ground altitude & zeros gyro biases | No |

---

## 7. Verification & Test Results Matrix

| Test Case | Description | Expected Output | Status |
|---|---|---|---|
| **TC-01** | Telemetry Parsing | Accurately parse 20-field CSV string | **PASS** (Zero parse drops) |
| **TC-02** | 4-Digit Error Computation | Correctly trigger digits 1, 2, 3, 4 upon fault conditions | **PASS** (All 16 permutations verified) |
| **TC-03** | Web Serial Connection | Connect at 115200 baud, buffer lines, handle reconnects | **PASS** (Clean chunk reconstruction) |
| **TC-04** | Real-Time Graph Rendering | 60 FPS smooth updates without UI lag | **PASS** (Sliding 45-point buffer) |
| **TC-05** | 3D Orientation LERP | Smooth Euler rotation tracking Pitch, Roll, Yaw | **PASS** (Glitch-free WebGL rendering) |
| **TC-06** | Leaflet GPS Trajectory | Update marker position & draw flight breadcrumbs | **PASS** (Accurate Haversine range & azimuth) |
| **TC-07** | Camera Feed & HUD | Live webcam + simulated earth fallback with HUD overlay | **PASS** (Responsive canvas overlay) |
| **TC-08** | CSV & Graph Export | Download RFC-4180 compliant CSV and high-res PNGs | **PASS** (Verified headers & data integrity) |

---

## 8. Conclusion

The developed CanSat and CubeSat Ground Control Software fulfills all functional and operational requirements outlined in the **India Space Lab** curriculum. With its modern aesthetics, real-time data handling, integrated physics flight simulator, Web Serial hardware interfacing, and comprehensive fault monitoring, it serves as an exemplary ground station solution for educational and competitive aerospace missions.
