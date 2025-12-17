import { db } from '../config/firebase.js';

export const updateDeviceStatus = async (deviceId, statusData) => {
    try {
        const ref = db.ref(`${deviceId}/status`);
        await ref.update({
            ...statusData,
            lastUpdate: new Date().toISOString(),
        });
    } catch (error) {
        console.error(`Error actualizando estado en RTDB:`, error.message);
    }
};

// funcion para escuchar comandos entrantes
export const listenToCommands = (deviceId, callback) => {
    const commandsRef = db.ref(`${deviceId}/commands`);

    commandsRef.on('value', (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        }
    });
    return () => commandsRef.off();
};