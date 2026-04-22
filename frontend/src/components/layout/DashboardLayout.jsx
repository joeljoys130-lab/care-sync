import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FiMenu, FiBell } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

/**
 * DashboardLayout
 *
 * Wraps all authenticated pages with:
 *   • Sidebar (collapsible on mobile)
 *   • Top header bar with hamburger + user info
 *   • <Outlet /> for nested routes
 *
 * Usage in App.jsx:
 *   <Route element={<DashboardLayout role="patient" />}>
 *     <Route path="/patient/dashboard" element={<PatientDashboard />} />
 *   </Route>
 */
const DashboardLayout = ({ role = 'patient' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden relative z-0 bg-[#0a0f1a]">
      {/* ── Abstract Glassmorphism Background Orbs ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full filter blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute top-[40%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full filter blur-[150px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[-20%] left-[30%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full filter blur-[180px] -z-10"></div>
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
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/5 flex-shrink-0 z-10">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-[#1c283d] text-slate-400 transition"
            aria-label="Open menu"
          >
            <FiMenu className="text-xl" />
          </button>

          {/* Page breadcrumb placeholder — pages can set document.title */}
          <div className="hidden lg:block" />

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notification bell */}
            <button
              className="relative p-2 rounded-xl hover:bg-[#1c283d] text-slate-400 transition"
              aria-label="Notifications"
            >
              <FiBell className="text-xl" />
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1c283d] flex items-center justify-center flex-shrink-0 border border-white/5">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-primary-700 font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white leading-none">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-400 capitalize mt-0.5">{user?.role || role}</p>
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
