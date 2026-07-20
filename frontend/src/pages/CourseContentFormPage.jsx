import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, ApiError } from '../api/client';

const CONTENT_TYPES = ['VIDEO', 'PDF', 'TEXT'];

export default function CourseContentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('VIDEO');
  const [contentUrl, setContentUrl] = useState('');
  const [orderIndex, setOrderIndex] = useState('0');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiClient.post(`/api/courses/${id}/content`, {
        title,
        contentType,
        contentUrl,
        orderIndex: Number(orderIndex),
      });
      navigate(`/courses/${id}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <p className="page-eyebrow">New content</p>
      <h1 className="page-title">Add course content.</h1>
      <p className="page-lede">Students see content in order once the course is published.</p>

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
          <span className="field-label">Content type</span>
          <select className="field-select" value={contentType} onChange={(e) => setContentType(e.target.value)}>
            {CONTENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Content URL</span>
          <input
            type="text"
            className="field-input"
            value={contentUrl}
            onChange={(e) => setContentUrl(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Order</span>
          <input
            type="number"
            className="field-input"
            min="0"
            step="1"
            value={orderIndex}
            onChange={(e) => setOrderIndex(e.target.value)}
            required
          />
          <span className="field-hint">Lower numbers appear first.</span>
        </label>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add content'}
        </button>
      </form>
    </div>
  );
}
