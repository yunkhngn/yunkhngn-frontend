import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Comment from './Comment';
import CommentForm from './CommentForm';
import { useAuth } from '@/contexts/AuthContext';

export default function CommentSection({ blogId, projectId }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

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
                            />
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
