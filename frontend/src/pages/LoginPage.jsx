import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="auth-mark">T</div>
        <h1 className="auth-title">Welcome back.</h1>
        <p className="auth-subtitle">Sign in to pick up where you left off.</p>

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
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          New to TeachHire? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
