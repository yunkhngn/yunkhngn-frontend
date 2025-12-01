import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function CommentForm({ blogId, onCommentAdded }) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            toast.error('Please enter a comment');
            return;
        }

        if (!displayName.trim()) {
            toast.error('Please enter your name');
            return;
        }

        setLoading(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    blogId,
                    content: content.trim(),
                    displayName: displayName.trim(),
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to post comment');
            }

            const newComment = await res.json();
            toast.success('Comment posted!');
            setContent('');
            // Keep displayName for next comment
            onCommentAdded(newComment);
        } catch (error) {
            console.error('Error posting comment:', error);
            toast.error(error.message || 'Failed to post comment');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Loading...
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Input
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={50}
                    required
                />
            </div>
            <div>
                <Textarea
                    placeholder="Write your comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    required
                />
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                    {loading ? 'Posting...' : 'Post Comment'}
                </Button>
            </div>
        </form>
    );
}
