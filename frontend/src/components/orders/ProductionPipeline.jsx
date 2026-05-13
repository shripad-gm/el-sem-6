import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function ProductionPipeline({ stages }) {
  if (!stages?.length) return null;
  return (
    <div className="space-y-1">
      {stages.map((s, i) => (
        <div key={s.name}>
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 * i }}
            className={`relative rounded-xl border px-3 py-2.5 flex items-center justify-between gap-2 ${
              s.state === 'done'
                ? 'border-status-running/30 bg-status-running/5'
                : s.state === 'active'
                  ? s.delayed
                    ? 'border-status-warning/45 bg-status-warning/10 shadow-[0_0_20px_rgba(255,140,0,0.12)]'
                    : 'border-brand-primary/45 bg-brand-primary/10 shadow-[0_0_24px_rgba(0,242,255,0.12)]'
                  : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  s.state === 'done'
                    ? 'bg-status-running shadow-[0_0_8px_#00ff88]'
                    : s.state === 'active'
                      ? s.delayed
                        ? 'bg-status-warning'
                        : 'bg-brand-primary shadow-[0_0_10px_#00f2ff]'
                      : 'bg-white/20'
                }`}
              />
              <span className={`text-[12px] font-bold truncate ${s.state === 'active' ? 'text-white' : 'text-white/55'}`}>{s.name}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {s.bottleneck && (
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-status-warning/40 text-status-warning bg-black/30">
                  Bottleneck
                </span>
              )}
              <span className="text-[9px] font-mono uppercase text-white/35">
                {s.state === 'done' ? 'OK' : s.state === 'active' ? 'LIVE' : 'QUE'}
              </span>
            </div>
          </motion.div>
          {i < stages.length - 1 && (
            <div className="flex justify-center py-0.5">
              <ChevronDown className="w-4 h-4 text-brand-primary/40" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
