import { Music, Disc3, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MarqueeText } from '../ui/MarqueeText';

export default function MusicPlayer({ track, loading }) {
    if (loading) {
        return (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 w-64">
                <div className="w-10 h-10 rounded-md bg-muted animate-pulse" />
                <div className="space-y-1 flex-1">
                    <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-2 w-16 bg-muted animate-pulse rounded" />
                </div>
            </div>
        );
    }

    if (!track) return null;

    const { name, artist, art, isNowPlaying, url } = track;

    return (
        <div
            className="group flex items-center gap-3 p-2 pr-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 hover:bg-card/50 transition-all hover:scale-[1.02] w-64 overflow-hidden relative"
        >
            {/* Background Blur Effect */}
            {art && (
                <div
                    className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity z-0 blur-xl"
                    style={{ backgroundImage: `url(${art})`, backgroundSize: 'cover' }}
                />
            )}

            <div className="relative w-10 h-10 shrink-0 z-10">
                {art ? (
                    <div className={`relative w-full h-full rounded-lg overflow-hidden border border-border/50 ${isNowPlaying ? 'animate-spin-slow' : ''}`}>
                        <Image src={art} alt={name} fill sizes="40px" className="object-cover" />
                    </div>
                ) : (
                    <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center border border-border/50">
                        <Disc3 className={`h-5 w-5 text-muted-foreground ${isNowPlaying ? 'animate-spin' : ''}`} />
                    </div>
                )}

                {/* Equalizer Overlay */}
                {isNowPlaying && (
                    <div className="absolute bottom-0 right-0 left-0 h-4 flex items-end justify-center gap-[1px] bg-gradient-to-t from-black/60 to-transparent p-1">
                        {[1, 2, 3, 4].map((i) => (
                            <motion.div
                                key={i}
                                className="w-1 bg-green-500/80 rounded-t-sm"
                                animate={{ height: [4, 12, 6, 14, 4] }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    delay: i * 0.1,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col min-w-0 flex-1 z-10 overflow-hidden">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                    {isNowPlaying ? "Vibing to" : "Last played"}
                    {isNowPlaying && (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    )}
                </span>
                <MarqueeText className="text-xs font-bold text-foreground w-full group-hover:text-primary transition-colors">
                    {name}
                </MarqueeText>
                <MarqueeText className="text-[10px] text-muted-foreground w-full">
                    {artist}
                </MarqueeText>
            </div>

            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="z-10 p-1 rounded-full hover:bg-background/20 transition-colors"
                title="Open in Spotify/Apple Music"
            >
                <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-foreground/50" />
            </a>
        </div>
    );
}
