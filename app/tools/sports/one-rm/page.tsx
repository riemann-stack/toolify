import Link from 'next/link'
import OneRMClient from './OneRMClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import {
  REP_FACTOR, repFactor, rpeAdjustReps, generateWarmup, adjustLevels,
  AGE_FACTOR, AGE_BAND_LABEL, FEMALE_FACTOR, BIG3_BASE_LEVELS,
  type AgeBand, type RepFormulaKey,
} from './oneRMUtils'

export const metadata = buildMetadata({
  path: '/tools/sports/one-rm',
  title: '1RM 계산기 — 벤치·스쿼트·데드 최대 중량 + 워밍업 자동 + 성·연령 보정',
  description: '11종 운동(+기타 직접 입력)·4개 공식(Epley·Brzycki·Lombardi·O\'Conner)으로 진짜 최대 무게 추정 + RPE 보정·성·연령 수준·강도별 워밍업(2~6세트) 자동·진행 그래프.',
  keywords: ['1RM계산기', '벤치프레스1RM', '스쿼트1RM', '데드리프트1RM', '워밍업계산기', 'RPE계산기', '훈련중량계산기', '헬스1RM', '1RM공식', '체중대비1RM'],
})

const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const numCell: React.CSSProperties = { ...cell, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' }
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}

/* ── 가이드 수치 — 도구와 같은 oneRMUtils로 빌드 시 계산 (손으로 옮겨 적지 않는다) ── */
const FORMULA_KEYS: RepFormulaKey[] = ['epley', 'brzycki', 'lombardi', 'oconner']
const FORMULA_NAME: Record<RepFormulaKey, string> = { epley: 'Epley', brzycki: 'Brzycki', lombardi: 'Lombardi', oconner: 'O’Conner' }
const f1 = (v: number) => (Math.round(v * 10) / 10).toFixed(1)
const round25 = (v: number) => Math.round(v / 2.5) * 2.5

// 반복 수 → %1RM (훈련 탭의 '반복수별 중량'과 같은 역산: 1RM ÷ 배수)
const PCT_REPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15]
const PCT_ROWS = PCT_REPS.map((r) => ({
  r,
  cells: FORMULA_KEYS.map((k) => 100 / REP_FACTOR[k](r)),
  avg: 100 / repFactor('auto', r),
}))
const pctAt = (r: number) => Math.round(100 / repFactor('auto', r))
// 반복 수별 공식 간 최대 차이(%p) — 10회까지 vs 15회
const spreadAt = (r: number) => {
  const v = FORMULA_KEYS.map((k) => 100 / REP_FACTOR[k](r))
  return Math.max(...v) - Math.min(...v)
}
const SPREAD_TO10 = Math.max(...PCT_REPS.filter((r) => r <= 10).map(spreadAt))
const SPREAD_15 = spreadAt(15)

// 계산 예시 — 도구 기본값(벤치프레스 80kg × 5회, 자동 평균, 2.5kg 반올림)
const EX_W = 80
const EX_R = 5
const estimate = (load: number, reps: number) => {
  const v = FORMULA_KEYS.map((k) => load * REP_FACTOR[k](reps))
  return { v, avg: v.reduce((a, b) => a + b, 0) / v.length }
}
const EX = estimate(EX_W, EX_R)
const EX_RPE = 8
const EX_RPE_REPS = rpeAdjustReps(EX_R, EX_RPE)
const EX8 = estimate(EX_W, EX_RPE_REPS)
// 맨몸 종목: 체중 75kg + 벨트 20kg × 8회 → 전체 부하에 공식 적용 후 체중을 뺀다
const BW = 75
const BW_ADD = 20
const BW_REPS = 8
const BW_1RM_ADD = (BW + BW_ADD) * repFactor('auto', BW_REPS) - BW

// 성별·연령 보정 계수표
const AGE_BANDS = Object.keys(AGE_FACTOR) as AgeBand[]
const fmtFactor = (v: number) => {
  const m = Math.round(v * 1000)
  return `${(m / 1000).toFixed(m % 10 ? 3 : 2)}×`
}
const LV_50F = adjustLevels(BIG3_BASE_LEVELS.bench, 'female', '50-60')

// 워밍업 예시 — 1RM 100kg, 본 세트 강도별 generateWarmup 결과
const WARMUP_1RM = 100
const WARMUP_ROWS = [55, 70, 85, 95].map((pct) => ({
  pct,
  sets: generateWarmup(WARMUP_1RM, pct),
}))

