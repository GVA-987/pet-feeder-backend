import { mqttConfig, validateMQTTConfig } from './config/mqtt.js';
import { db, admin } from './config/firebase.js';
import CONSTANTS from './config/constants.js';
import { SUBSCRIBE_PATTERNS, STATUS_TOPICS } from './utils/mqtt-topics.js';
import mqtt from 'mqtt';

console.log(`Pet Feeder Backend - Starting...`);

// CONNECT TO MQTT
console.log('Connecting to MQTT broker...');
try {
    validateMQTTConfig();
    const client = mqtt.connect(mqttConfig);

    client.on('connect', () => {
        console.log('Connected to MQTT broker');
        console.log(`   Host: ${mqttConfig.host}`);
        console.log(`   Port: ${mqttConfig.port}`);

        // Subscribe to all topics
        client.subscribe(SUBSCRIBE_PATTERNS, (err) => {
            if (err) {
                console.error('Subscribe error:', err);
            } else {
                console.log('Subscribed to MQTT topics');
                SUBSCRIBE_PATTERNS.forEach(topic => {
                    console.log(` -> ${topic}`);
                });
            }
        });
    });

    client.on('error', (error) => {
        console.error('MQTT error:', error.message);
    });

    client.on('message', (topic, message) => {
        console.log(`MQTT Message received:`);
        console.log(`   Topic: ${topic}`);
        console.log(`   Payload: ${message.toString()}`);
    });

} catch (error) {
    console.error('MQTT connection failed:', error.message);
    process.exit(1);
}


// Test Firebase
console.log('\nTesting Firebase connection...');

try {
    const ref = db.ref('test');
    ref.set({ connected: true, timestamp: new Date().toISOString() })
        .then(() => {
            console.log('Connected to Firebase');
        })
        .catch(error => {
            console.error('Firebase write error:', error.message);
        });
} catch (error) {
    console.error('Firebase error:', error.message);
}
// End Test Firebase

// START SERVER
console.log(`\nServer starting on port ${CONSTANTS.PORT}`);
console.log(`   Environment: ${CONSTANTS.NODE_ENV}`);
console.log(`   Log Level: ${CONSTANTS.LOG_LEVEL}`);

console.log(`Application Ready`);

// Keep process alive
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    process.exit(0);
});
