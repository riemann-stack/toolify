import Link from 'next/link'
import HardnessClient from './HardnessClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { convertHardness } from './hardnessData'

export const metadata = buildMetadata({
  path: '/tools/unit/hardness',
  title: '경도(Hardness) 변환기 — HRC·HRB·HV·HB·인장강도',
  description:
    'ASTM E140 강철 환산표 기반 경도 변환. 로크웰 HRC·HRB, 비커스 HV, 브리넬 HB 상호 변환 + 인장강도 추정. 칼·공구·금속 가공용 — 칼덕·메이커·엔지니어 필수.',
  keywords: [
    '경도 변환', '경도 환산', 'HRC HV 변환', 'HRC 환산표',
    '로크웰 경도', '비커스 경도', '브리넬 경도',
    'HRC HRB', 'HV HB', '인장강도 환산',
    '강철 경도', '칼 경도', 'HRC 칼날',
    '공구강 경도', 'HSS 경도', '드릴 비트 경도',
    'ASTM E140', '경도 측정',
    '나이프 경도', '칼덕', 'M390 ZDP-189',
  ],
})

const FAQ_LD = [
              {
                q: '경도가 높을수록 좋은 칼인가요?',
                a: '아닙니다. 경도가 올라가면 <strong>날 유지력은 증가하지만 인성(충격 견딤)은 감소</strong>합니다. 58 HRC 부엌칼은 갈기 쉽고 떨어뜨려도 안 부서지지만, 65 HRC 칼은 날이 오래 가는 대신 뼈에 부딪히면 이 빠질 수 있어요. 용도에 맞춰 선택 — 일반 주방은 54~58, EDC·하이엔드는 59~62, 초고경도·특수용은 63+ 권장.',
              },
              {
                q: 'HRC와 HRB는 왜 따로 있나요?',
                a: 'Rockwell 경도계는 압자(indenter)와 하중을 바꿔 여러 스케일을 측정합니다. <strong>HRC는 다이아 원뿔 + 150kgf</strong>로 단단한 강철에, <strong>HRB는 1/16인치 구(현행 표준은 초경 HRBW) + 100kgf</strong>로 연강·황동에 적합. 무른 금속에 HRC를 쓰면 압자가 너무 깊이 들어가 부정확하고, 단단한 강철에 HRB를 쓰면 강구가 변형되어 측정 자체가 안 됩니다. 두 스케일이 만나는 경계가 HRC 20 ≈ HRB 100.',
              },
              {
                q: '카바이드(텅스텐 카바이드)는 왜 변환이 안 되나요?',
                a: '카바이드는 <strong>HV 1500~2500</strong> 범위로 ASTM E140 표 끝(HV 940 ≈ HRC 68)을 한참 벗어나며, Rockwell C로 정확히 측정 불가능합니다. 카바이드는 자체적으로 <strong>HRA(다이아 원뿔 + 60kgf)</strong> 스케일을 쓰며 HRA 85~95 범위가 일반적. 본 도구는 강철 전용이라 카바이드는 별도 표가 필요해요.',
              },
              {
                q: 'Shore 경도와 비교할 수 있나요?',
                a: '<strong>직접 변환은 불가</strong>합니다. Shore A/D 듀로미터도 압입식이지만(스프링 하중 + 전용 압자, ASTM D2240), 압자 형상·하중·대상 재료가 강철용 HRC/HV/HB와 전혀 달라 1:1 매핑할 수 없어요. 참고로 금속에 쓰는 쇼어 경도(HS)는 다이아몬드 해머의 반발 높이를 재는 스클레로스코프 방식으로, 이름만 같은 별개 시험입니다. Shore D 80은 단단한 폴리카보네이트 수준이며 강철과 같은 영역이 아닙니다. 칼·공구는 HRC/HV, 고무·플라스틱은 Shore A/D로 별개 관리.',
              },
              {
                q: 'HRC 60과 HV 700 중 어느 게 더 정확한 측정인가요?',
                a: 'HV(비커스)가 측정 원리상 더 정밀합니다 — 압자가 작아 박판·코팅·열영향부(HAZ) 등 미세 영역을 잴 수 있고, 하중만 바꿔 같은 식(HV = 0.1891 × F ÷ d²)으로 무른 금속부터 카바이드(HV 1500 이상)까지 한 척도로 잴 수 있습니다. 다만 HRC는 측정이 빠르고 장비가 저렴해 산업 현장에서 더 흔히 쓰입니다. 정밀 R&D는 HV, 양산 품질관리는 HRC가 일반적.',
              },
              {
                q: '인장강도(MPa)는 어떻게 추정되나요?',
                a: '강철의 경우 <strong>UTS(MPa) ≈ 3.45 × HB</strong> 또는 <strong>UTS ≈ 3.2 × HV</strong> 근사가 자주 쓰입니다. 본 도구는 <strong>ISO 18265 표 A.1</strong>(비합금·저합금강의 경도-인장강도 환산표) 값을 보간해 사용하며, 위 근사식과 대체로 일치합니다(ASTM E140에는 인장강도 열이 없습니다). ISO 스스로 경도→인장강도 환산을 가장 신뢰도 낮은 환산으로 규정하니, 실측치는 합금 성분·압연 방향·시험 온도에 따라 ±10% 오차가 흔하고 설계 적용 전에는 인장시험이 필수입니다.',
              },
              {
                q: '같은 강재인데 HRC 표기가 다른 이유가 뭔가요?',
                a: '<strong>열처리(quenching·tempering)</strong>가 다르기 때문입니다. 같은 VG-10이라도 담금질 후 템퍼링 온도를 조정해 60 HRC ~ 62 HRC 범위로 자유롭게 조절 가능. 카탈로그의 HRC는 제조사의 표준 처리 결과이며, 다른 처리를 적용하면 다른 값이 나옵니다. 또한 표면 경화(carburizing·nitriding) 처리 시 표면만 HRC 60+이고 내부는 25 수준일 수 있어요.',
              },
              {
                q: '집에서 경도를 측정할 수 있나요?',
                a: '정확한 측정은 어렵지만 간이 비교는 가능합니다. <strong>줄(file) 테스트</strong>가 가장 흔한 방법 — 새 줄(통상 HRC 62~66)로 시편을 긁어 흔적이 안 남으면 시편이 ≥줄 경도, 쉽게 깎이면 ≤줄 경도. 칼덕은 <strong>경도 측정 파일 세트</strong>(40·45·50·55·60·65 HRC 표준 줄 6개 구성)를 구매해 비교하기도 해요. 정확한 수치는 경도계로 재야 하고, 납품·분쟁용 공인 성적서가 필요하면 KOLAS(한국인정기구) 인정 시험기관에 의뢰합니다.',
              },
            ]

