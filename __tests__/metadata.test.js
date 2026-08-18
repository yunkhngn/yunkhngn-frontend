import { createMetadata, createOgImageUrl } from '@/lib/seo/createMetadata';

describe('createMetadata SEO helper', () => {
  test('generates correct OG image URL', () => {
    const url = createOgImageUrl({
      title: 'About me — Khoa Nguyễn',
      description: 'Test description',
      type: 'page',
    });

    expect(url).toContain('https://yunkhngn.dev/api/og');
    expect(url).toContain('title=About+me+%E2%80%94+Khoa+Nguy%E1%BB%85n');
    expect(url).toContain('type=page');
    expect(url).toContain('description=Test+description');
  });

  test('creates complete metadata object with openGraph and twitter images', () => {
    const metadata = createMetadata({
      title: 'About me',
      description: 'The story behind yun.khngn',
      path: '/about',
      ogType: 'page',
      type: 'profile',
    });

    expect(metadata.title).toBe('About me');
    expect(metadata.description).toBe('The story behind yun.khngn');
    expect(metadata.alternates.canonical).toBe('https://yunkhngn.dev/about');

    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph.title).toBe('About me — Khoa Nguyễn');
    expect(metadata.openGraph.url).toBe('https://yunkhngn.dev/about');
    expect(metadata.openGraph.type).toBe('profile');
    expect(metadata.openGraph.images).toHaveLength(1);
    expect(metadata.openGraph.images[0].url).toContain('https://yunkhngn.dev/api/og');
    expect(metadata.openGraph.images[0].width).toBe(1200);
    expect(metadata.openGraph.images[0].height).toBe(630);

    expect(metadata.twitter).toBeDefined();
    expect(metadata.twitter.card).toBe('summary_large_image');
    expect(metadata.twitter.images).toHaveLength(1);
    expect(metadata.twitter.images[0]).toBe(metadata.openGraph.images[0].url);
  });
});
