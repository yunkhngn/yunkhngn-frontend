import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/template/Admin/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import TipTapEditor from '@/components/ui/TipTapEditor';
import TipTapViewer from '@/components/ui/TipTapViewer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { toast } from 'sonner';
import { Mail, Clock, CheckCircle, Send, Sparkles, Phone, Building, Trash2, Plus, PenLine } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function AdminContact() {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, new, read, responded, sent
    const [viewingContact, setViewingContact] = useState(null);
    const [response, setResponse] = useState('');
    const [responding, setResponding] = useState(false);
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiLanguage, setAiLanguage] = useState('en'); // en or vi
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        description: '',
        action: null,
        action: null,
        loading: false
    });
    const [composeOpen, setComposeOpen] = useState(false);
    const [composeData, setComposeData] = useState({
        to: '',
        name: '',
        subject: '',
        content: '',
        aiTopic: ''
    });
    const [composeLoading, setComposeLoading] = useState(false);

    const fetchContacts = useCallback(async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setContacts(data);
            }
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchContacts();
        }
    }, [user, fetchContacts]);

    const markAsRead = async (id) => {
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: 'read' }),
            });
            if (res.ok) {
                fetchContacts();
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleRespond = async () => {
        if (!response.trim()) {
            toast.error('Please enter a response');
            return;
        }

        setResponding(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/${viewingContact.id}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ response }),
            });

            if (res.ok) {
                toast.success('Response sent successfully!');
                setResponse('');
                setViewingContact(null);
                fetchContacts();
            } else {
                throw new Error('Failed to send response');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to send response');
        } finally {
            setResponding(false);
        }
    };

    const handleDeleteClick = (e, id) => {
        e.stopPropagation();
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Contact',
            description: 'Are you sure you want to delete this contact? This action cannot be undone.',
            action: () => deleteContact(id)
        });
    };

    const deleteContact = async (id) => {
        setConfirmConfig(prev => ({ ...prev, loading: true }));
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                toast.success('Contact deleted');
                fetchContacts();
                if (viewingContact?.id === id) {
                    setViewingContact(null);
                }
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete contact');
            setConfirmConfig(prev => ({ ...prev, loading: false }));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedContacts(filteredContacts.map(c => c.id));
        } else {
            setSelectedContacts([]);
        }
    };

    const handleSelectContact = (contactId, checked) => {
        if (checked) {
            setSelectedContacts(prev => [...prev, contactId]);
        } else {
            setSelectedContacts(prev => prev.filter(id => id !== contactId));
        }
    };

    const handleBulkDeleteClick = () => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Contacts',
            description: `Are you sure you want to delete ${selectedContacts.length} contacts? This action cannot be undone.`,
            action: bulkDeleteContacts
        });
    };

    const bulkDeleteContacts = async () => {
        setConfirmConfig(prev => ({ ...prev, loading: true }));
        try {
            const token = await user.getIdToken();
            await Promise.all(selectedContacts.map(id =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                })
            ));

            setContacts(contacts.filter(c => !selectedContacts.includes(c.id)));
            setSelectedContacts([]);
            toast.success('Contacts deleted');
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete contacts');
            setConfirmConfig(prev => ({ ...prev, loading: false }));
        }
    };

    const handleAiSuggest = async () => {
        if (!viewingContact) return;

        setAiGenerating(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/${viewingContact.id}/ai-suggest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    language: aiLanguage,
                    existingText: response.trim() || null,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setResponse(data.suggestion);
                toast.success('AI suggestion generated!');
            } else {
                throw new Error('Failed to generate AI suggestion');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate AI suggestion');
        } finally {
            setAiGenerating(false);
        }
    };

    const filteredContacts = contacts.filter(contact => {
        if (filter === 'new') return contact.status === 'new';
        if (filter === 'read') return contact.status === 'read';
        if (filter === 'responded') return contact.status === 'responded';
        if (filter === 'sent') return contact.status === 'sent';
        return contact.status !== 'sent';
    });

    const getStatusBadge = (status) => {
        const variants = {
            new: 'destructive',
            read: 'outline',
            responded: 'success',
            sent: 'secondary'
        };
        return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
    };

    const handleComposeAiSuggest = async () => {
        if (!composeData.aiTopic && !composeData.content) {
            toast.error('Please enter a topic or some content for AI to improve');
            return;
        }

        setAiGenerating(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/ai-compose`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    topic: composeData.aiTopic || composeData.content,
                    recipientName: composeData.name || 'there',
                    language: aiLanguage,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setComposeData({ ...composeData, content: data.suggestion });
                toast.success('AI draft generated!');
            } else {
                throw new Error('Failed to generate draft');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate draft');
        } finally {
            setAiGenerating(false);
        }
    };

    const handleEditorImageUpload = async (file) => {
        try {
            const token = await user.getIdToken();
            const sigRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/signature?folder=contacts/mail-content`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { signature, timestamp } = await sigRes.json();

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', 'contacts/mail-content');

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const uploadData = await uploadRes.json();
            return uploadData.secure_url;
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload image');
            return null;
        }
    };

    const handleSendCustomMail = async () => {
        if (!composeData.to || !composeData.subject || !composeData.content) {
            toast.error('Please fill in required fields');
            return;
        }

        setComposeLoading(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/send-mail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    to: composeData.to,
                    name: composeData.name || 'Friend',
                    subject: composeData.subject,
                    content: composeData.content,
                }),
            });

            if (res.ok) {
                toast.success('Email sent successfully!');
                setComposeOpen(false);
                setComposeData({ to: '', name: '', subject: '', content: '', aiTopic: '' });
                fetchContacts(); // Refresh list to show sent mail
            } else {
                throw new Error('Failed to send email');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to send email');
        } finally {
            setComposeLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="p-8">Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Contact Messages</h1>
                        <p className="text-muted-foreground">Manage and respond to contact form submissions</p>
                    </div>
                    <Button onClick={() => setComposeOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Compose Mail
                    </Button>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['all', 'new', 'read', 'responded', 'sent'].map((f) => (
                        <Button
                            key={f}
                            variant={filter === f ? 'default' : 'outline'}
                            onClick={() => setFilter(f)}
                            size="sm"
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            {f !== 'all' && (
                                <span className="ml-2 text-xs">
                                    ({contacts.filter(c => c.status === f).length})
                                </span>
                            )}
                        </Button>
                    ))}
                </div>

                {/* Contacts List */}
                <div className="space-y-4">
                    {selectedContacts.length > 0 && (
                        <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <span className="text-sm font-medium">
                                {selectedContacts.length} selected
                            </span>
                            <Button size="sm" variant="destructive" onClick={handleBulkDeleteClick}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                            </Button>
                        </div>
                    )}

                    <div className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-muted/20 mb-2">
                        <Checkbox
                            checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                            onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm font-medium text-muted-foreground">Select All</span>
                    </div>

                    {filteredContacts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No contacts found
                        </div>
                    ) : (
                        filteredContacts.map((contact) => (
                            <div
                                key={contact.id}
                                className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => {
                                    setViewingContact(contact);
                                    if (contact.status === 'new') {
                                        markAsRead(contact.id);
                                    }
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedContacts.includes(contact.id)}
                                            onCheckedChange={(checked) => handleSelectContact(contact.id, checked)}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-2 gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h3 className="font-semibold truncate">{contact.subject}</h3>
                                                    {getStatusBadge(contact.status)}
                                                    <Badge variant="outline" className="text-xs">
                                                        {contact.category?.toUpperCase() || 'GENERAL'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {contact.status === 'sent' ? 'To: ' : 'From: '}
                                                    {contact.name} ({contact.email})
                                                    {contact.company && ` • ${contact.company}`}
                                                </p>
                                            </div>
                                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(contact.createdAt).toLocaleDateString()}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                                onClick={(e) => handleDeleteClick(e, contact.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm line-clamp-2">{contact.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Contact Detail Modal */}
                <Dialog open={!!viewingContact} onOpenChange={(open) => !open && setViewingContact(null)}>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{viewingContact?.subject}</DialogTitle>
                        </DialogHeader>

                        {viewingContact && (
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        {viewingContact.email}
                                    </div>
                                    {viewingContact.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            {viewingContact.phone}
                                        </div>
                                    )}
                                    {viewingContact.company && (
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            {viewingContact.company}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {new Date(viewingContact.createdAt).toLocaleString()}
                                    </div>
                                    {getStatusBadge(viewingContact.status)}
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Message:</h4>
                                    <div className="bg-muted p-4 rounded-lg">
                                        <TipTapViewer content={viewingContact.message} />
                                    </div>
                                </div>

                                {viewingContact.adminResponse && (
                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            Your Response:
                                        </h4>
                                        <p className="whitespace-pre-wrap bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                                            {viewingContact.adminResponse}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Sent: {new Date(viewingContact.respondedAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}

                                {viewingContact.status !== 'responded' && viewingContact.status !== 'sent' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold">Send Response:</h4>
                                            <Select value={aiLanguage} onValueChange={setAiLanguage}>
                                                <SelectTrigger className="w-[140px] h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="en">🇬🇧 English</SelectItem>
                                                    <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="relative">
                                            <Textarea
                                                placeholder="Type your response here..."
                                                value={response}
                                                onChange={(e) => setResponse(e.target.value)}
                                                rows={6}
                                            />
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
                                                onClick={handleAiSuggest}
                                                disabled={aiGenerating}
                                                title="Generate AI suggestion"
                                            >
                                                <Sparkles className={`h-4 w-4 ${aiGenerating ? 'animate-spin' : ''}`} />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {viewingContact && (viewingContact.status === 'sent' || viewingContact.status === 'sent_mail') && (
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setViewingContact(null)}>
                                    Close
                                </Button>
                                <Button onClick={() => {
                                    setComposeData({
                                        to: viewingContact.email,
                                        name: viewingContact.name,
                                        subject: viewingContact.subject,
                                        content: viewingContact.message,
                                        aiTopic: ''
                                    });
                                    setViewingContact(null);
                                    setComposeOpen(true);
                                }}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Resend
                                </Button>
                            </DialogFooter>
                        )}

                        {viewingContact && viewingContact.status !== 'responded' && viewingContact.status !== 'sent' && viewingContact.status !== 'sent_mail' && (
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setViewingContact(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleRespond} disabled={responding}>
                                    <Send className="h-4 w-4 mr-2" />
                                    {responding ? 'Sending...' : 'Send Response'}
                                </Button>
                            </DialogFooter>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.action}
                title={confirmConfig.title}
                description={confirmConfig.description}
                loading={confirmConfig.loading}
            />

            {/* Compose Mail Modal */}
            <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
                <DialogContent className="max-w-[80vw] max-h-[90vh] overflow-y-auto w-full">
                    <DialogHeader>
                        <DialogTitle>Compose New Email</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">To (Email)</label>
                                <Input
                                    placeholder="email@example.com"
                                    value={composeData.to}
                                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Recipient Name</label>
                                <Input
                                    placeholder="John Doe"
                                    value={composeData.name}
                                    onChange={(e) => setComposeData({ ...composeData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject</label>
                            <Input
                                placeholder="Email Subject"
                                value={composeData.subject}
                                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                            />
                        </div>

                        {/* AI Assist Section */}
                        <div className="bg-muted/30 p-4 rounded-lg space-y-3 border border-dashed">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                    <Sparkles className="h-4 w-4" /> AI Assistant
                                </span>
                                <Select value={aiLanguage} onValueChange={setAiLanguage}>
                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter topic or key points for AI to draft..."
                                    value={composeData.aiTopic}
                                    onChange={(e) => setComposeData({ ...composeData, aiTopic: e.target.value })}
                                    className="h-9 text-sm"
                                />
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleComposeAiSuggest}
                                    disabled={aiGenerating || (!composeData.aiTopic && !composeData.content)}
                                >
                                    {aiGenerating ? <Sparkles className="animate-spin h-4 w-4" /> : 'Draft'}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Content</label>
                            <TipTapEditor
                                content={composeData.content}
                                onChange={(html) => setComposeData({ ...composeData, content: html })}
                                format="html"
                                onImageUpload={handleEditorImageUpload}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendCustomMail} disabled={composeLoading}>
                            <Send className="mr-2 h-4 w-4" />
                            {composeLoading ? 'Sending...' : 'Send Email'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
