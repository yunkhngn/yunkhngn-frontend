import { ImageResponse } from 'next/og';

// Removed edge runtime to avoid 1MB bundle size limit
// export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Khoa Nguyễn';
  const type = searchParams.get('type') || 'page';
  const description = searchParams.get('description') || 'Software Engineer • Designer • Guitarist';

  const typeLabel = {
    blog: '📝 Blog',
    project: '🚀 Project',
    page: '🌐 Page',
  }[type] || '🌐 Page';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 24, opacity: 0.6, letterSpacing: '0.1em' }}>yunkhngn.dev</div>
          <div
            style={{
              fontSize: 16,
              padding: '6px 16px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {typeLabel}
          </div>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              fontSize: title.length > 40 ? 48 : 60,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              maxWidth: '90%',
            }}
          >
            {title}
          </div>
          {description && (
            <div style={{ fontSize: 24, opacity: 0.6, maxWidth: '80%', lineHeight: 1.4 }}>
              {description.slice(0, 120)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            K
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Khoa Nguyễn</div>
            <div style={{ fontSize: 16, opacity: 0.5 }}>Software Engineer</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
