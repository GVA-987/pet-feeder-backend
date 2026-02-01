import { firestore } from "../config/firebase.js";
import admin from "firebase-admin";
import * as RTDBService from "../services/firebaseRTDB.js";

export const handleMqttMessage = async (topic, rawPayload) => {
  // Extraer el DEVICE_ID del tópico
  const topicParts = topic.split("/");
  if (topicParts.length < 3) return;
  const deviceId = topicParts[1];
  const messageType = topicParts[2];

  const rawString = rawPayload.toString();

  if (!rawString.trim().startsWith("{") && !rawString.trim().startsWith("[")) {
    return; // Evita el crash por SyntaxError
  }

  try {
    const payload = JSON.parse(rawPayload);

    if (messageType === "status") {
      const isOnline = payload.online === true;
      const connectionStatus = isOnline ? "conectado" : "desconectado";

      let updateData = {
        online: connectionStatus,
        lastSeen: admin.database.ServerValue.TIMESTAMP,
      };

      if (payload.temp !== undefined) updateData.temperature = payload.temp;
      if (payload.food !== undefined) updateData.foodLevel = payload.food;
      if (payload.rssi !== undefined) updateData.rssi = payload.rssi;
      if (payload.ip !== undefined) updateData.ip_address = payload.ip;
      if (payload.mac !== undefined) updateData.mac_address = payload.mac;
      if (payload.ssid !== undefined) updateData.ssid = payload.ssid;

      await RTDBService.updateDeviceStatus(deviceId, updateData);

      const shouldLogConnection =
        payload.event === "connection_change" ||
        payload.event === "startup" ||
        !isOnline;

      if (shouldLogConnection) {
        await firestore.collection("device_logs").add({
          deviceId: deviceId,
          action: isOnline ? "DEVICE_ONLINE" : "DEVICE_OFFLINE",
          details: isOnline
            ? "El alimentador se ha conectado y está listo."
            : "El alimentador ha perdido la conexión (LWT).",
          type: isOnline ? "info" : "warning",
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(
          `[LOG] Historial de conexión registrado: ${deviceId} (${connectionStatus})`,
        );
      }

      // Guardar historial en firestore
      if (payload.event === "dispense_done") {
        if (payload.status === "completado") {
          let userId = "unknown";

          try {
            const deviceDoc = await firestore
              .collection("devicesPet")
              .doc(deviceId)
              .get();

            if (deviceDoc.exists) {
              userId = deviceDoc.data().linked_user_id || "unlinked";
            }
          } catch (err) {
            console.error("Error buscando dueño del dispositivo:", err);
          }

          const historyData = {
            deviceId: deviceId,
            userId: userId,
            portion: Number(payload.portion),
            status: payload.status,
            type: payload.type || "programado",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          };
          await firestore.collection("dispense_history").add(historyData);
          console.log(`[HISTORIAL] Dispensación exitosa para el ${deviceId}`);
        }

        // Si hubo un error, registrarlo como una alerta en device_logs
        if (payload.status === "error") {
          await firestore.collection("device_logs").add({
            deviceId: deviceId,
            action: "DISPENSE_ERROR",
            details: payload.error_msg || "Fallo mecánico o motor atascado.",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            type: "error",
          });
          console.error(`[ERROR] Fallo de dispensación en ${deviceId}`);
        }
      }
    }
  } catch (e) {
    console.error(`Error procesando MQTT de ${deviceId}:`, e);
  }
};
