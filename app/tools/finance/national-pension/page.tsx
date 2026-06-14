import Link from 'next/link'
import NationalPensionClient from './NationalPensionClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/finance/national-pension',
  title: '국민연금 예상 수령액 계산기 — 2026 A값·조기연기 반영',
  description:
    '가입기간·평균소득·출생연도로 노령연금 월 예상액을 추정합니다. 조기수령 감액·연기연금 가산, 부양가족연금까지. 2026년 A값 3,193,511원 기준.',
  keywords: [
    '국민연금 예상수령액',
    '국민연금 계산기',
    '노령연금 계산',
    '국민연금 조기수령',
    '연기연금',
    '국민연금 A값',
    '1969년생 국민연금',
    '부양가족연금',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}
const para: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
  marginBottom: '12px',
}
const strong: React.CSSProperties = { color: 'var(--text)' }
const formulaBox: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 16px',
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '14px',
  color: 'var(--text)',
  lineHeight: 1.9,
}

const FAQ_LD = [
  {
    q: '국민연금 예상 수령액은 어떻게 계산하나요?',
    a: '공단 간단계산 산식은 <strong>기본연금액 = 1.29 × (A값 + B값) × (1 + 0.05 × n/12)</strong>입니다. A값은 전체 가입자의 3년 평균 소득월액(2026년 3,193,511원), B값은 본인의 평균 기준소득월액, n은 20년(240개월)을 초과한 가입월수입니다. 여기에 가입기간 지급률(10년 50% → 20년 100%)을 곱한 뒤 12로 나눠 월액을 구합니다. 예로 20년 가입·B 250만원이면 월 약 612,052원입니다.',
  },
  {
    q: '10년만 납부하면 국민연금을 얼마나 받나요?',
    a: '가입 10년(120개월)은 노령연금 수급 최소 기간으로, 지급률이 <strong>50%</strong>입니다. 같은 소득이라도 20년 가입자의 절반 수준이 됩니다. 예로 B 250만원·정상수령이면 20년은 월 약 61만원, 10년은 그 절반인 월 약 30만원대입니다. 10년을 못 채우면 노령연금 대신 그동안 낸 보험료를 이자와 함께 반환일시금으로 받습니다.',
  },
  {
    q: '국민연금 조기수령하면 얼마나 깎이나요?',
    a: '조기노령연금은 정상 개시연령보다 1년 일찍 받을 때마다 <strong>연 6%</strong>(월 0.5%)씩 감액됩니다. 최대 5년 일찍 받으면 30% 감액되어 평생 70%만 받습니다. 일찍·오래 받는 대신 월액이 줄어드는 구조라, 손익분기 연령을 넘겨 장수할수록 정상수령이 누적상 유리해집니다.',
  },
  {
    q: '연기연금은 얼마나 더 받나요?',
    a: '연기연금은 정상 개시연령보다 1년 늦게 받을 때마다 <strong>연 7.2%</strong>(월 0.6%)씩 가산됩니다. 최대 5년 늦추면 36% 가산되어 평생 136%를 받습니다. 수급 시기를 미룰 여유가 있고 건강·기대수명이 길다면 연기연금이 유리할 수 있습니다.',
  },
  {
    q: 'A값이 무엇인가요?',
    a: 'A값은 <strong>전체 국민연금 가입자의 최근 3년간 평균 소득월액</strong>으로, 연금액 계산의 균등 부분(소득재분배 요소)에 들어갑니다. 2026년 적용 A값은 <strong>3,193,511원</strong>(적용기간 2025.12~2026.11)입니다. A값이 클수록 소득이 낮은 가입자에게 상대적으로 유리하게 작용합니다. 본인 소득인 B값과 합산해 기본연금액을 산정합니다.',
  },
  {
    q: '1969년생은 몇 살부터 국민연금을 받나요?',
    a: '출생연도에 따라 수급개시연령이 다릅니다. <strong>1969년생 이후 출생자는 만 65세</strong>부터 노령연금을 받습니다. 1965~1968년생은 64세, 1961~1964년생은 63세, 1957~1960년생은 62세, 1953~1956년생은 61세, 1952년 이전은 60세입니다.',
  },
  {
    q: '부양가족연금은 얼마나 가산되나요?',
    a: '노령연금 수급자에게 부양가족이 있으면 정액으로 가산됩니다(2026년 기준). <strong>배우자는 연 306,630원(월 약 25,552원)</strong>, <strong>자녀·부모는 1인당 연 204,360원(월 약 17,030원)</strong>입니다. 부양가족연금은 조기·연기 보정과 무관하게 정액으로 더해집니다.',
  },
  {
    q: '20년 납입하면 국민연금 월 얼마인가요?',
    a: '가입 20년(240개월)은 지급률 100% 구간입니다. 평균 기준소득월액(B값) <strong>250만원</strong>·정상수령 기준이면 월 약 <strong>612,052원</strong>입니다. B값이 높을수록, 가입기간이 20년을 넘을수록(1년당 5%씩 증액) 월액이 커집니다. 이 값은 공단 간단계산 산식 기반 추정이며 실제 연금은 가입연도별 재평가율에 따라 달라집니다.',
  },
]

