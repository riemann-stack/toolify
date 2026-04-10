import type { Metadata } from 'next'
import DdayClient from './DdayClient'

export const metadata: Metadata = {
  title: 'D-day 계산기 — 날짜 카운트다운 디데이 계산 | Youtil',
  description: '특정 날짜까지 남은 일수를 계산합니다. 수능, 결혼식, 시험, 여행, 군 전역일 등 중요한 날짜를 디데이로 관리하세요.',
  keywords: ['디데이계산기', 'D-day계산기', '날짜카운트다운', '남은일수계산', '디데이', 'dday계산기'],
}

export default function DdayPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📅 D-day 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        목표 날짜까지 남은 일수를 계산합니다. 여러 개의 디데이를 동시에 관리할 수 있어요.
      </p>

      <DdayClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>D-day 계산기 활용 사례</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { icon: '📚', title: '시험 준비', desc: '수능, 공무원 시험, 자격증 시험까지 남은 일수를 확인해 학습 계획을 세우세요.' },
              { icon: '💍', title: '결혼·기념일', desc: '결혼식, 청첩장 발송일, 웨딩 촬영일 등 중요한 날짜를 관리하세요.' },
              { icon: '✈️', title: '여행·이벤트', desc: '여행 출발일, 콘서트, 스포츠 경기 등 기대되는 날까지 카운트다운하세요.' },
              { icon: '🎖️', title: '군 복무', desc: '전역일까지 남은 일수를 계산해 군 복무 기간을 관리하세요.' },
              { icon: '🏃', title: '마라톤·대회', desc: '마라톤 대회, 스포츠 이벤트 참가일까지 훈련 일정을 계획하세요.' },
              { icon: '🎓', title: '졸업·입학', desc: '졸업식, 입학식, 개강일 등 학사 일정을 미리 파악하세요.' },
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
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: 'D-day와 D+는 어떻게 다른가요?', a: 'D-day는 목표 날짜가 오늘보다 미래일 때 남은 일수를 나타냅니다. D+는 목표 날짜가 이미 지난 경우로 경과된 일수를 나타냅니다. 예를 들어 입사일이 100일 전이라면 D+100으로 표시됩니다.' },
              { q: '오늘이 D-day이면 어떻게 표시되나요?', a: '목표 날짜가 오늘이면 D-day(D-0)로 표시됩니다. 내일부터는 D+1, D+2로 경과 일수가 증가합니다.' },
              { q: '디데이를 저장할 수 있나요?', a: '현재 버전은 페이지를 새로고침하면 초기화됩니다. 중요한 디데이는 따로 메모해두거나 북마크를 활용하세요. 향후 저장 기능 추가를 검토 중입니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}