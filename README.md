# 🐾 Backend: Puente MQTT para Alimentador de Mascotas

## Descripción del Servicio

Este servicio backend actúa como el **middleware central** para el sistema automatizado de alimentación de mascotas (_Pet Feeder_). Su propósito es conectar la infraestructura IoT con la capa de aplicación web.

La función principal es operar como un **Puente de Comunicación Bidireccional** que une **HiveMQ Cloud (MQTT)** con **Firebase Realtime Database**.

## Funcionalidades Esenciales

El backend cumple los siguientes roles clave:

- **Puente MQTT:**
  - Establece una conexión continua con **HiveMQ Cloud**.
  - Recibe datos de telemetría (peso, estado) del dispositivo **ESP32**.
  - Retransmite comandos de control desde la Web hacia el dispositivo.
- **Persistencia (Firebase):**
  - Almacena y sincroniza el **estado actual del dispositivo**.
  - Registra el **historial de eventos** (alimentaciones, alertas) en tiempo real.
- **API REST:**
  - Expone puntos finales para que la interfaz web pueda **enviar comandos** (e.g., alimentar ahora).
  - Permite **consultar el estado** y el historial del alimentador.
- **Relé de Comando:**
  - Traduce las peticiones HTTP (Web) en mensajes MQTT para la **actuación instantánea** del ESP32.

## Stack Tecnológico

Los componentes principales que componen este servicio son:

- **Backend:** `[Node.js]`
- **Broker MQTT:** **HiveMQ Cloud**
- **Base de Datos:** **Firebase Realtime Database**
- **Dispositivo IoT:** **ESP32**
