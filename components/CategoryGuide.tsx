/* 카테고리 랜딩 본문(가이드 + FAQ) — 서버 컴포넌트.
   CategoryView가 그리드 아래·광고 위에 렌더한다.
   목적: 링크 그리드(doorway)에 실질 콘텐츠를 더해 SEO·AdSense 품질을 높임. */

import FaqJsonLd from './FaqJsonLd'
import { CATEGORY_GUIDES } from '@/lib/categoryGuides'
import { categories } from '@/lib/tools'

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  marginBottom: '10px',
}
const proseP: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
  margin: 0,
}
const faqSummary: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--text)',
}
const faqAnswer: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
  margin: '8px 0 0',
}

export default function CategoryGuide({ catId }: { catId: string }) {
  const guide = CATEGORY_GUIDES[catId]
  const cat = categories.find((c) => c.id === catId)
  if (!guide || !cat) return null

  return (
    <section
      aria-label={`${cat.name} 안내`}
      style={{
        marginTop: '44px',
        paddingTop: '36px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}
    >
      {/* 소개 */}
      <div>
        <h2 style={{ ...sectionTitle, fontSize: '22px', marginBottom: '12px' }}>
          {cat.name} 도구 안내
        </h2>
        <p style={proseP}>{guide.intro}</p>
      </div>

      {/* 활용·신뢰 섹션 */}
      {guide.sections.map((sec, i) => (
        <div key={i}>
          <h3 style={sectionTitle}>{sec.h}</h3>
          <p style={proseP}>{sec.body}</p>
        </div>
      ))}

      {/* FAQ */}
      <div>
        <h2 style={{ ...sectionTitle, fontSize: '22px', marginBottom: '14px' }}>
          자주 묻는 질문 (FAQ)
        </h2>
        <FaqJsonLd items={guide.faqs} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {guide.faqs.map((faq, i) => (
            <details
              key={i}
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '12px 14px',
              }}
            >
              <summary style={faqSummary}>{faq.q}</summary>
              <p style={faqAnswer}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
