// src/handlers/mqttHandlers.js

import * as RTDBService from '../services/firebaseRTDB.js';
import * as FirestoreService from '../services/firestore.js';

export const handleMqttMessage = (topic, rawPayload) => {
    // Extraer el DEVICE_ID del tópico 
    const topicParts = topic.split('/');
    if (topicParts.length < 3) return;
    const deviceId = topicParts[1];
    const messageType = topicParts[2];

    try {
        const payload = JSON.parse(rawPayload);

        // MANEJO DE STATUS DEL DISPOSITIVO 
        if (messageType === 'status') {

            // Actualizar estado general en RTDB
            RTDBService.updateDeviceStatus(deviceId, {
                temperature: payload.temp,
                foodLevel: payload.food,
                rssi: payload.rssi,
                online: payload.online ? 'conectado' : 'desconectado',
            });

            console.log(`<- Mensaje STATUS recibido de ${deviceId}`);

            // Si el payload incluye datos de dispensación, loguear
            if (payload.dispenseLog) {
                FirestoreService.logDispenseToFirestore(deviceId, payload.dispenseLog);
                RTDBService.updateDeviceStatus(deviceId, {
                    lastDispense: {
                        ...payload.dispenseLog,
                        timestamp: new Date().toISOString(),
                    }
                });
            }
        }
    } catch (e) {
        console.error(`Fallo al parsear JSON de MQTT para ${deviceId}:`, e);
    }
};