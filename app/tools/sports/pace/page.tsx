import Link from 'next/link'
import PaceClient from './PaceClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/sports/pace',
  title: '러닝 페이스 계산기 — 마라톤 완주 시간·트레드밀·구간 스플릿',
  description: '페이스↔완주 시간 1줄 입력. 5km·10km·하프·풀 구간별 스플릿 자동, 트레드밀 시속 변환, 400m 트랙 바퀴 시간, 1마일 페이스, 본인 페이스 자동 저장.',
  keywords: ['러닝페이스계산기', '마라톤페이스계산기', '트레드밀시속변환', '달리기페이스', '마라톤완주시간', '400m트랙페이스', '러닝스플릿', '서브3 페이스', '서브4 페이스', '구간 스플릿', '네거티브 스플릿'],
})

export default function PacePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏃 러닝 페이스 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        페이스↔완주 시간 <strong style={{ color: 'var(--text)' }}>1줄 입력</strong>, 트레드밀 시속 변환, 5km·10km·하프·풀 구간별 스플릿, 본인 페이스 자동 저장.
      </p>

      <PaceClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 페이스 기준표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            페이스별 완주 예상 시간 기준표
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            아래 표는 일정 페이스를 끝까지 유지했을 때의 이론적 완주 시간입니다. 실제 레이스에서는 후반부 페이스 저하를 고려해 목표 시간보다 약간 빠른 페이스로 출발하는 것이 일반적입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>페이스(/km)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>시속(km/h)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>5km</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>10km</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>하프(21km)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>풀(42km)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['4:00', '15.0', '20:00', '40:00', '1:24:23', '2:49:44'],
                  ['4:30', '13.3', '22:30', '45:00', '1:34:56', '3:09:53'],
                  ['5:00', '12.0', '25:00', '50:00', '1:45:29', '3:30:58'],
                  ['5:30', '10.9', '27:30', '55:00', '1:56:02', '3:51:04'],
                  ['6:00', '10.0', '30:00', '60:00', '2:06:35', '4:13:10'],
                  ['6:30', '9.2',  '32:30', '65:00', '2:17:08', '4:33:15'],
                  ['7:00', '8.6',  '35:00', '70:00', '2:27:41', '4:55:21'],
                ].map(([pace, kph, k5, k10, half, full], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{pace}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{kph}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{k5}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{k10}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{half}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{full}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 트레드밀 시속 ↔ 페이스 변환표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            트레드밀 시속 ↔ 페이스 변환표
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            런닝머신에는 페이스 대신 <strong style={{ color: 'var(--text)' }}>시속(km/h)</strong>이 표시됩니다. 야외 러닝 페이스와 동일하게 설정하려면 아래 표를 참고하세요. 400m 트랙 1바퀴 기준 소요 시간도 함께 확인할 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>시속 (km/h)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>페이스 (/km)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>400m 트랙 1바퀴</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>수준</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['7.0',  '8:34', '3:26', '초보 조깅'],
                  ['8.0',  '7:30', '3:00', '가벼운 조깅'],
                  ['9.0',  '6:40', '2:40', '중급 러닝'],
                  ['10.0', '6:00', '2:24', '중급 러닝'],
                  ['11.0', '5:27', '2:11', '활동적 러닝'],
                  ['12.0', '5:00', '2:00', '준중급'],
                  ['13.0', '4:37', '1:51', '중급-상급'],
                  ['14.0', '4:17', '1:43', '상급 러닝'],
                  ['15.0', '4:00', '1:36', '엘리트 수준'],
                ].map(([kph, pace, track, level], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{kph}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontWeight: 500 }}>{pace}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{track}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 구간별 스플릿 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            📐 거리별 구간 스플릿 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구는 거리에 맞춰 자동 스플릿을 생성합니다 (일정 페이스 가정). 5km는 1km마다, 10km는 1km마다, 하프·풀은 5km마다 + 랜드마크 표시.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>거리</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>스플릿 간격</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>주요 랜드마크</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { d: '5km',     sp: '1km마다 (1·2·3·4·5km)',                     lm: '🏁 5km 완주' },
                  { d: '10km',    sp: '1km마다 (1·2·...·10km)',                    lm: '⏱️ 5km 절반 / 🏁 10km 완주' },
                  { d: '하프',    sp: '5km마다 (5·10·15·20·21.0975km)',              lm: '⏱️ 10km 절반 부근 / 🏁 21.0975km 완주' },
                  { d: '풀',      sp: '5km마다 (5·10·15·20·21·25·30·35·40·42.195km)', lm: '🏁 21.0975km 하프 통과 / 🔴 30km 마의 30km / 🏆 42.195km 풀 완주' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.sp}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontSize: 12 }}>{r.lm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            💡 각 km별 페이스를 손목시계에 미리 입력해두면 레이스 중 페이스 체크가 쉬워집니다. 본 도구의 [📋 결과 + 스플릿 복사]로 메모장에 저장 가능.
          </p>
        </div>

        {/* ── 4. 네거티브 스플릿 전략 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            💡 네거티브 스플릿 전략 (마라톤 베테랑 표준)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            <strong style={{ color: 'var(--text)' }}>후반을 전반보다 약간 빠르게</strong> 달리는 전략. 본 도구의 하프·풀 결과 카드에 자동 표시됩니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { t: '🟢 장점', items: ['초반 흥분 오버페이스 ↓', '후반 무너짐(속도 ↓) 방지', '심리적 자신감 ↑', '같은 평균 페이스로 더 안정적 완주'] },
              { t: '⚠️ 주의', items: ['충분히 훈련된 러너만 가능', '초보는 일정 페이스 익히기 우선', '날씨·코스에 따라 조정 필요', '전반 너무 느슨하면 후반 만회 어려움'] },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: i === 0 ? '#3EFF9B' : '#FF8C3E', marginBottom: '8px' }}>{m.t}</p>
                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85 }}>
                  {m.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            예: 마라톤 5:30/km 목표 → 전반 5:33/km(1.5초 느슨) + 후반 5:27/km(1.5초 빠르게) → 총 시간 동일.
          </p>
        </div>

        {/* ── 5. 한국 인기 페이스 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🇰🇷 한국 마라톤 인기 목표 페이스
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            한국 러너들의 흔한 마라톤 목표 시간과 필요 페이스. 본 도구의 빠른 페이스 칩에서 한 탭으로 적용.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>목표</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>필요 페이스</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>시속</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>수준</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { goal: '서브3 (3시간)',     pace: '4:16/km', kph: '14.07', lv: '엘리트' },
                  { goal: '서브3:30',         pace: '4:59/km', kph: '12.06', lv: '상급' },
                  { goal: '서브4 (4시간)',     pace: '5:41/km', kph: '10.55', lv: '준상급' },
                  { goal: '서브4:30',         pace: '6:24/km', kph: '9.38',  lv: '중급' },
                  { goal: '서브5 (5시간)',     pace: '7:07/km', kph: '8.43',  lv: '입문 완주' },
                  { goal: '하프 서브2',       pace: '5:41/km', kph: '10.55', lv: '하프 중급' },
                  { goal: '10km 50분',        pace: '5:00/km', kph: '12.00', lv: '10km 입문' },
                  { goal: '5km 25분',         pace: '5:00/km', kph: '12.00', lv: '5km 입문' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.goal}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.pace}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{r.kph}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.lv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 6. 트레드밀 vs 야외 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🏃 트레드밀 vs 야외 — 같은 시속도 체감 다름
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            같은 시속이라도 트레드밀이 야외보다 약간 쉽게 느껴집니다. 야외 시뮬을 위해 경사 1~1.5% 권장.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { t: '트레드밀이 쉬운 이유', items: ['바람 저항 없음', '벨트가 발을 밀어줌', '온도·습도 일정', '코스 변화 없음 (평지)'] },
              { t: '야외 시뮬 방법', items: ['경사 1~1.5% 설정', '같은 시속도 약 5% 강도 ↑', '본인 페이스 5~10초 더 느리게', '프로그램 인터벌 활용'] },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>{m.t}</p>
                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85 }}>
                  {m.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. FAQ (accordion) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { q: '페이스(Pace)란 무엇인가요?',
                a: '페이스는 1km를 달리는 데 걸리는 시간입니다. &ldquo;5분 30초 페이스&rdquo;는 1km를 5분 30초에 달린다는 의미입니다. GPS 스마트워치나 러닝 앱에서 &ldquo;min/km&rdquo; 또는 &ldquo;/km&rdquo;로 표시됩니다. 미국에서는 1마일 기준 페이스(min/mi)를 주로 사용합니다.' },
              { q: '트레드밀과 야외 달리기는 페이스가 같나요?',
                a: '같은 시속으로 설정해도 일반적으로 트레드밀이 야외보다 더 쉽게 느껴집니다. 바람 저항이 없고 벨트가 발을 밀어주기 때문입니다. 야외 레이스를 목표로 한다면 트레드밀 경사도를 1~1.5%로 설정하면 야외와 비슷한 강도가 됩니다.' },
              { q: '400m 트랙 페이스는 왜 알아야 하나요?',
                a: '400m 트랙은 인터벌 훈련의 기본 단위입니다. &ldquo;400m 인터벌 6회&rdquo;처럼 트랙 훈련 프로그램은 바퀴당 목표 시간으로 구성됩니다. 예를 들어 킬로미터 페이스 5:00(km/h 12)이라면 400m 1바퀴에 2:00이 목표 시간이 됩니다. 자세한 인터벌 훈련은 [인터벌 훈련 계산기]를 참고하세요.' },
              { q: '마라톤 서브4(4시간 이내 완주)를 위한 페이스는?',
                a: '마라톤 서브4를 달성하려면 평균 페이스 5분 41초/km(시속 약 10.5km/h)를 유지해야 합니다. 실제 레이스에서는 초반 흥분으로 오버페이스하지 않도록 전반부를 조금 여유 있게, 후반부에 페이스를 유지하는 네거티브 스플릿 전략을 권장합니다.' },
              { q: '5km·10km·하프·풀 거리는 정확히 몇 km인가요?',
                a: '국제 표준 거리:<br/>• <strong>5km</strong>: 5.000km<br/>• <strong>10km</strong>: 10.000km<br/>• <strong>하프 마라톤</strong>: 21.0975km (정확히 풀 마라톤의 절반)<br/>• <strong>풀 마라톤</strong>: 42.195km<br/>본 도구는 정확한 거리로 계산합니다 — 하프 + 풀의 끝부분 195m·95m도 반영.' },
              { q: '네거티브 스플릿이 무엇인가요?',
                a: '<strong>후반을 전반보다 약간 빠르게</strong> 달리는 전략. 본 도구의 하프·풀 결과 카드에 자동 표시됩니다.<br/>예: 마라톤 5:30/km 목표 → 전반 5:33/km(1.5초 느슨) + 후반 5:27/km(1.5초 빠르게) = 총 시간 동일.<br/>장점: 초반 오버페이스 ↓, 후반 무너짐 ↓, 심리적 자신감 ↑. ⚠️ 단, 충분히 훈련된 러너만 가능. 초보는 일정 페이스부터 익히기.' },
              { q: '페이스 ↔ 시속 변환 공식은?',
                a: '<strong>시속 = 60 ÷ 페이스(분/km)</strong><br/>• 5:00/km → 12.0 km/h<br/>• 5:30/km → 10.9 km/h<br/>• 6:00/km → 10.0 km/h<br/><strong>400m 트랙 1바퀴 = 페이스 × 0.4</strong><br/>• 5:00/km → 2:00 (400m)<br/>• 5:30/km → 2:12<br/>• 6:00/km → 2:24<br/>본 도구의 자동 변환을 활용하세요.' },
              { q: '본 도구와 인터벌 훈련 계산기·기록 예측 계산기 차이는?',
                a: '각 도구는 다른 영역을 다룹니다.<br/>📊 <strong>본 도구 (러닝 페이스 계산기)</strong> — 단순 페이스↔시간 변환 / 트레드밀 시속 / 구간 스플릿(페이스 분배)<br/>🏃 <strong>인터벌 훈련 계산기</strong> — VDOT 기반 인터벌 페이스 / 야소 800 / 4~16주 훈련 스케줄 / I·R·T 페이스<br/>🎯 <strong>마라톤 기록 예측 계산기</strong> — VDOT·Riegel 공식 / 5km → 풀코스 기록 예측<br/>본 도구는 <strong>페이스 변환 기본 도구</strong>. 훈련은 인터벌 도구, 예측은 기록 예측 도구를 함께 활용.' },
              { q: '본인 페이스가 매번 다른데 어떻게 사용하나요?',
                a: '<strong>평균 페이스</strong> 또는 <strong>목표 페이스</strong> 입력 권장. 일반 가이드:<br/>• 평소 조깅: 6:00~6:30/km<br/>• 약간 빠르게: 5:30~6:00/km<br/>• 5km 페이스: 5:00~5:30/km<br/>• 10km 페이스: 5:15~5:45/km<br/>• 하프 페이스: 5:30~6:00/km<br/>• 풀코스 목표: 본 도구의 빠른 페이스 칩 활용.<br/>본 도구는 마지막 입력을 자동 저장 — 재방문 시 빠른 사용 가능.' },
            ].map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {faq.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: faq.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* ── 4. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/interval-training', icon: '🏃‍♂️', name: '인터벌 훈련 계산기',     desc: 'VDOT·인터벌 페이스·훈련 스케줄' },
              { href: '/tools/sports/race-predictor',    icon: '🎯', name: '마라톤 기록 예측 계산기',  desc: 'VDOT·Riegel 기록 예측' },
              { href: '/tools/sports/one-rm',            icon: '🏋️', name: '1RM 계산기',               desc: '근력 보강 최대 중량' },
              { href: '/tools/date/dday',                icon: '📅', name: 'D-day 계산기',              desc: '다음 마라톤 대회까지 남은 날' },
              { href: '/tools/health/bmr',               icon: '🔥', name: '기초대사량(BMR) 계산기',     desc: '러너 하루 칼로리 소비' },
              { href: '/tools/health/bmi',               icon: '⚖️', name: 'BMI 계산기',               desc: '러너 체중 범위 확인' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}