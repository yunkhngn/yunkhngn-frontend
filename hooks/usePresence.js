import { useState, useEffect } from 'react';
import { loadFirebaseDatabase } from '@/lib/firebase/lazy';

export function usePresence() {
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        let cancelled = false;
        let cleanup = () => {};

        loadFirebaseDatabase().then(({ database, dbMod }) => {
            if (cancelled || !database) return;
            const { ref, onValue, onDisconnect, set, push } = dbMod;

            const connectionsRef = ref(database, 'presence/connections');
            const connectedRef = ref(database, '.info/connected');

            const unsubscribeConnected = onValue(connectedRef, (snap) => {
                if (snap.val() === true) {
                    const conRef = push(connectionsRef);
                    onDisconnect(conRef).remove().then(() => {
                        set(conRef, true);
                    });
                }
            });

            const unsubscribeConnections = onValue(connectionsRef, (snap) => {
                if (snap.exists()) {
                    setOnlineCount(snap.size);
                } else {
                    setOnlineCount(0);
                }
            });

            cleanup = () => {
                unsubscribeConnected();
                unsubscribeConnections();
            };
        });

        return () => {
            cancelled = true;
            cleanup();
        };
    }, []);

    return onlineCount;
}
