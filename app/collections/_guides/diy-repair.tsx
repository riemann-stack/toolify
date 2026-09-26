/* 상황별 가이드 — 셀프 수리·DIY. 볼트 규격은 boltWrenchUtils(ISO·DIN 대변 거리, 거친나사 피치, 관통홀), 전선·차단기는 wireUtils
   (허용전류 IEC 60364-5-52 방법 C, 부하 × 1.25, 전압강하 한도), 배관 호칭은 pipeUtils, 철근 중량은 rebarUtils(KS D 3504)로 빌드 시 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { BOLT_DATA } from '@/app/tools/interior/screw/boltWrenchUtils'
import { calcCurrent, DROP_LIMIT, ENV_FACTOR, LOAD_PF, recommendWireSizeWithDrop } from '@/app/tools/interior/wire/wireUtils'
import { getSizeMeta } from '@/app/tools/interior/pipe/pipeUtils'
import { perPiece, REBAR_DATA } from '@/app/tools/interior/rebar/rebarUtils'
import { GuideSources, num, type CollectionGuide } from './shared'

const BOLTS = ['M6', 'M8', 'M10', 'M12'] as const
const LOADS = [2000, 3500]
const RUN_M = 20

function Body() {
  const bolts = BOLTS.map((m) => {
    const d = BOLT_DATA[m]
    const nominal = Number(m.slice(1))
    return { m, pitch: d.pitchCoarse, tap: nominal - d.pitchCoarse, hole: d.clearanceHole, iso: d.spannerISO, din: d.spannerDIN, allen: d.allenSocket }
  })
  const split = bolts.filter((b) => b.iso !== b.din)
  const wires = LOADS.map((w) => {
    const amps = calcCurrent(w, 220, 'single', LOAD_PF.heater.pf)
    return { w, amps, rec: recommendWireSizeWithDrop(amps, 220, 'single', RUN_M, 'hiv', 'ceil', 30, 'home') }
  })
  const p15 = getSizeMeta('15A')
  const p20 = getSizeMeta('20A')
  const d13 = REBAR_DATA.D13

  return (
    <>
      <h2>왜 규격을 먼저 확인하는가</h2>
      <p>
        DIY에서 가장 흔한 헛걸음은 공구나 부품을 사 왔는데 규격이 맞지 않는 경우입니다. 나사·배관·전선은 모두 &lsquo;호칭&rsquo;과 실제 치수가 달라서, 이름만 보고 사면 한 치수씩 어긋나기 쉽습니다.
        그래서 이 가이드는 체결(<Link href="/tools/interior/screw">나사·볼트</Link>, <Link href="/tools/unit/hardness">경도</Link>) → 설비(<Link href="/tools/interior/pipe">배관</Link>, <Link href="/tools/interior/wire">전선</Link>) →
        자재 물량(<Link href="/tools/interior/molding">몰딩</Link>, <Link href="/tools/interior/roof">지붕</Link>, <Link href="/tools/interior/rebar">철근</Link>) 순서로 짰습니다. 작은 규격을 먼저 맞춰야 설비 작업이 막히지 않고,
        물량 산출은 모든 치수가 정해진 뒤에 해야 두 번 주문하지 않습니다.
      </p>

      <h2>볼트 하나에 필요한 숫자</h2>
      <DataFigure n={1} title="미터 보통나사 볼트의 공구·구멍 치수" unit="단위: mm" source={<>자료: ISO 4017·구 DIN 933(육각 대변), ISO 4762(소켓 렌치), KS B 1007(관통홀) — 나사·볼트 계산기와 같은 데이터. 탭 드릴 = 호칭 지름 − 피치</>}>
        <table>
          <thead>
            <tr><th scope="col">호칭</th><th scope="col" className="r">피치</th><th scope="col" className="r">탭 드릴</th><th scope="col" className="r">관통홀</th><th scope="col" className="r">스패너 ISO/DIN</th></tr>
          </thead>
          <tbody>
            {bolts.map((b) => (
              <tr key={b.m}>
                <td>{b.m}</td>
                <td className="r">{b.pitch}</td>
                <td className="r">{num(b.tap, 2)}</td>
                <td className="r">{b.hole}</td>
                <td className="r">{b.iso === b.din ? b.iso : `${b.iso} / ${b.din}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        {split.map((b) => b.m).join('·')}는 현행 ISO 규격과 옛 DIN 규격의 머리 크기가 달라 스패너가 {split.map((b) => `${b.iso}/${b.din}mm`).join(', ')}로 갈립니다. 시중에는 두 규격 볼트가 섞여 있으므로 공구는 두 치수를 모두 준비하는 편이 낫습니다.
        탭 드릴 지름은 암나사를 낼 구멍 크기이고, 관통홀은 볼트가 그냥 지나갈 구멍 크기라 둘을 혼동하면 나사가 헛돌거나 들어가지 않습니다.
      </p>

      <h2>전선은 부하와 거리로 고른다</h2>
      <p>
        <Link href="/tools/interior/wire">전선 굵기 계산기</Link>는 부하 전류의 1.25배를 견디는 굵기, 그 굵기를 보호하는 차단기, 거리에 따른 전압강하를 함께 봅니다. 천장 매입(허용전류 × {ENV_FACTOR.ceil.factor})으로 {RUN_M}m를 끌어가는
        가정용 분기(전압강하 {DROP_LIMIT.home.pct}% 이내)라면 {wires.map((x) => `${num(x.w)}W 전열기(${num(x.amps, 1)}A)는 ${x.rec.finalSize}sq 전선에 ${x.rec.breaker}A 차단기`).join(', ')}가 계산됩니다.
        {wires[1] && wires[1].rec.ampacitySize !== wires[1].rec.finalSize ? ` 두 번째 경우 허용전류만 보면 ${wires[1].rec.ampacitySize}sq로 충분하지만, 거리 때문에 전압강하 기준을 맞추려면 한 단계 굵어집니다.` : ''}
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>배관 호칭을 실제 지름으로 알기.</strong> {p15.a}는 {p15.inch}, {p20.a}는 {p20.inch} 배관의 이름일 뿐 안지름·바깥지름은 재질마다 다릅니다. 이음쇠는 재질과 호칭을 함께 맞춰야 합니다.</li>
        <li><strong>전선만 굵게 바꾸고 차단기는 그대로 두기.</strong> 차단기 정격은 전선이 견디는 전류 이하여야 전선이 먼저 과열되지 않습니다. 가전을 늘릴 때는 두 값을 함께 확인하세요.</li>
        <li><strong>철근을 길이로만 주문하기.</strong> 철근은 무게로 거래되는 경우가 많습니다. {d13.size} 철근은 1m에 {d13.weightPerM}kg이라 8m 한 본이 약 {num(perPiece('D13', 8), 2)}kg입니다. 이음 겹침과 절단 손실까지 더해 주문하세요.</li>
        <li><strong>경도 단위를 섞어 비교하기.</strong> 공구 날의 HRC와 판재의 HV는 척도가 달라 숫자를 그대로 비교할 수 없습니다. <Link href="/tools/unit/hardness">경도 변환</Link>으로 같은 척도로 바꾼 뒤 비교하세요.</li>
      </ul>

      <Callout tone="warn" title="직접 하면 안 되는 작업">
        전기공사업법상 콘센트·스위치·소켓 교체 같은 경미한 작업을 넘어서는 배선 신설·분전반 작업은 등록된 전기공사업자가 해야 합니다. 가스 배관도 도시가스사·가스시설 시공업자의 영역입니다. 구조체(내력벽·철근)를
        건드리는 공사는 건축사·구조기술사 검토와 관할 관청 절차가 필요할 수 있습니다. 작업 전에는 반드시 해당 회로의 차단기를 내리고 검전기로 확인하세요.
      </Callout>

      <GuideSources
        items={[
          { label: '국가법령정보센터 — 전기공사업법 제3조·시행령 제5조(경미한 전기공사)', href: 'https://www.law.go.kr/법령/전기공사업법시행령' },
          { label: '국가법령정보센터 — 한국전기설비규정(KEC)', href: 'https://www.law.go.kr/행정규칙/한국전기설비규정' },
          { label: 'e나라표준인증 — KS D 3504(철근 콘크리트용 봉강)', href: 'https://standard.go.kr/KSCI/standardIntro/getStandardSearchView.do?ksNo=KSD3504' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '셀프 수리, 사러 가기 전에 맞출 규격', Body }
export default guide
