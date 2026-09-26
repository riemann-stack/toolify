import IntervalTrainingClient from './IntervalTrainingClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import RelatedTools from '@/components/RelatedTools'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { todayStr } from '@/lib/date'
import { vo2FromV, vFromVo2, pctVO2max, paceFromVdot } from '@/lib/running'
import {
  calcVDOT, getPace, timeFromVdot, INTENSITY_PCT, E_FAST_PCT, VDOT_MIN, VDOT_MAX,
  KOREA_RACES, raceDate, recoveryRule, type RaceRule,
} from './intervalUtils'

export const metadata = buildMetadata({
  path: '/tools/sports/interval-training',
  title: '인터벌 훈련 계산기 — VDOT 페이스·야소 800·LSD·이지런 페이스·존2 심박',
  description: 'VDOT 공식 기반 인터벌 페이스 + 거리별 1바퀴 랩타임·워밍업~쿨다운 세션 자동 정리 + 4~16주 트레이닝 스케줄 + 이지·LSD 탭(이지 페이스·존2 심박·롱런 보급). E·M·T·I·R 5가지 강도 설명.',
  keywords: ['인터벌훈련계산기', '인터벌페이스', '야소800계산기', '400m페이스', '800m페이스', '마라톤풀코스예측', '러닝인터벌', '인터벌스케줄', 'VDOT 계산기', 'I 페이스', 'R 페이스', 'Jack Daniels VDOT', '한국 마라톤 훈련', '풀코스 예측', 'LSD 페이스', '이지런 페이스', '존2 심박', '정크 마일'],
})

