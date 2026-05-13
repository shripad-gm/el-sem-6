import { useEffect } from 'react';
import { FactorySidebar } from '../components/layout/FactorySidebar';
import { InspectionPanel } from '../components/layout/InspectionPanel';
import { FactoryCanvas } from '../components/factory/FactoryCanvas';
import { useTelemetry } from '../hooks/useTelemetry';
import { useStore } from '../store/useStore';
import { MACHINE_TYPES } from '../data/machineTypes';

/**
 * Full GarmentFlow Twin digital twin — exclusive home for the 3D factory MES experience.
 */
export default function WorkflowManagementPage() {
  useTelemetry();

  const addMachine = useStore((state) => state.addMachine);
  const machines = useStore((state) => state.machines);

  useEffect(() => {
    const st = useStore.getState();
    if (st.machines.length > 0) return;
    addMachine(MACHINE_TYPES.CUTTING, [-6, 0, 0]);
    addMachine(MACHINE_TYPES.LOCKSTITCH, [-2, 0, -1]);
    addMachine(MACHINE_TYPES.OVERLOCK, [2, 0, 1]);
    addMachine(MACHINE_TYPES.QUALITY_CHECK, [6, 0, 0]);
  }, [addMachine]);

  useEffect(() => {
    const st = useStore.getState();
    if (st.connections.length > 0 || st.machines.length < 4) return;
    const byType = (t) => st.machines.find((m) => m.type === t);
    const cut = byType('cutting');
    const ls = byType('lockstitch');
    const ol = byType('overlock');
    const qc = byType('quality_check');
    if (cut && ls) st.addConnection(cut.id, ls.id);
    if (ls && ol) st.addConnection(ls.id, ol.id);
    if (ol && qc) st.addConnection(ol.id, qc.id);
  }, [machines]);

  return (
    <div className="flex flex-1 min-h-0 w-full relative">
      <FactorySidebar />
      <div className="flex-1 relative min-w-0 min-h-0">
        <FactoryCanvas />
      </div>
      <InspectionPanel />
    </div>
  );
}
