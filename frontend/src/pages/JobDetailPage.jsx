import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClient, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

function formatDate(dateString) {
  const date = new Date(dateString);
  if (!dateString || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function JobDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, role } = useAuth();

  const [status, setStatus] = useState('loading');
  const [job, setJob] = useState(null);
  const [applyState, setApplyState] = useState('idle');
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setJob(null);
    setApplyState('idle');
    setApplyError('');

    apiClient
      .get(`/api/jobs/${id}`, { auth: false })
      .then((data) => {
        if (cancelled) return;
        setJob(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err instanceof ApiError && err.status === 404 ? 'notfound' : 'error');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleApply() {
    setApplyError('');
    setApplyState('submitting');
    try {
      await apiClient.post(`/api/jobs/${id}/apply`);
      setApplyState('applied');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setApplyState('already');
      } else {
        setApplyState('idle');
        setApplyError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      }
    }
  }

  if (status === 'loading') {
    return (
      <div className="page tp-state">
        <p className="page-eyebrow">Job posting</p>
        <p className="page-lede">Loading posting…</p>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className="page tp-state">
        <p className="page-eyebrow">Job posting</p>
        <h1 className="page-title">We couldn't find this posting.</h1>
        <p className="page-lede">It may have been closed or removed.</p>
        <Link className="btn btn-outline" to="/jobs">
          Back to listings
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="page tp-state">
        <p className="page-eyebrow">Job posting</p>
        <h1 className="page-title">Something went wrong.</h1>
        <p className="page-lede">We couldn't load this posting right now. Please try again shortly.</p>
      </div>
    );
  }

  const { title, institutionName, subjectName, salaryRange, description, postedAt, status: jobStatus } = job;

  return (
    <div className="page">
      <p className="page-eyebrow">Job posting</p>
      <h1 className="page-title">{title}</h1>

      <div className="jobs-detail-meta">
        <span className="jobs-detail-institution">{institutionName}</span>
        <span className="tp-subject-chip">{subjectName}</span>
        {jobStatus === 'CLOSED' && <span className="jobs-status-chip jobs-status-closed">Closed</span>}
      </div>

      <div className="jobs-detail-facts">
        {salaryRange && (
          <div className="jobs-detail-fact">
            <span className="field-label">Salary range</span>
            <span className="jobs-detail-fact-value">{salaryRange}</span>
          </div>
        )}
        <div className="jobs-detail-fact">
          <span className="field-label">Posted</span>
          <span className="jobs-detail-fact-value">{formatDate(postedAt)}</span>
        </div>
      </div>

      <p className="jobs-detail-description">{description}</p>

      <div className="jobs-detail-actions">
        {role === 'TEACHER' && (
          <>
            {applyError && <div className="form-error">{applyError}</div>}
            {applyState === 'already' ? (
              <p className="jobs-apply-note">You've already applied</p>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={applyState === 'submitting' || applyState === 'applied'}
                onClick={handleApply}
              >
                {applyState === 'applied' ? 'Applied ✓' : applyState === 'submitting' ? 'Applying…' : 'Apply'}
              </button>
            )}
          </>
        )}

        {!isAuthenticated && (
          <p className="jobs-apply-note">
            <Link to="/login" state={{ from: { pathname: `/jobs/${id}` } }}>
              Log in
            </Link>{' '}
            to apply.
          </p>
        )}
      </div>
    </div>
  );
}
