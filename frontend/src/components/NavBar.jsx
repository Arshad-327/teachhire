import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOwnTeacherProfileId } from '../hooks/useOwnTeacherProfileId';

const NAV_LINKS_BY_ROLE = {
  TEACHER: [
    { to: '/jobs', label: 'Browse Jobs', end: true },
    { to: '/applications/mine', label: 'My Applications' },
    { to: '/teachers/me/courses', label: 'My Courses' },
    { to: '/connections', label: 'My Network' },
    { to: '/bulletins', label: 'Bulletins', end: true },
  ],
  INSTITUTION: [
    { to: '/jobs', label: 'Browse Jobs', end: true },
    { to: '/jobs/new', label: 'Post a Job' },
    { to: '/jobs/mine', label: 'My Postings' },
    { to: '/courses', label: 'Browse Courses', end: true },
    { to: '/bulletins/new', label: 'Post Bulletin' },
    { to: '/bulletins/mine', label: 'My Bulletins' },
    { to: '/bulletins', label: 'Bulletins', end: true },
  ],
  STUDENT: [
    { to: '/courses', label: 'Browse Courses', end: true },
    { to: '/students/me/enrollments', label: 'My Enrollments' },
    { to: '/bulletins', label: 'Bulletins', end: true },
  ],
  ADMIN: [{ to: '/bulletins', label: 'Bulletins', end: true }],
};

const PUBLIC_LINKS = [
  { to: '/courses', label: 'Browse Courses', end: true },
  { to: '/bulletins', label: 'Bulletins', end: true },
];

export default function NavBar() {
  const { user, role, logout } = useAuth();
  const links = role ? NAV_LINKS_BY_ROLE[role] ?? [] : PUBLIC_LINKS;
  const teacherProfileId = useOwnTeacherProfileId(role);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="navbar-brand-mark">T</span>
          <span className="navbar-brand-word">TeachHire</span>
        </NavLink>

        <nav className="navbar-links" aria-label="Primary">
          {role === 'TEACHER' && teacherProfileId && (
            <NavLink
              to={`/teachers/${teacherProfileId}`}
              className={({ isActive }) => `navbar-link${isActive ? ' navbar-link-active' : ''}`}
            >
              My Profile
            </NavLink>
          )}
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `navbar-link${isActive ? ' navbar-link-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-user">
          <span className="navbar-user-info">
            <span className="navbar-user-email">{user?.email}</span>
            <span className="navbar-user-role">{role?.toLowerCase()}</span>
          </span>
          <button type="button" className="btn btn-outline btn-small" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
