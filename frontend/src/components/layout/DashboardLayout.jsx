import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FiMenu, FiBell, FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../ui/Avatar.jsx';

const DashboardLayout = ({ role = 'patient' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden relative z-0">
      {/* ── Abstract Background Orbs ── */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/5 rounded-full filter blur-[100px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent-500/5 rounded-full filter blur-[120px] pointer-events-none -z-10"></div>

      {/* ── Sidebar ── */}
      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-10">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
            aria-label="Open menu"
          >
            <FiMenu className="text-xl" />
          </button>

          <div className="hidden lg:block" />

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
              aria-label="Toggle theme"
            >
              {isDark ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
            </button>

            {/* Notification bell */}
            <button
              className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              aria-label="Notifications"
            >
              <FiBell className="text-xl" />
            </button>

            {/* Logout (mobile only) */}
            <button
              onClick={handleLogout}
              className="lg:hidden p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
              aria-label="Logout"
            >
              <FiLogOut className="text-xl" />
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2.5">
              <Avatar src={user?.avatar} name={user?.name} size="w-9 h-9" />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-none">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 capitalize mt-0.5">{user?.role || role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
