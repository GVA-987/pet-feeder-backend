const DEVICE_ID = process.env.DEVICE_ID || 'ESP-PET-J1PZ8X7-A3B6C9D';

// Estado de Tiopic
const STATUS_TOPICS = {
    ONLINE: `device/${DEVICE_ID}/status/online`,
    WIFI_SIGNAL: `device/${DEVICE_ID}/status/wifi_signal`,
    TEMPERATURE: `device/${DEVICE_ID}/status/temperature`,
};

// Topíc Sensor
const SENSOR_TOPICS = {
    WEIGHT: `device/${DEVICE_ID}/sensors/weight`,
};

// Topic Eventos
const EVENT_TOPICS = {
    DISPENSE: `device/${DEVICE_ID}/events/dispense`,
    ERROR: `device/${DEVICE_ID}/events/error`,
    STARTUP: `device/${DEVICE_ID}/events/startup`,
};

// Eventos
const COMMAND_TOPICS = {
    DISPENSE: `device/${DEVICE_ID}/commands/dispense`,
    SCHEDULE: `device/${DEVICE_ID}/commands/schedule`,
    CONFIG: `device/${DEVICE_ID}/commands/config`,
};

// Suscripciones
const SUBSCRIBE_PATTERNS = [
    // Listen to all ESP32 status updates
    STATUS_TOPICS.ONLINE,
    STATUS_TOPICS.WIFI_SIGNAL,
    STATUS_TOPICS.TEMPERATURE,
    SENSOR_TOPICS.WEIGHT,
    EVENT_TOPICS.DISPENSE,
    EVENT_TOPICS.ERROR,
    EVENT_TOPICS.STARTUP,
];

export {
    DEVICE_ID,
    STATUS_TOPICS,
    SENSOR_TOPICS,
    EVENT_TOPICS,
    COMMAND_TOPICS,
    SUBSCRIBE_PATTERNS,
};