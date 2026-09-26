'use client'

/* components/SectionBar.tsx — 스펙 §10.17. 데스크톱(≥1024) 11분야 상시 바. app/layout.tsx에서 <Nav/> 바로 다음. sticky 아님.
   ─ 링크는 SSR HTML에 항상 포함(< 1024에서는 CSS로만 숨김) → 허브 11개가 전역 내비에 노출 (SEO-07)
   ─ 현재 분야: 허브 = aria-current="page", 그 분야의 도구 페이지 = aria-current="true" (링크 대상이 현재 페이지가 아니므로) */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { categories, totalTools } from '@/lib/tools'
import UiIcon from './UiIcon'
import styles from './SectionBar.module.css'

/** 섹션 바 전용 짧은 이름 — 정식 이름은 lib/tools.ts categories[].name */
const SHORT: Record<string, string> = {
  finance: '금융', health: '건강', cooking: '요리', life: '생활', sports: '스포츠', interior: '주거',
  unit: '단위', date: '날짜', art: '예술', edu: '교육', dev: '개발',
}

export default function SectionBar() {
  const segs = (usePathname() ?? '/').split('/').filter(Boolean)
  const cur = segs[0] === 'tools' ? segs[1] : undefined
  const isHub = segs.length === 2

  return (
    <nav className={styles.sb} aria-label="분야">
      <div className={styles.sbIn}>
        {categories.map(c => (
          <Link
            key={c.id}
            className={styles.sbLink}
            data-cat={c.id}
            href={`/tools/${c.id}`}
            aria-current={cur === c.id ? (isHub ? 'page' : 'true') : undefined}
          >
            {SHORT[c.id] ?? c.name}
          </Link>
        ))}
        <Link className={styles.sbAll} href="/tools" aria-current={segs.length === 1 && segs[0] === 'tools' ? 'page' : undefined}>
          전체 {totalTools}개<UiIcon name="chev-r" size={16} />
        </Link>
      </div>
    </nav>
  )
}
