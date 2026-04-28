import Link from 'next/link'
import PlanetComparisonClient from './PlanetComparisonClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/edu/planet-comparison',
  title: '행성 비교 시각화 — 다른 행성에서 내 몸무게·나이·하루',
  description: '8개 태양계 행성에서 내 몸무게, 나이, 하루 길이가 어떻게 다른지 시각적으로 비교합니다. 수성·금성·화성·목성 등 행성별 중력·공전·자전 데이터.',
  keywords: ['행성비교', '태양계행성', '화성에서몸무게', '목성중력', '행성나이', '행성크기비교', '태양계시각화', '행성과학'],
})

export default function PlanetComparisonPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        교육·학습
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🪐 행성 비교 시각화
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        몸무게와 나이만 입력하면 <strong style={{ color: 'var(--text)' }}>8개 태양계 행성에서의 내 몸무게·나이·하루 길이·점프 높이</strong>를
        한 화면에서 비교합니다. 행성 크기 시각화, 중력 낙하 시뮬레이션, 빛 도달 시간, SNS 공유 카드까지.
      </p>

      <PlanetComparisonClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 태양계 8개 행성 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            태양계 8개 행성 한눈에
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '지구형 행성',     c: '#3EC8FF', d: '수성·금성·지구·화성 — 작고 단단한 암석질 행성' },
              { t: '거대 가스 행성',  c: '#FF8C3E', d: '목성·토성 — 수소·헬륨이 주성분, 표면 없음' },
              { t: '거대 얼음 행성',  c: '#3EFFD0', d: '천왕성·해왕성 — 메탄·물·암모니아 얼음 풍부' },
              { t: '왜소행성',        c: '#A8A29E', d: '명왕성은 2006년 IAU에서 왜소행성으로 재분류' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 몸무게 변화 원리 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            각 행성에서 몸무게 변화 원리
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
            <div><span style={{ color: 'var(--muted)' }}>몸무게(W)</span> = <span style={{ color: 'var(--muted)' }}>질량(m)</span> × <span style={{ color: 'var(--muted)' }}>중력 가속도(g)</span></div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 질량은 행성에 가도 변하지 않음 (질량 ≠ 몸무게)</div>
          </div>
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['행성', '중력 (g)', '75kg → 행성 몸무게'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { p: '수성·화성',           c: '#A8A29E', g: '0.38 g', w: '28.5 kg' },
                  { p: '금성·토성·천왕성',    c: '#FFC857', g: '0.90~0.92 g', w: '67.5~69 kg' },
                  { p: '지구',                 c: '#3EC8FF', g: '1.00 g', w: '75.0 kg' },
                  { p: '해왕성',               c: '#3E5BFF', g: '1.12 g', w: '84.0 kg' },
                  { p: '목성',                 c: '#FF8C3E', g: '2.36 g', w: '177.0 kg' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: r.c, fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.g}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#3EFFD0', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{r.w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 1년·1일 길이 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            행성 1년·1일의 길이
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EFFD0', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#3EFFD0', fontWeight: 700, marginBottom: 8 }}>🌀 공전주기 (1년)</p>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 8 }}>태양을 한 바퀴 도는 시간</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>수성: 88일 (가장 짧음)</li>
                <li>지구: 365일</li>
                <li>화성: 687일 (1.88년)</li>
                <li>목성: 4,333일 (12년)</li>
                <li>토성: 10,759일 (29.5년)</li>
                <li>천왕성: 30,689일 (84년)</li>
                <li>해왕성: 60,182일 (165년)</li>
              </ul>
              <p style={{ fontSize: 12, color: '#3EFFD0', marginTop: 8, fontWeight: 700 }}>→ 해왕성에서 35년이면 지구에서 5,773년!</p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FF8C3E', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#FF8C3E', fontWeight: 700, marginBottom: 8 }}>🔄 자전주기 (1일)</p>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 8 }}>한 바퀴 자전하는 시간</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>목성: 9.93h (가장 짧음)</li>
                <li>토성: 10.7h</li>
                <li>해왕성: 16.11h</li>
                <li>천왕성: 17.24h <span style={{ color: '#FF8C8C' }}>(역행)</span></li>
                <li>화성: 24.6h <span style={{ color: '#3EC8FF' }}>(지구와 비슷!)</span></li>
                <li>지구: 24h</li>
                <li>수성: 4,223h (176일)</li>
                <li>금성: 5,833h (243일, <span style={{ color: '#FF8C8C' }}>역행</span>)</li>
              </ul>
            </div>
          </div>
          <div style={{
            background: 'rgba(155,89,182,0.05)',
            border: '1px solid rgba(155,89,182,0.30)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ✨ <strong style={{ color: '#C485E0' }}>특별한 점:</strong> 금성은 자전축이 거꾸로 (역행),
            천왕성은 자전축이 98° 기울어져 옆으로 굴러갑니다.
          </div>
        </div>

        {/* ── 4. 빛 도달 시간 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            빛이 행성까지 도달하는 시간
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
            marginBottom: 12,
          }}>
            <span style={{ color: 'var(--muted)' }}>빛의 속도</span> = 약 <strong style={{ color: '#3EFFD0' }}>30만 km/초</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
            {[
              { p: '달',      t: '1.3초',  c: '#A8A29E' },
              { p: '수성·금성', t: '2~5분',   c: '#FFC857' },
              { p: '화성',     t: '13분',    c: '#FF6B6B' },
              { p: '목성',     t: '35분',    c: '#FF8C3E' },
              { p: '토성',     t: '71분',    c: '#FFD700' },
              { p: '천왕성',   t: '2.5시간', c: '#3EFFD0' },
              { p: '해왕성',   t: '4시간',   c: '#3E5BFF' },
              { p: '프록시마 센타우리', t: '4.2년', c: '#9B59B6' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${r.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{r.p}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: r.c, marginTop: 2 }}>{r.t}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(255,107,107,0.05)',
            border: '1px solid rgba(255,107,107,0.25)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ⚠️ 화성 탐사선과의 통신은 평균 <strong style={{ color: '#FF8C8C' }}>13분 지연</strong> → 실시간 조작 불가능.
            모든 명령은 13분 이상 지연되며 응답까지 최소 26분 소요.
          </div>
        </div>

        {/* ── 5. 표면 온도 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            각 행성 표면 온도
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['행성', '온도 범위', '평균', '특징'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i <= 2 ? 'right' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { p: '수성', c: '#A8A29E', r: '-173~427°C', avg: '167°C',  d: '극단적 변화 (대기 없음)' },
                  { p: '금성', c: '#FFC857', r: '462°C',       avg: '462°C', d: '가장 뜨거움 — 두꺼운 CO2 대기' },
                  { p: '지구', c: '#3EC8FF', r: '-88~58°C',    avg: '15°C',  d: '생명체 거주 가능' },
                  { p: '화성', c: '#FF6B6B', r: '-143~35°C',   avg: '-65°C', d: '추움' },
                  { p: '목성', c: '#FF8C3E', r: '-145°C',       avg: '-145°C', d: '가스 행성 — 표면 없음' },
                  { p: '토성', c: '#FFD700', r: '-178°C',       avg: '-178°C', d: '가스 행성' },
                  { p: '천왕성', c: '#3EFFD0', r: '-224°C',      avg: '-224°C', d: '가장 추운 행성' },
                  { p: '해왕성', c: '#3E5BFF', r: '-218°C',      avg: '-218°C', d: '얼음 행성' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: r.c, fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#3EFFD0', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{r.avg}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.75 }}>
            ※ 금성이 수성보다 뜨거운 이유: <strong style={{ color: 'var(--text)' }}>두꺼운 이산화탄소 대기 → 극심한 온실효과</strong>
          </p>
        </div>

        {/* ── 6. 행성 탐사 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            행성 탐사 현황 (2026년)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '수성', d: '메신저호 (2011-2015) · BepiColombo (현재 진행 중)', c: '#A8A29E' },
              { t: '금성', d: '비너스 익스프레스 (ESA) · 아카츠키 (JAXA) 등', c: '#FFC857' },
              { t: '화성', d: '큐리오시티·퍼서비어런스·인저뉴어티 헬리콥터 활동 중', c: '#FF6B6B' },
              { t: '목성', d: '주노 (NASA, 현재 활동 중) · Europa Clipper 진행 중', c: '#FF8C3E' },
              { t: '토성', d: '카시니 (1997-2017 종료, 데이터 분석 진행)', c: '#FFD700' },
              { t: '천왕성·해왕성', d: '보이저 2호만 1986/1989년 근접 통과', c: '#3EFFD0' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${c.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: c.c, fontWeight: 700, marginBottom: 4 }}>{c.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(62,255,208,0.05)',
            border: '1px solid rgba(62,255,208,0.30)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            🚀 다음 행성 탐사 미션은 NASA의 <strong style={{ color: '#3EFFD0' }}>Europa Clipper</strong>, ESA·JAXA의 <strong style={{ color: '#3EFFD0' }}>BepiColombo</strong>,
            한국천문연구원(KASI) 협력 미션 등이 진행 중입니다.
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 7. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '화성에서 내 몸무게가 더 가벼운 이유는?',
                a: '화성의 중력은 <strong>지구의 약 38%</strong>이기 때문입니다. 화성은 지구보다 작고(반지름 53%) 가벼워서(질량 11%) 표면 중력이 약합니다. 지구에서 75kg인 사람이 화성에 가면 약 <strong>28.3kg</strong>으로 느껴집니다. 단, 질량(물질의 양) 자체는 그대로이며, 행성 중력에 따라 무게(weight)만 달라집니다.',
              },
              {
                q: '목성에서 1년이 12년이라는 게 무슨 뜻인가요?',
                a: '행성의 "1년"은 그 행성이 <strong>태양을 한 바퀴 도는 시간</strong>을 의미합니다. 목성은 태양에서 매우 멀리 있어 한 바퀴 도는 데 약 4,333일(12년)이 걸립니다. 따라서 지구에서 12살인 어린이는 목성에서는 1살밖에 안 된 셈입니다. 해왕성은 더 멀어서 1년이 약 165년으로, 해왕성에서 1년을 사는 사람은 지구 시간으로 165살이 됩니다.',
              },
              {
                q: '다른 행성에서 점프하면 얼마나 높이 뛸 수 있나요?',
                a: '점프 높이는 <strong>행성 중력에 반비례</strong>합니다. 지구에서 50cm 점프할 수 있다면: 화성·수성(중력 38%) 약 1.32m(지구의 2.6배), 달(중력 16%) 약 3.05m(지구의 6.1배), 목성(중력 236%) 약 21cm(지구의 절반)입니다. 달에서 농구 선수가 점프하면 <strong>골대 위로 가볍게 넘을 수 있습니다.</strong>',
              },
              {
                q: '인간이 다른 행성에서 살 수 있나요?',
                a: '<strong>현재 기술로는 어떤 행성에서도 보호 장비 없이 생존할 수 없습니다.</strong> 수성·금성은 극단적 온도(427°C, 462°C), 화성은 산소 부족·대기압 1%·평균 -65°C, 목성·토성·천왕성·해왕성은 가스 행성으로 표면이 없습니다. 가장 가능성 있는 행성은 <strong>화성</strong>으로, NASA·SpaceX 등이 화성 정착 연구 중입니다. 단, 우주복·돔·온실 등 인공 환경이 필수적입니다.',
              },
              {
                q: '빛 도달 시간이란 무엇인가요?',
                a: '빛이 한 행성에서 다른 행성까지 가는 데 걸리는 시간입니다. 빛의 속도는 1초에 약 30만 km로 우주에서 가장 빠르지만, 행성 간 거리가 워낙 멀어 시간이 걸립니다. 화성에 메시지를 보내면 빛의 속도로 약 <strong>13분 후 도착</strong>합니다(평균 거리 기준). 이 때문에 화성 탐사선과 실시간 통신이 불가능하며, 모든 명령은 13분 이상 지연됩니다. 해왕성까지는 약 4시간, 가장 가까운 별 (프록시마 센타우리)까지는 4.2년이 걸립니다.',
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

        {/* ── 8. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/unit/area',        icon: '🏠', name: '평수 ↔ ㎡ 변환기',  desc: '아파트 면적 단위 변환' },
              { href: '/tools/unit/time',        icon: '⏱️', name: '시간 단위 변환기',   desc: '초·분·시간·일·주·년 변환' },
              { href: '/tools/unit/length',      icon: '📏', name: '길이 변환기',         desc: 'cm·m·inch·ft·mile 변환' },
              { href: '/tools/unit/weight',      icon: '⚖️', name: '무게 변환기',         desc: 'kg·g·lb·oz 변환' },
              { href: '/tools/unit/temperature', icon: '🌡️', name: '온도 변환기',         desc: '섭씨·화씨·켈빈 즉시 변환' },
              { href: '/tools/edu',              icon: '🔬', name: '교육·학습 카테고리',  desc: '추가 교육 도구 더보기' },
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
