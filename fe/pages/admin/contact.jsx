import { useState, useEffect } from 'react';
import AdminLayout from '@/components/template/Admin/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'sonner';
import { Mail, Clock, CheckCircle, Send } from 'lucide-react';

export default function AdminContact() {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, new, read, responded
    const [viewingContact, setViewingContact] = useState(null);
    const [response, setResponse] = useState('');
    const [responding, setResponding] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
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
    };

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

    const filteredContacts = contacts.filter(contact => {
        if (filter === 'all') return true;
        return contact.status === filter;
    });

    const getStatusBadge = (status) => {
        const variants = {
            new: 'destructive',
            read: 'secondary',
            responded: 'default',
        };
        return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Contact Messages</h1>
                <p className="text-muted-foreground">Manage and respond to contact form submissions</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {['all', 'new', 'read', 'responded'].map((f) => (
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
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold">{contact.subject}</h3>
                                        {getStatusBadge(contact.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        From: {contact.name} ({contact.email})
                                    </p>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(contact.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <p className="text-sm line-clamp-2">{contact.message}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Contact Detail Modal */}
            <Dialog open={!!viewingContact} onOpenChange={(open) => !open && setViewingContact(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{viewingContact?.subject}</DialogTitle>
                    </DialogHeader>

                    {viewingContact && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {viewingContact.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {new Date(viewingContact.createdAt).toLocaleString()}
                                </div>
                                {getStatusBadge(viewingContact.status)}
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Message:</h4>
                                <p className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
                                    {viewingContact.message}
                                </p>
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

                            {viewingContact.status !== 'responded' && (
                                <div>
                                    <h4 className="font-semibold mb-2">Send Response:</h4>
                                    <Textarea
                                        placeholder="Type your response here..."
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        rows={6}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {viewingContact && viewingContact.status !== 'responded' && (
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
    );
}
