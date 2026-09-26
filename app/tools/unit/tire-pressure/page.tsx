import Link from 'next/link'
import TirePressureClient from './TirePressureClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/unit/tire-pressure',
  title: '타이어 계산기 — 공기압(psi·kPa·bar)·규격 해석·인치업·교체시기',
  description: 'psi·kPa·bar 공기압 변환과 권장 공기압 체크 + 205/55R16 규격 해석·외경 계산·인치업 조합·속도계 오차 + 트레드 마모·DOT 제조주차·교체시기 가이드.',
  keywords: [
    '타이어공기압변환', 'psi kPa 변환', '타이어공기압', '자전거공기압', '권장공기압', 'bar psi 변환',
    '타이어 규격 보는법', '205/55R16 의미', '타이어 외경 계산', '인치업 계산', '타이어 외경 차이 속도계',
    '트레드 깊이 마모한계', '타이어 교체시기', 'DOT 제조일자 보는법', '타이어 제조주차',
  ],
})

const FAQ_LD = [
              {
                q: '공기압은 얼마나 자주 점검해야 하나요?',
                a: '<strong>최소 월 1회, 장거리 운행 전</strong>에 냉간 상태로 점검하는 것이 한국교통안전공단·NHTSA의 공통 권고입니다. 타이어는 손상이 없어도 고무를 통해 공기가 조금씩 빠지고, 여기에 기온까지 10°C 내려가면 33 psi 차 기준 약 1.6 psi가 더 떨어집니다. 그래서 가을에서 겨울로 넘어가는 환절기에는 2주에 한 번 정도로 자주 확인하는 편이 안전합니다.',
              },
              {
                q: 'TPMS 경고등이 켜졌는데 보충해도 다시 켜져요',
                a: 'TPMS 경고 기준은 규정마다 조금 다릅니다. 미국 FMVSS 138은 <strong>권장값보다 25% 이상</strong> 낮아지면, 유엔 규정(UN R141, 유럽 등)은 <strong>20% 낮아지거나 150 kPa</strong>에 이르면 먼저 도달하는 쪽에서 경고하도록 정하고 있어, 권장 33 psi 차라면 대략 25~26 psi 부근에서 켜집니다. 경고등은 &lsquo;이미 많이 빠졌다&rsquo;는 신호이지 적정 공기압 알림이 아닙니다. 재충전 후에도 다시 켜진다면 (1) 펑크 의심, (2) 휠 림 손상으로 미세 누설, (3) TPMS 센서 자체 고장 중 하나일 가능성이 높습니다. 정비소에서 누설 점검을 받으세요.',
              },
              {
                q: '주유소 셀프 공기 주입기 정확도가 낮은 것 같아요',
                a: '공용 주입기 게이지는 여러 사람이 쓰며 충격을 받고 교정 주기도 알 수 없어, 기기마다 몇 psi씩 다르게 나오는 경우가 있습니다. <strong>휴대용 디지털 게이지</strong>를 하나 두고 제품 사양의 정확도 표기를 확인한 뒤, 늘 <strong>같은 게이지로 냉간 측정</strong>하면 기기 간 차이에 휘둘리지 않습니다. 주입은 주유소에서 하되 마무리 확인만 개인 게이지로 해도 충분합니다.',
              },
              {
                q: '뒷타이어가 앞타이어보다 공기압이 높은 이유?',
                a: '차량마다 다릅니다. 후륜을 더 높게 지정한 차(후륜구동 세단·SUV 등)는 <strong>승객·트렁크 짐 하중이 주로 뒤 차축에 실려 하중 변동폭이 크기 때문</strong>입니다. 반대로 앞이 무거운 전륜구동 차는 앞을 같거나 더 높게 지정하기도 합니다. 결국 <strong>운전석 도어 스티커의 전/후륜 지정값이 기준</strong>이며, 만차·짐이 많을 때는 스티커의 만차(full load) 칸 값을 우선하고, 그 표기가 없으면 후륜 위주로 약 +2~4 psi 올립니다.',
              },
              {
                q: '질소 충전이 정말 효과가 있나요?',
                a: '이론적으로 질소는 분자가 커서 누설이 약간 적고, 충전 질소는 수분이 없는 건조 기체라 온도에 따른 압력 변동 요인이 약간 적습니다. 다만 <strong>일반 공기도 78%가 질소</strong>이므로 차이는 크지 않으며, 일반 운전자에게는 비용 대비 효과가 미미합니다. 항공기·F1 등 극한 환경에서 의미가 있습니다.',
              },
              {
                q: '205/55R16은 무슨 뜻인가요?',
                a: '<strong>205</strong> = 단면폭 205mm, <strong>55</strong> = 편평비 55%(사이드월 높이 ÷ 폭), <strong>R</strong> = 래디얼 구조, <strong>16</strong> = 휠 지름 16인치. 외경은 16×25.4 + 2×(205×0.55) = 약 <strong>631.9mm</strong>입니다. 위 <strong>규격 해석</strong> 탭에 입력하면 외경·사이드월·인치업 조합이 자동 계산됩니다.',
              },
              {
                q: '인치업하면 외경은 어떻게 맞추나요?',
                a: '휠 지름을 키우면(예 16″→17″) 편평비를 낮추고 폭을 약간 넓혀 <strong>외경을 비슷하게 유지</strong>합니다. 예: 205/55R16 → 225/45R17 (외경 +0.4%). 외경 차이가 커지면 속도계 오차·간섭·승차감 변화가 생기므로 <strong>±3% 이내</strong>를 권장하며, 휠 폭·옵셋(ET)·하중지수도 함께 확인해야 합니다.',
              },
              {
                q: 'DOT 제조일자(예: 2419)는 어떻게 읽나요?',
                a: '타이어 옆면 DOT 코드 <strong>마지막 4자리</strong>가 제조 시기입니다. 앞 2자리 = 주차, 뒤 2자리 = 연도. <strong>2419 → 2019년 24주차</strong> 제조. 제조 6년이 지나면 마모와 무관하게 고무 경화로 교체를 검토하고, 10년이면 교체하세요.',
              },
              {
                q: '트레드 깊이는 동전으로 어떻게 확인하나요?',
                a: '한국 <strong>100원 동전</strong>을 홈에 거꾸로 꽂아 <strong>이순신 장군의 감투(관모)</strong>가 보이면 트레드가 마모한계에 가까워진 것으로 교체를 준비할 시기입니다. 타이어 홈 안의 <strong>△ 마모 한계 표시(1.6mm)</strong>가 트레드 면과 같은 높이가 되면 즉시 교체해야 합니다(법정 한계 1.6mm).',
              },
            ]

