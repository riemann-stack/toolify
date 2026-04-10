import type { Metadata } from 'next'
import LadderClient from './LadderClient'

export const metadata: Metadata = {
  title: '사다리타기 — 온라인 무료 사다리 게임 | Youtil',
  description: '온라인 사다리타기 게임. 참가자와 결과를 입력하고 공정한 무작위 사다리를 생성합니다. 최대 8명 지원. 당번 정하기, 팀 나누기에 유용.',
  keywords: ['사다리타기', '온라인사다리타기', '사다리게임', '무료사다리타기', '당번정하기', '사다리타기게임'],
}

export default function LadderPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🪜 사다리타기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        참가자와 결과를 입력하고 공정한 사다리를 생성하세요.
      </p>

      <LadderClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>사다리타기 사용 방법</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { step: '1', title: '참가자 입력', content: '왼쪽에 참가자 이름을 입력합니다. 최대 8명까지 추가할 수 있습니다.' },
              { step: '2', title: '결과 입력', content: '오른쪽에 각 결과를 입력합니다. 당첨, 꽝, 역할 분담 등 자유롭게 입력하세요.' },
              { step: '3', title: '사다리 생성', content: '생성 버튼을 누르면 무작위로 사다리가 만들어집니다. 공정한 알고리즘으로 가로줄이 생성됩니다.' },
              { step: '4', title: '결과 확인', content: '참가자 이름을 클릭하면 해당 경로가 색상으로 표시되고 결과가 공개됩니다. 다시 클릭하면 숨겨집니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>{item.step}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{item.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>사다리타기 활용 사례</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            직장 내 점심 메뉴 결정, 청소 당번 배정, 발표 순서 정하기, 선물 교환 대상 정하기, 프로젝트 역할 분담 등 다양한 상황에서 공정한 결정을 내릴 때 활용할 수 있습니다. 온라인 사다리타기는 실물 사다리타기와 동일한 원리로 무작위 가로줄을 생성해 공정성을 보장합니다.
          </p>
        </div>
      </div>
    </div>
  )
}