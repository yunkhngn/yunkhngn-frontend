import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { readNestJson } from '@/lib/api/readJson';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CommentForm = forwardRef(({ blogId, projectId, onCommentAdded }, ref) => {
    const { user, signInAnonymously } = useAuth();
    const [content, setContent] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);

    const isAdmin = user?.role === 'ADMIN';

    useImperativeHandle(ref, () => ({
        replyTo: (name) => {
            const safeName = name.replace(/\s+/g, '_');
            const mention = `@${safeName} `;
            setContent(prev => mention + prev);
            // Optional: Focus logic could go here if we had a ref to the Textarea
        }
    }));

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

        // Check for multiple mentions (only allow 1 mention per comment)
        const mentions = content.match(/@\w+/g) || [];
        if (mentions.length > 1) {
            toast.error('You can only mention one person per comment');
            return;
        }

        if (!displayName.trim() && !isAdmin) {
            toast.error('Please enter your name');
            return;
        }

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

            const token = await currentUser.getIdToken(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    blogId,
                    projectId,
                    content: content.trim(),
                    displayName: displayName.trim(),
                }),
            });

            if (!res.ok) {
                const error = await readNestJson(res);
                throw new Error(error.message || 'Failed to post comment');
            }

            const newComment = await readNestJson(res);

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
                        aria-label="Your name"
                    />
                </div>
            )}
            <div>
                <Textarea
                    placeholder="Write your comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    maxLength={200}
                    required
                    id="comment-textarea"
                />
                <div className="flex justify-end mt-1">
                    <span className={`text-xs ${content.length >= 500 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {content.length}/200
                    </span>
                </div>
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                    {loading ? 'Posting...' : 'Post Comment'}
                </Button>
            </div>
        </form>
    );
});

CommentForm.displayName = 'CommentForm';

export default CommentForm;
