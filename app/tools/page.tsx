import type { Metadata } from 'next'
import Link from 'next/link'
import { categories, totalTools } from '@/lib/tools'
import styles from './tools.module.css'

export const metadata: Metadata = {
  title: `전체 도구 목록 — 무료 계산기·유틸리티 ${totalTools}가지 | Youtil`,
  description: `연봉 계산기, BMI, 로또 번호 생성기, 부가세, 임신 주수 등 ${totalTools}가지 무료 온라인 도구를 한눈에 확인하세요.`,
}

export default function ToolsPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        전체 도구 목록
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '48px' }}>
        총 <strong style={{ color: 'var(--accent)' }}>{totalTools}가지</strong> 무료 도구 · 로그인 없이 즉시 사용
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {categories.map(cat => (
          <div key={cat.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: cat.color }}>
                  {cat.name}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>({cat.tools.length}개)</span>
              </div>
              <Link href={`/tools/${cat.id}`} style={{ fontSize: '12px', color: 'var(--muted)', textDecoration: 'none' }}>
                카테고리 보기 →
              </Link>
            </div>

            <div className={styles.toolGrid}>
              {cat.tools.map(tool => (
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
          </div>
        ))}
      </div>
    </div>
  )
}