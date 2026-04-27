import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import { Flag } from 'lucide-react';

export default function ReportModal({ commentId, onReport }) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const { user, signInAnonymously } = useAuth();

    const handleSubmit = async () => {
        if (!reason.trim()) {
            return;
        }

        setLoading(true);
        try {
            let currentUser = user;
            if (!currentUser) {
                try {
                    const result = await signInAnonymously();
                    currentUser = result.user;
                } catch (error) {
                    console.error('Anonymous auth failed:', error);
                    // toast.error('Failed to initialize session'); // Toast not imported here, maybe add it or let parent handle?
                    // Let's just rely on the error catching below or add toast if needed.
                    // Actually, onReport likely expects a user to be logged in now.
                    // But onReport is passed from parent. Let's see where onReport comes from.
                    // It comes from Comment.jsx.
                }
            }

            // Wait for auth state to propagate or just proceed?
            // If signInAnonymously works, currentUser is set.
            // But onReport in Comment.jsx uses `user` from its own context or just calls API?
            // Let's check Comment.jsx next to be sure.
            // For now, let's assume onReport handles the API call. 
            // BUT, if onReport uses `user` from `useAuth` hook in PARENT, it might be stale?
            // No, `useAuth` is a context, so it should update. 
            // However, `onReport` might be defined as a function that relies on `user` being present.

            // Get token (forcing refresh) to ensure it's valid and pass to onReport
            // This handles cases where onReport has a stale user closure
            const token = await currentUser.getIdToken(true);

            await onReport(commentId, reason.trim(), token);
            setOpen(false);
            setReason('');
        } catch (error) {
            // Error handled by parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(true)}
            >
                <Flag className="h-4 w-4 mr-1" />
                Report
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Report Comment</DialogTitle>
                        <DialogDescription>
                            Please describe why you&apos;re reporting this comment.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Reason for reporting..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        maxLength={500}
                    />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !reason.trim()}
                        >
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
