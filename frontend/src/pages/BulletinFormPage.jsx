import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, ApiError } from '../api/client';

export default function BulletinFormPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('ANNOUNCEMENT');
  const [validUntil, setValidUntil] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiClient.post('/api/bulletins', {
        title,
        content,
        category,
        validUntil: validUntil || null,
      });
      navigate('/bulletins', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <p className="page-eyebrow">Post a bulletin</p>
      <h1 className="page-title">Reach the network.</h1>
      <p className="page-lede">Admissions calls and announcements appear on the public bulletin feed.</p>

      <form className="auth-form jobs-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <label className="field">
          <span className="field-label">Title</span>
          <input
            type="text"
            className="field-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Content</span>
          <textarea
            className="field-input field-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Category</span>
          <select className="field-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="ANNOUNCEMENT">Announcement</option>
            <option value="ADMISSION">Admission</option>
          </select>
        </label>

        <label className="field">
          <span className="field-label">Valid until</span>
          <input
            type="date"
            className="field-input"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
          <span className="field-hint">Optional — leave blank if this notice doesn't expire.</span>
        </label>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Posting…' : 'Post bulletin'}
        </button>
      </form>
    </div>
  );
}
