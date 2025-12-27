import 'dotenv/config';
import { mqttClient } from './config/mqtt.js'; //conexión MQTT
import { listenToAllDevices } from './services/firebaseRTDB.js'; // Listener de RTDB
import { ref, onValue, update } from "firebase/database";
import { db, firestore } from './config/firebase.js';

console.log(`Iniciando Bridge MQTT <-> Firebase`);

// Espera del cliente MQTT antes de escuchar RTDB
mqttClient.on('connect', () => {
    console.log("Conectado a MQTT. Esperando cambios en RTDB... ");
    mqttClient.subscribe('petfeeder/+/status', { qos: 1 });

    listenToAllDevices((deviceId, commands) => {

        const manualDispense = commands.dispense_manual;
        const portion = commands.food_portion;

        if (manualDispense === 'activado') {
            const mqttPayload = {
                action: 'dispense',
                portion: parseInt(portion) || 1
            };

            const commandTopic = `petfeeder/${deviceId}/command`;

            mqttClient.publish(commandTopic, JSON.stringify(mqttPayload), { qos: 1 }, (err) => {
                if (!err) {
                    console.log(`Comando ENVIADO a ${deviceId} (Porciones: ${mqttPayload.portion})`);

                    const deviceRef = db.ref(`${deviceId}/commands`);
                    deviceRef.update({ dispense_manual: 'desactivado' });
                }
            });
        }

        if (commands.reset_wifi === 'activado') {
            const mqttPayload = {
                action: 'reset_wifi'
            };

            const commandTopic = `petfeeder/${deviceId}/command`;

            mqttClient.publish(commandTopic, JSON.stringify(mqttPayload), { qos: 1 }, (err) => {
                if (!err) {
                    console.log(`Comando de RESET enviado a ${deviceId}`);
                    const deviceRef = db.ref(`${deviceId}/commands`);
                    deviceRef.update({ reset_wifi: 'desactivado' });
                }
            });
        }


    });

    console.log(`Bridge listo. Escuchando comandos de RTDB...`);
});

// Sincroniza horarios desde Firestore a los dispositivos vía MQTT
firestore.collection('devicesPet').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
            const deviceData = change.doc.data();
            const deviceId = change.doc.id;

            if (deviceData.schedule && Array.isArray(deviceData.schedule)) {
                const schedulePayload = deviceData.schedule.map(item => ({
                    id: item.id,
                    time: item.time,
                    portion: item.portion,
                    days: item.days,
                    enabled: item.enabled
                }));

                const topic = `petfeeder/${deviceId}/schedule`;
                mqttClient.publish(topic, JSON.stringify(schedulePayload), { qos: 1, retain: true });
                console.log(`📡 [${deviceId}] Agenda sincronizada`);
            }
        }
    });
});