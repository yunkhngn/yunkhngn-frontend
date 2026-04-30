export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/og/'],
        disallow: '/admin/',
      },
    ],
    sitemap: 'https://yunkhngn.dev/sitemap.xml',
  };
}
