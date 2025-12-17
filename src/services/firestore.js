import { firestore } from '../config/firebase.js';

export const logDispenseToFirestore = async (deviceId, logData) => {
    try {
        await firestore.collection('dispense_logs').add({
            deviceId: deviceId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(), // Usa el timestamp del servidor
            ...logData
        });
        console.log(`LOG FIREBASE: Dispensación registrada para ${deviceId}.`);
        return true;
    } catch (error) {
        console.error(`ERROR FIREBASE: Fallo al registrar log en Firestore:`, error.message);
        return false;
    }
};