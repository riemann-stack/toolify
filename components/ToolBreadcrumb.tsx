'use client'

/* ──────────────────────────────────────────────────────
   components/ToolBreadcrumb.tsx — 스펙 §10.15
   도구 상세 페이지 상단 가시적 breadcrumb — '홈 › 분야 › 도구명'
   ─ /tools/<cat>/<slug> 에서만 렌더 (분야 허브·비도구 경로는 null)
   ─ 구분자: 14px chevron(UiIcon, --gray-400 장식색) · 현재 항목 aria-current="page"
   ─ JSON-LD BreadcrumbList는 AutoToolJsonLd가 계속 담당 (여기는 시각 전용)
   ─ 배치 2가지를 CSS가 알아서 처리:
       ① 과도기: app/tools/layout.tsx 에서 <main> 직계 자식 → 자체 셸(폭·거터)
       ② ToolPage 채택 후: .tpMain 안 → 셸 없이 본문 칼럼에 정렬 (스펙 원형)
       ①② 가 한 페이지에 겹치면(ToolPage 채택이 layout 정리보다 먼저) ①을 CSS로 숨긴다.
   ─ 즐겨찾기 별표(공유 버튼 왼쪽) — 홈 [즐겨찾기] 탭 안내('도구 페이지에서 별표')의 실제 진입점
   ─ 과도기 '링크 공유' 버튼(행 오른쪽 끝) — 스펙 ⑤로 헤더 공유 버튼을 없앴는데 ResultHero(상위 30개)만으로는
     나머지 도구가 공유 수단을 잃는다 → 모든 도구 페이지에서 같은 동작(구 헤더 ShareButton)을 유지.
     ResultHero actions 에 공유가 들어간 페이지는 <ToolBreadcrumb share={false} /> 로 끈다.
   ────────────────────────────────────────────────────── */
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { categories } from '@/lib/tools'
import { loadUserNav, saveUserNav, toggleFavorite, USER_NAV_EVENT } from '@/lib/userNav'
import UiIcon from './UiIcon'
import styles from './ToolBreadcrumb.module.css'

const SITE = 'Youtil'
const TOAST_MS = 1500

type NavigatorWithShare = Navigator & {
  share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>
}

/** 공유 제목 — document.title 에 이미 브랜드가 있다(도구: 템플릿 '%s | Youtil', 홈: 'Youtil | …').
 *  끝의 ' | Youtil' 을 떼고, 맨 앞에 브랜드가 없을 때만 한 번 붙여 브랜드가 정확히 1회만 나오게 한다. */
function shareHeadline(): string {
  const suffix = ` | ${SITE}`
  let base = document.title
  if (base.endsWith(suffix)) base = base.slice(0, -suffix.length)
  return base.startsWith(SITE) ? base : `${SITE} | ${base}`
}

/** 이 페이지 링크 공유 — Web Share 우선(카카오톡 등 미리보기 카드는 url 필드로 만들어짐),
 *  미지원이면 클립보드('Youtil | 제목 | URL'), 그것도 막히면 prompt 로 전체 문구 표시. 복사 표시는 1500ms 뒤 리셋.
 *  (구 components/Nav.tsx ShareButton 동작 그대로 — ResultHero actions 에서도 재사용 가능) */
export function ShareButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onShare = useCallback(async () => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    const headline = shareHeadline()
    const nav = navigator as NavigatorWithShare
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title: headline, text: headline, url })
      } catch {
        // 사용자가 공유 시트를 닫음 — 클립보드 폴백 안 함
      }
      return
    }
    const clipText = `${headline} | ${url}`
    try {
      await navigator.clipboard.writeText(clipText)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), TOAST_MS)
    } catch {
      window.prompt('이 페이지 링크를 복사하세요:', clipText)
    }
  }, [])

  return (
    <>
      <button type="button" className={className} onClick={onShare} data-copied={copied || undefined}>
        <UiIcon name={copied ? 'check' : 'share'} size={16} />
        <span>{copied ? '링크 복사됨' : '링크 공유'}</span>
      </button>
      {/* 복사 알림 — 버튼 이름 변경은 낭독되지 않을 수 있어 별도 polite 영역(role=status 는 주 결과 전용이라 쓰지 않음) */}
      <span className="srOnly" aria-live="polite">{copied ? '이 페이지 링크를 복사했어요' : ''}</span>
    </>
  )
}

/** 이 도구 즐겨찾기 토글 — 헤더 검색·메뉴의 별표와 같은 저장소(lib/userNav, youtil:nav:v1)를 쓴다.
 *  홈 [즐겨찾기] 탭·메뉴 목록에 바로 반영되도록 USER_NAV_EVENT(같은 탭)·storage(다른 탭)를 모두 듣는다.
 *  SSR·하이드레이션 중에는 꺼진 상태로 그린 뒤 마운트 후 실제 값으로 맞춘다. */
function FavButton({ href, name }: { href: string; name: string }) {
  const [fav, setFav] = useState(false)

  useEffect(() => {
    const sync = () => setFav(loadUserNav().favorites.includes(href))
    sync()
    window.addEventListener(USER_NAV_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(USER_NAV_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [href])

  const onToggle = useCallback(() => {
    saveUserNav(toggleFavorite(loadUserNav(), href))
  }, [href])

  return (
    <button
      type="button"
      className={styles.fav}
      aria-pressed={fav}
      aria-label={`즐겨찾기: ${name}`}
      title={fav ? '즐겨찾기에서 빼기' : '즐겨찾기에 추가'}
      onClick={onToggle}
    >
      <UiIcon name="star" size={16} />
    </button>
  )
}

export default function ToolBreadcrumb({ share = true }: { share?: boolean }) {
  const pathname = usePathname()

  const segments = (pathname ?? '').split('/').filter(Boolean)
  // 도구 상세만: ['tools', '<cat>', '<slug>']
  if (segments.length !== 3 || segments[0] !== 'tools') return null

  const category = categories.find(c => c.id === segments[1])
  if (!category) return null

  const href = `/tools/${segments[1]}/${segments[2]}`
  const tool = category.tools.find(t => t.href === href)
  if (!tool) return null

  return (
    <div className={styles.bc}>
      <nav className={styles.trail} aria-label="현재 위치">
        <Link href="/">홈</Link>
        <UiIcon name="chev-r" size={14} />
        <Link href={`/tools/${category.id}`}>{category.name}</Link>
        <UiIcon name="chev-r" size={14} />
        <span aria-current="page">{tool.name}</span>
      </nav>
      <FavButton href={href} name={tool.name} />
      {share && <ShareButton className={styles.share} />}
    </div>
  )
}
