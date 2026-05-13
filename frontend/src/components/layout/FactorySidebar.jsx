import { useState } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { MACHINE_TYPES } from '../../data/machineTypes';
import { GlassPanel } from '../ui/GlassPanel';
import { motion } from 'framer-motion';

/** Machine catalog for the digital twin — only used on `/workflow-management`. */
export const FactorySidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const isSidebarOpen = useStore((state) => state.isSidebarOpen);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const addMachine = useStore((state) => state.addMachine);

  const filteredMachines = Object.values(MACHINE_TYPES).filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative h-full transition-all duration-300 z-40 shrink-0 ${isSidebarOpen ? 'w-80' : 'w-16'}`}>
      <GlassPanel className="h-full rounded-none border-y-0 border-l-0 border-r border-white/10">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-primary" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/80">Factory Assets</h2>
            </div>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {isSidebarOpen && (
          <>
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  placeholder="Search Machines..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-brand-primary/50 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-0">
              {filteredMachines.map((machine) => (
                <motion.div
                  key={machine.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative bg-white/5 border border-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/10 hover:border-brand-primary/30 transition-all"
                  onClick={() => addMachine(machine)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-brand-primary/40 group-hover:bg-brand-primary/10 transition-colors">
                      <machine.icon className="w-5 h-5 text-white/40 group-hover:text-brand-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-white/90 group-hover:text-white">{machine.name}</h3>
                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-white/10 text-white/40 font-mono">
                          {machine.tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-status-running shadow-[0_0_5px_#00ff88]" />
                        <span className="text-[10px] text-white/30 uppercase tracking-tighter font-semibold">
                          Available
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-1.5 bg-brand-primary/20 rounded-md border border-brand-primary/40">
                      <Plus className="w-3.5 h-3.5 text-brand-primary" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {!isSidebarOpen && (
          <div className="flex flex-col items-center py-6 gap-6">
            {Object.values(MACHINE_TYPES).slice(0, 6).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => addMachine(m)}
                className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 hover:border-brand-primary/40 hover:bg-brand-primary/10 text-white/20 hover:text-brand-primary transition-all"
                title={m.name}
              >
                <m.icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        )}
      </GlassPanel>
    </div>
  );
};
