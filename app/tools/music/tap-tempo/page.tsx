import Link from 'next/link'
import TapTempoClient from './TapTempoClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/music/tap-tempo',
  title: '탭 템포 계산기 — BPM 측정·메트로놈·박자감 테스트',
  description: '노래나 연주의 BPM을 탭으로 즉시 측정하고, 메트로놈으로 박자를 연습하며, 박자감 테스트로 리듬감을 확인하세요. 장르별 BPM 프리셋, 템포 용어 가이드 포함.',
  keywords: ['탭템포', 'BPM측정', '메트로놈', '박자감테스트', '템포계산기', 'BPM계산기', 'tap tempo'],
})

export default function TapTempoPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>음악</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        👆 탭 템포 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        탭으로 BPM을 측정하고, 메트로놈으로 박자를 익히고, 박자감 테스트로 리듬감을 점검하세요.
      </p>

      <TapTempoClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. BPM이란? ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            BPM이란?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            BPM(Beats Per Minute)은 1분에 몇 번의 박이 있는지를 나타내는 음악 템포 단위입니다.
            BPM 120은 1초에 2박(= 500ms 간격), BPM 60은 1초에 1박(= 1000ms 간격)입니다.
            이 계산기는 탭한 간격의 <strong style={{ color: 'var(--text)' }}>평균값</strong>으로 BPM을 계산합니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '14px', padding: '20px 22px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>BPM 계산 공식</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              BPM = 60,000 ÷ 평균 간격(ms)
            </p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '-0.2px' }}>
              예: 간격 500ms → 60000 ÷ 500 = 120 BPM
            </p>
          </div>
        </div>

        {/* ── 2. 템포 용어표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            이탈리아어 템포 용어 표
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            클래식 악보에서 자주 보이는 템포 지시어와 해당 BPM 범위입니다.
            실제로는 작곡가·지휘자에 따라 BPM이 유연하게 해석됩니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['용어', 'BPM 범위', '느낌'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { term: 'Grave',        bpm: '~59',     feel: '매우 느리고 장중하게' },
                  { term: 'Largo',        bpm: '60~65',   feel: '크고 폭넓게' },
                  { term: 'Adagio',       bpm: '66~75',   feel: '느리고 서정적으로' },
                  { term: 'Andante',      bpm: '76~107',  feel: '걷는 속도로' },
                  { term: 'Moderato',     bpm: '108~119', feel: '보통 빠르기로' },
                  { term: 'Allegro',      bpm: '120~155', feel: '빠르고 활기차게' },
                  { term: 'Vivace',       bpm: '156~175', feel: '생동감 있고 빠르게' },
                  { term: 'Presto',       bpm: '176~199', feel: '매우 빠르게' },
                  { term: 'Prestissimo',  bpm: '200~',    feel: '최대한 빠르게' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{row.term}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{row.bpm}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row.feel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 장르별 BPM ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            장르별 대표 BPM 범위
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { genre: '느린 발라드',    bpm: '60~75',    color: '#3EC8FF', desc: '감성 발라드, R&B 슬로잼' },
              { genre: '팝 발라드',      bpm: '76~95',    color: '#3EC8FF', desc: '한국 발라드 표준 템포' },
              { genre: '댄스팝',         bpm: '96~115',   color: '#C8FF3E', desc: '미드템포 팝, K-POP 발라드' },
              { genre: '일반 팝·록',     bpm: '116~128',  color: '#C8FF3E', desc: '아이돌 댄스곡, 밴드 록' },
              { genre: 'EDM·하우스',     bpm: '122~132',  color: '#FF8C3E', desc: '클럽 하우스, 빅룸 EDM' },
              { genre: '디스코·펑크',    bpm: '110~130',  color: '#FF8C3E', desc: '레트로 디스코, 재즈 펑크' },
              { genre: '힙합·트랩',      bpm: '130~170',  color: '#FF3E8C', desc: '트랩(하프타임 체감 65~85)' },
              { genre: '드럼앤베이스',   bpm: '170~180',  color: '#FF3E8C', desc: 'DnB, 정글 빠른 비트' },
              { genre: '하드스타일·스피드코어', bpm: '150~',  color: '#B03EFF', desc: '하드댄스, 스피드코어' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: item.color, fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>{item.genre}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px', letterSpacing: '-0.3px' }}>{item.bpm} <span style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.08em' }}>BPM</span></p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 사용 팁 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            정확한 BPM 측정 팁
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { n: '①', title: '8~10번 이상 탭하세요',   desc: '탭이 많을수록 평균이 안정됩니다. 최소 4회 이상 탭해야 의미 있는 값이 나옵니다.' },
              { n: '②', title: '강박(1박)에 맞춰 탭',    desc: '매 마디의 첫 박(강박)에만 탭하는 것이 가장 정확합니다. 4박자 곡이라면 1/5/9번째 박에 탭하세요.' },
              { n: '③', title: '스페이스·엔터 키 활용',  desc: '클릭보다 키보드 탭이 훨씬 안정적입니다. 리듬에 집중할 수 있어 오차가 줄어듭니다.' },
              { n: '④', title: '3초 멈추면 자동 리셋',   desc: '잘못 탭했다면 3초 기다리면 됩니다. 또는 ↺ 리셋 버튼을 누르세요.' },
              { n: '⑤', title: '하프타임·더블타임 주의', desc: '트랩·DnB 같은 장르는 듣는 속도(하프타임)와 실제 BPM이 2배 차이납니다. 둘 다 측정해보세요.' },
              { n: '⑥', title: '정확도 지표 참고',       desc: '정확도 80% 이상이면 신뢰할 만한 측정입니다. 낮다면 탭 타이밍을 다시 잡아보세요.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '4px' }}>{item.n} {item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '측정한 BPM이 실제 곡과 2배 차이나요.',
                a: '하프타임(Half-time)으로 체감되는 장르에서 흔히 발생합니다. 트랩·DnB는 드럼이 65~85로 들리지만 공식 BPM은 130~170입니다. 반대로 발라드에서 8분음표로 탭하면 실제의 2배가 측정됩니다. 곡의 강박(킥 드럼, 기타 스트로크)에 맞춰 다시 탭해보세요.' },
              { q: '메트로놈에서 소리가 안 나요.',
                a: '브라우저 자동재생 정책 때문에 ▶ 시작 버튼을 누른 뒤에만 소리가 나옵니다. iOS Safari는 묵음 모드(벨 스위치)에서도 Web Audio가 재생되지 않을 수 있으니 확인하세요. 볼륨도 함께 체크하세요.' },
              { q: '박자감 테스트의 별점 기준은?',
                a: '오차율 기준입니다. ⭐⭐⭐(1% 이하) = 프로 수준 · ⭐⭐(3% 이하) = 훌륭함 · ⭐(5% 이하) = 좋음 · 연습 필요(10% 이하) · 메트로놈 연습 권장(그 이상). 참고로 BPM 120 기준 1% 오차는 1.2 BPM, 즉 탭 간격 5ms 차이입니다.' },
              { q: '정확도(%)는 어떻게 계산되나요?',
                a: '탭 간격의 표준편차(stdDev)를 기반으로 계산합니다. 간격이 매번 일정할수록 표준편차가 작고 정확도가 100%에 가깝습니다. 표준편차 20ms 이하면 거의 100%, 100ms 이상이면 0%로 선형 환산됩니다.' },
              { q: '모바일에서도 사용 가능한가요?',
                a: '네, 터치에 최적화되어 있습니다. 큰 원형 버튼을 손가락으로 탭하면 되고, 메트로놈과 박자감 테스트 모두 모바일에서 동일하게 작동합니다. 단, 배경에서 앱 전환 시 Web Audio가 일시 정지될 수 있습니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/music/bpm',       icon: '🎛️', name: 'BPM 딜레이 타임',     desc: '측정한 BPM으로 딜레이·리버브 ms 계산' },
              { href: '/tools/music/capo',      icon: '🎸', name: '기타 카포·전조 계산기', desc: '카포 위치별 코드 변환·편곡' },
              { href: '/tools/music/frequency', icon: '🎵', name: '주파수 음정 변환기',   desc: 'Hz ↔ 음정·MIDI·파장' },
              { href: '/tools/life/pomodoro',   icon: '🍅', name: '뽀모도로 타이머',      desc: '연습 루틴·집중 관리' },
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
