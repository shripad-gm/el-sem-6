import express from 'express';
import { getMachines, createMachine, updateMachine, deleteMachine, resolveMachine } from '../controllers/machineController.js';
import { getWorkers, createWorker, updateWorker, deleteWorker } from '../controllers/workerController.js';
import { getConnections, createConnection, deleteConnection } from '../controllers/connectionController.js';
import { getOrders, createOrder, updateOrder } from '../controllers/orderController.js';
import { getShipments, createShipment, updateShipment } from '../controllers/shipmentController.js';

const router = express.Router();

// Machines
router.get('/machines', getMachines);
router.post('/machines', createMachine);
router.put('/machines/:id', updateMachine);
router.delete('/machines/:id', deleteMachine);
router.post('/machines/:id/resolve', resolveMachine);

// Workers
router.get('/workers', getWorkers);
router.post('/workers', createWorker);
router.put('/workers/:id', updateWorker);
router.delete('/workers/:id', deleteWorker);

// Connections
router.get('/connections', getConnections);
router.post('/connections', createConnection);
router.delete('/connections/:id', deleteConnection);

// Orders
router.get('/orders', getOrders);
router.post('/orders', createOrder);
router.put('/orders/:id', updateOrder);

// Shipments
router.get('/shipments', getShipments);
router.post('/shipments', createShipment);
router.put('/shipments/:id', updateShipment);

export default router;
