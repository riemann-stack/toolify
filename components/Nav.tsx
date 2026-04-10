'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Nav.module.css'

const categories = [
  { label: '금융·재테크',   href: '/tools/finance' },
  { label: '건강·피트니스', href: '/tools/health'  },
  { label: '생활·재미',    href: '/tools/life'    },
  { label: '단위·변환',    href: '/tools/unit'    },
  { label: '날짜·시간',    href: '/tools/date'    },
  { label: '개발자',       href: '/tools/dev'     },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          You<span>til</span>
        </Link>

        {/* 데스크탑 링크 */}
        <ul className={styles.links}>
          {categories.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className={pathname.startsWith(c.href) ? styles.linkActive : ''}
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* 모바일 햄버거 버튼 */}
        <button
          className={styles.burger}
          onClick={() => setOpen(o => !o)}
          aria-label="메뉴"
        >
          <span className={`${styles.burgerLine} ${open ? styles.burgerLineTop : ''}`} />
          <span className={`${styles.burgerLine} ${open ? styles.burgerLineMid : ''}`} />
          <span className={`${styles.burgerLine} ${open ? styles.burgerLineBot : ''}`} />
        </button>
      </nav>

      {/* 모바일 드로어 */}
      {open && (
        <div className={styles.drawer}>
          <div className={styles.drawerInner}>
            <p className={styles.drawerLabel}>카테고리</p>
            {categories.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={`${styles.drawerItem} ${pathname.startsWith(c.href) ? styles.drawerItemActive : ''}`}
                onClick={() => setOpen(false)}
              >
                {c.label}
              </Link>
            ))}
            <div className={styles.drawerDivider} />
            <Link href="/tools" className={styles.drawerItem} onClick={() => setOpen(false)}>
              전체 도구 보기
            </Link>
            <Link href="/about" className={styles.drawerItemSub} onClick={() => setOpen(false)}>
              소개
            </Link>
          </div>
        </div>
      )}

      {/* 드로어 오버레이 */}
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)} />
      )}
    </>
  )
}