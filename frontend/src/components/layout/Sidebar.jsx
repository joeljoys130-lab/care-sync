import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiCalendar, FiUsers, FiUser, FiHeart,
  FiFileText, FiBell, FiLogOut, FiX,
  FiUserCheck, FiClock, FiShield, FiCreditCard, FiList, FiStar
} from 'react-icons/fi';
import { MdLocalHospital, MdCurrencyRupee } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

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
    { label: 'Financials',   icon: FiCreditCard, to: '/admin/payments' },
    { label: 'Reviews',      icon: FiStar,      to: '/admin/reviews' },
  ],
  doctor: [
    { label: 'Dashboard',    icon: FiHome,        to: '/doctor/dashboard' },
    { label: 'Appointments', icon: FiCalendar,    to: '/doctor/appointments' },
    { label: 'Availability', icon: FiClock,       to: '/doctor/availability' },
    { label: 'Earnings',     icon: MdCurrencyRupee, to: '/doctor/earnings' },
    { label: 'Reviews',      icon: FiStar,        to: '/doctor/reviews' },
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
        fixed lg:sticky top-0 inset-y-0 left-0 z-30
        flex flex-col w-64 h-full bg-white border-r border-slate-100 shadow-sm
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
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
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar} name={user?.name} size="md" />
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
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <FiLogOut className="text-lg" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
