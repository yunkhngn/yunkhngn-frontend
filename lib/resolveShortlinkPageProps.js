import { apiFetch } from '@/lib/api/server';

export async function resolveShortlinkPageProps(code) {
  const { data, error } = await apiFetch(`/shortlinks/resolve/${code}`);
  if (error || !data?.targetUrl) return null;

  const isValidProtocol = /^https?:\/\//i.test(data.targetUrl);
  if (!isValidProtocol) return null;

  let meta = {
    title: 'Redirecting...',
    description: `Redirecting to ${data.targetUrl}`,
    image: '',
    url: data.targetUrl,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const targetRes = await fetch(data.targetUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'YunkhngnBot/1.0 (+https://yunkhngn.dev)' },
    });
    clearTimeout(timeoutId);

    if (targetRes.ok) {
      const html = await targetRes.text();
      const titleMatch =
        html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
        html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
      const descMatch =
        html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) ||
        html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
      const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

      if (titleMatch) meta.title = titleMatch[1];
      if (descMatch) meta.description = descMatch[1];
      if (imageMatch) meta.image = imageMatch[1];
    }
  } catch (e) {
    console.error('Failed to fetch target metadata', e);
  }

  return {
    targetUrl: data.targetUrl,
    code,
    meta,
  };
}
