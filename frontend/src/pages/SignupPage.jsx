import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

const ROLES = [
  { value: 'TEACHER', label: 'Teacher', blurb: 'Find work, build a reputation, teach online.' },
  { value: 'INSTITUTION', label: 'Institution', blurb: 'Post openings and hire qualified teachers.' },
  { value: 'STUDENT', label: 'Student', blurb: 'Learn from courses built by real educators.' },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('TEACHER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup(email, password, role);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-panel auth-panel-wide">
        <div className="auth-mark">T</div>
        <h1 className="auth-title">Join TeachHire.</h1>
        <p className="auth-subtitle">Tell us who you are — the platform adapts around you.</p>

        <div className="role-picker" role="radiogroup" aria-label="Account type">
          {ROLES.map((r) => (
            <button
              type="button"
              key={r.value}
              role="radio"
              aria-checked={role === r.value}
              className={`role-option${role === r.value ? ' role-option-selected' : ''}`}
              onClick={() => setRole(r.value)}
            >
              <span className="role-option-label">{r.label}</span>
              <span className="role-option-blurb">{r.blurb}</span>
            </button>
          ))}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <span className="field-hint">At least 8 characters.</span>
          </label>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account…' : `Create ${ROLES.find((r) => r.value === role).label.toLowerCase()} account`}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
