// ── 날짜 차이 계산기 ──
import type { Metadata } from 'next'
import DiffClient from './DiffClient'

export const metadata: Metadata = {
  title: '날짜 차이 계산기 — 두 날짜 사이 일수 기간 계산 | Youtil',
  description: '두 날짜 사이의 일수, 주수, 개월수, 연수를 계산합니다. 근속 기간, 프로젝트 기간, 나이 차이 계산에 유용합니다.',
  keywords: ['날짜계산기', '날짜차이계산', '일수계산기', '기간계산기', '날짜간격계산', '날짜차이'],
}

export default function DiffPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📆 날짜 차이 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        두 날짜 사이의 정확한 기간을 계산합니다.
      </p>

      <DiffClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>날짜 차이 계산기 활용법</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '근속 기간 계산', content: '입사일부터 오늘까지 며칠을 근무했는지 계산할 수 있습니다. 퇴직금, 연차 계산의 기준이 되는 근속 기간을 정확히 파악하세요.' },
              { title: '계약 기간 확인', content: '임대차 계약, 서비스 구독, 보험 등 계약 시작일과 만료일 사이의 정확한 기간을 확인하세요.' },
              { title: '나이 차이 계산', content: '두 사람의 생년월일을 입력하면 정확한 나이 차이를 일 단위까지 계산할 수 있습니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent)', marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '윤년도 자동으로 계산되나요?', a: '네, 윤년과 월별 일수 차이가 자동으로 반영됩니다. 2월 29일이 포함된 기간도 정확히 계산됩니다.' },
              { q: '날짜 차이가 음수로 나오는 경우는?', a: '시작 날짜가 종료 날짜보다 나중일 때 음수가 표시됩니다. 날짜 교체 버튼(⇅)을 눌러 순서를 바꾸면 됩니다.' },
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