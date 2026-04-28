import Link from 'next/link'
import { categories } from '@/lib/tools'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

const CATEGORY_ID = 'edu'
const cat = categories.find(c => c.id === CATEGORY_ID)!

export const metadata = buildMetadata({
  path: '/tools/edu',
  title: '교육·학습 도구 — 과학·수학·언어 학습 시각화',
  description: '학생 과제·교사 수업·일반 호기심을 위한 무료 교육 도구 모음. 과학 시각화, 화학·물리 계산기, 학습 시뮬레이션을 제공합니다.',
  keywords: ['교육도구', '학습계산기', '과학시각화', '학생과제', '교사수업', '과학실험'],
})

const COMING_SOON: Array<{ icon: string; name: string; desc: string }> = [
  { icon: '🌟', name: '빛의 속도 체감 시각화',  desc: '빛이 달·태양·별까지 가는 시간 비교' },
  { icon: '⚡', name: '옴의 법칙 계산기',       desc: '전압·전류·저항·전력 자동 환산' },
  { icon: '🧪', name: '화학 농도 계산기',       desc: 'mol·M·% 농도·희석 계산' },
  { icon: '🧬', name: 'pH 계산기',              desc: '산·염기·완충용액 pH 계산' },
  { icon: '🔭', name: '진자 시뮬레이션',        desc: '단진자 주기·중력 가속도 실험' },
  { icon: '🧮', name: '수학 함수 그래프',       desc: '이차함수·삼각함수 시각화' },
]

export default function EduCategoryPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>카테고리</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔬 교육·학습
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        과학·수학·언어 학습을 돕는 시각화 도구와 계산기 모음. 학생 과제·교사 수업·일반 호기심을 위한 무료 도구.
        총 <strong style={{ color: cat.color }}>{cat.tools.length}개 도구</strong> · 로그인 없이 즉시 사용
      </p>

      {/* 출시된 도구 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
        {cat.tools.map(t => (
          <Link key={t.href} href={t.href} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderLeft: `3px solid ${cat.color}`,
            borderRadius: '14px', padding: '20px 24px', textDecoration: 'none',
            position: 'relative',
          }}>
            <span style={{ fontSize: '24px', flexShrink: 0 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{t.desc}</div>
            </div>
            {t.badge === 'hot' && (
              <span style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '10px', background: 'rgba(255,62,62,0.15)', color: '#FF6B6B', border: '1px solid rgba(255,62,62,0.3)', borderRadius: '99px', padding: '2px 8px' }}>HOT</span>
            )}
            {t.badge === 'new' && (
              <span style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '10px', background: 'rgba(62,255,208,0.12)', color: cat.color, border: `1px solid ${cat.color}66`, borderRadius: '99px', padding: '2px 8px' }}>NEW</span>
            )}
          </Link>
        ))}
      </div>

      {/* 출시 예정 안내 */}
      <div style={{
        background: 'rgba(62,255,208,0.05)',
        border: '1px solid rgba(62,255,208,0.25)',
        borderRadius: '14px',
        padding: '20px 22px',
      }}>
        <p style={{
          fontSize: '12px',
          color: cat.color,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '14px',
        }}>
          🚧 곧 추가됩니다
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
          {COMING_SOON.map((c, i) => (
            <div key={i} style={{
              background: 'var(--bg2)',
              border: '1px dashed var(--border)',
              borderRadius: '10px',
              padding: '12px 14px',
              opacity: 0.7,
            }}>
              <p style={{ fontSize: '20px', marginBottom: '6px' }}>{c.icon}</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, marginBottom: '2px' }}>{c.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5, opacity: 0.85 }}>{c.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '14px', lineHeight: 1.7, textAlign: 'center' }}>
          원하는 도구가 있다면 <Link href="/contact" style={{ color: cat.color, textDecoration: 'none' }}>문의</Link>로 알려주세요.
        </p>
      </div>

      {/* 카테고리 푸터 광고 슬롯 */}
      <div style={{ marginTop: '40px' }}>
        <AdSlot position="footer" minHeight={250} />
      </div>
    </div>
  )
}
