import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, getDefaultRouteForRole } from '../../context/AuthContext';
import { ScanFace, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { isMockMode } from '../../api/client';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const newFieldErrors: Record<string, string> = {};
    if (!email) newFieldErrors.email = 'Email address is required';
    if (!password) newFieldErrors.password = 'Password is required';

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password);
      const target = from || getDefaultRouteForRole(user.role);
      navigate(target, { replace: true });
    } catch (err: any) {
      if (err.fieldErrors && Array.isArray(err.fieldErrors)) {
        const mapped: Record<string, string> = {};
        err.fieldErrors.forEach((fe: any) => {
          mapped[fe.field] = fe.message;
        });
        setFieldErrors(mapped);
      }
      setGeneralError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@1234');
    setGeneralError(null);
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 mb-4 shadow-sm">
          <ScanFace className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          AcuAttend Portal
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          AI-Powered Attendance & Biometric Access System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          {generalError && (
            <div className="mb-4 p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. teacher@demo.com"
                  className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300 ${
                    fieldErrors.email
                      ? 'border-rose-400 dark:border-rose-600'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-300 ${
                    fieldErrors.password
                      ? 'border-rose-400 dark:border-rose-600'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white focus:outline-hidden transition-colors shadow-xs"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Instant Demo Credentials
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Pass: Demo@1234</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('teacher@demo.com')}
                className="p-2 text-left bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
              >
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Teacher
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  teacher@demo.com
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('student@demo.com')}
                className="p-2 text-left bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
              >
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Student
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  student@demo.com
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('admin@demo.com')}
                className="p-2 text-left bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
              >
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Admin
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  admin@demo.com
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('parent@demo.com')}
                className="p-2 text-left bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
              >
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Parent
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  parent@demo.com
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
