import Link from 'next/link'
import PrintResolutionClient from './PrintResolutionClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/art/print-resolution',
  title: '인쇄 해상도 계산기 — 크기·DPI로 필요한 픽셀·메가픽셀 + 품질 역산',
  description:
    '인쇄 크기와 용도(DPI)를 고르면 필요한 최소 해상도(픽셀·메가픽셀)를 계산. 반대로 내 이미지 픽셀로 인쇄 품질을 역산하고 품질별 최대 인쇄 크기까지 한 번에. A4·사진·포스터·현수막 대응.',
  keywords: ['인쇄해상도계산기', '인쇄DPI계산', '사진인화해상도', '포스터해상도', '필요픽셀계산', '메가픽셀인쇄크기', 'DPI픽셀변환', 'A4인쇄해상도', '현수막해상도'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '18px 20px',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = { cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }
const faqAnswer: React.CSSProperties = { marginTop: '10px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }

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

const SIZE_ROWS = [
  { name: 'A4', cm: '21.0 × 29.7', px300: '2480 × 3508', mp: '8.7MP' },
  { name: 'A3', cm: '29.7 × 42.0', px300: '3508 × 4961', mp: '17.4MP' },
  { name: 'A2 (포스터)', cm: '42.0 × 59.4', px300: '4961 × 7016', mp: '34.8MP' },
  { name: '4×6″ (4R·KG판)', cm: '10.2 × 15.2', px300: '1205 × 1795', mp: '2.2MP' },
  { name: '8×10″ (8R)', cm: '20.3 × 25.4', px300: '2398 × 3000', mp: '7.2MP' },
  { name: '명함 (90×50)', cm: '9.0 × 5.0', px300: '1063 × 591', mp: '0.6MP' },
]

const PHONE_ROWS = [
  { mp: '12MP', who: '갤럭시 S24 울트라 등 기본 저장', px: '4000 × 3000', d300: '약 34 × 25cm (A4 이상)', d150: '약 68 × 51cm (A2급)' },
  { mp: '24MP', who: '아이폰 15·16 기본 저장', px: '5712 × 4284', d300: '약 48 × 36cm (A3 이상)', d150: '약 97 × 73cm (A1급)' },
  { mp: '48MP', who: '아이폰 고해상도 옵션', px: '8064 × 6048', d300: '약 68 × 51cm (A2 이상)', d150: '약 137 × 102cm (A0급)' },
]

const SCAN_ROWS = [
  { src: '4×6″ 인화 사진 (10.2×15.2cm)', target: '같은 크기 재인화', ratio: '1.0배', need: '300', set: '300DPI' },
  { src: '4×6″ 인화 사진', target: 'A4 (21×29.7cm)', ratio: '약 1.95배', need: '585', set: '600DPI' },
  { src: '4×6″ 인화 사진', target: 'A3 (29.7×42cm)', ratio: '약 2.8배', need: '827', set: '1200DPI' },
  { src: '35mm 필름 (36×24mm)', target: 'A4', ratio: '약 8.3배', need: '2475', set: '2400(약간 부족)~4800' },
]

const FAQ_LD = [
  { q: 'DPI와 PPI는 어떻게 다른가요?', a: '엄밀히 말하면 다릅니다. <strong>PPI(Pixels Per Inch)</strong>는 이미지가 1인치에 픽셀을 몇 개 담는지, <strong>DPI(Dots Per Inch)</strong>는 프린터가 1인치에 잉크 점을 몇 개 찍는지를 뜻합니다. 이 계산기가 내는 값은 <strong>이미지의 PPI</strong>입니다. 잉크젯 프린터 스펙의 &quot;1440×720 dpi&quot; 같은 숫자는 잉크 분사 밀도라서, 그 값에 맞춰 이미지를 1440ppi로 저장할 필요는 전혀 없습니다 — 프린터는 한 픽셀을 여러 잉크 점으로 표현합니다. 업계에서 &quot;300 DPI로 주세요&quot;라고 할 때의 실제 의미도 300 PPI입니다. 필요한 픽셀 = <strong>(인치 크기) × PPI</strong>로 계산해요.' },
  { q: 'DPI는 무조건 높을수록 좋은가요?', a: '아닙니다. <strong>보는 거리</strong>가 핵심입니다. 손에 들고 보는 사진·명함은 300DPI가 필요하지만, 몇 m 떨어져 보는 대형 포스터나 현수막은 사람 눈이 점을 구분하지 못해 <strong>100DPI 이하로도 충분</strong>합니다. 불필요하게 높은 해상도는 파일이 무거워지고 업로드·처리 시간이 늘어날 뿐 화질 체감 차이는 없습니다(인쇄 비용은 업체 과금 방식에 따라 다릅니다).' },
  { q: '“최소 해상도” 모드와 “품질 역산” 모드 차이가 뭔가요?', a: '<strong>① 최소 해상도</strong>는 “이 크기로 이 용도로 뽑으려면 사진이 최소 몇 픽셀이어야 하나?”를 알려줍니다(인쇄 전 점검). <strong>② 품질 역산</strong>은 “내가 가진 4000×3000 사진을 A4로 뽑으면 몇 DPI가 나오고 품질이 어떤가?”를 알려줍니다(가진 이미지로 판단). 인쇄소에 맡기기 전 두 모드로 교차 확인하면 실패를 줄일 수 있어요.' },
  { q: '내 카메라/폰 화소수로 어디까지 인쇄할 수 있나요?', a: '대략 <strong>(가로픽셀 ÷ DPI) × 2.54 = 가로 cm</strong>로 계산합니다. 예를 들어 1200만 화소(4000×3000) 사진은 300DPI 기준 약 <strong>34×25cm(A4보다 큰 크기)</strong>까지 고품질로 뽑을 수 있고, 150DPI를 허용하면 그 두 배 크기도 가능합니다. ② 품질 역산 모드에 픽셀을 넣으면 품질별 최대 크기를 표로 보여줘요.' },
  { q: 'mm·cm·인치·픽셀은 어떻게 환산되나요?', a: '1인치 = <strong>2.54cm = 25.4mm</strong>입니다. 픽셀은 DPI가 있어야 길이로 바뀝니다: <strong>픽셀 = (mm ÷ 25.4) × DPI</strong>. 예를 들어 A4 가로 210mm를 300DPI로 인쇄하려면 210 ÷ 25.4 × 300 ≈ <strong>2480픽셀</strong>이 필요합니다. 이 계산기는 크기를 고르면 자동으로 cm·픽셀·메가픽셀을 함께 보여줍니다.' },
  { q: '이미지를 키우면(업스케일) 해상도가 늘어나지 않나요?', a: '단순 확대는 <strong>없던 디테일을 만들어내지 못합니다</strong>. 픽셀을 늘려도 원본에 없던 정보는 흐릿하게 보간될 뿐이에요. 다만 최근 AI 업스케일러는 어느 정도 디테일을 복원해 주기도 합니다. 가장 좋은 건 <strong>처음부터 충분한 해상도로 촬영·스캔</strong>하는 것이고, 부족하면 인쇄 크기를 줄이거나 더 먼 거리에서 보는 용도로 활용하세요.' },
]

export default function PrintResolutionPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>예술·창작</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="art" />인쇄 해상도 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        인쇄 크기와 용도(DPI)로 <strong style={{ color: 'var(--text)' }}>필요한 최소 픽셀</strong>을 구하고, 반대로 내 이미지로 <strong style={{ color: 'var(--text)' }}>인쇄 품질을 역산</strong>합니다. 사진·A4·포스터·현수막까지.
      </p>

      <UpdatedMeta
        date="2026년 8월"
        basis="사진 인화 규격 = 후지필름 공식 스토어 표기(L 89×127 · KG 102×152 · 2L 127×178 · 六切 203×254) · A규격 = ISO 216 · 명함 90×50(한국 관행) · 증명사진 35×45(외교부 여권 규격) · 300 PPI 기준 = 하프톤 150 lpi × 품질계수 2 · 250 PPI = Ghent Workgroup 일반 상업 인쇄 규정값"
        sources={[
          { label: '후지필름 프린트 사이즈 (L·KG·2L)', href: 'https://pg-ja.fujifilm.com/10001.html' },
          { label: '외교부 여권 사진 규격', href: 'https://www.passport.go.kr/home/kor/contents.do?menuPos=32' },
          { label: 'Adobe — 프린터 해상도와 이미지 해상도', href: 'https://helpx.adobe.com/photoshop/desktop/crop-resize-transform/resize-adjust-resolution/printer-resolution.html' },
        ]}
      />

      <PrintResolutionClient />

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>📐 계산 전제</p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li>결과는 <strong>이미지의 PPI</strong>입니다. 프린터 스펙의 DPI(잉크 점 밀도)와 다른 값이며, 1440dpi 프린터라고 1440ppi로 저장할 필요는 없습니다.</li>
          <li>종횡비가 다르면 <strong>채우기</strong>는 일부를 잘라내고 <strong>맞춤</strong>은 여백을 남깁니다 — 계산기에서 골라 잘림 비율과 실제 인쇄 크기를 확인하세요.</li>
          <li>명함·전단·포스터는 <strong>도련(재단 여유)</strong>만큼 더 크게 인쇄한 뒤 자릅니다. 계산기의 도련 옵션을 켜면 실제 인쇄 크기로 계산합니다.</li>
          <li>권장 PPI는 <strong>관람 거리</strong>에 따라 달라집니다. 절대 등급 라벨은 가까이서 보는 인쇄를 전제하므로, 멀리서 보는 인쇄물은 용도 기준 판정을 보세요.</li>
          <li>인화 규격의 mm는 정수 반올림값(ISO 1008 표기)이라, 정확 인치로 계산한 픽셀과 최대 5px 차이가 날 수 있습니다.</li>
        </ul>
      </div>

      <GuideDivider />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', marginTop: '48px' }}>

        {/* DPI 개념 */}
        <div>
          <h2 style={sectionTitle}>📐 DPI·해상도, 핵심만 정리</h2>
          <div style={{ ...card }}>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--muted)', lineHeight: 1.95 }}>
              <li><strong style={{ color: 'var(--text)' }}>PPI</strong> — 이미지가 1인치에 담는 <strong>픽셀</strong> 수. 이 계산기가 내는 값입니다.</li>
              <li><strong style={{ color: 'var(--text)' }}>DPI</strong> — 프린터가 1인치에 찍는 <strong>잉크 점</strong> 수. 이미지 PPI와 다른 개념이며, 프린터 스펙의 1440dpi에 맞춰 저장할 필요는 없습니다.</li>
              <li><strong style={{ color: 'var(--text)' }}>필요 픽셀 = (mm ÷ 25.4) × DPI</strong> — 크기와 DPI가 정해지면 픽셀이 자동으로 결정.</li>
              <li><strong style={{ color: 'var(--text)' }}>보는 거리가 DPI를 정한다</strong> — 가까이 보면 300, 멀리 보면 100·72로도 충분.</li>
              <li><strong style={{ color: 'var(--text)' }}>메가픽셀(MP) = 가로픽셀 × 세로픽셀 ÷ 100만</strong> — 카메라·폰 화소와 직접 비교.</li>
            </ul>
          </div>
        </div>

        {/* 용도별 권장 DPI + 거리 */}
        <div>
          <h2 style={sectionTitle}>👁️ 용도·보는 거리별 권장 DPI</h2>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid var(--border)', borderRadius: '12px' }}>
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
                    <td style={{ ...td, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, color: 'var(--accent)' }}>{r.dpi}</td>
                    <td style={td}>{r.use}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{r.dist}</td>
                    <td style={{ ...td, color: 'var(--muted)', whiteSpace: 'normal' }}>{r.ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '12px 2px 0', lineHeight: 1.7 }}>
            현수막처럼 멀리서 보는 대형 인쇄물은 72~100DPI로도 충분합니다. 인쇄소에 따라 권장 값이 다를 수 있으니 발주 전 확인하세요.
          </p>
        </div>

        {/* 규격별 300DPI 픽셀 */}
        <div>
          <h2 style={sectionTitle}>📄 규격별 300DPI 필요 해상도</h2>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid var(--border)', borderRadius: '12px' }}>
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
                    <td style={{ ...td, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.px300}</td>
                    <td style={{ ...td, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--muted)' }}>{r.mp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '12px 2px 0', lineHeight: 1.7 }}>
            테두리 재단(도련)이 필요한 인쇄물은 사방 1~3mm 여유를 더하면 좋습니다. 위 값은 재단 여백을 제외한 마감 크기 기준이에요.
          </p>
        </div>

        {/* 스마트폰 화소별 최대 인쇄 크기 */}
        <div>
          <h2 style={sectionTitle}>📱 스마트폰 사진, 어디까지 인쇄할 수 있나</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, margin: '0 0 14px' }}>
            카메라 스펙의 “2억 화소”와 실제 저장되는 픽셀은 다릅니다. 최신 폰은 여러 픽셀을 하나로 묶어 찍는 <strong style={{ color: 'var(--text)' }}>픽셀 비닝</strong>이 기본값이라, 갤럭시 S24 울트라는 200MP 센서로도 기본 12MP로 저장하고, 아이폰 16은 48MP 센서로 기본 24MP(5712×4284)를 저장합니다. 인쇄 가능 크기는 센서 화소가 아니라 이 <strong style={{ color: 'var(--text)' }}>저장 픽셀</strong> 기준으로 계산해야 합니다.
          </p>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid var(--border)', borderRadius: '12px' }}>
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
                    <td style={{ ...td, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, color: 'var(--accent)' }}>{r.mp}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{r.who}</td>
                    <td style={{ ...td, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.px}</td>
                    <td style={td}>{r.d300}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{r.d150}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '12px 2px 0', lineHeight: 1.7 }}>
            큰 인쇄가 목적이면 촬영 전에 카메라 설정에서 고해상도 모드(아이폰 48MP, 갤럭시 50·200MP 등)를 직접 켜야 합니다. 이미 12MP로 찍은 사진은 확대해도 디테일이 늘지 않아요. 디지털 줌·저조도 사진은 픽셀 수가 같아도 체감 선명도가 떨어지므로 표보다 한 단계 작게 잡는 게 안전합니다.
          </p>
        </div>

        {/* 스캔 해상도 역산 */}
        <div>
          <h2 style={sectionTitle}>🖨️ 옛 사진·필름 확대 인쇄 — 스캔 DPI 역산</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, margin: '0 0 14px' }}>
            옛 인화 사진이나 필름을 스캔해 더 크게 다시 뽑을 때는 <strong style={{ color: 'var(--text)' }}>스캔 DPI = 출력 DPI × 확대율(목표 크기 ÷ 원본 크기)</strong>로 역산합니다. 원본을 키우는 만큼 원본에서 픽셀을 더 촘촘히 읽어야 하기 때문이에요. 예를 들어 4×6″ 사진을 A4로 키우면 긴 변 기준 약 1.95배 확대이므로, 300DPI 인쇄용으로는 300 × 1.95 ≈ 585, 즉 <strong style={{ color: 'var(--text)' }}>600DPI로 스캔</strong>하면 됩니다.
          </p>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid var(--border)', borderRadius: '12px' }}>
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
                    <td style={{ ...td, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--muted)' }}>{r.need}</td>
                    <td style={{ ...td, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, color: 'var(--accent)' }}>{r.set}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '12px 2px 0', lineHeight: 1.7 }}>
            스캐너는 300·600·1200·2400처럼 단계로 동작합니다. 원칙은 <strong>계산값을 넘는 단계</strong>를 고르는 것이지만, 35mm 필름→A4는 계산값 2475와 스캐너 단계 2400 사이에 걸립니다 — 2400으로 스캔하면 A4 출력 시 약 291 PPI로 <strong>300에 조금 못 미치고</strong>, 다음 단계인 4800은 파일이 4배가 됩니다. 300 PPI를 반드시 채워야 하면 4800, 실용상 충분하면 2400을 고르세요. 확대율은 긴 변 기준이며, 4×6″(3:2)와 A4는 가로세로 비율이 달라 여백이 남거나 일부가 잘립니다. 스펙표의 ‘보간 해상도’가 아닌 광학 해상도 기준으로 판단하세요.
          </p>
        </div>

        {/* FAQ */}
        <div>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          {FAQ_LD.map((f, i) => (
            <details key={i} style={faqDetails}>
              <summary style={faqSummary}>Q{i + 1}. {f.q}</summary>
              <div style={faqAnswer} dangerouslySetInnerHTML={{ __html: f.a }} />
            </details>
          ))}
        </div>

        {/* 면책 */}
        <Disclaimer variant="default" open>
          권장 DPI는 일반적인 기준이며, 인쇄 방식(오프셋·디지털·잉크젯)과 용지·관람 환경에 따라 적정 값이 달라질 수 있습니다. 중요한 인쇄물은 발주 전 인쇄소의 입고 규격을 반드시 확인하세요.
        </Disclaimer>

        {/* 관련 도구 */}
        <div>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
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
        </div>

      </div>
    </div>
  )
}
