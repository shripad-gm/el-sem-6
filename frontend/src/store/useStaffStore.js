import { create } from 'zustand';
import { apiClient } from '../api/client';
import {
  machineById,
  MACHINE_POOL,
  SHIFT_OPTIONS,
  WORKFLOW_OPTIONS,
  DEPARTMENTS,
  ROLE_OPTIONS,
  recommendedStaffPerShift,
} from '../data/staffSeed';
import toast from 'react-hot-toast';

function enrichWorker(w) {
  const machine = w.machineId ? machineById(w.machineId) : null;
  const wf = WORKFLOW_OPTIONS.find((x) => x.id === w.workflowId);
  const shift = SHIFT_OPTIONS.find((s) => s.id === w.shiftId);
  const deductions =
    w.attendance === 'absent' ? 800 : w.attendance === 'half' ? 400 : w.attendance === 'late' ? 150 : 0;
  const otPay = Math.round(w.overtimeHours * (w.baseSalary / 240) * 1.5);
  const totalPayable = w.baseSalary + otPay + w.incentives + w.bonuses - deductions;
  return {
    ...w,
    assignedMachine: machine ? machine.name : '—',
    assignedMachineCode: machine ? machine.code : '—',
    assignedWorkflow: wf?.label ?? '—',
    shiftLabel: shift?.label ?? '—',
    attendanceLabel: String(w.attendance ?? '').replace(/_/g, ' '),
    attendanceDeductions: deductions,
    overtimePay: otPay,
    totalPayable,
    avatarHue: w.avatarHue ?? Math.floor(Math.random() * 360),
    attendanceHistory: w.attendanceHistory ?? ['present', 'present', 'present', 'present', 'present', 'leave', 'absent'],
    skillTags: w.skillTags ?? ['General Operator', 'Safety Certified'],
    recentActivity: w.recentActivity ?? [{ t: '08:00 AM', msg: 'System Check-in', type: 'ok' }],
  };
}

function recomputePayrollFields(w) {
  return enrichWorker(w);
}

export const useStaffStore = create((set, get) => ({
  workers: [],
  selectedWorkerId: null,
  draggedWorkerId: null,
  searchQuery: '',
  filterRole: 'all',
  filterShift: 'all',
  filterAttendance: 'all',
  filterMachine: 'all',
  filterProductivity: 'all',
  sortKey: 'name',
  sortDir: 'asc',
  page: 1,
  pageSize: 8,

  meta: {
    machinePool: MACHINE_POOL,
    shifts: SHIFT_OPTIONS,
    workflows: WORKFLOW_OPTIONS,
    departments: DEPARTMENTS,
    roles: ROLE_OPTIONS,
    shiftTargets: recommendedStaffPerShift(),
  },

  fetchWorkers: async () => {
    try {
      const res = await apiClient.get('/workers');
      const enriched = res.data.map(recomputePayrollFields);
      set({ workers: enriched });
    } catch (err) {
      console.error('Failed to fetch workers', err);
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q, page: 1 }),
  setFilterRole: (v) => set({ filterRole: v, page: 1 }),
  setFilterShift: (v) => set({ filterShift: v, page: 1 }),
  setFilterAttendance: (v) => set({ filterAttendance: v, page: 1 }),
  setFilterMachine: (v) => set({ filterMachine: v, page: 1 }),
  setFilterProductivity: (v) => set({ filterProductivity: v, page: 1 }),
  setSort: (key, dir) => set({ sortKey: key, sortDir: dir }),
  setPage: (p) => set({ page: p }),
  setPageSize: (n) => set({ pageSize: n, page: 1 }),

  selectWorker: (id) => set({ selectedWorkerId: id }),
  clearSelection: () => set({ selectedWorkerId: null }),
  setDraggedWorker: (id) => set({ draggedWorkerId: id }),

  patchWorker: async (id, patch) => {
    set((state) => ({
      workers: state.workers.map((w) => (w.id === id ? recomputePayrollFields({ ...w, ...patch }) : w)),
    }));
    try {
      await apiClient.put(`/workers/${id}`, patch);
    } catch (err) {
      console.error(err);
    }
  },

  createWorker: async (workerData) => {
    try {
      const res = await apiClient.post('/workers', workerData);
      set((state) => ({
        workers: [...state.workers, recomputePayrollFields(res.data)],
      }));
      toast.success(`${workerData.name} onboarded successfully`);
    } catch (err) {
      console.error('Failed to create worker', err);
      toast.error('Failed to add worker');
    }
  },

  deleteWorker: async (id) => {
    try {
      await apiClient.delete(`/workers/${id}`);
      set((state) => ({
        workers: state.workers.filter((w) => w.id !== id),
        selectedWorkerId: state.selectedWorkerId === id ? null : state.selectedWorkerId,
      }));
      toast.success('Worker record removed');
    } catch (err) {
      console.error('Failed to delete worker', err);
      toast.error('Failed to remove worker');
    }
  },

  assignMachine: (workerId, machineId) => {
    const prev = get().workers.find((w) => w.id === workerId);
    let status;
    if (machineId) {
      if (prev?.attendance === 'absent') status = 'absent';
      else if ((prev?.workload ?? 0) > 92) status = 'overloaded';
      else status = 'assigned';
    } else {
      status = 'unassigned';
    }
    get().patchWorker(workerId, {
      machineId: machineId || null,
      status,
    });
  },

  assignWorkflow: (workerId, workflowId) => {
    get().patchWorker(workerId, { workflowId });
  },

  assignShift: (workerId, shiftId) => {
    get().patchWorker(workerId, { shiftId });
  },

  assignDepartment: (workerId, department) => {
    get().patchWorker(workerId, { department });
  },

  setAttendance: (workerId, attendance) => {
    const w = get().workers.find((x) => x.id === workerId);
    let status = w?.status ?? 'active';
    if (attendance === 'absent') status = 'absent';
    else if (attendance === 'leave') status = 'on_leave';
    else if (attendance === 'half') status = 'on_leave';
    else if (['present', 'late', 'overtime'].includes(attendance)) {
      if (w?.machineId) status = (w?.workload ?? 0) > 92 ? 'overloaded' : 'assigned';
      else status = 'unassigned';
    }
    get().patchWorker(workerId, { attendance, status });
  },

  assignWorkerToMachineDrop: (workerId, machineId) => {
    get().assignMachine(workerId, machineId);
  },

  removeFromMachine: (workerId) => {
    get().assignMachine(workerId, null);
  },
}));

