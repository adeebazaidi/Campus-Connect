import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
  'Civil Engineering', 'Business Administration', 'Mathematics',
  'Physics', 'Chemistry', 'IT Support', 'Administration', 'Other',
];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#DDE3E8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
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

          <h1 className="text-xl font-black text-[#3A0F34] mb-5 font-display">Create your account</h1>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label className="input-label" htmlFor="name">Full Name <span className="text-rose-600">*</span></label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="input-label" htmlFor="email">Email Address <span className="text-rose-600">*</span></label>
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

            {/* Password */}
            <div>
              <label className="input-label" htmlFor="password">Password <span className="text-rose-600">*</span></label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="input-field"
                placeholder="Min. 6 characters"
              />
            </div>

            {/* Role + Department in a grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label" htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="input-field cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {form.role !== 'admin' && (
                <div>
                  <label className="input-label" htmlFor="department">Department <span className="text-rose-600">*</span></label>
                  <select
                    id="department"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                    className="input-field cursor-pointer"
                  >
                    <option value="">Select…</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
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
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs font-bold text-[#3A0F34]/80">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-[#3A0F34] underline decoration-2 hover:text-[#EAAA00]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
