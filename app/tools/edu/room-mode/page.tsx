import Link from 'next/link'
import RoomModeClient from './RoomModeClient'
import { buildMetadata } from '@/lib/seo'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/edu/room-mode',
  title: '룸 모드 계산기 — 홈오디오·홈스튜디오 평면도·베이스 트랩 가이드',
  description: '방 가로·세로·높이 → 축방향·접선·사선 모드 30+ + 슈로더 주파수·평면도 시각화·38% 룰·베이스 트랩 가이드.',
  keywords: ['룸 모드', '룸 모드 계산기', '베이스 트랩', '슈로더 주파수', '38% 룰', 'Bolt Area', 'Sepmeyer 황금비', '홈오디오', '홈스튜디오', '음향 측정'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
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
  { "q":"룸 모드는 왜 생기나요?","a":"밀폐된 방 안에서 음파가 평행 벽 사이를 왕복하며 같은 위상으로 만나면 정상파(standing wave)를 만듭니다. 이 정상파는 특정 주파수에서만 강하게 발생해 음압 분포가 불균등해져요. 예: 5m 방의 1차 축방향 모드 = 343/(2×5) = 34.3Hz. 이 주파수에서 벽 근처는 음압 최대(부풀림), 중앙은 음압 0(노드)." },
  { "q":"가장 안 좋은 방 형태는?","a":"정육면체 (1:1:1) 또는 두 축이 같은 방 (1:1:N)이 최악입니다. 세 축의 모드가 같은 주파수에 중첩되면서 부밍이 매우 심해집니다. 예: 3×3×3m 방은 가로·세로·높이 모두 같아 1차 모드가 모두 57Hz에 몰림 → 57Hz 부밍 심각. 가장 좋은 비율은 Sepmeyer 황금비 1:1.14:1.39." },
  { "q":"슈로더 주파수가 뭔가요?","a":"룸 모드가 지배하는 영역과 일반 음향의 경계입니다. 이 미만에서는 모드 영향이 압도적이라 EQ·이퀄라이저로 보정이 잘 안 되고, 베이스 트랩 같은 물리적 처리가 필요합니다. 공식: fs = 2000 × √(RT60 / V) — 일반 거실 약 100~200Hz. 본 도구는 RT60=0.4초 가정으로 계산합니다 (보통 거실 평균치)." },
  { "q":"38% 룰은 무엇인가요?","a":"Wilson Audio의 청취자 위치 가이드라인. 방 길이의 38% 지점(앞 벽 기준)에 청취자를 두면 1·2차 룸 모드의 노드(음압 0 지점)가 겹치는 위치가 되어 저음이 가장 균형 잡힙니다. 예: 5m 방 → 앞 벽에서 1.9m 지점. 스피커는 청취자와 정삼각형, 측벽에서 0.8~1.2m, 뒤 벽에서 0.5~1.0m 권장. 평면도 탭에서 38% 라인이 자동 표시됩니다." },
  { "q":"정육면체 방은 왜 나쁜가요?","a":"세 축의 룸 모드가 같은 주파수에 중첩되어 음압이 3배로 부풀고, 다른 주파수는 비어버려 분포가 매우 불균일. 예: 3×3×3m 방은 1차 모드 57Hz가 가로·세로·높이 모두 동일해 그 주파수에서 부밍 폭증. 반대로 1:1.14:1.39 황금비는 모드가 균등 분포되어 부밍 최소화." },
  { "q":"베이스 트랩은 꼭 필요한가요?","a":"음향에 신경 쓴다면 거의 필수입니다. 특히 슈로더 주파수 미만 영역의 부밍은 EQ로 잡기 어려워요. • 홈오디오·HiFi 매니아: 코너 트랩 4개 + 벽 트랩 2~4개 • 홈스튜디오 (믹싱·녹음): 트랩 + 흡음재 + 디퓨저 종합 • 일반 시청 환경: 코너 트랩 2~4개만으로도 큰 개선 DIY로 글라스울·록울 + 천 마감 시 5~10만원/개로 가능." },
  { "q":"황금비 1:1.14:1.39를 못 맞추면?","a":"맞추기 어려우면 가구 배치·트랩으로 보완하세요. • 책장·소파가 자연스러운 흡음·산란 역할 • 코너에 책장 배치로 모드 압력점 차단 • 러그·커튼으로 1차 반사 흡수 • 측정 마이크 + REW로 부밍 주파수 특정 후 EQ로 보정 완벽한 비율보다는 충분한 흡음재 + 정확한 청취 위치가 더 중요해요." },
  { "q":"모드와 부밍·먹먹함의 관계?","a":"• 부밍(Boomy): 특정 저주파(50~150Hz)가 부풀어 \"웅~\" 울림 — 룸 모드의 음압 최대 지점에서 발생 • 먹먹함(Muddy): 100~300Hz 대역이 답답함 — 모드 중첩 + 1차 반사음 영향 • 해결: ① 청취 위치 변경 (38% 룰) ② 베이스 트랩 (코너) ③ 1차 반사 지점 흡음 ④ 측정 후 EQ" },
  { "q":"측정 마이크 없이 어떻게 확인?","a":"정확한 측정은 어렵지만 다음 방법으로 대략 확인 가능: 1. 본 도구로 모드 주파수 예측 → 어디에 부밍이 있을지 미리 파악 2. 유튜브에서 사인파 재생 → 본 도구가 표시한 주파수(예: 60·80·100Hz) 재생하며 청취 위치 이동 3. 박수 테스트 → 박수 후 잔향 방향·시간으로 모드 감지 4. 진지하게 한다면 측정 마이크(미니DSP UMIK-1, 15만원) + REW 무료로 정확 측정 권장." },
  { "q":"가구·소파가 룸 모드에 영향?","a":"영향이 큽니다. 본 도구는 비어 있는 직사각형 방 가정이므로 실제와 차이가 있어요. • 책장·옷장: 음 산란 + 일부 흡음 (긍정적) • 큰 소파·매트리스: 저음 흡수에 도움 • 두꺼운 러그·커튼: 중·고음 흡수 • 문·창문: 음 누출 (모드 약화 효과) 가구로 자연스럽게 흡음·산란이 이뤄지면 베이스 트랩 부담이 줄어요. 반대로 모든 벽이 콘크리트·유리·반사재면 모드가 최악으로 작동합니다." }
]