export function selectFilteredWorkers(state) {
  const {
    workers,
    searchQuery,
    filterRole,
    filterShift,
    filterAttendance,
    filterMachine,
    filterProductivity,
    sortKey,
    sortDir,
    page,
    pageSize,
  } = state;

  const q = searchQuery.trim().toLowerCase();
  let list = workers.filter((w) => {
    if (q && !(`${w.name} ${w.employeeId} ${w.role}`.toLowerCase().includes(q))) return false;
    if (filterRole !== 'all' && w.role !== filterRole) return false;
    if (filterShift !== 'all' && w.shiftId !== filterShift) return false;
    if (filterAttendance !== 'all' && w.attendance !== filterAttendance) return false;
    if (filterMachine !== 'all') {
      if (filterMachine === 'unassigned' && w.machineId) return false;
      if (filterMachine !== 'unassigned' && w.machineId !== filterMachine) return false;
    }
    if (filterProductivity !== 'all') {
      const p = w.productivity;
      if (filterProductivity === 'high' && p < 85) return false;
      if (filterProductivity === 'mid' && (p < 70 || p >= 85)) return false;
      if (filterProductivity === 'low' && p >= 70) return false;
    }
    return true;
  });

  const dir = sortDir === 'asc' ? 1 : -1;
  list = [...list].sort((a, b) => {
    let va, vb;
    switch (sortKey) {
      case 'productivity':
        va = a.productivity; vb = b.productivity; break;
      case 'salary':
        va = a.totalPayable; vb = b.totalPayable; break;
      case 'role':
        va = a.role; vb = b.role; break;
      case 'shift':
        va = a.shiftId; vb = b.shiftId; break;
      case 'status':
        va = a.status; vb = b.status; break;
      default:
        va = a.name; vb = b.name;
    }
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });

  const total = list.length;
  const start = (page - 1) * pageSize;
  const pageRows = list.slice(start, start + pageSize);
  return { pageRows, total, allFiltered: list };
}

