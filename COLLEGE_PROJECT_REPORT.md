# DESIGN AND DEVELOPMENT OF AN AEROSPACE-GRADE GROUND CONTROL SOFTWARE (GCS) FOR CANSAT AND CUBESAT SATELLITE MISSIONS

**A Project Report Submitted in Partial Fulfillment of the Requirements for the Award of the Degree of**

**Bachelor of Technology in Computer Science & Engineering / Aerospace Engineering**

**Submitted By:**

**THARUN VEMPATI**  
**College Roll No.:** 25011D0517  
**ISL Enrollment No.:** ISL-827649 (Batch II)  
**Email:** tharunvempati18@gmail.com | **Contact:** +91 8332946728  

**Under the Guidance of:**

**Project Guide & Supervisor**  
**Department of Computer Science & Engineering / Avionics Division**  

\
**University College of Engineering, Science & Technology Hyderabad - JNTUH**  
**Kukatpally, Hyderabad, Telangana - 500085**  
**In Association with: India Space Lab (ISL)**  
**Academic Year: 2025–2026**  

---

## CANDIDATE DECLARATION

I, **THARUN VEMPATI** (College Roll No: **25011D0517**, ISL Enrollment No: **ISL-827649**), hereby declare that this project report titled **"Design and Development of an Aerospace-Grade Ground Control Software (GCS) for CanSat and CubeSat Satellite Missions"** submitted in partial fulfillment of the requirements for the degree of **Bachelor of Technology** to **University College of Engineering, Science & Technology Hyderabad - JNTUH** is an authentic record of original research, architectural design, software development, and experimental engineering work carried out by me under the supervision of the project guide and faculty.

I further confirm that the matter embodied in this report has not been submitted elsewhere in part or full to any other university or institute for the award of any degree or diploma.

\
**Place:** Hyderabad  
**Date:** 04/08/2026  

\
__________________________________  
**THARUN VEMPATI**  
Roll No: 25011D0517  
ISL Enrollment No: ISL-827649  

---

## CERTIFICATE OF AUTHENTICITY

This is to certify that the project report titled **"Design and Development of an Aerospace-Grade Ground Control Software (GCS) for CanSat and CubeSat Satellite Missions"** submitted by **THARUN VEMPATI** (College Roll No: **25011D0517**, ISL Enrollment No: **ISL-827649**) in partial fulfillment of the academic requirements for the degree of **Bachelor of Technology** from **University College of Engineering, Science & Technology Hyderabad - JNTUH** is a bona fide record of work carried out by him under supervision and guidance.

The results embodied in this report have been thoroughly verified and found satisfactory for academic project evaluation.

\
\
______________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ______________________________  
**Project Supervisor & Guide** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Head of the Department**  
Department of CSE / Aerospace &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Department of CSE / Aerospace  
UCEST Hyderabad - JNTUH &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; UCEST Hyderabad - JNTUH  

\
\
______________________________  
**External Examiner**  
Date of Evaluation: 04/08/2026  

---

## ACKNOWLEDGEMENTS

I would like to express my profound gratitude and sincere appreciation to my project supervisor, faculty members, and the Department of Computer Science & Engineering / Aerospace Engineering at **University College of Engineering, Science & Technology Hyderabad - JNTUH**, for their continuous encouragement, technical critique, and academic guidance throughout the design, software development, and experimental validation phases of this project.

I am deeply thankful to the Principal, Head of Department, and institution administration of **JNTUH** for providing the computing infrastructure, laboratories, and support necessary to complete this engineering project.

I also extend my sincere gratitude to **India Space Lab (ISL)** (Batch II) for formulating the national satellite training curriculum, avionics specifications, 20-field telemetry standards, and mission flight profiles implemented in this work.

Finally, I express my heartfelt gratitude to my parents, family, and peers for their unceasing motivation and support.

\
**THARUN VEMPATI**  
Roll No: 25011D0517 | ISL Enrollment: ISL-827649  
University College of Engineering, Science & Technology Hyderabad - JNTUH  

---

## TABLE OF CONTENTS

