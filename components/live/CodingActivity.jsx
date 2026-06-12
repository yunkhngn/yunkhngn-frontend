import { GitCommit, GitPullRequest, Star, Loader2, Github, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { m as motion } from 'framer-motion';

export default function CodingActivity({ activity, loading, error }) {
    if (loading) {
        return (
            <div className="flex items-center gap-3 p-2 pr-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 w-64 h-[58px]">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </div>
        );
    }

    if (error || !activity) {
        return null;
    }

    const { type, repo, timestamp, url, isPrivate } = activity;
    const date = new Date(timestamp);
    const timeAgo = formatDistanceToNow(date, { addSuffix: true });

    // Pulse if active in last 10 mins
    const isActiveNow = (new Date() - date) < 10 * 60 * 1000;

    let Icon = Github;
    let actionText = "Active on";

    if (isPrivate) {
        actionText = "Contributed to";
    } else {
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
            case 'CreateEvent':
                Icon = GitCommit; // Or another icon
                actionText = "Created";
                break;
            case 'IssuesEvent':
                Icon = GitCommit; // Or Issue icon
                actionText = "Issue on";
                break;
            default:
                Icon = Github;
        }
    }

    return (
        <div
            className="group flex items-center gap-3 p-2 pr-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 hover:bg-card/50 transition-all hover:scale-[1.02] w-64"
        >
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border/50">
                    <Icon className="h-5 w-5 text-foreground/80" />
                </div>
                {isActiveNow && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                )}
            </div>

            <div className="flex flex-col overflow-hidden flex-1">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                    {actionText}
                    {isActiveNow && <span className="text-green-500 font-bold">• Live</span>}
                </span>
                <span className="text-xs font-semibold text-foreground truncate w-full group-hover:text-primary transition-colors">
                    {repo}
                </span>
                <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap">
                    {timeAgo}
                </span>
            </div>

            {url && (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="z-10 p-1 rounded-full hover:bg-background/20 transition-colors"
                    title="View on GitHub"
                >
                    <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-foreground/50" />
                </a>
            )}
        </div>
    );
}
