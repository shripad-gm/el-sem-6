import { useState, useEffect, useRef } from 'react';
import {
  X,
  Activity,
  Terminal,
  BarChart3,
  Link2,
  AlertTriangle,
  Info,
  TrendingUp,
  History,
  Zap,
  Plus,
  CheckCircle,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { MACHINE_TYPES } from '../../data/machineTypes';
import { GlassPanel } from '../ui/GlassPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { DiagnosticBot } from './DiagnosticBot';

export const InspectionPanel = () => {
  const selectedMachineId = useStore((state) => state.selectedMachineId);
  const selectedConnectionId = useStore((state) => state.selectedConnectionId);
  const connections = useStore((state) => state.connections);
  const machines = useStore((state) => state.machines);
  const isDetailsOpen = useStore((state) => state.isDetailsOpen);
  const setDetailsOpen = useStore((state) => state.setDetailsOpen);
  const selectMachine = useStore((state) => state.selectMachine);
  const removeMachine = useStore((state) => state.removeMachine);
  const removeConnection = useStore((state) => state.removeConnection);
  const rerouteConnection = useStore((state) => state.rerouteConnection);

  const [activeTab, setActiveTab] = useState('overview');
  const [rerouteTarget, setRerouteTarget] = useState('');
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const logEndRef = useRef(null);

  const machine = machines.find((m) => m.id === selectedMachineId);
  const machineType = machine ? Object.values(MACHINE_TYPES).find((t) => t.id === machine.type) : null;
  const connection = connections.find((c) => c.id === selectedConnectionId);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [machine?.logs]);

  if (!isDetailsOpen) return null;

  if (connection) {
    const src = machines.find((m) => m.id === connection.source);
    const tgt = machines.find((m) => m.id === connection.target);
    const srcType = src ? Object.values(MACHINE_TYPES).find((t) => t.id === src.type) : null;
    const tgtType = tgt ? Object.values(MACHINE_TYPES).find((t) => t.id === tgt.type) : null;
    const flow =
      src && tgt
        ? Math.round(
            ((src.telemetry?.throughput ?? 0) + (tgt.telemetry?.throughput ?? 0)) / 2
          )
        : 0;
    const candidates = machines.filter((m) => m.id !== connection.source);

    return (
      <div className="fixed top-20 right-6 bottom-6 w-96 z-40">
        <GlassPanel className="h-full border border-white/10 shadow-2xl flex flex-col">
          <div className="p-5 border-b border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary/10 blur-3xl -mr-16 -mt-16 rounded-full" />
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-brand-primary/30">
                  <Link2 className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">Workflow link</h2>
                  <p className="text-[10px] font-mono text-white/40 mt-0.5">ID {connection.id.slice(0, 8)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Garment / data flow</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 rounded-lg bg-black/40 border border-white/10">
                  <p className="text-[9px] text-white/40 uppercase">Source</p>
                  <p className="text-xs font-bold text-white">{src?.name ?? '—'}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {srcType && <srcType.icon className="w-3.5 h-3.5 text-brand-primary" />}
                    <span className="text-[9px] text-white/50 font-mono">{src?.status}</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-brand-primary shrink-0" />
                <div className="flex-1 p-2 rounded-lg bg-black/40 border border-white/10">
                  <p className="text-[9px] text-white/40 uppercase">Target</p>
                  <p className="text-xs font-bold text-white">{tgt?.name ?? '—'}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {tgtType && <tgtType.icon className="w-3.5 h-3.5 text-brand-secondary" />}
                    <span className="text-[9px] text-white/50 font-mono">{tgt?.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-white/50">
                <span>Blended throughput index</span>
                <span className="font-mono text-brand-primary">{flow}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-white/40 uppercase font-bold">Reroute target</p>
              <div className="flex gap-2">
                <select
                  value={rerouteTarget}
                  onChange={(e) => setRerouteTarget(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs text-white"
                >
                  <option value="">Select machine…</option>
                  {candidates.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!rerouteTarget}
                  onClick={() => {
                    if (!rerouteTarget) return;
                    rerouteConnection(connection.id, rerouteTarget);
                    setRerouteTarget('');
                  }}
                  className="px-3 py-2 rounded-lg bg-brand-primary/20 border border-brand-primary/40 text-[10px] font-bold text-brand-primary disabled:opacity-30"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => src && selectMachine(src.id)}
                className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/80 hover:border-brand-primary/40"
              >
                Focus source
              </button>
              <button
                type="button"
                onClick={() => tgt && selectMachine(tgt.id)}
                className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/80 hover:border-brand-primary/40"
              >
                Focus target
              </button>
            </div>

            <button
              type="button"
              onClick={() => removeConnection(connection.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-status-error/10 hover:bg-status-error/20 border border-status-error/25 text-status-error text-xs font-bold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Disconnect pipeline
            </button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  if (!machine) return null;

  const incoming = connections.filter((c) => c.target === machine.id);
  const outgoing = connections.filter((c) => c.source === machine.id);

  const tabs = [
    { id: 'overview', icon: Activity, label: 'Overview' },
    { id: 'logs', icon: Terminal, label: 'Logs' },
    { id: 'telemetry', icon: BarChart3, label: 'Telemetry' },
    { id: 'connections', icon: Link2, label: 'Connections' },
    { id: 'alerts', icon: AlertTriangle, label: 'Alerts' }
  ];

  const statusColors = {
    RUNNING: 'text-status-running border-status-running/30 bg-status-running/10 shadow-[0_0_10px_rgba(0,255,136,0.2)]',
    IDLE: 'text-status-idle border-status-idle/30 bg-status-idle/10',
    WARNING: 'text-status-warning border-status-warning/30 bg-status-warning/10 animate-pulse',
    ERROR: 'text-status-error border-status-error/30 bg-status-error/10 animate-pulse shadow-[0_0_15px_rgba(255,68,68,0.3)]',
    MAINTENANCE: 'text-status-maintenance border-status-maintenance/30 bg-status-maintenance/10'
  };

  return (
    <div className="fixed top-20 right-6 bottom-6 w-96 z-40">
      <GlassPanel className="h-full border border-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl -mr-16 -mt-16 rounded-full" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10`}>
                {machineType && <machineType.icon className="w-6 h-6 text-brand-primary" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">{machine.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono text-white/40 uppercase">ID: {machine.id.slice(0, 8)}</span>
                  <div className={`px-2 py-0.5 rounded text-[9px] font-bold border ${statusColors[machine.status]}`}>
                    {machine.status}
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setDetailsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-2 bg-black/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all relative ${
                activeTab === tab.id ? 'text-brand-primary' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-[9px] uppercase font-bold tracking-tighter">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary shadow-[0_0_10px_#00f2ff]" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase font-bold">Efficiency</p>
                    <p className="text-xl font-mono text-brand-primary font-bold">{machine.telemetry.efficiency}%</p>
                    <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-brand-primary h-full shadow-[0_0_5px_#00f2ff]" style={{ width: `${machine.telemetry.efficiency}%` }} />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase font-bold">Health</p>
                    <p className="text-xl font-mono text-status-running font-bold">{machine.telemetry.health ?? 0}%</p>
                    <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-status-running h-full shadow-[0_0_5px_#00ff88]" style={{ width: `${machine.telemetry.health ?? 0}%` }} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] text-white/40 uppercase font-bold tracking-widest flex items-center gap-2">
                    <Info className="w-3 h-3" /> Operational Details
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Assigned Operator', value: 'ALEX_V_42', icon: '👤' },
                      { label: 'Runtime', value: '08:42:12', icon: '⏱️' },
                      { label: 'Shift Position', value: 'PRIMARY_B', icon: '📍' },
                      { label: 'Batch ID', value: 'GF-2026-X8', icon: '📦' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-xs text-white/50">{item.label}</span>
                        <span className="text-xs font-mono text-white/80">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-brand-primary/10 rounded-xl border border-brand-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-brand-primary" />
                    <div>
                      <p className="text-xs font-bold text-white">Power Consumption</p>
                      <p className="text-[10px] text-brand-primary/80">Active load detected</p>
                    </div>
                  </div>
                  <p className="text-lg font-mono font-bold text-white">{machine.telemetry.power ?? 0}<span className="text-xs ml-0.5 opacity-50">kW</span></p>
                </div>
                
                <button 
                  onClick={() => removeMachine(machine.id)}
                  className="w-full py-2.5 rounded-lg bg-status-error/10 hover:bg-status-error/20 border border-status-error/20 text-status-error text-xs font-bold transition-all mt-4"
                >
                  Decommission Machine
                </button>
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col h-full bg-black/40 rounded-xl border border-white/10 font-mono text-[10px] overflow-hidden"
              >
                <div className="p-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-white/40 flex items-center gap-1.5"><Terminal className="w-3 h-3" /> System Terminal</span>
                  <span className="text-[9px] text-status-running">LIVE_STREAM</span>
                </div>
                <div className="flex-1 p-3 overflow-y-auto space-y-2 custom-scrollbar max-h-[350px]">
                  {machine.logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-white/20">[{log.time}]</span>
                      <span className={
                        log.type === 'ERROR' ? 'text-status-error' : 
                        log.type === 'WARNING' ? 'text-status-warning' : 
                        'text-white/60'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </motion.div>
            )}

            {activeTab === 'telemetry' && (
              <motion.div
                key="telemetry"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  {[
                    { label: 'Spindle RPM', value: machine.telemetry.rpm, unit: 'RPM', max: 5000, color: 'text-brand-primary' },
                    { label: 'Thermal Output', value: machine.telemetry.temp, unit: '°C', max: 100, color: 'text-status-warning' },
                    { label: 'Stitch Counter', value: machine.telemetry.stitchCount, unit: 'SC', max: 10000, color: 'text-status-running' }
                  ].map((stat, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] text-white/40 uppercase font-bold">{stat.label}</span>
                        <span className={`text-sm font-mono font-bold ${stat.color}`}>{stat.value}<span className="text-[9px] ml-0.5 opacity-50">{stat.unit}</span></span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${stat.color.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`} 
                          initial={{ width: 0 }}
                          animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="text-[10px] text-white/40 uppercase font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Real-time Throughput
                  </h4>
                  <div className="flex items-end gap-1 h-20">
                    {[40, 60, 45, 80, 55, 70, 90, 65, 50, 85, 95, 60].map((h, i) => (
                      <motion.div 
                        key={i} 
                        className="flex-1 bg-brand-primary/20 hover:bg-brand-primary/40 rounded-t-sm transition-all"
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'connections' && (
              <motion.div
                key="connections"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                  <h4 className="text-[10px] text-white/40 uppercase font-bold">Incoming workflow</h4>
                  {incoming.length === 0 ? (
                    <p className="text-xs text-white/35 italic">No upstream links (no INPUT feeds).</p>
                  ) : (
                    incoming.map((c) => {
                      const up = machines.find((m) => m.id === c.source);
                      const upT = up ? Object.values(MACHINE_TYPES).find((t) => t.id === up.type) : null;
                      return (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => up && selectMachine(up.id)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg bg-black/40 border border-white/10 hover:border-brand-primary/40 text-left transition-colors"
                        >
                          {upT && (
                            <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center">
                              <upT.icon className="w-4 h-4 text-brand-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white/40 uppercase font-bold">From</p>
                            <p className="text-xs text-white truncate">{up?.name}</p>
                          </div>
                          <Link2 className="w-4 h-4 text-white/25 shrink-0" />
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                  <h4 className="text-[10px] text-white/40 uppercase font-bold">Outgoing workflow</h4>
                  {outgoing.length === 0 ? (
                    <p className="text-xs text-white/35 italic">Wire OUTPUT (cyan) → downstream INPUT (violet).</p>
                  ) : (
                    outgoing.map((c) => {
                      const down = machines.find((m) => m.id === c.target);
                      const downT = down ? Object.values(MACHINE_TYPES).find((t) => t.id === down.type) : null;
                      return (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => down && selectMachine(down.id)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg bg-black/40 border border-white/10 hover:border-brand-primary/40 text-left transition-colors"
                        >
                          {downT && (
                            <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center">
                              <downT.icon className="w-4 h-4 text-brand-secondary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white/40 uppercase font-bold">To</p>
                            <p className="text-xs text-white truncate">{down?.name}</p>
                          </div>
                          <Link2 className="w-4 h-4 text-white/25 shrink-0" />
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/15 space-y-2">
                  <h4 className="text-[10px] text-brand-primary/80 uppercase font-bold">Queue & throughput</h4>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Queue depth</span>
                    <span className="font-mono text-white">{machine.telemetry.queue}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Throughput index</span>
                    <span className="font-mono text-brand-primary">{machine.telemetry.throughput ?? '—'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] text-white/40 uppercase font-bold px-1">Quick link suggestion</h4>
                  {machines
                    .filter((m) => m.id !== machine.id && !outgoing.some((o) => o.target === m.id))
                    .slice(0, 4)
                    .map((other) => (
                      <button
                        type="button"
                        key={other.id}
                        onClick={() => {
                          const { addConnection: ac } = useStore.getState();
                          ac(machine.id, other.id);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 hover:border-brand-primary/35 transition-colors group text-left"
                      >
                        <span className="text-xs text-white/70">{other.name}</span>
                        <Plus className="w-3.5 h-3.5 text-white/25 group-hover:text-brand-primary shrink-0" />
                      </button>
                    ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'alerts' && (
              <motion.div
                key="alerts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {machine.status === 'ERROR' || machine.status === 'WARNING' ? (
                   <div className="p-4 bg-status-error/10 border border-status-error/20 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-status-error shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-status-error uppercase tracking-wider">Critical Anomaly Detected</p>
                        <p className="text-[10px] text-white/70 mt-1 leading-relaxed">
                          {machine.logs.find(l => l.type === 'ERROR' || l.type === 'WARN' || l.type === 'WARNING')?.message || 'Active threshold breach detected in system telemetry.'}
                        </p>
                        <div className="mt-3 flex gap-2">
                           <button 
                              onClick={() => setShowDiagnostic(true)}
                              className="px-3 py-1 bg-status-error/20 rounded border border-status-error/30 text-[10px] font-bold text-status-error hover:bg-status-error/30"
                           >
                              RUN DIAGNOSTIC
                           </button>
                           <button className="px-3 py-1 bg-white/10 rounded border border-white/10 text-[10px] font-bold text-white/60">IGNORE</button>
                        </div>
                      </div>
                   </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-status-running" />
                    </div>
                    <p className="text-sm font-bold text-white">System Nominal</p>
                    <p className="text-[10px] text-white/60 mt-1 uppercase tracking-widest">No active alerts</p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-white/5">
                  <h4 className="text-[10px] text-white/40 uppercase font-bold mb-3 flex items-center gap-2">
                    <History className="w-3 h-3" /> Alert History
                  </h4>
                  <div className="space-y-2 opacity-50">
                    {machine.logs.filter(l => l.type === 'ERROR' || l.type === 'WARN' || l.type === 'WARNING' || l.type === 'INFO').slice(0, 5).map((h, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] p-2 bg-white/5 rounded">
                        <span className="text-white/40 shrink-0">{h.time}</span>
                        <span className="text-white/60 truncate flex-1 px-2">{h.message}</span>
                        <span className={h.type === 'WARNING' || h.type === 'WARN' ? 'text-status-warning' : h.type === 'ERROR' ? 'text-status-error' : 'text-brand-primary'}>{h.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {showDiagnostic && (
          <DiagnosticBot 
            machine={machine} 
            onClose={() => setShowDiagnostic(false)} 
          />
        )}
      </GlassPanel>
    </div>
  );
};
