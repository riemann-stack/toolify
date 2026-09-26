/* components/RelatedTools.tsx (server) — '함께 쓰면 좋은 계산기' 카드 (스펙 §10.10)
   ─ 두 가지 모드
       ① items={[{ href, desc? }]} — 사람이 고른 목록(코드모드 L1이 레거시 배열 그리드를 이 형태로 바꾼다)
       ② items 생략 + current — 레지스트리 기본값: 같은 하위 분류(toolMeta.group) → 같은 분야 이웃 → 같은 컬렉션의 다른 분야 1~2개
   ─ 고아 도구 방지: current가 있으면 '같은 분야 레지스트리 순서의 다음 도구'(분야 안 원형 순서)를 항상 포함한다(ring).
     모든 도구 페이지가 이 규칙을 쓰면 분야 안 모든 도구가 최소 1개의 도구 페이지 내부 링크를 받는다.
   ─ 이름·분야·아이콘은 lib/tools·toolMeta에서 조회(레거시 이모지 무시). 카드마다 그 도구의 data-cat 색(--c·--c-ink·--c-soft).
   ─ 6개 권장(같은 분야 4~5 + 다른 분야 1~2). 데스크톱 3열 카드 → ≤760 한 카드 안 리스트 행. */
import Link from 'next/link'
import styles from './RelatedTools.module.css'
import UiIcon, { hasUiIcon } from './UiIcon'
import CatIcon from './CatIcon'
import { categories, type Tool } from '@/lib/tools'
import { COLLECTIONS } from '@/lib/collections'
import { getToolMeta } from '@/lib/toolMeta'

const SHORT: Record<string, string> = { finance: '금융', health: '건강', cooking: '요리', life: '생활', sports: '스포츠', interior: '주거', unit: '단위', date: '날짜', art: '예술', edu: '교육', dev: '개발' }

const INDEX = new Map<string, { tool: Tool; cat: string; i: number }>()
for (const c of categories) c.tools.forEach((t, i) => INDEX.set(t.href, { tool: t, cat: c.id, i }))

/** 같은 분야의 레지스트리 다음 도구(원형) — 분야 안 모든 도구가 내부 링크를 1개 이상 받게 하는 규칙 */
export function ringNext(href: string): string | undefined {
  const me = INDEX.get(href)
  const cat = me && categories.find(c => c.id === me.cat)
  if (!me || !cat || cat.tools.length < 2) return undefined
  return cat.tools[(me.i + 1) % cat.tools.length].href
}

/** 같은 컬렉션(상황별 묶음)에 함께 들어 있는 다른 분야 도구 — 컬렉션 안에서 가까운 순 */
function crossCandidates(current: string, catId: string): string[] {
  const out: string[] = []
  for (const col of COLLECTIONS) {
    const list = col.steps.flatMap(s => s.toolHrefs)
    const at = list.indexOf(current)
    if (at < 0) continue
    const byDist = list.map((h, i) => ({ h, d: Math.abs(i - at) })).sort((a, b) => a.d - b.d)
    for (const { h } of byDist) {
      const e = INDEX.get(h)
      if (e && e.cat !== catId && h !== current && !out.includes(h)) out.push(h)
    }
  }
  return out
}

/** 레지스트리 기본 추천 (items 생략 시) */
export function defaultRelated(current: string, limit = 6): string[] {
  const me = INDEX.get(current)
  const cat = me && categories.find(c => c.id === me.cat)
  if (!me || !cat) return []
  const n = cat.tools.length
  const cross = crossCandidates(current, cat.id)
  const crossWant = Math.min(cross.length, n - 1 >= limit - 1 ? 1 : limit - (n - 1))
  const sameWant = Math.min(n - 1, limit - crossWant)
  const same: string[] = []
  const add = (h: string | undefined) => { if (h && h !== current && !same.includes(h) && same.length < sameWant) same.push(h) }
  add(ringNext(current))
  const group = getToolMeta(current)?.group
  if (group) for (let k = 1; k < n; k++) { const t = cat.tools[(me.i + k) % n]; if (getToolMeta(t.href)?.group === group) add(t.href) }
  for (let k = 1; k < n && same.length < sameWant; k++) {
    add(cat.tools[(me.i - k + n) % n].href)
    add(cat.tools[(me.i + k + 1) % n].href)
  }
  return [...same, ...cross.slice(0, limit - same.length)]
}

export interface RelatedItem { href: string; desc?: string }
export interface RelatedToolsProps {
  /** 사람이 고른 목록. 생략하면 current 기준 레지스트리 기본값 */
  items?: RelatedItem[]
  /** 지금 페이지의 도구 href — 자기 자신 제외·ring 보장·기본 추천 기준. <ToolPage>가 자동으로 넣는다 */
  current?: string
  title?: string
  /** 기본 추천 개수(기본 6) — items 모드에서는 ring 삽입 판단에만 쓴다 */
  limit?: number
  /** false면 ring(다음 도구) 보장을 끈다 */
  ring?: boolean
}

export default function RelatedTools({ items, current, title = '함께 쓰면 좋은 계산기', limit = 6, ring = true }: RelatedToolsProps) {
  let list: RelatedItem[]
  if (items && items.length > 0) {
    list = []
    for (const it of items) if (it.href !== current && INDEX.has(it.href) && !list.some(x => x.href === it.href)) list.push(it)
    const nx = current && ring ? ringNext(current) : undefined
    if (nx && !list.some(x => x.href === nx)) {
      if (list.length >= limit) list[list.length - 1] = { href: nx }
      else list.push({ href: nx })
    }
  } else {
    list = current ? defaultRelated(current, limit).map(href => ({ href })) : []
  }
  const rows = list.flatMap(it => {
    const e = INDEX.get(it.href)
    return e ? [{ href: it.href, name: e.tool.name, desc: it.desc?.trim() || e.tool.desc, cat: e.cat }] : [] // 없어진 도구는 조용히 제외
  })
  if (rows.length === 0) return null
  return (
    <section className={styles.rtSec} aria-labelledby="rel-h">
      <h2 className={styles.rtH} id="rel-h">{title}</h2>
      <div className={styles.rt}>
        {rows.map(t => {
          const icon = getToolMeta(t.href)?.iconName
          return (
            <Link key={t.href} className={styles.rtItem} href={t.href} data-cat={t.cat}>
              <span className="ui-chipIc" aria-hidden="true">{icon && hasUiIcon(icon) ? <UiIcon name={icon} size={20} /> : <CatIcon id={t.cat} size={20} />}</span>
              <span className={styles.rtBody}>
                <span className={styles.rtCat}>{SHORT[t.cat] ?? t.cat}</span>
                <span className={styles.rtName}>{t.name}</span>
                <span className={styles.rtDesc}>{t.desc}</span>
              </span>
              <span className={styles.rtChev} aria-hidden="true"><UiIcon name="chev-r" size={18} /></span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
