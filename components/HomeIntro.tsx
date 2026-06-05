/* 홈 하단 소개·신뢰·방법론 섹션 — 서버 컴포넌트.
   홈을 '검색 + 링크 그리드'에서 '설명형 콘텐츠가 있는 첫인상'으로 보강.
   AdSense 품질(E-E-A-T)·SEO를 위해 HTML에 실제 본문을 제공한다. */

import Link from 'next/link'
import { totalTools, categories } from '@/lib/tools'

const h2: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '24px',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  marginBottom: '14px',
}
const h3: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '17px',
  fontWeight: 700,
  marginBottom: '8px',
}
const p: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.85,
  margin: 0,
}
const linkStyle: React.CSSProperties = { color: 'var(--accent)', fontWeight: 600 }

export default function HomeIntro() {
  const featured = ['finance', 'health', 'cooking', 'life']
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))

  return (
    <section
      aria-label="youtil 소개"
      style={{
        maxWidth: '900px',
        margin: '24px auto 0',
        padding: '40px 24px 64px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      <div>
        <h2 style={h2}>youtil — 자주 쓰는 계산을 한 곳에서</h2>
        <p style={p}>
          youtil(유틸)은 연봉·대출·세금부터 건강·요리·여행까지, 일상에서 반복되는 계산과 변환을 한 곳에 모은 무료 도구 사이트입니다.
          복잡한 공식을 외우거나 여러 사이트를 뒤질 필요 없이, 필요한 값을 입력하면 바로 결과를 보여 주는 것을 목표로
          현재 {totalTools}가지 도구를 11개 카테고리로 제공합니다.
        </p>
      </div>

      <div>
        <h3 style={h3}>믿을 수 있는 계산을 위해</h3>
        <p style={p}>
          세율·요율·공식은 국세청, 금융위원회, 한국은행 등이 공개한 자료를 근거로 하며, 각 도구에 적용 기준 연도(2026년)와
          출처, 그리고 추정의 한계를 함께 표기합니다. 모든 계산은 여러분의 브라우저 안에서만 처리되어 입력값이 서버로
          전송·저장되지 않으며, 모든 도구를 회원가입·로그인 없이 무료로 사용할 수 있습니다. 다만 세금·건강·금융 결과는
          개인 상황에 따라 달라지는 참고용 추정값이므로, 중요한 결정 전에는 해당 기관·전문가의 확인을 권장합니다.
        </p>
      </div>

      <div>
        <h3 style={h3}>꾸준히 업데이트합니다</h3>
        <p style={p}>
          세법·금리·물가가 바뀌면 계산 기준도 함께 갱신하고, 사용자 피드백을 받아 도구를 개선합니다. 자세한 운영 방침은{' '}
          <Link href="/about" style={linkStyle}>소개</Link> 페이지에서 확인할 수 있고, 잘못된 점이나 필요한 도구가 있다면{' '}
          <Link href="/contact" style={linkStyle}>문의</Link>로 알려 주세요.
        </p>
      </div>

      <div>
        <h3 style={h3}>이런 도구가 있어요</h3>
        <p style={{ ...p, marginBottom: '12px' }}>
          가장 많이 찾는 카테고리부터 둘러보세요.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {featured.map((cat) => (
            <Link
              key={cat.id}
              href={`/tools/${cat.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '999px',
                border: '1px solid var(--border)',
                background: 'var(--bg2)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text)',
                textDecoration: 'none',
              }}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </Link>
          ))}
          <Link
            href="/tools"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 14px',
              borderRadius: '999px',
              border: '1px solid var(--accent)',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--accent)',
              textDecoration: 'none',
            }}
          >
            전체 {totalTools}가지 도구 →
          </Link>
        </div>
      </div>
    </section>
  )
}
