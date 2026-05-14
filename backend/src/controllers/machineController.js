import { prisma } from '../db.js';

export const getMachines = async (req, res) => {
  try {
    const machines = await prisma.machine.findMany();
    res.json(machines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch machines' });
  }
};

export const createMachine = async (req, res) => {
  try {
    const machine = await prisma.machine.create({
      data: req.body,
    });
    res.status(201).json(machine);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create machine' });
  }
};

export const updateMachine = async (req, res) => {
  try {
    const machine = await prisma.machine.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(machine);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update machine' });
  }
};

export const deleteMachine = async (req, res) => {
  try {
    await prisma.machine.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete machine' });
  }
};

import { resetMachineState } from '../services/telemetryEngine.js';

export const resolveMachine = async (req, res) => {
  try {
    const { id } = req.params;
    resetMachineState(id);
    const machine = await prisma.machine.update({
      where: { id },
      data: { status: 'RUNNING' },
    });
    res.json({ message: 'Machine resolved successfully', machine });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve machine' });
  }
};
