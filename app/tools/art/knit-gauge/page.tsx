import Link from 'next/link'
import KnitGaugeClient from './KnitGaugeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/art/knit-gauge',
  title: '뜨개질 게이지 계산기 — 패턴 변환·사이즈별 코 수·늘림 줄임·실 양',
  description: '10×10cm 게이지로 패턴 코·단 수 변환 + 한국 사이즈별 코 계산·늘림·줄임 균등 분배와 실 양·바늘 호수 추천.',
  keywords: [
    '뜨개질 게이지', '게이지 계산기', '코 수 계산', '단 수 계산', '게이지 스와치',
    '뜨개질 패턴 변환', '스웨터 코 수', '모자 코 수', '양말 게이지',
    '뜨개질 늘림 줄임', '실 양 계산', '바늘 호수 추천',
    'DK 게이지', '워스티드 게이지', '코바늘 게이지', '대바늘 게이지',
    'CYC 실 굵기', 'M1L kfb k2tog', '매직 포뮬러 균등 분배',
    '한국 스웨터 사이즈', '뜨개질 사이즈',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '20px 22px',
  marginBottom: '14px',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text)',
  listStyle: 'none',
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
  { "q":"게이지 스와치가 꼭 필요한가요?","a":"네, 거의 모든 의류·핏이 중요한 작품에 필수입니다. 같은 실·바늘이라도 사람마다 손 텐션이 달라 게이지가 달라집니다. 스와치 없이 패턴 그대로 떴는데 완성된 스웨터가 +5cm 큰/작은 비극이 자주 발생해요. 단, 스와치 생략 가능한 경우: 스카프·머플러·도일리 등 핏이 중요하지 않은 작품, 본 작품을 풀어 다시 뜨는 게 큰 부담 아닐 때. 그래도 모자·장갑·양말·스웨터·가디건은 반드시 스와치 권장." },
  { "q":"게이지가 패턴과 다르면 어떻게 하나요?","a":"두 가지 방법이 있습니다: ① 바늘 호수 조정 (가장 일반적) — 내 게이지가 헐거우면 한 호수 작은 바늘, 빽빽하면 한 호수 큰 바늘로 바꿔 다시 스와치. 보통 1~2호수 차이로 조정 가능. ② 코·단 수 변환 — 본 도구의 [🔄 패턴 변환] 탭에서 자동 환산. 예: 패턴 100코 + 패턴 게이지 22코/10cm + 내 게이지 20코/10cm → 91코로 시작. ⚠️ 변환은 단순 도안(평직·메리야스)에 잘 맞고, 케이블·레이스 같은 복잡한 패턴은 코 수가 무늬 반복 단위에 맞아야 하므로 ①번 권장." },
  { "q":"코 게이지와 단 게이지 둘 다 맞춰야 하나요?","a":"코 게이지가 우선입니다. 코 게이지는 가로 폭(둘레)을 결정하므로 옷의 핏을 좌우해요. 단 게이지는 길이를 결정하지만, 길이는 \"몇 단\"이 아닌 \"cm로\" 측정해 마감하면 됩니다 (예: \"55cm가 될 때까지 떠 줍니다\"). 실제 패턴 다수도 길이는 cm로 표기. 단 게이지 차이가 코 게이지 차이보다 크면 본 도구가 자동으로 경고를 띄워 줍니다 (탭 2)." },
  { "q":"모자 시작 코는 머리 둘레 그대로?","a":"아닙니다. 머리 둘레보다 작게 떠야 늘어났을 때 잘 맞습니다 (negative ease). 다만 '얼마나 작게'는 발행처마다 다릅니다. • Woolly Wormhead(모자 전문, Knitty가 사이징 기준으로 링크): 완성 둘레를 5~7.5cm(2~3인치), 대략 12% 작게 • KnitPicks: 약 5cm(2인치) • Interweave: 딱 붙는 비니는 0~2.5cm(0~1인치) 본 도구 기본값 -10%(머리 56cm → 약 50cm)는 이 범위 안이며, 슬라이더로 조절할 수 있습니다. 네거티브 이즈는 '둘레'에만 적용하는 값이라 모자 높이(22cm 안팎)에는 곱하지 않습니다." },
  { "q":"양말 발 둘레 코 수는 어떻게?","a":"둘레는 약 10% 작게가 기준입니다. Knitty의 디자이너 사이징 가이드라인 원문도 \"A sock is best worn with about 10% negative ease\"입니다. 다만 길이는 다릅니다 — Kate Atherley(『Custom Socks』 저자·Knitty 테크에디터)는 둘레는 약 10%(성인 약 2.5cm) 작게, 길이는 약 1cm만 짧게 뜨라고 씁니다. 본 도구도 양말 길이에는 -10%가 아니라 -1cm를 적용합니다. • 무늬별 차등(Kate Atherley): 배색(스트랜디드) 양말은 이즈 0, 케이블은 약 5%, 레이스는 15% 이상도 • Knitty 'Socks 101' 예시: 발목 둘레 8인치(약 20cm)에서 성인은 1인치(아동은 0.5인치)를 빼고 게이지를 곱해 52코 시작 양말은 보통 4-DPN(double-pointed needles) 또는 매직 루프로 원형 작업합니다." },
  { "q":"한국·미국·일본 단위 차이는?","a":"코 게이지 측정 단위: • 한국·유럽: 10×10cm • 미국: 4×4 in (= 10.16cm) — CYC 공식 표는 표 제목에 'to 4 inches / 10 cm'로 두 단위를 함께 적어 같은 칸으로 취급합니다 • 일본: 10×10cm 표준 본 도구는 셋 다 토글로 지원합니다. 또한 바늘 호수도 mm·US·UK 동시 표기 (탭 4). • 미국식 6호 = 4.0mm (CYC 공식 환산표) • 일본 호수는 별도 체계입니다 — 클로버(Clover) 공식 규정상 0호가 축 2.1mm이고 15호(6.6mm)까지 0.3mm 간격이라 일본 5호 = 3.6mm이고, 15호보다 굵으면 호수 없이 mm(점보침)로만 표기합니다. 서양 사다리와 정확히 겹치는 지점은 3.0mm(3호)·4.5mm(8호)·6.0mm(13호)뿐이라 나머지는 근사입니다. 참고로 CYC 표에는 UK 호수 열이 없어 UK 값의 근거는 제조사 환산표입니다. 본 도구는 mm 단위 우선." },
  { "q":"늘림(M1L)과 (kfb) 차이는?","a":"둘 다 1코 늘림이지만 모양이 달라요. • M1L (Make 1 Left): 두 코 사이 가로실을 들어 올려 새 코 만듦. 거의 보이지 않음. 매끈한 라인 원할 때. • kfb (Knit Front and Back): 한 코의 앞과 뒤에 모두 떠서 1코 더 만듦. 작은 매듭이 보임. 입문자에게 쉬움. 소매 늘림처럼 매끈해야 하는 곳은 M1L/M1R, 매듭이 무늬가 되는 디자인은 kfb. 본 도구의 [📊 늘림] 탭 약어 용어집에 8개 기법 설명 있습니다. 한 단에 몰아서 처리할 수 있는 양에는 한계가 있습니다 — 늘림은 코마다 1코씩 늘려도 최대 '현재 코 수'까지, 줄임은 k2tog 하나가 2코를 소비하므로 최대 '현재 코 수의 절반'까지입니다. 이를 넘으면 도구가 분배 라벨 대신 몇 단에 나눠 진행하라는 안내를 내보냅니다." },
  { "q":"실 양 계산은 정확한가요?","a":"본 도구의 g 추정치는 통용 관행에 기반한 근사이며 공식 표준이 아닙니다. CYC 표준집에는 작품별 실 소요량 표 자체가 없고(표준집 수록 차트 목록에 부재), 업계 표기는 무게가 아니라 길이(야드·미터)입니다. Lion Brand 공식 안내 원문도 \"The best and most accurate measure for calculating amounts is yards\"이며, 같은 worsted라도 8온스당 최대 100야드 차이가 날 수 있다고 밝힙니다. 참고용 Lion Brand 공식 야드 표: 모자 CYC 4 → 200~225야드 / 양말 CYC 1 → 350~500야드 / 성인 스웨터 CYC 3 → 1,500~2,250야드, CYC 4 → 1,125~1,625야드 / 아프간 CYC 4 → 2,250~3,125야드. 정확히 계산하려면 실 라벨의 '100g = ○m' 표기로 필요한 길이를 타래 수로 환산하세요. 그 밖의 변수: • 케이블·아란 패턴은 더, 레이스는 덜 드는 편 • 컬러워크·페어아일은 두 가닥 동시 + 부동사(浮動絲)로 더 필요 • 여유분을 넉넉히 두고 같은 다이로트(dye lot)로 한 번에 구입해야 색이 맞습니다." },
  { "q":"바늘 호수가 게이지에 영향?","a":"네, 가장 큰 영향입니다. 같은 실이라도 바늘이 굵으면 코가 커져 게이지가 헐거워지고, 바늘이 가늘면 빽빽해집니다. • 한 호수 차이로도 게이지가 눈에 띄게 달라짐(실·손 텐션에 따라 폭은 제각각) • 게이지가 패턴과 안 맞으면 실 바꾸지 말고 바늘 호수 먼저 조정 • 본 도구의 [📊 늘림·실 양] 탭 마지막 표에 바늘 호수 ↔ 게이지 룩업 표가 있어 권장 호수를 바로 확인 가능합니다. 또한 바늘 재질(스틸·대나무·플라스틱)도 미세하게 영향. 매끄러운 스틸이 더 빨리 뜨이지만 텐션이 헐거워질 수 있어요." },
  { "q":"코바늘과 대바늘 게이지 차이?","a":"같은 실이라도 코바늘이 더 두껍고 빡빡한 편물이 됩니다 (코 단위가 더 큼). • 같은 DK 실: 대바늘 22코/10cm, 코바늘 12~17코/10cm(CYC 3 Light 짧은뜨기 규정 범위) (단코 기준) • 코바늘은 한 코의 높이가 더 큼 → 단 게이지가 코 게이지와 더 비슷 • 코바늘 패턴은 \"단코·반쪽단코·긴뜨기·긴긴뜨기\" 등 종류별로 게이지가 달라, 패턴 명시 단 종류로 측정 본 도구의 게이지 입력은 코바늘·대바늘 모두 사용 가능하지만, 코바늘 사용 시에는 패턴이 명시한 단 종류와 동일하게 스와치를 떠 측정하세요." }
]

