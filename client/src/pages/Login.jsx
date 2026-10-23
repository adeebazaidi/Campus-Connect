import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    email: 'admin@campus.edu',
    password: 'admin123',
    desc: 'Full access',
    cls: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50',
    activeCls: 'border-purple-500 bg-purple-50 ring-2 ring-purple-200',
    dot: 'bg-purple-500',
  },
  {
    role: 'Staff',
    email: 'staff@campus.edu',
    password: 'staff123',
    desc: 'IT Support',
    cls: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    activeCls: 'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
    dot: 'bg-blue-500',
  },
  {
    role: 'Student',
    email: 'student@campus.edu',
    password: 'student123',
    desc: 'Submit & Track',
    cls: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50',
    activeCls: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm]               = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelected]   = useState(null);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setSelected(null);
  };

  const handleDemo = (acc) => {
    setForm({ email: acc.email, password: acc.password });
    setSelected(acc.role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-7">

          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-7">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">CampusConnect</p>
              <p className="text-[11px] text-slate-400">Complaint Management Portal</p>
            </div>
          </div>

          <h1 className="text-lg font-bold text-slate-800 mb-5">Sign in to your account</h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="input-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="input-field"
                placeholder="name@campus.edu"
              />
            </div>

            <div>
              <label className="input-label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="input-field pr-9"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Signing in…
                </>
              ) : selectedRole ? (
                `Sign in as ${selectedRole}`
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            No account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
              Create one
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-5">
            <div className="relative flex items-center gap-2 mb-3">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Quick Demo</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const active = selectedRole === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleDemo(acc)}
                    className={`flex flex-col items-center text-center p-2.5 rounded-xl border text-xs transition-all duration-150 ${
                      active ? acc.activeCls : `bg-white ${acc.cls}`
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full mb-1.5 ${acc.dot}`} />
                    <span className="font-semibold text-slate-800">{acc.role}</span>
                    <span className="text-[10px] text-slate-400">{acc.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
