/**
 * INDIA SPACE LAB - CANSAT & CUBESAT GROUND CONTROL SOFTWARE (GCS)
 * Web Serial API Driver
 * Direct USB UART Communication for Arduino / ESP32 / WeGyanik Kit
 */

class SerialManager {
    constructor(onLineReceived, onStatusChange) {
        this.port = null;
        this.reader = null;
        this.writer = null;
        this.readableStreamClosed = null;
        this.writableStreamClosed = null;
        this.isConnected = false;
        this.onLineReceived = onLineReceived || (() => {});
        this.onStatusChange = onStatusChange || (() => {});
        this.lineBuffer = '';
    }

    /**
     * Check if Web Serial API is supported in current browser
     */
    static isSupported() {
        return 'serial' in navigator;
    }

    /**
     * Request user to select COM port and establish connection
     */
    async connect(baudRate = 115200) {
        if (!SerialManager.isSupported()) {
            throw new Error('Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera.');
        }

        try {
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate: parseInt(baudRate, 10) });

            this.isConnected = true;
            this.onStatusChange({ connected: true, baudRate });

            // Setup read loop
            this.readLoop();
            return true;
        } catch (err) {
            console.error('[SerialManager] Connection error:', err);
            this.disconnect();
            throw err;
        }
    }

    /**
     * Continuous read loop with line buffering
     */
    async readLoop() {
        const textDecoder = new TextDecoderStream();
        this.readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
        this.reader = textDecoder.readable.getReader();

        try {
            while (this.isConnected) {
                const { value, done } = await this.reader.read();
                if (done) {
                    break;
                }
                if (value) {
                    this.lineBuffer += value;
                    const lines = this.lineBuffer.split(/\r\n|\n|\r/);
                    // Keep incomplete last chunk in buffer
                    this.lineBuffer = lines.pop();

                    for (const line of lines) {
                        if (line.trim().length > 0) {
                            this.onLineReceived(line.trim());
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('[SerialManager] Read stream error/closed:', error);
        } finally {
            if (this.reader) {
                this.reader.releaseLock();
            }
        }
    }

    /**
     * Send command string to microcontroller
     */
    async sendCommand(commandString) {
        if (!this.isConnected || !this.port || !this.port.writable) {
            throw new Error('Serial port is not connected.');
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(commandString.trim() + '\r\n');
        const writer = this.port.writable.getWriter();
        try {
            await writer.write(data);
        } finally {
            writer.releaseLock();
        }
    }

    /**
     * Disconnect port and clean up resources
     */
    async disconnect() {
        this.isConnected = false;

        if (this.reader) {
            try {
                await this.reader.cancel();
            } catch (e) {}
        }
        if (this.readableStreamClosed) {
            try {
                await this.readableStreamClosed.catch(() => {});
            } catch (e) {}
        }

        if (this.port) {
            try {
                await this.port.close();
            } catch (e) {}
            this.port = null;
        }

        this.onStatusChange({ connected: false });
    }
}

// Attach to window
window.SerialManager = SerialManager;
