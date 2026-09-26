import Link from 'next/link'
import FovClient from './FovClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import { SENSORS, aov, frameSize, geoCrop, getLensCategory } from './fovUtils'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/art/fov',
  title: '카메라 화각 계산기 — 크롭 팩터·AOV·시야 너비·렌즈 가이드',
  description: '풀프레임~스마트폰 7종 센서 × 4-800mm 35mm 환산 + 수평/수직/대각 화각·시야 너비·등가 조리개와 10 용도별 추천 렌즈.',
  keywords: [
    '카메라 화각 계산기', '35mm 환산', '크롭 팩터', '풀프레임 환산',
    'APS-C 환산', 'M4/3 환산', '시야각', 'AOV', 'angle of view',
    '등가 조리개', '심도 환산', '500룰 별 사진', '안전 셔터 룰',
    '렌즈 추천', '인물 렌즈', '풍경 렌즈', '망원 렌즈', '광각 렌즈',
    '시야 너비', '프레임 크기', '피사체 거리', '카메라 센서 크기',
  ],
})

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', fontSize: 13 }
const tdNum: React.CSSProperties = { ...td, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const rowBorder: React.CSSProperties = { borderBottom: '1px solid var(--border)' }

/* 가이드 표는 손으로 적지 않고 계산기와 같은 fovUtils 함수로 빌드 시 계산한다.
   (예전 카드·표는 손입력이라 계산기 결과와 어긋날 위험이 있었다) */
const FF = SENSORS[0]
const AOV_ROWS: { fl: number; use: string }[] = [
  { fl: 14,  use: '광활한 풍경·실내 인테리어·별' },
  { fl: 24,  use: '풍경·여행·브이로그' },
  { fl: 35,  use: '스트리트·환경 인물·일상' },
  { fl: 50,  use: '표준 — 초점거리가 화면 대각선(43.3mm)에 가까움' },
  { fl: 85,  use: '인물 단렌즈 표준·압축감' },
  { fl: 135, use: '인물 클로즈업·실내 스포츠' },
  { fl: 200, use: '인물 압축·스포츠·이벤트' },
  { fl: 400, use: '야외 스포츠·새' },
  { fl: 600, use: '야생 동물·달·스포츠 사이드라인' },
]
const FRAME_ROWS: { d: number; use: string }[] = [
  { d: 1,  use: '제품·꽃·소품 클로즈업' },
  { d: 2,  use: '인물 상반신·반신' },
  { d: 3,  use: '인물 전신' },
  { d: 5,  use: '단체 사진 (4-6명)' },
  { d: 10, use: '실내 이벤트' },
  { d: 50, use: '풍경·중경' },
]
const deg = (v: number) => `${v.toFixed(1)}°`
const meters = (v: number) => `${v < 10 ? v.toFixed(2) : v.toFixed(1)}m`

/* 계산 예시 — APS-C(×1.5) + 35mm, 3m, f/1.8 (계산기에서 같은 값을 넣으면 나오는 수치) */
const APSC = SENSORS.find((x) => x.id === 'apsc15') ?? SENSORS[1]
const M43 = SENSORS.find((x) => x.id === 'm43') ?? SENSORS[3]
const EX = {
  eq: 35 * APSC.cropFactor,
  h: aov(APSC.width, 35),
  d: aov(APSC.diagonal, 35),
  ffH: aov(FF.width, 35 * APSC.cropFactor),
  ffD: aov(FF.diagonal, 35 * APSC.cropFactor),
  w3: frameSize(3, APSC.width, 35),
  h3: frameSize(3, APSC.height, 35),
  ap: 1.8 * APSC.cropFactor,
  m43H: aov(M43.width, 25),
  ffH50: aov(FF.width, 50),
}

const FAQ_LD = [
  { q: '35mm 환산이 정확히 무엇인가요?',
    a: '모든 카메라 화각을 <strong>35mm 필름(=풀프레임 36×24mm)</strong> 기준으로 통일해 표현한 값입니다. 디지털 시대 다양한 센서 크기 때문에 같은 50mm 렌즈도 화각이 달라 비교가 어려웠어요. 35mm 환산을 쓰면 어떤 카메라든 &quot;환산 50mm = 표준 화각&quot;처럼 직관적으로 비교할 수 있습니다. 공식: <strong>환산 mm = 실제 mm × 크롭 팩터</strong>. 사진 파일의 Exif에도 이 값을 적는 전용 항목(FocalLengthIn35mmFilm)이 있습니다.' },
  { q: '크롭 팩터(Crop Factor)는 어떻게 정해지나요?',
    a: '<strong>풀프레임 대각선(43.27mm) ÷ 센서 대각선</strong>으로 계산합니다.<br>• APS-C(소니/니콘/후지): 약 28.2mm 대각선 → 43.27/28.2 ≈ <strong>1.53</strong>이지만 제조사 표기는 <strong>×1.5</strong>(후지는 ×1.52)<br>• APS-C(캐논): 26.8mm → ≈ <strong>1.6</strong><br>• M4/3: 21.6mm → ≈ <strong>2.0</strong><br>• 1인치: 15.9mm → ≈ <strong>2.7</strong><br>제조사 표기는 정확한 값과 약간씩 다를 수 있습니다(예: 후지 ×1.52).' },
  { q: 'APS-C에서 50mm와 풀프레임 50mm 차이는?',
    a: '<strong>화각(시야)이 다릅니다</strong>. APS-C(×1.5)에 50mm를 끼우면 풀프레임 75mm와 같은 화각(가운데가 잘려서 좁게 보임)이 됩니다. 즉 풀프레임 50mm가 표준 단렌즈라면, APS-C 50mm는 인물 단렌즈처럼 작용해요. 같은 표준 화각을 원하면 APS-C에서는 약 33mm 렌즈가 필요합니다(50 / 1.5 ≈ 33). 단, 심도(보케)와 노출은 별개입니다.' },
  { q: '등가 조리개는 왜 필요한가요?',
    a: '<strong>심도(보케) 비교</strong>를 위해서입니다. M4/3 f/1.7로 인물을 찍으면 풀프레임 f/3.4와 같은 심도(보케 양)가 됩니다. 풀프레임 같은 강한 보케를 원하면 작은 센서에서는 더 밝은 조리개가 필요해요. 다만 <strong>노출(빛의 양)</strong>은 등가 조리개와 무관 — M4/3 f/1.7 = 풀프레임 f/1.7과 동일한 셔터·ISO에서 같은 밝기입니다. 혼동하지 마세요.' },
  { q: '스마트폰 카메라의 "24mm 환산"이 의미하는 것?',
    a: '스마트폰 카메라 센서는 풀프레임보다 훨씬 작아 크롭 팩터가 큽니다 — 최신 플래그십 메인 카메라(1/1.3형 전후)는 약 ×3.5, 보급형이나 보조 카메라(1/2~1/2.8형)는 약 ×5~×7입니다. 그래서 사양표에는 실제 초점거리 대신 35mm 환산 mm가 표기됩니다. 예: 아이폰 Pro 계열 메인 카메라는 보통 24mm 환산(실제 초점거리는 약 6mm 안팎)으로, 풀프레임 24mm 광각 렌즈와 같은 화각을 의미해요. 망원 카메라는 보통 70mm 환산(실제 약 9mm), 초광각은 13mm 환산(실제 약 1.5~2.2mm, 기종별)입니다.' },
  { q: '인물 사진에 왜 85mm가 표준인가요?',
    a: '85mm 환산이 인물 표준이 된 이유:<br>1. <strong>자연스러운 원근감</strong> — 50mm는 코가 살짝 도드라지고, 85mm는 얼굴 비율이 자연스럽게 보이는 거리에서 상반신을 담을 수 있음<br>2. <strong>적당한 압축감</strong> — 배경이 살짝 압축되어 인물이 부각<br>3. <strong>적당한 작업 거리</strong> — 모델과 2-3m 거리에서 상반신 가능<br>4. <strong>배경 흐림</strong> — 같은 프레이밍이면 초점거리가 길수록 배경이 더 크게 흐려짐<br>전신은 50mm 또는 35mm 환경 인물, 클로즈업은 105mm·135mm가 더 좋은 경우도 있습니다.' },
  { q: '안전 셔터 룰(Safe Shutter)은?',
    a: '삼각대 없이 손으로 들고 찍을 때 흔들림을 피하는 경험칙: <strong>1 / (35mm 환산 mm)</strong>초보다 빠른 셔터.<br>• 풀프레임 50mm → 1/50 이상<br>• APS-C 50mm(=환산 75mm) → 1/75 이상<br>• M4/3 50mm(=환산 100mm) → 1/100 이상<br>손떨림 보정(IBIS·렌즈 OIS)이 있으면 제조사 표기 단수만큼 느린 셔터도 가능하지만, 본인 손떨림·호흡을 고려해 1~2스톱 여유를 두는 게 좋습니다. 고화소 바디는 작은 흔들림도 잘 드러나므로 더 빠르게 잡으세요.' },
  { q: '별 사진 500룰은 어떻게 적용?',
    a: '<strong>최대 셔터(초) = 500 / 35mm 환산 mm</strong>입니다. 이 시간을 넘으면 별이 점이 아닌 선으로 늘어나요(별궤적).<br>• 풀프레임 24mm → 500/24 ≈ 21초<br>• APS-C 16mm(=환산 24mm) → 약 21초<br>• M4/3 12mm(=환산 24mm) → 약 21초<br>고해상도 카메라(45MP+)는 더 엄격한 <strong>300룰</strong>(300/환산mm)을 권장합니다. 자세한 노출 계산은 <a href="/tools/art/exposure">사진 노출 계산기</a>의 [상황 가이드] 탭을 활용하세요.' },
  { q: '줌렌즈 70-200mm는 어떻게 표기?',
    a: '렌즈에 적힌 mm는 크롭 전용 렌즈든 아니든 <strong>실제 초점거리</strong>입니다 — 풀프레임 기준으로 바꿔 적지 않습니다. 초점거리는 렌즈의 광학적 성질이라 어느 바디에 끼우든 변하지 않고, 달라지는 것은 센서가 잘라내는 범위(=화각)뿐이에요.<br>그래서 70-200mm를 APS-C(×1.5)에 끼우면 <strong>렌즈 표기는 그대로 70-200mm</strong>이고 화각만 환산 105-300mm에 해당합니다. 후지 XF 50-140mm도 실제 초점거리가 50-140mm이고, 사양서에 <strong>별도로</strong> 적히는 76-213mm가 35mm 환산값입니다.<br>사양표에서 &quot;35mm 환산&quot; 또는 &quot;Equivalent focal length&quot; 항목을 확인하세요.' },
  { q: '화각이 같으면 사진이 똑같나요?',
    a: '아닙니다. 화각이 같아도 다음이 달라요:<br>• <strong>심도(보케)</strong> — 작은 센서는 심도가 깊음(보케 적음)<br>• <strong>저조도 화질</strong> — 큰 센서가 같은 노출에서 빛을 더 많이 모아 노이즈가 적음<br>• <strong>왜곡</strong> — 같은 화각이라도 광각 렌즈 설계에 따라 왜곡 정도가 다름<br>• <strong>색감·해상력</strong> — 렌즈 품질에 좌우<br>35mm 환산은 <strong>화각만</strong> 통일하는 개념이며, 이미지 품질의 다른 요소들은 별도 평가가 필요합니다.' },
]

export default function FovPage() {
  return (
    <ToolPage width={880} slug="/tools/art/fov">
      <h1 className="tp-h1">
        <ToolIconBadge catId="art" />카메라 화각 계산기
      </h1>
      <p className="tp-lead">
        풀프레임~스마트폰 7종 센서 × 4-800mm 35mm 환산 + <strong style={{ color: 'var(--text)' }}>화각·시야 너비·등가 조리개</strong>.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="센서 치수 = 제조사 공식 사양(소니 a6700 23.3×15.5 · 니콘 Z fc·후지 X-T5 23.5×15.7 · 캐논 R10 22.3×14.9 · OM SYSTEM 17.3×13.0 · 1형 13.2×8.8) · 크롭 팩터는 제조사 표기 관행값(소니·니콘 ×1.5, 후지 ×1.52, 캐논 ×1.6)이라 대각선 계산값과 최대 2% 차이 · 렌즈 분류 경계는 표준 규정이 아니라 제조사(캐논·리코펜탁스) 관행"
        sources={[
          { label: '소니 a6700 사양 (센서 치수)', href: 'https://helpguide.sony.net/ilc/2320/v1/en/contents/221h_specifications_ilc2320.html' },
          { label: '후지필름 X-T5 사양', href: 'http://www.fujifilm-x.com/en-us/products/cameras/x-t5/specifications/' },
          { label: 'OM SYSTEM OM-1 Mark II 사양', href: 'https://my.omsystem.com/consumer/product_specs/SPECIFICATIONS_om-1-mark-ii_EN.pdf' },
          { label: '삼성 ISOCELL HP2 (1/1.3형)', href: 'https://news.samsungsemiconductor.com/global/introducing-isocell-hp2-experience-more-pictures-and-epic-details-on-the-galaxy-s23-ultra/' },
          { label: 'CIPA DC-008 Exif 2.3 — 35mm 환산 초점거리 태그', href: 'https://www.cipa.jp/std/documents/e/DC-008-2012_E.pdf' },
        ]}
      />

      <FovClient />

      <Callout tone="note" title="계산 전제와 한계">
        <ul>
          <li><strong>직선사영(rectilinear) 전용</strong> — 어안 렌즈에는 맞지 않습니다. 같은 15mm라도 어안은 실제 180°인데 이 공식은 약 110°를 냅니다. 어안은 초점거리가 아니라 사영 방식으로 구분됩니다.</li>
          <li><strong>무한원 초점 근사</strong> — 시야 크기는 &quot;거리 × 센서변 ÷ 초점거리&quot;로 계산합니다. 가까울수록 실제보다 넓게 나오고, 등배(1:1) 매크로에서는 실제 화각이 절반 수준까지 좁아집니다. 렌즈의 최단 촬영거리보다 가까운 값은 애초에 초점이 맞지 않습니다.</li>
          <li><strong>크롭 팩터는 대각 화각만 맞춥니다</strong> — 가로세로비가 다르면(풀프레임 3:2 ↔ M4/3 4:3) 같은 환산 초점거리라도 수평·수직 화각은 달라집니다.</li>
          <li><strong>센서 치수는 기종별로 다릅니다</strong> — 같은 &quot;APS-C&quot;도 소니 23.3×15.5, 니콘·후지 23.5×15.7로 갈립니다. 프리셋은 대표값이며 ±0.2mm 차이가 있습니다.</li>
          <li><strong>스마트폰은 편차가 가장 큽니다</strong> — 같은 기기 안에서도 초광각·메인·망원 카메라의 센서와 초점거리가 모두 다릅니다. 프리셋은 최신 플래그십 메인 카메라 기준이며, 정확히 계산하려면 제조사 사양의 &quot;35mm 환산&quot; 값을 직접 확인하세요.</li>
          <li><strong>등가 조리개는 배경 흐림 비교용</strong>입니다 — 노출은 센서 크기와 무관하므로 카메라 설정을 바꾸라는 뜻이 아닙니다.</li>
        </ul>
      </Callout>

      <GuideDivider />

      {/* 1. 어떻게 사용하나요? */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <ol className="g-list">
        <li><strong>센서 선택</strong> — 풀프레임 / APS-C / M4/3 / 1인치 / 2/3형 / 스마트폰</li>
        <li><strong>초점거리 슬라이더</strong> — 렌즈에 적힌 실제 mm (4-800mm)</li>
        <li><strong>35mm 환산 + 화각 자동 계산</strong> — 수평·수직·대각 도(°)</li>
        <li><strong>시야 너비 탭</strong>에서 거리에 따른 프레임 크기 확인</li>
        <li><strong>화각 비교 탭</strong>에서 인기 8개 초점거리 SVG 시각화</li>
        <li><strong>용도별 가이드 탭</strong>에서 풍경·인물·스포츠 등 추천 렌즈 + 자동 적용</li>
      </ol>
      <p className="g-note">
        입력값(센서·초점거리·조리개·거리)은 이 브라우저에 저장되어 새로고침해도 유지됩니다.
      </p>

      {/* 2. 35mm 환산 — 핵심 개념 */}
      <h2 className="g-h2">35mm 환산 — 왜 필요한가?</h2>
      <p className="g-p">
        같은 50mm 렌즈여도 카메라 센서 크기에 따라 화각이 다릅니다. <strong>35mm 환산</strong>은 모든 센서를 풀프레임(36×24mm) 기준으로 통일해 표현하는 사진 업계 관행이며,
        사진 파일의 Exif 규격(CIPA DC-008)에도 &lsquo;35mm 필름 환산 초점거리&rsquo; 항목이 따로 있습니다.
      </p>
      <p className="g-p">
        공식: <strong>35mm 환산 mm = 실제 mm × 크롭 팩터</strong>. 크롭 팩터는 풀프레임 대각선(43.27mm) ÷ 센서 대각선입니다.
        아래 표는 계산기 프리셋 값 그대로이며, 제조사 표기 크롭과 대각선으로 계산한 크롭을 나란히 적었습니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>센서</th>
              <th scope="col" style={th}>크기 (mm)</th>
              <th scope="col" style={th}>크롭 (표기)</th>
              <th scope="col" style={th}>크롭 (대각선 계산)</th>
              <th scope="col" style={th}>50mm → 환산</th>
            </tr>
          </thead>
          <tbody>
            {/* 계산기 프리셋(SENSORS)에서 그대로 만든다 — 예전 손입력 표는 APS-C 23.6×15.6, 스마트폰 1/1.7″ ×4.6으로
                바로 위 계산기(1/1.3형 ×3.52)와 값이 달랐다. */}
            {SENSORS.map((sm) => (
              <tr key={sm.id} style={rowBorder}>
                <td style={td}>{sm.label}</td>
                <td style={{ ...tdNum, color: 'var(--muted)' }}>{sm.width} × {sm.height}</td>
                <td style={{ ...tdNum, color: 'var(--accent-ink)', fontWeight: 700 }}>×{Number.isInteger(sm.cropFactor) ? sm.cropFactor.toFixed(1) : sm.cropFactor}</td>
                <td style={{ ...tdNum, color: 'var(--muted)' }}>×{geoCrop(sm).toFixed(2)}</td>
                <td style={{ ...tdNum, fontWeight: 700 }}>{Number((50 * sm.cropFactor).toFixed(1))}mm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        같은 50mm 렌즈를 풀프레임에 끼우면 표준 화각, APS-C(×1.5)에 끼우면 75mm 인물 단렌즈 같은 화각, M4/3(×2.0)에 끼우면 100mm 단망원 같은 화각이 됩니다.
        APS-C는 표기 ×1.5와 계산값 ×1.53이 약 2% 어긋나므로, 계산기의 환산 mm(표기값 기준)와 화각(센서 치수 기준)도 그만큼 차이가 납니다.
      </p>

      {/* 3. 화각(AOV) 공식 */}
      <h2 className="g-h2">화각(AOV) 공식 — 풀프레임 초점거리별 수평·수직·대각</h2>
      <p className="g-p">
        화각은 카메라가 한 번에 담을 수 있는 시야의 각도입니다. 센서의 가로·세로·대각선 중 어느 변을 넣느냐에 따라 <strong>수평·수직·대각</strong> 세 가지가 나옵니다.
        공식은 <strong>AOV = 2 × atan(센서변 ÷ (2 × 초점거리))</strong>이고, 계산기도 이 식을 그대로 씁니다.
        렌즈 카탈로그의 &lsquo;화각&rsquo;은 보통 대각 화각이므로, 파노라마·건축처럼 가로 폭이 중요할 때는 수평 화각을 따로 확인하세요.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>풀프레임 초점거리</th>
              <th scope="col" style={th}>수평</th>
              <th scope="col" style={th}>수직</th>
              <th scope="col" style={th}>대각</th>
              <th scope="col" style={th}>분류</th>
              <th scope="col" style={th}>주 용도</th>
            </tr>
          </thead>
          <tbody>
            {AOV_ROWS.map((r) => (
              <tr key={r.fl} style={rowBorder}>
                <td style={{ ...tdNum, color: 'var(--accent-ink)', fontWeight: 700 }}>{r.fl}mm</td>
                <td style={tdNum}>{deg(aov(FF.width, r.fl))}</td>
                <td style={tdNum}>{deg(aov(FF.height, r.fl))}</td>
                <td style={{ ...tdNum, fontWeight: 700 }}>{deg(aov(FF.diagonal, r.fl))}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{getLensCategory(r.fl).name}</td>
                <td style={{ ...td, color: 'var(--muted)' }}>{r.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        분류 경계(초광각 24mm 미만·중망원 135mm 이상·망원 200mm 이상 등)는 표준 기관 규정이 아니라 캐논·리코펜탁스 등 제조사 관행을 따른 것입니다. 크롭 바디에서는 35mm 환산값으로 이 표를 읽으세요.
      </p>

      {/* 4. 계산 예시 */}
      <h2 className="g-h2">계산 예시 — APS-C 35mm 단렌즈로 3m 인물 촬영</h2>
      <p className="g-p">
        계산기에서 센서를 APS-C(Sony·Nikon·Fuji), 초점거리 35mm, 조리개 f/1.8, 거리 3m로 두면 다음 값이 나옵니다.
      </p>
      <ul className="g-list">
        <li><strong>35mm 환산</strong> = 35 × 1.5 = <strong>{EX.eq}mm</strong> — 풀프레임 표준 렌즈와 비슷한 화각입니다.</li>
        <li><strong>화각</strong> = 수평 {deg(EX.h)} · 대각 {deg(EX.d)} (센서 {APSC.width}×{APSC.height}mm 기준). 풀프레임에 {EX.eq}mm를 끼우면 수평 {deg(EX.ffH)} · 대각 {deg(EX.ffD)}로 조금 더 넓은데, 표기 크롭 ×1.5와 실제 대각선 비율 ×1.53의 차이 때문입니다.</li>
        <li><strong>3m 거리 시야</strong> = 3 × {APSC.width} ÷ 35 = 가로 <strong>{meters(EX.w3)}</strong> × 세로 {meters(EX.h3)} — 카메라를 가로로 들면 세로 폭이 {meters(EX.h3)}라, 서 있는 성인은 대략 무릎 위부터 머리까지 담깁니다(전신은 세로 구도나 더 먼 거리).</li>
        <li><strong>등가 조리개</strong> = 1.8 × 1.5 = <strong>f/{EX.ap.toFixed(1)}</strong> — 같은 거리·같은 프레이밍의 풀프레임 f/2.7과 배경 흐림이 비슷하다는 뜻이고, 노출은 여전히 f/1.8 그대로입니다.</li>
      </ul>
      <p className="g-p">
        가로세로비가 다른 센서끼리 비교할 때는 수평 화각을 따로 보세요. M4/3에 25mm(환산 50mm)를 끼우면 수평 화각은 {deg(EX.m43H)}로,
        풀프레임 50mm의 {deg(EX.ffH50)}보다 좁습니다. 4:3 센서는 같은 대각선에서 가로가 짧기 때문입니다 — 대신 세로가 더 넓게 담깁니다.
      </p>

      {/* 5. 등가 조리개 */}
      <h2 className="g-h2">등가 조리개 (심도 환산)</h2>
      <p className="g-p">
        작은 센서는 같은 35mm 환산 화각·거리에서 <strong>심도가 더 깊습니다</strong>(보케가 적음). 풀프레임과 같은 보케를 만들려면 <strong>등가 조리개</strong>를 알아야 해요.
        공식: <strong>등가 조리개 = 실제 조리개 × 크롭 팩터</strong>.
      </p>
      <ul className="g-list">
        <li><strong>APS-C f/2.8</strong> ≈ 풀프레임 f/4.2 심도</li>
        <li><strong>M4/3 f/1.7</strong> ≈ 풀프레임 f/3.4 심도</li>
        <li><strong>1인치 f/1.8</strong> ≈ 풀프레임 f/4.9 심도</li>
        <li><strong>스마트폰 메인(1/1.3형) f/1.8</strong> ≈ 풀프레임 f/6.3 심도(보케 적음)</li>
      </ul>
      <Callout tone="warn" title="노출은 바뀌지 않습니다">
        등가 조리개는 <strong>심도</strong>(보케)에만 적용되며, <strong>노출(빛 양)</strong>은 변하지 않습니다. M4/3 f/1.7 = 풀프레임 f/1.7과 동일한 셔터·ISO에서 같은 밝기입니다.
      </Callout>

      {/* 6. 시야 너비 공식 */}
      <h2 className="g-h2">시야 너비 공식 — 거리에 따른 프레임 크기</h2>
      <p className="g-p">
        공식: <strong>프레임 너비 = 거리 × 센서변 ÷ 초점거리</strong> (거리와 결과는 같은 단위, 센서변과 초점거리는 mm). 거리에 정비례하므로 거리가 두 배면 담기는 폭도 두 배입니다.
        아래는 풀프레임(36×24mm) + 50mm 기준 값입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>거리</th>
              <th scope="col" style={th}>가로 시야</th>
              <th scope="col" style={th}>세로 시야</th>
              <th scope="col" style={th}>활용</th>
            </tr>
          </thead>
          <tbody>
            {FRAME_ROWS.map((r) => (
              <tr key={r.d} style={rowBorder}>
                <td style={{ ...tdNum, color: 'var(--accent-ink)', fontWeight: 700 }}>{r.d}m</td>
                <td style={tdNum}>{meters(frameSize(r.d, FF.width, 50))}</td>
                <td style={tdNum}>{meters(frameSize(r.d, FF.height, 50))}</td>
                <td style={{ ...td, color: 'var(--muted)' }}>{r.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout tone="tip" title="셀카·브이로그 거리 감 잡기">
        팔 길이(약 50cm)에서 풀프레임 24mm는 가로 {meters(frameSize(0.5, FF.width, 24))} 시야라 얼굴과 배경이 함께 들어오고,
        표준 50mm는 가로 {meters(frameSize(0.5, FF.width, 50))} 시야라 얼굴만 빽빽하게 찹니다. 스마트폰 전면 카메라가 광각인 이유입니다.
      </Callout>

      {/* FAQ */}
      <Faq items={FAQ_LD} />

      {/* 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/art/exposure" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📸</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>사진 노출 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            조리개·셔터·ISO 등가 노출
          </p>
        </Link>
        <Link href="/tools/art/print-resolution" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🖨️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>인쇄 해상도 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            사진 픽셀로 인쇄 가능 크기
          </p>
        </Link>
        <Link href="/tools/art/golden-ratio" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📐</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>황금비율 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            구도·디자인 비율
          </p>
        </Link>
        <Link href="/tools/art/color" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🎨</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>색상 코드 변환기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            HEX·RGB·WCAG·팔레트
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
