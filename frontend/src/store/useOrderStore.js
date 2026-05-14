import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { WORKFLOW_LINES, SUPERVISORS, ORDER_STAGES } from '../data/orderShipmentSeed';
import { apiClient } from '../api/client';
import { useShipmentStore } from './useShipmentStore';

function parseYmd(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(a, b) {
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function computeOrderKpis(orders) {
  const total = orders.length;
  const active = orders.filter((o) => o.status === 'in_progress').length;
  const delayed = orders.filter((o) => o.status === 'delayed').length;
  const completed = orders.filter((o) => o.status === 'completed').length;
  const pending = orders.filter((o) => o.status === 'pending').length;
  const shipped = orders.filter((o) => o.status === 'shipped').length;
  const now = new Date();
  const nearDeadline = orders.filter((o) => {
    if (['completed', 'shipped'].includes(o.status)) return false;
    const dl = parseYmd(o.deadline);
    const diff = daysBetween(now, dl);
    return diff >= 0 && diff <= 3;
  }).length;
  const totalQty = orders.reduce((s, o) => s + o.quantity, 0);
  const bottleneckCount = orders.filter((o) => o.stages?.some((st) => st.bottleneck)).length;
  const avgCompletion = total
    ? Math.round(orders.reduce((s, o) => s + o.completionPct, 0) / total)
    : 0;
  const efficiency = Math.min(99, Math.round(avgCompletion * 0.92 + (active > 4 ? -4 : 6)));
  const avgCycleDays = 5.2 + (delayed > 2 ? 1.4 : 0);

  return {
    total,
    active,
    delayed,
    completed,
    pending,
    shipped,
    nearDeadline,
    totalQty,
    bottleneckCount,
    avgCompletion,
    efficiency,
    avgCycleDays,
  };
}

export function computeOrderInsights(orders) {
  const delayed = orders.filter((o) => o.status === 'delayed');
  const wl2 = orders.filter((o) => o.workflowId === 'wl-2' && o.status === 'in_progress').length;
  const packingSlow = orders.filter(
    (o) => !['completed', 'shipped'].includes(o.status) && o.currentStage === 'Packing' && o.completionPct < 88
  ).length;
  const lines = [];
  if (delayed[0]) {
    lines.push({
      type: 'risk',
      text: `${delayed[0].orderId} may miss deadline due to ${delayed[0].stages?.find((s) => s.bottleneck)?.name ?? 'QC'} bottleneck.`,
    });
  }
  if (wl2 >= 3) {
    lines.push({
      type: 'overload',
      text: 'Workflow Line 2 overloaded for current order volume.',
    });
  }
  if (packingSlow >= 2) {
    lines.push({ type: 'logistics', text: 'Packing section slowing shipment readiness.' });
  }
  lines.push({
    type: 'metric',
    text: `Production efficiency ${delayed.length > 2 ? 'dropped 12%' : 'stable'} vs yesterday baseline.`,
  });
  const near = orders.filter((o) => o.delayRisk === 'high' && o.status === 'in_progress');
  if (near[0]) {
    lines.push({
      type: 'risk',
      text: `${near[0].orderId} delay risk elevated — supervisor ${near[0].supervisor} notified.`,
    });
  }
  return lines.slice(0, 6);
}

export function selectFilteredOrders({
  orders,
  searchQuery,
  filterStatus,
  filterPriority,
  filterWorkflow,
  sortKey,
  sortDir,
  page,
  pageSize,
}) {
  const q = searchQuery.trim().toLowerCase();
  let list = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (filterPriority !== 'all' && o.priority !== filterPriority) return false;
    if (filterWorkflow !== 'all' && o.workflowId !== filterWorkflow) return false;
    if (!q) return true;
    return (
      o.orderId.toLowerCase().includes(q) ||
      o.productName.toLowerCase().includes(q) ||
      o.supervisor.toLowerCase().includes(q) ||
      o.assignedWorkflow.toLowerCase().includes(q)
    );
  });

  const dir = sortDir === 'asc' ? 1 : -1;
  list = [...list].sort((a, b) => {
    let va;
    let vb;
    switch (sortKey) {
      case 'deadline':
        va = parseYmd(a.deadline).getTime();
        vb = parseYmd(b.deadline).getTime();
        break;
      case 'completion':
        va = a.completionPct;
        vb = b.completionPct;
        break;
      case 'quantity':
        va = a.quantity;
        vb = b.quantity;
        break;
      case 'orderId':
        va = a.orderId;
        vb = b.orderId;
        return dir * String(va).localeCompare(String(vb));
      default:
        va = a.productName;
        vb = b.productName;
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

export const useOrderStore = create((set, get) => ({
  orders: [],
  selectedOrderId: null,
  searchQuery: '',
  filterStatus: 'all',
  filterPriority: 'all',
  filterWorkflow: 'all',
  sortKey: 'deadline',
  sortDir: 'asc',
  page: 1,
  pageSize: 8,
  createOpen: false,

  meta: {
    workflows: WORKFLOW_LINES,
    supervisors: SUPERVISORS,
    statuses: ['pending', 'in_progress', 'delayed', 'completed', 'shipped'],
    priorities: ['low', 'medium', 'high', 'critical'],
  },

  fetchOrders: async () => {
    try {
      const res = await apiClient.get('/orders');
      set({ orders: res.data });
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q, page: 1 }),
  setFilterStatus: (v) => set({ filterStatus: v, page: 1 }),
  setFilterPriority: (v) => set({ filterPriority: v, page: 1 }),
  setFilterWorkflow: (v) => set({ filterWorkflow: v, page: 1 }),
  setSort: (key, dir) => set({ sortKey: key, sortDir: dir }),
  setPage: (p) => set({ page: p }),
  setCreateOpen: (open) => set({ createOpen: open }),

  selectOrder: (id) => set({ selectedOrderId: id }),
  clearSelection: () => set({ selectedOrderId: null }),

  addOrder: async (payload) => {
    const wf = WORKFLOW_LINES.find((w) => w.id === payload.workflowId) ?? WORKFLOW_LINES[0];
    const deadline = payload.deadline;
    const quantity = Number(payload.quantity) || 500;
    const id = uuidv4();
    const num = 400 + Math.floor(Math.random() * 900);
    const completionPct = 0;
    const stages = ORDER_STAGES.map((name, i) => ({
      name,
      state: i === 0 ? 'active' : 'pending',
      delayed: false,
      bottleneck: false,
    }));

    const newOrder = {
      id,
      orderId: `ORD-${num}`,
      productName: payload.productName || 'New production style',
      quantity,
      assignedWorkflow: wf.label,
      workflowId: wf.id,
      status: 'pending',
      deadline,
      completionPct,
      priority: payload.priority || 'medium',
      supervisor: payload.supervisor || SUPERVISORS[0],
      currentStage: 'Cutting',
      estimatedCompletion: deadline,
      bottleneck: 'Line balancing in progress',
      stages,
      machines: ['CUT-TBD', 'ST-TBD'],
      workers: [],
      timeline: [{ t: 'now', label: 'Order created · routing to cutting', ok: true }],
      shipmentReadyPct: 0,
      delayRisk: 'low',
      sku: payload.sku || `GF-${2100 + Math.floor(Math.random() * 200)}`,
      fabric: payload.fabric || 'Assigned at tech pack review',
      poRef: payload.poRef || `PO-MSME-${3200 + Math.floor(Math.random() * 400)}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    // Optimistic update
    set((s) => ({ orders: [newOrder, ...s.orders], createOpen: false, page: 1 }));

    try {
      const res = await apiClient.post('/orders', newOrder);
      // Replace temp ID with actual ID if the DB generated it, though we supply it.
      set((s) => ({
        orders: s.orders.map(o => o.id === id ? res.data : o)
      }));

      // Trigger a refetch of shipments so the auto-generated shipment appears in the UI
      useShipmentStore.getState().fetchShipments();
    } catch (err) {
      console.error(err);
      // Revert if error
      set((s) => ({ orders: s.orders.filter(o => o.id !== id) }));
    }
  },

  setPriority: async (orderId, priority) => {
    // Optimistic update
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, priority } : o)),
    }));

    try {
      await apiClient.put(`/orders/${orderId}`, { priority });
    } catch (err) {
      console.error(err);
    }
  },
}));
