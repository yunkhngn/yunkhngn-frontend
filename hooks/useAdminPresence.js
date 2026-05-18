'use client';

import { useEffect } from 'react';
import {
  ref,
  onDisconnect,
  onValue,
  serverTimestamp,
  update,
} from 'firebase/database';
import { database } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

export function useAdminPresence() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!database || !isAdmin) return undefined;

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

    return () => {
      unsub();
      // When the admin signs out (or the hook unmounts on role transition),
      // explicitly flip online=false and cancel the disconnect handler so a
      // signed-out admin doesn't keep showing online until tab close.
      onDisconnect(statusRef)
        .cancel()
        .catch(() => {});
      update(statusRef, {
        online: false,
        lastChange: serverTimestamp(),
      }).catch(() => {});
    };
  }, [isAdmin]);
}
