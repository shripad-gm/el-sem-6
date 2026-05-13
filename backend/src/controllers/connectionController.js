import { prisma } from '../db.js';

export const getConnections = async (req, res) => {
  try {
    const connections = await prisma.connection.findMany();
    res.json(connections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
};

export const createConnection = async (req, res) => {
  try {
    const connection = await prisma.connection.create({
      data: req.body,
    });
    res.status(201).json(connection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create connection' });
  }
};

export const deleteConnection = async (req, res) => {
  try {
    await prisma.connection.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete connection' });
  }
};
