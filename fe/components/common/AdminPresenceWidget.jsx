import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function AdminPresenceWidget() {
    const { isAdminOnline } = useNotification();
    const { user } = useAuth();

    // Don't show to the admin themselves (optional, but requested "only 1 acc" so assume user wants to see it as visitor)
    // Actually, user might want to see it to verify it works. Let's show it to everyone for now.

    if (!isAdminOnline) return null;

    return (
        <div className="flex items-center gap-3 p-2 pr-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 w-64 shadow-sm animate-in fade-in zoom-in duration-300">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Status</span>
                <span className="text-sm font-medium text-foreground">Admin is Online</span>
            </div>
        </div>
    );
}
