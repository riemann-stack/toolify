import Link from 'next/link'
import YearEndTaxClient from './YearEndTaxClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'

export const metadata = buildMetadata({
  path: '/tools/finance/year-end-tax',
  title: '연말정산 계산기 — 2026 환급·추가납부 시뮬레이터',
  description:
    '총급여와 신용카드·연금저축·의료비·월세 등 공제를 넣으면 결정세액과 기납부세액을 비교해 예상 환급·추가납부액을 추정합니다. 2026년 기준.',
  keywords: [
    '연말정산 계산기',
    '환급금 계산',
    '연말정산 미리보기',
    '연말정산 환급',
    '추가납부 계산',
    '결정세액 계산',
    '연금저축 세액공제',
    '신용카드 소득공제',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '12px',
}
const para: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.85,
  marginBottom: '12px',
}
const strong: React.CSSProperties = { color: 'var(--text)' }
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }
const tdLabel: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }
const tdVal: React.CSSProperties = { padding: '10px 12px', color: 'var(--accent-ink)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }

const FAQ_LD = [
  {
    q: '연말정산 환급금은 어떻게 계산되나요?',
    a: '연말정산은 1년 동안 매월 떼인 세금(<strong>기납부세액</strong>)과 각종 공제를 반영해 확정한 진짜 세금(<strong>결정세액</strong>)을 비교하는 절차입니다. 결정세액이 기납부세액보다 적으면 그 차액을 돌려받고(환급), 많으면 더 냅니다(추가 납부). 결정세액은 총급여 → 근로소득공제 → 소득공제 → 과세표준 → 누진세율 → 세액공제 순서로 산출됩니다. 즉 공제가 많아 결정세액이 줄어들수록 환급이 커집니다.',
  },
  {
    q: '연말정산에서 왜 돈을 토해내나요(추가 납부)?',
    a: '매월 원천징수는 국세청 간이세액표 기준으로 평균적인 공제만 반영해 떼입니다. 그런데 부양가족이 줄었거나, 카드·의료비·연금 등 공제가 평균보다 적으면 확정 결정세액이 그동안 낸 세금보다 커져 차액을 추가로 냅니다. 반대로 공제가 평균보다 많으면 환급받습니다. 추가 납부 자체가 손해는 아니며, 미리 덜 떼였던 세금을 정산하는 것입니다.',
  },
  {
    q: '신용카드 소득공제는 얼마부터 받나요?',
    a: '신용카드 등 사용액이 <strong>총급여의 25%</strong>를 넘는 분부터 소득공제됩니다. 예로 총급여 5,000만원이면 1,250만원까지는 공제가 없고, 그 초과분에 대해 신용카드 15%·체크카드/현금영수증 30%·전통시장·대중교통 40%로 공제합니다. 25% 문턱은 결제수단과 무관하게 채워지므로, 문턱까지는 혜택 큰 신용카드를 쓰고 초과분은 공제율 높은 체크카드·현금영수증으로 채우는 편이 유리합니다.',
  },
  {
    q: '연금저축·IRP는 얼마 넣으면 세액공제를 다 받나요?',
    a: '연금저축은 연 <strong>600만원</strong>, IRP를 합치면 <strong>900만원</strong>까지 세액공제 대상입니다. 공제율은 총급여 5,500만원 이하면 15%, 초과면 12%입니다. 900만원을 모두 넣으면 총급여 5,500만 이하 기준 135만원(900만×15%), 초과 기준 108만원(900만×12%)을 결정세액에서 직접 깎습니다. 연말까지 추가 납입한 금액도 당해 공제 대상이라 막판 절세 수단으로 자주 쓰입니다.',
  },
  {
    q: '월세 세액공제는 총급여 얼마까지 받나요?',
    a: '무주택 세대주이면서 총급여 <strong>8,000만원 이하</strong>일 때 연 월세 1,000만원 한도로 세액공제합니다. 공제율은 총급여 5,500만원 이하면 17%, 5,500만~8,000만원이면 15%입니다. 예로 총급여 4,500만원·연 월세 600만원이면 600만×17% = 102만원을 결정세액에서 깎습니다. 임대차계약서 주소와 주민등록 주소가 같아야 하고 본인 명의로 납부해야 합니다.',
  },
  {
    q: '맞벌이 부부는 의료비·카드를 누구에게 몰아주는 게 유리한가요?',
    a: '<strong>의료비</strong>는 총급여 3% 초과분만 공제되므로 문턱이 낮은 <strong>소득이 적은 배우자</strong>에게 몰면 공제 대상이 커지는 경우가 많습니다. 반면 <strong>신용카드</strong>도 25% 문턱이 있어 소득이 적은 쪽이 채우기 쉽지만, 세액공제·소득공제 효과는 <strong>한계세율이 높은(소득이 많은) 배우자</strong>에게서 더 큽니다. 부양가족 기본공제는 한 명에게만 적용되므로, 두 경우를 모두 넣어 결정세액 합계가 작은 조합을 고르는 것이 정답입니다.',
  },
  {
    q: '표준세액공제 13만원은 언제 적용되나요?',
    a: '의료비·교육비·기부금·보험료·월세 등 항목별 특별세액공제 합계가 <strong>13만원에 못 미칠 때</strong> 자동으로 표준세액공제 13만원이 적용됩니다(둘 중 큰 쪽). 공제할 항목이 거의 없는 사회초년생·1인 가구는 보통 표준 13만원이 적용됩니다. 이 계산기는 입력한 항목 합계와 13만원을 비교해 더 큰 쪽을 자동으로 반영합니다.',
  },
  {
    q: '이 계산기 결과가 홈택스 연말정산 미리보기와 다른 이유는?',
    a: '이 도구는 신용카드·연금계좌·의료비·교육비·기부금·월세 등 <strong>핵심 공제만</strong> 반영한 간이 추정입니다. 난임·중증질환 의료비 가중, 중소기업 취업자 감면, 주택자금(전세·주택담보 이자)공제, 회사별 비과세 항목, 실제 원천징수 기납부세액 차이 등은 반영하지 않아 실제와 차이가 납니다. 정확한 금액은 국세청 홈택스 연말정산 간소화·모의계산 또는 세무 전문가로 확인하세요.',
  },
]

/* 공제 한도표 (정적·표시용 — 수치는 본문 가이드 설명용) */
const limitRows: [string, string, string][] = [
  ['신용카드 등', '총급여 25% 초과분', '신용 15%·체크/현금 30%·전통시장·대중교통 40% (기본 300만 한도)'],
  ['연금계좌(연금저축+IRP)', '900만원 (연금저축 600만)', '총급여 5,500만 이하 15% / 초과 12%'],
  ['의료비', '총급여 3% 초과분', '공제율 15% (세액공제)'],
  ['교육비', '본인 전액·자녀 한도', '공제율 15% (세액공제)'],
  ['월세', '연 1,000만원 (총급여 8천만 이하)', '5,500만 이하 17% / 초과 15%'],
  ['기부금', '소득금액 한도', '1천만 이하 15% / 초과분 30%'],
]

export default function YearEndTaxPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        금융·재테크
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧾 연말정산 환급·추가납부 시뮬레이터
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        총급여와 신용카드·연금저축·의료비·월세 등 공제를 넣으면 <strong style={strong}>결정세액과 기납부세액을 비교</strong>해 예상 환급·추가납부액을 추정합니다. 2026년 기준.
      </p>

      <UpdatedMeta
        date="2026년"
        basis="2026년 종합소득세율·근로소득공제·공제 한도 기준"
        sources={[{ label: '국세청 홈택스(hometax.go.kr)', href: 'https://hometax.go.kr' }]}
      />

      <Disclaimer
        variant="finance"
        sources={[{ label: '국세청 홈택스(nts.go.kr)', href: 'https://www.nts.go.kr/' }]}
      >
        핵심 공제 항목만 반영한 간이 추정치로, 실제 결정세액·환급액과 차이가 날 수 있습니다(난임 의료비·중소기업 감면·기납부세액 차이·회사별 비과세·주택자금공제 등 미반영). 정확한 금액은 국세청 홈택스 연말정산 간소화·모의계산 또는 세무 전문가로 확인하세요. 본 도구는 환급 가능 여부를 법적으로 판정하지 않습니다.
      </Disclaimer>

      <YearEndTaxClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 연말정산이란 */}
        <section>
          <h2 style={sectionTitle}>연말정산이란 — 환급과 추가 납부가 갈리는 원리</h2>
          <p style={para}>
            연말정산은 1년 동안 매월 떼인 세금(<strong style={strong}>기납부세액</strong>)과, 각종 공제를 모두 반영해 확정한 진짜 세금(<strong style={strong}>결정세액</strong>)을 맞춰보는 절차입니다. 두 값의 차이로 환급·추가 납부가 갈립니다.
          </p>
          <p style={{ ...para, marginBottom: 0 }}>
            결정세액이 기납부세액보다 <strong style={strong}>적으면 차액을 돌려받고(환급)</strong>, <strong style={strong}>많으면 더 냅니다(추가 납부)</strong>. 매월 원천징수는 평균적인 공제만 반영하므로, 카드·의료비·연금 등 공제가 평균보다 많으면 환급이, 적으면 추가 납부가 발생합니다.
          </p>
        </section>

        {/* 2. 결정세액 5단계 */}
        <section>
          <h2 style={sectionTitle}>결정세액이 정해지는 5단계</h2>
          <p style={para}>총급여에서 출발해 두 종류의 공제를 거쳐 결정세액이 확정됩니다.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['① 총급여', '비과세를 뺀 연간 급여에서 근로소득공제를 차감해 근로소득금액을 구합니다.'],
              ['② 소득공제', '인적공제(부양가족)·연금보험료·건강보험료·신용카드 등을 빼 과세표준을 낮춥니다.'],
              ['③ 과세표준', '근로소득금액 − 소득공제. 세율이 적용되는 기준 금액입니다.'],
              ['④ 산출세액', '과세표준에 6~45% 누진세율을 적용합니다.'],
              ['⑤ 세액공제', '근로소득·자녀·연금계좌·특별(의료·교육·기부·월세) 공제를 산출세액에서 직접 깎아 결정세액(소득세)이 나오고, 지방소득세 10%가 더해집니다.'],
            ].map(([k, v], i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-ink)', margin: '0 0 4px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{k}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{v}</p>
              </div>
            ))}
          </div>
          <p style={{ ...para, marginTop: '12px', marginBottom: 0 }}>
            <strong style={strong}>소득공제</strong>는 과세표준을 낮춰 절세효과가 한계세율에 비례하고, <strong style={strong}>세액공제</strong>는 세금을 직접 깎습니다. 그래서 같은 1만원이라도 어떤 공제냐에 따라 환급 효과가 다릅니다.
          </p>
        </section>

        {/* 3. 핵심 공제 6가지 한도표 */}
        <section>
          <h2 style={sectionTitle}>핵심 공제 6가지 — 2026 한도·공제율</h2>
          <p style={para}>환급을 좌우하는 대표 공제 6가지의 한도와 공제율입니다.</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>공제 항목</th>
                  <th scope="col" style={th}>한도·기준</th>
                  <th scope="col" style={th}>공제율</th>
                </tr>
              </thead>
              <tbody>
                {limitRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={tdLabel}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. 신용카드 활용법 */}
        <section>
          <h2 style={sectionTitle}>신용카드 소득공제 활용법 — 25% 문턱 전략</h2>
          <p style={para}>
            신용카드 등 사용액은 <strong style={strong}>총급여의 25%를 넘는 분부터</strong> 공제됩니다. 총급여 5,000만원이면 1,250만원까지는 공제가 없습니다. 이 문턱은 결제수단과 무관하게 채워집니다.
          </p>
          <p style={{ ...para, marginBottom: 0 }}>
            그래서 <strong style={strong}>문턱(25%)까지는 혜택 큰 신용카드(공제율 15%)</strong>로 쓰고, <strong style={strong}>초과분은 공제율 높은 체크카드·현금영수증(30%)이나 전통시장·대중교통(40%)</strong>으로 채우는 편이 유리합니다. 전통시장·대중교통은 추가 한도가 별도로 있어 공제가 더 늘 수 있습니다.
          </p>
        </section>

        {/* 5. 맞벌이·몰아주기 vs 표준 */}
        <section>
          <h2 style={sectionTitle}>맞벌이 몰아주기와 표준세액공제 13만원 비교</h2>
          <p style={para}>
            맞벌이 부부는 <strong style={strong}>의료비</strong>(총급여 3% 초과분만 공제)는 문턱이 낮은 소득이 적은 배우자에게, 효과는 한계세율이 높은 배우자에게서 큽니다. 부양가족 기본공제는 한 명에게만 적용되므로, 두 조합을 모두 넣어 결정세액 합계가 작은 쪽을 고릅니다.
          </p>
          <p style={{ ...para, marginBottom: 0 }}>
            한편 의료비·교육비·기부금·월세 등 특별세액공제 합계가 <strong style={strong}>13만원에 못 미치면 표준세액공제 13만원</strong>이 자동 적용됩니다. 공제할 항목이 거의 없는 사회초년생은 보통 표준 13만원이 적용되니, 굳이 영수증을 모으기보다 연금계좌처럼 효과 큰 공제에 집중하는 편이 낫습니다.
          </p>
        </section>

        {/* 6. 막판 절세 체크리스트 */}
        <section>
          <h2 style={sectionTitle}>환급 늘리는 막판 절세 체크리스트</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              ['연금저축·IRP 추가 납입', '연 900만원 한도까지. 12월 말 추가 납입분도 당해 공제(15·12%).'],
              ['신용카드 25% 문턱 확인', '문턱 초과분은 체크카드·현금영수증으로 채워 공제율 30% 적용.'],
              ['월세 세액공제 요건', '무주택 세대주·총급여 8천만 이하·계약서 주소 일치 확인.'],
              ['부양가족 등록 점검', '소득요건 충족 부모·자녀를 누락 없이 등록(소득 100만원 이하).'],
              ['의료비 영수증 합산', '안경·렌즈·산후조리원 등 누락분 합산해 3% 문턱 초과 여부 확인.'],
              ['기부금 영수증 챙기기', '정치자금·종교·지정기부금 영수증 확보(1천만 초과분 30%).'],
            ].map(([k, v], i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>{k}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 홈택스와 다른 이유 */}
        <section>
          <h2 style={sectionTitle}>이 계산기와 홈택스가 다른 이유</h2>
          <p style={{ ...para, marginBottom: 0 }}>
            이 도구는 신용카드·연금계좌·의료비·교육비·기부금·월세 등 <strong style={strong}>핵심 공제만</strong> 반영한 간이 추정입니다. 난임·중증질환 의료비 가중, 중소기업 취업자 감면, 주택자금(전세·주택담보 이자)공제, 회사별 비과세 항목, 실제 원천징수된 기납부세액 차이는 반영하지 않아 실제 결과와 차이가 납니다. 기납부세액을 비우면 의무공제만 반영한 원천징수 추정치를 쓰므로, 원천징수영수증의 실제 결정세액을 입력하면 정확도가 올라갑니다. 확정 금액은 국세청 홈택스 연말정산 간소화·모의계산으로 확인하세요.
          </p>
        </section>

        {/* FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/salary', icon: '💰', name: '연봉 실수령액 계산기', desc: '매달 떼이는 세금·4대보험·세후 월급' },
              { href: '/tools/finance/freelance-tax', icon: '🧑‍💻', name: '프리랜서 3.3% 계산기', desc: '원천징수·종합소득세 신고 정산' },
              { href: '/tools/finance/4-insurance', icon: '🧾', name: '4대보험 계산기', desc: '국민연금·건강·고용 보험료 본인부담' },
              { href: '/tools/finance/severance', icon: '💼', name: '퇴직금 계산기', desc: '평균임금·퇴직소득세 자동 계산' },
            ].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
                }}
              >
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
