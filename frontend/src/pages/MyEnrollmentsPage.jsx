import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

const PAYMENT_STATUS_LABEL = {
  FREE: 'Free',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
};

const PAYMENT_STATUS_CLASS = {
  FREE: 'status-badge-free',
  PAID: 'status-badge-paid',
  REFUNDED: 'status-badge-rejected',
};

function formatDate(dateString) {
  const date = new Date(dateString);
  if (!dateString || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyEnrollmentsPage() {
  const [status, setStatus] = useState('loading');
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get('/api/students/me/enrollments')
      .then((data) => {
        if (!cancelled) {
          setEnrollments(data ?? []);
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
      <h1 className="page-title">My enrollments</h1>
      <p className="page-lede">Courses you've enrolled in.</p>

      {status === 'loading' && <p className="tp-empty">Loading enrollments…</p>}
      {status === 'error' && <p className="tp-empty">We couldn't load your enrollments right now.</p>}
      {status === 'ready' && enrollments.length === 0 && (
        <p className="tp-empty">You haven't enrolled in any courses yet.</p>
      )}

      {status === 'ready' && enrollments.length > 0 && (
        <ul className="jobs-mine-list">
          {enrollments.map((enrollment) => (
            <li key={enrollment.id}>
              <Link to={`/courses/${enrollment.courseId}`} className="jobs-mine-item">
                <div>
                  <p className="jobs-mine-title">{enrollment.courseTitle}</p>
                  <p className="jobs-mine-meta">
                    {enrollment.teacherName} · Enrolled {formatDate(enrollment.enrolledAt)}
                  </p>
                </div>
                <span className={`status-badge ${PAYMENT_STATUS_CLASS[enrollment.paymentStatus]}`}>
                  {PAYMENT_STATUS_LABEL[enrollment.paymentStatus] ?? enrollment.paymentStatus}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
