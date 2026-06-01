import { ImageResponse } from 'next/og';

const GITHUB_AVATAR = 'https://github.com/yunkhngn.png';

const BG = '#f9fafb';
const TEXT = '#0d1526';
const TEXT_MUTED = '#64748b';
const BORDER = '#e2e8f0';
const BADGE_BG = '#f1f5f9';

const TYPE_LABELS = {
  blog: 'Writing',
  project: 'Project',
  page: 'Portfolio',
  journal: 'Journal',
};

async function loadFont() {
  try {
    const cssRes = await fetch(
      'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    );
    const css = await cssRes.text();
    const urls = [...css.matchAll(/src: url\((.+?)\) format\('woff2'\)/g)].map(m => m[1]);
    if (!urls.length) return null;
    // Load regular (400) + bold (700) — pick last two distinct
    const fontData = await Promise.all(
      urls.slice(0, 2).map(url => fetch(url).then(r => r.arrayBuffer()))
    );
    return fontData;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Khoa Nguyễn';
  const type = searchParams.get('type') || 'page';
  const description = searchParams.get('description') || 'Software Engineer · Designer · Guitarist';
  const thumbnail = searchParams.get('thumbnail') || null;

  const typeLabel = TYPE_LABELS[type] || 'Portfolio';

  const fontDataArray = await loadFont();
  const fonts = fontDataArray
    ? [
        { name: 'BeVietnamPro', data: fontDataArray[0], style: 'normal', weight: 400 },
        { name: 'BeVietnamPro', data: fontDataArray[1] ?? fontDataArray[0], style: 'normal', weight: 700 },
      ]
    : [];

  const fontFamily = fonts.length ? 'BeVietnamPro, sans-serif' : 'sans-serif';

  const hasThumbnail = !!thumbnail;
  const truncatedTitle = title.length > 60 ? title.slice(0, 57) + '...' : title;
  const truncatedDesc = description ? (description.length > 110 ? description.slice(0, 107) + '...' : description) : null;
  const titleSize = truncatedTitle.length > 40 ? 44 : 52;

  return new ImageResponse(
    hasThumbnail ? (
      // Layout: text left + image right
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: BG,
          fontFamily,
        }}
      >
        {/* Left panel */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '52px 56px',
            borderRight: `1px solid ${BORDER}`,
          }}
        >
          {/* Top: domain + badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 18, color: TEXT_MUTED, fontWeight: 400, letterSpacing: '0.01em' }}>
              yunkhngn.dev
            </span>
            <span
              style={{
                fontSize: 13,
                color: TEXT_MUTED,
                background: BADGE_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                padding: '4px 12px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {typeLabel}
            </span>
          </div>

          {/* Middle: title + desc */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 700,
                color: TEXT,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              {truncatedTitle}
            </div>
            {truncatedDesc && (
              <div
                style={{
                  fontSize: 18,
                  color: TEXT_MUTED,
                  lineHeight: 1.5,
                  fontWeight: 400,
                }}
              >
                {truncatedDesc}
              </div>
            )}
          </div>

          {/* Bottom: avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={GITHUB_AVATAR}
              width={40}
              height={40}
              style={{ borderRadius: '50%', border: `2px solid ${BORDER}` }}
              alt="avatar"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Khoa Nguyễn</span>
              <span style={{ fontSize: 14, color: TEXT_MUTED }}>Software Engineer</span>
            </div>
          </div>
        </div>

        {/* Right panel: cover image */}
        <div style={{ width: 420, display: 'flex', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            width={420}
            height={630}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            alt=""
          />
        </div>
      </div>
    ) : (
      // Layout: no image — full width, clean type-only
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 80px',
          background: BG,
          fontFamily,
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 18, color: TEXT_MUTED, fontWeight: 400 }}>yunkhngn.dev</span>
          <span
            style={{
              fontSize: 13,
              color: TEXT_MUTED,
              background: BADGE_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              padding: '4px 12px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {typeLabel}
          </span>
        </div>

        {/* Center: title + description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
          <div
            style={{
              fontSize: truncatedTitle.length > 40 ? 56 : 68,
              fontWeight: 700,
              color: TEXT,
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
            }}
          >
            {truncatedTitle}
          </div>
          {truncatedDesc && (
            <div
              style={{
                fontSize: 22,
                color: TEXT_MUTED,
                lineHeight: 1.5,
                fontWeight: 400,
              }}
            >
              {truncatedDesc}
            </div>
          )}
        </div>

        {/* Bottom: avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={GITHUB_AVATAR}
            width={44}
            height={44}
            style={{ borderRadius: '50%', border: `2px solid ${BORDER}` }}
            alt="avatar"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: TEXT }}>Khoa Nguyễn</span>
            <span style={{ fontSize: 15, color: TEXT_MUTED }}>Software Engineer</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    },
  );
}
