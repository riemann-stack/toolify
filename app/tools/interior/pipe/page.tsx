import Link from 'next/link'
import PipeClient from './PipeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import {
  SIZE_META, MATERIALS, INSULATION_THICK, FLOW_GUIDES, getDim, calcFlow, fmt,
  type PipeSize, type Material,
} from './pipeUtils'

export const metadata = buildMetadata({
  path: '/tools/interior/pipe',
  title: '배관 규격 변환기 — A호칭·인치·DN 통합 + 6재질 외경/내경 비교',
  description: 'A호칭·인치·DN 통합 + 강관·PVC·PB·XL·동관·스테인리스 6재질 실제 OD/ID 비교 + 부속·연결법과 유량 계산.',
  keywords: ['배관 규격', '15A 몇 mm', 'A호칭 인치 변환', 'DN 호칭', '강관 외경', 'PVC VG1 VG2', 'PB XL 차이', '동관 K L M', '스테인리스 배관', '배관 유량 계산'],
})

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const thR: React.CSSProperties = { ...th, textAlign: 'right' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', fontSize: 13 }
const tdNum: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const rowBorder: React.CSSProperties = { borderBottom: '1px solid var(--border)' }

/* 가이드 표는 손으로 적지 않고 계산기와 같은 pipeUtils 데이터·함수로 빌드 시 만든다 */
const shortLabel = (id: Material) => MATERIALS.find((m) => m.id === id)!.label.split(' ')[0]
const mm = (v: number) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(2)))

/* ① 호칭 대응 + 강관·동관 실제 외경 */
const NAME_ROWS = SIZE_META.map((m) => ({ ...m, steel: getDim('steel', m.a).od, copper: getDim('copper', m.a).od }))

/* ② 재질별 외경/내경 — 15A·20A·25A (각 재질 기본 등급: 강관 SPP·PVC VG1·동관 L) */
const CMP_SIZES: PipeSize[] = ['15A', '20A', '25A']
const MAT_IDS: Material[] = ['steel', 'pvc', 'pb', 'xl', 'copper', 'sts']

/* ③ 20A 등급별 두께·내경 */
const GRADE_ROWS: { name: string; mat: Material; grade?: string }[] = [
  { name: '강관 SPP (백관·흑관)', mat: 'steel', grade: 'sgp_white' },
  { name: '강관 SPPS Sch 40', mat: 'steel', grade: 'sch40' },
  { name: '강관 SPPS Sch 80', mat: 'steel', grade: 'sch80' },
  { name: 'PVC VG1', mat: 'pvc', grade: 'vg1' },
  { name: 'PVC VG2', mat: 'pvc', grade: 'vg2' },
  { name: '동관 K', mat: 'copper', grade: 'k' },
  { name: '동관 L', mat: 'copper', grade: 'l' },
  { name: '동관 M', mat: 'copper', grade: 'm' },
]

/* ④ 유량 — 급수 유속 2.0 m/s(계산기 급수 권장 1.5~2.5 m/s의 중간) */
const V = 2.0
const FLOW_SIZES: PipeSize[] = ['15A', '20A', '25A', '32A']
const FLOW_MATS: Material[] = ['steel', 'pvc', 'pb', 'xl', 'copper']
const SUPPLY = FLOW_GUIDES.find((g) => g.use === '급수')!
const EX_ID = getDim('pb', '20A').id
const EX_FLOW = calcFlow(EX_ID, V)
const XL20_ID = getDim('xl', '20A').id
const PB20 = calcFlow(EX_ID, V).lpm
const ST20 = calcFlow(getDim('steel', '20A').id, V).lpm

/* ⑤ 단열재 두께 — 같은 두께끼리 묶기 */
const INS_GROUPS = Object.entries(INSULATION_THICK).reduce<{ t: number; sizes: string[] }[]>((acc, [a, t]) => {
  const last = acc[acc.length - 1]
  if (last && last.t === t) last.sizes.push(a)
  else acc.push({ t, sizes: [a] })
  return acc
}, [])

