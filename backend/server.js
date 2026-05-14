import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './src/routes/api.js';
import { prisma } from './src/db.js';
import { runTelemetryTick } from './src/services/telemetryEngine.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

app.use(cors());
app.use(express.json());

// REST APIs
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// Socket.io for Real-time Telemetry Simulation
io.on('connection', async (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Send initial data to client if they ask, though they mostly use REST

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Telemetry Simulation Loop (runs every 1 second)
setInterval(() => {
    runTelemetryTick(io);
}, 1000);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Trigger nodemon restart for new Prisma Client