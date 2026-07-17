import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function EditCourse() {
  const { id } = useParams();
  const [form, setForm] = useState({ title: '', description: '', category: '', difficulty: 'beginner' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/courses/${id}`).then(res => {
      const { title, description, category, difficulty } = res.data;
      setForm({ title, description: description || '', category: category || '', difficulty });
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/courses/${id}`, form);
      navigate(`/courses/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p style={{ color: 'var(--ink-muted)' }}>Loading...</p>;

  return (
    <div className="max-w-sm p-6 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <h1 className="font-display text-2xl font-bold mb-4">Edit course</h1>
      {error && <p className="mb-3 text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input className="border rounded-md px-3 py-2 text-sm" style={{ borderColor: 'var(--border)' }} placeholder="Title"
          value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <textarea className="border rounded-md px-3 py-2 text-sm" style={{ borderColor: 'var(--border)' }} placeholder="Description"
          value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input className="border rounded-md px-3 py-2 text-sm" style={{ borderColor: 'var(--border)' }} placeholder="Category"
          value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
        <select className="border rounded-md px-3 py-2 text-sm" style={{ borderColor: 'var(--border)' }}
          value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <button disabled={submitting} className="py-2 rounded-md text-sm font-medium text-white" style={{ background: 'var(--primary)' }}>
          {submitting ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}