const FAQ_LD = [
  { q: '15A는 몇 mm인가요?',
    a: '15A는 <strong>호칭 이름</strong>이며 실제 외경은 재질에 따라 다릅니다. 계산기 기준으로 강관(SPP) 21.7mm · PVC 22mm · PB 17mm · XL 17mm · 동관 15.88mm · STS 19.05mm입니다. 내경(ID)은 두께 등급에 따라 또 달라집니다. 호칭이 같다고 부속이 호환되지 않으니 재질과 외경을 함께 확인하세요.' },
  { q: 'A호칭과 인치는 어떻게 변환하나요?',
    a: '규격이 미리 <strong>짝지어 놓은 호칭</strong>입니다: 15A=1/2&quot;, 20A=3/4&quot;, 25A=1&quot;, 32A=1¼&quot;, 40A=1½&quot;, 50A=2&quot;, 100A=4&quot;. 어림수로 &lsquo;A÷25 ≈ 인치&rsquo;를 쓰기도 하지만 작은 사이즈에서는 어긋나므로(15A → 0.6 vs 실제 1/2&quot; = 0.5) 계산기나 본문 대응표를 쓰세요. 인치 호칭도 실제 외경이 아니라서, 1/2&quot; 강관의 외경은 12.7mm가 아니라 21.7mm입니다.' },
  { q: 'DN은 뭔가요?',
    a: 'DN(Diameter Nominal)은 <strong>ISO 6708에 정의된 국제 호칭</strong>으로, 숫자는 mm 정수에 가깝지만 실제 치수가 아닌 &quot;크기 등급&quot;입니다(DN15·DN20·DN25…). 유럽 제품 사양서나 국내 설계 도면·시방서에서 A호칭과 병기하는 경우가 많습니다. 15A = 1/2&quot; = DN15는 모두 같은 크기 등급을 가리킵니다.' },
  { q: '백관과 흑관 차이가 뭔가요?',
    a: '같은 배관용 탄소 강관(KS D 3507 SPP)인데 <strong>아연도금 유무</strong>가 다릅니다. 백관(아연도금)은 도금으로 녹을 늦춰 소화(스프링클러)·일반 배관에 쓰고, 흑관은 도금이 없어 값이 싸지만 녹슬기 쉬워 난방·증기 배관처럼 물이 밀폐 순환하는 곳이나 도장 후 사용합니다. 참고로 아연도강관은 <strong>1994년 4월부터 건물 급수관(마시는 물)으로 쓸 수 없어</strong>, 급수는 동관·스테인리스·수지관을 씁니다. 그 이전에 지은 건물에서 녹물이 나올 때 흔한 원인이 이 아연도강관 급수관입니다. 외경·두께는 같아 계산기 결과도 같습니다.' },
  { q: 'PVC VG1과 VG2 차이는?',
    a: '<strong>관 두께</strong>가 다릅니다. 외경은 같고 VG1이 두꺼워 수압이 걸리는 급수 등 압력 배관에, 얇은 VG2는 배수·통기·우수처럼 압력이 걸리지 않는 배관에 씁니다. 계산기 기준 20A는 VG1 두께 2.5mm, VG2 2.0mm입니다. 마시는 물(상수도)이 지나는 배관은 수도법에 따른 위생안전기준(KC) 인증 제품을 써야 하고, 추위·충격이 걱정되는 노출 구간은 내충격(HI) 제품을 고릅니다.' },
  { q: 'PB와 XL 어느 게 좋은가요?',
    a: '용도가 다릅니다. <strong>PB(폴리부틸렌)</strong>는 유연하고 내열·내압이 좋아 세대 내 급수·급탕에 많이 쓰이고, <strong>XL(가교폴리에틸렌)</strong>은 바닥난방 코일과 온수 분배기 배관에 주로 쓰입니다. PB는 그립링·인서트·슬리브식 전용 부속, XL은 황동 인서트·푸시핏 부속으로 연결합니다. 같은 20A라도 XL의 내경(계산기 기준 14.4mm)이 PB(17.4mm)보다 작아 급수용으로 바꿔 쓰면 유량이 줄어듭니다.' },
  { q: '동관 K·L·M 차이는?',
    a: '<strong>관 두께(=견디는 압력)</strong>가 다릅니다. K가 가장 두껍고 L이 중간, M이 가장 얇습니다. <strong>외경은 셋 다 같아</strong> 같은 부속을 쓰지만 내경이 달라집니다(20A 기준 K 18.92 · L 19.94 · M 20.60mm). 고압·매설이나 의료가스는 K·L, 일반 급수·급탕은 L·M이 흔합니다. 가스·냉매 배관은 해당 설비 시방서가 정한 두께를 따르세요.' },
  { q: '가스배관은 어느 자재를 쓰나요?',
    a: '국내 도시가스·LPG 배관은 강관(백관·SPPS), 동관, PE 피복 강관, 매설용 PE관 등을 설계에 맞춰 씁니다. 자재 선택보다 중요한 것은 <strong>시공 자격</strong>입니다. 가스시설 공사는 관련 법령에 따라 등록한 시공업체·자격자만 할 수 있고, 일반인의 자가시공은 도시가스사업법·「액화석유가스의 안전관리 및 사업법」 위반이 될 수 있습니다. 반드시 도시가스사 또는 등록 시공업체에 의뢰하세요.' },
  { q: '동파 방지 단열재 두께는 얼마나?',
    a: '계산기는 <strong>15·20A=10mm, 25·32A=15mm, 40A=20mm, 50~80A=25mm, 100·125A=30mm, 150A=40mm</strong>를 일반치로 보여 줍니다. 한파가 잦은 지역·옥외 노출·북향 발코니는 더 두껍게 감거나 동파 방지 열선을 함께 씁니다. 두께보다 흔한 실패 원인은 <strong>이음부·밸브·계량기 주변의 빈틈</strong>이므로 테이프로 끝까지 감싸고, 설계 도면에 두께가 정해져 있으면 그 값을 따르세요.' },
  { q: '같은 15A인데 부속이 안 맞아요. 왜죠?',
    a: '호칭은 같아도 <strong>실제 외경(OD)이 재질별로 다르기 때문</strong>입니다. 예: 강관 15A(21.7mm)와 PB 15A(17mm)는 외경이 4.7mm 차이 나서 부속이 맞지 않습니다. 다른 재질끼리는 <strong>이종 어댑터(이종조인트)</strong>로 연결하세요. 같은 재질·호칭이라도 제조사마다 부속 규격이 다른 경우가 있어(특히 PB), 가능하면 한 브랜드로 통일하는 것이 안전합니다.' },
]

