import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';
import { GlassPanel } from '../ui/GlassPanel';
import { useOrderStore } from '../../store/useOrderStore';
import { ORDER_STATUS_LABEL } from './orderUiUtils';

const CYAN = '#00f2ff';
const VIOLET = '#7000ff';
const PINK = '#ff00c8';
const GREEN = '#00ff88';
const ORANGE = '#ff8c00';
const GRID = 'rgba(255,255,255,0.06)';

const tipStyle = {
  backgroundColor: 'rgba(10,10,12,0.92)',
  border: '1px solid rgba(0,242,255,0.25)',
  borderRadius: 10,
  fontSize: 11,
  color: '#e8e8e8',
};

export function OrderChartsRow() {
  const orders = useOrderStore((s) => s.orders);

  const statusPie = useMemo(() => {
    const m = {};
    orders.forEach((o) => {
      m[o.status] = (m[o.status] || 0) + 1;
    });
    return Object.entries(m).map(([status, value]) => ({
      name: ORDER_STATUS_LABEL[status] ?? status,
      value,
      key: status,
    }));
  }, [orders]);

  const topCompletion = useMemo(() => {
    return [...orders]
      .sort((a, b) => b.completionPct - a.completionPct)
      .slice(0, 8)
      .map((o) => ({
        name: o.orderId,
        pct: o.completionPct,
        wf: o.assignedWorkflow.split('·')[0]?.trim() ?? o.assignedWorkflow,
      }));
  }, [orders]);

  const wfBottleneck = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const choke = o.stages?.find((s) => s.bottleneck)?.name ?? 'Balanced';
      map[choke] = (map[choke] || 0) + 1;
    });
    return Object.entries(map)
      .map(([stage, count]) => ({ stage, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [orders]);

  const timeline = useMemo(() => {
    const base = [62, 64, 68, 71, 69, 74, 78];
    return base.map((v, i) => ({
      day: `D-${i + 1}`,
      efficiency: v + (i % 2),
      wip: 40 + i * 4,
    }));
  }, []);

  const COLORS_PIE = [CYAN, VIOLET, PINK, GREEN, ORANGE];

  return (
    <div className="grid xl:grid-cols-2 gap-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <GlassPanel className="p-4 border border-white/10 h-[300px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-1">Production analytics</p>
          <h3 className="text-sm font-bold text-white mb-2">Plant efficiency pulse · 7d</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CYAN} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CYAN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID} strokeDasharray="3 6" />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Area type="monotone" dataKey="efficiency" stroke={CYAN} fill="url(#effGrad)" strokeWidth={2} name="Efficiency %" />
                <Area type="monotone" dataKey="wip" stroke={VIOLET} fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="WIP index" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <GlassPanel className="p-4 border border-white/10 h-[300px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-1">Completion progress</p>
          <h3 className="text-sm font-bold text-white mb-2">Top orders by completion %</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCompletion} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 6" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={72}
                  tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tipStyle} formatter={(v) => [`${v}%`, 'Complete']} />
                <Bar dataKey="pct" radius={[0, 6, 6, 0]} name="Completion">
                  {topCompletion.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? CYAN : VIOLET} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
        <GlassPanel className="p-4 border border-white/10 h-[300px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-1">Workflow bottleneck chart</p>
          <h3 className="text-sm font-bold text-white mb-2">Stage choke frequency</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wfBottleneck} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 6" />
                <XAxis dataKey="stage" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill={ORANGE} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.12 }}>
        <GlassPanel className="p-4 border border-white/10 h-[300px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-1">Order portfolio</p>
          <h3 className="text-sm font-bold text-white mb-2">Status distribution</h3>
          <div className="h-[220px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={tipStyle} />
                <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3} stroke="rgba(255,255,255,0.08)">
                  {statusPie.map((_, i) => (
                    <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
