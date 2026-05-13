/** Garment factory workforce seed — MSME MES Staff module */

export const SHIFT_OPTIONS = [
  { id: 'morning', label: 'Morning Shift', window: '06:00–14:00' },
  { id: 'evening', label: 'Evening Shift', window: '14:00–22:00' },
  { id: 'night', label: 'Night Shift', window: '22:00–06:00' },
];

export const MACHINE_POOL = [
  { id: 'st-01', code: 'ST-01', name: 'Lockstitch Machine ST-01', line: 'Line 1', occupancy: 1 },
  { id: 'st-04', code: 'ST-04', name: 'Lockstitch Machine ST-04', line: 'Line 1', occupancy: 1 },
  { id: 'st-07', code: 'ST-07', name: 'Lockstitch Machine ST-07', line: 'Line 3', occupancy: 0 },
  { id: 'ol-02', code: 'OL-02', name: 'Overlock OL-02', line: 'Line 2', occupancy: 1 },
  { id: 'ol-05', code: 'OL-05', name: 'Overlock OL-05', line: 'Packing', occupancy: 0.5 },
  { id: 'fl-01', code: 'FL-01', name: 'Flatlock FL-01', line: 'Line 2', occupancy: 1 },
  { id: 'ct-03', code: 'CT-03', name: 'Cutting Station CT-03', line: 'Cut Floor', occupancy: 1 },
  { id: 'qc-01', code: 'QC-01', name: 'Quality Cell QC-01', line: 'QC', occupancy: 1 },
];

export const WORKFLOW_OPTIONS = [
  { id: 'wf-a', label: 'Workflow Line 1 — Cutting → Stitch' },
  { id: 'wf-b', label: 'Workflow Line 2 — Overlock → Flatlock' },
  { id: 'wf-c', label: 'Workflow Line 3 — Assembly' },
  { id: 'wf-pack', label: 'Packing & Finishing' },
  { id: 'wf-qc', label: 'QC & Rework Loop' },
];

export const DEPARTMENTS = ['Cutting', 'Sewing', 'Finishing', 'Packing', 'QC', 'Maintenance'];

export const ROLE_OPTIONS = [
  'Senior Operator',
  'Operator',
  'Line Feeder',
  'QC Inspector',
  'Packing Associate',
  'Maintenance Tech',
  'Supervisor',
];

function weekPattern(seed) {
  const out = [];
  for (let d = 0; d < 7; d++) {
    const r = (seed + d * 13) % 100;
    if (r < 78) out.push('present');
    else if (r < 88) out.push('late');
    else if (r < 93) out.push('half');
    else if (r < 97) out.push('leave');
    else out.push('absent');
  }
  return out;
}

