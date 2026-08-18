import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  /* config options here */
  reactStrictMode: true,
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
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
      },
      {
        protocol: 'https',
        hostname: 'lastfm.freetls.fastly.net',
        pathname: '/i/u/**'
      },
      {
        protocol: 'https',
        hostname: 'tarot.yunkhngn.dev',
        pathname: '/tarotdeck/**'
      },
      {
        protocol: 'https',
        hostname: 'media.valorant-api.com',
        pathname: '/**'
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
  async rewrites() {
    return [
      {
        source: '/lastfm/widget',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/lastfm/widget`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/tools/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(self)',
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
  turbopack: {},

};

export default nextConfig;
