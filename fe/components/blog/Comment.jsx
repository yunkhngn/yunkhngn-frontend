import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import ReportModal from './ReportModal';
import DeleteCommentModal from './DeleteCommentModal';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

export default function Comment({ comment, onUpdate, onDelete }) {
    const { user } = useAuth();
    const [voting, setVoting] = useState(false);
    const [userVote, setUserVote] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const isOwner = user && comment.uid === user.uid;
    const isAdmin = user && user.role === 'ADMIN';
    const isCommentAdmin = comment.user?.role === 'ADMIN';

    const handleVote = async (value) => {
        if (!user) {
            toast.error('Please sign in to vote');
            return;
        }

        setVoting(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${comment.id}/vote`, {
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
        setDeleting(true);
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
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="border-b border-border pb-4 last:border-0 flex gap-4">
            <Avatar className="h-10 w-10">
                {isCommentAdmin && comment.user?.avatarUrl && (
                    <AvatarImage src={comment.user.avatarUrl} alt={comment.displayName} />
                )}
                <AvatarFallback className={isCommentAdmin ? "bg-primary/10 text-primary" : ""}>
                    {comment.displayName?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{comment.displayName}</span>
                            {isCommentAdmin && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                                    AUTHOR
                                </span>
                            )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {(isOwner || isAdmin) && (
                            <DeleteCommentModal onConfirm={handleDelete} loading={deleting} />
                        )}
                    </div>
                </div>

                <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>

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
        </div>
    );
}