import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useInventoryContext as useInventory } from '../context/InventoryContext';
import { Boxes, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { KpiCard } from '../components/Loader';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { deriveStatus, calcStats } from '../utils';
import { ROUTES } from '../constants';

const STATUS_CFG = {
  IN_STOCK:     { variant: 'green'  as const, label: 'In Stock'     },
  LOW_STOCK:    { variant: 'yellow' as const, label: 'Low Stock'    },
  OUT_OF_STOCK: { variant: 'red'    as const, label: 'Out of Stock' },
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: [0.16, 1, 0.3, 1] as any },
});

export default function Dashboard() {
  const { user } = useAuth();
  // allItems = full untruncated list, never affected by pagination or search.
  // Both Dashboard and Inventory read from the same InventoryContext instance,
  // so any add/update is reflected here instantly without a refetch.
  const { allItems, loading } = useInventory();

  // Single shared utility — same function Inventory page uses for its KPIs.
  const { total, inStock, lowStock, outOfStock } = useMemo(
    () => calcStats(allItems), [allItems]
  );

  const recentItems = useMemo(() => allItems.slice(0, 5), [allItems]);
  const alertItems  = useMemo(() => allItems.filter((i) => i.quantity <= 10), [allItems]);

  const kpis = [
    {
      label: 'Total Items', value: total,
      icon: Boxes,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
      iconColor: 'text-white',
      description: 'All inventory items',
    },
    {
      label: 'In Stock', value: inStock,
      icon: CheckCircle2,
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      iconColor: 'text-white',
      description: 'Quantity above 10',
    },
    {
      label: 'Low Stock', value: lowStock,
      icon: AlertTriangle,
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
      iconColor: 'text-white',
      description: 'Quantity between 1–10',
    },
    {
      label: 'Out of Stock', value: outOfStock,
      icon: XCircle,
      gradient: 'bg-gradient-to-br from-red-500 to-rose-600',
      iconColor: 'text-white',
      description: 'Quantity is zero',
    },
  ];

  return (
    <div className="p-5 sm:p-6 lg:p-8 space-y-7 max-w-[1320px] mx-auto">

      {/* ── Header ── */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">
            Good day, <span className="text-gradient">{user?.email.split('@')[0]}</span> 👋
          </h1>
          <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1">
            Here's what's happening with your inventory today.
          </p>
        </div>
        <Button
          variant="gradient"
          size="lg"
          icon={<TrendingUp size={16} />}
          className="self-start sm:self-auto"
          onClick={() => window.location.href = ROUTES.INVENTORY}
        >
          Manage Inventory
          <ArrowUpRight size={15} className="ml-0.5" />
        </Button>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} {...fadeUp(i * 0.06)}>
            <KpiCard {...kpi} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* ── Bottom grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Items */}
        <motion.div {...fadeUp(0.24)}
          className="lg:col-span-2 bg-white dark:bg-gray-900/90 rounded-2xl border
            border-gray-200 dark:border-gray-800/80 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800/60">
            <div>
              <p className="text-[14.5px] font-bold text-gray-800 dark:text-white">Recent Items</p>
              <p className="text-[11.5px] text-gray-400 dark:text-gray-500 mt-0.5">Latest additions to inventory</p>
            </div>
            <Link to={ROUTES.INVENTORY}
              className="flex items-center gap-1 text-[12px] font-semibold text-blue-600
                hover:text-violet-600 transition-colors">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-2/5" />
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full w-1/5" />
                  </div>
                  <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-full w-20" />
                </div>
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-[13px] text-gray-400">
              No items yet — add some from the Inventory page.
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {recentItems.map((item, i) => {
                const cfg = STATUS_CFG[deriveStatus(item.quantity)];
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/80
                      dark:hover:bg-gray-800/40 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-50
                      dark:from-gray-800 dark:to-gray-700 rounded-xl flex items-center
                      justify-center shrink-0 group-hover:from-blue-50 group-hover:to-violet-50
                      dark:group-hover:from-blue-900/20 dark:group-hover:to-violet-900/20
                      transition-all duration-200 shadow-sm">
                      <Boxes size={16} className="text-gray-400 dark:text-gray-500
                        group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11.5px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {item.quantity} units available
                      </p>
                    </div>
                    <Badge variant={cfg.variant} dot glow className="shrink-0">{cfg.label}</Badge>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Stock Alerts */}
        <motion.div {...fadeUp(0.28)}
          className="bg-white dark:bg-gray-900/90 rounded-2xl border border-gray-200
            dark:border-gray-800/80 shadow-card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800/60">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl
              flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle size={15} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[14.5px] font-bold text-gray-800 dark:text-white leading-none">
                Stock Alerts
              </p>
              <p className="text-[11.5px] text-gray-400 dark:text-gray-500 mt-0.5 leading-none">
                Items needing attention
              </p>
            </div>
            {!loading && alertItems.length > 0 && (
              <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700
                dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                {alertItems.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-3/5" />
                  <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-1/5" />
                </div>
              ))}
            </div>
          ) : alertItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl
                flex items-center justify-center mb-3 shadow-sm">
                <CheckCircle2 size={22} className="text-white" />
              </div>
              <p className="text-[13.5px] font-bold text-gray-700 dark:text-gray-200">All stocked up!</p>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1">
                No items need restocking right now.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/60 max-h-[340px]
              overflow-y-auto scrollbar-hide">
              {alertItems.map((item, i) => {
                const isOut = item.quantity === 0;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between px-6 py-3
                      hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-all duration-200"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-200 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11.5px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {isOut ? 'No stock remaining' : `${item.quantity} unit${item.quantity !== 1 ? 's' : ''} left`}
                      </p>
                    </div>
                    <Badge variant={isOut ? 'red' : 'yellow'} glow className="shrink-0 ml-3">
                      {isOut ? 'Out' : 'Low'}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
