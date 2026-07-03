import Link from 'next/link'
import ExposureClient from './ExposureClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/art/exposure',
  title: '사진 노출 계산기 — 조리개·셔터·ISO 3축 자유 시뮬레이터 + ND·Sunny 16',
  description: '조리개·셔터·ISO 3축을 자유롭게 + 옵션 잠금으로 등가 노출 시뮬. ND 필터·Sunny 16·별 사진 500 룰·180° 셔터까지.',
  keywords: ['사진 노출 계산기', '조리개 셔터 ISO', 'EV 계산', '노출 시뮬레이터', '등가 노출 계산기', 'ND 필터 환산', 'Sunny 16', '500 룰', '별 사진', '180도 셔터 룰', '심도 계산', '장노출', 'Stop 계산', '카메라 수동 모드'],
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
  { "q":"조리개 1/3 stop과 풀스톱 차이는?","a":"풀스톱은 1.4 → 2 → 2.8 → 4 → 5.6 → 8 → 11 → 16처럼 √2 배수로 변하는 전통 단위입니다(1 stop = 광량 2배). 현대 카메라는 정밀 조절을 위해 1/3 stop(예: f/3.2, f/3.5, f/4) 단위로 세분화돼요. 이 도구는 27개 조리개 값(풀 + 1/3 stop)을 지원하며, 슬라이더 인덱스 1당 1/3 stop 변화입니다." },
  { "q":"잠금(Lock) 토글은 어떻게 동작하나요?","a":"조리개·셔터·ISO 각각 독립 토글이며 최대 2개까지 동시에 잠글 수 있습니다. • 0개 (기본): 자유 모드 — 각 슬라이더가 EV를 그대로 바꿈. 수동(M)모드로 한 변수씩 효과 학습. • 1개: 등가 노출 모드 — 잠근 축은 고정, 나머지 두 축이 서로 보정해 EV 유지. → 조리개 잠금: 심도 유지 (Av 모드) / 셔터 잠금: 모션 유지 (Tv 모드) / ISO 잠금: 노이즈·화질 우선. • 2개: 1축 자유 — 두 축 고정, 남은 한 축만 움직임 → EV가 변함 (제약 시뮬)." },
  { "q":"등가 노출(Equivalent Exposure)이란?","a":"같은 EV 값을 가지는 다른 조합들을 의미합니다. 예: f/4·1/250·ISO 200 = f/2.8·1/500·ISO 200 = f/4·1/500·ISO 400. 모두 같은 밝기지만 효과는 달라요 — 첫 번째는 인물 보케, 두 번째는 동작 정지, 세 번째는 약간의 노이즈. 이 도구의 등가 노출 5종은 조리개 변화를 우선해 다양한 효과를 보여줍니다." },
  { "q":"ND 필터 stop을 어떻게 셔터로 환산?","a":"ND filter의 stop만큼 셔터를 2배씩 길게 만들면 같은 노출이 됩니다. • ND8 (3 stop) + 원본 1/250 = 1/250 × 2³ = 1/250 × 8 = 1/30 초 • ND1000 (10 stop) + 원본 1/250 = 1/250 × 1024 = 약 4 초 공식: 새 셔터 = 원본 셔터 × 2^stops. ND 탭의 영웅 카드가 자동 계산합니다." },
  { "q":"Sunny 16 룰이 디지털에도 유효한가요?","a":"네, 광량 자체는 변하지 않으므로 완전히 유효합니다. 현대 카메라의 측광이 더 정확하지만, Sunny 16은 측광이 속는 상황에서 백업 룰이 됩니다 — 역광, 눈, 검은 옷, 콘서트 무대 등. 또한 측광에 의존하지 않고 노출을 이해하는 훈련에 매우 유용해요. M모드(수동)로 사진 찍는 사진가는 Sunny 16부터 시작합니다." },
  { "q":"별 사진 500 룰이 정확한가요?","a":"개략적 가이드입니다. 공식: 최대 셔터(초) = 500 / (초점거리 × 크롭 팩터). 24mm 풀프레임 → 500/24 = 약 20초까지 별이 점으로 보입니다. • 더 정밀한 NPF 룰도 있지만 픽셀 피치 등 추가 변수 필요 • 고해상도 카메라(45MP+)는 300 룰이 더 안전 (300/24 = 12초) • 별이 자글자글 보이면 셔터를 줄이고 ISO를 올리세요." },
  { "q":"영상 180° 셔터 룰이 뭔가요?","a":"영상에서 셔터 = 1 / (2 × fps)로 설정하면 자연스러운 모션 블러가 생깁니다. • 24p → 1/50 (시네마 표준) • 30p → 1/60 • 60p → 1/125 이름의 유래: 필름 시대 회전 셔터 디스크가 180° 열려 있던 데서 왔어요. 더 빠른 셔터(1/200) → 동작 끊김(스포츠 영화 느낌). 더 느린 셔터 → 흐름 과해짐. 야외 촬영 시 ND 필터로 셔터 유지." },
  { "q":"풀프레임 vs APS-C 노출 차이?","a":"EV 자체는 동일합니다. f/2.8 + 1/250 + ISO 100은 어떤 센서든 같은 노출이에요. 다만 다음이 달라집니다: • 심도: APS-C(×1.5)는 같은 조리개에서 풀프레임보다 심도가 깊음 (f/2.8 → 풀프레임 f/4 정도) • 화각: 50mm APS-C = 75mm 풀프레임 환산 • 고감도 노이즈: 풀프레임이 1~2 stop 유리 (픽셀 면적 ↑) 하지만 노출 계산 자체는 센서 무관. 이 도구의 EV는 모든 센서에 적용됩니다." },
  { "q":"회절(Diffraction)이 뭔가요? f/22가 흐린 이유?","a":"조리개를 너무 좁히면(f/16+) 빛이 구멍 가장자리에서 휘어 해상력이 떨어집니다 — 회절 현상. • 풀프레임: f/8 ~ f/11이 가장 선명 • APS-C/M4/3: f/5.6 ~ f/8이 한계 • 스마트폰: f/2.8 정도가 최선 심도가 절대 필요할 때(접사·풍경)만 f/16+ 사용하고, 일반 풍경은 f/8~f/11이 화질·심도 균형 최적." },
  { "q":"안전 셔터 룰(Safe Shutter)은?","a":"삼각대 없이 손으로 들고 찍을 때 흔들림 방지 셔터: 1 / (초점거리 × 크롭 팩터) 이상. • 50mm 풀프레임 → 1/50 이상 • 200mm 풀프레임 → 1/200 이상 • 200mm APS-C → 1/300 이상 (200×1.5) 현대 카메라의 손떨림 보정(IBIS)으로 5~7 stop까지 도움 받을 수 있어, 50mm + IBIS → 1/2초도 가능. 그래도 본인 손떨림과 호흡을 고려해 1~2 stop 여유 두는 게 좋습니다." }
]

