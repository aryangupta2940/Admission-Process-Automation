import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, LogIn, Mail, Shield, User } from 'lucide-react';
import CollegeHeader from '../components/CollegeHeader';
import Footer from '../components/Footer';
import AlertBanner from '../components/AlertBanner';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const loggedInUser = await login(email.trim(), password);
      if (loggedInUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemo(type) {
    setError('');
    if (type === 'admin') {
      setEmail('admin@abesec.ac.in');
      setPassword('Admin@12345');
    } else {
      setEmail('student@abesec.ac.in');
      setPassword('Student@12345');
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <CollegeHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <LogIn className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-900">Portal Sign In</h1>
              <p className="mt-1 text-sm text-slate-600">
                Sign in to your ABESEC Ghaziabad Student or Admin account
              </p>
            </div>

            <div className="mt-5">
              <AlertBanner type="error" message={error} onClose={() => setError('')} />
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@abesec.ac.in"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-brand-700 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                Demo Credentials (For Testing)
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => fillDemo('student')}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <User className="h-3.5 w-3.5 text-brand-700" />
                  Fill Student Demo
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Shield className="h-3.5 w-3.5 text-brand-700" />
                  Fill Admin Demo
                </button>
              </div>
              <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600">
                <p>
                  <strong>Student:</strong> student@abesec.ac.in / Student@12345
                </p>
                <p>
                  <strong>Admin:</strong> admin@abesec.ac.in / Admin@12345
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              New applicant?{' '}
              <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
                Create a Student Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
