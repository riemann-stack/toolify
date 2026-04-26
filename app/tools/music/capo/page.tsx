import Link from 'next/link'
import CapoClient from './CapoClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/music/capo',
  title: '기타 카포 계산기 — 카포 위치별 코드 변환·쉬운 코드 추천',
  description: '원하는 키에서 카포 위치별 코드 변환을 계산합니다. 쉬운 오픈 코드 추천, 전조 계산, 다이아토닉 코드 표. 기타 입문자도 쉽게 코드 편곡 가능.',
  keywords: ['기타카포계산기', '카포위치계산', '기타전조계산기', '코드변환계산기', '카포코드표', '기타코드이동', '전조계산기'],
})

export default function CapoPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>음악</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎸 기타 카포·전조 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        원하는 키에서 카포 위치별 연주 코드를 즉시 확인하고, 쉬운 오픈 코드로 자동 편곡하세요.
      </p>

      <CapoClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 카포란? ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            카포(Capo)란 무엇인가?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            카포(Capo)는 기타·우쿨렐레 등 프렛 악기의 특정 프렛에 끼워 <strong style={{ color: 'var(--text)' }}>모든 현을 동시에 높이 조율하는 장치</strong>입니다.
            카포를 1프렛에 끼우면 모든 현이 반음 올라가고, 3프렛에 끼우면 단3도 올라갑니다.
            쉬운 코드 모양을 유지하면서 다른 키로 이조할 수 있어 기타 편곡의 핵심 도구입니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '14px', padding: '20px 22px', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>카포 계산 공식</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              실제 울리는 키 = 연주 코드 + 카포 프렛 수(반음)
            </p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '-0.2px' }}>
              예: G 코드 + 카포 3프렛 → B♭ 키
            </p>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>왜 카포를 쓰나요?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { n: '①', title: '보컬 음역대 맞추기', desc: '원곡 키가 보컬에게 너무 높거나 낮을 때 카포로 키를 옮겨 부르기 편한 높이로 조정합니다.' },
              { n: '②', title: '쉬운 코드로 편곡',   desc: '바레 코드가 많은 F·B♭ 키를 카포 1~5프렛으로 옮겨 E·C·G·D 같은 오픈 코드로 연주합니다.' },
              { n: '③', title: '앙상블 보이싱',      desc: '다른 기타와 같은 곡을 다른 카포로 연주하면 겹치지 않는 코드 보이싱이 생겨 풍성한 사운드가 됩니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '4px' }}>{item.n} {item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 카포 위치별 코드 변환 예시 (C키 기준) ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            카포 위치별 코드 변환 — C키 기준
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            같은 C키 곡이라도 카포 위치에 따라 잡는 코드 모양과 난이도가 완전히 달라집니다. 아래는 C키 곡을 카포별로 어떻게 연주할 수 있는지 정리한 표입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['카포', '연주 코드', '실제 키', '난이도'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { fret: '없음',  chord: 'C',  key: 'C', diff: '보통 (F코드 포함)', badge: null },
                  { fret: '1프렛', chord: 'B',  key: 'C', diff: '어려움 (바레 다수)', badge: null },
                  { fret: '2프렛', chord: 'A♯', key: 'C', diff: '어려움',           badge: null },
                  { fret: '3프렛', chord: 'A',  key: 'C', diff: '✨ 쉬움',          badge: 'rec' },
                  { fret: '4프렛', chord: 'G♯', key: 'C', diff: '어려움',           badge: null },
                  { fret: '5프렛', chord: 'G',  key: 'C', diff: '✨ 쉬움',          badge: 'rec' },
                  { fret: '7프렛', chord: 'F',  key: 'C', diff: '어려움 (바레)',    badge: null },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: row.badge === 'rec' ? 'rgba(62,255,155,0.05)' : (i % 2 === 0 ? 'transparent' : 'var(--bg2)') }}>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{row.fret}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>{row.chord}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{row.key}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: row.badge === 'rec' ? '#3EFF9B' : 'var(--muted)' }}>{row.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 오픈 코드 vs 바레 코드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            오픈 코드 vs 바레 코드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,255,155,0.3)', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: '#3EFF9B', fontWeight: 700, marginBottom: '8px' }}>🟢 오픈 코드 (쉬움)</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                C · G · D · Em · Am · A · E · Dm
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
                개방현(아무 프렛도 안 누른 현)을 활용하여 손가락 부담이 적은 코드.
                입문자가 가장 먼저 배우는 코드이며 풍부한 울림이 특징입니다.
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,140,62,0.3)', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: '#FF8C3E', fontWeight: 700, marginBottom: '8px' }}>🔴 바레 코드 (어려움)</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                F · B♭ · E♭ · A♭ · D♭ · G♭ · B
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
                검지로 여러 현을 동시에 누르는(바레) 코드. 악력과 정확한 폼이 필요해 입문자에게 진입장벽이 높습니다.
                카포로 대부분 오픈 코드로 대체 가능합니다.
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. 자주 쓰는 키별 추천 카포 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 쓰는 키별 추천 카포 위치
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['키', '추천 카포', '연주 코드 모양', '난이도'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: 'C',  fret: '없음 / 3프렛',  play: 'C / A',      diff: '쉬움' },
                  { k: 'D',  fret: '2프렛',         play: 'C',          diff: '쉬움' },
                  { k: 'E',  fret: '4프렛',         play: 'C',          diff: '쉬움' },
                  { k: 'F',  fret: '1프렛 / 5프렛', play: 'E / C',      diff: '쉬움' },
                  { k: 'G',  fret: '없음',          play: 'G',          diff: '쉬움' },
                  { k: 'A',  fret: '없음 / 2프렛',  play: 'A / G',      diff: '쉬움' },
                  { k: 'B♭', fret: '1프렛 / 3프렛', play: 'A / G',      diff: '쉬움' },
                  { k: 'B',  fret: '2프렛 / 4프렛', play: 'A / G',      diff: '쉬움' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px' }}>{row.k}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{row.fret}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#3EFF9B', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{row.play}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 모든 키는 카포를 쓰면 어려운 바레 코드(F·B♭ 등)를 오픈 코드로 대체할 수 있습니다.
          </p>
        </div>

        {/* ── 5. 다이아토닉 코드 & 진행 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            다이아토닉 코드와 기본 진행
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            메이저 키에는 7개의 다이아토닉 코드가 있으며 각각 로마 숫자(I~vii°)로 표기합니다.
            이 7개 코드만으로 팝·록·포크 대부분의 진행이 구성됩니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {[
              { role: 'I (토닉, T)',       color: '#C8FF3E', desc: '곡의 중심. 시작·끝·안정감을 담당' },
              { role: 'IV (서브도미넌트, SD)', color: '#3EC8FF', desc: '긴장을 만들며 V로 이어짐' },
              { role: 'V (도미넌트, D)',   color: '#FF8C3E', desc: '가장 강한 긴장. I로 해결' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: item.color, fontWeight: 700, marginBottom: '4px' }}>{item.role}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>가장 많이 쓰이는 진행: I - V - vi - IV</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { key: 'C 키', chords: 'C - G - Am - F' },
              { key: 'G 키', chords: 'G - D - Em - C' },
              { key: 'D 키', chords: 'D - A - Bm - G' },
              { key: 'A 키', chords: 'A - E - F♯m - D' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--accent)', minWidth: 50 }}>{row.key}</span>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>{row.chords}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '카포를 쓰면 음질이 나빠지나요?',
                a: '고품질 카포 사용 시 음질 차이는 거의 없습니다. 다만 카포가 너무 느슨하거나 타이트하면 음정이 틀어질 수 있습니다. 카포 장착 후 반드시 튜닝을 다시 확인하세요.' },
              { q: '카포 7프렛 이상은 왜 잘 안 쓰나요?',
                a: '프렛이 높아질수록 현의 장력이 높아져 음정이 불안정해지고 코드 잡기도 어려워집니다. 또한 가청 음역대가 너무 높아져 기타 특유의 따뜻한 음색이 사라집니다. 일반적으로 카포 5프렛 이하를 권장합니다.' },
              { q: '카포 없이 전조하려면 어떻게 하나요?',
                a: '모든 코드를 반음 단위로 이동하면 됩니다. 예를 들어 C키를 D키로 올리려면 모든 코드를 2반음 올립니다. C→D, Am→Bm, F→G, G→A. 이 계산기의 "전조" 탭을 활용하세요.' },
              { q: '같은 키라도 카포 위치에 따라 음색이 다른가요?',
                a: '네, 다릅니다. 카포가 높을수록 현의 진동 부분이 짧아져 더 밝고 날카로운 소리가 납니다. 카포 없는 낮은 포지션은 따뜻하고 풍부한 음색, 카포 5프렛 이상은 맑고 영롱한 음색입니다. 같은 C키라도 카포 없음(C코드)과 카포 3프렛(A코드)은 음색이 확실히 다릅니다.' },
              { q: '우쿨렐레에도 카포를 쓸 수 있나요?',
                a: '네. 우쿨렐레용 카포가 별도로 있으며 기타와 같은 원리로 작동합니다. 다만 우쿨렐레는 G-C-E-A 조율이 기본이라 코드 이름이 기타와 다를 수 있습니다. 이 계산기의 반음 단위 계산 원리는 동일하게 적용됩니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/music/frequency', icon: '🎵', name: '주파수 음정 변환기', desc: 'Hz ↔ 음정·MIDI·파장' },
              { href: '/tools/music/bpm',       icon: '🎛️', name: 'BPM 딜레이 타임',   desc: '딜레이·리버브 ms 계산' },
              { href: '/tools/life/pomodoro',   icon: '🍅', name: '뽀모도로 타이머',    desc: '연습 루틴·집중 관리' },
              { href: '/tools/date/dday',       icon: '📅', name: 'D-day 계산기',      desc: '공연·합주 D-day 관리' },
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