const ageRows = [
  { y: '1952년 이전', a: '만 60세' },
  { y: '1953~1956년생', a: '만 61세' },
  { y: '1957~1960년생', a: '만 62세' },
  { y: '1961~1964년생', a: '만 63세' },
  { y: '1965~1968년생', a: '만 64세' },
  { y: '1969년생 이후', a: '만 65세' },
]

export default function NationalPensionPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        금융·재테크
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧓 국민연금 예상 수령액 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        가입기간·평균소득·출생연도를 넣으면 노령연금 월 예상액을 <strong style={strong}>공단 간단계산 산식</strong>으로 추정합니다. 조기수령 감액·연기연금 가산, 부양가족연금까지 한 번에 비교합니다.
      </p>

      <UpdatedMeta
        date="2026년 1월"
        basis="A값 적용기간 2025.12~2026.11 기준"
        sources={[{ label: '국민연금공단(nps.or.kr)', href: 'https://www.nps.or.kr/' }]}
      />

      <Disclaimer
        variant="finance"
        open
        sources={[{ label: '국민연금공단(nps.or.kr)', href: 'https://www.nps.or.kr/' }]}
      >
        본 계산기는 국민연금공단 간단계산 산식(1.29×(A+B)×지급률)을 단순화한 추정값입니다. 실제 연금액은 가입연도별 재평가율·소득대체율·비례상수 가중과 기준소득월액 이력에 따라 달라지며, 수급 자격(최소 가입 10년)·정확한 금액은 「내 곁에 국민연금」 앱 또는 국민연금공단(1355)에서 확인하세요. 수급 가능 여부를 단정하지 않습니다.
      </Disclaimer>

      <NationalPensionClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 어떻게 계산되나 */}
        <div>
          <h2 style={sectionTitle}>예상 수령액은 어떻게 계산되나</h2>
          <p style={para}>
            노령연금의 기본연금액은 공단 간단계산 산식으로 추정합니다. 균등 부분인 A값(전체 가입자 평균소득)과 소득비례 부분인 B값(본인 평균소득)을 더한 뒤, 20년 초과 가입월수만큼 증액합니다.
          </p>
          <div style={formulaBox}>
            기본연금액 = <strong style={{ color: 'var(--accent-ink)' }}>1.29</strong> × (A값 + B값) × (1 + 0.05 × n / 12)
            <br />
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              · A값: 전체 가입자 3년 평균 소득월액 · B값: 본인 평균 기준소득월액 · n: 20년(240개월) 초과 가입월수
            </span>
          </div>
          <p style={{ ...para, marginTop: '12px', marginBottom: 0 }}>
            여기에 가입기간 지급률(10년 50% → 20년 100%)을 곱하고 12로 나누면 월액이 됩니다. 검산 예시로 <strong style={strong}>가입 20년·B 250만원·정상수령이면 월 약 612,052원</strong>입니다.
          </p>
        </div>

        {/* 2. 가입기간 */}
        <div>
          <h2 style={sectionTitle}>가입기간이 길수록 유리하다</h2>
          <p style={para}>
            가입기간 지급률은 최소 가입 10년에서 <strong style={strong}>50%</strong>로 시작해 1개월마다 약 0.417%p씩 올라 <strong style={strong}>20년에 100%</strong>가 됩니다. 20년을 넘기면 지급률은 100%로 고정되지만, 초과한 가입월수 1년(12개월)마다 기본연금액 자체가 <strong style={strong}>5%씩 증액</strong>됩니다.
          </p>
          <p style={{ ...para, marginBottom: 0 }}>
            즉 10년만 채우면 같은 소득의 20년 가입자 대비 절반 수준이고, 30년을 채우면 20년 대비 약 1.5배(초과 10년 × 5% = 50% 증액)까지 늘어납니다. 가입기간이 연금액에 가장 직접적으로 작용합니다.
          </p>
        </div>

        {/* 3. 조기 vs 연기 */}
        <div>
          <h2 style={sectionTitle}>조기수령 vs 연기연금 — 감액·가산과 손익분기</h2>
          <p style={para}>
            정상 개시연령보다 일찍 받는 <strong style={strong}>조기노령연금</strong>은 1년당 <strong style={strong}>6% 감액</strong>(최대 5년 30% 감액 → 70% 수령), 늦게 받는 <strong style={strong}>연기연금</strong>은 1년당 <strong style={strong}>7.2% 가산</strong>(최대 5년 36% 가산 → 136% 수령)입니다.
          </p>
          <p style={{ ...para, marginBottom: 0 }}>
            조기수령은 일찍 시작하는 대신 월액이 적어, 일정 나이를 넘겨 오래 받으면 정상수령에 누적액이 따라잡힙니다. 이 교차 나이가 <strong style={strong}>손익분기점</strong>입니다. 계산기는 보정·물가를 뺀 단순 누적 기준으로 손익분기 연령을 참고용으로 보여줍니다. 건강·기대수명·소득공백을 함께 고려해 판단하세요.
          </p>
        </div>

        {/* 4. A값·B값 */}
        <div>
          <h2 style={sectionTitle}>A값·B값이 무엇이고 어떻게 반영되나</h2>
          <p style={para}>
            <strong style={strong}>A값</strong>은 전체 국민연금 가입자의 최근 3년 평균 소득월액으로, 소득재분배(균등) 요소입니다. 2026년 적용 A값은 <strong style={strong}>3,193,511원</strong>(적용기간 2025.12~2026.11)입니다. 소득이 낮은 가입자일수록 A값 비중이 커서 상대적으로 유리하게 작용합니다.
          </p>
          <p style={{ ...para, marginBottom: 0 }}>
            <strong style={strong}>B값</strong>은 본인의 가입기간 평균 기준소득월액(소득비례 요소)입니다. 기준소득월액은 상·하한이 있어 너무 높거나 낮은 소득은 일정 범위로 조정되며, 계산기는 41만원~659만원 범위로 클램프해 반영합니다.
          </p>
        </div>

        {/* 5. 출생연도별 개시연령 */}
        <div>
          <h2 style={sectionTitle}>출생연도별 수급개시연령</h2>
          <p style={para}>
            노령연금을 받기 시작하는 나이는 출생연도에 따라 단계적으로 늦춰져 왔습니다. <strong style={strong}>1969년생 이후는 만 65세</strong>가 기준입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 320 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['출생연도', '수급개시연령'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ageRows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.y}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent-ink)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. 한계 */}
        <div>
          <h2 style={sectionTitle}>이 계산기의 한계</h2>
          <p style={{ ...para, marginBottom: 0 }}>
            이 도구는 공단 간단계산 산식을 단순화한 추정입니다. 실제 연금액은 가입연도별 <strong style={strong}>재평가율</strong>(과거 소득을 현재 가치로 환산하는 비율)과 <strong style={strong}>소득대체율</strong>·비례상수의 연도별 가중, 그리고 매년 달라진 기준소득월액 이력을 모두 반영해 계산됩니다. 이 계산기는 단일 평균소득과 2026년 A값을 가정하므로 실제와 차이가 납니다. 정확한 예상액은 「내 곁에 국민연금」 앱에서 본인의 실제 가입이력으로 조회하세요.
          </p>
        </div>

        {/* FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* 관련 도구 */}
        <div>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/4-insurance', icon: '🧾', name: '4대보험 계산기', desc: '국민연금·건강·고용·산재 보험료' },
              { href: '/tools/finance/severance', icon: '💼', name: '퇴직금 계산기', desc: '평균/통상 자동 + 퇴직소득세' },
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
