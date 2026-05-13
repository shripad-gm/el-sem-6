import { prisma } from '../db.js';

export const getWorkers = async (req, res) => {
  try {
    const workers = await prisma.worker.findMany();
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
};

export const createWorker = async (req, res) => {
  try {
    const worker = await prisma.worker.create({
      data: req.body,
    });
    res.status(201).json(worker);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create worker' });
  }
};

export const updateWorker = async (req, res) => {
  try {
    const worker = await prisma.worker.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(worker);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update worker' });
  }
};

export const deleteWorker = async (req, res) => {
  try {
    await prisma.worker.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete worker' });
  }
};
