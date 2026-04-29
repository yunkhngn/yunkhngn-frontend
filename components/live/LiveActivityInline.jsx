'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/client';
import Image from 'next/image';
import { Disc3 } from 'lucide-react';
import { MarqueeText } from '@/components/ui/MarqueeText';

export default function LiveActivityInline() {
    const [codingData, setCodingData] = useState(null);
    const [musicData, setMusicData] = useState(null);
    const [loadingCoding, setLoadingCoding] = useState(true);
    const [loadingMusic, setLoadingMusic] = useState(true);

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
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const getCodingText = () => {
        if (loadingCoding) return "Fetching...";
        if (!codingData) return "No recent activity";
        
        let actionText = "Active on";
        if (codingData.isPrivate) {
            actionText = "Contributed to";
        } else {
            switch (codingData.type) {
                case 'PushEvent': actionText = "Pushed to"; break;
                case 'PullRequestEvent': actionText = "Opened PR on"; break;
                case 'WatchEvent': actionText = "Starred"; break;
                case 'CreateEvent': actionText = "Created"; break;
                case 'IssuesEvent': actionText = "Issue on"; break;
            }
        }
        
        return `${actionText} ${codingData.repo.replace('yunkhngn/', '')}`;
    };

    const isCodingActive = codingData && (new Date() - new Date(codingData.timestamp)) < 10 * 60 * 1000;

    return (
        <div className="flex flex-col gap-2 mt-2 w-full max-w-[400px]">
            <div className="flex items-center gap-3 lg:justify-start w-full overflow-hidden">
                <span className="text-green-400 shrink-0">coding:</span>
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <MarqueeText className="text-gray-300 flex-1 min-w-0">
                        {getCodingText()}
                    </MarqueeText>
                    {isCodingActive && (
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3 lg:justify-start w-full overflow-hidden">
                <span className="text-pink-400 shrink-0">listening:</span>
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {!loadingMusic && musicData ? (
                        <>
                            {musicData.art ? (
                                <div className={`relative w-5 h-5 shrink-0 rounded-[4px] overflow-hidden border border-white/10 ${musicData.isNowPlaying ? 'animate-spin-slow' : ''}`}>
                                    <Image src={musicData.art} alt="cover" fill sizes="20px" className="object-cover" />
                                </div>
                            ) : (
                                <div className="w-5 h-5 shrink-0 rounded-[4px] bg-muted/50 flex items-center justify-center border border-white/10">
                                    <Disc3 className={`w-3 h-3 text-muted-foreground ${musicData.isNowPlaying ? 'animate-spin' : ''}`} />
                                </div>
                            )}
                            <MarqueeText className="text-gray-300 flex-1 min-w-0" title={`${musicData.name} - ${musicData.artist}`}>
                                {musicData.name} <span className="text-gray-500">({musicData.artist})</span>
                            </MarqueeText>
                            {musicData.isNowPlaying && (
                                <span className="relative flex h-2 w-2 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-gray-300 truncate flex-1 min-w-0">{loadingMusic ? "Fetching..." : "Not playing anything"}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