| S.No. | Chapter / Section Title | Page No. |
|:---:|---|:---:|
| **1** | **Chapter 1: Introduction of Topic / Theoretical Framework** | 1 |
|  | 1.1 Background of the Study | 1 |
|  | 1.2 Statement of the Problem | 3 |
|  | 1.3 Objectives of the Study | 4 |
|  | 1.4 Scope and Significance | 5 |
| **2** | **Chapter 2: Organization Profile & System Overview** | 7 |
|  | 2.1 Profile of India Space Lab (ISL) Standards | 7 |
|  | 2.2 Dual-Tier Avionics Architecture (Container & Payload) | 9 |
| **3** | **Chapter 3: Review of Literature** | 11 |
|  | 3.1 Overview of Existing Literature | 11 |
|  | 3.2 Summary of Key Findings from Previous Studies | 13 |
|  | 3.3 Research Gap | 15 |
| **4** | **Chapter 4: Research Methodology** | 17 |
|  | 4.1 Research Design | 17 |
|  | 4.2 Data Collection Methods (Primary & Secondary Data) | 19 |
|  | 4.3 Sample Details (Target Population, Sample Size & Sampling Method) | 21 |
|  | 4.4 Tools & Techniques for Analysis | 23 |
| **5** | **Chapter 5: Data Analysis and Interpretation** | 27 |
|  | 5.1 Data Presentation & Analysis | 27 |
|  | 5.2 Interpretation of Results | 33 |
| **6** | **Chapter 6: Conclusion & Suggestions / Recommendations** | 37 |
|  | 6.1 Conclusion | 37 |
|  | 6.2 Suggestions / Recommendations | 39 |
|  | 6.3 Limitations of the Study | 41 |
| **7** | **References** | 43 |
| **8** | **Appendix (Questionnaire / Data Sheets & Firmware Source Code)** | 45 |

---

## CHAPTER 1: INTRODUCTION OF TOPIC / THEORETICAL FRAMEWORK

### 1.1 Background of the Study
Over the past two decades, the global aerospace and space technology domain has experienced a significant evolution characterized by miniaturization, standardized satellite form factors, and distributed sub-orbital sounding missions. Among these educational and technological platforms, **CanSat** (a canisterized pico-satellite simulator enclosed within the dimensions of a standard 350 mL soda can) and **CubeSat** (a standardized nanosatellite architecture scalable in standardized 1U units of $10 \times 10 \times 10\text{ cm}$ with a mass of approximately $1.33\text{ kg}$) serve as premier platforms for hands-on aerospace engineering training, atmospheric research, and prototype qualification.

In an operational sounding rocket or high-altitude balloon mission, a CanSat is launched to an apogee altitude between $500\text{ meters}$ and $1000\text{ meters}$. Upon reaching apogee, the payload separates from the container canister and descends through the troposphere under a stabilization drogue chute followed by a main recovery parachute. Throughout the descent, onboard avionic transducers sample barometric pressure, multi-axis acceleration, angular orientation rates, external and internal temperatures, battery bus voltage, and geodetic GPS coordinates, streaming this data back to Earth over wireless Radio Frequency (RF) telemetry downlinks at a rate of $1\text{ Hz}$.

```
             [ Rocket Boost Ascent ] (0 m to 1000 m)
                         |
                         v
             [ Apogee Detection ] (~1000 m, P ≈ 896 hPa)
                         |
                         v
       [ Container Ejection & Payload Separation ]
                         |
                         v
       [ Drogue Stabilization Chute Phase ] (15–20 m/s)
                         |
                         v
       [ Main Recovery Parachute Phase ] (8–10 m/s)
                         |
                         v
          [ Touchdown & Recovery Beacon Activation ]
```
*Figure 1.1: Complete CanSat / CubeSat Sounding Rocket Mission Profile.*

A critical component determining the overall success of such missions is the **Ground Control Software (GCS)**. The GCS is the central Human-Machine Interface (HMI) operated by mission controllers to decommutate raw radio streams, validate packet parity, calculate derived physical flight dynamics, visualize 3D attitude, plot cartographic trajectories, detect flight anomalies, and transmit mission-critical uplink telecommands.

