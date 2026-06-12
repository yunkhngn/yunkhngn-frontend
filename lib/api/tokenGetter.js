// Registry that decouples lib/api/client.js from the Firebase SDK.
// AuthContext registers a getter once Firebase has loaded; until then
// requests simply go out unauthenticated (same as an anonymous visitor).
let getter = null;

export function setApiTokenGetter(fn) {
  getter = fn;
}

export function getApiToken() {
  return getter ? getter() : Promise.resolve(null);
}
