import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Users,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import AlertBanner from '../../components/AlertBanner';
import api, { getErrorMessage } from '../../api/client';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get('/admin/stats')
      .then((res) => {
        if (active) setData(res.data);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = data?.stats || {};
  const cards = [
    {
      label: 'Total Registered Students',
      value: stats.totalStudents ?? 0,
      Icon: Users,
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Total Applications',
      value: stats.totalApplications ?? 0,
      Icon: FileText,
      color: 'bg-brand-50 text-brand-700',
    },
    {
      label: 'Pending Applications',
      value: stats.pendingApplications ?? 0,
      Icon: Clock,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Under Review',
      value: stats.underReviewApplications ?? 0,
      Icon: Eye,
      color: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Approved Applications',
      value: stats.approvedApplications ?? 0,
      Icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Rejected Applications',
      value: stats.rejectedApplications ?? 0,
      Icon: XCircle,
      color: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <DashboardLayout
      title="Admissions Admin Dashboard"
      subtitle="Overview of student registrations, application pipeline, and course-wise admissions at ABESEC Ghaziabad."
    >
      {loading ? (
        <Spinner label="Loading admin statistics..." />
      ) : (
        <div className="space-y-6">
          <AlertBanner type="error" message={error} onClose={() => setError('')} />

          {/* Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ label, value, Icon, color }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Recent Applications */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-8">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
                <Link
                  to="/admin/applications"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
                >
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {!data?.recentApplications?.length ? (
                <p className="mt-4 text-sm text-slate-500">No applications submitted yet.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                        <th className="py-2.5 pr-4">App ID</th>
                        <th className="py-2.5 pr-4">Applicant</th>
                        <th className="py-2.5 pr-4">Course</th>
                        <th className="py-2.5 pr-4">Status</th>
                        <th className="py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.recentApplications.map((app) => (
                        <tr key={app._id} className="hover:bg-slate-50">
                          <td className="py-3 pr-4 font-semibold text-slate-900">
                            {app.applicationNumber}
                          </td>
                          <td className="py-3 pr-4">
                            <p className="font-medium text-slate-900">
                              {app.personalInfo?.fullName}
                            </p>
                            <p className="text-xs text-slate-500">{app.personalInfo?.email}</p>
                          </td>
                          <td className="py-3 pr-4 text-xs text-slate-700">
                            {app.academicInfo?.course}
                          </td>
                          <td className="py-3 pr-4">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              to={`/admin/applications/${app._id}`}
                              className="text-xs font-semibold text-brand-700 hover:underline"
                            >
                              Review
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Course Breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4">
              <h2 className="text-base font-bold text-slate-900">Applications by Course</h2>
              {!data?.courseBreakdown?.length ? (
                <p className="mt-4 text-sm text-slate-500">No course data yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {data.courseBreakdown.map((item) => (
                    <div
                      key={item.course}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm"
                    >
                      <span className="truncate pr-2 font-medium text-slate-700">
                        {item.course}
                      </span>
                      <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-800">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
