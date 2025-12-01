```javascript
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import ReportModal from './ReportModal';

export default function Comment({ comment, onUpdate, onDelete }) {
    const { user } = useAuth();
    const [voting, setVoting] = useState(false);
    const [userVote, setUserVote] = useState(null);

    const isOwner = user && comment.uid === user.uid;
    const isAdmin = user && user.role === 'ADMIN';

    const handleVote = async (value) => {
        if (!user) {
            toast.error('Please sign in to vote');
            return;
        }

        setVoting(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${ process.env.NEXT_PUBLIC_API_URL } /comments/${ comment.id }/vote`, {
method: 'POST',
    headers: {
    'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
                },
body: JSON.stringify({ value }),
            });

if (!res.ok) throw new Error('Failed to vote');

const updatedComment = await res.json();
onUpdate(updatedComment);

// Toggle vote state
if (userVote === value) {
    setUserVote(null);
} else {
    setUserVote(value);
}
        } catch (error) {
    console.error('Error voting:', error);
    toast.error('Failed to vote');
} finally {
    setVoting(false);
}
    };

const handleReport = async (commentId, reason) => {
    if (!user) {
        toast.error('Please sign in to report');
        throw new Error('Not signed in');
    }

    try {
        const token = await user.getIdToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ reason }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to report');
        }

        toast.success('Comment reported');
    } catch (error) {
        console.error('Error reporting:', error);
        toast.error(error.message || 'Failed to report comment');
        throw error;
    }
};

const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
        const token = await user.getIdToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${comment.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!res.ok) throw new Error('Failed to delete');

        toast.success('Comment deleted');
        onDelete(comment.id);
    } catch (error) {
        console.error('Error deleting:', error);
        toast.error('Failed to delete comment');
    }
};

return (
    <div className="border-b border-border pb-4 last:border-0">
        <div className="flex items-start justify-between mb-2">
            <div>
                <span className="font-medium">{comment.displayName}</span>
                <span className="text-sm text-muted-foreground ml-2">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
            </div>
            <div className="flex gap-2">
                {(isOwner || isAdmin) && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        className="h-8 w-8"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>

        <p className="text-foreground mb-3 whitespace-pre-wrap">{comment.content}</p>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(1)}
                    disabled={voting}
                    className={userVote === 1 ? 'text-primary' : ''}
                >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {comment.upvoteCount || 0}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(-1)}
                    disabled={voting}
                    className={userVote === -1 ? 'text-primary' : ''}
                >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    {comment.downvoteCount || 0}
                </Button>
            </div>

            {!isOwner && (
                <ReportModal commentId={comment.id} onReport={handleReport} />
            )}
        </div>
    </div>
);
}
```
