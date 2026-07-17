import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    api.get('/courses', { params: { search, difficulty, category, limit: 50 } })
      .then(res => setCourses(res.data.courses));
  }, [search, difficulty, category]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Browse Courses</h1>
      <p className="text-sm mb-5" style={{ color: 'var(--ink-muted)' }}>Find something new to learn.</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="border rounded-md px-3 py-2 w-full max-w-sm text-sm"
          style={{ borderColor: 'var(--border)' }}
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border rounded-md px-3 py-2 text-sm"
          style={{ borderColor: 'var(--border)' }}
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
        >
          <option value="">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <input
          className="border rounded-md px-3 py-2 text-sm"
          style={{ borderColor: 'var(--border)' }}
          placeholder="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map(course => (
          <Link key={course._id} to={`/courses/${course._id}`} className="block rounded-lg border p-5 hover:shadow-md transition" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <span className="text-xs font-mono uppercase" style={{ color: 'var(--primary)' }}>{course.category || 'General'} • {course.difficulty}</span>
            <h2 className="font-display text-lg font-semibold mt-1">{course.title}</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>{course.description}</p>
            <p className="text-xs mt-3" style={{ color: 'var(--ink-muted)' }}>By {course.instructor?.name}</p>
          </Link>
        ))}
        {courses.length === 0 && <p style={{ color: 'var(--ink-muted)' }}>No courses found.</p>}
      </div>
    </div>
  );
}