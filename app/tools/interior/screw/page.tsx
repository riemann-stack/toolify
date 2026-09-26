import Link from 'next/link'
import ScrewClient from './ScrewClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import Disclaimer from '@/components/Disclaimer'
import RelatedTools from '@/components/RelatedTools'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import {
  METRIC_SCREWS, METRIC_QUICK, UNIFIED_SCREWS, PT_SCREWS, WOOD_PILOTS, MATERIALS,
  calcMetricTapDrill, generalTorque, type Engagement, type Material,
} from './screwUtils'
import { BOLT_DATA, BOLT_SIZES, GRADE_INFO, ISO7380_SIZES, ISO10642_SIZES, fmt, type BoltSize } from './boltWrenchUtils'

export const metadata = buildMetadata({
  path: '/tools/interior/screw',
  title: '나사 규격 계산기 — M·UNC·UNF·PT 탭드릴·관통홀·인치↔mm + 볼트 스패너·알렌렌치',
  description: '나사 가공·드릴 구멍 중심 — M·UNC·UNF·PT·NPT·목재·석고 7종의 탭드릴·관통홀·파일럿홀 치수와 인치↔mm 변환표. 볼트·스패너 탭에서 M3~M24 스패너·알렌렌치 사이즈(ISO·구 DIN·JIS 소형), 와셔·너트, 강도등급별 토크, 역검색까지.',
  keywords: ['탭드릴 계산기', '나사 규격표', 'M6 탭드릴', 'M8 탭드릴', '미터 나사', '유니파이 나사', 'UNC UNF', 'PT 나사', '파이프 나사', '인치 mm 변환', '관통홀 직경', '목재피스 파일럿홀', '볼트 스패너 사이즈', 'M8 스패너', '알렌렌치 사이즈', '볼트 체결 토크'],
})

/* ─────────────────────────────────────────────────────────────
   가이드 표·예시 숫자는 손으로 적지 않고 계산기와 같은 screwUtils·boltWrenchUtils
   데이터·함수로 빌드 시 만든다 (계산기 결과와 항상 일치)
   ───────────────────────────────────────────────────────────── */
const n2 = (v: number) => v.toFixed(2)            // 탭드릴 — 계산기 결과 카드와 같은 소수 2자리
const mm = (v: number) => String(+v.toFixed(2))   // 표값 — 뒤 0 제거
const spec = (d: number) => METRIC_SCREWS.find((m) => m.diameter === d)!
const tap = (d: number, p: number, e: Engagement, mat: Material = 'steel') => calcMetricTapDrill(d, p, e, mat)
const M6 = spec(6)
const M8 = spec(8)
const M10 = spec(10)

/* ① 결합률 — 탭드릴 표의 관행식: 결합률(%) = (외경 − 드릴) ÷ (1.299 × 피치) × 100
      (산 높이 0.6495P를 100%로 보는 통념 — 외경 − 피치 드릴이 약 77%) */
const ENGS: Engagement[] = [50, 75, 85]
const threadPct = (e: Engagement) => Math.round(((6 - tap(6, 1, e)) / 1.299) * 100)
const PCT = { 50: threadPct(50), 75: threadPct(75), 85: threadPct(85) } as const
const TAP_ROWS = METRIC_QUICK.map(spec)
const EX_AL = tap(8, M8.pitchCoarse, 75, 'aluminum')
const EX_SUS_FINE = tap(10, M10.pitchFine!, 75, 'stainless')
const EX_M6_50 = tap(6, M6.pitchCoarse, 50)
const EX_M6_50_UP = (Math.ceil(EX_M6_50 * 10 - 1e-9) / 10).toFixed(1)   // 0.1mm 단위로 파는 드릴 중 바로 위
const EX_M6_50_DN = (Math.floor(EX_M6_50 * 10 + 1e-9) / 10).toFixed(1)  // 바로 아래

/* ② 소재별 요령 — 드릴 보정값은 계산기 MATERIALS 그대로 */
const MAT_TIP: Record<Material, string> = {
  steel: '고속도강(HSS) 탭과 절삭유면 충분한 기준 소재. 탭드릴 표값을 그대로 쓴다.',
  aluminum: '칩이 탭 홈에 눌어붙기 쉽다. 절삭유를 넉넉히 쓰고 자주 되돌려 칩을 뺀다.',
  stainless: '문지르면 표면이 단단해지는 가공 경화 — 저속·강한 절삭유·코발트 고속도강(HSS-Co) 탭으로 멈추지 말고 일정하게 깎는다.',
  brass: '절삭성이 좋아 표준 드릴로 충분. 날이 날카로운 드릴은 파고들며 작업물을 끌어당길 수 있어 천천히 들어간다.',
  plastic: '탭 대신 셀프태핑 나사+파일럿홀이 흔하다. 발열로 녹거나 갈라지지 않게 저속으로.',
}

/* ③ 관통홀 — ISO 273 표값(METRIC_SCREWS) */
const CL_SMALL = spec(3)
const CL_BIG = spec(24)

/* ④ 파이프 나사 — PT·NPT를 같은 호칭끼리 짝지어 비교 */
const PIPE_SIZES = ['1/8', '1/4', '3/8', '1/2', '3/4', '1']
const PIPE_ROWS = PIPE_SIZES.map((sz) => ({
  sz,
  pt: PT_SCREWS.find((p) => p.label === `PT ${sz}`)!,
  npt: PT_SCREWS.find((p) => p.label === `NPT ${sz}`)!,
}))
const SAME_TPI = PIPE_ROWS.filter((r) => r.pt.threadsPerInch === r.npt.threadsPerInch).map((r) => r.sz)
const DIFF_TPI = PIPE_ROWS.filter((r) => r.pt.threadsPerInch !== r.npt.threadsPerInch)
const PT_HALF = PIPE_ROWS.find((r) => r.sz === '1/2')!.pt

/* ⑤ 목재피스 파일럿 — 비율(%)과 카운터싱크(계산기와 같은 외경 × 1.8) */
const ratio = (p: number, d: number) => Math.round((p / d) * 100)
const PILOT_RATIOS = WOOD_PILOTS.flatMap((w) => [ratio(w.hardwood, w.diameter), ratio(w.softwood, w.diameter)])
const PILOT_MIN = Math.min(...PILOT_RATIOS)
const PILOT_MAX = Math.max(...PILOT_RATIOS)
const W35 = WOOD_PILOTS.find((w) => w.diameter === 3.5)!

/* ⑥ 볼트 머리·알렌 — BOLT_DATA 전 사이즈 */
const HEAD_DIFF = BOLT_SIZES.filter((s) => BOLT_DATA[s].spannerISO !== BOLT_DATA[s].spannerDIN)
const NO_BUTTON = BOLT_SIZES.filter((s) => !ISO7380_SIZES.has(s))   // ISO 7380-1 범위 밖 — 표에서 '—'
const DIN_FLAT = BOLT_SIZES.filter((s) => !ISO10642_SIZES.has(s))   // 접시머리 DIN 7991 값 — 표에서 '*'
const allenRatios = BOLT_SIZES.map((s) => BOLT_DATA[s].allenSocket / Number(s.slice(1)))
const ALLEN_MIN = Math.min(...allenRatios).toFixed(2)
const ALLEN_MAX = Math.max(...allenRatios).toFixed(2)

