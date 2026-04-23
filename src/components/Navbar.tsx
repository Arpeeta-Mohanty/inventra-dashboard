import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInventoryContext } from '../context/InventoryContext';
import { Sun, Moon, Menu, LogOut, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from './Badge';
import NotificationDropdown from './NotificationDropdown';

const PAGE_META: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: 'Dashboard',  sub: 'Overview of your inventory'  },
  '/inventory': { title: 'Inventory',  sub: 'Manage stock and items'      },
  '/analytics': { title: 'Analytics',  sub: 'Charts and insights'         },
};

interface NavbarProps {
  dark: boolean;
  onToggleDark: () => void;
  onMenuClick: () => void;
}

export default function Navbar({ dark, onToggleDark, onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { allItems } = useInventoryContext();
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] ?? { title: 'Inventra Dashboard', sub: '' };

  const [dropOpen,  setDropOpen]  = useState(false);
  const [bellOpen,  setBellOpen]  = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b
      border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between
      px-4 sm:px-6 shrink-0 shadow-card sticky top-0 z-30 transition-colors duration-300">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl
            text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors" aria-label="Open menu">
          <Menu size={18} />
        </button>
        <div>
          <h2 className="text-[15px] font-bold text-gray-900 dark:text-white leading-none">
            {meta.title}
          </h2>
          {meta.sub && (
            <p className="text-[11.5px] text-gray-400 dark:text-gray-500 mt-0.5 leading-none hidden sm:block">
              {meta.sub}
            </p>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Dark mode */}
        <button onClick={onToggleDark}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500
            dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all
            hover:scale-105 active:scale-95" aria-label="Toggle dark mode">
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notification bell */}
        <NotificationDropdown
          items={allItems}
          open={bellOpen}
          onToggle={() => setBellOpen((v) => !v)}
          onClose={() => setBellOpen(false)}
        />

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Avatar dropdown */}
        <div ref={dropRef} className="relative">
          <button
            onClick={() => setDropOpen((v) => !v)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-gray-100
              dark:hover:bg-gray-800 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600
              flex items-center justify-center shrink-0 shadow-sm ring-2 ring-blue-100 dark:ring-blue-900/50
              group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all">
              <span className="text-[12px] font-bold text-white uppercase leading-none">
                {user?.email?.[0] ?? '?'}
              </span>
            </div>
            <div className="hidden sm:flex flex-col gap-0.5 leading-none">
              <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200
                max-w-[160px] truncate leading-none">
                {user?.email}
              </span>
              <Badge variant={user?.role === 'ADMIN' ? 'purple' : 'blue'} className="self-start py-0 px-1.5 text-[10px]">
                {user?.role}
              </Badge>
            </div>
            <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {dropOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl
                  shadow-card-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
              >
                <div className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800
                  bg-gradient-to-br from-blue-50/50 to-violet-50/50 dark:from-blue-900/10 dark:to-violet-900/10">
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-0.5">Signed in as</p>
                  <p className="text-[13px] font-bold text-gray-800 dark:text-white truncate">{user?.email}</p>
                  <Badge variant={user?.role === 'ADMIN' ? 'purple' : 'blue'} className="mt-1.5">
                    {user?.role}
                  </Badge>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => { setDropOpen(false); logout(); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[13px]
                      font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                      transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
