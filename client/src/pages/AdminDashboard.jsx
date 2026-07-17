import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function AdminDashboard() {
  const [view, setView] = useState('users'); // 'users' | 'courses'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    const statsRes = await api.get('/admin/stats');
    setStats(statsRes.data);
    const usersRes = await api.get('/admin/users', { params: filter ? { role: filter } : {} });
    setUsers(usersRes.data);
  };

  const loadCourses = async () => {
    const statsRes = await api.get('/admin/stats');
    setStats(statsRes.data);
    const coursesRes = await api.get('/admin/courses');
    setCourses(coursesRes.data);
  };

  useEffect(() => {
    if (view === 'users') loadUsers();
    else loadCourses();
  }, [view, filter]);

  const handleRoleChange = async (id, role) => {
    try { await api.put(`/admin/users/${id}/role`, { role }); loadUsers(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to update role'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try { await api.delete(`/admin/users/${id}`); loadUsers(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to delete user'); }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course and all its lessons? This cannot be undone.')) return;
    try { await api.delete(`/admin/courses/${id}`); loadCourses(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to delete course'); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-display text-2xl font-bold mb-1">Admin Dashboard</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-muted)' }}>Manage all teachers, students, and courses.</p>

      {error && <p className="mb-4 text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>Students</p>
            <p className="font-display text-2xl font-bold">{stats.totalStudents}</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>Teachers</p>
            <p className="font-display text-2xl font-bold">{stats.totalTeachers}</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>Courses</p>
            <p className="font-display text-2xl font-bold">{stats.totalCourses}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <button onClick={() => setView('users')} className="px-3 py-2 text-sm font-medium"
          style={{ borderBottom: view === 'users' ? '2px solid var(--primary)' : '2px solid transparent', color: view === 'users' ? 'var(--primary)' : 'var(--ink-muted)' }}>
          Users
        </button>
        <button onClick={() => setView('courses')} className="px-3 py-2 text-sm font-medium"
          style={{ borderBottom: view === 'courses' ? '2px solid var(--primary)' : '2px solid transparent', color: view === 'courses' ? 'var(--primary)' : 'var(--ink-muted)' }}>
          Courses
        </button>
      </div>

      {view === 'users' && (
        <>
          <div className="flex gap-2 mb-4">
            {['', 'student', 'teacher', 'admin'].map(r => (
              <button
                key={r || 'all'}
                onClick={() => setFilter(r)}
                className="px-3 py-1.5 rounded-md text-xs font-medium capitalize"
                style={{
                  background: filter === r ? 'var(--primary)' : 'var(--canvas)',
                  color: filter === r ? '#fff' : 'var(--ink-muted)',
                }}
              >
                {r || 'All'}
              </button>
            ))}
          </div>

          <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--canvas)' }}>
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Name</th>
                  <th className="text-left px-4 py-2 font-medium">Email</th>
                  <th className="text-left px-4 py-2 font-medium">Role</th>
                  <th className="text-left px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-2">{u.name}</td>
                    <td className="px-4 py-2" style={{ color: 'var(--ink-muted)' }}>{u.email}</td>
                    <td className="px-4 py-2">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        className="border rounded-md px-2 py-1 text-xs"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => handleDeleteUser(u._id)} className="text-xs font-medium" style={{ color: 'var(--danger)' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="4" className="px-4 py-3 text-center" style={{ color: 'var(--ink-muted)' }}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'courses' && (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--canvas)' }}>
              <tr>
                <th className="text-left px-4 py-2 font-medium">Title</th>
                <th className="text-left px-4 py-2 font-medium">Instructor</th>
                <th className="text-left px-4 py-2 font-medium">Difficulty</th>
                <th className="text-left px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c._id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-2">
                    <Link to={`/courses/${c._id}`} style={{ color: 'var(--primary)' }}>{c.title}</Link>
                  </td>
                  <td className="px-4 py-2" style={{ color: 'var(--ink-muted)' }}>{c.instructor?.name}</td>
                  <td className="px-4 py-2 capitalize">{c.difficulty}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleDeleteCourse(c._id)} className="text-xs font-medium" style={{ color: 'var(--danger)' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr><td colSpan="4" className="px-4 py-3 text-center" style={{ color: 'var(--ink-muted)' }}>No courses found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}