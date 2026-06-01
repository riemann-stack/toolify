import Link from 'next/link'
import CardInstallmentClient from './CardInstallmentClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/finance/installment',
  title: '카드 할부 계산기 — 월 납부액·총 이자·일시불 vs 무이자 비교',
  description: '할부 개월수별 진짜 이자와 일시불·무이자 비교. 카드 선택의 기준을 숫자로 — 월 납부액·총 이자·실효 수수료율까지.',
  keywords: ['카드할부계산기', '할부이자계산', '12개월할부', '무이자할부', '일시불할인', '카드수수료', '할부vs일시불', '신용카드할부'],
})

const FAQ_LD = [
              {
                q: '12개월 할부면 월 얼마인가요?',
                a: '100만원을 12개월 할부로 결제할 경우 <strong>무이자: 월 약 83,333원</strong>(총 100만원), <strong>유이자(연 19.9%): 월 약 90,258원</strong>(총 약 108.3만원, 이자 약 8.3만원)입니다. 카드사·회원 등급에 따라 수수료율이 다르므로 정확한 금액은 카드사 확인이 필요합니다.',
              },
              {
                q: '무이자 할부가 진짜 이득인가요?',
                a: '<strong>일시불 할인이 없는 경우 무이자 할부는 사실상 이득</strong>입니다. 카드사·가맹점이 이자를 대신 부담해 사용자는 추가 비용 없이 분할 결제 가능하기 때문입니다. 다만 일시불 할인이 5% 이상 제공되면 일시불이 유리할 수 있으며, 일부 가맹점은 무이자 할부 시 가격을 일시불 가격보다 높게 책정하는 경우가 있어 주의가 필요합니다.',
              },
              {
                q: '일시불 할인 5% vs 무이자 6개월 중 무엇이 나은가요?',
                a: '<strong>일반적으로 일시불 할인 5%가 더 유리</strong>합니다. 100만원 기준 일시불 할인 5% = 5만원 즉시 절감. 무이자 6개월 + 남은 돈 파킹통장(연 3%) = 약 7,500원 이익. 차이 약 4만 2천원 → 일시불 우세. 단, 현금 여유가 부족하거나 비상금 확보가 필요한 경우 무이자 할부가 합리적일 수 있습니다.',
              },
              {
                q: '유이자 할부는 정말 손해인가요?',
                a: '네, <strong>일반적으로 손해</strong>입니다. 연 19.9% 수수료는 시중 대출 금리보다 훨씬 높습니다. 100만원을 12개월 유이자 할부 시 약 8.3만원의 이자가 추가되며, 24개월이면 22만원, 36개월이면 33만원이 추가됩니다. 가능한 한 일시불 또는 무이자 할부를 선택하고, 부득이한 경우 짧은 개월(6개월 이내)을 권장합니다.',
              },
              {
                q: '할부 개월이 길수록 좋은가요?',
                a: '월 부담은 줄지만 <strong>총 이자는 급증</strong>합니다. 100만원 기준: 12개월 이자 약 8.3만원, 24개월 이자 약 22만원(12개월의 2.7배), 36개월 이자 약 33만원(12개월의 4배). 가능한 짧은 개월(6~12개월)을 선택하고, 24개월 이상 할부는 신중히 결정하세요. 게다가 유이자 할부는 기간이 길수록 적용 수수료율 자체도 높아지는 경우가 많아 이자가 이중으로 늘어납니다.',
              },
              {
                q: '내게 적용되는 정확한 할부 수수료율은 어디서 확인하나요?',
                a: '세 곳에서 확인할 수 있습니다. ① <strong>여신금융협회 수수료 공시실(cardrate.crefia.or.kr)</strong> — 카드사별 기간 구간별 수수료율을 공시합니다. ② <strong>카드사 앱·홈페이지</strong> — 로그인하면 본인 회원 등급 기준 실제 수수료율이 표시됩니다. ③ <strong>결제 화면</strong> — 온라인 결제 시 할부 개월을 선택하면 적용 수수료율이 안내됩니다. 같은 카드라도 회원 등급·기간에 따라 달라지므로 결제 직전 값이 가장 정확합니다.',
              },
              {
                q: '할부금을 중간에 미리 갚으면(선결제) 이자를 아낄 수 있나요?',
                a: '네. 유이자 할부는 <strong>남은 원금에 대해서만 수수료가 부과</strong>되므로, 일부 선결제(중도 상환)하거나 전액 선결제하면 그만큼 남은 회차의 수수료를 줄일 수 있습니다. 카드사 앱의 「할부 선결제/일부결제」 메뉴에서 신청 가능하며, 카드론과 달리 <strong>할부 선결제에는 보통 중도상환수수료가 없습니다</strong>. 무이자 할부는 어차피 수수료가 0원이라 선결제 실익이 없습니다.',
              },
              {
                q: '할부로 결제하면 신용점수에 영향을 주나요?',
                a: '할부 자체가 곧바로 신용점수를 떨어뜨리지는 않습니다. 다만 할부 잔액은 <strong>카드론·현금서비스와 함께 「카드 채무」로 집계</strong>되어 부채 비중이 커지면 평가에 불리할 수 있고, 무엇보다 <strong>결제일에 연체가 발생하면 신용점수가 크게 하락</strong>합니다. 본인 상환 능력 범위 안에서 할부 기간을 정하고 연체를 피하는 것이 핵심입니다.',
              },
              {
                q: '할부 수수료율 상한은 얼마인가요?',
                a: '카드 할부 수수료는 여신전문금융업법상 <strong>법정 최고금리(연 20%) 이내</strong>에서 정해지며, 실무적으로 대부분 카드사가 <strong>연 19.9%를 상한</strong>으로 운용합니다. 즉 아무리 긴 할부라도 연 20%를 넘을 수 없습니다. 반대로 시중 신용대출 금리(연 5~10%대)보다는 높은 편이라, 금액이 크고 기간이 길다면 할부보다 신용대출이 유리할 수 있습니다.',
              },
            ]

