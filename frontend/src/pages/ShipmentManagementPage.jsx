import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Truck } from 'lucide-react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { ShipmentKpiGrid } from '../components/shipments/ShipmentKpiGrid';
import { ShipmentTableSection } from '../components/shipments/ShipmentTableSection';
import { ShipmentDetailPanel } from '../components/shipments/ShipmentDetailPanel';
import { ShipmentInsightsBlock } from '../components/shipments/ShipmentInsightsBlock';
import { ShipmentChartsRow } from '../components/shipments/ShipmentChartsRow';
import { useShipmentStore, computeShipmentKpis } from '../store/useShipmentStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function ShipmentManagementPage() {
  useDocumentTitle('Shipment Management');
  const shipments = useShipmentStore((s) => s.shipments);
  const kpis = useMemo(() => computeShipmentKpis(shipments), [shipments]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar relative">
      <div className="absolute inset-0 factory-grid opacity-40 pointer-events-none" />
      <div className="relative z-10 p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto space-y-6 pb-24">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col xl:flex-row xl:items-end justify-between gap-4"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/30 bg-brand-secondary/10 px-3 py-1">
              <Truck className="w-3.5 h-3.5 text-brand-secondary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-secondary/90">Logistics twin</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Shipment management <span className="text-brand-secondary">intelligence</span>
            </h1>
            <p className="text-sm text-white/50 max-w-3xl leading-relaxed">
              Smart garment dispatch grid — monitor carriers, detect delay risk, read dispatch queue health, and visualize delivery analytics
              in the same holographic industrial shell as the wider GarmentFlow MES.
            </p>
          </div>
          <GlassPanel className="shrink-0 px-4 py-3 border border-white/10 flex items-center gap-3 bg-gradient-to-br from-brand-primary/10 to-transparent">
            <Cpu className="w-8 h-8 text-brand-primary/80" />
            <div>
              <p className="text-[10px] uppercase font-bold text-white/35 tracking-widest">Industry 4.0</p>
              <p className="text-xs font-semibold text-white/80">Dock → last-mile telemetry</p>
              <p className="text-[10px] text-white/40 mt-0.5">Operational mock · live UI state</p>
            </div>
          </GlassPanel>
        </motion.header>

        <section className="space-y-3">
          <SectionLabel kicker="Analytics deck" title="Shipment KPIs" subtitle="Animated counters · glowing HUD · carrier health" />
          <ShipmentKpiGrid kpis={kpis} />
        </section>

        <section className="space-y-3">
          <SectionLabel kicker="Dispatch control" title="Shipment matrix" subtitle="Search · filters · sort · pagination · dossier" />
          <ShipmentTableSection />
        </section>

        <section className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <SectionLabel kicker="Intelligence" title="AI-style shipment insights" subtitle="Simulated logistics signals" />
            <ShipmentInsightsBlock />
          </div>
          <div className="lg:col-span-3 space-y-3">
            <SectionLabel kicker="Visualization stack" title="Delivery & dispatch analytics" subtitle="Recharts · timelines · donuts" />
            <ShipmentChartsRow />
          </div>
        </section>
      </div>

      <ShipmentDetailPanel />
    </div>
  );
}

function SectionLabel({ kicker, title, subtitle }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-white/10 pb-2">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-brand-primary/75">{kicker}</p>
        <h2 className="text-base md:text-lg font-bold text-white mt-0.5">{title}</h2>
        <p className="text-[11px] text-white/40 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
