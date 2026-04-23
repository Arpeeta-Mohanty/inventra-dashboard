import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Package2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services';
import { Spinner } from '../components/Loader';
import Input from '../components/Input';
import Button from '../components/Button';
import { notify } from '../lib/toast';
import { isValidEmail } from '../utils';
import { ROUTES } from '../constants';

function validate(email: string, password: string) {
  const e: Record<string, string> = {};
  if (!email.trim())          e.email    = 'Email is required.';
  else if (!isValidEmail(email)) e.email = 'Enter a valid email address.';
  if (!password)              e.password = 'Password is required.';
  else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
  return e;
}

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form,     setForm]    = useState({ email: '', password: '' });
  const [errors,   setErrors]  = useState<Record<string, string>>({});
  const [loading,  setLoading] = useState(false);
  const [showPw,   setShowPw]  = useState(false);
  const [apiErr,   setApiErr]  = useState('');

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
    setApiErr('');
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const errs = validate(form.email, form.password);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiErr('');
    try {
      const { token, user } = await AuthService.login(form.email, form.password);
      login(token, user);
      notify.welcome(user.email, user.role);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setApiErr(err.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  const DEMOS = [
    { role: 'Admin', email: 'admin@demo.com', pw: 'Admin@123' },
    { role: 'Staff', email: 'staff@demo.com', pw: 'Staff@123' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-[400px] space-y-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-2xl shadow-md">
            <Package2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">
              Sign in to Inventra Dashboard
            </h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
              Enter your credentials to access the dashboard
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200
          dark:border-gray-800 shadow-card-md p-7">
          <form onSubmit={submit} noValidate className="space-y-4">

            {/* API error */}
            {apiErr && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-start justify-between gap-3 px-4 py-3
                  bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
              >
                <div className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0 mt-px">⚠</span>
                  <p className="text-[13px] text-red-700 dark:text-red-400 font-medium">{apiErr}</p>
                </div>
                <button type="button" onClick={() => submit()}
                  className="shrink-0 flex items-center gap-1 text-[11.5px] font-bold
                    text-red-600 dark:text-red-400 hover:text-red-800 transition-colors">
                  <RefreshCw size={11} /> Retry
                </button>
              </motion.div>
            )}

            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              error={errors.email}
            />

            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password}
              rightElement={
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Toggle password">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            <Button type="submit" loading={loading} className="w-full mt-1 py-2.5">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-5 text-center text-[13px] text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold">
              Create one
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800
          rounded-2xl px-5 py-4 shadow-card">
          <p className="text-[11.5px] font-bold text-blue-900 dark:text-blue-300 uppercase
            tracking-wider mb-3">
            Demo Credentials
          </p>
          <div className="space-y-2">
            {DEMOS.map(({ role, email, pw }) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-blue-800 dark:text-blue-300">{role}</span>
                <button
                  type="button"
                  onClick={() => { setForm({ email, password: pw }); setApiErr(''); setErrors({}); }}
                  className="text-[11.5px] font-mono text-blue-700 dark:text-blue-400
                    hover:text-blue-900 dark:hover:text-blue-200 hover:underline transition-colors"
                >
                  {email} / {pw}
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
