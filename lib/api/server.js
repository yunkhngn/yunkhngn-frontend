import 'server-only';

/**
 * Server-side fetch helper that unwraps the standardized response envelope.
 * Prefer `API_URL` (not exposed to the browser); falls back to `NEXT_PUBLIC_API_URL` for local dev.
 */
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path, options = {}) {
  if (!API_URL) {
    console.warn('apiFetch: API_URL is not set');
    return { data: null, meta: null, error: 'NO_API_URL' };
  }

  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      return { data: null, meta: null, error: res.status };
    }

    const json = await res.json();

    if (
      json &&
      typeof json === 'object' &&
      'data' in json &&
      'statusCode' in json &&
      'timestamp' in json
    ) {
      return { data: json.data, meta: json.meta || null, error: null };
    }

    return { data: json, meta: null, error: null };
  } catch (err) {
    // CI/build often uses a placeholder API host (e.g. api.example.com) → ENOTFOUND; don't fail the build.
    console.warn('apiFetch: request failed for', path, err?.cause?.message || err?.message || err);
    return { data: null, meta: null, error: 'NETWORK_ERROR' };
  }
}
