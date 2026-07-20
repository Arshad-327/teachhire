import { useAuth } from '../context/AuthContext';

const WELCOME_COPY = {
  TEACHER: 'Your next opportunity — and the students who need you — are one search away.',
  INSTITUTION: 'Post openings, review applicants, and keep your bulletin board current.',
  STUDENT: 'Pick up where you left off, or find a new course to start.',
  ADMIN: 'Platform overview and moderation tools live here.',
};

export default function DashboardPage() {
  const { user, role } = useAuth();

  return (
    <div className="page">
      <p className="page-eyebrow">Dashboard</p>
      <h1 className="page-title">Welcome, {user?.email}.</h1>
      <p className="page-lede">{WELCOME_COPY[role] ?? 'Good to see you.'}</p>
    </div>
  );
}
