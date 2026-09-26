import Link from 'next/link'
import PrintResolutionClient from './PrintResolutionClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import { SIZE_MAP, MM_PER_INCH, fitFill, withBleed } from './printData'

export const metadata = buildMetadata({
  path: '/tools/art/print-resolution',
  title: '인쇄 해상도 계산기 — 크기·DPI로 필요한 픽셀·메가픽셀 + 품질 역산',
  description:
    '인쇄 크기와 용도(DPI)를 고르면 필요한 최소 해상도(픽셀·메가픽셀)를 계산. 반대로 내 이미지 픽셀로 인쇄 품질을 역산하고 품질별 최대 인쇄 크기까지 한 번에. A4·사진·포스터·현수막 대응.',
  keywords: ['인쇄해상도계산기', '인쇄DPI계산', '사진인화해상도', '포스터해상도', '필요픽셀계산', '메가픽셀인쇄크기', 'DPI픽셀변환', 'A4인쇄해상도', '현수막해상도'],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '18px 20px',
}

const th: React.CSSProperties = {
  padding: '9px 10px', textAlign: 'left', fontSize: '11px', fontWeight: 700,
  color: 'var(--muted)', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)', whiteSpace: 'nowrap',
}
const td: React.CSSProperties = {
  padding: '9px 10px', borderBottom: '1px solid var(--border)', color: 'var(--text)',
  fontSize: '13px', whiteSpace: 'nowrap',
}

const DPI_ROWS = [
  { dpi: '300', use: '사진 인화·고급 인쇄', dist: '손에 들고 (~30cm)', ex: '사진·잡지·명함·청첩장' },
  { dpi: '250', use: '일반 인쇄(전단·문서)', dist: '손에 들고', ex: '전단지·브로슈어·사무 문서' },
  { dpi: '150', use: '근거리 포스터(실내)', dist: '1~2m', ex: '실내 게시 포스터·메뉴판' },
  { dpi: '100', use: '대형 포스터(원거리)', dist: '2~5m', ex: '벽보·대형 포스터' },
  { dpi: '72', use: '현수막·배너(원거리)', dist: '5m 이상', ex: '옥외 현수막·배너' },
]

/* 규격 표는 계산기와 같은 규격 데이터(printData)·같은 식(mm ÷ 25.4 × DPI, 반올림)으로 빌드 시 계산한다 */
const px300 = (mm: number) => Math.round((mm / MM_PER_INCH) * 300)
const SIZE_ROWS = [
  { id: 'a4', name: 'A4' },
  { id: 'a3', name: 'A3' },
  { id: 'a2', name: 'A2 (포스터)' },
  { id: 'p4x6', name: '4×6″ (4R·KG판)' },
  { id: 'p8x10', name: '8×10″ (8R)' },
  { id: 'card', name: '명함 (90×50)' },
  { id: 'idphoto', name: '증명사진 (35×45)' },
].map(({ id, name }) => {
  const s = SIZE_MAP[id]
  const w = px300(s.w), h = px300(s.h)
  return { name, cm: `${(s.w / 10).toFixed(1)} × ${(s.h / 10).toFixed(1)}`, px300: `${w} × ${h}`, mp: `${((w * h) / 1e6).toFixed(1)}MP` }
})

/* 픽셀 → 최대 인쇄 크기(cm) = 픽셀 ÷ DPI × 2.54 — 계산기의 '품질별 최대 인쇄 크기'와 같은 식 */
const maxCm = (w: number, h: number, dpi: number) => `약 ${Math.round((w / dpi) * 2.54)} × ${Math.round((h / dpi) * 2.54)}cm`
const PHONE_ROWS = [
  { mp: '12MP', who: '갤럭시 S24 울트라 등 기본 저장', w: 4000, h: 3000, n300: 'A4 이상', n150: 'A2급' },
  { mp: '24MP', who: '아이폰 15·16 기본 저장', w: 5712, h: 4284, n300: 'A3 이상', n150: 'A1급' },
  { mp: '48MP', who: '아이폰 고해상도 옵션', w: 8064, h: 6048, n300: 'A2 이상', n150: 'A0급' },
]

