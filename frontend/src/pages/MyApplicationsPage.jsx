import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

const STATUS_LABEL = {
  APPLIED: 'Applied',
  SHORTLISTED: 'Shortlisted',
  REJECTED: 'Rejected',
  HIRED: 'Hired',
};

const STATUS_CLASS = {
  APPLIED: 'status-badge-applied',
  SHORTLISTED: 'status-badge-shortlisted',
  REJECTED: 'status-badge-rejected',
  HIRED: 'status-badge-hired',
};

function formatDate(dateString) {
  const date = new Date(dateString);
  if (!dateString || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyApplicationsPage() {
  const [status, setStatus] = useState('loading');
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get('/api/teachers/me/applications')
      .then((data) => {
        if (!cancelled) {
          setApplications(data ?? []);
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
      <h1 className="page-title">My applications</h1>
      <p className="page-lede">Track the roles you've applied to.</p>

      {status === 'loading' && <p className="tp-empty">Loading applications…</p>}
      {status === 'error' && <p className="tp-empty">We couldn't load your applications right now.</p>}
      {status === 'ready' && applications.length === 0 && (
        <p className="tp-empty">You haven't applied to any jobs yet.</p>
      )}

      {status === 'ready' && applications.length > 0 && (
        <ul className="jobs-mine-list">
          {applications.map((application) => (
            <li key={application.id}>
              <Link to={`/jobs/${application.jobId}`} className="jobs-mine-item">
                <div>
                  <p className="jobs-mine-title">{application.jobTitle}</p>
                  <p className="jobs-mine-meta">
                    {application.institutionName} · Applied {formatDate(application.appliedAt)}
                  </p>
                </div>
                <span className={`status-badge ${STATUS_CLASS[application.status]}`}>
                  {STATUS_LABEL[application.status] ?? application.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
