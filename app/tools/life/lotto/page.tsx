import LottoClient from './LottoClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/life/lotto',
  title: '로또 번호 생성기 — 무료 자동 추첨 6/45',
  description: '로또 6/45 번호를 무료로 자동 생성합니다. 1~5게임 동시 생성 가능. 로또 당첨 확률과 역대 많이 나온 번호 정보 제공.',
  keywords: ['로또번호생성기', '로또자동', '로또번호추천', '로또6/45', '로또당첨번호', '로또번호'],
})

export default function LottoPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        생활·재미
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎰 로또 번호 생성기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        로또 6/45 번호를 무작위로 자동 생성합니다. 최대 5게임까지 한 번에 생성할 수 있어요.
      </p>

      <LottoClient />

      {/* SEO 콘텐츠 */}
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>로또 6/45 당첨 확률</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            로또 6/45는 1~45까지의 숫자 중 6개를 선택하는 복권입니다. 45개 중 6개를 뽑는 경우의 수는 약 814만 5,060가지로, 1등 당첨 확률은 <strong style={{ color: 'var(--text)' }}>약 814만 분의 1</strong>입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>등수</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>조건</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>당첨 확률</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>평균 당첨금</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1등', '6개 일치', '1/8,145,060', '약 20억~30억원', '#FFD700'],
                  ['2등', '5개 + 보너스', '1/1,357,510', '약 5,000만~7,000만원', '#C8C8C8'],
                  ['3등', '5개 일치', '1/35,724', '약 150만~200만원', '#CD7F32'],
                  ['4등', '4개 일치', '1/733', '5만원 고정', 'var(--text)'],
                  ['5등', '3개 일치', '1/45', '5,000원 고정', 'var(--text)'],
                ].map(([rank, condition, prob, prize, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 700 }}>{rank}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{condition}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{prob}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{prize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>로또 구매 방법 및 추첨 일정</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '구매 방법', content: '전국 로또 판매점 또는 동행복권 공식 앱(인터넷 구매)에서 구매할 수 있습니다. 1게임에 1,000원이며, 1회 최대 5게임까지 자동·수동·반자동 선택이 가능합니다.' },
              { title: '추첨 일정', content: '매주 토요일 오후 8시 35분에 생방송으로 추첨이 진행됩니다. 당첨 번호는 동행복권 홈페이지와 각 판매점에서 확인할 수 있습니다.' },
              { title: '당첨금 수령', content: '5등(5,000원)은 판매점에서 즉시 수령 가능합니다. 4등 이상은 농협은행 전국 지점 또는 동행복권 본사에서 수령하며, 1등~3등은 세금(22%)을 제외한 금액을 수령합니다.' },
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
              {
                q: '자동 번호와 수동 번호 중 당첨 확률이 높은 것은?',
                a: '수학적으로 자동과 수동의 당첨 확률은 동일합니다. 각 번호 조합은 독립적이며 어떤 번호도 다른 번호보다 당첨 확률이 높지 않습니다. 과거 당첨 번호가 미래 결과에 영향을 주지 않습니다.',
              },
              {
                q: '로또 번호 생성기로 만든 번호도 실제로 사용할 수 있나요?',
                a: '네, 생성된 번호를 판매점에서 수동으로 직접 입력하거나 동행복권 앱에서 수동 구매 시 활용할 수 있습니다. 본 생성기는 순수 난수 알고리즘을 사용하므로 공정한 무작위 번호를 제공합니다.',
              },
              {
                q: '로또 당첨금에 세금이 붙나요?',
                a: '로또 당첨금은 기타소득으로 분류됩니다. 3만 원 이하는 비과세, 3만 원 초과~200만 원 이하는 22% 원천징수, 200만 원 초과는 33% 원천징수가 적용됩니다. 1등 당첨금은 보통 22~33%의 세금이 공제됩니다.',
              },
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