import { AnimatePresence, motion } from 'framer-motion';
import { X, MapPin, Package, Radio, Truck } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { ShipmentFlow } from './ShipmentFlow';
import { SHIPMENT_STATUS_LABEL } from './shipmentUiUtils';
import { PRIORITY_LABEL } from '../orders/orderUiUtils';
import { useShipmentStore } from '../../store/useShipmentStore';

export function ShipmentDetailPanel() {
  const selectedId = useShipmentStore((s) => s.selectedShipmentId);
  const clear = useShipmentStore((s) => s.clearSelection);
  const row = useShipmentStore((s) => s.shipments.find((x) => x.id === selectedId));

  const etaLabel =
    row &&
    `Est. arrival ${row.expectedDelivery} · delay risk ${row.etaRisk.toUpperCase()} · stage ${row.currentStage}`;

  return (
    <AnimatePresence>
      {selectedId && row && (
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
                <p className="text-[10px] font-mono text-brand-primary/90">{row.shipmentId}</p>
                <h3 className="text-lg font-bold text-white leading-snug">Shipment dossier</h3>
                <p className="text-xs text-white/50 mt-1 font-mono">{row.orderId}</p>
                <span className="inline-flex mt-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-white/15 text-white/65">
                  {SHIPMENT_STATUS_LABEL[row.status]}
                </span>
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
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Order information</p>
                <Row icon={Package} label="Linked style" value={row.order?.productName || row.orderProduct} />
                {row.order && (
                  <>
                    <Row icon={Package} label="Order quantity" value={`${row.order.quantity} units`} />
                    <Row icon={Package} label="Order completion" value={`${row.order.completionPct}%`} />
                    <Row icon={Package} label="Supervisor" value={row.order.supervisor} />
                  </>
                )}
                <Row icon={MapPin} label="Destination" value={row.destination} />
                <Row icon={Truck} label="Priority" value={PRIORITY_LABEL[row.priority] ?? row.priority} />
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3">Shipment tracking flow</p>
                <ShipmentFlow stages={row.stages} etaLabel={etaLabel} />
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Carrier details</p>
                <Row icon={Truck} label="Carrier" value={row.carrier} />
                <Row icon={Radio} label="Region profile" value={row.carrierRegion} />
                <Row icon={Radio} label="AWB / tracking" value={row.trackingNumber} />
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Package details</p>
                <div className="grid grid-cols-2 gap-2">
                  <Mini label="Cartons" value={String(row.packageCount)} />
                  <Mini label="Weight" value={`${row.weightKg} kg`} />
                  <Mini label="Dispatch" value={row.dispatchDate} />
                  <Mini label="ETA window" value={row.expectedDelivery} warn={row.etaRisk === 'high'} />
                </div>
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-2">Dispatch logs</p>
                <ul className="space-y-2">
                  {row.logs.map((l, idx) => (
                    <li key={idx} className="text-[11px] border-l-2 border-brand-primary/30 pl-3">
                      <span className="font-mono text-white/35 text-[10px] block">{l.t}</span>
                      <p className="text-white/70 leading-snug">{l.msg}</p>
                    </li>
                  ))}
                </ul>
              </GlassPanel>

              <GlassPanel className="p-4 border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-2">Delivery timeline</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-brand-secondary to-brand-primary"
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          row.status === 'delivered'
                            ? '100%'
                            : row.status === 'in_transit'
                              ? '72%'
                              : row.status === 'dispatched'
                                ? '48%'
                                : row.status === 'delayed'
                                  ? '40%'
                                  : '22%',
                      }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-white/45">PROG</span>
                </div>
                <p className="text-[11px] text-white/50 mt-2">Current shipment stage: {row.currentStage}</p>
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
