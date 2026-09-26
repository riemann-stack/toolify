'use client'

/* 모바일 하단 내비 — 스펙 §10.17. 640px 이하 전용 고정 탭바, 5탭: 홈 · 분야(현재 분야 점) · 검색 · 가이드 · 최근.
   전제: AdSense 앵커 광고는 콘솔에서 OFF (앵커와 병존 불가 — z-index 최상위 오버레이가
   탭바를 덮어 UX·정책 문제. 앵커를 다시 켜려면 이 컴포넌트를 먼저 내릴 것).
   ─ '검색'·'최근'은 Nav 드로어를 여는 커스텀 이벤트를 쏜다(Nav.tsx가 수신).
     '최근'은 드로어의 '최근·즐겨찾기' 탭 — 데이터는 기존 localStorage 키 youtil:nav:v1(lib/userNav) 그대로. 키 개명 금지.
   ─ 탭바에 가리는 콘텐츠가 없도록 app/layout.tsx 가 <html>에 styles.withTabBar 를 달아
     --bottom-nav-h(≤640: 탭바 높이 + safe-area, 그 외 0) 변수 · body 하단 패딩 · scroll-padding-bottom 을 준다.
     고정(fixed) 하단 UI(토스트·스티키 결과 바)는 bottom: calc(var(--bottom-nav-h, 0px) + Npx) 로 띄울 것. */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { categories } from '@/lib/tools'
import UiIcon from './UiIcon'
import styles from './BottomNav.module.css'

/** Nav가 수신하는 드로어 열기(검색 모드) 이벤트 이름 (Nav.tsx와 한 쌍) */
export const OPEN_SEARCH_EVENT = 'youtil:open-search'
/** Nav 드로어를 '최근·즐겨찾기' 탭으로 여는 이벤트 이름 (Nav.tsx와 한 쌍) */
export const OPEN_RECENT_EVENT = 'youtil:open-recent'

const CAT_IDS = new Set(categories.map(c => c.id))

export default function BottomNav() {
  const p = usePathname() ?? '/'
  const segs = p.split('/').filter(Boolean)
  const cat = segs[0] === 'tools' && segs[1] && CAT_IDS.has(segs[1]) ? segs[1] : undefined
  /** 정확히 그 페이지 = 'page', 그 아래 경로 = 'true'(현재 위치 묶음) */
  const current = (href: string): 'page' | 'true' | undefined => {
    if (p === href) return 'page'
    if (href !== '/' && p.startsWith(`${href}/`)) return 'true'
    return undefined
  }

  return (
    <nav className={styles.tabBar} aria-label="하단 메뉴" data-cat={cat}>
      <Link className={styles.tab} href="/" aria-current={current('/')}>
        <UiIcon name="home" size={24} />
        <span className={styles.tabLabel}>홈</span>
      </Link>
      <Link className={styles.tab} href="/tools" aria-current={current('/tools')}>
        <UiIcon name="grid" size={24} />
        <span className={styles.tabLabel}>분야</span>
        {cat && <i className={styles.tabDot} aria-hidden="true" />}
      </Link>
      <button
        className={styles.tab}
        type="button"
        aria-haspopup="dialog"
        onClick={() => window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT))}
      >
        <UiIcon name="search" size={24} />
        <span className={styles.tabLabel}>검색</span>
      </button>
      <Link className={styles.tab} href="/collections" aria-current={current('/collections')}>
        <UiIcon name="compass" size={24} />
        <span className={styles.tabLabel}>가이드</span>
      </Link>
      <button
        className={styles.tab}
        type="button"
        aria-haspopup="dialog"
        aria-label="최근·즐겨찾기"
        onClick={() => window.dispatchEvent(new CustomEvent(OPEN_RECENT_EVENT))}
      >
        <UiIcon name="history" size={24} />
        <span className={styles.tabLabel}>최근</span>
      </button>
    </nav>
  )
}
