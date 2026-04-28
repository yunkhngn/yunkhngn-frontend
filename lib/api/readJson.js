/**
 * Parse JSON from a Nest response that may use TransformInterceptor envelope:
 * { data, statusCode, timestamp, meta? }
 */
export function unwrapEnvelope(json) {
  if (
    json &&
    typeof json === 'object' &&
    'data' in json &&
    'statusCode' in json &&
    'timestamp' in json
  ) {
    return json.data;
  }
  return json;
}

export async function readNestJson(response) {
  const json = await response.json();
  return unwrapEnvelope(json);
}
