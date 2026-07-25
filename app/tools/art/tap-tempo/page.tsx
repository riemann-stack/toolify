import Link from 'next/link'
import TapTempoClient from './TapTempoClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/art/tap-tempo',
  title: '탭 템포 계산기 — BPM 측정·메트로놈·박자감 테스트',
  description: '박자에 맞춰 탭하면 BPM 자동 측정 + 메트로놈과 박자감 테스트.',
  keywords: ['탭템포', 'BPM측정', '메트로놈', '박자감테스트', '템포계산기', 'BPM계산기', 'tap tempo'],
})

const FAQ_LD = [
              { q: '측정한 BPM이 실제 곡과 2배 차이나요.',
                a: '<strong>하프타임(Half-time)</strong>으로 체감되는 장르에서 흔히 발생합니다. 트랩·DnB는 드럼이 65~90으로 들리지만 공식 BPM은 130~180입니다. 반대로 발라드에서 8분음표로 탭하면 실제의 2배가 측정됩니다. 곡의 강박(킥 드럼, 기타 스트로크)에 맞춰 다시 탭해보세요.' },
              { q: '메트로놈에서 소리가 안 나요.',
                a: '브라우저 자동재생 정책 때문에 <strong>▶ 시작 버튼을 누른 뒤에만</strong> 소리가 나옵니다. iOS Safari는 묵음 모드(벨 스위치)에서도 Web Audio가 재생되지 않을 수 있으니 확인하세요. 볼륨도 함께 체크하세요.' },
              { q: '박자감 테스트의 별점 기준은?',
                a: '<strong>평균 BPM 오차율과 탭 간격 일관성(CV·변동계수)을 함께 평가</strong>하며, 둘 중 낮은 쪽이 별점이 됩니다. ⭐⭐⭐ = 오차 1% 이하 & CV 3% 이하 · ⭐⭐ = 오차 3% & CV 6% 이하 · ⭐ = 오차 5% & CV 10% 이하. 간격이 널뛰면 평균이 목표와 정확히 일치해도 만점을 받을 수 없습니다. 참고로 BPM 120 기준 1% 오차는 1.2 BPM, 즉 탭 간격 5ms 차이입니다.' },
              { q: '정확도(%)는 어떻게 계산되나요?',
                a: '탭 간격의 <strong>변동계수(CV = 표준편차 ÷ 평균 간격)</strong>를 기반으로, 평균 대비 1% 흔들릴 때마다 정확도가 5%p씩 낮아집니다. 예: 평균 500ms에서 표준편차 20ms(CV 4%)면 80%. 상대 비율 기준이라 느린 곡이든 빠른 곡이든 같은 비율로 흔들리면 같은 정확도가 나옵니다.' },
              { q: '모바일에서도 사용 가능한가요?',
                a: '네, <strong>터치에 최적화</strong>되어 있습니다. 큰 원형 버튼을 손가락으로 탭하면 되고, 메트로놈과 박자감 테스트 모두 모바일에서 동일하게 작동합니다. 단, 배경에서 앱 전환 시 Web Audio가 일시 정지될 수 있습니다.' },
            ]

