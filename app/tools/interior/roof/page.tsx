import Link from 'next/link'
import RoofClient from './RoofClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { calcRoof, moemaeToDeg, uniformEaves, ROOF_MATERIALS } from './roofUtils'

export const metadata = buildMetadata({
  path: '/tools/interior/roof',
  title: '지붕 면적 계산기 — 박공(맞배)·모임·팔작·외쪽·평지붕 5가지 + 물매·처마·로스율',
  description: '박공(맞배)·모임·팔작·외쪽·평지붕 5가지 + 물매·경사각·처마·로스율 → 평면·표면·자재 면적과 자재별 일반 단가.',
  keywords: ['지붕 면적 계산기', '박공지붕 면적', '모임지붕', '외쪽지붕', '평지붕 방수 면적', '슁글 면적', '기와 면적', '물매 계산', '지붕 경사각', '처마 길이', '옥상 방수'],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}
const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}

/* ── 빌드 시 계산하는 가이드 수치 — roofUtils(계산기와 같은 함수) 사용 ── */
/* 계산기 기본값: 박공 10 × 8m · 4물매(21.8°) · 처마 사방 0.6m · 로스 10% */
const EX = calcRoof({ type: 'gable', L: 10, W: 8, pitchDeg: 21.8, eaves: uniformEaves(0.6), lossRate: 0.1 })
const EX_NO_EAVES = calcRoof({ type: 'gable', L: 10, W: 8, pitchDeg: 21.8, eaves: uniformEaves(0), lossRate: 0.1 })
const EX_6 = calcRoof({ type: 'gable', L: 10, W: 8, pitchDeg: moemaeToDeg(6), eaves: uniformEaves(0.6), lossRate: 0.1 })
/* 평지붕 방수 치켜올림 예시 — 10 × 8m 옥상, 파라펫 쪽으로 0.3m 올림 */
const FLAT_UPTURN = 2 * (10 + 8) * 0.3

const PITCH_ROWS = [
  { m: 1, n: '거의 평면 — 방수층 중심' },
  { m: 2, n: '저경사 — 겹침형 지붕재는 최소 경사 확인' },
  { m: 3, n: '완경사 단독주택' },
  { m: 4, n: '단독주택에서 흔한 범위' },
  { m: 5, n: '단독주택에서 흔한 범위' },
  { m: 6, n: '물·눈이 잘 흘러내리는 편' },
  { m: 7, n: '가파른 편 — 전통 지붕 등' },
  { m: 8, n: '가파름 — 작업 발판 필수' },
  { m: 10, n: '45° — 매우 가파름' },
].map(r => {
  const deg = moemaeToDeg(r.m)
  return { ...r, deg, factor: 1 / Math.cos(deg * Math.PI / 180) }
})

const f1 = (n: number) => n.toFixed(1)

