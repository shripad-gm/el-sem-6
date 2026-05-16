import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Users } from 'lucide-react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { StaffKpiGrid } from '../components/staff/StaffKpiGrid';
import { StaffTableSection } from '../components/staff/StaffTableSection';
import { WorkerDetailPanel } from '../components/staff/WorkerDetailPanel';
import { MachineAssignmentDeck } from '../components/staff/MachineAssignmentDeck';
import { AttendanceShiftPanel } from '../components/staff/AttendanceShiftPanel';
import { PayrollAnalyticsDeck, WorkforceInsightsAndLive, StaffVisualizationRow } from '../components/staff/StaffAnalyticsBlocks';
import { useStaffStore, computeWorkforceKpis } from '../store/useStaffStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function StaffManagementPage() {
  useDocumentTitle('Staff Management');
  const workers = useStaffStore((s) => s.workers);
  const kpis = useMemo(() => computeWorkforceKpis(workers), [workers]);

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
              <Users className="w-3.5 h-3.5 text-brand-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-primary/90">Workforce orchestration</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Staff management <span className="text-brand-primary">control</span>
            </h1>
            <p className="text-sm text-white/50 max-w-3xl leading-relaxed">
              GarmentFlow workforce intelligence — supervisors assign operators to machines and workflows, monitor attendance and
              shifts, steer payroll exposure, and read AI-style utilization signals aligned with the MSME MES industrial shell.
            </p>
          </div>
          <GlassPanel className="shrink-0 px-4 py-3 border border-white/10 flex items-center gap-3 bg-gradient-to-br from-brand-primary/10 to-transparent">
            <Cpu className="w-8 h-8 text-brand-primary/80" />
            <div>
              <p className="text-[10px] uppercase font-bold text-white/35 tracking-widest">MES link</p>
              <p className="text-xs font-semibold text-white/80">Garment factory twin · roster sync</p>
              <p className="text-[10px] text-white/40 mt-0.5">Workforce module v1 · operational mock data</p>
            </div>
          </GlassPanel>
        </motion.header>

        <section className="space-y-3">
          <SectionLabel kicker="Analytics deck" title="Top workforce KPIs" subtitle="Animated counters · industrial glass HUD" />
          <StaffKpiGrid kpis={kpis} />
        </section>

        <section className="space-y-3">
          <SectionLabel kicker="Roster" title="Staff overview table" subtitle="Search, filters, sorting, pagination, status mesh" />
          <StaffTableSection />
        </section>

        <section className="space-y-3">
          <SectionLabel kicker="Orchestration" title="Machine assignment & routing" subtitle="Drag-drop pool · dropdown rails · shift staffing" />
          <MachineAssignmentDeck />
        </section>

        <section className="space-y-3">
          <SectionLabel kicker="Time domain" title="Attendance & shift management" subtitle="Overrides · weekly pulse · heat calendar" />
          <AttendanceShiftPanel />
        </section>

        <section className="space-y-3">
          <SectionLabel kicker="Compensation" title="Salary & payroll dashboard" subtitle="Department cost allocation · OT roll-up" />
          <PayrollAnalyticsDeck />
        </section>

        <section className="space-y-3">
          <SectionLabel kicker="Intelligence mesh" title="Optimization insights & live status" subtitle="Simulated AI signals · real-time tiles" />
          <WorkforceInsightsAndLive />
        </section>

        <section className="space-y-3">
          <SectionLabel kicker="Visualization stack" title="Workforce utilization views" subtitle="Productivity · heatmap · gauge" />
          <StaffVisualizationRow />
        </section>
      </div>

      <WorkerDetailPanel />
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
