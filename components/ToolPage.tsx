/* components/ToolPage.tsx (server) — 도구 페이지 래퍼 (스펙 §10.1). 200/200 페이지의 인라인 래퍼
     <div style={{ maxWidth: '760px'|'880px', margin: '0 auto', padding: '60px 24px 80px' }}>
   를 코드모드 W가 <ToolPage width={760|880} slug="/tools/<cat>/<slug>">로 바꾼다. children은 한 줄도 고치지 않는다.

   children을 '타입'으로 읽어 구조를 잡는다:
     [머리] 앞쪽 연속된 p·h1·<UpdatedMeta>·<ToolHeader>
            → ToolHeader가 없으면 메타 한 줄(ToolByline: 날짜·검산·작성 리만·출처 N건)을 자동으로 붙인다
              (UpdatedMeta가 있으면 그 줄 끝에 작성자·검산만 이어 붙임 — cloneElement)
     [도구] 머리 다음 ~ <GuideDivider/> 전 → .tpTool(tnum) + data-tool-region (레일 미니 결과가 여기서 [role=status]를 찾는다)
     [가이드] <GuideDivider/> 이후 → ArticleSheet(바이라인·목차·h2 자동 번호) 안에. GuideDivider 자체는 렌더하지 않는다.
            · 본문 h2에 id가 없으면 sec-N을 붙이고 서버에서 목차를 만든다(레일 목차·<1200 인라인 목차, CLS 0)
            · 끝에 SourceNotes(참고 자료 #refs + AboutTool)를 자동으로 붙인다(페이지가 직접 넣었으면 그것을 쓴다)
     [시트 밖] 관련 도구 → 면책 순서로 옮긴다:
            · <RelatedTools>는 current(slug)를 채워서, 레거시 '함께 쓰면 좋은 도구' h2+그리드는 링크를 읽어 <RelatedTools>로 바꿔서
              (링크를 못 읽으면 레거시 블록을 그대로 시트 밖에 둔다), 관련 블록이 없으면 레지스트리 기본값
            · <Disclaimer>(직접 또는 <section> 하나로 감싼 것)는 맨 끝으로
            · 광고(§11): 가이드 안 'between-tools' 슬롯과 본문 끝에 남은 슬롯은 시트 밖 '관련 도구 앞'으로 옮긴다
              (FAQ·참고 자료·면책 사이 금지 — 참고 자료는 시트 끝에 자동으로 붙으므로 끝 광고는 FAQ → 광고 → 참고 자료가 된다).
              개수는 바꾸지 않는다. in-article 슬롯(②)은 제자리
   레일(≥1200, 와이드 880은 ≥1320): 이 계산기의 기준(BasisCard) → sticky[미니 결과 → 목차 → 광고③]
   JSON-LD: WebApplication 노드(@id = URL#app)에 dateModified·author·publisher·citation — 화면 바이라인과 같은 toolMeta 소스.
            AutoToolJsonLd(레이아웃)의 같은 @id 노드와 합쳐진다. 평점(aggregateRating)은 넣지 않는다.
   GuideDivider가 없으면 가이드 래핑 없이 그대로 렌더(무해). */