const SCAN_ROWS = [
  { src: '4×6″ 인화 사진 (10.2×15.2cm)', target: '같은 크기 재인화', ratio: '1.0배', need: '300', set: '300DPI' },
  { src: '4×6″ 인화 사진', target: 'A4 (21×29.7cm)', ratio: '약 1.95배', need: '585', set: '600DPI' },
  { src: '4×6″ 인화 사진', target: 'A3 (29.7×42cm)', ratio: '약 2.8배', need: '827', set: '1200DPI' },
  { src: '35mm 필름 (36×24mm)', target: 'A4', ratio: '약 8.3배', need: '2475', set: '2400(약간 부족)~4800' },
]

/* 관람 거리별 눈의 해상 한계 — 시력 1.0 = 1분각(1/60°)을 구분(ISO 8596 란돌트 고리 기준).
   한계 PPI = 1 ÷ (거리[인치] × tan 1′) — 이보다 촘촘한 픽셀은 그 거리에서 낱낱이 구분되지 않는다 */
const ARCMIN = Math.tan(Math.PI / 180 / 60)
const acuityPpi = (cm: number) => 1 / ((cm / 2.54) * ARCMIN)
const DIST_ROWS = [
  { cm: 30, label: '30cm', use: '사진·명함·잡지 (권장 300)' },
  { cm: 50, label: '50cm', use: '책상 위 문서·전단 (권장 250)' },
  { cm: 100, label: '1m', use: '실내 포스터 (권장 150)' },
  { cm: 200, label: '2m', use: '실내 포스터~대형 포스터 (권장 150~100)' },
  { cm: 500, label: '5m', use: '대형 포스터·현수막 (권장 100~72)' },
  { cm: 1000, label: '10m', use: '옥외 현수막 (권장 72)' },
]

/* 계산 예시 — 계산기 기본값(① A4·사진 300 / ② 4000×3000·A4) 그대로 */
const A4 = SIZE_MAP['a4']
const EX_FWD = { w: px300(A4.w), h: px300(A4.h) }
const EX_FF = fitFill(4000, 3000, A4.w, A4.h)
const CARD_BLEED = withBleed(SIZE_MAP['card'].w, SIZE_MAP['card'].h, 3)