/* ─── 가이드 표 — 도구와 같은 데이터·함수(hardnessData)로 빌드 시 계산해 화면 결과와 어긋나지 않게 한다 ─── */
const fmtHv = (n: number | null) => (n === null ? '—' : String(Math.round(n)))
const fmtRb = (n: number | null) => (n === null ? '—' : n.toFixed(1))
const fmtTs = (n: number | null) => (n === null ? '—' : Math.round(n).toLocaleString('en-US'))

/** HRC 68→20 (2단위) — 표 수록 행 그대로 */
const HRC_TABLE = Array.from({ length: 25 }, (_, i) => 68 - 2 * i).map((hrc) => ({ ...convertHardness('hrc', hrc), hrc }))
/** HRB 100→55 (5단위) — HRC 20 미만 연질 구간 */
const HRB_TABLE = Array.from({ length: 10 }, (_, i) => 100 - 5 * i).map((hrb) => ({ ...convertHardness('hrb', hrb), hrb }))

/** 가이드 예시 — 도구 입력 그대로 */
const EX_HRC45 = convertHardness('hrc', 45)
const EX_HB200 = convertHardness('hb', 200)
const EX_TS1000 = convertHardness('tensile', 1000)
const EX_HRC60 = convertHardness('hrc', 60)

/* ─── 압흔 깊이·최소 시편 두께 — 각 시험 규격의 정의식으로 계산 ───
   로크웰: HR = N − h/0.002mm (다이아 원뿔 N=100, 강구 N=130) · 최소 두께 = 원뿔 10h / 강구 15h (ISO 6508-1)
   비커스: HV = 0.1891 × F(N) ÷ d² (d = 대각선 평균, mm) · 최소 두께 1.5d (ISO 6507-1)
   브리넬: 압흔 깊이 h = F(kgf) ÷ (π·D·HB) · 최소 두께 8h (ISO 6506-1) */
