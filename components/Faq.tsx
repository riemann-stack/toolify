/* FAQ 아코디언 공통 컴포넌트 — 표준 FAQ 블록(h2 + FAQPage JSON-LD + <details> 목록).
   마크업·인라인 스타일은 기존 페이지 표준 블록과 동일 (렌더 결과 불변이 전제).
   사용: 페이지의 <section>/<div> 래퍼 안에서 <Faq items={FAQ_LD} /> */

import FaqJsonLd from './FaqJsonLd'

interface FaqItem { q: string; a: string }

export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <>
      <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={items} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((faq, i) => (
          <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
              Q{i + 1}. {faq.q}
            </summary>
            <p
              style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
              dangerouslySetInnerHTML={{ __html: faq.a }}
            />
          </details>
        ))}
      </div>
    </>
  )
}
