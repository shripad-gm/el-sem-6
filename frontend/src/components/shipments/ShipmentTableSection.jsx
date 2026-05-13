import { useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { PRIORITY_BADGE, PRIORITY_LABEL } from '../orders/orderUiUtils';
import { SHIPMENT_STATUS_BADGE, SHIPMENT_STATUS_LABEL } from './shipmentUiUtils';
import { useShipmentStore, selectFilteredShipments } from '../../store/useShipmentStore';

export function ShipmentTableSection() {
  const shipments = useShipmentStore((s) => s.shipments);
  const searchQuery = useShipmentStore((s) => s.searchQuery);
  const setSearchQuery = useShipmentStore((s) => s.setSearchQuery);
  const filterStatus = useShipmentStore((s) => s.filterStatus);
  const setFilterStatus = useShipmentStore((s) => s.setFilterStatus);
  const filterCarrier = useShipmentStore((s) => s.filterCarrier);
  const setFilterCarrier = useShipmentStore((s) => s.setFilterCarrier);
  const sortKey = useShipmentStore((s) => s.sortKey);
  const sortDir = useShipmentStore((s) => s.sortDir);
  const setSort = useShipmentStore((s) => s.setSort);
  const page = useShipmentStore((s) => s.page);
  const pageSize = useShipmentStore((s) => s.pageSize);
  const setPage = useShipmentStore((s) => s.setPage);
  const selectShipment = useShipmentStore((s) => s.selectShipment);
  const selectedShipmentId = useShipmentStore((s) => s.selectedShipmentId);
  const meta = useShipmentStore((s) => s.meta);

  const { pageRows, total } = useMemo(
    () =>
      selectFilteredShipments({
        shipments,
        searchQuery,
        filterStatus,
        filterCarrier,
        sortKey,
        sortDir,
        page,
        pageSize,
      }),
    [shipments, searchQuery, filterStatus, filterCarrier, sortKey, sortDir, page, pageSize]
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
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary/80">Logistics mesh</p>
            <h2 className="text-lg font-bold text-white mt-1">Shipment dispatch board</h2>
            <p className="text-[11px] text-white/45 mt-0.5">Carrier orchestration · ETA risk · RFID trace</p>
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shipment, order, AWB…"
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-brand-primary/40"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterSelect
            label="Status"
            value={filterStatus}
            onChange={setFilterStatus}
            options={['all', ...meta.statuses]}
            format={(v) => (v === 'all' ? 'All' : SHIPMENT_STATUS_LABEL[v] ?? v)}
          />
          <FilterSelect
            label="Carrier"
            value={filterCarrier}
            onChange={setFilterCarrier}
            options={['all', ...meta.carriers.map((c) => c.id)]}
            format={(v) => (v === 'all' ? 'All' : meta.carriers.find((c) => c.id === v)?.name ?? v)}
          />
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-[1180px] w-full text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-white/40 border-b border-white/10 bg-white/[0.03]">
              <th className="px-3 py-3 font-bold">
                <button type="button" className="inline-flex items-center gap-1 hover:text-brand-primary" onClick={() => cycleSort('shipmentId')}>
                  Shipment ID <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-bold">
                <button type="button" className="inline-flex items-center gap-1 hover:text-brand-primary" onClick={() => cycleSort('orderId')}>
                  Order ID <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-bold">Carrier</th>
              <th className="px-3 py-3 font-bold">
                <button type="button" className="inline-flex items-center gap-1 hover:text-brand-primary" onClick={() => cycleSort('dispatch')}>
                  Dispatch Date <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-bold">
                <button type="button" className="inline-flex items-center gap-1 hover:text-brand-primary" onClick={() => cycleSort('expected')}>
                  Expected Delivery <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-3 py-3 font-bold">Current Status</th>
              <th className="px-3 py-3 font-bold">Destination</th>
              <th className="px-3 py-3 font-bold">Tracking Number</th>
              <th className="px-3 py-3 font-bold">Shipment Priority</th>
              <th className="px-3 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((s) => {
              const activeRow = selectedShipmentId === s.id;
              return (
                <tr
                  key={s.id}
                  onClick={() => selectShipment(s.id)}
                  className={`border-b border-white/5 cursor-pointer transition-colors ${
                    activeRow ? 'bg-brand-primary/10' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <td className="px-3 py-2.5 font-mono text-brand-primary/90">{s.shipmentId}</td>
                  <td className="px-3 py-2.5 font-mono text-white/70">{s.orderId}</td>
                  <td className="px-3 py-2.5 text-white/65 max-w-[160px] truncate">{s.carrier}</td>
                  <td className="px-3 py-2.5 font-mono text-white/60">{s.dispatchDate}</td>
                  <td className="px-3 py-2.5 font-mono text-white/60">{s.expectedDelivery}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        SHIPMENT_STATUS_BADGE[s.status] ?? SHIPMENT_STATUS_BADGE.preparing
                      }`}
                    >
                      {SHIPMENT_STATUS_LABEL[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-white/55 max-w-[200px] truncate">{s.destination}</td>
                  <td className="px-3 py-2.5 font-mono text-[10px] text-brand-secondary/90">{s.trackingNumber}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        PRIORITY_BADGE[s.priority] ?? PRIORITY_BADGE.medium
                      }`}
                    >
                      {PRIORITY_LABEL[s.priority] ?? s.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => selectShipment(s.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-white/50 hover:text-brand-primary hover:border-brand-primary/40 transition-colors"
                      title="Open shipment dossier"
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
        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white/80 font-semibold focus:outline-none focus:border-brand-primary/40 min-w-[140px]"
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
