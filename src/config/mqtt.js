import dotenv from 'dotenv';

dotenv.config();

const mqttConfig = {
    // broker
    host: process.env.MQTT_HOST || 'localhost',
    port: parseInt(process.env.MQTT_PORT || '8883'),
    protocol: process.env.MQTT_PROTOCOL || 'mqtts',

    // Credential
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,

    // Client setting
    clientId: `backend-${process.env.DEVICE_ID || 'ESP-PET-J1PZ8X7-A3B6C9D'}-${Date.now()}`,
    clean: true,
    keepalive: 30,
    reconnectPeriod: 5000,

    rejectUnauthorized: false,
    will: {
        topic: `device/${process.env.DEVICE_ID || 'ESP-PET-001'}/status/backend_online`,
        payload: JSON.stringify({ online: false, timestamp: new Date().toISOString() }),
        qos: 1,
        retain: true,
    },
};

// config validation
function validateMQTTConfig() {
    const required = ['host', 'username', 'password'];
    const missing = required.filter(key => !mqttConfig[key]);

    if (missing.length > 0) {
        throw new Error(`Missing MQTT configuration: ${missing.join(', ')}`);
    }

    console.log('MQTT configuration validated');
}

export { mqttConfig, validateMQTTConfig };
