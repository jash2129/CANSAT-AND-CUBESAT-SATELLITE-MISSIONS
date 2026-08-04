# INDIA SPACE LAB
## CanSat & CubeSat Ground Control Software (GCS)
### Operator & User Manual

---

## 1. Quick Start Guide

### How to Run the Ground Station
1. Open the project folder `cansat_and_cubesat_project/`.
2. Double-click `index.html` to open directly in any modern web browser (Google Chrome, Microsoft Edge, Brave, or Opera recommended for full **Web Serial API** support).
3. No build tools or backend server installation are required—the application is fully self-contained!

---

## 2. Operating Modes & Data Sources

Located in the top header control bar:

```
[🛰️ Mission Flight Simulator  ▼]  [LAUNCH]  [RESET]  [STOP STREAM]
```

### Mode 1: Mission Flight Simulator (Default)
- **Automatic Flight Run**: Upon loading, the simulator runs in standby pre-launch mode.
- **Ignite Launch**: Click the green **`LAUNCH`** button to ignite the rocket boost.
- **Flight Phases**: Watch the CanSat transition through:
  1. `BOOST` (Ascent to 1000m apogee)
  2. `APOGEE` (Peak altitude reached)
  3. `SEPARATION` (Payload released from container)
  4. `DROGUE_DESCENT` (High-speed descent ~18 m/s)
  5. `MAIN_CHUTE` (Controlled recovery descent 8–10 m/s)
  6. `LANDED` (Ground touchdown & recovery beacon)
- **Reset Profile**: Click **`RESET`** to re-arm the simulator back to pre-launch state.

## 3. Quick Operation & Keyboard Shortcuts

| Shortcut Key | Action Performed |
|:---:|---|
| <kbd>Space</kbd> | Toggle Real-Time Telemetry Stream (Pause / Resume) |
| <kbd>L</kbd> | Launch Rocket Boost Simulation |
| <kbd>R</kbd> | Reset Mission Simulator to Pre-Launch State |
| <kbd>M</kbd> | Mute / Unmute Master Audio Alerts & Voice Callouts |
| <kbd>C</kbd> | Center GPS Recovery Map on Payload Position |
| <kbd>S</kbd> | Take Optical Camera Snapshot Still Image |
| <kbd>F</kbd> | Toggle Fullscreen Mission HUD |
| <kbd>1</kbd>–<kbd>4</kbd> | Switch Dynamic Graph Viewports (Alt, Pressure, Power, IMU) |

---

## 4. Key Subsystems & Features

### Mode 2: Web Serial (Hardware Connection)
1. Plug the **WeGyanik Kit Microcontroller** or **Arduino** board into your PC via USB.
2. Select **`🔌 Web Serial (USB/COM)`** in the Data Source dropdown.
3. Select your baud rate (`115200` default).
4. Click **`CONNECT`**. A browser pop-up will allow you to select your USB Serial COM port.
5. Once connected, real sensor packets will stream live into the dashboard!

### Mode 3: Replay Telemetry Log
1. Select **`📁 Replay Telemetry Log`** in the Data Source dropdown.
2. Select the provided `sample_telemetry_flight_log.csv` or any previously recorded CSV file.
3. The software will replay the flight packets at 1 Hz for post-mission debriefing.

---

## 3. Operator Interface Overview

### 3.1 Left Column: System Health & Telemetry
- **4-Digit Error System**:
  - Displays instantaneous status (e.g. `0000 NORMAL` vs `1000 DESCENT FAULT`).
  - **Digit 1**: Descent Rate (0 = Safe 8–10 m/s, 1 = Out of bounds)
  - **Digit 2**: GPS Availability (0 = Valid lock, 1 = Lost fix)
  - **Digit 3**: Payload Separation (0 = Normal, 1 = Mechanism failure)
  - **Digit 4**: Emergency Parachute (0 = Standby, 1 = Active)
  - **Fault Injection Strip**: Click the interactive test chips (`DESCENT`, `GPS LOSS`, `SEP FAIL`, `CHUTE ACT`) to test the alarm and visual alerts during live demos.
- **Container Telemetry**: Real-time Packet Count, Relative Altitude (m), Barometric Pressure (hPa), External Temperature (°C), Descent Rate (m/s), and Container Flight Phase.
- **Payload Telemetry**: 2S LiPo Battery Voltage (V), Internal Avionics Temp (°C), Roll/Pitch/Yaw angles (°), 3-Axis Accelerometer (G), GPS Satellite Count, and Signal Link RSSI (dBm).
- **Raw Telemetry Stream**: Monospace terminal showing live incoming CSV frames with **`PAUSE`** and **`CLEAR`** controls.

### 3.2 Center Column: Real-Time Graphs & Map
- **Dynamic Graphs**:
  - Click the tabs: **`ALT & DESCENT`**, **`PRESSURE & TEMP`**, **`POWER & LINK`**, or **`IMU DYNAMICS`** to toggle charts.
  - Export any active graph as a high-resolution PNG image using the top bar **Export Graph** button.
- **GPS Recovery Map**:
  - Displays real-time geodetic position on dark satellite/carto map tiles.
  - Shows flight trajectory breadcrumbs and line-of-sight vector from the **India Space Lab Ground Station**.
  - Dynamic calculations for **Range Distance** and **Azimuth Heading**.
  - Use **`CENTER`** to pan to the CanSat or **`CLEAR TRAIL`** to reset breadcrumbs.

### 3.3 Right Column: 3D Attitude, Video Feed & Commands
- **3D Orientation Model**:
  - Interactive WebGL visualizer rendering the CanSat cylinder, solar arrays, and antennas.
  - Rotates in real time following Roll, Pitch, and Yaw telemetry data.
  - **Attitude Director Indicator (ADI)**: Artificial horizon HUD showing pitch ladder and bank angle.
- **Optical Video Camera & Flight HUD**:
  - Displays real-time webcam feed or realistic simulated earth horizon atmosphere feed.
  - Aerospace HUD overlay with crosshair reticles, flight speed, altitude, and timestamp.
  - Click **`📸`** to capture high-resolution optical snapshots with telemetry watermark.
- **Mission Critical Commands**:
  - **`MANUAL SEPARATION`**: Triggers container release. Prompts safety confirmation modal with operator arm interlock.
  - **`EMG PARACHUTE DEPLOY`**: Deploys emergency parachute backup. Prompts safety confirmation modal.
  - **`REDUNDANT ACTIVATION`**: Switches to secondary flight avionics.
  - **`RECOVERY BEACON`**: Toggles acoustic buzzer transponder for ground search.
  - **`TARE / CALIBRATE SENSORS`**: Calibrates ground level zero reference.

---

## 4. Data Export & Post-Mission Analysis

- **Export CSV**: Click the download icon in the top right control bar. A formatted CSV file containing all recorded telemetry history (including timestamps, pressures, voltages, accelerations, and error codes) will be saved to your PC.
- **Export Graph**: Click the graph icon to export the current high-resolution Chart.js canvas as a PNG image.
- **Audio Alarm Mute**: Click the speaker icon to toggle audible telemetry beeps and alarm sirens on/off.
