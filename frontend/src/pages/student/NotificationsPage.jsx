import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Spinner from '../../components/Spinner';
import AlertBanner from '../../components/AlertBanner';
import api, { getErrorMessage } from '../../api/client';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchNotifications() {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function markOneRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function markAllRead() {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <DashboardLayout
      title="Admission Notifications"
      subtitle="Stay updated on your application submission, review progress, and final admission decisions."
    >
      {loading ? (
        <Spinner label="Loading notifications..." />
      ) : (
        <div className="space-y-4">
          <AlertBanner type="error" message={error} onClose={() => setError('')} />

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
            <span className="text-sm font-medium text-slate-700">
              Total: <strong>{notifications.length}</strong> ({unreadCount} unread)
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              No notifications found.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`rounded-xl border p-5 shadow-sm transition ${
                    n.isRead
                      ? 'border-slate-200 bg-white'
                      : 'border-brand-200 bg-brand-50/40'
                  }`}
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div className="flex items-start gap-3">
                      <Bell
                        className={`mt-0.5 h-5 w-5 shrink-0 ${
                          n.isRead ? 'text-slate-400' : 'text-brand-700'
                        }`}
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                        <p className="mt-2 text-xs text-slate-400">
                          {new Date(n.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => markOneRead(n._id)}
                        className="shrink-0 rounded-md border border-brand-200 bg-white px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
