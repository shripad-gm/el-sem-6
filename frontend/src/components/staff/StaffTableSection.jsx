import { useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  MoreHorizontal,
} from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { STATUS_STYLES, statusLabel, formatInr } from './staffUiUtils';
import { useStaffStore, selectFilteredWorkers } from '../../store/useStaffStore';
import { MACHINE_POOL } from '../../data/staffSeed';

export function StaffTableSection() {
  const workers = useStaffStore((s) => s.workers);
  const searchQuery = useStaffStore((s) => s.searchQuery);
  const setSearchQuery = useStaffStore((s) => s.setSearchQuery);
  const filterRole = useStaffStore((s) => s.filterRole);
  const setFilterRole = useStaffStore((s) => s.setFilterRole);
  const filterShift = useStaffStore((s) => s.filterShift);
  const setFilterShift = useStaffStore((s) => s.setFilterShift);
  const filterAttendance = useStaffStore((s) => s.filterAttendance);
  const setFilterAttendance = useStaffStore((s) => s.setFilterAttendance);
  const filterMachine = useStaffStore((s) => s.filterMachine);
  const setFilterMachine = useStaffStore((s) => s.setFilterMachine);
  const filterProductivity = useStaffStore((s) => s.filterProductivity);
  const setFilterProductivity = useStaffStore((s) => s.setFilterProductivity);
  const sortKey = useStaffStore((s) => s.sortKey);
  const sortDir = useStaffStore((s) => s.sortDir);
  const setSort = useStaffStore((s) => s.setSort);
  const page = useStaffStore((s) => s.page);
  const pageSize = useStaffStore((s) => s.pageSize);
  const setPage = useStaffStore((s) => s.setPage);
  const selectWorker = useStaffStore((s) => s.selectWorker);
  const selectedWorkerId = useStaffStore((s) => s.selectedWorkerId);
  const meta = useStaffStore((s) => s.meta);

  const { pageRows, total } = useMemo(
    () =>
      selectFilteredWorkers({
        workers,
        searchQuery,
        filterRole,
        filterShift,
        filterAttendance,
        filterMachine,
        filterProductivity,
        sortKey,
        sortDir,
        page,
        pageSize,
      }),
    [
      workers,
      searchQuery,
      filterRole,
      filterShift,
      filterAttendance,
      filterMachine,
      filterProductivity,
      sortKey,
      sortDir,
      page,
      pageSize,
    ]
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages, setPage]);

  const cycleSort = (key) => {
    if (sortKey !== key) setSort(key, 'asc');
    else setSort(key, sortDir === 'asc' ? 'desc' : 'asc');
  };

  return (
    <GlassPanel className="border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary/80">Workforce roster</p>
            <h2 className="text-lg font-bold text-white mt-1">Staff overview</h2>
            <p className="text-[11px] text-white/45 mt-0.5">Industrial table · search, filter, sort, paginate</p>
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, ID, role…"
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-brand-primary/40"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterSelect label="Role" value={filterRole} onChange={setFilterRole} options={['all', ...meta.roles]} />
          <FilterSelect
            label="Shift"
            value={filterShift}
            onChange={setFilterShift}
            options={['all', ...meta.shifts.map((s) => s.id)]}
            format={(v) => (v === 'all' ? 'All' : meta.shifts.find((s) => s.id === v)?.label ?? v)}
          />
          <FilterSelect
            label="Attendance"
            value={filterAttendance}
            onChange={setFilterAttendance}
            options={['all', 'present', 'absent', 'leave', 'late', 'half', 'overtime']}
            format={(v) => (v === 'all' ? 'All' : v)}
          />
          <FilterSelect
            label="Machine"
            value={filterMachine}
            onChange={setFilterMachine}
            options={['all', 'unassigned', ...MACHINE_POOL.map((m) => m.id)]}
            format={(v) => {
              if (v === 'all') return 'All';
              if (v === 'unassigned') return 'Unassigned';
              return MACHINE_POOL.find((m) => m.id === v)?.code ?? v;
            }}
          />
          <FilterSelect
            label="Productivity"
            value={filterProductivity}
            onChange={setFilterProductivity}
            options={['all', 'high', 'mid', 'low']}
            format={(v) =>
              v === 'all' ? 'All' : v === 'high' ? 'High (≥85%)' : v === 'mid' ? 'Mid (70–84%)' : 'Low (<70%)'
            }
          />
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-[1100px] w-full text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-white/40 border-b border-white/10 bg-white/[0.03]">
              <th className="px-3 py-3 font-bold">Employee ID</th>
              <th className="px-3 py-3 font-bold">
                <button type="button" className="inline-flex items-center gap-1 hover:text-brand-primary" onClick={() => cycleSort('name')}>
                  Name <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-bold">Role</th>
              <th className="px-3 py-3 font-bold">Assigned Machine</th>
              <th className="px-3 py-3 font-bold">Assigned Workflow</th>
              <th className="px-3 py-3 font-bold">
                <button type="button" className="inline-flex items-center gap-1 hover:text-brand-primary" onClick={() => cycleSort('shift')}>
                  Shift <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-bold">Attendance</th>
              <th className="px-3 py-3 font-bold">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-brand-primary"
                  onClick={() => cycleSort('productivity')}
                >
                  Productivity <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-bold">
                <button type="button" className="inline-flex items-center gap-1 hover:text-brand-primary" onClick={() => cycleSort('salary')}>
                  Salary <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-bold">Current Status</th>
              <th className="px-3 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((w) => {
              const activeRow = selectedWorkerId === w.id;
              return (
                <tr
                  key={w.id}
                  onClick={() => selectWorker(w.id)}
                  className={`border-b border-white/5 cursor-pointer transition-colors ${
                    activeRow ? 'bg-brand-primary/10' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <td className="px-3 py-2.5 font-mono text-white/70">{w.employeeId}</td>
                  <td className="px-3 py-2.5 text-white font-semibold">{w.name}</td>
                  <td className="px-3 py-2.5 text-white/60">{w.role}</td>
                  <td className="px-3 py-2.5 text-brand-primary/90 font-mono text-[10px]">{w.assignedMachineCode}</td>
                  <td className="px-3 py-2.5 text-white/55 max-w-[200px] truncate">{w.assignedWorkflow}</td>
                  <td className="px-3 py-2.5 text-white/55">{w.shiftLabel}</td>
                  <td className="px-3 py-2.5">
                    <span className="capitalize text-white/70">{w.attendance.replace('_', ' ')}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-secondary to-brand-primary"
                          style={{ width: `${Math.min(100, w.productivity)}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-white/80">{w.productivity}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-white/80 tabular-nums">{formatInr(w.totalPayable)}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${STATUS_STYLES[w.status] ?? STATUS_STYLES.idle}`}
                    >
                      {statusLabel(w.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => selectWorker(w.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-white/50 hover:text-brand-primary hover:border-brand-primary/40 transition-colors"
                      title="Open operator dossier"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-white/10 bg-black/20">
        <p className="text-[10px] text-white/40">
          Showing <span className="text-white/70 font-mono">{(page - 1) * pageSize + 1}</span>–
          <span className="text-white/70 font-mono">{Math.min(page * pageSize, total)}</span> of{' '}
          <span className="text-white/70 font-mono">{total}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-semibold text-white/70 hover:border-brand-primary/40 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-[11px] font-mono text-white/50 px-2">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-semibold text-white/70 hover:border-brand-primary/40 disabled:opacity-30"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}

function FilterSelect({ label, value, onChange, options, format = (v) => v }) {
  return (
    <label className="flex flex-col gap-1 text-[9px] uppercase font-bold tracking-wider text-white/35">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white/80 font-semibold focus:outline-none focus:border-brand-primary/40 min-w-[120px]"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-industrial-bg text-white">
            {format(o)}
          </option>
        ))}
      </select>
    </label>
  );
}