/* ⑦ 강도등급 — 공칭값은 GRADE_INFO, 최소값·경도는 ISO 898-1(2013) 표 */
const ISO898: Record<string, { rm: string; rp: string; hv: string; use: string }> = {
  '4.8': { rm: '420', rp: '340', hv: '130~220', use: '철물·가구·전기 설비 등 경하중' },
  '8.8': { rm: '800 (M16 이하) · 830', rp: '640 · 660', hv: '250~320 (M16 이하)', use: '기계·설비·차량 일반 체결의 기본값' },
  '10.9': { rm: '1,040', rp: '940', hv: '320~380', use: '고하중 기계 부품·구조용 고강도 볼트' },
  '12.9': { rm: '1,220', rp: '1,100', hv: '385~435', use: '금형·공작기계의 고강도 소켓캡 볼트' },
}
const TORQUE_SIZES: BoltSize[] = ['M5', 'M6', 'M8', 'M10', 'M12', 'M16', 'M20', 'M24']
const tq = (v: number) => fmt(v, v < 10 ? 1 : 0)
const mpa = (s: string) => Number(s.replace(/[^0-9.]/g, '')).toLocaleString('ko-KR') // GRADE_INFO '1000 MPa' → '1,000'
const GT10 = generalTorque(10)!
const SUS_RATIO = Math.round((450 / 640) * 100) // A2-70 최소 항복 450MPa(ISO 3506-1) ÷ 8.8 640MPa(ISO 898-1)

/* ⑧ 마찰계수 민감도 — 토크 = 체결력 × (P/2π + 0.577·μ·d2 + μ·Db/2) (ISO 16047의 토크 분해식)
      M10 보통나사, 자리면 평균 지름 Db ≈ (머리 대변거리 ISO + 관통홀)/2 근사. 볼트·스패너 탭 토크의 가정 μ = 0.14 기준 */
const B10 = BOLT_DATA.M10
const D2_10 = 10 - 0.649519 * B10.pitchCoarse
const DB_10 = (B10.spannerISO + B10.clearanceHole) / 2
const PITCH_TERM = B10.pitchCoarse / (2 * Math.PI)
const kFric = (mu: number) => PITCH_TERM + 0.57735 * mu * D2_10 + (mu * DB_10) / 2
const MU_BASE = 0.14
const FRIC_ROWS = [0.08, 0.1, 0.12, 0.14, 0.16, 0.2].map((mu) => ({
  mu,
  force: Math.round((kFric(MU_BASE) / kFric(mu)) * 100),
  torque: Math.round((kFric(mu) / kFric(MU_BASE)) * 100),
}))
const FRICTION_SHARE = Math.round((1 - PITCH_TERM / kFric(MU_BASE)) * 100)
const F010 = FRIC_ROWS.find((r) => r.mu === 0.1)!

const UNC14 = UNIFIED_SCREWS.find((u) => u.label === '1/4-20' && u.system === 'unc')!
const UNF14 = UNIFIED_SCREWS.find((u) => u.label === '1/4-28' && u.system === 'unf')!

