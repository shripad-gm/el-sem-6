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

function ShipKpiCard({ label, value, sub, trend, delay = 0, accent = 'primary', format = 'int' }) {
  const numeric = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  const intTarget = format === 'dec' ? Math.round(numeric * 10) : Math.round(numeric);
  const animated = useAnimatedNumber(intTarget);
  const display =
    format === 'pct'
      ? `${animated}%`
      : format === 'dec'
        ? (animated / 10).toFixed(1)
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

export function ShipmentKpiGrid({ kpis }) {
  const cards = [
    { label: 'Total Shipments', value: kpis.total, trend: 1, sub: 'Outbound garment cartons', accent: 'primary' },
    { label: 'Pending Dispatch', value: kpis.pendingDispatch, trend: kpis.pendingDispatch > 4 ? -2 : 0, sub: 'Dock staging', accent: 'warn' },
    { label: 'In Transit', value: kpis.inTransit, trend: 2, sub: 'Carrier handoff', accent: 'primary' },
    { label: 'Delivered', value: kpis.delivered, trend: 3, sub: 'POD confirmed', accent: 'secondary' },
    { label: 'Delayed Shipments', value: kpis.delayed, trend: kpis.delayed > 2 ? -4 : 0, sub: 'SLA breach', accent: 'accent' },
    { label: 'Shipment Efficiency', value: kpis.efficiency, trend: kpis.delayed > 2 ? -3 : 2, sub: 'Dispatch velocity', format: 'pct', accent: 'primary' },
    { label: 'Average Delivery Time', value: kpis.avgDeliveryDays, trend: -1, sub: 'Days · rolling', format: 'dec', accent: 'secondary' },
    { label: 'Active Carriers', value: kpis.activeCarriers, trend: 0, sub: 'Integrated partners', accent: 'primary' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
      {cards.map((c, i) => (
        <ShipKpiCard key={c.label} {...c} delay={0.02 * i} />
      ))}
    </div>
  );
}
