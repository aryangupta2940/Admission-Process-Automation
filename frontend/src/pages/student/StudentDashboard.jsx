import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Edit3,
  FilePlus2,
  FileText,
  GraduationCap,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import AlertBanner from '../../components/AlertBanner';
import api, { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      try {
        const [appRes, notifRes] = await Promise.all([
          api.get('/applications/me'),
          api.get('/notifications'),
        ]);
        if (!active) return;
        setApplication(appRes.data.application);
        setNotifications(notifRes.data.notifications || []);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const stepComplete = {
    registered: true,
    submitted: Boolean(application),
    underReview:
      application &&
      ['Under Review', 'Approved', 'Rejected'].includes(application.status),
    decided:
      application && ['Approved', 'Rejected'].includes(application.status),
  };

  return (
    <DashboardLayout
      title={`Welcome, ${user?.name || 'Student'}`}
      subtitle="Manage your ABESEC Ghaziabad admission application, documents, and status updates."
    >
      {loading ? (
        <Spinner label="Loading your admission dashboard..." />
      ) : (
        <div className="space-y-6">
          <AlertBanner type="error" message={error} onClose={() => setError('')} />

          {/* Application Status Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Admission Application Status
                  </p>
                  {application ? (
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-slate-900">
                        {application.applicationNumber}
                      </h2>
                      <StatusBadge status={application.status} />
                    </div>
                  ) : (
                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      Not Submitted Yet
                    </h2>
                  )}
                  <p className="mt-1 text-sm text-slate-600">
                    {application
                      ? `Applied Course: ${application.academicInfo?.course}`
                      : 'Complete the admission form and upload your documents to apply.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {application ? (
                  <>
                    <Link
                      to="/student/application"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <FileText className="h-4 w-4" />
                      View Application
                    </Link>
                    {application.status === 'Pending' && (
                      <Link
                        to="/student/apply"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit Form
                      </Link>
                    )}
                  </>
                ) : (
                  <Link
                    to="/student/apply"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800"
                  >
                    <FilePlus2 className="h-4 w-4" />
                    Fill Admission Form
                  </Link>
                )}
              </div>
            </div>

            {application?.status === 'Rejected' && application?.rejectionReason && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                <strong>Rejection Reason:</strong> {application.rejectionReason}
              </div>
            )}

            {application?.adminRemarks && application?.status !== 'Rejected' && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                <strong>Admissions Office Remarks:</strong> {application.adminRemarks}
              </div>
            )}
          </div>

          {/* Admission Progress Tracker */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Admission Progress</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Account Created', done: stepComplete.registered },
                { label: 'Form & Docs Submitted', done: stepComplete.submitted },
                { label: 'Committee Review', done: stepComplete.underReview },
                {
                  label:
                    application?.status === 'Rejected'
                      ? 'Decision: Rejected'
                      : 'Final Approval',
                  done: stepComplete.decided,
                },
              ].map((step, idx) => (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    step.done
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  <CheckCircle2
                    className={`h-5 w-5 shrink-0 ${
                      step.done ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                  <div>
                    <p className="text-[11px] font-semibold uppercase">Step {idx + 1}</p>
                    <p className="text-xs font-bold">{step.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Bell className="h-4 w-4 text-brand-700" />
                Recent Admission Updates
              </h3>
              <Link
                to="/student/notifications"
                className="text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                View All
              </Link>
            </div>

            {notifications.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No notifications yet.</p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n._id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                      <span className="text-xs text-slate-400">
                        {new Date(n.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
