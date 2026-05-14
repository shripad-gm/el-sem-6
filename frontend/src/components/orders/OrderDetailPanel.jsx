import { AnimatePresence, motion } from 'framer-motion';
import { X, Cpu, Package, Sparkles, Timer, Truck } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { ProductionPipeline } from './ProductionPipeline';
import { ORDER_STATUS_LABEL, PRIORITY_LABEL } from './orderUiUtils';
import { useOrderStore } from '../../store/useOrderStore';

export function OrderDetailPanel() {
  const selectedId = useOrderStore((s) => s.selectedOrderId);
  const clear = useOrderStore((s) => s.clearSelection);
  const setPriority = useOrderStore((s) => s.setPriority);
  const meta = useOrderStore((s) => s.meta);
  const order = useOrderStore((s) => s.orders.find((o) => o.id === selectedId));

  return (
    <AnimatePresence>
      {selectedId && order && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:bg-black/40"
            aria-label="Close panel"
            onClick={clear}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed top-0 right-0 z-[70] h-full w-full max-w-lg border-l border-white/10 bg-industrial-bg/95 backdrop-blur-xl shadow-[-20px_0_80px_rgba(0,0,0,0.65)] flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-brand-primary/90">{order.orderId}</p>
                <h3 className="text-lg font-bold text-white leading-snug">{order.productName}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-white/15 text-white/60">
                    {ORDER_STATUS_LABEL[order.status]}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-brand-secondary/30 text-brand-secondary/90">
                    {PRIORITY_LABEL[order.priority]} priority
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={clear}
                className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-brand-primary/40 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              <GlassPanel className="p-4 border border-white/10 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Product details</p>
                <Row icon={Package} label="SKU" value={order.sku} />
                <Row icon={Package} label="Fabric" value={order.fabric} />
                <Row icon={Package} label="Quantity" value={`${order.quantity.toLocaleString('en-IN')} units`} />
                <Row icon={Package} label="PO reference" value={order.poRef} />
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3">Production pipeline</p>
                <ProductionPipeline stages={order.stages} />
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Assignments</p>
                <Row icon={Cpu} label="Assigned workflow" value={order.assignedWorkflow} />
                <Row icon={Cpu} label="Machines" value={order.machines.join(' · ')} />
                <Row icon={Cpu} label="Operators" value={order.workers.length ? order.workers.join(', ') : 'Pool TBD'} />
                <Row icon={Cpu} label="Supervisor" value={order.supervisor} />
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Production priority</p>
                <p className="text-[11px] text-white/45 mb-2">Re-sequence line loading for supervisors.</p>
                <select
                  value={order.priority}
                  onChange={(e) => setPriority(order.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary/40"
                >
                  {meta.priorities.map((p) => (
                    <option key={p} value={p} className="bg-industrial-bg">
                      {PRIORITY_LABEL[p]}
                    </option>
                  ))}
                </select>
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-2">Production timeline</p>
                <ul className="space-y-2">
                  {order.timeline.map((ev, idx) => (
                    <li key={idx} className="flex gap-2 text-[11px]">
                      <Timer className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${ev.ok ? 'text-status-running' : 'text-status-warning'}`} />
                      <div>
                        <span className="font-mono text-white/35 text-[10px]">{ev.t}</span>
                        <p className="text-white/65 leading-snug">{ev.label}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Execution telemetry</p>
                <div>
                  <div className="flex justify-between text-[11px] text-white/60 mb-1">
                    <span>Completion</span>
                    <span className="font-mono text-brand-primary">{order.completionPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-brand-secondary via-brand-primary to-status-running"
                      initial={{ width: 0 }}
                      animate={{ width: `${order.completionPct}%` }}
                      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
                <Row icon={Sparkles} label="Current bottleneck" value={order.bottleneck} />
                <div className="grid grid-cols-2 gap-2">
                  <Mini label="Shipment readiness" value={`${order.shipmentReadyPct}%`} />
                  <Mini label="Delay risk" value={order.delayRisk.toUpperCase()} warn={order.delayRisk !== 'low'} />
                  <Mini label="Deadline" value={order.deadline} />
                  <Mini label="Est. completion" value={order.estimatedCompletion} />
                </div>
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="w-8 h-8 text-brand-secondary/80" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white/35 tracking-widest">Logistics bridge</p>
                    {order.shipments && order.shipments.length > 0 ? (
                      <p className="text-xs font-semibold text-brand-secondary">{order.shipments.length} shipment(s) linked.</p>
                    ) : (
                      <p className="text-xs text-white/75">Shipment module will pick up when packing lane marks ready.</p>
                    )}
                  </div>
                </div>
                {order.shipments && order.shipments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {order.shipments.map(s => (
                       <div key={s.id} className="flex justify-between items-center bg-black/30 p-2.5 rounded-lg border border-white/5">
                         <div>
                           <p className="text-[10px] font-mono text-brand-secondary/70">{s.shipmentId}</p>
                           <p className="text-[11px] font-semibold text-white/90 capitalize">{s.status.replace('_', ' ')}</p>
                           <p className="text-[10px] text-white/50">{s.currentStage}</p>
                         </div>
                         <div className="text-right">
                           <p className="text-[10px] text-white/60">{s.packageCount} cartons</p>
                           <p className="text-[11px] font-semibold text-white/90">{s.expectedDelivery}</p>
                         </div>
                       </div>
                    ))}
                  </div>
                )}
              </GlassPanel>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-brand-primary/70 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[9px] uppercase font-bold tracking-wider text-white/35">{label}</p>
        <p className="text-sm text-white/85 leading-snug">{value}</p>
      </div>
    </div>
  );
}

function Mini({ label, value, warn }) {
  return (
    <div className={`rounded-lg border px-2 py-2 ${warn ? 'border-status-warning/35 bg-status-warning/5' : 'border-white/10 bg-black/30'}`}>
      <p className="text-[9px] uppercase font-bold text-white/35">{label}</p>
      <p className={`text-xs font-semibold mt-0.5 ${warn ? 'text-status-warning' : 'text-white/85'}`}>{value}</p>
    </div>
  );
}
