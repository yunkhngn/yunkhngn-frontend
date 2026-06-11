// Lazy entry points for the Firebase SDK. Static imports of firebase/* from
// always-mounted providers put ~70KB gz in every visitor's first load; these
// helpers defer that to a separate chunk fetched after hydration.
let authPromise = null;
let dbPromise = null;

export function loadFirebaseAuth() {
  if (!authPromise) {
    authPromise = Promise.all([
      import('./config'),
      import('firebase/auth'),
    ]).then(([config, authMod]) => ({ auth: config.auth, authMod }));
  }
  return authPromise;
}

export function loadFirebaseDatabase() {
  if (!dbPromise) {
    dbPromise = Promise.all([
      import('./config'),
      import('firebase/database'),
    ]).then(([config, dbMod]) => ({ database: config.database, dbMod }));
  }
  return dbPromise;
}
