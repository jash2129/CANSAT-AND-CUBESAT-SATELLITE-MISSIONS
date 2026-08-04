# 🛰️ CanSat & CubeSat Satellite Ground Control Software (GCS)

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Web Serial API](https://img.shields.io/badge/Hardware-Web%20Serial%20API-orange.svg)](https://wicg.github.io/serial/)
[![Three.js](https://img.shields.io/badge/3D%20Graphics-Three.js%20WebGL-black.svg)](https://threejs.org/)
[![Chart.js](https://img.shields.io/badge/Telemetry-Chart.js%20v4-ff6384.svg)](https://www.chartjs.org/)
[![Leaflet](https://img.shields.io/badge/GIS%20Mapping-Leaflet.js-green.svg)](https://leafletjs.com/)
[![Standards](https://img.shields.io/badge/Standards-India%20Space%20Lab%20(ISL)-indigo.svg)](https://indiaspacelab.com/)

**An Aerospace-Grade, Zero-Dependency, Web-Native Mission Control Center for CanSat & CubeSat Sounding Rocket Missions.**

[Quick Start](#-quick-start) • [Key Features](#-key-features) • [Telemetry Protocol](#-telemetry-protocol) • [Architecture](#-system-architecture) • [Hardware Wiring](#-hardware-integration) • [Operator Manual](#-mission-operator-manual)

</div>

---

## 🌌 Overview

The **CanSat & CubeSat Ground Control Software (GCS)** is a high-performance single-page operations dashboard engineered for real-time telemetry decommutation, fault diagnosis, 3D attitude visualization, geodetic trajectory mapping, and safety-armed telecommand transmission.

Built strictly with browser-native technologies (**Web Serial API**, **Three.js WebGL**, **Chart.js v4**, **Leaflet GIS**, and **Web Audio / SpeechSynthesis**), this GCS eliminates legacy desktop toolchain dependencies (no Python Tkinter/PyQt, LabVIEW, or OS-specific USB driver installations required). It runs instantly inside any modern Chromium browser on Windows, Linux, and macOS.

```
                  ===================================================
                             MISSION CONTROL STATUS: NOMINAL
                  ===================================================
                  [ 0 ]              [ 0 ]           [ 0 ]      [ 0 ]
               Descent Rate         GPS Fix       Separation  Parachute
               8–10 m/s OK         Locked OK     Separated OK  Inactive
```

---

## ✨ Key Features

- 🔌 **Driverless Web Serial Telemetry Link**: Connects directly to flight microcontroller USB-UART hardware (Arduino, WeGyanik Kit, ESP32, STM32) at $115200\text{ baud}$ using native browser `navigator.serial`.
- 🛰️ **Dual-Geometry 3D WebGL Attitude Visualizer**: Real-time roll, pitch, and yaw rendering with dynamic mesh toggling between **Cylindrical CanSat** (gold MLI, deployable solar wings) and **1U CubeSat** ($10\times10\times10\text{ cm}$ frame with optics port and magnetometer boom).
- 🚨 **4-Digit Telemetry Condition Matrix (`D1D2D3D4`)**: Automated aerospace anomaly detection evaluating descent velocity safety envelopes ($8.0 - 10.0\text{ m/s}$), GPS satellite lock, container separation, and emergency parachute status.
- 📈 **Multi-Channel Real-Time Graphs**: 60 FPS HTML5 canvas plots for dual-axis Altitude & Velocity, Pressure & Dual Temperatures, Battery Voltage & RSSI, and 3-Axis IMU Acceleration vectors.
- 🗺️ **GIS Geodetic GPS Tracker**: Leaflet cartographic map featuring real-time polyline trajectory breadcrumbs, ground station markers, active payload reticles, and live Great-Circle range ($d$) and azimuth bearing ($\theta_{az}$) computation.
- 🗣️ **CAPCOM Vocal Annunciator & Synthesizer**: Pure Web Audio oscillators generate radar telemetry chirps and warning sirens; the Web Speech API delivers clear vocal callouts during critical flight milestones.
- 🚀 **7-Stage Atmospheric Flight Simulator**: Built-in aerodynamic physics engine (`PRE_LAUNCH` $\to$ `BOOST` $\to$ `APOGEE` $\to$ `SEPARATION` $\to$ `DROGUE_DESCENT` $\to$ `MAIN_CHUTE` $\to$ `LANDED`) for pre-flight operator qualification and fault injection testing.
- 🔒 **Safety-Interlocked Telecommand Console**: Armed uplink command transmission for mechanical container separation, emergency parachute firing, power bus redundancy, and acoustic beacon location.
- 💾 **RFC-4180 CSV Telemetry Logging**: Instant client-side export of complete historical mission flight data with millisecond timestamps.

---

## 📊 Telemetry Protocol

The GCS processes deterministic **20-field comma-separated ASCII packets** transmitted at $1\text{ Hz}$ ($1000\text{ ms}$ interval):

```csv
TEAM_ID,PKT_COUNT,TIME,ALTITUDE,PRESSURE,TEMP_EXT,TEMP_INT,VOLTAGE,GYRO_R,GYRO_P,GYRO_Y,ACC_X,ACC_Y,ACC_Z,GPS_LAT,GPS_LON,GPS_ALT,GPS_SATS,STATE,ERR_CODE
```

### Telemetry Field Breakdown:
| Index | Field Identifier | Unit / Format | Description |
|:---:|---|:---:|---|
| **1** | `TEAM_ID` | String | Unique flight identifier (e.g. `ISL_1001`) |
| **2** | `PKT_COUNT` | Integer | Monotonically incrementing packet sequence number |
| **3** | `TIME` | `HH:MM:SS` | Mission Elapsed Time (MET) |
| **4** | `ALTITUDE` | Meters ($\text{m}$) | Barometric altitude calculated via hypsometric formula |
| **5** | `PRESSURE` | $\text{hPa}$ / $\text{mbar}$ | Atmospheric barometric pressure (BMP280) |
| **6** | `TEMP_EXT` | $^\circ\text{C}$ | Ambient tropospheric temperature |
| **7** | `TEMP_INT` | $^\circ\text{C}$ | Internal avionics enclosure temperature |
| **8** | `VOLTAGE` | Volts ($\text{V}$) | 2S LiPo battery bus voltage ($7.0\text{V} - 8.4\text{V}$) |
| **9–11** | `GYRO_R, P, Y` | Degrees ($^\circ$) | 3-Axis Gyroscopic Attitude (Roll $\phi$, Pitch $\theta$, Yaw $\psi$) |
| **12–14** | `ACC_X, Y, Z` | $\text{G}$ ($9.81\text{ m/s}^2$) | 3-Axis Accelerometer Inertial G-Force Vectors |
| **15–16** | `GPS_LAT, LON` | Decimal Degrees | Geodetic WGS-84 Coordinates |
| **17** | `GPS_ALT` | Meters ($\text{m}$) | GPS Geoid Altitude |
| **18** | `GPS_SATS` | Integer | Active tracked satellite constellation count |
| **19** | `STATE` | String | Operational stage (`PRE_LAUNCH`, `BOOST`, `APOGEE`, etc.) |
| **20** | `ERR_CODE` | 4-Digit Binary | Anomaly condition matrix (`D1D2D3D4`) |

---

## 🏗️ System Architecture

```
+---------------------------------------------------------------------------------------+
|                              GROUND CONTROL SOFTWARE (GCS)                            |
|                                                                                       |
|  +---------------------+   +-----------------------+   +---------------------------+  |
|  | Hardware USB Serial |   | Atmospheric Physics   |   | Pre-Recorded Telemetry    |  |
|  | (Web Serial Driver) |   | Mission Flight Sim    |   | CSV File Replay Engine    |  |
|  +----------+----------+   +-----------+-----------+   +-------------+-------------+  |
|             |                          |                             |                |
|             +--------------------------+-----------------------------+                |
|                                        |                                              |
|                                        v                                              |
|               +----------------------------------------+                              |
|               | Telemetry Parser & Stream Decommutator |                              |
|               +-------------------+--------------------+                              |
|                                   |                                                   |
|        +--------------------------+----------------------------+                      |
|        |                          |                            |                      |
|        v                          v                            v                      |
|  +------------+          +-----------------+          +-----------------+             |
|  | Chart.js   |          | Three.js WebGL  |          | Leaflet GIS     |             |
|  | Multi-Graph|          | 3D Attitude     |          | GPS Geodetic    |             |
|  | Subsystem  |          | & ADI Horizon   |          | Trajectory Map  |             |
|  +------------+          +-----------------+          +-----------------+             |
|        ^                          ^                            ^                      |
|        +--------------------------+----------------------------+                      |
|                                   |                                                   |
|        +--------------------------+----------------------------+                      |
|        |                          |                            |                      |
|        v                          v                            v                      |
|  +------------+          +-----------------+          +-----------------+             |
|  | 4-Digit    |          | CAPCOM Vocal    |          | Safety-Armed    |             |
|  | Error HUD  |          | Voice Engine    |          | Telecommand     |             |
|  | Diagnostics|          | (Web Speech)    |          | Uplink Console  |             |
|  +------------+          +-----------------+          +-----------------+             |
+---------------------------------------------------------------------------------------+
```

---

## 🚀 Quick Start

### Option 1: Direct Browser Launch (Recommended)
Simply open `index.html` in Google Chrome, Microsoft Edge, Brave, or Opera:
```bash
# Windows
start index.html

# Linux
xdg-open index.html

# macOS
open index.html
```

### Option 2: Local Node.js Development Server
```bash
# Clone the repository
git clone https://github.com/jash2129/CANSAT-AND-CUBESAT-SATELLITE-MISSIONS.git
cd CANSAT-AND-CUBESAT-SATELLITE-MISSIONS

# Start the static HTTP server
node server.js

# Open in browser
http://localhost:3000
```

---

## ⚡ Keyboard Shortcuts

| Shortcut Key | Mission Function |
|:---:|---|
| <kbd>Space</kbd> | Toggle Real-Time Telemetry Stream (Pause / Resume) |
| <kbd>L</kbd> | Launch Rocket Boost Simulation Profile |
| <kbd>R</kbd> | Reset Mission Simulator to Pre-Launch Standby |
| <kbd>M</kbd> | Mute / Unmute Acoustic Warning Sirens & CAPCOM Voice |
| <kbd>C</kbd> | Re-center GPS GIS Map on Active Payload Marker |
| <kbd>S</kbd> | Capture Optical Payload Still Camera Snapshot |
| <kbd>F</kbd> | Toggle Fullscreen Mission Control Center HUD |
| <kbd>1</kbd>–<kbd>4</kbd> | Switch Dynamic Graph Viewport Tabs |

---

## 🔌 Hardware Integration

### Pinout Wiring Diagram:
```
+-------------------------------------------------------------------+
|  ARDUINO / WEGYANIK KIT MICROCONTROLLER                           |
|                                                                   |
|  [ 3.3V ] ------> BMP280 VCC                                      |
|  [ 5.0V ] ------> MPU6050 VCC, NEO-6M GPS VCC                     |
|  [ GND  ] ------> Common GND Bus (Sensors, Servos, Pyros)         |
|  [ SDA / A4 ] --> BMP280 SDA, MPU6050 SDA (I2C Bus)               |
|  [ SCL / A5 ] --> BMP280 SCL, MPU6050 SCL (I2C Bus)               |
|  [ D4 (RX)  ] --> NEO-6M GPS TX                                   |
|  [ D3 (TX)  ] --> NEO-6M GPS RX                                   |
|  [ A0 (ADC) ] --> Battery Voltage Divider (10kΩ / 10kΩ)           |
|  [ D8 / D9  ] --> Separation Pyro Actuator / Emergency Servo      |
|  [ D10      ] --> Piezo Acoustic Locator Beacon                   |
+-------------------------------------------------------------------+
```

Embedded C++ Arduino firmware source code is located in [`arduino/cansat_telemetry_firmware/cansat_telemetry_firmware.ino`](arduino/cansat_telemetry_firmware/cansat_telemetry_firmware.ino).

---

## 📂 Repository Structure

```
├── COLLEGE_PROJECT_REPORT.md             # Complete 6-Chapter Academic College Report
├── PROJECT_REPORT.md                     # India Space Lab (ISL) Mission Systems Document
├── USER_MANUAL.md                        # Mission Control Operator Handbook
├── README.md                             # Project Documentation & Architecture
├── index.html                            # Aerospace Single-Page Application Dashboard
├── server.js                             # Lightweight Local HTTP Web Server
├── sample_telemetry_flight_log.csv       # 20-Field Verification Flight Data Log
│
├── css/
│   └── styles.css                        # Aerospace Dark HUD Theme & Glassmorphism
│
├── js/
│   ├── app.js                            # Mission Control Core & Telemetry Bus
│   ├── serial.js                         # Web Serial API (USB-UART 115200 Baud)
│   ├── telemetry.js                      # ASCII Parsing & 4-Digit Matrix Diagnostics
│   ├── orientation.js                    # Three.js 3D WebGL Models & ADI Artificial Horizon
│   ├── charts.js                         # Chart.js v4 Real-Time Telemetry Graph Suite
│   ├── map.js                            # Leaflet Cartographic GPS Trajectory GIS Tracker
│   ├── simulator.js                      # 7-Stage Aerodynamic Physics Simulator
│   ├── controls.js                       # Safety-Armed Telecommands & Web Audio/Voice
│   └── camera.js                         # Optical Payload Camera Stream Subsystem
│
└── arduino/
    └── cansat_telemetry_firmware/
        └── cansat_telemetry_firmware.ino # C++ Microcontroller Flight Firmware
```

---

## 👤 Author & Academic Credits

- **Author**: **THARUN VEMPATI**
- **College Roll No**: `25011D0517`
- **ISL Enrollment No**: `ISL-827649` (Batch II)
- **Institution**: University College of Engineering, Science & Technology Hyderabad - JNTUH
- **Collaboration**: India Space Lab (ISL) National Student Satellite Training Program
- **Academic Year**: 2025–2026

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
All space mission telemetry structures adhere to India Space Lab (ISL) educational standards.
