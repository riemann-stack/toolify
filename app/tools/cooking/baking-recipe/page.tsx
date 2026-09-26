import Link from 'next/link'
import BakingRecipeClient from './BakingRecipeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/cooking/baking-recipe',
  title: '제과 레시피 계산기 — 마들렌·파운드·머핀 비율·분량 변환 + 케이크 팬 호수',
  description: '마들렌·파운드·쿠키·머핀·마카롱 등 제과 10종 비율 자동 + 식감 보정·틀 용량 분량 변환·프리셋 19종. 케이크 팬 탭에서 호수(1호 15cm~)↔cm↔인치, 원형·사각·무스링 부피 기준 레시피 배율과 인원·굽기 보정까지.',
  keywords: ['제과 레시피 계산기', '마들렌 황금비율', '파운드케이크 1:1:1:1', '쿠키 비율', '머핀 비율', '마카롱 비율', '제과 비율', '베이킹 분량 변환', '베이킹 비율 진단', '홈베이킹 계산기',
    '케이크 팬 호수', '케이크 1호 크기', '2호 케이크 사이즈', '베이킹 틀 변환', '레시피 배율 계산', '제누와즈 틀 크기', '무스링 사이즈', '케이크 호수별 인원'],
})

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
const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-m)',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text)',
  padding: '4px 0',
}
const faqAnswer: React.CSSProperties = {
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px solid var(--border)',
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
}

