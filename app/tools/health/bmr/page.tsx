import Link from 'next/link'
import BmrClient from './BmrClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import {
  ACTIVITY_FACTORS, GOAL_PRESETS, SAFETY_LIMITS,
  calcMifflin, calcHarris, calcKatch, calcCunningham, calcDetailedTDEE, calcGoalCalories,
  type BmrFormulaInput,
} from './bmrUtils'

export const metadata = buildMetadata({
  path: '/tools/health/bmr',
  title: '기초대사량 계산기 2026 — BMR·TDEE·4공식 비교·운동일/휴식일',
  description:
    '기초대사량(BMR)과 하루 총 소비 칼로리(TDEE)를 Mifflin 등 4개 공식으로 비교 계산. 직업·걸음 수·운동 강도로 운동일/휴식일 TDEE를 분리하고, 목표별 권장 칼로리와 탄단지 매크로, 안전 하한선 경고까지 제공합니다.',
  keywords: [
    '기초대사량 계산기', 'BMR 계산기', 'TDEE 계산기', '하루 칼로리',
    'Mifflin-St Jeor', 'Katch-McArdle', '운동일 칼로리', '활동량 계산',
    '다이어트 칼로리', '칼로리 계산기', '마라톤 칼로리',
  ],
})

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, fontSize: '12px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', fontSize: '13px', borderBottom: '1px solid var(--border)', verticalAlign: 'top' }
const tdNum: React.CSSProperties = { ...td, textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 600 }
const note: React.CSSProperties = { fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.75 }
const box: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }
const listStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }
const won = (n: number) => Math.round(n).toLocaleString('ko-KR')

/* ── 본문 예시 수치: 모두 bmrUtils(도구와 같은 식)로 빌드 시 계산 ──
   예시 인물: 30세 남성 · 175cm · 70kg · 체지방률 18%(→ 제지방량 57.4kg) */
const EX: BmrFormulaInput = { gender: 'male', height: 175, weight: 70, age: 30, bodyFat: 18 }
const EX_LBM = Math.round(EX.weight * (1 - (EX.bodyFat ?? 0) / 100) * 10) / 10
const EX_BMR = {
  mifflin: Math.round(calcMifflin(EX)),
  harris: Math.round(calcHarris(EX)),
  katch: Math.round(calcKatch(EX) ?? 0),
  cunningham: Math.round(calcCunningham({ ...EX, leanMass: EX_LBM }) ?? 0),
}
const FORMULA_ROWS = [
  { name: 'Mifflin-St Jeor (1990)', formula: '10×체중 + 6.25×키 − 5×나이 + 5 (여성 −161)', needs: '키·체중·나이·성별', bmr: EX_BMR.mifflin,
    note: '건강한 성인 498명 측정으로 도출. 체계적 문헌고찰(Frankenfield 2005)에서 측정값 ±10% 이내로 맞힌 사람 비율이 가장 높았던 식 — 도구 기본값' },
  { name: 'Harris-Benedict (1984 개정)', formula: '88.362 + 13.397×체중 + 4.799×키 − 5.677×나이 (여성 식 별도)', needs: '키·체중·나이·성별', bmr: EX_BMR.harris,
    note: '1919년 원전을 Roza·Shizgal이 재평가·개정. 정상 영양 상태에서 정밀도 ±14%. Mifflin보다 조금 높게 나오는 경향' },
  { name: 'Katch-McArdle', formula: '370 + 21.6×제지방량(kg)', needs: '체중·체지방률', bmr: EX_BMR.katch,
    note: '성별·나이 대신 제지방량을 씀. 체지방률 값이 틀리면 결과도 그만큼 틀림 — 가정용 체지방계 값은 오차가 큼' },
  { name: 'Cunningham', formula: '500 + 22×제지방량(kg)', needs: '제지방량(LBM)', bmr: EX_BMR.cunningham,
    note: '근육량이 많은 운동선수에게 흔히 쓰임. 같은 제지방량이면 Katch-McArdle보다 높게 나옴' },
]
const HB_M = { w: 13.397 * 70, h: 4.799 * 175, a: 5.677 * 30, total: Math.round(calcHarris({ gender: 'male', height: 175, weight: 70, age: 30 })) }
const HB_F = { w: 9.247 * 55, h: 3.098 * 163, a: 4.330 * 30, total: Math.round(calcHarris({ gender: 'female', height: 163, weight: 55, age: 30 })) }

/* 정밀 활동 예시 — calcDetailedTDEE와 동일: 사무직 · 하루 8,000보 · 주 3회 45분 보통 강도(조깅·자전거) */
const EX_ACT = { jobLevel: 'sedentary', weeklyExercises: 3, exerciseDuration: 45, exerciseIntensity: 'moderate', weight: EX.weight, dailySteps: 8000 }
const EX_DET = calcDetailedTDEE(EX_BMR.mifflin, EX_ACT)
const EX_LIGHT = Math.round(EX_BMR.mifflin * (ACTIVITY_FACTORS.find(a => a.id === 'light')?.factor ?? 1.375))
/* 칼로리 사이클링 예시 — 휴식일·운동일 TDEE 각각 −15% */
const CYC_REST = Math.round(EX_DET.restDayTDEE * 0.85)
const CYC_EX = Math.round(EX_DET.exerciseDayTDEE * 0.85)
const CYC_AVG = Math.round(EX_DET.avgTDEE * 0.85)
const CYC_WEEK = CYC_REST * (7 - EX_ACT.weeklyExercises) + CYC_EX * EX_ACT.weeklyExercises
/* 목표별 칼로리 — calcGoalCalories(평균 TDEE) */
const GOAL_ROWS = GOAL_PRESETS.map(g => ({ ...g, r: calcGoalCalories(EX_DET.avgTDEE, g.id)! }))

