import Link from 'next/link'
import PaintMixClient from './PaintMixClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import { mixColors, computeAmounts, SCHOOL_12, RECIPES } from './paintMixUtils'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/art/paint-mix',
  title: '색상 혼합 계산기 — 물감·빛·RYB 색 섞기 시뮬 + 분량 환산 + 레시피',
  description: '수채·아크릴·유화·잉크·푸드컬러·레진 안료 혼합 시뮬(Subtractive·Additive·RYB) + ml/g 환산·ΔE 매칭·30+ 인기 레시피.',
  keywords: [
    '물감 혼합', '물감 비율 계산기', '색 만들기', '잉크 섞기', '잉크 혼합 비율',
    '수채화 색 비율', '아크릴 색조 비율', '유화 색 만들기',
    '살색 만들기', '황토색 만들기', '차콜 회색 만들기', '민트색 비율',
    '12색환', '색환', '보색', '유사색', '삼각배색',
    '푸드컬러 비율', '베이킹 색소', '레진 안료 비율',
    'CMY 혼합', 'RYB 모델', '델타 E', 'ΔE 색차',
    '만년필 잉크 혼합', '다이아민 잉크', '컬러 매칭',
  ],
})

/* 가이드 표는 손으로 옮겨 적지 않고 도구와 같은 함수로 빌드 시 계산한다 */
const hexOf = (name: string) => SCHOOL_12.find((c) => c.name === name)?.hex ?? '#000000'
const MODEL_PAIRS: [string, string][] = [
  ['빨강', '파랑'],
  ['노랑', '파랑'],
  ['빨강', '노랑'],
  ['빨강', '초록'],
  ['흰색', '검정'],
]
const MODEL_ROWS = MODEL_PAIRS.map(([a, b]) => {
  const cs = [{ hex: hexOf(a), weight: 1 }, { hex: hexOf(b), weight: 1 }]
  return {
    label: `${a} + ${b}`,
    sub: mixColors(cs, 'subtractive'),
    add: mixColors(cs, 'additive'),
    ryb: mixColors(cs, 'ryb'),
  }
})
const PREVIEW_RECIPES = [
  '살색 (밝은 톤)', '살색 (중간 톤)', '황토색', '카멜 베이지', '모카 브라운', '하늘색 (밝음)', '청회색', '군청', '인디고', '민트',
  '세이지 그린', '올리브', '라벤더', '코럴 핑크', '더스티 핑크', '버건디', '머스타드', '차콜 그레이', '실버 그레이', '웜 그레이',
]
const RECIPE_ROWS = PREVIEW_RECIPES
  .map((n) => RECIPES.find((r) => r.name === n))
  .filter((r): r is NonNullable<typeof r> => !!r)
  .map((r) => ({
    category: r.category,
    name: r.name,
    mix: r.mix.map(([c, w]) => `${c} ${w}`).join(' + '),
    hex: mixColors(r.mix.map(([c, w]) => ({ hex: hexOf(c), weight: w })), 'subtractive'),
  }))
/* 분량 환산 예시 — 밝은 살색 8:1:1을 총 50ml로 */
const SKIN = RECIPES.find((r) => r.name === '살색 (밝은 톤)')
const SKIN_50 = SKIN ? computeAmounts(SKIN.mix.map(([, w]) => w), 50) : []

const swatch = (hex: string) => (
  <span aria-hidden="true" style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 'var(--radius-s)', background: hex, border: '1px solid var(--border)', verticalAlign: '-2px', marginRight: 6 }} />
)

