import { FactorySidebar } from '../components/layout/FactorySidebar';
import { InspectionPanel } from '../components/layout/InspectionPanel';
import { FactoryCanvas } from '../components/factory/FactoryCanvas';
import { useTelemetry } from '../hooks/useTelemetry';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/**
 * Full GarmentFlow Twin digital twin — exclusive home for the 3D factory MES experience.
 */
export default function WorkflowManagementPage() {
  useDocumentTitle('Digital Twin');
  useTelemetry();

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
