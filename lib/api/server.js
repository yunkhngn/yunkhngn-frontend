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
  // Extract custom timeout before spreading into fetch options
  const { timeout = 10000, ...fetchOptions } = options;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeout),
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
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
    const isTimeout = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    // CI/build often uses a placeholder API host → ENOTFOUND; don't fail the build.
    console.warn(`apiFetch: ${isTimeout ? 'timeout' : 'request failed'} for`, path, err?.cause?.message || err?.message || err);
    return { data: null, meta: null, error: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR' };
  }
}
