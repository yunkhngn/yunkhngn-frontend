'use client';

import { useEffect, useState } from 'react';
import { loadFirebaseDatabase } from '@/lib/firebase/lazy';

const EMPTY_STATUS = {
  online: false,
  busy: false,
  text: '',
  expires_at: null,
};

export function useAdminStatus() {
  const [status, setStatus] = useState(EMPTY_STATUS);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    loadFirebaseDatabase().then(({ database, dbMod }) => {
      if (cancelled || !database) return;
      const { ref, onValue } = dbMod;

      const statusRef = ref(database, 'status/admin');
      const unsub = onValue(statusRef, (snapshot) => {
        const value = snapshot.val();
        if (!value) {
          setStatus(EMPTY_STATUS);
          return;
        }
        const expires = value.expires_at ?? null;
        const expired = expires && expires < Date.now();
        setStatus({
          online: Boolean(value.online),
          busy: Boolean(value.busy),
          text: expired ? '' : value.text ?? '',
          expires_at: expired ? null : expires,
        });
      });
      cleanup = unsub;
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return status;
}
