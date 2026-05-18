import Link from 'next/link'
import CompoundClient from './CompoundClient'
import CompoundChart from './CompoundChart'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/finance/compound',
  title: '복리 계산기 — 목표 역산·인플레이션·수익률 시나리오 한 번에',
  description: '거치·적립·증액·인플레이션 반영해 시간이 만드는 자산을 시나리오별로 비교. 목표 역산·ISA·연금저축·복리 주기·수수료까지 정밀 계산.',
  keywords: [
    '복리계산기', '복리투자계산기', '복리수익계산', '목표금액역산',
    '적립식복리', '거치식복리', '월적립계산기', '1억만들기',
    'ISA계산기', '연금저축계산기', 'IRP계산기', '절세계좌비교',
    '72의법칙', '실질수익률', '인플레이션계산기', '실질가치계산',
    'S&P500복리', '장기투자시뮬레이션', '눈덩이효과', '코스트에버리지',
  ],
})

export default function CompoundPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📈 복리 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        거치·적립·증액·인플레이션까지 반영해, <strong style={{ color: 'var(--text)' }}>시간이 만드는 자산</strong>을 시나리오별로 비교.
      </p>

      <CompoundClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 복리의 마법 + 그래프 (기존 SEO 보존) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            복리의 마법 — 눈덩이 효과(Snowball Effect)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            복리(複利)는 원금에서 발생한 이자가 다시 원금에 합산되어 그 다음 기간의 이자를 계산하는 방식입니다.
            시간이 지날수록 이자가 이자를 낳는 <strong style={{ color: 'var(--text)' }}>「눈덩이 효과(Snowball Effect)」</strong>가 발생합니다.
            처음에는 단리와 큰 차이가 없어 보이지만, 10년이 넘어가면서 그 차이가 기하급수적으로 벌어집니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            아래 그래프는 1,000만 원을 금리별로 30년간 투자했을 때의 누적 자산을 보여줍니다.
            연 3%와 연 10%의 차이가 30년 후 얼마나 벌어지는지 확인해보세요.
          </p>

          {/* 그래프 */}
          <CompoundChart />
        </div>

        {/* ── 2. 복리 계산 공식 (기존 SEO 보존) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            복리 계산 공식
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            복리 계산의 핵심 공식은 아래와 같습니다. 적립식의 경우 매월 납입금에 대해 별도로 복리 계산 후 합산합니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>거치식 복리 공식</p>
              <p style={{ fontFamily: 'monospace', fontSize: '15px', color: 'var(--text)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                FV = PV × (1 + r)ⁿ
              </p>
              <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <span style={{ color: 'var(--accent)' }}>FV</span> = 미래 가치(Future Value) &nbsp;|&nbsp;
                <span style={{ color: 'var(--accent)' }}>PV</span> = 현재 원금(Present Value)<br />
                <span style={{ color: 'var(--accent)' }}>r</span> = 기간별 수익률(연 수익률 ÷ 12) &nbsp;|&nbsp;
                <span style={{ color: 'var(--accent)' }}>n</span> = 총 기간(월 수)
              </div>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,200,255,0.2)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: '#3EC8FF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>적립식 복리 공식 (월 납입)</p>
              <p style={{ fontFamily: 'monospace', fontSize: '15px', color: 'var(--text)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                FV = PMT × [(1 + r)ⁿ - 1] ÷ r
              </p>
              <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <span style={{ color: '#3EC8FF' }}>PMT</span> = 매월 납입금(Payment) &nbsp;|&nbsp;
                <span style={{ color: '#3EC8FF' }}>r</span> = 월 이자율(연 수익률 ÷ 12)<br />
                <span style={{ color: '#3EC8FF' }}>n</span> = 총 납입 횟수(월 수)
              </div>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(155,89,182,0.20)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: '#C485E0', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>실질 수익률 — Fisher 공식</p>
              <p style={{ fontFamily: 'monospace', fontSize: '15px', color: 'var(--text)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                r_real = (1 + r_nominal) / (1 + π) − 1
              </p>
              <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <span style={{ color: '#C485E0' }}>r_real</span> = 실질 수익률 &nbsp;|&nbsp;
                <span style={{ color: '#C485E0' }}>r_nominal</span> = 명목 수익률 &nbsp;|&nbsp;
                <span style={{ color: '#C485E0' }}>π</span> = 인플레이션
              </div>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8 }}>
                💡 실제 계산에서는 거치식과 적립식을 합산하고, 본 도구는 추가로 적립 주기·복리 주기·매년 증액률·수수료까지 반영합니다.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. 72의 법칙 (기존 SEO 보존) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            복리의 마법: 원금이 2배가 되는 「72의 법칙」
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            <strong style={{ color: 'var(--text)' }}>72를 연 수익률(%)로 나누면</strong> 원금이 약 2배가 되는 기간(년)을 빠르게 계산할 수 있습니다.
            복잡한 계산 없이 투자 목표를 직관적으로 파악하는 데 유용한 법칙입니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.25)', borderRadius: '12px', padding: '18px 20px', textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--accent)', marginBottom: '6px', letterSpacing: '1px' }}>
              2배 기간 ≈ 72 ÷ 연 수익률(%)
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              예시: 연 6% 수익률이면 72 ÷ 6 = <strong style={{ color: 'var(--accent)' }}>12년</strong> 후 원금이 2배
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>연 수익률</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>2배 기간</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>대표 투자처 예시</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>1,000만원 → 30년 후</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['2%',  '36년', '저축은행 예금',              '1,811만원'],
                  ['3%',  '24년', '국채·채권',                  '2,427만원'],
                  ['5%',  '14.4년', 'ELS·혼합형 펀드',          '4,322만원'],
                  ['7%',  '10.3년', '주식형 펀드 (장기 평균)',   '7,612만원'],
                  ['10%', '7.2년', 'S&P500 (역사적 평균)',      '17,449만원'],
                  ['15%', '4.8년', '고수익 성장주 (고위험)',     '66,212만원'],
                ].map(([rate, years, example, result], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{rate}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontWeight: 700 }}>{years}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{example}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            ※ 세금·수수료 미반영, 원금 1,000만 원 거치식 기준. 과거 수익률이 미래를 보장하지 않습니다.
          </p>
        </div>

        {/* ── 4. 목표 역산 — "1억 만들려면 월 얼마?" ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🎯 목표 역산 — &ldquo;1억 만들려면 월 얼마?&rdquo;
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            대부분의 사람은 「얼마를 적립할까」가 아니라 「언제까지 얼마를 모으고 싶다」로 생각합니다.
            본 도구의 <strong style={{ color: '#FFD700' }}>목표 역산</strong> 탭은 목표 금액·기간·수익률을 고정하고
            필요한 월 적립액을 <strong style={{ color: 'var(--text) ' }}>이진 탐색(Binary Search)</strong>으로 계산합니다.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>목표</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>기간</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>수익률</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#FFD700', fontWeight: 700 }}>월 적립액 (초기 0)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1억',   '10년', '7%',  '약 57만원'],
                  ['1억',   '20년', '7%',  '약 19만원'],
                  ['3억',   '20년', '7%',  '약 57만원'],
                  ['5억',   '30년', '7%',  '약 41만원'],
                  ['10억',  '30년', '7%',  '약 81만원'],
                  ['10억',  '20년', '10%', '약 130만원'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FFD700', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
            ※ 본 도구는 「현실성 평가 배지」로 월 적립액의 현실성을 4단계(매우 합리적 / 합리적 / 도전적 / 비현실적)로 표시합니다.
          </p>
        </div>

        {/* ── 5. 한국 6대 절세 계좌 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🇰🇷 한국 6대 절세 계좌 비교
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            한국에서 복리 투자 수익에 대한 일반 과세는 <strong style={{ color: '#FF6B6B' }}>15.4%</strong>(이자·배당소득세 14% + 지방소득세 1.4%)입니다.
            절세 계좌를 활용하면 세금을 크게 줄일 수 있으니 자신의 상황에 맞는 계좌를 선택해 운용하세요.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: 580 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>계좌</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>세율</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>연 한도</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>특징</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['일반 계좌',       '15.4%', '제한 없음', '이자·배당 소득세 + 지방소득세'],
                  ['ISA (서민형)',    '9.9%',  '연 2,000만',  '서민형 400만원 비과세 + 분리과세 (소득 조건)'],
                  ['ISA (일반형)',    '9.9%',  '연 2,000만',  '일반형 200만원 비과세 + 분리과세 · 3~5년'],
                  ['연금저축',        '5.5%',  '연 600만',    '16.5% 세액공제 (총급여 ≤5,500만) · 55세 수령'],
                  ['IRP',             '5.5%',  '연 900만(연저합산)', '연금저축과 합산 900만 한도 · 16.5% 세액공제'],
                  ['비과세 (이론)',   '0%',    '제한 없음', '세금 없음 가정 (이론적 최대치)'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#FF8C3E', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 11.5, lineHeight: 1.6 }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
            ※ 2026년 1월 기준 단순화. ISA 의무 보유·연금저축 중도 해지 페널티 등은 가입 전 금융사 상담 필요.
          </p>
        </div>

        {/* ── 6. 인플레이션과 실질 가치 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            💸 인플레이션 — 30년 후 1억의 실질 가치
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            화폐 가치는 시간이 지나면 떨어집니다. 한국은행 목표 인플레이션은 2.0%, 최근 10년 평균은 약 2.5%이고,
            미국 장기 평균도 2.5~3% 수준입니다. <strong style={{ color: '#3EC8FF' }}>실질 수익률 = 명목 수익률 − 인플레이션</strong>으로
            장기 투자 의사결정을 해야 합니다.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>30년 후 명목 자산</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>인플레이션</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#3EC8FF', fontWeight: 700 }}>실질 가치 (오늘 구매력)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>구매력 손실</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1억',  '2.0%', '약 5,521만원', '-44.8%'],
                  ['1억',  '2.5%', '약 4,767만원', '-52.3%'],
                  ['1억',  '3.0%', '약 4,120만원', '-58.8%'],
                  ['10억', '2.5%', '약 4억 7,674만', '-52.3%'],
                  ['10억', '3.0%', '약 4억 1,199만', '-58.8%'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#3EC8FF', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#3EC8FF', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FF6B6B', fontFamily: 'Inter, system-ui, sans-serif' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
            ※ 실질 가치 = 명목 자산 ÷ (1 + 인플레이션)^년수. 본 계산기 상단의 「물가 상승률」 입력란에서 1.5~4.0% 프리셋으로 시뮬 가능.
          </p>
        </div>

        {/* ── 7. 시나리오 비교 — 4가지 수익률 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            📊 수익률 가정 시나리오
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            단일 수익률만 가정하면 미래 자산을 과대 또는 과소평가하기 쉽습니다.
            본 도구는 4가지 시나리오를 동시에 비교해 <strong style={{ color: 'var(--text)' }}>「현실적 범위」</strong>를 제공합니다.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { name: '보수적 4%',  color: '#3EC8FF', desc: '예금·국채·채권 중심 장기 평균', warn: '낮은 변동성' },
              { name: '기준 7%',    color: 'var(--accent)', desc: 'S&P500 100년 평균(인플레이션 반영 후 약 7%)', warn: '연구용 표준' },
              { name: '낙관적 10%', color: '#FFD700', desc: 'S&P500 명목 평균 · 주식형 펀드 장기', warn: '연 -30%~+40% 변동' },
              { name: '공격적 13%', color: '#FF8C3E', desc: '성장주·테크주 (역사적 예외값)', warn: '⚠ 단기 -50%도 가능' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${s.color}55`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: s.color, fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif', marginBottom: 6 }}>{s.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 4 }}>{s.desc}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{s.warn}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 12 }}>
            ※ 본 시나리오는 가정값이며 특정 상품 수익을 예측하지 않습니다. 과거 수익률 ≠ 미래 보장.
          </p>
        </div>

        {/* ── 8. 복리 주기 차이 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🔁 복리 주기 — 일·월·분기·연 차이
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            연 10%로 표시된 상품도 복리 주기에 따라 실효 수익률이 다릅니다. 주기가 짧을수록 유리합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>복리 주기</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>실효 연수익률</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>1,000만원 → 1년 후</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['연복리 (1회)',     '10.000%', '11,000,000'],
                  ['분기복리 (4회)',   '10.381%', '11,038,129'],
                  ['월복리 (12회)',    '10.471%', '11,047,131'],
                  ['일복리 (365회)',   '10.516%', '11,051,558'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>{row[2]}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            ※ 표시 금리(명목) 연 10% 기준. 일복리와 연복리 차이는 약 0.5%p — 30년 누적이면 큰 차이.
          </p>
        </div>

        {/* ── 10. FAQ (accordion) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '복리와 단리의 차이는 무엇인가요?',
                a: '단리는 원금에만 이자가 붙는 방식이고, 복리는 이자에도 이자가 붙는 방식입니다. 1,000만 원을 연 10% 단리로 10년 투자하면 2,000만 원이지만, 복리로 투자하면 2,594만 원이 됩니다. 장기 투자일수록 두 방식의 차이가 기하급수적으로 커집니다.',
              },
              {
                q: '실질 수익률이란 무엇인가요? (인플레이션)',
                a: '명목 수익률에서 물가 상승률(인플레이션, 약 2~3%)을 빼야 실제 자산의 구매력을 알 수 있습니다. 예를 들어 연 5% 수익을 올렸어도 물가가 3% 올랐다면 실질 수익률은 약 2%에 불과합니다. 본 계산기는 「물가 상승률」 입력만 채우면 결과 영역에서 Fisher 공식으로 명목·실질 가치를 동시에 표시합니다.',
              },
              {
                q: '월 복리와 연 복리 중 어느 것이 유리한가요?',
                a: '복리 계산 주기가 짧을수록 유리합니다. 연 10% 기준으로 연 복리는 10%이지만, 월 복리의 실질 연수익률은 약 10.47%이고 일복리는 10.52%입니다. 30년이 누적되면 약 2~3% 차이가 납니다. 본 계산기의 「수익률」 입력 카드 안 복리 주기 선택지(일/월/분기/연)를 바꿔 비교해보세요.',
              },
              {
                q: '적립식 투자가 거치식보다 유리한 경우는?',
                a: '시장이 하락과 상승을 반복할 때 매월 일정 금액을 적립하면 평균 매입 단가를 낮출 수 있는 코스트 에버리지(Cost Average) 효과가 있습니다. 목돈이 없어도 시작할 수 있고, 장기적으로 안정적인 수익을 기대할 수 있어 직장인에게 적합합니다.',
              },
              {
                q: '세금은 복리 수익에 어떤 영향을 주나요?',
                a: '국내 금융소득(이자·배당)은 15.4%(소득세 14% + 지방소득세 1.4%)가 과세됩니다. 연간 금융소득이 2,000만 원을 초과하면 종합소득세 과세 대상이 됩니다. 절세를 원한다면 ISA(9.9% 분리과세 + 200~400만 비과세)·연금저축·IRP(5.5% + 16.5% 세액공제) 등 한국 6대 절세 계좌를 검토하세요. 본 페이지의 「한국 6대 절세 계좌 비교」 표에서 세율·한도·특징을 확인할 수 있습니다.',
              },
              {
                q: '「1억 만들려면 월 얼마」를 계산하고 싶어요',
                a: '본 계산기의 「목표 금액」 입력란에 1억(10,000만원)을 넣고 기간·수익률·초기 원금을 설정하세요. 결과 영역에 이진 탐색으로 계산된 필요한 월 적립액과 「매우 합리적 / 합리적 / 도전적 / 비현실적」 4단계 현실성 배지가 자동 표시됩니다. 예: 1억 / 10년 / 7% → 약 57만원, 1억 / 20년 / 7% → 약 19만원.',
              },
              {
                q: '연금저축과 IRP는 어떻게 다른가요?',
                a: '둘 다 16.5%(총급여 5,500만 이하) 세액공제 + 연금 수령 시 5.5% 분리과세 혜택이 있습니다. 연금저축은 연 600만원 한도로 누구나 가입 가능하고, IRP는 연금저축과 합산 연 900만원 한도로 추가 300만원 세액공제를 받을 수 있습니다. 단, 둘 다 55세 이후 수령 가능하며 중도 해지 시 페널티가 큽니다.',
              },
              {
                q: '시나리오 비교에서 13% 공격적은 너무 낙관적 아닌가요?',
                a: '맞습니다. S&P500 명목 장기 평균은 약 10%, 일부 기간(1980~2000)이나 성장주에서 13%가 나왔을 뿐이며, 단기적으로 -50% 손실도 자주 발생했습니다. 13%는 「상한 시나리오」로만 활용하세요. 일반적으로 7%(기준)와 4%(보수적)을 중심으로 의사결정하기를 권장합니다.',
              },
              {
                q: '본 계산기는 투자 자문 도구인가요?',
                a: '아닙니다. 본 도구는 입력값 기반의 수학적 시뮬레이션이며, 특정 상품 추천이나 수익 보장이 아닙니다. 실제 투자 수익률은 시장 변동성·세금·수수료에 따라 달라지며, 과거 수익률은 미래 수익을 보장하지 않습니다. 가입 전 반드시 금융사·세무 전문가와 상담하세요.',
              },
            ].map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {faq.q}
                </summary>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* ── 11. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/salary',   icon: '💴', name: '연봉 실수령액 계산기', desc: '매월 얼마를 투자할 수 있는지 확인' },
              { href: '/tools/finance/loan',     icon: '💳', name: '대출이자 계산기',      desc: '대출 상환 vs 투자, 어느 쪽이 유리?' },
              { href: '/tools/finance/stock',    icon: '📉', name: '주식 물타기 계산기',   desc: '추가 매수 시 평단가 시뮬레이션' },
              { href: '/tools/finance/dutch',    icon: '🍻', name: '더치페이 계산기',     desc: '여러 명이 모은 자금 정산' },
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
