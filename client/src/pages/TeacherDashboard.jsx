import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/courses', { params: { instructor: user._id, limit: 50 } }).then(res => setCourses(res.data.courses));
  }, [user]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">My Courses</h1>
          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>{courses.length} course{courses.length !== 1 ? 's' : ''} published</p>
        </div>
        <Link to="/create-course" className="px-4 py-2 rounded-md text-sm font-medium text-white" style={{ background: 'var(--primary)' }}>
          + New course
        </Link>
      </div>
      <div className="grid gap-4">
        {courses.map(course => (
          <Link key={course._id} to={`/courses/${course._id}`} className="block rounded-lg border p-5 hover:shadow-md transition" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-display text-lg font-semibold">{course.title}</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>{course.description}</p>
              </div>
              <span className="text-xs font-mono uppercase px-2 py-1 rounded" style={{ background: 'var(--canvas)', color: 'var(--primary)' }}>{course.difficulty}</span>
            </div>
          </Link>
        ))}
        {courses.length === 0 && (
          <div className="rounded-lg border border-dashed p-10 text-center" style={{ borderColor: 'var(--border)' }}>
            <p style={{ color: 'var(--ink-muted)' }}>You haven't published a course yet.</p>
            <Link to="/create-course" className="text-sm font-medium mt-2 inline-block" style={{ color: 'var(--primary)' }}>Create your first course →</Link>
          </div>
        )}
      </div>
    </div>
  );
}