// ── 표·카드 스타일 ──
const easyCard: React.CSSProperties = {
  background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px',
}
const TD: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const TDN: React.CSSProperties = { ...TD, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const TH: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const THN: React.CSSProperties = { ...TH, textAlign: 'right' }
const EASY_ACCENT = 'var(--emerald-600)'

// ── 표시 형식 (계산기와 같은 반올림) ──
const pad2 = (v: number) => String(v).padStart(2, '0')
const fmtMS = (sec: number): string => {
  let m = Math.floor(sec / 60)
  let s = Math.round(sec - m * 60)
  if (s === 60) { s = 0; m += 1 }
  return `${m}:${pad2(s)}`
}
const fmtHMS = (sec: number): string => {
  const r = Math.round(sec)
  return `${Math.floor(r / 3600)}:${pad2(Math.floor((r % 3600) / 60))}:${pad2(r % 60)}`
}
const pct = (x: number) => Math.round(x * 100)

// ── 예시 러너: 계산기 [인터벌 페이스] 탭 기본값(5km 22:30)과 같은 입력 → 가이드 숫자가 계산기 첫 화면과 일치 ──
const EX_5K_SEC = 22 * 60 + 30
const EX_5K = fmtMS(EX_5K_SEC)
const EX_T_MIN = EX_5K_SEC / 60
const EX_V = 5000 / EX_T_MIN                 // m/분
const EX_VO2 = vo2FromV(EX_V)                // 그 속도의 산소 비용
const EX_SUSTAIN = pctVO2max(EX_T_MIN)       // 22.5분 동안 낼 수 있는 %VO2max
const EX_VDOT = calcVDOT(EX_5K_SEC, 5000)
const EX_VDOT_S = EX_VDOT.toFixed(1)
const EX = {
  eFast: paceFromVdot(EX_VDOT, E_FAST_PCT),
  eSlow: getPace(EX_VDOT, 'E'),
  M: getPace(EX_VDOT, 'M'),
  T: getPace(EX_VDOT, 'T'),
  I: getPace(EX_VDOT, 'I'),
  R: getPace(EX_VDOT, 'R'),
}
const EX_I_VO2 = EX_VDOT * INTENSITY_PCT.I
const EX_I_V = vFromVo2(EX_I_VO2)
const E_VS_M_LO = Math.round(EX.eFast - EX.M)
const E_VS_M_HI = Math.round(EX.eSlow - EX.M)

// 훈련 목적 → 강도 (IntervalTrainingClient의 GOAL_INTENSITY와 같은 매핑, 10km 목적은 I + 5초)
const GOAL_ROWS: { goal: string; zone: string; pace: number; note: string }[] = [
  { goal: '스피드', zone: 'R', pace: EX.R, note: '짧은 반복으로 속도·달리기 효율' },
  { goal: '5km', zone: 'I', pace: EX.I, note: 'V̇O₂max 자극의 기본값' },
  { goal: '10km', zone: 'I + 5초', pace: EX.I + 5, note: 'I보다 살짝 늦춰 반복 수를 늘림' },
  { goal: '하프', zone: 'T', pace: EX.T, note: '역치 강도로 더 오래 유지' },
  { goal: '풀코스', zone: 'I', pace: EX.I, note: '야소 800 등 보조 스피드 훈련 기준' },
]

// ── VDOT 표: 5km 기록별 강도 페이스 (도구와 같은 공식으로 빌드 시 계산) ──
const VDOT_TABLE = [30 * 60, 27 * 60, 25 * 60, 22 * 60 + 30, 20 * 60, 18 * 60, 16 * 60].map(t => {
  const v = calcVDOT(t, 5000)
  return { t, v, M: getPace(v, 'M'), T: getPace(v, 'T'), I: getPace(v, 'I'), R: getPace(v, 'R') }
})
const VDOT_MIN_5K = fmtMS(timeFromVdot(5, VDOT_MIN))
const VDOT_MAX_5K = fmtMS(timeFromVdot(5, VDOT_MAX))

// ── 1회 세션 분량 상한 — Daniels' Running Formula: T ≤ 주간 거리 10%, I ≤ min(8%, 10km), R ≤ min(5%, 8km) ──
const SESSION_CAP = { T: { pct: 0.10, maxKm: Infinity }, I: { pct: 0.08, maxKm: 10 }, R: { pct: 0.05, maxKm: 8 } } as const
const capKm = (weekly: number, z: keyof typeof SESSION_CAP) => Math.min(weekly * SESSION_CAP[z].pct, SESSION_CAP[z].maxKm)
const CAP_ROWS = [20, 30, 40, 50, 60, 80, 100].map(w => ({
  w, T: capKm(w, 'T'), I: capKm(w, 'I'), R: capKm(w, 'R'),
  reps800: Math.floor(capKm(w, 'I') / 0.8 + 1e-9),
}))
const CAP40 = CAP_ROWS.find(r => r.w === 40)!
// 빠른 구간 fastKm를 한 세션에 소화하려면 필요한 주간 거리(위 상한의 역산). 거리 상한(I 10km·R 8km)을 넘으면 Infinity
const needWeekly = (fastKm: number, z: keyof typeof SESSION_CAP) =>
  fastKm > SESSION_CAP[z].maxKm ? Infinity : Math.ceil(fastKm / SESSION_CAP[z].pct - 1e-9)

// ── 거리별 추천 메뉴 — '필요 주간 거리'는 권장 횟수의 양 끝(짧은 거리×적은 횟수 ~ 긴 거리×많은 횟수)을 위 상한으로 역산.
//    I·T 혼합 줄은 더 엄격한 I 상한으로 본다. 회복 문구는 intervalUtils.recoveryRule과 같은 규칙 ──
const MENU_ROWS = [
  { d: '200~400m', lo: 200, hi: 400, rLo: 6, rHi: 10, cap: 'R', e: 'R — 최대 속도·러닝 이코노미', c: '달린 거리만큼 조깅 (시간 2~3배)', t: '시즌 초반 스피드 강화, 5km' },
  { d: '600~800m', lo: 600, hi: 800, rLo: 5, rHi: 10, cap: 'I', e: 'I — 5km 페이스·야소 800', c: '달린 시간만큼 (거리 절반 안팎)', t: '5km 대회, 풀코스 야소 800' },
  { d: '1km', lo: 1000, hi: 1000, rLo: 4, rHi: 6, cap: 'I', e: 'I — V̇O₂max', c: '달린 시간만큼 (약 500m)', t: '5km·10km 기록 향상' },
  { d: '1.2~1.6km', lo: 1200, hi: 1600, rLo: 3, rHi: 5, cap: 'I', e: 'I·T 혼합 — V̇O₂max + 역치', c: 'I면 달린 시간만큼, T면 5분당 약 1분', t: '10km·하프 준비' },
  { d: '2~3km', lo: 2000, hi: 3000, rLo: 2, rHi: 4, cap: 'T', e: 'T — 역치', c: '5분당 약 1분 (짧은 조깅·휴식)', t: '하프·풀코스 지구력' },
] as const
const MENU_NEED = MENU_ROWS.map(r => ({ lo: needWeekly(r.lo * r.rLo / 1000, r.cap), hi: needWeekly(r.hi * r.rHi / 1000, r.cap) }))
const MENU_NEED_HI_MIN = Math.min(...MENU_NEED.map(n => n.hi))
const MENU_NEED_HI_MAX = Math.max(...MENU_NEED.map(n => n.hi))

// ── [추천 인터벌 세션] 첫 화면(5km 목적 · 800m × 8회)과 같은 계산 — 워밍업·쿨다운 각 9분, 회복은 recoveryRule ──
const SES = { dist: 800, reps: 8 }
const SES_LAP = EX.I * SES.dist / 1000
const SES_REC = recoveryRule('I', SES.dist, SES_LAP)!
const SES_TOTAL_MIN = Math.round((SES_LAP * SES.reps + SES_REC.sec * (SES.reps - 1) + 18 * 60) / 60)
const SES_FAST_KM = SES.dist * SES.reps / 1000
const SES_NEED = needWeekly(SES_FAST_KM, 'I')
const SES_R400 = recoveryRule('R', 400, EX.R * 0.4)!

// ── 야소 800 10회 = I 8km → 필요한 주간 거리 ──
const YASSO10_NEED = needWeekly(0.8 * 10, 'I')

// ── 회복 예시 (Daniels 비율 × 예시 러너 페이스) — 표에 보이는 초 단위 기록에서 배수를 계산해 표시값끼리 맞춘다 ──
const REC_R400 = Math.round(EX.R * 0.4)
const REC_I800 = Math.round(EX.I * 0.8)
const REC_T1600 = Math.round(EX.T * 1.6)

// ── 400m 통과 시각 (I 페이스 일정 유지) ──
const SPLIT_DISTS = [800, 1000, 1200, 1600]
const SPLIT_MARKS = [400, 800, 1200]

// ── 표준 400m 트랙 레인별 1바퀴 거리 — World Athletics 기술 규칙 TR 14: 레인 폭 1.22m,
//    1레인은 연석에서 0.30m, 2레인부터는 안쪽 선에서 0.20m 떨어진 선으로 잰다.
//    곡선 반지름 36.50m·직선 84.39m는 World Athletics Track and Field Facilities Manual(2019)의 '400m Standard Track' 규격 ──
const TRACK = { straight: 84.39, radius: 36.5, laneW: 1.22, lane1Off: 0.30, laneOff: 0.20 }
const laneLen = (n: number) =>
  2 * TRACK.straight + 2 * Math.PI * (TRACK.radius + TRACK.laneW * (n - 1) + (n === 1 ? TRACK.lane1Off : TRACK.laneOff))
const LANES = [1, 2, 3, 4, 5, 6, 7, 8].map(n => {
  const len = Math.round(laneLen(n) * 100) / 100   // 표시 단위(cm)로 먼저 반올림 → 1레인 대비 차이도 표시값끼리 계산
  return { n, len, extra: len - Math.round(laneLen(1) * 100) / 100, lap: EX.I * len / 1000 }
})

// ── 야소 800 vs VDOT: 800m 평균을 I 페이스로 달렸다고 보고 VDOT를 역산해 풀코스 예측과 비교 ──
function vdotFromI800(t800: number): number {
  let lo = VDOT_MIN, hi = VDOT_MAX
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (getPace(mid, 'I') * 0.8 > t800) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
const YASSO_ROWS = [165, 180, 210, 240, 270, 300].map(t800 => {
  const yasso = Math.floor(t800 / 60) * 3600 + (t800 % 60) * 60
  const v = vdotFromI800(t800)
  const full = timeFromVdot(42.195, v)
  return { t800, yasso, v, full, diffMin: (full - yasso) / 60 }
})
const YASSO_DIFF_LO = Math.round(Math.min(...YASSO_ROWS.map(r => r.diffMin)))
const YASSO_DIFF_HI = Math.round(Math.max(...YASSO_ROWS.map(r => r.diffMin)))

// ── 한국 대회 — 계산기 '대회 빠른 선택'과 같은 요일 규칙으로 내년 개최일 추정 ──
const RACE_YEAR = Number(todayStr().slice(0, 4)) + 1
const NTH = ['첫째', '둘째', '셋째', '넷째', '다섯째']
const ruleText = (r: RaceRule) => `${r.month}월 ${r.nth === 'last' ? '마지막' : NTH[r.nth - 1]} ${'일월화수목금토'[r.weekday]}요일`
const mdText = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`
const RACE_ROWS = KOREA_RACES.map(r => {
  const d = raceDate(RACE_YEAR, r.rule)
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 16 * 7)
  return { name: r.name, distances: r.distances, rule: ruleText(r.rule), date: mdText(d), start: `${start.getFullYear() !== RACE_YEAR ? `${start.getFullYear()}년 ` : ''}${mdText(start)}` }
})
const raceStart = (key: string) => RACE_ROWS.find(r => r.name.startsWith(key))?.start ?? ''

const FAQ_LD = [
              {
                q: '인터벌 훈련은 얼마나 자주 해야 하나요?',
                a: '일반 러너는 <strong>주 1~2회가 적정</strong>입니다. 주 3회 이상 인터벌은 회복이 부족해 부상·과훈련 위험이 큽니다. 대회 준비 시기 8~12주 전부터 주 1회로 시작해 대회 4주 전 주 2회로 늘리는 것이 일반적입니다. 장거리주(주말)와 인터벌(주중)은 <strong>적어도 2일 이상 간격</strong>을 두세요. 횟수와 함께 한 번의 분량도 중요합니다 — 주간 거리 대비 상한은 본문 &lsquo;1회 세션 분량 상한&rsquo; 표를 참고하세요.',
              },
              {
                q: '야소 800만으로 풀코스 기록을 정확히 알 수 있나요?',
                a: '<strong>야소 800은 스피드 능력 지표이지 정확한 풀코스 예측 공식은 아닙니다.</strong> 실제 풀코스 기록은 주간 누적 거리, 장거리주(30km 이상) 경험, 마라톤 페이스 지속주, 후반 페이스 유지력 등 종합 지구력에 좌우됩니다. 야소 800에서 3시간 30분이 나와도 장거리주가 부족하면 풀코스는 4시간을 넘길 수 있습니다. 참고용으로 활용하되 다른 훈련과 병행하세요.',
              },
              {
                q: '400m 인터벌과 800m 인터벌 중 어느 게 좋은가요?',
                a: '훈련 목적에 따라 다릅니다. <strong>400m</strong>는 스피드·V̇O2 향상(5km 기록 향상에 유리), <strong>800m</strong>는 5km~10km 페이스·야소 800(마라톤 준비), <strong>1km</strong>는 V̇O₂max(I) 자극·5~10km 기록 향상, <strong>1.6km</strong>는 I·T 혼합으로 10km·하프 준비에 적합합니다. 한 가지만 고집하지 말고 주기별로 다양하게 섞는 것이 좋습니다.',
              },
              {
                q: '인터벌 훈련 후 회복은 얼마나 해야 하나요?',
                a: `강도가 높을수록 회복을 길게 잡습니다. 잭 다니엘스 기준으로 <strong>R 페이스</strong>는 달린 시간의 2~3배(또는 달린 거리만큼 조깅), <strong>I 페이스</strong>는 달린 시간과 같거나 조금 짧게, <strong>T 페이스</strong>(크루즈 인터벌)는 5분 달릴 때마다 약 1분입니다. 5km ${EX_5K} 러너라면 R 400m(${fmtMS(REC_R400)}) 뒤 ${fmtMS(REC_R400 * 2)}~${fmtMS(REC_R400 * 3)}, I 800m(${fmtMS(REC_I800)}) 뒤 ${fmtMS(REC_I800)} 이내, T 1.6km(${fmtMS(REC_T1600)}) 뒤 약 ${fmtMS(REC_T1600 / 5)}입니다. <strong>회복 중에는 완전 정지보다 가벼운 조깅</strong>을 하세요.`,
              },
              {
                q: '트랙이 없으면 인터벌 훈련이 불가능한가요?',
                a: '<strong>가능합니다.</strong> ① GPS 시계로 거리 기반 인터벌(400m·800m·1km 자동 측정), ② 시간 기반 인터벌(&ldquo;3분 빠르게 + 2분 느리게 × 8회&rdquo;), ③ 한적한 도로·공원 직선 구간 활용, ④ 운동장·공원 둘레 활용(둘레 길이 측정 후 반복) 등 다양한 방법이 있습니다. 트랙이 없어도 충분히 효과적이며, 도로·언덕에서의 변화가 실제 대회 코스 적응에 도움이 됩니다.',
              },
              {
                q: '16주 훈련 스케줄에서 매주 페이스가 다른 이유는?',
                a: '점진적 강도 증가 + 회복주 + 피크 + 테이퍼 구조입니다. 16주 기준으로는 다음과 같습니다.<br/>• <strong>1~2주</strong>: 적응 (낮은 강도로 폼 익히기)<br/>• <strong>3~11주</strong>: 발전 (5·7·9·11주차에 종목별 메뉴 목록의 다음 메뉴로)<br/>• <strong>13~14주</strong>: 피크 (메뉴 목록의 마지막 단계)<br/>• <strong>15~16주</strong>: 테이퍼 (강도를 낮추고 대회 준비)<br/>그 사이 4·8·12주차는 강도를 낮춘 회복주입니다. 기간을 줄여도 적응 2주와 마지막 2주 테이퍼는 유지되고, 발전·피크 구간이 짧아집니다. 본 도구의 [훈련 스케줄] 표는 각 주의 페이스·회복·총 거리를 표시합니다. 매주 같은 강도는 정체·부상 위험.',
              },
              {
                q: '1바퀴(400m) 페이스가 왜 중요한가요?',
                a: `인터벌 효과는 <strong>페이스 일정성</strong>에 좌우됩니다. 첫 바퀴가 너무 빠르면 후반에 무너지고, 마지막 바퀴만 빨라지면 초반이 너무 느렸다는 뜻입니다. 계산기의 랩타임 표는 1km 페이스를 거리에 비례해 나누므로 어떤 거리든 1바퀴 환산은 같습니다 — 5km ${EX_5K} 러너의 I 페이스 ${fmtMS(EX.I)}/km라면 800m ${fmtMS(EX.I * 0.8)}·1.6km ${fmtMS(EX.I * 1.6)} 모두 1바퀴 약 ${(EX.I * 0.4).toFixed(1)}초(${fmtMS(EX.I * 0.4)})입니다. 긴 인터벌에서는 400m마다 이 통과 시각을 확인하세요.`,
              },
              {
                q: `VDOT ${EX_VDOT_S}가 무슨 의미인가요?`,
                a: `VDOT는 잭 다니엘스가 레이스 기록으로 거꾸로 구한 &lsquo;달리기 능력 지수&rsquo;로, 실험실 VO₂max와 같은 값은 아닙니다. 5km ${EX_5K}를 뛰면 VDOT ${EX_VDOT_S}입니다. 같은 공식으로 VDOT별 5km 기록을 보면:<br/>${[30, 40, 50, 60, 70].map(v => `• VDOT ${v}: 5km 약 ${fmtMS(timeFromVdot(5, v))}`).join('<br/>')}<br/>숫자가 클수록 능력이 높고, 본 도구는 이 VDOT로 5가지 강도(E·M·T·I·R) 페이스를 산출합니다.`,
              },
              {
                q: '인터벌 훈련 중 부상이 의심되면 어떻게 해야 하나요?',
                a: '<strong>즉시 중단</strong> + 다음 단계 진행:<br/>1. 운동 즉시 중단<br/>2. RICE (Rest·Ice·Compression·Elevation)<br/>3. 24시간 관찰<br/>4. 통증 지속 → 정형외과·재활의학과<br/><strong>응급 신호 (즉시 119)</strong>: 가슴 통증·심한 호흡곤란 / 어지러움·실신 / 다리 마비.<br/>통증을 참고 계속 훈련하지 말고, 회복 후에는 분량을 줄여 점진적으로 복귀하세요. [훈련 스케줄] 탭에서 [부상 이력 있음]을 체크하면 모든 페이스가 10% 느리게 잡힙니다.',
              },
              {
                q: '한국 인기 대회 시즌에 맞춰 훈련하려면?',
                a: `본 도구의 [훈련 스케줄] 탭 상단에 <strong>한국 인기 대회 빠른 선택</strong>이 있습니다. 대회 클릭 시 D-day와 종목이 자동 입력됩니다. 최근 개최 요일 규칙으로 추정한 ${RACE_YEAR}년 대회 기준 16주 시작일은 다음과 같습니다.<br/>• <strong>봄 대회</strong> (2~4월): 대구마라톤 ${raceStart('대구')} / 서울마라톤(동아마라톤) ${raceStart('서울마라톤')} / 서울하프 ${raceStart('서울하프')} — 전년 11월~1월 시작<br/>• <strong>가을 대회</strong> (10~11월): 춘천 ${raceStart('춘천')} / JTBC ${raceStart('JTBC')} — 7월 초·중순 시작<br/>본 도구의 16주 스케줄은 마지막 2주(15~16주차)를 테이퍼로 잡습니다. 개최일은 해마다 달라지니 공식 공지를 확인하세요.`,
              },
              // ── 이지·LSD 탭 (구 /tools/sports/lsd FAQ에서 겹치지 않는 2개 — '이지런만 하면 빨라지나요?'는 E-1 본문 80/20 문단에 흡수, 총 12개 상한) ──
              {
                q: 'LSD는 얼마나 자주, 얼마나 길게 해야 하나요?',
                a: '주간 거리의 상당 부분을 이지 강도로 채우되, 가장 긴 롱런은 주 1회가 일반적입니다. 거리는 무리하지 말고 주당 10% 이내로 늘리세요. 초보자는 시간(예: 60~90분)으로 잡는 편이 안전합니다.',
              },
              {
                q: '오르막에서는 페이스를 맞춰야 하나요?',
                a: '아니요. LSD는 페이스보다 ‘강도(편안함·심박)’가 기준입니다. 오르막에서는 페이스가 느려지고 심박이 올라가는 게 정상이니, 심박/호흡을 기준으로 강도를 일정하게 유지하세요.',
              },
            ]

export default function IntervalTrainingPage() {
  return (
    <ToolPage width={760} slug="/tools/sports/interval-training">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />인터벌 훈련 계산기
      </h1>
      <p className="tp-lead">
        VDOT 공식 기반 인터벌 페이스 + <strong style={{ color: 'var(--text)' }}>4~16주 풀 트레이닝 스케줄</strong>.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="페이스 — Daniels·Gilbert VDOT 공식과 Daniels 5단계 훈련 강도(%VO₂max), 이지·LSD 탭 — Riegel 거리 환산·Tanaka 최대심박·Karvonen 심박예비, 야소 800 — Bart Yasso의 경험칙"
        sources={[
          { label: 'VDOT O2 러닝 계산기 (Jack Daniels 공식)', href: 'https://vdoto2.com/calculator/' },
          { label: 'Seiler (2010) 지구력 선수의 훈련 강도 분포 — IJSPP', href: 'https://doi.org/10.1123/ijspp.5.3.276' },
          { label: 'Riegel (1981) Athletic Records and Human Endurance — American Scientist', href: 'https://pubmed.ncbi.nlm.nih.gov/7235349/' },
          { label: 'Tanaka 외 (2001) 연령 예측 최대심박 재검토 — JACC', href: 'https://doi.org/10.1016/S0735-1097(00)01054-8' },
          { label: 'ACSM·AND·DC (2016) 영양과 운동 수행 공동 성명 — MSSE', href: 'https://pubmed.ncbi.nlm.nih.gov/26891166/' },
          { label: 'World Athletics 경기·기술 규칙 (레인 폭·측정선, TR 14)', href: 'https://worldathletics.org/about-iaaf/documents/book-of-rules' },
          { label: 'World Athletics Track and Field Facilities Manual (표준 400m 트랙 규격)', href: 'https://worldathletics.org/about-iaaf/documents/technical-information' },
          { label: "Jack Daniels, Daniels' Running Formula 4판 (Human Kinetics) — 강도별 회복·1회 분량 상한", href: 'https://us.humankinetics.com/products/daniels-running-formula-4th-edition' },
          { label: "Bart Yasso — Yasso 800's (BartYasso.com)", href: 'https://www.bartyasso.com/800s' },
        ]}
      />

      <IntervalTrainingClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. Jack Daniels 5가지 강도 (E·M·T·I·R) ── */}
        <div>
          <h2 className="g-h2">
            러닝 훈련의 5가지 강도 — E · M · T · I · R 완벽 정리
          </h2>
          <p className="g-p">
            미국 러닝 코치 <strong>잭 다니엘스(Jack Daniels)</strong>는 러닝 훈련을 <strong>5가지 강도</strong>로 나눴습니다.
            느린 것부터 빠른 순서로 <strong>E → M → T → I → R</strong>이며, 강도마다 키워지는 능력이 다릅니다.
            아래 카드의 예시 페이스는 계산기 첫 화면과 같은 <strong>5km {EX_5K} 러너(VDOT {EX_VDOT_S})</strong> 기준이고, 본인 기록을 넣으면 계산기가 같은 공식으로 다시 계산합니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                i: 'E', n: 'Easy · 편하게', c: 'var(--emerald-600)',
                what: '심폐 기초·모세혈관·미토콘드리아 발달 (러닝의 토대)',
                feel: '옆 사람과 대화가 편하게 되는 속도. 코로 숨쉬기 가능',
                pace: `VO₂max의 ${pct(INTENSITY_PCT.E)}~${pct(E_FAST_PCT)}% — 예시 ${fmtMS(EX.eFast)}~${fmtMS(EX.eSlow)}/km (마라톤 페이스보다 ${E_VS_M_LO}~${E_VS_M_HI}초 느림)`,
                use: '회복주, 워밍업·쿨다운, 장거리주(LSD)의 기본 페이스',
              },
              {
                i: 'M', n: 'Marathon · 마라톤', c: 'var(--purple-600)',
                what: '목표 풀코스 페이스에 몸을 적응시키기 (페이스 감각·연료 효율)',
                feel: '대화는 짧게 가능. "조금 힘들지만 오래 갈 수 있는" 정도',
                pace: `VO₂max의 ${pct(INTENSITY_PCT.M)}% — 예시 ${fmtMS(EX.M)}/km (풀코스 목표 페이스)`,
                use: '풀코스 준비기의 페이스 지속주(10~20km), 대회 리허설',
              },
              {
                i: 'T', n: 'Threshold · 역치(템포)', c: 'var(--cyan-600)',
                what: '젖산 역치 끌어올리기 → 더 빠른 속도를 더 오래 유지',
                feel: '"편하게 힘든(comfortably hard)" 강도. 한두 단어만 겨우 말함',
                pace: `VO₂max의 ${pct(INTENSITY_PCT.T)}% — 예시 ${fmtMS(EX.T)}/km (약 1시간 레이스로 버틸 수 있는 속도)`,
                use: '20분 안팎의 템포런, 1~2km 반복(크루즈 인터벌, 5분당 1분 휴식)',
              },
              {
                i: 'I', n: 'Interval · 인터벌', c: 'var(--sky-500)',
                what: '최대산소섭취량(V̇O₂max) 자극 → 심폐 능력의 천장을 올림',
                feel: '말하기 거의 불가능. 레이스라면 10~15분 정도만 버틸 수 있는 강도',
                pace: `VO₂max의 ${pct(INTENSITY_PCT.I)}% — 예시 ${fmtMS(EX.I)}/km (5km 레이스 페이스 부근)`,
                use: '한 번에 3~5분(800m~1.2km) 반복 + 달린 시간 이하의 회복 조깅 (이 도구의 핵심 메뉴)',
              },
              {
                i: 'R', n: 'Repetition · 반복주', c: 'var(--red-600)',
                what: '스피드·러닝 이코노미(달리기 효율)·무산소 파워',
                feel: '거의 전력 질주. 폼이 무너지지 않는 선까지만',
                pace: `VDOT의 ${pct(INTENSITY_PCT.R)}%에 해당하는 산소 비용(VO₂max를 넘는 속도) — 예시 ${fmtMS(EX.R)}/km, 400m ${fmtMS(EX.R * 0.4)} (약 1마일 레이스 페이스)`,
                use: '200~400m 짧은 반복(한 번 2분 이내) + 달린 시간의 2~3배 회복',
              },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `4px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
                <p style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 18, color: g.c, fontWeight: 800, fontFamily: 'var(--font-sans)' }}>{g.i}</span>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginLeft: 8 }}>{g.n}</span>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '74px 1fr', gap: '4px 10px', fontSize: 13, lineHeight: 1.65 }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>키우는 것</span><span style={{ color: 'var(--text)' }}>{g.what}</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>체감</span><span style={{ color: 'var(--text)' }}>{g.feel}</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>페이스</span><span style={{ color: 'var(--text)' }}>{g.pace}</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>대표 훈련</span><span style={{ color: 'var(--text)' }}>{g.use}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <Callout tone="tip" title="한 줄 요약">
              느릴수록(E·M) 오래 달리는 <strong>지구력</strong>을, 빠를수록(I·R) 짧고 강하게 <strong>심폐·스피드</strong>를 키웁니다.
              인터벌 훈련에서 가장 많이 쓰는 강도는 <strong>I(인터벌)</strong>와 <strong>R(반복주)</strong>이며, 둘 다 충분한 회복 조깅과 함께 해야 효과가 납니다.
            </Callout>
          </div>
          <p className="g-note">
            E(이지) 강도는 위 계산기의 <strong>[이지·LSD]</strong> 탭에서 본인 이지 페이스 범위·존2 심박·롱런 보급량을 따로 계산할 수 있고, 아래 <a href="#easy-deep-dive" style={{ color: 'var(--accent-ink)', textDecoration: 'underline', textUnderlineOffset: 3 }}>E 강도 깊이 보기</a>에서 자세히 다룹니다.
          </p>
        </div>

        {/* ── 2. 계산 방식 ── */}
        <div>
          <h2 className="g-h2">
            계산 방식 — 기록 → VDOT → 강도별 페이스
          </h2>
          <p className="g-p">
            [인터벌 페이스] 탭은 다니엘스와 길버트(Daniels &amp; Gilbert, 1979)가 레이스 기록을 분석해 만든 두 회귀식을 씁니다. 하나는 <strong>어떤 속도로 달릴 때 산소가 얼마나 드는지</strong>, 다른 하나는 <strong>경기 시간이 길수록 최대치의 몇 %까지만 버틸 수 있는지</strong>입니다. 기록 하나로 둘을 나누면 VDOT가 나오고, VDOT에 강도 계수를 곱해 거꾸로 풀면 강도별 페이스가 됩니다.
          </p>
          <ol className="g-list">
            <li><strong>산소 비용</strong>: 평균 속도 v(m/분)일 때 VO₂ = −4.60 + 0.182258·v + 0.000104·v²</li>
            <li><strong>지속 가능 비율</strong>: 경기 시간 t(분) 동안 %VO₂max = 0.8 + 0.1894393·e<sup>−0.012778t</sup> + 0.2989558·e<sup>−0.1932605t</sup></li>
            <li><strong>VDOT</strong> = 산소 비용 ÷ 지속 가능 비율</li>
            <li><strong>강도별 페이스</strong>: VDOT × 강도 계수(E {pct(INTENSITY_PCT.E)}~{pct(E_FAST_PCT)}% · M {pct(INTENSITY_PCT.M)}% · T {pct(INTENSITY_PCT.T)}% · I {pct(INTENSITY_PCT.I)}% · R {pct(INTENSITY_PCT.R)}%)를 1번 식에 넣어 속도를 구하고 1km 페이스로 바꿈</li>
          </ol>
          <p className="g-p">
            <strong>계산 예시 — 5km {EX_5K}</strong>: 평균 속도 v = 5,000m ÷ {EX_T_MIN}분 = {EX_V.toFixed(1)}m/분 → 산소 비용 {EX_VO2.toFixed(2)} → {EX_T_MIN}분 동안의 지속 비율 {EX_SUSTAIN.toFixed(3)} → VDOT = {EX_VO2.toFixed(2)} ÷ {EX_SUSTAIN.toFixed(3)} ≈ <strong>{EX_VDOT_S}</strong>.
            I 페이스는 {EX_VDOT_S} × {INTENSITY_PCT.I} = {EX_I_VO2.toFixed(1)}의 산소 비용에 해당하는 속도 {EX_I_V.toFixed(1)}m/분이므로 1km <strong>{fmtMS(EX.I)}</strong>입니다.
          </p>
          <p className="g-p">
            [훈련 목적] 버튼은 이 가운데 어느 강도를 인터벌 페이스로 쓸지 고릅니다. 같은 5km {EX_5K} 러너라면 목적별 페이스는 아래와 같습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
              <thead>
                <tr><th scope="col" style={TH}>훈련 목적</th><th scope="col" style={TH}>강도</th><th scope="col" style={THN}>1km 페이스</th><th scope="col" style={TH}>의도</th></tr>
              </thead>
              <tbody>
                {GOAL_ROWS.map(r => (
                  <tr key={r.goal}><td style={TD}><strong>{r.goal}</strong></td><td style={TD}>{r.zone}</td><td style={TDN}>{fmtMS(r.pace)}</td><td style={TD}>{r.note}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ [목표 기록] 모드는 강도 계수를 적용하지 않고, 입력한 1km 페이스를 그대로 랩타임 계산에 씁니다. 기록 모드에서 VDOT가 {VDOT_MIN} 미만(5km 약 {VDOT_MIN_5K}보다 느림)이거나 {VDOT_MAX} 초과(5km 약 {VDOT_MAX_5K}보다 빠름)면 공식 적용 범위 밖이라 페이스 대신 확인 안내가 뜹니다.
          </p>
        </div>

        {/* ── 3. 거리별 추천 메뉴 (목적별 거리 선택 통합) ── */}
        <div>
          <h2 className="g-h2">
            거리별 인터벌 추천 메뉴
          </h2>
          <p className="g-p">
            어떤 거리를 고를지는 <strong>훈련 목적</strong>에 따라 달라집니다. 짧을수록 속도(R), 3~5분짜리는 V̇O₂max(I), 길수록 역치(T)에 가깝습니다. 한 가지 거리만 고집하지 말고 주기별로 바꾸는 편이 좋습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr>
                  {['거리', '주된 강도·효과', '권장 횟수', '회복', '필요 주간 거리', '적합 목표·시기'].map(h => (
                    <th scope="col" key={h} style={h === '필요 주간 거리' ? THN : TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MENU_ROWS.map((r, i) => (
                  <tr key={r.d}>
                    <td style={TD}><strong>{r.d}</strong></td>
                    <td style={TD}>{r.e}</td>
                    <td style={TD}>{r.rLo}~{r.rHi}회</td>
                    <td style={TD}>{r.c}</td>
                    <td style={TDN}>주 {MENU_NEED[i].lo}~{MENU_NEED[i].hi}km</td>
                    <td style={TD}>{r.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ &lsquo;필요 주간 거리&rsquo;는 권장 횟수의 가장 가벼운 조합(짧은 거리 × 적은 횟수)과 가장 무거운 조합을 아래 &lsquo;1회 세션 분량 상한&rsquo;(T 주간 거리의 {pct(SESSION_CAP.T.pct)}%·I {pct(SESSION_CAP.I.pct)}%·R {pct(SESSION_CAP.R.pct)}%)에 넣어 거꾸로 구한 값입니다. 권장 횟수의 위쪽 끝은 주 {MENU_NEED_HI_MIN}~{MENU_NEED_HI_MAX}km를 달리는 러너의 분량입니다. 주간 거리가 그 줄의 앞 숫자보다 적으면 상한 표에 맞춰 횟수를 줄이세요.
          </p>
          <p className="g-p" style={{ marginTop: 12 }}>
            계산기의 <strong>[추천 인터벌 세션]</strong>에서 거리와 횟수를 고르면 워밍업·쿨다운 각 1.5km(각 9분으로 가정)와 회복을 붙여 한 세션을 정리합니다. 세션 강도는 기록 모드면 [훈련 목적]의 강도, 목표 페이스 모드면 거리로 어림합니다(400m 이하 R · 1.2km 이하 I · 그보다 길면 T). 회복은 아래 회복 표의 규칙을 그대로 따릅니다 — R은 달린 거리만큼 조깅(소요 시간은 달린 시간의 2.5배로 합산), I는 달린 거리의 절반쯤을 달린 시간 안에 조깅, T는 달린 시간의 5분의 1 정도만 쉽니다.
          </p>
          <p className="g-p">
            첫 화면(5km {EX_5K}, 5km 목적, {SES.dist}m × {SES.reps}회)이라면 1회 {fmtMS(SES_LAP)}, 회복 {SES_REC.jogM}m 조깅 {fmtMS(SES_REC.hiSec)} 이내 × {SES.reps - 1}회로 예상 소요 약 {SES_TOTAL_MIN}분입니다. 다만 빠른 구간 {SES_FAST_KM.toFixed(1)}km는 분량 상한으로 보면 주 {SES_NEED}km 러너의 분량이라, 주간 거리가 그보다 적으면 횟수를 줄여야 합니다. 같은 러너가 스피드 목적으로 400m를 고르면 R 페이스로 1회 {fmtMS(EX.R * 0.4)}, 회복은 400m 조깅 {fmtMS(SES_R400.loSec)}~{fmtMS(SES_R400.hiSec)}입니다. R을 2분 넘게, I를 5분 넘게 한 번에 달리는 거리를 고르면 계산기가 거리를 줄이라고 안내합니다.
          </p>
        </div>

        {/* ── 4. VDOT 표 ── */}
        <div>
          <h2 className="g-h2">
            VDOT 표 — 5km 기록별 강도 페이스
          </h2>
          <p className="g-p">
            최근 5km 기록과 가장 가까운 줄을 찾으면 됩니다. 5km 목적 인터벌은 <strong>I 1km</strong> 열, 스피드 목적은 <strong>R 400m</strong> 열이 계산기 결과와 같습니다. 기록이 표 사이에 있으면 두 줄 사이 값이 되며, 정확한 값은 위 계산기에 넣어 확인하세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr>
                  {['5km 기록', 'VDOT', 'M /km', 'T /km', 'I /km', 'I 400m', 'R 400m'].map((h, i) => (
                    <th scope="col" key={h} style={i === 0 ? TH : THN}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VDOT_TABLE.map(r => (
                  <tr key={r.t}>
                    <td style={TD}><strong>{fmtMS(r.t)}</strong></td>
                    <td style={TDN}>{r.v.toFixed(1)}</td>
                    <td style={TDN}>{fmtMS(r.M)}</td>
                    <td style={TDN}>{fmtMS(r.T)}</td>
                    <td style={TDN}><strong>{fmtMS(r.I)}</strong></td>
                    <td style={TDN}>{fmtMS(r.I * 0.4)}</td>
                    <td style={TDN}>{fmtMS(r.R * 0.4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 위 계산기와 같은 Daniels·Gilbert 공식(M {pct(INTENSITY_PCT.M)}%·T {pct(INTENSITY_PCT.T)}%·I {pct(INTENSITY_PCT.I)}%·R {pct(INTENSITY_PCT.R)}%)으로 빌드 때 계산한 값입니다. 기록 차이가 30초라도 I 페이스는 1km당 수 초씩 달라지므로, 새 기록이 나오면 다시 계산하세요.
          </p>
        </div>

        {/* ── 5. 회복 가이드 ── */}
        <div>
          <h2 className="g-h2">
            회복 시간·거리 가이드
          </h2>
          <p className="g-p">
            회복은 강도가 높을수록 길어집니다. R은 매 반복을 거의 완전히 회복한 상태에서 빠르고 바른 폼으로 뛰는 것이 목적이고, I는 회복을 짧게 잡아 심박이 다 떨어지기 전에 다음 반복을 시작해야 V̇O₂max 근처에 머무는 시간이 쌓입니다. T는 원래 쉬지 않고 달리는 강도라 휴식을 아주 짧게 둡니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
              <thead>
                <tr><th scope="col" style={TH}>강도</th><th scope="col" style={TH}>회복 시간 (Daniels)</th><th scope="col" style={TH}>회복 방법</th><th scope="col" style={TH}>5km {EX_5K} 러너 예시</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td style={TD}><strong>R 반복주</strong></td>
                  <td style={TD}>달린 시간의 2~3배</td>
                  <td style={TD}>달린 거리만큼 가벼운 조깅</td>
                  <td style={TD}>400m {fmtMS(REC_R400)} → 회복 {fmtMS(REC_R400 * 2)}~{fmtMS(REC_R400 * 3)}</td>
                </tr>
                <tr>
                  <td style={TD}><strong>I 인터벌</strong></td>
                  <td style={TD}>달린 시간과 같거나 조금 짧게</td>
                  <td style={TD}>가벼운 조깅 (거리는 절반 안팎)</td>
                  <td style={TD}>800m {fmtMS(REC_I800)} → 회복 {fmtMS(REC_I800)} 이내</td>
                </tr>
                <tr>
                  <td style={TD}><strong>T 역치</strong></td>
                  <td style={TD}>5분 달릴 때마다 약 1분</td>
                  <td style={TD}>짧은 조깅 또는 제자리 휴식</td>
                  <td style={TD}>1.6km {fmtMS(REC_T1600)} → 회복 약 {fmtMS(REC_T1600 / 5)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            회복 중에는 완전히 멈추기보다 <strong>가볍게 조깅</strong>하는 편이 다음 반복 준비에 유리합니다. 회복 조깅이 너무 빨라 다음 반복에서 목표 랩타임이 계속 밀린다면, 그날은 반복 횟수를 줄이고 끝내는 것이 맞습니다.
          </p>
        </div>

        {/* ── 6. 1회 세션 분량 상한 ── */}
        <div>
          <h2 className="g-h2">
            1회 세션 분량 상한 — 주간 거리로 정한다
          </h2>
          <p className="g-p">
            인터벌은 &lsquo;몇 번 뛰느냐&rsquo;보다 &lsquo;평소 얼마나 달리느냐&rsquo;에 맞춰야 합니다. 다니엘스는 한 번의 세션에서 각 강도로 달리는 거리를 주간 거리에 비례해 제한합니다 — <strong>T는 주간 거리의 10%</strong>, <strong>I는 8%와 10km 중 작은 값</strong>, <strong>R은 5%와 8km 중 작은 값</strong>까지입니다. 워밍업·쿨다운·회복 조깅은 포함하지 않은 &lsquo;빠른 구간&rsquo;만의 합입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr>
                  {['주간 거리', 'T 상한', 'I 상한', '800m I 최대', 'R 상한'].map((h, i) => (
                    <th scope="col" key={h} style={i === 0 ? TH : THN}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAP_ROWS.map(r => (
                  <tr key={r.w}>
                    <td style={TD}><strong>{r.w}km</strong></td>
                    <td style={TDN}>{r.T.toFixed(1)}km</td>
                    <td style={TDN}>{r.I.toFixed(1)}km</td>
                    <td style={TDN}>{r.reps800}회</td>
                    <td style={TDN}>{r.R.toFixed(1)}km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            예를 들어 주 {CAP40.w}km를 달리는 러너라면 I 강도는 한 번에 {CAP40.I.toFixed(1)}km, 800m로 {CAP40.reps800}회까지가 기준입니다. [훈련 스케줄] 탭의 메뉴는 종목·경험·주차로 정해지고 <strong>입력한 주간 거리는 메뉴 분량에 반영되지 않으므로</strong>, 표의 상한보다 많은 메뉴가 나오면 횟수를 줄여서 하세요. 주간 거리가 적은 입문 단계일수록 인터벌 분량보다 이지런으로 주간 거리를 늘리는 쪽이 효과가 큽니다.
          </p>
        </div>

        {/* ── 7. 1바퀴(400m) 페이스 일정성 ── */}
        <div>
          <h2 className="g-h2">
            1바퀴(400m) 페이스 일정성 — 인터벌 효과의 핵심
          </h2>
          <p className="g-p">
            계산기의 거리별 랩타임 표는 1km 페이스를 거리에 비례해 나눈 값이라, 어떤 거리를 골라도 <strong>1바퀴(400m) 환산은 같습니다</strong>. 트랙에서 이 값을 쓰는 방법은 긴 인터벌 도중 400m마다 통과 시각을 확인하는 것입니다. 아래는 5km {EX_5K} 러너의 I 페이스({fmtMS(EX.I)}/km, 1바퀴 {fmtMS(EX.I * 0.4)})를 끝까지 유지할 때의 통과 시각입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
              <thead>
                <tr>
                  <th scope="col" style={TH}>인터벌 거리</th>
                  {SPLIT_MARKS.map(m => <th scope="col" key={m} style={THN}>{m}m 통과</th>)}
                  <th scope="col" style={THN}>도착</th>
                </tr>
              </thead>
              <tbody>
                {SPLIT_DISTS.map(d => (
                  <tr key={d}>
                    <td style={TD}><strong>{d >= 1000 ? `${d / 1000}km` : `${d}m`}</strong> ({d / 400}바퀴)</td>
                    {SPLIT_MARKS.map(m => <td key={m} style={TDN}>{m < d ? fmtMS(EX.I * m / 1000) : '—'}</td>)}
                    <td style={TDN}><strong>{fmtMS(EX.I * d / 1000)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            첫 400m를 통과 시각보다 눈에 띄게 빨리 지나면 후반에 무너지고, 마지막 바퀴만 빨라지면 초반이 너무 느렸다는 뜻입니다. GPS 시계는 트랙 곡선 구간에서 거리를 부정확하게 재기 쉬우니, 트랙에서는 400m마다 랩 버튼을 누르거나 시계의 트랙 전용 모드를 쓰는 편이 정확합니다.
          </p>
        </div>

        {/* ── 8. 트랙 환산·레인별 거리 ── */}
        <div>
          <h2 className="g-h2">
            트랙 거리 환산과 레인별 1바퀴 거리
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 14 }}>
            {[
              { d: '200m',  l: '0.5바퀴' },
              { d: '400m',  l: '1바퀴' },
              { d: '800m',  l: '2바퀴' },
              { d: '1000m', l: '2.5바퀴' },
              { d: '1200m', l: '3바퀴' },
              { d: '1600m', l: '4바퀴 (약 1마일)' },
            ].map(r => (
              <div key={r.d} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: 16, color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{r.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{r.l}</p>
              </div>
            ))}
          </div>
          <p className="g-p">
            1바퀴 400m는 <strong>1레인 기준</strong>입니다. World Athletics 기술 규칙은 레인 폭을 1.22m로 두고, 1레인은 안쪽 연석에서 0.30m, 2레인부터는 안쪽 선에서 0.20m 떨어진 선으로 거리를 잽니다. 곡선 반지름이 커지는 바깥 레인일수록 한 바퀴가 길어지므로, 붐비는 트랙에서 바깥 레인으로 달리며 1레인 랩타임을 맞추면 실제로는 목표보다 빠르게 달린 셈이 됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 440 }}>
              <thead>
                <tr><th scope="col" style={TH}>레인</th><th scope="col" style={THN}>1바퀴 거리</th><th scope="col" style={THN}>1레인보다</th><th scope="col" style={THN}>I {fmtMS(EX.I)}/km로 1바퀴</th></tr>
              </thead>
              <tbody>
                {LANES.map(l => (
                  <tr key={l.n}>
                    <td style={TD}><strong>{l.n}레인</strong></td>
                    <td style={TDN}>{l.len.toFixed(2)}m</td>
                    <td style={TDN}>{l.n === 1 ? '—' : `+${l.extra.toFixed(2)}m`}</td>
                    <td style={TDN}>{fmtMS(l.lap)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ World Athletics 시설 매뉴얼(Track and Field Facilities Manual)의 표준 400m 트랙(곡선 반지름 36.50m·직선 84.39m) 기준 계산값입니다. 학교 운동장 트랙은 200m·300m 등 규격이 아닌 경우가 많으니, 먼저 둘레를 확인하고 계산기의 거리 선택을 그에 맞추세요.
          </p>
        </div>

        {/* ── 9. 야소 800 ── */}
        <div>
          <h2 className="g-h2">
            야소 800 — 800m 평균으로 풀코스 가늠하기
          </h2>
          <p className="g-p">
            미국 러닝 잡지 러너스월드(Runner&apos;s World)의 바트 야소(Bart Yasso)가 알린 풀코스 준비 훈련입니다. 800m를 10회 반복하고 반복 사이에는 달린 시간만큼 조깅합니다. 처음부터 10회를 뛰는 것이 아니라 4~5회에서 시작해 목표 시간을 지킬 수 있을 때 주마다 1회씩 늘려 10회에 이르는 방식이고, 10회(I 강도 8km)는 위 &lsquo;1회 세션 분량 상한&rsquo;으로 보면 주 {YASSO10_NEED}km 안팎을 달리는 러너의 분량입니다. 주간 거리가 그보다 적다면 상한 표의 &lsquo;800m I 최대&rsquo; 횟수까지만 늘리세요. <strong>800m 평균 &lsquo;분:초&rsquo;를 풀코스 &lsquo;시:분&rsquo;으로 읽는</strong> 것이 전부라, 3분 30초 평균이면 풀코스 3시간 30분이 기대치입니다. 계산기의 [야소 800] 탭은 이 환산과 역산(목표 풀코스 → 800m 목표 시간)을 해 주고, 반복 횟수와 회별 기록으로 신뢰도를 매깁니다 — 회별 기록을 넣어 10회 이상·최고와 최저 차 5초 미만이면 &lsquo;높음&rsquo;, 6회 이상(회별 기록을 넣었다면 차 10초 미만)이면 &lsquo;보통&rsquo;, 그 밖은 &lsquo;참고 수준&rsquo;입니다.
          </p>
          <p className="g-p">
            같은 800m 평균을 <strong>I 페이스로 달렸다고 보고</strong> VDOT를 역산해 풀코스를 예측하면 야소 800과 얼마나 차이 날까요? 아래는 도구의 VDOT 공식으로 계산한 비교입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr><th scope="col" style={TH}>800m 평균</th><th scope="col" style={THN}>야소 예측</th><th scope="col" style={THN}>역산 VDOT</th><th scope="col" style={THN}>VDOT 풀코스 예측</th><th scope="col" style={THN}>차이</th></tr>
              </thead>
              <tbody>
                {YASSO_ROWS.map(r => (
                  <tr key={r.t800}>
                    <td style={TD}><strong>{fmtMS(r.t800)}</strong></td>
                    <td style={TDN}>{fmtHMS(r.yasso)}</td>
                    <td style={TDN}>{r.v.toFixed(1)}</td>
                    <td style={TDN}>{fmtHMS(r.full)}</td>
                    <td style={TDN}>{r.diffMin >= 0 ? '+' : '−'}{Math.abs(Math.round(r.diffMin))}분</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            두 방식의 차이는 약 {YASSO_DIFF_LO}~{YASSO_DIFF_HI}분이고, <strong>800m가 느린 쪽일수록 야소 800이 더 낙관적</strong>입니다. 야소 800의 &lsquo;분:초 = 시:분&rsquo; 관계는 기록에 비례하지만, 실제로는 기록이 느릴수록 풀코스에서 버틸 수 있는 VO₂max 비율이 더 떨어지기 때문입니다. 4시간 이후를 목표로 한다면 야소 결과에 몇 분의 여유를 더해 두세요.
          </p>
          <Callout tone="warn" title="정확한 공식이 아닌 참고 지표">
            야소 800과 VDOT 예측 모두 <strong>풀코스를 달릴 지구력이 이미 있다</strong>는 가정입니다. 30km 이상 롱런 경험이 부족하거나 주간 거리가 적으면 실제 기록은 두 예측보다 느려질 수 있습니다. 풀코스 페이스는 롱런과 마라톤 페이스 지속주로 따로 확인하세요.
          </Callout>
        </div>

        {/* ── 10. 16주 스케줄 구조 ── */}
        <div>
          <h2 className="g-h2">
            16주 풀 인터벌 스케줄 구조
          </h2>
          <p className="g-p">
            [훈련 스케줄] 탭은 종목(5km·10km·하프·풀)마다 정해진 메뉴 목록에서 주차별로 하나를 골라 4~16주 표를 만듭니다. 규칙은 다음과 같습니다.
          </p>
          <ul className="g-list">
            <li><strong>적응(1~2주)</strong>: 인터벌 경험이 &lsquo;없음&rsquo;이면 목록의 첫 메뉴, &lsquo;조금&rsquo;이면 두 번째, &lsquo;꾸준히&rsquo;면 세 번째 메뉴에서 시작해 2주차에 한 단계 올립니다.</li>
            <li><strong>발전</strong>: 3주차는 2주차 메뉴를 한 번 더 하고, 5·7·9·11주차(홀수 주)에 종목별 메뉴 목록의 다음 메뉴로 넘어갑니다. 목록 끝에 닿으면 그 메뉴를 유지합니다. 목록은 거리·횟수·강도를 번갈아 바꾸는 순서라, 다음 메뉴가 늘 더 길거나 더 힘든 것은 아닙니다(예: 5km 목록은 1km × 4회 다음이 R 강도 400m × 8회).</li>
            <li><strong>회복주</strong>: 4·8·12주차는 목록의 가장 가벼운 메뉴로 내립니다(마지막 2주와 겹치면 테이퍼 우선).</li>
            <li><strong>피크</strong>: 대회 4~2주 전 구간. 16주 계획이면 메뉴 목록의 마지막 메뉴에 이르고, 기간이 짧으면 그 전 단계에서 멈출 수 있습니다.</li>
            <li><strong>테이퍼(마지막 2주)</strong>: 대회 전주는 2주차와 같은 메뉴, 대회 주는 가장 가벼운 메뉴입니다.</li>
          </ul>
          <p className="g-p">
            주 2회를 고르면 3주차부터 발전·피크 주에 목록에서 한 단계 앞의 메뉴가 하나 더 붙습니다(앞 메뉴가 더 가볍다는 뜻은 아니니 두 세션 사이는 48시간 이상 띄우세요). 페이스는 메뉴마다 목적 강도(R·I·T·M)를 따로 계산하고, [부상 이력 있음]을 체크하면 모두 10% 느리게 잡습니다. 표의 총거리는 빠른 구간에 세션마다 워밍업·쿨다운 3km를 더한 값입니다. 기간을 줄이면 적응 2주와 테이퍼 2주는 그대로 두고 발전·피크 구간이 짧아집니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
            {[
              { p: '1~2주', n: '적응', d: '인터벌 폼 익히기. 짧은 거리·적은 횟수로 시작.' },
              { p: '3~11주', n: '발전', d: '5·7·9·11주차에 다음 메뉴. 4·8주차는 회복주.' },
              { p: '13~14주', n: '피크', d: '메뉴 목록의 마지막 메뉴. 12주차 회복주 다음.' },
              { p: '15~16주', n: '테이퍼', d: '강도와 분량을 내려 대회 직전 회복.' },
            ].map(m => (
              <div key={m.p} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 800, color: 'var(--accent-ink)', marginBottom: '4px' }}>{m.p}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>{m.n}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{m.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 11. 한국 인기 대회 시즌 ── */}
        <div>
          <h2 className="g-h2">
            한국 인기 마라톤 대회 시즌
          </h2>
          <p className="g-p">
            [훈련 스케줄] 탭의 <strong>대회 빠른 선택</strong>을 누르면 D-day와 종목이 자동 입력됩니다. 개최일은 해마다 공지되므로 계산기는 최근 개최 요일 규칙으로 날짜를 추정합니다. 같은 규칙으로 {RACE_YEAR}년 날짜와 16주 계획의 시작일을 계산하면 다음과 같습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr><th scope="col" style={TH}>대회</th><th scope="col" style={TH}>종목</th><th scope="col" style={TH}>추정 규칙</th><th scope="col" style={THN}>{RACE_YEAR}년 추정일</th><th scope="col" style={THN}>16주 시작</th></tr>
              </thead>
              <tbody>
                {RACE_ROWS.map(r => (
                  <tr key={r.name}>
                    <td style={TD}><strong>{r.name}</strong></td>
                    <td style={TD}>{r.distances}</td>
                    <td style={TD}>{r.rule}</td>
                    <td style={TDN}>{r.date}</td>
                    <td style={TDN}>{r.start}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 추정일이므로 접수 전에 반드시 대회 공식 공지를 확인하세요. 봄 대회는 전년 11월~1월, 가을 대회는 7월에 16주 계획을 시작하게 되며, 10km·하프 대회는 연중 자주 열려 8~12주 단축 스케줄로도 준비할 수 있습니다.
          </p>
        </div>

        {/* ── 12. 주의사항 ── */}
        <div>
          <h2 className="g-h2">
            인터벌 훈련 시 주의사항
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '훈련 빈도', c: 'var(--yellow-700)', items: ['초보: 주 1회', '중급: 주 1~2회', '고급: 주 2~3회', '고강도 날 사이 최소 48시간'] },
              { t: '피해야 할 것', c: 'var(--red-600)', items: ['세션 분량 상한(위 표) 초과', '전날 장거리주·고강도 후 인터벌', '통증을 참고 계속 달리기', '부상 회복 직후 곧바로 원래 분량'] },
              { t: '준비·정리', c: 'var(--emerald-600)', items: ['워밍업 1.5~3km 가벼운 조깅', '동적 스트레칭 5~10분', '인터벌 후 쿨다운 1.5~3km'] },
            ].map(g => (
              <div key={g.t} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                  {g.items.map(it => (<li key={it}>{it}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════ E 강도 깊이 보기 — [이지·LSD] 탭 가이드 (구 /tools/sports/lsd) ══════════ */}

        {/* ── E-1. LSD란 + 회색지대 ── */}
        <div>
          <h2 className="g-h2" id="easy-deep-dive">
            E 강도 깊이 보기 — LSD(롱슬로디스턴스)와 회색지대
          </h2>
          <p className="g-p">
            앞의 5가지 강도 중 <strong>E(이지)</strong>로 긴 거리를 달리는 훈련이 LSD입니다. LSD는 <strong>긴 거리를 천천히, 편안하게</strong> 달리는 저강도 유산소 훈련입니다. 인터벌·템포 같은 고강도 훈련이 &lsquo;엔진 출력&rsquo;을 키운다면, LSD는 그 출력을 오래 유지하게 하는 <strong>유산소 엔진의 크기 자체</strong>를 키웁니다.
          </p>
          <p className="g-p">
            천천히 오래 달리면 미토콘드리아 수·모세혈관 밀도가 늘고 지방을 연료로 쓰는 능력이 좋아집니다. 잘 훈련된 지구력 선수들의 훈련 기록을 정리한 연구(Seiler, 2010)에서도 <strong>훈련 세션의 약 80%가 저강도</strong>, 나머지 20% 정도가 인터벌 같은 고강도였습니다(80/20 법칙).
            다만 이지런만으로는 토대는 커져도 속도 자극이 없어 정체될 수 있으니, 나머지 20%는 인터벌·템포로 채우세요.
          </p>
          <div style={{ marginBottom: 12 }}>
            <Callout tone="warn" title="이지런을 너무 빨리 뛰면 안 되는 이유 — 회색지대(정크 마일)">
              마라톤 페이스보다 살짝 느린 &ldquo;힘들진 않은데 회복도 안 되는&rdquo; 애매한 속도입니다. 많은 아마추어가 매일 여기서 달립니다 — 충분히 느리지 않아 유산소 적응은 약하고, 충분히 빠르지도 않아 자극도 부족하며, 피로만 누적돼 부상·정체로 이어집니다.
            </Callout>
          </div>
          <p className="g-p">
            쉬운 날은 <strong>의식적으로 더 느리게</strong> 달려야 합니다. &ldquo;이렇게 천천히 뛰어도 되나?&rdquo; 싶을 만큼이 정답인 경우가 많습니다. 빠른 자극은 주 1~2회 인터벌·템포에서만 주세요.
          </p>
        </div>

        {/* ── E-2. 적정 이지 페이스 3가지 기준 ── */}
        <div>
          <h2 className="g-h2">
            적정 이지 페이스 잡는 3가지 기준
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
            {[
              { t: '① 대화 테스트', d: '옆 사람과 문장을 끊김 없이 말할 수 있는 속도. 말이 끊기면 너무 빠른 것. 장비 없이 가장 확실한 기준.' },
              { t: '② 존2 심박', d: '최대심박의 약 60~70%. 코로만 호흡해도 버틸 정도. 심박계가 있다면 위 계산기의 [이지·LSD] 탭으로 BPM 구간 확인.' },
              { t: '③ 페이스 기준', d: '10K 페이스보다 약 20~30% 느리게(대개 마라톤 페이스보다 30~75초/km 느림). [이지·LSD] 탭이 자동 산출.' },
            ].map(x => (
              <div key={x.t} style={{ ...easyCard }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: EASY_ACCENT, marginBottom: 6 }}>{x.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75, margin: 0 }}>{x.d}</p>
              </div>
            ))}
          </div>
          <p className="g-note">
            ※ [인터벌 페이스] 탭 강도별 페이스 표의 E 페이스는 Daniels 공식(VO₂max의 {pct(INTENSITY_PCT.E)}~{pct(E_FAST_PCT)}%)이라 폭이 넓습니다 — 5km {EX_5K} 러너라면 {fmtMS(EX.eFast)}~{fmtMS(EX.eSlow)}/km로 마라톤 페이스보다 {E_VS_M_LO}~{E_VS_M_HI}초 느린 구간 전체가 E입니다. [이지·LSD] 탭의 범위(10K 환산 페이스의 1.2~1.3배)는 대부분의 기록에서 그 E 범위 안쪽에 들어가는 좁은 구간이라, 두 숫자가 조금 달라도 같은 강도를 가리킵니다.
          </p>
          <p className="g-note">
            ※ 이지 페이스에서도 케이던스(분당 보수)는 유지하고 보폭만 줄이면 폼은 무너지지 않습니다. 오히려 느린 러닝에서 효율적인 착지·자세를 익히기 좋습니다.
          </p>
        </div>

        {/* ── E-3. 존2 판정 기준 3종 비교 ── */}
        <div>
          <h2 className="g-h2">
            존2 판정 기준 3종 비교 — 같은 &lsquo;존2&rsquo;라도 숫자가 다르다
          </h2>
          <p className="g-p">
            존2를 정하는 방식은 크게 셋 — <strong>최대심박 백분율(%HRmax)</strong>, <strong>카보넨(심박예비, HRR)</strong>, <strong>젖산역치 심박(LTHR)</strong> 기준입니다. 같은 사람이라도 어느 방식을 쓰느냐에 따라 BPM 경계가 크게 달라집니다. 40세·안정시 심박 60인 러너(Tanaka 최대심박 180)를 예로 들면:
          </p>
          <div style={{ ...easyCard, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                <thead>
                  <tr>
                    <th scope="col" style={TH}>기준</th>
                    <th scope="col" style={TH}>존2 정의</th>
                    <th scope="col" style={TH}>예시 BPM</th>
                    <th scope="col" style={TH}>특징</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={TD}><strong>%HRmax</strong></td>
                    <td style={TD}>최대심박 × 60~70%</td>
                    <td style={TD}>108~126</td>
                    <td style={TD}>가장 단순하지만 안정시 심박을 무시 — 훈련된 러너에겐 지나치게 낮게 나오는 경향</td>
                  </tr>
                  <tr>
                    <td style={TD}><strong>카보넨(HRR)</strong></td>
                    <td style={TD}>안정시 + (최대 − 안정시) × 60~70%</td>
                    <td style={TD}>132~144</td>
                    <td style={TD}>안정시 심박을 반영해 개인화. [이지·LSD] 탭이 안정시 심박 입력 시 쓰는 방식</td>
                  </tr>
                  <tr>
                    <td style={TD}><strong>LTHR</strong></td>
                    <td style={TD}>젖산역치 심박 × 85~89%<br />(Friel 러닝 기준)</td>
                    <td style={TD}>140~147<br />(LTHR 165 가정)</td>
                    <td style={TD}>30분 단독 타임트라이얼의 마지막 20분 평균 심박으로 실측 — 나이 공식 오차가 없음</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            하한만 봐도 <strong>108 vs 132 vs 140 — 30bpm 이상</strong> 벌어집니다. 108bpm은 훈련된 러너에겐 빠르게 걷기 수준이라, %HRmax 단독 기준은 강도를 저평가하기 쉽습니다. 안정시 심박을 알고 있다면 반드시 입력해 카보넨 값을 쓰고, 스포츠워치의 &lsquo;존2&rsquo; 알림이 셋 중 어느 방식으로 계산된 것인지도 확인하세요. 세 방식의 숫자가 달라도 목표 강도는 같습니다 — 헷갈리면 대화 테스트로 검증하면 됩니다.
          </p>
        </div>

        {/* ── E-4. 롱런 영양·수분 ── */}
        <div>
          <h2 className="g-h2">
            롱런 영양·수분 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { t: '수분', d: '15~20분마다 한두 모금. 한 번에 많이 마시기보다 자주 나눠 마십니다. 더운 날엔 전해질(나트륨)도 함께.' },
              { t: '탄수 보급', d: '60~75분 미만이면 물만으로 충분. 그 이상이면 30~45분마다 젤 1개(약 25g) 안팎으로 나눠 시간당 탄수 30~60g을 채우세요 — 배고픔을 느끼기 전에.' },
              { t: 'time on feet', d: '마라톤 준비는 거리보다 ‘발 위에서 보낸 시간’이 핵심. 같은 1시간이라도 천천히 오래가 적응에 더 유리합니다.' },
              { t: '페이싱', d: '처음 5~10분은 더 천천히 워밍업. 컨디션이 좋으면 마지막 구간만 살짝 올리는 네거티브 스플릿을 연습하세요.' },
            ].map(x => (
              <div key={x.t} style={{ ...easyCard, display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: EASY_ACCENT, minWidth: 78, flexShrink: 0 }}>{x.t}</span>
                <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{x.d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── E-5. 풀코스 16주 롱런 진행 예시 ── */}
        <div>
          <h2 className="g-h2">
            풀코스 16주 롱런 진행 예시
          </h2>
          <p className="g-p">
            마라톤 준비의 뼈대는 <strong>주 1회 롱런의 점진적 확장</strong>입니다. 아래는 최장 12~14km를 이미 소화할 수 있는 러너가 16주에 걸쳐 롱런을 32km까지 끌어올리는 예시입니다. &lsquo;3주 늘리고 1주 줄이는&rsquo; 감량주 리듬과 대회 전 3주 테이퍼가 골격입니다. 시간은 LSD 페이스 6:30/km 가정 — 본인 시간은 [이지·LSD] 탭이 산출한 페이스로 잡으세요.
          </p>
          <div style={{ ...easyCard, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                <thead>
                  <tr>
                    <th scope="col" style={TH}>주차</th>
                    <th scope="col" style={TH}>단계</th>
                    <th scope="col" style={TH}>롱런 거리</th>
                    <th scope="col" style={TH}>6:30/km 기준 시간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={TD}>1~3주</td><td style={TD}>기초 쌓기</td><td style={TD}>14 → 16 → 18km</td><td style={TD}>91 → 117분</td></tr>
                  <tr><td style={TD}>4주</td><td style={TD}>감량주</td><td style={TD}>14km</td><td style={TD}>91분</td></tr>
                  <tr><td style={TD}>5~6주</td><td style={TD}>축적</td><td style={TD}>20 → 22km</td><td style={TD}>130 → 143분</td></tr>
                  <tr><td style={TD}>7주</td><td style={TD}>감량주</td><td style={TD}>16km</td><td style={TD}>104분</td></tr>
                  <tr><td style={TD}>8~9주</td><td style={TD}>축적</td><td style={TD}>24 → 26km</td><td style={TD}>156 → 169분</td></tr>
                  <tr><td style={TD}>10주</td><td style={TD}>감량주</td><td style={TD}>18km</td><td style={TD}>117분</td></tr>
                  <tr><td style={TD}>11~13주</td><td style={TD}><strong>피크</strong></td><td style={TD}>28 → 30 → 32km</td><td style={TD}>182 → 208분</td></tr>
                  <tr><td style={TD}>14~15주</td><td style={TD}>테이퍼</td><td style={TD}>22 → 16km</td><td style={TD}>143 → 104분</td></tr>
                  <tr><td style={TD}>16주</td><td style={TD}>대회 주</td><td style={TD}>8~10km + 풀코스</td><td style={TD}>—</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            주당 10% 규칙은 롱런 단독이 아니라 <strong>주간 총 거리</strong> 기준입니다. 롱런 자체는 회당 2km 이내로 늘리고, 3~4주마다 감량주로 피로를 털어내세요. 18km(약 2시간)부터는 매번 보급이 필요한 거리이므로, [이지·LSD] 탭의 <strong>롱런 보급 플래너</strong>에 그 주의 거리를 넣어 수분·탄수 시점을 미리 계획하고, 피크 롱런에서는 대회 당일 먹을 젤·음료를 그대로 리허설하세요. 예시보다 컨디션이 처지면 거리를 유지하거나 감량주를 앞당기는 쪽이 안전합니다.
          </p>
          <p className="g-note">
            ※ 이 표는 주말 롱런의 진행 예시이고, 위 [훈련 스케줄] 탭이 만드는 주중 인터벌 스케줄과는 별개입니다. 같은 주에 인터벌과 롱런을 함께 한다면 둘 사이를 적어도 2일 이상 띄우세요.
          </p>
        </div>

        {/* ── E-6. 이지·LSD 탭 계산 기준 ── */}
        <div>
          <h2 className="g-h2">
            [이지·LSD] 탭 계산 기준·공식·한계
          </h2>
          <div style={{ ...easyCard }}>
            <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
              <li><strong style={{ color: 'var(--text)' }}>페이스 환산</strong>: 입력 기록을 Riegel 공식(T2 = T1 × (D2/D1)<sup>1.06</sup>)으로 10K·마라톤 페이스로 환산. 이지·LSD = 10K 환산 페이스의 약 1.2~1.3배(20~30% 느리게), 임계(템포) = 약 1.05배.</li>
              <li><strong style={{ color: 'var(--text)' }}>최대심박·존2</strong>: Tanaka 공식(208 − 0.7 × 나이). 안정시 심박을 입력하면 Karvonen(심박예비)으로 존2를 60~70%로, 미입력 시 최대심박의 60~70%로 산출.</li>
              <li><strong style={{ color: 'var(--text)' }}>롱런 보급</strong>: 수분은 20분마다 약 150ml. 탄수는 75분 이상부터 젤(약 25g)을 45분에 시작해 약 40분 간격으로 먹되, 총량이 시간당 30g(ACSM·AND·DC 2016 경기 중 권장 30~60g/h의 하한)에 못 미치면 젤 개수를 올림해 채웁니다.</li>
              <li><strong style={{ color: 'var(--text)' }}>훈련 배분</strong>: 저강도 80% : 고강도 20%(80/20 법칙)에 기반한 일반 가이드.</li>
              <li><strong style={{ color: 'var(--text)' }}>한계</strong>: Riegel은 짧은 기록에서 마라톤을 다소 빠르게 예측하는 경향이 있고, 공식 심박은 개인차(±10bpm 이상)가 큽니다. 모든 값은 참고용 추정 범위이며, 실제 강도는 &lsquo;대화 가능 여부·체감&rsquo;을 우선하세요.</li>
            </ul>
          </div>
        </div>

        {/* FAQ 앞 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

      </div>

      <Disclaimer variant="safety">
        페이스·회복 시간·존2 심박은 레이스 기록과 나이 공식으로 낸 추정치라 날씨·코스·컨디션에 따라 달라집니다. 인터벌 중 통증이 생기면 바로 멈추고, 통증이 이어지면 정형외과·재활의학과 진료를 받으세요. 가슴 통증·심한 호흡곤란·어지러움은 즉시 119에 신고하세요.
      </Disclaimer>

      <RelatedTools
        items={[
          { href: '/tools/sports/pace', desc: '마라톤 목표 기록별 페이스·구간 스플릿' },
          { href: '/tools/sports/race-predictor', desc: 'Riegel·VDOT 공식으로 목표 거리 기록 예측' },
          { href: '/tools/sports/vo2max', desc: '심폐 체력 추정과 강도별 트레이닝 페이스' },
          { href: '/tools/sports/buildup', desc: '구간마다 빨라지는 빌드업 페이스표' },
          { href: '/tools/date/dday', desc: '대회까지 남은 일수' },
          { href: '/tools/health/bmr', desc: '기초대사량과 하루 소비 칼로리' },
          { href: '/tools/sports/one-rm', desc: '근력 훈련 최대 중량 추정' },
          { href: '/tools/sports/fight-weight', desc: '복싱·UFC·MMA 감량 계획' },
        ]}
      />
    </ToolPage>
  )
}