export default function ExposurePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        예술·창작 · 사진
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="art" />사진 노출 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        조리개·셔터·ISO 3축을 자유롭게 + <strong style={{ color: 'var(--text)' }}>옵션 잠금으로 등가 노출</strong> 시뮬. ND·Sunny 16 포함.
      </p>

      <ExposureClient />

      <GuideDivider />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>먼저 자유롭게 움직여 보기</strong> — 잠금 0개 상태가 기본. 각 슬라이더가 EV를 그대로 바꿉니다 (수동 모드와 동일)</li>
          <li><strong>축 잠금 (옵션·최대 2개)</strong> — 1개 잠그면 등가 노출 모드 / 2개 잠그면 나머지 한 축만 EV 변경 가능</li>
          <li><strong>EV 확인</strong> — 현재 광량 환산 값 + 기본값(f/4·1/250·ISO 200) 대비 stop 변화</li>
          <li><strong>등가 노출 5종 클릭</strong> — 같은 EV·다른 효과 조합 즉시 적용</li>
          <li><strong>ND·가이드·트레이드오프 탭</strong>에서 상황별 추천 받기</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 입력값(조리개·셔터·ISO·잠금 상태)은 자동 저장되어 새로고침해도 유지됩니다.
        </p>
      </div>

      {/* 1.5 잠금 모델 — 신규 섹션 */}
      <h2 style={sectionTitle}>🔒 잠금 모드 3가지 — 학습 → 응용 → 제약 시뮬</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 14 }}>
        <div style={{ background: 'var(--bg2)', borderLeft: '3px solid #0D9488', borderRadius: 10, padding: '14px 16px' }}>
          <p style={{ fontSize: 13, color: '#0D9488', fontWeight: 700, margin: '0 0 6px' }}>🆓 0개 잠금 — 자유 모드</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.75 }}>
            각 슬라이더가 EV를 직접 변경. 노출 3요소를 처음 배울 때, 또는 효과(심도·흔들림·노이즈)를 한 변수씩 비교해볼 때.
          </p>
        </div>
        <div style={{ background: 'var(--bg2)', borderLeft: '3px solid #D97706', borderRadius: 10, padding: '14px 16px' }}>
          <p style={{ fontSize: 13, color: '#D97706', fontWeight: 700, margin: '0 0 6px' }}>🔁 1개 잠금 — 등가 노출 모드</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.75 }}>
            잠근 축 고정 + 나머지 두 축이 서로 보정. 「심도 유지하면서 셔터·ISO만 바꿔보고 싶을 때」 가장 유용. Av/Tv 모드 시뮬에 가까움.
          </p>
        </div>
        <div style={{ background: 'var(--bg2)', borderLeft: '3px solid #DB2777', borderRadius: 10, padding: '14px 16px' }}>
          <p style={{ fontSize: 13, color: '#DB2777', fontWeight: 700, margin: '0 0 6px' }}>🎯 2개 잠금 — 1축 자유</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.75 }}>
            두 축 고정 + 남은 한 축만 움직임 → EV가 변함. 「조리개 f/8 + ISO 100 고정인 풍경 촬영에서 셔터만 조정」처럼 실전 제약 시뮬.
          </p>
        </div>
      </div>

      {/* 2. 노출 3요소 — 핵심 개념 */}
      <h2 style={sectionTitle}>📐 노출 3요소 — 핵심 개념</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          사진의 밝기(노출)는 <strong>조리개</strong>·<strong>셔터스피드</strong>·<strong>ISO</strong> 세 축의 조합으로 결정됩니다.
          한 축의 변화는 <strong>stop</strong>(2배 광량 단위)으로 표현되며, 같은 stop만큼 다른 축에서 빼면 노출이 유지됩니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 14 }}>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #0D9488', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, color: '#0D9488', fontWeight: 700, margin: '0 0 4px' }}>🌀 조리개 (Aperture)</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
              렌즈 구멍 크기. f/1.4 = 큼(밝음·얕은 심도) / f/22 = 작음(어두움·깊은 심도). 풀스톱 = 1.4 → 2 → 2.8 → 4 → 5.6 → 8 → 11 → 16 → 22.
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #D97706', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, color: '#D97706', fontWeight: 700, margin: '0 0 4px' }}>⏱️ 셔터스피드 (Shutter)</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
              빛 받는 시간. 30s = 길음(밝음·흐림 위험) / 1/8000 = 짧음(어두움·정지). 1 stop = 2배. 30 → 15 → 8 → 4 → 2 → 1 → 1/2 …
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #DB2777', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, color: '#DB2777', fontWeight: 700, margin: '0 0 4px' }}>📊 ISO (감도)</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
              센서의 빛 증폭. ISO 100 = 깨끗 / ISO 51200 = 어두운 곳에서 촬영 가능하지만 노이즈. 1 stop = 2배. 100 → 200 → 400 → 800 …
            </p>
          </div>
        </div>
      </div>

      {/* 3. EV (Exposure Value) */}
      <h2 style={sectionTitle}>🌞 EV(Exposure Value) — 광량 단위 이해</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          EV는 <strong>ISO 100 기준 광량</strong>을 표현하는 표준 단위입니다. 1 EV 차이 = 2배 광량 차이(=1 stop).
          공식: <strong>EV = log₂(N² / t) − log₂(ISO/100)</strong> (N=조리개, t=셔터 초)
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 380 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th scope="col" style={{ padding: '6px 0', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>EV</th>
                <th scope="col" style={{ padding: '6px 0', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>광량</th>
                <th scope="col" style={{ padding: '6px 0', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>대표 상황</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['16', '눈·모래·반사', '직사광 + 반사광 (스키장)'],
                ['15', '맑은 한낮', 'Sunny 16 — 그림자 뚜렷'],
                ['13', '맑음 그늘', '나무 그늘 한낮'],
                ['12', '약간 흐림', '구름 약간'],
                ['10', '흐림', '두꺼운 구름·일몰 직전'],
                ['7~9', '실내 밝음', '창가·LED 매장'],
                ['4~6', '실내 어둑함', '백열등·식당'],
                ['0~3', '야경·새벽', '도시 야경 + 삼각대'],
                ['−3~−1', '달빛', '보름달 야외'],
                ['−6~−4', '별빛', '도심 외 별 사진'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 0', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>{row[0]}</td>
                  <td style={{ padding: '6px 0', color: 'var(--text)' }}>{row[1]}</td>
                  <td style={{ padding: '6px 0', color: 'var(--muted)' }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          → 카메라 측광이 EV 12를 가리키면 ISO 100·f/8 → 셔터 1/250(EV 12) 추천. 같은 EV의 등가 노출은 무수히 많아요.
        </p>
      </div>

      {/* 4. ND 필터 */}
      <h2 style={sectionTitle}>🌑 ND 필터 — 대낮에 장노출하기</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          ND(Neutral Density) 필터는 <strong>색을 변하지 않게 빛만 차단</strong>하는 회색 필터입니다.
          대낮에도 폭포 실크 효과(2초+), 안개 같은 파도(15초+) 등 장노출이 가능해요.
        </p>
        <ul style={{ paddingLeft: 18, margin: '12px 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>ND2/4/8</strong> (1~3 stop): 대낮 인물 + 조리개 활짝(보케)</li>
          <li><strong style={{ color: 'var(--text)' }}>ND16/32</strong> (4~5 stop): 폭포 실크 효과 (1/2 ~ 2초)</li>
          <li><strong style={{ color: 'var(--text)' }}>ND64/400</strong> (6~9 stop): 파도 안개·구름 흐름 (5 ~ 60초)</li>
          <li><strong style={{ color: 'var(--text)' }}>ND1000</strong> (10 stop): 일주·구름 streak (1 ~ 5분)</li>
        </ul>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>적층</strong>: ND8(3 stop) + ND64(6 stop) = 9 stop. 가변 ND 필터는 1개로 다양한 stop을 커버하지만 색번짐(X-pattern) 주의.
        </p>
      </div>

      {/* 5. Sunny 16 룰 */}
      <h2 style={sectionTitle}>☀️ Sunny 16 룰 — 측광 없이 노출 잡기</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          오래된 필름 시대 룰입니다. <strong>밝은 햇빛 + ISO 100 + 조리개 f/16 → 셔터 1/100</strong>이 적정 노출.
          여기서 한 stop씩 보정하면 모든 상황의 노출을 추정할 수 있어요.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 380 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th scope="col" style={{ padding: '6px 0', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>날씨</th>
                <th scope="col" style={{ padding: '6px 0', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>조리개 (ISO 100, 셔터 1/100 기준)</th>
                <th scope="col" style={{ padding: '6px 0', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>그림자</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['☀️ 밝은 햇빛',   'f/16',  '뚜렷 (Sunny 16 기본)'],
                ['🌤️ 약간 흐림',   'f/11',  '부드러움'],
                ['☁️ 흐림',        'f/8',   '거의 없음'],
                ['🌥️ 짙게 흐림',   'f/5.6', '없음'],
                ['🌫️ 일몰·흐림',  'f/4',   '없음'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 0', color: 'var(--text)' }}>{row[0]}</td>
                  <td style={{ padding: '6px 0', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>{row[1]}</td>
                  <td style={{ padding: '6px 0', color: 'var(--muted)' }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          → 카메라 측광이 잘못된 상황(역광·눈·검은 옷)에서 최후의 보루. 디지털도 RAW로 촬영 시 후보정 여유가 더 많아져요.
        </p>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 조리개 1/3 stop과 풀스톱 차이는?</summary>
        <p style={faqAnswer}>
          풀스톱은 <strong>1.4 → 2 → 2.8 → 4 → 5.6 → 8 → 11 → 16</strong>처럼 √2 배수로 변하는 전통 단위입니다(1 stop = 광량 2배).
          현대 카메라는 정밀 조절을 위해 <strong>1/3 stop</strong>(예: f/3.2, f/3.5, f/4) 단위로 세분화돼요.
          이 도구는 27개 조리개 값(풀 + 1/3 stop)을 지원하며, 슬라이더 인덱스 1당 1/3 stop 변화입니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 잠금(Lock) 토글은 어떻게 동작하나요?</summary>
        <p style={faqAnswer}>
          조리개·셔터·ISO 각각 <strong>독립 토글</strong>이며 <strong>최대 2개</strong>까지 동시에 잠글 수 있습니다.<br />
          • <strong>0개 (기본)</strong>: 자유 모드 — 각 슬라이더가 EV를 그대로 바꿈. 수동(M)모드로 한 변수씩 효과 학습.<br />
          • <strong>1개</strong>: 등가 노출 모드 — 잠근 축은 고정, 나머지 두 축이 서로 보정해 EV 유지.<br />
          → 조리개 잠금: 심도 유지 (Av 모드) / 셔터 잠금: 모션 유지 (Tv 모드) / ISO 잠금: 노이즈·화질 우선.<br />
          • <strong>2개</strong>: 1축 자유 — 두 축 고정, 남은 한 축만 움직임 → EV가 변함 (제약 시뮬).
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 등가 노출(Equivalent Exposure)이란?</summary>
        <p style={faqAnswer}>
          <strong>같은 EV 값을 가지는 다른 조합들</strong>을 의미합니다. 예: f/4·1/250·ISO 200 = f/2.8·1/500·ISO 200 = f/4·1/500·ISO 400.
          모두 같은 밝기지만 효과는 달라요 — 첫 번째는 인물 보케, 두 번째는 동작 정지, 세 번째는 약간의 노이즈.
          이 도구의 등가 노출 5종은 조리개 변화를 우선해 다양한 효과를 보여줍니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. ND 필터 stop을 어떻게 셔터로 환산?</summary>
        <p style={faqAnswer}>
          ND filter의 stop만큼 셔터를 <strong>2배씩 길게</strong> 만들면 같은 노출이 됩니다.<br />
          • ND8 (3 stop) + 원본 1/250 = 1/250 × 2³ = 1/250 × 8 = <strong>1/30 초</strong><br />
          • ND1000 (10 stop) + 원본 1/250 = 1/250 × 1024 = 약 <strong>4 초</strong><br />
          공식: 새 셔터 = 원본 셔터 × 2^stops. ND 탭의 영웅 카드가 자동 계산합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. Sunny 16 룰이 디지털에도 유효한가요?</summary>
        <p style={faqAnswer}>
          네, 광량 자체는 변하지 않으므로 <strong>완전히 유효</strong>합니다.
          현대 카메라의 측광이 더 정확하지만, Sunny 16은 <strong>측광이 속는 상황</strong>에서 백업 룰이 됩니다 — 역광, 눈, 검은 옷, 콘서트 무대 등.
          또한 측광에 의존하지 않고 노출을 이해하는 훈련에 매우 유용해요. M모드(수동)로 사진 찍는 사진가는 Sunny 16부터 시작합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 별 사진 500 룰이 정확한가요?</summary>
        <p style={faqAnswer}>
          개략적 가이드입니다. 공식: <strong>최대 셔터(초) = 500 / (초점거리 × 크롭 팩터)</strong>.
          24mm 풀프레임 → 500/24 = 약 20초까지 별이 점으로 보입니다.<br />
          • 더 정밀한 <strong>NPF 룰</strong>도 있지만 픽셀 피치 등 추가 변수 필요<br />
          • 고해상도 카메라(45MP+)는 <strong>300 룰</strong>이 더 안전 (300/24 = 12초)<br />
          • 별이 자글자글 보이면 셔터를 줄이고 ISO를 올리세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 영상 180° 셔터 룰이 뭔가요?</summary>
        <p style={faqAnswer}>
          영상에서 <strong>셔터 = 1 / (2 × fps)</strong>로 설정하면 자연스러운 모션 블러가 생깁니다.<br />
          • 24p → 1/50 (시네마 표준)<br />
          • 30p → 1/60<br />
          • 60p → 1/125<br />
          이름의 유래: 필름 시대 회전 셔터 디스크가 180° 열려 있던 데서 왔어요.
          더 빠른 셔터(1/200) → 동작 끊김(스포츠 영화 느낌). 더 느린 셔터 → 흐름 과해짐. 야외 촬영 시 ND 필터로 셔터 유지.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 풀프레임 vs APS-C 노출 차이?</summary>
        <p style={faqAnswer}>
          <strong>EV 자체는 동일</strong>합니다. f/2.8 + 1/250 + ISO 100은 어떤 센서든 같은 노출이에요.
          다만 다음이 달라집니다:<br />
          • <strong>심도</strong>: APS-C(×1.5)는 같은 조리개에서 풀프레임보다 심도가 깊음 (f/2.8 → 풀프레임 f/4 정도)<br />
          • <strong>화각</strong>: 50mm APS-C = 75mm 풀프레임 환산<br />
          • <strong>고감도 노이즈</strong>: 풀프레임이 1~2 stop 유리 (픽셀 면적 ↑)<br />
          하지만 노출 계산 자체는 센서 무관. 이 도구의 EV는 모든 센서에 적용됩니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 회절(Diffraction)이 뭔가요? f/22가 흐린 이유?</summary>
        <p style={faqAnswer}>
          조리개를 너무 좁히면(f/16+) 빛이 구멍 가장자리에서 휘어 <strong>해상력이 떨어집니다</strong> — 회절 현상.<br />
          • 풀프레임: f/8 ~ f/11이 가장 선명<br />
          • APS-C/M4/3: f/5.6 ~ f/8이 한계<br />
          • 스마트폰: f/2.8 정도가 최선<br />
          심도가 절대 필요할 때(접사·풍경)만 f/16+ 사용하고, 일반 풍경은 f/8~f/11이 화질·심도 균형 최적.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 안전 셔터 룰(Safe Shutter)은?</summary>
        <p style={faqAnswer}>
          삼각대 없이 손으로 들고 찍을 때 흔들림 방지 셔터: <strong>1 / (초점거리 × 크롭 팩터)</strong> 이상.<br />
          • 50mm 풀프레임 → 1/50 이상<br />
          • 200mm 풀프레임 → 1/200 이상<br />
          • 200mm APS-C → 1/300 이상 (200×1.5)<br />
          현대 카메라의 <strong>손떨림 보정(IBIS)</strong>으로 5~7 stop까지 도움 받을 수 있어, 50mm + IBIS → 1/2초도 가능.
          그래도 본인 손떨림과 호흡을 고려해 1~2 stop 여유 두는 게 좋습니다.
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/art/color" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🎨</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>색상 팔레트 변환기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            HEX·RGB·HSL·CMYK 변환
          </p>
        </Link>
        <Link href="/tools/art/golden-ratio" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📐</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>황금비율 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            구도·디자인 황금비
          </p>
        </Link>
        <Link href="/tools/edu/sound-speed" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔊</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>소리 속도 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            번개·천둥 거리 계산
          </p>
        </Link>
      </div>
    </div>
  )
}
