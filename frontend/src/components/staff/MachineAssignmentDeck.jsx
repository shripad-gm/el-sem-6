import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Factory, GitBranch, Sun, Moon, Sunset, MessageCircle } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { useStaffStore, computeMachineOccupancy } from '../../store/useStaffStore';
import { MACHINE_POOL, SHIFT_OPTIONS, WORKFLOW_OPTIONS } from '../../data/staffSeed';

const shiftIcon = { morning: Sun, evening: Sunset, night: Moon };

export function MachineAssignmentDeck() {
  const workers = useStaffStore((s) => s.workers);
  const assignMachine = useStaffStore((s) => s.assignMachine);
  const assignWorkflow = useStaffStore((s) => s.assignWorkflow);
  const assignShift = useStaffStore((s) => s.assignShift);
  const assignDepartment = useStaffStore((s) => s.assignDepartment);
  const assignDrop = useStaffStore((s) => s.assignWorkerToMachineDrop);
  const setDragged = useStaffStore((s) => s.setDraggedWorker);
  const draggedId = useStaffStore((s) => s.draggedWorkerId);
  const meta = useStaffStore((s) => s.meta);

  const occupancy = useMemo(() => computeMachineOccupancy(workers), [workers]);
  const unassigned = workers.filter((w) => !w.machineId);

  return (
    <div className="grid xl:grid-cols-2 gap-4">
      <GlassPanel className="p-4 border border-white/10">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary/80">Orchestration</p>
            <h3 className="text-base font-bold text-white mt-0.5">Machine assignment deck</h3>
            <p className="text-[11px] text-white/45 mt-1">Drag operators onto machines or use inline controls.</p>
          </div>
          <Factory className="w-8 h-8 text-brand-primary/30" />
        </header>

        <div className="grid sm:grid-cols-2 gap-2">
          {occupancy.map((m) => (
            <div
              key={m.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const wid = e.dataTransfer.getData('text/worker') || draggedId;
                if (wid) assignDrop(wid, m.id);
                setDragged(null);
              }}
              className={`rounded-xl border p-3 transition-all ${
                m.count === 0
                  ? 'border-status-warning/35 bg-status-warning/5'
                  : m.count > 1
                    ? 'border-status-error/30 bg-status-error/5'
                    : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-mono text-brand-primary/90 truncate">{m.code}</p>
                  <p className="text-xs font-semibold text-white truncate">{m.line}</p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-white/15 text-white/50">
                  {m.count}/1
                </span>
              </div>
              <p className="text-[11px] text-white/55 mt-2 line-clamp-2">{m.name}</p>
              <div className="mt-2 space-y-1">
                {m.assignedWorkers.length === 0 ? (
                  <p className="text-[10px] text-status-warning/90 font-semibold">Awaiting operator drop…</p>
                ) : (
                  m.assignedWorkers.map((n) => (
                    <p key={n} className="text-[11px] text-white/75 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-running shadow-[0_0_8px_#00ff88]" />
                      {n}
                    </p>
                  ))
                )}
              </div>
              <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-primary to-status-running"
                  initial={false}
                  animate={{ width: `${Math.min(100, m.count * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl border border-dashed border-brand-primary/25 bg-brand-primary/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary/80 mb-2">Unassigned pool</p>
          <div className="flex flex-wrap gap-2">
            {unassigned.map((w) => (
              <div
                key={w.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/worker', w.id);
                  e.dataTransfer.effectAllowed = 'move';
                  setDragged(w.id);
                }}
                onDragEnd={() => setDragged(null)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/15 bg-black/30 text-[11px] text-white/80 cursor-grab active:cursor-grabbing hover:border-brand-primary/40"
              >
                <GripVertical className="w-3.5 h-3.5 text-white/25" />
                {w.name}
              </div>
            ))}
            {unassigned.length === 0 && <span className="text-[11px] text-white/40">All rostered operators bound to assets.</span>}
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-4 border border-white/10 space-y-4">
        <header>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-secondary/90">Control rails</p>
          <h3 className="text-base font-bold text-white mt-0.5">Workflow · shift · department</h3>
          <p className="text-[11px] text-white/45 mt-1">Supervisor reassignment with compatibility hints (simulated).</p>
        </header>

        <div className="overflow-x-auto custom-scrollbar rounded-xl border border-white/10">
          <table className="min-w-full text-[11px]">
            <thead>
              <tr className="text-[10px] uppercase text-white/40 border-b border-white/10 bg-white/[0.03]">
                <th className="text-left px-3 py-2 font-bold">Operator</th>
                <th className="text-left px-3 py-2 font-bold">Machine</th>
                <th className="text-left px-3 py-2 font-bold">Workflow</th>
                <th className="text-left px-3 py-2 font-bold">Shift</th>
                <th className="text-left px-3 py-2 font-bold">Dept</th>
                <th className="text-center px-3 py-2 font-bold">Notify</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-3 py-2 text-white font-medium whitespace-nowrap">{w.name}</td>
                  <td className="px-3 py-2">
                    <select
                      value={w.machineId ?? ''}
                      onChange={(e) => assignMachine(w.id, e.target.value || null)}
                      className="w-full min-w-[120px] bg-black/40 border border-white/10 rounded-md px-2 py-1 text-[10px] text-white/80 focus:outline-none focus:border-brand-primary/40"
                    >
                      <option value="">Unassigned</option>
                      {MACHINE_POOL.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.code}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={w.workflowId}
                      onChange={(e) => assignWorkflow(w.id, e.target.value)}
                      className="w-full min-w-[140px] bg-black/40 border border-white/10 rounded-md px-2 py-1 text-[10px] text-white/80 focus:outline-none focus:border-brand-primary/40"
                    >
                      {WORKFLOW_OPTIONS.map((wf) => (
                        <option key={wf.id} value={wf.id}>
                          {wf.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={w.shiftId}
                      onChange={(e) => assignShift(w.id, e.target.value)}
                      className="w-full min-w-[120px] bg-black/40 border border-white/10 rounded-md px-2 py-1 text-[10px] text-white/80 focus:outline-none focus:border-brand-primary/40"
                    >
                      {SHIFT_OPTIONS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={w.department}
                      onChange={(e) => assignDepartment(w.id, e.target.value)}
                      className="w-full min-w-[100px] bg-black/40 border border-white/10 rounded-md px-2 py-1 text-[10px] text-white/80 focus:outline-none focus:border-brand-primary/40"
                    >
                      {meta.departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (!w.phone) {
                          alert('No phone number assigned to this worker.');
                          return;
                        }
                        const message = `*Role*\n${w.role}\n\n*Phone Number*\n${w.phone}\n\n*Shift*\n${w.shiftLabel}\n\n*Department*\n${w.department}\n\n*Assigned machine*\n${w.assignedMachineCode !== '—' ? w.assignedMachineCode : '—'}\n\n*Production workflow*\n${w.assignedWorkflow}`;
                        const url = `https://wa.me/${w.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                        window.open(url, '_blank');
                      }}
                      title="Send WhatsApp Message"
                      className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-brand-primary/10 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/20 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid sm:grid-cols-3 gap-2">
          {SHIFT_OPTIONS.map((s) => {
            const Icon = shiftIcon[s.id] ?? Sun;
            const onShift = workers.filter((w) => w.shiftId === s.id);
            const active = onShift.filter((w) => ['present', 'late', 'overtime'].includes(w.attendance)).length;
            const target = meta.shiftTargets[s.id] ?? 5;
            const ratio = Math.round((active / Math.max(target, 1)) * 100);
            return (
              <div key={s.id} className="rounded-xl border border-white/10 p-3 bg-white/[0.02]">
                <div className="flex items-center gap-2 text-white/80 text-xs font-bold">
                  <Icon className="w-4 h-4 text-brand-primary" />
                  {s.label}
                </div>
                <p className="text-[10px] text-white/40 mt-1">{s.window}</p>
                <p className="text-lg font-mono text-white mt-2">
                  {active}<span className="text-white/35 text-sm">/{target}</span>
                </p>
                <div className="h-1.5 mt-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${ratio < 60 ? 'bg-status-warning' : 'bg-status-running'}`}
                    style={{ width: `${Math.min(100, ratio)}%` }}
                  />
                </div>
                <p className="text-[10px] text-white/40 mt-1">Shift staffing index · {ratio}%</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-start gap-2 text-[10px] text-white/40 border border-white/10 rounded-lg p-2 bg-black/20">
          <GitBranch className="w-4 h-4 text-brand-secondary shrink-0" />
          <p>
            Skill compatibility matrix simulated: operators auto-mapped to workflows with highest SMV match. Drag-drop overrides
            routing for floor exceptions.
          </p>
        </div>
      </GlassPanel>
    </div>
  );
}
