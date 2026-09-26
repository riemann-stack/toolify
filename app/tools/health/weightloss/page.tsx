import Link from 'next/link'
import WeightLossClient from './WeightLossClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import {
  DANGER_THRESHOLDS, EXERCISES, KCAL_PER_KG, PROTEIN_TARGETS, SAFE_SPEEDS,
  calcWeightLossPlan, exerciseTimeFor, splitDietExercise,
} from './weightLossUtils'
import { BMI_CATEGORIES } from '../bmi/bmiUtils'

export const metadata = buildMetadata({
  path: '/tools/health/weightloss',
  title: '체중 감량 기간 계산기 — 안전 감량 속도·BMI·목표일·정체기·탄단지',
  description:
    '목표 체중까지 며칠 — 안전 감량 속도(주당 0.5~1%)로 기간 추정. BMI 자동 체크, 식단·운동 칼로리 분리(METs), 탄단지 자동 계산, 정체기·요요 방지 가이드.',
  keywords: [
    '체중감량계산기', '다이어트기간계산기', '칼로리적자계산기', '감량기간계산',
    '목표체중달성일', '요요방지다이어트', '안전 감량 속도', '체중 변화 그래프',
    '정체기', '유지기', '탄단지', '단백질 목표', '운동 칼로리',
  ],
})

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, fontSize: '12px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', fontSize: '13px', borderBottom: '1px solid var(--border)', verticalAlign: 'top' }
const tdNum: React.CSSProperties = { ...td, textAlign: 'right', whiteSpace: 'nowrap' }
const note: React.CSSProperties = { fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.75 }
const box: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }
const n0 = (n: number) => Math.round(n).toLocaleString('ko-KR')

/* ── 본문 예시 수치: weightLossUtils(도구와 같은 식)로 빌드 시 계산 ──
   예시 인물: 30세 여성 · 165cm · 70kg → 63kg(체중의 10%) · TDEE 2,000kcal · '안정 감량'(0.5%/주) */
const EX_INPUT = { currentWeight: 70, targetWeight: 63, height: 165, gender: 'female' as const, age: 30, tdee: 2000, speedId: 'slow', startDate: '2026-10-01' }
const EX_PLAN = calcWeightLossPlan(EX_INPUT)!
const EX_SPLIT = splitDietExercise(EX_PLAN.dailyDeficit, 0.6, 4)
const FAST_WALK = EXERCISES.find(e => e.id === 'fast-walk')!
const EX_WALK_MIN = exerciseTimeFor(EX_SPLIT.perSessionKcal, FAST_WALK, EX_INPUT.currentWeight).minutes
const EX_END = (() => { const [y, m, d] = EX_PLAN.endDate.split('-').map(Number); return `${y}년 ${m}월 ${d}일` })()
const EX_LOSS = EX_INPUT.currentWeight - EX_INPUT.targetWeight

/* 속도 옵션표 — 70kg 기준, 7kg 감량 */
const SPEED_ROWS = SAFE_SPEEDS.map(s => {
  const weekly = EX_INPUT.currentWeight * s.percentPerWeek / 100
  return { ...s, weekly, deficit: weekly * KCAL_PER_KG / 7, weeks: Math.ceil(EX_LOSS / weekly) }
})
const SEVERITY_LABEL = { safe: '안전', caution: '주의', warning: '경고', danger: '위험' } as const
const SEVERITY_COLOR = { safe: 'var(--success)', caution: 'var(--warning)', warning: 'var(--warning)', danger: 'var(--danger)' } as const

/* 하루 적자별 감량 속도 — 지방 1kg = KCAL_PER_KG, 한 달 = 30일 */
const DEFICIT_ROWS = [300, 500, 700, 1000, 1500].map(d => {
  const weekly = d * 7 / KCAL_PER_KG
  return { d, weekly, month: d * 30 / KCAL_PER_KG, pct60: weekly / 60 * 100, pct90: weekly / 90 * 100 }
})

/* 한국 BMI 기준표 — bmiUtils(KOREA)와 예시 키 165cm의 체중 범위 */
const EX_H2 = (EX_INPUT.height / 100) ** 2
const BMI_ROWS = BMI_CATEGORIES.KOREA.map(c => ({
  ...c,
  range: c.max >= 999 ? `${c.min} 이상` : c.min === 0 ? `${c.max} 미만` : `${c.min} ~ ${(c.max - 0.1).toFixed(1)}`,
  kg: c.max >= 999 ? `${(c.min * EX_H2).toFixed(1)}kg 이상` : c.min === 0 ? `${(c.max * EX_H2).toFixed(1)}kg 미만` : `${(c.min * EX_H2).toFixed(1)} ~ ${(c.max * EX_H2).toFixed(1)}kg 미만`,
}))

