/* app/collections/_guides/shared.tsx (server) — 상황별 가이드 본문 공용 조각
   · 숫자 포맷(won·manwon·pct)과 '참고 자료' 목록만 둔다. 문단은 가이드마다 직접 쓴다(복제 문단 금지).
   · 참고 자료 마크업은 도구 페이지 SourceNotes와 같은 클래스(snRefs)·새 창 표기를 쓴다. */
import type { ReactNode } from 'react'
import sn from '@/components/SourceNotes.module.css'
import { sourceOrg } from '@/lib/toolMeta'

export interface GuideSource { label: string; href: string }

/** 가이드 본문 컴포넌트 + ArticleSheet 제목 */
export interface CollectionGuide {
  title: string
  Body: () => ReactNode
}

export const num = (n: number, digits = 0) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
export const won = (n: number) => `${num(Math.round(n))}원`
/** 1234567 → '123만원' (만원 미만 반올림) · 1억 이상은 '1억 2,346만원' */
export function manwon(wonAmount: number): string {
  const man = Math.round(wonAmount / 10_000)
  if (man >= 10_000) {
    const eok = Math.floor(man / 10_000)
    const rest = man % 10_000
    return rest === 0 ? `${num(eok)}억원` : `${num(eok)}억 ${num(rest)}만원`
  }
  return `${num(man)}만원`
}
/** 초 → '2분 7초' · '53초' (페이스·시간 차이를 문장에 넣을 때) */
export function minSecKo(sec: number): string {
  const t = Math.round(sec)
  const m = Math.floor(t / 60)
  const s = t % 60
  return m > 0 ? (s > 0 ? `${m}분 ${s}초` : `${m}분`) : `${s}초`
}
/** 초 → '2시간 1분' (분 단위 반올림) */
export function hourMinKo(sec: number): string {
  const t = Math.round(sec / 60)
  const h = Math.floor(t / 60)
  const m = t % 60
  return h > 0 ? (m > 0 ? `${h}시간 ${m}분` : `${h}시간`) : `${m}분`
}
/** 'YYYY-MM-DD' → '2026년 4월 20일' (Date 파싱 없이 분해) */
export const ymdKo = (iso: string) => `${Number(iso.slice(0, 4))}년 ${Number(iso.slice(5, 7))}월 ${Number(iso.slice(8, 10))}일`
/** 0.154 → '15.4%' (불필요한 0 제거) */
export const pct = (ratio: number, digits = 2) => `${Number((ratio * 100).toFixed(digits))}%`

/** 가이드 끝 '참고 자료' — 공식·1차 출처만 */
export function GuideSources({ items }: { items: GuideSource[] }) {
  if (items.length === 0) return null
  return (
    <>
      <h2 id="cg-refs" data-nonum="">참고 자료</h2>
      <ol className={sn.snRefs}>
        {items.map((s) => (
          <li key={s.href}>
            <span>
              <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}<span className="srOnly">(새 창)</span></a>
              {sourceOrg(s) && <small>{sourceOrg(s)}</small>}
            </span>
          </li>
        ))}
      </ol>
    </>
  )
}
