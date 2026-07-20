import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiError } from '../api/client';

const CONNECTION_STATUS_LABEL = {
  ACCEPTED: 'Connected',
  PENDING: 'Awaiting response',
  REJECTED: 'Rejected',
};

const CONNECTION_STATUS_CLASS = {
  ACCEPTED: 'status-badge-hired',
  PENDING: 'status-badge-applied',
  REJECTED: 'status-badge-rejected',
};

function getInitials(fullName) {
  if (!fullName) return '?';
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function Avatar({ fullName }) {
  return (
    <span className="tp-avatar tp-avatar-sm" aria-hidden="true">
      {getInitials(fullName)}
    </span>
  );
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (!dateString || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ConnectionsPage() {
  const [status, setStatus] = useState('loading');
  const [pending, setPending] = useState([]);
  const [connections, setConnections] = useState([]);
  const [respondingId, setRespondingId] = useState(null);
  const [respondError, setRespondError] = useState('');

  function loadAll() {
    return Promise.all([
      apiClient.get('/api/connections/me/pending'),
      apiClient.get('/api/connections/me'),
    ]).then(([pendingData, connectionsData]) => {
      setPending(pendingData ?? []);
      setConnections(connectionsData ?? []);
    });
  }

  useEffect(() => {
    let cancelled = false;
    loadAll()
      .then(() => {
        if (!cancelled) setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRespond(connectionId, accept) {
    setRespondError('');
    setRespondingId(connectionId);
    try {
      await apiClient.put(`/api/connections/${connectionId}/respond`, { accept });
      await loadAll();
    } catch (err) {
      setRespondError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setRespondingId(null);
    }
  }

  const pendingIds = new Set(pending.map((p) => p.connectionId));
  const otherConnections = connections.filter((c) => !pendingIds.has(c.connectionId));

  return (
    <div className="page">
      <p className="page-eyebrow">Network</p>
      <h1 className="page-title">My network.</h1>
      <p className="page-lede">Teachers you're connected with, and requests waiting on you.</p>

      {status === 'loading' && <p className="tp-empty">Loading your network…</p>}
      {status === 'error' && <p className="tp-empty">We couldn't load your network right now.</p>}

      {status === 'ready' && (
        <>
          {respondError && (
            <div className="jobs-detail-actions">
              <div className="form-error">{respondError}</div>
            </div>
          )}

          <div className="jobs-detail-actions">
            <h2 className="tp-section-title">Pending requests</h2>
            {pending.length === 0 ? (
              <p className="tp-empty">No pending requests.</p>
            ) : (
              <ul className="jobs-mine-list">
                {pending.map((p) => (
                  <li key={p.connectionId}>
                    <div className="jobs-mine-item">
                      <div className="network-request-identity">
                        <Avatar fullName={p.otherTeacherName} />
                        <div>
                          <Link to={`/teachers/${p.otherTeacherId}`} className="jobs-mine-title">
                            {p.otherTeacherName}
                          </Link>
                          <p className="jobs-mine-meta">Requested {formatDate(p.createdAt)}</p>
                        </div>
                      </div>
                      <div className="network-request-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-small"
                          disabled={respondingId === p.connectionId}
                          onClick={() => handleRespond(p.connectionId, true)}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-small"
                          disabled={respondingId === p.connectionId}
                          onClick={() => handleRespond(p.connectionId, false)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="jobs-detail-actions">
            <h2 className="tp-section-title">Connections</h2>
            {otherConnections.length === 0 ? (
              <p className="tp-empty">No connections yet.</p>
            ) : (
              <ul className="jobs-mine-list">
                {otherConnections.map((c) => (
                  <li key={c.connectionId}>
                    <div className="jobs-mine-item">
                      <div className="network-request-identity">
                        <Avatar fullName={c.otherTeacherName} />
                        <div>
                          <Link to={`/teachers/${c.otherTeacherId}`} className="jobs-mine-title">
                            {c.otherTeacherName}
                          </Link>
                          <p className="jobs-mine-meta">
                            {c.status === 'ACCEPTED'
                              ? `Connected ${formatDate(c.respondedAt)}`
                              : `Requested ${formatDate(c.createdAt)}`}
                          </p>
                        </div>
                      </div>
                      <span className={`status-badge ${CONNECTION_STATUS_CLASS[c.status]}`}>
                        {CONNECTION_STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
