import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Comment from './Comment';
import CommentForm from './CommentForm';
import { useAuth } from '@/contexts/AuthContext';

export default function CommentSection({ blogId, projectId }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const commentFormRef = useRef(null);

    const fetchComments = useCallback(async () => {
        try {
            const queryParam = blogId ? `blogId=${blogId}` : `projectId=${projectId}`;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments?${queryParam}`);
            if (res.ok) {
                const responseData = await res.json();
                // Handle both paginated and non-paginated responses for backward compatibility
                setComments(responseData.data || responseData);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    }, [blogId, projectId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleCommentAdded = (newComment) => {
        setComments([newComment, ...comments]);
    };

    const handleCommentUpdate = (updatedComment) => {
        setComments(comments.map(c =>
            c.id === updatedComment.id ? updatedComment : c
        ));
    };

    const handleCommentDelete = (commentId) => {
        setComments(comments.filter(c => c.id !== commentId));
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    Loading comments...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Comments ({comments.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <CommentForm
                    ref={commentFormRef}
                    blogId={blogId}
                    projectId={projectId}
                    onCommentAdded={handleCommentAdded}
                />

                <div className="space-y-4">
                    {comments.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No comments yet. Be the first to comment!
                        </p>
                    ) : (
                        comments.map(comment => (
                            <Comment
                                key={comment.id}
                                comment={comment}
                                onUpdate={handleCommentUpdate}
                                onDelete={handleCommentDelete}
                                onReply={(name) => {
                                    commentFormRef.current?.replyTo(name);
                                    document.getElementById('comment-textarea')?.focus();
                                }}
                                onMentionClick={(username) => {
                                    // Find the FIRST (oldest) comment from the mentioned user
                                    const query = username.toLowerCase().replace(/_/g, ' ');

                                    // Filter all comments from this user
                                    const userComments = comments.filter(c => {
                                        const name = c.displayName.toLowerCase();
                                        return name === query ||
                                            name.split(' ')[0] === query ||
                                            name.includes(query);
                                    });

                                    // Get the oldest comment (first in the list, assuming chronological order)
                                    const target = userComments.length > 0 ? userComments[userComments.length - 1] : null;

                                    if (target) {
                                        const el = document.getElementById(`comment-${target.id}`);
                                        if (el) {
                                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            // Add a temporary highlight effect
                                            el.classList.add('bg-primary/5');
                                            setTimeout(() => el.classList.remove('bg-primary/5'), 2000);
                                        }
                                    }
                                }}
                            />
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
