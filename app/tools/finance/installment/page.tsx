import Link from 'next/link'
import CardInstallmentClient from './CardInstallmentClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/finance/installment',
  title: '카드 할부 계산기 — 월 납부액·총 이자·일시불 vs 무이자 비교',
  description: '카드 할부 시 월 납부액과 총 이자를 계산합니다. 무이자 vs 유이자 vs 일시불 할인 비교, 카드사별 수수료율, 개월수별 비용 비교, 기회비용 분석.',
  keywords: ['카드할부계산기', '할부이자계산', '12개월할부', '무이자할부', '일시불할인', '카드수수료', '할부vs일시불', '신용카드할부'],
})

export default function CardInstallmentPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        금융·재테크
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💳 카드 할부 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        구매금액과 개월수만 입력하면 <strong style={{ color: 'var(--text)' }}>월 납부액·총 이자·월별 상환 스케줄</strong>을 즉시 계산합니다.
        무이자 vs 유이자 vs 일시불 할인 3가지 시나리오 비교, 한국 카드사별 수수료율, 파킹통장 기회비용까지 한 화면에서.
      </p>

      <CardInstallmentClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
            • 총 이자 = <strong style={{ color: '#FF6B6B' }}>83,096원</strong> (원금의 8.3%)
          </div>
        </div>

        {/* ── 2. 카드사 수수료율 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 주요 카드사 할부 수수료율 (2024년)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['카드사', '일반 등급', '우수 등급'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { c: '신한카드',   g: '19.9%', p: '15.0%' },
                  { c: '삼성카드',   g: '19.9%', p: '15.0%' },
                  { c: 'KB국민카드', g: '19.9%', p: '15.0%' },
                  { c: '현대카드',   g: '18.9%', p: '14.0%' },
                  { c: '롯데카드',   g: '19.9%', p: '15.0%' },
                  { c: '우리카드',   g: '19.5%', p: '14.5%' },
                  { c: 'NH농협카드', g: '19.5%', p: '15.0%' },
                  { c: '하나카드',   g: '19.5%', p: '14.5%' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{r.c}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FF6B6B', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.g}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 카드사 정책·회원 등급에 따라 변동되므로 정확한 수수료는 공식 홈페이지에서 확인하세요.
          </p>
        </div>

        {/* ── 3. 무이자 vs 유이자 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            무이자 할부 vs 유이자 할부
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '🟢 무이자 할부', c: '#3EFF9B', items: ['이자 0원', '카드사·가맹점이 부담', '가전·가구·여행 시즌 자주 제공', '보통 2~12개월 (24개월까지)', '사용자에게 가장 유리'] },
              { t: '🟡 부분 무이자', c: '#FFD700', items: ['일부 회차만 무이자', '예: 6개월 중 4회차까지 무이자', '후반에 이자 발생', '24개월 무이자 광고 다수가 부분 무이자'] },
              { t: '🔴 유이자 할부', c: '#FF6B6B', items: ['연 14~20% 수수료', '시중 대출 금리보다 높음', '24개월+ 시 원금의 20% 이자', '가능하면 피하기'] },
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
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            일시불 할인 vs 무이자 할부 — 어느 쪽이 이득?
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
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EFF9B', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#3EFF9B', fontWeight: 700, marginBottom: 8 }}>✅ 무이자 할부 우세</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>일시불 할인 없음 또는 1~3% 미만</li>
                <li>무이자 <strong>12개월 이상</strong> 가능</li>
                <li>현금 부족·비상금 보유 필요</li>
                <li>파킹통장(연 3%+) 운용 가능</li>
              </ul>
            </div>
          </div>
          <div style={{
            background: 'rgba(62,200,255,0.05)',
            border: '1px solid rgba(62,200,255,0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            💡 <strong style={{ color: '#3EC8FF' }}>계산 팁:</strong> 일시불 할인 5% &gt; 무이자 12개월 + 파킹통장 운용 (대부분 경우).
            일시불 할인 3% 이하 &lt; 무이자 12개월 + 파킹통장 운용.
          </div>
        </div>

        {/* ── 5. 무이자 함정 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            ⚠️ 무이자 할부의 숨은 함정
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '"24개월 무이자" 광고', d: '대부분 부분 무이자 — 12개월까지만 무이자, 후반 12개월은 유이자 발생' },
              { t: '약관 자세히 확인', d: '카드사·가맹점별 무이자 적용 회차·조건이 다름. 결제 직전 약관 정독 필수' },
              { t: '가맹점 부담 무이자', d: '일시불보다 가격이 더 높게 책정된 경우 있음. 일시불 할인 가능 여부 먼저 문의' },
              { t: '카드 등급별 차이', d: 'VIP·우수 회원은 더 긴 무이자 가능. 일반 회원은 6개월 한정인 경우 다수' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#FF6B6B', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 권장 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            할부 개월수 권장 가이드 (구매금액별)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '100만원 이하', c: '#3EFF9B', d: '일시불 권장 (현금 여유 시) · 무이자 6개월 권장 (현금 분산 시)' },
              { t: '100~300만원',  c: 'var(--accent)', d: '무이자 12개월 권장 · 유이자 시 6개월 이내' },
              { t: '300만원 초과', c: '#FF8C3E', d: '무이자 12~24개월 우선 · 유이자 회피 · 일시불 + 캐시백 병행' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${c.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: c.c, fontWeight: 700, marginBottom: 8 }}>{c.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(255,107,107,0.05)',
            border: '1px solid rgba(255,107,107,0.25)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ⚠️ <strong style={{ color: '#FF6B6B' }}>위험 신호:</strong> 24개월 이상 유이자 할부는 총 이자가 원금의 <strong>20%+</strong>,
            36개월은 <strong>30%+</strong>. 가급적 단축하거나 일시불을 고려하세요.
          </div>
        </div>

        {/* ── 7. 카드 포인트·캐시백 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
            background: 'rgba(200,255,62,0.05)',
            border: '1px solid rgba(200,255,62,0.3)',
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
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
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
                a: '월 부담은 줄지만 <strong>총 이자는 급증</strong>합니다. 100만원 기준: 12개월 이자 약 8.3만원, 24개월 이자 약 22만원(12개월의 2.7배), 36개월 이자 약 33만원(12개월의 4배). 가능한 짧은 개월(6~12개월)을 선택하고, 24개월 이상 할부는 신중히 결정하세요.',
              },
            ].map((f, i) => (
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
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/finance/loan',       icon: '💳', name: '대출이자 계산기',        desc: '원리금균등·원금균등 비교' },
              { href: '/tools/finance/compound',   icon: '📈', name: '복리 계산기',            desc: '거치식·적립식 복리 수익' },
              { href: '/tools/finance/salary',     icon: '💴', name: '연봉 실수령액 계산기',   desc: '2026년 기준 세후 월 실수령액' },
              { href: '/tools/finance/car-cost',   icon: '🚗', name: '자동차 유지비 계산기',   desc: '유류비·보험·소모품·감가상각' },
              { href: '/tools/finance/cost-rate',  icon: '🍽️', name: '메뉴 원가율 계산기',     desc: '재료비·배달 수수료·실질 원가율' },
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