const FAQ_LD = [
  { "q":"마들렌 황금비율이 정확히 뭔가요?","a":"가장 클래식한 마들렌 비율: 계란 : 설탕 : 밀가루 : 버터 = 1 : 1 : 1 : 1 + 베이킹파우더 3%, 꿀 10%. 계란 100g 기준 → 설탕 100g · 밀가루 100g · 버터 95~100g · BP 3g · 꿀 10g. 변형: 브라운 버터(버터 110% + 꿀 12%), 레몬(레몬 제스트 5%), 초코(코코아 가루 10% + 우유 10%). 본 도구의 마들렌 모드 + 식감 보정 버튼을 활용하세요." },
  { "q":"1:1:1:1 파운드케이크가 정말 균형 잡힌 비율인가요?","a":"르 코르동 블루 등 클래식 학교의 표준입니다: 버터 : 설탕 : 계란 : 밀가루 = 1 : 1 : 1 : 1 + 베이킹파우더 2%. 균형 잡힌 풍미·식감, 외우기 쉽고 안정적인 결과가 장점입니다. 한국 입맛에는 설탕 80%로 줄이거나, 사워크림 +20%/우유 +10%로 촉촉하게, 버터 110% + 아몬드 가루 +10%로 묵직하게 변형할 수 있어요." },
  { "q":"쿠키가 너무 퍼지는데 어떻게 하나요?","a":"본 도구의 비율 진단을 활용하세요. 원인은 보통 버터 비율 70% 이상, 백설탕 과다, 베이킹소다 과다, 반죽 온도 높음, 오븐 온도 낮음입니다. 해결책: ① 냉장 휴지 30분~1시간(필수) ② 황설탕 비율 ↑ ③ 밀가루 +5~10% ④ 베이킹소다 ↓ → 베이킹파우더로 일부 대체 ⑤ 오븐 175~190°C 충분히 예열 ⑥ 차가운 반죽으로 굽기." },
  { "q":"본 도구와 베이커 퍼센트 도구는 어떻게 다른가요?","a":"두 도구는 영역이 다릅니다. 🍞 베이커 퍼센트 계산기는 빵 전용으로, 밀가루 100% 기준에 발효 시간·반죽 온도·이스트·발효종 중심입니다. 🧁 제과 레시피 계산기(본 도구)는 제과 전용으로, 품목별 자동 기준(계란·버터·흰자 등)에 비율 진단·식감 보정·굽기 중심입니다. 빵을 만들면 베이커 퍼센트, 디저트를 만들면 본 도구를 쓰세요." },
  { "q":"틀이 다른데 같은 레시피를 사용 가능한가요?","a":"본 도구의 &ldquo;분량 변환&rdquo; 탭을 활용하세요. 예: 표준 파운드틀(20×8×7, 반죽 약 470g) 레시피를 소형 파운드틀(15×6×6, 약 230g) 2개로 나누면 ×0.98 (230×2=460g/470g). 원형 케이크틀은 호수·높이에 따라 부피가 달라지니 &ldquo;케이크 팬&rdquo; 탭에서 두 팬의 지름·높이로 부피 배율을 구하세요. 사각팬은 판매처마다 자체 호수 체계를 써서 같은 &lsquo;1호&rsquo;가 13.5cm인 곳도 14.5cm인 곳도 있고, 파운드(오란다)팬의 &lsquo;대/중/소&rsquo;는 판매처마다 전혀 다른 실물을 가리켜 표준 규격이 없습니다 — 이런 틀은 자로 잰 가로×세로×높이를 &ldquo;케이크 팬&rdquo; 탭의 사각 입력에 넣는 게 가장 정확합니다. 다만 ① 굽는 시간은 별도 조정(작을수록 ↓·클수록 ↑) ② 마카롱·머랭처럼 민감한 품목은 신중히 환산해야 합니다." },
  { "q":"알레르기가 있어도 본 도구 결과를 사용해도 되나요?","a":"본 도구는 일반 가이드입니다. 알레르기 환자는 라벨 확인 필수이며, 의사·영양사 상담 후 진행하세요. 대체 가이드(참고용): 계란 → 아쿠아파바·플랙스에그 / 우유 → 두유·아몬드밀크 / 밀(글루텐) → 쌀가루·아몬드 가루 / 견과(아몬드) → 코코넛 가루 / 버터 → 코코넛 오일·식물성 유지. ※ 이 대체 재료들은 계산기에서 직접 고르는 입력 항목이 아닙니다. 먼저 원래 재료(계란·우유·버터 등)의 무게를 계산기로 구한 뒤, 같은 g만큼 대체 재료로 바꿔 쓰세요. 예: 계산 결과 계란 50g → 아쿠아파바 50g, 우유 80g → 두유 80g. 단, 대체 시 식감이 크게 변할 수 있고, 본 도구의 결과로 자가 진단·자가 처방은 금물입니다. 영아·어린이 첫 시도는 의사와 상담 후 소량부터, 응급 약(에피펜 등)을 준비하세요." },
  { "q":"굽는 시간이 권장보다 모자란데 더 구워야 하나요?","a":"가정용 오븐은 표시 온도와 실제 온도 차이가 ±20°C까지 납니다. 권장 시간 -1분 후 한 번 열어보고 ① 표면 색 ② 가운데 살짝 통통 ③ 이쑤시개로 찔러 묻어나는 정도를 종합 판단하세요. 마들렌·머핀은 살짝 부족하게 굽는 게 촉촉하고, 쿠키는 가운데가 약간 무른 상태에서 꺼내면 식으면서 완벽해집니다. 오븐 온도계를 따로 두면 자기 오븐의 편차를 알 수 있어요." },
  // ── 케이크 팬 탭 (구 /tools/cooking/cake-pan FAQ 흡수 — '호수별 인분'은 1호 문항에, '파운드·사각팬 호수'는 Q5에 합침) ──
  { "q":"케이크 1호는 몇 cm이고, 호수별로 몇 인분인가요?","a":"한국 원형 케이크 팬 기준 <strong>1호 = 지름 15cm</strong>이고, 호수가 1 오를 때마다 지름이 3cm씩 커집니다(2호 18cm, 3호 21cm, 4호 24cm, 5호 27cm). 미니는 판매처에 따라 11.3~12cm로 약간 편차가 있어요. 참고로 제과점의 완성 케이크는 아이싱 두께 때문에 1호를 16cm로 표기하는 곳도 있으니, 팬 기준인지 완성 케이크 기준인지 구분해야 합니다. 인원은 케이크샵 관행 기준 <strong>미니(12cm) 1~2인, 1호 2~3인, 2호 4~5인, 3호 6~8인, 4호 8~12인</strong> 정도로 안내되지만, 가게마다 표기가 크게 다릅니다(1호를 4~6인분으로 쓰는 곳도 있어요). 식사 후 디저트로 먹는 자리라면 한 치수 작게 잡아도 충분하다는 팁이 커뮤니티 공통 조언입니다." },
  { "q":"1호 레시피를 2호로 바꾸면 재료를 몇 배 해야 하나요?","a":"같은 높이의 팬이라면 <strong>(지름비)² = (18÷15)² = 1.44배</strong>입니다. 커뮤니티에서는 계산 편의상 &lsquo;1.5배&rsquo;로 반올림해 쓰는 관행이 널리 퍼져 있어요(2호→3호도 1.36배지만 1.5배로 통용). 높이가 다른 팬으로 옮길 때는 <strong>(지름비)² × (높이비)</strong>를 곱해야 합니다 — 예를 들어 무스링(높이 5cm) 레시피를 높은팬(7cm)으로 옮기면 1.4배가 추가로 붙어요. 계산기의 &ldquo;케이크 팬&rdquo; 탭이 정확값과 통용 반올림을 함께 보여줍니다." },
  { "q":"높은팬과 일반팬은 뭐가 다른가요?","a":"한국 원형 팬은 <strong>일반팬 높이 4.5cm / 높은팬 7cm</strong>의 이원 체계로 판매됩니다. 제누와즈(스펀지 시트)를 구워 생크림 케이크를 만들 때는 높은팬 7cm가 사실상 표준이에요. 무스링은 지름 체계(1호 15cm~)는 같지만 높이 5cm가 표준이라, 같은 &lsquo;2호&rsquo;라도 팬 종류에 따라 부피가 최대 1.5배 이상 차이 납니다. 배율 계산에 높이가 꼭 들어가야 하는 이유입니다." },
  { "q":"미국 레시피의 6인치·8인치 팬은 몇 호인가요?","a":"<strong>6인치(15.2cm)≈1호, 7인치(17.8cm)≈2호</strong>는 오차 0.3cm 이내로 사실상 같습니다. <strong>8인치(20.3cm)는 3호(21cm)보다 0.7cm 작고, 9인치(22.9cm)는 약 3.6호</strong>로 정확히 대응하는 호수가 없어요. 또 미국 표준 케이크팬은 높이 2인치(5cm)로 한국 높은팬(7cm)과 다르고, 미국 레시피는 8~9인치 팬 2개(2단)를 쓰는 경우가 많아 단순 지름 비교만으로 환산하면 어긋납니다 — &ldquo;케이크 팬&rdquo; 탭에 실제 치수를 넣는 게 정확합니다." },
  { "q":"팬을 키우면 굽는 시간·온도는 어떻게 바꾸나요?","a":"공식적인 정량 규칙은 없습니다. 확실한 것은 <strong>시간을 배율만큼 비례 계산하면 안 된다</strong>는 점이에요 — 굽는 시간은 반죽 양이 아니라 두께에 좌우됩니다. 통용 관행은 팬이 커지거나 깊어지면 온도를 조금 낮추고 시간을 5분 단위로 늘려가며 <strong>꼬치 테스트</strong>(중앙에 찔러 반죽이 안 묻어나면 완료)로 판정하는 것. 실측 사례로 2호 제누와즈 170℃ 30~35분이 3호에서 약 40분 정도였습니다." }
]

