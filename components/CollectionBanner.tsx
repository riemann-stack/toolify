/* components/CollectionBanner.tsx (server) — 홈 '상황별 가이드' 3카드 (스펙 §10.20 .hmCols)
   · 첫 카드 = 오늘(KST)의 시즌 추천(getFeaturedSlug, app/page.tsx가 계산해 prop으로) → 첫 페인트부터 정합, 클라이언트 JS 0
   · 나머지 2장 = 레지스트리 순서에서 추천 다음 2개(날마다 함께 회전) — 무작위 없음(SSR=CSR)
   · 색: 컬렉션 raw hex 대신 '가장 많이 쓰는 분야'의 data-cat 토큰(--c/--c-soft, AA 보장)으로 칩만 칠한다 */
import Link from 'next/link'
import { COLLECTIONS, resolveTools, type Collection } from '@/lib/collections'
import { categories } from '@/lib/tools'
import CollectionIcon from './CollectionIcon'
import UiIcon from './UiIcon'
import s from './CollectionBanner.module.css'

const CAT_BY_HREF = new Map<string, string>()
for (const c of categories) for (const t of c.tools) CAT_BY_HREF.set(t.href, c.id)

/** 컬렉션에서 도구를 가장 많이 가진 분야 id (동률이면 먼저 나온 분야) — 칩 색(data-cat)용 */
export function collectionCatId(c: Collection): string | undefined {
  const count = new Map<string, number>()
  for (const step of c.steps) for (const h of step.toolHrefs) {
    const id = CAT_BY_HREF.get(h)
    if (id) count.set(id, (count.get(id) ?? 0) + 1)
  }
  let best: string | undefined
  let max = 0
  for (const [id, n] of count) if (n > max) { best = id; max = n }
  return best
}

/** 레지스트리에 실제로 있는 도구만 남긴 단계(빈 단계 제외). 목록·상세·배너의 '도구 N개 · M단계'와 화면 목록이 같은 데이터를 쓰게 한다
    (lib/collections collectionToolCount는 해석 전 href 수라, 통폐합으로 도구가 빠지면 화면보다 커진다) */
export function liveSteps(c: Collection) {
  return c.steps.map((st) => ({ ...st, tools: resolveTools(st.toolHrefs) })).filter((st) => st.tools.length > 0)
}

/** '도구 N개 · M단계' — liveSteps 기준 */
export function collectionStats(c: Collection): { tools: number; steps: number } {
  const steps = liveSteps(c)
  return { tools: steps.reduce((n, st) => n + st.tools.length, 0), steps: steps.length }
}

interface CollectionBannerProps {
  /** 서버에서 계산한 오늘의 시즌 추천 slug. 모르는 slug면 첫 컬렉션 */
  featuredSlug?: string
  /** 현재 월(1-12, KST) — 추천 카드 라벨('이번 달 추천' / '오늘의 추천') 결정 */
  month?: number
  count?: number
}

export default function CollectionBanner({ featuredSlug, month, count = 3 }: CollectionBannerProps) {
  const start = Math.max(0, COLLECTIONS.findIndex((c) => c.slug === featuredSlug))
  const picks = Array.from({ length: Math.min(count, COLLECTIONS.length) }, (_, i) => COLLECTIONS[(start + i) % COLLECTIONS.length])

  return (
    <div className={s.cbCols}>
      {picks.map((c, i) => {
        const seasonal = i === 0 && !!month && !!c.seasonMonths?.includes(month)
        const steps = liveSteps(c)
        const toolCount = steps.reduce((n, st) => n + st.tools.length, 0)
        return (
          <Link key={c.slug} className={s.cbCol} data-cat={collectionCatId(c)} href={`/collections/${c.slug}`}>
            <span className={s.cbTop}>
              <span className="ui-chipIc" aria-hidden="true"><CollectionIcon slug={c.slug} size={20} /></span>
              <span>{i === 0 && <em className={s.cbPick}>{seasonal ? '이번 달 추천' : '오늘의 추천'}</em>}도구 {toolCount}개 · {steps.length}단계</span>
            </span>
            <h3>{c.title}</h3>
            <ol>
              {steps.map((st) => <li key={st.title}>{st.title}</li>)}
            </ol>
            <span className={s.cbGo}>가이드 보기<UiIcon name="chev-r" size={16} /></span>
          </Link>
        )
      })}
    </div>
  )
}
