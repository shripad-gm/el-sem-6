import { prisma } from '../db.js';

export const getShipments = async (req, res) => {
  try {
    const shipments = await prisma.shipment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
};

export const createShipment = async (req, res) => {
  try {
    const shipment = await prisma.shipment.create({
      data: req.body,
    });
    res.status(201).json(shipment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shipment' });
  }
};

export const updateShipment = async (req, res) => {
  try {
    const shipment = await prisma.shipment.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update shipment' });
  }
};
