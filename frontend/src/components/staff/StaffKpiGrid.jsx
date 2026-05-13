import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { useAnimatedNumber, formatInr } from './staffUiUtils';

function TrendChip({ trend }) {
  if (trend > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-status-running">
        <TrendingUp className="w-3 h-3" />+{trend}%
      </span>
    );
  if (trend < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-status-error">
        <TrendingDown className="w-3 h-3" />
        {trend}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-white/35">
      <Minus className="w-3 h-3" />
      flat
    </span>
  );
}

export function StaffKpiCard({
  label,
  value,
  sub,
  trend,
  delay = 0,
  accent = 'primary',
  format = 'int',
}) {
  const numeric = typeof value === 'number' ? value : 0;
  const animated = useAnimatedNumber(numeric);
  const display =
    format === 'inr'
      ? formatInr(animated)
      : format === 'pct'
        ? `${animated}%`
        : format === 'dec'
          ? (animated / 10).toFixed(1)
          : animated.toLocaleString('en-IN');

  const accentClass =
    accent === 'secondary'
      ? 'from-brand-secondary/25 to-transparent border-brand-secondary/25'
      : accent === 'accent'
        ? 'from-brand-accent/20 to-transparent border-brand-accent/25'
        : 'from-brand-primary/25 to-transparent border-brand-primary/25';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassPanel
        className={`relative p-4 border bg-gradient-to-br ${accentClass} overflow-hidden group hover:border-brand-primary/35 transition-colors`}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(800px_circle_at_20%_0%,rgba(0,242,255,0.08),transparent_55%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-2 min-h-[88px]">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 leading-tight">{label}</p>
            {trend !== undefined && <TrendChip trend={trend} />}
          </div>
          <p className="text-2xl md:text-[26px] font-bold text-white tabular-nums tracking-tight glow-text text-brand-primary">
            {display}
          </p>
          {sub && <p className="text-[10px] text-white/45 leading-snug">{sub}</p>}
        </div>
      </GlassPanel>
    </motion.div>
  );
}

export function StaffKpiGrid({ kpis }) {
  const cards = [
    { label: 'Total Workers', value: kpis.total, trend: 2, sub: 'Headcount · garment ops', accent: 'primary' },
    { label: 'Active Workers', value: kpis.active, trend: 1, sub: 'On-floor execution', accent: 'primary' },
    { label: 'Absent Workers', value: kpis.absent, trend: -1, sub: 'Attendance edge', accent: 'accent' },
    { label: 'Workers on Leave', value: kpis.onLeave, trend: 0, sub: 'Planned / medical', accent: 'secondary' },
    { label: 'Assigned Workers', value: kpis.assigned, trend: 3, sub: 'Machine-bound roster', accent: 'primary' },
    { label: 'Unassigned Workers', value: kpis.unassigned, trend: kpis.unassigned > 2 ? -2 : 1, sub: 'Pool availability', accent: 'secondary' },
    { label: 'Workforce Utilization', value: kpis.utilization, trend: 4, sub: 'Assigned vs roster', format: 'pct', accent: 'primary' },
    { label: 'Workforce Deficiency', value: kpis.deficiency, trend: kpis.deficiency > 0 ? -3 : 1, sub: 'Open machine slots', accent: 'accent' },
    { label: 'Excess Workforce', value: kpis.excess, trend: kpis.excess > 0 ? -2 : 0, sub: 'Over-capacity signal', accent: 'secondary' },
    { label: 'Avg Productivity', value: kpis.avgProductivity, trend: 2, sub: 'SMV-weighted ops', format: 'pct', accent: 'primary' },
    { label: 'Monthly Payroll Cost', value: kpis.monthlyPayroll, trend: -1, sub: 'Simulated accrual', format: 'inr', accent: 'accent' },
    { label: 'Shift Efficiency', value: kpis.shiftEfficiency, trend: 1, sub: 'Coverage vs target', format: 'pct', accent: 'primary' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {cards.map((c, i) => (
        <StaffKpiCard key={c.label} {...c} delay={0.02 * i} />
      ))}
    </div>
  );
}