/* 단백질표 — PROTEIN_TARGETS × 체중 */
const PROTEIN_WEIGHTS = [50, 60, 70, 80, 90]

/* 한 달 5kg FAQ — 60kg 기준 */
const M5_WEEKLY = 5 / 4
const M5_PCT = M5_WEEKLY / 60 * 100
const M5_DEFICIT = M5_WEEKLY * KCAL_PER_KG / 7
const M5_SAFE_WEEKS = Math.ceil(5 / (60 * 0.005))
const M5_CAUTION_WEEKS = Math.ceil(5 / (60 * 0.007))

const FAQ_LD = [
  {
    q: '지방 1kg 감량에 7,700kcal가 필요한 이유는?',
    a: 'Wishnofsky(1958)는 체지방 1파운드(약 454g)를 줄이는 데 약 3,500kcal의 에너지 적자가 필요하다고 추정했고, 이를 kg로 환산한 값이 약 7,700kcal입니다(3,500 × 2.2046). 순수 지방은 1g에 약 9kcal이지만 지방 조직에는 수분·단백질도 들어 있어 1kg당 에너지가 9,000kcal보다 작습니다. 다만 이 환산은 <strong>체중이 줄어도 소비 칼로리가 그대로라고 가정한 단기 추정</strong>입니다. 실제로는 몸이 가벼워질수록 소비 칼로리도 줄어 감량이 점점 느려지며, 미국 국립보건원(NIDDK) Hall 연구팀의 동적 모델(Body Weight Planner)은 이 점을 반영하면 고정 환산이 장기 감량을 과대 예측한다고 지적합니다.',
  },
  {
    q: '하루 최소 칼로리 섭취량은 얼마인가요?',
    a: '일반적으로 <strong>여성은 하루 1,200kcal, 남성은 1,500kcal</strong> 이하로 섭취하면 근손실, 영양 결핍 등의 부작용이 발생할 수 있습니다. 의사 또는 영양사의 지도 아래 진행하는 것이 안전합니다. 본 도구는 이 한도 미만 시 자동으로 강한 경고를 표시합니다.',
  },
  {
    q: '실제 감량 속도가 계산기와 다를 수 있나요?',
    a: '네, 이 계산기는 이론적인 수치를 제공합니다. 실제 감량 속도는 신진대사율, 근육량, 수면, 스트레스, 호르몬 등 다양한 요인에 영향을 받습니다. 처음 1~2주는 수분 변동(±1~2kg), 후반은 대사 적응으로 속도 둔화. 본 도구의 <strong>그래프</strong>는 초반 수분 변동·후반 둔화를 반영한 현실적 곡선으로 보여줍니다(소요 기간·종료일은 평균 속도 기준 추정치). 또 주당 감량량은 시작 체중 기준으로 고정되므로 중간에 계획을 갱신해야 합니다(본문 &lsquo;고정 환산의 한계&rsquo; 참고).',
  },
  {
    q: '칼로리 적자를 어떻게 만들어야 하나요?',
    a: '칼로리 적자는 두 가지 방법으로 만들 수 있습니다. ① <strong>식이 조절</strong>: 하루 섭취 칼로리를 줄이는 방법. ② <strong>운동</strong>: 활동량을 늘려 소비 칼로리를 높이는 방법. 운동만으로 큰 적자를 만들려면 운동 시간이 지나치게 길어지므로 보통은 식단을 중심으로 하고 운동을 더합니다. 본 도구의 <strong>[식단·운동] 탭</strong>은 기본값 식단 60% + 운동 40%로 적자를 나누고, 운동 몫을 METs 기반 운동 시간으로 바꿔 보여줍니다(비율은 슬라이더로 조절).',
  },
  {
    q: '다이어트 정체기는 왜 오나요?',
    a: '처음 몇 주 감량 후 체중이 한동안 줄지 않는 정체기가 흔히 옵니다. 원인 — ① 체중이 줄어 소비 칼로리 자체가 감소 ② 대사 적응 ③ 무의식적인 활동량 감소 ④ 식욕 호르몬 변화(렙틴↓·그렐린↑) ⑤ 기록되지 않는 섭취 증가. 하루 체중이 아니라 2~3주 평균 추세로 판단하고, 대처 순서는 본문 &lsquo;정체기와 유지기&rsquo; 절을 참고하세요.',
  },
  {
    q: '한 달에 5kg 빼는 게 가능한가요?',
    a: `단기적으로 가능하지만 <strong>권장하지 않습니다.</strong><br><br>한 달 5kg = 주당 약 ${M5_WEEKLY.toFixed(2)}kg. 체중 60kg 기준 주당 ${M5_PCT.toFixed(1)}% 감량(도구 경고 기준 1% 초과), 필요 하루 적자 약 ${n0(M5_DEFICIT)}kcal(도구 경고 기준 1,000kcal 초과)입니다.<br><br><strong>장기 위험</strong> — 근육 손실 비율 증가 / 대사 적응 → 요요 / 영양 부족 / 호르몬 이상(특히 여성) / 정신 건강 영향(강박·폭식).<br><br><strong>대안</strong> — 60kg 기준 5kg이라면 주당 체중의 0.5%(0.3kg)로 약 ${M5_SAFE_WEEKS}주가 도구의 &lsquo;안전&rsquo; 범위이고, 0.7%(0.42kg)로 잡으면 약 ${M5_CAUTION_WEEKS}주(&lsquo;주의&rsquo; 구간)입니다. 체중·TDEE에 따라 달라지니 [목표일 기준] 탭에서 확인하세요.`,
  },
  {
    q: '빠른 감량(주당 체중 1% 이상)이 위험한 이유는?',
    a: '<strong>1. 근육 손실 비율 ↑</strong> — 엘리트 선수를 주당 체중 0.7%와 1.4% 감량 그룹으로 나눈 연구(Garthe 외 2011)에서, 천천히 뺀 그룹은 제지방량이 2.1% 늘었지만 빨리 뺀 그룹은 늘지 않았습니다(−0.2%). 일반인은 근력 운동과 단백질이 부족한 경우가 많아 차이가 더 커질 수 있습니다.<br><br><strong>2. 대사 적응</strong> — 적자가 크고 길수록 체중 감소로 설명되는 것보다 소비 칼로리가 더 줄어드는 현상이 보고됩니다. 같은 칼로리를 먹어도 감량이 멈추는 이유 중 하나입니다.<br><br><strong>3. 영양 부족</strong> — 하루 1,000kcal 이상 적자는 식품만으로 비타민·미네랄을 채우기 어려워 피로·집중력 저하로 이어지기 쉽습니다.<br><br><strong>4. 정신 건강</strong> — 강박·폭식·요요 사이클 / 식이장애 위험↑.<br><br>본 도구의 속도 옵션은 주당 체중의 0.5% 이하를 &lsquo;안전&rsquo;, 0.7%를 &lsquo;주의&rsquo;, 1.0%를 &lsquo;경고&rsquo;, 1.5%를 &lsquo;위험&rsquo; 등급으로 두고, 계획 결과는 주당 1%를 넘으면 경고, 1.5%를 넘으면 위험으로 표시합니다.',
  },
  {
    q: '저체중인데 더 빼고 싶어요.',
    a: '<strong>권장하지 않습니다.</strong><br><br>저체중(BMI 18.5 미만) 위험 — 면역력 저하 / 골밀도 감소 → 골절 위험 / 호르몬 이상(생리 불순·생식 능력↓) / 근손실 → 만성 피로 / 영양 부족 → 빈혈·탈모.<br><br>체중에 대한 강박 가능성 — 거식증(Anorexia Nervosa) / 신체 이형 장애 / 폭식증과 동반 가능.<br><br><strong>도움 받기</strong><br>· 정신건강 위기상담: <strong>1577-0199</strong> (24시간)<br>· 자살예방상담: <strong>109</strong> (24시간)<br>· 가까운 정신건강복지센터 · 섭식장애 진료를 하는 정신건강의학과<br><br>&lsquo;마름&rsquo;이 건강과 매력의 절대값이 아닙니다. 건강한 체형 + 근육 + 정신 건강이 진짜 매력입니다.',
  },
  {
    q: '다이어트 중 무엇을 매일 측정해야 하나요?',
    a: '<strong>매일</strong> — 체중(같은 시간·조건, 변동 ±1~2kg 정상) / 식사 기록(칼로리·매크로) / 운동(시간·종류·강도) / 컨디션(1~10점).<br><br><strong>주간 평균 사용</strong> — 일일 변동 무시 / 월·수·금 평균 또는 7일 평균 권장 / 그래프로 추세 확인.<br><br><strong>월 1회</strong> — 허리둘레(복부지방) / 사진(시각적 변화) / 체성분 검사(InBody, 가능 시) / 컨디션·수면·생리주기 종합 점검.<br><br><strong>주의</strong> — 체중만 보지 말기(근육·수분·생리주기 변동) / 수치 강박 X / 체중 ≠ 건강 ≠ 행복.',
  },
]

