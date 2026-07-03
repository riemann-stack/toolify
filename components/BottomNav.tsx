'use client'

/* 모바일 하단 내비 — 640px 이하 전용 고정 탭바.
   전제: AdSense 앵커 광고는 콘솔에서 OFF (앵커와 병존 불가 — z-index 최상위 오버레이가
   탭바를 덮어 UX·정책 문제. 앵커를 다시 켜려면 이 컴포넌트를 먼저 내릴 것).
   검색 탭은 Nav 드로어(검색 자동 포커스)를 여는 커스텀 이벤트를 쏜다. */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UiIcon from './UiIcon'
import styles from './BottomNav.module.css'

/** Nav가 수신하는 드로어 열기 이벤트 이름 (Nav.tsx와 한 쌍) */
export const OPEN_SEARCH_EVENT = 'youtil:open-search'

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      {/* 고정 바에 가리는 콘텐츠가 없도록 문서 흐름에 같은 높이 확보 (모바일 한정, CSS 제어) */}
      <div className={styles.spacer} aria-hidden="true" />
      <nav className={styles.bar} aria-label="하단 메뉴">
        <Link href="/" className={`${styles.tab} ${pathname === '/' ? styles.tabActive : ''}`}>
          <UiIcon name="home" size={20} />
          <span className={styles.tabLabel}>홈</span>
        </Link>
        <button
          type="button"
          className={styles.tab}
          onClick={() => window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT))}
        >
          <UiIcon name="search" size={20} />
          <span className={styles.tabLabel}>검색</span>
        </button>
        <Link href="/tools" className={`${styles.tab} ${pathname === '/tools' ? styles.tabActive : ''}`}>
          <UiIcon name="grid" size={20} />
          <span className={styles.tabLabel}>전체 도구</span>
        </Link>
        <Link href="/collections" className={`${styles.tab} ${pathname.startsWith('/collections') ? styles.tabActive : ''}`}>
          <UiIcon name="compass" size={20} />
          <span className={styles.tabLabel}>가이드</span>
        </Link>
      </nav>
    </>
  )
}
