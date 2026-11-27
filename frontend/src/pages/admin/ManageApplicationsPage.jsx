import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import AlertBanner from '../../components/AlertBanner';
import api, { getErrorMessage } from '../../api/client';

const STATUS_OPTIONS = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'];

export default function ManageApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchApplications(nextSearch = search, nextStatus = statusFilter) {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/applications', {
        params: {
          search: nextSearch.trim() || undefined,
          status: nextStatus !== 'All' ? nextStatus : undefined,
        },
      });
      setApplications(data.applications || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications('', 'All');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchApplications(search, statusFilter);
  }

  function handleStatusChange(nextStatus) {
    setStatusFilter(nextStatus);
    fetchApplications(search, nextStatus);
  }

  return (
    <DashboardLayout
      title="Manage Admission Applications"
      subtitle="Search by student name, email, or application ID and filter by verification status."
    >
      <div className="space-y-5">
        <AlertBanner type="error" message={error} onClose={() => setError('')} />

        {/* Search & Filter Toolbar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Student Name, Email, or Application ID (e.g. ABES-2026-0001)"
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    Status: {st}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Search
            </button>
          </form>
        </div>

        {/* Applications Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <Spinner label="Fetching applications..." />
          ) : applications.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No matching admission applications found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Application ID</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">10th / 12th %</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {app.applicationNumber}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{app.personalInfo?.fullName}</p>
                        <p className="text-xs text-slate-500">{app.personalInfo?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">
                        {app.academicInfo?.course}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-700">
                        {app.academicInfo?.tenthPercentage}% / {app.academicInfo?.twelfthPercentage}%
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(app.submittedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/applications/${app._id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
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
      </div>
    </DashboardLayout>
  );
}
