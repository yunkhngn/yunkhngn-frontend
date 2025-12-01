import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import { Flag } from 'lucide-react';

export default function ReportModal({ commentId, onReport }) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) {
            return;
        }

        setLoading(true);
        try {
            await onReport(commentId, reason.trim());
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
                            Please describe why you're reporting this comment.
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
