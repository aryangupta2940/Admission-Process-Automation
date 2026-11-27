import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import CollegeHeader from '../components/CollegeHeader';
import Footer from '../components/Footer';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    let active = true;
    api
      .get('/courses')
      .then((res) => {
        if (active && res.data?.courses) setCourses(res.data.courses);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const steps = [
    {
      title: '1. Register Online',
      desc: 'Create your student account using a valid email address and phone number.',
      Icon: UserPlus,
    },
    {
      title: '2. Fill Admission Form',
      desc: 'Enter your personal details, 10th & 12th academic scores, and preferred course.',
      Icon: ClipboardList,
    },
    {
      title: '3. Upload Documents',
      desc: 'Upload your photograph, 10th & 12th marksheets, and valid identity proof.',
      Icon: FileCheck2,
    },
    {
      title: '4. Track Real-Time Status',
      desc: 'Receive instant updates as the ABESEC Admissions Committee reviews your profile.',
      Icon: CheckCircle2,
    },
  ];

  const dashboardRoute = user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <CollegeHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-200">
                  <ShieldCheck className="h-4 w-4" />
                  Official Admissions Portal — ABESEC Ghaziabad
                </span>
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
                  Digital Admission Process Automation System
                </h1>
                <p className="mt-4 max-w-2xl text-base text-blue-100 sm:text-lg">
                  Apply online for B.Tech, MCA, and MBA programs at{' '}
                  <strong className="text-white">ABESEC Ghaziabad</strong>. Submit your application,
                  upload academic documents securely, and track verification status in real time.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  {isAuthenticated ? (
                    <Link
                      to={dashboardRoute}
                      className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-brand-900 shadow-sm transition hover:bg-blue-50"
                    >
                      Go to {user?.role === 'admin' ? 'Admin' : 'Student'} Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/register"
                        className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-brand-900 shadow-sm transition hover:bg-blue-50"
                      >
                        Apply Now (Student Register)
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-300/40 bg-brand-800/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                      >
                        Student / Admin Login
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                  <h2 className="text-lg font-bold text-white">Admission Highlights 2026-27</h2>
                  <ul className="mt-4 space-y-3 text-sm text-blue-100">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span>100% paperless online application and document verification</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span>Unique Application ID generated upon submission (ABES-2026-XXXX)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span>Live status tracking: Pending, Under Review, Approved, or Rejected</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span>Instant portal notifications on every administrative review action</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4-Step Process */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              How the Online Admission Process Works
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Complete your admission application in four streamlined steps.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ title, desc, Icon }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Available Courses */}
        <section className="border-t border-slate-200 bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Programs Offered</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Explore undergraduate and postgraduate courses at ABESEC Ghaziabad.
                </p>
              </div>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                Start your application <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course.code}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                        {course.code}
                      </span>
                      <span className="text-xs font-medium text-slate-500">{course.duration}</span>
                    </div>
                    <h3 className="mt-3 flex items-start gap-2 text-base font-bold text-slate-900">
                      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                      <span>{course.name}</span>
                    </h3>
                    <p className="mt-2 text-xs text-slate-600">
                      <strong>Eligibility:</strong> {course.eligibility}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-600">
                    <span>Intake: {course.totalSeats} Seats</span>
                    <span className="font-semibold text-slate-800">
                      Fee: ₹{Number(course.annualFee).toLocaleString('en-IN')}/yr
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
