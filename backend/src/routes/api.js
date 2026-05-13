import express from 'express';
import { getMachines, createMachine, updateMachine, deleteMachine } from '../controllers/machineController.js';
import { getWorkers, createWorker, updateWorker, deleteWorker } from '../controllers/workerController.js';
import { getConnections, createConnection, deleteConnection } from '../controllers/connectionController.js';

const router = express.Router();

// Machines
router.get('/machines', getMachines);
router.post('/machines', createMachine);
router.put('/machines/:id', updateMachine);
router.delete('/machines/:id', deleteMachine);

// Workers
router.get('/workers', getWorkers);
router.post('/workers', createWorker);
router.put('/workers/:id', updateWorker);
router.delete('/workers/:id', deleteWorker);

// Connections
router.get('/connections', getConnections);
router.post('/connections', createConnection);
router.delete('/connections/:id', deleteConnection);

export default router;
