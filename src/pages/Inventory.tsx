import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, ChevronLeft, ChevronRight, RefreshCw,
  Boxes, CheckCircle2, AlertTriangle, XCircle, ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventoryContext as useInventory } from '../context/InventoryContext';
import { InventoryService } from '../services';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import { KpiCard } from '../components/Loader';
import type { InventoryItem } from '../types';
import { deriveStatus, calcStats } from '../utils';
import { notify } from '../lib/toast';

type ModalType  = 'create' | 'stockIn' | 'stockOut' | null;
type FilterTab  = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
type SortKey    = 'name' | 'quantity_asc' | 'quantity_desc' | 'date';

const FILTER_TABS: { key: FilterTab; label: string; color: string }[] = [
  { key: 'all',           label: 'All',          color: 'text-gray-600 dark:text-gray-300' },
  { key: 'in_stock',      label: 'In Stock',     color: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'low_stock',     label: 'Low Stock',    color: 'text-amber-600 dark:text-amber-400' },
  { key: 'out_of_stock',  label: 'Out of Stock', color: 'text-red-600 dark:text-red-400' },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'date',          label: 'Newest first'    },
  { key: 'name',          label: 'Name A–Z'        },
  { key: 'quantity_desc', label: 'Qty: High → Low' },
  { key: 'quantity_asc',  label: 'Qty: Low → High' },
];

const labelCls = 'block text-[11.5px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider';
const infoBox  = (bg: string, border: string) => `${bg} ${border} border rounded-xl px-4 py-3.5`;

