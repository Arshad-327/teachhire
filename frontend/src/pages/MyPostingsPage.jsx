import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

function formatDate(dateString) {
  const date = new Date(dateString);
  if (!dateString || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyPostingsPage() {
  const [status, setStatus] = useState('loading');
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get('/api/institutions/me/jobs')
      .then((data) => {
        if (!cancelled) {
          setJobs(data ?? []);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <p className="page-eyebrow">Hire</p>
      <h1 className="page-title">My postings</h1>
      <p className="page-lede">Roles you've listed on TeachHire.</p>

      {status === 'loading' && <p className="tp-empty">Loading postings…</p>}
      {status === 'error' && <p className="tp-empty">We couldn't load your postings right now.</p>}
      {status === 'ready' && jobs.length === 0 && (
        <p className="tp-empty">You haven't posted any jobs yet.</p>
      )}

      {status === 'ready' && jobs.length > 0 && (
        <ul className="jobs-mine-list">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link to={`/jobs/${job.id}`} className="jobs-mine-item">
                <div>
                  <p className="jobs-mine-title">{job.title}</p>
                  <p className="jobs-mine-meta">
                    {job.subjectName} · Posted {formatDate(job.postedAt)}
                  </p>
                </div>
                <span
                  className={`jobs-status-chip ${job.status === 'OPEN' ? 'jobs-status-open' : 'jobs-status-closed'}`}
                >
                  {job.status === 'OPEN' ? 'Open' : 'Closed'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