const FAQ_LD = [
  {
    q: 'Harris-Benedict 공식이란?',
    a: '1919년 처음 발표되고 1984년 개정된(Roza-Shizgal) 기초대사량 계산 공식으로, 임상에서 오래 사용돼 왔습니다. 본 도구가 쓰는 개정판 계수는 — 남성: 88.362 + (13.397×체중kg) + (4.799×키cm) − (5.677×나이), 여성: 447.593 + (9.247×체중kg) + (3.098×키cm) − (4.330×나이) 입니다(원전 1919년 계수와는 다릅니다). 개정 논문은 정상 영양 상태의 성인에서 정밀도를 ±14%로 보고했고, 이후 나온 Mifflin-St Jeor 공식도 개인에 따라 ±10% 넘게 벗어날 수 있습니다. 본 도구는 4공식을 모두 비교 표시합니다.',
  },
  {
    q: '기초대사량은 왜 사람마다 다른가요?',
    a: '기초대사량은 근육량, 나이, 성별, 유전적 요인에 따라 달라집니다. 근육은 지방보다 에너지를 많이 소비하므로 근육량이 많을수록 기초대사량이 높습니다. 나이가 들수록 근육량이 감소해 기초대사량도 낮아집니다. 같은 키·체중·나이라도 공식은 한 값만 내므로, 근육량이 평균과 크게 다르면 체지방률을 넣는 Katch-McArdle 결과와 함께 보는 것이 좋습니다.',
  },
  {
    q: '다이어트 중 기초대사량이 낮아지나요?',
    a: '네. 체중이 줄면 유지해야 할 몸 자체가 작아져 기초대사량이 줄고, 장기간 칼로리를 크게 제한하면 체중 감소로 설명되는 것보다 에너지 소비가 더 줄어드는 대사 적응도 보고됩니다. 그래서 감량 중에는 몇 kg 빠질 때마다 본 도구로 현재 체중을 다시 넣어 목표 칼로리를 갱신해야 합니다. 급격한 제한보다 <strong>TDEE의 10~20% 수준</strong>에서 조절하고 규칙적인 근력 운동을 병행하는 것이 좋습니다.',
  },
  {
    q: 'TDEE는 매일 같은가요?',
    a: '아닙니다. TDEE는 그날의 활동량에 따라 달라집니다. 장거리 달리기를 한 날은 TDEE가 평소보다 수백~1,000kcal 높을 수 있고, 완전 휴식일은 BMR에 가까워집니다. 본 도구의 [BMR·TDEE] 탭에서 활동 수준 입력 방식을 <strong>「정밀」</strong>로 전환하면 휴식일·운동일 TDEE가 자동 분리됩니다.',
  },
  {
    q: '어떤 공식을 사용해야 하나요?',
    a: '일반인은 <strong>Mifflin-St Jeor</strong> 공식을 권장합니다 (현재 가장 널리 사용·권장). 상황별 추천 — 일반 성인 다이어트: Mifflin-St Jeor / 의료·연구 기록 일관성: Harris-Benedict / 체지방률을 신뢰할 만한 방법(DEXA 등)으로 쟀을 때: Katch-McArdle / 운동선수·근육량 많음: Cunningham. 모든 공식은 추정치이므로, 본 도구는 4공식을 모두 비교 표시합니다. 공식 간 차이가 100kcal 안팎이면 어느 것을 써도 실생활 차이는 작습니다.',
  },
  {
    q: '운동일과 휴식일의 칼로리를 따로 계산해야 하나요?',
    a: '필수는 아니지만 운동량이 많다면 도움이 됩니다. 주간 총 섭취가 같다면 나눠 먹든 매일 같은 양을 먹든 감량 효과는 사실상 같고(본문 &lsquo;칼로리 사이클링&rsquo; 표), 달라지는 것은 <strong>배분</strong>입니다 — 강도 높은 훈련 날에 에너지와 탄수화물을 더 배치하면 훈련·회복에 유리하고, 휴식일에 과하게 먹는 것도 막을 수 있습니다. 본 도구는 [BMR·TDEE] 탭의 활동 수준 입력 방식을 「정밀」로 전환하면 휴식일/운동일 TDEE를 자동 분리해 보여줍니다.',
  },
  {
    q: '스마트워치 측정값이 공식보다 높게 나옵니다. 어느 걸 따라야 하나요?',
    a: '어느 쪽도 &lsquo;정답&rsquo;은 아닙니다. 손목형 기기 7종을 간접열량측정과 비교한 연구(Shcherbina 외 2017)에서 에너지 소비 오차가 20% 아래인 기기는 하나도 없었고, 가장 정확한 기기도 오차 중앙값이 27%였습니다. 워치의 운동 칼로리를 그대로 더해 먹으면 감량이 멈추는 일이 흔한 이유입니다. 공식 TDEE를 출발점으로 삼고, <strong>2~4주 동안 같은 칼로리로 먹으며 체중 추세를 보는 것</strong>이 가장 확실한 검증입니다(체중이 유지되면 그 칼로리가 실제 TDEE).',
  },
  {
    q: '권장 최소 칼로리(여성 1,200·남성 1,500) 미만으로 먹으면 안 되나요?',
    a: '단기적으로 가능하지만 <strong>장기(2주 이상) 지속은 권장하지 않습니다.</strong><br><br>장기 위험 — 영양 부족(비타민·미네랄) / 대사 적응(BMR 감소 → 요요) / 근손실 증가 / 호르몬 이상(특히 여성: 생리 불순) / 거식증·폭식증 위험 / 골밀도 감소.<br><br>대안 — 1,200/1,500kcal 이상으로 천천히 감량 / 운동량↑(근육 유지) / 충분한 단백질(체중 1kg당 1.6~2.2g) / 의료 전문가 상담(영양사·내과). 하루 800kcal 이하의 초저열량식은 의료진 감독하에서만 시행합니다.',
  },
  {
    q: '청소년·임산부도 본 계산기를 사용할 수 있나요?',
    a: '<strong>권장하지 않습니다.</strong><br><br>· <strong>청소년(18세 미만)</strong> — 성장기 영양 필요량이 성인 공식과 다름. 체중당 필요 에너지가 성인보다 높음(성장 에너지). 본 도구 부적합 → 소아청소년과 전문의 상담.<br>· <strong>임산부</strong> — 임신 시기별 칼로리 필요량 다름(1·2·3분기). 일반 BMR 공식 부적합. 산부인과·영양사 상담 필수.<br>· <strong>65세 이상</strong> — 근감소증 고려 필요. 본 도구 결과는 참고만, 노인병학 의료 상담 권장.<br>· <strong>만성질환자(당뇨·심혈관·갑상선)</strong> — 의료 전문가 상담 필수. 본 도구 결과만으로 식단 결정 X.',
  },
  {
    q: 'BMR을 높이려면 어떻게 해야 하나요?',
    a: '단기간 BMR을 크게 높이는 것은 어렵지만, 장기적 방법은 있습니다.<br><br><strong>효과적</strong> — 근력 운동으로 근육량 유지·증가 (골격근 1kg ≈ 안정 시 약 13kcal/일) / 단백질 충분(소화에 드는 에너지가 탄수화물·지방보다 큼) / 충분한 수면(수면 부족은 식욕 조절을 흔들어 과식으로 이어지기 쉬움).<br><br><strong>효과가 작은 것</strong> — 카페인(대사율을 일시적으로 조금 올리지만 체중 관리 효과는 미미) / &lsquo;5분마다 식사&rsquo; / &lsquo;특정 음식(마늘·생강 등)&rsquo; / &lsquo;찬물 마시기&rsquo;(5℃ 물 250mL를 체온까지 데우는 데 이론상 약 8kcal).<br><br><strong>현실적</strong> — 근육 1kg 증가 → BMR 약 13kcal/일↑ / Mifflin 식 기준 체중 5kg 증가 → BMR 50kcal/일↑ / 단기간보다 장기간(수개월) 시각으로.',
  },
]

