import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClient, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOwnTeacherProfileId } from '../hooks/useOwnTeacherProfileId';

function getInitials(fullName) {
  if (!fullName) return '?';
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function formatMonthYear(dateString) {
  const date = new Date(dateString);
  if (!dateString || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatPrice(price) {
  const value = Number(price);
  if (!value) return 'Free';
  return `$${value.toFixed(2)}`;
}

function Avatar({ avatarUrl, fullName, size }) {
  if (avatarUrl) {
    return <img className={`tp-avatar tp-avatar-${size}`} src={avatarUrl} alt={fullName} />;
  }
  return (
    <span className={`tp-avatar tp-avatar-${size}`} aria-hidden="true">
      {getInitials(fullName)}
    </span>
  );
}

function RatingDisplay({ ratingAvg, ratingCount }) {
  if (!ratingCount) {
    return <span className="tp-rating tp-rating-empty">No ratings yet</span>;
  }
  const rounded = Math.round(ratingAvg ?? 0);
  return (
    <span className="tp-rating">
      <span className="tp-rating-stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < rounded ? 'tp-star tp-star-filled' : 'tp-star'}>
            ★
          </span>
        ))}
      </span>
      <span className="tp-rating-value">{ratingAvg?.toFixed(1)}</span>
      <span className="tp-rating-count">
        ({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'})
      </span>
    </span>
  );
}

export default function TeacherProfilePage() {
  const { id } = useParams();
  const { isAuthenticated, role } = useAuth();
  const ownTeacherProfileId = useOwnTeacherProfileId(role);
  const [status, setStatus] = useState('loading');
  const [profile, setProfile] = useState(null);

  const isOwnProfile = role === 'TEACHER' && ownTeacherProfileId != null && ownTeacherProfileId === Number(id);
  const showConnect = isAuthenticated && role === 'TEACHER' && status === 'ready' && !isOwnProfile;

  const [connectStatus, setConnectStatus] = useState('checking');
  const [connectSubmitting, setConnectSubmitting] = useState(false);
  const [connectError, setConnectError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setProfile(null);

    apiClient
      .get(`/api/teachers/${id}/profile`, { auth: false })
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
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

  function checkConnectionStatus() {
    return apiClient.get('/api/connections/me').then((data) => {
      const existing = (data ?? []).find((c) => c.otherTeacherId === Number(id));
      if (existing?.status === 'ACCEPTED') return 'accepted';
      if (existing?.status === 'PENDING') return 'pending';
      return 'none';
    });
  }

  useEffect(() => {
    if (!showConnect) return;
    let cancelled = false;
    setConnectStatus('checking');

    checkConnectionStatus()
      .then((next) => {
        if (!cancelled) setConnectStatus(next);
      })
      .catch(() => {
        if (!cancelled) setConnectStatus('none');
      });

    return () => {
      cancelled = true;
    };
  }, [showConnect, id]);

  async function handleConnect() {
    setConnectError('');
    setConnectSubmitting(true);
    try {
      await apiClient.post(`/api/connections/request/${id}`);
      setConnectStatus('sent');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // The API's 409 body carries no structured status, so re-check which
        // side of the conflict we're on (already accepted vs already pending).
        try {
          setConnectStatus(await checkConnectionStatus());
        } catch {
          setConnectStatus('accepted');
        }
      } else {
        setConnectError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      }
    } finally {
      setConnectSubmitting(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="page tp-state">
        <p className="page-eyebrow">Teacher profile</p>
        <p className="page-lede">Loading profile…</p>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className="page tp-state">
        <p className="page-eyebrow">Teacher profile</p>
        <h1 className="page-title">We couldn't find this teacher.</h1>
        <p className="page-lede">This profile may have been removed, or the link may be incorrect.</p>
        <Link className="btn btn-outline" to="/">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="page tp-state">
        <p className="page-eyebrow">Teacher profile</p>
        <h1 className="page-title">Something went wrong.</h1>
        <p className="page-lede">We couldn't load this profile right now. Please try again shortly.</p>
      </div>
    );
  }

  const {
    fullName,
    headline,
    bio,
    avatarUrl,
    yearsExperience,
    ratingAvg,
    ratingCount,
    subjects = [],
    jobHistory = [],
    acceptedConnectionCount = 0,
    connectionPreviews = [],
    courses = [],
  } = profile;

  return (
    <div className="tp">
      <header className="tp-masthead">
        <div className="tp-masthead-inner">
          <div className="tp-masthead-top">
            <Avatar avatarUrl={avatarUrl} fullName={fullName} size="xl" />
            <div className="tp-identity">
              <p className="page-eyebrow">Teacher profile</p>
              <h1 className="tp-name">{fullName}</h1>
              {headline && <p className="tp-headline">{headline}</p>}
              <div className="tp-meta-row">
                {typeof yearsExperience === 'number' && (
                  <span className="tp-meta-item">
                    {yearsExperience} {yearsExperience === 1 ? 'year' : 'years'} experience
                  </span>
                )}
                <RatingDisplay ratingAvg={ratingAvg} ratingCount={ratingCount} />
              </div>
              {subjects.length > 0 && (
                <ul className="tp-subjects">
                  {subjects.map((subject) => (
                    <li key={subject.id} className="tp-subject-chip">
                      {subject.name}
                    </li>
                  ))}
                </ul>
              )}
              {showConnect && (
                <div className="jobs-detail-actions">
                  {connectStatus === 'none' && (
                    <>
                      {connectError && <div className="form-error">{connectError}</div>}
                      <button
                        type="button"
                        className="btn btn-primary btn-small"
                        disabled={connectSubmitting}
                        onClick={handleConnect}
                      >
                        {connectSubmitting ? 'Sending…' : 'Connect'}
                      </button>
                    </>
                  )}
                  {connectStatus === 'sent' && <p className="jobs-apply-note">Request sent.</p>}
                  {connectStatus === 'pending' && <p className="jobs-apply-note">Request pending.</p>}
                  {connectStatus === 'accepted' && <p className="jobs-apply-note">Already connected.</p>}
                </div>
              )}
            </div>
          </div>
          {bio && <p className="tp-bio">{bio}</p>}
        </div>
      </header>

      <section className="tp-section">
        <h2 className="tp-section-title">
          <span className="tp-section-index">01</span>Experience
        </h2>
        {jobHistory.length === 0 ? (
          <p className="tp-empty">No job history yet.</p>
        ) : (
          <ol className="tp-timeline">
            {jobHistory.map((job, index) => (
              <li key={`${job.institutionName}-${index}`} className="tp-timeline-item">
                <span className="tp-timeline-dot" aria-hidden="true" />
                <p className="tp-timeline-role">{job.jobTitle}</p>
                <p className="tp-timeline-institution">{job.institutionName}</p>
                <p className="tp-timeline-date">{formatMonthYear(job.hiredAt)}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="tp-section">
        <h2 className="tp-section-title">
          <span className="tp-section-index">02</span>Courses
        </h2>
        {courses.length === 0 ? (
          <p className="tp-empty">Hasn't published any courses yet.</p>
        ) : (
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
                  <p className="tp-course-price">{formatPrice(course.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="tp-section">
        <h2 className="tp-section-title">
          <span className="tp-section-index">03</span>Network
        </h2>
        <div className="tp-network-row">
          <div className="tp-network-count">
            <span className="tp-network-number">{acceptedConnectionCount}</span>
            <span className="tp-network-label">
              {acceptedConnectionCount === 1 ? 'connection' : 'connections'}
            </span>
          </div>
          {connectionPreviews.length > 0 && (
            <div className="tp-network-avatars">
              {connectionPreviews.slice(0, 5).map((connection) => (
                <Link
                  key={connection.teacherId}
                  to={`/teachers/${connection.teacherId}`}
                  className="tp-network-avatar-link"
                  title={connection.fullName}
                >
                  <Avatar avatarUrl={connection.avatarUrl} fullName={connection.fullName} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
