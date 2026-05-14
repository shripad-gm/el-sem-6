import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './src/routes/api.js';
import { prisma } from './src/db.js';

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

// Telemetry Simulation Loop (runs every 2 seconds)
setInterval(async () => {
    try {
        // Only simulate if clients are connected
        if (io.engine.clientsCount === 0) return;

        // Fetch all RUNNING machines
        const machines = await prisma.machine.findMany({
            where: { status: 'RUNNING' },
        });

        if (machines.length === 0) return;

        // Generate random telemetry for running machines
        const telemetryUpdates = machines.map(m => {
            return {
                machineId: m.id,
                rpm: Math.floor(Math.random() * 200) + 1800, // 1800-2000
                temp: Math.floor(Math.random() * 10) + 60, // 60-70C
                efficiency: Math.floor(Math.random() * 10) + 90, // 90-100%
                stitchCount: Math.floor(Math.random() * 50) + 1000,
                queue: Math.floor(Math.random() * 5),
                throughput: Math.floor(Math.random() * 20) + 80, // 80-100
                timestamp: new Date()
            };
        });

        // We could save this to DB, but for performance in this demo we'll just broadcast
        // await prisma.telemetryLog.createMany({ data: telemetryUpdates });

        io.emit('telemetry_update', telemetryUpdates);
    } catch (err) {
        console.error("Telemetry simulation error:", err.message);
    }
}, 2000);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});