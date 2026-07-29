import Link from 'next/link'
import { categories } from '@/lib/tools'
import AdSlot from './AdSlot'
import CategoryGuide from './CategoryGuide'
import CatIcon from './CatIcon'
import s from './CategoryView.module.css'

interface CategoryViewProps {
  catId: string
  /** 카테고리 헤드라인 설명 (없으면 기본 문구) */
  description?: string
}

export default function CategoryView({ catId, description }: CategoryViewProps) {
  const cat = categories.find((c) => c.id === catId)
  if (!cat) return null

  const colorVar = { ['--cat-color' as string]: cat.color } as React.CSSProperties

  return (
    <div className={s.canvas}>
      <div className={s.wrap} style={colorVar}>
        {/* 히어로 — 홈 벤토 카테고리 타일의 확대판 (솔리드 컬러 블록) */}
        <div className={s.hero}>
          <p className={s.crumb}>카테고리</p>
          <h1 className={s.title}>
            <span className={s.titleIcon}><CatIcon id={cat.id} size={28} /></span>
            <span className={s.titleText}>{cat.name}</span>
          </h1>
          {description && <p className={s.desc}>{description}</p>}
          <div className={s.metaRow}>
            <span className={s.metaChip}>
              <span className={s.metaChipDot} />
              총 {cat.tools.length}개 도구
            </span>
            <span className={s.metaChip}>로그인 없이 즉시 사용</span>
            <span className={s.metaChip}>모바일 최적화</span>
          </div>
        </div>

        <div className={s.grid}>
          {cat.tools.map((t) => (
            <Link key={t.href} href={t.href} className={s.card}>
              <span className={s.iconBox}><CatIcon id={cat.id} size={20} /></span>
              <span className={s.body}>
                <span className={s.name}>
                  {t.name}
                  {t.badge === 'hot' && <span className={`${s.badge} ${s.badgeHot}`}>HOT</span>}
                  {t.badge === 'new' && <span className={`${s.badge} ${s.badgeNew}`}>NEW</span>}
                </span>
                <span className={s.descLine}>{t.desc}</span>
              </span>
              <span className={s.arrow}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </Link>
          ))}
        </div>

        {/* 카테고리 본문(가이드 + FAQ) — 링크 그리드에 실질 콘텐츠 보강 */}
        <CategoryGuide catId={catId} />

        {/* 카테고리 랜딩은 isAdRestrictedPage에 걸려 현재 항상 null 렌더 —
            표시하려면 lib/ads.ts 게이팅을 먼저 완화해야 함. */}
        <div className={s.adSlot}>
          <AdSlot position="footer" minHeight={250} />
        </div>
      </div>
    </div>
  )
}