export default function PipePage() {
  return (
    <ToolPage width={880} slug="/tools/interior/pipe">
      <h1 className="tp-h1">
        <ToolIconBadge catId="interior" />배관 규격 변환기
      </h1>
      <p className="tp-lead">
        A호칭·인치·DN 통합 + <strong style={{ color: 'var(--text)' }}>강관·PVC·PB·XL·동관·STS</strong> 6재질 실제 OD/ID와 유량.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="호칭 KS(A)·ASME B36.10(인치)·ISO 6708(DN) · 강관 KS D 3507(SPP, JIS G 3452 SGP와 같은 치수)·KS D 3562(SPPS, JIS G 3454 STPG와 같은 치수) Sch 40·80 · 동관 KS D 5301(ASTM B88 K·L·M 두께) · PVC·PB·XL·STS는 표준 일반치 · 유량 Q = π/4 × 내경² × 유속"
        sources={[
          { label: 'e나라표준인증 — KS D 3507 배관용 탄소 강관', href: 'https://www.standard.go.kr/KSCI/standardIntro/getStandardSearchView.do?menuId=503&ksNo=KSD3507&tmprKsNo=KSD3507' },
          { label: 'e나라표준인증 — KS D 5301 이음매 없는 구리 및 구리합금 관', href: 'https://www.standard.go.kr/KSCI/standardIntro/getStandardSearchView.do?menuId=503&ksNo=KSD5301&tmprKsNo=KSD5301' },
          { label: '국가법령정보센터 — 수도법(수도용 자재 위생안전기준)', href: 'https://www.law.go.kr/법령/수도법' },
          { label: '국가법령정보센터 — 도시가스사업법', href: 'https://www.law.go.kr/법령/도시가스사업법' },
        ]}
      />

      <PipeClient />

      <Callout tone="note" title="데이터 기준 · 참고 표준">
        <p>
          표시 치수는 KS·ASME·ISO <strong>표준 일반치 참고용</strong>입니다. 호칭 체계는 A호칭(KS) · 인치 ASME B36.10 · DN ISO 6708, 재질·두께는 강관 KS D 3507(SPP, JIS G 3452 SGP와 같은 치수)·KS D 3562(SPPS, JIS G 3454 STPG와 같은 치수) Sch 40·80 · PVC KS M 3404 · PB KS M 3363 · XL KS M 3357 · 동관 KS D 5301(ASTM B88 K·L·M 두께) · STS 위생관 일반치를 따릅니다.
        </p>
        <p>
          실제 제품의 외경·두께·압력 등급은 <strong>제조사 도면·시방서가 우선</strong>합니다. 특히 STS·프레스 시스템은 제품별 외경이 달라 도면 확인이 필수입니다.
        </p>
      </Callout>

      <GuideDivider />

      {/* 1. 사용법 */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <ol className="g-list">
        <li><strong>재질 선택</strong> — 강관 / PVC / PB / XL / 동관 / 스테인리스</li>
        <li><strong>호칭 선택</strong> — 15A ~ 150A (인치·DN 동시 표시)</li>
        <li><strong>등급 선택</strong> — 백관/흑관·Sch 40/80, VG1/VG2, 동관 K/L/M</li>
        <li><strong>결과 확인</strong> — 외경·내경·두께와 연결 방식, 단열재 두께, 최소 곡률, 유속별 유량</li>
      </ol>
      <p className="g-note">
        재질 비교 탭에서는 같은 호칭의 6재질 외경을 한 화면에서 비교할 수 있어, 이종 재질 부속이 왜 안 맞는지 바로 보입니다.
      </p>

      {/* 2. 호칭 체계 */}
      <h2 className="g-h2">A호칭·인치·DN, 어떻게 다른가요?</h2>
      <p className="g-p">
        세 가지는 모두 <strong>같은 크기 등급을 부르는 다른 이름</strong>이고, 어느 것도 실제 외경이 아닙니다. 한국·일본 현장은 mm 계열 숫자에 A를 붙인 A호칭(15A·20A), 미국 계열은 인치 분수(1/2&quot;·3/4&quot;, B호칭), 유럽·국제 규격은 ISO 6708의 DN(DN15·DN20)을 씁니다.
      </p>
      <p className="g-p">
        인치 호칭이 실제 치수와 어긋나는 이유는 역사적입니다. 초기 강관은 벽이 두꺼워 &lsquo;1/2인치&rsquo;가 대략 안지름을 뜻했는데, 이후 두께 등급(Schedule)이 여럿 생기면서 <strong>외경을 고정하고 두께만 바꾸는</strong> 방식으로 굳어졌습니다. 그래서 15A 강관은 Sch 40이든 80이든 외경이 21.7mm로 같고, 부속도 같은 것을 씁니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>A호칭</th>
              <th scope="col" style={th}>인치</th>
              <th scope="col" style={th}>DN</th>
              <th scope="col" style={thR}>강관 외경</th>
              <th scope="col" style={thR}>동관 외경</th>
            </tr>
          </thead>
          <tbody>
            {NAME_ROWS.map((r) => (
              <tr key={r.a} style={rowBorder}>
                <td style={{ ...td, fontWeight: 700 }}>{r.a}</td>
                <td style={td}>{r.inch}</td>
                <td style={td}>{r.dn}</td>
                <td style={{ ...tdNum, color: 'var(--accent-ink)', fontWeight: 700 }}>{mm(r.steel)} mm</td>
                <td style={tdNum}>{mm(r.copper)} mm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">강관 = KS D 3507 SPP(JIS G 3452 SGP와 같은 치수), 동관 = KS D 5301(ASTM B88) 외경 — 계산기 데이터 그대로.</p>

      {/* 3. 재질별 외경 */}
      <h2 className="g-h2">같은 호칭인데 외경이 왜 다른가요?</h2>
      <p className="g-p">
        호칭은 &lsquo;그 정도 크기&rsquo;를 묶은 분류일 뿐이라, 실제 외경은 재질마다 자기 규격을 따릅니다. 같은 15A라도 가장 가는 동관과 가장 굵은 PVC의 외경 차이가 6mm가 넘습니다. 바깥지름이 다르면 부속이 안 맞고, 안지름이 다르면 같은 수압에서 흐르는 양이 달라집니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>재질 (기본 등급)</th>
              {CMP_SIZES.map((s) => <th key={s} scope="col" style={thR}>{s} 외경 / 내경</th>)}
            </tr>
          </thead>
          <tbody>
            {MAT_IDS.map((id) => (
              <tr key={id} style={rowBorder}>
                <td style={{ ...td, fontWeight: 700, whiteSpace: 'nowrap' }}>{shortLabel(id)}</td>
                {CMP_SIZES.map((s) => {
                  const d = getDim(id, s)
                  return <td key={s} style={tdNum}><strong>{mm(d.od)}</strong> / {mm(d.id)}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">단위 mm. 강관 SPP · PVC VG1 · 동관 L 기준. PB·XL·STS는 제조사별 편차가 있는 일반치입니다.</p>

      {/* 4. 등급 */}
      <h2 className="g-h2">백관·흑관·VG1·VG2·K/L/M 등급 의미</h2>
      <p className="g-p">
        등급은 대부분 <strong>외경은 그대로 두고 두께를 바꾼 것</strong>입니다. 두꺼울수록 높은 압력과 외부 충격을 견디지만 안지름이 줄어 유량이 조금 줄고 값이 오릅니다. 20A로 비교하면 다음과 같습니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>20A 등급</th>
              <th scope="col" style={thR}>외경</th>
              <th scope="col" style={thR}>두께</th>
              <th scope="col" style={thR}>내경</th>
            </tr>
          </thead>
          <tbody>
            {GRADE_ROWS.map((r) => {
              const d = getDim(r.mat, '20A', r.grade)
              return (
                <tr key={r.name} style={rowBorder}>
                  <td style={{ ...td, fontWeight: 600 }}>{r.name}</td>
                  <td style={tdNum}>{mm(d.od)}</td>
                  <td style={{ ...tdNum, color: 'var(--accent-ink)', fontWeight: 700 }}>{mm(d.t)}</td>
                  <td style={tdNum}>{mm(d.id)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <ul className="g-list">
        <li><strong>백관·흑관</strong> — 같은 SPP 강관에 아연도금을 했는지 여부. 백관은 소화·일반 배관(1994년부터 급수관 사용 금지), 흑관은 난방·증기처럼 밀폐 순환 배관.</li>
        <li><strong>Sch 40·80</strong> — 압력 배관용(SPPS)의 두께 번호. 숫자가 클수록 두껍습니다.</li>
        <li><strong>VG1·VG2</strong> — PVC 일반관의 두께 구분. VG1은 압력 배관, VG2는 배수·통기 같은 무압 배관.</li>
        <li><strong>동관 K·L·M</strong> — ASTM B88 두께 구분. K &gt; L &gt; M 순으로 두껍고 외경은 같습니다.</li>
      </ul>

      {/* 5. 유량 */}
      <h2 className="g-h2">유량은 내경으로 계산합니다</h2>
      <p className="g-p">
        계산기의 유량은 <strong>Q = π/4 × 내경² × 유속</strong>입니다. 예를 들어 PB 20A(내경 {mm(EX_ID)}mm)에 물이 {V.toFixed(1)} m/s로 흐르면 단면적 π/4 × ({mm(EX_ID)}mm)² ≈ {(Math.PI / 4 * (EX_ID / 10) ** 2).toFixed(2)}cm²에 속도를 곱해 <strong>분당 약 {fmt(EX_FLOW.lpm, 1)}L</strong>(시간당 {fmt(EX_FLOW.m3h, 2)}㎥)가 됩니다. 내경의 제곱에 비례하므로 지름이 조금만 줄어도 유량은 크게 줄어듭니다.
      </p>
      <p className="g-p">
        급수 배관은 계산기 기준 유속 {SUPPLY.min}~{SUPPLY.max} m/s를 권장 범위로 둡니다. 더 빠르면 흐름 소음과 수격(밸브를 급히 잠글 때의 충격)이 커지고, 너무 느리면 필요 이상으로 굵은 관을 쓰게 됩니다. 아래 표는 유속 {V.toFixed(1)} m/s일 때 재질·호칭별 유량입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>호칭</th>
              {FLOW_MATS.map((m) => <th key={m} scope="col" style={thR}>{shortLabel(m)}</th>)}
            </tr>
          </thead>
          <tbody>
            {FLOW_SIZES.map((s) => (
              <tr key={s} style={rowBorder}>
                <td style={{ ...td, fontWeight: 700 }}>{s}</td>
                {FLOW_MATS.map((m) => (
                  <td key={m} style={tdNum}>{fmt(calcFlow(getDim(m, s).id, V).lpm, 1)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">단위 L/min · 유속 {V.toFixed(1)} m/s · 기본 등급(강관 SPP, PVC VG1, 동관 L) 내경 기준. 실제 유량은 수압·배관 길이·부속 손실에 따라 달라집니다.</p>
      <Callout tone="tip" title="리모델링 때 호칭만 맞추면 물줄기가 약해질 수 있습니다">
        <p>
          같은 20A라도 계산기 기준 내경이 강관 {mm(getDim('steel', '20A').id)}mm, PB {mm(EX_ID)}mm라서 같은 유속이면 유량이 {fmt(ST20, 1)} 대 {fmt(PB20, 1)} L/min으로 PB 쪽이 약 {Math.round((PB20 / ST20) * 100)}%에 그칩니다(XL 20A는 내경 {mm(XL20_ID)}mm로 더 작음). 오래된 강관을 수지관으로 바꿀 때는 호칭이 아니라 <strong>내경</strong>을 비교해 한 단계 굵은 호칭이 필요한지 확인하세요.
        </p>
      </Callout>

      {/* 6. 단열재 */}
      <h2 className="g-h2">단열재 두께·동파 방지 가이드</h2>
      <p className="g-p">
        외벽 쪽·발코니·세탁실·옥상처럼 찬 공기에 닿는 배관은 동파와 결로를 막기 위해 보온재(발포 폴리에틸렌·고무발포 등)를 감습니다. 관이 굵을수록 표면적이 커서 열을 많이 잃으므로 두꺼운 보온재가 필요합니다. 계산기가 보여 주는 일반치는 다음과 같습니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 320 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>호칭</th>
              <th scope="col" style={thR}>권장 보온재 두께</th>
            </tr>
          </thead>
          <tbody>
            {INS_GROUPS.map((g) => (
              <tr key={g.t} style={rowBorder}>
                <td style={td}>{g.sizes.join(' · ')}</td>
                <td style={{ ...tdNum, color: 'var(--accent-ink)', fontWeight: 700 }}>{g.t} mm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p">
        보온재는 두께보다 <strong>빈틈</strong>에서 실패합니다. 엘보·티·밸브·계량기 주변처럼 모양이 복잡한 곳이 먼저 얼기 때문에, 이음부는 보온재를 잘라 맞춘 뒤 테이프로 끝까지 감쌉니다. 한파가 잦은 지역이나 바람이 드는 노출 구간은 열선을 함께 쓰고, 설계 도면에 보온 두께가 정해져 있으면 그 값을 따릅니다.
      </p>

      {/* 7. 흔한 실수 */}
      <h2 className="g-h2">자주 하는 실수</h2>
      <ul className="g-list">
        <li><strong>호칭 = 외경으로 착각</strong> — 부속·클램프·보온재를 살 때는 호칭이 아니라 재질과 실제 외경으로 고릅니다.</li>
        <li><strong>테이퍼 나사와 평행 나사 혼동</strong> — 강관 나사 이음(PT)은 조일수록 물리는 테이퍼 나사(ISO 7-1 계열)라 나사부에서 밀봉되고, 수전·기기 연결부에 흔한 평행 나사(PF, ISO 228-1 계열)는 패킹으로 밀봉합니다. 모양이 비슷해도 섞어 쓰면 샙니다.</li>
        <li><strong>PB 부속 브랜드 혼용</strong> — 같은 PB 15A라도 제조사마다 그립링·슬리브 치수가 달라 빠짐 사고가 날 수 있습니다.</li>
        <li><strong>최소 곡률보다 급하게 굽히기</strong> — 수지관·연동관을 무리하게 꺾으면 단면이 찌그러져 유량이 줄고 그 자리부터 갈라집니다. 계산기의 최소 곡률 반경 안쪽은 엘보를 쓰세요.</li>
      </ul>

      <Faq items={FAQ_LD} />

      {/* 인테리어 도구 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { href: '/tools/interior/screw', icon: '🔩', name: '나사 규격 계산기', desc: 'PT 나사·관통홀·인치↔mm' },
          { href: '/tools/interior/screw?tab=bolt', icon: '🔧', name: '볼트·너트 스패너 사이즈', desc: 'ISO/JIS · 알렌·와셔·토크' },
          { href: '/tools/interior/molding', icon: '📏', name: '몰딩 계산기', desc: '천장·걸레받이·문틀 둘레' },
          { href: '/tools/interior/wire', icon: '⚡', name: '전선 굵기 계산기', desc: '허용전류·차단기·전압강하' },
        ].map((t) => (
          <Link key={t.href} href={t.href} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </ToolPage>
  )
}