const FAQ_LD = [
  { q: "모니터 색이랑 실제 물감 색이 왜 다른가요?", a: "<strong>모니터는 빛(RGB)을 더하는 방식, 물감은 빛(CMY)을 흡수하는 방식</strong>이기 때문입니다. 둘은 본질적으로 다른 색 공간이라 100% 일치할 수 없어요. 또한 모니터마다 색 보정이 달라(sRGB / P3 / AdobeRGB), 같은 HEX도 화면별로 다르게 보입니다. 본 도구는 sRGB 기준이며, 실제 물감 결과는 <strong>안료 종류·매체(수성/유성)·종이/캔버스·건조 변색</strong>까지 반영해 차이가 생깁니다. 정확한 색은 <strong>반드시 소량 테스트</strong> 후 작업하세요." },
  { q: "Subtractive·Additive·RYB 모델 차이는?", a: "<strong>Subtractive(물감)</strong>: 안료가 빛을 흡수. 3원색 CMY(시안·마젠타·옐로우)를 모두 섞으면 이론상 검정에 가까워지고, 실제 물감은 짙은 갈색·회색이 됩니다. 본 도구의 <strong>기본값</strong>이며 섞는 비율의 평균색으로 근사하므로 3원색을 같은 양 섞으면 어두운 회색이 나옵니다.<br /> <strong>Additive(빛)</strong>: 빛이 더해짐. 3원색 RGB(빨강·초록·파랑)를 모두 합치면 흰색. 비율이 가장 큰 빛을 원래 밝기로 두고 나머지 빛을 비율만큼 더합니다. 모니터·LED·무대 조명용.<br /> <strong>RYB(전통)</strong>: 학교 미술 빨강·노랑·파랑 3원색. 직관적이지만 과학적으론 CMY가 더 정확. 학교 수업·아동 교육용.<br /> 같은 빨강+파랑이라도 모델별 결과가 달라집니다 — Subtractive는 어두운 보라, Additive는 마젠타, RYB는 자주빛 보라." },
  { q: "살색은 어떻게 만들어요?", a: "밝기에 따라 비율이 다릅니다. 본 도구의 [레시피·색환] 탭에 3종 톤이 있습니다:<br /> • <strong>밝은 살색 (아기·어린이)</strong>: 흰색 8 + 빨강 1 + 노랑 1<br /> • <strong>중간 살색 (중간 밝기 톤)</strong>: 흰색 5 + 주황 2 + 빨강 1<br /> • <strong>어두운 살색 (구릿빛)</strong>: 갈색 3 + 주황 2 + 흰색 4<br /> 핵심은 <strong>흰색 베이스 + 주황(빨강+노랑)</strong>입니다. 실제 피부톤은 밝기 외에 웜·쿨·뉴트럴 언더톤 차이가 있으므로 위 비율은 <strong>출발점 예시</strong>로 쓰고, 너무 빨간 살색이 나오면 노랑을 더 추가하세요. 인물의 그림자 색은 살색에 보색(파랑·보라)을 살짝 섞으면 자연스럽습니다." },
  { q: "보색을 섞으면 왜 회색·갈색이 나오나요?", a: "보색은 색환에서 <strong>마주 보는 색</strong>으로, 두 색이 흡수하는 빛의 파장이 정확히 <strong>가시광선 전체를 덮습니다</strong>. 물감이 모든 빛을 흡수하면 = 빛이 안 반사됨 = 회색·갈색·검정처럼 보여요.<br /> • 빨강 + 초록 = 갈색·올리브<br /> • 주황 + 파랑 = 회색·진청<br /> • 노랑 + 보라 = 카키·회록<br /> 이 특성을 활용해 <strong>그림자·중성색</strong>을 만들 때 검정만 추가하지 말고 보색을 살짝 섞으면 살아있는 회색이 됩니다. (작가들이 자주 쓰는 테크닉)" },
  { q: "빨강 + 파랑 = 보라가 항상 나오나요?", a: "이론적으론 보라지만 실제론 <strong>탁한 갈색·회보라</strong>가 자주 나옵니다.<br /> 이유는 <strong>대부분의 빨강이 약간의 노랑을 포함</strong>하기 때문이에요. 카드뮴 레드는 노랑 기운, 알리자린 크림슨은 파랑 기운. 빨강에 노랑이 섞이면 + 파랑 → 3원색이 모두 모여 회색·갈색이 됩니다.<br /> <strong>선명한 보라를 원하면</strong> 알리자린 크림슨(파랑 기운 빨강) + 울트라마린 또는 퀴나크리돈 마젠타 + 코발트 블루 조합을 쓰세요. 학교 12색 빨강만으로는 한계가 있습니다." },
  { q: "안료 농도가 다른데 같은 비율이면 같은 색?", a: "아닙니다. 같은 1ml라도 <strong>안료 농도(pigment load)</strong>에 따라 결과가 크게 달라집니다.<br /> • <strong>전문가 물감</strong>(신한 SWC·홀베인·다니엘 스미스): 안료 농도 ↑ → 적은 양으로도 진함<br /> • <strong>학생용 물감</strong>(펜텔 포스터컬러, 알파·신한 학생용 라인 등): 안료 농도 ↓, 체질안료 ↑ → 같은 양이라도 흐림<br /> • <strong>젤 푸드컬러</strong>: 액상보다 3~5배 수준으로 진하게 소개됨 → 훨씬 적게 사용<br /> 본 도구의 [분량 환산] 탭에는 <strong>사용량 배수 슬라이더(0.5×~2.0×)</strong>가 있어, 진한 젤 컬러·잉크는 0.5×, 흐린 수채 물감은 1.5×~2×로 전체 사용량을 조절할 수 있습니다. 다만 이 배수는 <strong>모든 색에 똑같이 곱해져 비율은 그대로</strong>입니다. 혼합하는 색 가운데 한 색만 유독 진하다면(프탈로 블루처럼 착색력이 강한 안료) 그 색의 비율 슬라이더를 직접 낮추세요." },
  { q: "잉크 혼합 시 주의사항은?", a: "만년필 잉크는 <strong>같은 브랜드·같은 베이스끼리만</strong> 혼합하세요. 다른 조합은 <strong>침전·응집·만년필 막힘 위험</strong>이 큽니다.<br /> • <strong>비교적 안전한 조합</strong>: 같은 브랜드 dye 잉크끼리 (예: 다이아민 + 다이아민) — 다만 같은 브랜드도 보장은 아님<br /> • <strong>위험한 조합</strong>: dye + pigment, 다른 브랜드, 산성(iron gall) + 알칼리성<br /> • <strong>혼합 전제 전용 라인</strong>(플래티넘 Mix Free, De Atramentis Document 등)만 자유 혼합 권장<br /> • 혼합 전 <strong>시린지·작은 용기에서 테스트</strong>해 24~48시간 후 침전 확인<br /> • 만년필 분해 청소가 어려운 모델(파일럿 캡리스 등)에는 혼합 잉크 사용 금지<br /> 캘리그래피용 펜촉(Nikko·Brause)은 만년필보다 막힘 영향 적어 자유로운 혼합 가능합니다." },
  { q: "푸드컬러는 어떤 비율로 사용?", a: "<strong>식약처 허가 식용 색소</strong>(타르색소·천연색소)만 사용해야 하며, 미술용 안료는 절대 식용 금지입니다. 타르색소는 <strong>식품 유형별 사용 가능 품목이 법으로 지정</strong>돼 있습니다 — 예: 적색 제102호는 캔디·빙과 등 지정 품목에만 쓸 수 있고 <strong>빵·떡류에는 사용할 수 없습니다</strong>. 제품 라벨의 용도 표시와 식약처 품목별 사용기준을 확인하세요.<br /> • <strong>젤 푸드컬러</strong>: 이쑤시개로 살짝 찍어 첨가 (1g 이하). 색이 진하고 반죽 묽어짐 적음<br /> • <strong>액상 푸드컬러</strong>: 1방울씩 추가. 풍부한 색은 5~10방울 필요<br /> • <strong>천연 색소</strong>(비트·당근·시금치 분말): 분말 1~3% 첨가, 발색은 약하지만 안전<br /> • <strong>30분 후 발색 확인</strong> — 시간이 지날수록 진해지므로 처음엔 적게<br /> 베이킹 작업은 <a href=\"/tools/cooking/baker-percent\" style=\"color: var(--accent-ink)\">베이커 퍼센트 계산기</a>·<a href=\"/tools/cooking/baking-recipe\" style=\"color: var(--accent-ink)\">베이킹 레시피 환산</a>도 함께 활용하세요." },
  { q: "레진 안료는 g 단위로 정확해야 하는 이유?", a: "레진(에폭시)은 화학 경화 반응을 거치므로 <strong>안료 비율이 너무 높으면 경화 불량</strong>이 발생합니다.<br /> • <strong>제조사 권고 우선</strong>: 안료 제조사는 통상 레진+경화제 <strong>무게의 0.5~3%</strong>를, 레진 제조사(ArtResin 등)는 <strong>부피 6% 상한</strong>을 제시 — 제품 안내가 기준<br /> • <strong>통상 5~6% 초과</strong>: 끈적임·표면 결함 등 경화 불량 위험 증가<br /> • <strong>10% 초과</strong>: 경화가 제대로 되지 않을 수 있음 (연질·미경화 잔류)<br /> 전자저울(0.01g)로 정밀 계량하고, 일반 물감/잉크 대신 <strong>레진 전용 안료(마이카 파우더·알코올 잉크·레진 페이스트)</strong>를 사용하세요. 일반 수성 물감은 레진의 화학 결합을 방해해 경화 불량 원인이 됩니다.<br /> 작업 시 환기·장갑·고글 필수. 미경화 레진은 피부 자극·알레르기 유발." },
  { q: "ΔE(델타 E)가 무엇인가요?", a: "<strong>두 색이 사람 눈에 얼마나 다르게 보이는지</strong> 수치화한 값입니다 (CIELAB 색공간 거리, 본 도구는 ΔE*ab/CIE76 기준). 작을수록 비슷.<br /> • <strong>ΔE 0~1</strong>: 사람 눈으로 차이를 느끼기 어려움<br /> • <strong>ΔE 1~2</strong>: 숙련된 관찰자만 근접 관찰로 구별<br /> • <strong>ΔE 2~3.5</strong>: 일반인도 나란히 비교하면 차이를 인지 (연구상 평균 식별 한계 ΔE ≈ 2.3)<br /> • <strong>ΔE 3.5~5</strong>: 뚜렷한 차이<br /> • <strong>ΔE 5+</strong>: 서로 다른 색으로 인식<br /> 본 도구의 <strong>컬러 매칭</strong> 탭은 ΔE를 최소화하는 혼합 비율을 brute-force로 탐색합니다. ΔE는 인쇄·도장 업계의 표준 색차 지표이며, 자동차 도장처럼 정밀한 색 관리에는 지각 균일성을 보정한 ΔE2000·CMC 공식이 주로 쓰입니다." },
]

