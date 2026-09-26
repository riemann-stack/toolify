/* ──────────────────────────────────────────────────────
   components/ToolSection.tsx — GuideDivider (200곳, 스펙 §10.14)

   ─ 도구 영역과 가이드 본문의 경계. <ToolPage>는 이 요소의 '타입'으로 가이드 시작점을 찾고
     GuideDivider 자체는 렌더하지 않는다(그 자리를 본문 시트 머리 ArticleSheet가 대신한다).
   ─ ToolPage 도입 전(과도기)에는 1.5px 잉크 괘선 머리('가이드 / 알아두면 좋은 내용')로 보인다.
   ─ props 불변: label(선택). 기존 기본값 '알아두면 좋아요' → 킥커 '가이드' + 제목 '알아두면 좋은 내용'.

   ※ 과거 default export(ToolSection: input/result variant)는 전 소스 사용 0건으로 제거됨 — import 경로는 유지.
   ────────────────────────────────────────────────────── */
import styles from './ToolSection.module.css'
import UiIcon from './UiIcon'

/** 도구 ↔ 가이드 본문 경계 — page.tsx의 페이지 래퍼 직계 자식으로 1회 */
export function GuideDivider({ label = '가이드', title = '알아두면 좋은 내용' }: { label?: string; title?: string }) {
  return (
    <div className={styles.gd}>
      <span className={styles.gdLabel}><UiIcon name="book" size={16} />{label}</span>
      <span className={styles.gdTitle}>{title}</span>
    </div>
  )
}
