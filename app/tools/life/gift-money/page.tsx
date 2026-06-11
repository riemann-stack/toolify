import Link from 'next/link'
import GiftMoneyClient from './GiftMoneyClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import Disclaimer from '@/components/Disclaimer'

export const metadata = buildMetadata({
  path: '/tools/life/gift-money',
  title: '축의금·부의금 계산기 — 관계별 적정 경조사비 + 봉투·매너 가이드',
  description:
    '결혼식 축의금, 장례식 부의금을 관계·참석 여부·동반 인원으로 추천. 요즘 시세(5만·10만원)와 홀수 관례, 봉투 쓰는 법, 신권 매너까지 한 번에. 경조사비 적정 금액 가이드.',
  keywords: ['축의금계산기', '부의금계산기', '축의금얼마', '부의금얼마', '경조사비', '결혼식축의금', '조의금액수', '축의금봉투', '부의금봉투', '경조사비계산기'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '18px 20px',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = { cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }
const faqAnswer: React.CSSProperties = { marginTop: '10px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }

const th: React.CSSProperties = {
  padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700,
  color: 'var(--muted)', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)', whiteSpace: 'nowrap',
}
const td: React.CSSProperties = {
  padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text)',
  fontSize: '13px', whiteSpace: 'nowrap',
}

const RATE_ROWS = [
  { rel: '거래처·업무상', wed: '5만원', fun: '5만원' },
  { rel: '지인·이웃·동호회', wed: '5만원', fun: '5만원' },
  { rel: '직장 동료', wed: '5~10만원', fun: '5만원' },
  { rel: '친구', wed: '10만원', fun: '5~10만원' },
  { rel: '친한 친구', wed: '10~20만원', fun: '10만원' },
  { rel: '사촌·친척', wed: '10~20만원', fun: '10~20만원' },
  { rel: '가까운 친척', wed: '20~30만원', fun: '20~30만원' },
  { rel: '형제자매·직계가족', wed: '50~100만원', fun: '30~50만원' },
]

const FAQ_LD = [
  { q: '결혼식 축의금, 5만원과 10만원 중 얼마가 적당한가요?', a: '요즘은 <strong>식대(1인 5만원 안팎)가 올라</strong> 기준이 바뀌었습니다. 대략 <strong>예식에 참석해 식사하면 10만원, 못 가고 마음만 전하면 5만원</strong>이 무난한 선입니다. 직장 동료·지인은 5만원, 친구는 보통 10만원, 친한 친구나 가까운 사이일수록 10~20만원 이상으로 올라갑니다. 부부가 함께 참석하면 식대를 고려해 조금 더 얹는 경우가 많습니다.' },
  { q: '부의금(조의금)은 얼마가 적당한가요?', a: '부의금은 조문 자체가 예의라 식대 비중이 작아 축의금과 비슷하거나 약간 낮습니다. <strong>직장 동료·지인은 5만원, 친구는 5~10만원, 가까운 친구·친척은 10만원 이상</strong>이 일반적입니다. 사촌·친척은 10~20만원, 가까운 친척은 20~30만원, 형제자매·직계가족은 30~50만원 이상으로 관계가 가까울수록 커집니다.' },
  { q: '경조사비에 4만원·9만원은 왜 피하나요?', a: '전통적으로 금액은 <strong>홀수가 길하다(음양에서 양)</strong>고 보아 3·5·7만원을 선호합니다. <strong>4만원은 한자 ‘죽을 사(死)’를 연상</strong>시켜 피하고, <strong>9만원은 ‘아홉수’</strong>라 하여 꺼립니다. 다만 <strong>10만원은 꽉 찬 수</strong>로 길하게 보며, 그 이상은 10·5만원 단위(15·20·30·50)면 짝수여도 무방합니다.' },
  { q: '축의금은 새 돈, 부의금은 헌 돈이 맞나요?', a: '관례상 그렇습니다. <strong>축의금은 신권(새 지폐)</strong>으로 준비하면 “미리 축하를 준비했다”는 정성의 의미가 있어 은행·ATM에서 교환해 넣습니다. 반대로 <strong>부의금은 신권을 피하는</strong> 편인데, 빳빳한 새 돈은 마치 부고를 미리 준비한 듯한 인상을 줄 수 있기 때문입니다. 헌 지폐를 쓰거나 지폐를 반으로 접어 넣기도 합니다. 요즘은 크게 따지지 않는 분위기도 있습니다.' },
  { q: '봉투 앞·뒷면에는 뭐라고 쓰나요?', a: '<strong>축의금 봉투 앞면</strong>에는 “축 결혼(祝結婚)·축 화혼(祝華婚)·하의(賀儀)” 등을, <strong>부의금 봉투 앞면</strong>에는 “부의(賻儀)·근조(謹弔)·조의(弔意)”를 씁니다. 가장 무난한 건 축의는 “축 결혼”, 부의는 “부의”입니다. <strong>뒷면 왼쪽 아래</strong>에 본인 이름을 세로로 적고, 회사·모임 등 소속이 있으면 이름 오른쪽에 작게 덧붙입니다.' },
  { q: '결혼식에 못 가는데 축의금만 보내도 되나요?', a: '네, 괜찮습니다. 가까운 사람 편에 봉투를 전하거나 <strong>계좌로 송금</strong>하는 것도 요즘은 흔합니다. 다만 직접 참석해 식사하면 식대가 들기 때문에, 같은 관계라도 <strong>참석 시에는 한 단계 더, 부부·가족이 함께 가면 인원수만큼 더</strong> 얹는 것이 일반적입니다. 이 계산기에서 참석 여부와 동반 인원을 바꾸면 추천 금액이 자동으로 조정됩니다.' },
]

export default function GiftMoneyPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧧 축의금·부의금 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        결혼식 <strong style={{ color: 'var(--text)' }}>축의금</strong>, 장례식 <strong style={{ color: 'var(--text)' }}>부의금</strong>을 관계·참석 여부로 추천. 요즘 시세와 봉투·신권 매너까지 한 번에.
      </p>

      <GiftMoneyClient />

      <GuideDivider />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', marginTop: '48px' }}>

        {/* 시세표 */}
        <div>
          <h2 style={sectionTitle}>💸 관계별 경조사비 시세 (참고)</h2>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>관계</th>
                  <th style={th}>🎉 축의금</th>
                  <th style={th}>🕊️ 부의금</th>
                </tr>
              </thead>
              <tbody>
                {RATE_ROWS.map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...td, fontWeight: 700 }}>{r.rel}</td>
                    <td style={{ ...td, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.wed}</td>
                    <td style={{ ...td, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--muted)' }}>{r.fun}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '12px 2px 0', lineHeight: 1.7 }}>
            예식·조문에 직접 참석해 식사하는 경우 기준입니다. 식대 상승으로 “안 가면 5만원, 가면 10만원”이 일반적인 기준선이 되었습니다.
          </p>
        </div>

        {/* 홀수·금액 관례 */}
        <div>
          <h2 style={sectionTitle}>🔢 금액 관례 — 홀수와 금기 숫자</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ ...card, borderTop: '3px solid #059669' }}>
              <p style={{ fontSize: '13px', color: '#059669', fontWeight: 700, marginBottom: '8px' }}>✓ 무난한 금액</p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.85 }}>
                <li><strong>3·5·7만원</strong> — 홀수(양)라 길하게 봄</li>
                <li><strong>10만원</strong> — 꽉 찬 수, 가장 흔한 기준</li>
                <li><strong>15·20·30·50·100만원</strong> — 큰 단위는 무방</li>
              </ul>
            </div>
            <div style={{ ...card, borderTop: '3px solid #DC2626' }}>
              <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: 700, marginBottom: '8px' }}>✗ 피하는 금액</p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.85 }}>
                <li><strong>4만원</strong> — 한자 ‘죽을 사(死)’ 연상</li>
                <li><strong>9만원</strong> — ‘아홉수’라 꺼림</li>
                <li>그 외 어정쩡한 짝수(6·8만원)도 잘 안 씀</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 봉투·신권 */}
        <div>
          <h2 style={sectionTitle}>✉️ 봉투 쓰는 법 · 지폐 매너</h2>
          <div style={{ ...card, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9 }}>
            <p style={{ margin: '0 0 10px' }}>
              <strong style={{ color: 'var(--text)' }}>앞면</strong> — 축의는 “축 결혼(祝結婚)”, 부의는 “부의(賻儀)”가 가장 무난합니다.
            </p>
            <p style={{ margin: '0 0 10px' }}>
              <strong style={{ color: 'var(--text)' }}>뒷면</strong> — 왼쪽 아래에 이름을 세로로 적고, 소속이 있으면 이름 오른쪽에 작게 덧붙입니다.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: 'var(--text)' }}>지폐</strong> — 축의금은 <strong style={{ color: 'var(--text)' }}>새 지폐(신권)</strong>로 정성을, 부의금은 반대로 <strong style={{ color: 'var(--text)' }}>신권을 피하는</strong> 것이 전통적인 매너입니다.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          {FAQ_LD.map((f, i) => (
            <details key={i} style={faqDetails}>
              <summary style={faqSummary}>Q{i + 1}. {f.q}</summary>
              <div style={faqAnswer} dangerouslySetInnerHTML={{ __html: f.a }} />
            </details>
          ))}
        </div>

        {/* 면책 */}
        <Disclaimer variant="default" open>
          경조사비는 정해진 규칙이 아니라 <strong>지역·집안·시대·개인 관계</strong>에 따라 달라지는 관습입니다. 본 추천은 최근의 일반적 시세를 반영한 참고치이니, 마지막엔 본인과 상대의 관계와 형편을 기준으로 마음 가는 선에서 정하시면 됩니다.
        </Disclaimer>

        {/* 관련 도구 */}
        <div>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/dutch', icon: '🍻', name: '더치페이 계산기', desc: '모임 비용 정산' },
              { href: '/tools/life/unit-price', icon: '🏷️', name: '단가 비교 계산기', desc: '가격 실속 비교' },
              { href: '/tools/life/zodiac', icon: '🐯', name: '띠·별자리 계산기', desc: '나이·관계 확인' },
              { href: '/tools/life/travel-tip', icon: '💵', name: '해외여행 팁 계산기', desc: '국가별 팁 매너' },
            ].map((t, i) => (
              <Link key={i} href={t.href} style={{ ...card, display: 'block', textDecoration: 'none', padding: '14px 16px' }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
