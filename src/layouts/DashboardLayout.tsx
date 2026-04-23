/**
 * layouts/DashboardLayout.tsx
 *
 * Reusable shell for all authenticated dashboard pages.
 * Wraps the page content with Sidebar + Navbar + InventoryProvider.
 *
 * Previously: pages/AppLayout.tsx
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { InventoryProvider } from '../context/InventoryContext';

interface DashboardLayoutProps {
  dark: boolean;
  onToggleDark: () => void;
}

export default function DashboardLayout({ dark, onToggleDark }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <InventoryProvider>
      <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-gray-950 transition-colors duration-300">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Navbar
            dark={dark}
            onToggleDark={onToggleDark}
            onMenuClick={() => setMobileOpen(true)}
          />
          <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-gray-950 transition-colors duration-300">
            <Outlet />
          </main>
        </div>
      </div>
    </InventoryProvider>
  );
}
