'use client'

import Link from 'next/link'
import styles from './Nav.module.css'

const categories = [
  { label: '금융·재테크', href: '/tools/finance' },
  { label: '건강·피트니스', href: '/tools/health' },
  { label: '생활·재미', href: '/tools/life' },
  { label: '단위·변환', href: '/tools/unit' },
  { label: '날짜·시간', href: '/tools/date' },
  { label: '개발자', href: '/tools/dev' },
]

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        Tool<span>ify</span>
      </Link>
      <ul className={styles.links}>
        {categories.map((c) => (
          <li key={c.href}>
            <Link href={c.href}>{c.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}