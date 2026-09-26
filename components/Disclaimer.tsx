/* ──────────────────────────────────────────────────────
   components/Disclaimer.tsx — 사이트 전체 통일 면책 고지 (스펙 §10.11)
   ─ props 불변: variant · children · related · sources · open (200곳 호출 호환)
   ─ variant별 녹·적·보라 색 테마를 폐지하고 전 variant 같은 중립 박스 — 문구만 variant별
   ─ 기본 접힘 · 페이지 맨 끝(관련 도구 아래)에 1회. <ToolPage>가 가이드 안의 Disclaimer를 본문 시트 밖 끝으로 옮긴다.
   ─ variant: 'default'(참고용) | 'medical'(의료) | 'finance'(금융) | 'legal'(법률) | 'safety'(안전)
   ────────────────────────────────────────────────────── */
import Link from 'next/link'
import type { ReactNode } from 'react'
import UiIcon from './UiIcon'
import styles from './Disclaimer.module.css'

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

export default function Disclaimer({ variant = 'default', children, related, sources, open = false }: Props) {
  const cfg = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.default
  return (
    <details className={styles.dc} data-variant={variant} open={open || undefined}>
      <summary>
        <UiIcon name="info" size={18} />
        <span className={styles.dcTitle}>{cfg.title}</span>
        <span className={styles.dcMore} aria-hidden="true">자세히<UiIcon name="chev-d" size={16} /></span>
      </summary>
      <div className={styles.dcBody}>
        <ul>
          {cfg.baseLines.map(line => <li key={line}>{line}</li>)}
          {children && <li className={styles.dcCustom}>{children}</li>}
        </ul>
        {sources && sources.length > 0 && (
          <p className={styles.dcRow}>
            <span className={styles.dcRowLabel}>근거 자료</span>
            {sources.map(s => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label}<UiIcon name="ext" size={14} /><span className="srOnly">(새 창)</span>
              </a>
            ))}
          </p>
        )}
        {related && related.length > 0 && (
          <p className={styles.dcRow}>
            <span className={styles.dcRowLabel}>관련 도구</span>
            {related.map(r => <Link key={r.href} href={r.href}>{r.label}</Link>)}
          </p>
        )}
      </div>
    </details>
  )
}
