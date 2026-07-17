import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProgressRing from '../components/ProgressRing';

export default function MyEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [lessonCounts, setLessonCounts] = useState({});

  useEffect(() => {
    api.get('/enrollments').then(async res => {
      setEnrollments(res.data);
      const counts = {};
      await Promise.all(res.data.map(async e => {
        const lessonsRes = await api.get(`/courses/${e.course._id}/lessons`);
        counts[e.course._id] = lessonsRes.data.length;
      }));
      setLessonCounts(counts);
    });
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">My Enrollments</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-muted)' }}>Track your progress across enrolled courses.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {enrollments.map(e => {
          const total = lessonCounts[e.course._id] || 0;
          const percent = total > 0 ? Math.round((e.completedLessons.length / total) * 100) : 0;
          return (
            <Link key={e._id} to={`/courses/${e.course._id}`} className="rounded-lg border p-5 flex items-center gap-4 hover:shadow-md transition" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <ProgressRing percent={percent} />
              <div>
                <h2 className="font-display font-semibold">{e.course.title}</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>{e.completedLessons.length} of {total} lessons complete</p>
              </div>
            </Link>
          );
        })}
        {enrollments.length === 0 && <p style={{ color: 'var(--ink-muted)' }}>You haven't enrolled in any courses yet.</p>}
      </div>
    </div>
  );
}