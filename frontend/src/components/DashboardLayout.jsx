import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bell,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Users,
  FilePlus2,
} from 'lucide-react';
import CollegeHeader from './CollegeHeader';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function DashboardLayout({ title, subtitle, children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadUnread() {
      try {
        const { data } = await api.get('/notifications');
        if (active) setUnreadCount(data.unreadCount || 0);
      } catch {
        // Ignore silent badge fetch error
      }
    }
    if (user?.role === 'student') {
      loadUnread();
    }
    return () => {
      active = false;
    };
  }, [user]);

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/apply', label: 'Admission Form', icon: FilePlus2 },
    { to: '/student/application', label: 'My Application', icon: FileText },
    {
      to: '/student/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/applications', label: 'Applications', icon: ClipboardCheck },
    { to: '/admin/students', label: 'Student Records', icon: Users },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <CollegeHeader />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 border-b border-slate-100 pb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {user?.role === 'admin' ? 'Admin Portal' : 'Student Portal'}
              </p>
              <p className="mt-1 truncate text-sm font-bold text-slate-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>

            <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
              {links.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'bg-brand-700 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && <h1 className="text-2xl font-bold text-slate-900">{title}</h1>}
              {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
