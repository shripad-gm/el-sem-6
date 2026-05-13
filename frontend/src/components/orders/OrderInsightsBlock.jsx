import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { computeOrderInsights } from '../../store/useOrderStore';
import { useOrderStore } from '../../store/useOrderStore';

export function OrderInsightsBlock() {
  const orders = useOrderStore((s) => s.orders);
  const insights = useMemo(() => computeOrderInsights(orders), [orders]);

  const tone = {
    risk: 'border-status-warning/35 bg-status-warning/5 text-status-warning',
    overload: 'border-status-error/30 bg-status-error/5 text-status-error',
    logistics: 'border-brand-secondary/35 bg-brand-secondary/10 text-brand-secondary',
    metric: 'border-white/15 bg-white/[0.03] text-white/75',
  };

  return (
    <GlassPanel className="p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-brand-secondary" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-secondary/90">AI order insights</p>
          <h3 className="text-base font-bold text-white">Manufacturing intelligence</h3>
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
  );
}
