import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    unoptimized: true,
    domains: [
      'res.cloudinary.com', 
      'github.com', 
      'avatars.githubusercontent.com', 
      'lh3.googleusercontent.com',
      'cataas.com',
      'placekitten.com',
      'cdn.buymeacoffee.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cataas.com',
        pathname: '/cat',
      },
      {
        protocol: 'https',
        hostname: 'placekitten.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.buymeacoffee.com',
        pathname: '/**',
      }
    ],
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' blob: data: https://res.cloudinary.com https://github.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://cataas.com https://placekitten.com https://cdn.buymeacoffee.com;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://www.google-analytics.com https://api.cloudinary.com https://api.github.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'};
              frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://*.firebaseapp.com https://*.spotify.com https://*.music.apple.com https://soundcloud.com https://w.soundcloud.com https://bandcamp.com;
            `.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'highlight.js/lib/core': path.resolve(__dirname, 'node_modules/highlight.js/lib/core.js'),
    };
    return config;
  },
};

export default nextConfig;
