export const SETTINGS_CACHE_KEY = 'site-settings-cache-v1';
const SETTINGS_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

function isBrowser() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export function readCachedSettings() {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(SETTINGS_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const hasEnvelope =
      Object.prototype.hasOwnProperty.call(parsed, 'data') &&
      Object.prototype.hasOwnProperty.call(parsed, 'createdAt');

    if (!hasEnvelope) {
      window.localStorage.removeItem(SETTINGS_CACHE_KEY);
      return null;
    }

    if (
      typeof parsed.createdAt !== 'number' ||
      Date.now() - parsed.createdAt > SETTINGS_CACHE_TTL_MS
    ) {
      window.localStorage.removeItem(SETTINGS_CACHE_KEY);
      return null;
    }

    return parsed.data && typeof parsed.data === 'object' ? parsed.data : null;
  } catch {
    window.localStorage.removeItem(SETTINGS_CACHE_KEY);
    return null;
  }
}

export function writeCachedSettings(settings) {
  if (!isBrowser() || !settings || typeof settings !== 'object') return;

  const payload = {
    data: settings,
    createdAt: Date.now(),
  };

  try {
    window.localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota/security errors.
  }
}
