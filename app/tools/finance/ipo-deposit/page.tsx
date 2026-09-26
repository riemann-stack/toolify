import Link from 'next/link'
import IpoDepositClient from './IpoDepositClient'
import {
  calcDepositFromTarget, calcSharesFromDeposit, applyFiveSixRule, recommendedUnit, SUBSCRIPTION_UNITS,
} from './ipoUtils'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import UpdatedMeta from '@/components/UpdatedMeta'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/finance/ipo-deposit',
  title: '공모주 증거금 계산기 — 비례 OO주 받으려면 얼마? 균등·청약단위·5사6입 자동',
  description: '증거금 ↔ 예상 주수 양방향 + 5사6입·청약 한도 자동. 비례·균등 시나리오 표와 청약일 D-day 메모로 청약 준비 완료.',
  keywords: ['공모주 증거금 계산기', '비례경쟁률 계산', '공모주 1주 받으려면', '청약 증거금 역산', '5사6입', '균등배정 추첨', '청약단위', '공모주 환불금', '청약 한도', '한국 공모주', 'IPO 증거금'],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}
const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const numCell: React.CSSProperties = { ...cell, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }

/* ── 본문 표·예시 — 계산기와 같은 유틸(ipoUtils)로 빌드 시점 계산 ──
   계산기 기본값: 공모가 20,000원 · 증거금률 50% · 청약단위 자동 · 청약 한도 5,000주 · 5사6입 표준 */
const PRICE = 20_000
const RATIO = 0.5
const LIMIT = 5_000
const won = (v: number) => {
  const r = Math.round(v)
  if (r >= 100_000_000) {
    const eok = Math.floor(r / 100_000_000)
    const man = Math.round((r % 100_000_000) / 10_000)
    return man === 0 ? `${eok}억원` : `${eok}억 ${man.toLocaleString('ko-KR')}만원`
  }
  if (r >= 10_000 && r % 10_000 === 0) return `${(r / 10_000).toLocaleString('ko-KR')}만원`
  return `${r.toLocaleString('ko-KR')}원`
}
/** 계산기 '비례 → 증거금' 탭과 같은 단위 자동 선택(한도가 더 작으면 한도 기준) */
function forTarget(target: number, competition: number, even = 0) {
  const theoretical = target * competition
  const unit = recommendedUnit(theoretical > LIMIT ? LIMIT : theoretical)
  return calcDepositFromTarget(target, { publicPrice: PRICE, competition, depositRatio: RATIO, unit, limit: LIMIT, rule: 'standard', evenExpected: even })
}

/* 경쟁률 × 목표 주수 → 필요 증거금 표 */
const MATRIX_COMPS = [150, 350, 730, 1_240, 2_100]
const MATRIX_TARGETS = [1, 3, 5, 10]
const MATRIX = MATRIX_COMPS.map((c) => ({ c, cells: MATRIX_TARGETS.map((t) => forTarget(t, c)) }))

/* 대표 예시 — 계산기 첫 화면(500:1 · 비례 1주 · 균등 1주 가정) */
const EX1 = forTarget(1, 500, 1)
/* 단위 올림 예시 — 730:1 · 1주 */
const EX730 = forTarget(1, 730)
/* 단위 경계 예시 — 350:1 · 3주 */
const EX350 = forTarget(3, 350)
/* 한도 예시 — 500:1 · 20주 목표 */
const EXLIMIT = forTarget(20, 500)
/* 저경쟁률 추가 납입 예시 — 증거금 100만원 · 1.5:1 */
const EXLOW = calcSharesFromDeposit(1_000_000, { publicPrice: PRICE, competition: 1.5, depositRatio: RATIO, unit: recommendedUnit(100), rule: 'standard', evenExpected: 0 })

/* 5사6입 경계 — 청약 1,000주를 넣었을 때 경쟁률별 비례 배정 */
const FIVE_SIX_SUB = 1_000
const FIVE_SIX_COMPS = [500, 600, 625, 650, 700, 1_000, 1_500, 1_700]
const FIVE_SIX_ROWS = FIVE_SIX_COMPS.map((c) => ({ c, raw: FIVE_SIX_SUB / c, alloc: applyFiveSixRule(FIVE_SIX_SUB / c) }))

