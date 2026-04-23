import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, XCircle, CheckCircle2, X } from 'lucide-react';
import type { InventoryItem } from '../types';

interface Props {
  items: InventoryItem[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function getAlerts(items: InventoryItem[]) {
  return items
    .filter((i) => i.quantity <= 10)
    .sort((a, b) => a.quantity - b.quantity);
}

export default function NotificationDropdown({ items, open, onToggle, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const alerts = getAlerts(items);
  const unread = alerts.length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500
          dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all
          hover:scale-105 active:scale-95"
        aria-label="Notifications"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full glow-red
            ring-2 ring-white dark:ring-gray-900" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-[320px] bg-white dark:bg-gray-900 rounded-2xl
              shadow-card-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b
              border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white
              dark:from-gray-800/50 dark:to-gray-900">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-gray-500 dark:text-gray-400" />
                <span className="text-[13px] font-bold text-gray-800 dark:text-white">
                  Stock Alerts
                </span>
                {unread > 0 && (
                  <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5
                    rounded-full leading-none">
                    {unread}
                  </span>
                )}
              </div>
              <button onClick={onClose}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400
                  hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100
                  dark:hover:bg-gray-800 transition-colors">
                <X size={13} />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[320px] overflow-y-auto scrollbar-hide">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl
                    flex items-center justify-center mb-3">
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-[13px] font-bold text-gray-700 dark:text-gray-200">
                    All good!
                  </p>
                  <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1">
                    No stock alerts at the moment.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800/60 py-1">
                  {alerts.map((item, i) => {
                    const isOut = item.quantity === 0;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors
                          ${isOut
                            ? 'hover:bg-red-50/60 dark:hover:bg-red-900/10'
                            : 'hover:bg-amber-50/60 dark:hover:bg-amber-900/10'
                          }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                          ${isOut
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : 'bg-amber-100 dark:bg-amber-900/30'
                          }`}>
                          {isOut
                            ? <XCircle size={13} className="text-red-500 dark:text-red-400" />
                            : <AlertTriangle size={13} className="text-amber-500 dark:text-amber-400" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {item.name}
                          </p>
                          <p className={`text-[11.5px] mt-0.5 font-medium
                            ${isOut
                              ? 'text-red-500 dark:text-red-400'
                              : 'text-amber-600 dark:text-amber-400'
                            }`}>
                            {isOut ? 'Out of stock. Restock required.' : `Only ${item.quantity} unit${item.quantity !== 1 ? 's' : ''} remaining.`}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5
                          ${isOut
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          }`}>
                          {isOut ? 'OUT' : 'LOW'}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {alerts.length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800
                bg-gray-50/60 dark:bg-gray-800/30">
                <p className="text-[11.5px] text-gray-400 dark:text-gray-500 text-center">
                  {alerts.filter(i => i.quantity === 0).length} out of stock ·{' '}
                  {alerts.filter(i => i.quantity > 0).length} low stock
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
