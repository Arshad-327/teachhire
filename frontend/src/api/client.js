const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const TOKEN_KEY = 'teachhire_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
  const finalHeaders = { ...headers };

  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data;
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
