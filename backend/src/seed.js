import { prisma } from './db.js';
import { buildSeedOrders, buildSeedShipments } from './orderShipmentSeed.js';

async function main() {
  console.log('Seeding database...');

  // 1. Machines
  const m1 = await prisma.machine.upsert({
    where: { code: 'ST-01' },
    update: {},
    create: { code: 'ST-01', name: 'Lockstitch ST-01', type: 'lockstitch', line: 'Line 1', positionX: -6, positionZ: 0, status: 'RUNNING' }
  });

  const m2 = await prisma.machine.upsert({
    where: { code: 'OL-02' },
    update: {},
    create: { code: 'OL-02', name: 'Overlock OL-02', type: 'overlock', line: 'Line 2', positionX: 0, positionZ: 0, status: 'RUNNING' }
  });

  const m3 = await prisma.machine.upsert({
    where: { code: 'QC-01' },
    update: {},
    create: { code: 'QC-01', name: 'Quality Cell QC-01', type: 'quality_check', line: 'QC', positionX: 6, positionZ: 0, status: 'IDLE' }
  });

  // 2. Connections
  await prisma.connection.createMany({
    data: [
      { sourceMachineId: m1.id, targetMachineId: m2.id },
      { sourceMachineId: m2.id, targetMachineId: m3.id }
    ],
    skipDuplicates: true
  });

  // 3. Workers
  await prisma.worker.upsert({
    where: { employeeId: 'EMP-101' },
    update: {},
    create: {
      employeeId: 'EMP-101', name: 'Rahul Mehta', role: 'Operator', department: 'Sewing',
      shiftId: 'morning', workflowId: 'wf-a', machineId: m1.id,
      productivity: 88, baseSalary: 24200, status: 'assigned'
    }
  });

  await prisma.worker.upsert({
    where: { employeeId: 'EMP-102' },
    update: {},
    create: {
      employeeId: 'EMP-102', name: 'Priya Nair', role: 'QC Inspector', department: 'QC',
      shiftId: 'morning', workflowId: 'wf-qc', machineId: m3.id,
      productivity: 95, baseSalary: 28000, status: 'assigned'
    }
  });

  console.log('Seeding Orders & Shipments...');
  await prisma.shipment.deleteMany();
  await prisma.order.deleteMany();

  const orders = buildSeedOrders();
  const shipments = buildSeedShipments(orders);

  await prisma.order.createMany({ data: orders });
  await prisma.shipment.createMany({ data: shipments });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
