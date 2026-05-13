import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MES_NAV } from '../config/mesNav';
import { GlassPanel } from '../components/ui/GlassPanel';

const LIVE_ROUTES = ['/workflow-management', '/staff-management'];

export default function DashboardPage() {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        <header className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-brand-primary/80">Command center</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">MSME MES overview</h1>
          <p className="text-sm text-white/50 max-w-2xl leading-relaxed">
            Unified manufacturing execution for MSMEs. Launch modules below; the digital twin factory lives under{' '}
            <span className="text-brand-primary font-mono text-xs">Workflow Management</span>.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MES_NAV.filter((n) => n.to !== '/dashboard').map((item, i) => {
            const live = LIVE_ROUTES.includes(item.to);
            return (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.3 }}
              >
                <Link to={item.to} className="block h-full">
                  <GlassPanel
                    className={`h-full p-5 border transition-all hover:border-brand-primary/40 group ${
                      live ? 'border-brand-primary/30 bg-brand-primary/5' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-brand-primary/40 group-hover:bg-brand-primary/10 transition-colors">
                        <item.icon className="w-5 h-5 text-white/50 group-hover:text-brand-primary" />
                      </div>
                      {live && (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-status-running/40 text-status-running bg-status-running/10">
                          Live
                        </span>
                      )}
                    </div>
                    <h2 className="mt-4 text-sm font-bold text-white group-hover:text-brand-primary transition-colors">
                      {item.label}
                    </h2>
                    <p className="mt-1 text-[11px] text-white/40 leading-relaxed">
                      {item.to === '/workflow-management'
                        ? '3D digital twin, floor orchestration, and workflow links.'
                        : item.to === '/staff-management'
                          ? 'Workforce orchestration, attendance, payroll, and utilization intelligence.'
                          : 'Reserved module — full experience shipping in a future release.'}
                    </p>
                  </GlassPanel>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
