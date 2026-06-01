import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const GITHUB_AVATAR = 'https://github.com/yunkhngn.png';
const BG = '#FFFFFF';
const TEXT = '#0A0E27';
const MUTED = '#606060';
const BORDER = '#0A0E27';

const LABELS = {
  blog: 'Writing',
  project: 'Project',
  page: 'Portfolio',
  journal: 'Journal'
};

// Font buffers cached globally
let playfairBoldBuffer;
let beVietnamRegularBuffer;
let beVietnamBoldBuffer;
let jetbrainsMonoBuffer;

function toArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function getFonts() {
  if (!playfairBoldBuffer) {
    const fontDir = path.join(process.cwd(), 'public/fonts');
    playfairBoldBuffer = toArrayBuffer(fs.readFileSync(path.join(fontDir, 'PlayfairDisplay-Bold.woff')));
    beVietnamRegularBuffer = toArrayBuffer(fs.readFileSync(path.join(fontDir, 'BeVietnamPro-Regular.woff')));
    beVietnamBoldBuffer = toArrayBuffer(fs.readFileSync(path.join(fontDir, 'BeVietnamPro-Bold.woff')));
    jetbrainsMonoBuffer = toArrayBuffer(fs.readFileSync(path.join(fontDir, 'JetBrainsMono-Regular.woff')));
  }
  return {
    playfairBold: playfairBoldBuffer,
    beVietnamRegular: beVietnamRegularBuffer,
    beVietnamBold: beVietnamBoldBuffer,
    jetbrainsMono: jetbrainsMonoBuffer,
  };
}

async function getBase64Image(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const b64 = Buffer.from(buf).toString('base64');
    return `data:${contentType};base64,${b64}`;
  } catch (error) {
    console.error(`Failed to fetch image: ${url}`, error);
    return url;
  }
}

const PARTICLES = [
  { x: 60, y: 80, size: 2 },
  { x: 140, y: 150, size: 1.5 },
  { x: 90, y: 260, size: 2 },
  { x: 200, y: 90, size: 2 },
  { x: 240, y: 280, size: 1.5 },
  { x: 320, y: 140, size: 2.5 },
  { x: 280, y: 390, size: 2 },
  { x: 150, y: 440, size: 1.5 },
  { x: 380, y: 230, size: 2 },
  { x: 420, y: 80, size: 1.5 },
  { x: 500, y: 290, size: 2 },
  { x: 340, y: 500, size: 2.5 },
  { x: 480, y: 520, size: 1.5 },
  { x: 590, y: 180, size: 2 },
  { x: 640, y: 340, size: 2.5 },
  { x: 540, y: 420, size: 2 },
  { x: 690, y: 530, size: 1.5 },
  { x: 740, y: 240, size: 2 },
  { x: 800, y: 120, size: 2.5 },
  { x: 860, y: 310, size: 1.5 },
  { x: 940, y: 190, size: 2 },
  { x: 980, y: 410, size: 2.5 },
  { x: 910, y: 530, size: 1.5 },
  { x: 1060, y: 280, size: 2 },
  { x: 1140, y: 140, size: 2.5 },
  { x: 1160, y: 470, size: 2 },
  { x: 1030, y: 540, size: 1.5 },
  { x: 50, y: 560, size: 2 },
  { x: 120, y: 320, size: 1.5 },
  { x: 780, y: 500, size: 2 },
];

const LINES = [];
for (let i = 0; i < PARTICLES.length; i++) {
  for (let j = i + 1; j < PARTICLES.length; j++) {
    const p1 = PARTICLES[i];
    const p2 = PARTICLES[j];
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 165) {
      const opacity = (1 - dist / 165) * 0.25;
      LINES.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, opacity });
    }
  }
}

