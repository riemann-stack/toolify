/* ──────────────────────────────────────────────────────
   components/Disclaimer.tsx
   사이트 전체 통일된 면책 고지 컴포넌트.
   - 페이지 하단에 단일 배치 권장 (중복 표시 X)
   - variant: 'default' (참고용 일반) | 'medical' (의료) | 'finance' (금융) | 'legal' (법률) | 'safety' (안전·산행 등)
   ────────────────────────────────────────────────────── */
import Link from 'next/link'
import styles from './Disclaimer.module.css'
import type { ReactNode } from 'react'

export type DisclaimerVariant = 'default' | 'medical' | 'finance' | 'legal' | 'safety'

export interface SourceLink {
  /** 출처 이름 (예: '국세청 홈택스') */
  label: string
  /** 공식 출처 URL — 외부 링크. 안정적인 1차 공식 출처 권장 */
  href: string
}

interface Props {
  variant?: DisclaimerVariant
  /** 도구별 추가 고지 (예: "환경 보정은 평균 통계") */
  children?: ReactNode
  /** 관련 도구 링크 (선택) */
  related?: { href: string; label: string }[]
  /** 공식 기준 출처 (선택) — YMYL 도구에 근거 명기·링크 */
  sources?: SourceLink[]
  /** 기본 펼침 여부 (선택) — 항상 노출이 필요한 페이지에서만 true (기본 false) */
  open?: boolean
}

const VARIANT_CONFIG: Record<DisclaimerVariant, { title: string; baseLines: string[] }> = {
  default: {
    title: '본 도구는 참고용입니다',
    baseLines: [
      '입력값·환경에 따라 결과가 달라질 수 있으며 정확성을 보장하지 않습니다.',
      '중요한 의사결정에는 전문가 조언을 받으세요.',
    ],
  },
  medical: {
    title: '의학적 진단 도구가 아닙니다',
    baseLines: [
      '본 도구는 일반 건강 정보 참고용이며 의학적 진단·처방을 대체하지 않습니다.',
      '구체적인 건강 우려는 의료 전문가와 상담하세요.',
    ],
  },
  finance: {
    title: '본 계산은 추정치입니다',
    baseLines: [
      '실제 세액·금융 결과는 개인 상황·금융기관 정책·세법 개정에 따라 달라질 수 있습니다.',
      '정확한 정보는 국세청·홈택스·해당 금융기관 또는 세무·재무 전문가를 통해 확인하세요.',
    ],
  },
  legal: {
    title: '법률 자문 도구가 아닙니다',
    baseLines: [
      '본 도구는 일반 법률 정보 참고용이며 구체적인 법적 효력을 보장하지 않습니다.',
      '법률 분쟁·계약 등은 변호사·법무사와 상담하세요.',
    ],
  },
  safety: {
    title: '안전을 위한 일반 가이드입니다',
    baseLines: [
      '실제 환경·날씨·개인 컨디션에 따라 결과가 다를 수 있습니다.',
      '응급 상황 시 119 즉시 신고하시고 무리한 시도를 자제하세요.',
    ],
  },
}

const VARIANT_EMOJI: Record<DisclaimerVariant, string> = {
  default: 'ⓘ',
  medical: '⚕️',
  finance: '💰',
  legal: '⚖️',
  safety: '⚠️',
}

export default function Disclaimer({ variant = 'default', children, related, sources, open = false }: Props) {
  const cfg = VARIANT_CONFIG[variant]
  const emoji = VARIANT_EMOJI[variant]

  return (
    <details className={styles.disclaimer} data-variant={variant} aria-label="이용 안내" open={open || undefined}>
      <summary className={styles.head}>
        <span className={styles.emoji} aria-hidden>{emoji}</span>
        <strong className={styles.title}>{cfg.title}</strong>
        <span className={styles.toggle} aria-hidden>자세히</span>
        <svg className={styles.chevron} width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M3 4.5 L6 7.5 L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className={styles.body}>
        <ul className={styles.list}>
          {cfg.baseLines.map((line, i) => (
            <li key={`base-${i}`}>{line}</li>
          ))}
          {children && <li className={styles.custom}>{children}</li>}
        </ul>
        {sources && sources.length > 0 && (
          <div className={styles.sources}>
            <span className={styles.sourcesLabel}>근거 자료</span>
            {sources.map((sc, i) => (
              <span key={sc.href}>
                <a href={sc.href} className={styles.sourceLink} target="_blank" rel="noopener noreferrer">{sc.label} ↗</a>
                {i < sources.length - 1 && <span className={styles.dot}> · </span>}
              </span>
            ))}
          </div>
        )}
        {related && related.length > 0 && (
          <div className={styles.related}>
            관련 도구:{' '}
            {related.map((r, i) => (
              <span key={r.href}>
                <Link href={r.href} className={styles.relatedLink}>{r.label}</Link>
                {i < related.length - 1 && <span className={styles.dot}> · </span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </details>
  )
}
