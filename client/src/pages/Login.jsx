import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branded panel */}
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0f3d38 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L1 8l11 5 9-4.09V17h2V8L12 3z" fill="#fff" />
              <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="#fff" opacity="0.85" />
            </svg>
          </div>
          <span className="font-display text-2xl font-bold text-white">EduSphere</span>
        </div>

        <div>
          <h2 className="font-display text-3xl font-bold text-white leading-snug mb-3">
            Learn something new,<br />every single day.
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Join courses, track your progress, and grow with EduSphere.
          </p>
        </div>

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          © {new Date().getFullYear()} EduSphere. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: 'var(--canvas)' }}>
        <div className="w-full max-w-sm p-8 rounded-2xl border shadow-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          {/* Mobile-only logo */}
          <div className="flex md:hidden items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L1 8l11 5 9-4.09V17h2V8L12 3z" fill="#fff" />
              </svg>
            </div>
            <span className="font-display text-lg font-bold" style={{ color: 'var(--primary)' }}>EduSphere</span>
          </div>

          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="text-sm mt-1 mb-6" style={{ color: 'var(--ink-muted)' }}>Log in to continue to your dashboard.</p>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-md text-sm" style={{ background: '#FDECEC', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-muted)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 5h18v14H3V5z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3 6l9 7 9-7" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
              <input
                className="border rounded-md pl-9 pr-3 py-2.5 text-sm w-full focus:outline-none"
                style={{ borderColor: 'var(--border)' }}
                placeholder="Email"
                type="email"
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-muted)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
              <input
                className="border rounded-md pl-9 pr-3 py-2.5 text-sm w-full focus:outline-none"
                style={{ borderColor: 'var(--border)' }}
                placeholder="Password"
                type="password"
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              disabled={submitting}
              className="py-2.5 rounded-md text-sm font-medium text-white transition flex items-center justify-center gap-2"
              style={{ background: 'var(--primary)', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting && (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.3" />
                  <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="3" />
                </svg>
              )}
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="mt-5 text-sm text-center" style={{ color: 'var(--ink-muted)' }}>
            No account?{' '}
            <Link to="/register" className="font-medium" style={{ color: 'var(--primary)' }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}