import type { Metadata } from 'next'
import Link from 'next/link'
import DividendClient from './DividendClient'

export const metadata: Metadata = {
  title: '월배당 목표 자산 계산기 2026 — 배당 FIRE 필요 원금 계산 | Youtil',
  description: '목표 월배당금을 받기 위해 필요한 투자 원금을 계산합니다. 세후 배당수익률 기준 현실적인 자산 규모 확인. 배당소득세, 안전계수, 배당 성장률 반영.',
  keywords: ['월배당계산기', '배당투자계산기', '월배당목표자산', 'FIRE계산기', '배당FIRE', '월100만원배당', '필요투자원금계산', '배당소득세계산기'],
}

export default function DividendPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💰 월배당 목표 자산 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        목표 월배당금을 받기 위한 필요 투자 원금을 <strong style={{ color: 'var(--text)' }}>세후 수익률</strong> 기준으로 계산합니다. 배당소득세·안전계수·배당 성장률을 반영한 현실적인 배당 FIRE 목표 금액 확인.
      </p>

      <DividendClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 계산 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            핵심 계산 공식 4단계
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {[
              { n: 'STEP 1', f: '연 목표 배당금 = 월 목표 × 12' },
              { n: 'STEP 2', f: '세후 수익률 = 연 배당수익률 × (1 − 세율)' },
              { n: 'STEP 3', f: '보정 연 목표 = 연 목표 × 안전계수' },
              { n: 'STEP 4', f: '필요 원금 = 보정 연 목표 ÷ 세후 수익률' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '12px', fontWeight: 800, color: 'var(--accent)', flexShrink: 0, letterSpacing: '0.06em' }}>{s.n}</span>
                <span style={{ fontSize: '13px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{s.f}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(200,255,62,0.05)', border: '1px solid rgba(200,255,62,0.25)', borderRadius: '10px', padding: '14px 18px' }}>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>예시: 월 100만원, 연 4.5%, 세율 15.4%</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, margin: 0, fontFamily: 'Syne, sans-serif' }}>
              → 세후수익률 = 4.5% × (1−0.154) = <strong style={{ color: 'var(--accent)' }}>3.807%</strong><br />
              → 필요원금 = 1,200만원 ÷ 0.03807 = <strong style={{ color: 'var(--accent)' }}>약 3억 1,523만원</strong>
            </p>
          </div>
        </div>

        {/* ── 2. 목표 월배당금별 필요 원금 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            목표 월배당금별 필요 원금
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>
            * 세율 15.4%, 연 4.5% 배당수익률 기준
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['목표 월배당', '연 배당 필요', '필요 원금'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { m: '월 30만원',  a: '360만원',   p: '약 9,457만원' },
                  { m: '월 50만원',  a: '600만원',   p: '약 1억 5,761만원' },
                  { m: '월 100만원', a: '1,200만원', p: '약 3억 1,523만원' },
                  { m: '월 200만원', a: '2,400만원', p: '약 6억 3,046만원' },
                  { m: '월 300만원', a: '3,600만원', p: '약 9억 4,569만원' },
                  { m: '월 500만원', a: '6,000만원', p: '약 15억 7,614만원' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.m}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 600, textAlign: 'right' }}>{r.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 배당소득세 완전 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            배당소득세 완전 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {[
              { t: '🇰🇷 국내 주식', c: '#C8FF3E', r: '15.4%', d: '배당소득세 14% + 지방소득세 1.4%. 증권사가 원천징수 후 입금.' },
              { t: '🇺🇸 해외 ETF', c: '#3EC8FF', r: '15.0%', d: '미국 배당의 경우 조세조약으로 현지 원천징수. 추가 국내 과세 없음(2000만원 이하).' },
              { t: '📊 종합과세', c: '#FF8C3E', r: '6.6~49.5%', d: '연간 금융소득 2,000만원 초과 시 다른 소득과 합산. 과표 구간별 누진세율.' },
            ].map((z, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${z.c}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: z.c, fontWeight: 700, marginBottom: '4px' }}>{z.t}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>{z.r}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{z.d}</p>
              </div>
            ))}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['금융소득 구간', '세율', '비고'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { r: '2,000만원 이하',       t: '15.4%',    n: '분리과세' },
                  { r: '2,000만 ~ 5,000만원',  t: '26.4%',    n: '종합과세 (과표 구간별)' },
                  { r: '5,000만원 초과',        t: '38.5%~',   n: '다른 소득과 합산' },
                  { r: '과표 10억원 초과',      t: '49.5%',    n: '최고 세율' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
            * 배당수익률 4.5% 기준, 투자 원금 <strong style={{ color: 'var(--text)' }}>약 4억 4,444만원 이상</strong>이면 종합과세 구간 진입을 검토해야 합니다. ISA·연금저축 등 절세 계좌 활용 권장.
          </p>
        </div>

        {/* ── 4. 고배당 함정 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            ⚠️ 고배당 함정 주의 안내
          </h2>
          <div style={{ background: 'rgba(255,107,107,0.05)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '14px' }}>
            <p style={{ fontSize: '13px', color: '#FF8C3E', fontWeight: 700, marginBottom: '6px' }}>수익률 경고 구간</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
              <strong>7% 이상</strong> — 주의 필요 &nbsp;·&nbsp; <strong>10% 이상</strong> — 함정 배당 가능성 높음
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            {[
              { n: '①', t: '주가 하락으로 배당수익률이 올라간 경우 (분자 상승이 아닌 분모 하락)' },
              { n: '②', t: '배당성향(배당금/순이익) 100% 이상 — 순이익보다 많이 지급, 지속 불가' },
              { n: '③', t: '커버드콜 ETF의 프리미엄 감소 리스크 (변동성 하락 국면에서 수익률 급락)' },
              { n: '④', t: '리츠(REITs) — 금리 인상 시 주가 하락과 임대료 하락 이중 타격' },
            ].map((w, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '12px' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800, color: '#FF8C3E', flexShrink: 0 }}>{w.n}</span>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, margin: 0 }}>{w.t}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(62,255,155,0.05)', border: '1px solid rgba(62,255,155,0.25)', borderRadius: '10px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: '#3EFF9B', fontWeight: 700, marginBottom: '6px' }}>✅ 안전한 고배당 기준</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
              배당수익률 <strong>4~6%</strong> · 배당성향 <strong>50~70%</strong> · <strong>10년 이상</strong> 배당 유지 기록
            </p>
          </div>
        </div>

        {/* ── 5. 배당 성장 투자 전략 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            배당 성장 투자 전략 (DGI)
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 22px', marginBottom: '14px' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '17px', fontWeight: 700, color: 'var(--accent)', textAlign: 'center', margin: '0 0 6px' }}>
              &ldquo;지금 3%로 시작해도 10년 후 6%가 될 수 있다&rdquo;
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', margin: 0 }}>
              DGI(Dividend Growth Investing) — 원금 대비 yield on cost 개념
            </p>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '10px' }}>
            배당 성장률 연 <strong style={{ color: 'var(--text)' }}>7%</strong> 가정 시 원금 대비 수익률 변화:
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['현재 수익률', '10년 후', '20년 후'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { s: '2.5%', a: '4.9%', b: '9.7%' },
                  { s: '3.0%', a: '5.9%', b: '11.6%' },
                  { s: '4.0%', a: '7.9%', b: '15.5%' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', color: '#3EFF9B', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
            * SCHD·VIG·코카콜라·P&G 등 배당 귀족주(Dividend Aristocrats)가 이 전략의 대표 종목.
          </p>
        </div>

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '세후 배당수익률과 세전의 차이는 얼마나 되나요?',
                a: '국내주식 배당소득세 15.4% 기준으로, 세전 5% 배당은 세후 4.23%가 됩니다. 즉 세후 기준으로 원금이 약 18% 더 필요합니다. 실제 수령액 기반으로 목표를 세우려면 반드시 세후 수익률로 계산해야 합니다.' },
              { q: '안전계수는 얼마로 설정하는 게 좋나요?',
                a: '기업의 배당 삭감, 배당 공백기, 환율 변동 등을 고려하면 110~120%를 권장합니다. 특히 해외 ETF 투자자라면 환율 리스크가 있어 120% 이상을 권장합니다. 배당 삭감 위험이 낮은 안정적 배당주(공기업, 우량 대형주)라면 100~110%도 충분합니다.' },
              { q: '월배당 ETF와 분기배당 ETF 중 어느 게 유리한가요?',
                a: '월배당 ETF는 현금흐름이 안정적이지만 수익률이 낮거나 분배금이 일정하지 않을 수 있습니다(JEPI, QYLD 등). 분기배당은 배당 성장주(SCHD, VIG 등)에 많으며 장기적으로 복리 효과가 더 높을 수 있습니다. 생활비가 필요하면 월배당, 재투자가 목적이면 분기배당이 유리합니다.' },
              { q: '금융소득 종합과세는 언제부터 해당되나요?',
                a: '이자소득과 배당소득의 합계가 연간 2,000만원을 초과하면 종합과세 대상이 됩니다. 배당수익률 4.5% 기준으로는 약 4억 4,000만원 이상 투자 시 해당될 수 있습니다. 이 경우 세율이 최대 49.5%까지 올라가므로 ISA 계좌, 연금저축 등 절세 계좌를 활용해야 합니다.' },
              { q: '배당주 투자와 채권 이자 중 어느 게 더 유리한가요?',
                a: '채권은 원금 보장과 고정 이자로 안정적이지만 자본 이득이 없습니다. 배당주는 배당 성장과 주가 상승의 잠재력이 있지만 원금 손실 위험이 있습니다. 일반적으로 10년 이상 장기 투자 시 우량 배당주가 채권보다 총 수익률이 높은 경향이 있습니다. 두 자산을 분산해 보유하는 것이 안전합니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기',          desc: '배당 재투자 시뮬레이션' },
              { href: '/tools/finance/salary',   icon: '💴', name: '연봉 실수령액 계산기', desc: '투자 여력 파악' },
              { href: '/tools/finance/loan',     icon: '💳', name: '대출이자 계산기',       desc: '대출 vs 투자 비교' },
              { href: '/tools/finance/stock',    icon: '📉', name: '주식 물타기 계산기',   desc: '배당주 추가 매수' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
