'use client'
/* components/RailClient.tsx — 레일(≥1200) 미니 결과 + 목차 (스펙 §10.7). 도구별 수정 없이 200개 페이지에 적용된다.
   ─ RailResult: 도구 영역([data-tool-region])의 주 결과를 미러링한다.
       우선순위 ① [data-result-label](ResultHero) ② 도구 영역의 보이는 [role="status"] 중 숫자가 있는 첫 요소.
       레거시 결과 카드는 status 안에 라벨·보조 줄이 섞여 있으므로 '글자가 가장 큰 숫자 요소'를 히어로 숫자로 고른다.
       결과가 나중에 마운트되거나 교체돼도 따라가도록 도구 영역 전체를 MutationObserver로 본다(≥1200에서만).
       비용: 고른 요소를 캐시 — 글자만 바뀌면(characterData: 타이머 틱 등) 캐시 요소의 텍스트만 읽고(rAF 1프레임 1회),
       구조가 바뀔 때(childList)만 250ms 스로틀로 재스캔(getComputedStyle)한다.
       aria-hidden + tabIndex -1 → 중복 낭독 없음(주 결과의 role="status"가 유일한 라이브 영역).
   ─ RailToc: 서버가 만든 목차(ToolPage가 본문 h2에 id를 붙여 전달)를 쓰고, DOM의 본문 h2 수와 다르면
       (컴포넌트 안에서 렌더된 h2 등) DOM 기준으로 다시 만든다. IntersectionObserver로 현재 섹션 aria-current. ≥1200에서만 동작.
   ⚠ lib/toolMeta(서버 전용 JSON)를 import하지 않는다 — 타입만 가져온다. */
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import styles from './Rail.module.css'
import UiIcon from './UiIcon'
import type { TocItem } from './Article'

interface Mirror { num: string; unit: string; label?: string }
/** 한 번 고른 결과 요소 — 글자만 바뀌는 변경(characterData)은 이 캐시에서 텍스트만 다시 읽는다 */
interface Pick { target: HTMLElement; best: Element; label?: string }

const DIGIT = /\d/
const RAIL_MQ = '(min-width: 1200px)'
const MAX_SCAN = 400
const RESCAN_MS = 250

function ownText(el: Element): string {
  let t = ''
  el.childNodes.forEach(n => { if (n.nodeType === 3) t += n.textContent ?? '' })
  return t.replace(/\s+/g, ' ').trim()
}
function visible(el: Element): boolean {
  return el.getClientRects().length > 0
}
/** 결과 요소 고르기 — ① data-result-label ② 도구 영역의 보이는 status 중 숫자가 든 첫 요소 */
function findTarget(region: Element): HTMLElement | null {
  const labeled = region.querySelector<HTMLElement>('[data-result-label]')
  if (labeled && visible(labeled)) return labeled
  for (const el of Array.from(region.querySelectorAll<HTMLElement>('[role="status"]'))) {
    if (visible(el) && DIGIT.test(el.textContent ?? '')) return el
  }
  return null
}
/** 히어로 숫자 요소 고르기(비용 큼 — getComputedStyle) — 숫자를 직접 가진 요소 중 글자 크기가 가장 큰 것(레거시 결과 카드 대응).
 *  라벨: 히어로 앞(문서 순서)에 있는 짧은 글자(2~16자, 숫자 없음) 요소 — 예: 'BMI 체질량지수'·'레시피 배율' */
function pick(target: HTMLElement): Pick {
  let best: Element = target
  let bestSize = -1
  const all = [target, ...Array.from(target.querySelectorAll('*')).slice(0, MAX_SCAN)]
  for (const el of all) {
    if (!DIGIT.test(ownText(el)) || !visible(el)) continue
    const size = parseFloat(getComputedStyle(el).fontSize) || 0
    if (size > bestSize) { best = el; bestSize = size }
  }
  let label: string | undefined
  for (const el of all) {
    if (el === best || best.contains(el) || el.contains(best)) { if (el === best) break; continue }
    if (el.compareDocumentPosition(best) & Node.DOCUMENT_POSITION_PRECEDING) break // 히어로보다 뒤
    const t = ownText(el)
    if (t.length >= 2 && t.length <= 16 && !DIGIT.test(t) && /[가-힣A-Za-z]/.test(t) && visible(el)) { label = t; break }
  }
  return { target, best, label }
}
/** 고른 요소에서 숫자·단위 읽기(비용 작음 — 텍스트만) */
function read(p: Pick): Mirror | null {
  let text = (p.best.textContent ?? '').replace(/\s+/g, ' ').trim()
  if (text.length > 28) text = ownText(p.best)
  if (!text || !DIGIT.test(text)) return null
  if (text.length > 28) text = text.slice(0, 27) + '…'
  const m = text.match(/^(.*\d[\d,.]*)\s*([^\d\s][^\d]{0,5})$/)
  return m ? { num: m[1], unit: m[2], label: p.label } : { num: text, unit: '', label: p.label }
}

