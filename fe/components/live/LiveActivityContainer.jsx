import { useState, useEffect } from 'react';
import CodingActivity from './CodingActivity';
import MusicPlayer from './MusicPlayer';
import api from '@/lib/api/client';

export default function LiveActivityContainer() {
    const [codingData, setCodingData] = useState(null);
    const [musicData, setMusicData] = useState(null);
    const [loadingCoding, setLoadingCoding] = useState(true);
    const [loadingMusic, setLoadingMusic] = useState(true);

    useEffect(() => {
        const fetchCoding = async () => {
            try {
                // Assuming GithubController is at /admin/github or we made a public alias
                // Based on previous step, it's at /admin/github/latest-activity
                // But typically frontend API client might have base URL logic.
                // client.js uses NEXT_PUBLIC_API_URL.
                // The endpoint I added was @Controller('admin/github') -> @Get('latest-activity')
                // So path is /admin/github/latest-activity
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

        // Optional: Poll every 60s
        const interval = setInterval(() => {
            fetchCoding();
            fetchMusic();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // Don't render anything if both fail or empty
    if (!loadingCoding && !codingData && !loadingMusic && !musicData) return null;

    return (
        <div className="fixed bottom-4 left-4 z-40 flex flex-col gap-3 items-start">
            <CodingActivity activity={codingData} loading={loadingCoding} />
            <MusicPlayer track={musicData} loading={loadingMusic} />
        </div>
    );
}