export function buildSeedWorkers() {
  const rows = [
    {
      employeeId: 'EMP-2041',
      name: 'Priya Nair',
      role: 'Senior Operator',
      machineId: 'st-04',
      workflowId: 'wf-a',
      shiftId: 'morning',
      attendance: 'present',
      productivity: 94,
      baseSalary: 28500,
      department: 'Sewing',
      status: 'active',
      workload: 82,
      overtimeHours: 4,
      incentives: 1200,
      bonuses: 800,
      workstation: 'WS-A12',
      tools: 'Edge guide kit, needle pack B',
    },
    {
      employeeId: 'EMP-2088',
      name: 'Rahul Mehta',
      role: 'Operator',
      machineId: 'st-01',
      workflowId: 'wf-a',
      shiftId: 'morning',
      attendance: 'present',
      productivity: 88,
      baseSalary: 24200,
      department: 'Sewing',
      status: 'assigned',
      workload: 71,
      overtimeHours: 0,
      incentives: 400,
      bonuses: 0,
      workstation: 'WS-A09',
      tools: 'Standard presser foot',
    },
    {
      employeeId: 'EMP-2112',
      name: 'Ananya Das',
      role: 'Operator',
      machineId: null,
      workflowId: 'wf-c',
      shiftId: 'evening',
      attendance: 'present',
      productivity: 76,
      baseSalary: 23800,
      department: 'Sewing',
      status: 'unassigned',
      workload: 34,
      overtimeHours: 2,
      incentives: 0,
      bonuses: 0,
      workstation: '—',
      tools: 'Assigned at line',
    },
    {
      employeeId: 'EMP-2156',
      name: 'Vikram Singh',
      role: 'Line Feeder',
      machineId: 'ol-02',
      workflowId: 'wf-b',
      shiftId: 'evening',
      attendance: 'late',
      productivity: 81,
      baseSalary: 22100,
      department: 'Sewing',
      status: 'idle',
      workload: 45,
      overtimeHours: 0,
      incentives: 250,
      bonuses: 0,
      workstation: 'Feed-L2',
      tools: 'Trolley T-04',
    },
    {
      employeeId: 'EMP-2190',
      name: 'Kavita Iyer',
      role: 'QC Inspector',
      machineId: 'qc-01',
      workflowId: 'wf-qc',
      shiftId: 'morning',
      attendance: 'present',
      productivity: 97,
      baseSalary: 26800,
      department: 'QC',
      status: 'active',
      workload: 88,
      overtimeHours: 6,
      incentives: 900,
      bonuses: 1500,
      workstation: 'QC-Bay 1',
      tools: 'Spectrometer handheld',
    },
    {
      employeeId: 'EMP-2204',
      name: 'Suresh Patil',
      role: 'Operator',
      machineId: 'fl-01',
      workflowId: 'wf-b',
      shiftId: 'night',
      attendance: 'present',
      productivity: 91,
      baseSalary: 24400,
      department: 'Sewing',
      status: 'active',
      workload: 79,
      overtimeHours: 8,
      incentives: 600,
      bonuses: 400,
      workstation: 'WS-B04',
      tools: 'Binder attachment',
    },
    {
      employeeId: 'EMP-2218',
      name: 'Meera Joshi',
      role: 'Packing Associate',
      machineId: 'ol-05',
      workflowId: 'wf-pack',
      shiftId: 'morning',
      attendance: 'present',
      productivity: 86,
      baseSalary: 19800,
      department: 'Packing',
      status: 'assigned',
      workload: 62,
      overtimeHours: 0,
      incentives: 300,
      bonuses: 0,
      workstation: 'Pack-03',
      tools: 'Label gun, carton sealer',
    },
    {
      employeeId: 'EMP-2233',
      name: 'Arjun Reddy',
      role: 'Operator',
      machineId: 'st-07',
      workflowId: 'wf-c',
      shiftId: 'evening',
      attendance: 'absent',
      productivity: 0,
      baseSalary: 23600,
      department: 'Sewing',
      status: 'absent',
      workload: 0,
      overtimeHours: 0,
      incentives: 0,
      bonuses: 0,
      workstation: 'WS-C11',
      tools: '—',
    },
    {
      employeeId: 'EMP-2244',
      name: 'Fatima Noor',
      role: 'Senior Operator',
      machineId: 'ct-03',
      workflowId: 'wf-a',
      shiftId: 'morning',
      attendance: 'present',
      productivity: 93,
      baseSalary: 29200,
      department: 'Cutting',
      status: 'overloaded',
      workload: 96,
      overtimeHours: 10,
      incentives: 1400,
      bonuses: 2000,
      workstation: 'Cut-Alpha',
      tools: 'CAD marker, spreader S2',
    },
    {
      employeeId: 'EMP-2258',
      name: 'Deepak Verma',
      role: 'Maintenance Tech',
      machineId: null,
      workflowId: 'wf-a',
      shiftId: 'evening',
      attendance: 'present',
      productivity: 72,
      baseSalary: 26500,
      department: 'Maintenance',
      status: 'unassigned',
      workload: 58,
      overtimeHours: 3,
      incentives: 500,
      bonuses: 0,
      workstation: 'Roving',
      tools: 'Calibration kit M7',
    },
    {
      employeeId: 'EMP-2271',
      name: 'Sneha Kapoor',
      role: 'Supervisor',
      machineId: null,
      workflowId: 'wf-b',
      shiftId: 'morning',
      attendance: 'half',
      productivity: 68,
      baseSalary: 35200,
      department: 'Sewing',
      status: 'on_leave',
      workload: 40,
      overtimeHours: 0,
      incentives: 0,
      bonuses: 0,
      workstation: 'Supervisor pod',
      tools: 'MES tablet',
    },
    {
      employeeId: 'EMP-2284',
      name: 'Harish Nambiar',
      role: 'Operator',
      machineId: 'st-01',
      workflowId: 'wf-a',
      shiftId: 'night',
      attendance: 'overtime',
      productivity: 89,
      baseSalary: 23900,
      department: 'Sewing',
      status: 'active',
      workload: 84,
      overtimeHours: 12,
      incentives: 1100,
      bonuses: 600,
      workstation: 'WS-A09',
      tools: 'Shared station',
    },
    {
      employeeId: 'EMP-2299',
      name: 'Lakshmi Pillai',
      role: 'Packing Associate',
      machineId: 'ol-05',
      workflowId: 'wf-pack',
      shiftId: 'evening',
      attendance: 'leave',
      productivity: 0,
      baseSalary: 19600,
      department: 'Packing',
      status: 'on_leave',
      workload: 0,
      overtimeHours: 0,
      incentives: 0,
      bonuses: 0,
      workstation: 'Pack-01',
      tools: '—',
    },
    {
      employeeId: 'EMP-2310',
      name: 'Imran Qureshi',
      role: 'Operator',
      machineId: 'ol-02',
      workflowId: 'wf-b',
      shiftId: 'night',
      attendance: 'present',
      productivity: 84,
      baseSalary: 24100,
      department: 'Sewing',
      status: 'active',
      workload: 77,
      overtimeHours: 5,
      incentives: 450,
      bonuses: 0,
      workstation: 'WS-B02',
      tools: 'Looper tune kit',
    },
  ];

  return rows.map((w, i) => {
    const machine = w.machineId ? MACHINE_POOL.find((m) => m.id === w.machineId) : null;
    const wf = WORKFLOW_OPTIONS.find((x) => x.id === w.workflowId);
    const shift = SHIFT_OPTIONS.find((s) => s.id === w.shiftId);
    const attendanceHistory = weekPattern(i * 7 + 3);
    const recentActivity = [
      { t: '08:12', msg: 'Clock-in verified · geo-fence OK', type: 'ok' },
      { t: '09:40', msg: 'Style change Lot #4421 acknowledged', type: 'info' },
      { t: '11:05', msg: 'Throughput +6% vs shift target', type: 'ok' },
      { t: '12:18', msg: 'Micro-stop cleared · sensor reset', type: 'warn' },
    ];
    const deductions =
      w.attendance === 'absent' ? 800 : w.attendance === 'half' ? 400 : w.attendance === 'late' ? 150 : 0;
    const otPay = Math.round(w.overtimeHours * (w.baseSalary / 240) * 1.5);
    const totalPayable = w.baseSalary + otPay + w.incentives + w.bonuses - deductions;

    return {
      id: `worker-${i + 1}`,
      ...w,
      assignedMachine: machine ? machine.name : '—',
      assignedMachineCode: machine ? machine.code : '—',
      assignedWorkflow: wf?.label ?? '—',
      shiftLabel: shift?.label ?? '—',
      attendanceLabel: w.attendance.replace('_', ' '),
      attendanceDeductions: deductions,
      overtimePay: otPay,
      totalPayable,
      avatarHue: (i * 47) % 360,
      attendanceHistory,
      recentActivity,
      skillTags: ['Garment assembly', w.role === 'QC Inspector' ? 'AQL 2.5' : 'SMV pacing', 'MES handheld'].filter(
        Boolean
      ),
    };
  });
}

export function machineById(id) {
  return MACHINE_POOL.find((m) => m.id === id) ?? null;
}

export function recommendedStaffPerShift() {
  return { morning: 8, evening: 7, night: 5 };
}
