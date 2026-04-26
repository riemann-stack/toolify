import RandomClient from './RandomClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/life/random',
  title: '랜덤 추첨기 — 숫자·항목 무작위 뽑기',
  description: '숫자 범위에서 랜덤 번호를 뽑거나, 직접 입력한 항목 중에서 무작위로 추첨합니다. 경품 추첨, 당번 정하기, 팀 나누기에 유용.',
  keywords: ['랜덤추첨기', '무작위추첨', '랜덤뽑기', '경품추첨기', '번호추첨기', '무작위번호'],
})

export default function RandomPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎲 랜덤 추첨기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        숫자 범위 추첨과 항목 추첨 두 가지 모드를 지원합니다.
      </p>

      <RandomClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>랜덤 추첨기 활용 사례</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { icon: '🎁', title: '경품 추첨', desc: '이벤트 참가자 명단을 입력하고 당첨자를 공정하게 추첨합니다.' },
              { icon: '🍽️', title: '메뉴 고르기', desc: '오늘 점심 메뉴를 못 정했다면 선택지를 입력하고 뽑아보세요.' },
              { icon: '👥', title: '팀 나누기', desc: '구성원 이름을 입력하고 여러 명을 동시에 추첨해 팀을 구성하세요.' },
              { icon: '📋', title: '당번 정하기', desc: '청소, 발표, 심부름 등 당번을 공정하게 정할 때 활용하세요.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{item.icon}</div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>공정한 무작위 추첨이란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            본 추첨기는 JavaScript의 Math.random() 함수를 활용한 의사난수(Pseudo-random) 알고리즘을 사용합니다. 각 항목은 동일한 확률로 선택되며, 이전 추첨 결과가 다음 결과에 영향을 미치지 않습니다.
          </p>
        </div>
      </div>
    </div>
  )
}