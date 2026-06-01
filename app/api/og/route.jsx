import { ImageResponse } from 'next/og';

export const dynamic = 'force-dynamic';

const GITHUB_AVATAR = 'https://github.com/yunkhngn.png';
const BG    = '#f8f9fc';
const TEXT  = '#0d1630';
const MUTED = '#6b7a99';
const BORDER = '#dde3f0';

const LABELS = { blog: 'Writing', project: 'Project', page: 'Portfolio', journal: 'Journal' };

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const title     = (searchParams.get('title') || 'Khoa Nguyễn').slice(0, 70);
    const type      = searchParams.get('type') || 'page';
    const desc      = (searchParams.get('description') || 'Software Engineer · Designer · Guitarist').slice(0, 120);
    const thumbnail = searchParams.get('thumbnail') || null;
    const label     = LABELS[type] || 'Portfolio';
    const titleSize = thumbnail ? (title.length > 35 ? 40 : 48) : (title.length > 35 ? 52 : 64);

    // Fetch avatar as arraybuffer so Satori can render it reliably
    let avatarSrc = GITHUB_AVATAR;
    try {
      const avatarRes = await fetch(GITHUB_AVATAR);
      const buf = await avatarRes.arrayBuffer();
      const b64 = Buffer.from(buf).toString('base64');
      avatarSrc = `data:image/jpeg;base64,${b64}`;
    } catch {
      // fallback to URL — might not render but won't crash
    }

    if (thumbnail) {
      return new ImageResponse(
        (
          <div style={{ width: '100%', height: '100%', display: 'flex', background: BG, fontFamily: 'sans-serif' }}>
            {/* Left: text */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '52px 52px 48px 60px' }}>
              {/* Top */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 16, color: MUTED }}>{`yunkhngn.dev`}</span>
                <div style={{ background: TEXT, color: BG, borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex' }}>
                  {label}
                </div>
              </div>
              {/* Middle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: titleSize, fontWeight: 700, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.02em' }}>{title}</div>
                {desc && <div style={{ fontSize: 17, color: MUTED, lineHeight: 1.55 }}>{desc}</div>}
              </div>
              {/* Bottom: author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={avatarSrc} width={40} height={40} style={{ borderRadius: '50%', border: `2px solid ${BORDER}` }} alt="" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Khoa Nguyễn</span>
                  <span style={{ fontSize: 13, color: MUTED }}>Software Engineer</span>
                </div>
              </div>
            </div>
            {/* Divider */}
            <div style={{ width: 1, background: BORDER, flexShrink: 0 }} />
            {/* Right: cover */}
            <div style={{ width: 400, flexShrink: 0, overflow: 'hidden', display: 'flex' }}>
              <img src={thumbnail} width={400} height={630} style={{ objectFit: 'cover', width: '100%', height: '100%' }} alt="" />
            </div>
          </div>
        ),
        { width: 1200, height: 630 },
      );
    }

    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 80px 52px', background: BG, fontFamily: 'sans-serif' }}>
          {/* Top */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 17, color: MUTED }}>{`yunkhngn.dev`}</span>
            <div style={{ background: TEXT, color: BG, borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex' }}>
              {label}
            </div>
          </div>
          {/* Middle */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: 48, height: 3, background: TEXT, borderRadius: 2, marginBottom: 24 }} />
            <div style={{ fontSize: titleSize, fontWeight: 700, color: TEXT, lineHeight: 1.18, letterSpacing: '-0.025em', maxWidth: 880 }}>{title}</div>
            {desc && <div style={{ fontSize: 22, color: MUTED, lineHeight: 1.5, marginTop: 20, maxWidth: 760 }}>{desc}</div>}
          </div>
          {/* Bottom: author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src={avatarSrc} width={44} height={44} style={{ borderRadius: '50%', border: `2px solid ${BORDER}` }} alt="" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: TEXT }}>Khoa Nguyễn</span>
              <span style={{ fontSize: 15, color: MUTED }}>Software Engineer</span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  } catch (e) {
    return new Response(`OG error: ${e.message}`, { status: 500 });
  }
}
