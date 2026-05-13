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
  LineChart,
  Line,
} from 'recharts';
import { motion } from 'framer-motion';
import { GlassPanel } from '../ui/GlassPanel';
import { useShipmentStore } from '../../store/useShipmentStore';
import { SHIPMENT_STATUS_LABEL } from './shipmentUiUtils';

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

export function ShipmentChartsRow() {
  const shipments = useShipmentStore((s) => s.shipments);
  const meta = useShipmentStore((s) => s.meta);

  const statusDonut = useMemo(() => {
    const m = {};
    shipments.forEach((s) => {
      m[s.status] = (m[s.status] || 0) + 1;
    });
    return Object.entries(m).map(([k, value]) => ({ name: SHIPMENT_STATUS_LABEL[k] ?? k, value, key: k }));
  }, [shipments]);

  const carrierPerf = useMemo(() => {
    return meta.carriers.map((c) => {
      const subset = shipments.filter((s) => s.carrierId === c.id);
      const delivered = subset.filter((s) => s.status === 'delivered').length;
      const score = subset.length ? Math.round((delivered / subset.length) * 100) : 0;
      return { name: c.name.split(' ')[0], score, loads: subset.length };
    });
  }, [shipments, meta.carriers]);

  const dispatchSeries = useMemo(() => {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({
      day: d,
      dispatched: 4 + (i % 4) + (shipments.length % 3),
      delayed: i === 3 || i === 5 ? 2 : 0,
    }));
  }, [shipments.length]);

  const timeline = useMemo(() => {
    return shipments.slice(0, 10).map((s) => ({
      id: s.shipmentId,
      lead: s.status === 'delivered' ? 2.8 : s.status === 'delayed' ? 5.6 : 3.9,
    }));
  }, [shipments]);

  const COLORS = [CYAN, VIOLET, PINK, GREEN, ORANGE];

  return (
    <div className="grid xl:grid-cols-2 gap-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <GlassPanel className="p-4 border border-white/10 h-[300px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-1">Dispatch graph</p>
          <h3 className="text-sm font-bold text-white mb-2">Weekly dispatch vs delay spikes</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dispatchSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 6" />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Bar dataKey="dispatched" fill={CYAN} radius={[6, 6, 0, 0]} name="Dispatched" />
                <Bar dataKey="delayed" fill={ORANGE} radius={[6, 6, 0, 0]} name="Delayed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <GlassPanel className="p-4 border border-white/10 h-[300px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-1">Carrier performance</p>
          <h3 className="text-sm font-bold text-white mb-2">On-time delivery score · %</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carrierPerf} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 6" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={88} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} fill={VIOLET} name="Score %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
        <GlassPanel className="p-4 border border-white/10 h-[300px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-1">Shipment timelines</p>
          <h3 className="text-sm font-bold text-white mb-2">Simulated lead-time · days</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 6" />
                <XAxis dataKey="id" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Line type="monotone" dataKey="lead" stroke={PINK} strokeWidth={2} dot={{ r: 3, fill: CYAN }} name="Lead days" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
        <GlassPanel className="p-4 border border-white/10 h-[300px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-1">Delivery analytics</p>
          <h3 className="text-sm font-bold text-white mb-2">Shipment status donut</h3>
          <div className="h-[220px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={tipStyle} />
                <Pie data={statusDonut} dataKey="value" nameKey="name" innerRadius={54} outerRadius={80} paddingAngle={2} stroke="rgba(255,255,255,0.08)">
                  {statusDonut.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.12 }} className="xl:col-span-2">
        <GlassPanel className="p-4 border border-white/10 h-[280px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-1">Delivery analytics</p>
          <h3 className="text-sm font-bold text-white mb-2">Network dwell · hours in hub</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { h: '00', dwell: 1.1 },
                  { h: '04', dwell: 1.4 },
                  { h: '08', dwell: 2.6 },
                  { h: '12', dwell: 3.4 },
                  { h: '16', dwell: 2.9 },
                  { h: '20', dwell: 1.8 },
                ]}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="dwellGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={VIOLET} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={VIOLET} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID} strokeDasharray="3 6" />
                <XAxis dataKey="h" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Area type="monotone" dataKey="dwell" stroke={VIOLET} fill="url(#dwellGrad)" strokeWidth={2} name="Dwell h" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
