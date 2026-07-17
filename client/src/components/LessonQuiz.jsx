import { useEffect, useState } from 'react';
import api from '../api/axios';

function QuizBuilder({ lessonId, onCreated }) {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', ''], correctOption: 0 },
  ]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateQuestion = (qIndex, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === qIndex ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIndex, oIndex, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const options = [...q.options];
      options[oIndex] = value;
      return { ...q, options };
    }));
  };

  const addOption = (qIndex) => {
    setQuestions(prev => prev.map((q, i) => i === qIndex ? { ...q, options: [...q.options, ''] } : q));
  };

  const removeOption = (qIndex, oIndex) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const options = q.options.filter((_, idx) => idx !== oIndex);
      const correctOption = q.correctOption >= options.length ? 0 : q.correctOption;
      return { ...q, options, correctOption };
    }));
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, { questionText: '', options: ['', ''], correctOption: 0 }]);
  };

  const removeQuestion = (qIndex) => {
    setQuestions(prev => prev.filter((_, i) => i !== qIndex));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    for (const q of questions) {
      if (!q.questionText.trim() || q.options.some(o => !o.trim())) {
        setError('Fill in all question and option fields');
        return;
      }
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/lessons/${lessonId}/quiz`, { title, questions });
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
      <p className="text-sm font-semibold">Add a quiz to this lesson</p>
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}

      <input
        className="border rounded-md px-3 py-2 text-sm"
        style={{ borderColor: 'var(--border)' }}
        placeholder="Quiz title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="rounded-md border p-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>Question {qIndex + 1}</span>
            {questions.length > 1 && (
              <button type="button" onClick={() => removeQuestion(qIndex)} className="text-xs" style={{ color: 'var(--danger)' }}>
                Remove question
              </button>
            )}
          </div>
          <input
            className="border rounded-md px-3 py-2 text-sm w-full mb-2"
            style={{ borderColor: 'var(--border)' }}
            placeholder="Question text"
            value={q.questionText}
            onChange={e => updateQuestion(qIndex, 'questionText', e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            {q.options.map((opt, oIndex) => (
              <div key={oIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={q.correctOption === oIndex}
                  onChange={() => updateQuestion(qIndex, 'correctOption', oIndex)}
                />
                <input
                  className="border rounded-md px-2 py-1.5 text-sm flex-1"
                  style={{ borderColor: 'var(--border)' }}
                  placeholder={`Option ${oIndex + 1}`}
                  value={opt}
                  onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                  required
                />
                {q.options.length > 2 && (
                  <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="text-xs" style={{ color: 'var(--danger)' }}>✕</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => addOption(qIndex)} className="text-xs mt-2 font-medium" style={{ color: 'var(--primary)' }}>
            + Add option
          </button>
        </div>
      ))}

      <button type="button" onClick={addQuestion} className="text-xs font-medium self-start" style={{ color: 'var(--primary)' }}>
        + Add question
      </button>

      <button disabled={submitting} className="py-2 rounded-md text-sm font-medium text-white" style={{ background: 'var(--primary)' }}>
        {submitting ? 'Saving...' : 'Save quiz'}
      </button>
    </form>
  );
}

function QuizTaker({ quiz, onSubmitted }) {
  const [answers, setAnswers] = useState(Array(quiz.questions.length).fill(null));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (answers.some(a => a === null)) {
      setError('Answer all questions before submitting');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/quiz/${quiz._id}/submit`, { answers });
      onSubmitted(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
      <p className="text-sm font-semibold">{quiz.title}</p>
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
      {quiz.questions.map((q, qIndex) => (
        <div key={qIndex}>
          <p className="text-sm font-medium mb-1.5">{qIndex + 1}. {q.questionText}</p>
          <div className="flex flex-col gap-1">
            {q.options.map((opt, oIndex) => (
              <label key={oIndex} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`answer-${qIndex}`}
                  checked={answers[qIndex] === oIndex}
                  onChange={() => setAnswers(prev => prev.map((a, i) => i === qIndex ? oIndex : a))}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button disabled={submitting} className="py-2 rounded-md text-sm font-medium text-white self-start px-4" style={{ background: 'var(--primary)' }}>
        {submitting ? 'Submitting...' : 'Submit quiz'}
      </button>
    </form>
  );
}

export default function LessonQuiz({ lessonId, isOwner, isStudent, isEnrolled }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.get(`/lessons/${lessonId}/quiz`);
    setQuiz(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [lessonId]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this quiz? All student attempts will be lost.')) return;
    await api.delete(`/quiz/${quiz._id}`);
    setQuiz(null);
  };

  if (loading) return null;

  // Teacher/owner view
  if (isOwner) {
    if (!quiz) {
      return showBuilder
        ? <QuizBuilder lessonId={lessonId} onCreated={(q) => { setQuiz(q); setShowBuilder(false); }} />
        : (
          <button onClick={() => setShowBuilder(true)} className="text-xs font-medium mt-3" style={{ color: 'var(--primary)' }}>
            + Add quiz to this lesson
          </button>
        );
    }
    return (
      <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium">📝 Quiz: {quiz.title} ({quiz.questions.length} questions)</p>
          <button onClick={handleDelete} className="text-xs font-medium" style={{ color: 'var(--danger)' }}>Delete quiz</button>
        </div>
      </div>
    );
  }

  // Student view
  if (isStudent) {
    if (!quiz) return null;
    if (!isEnrolled) {
      return <p className="text-xs mt-3" style={{ color: 'var(--ink-muted)' }}>Enroll in this course to take the quiz for this lesson.</p>;
    }
    if (quiz.attempt) {
      return (
        <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm font-medium">📝 {quiz.title}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--primary)' }}>
            Your score: {quiz.attempt.score} / {quiz.attempt.total}
          </p>
        </div>
      );
    }
    return <QuizTaker quiz={quiz} onSubmitted={(attempt) => setQuiz(prev => ({ ...prev, attempt }))} />;
  }

  return null;
}