const FAQ_LD = [
  { q: 'M6 나사 탭드릴은 몇 mm인가요?',
    a: `보통나사 M6×${M6.pitchCoarse}이면 <strong>${n2(tap(6, M6.pitchCoarse, 75))}mm</strong>입니다(외경 6 − 피치 1). 가는나사(M6×${M6.pitchFine})는 ${n2(tap(6, M6.pitchFine!, 75))}mm로 계산되어 시중 드릴 5.2 또는 5.3mm를 씁니다 — 큰 쪽을 고를수록 결합률이 낮아집니다. 알루미늄·스테인리스는 계산기가 0.05mm를 더해 ${n2(tap(6, M6.pitchCoarse, 75, 'stainless'))}mm로 보여 주는데, 실제로는 5.0mm 드릴로 뚫고 탭이 지나치게 빡빡할 때 5.1mm로 올리는 식으로 씁니다.` },
  { q: '탭 구멍과 볼트가 지나가는 구멍은 왜 다르게 뚫나요?',
    a: `탭 구멍(탭드릴)은 나사산을 깎아 낼 살을 남겨야 하므로 외경보다 작게, 관통홀은 볼트가 걸리지 않고 지나가야 하므로 외경보다 크게 뚫습니다. M8이면 탭드릴 ${M8.tapDrill75}mm, 관통홀은 ISO 273 중간 등급 <strong>${mm(M8.clearanceNormal)}mm</strong>(정밀 ${mm(M8.clearanceTight)} · 거친 ${mm(M8.clearanceLoose)})입니다. 두 판을 볼트·너트로 묶을 때는 두 판 모두 관통홀, 한쪽 판에 직접 나사를 낼 때는 그 판만 탭드릴 + 탭입니다.` },
  { q: 'M6 볼트 자리에 1/4인치 볼트를 써도 되나요?',
    a: `안 됩니다. M6은 외경 6.0mm·피치 1.0mm, 1/4-20 UNC는 외경 ${UNC14.diameterMm}mm·피치 ${(25.4 / UNC14.tpi).toFixed(2)}mm(25.4 ÷ ${UNC14.tpi})로 둘 다 다릅니다. 억지로 돌리면 한두 바퀴 들어가다 걸리면서 암나사를 망가뜨립니다. 카메라 삼각대(1/4-20)나 미국산 장비처럼 인치 나사가 섞여 있는 곳에서는 캘리퍼스·나사 피치 게이지로 외경과 산 간격을 먼저 재고, 인치 ↔ mm 탭에서 환산해 보세요.` },
  { q: 'UNC와 UNF 중 무엇을 골라야 하나요?',
    a: `특별한 이유가 없으면 <strong>UNC(보통 피치)</strong>입니다. 산이 굵어 체결이 빠르고, 알루미늄·주철처럼 무른 소재나 먼지가 끼는 곳에서 나사산이 덜 상합니다. UNF(가는 피치)는 같은 지름에서 골지름이 커 인장 단면적이 조금 크고, 한 바퀴에 들어가는 거리가 짧아 미세 조정·얇은 벽·진동 부위에 씁니다. 탭드릴도 달라서 1/4-20 UNC는 ${UNC14.tapDrillMm}mm, 1/4-28 UNF는 ${UNF14.tapDrillMm}mm입니다.` },
  { q: 'PT와 NPT를 섞어 조이면 왜 새나요?',
    a: `둘 다 1/16 테이퍼 파이프 나사지만 <strong>나사산 각도가 PT 55°, NPT 60°</strong>로 다르고, ${DIFF_TPI.map((r) => `${r.sz}″(PT ${r.pt.threadsPerInch}산·NPT ${r.npt.threadsPerInch}산)`).join(', ')}는 인치당 산 수도 다릅니다. ${SAME_TPI.join('·')}″는 산 수가 같아 몇 바퀴 들어가 버리기 때문에 맞는 줄 알기 쉽지만, 산 모양이 달라 틈이 남아 압력이 걸리면 샙니다. 국내 수도·가스 배관은 PT(현행 KS 표기 R·Rc), 미국산 공압·유압 부품은 NPT가 많으니 부품 사양서의 표기를 확인하고, 다르면 변환 어댑터를 쓰세요.` },
  { q: 'PT와 PF(G) 나사는 어떻게 구분하나요?',
    a: 'PT(R·Rc)는 끝으로 갈수록 가늘어지는 테이퍼 나사로 <strong>나사산끼리 꽉 끼면서 밀봉</strong>되므로 테프론 테이프나 실런트를 함께 씁니다. PF(현행 표기 G, KS B 0221·ISO 228-1)는 굵기가 일정한 평행 나사라 나사산으로는 밀봉되지 않고, 끝면의 가스켓·O링이 물을 막습니다. 샤워 호스 연결부(G1/2)가 대표적인 예입니다. 표기가 다르면 섞지 않는 것이 원칙이며, 예외적으로 ISO 7-1은 테이퍼 수나사 R과 평행 암나사 Rp의 조합을 허용합니다.' },
  { q: '결합률은 왜 75%가 기준인가요? 100%로 깎으면 더 튼튼하지 않나요?',
    a: `탭드릴 표의 결합률은 (외경 − 드릴) ÷ (1.299 × 피치)로 계산하는 관행값이고, 외경 − 피치 드릴(ISO 2306 권장 크기와 같은 계열)이 약 ${PCT[75]}%라서 흔히 &lsquo;75%&rsquo;라고 부릅니다. 물림 길이가 충분하면 나사산이 뜯기기 전에 볼트가 먼저 끊어지므로 결합률을 더 올려도 강도 이득은 크지 않은 반면, 탭이 깎을 살이 늘어 절삭 저항과 탭 부러짐 위험이 커집니다. 그래서 단단한 소재·깊은 막힌 구멍은 오히려 결합률을 낮추고(물림 길이로 보완), 얇은 판처럼 물리는 산이 적을 때만 85% 쪽으로 올립니다.` },
  { q: '볼트 토크 표가 자료마다 다른 이유는 무엇인가요?',
    a: `토크는 볼트를 당기는 힘(체결력)을 간접적으로 만드는 수단이고, 조임 토크의 대부분(M10 · 마찰계수 0.14 가정 시 약 ${FRICTION_SHARE}%)이 나사산과 머리 자리면 마찰로 소모되기 때문입니다. 표마다 가정한 마찰계수와 &lsquo;항복강도의 몇 %까지 쓰는가&rsquo;가 달라 값이 달라집니다. 이 도구의 볼트·스패너 탭은 마찰계수 0.14를 가정한 일반 참고치입니다. 참고로 ISO 16047은 토크와 체결력의 관계를 측정하는 <strong>시험 방법</strong> 규격이지 권장 토크를 정한 표가 아닙니다. 윤활제·고착방지제를 바르면 같은 토크에서 체결력이 커지므로, 제조사 표에 윤활 조건이 적혀 있으면 그 조건과 값을 그대로 따르세요.` },
  { q: '스테인리스 볼트도 같은 토크로 조이면 되나요?',
    a: `아닙니다. 흔히 쓰는 스테인리스 볼트 A2-70의 최소 항복강도는 450MPa로, 8.8 강 볼트(640MPa)의 약 ${SUS_RATIO}%입니다(ISO 3506-1·ISO 898-1). 강 8.8 토크를 그대로 주면 늘어나거나 끊어질 수 있고, 스테인리스끼리는 나사산이 긁혀 달라붙는 소착(galling)도 잘 일어납니다. 제조사의 A2-70·A4-80 토크표를 우선하고, 없으면 8.8 값보다 낮게 시작해 고착방지제를 바르고 천천히 균일하게 조이세요.` },
  { q: 'M8 스패너는 13mm인가요 12mm인가요?',
    a: `현행 ISO·KS와 구 DIN 모두 <strong>${BOLT_DATA.M8.spannerISO}mm</strong>입니다. 다만 일본차나 옛 일본산 기계·자전거에는 JIS 소형 규격의 ${BOLT_DATA.M8.spannerJIS}mm 머리가 쓰인 경우가 있습니다. 스패너가 헐겁게 들어가면 JIS 소형을 의심하세요. 큰 스패너로 작은 머리를 돌리면 모서리가 둥글게 뭉개집니다(rounding).` },
  { q: '녹슨 볼트가 풀리지 않을 때는?',
    a: '순서대로: ① 침투 윤활제를 충분히 뿌리고 10~30분 기다립니다. ② 머리를 망치로 가볍게 두드려 녹 층에 충격을 줍니다. ③ 살짝 조이는 방향으로 돌렸다가 풀면 녹이 깨지기도 합니다. ④ 그래도 안 되면 토치로 너트·암나사 쪽을 가열합니다(가연물 제거·소화 수단 준비, 도장·플라스틱 변형 주의, <strong>침투제를 뿌린 직후 가열 금지</strong>). ⑤ 마지막 수단은 볼트 익스트랙터·드릴링입니다. 머리가 뭉개지기 시작했으면 스패너 대신 6각 소켓(12각보다 접촉면이 넓음)을 쓰세요.' },
  { q: '접시머리 나사 카운터싱크는 어떻게 가공하나요?',
    a: `각도부터 맞춥니다. 미터 접시머리 나사(ISO 10642 소켓 접시머리·ISO 2009 등)와 목재 접시피스는 <strong>90°</strong>, 인치 접시머리는 <strong>82°</strong>입니다. 각도가 다른 비트로 가공하면 머리 가장자리나 목 부분만 닿아 들뜨거나 목재가 갈라집니다. 지름은 머리 지름보다 조금 크게(대략 나사 외경의 2배 안팎, 예: M6 → 약 12mm), 깊이는 머리 윗면이 표면과 같아지거나 살짝 들어갈 만큼입니다. 목재피스는 계산기가 외경의 1.8배를 권장값으로 보여 줍니다(3.5mm 피스 → ${(3.5 * 1.8).toFixed(1)}mm).` },
  { q: '목재피스 파일럿홀은 꼭 뚫어야 하나요?',
    a: `경질목(오크·메이플 등)·얇은 합판·MDF·판재 끝 가까이는 <strong>필수</strong>, 연질목(소나무·삼나무)은 권장입니다. 파일럿 없이 박으면 나뭇결을 따라 갈라지거나 경질목에서는 피스 목이 부러집니다. 계산기 표의 파일럿은 피스 외경의 약 ${PILOT_MIN}~${PILOT_MAX}%이고, 단단한 나무일수록 크게 잡습니다 — 3.5mm 피스라면 경질목 ${W35.hardwood}mm, 연질목 ${W35.softwood}mm입니다.` },
]

