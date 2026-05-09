/* ──────────────────────────────────────────────────────
   components/ToolSection.tsx
   사이트 전체 통일된 영역 구분 — 입력/결과/SEO
   ────────────────────────────────────────────────────── */
import type { ReactNode } from 'react'
import styles from './ToolSection.module.css'

export type SectionVariant = 'input' | 'result' | 'guide'

interface Props {
  variant: SectionVariant
  /** 영역 라벨 (생략 시 variant 기본 라벨 사용) */
  label?: string
  /** 라벨 옆 부가 설명 */
  subLabel?: string
  /** 추가 className */
  className?: string
  children: ReactNode
}

const VARIANT_DEFAULTS: Record<SectionVariant, { emoji: string; label: string }> = {
  input:  { emoji: '📝', label: '입력' },
  result: { emoji: '✨', label: '결과' },
  guide:  { emoji: '📚', label: '알아두면 좋아요' },
}

export default function ToolSection({ variant, label, subLabel, className, children }: Props) {
  const cfg = VARIANT_DEFAULTS[variant]
  const finalLabel = label ?? cfg.label
  return (
    <section
      className={`${styles.section} ${styles[`section-${variant}`]} ${className ?? ''}`}
      data-variant={variant}
      aria-label={finalLabel}
    >
      <div className={styles.label}>
        <span className={styles.emoji} aria-hidden>{cfg.emoji}</span>
        <span className={styles.labelText}>{finalLabel}</span>
        {subLabel && <span className={styles.subLabel}>{subLabel}</span>}
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  )
}

/** SEO 본문과 도구 사이 명확한 구분선 — page.tsx 에서 사용 */
export function GuideDivider({ label = '알아두면 좋아요' }: { label?: string }) {
  return (
    <div className={styles.guideDivider} aria-hidden="false">
      <span className={styles.guideDividerLine} />
      <span className={styles.guideDividerLabel}>📚 {label}</span>
      <span className={styles.guideDividerLine} />
    </div>
  )
}
