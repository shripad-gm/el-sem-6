import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { computeShipmentInsights } from '../../store/useShipmentStore';
import { useShipmentStore } from '../../store/useShipmentStore';

export function ShipmentInsightsBlock() {
  const shipments = useShipmentStore((s) => s.shipments);
  const insights = useMemo(() => computeShipmentInsights(shipments), [shipments]);

  const tone = {
    delay: 'border-status-warning/35 bg-status-warning/5 text-status-warning',
    queue: 'border-brand-primary/35 bg-brand-primary/10 text-brand-primary',
    region: 'border-brand-secondary/35 bg-brand-secondary/10 text-brand-secondary',
    qc: 'border-status-idle/35 bg-status-idle/10 text-status-idle',
    ops: 'border-white/15 bg-white/[0.03] text-white/75',
  };

  return (
    <GlassPanel className="p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-brand-secondary" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-secondary/90">AI logistics insights</p>
          <h3 className="text-base font-bold text-white">Dispatch intelligence</h3>
        </div>
      </div>
      <ul className="space-y-2">
        {insights.map((ins, i) => (
          <motion.li
            key={`${ins.text}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 * i }}
            className={`flex gap-2 rounded-xl border px-3 py-2.5 text-[11px] leading-snug ${tone[ins.type] ?? tone.ops}`}
          >
            <Sparkles className="w-4 h-4 shrink-0 opacity-70" />
            <span>{ins.text}</span>
          </motion.li>
        ))}
      </ul>
    </GlassPanel>
  );
}
