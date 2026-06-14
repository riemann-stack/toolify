import Link from 'next/link'
import UnemploymentClient from './UnemploymentClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import UpdatedMeta from '@/components/UpdatedMeta'
import {
  BENEFIT_DAYS_2019,
  COVERAGE_BRACKETS,
  UI_DAILY_CAP_2026,
  UI_DAILY_FLOOR_2026,
  UI_WAGE_DAILY_CAP_2026,
  type AgeGroup,
} from '@/lib/krUnemployment'

export const metadata = buildMetadata({
  path: '/tools/finance/unemployment-benefit',
  title: '실업급여 계산기 — 2026 구직급여 1일액·소정급여일수·총수급액',
  description:
    '퇴직 전 3개월 급여와 나이·고용보험 가입기간으로 2026년 실업급여 하루 얼마·며칠·총 얼마인지 계산합니다. 상한 68,100원·하한 66,048원 반영.',
  keywords: [
    '실업급여 계산기',
    '2026 실업급여',
    '구직급여 상한액',
    '소정급여일수',
    '실업급여 하루 얼마',
    '고용보험 실업급여',
    '실업급여 모의계산',
    '실업급여 며칠',
  ],
})

const won = (n: number) => n.toLocaleString('ko-KR')

const AGE_GROUP_LABEL: Record<AgeGroup, string> = {
  under50: '50세 미만',
  '50plus': '50세 이상 · 장애인',
}
const AGE_GROUPS: AgeGroup[] = ['under50', '50plus']
const BRACKET_SHORT: Record<string, string> = {
  lt1: '1년 미만',
  y1to3: '1~3년',
  y3to5: '3~5년',
  y5to10: '5~10년',
  y10plus: '10년+',
}

