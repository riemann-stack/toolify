/* ──────────────────────────────────────────────────────
   components/ToolSection.tsx

   도구 페이지 표준 구조 (문서)
   ─ 본문 폭: 760px(좁은 도구) / 880px(표준), margin '0 auto' 중앙 정렬
   ─ 카드: background var(--bg2) · border 1px solid var(--border)
           · border-radius 14px · padding '20px 22px'
   ─ 결과 히어로 숫자: fontSize 'clamp(44px, 11vw, 72px)'
   ─ FAQ: <Faq> 컴포넌트(components/Faq.tsx) 사용 (+ FaqJsonLd)
   ─ 가이드 구분선: 클라이언트 컴포넌트 직후 <GuideDivider /> 1개,
                    그 아래에 h2 가이드 섹션들

   ※ 과거 default export(ToolSection: input/result variant)는
      전 소스 사용 0건으로 제거됨 — import 경로는 그대로 유지.
   ────────────────────────────────────────────────────── */
import styles from './ToolSection.module.css'
import UiIcon from './UiIcon'

/** SEO 본문과 도구 사이 명확한 구분선 — page.tsx 에서 사용 */
export function GuideDivider({ label = '알아두면 좋아요' }: { label?: string }) {
  return (
    <div className={styles.guideDivider} aria-hidden="false">
      <span className={styles.guideDividerLine} />
      <span className={styles.guideDividerLabel}><UiIcon name="book" size={13} />{label}</span>
      <span className={styles.guideDividerLine} />
    </div>
  )
}
