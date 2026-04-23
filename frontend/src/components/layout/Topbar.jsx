import { FiMenu, FiBell, FiUser } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { notificationAPI } from '../../api';

// Derive page title from pathname
const getPageTitle = (pathname) => {
  const map = {
    '/patient/dashboard': 'Dashboard',
    '/patient/doctors': 'Find Doctors',
    '/patient/appointments': 'My Appointments',
    '/patient/records': 'Medical Records',
    '/patient/favorites': 'Favorites',
    '/patient/notifications': 'Notifications',
    '/patient/profile': 'My Profile',
    '/doctor/dashboard': 'Dashboard',
    '/doctor/appointments': 'Appointments',
    '/doctor/availability': 'Availability',
    '/doctor/earnings': 'Earnings',
    '/doctor/profile': 'Profile',
    '/admin/dashboard': 'Dashboard',
    '/admin/users': 'User Management',
    '/admin/doctors': 'Doctor Approvals',
    '/admin/appointments': 'All Appointments',
    '/admin/analytics': 'Analytics',
  };
  // Try exact match, then prefix match
  if (map[pathname]) return map[pathname];
  const key = Object.keys(map).find((k) => pathname.startsWith(k));
  return key ? map[key] : 'CareSync';
};

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => notificationAPI.getAll({ unreadOnly: 'true', limit: 1 }),
    refetchInterval: 30000,
    enabled: !!user,
  });

  const unreadCount = data?.data?.data?.unreadCount || 0;

  const notifPath = user?.role === 'patient'
    ? '/patient/notifications'
    : null; // Doctors/Admins don't have a standalone notifications page yet

  const profilePath = user?.role === 'patient'
    ? '/patient/profile'
    : user?.role === 'doctor'
    ? '/doctor/profile'
    : null;

  return (
    <header className="bg-white border-b border-slate-100 px-4 sm:px-6 h-16 flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
          aria-label="Open menu"
        >
          <FiMenu className="text-xl" />
        </button>
        <h2 className="hidden sm:block text-base font-semibold text-slate-700">
          {getPageTitle(pathname)}
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1.5">
        {/* Notification bell — only for patient (others can add later) */}
        {notifPath && (
          <button
            onClick={() => navigate(notifPath)}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition"
            aria-label="Notifications"
          >
            <FiBell className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        )}

        {/* Profile avatar button */}
        {profilePath ? (
          <button
            onClick={() => navigate(profilePath)}
            className="w-9 h-9 rounded-xl overflow-hidden bg-primary-100 flex items-center justify-center hover:ring-2 hover:ring-primary-400 transition"
            aria-label="My profile"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-700 font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </button>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
