'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/client';
import Image from 'next/image';
import {
  Disc3,
  Github,
  Headphones,
  Code2,
  Gamepad2,
  CloudSun,
} from 'lucide-react';
import { MarqueeText } from '@/components/ui/MarqueeText';

export default function LiveActivityInline() {
  const [codingData, setCodingData] = useState(null);
  const [musicData, setMusicData] = useState(null);
  const [wakatimeData, setWakatimeData] = useState(null);
  const [steamData, setSteamData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  const [loadingCoding, setLoadingCoding] = useState(true);
  const [loadingMusic, setLoadingMusic] = useState(true);
  const [loadingWakatime, setLoadingWakatime] = useState(true);
  const [loadingSteam, setLoadingSteam] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 1. GitHub Coding Activity
      api.get('/admin/github/latest-activity')
        .then((res) => setCodingData(res.data))
        .catch((err) => console.error('Failed to fetch GitHub activity', err))
        .finally(() => setLoadingCoding(false));

      // 2. Last.fm Listening
      api.get('/lastfm/playing')
        .then((res) => setMusicData(res.data))
        .catch((err) => console.error('Failed to fetch Last.fm activity', err))
        .finally(() => setLoadingMusic(false));

      // 3. WakaTime Coding Duration
      api.get('/wakatime/today')
        .then((res) => setWakatimeData(res.data))
        .catch((err) => console.error('Failed to fetch WakaTime activity', err))
        .finally(() => setLoadingWakatime(false));

      // 4. Steam Gaming
      api.get('/steam/now-playing')
        .then((res) => setSteamData(res.data))
        .catch((err) => console.error('Failed to fetch Steam activity', err))
        .finally(() => setLoadingSteam(false));

      // 5. Hanoi Weather
      api.get('/weather/hanoi')
        .then((res) => setWeatherData(res.data))
        .catch((err) => console.error('Failed to fetch weather', err))
        .finally(() => setLoadingWeather(false));
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getCodingText = () => {
    if (loadingCoding) return 'Fetching...';
    if (!codingData) return 'No recent activity';

    let actionText = 'Active on';
    if (codingData.isPrivate) {
      actionText = 'Contributed to';
    } else {
      switch (codingData.type) {
        case 'PushEvent':
          actionText = 'Pushed to';
          break;
        case 'PullRequestEvent':
          actionText = 'Opened PR on';
          break;
        case 'WatchEvent':
          actionText = 'Starred';
          break;
        case 'CreateEvent':
          actionText = 'Created';
          break;
        case 'IssuesEvent':
          actionText = 'Issue on';
          break;
      }
    }

    return `${actionText} ${codingData.repo.replace('yunkhngn/', '')}`;
  };

  const getWakaTimeText = () => {
    if (loadingWakatime) return 'Fetching...';
    if (!wakatimeData || !wakatimeData.text) return 'Not coded today';
    return `${wakatimeData.text} today`;
  };

  const getSteamText = () => {
    if (loadingSteam) return 'Fetching...';
    if (!steamData || !steamData.name) return 'Not playing anything';
    return `Playing ${steamData.name}`;
  };

  const getWeatherText = () => {
    if (loadingWeather) return 'Fetching...';
    if (!weatherData) return 'Unknown weather';
    return `${weatherData.temp}°C, ${weatherData.condition} in Hanoi`;
  };

  const isCodingActive =
    codingData &&
    new Date() - new Date(codingData.timestamp) < 10 * 60 * 1000;

  return (
    <div className="flex flex-col gap-2 mt-2 w-full max-w-[400px]">
      {/* 1. GitHub Coding Activity */}
      <div className="flex items-center gap-3 lg:justify-start w-full overflow-hidden">
        <div className="flex items-center gap-1.5 text-green-400 shrink-0">
          coding <Github className="w-4 h-4" />:
        </div>
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <MarqueeText className="text-gray-300 min-w-0">
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

      {/* 2. Last.fm Listening */}
      <div className="flex items-center gap-3 lg:justify-start w-full overflow-hidden">
        <div className="flex items-center gap-1.5 text-pink-400 shrink-0">
          listening <Headphones className="w-4 h-4" />:
        </div>
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {!loadingMusic && musicData ? (
            <>
              {musicData.art ? (
                <div
                  className={`relative w-5 h-5 shrink-0 rounded-[4px] overflow-hidden border border-white/10 ${
                    musicData.isNowPlaying ? 'animate-spin-slow' : ''
                  }`}
                >
                  <Image
                    src={musicData.art}
                    alt="cover"
                    fill
                    sizes="20px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-5 h-5 shrink-0 rounded-[4px] bg-muted/50 flex items-center justify-center border border-white/10">
                  <Disc3
                    className={`w-3 h-3 text-muted-foreground ${
                      musicData.isNowPlaying ? 'animate-spin' : ''
                    }`}
                  />
                </div>
              )}
              <MarqueeText
                className="text-gray-300 min-w-0"
                title={`${musicData.name} - ${musicData.artist}`}
              >
                {musicData.name}{' '}
                <span className="text-gray-500">({musicData.artist})</span>
              </MarqueeText>
              {musicData.isNowPlaying && (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-300 truncate flex-1 min-w-0">
              {loadingMusic ? 'Fetching...' : 'Not playing anything'}
            </span>
          )}
        </div>
      </div>

      {/* 3. WakaTime Coding Time */}
      <div className="flex items-center gap-3 lg:justify-start w-full overflow-hidden">
        <div className="flex items-center gap-1.5 text-blue-400 shrink-0">
          today-code <Code2 className="w-4 h-4" />:
        </div>
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <MarqueeText className="text-gray-300 min-w-0">
            {getWakaTimeText()}
          </MarqueeText>
          {wakatimeData?.text && (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          )}
        </div>
      </div>

      {/* 4. Steam Gaming */}
      <div className="flex items-center gap-3 lg:justify-start w-full overflow-hidden">
        <div className="flex items-center gap-1.5 text-red-400 shrink-0">
          gaming <Gamepad2 className="w-4 h-4" />:
        </div>
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <MarqueeText className="text-gray-300 min-w-0">
            {getSteamText()}
          </MarqueeText>
          {steamData?.name && (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </div>
      </div>

      {/* 5. Hanoi Weather */}
      <div className="flex items-center gap-3 lg:justify-start w-full overflow-hidden">
        <div className="flex items-center gap-1.5 text-yellow-400 shrink-0">
          weather <CloudSun className="w-4 h-4" />:
        </div>
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <MarqueeText className="text-gray-300 min-w-0">
            {getWeatherText()}
          </MarqueeText>
        </div>
      </div>
    </div>
  );
}
