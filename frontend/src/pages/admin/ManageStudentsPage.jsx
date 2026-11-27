import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2, UserCheck, UserX } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import AlertBanner from '../../components/AlertBanner';
import api, { getErrorMessage } from '../../api/client';

export default function ManageStudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function fetchStudents(nextSearch = search) {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/students', {
        params: { search: nextSearch.trim() || undefined },
      });
      setStudents(data.students || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleActive(student) {
    setError('');
    setSuccess('');
    try {
      const { data } = await api.patch(`/admin/students/${student._id}/toggle-active`);
      setStudents((prev) =>
        prev.map((s) =>
          s._id === student._id ? { ...s, isActive: data.student.isActive } : s
        )
      );
      setSuccess(data.message);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDeleteStudent(student) {
    const confirmed = window.confirm(
      `Delete student record "${student.name}" (${student.email}) and any linked application?`
    );
    if (!confirmed) return;

    setError('');
    setSuccess('');
    try {
      const { data } = await api.delete(`/admin/students/${student._id}`);
      setStudents((prev) => prev.filter((s) => s._id !== student._id));
      setSuccess(data.message);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <DashboardLayout
      title="Manage Student Records"
      subtitle="View registered students, check their application submission status, and manage account access."
    >
      <div className="space-y-5">
        <AlertBanner type="error" message={error} onClose={() => setError('')} />
        <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchStudents(search);
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students by name, email, or phone..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Search
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <Spinner label="Loading student records..." />
          ) : students.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No student records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Application</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{s.phone || '—'}</td>
                      <td className="px-4 py-3">
                        {s.application ? (
                          <div className="flex flex-col gap-1">
                            <Link
                              to={`/admin/applications/${s.application._id}`}
                              className="text-xs font-semibold text-brand-700 hover:underline"
                            >
                              {s.application.applicationNumber}
                            </Link>
                            <div>
                              <StatusBadge status={s.application.status} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Not applied</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            s.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(s)}
                            title={s.isActive ? 'Deactivate student' : 'Activate student'}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            {s.isActive ? (
                              <>
                                <UserX className="h-3.5 w-3.5 text-amber-600" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                                Activate
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(s)}
                            title="Delete student record"
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
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
