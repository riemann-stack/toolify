import Link from 'next/link'
import FourInsuranceClient from './FourInsuranceClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/finance/4-insurance',
  title: '4대보험 계산기 — 국민연금·건강보험·고용보험·산재보험 (2026년)',
  description: '2026년 기준 4대보험료를 근로자/사업주 부담으로 분리해 계산합니다. 국민연금 9.5%, 건강보험 7.19%, 장기요양 0.9448%, 고용보험 1.8%. 직장인·알바·자영업자·프리랜서 모두 활용.',
  keywords: ['4대보험계산기', '4대보험요율', '국민연금계산', '건강보험계산', '고용보험', '산재보험', '4대보험 사업주부담', '알바 4대보험', '프리랜서 3.3%', '두루누리'],
})

export default function FourInsurancePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        금융·재테크
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏥 4대보험 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        2026년 기준 <strong style={{ color: 'var(--text)' }}>국민연금·건강보험·장기요양·고용보험·산재보험</strong>을
        근로자/사업주 부담으로 분리해 계산합니다. 직장인 공제액, 사업주 채용 비용, 알바 4대보험 가입 비교, 프리랜서 3.3%와의 차이까지.
      </p>

      <FourInsuranceClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 2026 요율 한눈에 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            2026년 4대보험 요율 한눈에 보기
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['보험', '총 요율', '근로자', '사업주'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '국민연금',          c: '#C8FF3E', t: '9.5%',  e: '4.75%',  r: '4.75%' },
                  { n: '건강보험',          c: '#FF6B6B', t: '7.19%', e: '3.595%', r: '3.595%' },
                  { n: '장기요양보험*',     c: '#FF8C3E', t: '0.9448%', e: '0.4724%', r: '0.4724%' },
                  { n: '고용보험 (실업급여)', c: '#3EC8FF', t: '1.8%',  e: '0.9%',  r: '0.9%' },
                  { n: '고용보험 (사업주 추가)', c: '#3EC8FF', t: '0.25~0.85%', e: '0%', r: '0.25~0.85%' },
                  { n: '산재보험',          c: '#FFD700', t: '업종별 0.07~3.6%', e: '0%', r: '100%' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, boxShadow: `inset 3px 0 0 0 ${r.c}`, paddingLeft: 16 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.e}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            * 장기요양보험은 보수월액 기준 0.9448% (건강보험료의 약 13.14%로 환산)
          </p>
        </div>

        {/* ── 2. 2026 변경사항 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            📅 2026년 4대보험 변경사항
          </h2>
          <div style={{
            background: 'rgba(200,255,62,0.05)',
            border: '1px solid var(--accent)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 1.95,
          }}>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li>국민연금 <strong style={{ color: 'var(--accent)' }}>9% → 9.5%</strong> (0.5%p ↑) — 33년 만의 인상</li>
              <li>건강보험 <strong style={{ color: 'var(--accent)' }}>7.09% → 7.19%</strong> (0.1%p ↑)</li>
              <li>장기요양 <strong style={{ color: 'var(--accent)' }}>0.9182% → 0.9448%</strong> (2.9% ↑)</li>
              <li>고용보험 <strong>1.8% 동결</strong></li>
              <li>산재보험 — 업종별 변동 (12월 말 고시)</li>
              <li>국민연금 기준소득월액 상한 <strong style={{ color: 'var(--accent)' }}>617만 → 637만원</strong></li>
              <li>국민연금 기준소득월액 하한 <strong style={{ color: 'var(--accent)' }}>39만 → 40만원</strong></li>
            </ul>
          </div>
        </div>

        {/* ── 3. 보험별 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            보험별 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { n: '국민연금',     c: '#C8FF3E', d: '만 60세까지 가입 (수령 만 65세부터). 노령·유족·장애연금 보장. 기준소득월액 40만~637만원.' },
              { n: '건강보험',     c: '#FF6B6B', d: '직장가입자(사업장 통해)·지역가입자(자영업자). 본인부담금 외 의료 혜택. 피부양자 등록 가능.' },
              { n: '장기요양보험', c: '#FF8C3E', d: '65세 이상·노인성 질병 환자 대상. 건강보험료에 자동 부과. 방문요양·요양시설 지원.' },
              { n: '고용보험',     c: '#3EC8FF', d: '실업급여(비자발 퇴사 90~270일), 출산휴가급여·육아휴직급여, 국민내일배움카드.' },
              { n: '산재보험',     c: '#FFD700', d: '100% 사업주 부담. 업무상 재해·질병 보장. 출퇴근재해 포함(2018년~).' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.n}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 직원 1명 채용 시 회사 부담 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            직원 1명 채용 시 회사 실제 부담 (월급 300만원, 150인 미만, 사무직)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>항목</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>금액</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { i: '직원 월급',                    v: '3,000,000원',     a: false },
                  { i: '국민연금 사업주 (4.75%)',      v: '142,500원',       a: false },
                  { i: '건강보험 사업주 (3.595%)',     v: '107,850원',       a: false },
                  { i: '장기요양 사업주 (0.4724%)',    v: '14,170원',        a: false },
                  { i: '고용보험 사업주 (실업+추가)',  v: '34,500원',        a: false },
                  { i: '산재보험 사업주 (사무직 0.07%+0.12%)', v: '약 5,700원', a: false },
                  { i: '회사 월 총 부담',              v: '약 3,304,720원', a: true },
                  { i: '회사 연 총 부담',              v: '약 39,656,640원', a: true },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: r.a ? 'var(--accent-dim)' : (i % 2 === 0 ? 'transparent' : 'var(--bg2)') }}>
                    <td style={{ padding: '10px 12px', color: r.a ? 'var(--accent)' : 'var(--text)', fontWeight: r.a ? 800 : 600 }}>{r.i}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: r.a ? 'var(--accent)' : 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: r.a ? 800 : 700, fontSize: r.a ? 14 : 13 }}>{r.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 인건비는 단순 월급의 약 <strong style={{ color: 'var(--text)' }}>110% 수준</strong> · 퇴직금·상여금·연차수당 별도 발생
          </p>
        </div>

        {/* ── 5. 두루누리 지원 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            💡 두루누리 사회보험료 지원 (소상공인·자영업자 필독)
          </h2>
          <div style={{
            background: 'rgba(62,255,155,0.06)',
            border: '1px solid #3EFF9B',
            borderRadius: '12px',
            padding: '18px 20px',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 1.95,
          }}>
            <p style={{ fontWeight: 700, color: '#3EFF9B', marginBottom: 10 }}>대상 조건</p>
            <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--muted)' }}>
              <li>사업장 근로자 <strong style={{ color: 'var(--text)' }}>10인 미만</strong></li>
              <li>월 평균 보수 <strong style={{ color: 'var(--text)' }}>270만원 미만</strong></li>
              <li>입사일 직전 6개월간 고용 이력 없음</li>
              <li>재산 6억 이하, 종합소득 4,300만 이하</li>
            </ul>
            <p style={{ fontWeight: 700, color: '#3EFF9B', marginTop: 12, marginBottom: 6 }}>지원 내용</p>
            <p style={{ color: 'var(--muted)' }}><strong style={{ color: 'var(--text)' }}>국민연금·고용보험 최대 80% 지원</strong>, 36개월간</p>
            <p style={{ fontWeight: 700, color: '#3EFF9B', marginTop: 12, marginBottom: 6 }}>신청</p>
            <p style={{ color: 'var(--muted)' }}>4대보험 취득신고 시 동시 신청 · 국민연금공단 <strong style={{ color: 'var(--text)' }}>1355</strong></p>
          </div>
        </div>

        {/* ── 6. 알바 의무 가입 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            알바 4대보험 의무 가입 기준
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EFF9B', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#3EFF9B', fontWeight: 700, marginBottom: 8 }}>✅ 가입 의무</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>1개월 이상 근무 + 월 60시간 이상 → 국민·건강·고용 의무</li>
                <li>주 15시간 이상 → 주휴수당 + 고용보험 의무</li>
                <li>산재보험은 모든 근로자 의무 (시간 무관)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FF8C3E', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#FF8C3E', fontWeight: 700, marginBottom: 8 }}>❌ 미가입 가능</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>1개월 미만 단기 근무</li>
                <li>월 60시간 미만 (4대보험 일부 면제)</li>
                <li>단, 산재보험은 항상 적용</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 7. 프리랜서 vs 4대보험 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            프리랜서 3.3% vs 근로자 4대보험 차이
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'rgba(155,89,182,0.05)', border: '1px solid rgba(155,89,182,0.30)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#C485E0', fontWeight: 700, marginBottom: 8 }}>프리랜서 (사업소득자)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>원천징수 3.3% (사업소득세 3% + 지방세 0.3%)</li>
                <li>5월 종합소득세 신고 의무</li>
                <li>경비 처리 가능 (사업자등록 시 더 유리)</li>
                <li>4대보험 직장가입 X (지역가입자로 별도)</li>
                <li>실업급여·산재 보장 X (특수형태근로자 일부 적용)</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(200,255,62,0.04)', border: '1px solid var(--accent)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>근로자 (4대보험)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>4대보험 약 9.7% 공제</li>
                <li>소득세 별도 (간이세액 자동 원천징수)</li>
                <li>실업급여·산재·국민연금 보장</li>
                <li>연차·퇴직금·해고 보호</li>
              </ul>
            </div>
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
            ⚠️ <strong style={{ color: '#FF8C8C' }}>위장도급 주의:</strong> 실질이 근로자인데 프리랜서 계약 = 법 위반.
            의심 시 고용노동부 <strong style={{ color: 'var(--text)' }}>1350</strong> 또는 노무사 상담을 권장합니다.
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
                q: '2026년 4대보험 요율은 얼마나 인상되었나요?',
                a: '2026년에는 <strong>국민연금이 9%에서 9.5%로 0.5%p 인상</strong>되어 33년 만의 큰 변화가 있었습니다. 건강보험은 7.09%에서 7.19%로 0.1%p, 장기요양보험도 0.9182%에서 0.9448%로 인상되었습니다. 고용보험은 1.8%로 동결되었으며, 산재보험은 업종별로 12월 말 고시됩니다. 월급 300만원 기준 근로자 부담은 약 1만 5천원 증가합니다.',
              },
              {
                q: '직원 1명 채용 시 회사가 실제 부담하는 금액은 얼마인가요?',
                a: '월급 300만원 직원 채용 시 회사는 <strong>월 약 30만원의 4대보험을 추가 부담</strong>합니다. 세부 내역은 국민연금 14만 2천원, 건강보험 10만 8천원, 장기요양 1만 4천원, 고용보험(실업급여+사업주 추가) 약 3만 4천원, 산재보험은 업종별 변동입니다. 따라서 회사 총 인건비는 월 약 330만원이며, 연간으로는 약 3,960만원 수준입니다. 추가로 퇴직금·연차·상여 등이 별도로 발생합니다.',
              },
              {
                q: '알바도 4대보험에 의무 가입해야 하나요?',
                a: '<strong>1개월 이상 근무하면서 월 60시간 이상 근무하는 알바는 국민연금·건강보험·고용보험에 의무 가입</strong>해야 합니다. 주 15시간 이상 근무하는 경우 주휴수당과 고용보험이 적용됩니다. 산재보험은 근무 시간과 관계없이 모든 근로자에게 적용됩니다. 단순 단기 알바(1개월 미만)나 월 60시간 미만 초단시간 근무는 4대보험 일부가 면제될 수 있습니다.',
              },
              {
                q: '프리랜서 3.3%와 4대보험 급여 중 어느 게 유리한가요?',
                a: '단순 실수령액만 비교하면 프리랜서가 약 6% 더 받을 수 있지만, 종합적으로 봐야 합니다. <strong>프리랜서는 5월 종합소득세 신고 의무</strong>가 있고, 실업급여·산재 보장이 약합니다. 반면 근로자는 4대보험 보장(실업급여·국민연금·건강보험·산재)이 두텁고 퇴직금·연차·해고 제한 등 근로기준법 보호를 받습니다. 장기적·안정적 측면에서는 근로자, 단기·자율적 측면에서는 프리랜서가 유리합니다.',
              },
              {
                q: '두루누리 사회보험료 지원은 어떻게 신청하나요?',
                a: '두루누리 지원은 <strong>10인 미만 사업장의 월 270만원 미만 근로자</strong>를 대상으로 국민연금과 고용보험을 최대 80%까지 36개월간 지원하는 제도입니다. 신청은 4대보험 취득신고 시 함께 진행하면 되고, 국민연금공단(<strong>1355</strong>)에서 상담받을 수 있습니다. 입사일 직전 6개월간 고용 이력이 없어야 하며, 재산 6억 이하·종합소득 4,300만 이하 조건도 충족해야 합니다. 소상공인·자영업자에게 매우 유용한 제도이므로 신규 채용 시 확인하세요.',
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
              { href: '/tools/finance/salary',     icon: '💴', name: '연봉 실수령액 계산기',  desc: '2026년 기준 세후 월 실수령액' },
              { href: '/tools/finance/installment',icon: '💳', name: '카드 할부 계산기',      desc: '월 납부액·일시불 vs 무이자 비교' },
              { href: '/tools/finance/vat',        icon: '🧾', name: '부가세 계산기',         desc: '공급가액·부가세 역산 계산' },
              { href: '/tools/finance/cost-rate',  icon: '🍽️', name: '메뉴 원가율 계산기',    desc: '재료비·배달 수수료·실질 원가율' },
              { href: '/tools/finance/car-cost',   icon: '🚗', name: '자동차 유지비 계산기',  desc: '유류비·보험·소모품·감가상각' },
              { href: '/tools/finance/loan',       icon: '💳', name: '대출이자 계산기',       desc: '원리금균등·원금균등 비교' },
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
