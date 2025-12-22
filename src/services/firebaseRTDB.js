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

// escuchar comandos entrantes
export const listenToCommands = (deviceId, callback) => {
    const commandsRef = db.ref(`${deviceId}/commands`);

    commandsRef.on('value', (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        }
    });
    return () => commandsRef.off();
};

export const listenToAllDevices = (callback) => {
    // Escuchamos la raíz de la RTDB
    const devicesRef = db.ref('/');

    devicesRef.on('child_changed', (snapshot) => {
        const deviceId = snapshot.key; // Obtener el ID de dispositivos registrados en RTDB
        const data = snapshot.val();

        if (data.commands) {
            callback(deviceId, data.commands);
        }
    });
};