import { ImageResponse } from 'next/og';

const GITHUB_AVATAR = 'https://github.com/yunkhngn.png';

// Matches site light theme: hsl(0 0% 100%) bg, hsl(232 59% 10%) text
const BG = '#f8f9fc';
const TEXT = '#0d1630';        // hsl(232 59% 10%) approx
const TEXT_MUTED = '#6b7a99';
const BORDER = '#dde3f0';
const ACCENT = '#0d1630';      // same navy, used for tag bg

const TYPE_LABELS = {
  blog: 'Writing',
  project: 'Project',
  page: 'Portfolio',
  journal: 'Journal',
};

async function loadFont() {
  try {
    // Fetch CSS with a desktop UA so Google returns Latin + Vietnamese subsets
    const cssRes = await fetch(
      'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;700&display=swap',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    );
    const css = await cssRes.text();
    const urls = [...css.matchAll(/src: url\((.+?)\) format\('woff2'\)/g)].map(m => m[1]);
    if (!urls.length) return [];

    // Load up to 4 subsets (covers Latin + Vietnamese)
    const buffers = await Promise.all(urls.slice(0, 4).map(u => fetch(u).then(r => r.arrayBuffer())));
    return [
      { name: 'BVP', data: buffers[0], style: 'normal', weight: 400 },
      { name: 'BVP', data: buffers[buffers.length - 1], style: 'normal', weight: 700 },
    ];
  } catch {
    return [];
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title       = searchParams.get('title')       || 'Khoa Nguyễn';
  const type        = searchParams.get('type')        || 'page';
  const description = searchParams.get('description') || 'Software Engineer · Designer · Guitarist';
  const thumbnail   = searchParams.get('thumbnail')   || null;

  const typeLabel   = TYPE_LABELS[type] || 'Portfolio';
  const fonts       = await loadFont();
  const ff          = fonts.length ? 'BVP, sans-serif' : 'sans-serif';

  const shortTitle  = title.length > 58 ? title.slice(0, 55) + '…' : title;
  const shortDesc   = description ? (description.length > 105 ? description.slice(0, 102) + '…' : description) : '';
  const titleSize   = shortTitle.length > 38 ? (thumbnail ? 40 : 52) : (thumbnail ? 48 : 64);

  // ─── Tag pill (top-right) ────────────────────────────────────────────────
  const Tag = () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: ACCENT,
        color: '#f8f9fc',
        borderRadius: 6,
        padding: '5px 14px',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontFamily: ff,
      }}
    >
      {typeLabel}
    </div>
  );

  // ─── Author row (bottom-left) ─────────────────────────────────────────────
  const Author = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={GITHUB_AVATAR}
        width={40}
        height={40}
        style={{ borderRadius: '50%', border: `2px solid ${BORDER}` }}
        alt=""
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: TEXT, fontFamily: ff }}>
          Khoa Nguyễn
        </span>
        <span style={{ fontSize: 13, color: TEXT_MUTED, fontFamily: ff }}>
          Software Engineer
        </span>
      </div>
    </div>
  );

  // ─── Layout A: with cover thumbnail ──────────────────────────────────────
  if (thumbnail) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', display: 'flex', background: BG }}>
        {/* Text panel */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '52px 52px 48px 60px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 16, color: TEXT_MUTED, fontFamily: ff, fontWeight: 400 }}>
              yunkhngn.dev
            </span>
            <Tag />
          </div>

          {/* Title + desc */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 700,
                color: TEXT,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                fontFamily: ff,
              }}
            >
              {shortTitle}
            </div>
            {shortDesc && (
              <div style={{ fontSize: 17, color: TEXT_MUTED, lineHeight: 1.55, fontFamily: ff }}>
                {shortDesc}
              </div>
            )}
          </div>

          <Author />
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: BORDER, flexShrink: 0 }} />

        {/* Image panel */}
        <div style={{ width: 400, flexShrink: 0, display: 'flex', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            width={400}
            height={630}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            alt=""
          />
        </div>
      </div>,
      { width: 1200, height: 630, fonts },
    );
  }

  // ─── Layout B: no thumbnail ───────────────────────────────────────────────
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px 80px 52px',
        background: BG,
        fontFamily: ff,
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 17, color: TEXT_MUTED, fontWeight: 400 }}>yunkhngn.dev</span>
        <Tag />
      </div>

      {/* Title + separator + desc */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div
          style={{
            width: 48,
            height: 3,
            background: ACCENT,
            borderRadius: 2,
            marginBottom: 24,
          }}
        />
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 700,
            color: TEXT,
            lineHeight: 1.18,
            letterSpacing: '-0.025em',
            maxWidth: 880,
          }}
        >
          {shortTitle}
        </div>
        {shortDesc && (
          <div
            style={{
              fontSize: 22,
              color: TEXT_MUTED,
              lineHeight: 1.5,
              marginTop: 20,
              maxWidth: 760,
            }}
          >
            {shortDesc}
          </div>
        )}
      </div>

      <Author />
    </div>,
    { width: 1200, height: 630, fonts },
  );
}
