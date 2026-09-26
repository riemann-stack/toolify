import Link from 'next/link'
import PaceClient from './PaceClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import RelatedTools from '@/components/RelatedTools'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import {
  secToPace, secToPaceTenth, secToHms, paceSecToKph, kphToPaceSec, subGoalPaceSec, negativeSplit, laneLapMeters,
  MARATHON_GOALS, FULL_KM, HALF_KM, MILE_KM, TRACK_LAP_KM, NEG_SPLIT_DELTA_SEC,
} from './paceUtils'
import {
  buildSegments, fillStrategy, calcPlan, timeAtDistance, gradeAdjustSec, applyGrade, GRADE_UP_SEC, GRADE_DOWN_SEC,
} from './racePlanUtils'

export const metadata = buildMetadata({
  path: '/tools/sports/pace',
  title: '러닝 페이스 계산기 — 마라톤 완주 시간·트레드밀·구간 스플릿·레이스 플랜',
  description: '페이스 ↔ 완주 시간 양방향 변환 + 트레드밀 시속 환산과 400m 트랙 랩타임, 5km·10km·하프·풀 구간 스플릿 자동 계산. 레이스 플랜 탭에서 구간별 페이스 분배·코스 고도 보정·지점별 통과 예상 시각까지.',
  keywords: ['러닝페이스계산기', '마라톤페이스계산기', '트레드밀시속변환', '달리기페이스', '마라톤완주시간', '400m트랙페이스', '러닝스플릿', '서브3 페이스', '서브4 페이스', '구간 스플릿', '네거티브 스플릿',
    '레이스 페이스 플래너', '마라톤 페이스 분배', '구간별 페이스', '코스 고도 페이스', '오르막 페이스', '통과 예상 시각', 'GAP 페이스', '페이스 밴드'],
})