export function RailResult({ label }: { label: string }) {
  const [mirror, setMirror] = useState<Mirror | null>(null)
  const [lbl, setLbl] = useState(label)
  const targetRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const region = document.querySelector('[data-tool-region]')
    if (!region) return
    let cache: Pick | null = null
    let raf = 0
    let timer = 0
    let lastFull = 0
    let mo: MutationObserver | null = null
    const apply = (next: Mirror | null) => {
      setMirror(prev => (prev?.num === next?.num && prev?.unit === next?.unit ? prev : next))
      const l = cache?.target.getAttribute('data-result-label') || cache?.target.getAttribute('aria-label') || next?.label
      setLbl(l && l.length <= 20 ? l : label)
    }
    // 전체 재스캔: 결과 요소를 다시 찾고 히어로 숫자 요소를 다시 고른다(getComputedStyle) — 구조 변경(childList) 때만, 250ms 스로틀
    const full = () => {
      timer = 0
      lastFull = performance.now()
      const t = findTarget(region)
      targetRef.current = t
      cache = t ? pick(t) : null
      apply(cache ? read(cache) : null)
    }
    // 가벼운 갱신: 글자만 바뀐 경우(타이머 틱·숫자 갱신) 캐시한 요소의 텍스트만 읽는다 — 1프레임 1회
    const light = () => {
      raf = 0
      if (!cache || !cache.best.isConnected || !region.contains(cache.target)) { scheduleFull(); return }
      apply(read(cache))
    }
    const scheduleFull = () => {
      if (timer) return
      timer = window.setTimeout(full, Math.max(0, RESCAN_MS - (performance.now() - lastFull)))
    }
    const scheduleLight = () => { if (!raf) raf = requestAnimationFrame(light) }
    const detach = () => {
      mo?.disconnect(); mo = null
      if (raf) { cancelAnimationFrame(raf); raf = 0 }
      if (timer) { clearTimeout(timer); timer = 0 }
    }
    const attach = () => {
      if (mo) return
      full()
      mo = new MutationObserver(records => {
        if (records.some(r => r.type === 'childList')) scheduleFull()
        else scheduleLight()
      })
      mo.observe(region, { childList: true, subtree: true, characterData: true })
    }
    // 레일은 ≥1200에서만 보인다 — 그보다 좁으면 관찰 비용 0
    const mq = window.matchMedia(RAIL_MQ)
    const onChange = () => (mq.matches ? attach() : detach())
    onChange()
    mq.addEventListener?.('change', onChange)
    return () => { mq.removeEventListener?.('change', onChange); detach() }
  }, [label])

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = targetRef.current ?? document.querySelector<HTMLElement>('[data-tool-region]')
    if (!el) return
    e.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <a className={styles.rlResult} href="#result" aria-hidden="true" tabIndex={-1} onClick={onClick}>
      <span className={styles.rlResultL}>{lbl}<span>{mirror ? '결과 보기' : '입력하러 가기'}<UiIcon name="arrow-d" size={14} /></span></span>
      {mirror
        ? <span className={styles.rlResultN}>{mirror.num}{mirror.unit && <small>{mirror.unit}</small>}</span>
        : <span className={styles.rlResultN}>—<span className={styles.rlResultE}>값을 입력하면 여기에 결과가 표시됩니다</span></span>}
    </a>
  )
}

/** 머리의 이모지·기호 제거 — 한글·영숫자·여는 괄호/따옴표가 나올 때까지 (ES2017 타깃이라 유니코드 속성 이스케이프 대신 범위) */
const EMOJI_LEAD = /^[^0-9A-Za-z\u3131-\u318E\uAC00-\uD7A3([\u300C"'\u201C\u2018]+/
function cleanLabel(s: string): string {
  const t = s.replace(/\s+/g, ' ').replace(EMOJI_LEAD, '').replace(/\s*\((FAQ|Q&A)\)\s*$/i, '').trim()
  return t.length > 36 ? t.slice(0, 35) + '…' : t
}

export function RailToc({ items }: { items?: TocItem[] }) {
  const [list, setList] = useState<TocItem[]>(items ?? [])
  const [cur, setCur] = useState<string>('')
  useEffect(() => {
    // 레일(≥1200)에서만 동작 — 그보다 좁으면 목차는 ArticleSheet의 서버 인라인 목차뿐이라 h2 id 보정·관찰이 필요 없다
    let io: IntersectionObserver | null = null
    const detach = () => { io?.disconnect(); io = null }
    const attach = () => {
      if (io) return
      const hs = Array.from(document.querySelectorAll<HTMLElement>('[data-article] h2')).filter(h => !h.hasAttribute('data-nonum'))
      let next = items ?? []
      if (!items || items.length !== hs.length) {
        // 서버 목차와 DOM이 다르면(컴포넌트 안 h2 등) DOM 기준으로 — id 없는 h2에는 id를 붙인다(React가 관리하지 않는 속성)
        next = hs.map((h, i) => {
          if (!h.id) { let id = `sec-${i + 1}`; while (document.getElementById(id)) id += '-'; h.id = id }
          return { id: h.id, label: cleanLabel(h.textContent ?? '') }
        }).filter(t => t.label)
        setList(next)
      }
      const targets = next.map(t => document.getElementById(t.id)).filter((el): el is HTMLElement => !!el)
      if (targets.length === 0 || typeof IntersectionObserver === 'undefined') return
      io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) setCur(e.target.id) }, { rootMargin: '-20% 0px -70% 0px' })
      targets.forEach(h => io?.observe(h))
    }
    const mq = window.matchMedia(RAIL_MQ)
    const onChange = () => (mq.matches ? attach() : detach())
    // 첫 실행은 다음 프레임에(이펙트 본문에서 setState 직접 호출 금지 — react-hooks/set-state-in-effect)
    const raf = requestAnimationFrame(onChange)
    mq.addEventListener?.('change', onChange)
    return () => { cancelAnimationFrame(raf); mq.removeEventListener?.('change', onChange); detach() }
  }, [items])
  if (list.length < 2) return null
  return (
    <nav className={`${styles.rlCard} ${styles.rlToc}`} aria-label="이 페이지 목차">
      <p className={styles.rlTitle}><UiIcon name="list" size={16} />이 페이지에서</p>
      <ol>{list.map(t => <li key={t.id}><a href={`#${t.id}`} aria-current={cur === t.id ? 'true' : undefined}>{t.label}</a></li>)}</ol>
    </nav>
  )
}
