import { useMemo, useId } from 'react';
import { motion } from 'framer-motion';
import { Brain, Radio, Sparkles } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { formatInr } from './staffUiUtils';
import { useStaffStore, computeWorkforceKpis, computeInsights } from '../../store/useStaffStore';

export function PayrollAnalyticsDeck() {
  const workers = useStaffStore((s) => s.workers);
  const kpis = useMemo(() => computeWorkforceKpis(workers), [workers]);

  const dept = useMemo(() => {
    const m = {};
    workers.forEach((w) => {
      m[w.department] = (m[w.department] || 0) + w.totalPayable;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [workers]);
  const maxDept = dept[0]?.[1] || 1;

  const otCost = workers.reduce((s, w) => s + w.overtimePay, 0);
  const incentives = workers.reduce((s, w) => s + w.incentives + w.bonuses, 0);

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <GlassPanel className="p-4 border border-white/10 lg:col-span-1 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent/90">Payroll intelligence</p>
        <h3 className="text-base font-bold text-white">Salary & payroll dashboard</h3>
        <div className="grid grid-cols-2 gap-2">
          <MiniKpi label="Monthly expense" value={formatInr(kpis.monthlyPayroll)} />
          <MiniKpi label="Overtime cost" value={formatInr(otCost)} />
          <MiniKpi label="Incentives + bonus" value={formatInr(incentives)} />
          <MiniKpi label="Active roster" value={`${kpis.active} / ${kpis.total}`} />
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <p className="text-[11px] text-white/50 leading-relaxed">
          Totals aggregate simulated payable after attendance deductions. Export to finance ERP stub — values update live with
          attendance overrides.
        </p>
      </GlassPanel>

      <GlassPanel className="p-4 border border-white/10 lg:col-span-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3">Department-wise payroll cost</p>
        <div className="space-y-3">
          {dept.map(([name, val], i) => (
            <div key={name}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-white/70 font-semibold">{name}</span>
                <span className="font-mono text-brand-primary">{formatInr(val)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-secondary to-brand-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${(val / maxDept) * 100}%` }}
                  transition={{ delay: 0.06 * i, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}

function MiniKpi({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <p className="text-[9px] uppercase font-bold text-white/35 tracking-wide">{label}</p>
      <p className="text-sm font-bold text-white mt-1 font-mono">{value}</p>
    </div>
  );
}

export function WorkforceInsightsAndLive() {
  const workers = useStaffStore((s) => s.workers);
  const meta = useStaffStore((s) => s.meta);
  const kpis = useMemo(() => computeWorkforceKpis(workers), [workers]);
  const insights = useMemo(() => computeInsights(workers, meta.shiftTargets), [workers, meta.shiftTargets]);

  const live = useMemo(() => {
    const idle = workers.filter((w) => w.status === 'idle' || (w.machineId && w.productivity < 72)).length;
    const overloaded = workers.filter((w) => w.workload > 90 || w.status === 'overloaded').length;
    const activeOps = workers.filter((w) => ['active', 'assigned'].includes(w.status)).length;
    const understaffedWf = ['wf-c', 'wf-pack'].filter((id) => workers.filter((w) => w.workflowId === id && w.machineId).length < 2);
    const ratio = kpis.assigned ? (kpis.total / kpis.assigned).toFixed(2) : '—';
    return { idle, overloaded, activeOps, understaffedWf, ratio };
  }, [workers, kpis]);

  const tone = {
    shortage: 'border-status-warning/35 bg-status-warning/5 text-status-warning',
    excess: 'border-brand-secondary/35 bg-brand-secondary/10 text-brand-secondary',
    imbalance: 'border-status-error/30 bg-status-error/5 text-status-error',
    machine: 'border-brand-primary/35 bg-brand-primary/10 text-brand-primary',
    metric: 'border-white/15 bg-white/[0.03] text-white/75',
    shift: 'border-status-idle/35 bg-status-idle/10 text-status-idle',
    overload: 'border-status-error/35 bg-status-error/10 text-status-error',
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <GlassPanel className="p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-brand-secondary" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-secondary/90">AI workforce insights</p>
            <h3 className="text-base font-bold text-white">Optimization signals</h3>
          </div>
        </div>
        <ul className="space-y-2">
          {insights.map((ins, i) => (
            <motion.li
              key={`${ins.text}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i }}
              className={`flex gap-2 rounded-xl border px-3 py-2.5 text-[11px] leading-snug ${tone[ins.type] ?? tone.metric}`}
            >
              <Sparkles className="w-4 h-4 shrink-0 opacity-70" />
              <span>{ins.text}</span>
            </motion.li>
          ))}
        </ul>
      </GlassPanel>

      <GlassPanel className="p-4 border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_80%_0%,rgba(0,242,255,0.06),transparent_55%)] pointer-events-none" />
        <div className="relative z-10 flex items-center gap-2 mb-4">
          <Radio className="w-5 h-5 text-status-running animate-pulse" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-status-running/90">Live workforce status</p>
            <h3 className="text-base font-bold text-white">Real-time operations mesh</h3>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 relative z-10">
          <LiveTile label="Active operators" value={live.activeOps} hint="Execution state" good />
          <LiveTile label="Idle / low pace" value={live.idle} hint="Coaching candidates" warn={live.idle > 2} />
          <LiveTile label="Overloaded sections" value={live.overloaded} hint="Load > 90%" warn={live.overloaded > 0} />
          <LiveTile label="Workforce utilization" value={`${kpis.utilization}%`} hint="Assigned vs roster" good />
          <LiveTile label="Machine : worker ratio" value={live.ratio} hint="Twin floor proxy" />
          <LiveTile
            label="Understaffed workflows"
            value={live.understaffedWf.length ? live.understaffedWf.join(', ') : 'None'}
            hint="Auto-detected"
            warn={live.understaffedWf.length > 0}
          />
        </div>
      </GlassPanel>
    </div>
  );
}

function LiveTile({ label, value, hint, good, warn }) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        warn ? 'border-status-warning/40 bg-status-warning/5' : good ? 'border-status-running/30 bg-status-running/5' : 'border-white/10 bg-white/[0.03]'
      }`}
    >
      <p className="text-[9px] uppercase font-bold tracking-wider text-white/35">{label}</p>
      <p className="text-lg font-mono text-white mt-1 break-all">{value}</p>
      <p className="text-[10px] text-white/35 mt-1">{hint}</p>
    </div>
  );
}

export function StaffVisualizationRow() {
  const gid = useId();
  const workers = useStaffStore((s) => s.workers);
  const prod = useMemo(() => workers.map((w) => ({ n: w.name.split(' ')[0], v: w.productivity })), [workers]);
  const maxP = Math.max(...prod.map((p) => p.v), 1);

  const heat = useMemo(() => {
    const rows = 4;
    const cols = 8;
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = ((r * cols + c) * 17) % 100;
        cells.push(v);
      }
    }
    return cells;
  }, []);

  const gauge = useMemo(() => {
    const k = computeWorkforceKpis(workers);
    return k.utilization;
  }, [workers]);

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <GlassPanel className="p-4 border border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3">Productivity chart</p>
        <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
          {prod.map((p, i) => (
            <div key={p.n + i} className="flex items-center gap-2">
              <span className="text-[10px] text-white/45 w-16 truncate">{p.n}</span>
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-secondary to-brand-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(p.v / maxP) * 100}%` }}
                  transition={{ delay: 0.02 * i, duration: 0.5 }}
                />
              </div>
              <span className="text-[10px] font-mono text-white/60 w-8 text-right">{p.v}%</span>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-4 border border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3">Floor workload heatmap</p>
        <div className="grid grid-cols-8 gap-1">
          {heat.map((v, i) => (
            <div
              key={i}
              title={`Load ${v}`}
              className="aspect-square rounded-sm border border-white/5"
              style={{
                background: `linear-gradient(135deg, rgba(112,0,255,${v / 120}), rgba(0,242,255,${v / 100}))`,
              }}
            />
          ))}
        </div>
        <p className="text-[10px] text-white/35 mt-3">Simulated spatial density · sewing floor vs finishing.</p>
      </GlassPanel>

      <GlassPanel className="p-4 border border-white/10 flex flex-col items-center justify-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-2 w-full text-left">Utilization gauge</p>
        <div className="relative w-40 h-24">
          <svg viewBox="0 0 120 70" className="w-full h-full">
            <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
            <motion.path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke={`url(#${gid})`}
              strokeWidth="10"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: gauge / 100 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
            <defs>
              <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7000ff" />
                <stop offset="100%" stopColor="#00f2ff" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <span className="text-2xl font-bold text-white font-mono">{gauge}%</span>
          </div>
        </div>
        <p className="text-[10px] text-white/40 mt-2 text-center">Target band 78–92% · auto-rebalance when deviation &gt; 8%</p>
      </GlassPanel>
    </div>
  );
}