export default function CardInstallmentPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        금융·재테크
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💳 카드 할부 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        할부 개월수별 진짜 이자와 <strong style={{ color: 'var(--text)' }}>일시불·무이자 비교</strong>. 카드 선택의 기준을 숫자로.
      </p>

      <UpdatedMeta date="2026년 5월" basis="2026년 할부 금리 참고" sources={[{"label":"금융감독원","href":"https://www.fss.or.kr"},{"label":"여신금융협회","href":"https://www.crefia.or.kr"}]} />

      <CardInstallmentClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            카드 할부 계산 핵심 공식
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>월이자율</span> = 연이자율 ÷ 12 ÷ 100</div>
            <div><span style={{ color: 'var(--muted)' }}>월 납부액</span> = 원금 × 월이자율 × (1+r)^n / ((1+r)^n − 1)</div>
            <div><span style={{ color: 'var(--muted)' }}>총 납부액</span> = 월 납부액 × 개월수</div>
            <div><span style={{ color: 'var(--muted)' }}>총 이자</span>     = 총 납부액 − 원금</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 원리금균등상환 방식 (한국 카드 할부 표준)</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> 100만원 / 12개월 / 연 19.9%<br />
            • 월 이자율 = 19.9 ÷ 12 ÷ 100 = <strong>1.658%</strong><br />
            • 월 납부액 ≈ <strong>90,258원</strong><br />
            • 총 납부액 = <strong>1,083,096원</strong><br />
            • 총 이자 = <strong style={{ color: '#DC2626' }}>83,096원</strong> (원금의 8.3%)
          </div>
        </div>

        {/* ── 2. 할부 수수료율 구조 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            할부 수수료율은 어떻게 정해지나
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, marginBottom: '14px' }}>
            카드 할부 수수료율은 카드사별로 고정된 하나의 값이 아니라 <strong style={{ color: 'var(--text)' }}>① 할부 기간(개월)</strong>과 <strong style={{ color: 'var(--text)' }}>② 회원 신용·이용 등급</strong>에 따라 차등 적용됩니다.
            보통 <strong style={{ color: 'var(--text)' }}>기간이 길수록 수수료율이 높아지는</strong> 구조이며, 8개 전업 카드사 모두 비슷한 구간을 사용합니다. 아래는 업계 일반적인 구간 범위입니다.
          </p>
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['할부 기간', '일반 등급', '우수 등급'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 6px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { c: '2~3개월',     g: '약 10~13%', p: '약 8~11%' },
                  { c: '4~5개월',     g: '약 13~16%', p: '약 11~14%' },
                  { c: '6~9개월',     g: '약 15~18%', p: '약 13~16%' },
                  { c: '10~12개월',   g: '약 18~19.9%', p: '약 15~18%' },
                  { c: '13개월 이상', g: '약 19~19.9%', p: '약 17~19%' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 6px', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.c}</td>
                    <td style={{ padding: '9px 6px', textAlign: 'right', color: '#DC2626', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.g}</td>
                    <td style={{ padding: '9px 6px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 12, lineHeight: 1.75 }}>
            ※ 위 수치는 업계 일반 범위를 정리한 <strong style={{ color: 'var(--text)' }}>참고용 추정치</strong>이며, 카드사·시기·회원 등급에 따라 달라집니다.
            정확한 본인 적용 수수료율은 <strong style={{ color: 'var(--text)' }}>여신금융협회 공시실(cardrate.crefia.or.kr)</strong>, 각 카드사 앱·홈페이지, 또는 결제 화면에서 직접 확인하세요.
          </p>
        </div>

        {/* ── 3. 무이자 vs 유이자 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            무이자 할부 vs 유이자 할부
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '🟢 무이자 할부', c: '#059669', items: ['이자 0원', '카드사·가맹점이 부담', '가전·가구·여행 시즌 자주 제공', '보통 2~12개월 (24개월까지)', '사용자에게 가장 유리'] },
              { t: '🟡 부분 무이자', c: '#CA8A04', items: ['일부 회차만 무이자', '예: 6개월 중 4회차까지 무이자', '후반에 이자 발생', '24개월 무이자 광고 다수가 부분 무이자'] },
              { t: '🔴 유이자 할부', c: '#DC2626', items: ['연 14~20% 수수료', '시중 대출 금리보다 높음', '24개월+ 시 원금의 20% 이자', '가능하면 피하기'] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                  {g.items.map((it, j) => (<li key={j}>{it}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 일시불 vs 무이자 결정 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            일시불 할인 vs 무이자 할부
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>✅ 일시불 할인 우세</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>할인율 <strong>5% 이상</strong></li>
                <li>무이자 개월 짧음 (3~6개월)</li>
                <li>현금 여유 있음</li>
                <li>캐시백 카드 추가 활용 시</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #059669', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#059669', fontWeight: 700, marginBottom: 8 }}>✅ 무이자 할부 우세</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>일시불 할인 없음 또는 1~3% 미만</li>
                <li>무이자 <strong>12개월 이상</strong> 가능</li>
                <li>현금 부족·비상금 보유 필요</li>
                <li>파킹통장(연 3%+) 운용 가능</li>
              </ul>
            </div>
          </div>
          <div style={{
            background: 'rgba(8,145,178,0.05)',
            border: '1px solid rgba(8,145,178,0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            💡 <strong style={{ color: '#0891B2' }}>계산 팁:</strong> 일시불 할인 5% &gt; 무이자 12개월 + 파킹통장 운용 (대부분 경우).
            일시불 할인 3% 이하 &lt; 무이자 12개월 + 파킹통장 운용.
          </div>
        </div>

        {/* ── 5. 무이자 함정 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            ⚠️ 무이자 할부의 숨은 함정
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '"24개월 무이자" 광고', d: '대부분 부분 무이자 — 12개월까지만 무이자, 후반 12개월은 유이자 발생' },
              { t: '약관 자세히 확인', d: '카드사·가맹점별 무이자 적용 회차·조건이 다름. 결제 직전 약관 정독 필수' },
              { t: '가맹점 부담 무이자', d: '일시불보다 가격이 더 높게 책정된 경우 있음. 일시불 할인 가능 여부 먼저 문의' },
              { t: '카드 등급별 차이', d: 'VIP·우수 회원은 더 긴 무이자 가능. 일반 회원은 6개월 한정인 경우 다수' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 권장 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            할부 개월수 권장 가이드 (구매금액별)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '100만원 이하', c: '#059669', d: '일시불 권장 (현금 여유 시) · 무이자 6개월 권장 (현금 분산 시)' },
              { t: '100~300만원',  c: 'var(--accent)', d: '무이자 12개월 권장 · 유이자 시 6개월 이내' },
              { t: '300만원 초과', c: '#EA580C', d: '무이자 12~24개월 우선 · 유이자 회피 · 일시불 + 캐시백 병행' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${c.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: c.c, fontWeight: 700, marginBottom: 8 }}>{c.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(220,38,38,0.05)',
            border: '1px solid rgba(220,38,38,0.25)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ⚠️ <strong style={{ color: '#DC2626' }}>위험 신호:</strong> 24개월 이상 유이자 할부는 총 이자가 원금의 <strong>20%+</strong>,
            36개월은 <strong>30%+</strong>. 가급적 단축하거나 일시불을 고려하세요.
          </div>
        </div>

        {/* ── 7. 카드 포인트·캐시백 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            카드 포인트·캐시백 활용 팁
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '🏠 대형 가전', d: '5~10% 캐시백 카드 활용 시 일시불이 가장 유리. 무이자 + 캐시백 동시 적용 가능 카드도 확인.' },
              { t: '📞 통신비·공과금', d: '자동 결제 카드의 청구할인 활용. 연간 5~12만원 절감 가능.' },
              { t: '🍽️ 외식·쇼핑',   d: '시즌별 무이자 + 포인트 적립 동시 활용. 백화점 카드 5% 적립 + 포인트로 결제.' },
              { t: '✈️ 해외 직구',   d: '해외 결제 캐시백 카드 (수수료 면제). 카드사별 1~3% 수수료 차이.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(14,165,233,0.05)',
            border: '1px solid rgba(14,165,233,0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.75,
          }}>
            💰 <strong style={{ color: 'var(--accent)' }}>실질 할인율 계산:</strong> 100만원 결제 + 5만원 포인트 적립 = 실질 할인 5%.
            포인트 1점 = 1원 환산 시 캐시백과 동등한 효과.
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/loan',       icon: '💳', name: '대출이자 계산기',        desc: '원리금균등·원금균등 비교' },
              { href: '/tools/finance/compound',   icon: '📈', name: '복리 계산기',            desc: '거치식·적립식 복리 수익' },
              { href: '/tools/finance/salary',     icon: '💴', name: '연봉 실수령액 계산기',   desc: '2026년 기준 세후 월 실수령액' },
              { href: '/tools/finance/car-cost',   icon: '🚗', name: '자동차 유지비 계산기',   desc: '유류비·보험·소모품·감가상각' },
              { href: '/tools/finance/cost-rate',  icon: '🍽️', name: '음식점 원가율 계산기',     desc: '재료비·배달 수수료·실질 원가율' },
              { href: '/tools/finance/vat',        icon: '🧾', name: '부가세 계산기',          desc: '공급가액·부가세 역산 계산' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
