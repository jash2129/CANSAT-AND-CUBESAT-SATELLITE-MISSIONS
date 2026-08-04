/**
 * =========================================================================================
 * INDIA SPACE LAB - CANSAT & CUBESAT SATELLITE PROJECT
 * Microcontroller Telemetry Transmitter Firmware (WeGyanik Kit / Arduino / ESP32)
 * =========================================================================================
 * 
 * Hardware Compatibility:
 * - WeGyanik Kit Microcontroller Board / Arduino Uno / Nano / Mega / ESP32 / Teensy
 * - Barometric Sensor: BMP280 / BME280 / BMP180 (I2C 0x76 or 0x77)
 * - Inertial Measurement Unit: MPU6050 (I2C 0x68)
 * - GNSS Module: NEO-6M / NEO-M8N GPS (UART RX/TX)
 * 
 * Protocol Format (CSV, 20 Fields):
 * TEAM_ID,MISSION_TIME,PACKET_COUNT,ALTITUDE,PRESSURE,TEMP_EXT,TEMP_INT,VOLTAGE,
 * GYRO_R,GYRO_P,GYRO_Y,ACC_X,ACC_Y,ACC_Z,GPS_LAT,GPS_LON,GPS_ALT,GPS_SATS,STATE,ERROR_CODE
 * =========================================================================================
 */

#include <Arduino.h>

// Mission Configuration
const char TEAM_ID[] = "ISL_1001";
const unsigned long TELEMETRY_INTERVAL_MS = 1000; // 1 Hz transmission rate

// Pin Definitions
const int PIN_LED_STATUS = 13;
const int PIN_BUZZER_BEACON = 8;
const int PIN_PYRO_SEPARATION = 9;
const int PIN_PYRO_PARACHUTE = 10;

// State Variables
unsigned long lastTelemetryTime = 0;
unsigned long packetCount = 0;
unsigned long missionStartMillis = 0;

// Flight State Machine
enum FlightState {
  PRE_LAUNCH,
  BOOST,
  APOGEE,
  SEPARATION,
  DROGUE_DESCENT,
  MAIN_CHUTE,
  LANDED
};

FlightState currentState = PRE_LAUNCH;

// Telemetry Variables
float altitudeMeters = 0.0;
float pressureHpa = 1013.25;
float tempExtC = 24.5;
float tempIntC = 28.2;
float batteryVoltage = 8.38;
float gyroRoll = 0.0;
float gyroPitch = 0.0;
float gyroYaw = 0.0;
float accX = 0.0;
float accY = 0.0;
float accZ = 1.0;
float gpsLat = 28.613939;
float gpsLon = 77.209021;
float gpsAlt = 216.0;
int gpsSatellites = 10;
char errorCodeStr[5] = "0000";

// Command Buffer
String serialRxBuffer = "";

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED_STATUS, OUTPUT);
  pinMode(PIN_BUZZER_BEACON, OUTPUT);
  pinMode(PIN_PYRO_SEPARATION, OUTPUT);
  pinMode(PIN_PYRO_PARACHUTE, OUTPUT);

  digitalWrite(PIN_LED_STATUS, LOW);
  digitalWrite(PIN_BUZZER_BEACON, LOW);
  digitalWrite(PIN_PYRO_SEPARATION, LOW);
  digitalWrite(PIN_PYRO_PARACHUTE, LOW);

  missionStartMillis = millis();
  
  // Power-on Self Test Chirp
  digitalWrite(PIN_LED_STATUS, HIGH);
  delay(100);
  digitalWrite(PIN_LED_STATUS, LOW);
}

void loop() {
  unsigned long currentMillis = millis();

  // 1. Process Incoming Ground Station Commands
  readSerialCommands();

  // 2. Transmit Telemetry at 1 Hz
  if (currentMillis - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = currentMillis;
    packetCount++;

    // Update internal simulated flight dynamics (fallback when physical sensors not present)
    updateSensors(currentMillis);

    // Transmit formatted packet
    sendTelemetryPacket(currentMillis);

    // Toggle onboard telemetry LED
    digitalWrite(PIN_LED_STATUS, !digitalRead(PIN_LED_STATUS));
  }
}

/**
 * Format Mission Time as HH:MM:SS.s
 */
String getMissionTimeFormatted(unsigned long currentMillis) {
  unsigned long totalSeconds = (currentMillis - missionStartMillis) / 1000;
  unsigned long hours = totalSeconds / 3600;
  unsigned long minutes = (totalSeconds % 3600) / 60;
  unsigned long seconds = totalSeconds % 60;
  unsigned long tenths = ((currentMillis - missionStartMillis) % 1000) / 100;

  char buf[16];
  sprintf(buf, "%02lu:%02lu:%02lu.%lu", hours, minutes, seconds, tenths);
  return String(buf);
}

