import Link from 'next/link'
import FrequencyClient from './FrequencyClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/music/frequency',
  title: '주파수 음정 변환기 — Hz ↔ 음이름·MIDI·파장 계산',
  description: '주파수(Hz)를 음정 이름(A4, C#3 등)으로 변환하거나, 음정에서 정확한 주파수를 계산합니다. MIDI 번호, 파장, 센트 오차, 음정 간격 계산 지원. 작곡가·사운드 엔지니어 필수.',
  keywords: ['주파수음정변환기', 'Hz음정변환', '음정주파수계산기', 'MIDI번호계산', '음정계산기', '튜닝계산기', '음악계산기'],
})

export default function FrequencyPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>음악</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎵 주파수 음정 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        주파수(Hz)를 음정 이름으로 변환하거나, 음정에서 정확한 Hz·MIDI 번호·파장을 계산하세요. 센트 튜너 게이지와 피아노 건반 시각화 포함.
      </p>

      <FrequencyClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 음정과 주파수의 관계 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            음정과 주파수의 관계
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            서양 음악의 12음 평균율(Equal Temperament)에서는 한 옥타브(12반음)를 수학적으로 균등하게 나눕니다.
            A4 = 440 Hz를 기준으로 반음마다 2^(1/12) ≈ 1.0595배씩 주파수가 증가합니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '14px', padding: '20px 22px', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>핵심 공식</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Hz → MIDI',       formula: 'MIDI = 69 + 12 × log₂(Hz / 440)' },
                { label: 'MIDI → Hz',       formula: 'Hz = 440 × 2^((MIDI − 69) / 12)' },
                { label: '센트 오차',       formula: 'cents = 1200 × log₂(실제Hz / 이론Hz)' },
                { label: '파장(cm)',        formula: 'λ = 34,300 cm/s ÷ Hz' },
              ].map(({ label, formula }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, minWidth: 70, letterSpacing: '0.03em' }}>{label}</span>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', color: 'var(--text)', fontWeight: 700 }}>{formula}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            한 옥타브 위의 음은 주파수가 정확히 2배입니다.
            예: A4 = 440 Hz → A5 = 880 Hz → A3 = 220 Hz.
            1200센트 = 1옥타브, 100센트 = 1반음.
            센트(cent)는 ±50 이내면 음정이 정확하다고 판단합니다.
          </p>
        </div>

        {/* ── 2. 주요 음정 주파수 기준표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            주요 음정 주파수 기준표 (A4 = 440 Hz)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['음정', 'Hz', 'MIDI', '파장(cm)', '옥타브'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['C3', '130.81', '48', '262.2', '3', '#3EFF9B'],
                  ['G3', '196.00', '55', '175.0', '3', '#3EFF9B'],
                  ['C4 (중간 도)', '261.63', '60', '131.1', '4', '#C8FF3E'],
                  ['D4', '293.66', '62', '116.8', '4', '#C8FF3E'],
                  ['E4', '329.63', '64', '104.1', '4', '#C8FF3E'],
                  ['F4', '349.23', '65', '98.2', '4', '#C8FF3E'],
                  ['G4', '392.00', '67', '87.5', '4', '#C8FF3E'],
                  ['A4 (국제 표준)', '440.00', '69', '77.9', '4', '#C8FF3E'],
                  ['B4', '493.88', '71', '69.4', '4', '#C8FF3E'],
                  ['C5', '523.25', '72', '65.5', '5', '#3EC8FF'],
                  ['A5', '880.00', '81', '39.0', '5', '#3EC8FF'],
                ].map(([note, hz, midi, wave, oct, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{note}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{hz}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Syne, sans-serif', color: 'var(--muted)' }}>{midi}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Syne, sans-serif', color: 'var(--muted)' }}>{wave}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{oct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 파장 = 34,300 cm/s (20°C 공기 중 음속) ÷ 주파수. 온도·습도에 따라 음속이 달라집니다.
          </p>
        </div>

        {/* ── 3. 기준음 A4 변천사 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            기준음 A4 변천사와 용도
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                hz: '440 Hz',
                badge: '현재 국제 표준',
                color: '#C8FF3E',
                year: '1939년 국제 표준화',
                desc: '1939년 런던 국제음악회의에서 채택된 표준 피치. ISO 16:1975로 공식화. 현대 클래식, 팝, 재즈, 방송 등 대부분의 음악에서 사용됩니다.',
              },
              {
                hz: '432 Hz',
                badge: '대안 튜닝',
                color: '#3EFF9B',
                year: '일부 뮤지션 선호',
                desc: '432 Hz는 일부 음악가들이 "더 자연스럽고 따뜻한 음색"이라고 주장하는 대안 피치입니다. 과학적 근거는 논쟁 중이지만, 특정 장르(명상 음악, 힐링 음악)에서 의도적으로 사용됩니다.',
              },
              {
                hz: '443 Hz',
                badge: '오케스트라',
                color: '#3EC8FF',
                year: '유럽 오케스트라',
                desc: '베를린 필하모닉, 빈 필하모닉 등 일부 유럽 오케스트라는 더 밝고 화려한 음색을 위해 443–445 Hz를 사용합니다. 440 Hz보다 약 12센트 높습니다.',
              },
              {
                hz: '415 Hz',
                badge: '바로크 피치',
                color: '#FF8C3E',
                year: '17–18세기 바로크 시대',
                desc: '바흐, 헨델, 비발디 시대의 악기는 약 415 Hz로 튜닝되었습니다. 현대 바로크 앙상블이 시대 연주(HIP) 시 사용. 440 Hz보다 정확히 반음 낮습니다.',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}25`, borderRadius: '12px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: item.color }}>{item.hz}</span>
                  <span style={{ fontSize: '11px', background: `${item.color}20`, color: item.color, fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>{item.badge}</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px', letterSpacing: '0.03em' }}>{item.year}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '440 Hz와 432 Hz의 차이는 무엇인가요?',
                a: '440 Hz는 ISO 16:1975 국제 표준이고, 432 Hz는 그보다 약 32센트(0.32 반음) 낮은 대안 피치입니다. 일부 음악가들이 432 Hz가 더 편안하다고 주장하지만, 과학적으로 유의미한 청각적 차이는 입증되지 않았습니다. 실제로 이 차이는 훈련된 귀로도 구분이 어려울 정도로 미묘합니다.' },
              { q: '센트(cent)란 무엇인가요?',
                a: '센트는 음정 차이를 측정하는 단위입니다. 1옥타브 = 1200센트, 1반음 = 100센트. 따라서 1센트는 반음의 1/100입니다. ±50센트 범위 내에 있으면 "올바른 음정"으로 간주합니다. 전문 연주자는 ±5센트 이내의 정확도를 목표로 합니다.' },
              { q: 'MIDI 번호는 어떻게 활용하나요?',
                a: 'MIDI(Musical Instrument Digital Interface) 번호는 0~127 범위의 정수로 음정을 표현합니다. 중간 C(C4) = MIDI 60, A4 = MIDI 69. DAW(디지털 오디오 워크스테이션), 미디 편집 소프트웨어, 신디사이저에서 음정을 숫자로 다룰 때 필수적입니다.' },
              { q: '인간이 들을 수 있는 주파수 범위는?',
                a: '일반적으로 20 Hz ~ 20,000 Hz (20 kHz)입니다. 나이가 들면서 고주파 가청 범위가 줄어들어 성인은 보통 16 kHz까지 잘 들립니다. 음악에서 실용적으로 사용되는 범위는 약 16 Hz(피아노 최저음 C0) ~ 4,186 Hz(피아노 최고음 C8)입니다.' },
              { q: '기타 개방현의 표준 튜닝 주파수는?',
                a: '기타 6번줄(E2) = 82.41 Hz, 5번줄(A2) = 110 Hz, 4번줄(D3) = 146.83 Hz, 3번줄(G3) = 196 Hz, 2번줄(B3) = 246.94 Hz, 1번줄(E4) = 329.63 Hz입니다. 이 계산기의 "음정 → Hz" 탭에서 각 음을 선택해 정확한 주파수를 확인하고 튜닝에 활용할 수 있습니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/music/bpm',       icon: '🎛️', name: 'BPM 딜레이 타임 계산기', desc: '딜레이·리버브 ms 값 즉시 계산' },
              { href: '/tools/life/golden-ratio',icon: '🌀', name: '황금 비율 계산기',       desc: '음악 구성에 황금 비율 적용' },
              { href: '/tools/unit/length',      icon: '📏', name: '길이 변환기',            desc: 'cm·m·inch·ft 단위 변환' },
              { href: '/tools/dev/color',        icon: '🎨', name: '색상 코드 변환기',       desc: 'HEX·RGB·HSL 즉시 변환' },
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
