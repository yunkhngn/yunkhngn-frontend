import { useState, useEffect } from 'react';
import CodingActivity from './CodingActivity';
import MusicPlayer from './MusicPlayer';
import AdminPresenceWidget from '../common/AdminPresenceWidget';
import api from '@/lib/api/client';
import { AnimatePresence, motion } from 'framer-motion';

export default function LiveActivityContainer() {
    const [codingData, setCodingData] = useState(null);
    const [musicData, setMusicData] = useState(null);
    const [loadingCoding, setLoadingCoding] = useState(true);
    const [loadingMusic, setLoadingMusic] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        const fetchCoding = async () => {
            try {
                const res = await api.get('/admin/github/latest-activity');
                setCodingData(res.data);
            } catch (error) {
                console.error("Failed to fetch coding activity", error);
            } finally {
                setLoadingCoding(false);
            }
        };

        const fetchMusic = async () => {
            try {
                const res = await api.get('/lastfm/playing');
                setMusicData(res.data);
            } catch (error) {
                console.error("Failed to fetch music activity", error);
            } finally {
                setLoadingMusic(false);
            }
        };

        fetchCoding();
        fetchMusic();

        const interval = setInterval(() => {
            fetchCoding();
            fetchMusic();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('liveActivityExpanded');
        if (saved !== null) {
            setIsExpanded(JSON.parse(saved));
        }
    }, []);

    const toggleExpanded = () => {
        const newState = !isExpanded;
        setIsExpanded(newState);
        localStorage.setItem('liveActivityExpanded', JSON.stringify(newState));
    };

    // Don't render anything if both fail or empty
    if (!loadingCoding && !codingData && !loadingMusic && !musicData) return null;

    return (
        <div className="fixed bottom-8 left-6 z-50 flex flex-col-reverse items-start gap-4">
            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl border bg-background/40 backdrop-blur-md shadow-sm text-sm text-muted-foreground pointer-events-none select-none">
                    <span>Press</span>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                    <span>to search</span>
                </div>

                <button
                    onClick={toggleExpanded}
                    className={`
                        group flex h-10 w-10 items-center justify-center rounded-full 
                        bg-background/40 backdrop-blur-md border border-border/40 shadow-sm
                        hover:bg-background/60 hover:scale-110 transition-all duration-300
                    `}
                    title={isExpanded ? "Hide activity" : "Show activity"}
                >
                    <div className={`
                        absolute inset-0 rounded-full bg-primary/20 blur-md duration-300 opacity-0
                    `} />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-300 text-foreground/80 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                    >
                        <path d="m18 15-6-6-6 6" />
                    </svg>
                </button>
            </div>

            <AnimatePresence mode="wait">
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, originY: 1 }}
                        animate={{ opacity: 1, scale: 1, y: 0, originY: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, originY: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="flex flex-col gap-3"
                    >
                        <AdminPresenceWidget />
                        <CodingActivity activity={codingData} loading={loadingCoding} />
                        <MusicPlayer track={musicData} loading={loadingMusic} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