const FAQ_LD = [
  { q: '박공지붕과 맞배지붕 차이는?', a: '<strong>같은 형태</strong>입니다. 맞배지붕은 박공지붕(gable)을 부르는 우리말 이름으로, 두 사면이 용마루에서 만나 옆에서 보면 ㅅ자 단면이 됩니다. 한옥에는 맞배 외에도 팔작지붕과 우진각지붕(모임지붕)이 흔하며, 이 계산기는 경사형 지붕을 모두 같은 공식(처마 포함 평면 × 경사 배율)으로 계산하므로 형태보다 치수·물매·처마 입력이 결과를 좌우합니다.' },
  { q: '물매가 뭔가요? 경사각과 어떻게 다른가요?', a: '물매는 <strong>수평 10에 대한 수직 높이</strong>로 경사를 나타내는 표기입니다. 4물매는 수평으로 10cm 갈 때 4cm 올라간다는 뜻이고, 경사각으로는 tan⁻¹(4/10) ≈ 21.8°입니다. 3물매 ≈ 16.7°, 5물매 ≈ 26.6°, 6물매 ≈ 31.0°입니다. 계산기에서는 물매와 경사각 중 편한 쪽으로 입력하면 다른 쪽이 자동으로 환산됩니다.' },
  { q: '처마 길이는 어떻게 정하나요?', a: '단독주택에서는 <strong>60~90cm</strong> 정도가 흔히 쓰입니다. 30cm 미만으로 짧으면 외벽과 창이 비·햇빛에 직접 노출되고, 1m를 넘기면 차양 효과는 커지지만 바람을 많이 받고 건축면적 산정에도 영향이 생깁니다. 앞·뒤와 좌·우 처마가 다른 집이 많으니 계산기의 <strong>4면 개별 입력</strong>을 쓰세요.' },
  { q: '로스율은 몇 %로 잡아야 하나요?', a: '자재를 자르고 겹치는 과정에서 자투리·교체분이 생깁니다. 대략 ① 외쪽·박공처럼 단순한 형태와 숙련 시공은 <strong>5~10%</strong> ② 대부분의 경우 <strong>10~15%</strong> ③ 모임·팔작지붕처럼 골(밸리)과 추녀가 많은 형태는 <strong>15~20%</strong>입니다. 계산기 기본값은 10%이고 지붕 형태를 바꿔도 자동으로 바뀌지 않으니 직접 조정하세요. 슁글·기와는 나중에 추가 주문하면 생산 로트가 달라 색이 어긋날 수 있어 처음에 넉넉히 사는 편이 낫습니다.' },
  { q: '옥상 방수 면적은 어떻게 계산하나요?', a: '평지붕을 고르면 처마는 자동으로 0이 되고 경사 배율도 1이라 <strong>바닥(가로 × 세로) 면적 = 방수 면적</strong>으로 계산됩니다. 다만 방수층은 난간벽(파라펫) 쪽으로 30cm 안팎 치켜올려 시공하므로 <strong>둘레 × 올림 높이</strong>를 더해야 합니다. 우레탄 도막 방수의 일반 단가는 ㎡당 25,000~50,000원 범위입니다.' },
  { q: '슁글·기와·금속 패널 중 무엇을 고르나요?', a: '용도·예산·디자인에 따라 다르며 이 계산기는 특정 제품을 추천하지 않습니다. ① <strong>아스팔트 슁글</strong>은 가볍고 시공이 쉬워 가장 흔합니다 ② <strong>시멘트·점토 기와</strong>는 무겁고 내구성이 높아 구조 검토가 필요합니다 ③ <strong>금속 패널</strong>(칼라강판·징크)은 가볍고 내구성이 높지만 빗소리와 단열 보강을 고려해야 합니다. 기존 지붕보다 무거운 자재로 바꿀 때는 건축사·구조 전문가 검토를 받으세요.' },
  { q: '처마를 길게 내면 건축면적(건폐율)에 들어가나요?', a: '들어갈 수 있습니다. 「건축법 시행령」 제119조(면적 등의 산정방법)는 처마·차양 등이 <strong>외벽 중심선에서 수평거리 1m 이상</strong> 튀어나오면, 그 끝에서 1m(한옥은 2m) 후퇴한 선까지를 건축면적으로 봅니다. 외벽 중심선에서 1.2m 나온 처마라면 약 0.2m가 건축면적에 잡혀 건폐율 계산에 영향을 줍니다. 계산기의 처마 값은 외벽 <strong>면</strong>에서 잰 거리라 법령 기준보다 벽 두께의 절반만큼 짧으므로, 계산기에 1.2m를 넣은 집이라면 실제 산입 폭은 0.2m보다 조금 큽니다. 신축·증축 설계라면 건축사와 먼저 확인하세요. 이 계산기의 처마 입력은 지붕 자재 면적용이며 건축면적을 계산하지 않습니다.' },
  { q: '오래된 슬레이트 지붕을 교체할 때 주의할 점은?', a: '예전 슬레이트는 <strong>석면</strong>이 들어간 경우가 많아 일반 철거와 다르게 다뤄야 합니다. 「산업안전보건법」은 석면이 든 자재가 일정 규모 이상이면 고용노동부에 등록한 <strong>석면해체·제거업자</strong>가 해체하도록 정하고 있고, 그보다 작더라도 부수거나 자르지 말고 물을 뿌려 통째로 떼어 낸 뒤 밀봉해 정해진 방법으로 처리해야 합니다. 지자체마다 슬레이트 철거·처리 비용을 지원하는 사업이 있으니 공사 전에 시·군·구청에 문의하세요. 슬레이트 위는 발이 빠지기 쉬워 추락 사고가 잦으므로 절대 맨몸으로 올라가지 마세요.' },
  { q: '태양광 패널 설치 면적도 계산되나요?', a: '이 계산기는 지붕 전체 면적만 계산합니다. 태양광은 남향에 가까운 면만 효율이 좋고, 경사·방위각이 발전량을 좌우하며, 패널 무게에 맞춘 구조 검토와 인버터·배선이 따로 필요합니다. 발전량 추정과 설치 가능 여부는 태양광 시공업체나 한국에너지공단 안내를 참고하세요.' },
  { q: '셀프 시공 가능한가요?', a: '<strong>전체 시공은 권하지 않습니다.</strong> 지붕은 추락 위험이 큰 고소작업이고, 방수를 잘못하면 누수로 구조물이 상합니다. 사업장에 요구되는 안전설비는 이 페이지의 &lsquo;지붕은 고소작업입니다&rsquo; 안내를 참고하세요. 슁글 몇 장 교체 같은 단순 보수라도 비·바람·서리가 없는 날, 2인 이상, 안전대를 걸 튼튼한 고정점을 확보한 상태에서만 하세요. 사고 시 119에 신고하세요.' },
]

