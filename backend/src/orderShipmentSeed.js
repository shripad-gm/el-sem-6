import { v4 as uuidv4 } from 'uuid';

export const ORDER_STAGES = [
  'Cutting',
  'Stitching',
  'Overlock',
  'QC',
  'Ironing',
  'Packing',
  'Shipment',
];

export const SHIPMENT_FLOW_STAGES = [
  'Packing',
  'Ready for Dispatch',
  'Dispatched',
  'In Transit',
  'Delivered',
];

export const WORKFLOW_LINES = [
  { id: 'wl-1', label: 'Workflow Line 1 · Denim' },
  { id: 'wl-2', label: 'Workflow Line 2 · Knits' },
  { id: 'wl-3', label: 'Workflow Line 3 · Outerwear' },
  { id: 'wl-4', label: 'Workflow Line 4 · Premium Finish' },
];

export const SUPERVISORS = ['A. Menon', 'R. Kapoor', 'S. Iyer', 'P. Das', 'K. Nair', 'V. Bose'];

export const CARRIERS = [
  { id: 'c-bluedart', name: 'BlueDart Express', region: 'Pan-India' },
  { id: 'c-dtdc', name: 'DTDC Surface', region: 'South & West' },
  { id: 'c-delhivery', name: 'Delhivery Freight', region: 'North' },
  { id: 'c-fedex', name: 'FedEx Priority', region: 'Metro hubs' },
  { id: 'c-ecom', name: 'Ecom Express', region: 'Tier-2/3' },
];

const PRODUCTS = [
  'Merino Crew Tee — SS26',
  'Relaxed Fit Chino — Stone',
  'Performance Polo — Graphite',
  'Heritage Oxford Shirt',
  'Technical Shell Jacket',
  'Linen Blend Kurta Set',
  'Athletic Jogger — Night Ops',
  'Tailored Blazer — Charcoal',
];

const DESTINATIONS = [
  'Bengaluru DC · Karnataka',
  'Mumbai Hub · Maharashtra',
  'Delhi NCR · Uttar Pradesh',
  'Hyderabad FTZ · Telangana',
  'Chennai Port Lane · Tamil Nadu',
  'Kolkata East Gate · West Bengal',
];

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function stageIndexFromCompletion(pct) {
  const step = 100 / (ORDER_STAGES.length - 1);
  return Math.min(ORDER_STAGES.length - 1, Math.floor(pct / step));
}

