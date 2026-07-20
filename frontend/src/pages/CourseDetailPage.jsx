import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClient, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOwnTeacherProfileId } from '../hooks/useOwnTeacherProfileId';

const CONTENT_TYPE_LABEL = {
  VIDEO: 'Video',
  PDF: 'PDF',
  TEXT: 'Text',
};

const CONTENT_TYPE_CLASS = {
  VIDEO: 'status-badge-video',
  PDF: 'status-badge-pdf',
  TEXT: 'status-badge-text',
};

function formatDate(dateString) {
  const date = new Date(dateString);
  if (!dateString || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatPrice(price) {
  const value = Number(price);
  if (!value) return 'Free';
  return `$${value.toFixed(2)}`;
}

function Stars({ rating }) {
  const rounded = Math.round(rating ?? 0);
  return (
    <span className="tp-rating-stars" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rounded ? 'tp-star tp-star-filled' : 'tp-star'}>
          ★
        </span>
      ))}
    </span>
  );
}

function RatingSummary({ averageRating, reviewCount }) {
  if (!reviewCount) {
    return <span className="tp-rating tp-rating-empty">No ratings yet</span>;
  }
  return (
    <span className="tp-rating">
      <Stars rating={averageRating} />
      <span className="tp-rating-value">{averageRating?.toFixed(1)}</span>
      <span className="tp-rating-count">
        ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
      </span>
    </span>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, role } = useAuth();

  const [status, setStatus] = useState('loading');
  const [course, setCourse] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const ownTeacherProfileId = useOwnTeacherProfileId(role);

  const [enrollmentStatus, setEnrollmentStatus] = useState('unknown');
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [enrollNote, setEnrollNote] = useState('');

  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewState, setReviewState] = useState('idle');
  const [reviewError, setReviewError] = useState('');

  const [publishSubmitting, setPublishSubmitting] = useState(false);
  const [publishError, setPublishError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setCourse(null);

    apiClient
      .get(`/api/courses/${id}`)
      .then((data) => {
        if (cancelled) return;
        setCourse(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setStatus('notfound');
        else if (err instanceof ApiError && err.status === 403) setStatus('forbidden');
        else setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get(`/api/courses/${id}/reviews`, { auth: false })
      .then((data) => {
        if (cancelled) return;
        setReviews(data.reviews ?? []);
        setAverageRating(data.averageRating ?? 0);
        setReviewCount(data.reviewCount ?? 0);
      })
      .catch(() => {
        // reviews are supplementary — leave the list empty on failure
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (role !== 'STUDENT' || !course) return;
    let cancelled = false;

    apiClient
      .get('/api/students/me/enrollments')
      .then((data) => {
        if (cancelled) return;
        const enrolled = (data ?? []).some((e) => e.courseId === course.id);
        setEnrollmentStatus(enrolled ? 'enrolled' : 'not-enrolled');
      })
      .catch(() => {
        if (!cancelled) setEnrollmentStatus('not-enrolled');
      });

    return () => {
      cancelled = true;
    };
  }, [role, course]);

  async function handleEnroll() {
    setEnrollError('');
    setEnrollSubmitting(true);
    try {
      await apiClient.post(`/api/courses/${id}/enroll`);
      setEnrollNote("You're enrolled.");
      setEnrollmentStatus('enrolled');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setEnrollNote('Already enrolled.');
        setEnrollmentStatus('enrolled');
      } else {
        setEnrollError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      }
    } finally {
      setEnrollSubmitting(false);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setReviewError('');
    setReviewSubmitting(true);
    try {
      await apiClient.post(`/api/courses/${id}/review`, {
        rating: Number(reviewRating),
        comment: reviewComment || null,
      });
      setReviewState('submitted');
      apiClient
        .get(`/api/courses/${id}/reviews`, { auth: false })
        .then((data) => {
          setReviews(data.reviews ?? []);
          setAverageRating(data.averageRating ?? 0);
          setReviewCount(data.reviewCount ?? 0);
        })
        .catch(() => {});
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setReviewState('already');
      } else if (err instanceof ApiError && err.status === 403) {
        setReviewError('You must be enrolled in this course to review it.');
      } else {
        setReviewError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      }
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function handlePublish() {
    setPublishError('');
    setPublishSubmitting(true);
    try {
      const updated = await apiClient.put(`/api/courses/${id}/publish`);
      setCourse(updated);
    } catch (err) {
      setPublishError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setPublishSubmitting(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="page tp-state">
        <p className="page-eyebrow">Learn</p>
        <p className="page-lede">Loading course…</p>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className="page tp-state">
        <p className="page-eyebrow">Learn</p>
        <h1 className="page-title">We couldn't find this course.</h1>
        <p className="page-lede">It may have been removed, or the link may be incorrect.</p>
        <Link className="btn btn-outline" to="/courses">
          Back to courses
        </Link>
      </div>
    );
  }

  if (status === 'forbidden') {
    return (
      <div className="page tp-state">
        <p className="page-eyebrow">Learn</p>
        <h1 className="page-title">This course isn't available.</h1>
        <p className="page-lede">It hasn't been published by its teacher yet.</p>
        <Link className="btn btn-outline" to="/courses">
          Back to courses
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="page tp-state">
        <p className="page-eyebrow">Learn</p>
        <h1 className="page-title">Something went wrong.</h1>
        <p className="page-lede">We couldn't load this course right now. Please try again shortly.</p>
      </div>
    );
  }

  const { title, teacherId, teacherName, subjectName, price, description, createdAt, published, contents = [] } = course;
  const isOwner = role === 'TEACHER' && ownTeacherProfileId != null && ownTeacherProfileId === teacherId;

  return (
    <div className="page">
      <p className="page-eyebrow">Learn</p>
      <h1 className="page-title">{title}</h1>

      <div className="jobs-detail-meta">
        <Link to={`/teachers/${teacherId}`} className="jobs-detail-institution">
          {teacherName}
        </Link>
        <span className="tp-subject-chip">{subjectName}</span>
        {!published && <span className="jobs-status-chip jobs-status-closed">Draft</span>}
      </div>

      <div className="jobs-detail-facts">
        <div className="jobs-detail-fact">
          <span className="field-label">Price</span>
          <span className="jobs-detail-fact-value">{formatPrice(price)}</span>
        </div>
        <div className="jobs-detail-fact">
          <span className="field-label">Created</span>
          <span className="jobs-detail-fact-value">{formatDate(createdAt)}</span>
        </div>
      </div>

      <p className="jobs-detail-description">{description}</p>

      <div className="jobs-detail-actions">
        <h2 className="tp-section-title">Course content</h2>
        {contents.length === 0 ? (
          <p className="tp-empty">No content added yet.</p>
        ) : (
          <ul className="jobs-mine-list">
            {contents.map((item) => (
              <li key={item.id}>
                <div className="jobs-mine-item">
                  <p className="jobs-mine-title">{item.title}</p>
                  <span className={`status-badge ${CONTENT_TYPE_CLASS[item.contentType]}`}>
                    {CONTENT_TYPE_LABEL[item.contentType] ?? item.contentType}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="jobs-detail-actions">
        <h2 className="tp-section-title">Reviews</h2>
        <RatingSummary averageRating={averageRating} reviewCount={reviewCount} />
        {reviews.length === 0 ? (
          <p className="tp-empty" style={{ marginTop: '1rem' }}>
            No reviews yet.
          </p>
        ) : (
          <ul className="review-list">
            {reviews.map((review) => (
              <li key={review.id} className="review-item">
                <div className="review-item-header">
                  <span className="review-author">{review.studentName}</span>
                  <Stars rating={review.rating} />
                  <span className="review-date">{formatDate(review.createdAt)}</span>
                </div>
                {review.comment && <p className="review-comment">{review.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="jobs-detail-actions">
        {role === 'STUDENT' && enrollmentStatus === 'not-enrolled' && (
          <>
            {enrollError && <div className="form-error">{enrollError}</div>}
            <button type="button" className="btn btn-primary" disabled={enrollSubmitting} onClick={handleEnroll}>
              {enrollSubmitting ? 'Enrolling…' : 'Enroll'}
            </button>
          </>
        )}

        {role === 'STUDENT' && enrollmentStatus === 'enrolled' && (
          <>
            {enrollNote && <p className="jobs-apply-note">{enrollNote}</p>}

            {reviewState === 'submitted' && <p className="jobs-apply-note">Thanks for your review.</p>}
            {reviewState === 'already' && <p className="jobs-apply-note">You've already reviewed this course.</p>}
            {reviewState === 'idle' && (
              <form className="auth-form jobs-form" onSubmit={handleReviewSubmit}>
                <p className="review-form-title">Leave a review</p>
                {reviewError && <div className="form-error">{reviewError}</div>}

                <label className="field">
                  <span className="field-label">Rating</span>
                  <select
                    className="field-select"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(e.target.value)}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'star' : 'stars'}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field-label">Comment</span>
                  <textarea
                    className="field-input field-textarea"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                  />
                </label>

                <button type="submit" className="btn btn-primary" disabled={reviewSubmitting}>
                  {reviewSubmitting ? 'Submitting…' : 'Submit review'}
                </button>
              </form>
            )}
          </>
        )}

        {!isAuthenticated && (
          <p className="jobs-apply-note">
            <Link to="/login" state={{ from: { pathname: `/courses/${id}` } }}>
              Log in
            </Link>{' '}
            to enroll.
          </p>
        )}

        {isOwner && (
          <div className="course-owner-actions">
            {publishError && <div className="form-error">{publishError}</div>}
            <Link className="btn btn-outline" to={`/courses/${id}/content/new`}>
              Add content
            </Link>
            {!published && (
              <button type="button" className="btn btn-primary" disabled={publishSubmitting} onClick={handlePublish}>
                {publishSubmitting ? 'Publishing…' : 'Publish'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
