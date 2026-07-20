import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useSubjects } from '../hooks/useSubjects';

function formatPrice(price) {
  const value = Number(price);
  if (!value) return 'Free';
  return `$${value.toFixed(2)}`;
}

export default function CoursesListPage() {
  const subjects = useSubjects();
  const [status, setStatus] = useState('loading');
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [priceMaxFilter, setPriceMaxFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    const params = new URLSearchParams();
    if (subjectFilter) params.set('subject', subjectFilter);
    if (priceMaxFilter) params.set('priceMax', priceMaxFilter);
    params.set('page', String(page));

    apiClient
      .get(`/api/courses?${params.toString()}`, { auth: false })
      .then((data) => {
        if (cancelled) return;
        setCourses(data.content ?? []);
        setTotalPages(data.totalPages ?? 0);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [subjectFilter, priceMaxFilter, page]);

  function handleSubjectChange(e) {
    setPage(0);
    setSubjectFilter(e.target.value);
  }

  function handlePriceMaxChange(e) {
    setPage(0);
    setPriceMaxFilter(e.target.value);
  }

  return (
    <div className="page">
      <p className="page-eyebrow">Learn</p>
      <h1 className="page-title">Browse courses.</h1>
      <p className="page-lede">Lessons built by teachers across the network.</p>

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

        <label className="field jobs-filter-field course-price-field">
          <span className="field-label">Max price</span>
          <input
            type="number"
            className="field-input"
            min="0"
            step="0.01"
            placeholder="No max"
            value={priceMaxFilter}
            onChange={handlePriceMaxChange}
          />
        </label>
      </div>

      {status === 'loading' && <p className="tp-empty">Loading courses…</p>}
      {status === 'error' && <p className="tp-empty">We couldn't load courses right now.</p>}
      {status === 'ready' && courses.length === 0 && (
        <p className="tp-empty">No courses match these filters.</p>
      )}

      {status === 'ready' && courses.length > 0 && (
        <div className="tp-course-grid">
          {courses.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="tp-course-card">
              <div className="tp-course-thumb">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt="" />
                ) : (
                  <span className="tp-course-thumb-placeholder" aria-hidden="true">
                    {course.title?.[0]?.toUpperCase() ?? '?'}
                  </span>
                )}
              </div>
              <div className="tp-course-body">
                <p className="tp-course-title">{course.title}</p>
                <p className="jobs-card-institution">{course.teacherName}</p>
                <div className="jobs-card-meta">
                  <span className="tp-subject-chip">{course.subjectName}</span>
                </div>
                <p className="tp-course-price">{formatPrice(course.price)}</p>
              </div>
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
