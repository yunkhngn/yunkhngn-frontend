const PREFIX = 'live_activity_';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getCached(key) {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setCached(key, data, ttlMs) {
  if (!isBrowser() || data == null) return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ data, expiresAt: Date.now() + ttlMs }));
  } catch {
    // quota exceeded — skip silently
  }
}
