import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, ApiError } from '../api/client';
import { useSubjects } from '../hooks/useSubjects';

export default function JobFormPage() {
  const navigate = useNavigate();
  const subjects = useSubjects();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const job = await apiClient.post('/api/jobs', {
        title,
        description,
        subjectId: Number(subjectId),
        salaryRange: salaryRange || null,
      });
      navigate(`/jobs/${job.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <p className="page-eyebrow">Post a job</p>
      <h1 className="page-title">Find your next teacher.</h1>
      <p className="page-lede">Share the role details — teachers browsing open postings will see this listing.</p>

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
          <span className="field-label">Salary range</span>
          <input
            type="text"
            className="field-input"
            placeholder="e.g. $45,000 – $55,000"
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
          />
        </label>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Posting…' : 'Post job'}
        </button>
      </form>
    </div>
  );
}
