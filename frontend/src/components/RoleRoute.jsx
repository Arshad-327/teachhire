import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ allow }) {
  const { role } = useAuth();

  if (!allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
