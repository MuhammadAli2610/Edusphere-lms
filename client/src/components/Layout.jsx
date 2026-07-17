import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const teacherNav = [
  { to: '/', label: 'My Courses' },
  { to: '/create-course', label: 'Create Course' },
];
const studentNav = [
  { to: '/', label: 'Browse Courses' },
  { to: '/my-courses', label: 'My Enrollments' },
];
const adminNav = [
  { to: '/', label: 'Admin Dashboard' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  let nav = studentNav;
  if (user?.role === 'teacher') nav = teacherNav;
  if (user?.role === 'admin') nav = adminNav;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--canvas)' }}>
      {user && (
        <aside className="w-60 shrink-0 border-r flex flex-col" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="px-6 py-5">
            <Link to="/" className="font-display text-xl font-bold" style={{ color: 'var(--primary)' }}>EduSphere</Link>
          </div>
          <nav className="flex-1 px-3 flex flex-col gap-1">
            {nav.map(item => {
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to}
                  className="px-3 py-2 rounded-md text-sm font-medium transition"
                  style={{
                    background: active ? 'var(--primary)' : 'transparent',
                    color: active ? '#fff' : 'var(--ink-muted)',
                    borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                  }}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs uppercase tracking-wide font-mono" style={{ color: 'var(--ink-muted)' }}>{user.role}</p>
            <button onClick={logout} className="text-xs mt-2" style={{ color: 'var(--danger)' }}>Log out</button>
          </div>
        </aside>
      )}
      <div className="flex-1 flex flex-col">
        {!user && (
          <header className="flex justify-between items-center px-8 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <Link to="/" className="font-display text-xl font-bold" style={{ color: 'var(--primary)' }}>EduSphere</Link>
            <div className="flex gap-4 text-sm items-center">
              <Link to="/login">Log in</Link>
              <Link to="/register" className="font-medium" style={{ color: 'var(--primary)' }}>Sign up</Link>
            </div>
          </header>
        )}
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}