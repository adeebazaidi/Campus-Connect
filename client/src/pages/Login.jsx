import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    email: 'admin@campus.edu',
    password: 'admin123',
    desc: 'Full Access',
    dot: 'bg-[#3A0F34]',
  },
  {
    role: 'Staff',
    email: 'staff@campus.edu',
    password: 'staff123',
    desc: 'IT Support',
    dot: 'bg-sky-400',
  },
  {
    role: 'Student',
    email: 'student@campus.edu',
    password: 'student123',
    desc: 'Submit & Track',
    dot: 'bg-[#EAAA00]',
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
    <div className="min-h-screen bg-[#DDE3E8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="bg-white rounded-2xl border-2 border-[#3A0F34] shadow-[6px_6px_0px_#3A0F34] p-8">

          {/* Brand */}
          <div className="flex items-center gap-3 mb-7 pb-5 border-b-2 border-[#3A0F34]/15">
            <div className="w-9 h-9 rounded-lg bg-[#EAAA00] text-[#3A0F34] border-2 border-[#3A0F34] shadow-[2.5px_2.5px_0px_#3A0F34] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
            </div>
            <div>
              <p className="text-base font-black text-[#3A0F34] leading-tight font-display tracking-tight">CampusConnect</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#3A0F34]/60">Complaint Portal</p>
            </div>
          </div>

          <h1 className="text-xl font-black text-[#3A0F34] mb-5 font-display">Sign in to your account</h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="input-label" htmlFor="email">Email Address</label>
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
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-[#3A0F34] hover:text-[#3A0F34]/70 transition-colors"
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
              <div className="rounded-xl bg-rose-100 border-2 border-[#3A0F34] px-3.5 py-2.5 shadow-[2px_2px_0px_#3A0F34]">
                <p className="text-xs font-black text-rose-950">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-[#3A0F34] border-t-transparent animate-spin" />
                  Signing in…
                </>
              ) : selectedRole ? (
                `Sign in as ${selectedRole}`
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs font-bold text-[#3A0F34]/80">
            No account?{' '}
            <Link to="/register" className="font-black text-[#3A0F34] underline decoration-2 hover:text-[#EAAA00]">
              Create one
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-6">
            <div className="relative flex items-center gap-2 mb-3">
              <div className="flex-1 border-t-2 border-[#3A0F34]/20" />
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3A0F34]/60">Quick Demo Logins</span>
              <div className="flex-1 border-t-2 border-[#3A0F34]/20" />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const active = selectedRole === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleDemo(acc)}
                    className={`flex flex-col items-center text-center p-3 rounded-xl border-2 border-[#3A0F34] text-xs transition-all cursor-pointer ${
                      active
                        ? 'bg-[#EAAA00] shadow-[3px_3px_0px_#3A0F34] -translate-x-0.5 -translate-y-0.5'
                        : 'bg-white shadow-[2px_2px_0px_#3A0F34] hover:bg-[#DDE3E8]'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full border border-[#3A0F34] mb-1.5 ${acc.dot}`} />
                    <span className="font-black text-[#3A0F34]">{acc.role}</span>
                    <span className="text-[10px] font-bold text-[#3A0F34]/70">{acc.desc}</span>
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
