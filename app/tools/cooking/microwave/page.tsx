import Link from 'next/link'
import MicrowaveClient from './MicrowaveClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/cooking/microwave',
  title: '전자레인지 출력 환산기 — 700W·900W·1200W + 식품·타이머',
  description: '600W 레시피를 우리집 800W에선 몇 분? 햇반·만두·즉석국 등 한국 식품 12종 프리셋 + 카운트다운 타이머와 안전 가이드.',
  keywords: ['전자레인지 환산', '700W 900W', '냉동밥 시간', '햇반 데우기', '냉동만두', '즉석국', '전자레인지 W', '카운트다운 타이머', '용기 안전', '계란 폭발'],
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

export default function MicrowavePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        요리·식품
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔥 전자레인지 출력 환산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        600W 레시피를 <strong style={{ color: 'var(--text)' }}>우리집 800W에선 몇 분?</strong> 한국 식품 12종 프리셋 + 카운트다운 타이머.
      </p>

      <MicrowaveClient />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>출력 환산 탭</strong> — 라벨 W·시간 입력 → 내 전자레인지 시간 자동 (W별 비교 막대)</li>
          <li><strong>식품 프리셋 탭</strong> — 12 식품 중 선택 → 양·온도 보정 자동</li>
          <li><strong>타이머 탭</strong> — 환산된 시간으로 즉시 카운트다운 + 종료 알림음</li>
          <li><strong>가이드 탭</strong> — 안전 용기·금지 용기·골든 팁 10가지</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 환산 결과를 <strong style={{ color: 'var(--accent)' }}>&quot;⏱️ 타이머 시작&quot;</strong> 버튼으로 즉시 카운트다운 가능.
          마지막 3초 비프 + 종료 시 3회 비프음.
        </p>
      </div>

      {/* 2. W 환산 공식 */}
      <h2 style={sectionTitle}>⚡ W 환산 공식과 보정</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          전자레인지 출력(W)이 다르면 같은 음식이라도 가열 시간이 비례 반대로 달라집니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 14, color: 'var(--accent)', margin: 0, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, lineHeight: 2 }}>
            새 시간 = 기준 시간 × (기준 W / 새 W)
          </p>
        </div>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>예: 700W 5분 → 900W</strong>: 5 × (700/900) ≈ <strong>3분 53초</strong></li>
          <li><strong style={{ color: 'var(--text)' }}>예: 700W 5분 → 600W</strong>: 5 × (700/600) ≈ <strong>5분 50초</strong></li>
          <li><strong style={{ color: 'var(--text)' }}>저출력 (≤600W)</strong>: 효율이 떨어져 시간 +5~10% 보정 자동 적용</li>
          <li><strong style={{ color: 'var(--text)' }}>고출력 (≥1000W)</strong>: 시간 -5% 보정 (살짝 더 빠름)</li>
        </ul>
      </div>

      {/* 3. 한국 시장 식품 가이드 */}
      <h2 style={sectionTitle}>🍱 한국 시장 냉동·즉석 식품 가이드</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>식품</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>700W 표준</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>핵심 팁</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['🍚 햇반·즉석밥',     '2분',          '뚜껑 살짝 열기 + 데운 후 한 번 섞기'],
                ['🥟 냉동만두',        '1.5분 + 휴지 + 1분', '휴지(레스팅)가 균일 가열 핵심'],
                ['🍕 냉동피자',        '3분',          '오븐 토스터가 더 좋음 (가장자리 타기 쉬움)'],
                ['🍱 냉동도시락',      '4분',          '위치별 가열 차이 큼, 중간 회전 권장'],
                ['🥣 즉석국 (CJ·오뚜기)', '2.5분',     '비닐 끝 1~2cm 자르기 (폭발 방지)'],
                ['🍙 편의점 도시락',   '2~3분',        '뚜껑 비닐 끝 제거'],
                ['🥛 우유 (200ml)',    '1분',         '30초씩 분할 + 컵 80%만 (끓어 넘침)'],
                ['🍞 빵',              '10초 단위',    '물 한 방울 뿌리면 부드러움 유지'],
                ['🍳 계란 통째',       '🚨 절대 X',    '폭발 위험. 풀어서만 가열'],
                ['🍡 떡',              '30초',        '물 1~2 스푼, 비닐 X'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '9px 12px',
                      fontFamily: j === 0 ? 'Noto Sans KR, sans-serif' : (j === 1 ? 'Inter, system-ui, sans-serif' : 'Noto Sans KR, sans-serif'),
                      color: j === 1 ? 'var(--accent)' : (j === 0 ? 'var(--text)' : 'var(--muted)'),
                      fontWeight: j === 0 || j === 1 ? 700 : 400,
                      fontSize: 12.5,
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 안전·금지 용기 */}
      <h2 style={sectionTitle}>🥡 안전한 용기 · 금지 용기</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { t: '✅ 사용 가능', c: '#0D9488', items: ['도자기', '내열유리 (파이렉스)', 'PP 5번 플라스틱', '키친타올'] },
            { t: '⚠️ 주의', c: '#D97706', items: ['전용 비닐 (한쪽 끝 자르기)', '멜라민 (저출력만)', '오래된 도자기 (테두리 X)'] },
            { t: '❌ 절대 금지', c: '#DB2777', items: ['알루미늄 호일·캔', '금속 그릇·포크', '금색·은색 테두리', '일반 플라스틱', '계란 통째', '닫힌 캔·용기'] },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 6px' }}>{g.t}</p>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--muted)', lineHeight: 1.8 }}>
                {g.items.map((it, j) => <li key={j}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ⚠️ <strong style={{ color: '#DB2777' }}>가장 흔한 사고</strong>: 금색·은색 테두리 그릇(중고·빈티지 식기) → 스파크 발생.
          <strong> 빈 가열</strong>은 마그네트론(본체) 손상 — 절대 X.
        </p>
      </div>

      {/* 5. 골든 팁 */}
      <h2 style={sectionTitle}>💡 전자레인지 골든 팁 10가지</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>중간에 한 번 섞기</strong> — 가운데 안 데워질 때</li>
          <li><strong>가장자리에 음식 두기</strong> — 가운데보다 빠름</li>
          <li><strong>냉동밥은 물 1스푼</strong> — 갓 지은 밥처럼</li>
          <li><strong>빵은 10초 단위</strong> — 오래 데우면 딱딱</li>
          <li><strong>비닐은 한쪽 끝 자르기</strong> — 폭발 방지</li>
          <li><strong>저어주며 데우기</strong> — 끓어 넘침 방지</li>
          <li><strong>휴지(레스팅) 활용</strong> — 만두·도시락 균일 가열</li>
          <li><strong>80%로 시작 → 부족하면 추가</strong> — 과조리 방지</li>
          <li><strong>키친타올 활용</strong> — 빵 보온, 튀김 기름 흡수</li>
          <li><strong>꺼낼 때 화상 주의</strong> — 그릇 매우 뜨거움</li>
        </ol>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 700W를 900W로 바꾸면 시간이 얼마나 줄어드나요?</summary>
        <p style={faqAnswer}>
          공식: 새 시간 = 기준 시간 × (기준 W / 새 W).<br />
          • <strong>700W 2분</strong> → 900W: 2 × (700/900) ≈ <strong>1분 33초</strong> (약 22% 감소)<br />
          • <strong>700W 5분</strong> → 900W: 5 × (700/900) ≈ <strong>3분 53초</strong><br />
          • <strong>700W 1분</strong> → 1000W: 1 × (700/1000) = <strong>42초</strong> (1000W 보정 -5% 추가)<br />
          기억하기 쉬운 비율: 700W → 900W는 약 <strong>78%</strong>의 시간이면 충분.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 출력이 낮을수록 시간이 더 필요한 이유?</summary>
        <p style={faqAnswer}>
          전자레인지의 W는 음식에 전달되는 <strong>마이크로파 에너지의 양</strong>입니다.
          저출력일수록 같은 시간에 전달되는 에너지가 적어 가열에 더 오래 걸립니다.
          또한 <strong>저출력은 효율도 함께 떨어져</strong> 단순 비례보다 5~10% 더 시간 필요.
          본 도구는 600W 이하에 자동 +7% 보정을 적용합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 양을 2배로 하면 시간도 2배인가요?</summary>
        <p style={faqAnswer}>
          <strong>아니요.</strong> 양이 늘면 시간은 <strong>비선형(N^0.75)</strong>으로 증가합니다.<br />
          • 1인분 → 2인분: ×<strong>1.68</strong> (2배 X)<br />
          • 1인분 → 3인분: ×<strong>2.28</strong><br />
          • 1인분 → 5인분: ×<strong>3.34</strong><br />
          이유: 양이 많아도 표면적은 비례 증가하지 않고, 마이크로파가 동시에 여러 부분을 가열하기 때문.
          정확한 보정은 식품 프리셋 탭의 인분 슬라이더에서 자동 계산됩니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 냉동·냉장·상온 시작 온도 차이?</summary>
        <p style={faqAnswer}>
          시작 온도가 높을수록 시간이 적게 듭니다.<br />
          • <strong>❄️ 냉동 (-18°C)</strong>: 라벨 표준<br />
          • <strong>🧊 냉장 (4°C)</strong>: 표준 대비 <strong>-20%</strong><br />
          • <strong>🌡️ 상온 (20°C)</strong>: 표준 대비 <strong>-40%</strong><br />
          예: 햇반 700W 2분(냉동) → 냉장 보관이면 1분 36초, 상온이면 1분 12초.
          단 상온 보관은 식품 안전상 권장하지 않으니 냉장 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 계란을 전자레인지에 데우면 왜 안 되나요?</summary>
        <p style={faqAnswer}>
          🚨 <strong>폭발 위험</strong> 때문입니다. 계란 노른자·흰자가 가열되면 내부 수증기 압력이 급격히 상승하지만
          껍질이 압력을 가두어 <strong>폭발</strong>이 일어납니다. 입에 넣고 씹는 순간 폭발한 사례도 있어 부상 위험 큼.<br />
          • ❌ <strong>통째 가열 절대 금지</strong><br />
          • ✅ 계란을 깨서 그릇에 풀거나, 노른자에 칼집을 낸 후 가열<br />
          • ✅ 삶은 계란을 데우려면 반으로 잘라서 가열<br />
          이는 메추리알·생선 알·소시지 통째 등 <strong>껍질 있는 모든 식품</strong>에 해당.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 알루미늄 호일·금속 그릇은 왜 안 되나요?</summary>
        <p style={faqAnswer}>
          🚨 <strong>스파크 → 화재 위험</strong>. 마이크로파가 금속 표면에 닿으면 전자가 급격히 이동하며
          작은 번개(스파크)가 발생합니다. 심하면 마그네트론(본체) 손상·화재.<br />
          • ❌ 알루미늄 호일·캔·금속 그릇·포크·금색·은색 테두리 그릇<br />
          • ❌ 빵의 트위스트 타이(철사 포함)<br />
          • ⚠️ 가장 흔한 사고: <strong>금색·은색 테두리 도자기</strong> (중고·빈티지 주의)<br />
          • ✅ 도자기·내열유리·PP 5번 플라스틱만 안전.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 비닐 봉지째 데워도 되나요?</summary>
        <p style={faqAnswer}>
          <strong>전용 비닐만 가능</strong>. 그것도 <strong>한쪽 끝을 1~2cm 잘라야</strong> 폭발 방지.<br />
          • ✅ CJ·오뚜기 즉석국 등 전자레인지용 표시 — 끝 자르고 OK<br />
          • ⚠️ 일반 비닐은 녹거나 환경호르몬 용출<br />
          • ❌ 닫힌 비닐 그대로는 폭발<br />
          제일 안전한 방법은 <strong>내열 그릇에 옮긴 후 가열</strong>. 위생적이고 균일하게 가열됨.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 가운데가 안 데워지는 이유?</summary>
        <p style={faqAnswer}>
          마이크로파는 음식 표면에서 <strong>약 2~4cm 안쪽</strong>까지만 직접 가열.
          가운데는 열 전도로 데워져 시간이 걸립니다.<br />
          해결법:<br />
          1. <strong>중간에 한 번 섞기</strong> (1/2 지점에서 멈추고 휘젓기)<br />
          2. <strong>가장자리에 음식 두기</strong> (도넛 형태 배치)<br />
          3. <strong>휴지 활용</strong> (가열 → 1분 휴지 → 추가 가열)<br />
          4. <strong>회전판 청소</strong> (회전이 안 되면 가열 매우 불균일)
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 빵을 데우면 왜 딱딱해지나요?</summary>
        <p style={faqAnswer}>
          마이크로파는 빵 안의 <strong>수분을 빠르게 날려버려서</strong> 식는 즉시 딱딱해집니다.
          (수분 빠진 빵 = 굳은 빵)<br />
          해결법:<br />
          • <strong>10초 단위로 짧게</strong> 가열 (오래 X)<br />
          • <strong>물 한 방울 뿌리고</strong> 가열 (수분 보충)<br />
          • <strong>젖은 키친타올 위에 빵</strong> 올려 가열 (찜 효과)<br />
          • 가장 좋은 방법은 <strong>오븐 토스터·후라이팬</strong>. 전자레인지는 비상용으로만.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 햇반 데우는 표준 시간은?</summary>
        <p style={faqAnswer}>
          햇반 라벨 기준 <strong>1000W 2분 / 700W 2분 30초~3분</strong>.<br />
          내 전자레인지 W로 환산:<br />
          • <strong>600W</strong>: 약 3분 30초<br />
          • <strong>700W</strong>: 약 2분 30초~3분<br />
          • <strong>800W</strong>: 약 2분 15초<br />
          • <strong>900W</strong>: 약 2분<br />
          • <strong>1000W</strong>: 약 1분 50초<br />
          • <strong>1200W</strong>: 약 1분 30초<br />
          데운 후 <strong>한 번 섞어주면</strong> 갓 지은 밥처럼 부드러움. 본 도구의 식품 프리셋 탭에서 정확히 계산됩니다.
        </p>
      </details>

      {/* cooking 도구 크로스링크 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/cooking/thawing" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🧊</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해동 시간 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            식품·두께·전자레인지 W별 4 해동
          </p>
        </Link>
        <Link href="/tools/cooking/frying" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🍳</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>튀김 시간 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            기름 온도·에어프라이어 변환
          </p>
        </Link>
        <Link href="/tools/cooking/ramen" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🍜</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>라면 물양 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            1~4개·국물 농도·라면별
          </p>
        </Link>
      </div>
    </div>
  )
}
