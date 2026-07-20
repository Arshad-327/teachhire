import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useSubjects } from '../hooks/useSubjects';

function formatDate(dateString) {
  const date = new Date(dateString);
  if (!dateString || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function JobsListPage() {
  const subjects = useSubjects();
  const [status, setStatus] = useState('loading');
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('OPEN');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    const params = new URLSearchParams();
    if (subjectFilter) params.set('subject', subjectFilter);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    params.set('page', String(page));

    apiClient
      .get(`/api/jobs?${params.toString()}`, { auth: false })
      .then((data) => {
        if (cancelled) return;
        setJobs(data.content ?? []);
        setTotalPages(data.totalPages ?? 0);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [subjectFilter, statusFilter, page]);

  function handleSubjectChange(e) {
    setPage(0);
    setSubjectFilter(e.target.value);
  }

  function handleStatusToggle(nextStatus) {
    setPage(0);
    setStatusFilter(nextStatus);
  }

  return (
    <div className="page">
      <p className="page-eyebrow">Hire</p>
      <h1 className="page-title">Browse open teaching roles.</h1>
      <p className="page-lede">Postings from institutions across the network.</p>

      <div className="jobs-filters">
        <label className="field jobs-filter-field">
          <span className="field-label">Subject</span>
          <select className="field-select" value={subjectFilter} onChange={handleSubjectChange}>
            <option value="">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>

        <div className="jobs-status-toggle" role="group" aria-label="Filter by status">
          <button
            type="button"
            className={`jobs-toggle-btn${statusFilter === 'OPEN' ? ' jobs-toggle-btn-active' : ''}`}
            onClick={() => handleStatusToggle('OPEN')}
          >
            Open only
          </button>
          <button
            type="button"
            className={`jobs-toggle-btn${statusFilter === 'ALL' ? ' jobs-toggle-btn-active' : ''}`}
            onClick={() => handleStatusToggle('ALL')}
          >
            All
          </button>
        </div>
      </div>

      {status === 'loading' && <p className="tp-empty">Loading postings…</p>}
      {status === 'error' && <p className="tp-empty">We couldn't load job postings right now.</p>}
      {status === 'ready' && jobs.length === 0 && (
        <p className="tp-empty">No postings match these filters.</p>
      )}

      {status === 'ready' && jobs.length > 0 && (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="jobs-card">
              <p className="jobs-card-title">{job.title}</p>
              <p className="jobs-card-institution">{job.institutionName}</p>
              <div className="jobs-card-meta">
                <span className="tp-subject-chip">{job.subjectName}</span>
                {job.salaryRange && <span className="jobs-card-salary">{job.salaryRange}</span>}
              </div>
              <p className="jobs-card-date">Posted {formatDate(job.postedAt)}</p>
            </Link>
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