export default function RoofPage() {
  return (
    <ToolPage width={880} slug="/tools/interior/roof">
      <h1 className="tp-h1">
        <ToolIconBadge catId="interior" />지붕 면적 계산기
      </h1>
      <p className="tp-lead">
        박공(맞배)·모임·팔작·외쪽·평지붕 5가지 + 물매·처마·로스율 → <strong style={{ color: 'var(--text)' }}>자재 면적과 단가</strong>.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="물매 = 수평 10 대비 수직 높이(tanθ × 10) · 표면적 = 처마 포함 평면 × 1/cosθ(모든 면이 같은 경사일 때) · 처마 건축면적 산입은 건축법 시행령 제119조 · 자재 단가는 흔히 안내되는 대략적 범위(견적 시 재확인)"
        sources={[
          { label: '국가법령정보센터 — 건축법 시행령(면적 등의 산정방법)', href: 'https://www.law.go.kr/법령/건축법시행령' },
          { label: '국가법령정보센터 — 산업안전보건기준에 관한 규칙(지붕 위 위험 방지)', href: 'https://www.law.go.kr/법령/산업안전보건기준에관한규칙' },
          { label: '국가법령정보센터 — 산업안전보건법(석면해체·제거업)', href: 'https://www.law.go.kr/법령/산업안전보건법' },
          { label: '한국산업안전보건공단(KOSHA)', href: 'https://www.kosha.or.kr' },
        ]}
      />

      <RoofClient />

      <GuideDivider />

      {/* 1. 5가지 지붕 형태 비교 */}
      <h2 className="g-h2">5가지 지붕 형태 비교</h2>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>형태</th>
              <th scope="col" style={headCell}>특징</th>
              <th scope="col" style={headCell}>장점</th>
              <th scope="col" style={headCell}>주 사용처</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}><strong>박공지붕</strong></td>
              <td style={cell}>두 사면이 용마루에서 만나는 ㅅ자 단면 (맞배지붕과 같은 형태)</td>
              <td style={cell}>시공 단순·저렴</td>
              <td style={cell}>단독주택 (가장 흔함)</td>
            </tr>
            <tr>
              <td style={cell}><strong>모임지붕</strong></td>
              <td style={cell}>4사면 + 정점</td>
              <td style={cell}>풍압에 강함·외관 안정</td>
              <td style={cell}>전원주택·고급 주택</td>
            </tr>
            <tr>
              <td style={cell}><strong>외쪽지붕</strong></td>
              <td style={cell}>한 사면만 경사</td>
              <td style={cell}>가장 단순·자투리 적음</td>
              <td style={cell}>창고·증축·모던 주택</td>
            </tr>
            <tr>
              <td style={cell}><strong>평지붕</strong></td>
              <td style={cell}>거의 평면 (배수 구배만)</td>
              <td style={cell}>옥상 활용 가능</td>
              <td style={cell}>아파트·옥탑·도심 주택</td>
            </tr>
            <tr>
              <td style={cell}><strong>팔작지붕</strong></td>
              <td style={cell}>모임지붕 위쪽에 박공 삼각면을 얹은 형태</td>
              <td style={cell}>깊은 처마·여름 그늘·전통미</td>
              <td style={cell}>한옥·사찰·전통 건축</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. 계산 원리 */}
      <h2 className="g-h2">지붕 면적 계산 원리 — 처마 포함 평면 × 경사 배율</h2>
      <p className="g-p">
        비스듬한 지붕면의 실제 넓이는 위에서 내려다본 넓이(평면 면적)를 경사각의 코사인으로 나눈 값입니다. 모든 면의 경사가 같다면 박공·모임·팔작지붕 어느 형태든 면마다 이 관계가 성립하므로, 면을 하나하나 나누지 않고 <strong>처마까지 포함한 평면 전체 × 1/cosθ</strong>로 한 번에 구할 수 있습니다. 계산기도 이 방식으로 표면적을 구한 뒤 로스율을 곱해 자재 구매 면적을 냅니다. 평지붕은 경사 배율을 1로 봅니다.
      </p>
      <p className="g-p">
        계산기 기본값인 가로 10m × 세로 8m 박공지붕, 4물매, 처마 사방 0.6m로 따라가 보면, 처마를 더한 평면은 {f1(EX.L_total)} × {f1(EX.W_total)} = <strong>{f1(EX.planArea)}㎡</strong>입니다. 여기에 4물매의 경사 배율 {EX.pitchFactor.toFixed(3)}를 곱하면 실제 지붕 표면은 <strong>{f1(EX.surfaceArea)}㎡</strong>({f1(EX.surfacePyeong)}평), 로스 10%를 더한 자재 면적은 <strong>{f1(EX.materialArea)}㎡</strong>가 됩니다.
      </p>
      <p className="g-p">
        이 예시에서 눈여겨볼 점은 처마의 비중입니다. 처마 없이 벽체 치수만 넣으면 표면적이 {f1(EX_NO_EAVES.surfaceArea)}㎡로, 처마 0.6m가 평면 면적을 {Math.round(EX.eavesImpact)}%나 늘립니다. 반면 같은 집을 6물매로 가파르게 해도 표면적은 {f1(EX_6.surfaceArea)}㎡로 약 {Math.round((EX_6.surfaceArea / EX.surfaceArea - 1) * 100)}% 늘어나는 데 그칩니다. 실측할 때 경사보다 처마 길이를 더 정확히 재야 하는 이유입니다. 앞뒤 면과 옆면의 경사가 서로 다른 지붕이라면 면별로 나눠 계산해 더하세요.
      </p>

      {/* 3. 물매 ↔ 경사각 변환 */}
      <h2 className="g-h2">물매 ↔ 경사각 변환표</h2>
      <p className="g-p">
        물매는 수평 10에 대한 수직 높이의 비율로, 경사각 θ와는 <strong>물매 = tanθ × 10</strong> 관계입니다. 경사 배율(1/cosθ)은 같은 평면을 덮는 데 자재가 몇 배 드는지를 뜻합니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>물매</th>
              <th scope="col" style={headCell}>경사각</th>
              <th scope="col" style={headCell}>경사 배율 (자재 면적/평면)</th>
              <th scope="col" style={headCell}>특징</th>
            </tr>
          </thead>
          <tbody>
            {PITCH_ROWS.map(r => (
              <tr key={r.m}>
                <td style={{ ...cell, color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.m}물매</td>
                <td style={{ ...cell, fontFamily: 'var(--font-sans)' }}>{r.deg.toFixed(1)}°</td>
                <td style={{ ...cell, fontFamily: 'var(--font-sans)' }}>×{r.factor.toFixed(3)}</td>
                <td style={{ ...cell, color: 'var(--muted)' }}>{r.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        슁글·기와처럼 조각을 겹쳐 잇는 지붕재는 경사가 낮을수록 빗물이 겹친 틈으로 거꾸로 스며들기 쉬워 제품마다 최소 경사가 정해져 있습니다. 예를 들어 미국 국제주거건축기준(IRC)은 아스팔트 슁글의 최소 경사를 2/12(약 1.7물매)로 두고, 4/12(약 3.3물매) 미만에서는 방수시트를 두 겹 깔도록 합니다. 3물매 안팎의 완경사 지붕이라면 자재를 고르기 전에 제조사 시공 지침의 최소 경사부터 확인하세요.
      </p>

      {/* 4. 처마 */}
      <h2 className="g-h2">처마 길이와 건축면적</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        {[
          { len: '0~30cm', use: '최소 (모던 주택·창고)', color: 'var(--cyan-600)' },
          { len: '60~90cm', use: '단독주택에서 흔한 범위', color: 'var(--emerald-600)' },
          { len: '90cm~1.2m', use: '여유 (햇빛 차단·차양)', color: 'var(--yellow-700)' },
          { len: '1.2m+', use: '한옥·전통 (긴 처마)', color: 'var(--orange-600)' },
        ].map((p, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${p.color}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
            <p style={{ fontSize: '16px', color: p.color, fontWeight: 700, marginBottom: '4px', fontFamily: 'var(--font-sans)' }}>{p.len}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{p.use}</p>
          </div>
        ))}
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        처마는 장식이 아니라 여름 햇빛을 가리고 빗물을 외벽에서 멀리 떨어뜨려 벽체와 창틀을 보호하는 장치입니다. 다만 길게 뽑을수록 바람을 받는 면이 커지고, 외벽 중심선에서 1m 이상 나오면 건축면적 산정에도 걸립니다(산입 기준은 아래 FAQ 참고).
      </p>
      <Callout tone="tip" title="처마 입력 팁">
        계산기의 처마 값은 외벽에서 처마 끝까지의 수평 거리입니다. 경사를 따라 잰 길이가 아니므로, 사다리에서 처마 밑면을 따라 재거나 도면의 평면 치수를 쓰세요. 앞·뒤와 좌·우 처마가 다르면 4면 개별 입력을 켜면 됩니다.
      </Callout>

      {/* 5. 자재 일반 단가 */}
      <h2 className="g-h2">지붕재·방수재 일반 단가 가이드</h2>
      <p className="g-p">
        아래 단가는 계산기 [자재 견적] 탭이 쓰는 값과 같은 <strong>2026년 기준 일반 가격 범위</strong>로, 특정 브랜드·판매처 기준이 아닙니다. 자재·지역·시즌·구매처에 따라 30% 이상 달라질 수 있고, 인건비·운반비·부속자재(용마루·후레싱·물받이)·철거비는 포함되지 않습니다. 발주 전에는 <Link href="/tools/life/unit-price">단가 비교 계산기</Link>와 시공사 견적으로 확인하세요.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>자재</th>
              <th scope="col" style={headCell}>구분</th>
              <th scope="col" style={headCell}>일반 단가 (원/㎡)</th>
              <th scope="col" style={headCell}>특징</th>
            </tr>
          </thead>
          <tbody>
            {ROOF_MATERIALS.map(m => (
              <tr key={m.key}>
                <td style={cell}><strong>{m.name}</strong></td>
                <td style={{ ...cell, color: 'var(--muted)' }}>{m.category}</td>
                <td style={{ ...cell, fontFamily: 'var(--font-sans)' }}>{m.priceMin.toLocaleString('ko-KR')}~{m.priceMax.toLocaleString('ko-KR')}</td>
                <td style={cell}>{m.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        평지붕 옥상 방수는 바닥만이 아니라 난간벽 쪽으로 방수층을 30cm 안팎 치켜올리므로, 계산기의 평면 면적에 <strong>둘레 × 올림 높이</strong>를 더해 물량을 잡으세요. 10 × 8m 옥상이라면 둘레 36m × 0.3m = {f1(FLAT_UPTURN)}㎡가 늘어납니다. 견적서끼리 비교할 때는 단가보다 &lsquo;포함 항목&rsquo;을 먼저 맞추는 것이 중요합니다.
      </p>

      {/* 6. 지붕 시공 실무 가이드 */}
      <h2 className="g-h2">지붕 시공 실무 가이드 — 순서와 접합부</h2>
      <p className="g-p">
        지붕 공사에서는 자재 물량만큼 <strong>시공 순서와 접합부 디테일</strong>이 결과를 좌우합니다. 견적을 받거나 공사를 지켜볼 때 확인할 포인트를 정리했습니다.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          { t: '작업 시기', d: '봄·가을의 건조하고 바람 적은 날이 최적입니다. 장마철·혹서기·한겨울은 피하고 아침 이슬이 마른 뒤 시작하세요. 슁글은 기온이 너무 낮으면 깨지기 쉽고, 너무 높으면 밟은 자국이 남습니다.' },
          { t: '실측·물량 산출', d: '도면보다 현장 실측이 우선입니다 — 처마·물매·돌출부까지 반영하면 도면 대비 ±5~10% 차이가 납니다. 슁글·기와는 같은 로트(생산번호)로 한 번에 주문해 색상 편차를 막고, 부족분 추가 주문은 색이 달라지므로 로스율을 넉넉히 잡습니다.' },
          { t: '시공 순서', d: '① 기존 마감재 철거 → ② 합판(OSB) 데크 점검·썩은 부분 교체 → ③ 방수시트(루핑)를 처마 쪽부터 위로 10cm 이상 겹쳐 깔기 → ④ 드립 엣지(처마·박공 끝 물끊기) → ⑤ 마감재를 처마(하단)부터 용마루 방향으로 → ⑥ 용마루·후레싱 마감 → ⑦ 물받이(거터) 설치.' },
          { t: '누수는 자재보다 접합부', d: '누수 대부분은 자재가 아니라 접합부에서 생깁니다. 굴뚝·천창·환기구 주변, 골(밸리), 벽과 만나는 부위는 반드시 후레싱(금속 물막이)으로 처리하세요. 못은 슁글의 접착선 위 정해진 위치에만 박고(과타 금지), 못 머리가 노출되면 실런트로 마감합니다.' },
          { t: '환기·결로 관리', d: '처마 흡기구 + 용마루 배기구로 지붕 속 공기가 흐르게 해야 여름 열기와 겨울 결로를 막습니다. 환기가 막히면 단열재가 젖고 데크가 썩습니다.' },
          { t: '철거·폐기물 비용', d: '기존 지붕재 철거물은 양이 많아(슁글은 ㎡당 약 10~20kg, 기와는 그 두세 배) 처리·운반비가 별도로 큽니다. 견적 받을 때 "철거·폐기물 처리 포함 여부"를 꼭 확인하세요. 석면 슬레이트는 일반 폐기물로 처리할 수 없습니다.' },
        ].map((g, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>{g.t}</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>{g.d}</p>
          </div>
        ))}
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        계산 결과는 일반 가이드 수준이라 실제 견적과 10~30% 차이가 날 수 있습니다. 도면과 실측의 차이, 자재 단가의 지역·시즌 편차, 인건비·운반비·부속자재, 철거·기존 자재 처분, 천창·돌출부 같은 복잡한 형태가 모두 금액을 바꿉니다. 이 계산기의 표면적과 자재 면적은 견적서의 물량이 적정한지 가늠하는 기준값으로 쓰세요.
      </p>
      <Callout tone="warn" title="지붕은 고소작업입니다">
        「산업안전보건기준에 관한 규칙」 제45조(지붕 위에서의 위험 방지)는 지붕 위 작업 시 가장자리 안전난간, 채광창 덮개, 슬레이트처럼 약한 지붕에서는 폭 30cm 이상 발판을 두고, 난간이 어려우면 추락방호망이나 안전대를 쓰도록 정합니다. 2층 이상·급경사·복잡한 형태는 비계와 안전 설비를 갖춘 전문 시공을 권하며, 공사를 맡길 때도 이런 설비가 견적에 들어 있는지 확인하세요.
      </Callout>

      {/* FAQ */}
      <Faq items={FAQ_LD} />

      {/* 면책 */}
      <Disclaimer variant="safety" open>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li>본 도구는 <strong>일반 면적 계산 가이드</strong>입니다. 도면 vs 실측 ±5~10% 차이 가능.</li>
          <li>자재 단가는 일반 가격 범위 — 실제 ±30% 변동. 정확한 가격은 단가 비교·시공사 견적.</li>
          <li>본 도구는 <strong>특정 브랜드·시공사 추천 X · 구조 안전 보장 X · 시공 가이드 X · 태양광 발전량 X · 단열/방습 진단 X</strong>.</li>
          <li>지붕 작업은 고소작업 — 전문가 시공 강력 권장. 셀프 작업 시 안전대·안전모 필수. 응급 <strong>119</strong>.</li>
          <li>도움: 한국건설기술연구원 · 대한건축사협회 · 가까운 건축사사무소·시공사 견적.</li>
        </ul>
      </Disclaimer>

      {/* 함께 쓰면 좋은 도구 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/interior/room-area" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📐</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>공간 면적 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>실내 벽·바닥·천장</div>
        </Link>
        <Link href="/tools/interior/paint" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎨</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>페인트 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>지붕 도장 시</div>
        </Link>
        <Link href="/tools/interior/wallpaper" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🧱</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>도배 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>벽지 롤 수</div>
        </Link>
        <Link href="/tools/interior/flooring" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🪵</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>바닥재 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>장판·마루·타일</div>
        </Link>
        <Link href="/tools/interior/molding" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📏</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>몰딩 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>천장·바닥 몰딩</div>
        </Link>
        <Link href="/tools/life/unit-price" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏷️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>단가 비교 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>자재 가격 비교</div>
        </Link>
      </div>
    </ToolPage>
  )
}
