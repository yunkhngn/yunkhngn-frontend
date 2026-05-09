export const SETTINGS_CACHE_KEY = 'site-settings-cache-v2';
const OLD_SETTINGS_CACHE_KEY = 'site-settings-cache-v1';
const SETTINGS_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

// Only cache display-related settings in localStorage.
// Internal/runtime settings (forbidden words, API names, etc.) are excluded.
const CACHEABLE_KEYS = [
  'bio',
  'quote',
  'facebook',
  'github',
  'instagram',
  'linkedin',
  'tiktok',
  'email',
  'homepage_description',
  'footer_description',
  'about_content',
  'education',
  'experience',
  'skills',
  'cv_url',
  'avatar',
  'about_image_story',
  'about_image_journey',
  'about_image_skills',
  'about_image_contact',
];

function isBrowser() {
  if (typeof window === 'undefined') return false;

  try {
    return !!window.localStorage;
  } catch {
    return false;
  }
}

function removeCachedSettingsSafely() {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(SETTINGS_CACHE_KEY);
  } catch {
    // Ignore storage/security errors during cleanup.
  }
}

export function readCachedSettings() {
  if (!isBrowser()) return null;

  // Cleanup old v1 cache if it exists
  try {
    if (window.localStorage.getItem(OLD_SETTINGS_CACHE_KEY)) {
      window.localStorage.removeItem(OLD_SETTINGS_CACHE_KEY);
    }
  } catch (e) {}

  try {
    const raw = window.localStorage.getItem(SETTINGS_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const hasEnvelope =
      Object.prototype.hasOwnProperty.call(parsed, 'data') &&
      Object.prototype.hasOwnProperty.call(parsed, 'createdAt');

    if (!hasEnvelope) {
      removeCachedSettingsSafely();
      return null;
    }

    if (
      typeof parsed.createdAt !== 'number' ||
      Date.now() - parsed.createdAt > SETTINGS_CACHE_TTL_MS
    ) {
      removeCachedSettingsSafely();
      return null;
    }

    return parsed.data && typeof parsed.data === 'object' ? parsed.data : null;
  } catch {
    removeCachedSettingsSafely();
    return null;
  }
}

export function writeCachedSettings(settings) {
  if (!isBrowser() || !settings || typeof settings !== 'object') return;

  // Filter to only cache display-related settings
  const filtered = {};
  for (const key of CACHEABLE_KEYS) {
    if (key in settings) {
      filtered[key] = settings[key];
    }
  }

  const payload = {
    data: filtered,
    createdAt: Date.now(),
  };

  try {
    window.localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota/security errors.
  }
}