/* 자금이 묶이는 동안의 이자 — 5,000만원 · 연 3% · 3일 (세전 단순 계산) */
const OPP_COST = 50_000_000 * 0.03 * 3 / 365

const FAQ_LD = [
  {
    q: '비례경쟁률 500:1이면 1주 받으려면 얼마 넣어야 하나요?',
    a: `공식은 <strong>필요 증거금 = 목표 주수 × 경쟁률 × 공모가 × 증거금률</strong>입니다. 공모가 2만원·증거금률 50%라면 1주 × 500 × 20,000원 × 50% = <strong>${won(EX1.depositRequired)}</strong>입니다. 다만 청약은 단위(10주·50주·100주…)로만 넣을 수 있어 계산값이 단위에 맞지 않으면 올려야 합니다. 예를 들어 경쟁률 730:1이면 이론상 730주지만 100주 단위로 올려 ${EX730.actualSubscribe.toLocaleString('ko-KR')}주, 증거금 ${won(EX730.depositRequired)}이 필요합니다. 계산기는 단위 올림을 자동으로 적용합니다.`,
  },
  {
    q: '증거금률이 50%인지 100%인지 어떻게 아나요?',
    a: '종목의 증권신고서(투자설명서) 청약 안내와 증권사 청약 화면에 적혀 있습니다. 일반 청약자는 대부분 <strong>50%</strong>지만 종목·증권사에 따라 <strong>100%</strong>인 경우도 있습니다. 증거금률이 100%면 같은 주수를 청약하는 데 두 배의 돈이 필요하므로, 계산기에서 50/100을 바꿔 가며 확인하세요.',
  },
  {
    q: '5사6입이 뭔가요? 0.5주는 어떻게 되나요?',
    a: '소수 첫째 자리가 <strong>5 이하면 버리고 6 이상이면 올리는</strong> 규칙입니다. 반올림(4사5입)과 달리 0.5는 버림 처리되는 점이 핵심이며, 비례 배정 = 청약 주수 ÷ 경쟁률 결과에 적용합니다. 예: 0.4주 → 0주, 0.5주 → 0주, 0.6주 → 1주, 1.5주 → 1주, 1.6주 → 2주. 일부 종목은 계산 결과 0주인 청약자 중 추첨으로 1주를 배정하기도 해 계산기에 &lsquo;1주 보장&rsquo; 옵션을 두었습니다. 정확한 배정 방식은 증권신고서에서 확인하세요.',
  },
  {
    q: '균등배정으로 무조건 1주 받을 수 있나요?',
    a: '아니요. 균등배정 물량보다 청약자가 많으면 <strong>추첨</strong>이라 0주가 될 수 있고, 인기 종목일수록 그럴 가능성이 큽니다. 계산기의 &lsquo;균등 기대&rsquo;는 사용자가 정하는 가정값입니다 — 0주는 추첨에서 떨어진 경우(보수적), 1주는 당첨된 경우(낙관적). 실제 결과는 청약 후 증권사에서 확인하세요.',
  },
  {
    q: '1억을 넣어도 한도 때문에 다 못 쓰는 경우가 있다는데?',
    a: `맞습니다. 증권사마다 1인당 청약 한도가 있어 한도를 넘는 청약은 받지 않습니다. 공모가 2만원·증거금률 50%·한도 5,000주라면 증거금은 최대 ${won(LIMIT * PRICE * RATIO)}까지만 의미가 있습니다. 경쟁률 500:1에서 비례 20주를 목표로 하면 이론상 1만 주가 필요하지만 한도에 걸려 ${EXLIMIT.actualSubscribe.toLocaleString('ko-KR')}주만 청약되고 비례 배정은 ${EXLIMIT.proportionalAlloc}주에 그칩니다. 계산기에 한도를 넣으면 이런 경우를 표시해 줍니다.`,
  },
  {
    q: '가족 명의로 각각 청약해도 되나요?',
    a: '중복청약 금지는 <strong>같은 사람이 한 종목에 여러 증권사로</strong> 청약하는 것을 막는 제도라(2021년 6월부터 시행), 가족이 각자 <strong>본인 명의 계좌로</strong> 청약하는 것은 중복청약이 아닙니다. 균등배정이 청약자 단위라 가족 계좌를 함께 쓰는 경우가 많습니다. 다만 자녀 계좌에 넣어 준 자금과 그 수익은 증여로 볼 수 있어 증여재산공제 한도(미성년 자녀는 10년간 2,000만원)를 염두에 둬야 하고, 규제를 피하려고 남의 명의를 빌려 본인 돈으로 청약하는 것은 금융실명법이 금지하는 탈법 목적 차명거래에 해당할 수 있습니다.',
  },
  {
    q: '청약하면 자금이 며칠 묶이나요?',
    a: `증거금은 청약한 날부터 <strong>환불일</strong>까지 묶입니다. 환불일은 보통 청약 마지막 날부터 2영업일 뒤라, 청약 첫날에 넣으면 약 3영업일, 마지막 날에 넣으면 약 2영업일입니다. 그동안 받지 못하는 이자를 금액으로 따져 본 예시는 본문 &lsquo;청약 수수료와 실제 손익&rsquo;에 있습니다. 배정받은 주식은 상장 후 매도할 때까지 계좌에 남습니다. 계산기의 메모 탭에 청약·환불·상장일을 넣으면 D-day를 보여 줍니다.`,
  },
  {
    q: '청약 수수료는 얼마인가요?',
    a: '증권사·고객 등급·청약 채널(온라인·영업점)에 따라 다르고, 온라인 청약은 건당 몇천 원 이하인 경우가 많으며 무료인 곳도 있습니다. 비례 1주만 노리는 소액 청약이라면 수수료가 기대 이익을 깎을 수 있으니 본인 증권사의 청약 수수료 안내를 먼저 확인하세요. 계산기는 수수료를 자동으로 빼지 않습니다.',
  },
  {
    q: '경쟁률이 낮으면 돈을 더 내야 하나요?',
    a: `네. 증거금률 50%라면 비례 경쟁률이 2:1보다 낮을 때 배정 금액이 증거금보다 커져 <strong>추가 납입</strong>이 생깁니다. 부족분은 납입일에 청약 계좌에서 빠져나가므로 그만큼 잔고를 남겨 둬야 합니다. 숫자로 풀어 본 예시는 본문 &lsquo;자금이 묶이는 일정과 환불·추가 납입&rsquo;에 있고, 내 조건의 금액은 계산기 결과의 &lsquo;추가 납입&rsquo; 줄에 나옵니다.`,
  },
  {
    q: '계산값과 실제 배정 결과가 다를 수 있는 이유는?',
    a: '① 경쟁률 변동 — 청약 마감 직전까지 크게 바뀜 ② 배정 규칙 차이 — 1주 보장 추첨 등 종목별 방식 ③ 균등배정 추첨 — 0~N주 ④ 청약단위·한도 — 종목·증권사마다 다름 ⑤ 우대 조건 — 증권사 우수고객 한도 등 ⑥ 수수료 — 실제 손익에 영향. 계산기는 일반적인 경우를 가정하므로 마감 직전 경쟁률과 증권사 안내로 다시 확인하세요.',
  },
  {
    q: '공모주 일정과 정보는 어디서 확인하나요?',
    a: '계산기는 종목을 추천하지 않습니다. ① DART 전자공시시스템 — 증권신고서·투자설명서(공모가, 청약일, 배정 방식) ② KIND 한국거래소 — 상장 공시 ③ 본인 증권사 앱 — 청약 한도·단위·수수료 ④ 금융투자협회 — 청약 제도 안내 ⑤ 금융감독원 1332 — 분쟁·민원.',
  },
]