export default function RoomModePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        교육·학습
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔊 룸 모드 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        방 가로·세로·높이로 축방향·접선·사선 모드 + <strong style={{ color: 'var(--text)' }}>슈로더 주파수와 베이스 트랩</strong> 가이드.
      </p>

      <RoomModeClient />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>방 치수 입력</strong> — 가로 W·세로 L·높이 H (또는 한국 거실 프리셋)</li>
          <li><strong>온도 조정</strong> — 음속에 영향 (20°C → 343 m/s)</li>
          <li><strong>모드 분석 탭</strong>에서 30+ 룸 모드 + 슈로더 주파수 + 부밍 위험 구간 확인</li>
          <li><strong>평면도 탭</strong>에서 스피커·청취자 위치를 드래그하며 음압 분포 시각화</li>
          <li><strong>비율 진단 탭</strong>에서 Bolt Area·Bonello로 음향적 우수성 등급</li>
          <li><strong>트랩 탭</strong>에서 본인 방 크기에 맞는 베이스 트랩 권장 수량·비용 확인</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>평면도 SVG의 마커를 직접 드래그</strong>해
          청취자 점수 100점에 가까운 위치를 찾을 수 있어요. 38% 룰 라인이 자동으로 표시됩니다.
        </p>
      </div>

      {/* 2. 룸 모드 3종 */}
      <h2 style={sectionTitle}>🌊 룸 모드란? — Axial · Tangential · Oblique 3종</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          밀폐된 방 안에서 음파가 평행 벽 사이를 왕복하며 정상파(standing wave)를 만드는 현상입니다.
          특정 주파수에서 음압이 부풀거나 약해져 <strong>부밍(boomy)·먹먹함(muddy)</strong>의 원인.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 12 }}>
          {[
            { t: '🔴 축방향 (Axial)', d: '한 축의 평행 벽 2개 사이. 가장 강한 모드. 가로·세로·높이 각 5차까지.', c: '#DB2777' },
            { t: '🟡 접선 (Tangential)', d: '4개 벽 사이. 중간 강도. 축방향의 약 70%.', c: '#D97706' },
            { t: '🟢 사선 (Oblique)', d: '6개 벽 모두 사이. 가장 약한 모드. 축방향의 약 40%.', c: '#0D9488' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.9 }}>
            <strong style={{ color: 'var(--accent)' }}>Rayleigh 공식</strong>:<br />
            f(p,q,r) = (c/2) × √[(p/L)² + (q/W)² + (r/H)²]<br />
            <span style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 12, color: 'var(--muted)' }}>
              c = 음속 (343 m/s @ 20°C), p·q·r = 0,1,2... (모드 차수)
            </span>
          </p>
        </div>
      </div>

      {/* 3. 슈로더 주파수 */}
      <h2 style={sectionTitle}>📏 슈로더 주파수와 모드 지배 영역</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          <strong>슈로더 주파수(Schroeder Frequency)</strong>는 룸 모드가 지배하는 영역과 일반적인 음향이 지배하는 영역의 경계입니다.
          이 주파수 미만에서는 룸 모드가 음향을 좌우하므로 <strong>베이스 트랩이 가장 효과적</strong>이에요.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.9 }}>
            fs = 2000 × √(RT60 / V)<br />
            <span style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 12, color: 'var(--muted)' }}>
              RT60 = 잔향시간 (일반 거실 0.4초), V = 방 체적 (m³)
            </span>
          </p>
        </div>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>일반 거실 (40~50 m³)</strong>: 슈로더 약 130~140Hz</li>
          <li><strong style={{ color: 'var(--text)' }}>작은 방 (20~30 m³)</strong>: 슈로더 약 160~200Hz</li>
          <li><strong style={{ color: 'var(--text)' }}>홈스튜디오 (30~40 m³)</strong>: 슈로더 약 150~180Hz</li>
          <li>이 주파수 <strong>미만</strong> 모드가 부밍의 주범</li>
        </ul>
      </div>

      {/* 4. 38% 룰 */}
      <h2 style={sectionTitle}>🎯 38% 룰 — 청취자·스피커 위치</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          <strong>Wilson Audio</strong>가 제안한 가장 유명한 청취자 위치 가이드라인.
          청취자를 방 길이의 <strong>38% 위치 (앞 벽에서)</strong>에 두면 1차·2차 룸 모드의 노드가 만나는 지점이 됩니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.9 }}>
            예시: 방 길이 5m → 청취자는 <strong style={{ color: 'var(--accent)' }}>앞 벽에서 1.9m 지점</strong><br />
            스피커는 청취자와 정삼각형을 이루고, 측벽에서 <strong style={{ color: 'var(--accent)' }}>0.8~1.2m 떨어뜨림</strong>
          </p>
        </div>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li>📐 청취자 = 방 길이의 38% (앞 벽 기준)</li>
          <li>📏 스피커 ↔ 청취자 = 정삼각형 (1.5~2.5m)</li>
          <li>📐 스피커 측벽 = 0.8~1.2m</li>
          <li>📐 스피커 뒤 벽 = 0.5~1.0m (가까우면 부밍, 멀면 위상 문제)</li>
        </ul>
      </div>

      {/* 5. 베이스 트랩 */}
      <h2 style={sectionTitle}>🛡️ 베이스 트랩 — 종류·시공·DIY 가이드</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          베이스 트랩은 <strong>저주파 음압이 가장 높은 코너</strong>에 설치해 룸 모드를 흡수하는 음향 패널입니다.
          종류별 효과 주파수와 시공 위치가 다르니 본인 방 크기·예산에 맞춰 선택하세요.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 12 }}>
          {[
            { t: '코너 트랩', d: '가장 강력. 모든 축 모드 압력 최대 지점이 코너. 60Hz~ 효과.', c: '#DB2777' },
            { t: '벽 트랩', d: '1차 반사 지점에 부착. 100Hz~ 중·고음 흡수.', c: '#D97706' },
            { t: '멤브레인 트랩', d: '저주파 전용. 40Hz~ 특정 주파수 대역 흡수.', c: '#0891B2' },
            { t: '헬름홀츠', d: '특정 주파수 정확 흡수. 30Hz~ 튜닝 가능.', c: '#0D9488' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          <strong>일반 거실 기본 패키지</strong>: DIY 50~100만원 / 완제품 100~300만원 (코너 트랩 4 + 벽 트랩 4 + 천장 1~2)
        </p>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 룸 모드는 왜 생기나요?</summary>
        <p style={faqAnswer}>
          밀폐된 방 안에서 <strong>음파가 평행 벽 사이를 왕복</strong>하며 같은 위상으로 만나면 정상파(standing wave)를 만듭니다.
          이 정상파는 <strong>특정 주파수에서만 강하게 발생</strong>해 음압 분포가 불균등해져요. 예: 5m 방의 1차 축방향 모드 = 343/(2×5) = 34.3Hz.
          이 주파수에서 벽 근처는 음압 최대(부풀림), 중앙은 음압 0(노드).
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 가장 안 좋은 방 형태는?</summary>
        <p style={faqAnswer}>
          <strong>정육면체 (1:1:1) 또는 두 축이 같은 방 (1:1:N)</strong>이 최악입니다.
          세 축의 모드가 같은 주파수에 중첩되면서 부밍이 매우 심해집니다.
          예: 3×3×3m 방은 가로·세로·높이 모두 같아 1차 모드가 모두 57Hz에 몰림 → 57Hz 부밍 심각.
          가장 좋은 비율은 <strong>Sepmeyer 황금비 1:1.14:1.39</strong>.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 슈로더 주파수가 뭔가요?</summary>
        <p style={faqAnswer}>
          <strong>룸 모드가 지배하는 영역과 일반 음향의 경계</strong>입니다.
          이 미만에서는 모드 영향이 압도적이라 EQ·이퀄라이저로 보정이 잘 안 되고, 베이스 트랩 같은 물리적 처리가 필요합니다.<br />
          공식: fs = 2000 × √(RT60 / V) — 일반 거실 약 100~200Hz.<br />
          본 도구는 RT60=0.4초 가정으로 계산합니다 (보통 거실 평균치).
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 38% 룰은 무엇인가요?</summary>
        <p style={faqAnswer}>
          <strong>Wilson Audio</strong>의 청취자 위치 가이드라인. 방 길이의 38% 지점(앞 벽 기준)에 청취자를 두면
          1·2차 룸 모드의 노드(음압 0 지점)가 겹치는 위치가 되어 저음이 가장 균형 잡힙니다.<br />
          예: 5m 방 → 앞 벽에서 1.9m 지점.<br />
          스피커는 청취자와 정삼각형, 측벽에서 0.8~1.2m, 뒤 벽에서 0.5~1.0m 권장.
          평면도 탭에서 38% 라인이 자동 표시됩니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 정육면체 방은 왜 나쁜가요?</summary>
        <p style={faqAnswer}>
          세 축의 룸 모드가 <strong>같은 주파수에 중첩</strong>되어 음압이 3배로 부풀고, 다른 주파수는 비어버려 분포가 매우 불균일.
          예: 3×3×3m 방은 1차 모드 57Hz가 가로·세로·높이 모두 동일해 그 주파수에서 부밍 폭증.
          반대로 <strong>1:1.14:1.39 황금비</strong>는 모드가 균등 분포되어 부밍 최소화.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 베이스 트랩은 꼭 필요한가요?</summary>
        <p style={faqAnswer}>
          음향에 신경 쓴다면 <strong>거의 필수</strong>입니다. 특히 슈로더 주파수 미만 영역의 부밍은 EQ로 잡기 어려워요.<br />
          • <strong>홈오디오·HiFi 매니아</strong>: 코너 트랩 4개 + 벽 트랩 2~4개<br />
          • <strong>홈스튜디오 (믹싱·녹음)</strong>: 트랩 + 흡음재 + 디퓨저 종합<br />
          • <strong>일반 시청 환경</strong>: 코너 트랩 2~4개만으로도 큰 개선<br />
          DIY로 글라스울·록울 + 천 마감 시 5~10만원/개로 가능.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 황금비 1:1.14:1.39를 못 맞추면?</summary>
        <p style={faqAnswer}>
          맞추기 어려우면 <strong>가구 배치·트랩으로 보완</strong>하세요.<br />
          • <strong>책장·소파</strong>가 자연스러운 흡음·산란 역할<br />
          • <strong>코너에 책장 배치</strong>로 모드 압력점 차단<br />
          • <strong>러그·커튼</strong>으로 1차 반사 흡수<br />
          • 측정 마이크 + REW로 부밍 주파수 특정 후 EQ로 보정<br />
          완벽한 비율보다는 <strong>충분한 흡음재 + 정확한 청취 위치</strong>가 더 중요해요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 모드와 부밍·먹먹함의 관계?</summary>
        <p style={faqAnswer}>
          • <strong>부밍(Boomy)</strong>: 특정 저주파(50~150Hz)가 부풀어 &quot;웅~&quot; 울림 — 룸 모드의 음압 최대 지점에서 발생<br />
          • <strong>먹먹함(Muddy)</strong>: 100~300Hz 대역이 답답함 — 모드 중첩 + 1차 반사음 영향<br />
          • <strong>해결</strong>: ① 청취 위치 변경 (38% 룰) ② 베이스 트랩 (코너) ③ 1차 반사 지점 흡음 ④ 측정 후 EQ
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 측정 마이크 없이 어떻게 확인?</summary>
        <p style={faqAnswer}>
          정확한 측정은 어렵지만 다음 방법으로 대략 확인 가능:<br />
          1. <strong>본 도구로 모드 주파수 예측</strong> → 어디에 부밍이 있을지 미리 파악<br />
          2. <strong>유튜브에서 사인파 재생</strong> → 본 도구가 표시한 주파수(예: 60·80·100Hz) 재생하며 청취 위치 이동<br />
          3. <strong>박수 테스트</strong> → 박수 후 잔향 방향·시간으로 모드 감지<br />
          4. 진지하게 한다면 <strong>측정 마이크(미니DSP UMIK-1, 15만원)</strong> + <strong>REW 무료</strong>로 정확 측정 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 가구·소파가 룸 모드에 영향?</summary>
        <p style={faqAnswer}>
          영향이 큽니다. 본 도구는 <strong>비어 있는 직사각형 방 가정</strong>이므로 실제와 차이가 있어요.<br />
          • <strong>책장·옷장</strong>: 음 산란 + 일부 흡음 (긍정적)<br />
          • <strong>큰 소파·매트리스</strong>: 저음 흡수에 도움<br />
          • <strong>두꺼운 러그·커튼</strong>: 중·고음 흡수<br />
          • <strong>문·창문</strong>: 음 누출 (모드 약화 효과)<br />
          가구로 자연스럽게 흡음·산란이 이뤄지면 베이스 트랩 부담이 줄어요.
          반대로 <strong>모든 벽이 콘크리트·유리·반사재</strong>면 모드가 최악으로 작동합니다.
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/edu/sound-speed" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔊</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>음속 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            천둥·번개 거리·반향·RT60
          </p>
        </Link>
        <Link href="/tools/interior/lighting" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>💡</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>조명 밝기 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            공간별 권장 루멘
          </p>
        </Link>
        <Link href="/tools/interior/wire" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>⚡</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>전선 굵기·허용전류</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            홈오디오 전원·앰프 회로
          </p>
        </Link>
      </div>
    </div>
  )
}
