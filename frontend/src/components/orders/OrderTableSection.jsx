import { useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, MoreHorizontal, Plus } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import {
  ORDER_STATUS_BADGE,
  ORDER_STATUS_LABEL,
  PRIORITY_BADGE,
  PRIORITY_LABEL,
} from './orderUiUtils';
import { useOrderStore, selectFilteredOrders } from '../../store/useOrderStore';

export function OrderTableSection() {
  const orders = useOrderStore((s) => s.orders);
  const searchQuery = useOrderStore((s) => s.searchQuery);
  const setSearchQuery = useOrderStore((s) => s.setSearchQuery);
  const filterStatus = useOrderStore((s) => s.filterStatus);
  const setFilterStatus = useOrderStore((s) => s.setFilterStatus);
  const filterPriority = useOrderStore((s) => s.filterPriority);
  const setFilterPriority = useOrderStore((s) => s.setFilterPriority);
  const filterWorkflow = useOrderStore((s) => s.filterWorkflow);
  const setFilterWorkflow = useOrderStore((s) => s.setFilterWorkflow);
  const sortKey = useOrderStore((s) => s.sortKey);
  const sortDir = useOrderStore((s) => s.sortDir);
  const setSort = useOrderStore((s) => s.setSort);
  const page = useOrderStore((s) => s.page);
  const pageSize = useOrderStore((s) => s.pageSize);
  const setPage = useOrderStore((s) => s.setPage);
  const selectOrder = useOrderStore((s) => s.selectOrder);
  const selectedOrderId = useOrderStore((s) => s.selectedOrderId);
  const meta = useOrderStore((s) => s.meta);
  const setCreateOpen = useOrderStore((s) => s.setCreateOpen);

  const { pageRows, total } = useMemo(
    () =>
      selectFilteredOrders({
        orders,
        searchQuery,
        filterStatus,
        filterPriority,
        filterWorkflow,
        sortKey,
        sortDir,
        page,
        pageSize,
      }),
    [
      orders,
      searchQuery,
      filterStatus,
      filterPriority,
      filterWorkflow,
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
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary/80">Production control</p>
            <h2 className="text-lg font-bold text-white mt-1">Garment order matrix</h2>
            <p className="text-[11px] text-white/45 mt-0.5">Industrial routing · SLA · workflow assignment</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:items-center">
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order, style, supervisor…"
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-brand-primary/40"
              />
            </div>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-brand-primary/40 bg-brand-primary/10 text-xs font-bold uppercase tracking-wide text-brand-primary hover:bg-brand-primary/20 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              New order
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterSelect
            label="Status"
            value={filterStatus}
            onChange={setFilterStatus}
            options={['all', ...meta.statuses]}
            format={(v) => (v === 'all' ? 'All' : ORDER_STATUS_LABEL[v] ?? v)}
          />
          <FilterSelect
            label="Priority"
            value={filterPriority}
            onChange={setFilterPriority}
            options={['all', ...meta.priorities]}
            format={(v) => (v === 'all' ? 'All' : PRIORITY_LABEL[v] ?? v)}
          />
          <FilterSelect
            label="Workflow"
            value={filterWorkflow}
            onChange={setFilterWorkflow}
            options={['all', ...meta.workflows.map((w) => w.id)]}
            format={(v) => (v === 'all' ? 'All' : meta.workflows.find((w) => w.id === v)?.label ?? v)}
          />
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-[1280px] w-full text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-white/40 border-b border-white/10 bg-white/[0.03]">
              <th className="px-3 py-3 font-bold">
                <button type="button" className="inline-flex items-center gap-1 hover:text-brand-primary" onClick={() => cycleSort('orderId')}>
                  Order ID <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-bold">
                <button type="button" className="inline-flex items-center gap-1 hover:text-brand-primary" onClick={() => cycleSort('productName')}>
                  Product Name <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-bold">
                <button type="button" className="inline-flex items-center gap-1 hover:text-brand-primary" onClick={() => cycleSort('quantity')}>
                  Quantity <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-bold">Assigned Workflow</th>
              <th className="px-3 py-3 font-bold">Production Status</th>
              <th className="px-3 py-3 font-bold">
                <button type="button" className="inline-flex items-center gap-1 hover:text-brand-primary" onClick={() => cycleSort('deadline')}>
                  Deadline <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-bold">
                <button type="button" className="inline-flex items-center gap-1 hover:text-brand-primary" onClick={() => cycleSort('completion')}>
                  Completion % <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-bold">Priority</th>
              <th className="px-3 py-3 font-bold">Assigned Supervisor</th>
              <th className="px-3 py-3 font-bold">Current Stage</th>
              <th className="px-3 py-3 font-bold">Estimated Completion</th>
              <th className="px-3 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((o) => {
              const activeRow = selectedOrderId === o.id;
              return (
                <tr
                  key={o.id}
                  onClick={() => selectOrder(o.id)}
                  className={`border-b border-white/5 cursor-pointer transition-colors ${
                    activeRow ? 'bg-brand-primary/10' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <td className="px-3 py-2.5 font-mono text-brand-primary/90">{o.orderId}</td>
                  <td className="px-3 py-2.5 text-white font-semibold max-w-[200px] truncate">{o.productName}</td>
                  <td className="px-3 py-2.5 text-white/70 tabular-nums">{o.quantity.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-2.5 text-white/55 max-w-[220px] truncate">{o.assignedWorkflow}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${ORDER_STATUS_BADGE[o.status] ?? ORDER_STATUS_BADGE.pending}`}
                    >
                      {ORDER_STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-white/65">{o.deadline}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-secondary to-brand-primary"
                          style={{ width: `${Math.min(100, o.completionPct)}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-white/80">{o.completionPct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${PRIORITY_BADGE[o.priority] ?? PRIORITY_BADGE.medium}`}
                    >
                      {PRIORITY_LABEL[o.priority] ?? o.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-white/65">{o.supervisor}</td>
                  <td className="px-3 py-2.5 text-brand-primary/85">{o.currentStage}</td>
                  <td className="px-3 py-2.5 font-mono text-white/55">{o.estimatedCompletion}</td>
                  <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => selectOrder(o.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-white/50 hover:text-brand-primary hover:border-brand-primary/40 transition-colors"
                      title="Open order dossier"
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
        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white/80 font-semibold focus:outline-none focus:border-brand-primary/40 min-w-[130px]"
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