export function computeWorkforceKpis(workers) {
  const total = workers.length;
  const active = workers.filter((w) => w.status === 'active' || w.status === 'assigned').length;
  const absent = workers.filter((w) => w.attendance === 'absent').length;
  const onLeave = workers.filter((w) => w.attendance === 'leave' || w.status === 'on_leave').length;
  const assigned = workers.filter((w) => w.machineId).length;
  const unassigned = workers.filter((w) => !w.machineId).length;
  const presentLike = workers.filter((w) =>
    ['present', 'late', 'half', 'overtime'].includes(w.attendance)
  ).length;
  const slots = MACHINE_POOL.length;
  const assignedPresent = workers.filter(
    (w) => w.machineId && w.attendance !== 'absent' && w.attendance !== 'leave'
  ).length;
  const utilization = total ? Math.round((assignedPresent / Math.max(total, 1)) * 100) : 0;
  const deficiency = Math.max(0, slots - assignedPresent);
  const excess = Math.max(0, assignedPresent - slots);
  const prodWorkers = workers.filter((w) => w.productivity > 0);
  const avgProd =
    prodWorkers.length > 0
      ? Math.round(prodWorkers.reduce((s, w) => s + w.productivity, 0) / prodWorkers.length)
      : 0;
  const monthlyPayroll = workers.reduce((s, w) => s + w.totalPayable, 0);
  const shiftEfficiency = Math.min(
    100,
    Math.round(
      (workers.filter((w) => w.shiftId === 'morning').length / 8 +
        workers.filter((w) => w.shiftId === 'evening').length / 7 +
        workers.filter((w) => w.shiftId === 'night').length / 5) *
      33
    )
  );

  return {
    total, active, absent, onLeave, assigned, unassigned,
    utilization: Math.min(100, utilization), deficiency, excess,
    avgProductivity: avgProd || 0, monthlyPayroll, shiftEfficiency, presentLike,
  };
}

export function computeMachineOccupancy(workers) {
  return MACHINE_POOL.map((m) => {
    const assigned = workers.filter((w) => w.machineId === m.id);
    return {
      ...m,
      assignedWorkers: assigned.map((w) => w.name),
      count: assigned.length,
    };
  });
}

export function computeInsights(workers, shiftTargets) {
  const insights = [];
  const line3 = workers.filter((w) => w.workflowId === 'wf-c');
  const line3Ops = line3.filter((w) => w.role === 'Operator' || w.role === 'Senior Operator');
  const need = 4 - line3Ops.filter((w) => w.machineId && w.attendance !== 'absent').length;
  if (need > 0) insights.push({ type: 'shortage', text: `Line 3 requires ${need} additional operator${need > 1 ? 's' : ''}.` });

  const pack = workers.filter((w) => w.workflowId === 'wf-pack');
  if (pack.length >= 4) insights.push({ type: 'excess', text: 'Packing section currently has excess workforce.' });

  const wfB = workers.filter((w) => w.workflowId === 'wf-b');
  const loads = wfB.map((w) => w.workload);
  if (loads.length && Math.max(...loads) - Math.min(...loads) > 35) {
    insights.push({ type: 'imbalance', text: 'Operator workload imbalance detected in Workflow B.' });
  }

  const st07 = workers.some((w) => w.machineId === 'st-07' && w.attendance !== 'absent');
  if (!st07) insights.push({ type: 'machine', text: 'Machine ST-07 currently has no assigned operator.' });

  const k = computeWorkforceKpis(workers);
  insights.push({ type: 'metric', text: `Current workforce utilization is ${k.utilization}%.` });

  ;['morning', 'evening', 'night'].forEach((sid) => {
    const c = workers.filter((w) => w.shiftId === sid && ['present', 'late', 'overtime'].includes(w.attendance)).length;
    const tgt = shiftTargets[sid] ?? 5;
    if (c < tgt * 0.6) {
      const label = SHIFT_OPTIONS.find((s) => s.id === sid)?.label ?? sid;
      insights.push({ type: 'shift', text: `${label} staffing is below recommended threshold.` });
    }
  });

  const overloaded = workers.filter((w) => w.status === 'overloaded' || w.workload > 92);
  overloaded.forEach((w) => {
    insights.push({ type: 'overload', text: `${w.name} flagged as overloaded (${w.workload}% load).` });
  });

  return insights.slice(0, 8);
}
