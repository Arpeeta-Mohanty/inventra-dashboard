import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Boxes, LogOut, Package2, X, Sparkles, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';

const NAV = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { to: ROUTES.INVENTORY,  icon: Boxes,           label: 'Inventory'  },
  { to: ROUTES.ANALYTICS,  icon: BarChart2,        label: 'Analytics'  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { logout, user } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 dark:border-gray-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl
            flex items-center justify-center shrink-0 shadow-md">
            <Package2 size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-[15px] text-gray-900 dark:text-white tracking-tight leading-none">
              Inventra Dashboard
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5 leading-none">
              v2.0 · Premium
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg
              text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-5 pb-3 space-y-1 overflow-y-auto scrollbar-hide">
        <p className="px-3 mb-3 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.14em]">
          Navigation
        </p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium
               transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-800 dark:hover:text-gray-100'
              }`
            }
          >
            <Icon size={16} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50
        dark:from-blue-900/20 dark:to-violet-900/20 border border-blue-100 dark:border-blue-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600
            flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-[11px] font-bold text-white uppercase">{user?.email?.[0] ?? '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 truncate leading-none">
              {user?.email}
            </p>
            <p className="text-[10.5px] text-blue-600 dark:text-blue-400 font-bold mt-0.5 leading-none">
              {user?.role}
            </p>
          </div>
          <Sparkles size={13} className="text-violet-500 shrink-0" />
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-gray-100 dark:border-gray-800/80 pt-3 shrink-0">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13.5px]
            font-medium text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20
            hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
        >
          <LogOut size={16} className="shrink-0 group-hover:translate-x-0.5 transition-transform duration-200" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-[240px] shrink-0 h-screen sticky top-0 flex-col
        bg-white dark:bg-gray-900/95 border-r border-gray-200 dark:border-gray-800/80 shadow-card
        transition-colors duration-300">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
            />
            <motion.aside
              className="fixed left-0 top-0 z-50 w-[240px] h-screen flex flex-col
                bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
                shadow-card-lg lg:hidden"
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <SidebarContent onClose={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
