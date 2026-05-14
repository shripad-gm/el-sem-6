import { prisma } from '../db.js';

export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { shipments: true }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const order = await prisma.order.create({
      data: req.body,
    });

    const shipmentNum = Math.floor(1000 + Math.random() * 9000);
    const shipmentId = `SHP-${shipmentNum}`;

    await prisma.shipment.create({
      data: {
        shipmentId: shipmentId,
        orderId: order.orderId,
        orderProduct: order.productName,
        trackingNumber: `TRK-PENDING-${shipmentNum}`,
        carrier: 'Pending Assignment',
        carrierId: 'c-tbd',
        carrierRegion: 'TBD',
        status: 'preparing',
        priority: order.priority || 'medium',
        etaRisk: 'low',
        dispatchDate: 'TBD',
        expectedDelivery: 'TBD',
        destination: 'Pending destination',
        packageCount: 0,
        weightKg: '0',
        currentStage: 'Packing',
        stages: [
          { name: 'Order processed', state: 'active', time: 'Just now' },
          { name: 'Dispatched', state: 'pending', time: '—' },
          { name: 'In transit', state: 'pending', time: '—' },
          { name: 'Out for delivery', state: 'pending', time: '—' },
          { name: 'Delivered', state: 'pending', time: '—' }
        ],
        logs: [
          { t: new Date().toISOString().slice(0, 10), msg: `Shipment record auto-created for ${order.orderId}` }
        ]
      }
    });

    const orderWithShipments = await prisma.order.findUnique({
      where: { id: order.id },
      include: { shipments: true }
    });

    res.status(201).json(orderWithShipments);
  } catch (error) {
    console.error('Failed to create order and shipment:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
};
