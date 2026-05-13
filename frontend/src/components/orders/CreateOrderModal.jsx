import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { useOrderStore } from '../../store/useOrderStore';
import { PRIORITY_LABEL } from './orderUiUtils';

export function CreateOrderModal() {
  const open = useOrderStore((s) => s.createOpen);
  const setCreateOpen = useOrderStore((s) => s.setCreateOpen);
  const addOrder = useOrderStore((s) => s.addOrder);
  const meta = useOrderStore((s) => s.meta);

  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('800');
  const [deadline, setDeadline] = useState(() => new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10));
  const [workflowId, setWorkflowId] = useState(meta.workflows[0]?.id ?? 'wl-1');
  const [priority, setPriority] = useState('medium');
  const [supervisor, setSupervisor] = useState(meta.supervisors[0] ?? '');
  const [sku, setSku] = useState('');
  const [fabric, setFabric] = useState('');
  const [poRef, setPoRef] = useState('');

  const reset = () => {
    setProductName('');
    setQuantity('800');
    setDeadline(new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10));
    setWorkflowId(meta.workflows[0]?.id ?? 'wl-1');
    setPriority('medium');
    setSupervisor(meta.supervisors[0] ?? '');
    setSku('');
    setFabric('');
    setPoRef('');
  };

  const close = () => {
    setCreateOpen(false);
    reset();
  };

  const submit = (e) => {
    e.preventDefault();
    addOrder({
      productName: productName || 'New garment style',
      quantity,
      deadline,
      workflowId,
      priority,
      supervisor,
      sku,
      fabric,
      poRef,
    });
    reset();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
            aria-label="Close modal"
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="fixed left-1/2 top-1/2 z-[90] w-[min(96vw,480px)] -translate-x-1/2 -translate-y-1/2"
          >
            <GlassPanel className="border border-brand-primary/25 shadow-[0_0_60px_rgba(0,242,255,0.12)]">
              <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary/90">MES · routing</p>
                  <h3 className="text-lg font-bold text-white">Create production order</h3>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-brand-primary/40"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={submit} className="p-4 space-y-3">
                <Field label="Product name">
                  <input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary/40"
                    placeholder="e.g. Merino Crew Tee — SS26"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Quantity (units)">
                    <input
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      type="number"
                      min={1}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary/40"
                    />
                  </Field>
                  <Field label="Deadline">
                    <input
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      type="date"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary/40"
                    />
                  </Field>
                </div>
                <Field label="Assigned workflow">
                  <select
                    value={workflowId}
                    onChange={(e) => setWorkflowId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary/40"
                  >
                    {meta.workflows.map((w) => (
                      <option key={w.id} value={w.id} className="bg-industrial-bg">
                        {w.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Priority">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary/40"
                    >
                      {meta.priorities.map((p) => (
                        <option key={p} value={p} className="bg-industrial-bg">
                          {PRIORITY_LABEL[p]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Supervisor">
                    <select
                      value={supervisor}
                      onChange={(e) => setSupervisor(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary/40"
                    >
                      {meta.supervisors.map((s) => (
                        <option key={s} value={s} className="bg-industrial-bg">
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="SKU (optional)">
                  <input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary/40"
                    placeholder="GF-2401"
                  />
                </Field>
                <Field label="Fabric / construction notes">
                  <input
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary/40"
                  />
                </Field>
                <Field label="PO reference (optional)">
                  <input
                    value={poRef}
                    onChange={(e) => setPoRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary/40"
                  />
                </Field>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={close}
                    className="flex-1 py-2.5 rounded-lg border border-white/15 text-xs font-bold uppercase tracking-wide text-white/70 hover:border-white/30"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg border border-brand-primary/50 bg-brand-primary/15 text-xs font-bold uppercase tracking-wide text-brand-primary hover:bg-brand-primary/25"
                  >
                    Commit order
                  </button>
                </div>
              </form>
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">{label}</span>
      {children}
    </label>
  );
}
