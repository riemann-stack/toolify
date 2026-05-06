import Link from 'next/link'
import { categories, totalTools } from '@/lib/tools'
import AdSlot from '@/components/AdSlot'
import styles from './tools.module.css'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools',
  title: `전체 도구 목록 — 무료 계산기·유틸리티 ${totalTools}가지`,
  description: `연봉 계산기, BMI, 로또 번호 생성기, 부가세, 임신 주수 등 ${totalTools}가지 무료 온라인 도구를 한눈에 확인하세요.`,
})

export default function ToolsPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px', overflowX: 'hidden' }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        전체 도구 목록
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '48px' }}>
        총 <strong style={{ color: 'var(--accent)' }}>{totalTools}가지</strong> 무료 도구 · 로그인 없이 즉시 사용
      </p>

      {/* 카테고리 점프 네비게이션 — 모바일에서 sticky, 데스크톱에서도 빠른 이동 */}
      <nav className={styles.catNav} aria-label="카테고리 바로가기">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`#cat-${cat.id}`}
            className={styles.catChip}
            style={{ ['--chip-color' as string]: cat.color }}
          >
            <span className={styles.catChipIcon}>{cat.icon}</span>
            <span className={styles.catChipName}>{cat.name}</span>
            <span className={styles.catChipCount}>{cat.tools.length}</span>
          </a>
        ))}
      </nav>

      <div className={styles.catList}>
        {categories.map((cat, idx) => (
          <section key={cat.id} id={`cat-${cat.id}`} className={styles.catSection}>
            <div className={styles.catHeader}>
              <div className={styles.catHeaderLeft}>
                <span className={styles.catHeaderIcon}>{cat.icon}</span>
                <span className={styles.catHeaderName} style={{ color: cat.color }}>
                  {cat.name}
                </span>
                <span className={styles.catHeaderCount}>({cat.tools.length}개)</span>
              </div>
              <Link href={`/tools/${cat.id}`} className={styles.catHeaderMore}>
                카테고리 보기 →
              </Link>
            </div>

            <div className={styles.toolGrid}>
              {cat.tools.map((tool) => (
                <Link key={tool.href} href={tool.href} className={styles.toolCard}>
                  <span className={styles.toolIcon}>{tool.icon}</span>
                  <div className={styles.toolInfo}>
                    <div className={styles.toolName}>{tool.name}</div>
                    <div className={styles.toolDesc}>{tool.desc}</div>
                  </div>
                  {tool.badge === 'hot' && <span className={`${styles.badge} ${styles.badgeHot}`}>HOT</span>}
                  {tool.badge === 'new' && <span className={`${styles.badge} ${styles.badgeNew}`}>NEW</span>}
                </Link>
              ))}
            </div>

            {/* 카테고리 중간에 광고 슬롯 1회 삽입 */}
            {idx === Math.floor(categories.length / 2) - 1 && (
              <div style={{ marginTop: '32px' }}>
                <AdSlot position="between-tools" minHeight={250} />
              </div>
            )}
          </section>
        ))}
      </div>

      {/* 푸터 광고 슬롯 */}
      <div style={{ marginTop: '48px' }}>
        <AdSlot position="footer" minHeight={250} />
      </div>
    </div>
  )
}