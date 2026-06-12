'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadFirebaseDatabase } from '@/lib/firebase/lazy';

export function useAdminPresence() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) return undefined;

    let cancelled = false;
    let cleanup = () => {};

    loadFirebaseDatabase().then(({ database, dbMod }) => {
      if (cancelled || !database) return;
      const { ref, onDisconnect, onValue, serverTimestamp, update } = dbMod;

      const statusRef = ref(database, 'status/admin');
      const connectedRef = ref(database, '.info/connected');

      const unsub = onValue(connectedRef, (snap) => {
        if (snap.val() !== true) return;
        onDisconnect(statusRef)
          .update({ online: false, lastChange: serverTimestamp() })
          .then(() => {
            update(statusRef, { online: true, lastChange: serverTimestamp() });
          })
          .catch((err) => {
            console.error('Failed to register onDisconnect', err);
          });
      });

      cleanup = () => {
        unsub();
        onDisconnect(statusRef)
          .cancel()
          .catch(() => {});
        update(statusRef, {
          online: false,
          lastChange: serverTimestamp(),
        }).catch(() => {});
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [isAdmin]);
}