const FAQ_LD = [
  { q: 'DPI와 PPI는 어떻게 다른가요?', a: '엄밀히 말하면 다릅니다. <strong>PPI(Pixels Per Inch)</strong>는 이미지가 1인치에 픽셀을 몇 개 담는지, <strong>DPI(Dots Per Inch)</strong>는 프린터가 1인치에 잉크 점을 몇 개 찍는지를 뜻합니다. 이 계산기가 내는 값은 <strong>이미지의 PPI</strong>입니다. 잉크젯 프린터 스펙의 &quot;1440×720 dpi&quot; 같은 숫자는 잉크 분사 밀도라서, 그 값에 맞춰 이미지를 1440ppi로 저장할 필요는 전혀 없습니다 — 프린터는 한 픽셀을 여러 잉크 점으로 표현합니다. 업계에서 &quot;300 DPI로 주세요&quot;라고 할 때의 실제 의미도 300 PPI입니다. 필요한 픽셀 = <strong>(인치 크기) × PPI</strong>로 계산해요.' },
  { q: 'DPI는 무조건 높을수록 좋은가요?', a: '아닙니다. <strong>보는 거리</strong>가 핵심입니다. 손에 들고 보는 사진·명함은 300DPI가 필요하지만, 몇 m 떨어져 보는 대형 포스터나 현수막은 사람 눈이 점을 구분하지 못해 <strong>100DPI 이하로도 충분</strong>합니다. 불필요하게 높은 해상도는 파일이 무거워지고 업로드·처리 시간이 늘어날 뿐 화질 체감 차이는 없습니다(인쇄 비용은 업체 과금 방식에 따라 다릅니다).' },
  { q: '“최소 해상도” 모드와 “품질 역산” 모드 차이가 뭔가요?', a: '<strong>① 최소 해상도</strong>는 “이 크기로 이 용도로 뽑으려면 사진이 최소 몇 픽셀이어야 하나?”를 알려줍니다(인쇄 전 점검). <strong>② 품질 역산</strong>은 “내가 가진 4000×3000 사진을 A4로 뽑으면 몇 DPI가 나오고 품질이 어떤가?”를 알려줍니다(가진 이미지로 판단). 인쇄소에 맡기기 전 두 모드로 교차 확인하면 실패를 줄일 수 있어요.' },
  { q: '내 카메라/폰 화소수로 어디까지 인쇄할 수 있나요?', a: '대략 <strong>(가로픽셀 ÷ DPI) × 2.54 = 가로 cm</strong>로 계산합니다. 예를 들어 1200만 화소(4000×3000) 사진은 300DPI 기준 약 <strong>34×25cm(A4보다 큰 크기)</strong>까지 고품질로 뽑을 수 있고, 150DPI를 허용하면 그 두 배 크기도 가능합니다. ② 품질 역산 모드에 픽셀을 넣으면 품질별 최대 크기를 표로 보여줘요.' },
  { q: 'mm·cm·인치·픽셀은 어떻게 환산되나요?', a: '1인치 = <strong>2.54cm = 25.4mm</strong>입니다. 픽셀은 DPI가 있어야 길이로 바뀝니다: <strong>픽셀 = (mm ÷ 25.4) × DPI</strong>. 예를 들어 A4 가로 210mm를 300DPI로 인쇄하려면 210 ÷ 25.4 × 300 ≈ <strong>2480픽셀</strong>이 필요합니다. 이 계산기는 크기를 고르면 자동으로 cm·픽셀·메가픽셀을 함께 보여줍니다.' },
  { q: '이미지를 키우면(업스케일) 해상도가 늘어나지 않나요?', a: '단순 확대는 <strong>없던 디테일을 만들어내지 못합니다</strong>. 픽셀을 늘려도 원본에 없던 정보는 흐릿하게 보간될 뿐이에요. 최근 AI 업스케일러는 그럴듯한 디테일을 채워 넣기도 하지만, 원본에 없던 정보를 추정해 그린 것이라 글자·얼굴이 원본과 달라질 수 있습니다. 가장 좋은 건 <strong>처음부터 충분한 해상도로 촬영·스캔</strong>하는 것이고, 부족하면 인쇄 크기를 줄이거나 더 먼 거리에서 보는 용도로 활용하세요.' },
]