export default function IpoDepositPage() {
  return (
    <ToolPage width={880} slug="/tools/finance/ipo-deposit">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />공모주 증거금 계산기
      </h1>
      <p className="tp-lead">
        증거금 ↔ 예상 주수 양방향 + 5사6입·청약 한도 자동. <strong style={{ color: 'var(--text)' }}>청약일 D-day 메모</strong>.
      </p>

      <UpdatedMeta date="2026년 7월" basis="공모주 청약 제도(균등배정 50% 이상·중복청약 금지·5사6입) 기준" sources={[{"label":"DART 전자공시시스템","href":"https://dart.fss.or.kr"},{"label":"KIND 한국거래소","href":"https://kind.krx.co.kr"},{"label":"금융위원회 (공모주 청약제도)","href":"https://www.fsc.go.kr"},{"label":"금융투자협회","href":"https://www.kofia.or.kr"}]} />

      <IpoDepositClient />

      <GuideDivider />

      {/* 1. 비례·균등 구조 가이드 */}
      <h2 className="g-h2">비례·균등 배정 구조 (균등 50% 이상)</h2>
      <p className="g-p">
        2021년 공모주 청약제도 개편으로 일반 청약자 배정 물량의 <strong>50% 이상</strong>을 균등 방식으로 나누게 됐습니다. 균등 물량은 최소 단위 이상 청약한 사람에게 인원수대로 나누고, 나머지 비례 물량은 넣은 증거금(청약 주수)에 비례해 나눕니다. 이 계산기는 비례 배정을 계산하고, 균등은 사용자가 정한 기대 주수로 더해 보여 줍니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr>
                <th scope="col" style={headCell}>구분</th>
                <th scope="col" style={headCell}>균등배정</th>
                <th scope="col" style={headCell}>비례배정</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={cell}><strong>대상</strong></td><td style={cell}>최소 청약 단위 충족자 모두</td><td style={cell}>청약 주수(증거금) 비율</td></tr>
              <tr><td style={cell}><strong>배정 방식</strong></td><td style={cell}>인원수로 균등 분배 → 부족 시 추첨</td><td style={cell}>청약 주수 ÷ 경쟁률 (5사6입)</td></tr>
              <tr><td style={cell}><strong>큰 증거금 효과</strong></td><td style={cell}>없음 (최소만 넣어도 같음)</td><td style={cell}>있음 (많이 넣을수록 많이 받음)</td></tr>
              <tr><td style={cell}><strong>위험</strong></td><td style={cell}>인기 종목은 추첨에서 떨어져 0주</td><td style={cell}>경쟁률 급변 시 예상치 빗나감</td></tr>
              <tr><td style={cell}><strong>전략</strong></td><td style={cell}>최소 단위만 청약해도 참여 — 한 종목은 한 증권사만</td><td style={cell}>한도 안에서 최대 + 마감 직전 경쟁률 확인</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. 필요 증거금 표 */}
      <h2 className="g-h2">비례 N주를 받으려면 — 경쟁률별 필요 증거금</h2>
      <p className="g-p">
        계산 순서는 ① 목표 주수 × 경쟁률 = 이론 청약 주수 → ② 청약단위로 올림(한도가 있으면 한도에서 멈춤) → ③ 청약 주수 × 공모가 × 증거금률 = 필요 증거금 → ④ 청약 주수 ÷ 경쟁률에 5사6입을 적용한 예상 비례 배정입니다. 계산기 첫 화면(공모가 2만원, 경쟁률 500:1, 비례 1주)이면 청약 {EX1.actualSubscribe.toLocaleString('ko-KR')}주, 증거금 {won(EX1.depositRequired)}이고, 균등 1주까지 받는다고 가정하면 배정 2주 대금 {won(EX1.finalPayment)}을 뺀 {won(EX1.refundEstimate)}이 환불됩니다.
      </p>
      <p className="g-p">
        아래 표는 공모가 2만원·증거금률 50%·청약 한도 5,000주를 가정해 계산기와 같은 함수로 뽑은 값입니다. 단위 올림 때문에 경쟁률이 어중간하면 필요 증거금이 계단식으로 뛰고, 올린 만큼 목표보다 더 받기도 합니다. 예를 들어 350:1에서 3주를 노리면 이론상 1,050주지만 500주 단위로 올려 {EX350.actualSubscribe.toLocaleString('ko-KR')}주를 넣게 되고, 배정은 {EX350.proportionalAlloc}주가 됩니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>비례 경쟁률</th>
              {MATRIX_TARGETS.map((t) => <th scope="col" key={t} style={{ ...headCell, textAlign: 'right' }}>목표 {t}주</th>)}
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((r) => (
              <tr key={r.c}>
                <th scope="row" style={{ ...cell, fontWeight: 700, textAlign: 'left' }}>{r.c.toLocaleString('ko-KR')}:1</th>
                {r.cells.map((x, i) => (
                  <td key={i} style={numCell}>
                    <strong>{won(x.depositRequired)}</strong>
                    <span style={{ display: 'block', fontSize: 12, color: x.hitLimit ? 'var(--danger)' : 'var(--muted)' }}>
                      {x.actualSubscribe.toLocaleString('ko-KR')}주 → {x.proportionalAlloc}주{x.hitLimit ? ' · 한도' : ''}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">셀 윗줄은 필요 증거금, 아랫줄은 청약 주수 → 예상 비례 배정. &lsquo;한도&rsquo;는 5,000주 한도에 걸려 목표 주수를 채우지 못하는 경우입니다. 공모가가 다르면 증거금은 공모가에 비례해 바뀝니다.</p>

      {/* 3. 청약단위 표 */}
      <h2 className="g-h2">청약단위 — 계산기가 쓰는 구간</h2>
      <p className="g-p">
        청약단위는 종목과 증권사가 정하며 증권사 청약 화면에 표시됩니다. 계산기는 아래처럼 청약 주수가 많을수록 단위가 커지는 흔한 형태를 기본값으로 쓰고, 실제 단위가 다르면 &lsquo;자동 추천&rsquo;을 끄고 직접 고를 수 있습니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
            <thead>
              <tr>
                <th scope="col" style={headCell}>청약 주수 구간</th>
                <th scope="col" style={headCell}>단위</th>
                <th scope="col" style={headCell}>청약 가능 예</th>
              </tr>
            </thead>
            <tbody>
              {SUBSCRIPTION_UNITS.map((r) => (
                <tr key={r.min}>
                  <td style={cell}>{r.max >= 999_999 ? `${r.min.toLocaleString('ko-KR')}주 이상` : `${r.min.toLocaleString('ko-KR')} ~ ${r.max.toLocaleString('ko-KR')}주 미만`}</td>
                  <td style={{ ...cell, color: 'var(--accent-ink)', fontWeight: 700 }}>{r.unit.toLocaleString('ko-KR')}주</td>
                  <td style={cell}>{[0, 1, 2].map((k) => (r.min + r.unit * k).toLocaleString('ko-KR')).join(' · ')} …</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 5사6입 룰 */}
      <h2 className="g-h2">5사6입 — 비례 배정 소수점 처리</h2>
      <p className="g-p">
        비례 배정 = <strong>청약 주수 ÷ 경쟁률</strong>은 정수가 아닐 때가 많습니다. 5사6입은 소수 첫째 자리가 5 이하면 버리고 6 이상이면 올리는 규칙으로, 반올림과 달리 0.5는 버립니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
            <thead>
              <tr>
                <th scope="col" style={headCell}>이론 배정</th>
                <th scope="col" style={headCell}>5사6입 결과</th>
                <th scope="col" style={headCell}>설명</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['0.4주', 0.4, '4는 5 이하 → 버림 (1주 보장 추첨은 별도)'],
                ['0.5주', 0.5, '5는 5 이하 → 버림 (반올림과 다른 점)'],
                ['0.6주', 0.6, '6은 6 이상 → 올림'],
                ['1.4주', 1.4, '4는 5 이하 → 버림'],
                ['1.5주', 1.5, '5는 5 이하 → 버림'],
                ['1.6주', 1.6, '6은 6 이상 → 올림'],
              ].map(([label, raw, note]) => {
                const n = applyFiveSixRule(raw as number)
                return (
                  <tr key={label as string}>
                    <td style={cell}>{label}</td>
                    <td style={{ ...cell, color: n === 0 ? 'var(--danger)' : 'var(--accent-ink)', fontWeight: 700 }}>{n}주</td>
                    <td style={cell}>{note}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        이 규칙 때문에 마감 직전 경쟁률이 조금만 올라도 배정이 한 주씩 줄어드는 경계가 생깁니다. {FIVE_SIX_SUB.toLocaleString('ko-KR')}주를 청약했다면 경쟁률별 비례 배정은{' '}
        {FIVE_SIX_ROWS.map((r, i) => (
          <span key={r.c}>{r.c.toLocaleString('ko-KR')}:1 → {r.raw.toFixed(2)}주 → <strong>{r.alloc}주</strong>{i < FIVE_SIX_ROWS.length - 1 ? ', ' : ''}</span>
        ))}
        입니다. 625:1까지는 2주지만 650:1이면 1.54주라 1주로 떨어지고, 1,700:1에서는 0.59주라 0주가 됩니다. 목표 주수를 확실히 받고 싶다면 예상 경쟁률보다 여유를 두고 넣어야 하는 이유입니다.
      </p>
      <Callout tone="note">
        일부 종목은 비례 계산이 0주인 청약자 중 추첨으로 1주를 배정합니다. 계산기의 &lsquo;1주 보장&rsquo; 옵션은 이 경우를 가정한 것이며, 실제 방식은 증권신고서의 배정 기준을 확인하세요.
      </Callout>

      {/* 5. 자금 일정 */}
      <h2 className="g-h2">자금이 묶이는 일정과 환불·추가 납입</h2>
      <p className="g-p">
        날짜는 종목마다 증권신고서에 정해지며, 일반적인 흐름은 아래와 같습니다. 환불액은 &lsquo;증거금의 절반&rsquo;이 아니라 <strong>증거금 − 배정 주식 대금</strong>이라, 경쟁률이 높으면 넣은 돈 대부분이 돌아옵니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr>
                <th scope="col" style={headCell}>단계</th>
                <th scope="col" style={headCell}>시점 (일반)</th>
                <th scope="col" style={headCell}>설명</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={cell}><strong>① 청약</strong></td><td style={{ ...cell, color: 'var(--accent-ink)' }}>보통 2영업일</td><td style={cell}>증거금(청약 금액 × 증거금률) 출금</td></tr>
              <tr><td style={cell}><strong>② 배정 확인</strong></td><td style={cell}>청약 마감 후 ~ 환불일</td><td style={cell}>증권사 앱·문자로 비례·균등 배정 결과 안내</td></tr>
              <tr><td style={cell}><strong>③ 환불·납입</strong></td><td style={{ ...cell, color: 'var(--success)' }}>보통 청약 마지막 날부터 2영업일 뒤</td><td style={cell}>증거금 − 배정 대금 환불. 배정 대금이 증거금보다 크면(저경쟁률) 차액 추가 납입</td></tr>
              <tr><td style={cell}><strong>④ 상장</strong></td><td style={{ ...cell, color: 'var(--accent-ink)' }}>증권신고서의 상장 예정일</td><td style={cell}>배정 주식 거래 시작</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        추가 납입은 증거금률 50%일 때 비례 경쟁률이 2:1보다 낮으면 생깁니다. 공모가 2만원에 {EXLOW.actualSubscribe}주(증거금 {won(EXLOW.usedDeposit)})를 청약했는데 경쟁률이 1.5:1이면 {(EXLOW.actualSubscribe / 1.5).toFixed(1)}주를 5사6입한 {EXLOW.proportionalAlloc}주가 배정돼 대금 {won(EXLOW.finalPayment)} 중 {won(EXLOW.additionalPayment)}을 더 내야 합니다. 납입일에 계좌 잔고가 모자라지 않게 준비하세요. 청약을 마지막 날에 하면 자금이 묶이는 기간이 하루 줄고 경쟁률 흐름도 보고 넣을 수 있지만, 마감 시각 직전에는 접속이 몰리니 여유를 두는 편이 안전합니다.
      </p>

      {/* 6. 청약 한도·중복청약 */}
      <h2 className="g-h2">청약 한도와 중복청약 금지</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--warning)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '8px' }}>청약 한도</p>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 18, margin: 0 }}>
            <li>증권사가 배정 물량에 맞춰 1인당 한도를 정함</li>
            <li>일반·우대 고객 한도가 다른 경우가 많음</li>
            <li>한도를 넘는 청약은 받지 않음 — 큰 증거금도 한도까지만 효과</li>
            <li>계산기에 한도를 넣으면 초과 여부를 표시</li>
          </ul>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--danger)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '8px' }}>중복청약 금지 (2021년 6월부터)</p>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 18, margin: 0 }}>
            <li>한 사람이 한 종목에 청약할 수 있는 증권사는 한 곳</li>
            <li>여러 증권사에 넣으면 먼저 접수된 청약만 인정</li>
            <li>가족이 각자 본인 명의로 청약하는 것은 별개 청약</li>
            <li>주관·인수 증권사가 여럿이면 한도·수수료를 비교해 한 곳 선택</li>
          </ul>
        </div>
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        비례 물량을 노린다면 한도가 큰 증권사가, 균등 물량을 노린다면 청약자가 적을 것 같은 증권사가 유리할 수 있습니다. 증권사별 배정 물량은 증권신고서의 인수단 내역에서, 한도는 각 증권사 청약 안내에서 확인합니다.
      </p>

      {/* 7. 청약 수수료 */}
      <h2 className="g-h2">청약 수수료와 실제 손익</h2>
      <p className="g-p">
        청약 수수료는 증권사·고객 등급·청약 채널에 따라 다르고 무료인 곳도 있습니다. 계산기는 수수료를 빼지 않으므로, 비례 1~2주를 노리는 소액 청약이라면 수수료와 증거금이 묶이는 동안의 이자를 함께 따져 보세요. 5,000만원을 연 3% 파킹통장에서 3일 빼 두면 세전 약 {won(Math.round(OPP_COST / 10) * 10)}을 포기하는 셈이라, 상장 후 수익이 이보다 작으면 청약하지 않는 편이 나을 수도 있습니다.
      </p>

      <Faq items={FAQ_LD} />

      {/* 8. 면책 */}
      <Disclaimer
        variant="finance"
        open
        sources={[
          { label: 'DART 증권신고서', href: 'https://dart.fss.or.kr' },
          { label: 'KIND 공시', href: 'https://kind.krx.co.kr' },
        ]}
      >
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li>본 도구는 <strong>일반 계산 가이드</strong>입니다. 비례경쟁률·균등배정·5사6입·청약단위·한도 등 변수가 많아 실제 결과와 차이 가능.</li>
          <li>본 도구는 <strong>특정 종목·증권사 추천 X · 주가 예측 X · 따상/따따상 보장 X · 실시간 청약 정보 X</strong>.</li>
          <li>균등배정은 추첨 — 인기 종목은 0주 가능. 본 도구의 &ldquo;균등 기대&rdquo;는 사용자 가정값.</li>
          <li>청약 자금 대출·레버리지 권유 X. 본인 자금 한도 내 보수적 운용 권장.</li>
          <li>중복청약 금지 위반 시 먼저 접수된 청약 외에는 무효 처리될 수 있음.</li>
          <li>투자 판단 전 필수 확인: DART 증권신고서·KIND 공시(아래 근거 자료 링크)·본인 거래 증권사 청약 안내.</li>
          <li>도움 받기: 금융감독원 1332 / 한국예탁결제원 / 본인 거래 증권사 고객센터.</li>
        </ul>
      </Disclaimer>

      {/* 9. 함께 쓰면 좋은 도구 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/finance/compound" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📈</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>복리 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>배정 후 장기 수익 시뮬</div>
        </Link>
        <Link href="/tools/finance/stock" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📉</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>주식 물타기 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>상장 후 평단 관리</div>
        </Link>
        <Link href="/tools/finance/dividend" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💰</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>월배당 목표 자산</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>배당주 IPO 활용</div>
        </Link>
        <Link href="/tools/date/dday" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📅</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>D-day 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>청약일·상장일 추적</div>
        </Link>
        <Link href="/tools/finance/4-insurance" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏥</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>4대보험 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>금융 소득 영향 참고</div>
        </Link>
        <Link href="/tools/finance/loan" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💳</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>대출이자 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>자금 계획 참고</div>
        </Link>
      </div>
    </ToolPage>
  )
}