/* ─── 가이드 표·예시 — 단위 정의값·물리식으로 빌드 시 계산 (손으로 옮겨 적은 숫자 없음) ───
   psi = 1 lbf/in² = 0.45359237 kg × 9.80665 m/s² ÷ (0.0254 m)² (NIST SP 811) · bar = 100 kPa · kgf/cm² = 98.0665 kPa */
const PSI_KPA = (0.45359237 * 9.80665) / (0.0254 ** 2) / 1000 // 6.894757…
const BAR_KPA = 100
const KGF_KPA = 98.0665
const ATM_KPA = 101.325
const ATM_PSI = ATM_KPA / PSI_KPA
const r1 = (n: number) => n.toFixed(1)
const r2 = (n: number) => n.toFixed(2)
const signed = (n: number, d = 1) => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n).toFixed(d)

const UNIT_ROWS = [
  { u: 'psi', def: '1 lbf/in² (파운드힘 ÷ 제곱인치)', kpa: PSI_KPA, where: '미국 차량·국내 휴대용 게이지·주유소 주입기' },
  { u: 'kPa', def: '1,000 N/m² (SI 단위)', kpa: 1, where: '국내 도어 스티커·매뉴얼(psi 병기가 많음)' },
  { u: 'bar', def: '100 kPa (정의값)', kpa: BAR_KPA, where: '유럽 차량·자전거 펌프' },
  { u: 'kgf/cm²', def: '1 kgf ÷ 1 cm² = 98.0665 kPa', kpa: KGF_KPA, where: '구형 게이지·산업용 공압' },
]
const REF_PSI = 33

