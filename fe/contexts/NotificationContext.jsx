import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import io from 'socket.io-client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function useNotification() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();
    const userRef = useRef(user);

    // Keep userRef in sync with user
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const [isAdminOnline, setIsAdminOnline] = useState(false);

    useEffect(() => {
        // Remove /api from URL for socket connection if present
        const startUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const socketUrl = startUrl.replace(/\/api$/, '');

        const newSocket = io(socketUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            if (user?.role === 'ADMIN') {
                newSocket.emit('identity-admin');
            }
            newSocket.emit('check-admin-status');
        });

        newSocket.on('admin-status', (data) => {
            setIsAdminOnline(data.online);
        });

        newSocket.on('connect_error', (error) => {
            console.warn('Socket connection error:', error.message);
        });

        newSocket.on('newNotification', (notification) => {
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            toast(notification.message, {
                action: {
                    label: 'View',
                    onClick: () => window.location.href = notification.link || '/admin/notifications',
                },
            });
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    const fetchNotifications = useCallback(async () => {
        const currentUser = userRef.current;
        if (!currentUser) return;
        try {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications?limit=5`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.data);
                setUnreadCount(data.meta.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    }, []);

    // Trigger fetch when user UID changes (login/logout/switch)
    const uid = user?.uid;
    useEffect(() => {
        if (uid) {
            fetchNotifications();
        }
    }, [uid, fetchNotifications]);

    const markAsRead = useCallback(async (id) => {
        const currentUser = userRef.current;
        if (!currentUser) return;
        try {
            const token = await currentUser.getIdToken();
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        const currentUser = userRef.current;
        if (!currentUser) return;
        try {
            const token = await currentUser.getIdToken();
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    }, []);

    const value = useMemo(() => ({
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        isAdminOnline,
    }), [notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications, isAdminOnline]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}
