'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/client';
import Image from 'next/image';
import {
  Disc3,
  Github,
  Headphones,
  Clock,
  Gamepad2,
  Cloud,
} from 'lucide-react';
import { MarqueeText } from '@/components/ui/MarqueeText';

const POLL_INTERVAL_MS = 60000;

const WEATHER_EMOJI = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧',
  Drizzle: '🌦',
  Thunderstorm: '⛈',
  Snow: '❄️',
  Mist: '🌫',
  Haze: '🌫',
  Fog: '🌫',
};

export default function LiveActivityInline() {
  const [codingData, setCodingData] = useState(null);
  const [musicData, setMusicData] = useState(null);
  const [wakatimeData, setWakatimeData] = useState(null);
  const [steamData, setSteamData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  const [loadingCoding, setLoadingCoding] = useState(true);
  const [loadingMusic, setLoadingMusic] = useState(true);

  useEffect(() => {
    const safeGet = (path, setter, onFinally) => {
      api
        .get(path)
        .then((res) => setter(res.data))
        .catch(() => setter(null))
        .finally(() => {
          if (onFinally) onFinally();
        });
    };

    const fetchAll = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }
      safeGet('/admin/github/latest-activity', setCodingData, () =>
        setLoadingCoding(false),
      );
      safeGet('/lastfm/playing', setMusicData, () => setLoadingMusic(false));
      safeGet('/wakatime/today', setWakatimeData);
      safeGet('/steam/now-playing', setSteamData);
      safeGet('/weather/hanoi', setWeatherData);
    };

    fetchAll();
    const interval = setInterval(fetchAll, POLL_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchAll();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
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

  const isCodingActive =
    codingData &&
    new Date() - new Date(codingData.timestamp) < 10 * 60 * 1000;

  const weatherEmoji = weatherData
    ? WEATHER_EMOJI[weatherData.condition] ?? '🌡'
    : '';

  return (
    <div className="flex flex-col gap-2 mt-2 w-full max-w-[400px]">
      {/* Weather (hidden when null) */}
      {weatherData && (
        <div className="flex items-center gap-3 lg:justify-start w-full overflow-hidden">
          <div className="flex items-center gap-1.5 text-yellow-400 shrink-0">
            weather <Cloud className="w-4 h-4" />:
          </div>
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <span className="text-gray-300 truncate">
              {weatherData.temp}°C {weatherEmoji} {weatherData.condition}
            </span>
          </div>
        </div>
      )}

      {/* WakaTime (hidden when null) */}
      {wakatimeData && (
        <div className="flex items-center gap-3 lg:justify-start w-full overflow-hidden">
          <div className="flex items-center gap-1.5 text-purple-400 shrink-0">
            wakatime <Clock className="w-4 h-4" />:
          </div>
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <MarqueeText className="text-gray-300 min-w-0">
              {wakatimeData.text} today
              {wakatimeData.top_language ? ` · ${wakatimeData.top_language}` : ''}
            </MarqueeText>
          </div>
        </div>
      )}

      {/* Coding (existing) */}
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

      {/* Listening (existing) */}
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

      {/* Playing / Steam (hidden when not in-game) */}
      {steamData?.name && (
        <div className="flex items-center gap-3 lg:justify-start w-full overflow-hidden">
          <div className="flex items-center gap-1.5 text-orange-400 shrink-0">
            playing <Gamepad2 className="w-4 h-4" />:
          </div>
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <MarqueeText className="text-gray-300 min-w-0">
              {steamData.name}
            </MarqueeText>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
