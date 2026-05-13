import { AnimatePresence, motion } from 'framer-motion';
import { X, Activity, Cpu, Clock, Wallet, Zap } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { STATUS_STYLES, statusLabel, formatInr } from './staffUiUtils';
import { useStaffStore } from '../../store/useStaffStore';

const ATT_LABEL = {
  present: 'Present',
  absent: 'Absent',
  leave: 'Leave',
  late: 'Late Check-in',
  half: 'Half Day',
  overtime: 'Overtime',
};

export function WorkerDetailPanel() {
  const selectedId = useStaffStore((s) => s.selectedWorkerId);
  const clear = useStaffStore((s) => s.clearSelection);
  const worker = useStaffStore((s) => s.workers.find((w) => w.id === selectedId));

  return (
    <AnimatePresence>
      {selectedId && worker && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:bg-black/40"
            aria-label="Close panel"
            onClick={clear}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed top-0 right-0 z-[70] h-full w-full max-w-md border-l border-white/10 bg-industrial-bg/95 backdrop-blur-xl shadow-[-20px_0_80px_rgba(0,0,0,0.65)] flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-14 h-14 rounded-2xl border border-white/15 shrink-0 flex items-center justify-center text-lg font-bold text-white shadow-[0_0_30px_rgba(0,242,255,0.15)]"
                  style={{
                    background: `linear-gradient(135deg, hsla(${worker.avatarHue},70%,45%,0.5), rgba(0,0,0,0.5))`,
                  }}
                >
                  {worker.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono text-brand-primary/90">{worker.employeeId}</p>
                  <h3 className="text-lg font-bold text-white truncate">{worker.name}</h3>
                  <span
                    className={`inline-flex mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${STATUS_STYLES[worker.status] ?? STATUS_STYLES.idle}`}
                  >
                    {statusLabel(worker.status)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={clear}
                className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-brand-primary/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              <GlassPanel className="p-4 border border-white/10 space-y-3">
                <Row icon={Activity} label="Role" value={worker.role} />
                <Row icon={Clock} label="Shift" value={worker.shiftLabel} />
                <Row icon={Cpu} label="Department" value={worker.department} />
                <Row icon={Cpu} label="Assigned machine" value={worker.assignedMachine} />
                <Row icon={Activity} label="Production workflow" value={worker.assignedWorkflow} />
                <Row icon={Clock} label="Attendance today" value={ATT_LABEL[worker.attendance] ?? worker.attendance} />
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3">Productivity pulse</p>
                <div className="flex items-end gap-1 h-24">
                  {[62, 70, 68, 74, 80, 85, worker.productivity].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.min(100, h)}%` }}
                      transition={{ delay: 0.04 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-secondary/40 to-brand-primary/90"
                    />
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-[10px] text-white/35 font-mono">
                  <span>-6d</span>
                  <span className="text-brand-primary">Now · {worker.productivity}%</span>
                </div>
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Workload & task</p>
                <div>
                  <div className="flex justify-between text-[11px] text-white/60 mb-1">
                    <span>Load index</span>
                    <span className="font-mono text-brand-primary">{worker.workload}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-brand-secondary via-brand-primary to-status-running"
                      initial={{ width: 0 }}
                      animate={{ width: `${worker.workload}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-white/55 leading-relaxed">
                  Current allocation: <span className="text-white/85">{worker.assignedWorkflow}</span> · workstation{' '}
                  <span className="font-mono text-white/80">{worker.workstation}</span>
                </p>
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-2">Attendance history</p>
                <div className="flex gap-1">
                  {worker.attendanceHistory.map((a, i) => (
                    <div
                      key={i}
                      title={a}
                      className={`flex-1 h-8 rounded-md border text-[9px] font-bold uppercase flex items-center justify-center ${
                        a === 'present'
                          ? 'bg-status-running/15 border-status-running/30 text-status-running'
                          : a === 'absent'
                            ? 'bg-status-error/15 border-status-error/30 text-status-error'
                            : a === 'leave'
                              ? 'bg-brand-secondary/15 border-brand-secondary/35 text-brand-secondary'
                              : 'bg-white/5 border-white/10 text-white/45'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-white/35 mt-2">Mon → Sun heat strip (simulated)</p>
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Salary & overtime</p>
                <MoneyRow label="Base salary" value={worker.baseSalary} />
                <MoneyRow label="Overtime pay" value={worker.overtimePay} accent />
                <MoneyRow label="Attendance deductions" value={-worker.attendanceDeductions} warn />
                <MoneyRow label="Incentives" value={worker.incentives} />
                <MoneyRow label="Bonuses" value={worker.bonuses} />
                <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-brand-primary" /> Total payable
                  </span>
                  <span className="text-sm font-bold text-brand-primary font-mono">{formatInr(worker.totalPayable)}</span>
                </div>
                <p className="text-[10px] text-white/40">OT hours logged: {worker.overtimeHours}h @ 1.5× blended rate</p>
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-2">Skill compatibility</p>
                <div className="flex flex-wrap gap-1.5">
                  {worker.skillTags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-1 rounded-md border border-brand-primary/25 bg-brand-primary/5 text-brand-primary/90">
                      {t}
                    </span>
                  ))}
                </div>
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-2">Recent activity</p>
                <ul className="space-y-2">
                  {worker.recentActivity.map((r, idx) => (
                    <li key={idx} className="flex gap-2 text-[11px]">
                      <Zap
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          r.type === 'ok' ? 'text-status-running' : r.type === 'warn' ? 'text-status-warning' : 'text-brand-primary'
                        }`}
                      />
                      <div>
                        <span className="font-mono text-white/35 text-[10px]">{r.t}</span>
                        <p className="text-white/65 leading-snug">{r.msg}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-2">Resources</p>
                <ul className="text-[11px] text-white/60 space-y-1.5">
                  <li>
                    Machine: <span className="text-white/85">{worker.assignedMachine}</span>
                  </li>
                  <li>
                    Workstation: <span className="font-mono text-white/85">{worker.workstation}</span>
                  </li>
                  <li>
                    Tools / kits: <span className="text-white/85">{worker.tools}</span>
                  </li>
                  <li>
                    Line section: <span className="text-white/85">{worker.assignedWorkflow}</span>
                  </li>
                </ul>
              </GlassPanel>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-brand-primary/70 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[9px] uppercase font-bold tracking-wider text-white/35">{label}</p>
        <p className="text-sm text-white/85 leading-snug">{value}</p>
      </div>
    </div>
  );
}

function MoneyRow({ label, value, accent, warn }) {
  const cls = warn && value < 0 ? 'text-status-error' : accent ? 'text-status-running' : 'text-white/75';
  return (
    <div className="flex justify-between text-[11px]">
      <span className="text-white/45">{label}</span>
      <span className={`font-mono font-semibold ${cls}`}>{formatInr(value)}</span>
    </div>
  );
}