/* ── 가이드 표·예시 숫자 — 계산기와 같은 paceUtils·racePlanUtils로 빌드 시 계산(손으로 치지 않는다) ── */
const kph1 = (ps: number) => paceSecToKph(ps).toFixed(1)
/** 소수 초까지 — 목표 시간 ÷ 거리의 정확값 표기용(4:15.95) */
const paceExact = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = sec - m * 60
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(2)}`
}
const signed = (sec: number) => {
  const r = Math.round(sec)
  return r === 0 ? '0:00' : `${r > 0 ? '+' : '−'}${secToPace(Math.abs(r))}`
}

// 표 1 — 페이스별 완주 시간
const PACE_ROWS = [180, 210, 240, 270, 300, 330, 360, 390, 420, 450].map(ps => ({
  pace: secToPace(ps), kph: kph1(ps),
  k5: secToHms(ps * 5), k10: secToHms(ps * 10), half: secToHms(ps * HALF_KM), full: secToHms(ps * FULL_KM),
}))
// 본문 예시 — 5:30/km
const EX_PS = 330
const EX = {
  pace: secToPace(EX_PS),
  raw: (EX_PS * FULL_KM).toLocaleString('ko-KR', { maximumFractionDigits: 2 }),
  full: secToHms(EX_PS * FULL_KM),
  kph: kph1(EX_PS),
  lap: secToPace(EX_PS * TRACK_LAP_KM),
  mile: secToPace(EX_PS * MILE_KM),
  tailHalf: Math.round(EX_PS * (HALF_KM - 21)),
  tailFull: Math.round(EX_PS * (FULL_KM - 42)),
}

// 표 2 — 목표 기록별 필요 페이스: 반올림(완주 시간 → 페이스 탭 표시) vs '서브' 내림(빠른 입력 칩)
const GOALS = [
  ...MARATHON_GOALS.map(g => ({ label: `풀 ${g.label}`, km: FULL_KM, goalSec: g.goalSec })),
  { label: '하프 서브1:45', km: HALF_KM, goalSec: 1.75 * 3600 },
  { label: '하프 서브2', km: HALF_KM, goalSec: 2 * 3600 },
  { label: '10km 서브50', km: 10, goalSec: 50 * 60 },
  { label: '10km 서브60', km: 10, goalSec: 60 * 60 },
  { label: '5km 서브25', km: 5, goalSec: 25 * 60 },
  { label: '5km 서브30', km: 5, goalSec: 30 * 60 },
]
const GOAL_ROWS = GOALS.map(g => {
  const exact = g.goalSec / g.km
  const shown = Math.round(exact)
  const sub = subGoalPaceSec(g.goalSec, g.km)
  const shownFinishSec = Math.round(shown * g.km)
  return {
    label: g.label,
    exact: paceExact(exact),
    shown: secToPace(shown),
    shownFinish: secToHms(shown * g.km),
    shownNote: shownFinishSec > g.goalSec ? '목표 초과' : shownFinishSec === g.goalSec ? '목표와 같음(미만 아님)' : '',
    sub: secToPace(sub),
    subFinish: secToHms(sub * g.km),
  }
})
const SUB3 = GOAL_ROWS[0]
const SUB4_SEC = subGoalPaceSec(4 * 3600, FULL_KM)
const SUB4 = {
  exact: (4 * 3600 / FULL_KM).toFixed(2),
  pace: secToPace(SUB4_SEC), kph: kph1(SUB4_SEC), finish: secToHms(SUB4_SEC * FULL_KM),
  slower: secToPace(SUB4_SEC + 1), slowerFinish: secToHms((SUB4_SEC + 1) * FULL_KM),
}

// 표 3 — 실제 이동 거리가 공식 거리보다 길 때 시계에 보여야 할 평균 페이스.
// 표 2의 '서브' 페이스와 같은 함수(subGoalPaceSec)를 늘어난 거리에 적용 — 초 단위 내림이라 반올림처럼 목표를 넘는 칸이 없다
const FULL_M = FULL_KM * 1000
const SCPF_M = Math.round(FULL_M * 0.001)
const EXTRA_RATES = [0.005, 0.01]
const EXTRA = EXTRA_RATES.map(e => ({ pct: (e * 100).toFixed(1).replace(/\.0$/, ''), m: Math.round(FULL_M * e) }))
const GPS_ROWS = MARATHON_GOALS.map(g => {
  const p = subGoalPaceSec(g.goalSec, FULL_KM)
  const watchSec = EXTRA_RATES.map(e => subGoalPaceSec(g.goalSec, FULL_KM * (1 + e)))
  return {
    label: g.label, pace: secToPace(p), paceFinish: secToHms(p * FULL_KM),
    watch: watchSec.map(secToPace),
    watchFinish: watchSec.map((w, i) => secToHms(w * FULL_KM * (1 + EXTRA_RATES[i]))),
  }
})
const GPS_SUB4 = GPS_ROWS[2]

// 표 4 — 트레드밀 시속 ↔ 페이스
const KPH_ROWS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(k => {
  const ps = kphToPaceSec(k)
  return { kph: k.toFixed(1), pace: secToPace(ps), lap: secToPace(ps * TRACK_LAP_KM), k10: secToHms(ps * 10), full: secToHms(ps * FULL_KM) }
})

// 트랙 3레인 예시 (World Athletics 레인 규격) — 레인별 전체 표는 인터벌 훈련 계산기 페이지에 둔다
const LANE3_M = laneLapMeters(3)
const LANE3_AT_120 = secToPace(120 / (LANE3_M / 1000)) // 3레인에서 2:00 랩 = 실제 km 페이스

// 네거티브 스플릿 결과 카드 예시 — 5:30/km 풀
const NS = negativeSplit(EX_PS, FULL_KM)
const NS_EX = NS && {
  front: secToPaceTenth(NS.frontSec), back: secToPaceTenth(NS.backSec),
  // 후반은 (반올림한 완주 − 반올림한 전반)으로 표기해 두 구간 합이 완주 시간과 초 단위까지 맞게 한다
  frontT: secToHms(NS.frontSec * NS.halfKm),
  backT: secToHms(Math.round(EX_PS * FULL_KM) - Math.round(NS.frontSec * NS.halfKm)),
}

// 표 5 — 레이스 플랜 탭: 풀 서브4 기준 페이스로 균등 vs 네거티브 통과 시간
const PLAN_SEGS = buildSegments(FULL_KM)
const PLAN_DISTS = PLAN_SEGS.map(s => s.dist)
const PLAN_ZERO = PLAN_SEGS.map(() => 0)
const planEven = calcPlan(PLAN_SEGS, fillStrategy(SUB4_SEC, PLAN_SEGS.length, 'even', PLAN_DISTS), PLAN_ZERO, 0, null)
const planNeg = calcPlan(PLAN_SEGS, fillStrategy(SUB4_SEC, PLAN_SEGS.length, 'negative', PLAN_DISTS), PLAN_ZERO, 0, null)
const PLAN = {
  n: PLAN_SEGS.length,
  tail: PLAN_SEGS[PLAN_SEGS.length - 1].dist,
  first: secToPace(planNeg.rows[0].paceSec),
  lastFull: secToPace(planNeg.rows[PLAN_SEGS.length - 2].paceSec),
  halfEven: secToHms(timeAtDistance(planEven.rows, HALF_KM) ?? 0),
  halfNeg: secToHms(timeAtDistance(planNeg.rows, HALF_KM) ?? 0),
  finish: secToHms(planNeg.finishSec),
}
const PLAN_ROWS = [5, 10, 15, 20, HALF_KM, 25, 30, 35, 40, FULL_KM].map(km => {
  const e = timeAtDistance(planEven.rows, km) ?? 0
  const n = timeAtDistance(planNeg.rows, km) ?? 0
  return { label: km === HALF_KM ? '하프 (21.0975km)' : km === FULL_KM ? '완주 (42.195km)' : `${km}km`, even: secToHms(e), neg: secToHms(n), diff: signed(n - e) }
})

// 표 6 — 경사 보정 (기준 6:00/km). 보정 한계·페이스 하한은 racePlanUtils 함수에서 읽는다
const GRADE_BASE = 360
const ADJ_MIN = gradeAdjustSec(-100)
const ADJ_MAX = gradeAdjustSec(100)
const PACE_FLOOR = applyGrade([1], [0])[0]
const GRADE_ROWS = [-10, -5, -3, -1, 0, 1, 2, 3, 5, 8, 12].map(g => {
  const adj = gradeAdjustSec(g)
  const raw = g * (g >= 0 ? GRADE_UP_SEC : GRADE_DOWN_SEC)
  return { g, adj: adj === 0 ? '0' : `${adj > 0 ? '+' : '−'}${Math.abs(adj)}초`, pace: secToPace(applyGrade([GRADE_BASE], [g])[0]), clamped: adj !== raw }
})

const FAQ_LD = [
  { q: '페이스(Pace)란 무엇이고, 시속과는 어떻게 바꾸나요?',
    a: `페이스는 1km를 달리는 데 걸리는 시간입니다. &ldquo;5분 30초 페이스&rdquo;는 1km를 5분 30초에 달린다는 뜻이고, GPS 시계·러닝 앱에서는 min/km 또는 /km로 표시됩니다. 시속으로는 <strong>3,600 ÷ 페이스(초)</strong>로 바꿉니다 — 5:00/km = ${kph1(300)}km/h, 5:30/km = ${kph1(330)}km/h, 6:00/km = ${kph1(360)}km/h. 미국 등에서 쓰는 마일 페이스는 km 페이스 × 1.609344(국제 마일 = 1,609.344m)로, 5:00/km는 ${secToPace(300 * MILE_KM)}/mi입니다.` },
  { q: '트레드밀과 야외 달리기는 같은 속도라도 힘든 정도가 다른가요?',
    a: `같은 시속이면 공기 저항이 없는 트레드밀 쪽이 대체로 조금 덜 힘듭니다. 빠른 속도에서는 트레드밀 경사 <strong>1%</strong>가 야외 평지와 가장 비슷했다는 연구(Jones &amp; Doust, 1996)가 있고, 느린 조깅 속도에서는 0%로 달려도 차이가 크지 않았습니다. 연구 조건은 본문 「트레드밀과 트랙에서 페이스 맞추기」를 참고하세요.` },
  { q: '400m 트랙 1바퀴 목표 시간은 어떻게 정하나요?',
    a: `km 페이스 × 0.4가 1레인 기준 400m 1바퀴 시간입니다. 5:00/km면 ${secToPace(300 * TRACK_LAP_KM)}, 4:00/km면 ${secToPace(240 * TRACK_LAP_KM)}, 6:00/km면 ${secToPace(360 * TRACK_LAP_KM)}입니다. 바깥 레인은 1바퀴가 400m보다 길어 같은 랩 타임이면 더 빨리 달리게 됩니다(본문 「트랙 바깥 레인」 참고).` },
  { q: '마라톤 서브4(4시간 이내 완주)를 위한 페이스는?',
    a: `4시간(14,400초) ÷ 42.195km = 평균 ${SUB4.exact}초/km이므로, 초 단위를 내린 <strong>${SUB4.pace}/km</strong>(시속 약 ${SUB4.kph}km/h)를 끝까지 지키면 ${SUB4.finish}에 들어옵니다. 1초 느린 ${SUB4.slower}/km로는 ${SUB4.slowerFinish}로 4시간을 넘습니다. 실제 레이스에서는 출발 혼잡·급수대 통과·최단 경로를 벗어난 추가 거리만큼 시간이 더 들 수 있으니, 목표 페이스보다 몇 초 여유를 두고 계획하세요.` },
  { q: '5km·10km·하프·풀 거리는 정확히 몇 km이고, 풀코스는 왜 42.195km인가요?',
    a: `5km·10km는 말 그대로이고, <strong>하프 마라톤은 21.0975km</strong>(풀의 정확히 절반), <strong>풀 마라톤은 42.195km</strong>입니다. 42.195km는 1908년 런던 올림픽 코스 길이(26마일 385야드)에서 왔습니다 — 유래와 코스 측정 기준은 본문 「대회 거리 기준」에 정리했습니다. 이 계산기는 끝의 97.5m·195m도 빼지 않고, [레이스 플랜] 탭은 그 자투리를 별도 구간으로 둡니다.` },
  { q: '네거티브 스플릿이 무엇이고, 계산기는 어떻게 나누나요?',
    a: `<strong>후반을 전반보다 약간 빠르게</strong> 달리는 페이스 분배입니다. 하프·풀 결과 카드는 거리를 반으로 나눠 전반 +${NEG_SPLIT_DELTA_SEC}초/km·후반 −${NEG_SPLIT_DELTA_SEC}초/km를 보여 주고, [레이스 플랜] 탭의 네거티브 전략은 구간마다 조금씩 빨라지게 채웁니다. 두 방식 모두 완주 시간은 균등 페이스와 같습니다 — 예시 숫자와 통과 시간 비교는 본문 「네거티브 스플릿」과 「레이스 플랜 탭」 표를 보세요.` },
  { q: '시계 평균 페이스는 목표보다 빨랐는데 공식 기록은 왜 느린가요?',
    a: `공식 기록은 <strong>가장 짧은 경로</strong>로 잰 공식 거리 기준인데, 시계는 실제로 달린 거리(커브 바깥쪽·추월·급수대 이동과 GPS 오차 포함)로 페이스를 계산하기 때문입니다. 예컨대 풀에서 ${EXTRA[1].m}m(1%)를 더 달린다면 서브4에는 공식 거리 기준 ${GPS_SUB4.pace}/km가 아니라 시계 평균 <strong>${GPS_SUB4.watch[1]}/km</strong> 이내가 필요합니다(그 페이스로 ${GPS_SUB4.watchFinish[1]}). 목표별 값은 본문 표 3을 참고하세요.` },
  { q: '목표 페이스는 어떻게 정하면 되나요?',
    a: `이 계산기는 입력한 페이스를 끝까지 유지한다고 가정해 시간을 환산할 뿐, 내가 달릴 수 있는 페이스를 예측하지는 않습니다. 최근 대회 기록이 있다면 <a href="/tools/sports/race-predictor">마라톤 기록 계산기</a>(Riegel·VDOT 공식)로 목표 거리의 예상 기록을 구한 뒤, 그 기록을 [완주 시간 → 페이스] 탭에 넣어 필요 페이스를 확인하세요. 이지·템포·인터벌처럼 훈련 강도별 페이스는 <a href="/tools/sports/interval-training">인터벌 훈련 계산기</a>가 다룹니다.` },
  { q: '[레이스 플랜] 탭에서 구간 페이스만 넣으면 완주 시간이 정확한가요?',
    a: '입력한 페이스를 그대로 유지한다는 가정의 계산값입니다(페이스 × 거리 합산). 실제로는 누적 피로·기온·습도·노면·보급에 따라 후반이 느려지는 경향(positive drift)이 있어 참고용으로 보세요. 코스 고도를 입력하면 언덕에 의한 차이를 어느 정도 반영할 수 있습니다.' },
  { q: '코스 고도는 어떻게 입력하고, 언덕 보정은 얼마나 정확한가요?',
    a: `[레이스 플랜] 탭에서 [코스 고도 입력]을 켜고 각 km 지점의 고도(해발 m)를 넣으면, 직전 지점과의 차이로 구간 경사(%)·총 상승/하강이 자동 계산됩니다. 대회 코스맵의 고도 프로파일에서 km 단위 고도를 읽어 입력하면 됩니다. [고도로 페이스 자동 보정]을 켜고 전략 버튼을 누르면 언덕이 페이스에 반영됩니다.<br/>보정값은 도구 자체 경험칙 추정치입니다. <strong>오르막 1%당 약 +${GRADE_UP_SEC}초/km, 내리막 1%당 약 −${GRADE_DOWN_SEC}초/km</strong>로 가감해 오르막 손실을 내리막에서 다 되찾지 못한다는 경향만 반영하고, 한 구간의 보정은 −${Math.abs(ADJ_MIN)}초~+${ADJ_MAX}초/km로 제한합니다. 실제 손실/이득은 경사 길이·노면·개인 능력·피로도에 따라 크게 다르므로, 자동 보정으로 채운 뒤 구간을 직접 조정하는 것을 권장합니다.` },
  { q: '통과 예상 시각은 어디에 쓰나요?',
    a: '[레이스 플랜] 탭에서 [출발 시각]을 넣으면 5K·10K·하프·완주 지점을 몇 시 몇 분에 통과하는지 시계 시각으로 보여줍니다(구간 목록에도 km마다 통과 시각이 함께 표시, 자정을 넘기면 &lsquo;+1일&rsquo; 표기). 가족·페이서가 응원 지점에서 기다리거나 미팅을 잡을 때 유용합니다.' },
]

export default function PacePage() {
  return (
    <ToolPage width={760} slug="/tools/sports/pace" article="v2">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />러닝 페이스 계산기
      </h1>
      <p className="tp-lead">
        페이스 ↔ 완주 시간 1줄 입력 + 트레드밀 시속과 <strong style={{ color: 'var(--text)' }}>5km·10km·하프·풀 스플릿</strong>.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="World Athletics 기술규칙의 도로 경기 거리(마라톤 42.195km·하프 21.0975km)·코스 측정·400m 트랙 레인 규격, 국제 마일 1,609.344m — 경사 페이스 보정 계수는 도구 자체 경험칙 추정치(Minetti 2002·Strava GAP는 배경 자료)"
        sources={[
          { label: 'World Athletics Book of Rules — C2.1 기술규칙(도로 경기·트랙 규격)', href: 'https://worldathletics.org/about-iaaf/documents/book-of-rules' },
          { label: '대한육상연맹(KAAF) 자료실 — 2024~2025 육상경기규칙', href: 'https://www.kaaf.or.kr/ver3/work/dataroom_view.asp?recno=213&search=&searcnt=&page=1' },
          { label: 'NIST SP 811 부록 B.8 — 단위 환산 계수(마일 = 1,609.344m)', href: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8' },
          { label: 'Jones & Doust (1996) 트레드밀 1% 경사와 야외 달리기 에너지 비용 — J Sports Sci', href: 'https://pubmed.ncbi.nlm.nih.gov/8887211/' },
          { label: 'Minetti 외 (2002) 경사별 걷기·달리기 에너지 비용 — J Appl Physiol', href: 'https://pubmed.ncbi.nlm.nih.gov/12183501/' },
          { label: 'Strava 고객센터 — 경사 보정 페이스(GAP)', href: 'https://support.strava.com/en-us/articles/15402117-grade-adjusted-pace-gap' },
        ]}
      />

      <PaceClient />

      <GuideDivider />

      {/* ── 1. 계산 방식 ── */}
      <h2 className="g-h2">계산 방식 — 페이스 × 거리, 표시할 때만 반올림</h2>
      <p className="g-p">
        페이스는 1km를 달리는 데 걸리는 시간입니다. 계산기는 입력한 분:초를 초로 바꾼 뒤 네 가지를 구합니다.
        <strong>완주 시간 = 페이스(초) × 거리(km)</strong>, <strong>시속 = 3,600 ÷ 페이스(초)</strong>, <strong>400m 1바퀴 = 페이스 × 0.4</strong>,
        <strong> 1마일 페이스 = 페이스 × 1.609344</strong>입니다. 마일은 1959년 국제 협정 이후 정확히 1,609.344m로 정의된 국제 마일을 씁니다.
      </p>
      <p className="g-p">
        예를 들어 {EX.pace}/km로 풀코스를 달리면 {EX_PS} × 42.195 = {EX.raw}초, 곧 <strong>{EX.full}</strong>입니다. 같은 페이스는 시속 {EX.kph}km/h,
        400m 트랙 1바퀴 {EX.lap}, 1마일 {EX.mile}에 해당합니다. 구간 스플릿의 누적 시간은 지점마다 정확값에서 다시 반올림하므로, 1km씩 반올림한 값을 더할 때처럼 오차가 쌓이지 않습니다.
        하프·풀은 21km·42km가 아니라 21.0975km·42.195km로 계산합니다 — 끝의 97.5m·195m도 {EX.pace} 페이스라면 각각 약 {EX.tailHalf}초·{EX.tailFull}초라 목표 기록을 잡을 때 무시하기 어렵습니다.
      </p>
      <DataFigure n={1} title="페이스별 완주 시간 (끝까지 같은 페이스를 유지할 때)" unit="시:분:초" source={<>계산: 페이스 × 거리 — 이 계산기와 같은 함수로 생성</>}>
        <table>
          <thead>
            <tr><th scope="col">페이스(/km)</th><th scope="col" className="r">시속</th><th scope="col" className="r">5km</th><th scope="col" className="r">10km</th><th scope="col" className="r">하프 21.0975km</th><th scope="col" className="r">풀 42.195km</th></tr>
          </thead>
          <tbody>
            {PACE_ROWS.map(r => (
              <tr key={r.pace}>
                <th scope="row">{r.pace}</th>
                <td className="r">{r.kph}</td>
                <td className="r">{r.k5}</td>
                <td className="r">{r.k10}</td>
                <td className="r">{r.half}</td>
                <td className="r em">{r.full}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>

      {/* ── 2. 목표 기록별 필요 페이스 ── */}
      <h2 className="g-h2">목표 기록별 필요 페이스 — &lsquo;서브&rsquo;는 반올림이 아니라 내림</h2>
      <p className="g-p">
        [완주 시간 → 페이스] 탭은 목표 시간 ÷ 거리를 정수 초로 <strong>반올림</strong>해 보여 줍니다. 풀 3:00:00을 넣으면 평균 {SUB3.exact}/km라 {SUB3.shown}으로 표시되는데,
        {' '}{SUB3.shown}을 끝까지 지키면 {SUB3.shownFinish}로 목표를 넘습니다. &lsquo;서브3&rsquo;처럼 목표 시간 <strong>미만</strong>이 목표라면 초 단위를 내린 {SUB3.sub}/km({SUB3.subFinish})를 기준으로 삼아야 합니다.
        계산기 「빠른 입력」 칩의 서브3~서브5 페이스가 이 방식으로 계산되어 있습니다.
      </p>
      <DataFigure n={2} title="목표 기록별 평균 페이스 — 반올림 표시와 '서브' 페이스" unit="페이스: 분:초/km" source={<>계산: 목표 시간 ÷ 거리. &lsquo;서브&rsquo; 페이스는 목표 시간 안에 들어오는 가장 느린 정수 초 페이스</>}>
        <table>
          <thead>
            <tr><th scope="col">목표</th><th scope="col" className="r">정확한 평균</th><th scope="col" className="r">반올림 표시 → 완주</th><th scope="col" className="r">&lsquo;서브&rsquo; 페이스</th><th scope="col" className="r">서브 페이스로 완주</th></tr>
          </thead>
          <tbody>
            {GOAL_ROWS.map(r => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                <td className="r">{r.exact}</td>
                <td className="r">{r.shown} → {r.shownFinish}{r.shownNote && <small>{r.shownNote}</small>}</td>
                <td className="r em">{r.sub}</td>
                <td className="r">{r.subFinish}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        하프는 풀의 정확히 절반이라 균등 페이스로 보면 하프 1:30 = 풀 3:00, 하프 2:00 = 풀 4:00과 같은 페이스입니다. 하지만 실제로는 거리가 길수록 같은 페이스를 유지하기 어려워,
        하프 기록을 두 배 한 시간으로 풀을 뛰는 경우는 드뭅니다. 하프·10km 기록으로 풀 목표를 잡으려면 <Link href="/tools/sports/race-predictor">마라톤 기록 계산기</Link>로 예상 기록을 먼저 구하고, 그 기록을 이 계산기에 넣어 구간 페이스로 옮기세요.
      </p>

      {/* ── 3. 대회 거리와 GPS ── */}
      <h2 className="g-h2">대회 거리 기준과 GPS 시계가 더 길게 재는 이유</h2>
      <p className="g-p">
        풀코스 42.195km는 1908년 런던 올림픽에서 출발을 윈저성, 결승을 화이트시티 스타디움 로열박스 앞으로 정하면서 생긴 26마일 385야드에서 왔고, 1921년 국제육상경기연맹(현 World Athletics)이 표준 거리로 채택했습니다.
        하프마라톤은 그 절반인 21.0975km입니다. 대한육상연맹의 육상경기규칙도 World Athletics 규칙을 바탕으로 하며, 코스 공인을 받지 않은 대회는 실제 거리가 이와 다를 수 있습니다.
      </p>
      <p className="g-p">
        World Athletics 기술규칙은 도로 코스를 <strong>선수가 달릴 수 있는 가장 짧은 경로</strong>를 따라 재고, 코스 길이가 공식 거리보다 짧아서는 안 되며 측정 불확도가 0.1%(마라톤 약 {SCPF_M}m)를 넘지 않도록 정합니다.
        공인 측정자는 짧게 재는 오차를 막으려고 측정값에 0.1%를 더하는 &lsquo;짧은 코스 방지 계수(1.001)&rsquo;를 적용합니다. 그래서 공인 코스는 최단 경로로 달려도 공식 거리보다 조금 길 수 있습니다.
      </p>
      <p className="g-p">
        러너는 커브 안쪽의 최단 경로로만 달리지 않습니다. 추월하거나 급수대로 비켜 가거나 도로 바깥쪽을 따라가면 이동 거리가 늘고, 고층 건물 사이·터널·다리 아래에서는 GPS 위치가 흔들려 거리 오차도 생깁니다.
        시계는 이렇게 잰 거리로 평균 페이스를 계산하므로, 시계 페이스는 &lsquo;공식 기록 ÷ 공식 거리&rsquo;보다 빠르게 표시되기 쉽습니다. 공식 기록 목표를 시계 페이스로 맞추려면 그만큼 빠르게 봐야 합니다.
      </p>
      <DataFigure n={3} title="실제 이동 거리가 더 길 때, 목표 기록 안에 들어오려면 시계에 보여야 할 평균 페이스" unit="풀코스 · 분:초/km, 작은 숫자 = 그 페이스로 달린 완주 기록" source={<>계산: 목표 시간 ÷ (42.195km × (1 + 추가 비율))을 표 2의 &lsquo;서브&rsquo; 페이스처럼 초 단위 내림 — 목표 안에 드는 가장 느린 정수 초 페이스. 추가 비율 0.5%·1%는 설명을 위한 가정값</>}>
        <table>
          <thead>
            <tr><th scope="col">목표</th><th scope="col" className="r">공식 거리 기준</th><th scope="col" className="r">+{EXTRA[0].pct}% ({EXTRA[0].m}m 더)</th><th scope="col" className="r">+{EXTRA[1].pct}% ({EXTRA[1].m}m 더)</th></tr>
          </thead>
          <tbody>
            {GPS_ROWS.map(r => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                <td className="r">{r.pace}<small>{r.paceFinish}</small></td>
                <td className="r">{r.watch[0]}<small>{r.watchFinish[0]}</small></td>
                <td className="r em">{r.watch[1]}<small>{r.watchFinish[1]}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <Callout tone="tip" title="레이스 중 점검은 코스 표지판 기준으로">
        이런 이유로 시계의 1km 자동 랩은 코스 km 표지판보다 먼저 울리기 쉽습니다. 표지판을 지날 때 누르는 수동 랩이나 5km 표지판 통과 시각을
        [레이스 플랜] 탭의 누적 시간(또는 페이스 밴드)과 비교하면, GPS 거리 차이에 흔들리지 않고 목표 대비 앞섰는지 뒤처졌는지 알 수 있습니다.
      </Callout>

      {/* ── 4. 트레드밀·트랙 ── */}
      <h2 className="g-h2">트레드밀과 트랙에서 페이스 맞추기</h2>
      <p className="g-p">
        트레드밀은 페이스 대신 시속(km/h)으로 속도를 정합니다. 시속 → 페이스는 3,600 ÷ 시속(초/km)이라, 시속 10km/h는 6:00/km, 12km/h는 5:00/km입니다.
        소수 첫째 자리까지 설정하는 기계가 많으니 목표 페이스를 계산기 [트레드밀 변환] 탭에서 시속으로 바꿔 입력하세요.
      </p>
      <DataFigure n={4} title="트레드밀 시속별 페이스와 환산 기록" unit="시:분:초" source={<>계산: 페이스 = 3,600 ÷ 시속 — 이 계산기와 같은 함수로 생성</>}>
        <table>
          <thead>
            <tr><th scope="col">시속(km/h)</th><th scope="col" className="r">페이스(/km)</th><th scope="col" className="r">400m 1바퀴</th><th scope="col" className="r">10km</th><th scope="col" className="r">풀 환산</th></tr>
          </thead>
          <tbody>
            {KPH_ROWS.map(r => (
              <tr key={r.kph}>
                <th scope="row">{r.kph}</th>
                <td className="r em">{r.pace}</td>
                <td className="r">{r.lap}</td>
                <td className="r">{r.k10}</td>
                <td className="r">{r.full}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        같은 시속인데 트레드밀이 덜 힘든 가장 큰 이유는 공기 저항입니다. 제자리에서 달리면 몸이 공기를 가르지 않으니 그만큼 에너지가 덜 듭니다.
        Jones &amp; Doust(1996)는 훈련된 러너 9명을 시속 10.5~18km/h의 여섯 속도에서 측정해, 평지 도로와 산소 섭취량이 가장 비슷한 트레드밀 경사를 <strong>1%</strong>로 보고했습니다.
        다만 가장 느린 두 속도(10.5·12km/h)에서는 경사 0%와 1% 모두 도로와 유의한 차이가 없었습니다. 1% 경사는 빠른 속도의 훈련에서 의미가 크고, 느린 조깅이라면 0%로 달려도 야외와 큰 차이가 나지 않는다는 뜻입니다.
        헬스장 기계는 보정 상태에 따라 표시 속도와 실제 벨트 속도가 다를 수 있으니, 같은 시속이 유난히 쉽거나 힘들게 느껴지면 기계 차이도 의심해 보세요.
      </p>

      <h3 className="g-h3">트랙 바깥 레인은 1바퀴가 400m보다 깁니다</h3>
      <p className="g-p">
        계산기의 &lsquo;400m 1바퀴&rsquo;는 1레인 기준이라, 곡선이 긴 바깥 레인에서 같은 랩 타임을 맞추면 의도보다 빨리 달리게 됩니다 — 3레인(약 {LANE3_M.toFixed(1)}m)에서 1바퀴 2:00이면 5:00/km가 아니라 약 <strong>{LANE3_AT_120}/km</strong>입니다.
        레인별 1바퀴 거리표는 <Link href="/tools/sports/interval-training">인터벌 훈련 계산기</Link>에 있고, 둘레가 400m가 아닌 공원·학교 트랙이라면 [페이스 → 완주 시간] 탭의 직접 거리 칸에 한 바퀴 거리(km)를 넣어 랩 타임을 구하세요.
      </p>

      {/* ── 5. 네거티브 스플릿과 페이스 분배 ── */}
      <h2 className="g-h2">네거티브 스플릿과 거리별 페이스 분배</h2>
      <p className="g-p">
        하프·풀(21km 이상 거리)을 선택하면 결과 아래에 네거티브 스플릿 카드가 나옵니다. 거리를 반으로 나눠 전반은 목표보다 {NEG_SPLIT_DELTA_SEC}초/km 느리게, 후반은 {NEG_SPLIT_DELTA_SEC}초/km 빠르게 잡는 방식이라
        완주 시간은 균등 페이스와 같습니다. {EX.pace}/km 풀이라면 전반 {NS_EX?.front}/km로 21.0975km(약 {NS_EX?.frontT}), 후반 {NS_EX?.back}/km로 나머지(약 {NS_EX?.backT})를 달려
        균등 페이스와 같은 {EX.full}에 들어옵니다.
      </p>
      <p className="g-p">
        전반을 아끼는 이유는 마라톤 후반의 급감속을 줄이기 위해서입니다. 출발 직후의 흥분이나 혼잡을 벗어난 뒤의 과한 가속으로 목표보다 빨리 달리면 탄수화물(글리코겐)을 일찍 소모해, 30km 이후에 페이스가 크게 떨어지기 쉽습니다.
        반대로 전반을 너무 느리게 가면 후반에 만회할 거리가 부족하므로, 전후반 차이는 초 단위로 작게 잡는 것이 핵심입니다.
      </p>
      <ul className="g-list">
        <li><strong>5km</strong> — 짧아서 분배 오차를 되돌릴 시간이 없습니다. 출발 직후 빨라지기 쉬운 첫 1km를 목표 페이스로 억누르고, 마지막 1km에 남은 힘을 씁니다.</li>
        <li><strong>10km</strong> — 첫 2km는 목표보다 몇 초 느리게 몸을 풀고, 중반을 목표 페이스로 유지한 뒤 마지막 2~3km에서 가속하는 흐름이 무난합니다.</li>
        <li><strong>하프</strong> — 결과 카드의 ±{NEG_SPLIT_DELTA_SEC}초처럼 전반을 조금 아끼고, 강변 코스라면 맞바람 구간에서 페이스에 집착하지 말고 힘을 일정하게 유지하세요.</li>
        <li><strong>풀</strong> — 30km까지는 목표 페이스를 넘기지 않는 것이 우선입니다. 보급(에너지젤·물)은 대회 급수대 위치에 맞춰 평소 장거리 훈련에서 시험해 본 방식으로 계획하세요.</li>
      </ul>
      <Callout tone="warn" title="첫 대회라면 균등 페이스부터">
        네거티브 스플릿은 목표 페이스를 끝까지 유지할 체력이 있다는 전제에서 효과가 있습니다. 장거리 훈련이 충분하지 않다면 전후반을 나누기보다
        현실적인 균등 페이스를 정해 끝까지 지키는 연습이 먼저입니다. 기온이 높거나 언덕이 많은 날은 목표 자체를 늦추는 것이 안전합니다.
      </Callout>

      {/* ── 6. 레이스 플랜 탭 ── */}
      <h2 className="g-h2">레이스 플랜 탭 — 구간별 페이스와 통과 시각</h2>
      <p className="g-p">
        [레이스 플랜] 탭은 거리를 1km 구간과 마지막 자투리 구간으로 나눕니다. 풀은 42개 1km 구간과 {PLAN.tail}km 구간을 합쳐 {PLAN.n}개, 하프는 21개와 0.0975km 구간이며 직접 거리는 100km까지 입력할 수 있습니다.
        기준 페이스는 &lsquo;5:30&rsquo;(분:초), &lsquo;5.5&rsquo;(소수 분 = 5분 30초), &lsquo;530&rsquo;(분·초 붙여 쓰기) 모두 5분 30초로 읽습니다.
        전략 버튼을 누르면 구간 페이스가 채워지는데, 네거티브는 첫 구간 약 +3%에서 마지막 구간 약 −3%까지 한 구간씩 점진적으로 빨라지고(포지티브는 반대), 구간 거리로 가중해 완주 시간이 균등 페이스와 같도록 보정합니다.
      </p>
      <ol className="g-list">
        <li><strong>거리·기준 페이스 선택</strong> — 5K·10K·하프·풀 또는 직접 거리를 고르고, 목표 평균 페이스를 입력합니다. 출발 시각을 넣으면 지점별 통과 예상 시각도 표시됩니다.</li>
        <li><strong>전략으로 자동 분배</strong> — 균등·네거티브·포지티브 중 하나를 누른 뒤, 특정 구간만 직접 고칠 수 있습니다(고치면 &lsquo;직접 조정됨&rsquo;으로 바뀝니다).</li>
        <li><strong>(선택) 코스 고도 입력</strong> — 언덕이 있는 코스라면 각 km 지점의 고도를 넣어 경사·상승/하강을 반영하고, 자동 보정으로 언덕 구간 페이스를 추정합니다.</li>
      </ol>
      <p className="g-p">
        풀 서브4 기준 페이스 {SUB4.pace}/km에 네거티브를 적용하면 첫 1km는 {PLAN.first}, 마지막 1km는 {PLAN.lastFull}/km로 빨라지고, 하프 통과는 균등({PLAN.halfEven})보다 늦은 {PLAN.halfNeg}이지만 완주는 같은 {PLAN.finish}입니다.
        전반에 &lsquo;늦었다&rsquo;고 조급해질 필요가 없다는 것을 숫자로 미리 알고 출발하는 것이 이 탭의 쓰임새입니다.
      </p>
      <DataFigure n={5} title={`풀 ${SUB4.pace}/km 기준 — 균등 vs 네거티브 전략 통과 시간`} unit="시:분:초" source={<>계산: [레이스 플랜] 탭과 같은 구간 분할·전략 함수로 생성(고도 보정 없음)</>}>
        <table>
          <thead>
            <tr><th scope="col">지점</th><th scope="col" className="r">균등</th><th scope="col" className="r">네거티브</th><th scope="col" className="r">차이</th></tr>
          </thead>
          <tbody>
            {PLAN_ROWS.map(r => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                <td className="r">{r.even}</td>
                <td className="r em">{r.neg}</td>
                <td className="r">{r.diff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        결과 아래에는 입력 오류를 잡는 경고가 뜹니다 — 비어 있는 구간이 있을 때, 평균 페이스가 그 거리의 세계기록 페이스보다 빠를 때, 20:00/km보다 느릴 때(5km 목표 25분을 페이스 칸에 &lsquo;25&rsquo;로 넣어 25분/km로 읽히는 식의 실수), 한 구간 경사가 15%를 넘을 때입니다.
      </p>

      <h3 className="g-h3">페이스 밴드 만드는 법</h3>
      <p className="g-p">
        페이스 밴드는 구간 통과 목표 시간을 적어 손목에 두르는 종이 띠입니다. 앞에서 본 것처럼 GPS 시계의 거리와 페이스는 코스와 어긋나기 쉬우므로, 코스 표지판 기준 누적 시간을 적은 밴드는 단순하지만 믿을 만한 기준이 됩니다.
      </p>
      <ol className="g-list">
        <li><strong>스플릿 확정 후 [플랜 복사]</strong> — 전략·고도 보정까지 반영한 구간표를 확정하고 [플랜 복사]를 누르면 예상 완주·평균 페이스와 5K·10K·하프·완주 통과 타임(출발 시각을 넣었다면 시계 시각 포함)이 텍스트로 복사됩니다.</li>
        <li><strong>종이 띠에 옮겨 적고 손목에 고정</strong> — 복사한 통과 타임을 손목 둘레 길이의 종이 띠에 크게 옮겨 적고 테이프로 감아 고정합니다. 비 예보가 있으면 투명 테이프로 전체를 덮어 번짐을 막으세요.</li>
        <li><strong>시계 랩 알림과 병행</strong> — 시계에는 목표 페이스 범위 알림을 설정하되, 구간마다 페이스가 다른 전략이라면 표지판 통과 시각을 밴드의 누적 시간과 교차 확인하는 방식이 안전합니다.</li>
      </ol>

      {/* ── 7. 코스 고도와 경사 보정 ── */}
      <h2 className="g-h2">코스 고도와 경사 보정</h2>
      <p className="g-p">
        고도를 입력하면 구간 경사 = (구간 끝 고도 − 시작 고도) ÷ 구간 거리로 계산하고, 자동 보정을 켜면 <strong>오르막 1%당 +{GRADE_UP_SEC}초/km, 내리막 1%당 −{GRADE_DOWN_SEC}초/km</strong>를 평지 페이스에 더합니다.
        한 구간의 보정은 −{Math.abs(ADJ_MIN)}초~+{ADJ_MAX}초/km로 제한하므로 내리막 {(Math.abs(ADJ_MIN) / GRADE_DOWN_SEC).toFixed(1)}%·오르막 {(ADJ_MAX / GRADE_UP_SEC).toFixed(0)}%보다 가파른 구간은 더 커지지 않고,
        보정 후 페이스는 {secToPace(PACE_FLOOR)}/km보다 빨라지지 않습니다.
      </p>
      <p className="g-p">
        오르막 가산을 내리막 감산보다 크게 둔 것은 오르막에서 잃은 시간을 내리막에서 다 되찾기 어렵다는 경향 때문입니다. Minetti 외(2002)가 러너 10명을 −45%~+45% 경사의 트레드밀에서 측정한 결과, 평지 달리기 비용은 3.40J/kg/m였고
        오르막에서는 경사에 따라 가파르게 늘어 +45%에서 18.93J/kg/m에 이르렀지만, 내리막에서는 −20% 부근의 1.73J/kg/m가 최저였고 그보다 가파르면 오히려 다시 늘었습니다.
        다만 이 곡선은 평지 부근(±1~2%)에서는 거의 대칭이고 경사가 커질수록 비대칭이 벌어집니다. 이 계산기의 1%당 +{GRADE_UP_SEC}초/−{GRADE_DOWN_SEC}초는 그 곡선을 옮긴 값이 아니라,
        오르막 손실을 내리막에서 다 되찾지 못한다는 경향만 반영한 보수적 경험칙 값입니다.
      </p>
      <DataFigure n={6} title="경사별 페이스 보정 — 평지 기준 6:00/km" unit="초/km" source={<>계산: [레이스 플랜] 탭의 경사 보정 함수로 생성 — 도구 자체 단순화 추정치</>}>
        <table>
          <thead>
            <tr><th scope="col">구간 경사</th><th scope="col" className="r">1km 고도 변화</th><th scope="col" className="r">보정</th><th scope="col" className="r">보정 후 페이스</th></tr>
          </thead>
          <tbody>
            {GRADE_ROWS.map(r => (
              <tr key={r.g}>
                <th scope="row">{r.g > 0 ? `+${r.g}` : r.g < 0 ? `−${Math.abs(r.g)}` : '0'}%</th>
                <td className="r">{r.g > 0 ? `+${r.g * 10}` : r.g < 0 ? `−${Math.abs(r.g) * 10}` : '0'}m</td>
                <td className="r">{r.adj}{r.clamped && <small>보정 한계</small>}</td>
                <td className="r em">{r.pace}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <Callout tone="warn" title="추정의 한계">
        실제 언덕 손실/이득은 경사가 이어지는 길이, 노면(트레일·아스팔트), 개인 능력, 누적 피로에 따라 크게 달라집니다. 가파른 내리막은 오히려 근육 손상으로 이득이 줄거나 손해가 되기도 합니다.
        자동 보정은 출발점일 뿐, 코스를 잘 안다면 구간을 직접 조정하세요.
      </Callout>

      <h3 className="g-h3">실전 예 — 춘천마라톤 코스 고도 읽기</h3>
      <p className="g-p">
        춘천마라톤 공식 홈페이지에 게시된 코스도·고저도를 판독하면 출발·골인 지점이 약 78~80m, 최고점이 약 29km 지점(춘천댐 인근) 약 115m로 전체 고도 변동 폭은 약 40m 이내이며, 약 34km부터는 약 80m대 평탄 구간입니다(2026년 7월 확인 · 수치 라벨이 없는 공식 코스도 판독 기준 근사치 — 참가 연도의 공식 코스 안내로 확인 필요). 이런 코스의 km별 고도를 [코스 고도 입력]에 넣으면 최고점으로 이어지는 오르막 구간의 페이스는 자동으로 늦춰지고 후반 평탄 구간에서 기준 페이스로 회복하는 계획이 만들어집니다 — 예컨대 1km 동안 고도가 10m 오르면 경사 +1%로 인식되어 그 구간에 약 +{GRADE_UP_SEC}초/km가 더해지는 식입니다.
      </p>

      <h3 className="g-h3">GAP(경사 보정 페이스)와의 차이</h3>
      <p className="g-p">
        <strong>GAP(Grade Adjusted Pace)</strong>은 달린 지형의 경사를 반영해 &lsquo;평지였다면 이에 상응했을 페이스&rsquo;를 추정한 지표입니다(Strava 고객센터 문서). 오르막에서는 같은 페이스라도 더 많은 일이 필요하므로 GAP이 실제 페이스보다 <strong>빠르게</strong>, 내리막에서는 반대로 실제보다 <strong>느리게</strong> 표기됩니다. 같은 문서에 따르면 내리막 보정은 약 −10% 경사에서 최대가 되고 그보다 가파르면 소폭 완화되며, 지형의 기술적 난도나 노면 상태는 반영하지 않는 한계가 있습니다.
      </p>
      <p className="g-p">
        GAP이 이미 달린 기록을 평지 기준으로 <strong>사후 환산</strong>하는 지표라면, [레이스 플랜] 탭의 고도 보정은 그 반대 방향입니다 — 평지 기준 목표 페이스를 경사 구간에서 실제로 뛸 페이스로 <strong>미리 환산</strong>해 레이스 계획에 반영합니다.
      </p>

      <Faq items={FAQ_LD} />

      <RelatedTools
        items={[
          { href: '/tools/sports/race-predictor', desc: '최근 5km·10km·하프 기록으로 목표 거리 예상 기록' },
          { href: '/tools/sports/interval-training', desc: '이지·템포·인터벌 등 훈련 강도별 페이스' },
          { href: '/tools/sports/buildup', desc: '점점 빨라지는 빌드업 러닝 구간 페이스표' },
          { href: '/tools/sports/carb-loading', desc: '대회 전 탄수화물 로딩 계획' },
          { href: '/tools/sports/shoe-mileage', desc: '주간 거리로 러닝화 교체 시기 계산' },
          { href: '/tools/date/dday', desc: '다음 대회까지 남은 날' },
        ]}
      />
    </ToolPage>
  )
}
