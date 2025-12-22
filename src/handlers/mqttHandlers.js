import { firestore } from '../config/firebase.js';
import admin from 'firebase-admin';
import * as RTDBService from '../services/firebaseRTDB.js';
import * as FirestoreService from '../services/firestore.js';

export const handleMqttMessage = async (topic, rawPayload) => {
    // Extraer el DEVICE_ID del tópico 
    const topicParts = topic.split('/');
    if (topicParts.length < 3) return;
    const deviceId = topicParts[1];
    const messageType = topicParts[2];

    try {
        const payload = JSON.parse(rawPayload);

        // MANEJO DE STATUS DEL DISPOSITIVO 
        if (messageType === 'status') {

            const isOnline = payload.online === true;
            const connectionStatus = isOnline ? 'conectado' : 'desconectado';

            let updateData = {
                online: connectionStatus,
                lastSeen: admin.database.ServerValue.TIMESTAMP
            };

            if (payload.temp !== undefined) updateData.temperature = payload.temp;
            if (payload.food !== undefined) updateData.foodLevel = payload.food;
            if (payload.rssi !== undefined) updateData.rssi = payload.rssi;

            await RTDBService.updateDeviceStatus(deviceId, updateData);

            console.log(`Mensaje STATUS recibido de ${deviceId}`);

            // Guardar historial en firestore
            if (payload.status === "completado") {

                const historyData = {
                    deviceId: deviceId,
                    portion: Number(payload.portion) || 1,
                    status: payload.status,
                    type: payload.type || "manual",
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                };

                await firestore.collection('dispense_history').add(historyData);

                console.log(`Historial guardado en Firestore para: ${deviceId}`);
            }
        }


    } catch (e) {
        console.error(`Fallo al parsear JSON de MQTT para ${deviceId}:`, e);
    }
};