export default function ScrewPage() {
  return (
    <ToolPage width={880} slug="/tools/interior/screw">
      <h1 className="tp-h1">
        <ToolIconBadge catId="interior" />나사 규격 계산기
      </h1>
      <p className="tp-lead">
        나사 종류(M·UNC·UNF·PT·NPT·목재·석고 7종)와 호칭을 고르면 탭드릴·관통홀·파일럿홀 지름이, 볼트 호칭을 고르면 스패너·알렌렌치 사이즈와 참고 토크가 나옵니다.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="미터 나사 KS B 0201·0204(ISO 261) · 탭드릴 외경 − 피치(ISO 2306 계열) · 관통홀 ISO 273(KS B ISO 273) 정밀·중간·거친 · 관용 테이퍼 나사 KS B 0222(ISO 7-1)·NPT ASME B1.20.1 · 볼트 머리 ISO 4017·구 DIN 933·JIS 소형 · 알렌 ISO 4762 · 강도등급 ISO 898-1 · 토크는 마찰계수 0.14 가정 일반 참고치"
        sources={[
          { label: 'e나라표준인증 — KS B 0201 미터 보통 나사', href: 'https://www.standard.go.kr/KSCI/standardIntro/getStandardSearchView.do?menuId=503&ksNo=KSB0201&tmprKsNo=KSB0201' },
          { label: 'e나라표준인증 — KS B 0222 관용 테이퍼 나사', href: 'https://www.standard.go.kr/KSCI/standardIntro/getStandardSearchView.do?menuId=503&ksNo=KSB0222&tmprKsNo=KSB0222' },
          { label: 'ISO 273 — Clearance holes for bolts and screws', href: 'https://www.iso.org/standard/4183.html' },
          { label: 'ISO 2306 — Drills for use prior to tapping screw threads', href: 'https://www.iso.org/standard/7135.html' },
          { label: 'ISO 898-1 — 탄소강·합금강 볼트의 기계적 성질(강도등급)', href: 'https://www.iso.org/standard/60610.html' },
        ]}
      />
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        이 도구는 <strong style={{ color: 'var(--text)' }}>나사 가공·드릴 구멍</strong>(탭드릴·관통홀·파일럿홀) 중심입니다.
        볼트 머리에 맞는 스패너·알렌렌치 선택과 체결 토크는 아래 <strong style={{ color: 'var(--text)' }}>볼트·스패너</strong> 탭에서 확인하세요.
      </p>

      <ScrewClient />

      <GuideDivider />

      {/* 1. 표기 읽는 법 + 7종 */}
      <h2 className="g-h2">나사 표기 읽는 법 — M6, 1/4-20, PT 1/2</h2>
      <p className="g-p">
        나사 호칭은 <strong>굵기</strong>와 <strong>산 간격</strong> 두 가지로 이뤄집니다. 미터 나사 M6은 바깥지름 6mm이고, 피치(산과 산 사이 거리)를 적지 않으면 보통나사 M6×1.0을 뜻합니다.
        같은 굵기에서 산이 더 촘촘한 가는나사는 M8×1처럼 피치를 반드시 붙여 씁니다(보통나사 KS B 0201, 가는나사 KS B 0204 — 둘 다 ISO 261 계열).
        인치 나사는 1/4-20처럼 &lsquo;지름(인치)-인치당 산 수(TPI)&rsquo;로 적고, 피치로 바꾸면 25.4 ÷ 20 = 1.27mm입니다.
        파이프 나사 PT 1/2의 1/2은 나사 지름이 아니라 <strong>배관 호칭(15A)</strong>이라서 실제 바깥지름은 약 {PT_HALF.outerDiameterMm}mm입니다 — 치수를 호칭 그대로 읽으면 부품을 잘못 사게 됩니다.
      </p>
      <DataFigure n={1} title="계산기가 다루는 7가지 나사" source="자료: KS B 0201·0204·0222, ISO 261·7-1, ASME B1.1·B1.20.1 — 목재·석고피스는 제조사 규격(외경×길이)">
        <table>
          <thead>
            <tr><th scope="col">종류</th><th scope="col">표기 예</th><th scope="col">산 각도</th><th scope="col">기준</th><th scope="col">주 사용처</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">미터 (M)</th><td>M6 · M8×1</td><td>60°</td><td>KS B 0201·0204, ISO 261</td><td className="wrap">국내 볼트·가구·기계 전반</td></tr>
            <tr><th scope="row">UNC</th><td>1/4-20 UNC</td><td>60°</td><td>ASME B1.1</td><td className="wrap">미국식 기계·장비의 보통 피치</td></tr>
            <tr><th scope="row">UNF</th><td>1/4-28 UNF</td><td>60°</td><td>ASME B1.1</td><td className="wrap">미세 조정·얇은 벽·차량 부품</td></tr>
            <tr><th scope="row">PT (R·Rc)</th><td>PT 1/2 = R 1/2</td><td>55°</td><td>KS B 0222, ISO 7-1</td><td className="wrap">국내 수도·가스·공압 배관(테이퍼 1/16)</td></tr>
            <tr><th scope="row">NPT</th><td>1/2-14 NPT</td><td>60°</td><td>ASME B1.20.1</td><td className="wrap">미국산 유압·공압 부품(테이퍼 1/16)</td></tr>
            <tr><th scope="row">목재피스</th><td>3.5×30</td><td>—</td><td>제조사 규격</td><td className="wrap">목공·가구·문 손잡이·경첩</td></tr>
            <tr><th scope="row">석고피스</th><td>3.5×25</td><td>—</td><td>제조사 규격</td><td className="wrap">석고보드를 목상·경량철골에 고정</td></tr>
          </tbody>
        </table>
      </DataFigure>

      {/* 2. 탭드릴 + 결합률 */}
      <h2 className="g-h2">탭드릴은 &lsquo;외경 − 피치&rsquo;, 결합률로 미세 조정</h2>
      <p className="g-p">
        암나사를 내려면 탭이 깎아 낼 살을 남기고 먼저 구멍을 뚫어야 합니다. 기본식은 <strong>탭드릴 = 외경 − 피치</strong>이고, ISO 2306이 권장하는 탭 전 드릴 지름도 대략 이 값입니다.
        이 계산기는 결합률에 따라 피치에 곱하는 계수를 바꿉니다 — 50%는 외경 − 0.65×피치, 75%는 외경 − 1.00×피치, 85%는 외경 − 1.10×피치이며, 소재가 알루미늄·스테인리스면 0.05mm를 더합니다.
      </p>
      <p className="g-p">
        여기서 결합률은 탭드릴 표에서 쓰는 관행식 <strong>(외경 − 드릴) ÷ (1.299 × 피치)</strong>로 계산한 나사산 높이 비율입니다. 외경 − 피치로 뚫으면 약 {PCT[75]}%가 되어 흔히 &lsquo;75% 결합&rsquo;이라고 부르고,
        계수 0.65는 약 {PCT[50]}%, 1.10은 약 {PCT[85]}%에 해당합니다. 아래 표의 &lsquo;표준 드릴&rsquo;은 실제로 파는 0.1mm 단위 드릴 중 흔히 쓰는 값(계산기 사이즈 표 탭과 같음)입니다.
      </p>
      <DataFigure n={2} title="미터 보통나사 탭드릴 — 결합률별 계산값(철 기준)" unit="단위: mm" source="자료: 계산기와 같은 calcMetricTapDrill로 빌드 시 계산 · 표준 드릴은 ISO 2306 계열 통용값">
        <table>
          <thead>
            <tr>
              <th scope="col">호칭</th>
              <th scope="col" className="r">피치</th>
              {ENGS.map((e) => <th key={e} scope="col" className="r">{e}%</th>)}
              <th scope="col" className="r">표준 드릴</th>
            </tr>
          </thead>
          <tbody>
            {TAP_ROWS.map((m) => (
              <tr key={m.diameter}>
                <th scope="row">M{m.diameter}</th>
                <td className="r">{m.pitchCoarse}</td>
                {ENGS.map((e) => <td key={e} className={e === 75 ? 'r em' : 'r'}>{n2(tap(m.diameter, m.pitchCoarse, e))}</td>)}
                <td className="r">{m.tapDrill75.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        <strong>계산 예시</strong> — 알루미늄에 M8 탭을 75%로 내면 8 − 1.25 + 0.05 = <strong>{n2(EX_AL)}mm</strong>, 스테인리스 판에 가는나사 M10×{M10.pitchFine}을 내면 10 − {M10.pitchFine} + 0.05 = <strong>{n2(EX_SUS_FINE)}mm</strong>입니다.
        드릴은 보통 0.1mm 간격으로 팔리므로 M6 50%처럼 {n2(EX_M6_50)}mm가 나오면 {EX_M6_50_UP}mm(결합률이 조금 더 낮아짐)와 {EX_M6_50_DN}mm(조금 더 높아짐) 중에서 고릅니다.
      </p>
      <ul className="g-list">
        <li><strong>75%(외경 − 피치)</strong> — 기본값. 연강·알루미늄·황동 대부분이 여기에 해당합니다.</li>
        <li><strong>50% 쪽</strong> — 스테인리스·공구강처럼 단단하거나 깊은 막힌 구멍에서 탭 부하를 줄일 때. 물림이 얕아지므로 나사 길이를 늘려 보완합니다.</li>
        <li><strong>85% 쪽</strong> — 얇은 판처럼 물리는 산이 몇 개 안 될 때. 탭 저항이 커지므로 절삭유를 넉넉히 쓰고 더 자주 되돌립니다.</li>
      </ul>

      {/* 3. 소재별 */}
      <h2 className="g-h2">소재별 탭 가공 요령</h2>
      <p className="g-p">
        같은 호칭이라도 소재에 따라 드릴을 살짝 키우거나 절삭 조건을 바꿉니다. 계산기의 소재 선택은 아래 보정값을 탭드릴에 더합니다.
        손 탭은 보통 1번(선탭)·2번(중탭)·3번(상탭) 세트로 팝니다. 세 개의 지름이 같고 끝의 모따기 길이만 다른 <strong>등경 세트</strong>라면 관통 구멍은 1번이나 2번으로 끝까지 깎으면 되고, 막힌 구멍은 끝부분까지 나사를 내기 위해 3번이 필요합니다.
        반면 자루에 링 표시가 1개·2개·없음으로 새겨진 DIN 352식 <strong>비등경(단계) 세트</strong>는 1·2번이 일부러 가늘게 만들어져 있어, 관통 구멍이라도 1→2→3번을 모두 거쳐야 나사산이 완성됩니다.
        탭 끝의 모따기 구간은 나사가 덜 깎이므로 <strong>막힌 구멍은 필요한 나사 길이보다 몇 피치 더 깊게</strong> 뚫어 칩이 쌓일 공간을 남겨 두세요.
      </p>
      <DataFigure n={3} title="소재별 탭드릴 보정과 가공 요령" source="자료: 계산기 소재 보정값(MATERIALS) — 요령은 일반 가공 관행">
        <table>
          <thead>
            <tr><th scope="col">소재</th><th scope="col" className="r">드릴 보정</th><th scope="col">요령</th></tr>
          </thead>
          <tbody>
            {MATERIALS.map((m) => (
              <tr key={m.key}>
                <th scope="row">{m.label}</th>
                <td className="r">{m.drillAdjust > 0 ? `+${m.drillAdjust}mm` : '0'}</td>
                <td className="wrap">{MAT_TIP[m.key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>

      {/* 4. 관통홀 */}
      <h2 className="g-h2">관통홀 — 정밀·중간·거친 3등급(ISO 273)</h2>
      <p className="g-p">
        볼트가 지나갈 구멍은 여유가 너무 작으면 구멍 위치 오차 때문에 볼트가 들어가지 않고, 너무 크면 볼트 머리·너트가 누르는 면적이 줄어 와셔가 필요해집니다.
        ISO 273(국내 KS B ISO 273)은 이 여유를 <strong>정밀(fine)·중간(medium)·거친(coarse)</strong> 3등급의 호칭별 표로 정해 두었고, 여유는 고정값이 아니라 굵을수록 커집니다 —
        중간 등급 기준 M3은 +{mm(CL_SMALL.clearanceNormal - CL_SMALL.diameter)}mm, M24는 +{mm(CL_BIG.clearanceNormal - CL_BIG.diameter)}mm입니다.
      </p>
      <p className="g-p">
        두 판을 겹쳐 한 번에 뚫거나 정렬이 중요하면 정밀, 구멍을 판마다 따로 뚫어 맞추는 일반 조립은 중간, 현장 용접 브래킷처럼 위치가 어긋나기 쉬운 곳은 거친 등급이 무난합니다.
        볼트 여러 개가 들어가는 부품은 구멍 하나하나의 오차가 쌓이므로, 정밀 등급으로 뚫을 때는 한 판을 먼저 뚫고 그 구멍을 따라 다른 판에 표시하는 방식이 실패가 적습니다.
      </p>
      <DataFigure n={4} title="미터 볼트 관통홀 지름" unit="단위: mm" source="자료: ISO 273 표값 — 계산기 결과 카드·사이즈 표 탭과 같은 데이터">
        <table>
          <thead>
            <tr><th scope="col">호칭</th><th scope="col" className="r">정밀</th><th scope="col" className="r">중간</th><th scope="col" className="r">거친</th><th scope="col" className="r">중간 여유</th></tr>
          </thead>
          <tbody>
            {METRIC_SCREWS.map((m) => (
              <tr key={m.diameter}>
                <th scope="row">M{m.diameter}</th>
                <td className="r">{mm(m.clearanceTight)}</td>
                <td className="r em">{mm(m.clearanceNormal)}</td>
                <td className="r">{mm(m.clearanceLoose)}</td>
                <td className="r">+{mm(m.clearanceNormal - m.diameter)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>

      {/* 5. 파이프 나사 */}
      <h2 className="g-h2">파이프 나사 PT·NPT·PF — 섞으면 새는 이유</h2>
      <p className="g-p">
        현장에서 부르는 PT는 옛 JIS 표기이고, 현행 KS B 0222(ISO 7-1)는 테이퍼 수나사를 <strong>R</strong>, 테이퍼 암나사를 <strong>Rc</strong>, 평행 암나사를 <strong>Rp</strong>로 적습니다.
        PF는 평행 나사 G(KS B 0221·ISO 228-1)로, 나사산이 아니라 가스켓·O링으로 밀봉합니다. NPT는 미국 ASME B1.20.1 규격입니다.
        PT와 NPT는 둘 다 1/16 테이퍼지만 산 각도가 55°와 60°로 다르고, 아래 표처럼 호칭에 따라 산 수도 달라 서로 끼우면 틈이 남습니다.
      </p>
      <DataFigure n={5} title="PT와 NPT 같은 호칭 비교" unit="산 수: 인치당 · 치수: mm" source="자료: 계산기 PT_SCREWS 데이터 — PT 탭드릴은 리머 없이 쓰는 통용 권장값, NPT는 ANSI 권장 드릴의 mm 환산">
        <table>
          <thead>
            <tr>
              <th scope="col">호칭</th>
              <th scope="col" className="r">산 수 PT / NPT</th>
              <th scope="col" className="r">바깥지름 PT / NPT</th>
              <th scope="col" className="r">탭드릴 PT / NPT</th>
            </tr>
          </thead>
          <tbody>
            {PIPE_ROWS.map((r) => (
              <tr key={r.sz}>
                <th scope="row">{r.sz}″</th>
                <td className={r.pt.threadsPerInch === r.npt.threadsPerInch ? 'r' : 'r em'}>{r.pt.threadsPerInch} / {r.npt.threadsPerInch}</td>
                <td className="r">{r.pt.outerDiameterMm} / {r.npt.outerDiameterMm}</td>
                <td className="r">{r.pt.tapDrillMm} / {r.npt.tapDrillMm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        {SAME_TPI.join('·')}″는 산 수가 같아 NPT 부품이 PT 암나사에 몇 바퀴 들어가 버리는데, 이것이 &lsquo;끝까지 조였는데 샌다&rsquo;의 전형적인 원인입니다.
        테이퍼 나사는 손으로 조인 뒤 공구로 몇 바퀴 더 조여 산끼리 끼게 만드는 방식이라 수나사가 다 들어가지 않고 남는 것이 정상입니다.
        씰테이프(테프론 테이프)는 나사 끝에서 볼 때 <strong>조이는 방향(시계 방향)</strong>으로 감고, 맨 끝 첫 산은 비워 테이프 조각이 배관 안으로 들어가지 않게 합니다.
        배관 호칭(15A = 1/2″)과 재질별 실제 외경은 <Link href="/tools/interior/pipe">배관 규격 변환기</Link>에서 함께 확인할 수 있습니다.
      </p>

      {/* 6. 목재·석고피스 */}
      <h2 className="g-h2">목재·석고피스 — 파일럿홀과 카운터싱크</h2>
      <p className="g-p">
        파일럿홀은 피스가 들어갈 길을 미리 내서 나무가 갈라지는 것을 막고, 피스가 비뚤게 들어가지 않게 잡아 줍니다. 계산기 표의 파일럿은 피스 외경의 약 {PILOT_MIN}~{PILOT_MAX}%로,
        <strong>단단한 나무일수록 크게</strong> 잡습니다 — 단단한 나무에 작은 구멍을 뚫으면 피스를 돌리는 힘이 커져 목이 부러지기 쉽기 때문입니다. 3.5mm 피스라면 경질목 {W35.hardwood}mm, 연질목 {W35.softwood}mm입니다.
        판재 끝 가까이나 얇은 합판·MDF는 연질이라도 갈라지거나 부풀어 오르므로 파일럿이 필요합니다.
      </p>
      <DataFigure n={6} title="목재피스 파일럿홀과 카운터싱크" unit="단위: mm" source="자료: 계산기 WOOD_PILOTS 데이터 · 카운터싱크는 계산기와 같은 외경 × 1.8">
        <table>
          <thead>
            <tr><th scope="col">피스 외경</th><th scope="col" className="r">경질목</th><th scope="col" className="r">연질목</th><th scope="col" className="r">카운터싱크 지름</th></tr>
          </thead>
          <tbody>
            {WOOD_PILOTS.map((w) => (
              <tr key={w.diameter}>
                <th scope="row">{w.diameter}</th>
                <td className="r">{w.hardwood} <small>{ratio(w.hardwood, w.diameter)}%</small></td>
                <td className="r">{w.softwood} <small>{ratio(w.softwood, w.diameter)}%</small></td>
                <td className="r">{(w.diameter * 1.8).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        석고피스는 끝이 뾰족하고 나팔 모양 머리라 파일럿 없이 드라이버로 바로 박습니다. 다만 석고보드 자체는 나사를 붙잡는 힘이 작아서, 보드 두께에 뒤쪽 목상·경량철골까지 충분히 물리는 길이를 골라야 하고
        머리가 종이 면을 찢고 들어갈 만큼 깊이 박으면 고정력이 크게 떨어집니다. 선반·거울처럼 무게가 걸리는 물건은 석고피스 대신 골조 위치에 박거나 석고 전용 앵커를 씁니다.
      </p>

      {/* 7. 집 벽 고정 */}
      <h2 className="g-h2">집 벽에 무엇을 달 때 — 벽재별 고정 방법</h2>
      <p className="g-p">
        벽에 무언가를 달 때는 나사 규격보다 <strong>벽이 무엇인지</strong>가 먼저입니다. 콘크리트는 앵커가 필요하고, 석고보드는 골조를 찾거나 전용 앵커를 써야 하며, 목재는 파일럿홀만 맞추면 됩니다.
        아래는 흔한 상황별 조합입니다. 앵커·브래킷에 허용 하중이 적혀 있으면 그 값이 우선입니다.
      </p>
      <DataFigure n={7} title="상황별 권장 고정 방법" source="자료: 일반 시공 관행 — 제품 설명서·허용 하중 표기가 우선">
        <table>
          <thead>
            <tr><th scope="col">상황</th><th scope="col">벽재</th><th scope="col">고정</th><th scope="col">함께 확인</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">TV 벽걸이</th><td>콘크리트</td><td className="wrap">브래킷 동봉 앵커·피스 우선, 없으면 브래킷 구멍에 맞는 콘크리트 앵커</td><td className="wrap">함마드릴(진동)과 앵커 지름에 맞는 콘크리트 비트</td></tr>
            <tr><th scope="row">액자·거울</th><td>석고보드</td><td className="wrap">석고 앵커(나사식·토글) + 동봉 피스</td><td className="wrap">석고피스만으로는 하중을 걸지 않기</td></tr>
            <tr><th scope="row">벽선반·가구 전도 방지</th><td>석고보드 + 골조</td><td className="wrap">목상엔 목재피스 4.0×50mm 이상, 경량철골엔 철판용 피스 또는 토글 앵커</td><td className="wrap">스터드 탐지기로 골조 위치 확인</td></tr>
            <tr><th scope="row">조립 가구</th><td>—</td><td className="wrap">동봉 M4~M6 볼트·캠 볼트</td><td className="wrap">분실 시 외경·피치를 재서 같은 규격으로</td></tr>
            <tr><th scope="row">문 손잡이·경첩 교체</th><td>목재 문·문틀</td><td className="wrap">제품 동봉 목재피스</td><td className="wrap">파일럿 {W35.hardwood}mm(3.5mm 피스·경질목)</td></tr>
            <tr><th scope="row">커튼봉·블라인드</th><td>콘크리트 / 석고보드</td><td className="wrap">콘크리트는 칼블럭 + 피스, 석고보드는 토글 앵커</td><td className="wrap">콘크리트는 함마드릴(진동)로, 석고보드는 골조 위치 먼저 확인</td></tr>
            <tr><th scope="row">금속 브래킷</th><td>철판·알루미늄</td><td className="wrap">M5~M8 미터 볼트 + 너트, 또는 탭 가공</td><td className="wrap">M6 탭드릴 {n2(tap(6, 1, 75))}mm · 관통홀 {mm(M6.clearanceNormal)}mm</td></tr>
          </tbody>
        </table>
      </DataFigure>
      <Callout tone="tip" title="뚫기 전에 벽부터 확인">
        손가락 관절로 두드려 통통 울리면 뒤가 빈 석고보드 벽, 둔탁하고 단단하면 콘크리트입니다. 콘크리트에 석고보드를 붙여 마감한 벽도 있어서, 통통 울려도 드릴이 1~2cm 들어가다 막히면 뒤는 콘크리트입니다. 스위치·콘센트의 위아래 선상과 욕실·주방 벽 속에는 전선·배관이 지나는 경우가 많으니 그 자리는 피해서 뚫으세요.
      </Callout>

      {/* 8. 볼트 머리·알렌 */}
      <h2 className="g-h2">볼트 머리·알렌 사이즈 — ISO·구 DIN·JIS 소형</h2>
      <p className="g-p">
        같은 M10 볼트라도 따르는 규격에 따라 머리 크기가 {BOLT_DATA.M10.spannerISO}·{BOLT_DATA.M10.spannerDIN}·{BOLT_DATA.M10.spannerJIS}mm로 다릅니다.
        <strong>현행 ISO</strong>(ISO 4014/4017, KS·JIS 본체)는 {HEAD_DIFF.join('·')}에서 <strong>구 DIN 933·KS 부속서</strong> 치수와 갈리고, 구 규격 제품은 지금도 유통품에 많이 남아 있습니다.
        <strong>JIS 소형</strong>은 머리를 한 치수 작게 만든 일본식 규격으로 일본차·옛 설비에서 자주 보입니다. 계산기 사이즈 표 탭의 스패너 열은 구 DIN 치수이고, 현행 ISO가 다른 사이즈는 괄호로 함께 적었습니다.
      </p>
      <p className="g-p">
        알렌렌치(육각 렌치) 사이즈가 스패너와 전혀 다른 이유는 재는 곳이 달라서입니다. 스패너는 머리 바깥 6각의 마주 보는 면 거리라 볼트 지름보다 크고,
        알렌은 머리 안쪽 6각 홈의 면 거리라 소켓캡 볼트 기준 볼트 지름의 약 {ALLEN_MIN}~{ALLEN_MAX}배입니다. 머리가 얕은 버튼·접시머리는 홈도 얕아 한두 단계 작은 렌치를 씁니다.
      </p>
      <DataFigure n={8} title="볼트 호칭별 스패너·알렌렌치 사이즈" unit="단위: mm" source="자료: 볼트·스패너 탭과 같은 BOLT_DATA — 스패너 ISO 4017·구 DIN 933·JIS 소형, 알렌 소켓캡 ISO 4762·버튼 ISO 7380-1(M3~M16, M14 없음)·접시 ISO 10642(M3~M20)·DIN 7991(M18·M22·M24)·무두 DIN 913 계열">
        <table>
          <thead>
            <tr>
              <th scope="col">호칭</th>
              <th scope="col" className="r">ISO</th>
              <th scope="col" className="r">구 DIN</th>
              <th scope="col" className="r">JIS 소형</th>
              <th scope="col" className="r">소켓캡</th>
              <th scope="col" className="r">버튼</th>
              <th scope="col" className="r">접시</th>
              <th scope="col" className="r">무두</th>
            </tr>
          </thead>
          <tbody>
            {BOLT_SIZES.map((s) => {
              const d = BOLT_DATA[s]
              const diff = d.spannerISO !== d.spannerDIN
              return (
                <tr key={s}>
                  <th scope="row">{s}</th>
                  <td className={diff ? 'r em' : 'r'}>{d.spannerISO}</td>
                  <td className={diff ? 'r em' : 'r'}>{d.spannerDIN}</td>
                  <td className="r">{d.spannerJIS}</td>
                  <td className="r">{d.allenSocket}</td>
                  <td className="r">{ISO7380_SIZES.has(s) ? d.allenButton : '—'}</td>
                  <td className="r">{d.allenFlat}{ISO10642_SIZES.has(s) ? '' : '*'}</td>
                  <td className="r">{d.allenSet}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        표의 <strong>—</strong>는 버튼헤드 규격(ISO 7380-1)에 없는 호칭({NO_BUTTON.join('·')})이고, <strong>*</strong>는 ISO 10642에 없어 구 DIN 7991 값을 적은 접시머리({DIN_FLAT.join('·')})입니다.
        규격 범위 밖의 버튼헤드는 제품마다 홈 크기가 달라서, 계산기는 이 사이즈에 참고값만 보여 주고 &lsquo;범위 밖&rsquo;이라고 따로 표시합니다. 실물에 렌치를 대어 확인하세요.
      </p>
      <p className="g-p">
        볼트·스패너 탭에서는 ① 머리 종류(외부 6각 또는 소켓캡·버튼·접시·무두) → ② 사이즈 M3~M24 → ③ 외부 6각이면 규격(ISO·구 DIN·JIS 소형)을 고르면 스패너·알렌 사이즈와 와셔·너트·참고 토크가 함께 나옵니다.
        볼트 사이즈를 모를 때는 <strong>역검색</strong>에 가지고 있는 스패너·알렌 사이즈를 넣으면 맞는 볼트 후보를 보여 줍니다.
      </p>

      {/* 9. 강도등급·토크 */}
      <h2 className="g-h2">강도등급(4.8·8.8·10.9·12.9)과 체결 토크</h2>
      <p className="g-p">
        볼트 머리에 새겨진 숫자는 ISO 898-1의 강도등급입니다. 앞 숫자 × 100이 공칭 인장강도(MPa), 앞 숫자 × 뒤 숫자 × 10이 공칭 항복강도(MPa)라서 8.8은 800MPa·640MPa로 읽습니다.
        규격이 보증하는 최소값은 공칭값보다 조금 높거나 굵기에 따라 달라지므로, 설계에 쓸 때는 아래 최소값을 봅니다. 10.9·12.9처럼 단단한 볼트는 전기도금 과정에서 수소 취성이 생길 수 있어 도금 제품은 탈수소 처리 여부를 확인하는 편이 안전합니다.
      </p>
      <DataFigure n={9} title="강도등급별 기계적 성질" unit="강도: MPa · 경도: HV" source="자료: ISO 898-1:2013 — 공칭값은 볼트·스패너 탭(GRADE_INFO)과 같음">
        <table>
          <thead>
            <tr><th scope="col">등급</th><th scope="col" className="r">공칭 인장 / 항복</th><th scope="col" className="r">최소 인장</th><th scope="col" className="r">최소 항복</th><th scope="col" className="r">경도</th><th scope="col">주 용도</th></tr>
          </thead>
          <tbody>
            {GRADE_INFO.map((g) => (
              <tr key={g.grade}>
                <th scope="row">{g.grade}</th>
                <td className="r">{mpa(g.tensile)} / {mpa(g.yield)}</td>
                <td className="r">{ISO898[g.grade].rm}</td>
                <td className="r">{ISO898[g.grade].rp}</td>
                <td className="r">{ISO898[g.grade].hv}</td>
                <td className="wrap">{ISO898[g.grade].use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        체결 토크는 볼트·스패너 탭의 참고치를 그대로 옮긴 아래 표를 기준으로 봅니다. 탭드릴 계산 탭에 나오는 8.8 등급 &lsquo;일반 범위&rsquo;(예: M10 {GT10.min}~{GT10.max} N·m)는 이 값을 포함하도록 잡은 폭입니다.
      </p>
      <DataFigure n={10} title="강도등급별 참고 체결 토크(마찰계수 0.14 가정)" unit="단위: N·m" source="자료: 볼트·스패너 탭과 같은 BOLT_DATA — 일반 참고치이며 제조사 값이 우선">
        <table>
          <thead>
            <tr><th scope="col">호칭</th><th scope="col" className="r">4.8</th><th scope="col" className="r">8.8</th><th scope="col" className="r">10.9</th><th scope="col" className="r">12.9</th></tr>
          </thead>
          <tbody>
            {TORQUE_SIZES.map((s) => {
              const d = BOLT_DATA[s]
              return (
                <tr key={s}>
                  <th scope="row">{s}</th>
                  <td className="r">{tq(d.torque4_8)}</td>
                  <td className="r em">{tq(d.torque8_8)}</td>
                  <td className="r">{tq(d.torque10_9)}</td>
                  <td className="r">{tq(d.torque12_9)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </DataFigure>
      <p className="g-p">
        토크는 체결력(볼트를 당기는 힘)을 간접적으로 만드는 수단입니다. 조임 토크 = 체결력 × (피치 몫 + 나사산 마찰 몫 + 자리면 마찰 몫)으로 나뉘는데, M10에서 마찰계수 0.14를 넣으면 토크의 약 <strong>{FRICTION_SHARE}%가 마찰</strong>로 쓰이고 볼트를 늘이는 데는 나머지만 쓰입니다.
        그래서 마찰 조건이 조금만 달라져도 같은 토크에서 체결력이 크게 변합니다. 아래 표는 이 식(ISO 16047의 토크 분해식)으로 M10을 계산한 것으로, 윤활해서 마찰계수가 0.10으로 내려간 볼트에 0.14 기준 토크를 그대로 주면 체결력이 약 {F010.force}%가 되어 볼트가 항복 근처까지 늘어날 수 있다는 뜻입니다.
      </p>
      <DataFigure n={11} title="마찰계수에 따른 체결력·필요 토크 변화(M10, μ 0.14 = 100)" unit="단위: %" source="계산: 토크 = F × (P/2π + 0.577·μ·d2 + μ·Db/2), 자리면 평균 지름 Db ≈ (머리 대변거리 + 관통홀) ÷ 2 — 빌드 시 BOLT_DATA로 계산">
        <table>
          <thead>
            <tr><th scope="col">마찰계수 μ</th><th scope="col" className="r">같은 토크일 때 체결력</th><th scope="col" className="r">같은 체결력에 필요한 토크</th></tr>
          </thead>
          <tbody>
            {FRIC_ROWS.map((r) => (
              <tr key={r.mu}>
                <th scope="row">{r.mu.toFixed(2)}</th>
                <td className={r.mu === MU_BASE ? 'r' : r.force > 100 ? 'r em' : 'r'}>{r.force}</td>
                <td className="r">{r.torque}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <ul className="g-list">
        <li>윤활제·고착방지제를 바르면 마찰계수가 내려가고, 건조하거나 녹슨 나사·스테인리스끼리는 올라갑니다. 제조사 토크표에 윤활 조건이 적혀 있으면 그 조건 그대로 조이세요.</li>
        <li>스테인리스 A2-70은 최소 항복강도가 8.8의 약 {SUS_RATIO}%라 강 볼트 토크를 그대로 쓰지 않습니다.</li>
        <li>토크렌치는 조일 때만 쓰고 풀 때는 일반 핸들을 씁니다. 여러 볼트는 대각선 순서로 두세 단계에 나눠 목표 토크까지 올립니다.</li>
        <li>휠 너트·브레이크·서스펜션 같은 안전 부품은 차량 제조사 값을 따르고, 확신이 없으면 정비소에 맡기세요.</li>
      </ul>

      {/* 10. 안전 */}
      <h2 className="g-h2">드릴·탭 작업 안전</h2>
      <p className="g-p">
        드릴·탭 작업에서 특히 조심할 것은 회전하는 공구에 손·장갑·옷이 말려 들어가는 사고와, 고정하지 않은 작업물이 드릴과 함께 돌며 손을 치는 사고입니다. 탭이 부러지면 경도가 높아 드릴로 빼기 어렵고, 작업물 전체를 버리게 되는 경우도 많습니다.
      </p>
      <Callout tone="warn" title="작업 전 확인">
        <ul>
          <li><strong>보안경은 필수</strong> — 칩과 부러진 탭·드릴 조각이 튑니다. 콘크리트 천공은 분진 마스크도 씁니다.</li>
          <li><strong>회전하는 드릴에 면장갑·헐거운 장갑 금지</strong> — 산업안전보건기준에 관한 규칙 제95조도 날·공작물·축이 회전하는 기계를 다룰 때는 손에 밀착되는 가죽 장갑처럼 말려 들어갈 위험이 없는 장갑만 쓰게 하고 있습니다. 긴 소매·머리카락도 정리하세요.</li>
          <li><strong>작업물은 바이스·클램프로 고정</strong> — 얇은 판이나 황동은 드릴이 파고들며 작업물을 돌려 손을 칠 수 있습니다.</li>
          <li><strong>탭은 1~2바퀴 전진, 반 바퀴~1바퀴 후진</strong>으로 칩을 끊고, 걸리면 힘으로 돌리지 말고 빼서 칩을 치운 뒤 다시 들어갑니다.</li>
        </ul>
      </Callout>

      <Faq items={FAQ_LD} />

      <Disclaimer
        variant="safety"
        sources={[
          { label: '국가법령정보센터 — 산업안전보건기준에 관한 규칙(제95조 장갑의 사용 금지)', href: 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙' },
          { label: 'ISO 16047 — Fasteners: Torque/clamp force testing', href: 'https://www.iso.org/standard/27788.html' },
        ]}
      >
        표시 치수는 KS·ISO·DIN·JIS 표준의 일반값이며 실제 제품은 ±0.1~0.5mm 차이가 날 수 있으니 정밀 가공은 실측하세요.
        토크는 마찰계수 0.14를 가정한 일반 참고치로 정확한 값을 보장하지 않습니다 — 고강도·안전 부품과 차량·설비는 제조사 매뉴얼·도면이 우선입니다.
      </Disclaimer>

      <RelatedTools
        items={[
          { href: '/tools/interior/pipe', desc: 'PT 나사가 붙는 배관 호칭·재질별 외경' },
          { href: '/tools/unit/converter', desc: '인치·mm 등 길이 단위 변환' },
          { href: '/tools/unit/hardness', desc: '볼트 경도 HV·HRC 환산' },
          { href: '/tools/interior/curtain-blind', desc: '창문 크기별 커튼·블라인드 사이즈' },
          { href: '/tools/interior/molding', desc: '몰딩·걸레받이 길이' },
          { href: '/tools/interior/room-area', desc: '벽·바닥·천장 면적' },
        ]}
      />
    </ToolPage>
  )
}