function ConstellationBackground() {
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, pointerEvents: 'none', zIndex: 0 }}>
      {LINES.map((line, idx) => (
        <line
          key={`l-${idx}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={`rgba(10, 14, 39, ${line.opacity})`}
          strokeWidth={0.75}
        />
      ))}
      {PARTICLES.map((p, idx) => (
        <circle
          key={`p-${idx}`}
          cx={p.x}
          cy={p.y}
          r={p.size}
          fill="rgba(10, 14, 39, 0.3)"
        />
      ))}
    </svg>
  );
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const titleParam = searchParams.get('title') || 'Khoa Nguyễn';
    const title = titleParam.length > 70 ? titleParam.slice(0, 70) + '...' : titleParam;
    const type = searchParams.get('type') || 'page';
    const descParam = searchParams.get('description') || 'Software Engineer · Graphic Designer · Guitarist';
    let desc = descParam;
    if (desc && (type === 'blog' || type === 'project')) {
      if (desc.length > 110) {
        desc = desc.slice(0, 110).trim();
      }
      if (!desc.endsWith('...')) {
        desc = desc.replace(/[.,\s]+$/, '') + '...';
      }
    } else {
      desc = descParam.length > 120 ? descParam.slice(0, 120) + '...' : descParam;
    }
    const thumbnailParam = searchParams.get('thumbnail') || null;
    const label = LABELS[type] || 'Portfolio';
    const titleSize = thumbnailParam ? (title.length > 35 ? 40 : 48) : (title.length > 35 ? 52 : 64);

    // Load fonts & images concurrently
    const [fonts, avatarSrc, thumbnailSrc] = await Promise.all([
      getFonts(),
      getBase64Image(GITHUB_AVATAR),
      getBase64Image(thumbnailParam)
    ]);

    const imageOptions = {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Playfair Display', data: fonts.playfairBold, weight: 700, style: 'normal' },
        { name: 'Be Vietnam Pro', data: fonts.beVietnamRegular, weight: 400, style: 'normal' },
        { name: 'Be Vietnam Pro', data: fonts.beVietnamBold, weight: 700, style: 'normal' },
        { name: 'JetBrains Mono', data: fonts.jetbrainsMono, weight: 400, style: 'normal' },
      ],
    };

    if (thumbnailSrc) {
      return new ImageResponse(
        (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', background: BG, boxSizing: 'border-box' }}>
            <ConstellationBackground />
            {/* Left: text */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '52px 52px 48px 60px' }}>
              {/* Top */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 16, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', color: TEXT }}>
                  <span style={{ marginRight: 6 }}>&gt;</span>
                  <span>yun.khngn</span>
                  <span style={{ marginLeft: 3 }}>_</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: BORDER,
                  color: BG,
                  borderRadius: 20,
                  padding: '4px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: '"JetBrains Mono", monospace',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {label}
                </div>
              </div>
              {/* Middle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: titleSize, fontWeight: 700, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.02em', fontFamily: '"Playfair Display", serif' }}>{title}</div>
                {desc && <div style={{ fontSize: 17, color: MUTED, lineHeight: 1.55, fontFamily: '"Be Vietnam Pro", sans-serif' }}>{desc}</div>}
              </div>
              {/* Bottom: author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={avatarSrc} width={40} height={40} style={{ borderRadius: '50%', border: `2px solid ${BORDER}` }} alt="" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontFamily: '"Be Vietnam Pro", sans-serif' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Khoa Nguyễn</span>
                  <span style={{ fontSize: 13, color: MUTED }}>Author</span>
                </div>
              </div>
            </div>
            {/* Right: cover */}
            <div style={{ width: 400, flexShrink: 0, overflow: 'hidden', display: 'flex' }}>
              <img src={thumbnailSrc} width={400} height={630} style={{ objectFit: 'cover', width: '100%', height: '100%' }} alt="" />
            </div>
          </div>
        ),
        imageOptions
      );
    }

    return new ImageResponse(
      (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 80px 52px', background: BG, boxSizing: 'border-box' }}>
          <ConstellationBackground />
          {/* Top */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 18, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', color: TEXT }}>
              <span style={{ marginRight: 6 }}>&gt;</span>
              <span>yun.khngn</span>
              <span style={{ marginLeft: 3 }}>_</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: BORDER,
              color: BG,
              borderRadius: 20,
              padding: '5px 14px',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: '"JetBrains Mono", monospace',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              {label}
            </div>
          </div>
          {/* Middle */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: 48, height: 4, background: TEXT, borderRadius: 2, marginBottom: 24 }} />
            <div style={{ fontSize: titleSize, fontWeight: 700, color: TEXT, lineHeight: 1.18, letterSpacing: '-0.025em', maxWidth: 880, fontFamily: '"Playfair Display", serif' }}>{title}</div>
            {desc && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
                <div style={{ fontSize: 22, color: MUTED, lineHeight: 1.5, maxWidth: 760, fontFamily: '"Be Vietnam Pro", sans-serif' }}>
                  {desc}
                </div>
                {type === 'page' && (
                  <div style={{ display: 'flex', flexDirection: 'column', fontSize: 16, color: MUTED, opacity: 0.8, lineHeight: 1.6, maxWidth: 700, fontFamily: '"Be Vietnam Pro", sans-serif' }}>
                    <span>Full Stack Developer building beautiful web experiences,</span>
                    <span>sharing knowledge and journey through code.</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Bottom: author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src={avatarSrc} width={44} height={44} style={{ borderRadius: '50%', border: `2px solid ${BORDER}` }} alt="" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: '"Be Vietnam Pro", sans-serif' }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: TEXT }}>Khoa Nguyễn</span>
              <span style={{ fontSize: 15, color: MUTED }}>Author</span>
            </div>
          </div>
        </div>
      ),
      imageOptions
    );
  } catch (e) {
    console.error(e);
    return new Response(`OG error: ${e.message}`, { status: 500 });
  }
}
