import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Package2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthService } from '../services';
import { Spinner, PasswordStrength } from '../components/Loader';
import Input from '../components/Input';
import Button from '../components/Button';
import type { Role } from '../types';
import { notify } from '../lib/toast';
import { isValidEmail, isPasswordStrong } from '../utils';
import { ROUTES } from '../constants';

function validate(email: string, password: string) {
  const e: Record<string, string> = {};
  if (!email.trim())             e.email    = 'Email is required.';
  else if (!isValidEmail(email)) e.email    = 'Enter a valid email address.';
  if (!password)                 e.password = 'Password is required.';
  else if (!isPasswordStrong(password)) e.password = 'Password does not meet all strength requirements.';
  return e;
}

export default function Register() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '', role: 'STAFF' as Role });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [apiErr,  setApiErr]  = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
    setApiErr('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form.email, form.password);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiErr('');
    try {
      await AuthService.register(form.email, form.password, form.role);
      setSuccess(true);
      notify.registered();
    } catch (err: any) {
      setApiErr(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-[400px] text-center space-y-5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20
            bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl">
            <CheckCircle2 size={38} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-gray-900 dark:text-white tracking-tight">
              Account Created!
            </h1>
            <p className="text-[13.5px] text-gray-500 dark:text-gray-400 mt-2">
              Your account has been created successfully. You can now sign in with your credentials.
            </p>
          </div>
          <Button onClick={() => navigate(ROUTES.LOGIN)} className="w-full py-3 text-[14px]">
            Go to Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-[420px] space-y-5"
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
              Create your account
            </h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
              Start managing your inventory today
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200
          dark:border-gray-800 shadow-card-md p-7">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {apiErr && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-start gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-900/20
                  border border-red-200 dark:border-red-800 rounded-xl"
              >
                <span className="text-red-500 shrink-0 mt-px">⚠</span>
                <p className="text-[13px] text-red-700 dark:text-red-400 font-medium">{apiErr}</p>
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

            <div>
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                error={errors.password}
                rightElement={
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label="Toggle password">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              <PasswordStrength password={form.password} />
            </div>

            {/* Role selector */}
            <div>
              <p className="text-[11.5px] font-bold text-gray-500 dark:text-gray-400
                uppercase tracking-wider mb-1.5">
                Role
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {(['ADMIN', 'STAFF'] as Role[]).map((role) => (
                  <button key={role} type="button"
                    onClick={() => setForm((f) => ({ ...f, role }))}
                    className={`py-2.5 rounded-xl border text-[13px] font-bold transition-all ${
                      form.role === role
                        ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                        : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}>
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-1 py-2.5">
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-5 text-center text-[13px] text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
