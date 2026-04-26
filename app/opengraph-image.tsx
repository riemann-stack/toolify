import { ImageResponse } from 'next/og'

// Next.js가 빌드/요청 시 동적으로 1200x630 OG 이미지를 생성합니다.
// 별도의 og.png 파일을 두지 않고, 사이트 디자인과 항상 일치하도록 코드로 정의.
export const runtime = 'edge'
export const alt = 'Youtil — 자주 쓰는 계산기와 무료 온라인 도구 모음'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background:
            'linear-gradient(135deg, #0D0D0D 0%, #161616 60%, #1B2010 100%)',
          color: '#F0EFE8',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 상단 — 브랜드 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              background: '#C8FF3E',
              boxShadow: '0 0 24px rgba(200,255,62,0.5)',
            }}
          />
          <span
            style={{
              fontSize: 28,
              letterSpacing: -0.5,
              fontWeight: 700,
              color: '#B8B8B0',
            }}
          >
            youtil.kr
          </span>
        </div>

        {/* 중앙 — 메인 카피 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p
            style={{
              fontSize: 28,
              color: '#C8FF3E',
              letterSpacing: 2,
              textTransform: 'uppercase',
              fontWeight: 600,
              margin: 0,
            }}
          >
            Free · No Login · Instant
          </p>
          <h1
            style={{
              fontSize: 110,
              fontWeight: 800,
              letterSpacing: -4,
              lineHeight: 1.05,
              margin: 0,
              color: '#F0EFE8',
            }}
          >
            모든 계산,<br />
            <span style={{ color: '#C8FF3E' }}>한 곳에서.</span>
          </h1>
        </div>

        {/* 하단 — 카테고리 칩 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {['💰 금융', '🏃 건강', '🍳 요리', '🎲 생활', '⛳ 스포츠', '📐 변환', '📅 날짜', '🎵 음악', '🖥️ 개발']
            .map(label => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 999,
                  padding: '10px 22px',
                  fontSize: 24,
                  color: '#D0D0C8',
                }}
              >
                {label}
              </div>
            ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
