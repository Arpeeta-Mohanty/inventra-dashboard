import { motion } from 'framer-motion';
import type { InventoryItem } from '../types';
import { TableSkeleton, ErrorState } from './Loader';
import Badge from './Badge';
import Button from './Button';
import { Boxes, Plus, Minus } from 'lucide-react';
import { deriveStatus, formatDate } from '../utils';

interface Props {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  onStockIn: (item: InventoryItem) => void;
  onStockOut: (item: InventoryItem) => void;
  onRetry: () => void;
}

const STATUS_BADGE: Record<InventoryItem['status'], { variant: 'green' | 'yellow' | 'red'; label: string }> = {
  IN_STOCK:     { variant: 'green',  label: 'In Stock'     },
  LOW_STOCK:    { variant: 'yellow', label: 'Low Stock'    },
  OUT_OF_STOCK: { variant: 'red',    label: 'Out of Stock' },
};

const HEADS = ['Item Name', 'Quantity', 'Status', 'Date Added', 'Actions'];

export default function Table({ items, loading, error, isAdmin, onStockIn, onStockOut, onRetry }: Props) {
  if (error && !loading) return <ErrorState message={error} onRetry={onRetry} />;

  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-900/20
          dark:to-violet-900/20 rounded-3xl flex items-center justify-center mb-5 shadow-card">
          <Boxes size={32} className="text-blue-400 dark:text-blue-500" />
        </div>
        <p className="text-[16px] font-bold text-gray-700 dark:text-gray-200 mb-2">
          No inventory items yet
        </p>
        <p className="text-[13px] text-gray-400 dark:text-gray-500 max-w-[260px] leading-relaxed">
          {isAdmin
            ? 'Click "New Item" above to add your first inventory item and get started.'
            : 'No items are available yet. Check back later.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13.5px]">
        <thead>
          <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/60">
            {HEADS.map((h) => (
              <th key={h} className="px-6 py-3.5 text-left text-[10.5px] font-bold
                text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
          {loading ? (
            <TableSkeleton />
          ) : (
            items.map((item, i) => {
              const status = deriveStatus(item.quantity);
              const badge  = STATUS_BADGE[status];
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all duration-200 group"
                >
                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center
                        justify-center shrink-0 group-hover:bg-gradient-to-br group-hover:from-blue-100
                        group-hover:to-violet-100 dark:group-hover:from-blue-900/30
                        dark:group-hover:to-violet-900/30 transition-all duration-200">
                        <Boxes size={14} className="text-gray-400 dark:text-gray-500
                          group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">{item.name}</span>
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-700 dark:text-gray-200 tabular-nums text-[14px]">
                      {item.quantity}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <Badge variant={badge.variant} dot glow>{badge.label}</Badge>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-gray-400 dark:text-gray-500 whitespace-nowrap text-[13px]">
                    {formatDate(item.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary" size="sm"
                        icon={<Plus size={12} strokeWidth={2.5} />}
                        onClick={() => onStockIn(item)}
                        title="Add stock"
                        className="hover:scale-105 active:scale-95"
                      >
                        Add
                      </Button>
                      <Button
                        variant="secondary" size="sm"
                        icon={<Minus size={12} strokeWidth={2.5} />}
                        onClick={() => onStockOut(item)}
                        disabled={item.quantity === 0}
                        title={item.quantity === 0 ? 'No stock available' : 'Use stock'}
                        className="hover:!border-red-300 hover:!text-red-600 hover:!bg-red-50
                          dark:hover:!border-red-700 dark:hover:!text-red-400 dark:hover:!bg-red-900/20
                          hover:scale-105 active:scale-95"
                      >
                        Use
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