export default function PaintMixPage() {
  return (
    <ToolPage width={880} slug="/tools/art/paint-mix">
      <h1 className="tp-h1">
        <ToolIconBadge catId="art" />색상 혼합 계산기
      </h1>
      <p className="tp-lead">
        수채·아크릴·유화·잉크 안료 혼합 시뮬 + ml/g 환산 + <strong style={{ color: 'var(--text)' }}>ΔE 매칭과 30+ 인기 레시피</strong>.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="색 계산 = sRGB(IEC 61966-2-1) · CIELAB(D65)·ΔE*ab(CIE76, CIE 015) · RYB = Gossett & Chen(2004) 색 큐브(단순화) · 식용 색소 = 식약처 「식품첨가물의 기준 및 규격」 품목별 사용기준"
        sources={[
          { label: 'CIE 015:2018 Colorimetry (CIELAB·색차)', href: 'https://cie.co.at/publications/colorimetry-4th-edition' },
          { label: 'IEC 61966-2-1 (sRGB 색공간)', href: 'https://webstore.iec.ch/en/publication/6169' },
          { label: '식품안전나라 — 식용색소적색제102호 사용기준 (식약처)', href: 'https://www.foodsafetykorea.go.kr/foodcode/04_03.jsp?idx=8200241' },
        ]}
      />

      <Callout tone="warn">
        본 도구의 색 시뮬레이션은 <strong>디지털 RGB 공간의 근사</strong>이며, 실제 물감·잉크의 안료 농도·매체(수성/유성)·건조 후 변색을 완전히 반영하지 않습니다.
        정확한 색은 <strong>반드시 소량 테스트</strong> 후 작업하세요. 분야별 안전 안내는{' '}
        <Link href="/disclaimer#art">면책조항</Link> 참고.
      </Callout>

      <PaintMixClient />

      <GuideDivider />

      {/* 1. 사용법 */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <ol className="g-list">
        <li><strong>탭 1 색 혼합</strong> — 컬러 피커·HEX·프리셋으로 2~4색 추가, 비율 슬라이더로 조정 → 결과 색 자동 계산</li>
        <li><strong>모델 선택</strong> — 물감(기본)·빛·RYB(학교) 중 선택. 결과가 즉시 재계산됩니다</li>
        <li><strong>탭 2 분량 환산</strong> — 총량(ml/g/큰술 등)을 입력하면 색별 분량을 표로 출력</li>
        <li><strong>탭 3 컬러 매칭</strong> — 목표 색을 입력하고 팔레트 선택 → 2~3색 혼합 비율 추천</li>
        <li><strong>탭 4 레시피</strong> — 30여 가지 색 카드 클릭 시 탭 1에 자동 적용 + 12색환에서 보색 탐색</li>
      </ol>
      <p className="g-note">
        입력값(색·비율·모델·총량·단위·사용량 배수)은 이 브라우저에만 저장되어 새로고침해도 유지됩니다.
      </p>

      {/* 2. 색 혼합 과학 */}
      <h2 className="g-h2">색 혼합 과학 — 빛 vs 물감 vs RYB</h2>
      <p className="g-p">
        색을 섞는 방법은 크게 세 가지입니다. 어떤 모델을 쓰느냐에 따라 결과가 완전히 달라집니다.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 16 }}>
        <div style={{ background: 'var(--bg2)', borderTop: '3px solid var(--cat-art)', borderRadius: 'var(--radius-s)', padding: '14px 16px' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px' }}>Subtractive (물감·잉크)</p>
          <p style={{ fontSize: 13, color: 'var(--text-body)', margin: '0 0 6px', lineHeight: 1.7 }}>
            안료가 빛을 <strong>흡수</strong>하고 남은 빛을 반사. 섞을수록 어두워짐.
            <strong> 3원색 = Cyan·Magenta·Yellow (CMY)</strong>, 이론상 모두 합치면 검정에 가까워집니다.
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>수채·아크릴·유화·잉크·인쇄·머리 염색</p>
        </div>
        <div style={{ background: 'var(--bg2)', borderTop: '3px solid var(--warning)', borderRadius: 'var(--radius-s)', padding: '14px 16px' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px' }}>Additive (빛)</p>
          <p style={{ fontSize: 13, color: 'var(--text-body)', margin: '0 0 6px', lineHeight: 1.7 }}>
            빛이 <strong>더해질수록</strong> 밝아짐. <strong>3원색 = Red·Green·Blue (RGB)</strong>, 모두 합치면 흰색.
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>모니터·LED·무대 조명·프로젝터</p>
        </div>
        <div style={{ background: 'var(--bg2)', borderTop: '3px solid var(--cat-health)', borderRadius: 'var(--radius-s)', padding: '14px 16px' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px' }}>RYB (전통)</p>
          <p style={{ fontSize: 13, color: 'var(--text-body)', margin: '0 0 6px', lineHeight: 1.7 }}>
            학교 미술의 <strong>빨강·노랑·파랑</strong> 3원색. 직관적이지만 과학적으론 부정확 (CMY가 더 정확).
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>학교 미술·전통 회화·아동 교육</p>
        </div>
      </div>

      {/* 2-2. 계산 방식 — paintMixUtils 그대로 */}
      <h2 className="g-h2">계산 방식 — 이 도구는 색을 이렇게 섞습니다</h2>
      <p className="g-p">
        세 모델 모두 입력한 HEX를 sRGB 값(0~255)으로 읽고, 비율 슬라이더 값을 가중치로 씁니다. 비율은 상대값으로만 쓰이므로(물감·RYB는 합계로, 빛은 가장 큰 비율로 나눔) 2:2와 1:1은 같은 결과입니다.
      </p>
      <ul className="g-list">
        <li>
          <strong>물감(Subtractive, 기본)</strong> — 각 색을 흡수량인 CMY 성분(1 − R/255, 1 − G/255, 1 − B/255)으로 바꾸고 감마 2.2를 적용해 가중 평균한 뒤 다시 RGB로 되돌립니다.
          흡수량의 &lsquo;평균&rsquo;을 근사하는 방식이라 섞을수록 어두워지지만, CMY 3원색을 같은 양 섞어도 완전한 검정이 아니라 #646464 회색이 됩니다. 실제 물감도 짙은 갈색·회색에 머무는 것과 비슷합니다.
        </li>
        <li>
          <strong>빛(Additive)</strong> — 감마를 풀어 선형 빛의 양으로 더합니다. 비율이 가장 큰 색을 원래 밝기로 두고 나머지를 비율만큼 더하며, 어느 채널이 최대치를 넘으면 세 채널을 같은 배율로 낮춰 색조를 유지합니다.
          그래서 빨강 #FF0000 + 초록 #00FF00은 노랑 #FFFF00, RGB 3원색은 흰색 #FFFFFF가 됩니다.
        </li>
        <li>
          <strong>RYB(학교)</strong> — Gossett &amp; Chen(2004)이 제안한 RYB 색 큐브(흰·빨·노·파·주황·보라·초록·검정 8개 꼭짓점)를 3선형 보간해 RGB로 바꿉니다. 다만 검정 꼭짓점은 원 논문의 짙은 갈색(RGB 0.2, 0.094, 0) 대신 순흑(#000000)으로 단순화했습니다.
          입력 색은 큐브를 거꾸로 탐색해 RYB 좌표를 찾은 뒤 평균합니다. 흰색·검정·회색만 섞을 때는 큐브 대각선이 갈색 쪽으로 휘어 있어 물감 모델로 대신 계산합니다.
        </li>
      </ul>
      <p className="g-p">
        아래 표는 학교 12색 팔레트에서 두 색을 1:1로 섞었을 때 도구가 내놓는 결과를 같은 함수로 계산한 것입니다. 같은 빨강 + 파랑이 물감 모델에서는 어두운 보라, 빛 모델에서는 분홍빛 마젠타, RYB에서는 자주빛 보라가 됩니다.
        노랑 + 파랑이 선명한 초록이 아니라 탁한 회록색으로 나오는 것은 학교 12색의 파랑(#264E86)이 명도가 낮은(L* 약 33) 짙은 파랑이기 때문으로, 실제 물감에서도 선명한 초록은 레몬 옐로우와 초록 기운 파랑(프탈로·세룰리안)을 섞어야 나옵니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['조합 (1:1)', '물감 (기본)', '빛', 'RYB'].map((h) => (
                <th key={h} scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODEL_ROWS.map((r) => (
              <tr key={r.label} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 10px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.label}</td>
                {[r.sub, r.add, r.ryb].map((h, i) => (
                  <td key={i} style={{ padding: '8px 10px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{swatch(h)}{h}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        <strong>컬러 매칭 탭</strong>은 목표 색과 후보 색을 모두 CIELAB(D65 기준)로 바꿔 두 점 사이 거리 ΔE*ab = √(ΔL*² + Δa*² + Δb*²)(CIE76)를 잽니다.
        팔레트에서 1~3색을 고르고 각 색에 1~5의 비율을 주는 조합을 물감 모델로 전부 섞어 보고 ΔE가 가장 작은 것을 추천합니다. 2:2:2처럼 1:1:1과 같은 조합은 건너뛰므로
        학교 12색은 26,566가지, 전문가 24색은 238,028가지를 비교합니다. 비율이 최대 5까지라 아주 옅은 틴트(흰색 20 : 색 1 같은)는 근사가 거칠 수 있습니다.
      </p>
      <p className="g-p">
        <strong>분량 환산 탭</strong>은 색별 분량 = 총량 × (그 색 비율 ÷ 비율 합계) × 사용량 배수로 계산합니다. 예를 들어 밝은 살색(흰색 8 : 빨강 1 : 노랑 1)을 총 50ml 만들면
        {SKIN_50.length === 3 ? ` 흰색 ${SKIN_50[0]}ml, 빨강 ${SKIN_50[1]}ml, 노랑 ${SKIN_50[2]}ml` : ''}입니다. 큰술은 15ml, 작은술은 5ml, 1방울은 0.05ml로 환산하고, g은 물처럼 1g = 1ml로 어림합니다 —
        물감·레진은 비중이 물과 달라 무게로 계량할 때는 이 값이 근사치라는 점을 기억하세요. 사용량 배수는 모든 색에 똑같이 곱해지므로 비율과 결과 색은 바뀌지 않습니다.
      </p>

      {/* 3. 12색환 + 보색 */}
      <h2 className="g-h2">12색환 + 보색 표</h2>
      <p className="g-p">
        색환에서 <strong>마주 보는 두 색</strong>이 보색입니다. 보색은 함께 쓰면 강한 대비를 주고, <strong>섞으면 무채색(회색·갈색)</strong>이 됩니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['주색', '보색', '혼합 결과', '활용'].map((h) => (
                <th key={h} scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['빨강', '초록', '갈색·올리브', '크리스마스·보색 대비'],
              ['주황', '파랑', '회색·진청', '보헤미안·일몰'],
              ['노랑', '보라', '카키·회록', '봄꽃·라일락'],
              ['연두', '자주', '회록색', '식물·스킨톤'],
              ['다홍', '청록', '회갈색', '바다·일몰'],
              ['귤색', '남색', '회갈색', '가을·저녁 하늘'],
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 10px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                <td style={{ padding: '8px 10px', color: 'var(--text)', fontWeight: 600 }}>{row[1]}</td>
                <td style={{ padding: '8px 10px', color: 'var(--cat-art)', fontWeight: 700 }}>{row[2]}</td>
                <td style={{ padding: '8px 10px', color: 'var(--muted)' }}>{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout tone="tip">
        그림자·중성색이 필요할 때 <strong>검정만 추가하지 말고 보색을 살짝 섞으세요</strong>. 검정은 채도를 한꺼번에 죽이지만, 보색은 색조를 남긴 채 채도를 낮춰 자연스러운 회색이 됩니다.
      </Callout>
      <p className="g-note">
        위 표와 본 도구의 색환은 물감 혼색에 쓰는 <strong>전통 RYB(이텐) 12색환</strong> 기준입니다(빨강·다홍·주황·귤색·노랑·연두·초록·청록·파랑·남색·보라·자주).
        한국 미술 교과서의 먼셀 10색상환에서는 빨강의 보색이 청록으로 조금 다르며, &lsquo;하늘색&rsquo;은 색상환 색상명이 아닌 관용색명입니다.
      </p>

      {/* 4. 레시피 표 — RECIPES 데이터에서 직접 생성 */}
      <h2 className="g-h2">자주 쓰는 색 레시피 (학교 12색 기준)</h2>
      <p className="g-p">
        흔히 만드는 색의 학교 12색 물감 비율입니다. &lsquo;도구 결과&rsquo; 열은 이 비율을 물감 모델로 섞었을 때 화면에 나오는 색으로, [레시피·색환] 탭에서 카드를 누르면 탭 1에 그대로 적용됩니다.
        실제 물감은 브랜드마다 같은 이름의 색도 안료가 달라, 이 비율에서 출발해 조금씩 보정하는 것이 현실적입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['분류', '색 이름', '비율', '도구 결과'].map((h) => (
                <th key={h} scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECIPE_ROWS.map((r) => (
              <tr key={r.name} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '7px 10px', color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{r.category}</td>
                <td style={{ padding: '7px 10px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.name}</td>
                <td style={{ padding: '7px 10px', color: 'var(--text)' }}>{r.mix}</td>
                <td style={{ padding: '7px 10px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{swatch(r.hex)}{r.hex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        본 표는 일부 미리보기이며, 더 많은 레시피(테라코타·터쿼이즈·피치·플럼·아이보리 등)는 [레시피·색환] 탭에서 확인할 수 있습니다.
      </p>

      {/* 5. 분야별 가이드 */}
      <h2 className="g-h2">분야별 가이드 — 수채·아크릴·잉크·푸드컬러</h2>
      <ul className="g-list">
        <li><strong>수채화</strong> — 고전 4색 제한 팔레트(울트라마린·번트 시에나·옐로우 오커·알리자린 크림슨)로 자연색·뉴트럴 대부분 혼색 가능(선명한 초록·마젠타는 한계). 물 비율 ↑ → 투명. 두 번 이상 덧칠 시 진해짐.</li>
        <li><strong>아크릴</strong> — 6색 기본(티타늄 화이트·카본 블랙·카드뮴 옐로우·카드뮴 레드·울트라마린 블루·프탈로 그린). 건조 후 살짝 어두워지므로 한 톤 밝게 섞기.</li>
        <li><strong>유화</strong> — Zorn 4색 팔레트(옐로우 오커·카드뮴 레드(원전은 버밀리온)·아이보리 블랙·티타늄 화이트)로 인물·피부톤 가능 — 파랑 없이 차가운 블랙이 파랑 역할. 건조 수일 소요, 두꺼운 임파스토는 갈라짐 주의.</li>
        <li><strong>만년필 잉크</strong> — 같은 브랜드·같은 베이스(dye/pigment)끼리만. 다른 브랜드를 섞으면 침전·만년필 막힘 위험이 있으니 시린지로 별도 테스트 필수.</li>
        <li><strong>푸드컬러</strong> — 식약처 허가 식용 색소만. 타르색소는 식품 유형별 사용 가능 품목이 정해져 있습니다(예: 적색 제102호는 지정 품목 전용). 젤 타입이 색 진하고 반죽 묽어짐 적음. 액상은 1방울씩 추가, 30분 후 발색 확인(시간 지나며 진해짐).</li>
        <li><strong>레진·에폭시</strong> — 전용 마이카 파우더·레진 안료. 수성 물감은 수분이 경화 반응을 방해. 환기·장갑·고글 필수, 안료는 소량 원칙(제조사 권고 무게 0.5~3% 수준 우선).</li>
      </ul>

      {/* FAQ — 화면 목록과 FAQPage JSON-LD를 같은 배열에서 렌더 */}
      <Faq items={FAQ_LD} />

      {/* 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { href: '/tools/art/color', icon: '🎨', name: '색상 코드 변환기', desc: 'HEX·RGB·HSL·OKLCH·WCAG 대비비' },
          { href: '/tools/art/golden-ratio', icon: '🌀', name: '황금 비율 계산기', desc: 'φ = 1.618 디자인 비율' },
          { href: '/tools/unit/converter', icon: '📐', name: '단위 변환기', desc: 'ml·g·큰술·당도·농도 환산' },
          { href: '/tools/art/gradient-generator', icon: '🌈', name: '그라디언트 생성기', desc: 'CSS·OKLCH 보간 그라디언트' },
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