export default function TapTempoPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>음악</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="art" />탭 템포 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        박자에 맞춰 탭하면 <strong style={{ color: 'var(--text)' }}>BPM 자동 측정</strong> + 메트로놈.
      </p>

      <TapTempoClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. BPM이란? ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            BPM이란?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            BPM(Beats Per Minute)은 1분에 몇 번의 박이 있는지를 나타내는 음악 템포 단위입니다.
            BPM 120은 1초에 2박(= 500ms 간격), BPM 60은 1초에 1박(= 1000ms 간격)입니다.
            이 계산기는 탭한 간격의 <strong style={{ color: 'var(--text)' }}>평균값</strong>으로 BPM을 계산합니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '14px', padding: '20px 22px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>BPM 계산 공식</p>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              BPM = 60,000 ÷ 평균 간격(ms)
            </p>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '15px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '-0.2px' }}>
              예: 간격 500ms → 60000 ÷ 500 = 120 BPM
            </p>
          </div>
        </div>

        {/* ── 2. 템포 용어표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            이탈리아어 템포 용어 표
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            클래식 악보에서 자주 보이는 템포 지시어와 해당 BPM 범위입니다.
            템포 용어에는 단일 표준이 없어 <strong style={{ color: 'var(--text)' }}>구간이 자료마다 다르고 서로 겹칩니다</strong>
            (예: Grave와 Largo의 40~45 구간). 실제로는 작곡가·지휘자에 따라 더 유연하게 해석됩니다.
            아래 계산기 배지는 이 표를 비겹침 경계로 단순화해 분류합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['용어', 'BPM 범위', '느낌'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { term: 'Grave',        bpm: '~45',     feel: '매우 느리고 장중하게' },
                  { term: 'Largo',        bpm: '40~60',   feel: '크고 폭넓게' },
                  { term: 'Larghetto',    bpm: '60~66',   feel: '다소 느리고 폭넓게' },
                  { term: 'Adagio',       bpm: '66~76',   feel: '느리고 서정적으로' },
                  { term: 'Andante',      bpm: '76~107',  feel: '걷는 속도로' },
                  { term: 'Moderato',     bpm: '108~119', feel: '보통 빠르기로' },
                  { term: 'Allegro',      bpm: '120~155', feel: '빠르고 활기차게' },
                  { term: 'Vivace',       bpm: '156~175', feel: '생동감 있고 빠르게' },
                  { term: 'Presto',       bpm: '176~199', feel: '매우 빠르게' },
                  { term: 'Prestissimo',  bpm: '200~',    feel: '최대한 빠르게' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row.term}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row.bpm}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row.feel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 장르별 BPM ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            장르별 대표 BPM 범위 — 측정값 검증용
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            탭으로 측정한 BPM이 장르의 통상 범위에서 크게 벗어난다면(특히 절반·2배) 강박을 잘못 잡았을 가능성이 큽니다.
            장르별 곡 느낌과 함께 탭 기준을 어디에 두면 좋은지 정리했습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { genre: '느린 발라드',    bpm: '60~75',    color: 'var(--cat-health)', desc: '감성 발라드, R&B 슬로잼 — 탭 간격이 1초 안팎으로 길어 8분음표를 따라가면 2배로 측정됨. 강박에만 탭' },
              { genre: '팝 발라드',      bpm: '76~95',    color: 'var(--cat-health)', desc: '한국 발라드 표준 템포 — 보컬 멜로디 대신 드럼 강박 기준으로 탭' },
              { genre: '댄스팝',         bpm: '96~115',   color: 'var(--accent-ink)', desc: '미드템포 팝, K-POP 발라드 — 측정값이 범위의 2배면 8분음표를 탭한 것' },
              { genre: '일반 팝·록',     bpm: '116~128',  color: 'var(--accent-ink)', desc: '아이돌 댄스곡, 밴드 록 — 킥·스네어가 또렷해 측정이 쉬운 구간' },
              { genre: 'EDM·하우스',     bpm: '122~132',  color: 'var(--cat-life)', desc: '클럽 하우스, 빅룸 EDM — 매 박마다 들어가는 킥에 맞춰 탭하면 정확' },
              { genre: '디스코·펑크',    bpm: '110~130',  color: 'var(--cat-life)', desc: '레트로 디스코, 재즈 펑크 — 하이햇 대신 킥·기타 스트로크 기준' },
              { genre: '힙합·트랩',      bpm: '130~170',  color: 'var(--cat-date)', desc: '트랩(하프타임 체감 65~85) — 측정값이 절반으로 나오면 2배 해서 확인' },
              { genre: '드럼앤베이스',   bpm: '160~180',  color: 'var(--cat-date)', desc: 'DnB, 정글 빠른 비트 — 절반 속도(85~90)로 체감되기 쉬운 장르' },
              { genre: '하드스타일·스피드코어', bpm: '150~',  color: 'var(--cat-art)', desc: '하드댄스, 스피드코어 — 너무 빠르면 강박만 세어 측정 후 2배' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${item.color} 27%, transparent)`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: item.color, fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>{item.genre}</p>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px', letterSpacing: '-0.3px' }}>{item.bpm} <span style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.08em' }}>BPM</span></p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            측정한 BPM으로 딜레이 타임(ms) 값을 설정하려면 <Link href="/tools/art/bpm" style={{ color: 'var(--accent)', fontWeight: 600 }}>BPM 딜레이 계산기</Link>를 이용하세요 —
            위 측정 결과의 &lsquo;🎛️ 이 BPM으로 딜레이 계산&rsquo; 버튼을 누르면 측정값이 자동으로 넘어갑니다. 장르별 4분음표·점8분음표 딜레이 ms 표도 그 페이지에 있습니다.
          </p>
        </div>

        {/* ── 4. K-POP 실측 BPM 앵커 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            K-POP 실측 BPM 앵커 — 아는 곡으로 검증하기
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            장르 범위표만으로 감이 안 잡히면 이미 아는 곡을 틀어 놓고 탭한 뒤, 공개된 BPM과 비교해 보세요.
            탭 결과가 표의 값과 ±2 이내면 강박을 제대로 잡은 것이고, 절반이나 2배가 나오면 하프타임·더블타임 문제입니다.
            아래 수치는 <a href="https://tunebat.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>Tunebat</a>·<a href="https://songbpm.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>SongBPM</a> 등 공개 BPM 데이터베이스 기준(2026-07 확인)으로, 분석 소스에 따라 ±1 BPM 정도 차이가 날 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['곡 — 아티스트', 'BPM', '대역', '탭 포인트'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : i === 3 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { song: '밤편지 — IU',           bpm: '79',  band: '팝 발라드',   tip: '어쿠스틱 스트로크 기준 — 8분음표를 따라가면 158로 잡힘' },
                  { song: 'Hype Boy — NewJeans',   bpm: '100', band: '댄스팝',      tip: '보컬 리듬 대신 킥·스네어 기준으로 탭' },
                  { song: 'Dynamite — BTS',        bpm: '114', band: '댄스팝',      tip: '디스코 리듬의 킥이 또렷해 측정 연습에 최적' },
                  { song: '강남스타일 — PSY',      bpm: '132', band: 'EDM·하우스',  tip: '매 박 들어가는 킥(포 온 더 플로어)마다 탭' },
                  { song: 'Ditto — NewJeans',      bpm: '134', band: '클럽 비트',   tip: '킥 패턴이 변칙적 — 스네어(2·4박) 기준이 안정적' },
                  { song: '뚜두뚜두 — BLACKPINK',  bpm: '140', band: '힙합·트랩',   tip: '하프타임 체감(70) — 절반으로 측정되면 2배' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row.song}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row.bpm}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row.band}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row.tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            연습 순서는 느린 곡부터가 좋습니다. 밤편지(79)로 강박 잡기를 익히고, Dynamite(114)처럼 킥이 또렷한 곡으로 넘어간 뒤,
            뚜두뚜두(140)처럼 하프타임으로 체감되는 곡에서 절반·2배를 스스로 판별할 수 있으면 어떤 곡이든 측정할 수 있습니다.
          </p>
        </div>

        {/* ── 5. 사용 팁 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            정확한 BPM 측정 팁
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { n: '①', title: '8~10번 이상 탭하세요',   desc: '탭이 많을수록 평균이 안정됩니다. 최소 4회 이상 탭해야 의미 있는 값이 나옵니다.' },
              { n: '②', title: '박마다 탭 (마디당 1회 아님)', desc: '4분음표 박마다 탭해야 BPM이 나옵니다. 마디 첫 박에만 탭하면 4/4 곡에서 실제의 1/4로 측정됩니다. 킥·스네어 등 드럼의 박 단위에 맞추세요.' },
              { n: '③', title: '스페이스·엔터 키 활용',  desc: '클릭보다 키보드 탭이 훨씬 안정적입니다. 리듬에 집중할 수 있어 오차가 줄어듭니다.' },
              { n: '④', title: '3초 쉬면 새 측정 시작',   desc: '3초 이상 쉬면 다음 탭부터 새 측정이 시작됩니다. 측정된 BPM은 화면에 계속 유지되니 천천히 확인하세요.' },
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

        {/* ── 6. 러닝 케이던스 ↔ BPM ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            러닝 케이던스(spm) ↔ BPM 매칭
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            러닝 케이던스는 분당 걸음 수(spm)로, BPM과 구조가 같은 단위입니다. 러닝머신에서 발이 닿는 순간마다(양발 모두) 탭하면
            측정값이 그대로 내 케이던스가 됩니다. 한쪽 발만 세어 탭했다면 2배 하세요.
            흔히 말하는 &lsquo;이상적 케이던스 180&rsquo;은 잭 대니얼스 코치가 1984년 올림픽 장거리 선수들을 관찰한 데서 나온
            벤치마크일 뿐 절대 규칙이 아니며, 일반 러너는 편한 페이스에서 155~175spm대가 흔합니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            선곡은 두 가지 방법이 있습니다. 케이던스와 같은 BPM 곡에 한 박 = 한 걸음을 맞추는 <strong style={{ color: 'var(--text)' }}>정박 매칭</strong>이 기본이지만,
            170~180 BPM 곡은 주류 음악에 드뭅니다. 대신 <strong style={{ color: 'var(--text)' }}>절반 BPM(85~90) 곡에 한 박당 두 걸음</strong>을
            맞추는 더블타임 활용법을 쓰면 발라드·힙합까지 선곡 폭이 크게 넓어집니다. 85 BPM × 2 = 170spm으로 효과는 동일합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['목표 케이던스', '정박 매칭 곡', '더블타임 활용 곡'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { spm: '160 spm', full: '160 BPM', half: '80 BPM' },
                  { spm: '165 spm', full: '165 BPM', half: '82~83 BPM' },
                  { spm: '170 spm', full: '170 BPM', half: '85 BPM' },
                  { spm: '175 spm', full: '175 BPM', half: '87~88 BPM' },
                  { spm: '180 spm', full: '180 BPM', half: '90 BPM' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row.spm}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row.full}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 600 }}>{row.half}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            앵커 표의 밤편지(79 BPM)를 더블타임으로 쓰면 158spm — 가벼운 조깅 케이던스와 맞아떨어지는 식입니다.
            무리하게 180에 맞추기보다, 먼저 탭으로 자신의 자연 케이던스를 재고 거기서 가까운 BPM부터 시작하세요.
          </p>
        </div>

        {/* ── 7. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
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

        {/* ── 8. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/art/bpm',         icon: '🎛️', name: 'BPM 딜레이 계산기',   desc: '측정한 BPM으로 음표별 딜레이 ms 계산' },
              { href: '/tools/art/capo',        icon: '🎸', name: '기타 카포 계산기',    desc: '카포 위치별 코드 변환·편곡' },
              { href: '/tools/art/frequency',   icon: '🎵', name: '주파수↔음정 변환기',  desc: 'Hz ↔ 음정·MIDI·파장' },
              { href: '/tools/art/vocal-range', icon: '🎤', name: '음역대 측정기',       desc: '마이크로 최저·최고음 측정' },
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
