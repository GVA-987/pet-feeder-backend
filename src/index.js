import 'dotenv/config';
import { mqttClient } from './config/mqtt.js'; //conexión MQTT
import { listenToAllDevices } from './services/firebaseRTDB.js'; // Listener de RTDB
import { ref, onValue, update } from "firebase/database";
import { db } from './config/firebase.js';

console.log(`Iniciando Bridge MQTT <-> Firebase`);

// Espera del cliente MQTT antes de escuchar RTDB
mqttClient.on('connect', () => {
    console.log("Conectado a MQTT. Esperando cambios en RTDB... ");

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

                    // Limpieza del flag en RTDB para que no entre en bucle de reinicios
                    const deviceRef = db.ref(`${deviceId}/commands`);
                    deviceRef.update({ reset_wifi: 'desactivado' });
                }
            });
        }


    });

    console.log(`Bridge listo. Escuchando comandos de RTDB...`);
});