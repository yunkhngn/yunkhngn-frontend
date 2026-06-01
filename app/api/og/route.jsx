import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const GITHUB_AVATAR = 'https://github.com/yunkhngn.png';
const BG = '#FDFBF7';
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
let playfairBoldVietnameseBuffer;
let beVietnamRegularBuffer;
let beVietnamRegularVietnameseBuffer;
let beVietnamBoldBuffer;
let beVietnamBoldVietnameseBuffer;
let jetbrainsMonoBuffer;

function toArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function getFonts() {
  if (!playfairBoldBuffer) {
    const fontDir = path.join(process.cwd(), 'public/fonts');
    playfairBoldBuffer = toArrayBuffer(fs.readFileSync(path.join(fontDir, 'PlayfairDisplay-Bold.woff')));
    playfairBoldVietnameseBuffer = toArrayBuffer(fs.readFileSync(path.join(fontDir, 'PlayfairDisplay-Bold-vietnamese.woff')));
    beVietnamRegularBuffer = toArrayBuffer(fs.readFileSync(path.join(fontDir, 'BeVietnamPro-Regular.woff')));
    beVietnamRegularVietnameseBuffer = toArrayBuffer(fs.readFileSync(path.join(fontDir, 'BeVietnamPro-Regular-vietnamese.woff')));
    beVietnamBoldBuffer = toArrayBuffer(fs.readFileSync(path.join(fontDir, 'BeVietnamPro-Bold.woff')));
    beVietnamBoldVietnameseBuffer = toArrayBuffer(fs.readFileSync(path.join(fontDir, 'BeVietnamPro-Bold-vietnamese.woff')));
    jetbrainsMonoBuffer = toArrayBuffer(fs.readFileSync(path.join(fontDir, 'JetBrainsMono-Regular.woff')));
  }
  return {
    playfairBold: playfairBoldBuffer,
    playfairBoldVietnamese: playfairBoldVietnameseBuffer,
    beVietnamRegular: beVietnamRegularBuffer,
    beVietnamRegularVietnamese: beVietnamRegularVietnameseBuffer,
    beVietnamBold: beVietnamBoldBuffer,
    beVietnamBoldVietnamese: beVietnamBoldVietnameseBuffer,
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = (searchParams.get('title') || 'Khoa Nguyễn').slice(0, 70);
    const type = searchParams.get('type') || 'page';
    const desc = (searchParams.get('description') || 'Software Engineer · Designer · Guitarist').slice(0, 120);
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
        { name: 'Playfair Display', data: fonts.playfairBoldVietnamese, weight: 700, style: 'normal' },
        { name: 'Be Vietnam Pro', data: fonts.beVietnamRegular, weight: 400, style: 'normal' },
        { name: 'Be Vietnam Pro', data: fonts.beVietnamRegularVietnamese, weight: 400, style: 'normal' },
        { name: 'Be Vietnam Pro', data: fonts.beVietnamBold, weight: 700, style: 'normal' },
        { name: 'Be Vietnam Pro', data: fonts.beVietnamBoldVietnamese, weight: 700, style: 'normal' },
        { name: 'JetBrains Mono', data: fonts.jetbrainsMono, weight: 400, style: 'normal' },
      ],
    };

    if (thumbnailSrc) {
      return new ImageResponse(
        (
          <div style={{ width: '100%', height: '100%', display: 'flex', background: BG, border: `8px solid ${BORDER}`, boxSizing: 'border-box' }}>
            {/* Left: text */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '52px 52px 48px 60px' }}>
              {/* Top */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 16, color: MUTED, fontFamily: '"JetBrains Mono", monospace' }}>{`yunkhngn.dev`}</span>
                <div style={{ border: `2px solid ${BORDER}`, color: TEXT, borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex' }}>
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
                  <span style={{ fontSize: 13, color: MUTED }}>Software Engineer</span>
                </div>
              </div>
            </div>
            {/* Divider */}
            <div style={{ width: 8, background: BORDER, flexShrink: 0 }} />
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
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 80px 52px', background: BG, border: `8px solid ${BORDER}`, boxSizing: 'border-box' }}>
          {/* Top */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 17, color: MUTED, fontFamily: '"JetBrains Mono", monospace' }}>{`yunkhngn.dev`}</span>
            <div style={{ border: `2px solid ${BORDER}`, color: TEXT, borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex' }}>
              {label}
            </div>
          </div>
          {/* Middle */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: 48, height: 4, background: TEXT, borderRadius: 2, marginBottom: 24 }} />
            <div style={{ fontSize: titleSize, fontWeight: 700, color: TEXT, lineHeight: 1.18, letterSpacing: '-0.025em', maxWidth: 880, fontFamily: '"Playfair Display", serif' }}>{title}</div>
            {desc && <div style={{ fontSize: 22, color: MUTED, lineHeight: 1.5, marginTop: 20, maxWidth: 760, fontFamily: '"Be Vietnam Pro", sans-serif' }}>{desc}</div>}
          </div>
          {/* Bottom: author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src={avatarSrc} width={44} height={44} style={{ borderRadius: '50%', border: `2px solid ${BORDER}` }} alt="" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: '"Be Vietnam Pro", sans-serif' }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: TEXT }}>Khoa Nguyễn</span>
              <span style={{ fontSize: 15, color: MUTED }}>Software Engineer</span>
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
