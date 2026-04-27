import AdminLayout from "@/components/template/Admin/Layout";
import { readNestJson } from '@/lib/api/readJson';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Loader2, Trash2, CheckCheck } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/router';
import { useNotification } from '@/contexts/NotificationContext';

export default function Notifications() {
    const { user } = useAuth();
    const { markAsRead, markAllAsRead, fetchNotifications } = useNotification();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter();

    const fetchAllNotifications = React.useCallback(async () => {
        try {
            setLoading(true);
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications?page=${page}&limit=20`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await readNestJson(res);
                setNotifications(data.data);
                setTotalPages(data.meta.lastPage);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    }, [user, page]);

    useEffect(() => {
        if (user) {
            fetchAllNotifications();
        }
    }, [user, fetchAllNotifications]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this notification?')) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                fetchNotifications(); // Update context
            }
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        fetchAllNotifications();
    };

    const handleRowClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
            // Update local state to reflect read status immediately
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
        }
        if (notification.link) {
            router.push(notification.link);
        }
    };

    if (loading && page === 1) {
        return (
            <AdminLayout title="Notifications">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Notifications">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <Button onClick={handleMarkAllRead} variant="outline" size="sm">
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark all as read
                    </Button>
                </div>

                <div className="bg-card rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Type</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead className="w-[150px]">Time</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notifications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No notifications found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                notifications.map((notification) => (
                                    <TableRow
                                        key={notification.id}
                                        className={`cursor-pointer ${!notification.read ? 'bg-muted/30 font-medium' : ''}`}
                                        onClick={() => handleRowClick(notification)}
                                    >
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${notification.type === 'CONTACT' ? 'bg-blue-100 text-blue-800' :
                                                notification.type === 'COMMENT' ? 'bg-green-100 text-green-800' :
                                                    'bg-purple-100 text-purple-800'
                                                }`}>
                                                {notification.type}
                                            </span>
                                        </TableCell>
                                        <TableCell>{notification.message}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(notification.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <span className="flex items-center text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
