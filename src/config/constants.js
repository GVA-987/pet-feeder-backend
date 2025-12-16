const CONSTANTS = {
    APP_NAME: 'Pet Feeder Backend',
    APP_VERSION: '1.0.0',

    // Server settings
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',

    // MQTT settings
    MQTT: {
        RECONNECT_INTERVAL: 5000,
        MAX_RECONNECT_ATTEMPTS: 10,
        KEEP_ALIVE: 30,
        CLEAN_SESSION: true,
    },

    // Firebase settings
    FIREBASE: {
        STATUS_UPDATE_INTERVAL: 30000,
        HISTORY_RETENTION_DAYS: 90,
    },

    // Device settings
    DEVICE: {
        TIMEOUT_MS: 60000,
        STATUS_CHECK_INTERVAL: 30000,
    },

    // Dispense settings
    DISPENSE: {
        MIN_PORTIONS: 1,
        MAX_PORTIONS: 5,
        DEFAULT_PORTIONS: 1,
    },

    // Error codes
    ERROR_CODES: {
        MQTT_CONNECTION_FAILED: 'MQTT_CONNECTION_FAILED',
        FIREBASE_CONNECTION_FAILED: 'FIREBASE_CONNECTION_FAILED',
        DEVICE_OFFLINE: 'DEVICE_OFFLINE',
        INVALID_COMMAND: 'INVALID_COMMAND',
        DISPENSE_FAILED: 'DISPENSE_FAILED',
    },
};

export default CONSTANTS;
