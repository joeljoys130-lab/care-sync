import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiCalendar, FiUsers, FiUser, FiHeart,
  FiFileText, FiBell, FiLogOut, FiX, FiDollarSign,
  FiUserCheck, FiClock, FiShield, FiCreditCard, FiList,
} from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = {
  patient: [
    { label: 'Dashboard',       icon: FiHome,     to: '/patient/dashboard' },
    { label: 'Find Doctors',    icon: FiUsers,    to: '/patient/doctors' },
    { label: 'My Appointments', icon: FiCalendar, to: '/patient/appointments' },
    { label: 'Medical Records', icon: FiFileText, to: '/patient/records' },
    { label: 'Favorites',       icon: FiHeart,    to: '/patient/favorites' },
    { label: 'Notifications',   icon: FiBell,     to: '/patient/notifications' },
    { label: 'Payment History', icon: FiList,     to: '/patient/payment-history' },
    { label: 'My Profile',      icon: FiUser,     to: '/patient/profile' },
  ],
  admin: [
    { label: 'Dashboard',    icon: FiHome,      to: '/admin/dashboard' },
    { label: 'Users',        icon: FiUsers,     to: '/admin/users' },
    { label: 'Doctors',      icon: FiUserCheck, to: '/admin/doctors' },
    { label: 'Appointments', icon: FiCalendar,  to: '/admin/appointments' },
  ],
  doctor: [
    { label: 'Dashboard',    icon: FiHome,        to: '/doctor/dashboard' },
    { label: 'Appointments', icon: FiCalendar,    to: '/doctor/appointments' },
    { label: 'Availability', icon: FiClock,       to: '/doctor/availability' },
    { label: 'Earnings',     icon: FiDollarSign,  to: '/doctor/earnings' },
    { label: 'My Profile',   icon: FiUser,        to: '/doctor/profile' },
  ],
};

const PORTAL_LABELS = {
  patient: 'Patient Portal',
  admin:   'Admin Panel',
  doctor:  'Doctor Portal',
};

const Sidebar = ({ role = 'patient', open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Fallback to patient if role is omitted or invalid.
  const items = NAV_ITEMS[role] || NAV_ITEMS.patient;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30
        flex flex-col w-64 bg-white/40 backdrop-blur-2xl border-r border-white/60 shadow-[4px_0_24px_0_rgba(31,38,135,0.05)]
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-white/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(168,85,247,0.3)] border border-white/30">
            <MdLocalHospital className="text-white text-xl" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-lg leading-none">CareSync</span>
            <span className="block text-xs text-primary-600 capitalize font-medium">{PORTAL_LABELS[role] || 'Patient Portal'}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
        >
          <FiX />
        </button>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-white/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/50 border border-white/60 shadow-sm flex items-center justify-center flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-700 font-semibold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'Patient'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <item.icon className="text-lg flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/40">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
        >
          <FiLogOut className="text-lg" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
