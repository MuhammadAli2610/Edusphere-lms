import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProgressRing from '../components/ProgressRing';
import LessonQuiz from '../components/LessonQuiz';

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [roster, setRoster] = useState([]);
  const [newLesson, setNewLesson] = useState({ title: '', content: '', videoUrl: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOwner = user && course && course.instructor?._id === user._id;
  const isStudent = user && user.role === 'student';

  const loadAll = async () => {
    const courseRes = await api.get(`/courses/${id}`);
    setCourse(courseRes.data);

    const lessonsRes = await api.get(`/courses/${id}/lessons`);
    setLessons(lessonsRes.data);

    if (user?.role === 'student') {
      const statusRes = await api.get(`/enrollments/${id}/status`);
      setEnrollment(statusRes.data.enrollment);
    }
    if (user && courseRes.data.instructor?._id === user._id) {
      const rosterRes = await api.get(`/enrollments/course/${id}/roster`);
      setRoster(rosterRes.data);
    }
  };

  useEffect(() => { loadAll(); }, [id, user]);

  const handleEnroll = async () => {
    try { await api.post(`/enrollments/${id}`); loadAll(); }
    catch (err) { setError(err.response?.data?.message || 'Enrollment failed'); }
  };

  const handleCompleteLesson = async (lessonId) => {
    await api.post(`/enrollments/${id}/complete`, { lessonId });
    loadAll();
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', newLesson.title);
      formData.append('content', newLesson.content);
      formData.append('videoUrl', newLesson.videoUrl);
      if (pdfFile) formData.append('pdf', pdfFile);

      await api.post(`/courses/${id}/lessons`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewLesson({ title: '', content: '', videoUrl: '' });
      setPdfFile(null);
      loadAll();
    } catch (err) { setError(err.response?.data?.message || 'Failed to add lesson'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteLesson = async (lessonId) => {
    await api.delete(`/lessons/${lessonId}`);
    loadAll();
  };

  if (!course) return <p style={{ color: 'var(--ink-muted)' }}>Loading...</p>;

  const isEnrolled = !!enrollment;
  const progress = enrollment && lessons.length > 0
    ? Math.round((enrollment.completedLessons.length / lessons.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <span className="text-xs font-mono uppercase" style={{ color: 'var(--primary)' }}>{course.category || 'General'} • {course.difficulty}</span>
      <h1 className="font-display text-3xl font-bold mt-1">{course.title}</h1>
      <p className="mt-1" style={{ color: 'var(--ink-muted)' }}>{course.description}</p>
      <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>By {course.instructor?.name}</p>

      {isOwner && (
        <Link to={`/courses/${id}/edit`} className="inline-block mt-2 text-xs font-medium" style={{ color: 'var(--primary)' }}>
          Edit course details
        </Link>
      )}

      {error && <p className="mt-3" style={{ color: 'var(--danger)' }}>{error}</p>}

      {isStudent && !isEnrolled && (
        <button onClick={handleEnroll} className="mt-5 px-4 py-2 rounded-md text-sm font-medium text-white" style={{ background: 'var(--primary)' }}>
          Enroll in this course
        </button>
      )}

      {isStudent && isEnrolled && (
        <div className="mt-6 flex items-center gap-4 rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <ProgressRing percent={progress} />
          <div>
            <p className="font-medium text-sm">Your progress</p>
            <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>{enrollment.completedLessons.length} of {lessons.length} lessons complete</p>
          </div>
        </div>
      )}

      <h2 className="font-display text-xl font-semibold mt-8 mb-3">Lessons</h2>
      <div className="flex flex-col gap-2">
        {lessons.map(lesson => {
          const isDone = enrollment?.completedLessons.includes(lesson._id);
          const embedUrl = getYoutubeEmbedUrl(lesson.videoUrl);
          return (
            <div key={lesson._id} className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>{lesson.content}</p>
                </div>
                <div className="flex gap-3 items-center">
                  {isStudent && isEnrolled && (
                    <button onClick={() => handleCompleteLesson(lesson._id)} disabled={isDone}
                      className="text-xs px-3 py-1.5 rounded-md font-medium"
                      style={{ background: isDone ? '#E7F3F0' : 'var(--canvas)', color: isDone ? 'var(--primary)' : 'var(--ink-muted)' }}>
                      {isDone ? '✓ Completed' : 'Mark complete'}
                    </button>
                  )}
                  {isOwner && (
                    <button onClick={() => handleDeleteLesson(lesson._id)} className="text-xs" style={{ color: 'var(--danger)' }}>Delete</button>
                  )}
                </div>
              </div>

              {embedUrl && (
                <div className="mt-3 aspect-video max-w-md">
                  <iframe
                    src={embedUrl}
                    title={lesson.title}
                    className="w-full h-full rounded-md"
                    allowFullScreen
                  />
                </div>
              )}

              {lesson.pdfUrl && (
                <a href={lesson.pdfUrl}

                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-xs font-medium"
                  style={{ color: 'var(--primary)' }}
                >
                  📄 View PDF
                </a>
              )}

              <LessonQuiz
                lessonId={lesson._id}
                isOwner={isOwner}
                isStudent={isStudent}
                isEnrolled={isEnrolled}
              />
            </div>
          );
        })}
        {lessons.length === 0 && <p style={{ color: 'var(--ink-muted)' }}>No lessons yet.</p>}
      </div>

      {isOwner && (
        <>
          <div className="mt-8 rounded-lg border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <h2 className="font-display text-lg font-semibold mb-3">Add a lesson</h2>
            <form onSubmit={handleAddLesson} className="flex flex-col gap-2 max-w-sm">
              <input className="border rounded-md px-3 py-2 text-sm" style={{ borderColor: 'var(--border)' }} placeholder="Lesson title"
                value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} required />
              <textarea className="border rounded-md px-3 py-2 text-sm" style={{ borderColor: 'var(--border)' }} placeholder="Content / notes"
                value={newLesson.content} onChange={e => setNewLesson({ ...newLesson, content: e.target.value })} />
              <input className="border rounded-md px-3 py-2 text-sm" style={{ borderColor: 'var(--border)' }} placeholder="YouTube link (optional)"
                value={newLesson.videoUrl} onChange={e => setNewLesson({ ...newLesson, videoUrl: e.target.value })} />
              <label className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>PDF attachment (optional)</label>
              <input type="file" accept="application/pdf" className="text-sm"
                onChange={e => setPdfFile(e.target.files[0] || null)} />
              <button disabled={submitting} className="py-2 rounded-md text-sm font-medium text-white" style={{ background: 'var(--primary)' }}>
                {submitting ? 'Adding...' : 'Add lesson'}
              </button>
            </form>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold mb-3">Student roster ({roster.length})</h2>
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full text-sm">
                <thead style={{ background: 'var(--canvas)' }}>
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Student</th>
                    <th className="text-left px-4 py-2 font-medium">Email</th>
                    <th className="text-left px-4 py-2 font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map(r => (
                    <tr key={r._id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-4 py-2">{r.student?.name}</td>
                      <td className="px-4 py-2" style={{ color: 'var(--ink-muted)' }}>{r.student?.email}</td>
                      <td className="px-4 py-2 font-mono">{r.completedLessons.length} / {lessons.length}</td>
                    </tr>
                  ))}
                  {roster.length === 0 && (
                    <tr><td colSpan="3" className="px-4 py-3 text-center" style={{ color: 'var(--ink-muted)' }}>No students enrolled yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}