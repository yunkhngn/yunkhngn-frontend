'use client';

import { useState } from 'react';
import { readNestJson } from '@/lib/api/readJson';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send, Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AdminPageHeader } from '@/components/admin/shared';

export default function AdminNewsletter() {
    const { user } = useAuth();
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('idle');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);


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

    return (
        <>
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="mb-8">
                    <AdminPageHeader
                        title="Newsletter"
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-purple-500" />
                            Compose Newsletter
                        </CardTitle>
                        <CardDescription>
                            Write your email update below. It will be sent to all subscribers.
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
        </>
    );
}
