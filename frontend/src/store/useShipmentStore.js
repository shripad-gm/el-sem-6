import { create } from 'zustand';
import { CARRIERS, SHIPMENT_FLOW_STAGES } from '../data/orderShipmentSeed';
import { apiClient } from '../api/client';

function parseYmd(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function computeShipmentKpis(shipments) {
  const total = shipments.length;
  const pendingDispatch = shipments.filter((s) => s.status === 'preparing').length;
  const inTransit = shipments.filter((s) => s.status === 'in_transit').length;
  const delivered = shipments.filter((s) => s.status === 'delivered').length;
  const delayed = shipments.filter((s) => s.status === 'delayed').length;
  const dispatched = shipments.filter((s) => s.status === 'dispatched').length;
  const efficiency = Math.max(
    52,
    Math.min(98, Math.round(100 - delayed * 5.2 - pendingDispatch * 1.1 + delivered * 0.4))
  );
  const avgDeliveryDays = 3.2 + delayed * 0.35;
  const activeCarriers = new Set(shipments.map((s) => s.carrierId)).size;

  return {
    total,
    pendingDispatch,
    inTransit,
    delivered,
    delayed,
    dispatched,
    efficiency,
    avgDeliveryDays,
    activeCarriers,
  };
}

export function computeShipmentInsights(shipments) {
  const delayed = shipments.filter((s) => s.status === 'delayed');
  const packing = shipments.filter((s) => s.currentStage === 'Packing' && s.status === 'preparing').length;
  const regionB = shipments.filter((s) => s.destination.includes('Bengaluru') && s.etaRisk === 'medium');
  const lines = [];
  if (delayed[0]) {
    lines.push({ type: 'delay', text: `${delayed[0].shipmentId} delayed due to packing backlog.` });
  }
  lines.push({ type: 'queue', text: 'Dispatch queue overload detected on dock lane B.' });
  if (regionB.length) {
    lines.push({ type: 'region', text: 'Carrier delay risk detected for Region B (South cluster).' });
  }
  lines.push({ type: 'qc', text: '3 shipments waiting for QC approval before release.' });
  if (packing >= 2) {
    lines.push({ type: 'ops', text: `${packing} cartons staged — stretch wrap capacity tight.` });
  }
  return lines.slice(0, 6);
}

export function selectFilteredShipments({
  shipments,
  searchQuery,
  filterStatus,
  filterCarrier,
  sortKey,
  sortDir,
  page,
  pageSize,
}) {
  const q = searchQuery.trim().toLowerCase();
  let list = shipments.filter((s) => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (filterCarrier !== 'all' && s.carrierId !== filterCarrier) return false;
    if (!q) return true;
    return (
      s.shipmentId.toLowerCase().includes(q) ||
      s.orderId.toLowerCase().includes(q) ||
      s.trackingNumber.toLowerCase().includes(q) ||
      s.destination.toLowerCase().includes(q)
    );
  });

  const dir = sortDir === 'asc' ? 1 : -1;
  list = [...list].sort((a, b) => {
    let va;
    let vb;
    switch (sortKey) {
      case 'dispatch':
        va = parseYmd(a.dispatchDate).getTime();
        vb = parseYmd(b.dispatchDate).getTime();
        break;
      case 'expected':
        va = parseYmd(a.expectedDelivery).getTime();
        vb = parseYmd(b.expectedDelivery).getTime();
        break;
      case 'shipmentId':
        va = a.shipmentId;
        vb = b.shipmentId;
        return dir * String(va).localeCompare(String(vb));
      default:
        va = a.orderId;
        vb = b.orderId;
        return dir * String(va).localeCompare(String(vb));
    }
    if (va === vb) return 0;
    return va > vb ? dir : -dir;
  });

  const total = list.length;
  const start = (page - 1) * pageSize;
  const pageRows = list.slice(start, start + pageSize);
  return { pageRows, total };
}

export const useShipmentStore = create((set) => ({
  shipments: [],
  selectedShipmentId: null,
  searchQuery: '',
  filterStatus: 'all',
  filterCarrier: 'all',
  sortKey: 'expected',
  sortDir: 'asc',
  page: 1,
  pageSize: 8,

  meta: {
    carriers: CARRIERS,
    statuses: ['preparing', 'dispatched', 'in_transit', 'delayed', 'delivered'],
    flow: SHIPMENT_FLOW_STAGES,
  },

  fetchShipments: async () => {
    try {
      const res = await apiClient.get('/shipments');
      set({ shipments: res.data });
    } catch(err) {
      console.error('Failed to fetch shipments:', err);
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q, page: 1 }),
  setFilterStatus: (v) => set({ filterStatus: v, page: 1 }),
  setFilterCarrier: (v) => set({ filterCarrier: v, page: 1 }),
  setSort: (key, dir) => set({ sortKey: key, sortDir: dir }),
  setPage: (p) => set({ page: p }),

  selectShipment: (id) => set({ selectedShipmentId: id }),
  clearSelection: () => set({ selectedShipmentId: null }),
}));
