import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Save, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Spinner from '../../components/Spinner';
import AlertBanner from '../../components/AlertBanner';
import api, { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const DOC_INPUTS = [
  {
    key: 'photograph',
    label: 'Passport-size Photograph',
    accept: 'image/jpeg,image/png,image/webp',
    hint: 'JPG, PNG, or WEBP (Max 2 MB)',
  },
  {
    key: 'tenthMarksheet',
    label: '10th Marksheet',
    accept: 'application/pdf,image/jpeg,image/png',
    hint: 'PDF, JPG, or PNG (Max 2 MB)',
  },
  {
    key: 'twelfthMarksheet',
    label: '12th Marksheet',
    accept: 'application/pdf,image/jpeg,image/png',
    hint: 'PDF, JPG, or PNG (Max 2 MB)',
  },
  {
    key: 'identityProof',
    label: 'Identity Proof (Aadhaar / PAN / Passport)',
    accept: 'application/pdf,image/jpeg,image/png',
    hint: 'PDF, JPG, or PNG (Max 2 MB)',
  },
];

export default function ApplicationFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [existingApp, setExistingApp] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: '',
    gender: 'Male',
    address: '',
    city: '',
    state: '',
    pincode: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    previousSchool: '',
    course: '',
  });

  const [files, setFiles] = useState({
    photograph: null,
    tenthMarksheet: null,
    twelfthMarksheet: null,
    identityProof: null,
  });

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      try {
        const [coursesRes, appRes] = await Promise.all([
          api.get('/courses'),
          api.get('/applications/me'),
        ]);
        if (!active) return;

        const courseList = coursesRes.data.courses || [];
        setCourses(courseList);

        const app = appRes.data.application;
        if (app) {
          setExistingApp(app);
          setForm({
            fullName: app.personalInfo?.fullName || '',
            email: app.personalInfo?.email || '',
            phone: app.personalInfo?.phone || '',
            dateOfBirth: app.personalInfo?.dateOfBirth
              ? new Date(app.personalInfo.dateOfBirth).toISOString().split('T')[0]
              : '',
            gender: app.personalInfo?.gender || 'Male',
            address: app.personalInfo?.address || '',
            city: app.personalInfo?.city || '',
            state: app.personalInfo?.state || '',
            pincode: app.personalInfo?.pincode || '',
            tenthPercentage: String(app.academicInfo?.tenthPercentage ?? ''),
            twelfthPercentage: String(app.academicInfo?.twelfthPercentage ?? ''),
            previousSchool: app.academicInfo?.previousSchool || '',
            course: app.academicInfo?.course || (courseList[0]?.name || ''),
          });
        } else if (courseList.length > 0) {
          setForm((prev) => ({ ...prev, course: courseList[0].name }));
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  const isEditMode = Boolean(existingApp);
  const isEditingLocked = isEditMode && existingApp.status !== 'Pending';

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFileChange(key, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError(`${file.name} exceeds the 2 MB file size limit.`);
      e.target.value = '';
      return;
    }
    setError('');
    setFiles((prev) => ({ ...prev, [key]: file }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isEditingLocked) {
      setError(`Editing is locked because your application is "${existingApp.status}".`);
      return;
    }

    const tenth = Number(form.tenthPercentage);
    const twelfth = Number(form.twelfthPercentage);
    if (Number.isNaN(tenth) || tenth < 0 || tenth > 100) {
      setError('10th percentage must be between 0 and 100.');
      return;
    }
    if (Number.isNaN(twelfth) || twelfth < 0 || twelfth > 100) {
      setError('12th percentage must be between 0 and 100.');
      return;
    }

    if (!isEditMode) {
      const missing = DOC_INPUTS.filter((d) => !files[d.key]);
      if (missing.length > 0) {
        setError(`Please upload all required documents: ${missing.map((m) => m.label).join(', ')}`);
        return;
      }
    }

    const payload = new FormData();
    Object.entries(form).forEach(([k, v]) => payload.append(k, v));
    Object.entries(files).forEach(([k, file]) => {
      if (file) payload.append(k, file);
    });

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put('/applications/me', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Application updated successfully! Redirecting...');
      } else {
        await api.post('/applications', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Admission application submitted successfully! Redirecting...');
      }
      setTimeout(() => navigate('/student/application'), 900);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit application.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout
      title={isEditMode ? 'Edit Admission Application' : 'Online Admission Application Form'}
      subtitle={
        isEditMode
          ? `Application ID: ${existingApp?.applicationNumber} — Update permitted details while status is Pending.`
          : 'Fill out all personal, academic, and document sections accurately.'
      }
    >
      {loading ? (
        <Spinner label="Loading admission form..." />
      ) : (
        <div className="space-y-5">
          {isEditingLocked && (
            <AlertBanner
              type="warning"
              message={`Your application (${existingApp.applicationNumber}) is currently "${existingApp.status}". Editing is disabled once review has started.`}
            />
          )}
          <AlertBanner type="error" message={error} onClose={() => setError('')} />
          <AlertBanner type="success" message={success} />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                1. Personal Information
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    disabled={isEditingLocked}
                    value={form.fullName}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={isEditingLocked}
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    disabled={isEditingLocked}
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    disabled={isEditingLocked}
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Gender *</label>
                  <select
                    name="gender"
                    disabled={isEditingLocked}
                    value={form.gender}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    disabled={isEditingLocked}
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="201009"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Residential Address *
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    disabled={isEditingLocked}
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House No., Street, Locality"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">City</label>
                  <input
                    type="text"
                    name="city"
                    disabled={isEditingLocked}
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Ghaziabad"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">State</label>
                  <input
                    type="text"
                    name="state"
                    disabled={isEditingLocked}
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Uttar Pradesh"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                  />
                </div>
              </div>
            </section>

            {/* Academic Information */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                2. Academic Information &amp; Course Selection
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    10th Marks / Percentage (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    name="tenthPercentage"
                    required
                    disabled={isEditingLocked}
                    value={form.tenthPercentage}
                    onChange={handleChange}
                    placeholder="e.g. 88.5"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    12th Marks / Percentage (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    name="twelfthPercentage"
                    required
                    disabled={isEditingLocked}
                    value={form.twelfthPercentage}
                    onChange={handleChange}
                    placeholder="e.g. 86.2"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Previous School / College *
                  </label>
                  <input
                    type="text"
                    name="previousSchool"
                    required
                    disabled={isEditingLocked}
                    value={form.previousSchool}
                    onChange={handleChange}
                    placeholder="Name of your 12th school/college"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Select Course *
                  </label>
                  <select
                    name="course"
                    required
                    disabled={isEditingLocked}
                    value={form.course}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Document Uploads */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                3. Document Uploads
              </h2>
              <p className="mt-2 text-xs text-slate-500">
                {isEditMode
                  ? 'Upload a new file only if you want to replace an already submitted document.'
                  : 'All 4 documents are mandatory. Maximum file size: 2 MB per document.'}
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {DOC_INPUTS.map((doc) => {
                  const existingDoc = existingApp?.documents?.[doc.key];
                  const selectedFile = files[doc.key];

                  return (
                    <div
                      key={doc.key}
                      className="rounded-lg border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <label className="block text-sm font-semibold text-slate-800">
                        {doc.label} {!isEditMode && '*'}
                      </label>
                      <p className="mt-0.5 text-xs text-slate-500">{doc.hint}</p>

                      {existingDoc && !selectedFile && (
                        <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Uploaded: {existingDoc.fileName}
                        </p>
                      )}

                      {selectedFile && (
                        <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-700">
                          <UploadCloud className="h-3.5 w-3.5" />
                          Selected: {selectedFile.name}
                        </p>
                      )}

                      <input
                        type="file"
                        accept={doc.accept}
                        disabled={isEditingLocked}
                        onChange={(e) => handleFileChange(doc.key, e)}
                        className="mt-2 block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-700 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-brand-800 disabled:opacity-50"
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            {!isEditingLocked && (
              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {submitting
                    ? 'Saving...'
                    : isEditMode
                      ? 'Update Application'
                      : 'Submit Admission Application'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
