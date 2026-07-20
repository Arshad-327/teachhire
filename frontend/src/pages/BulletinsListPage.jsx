import { useEffect, useState } from 'react';

import { apiClient } from '../api/client';

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

function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export default function BulletinsListPage() {
  const [status, setStatus] = useState('loading');
  const [bulletins, setBulletins] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    const params = new URLSearchParams();
    if (categoryFilter) params.set('category', categoryFilter);
    params.set('page', String(page));

    apiClient
      .get(`/api/bulletins?${params.toString()}`, { auth: false })
      .then((data) => {
        if (cancelled) return;
        setBulletins(data.content ?? []);
        setTotalPages(data.totalPages ?? 0);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [categoryFilter, page]);

  function handleCategoryChange(e) {
    setPage(0);
    setCategoryFilter(e.target.value);
  }

  return (
    <div className="page">
      <p className="page-eyebrow">Bulletin</p>
      <h1 className="page-title">Notices from institutions.</h1>
      <p className="page-lede">Admissions calls and announcements from across the network.</p>

      <div className="jobs-filters">
        <label className="field jobs-filter-field">
          <span className="field-label">Category</span>
          <select className="field-select" value={categoryFilter} onChange={handleCategoryChange}>
            <option value="">All categories</option>
            <option value="ADMISSION">Admission</option>
            <option value="ANNOUNCEMENT">Announcement</option>
          </select>
        </label>
      </div>

      {status === 'loading' && <p className="tp-empty">Loading bulletins…</p>}
      {status === 'error' && <p className="tp-empty">We couldn't load bulletins right now.</p>}
      {status === 'ready' && bulletins.length === 0 && (
        <p className="tp-empty">No bulletins match this filter.</p>
      )}

      {status === 'ready' && bulletins.length > 0 && (
        <div className="jobs-grid">
          {bulletins.map((bulletin) => (
            <div key={bulletin.id} className="jobs-card">
              <p className="jobs-card-title">{bulletin.title}</p>
              <p className="jobs-card-institution">{bulletin.institutionName}</p>
              <div className="jobs-card-meta">
                <span className={`status-badge ${CATEGORY_CLASS[bulletin.category]}`}>
                  {CATEGORY_LABEL[bulletin.category] ?? bulletin.category}
                </span>
              </div>
              <p className="bulletin-card-preview">{truncate(bulletin.content, 150)}</p>
              <p className="jobs-card-date">
                Posted {formatDate(bulletin.postedAt)}
                {bulletin.validUntil && ` · Valid until ${formatDate(bulletin.validUntil)}`}
              </p>
            </div>
          ))}
        </div>
      )}

      {status === 'ready' && totalPages > 1 && (
        <div className="jobs-pagination">
          <button
            type="button"
            className="btn btn-outline btn-small"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </button>
          <span className="jobs-pagination-status">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-outline btn-small"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