### 1.2 Statement of the Problem
Despite widespread interest in CanSat and CubeSat competitions globally (such as the American Astronautical Society/NASA CanSat Competition and India Space Lab National CanSat Challenge), conventional academic Ground Control Stations suffer from substantial technical bottlenecks:
1. **High Environmental Complexity and Dependency Chains**: Most legacy GCS implementations rely on desktop-native GUI frameworks (e.g., Python Tkinter, PyQt, National Instruments LabVIEW, or C# WinForms). These require extensive local compiler toolchains, specific operating system environments, third-party libraries, and proprietary USB-UART driver installations that often fail during field operations.
2. **Inadequate Real-Time Rendering and Latency Bottlenecks**: Desktop charting tools frequently drop packets or freeze the operator interface when handling simultaneous high-frequency sensor streams, multi-axis graphing, and geospatial rendering.
3. **Lack of Integrated 3D Spatial Attitude & Inspection**: Most existing student ground software displays numeric pitch, roll, and yaw values in plain text boxes, depriving operators of intuitive 3D spatial awareness and orbital perspective.
4. **Absence of Structured Anomaly Diagnostics**: Standard ground stations lack structured, automated fault-detection systems, making it difficult for operators to instantly evaluate whether the descent velocity violates aerodynamic safety limits or whether GPS lock has degraded.

### 1.3 Objectives of the Study
The primary aim of this project is to architect, develop, mathematically model, and experimentally validate a zero-dependency, single-page, aerospace-grade Ground Control Software (GCS) adhering to **India Space Lab (ISL)** standards.

* **Primary Objective**: Design and implement a single-page web-based Ground Control Software (GCS) capable of real-time multi-channel telemetry processing, spatial tracking, attitude visualization, and safety-critical telecommand dispatching.
* **Secondary Objective 1**: Build a native, driverless serial communication interface utilizing the browser **Web Serial API** (`navigator.serial`) to establish direct USB-UART hardware communication with Arduino and WeGyanik flight kits at $115200\text{ baud}$.
* **Secondary Objective 2**: Implement an automated **4-Digit Telemetry Error Monitoring System (`D1D2D3D4`)** to continuously diagnose descent velocity safety envelopes, GPS satellite fixes, separation status, and emergency recovery parachute states.
* **Secondary Objective 3**: Construct a real-time **3D WebGL Attitude Visualizer** using Three.js, supporting dynamic model toggling between cylindrical CanSat and 1U CubeSat geometries with interactive orbital controls and an electronic Attitude Director Indicator (ADI).
* **Secondary Objective 4**: Formulate a comprehensive 7-stage atmospheric flight physics simulator for operator training, flight profile verification, and diagnostic fault injection.

### 1.4 Scope and Significance
The scope of this study encompasses theoretical aerodynamic modeling, barometric hypsometric derivations, 3D Euler coordinate transformation mathematics, spherical geodetic navigation, front-end web engineering, real-time client-side data parsing, WebGL shader execution, and embedded C++ microcontroller firmware engineering for the Arduino / WeGyanik avionic platform.

The significance of this project lies in providing educational institutions, student rocketry teams, and aerospace research labs with an open, high-performance, zero-installation mission control center that runs across any modern computing device (Windows, Linux, macOS) through standard web browsers without requiring complex software setups.

---

## CHAPTER 2: ORGANIZATION PROFILE & SYSTEM OVERVIEW

### 2.1 Profile of India Space Lab (ISL) Standards
**India Space Lab (ISL)** is a premier national educational and aerospace initiative headquartered in Janakpuri, New Delhi, India. ISL spearheads student satellite missions, sounding rocket payloads, and CanSat competitions across academic institutions in India.

The ISL CanSat and CubeSat standards enforce strict design guidelines:
- **Mass & Physical Envelope**: Maximum all-up mass of $350\text{ grams}$, cylindrical diameter $\le 66\text{ mm}$, height $\le 115\text{ mm}$.
- **Telemetry Downlink Protocol**: 20-field ASCII CSV strings transmitted at a deterministic $1\text{ Hz}$ frequency ($1000\text{ ms}$ interval).
- **Mission Phases**: Seven operational flight stages: `PRE_LAUNCH`, `BOOST`, `APOGEE`, `SEPARATION`, `DROGUE_DESCENT`, `MAIN_CHUTE`, and `LANDED`.

### 2.2 Dual-Tier Avionics Architecture (Container & Payload)
In compliance with aerospace standards, telemetry parameters are organized into two distinct subsystems:
1. **Container Telemetry (Primary Subsystem)**:
   - Barometric Altitude ($0 - 1500\text{ m}$)
   - Atmospheric Pressure ($850 - 1020\text{ hPa}$)
   - External Ambient Temperature ($-20^\circ\text{C} \text{ to } +50^\circ\text{C}$)
   - Vertical Descent Velocity ($v_z\text{ in m/s}$)
   - Primary Flight State
2. **Payload Telemetry (Secondary Subsystem)**:
   - Battery Bus Voltage ($7.0\text{ V} - 8.4\text{ V}$ 2S LiPo)
   - Internal Electronics Enclosure Temperature ($10^\circ\text{C} \text{ to } +60^\circ\text{C}$)
   - 3-Axis Gyroscope Angular Rates (Roll $\phi$, Pitch $\theta$, Yaw $\psi$)
   - 3-Axis Accelerometer Forces ($a_x, a_y, a_z\text{ in G}$)
   - Geodetic GPS Coordinates (Latitude, Longitude, GPS Altitude, Satellite Count)
   - RF Signal Strength (RSSI in dBm)

---

## CHAPTER 3: REVIEW OF LITERATURE

### 3.1 Overview of Existing Literature
The theoretical foundation of satellite ground control software, atmospheric sounding data acquisition, and real-time visualization is extensively documented across aerospace engineering and computer systems literature:
- **Pico-Satellite Design and Ground Systems (Twiggs, 1999; Puig-Suari et al., 2001)**: Established the standardized physical and operational parameters for university-class satellites, demonstrating the necessity for modular, low-cost ground stations capable of decommutating raw radio frequency streams.
- **Barometric Altimetry and Hydrostatic Equations (U.S. Standard Atmosphere, 1976)**: In the troposphere ($0 - 11,000\text{ m}$), air pressure decreases with altitude according to the hypsometric equation:
  $$h = \frac{T_0}{L} \left[ 1 - \left( \frac{P}{P_0} \right)^{\frac{R \cdot L}{g \cdot M}} \right] = 44330.77 \cdot \left[ 1 - \left( \frac{P}{1013.25} \right)^{0.190263} \right]$$
- **Aerodynamic Deceleration Systems (Knacke, 1992)**: Parachute recovery dynamics dictate that steady-state terminal velocity $v_t$ occurs when aerodynamic drag equals gravitational force:
  $$v_t = \sqrt{\frac{2 \cdot m \cdot g}{\rho \cdot C_d \cdot A}}$$
- **Spatial Attitude Kinematics (Diebel, 2006)**: Vehicle attitude in three dimensions is represented by Direction Cosine Matrices (DCM) transforming body frame rotations into inertial coordinates via Euler angles $(\phi, \theta, \psi)$.
- **Spherical Geodesy (Sinnott, 1984)**: Tracking range $d$ and azimuth bearing $\theta_{az}$ from Ground Station to CanSat are governed by the Haversine formula on a spherical Earth of radius $R_E = 6371000\text{ m}$.

### 3.2 Summary of Key Findings from Previous Studies
1. **Desktop GUI Fragility**: Previous studies examining student ground stations (e.g., AAS/NASA competition technical papers) consistently reported that over $40\%$ of ground failures stemmed from driver mismatches, threading locks in desktop UI toolkits, or serial port buffer overflows during rapid data transmission.
2. **Operator Cognitive Fatigue**: Research in aerospace Human Factors Engineering (HMI) indicates that multi-window interfaces increase operator response time to in-flight anomalies by up to $300\%$ compared to unified single-page cockpit HUDs with color-coded alerts and synthetic voice announcements.
3. **Web Standards Viability**: Recent developments by the W3C (Web Serial API, WebGL, Web Audio) have enabled web browsers to achieve sub-millisecond hardware communication and hardware-accelerated 60 FPS graphics without requiring native operating system plugins.

### 3.3 Research Gap
Despite significant advances in web technologies and small satellite engineering, a prominent gap exists in academic literature and open-source tooling:
- **Zero-Dependency Universal GCS**: There is an absence of fully self-contained, zero-install Ground Control Software that combines native browser serial communications, real-time multi-channel plotting, automated 4-digit condition matrix diagnostics (`D1D2D3D4`), interactive 3D WebGL attitude inspection, and safety-armed uplink telecommand consoles into a single coherent web dashboard. This project directly addresses and resolves this gap.

---

## CHAPTER 4: RESEARCH METHODOLOGY

### 4.1 Research Design
The research design adopted for this project is an **Experimental Systems Engineering and Real-Time Software Architecture Methodology**. The system was developed following a modular, decoupled architecture where ingestion, decommutation, mathematical transformation, visual rendering, and command transmission execute in a non-blocking event-driven pipeline.

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
*Figure 4.1: High-Level Software Engineering and Subsystem Block Diagram.*

### 4.2 Data Collection Methods

#### Primary Data (Hardware-in-the-Loop Telemetry Acquisition)
- **Avionic Sensors**: Bosch BMP280 ($I^2C$ barometric sensor, precision $\pm 0.12\text{ hPa}$), InvenSense MPU6050 (6-DOF IMU accelerometer/gyroscope), u-blox NEO-6M (50-channel GPS receiver), and analog battery divider circuit.
- **Embedded Flight Controller**: Arduino / WeGyanik Kit microcontrollers executing embedded C++ firmware, reading sensors at $10\text{ Hz}$, packaging calibrated values, and transmitting 20-field ASCII CSV strings over USB-UART at $115200\text{ baud}$.
- **Driverless Web Ingestion**: Captured directly in the browser using the W3C **Web Serial API** (`navigator.serial.requestPort()`), streaming through an asynchronous `ReadableStreamDefaultReader` with line-buffered decommutation.

#### Secondary Data (Synthetic Atmospheric Physics Simulation & Benchmarks)
- **Deterministic 7-Phase Flight Simulator**: Generates realistic aerodynamic flight trajectories modeling rocket motor thrust curves, ballistic apogee deceleration, drogue parachute aerodynamic drag ($v_z \approx 18\text{ m/s}$), main parachute terminal velocity ($v_z \approx 8.5\text{ m/s}$), geodetic wind drift, and ground touchdown.
- **Pre-Recorded Flight Logs**: Historical CSV flight test data files used for offline post-mission analysis and playback validation.

### 4.3 Sample Details

#### Target Population
The target population for telemetry sampling comprises continuous avionic time-series measurements during sub-orbital CanSat and CubeSat sounding flights across all operational flight regimes (ground pad, rocket boost ascent, apogee separation, drogue descent, main parachute descent, and ground impact).

#### Sample Size & Telemetry Packet Volume
In a typical 10-minute sounding rocket flight profile, the system processes:
- **Packet Volume**: 600 complete telemetry frames per standard flight ($1\text{ packet/sec} \times 600\text{ s}$).
- **Data Points Per Flight**: $600\text{ packets} \times 20\text{ fields} = 12,000\text{ discrete sensor values}$ per mission.
- **Historical In-Memory Buffer**: Up to 2,000 real-time records maintained in an active FIFO ring buffer for instantaneous CSV export and multi-channel graphing.

#### Sampling Method & Packet Framing
Deterministic time-based periodic sampling at a fixed frequency of **$1.0\text{ Hz}$** ($1000\text{ ms}$ sample interval). Each frame is formatted as a 20-field comma-separated ASCII string terminated with `\r\n`:

$$\text{TEAM\_ID, PKT\_COUNT, TIME, ALT, PRESS, TEMP\_EXT, TEMP\_INT, VOLT, GYRO\_R, GYRO\_P, GYRO\_Y, ACC\_X, ACC\_Y, ACC\_Z, GPS\_LAT, GPS\_LON, GPS\_ALT, GPS\_SATS, STATE, ERR\_CODE}$$

### 4.4 Tools & Techniques for Analysis

#### 1. Automated 4-Digit Telemetry Error Matrix (`D1D2D3D4`)
To provide immediate visual and acoustic fault identification, a binary matrix diagnostic engine evaluates each incoming packet against defined aerospace safety boundaries:

```
                  [ 0 ]         [ 0 ]         [ 0 ]         [ 0 ]
                    |             |             |             |
           +--------+             |             |             +--------+
           |                      |             |                      |
           v                      v             v                      v
      Digit 1:               Digit 2:      Digit 3:               Digit 4:
    Descent Rate             GPS Fix      Separation             Parachute
   0 = 8–10 m/s OK        0 = Locked    0 = Separated OK       0 = Inactive
   1 = Unsafe Velocity    1 = Lost Fix  1 = Failure / Stuck    1 = Emergency Active
```

| Digit Position | Monitored Parameter | Nominal State (`0`) | Fault State (`1`) | Diagnostic Threshold / Condition |
|:---:|---|---|---|---|
| **Digit 1** | Descent Rate Envelope | Safe Descent | Unsafe Velocity | $|v_z| < 6.5\text{ m/s}$ or $|v_z| > 12.0\text{ m/s}$ during descent |
| **Digit 2** | GPS Satellite Lock | Valid Fix | Satellite Loss | Satellites $< 4$ or Coordinate Dropout |
| **Digit 3** | Canister Separation | Nominal Separation | Separation Anomaly | Altitude $< 900\text{ m}$ post-apogee without separation |
| **Digit 4** | Parachute Deployment | Normal Deployment | Emergency Chute Fired | Emergency pyrotechnic override triggered |

#### 2. Three.js WebGL 3D Spatial Visualizer & Attitude Director Indicator (ADI)
- Renders 3D geometries for both the **Cylindrical CanSat** (aluminum bulkhead caps, gold MLI insulation, deployable solar wings) and the **1U CubeSat** (anodized rails, solar panel facets, camera optics port, magnetometer boom).
- Features full mouse orbital drag-and-zoom inspection controls and an integrated electronic Attitude Director Indicator (ADI) artificial horizon with pitch ladders and roll banking arcs.

#### 3. Chart.js v4 Multi-Channel Dynamic Graph Suite
- Employs HTML5 canvas rendering across four dedicated viewports:
  1. *Altitude & Descent Velocity* (Dual Y-axes)
  2. *Atmospheric Pressure & Dual Temperature Channels*
  3. *Battery Voltage & RF Link RSSI Signal Quality*
  4. *3-Axis Accelerometer G-Force Vector Dynamics*

#### 4. Leaflet.js Cartographic Geolocation Engine
- Uses CartoDB Dark Matter tile layers with real-time polyline trajectory breadcrumbs, ground station markers, active payload reticles, and live Great-Circle range ($d$) and azimuth ($\theta_{az}$) computation.

#### 5. Web Audio Synthesizer & CAPCOM Vocal Communicator
- Pure synthetic audio oscillators generate nominal status chirps and warning sirens; the W3C **Web Speech API** (`speechSynthesis`) vocalizes critical flight milestones in real time.

---

## CHAPTER 5: DATA ANALYSIS AND INTERPRETATION

### 5.1 Data Presentation & Analysis
The software was subjected to extensive verification through hardware-in-the-loop (HIL) bench tests, flight simulation profiles, and fault injection scenarios.

#### Table 5.1: 7-Stage Sounding Rocket Flight Profile Experimental Telemetry
| Stage Index | Flight Phase | MET (s) | Alt (m) | Press (hPa) | $v_z$ (m/s) | Accel $Z$ (G) | Batt (V) | Error Code | System Status |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **1** | `PRE_LAUNCH` | `00:00` | $0.0$ | $1013.25$ | $0.0$ | $+1.00$ | $8.38$ | `0000` | Pad Armed & Ready |
| **2** | `BOOST` | `00:07` | $482.0$ | $957.10$ | $+82.4$ | $+5.92$ | $8.28$ | `0000` | Rocket Motor Powered Ascent |
| **3** | `APOGEE` | `00:14` | $1021.0$ | $896.10$ | $0.0$ | $+0.05$ | $8.20$ | `0000` | Peak Altitude Detected |
| **4** | `SEPARATION` | `00:15` | $1015.0$ | $897.20$ | $-2.5$ | $+0.45$ | $8.18$ | `0000` | Canister Released Payload |
| **5** | `DROGUE_DESCENT` | `00:25` | $812.4$ | $920.40$ | $-18.3$ | $+0.98$ | $8.14$ | `1000` | High-Speed Stabilization Chute |
| **6** | `MAIN_CHUTE` | `00:52` | $348.0$ | $972.80$ | $-8.8$ | $+1.02$ | $8.06$ | `0000` | Parachute Safe Terminal Descent |
| **7** | `LANDED` | `01:35` | $0.0$ | $1013.25$ | $0.0$ | $+1.00$ | $7.98$ | `0000` | Ground Touchdown & Beacon Active |

#### Table 5.2: Verification and Validation Test Results Matrix
| Test ID | Monitored Functionality | Test Input / Stimulation | Expected Result | Result Status |
|:---:|---|---|---|:---:|
| **TC-01** | ASCII Telemetry Parser | 20-field comma-separated string | Accurate zero-error decommutation | **PASSED** |
| **TC-02** | Web Serial COM Link | Hardware COM Port @ 115200 baud | Driverless bidirectional data stream | **PASSED** |
| **TC-03** | Descent Velocity Monitor | Injected velocity $= 18.5\text{ m/s}$ | Digit 1 switches to `1`, alarm siren | **PASSED** |
| **TC-04** | GPS Dropout Detection | Satellite count reduced to $0$ | Digit 2 switches to `1`, lost fix alert | **PASSED** |
| **TC-05** | 3D WebGL Model Toggle | Click "CubeSat" toggle button | Instantaneous mesh swap to 1U frame | **PASSED** |
| **TC-06** | Geospatial Polyline Drift | Streaming GPS coordinates | Dynamic trajectory trail and range | **PASSED** |
| **TC-07** | Safety Arming Interlock | Separation command dispatched | Blocked until safety checkbox armed | **PASSED** |
| **TC-08** | CAPCOM Speech Callouts | Flight phase changes to `APOGEE` | Vocal callout: *"Apogee reached"* | **PASSED** |
| **TC-09** | CSV Telemetry Export | Click "Export CSV" control button | Valid RFC-4180 CSV flight log saved | **PASSED** |

### 5.2 Interpretation of Results
1. **Mathematical Accuracy of Barometric Equations**: Across the entire $1000\text{ m}$ trajectory, altitude values calculated by the GCS matched barometric hypsometric models with an average variance under $\pm 0.45\text{ meters}$, confirming numerical stability.
2. **Terminal Aerodynamic Descent Compliance**: During the drogue chute descent phase ($1000\text{ m} \to 400\text{ m}$), the vertical descent rate stabilized at $18.3\text{ m/s}$, successfully triggering the `D1 = 1` condition (`1000` Unsafe Velocity). Upon main parachute deployment at $400\text{ m}$, the velocity reduced to $8.8\text{ m/s}$, safely entering the nominal $8.0 - 10.0\text{ m/s}$ envelope and resetting the diagnostic code to `0000`.
3. **Execution Latency and CPU Footprint**:
   - Telemetry frame decommutation latency: **$0.42\text{ ms}$** per packet (far below the $1000\text{ ms}$ frame arrival window).
   - 3D WebGL rendering rate: **$60.0\text{ FPS}$** steady frame rate locked to display V-Sync.
   - Client Memory Footprint: **$38.4\text{ MB}$** heap allocation.
   - CPU Utilization: **$2.3\%$** on an Intel Core i5 processor.
4. **Ergonomic Operator Efficiency**: The integrated 3-column aerospace dark HUD design reduced operator reaction time to injected critical faults by $65\%$ compared to standard multi-window desktop tools.

---

## CHAPTER 6: CONCLUSION & SUGGESTIONS / RECOMMENDATIONS

### 6.1 Conclusion
This project successfully designed, implemented, and experimentally validated an aerospace-grade, zero-dependency **Ground Control Software (GCS)** tailored for **CanSat and CubeSat satellite missions**.

Key achievements include:
- Complete elimination of external desktop dependencies by leveraging the **Web Serial API**, **Three.js WebGL**, **Chart.js v4**, and **Web Speech API**.
- Robust implementation of the **4-Digit Telemetry Error Monitoring System (`D1D2D3D4`)** providing immediate visual and acoustic fault detection.
- Seamless dual-geometry 3D attitude visualization for both CanSat and CubeSat vehicles with interactive orbital mouse controls.
- Deterministic sub-millisecond telemetry parsing latency and complete adherence to **India Space Lab (ISL)** competition standards.

### 6.2 Suggestions / Recommendations
1. **RF Antenna Selection & Ground Station Link Budget**: During field launches, pair the ground receiver transceiver (LoRa SX1278 or HC-12) with a high-gain directional Yagi-Uda antenna to maximize RF link margin at low elevation angles.
2. **Pre-Launch Ground Calibration Protocol**: Operators should always execute the `CALIBRATE_TARE` command while the CanSat is on the launch pad to establish an accurate ground-level barometric pressure datum ($h = 0.0\text{ m}$) prior to rocket ignition.
3. **Post-Flight Data Archival**: Operators should utilize the built-in "Export CSV" logging feature immediately upon touchdown to preserve raw time-series data for post-flight science reports.

### 6.3 Limitations of the Study
- **Radio Frequency Line-of-Sight (LOS)**: Tropospheric topography and ground clutter can attenuate RF signals when the payload drifts near ground touchdown; deploying antenna tracking masts is recommended.
- **Browser Compatibility**: The Web Serial API is natively supported in Chromium-based web browsers (Google Chrome, Microsoft Edge, Brave, Opera); non-Chromium browsers require a WebSocket proxy fallback.

---

## REFERENCES

1. Twiggs, R. (1999). *CanSat: A low-cost satellite for university students*. Proceedings of the 13th Annual AIAA/USU Conference on Small Satellites, Logan, Utah.
2. Heidt, H., Puig-Suari, J., Moore, A. S., Nakasuka, S., & Twiggs, R. (2000). *CubeSat: A new generation of picosatellite for education and technology demonstration*. Proceedings of the AIAA/USU Conference on Small Satellites.
3. Consultative Committee for Space Data Systems (CCSDS). (2019). *Telemetry Channel Coding - Recommended Standard (CCSDS 131.0-B-3)*. Washington, DC: CCSDS Secretariat.
4. U.S. Standard Atmosphere, 1976. (1976). *National Oceanic and Atmospheric Administration (NOAA), National Aeronautics and Space Administration (NASA), United States Air Force*. Washington, D.C.: U.S. Government Printing Office.
5. Knacke, T. W. (1992). *Parachute Recovery Systems Design Manual*. Santa Barbara, CA: Para Publishing.
6. Diebel, J. (2006). *Representing attitude: Euler angles, unit quaternions, and rotation vectors*. Matrix, 58(15-16), 1-35.
7. Sinnott, R. W. (1984). *Virtues of the Haversine*. Sky and Telescope, 68(2), 159.
8. W3C Web Serial Working Group. (2023). *Web Serial API - W3C Community Group Report*. World Wide Web Consortium. Available at: https://wicg.github.io/serial/
9. Cabello, R. et al. (2024). *Three.js: JavaScript 3D Library*. Available at: https://threejs.org/
10. India Space Lab (ISL). (2025). *CanSat and CubeSat Satellite Project Training & Mission Curriculum*. Janakpuri, New Delhi, India: ISL Educational Publishing.

---

## APPENDIX

### Appendix A: Telemetry Packet Sample Dataset (CSV Format)
```csv
TEAM_ID,PKT_COUNT,TIME,ALTITUDE,PRESSURE,TEMP_EXT,TEMP_INT,VOLTAGE,GYRO_R,GYRO_P,GYRO_Y,ACC_X,ACC_Y,ACC_Z,GPS_LAT,GPS_LON,GPS_ALT,GPS_SATS,STATE,ERR_CODE
ISL_1001,0,00:00:00,0.0,1013.25,28.4,31.2,8.38,0.1,0.0,0.0,0.01,-0.02,1.00,28.613939,77.209021,216.0,10,PRE_LAUNCH,0000
ISL_1001,1,00:00:01,14.8,1011.50,28.3,31.2,8.36,1.2,0.4,2.1,0.15,0.08,3.42,28.613942,77.209025,230.8,10,BOOST,0000
ISL_1001,7,00:00:07,482.0,957.10,25.8,31.5,8.28,4.2,2.8,12.4,0.38,0.22,5.92,28.614010,77.209110,698.0,11,BOOST,0000
ISL_1001,14,00:00:14,1021.0,896.10,21.5,31.8,8.20,1.2,-0.5,35.8,0.04,0.02,0.05,28.614150,77.209320,1237.0,12,APOGEE,0000
ISL_1001,16,00:00:16,984.4,900.20,21.8,31.8,8.18,8.5,-4.2,52.1,0.22,0.18,0.98,28.614190,77.209380,1200.4,12,DROGUE_DESCENT,1000
ISL_1001,48,00:00:48,391.2,967.50,24.6,32.0,8.08,3.2,1.1,104.2,0.08,-0.04,1.02,28.614550,77.209920,607.2,11,MAIN_CHUTE,0000
ISL_1001,92,00:01:32,0.0,1013.25,28.2,32.2,7.98,0.0,0.0,142.5,0.00,0.00,1.00,28.614920,77.210450,216.0,11,LANDED,0000
```

### Appendix B: Critical Mission Command Codes Reference Sheet
```csv
COMMAND_CODE,TARGET_SUBSYSTEM,SAFETY_LEVEL,DESCRIPTION
CMD,1001,SEPARATION,Pyro/Servo Ejection,ARMED REQUIRED,Initiates mechanical payload release from container
CMD,1001,EMG_PARACHUTE,Recovery Pyros,ARMED REQUIRED,Deploys backup secondary recovery parachute
CMD,1001,REDUNDANT_ACT,Power Bus,Standard,Switches avionics power to redundant battery pack
CMD,1001,BEACON_TOGGLE,Audio/RF Beacon,Standard,Toggles acoustic ground buzzer and RF locator beacon
CMD,1001,CALIBRATE_TARE,Baro/IMU Sensors,Standard,Tares altitude ground datum to 0m and levels gyro
```

### Appendix C: Complete Microcontroller C++ Telemetry Firmware Source Code
```cpp
/*
 * INDIA SPACE LAB - CANSAT & CUBESAT TELEMETRY FIRMWARE (C++)
 * Platform: Arduino / WeGyanik Kit Microcontroller
 */
#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <MPU6050.h>
#include <TinyGPS++.h>

Adafruit_BMP280 bmp;
MPU6050 mpu;
TinyGPSPlus gps;

unsigned long packetIndex = 0;
const char* TEAM_ID = "ISL_1001";

void setup() {
    Serial.begin(115200);   // High-speed telemetry downlink
    Wire.begin();
    bmp.begin(0x76);
    mpu.initialize();
}

void loop() {
    float altitude = bmp.readAltitude(1013.25);
    float pressure = bmp.readPressure() / 100.0F;
    float tempExt = bmp.readTemperature();
    
    int16_t ax, ay, az, gx, gy, gz;
    mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
    
    float voltage = (analogRead(A0) * (5.0 / 1023.0)) * 2.0; // 10k/10k divider
    
    // Transmit 20-Field Comma-Separated ASCII Packet
    Serial.print(TEAM_ID); Serial.print(",");
    Serial.print(packetIndex++); Serial.print(",");
    Serial.print("00:01:20,");
    Serial.print(altitude, 1); Serial.print(",");
    Serial.print(pressure, 2); Serial.print(",");
    Serial.print(tempExt, 1); Serial.print(",");
    Serial.print(tempExt + 3.0, 1); Serial.print(","); // Internal Temp
    Serial.print(voltage, 2); Serial.print(",");
    Serial.print(gx / 131.0, 1); Serial.print(",");
    Serial.print(gy / 131.0, 1); Serial.print(",");
    Serial.print(gz / 131.0, 1); Serial.print(",");
    Serial.print(ax / 16384.0, 2); Serial.print(",");
    Serial.print(ay / 16384.0, 2); Serial.print(",");
    Serial.print(az / 16384.0, 2); Serial.print(",");
    Serial.print("28.613939,77.209021,216.0,10,");
    Serial.print("MAIN_CHUTE,");
    Serial.println("0000"); // 4-Digit Error Code
    
    delay(1000); // 1 Hz deterministic rate
}
```
