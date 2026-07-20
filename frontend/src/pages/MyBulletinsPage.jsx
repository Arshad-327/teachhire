import { useEffect, useState } from 'react';
import { apiClient, ApiError } from '../api/client';

const CATEGORY_LABEL = {
  ADMISSION: 'Admission',
  ANNOUNCEMENT: 'Announcement',
};

const CATEGORY_CLASS = {
  ADMISSION: 'status-badge-admission',
  ANNOUNCEMENT: 'status-badge-announcement',
};

function formatDate(dateString) {
  const date = new Date(dateString);
  if (!dateString || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isExpired(validUntil) {
  if (!validUntil) return false;
  const today = new Date().toISOString().slice(0, 10);
  return validUntil < today;
}

export default function MyBulletinsPage() {
  const [status, setStatus] = useState('loading');
  const [bulletins, setBulletins] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get('/api/institutions/me/bulletins')
      .then((data) => {
        if (!cancelled) {
          setBulletins(data ?? []);
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

  async function handleDelete(bulletin) {
    if (!window.confirm(`Delete "${bulletin.title}"? This cannot be undone.`)) return;

    setDeleteError('');
    setDeletingId(bulletin.id);
    try {
      await apiClient.delete(`/api/bulletins/${bulletin.id}`);
      setBulletins((prev) => prev.filter((b) => b.id !== bulletin.id));
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page">
      <p className="page-eyebrow">Bulletin</p>
      <h1 className="page-title">My bulletins</h1>
      <p className="page-lede">Everything you've posted, including expired notices.</p>

      {deleteError && (
        <div className="jobs-detail-actions">
          <div className="form-error">{deleteError}</div>
        </div>
      )}

      {status === 'loading' && <p className="tp-empty">Loading bulletins…</p>}
      {status === 'error' && <p className="tp-empty">We couldn't load your bulletins right now.</p>}
      {status === 'ready' && bulletins.length === 0 && (
        <p className="tp-empty">You haven't posted any bulletins yet.</p>
      )}

      {status === 'ready' && bulletins.length > 0 && (
        <ul className="jobs-mine-list">
          {bulletins.map((bulletin) => {
            const expired = isExpired(bulletin.validUntil);
            return (
              <li key={bulletin.id}>
                <div className={`jobs-mine-item${expired ? ' bulletin-item-expired' : ''}`}>
                  <div>
                    <p className="jobs-mine-title">{bulletin.title}</p>
                    <p className="jobs-mine-meta">
                      Posted {formatDate(bulletin.postedAt)}
                      {bulletin.validUntil &&
                        ` · ${expired ? 'Expired' : 'Valid until'} ${formatDate(bulletin.validUntil)}`}
                    </p>
                  </div>
                  <div className="bulletin-item-meta">
                    <span className={`status-badge ${CATEGORY_CLASS[bulletin.category]}`}>
                      {CATEGORY_LABEL[bulletin.category] ?? bulletin.category}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      disabled={deletingId === bulletin.id}
                      onClick={() => handleDelete(bulletin)}
                    >
                      {deletingId === bulletin.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
