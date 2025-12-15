const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Importar configuraciones
const { supabase, testConnection } = require('./config/database');
const { mqttClient } = require('./config/mqtt');

const { initMQTT } = require('./services/mqttService');

const app = express();
const server = http.createServer(app);

// Configurar Socket.IO para WebSocket
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middlewares
app.use(cors());
app.use(express.json());
initMQTT(io);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'Pet Feeder Backend API',
        version: '1.0.0'
    });
});

// Ruta para verificar estado del backend
app.get('/health', async (req, res) => {
    const dbConnected = await testConnection();
    const mqttConnected = mqttClient.connected;

    res.json({
        status: 'healthy',
        services: {
            database: dbConnected ? 'connected' : 'disconnected',
            mqtt: mqttConnected ? 'connected' : 'disconnected'
        },
        timestamp: new Date().toISOString()
    });
});

// Obtener dispositios del usuario
app.get('/api/device', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('devices')
            .select('*');

        if (error) throw error;
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// WebSocket: Cliente conectado
io.on('connection', (socket) => {
    console.log(`Cliente WebSocket conectado: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Cliente WebSocket desconectado: ${socket.id}`);
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
    console.log(`Backend iniciado en puerto ${PORT}`);
    console.log(`API disponible en: http://localhost:${PORT}`);

    // Verificar conexiones
    await testConnection();

    if (mqttClient.connected) {
        console.log('✅ Todas las conexiones activas\n');
    } else {
        console.log('⏳ Esperando conexión MQTT...\n');
    }
});

module.exports = { app, io, mqttClient, supabase };
