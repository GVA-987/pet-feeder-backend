import mqtt from 'mqtt';
import * as dotenv from 'dotenv';
import { handleMqttMessage } from '../handlers/mqttHandlers.js';

dotenv.config();

const MQTT_BROKER = process.env.MQTT_BROKER || 'broker.hivemq.com';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

// Inicializar el Cliente MQTT
export const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`, {
    clientId: 'PetFeeder_NodeBridge',

});

// Manejar Conexión/Desconexión
mqttClient.on('connect', () => {
    console.log(`MQTT: Conectado al broker ${MQTT_BROKER}`);
    mqttClient.subscribe('petfeeder/+/status', (err) => {
        if (!err) {
            console.log(`   Suscrito a tópico de Status: petfeeder/+/status`);
        }
    });
});

mqttClient.on('error', (err) => {
    console.error('MQTT: Error de conexión:', err);
    mqttClient.end();
});


mqttClient.on('message', (topic, message) => {
    handleMqttMessage(topic, message.toString());
});