'use client';

import { useState, useEffect, useCallback } from 'react';
import { readNestJson } from '@/lib/api/readJson';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send, Loader2, Mail, Trash2, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AdminPageHeader } from '@/components/admin/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export default function AdminNewsletter() {
    const { user } = useAuth();
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('idle');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // Subscribers state
    const [subscribers, setSubscribers] = useState([]);
    const [loadingSubscribers, setLoadingSubscribers] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchSubscribers = useCallback(async () => {
        try {
            setLoadingSubscribers(true);
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await readNestJson(res);
                setSubscribers(data);
            }
        } catch (error) {
            console.error('Failed to fetch subscribers:', error);
            toast.error('Failed to load subscribers');
        } finally {
            setLoadingSubscribers(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchSubscribers();
        }
    }, [user, fetchSubscribers]);

    const handleSend = () => {
        if (!subject || !content) {
            toast.error('Please fill in both subject and content');
            return;
        }
        setIsConfirmModalOpen(true);
    };

    const confirmSend = async () => {
        setIsConfirmModalOpen(false);
        setStatus('loading');
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ subject, content }),
            });

            const data = await readNestJson(res);

            if (res.ok) {
                toast.success(`Newsletter sent successfully to ${data.sent} subscribers!`);
                setSubject('');
                setContent('');
            } else {
                toast.error(data.message || 'Failed to send newsletter');
            }
        } catch (error) {
            console.error(error);
            toast.error('Network error');
        } finally {
            setStatus('idle');
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribers/${deleteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Subscriber deleted successfully');
                fetchSubscribers();
            } else {
                const data = await readNestJson(res);
                toast.error(data.message || 'Failed to delete subscriber');
            }
        } catch (error) {
            console.error(error);
            toast.error('Network error');
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        }
    };

    return (
        <>
            <div>
                <div className="mb-8">
                    <AdminPageHeader
                        title="Newsletter"
                    />
                </div>

                <Tabs defaultValue="compose" className="w-full">
                    <TabsList className="mb-8">
                        <TabsTrigger value="compose" className="flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Compose
                        </TabsTrigger>
                        <TabsTrigger value="subscribers" className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> Subscribers ({subscribers.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="compose">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-purple-500" />
                                    Compose Newsletter
                                </CardTitle>
                                <CardDescription>
                                    Write your email update below. It will be sent to all {subscribers.length} subscribers.
                                    <br />
                                    HTML is supported in the content field.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subject</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Enter email subject"
                                        className="w-full bg-background border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Content (HTML supported)</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="<p>Hello everyone!</p><p>Check out my new post...</p>"
                                        className="w-full h-64 bg-background border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary outline-none font-mono text-sm"
                                    />
                                </div>
                                <div className='flex justify-end'>
                                    <Button onClick={handleSend} disabled={status === 'loading'} className="bg-purple-600 hover:bg-purple-700 text-white">
                                        {status === 'loading' ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Send to All Subscribers
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="subscribers">
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Subscriber Management</h2>

                            <div className="border rounded-lg overflow-hidden">
                                <table className="hidden sm:table w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Email</th>
                                            <th className="px-4 py-3 font-medium">Subscribed At</th>
                                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {loadingSubscribers ? (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                                    Loading subscribers...
                                                </td>
                                            </tr>
                                        ) : subscribers.length > 0 ? (
                                            subscribers.map((sub) => (
                                                <tr key={sub.id} className="hover:bg-muted/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium">{sub.email}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {new Date(sub.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDelete(sub.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                                    No subscribers found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Mobile View */}
                                <div className="sm:hidden divide-y">
                                    {loadingSubscribers ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                            Loading subscribers...
                                        </div>
                                    ) : subscribers.length > 0 ? (
                                        subscribers.map((sub) => (
                                            <div key={sub.id} className="p-4 flex justify-between items-center gap-4">
                                                <div className="min-w-0">
                                                    <div className="font-medium truncate">{sub.email}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(sub.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="text-destructive shrink-0 hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(sub.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-muted-foreground">
                                            No subscribers found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmSend}
                title="Send Newsletter"
                description="Are you sure you want to send this newsletter to ALL subscribers? This action cannot be undone."
                confirmText="Send to All"
                variant="default"
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Subscriber"
                description="Are you sure you want to remove this subscriber from the mailing list? They will no longer receive newsletters."
                confirmText="Delete"
                variant="destructive"
            />
        </>
    );
}
