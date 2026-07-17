import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreateCourse() {
  const [form, setForm] = useState({ title: '', description: '', category: '', difficulty: 'beginner' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/courses', form); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Failed to create course'); }
  };

  return (
    <div className="max-w-sm p-6 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <h1 className="font-display text-2xl font-bold mb-4">Create course</h1>
      {error && <p className="mb-3 text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input className="border rounded-md px-3 py-2 text-sm" style={{ borderColor: 'var(--border)' }} placeholder="Title"
          onChange={e => setForm({ ...form, title: e.target.value })} required />
        <textarea className="border rounded-md px-3 py-2 text-sm" style={{ borderColor: 'var(--border)' }} placeholder="Description"
          onChange={e => setForm({ ...form, description: e.target.value })} />
        <input className="border rounded-md px-3 py-2 text-sm" style={{ borderColor: 'var(--border)' }} placeholder="Category"
          onChange={e => setForm({ ...form, category: e.target.value })} />
        <select className="border rounded-md px-3 py-2 text-sm" style={{ borderColor: 'var(--border)' }}
          onChange={e => setForm({ ...form, difficulty: e.target.value })}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <button className="py-2 rounded-md text-sm font-medium text-white" style={{ background: 'var(--primary)' }}>Create</button>
      </form>
    </div>
  );
}