export default function BmrPage() {
  return (
    <ToolPage width={760} slug="/tools/health/bmr">
      <h1 className="tp-h1">
        <ToolIconBadge catId="health" />기초대사량 계산기
      </h1>
      <p className="tp-lead">
        기초대사량과 하루 총 소비 칼로리 + <strong style={{ color: 'var(--text)' }}>운동일/휴식일별 목표 칼로리</strong> 자동.
      </p>

      <UpdatedMeta date="2026년 9월" basis="BMR 공식 4종 — Mifflin-St Jeor(1990)·Harris-Benedict(Roza-Shizgal 1984 개정)·Katch-McArdle·Cunningham · 활동계수 1.2~1.9" sources={[{ label: 'Mifflin 외(1990) — Am J Clin Nutr', href: 'https://pubmed.ncbi.nlm.nih.gov/2305711/' }, { label: 'Roza·Shizgal(1984) — Am J Clin Nutr', href: 'https://pubmed.ncbi.nlm.nih.gov/6741850/' }, { label: 'Frankenfield 외(2005) — 예측식 체계적 문헌고찰', href: 'https://www.jandonline.org/article/S0002-8223(05)00149-5/abstract' }, { label: '보건복지부 — 2025 한국인 영양소 섭취기준 개정', href: 'https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027&act=view&list_no=1488441' }, { label: 'Shcherbina 외(2017) — 손목형 기기 에너지 소비 정확도', href: 'https://www.mdpi.com/2075-4426/7/2/3' }]} />

      <BmrClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. BMR과 TDEE란? ── */}
        <section>
          <h2 className="g-h2">
            기초대사량(BMR)과 TDEE란?
          </h2>
          <p className="g-p">
            기초대사량(BMR, Basal Metabolic Rate)은 생명 유지를 위해 최소한으로 필요한 에너지량입니다.
            아무것도 하지 않고 누워있어도 심장 박동, 호흡, 체온 유지 등에 소모되는 칼로리로,
            전체 에너지 소비의 약 <strong>60~70%</strong>를 차지합니다. 나머지는 음식을 소화·흡수하는 데 쓰는 에너지(식사성 열발생, 약 10%)와 운동·일상 움직임에 쓰는 에너지입니다.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div style={{ ...box, padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent-ink)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>BMR</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>기초대사량</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
                완전한 안정 상태에서 생명 유지에 필요한 최소 칼로리. 아무것도 안 해도 소모됩니다.
              </p>
            </div>
            <div style={{ ...box, padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--cat-health-ink)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>TDEE</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>총 일일 에너지 소비량</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
                BMR에 활동량을 반영한 <strong style={{ color: 'var(--text)' }}>하루 실제 소비 칼로리</strong>. 다이어트·식단 설계의 기준이 됩니다.
              </p>
            </div>
          </div>

          <Callout tone="tip" title="쉽게 이해하기">
            BMR은 자동차가 주차 중에도 소모하는 연료(엔진 공회전)이고, TDEE는 실제 주행거리에 따른 총 연료 소비량입니다.
            체중을 관리하려면 BMR이 아닌 <strong>TDEE를 기준으로 식단을 설계</strong>해야 합니다. BMR만큼만 먹으면 활동에 쓰는 에너지 전체가 적자가 되어, 의도보다 훨씬 큰 감량 식단이 됩니다.
          </Callout>
        </section>

        {/* ── 2. BMR 4공식 비교 (빌드 시 계산) ── */}
        <section>
          <h2 className="g-h2">
            BMR 4공식 비교
          </h2>
          <p className="g-p">
            본 도구는 4가지 BMR 공식을 모두 비교 표시합니다. 아래 &lsquo;예시&rsquo; 열은 <strong>30세 남성·175cm·70kg·체지방률 18%(제지방량 {EX_LBM}kg)</strong>를 도구와 같은 식으로 계산한 값입니다.
            같은 사람인데도 공식에 따라 {won(Math.min(...Object.values(EX_BMR)))}~{won(Math.max(...Object.values(EX_BMR)))}kcal로 약 {won(Math.max(...Object.values(EX_BMR)) - Math.min(...Object.values(EX_BMR)))}kcal 차이가 나는데, 이 폭 자체가 &lsquo;공식은 추정치&rsquo;라는 뜻입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px' }}>
              <caption className="srOnly">BMR 공식별 계산식과 예시 결과</caption>
              <thead>
                <tr>
                  <th scope="col" style={th}>공식</th>
                  <th scope="col" style={th}>계산식 (체중 kg · 키 cm)</th>
                  <th scope="col" style={th}>필요 입력</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>예시</th>
                </tr>
              </thead>
              <tbody>
                {FORMULA_ROWS.map(f => (
                  <tr key={f.name}>
                    <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left' }}>{f.name}</th>
                    <td style={{ ...td, fontSize: '12px' }}>{f.formula}<br /><span style={{ color: 'var(--muted)' }}>{f.note}</span></td>
                    <td style={td}>{f.needs}</td>
                    <td style={tdNum}>{won(f.bmr)}kcal</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '12px' }}>
            <Callout tone="note" title="실용적 권장">
              일반인은 <strong>Mifflin-St Jeor</strong>, 체지방률을 신뢰할 만한 방법으로 잰 운동선수는 <strong>Katch-McArdle</strong>, 의료·연구 기록과 맞춰야 하면 <strong>Harris-Benedict</strong>.
              선택한 공식에 필요한 체지방률(1~59%)·제지방량이 없거나 범위를 벗어나면, 도구는 Mifflin으로 대신 계산하고 그 사실을 표시합니다.
            </Callout>
          </div>
          <p style={note}>
            <strong style={{ color: 'var(--text)' }}>출처·정확도</strong> — Mifflin-St Jeor(1990)는 건강한 성인 498명 데이터 기반이며, 정상 체중·비만 성인을 함께 본 체계적 문헌고찰(Frankenfield 외 2005)에서 측정 안정대사율의 ±10% 이내로 예측한 비율이 비교한 식 중 가장 높았습니다. Harris-Benedict(1919 원전·1984 개정)는 재평가 연구에서 정상 영양 상태 기준 약 <strong style={{ color: 'var(--text)' }}>±14%</strong> 정밀도로 보고됩니다. 모든 공식은 추정치이며 근육량·호르몬·질환에 따라 달라집니다.
          </p>
        </section>

        {/* ── 3. Harris-Benedict 공식 시각화 ── */}
        <section>
          <h2 className="g-h2">
            Harris-Benedict 공식
          </h2>
          <p className="g-p">
            1919년 발표 후 1984년 개정된(Roza-Shizgal) 기초대사량 공식으로, 아래는 본 도구가 사용하는 <strong>개정판 계수</strong>입니다.
            남녀 식의 계수가 크게 다른 이유는 원 연구의 남녀 측정 데이터에 각각 따로 회귀식을 맞췄기 때문입니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ ...box, padding: '20px 22px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cat-health-ink)', letterSpacing: '0.04em', marginBottom: '14px' }}>남성 BMR 공식</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text)', lineHeight: 2, background: 'var(--bg3)', borderRadius: 'var(--radius-s)', padding: '12px 14px', marginBottom: '10px' }}>
                BMR = 88.362<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (13.397 × 체중<span style={{ color: 'var(--cat-health-ink)' }}>kg</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (4.799 × 키<span style={{ color: 'var(--cat-health-ink)' }}>cm</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;− (5.677 × 나이<span style={{ color: 'var(--cat-health-ink)' }}>세</span>)
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                예시: 30세 남성, 70kg, 175cm → BMR = 88.362 + {HB_M.w.toFixed(1)} + {HB_M.h.toFixed(1)} − {HB_M.a.toFixed(1)} =
                <strong style={{ color: 'var(--cat-health-ink)' }}> 약 {won(HB_M.total)}kcal</strong>
              </p>
            </div>

            <div style={{ ...box, padding: '20px 22px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cat-date-ink)', letterSpacing: '0.04em', marginBottom: '14px' }}>여성 BMR 공식</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text)', lineHeight: 2, background: 'var(--bg3)', borderRadius: 'var(--radius-s)', padding: '12px 14px', marginBottom: '10px' }}>
                BMR = 447.593<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (9.247 × 체중<span style={{ color: 'var(--cat-date-ink)' }}>kg</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (3.098 × 키<span style={{ color: 'var(--cat-date-ink)' }}>cm</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;− (4.330 × 나이<span style={{ color: 'var(--cat-date-ink)' }}>세</span>)
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                예시: 30세 여성, 55kg, 163cm → BMR = 447.593 + {HB_F.w.toFixed(1)} + {HB_F.h.toFixed(1)} − {HB_F.a.toFixed(1)} =
                <strong style={{ color: 'var(--cat-date-ink)' }}> 약 {won(HB_F.total)}kcal</strong>
              </p>
            </div>
          </div>
        </section>

        {/* ── 4. 활동 수준별 TDEE 표 (빌드 시 계산) ── */}
        <section>
          <h2 className="g-h2">
            활동 수준별 TDEE 계산
          </h2>
          <p className="g-p">
            BMR에 아래 활동 계수를 곱하면 하루 총 소비 칼로리(TDEE)가 됩니다. 오른쪽 열은 앞의 예시 인물(Mifflin BMR {won(EX_BMR.mifflin)}kcal)에 적용한 값입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '440px' }}>
              <caption className="srOnly">활동 계수별 TDEE 계산</caption>
              <thead>
                <tr>
                  <th scope="col" style={th}>활동 수준</th>
                  <th scope="col" style={{ ...th, textAlign: 'center' }}>TDEE 계산법</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>예시 TDEE</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVITY_FACTORS.map(a => (
                  <tr key={a.id}>
                    <td style={td}>{a.name} ({a.desc})</td>
                    <td style={{ ...td, textAlign: 'center', color: 'var(--muted)' }}>
                      BMR × <strong style={{ color: 'var(--accent-ink)', fontWeight: 700 }}>{a.factor}</strong>
                    </td>
                    <td style={tdNum}>{won(EX_BMR.mifflin * a.factor)}kcal</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '12px' }}>
            <Callout tone="tip" title="마라톤 러너를 위한 팁">
              마라톤 훈련기에는 평소보다 TDEE가 <strong>500~1,000kcal</strong>까지 치솟을 수 있습니다.
              탄수화물은 비율(%)보다 체중당 양으로 잡는 것이 정확합니다 — 미국스포츠의학회(ACSM) 등의 2016년 공동 성명은 하루 1~3시간 지구력 훈련기에 <strong>체중 1kg당 6~10g</strong>을 제시합니다(70kg이면 420~700g).
              훈련량에 비해 에너지가 계속 모자라면 회복이 늦어지고, 만성적인 에너지 부족(RED-S)은 피로골절 등 부상 위험과 연관됩니다.
            </Callout>
          </div>
        </section>

        {/* ── 5. 정밀 활동 수준 분석 ── */}
        <section>
          <h2 className="g-h2">
            정밀 활동 수준 분석 — 5단계의 한계
          </h2>
          <p className="g-p">
            5단계 활동 계수는 빠른 추정에는 좋지만 다음 한계가 있습니다 —
          </p>
          <ul style={{ ...listStyle, marginBottom: 14 }}>
            <li>· &lsquo;보통 활동&rsquo; = 주 3~5회 운동 (너무 광범위)</li>
            <li>· 30분 산책과 90분 러닝을 동일 분류</li>
            <li>· 직업 활동량(사무·서비스·육체노동) 무시</li>
            <li>· 일일 걸음 수 반영 X</li>
          </ul>
          <div style={box}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>본 도구의 정밀 분석 계산식</p>
            <ul style={listStyle}>
              <li>① <strong style={{ color: 'var(--text)' }}>기본 소비</strong> = BMR × 직업 계수(사무 1.0 · 서비스 1.05 · 도보 1.10 · 육체노동 1.20) × 1.1</li>
              <li>② <strong style={{ color: 'var(--text)' }}>걸음 보정</strong> = (하루 걸음 − 5,000) ÷ 1,000 × 50kcal (5,000보 이하는 0)</li>
              <li>③ <strong style={{ color: 'var(--text)' }}>운동 1회</strong> = (MET − 1) × 체중(kg) × 운동 시간(h) — BMR에 이미 포함된 안정 대사분(1 MET)은 빼고 더함</li>
              <li>④ <strong style={{ color: 'var(--text)' }}>휴식일</strong> = ① + ② · <strong style={{ color: 'var(--text)' }}>운동일</strong> = ① + ② + ③ · <strong style={{ color: 'var(--text)' }}>평균</strong> = ① + ② + ③ × 주간 횟수 ÷ 7</li>
            </ul>
          </div>
          <p className="g-p" style={{ marginTop: '14px' }}>
            <strong>예시</strong> — 앞의 인물이 사무직, 하루 8,000보, 주 3회 45분 조깅(보통 강도 5.7 MET)을 한다면
            기본 소비 {won(EX_DET.baseDailyTDEE)}kcal + 걸음 {won(EX_DET.dailyStepsBonus)}kcal로 <strong>휴식일 {won(EX_DET.restDayTDEE)}kcal</strong>, 운동 1회 {won(EX_DET.exerciseDayTDEE - EX_DET.restDayTDEE)}kcal가 더해져 <strong>운동일 {won(EX_DET.exerciseDayTDEE)}kcal</strong>, 주간 평균 {won(EX_DET.avgTDEE)}kcal입니다.
            같은 사람을 5단계의 &lsquo;가벼운 활동(×1.375)&rsquo;으로 잡으면 {won(EX_LIGHT)}kcal입니다.
            두 방식은 이 예시에서 약 {won(EX_LIGHT - EX_DET.avgTDEE)}kcal 차이가 나며, 둘 다 추정치라 어느 쪽이 본인에게 맞는지는 실제 체중 추세로만 확인할 수 있습니다(보정 방법은 아래 &lsquo;스마트워치 vs 공식&rsquo; 참고).
          </p>
        </section>

        {/* ── 6. 운동일/휴식일 칼로리 사이클링 (빌드 시 계산) ── */}
        <section>
          <h2 className="g-h2">
            운동일/휴식일 칼로리 사이클링
          </h2>
          <p className="g-p">
            칼로리 사이클링은 <strong>운동일에 더 먹고, 휴식일에 적게 먹는 배분 방식</strong>입니다. 체중 변화를 결정하는 것은 한 주 전체의 에너지 수지이므로, 사이클링 자체가 더 많은 지방을 빼 주지는 않습니다.
            대신 훈련하는 날 에너지·탄수화물이 모자라지 않게 하고, 움직임이 적은 날 과식을 줄이는 데 쓸모가 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '440px' }}>
              <caption className="srOnly">칼로리 사이클링과 평균 칼로리 비교 예시</caption>
              <thead>
                <tr>
                  <th scope="col" style={th}>방식 (각 TDEE −15%)</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>휴식일 {7 - EX_ACT.weeklyExercises}일</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>운동일 {EX_ACT.weeklyExercises}일</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>주간 합계</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 600 }}>평균 TDEE로 매일 같게</th>
                  <td style={tdNum}>{won(CYC_AVG)}kcal</td>
                  <td style={tdNum}>{won(CYC_AVG)}kcal</td>
                  <td style={tdNum}>{won(CYC_AVG * 7)}kcal</td>
                </tr>
                <tr>
                  <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 600 }}>휴식일·운동일 분리</th>
                  <td style={tdNum}>{won(CYC_REST)}kcal</td>
                  <td style={tdNum}>{won(CYC_EX)}kcal</td>
                  <td style={tdNum}>{won(CYC_WEEK)}kcal</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={note}>
            앞 절의 예시 인물 기준입니다. 주간 합계는 사실상 같고(반올림 차이), 달라지는 것은 운동일과 휴식일의 배분 {won(CYC_EX - CYC_REST)}kcal뿐입니다.
            운동일에 늘어난 몫은 탄수화물로 채우는 것이 일반적입니다.
          </p>
          <div style={{ ...box, marginTop: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, margin: 0 }}>
              <strong style={{ color: 'var(--text)' }}>본 도구에서 활용하는 법</strong> — [BMR·TDEE] 탭에서 활동 수준 입력 방식을 <strong style={{ color: 'var(--accent-ink)' }}>「정밀」</strong>로 전환하면 직업·걸음·주간 운동량을 기반으로 <strong style={{ color: 'var(--text)' }}>휴식일 TDEE</strong>와 <strong style={{ color: 'var(--text)' }}>운동일 TDEE</strong>가 자동 분리 계산됩니다.
              감량 중이라면 두 값에 같은 비율(예: −10~15%)을 적용하면 위 표처럼 주간 적자는 유지하면서 배분만 바뀝니다.
            </p>
          </div>
        </section>

        {/* ── 7. 안전 하한선 ── */}
        <section>
          <h2 className="g-h2">
            안전 하한선 — 거식증·식이장애 예방
          </h2>
          <p className="g-p">
            도구는 목표표의 <strong>&lsquo;빠른 감량(TDEE −20%)&rsquo; 칼로리</strong>를 아래 기준과 비교해 자동 경고를 띄웁니다. 나머지 상황은 도구가 잡을 수 없으니 스스로 점검하세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
              <caption className="srOnly">안전 하한선 경고 기준</caption>
              <thead>
                <tr>
                  <th scope="col" style={th}>조건</th>
                  <th scope="col" style={th}>도구 반응</th>
                  <th scope="col" style={th}>이유</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={td}>여성 목표 섭취 {won(SAFETY_LIMITS.female.min)}kcal 미만</td><td style={{ ...td, color: 'var(--danger)', fontWeight: 700 }}>강한 경고</td><td style={td}>식품만으로 필수 영양소를 채우기 어려워짐</td></tr>
                <tr><td style={td}>남성 목표 섭취 {won(SAFETY_LIMITS.male.min)}kcal 미만</td><td style={{ ...td, color: 'var(--danger)', fontWeight: 700 }}>강한 경고</td><td style={td}>근손실·피로·영양 결핍 위험</td></tr>
                <tr><td style={td}>목표 섭취 &lt; 기초대사량</td><td style={{ ...td, color: 'var(--danger)', fontWeight: 700 }}>강한 경고</td><td style={td}>활동 에너지 전부가 적자 — 장기 지속 시 대사 적응·요요 위험</td></tr>
                <tr><td style={td}>나이 18세 미만</td><td style={{ ...td, color: 'var(--danger)', fontWeight: 700 }}>강한 경고</td><td style={td}>성장기 필요량은 성인 공식과 다름</td></tr>
                <tr><td style={td}>TDEE −20% 이상을 수개월 지속</td><td style={{ ...td, color: 'var(--warning)', fontWeight: 700 }}>직접 점검</td><td style={td}>적자가 클수록 근육 손실 비율이 커지기 쉬움</td></tr>
                <tr><td style={td}>운동량은 많은데 섭취가 적음</td><td style={{ ...td, color: 'var(--warning)', fontWeight: 700 }}>직접 점검</td><td style={td}>에너지 부족(RED-S) — 월경 불순·피로골절 신호 주의</td></tr>
                <tr><td style={td}>빠른 체중 변화·지속적 피로·체중 강박</td><td style={{ ...td, color: 'var(--warning)', fontWeight: 700 }}>직접 점검</td><td style={td}>식이장애 초기 신호일 수 있음 — 전문가 상담</td></tr>
              </tbody>
            </table>
          </div>
          <p style={note}>
            <strong style={{ color: 'var(--text)' }}>건강한 감량</strong> — 천천히(−10%)·보통(−15%)·빠른(−20%) 순으로 적자가 커집니다. 주당 감량 폭(kg)은 TDEE에 비례하므로 계산기 목표표의 <strong style={{ color: 'var(--text)' }}>&lsquo;kg/주&rsquo;</strong> 표시로 확인하세요. 하루 800kcal 이하의 초저열량식(VLCD)은 <strong style={{ color: 'var(--text)' }}>의료 감독하에서만</strong> 고려합니다.
          </p>
        </section>

        {/* ── 8. 목표별 칼로리 가이드 ── */}
        <section>
          <h2 className="g-h2">
            목표별 칼로리 설정 가이드
          </h2>
          <p className="g-p">
            도구의 목표표는 TDEE에 고정 비율을 곱하고, 주당 체중 변화는 지방 1kg ≈ 7,700kcal로 환산합니다. 앞의 예시 인물(평균 TDEE {won(EX_DET.avgTDEE)}kcal)에 적용하면 다음과 같습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '460px' }}>
              <caption className="srOnly">목표별 하루 칼로리와 주당 체중 변화 예시</caption>
              <thead>
                <tr>
                  <th scope="col" style={th}>목표</th>
                  <th scope="col" style={th}>조정</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>하루 칼로리</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>주당 변화(이론)</th>
                </tr>
              </thead>
              <tbody>
                {GOAL_ROWS.map(g => (
                  <tr key={g.id}>
                    <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 600 }}>{g.name}</th>
                    <td style={{ ...td, color: 'var(--muted)' }}>{g.desc}</td>
                    <td style={tdNum}>{won(g.r.daily)}kcal</td>
                    <td style={{ ...tdNum, color: g.r.weeklyChangeKg < 0 ? 'var(--success)' : 'var(--text)' }}>
                      {g.r.weeklyChangeKg > 0 ? '+' : ''}{g.r.weeklyChangeKg.toFixed(2)}kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
            {[
              {
                title: '체중 감량 (다이어트)',
                color: 'var(--cat-health-ink)',
                content: 'TDEE보다 적게 섭취해 칼로리 적자를 만드는 것이 감량의 기본 원리입니다. 일반적으로 TDEE의 10~20%(약 300~500kcal) 적자가 무난하며, 1,200kcal(여성) / 1,500kcal(남성) 이하로는 내리지 않는 것을 권장합니다. 위 표의 주당 변화는 이론값이라 초반엔 수분 때문에 더 빠르고, 체중이 줄수록 느려집니다.',
              },
              {
                title: '체중 유지',
                color: 'var(--success)',
                content: 'TDEE와 동일한 칼로리를 섭취하면 체중이 유지됩니다. 2025 한국인 영양소 섭취기준의 성인 에너지적정비율은 탄수화물 50~65%, 단백질 10~20%, 지방 15~30%입니다. 도구의 기본 탄단지 비율(50:25:25)은 감량·운동 중 단백질을 넉넉히 잡은 설정이라 단백질이 이 범위보다 높습니다.',
              },
              {
                title: '근육 증가 (벌크업)',
                color: 'var(--warning)',
                content: 'TDEE보다 200~500kcal를 추가 섭취하고 충분한 단백질(체중 1kg당 1.6~2.2g)을 섭취하면 근육 성장에 도움이 됩니다. 너무 많은 칼로리 잉여는 체지방 증가로 이어집니다.',
              },
            ].map((item, i) => (
              <div key={i} style={{ ...box, padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: item.color, marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.content}</p>
              </div>
            ))}
          </div>
          <p style={note}>
            하루 적자별 주당 감량 페이스, 목표 체중까지의 구체적 기간 설계와 정체기·요요 방지 전략은 <Link href="/tools/health/weightloss" style={{ color: 'var(--accent-ink)' }}>체중 감량 기간 계산기</Link>에서 확인하세요.
          </p>
        </section>

        {/* ── 9. 스마트워치 vs 공식 ── */}
        <section>
          <h2 className="g-h2">
            스마트워치 vs 공식 — 어느 게 정확?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={box}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-ink)', marginBottom: '6px' }}>공식 BMR/TDEE</p>
              <ul style={listStyle}>
                <li>· 장점: 빠르고 입력값이 같으면 결과도 같음</li>
                <li>· 단점: 근육량 등 개인 차이 반영 X</li>
                <li>· 정확도: 대다수 ±10% 안팎, 개인에 따라 더 벗어남</li>
              </ul>
            </div>
            <div style={box}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cat-unit-ink)', marginBottom: '6px' }}>손목형 기기 (워치·밴드)</p>
              <ul style={listStyle}>
                <li>· 장점: 매일의 활동 변화를 반영</li>
                <li>· 단점: 운동 강도·체성분 추정 오차</li>
                <li>· 정확도: 연구에서 오차 중앙값 27~93%(7개 기기)</li>
              </ul>
            </div>
          </div>
          <Callout tone="tip" title="실용적 결론">
            둘 다 추정치입니다. 워치 숫자는 &lsquo;오늘 평소보다 많이 움직였는지&rsquo;를 보는 상대 지표로 쓰고, 절대량은 공식 TDEE에서 출발해 <strong>2~4주 동일 칼로리 식사 후 체중 변화</strong>로 보정하세요(체중 안정 = 그 칼로리가 본인 TDEE).
          </Callout>
        </section>

        {/* ── 10. FAQ ── */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* ── 면책 ── */}
        <section>
          <Disclaimer variant="medical" open>
            실제 에너지 소비량은 다음에 따라 달라집니다 —
            근육량·체지방률 / 호르몬 상태(갑상선·인슐린·코르티솔) / 수면 질·시간 / 만성질환·약물 복용 / 운동 강도·기술 / 측정기 정확도.
            <br />
            <strong>다음의 경우 사용 X 또는 의료 상담 필수</strong> — 18세 미만(성장기 별도 기준) / 임산부·수유부 / 당뇨·심혈관·갑상선 등 만성질환 / 거식증·폭식증 등 식이 장애 / 약물 복용 중.
            <br />
            <strong>극단적 칼로리 제한·지속적 피로·체중 강박 시</strong> — 의료 전문가(영양사·내과·정신과) 상담 / 정신건강 위기상담 <strong>1577-0199</strong> · 자살예방 <strong>109</strong> (24시간).
            <br />
            건강한 체중 관리는 단순 칼로리 계산을 넘어 <strong>영양 균형·운동·수면·정신 건강</strong>을 함께 고려해야 합니다.
          </Disclaimer>
        </section>

        {/* ── 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmi',         icon: '⚖️', name: 'BMI 계산기',                 desc: '체질량지수·키별 정상 체중·허리둘레' },
              { href: '/tools/health/weightloss',  icon: '🎯', name: '체중 감량 기간 계산기',       desc: '칼로리 적자로 목표 달성일 예측' },
              { href: '/tools/sports/pace',        icon: '🏃', name: '러닝 페이스 계산기',         desc: '마라톤 훈련 시 목표 페이스' },
              { href: '/tools/health/supplement',  icon: '💊', name: '영양제 성분 체크',          desc: '영양제 중복·상한량 체크' },
              { href: '/tools/date/age',           icon: '🎂', name: '만 나이 계산기',             desc: '나이별 건강 관리 계획' },
              { href: '/tools/life/pomodoro',      icon: '🍅', name: '뽀모도로 타이머',            desc: '식사·운동 루틴 집중 관리' },
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
