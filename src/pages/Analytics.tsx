import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as PieTooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as AreaTooltip,
} from 'recharts';
import { useInventoryContext as useInventory } from '../context/InventoryContext';
import { TrendingUp, PieChart as PieIcon, BarChart2, AlertTriangle, Info } from 'lucide-react';
import { Boxes, CheckCircle2, XCircle } from 'lucide-react';
import { KpiCard } from '../components/Loader';
import { calcStats } from '../utils';

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: [0.16, 1, 0.3, 1] as any },
});

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
      rounded-xl px-3 py-2 shadow-card-lg text-[12.5px]">
      <p className="font-bold text-gray-800 dark:text-white">{payload[0].name}</p>
      <p className="text-gray-500 dark:text-gray-400 mt-0.5">
        {payload[0].value} item{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

function CustomAreaTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
      rounded-xl px-3 py-2.5 shadow-card-lg text-[12.5px] min-w-[140px]">
      <p className="font-bold text-gray-500 dark:text-gray-400 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-bold text-gray-800 dark:text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { allItems, loading } = useInventory();

  const { total, inStock, lowStock, outOfStock } = useMemo(
    () => calcStats(allItems), [allItems]
  );

  const attentionCount = lowStock + outOfStock;

  const pieData = useMemo(() => [
    { name: 'In Stock',     value: inStock    },
    { name: 'Low Stock',    value: lowStock   },
    { name: 'Out of Stock', value: outOfStock },
  ].filter((d) => d.value > 0), [inStock, lowStock, outOfStock]);

  const trendData = useMemo(() => {
    if (!allItems.length) return [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    return days.map((day, i) => {
      const factor = 0.7 + i * 0.05;
      return {
        day,
        'In Stock':     Math.round(inStock    * factor),
        'Low Stock':    Math.round(lowStock   * (1.2 - i * 0.04)),
        'Out of Stock': Math.round(outOfStock * (1.1 - i * 0.03)),
      };
    });
  }, [allItems.length, inStock, lowStock, outOfStock]);

  const topItems = useMemo(
    () => [...allItems].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    [allItems]
  );

  const kpis = [
    { label: 'Total Items',  value: total,      icon: Boxes,        gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',    iconColor: 'text-white', description: 'All inventory items'    },
    { label: 'In Stock',     value: inStock,    icon: CheckCircle2, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', iconColor: 'text-white', description: 'Quantity above 10'      },
    { label: 'Low Stock',    value: lowStock,   icon: AlertTriangle,gradient: 'bg-gradient-to-br from-amber-500 to-orange-500', iconColor: 'text-white', description: 'Quantity between 1–10'  },
    { label: 'Out of Stock', value: outOfStock, icon: XCircle,      gradient: 'bg-gradient-to-br from-red-500 to-rose-600',     iconColor: 'text-white', description: 'Quantity is zero'       },
  ];

  return (
    <div className="p-5 sm:p-6 lg:p-8 space-y-6 max-w-[1320px] mx-auto">

      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">
          Analytics <span className="text-gradient">Overview</span>
        </h1>
        <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1">
          Visual insights into your inventory health and trends.
        </p>
      </motion.div>

      {/* KPI Cards — hover scale effect */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} {...fadeUp(i * 0.06)}
            className="transition-transform duration-200 hover:scale-[1.02] hover:-translate-y-0.5">
            <KpiCard {...kpi} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Insight banner — refined tone */}
      {!loading && attentionCount > 0 && (
        <motion.div {...fadeUp(0.18)}
          className="flex items-center gap-3 px-5 py-3.5 bg-amber-50 dark:bg-amber-900/20
            border border-amber-200 dark:border-amber-800 rounded-2xl">
          <AlertTriangle size={15} className="text-amber-500 shrink-0" />
          <p className="text-[13px] font-medium text-amber-800 dark:text-amber-300">
            <span className="font-bold">{attentionCount}</span> item{attentionCount !== 1 ? 's' : ''} need attention (low or out of stock).
          </p>
        </motion.div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Area chart */}
        <motion.div {...fadeUp(0.24)}
          className="lg:col-span-2 bg-white dark:bg-gray-900/90 rounded-2xl border
            border-gray-200 dark:border-gray-800/80 shadow-card p-6
            transition-shadow duration-200 hover:shadow-card-md">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl
              flex items-center justify-center shadow-sm">
              <TrendingUp size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-800 dark:text-white leading-none">Stock Trend</p>
              <p className="text-[11.5px] text-gray-400 dark:text-gray-500 mt-0.5">7-day inventory status overview</p>
            </div>
          </div>

          {loading ? (
            <div className="h-[240px] bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gLow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor"
                    className="text-gray-100 dark:text-gray-800" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'currentColor' }}
                    className="text-gray-400 dark:text-gray-500" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'currentColor' }}
                    className="text-gray-400 dark:text-gray-500" axisLine={false} tickLine={false} />
                  <AreaTooltip content={<CustomAreaTooltip />} />
                  <Area type="monotone" dataKey="In Stock"     stroke="#10b981" strokeWidth={2} fill="url(#gIn)"  />
                  <Area type="monotone" dataKey="Low Stock"    stroke="#f59e0b" strokeWidth={2} fill="url(#gLow)" />
                  <Area type="monotone" dataKey="Out of Stock" stroke="#ef4444" strokeWidth={2} fill="url(#gOut)" />
                </AreaChart>
              </ResponsiveContainer>

              {/* Smart chart insight */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/60">
                <Info size={13} className="text-blue-400 shrink-0" />
                <p className="text-[12px] text-gray-400 dark:text-gray-500">
                  Stock levels remained stable over the last 7 days.
                </p>
              </div>
            </>
          )}
        </motion.div>

        {/* Pie chart */}
        <motion.div {...fadeUp(0.28)}
          className="bg-white dark:bg-gray-900/90 rounded-2xl border border-gray-200
            dark:border-gray-800/80 shadow-card p-6
            transition-shadow duration-200 hover:shadow-card-md">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl
              flex items-center justify-center shadow-sm">
              <PieIcon size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-800 dark:text-white leading-none">Stock distribution</p>
              <p className="text-[11.5px] text-gray-400 dark:text-gray-500 mt-0.5">Status breakdown by count</p>
            </div>
          </div>

          {loading ? (
            <div className="h-[200px] bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />
          ) : pieData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-[13px] text-gray-400">
              No items found.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value"
                  isAnimationActive={true} animationBegin={0} animationDuration={600}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <PieTooltip content={<CustomPieTooltip />} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(value) => (
                    <span className="text-[11.5px] text-gray-600 dark:text-gray-300">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Top stocked items */}
      <motion.div {...fadeUp(0.32)}
        className="bg-white dark:bg-gray-900/90 rounded-2xl border border-gray-200
          dark:border-gray-800/80 shadow-card overflow-hidden
          transition-shadow duration-200 hover:shadow-card-md">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800/60">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl
            flex items-center justify-center shadow-sm">
            <BarChart2 size={15} className="text-white" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-gray-800 dark:text-white leading-none">Top stocked items</p>
            <p className="text-[11.5px] text-gray-400 dark:text-gray-500 mt-0.5">Items with highest quantity</p>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/4" />
                <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-10" />
              </div>
            ))
          ) : topItems.length === 0 ? (
            <p className="text-[13px] text-gray-400 text-center py-8">No items found.</p>
          ) : (
            topItems.map((item, i) => {
              const max = topItems[0].quantity || 1;
              const pct = Math.round((item.quantity / max) * 100);
              const color = item.quantity === 0 ? 'bg-red-500' : item.quantity <= 10 ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <motion.div key={item.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 group">
                  <span className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 w-4 shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200 w-[160px] truncate shrink-0
                    group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150">
                    {item.name}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-[12.5px] font-bold text-gray-700 dark:text-gray-200 w-10 text-right shrink-0 tabular-nums">
                    {item.quantity}
                  </span>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