/** 차종별 참고 범위(psi) — kPa·bar는 psi에서 계산 */
const VEHICLE_ROWS: { c: string; lo: number; hi: number }[] = [
  { c: '경차 (모닝·스파크)',         lo: 31, hi: 33 },
  { c: '소형 세단 (아반떼·K3)',      lo: 32, hi: 35 },
  { c: '중형 세단 (쏘나타·K5)',      lo: 33, hi: 35 },
  { c: '대형 세단 (그랜저·K8)',      lo: 33, hi: 36 },
  { c: '소형 SUV (코나·셀토스)',     lo: 33, hi: 35 },
  { c: '중·대형 SUV (싼타페·쏘렌토)', lo: 33, hi: 36 },
  { c: '경상용·승합차',              lo: 40, hi: 50 },
  { c: '로드바이크',                 lo: 90, hi: 120 },
  { c: '그래블·투어링 자전거',       lo: 50, hi: 80 },
  { c: 'MTB',                       lo: 25, hi: 50 },
  { c: '오토바이 (스쿠터·일반)',     lo: 32, hi: 42 },
]

/** 기온 변화 → 게이지 압력 (정적 부피 이상기체: 절대압 ∝ 절대온도). 기준: 냉간 33 psi로 맞춘 뒤 기온만 변화 */
const afterTemp = (gaugePsi: number, t1: number, t2: number) => (gaugePsi + ATM_PSI) * (t2 + 273.15) / (t1 + 273.15) - ATM_PSI
const TEMP_ROWS = [
  { s: '늦가을 → 초겨울',   t1: 20, t2: 0,   a: '재충전 — TPMS 경고등이 가장 많이 켜지는 시기' },
  { s: '초겨울 → 한파',     t1: 0,  t2: -15, a: '추운 아침 경고등이 켜지면 냉간 기준으로 보충' },
  { s: '초봄 → 늦봄',       t1: 5,  t2: 20,  a: '겨울에 넉넉히 넣었다면 봄에 과다 여부 확인' },
  { s: '한여름 아침 → 낮',  t1: 25, t2: 35,  a: '낮 기온 때문에 빼지 말 것 — 아침 냉간 값 기준' },
  { s: '주행 직후 (타이어 내부 +25°C 가정)', t1: 20, t2: 45, a: '주행 후 측정값에 맞춰 빼면 냉간 시 부족' },
].map((r) => { const p = afterTemp(REF_PSI, r.t1, r.t2); return { ...r, p, d: p - REF_PSI } })
const PER10 = afterTemp(REF_PSI, 20, 10) - REF_PSI

/** 고도 — 게이지는 대기압과의 차이를 잰다. ISA 표준대기 p(h) = 101.325 × (1 − 2.25577e-5·h)^5.25588 kPa */
const ALT_M = 1000
const ALT_KPA = ATM_KPA * Math.pow(1 - 2.25577e-5 * ALT_M, 5.25588)
const ALT_GAIN_PSI = (ATM_KPA - ALT_KPA) / PSI_KPA

/** 공기압 조견표 */
const CHART_PSI = [26, 28, 30, 32, 33, 34, 35, 36, 38, 40, 45, 50, 60, 80, 100, 120]
const HOOKLESS_PSI = (5 * BAR_KPA) / PSI_KPA

/** 규격 → 외경 (Client와 같은 식: 휠지름×25.4 + 2×단면폭×편평비/100) */
const outerMm = (w: number, a: number, rim: number) => rim * 25.4 + 2 * (w * a) / 100
const BASE = { w: 205, a: 55, rim: 16 }
const BASE_OUTER = outerMm(BASE.w, BASE.a, BASE.rim)
const SIZE_ROWS = [
  { w: 195, a: 65, rim: 15 },
  { w: 215, a: 55, rim: 16 },
  { w: 205, a: 60, rim: 16 },
  { w: 225, a: 45, rim: 17 },
  { w: 215, a: 50, rim: 17 },
  { w: 225, a: 40, rim: 18 },
  { w: 235, a: 35, rim: 19 },
].map((s) => { const o = outerMm(s.w, s.a, s.rim); const diff = (o / BASE_OUTER - 1) * 100; return { ...s, o, diff } })

/** 하중지수(LI) → 타이어 1본 최대 하중(kg) — ISO 4000-1·ETRTO 공통 표 */
const LOAD_INDEX: [number, number][] = [
  [87, 545], [88, 560], [89, 580], [90, 600], [91, 615], [92, 630], [93, 650], [94, 670], [95, 690],
  [96, 710], [97, 730], [98, 750], [99, 775], [100, 800], [101, 825], [102, 850], [103, 875], [104, 900],
]

const th: React.CSSProperties = { padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }
const tdC: React.CSSProperties = { padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }
const tdN: React.CSSProperties = { padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }
const tdK: React.CSSProperties = { ...tdN, color: 'var(--accent-ink)', fontWeight: 700 }
const rowStyle = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })
const card: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px' }

