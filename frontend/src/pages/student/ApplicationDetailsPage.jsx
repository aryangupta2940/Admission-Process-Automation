import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, FilePlus2, History } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import SecureFilePreview from '../../components/SecureFilePreview';
import Spinner from '../../components/Spinner';
import AlertBanner from '../../components/AlertBanner';
import api, { getErrorMessage } from '../../api/client';

export default function ApplicationDetailsPage() {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get('/applications/me')
      .then((res) => {
        if (active) setApplication(res.data.application);
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

  return (
    <DashboardLayout
      title="My Admission Application"
      subtitle="Review your submitted personal details, academic marks, uploaded documents, and status timeline."
    >
      {loading ? (
        <Spinner label="Fetching your application..." />
      ) : error ? (
        <AlertBanner type="error" message={error} />
      ) : !application ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">No Application Submitted</h2>
          <p className="mt-2 text-sm text-slate-600">
            You have not submitted your online admission form yet.
          </p>
          <Link
            to="/student/apply"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
          >
            <FilePlus2 className="h-4 w-4" />
            Fill Admission Form
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Banner */}
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
                Submitted on {new Date(application.submittedAt).toLocaleString('en-IN')}
              </p>
            </div>

            {application.status === 'Pending' && (
              <Link
                to="/student/apply"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
              >
                <Edit3 className="h-4 w-4" />
                Edit Application
              </Link>
            )}
          </div>

          {application.status === 'Rejected' && application.rejectionReason && (
            <AlertBanner
              type="error"
              message={`Rejection Reason: ${application.rejectionReason}`}
            />
          )}

          {application.adminRemarks && (
            <AlertBanner
              type="info"
              message={`Admissions Committee Remarks: ${application.adminRemarks}`}
            />
          )}

          {/* Personal & Academic Info */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                Personal Information
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
                Academic Information
              </h3>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Selected Course</dt>
                  <dd className="text-right font-semibold text-brand-800">
                    {application.academicInfo.course}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">10th Percentage</dt>
                  <dd className="font-medium text-slate-900">
                    {application.academicInfo.tenthPercentage}%
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">12th Percentage</dt>
                  <dd className="font-medium text-slate-900">
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
              Uploaded Documents
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

          {/* Status History */}
          {application.statusHistory?.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                <History className="h-4 w-4 text-brand-700" />
                Application Status Timeline
              </h3>
              <div className="mt-4 space-y-3">
                {application.statusHistory
                  .slice()
                  .reverse()
                  .map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <StatusBadge status={entry.status} />
                        <span className="text-sm text-slate-700">{entry.remark}</span>
                      </div>
                      <span className="text-xs text-slate-400">
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
