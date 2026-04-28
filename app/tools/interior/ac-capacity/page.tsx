import Link from 'next/link'
import AcCapacityClient from './AcCapacityClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/interior/ac-capacity',
  title: '에어컨 평형 계산기 — 거실·방 평수·BTU·W 환산',
  description: '거실·침실·주방의 면적과 향·층수·단열 상태로 추천 에어컨 평형을 계산합니다. 한국 표준 평형 매칭(6·9·13·15·18평형), BTU·W 환산, 인버터 전기료 비교.',
  keywords: ['에어컨평형계산기', '거실에어컨몇평형', '에어컨용량계산', '13평형에어컨', '에어컨BTU환산', 'BTU평형변환', '에어컨W환산', '인버터에어컨'],
})

export default function AcCapacityPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        인테리어
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ❄️ 에어컨 평형 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        면적·공간 용도·향·층수·단열 상태를 입력하면 한국 시판 표준 기준 <strong style={{ color: 'var(--text)' }}>추천 평형(6~36평형)</strong>을 계산합니다.
        BTU·W·kW 자동 환산, 인버터 vs 정속형 전기료 비교까지 한 화면에서.
      </p>

      <AcCapacityClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            에어컨 평형 핵심 공식
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
            <div><span style={{ color: 'var(--muted)' }}>냉방 부하 (W)</span> = 면적(㎡) × 140 × 보정 계수</div>
            <div><span style={{ color: 'var(--muted)' }}>추천 평형</span> = 냉방 부하 ÷ 580W (1평형당 능력)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 한국 1평형 ≈ 580W ≈ 1,980 BTU/h ≈ 0.58 kW</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> 거실 16.5㎡, 남향 8층, 일반 단열, 4명 + TV·PC<br />
            • 기본: 16.5 × 140 = <strong>2,310W</strong><br />
            • 보정: 거실(1.05) × 남향(1.15) × 중층(1.05) = <strong>1.27배</strong><br />
            • 최종: 2,930W + 인원 400W + 가전 200W = <strong style={{ color: 'var(--accent)' }}>3,530W</strong><br />
            • 평형: 3,530 ÷ 580 ≈ 6.1 → 한국 시판 매칭 <strong style={{ color: 'var(--accent)' }}>9평형</strong>
          </div>
        </div>

        {/* ── 2. 한국 평형 표준 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 에어컨 평형 표준 (시판 모델)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['평형', '냉방 능력 (kW)', '추천 공간'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i === 1 ? 'right' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { p: '6평형',  k: '3.5 kW',  u: '작은방 (3~4평)' },
                  { p: '9평형',  k: '5.2 kW',  u: '일반 침실 (5~7평)' },
                  { p: '11평형', k: '6.4 kW',  u: '중간 방·작은 거실' },
                  { p: '13평형', k: '7.5 kW',  u: '일반 거실' },
                  { p: '15평형', k: '8.7 kW',  u: '큰 거실' },
                  { p: '18평형', k: '10.4 kW', u: '큰 거실·매장' },
                  { p: '22~36평형', k: '12.8~20.9 kW', u: '매장·상가·사무실' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.k}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 평형 보정 계수 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎯 평형 보정 계수 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { t: '☀️ 향', c: 'var(--accent)', items: [
                ['남향 (햇빛 강함)', '+15%'],
                ['동·서향', '+10%'],
                ['북향 (햇빛 약함)', '-5%'],
              ]},
              { t: '🏢 층수', c: '#3EC8FF', items: [
                ['저층 (1~3층)', '표준'],
                ['중층 (4~10층)', '+5%'],
                ['고층 (11층+)', '+10%'],
                ['최상층 (옥상 직접)', '+20%'],
                ['반지하', '-10%'],
              ]},
              { t: '🧱 단열', c: '#9B59B6', items: [
                ['신축 (5년 이내)', '-5%'],
                ['일반 (10년+)', '표준'],
                ['노후 (20년+)', '+15%'],
                ['베란다 확장', '+10%'],
                ['통유리', '+20%'],
              ]},
              { t: '📏 천장 높이', c: '#FF8C3E', items: [
                ['2.4m 표준', '×1.0'],
                ['2.9m (+0.5m)', '+12.5%'],
                ['3.4m (+1m)', '+25%'],
              ]},
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {g.items.map(([k, v], j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
                      <span>{k}</span>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. BTU·W·평형 환산 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🌐 BTU·W·평형 환산 가이드
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontSize: '14px',
            color: 'var(--text)',
            lineHeight: 1.95,
          }}>
            <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, marginBottom: 10 }}>1평형 ≈ 580W ≈ 1,980 BTU/h ≈ 0.58 kW</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>해외 직구 시 BTU 표기 → 한국 평형 변환:</p>
            <ul style={{ paddingLeft: 22, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.9 }}>
              <li>12,000 BTU/h = 약 <strong style={{ color: 'var(--accent)' }}>6평형</strong></li>
              <li>18,000 BTU/h = 약 <strong style={{ color: 'var(--accent)' }}>9평형</strong></li>
              <li>24,000 BTU/h = 약 <strong style={{ color: 'var(--accent)' }}>12평형</strong></li>
              <li>36,000 BTU/h = 약 <strong style={{ color: 'var(--accent)' }}>18평형</strong></li>
            </ul>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.7 }}>
              ※ <strong style={{ color: 'var(--text)' }}>BTU(British Thermal Unit)</strong>는 미국·동남아 표기, 한국·일본은 평형, 유럽은 kW 표기
            </p>
          </div>
        </div>

        {/* ── 5. 평형이 너무 크거나 작으면 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            ⚖️ 평형이 너무 크거나 작으면 안 좋은 이유
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FF8C3E', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: '#FF8C3E', fontWeight: 700, marginBottom: 8 }}>🔻 너무 작은 평형</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>충분히 시원해지지 않음</li>
                <li>풀가동으로 전기료 ↑</li>
                <li>압축기 과부하로 수명 ↓</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FF6B6B', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: '#FF6B6B', fontWeight: 700, marginBottom: 8 }}>🔺 너무 큰 평형</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>단가 비쌈</li>
                <li>빠르게 시원해지지만 자주 꺼짐</li>
                <li>습도 조절 ❌ (끈끈한 느낌)</li>
                <li>전기료 오히려 더 나올 수 있음</li>
              </ul>
            </div>
          </div>
          <div style={{
            background: 'rgba(200,255,62,0.05)',
            border: '1px solid rgba(200,255,62,0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.75,
          }}>
            ✅ <strong style={{ color: 'var(--accent)' }}>적정 평형 또는 한 단계 위</strong>까지가 가장 효율적
          </div>
        </div>

        {/* ── 6. 인버터 vs 정속형 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            ⚡ 인버터 vs 정속형 — 어떤 걸 골라야 할까?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>✅ 인버터 에어컨</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>압축기 회전수 조절 → 부드러운 운전</li>
                <li>설정 온도 도달 후 약하게 유지</li>
                <li><strong>전기료 30~40% 절감</strong></li>
                <li>초기 가격 5~10만원 비쌈</li>
                <li><strong>거실·장시간 사용·여름 내내 가동</strong> 추천</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FF6B6B', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: '#FF6B6B', fontWeight: 700, marginBottom: 8 }}>정속형 에어컨</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>압축기 ON/OFF만 가능</li>
                <li>설정 온도 도달 시 꺼졌다 켜졌다</li>
                <li>전기료 더 나옴</li>
                <li>가격 저렴</li>
                <li><strong>잠깐 사용·임시 거주·예산 제한</strong> 추천</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 7. 한국 에어컨 시즌·기온 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🗓️ 한국 에어컨 시즌·기온 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { i: '🌱', t: '5월', d: '검색량 증가 시작',     c: '#3EFF9B' },
              { i: '🌞', t: '6~7월', d: '최고 검색·구매 시즌', c: 'var(--accent)' },
              { i: '☀️', t: '8월', d: '구매 마무리',           c: '#FF8C3E' },
              { i: '🍃', t: '9월',  d: '잔여 시즌 할인',        c: '#3EC8FF' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 18, marginBottom: 4 }}>{s.i}</p>
                <p style={{ fontSize: 13, color: s.c, fontWeight: 700, marginBottom: 2 }}>{s.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(255,140,62,0.06)',
            border: '1px solid rgba(255,140,62,0.25)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.75,
          }}>
            🌡️ <strong style={{ color: '#FF8C3E' }}>외부 기온 35°C 이상 시 평형 +1단계 권장</strong> — 한국 여름 평균 28~33°C, 폭염 시 35~38°C
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
                q: '거실은 몇 평형 에어컨이 적당한가요?',
                a: '거실 면적과 단열·향에 따라 다릅니다. 일반적으로 <strong>5평 거실은 9~11평형</strong>, 7평 거실은 11~13평형, 10평 거실은 13~15평형이 권장됩니다. 남향·통유리·최상층은 한 단계 큰 평형이 안전합니다. 평형이 너무 크면 자주 꺼져서 습도 조절이 안 되므로 적정 평형을 선택하는 것이 중요합니다.',
              },
              {
                q: '에어컨 BTU와 평형은 어떻게 환산하나요?',
                a: '한국 <strong>1평형 ≈ 1,980 BTU/h</strong>입니다. 해외 직구나 비즈니스용 에어컨은 BTU로 표시되므로 변환이 필요합니다. 예를 들어 18,000 BTU = 9평형, 24,000 BTU = 12평형 정도입니다. kW로는 1평형 ≈ 0.58 kW이며 한국·일본은 평형, 미국·동남아는 BTU, 유럽은 kW를 주로 사용합니다.',
              },
              {
                q: '평형이 너무 크면 더 시원할까요?',
                a: '<strong>아니요. 오히려 안 좋을 수 있습니다.</strong> 평형이 너무 크면 빠르게 시원해진 후 자동으로 꺼지고, 다시 더워지면 켜지는 사이클이 짧아집니다. 이 과정에서 습도가 제대로 조절되지 않아 끈끈한 느낌이 들 수 있습니다. 또한 초기 가동 시 전기 사용량이 크고 압축기 부하도 커서 전기료가 오히려 더 나올 수 있습니다. <strong>적정 평형 또는 한 단계 위 정도가 가장 효율적</strong>입니다.',
              },
              {
                q: '인버터 에어컨이 정말 전기료가 적게 나오나요?',
                a: '네, 일반적으로 <strong>30~40% 절감 효과</strong>가 있습니다. 인버터는 설정 온도 도달 후 압축기를 약하게 유지하면서 미세 조정합니다. 반면 정속형은 ON/OFF만 가능해 매번 풀가동으로 시작하므로 전력 소모가 큽니다. 장시간 사용(하루 8시간 이상, 여름 내내)이라면 인버터가 압도적으로 경제적이며, <strong>초기 가격 차이는 한 시즌 만에 회수</strong>할 수 있습니다.',
              },
              {
                q: '신축 아파트와 노후 아파트는 평형 차이가 큰가요?',
                a: '네, <strong>약 20% 차이</strong>가 날 수 있습니다. 신축 아파트는 단열재·창호가 우수해 냉방 부하가 적습니다. 반면 20년 이상 된 노후 아파트는 단열재 노후·창호 틈으로 냉기 손실이 커 같은 평수라도 한 단계 큰 평형이 필요할 수 있습니다. 베란다 확장으로 외기 면적이 늘어난 거실도 +10% 정도 큰 평형이 권장됩니다.',
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
              { href: '/tools/interior/room-area',     icon: '📐', name: '공간 면적 계산기',           desc: '벽·바닥·천장·평수·부피' },
              { href: '/tools/interior/lighting',      icon: '💡', name: '조명 밝기 계산기',           desc: '공간별 권장 루멘·조명 개수' },
              { href: '/tools/interior/wallpaper',     icon: '🧱', name: '도배 소요량 계산기',         desc: '벽지 롤 수·시공 비용' },
              { href: '/tools/interior/paint',         icon: '🎨', name: '페인트 소요량 계산기',       desc: '벽·천장 페인트 양' },
              { href: '/tools/interior/curtain-blind', icon: '🪟', name: '커튼·블라인드 사이즈',       desc: '창문 사이즈로 추천 사이즈' },
              { href: '/tools/unit/area',              icon: '🏠', name: '평수 ↔ ㎡ 변환기',          desc: '아파트 면적 단위 변환' },
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

      </div>
    </div>
  )
}
