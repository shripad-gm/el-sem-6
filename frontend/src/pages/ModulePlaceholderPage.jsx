import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { GlassPanel } from '../components/ui/GlassPanel';

export default function ModulePlaceholderPage({ title }) {
  return (
    <div className="h-full flex items-center justify-center p-6 overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full"
      >
        <GlassPanel className="p-10 md:p-12 border border-white/10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-secondary/10 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-brand-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-16 w-40 h-40 rounded-full bg-brand-secondary/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl border border-brand-primary/30 bg-brand-primary/10 flex items-center justify-center shadow-[0_0_40px_rgba(0,242,255,0.15)]">
              <Construction className="w-8 h-8 text-brand-primary" strokeWidth={1.25} />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h1>
              <p className="text-sm md:text-base text-white/55 leading-relaxed px-2">
                This module is currently under development and will be implemented in future updates.
              </p>
            </div>
            <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-semibold">GarmentFlow MES Platform</p>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