const rockwellDepth = (value: number, n: number) => (n - value) * 0.002
const vickersDiag = (hv: number, forceN: number) => Math.sqrt((0.1891 * forceN) / hv)
const brinellDepth = (hb: number, kgf: number, dMm: number) => kgf / (Math.PI * dMm * hb)
const INDENT_ROWS = [
  { test: 'HRC 60', cond: '다이아 원뿔 · 150 kgf', depth: rockwellDepth(60, 100), minT: rockwellDepth(60, 100) * 10, rule: '깊이 × 10' },
  { test: 'HRC 30', cond: '다이아 원뿔 · 150 kgf', depth: rockwellDepth(30, 100), minT: rockwellDepth(30, 100) * 10, rule: '깊이 × 10' },
  { test: 'HRB 80', cond: '1/16″ 구 · 100 kgf', depth: rockwellDepth(80, 130), minT: rockwellDepth(80, 130) * 15, rule: '깊이 × 15' },
  { test: 'HV10 700', cond: '136° 피라미드 · 98.07 N', depth: vickersDiag(700, 98.07) / 7, minT: vickersDiag(700, 98.07) * 1.5, rule: '대각선 × 1.5' },
  { test: 'HBW 10/3000 200', cond: '10 mm 초경 구 · 3000 kgf', depth: brinellDepth(200, 3000, 10), minT: brinellDepth(200, 3000, 10) * 8, rule: '깊이 × 8' },
]
const mm = (n: number) => (n < 0.1 ? n.toFixed(3) : n.toFixed(2))

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }
const td: React.CSSProperties = { padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }
const tdKey: React.CSSProperties = { ...td, color: 'var(--accent-ink)', fontWeight: 700 }
const rowStyle = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })

