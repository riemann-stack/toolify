/* components/Faq.tsx — FAQ 괘선 목록형 아코디언 (스펙 §10.9) · FAQPage JSON-LD 동시 렌더 유지
   ─ 호환: <Faq items={FAQ_LD} /> (68곳) 그대로. title·id는 선택.
   ─ 1.5px 잉크 괘선 목록 · 'Q' 표시는 accent-ink · 답변 16/1.8 · 첫 항목만 열림 · 제목에서 '(FAQ)' 괄호 제거 · id="faq"(레일 목차 앵커)
   ─ 본문 시트(.prose) 안에서는 h2가 자동 번호(01…)를 받는다. 시트 밖(과도기)에서도 .fqH가 크기를 잡는다.
   ─ 답변은 페이지 상수 FAQ 배열(신뢰된 정적 HTML 조각)만 받는다 — 사용자 입력을 넣지 말 것. */
import FaqJsonLd from './FaqJsonLd'
import styles from './Faq.module.css'
import UiIcon from './UiIcon'

interface FaqItem { q: string; a: string }

export default function Faq({ items, title = '자주 묻는 질문', id = 'faq' }: { items: FaqItem[]; title?: string; id?: string }) {
  if (!items || items.length === 0) return null
  return (
    <>
      <h2 id={id} className={styles.fqH}>{title}</h2>
      <FaqJsonLd items={items} />
      <div className={styles.fq}>
        {items.map((f, i) => (
          <details key={i} open={i === 0}>
            <summary>
              <span className={styles.fqQ} aria-hidden="true">Q</span>
              <span className={styles.fqText}>{f.q}</span>
              <UiIcon name="chev-d" size={18} />
            </summary>
            <div className={styles.fqA} dangerouslySetInnerHTML={{ __html: f.a }} />
          </details>
        ))}
      </div>
    </>
  )
}
