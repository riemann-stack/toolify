/* 상황별 가이드 — 사진 촬영. 화각·프레임 폭·손떨림 셔터는 화각 계산기(fovUtils)·노출 계산기(exposureUtils)와 같은 식으로 빌드 시 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { aov, equivAperture, frameSize, getSensor } from '@/app/tools/art/fov/fovUtils'
import { apertureStops, calcEV, handheldCheck } from '@/app/tools/art/exposure/exposureUtils'
import { GuideSources, num, type CollectionGuide } from './shared'

const FOCALS = [24, 35, 50, 85]
/** 인물·실내 촬영에서 흔한 거리(m) */
const DIST_M = 3
const PHI = (1 + Math.sqrt(5)) / 2

function Body() {
  const ff = getSensor('ff')
  const apsc = getSensor('apsc15')
  const rows = FOCALS.map((f) => ({
    f,
    aovFf: aov(ff.width, f),
    widthFf: frameSize(DIST_M, ff.width, f),
    shutterFf: handheldCheck(1 / 60, f, ff.cropFactor).requiredShutter,
    shutterApsc: handheldCheck(1 / 60, f, apsc.cropFactor).requiredShutter,
  }))
  const sunny16 = calcEV(16, 1 / 100, 100)
  const oneStop = apertureStops(2.8, 4)
  const goldenLine = 1 / (PHI * PHI)

  return (
    <>
      <h2>왜 노출·화각을 먼저, 구도·색을 나중에 보는가</h2>
      <p>
        촬영 뒤에 고칠 수 있는 것과 고칠 수 없는 것을 나눠 보면 순서가 정해집니다. 하얗게 날아간 하늘, 높은 ISO의 노이즈, 흔들린 셔터, 너무 좁거나 넓은 화각은 보정으로 되살리기 어렵습니다.
        반면 수평·자르기·색은 촬영 뒤에도 손볼 여지가 있습니다. 그래서 현장에서는 <Link href="/tools/art/fov">화각 계산기</Link>로 렌즈와 서 있을 위치를 정하고, <Link href="/tools/art/exposure">노출 계산기</Link>로
        조리개·셔터·ISO의 균형을 맞춘 뒤, 편집 단계에서 <Link href="/tools/art/golden-ratio">황금비</Link>와 <Link href="/tools/art/color">색상 코드</Link>를 씁니다.
      </p>
      <p>
        노출의 단위는 &lsquo;스톱&rsquo;입니다. 한 스톱은 빛의 양이 두 배 또는 절반이 되는 차이이고, 조리개 f/2.8에서 f/4로 바꾸면 약 {num(oneStop, 0)}스톱 어두워집니다. 오래된 경험칙인
        &lsquo;써니 16&rsquo;(맑은 날 f/16, 셔터 1/ISO)은 ISO 100에서 약 EV {num(sunny16, 1)}에 해당합니다. 맑은 날 야외 노출이 이 근처라는 것을 알면 카메라 측광이 이상할 때 바로 알아챌 수 있습니다.
      </p>

      <h2>초점거리별로 확인할 숫자</h2>
      <DataFigure n={1} title={`초점거리별 화각과 ${DIST_M}m 거리의 프레임 폭`} unit="풀프레임 기준" source={<>계산: 화각 = 2·atan(센서 폭 ÷ 2f), 손떨림 셔터 = 1 ÷ (초점거리 × 크롭) — 화각·노출 계산기와 같은 식</>}>
        <table>
          <thead>
            <tr>
              <th scope="col" className="r">초점거리</th><th scope="col" className="r">가로 화각</th><th scope="col" className="r">{DIST_M}m 폭</th>
              <th scope="col" className="r">손떨림 한계(FF)</th><th scope="col" className="r">같은 렌즈 APS-C</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.f}>
                <td className="r">{r.f}mm</td>
                <td className="r">{num(r.aovFf, 1)}°</td>
                <td className="r">{num(r.widthFf, 1)}m</td>
                <td className="r">1/{Math.round(1 / r.shutterFf)}초</td>
                <td className="r">1/{Math.round(1 / r.shutterApsc)}초</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        실내에서 {DIST_M}m 떨어진 사람을 전신으로 담으려면 세로 방향 여유까지 생각해야 하므로 85mm는 대개 너무 좁고, 35~50mm가 무난합니다. 좁은 방에서 단체 사진을 찍을 때 24mm가 필요한 이유도
        표의 프레임 폭에서 보입니다. 손떨림 한계는 손떨림 보정이 없는 조건의 경험칙이라, 보정 기능이 있는 바디·렌즈라면 이보다 느린 셔터도 가능합니다.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>크롭 팩터를 노출에도 곱하기.</strong> APS-C({apsc.cropFactor}배)에서 f/2.8 렌즈는 화각과 심도만 풀프레임 f/{num(equivAperture(2.8, apsc.cropFactor), 1)}처럼 보일 뿐, 노출(밝기)은 그대로 f/2.8입니다. 셔터·ISO 계산에 크롭을 곱하면 안 됩니다.</li>
        <li><strong>삼분할선과 황금비선을 같은 것으로 보기.</strong> 삼분할선은 가장자리에서 33.3% 지점, 황금비 분할선은 약 {num(goldenLine * 100, 1)}% 지점이라 황금비가 화면 중앙에 조금 더 가깝습니다. 어느 쪽이 맞는지는 피사체와 여백의 관계로 고르면 됩니다.</li>
        <li><strong>화면의 색을 인쇄에서도 기대하기.</strong> HEX·RGB는 모니터(sRGB) 기준이고, 공식으로 바꾼 CMYK 값은 근사치입니다. 인쇄물은 인쇄소가 쓰는 색 프로파일로 교정본을 받아 확인하세요.</li>
        <li><strong>ISO를 무조건 낮추기.</strong> 셔터가 손떨림 한계보다 느려질 만큼 ISO를 낮추면 노이즈 대신 흔들림을 얻습니다. 흔들림은 보정으로 되살리기 더 어렵습니다.</li>
      </ul>

      <Callout tone="note" title="계산기 밖의 판단">
        인물·상품 촬영처럼 결과물을 납품하는 작업이라면 조명 장비와 색 관리(모니터 캘리브레이션)가 계산보다 큰 차이를 만듭니다. 인쇄·출판용 색은 인쇄소 교정 절차를 따르고, 계산기 결과는 현장에서 출발점을 잡는 용도로 쓰세요.
      </Callout>

      <GuideSources
        items={[
          { label: 'ISO 517 — 조리개 f수 표준 계열', href: 'https://www.iso.org/standard/50089.html' },
          { label: 'CIPA DC-008 (Exif 2.3) — 35mm 환산 초점거리', href: 'https://www.cipa.jp/std/documents/e/DC-008-2012_E.pdf' },
          { label: 'W3C — CSS Color Module Level 4 (sRGB)', href: 'https://www.w3.org/TR/css-color-4/' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '사진 촬영, 셔터를 누르기 전의 숫자', Body }
export default guide