function buildStages(order, completionPct, bottleneckStage) {
  const activeIdx = stageIndexFromCompletion(completionPct);
  return ORDER_STAGES.map((name, i) => {
    let state = 'pending';
    if (completionPct >= 100) state = 'done';
    else if (i < activeIdx) state = 'done';
    else if (i === activeIdx) state = 'active';
    const delayed = state === 'active' && order.status === 'delayed';
    const bottleneck = name === bottleneckStage;
    return { name, state, delayed, bottleneck };
  });
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const ORDER_STATUSES = ['pending', 'in_progress', 'delayed', 'completed', 'shipped'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export function buildSeedOrders() {
  const rows = [];
  for (let i = 0; i < 28; i++) {
    const id = uuidv4();
    const num = 100 + i;
    const productName = PRODUCTS[i % PRODUCTS.length];
    const quantity = 420 + (i % 7) * 180 + (i % 3) * 95;
    const wf = WORKFLOW_LINES[i % WORKFLOW_LINES.length];
    const status = ORDER_STATUSES[i % ORDER_STATUSES.length];
    const priority = PRIORITIES[i % PRIORITIES.length];
    const completionPct =
      status === 'completed' || status === 'shipped'
        ? 100
        : status === 'pending'
          ? 0 + (i % 4) * 3
          : status === 'delayed'
            ? 38 + (i % 5) * 9
            : 22 + (i % 8) * 9;
    const bottleneckStage =
      status === 'delayed' ? randomPick(['QC', 'Stitching', 'Packing', 'Overlock']) : i % 11 === 0 ? 'QC' : null;
    const deadline = daysFromNow(status === 'delayed' ? -2 + (i % 3) : 3 + (i % 9));
    const est = daysFromNow(status === 'delayed' ? 5 + (i % 4) : 1 + (i % 6));
    const supervisor = SUPERVISORS[i % SUPERVISORS.length];
    const stages = buildStages({ status }, completionPct, bottleneckStage);
    const currentStage = stages.find((s) => s.state === 'active')?.name ?? (completionPct >= 100 ? 'Shipment' : 'Cutting');
    const machines =
      i % 2 === 0
        ? ['CUT-A12', 'ST-04', 'OL-07']
        : ['CUT-B03', 'ST-11', 'OL-02', 'QC-X1'];
    const workers = ['Riya S.', 'Imran K.', 'Neha P.', 'Vikram L.'].slice(0, 2 + (i % 3));
    const timeline = [
      { t: '06:10', label: 'Cut lots released', ok: true },
      { t: '09:40', label: 'Stitching WIP synced', ok: true },
      { t: '12:05', label: 'QC hold sample flagged', ok: status === 'delayed' },
      { t: '15:20', label: 'Packing queue depth alert', ok: status !== 'delayed' },
    ];
    const shipmentReadyPct = Math.min(100, Math.round(completionPct * 0.92 + (i % 5)));
    const delayRisk =
      status === 'delayed' ? 'high' : completionPct > 78 && deadline < daysFromNow(2) ? 'medium' : 'low';

    rows.push({
      id,
      orderId: `ORD-${num}`,
      productName,
      quantity,
      assignedWorkflow: wf.label,
      workflowId: wf.id,
      status,
      deadline,
      completionPct,
      priority,
      supervisor,
      currentStage,
      estimatedCompletion: est,
      bottleneck: bottleneckStage ? `${bottleneckStage} constraint · WIP elevated` : 'No hard bottleneck',
      stages,
      machines,
      workers,
      timeline,
      shipmentReadyPct,
      delayRisk,
      sku: `GF-${(2000 + i).toString()}`,
      fabric: i % 3 === 0 ? 'Cotton twill 240 GSM' : i % 3 === 1 ? 'Merino blend 180 GSM' : 'Recycled poly shell',
      poRef: `PO-MSME-${2600 + i}`,
      createdAt: daysFromNow(-12 - (i % 8)),
    });
  }
  return rows;
}

export function buildSeedShipments(orders) {
  const list = [];
  const shippedOrDone = orders.filter((o) => o.status === 'shipped' || o.status === 'completed');
  const anyOrders = orders;

  for (let i = 0; i < 22; i++) {
    const id = uuidv4();
    const num = 200 + i;
    const order = (shippedOrDone[i % shippedOrDone.length] || anyOrders[i % anyOrders.length]);
    const carrier = CARRIERS[i % CARRIERS.length];
    const statuses = ['preparing', 'dispatched', 'in_transit', 'delayed', 'delivered'];
    const status = statuses[i % statuses.length];
    const dispatch = daysFromNow(status === 'delivered' ? -5 - (i % 4) : -1 + (i % 3));
    const expected = daysFromNow(
      status === 'delayed' ? 4 + (i % 3) : status === 'delivered' ? -3 : 2 + (i % 5)
    );
    const flowIdx =
      status === 'delivered'
        ? 4
        : status === 'in_transit'
          ? 3
          : status === 'dispatched'
            ? 2
            : status === 'delayed'
              ? 1
              : i % 4 === 0
                ? 0
                : 1;
    const stages = SHIPMENT_FLOW_STAGES.map((name, idx) => {
      let state = 'pending';
      if (idx < flowIdx) state = 'done';
      else if (idx === flowIdx) state = 'active';
      const delayed = status === 'delayed' && idx === flowIdx;
      return { name, state, delayed };
    });
    const logs = [
      { t: `${dispatch} 08:12`, msg: 'Carton manifest verified · RFID applied' },
      { t: `${dispatch} 10:40`, msg: 'Carrier pickup scheduled' },
      { t: `${dispatch} 14:05`, msg: status === 'delayed' ? 'Dispatch bay congestion · hold' : 'Released to dock lane B' },
    ];
    list.push({
      id,
      shipmentId: `SH-${num}`,
      orderId: order.orderId,
      orderProduct: order.productName,
      carrier: carrier.name,
      carrierId: carrier.id,
      carrierRegion: carrier.region,
      dispatchDate: dispatch,
      expectedDelivery: expected,
      status,
      destination: DESTINATIONS[i % DESTINATIONS.length],
      trackingNumber: `TRK-IN-${880000 + i * 137}`,
      priority: PRIORITIES[i % PRIORITIES.length],
      stages,
      logs,
      packageCount: 6 + (i % 8),
      weightKg: (12.4 + (i % 5) * 3.1).toFixed(1),
      etaRisk: status === 'delayed' ? 'high' : i % 7 === 0 ? 'medium' : 'low',
      currentStage: stages.find((s) => s.state === 'active')?.name ?? SHIPMENT_FLOW_STAGES[flowIdx],
    });
  }
  return list;
}
