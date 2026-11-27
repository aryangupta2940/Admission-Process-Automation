import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Eye, History, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import SecureFilePreview from '../../components/SecureFilePreview';
import Spinner from '../../components/Spinner';
import AlertBanner from '../../components/AlertBanner';
import api, { getErrorMessage } from '../../api/client';

export default function ReviewApplicationPage() {
  const { id } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedStatus, setSelectedStatus] = useState('Under Review');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get(`/admin/applications/${id}`)
      .then((res) => {
        if (!active) return;
        const app = res.data.application;
        setApplication(app);
        setSelectedStatus(app.status);
        setAdminRemarks(app.adminRemarks || '');
        setRejectionReason(app.rejectionReason || '');
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
  }, [id]);

  async function updateStatus(nextStatus) {
    setError('');
    setSuccess('');

    if (nextStatus === 'Rejected' && !rejectionReason.trim()) {
      setError('Please provide a clear rejection reason before rejecting this application.');
      return;
    }

    setUpdating(true);
    try {
      const { data } = await api.patch(`/admin/applications/${id}/status`, {
        status: nextStatus,
        adminRemarks,
        rejectionReason: nextStatus === 'Rejected' ? rejectionReason : '',
      });
      setApplication(data.application);
      setSelectedStatus(data.application.status);
      setSuccess(data.message || `Status updated to ${nextStatus}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  }

  return (
    <DashboardLayout
      title="Review Student Application"
      subtitle="Verify personal information, academic marks, and uploaded documents before taking action."
    >
      <div className="mb-4">
        <Link
          to="/admin/applications"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Applications
        </Link>
      </div>

      {loading ? (
        <Spinner label="Loading application details..." />
      ) : !application ? (
        <AlertBanner type="error" message={error || 'Application not found.'} />
      ) : (
        <div className="space-y-6">
          <AlertBanner type="error" message={error} onClose={() => setError('')} />
          <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />

          {/* Summary Header */}
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Application ID
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">
                  {application.applicationNumber}
                </h2>
                <StatusBadge status={application.status} />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Submitted: {new Date(application.submittedAt).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-sm text-slate-600 sm:text-right">
              <p className="font-semibold text-slate-900">{application.academicInfo?.course}</p>
              <p className="text-xs">Applicant: {application.personalInfo?.fullName}</p>
            </div>
          </div>

          {/* Personal & Academic Info */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                Personal Details
              </h3>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Full Name</dt>
                  <dd className="font-medium text-slate-900">{application.personalInfo.fullName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Email</dt>
                  <dd className="font-medium text-slate-900">{application.personalInfo.email}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Phone</dt>
                  <dd className="font-medium text-slate-900">{application.personalInfo.phone}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Date of Birth</dt>
                  <dd className="font-medium text-slate-900">
                    {new Date(application.personalInfo.dateOfBirth).toLocaleDateString('en-IN')}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Gender</dt>
                  <dd className="font-medium text-slate-900">{application.personalInfo.gender}</dd>
                </div>
                <div className="pt-1">
                  <dt className="text-slate-500">Address</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {application.personalInfo.address}
                    {application.personalInfo.city ? `, ${application.personalInfo.city}` : ''}
                    {application.personalInfo.state ? `, ${application.personalInfo.state}` : ''}
                    {application.personalInfo.pincode ? ` - ${application.personalInfo.pincode}` : ''}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                Academic Details
              </h3>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Course Applied</dt>
                  <dd className="text-right font-semibold text-brand-800">
                    {application.academicInfo.course}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">10th Percentage</dt>
                  <dd className="font-semibold text-slate-900">
                    {application.academicInfo.tenthPercentage}%
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">12th Percentage</dt>
                  <dd className="font-semibold text-slate-900">
                    {application.academicInfo.twelfthPercentage}%
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Previous School / College</dt>
                  <dd className="text-right font-medium text-slate-900">
                    {application.academicInfo.previousSchool}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Uploaded Documents */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
              Submitted Documents Verification
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <SecureFilePreview label="Photograph" docMeta={application.documents?.photograph} />
              <SecureFilePreview
                label="10th Marksheet"
                docMeta={application.documents?.tenthMarksheet}
              />
              <SecureFilePreview
                label="12th Marksheet"
                docMeta={application.documents?.twelfthMarksheet}
              />
              <SecureFilePreview
                label="Identity Proof"
                docMeta={application.documents?.identityProof}
              />
            </div>
          </div>

          {/* Decision & Status Control Panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
              Admissions Decision &amp; Status Management
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Admin Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Add verification notes or seat allotment instructions..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Rejection Reason (Required if Rejecting)
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Specify why the application is rejected (e.g., unclear 12th marksheet)..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => updateStatus('Under Review')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-60"
                >
                  <Eye className="h-4 w-4" />
                  Mark Under Review
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => updateStatus('Approved')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve Application
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => updateStatus('Rejected')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" />
                  Reject Application
                </button>
              </div>

              {/* Direct status selector */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => updateStatus(selectedStatus)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  <Clock className="h-4 w-4" />
                  Set Status
                </button>
              </div>
            </div>
          </div>

          {/* Status History */}
          {application.statusHistory?.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                <History className="h-4 w-4 text-brand-700" />
                Audit &amp; Status History
              </h3>
              <div className="mt-4 space-y-2.5">
                {application.statusHistory
                  .slice()
                  .reverse()
                  .map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col justify-between gap-2 rounded-lg bg-slate-50 p-3 text-sm sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <StatusBadge status={entry.status} />
                        <span className="text-slate-700">{entry.remark}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {entry.changedByName} •{' '}
                        {new Date(entry.changedAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
