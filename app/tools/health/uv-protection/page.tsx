import Link from 'next/link'
import UvProtectionClient from './UvProtectionClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/health/uv-protection',
  title: '자외선 노출 가이드 계산기 — UV 지수·피부 타입·SPF 일광화상 시간',
  description: 'UV 지수, Fitzpatrick 피부 타입, SPF를 기준으로 일광화상 위험 시간을 추정합니다. 러닝·골프·해변·등산 등 활동별 자외선 차단 가이드와 재도포 권장 시간 안내.',
  keywords: ['자외선계산기', 'UV지수', '일광화상시간', 'SPF계산', '선크림SPF', '피부타입', 'Fitzpatrick', '자외선차단', '러닝선크림', '해변선크림'],
})

export default function UvProtectionPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        건강·웰빙
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ☀️ 자외선 노출 가이드 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        UV 지수·피부 타입·SPF로 <strong style={{ color: 'var(--text)' }}>일광화상 위험 시간을 추정</strong>하고
        러닝·골프·해변·등산 등 활동별 자외선 차단 가이드를 확인합니다.
        <strong style={{ color: '#FF8C3E' }}> 참고용 추정 도구</strong>이며 의학적 진단을 대체하지 않습니다.
      </p>

      <UvProtectionClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            UV 지수와 화상 위험 시간 계산 원리
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>단순 추정</span> = (200 × 피부 타입 계수) ÷ (3 × UV 지수)</div>
            <div><span style={{ color: 'var(--muted)' }}>MED 기반</span> = MED(J/m²) ÷ (UV 지수 × 0.025 × 60)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ MED: 피부에 첫 발적을 유발하는 최소 자외선 양</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> UV 지수 6, 피부 타입 III(한국인 평균) →
            화상 위험 추정 시간 약 <strong style={{ color: '#3EC8FF' }}>25분 (무보호)</strong>
          </div>
        </div>

        {/* ── 2. Fitzpatrick 피부 타입 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            Fitzpatrick 피부 타입 (한국인 가이드)
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.8 }}>
            피부과학에서 사용하는 6단계 분류 (1975년 Thomas Fitzpatrick 박사 제정).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['타입', '특징', '한국인 비율', '화상 경향'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i === 2 ? 'right' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '타입 I',   d: '매우 흰 피부, 빨간/금발, 주근깨',           r: '1% 미만',  b: '항상 화상' },
                  { t: '타입 II',  d: '흰 피부, 금발, 푸른/녹색 눈',                r: '1~5%',    b: '보통 화상' },
                  { t: '타입 III', d: '한국인 평균, 검은 머리, 갈색 눈',            r: '40~50%',  b: '가끔 화상' },
                  { t: '타입 IV',  d: '약간 어두운 피부, 지중해형',                 r: '40~50%',  b: '드물게 화상' },
                  { t: '타입 V',   d: '어두운 피부, 동남아·중남미·중동',            r: '5% 미만', b: '매우 드물게' },
                  { t: '타입 VI',  d: '매우 어두운 피부, 아프리카계',               r: '1% 미만', b: '거의 없음' },
                ].map((r, i) => {
                  const isCommon = r.t === '타입 III' || r.t === '타입 IV'
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: isCommon ? 'rgba(62,200,255,0.06)' : (i % 2 === 0 ? 'transparent' : 'var(--bg2)') }}>
                      <td style={{ padding: '10px 12px', color: isCommon ? '#3EC8FF' : 'var(--accent)', fontWeight: 700 }}>{r.t}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.d}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.r}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.b}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. UV 5단계 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            UV 지수 5단계 (한국 기상청 기준)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
            {[
              { r: '0~2',  l: '낮음',     c: '#3EFF9B', d: '특별한 보호 불필요' },
              { r: '3~5',  l: '보통',     c: '#FFD700', d: '오전 10~오후 4시 차단제 권장' },
              { r: '6~7',  l: '높음',     c: '#FF8C3E', d: '차단제·모자·긴 옷 필수' },
              { r: '8~10', l: '매우 높음', c: '#FF6B6B', d: '오전 10~오후 4시 야외 자제' },
              { r: '11+',  l: '위험',     c: '#9B59B6', d: '가능한 외출 자제' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: g.c, marginBottom: 4 }}>{g.r}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{g.l}</p>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.65 }}>{g.d}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📅 <strong style={{ color: 'var(--text)' }}>한국 계절별 평균:</strong>
            봄(3~5월) 5~8 · 여름(6~8월) <strong style={{ color: '#FF6B6B' }}>8~11</strong> · 가을(9~11월) 4~7 · 겨울(12~2월) 1~4
          </div>
        </div>

        {/* ── 4. SPF 차단율 진실 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            SPF 차단율 진실
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['SPF', 'UVB 차단율', '통과율'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { s: '없음',    b: '0%',    p: '100%', c: '#FF6B6B' },
                  { s: 'SPF 15',  b: '93.3%', p: '6.7%', c: '#FFD700' },
                  { s: 'SPF 30',  b: '96.7%', p: '3.3%', c: 'var(--accent)' },
                  { s: 'SPF 50',  b: '98.0%', p: '2.0%', c: '#3EFF9B' },
                  { s: 'SPF 70+', b: '98.6%', p: '1.4%', c: '#9B59B6' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: r.s === 'SPF 50' ? 'rgba(62,255,155,0.06)' : (i % 2 === 0 ? 'transparent' : 'var(--bg2)') }}>
                    <td style={{ padding: '10px 12px', color: r.c, fontWeight: 700 }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.b}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>{r.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'rgba(255,140,62,0.05)', border: '1px solid rgba(255,140,62,0.30)', borderRadius: 12, padding: '12px 16px', fontSize: 12.5, color: 'var(--text)', marginTop: 12, lineHeight: 1.85 }}>
            ⚠️ <strong style={{ color: '#FF8C3E' }}>SPF가 2배라고 보호 시간이 2배 늘어나는 것이 아닙니다.</strong>
            SPF 30과 50의 차단율 차이는 <strong>1.3%p</strong>에 불과합니다. 라벨 SPF 50을 사용해도 <strong>실제 도포 시 효과는 SPF 25 정도</strong>이며,
            <strong> 충분한 도포량과 2시간마다의 재도포</strong>가 SPF 등급보다 훨씬 중요합니다.
          </div>
        </div>

        {/* ── 5. 환경별 자외선 보정 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            환경별 자외선 보정
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '🏖️ 해변·수영장', m: '× 1.5',  c: '#3EC8FF', d: '모래 반사 15% + 물 반사 25%' },
              { t: '⛷️ 눈·스키',     m: '× 1.8',  c: '#FF6B6B', d: '신선한 눈 반사 80% — 가장 강력' },
              { t: '⛰️ 등산·고지대', m: '+12%/km', c: '#FF8C3E', d: '해발 2km: +24%, 3km: +36%' },
              { t: '🚤 수상 스포츠', m: '× 1.5',  c: '#3EC8FF', d: '물 반사로 자외선 50% 증가' },
              { t: '🚗 운전·실내',   m: '× 0.5',  c: '#9B59B6', d: 'UVB 95% 차단, UVA 50% 통과' },
              { t: '☁️ 두꺼운 구름',  m: '−30%',   c: '#A8A29E', d: '얇은 구름은 거의 영향 없음' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 4 }}>{g.t}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>{g.m}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 차단제 사용 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자외선 차단제 사용 가이드 (WHO·EPA 권장)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '🛒 선택', items: ['SPF 30 이상 (한국은 SPF 50+ 표준)', '광범위(Broad-spectrum, UVA·UVB)', '방수(Water Resistant) — 야외 활동 시'] },
              { t: '🖌️ 도포', items: ['외출 15~30분 전 (피부 흡수 시간)', '충분한 양 (얼굴 0.5g, 전신 약 30g)', '잊기 쉬운 곳: 입술·귀·목 뒤·발등'] },
              { t: '🔄 재도포', items: ['일반: 2시간마다', '수영·땀: 즉시 또는 1시간마다', '옷·수건 마찰 후'] },
              { t: '📦 보관', items: ['개봉 후 12개월', '변색·분리·이상한 냄새 시 폐기', '차량·뜨거운 곳 보관 X'] },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: '#3EC8FF', fontWeight: 700, marginBottom: 8, fontFamily: '"Noto Sans KR", sans-serif' }}>{c.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                  {c.items.map((it, j) => (<li key={j}>{it}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 자외선과 피부 건강 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자외선과 피부 건강
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FFD700', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#FFD700', fontWeight: 700, marginBottom: 8 }}>⏱️ 단기 영향</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>일광화상 (홍반·통증·물집)</li>
                <li>일사병</li>
                <li>안구 손상 (각막염·백내장)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FF6B6B', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#FF6B6B', fontWeight: 700, marginBottom: 8 }}>⚠️ 장기 영향</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>피부 노화 (주름·기미·탄력 저하)</li>
                <li>피부암 (기저세포암·편평세포암·흑색종)</li>
                <li>면역력 저하</li>
              </ul>
            </div>
          </div>
          <div style={{
            background: 'rgba(62,200,255,0.05)',
            border: '1px solid rgba(62,200,255,0.25)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            🇰🇷 <strong style={{ color: '#3EC8FF' }}>한국 통계:</strong> 피부암 발생률 매년 5~6% 증가(대한피부과학회) ·
            자외선이 피부 노화 원인의 약 80% · 일광화상 1회로도 흑색종 위험 증가
          </div>
          <div style={{
            background: 'rgba(62,255,155,0.05)',
            border: '1px solid rgba(62,255,155,0.30)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 10,
            lineHeight: 1.85,
          }}>
            ✅ <strong style={{ color: '#3EFF9B' }}>예방 4가지 핵심:</strong>
            ① 그늘 활용(오전 10~오후 4시) ② 옷·모자·선글라스 ③ SPF 30+ 차단제 ④ 정기 피부 검진(연 1회)
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: 'UV 지수 5는 얼마나 위험한가요?',
                a: 'UV 지수 5는 한국 기상청 기준 <strong>"보통" 등급</strong>으로 일반적인 봄·가을 수준입니다. 한국인 평균 피부(타입 III)의 경우 <strong>무보호 상태에서 약 30분 정도부터 일광화상 위험</strong>이 있습니다. 차단제(SPF 30 이상)와 모자를 권장하며, 오전 10시~오후 4시 사이는 더 주의가 필요합니다. 구름이 적고 반사면(물·모래·눈)이 있다면 실제 노출량은 더 높을 수 있습니다.',
              },
              {
                q: 'SPF 50과 SPF 30의 실제 차이는 얼마나 되나요?',
                a: 'UVB 차단율은 SPF 30이 96.7%, SPF 50이 98.0%로 <strong>1.3%p 차이</strong>입니다. "SPF 50이 SPF 30보다 1.7배 더 안전하다"는 표현은 정확하지 않습니다. 다만 야외 장시간 활동, 한국 여름철 강한 자외선, 해변·고지대 환경에서는 SPF 50 이상이 권장됩니다. 가장 중요한 것은 SPF 등급보다 <strong>충분한 도포량과 2시간마다의 재도포</strong>입니다.',
              },
              {
                q: '흐린 날에도 자외선 차단제를 발라야 하나요?',
                a: '<strong>네, 흐린 날에도 자외선의 약 70~80%는 구름을 통과합니다.</strong> 얇은 구름은 거의 자외선을 차단하지 않으며, 두꺼운 구름이라도 약 30%만 감쇠시킵니다. 특히 봄·가을의 흐린 날에 자외선 차단을 소홀히 해 화상을 입는 경우가 많으므로, 외출 시에는 일년 내내 차단제 사용을 권장합니다.',
              },
              {
                q: '러닝할 때 SPF 30이면 충분할까요?',
                a: '일상 짧은 러닝(30분 이내)이라면 SPF 30 광범위 차단제로 충분할 수 있습니다. 그러나 1시간 이상 러닝, 한낮 자외선 강한 시간, 여름철에는 <strong>SPF 50 이상을 권장</strong>합니다. 특히 땀으로 차단제 효과가 빠르게 감소하므로 ① 방수(Water Resistant) 표시 제품 선택, ② 1시간마다 재도포, ③ 챙 있는 모자·UV 차단 토시·선글라스 병행이 좋습니다. 러닝 코스에 그늘이 있다면 자외선이 강한 시간대(11~15시)는 피하는 것이 좋습니다.',
              },
              {
                q: '피부 타입은 어떻게 알 수 있나요?',
                a: 'Fitzpatrick 피부 타입은 햇빛에 대한 피부 반응으로 자가 진단할 수 있습니다: 항상 화상·거의 안 그을림 → 타입 I, 보통 화상·약간 그을림 → 타입 II, 가끔 화상·점진적 그을림 → 타입 III(<strong>한국인 다수</strong>), 드물게 화상·잘 그을림 → 타입 IV(<strong>한국인 다수</strong>), 매우 드물게 화상 → 타입 V, 거의 화상 X → 타입 VI. 한국인은 대부분 타입 III·IV에 해당하며, 정확한 진단은 피부과에서 광생물학적 검사로 가능합니다. 자가 진단이 애매하다면 <strong>보수적으로 한 단계 낮은(더 민감한) 타입을 선택</strong>하는 것이 안전합니다.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/health/bmi',         icon: '⚖️', name: 'BMI 계산기',             desc: '체질량지수로 비만도 확인' },
              { href: '/tools/health/bmr',         icon: '🔥', name: '기초대사량(BMR) 계산기', desc: '하루 권장 칼로리' },
              { href: '/tools/health/blood-alcohol', icon: '🍺', name: '혈중알코올 소멸 계산기', desc: 'BAC·운전 가능 시각' },
              { href: '/tools/sports/pace',        icon: '🏃', name: '러닝 페이스 계산기',     desc: '마라톤 목표 기록별 페이스' },
              { href: '/tools/date/dday',          icon: '📅', name: 'D-day 계산기',           desc: '휴가·여행 카운트다운' },
              { href: '/tools/life/laundry-dry',   icon: '🧺', name: '빨래 건조 시간 계산기',   desc: '온도·습도·소재별 건조 시간' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── 10. 공식 자료 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            공식 자료 출처
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', fontSize: 12.5, color: 'var(--muted)', lineHeight: 2 }}>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              <li>미국 EPA UV Index Scale: <strong style={{ color: 'var(--text)' }}>epa.gov/sunsafety</strong></li>
              <li>WHO Global Solar UV Index: <strong style={{ color: 'var(--text)' }}>who.int</strong></li>
              <li>한국 기상청 자외선지수: <strong style={{ color: 'var(--text)' }}>weather.go.kr</strong></li>
              <li>대한피부과학회: <strong style={{ color: 'var(--text)' }}>derma.or.kr</strong></li>
            </ul>
            <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.85 }}>
              본 도구는 <strong style={{ color: 'var(--text)' }}>의학적 진단·치료 목적이 아닙니다.</strong>
              일광화상 또는 피부 이상 증상이 있다면 즉시 피부과 전문의 상담을 받으세요.
              표시된 시간은 <strong style={{ color: '#FF8C3E' }}>참고 추정치</strong>이며 실제 안전을 보장하지 않습니다.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
