'use client';

import { readNestJson } from '@/lib/api/readJson';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Loader2, Trash2, CheckCheck, MessageSquare, Mail, Heart, BellRing } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { formatDistanceToNow, isValid } from 'date-fns';
import { useRouter } from 'next/navigation'
import { useNotification } from '@/contexts/NotificationContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AdminPageHeader } from '@/components/admin/shared';


const TYPE_CONFIG = {
    CONTACT: {
        icon: Mail,
        label: 'Contact',
        className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50',
    },
    COMMENT: {
        icon: MessageSquare,
        label: 'Comment',
        className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50',
    },
    LIKE: {
        icon: Heart,
        label: 'Like',
        className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50',
    },
    DEFAULT: {
        icon: BellRing,
        label: 'Notice',
        className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/50',
    }
};

function NotificationTypeTag({ type }) {
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.DEFAULT;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${config.className}`}>
            <Icon size={12} className="shrink-0" />
            {config.label}
        </span>
    );
}

export default function Notifications() {
    const { user } = useAuth();
    const { markAsRead, markAllAsRead, fetchNotifications } = useNotification();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteId, setDeleteId] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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


    const handleDelete = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${deleteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.id !== deleteId));
                fetchNotifications(); // Update context
            }
        } catch (error) {
            console.error("Failed to delete notification", error);
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteId(null);
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
            let cleanLink = notification.link;
            // Prevent double hashes (e.g. /photo#photo-id1#photo-id2)
            if (cleanLink.includes('#')) {
                const parts = cleanLink.split('#');
                cleanLink = parts[0] + '#' + parts[parts.length - 1]; // Take base path and the LAST hash
            }
            router.push(cleanLink);
        }
    };

    if (loading && page === 1) {
        return (
            <>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <AdminPageHeader
                    title="Notifications"
                    action={{ label: 'Mark all as read', icon: <CheckCheck className="mr-2 h-4 w-4" />, onClick: handleMarkAllRead }}
                />
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
                                            <NotificationTypeTag type={notification.type} />
                                        </TableCell>
                                        <TableCell>{notification.message}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {notification.createdAt && isValid(new Date(notification.createdAt)) ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'N/A'}
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

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteId(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Notification"
                description="Are you sure you want to delete this notification? This action cannot be undone."
            />
        </>
    );
}
