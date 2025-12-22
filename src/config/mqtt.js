import mqtt from 'mqtt';
import * as dotenv from 'dotenv';
import { handleMqttMessage } from '../handlers/mqttHandlers.js';

dotenv.config();

const MQTT_BROKER = process.env.MQTT_BROKER || 'broker.hivemq.com';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

const clientId = `PetFeeder_NodeBridge_${Math.random().toString(16).slice(2, 8)}`;

// Inicializar el Cliente MQTT
export const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`, {
    clientId: clientId,
    clean: true,
    reconnectPeriod: 5000,

});

// Manejar Conexión
mqttClient.on('connect', () => {
    console.log(`MQTT: Conectado al broker ${MQTT_BROKER}`);
    mqttClient.subscribe('petfeeder/+/status', (err) => {
        if (!err) {
            console.log(`   Suscrito a tópico de Status: petfeeder/+/status`);
        }
    });
});
// Manejar Mensajes Entrantes
mqttClient.on('message', (topic, message) => {
    handleMqttMessage(topic, message.toString());
});

mqttClient.on('error', (err) => {
    console.error('MQTT: Error de conexión:', err);
    mqttClient.end();
});
