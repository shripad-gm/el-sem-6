import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Timer } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { useStaffStore } from '../../store/useStaffStore';

const ATT_OPTIONS = [
  { id: 'present', label: 'Present' },
  { id: 'absent', label: 'Absent' },
  { id: 'leave', label: 'Leave' },
  { id: 'late', label: 'Late Check-in' },
  { id: 'half', label: 'Half Day' },
  { id: 'overtime', label: 'Overtime' },
];

export function AttendanceShiftPanel() {
  const workers = useStaffStore((s) => s.workers);
  const setAttendance = useStaffStore((s) => s.setAttendance);
  const [calOffset, setCalOffset] = useState(0);

  const stats = useMemo(() => {
    const counts = { present: 0, absent: 0, leave: 0, late: 0, half: 0, overtime: 0 };
    workers.forEach((w) => {
      if (counts[w.attendance] !== undefined) counts[w.attendance]++;
    });
    return counts;
  }, [workers]);

  const weekBars = useMemo(() => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return days.map((d, i) => {
      const base = 72 + ((i * 17 + calOffset * 3) % 23);
      return { d, v: Math.min(100, base) };
    });
  }, [calOffset]);

  const monthMatrix = useMemo(() => {
    const cells = [];
    for (let i = 0; i < 35; i++) {
      const intensity = (i * 13 + calOffset * 7) % 100;
      cells.push(intensity);
    }
    return cells;
  }, [calOffset]);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <GlassPanel className="p-4 border border-white/10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary/80">Time & attendance</p>
            <h3 className="text-base font-bold text-white mt-0.5">Attendance management</h3>
          </div>
          <CalendarDays className="w-7 h-7 text-brand-primary/35" />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {ATT_OPTIONS.map((a) => (
            <div key={a.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-center">
              <p className="text-[9px] uppercase font-bold text-white/35 tracking-wide">{a.label}</p>
              <p className="text-lg font-mono text-white mt-1">{stats[a.id] ?? 0}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Floor roster · status override</p>
          <Timer className="w-4 h-4 text-white/25" />
        </div>
        <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
          {workers.map((w) => (
            <div key={w.id} className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/25 px-2 py-1.5">
              <span className="text-[11px] text-white/80 truncate flex-1 min-w-0">{w.name}</span>
              <select
                value={w.attendance}
                onChange={(e) => setAttendance(w.id, e.target.value)}
                className="bg-black/50 border border-white/10 rounded-md px-2 py-1 text-[10px] text-white/80 focus:outline-none focus:border-brand-primary/40 max-w-[130px]"
              >
                {ATT_OPTIONS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-4 border border-white/10 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-secondary/90">Rhythm analytics</p>
            <h3 className="text-base font-bold text-white mt-0.5">Calendar & weekly pulse</h3>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setCalOffset((c) => c - 1)}
              className="px-2 py-1 rounded-md border border-white/10 text-[10px] text-white/50 hover:border-brand-primary/40"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setCalOffset((c) => c + 1)}
              className="px-2 py-1 rounded-md border border-white/10 text-[10px] text-white/50 hover:border-brand-primary/40"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-white/40 mb-2">Weekly attendance rate (%)</p>
          <div className="flex items-end gap-2 h-32 px-1">
            {weekBars.map((b, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand-secondary/30 to-brand-primary/90 border border-brand-primary/20"
                  initial={{ height: 0 }}
                  animate={{ height: `${b.v}%` }}
                  transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ maxHeight: '100%' }}
                />
                <span className="text-[10px] font-mono text-white/40">{b.d}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] text-white/40 mb-2">Monthly attendance heatmap (simulated)</p>
          <div className="grid grid-cols-7 gap-1">
            {monthMatrix.map((int, i) => (
              <div
                key={i}
                className="aspect-square rounded-md border border-white/5"
                style={{
                  background: `rgba(0,242,255,${0.05 + int / 140})`,
                  boxShadow: int > 70 ? '0 0 12px rgba(0,242,255,0.15)' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 p-3 bg-white/[0.02] text-[11px] text-white/55">
          <span className="text-brand-primary font-bold">Summary:</span> Late arrivals trending down vs prior week. Overtime
          concentrated on <span className="text-white/80">Night Shift</span> finishing high-SMV styles.
        </div>
      </GlassPanel>
    </div>
  );
}
