import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, ApiError } from '../api/client';
import { useSubjects } from '../hooks/useSubjects';

export default function CourseFormPage() {
  const navigate = useNavigate();
  const subjects = useSubjects();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [price, setPrice] = useState('0');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const course = await apiClient.post('/api/courses', {
        title,
        description,
        subjectId: Number(subjectId),
        price: Number(price),
        thumbnailUrl: thumbnailUrl || null,
      });
      navigate(`/courses/${course.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <p className="page-eyebrow">New course</p>
      <h1 className="page-title">Share what you know.</h1>
      <p className="page-lede">Courses stay as drafts until you publish them from the course page.</p>

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
          <span className="field-label">Description</span>
          <textarea
            className="field-input field-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Subject</span>
          <select
            className="field-select"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a subject
            </option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Price (USD)</span>
          <input
            type="number"
            className="field-input"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <span className="field-hint">Use 0 for a free course.</span>
        </label>

        <label className="field">
          <span className="field-label">Thumbnail URL</span>
          <input
            type="text"
            className="field-input"
            placeholder="Optional"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
        </label>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create course'}
        </button>
      </form>
    </div>
  );
}
