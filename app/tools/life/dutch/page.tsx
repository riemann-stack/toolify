import type { Metadata } from 'next'
import DutchClient from './DutchClient'

export const metadata: Metadata = {
  title: '더치페이 N빵 계산기 — 술값 따로, 1원 단위 절삭 | Youtil',
  description: '총액과 인원수를 입력해 1인당 금액을 계산합니다. 술값 따로 계산, 100원·1,000원 단위 올림 옵션 지원.',
  keywords: ['더치페이계산기', 'N빵계산기', '더치페이', '회식비계산기', '1인당금액계산기', '술값계산기'],
}

export default function DutchPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🍻 더치페이(N빵) 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        회식비를 공정하게 나눠요. 술값 별도 계산과 단위 올림 옵션을 지원합니다.
      </p>

      <DutchClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>더치페이 계산 시 유용한 팁</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '100원 단위 올림 vs 내림', content: '1인당 금액이 딱 나누어 떨어지지 않을 때는 올림을 사용하면 잔돈이 남아 공금으로 활용할 수 있습니다. 모임 카운터에서 팁이나 주차비로 활용하기 좋습니다.' },
              { title: '술값 따로 계산이 필요한 경우', content: '술을 마시지 않는 인원이 있거나, 음식과 주류의 비율이 크게 차이날 때 술값을 따로 계산하면 더 공정합니다. 음주 여부에 따라 금액을 구분할 수 있습니다.' },
              { title: '대규모 모임 정산 팁', content: '10명 이상 대규모 모임에서는 카카오페이, 토스 등의 정산 기능을 함께 활용하면 편리합니다. 인원수를 정확히 파악한 뒤 계산기로 1인당 금액을 먼저 확인하세요.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent)', marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '더치페이(Dutch Pay)란?', a: '더치페이는 각자 자신의 몫을 내는 방식을 의미합니다. 원래 영어권에서 "go Dutch"라는 표현에서 유래했습니다. 한국에서는 회식, 모임 비용을 균등하게 나누는 N빵 방식으로 많이 활용됩니다.' },
              { q: '술을 안 마신 사람도 술값을 내야 하나요?', a: '이 부분은 모임마다 문화가 다릅니다. 더치페이 계산기의 술값 따로 계산 옵션을 사용하면 음식값은 전원이 나누고 술값은 음주자들끼리 나누는 방식으로 정산할 수 있어 형평성 논란을 줄일 수 있습니다.' },
              { q: '카드 결제 시 수수료는 어떻게 처리하나요?', a: '일반적으로 소액 이체 시에는 카카오페이, 토스 등 무료 송금 서비스를 활용하면 수수료 없이 정산할 수 있습니다. 1,000원 단위로 올림하면 잔돈 처리가 간편합니다.' },
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