export default function WeightLossPage() {
  return (
    <ToolPage width={760} slug="/tools/health/weightloss">
      <h1 className="tp-h1">
        <ToolIconBadge catId="health" />체중 감량 기간 계산기
      </h1>
      <p className="tp-lead">
        목표 체중까지 며칠 — <strong style={{ color: 'var(--text)' }}>안전 감량 속도</strong>로 계산하고, 정체기·요요 방지 가이드까지. 식단·운동 칼로리 자동 분리.
      </p>

      <UpdatedMeta date="2026년 9월" basis="지방 1kg ≈ 7,700kcal(Wishnofsky, 1958) · 주당 체중 0.3~1.5% 감량 속도 옵션 · 운동 칼로리 METs 기준(신체활동 컴펜디엄)" sources={[{ label: 'Wishnofsky(1958) 원 논문 (DOI)', href: 'https://doi.org/10.1093/ajcn/6.5.542' }, { label: 'Compendium of Physical Activities', href: 'https://pacompendium.com/' }, { label: 'CDC — Steps for Losing Weight', href: 'https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html' }, { label: '대한비만학회 — 식사요법', href: 'https://general.kosso.or.kr/html/?pmode=nutritionDiet' }, { label: 'NIDDK — Body Weight Planner(동적 모델)', href: 'https://www.niddk.nih.gov/health-information/professionals/diabetes-discoveries-practice/nih-body-weight-planner' }, { label: 'Garthe 외(2011) — 감량 속도와 체성분', href: 'https://journals.humankinetics.com/view/journals/ijsnem/21/2/article-p97.xml' }, { label: '보건복지부 — 2025 한국인 영양소 섭취기준 개정', href: 'https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027&act=view&list_no=1488441' }]} />

      <WeightLossClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 감량 공식 ── */}
        <section>
          <h2 className="g-h2">
            감량 소요 기간 계산 공식
          </h2>
          <p className="g-p">
            체중 감량의 핵심은 <strong>칼로리 적자</strong>입니다.
            섭취 칼로리가 소비 칼로리보다 적으면 신체는 저장된 지방을 에너지원으로 사용합니다.
            지방 1kg을 소모하려면 약 <strong>{n0(KCAL_PER_KG)}kcal</strong>의 누적 적자가 필요합니다 (Wishnofsky, 1958).
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ ...box, padding: '18px 22px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent-ink)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>감량 소요 기간 공식</p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text)', lineHeight: 2.2, background: 'var(--bg3)', borderRadius: 'var(--radius-s)', padding: '12px 14px' }}>
                <p>총 필요 칼로리 적자 = 목표 감량(kg) × <span style={{ color: 'var(--accent-ink)' }}>{n0(KCAL_PER_KG)}</span>kcal</p>
                <p>소요 기간(일) = 총 필요 칼로리 적자 ÷ <span style={{ color: 'var(--accent-ink)' }}>하루 칼로리 적자</span></p>
              </div>
            </div>
            <div style={box}>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
                <strong style={{ color: 'var(--text)' }}>예시:</strong> 5kg 감량 목표, 하루 500kcal 적자<br />
                → 총 필요 적자 = 5 × {n0(KCAL_PER_KG)} = <strong style={{ color: 'var(--accent-ink)' }}>{n0(5 * KCAL_PER_KG)}kcal</strong><br />
                → 소요 기간 = {n0(5 * KCAL_PER_KG)} ÷ 500 = <strong style={{ color: 'var(--accent-ink)' }}>{n0(5 * KCAL_PER_KG / 500)}일 (약 {Math.round(5 * KCAL_PER_KG / 500 / 7)}주)</strong>
              </p>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: '16px' }}>
            <strong>도구는 거꾸로 계산합니다.</strong> 하루 적자를 먼저 정하지 않고, 고른 속도(현재 체중의 몇 %/주)로 주당 감량량을 정한 뒤 필요한 적자를 역산합니다 —
            주당 감량(kg) = 현재 체중 × 속도 %, 소요 주수 = 목표 감량 ÷ 주당 감량(올림), 하루 적자 = 주당 감량 × {n0(KCAL_PER_KG)} ÷ 7, 목표 섭취 = TDEE − 하루 적자.
          </p>
          <p className="g-p">
            예를 들어 165cm·70kg 여성(TDEE {n0(EX_INPUT.tdee)}kcal)이 63kg을 목표로 &lsquo;안정 감량(0.5%/주)&rsquo;을 고르면 주당 {EX_PLAN.weeklyLossKg}kg씩 <strong>{EX_PLAN.weeksRequired}주</strong>, 하루 적자 {n0(EX_PLAN.dailyDeficit)}kcal로 목표 섭취는 <strong>{n0(EX_PLAN.targetDailyCalories)}kcal</strong>입니다.
            {EX_INPUT.startDate.slice(0, 4)}년 {Number(EX_INPUT.startDate.slice(5, 7))}월 {Number(EX_INPUT.startDate.slice(8))}일에 시작하면 예상 종료일은 {EX_END}, BMI는 {EX_PLAN.currentBMI}에서 {EX_PLAN.targetBMI}로 내려갑니다.
          </p>
          <Callout tone="note" title="고정 환산의 한계">
            {n0(KCAL_PER_KG)}kcal/kg은 체중이 줄어도 소비 칼로리가 변하지 않는다고 보는 단기 추정입니다. 실제로는 몸이 가벼워질수록 TDEE도 줄어, 같은 섭취를 유지하면 감량이 점점 느려집니다.
            미국 국립보건원(NIDDK)의 Body Weight Planner처럼 이 변화를 반영한 동적 모델은 장기 예측이 더 현실적이므로, 몇 kg 빠질 때마다 현재 체중으로 다시 계산하세요.
          </Callout>
        </section>

        {/* ── 2. 감량 속도 (SAFE_SPEEDS 빌드 시 계산) ── */}
        <section>
          <h2 className="g-h2">
            감량 속도 — 주당 체중의 몇 %가 적당한가
          </h2>
          <p className="g-p">
            미국 CDC는 주당 약 0.5~1kg(1~2파운드)씩 점진적으로 뺀 사람이 체중을 더 잘 유지한다고 안내하고, 대한비만학회는 하루 섭취를 평소보다 500~1,000kcal 줄여 주당 0.5~1kg을 빼는 저열량식을 제시합니다. 비만 치료의 1차 목표는 <strong>6개월 안에 체중의 5~10%</strong>입니다.
            본 도구는 여기에 더해 체중이 가벼운 사람이 과도하게 빼지 않도록 <strong>현재 체중의 %</strong>로 속도를 잡습니다. 아래는 70kg이 7kg을 뺄 때 각 속도 옵션의 값입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
              <caption className="srOnly">감량 속도 옵션별 주당 감량·하루 적자·소요 기간 (70kg, 7kg 감량)</caption>
              <thead>
                <tr>
                  <th scope="col" style={th}>속도 옵션</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>체중 %/주</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>주당 감량</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>하루 적자</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>7kg까지</th>
                  <th scope="col" style={th}>속도 옵션 등급</th>
                </tr>
              </thead>
              <tbody>
                {SPEED_ROWS.map(s => (
                  <tr key={s.id}>
                    <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 600 }}>{s.name}</th>
                    <td style={tdNum}>{s.percentPerWeek}%</td>
                    <td style={tdNum}>{s.weekly.toFixed(2)}kg</td>
                    <td style={tdNum}>{n0(s.deficit)}kcal</td>
                    <td style={tdNum}>{s.weeks}주</td>
                    <td style={{ ...td, color: SEVERITY_COLOR[s.severity], fontWeight: 700 }}>{SEVERITY_LABEL[s.severity]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={note}>
            <strong style={{ color: 'var(--text)' }}>왜 % 기준인가?</strong> — 같은 주당 1kg이라도 100kg에게는 1%, 50kg에게는 2%입니다. 체중이 가벼울수록 뺄 수 있는 지방 자체가 적어 같은 kg 속도가 근육 손실로 이어지기 쉽습니다.
            엘리트 선수 연구(Garthe 외 2011)에서도 주당 0.7% 그룹은 제지방량이 늘었지만 1.4% 그룹은 늘지 않았습니다.
          </p>
        </section>

        {/* ── 3. 목표 BMI 자동 체크 (bmiUtils KOREA) ── */}
        <section>
          <h2 className="g-h2">
            목표 BMI 자동 체크
          </h2>
          <p className="g-p">
            본 도구는 입력한 키와 목표 체중으로 <strong>목표 BMI를 자동 검증</strong>하고, 목표가 BMI {DANGER_THRESHOLDS.underBMIWarn} 미만(저체중)이면 경고합니다. 분류는 대한비만학회 기준(한국인은 BMI 25부터 비만)이며, 오른쪽 열은 키 {EX_INPUT.height}cm일 때의 체중 범위입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '440px' }}>
              <caption className="srOnly">한국 BMI 분류와 키 {EX_INPUT.height}cm 체중 범위</caption>
              <thead>
                <tr>
                  <th scope="col" style={th}>분류</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>BMI (kg/m²)</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>{EX_INPUT.height}cm 체중</th>
                </tr>
              </thead>
              <tbody>
                {BMI_ROWS.map(b => (
                  <tr key={b.id}>
                    <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 700, color: b.id === 'normal' ? 'var(--success)' : b.id === 'underweight' ? 'var(--cat-health-ink)' : b.id === 'overweight' ? 'var(--warning)' : 'var(--danger)' }}>{b.name}</th>
                    <td style={tdNum}>{b.range}</td>
                    <td style={tdNum}>{b.kg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={note}>
            <strong style={{ color: 'var(--text)' }}>목표 정하는 법</strong> — 비만이라면 처음부터 정상 BMI를 노리기보다 6개월 안에 체중의 5~10%를 1차 목표로 두는 것이 대한비만학회 권고입니다. 이미 정상 범위라면 체중보다 허리둘레·근력·체지방률을 목표로 삼는 편이 낫고, 정상인데 무리한 감량은 권장하지 않습니다.
          </p>
        </section>

        {/* ── 4. 칼로리 적자별 감량 속도 (빌드 시 계산) ── */}
        <section>
          <h2 className="g-h2">칼로리 적자별 감량 속도</h2>
          <p className="g-p">
            하루 칼로리 적자에 따른 이론상 감량 속도입니다(지방 1kg = {n0(KCAL_PER_KG)}kcal, 한 달 = 30일). 같은 적자라도 체중이 가벼울수록 &lsquo;체중 대비 %&rsquo;가 커져 도구 판정이 엄격해집니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
              <caption className="srOnly">하루 칼로리 적자별 주당·월당 감량</caption>
              <thead>
                <tr>
                  <th scope="col" style={th}>하루 칼로리 적자</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>주당 감량</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>30일 감량</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>60kg 기준 %/주</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>90kg 기준 %/주</th>
                </tr>
              </thead>
              <tbody>
                {DEFICIT_ROWS.map(r => (
                  <tr key={r.d}>
                    <th scope="row" style={{ ...td, textAlign: 'left', color: 'var(--accent-ink)', fontWeight: 700 }}>{n0(r.d)}kcal</th>
                    <td style={tdNum}>약 {r.weekly.toFixed(2)}kg</td>
                    <td style={tdNum}>약 {r.month.toFixed(1)}kg</td>
                    <td style={{ ...tdNum, color: r.pct60 > 1.5 ? 'var(--danger)' : r.pct60 > 0.5 ? 'var(--warning)' : 'var(--success)' }}>{r.pct60.toFixed(2)}%</td>
                    <td style={{ ...tdNum, color: r.pct90 > 1.5 ? 'var(--danger)' : r.pct90 > 0.5 ? 'var(--warning)' : 'var(--success)' }}>{r.pct90.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={note}>
            색은 속도 계획 기준입니다 — 주당 체중의 0.5% 이하 초록, 0.5% 초과 주황(1%를 넘으면 계획 결과에 경고 표시), 1.5% 초과 빨강(&lsquo;위험&rsquo;, 목표일 탭은 1.2% 초과부터 위험). 이와 별개로 하루 적자가 {n0(DANGER_THRESHOLDS.dailyDeficitMax)}kcal를 넘거나 TDEE의 {DANGER_THRESHOLDS.tdeeDeficitPercent}%를 넘으면, 또는 목표 섭취가 여성 {n0(DANGER_THRESHOLDS.minDailyKcalFemale)}·남성 {n0(DANGER_THRESHOLDS.minDailyKcalMale)}kcal 아래로 내려가면 경고가 추가됩니다.
          </p>
        </section>

        {/* ── 5. 요요 없이 감량 ── */}
        <section>
          <h2 className="g-h2">
            요요 현상 없이 감량하는 법
          </h2>
          <p className="g-p">
            빠른 감량보다 <strong>지속 가능한 속도</strong>로 줄이는 것이 장기적으로 훨씬 효과적입니다.
            급격한 체중 감량은 근육량 손실과 에너지 소비 감소를 키워, 식사를 되돌렸을 때 체중이 빠르게 돌아오는 요요의 주요 원인이 됩니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '급격한 식단 제한 금지', content: '하루 1,200kcal(여성) / 1,500kcal(남성) 아래로 오래 먹으면 영양이 부족해지기 쉽고, 에너지 소비가 체중 감소로 예상되는 것보다 더 줄어드는 대사 적응이 커질 수 있습니다. 이 상태에서 식사를 예전으로 되돌리면 체중이 빠르게 늘기 쉽습니다.' },
              { title: '근력 운동 병행', content: '칼로리 제한만으로 감량하면 지방뿐 아니라 근육도 함께 줄어듭니다. 근육량이 감소하면 기초대사량이 낮아져 같은 양을 먹어도 더 쉽게 살이 찌는 체질이 됩니다. 주 2~3회 근력 운동을 병행하세요.' },
              { title: '목표를 장기적으로 설정', content: '6개월~1년에 걸쳐 천천히 감량한 체중이 훨씬 오래 유지됩니다. 급하게 뺀 체중은 근육 손실이 크고 요요 가능성이 높습니다. 목표 달성 후에도 3~6개월간 유지 기간을 가지는 것이 중요합니다.' },
            ].map((tip, i) => (
              <div key={i} style={box}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{tip.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{tip.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. 정체기·유지기 ── */}
        <section>
          <h2 className="g-h2">
            정체기와 유지기 — 다이어트 흔한 함정
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={box}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--warning)', marginBottom: '6px' }}>정체기 (Plateau) — 왜?</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 체중 감소로 TDEE 자체가 줄어듦</li>
                <li>· 대사 적응</li>
                <li>· 활동량 감소 (무의식적)</li>
                <li>· 호르몬 변화 (렙틴↓·그렐린↑)</li>
              </ul>
            </div>
            <div style={box}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cat-health-ink)', marginBottom: '6px' }}>유지기 — 단순 휴식이 아닌 전략</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 식단 피로·폭식 충동 완화</li>
                <li>· 유지 칼로리로 먹는 연습</li>
                <li>· 근력 운동 수행 회복</li>
                <li>· 장기 지속 가능성↑</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>활용법</strong> — 감량 몇 주 뒤 체중 추세가 2~3주 멈추면 먼저 현재 체중으로 TDEE를 다시 계산해 보세요. 체중이 줄어든 만큼 TDEE도 줄어, 처음 목표 섭취가 더 이상 적자가 아닐 수 있습니다. 식단 피로가 크다면 1~2주는 새 TDEE만큼 먹는 유지기를 넣고, 운동은 유지합니다. 본 도구의 <strong style={{ color: 'var(--text)' }}>그래프</strong>는 초반·후반 속도 변화를 반영한 현실적 곡선을 보여줍니다(유지기는 직접 일정에 넣으세요).
          </p>
        </section>

        {/* ── 7. 식단 vs 운동 적자 (splitDietExercise 빌드 시 계산) ── */}
        <section>
          <h2 className="g-h2">
            식단 vs 운동 적자 비율
          </h2>
          <p className="g-p">
            도구 기본값은 <strong>식단 60% + 운동 40%</strong>입니다. 운동 몫은 한 주 합계로 바꾼 뒤 운동 횟수로 나누고, METs × 체중 × 1.05로 운동 시간을 역산합니다.
            1절 예시(하루 적자 {n0(EX_PLAN.dailyDeficit)}kcal)에 적용하면 식단 {n0(EX_SPLIT.dietDailyDeficit)}kcal + 운동 {n0(EX_SPLIT.exerciseDailyDeficit)}kcal/일 → 주 {n0(EX_SPLIT.weeklyExerciseKcal)}kcal, 주 {EX_SPLIT.exerciseFreq}회라면 1회 {n0(EX_SPLIT.perSessionKcal)}kcal로 70kg 기준 빠른 걷기(6km/h, {FAST_WALK.met} METs) 약 <strong>{EX_WALK_MIN}분</strong>입니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { name: '식단만 (100%)', color: 'var(--warning)', desc: '시간 부담이 적지만 근력 운동이 없으면 근손실 ↑·정체기 빠름' },
              { name: '운동만 (100%)', color: 'var(--danger)', desc: '같은 적자를 만들려면 운동 시간이 크게 늘고 부상·피로 위험 ↑ — 운동 후 식욕 증가로 상쇄되기도' },
              { name: '균형 (식단 60% + 운동 40%) — 도구 기본값', color: 'var(--success)', desc: '근육 유지 + 심혈관 건강 + 지속 가능' },
            ].map((m, i) => (
              <div key={i} style={{ ...box, padding: '11px 14px' }}>
                <p style={{ fontSize: 13, color: m.color, fontWeight: 700, marginBottom: 3 }}>{m.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 8. 단백질 (PROTEIN_TARGETS 빌드 시 계산) ── */}
        <section>
          <h2 className="g-h2">
            단백질 — 감량의 핵심
          </h2>
          <p className="g-p">
            칼로리를 줄이는 동안에는 근육을 지키기 위해 단백질을 일반 성인 권장섭취량(2025 한국인 영양소 섭취기준)보다 넉넉히 잡는 것이 보통입니다.
            도구는 <strong>1.6g/kg(근력 운동 병행 감량)</strong>을 기본으로 추천하며, 단백질은 소화에 쓰이는 에너지 비율이 탄수화물·지방보다 높고 포만감을 오래 유지하는 데도 도움이 됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
              <caption className="srOnly">체중별 하루 단백질 목표</caption>
              <thead>
                <tr>
                  <th scope="col" style={th}>체중</th>
                  {PROTEIN_TARGETS.map(p => (
                    <th key={p.id} scope="col" style={{ ...th, textAlign: 'right', color: p.recommended ? 'var(--accent-ink)' : 'var(--muted)' }}>
                      {p.name} {p.gPerKg}g/kg{p.recommended ? ' (추천)' : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROTEIN_WEIGHTS.map(w => (
                  <tr key={w}>
                    <th scope="row" style={{ ...td, textAlign: 'left', color: 'var(--accent-ink)', fontWeight: 700 }}>{w}kg</th>
                    {PROTEIN_TARGETS.map(p => (
                      <td key={p.id} style={{ ...tdNum, fontWeight: p.recommended ? 700 : 400 }}>{Math.round(w * p.gPerKg)}g</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={note}>
            단백질 식품(대략) — 닭가슴살(100g·23g) / 계란(1개·6g) / 두부(100g·8g) / 우유(200ml·6g) / 생선(100g·20g). 2.4g/kg &lsquo;대회 준비&rsquo;는 단기·전문가 지도용이며, 신장 질환이 있으면 고단백 식단 전에 의료진과 상의하세요.
          </p>
        </section>

        {/* ── 9. FAQ ── */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* ── 면책 ── */}
        <section>
          <Disclaimer variant="medical" open>
            체중 감량은 단순 칼로리 적자를 넘어 <strong>근육량 유지(단백질 + 근력 운동), 대사 적응(정체기·유지기), 호르몬 변화(특히 여성), 정신 건강(강박 예방), 영양 균형</strong>을 함께 고려해야 합니다.
            <br />
            <strong>다음 경우 사용 X 또는 의료 상담</strong> — 18세 미만 / 임산부·수유부 / 만성질환(당뇨·갑상선·심혈관 등) / 거식증·폭식증 등 식이 장애 / BMI 18.5 미만(저체중).
            <br />
            <strong>체중 강박·다이어트 강박·식이 장애 우려 시</strong>
            <br />· 정신건강 위기상담: <strong>1577-0199</strong> (24시간)
            <br />· 자살예방상담: <strong>109</strong> (24시간)
            <br />· 가까운 정신건강복지센터 · 정신건강의학과
            <br />건강한 다이어트의 핵심: <strong>&lsquo;빠르게&rsquo;가 아닌 &lsquo;꾸준히&rsquo;. &lsquo;마름&rsquo;이 아닌 &lsquo;건강함&rsquo;.</strong>
          </Disclaimer>
        </section>

        {/* ── 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmr',     icon: '🔥', name: '기초대사량 계산기',     desc: 'BMR·TDEE 4공식 비교, 정밀 활동' },
              { href: '/tools/health/bmi',     icon: '⚖️', name: 'BMI 계산기',             desc: '체질량지수·키별 정상 체중·허리둘레' },
              { href: '/tools/sports/pace',    icon: '🏃', name: '러닝 페이스 계산기',    desc: '달리기로 칼로리 소모' },
              { href: '/tools/health/supplement', icon: '💊', name: '영양제 성분 체크',  desc: '영양제 중복·상한량 체크' },
              { href: '/tools/date/age',       icon: '🎂', name: '만 나이 계산기',         desc: '나이별 건강 관리 계획' },
              { href: '/tools/date/dday',      icon: '📅', name: 'D-day 계산기',           desc: '목표 달성일 카운트다운' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
