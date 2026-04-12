import type { Metadata } from 'next'
import Link from 'next/link'
import SalaryClient from './SalaryClient'

export const metadata: Metadata = {
  title: '연봉 실수령액 계산기 2026 — 세후 월급·4대보험 계산 | Youtil',
  description: '2026년 기준 연봉 실수령액 계산기. 국민연금(4.75%), 건강보험(3.595%), 장기요양보험, 고용보험, 근로소득세 자동 계산. 연봉별 실수령액 표 제공.',
  keywords: ['연봉실수령액', '연봉계산기2026', '세후연봉', '실수령액계산', '4대보험계산기', '월급실수령액', '연봉실수령액표', '비과세식대'],
}

export default function SalaryPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        금융·재테크
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💴 연봉 실수령액 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        2026년 기준 4대보험과 근로소득세를 반영한 세후 월 실수령액을 계산합니다.
      </p>

      <SalaryClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 연봉별 실수령액 표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            2026년 연봉 실수령액 표 (연봉 2,400만 원 ~ 1억 원)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '8px' }}>
            아래 표는 부양가족 1인(본인만), 비과세 없는 순수 급여 기준으로 계산한 2026년 실수령액입니다.
            국민연금(4.75%), 건강보험(3.595%), 장기요양보험(건보료의 13.14%), 고용보험(0.9%), 근로소득세를 모두 반영했습니다.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--accent)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💡</span>
            표에 없는 연봉이나 상세한 비과세 항목(식대 등)을 적용해보고 싶다면 상단의 계산기를 이용해 보세요.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>연봉</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>월 총급여</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>4대보험</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>소득세+지방세</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>월 실수령액</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['2,400만원', '2,000,000', '243,620', '34,760',  '1,721,620'],
                  ['3,000만원', '2,500,000', '304,530', '104,930', '2,090,540'],
                  ['3,600만원', '3,000,000', '365,430', '175,120', '2,459,450'],
                  ['4,200만원', '3,500,000', '426,340', '289,290', '2,784,370'],
                  ['4,800만원', '4,000,000', '487,250', '408,980', '3,103,770'],
                  ['5,400만원', '4,500,000', '548,160', '528,650', '3,423,190'],
                  ['6,000만원', '5,000,000', '573,290', '744,610', '3,682,100'],
                  ['7,000만원', '5,833,333', '611,050', '1,108,630','4,113,653'],
                  ['8,000만원', '6,666,666', '611,050', '1,496,360','4,559,256'],
                  ['1억원',     '8,333,333', '611,050', '2,220,810','5,501,473'],
                ].map(([salary, gross, insurance, tax, net], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{salary}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{parseInt(gross).toLocaleString()}원</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#3EC8FF' }}>{parseInt(insurance).toLocaleString()}원</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FF8C3E' }}>{parseInt(tax).toLocaleString()}원</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>{parseInt(net).toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            ※ 부양가족 1인(본인) 기준, 비과세 없는 순수 급여 기준. 실제와 다소 차이가 있을 수 있습니다.
          </p>
        </div>

        {/* ── 2. 4대보험 요율 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            근로자 4대보험 요율 및 변경사항 총정리
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            2026년에는 국민연금 보험료율이 27년 만에 인상되고 건강보험·장기요양보험 요율도 조정되었습니다.
            근로자와 사업주가 각각 부담하는 요율은 아래와 같습니다.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>항목</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>근로자 부담</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>사업주 부담</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>상한 기준</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: '#FF8C3E', fontWeight: 500 }}>변경사항</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['국민연금',     '4.75%',              '4.75%',  '월 637만원',    '▲ 4.5% → 4.75% (27년 만 인상)'],
                  ['건강보험',     '3.595%',             '3.595%', '상한 없음',     '▲ 3.545% → 3.595%'],
                  ['장기요양보험', '건보료 × 13.14%',   '동일',   '건보료 연동',   '▲ 12.95% → 13.14%'],
                  ['고용보험',     '0.9%',               '0.9%+α', '상한 없음',     '동결'],
                  ['산재보험',     '없음 (사업주 전액)', '업종별 상이', '−',         '근로자 부담 없음'],
                ].map(([label, worker, employer, limit, change], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{worker}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{employer}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{limit}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#FF8C3E', fontSize: '12px' }}>{change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 국민연금 인상 배경 */}
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '6px' }}>💡 2026년 국민연금 인상 배경</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              정부는 국민연금 기금 고갈 문제를 해결하기 위해 2026년부터 보험료율을 기존 9%(근로자 4.5%)에서 9.5%(근로자 4.75%)로 인상했습니다.
              이는 1998년 이후 27년 만의 인상으로, 2033년까지 단계적으로 13%까지 올릴 계획입니다.
              월 급여 637만 원이 상한선으로, 그 이상 급여자는 동일한 금액(월 302,575원)이 공제됩니다.
            </p>
          </div>
        </div>

        {/* ── 3. 비과세 항목 안내 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>주요 비과세 급여 항목</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            비과세 수당은 4대보험료와 근로소득세 산정 기준에서 제외됩니다. 비과세 항목이 있으면 실제 실수령액이 아래 표보다 높아집니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { title: '식대',         limit: '월 20만원 이내', desc: '현물 식사 제공 시 비과세 없음' },
              { title: '자가운전보조금', limit: '월 20만원 이내', desc: '본인 차량으로 업무 사용 시' },
              { title: '출산·보육수당', limit: '월 20만원 이내', desc: '6세 이하 자녀 양육 직원' },
              { title: '연구보조비',    limit: '월 20만원 이내', desc: '연구 전담 직원 한정' },
              { title: '생산직 야간수당', limit: '연 240만원 이내', desc: '월정액급여 210만원 이하' },
              { title: '취재수당',      limit: '월 20만원 이내', desc: '기자 등 취재 업무 직원' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{item.title}</span>
                  <span style={{ fontSize: '11px', color: 'var(--accent)', background: 'var(--accent-dim)', borderRadius: '99px', padding: '2px 8px' }}>{item.limit}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: '부양가족 수가 늘어나면 실수령액이 얼마나 달라지나요?',
                a: '근로소득세는 부양가족 수에 따라 기본공제(1인당 연 150만 원)가 적용됩니다. 예를 들어 연봉 5,000만 원 기준으로 부양가족이 1인(본인)일 때보다 3인(본인+배우자+자녀1)일 때 월 소득세가 약 5~8만 원 줄어들어 실수령액이 그만큼 올라갑니다.',
              },
              {
                q: '식대 20만 원 비과세를 적용하면 실수령액이 얼마나 늘어나나요?',
                a: '식대 월 20만 원이 비과세로 처리되면 과세 기준 급여가 20만 원 줄어들어 4대보험료와 근로소득세가 감소합니다. 연봉 4,000만 원 기준 근로자라면 비과세 식대 적용 시 월 약 2~3만 원, 연간 약 25~35만 원의 추가 절세 효과가 있습니다.',
              },
              {
                q: '연봉 협상 시 세전과 세후 중 어느 기준으로 이야기해야 하나요?',
                a: '대부분의 연봉 계약은 세전(gross) 기준으로 이루어집니다. 하지만 실제 생활비 계획은 세후(net) 실수령액을 기준으로 해야 합니다. 연봉 협상 전 본 계산기로 실수령액을 미리 확인하고, 희망 실수령액을 역산해 협상에 활용하세요.',
              },
              {
                q: '프리랜서·개인사업자는 이 계산기를 사용할 수 없나요?',
                a: '이 계산기는 4대보험에 가입된 근로소득자(직장인) 기준입니다. 프리랜서·개인사업자는 3.3% 원천징수(소득세 3% + 지방소득세 0.3%)가 적용되며, 종합소득세 신고를 통해 정산합니다. 국민연금·건강보험은 지역가입자로 별도 납부합니다.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/loan',      icon: '💳', name: '대출이자 계산기',   desc: '월 실수령액으로 감당 가능한 대출 확인' },
              { href: '/tools/finance/compound',  icon: '📈', name: '복리 계산기',       desc: '월급 일부를 투자했을 때 미래 자산 계산' },
              { href: '/tools/finance/stock',     icon: '📉', name: '주식 물타기 계산기', desc: '급여 투자 후 평단가 관리' },
              { href: '/tools/health/weightloss', icon: '🎯', name: '목표 체중 감량 계산기', desc: '건강한 직장 생활을 위한 다이어트 계획' },
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