import 'dotenv/config';
import { mqttClient } from './config/mqtt.js'; //conexión MQTT
import { listenToCommands } from './services/firebaseRTDB.js'; // Listener de RTDB
import * as dotenv from 'dotenv';

dotenv.config();

// ID del dispositivo que queremos monitorear
const TARGET_DEVICE_ID = process.env.TARGET_DEVICE_ID || "ESP-PET-J1PZ8X7-A3B6C9D";

console.log(`Iniciando Bridge MQTT <-> Firebase para ${TARGET_DEVICE_ID}`);

// Esperar a que el cliente MQTT esté listo antes de escuchar RTDB
mqttClient.on('connect', () => {

    listenToCommands(TARGET_DEVICE_ID, (commandData) => {

        const manualDispense = commandData.dispense_manual;
        const portion = commandData.food_portion;

        if (manualDispense === 'activado') {
            const mqttPayload = {
                action: 'dispense',
                portion: portion || 1,
            };

            const commandTopic = `petfeeder/${TARGET_DEVICE_ID}/command`;

            // Publicar el comando al ESP32 a través de MQTT
            mqttClient.publish(commandTopic, JSON.stringify(mqttPayload), (err) => {
                if (!err) {
                    console.log(`-> Comando DISPENSE enviado a MQTT para ${TARGET_DEVICE_ID}. Porción: ${portion}`);
                }
            });

            // Resetear el comando en RTDB
            // db.ref(`${TARGET_DEVICE_ID}/commands`).update({ dispense_manual: 'desactivado' }); 
        }
    });

    console.log(`Bridge listo. Escuchando comandos de RTDB...`);
});