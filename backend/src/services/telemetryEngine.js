import { prisma } from '../db.js';

/**
 * Log-Driven Telemetry Engine
 * 
 * Generates continuous logs for all machines, calculates derived states (health, power),
 * applies threshold rules to generate alerts, and updates machine statuses based on logs.
 */

// Basic simulation state to keep values continuous
const machineStates = {};

export async function runTelemetryTick(io) {
    try {
        // We run telemetry even if no clients are connected to maintain the logs in the DB,
        // but maybe we can skip if DB size grows too fast. For this requirement, we run always.
        
        const machines = await prisma.machine.findMany();
        if (machines.length === 0) return;

        const telemetryLogsData = [];
        const activityLogsData = [];
        const machineUpdates = [];
        const socketPayload = [];

        const now = new Date();

        for (const m of machines) {
            // Initialize state if not exists
            if (!machineStates[m.id]) {
                machineStates[m.id] = {
                    rpm: m.status === 'IDLE' ? 0 : 2000,
                    temp: 65,
                    efficiency: 95,
                    stitchCount: 1500,
                    queue: 10,
                    throughput: 85,
                    power: 1.0,
                    health: 98
                };
            }

            const state = machineStates[m.id];
            
            // If the machine is IDLE, we might want to keep RPM at 0 or randomly start it
            // For a lively factory, let's keep all machines running unless they error out
            let isRunning = m.status === 'RUNNING' || m.status === 'WARNING' || m.status === 'IDLE';

            if (isRunning) {
                // Random walk
                state.rpm = Math.max(1500, Math.min(3500, state.rpm + (Math.random() - 0.5) * 100));
                state.temp = Math.max(40, Math.min(100, state.temp + (Math.random() - 0.5) * 5));
                state.queue = Math.max(0, Math.min(100, state.queue + (Math.random() - 0.5) * 10));
                state.efficiency = Math.max(50, Math.min(100, state.efficiency + (Math.random() - 0.4) * 2)); // Slightly drifts down without maintenance
                state.throughput = Math.floor(state.rpm / 25);
                state.power = Number((state.rpm * 0.0005 + state.temp * 0.01).toFixed(2));
                state.stitchCount += Math.floor(state.rpm / 60); // approx stitches per second
                state.health = Math.max(0, Math.min(100, state.health - (state.temp > 80 ? 1 : 0) + (state.temp < 70 ? 0.2 : 0)));
            } else {
                // ERROR state, shutting down
                state.rpm = 0;
                state.temp = Math.max(40, state.temp - 2);
                state.power = 0;
                state.throughput = 0;
            }

            // Derive state logic
            // IF temperature > 85 -> ERROR
            // IF queueLoad > 80 -> WARNING
            // IF healthScore > 90 -> RUNNING
            // ELSE -> RUNNING (or IDLE if rpm 0)
            
            let newStatus = 'RUNNING';
            let newAlert = null;
            let timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            if (state.temp > 85) {
                newStatus = 'ERROR';
                newAlert = {
                    entityType: 'machine',
                    machineId: m.id,
                    type: 'error',
                    message: `Critical temperature (${Math.round(state.temp)}°C). Automatic throttle reduction engaged.`
                };
            } else if (state.queue > 80) {
                newStatus = 'WARNING';
                newAlert = {
                    entityType: 'machine',
                    machineId: m.id,
                    type: 'warn',
                    message: `Queue overload detected (${Math.round(state.queue)} items).`
                };
            } else if (state.efficiency < 70) {
                newStatus = 'WARNING';
                newAlert = {
                    entityType: 'machine',
                    machineId: m.id,
                    type: 'warn',
                    message: `Efficiency drop detected (${Math.round(state.efficiency)}%).`
                };
            } else if (state.health > 90) {
                newStatus = 'RUNNING';
            } else if (state.rpm === 0) {
                newStatus = 'IDLE';
            }

            // Prepare DB records
            const telemetryEntry = {
                machineId: m.id,
                rpm: Math.round(state.rpm),
                temp: Number(state.temp.toFixed(1)),
                efficiency: Math.round(state.efficiency),
                stitchCount: state.stitchCount,
                queue: Math.round(state.queue),
                throughput: Math.round(state.throughput),
                power: state.power,
                health: Math.round(state.health),
                timestamp: now
            };
            
            telemetryLogsData.push(telemetryEntry);

            const logsPayload = [];

            if (newAlert) {
                // Limit alert spam (1 every few seconds per machine)
                if (!state.lastAlertTime || (now - state.lastAlertTime) > 10000) {
                    activityLogsData.push({
                        ...newAlert,
                        timestamp: now
                    });
                    state.lastAlertTime = now;
                    logsPayload.push({ time: timeString, message: newAlert.message, type: newAlert.type.toUpperCase() });
                }
            } else {
                // Regular telemetry log for the terminal
                logsPayload.push({
                    time: timeString,
                    message: `Telemetry sync: RPM ${Math.round(state.rpm)} | Temp ${Math.round(state.temp)}°C | Queue ${Math.round(state.queue)}`,
                    type: 'INFO'
                });
            }

            // Always send a telemetry entry to the socket
            socketPayload.push({
                machineId: m.id,
                status: newStatus,
                telemetry: telemetryEntry,
                newLogs: logsPayload
            });

            // If status changed, we update DB
            if (m.status !== newStatus) {
                machineUpdates.push(
                    prisma.machine.update({
                        where: { id: m.id },
                        data: { status: newStatus }
                    })
                );
            }
        }

        // Broadcast to clients immediately for real-time responsiveness
        if (io && io.engine.clientsCount > 0) {
            io.emit('telemetry_update', socketPayload);
        }

        // Use a transaction for DB writes
        const txOperations = [];
        
        if (telemetryLogsData.length > 0) {
            txOperations.push(prisma.telemetryLog.createMany({ data: telemetryLogsData }));
        }
        
        if (activityLogsData.length > 0) {
            txOperations.push(prisma.activityLog.createMany({ data: activityLogsData }));
        }
        
        txOperations.push(...machineUpdates);

        if (txOperations.length > 0) {
            await prisma.$transaction(txOperations);
        }

    } catch (err) {
        console.error("Telemetry Engine Error:", err);
    }
}
