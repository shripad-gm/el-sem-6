import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Clock, Cpu, LayoutDashboard } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { MES_NAV } from '../../config/mesNav';

export const Navbar = () => {
  const [time, setTime] = useState(new Date());
  const location = useLocation();
  const machines = useStore((state) => state.machines);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const alertsCount = machines.filter((m) => m.status === 'ERROR' || m.status === 'WARNING').length;

  const routeLabel = useMemo(() => {
    const exact = MES_NAV.find((n) => n.end && location.pathname === n.to);
    if (exact) return exact.label;
    const prefix = [...MES_NAV].reverse().find((n) => !n.end && location.pathname.startsWith(n.to));
    return prefix?.label ?? 'MES';
  }, [location.pathname]);

  const isTwin = location.pathname.startsWith('/workflow-management');

  return (
    <nav className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-industrial-bg/80 backdrop-blur-md z-50 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to="/dashboard"
          className="w-10 h-10 bg-brand-primary/20 rounded-lg flex items-center justify-center border border-brand-primary/30 shadow-[0_0_15px_rgba(0,242,255,0.2)] hover:bg-brand-primary/30 transition-colors shrink-0"
        >
          <Cpu className="text-brand-primary w-6 h-6" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold tracking-wider text-white truncate">
            MSME<span className="text-brand-primary">MES</span>
            <span className="ml-1.5 text-[10px] font-medium text-white/45 border border-white/15 px-1.5 py-0.5 rounded tracking-tight whitespace-nowrap">
              Platform
            </span>
          </h1>
          <p className="text-[10px] text-white/40 uppercase tracking-widest -mt-0.5 font-semibold truncate">
            {routeLabel}
            {isTwin && <span className="text-brand-primary/80"> · GarmentFlow Twin</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-8 shrink-0">
        <Link
          to="/dashboard"
          className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-white/45 hover:text-brand-primary transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          Home
        </Link>

        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">System Health</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 w-3 rounded-full ${i <= 4 ? 'bg-status-running shadow-[0_0_5px_#00ff88]' : 'bg-white/10'}`}
                />
              ))}
            </div>
            <span className="text-xs text-status-running font-mono">98.2%</span>
          </div>
        </div>

        <div className="h-8 w-px bg-white/10 hidden md:block" />

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2" title="Digital twin units (workflow module)">
            <span className="text-[10px] text-white/30 uppercase hidden sm:inline">Twin</span>
            <span className="text-xs font-mono text-white/70">
              {machines.length} <span className="text-white/30">UNITS</span>
            </span>
          </div>

          <div className="flex items-center gap-2 relative">
            <Bell className={`w-4 h-4 ${alertsCount > 0 ? 'text-status-error animate-pulse' : 'text-white/40'}`} />
            <span className={`text-xs font-mono ${alertsCount > 0 ? 'text-status-error' : 'text-white/70'}`}>
              {alertsCount} <span className="text-white/30 sm:inline">ALERTS</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/40" />
            <span className="text-xs font-mono text-white/70 tabular-nums">{time.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