const FAQ_LD = [
  {
    q: '1RM을 직접 측정해야 하나요?',
    a: '초·중급자는 추정치 사용을 권장합니다. 실제 1RM 시도는 부상 위험이 크고, 숙련된 스포터와 안정된 폼이 전제돼야 합니다. 반복 수가 10회 이하이고 마지막 반복까지 폼이 유지됐다면 추정치는 실측과 대체로 가깝게 나오며, 반복 수가 적을수록 공식 간 차이도 줄어듭니다. 다만 근지구력이 유난히 좋거나 나쁜 사람은 몇 kg씩 어긋날 수 있으니, 대회 준비처럼 정확한 값이 필요할 때만 코치 입회하에 실측하세요.',
  },
  {
    q: '반복 수는 몇 회가 가장 정확한가요?',
    a: '3~6회 범위를 권합니다. 1~2회는 그날 컨디션 영향이 크고, 10회를 넘으면 근지구력이 변수로 끼어들어 공식 간 차이가 벌어집니다(15회에서 Brzycki와 Lombardi의 배수 차이는 20%가 넘습니다). 또 공식은 마지막 한 번도 더 못 드는 상태를 가정하므로, 여유를 남겼다면 RPE 보정을 켜야 합니다.',
  },
  {
    q: 'RPE를 매번 정확히 매기기 어려운데, 그냥 RPE 10으로 가정해도 될까요?',
    a: 'RPE 10(보정 없음)이 본 도구의 기본값입니다. 확신이 없으면 보정을 끈 채 입력해도 되지만, 끝나고 &ldquo;1~2회는 더 할 수 있었다&rdquo;는 느낌이 들었다면 RPE 8~9로 보정해야 1RM이 과소 추정되지 않습니다. RPE 8이면 입력 반복에 2회를 더해 계산합니다.',
  },
  {
    q: '여성도 같은 공식을 써도 되나요?',
    a: '공식 자체는 성별과 무관하게 적용됩니다(Epley·Brzycki 모두 마찬가지). 차이는 &ldquo;수준 평가&rdquo;에서만 나타나며, 본 도구는 성별을 여성으로 고르면 남성 기준표의 70%를 기준선으로 씁니다. 연령대를 함께 고르면 연령 계수가 곱해집니다.',
  },
  {
    q: '40~50대인데 20대 기준으로 평가받으니 의욕이 떨어져요.',
    a: '연령대를 선택하면 기준선이 40대는 20대의 85%, 50대는 75%, 60대 이상은 65%로 내려갑니다. 같은 무게라도 한 단계 위 수준으로 평가될 수 있어요. 다만 이 계수는 동기 부여용 근사치이고, 절대 무게보다 지난 분기 대비 본인의 변화를 보는 편이 훨씬 의미 있습니다.',
  },
  {
    q: '워밍업은 정말 5세트나 필요한가요? 시간이 너무 오래 걸려요.',
    a: '본 도구는 본 세트 강도에 따라 세트 수를 바꿉니다. 60% 미만은 2세트(빈 봉·40%), 60~80% 미만은 3세트(60%까지), 80~95% 미만은 5세트(80% 싱글까지), 95% 이상은 90% 싱글을 더해 6세트입니다. 무거운 날일수록 관절과 신경계가 적응할 단계가 더 필요하다는 뜻이고, 가벼운 날은 훨씬 짧게 끝납니다.',
  },
  {
    q: '컨디션에 따라 1RM이 왜 이렇게 차이가 나죠?',
    a: '최대 근력은 수면·영양·스트레스·누적 피로에 따라 날마다 몇 % 안팎으로 오르내립니다. RPE 기반 훈련이 널리 쓰이는 이유도 이 변동을 그날그날 반영하기 위해서입니다. 고볼륨 기간에는 피로가 쌓여 추정치가 낮게 나오기 쉽고, 디로드로 피로가 빠진 뒤에는 오히려 회복되는 경우가 많습니다. 한 번의 값보다 &ldquo;내 기록&rdquo; 탭의 추세를 보세요.',
  },
  {
    q: '1RM을 얼마나 자주 갱신해야 하나요?',
    a: '초보자는 4~6주, 중급 이상은 8~12주마다 재추정하면 충분합니다. 프로그램 전환 직전이나 디로드 뒤가 좋은 타이밍입니다. 매주 갱신하면 하루 컨디션 변동에 흔들려 장기 추세를 놓치기 쉽습니다.',
  },
  {
    q: '풀업·딥스 같은 맨몸 운동의 1RM은 어떻게 계산하나요?',
    a: '중량 칸에는 체중을 뺀 추가 중량(벨트·조끼)을, 체중 칸에는 본인 체중을 입력하세요. 예: 체중 75kg이 20kg 벨트를 차고 8회를 했다면 20kg과 75kg을 넣습니다. 맨몸으로만 했다면 추가 중량은 0입니다. 반복 공식은 실제로 들어 올린 전체 부하(체중+추가 중량)에 적용하고, 결과는 체중을 뺀 추가 중량으로 보여 줍니다. 수준 표의 &ldquo;+0.3×&rdquo;는 체중 70kg이면 +21kg 추가가 중급이라는 뜻입니다.',
  },
  {
    q: '덤벨·머신 운동도 계산할 수 있나요?',
    a: '종목에서 &ldquo;기타&rdquo;를 고르고 &lsquo;바벨 무게 포함&rsquo;을 켠 상태(기본)로 두면 입력한 중량 그대로 계산하고, 워밍업도 빈 봉 세트 없이 %로만 짭니다. 체크를 끄면 봉 20kg(45lb)이 더해지므로 덤벨·머신은 켠 채로 두고, 목록에 없는 바벨 종목에서 원판 무게만 적었을 때만 끄세요. 덤벨은 한 손 무게를 넣든 양손 합계를 넣든 기록마다 같은 방식으로 통일해야 추세가 맞습니다. 머신은 기종마다 도르래비와 스택 무게가 달라 다른 헬스장 기록과 비교할 수 없으므로 수준 평가는 표시하지 않습니다.',
  },
  {
    q: '원판 무게만 적었는데 1RM이 20kg쯤 낮게 나와요.',
    a: '&ldquo;바벨 무게 포함&rdquo;이 기본으로 켜져 있어 입력값을 봉을 포함한 총 중량으로 봅니다. 양쪽 원판 합계만 적었다면 이 체크를 끄세요. 그러면 표준 봉 20kg(lb 모드는 45lb)을 더해 계산합니다. 헬스장 봉이 15kg·18kg 같은 변형 바라면 체크를 켠 채 실제 총 중량을 직접 입력하는 편이 정확합니다.',
  },
]