const FAQ_LD = [
  {
    q: '2026년 실업급여는 하루 얼마인가요? (상한·하한)',
    a: `2026년 1일 구직급여 <strong>상한액은 ${won(UI_DAILY_CAP_2026)}원</strong>, <strong>하한액은 ${won(UI_DAILY_FLOOR_2026)}원</strong>입니다. 본인 평균임금일액의 60%로 계산하되 이 상·하한 사이로 정해집니다. 상한은 6년 만에 올랐고, 하한은 최저임금(시급 × 8시간 × 80%)에 연동됩니다. 두 값의 폭이 ${won(UI_DAILY_CAP_2026 - UI_DAILY_FLOOR_2026)}원으로 좁아, 실제로는 대부분 상한 또는 하한 부근에서 결정됩니다.`,
  },
  {
    q: '실업급여는 한 달에 얼마 받나요?',
    a: `구직급여는 1일액 기준이라 한 달(30일)이면 1일액 × 30입니다. 하한액(${won(UI_DAILY_FLOOR_2026)}원)이면 약 <strong>${won(UI_DAILY_FLOOR_2026 * 30)}원</strong>, 상한액(${won(UI_DAILY_CAP_2026)}원)이면 약 <strong>${won(UI_DAILY_CAP_2026 * 30)}원</strong>입니다. 다만 매달 정확히 30일치가 지급되는 게 아니라 실업인정일 사이의 일수만큼 지급되므로, 위 금액은 참고용 월 환산치입니다.`,
  },
  {
    q: '자발적으로 퇴사해도 실업급여를 받을 수 있나요?',
    a: '원칙적으로 자발적 퇴사는 구직급여 대상이 아니지만, <strong>정당한 사유의 자발적 퇴사</strong>(예: 임금 체불, 통근 곤란, 질병, 사업장 이전 등 법령이 정한 사유)는 예외적으로 인정될 수 있습니다. 이 계산기는 <strong>금액만 추정</strong>하며 수급자격을 판정하지 않습니다. 자발/비자발 여부와 정당한 사유 해당 여부는 관할 고용센터가 심사합니다.',
  },
  {
    q: '고용보험에 180일 가입하면 실업급여를 받나요?',
    a: '수급 요건 중 하나가 <strong>이직 전 18개월(피보험 단위기간) 중 180일 이상</strong> 근무입니다. 다만 180일은 단순 재직일이 아니라 보수 지급의 기초가 된 날(유급일)을 합산한 일수라, 실제로는 약 7~8개월 이상 근무해야 채워지는 경우가 많습니다. 그리고 180일을 채워도 이직 사유가 비자발(또는 정당한 자발)이어야 하고, 근로 의사·능력이 있어야 합니다. 일수 충족만으로 자동 지급되지는 않습니다.',
  },
  {
    q: '소정급여일수(며칠 받는지)는 어떻게 정해지나요?',
    a: `이직 당시 <strong>만 나이</strong>와 <strong>고용보험 총 가입기간</strong> 두 가지로 정해집니다. 50세 미만은 가입기간에 따라 ${BENEFIT_DAYS_2019.under50.lt1}~${BENEFIT_DAYS_2019.under50.y10plus}일, 50세 이상·장애인은 ${BENEFIT_DAYS_2019['50plus'].lt1}~${BENEFIT_DAYS_2019['50plus'].y10plus}일입니다. 예를 들어 50세 미만이고 가입기간 1~3년이면 ${BENEFIT_DAYS_2019.under50.y1to3}일, 50세 이상이고 10년 이상이면 ${BENEFIT_DAYS_2019['50plus'].y10plus}일입니다.`,
  },
  {
    q: '실업급여 평균임금은 어떻게 계산하나요?',
    a: `퇴직 직전 3개월간 받은 임금 총액을 그 기간의 <strong>총 달력일수(보통 89~92일)</strong>로 나눈 1일 평균임금이 기준입니다. 이 평균임금일액의 60%가 구직급여 1일액이 됩니다. 단 평균임금일액 자체에도 상한(2026년 ${won(UI_WAGE_DAILY_CAP_2026)}원)이 있어, 고소득자는 임금일액이 상한으로 잘린 뒤 60%가 적용됩니다.`,
  },
  {
    q: '신청 기간이 지나면(이직 후 12개월) 어떻게 되나요?',
    a: '구직급여는 <strong>이직일 다음 날부터 12개월 이내</strong>에만 받을 수 있습니다. 이 12개월을 넘기면 소정급여일수가 남아 있어도 더 이상 지급되지 않습니다. 예를 들어 소정급여일수가 150일이어도 신청·수급이 늦어 12개월이 지나면 남은 일수는 소멸합니다. 그래서 퇴사 직후 워크넷 구직등록과 수급자격 신청을 서두르는 것이 중요합니다.',
  },
  {
    q: '월급 300만원이면 실업급여가 얼마인가요?',
    a: `세전 월급 300만원이면 평균임금일액이 약 10만원(300만 × 3 ÷ 90일)이고, 그 60%는 6만원입니다. 그런데 이 값이 2026년 하한액 ${won(UI_DAILY_FLOOR_2026)}원보다 낮아 <strong>하한액 ${won(UI_DAILY_FLOOR_2026)}원</strong>이 적용됩니다. 만 35세·가입기간 1~3년이면 소정급여일수 ${BENEFIT_DAYS_2019.under50.y1to3}일, 총 예상 수급액은 약 ${won(UI_DAILY_FLOOR_2026 * BENEFIT_DAYS_2019.under50.y1to3)}원입니다.`,
  },
]