export default function Inventory() {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'ADMIN';
  const {
    items, allItems, loading, error, total, pages, page, search,
    setPage, setSearch, fetchItems, updateItem, addItem,
  } = useInventory();

  const [modal,        setModal]        = useState<ModalType>(null);
  const [selected,     setSelected]     = useState<InventoryItem | null>(null);
  const [qty,          setQty]          = useState('');
  const [name,         setName]         = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [nameErr,      setNameErr]      = useState('');
  const [qtyErr,       setQtyErr]       = useState('');
  const [awaitConfirm, setAwaitConfirm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [sortKey,      setSortKey]      = useState<SortKey>('date');
  const [sortOpen,     setSortOpen]     = useState(false);

  const openModal = (type: ModalType, item?: InventoryItem) => {
    setModal(type); setSelected(item ?? null);
    setQty(''); setName(''); setNameErr(''); setQtyErr(''); setAwaitConfirm(false);
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const validateQty = (val: string, max?: number) => {
    const n = parseInt(val);
    if (!val || isNaN(n) || n <= 0) return 'Enter a quantity greater than 0.';
    if (max !== undefined && n > max) return `Cannot exceed available stock (${max} units).`;
    return '';
  };

  const handleCreate = async () => {
    let ok = true;
    if (!name.trim()) { setNameErr('Item name is required.'); ok = false; }
    const qe = validateQty(qty);
    if (qe) { setQtyErr(qe); ok = false; }
    if (!ok) return;
    setSubmitting(true);
    try {
      const item = await InventoryService.createItem(name.trim(), parseInt(qty));
      addItem(item);
      notify.itemAdded(name.trim());
      closeModal();
    } catch (e: any) {
      notify.itemAddError(e.response?.data?.message);
    } finally { setSubmitting(false); }
  };

  const handleStockIn = async () => {
    const qe = validateQty(qty);
    if (qe) { setQtyErr(qe); return; }
    setSubmitting(true);
    try {
      const item = await InventoryService.stockIn(selected!.id, parseInt(qty));
      updateItem(item);
      notify.stockIn(parseInt(qty), selected!.name);
      closeModal();
    } catch (e: any) {
      notify.stockInError(e.response?.data?.message);
    } finally { setSubmitting(false); }
  };

  const handleStockOut = async () => {
    const qe = validateQty(qty, selected!.quantity);
    if (qe) { setQtyErr(qe); return; }
    if (!awaitConfirm) { setAwaitConfirm(true); return; }
    setSubmitting(true);
    try {
      const item = await InventoryService.stockOut(selected!.id, parseInt(qty));
      updateItem(item);
      notify.stockOut(parseInt(qty), selected!.name);
      closeModal();
    } catch (e: any) {
      notify.stockOutError(e.response?.data?.message);
    } finally { setSubmitting(false); }
  };

  /* Client-side filter + sort on top of server-paginated items */
  const filteredItems = useMemo(() => {
    let result = [...items];
    if (activeFilter !== 'all') {
      result = result.filter((i) => deriveStatus(i.quantity) === activeFilter.toUpperCase());
    }
    switch (sortKey) {
      case 'name':          result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'quantity_asc':  result.sort((a, b) => a.quantity - b.quantity); break;
      case 'quantity_desc': result.sort((a, b) => b.quantity - a.quantity); break;
      case 'date':          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    }
    return result;
  }, [items, activeFilter, sortKey]);

  // Derived from allItems — same source as Dashboard, guarantees identical numbers
  const { inStock, lowStock, outOfStock } = useMemo(
    () => calcStats(allItems), [allItems]
  );

  const kpis = [
    { label: 'Total Items',  value: total,      icon: Boxes,         gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',       iconColor: 'text-white', description: 'All inventory items'   },
    { label: 'In Stock',     value: inStock,    icon: CheckCircle2,  gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',    iconColor: 'text-white', description: 'Quantity above 10'     },
    { label: 'Low Stock',    value: lowStock,   icon: AlertTriangle, gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',    iconColor: 'text-white', description: 'Quantity between 1–10' },
    { label: 'Out of Stock', value: outOfStock, icon: XCircle,       gradient: 'bg-gradient-to-br from-red-500 to-rose-600',        iconColor: 'text-white', description: 'Quantity is zero'      },
  ];

  const currentSort = SORT_OPTIONS.find((s) => s.key === sortKey)!;

  return (
    <div className="p-5 sm:p-6 lg:p-8 space-y-6 max-w-[1320px] mx-auto">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}>
            <KpiCard {...kpi} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.24 }}
        className="bg-white dark:bg-gray-900/90 rounded-2xl border border-gray-200
          dark:border-gray-800/80 shadow-card overflow-hidden"
      >
        {/* Card header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800/60 space-y-4">
          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-bold text-gray-800 dark:text-white">Inventory Items</p>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
                {loading ? 'Loading…' : `${filteredItems.length} of ${total} item${total !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={fetchItems} title="Refresh"
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200
                  dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400
                  hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 active:scale-95
                  transition-all shadow-sm">
                <RefreshCw size={14} />
              </button>
              {isAdmin && (
                <Button
                  variant="gradient"
                  icon={<Plus size={14} strokeWidth={2.5} />}
                  onClick={() => openModal('create')}
                  className="hover:scale-105 active:scale-95"
                >
                  New Item
                </Button>
              )}
            </div>
          </div>

          {/* Search + Filter + Sort row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:max-w-[260px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search items…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                  bg-gray-50 dark:bg-gray-800 text-[13.5px] text-gray-800 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500 outline-none
                  focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white
                  dark:focus:bg-gray-700 transition-all"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex-wrap">
              {FILTER_TABS.map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
                    activeFilter === key
                      ? `bg-white dark:bg-gray-700 shadow-sm ${color}`
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <div className="relative ml-auto">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200
                  dark:border-gray-700 bg-white dark:bg-gray-800 text-[12.5px] font-medium
                  text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                  transition-all shadow-sm whitespace-nowrap"
              >
                <ArrowUpDown size={13} />
                {currentSort.label}
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-gray-900 rounded-xl
                      shadow-card-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-20 py-1"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => { setSortKey(opt.key); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-[12.5px] font-medium transition-colors ${
                          sortKey === opt.key
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <Table
          items={filteredItems} loading={loading} error={error} isAdmin={isAdmin}
          onStockIn={(item) => openModal('stockIn', item)}
          onStockOut={(item) => openModal('stockOut', item)}
          onRetry={fetchItems}
        />

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100
            dark:border-gray-800/60 bg-gray-50/60 dark:bg-gray-800/30">
            <p className="text-[12.5px] text-gray-500 dark:text-gray-400 font-medium">
              Page <span className="font-bold text-gray-700 dark:text-gray-200">{page}</span> of {pages}
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                  dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400
                  hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40
                  disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                  dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400
                  hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40
                  disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ══ Create Item Modal ══ */}
      <Modal isOpen={modal === 'create'} onClose={closeModal}
        title="Add New Item" subtitle="Create a new inventory item (Admin only)">
        <div className="space-y-4">
          <Input label="Item Name" type="text" value={name}
            onChange={(e) => { setName(e.target.value); setNameErr(''); }}
            placeholder="e.g. Wireless Keyboard" error={nameErr} autoFocus />
          <Input label="Initial Quantity" type="number" min={1} value={qty}
            onChange={(e) => { setQty(e.target.value); setQtyErr(''); }}
            placeholder="0" error={qtyErr} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={closeModal} className="flex-1 py-2.5">Cancel</Button>
            <Button variant="gradient" onClick={handleCreate} loading={submitting} className="flex-1 py-2.5">
              {submitting ? 'Creating…' : 'Create Item'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ══ Stock In Modal ══ */}
      <Modal isOpen={modal === 'stockIn'} onClose={closeModal}
        title="Add Stock" subtitle={`Increase stock for "${selected?.name}"`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className={infoBox('bg-gray-50 dark:bg-gray-800', 'border-gray-200 dark:border-gray-700')}>
              <p className={labelCls}>Item</p>
              <p className="text-[13.5px] font-bold text-gray-800 dark:text-white truncate">{selected?.name}</p>
            </div>
            <div className={infoBox('bg-emerald-50 dark:bg-emerald-900/20', 'border-emerald-200 dark:border-emerald-800')}>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                Current Stock
              </p>
              <p className="text-[13.5px] font-bold text-emerald-800 dark:text-emerald-300">
                {selected?.quantity} units
              </p>
            </div>
          </div>
          <Input label="Quantity to Add" type="number" min={1} value={qty}
            onChange={(e) => { setQty(e.target.value); setQtyErr(''); }}
            placeholder="0" error={qtyErr} autoFocus />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={closeModal} className="flex-1 py-2.5">Cancel</Button>
            <Button variant="success" onClick={handleStockIn} loading={submitting} className="flex-1 py-2.5">
              {submitting ? 'Adding…' : '+ Add Stock'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ══ Stock Out Modal ══ */}
      <Modal isOpen={modal === 'stockOut'} onClose={closeModal}
        title="Use Stock" subtitle={`Reduce stock for "${selected?.name}"`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className={infoBox('bg-gray-50 dark:bg-gray-800', 'border-gray-200 dark:border-gray-700')}>
              <p className={labelCls}>Item</p>
              <p className="text-[13.5px] font-bold text-gray-800 dark:text-white truncate">{selected?.name}</p>
            </div>
            <div className={infoBox('bg-red-50 dark:bg-red-900/20', 'border-red-200 dark:border-red-800')}>
              <p className="text-[11px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-1">
                Available
              </p>
              <p className="text-[13.5px] font-bold text-red-700 dark:text-red-300">
                {selected?.quantity} units
              </p>
            </div>
          </div>

          <AnimatePresence>
            {awaitConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20
                  border border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden"
              >
                <span className="text-amber-500 shrink-0 text-[16px] mt-px">⚠</span>
                <div>
                  <p className="text-[13px] text-amber-800 dark:text-amber-300 font-bold leading-none mb-1">
                    Confirm stock reduction
                  </p>
                  <p className="text-[12.5px] text-amber-700 dark:text-amber-400 leading-snug">
                    You are about to remove <strong>{qty || '?'}</strong> unit(s).
                    This cannot be undone. Click "Confirm" to proceed.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Input label="Quantity to Use" type="number" min={1} max={selected?.quantity} value={qty}
            onChange={(e) => { setQty(e.target.value); setQtyErr(''); setAwaitConfirm(false); }}
            placeholder="0" error={qtyErr} autoFocus />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={closeModal} className="flex-1 py-2.5">Cancel</Button>
            <Button variant="danger" onClick={handleStockOut} loading={submitting} className="flex-1 py-2.5">
              {submitting ? 'Processing…' : awaitConfirm ? '✓ Confirm Use' : '- Use Stock'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
