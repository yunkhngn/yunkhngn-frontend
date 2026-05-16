import { NextResponse } from 'next/server';

export function proxy() {
  const response = NextResponse.next();

  const apiOrigin =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com https://cdn.jsdelivr.net https://vercel.live https://*.firebasedatabase.app https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "img-src 'self' blob: data: https://res.cloudinary.com https://github.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://cataas.com https://placekitten.com https://cdn.buymeacoffee.com https://lastfm.freetls.fastly.net https://tarot.yunkhngn.dev",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    `connect-src 'self' https://www.google-analytics.com https://api.cloudinary.com https://api.github.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://yunkhngn.dev https://api.yunkhngn.dev wss://api.yunkhngn.dev wss://*.firebasedatabase.app https://*.firebasedatabase.app ${apiOrigin} https://vercel.live`,
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://*.firebaseapp.com https://*.spotify.com https://*.music.apple.com https://soundcloud.com https://w.soundcloud.com https://bandcamp.com https://vercel.live",
    "worker-src 'self' blob:",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)',
  ],
};