export default function TirePressurePage() {
  return (
    <ToolPage width={760} slug="/tools/unit/tire-pressure">
      <h1 className="tp-h1">
        <ToolIconBadge catId="unit" />타이어 계산기
      </h1>
      <p className="tp-lead">
        공기압(psi·kPa·bar) 변환·체크 + <strong style={{ color: 'var(--text)' }}>규격 해석·인치업</strong>·트레드 마모·DOT 제조주차까지 한 번에.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="공기압 환산 = psi·bar·kgf/cm² 정의값(NIST SP 811) · 기온 보정 = 정적 부피 이상기체 식 · 외경 = 휠지름 + 2 × 단면폭 × 편평비 · 마모 한계 1.6mm = 국내 자동차 안전기준 · 점검 주기 = 한국교통안전공단·NHTSA 권고"
        sources={[
          { label: '한국교통안전공단', href: 'https://www.kotsa.or.kr' },
          { label: 'NHTSA — Tires', href: 'https://www.nhtsa.gov/equipment/tires' },
          { label: '자동차 및 자동차부품의 성능과 기준에 관한 규칙', href: 'https://www.law.go.kr/법령/자동차및자동차부품의성능과기준에관한규칙' },
          { label: 'NIST SP 811 — 단위 환산 계수', href: 'https://www.nist.gov/pml/special-publication-811' },
          { label: '미국 에너지부 — 타이어 공기압과 연비', href: 'https://www.fueleconomy.gov/feg/maintain.jsp' },
        ]}
      />

      <TirePressureClient />

      {/* 본문 광고 — 도구 결과 직후 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 공기압 단위 ── */}
        <div>
          <h2 className="g-h2">공기압 단위 4종 — 정의와 환산</h2>
          <p className="g-p">
            나라마다, 또 차량 매뉴얼·주유소 공기 주입기마다 표기 단위가 다릅니다. 같은 &ldquo;보통 공기압&rdquo;도 단위에 따라 2.3에서 230까지 전혀 다른 숫자로 보입니다. 네 단위는 모두 정의값으로 연결돼 있어 환산 자체에는 오차가 없습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['단위', '정의', '1단위 = kPa', `${REF_PSI} psi는`, '주로 보는 곳'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {UNIT_ROWS.map((r, i) => (
                  <tr key={r.u} style={rowStyle(i)}>
                    <td style={tdK}>{r.u}</td>
                    <td style={{ ...tdC, fontWeight: 400 }}>{r.def}</td>
                    <td style={tdN}>{r.kpa === 1 ? '1' : r.kpa < 10 ? r.kpa.toFixed(4) : String(r.kpa)}</td>
                    <td style={tdN}>{r.u === 'kPa' ? r1(REF_PSI * PSI_KPA) : r.u === 'psi' ? String(REF_PSI) : r2((REF_PSI * PSI_KPA) / r.kpa)}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.where}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="tip">
            한국은 도어 스티커·매뉴얼은 <strong>kPa</strong>로 적지만 운전자가 쓰는 게이지는 <strong>psi</strong>가 많습니다. 1 psi = {PSI_KPA.toFixed(3)} kPa이므로 <strong>kPa ÷ 6.9 ≈ psi</strong>로 어림하면 됩니다(230 kPa ≈ {r1(230 / PSI_KPA)} psi). bar와 kgf/cm²는 약 2% 차이라 게이지 눈금이 어느 쪽인지 확인하세요.
          </Callout>
        </div>

        {/* ── 2. 차종별 권장 공기압 참조표 ── */}
        <div>
          <h2 className="g-h2">차종별 권장 공기압 참조표</h2>
          <p className="g-p">
            정확한 값은 <strong>운전석 도어 안쪽 스티커</strong>나 차량 매뉴얼이 우선입니다. 아래는 일반적인 참고 범위입니다.
          </p>
          <p className="g-p">
            도어 스티커에는 전륜과 후륜 값이 따로 적힌 경우도 많습니다. 예를 들어 제가 타는 GV70(18인치)은 도어 스티커가 앞 33 / 뒤 36 psi입니다. 측정은 꼭 아침 첫 주행 전 <strong>냉간</strong>에서 하세요 — 한참 달린 뒤 주유소에서 재면 타이어가 데워져 높게 나오고(제 차는 4~5psi쯤 차이 났습니다), 그 숫자에 맞추면 오히려 공기가 모자라게 됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['차종', 'psi', 'kPa', 'bar'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {VEHICLE_ROWS.map((r, i) => (
                  <tr key={r.c} style={rowStyle(i)}>
                    <td style={tdC}>{r.c}</td>
                    <td style={tdK}>{r.lo}~{r.hi}</td>
                    <td style={tdN}>{Math.round(r.lo * PSI_KPA)}~{Math.round(r.hi * PSI_KPA)}</td>
                    <td style={{ ...tdN, color: 'var(--muted)' }}>{r1((r.lo * PSI_KPA) / BAR_KPA)}~{r1((r.hi * PSI_KPA) / BAR_KPA)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="note" title="탑승인원·적재 보정">
            1~3명 일상 주행은 표준 공기압 그대로, <strong>5인 만차·트렁크 가득·고속 장거리</strong>는 후륜 위주로 약 +2~4 psi 높입니다. 도어 스티커에 &lsquo;표준&rsquo;과 &lsquo;만차(full load)&rsquo; 공기압, 전륜/후륜이 따로 표기돼 있으면 상황에 맞는 값을 우선하세요.
          </Callout>
        </div>

        {/* ── 3. 공기압 부족·과다의 영향 ── */}
        <div>
          <h2 className="g-h2">공기압 부족·과다의 영향 (연비·마모·안전)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--warning-soft)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: '14px', color: 'var(--warning)', fontWeight: 800, marginBottom: '8px' }}>공기압 부족</p>
              <ul style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: 1.8, paddingLeft: '18px', margin: 0 }}>
                <li><strong style={{ color: 'var(--text)' }}>연비 저하</strong> — 네 바퀴 평균 1 psi 부족마다 약 0.2%</li>
                <li>타이어 양쪽 어깨(숄더) 마모 가속</li>
                <li>사이드월이 더 휘며 발열 증가 → 고속 파열(블로아웃) 위험</li>
                <li>핸들 무거움, 코너에서 차체가 늦게 반응</li>
              </ul>
            </div>
            <div style={{ background: 'var(--danger-soft)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: '14px', color: 'var(--danger)', fontWeight: 800, marginBottom: '8px' }}>공기압 과다</p>
              <ul style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: 1.8, paddingLeft: '18px', margin: 0 }}>
                <li>승차감 저하 (노면 진동 직접 전달)</li>
                <li>타이어 중앙 마모 가속</li>
                <li>접지 면적 감소 → <strong style={{ color: 'var(--text)' }}>제동 거리 증가</strong></li>
                <li>포트홀 충격에 휠·타이어 손상 가능</li>
              </ul>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            연비 영향은 생각보다 작습니다. 미국 에너지부는 네 바퀴 평균 공기압이 1 psi 낮을 때마다 연비가 약 0.2% 떨어진다고 안내하는데, 권장 {REF_PSI} psi 차가 10%({r1(REF_PSI * 0.1)} psi) 부족하면 약 {r1(REF_PSI * 0.1 * 0.2)}% 손실입니다. 적정 공기압 유지로 얻는 개선은 평균 0.6%, 많게는 3% 정도로 제시됩니다. 오히려 <strong>마모와 안전</strong> 쪽 손해가 큽니다.
          </p>
          <Callout tone="note">
            <strong>한국교통안전공단</strong>은 부적정 공기압을 고속도로 타이어 사고의 주요 원인으로 꼽고 <strong>월 1회 이상 냉간 점검</strong>을 권장합니다(NHTSA도 동일 권고). 기준: 2026-07 확인.
          </Callout>
        </div>

        {/* ── 4. 기온과 공기압 ── */}
        <div>
          <h2 className="g-h2">기온과 공기압 — 이상기체 식으로 계산한 변화량</h2>
          <p className="g-p">
            타이어 속 공기는 부피가 거의 일정한 용기 안의 기체라서 <strong>절대압력이 절대온도(K)에 비례</strong>합니다. 게이지는 대기압과의 차이(게이지압)를 보여 주므로 계산은 대기압 {r1(ATM_PSI)} psi를 더해 절대압으로 바꾼 뒤 온도 비를 곱하고 다시 빼는 순서입니다: <strong>P₂ = (P₁ + {r1(ATM_PSI)}) × (T₂ + 273.15) ÷ (T₁ + 273.15) − {r1(ATM_PSI)}</strong>.
          </p>
          <p className="g-p">
            {REF_PSI} psi 차라면 기온 10°C 하락에 약 {r1(Math.abs(PER10))} psi({r1(Math.abs(PER10) * PSI_KPA)} kPa)가 빠집니다. 흔히 말하는 &ldquo;10°C당 1~2 psi&rdquo;가 바로 이 값입니다. 아래 표는 냉간 {REF_PSI} psi로 맞춘 뒤 온도만 바뀐 경우입니다(실제 타이어는 부피가 약간 늘어 변화가 조금 작게 나올 수 있습니다).
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['상황', '온도 변화', '게이지 값', '변화량', '대응'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {TEMP_ROWS.map((r, i) => (
                  <tr key={r.s} style={rowStyle(i)}>
                    <td style={tdC}>{r.s}</td>
                    <td style={{ ...tdN, color: 'var(--muted)' }}>{r.t1}°C → {r.t2}°C</td>
                    <td style={tdN}>{r1(r.p)} psi</td>
                    <td style={tdK}>{signed(r.d)} psi ({signed(r.d * PSI_KPA, 0)} kPa)</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text-body)', fontSize: '12px' }}>{r.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            고도도 게이지 값을 바꿉니다. 해발 {ALT_M.toLocaleString('en-US')} m에서는 표준대기압이 약 {r1(ALT_KPA)} kPa로 낮아져, 같은 타이어라도 게이지가 약 {r1(ALT_GAIN_PSI)} psi 높게 읽힙니다. 산 위에서 &lsquo;높다&rsquo;며 공기를 빼면 내려와서는 그만큼 부족해집니다.
          </p>
          <Callout tone="warn">
            측정은 반드시 <strong>주행 전 냉간(cold) 상태</strong>에서 하세요. 달린 직후에는 타이어 내부 온도가 올라 3~5 psi 높게 나옵니다(위 표의 +25°C 가정 행). 질소 충전은 수분이 없는 건조 기체라 압력 변동 요인이 약간 적지만, 온도에 따른 변화 자체는 공기와 거의 같습니다.
          </Callout>
        </div>

        {/* ── 5. 자전거 공기압 ── */}
        <div>
          <h2 className="g-h2">자전거 공기압 (로드 / 그래블 / MTB)</h2>
          <p className="g-p">
            자전거는 자동차보다 훨씬 넓은 범위의 공기압을 씁니다. <strong>타이어 옆면(사이드월)</strong>에 표기된 최소~최대 범위를 반드시 확인하세요.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { type: '로드바이크',            psi: '90~120 psi', desc: '얇은 타이어로 구름 저항 최소화. 라이더 체중에 따라 조정.' },
              { type: '그래블·투어링',         psi: '50~80 psi',  desc: '비포장 약간 + 포장. 그립과 속도의 균형.' },
              { type: 'MTB (XC)',             psi: '30~45 psi',  desc: '비포장 트레일에서 그립 우선. 림 보호 위해 너무 낮추지 않기.' },
              { type: 'MTB (다운힐·튜브리스)', psi: '20~30 psi',  desc: '튜브리스 시스템 한정. 일반 클린처는 펑크 위험.' },
              { type: '시티·하이브리드',       psi: '50~70 psi',  desc: '도심 주행. 너무 높으면 진동, 너무 낮으면 무거움.' },
            ].map((c) => (
              <div key={c.type} style={card}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{c.type}</p>
                <p style={{ fontSize: '14px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 800, marginBottom: '4px' }}>{c.psi}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            같은 체중이라면 <strong>타이어가 넓을수록 필요한 공기압이 낮아집니다</strong>. 로드 90~120 psi는 23~25 mm 폭 튜브 타이어에서 쓰던 전통적인 범위이고, 28 mm 이상 광폭·튜브리스 타이어는 이보다 낮게 쓰는 경우가 많습니다. 어떤 경우든 타이어와 림에 적힌 최대 압력 중 <strong>낮은 쪽</strong>을 넘기지 마세요.
          </p>
          <Callout tone="warn" title="후크리스(hookless) 림 주의">
            림 안쪽에 타이어를 거는 턱이 없는 후크리스 림은 ETRTO·ISO 규격상 <strong>최대 5 bar({r1(HOOKLESS_PSI)} psi)</strong>로 제한됩니다. 로드 타이어라도 100 psi를 넣으면 타이어가 림에서 이탈할 수 있습니다.
          </Callout>
        </div>

        {/* ── 6. 공기압 조견표 ── */}
        <div>
          <h2 className="g-h2">공기압 환산 조견표 (psi → kPa · bar · kgf/cm²)</h2>
          <p className="g-p">
            자동차 권장 범위(26~50 psi)와 자전거 고압 구간을 한 번에 볼 수 있게 정리했습니다. 위 변환 탭과 같은 정의값으로 계산합니다. 반대 방향 예시: 220 kPa ÷ {PSI_KPA.toFixed(3)} = <strong>{r1(220 / PSI_KPA)} psi</strong>, 2.3 bar = <strong>{r1((2.3 * BAR_KPA) / PSI_KPA)} psi</strong>, 2.0 kgf/cm² = <strong>{r1((2 * KGF_KPA) / PSI_KPA)} psi</strong>.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['psi', 'kPa', 'bar', 'kgf/cm²'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {CHART_PSI.map((p, i) => (
                  <tr key={p} style={rowStyle(i)}>
                    <td style={tdK}>{p}</td>
                    <td style={tdN}>{r1(p * PSI_KPA)}</td>
                    <td style={tdN}>{r2((p * PSI_KPA) / BAR_KPA)}</td>
                    <td style={tdN}>{r2((p * PSI_KPA) / KGF_KPA)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 7. 타이어 규격 해석 ── */}
        <div>
          <h2 className="g-h2">타이어 규격 보는 법 (예: 205/55R16 91V)</h2>
          <p className="g-p">
            타이어 옆면(사이드월)의 숫자는 크기와 성능 한계를 나타냅니다. 위 <strong>규격 해석</strong> 탭에 입력하면 외경·사이드월·인치업 조합이 자동 계산됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['표기', '의미', '예시 (205/55R16 91V)'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '205', m: '단면폭 (mm)', e: '205 mm' },
                  { t: '55', m: '편평비 (단면 높이 ÷ 폭, %)', e: `55% → 사이드월 ${r1((BASE.w * BASE.a) / 100)} mm` },
                  { t: 'R', m: '래디얼 구조 (Radial)', e: '일반 승용 표준' },
                  { t: '16', m: '휠(림) 지름 (인치)', e: `16″ = ${r1(16 * 25.4)} mm` },
                  { t: '91', m: '하중지수 (LI)', e: '타이어 1본 최대 615 kg' },
                  { t: 'V', m: '속도기호', e: '최고 240 km/h' },
                ].map((r, i) => (
                  <tr key={r.t} style={rowStyle(i)}>
                    <td style={tdK}>{r.t}</td>
                    <td style={tdC}>{r.m}</td>
                    <td style={{ ...tdN, color: 'var(--muted)' }}>{r.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            <strong>외경 공식</strong>: 휠지름(mm) + 2 × (단면폭 × 편평비 ÷ 100) = 16×25.4 + 2×(205×0.55) = <strong>{r1(BASE_OUTER)} mm</strong>. 인치업·교체 사이즈는 이 외경을 유지하는 것이 핵심이고, 외경이 달라진 비율만큼 속도계·주행거리계가 틀어집니다. 아래는 205/55R16 기준으로 계산한 예시입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['규격', '외경', '205/55R16 대비', '계기판 100 km/h일 때 실제'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {SIZE_ROWS.map((s, i) => (
                  <tr key={`${s.w}/${s.a}R${s.rim}`} style={rowStyle(i)}>
                    <td style={tdK}>{s.w}/{s.a}R{s.rim}</td>
                    <td style={tdN}>{r1(s.o)} mm</td>
                    <td style={{ ...tdN, color: Math.abs(s.diff) > 3 ? 'var(--danger)' : 'var(--text)', fontWeight: Math.abs(s.diff) > 3 ? 700 : 400 }}>{signed(s.diff)}%{Math.abs(s.diff) > 3 ? ' (3% 초과)' : ''}</td>
                    <td style={tdN}>{r1(100 * (1 + s.diff / 100))} km/h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            폭만 한 단계 넓히거나(215/55R16) 편평비만 올리면(205/60R16) 외경이 생각보다 크게 변합니다. 외경 차이는 <strong>±3% 이내</strong>를 권장하며, 외경이 커지면 실제 속도가 계기판보다 빠릅니다. 인치업 때는 <strong>하중지수</strong>도 원래 이상이어야 합니다 — 인치업 사이즈는 같은 공기압에서 받칠 수 있는 하중이 원래 타이어보다 작을 수 있으므로, 도어 스티커 값을 그대로 쓰지 말고 타이어 제조사의 하중·공기압 표에서 원래 하중 이상을 받치는 공기압을 확인하세요. XL(보강) 표시는 더 높은 공기압까지 넣었을 때 더 무거운 하중을 받칠 수 있다는 뜻이지, 같은 공기압에서 하중 여유가 더 생긴다는 뜻은 아닙니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 360 }}>
              <caption className="srOnly">하중지수별 타이어 1본 최대 하중</caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['하중지수', '최대 하중', '하중지수', '최대 하중'].map((h, i) => <th scope="col" key={i} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {LOAD_INDEX.slice(0, 9).map(([li, kg], i) => {
                  const [li2, kg2] = LOAD_INDEX[i + 9]
                  return (
                    <tr key={li} style={rowStyle(i)}>
                      <td style={tdK}>{li}</td>
                      <td style={tdN}>{kg} kg</td>
                      <td style={tdK}>{li2}</td>
                      <td style={tdN}>{kg2} kg</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            속도기호: Q 160 · R 170 · S 180 · T 190 · U 200 · H 210 · V 240 · W 270 · Y 300 km/h (H가 알파벳 순서와 달리 U와 V 사이). 최대 하중은 해당 타이어의 규정 공기압 기준이라, 공기압이 낮으면 실제로 버틸 수 있는 하중도 줄어듭니다.
          </p>
        </div>

        {/* ── 8. 교체 시기·마모·DOT ── */}
        <div>
          <h2 className="g-h2">타이어 교체 시기 — 트레드 마모 · 주행거리 · DOT 제조주차</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '14px' }}>
            {[
              { t: '트레드(홈) 깊이', v: '마모한계 1.6mm', d: '신품 약 7~8mm. 3mm부터 빗길 제동력 저하 → 교체 준비. 1.6mm는 법정 한계(△ 마모표시).' },
              { t: '주행거리', v: '약 4~5만 km', d: '운전 습관·노면에 따라 차이. 5만 km 초과 시 마모·상태 집중 점검.' },
              { t: '사용 연수', v: '6년 검토 · 10년 교체', d: '마모가 적어도 고무가 경화·균열. 제조 6년부터 검토, 10년이면 교체.' },
            ].map((c) => (
              <div key={c.t} style={card}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{c.t}</p>
                <p style={{ fontSize: '14px', color: 'var(--accent-ink)', fontWeight: 800, marginBottom: '4px' }}>{c.v}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <Callout tone="note" title="DOT 제조주차 읽는 법">
            <p>
              타이어 옆면 <strong>DOT</strong> 코드의 <strong>마지막 4자리</strong>가 제조 시기입니다. 앞 2자리 = <strong>주차(week)</strong>, 뒤 2자리 = <strong>연도</strong>. 예: <strong>2419</strong> → 2019년 24주차(6월 중순) 제조. 위 <strong>교체·마모</strong> 탭에 입력하면 경과 연수와 교체 권장 여부가 표시됩니다.
            </p>
            <p>
              끝자리가 <strong>3자리</strong>뿐이라면 2000년 이전 제조 타이어입니다. 이 도구는 4자리(2000년 이후) 형식만 해석하며, 3자리 코드라면 연식만으로도 교체 대상입니다. 스페어 타이어는 거의 닳지 않아 연식을 놓치기 쉬우니 함께 확인하세요.
            </p>
          </Callout>
        </div>

        {/* ── 9. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 10. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/car-cost',  icon: '🚗', name: '자동차 유지비 계산기', desc: '유류비·보험·소모품·감가상각' },
              { href: '/tools/unit/converter',    icon: '📐', name: '단위 변환기',           desc: '길이·무게·온도 등 14종 통합 변환' },
              { href: '/tools/unit/fuel-economy', icon: '⛽', name: '연비 변환기',     desc: 'km/L·mpg·L/100km 변환' },
              { href: '/tools/unit/viscosity',    icon: '🛢️', name: '점도 변환기',           desc: 'cP·cSt·SAE 엔진오일 점도' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-m)',
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
    </ToolPage>
  )
}
