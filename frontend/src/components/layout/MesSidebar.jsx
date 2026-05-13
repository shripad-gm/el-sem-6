import { NavLink } from 'react-router-dom';
import { GlassPanel } from '../ui/GlassPanel';
import { MES_NAV } from '../../config/mesNav';

export const MesSidebar = () => {
  return (
    <aside className="w-56 shrink-0 border-r border-white/10 bg-industrial-bg/90 backdrop-blur-md z-30 flex flex-col">
      <GlassPanel className="h-full rounded-none border-0 bg-transparent shadow-none flex flex-col">
        <div className="p-4 border-b border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Modules</p>
          <p className="text-xs text-white/60 mt-1 leading-snug">MSME Manufacturing Execution</p>
        </div>
        <nav className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
          {MES_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/35 shadow-[0_0_20px_rgba(0,242,255,0.12)]'
                    : 'text-white/55 border border-transparent hover:bg-white/5 hover:text-white/90'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0 opacity-80" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </GlassPanel>
    </aside>
  );
};