export default function BakingRecipePage() {
  return (
    <ToolPage width={880} slug="/tools/cooking/baking-recipe">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />제과 레시피 계산기
      </h1>
      <p className="tp-lead">
        마들렌·파운드·쿠키·머핀·마카롱 등 <strong style={{ color: 'var(--text)' }}>10종 비율 자동</strong> + 식감 보정·틀 용량 환산.
      </p>

      <BakingRecipeClient />

      <GuideDivider />

      {/* 1. 품목별 황금비율 가이드 */}
      <h2 style={sectionTitle}>📐 품목별 황금비율 가이드</h2>
      <p className="g-p">
        제과는 품목마다 기준 재료가 다릅니다. 빵은 밀가루 100%(베이커 퍼센트)지만, 마들렌은 계란 100%, 파운드는 버터 100%처럼 직관적인 기준을 사용합니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>품목</th>
              <th scope="col" style={headCell}>기준</th>
              <th scope="col" style={headCell}>황금비율</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>🐚 마들렌</td><td style={cell}>계란 100%</td><td style={cell}>설탕·밀가루·버터 = 1:1:1:1 + BP 3% + 꿀 10%</td></tr>
            <tr><td style={cell}>🍰 파운드케이크</td><td style={cell}>버터 100%</td><td style={cell}>설탕·계란·밀가루 = 1:1:1:1 + BP 2%</td></tr>
            <tr><td style={cell}>🍪 쿠키</td><td style={cell}>밀가루 100%</td><td style={cell}>버터 50~80%, 설탕 60~90%, 계란 30%</td></tr>
            <tr><td style={cell}>🧁 머핀</td><td style={cell}>밀가루 100%</td><td style={cell}>설탕 70%, 우유 80%, 오일 50%, 계란 50%, BP 4%</td></tr>
            <tr><td style={cell}>🥮 마카롱</td><td style={cell}>흰자 100%</td><td style={cell}>아몬드가루·슈가파우더 130%, 설탕 100%</td></tr>
            <tr><td style={cell}>🥐 스콘</td><td style={cell}>밀가루 100%</td><td style={cell}>버터 25~50%, 설탕 15%, 우유 50%, BP 4%</td></tr>
            <tr><td style={cell}>🟫 휘낭시에</td><td style={cell}>흰자 100%</td><td style={cell}>아몬드 80%, 슈가파우더 100%, 브라운버터 90%</td></tr>
            <tr><td style={cell}>🟨 카스테라</td><td style={cell}>계란 100%</td><td style={cell}>설탕 70%, 강력분 45%, 꿀 15%, 미즈아메 5%</td></tr>
            <tr><td style={cell}>🍫 브라우니</td><td style={cell}>초콜릿 100%</td><td style={cell}>버터 100%, 설탕 100%, 계란 50%, 밀가루 30~50%</td></tr>
            <tr><td style={cell}>🍮 커스터드</td><td style={cell}>우유 100%</td><td style={cell}>노른자 15%, 설탕 20%, 옥수수전분 6%</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 본 도구는 품목 선택만으로 위 황금비율을 자동 입력합니다. 식감 보정 버튼으로 식감을 즉시 조정할 수도 있어요.
      </p>

      {/* 2. 비율 진단 가이드 */}
      <h2 style={sectionTitle}>🔍 비율 진단 가이드 — 어떤 재료가 어떤 식감을 만드나</h2>
      <p className="g-p">
        같은 품목이라도 비율이 5~10%만 달라져도 식감이 크게 바뀝니다. 본 도구의 &ldquo;비율 진단&rdquo; 탭은 입력값을 분석해 식감과 풍미를 미리 예측합니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>재료</th>
              <th scope="col" style={headCell}>↑ 많아질 때</th>
              <th scope="col" style={headCell}>↓ 적어질 때</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>설탕</strong></td><td style={cell}>단맛 ↑ · 갈변 빠름 · 퍼짐 ↑</td><td style={cell}>식감 푸석 · 보존성 ↓</td></tr>
            <tr><td style={cell}><strong>버터</strong></td><td style={cell}>풍미 ↑ · 식감 묵직 · (쿠키) 퍼짐 ↑</td><td style={cell}>식감 가벼움 · 풍미 ↓</td></tr>
            <tr><td style={cell}><strong>밀가루</strong></td><td style={cell}>구조 ↑ · 푸석 가능</td><td style={cell}>fudgy/촉촉 · 무너지기 쉬움</td></tr>
            <tr><td style={cell}><strong>계란</strong></td><td style={cell}>부풀기 ↑ · 단단함</td><td style={cell}>식감 무너짐 · 결합력 ↓</td></tr>
            <tr><td style={cell}><strong>액체 (우유·물)</strong></td><td style={cell}>촉촉 ↑ · 밀도 ↓</td><td style={cell}>건조 가능</td></tr>
            <tr><td style={cell}><strong>베이킹파우더</strong></td><td style={cell}>부풀기 ↑ · 4% 초과 시 쓴맛·금속 맛</td><td style={cell}>덜 부풂</td></tr>
            <tr><td style={cell}><strong>황설탕 vs 백설탕</strong></td><td style={cell}>황설탕 ↑ → 쫀득·캐러멜 풍미</td><td style={cell}>백설탕 ↑ → 바삭·퍼짐</td></tr>
          </tbody>
        </table>
      </div>

      {/* 3. 틀 용량 기준 분량 가이드 */}
      <h2 style={sectionTitle}>📦 틀 용량 기준 분량 가이드</h2>
      <p className="g-p">
        한국 홈베이커들이 가장 많이 묻는 것: &ldquo;이 레시피를 내 틀에 맞게 어떻게 줄여요?&rdquo; 본 도구의 &ldquo;분량 변환&rdquo; 탭에서 틀 종류만 고르면 자동 환산됩니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>틀</th>
              <th scope="col" style={headCell}>1개당 / 1틀 용량</th>
              <th scope="col" style={headCell}>참고</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>마들렌 표준틀</td><td style={cell}>1개 28g</td><td style={cell}>12구 = 336g 반죽</td></tr>
            <tr><td style={cell}>마들렌 미니틀</td><td style={cell}>1개 18g</td><td style={cell}>20구 = 360g</td></tr>
            <tr><td style={cell}>미니 파운드 (8×4×4)</td><td style={cell}>1틀 약 50g</td><td style={cell}>일회용 미니틀·선물용</td></tr>
            <tr><td style={cell}>표준 파운드 (20×8×7)</td><td style={cell}>1틀 약 470g</td><td style={cell}>가장 흔한 사이즈 (틀 부피 ÷ 비용적 2.4)</td></tr>
            <tr><td style={cell}>표준 머핀</td><td style={cell}>1개 65g</td><td style={cell}>12구 = 780g</td></tr>
            <tr><td style={cell}>표준 쿠키 (지름 6cm)</td><td style={cell}>1개 30g</td><td style={cell}>20개 = 600g</td></tr>
            <tr><td style={cell}>표준 마카롱 (지름 4cm)</td><td style={cell}>껍질 1장 약 7g</td><td style={cell}>50개(껍질·25쌍) ≈ 350g 반죽</td></tr>
            <tr><td style={cell}>표준 카스테라 (24×8×7)</td><td style={cell}>1틀 약 380g</td><td style={cell}>틀 높이의 60% 정도까지 채우는 양</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 24px' }}>
        원형 케이크틀(미니~5호)·무스링·사각팬은 계산기의 <a href="/tools/cooking/baking-recipe?tab=pan" style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>케이크 팬 탭</a>에서 지름·높이로 부피를 비교해 환산하세요.
      </p>

      {/* 3-1. 케이크 팬 배율 공식 (구 cake-pan 흡수) */}
      <h3 className="g-h3">원형·사각 케이크 팬 배율 — 부피비가 정답</h3>
      <p className="g-p">
        마들렌·머핀처럼 틀 1개당 반죽량이 정해진 품목과 달리, 케이크 팬은 <strong>두 팬의 부피 비율</strong>만큼 레시피 전체를 곱합니다. 계산기의 &ldquo;케이크 팬&rdquo; 탭이 아래 공식으로 배율과 재료 환산값을 바로 보여줍니다.
      </p>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)',
        padding: '18px 20px', fontFamily: 'var(--font-mono)',
        fontSize: 13, color: 'var(--text)', lineHeight: 2.1,
      }}>
        <div><span style={{ color: 'var(--muted)' }}>원형 부피</span> = π × (지름÷2)² × 높이</div>
        <div><span style={{ color: 'var(--muted)' }}>사각 부피</span> = 가로 × 세로 × 높이</div>
        <div><span style={{ color: 'var(--muted)' }}>배율</span> = 새 팬 부피 ÷ 기준 팬 부피</div>
        <div><span style={{ color: 'var(--muted)' }}>높이 같으면</span> = (지름비)² — 1호→2호 (18/15)² = 1.44배</div>
      </div>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
        📌 <strong style={{ color: 'var(--text)' }}>높이를 빼먹는 게 가장 흔한 실수:</strong> 무스링(H5cm) 레시피를 높은팬(H7cm)으로 그대로 1.44배 하면
        반죽이 모자랍니다. 1호 무스링→2호 높은팬은 1.44 × (7/5) = <strong style={{ color: 'var(--accent-ink)' }}>약 2.0배</strong>가 맞아요.
      </div>

      {/* 3-2. 한국 케이크 팬 호수 체계 (구 cake-pan 흡수) */}
      <h2 style={sectionTitle}>🎂 한국 케이크 팬 호수 체계 한눈에</h2>
      {/* 케이크 팬 탭의 호수 규격 근거(구 cake-pan 출처) — 도구 메타(lib/toolMeta)의 basis·sources도 이 값에서 생성 */}
      <UpdatedMeta
        date="2026년 7월"
        basis="케이크 팬 호수 규격 — 베이킹 자재상 판매 규격(1호 15cm·호당 +3cm·높은팬 7cm) 교차 확인"
        sources={[
          { label: '카우2004 — 케이크 팬 판매 규격', href: 'https://www.cow2004.com' },
          { label: '웰베이킹 — 케이크 팬 판매 규격', href: 'https://wellbaking.co.kr' },
        ]}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {[
          { t: '⚪ 원형 팬 (표준화 강함)', d: '1호 15cm 기점, 호당 +3cm. 높이는 일반 4.5 / 높은팬 7cm 이원 체계. 제누와즈용은 높은팬이 표준.' },
          { t: '⭕ 무스링', d: '지름 체계는 원형 팬과 동일(1호 15cm~), 높이만 5cm 표준. 높은형 6~7cm 별도. 떡케이크 틀로도 통용.' },
          { t: '⬜ 사각·파운드 (비표준)', d: '판매처마다 치수가 달라 규격 합의 없음. 오란다팬 대/중/소는 가게마다 전혀 다른 실물 — 실측 입력 권장.' },
        ].map((c, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{c.t}</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: '10px 0 24px' }}>
        호수별 cm·부피·인원·인치 대응표는 계산기의 &ldquo;케이크 팬&rdquo; 탭 아래에 있어요.
      </p>

      {/* 4. 식감별 비율 조정 */}
      <h2 style={sectionTitle}>🎚️ 식감별 비율 조정 치트시트</h2>
      <div style={{ ...card }}>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', color: 'var(--text)', lineHeight: 1.9 }}>
          <li><strong>촉촉하게</strong> — 사워크림·요거트 +10~20% / 꿀·미즈아메 +5~10%</li>
          <li><strong>가볍게</strong> — 밀가루 일부 옥수수전분 대체 (10~20%)</li>
          <li><strong>진한 풍미</strong> — 브라운 버터·꿀·바닐라 추가</li>
          <li><strong>덜 단</strong> — 설탕 -10~20% (단, 보존성 ↓·식감 변화 주의)</li>
          <li><strong>쫀득 쿠키</strong> — 황설탕 ↑ · 계란 +5~10g · 냉장 1시간</li>
          <li><strong>바삭 쿠키</strong> — 백설탕 ↑ · 녹인 버터 사용 · 얇게 굽기</li>
          <li><strong>fudgy 브라우니</strong> — 밀가루 30~40%까지 ↓ · 다크 초콜릿 70%+</li>
          <li><strong>케이크형 브라우니</strong> — 밀가루 +10% · 베이킹파우더 +1%</li>
        </ul>
      </div>

      {/* 5. 베이커 퍼센트 vs 본 도구 */}
      <h2 style={sectionTitle}>🧁 vs 🍞 제과 레시피 vs 베이커 퍼센트 — 사용자 분기</h2>
      <div style={{ ...card }}>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
          두 도구는 영역이 다릅니다. 빵을 만들면 <Link href="/tools/cooking/baker-percent" style={{ color: 'var(--accent)' }}>베이커 퍼센트 계산기</Link>, 디저트(제과)를 만들면 본 도구를 사용하세요.
        </p>
        <div style={{ ...card, marginTop: 14, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th scope="col" style={headCell}>구분</th>
                <th scope="col" style={headCell}>🍞 베이커 퍼센트</th>
                <th scope="col" style={headCell}>🧁 제과 레시피 (본 도구)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={cell}>대상</td><td style={cell}>빵 (식빵·바게트·치아바타·소금빵)</td><td style={cell}>제과 (마들렌·파운드·쿠키·머핀·마카롱·디저트)</td></tr>
              <tr><td style={cell}>기준</td><td style={cell}>밀가루 100% (고정)</td><td style={cell}>품목별 자동 (계란·버터·밀가루·흰자 등)</td></tr>
              <tr><td style={cell}>핵심</td><td style={cell}>발효 시간·수분율·반죽 온도</td><td style={cell}>비율 진단·식감 보정·굽기</td></tr>
              <tr><td style={cell}>전문 영역</td><td style={cell}>글루텐·이스트·발효종</td><td style={cell}>유지·계란·당도·머랭</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 마들렌 황금비율이 정확히 뭔가요?</summary>
        <div style={faqAnswer}>
          가장 클래식한 마들렌 비율: <strong style={{ color: 'var(--text)' }}>계란 : 설탕 : 밀가루 : 버터 = 1 : 1 : 1 : 1</strong> + 베이킹파우더 3%, 꿀 10%.
          계란 100g 기준 → 설탕 100g · 밀가루 100g · 버터 95~100g · BP 3g · 꿀 10g.
          변형: 브라운 버터(버터 110% + 꿀 12%), 레몬(레몬 제스트 5%), 초코(코코아 가루 10% + 우유 10%). 본 도구의 마들렌 모드 + 식감 보정 버튼을 활용하세요.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 1:1:1:1 파운드케이크가 정말 균형 잡힌 비율인가요?</summary>
        <div style={faqAnswer}>
          르 코르동 블루 등 클래식 학교의 표준입니다: <strong style={{ color: 'var(--text)' }}>버터 : 설탕 : 계란 : 밀가루 = 1 : 1 : 1 : 1</strong> + 베이킹파우더 2%.
          균형 잡힌 풍미·식감, 외우기 쉽고 안정적인 결과가 장점입니다.
          한국 입맛에는 설탕 80%로 줄이거나, 사워크림 +20%/우유 +10%로 촉촉하게, 버터 110% + 아몬드 가루 +10%로 묵직하게 변형할 수 있어요.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 쿠키가 너무 퍼지는데 어떻게 하나요?</summary>
        <div style={faqAnswer}>
          본 도구의 비율 진단을 활용하세요. 원인은 보통 <strong style={{ color: 'var(--text)' }}>버터 비율 70% 이상, 백설탕 과다, 베이킹소다 과다, 반죽 온도 높음, 오븐 온도 낮음</strong>입니다.
          해결책: ① 냉장 휴지 30분~1시간(필수) ② 황설탕 비율 ↑ ③ 밀가루 +5~10% ④ 베이킹소다 ↓ → 베이킹파우더로 일부 대체 ⑤ 오븐 175~190°C 충분히 예열 ⑥ 차가운 반죽으로 굽기.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 본 도구와 베이커 퍼센트 도구는 어떻게 다른가요?</summary>
        <div style={faqAnswer}>
          두 도구는 영역이 다릅니다.
          🍞 <Link href="/tools/cooking/baker-percent" style={{ color: 'var(--accent)', fontWeight: 600 }}>베이커 퍼센트 계산기</Link>는 빵 전용으로, 밀가루 100% 기준에 발효 시간·반죽 온도·이스트·발효종 중심입니다.
          🧁 <strong style={{ color: 'var(--text)' }}>제과 레시피 계산기</strong>(본 도구)는 제과 전용으로, 품목별 자동 기준(계란·버터·흰자 등)에 비율 진단·식감 보정·굽기 중심입니다.
          빵을 만들면 베이커 퍼센트, 디저트를 만들면 본 도구를 쓰세요.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 틀이 다른데 같은 레시피를 사용 가능한가요?</summary>
        <div style={faqAnswer}>
          본 도구의 &ldquo;분량 변환&rdquo; 탭을 활용하세요.
          예: 표준 파운드틀(20×8×7, 반죽 약 470g) 레시피를 소형 파운드틀(15×6×6, 약 230g) 2개로 나누면 ×0.98 (230×2=460g/470g).
          원형 케이크틀은 호수·높이에 따라 부피가 달라지니 &ldquo;케이크 팬&rdquo; 탭에서 두 팬의 지름·높이로 부피 배율을 구하세요.
          사각팬은 판매처마다 자체 호수 체계를 써서 같은 &lsquo;1호&rsquo;가 13.5cm인 곳도 14.5cm인 곳도 있고, <strong style={{ color: 'var(--text)' }}>파운드(오란다)팬의 &lsquo;대/중/소&rsquo;는 판매처마다 전혀 다른 실물</strong>을 가리켜 표준 규격이 없습니다 — 이런 틀은 자로 잰 가로×세로×높이를 &ldquo;케이크 팬&rdquo; 탭의 사각 입력에 넣는 게 가장 정확합니다.
          다만 ① 굽는 시간은 별도 조정(작을수록 ↓·클수록 ↑) ② 마카롱·머랭처럼 민감한 품목은 신중히 환산해야 합니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 알레르기가 있어도 본 도구 결과를 사용해도 되나요?</summary>
        <div style={faqAnswer}>
          본 도구는 일반 가이드입니다. 알레르기 환자는 <strong style={{ color: 'var(--text)' }}>라벨 확인 필수</strong>이며, 의사·영양사 상담 후 진행하세요.
          대체 가이드(참고용): 계란 → 아쿠아파바·플랙스에그 / 우유 → 두유·아몬드밀크 / 밀(글루텐) → 쌀가루·아몬드 가루 / 견과(아몬드) → 코코넛 가루 / 버터 → 코코넛 오일·식물성 유지.
          <strong style={{ color: 'var(--text)' }}>※ 이 대체 재료들은 계산기에서 직접 고르는 입력 항목이 아닙니다.</strong> 먼저 원래 재료(계란·우유·버터 등)의 무게를 계산기로 구한 뒤, 같은 g만큼 대체 재료로 바꿔 쓰세요. 예: 계산 결과 계란 50g → 아쿠아파바 50g, 우유 80g → 두유 80g.
          단, 대체 시 식감이 크게 변할 수 있고, <strong style={{ color: 'var(--text)' }}>본 도구의 결과로 자가 진단·자가 처방은 금물</strong>입니다. 영아·어린이 첫 시도는 의사와 상담 후 소량부터, 응급 약(에피펜 등)을 준비하세요.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 굽는 시간이 권장보다 모자란데 더 구워야 하나요?</summary>
        <div style={faqAnswer}>
          가정용 오븐은 표시 온도와 실제 온도 차이가 <strong style={{ color: 'var(--text)' }}>±20°C까지</strong> 납니다. 권장 시간 -1분 후 한 번 열어보고 ① 표면 색 ② 가운데 살짝 통통 ③ 이쑤시개로 찔러 묻어나는 정도를 종합 판단하세요.
          마들렌·머핀은 살짝 부족하게 굽는 게 촉촉하고, 쿠키는 가운데가 약간 무른 상태에서 꺼내면 식으면서 완벽해집니다. 오븐 온도계를 따로 두면 자기 오븐의 편차를 알 수 있어요.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 케이크 1호는 몇 cm이고, 호수별로 몇 인분인가요?</summary>
        <div style={faqAnswer}>
          한국 원형 케이크 팬 기준 <strong style={{ color: 'var(--text)' }}>1호 = 지름 15cm</strong>이고, 호수가 1 오를 때마다 지름이 3cm씩 커집니다(2호 18cm, 3호 21cm, 4호 24cm, 5호 27cm). 미니는 판매처에 따라 11.3~12cm로 약간 편차가 있어요.
          참고로 제과점의 완성 케이크는 아이싱 두께 때문에 1호를 16cm로 표기하는 곳도 있으니, 팬 기준인지 완성 케이크 기준인지 구분해야 합니다.
          인원은 케이크샵 관행 기준 <strong style={{ color: 'var(--text)' }}>미니(12cm) 1~2인, 1호 2~3인, 2호 4~5인, 3호 6~8인, 4호 8~12인</strong> 정도로 안내되지만, 가게마다 표기가 크게 다릅니다(1호를 4~6인분으로 쓰는 곳도 있어요).
          식사 후 디저트로 먹는 자리라면 한 치수 작게 잡아도 충분하다는 팁이 커뮤니티 공통 조언입니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 1호 레시피를 2호로 바꾸면 재료를 몇 배 해야 하나요?</summary>
        <div style={faqAnswer}>
          같은 높이의 팬이라면 <strong style={{ color: 'var(--text)' }}>(지름비)² = (18÷15)² = 1.44배</strong>입니다. 커뮤니티에서는 계산 편의상 &lsquo;1.5배&rsquo;로 반올림해 쓰는 관행이 널리 퍼져 있어요(2호→3호도 1.36배지만 1.5배로 통용).
          높이가 다른 팬으로 옮길 때는 <strong style={{ color: 'var(--text)' }}>(지름비)² × (높이비)</strong>를 곱해야 합니다 — 예를 들어 무스링(높이 5cm) 레시피를 높은팬(7cm)으로 옮기면 1.4배가 추가로 붙어요.
          계산기의 &ldquo;케이크 팬&rdquo; 탭이 정확값과 통용 반올림을 함께 보여줍니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 높은팬과 일반팬은 뭐가 다른가요?</summary>
        <div style={faqAnswer}>
          한국 원형 팬은 <strong style={{ color: 'var(--text)' }}>일반팬 높이 4.5cm / 높은팬 7cm</strong>의 이원 체계로 판매됩니다. 제누와즈(스펀지 시트)를 구워 생크림 케이크를 만들 때는 높은팬 7cm가 사실상 표준이에요.
          무스링은 지름 체계(1호 15cm~)는 같지만 높이 5cm가 표준이라, 같은 &lsquo;2호&rsquo;라도 팬 종류에 따라 부피가 최대 1.5배 이상 차이 납니다. 배율 계산에 높이가 꼭 들어가야 하는 이유입니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q11. 미국 레시피의 6인치·8인치 팬은 몇 호인가요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>6인치(15.2cm)≈1호, 7인치(17.8cm)≈2호</strong>는 오차 0.3cm 이내로 사실상 같습니다. <strong style={{ color: 'var(--text)' }}>8인치(20.3cm)는 3호(21cm)보다 0.7cm 작고, 9인치(22.9cm)는 약 3.6호</strong>로 정확히 대응하는 호수가 없어요.
          또 미국 표준 케이크팬은 높이 2인치(5cm)로 한국 높은팬(7cm)과 다르고, 미국 레시피는 8~9인치 팬 2개(2단)를 쓰는 경우가 많아 단순 지름 비교만으로 환산하면 어긋납니다 — &ldquo;케이크 팬&rdquo; 탭에 실제 치수를 넣는 게 정확합니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q12. 팬을 키우면 굽는 시간·온도는 어떻게 바꾸나요?</summary>
        <div style={faqAnswer}>
          공식적인 정량 규칙은 없습니다. 확실한 것은 <strong style={{ color: 'var(--text)' }}>시간을 배율만큼 비례 계산하면 안 된다</strong>는 점이에요 — 굽는 시간은 반죽 양이 아니라 두께에 좌우됩니다.
          통용 관행은 팬이 커지거나 깊어지면 온도를 조금 낮추고 시간을 5분 단위로 늘려가며 <strong style={{ color: 'var(--text)' }}>꼬치 테스트</strong>(중앙에 찔러 반죽이 안 묻어나면 완료)로 판정하는 것.
          실측 사례로 2호 제누와즈 170℃ 30~35분이 3호에서 약 40분 정도였습니다.
        </div>
      </details>

      {/* 7. 안전 / 면책 */}
      <h2 style={sectionTitle}>⚠️ 안전 · 면책</h2>
      <div style={{
        background: 'rgba(217, 119, 6, 0.06)',
        border: '1px solid rgba(217, 119, 6, 0.25)',
        borderRadius: 'var(--radius-m)',
        padding: '18px 22px',
        fontSize: '14px',
        color: 'var(--text)',
        lineHeight: 1.8,
      }}>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li>본 도구는 <strong>일반 가이드</strong>입니다. 정확한 결과는 본인의 오븐·재료로 테스트가 필요합니다.</li>
          <li>오븐별 편차 ±20°C·±3분, 재료(특히 버터·밀가루) 브랜드별 차이가 있습니다.</li>
          <li><strong>알레르기 주의</strong> — 계란·우유·밀(글루텐)·견과(아몬드 가루) 라벨 필수 확인. 의심 시 의료진 상담.</li>
          <li><strong>다이어트·당뇨</strong> — 정확한 영양 자문은 영양사·의사와 상담하세요. 본 도구는 칼로리·당분 계산이 아닙니다.</li>
          <li>본 도구는 정확한 영양 성분 분석·알레르기 진단·특정 브랜드 추천을 하지 않습니다.</li>
        </ul>
      </div>

      {/* 8. 관련 도구 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/cooking/baker-percent" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🥖</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>베이커 퍼센트 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>빵·발효 반죽 (밀가루 100%)</div>
        </Link>
        <Link href="/tools/cooking/substitute" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔄</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>식재료 대체 비율</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>버터·설탕·계란 대체</div>
        </Link>
        <Link href="/tools/cooking/serving" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍽️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>1인분 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>인분 환산</div>
        </Link>
        <Link href="/tools/cooking/thawing" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🧊</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>해동 시간 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>버터·계란 실온화</div>
        </Link>
        <Link href="/tools/date/dday" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📅</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>D-day 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>생일 케이크 일정</div>
        </Link>
      </div>
    </ToolPage>
  )
}