export default function KnitGaugePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        예술·창작 · 디자인·미술
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="art" />뜨개질 게이지 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        10×10cm 게이지로 패턴 코·단수 변환 + 한국 사이즈별 코 계산·<strong style={{ color: 'var(--text)' }}>늘림 균등 분배</strong>.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="CYC 표준 실 굵기 시스템(4 inches / 10 cm, GUIDELINES ONLY) · KS 의류 치수 표준의 호칭 체계(2025-09-17 개정판) 참고 — 표의 수치는 KS 호칭표가 아닌 뜨개 패턴용 참고 치수"
        sources={[
          { label: 'CYC 실 굵기 표준', href: 'https://www.craftyarncouncil.com/standards/yarn-weight-system' },
          { label: 'CYC 바늘·코바늘 규격', href: 'https://www.craftyarncouncil.com/standards/hooks-and-needles' },
        ]}
      />

      {/* 면책 박스 */}
      <div style={{
        background: 'rgba(255, 138, 62, 0.06)',
        border: '1px solid rgba(255, 138, 62, 0.40)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '32px',
      }}>
        <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.75, margin: 0 }}>
          ⚠️ 본 도구는 표준 게이지·사이즈 기반 <strong>어림 계산</strong>입니다. 실 종류·블로킹 후 변화·개인 손 텐션에 따라 결과가 달라집니다.
          실제 작업은 반드시 <strong>게이지 스와치를 떠서 측정한 실제 게이지</strong>로 작업하세요.
          분야별 안전 안내는 <Link href="/disclaimer#art" style={{ color: 'var(--accent)' }}>면책조항</Link> 참고.
        </p>
      </div>

      <KnitGaugeClient />

      <GuideDivider />

      {/* 1. 사용법 */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>탭 1 게이지</strong> — 10×10cm 안의 코·단 수 입력 (스와치를 떠서 측정한 실제 값) → 1cm당 코·단, 실 굵기, 권장 바늘 자동 계산 + SVG 시각화</li>
          <li><strong>탭 2 패턴 변환</strong> — 도안의 게이지·코·단을 입력하면 내 게이지 기준으로 자동 환산 + 바늘 호수 코칭</li>
          <li><strong>탭 3 사이즈별</strong> — 부위(스웨터/모자/양말/담요 등) 선택 + 가로·세로 cm 입력 → 정확한 시작 코 + 단 수. 한국 사이즈 칩으로 빠른 입력</li>
          <li><strong>탭 4 늘림·실 양</strong> — 늘림/줄임 균등 분배 (매직 포뮬러 방식) + 실 굵기·작품 종류·사이즈로 실 양(g·실타래) 추정 + 바늘 호수 표</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text)', lineHeight: 1.8 }}>
          📌 <strong>늘림·줄임 한 단 한계</strong> — 한 단에서 늘릴 수 있는 최대는 <strong>현재 코 수</strong>, 줄일 수 있는 최대는
          k2tog가 2코를 소비하므로 <strong>현재 코 수의 절반</strong>입니다. 넘으면 도구가 분배 라벨 대신 여러 단에 나누라는 안내를 냅니다.
        </p>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 모든 입력값(게이지·치수·실 종류 등)은 자동 저장되어 새로고침해도 유지됩니다. 뜨개질 중 핸드폰으로 자유롭게 사용하세요.
        </p>
      </div>

      {/* 2. 게이지 스와치 만드는 법 */}
      <h2 style={sectionTitle}>📐 게이지 스와치 — 왜 필요한가?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          같은 패턴, 같은 실, 같은 바늘이라도 사람마다 손 텐션이 달라 게이지가 다릅니다. <strong>스와치를 떠서 내 게이지를 측정해야</strong> 패턴이 정확하게 맞아요.
          <strong> 스와치를 생략하면 완성 후 사이즈가 +5~10cm 큰 / 작은 비극이 생깁니다.</strong>
        </p>
        <ol style={{ margin: '14px 0 0', paddingLeft: 20, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>15×15cm(6인치) 이상 시험 편물</strong>을 같은 실·바늘로 떠 줍니다. 미국 뜨개길드(TKGA)는 &quot;가장자리 왜곡 없이 중앙을 잴 수 있게 최소 6×6인치&quot;, Brooklyn Tweed는 6~8인치, Cocoknits도 &quot;최소 6×6인치&quot;를 권합니다.</li>
          <li><strong>물에 적신 후 펴서 말립니다 (블로킹)</strong>. 패턴에 적힌 게이지는 <strong>블로킹 후 게이지</strong>가 기준입니다(TKGA). 완성품에 쓸 방법 그대로(스팀 또는 물세척) 블로킹하고, 마른 뒤 12~24시간 두었다가 재면 더 안정적입니다(Brooklyn Tweed).</li>
          <li>가운데 <strong>10×10cm(4인치)를 핀으로 표시</strong>하고 그 안의 코·단 수를 셉니다. 늘어나는 줄자보다 곧은 자를 쓰고, 한 곳이 아니라 여러 지점에서 재 보세요.</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ⓘ 출처 구분: CYC 문서는 &quot;스와치는 4인치 정사각형&quot;이라고만 적고 &apos;크게 떠서 중앙을 재라&apos;는 말은 하지 않습니다.
          위 1·3번 조언의 출처는 TKGA·Brooklyn Tweed·Cocoknits입니다.
        </p>
        <div style={{ background: 'rgba(255, 138, 62, 0.06)', border: '1px solid rgba(255, 138, 62, 0.40)', borderRadius: 10, padding: '12px 16px', marginTop: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.75 }}>
            ⚠️ <strong style={{ color: 'var(--warning)' }}>흔한 실수 5가지</strong>
            <br />① 스와치를 너무 작게(5×5cm) 떠서 측정 — 가장자리 영향으로 부정확
            <br />② 블로킹 생략 — 실 종류에 따라 게이지가 한 호수 차이만큼 변함
            <br />③ 너무 빠듯하게 또는 느슨하게 측정 — 자연스러운 상태에서 핀으로 고정
            <br />④ 실을 바꿔도 같은 바늘 사용 — 실마다 권장 바늘이 다름
            <br />⑤ 스와치 게이지를 본판 게이지와 다르게 측정 — 같은 무늬·평직으로 통일
          </p>
        </div>
      </div>

      {/* 3. CYC 실 굵기 표 */}
      <h2 style={sectionTitle}>🧶 CYC 실 굵기 표 (0~7)</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          미국 Craft Yarn Council(CYC)이 발행하는 실 굵기 분류입니다. 아래는 CYC 공식 표를 그대로 옮긴 값으로,
          게이지는 <strong>메리야스뜨기 4인치(=10cm)</strong> 기준입니다 — CYC 공식 표준집(2018-11-06판 22쪽)이 표 제목에
          &quot;to 4 inches / 10 cm&quot;로 두 단위를 함께 적습니다. &apos;이름&apos;은 CYC 공식 카테고리명, &apos;실 종류&apos;는 CYC가 각 등급에 넣어 둔 통용 이름입니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>CYC</th>
                <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>공식 이름</th>
                <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>실 종류 (CYC 원문)</th>
                <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>코 수 / 4in(10cm)</th>
                <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>바늘 mm</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['0', 'Lace',        'Fingering, 10-count crochet thread', '33–40',   '1.5–2.25'],
                ['1', 'Super Fine',  'Sock, Fingering, Baby',              '27–32',   '2.25–3.25'],
                ['2', 'Fine',        'Sport, Baby',                        '23–26',   '3.25–3.75'],
                ['3', 'Light',       'DK, Light Worsted',                  '21–24',   '3.75–4.5'],
                ['4', 'Medium',      'Worsted, Afghan, Aran',              '16–20',   '4.5–5.5'],
                ['5', 'Bulky',       'Chunky, Craft, Rug',                 '12–15',   '5.5–8'],
                ['6', 'Super Bulky', 'Super Bulky, Roving',                '7–11',    '8–12.75'],
                ['7', 'Jumbo',       'Jumbo, Roving',                      '6코 이하', '12.75 이상'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', color: 'var(--cat-art)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row[0]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontWeight: 600 }}>{row[1]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--muted)' }}>{row[2]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{row[3]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ background: 'rgba(255, 138, 62, 0.06)', border: '1px solid rgba(255, 138, 62, 0.40)', borderRadius: 10, padding: '12px 16px', marginTop: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.8 }}>
            ⚠️ <strong style={{ color: 'var(--warning)' }}>Aran은 CYC의 독립 등급이 아닙니다</strong>
            <br />CYC 표에서 Aran은 <strong>4번(Medium)의 실 종류</strong>로 한 번 등장할 뿐입니다(원문 &quot;Worsted, Afghan, Aran&quot;).
            본 도구가 실 굵기 선택지에 Aran을 따로 둔 것은 4번 안에서 실무상 조금 더 굵게 쓰는 구간을 구분한 것이며,
            그 게이지(16–18코)·바늘(5.0–6.0mm)은 CYC 공식값이 아닙니다. 계산기 선택지는 CYC 0~6 + Aran이고 7번 Jumbo는 다루지 않습니다.
          </p>
        </div>
        <ul style={{ margin: '12px 0 0', paddingLeft: 18, fontSize: 12, color: 'var(--muted)', lineHeight: 1.9 }}>
          <li>CYC 스스로 이 표를 <strong>&quot;GUIDELINES ONLY&quot;</strong>(가장 흔히 쓰이는 게이지·바늘을 모은 것)로 규정합니다. 규격이 아니라 안내값입니다.</li>
          <li>0번 레이스는 CYC가 <strong>&quot;게이지 범위를 정하기 어렵다&quot;</strong>고 각주로 밝혀 두었습니다 — 반드시 패턴에 적힌 게이지를 따르세요.</li>
          <li>코바늘 게이지는 <strong>별도 규정</strong>이며 값이 완전히 다릅니다. 같은 4번 Medium이 대바늘 16–20코, 코바늘(짧은뜨기) 11–14코입니다.</li>
          <li>CYC 표는 <strong>코 게이지만</strong> 규정하고 단 게이지 항목이 없습니다. 도구가 함께 보여 주는 단 게이지 범위는 통용 경험치입니다.</li>
          <li>같은 등급이라도 면·울·아크릴·리넨에 따라 게이지가 달라집니다. <strong>실 라벨의 권장 게이지가 우선</strong>입니다.</li>
        </ul>
      </div>

      {/* 4. 한국 표준 사이즈 표 */}
      <h2 style={sectionTitle}>🇰🇷 뜨개 패턴용 참고 치수 (한국 기준)</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          아래 표는 <strong>뜨개 패턴을 짤 때 출발점으로 쓰는 참고 치수</strong>입니다. KS 호칭 표를 그대로 옮긴 것이 아니며,
          사이즈 라벨(XS·S·M…)은 시중 통용 표기입니다. 본 도구의 [📏 사이즈별] 탭에서 칩을 클릭하면 같은 값이 자동 적용됩니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.85 }}>
            📌 <strong>KS 의류 치수 표준은 대상별로 번호가 다릅니다</strong>
            <br />성인 남성복 <strong>KS K 0050</strong>(만 18세 이상) · 성인 여성복 <strong>KS K 0051</strong>(만 18~59세, 파운데이션 제외) ·
            유아복 <strong>KS K 0052</strong>(영아~취학 전) · 남자 아동복 <strong>KS K 9402</strong> · 여자 아동복 <strong>KS K 9403</strong>(각 만 7~12세).
            위 다섯 표준 모두 2025-09-17 개정(국가기술표준원). 즉 &apos;KS K 0050&apos; 하나로 여성복·아동복 치수까지 설명할 수 없습니다.
            <br />또 KS 호칭 숫자는 완성된 옷의 치수가 아니라 <strong>착용자의 인체 치수 조합</strong>입니다.
            여성 상의 중 피트성이 필요한 옷은 &apos;가슴둘레-엉덩이둘레-키&apos;(예: 85-94-160)로 적고 첫 숫자가 인체 가슴둘레(cm)입니다.
            그래서 아래 표의 &apos;M (95)&apos; 같은 라벨은 KS 호칭과 1:1로 대응하지 않습니다.
          </p>
        </div>
        {/* 여성 */}
        <p style={{ fontSize: 13, color: 'var(--cat-art)', fontWeight: 700, margin: '14px 0 6px' }}>여성</p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 14px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th scope="col" style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>사이즈</th>
                <th scope="col" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>가슴(cm)</th>
                <th scope="col" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>길이</th>
                <th scope="col" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>소매</th>
                <th scope="col" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>어깨</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['XS (85)', 84, 56, 53, 36],
                ['S (90)',  88, 58, 55, 38],
                ['M (95)',  92, 60, 57, 39],
                ['L (100)', 96, 62, 58, 40],
                ['XL (105)', 100, 64, 59, 41],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>{row[1]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>{row[2]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>{row[3]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 남성 */}
        <p style={{ fontSize: 13, color: 'var(--cat-art)', fontWeight: 700, margin: '14px 0 6px' }}>남성</p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 14px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th scope="col" style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>사이즈</th>
                <th scope="col" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>가슴(cm)</th>
                <th scope="col" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>길이</th>
                <th scope="col" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>소매</th>
                <th scope="col" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>어깨</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['S (95)',  96,  66, 60, 42],
                ['M (100)', 100, 68, 61, 44],
                ['L (105)', 104, 70, 62, 46],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>{row[1]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>{row[2]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>{row[3]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 키즈 */}
        <p style={{ fontSize: 13, color: 'var(--cat-art)', fontWeight: 700, margin: '14px 0 6px' }}>키즈</p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 14px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th scope="col" style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>사이즈</th>
                <th scope="col" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>가슴(cm)</th>
                <th scope="col" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>길이</th>
                <th scope="col" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>소매</th>
                <th scope="col" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>어깨</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['100cm', 54, 41, 35, 28],
                ['110cm', 58, 45, 38, 30],
                ['120cm', 62, 49, 41, 32],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>{row[1]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>{row[2]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>{row[3]}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.8 }}>
          ⓘ 참고 실측(사이즈코리아 제8차 인체치수조사): 만 18~59세 여성은 젖가슴둘레 평균 88.12cm·가슴둘레(겨드랑점) 89.83cm,
          남성은 가슴둘레 102.72cm입니다. 키즈의 100·110·120은 <strong>키(cm)</strong> 계열 호칭이고, 표의 가슴둘레 54·58·62cm는
          사이즈코리아 아동 실측(키 121~122cm 아동의 가슴둘레 약 62cm)과 부합합니다.
          <br />디자이너·브랜드마다 사이즈가 다르니 인디 디자이너 패턴은 각자 사이즈 표를 우선 참고하세요.
        </p>
      </div>

      {/* 5. 부위별 작업 팁 */}
      <h2 style={sectionTitle}>🎯 부위별 작업 팁</h2>
      <div style={card}>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
          <li>👕 <strong>스웨터 몸통</strong> — 평직 작업 시 앞·뒤판 동일하게 떠서 옆선 봉합. 톱다운 원형 작업이면 한 번에 몸통 진행.</li>
          <li>💪 <strong>스웨터 소매</strong> — 손목에서 시작해 위로 갈수록 넓어짐 (늘림 분배). 또는 레글런·세트인 방식.</li>
          <li>🎩 <strong>모자 (비니)</strong> — 머리 둘레보다 작게 떠야 늘어났을 때 잘 맞음(음의 ease). 권장 폭은 발행처마다 달라서 Woolly Wormhead는 5~7.5cm(약 12%), KnitPicks는 약 5cm, Interweave는 0~2.5cm를 제시합니다. 이즈는 <strong>둘레에만</strong> 적용하고 높이(22cm 안팎)는 그대로 둡니다. 원형 작업 권장, 정수리는 cdd 줄임으로 마감.</li>
          <li>🧦 <strong>양말</strong> — 둘레는 발보다 약 10% 작게(Knitty 디자이너 가이드라인), <strong>발 길이는 약 1cm만</strong> 짧게(Kate Atherley) — 본 도구도 길이에는 -10%가 아니라 -1cm를 적용합니다. 배색(스트랜디드) 양말은 이즈 0, 케이블은 약 5%. 원형 4-DPN 또는 매직 루프. Toe-up / Cuff-down 두 방식이 있어요.</li>
          <li>🧣 <strong>스카프</strong> — 평직 작업. 양 끝 무늬 통일이 중요. 가터·메리야스·시드 스티치가 인기.</li>
          <li>🛌 <strong>담요</strong> — 대형 작품. 색상 블록·모티브 결합 인기. 실 양 충분히 준비 (여유분을 넉넉히). 코바늘 그래니 스퀘어가 빠름.</li>
        </ul>
      </div>

      {/* 6. 실 양 — g vs 야드 */}
      <h2 style={sectionTitle}>🧵 실 양은 g보다 야드·미터가 정확합니다</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          본 도구의 실 양 추정치는 g으로 나옵니다. 다만 이 값은 <strong>통용 관행에 기반한 근사이고 공식 표준이 아닙니다.</strong>
          CYC 표준집에는 작품별 실 소요량 표가 아예 없고(수록 차트 목록에 해당 항목 부재), 업계 표기는 무게가 아니라 <strong>길이(야드·미터)</strong>입니다.
          Lion Brand 공식 안내도 &quot;The best and most accurate measure for calculating amounts is yards&quot;라고 못 박으며,
          같은 worsted라도 8온스당 최대 100야드까지 차이가 날 수 있다고 밝힙니다. 그래서 g만으로는 정확히 맞출 수 없습니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
            <caption style={{ captionSide: 'top', textAlign: 'left', fontSize: 11, color: 'var(--muted)', paddingBottom: 8 }}>
              참고: Lion Brand 공식 작품별 소요량 (전부 야드 표기, 1야드 ≈ 0.91m)
            </caption>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>작품</th>
                <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>실 굵기</th>
                <th scope="col" style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>권장 길이</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['모자', 'CYC 4 Medium', '200–225 yd'],
                ['양말', 'CYC 1 Super Fine', '350–500 yd'],
                ['성인 스웨터', 'CYC 3 Light', '1,500–2,250 yd'],
                ['성인 스웨터', 'CYC 4 Medium', '1,125–1,625 yd'],
                ['아프간 (대형 담요)', 'CYC 4 Medium', '2,250–3,125 yd'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--muted)' }}>{row[1]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.8 }}>
          💡 실 라벨의 <strong>&quot;100g = ○m&quot;</strong> 표기로 필요한 길이를 타래 수로 환산하는 것이 가장 정확합니다.
          도구의 g 추정치는 라벨 길이를 아직 모를 때의 출발점으로만 쓰세요. 이 표 역시 &apos;평균적인 크기의 작품&apos; 기준이라
          사이즈·게이지·무늬에 따라 달라집니다.
        </p>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 게이지 스와치가 꼭 필요한가요?</summary>
        <p style={faqAnswer}>
          <strong>네, 거의 모든 의류·핏이 중요한 작품에 필수</strong>입니다. 같은 실·바늘이라도 사람마다 손 텐션이 달라 게이지가 달라집니다.
          스와치 없이 패턴 그대로 떴는데 완성된 스웨터가 +5cm 큰/작은 비극이 자주 발생해요.<br />
          단, <strong>스와치 생략 가능한 경우</strong>: 스카프·머플러·도일리 등 핏이 중요하지 않은 작품, 본 작품을 풀어 다시 뜨는 게 큰 부담 아닐 때.
          그래도 모자·장갑·양말·스웨터·가디건은 반드시 스와치 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 게이지가 패턴과 다르면 어떻게 하나요?</summary>
        <p style={faqAnswer}>
          <strong>두 가지 방법</strong>이 있습니다:<br />
          <strong>① 바늘 호수 조정</strong> (가장 일반적) — 내 게이지가 헐거우면 한 호수 작은 바늘, 빽빽하면 한 호수 큰 바늘로 바꿔 다시 스와치. 보통 1~2호수 차이로 조정 가능.<br />
          <strong>② 코·단 수 변환</strong> — 본 도구의 [🔄 패턴 변환] 탭에서 자동 환산. 예: 패턴 100코 + 패턴 게이지 22코/10cm + 내 게이지 20코/10cm → 91코로 시작.<br />
          ⚠️ 변환은 <strong>단순 도안</strong>(평직·메리야스)에 잘 맞고, 케이블·레이스 같은 복잡한 패턴은 코 수가 무늬 반복 단위에 맞아야 하므로 ①번 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 코 게이지와 단 게이지 둘 다 맞춰야 하나요?</summary>
        <p style={faqAnswer}>
          <strong>코 게이지가 우선</strong>입니다. 코 게이지는 가로 폭(둘레)을 결정하므로 옷의 핏을 좌우해요.<br />
          <strong>단 게이지</strong>는 길이를 결정하지만, 길이는 <strong>&quot;몇 단&quot;이 아닌 &quot;cm로&quot;</strong> 측정해 마감하면 됩니다 (예: &quot;55cm가 될 때까지 떠 줍니다&quot;).<br />
          실제 패턴 다수도 길이는 cm로 표기. 단 게이지 차이가 코 게이지 차이보다 크면 본 도구가 자동으로 경고를 띄워 줍니다 (탭 2).
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 모자 시작 코는 머리 둘레 그대로?</summary>
        <p style={faqAnswer}>
          아닙니다. <strong>머리 둘레보다 작게</strong> 떠야 늘어났을 때 잘 맞습니다 (negative ease).
          다만 <strong>&apos;얼마나 작게&apos;는 발행처마다 다릅니다.</strong><br />
          • <strong>Woolly Wormhead</strong>(모자 전문 디자이너, Knitty가 사이징 기준으로 링크): 완성 둘레를 5~7.5cm(2~3인치), 대략 12% 작게<br />
          • <strong>KnitPicks</strong>: 약 5cm(2인치)<br />
          • <strong>Interweave</strong>: 딱 붙는 비니는 0~2.5cm(0~1인치)<br />
          본 도구 기본값 -10%(머리 56cm → 약 50cm)는 이 범위 안이며, [📏 사이즈별] 탭 슬라이더로 조절할 수 있습니다.
          네거티브 이즈는 <strong>둘레에만</strong> 적용하는 값이라 모자 높이(22cm 안팎)에는 곱하지 않습니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 양말 발 둘레 코 수는 어떻게?</summary>
        <p style={faqAnswer}>
          <strong>둘레는 약 10% 작게</strong>가 기준입니다. Knitty의 디자이너 사이징 가이드라인 원문도
          &quot;A sock is best worn with about 10% negative ease&quot;입니다.<br />
          다만 <strong>길이는 다릅니다</strong> — Kate Atherley(『Custom Socks』 저자·Knitty 테크에디터)는 둘레는 약 10%(성인 약 2.5cm) 작게,
          <strong>길이는 약 1cm만</strong> 짧게 뜨라고 씁니다. 본 도구도 양말 길이에는 -10%가 아니라 -1cm를 적용합니다.<br />
          • 무늬별 차등(Kate Atherley): 배색(스트랜디드)은 이즈 0, 케이블은 약 5%, 레이스는 15% 이상도<br />
          • Knitty &apos;Socks 101&apos; 예시: 발목 둘레 8인치(약 20cm)에서 성인은 1인치(아동은 0.5인치)를 빼고 게이지를 곱해 52코로 시작<br />
          양말은 보통 4-DPN(double-pointed needles) 또는 매직 루프로 원형 작업합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 한국·미국·일본 단위 차이는?</summary>
        <p style={faqAnswer}>
          <strong>코 게이지 측정 단위</strong>:<br />
          • 한국·유럽: <strong>10×10cm</strong><br />
          • 미국: <strong>4×4 in</strong> (= 10.16cm) — CYC 공식 표는 표 제목에 &quot;to 4 inches / 10 cm&quot;로 두 단위를 함께 적어 같은 칸으로 취급합니다<br />
          • 일본: <strong>10×10cm</strong> 표준<br />
          본 도구는 셋 다 토글로 지원합니다. 또한 <strong>바늘 호수</strong>도 mm·US·UK 동시 표기 (탭 4).<br />
          • 미국식 6호 = 4.0mm (CYC 공식 환산표)<br />
          • <strong>일본 호수는 별도 체계</strong>입니다 — 클로버(Clover) 공식 규정상 0호가 축 2.1mm이고 15호(6.6mm)까지 0.3mm 간격이라
          일본 5호 = 3.6mm이며, 15호보다 굵으면 호수 없이 mm(점보침)로만 표기합니다. 서양 사다리와 정확히 겹치는 지점은
          3.0mm(3호)·4.5mm(8호)·6.0mm(13호)뿐이라 나머지는 근사입니다.<br />
          참고로 CYC 표에는 UK 호수 열이 없어, 도구 표의 UK 값은 제조사 환산표를 근거로 합니다. 본 도구는 mm 단위 우선.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 늘림(M1L)과 (kfb) 차이는?</summary>
        <p style={faqAnswer}>
          둘 다 1코 늘림이지만 모양이 달라요.<br />
          • <strong>M1L (Make 1 Left)</strong>: 두 코 사이 가로실을 들어 올려 새 코 만듦. <strong>거의 보이지 않음</strong>. 매끈한 라인 원할 때.<br />
          • <strong>kfb (Knit Front and Back)</strong>: 한 코의 앞과 뒤에 모두 떠서 1코 더 만듦. <strong>작은 매듭이 보임</strong>. 입문자에게 쉬움.<br />
          소매 늘림처럼 매끈해야 하는 곳은 M1L/M1R, 매듭이 무늬가 되는 디자인은 kfb. 본 도구의 [📊 늘림] 탭 약어 용어집에 8개 기법 설명 있습니다.<br />
          ⚠️ <strong>한 단에 몰아서 처리할 수 있는 양에는 한계</strong>가 있습니다 — 늘림은 코마다 1코씩 늘려도 최대 <strong>현재 코 수</strong>까지,
          줄임은 k2tog 하나가 2코를 소비하므로 최대 <strong>현재 코 수의 절반</strong>까지입니다.
          이를 넘으면 도구가 억지 분배 라벨 대신 몇 단에 나눠 진행하라는 안내를 내보냅니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 실 양 계산은 정확한가요?</summary>
        <p style={faqAnswer}>
          본 도구의 g 추정치는 <strong>통용 관행에 기반한 근사이며 공식 표준이 아닙니다.</strong>
          CYC 표준집에는 작품별 실 소요량 표 자체가 없고(수록 차트 목록에 해당 항목 부재), 업계 표기는 무게가 아니라 <strong>길이(야드·미터)</strong>입니다.
          Lion Brand 공식 안내 원문도 &quot;The best and most accurate measure for calculating amounts is yards&quot;이며,
          같은 worsted라도 8온스당 최대 100야드 차이가 날 수 있다고 밝힙니다.<br />
          • 참고 Lion Brand 공식 야드 표: 모자 CYC 4 → <strong>200~225yd</strong> / 양말 CYC 1 → <strong>350~500yd</strong> /
          성인 스웨터 CYC 3 → <strong>1,500~2,250yd</strong>, CYC 4 → <strong>1,125~1,625yd</strong> / 아프간 CYC 4 → <strong>2,250~3,125yd</strong><br />
          • 정확히 계산하려면 실 라벨의 <strong>&quot;100g = ○m&quot;</strong>으로 필요한 길이를 타래 수로 환산하세요.<br />
          • 그 밖의 변수: 케이블·아란 패턴은 더, 레이스는 덜 드는 편이고, 컬러워크·페어아일은 두 가닥 동시 + 부동사(浮動絲)로 더 필요합니다.
          여유분을 넉넉히 두고 같은 다이로트(dye lot)로 한 번에 구입해야 색이 맞습니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 바늘 호수가 게이지에 영향?</summary>
        <p style={faqAnswer}>
          <strong>네, 가장 큰 영향</strong>입니다. 같은 실이라도 바늘이 굵으면 코가 커져 게이지가 헐거워지고, 바늘이 가늘면 빽빽해집니다.<br />
          • 한 호수 차이로도 <strong>게이지가 눈에 띄게</strong> 달라짐(실·손 텐션에 따라 폭은 제각각)<br />
          • 게이지가 패턴과 안 맞으면 <strong>실 바꾸지 말고 바늘 호수 먼저 조정</strong><br />
          • 본 도구의 [📊 늘림·실 양] 탭 마지막 표에 바늘 호수 ↔ 게이지 룩업 표가 있어 권장 호수를 바로 확인 가능합니다.<br />
          또한 <strong>바늘 재질</strong>(스틸·대나무·플라스틱)도 미세하게 영향. 매끄러운 스틸이 더 빨리 뜨이지만 텐션이 헐거워질 수 있어요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 코바늘과 대바늘 게이지 차이?</summary>
        <p style={faqAnswer}>
          <strong>같은 실이라도 코바늘이 더 두껍고 빡빡한 편물</strong>이 됩니다 (코 단위가 더 큼).<br />
          • 같은 DK 실: 대바늘 22코/10cm, 코바늘 12~17코/10cm(CYC 3 Light 짧은뜨기 규정 범위) (단코 기준)<br />
          • 코바늘은 <strong>한 코의 높이가 더 큼</strong> → 단 게이지가 코 게이지와 더 비슷<br />
          • 코바늘 패턴은 <strong>&quot;단코·반쪽단코·긴뜨기·긴긴뜨기&quot;</strong> 등 종류별로 게이지가 달라, 패턴 명시 단 종류로 측정<br />
          본 도구의 게이지 입력은 코바늘·대바늘 모두 사용 가능하지만, 코바늘 사용 시에는 패턴이 명시한 단 종류와 동일하게 스와치를 떠 측정하세요.
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/art/paint-mix" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🎨</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>물감·잉크 혼합 비율</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            색 시뮬레이터 + 컬러 매칭
          </p>
        </Link>
        <Link href="/tools/unit/converter" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📐</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>단위 변환기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            cm·인치·g·온스 환산
          </p>
        </Link>
        <Link href="/tools/art/golden-ratio" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🌀</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>황금 비율 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            φ = 1.618 디자인 비율
          </p>
        </Link>
      </div>
    </div>
  )
}
