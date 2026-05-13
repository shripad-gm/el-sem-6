import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { useAnimatedNumber } from '../staff/staffUiUtils';

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

function OrderKpiCard({ label, value, sub, trend, delay = 0, accent = 'primary', format = 'int' }) {
  const numeric = typeof value === 'number' ? value : 0;
  const animated = useAnimatedNumber(numeric);
  const display =
    format === 'pct'
      ? `${animated}%`
      : format === 'dec'
        ? animated.toFixed(1)
        : format === 'qty'
          ? animated.toLocaleString('en-IN')
          : animated.toLocaleString('en-IN');

  const accentClass =
    accent === 'secondary'
      ? 'from-brand-secondary/25 to-transparent border-brand-secondary/25'
      : accent === 'accent'
        ? 'from-brand-accent/20 to-transparent border-brand-accent/25'
        : accent === 'warn'
          ? 'from-status-warning/20 to-transparent border-status-warning/25'
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

export function OrderKpiGrid({ kpis }) {
  const cards = [
    { label: 'Total Orders', value: kpis.total, trend: 2, sub: 'GarmentFlow PO stack', accent: 'primary' },
    { label: 'Active Orders', value: kpis.active, trend: 1, sub: 'In-progress manufacturing', accent: 'primary' },
    { label: 'Delayed Orders', value: kpis.delayed, trend: kpis.delayed > 3 ? -4 : 0, sub: 'SLA breach watch', accent: 'warn' },
    { label: 'Completed Orders', value: kpis.completed, trend: 3, sub: 'QC released lots', accent: 'secondary' },
    { label: 'Pending Orders', value: kpis.pending, trend: -1, sub: 'Awaiting line commit', accent: 'accent' },
    { label: 'Production Efficiency', value: kpis.efficiency, trend: kpis.delayed > 2 ? -3 : 2, sub: 'Weighted line output', format: 'pct', accent: 'primary' },
    { label: 'Orders Near Deadline', value: kpis.nearDeadline, trend: kpis.nearDeadline > 2 ? -2 : 1, sub: 'Next 72h window', accent: 'warn' },
    { label: 'Total Production Quantity', value: kpis.totalQty, trend: 2, sub: 'Units in flight', format: 'qty', accent: 'secondary' },
    { label: 'Workflow Bottlenecks', value: kpis.bottleneckCount, trend: kpis.bottleneckCount > 4 ? -3 : 0, sub: 'Stage choke sensors', accent: 'accent' },
    { label: 'Average Completion Time', value: kpis.avgCycleDays, trend: -1, sub: 'Cycle time · days', format: 'dec', accent: 'primary' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {cards.map((c, i) => (
        <OrderKpiCard key={c.label} {...c} delay={0.02 * i} />
      ))}
    </div>
  );
}
