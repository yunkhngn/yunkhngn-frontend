import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase/config';
import { ref, onValue, onDisconnect, set, push } from 'firebase/database';

export function usePresence() {
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        if (!database) return;

        // Reference to the connections list
        const connectionsRef = ref(database, 'presence/connections');
        // Reference to the special Firebase info/connected path
        const connectedRef = ref(database, '.info/connected');

        // Watch for our own connection status
        const unsubscribeConnected = onValue(connectedRef, (snap) => {
            if (snap.val() === true) {
                // We are connected. Add our device to the connections list
                const conRef = push(connectionsRef);
                
                // When we disconnect, remove this device
                onDisconnect(conRef).remove().then(() => {
                    // Once the disconnect hook is set, set our initial status
                    set(conRef, true);
                });
            }
        });

        // Watch the connections list to get the total count
        const unsubscribeConnections = onValue(connectionsRef, (snap) => {
            if (snap.exists()) {
                setOnlineCount(snap.size);
            } else {
                setOnlineCount(0);
            }
        });

        return () => {
            unsubscribeConnected();
            unsubscribeConnections();
        };
    }, []);

    return onlineCount;
}