export default function OneRMPage() {
  return (
    <ToolPage width={880} slug="/tools/sports/one-rm">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />1RM &amp; 훈련 중량 계산기
      </h1>
      <p className="tp-lead">
        5RM·8RM 기록으로 <strong style={{ color: 'var(--text)' }}>진짜 최대 무게</strong> 추정 + RPE 보정과 강도별 워밍업(2~6세트) 자동.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="1RM 추정식 4종(Epley·Brzycki·Lombardi·O'Conner) 평균 · RPE는 남은 반복(RIR)으로 환산 · 강도·반복·휴식 구간은 ACSM 저항운동 입장문(2009) 범위 참고"
        sources={[
          { label: 'ACSM 입장문 — Progression Models in Resistance Training for Healthy Adults (2009, PubMed)', href: 'https://pubmed.ncbi.nlm.nih.gov/19204579/' },
          { label: 'Brzycki (1993) Strength Testing: Predicting a One-Rep Max from Reps-to-Fatigue — JOPERD', href: 'https://doi.org/10.1080/07303084.1993.10606684' },
        ]}
      />

      <OneRMClient />

      <GuideDivider />

      {/* 0. 계산 방식 + 기본값 예시 */}
      <h2 className="g-h2">이 계산기가 1RM을 구하는 순서</h2>
      <p className="g-p">
        입력한 중량과 반복 수를 네 가지 공식에 각각 넣고, 기본 설정인 &ldquo;자동 평균&rdquo;에서는 네 결과의 평균을 1RM으로 씁니다.
        RPE 보정을 켜면 공식에 넣기 전에 반복 수부터 늘립니다(RPE 10 − 입력 RPE만큼). 풀업·친업·딥스는 체중을 더한 전체 부하에 공식을 적용한 뒤
        체중을 다시 빼서 &ldquo;추가로 달 수 있는 최대 무게&rdquo;를 보여 줍니다. 화면의 큰 숫자는 선택한 반올림 단위(기본 2.5kg)로 맞춘 값입니다.
      </p>
      <div className="tableScroll">
        <table style={table}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>입력</th>
              {FORMULA_KEYS.map((k) => <th key={k} scope="col" style={{ ...headCell, textAlign: 'right' }}>{FORMULA_NAME[k]}</th>)}
              <th scope="col" style={{ ...headCell, textAlign: 'right' }}>평균 → 표시</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}>벤치 {EX_W}kg × {EX_R}회 (기본값)</td>
              {EX.v.map((v, i) => <td key={i} style={numCell}>{f1(v)}</td>)}
              <td style={numCell}><strong>{f1(EX.avg)} → {round25(EX.avg)}kg</strong></td>
            </tr>
            <tr>
              <td style={cell}>같은 세트, RPE {EX_RPE} (→ {EX_RPE_REPS}회로 계산)</td>
              {EX8.v.map((v, i) => <td key={i} style={numCell}>{f1(v)}</td>)}
              <td style={numCell}><strong>{f1(EX8.avg)} → {round25(EX8.avg)}kg</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="g-note">
        단위 kg. 맨몸 예시: 체중 {BW}kg이 {BW_ADD}kg 벨트로 풀업 {BW_REPS}회 → ({BW}+{BW_ADD})kg × 4공식 평균 배수 − {BW}kg = 추가 중량 약 {f1(BW_1RM_ADD)}kg.
      </p>
      <p className="g-p">
        같은 세트라도 &ldquo;두 번은 더 할 수 있었다&rdquo;면 추정 1RM이 약 {f1(EX8.avg - EX.avg)}kg 올라갑니다. 반대로 공식 간 폭(위 예시에서
        {' '}{f1(Math.min(...EX.v))}~{f1(Math.max(...EX.v))}kg)은 추정 자체의 불확실성이라, 이 범위 안의 차이에 의미를 두지 않는 편이 좋습니다.
      </p>

      {/* 1. 공식 4가지 비교 */}
      <h2 className="g-h2">1RM 추정 공식 4가지 비교</h2>
      <p className="g-p">
        1RM은 직접 측정이 어렵고 부상 위험이 크기 때문에, 서브맥시멀 세트(2~10회)의 수행 기록으로 추정하는 것이 일반적입니다. 대표적인 4가지 공식은
        각기 다른 데이터에서 유도되어 결과가 조금씩 다릅니다. 모든 공식에서 1회는 정의상 그 무게가 곧 1RM입니다.
      </p>
      <div className="tableScroll">
        <table style={table}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>공식</th>
              <th scope="col" style={headCell}>식</th>
              <th scope="col" style={headCell}>특징</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}><strong>Epley (1985)</strong></td>
              <td style={cell}>w × (1 + r/30)</td>
              <td style={cell}>가장 널리 쓰임. 10회 미만에서는 Brzycki보다 조금 높게 나오고 10회에서 같아짐.</td>
            </tr>
            <tr>
              <td style={cell}><strong>Brzycki (1993)</strong></td>
              <td style={cell}>w × 36 / (37 − r)</td>
              <td style={cell}>2~4회에서는 네 공식 중 가장 낮게 나옴. 반복이 많아질수록 배수가 가파르게 커져 10회를 넘으면 가장 높게 나옴.</td>
            </tr>
            <tr>
              <td style={cell}><strong>Lombardi (1989)</strong></td>
              <td style={cell}>w × r<sup>0.1</sup></td>
              <td style={cell}>지수형. 12회 이상 고반복에서 가장 보수적인 결과.</td>
            </tr>
            <tr>
              <td style={cell}><strong>O&apos;Conner (1989)</strong></td>
              <td style={cell}>w × (1 + r/40)</td>
              <td style={cell}>5~10회 구간에서 가장 낮게 나옴. 안전 마진을 두고 싶을 때.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="g-h3">반복 수별 %1RM — 공식이 서로 얼마나 벌어지나</h3>
      <p className="g-p">
        아래 표는 &ldquo;그 무게로 r회를 끝까지 했다면 1RM의 몇 %였는가&rdquo;를 공식별로 역산한 값입니다. 훈련 탭의 &ldquo;반복수별 중량&rdquo;이
        바로 이 비율(자동 평균 기준)로 계산됩니다. 10회까지는 네 공식의 차이가 {f1(SPREAD_TO10)}%p 이내지만, 15회에서는 {f1(SPREAD_15)}%p까지 벌어집니다.
      </p>
      <div className="tableScroll">
        <table style={table}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>반복</th>
              {FORMULA_KEYS.map((k) => <th key={k} scope="col" style={{ ...headCell, textAlign: 'right' }}>{FORMULA_NAME[k]}</th>)}
              <th scope="col" style={{ ...headCell, textAlign: 'right' }}>자동 평균</th>
            </tr>
          </thead>
          <tbody>
            {PCT_ROWS.map((row) => (
              <tr key={row.r}>
                <td style={cell}><strong>{row.r}회</strong></td>
                {row.cells.map((v, i) => <td key={i} style={numCell}>{f1(v)}%</td>)}
                <td style={numCell}><strong>{f1(row.avg)}%</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12 }}>
        <Callout tone="tip" title="평균값 사용 권장">
          한 공식만 믿기보다 4가지 평균을 쓰면 특정 공식의 치우침이 상쇄됩니다. 추정용 세트는 <strong>3~6회</strong>가 좋습니다. 최대 근력에 가까운 조건이면서
          하루 컨디션에 덜 흔들리고, 공식 간 차이도 작은 구간입니다.
        </Callout>
      </div>

      {/* 2. RPE 보정 가이드 */}
      <h2 className="g-h2">RPE / RIR — 체감 강도 보정의 원리</h2>
      <p className="g-p">
        모든 1RM 공식은 <strong>&ldquo;마지막 한 번도 더 못 드는 상태(AMRAP)&rdquo;</strong>를 가정합니다. 하지만 실제 훈련에서는 1~3회 여유를 두고
        끝내는 경우가 많죠. 그대로 공식에 넣으면 1RM이 과소 추정됩니다. 저항운동용 RPE 척도는 &ldquo;남은 반복 수(RIR, Repetitions in Reserve)&rdquo;로
        강도를 매기는 방식이 쓰이며(Zourdos 외, 2016), 본 도구는 이 여유분을 반복 수에 더해 보정합니다.
      </p>
      <div className="tableScroll">
        <table style={table}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>RPE</th>
              <th scope="col" style={headCell}>RIR (남은 횟수)</th>
              <th scope="col" style={headCell}>체감</th>
              <th scope="col" style={headCell}>본 도구 보정</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}><strong style={{ color: 'var(--red-600)' }}>10</strong></td>
              <td style={cell}>0회 (AMRAP)</td>
              <td style={cell}>한 번도 더 불가능</td>
              <td style={cell}>보정 없음 (기준)</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: 'var(--amber-600)' }}>9</strong></td>
              <td style={cell}>1회</td>
              <td style={cell}>한 번 더 가능했음</td>
              <td style={cell}>+1회로 추정</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: 'var(--amber-600)' }}>8</strong></td>
              <td style={cell}>2회</td>
              <td style={cell}>2회 더 가능했음</td>
              <td style={cell}>+2회로 추정</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: 'var(--emerald-600)' }}>7</strong></td>
              <td style={cell}>3회</td>
              <td style={cell}>3회 더 가능, 꽤 가벼움</td>
              <td style={cell}>+3회로 추정</td>
            </tr>
            <tr>
              <td style={cell}><strong style={{ color: 'var(--emerald-600)' }}>6</strong></td>
              <td style={cell}>4회 이상 (척도상 RPE 5~6 = 4~6회)</td>
              <td style={cell}>워밍업 수준</td>
              <td style={cell}>+4회 (참고용)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="g-note">
        예) {EX_W}kg × {EX_R}회를 RPE {EX_RPE}로 끝냈다면 {EX_RPE_REPS}회까지 가능했다고 보고 계산합니다(위 예시 표 두 번째 줄). 반복 수만 보정하므로 어떤 공식과도 호환됩니다.
        RPE 6~7처럼 여유가 큰 세트는 &ldquo;남은 횟수&rdquo; 자체를 가늠하기 어려워 오차가 커지므로, 1RM 추정용 세트는 RPE 8 이상으로 하는 편이 좋습니다.
      </p>

      {/* 3. 성별·연령 보정 */}
      <h2 className="g-h2">성별·연령별 수준 보정 — 같은 무게라도 평가가 달라집니다</h2>
      <p className="g-p">
        상대적 근력은 절대 무게가 아니라 <strong>체중·성별·연령에 대한 비율</strong>로 봐야 공정합니다. 본 도구는 20대 남성 기준 체중 대비 배수표에
        아래 계수(성별 계수 × 연령 계수)를 곱해 기준선을 낮춥니다. 이 계수는 공인 규격이 아니라 체급·연령별 기록 분포를 단순화한 근사치입니다.
      </p>
      <div className="tableScroll">
        <table style={table}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>구분</th>
              {AGE_BANDS.map((b) => <th key={b} scope="col" style={{ ...headCell, textAlign: 'right' }}>{AGE_BAND_LABEL[b]}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}><strong>남성 보정</strong></td>
              {AGE_BANDS.map((b) => <td key={b} style={numCell}>{fmtFactor(AGE_FACTOR[b])}</td>)}
            </tr>
            <tr>
              <td style={cell}><strong>여성 보정</strong></td>
              {AGE_BANDS.map((b) => <td key={b} style={numCell}>{fmtFactor(AGE_FACTOR[b] * FEMALE_FACTOR)}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="g-note">
        예) 50대 여성의 벤치프레스 기준선은 초보 {LV_50F.초보}× · 중급 {LV_50F.중급}× · 상급 {LV_50F.상급}× · 엘리트 {LV_50F.엘리트}×로 바뀝니다. 체중의 0.7배를 들면
        <strong> 상급</strong>이며, 이는 20대 남성 기준으로 약 {(0.7 / (AGE_FACTOR['50-60'] * FEMALE_FACTOR)).toFixed(2)}×에 해당합니다.
      </p>

      {/* 4. 워밍업 */}
      <h2 className="g-h2">워밍업 세트 — 본 세트 강도에 따라 2~6세트</h2>
      <p className="g-p">
        무거운 본 세트 전에 점진적으로 중량을 올리면 관절·인대가 하중에 적응하고, 그날 폼과 컨디션을 가벼운 무게에서 먼저 확인할 수 있습니다.
        &ldquo;훈련 중량&rdquo; 탭에서 본 세트 강도(%1RM)를 고르면 아래 기본 틀에서 필요한 만큼만 잘라 워밍업을 만듭니다.
      </p>
      <div className="tableScroll">
        <table style={table}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>세트</th>
              <th scope="col" style={headCell}>강도</th>
              <th scope="col" style={headCell}>반복</th>
              <th scope="col" style={headCell}>휴식</th>
              <th scope="col" style={headCell}>목적</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>1</td><td style={cell}>빈 봉 (20kg)</td><td style={cell}>10회</td><td style={cell}>60초</td><td style={cell}>폼 점검·근육 활성화</td></tr>
            <tr><td style={cell}>2</td><td style={cell}>40%</td><td style={cell}>8회</td><td style={cell}>60초</td><td style={cell}>관절 가동 범위 확보</td></tr>
            <tr><td style={cell}>3</td><td style={cell}>60%</td><td style={cell}>5회</td><td style={cell}>90초</td><td style={cell}>중량감 적응</td></tr>
            <tr><td style={cell}>4</td><td style={cell}>70%</td><td style={cell}>3회</td><td style={cell}>2분</td><td style={cell}>본 세트 직전 적응</td></tr>
            <tr><td style={cell}>5</td><td style={cell}>80%</td><td style={cell}>1회</td><td style={cell}>3분</td><td style={cell}>예열 싱글</td></tr>
            <tr><td style={cell}>6</td><td style={cell}>90%</td><td style={cell}>1회</td><td style={cell}>4분</td><td style={cell}>본 세트 95% 이상일 때만 추가</td></tr>
          </tbody>
        </table>
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        실제로 1RM {WARMUP_1RM}kg인 사람이 본 세트 강도를 바꾸면 도구가 내놓는 워밍업은 다음과 같습니다. 60% 미만은 2세트, 60~80% 미만은 3세트,
        80~95% 미만은 5세트, 95% 이상은 6세트입니다. 1RM이 가벼워 빈 봉(20kg)보다 가벼운 % 세트가 나오면 그 세트는 빼고 번호를 다시 매깁니다.
      </p>
      <div className="tableScroll">
        <table style={table}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>본 세트</th>
              <th scope="col" style={headCell}>워밍업 (중량 × 반복)</th>
            </tr>
          </thead>
          <tbody>
            {WARMUP_ROWS.map((row) => (
              <tr key={row.pct}>
                <td style={{ ...cell, whiteSpace: 'nowrap' }}><strong>{row.pct}%</strong> ({WARMUP_1RM * row.pct / 100}kg)</td>
                <td style={cell}>{row.sets.map((w) => `${w.weightKg}kg×${w.reps}`).join(' → ')} ({row.sets.length}세트)</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">맨몸 종목(풀업·친업·딥스)은 체중이 곧 하중이라 워밍업 세트를 자동으로 만들지 않습니다. 가벼운 반동 없는 반복과 밴드 보조로 대신하세요.</p>

      {/* 5. 종목별 체중 대비 수준 기준표 */}
      <h2 className="g-h2">11종 운동 체중 대비 수준 기준표</h2>
      <p className="g-p">
        20대 남성 기준 1RM ÷ 체중 배수입니다. 도구에서 성별·연령을 선택하면 위 보정 계수가 곱해진 기준으로 평가합니다. 맨몸 종목은 체중에 더해
        달 수 있는 추가 중량의 배수입니다.
      </p>
      <div className="tableScroll">
        <table style={table}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>종목</th>
              <th scope="col" style={headCell}>초보</th>
              <th scope="col" style={headCell}>중급</th>
              <th scope="col" style={headCell}>상급</th>
              <th scope="col" style={headCell}>엘리트</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>벤치프레스</td><td style={cell}>0.5×</td><td style={cell}>1.0×</td><td style={cell}>1.25×</td><td style={cell}>1.5×+</td></tr>
            <tr><td style={cell}>인클라인 벤치</td><td style={cell}>0.4×</td><td style={cell}>0.85×</td><td style={cell}>1.05×</td><td style={cell}>1.3×+</td></tr>
            <tr><td style={cell}>스쿼트</td><td style={cell}>0.75×</td><td style={cell}>1.25×</td><td style={cell}>1.5×</td><td style={cell}>2.0×+</td></tr>
            <tr><td style={cell}>프론트 스쿼트</td><td style={cell}>0.6×</td><td style={cell}>1.0×</td><td style={cell}>1.25×</td><td style={cell}>1.6×+</td></tr>
            <tr><td style={cell}>데드리프트</td><td style={cell}>1.0×</td><td style={cell}>1.5×</td><td style={cell}>2.0×</td><td style={cell}>2.5×+</td></tr>
            <tr><td style={cell}>루마니안 데드</td><td style={cell}>0.85×</td><td style={cell}>1.3×</td><td style={cell}>1.7×</td><td style={cell}>2.1×+</td></tr>
            <tr><td style={cell}>오버헤드프레스</td><td style={cell}>0.35×</td><td style={cell}>0.65×</td><td style={cell}>0.85×</td><td style={cell}>1.1×+</td></tr>
            <tr><td style={cell}>바벨로우</td><td style={cell}>0.5×</td><td style={cell}>0.9×</td><td style={cell}>1.15×</td><td style={cell}>1.4×+</td></tr>
            <tr><td style={cell}>풀업 (체중+α)</td><td style={cell}>+0.05×</td><td style={cell}>+0.25×</td><td style={cell}>+0.5×</td><td style={cell}>+0.75×</td></tr>
            <tr><td style={cell}>친업 (체중+α)</td><td style={cell}>+0.05×</td><td style={cell}>+0.3×</td><td style={cell}>+0.55×</td><td style={cell}>+0.8×</td></tr>
            <tr><td style={cell}>딥스 (체중+α)</td><td style={cell}>+0.05×</td><td style={cell}>+0.3×</td><td style={cell}>+0.55×</td><td style={cell}>+0.85×</td></tr>
          </tbody>
        </table>
      </div>
      <p className="g-note">
        예) 70kg 남성이 벤치 87.5kg = 1.25× → 상급. 풀업 체중+0.3× (예: 70kg + 21kg) → 중급. 기준표는 헬스 커뮤니티에서 널리 쓰이는 체중 대비 기준을
        단순화한 것으로, 역도·파워리프팅 연맹의 공인 등급이 아닙니다.
      </p>

      {/* 6. 훈련 강도 가이드 */}
      <h2 className="g-h2">훈련 강도 완전 가이드</h2>
      <p className="g-p">
        목표에 따라 1RM 대비 사용 중량과 반복 수를 조절해야 합니다. ACSM의 저항운동 입장문(2009)은 초·중급자에게 1RM의 60~70% 부하로 8~12회를,
        중·상급자에게는 1~12RM 범위를 주기화해 쓰되 최대 근력에는 1~6RM의 무거운 부하와 세트 사이 3~5분 휴식을 제시합니다. 아래 표는 그 범위를
        강도별로 나눈 것이며, 반복 수는 위 %1RM 표와 대체로 맞아떨어집니다(예: 80%는 자동 평균으로 약 8회). 같은 %에서 가능한 반복 수는 사람과 종목(예: 스쿼트와 벤치)에 따라 꽤 달라서, 표는 출발점으로 쓰고 실제 RPE를 보며 조정하세요.
      </p>
      <div className="tableScroll">
        <table style={table}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>강도</th>
              <th scope="col" style={headCell}>반복</th>
              <th scope="col" style={headCell}>목표</th>
              <th scope="col" style={headCell}>휴식</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong style={{ color: 'var(--red-600)' }}>95~100%</strong></td><td style={cell}>1~2회</td><td style={cell}>최대 근력 테스트</td><td style={cell}>3~5분</td></tr>
            <tr><td style={cell}><strong style={{ color: 'var(--red-600)' }}>90%</strong></td><td style={cell}>2~3회</td><td style={cell}>최대 근력</td><td style={cell}>3~5분</td></tr>
            <tr><td style={cell}><strong style={{ color: 'var(--amber-600)' }}>85%</strong></td><td style={cell}>3~5회</td><td style={cell}>근력·근비대</td><td style={cell}>2~3분</td></tr>
            <tr><td style={cell}><strong style={{ color: 'var(--amber-600)' }}>80%</strong></td><td style={cell}>6~8회</td><td style={cell}>근비대 (최적)</td><td style={cell}>90초~2분</td></tr>
            <tr><td style={cell}><strong style={{ color: 'var(--accent-ink)' }}>75%</strong></td><td style={cell}>8~10회</td><td style={cell}>근비대</td><td style={cell}>90초</td></tr>
            <tr><td style={cell}><strong style={{ color: 'var(--emerald-600)' }}>70%</strong></td><td style={cell}>10~12회</td><td style={cell}>근비대·지구력</td><td style={cell}>60~90초</td></tr>
            <tr><td style={cell}><strong style={{ color: 'var(--emerald-600)' }}>65%</strong></td><td style={cell}>12~15회</td><td style={cell}>근지구력</td><td style={cell}>60초</td></tr>
            <tr><td style={cell}><strong style={{ color: 'var(--emerald-600)' }}>60%</strong></td><td style={cell}>15회+</td><td style={cell}>워밍업·회복</td><td style={cell}>30~60초</td></tr>
          </tbody>
        </table>
      </div>

      {/* 7. 한국 헬스장 환경 */}
      <h2 className="g-h2">한국 헬스장 환경 — 원판·바벨 가이드</h2>
      <p className="g-p">
        한국 일반 헬스장은 미국·유럽의 파워리프팅 짐과 환경이 조금 다릅니다. 계산기에 넣는 중량이 실제 봉·원판 구성과 맞는지 먼저 확인하세요.
      </p>
      <div style={card}>
        <ul className="g-list" style={{ margin: 0 }}>
          <li><strong>바벨</strong> — 대부분 20kg 올림픽 바. 일부 헬스장은 15kg 여성용 바나 가벼운 변형 바도 비치합니다. 봉 무게가 다르면 &ldquo;바벨 무게 포함&rdquo;을 켠 채 총 중량을 직접 넣으세요.</li>
          <li><strong>원판</strong> — 25/20/15/10/5/2.5/1.25kg가 표준. 고무 범퍼판은 데드리프트·클린 가능 구역에만 있는 경우가 많습니다.</li>
          <li><strong>스미스 머신</strong> — 봉이 레일에 고정돼 균형 부담이 적고, 기종에 따라 봉 무게를 상쇄하는 장치도 있어 프리웨이트 1RM과 직접 비교할 수 없습니다.</li>
          <li><strong>플랫폼</strong> — 전용 데드리프트 플랫폼이 있는 곳은 드물고, 고중량 낙하를 금지하는 곳이 많습니다. 웨이트존 규칙을 확인하세요.</li>
          <li><strong>스포터</strong> — 모르는 사람에게 보조를 부탁하기 어려운 환경이라면, 90% 이상 시도 시 파워랙 세이프티 바 높이를 먼저 맞춰 두세요.</li>
        </ul>
      </div>

      {/* 8. 프로그램 */}
      <h2 className="g-h2">1RM을 쓰는 인기 프로그램 — 어떤 걸 골라야 할까?</h2>
      <p className="g-p">
        추정 1RM은 퍼센트 기반 프로그램의 작업 중량을 정하는 출발점입니다. 반면 초보자용 선형 증량 프로그램은 1RM 없이 &ldquo;지난번보다 조금 더&rdquo;로
        진행하므로, 1RM은 정체가 온 뒤 다음 프로그램을 설계할 때 쓰입니다.
      </p>
      <div className="tableScroll">
        <table style={table}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>프로그램</th>
              <th scope="col" style={headCell}>대상</th>
              <th scope="col" style={headCell}>구조</th>
              <th scope="col" style={headCell}>1RM 활용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}><strong>StrongLifts 5×5</strong></td>
              <td style={cell}>초보</td>
              <td style={cell}>주 3회 · 5세트 5회</td>
              <td style={cell}>1RM 불필요. 가벼운 무게(빈 봉 수준)에서 시작해 성공할 때마다 증량</td>
            </tr>
            <tr>
              <td style={cell}><strong>Starting Strength</strong></td>
              <td style={cell}>초보</td>
              <td style={cell}>주 3회 · 3세트 5회</td>
              <td style={cell}>1RM 불필요. 매 세션 선형 증량, 정체 후 다음 단계 설계에 1RM 활용</td>
            </tr>
            <tr>
              <td style={cell}><strong>5/3/1 (Wendler)</strong></td>
              <td style={cell}>중급</td>
              <td style={cell}>4주 사이클 · 주요 4종목 + 보조</td>
              <td style={cell}>트레이닝 맥스 = 1RM × 90%, 주차별 그 65~95%로 본 세트</td>
            </tr>
            <tr>
              <td style={cell}><strong>nSuns 5/3/1 LP</strong></td>
              <td style={cell}>중급+</td>
              <td style={cell}>주 4~6회 · 메인 9세트</td>
              <td style={cell}>트레이닝 맥스의 65~95% 피라미드, 마지막 AMRAP 결과로 매주 조정</td>
            </tr>
            <tr>
              <td style={cell}><strong>Smolov Jr.</strong></td>
              <td style={cell}>중급+</td>
              <td style={cell}>3주 · 주 4회 단기 강화</td>
              <td style={cell}>1RM의 70%(6×6)·75%(7×5)·80%(8×4)·85%(10×3), 주마다 중량 추가</td>
            </tr>
            <tr>
              <td style={cell}><strong>PPL (Push/Pull/Legs)</strong></td>
              <td style={cell}>모든 레벨</td>
              <td style={cell}>주 6회 · 분할</td>
              <td style={cell}>8~12회 근비대 위주 — 자동 평균 기준 1RM의 약 {pctAt(12)}~{pctAt(8)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12 }}>
        <Callout tone="tip" title="운동 경력 6개월 미만이라면">
          1RM 기반 프로그램보다 <strong>폼 익히기 + 8~12회 3~4세트</strong>가 먼저입니다. 폼이 흔들리는 시기의 추정 1RM은 근력보다 기술 수준을 반영하기 때문에,
          일관된 훈련을 몇 달 이어 간 뒤 추정해야 쓸모 있는 기준이 됩니다.
        </Callout>
      </div>

      {/* 9. 원판 조합 빠른 참조표 */}
      <h2 className="g-h2">원판 조합 빠른 참조표</h2>
      <p className="g-p">
        20kg 올림픽 바벨 기준, 한쪽에 끼울 원판 조합입니다. 한쪽 원판 = (총 중량 − 20) ÷ 2로 구한 뒤 큰 원판부터 채웁니다.
      </p>
      <div className="tableScroll">
        <table style={table}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>총 중량</th>
              <th scope="col" style={headCell}>한쪽 원판</th>
              <th scope="col" style={headCell}>총 중량</th>
              <th scope="col" style={headCell}>한쪽 원판</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>40kg</strong></td><td style={cell}>10</td><td style={cell}><strong>100kg</strong></td><td style={cell}>20 + 20</td></tr>
            <tr><td style={cell}><strong>50kg</strong></td><td style={cell}>15</td><td style={cell}><strong>110kg</strong></td><td style={cell}>25 + 20</td></tr>
            <tr><td style={cell}><strong>60kg</strong></td><td style={cell}>20</td><td style={cell}><strong>120kg</strong></td><td style={cell}>25 + 25</td></tr>
            <tr><td style={cell}><strong>70kg</strong></td><td style={cell}>25</td><td style={cell}><strong>140kg</strong></td><td style={cell}>20 × 3</td></tr>
            <tr><td style={cell}><strong>80kg</strong></td><td style={cell}>15 + 15</td><td style={cell}><strong>160kg</strong></td><td style={cell}>25 + 25 + 20</td></tr>
            <tr><td style={cell}><strong>90kg</strong></td><td style={cell}>20 + 15</td><td style={cell}><strong>180kg</strong></td><td style={cell}>20 × 4</td></tr>
          </tbody>
        </table>
      </div>
      <p className="g-note">
        원판은 무거운 것부터 안쪽에 끼우고 양쪽을 대칭으로 맞추세요. 2.5kg·1.25kg 소형 원판을 쓰면 총 중량을 2.5~5kg 단위로 올릴 수 있습니다.
      </p>

      {/* 10. 흔한 실수 */}
      <h2 className="g-h2">추정 1RM이 어긋나는 흔한 이유</h2>
      <ul className="g-list">
        <li><strong>폼이 무너진 반복까지 셈</strong> — 반동으로 올린 마지막 1~2회를 넣으면 반복 수가 부풀어 1RM이 높게 나옵니다. 가동 범위를 끝까지 채운 반복만 세세요.</li>
        <li><strong>고반복 세트로 추정</strong> — 12회 이상은 근지구력 비중이 커서 공식마다 값이 크게 갈립니다. 1RM이 궁금하면 3~6회로 다시 재세요.</li>
        <li><strong>봉 무게 누락·중복</strong> — 원판만 적고 &ldquo;바벨 무게 포함&rdquo;을 켜 두면 20kg 낮게, 총 중량을 적고 끄면 20kg 높게 나옵니다.</li>
        <li><strong>세트 간 피로</strong> — 여러 세트 중 마지막 세트 기록은 누적 피로로 낮게 나옵니다. 가장 신선한 첫 본 세트를 쓰세요.</li>
        <li><strong>종목 변형</strong> — 박스 스쿼트, 터치 앤 고 벤치, 스모 데드 등은 같은 종목이라도 기준표와 직접 비교하기 어렵습니다.</li>
      </ul>

      {/* 11. 안전 주의사항 */}
      <h2 className="g-h2">안전 주의사항</h2>
      <Callout tone="warn" title="고중량 시도 전에">
        <ul className="g-list" style={{ margin: 0 }}>
          <li><strong>워밍업 필수</strong> — 점진적으로 중량을 올려 본 세트에 들어가세요.</li>
          <li><strong>스쿼트·벤치는 스포터 또는 세이프티</strong> — 90% 이상 시도 시 혼자 하지 마세요.</li>
          <li><strong>폼 붕괴 = 실패</strong> — 반복 수보다 동작의 일관성이 중요합니다.</li>
          <li><strong>통증은 즉시 중단</strong> — 관절·허리 통증은 부상 신호입니다. 운동 후에도 지속되면 정형외과 또는 재활의학과 전문의와 상담하세요.</li>
        </ul>
        <p className="g-note" style={{ marginBottom: 0 }}>
          본 도구는 부상 진단·보충제·영양 상담·코칭을 대신하지 않습니다. 심혈관 질환이나 고혈압이 있다면 최대 근력 시도 전에 의사와 먼저 상의하세요.
        </p>
      </Callout>

      {/* 12. FAQ */}
      <Faq items={FAQ_LD} />

      {/* 13. 관련 도구 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/health/bmi" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>⚖️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>BMI 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>체질량지수 비만도 확인</div>
        </Link>
        <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>하루 권장 칼로리 계산</div>
        </Link>
        <Link href="/tools/health/weightloss" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎯</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>체중 감량 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>칼로리 적자로 달성일 예측</div>
        </Link>
        <Link href="/tools/sports/pace" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>러닝 페이스 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>마라톤 목표 기록별 페이스</div>
        </Link>
      </div>
    </ToolPage>
  )
}
