'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { readNestJson } from '@/lib/api/readJson';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Send, Loader2, Mail, Trash2, Users, Eye, EyeOff, Settings, FileText, Folder } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AdminPageHeader } from '@/components/admin/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

const TipTapEditor = dynamic(() => import('@/components/ui/TipTapEditor'), { ssr: false });

export default function AdminNewsletter() {
    const { user } = useAuth();
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('idle');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Subscribers state
    const [subscribers, setSubscribers] = useState([]);
    const [loadingSubscribers, setLoadingSubscribers] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Settings state
    const [autoBlog, setAutoBlog] = useState(true);
    const [autoProject, setAutoProject] = useState(true);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [savingSettings, setSavingSettings] = useState(null); // 'blog' | 'project' | null

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

    // Fetch newsletter settings
    const fetchSettings = useCallback(async () => {
        try {
            setLoadingSettings(true);
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await readNestJson(res);
                const blogSetting = data.find(s => s.settingTitle === 'newsletter_auto_blog');
                const projectSetting = data.find(s => s.settingTitle === 'newsletter_auto_project');
                // Default to true if setting is empty or doesn't exist
                setAutoBlog(blogSetting?.content !== 'false');
                setAutoProject(projectSetting?.content !== 'false');
            }
        } catch (error) {
            console.error('Failed to fetch newsletter settings:', error);
        } finally {
            setLoadingSettings(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchSettings();
        }
    }, [user, fetchSettings]);

    const updateSetting = async (key, value) => {
        const settingType = key === 'newsletter_auto_blog' ? 'blog' : 'project';
        setSavingSettings(settingType);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    settingTitle: key,
                    content: value ? 'true' : 'false',
                }),
            });
            if (res.ok) {
                toast.success(`Auto-send ${settingType} ${value ? 'enabled' : 'disabled'}`);
            } else {
                toast.error('Failed to update setting');
            }
        } catch (error) {
            console.error(error);
            toast.error('Network error');
        } finally {
            setSavingSettings(null);
        }
    };

    const handleSend = () => {
        if (!subject || !content || content === '<p></p>') {
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
                        <TabsTrigger value="settings" className="flex items-center gap-2">
                            <Settings className="w-4 h-4" /> Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="compose">
                        <div className="space-y-6">
                            {/* Subject */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Enter email subject"
                                />
                            </div>

                            {/* Editor */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Content</label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="text-muted-foreground"
                                    >
                                        {showPreview ? (
                                            <><EyeOff className="mr-2 h-4 w-4" /> Hide Preview</>
                                        ) : (
                                            <><Eye className="mr-2 h-4 w-4" /> Show Preview</>
                                        )}
                                    </Button>
                                </div>
                                <TipTapEditor
                                    content={content}
                                    onChange={setContent}
                                    format="html"
                                    hideEmbeds
                                />
                            </div>

                            {/* HTML Preview */}
                            {showPreview && content && content !== '<p></p>' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">HTML Preview</label>
                                    <div className="border rounded-lg p-6 bg-white dark:bg-zinc-900">
                                        <div
                                            className="prose dark:prose-invert max-w-none prose-headings:font-serif"
                                            dangerouslySetInnerHTML={{ __html: content }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-2 border-t">
                                <p className="text-sm text-muted-foreground">
                                    {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''} will receive this email
                                </p>
                                <Button onClick={handleSend} disabled={status === 'loading'}>
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
                        </div>
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

                    <TabsContent value="settings">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold">Auto-Send Settings</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Control whether newsletters are automatically sent when new content is published.
                                </p>
                            </div>

                            {loadingSettings ? (
                                <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Loading settings...
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Blog Toggle */}
                                    <div className="border rounded-lg p-4 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="font-medium">Blog Posts</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Auto-send newsletter when a blog post is published
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={autoBlog}
                                            disabled={savingSettings === 'blog'}
                                            onClick={() => {
                                                const newVal = !autoBlog;
                                                setAutoBlog(newVal);
                                                updateSetting('newsletter_auto_blog', newVal);
                                            }}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${autoBlog ? 'bg-primary' : 'bg-muted'}`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${autoBlog ? 'translate-x-5' : 'translate-x-0'}`}
                                            />
                                        </button>
                                    </div>

                                    {/* Project Toggle */}
                                    <div className="border rounded-lg p-4 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                                <Folder className="h-5 w-5 text-purple-500" />
                                            </div>
                                            <div>
                                                <div className="font-medium">Projects</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Auto-send newsletter when a project is published
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={autoProject}
                                            disabled={savingSettings === 'project'}
                                            onClick={() => {
                                                const newVal = !autoProject;
                                                setAutoProject(newVal);
                                                updateSetting('newsletter_auto_project', newVal);
                                            }}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${autoProject ? 'bg-primary' : 'bg-muted'}`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${autoProject ? 'translate-x-5' : 'translate-x-0'}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            )}
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