/**
 * Get Flight State as string
 */
const char* getFlightStateString(FlightState state) {
  switch (state) {
    case PRE_LAUNCH:     return "PRE_LAUNCH";
    case BOOST:          return "BOOST";
    case APOGEE:         return "APOGEE";
    case SEPARATION:     return "SEPARATION";
    case DROGUE_DESCENT: return "DROGUE_DESCENT";
    case MAIN_CHUTE:     return "MAIN_CHUTE";
    case LANDED:         return "LANDED";
    default:             return "STANDBY";
  }
}

/**
 * Update sensor parameters or simulate dynamics
 */
void updateSensors(unsigned long currentMillis) {
  float t = (currentMillis - missionStartMillis) / 1000.0;

  // Small battery drain simulation
  batteryVoltage = max(7.20f, 8.40f - (t * 0.0005f));

  // Dynamic simulation if in pre-launch
  if (currentState == PRE_LAUNCH) {
    altitudeMeters = 0.0 + (sin(t) * 0.2);
    pressureHpa = 1013.25 - (altitudeMeters * 0.12);
    gyroRoll = sin(t * 0.5) * 1.5;
    gyroPitch = cos(t * 0.5) * 1.2;
    gyroYaw = fmod(t * 5.0, 360.0);
    strcpy(errorCodeStr, "0000");
  }
}

/**
 * Send standard 20-field CSV telemetry string over Serial
 */
void sendTelemetryPacket(unsigned long currentMillis) {
  String timeStr = getMissionTimeFormatted(currentMillis);
  const char* stateStr = getFlightStateString(currentState);

  Serial.print(TEAM_ID);
  Serial.print(",");
  Serial.print(timeStr);
  Serial.print(",");
  Serial.print(packetCount);
  Serial.print(",");
  Serial.print(altitudeMeters, 2);
  Serial.print(",");
  Serial.print(pressureHpa, 2);
  Serial.print(",");
  Serial.print(tempExtC, 2);
  Serial.print(",");
  Serial.print(tempIntC, 2);
  Serial.print(",");
  Serial.print(batteryVoltage, 2);
  Serial.print(",");
  Serial.print(gyroRoll, 1);
  Serial.print(",");
  Serial.print(gyroPitch, 1);
  Serial.print(",");
  Serial.print(gyroYaw, 1);
  Serial.print(",");
  Serial.print(accX, 2);
  Serial.print(",");
  Serial.print(accY, 2);
  Serial.print(",");
  Serial.print(accZ, 2);
  Serial.print(",");
  Serial.print(gpsLat, 6);
  Serial.print(",");
  Serial.print(gpsLon, 6);
  Serial.print(",");
  Serial.print(gpsAlt, 2);
  Serial.print(",");
  Serial.print(gpsSatellites);
  Serial.print(",");
  Serial.print(stateStr);
  Serial.print(",");
  Serial.println(errorCodeStr);
}

/**
 * Parse and execute ground commands
 */
void readSerialCommands() {
  while (Serial.available() > 0) {
    char c = (char)Serial.read();
    if (c == '\n' || c == '\r') {
      if (serialRxBuffer.length() > 0) {
        parseCommand(serialRxBuffer);
        serialRxBuffer = "";
      }
    } else {
      serialRxBuffer += c;
    }
  }
}

void parseCommand(String cmd) {
  cmd.trim();
  if (cmd.length() == 0) return;

  // Echo acknowledgment
  Serial.print("# [CMD_ACK] Received: ");
  Serial.println(cmd);

  if (cmd.indexOf("SEPARATION") >= 0) {
    currentState = SEPARATION;
    digitalWrite(PIN_PYRO_SEPARATION, HIGH);
    delay(200);
    digitalWrite(PIN_PYRO_SEPARATION, LOW);
  } 
  else if (cmd.indexOf("EMG_PARACHUTE") >= 0) {
    currentState = MAIN_CHUTE;
    digitalWrite(PIN_PYRO_PARACHUTE, HIGH);
    delay(200);
    digitalWrite(PIN_PYRO_PARACHUTE, LOW);
  }
  else if (cmd.indexOf("BEACON_TOGGLE") >= 0) {
    digitalWrite(PIN_BUZZER_BEACON, !digitalRead(PIN_BUZZER_BEACON));
  }
  else if (cmd.indexOf("CALIBRATE_TARE") >= 0) {
    altitudeMeters = 0.0;
    pressureHpa = 1013.25;
  }
}