import { Children, Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import '@/app/styles/bridge.css'
import styles from './ToolPage.module.css'
import ToolBreadcrumb from './ToolBreadcrumb'
import ToolHeader, { ToolByline } from './ToolHeader'
import UpdatedMeta from './UpdatedMeta'
import { GuideDivider } from './ToolSection'
import { ArticleSheet, type TocItem } from './Article'
import { BasisCard, RailResult, RailToc } from './Rail'
import SourceNotes from './SourceNotes'
import RelatedTools, { type RelatedItem } from './RelatedTools'
import Disclaimer from './Disclaimer'
import Faq from './Faq'
import AdSlot from './AdSlot'
import { catOf, getToolMeta, toolLdExtras } from '@/lib/toolMeta'

export type { TocItem }

export interface ToolPageProps {
  /** 본문 폭 — 코드모드가 기존 maxWidth 값을 그대로 넘긴다 */
  width?: 760 | 880
  /** '/tools/finance/salary' — toolMeta 조회 키 */
  slug: string
  /** 목차 직접 지정(생략하면 본문 h2에서 자동 생성) */
  toc?: TocItem[]
  /** 'v2' = 가이드 코드모드(G) 완료 → 과도기 브리지 CSS 미적용 */
  article?: 'v1' | 'v2'
  /** 본문 시트 제목. 기본 '알아두면 좋은 내용' */
  guideTitle?: string
  /** 레일 미니 결과 라벨(없으면 '계산 결과' — ResultHero의 data-result-label이 있으면 그것) */
  resultLabel?: string
  /** false면 관련 도구 자동 처리(변환·기본값)를 끈다 */
  related?: boolean
  children: ReactNode
}

type El = ReactElement<{ children?: ReactNode; id?: string; [k: string]: unknown }>
const isEl = (n: unknown): n is El => isValidElement(n)
const HEAD_TYPES = new Set<unknown>(['p', 'h1', UpdatedMeta, ToolHeader])
/** 의미를 아는 공용 컴포넌트 — 제목 탐색·래퍼 판정에서 children을 들여다보지 않는다 */
const KNOWN = new Set<unknown>([Faq, SourceNotes, Disclaimer, RelatedTools, UpdatedMeta, ToolHeader, GuideDivider])
const REL_RE = /함께 쓰면 좋은/
const REFS_RE = /^\s*참고\s?자료/
const MAX_DEPTH = 24

/** 요소 트리의 글자(props.children만 따라감 — 컴포넌트 렌더 결과는 보지 않는다) */
function textOf(node: ReactNode, depth = 0): string {
  if (node == null || typeof node === 'boolean' || depth > MAX_DEPTH) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(n => textOf(n, depth + 1)).join('')
  if (isEl(node)) return textOf(node.props.children, depth + 1)
  return ''
}
const kidsOf = (el: El): ReactNode[] => Children.toArray(el.props.children)
const isHost = (el: El) => typeof el.type === 'string'

/** '함께 쓰면 좋은 도구' 제목(h2/h3 또는 H2 같은 페이지 로컬 제목 컴포넌트) */
function isRelHeading(n: ReactNode): boolean {
  if (!isEl(n)) return false
  if (!(n.type === 'h2' || n.type === 'h3' || typeof n.type === 'function')) return false
  const t = textOf(n.props.children)
  return t.length < 40 && REL_RE.test(t)
}
function hasType(n: ReactNode, type: unknown, depth = 0): boolean {
  if (!isEl(n) || depth > MAX_DEPTH) return false
  if (n.type === type) return true
  return isHost(n) || n.type === Fragment ? kidsOf(n).some(c => hasType(c, type, depth + 1)) : false
}

/** 레거시 관련 도구 블록에서 /tools/… 링크와 설명(마지막 글자 조각)을 읽는다 */
function readLinks(nodes: ReactNode[]): RelatedItem[] {
  const out: RelatedItem[] = []
  const visit = (n: ReactNode, depth: number) => {
    if (depth > MAX_DEPTH) return
    if (Array.isArray(n)) { n.forEach(c => visit(c, depth + 1)); return }
    if (!isEl(n)) return
    const href = n.props.href
    if (typeof href === 'string' && /^\/tools\/[^/]+\/[^/?#]+$/.test(href)) {
      const parts: string[] = []
      const collect = (m: ReactNode, d: number) => {
        if (d > MAX_DEPTH || m == null || typeof m === 'boolean') return
        if (typeof m === 'string' || typeof m === 'number') { const s = String(m).trim(); if (/[가-힣A-Za-z0-9]/.test(s)) parts.push(s); return }
        if (Array.isArray(m)) { m.forEach(x => collect(x, d + 1)); return }
        if (isEl(m)) collect(m.props.children, d + 1)
      }
      collect(n.props.children, 0)
      if (!out.some(o => o.href === href)) out.push({ href, ...(parts.length > 1 && { desc: parts[parts.length - 1] }) })
      return
    }
    visit(n.props.children, depth + 1)
  }
  nodes.forEach(n => visit(n, 0))
  return out
}

interface Split { body: ReactNode[]; related: El[]; relLegacy: ReactNode[][]; disclaimers: El[]; ads: El[] }

// 타입 가드로 두지 않는다 — `if (isAd(n)) continue` 뒤에서 n이 never로 좁혀져 이후 isEl 분기가 깨진다
const isAd = (n: unknown): boolean => isEl(n) && n.type === AdSlot
/** 가이드 안의 'between-tools' 슬롯 — 스펙 §11에서 ④는 허브 전용. 도구 가이드에서는 '관련 도구 앞 1개'로만 허용되므로 시트 밖으로 뺀다 */
const isBetweenAd = (n: unknown): boolean => isEl(n) && n.type === AdSlot && (n.props as { position?: string }).position === 'between-tools'

/** 가이드에서 관련 도구·면책·광고를 골라내 시트 밖으로 — 최상위 목록(평면형)과 레거시 flex 래퍼 1단계(래퍼형)만 본다.
 *  rel=false면 관련 도구는 건드리지 않는다(면책·광고만) */
function hoist(list: ReactNode[], rel: boolean, depth = 0): Split {
  const s: Split = { body: [], related: [], relLegacy: [], disclaimers: [], ads: [] }
  for (let i = 0; i < list.length; i++) {
    const n = list[i]
    if (!isEl(n)) { s.body.push(n); continue }
    if (n.type === Disclaimer) { s.disclaimers.push(n); continue }
    if (isBetweenAd(n)) { s.ads.push(n); continue }
    if (!rel) {
      if (isHost(n)) {
        const dk = kidsOf(n)
        if (dk.length > 0 && dk.every(c => isEl(c) && c.type === Disclaimer)) { s.disclaimers.push(...(dk as El[])); continue }
        if (depth === 0 && n.type === 'div' && dk.length > 1) {
          const inner = hoist(dk, rel, depth + 1)
          if (inner.disclaimers.length || inner.ads.length) {
            s.body.push(cloneElement(n, undefined, ...inner.body)); s.disclaimers.push(...inner.disclaimers); s.ads.push(...inner.ads)
            continue
          }
        }
      }
      s.body.push(n); continue
    }
    if (n.type === RelatedTools) { s.related.push(n); continue }
    if (isRelHeading(n)) { // 평면형: 제목 + 바로 다음 그리드
      const next = list[i + 1]
      s.relLegacy.push(next !== undefined ? [n, next] : [n]); i++; continue
    }
    if (typeof n.type === 'function' && !KNOWN.has(n.type) && kidsOf(n).some(isRelHeading)) { s.relLegacy.push([n]); continue } // <Section><H2>함께…</H2>…</Section>
    if (isHost(n)) {
      const dk = kidsOf(n)
      if (dk.some(isRelHeading)) { s.relLegacy.push([n]); continue }                      // <section><h2>함께…</h2><div/></section>
      if (dk.some(c => isEl(c) && c.type === RelatedTools) && dk.every(c => isEl(c) && c.type === RelatedTools)) { s.related.push(...(dk as El[])); continue }
      if (dk.length > 0 && dk.every(c => isEl(c) && c.type === Disclaimer)) { s.disclaimers.push(...(dk as El[])); continue } // <section><Disclaimer/></section>
      if (depth === 0 && n.type === 'div' && dk.length > 1) {                              // 래퍼형: <div flex column>{섹션들}</div>
        const inner = hoist(dk, rel, depth + 1)
        if (inner.related.length || inner.relLegacy.length || inner.disclaimers.length || inner.ads.length) {
          s.body.push(cloneElement(n, undefined, ...inner.body))
          s.related.push(...inner.related); s.relLegacy.push(...inner.relLegacy); s.disclaimers.push(...inner.disclaimers); s.ads.push(...inner.ads)
          continue
        }
      }
    }
    s.body.push(n)
  }
  return s
}

/** 본문 끝(평면형 끝 또는 래퍼형 마지막 래퍼의 끝)에 남은 광고 — 그대로 두면 FAQ → 광고 → 참고 자료가 된다(§11 금지) → 시트 밖으로 */
function popTrailingAds(body: ReactNode[], ads: El[]): ReactNode[] {
  const out = [...body]
  const tail: El[] = []
  for (;;) {
    const last = out[out.length - 1]
    if (isAd(last)) { tail.unshift(last as El); out.pop(); continue }
    if (isEl(last) && last.type === 'div') { // 래퍼형: <div flex column>{…, <AdSlot/>}</div>
      const dk = kidsOf(last)
      let k = dk.length
      while (k > 0 && isAd(dk[k - 1])) k--
      if (k < dk.length && k > 0) { tail.unshift(...(dk.slice(k) as El[])); out[out.length - 1] = cloneElement(last, undefined, ...dk.slice(0, k)) }
    }
    break
  }
  ads.push(...tail)
  return out
}

/** 본문 h2에 id(sec-N)를 붙이고 목차를 모은다. Faq·SourceNotes 컴포넌트는 알려진 id로 목차에 넣는다 */
function withHeadingIds(nodes: ReactNode[], toc: TocItem[]): ReactNode[] {
  let n = 0
  const label = (s: string) => {
    const t = s.replace(/\s+/g, ' ').replace(/^[^0-9A-Za-zㄱ-ㆎ가-힣([「"'“‘]+/, '').replace(/\s*\((FAQ|Q&A)\)\s*$/i, '').trim()
    return t.length > 36 ? t.slice(0, 35) + '…' : t
  }
  const walk = (node: ReactNode, depth: number): ReactNode => {
    if (Array.isArray(node)) {
      let changed = false
      const out = node.map(c => { const r = walk(c, depth + 1); if (r !== c) changed = true; return r })
      return changed ? out : node
    }
    if (!isEl(node) || depth > MAX_DEPTH) return node
    if (node.type === Faq) {
      const p = node.props as { id?: string; title?: string; items?: unknown[] }
      if (Array.isArray(p.items) && p.items.length > 0) toc.push({ id: p.id ?? 'faq', label: p.title ?? '자주 묻는 질문' })
      return node
    }
    if (node.type === SourceNotes) {
      const p = node.props as { title?: string; refs?: boolean; meta?: { sources?: unknown[] } }
      if (p.refs !== false && Array.isArray(p.meta?.sources) && p.meta.sources.length > 0) toc.push({ id: 'refs', label: p.title ?? '참고 자료' })
      return node
    }
    if (node.type === 'h2') {
      if (node.props['data-nonum'] !== undefined) return node
      const text = label(textOf(node.props.children))
      if (!text) return node
      if (typeof node.props.id === 'string' && node.props.id) { toc.push({ id: node.props.id, label: text }); return node }
      const id = `sec-${++n}`
      toc.push({ id, label: text })
      return cloneElement(node, { id })
    }
    const descend = isHost(node) || node.type === Fragment || (typeof node.type === 'function' && !KNOWN.has(node.type))
    if (!descend || node.props.children === undefined) return node
    const c = node.props.children
    const r = walk(c, depth + 1)
    if (r === c) return node
    return Array.isArray(r) ? cloneElement(node, undefined, ...r) : cloneElement(node, undefined, r)
  }
  return nodes.map(x => walk(x, 0))
}

/** 읽는 시간(분) — 본문 글자 수 / 500(한국어 평균 읽기 속도 근사). Faq 답변 포함 */
function readMinutes(nodes: ReactNode[]): number {
  let chars = 0
  const visit = (n: ReactNode, depth: number) => {
    if (depth > MAX_DEPTH || n == null || typeof n === 'boolean') return
    if (typeof n === 'string' || typeof n === 'number') { chars += String(n).replace(/\s+/g, '').length; return }
    if (Array.isArray(n)) { n.forEach(c => visit(c, depth + 1)); return }
    if (!isEl(n)) return
    if (n.type === Faq) {
      const items = (n.props as { items?: { q?: unknown; a?: unknown }[] }).items
      if (Array.isArray(items)) for (const it of items) chars += `${it.q ?? ''}${String(it.a ?? '').replace(/<[^>]+>/g, '')}`.replace(/\s+/g, '').length
      return
    }
    visit(n.props.children, depth + 1)
  }
  nodes.forEach(n => visit(n, 0))
  return chars >= 600 ? Math.max(1, Math.round(chars / 500)) : 0
}

export default function ToolPage({ width = 760, slug, toc, article = 'v1', guideTitle, resultLabel, related = true, children }: ToolPageProps) {
  const cat = catOf(slug)
  const items = Children.toArray(children)
  // 화면에 실제로 렌더되는 <UpdatedMeta basis>(템플릿 식까지 해석된 값)가 있으면 그것을 적용 기준으로 쓴다 — JSON은 정적 추출본
  const um = items.find((c): c is El => isEl(c) && c.type === UpdatedMeta)
  const baseMeta = getToolMeta(slug)
  const umBasis = um && typeof um.props.basis === 'string' ? um.props.basis : undefined
  const meta = baseMeta && umBasis ? { ...baseMeta, basis: umBasis } : baseMeta

  /* ── 머리 ─────────────────────────────────────── */
  const gi = items.findIndex(c => isEl(c) && c.type === GuideDivider)
  let h = 0
  while (h < items.length && h !== gi && isEl(items[h]) && HEAD_TYPES.has((items[h] as El).type)) h++
  const hasToolHeader = items.slice(0, h).some(c => isEl(c) && c.type === ToolHeader)
  let needByline = !hasToolHeader && !!meta
  const head = items.slice(0, h).map(c => {
    if (needByline && meta && isEl(c) && c.type === UpdatedMeta) {
      needByline = false
      return cloneElement(c, { byline: <ToolByline meta={meta} showDate={false} showSources={false} inline /> })
    }
    return c
  })

  /* ── 도구 · 가이드 ─────────────────────────────── */
  const tool = items.slice(h, gi < 0 ? undefined : gi)
  const guideRaw = gi < 0 ? [] : items.slice(gi + 1)
  const split = hoist(guideRaw, related)
  // 광고(§11): 가이드 안 'between-tools'·본문 끝 광고는 시트 밖 '관련 도구 앞'으로 — FAQ·참고 자료·면책 사이에 두지 않는다
  split.body = popTrailingAds(split.body, split.ads)

  // 참고 자료: 페이지가 SourceNotes를 직접 넣었으면 그대로, 아니면 끝에 자동. 레거시 '참고 자료' 섹션이 있으면 제목을 '공식 출처'로
  const hasOwnNotes = split.body.some(c => hasType(c, SourceNotes))
  const hasLegacyRefs = split.body.some(function find(c: ReactNode): boolean {
    if (!isEl(c)) return false
    if ((c.type === 'h2' || c.type === 'h3') && REFS_RE.test(textOf(c.props.children))) return true
    return isHost(c) ? kidsOf(c).some(find) : false
  })
  const autoNotes = meta && !hasOwnNotes && guideRaw.length > 0
    ? <SourceNotes key="tp-notes" meta={meta} title={hasLegacyRefs ? '공식 출처' : '참고 자료'} />
    : null
  const hasRefs = !!meta && meta.sources.length > 0 && (hasOwnNotes || !!autoNotes)

  const autoToc: TocItem[] = []
  const guideBody = withHeadingIds(autoNotes ? [...split.body, autoNotes] : split.body, autoToc)
  const tocItems = toc ?? autoToc

  // 관련 도구: 명시 <RelatedTools>(current 주입) → 레거시 블록 변환 → 기본값
  const relatedOut: ReactNode[] = []
  if (related) {
    split.related.forEach((r, i) => relatedOut.push(cloneElement(r, { key: `tp-rel-${i}`, current: (r.props as { current?: string }).current ?? slug })))
    if (split.relLegacy.length) {
      const links = split.related.length === 0 ? readLinks(split.relLegacy.flat()) : []
      if (links.length > 0) relatedOut.push(<RelatedTools key="tp-rel-legacy" items={links} current={slug} />)
      else split.relLegacy.forEach((b, i) => relatedOut.push(<Fragment key={`tp-rel-raw-${i}`}>{b}</Fragment>)) // 읽지 못한 레거시 블록은 그대로
    }
    if (relatedOut.length === 0 && gi >= 0) relatedOut.push(<RelatedTools key="tp-rel-default" current={slug} />)
  }

  const ld = toolLdExtras(slug)
  const railResult = meta ? meta.hasResult !== false : true

  return (
    <div className={width === 880 ? `${styles.tp} ${styles.tpWide}` : styles.tp} data-cat={cat} data-tool-page="">
      <div className={styles.tpMain}>
        <ToolBreadcrumb />
        {head}
        {needByline && meta && <ToolByline meta={meta} refsAnchor={hasRefs} className={styles.tpByline} />}
        {tool.length > 0 && <div className={styles.tpTool} data-tool-region="">{tool}</div>}
        {guideBody.length > 0 && (
          <ArticleSheet title={guideTitle ?? '알아두면 좋은 내용'} meta={meta} toc={tocItems} legacy={article === 'v1'} readMinutes={readMinutes(split.body)}>
            {guideBody}
          </ArticleSheet>
        )}
        {split.ads}
        {relatedOut}
        {split.disclaimers}
      </div>
      <aside className={styles.tpRail} aria-label="이 계산기 정보">
        {meta && <BasisCard meta={meta} hasRefs={hasRefs} />}
        <div className={styles.tpSticky}>
          {railResult && <RailResult label={resultLabel ?? '계산 결과'} />}
          <RailToc items={tocItems.length ? tocItems : undefined} />
          {/* 광고③ 300×250 — slotId가 없으면 AdSlot이 null(예약 높이·라벨은 AdSlot 소관). 'sidebar' = 새 AdSlot의 'rail' 호환 이름 */}
          <AdSlot position="sidebar" />
        </div>
      </aside>
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />}
    </div>
  )
}
