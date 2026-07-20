// Minimal JWT payload decoder — no signature verification (that's the server's job).
// We only ever read claims here to drive UI state (role, expiry).

function base64UrlDecode(segment) {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return atob(padded);
}

export function decodeToken(token) {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const payloadJson = decodeURIComponent(
      base64UrlDecode(parts[1])
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

export function isTokenValid(token) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return false;
  return payload.exp * 1000 > Date.now();
}
