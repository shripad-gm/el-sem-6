import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Cpu } from 'lucide-react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { OrderKpiGrid } from '../components/orders/OrderKpiGrid';
import { OrderTableSection } from '../components/orders/OrderTableSection';
import { OrderDetailPanel } from '../components/orders/OrderDetailPanel';
import { OrderInsightsBlock } from '../components/orders/OrderInsightsBlock';
import { OrderChartsRow } from '../components/orders/OrderChartsRow';
import { CreateOrderModal } from '../components/orders/CreateOrderModal';
import { useOrderStore, computeOrderKpis } from '../store/useOrderStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function OrderManagementPage() {
  useDocumentTitle('Order Management');
  const orders = useOrderStore((s) => s.orders);
  const kpis = useMemo(() => computeOrderKpis(orders), [orders]);

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
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1">
              <ClipboardList className="w-3.5 h-3.5 text-brand-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-primary/90">Garment production control</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Order management <span className="text-brand-primary">orchestration</span>
            </h1>
            <p className="text-sm text-white/50 max-w-3xl leading-relaxed">
              Industry 4.0 style production order cockpit — supervisors create PO-backed manufacturing orders, monitor SLA risk, assign
              workflow lines, and read bottleneck-aware intelligence aligned with the GarmentFlow MES shell.
            </p>
          </div>
          <GlassPanel className="shrink-0 px-4 py-3 border border-white/10 flex items-center gap-3 bg-gradient-to-br from-brand-secondary/10 to-transparent">
            <Cpu className="w-8 h-8 text-brand-secondary/80" />
            <div>
              <p className="text-[10px] uppercase font-bold text-white/35 tracking-widest">MES twin</p>
              <p className="text-xs font-semibold text-white/80">Cut → pack digital thread</p>
              <p className="text-[10px] text-white/40 mt-0.5">Operational mock · live UI state</p>
            </div>
          </GlassPanel>
        </motion.header>

        <section className="space-y-3">
          <SectionLabel kicker="Analytics deck" title="Production order KPIs" subtitle="Animated counters · SLA mesh · bottleneck radar" />
          <OrderKpiGrid kpis={kpis} />
        </section>

        <section className="space-y-3">
          <SectionLabel kicker="Control room" title="Order matrix" subtitle="Search · filters · sort · pagination · dossier panel" />
          <OrderTableSection />
        </section>

        <section className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <SectionLabel kicker="Intelligence" title="AI-style order insights" subtitle="Simulated signals · delay risk · line load" />
            <OrderInsightsBlock />
          </div>
          <div className="lg:col-span-3 space-y-3">
            <SectionLabel kicker="Visualization stack" title="Manufacturing analytics" subtitle="Recharts · holographic telemetry" />
            <OrderChartsRow />
          </div>
        </section>
      </div>

      <OrderDetailPanel />
      <CreateOrderModal />
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
