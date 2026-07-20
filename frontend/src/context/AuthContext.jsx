import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { apiClient, getToken, setToken as persistToken } from '../api/client';
import { decodeToken, isTokenValid } from '../utils/jwt';

const AuthContext = createContext(null);

function buildUserFromToken(token) {
  if (!token || !isTokenValid(token)) return null;
  const payload = decodeToken(token);
  if (!payload) return null;
  return {
    id: payload.userId,
    email: payload.sub,
    role: payload.role,
  };
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    const stored = getToken();
    return stored && isTokenValid(stored) ? stored : null;
  });
  const [user, setUser] = useState(() => buildUserFromToken(token));

  const applyToken = useCallback((newToken) => {
    persistToken(newToken);
    setTokenState(newToken);
    setUser(buildUserFromToken(newToken));
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await apiClient.post('/api/auth/login', { email, password }, { auth: false });
      applyToken(data.token);
      return data;
    },
    [applyToken]
  );

  const signup = useCallback(
    async (email, password, role) => {
      const data = await apiClient.post('/api/auth/signup', { email, password, role }, { auth: false });
      applyToken(data.token);
      return data;
    },
    [applyToken]
  );

  const logout = useCallback(() => {
    applyToken(null);
  }, [applyToken]);

  const value = useMemo(
    () => ({
      token,
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout,
    }),
    [token, user, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