export default function UnemploymentBenefitPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💵 실업급여(구직급여) 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        퇴직 전 3개월 급여와 이직 당시 나이·고용보험 가입기간으로 2026년 구직급여가 <strong style={{ color: 'var(--text)' }}>하루 얼마, 며칠, 총 얼마</strong>인지 계산합니다. 2026년 상한 {won(UI_DAILY_CAP_2026)}원·하한 {won(UI_DAILY_FLOOR_2026)}원을 반영합니다.
      </p>

      <UpdatedMeta
        date="2026년 1월"
        basis={`2026년 구직급여 상한 ${won(UI_DAILY_CAP_2026)}원·하한 ${won(UI_DAILY_FLOOR_2026)}원 기준`}
        sources={[
          { label: '고용노동부(moel.go.kr)', href: 'https://www.moel.go.kr/' },
          { label: '고용보험(ei.go.kr)', href: 'https://www.ei.go.kr/' },
        ]}
      />

      <UnemploymentClient />

      {/* 본문 광고 — 도구 결과 직후 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 실업급여란·요건 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            실업급여(구직급여)란? 수급 요건
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '12px' }}>
            실업급여 중 구직급여는 고용보험 가입 근로자가 비자발적으로 일자리를 잃고 재취업을 준비하는 동안 받는 급여입니다. 흔히 말하는 &lsquo;실업급여&rsquo;가 이 구직급여입니다. 핵심 요건은 네 가지입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { t: '피보험 단위기간', v: '180일 이상', d: '이직 전 18개월 중 보수의 기초가 된 날 합산 180일 이상.' },
              { t: '이직 사유', v: '비자발 원칙', d: '권고사직·계약만료 등. 정당한 사유의 자발적 퇴사는 예외 인정.' },
              { t: '근로 의사·능력', v: '있어야 함', d: '재취업할 의사와 능력이 있고 적극적으로 구직활동을 해야.' },
              { t: '신청 시기', v: '12개월 이내', d: '이직일 다음 날부터 12개월 안에 수급을 마쳐야 함.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{c.t}</p>
                <p style={{ fontSize: '14px', color: 'var(--accent-ink)', fontWeight: 800, marginBottom: '4px' }}>{c.v}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            이 계산기는 위 요건의 충족 여부, 즉 <strong style={{ color: 'var(--text)' }}>수급자격을 판정하지 않습니다.</strong> 자격이 인정된다는 가정 아래 금액(1일액·소정급여일수·총수급액)만 추정합니다. 자격 판정은 관할 고용센터가 합니다.
          </p>
        </div>

        {/* ── 2. 1일 구직급여액 계산법 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            1일 구직급여액 — 평균임금의 60%와 2026 상·하한
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '12px' }}>
            1일 구직급여액은 <strong style={{ color: 'var(--text)' }}>평균임금일액 × 60%</strong>로 계산하되, 2026년 상한 {won(UI_DAILY_CAP_2026)}원과 하한 {won(UI_DAILY_FLOOR_2026)}원 사이로 정해집니다. 60%로 계산한 값이 하한보다 낮으면 하한액을, 상한보다 높으면 상한액을 받습니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>
            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.9 }}>
              평균임금일액 → <strong>×0.60</strong> → 상·하한 적용 → 1일 구직급여액
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '8px' }}>
              예: 평균임금일액 10만원 → ×0.6 = 6만원 → 하한 {won(UI_DAILY_FLOOR_2026)}원보다 낮아 <strong style={{ color: 'var(--accent-ink)' }}>{won(UI_DAILY_FLOOR_2026)}원</strong> 지급.
            </p>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            2026년은 상한과 하한의 폭이 <strong style={{ color: 'var(--text)' }}>{won(UI_DAILY_CAP_2026 - UI_DAILY_FLOOR_2026)}원에 불과</strong>합니다. 하한은 최저임금(시급 × 8시간 × 80%)에 연동돼 매년 오르는데 상한은 오랫동안 묶여 있어 두 값이 가까워졌습니다. 그래서 평균임금이 어지간히 높지 않으면 대부분 하한액 부근에서 결정됩니다.
          </p>
        </div>

        {/* ── 3. 소정급여일수 전체 표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            소정급여일수 — 내 나이·가입기간이면 며칠 받나
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            며칠 동안 받는지는 이직 당시 <strong style={{ color: 'var(--text)' }}>만 나이</strong>와 <strong style={{ color: 'var(--text)' }}>고용보험 총 가입기간</strong>으로 정해집니다(2019.10. 이후 이직자 기준). 장애인은 나이와 무관하게 50세 이상 표가 적용됩니다.
          </p>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>연령 구분</th>
                  {COVERAGE_BRACKETS.map((b) => (
                    <th scope="col" key={b.id} style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{BRACKET_SHORT[b.id]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AGE_GROUPS.map((ag, i) => (
                  <tr key={ag} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--text)', fontWeight: 600 }}>{AGE_GROUP_LABEL[ag]}</th>
                    {COVERAGE_BRACKETS.map((b) => (
                      <td key={b.id} style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--accent-ink)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>
                        {BENEFIT_DAYS_2019[ag][b.id]}일
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            가입기간이 길수록, 50세 이상·장애인일수록 일수가 늘어 최대 {BENEFIT_DAYS_2019['50plus'].y10plus}일까지 받습니다. 위 도구에 나이·가입기간을 넣으면 해당 칸이 강조 표시됩니다.
          </p>
        </div>

        {/* ── 4. 평균임금·임금일액 상한 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            평균임금 산정과 임금일액 상한 {won(UI_WAGE_DAILY_CAP_2026)}원
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '12px' }}>
            평균임금일액은 <strong style={{ color: 'var(--text)' }}>퇴직 직전 3개월 임금 총액 ÷ 그 기간 총 달력일수</strong>입니다. 3개월이 달력상 며칠인지에 따라 분모가 89~92일로 달라지므로, 위 도구에 퇴사일을 입력하면 직전 3개월 총일수를 자동 산정합니다(미입력 시 90일 가정).
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '12px' }}>
            평균임금일액 자체에도 상한이 있습니다. 2026년 임금일액 상한은 <strong style={{ color: 'var(--text)' }}>{won(UI_WAGE_DAILY_CAP_2026)}원</strong>으로, 고소득자는 임금일액이 이 값으로 잘린 뒤 60%가 적용됩니다. 다만 {won(UI_WAGE_DAILY_CAP_2026)}원의 60%는 {won(Math.round(UI_WAGE_DAILY_CAP_2026 * 0.6))}원이라, 결국 1일액 상한 {won(UI_DAILY_CAP_2026)}원으로 다시 한 번 제한됩니다.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
            간편 모드는 월급 1개로 추정(월급 × 3 ÷ 총일수)하고, 상세 모드는 직전 3개월 급여를 각각 입력해 합산합니다. 상여·연차수당 등 포함 범위는 실제 정산과 다를 수 있으니, 정확한 금액은 고용센터·고용보험 모의계산으로 확인하세요.
          </p>
        </div>

        {/* ── 5. 수급기간·반복수급 주의 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            수급기간 12개월 제한과 반복수급 주의
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '12px' }}>
            구직급여는 <strong style={{ color: 'var(--text)' }}>이직일 다음 날부터 12개월(수급기간) 이내</strong>에만 받을 수 있습니다. 소정급여일수가 며칠 남았든 이 12개월을 넘기면 지급이 종료됩니다. 예컨대 소정급여일수가 150일이어도 신청이 늦거나 중간에 길게 비우면 남은 일수가 소멸할 수 있습니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '12px' }}>
            또한 짧은 기간에 실업급여를 반복해 받는 <strong style={{ color: 'var(--text)' }}>반복수급</strong>의 경우 지급액이 단계적으로 감액되는 제도가 있습니다. 적용 기준·감액률은 제도 개정에 따라 달라질 수 있어, 본 계산기에는 반영하지 않습니다. 해당 가능성이 있으면 고용센터에 별도로 확인하세요.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
            수급 중에는 정해진 실업인정일마다 구직활동을 신고해야 하며, 신고를 빠뜨리면 해당 기간 급여가 지급되지 않을 수 있습니다.
          </p>
        </div>

        {/* ── 6. 신청 절차·서류 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            신청 절차와 필요 서류
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            퇴사 후 다음 순서로 진행합니다. 자격 신청 교육과 구직등록을 마쳐야 수급자격 인정 신청이 가능합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { n: '1', t: '이직확인서 처리 확인', d: '회사가 고용보험에 이직확인서·피보험자격 상실 신고를 제출했는지 확인.' },
              { n: '2', t: '워크넷 구직등록', d: '워크넷(work.go.kr)에서 구직신청을 등록.' },
              { n: '3', t: '수급자격 신청교육', d: '고용보험 누리집 온라인 또는 고용센터에서 교육 수강.' },
              { n: '4', t: '수급자격 인정 신청', d: '거주지 관할 고용센터 방문해 수급자격 인정 신청.' },
              { n: '5', t: '실업인정·급여 수급', d: '정해진 실업인정일마다 구직활동 신고 → 급여 지급.' },
            ].map((c) => (
              <div key={c.n} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent-ink)', fontWeight: 800, marginBottom: '4px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>STEP {c.n}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{c.t}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            상세 절차·서식은 고용보험(ei.go.kr)과 워크넷(work.go.kr)에서 확인하고, 절차가 헷갈리면 고용센터(국번없이 1350)에 문의하세요.
          </p>
        </div>

        {/* ── 면책 (하단 단일 배치) ── */}
        <Disclaimer
          variant="finance"
          sources={[
            { label: '고용노동부(moel.go.kr)', href: 'https://www.moel.go.kr/' },
            { label: '고용보험(ei.go.kr)', href: 'https://www.ei.go.kr/' },
          ]}
        >
          본 계산기는 2026년 기준 추정·참고용입니다. 자발적 퇴사 여부 등 <strong>수급자격 판정과 실제 지급액은 고용센터의 최종 심사로 결정</strong>되며, 본 도구는 수급 가능 여부를 판정하지 않습니다. 정확한 금액은 고용보험(ei.go.kr) 모의계산 또는 관할 고용센터(국번없이 1350)에 확인하세요.
        </Disclaimer>

        {/* ── FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/severance', icon: '💼', name: '퇴직금 계산기', desc: '입사·퇴사일과 3개월 급여로 퇴직금·퇴직소득세·실수령 자동' },
              { href: '/tools/finance/salary', icon: '💰', name: '연봉 실수령액 계산기', desc: '연봉에서 4대보험·소득세 빼고 월 실수령액' },
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