export default function HardnessPage() {
  return (
    <ToolPage width={880} slug="/tools/unit/hardness">
      <h1 className="tp-h1">
        <ToolIconBadge catId="unit" />경도(Hardness) 변환기
      </h1>
      <p className="tp-lead">
        <strong style={{ color: 'var(--text)' }}>HRC·HRB·HV·HB·인장강도</strong> 동시 환산. ASTM E140 강철 표 기반. 칼덕·메이커·금속 가공용.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="경도 상호 환산 = ASTM E140 Table 1(비오스테나이트계 강)·Table 2(HRB 구간) · 인장강도 추정 = ISO 18265 표 A.1(비합금·저합금강) · 압흔 깊이·최소 두께 = ISO 6508-1·6507-1·6506-1 정의식"
        sources={[
          { label: 'ASTM E140 — 금속 경도 환산표', href: 'https://www.astm.org/e0140-12br19e01.html' },
          { label: 'ISO 18265 — 경도값 환산(인장강도 포함)', href: 'https://www.iso.org/standard/53810.html' },
        ]}
      />

      <HardnessClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 5개 스케일 개요 */}
        <section>
          <h2 className="g-h2">5개 경도 스케일 — 언제 어떤 걸 쓰나</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 580 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['스케일', '압자', '하중', '실용 범위', '주 사용'].map(h => (
                    <th scope="col" key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['HRC',     '120° 다이아 원뿔',     '150 kgf',  '20~70',     '경강·공구강·HSS·칼날'],
                  ['HRB',     '1/16" 구 (현행 초경 HRBW)', '100 kgf',  '40~100',    '연강·황동·구리'],
                  ['HV',      '136° 다이아 피라미드',  '1~50 kgf', '50~1500',   '박판·코팅·미세 영역 (가장 광범위)'],
                  ['HB',      '10mm 초경(텅스텐카바이드) 구', '3000 kgf', '80~650',    '주철·주강 등 큰 부품'],
                  ['Tensile', '—',                    '—',        '255~2180 MPa', '강철 인장강도 추정 (ISO 18265 환산)'],
                ].map((row, i) => (
                  <tr key={i} style={rowStyle(i)}>
                    <td style={tdKey}>{row[0]}</td>
                    <td style={{ ...td, fontFamily: undefined }}>{row[1]}</td>
                    <td style={{ ...td, fontWeight: 700 }}>{row[2]}</td>
                    <td style={td}>{row[3]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="note">
            <strong>HRC와 HRB는 측정 범위가 거의 겹치지 않습니다</strong> — 이 도구의 표에서는 HRC 20 = HRB 100(HV 238)이 경계입니다. 무른 시편에 HRC를 쓰면 원뿔이 너무 깊이 들어가고, 단단한 시편에 HRB를 쓰면 구가 변형되므로 같은 시편을 두 스케일로 번갈아 재지 말고 재질에 맞는 스케일 하나로 측정하세요.
          </Callout>
        </section>

        {/* 2. 측정 원리 */}
        <section>
          <h2 className="g-h2">경도 숫자는 무엇을 잰 값인가 — 압흔 깊이와 시편 두께</h2>
          <p className="g-p">
            세 시험 모두 단단한 압자를 눌러 남은 자국(압흔)으로 경도를 정하지만, <strong>무엇을 재는지가 다릅니다</strong>. 로크웰은 압흔의 <strong>깊이</strong>를 재서 HRC = 100 − h ÷ 0.002 mm로 계산하므로 HRC 1포인트가 깊이 2 µm에 해당합니다(강구를 쓰는 HRB는 130 − h ÷ 0.002 mm). 비커스는 사각 압흔의 <strong>대각선 길이 d</strong>로 HV = 0.1891 × F(N) ÷ d², 브리넬은 둥근 압흔의 <strong>지름</strong>으로 하중을 압흔 표면적으로 나눈 값을 씁니다.
          </p>
          <p className="g-p">
            이렇게 물리량 자체가 달라서 스케일 사이를 잇는 이론식은 없고, 같은 시편을 여러 방법으로 잰 실측을 모은 <strong>경험 환산표</strong>(ASTM E140·ISO 18265)가 유일한 다리입니다. 또 압흔이 시편 두께에 비해 너무 깊으면 받침대의 영향을 받아 값이 틀어지므로 각 규격이 최소 두께를 정해 두었습니다. 아래는 각 정의식으로 계산한 예시입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['시험·값', '압자·하중', '압흔 깊이', '최소 시편 두께', '두께 규칙'].map(h => (
                    <th scope="col" key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INDENT_ROWS.map((r, i) => (
                  <tr key={r.test} style={rowStyle(i)}>
                    <td style={tdKey}>{r.test}</td>
                    <td style={{ ...td, fontFamily: undefined }}>{r.cond}</td>
                    <td style={td}>{mm(r.depth)} mm</td>
                    <td style={{ ...td, fontWeight: 700 }}>{r.minT.toFixed(2)} mm 이상</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{r.rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            비커스 압흔 깊이는 대각선의 약 1/7(136° 피라미드 형상)로 계산. 브리넬 HBW 10/3000은 10 mm 구·3000 kgf 조건 표기입니다. 두께 규칙은 로크웰 ISO 6508-1, 비커스 ISO 6507-1, 브리넬 ISO 6506-1 기준.
          </p>
          <p className="g-p">
            표의 예시대로라면 <strong>브리넬(HB 200)은 약 4 mm, HRC는 1 mm 안팎, 비커스(HV10 700)는 0.3 mm 미만</strong>의 두께가 있어야 제대로 잴 수 있습니다. 1 mm 이하 박판·면도날·코팅층을 HRC로 재면 실제보다 낮게 나오기 쉬워, 이런 시편은 HV(또는 하중을 낮춘 표면 로크웰)로 재고 필요할 때만 환산하는 편이 맞습니다.
          </p>
        </section>

        {/* 3. ASTM E140 */}
        <section>
          <h2 className="g-h2">ASTM E140 — 강철 경도 환산 표준</h2>
          <p className="g-p">
            본 도구의 경도 상호 환산은 <strong>ASTM E140(Standard Hardness Conversion Tables for Metals)</strong>의 Table 1(비오스테나이트계 강 — 탄소강·합금강·공구강)과 Table 2(연질 구간·HRB)를 기반으로 합니다. 강철의 통계적 평균치를 정리한 표로, 오래전부터 산업 현장의 공통 기준으로 쓰여 왔습니다. 인장강도 열은 E140에 없는 항목이라 <strong>ISO 18265(경도값의 인장강도 환산) 표 A.1</strong>(비합금·저합금강)을 따릅니다.
          </p>
          <ul className="g-list">
            <li><strong>강철 전용</strong> — 알루미늄·구리·니켈 합금은 별도 표가 있으며 본 도구는 적용되지 않습니다.</li>
            <li><strong>오차는 한 숫자로 못 박을 수 없음</strong> — E140은 &ldquo;재료별 편차가 커서 환산 오차의 신뢰한계를 제시할 수 없다&rdquo;(§6.2)고 명시합니다. 환산값은 어디까지나 근사치로, 같은 HV라도 강종·열처리에 따라 환산 HRC가 달라질 수 있어요.</li>
            <li><strong>스테인리스 칼 강재는 편차 주의</strong> — VG-10·M390 같은 고탄소 칼 강재는 공구강과 성질이 가까워 이 환산이 실무·카탈로그에서 널리 통용되지만, 마르텐사이트계 스테인리스는 Table 1과 편차를 보일 수 있어 ASTM이 전용 환산표를 추가하는 개정 작업(WK97782)을 진행 중입니다. 강재 비교·취미 용도로는 충분하고, 규격 판정·품질 검사라면 해당 스케일로 직접 측정하는 것이 원칙.</li>
            <li><strong>HRC ≥ 20 권장</strong> — 그 이하 영역은 측정 신뢰도가 떨어지므로 HRB를 사용하세요.</li>
            <li><strong>브리넬 구 표기</strong> — 현행 ASTM E10·ISO 6506은 초경(텅스텐카바이드) 구만 인정(HBW)합니다. 구형 강구(HBS) 측정값은 고경도(약 450 HB 이상)에서 HBW와 차이가 날 수 있어요.</li>
            <li><strong>인장강도는 추정값</strong> — 정확한 인장강도는 인장시험기로 측정해야 합니다. 통상 <code>UTS ≈ 3.45 × HB (MPa)</code> 근사가 자주 쓰이고, 본 도구의 ISO 18265 보간값도 이와 대체로 일치합니다.</li>
          </ul>
        </section>

        {/* 4. 이 도구의 계산 방식 */}
        <section>
          <h2 className="g-h2">이 도구는 값을 어떻게 구하나 — HV 축 선형 보간</h2>
          <p className="g-p">
            환산표는 HRC 1포인트 간격처럼 띄엄띄엄 수록돼 있어서, 표 사이 값은 <strong>인접한 두 행 사이를 직선으로 보간</strong>합니다. 입력한 스케일에서 값을 감싸는 두 행을 찾아 비율을 구하고, 그 비율로 <strong>HV를 먼저 추정</strong>한 뒤 HV를 공통 축으로 삼아 다른 열(HRC·HB·HRB·인장강도)을 다시 보간합니다. 모든 열이 HV와 같은 방향으로 증가하기 때문에 가능한 방식입니다.
          </p>
          <ul className="g-list">
            <li><strong>HRC 45 입력</strong> → 표에 있는 행 그대로 HV {fmtHv(EX_HRC45.hv)} · HB {fmtHv(EX_HRC45.hb)} · 인장강도 {fmtTs(EX_HRC45.tensile)} MPa. 근사식 3.45 × HB = {Math.round(3.45 * (EX_HRC45.hb ?? 0)).toLocaleString('en-US')} MPa와 1% 안팎으로 맞습니다.</li>
            <li><strong>HB 200 입력</strong>(중탄소강 프리셋 — S45C 불림재 수준) → HV {fmtHv(EX_HB200.hv)} · HRB {fmtRb(EX_HB200.hrb)} · 인장강도 {fmtTs(EX_HB200.tensile)} MPa. HRC 칸은 &lsquo;—&rsquo;입니다 — HRC 20(HB 226)보다 무른 영역이라 HRC로는 잴 수 없기 때문입니다.</li>
            <li><strong>인장강도 1,000 MPa 입력</strong> → HV {fmtHv(EX_TS1000.hv)} · HRC {fmtRb(EX_TS1000.hrc)} · HB {fmtHv(EX_TS1000.hb)}. 설계 도면의 강도 요구를 현장 경도 검사값으로 옮길 때 쓰는 방향입니다.</li>
            <li><strong>HRC 60 입력</strong> → HV {fmtHv(EX_HRC60.hv)} · HB {fmtHv(EX_HRC60.hb)}이지만 인장강도는 &lsquo;—&rsquo;. ISO 18265 인장강도 열이 HV 650에서 끝나므로 표 끝값으로 붙잡아 두지 않고 비워 둡니다. HB {fmtHv(EX_HRC60.hb)}도 브리넬 시험 상한(650 HBW)을 넘어 &lsquo;범위 외&rsquo;로 표시됩니다.</li>
          </ul>
          <p className="g-p">
            입력 자체가 표 수록 범위(HRC 20~68, HV 80~940 등)를 벗어나면 기울기를 연장해 그럴듯한 숫자를 만들지 않고 환산을 멈춥니다. 표 밖의 값이 필요하다면 그 스케일로 직접 측정하는 수밖에 없습니다.
          </p>
        </section>

        {/* 5. 환산표 */}
        <section>
          <h2 className="g-h2">강철 경도 환산표 — HRC 20~68 · HRB 55~100</h2>
          <p className="g-p">
            아래 두 표는 위 변환기와 같은 데이터·같은 보간 함수로 계산한 값이라 화면 결과와 정확히 일치합니다. 인장강도가 &lsquo;—&rsquo;인 칸은 ISO 18265 표 A.1의 수록 범위(HV 80~650) 밖입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <caption className="srOnly">HRC 기준 강철 경도 환산표</caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['HRC', 'HV', 'HB', '인장강도 (MPa)'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {HRC_TABLE.map((r, i) => (
                  <tr key={r.hrc} style={rowStyle(i)}>
                    <td style={tdKey}>{r.hrc}</td>
                    <td style={td}>{fmtHv(r.hv)}</td>
                    <td style={td}>{fmtHv(r.hb)}</td>
                    <td style={td}>{fmtTs(r.tensile)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="tableScroll" style={{ marginTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <caption className="srOnly">HRB 기준 강철 경도 환산표</caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['HRB', 'HV', 'HB', '인장강도 (MPa)'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {HRB_TABLE.map((r, i) => (
                  <tr key={r.hrb} style={rowStyle(i)}>
                    <td style={tdKey}>{r.hrb}</td>
                    <td style={td}>{fmtHv(r.hv)}</td>
                    <td style={td}>{fmtHv(r.hb)}</td>
                    <td style={td}>{fmtTs(r.tensile)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            HB 칸 중 650을 넘는 값(HRC 60 부근)은 초경 구 브리넬 시험의 적용 상한 밖이라 실측으로는 나오지 않는 참고값입니다. HRB 값은 ASTM E140 Table 2를 HV 기준으로 재보간한 것이라, 변환기에서 HRB로 환산하면 소수 첫째 자리까지 표시됩니다(예: HB 200 → HRB {fmtRb(EX_HB200.hrb)}).
          </p>
        </section>

        {/* 6. 흔한 실수 */}
        <section>
          <h2 className="g-h2">환산값을 쓸 때 흔한 실수</h2>
          <ul className="g-list">
            <li><strong>표면 경화 부품을 한 숫자로 보기</strong> — 침탄·질화·고주파 경화 부품은 표면과 심부 경도가 크게 다릅니다. HRC 150 kgf 압흔은 0.1 mm 안팎까지 들어가므로 얇은 경화층이면 심부의 영향을 받아 낮게 나옵니다. 경화층 평가는 단면을 잘라 깊이별 HV를 재는 것이 일반적입니다.</li>
            <li><strong>곡면·원통을 평면처럼 재기</strong> — 지름이 작은 봉이나 공구 자루는 압흔이 옆으로 흘러 값이 낮게 나오며, 로크웰 규격에는 원통 시편 보정값이 따로 있습니다. 가능하면 평면을 만들어 측정합니다.</li>
            <li><strong>탈탄층·녹·도금 위를 재기</strong> — 열처리 후 표면 탈탄층이나 도금층은 원소재보다 무르거나 단단합니다. 측정면을 연마해 원소재를 드러낸 뒤 잽니다.</li>
            <li><strong>환산값으로 합격 판정하기</strong> — 도면이 HRC 58~62를 요구하는데 HV로 재서 환산했다면 그 결과는 참고치입니다. 규격 판정은 지정된 스케일로 직접 측정한 값이 기준입니다.</li>
            <li><strong>비철금속·스테인리스·주철에 그대로 적용하기</strong> — 오스테나이트계 스테인리스(304 등), 알루미늄, 황동은 강철 표와 관계가 달라 이 환산을 쓰면 안 됩니다. 주철(회주철·구상흑연주철)도 강철 표의 대상이 아닙니다. 흑연이 박힌 조직이라 같은 경도에서도 인장강도가 훨씬 낮아, HB 200 전후 회주철의 실제 인장강도는 약 200~250 MPa(KS D 4301 GC200·GC250 등급 수준)로 환산값({fmtTs(EX_HB200.tensile)} MPa)과 크게 다릅니다. 주철 강도는 재질 등급 규격이나 인장시험으로 확인하세요.</li>
          </ul>
          <p className="g-p">
            칼·공구를 비교하는 취미 용도라면 환산값으로 충분하지만, 납품 검사·파손 원인 분석·설계 강도 확인처럼 결과에 책임이 따르는 경우에는 해당 스케일 실측과 인장시험을 시험기관에 의뢰하는 것이 원칙입니다.
          </p>
        </section>

        {/* 7. 칼 강재 가이드 */}
        <section>
          <h2 className="g-h2">칼 강재(Steel) 경도 가이드</h2>
          <p className="g-p">
            칼 경도는 <strong>날 끝 유지력(edge retention)</strong>과 <strong>인성(toughness)</strong>의 트레이드오프를 결정합니다. 일반적으로 60 HRC를 기준으로 위는 &ldquo;오래 가지만 잘 부러짐&rdquo;, 아래는 &ldquo;빨리 무뎌지지만 잘 안 부러짐&rdquo;. 아래 수치는 제조사 공표 HRC 스펙 기준 참고표이며, 스테인리스 칼 강재의 스케일 간 환산 편차는 위 ASTM E140 단락의 주의를 참고하세요.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '54~58 HRC',  d: '일반 주방칼·외식업', desc: '자주 갈아 쓰는 용도. 갈기 쉽고 내충격 좋음. Wüsthof·Henckels 등 독일계 다수.', c: 'var(--success)' },
              { t: '58~61 HRC',  d: '미들~프리미엄 EDC',  desc: 'VG-10·154CM·AUS-10·CPM-S30V·S35VN. EDC 폴딩·일본 주방칼의 표준대.', c: 'var(--cat-health)' },
              { t: '61~64 HRC',  d: '하이엔드 폴딩',      desc: 'M390·ELMAX·MagnaCut 상단 열처리. 날 유지력 ↑ 충격에 약함.', c: 'var(--warning)' },
              { t: '64~68 HRC',  d: '초고경도·특수강',     desc: 'ZDP-189·K390 등. 갈기 어렵고 잘 부서짐. 정밀 작업용.', c: 'var(--danger)' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderLeft: `3px solid ${g.c}`, borderRadius: 'var(--radius-s)', padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px', fontFamily: 'var(--font-sans)' }}>{g.t}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px' }}>{g.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 9. 함께 쓰면 좋은 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/unit/converter',     icon: '🔄', name: '단위 변환기',          desc: '길이·무게·부피 일반 단위' },
              { href: '/tools/interior/screw',     icon: '🔩', name: '나사·피스 가이드',     desc: '나사 규격·앵커 매칭' },
              { href: '/tools/interior/wire',      icon: '⚡', name: '전선 굵기 계산기',     desc: 'sq·AWG 변환 + 전류' },
              { href: '/tools/interior/pipe',      icon: '🔧', name: '배관 굵기 계산기',     desc: '관경·유량·압력손실' },
              { href: '/tools/interior/rebar',     icon: '🏗️', name: '철근 배근 계산기',    desc: '철근 사양·이음' },
              { href: '/tools/unit/viscosity',    icon: '🛢️', name: '점도 변환기',          desc: 'cP·cSt + 엔진오일 등급' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center', color: 'inherit' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