export default function PrintResolutionPage() {
  return (
    <ToolPage width={760} slug="/tools/art/print-resolution">
      <h1 className="tp-h1">
        <ToolIconBadge catId="art" />인쇄 해상도 계산기
      </h1>
      <p className="tp-lead">
        인쇄 크기와 용도(DPI)로 <strong style={{ color: 'var(--text)' }}>필요한 최소 픽셀</strong>을 구하고, 반대로 내 이미지로 <strong style={{ color: 'var(--text)' }}>인쇄 품질을 역산</strong>합니다. 사진·A4·포스터·현수막까지.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="사진 인화 규격 = 후지필름 공식 스토어 표기(L 89×127 · KG 102×152 · 2L 127×178 · 六切 203×254) · A규격 = ISO 216 · 명함 90×50(한국 관행) · 증명사진 35×45(외교부 여권 규격) · 300 PPI 기준 = 하프톤 150 lpi × 품질계수 2 · 250 PPI = 일반 상업 인쇄 실무 권장값 · 관람 거리 한계 = 시력 1.0(1분각, ISO 8596) 기준 계산"
        sources={[
          { label: '후지필름 프린트 사이즈 (L·KG·2L)', href: 'https://pg-ja.fujifilm.com/10001.html' },
          { label: '외교부 여권 사진 규격', href: 'https://www.passport.go.kr/home/kor/contents.do?menuPos=32' },
          { label: 'Adobe — 프린터 해상도와 이미지 해상도', href: 'https://helpx.adobe.com/photoshop/desktop/crop-resize-transform/resize-adjust-resolution/printer-resolution.html' },
          { label: 'ISO 216 — A·B 시리즈 용지 규격', href: 'https://www.iso.org/standard/36631.html' },
          { label: 'ISO 8596 — 시력 검사 표준 시표(1.0 = 1분각)', href: 'https://www.iso.org/standard/69042.html' },
        ]}
      />

      <PrintResolutionClient />

      <Callout tone="note" title="계산 전제">
        <ul>
          <li>결과는 <strong>이미지의 PPI</strong>입니다. 프린터 스펙의 DPI(잉크 점 밀도)와 다른 값이며, 1440dpi 프린터라고 1440ppi로 저장할 필요는 없습니다.</li>
          <li>종횡비가 다르면 <strong>채우기</strong>는 일부를 잘라내고 <strong>맞춤</strong>은 여백을 남깁니다 — 계산기에서 골라 잘림 비율과 실제 인쇄 크기를 확인하세요.</li>
          <li>명함·전단·포스터는 <strong>도련(재단 여유)</strong>만큼 더 크게 인쇄한 뒤 자릅니다. 계산기의 도련 옵션을 켜면 실제 인쇄 크기로 계산합니다.</li>
          <li>권장 PPI는 <strong>관람 거리</strong>에 따라 달라집니다. 절대 등급 라벨은 가까이서 보는 인쇄를 전제하므로, 멀리서 보는 인쇄물은 용도 기준 판정을 보세요.</li>
          <li>인화 규격의 mm는 정수 반올림값(ISO 1008 표기)이라, 정확 인치로 계산한 픽셀과 최대 5px 차이가 날 수 있습니다.</li>
        </ul>
      </Callout>

      <GuideDivider />

      <AdSlot position="in-article" minHeight={200} />

      {/* DPI 개념 */}
      <h2 className="g-h2">DPI·해상도, 핵심만 정리</h2>
      <ul className="g-list">
        <li><strong>PPI</strong> — 이미지가 1인치에 담는 <strong>픽셀</strong> 수. 이 계산기가 내는 값입니다.</li>
        <li><strong>DPI</strong> — 프린터가 1인치에 찍는 <strong>잉크 점</strong> 수. 이미지 PPI와 다른 개념이며, 프린터 스펙의 1440dpi에 맞춰 저장할 필요는 없습니다.</li>
        <li><strong>필요 픽셀 = (mm ÷ 25.4) × DPI</strong> — 크기와 DPI가 정해지면 픽셀이 자동으로 결정됩니다.</li>
        <li><strong>보는 거리가 DPI를 정한다</strong> — 가까이 보면 300, 멀리 보면 100·72로도 충분.</li>
        <li><strong>메가픽셀(MP) = 가로픽셀 × 세로픽셀 ÷ 100만</strong> — 카메라·폰 화소와 직접 비교.</li>
      </ul>

      {/* 계산 예시 */}
      <h2 className="g-h2">계산 예시 — 기본값 그대로 따라 하기</h2>
      <p className="g-p">
        <strong>① 최소 해상도</strong> 모드의 기본값(A4 · 사진 인화 300 DPI)은 가로 210 ÷ 25.4 × 300 = <strong>{EX_FWD.w}px</strong>,
        세로 297 ÷ 25.4 × 300 = <strong>{EX_FWD.h}px</strong>, 곧 약 {((EX_FWD.w * EX_FWD.h) / 1e6).toFixed(1)}MP입니다. 이보다 작은 사진은 A4 사진 품질에 못 미칩니다.
      </p>
      <p className="g-p">
        <strong>② 품질 역산</strong> 모드의 기본값(4000×3000 사진 → A4)은 가로세로비가 4:3과 1:1.414로 달라서 두 답이 나옵니다.
        <strong> 채우기</strong>는 긴 변을 용지에 맞추고 짧은 축을 잘라 A4를 꽉 채우므로 {Math.round(EX_FF.fillPpi)} PPI이고, 이미지의 약 {(EX_FF.cropFrac * 100).toFixed(1)}%가 잘립니다.
        <strong> 맞춤</strong>은 이미지를 자르지 않고 짧은 변을 용지에 맞추므로 {Math.round(EX_FF.fitPpi)} PPI로 조금 더 촘촘하지만, 실제 인쇄 크기는 {(EX_FF.fitLongMm / 10).toFixed(1)} × {(EX_FF.fitShortMm / 10).toFixed(1)}cm라 긴 변 쪽에 합쳐서 {((A4.h - EX_FF.fitLongMm) / 10).toFixed(1)}cm의 여백이 남습니다.
        둘 다 300을 넘으므로 사진 용도 판정은 &lsquo;충분&rsquo;입니다.
      </p>
      <p className="g-p">
        도련을 켜면 계산 대상이 커집니다. 명함 90×50mm에 사방 3mm 도련을 더하면 {CARD_BLEED.w}×{CARD_BLEED.h}mm를 인쇄해야 하므로,
        300 DPI 기준 필요 픽셀은 {px300(90)}×{px300(50)}이 아니라 <strong>{px300(CARD_BLEED.w)}×{px300(CARD_BLEED.h)}px</strong>입니다. 도련 폭은 인쇄소마다 다르니 입고 규격을 확인하세요.
      </p>

      {/* 용도별 권장 DPI + 거리 */}
      <h2 className="g-h2">용도·보는 거리별 권장 DPI</h2>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={th}>DPI</th>
              <th scope="col" style={th}>용도</th>
              <th scope="col" style={th}>보는 거리</th>
              <th scope="col" style={th}>예시</th>
            </tr>
          </thead>
          <tbody>
            {DPI_ROWS.map((r, i) => (
              <tr key={i}>
                <td style={{ ...td, fontFamily: 'var(--font-sans)', fontWeight: 800, color: 'var(--accent-ink)' }}>{r.dpi}</td>
                <td style={td}>{r.use}</td>
                <td style={{ ...td, color: 'var(--muted)' }}>{r.dist}</td>
                <td style={{ ...td, color: 'var(--muted)', whiteSpace: 'normal' }}>{r.ex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        현수막처럼 멀리서 보는 대형 인쇄물은 72~100DPI로도 충분합니다. 인쇄소에 따라 권장 값이 다를 수 있으니 발주 전 확인하세요.
      </p>

      {/* 관람 거리와 눈의 한계 */}
      <h2 className="g-h2">왜 거리마다 다른가 — 눈의 해상 한계로 본 PPI</h2>
      <p className="g-p">
        시력 1.0은 1분각(1/60°) 크기의 틈을 구분하는 능력으로 정의됩니다(ISO 8596의 란돌트 고리 기준). 픽셀 하나가 이 각도보다 작아지면 그 거리에서는 낱낱의 픽셀이 보이지 않으므로,
        <strong> 한계 PPI = 1 ÷ (거리[인치] × tan 1′) ≈ 8,730 ÷ 거리[cm]</strong>로 계산할 수 있습니다. 30cm에서 약 291 PPI가 나와, 하프톤 150 lpi × 2에서 온 &lsquo;사진은 300&rsquo; 관행과도 거의 일치합니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={th}>관람 거리</th>
              <th scope="col" style={th}>시력 1.0 한계 PPI</th>
              <th scope="col" style={th}>해당 용도 (위 표의 권장값)</th>
            </tr>
          </thead>
          <tbody>
            {DIST_ROWS.map((r) => (
              <tr key={r.cm}>
                <td style={{ ...td, fontWeight: 700 }}>{r.label}</td>
                <td style={{ ...td, fontFamily: 'var(--font-sans)', fontWeight: 800, color: 'var(--accent-ink)' }}>{Math.round(acuityPpi(r.cm))}</td>
                <td style={{ ...td, color: 'var(--muted)', whiteSpace: 'normal' }}>{r.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        먼 거리일수록 실무 권장값이 한계치보다 넉넉한 것은, 사람들이 포스터에 다가가서 보기도 하고 글자·선처럼 대비가 큰 가장자리에서는 1분각보다 작은 어긋남(계단 현상)도 눈에 띄기 때문입니다.
        시력이 1.0보다 좋은 사람에게는 한계 PPI가 그만큼 높아집니다.
      </p>

      {/* 규격별 300DPI 픽셀 */}
      <h2 className="g-h2">규격별 300DPI 필요 해상도</h2>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={th}>규격</th>
              <th scope="col" style={th}>크기(cm)</th>
              <th scope="col" style={th}>300DPI 픽셀</th>
              <th scope="col" style={th}>화소</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_ROWS.map((r, i) => (
              <tr key={i}>
                <td style={{ ...td, fontWeight: 700 }}>{r.name}</td>
                <td style={{ ...td, color: 'var(--muted)' }}>{r.cm}</td>
                <td style={{ ...td, fontFamily: 'var(--font-sans)' }}>{r.px300}</td>
                <td style={{ ...td, fontFamily: 'var(--font-sans)', color: 'var(--muted)' }}>{r.mp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        테두리 재단(도련)이 필요한 인쇄물은 사방 1~3mm 여유를 더하면 좋습니다. 위 값은 재단 여백을 제외한 마감 크기 기준이에요.
        4×6″는 인화 규격 mm(102×152) 기준이라 정확 인치로 계산한 1200×1800과 몇 픽셀 다릅니다.
      </p>

      {/* 스마트폰 화소별 최대 인쇄 크기 */}
      <h2 className="g-h2">스마트폰 사진, 어디까지 인쇄할 수 있나</h2>
      <p className="g-p">
        카메라 스펙의 “2억 화소”와 실제 저장되는 픽셀은 다릅니다. 최신 폰은 여러 픽셀을 하나로 묶어 찍는 <strong>픽셀 비닝</strong>이 기본값이라, 갤럭시 S24 울트라는 200MP 센서로도 기본 12MP로 저장하고, 아이폰 16은 48MP 센서로 기본 24MP(5712×4284)를 저장합니다. 인쇄 가능 크기는 센서 화소가 아니라 이 <strong>저장 픽셀</strong> 기준으로 계산해야 합니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={th}>저장 화소</th>
              <th scope="col" style={th}>대표 사례</th>
              <th scope="col" style={th}>픽셀</th>
              <th scope="col" style={th}>300DPI 최대</th>
              <th scope="col" style={th}>150DPI 최대</th>
            </tr>
          </thead>
          <tbody>
            {PHONE_ROWS.map((r, i) => (
              <tr key={i}>
                <td style={{ ...td, fontFamily: 'var(--font-sans)', fontWeight: 800, color: 'var(--accent-ink)' }}>{r.mp}</td>
                <td style={{ ...td, color: 'var(--muted)' }}>{r.who}</td>
                <td style={{ ...td, fontFamily: 'var(--font-sans)' }}>{r.w} × {r.h}</td>
                <td style={td}>{maxCm(r.w, r.h, 300)} ({r.n300})</td>
                <td style={{ ...td, color: 'var(--muted)' }}>{maxCm(r.w, r.h, 150)} ({r.n150})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        큰 인쇄가 목적이면 촬영 전에 카메라 설정에서 고해상도 모드(아이폰 48MP, 갤럭시 50·200MP 등)를 직접 켜야 합니다. 이미 12MP로 찍은 사진은 확대해도 디테일이 늘지 않아요. 디지털 줌·저조도 사진은 픽셀 수가 같아도 체감 선명도가 떨어지므로 표보다 한 단계 작게 잡는 게 안전합니다.
      </p>

      {/* 스캔 해상도 역산 */}
      <h2 className="g-h2">옛 사진·필름 확대 인쇄 — 스캔 DPI 역산</h2>
      <p className="g-p">
        옛 인화 사진이나 필름을 스캔해 더 크게 다시 뽑을 때는 <strong>스캔 DPI = 출력 DPI × 확대율(목표 크기 ÷ 원본 크기)</strong>로 역산합니다. 원본을 키우는 만큼 원본에서 픽셀을 더 촘촘히 읽어야 하기 때문이에요. 예를 들어 4×6″ 사진을 A4로 키우면 긴 변 기준 약 1.95배 확대이므로, 300DPI 인쇄용으로는 300 × 1.95 ≈ 585, 즉 <strong>600DPI로 스캔</strong>하면 됩니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={th}>원본</th>
              <th scope="col" style={th}>목표 크기</th>
              <th scope="col" style={th}>확대율</th>
              <th scope="col" style={th}>계산값</th>
              <th scope="col" style={th}>권장 스캔 설정</th>
            </tr>
          </thead>
          <tbody>
            {SCAN_ROWS.map((r, i) => (
              <tr key={i}>
                <td style={{ ...td, fontWeight: 700 }}>{r.src}</td>
                <td style={td}>{r.target}</td>
                <td style={{ ...td, color: 'var(--muted)' }}>{r.ratio}</td>
                <td style={{ ...td, fontFamily: 'var(--font-sans)', color: 'var(--muted)' }}>{r.need}</td>
                <td style={{ ...td, fontFamily: 'var(--font-sans)', fontWeight: 800, color: 'var(--accent-ink)' }}>{r.set}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        스캐너는 300·600·1200·2400처럼 단계로 동작합니다. 원칙은 <strong>계산값을 넘는 단계</strong>를 고르는 것이지만, 35mm 필름→A4는 계산값 2475와 스캐너 단계 2400 사이에 걸립니다 — 2400으로 스캔하면 A4 출력 시 약 291 PPI로 <strong>300에 조금 못 미치고</strong>, 다음 단계인 4800은 파일이 4배가 됩니다. 300 PPI를 반드시 채워야 하면 4800, 실용상 충분하면 2400을 고르세요. 확대율은 긴 변 기준(4×6″ = 정확히 6인치 = 152.4mm)이며, 4×6″(3:2)와 A4는 가로세로 비율이 달라 여백이 남거나 일부가 잘립니다. 스펙표의 ‘보간 해상도’가 아닌 광학 해상도 기준으로 판단하세요.
      </p>

      {/* FAQ */}
      <Faq items={FAQ_LD} />

      {/* 면책 */}
      <Disclaimer variant="default" open>
        권장 DPI는 일반적인 기준이며, 인쇄 방식(오프셋·디지털·잉크젯)과 용지·관람 환경에 따라 적정 값이 달라질 수 있습니다. 중요한 인쇄물은 발주 전 인쇄소의 입고 규격을 반드시 확인하세요.
      </Disclaimer>

      {/* 관련 도구 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {[
          { href: '/tools/art/fov', icon: '📷', name: '카메라 화각 계산기', desc: '센서·초점거리·화각' },
          { href: '/tools/art/exposure', icon: '📸', name: '사진 노출 계산기', desc: '조리개·셔터·ISO' },
          { href: '/tools/art/golden-ratio', icon: '🌀', name: '황금 비율 계산기', desc: '구도·비율 설계' },
          { href: '/tools/art/color', icon: '🎨', name: '색상 코드 변환기', desc: 'HEX·RGB·CMYK 참고' },
        ].map((t, i) => (
          <Link key={i} href={t.href} style={{ ...card, display: 'block', textDecoration: 'none', padding: '14px 16px' }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
          </Link>
        ))}
      </div>
    </ToolPage>
  )
}
