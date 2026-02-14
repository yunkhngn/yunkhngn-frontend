import { GitCommit, GitPullRequest, Star, Loader2, Github } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

export default function CodingActivity({ activity, loading, error }) {
    if (loading) {
        return (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 w-fit">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </div>
        );
    }

    if (error || !activity) {
        return null;
        // Or render a "Clean Code" state?
        // return (
        //     <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 w-fit">
        //         <Github className="h-5 w-5 text-muted-foreground" />
        //         <span className="text-xs text-muted-foreground">No recent activity</span>
        //     </div>
        // )
    }

    const { type, repo, timestamp, url } = activity;
    const date = new Date(timestamp);
    const timeAgo = formatDistanceToNow(date, { addSuffix: true });

    // Pulse if active in last 30 mins
    const isActiveNow = (new Date() - date) < 30 * 60 * 1000;

    let Icon = Github;
    let actionText = "Active on";

    switch (type) {
        case 'PushEvent':
            Icon = GitCommit;
            actionText = "Pushed to";
            break;
        case 'PullRequestEvent':
            Icon = GitPullRequest;
            actionText = "Opened PR on";
            break;
        case 'WatchEvent':
            Icon = Star;
            actionText = "Starred";
            break;
        default:
            Icon = Github;
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 p-3 pr-4 rounded-2xl bg-card/30 backdrop-blur-md border border-border/40 hover:bg-card/50 transition-all hover:scale-[1.02] w-fit"
        >
            <div className="relative">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border/50">
                    <Icon className="h-4 w-4 text-foreground/80" />
                </div>
                {isActiveNow && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                )}
            </div>

            <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                    {actionText}
                    {isActiveNow && <span className="text-green-500 font-bold">• Live</span>}
                </span>
                <span className="text-xs font-semibold text-foreground truncate max-w-[150px] group-hover:text-primary transition-colors">
                    {repo}
                </span>
            </div>

            <span className="text-[10px] text-muted-foreground/50 ml-2 whitespace-nowrap">
                {timeAgo}
            </span>
        </a>
    );
}
