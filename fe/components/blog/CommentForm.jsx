import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function CommentForm({ blogId, onCommentAdded }) {
    const { user, signInAnonymously } = useAuth();
    const [content, setContent] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);

    const isAdmin = user?.role === 'ADMIN';

    // Load saved displayName from localStorage
    useEffect(() => {
        if (isAdmin) {
            setDisplayName(user.displayName || 'Administrator');
            return;
        }

        const savedName = localStorage.getItem('commentDisplayName');
        if (savedName) {
            setDisplayName(savedName);
        }
    }, [isAdmin, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            toast.error('Please enter a comment');
            return;
        }

        if (!displayName.trim() && !isAdmin) {
            toast.error('Please enter your name');
            return;
        }

        // ... (rest of the function)

        let currentUser = user;

        setLoading(true);
        try {
            if (!currentUser) {
                // Sign in anonymously if not logged in
                try {
                    const result = await signInAnonymously();
                    currentUser = result.user;
                } catch (error) {
                    console.error('Anonymous auth failed:', error);
                    toast.error('Failed to initialize session');
                    setLoading(false);
                    return;
                }
            }

            const token = await currentUser.getIdToken();
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

            // Save displayName to localStorage for next time
            localStorage.setItem('commentDisplayName', displayName.trim());

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



    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!isAdmin && (
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
            )}
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
