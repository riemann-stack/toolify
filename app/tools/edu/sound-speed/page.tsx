import Link from 'next/link'
import SoundSpeedClient from './SoundSpeedClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/edu/sound-speed',
  title: '음속 시뮬레이터 — 천둥 번개 거리·소리 도달 시간·빛 vs 소리',
  description: '번개와 천둥 사이 시간으로 거리를 계산하고, 거리별 소리 도달 시간, 빛과 소리 속도 차이, 콘서트홀 반향까지 시각화합니다. 온도별 음속 자동 보정.',
  keywords: ['음속계산기', '천둥번개거리', '소리도달시간', '음속공식', '광속', '마하', '에코지연', '잔향시간', 'RT60', '소닉붐'],
})

export default function SoundSpeedPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        교육·학습
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔊 음속 시뮬레이터
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        <strong style={{ color: 'var(--text)' }}>번개·천둥 거리</strong>, 거리별 소리 도달 시간, <strong style={{ color: 'var(--text)' }}>빛 vs 소리 속도 차이</strong>,
        콘서트홀 잔향 시간(RT60)까지 시각적으로 학습합니다. 온도별 음속 자동 보정, 매질별·마하별 비교, 어린이부터 음향 전문가까지.
      </p>

      <SoundSpeedClient />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 음속 기본 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            음속 기본 공식
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
            <div><span style={{ color: '#3EFFD0' }}>음속(m/s)</span> = 331.3 + 0.606 × 기온(°C)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 건조한 공기, 1기압 표준 조건</div>
            <div></div>
            <div><span style={{ color: 'var(--muted)' }}># 주요 온도</span></div>
            <div>0°C  → 약 <strong style={{ color: '#3EFFD0' }}>331 m/s</strong></div>
            <div>20°C → 약 <strong style={{ color: '#3EFFD0' }}>343 m/s</strong> (표준)</div>
            <div>30°C → 약 <strong style={{ color: '#3EFFD0' }}>349 m/s</strong></div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 12, lineHeight: 1.85 }}>
            온도가 1°C 오르면 음속은 약 <strong style={{ color: 'var(--text)' }}>0.6 m/s 빨라집니다.</strong>
            여름과 겨울에 같은 거리라도 음속이 약 5% 차이 나는 셈입니다.
          </p>
        </div>

        {/* ── 2. 천둥 번개 거리 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            천둥 번개 거리 계산
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
            <div>거리(m) = <span style={{ color: '#3EFFD0' }}>음속</span> × <span style={{ color: '#FFD700' }}>시간(초)</span></div>
            <div></div>
            <div><span style={{ color: 'var(--muted)' }}># 빠른 추정 공식</span></div>
            <div>거리(km) ≈ 시간(초) ÷ 3</div>
            <div>거리(mile) ≈ 시간(초) ÷ 5</div>
            <div></div>
            <div><span style={{ color: 'var(--muted)' }}># 예시</span></div>
            <div>5초 × 343 m/s = <strong style={{ color: '#3EFFD0' }}>1,715m (≈ 1.7km)</strong></div>
          </div>
          <div style={{
            background: 'rgba(255,107,107,0.06)',
            border: '1px solid rgba(255,107,107,0.30)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ⚠️ <strong style={{ color: '#FF8C8C' }}>NOAA &quot;30-30 규칙&quot;:</strong>
            <br />· 번개를 본 후 <strong>30초 이내</strong> 천둥이 들리면 즉시 실내로
            <br />· 마지막 천둥 후 <strong>30분간 실내 대기</strong>
          </div>
        </div>

        {/* ── 3. 빛 vs 소리 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            빛 vs 소리 — 우주의 두 속도
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EFFD0', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#3EFFD0', fontWeight: 700, marginBottom: 8 }}>💡 빛의 속도</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text)', marginBottom: 4 }}>
                299,792,458 m/s
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>≈ 30만 km/s · 1초에 지구 약 7바퀴</p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FF8C3E', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#FF8C3E', fontWeight: 700, marginBottom: 8 }}>🔊 음속 (공기, 20°C)</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text)', marginBottom: 4 }}>
                343 m/s
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>≈ 1,235 km/h · 1마하</p>
            </div>
          </div>
          <div style={{
            background: 'rgba(155,89,182,0.06)',
            border: '1px solid rgba(155,89,182,0.30)',
            borderRadius: 12,
            padding: '14px 18px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ⚡ <strong style={{ color: '#C485E0' }}>비율:</strong> 빛은 소리의 약 <strong style={{ color: '#C485E0', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>874,400배</strong> 빠름.
            같은 1km를 가는 데 빛은 0.0000033초, 소리는 2.9초.
            <br /><br />
            <strong style={{ color: 'var(--text)' }}>왜 번개가 먼저 보이고 천둥이 늦게 들리는가?</strong>
            <br />빛은 즉시 도달, 소리는 거리에 비례해 늦게 도달. 이 시간 차이로 번개까지의 거리를 계산할 수 있습니다.
          </div>
        </div>

        {/* ── 4. 매질별 음속 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            매질별 음속 차이
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            소리는 매질이 있어야 전달됩니다. 분자 결합이 강할수록(고체일수록) 소리가 빠릅니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['매질', '음속 (m/s)', '공기 대비'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { m: '진공',     s: 0,      r: '전달 X', c: 'var(--muted)' },
                  { m: '공기',     s: 343,    r: '1배',    c: '#3EFFD0' },
                  { m: '물',       s: 1_482,  r: '4.3배',  c: '#3EC8FF' },
                  { m: '바닷물',   s: 1_531,  r: '4.5배',  c: '#3EC8FF' },
                  { m: '나무',     s: 3_300,  r: '9.6배',  c: '#FF8C3E' },
                  { m: '벽돌',     s: 3_650,  r: '10.6배', c: '#FF8C3E' },
                  { m: '구리',     s: 4_600,  r: '13배',   c: '#FFD700' },
                  { m: '강철',     s: 5_960,  r: '17배',   c: '#FFD700' },
                  { m: '다이아몬드', s: 12_000, r: '35배',   c: '#C485E0' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: r.c, fontWeight: 700 }}>{r.m}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.s === 0 ? '0' : r.s.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#3EFFD0', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 우주(진공)에서는 매질이 없어 소리가 전달되지 않습니다. 영화의 우주 폭발 소리는 과학적으로 정확하지 않습니다.
          </p>
        </div>

        {/* ── 5. 마하·소닉붐 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            마하와 음속 — 소닉붐의 비밀
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px 18px',
            fontSize: 13,
            color: 'var(--muted)',
            lineHeight: 1.85,
          }}>
            <strong style={{ color: 'var(--text)' }}>1마하 = 음속 = 약 343 m/s = 1,235 km/h</strong>
            <ul style={{ paddingLeft: 22, marginTop: 8 }}>
              <li>걷기: 0.004 마하 / 자동차: 0.08 마하 / KTX: 0.25 마하</li>
              <li>여객기: 0.85 마하 / <strong style={{ color: '#3EFFD0' }}>음속 1.0 마하</strong></li>
              <li>F-16: 1.7 마하 / F-15: 2.5 마하 / SR-71 정찰기: 3.0 마하</li>
            </ul>
          </div>
          <div style={{
            background: 'rgba(255,140,62,0.06)',
            border: '1px solid rgba(255,140,62,0.30)',
            borderRadius: 12,
            padding: '14px 18px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            🚀 <strong style={{ color: '#FF8C3E' }}>소닉붐(Sonic Boom)</strong>: 비행기가 음속을 돌파할 때 발생하는 충격파.
            비행기가 만든 음파가 비행기보다 느려서 압축되며 강한 충격파를 형성합니다.
            <strong style={{ color: 'var(--text)' }}> 1947년 척 예거(Chuck Yeager)</strong>의 X-1 비행기가 인류 최초로 음속을 돌파했습니다.
          </div>
        </div>

        {/* ── 6. 에코·잔향 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            에코(반향) 원리와 잔향 시간 RT60
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EC8FF', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#3EC8FF', fontWeight: 700, marginBottom: 8 }}>📢 단순 에코</p>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 8 }}>
                지연 시간 = 왕복 거리 ÷ 음속
              </p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>50ms 이하: 단일 소리</li>
                <li>50~100ms: 약간 길게</li>
                <li>100ms~1초: 분리된 에코</li>
                <li>1초+: 명확한 메아리</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #C485E0', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#C485E0', fontWeight: 700, marginBottom: 8 }}>🎼 RT60 (Sabine 공식)</p>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 8 }}>
                소리가 60dB 감쇠하는 데 걸리는 시간
              </p>
              <p style={{ fontFamily: 'JetBrains Mono, Menlo, monospace', fontSize: 12, color: 'var(--text)', lineHeight: 1.85 }}>
                RT60 = 0.161 × V / A<br />
                <span style={{ color: 'var(--muted)' }}>V: 부피, A: 흡음량</span>
              </p>
            </div>
          </div>
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['공간', '일반 RT60', '특성'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i === 1 ? 'right' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { p: '노래방 (방음)', t: '0.3초', n: '음악 명료' },
                  { p: '거실·방',       t: '0.4초', n: '일상' },
                  { p: '교실',           t: '0.6초', n: '강의 적합' },
                  { p: '강당',           t: '1.2초', n: '명료도 균형' },
                  { p: '콘서트홀',       t: '1.8초', n: '🎼 음악 최적 (예술의전당)' },
                  { p: '대성당',         t: '4초+',   n: '풍부한 잔향' },
                  { p: '큰 동굴',        t: '8초+',   n: '극단적 잔향' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#C485E0', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 7. 흥미로운 사실 모음 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🤓 음속·광속 흥미로운 사실
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '🌍 빛의 1초', d: '지구를 약 7바퀴 돌 수 있는 거리 (광속 30만 km/s × 지구 둘레 4만 km)' },
              { t: '☀️ 태양빛', d: '태양에서 지구까지 빛 도달 약 8분 20초. 우리가 보는 태양은 8분 전 모습.' },
              { t: '🌙 달까지 빛', d: '약 1.3초. 아폴로 통신은 거의 즉시 도달.' },
              { t: '🌬️ 음속 돌파', d: '1947년 척 예거의 X-1. 첫 마하 1.06 달성.' },
              { t: '🎼 콘서트홀', d: 'RT60 1.5~2초로 의도적 설계. 너무 짧으면 메마름, 너무 길면 흐림.' },
              { t: '🚫 우주 침묵', d: '진공이라 소리 전달 불가. 우주에서 폭발해도 들리지 않음.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'rgba(155,89,182,0.05)', borderLeft: '3px solid #9B59B6', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#C485E0', fontWeight: 700, marginBottom: 4, fontFamily: 'Noto Sans KR, sans-serif' }}>{c.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '천둥 번개 사이 시간으로 거리를 어떻게 계산하나요?',
                a: '<strong>거리(km) = 시간(초) × 0.343</strong> (20°C 기준), 또는 간단히 <strong>거리(km) ≈ 시간(초) ÷ 3</strong>입니다. 예를 들어 번개를 본 후 5초 뒤 천둥이 들리면 약 <strong>1.7km 떨어진 곳</strong>입니다. 빛은 거의 즉시 도달하므로 시간 차이는 사실상 소리만의 도달 시간입니다. 30초 이상 차이가 나면 약 10km 이상 떨어진 안전한 거리입니다.',
              },
              {
                q: '왜 번개가 먼저 보이고 천둥이 늦게 들리나요?',
                a: '<strong>빛과 소리의 속도 차이</strong> 때문입니다. 빛은 1초에 약 30만 km를 가지만, 소리는 1초에 약 343m밖에 못 갑니다. <strong>빛은 소리의 약 87만 배 빠르므로</strong>, 번개와 천둥이 같은 순간 발생해도 빛은 즉시 보이고 소리는 거리에 비례해 늦게 들립니다. 이 원리로 빛-소리 시간 차이를 측정해 번개까지의 거리를 알 수 있습니다.',
              },
              {
                q: '음속은 항상 343 m/s인가요?',
                a: '아닙니다. <strong>음속은 온도·매질·습도에 따라 달라집니다.</strong> 공기 중 음속 = 331.3 + 0.606 × 기온(°C) — 0°C 약 331 m/s, 20°C 약 343 m/s(표준), 30°C 약 349 m/s. 매질에 따라서도 크게 다릅니다. 물에서는 약 1,482 m/s, 강철에서는 약 5,960 m/s로 공기보다 훨씬 빠릅니다. 진공에서는 매질이 없어 소리가 전달되지 않습니다.',
              },
              {
                q: '음속 돌파(소닉붐)란 무엇인가요?',
                a: '비행기가 음속(약 1,235 km/h, <strong>1마하</strong>)을 넘는 속도로 비행할 때 발생하는 <strong>충격파</strong>입니다. 비행기가 만든 음파가 비행기보다 느려서 압축되며 강한 충격파를 형성하고, 이 충격파가 지상에 도달하면 큰 폭음으로 들립니다. 1947년 미국의 척 예거(Chuck Yeager)가 X-1 비행기로 인류 최초로 음속을 돌파했습니다. 현재는 F-15·F-16 같은 전투기, 일부 초음속 여객기(콩코드, 퇴역)가 음속을 넘을 수 있습니다.',
              },
              {
                q: '왜 우주에서는 소리가 안 들리나요?',
                a: '<strong>소리는 매질(공기·물·고체 등)이 있어야 전달</strong>됩니다. 우주는 거의 진공 상태(매우 적은 분자만 존재)이므로 음파가 전달될 매질이 없어 소리가 들리지 않습니다. 반면 빛은 매질 없이도 진공을 통과할 수 있어 우주에서도 별빛을 볼 수 있습니다. 영화에서 우주 폭발 소리가 들리는 장면은 과학적으로 정확하지 않습니다.',
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
              { href: '/tools/edu/planet-comparison',  icon: '🪐', name: '행성 비교 시각화',     desc: '8개 행성에서 내 몸무게·나이·하루' },
              { href: '/tools/edu/cosmic-calendar',    icon: '🌌', name: '코스믹 캘린더',         desc: '138억 년 우주 역사를 1년으로' },
              { href: '/tools/edu/circuit-simulator',  icon: '⚡', name: '옴의 법칙 시뮬레이터',  desc: '직렬·병렬 회로 시각화' },
              { href: '/tools/unit/length',            icon: '📏', name: '길이 변환기',           desc: 'cm·m·inch·ft·mile 변환' },
              { href: '/tools/unit/time',              icon: '⏱️', name: '시간 단위 변환기',     desc: '초·분·시간·일 변환' },
              { href: '/tools/edu',                    icon: '🔬', name: '교육·학습 카테고리',     desc: '추가 교육 도구 더보기' },
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
