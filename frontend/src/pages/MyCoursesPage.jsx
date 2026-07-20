import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

function formatPrice(price) {
  const value = Number(price);
  if (!value) return 'Free';
  return `$${value.toFixed(2)}`;
}

export default function MyCoursesPage() {
  const [status, setStatus] = useState('loading');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get('/api/teachers/me/courses')
      .then((data) => {
        if (!cancelled) {
          setCourses(data ?? []);
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
      <p className="page-eyebrow">Learn</p>
      <h1 className="page-title">My courses</h1>
      <p className="page-lede">Courses you've built, published and drafts alike.</p>

      <div className="jobs-detail-actions course-owner-actions">
        <Link className="btn btn-primary btn-small" to="/courses/new">
          + New course
        </Link>
      </div>

      {status === 'loading' && <p className="tp-empty">Loading courses…</p>}
      {status === 'error' && <p className="tp-empty">We couldn't load your courses right now.</p>}
      {status === 'ready' && courses.length === 0 && (
        <p className="tp-empty">You haven't created any courses yet.</p>
      )}

      {status === 'ready' && courses.length > 0 && (
        <ul className="jobs-mine-list">
          {courses.map((course) => (
            <li key={course.id}>
              <Link to={`/courses/${course.id}`} className="jobs-mine-item">
                <div>
                  <p className="jobs-mine-title">{course.title}</p>
                  <p className="jobs-mine-meta">
                    {course.subjectName} · {formatPrice(course.price)}
                  </p>
                </div>
                <span
                  className={`jobs-status-chip ${course.published ? 'jobs-status-open' : 'jobs-status-closed'}`}
                >
                  {course.published ? 'Published' : 'Draft'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
