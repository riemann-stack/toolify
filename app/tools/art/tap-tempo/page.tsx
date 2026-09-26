import Link from 'next/link'
import TapTempoClient from './TapTempoClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/art/tap-tempo',
  title: '탭 템포 계산기 — BPM 측정·메트로놈·박자감 테스트 + BPM 딜레이 ms',
  description: '박자에 맞춰 탭하면 BPM 자동 측정 + 메트로놈·박자감 테스트, 딜레이 계산 탭에서 음표별 딜레이 ms(점·셋잇단)까지. 밤편지 79·Dynamite 114 등 K-POP 실측 BPM 앵커와 러닝 케이던스(spm) 매칭 표 포함.',
  keywords: ['탭템포', 'BPM측정', '메트로놈', '박자감테스트', '템포계산기', 'BPM계산기', 'tap tempo',
    'BPM딜레이계산기', '딜레이타임계산', '딜레이ms계산', 'BPM딜레이', 'DAW딜레이설정', '리버브프리딜레이'],
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
              /* ── 딜레이 계산 탭 (구 /tools/art/bpm FAQ) ── */
              { q: '점음표(dotted)는 왜 ×1.5인가요?',
                a: '점음표는 원래 음표 길이에 <strong>절반을 더한 값</strong>입니다. 예를 들어 점 4분음표는 4분음표 + 8분음표 = 1.5배 길이입니다. 점 8분음표 딜레이는 핑퐁 딜레이 등에서 리듬감을 줄 때 널리 쓰입니다. 참고로 슬랩백 에코는 이와 달리 75~120ms 안팎의 짧은 단일 반복 효과로, 음표 동기와는 다른 개념입니다.' },
              { q: '셋잇단음표(triplet)는 ×⅔인 이유는?',
                a: '셋잇단음표는 <strong>2박자 공간에 3개의 음을 넣는 방식</strong>으로, 1개 음의 길이가 원래 값의 2/3입니다. BPM 120의 4분음표는 500ms이지만 셋잇단 4분음표는 약 333ms입니다. 트리플렛 딜레이는 펑키하고 스윙감 있는 그루브를 만들 때 효과적입니다.' },
              { q: 'BPM이 소수(예: 128.5)여도 계산되나요?',
                a: '네, [딜레이 계산] 탭은 소수점 BPM도 지원합니다. 예를 들어 128.5 BPM의 4분음표 딜레이는 <code>60,000 ÷ 128.5 ≈ 467ms</code>입니다. 하드웨어 드럼머신이나 빈티지 신디사이저의 경우 정수가 아닌 BPM이 있을 수 있습니다. 메트로놈·박자감 테스트의 목표 BPM은 정수로 입력합니다.' },
              { q: '딜레이 피드백(Feedback)은 어떻게 설정하나요?',
                a: '피드백은 딜레이 반복 횟수를 제어합니다. 보통 <strong>20~40% 설정이 자연스럽고</strong>, 50% 이상은 점점 쌓이는 느낌, 100% 근처는 무한 반복(셀프 오실레이션)이 됩니다. 단, 슬랩백 에코는 피드백 0~15%로 1회 반복이 정석입니다. [딜레이 계산] 탭은 딜레이 타임(ms) 계산에 특화되어 있으며, 피드백은 DAW에서 직접 설정하세요.' },
              { q: '리버브 프리딜레이와 딜레이 타임의 차이는?',
                a: '<strong>딜레이 타임</strong>은 에코 효과처럼 원음 이후 반복 신호가 들어오는 간격입니다. <strong>리버브 프리딜레이</strong>는 리버브 잔향이 시작되기 전의 짧은 공백으로, 원음을 공간감 속에서 분리시켜 선명하게 들리게 합니다. 프리딜레이는 보통 짧은 값(약 10~125ms — 120 BPM 기준 16분음표 이하)을 사용하며, 템포가 느리면 같은 음표값이라도 ms가 길어집니다.' },
              { q: '딜레이 ms 값을 LFO 속도(Hz)로 변환하려면?',
                a: '주파수는 시간의 역수이므로 <code>Hz = 1,000 ÷ ms</code>로 변환합니다. 예를 들어 BPM 120의 4분음표 딜레이 500ms는 1,000 ÷ 500 = <strong>2Hz</strong>, 8분음표 250ms는 4Hz입니다. 트레몰로·오토팬·코러스처럼 LFO 속도를 Hz로 입력하는 플러그인을 박자에 맞출 때 사용합니다.' },
              { q: '한 마디(1 bar) 길이는 어떻게 계산하나요?',
                a: '4/4박자 기준 한 마디는 4분음표 4개이므로 <code>240,000 ÷ BPM</code>(ms)입니다. BPM 120이면 240,000 ÷ 120 = <strong>2,000ms(2초)</strong>입니다. 리버브 디케이를 한 마디나 반 마디 길이에 맞추거나, 루프·샘플 길이를 가늠할 때 활용할 수 있습니다.' },
            ]

export default function TapTempoPage() {
  return (
    <ToolPage width={760} slug="/tools/art/tap-tempo">
      <h1 className="tp-h1">
        <ToolIconBadge catId="art" />탭 템포 계산기
      </h1>
      <p className="tp-lead">
        박자에 맞춰 탭하면 <strong style={{ color: 'var(--text)' }}>BPM 자동 측정</strong> + 메트로놈·박자감 테스트, [딜레이 계산] 탭에서 <strong style={{ color: 'var(--text)' }}>음표별 딜레이 ms</strong>까지.
      </p>

      <TapTempoClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. BPM이란? ── */}
        <div>
          <h2 className="g-h2">
            BPM이란?
          </h2>
          <p className="g-p">
            BPM(Beats Per Minute)은 1분에 몇 번의 박이 있는지를 나타내는 음악 템포 단위입니다.
            BPM 120은 1초에 2박(= 500ms 간격), BPM 60은 1초에 1박(= 1000ms 간격)입니다.
            이 계산기는 탭한 간격의 <strong style={{ color: 'var(--text)' }}>평균값</strong>으로 BPM을 계산합니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)', borderRadius: 'var(--radius-card)', padding: '20px 22px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>BPM 계산 공식</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              BPM = 60,000 ÷ 평균 간격(ms)
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '-0.2px' }}>
              예: 간격 500ms → 60000 ÷ 500 = 120 BPM
            </p>
          </div>
        </div>

        {/* ── 2. 템포 용어표 ── */}
        <div>
          <h2 className="g-h2">
            이탈리아어 템포 용어 표
          </h2>
          <p className="g-p">
            클래식 악보에서 자주 보이는 템포 지시어와 해당 BPM 범위입니다.
            템포 용어에는 단일 표준이 없어 <strong style={{ color: 'var(--text)' }}>구간이 자료마다 다르고 서로 겹칩니다</strong>
            (예: Grave와 Largo의 40~45 구간). 실제로는 작곡가·지휘자에 따라 더 유연하게 해석됩니다.
            아래 계산기 배지는 이 표를 비겹침 경계로 단순화해 분류합니다.
          </p>
          <div className="tableScroll">
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
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.term}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.bpm}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row.feel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 장르별 BPM ── */}
        <div>
          <h2 className="g-h2">
            장르별 대표 BPM 범위 — 측정값 검증용
          </h2>
          <p className="g-p">
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
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${item.color} 27%, transparent)`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: item.color, fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>{item.genre}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px', letterSpacing: '-0.3px' }}>{item.bpm} <span style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.08em' }}>BPM</span></p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            측정한 BPM으로 딜레이 타임(ms) 값을 설정하려면 위 측정 결과의 &lsquo;이 BPM으로 딜레이 계산 →&rsquo; 버튼을 누르세요 —
            계산기가 <strong style={{ color: 'var(--text)' }}>[딜레이 계산]</strong> 탭으로 전환되며 측정값이 자동으로 입력됩니다. 장르별 4분음표·점8분음표 딜레이 ms 표는 아래 &lsquo;장르별 딜레이 타임 설정 참고표&rsquo;에 있습니다.
          </p>
        </div>

        {/* ── 4. K-POP 실측 BPM 앵커 ── */}
        <div>
          <h2 className="g-h2">
            K-POP 실측 BPM 앵커 — 아는 곡으로 검증하기
          </h2>
          <p className="g-p">
            장르 범위표만으로 감이 안 잡히면 이미 아는 곡을 틀어 놓고 탭한 뒤, 공개된 BPM과 비교해 보세요.
            탭 결과가 표의 값과 ±2 이내면 강박을 제대로 잡은 것이고, 절반이나 2배가 나오면 하프타임·더블타임 문제입니다.
            아래 수치는 <a href="https://tunebat.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>Tunebat</a>·<a href="https://songbpm.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>SongBPM</a> 등 공개 BPM 데이터베이스 기준(2026-07 확인)으로, 분석 소스에 따라 ±1 BPM 정도 차이가 날 수 있습니다.
          </p>
          <div className="tableScroll">
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
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.bpm}</td>
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
          <h2 className="g-h2">
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
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '4px' }}>{item.n} {item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 러닝 케이던스 ↔ BPM ── */}
        <div>
          <h2 className="g-h2">
            러닝 케이던스(spm) ↔ BPM 매칭
          </h2>
          <p className="g-p">
            러닝 케이던스는 분당 걸음 수(spm)로, BPM과 구조가 같은 단위입니다. 러닝머신에서 발이 닿는 순간마다(양발 모두) 탭하면
            측정값이 그대로 내 케이던스가 됩니다. 한쪽 발만 세어 탭했다면 2배 하세요.
            흔히 말하는 &lsquo;이상적 케이던스 180&rsquo;은 잭 대니얼스 코치가 1984년 올림픽 장거리 선수들을 관찰한 데서 나온
            벤치마크일 뿐 절대 규칙이 아니며, 일반 러너는 편한 페이스에서 155~175spm대가 흔합니다.
          </p>
          <p className="g-p">
            선곡은 두 가지 방법이 있습니다. 케이던스와 같은 BPM 곡에 한 박 = 한 걸음을 맞추는 <strong style={{ color: 'var(--text)' }}>정박 매칭</strong>이 기본이지만,
            170~180 BPM 곡은 주류 음악에 드뭅니다. 대신 <strong style={{ color: 'var(--text)' }}>절반 BPM(85~90) 곡에 한 박당 두 걸음</strong>을
            맞추는 더블타임 활용법을 쓰면 발라드·힙합까지 선곡 폭이 크게 넓어집니다. 85 BPM × 2 = 170spm으로 효과는 동일합니다.
          </p>
          <div className="tableScroll">
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
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.spm}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.full}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{row.half}</td>
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

        {/* ── 7. 딜레이 타임 공식 (구 /tools/art/bpm) ── */}
        <div>
          <h2 className="g-h2">
            BPM 딜레이 타임 계산 공식
          </h2>
          <p className="g-p">
            계산기의 <strong>[딜레이 계산]</strong> 탭은 BPM을 음표별 딜레이 타임(ms)으로 바꿔 줍니다. 딜레이 타임(ms)은 60,000을 BPM으로 나누어 구하며
            (위 &lsquo;BPM이란?&rsquo;의 박 간격과 같은 값), 음표의 종류에 따라 추가로 나눕니다. 점음표(dotted)는 ×1.5, 셋잇단음표(triplet)는 ×⅔를 곱합니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)', borderRadius: 'var(--radius-card)', padding: '20px 22px', textAlign: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent-ink)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>4분음표 딜레이 계산식</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              딜레이(ms) = 60,000 ÷ BPM
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              예시: BPM 120 → 60,000 ÷ 120 = <strong style={{ color: 'var(--accent-ink)' }}>500ms</strong>
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            {[
              { label: '점음표 (Dotted)',        formula: '기본값 × 1.5',     example: '500ms → 750ms' },
              { label: '셋잇단음표 (Triplet)',   formula: '기본값 × ⅔',      example: '500ms → 333ms' },
              { label: '16분음표',               formula: '60,000 ÷ BPM ÷ 4', example: '120BPM → 125ms' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--accent-ink)', marginBottom: '6px', fontWeight: 600 }}>{item.label}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '4px', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{item.formula}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.example}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 8. 음표값 전체 딜레이 타임 표 ── */}
        <div>
          <h2 className="g-h2">
            음표값별 딜레이 타임 전체 표 (BPM 120 기준)
          </h2>
          <p className="g-p">
            기본값은 <strong style={{ color: 'var(--text)' }}>60,000 ÷ BPM × 배수</strong>(온음표 ×4, 2분음표 ×2, 4분음표 ×1, 8분음표 ×0.5, 16분음표 ×0.25, 32분음표 ×0.125)로 계산합니다.
            점음표는 기본값 ×1.5, 셋잇단음표는 기본값 ×⅔입니다. 아래는 BPM 120(4분음표 = 500ms) 기준 예시입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['음표', '배수', '기본 (ms)', '점음표 ×1.5 (ms)', '셋잇단 ×⅔ (ms)'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['온음표',   '×4',     '2000',  '3000',   '1333.3'],
                  ['2분음표',  '×2',     '1000',  '1500',   '666.7'],
                  ['4분음표',  '×1',     '500',   '750',    '333.3'],
                  ['8분음표',  '×0.5',   '250',   '375',    '166.7'],
                  ['16분음표', '×0.25',  '125',   '187.5',  '83.3'],
                  ['32분음표', '×0.125', '62.5',  '93.75',  '41.7'],
                ].map(([note, mult, base, dot, trip], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{note}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{mult}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{base}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{dot}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{trip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
            예: BPM 120의 8분음표 = 60,000 ÷ 120 × 0.5 = 250ms. 다른 BPM은 위 계산기의 [딜레이 계산] 탭에 입력하면 2분~16분음표 값이 자동 계산됩니다.
          </p>
        </div>

        {/* ── 9. 장르별 딜레이 설정 표 ── */}
        <div>
          <h2 className="g-h2">
            장르별 딜레이 타임 설정 참고표
          </h2>
          <p className="g-p">
            장르의 통상 BPM 범위를 기준으로 자주 쓰는 딜레이 타임을 미리 계산한 표입니다(60,000 ÷ BPM × 배수).
            4분음표는 비트와 딱 맞는 기본 딜레이, 점8분음표(×0.75)는 핑퐁 딜레이 등에서 리듬감을 줄 때 많이 쓰는 설정입니다.
            장르 구간은 자료마다 달라 위 &lsquo;장르별 대표 BPM 범위&rsquo;와 조금 다를 수 있으며, 여기서는 계산 예시용 대표 구간을 썼습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['장르', 'BPM 범위', '4분음표 딜레이', '점8분음표 딜레이', '8분음표 딜레이'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['발라드·슬로우', '60~70 BPM', '857~1000ms', '643~750ms', '429~500ms', 'var(--cat-health-ink)'],
                  ['팝·R&B',        '80~100 BPM', '600~750ms',  '450~563ms', '300~375ms', 'var(--cat-health-ink)'],
                  ['일반 팝·록',    '120 BPM',    '500ms',      '375ms',     '250ms',     'var(--accent-ink)'],
                  ['하우스',        '120~128 BPM','469~500ms',  '352~375ms', '234~250ms', 'var(--cat-life-ink)'],
                  ['드럼앤베이스',  '160~180 BPM','333~375ms',  '250~281ms', '167~188ms', 'var(--cat-date-ink)'],
                ].map(([genre, bpmRange, q, d, e, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 700 }}>{genre}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{bpmRange}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{q}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{d}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
            점8분음표 딜레이는 8분음표 × 1.5 = 4분음표 × 0.75로 계산합니다(예: 120 BPM → 250 × 1.5 = 375ms).
            내 곡의 BPM을 모르면 계산기의 [탭 템포] 탭에서 박자에 맞춰 탭해 측정하세요 —
            측정 결과의 &lsquo;이 BPM으로 딜레이 계산 →&rsquo; 버튼을 누르면 [딜레이 계산] 탭에 자동 입력됩니다. 장르별 BPM 구분과 측정 요령은 위 &lsquo;장르별 대표 BPM 범위&rsquo;·&lsquo;정확한 BPM 측정 팁&rsquo;에서 다룹니다.
          </p>
        </div>

        {/* ── 10. DAW 설정 팁 ── */}
        <div>
          <h2 className="g-h2">
            DAW에서 딜레이·리버브 설정하는 법
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '⏱️', color: 'var(--accent-ink)',     title: '딜레이 타임 (Delay Time)', content: '딜레이 플러그인의 "Time" 또는 "Delay Time" 파라미터에 계산된 ms 값을 직접 입력합니다. 4분음표는 비트와 딱 맞는 리듬감을 주고, 8분음표나 셋잇단음표는 더 촘촘하고 그루비한 느낌을 만듭니다.' },
              { icon: '🌊', color: 'var(--cat-health-ink)', title: '리버브 프리딜레이 (Pre-Delay)', content: '리버브의 Pre-Delay는 원음과 잔향 사이의 시간차입니다. 아래 통용 범위(보컬 20~80ms 등)를 출발점으로 잡고, 잔향을 박자에 맞추고 싶다면 32분음표 값(120 BPM 기준 62.5ms)부터 시도해 보세요. 16분음표(125ms)는 의도적으로 잔향을 늦게 시작시키는 특수한 연출에 가깝습니다.' },
              { icon: '🎚️', color: 'var(--cat-life-ink)',   title: '템포 싱크 vs 수동 입력', content: '대부분의 DAW(Ableton, Logic, FL Studio 등)는 딜레이 플러그인에 "Sync" 버튼이 있어 BPM에 자동 연동됩니다. 그러나 외부 하드웨어 이펙터나 빈티지 플러그인, 혹은 미묘한 timing offset이 필요한 경우에는 ms 값을 직접 입력해야 합니다.' },
            ].map((tip, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${tip.color} 19%, transparent)`, borderRadius: 'var(--radius-m)', padding: '16px 20px', display: 'flex', gap: '14px' }}>
                <span style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }} aria-hidden="true">{tip.icon}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: tip.color, marginBottom: '6px' }}>{tip.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{tip.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 11. 리버브 프리딜레이 통용 범위 ── */}
        <div>
          <h2 className="g-h2">
            리버브 타입별 프리딜레이 통용 범위
          </h2>
          <UpdatedMeta
            date="2026년 6월"
            basis="리버브 프리딜레이 통용 범위 — 해외 오디오 엔지니어링 가이드(iZotope·Loopmasters·eMastered) 교차 확인"
            sources={[{ label: 'iZotope — Reverb pre-delay 가이드', href: 'https://www.izotope.com/en/learn/reverb-pre-delay' }]}
          />
          <p className="g-p">
            프리딜레이는 공간이 클수록 길게 잡는 것이 일반적입니다. 아래는 해외 오디오 엔지니어링 가이드(iZotope·Loopmasters·eMastered, 2026-06 확인 기준)에서
            통용되는 범위로, 절대 규칙이 아닌 <strong style={{ color: 'var(--text)' }}>출발점</strong>으로 활용하고 곡의 템포·질감에 맞게 조정하는 것이 권장됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['리버브 타입', '통용 프리딜레이 범위', '비고'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['룸 (Room)',     '0~10ms 안팎',  '작은 공간 시뮬레이션. 중간 크기 룸·체임버는 10~20ms 안팎', 'var(--accent-ink)'],
                  ['플레이트 (Plate)', '소스별 15~70ms', '물리 공간이 아닌 금속판 잔향이라 소스 기준으로 설정 — 드럼 20~25ms, 기타 15~50ms, 보컬 20~70ms 통용', 'var(--success)'],
                  ['홀 (Hall)',     '20ms 이상',    '큰 공간일수록 길게. 보컬에 30~50ms대로 쓰는 사례가 흔함', 'var(--cat-life-ink)'],
                ].map(([type, range, note, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 700 }}>{type}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{range}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', lineHeight: 1.6 }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
            악기별로는 보컬 20~80ms, 기타 40~100ms, 드럼 5~50ms 범위가 통용되는 것으로 알려져 있습니다(<a href="https://www.izotope.com/en/learn/reverb-pre-delay" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>iZotope 프리딜레이 가이드</a>, 2026-06 확인).
            프리딜레이를 박자에 꼭 맞출 필요는 없지만, 맞추고 싶다면 16분음표(60,000 ÷ BPM ÷ 4)나 32분음표(÷ 8) 값을 적용해 보세요 —
            [딜레이 계산] 탭의 16분음표 값을 절반으로 나누면 32분음표입니다.
          </p>
        </div>

        {/* ── 12. BPM 동기화 활용 ── */}
        <div>
          <h2 className="g-h2">
            딜레이 외 BPM 동기화 활용법
          </h2>
          <p className="g-p">
            60,000 ÷ BPM 공식으로 구한 ms 값은 딜레이뿐 아니라 시간 파라미터가 있는 거의 모든 이펙터에 응용할 수 있습니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '〰️', color: 'var(--accent-ink)',   title: 'LFO 속도 (코러스·트레몰로·오토팬)', content: 'LFO 속도를 Hz로 입력하는 플러그인은 Hz = 1,000 ÷ ms로 변환합니다. BPM 120의 4분음표(500ms)는 2Hz, 8분음표(250ms)는 4Hz입니다. 트레몰로나 오토팬을 박자에 맞추면 리듬과 일체감 있는 모듈레이션이 됩니다.' },
              { icon: '🎚️', color: 'var(--success)',      title: '컴프레서 릴리즈 (Release)', content: '릴리즈 타임을 8분음표나 16분음표 길이 부근으로 잡으면 컴프레서의 펌핑이 그루브와 동기화되는 접근이 흔히 사용됩니다. BPM 120 기준 8분음표는 250ms, 16분음표는 125ms입니다. 귀로 들으며 미세 조정하는 것이 전제입니다.' },
              { icon: '🚪', color: 'var(--cat-life-ink)', title: '게이트 홀드·릴리즈 (Gate)', content: '게이티드 리버브나 트랜스 게이트 효과에서 홀드(Hold) 타임을 16분음표·32분음표 값으로 설정하면 박자에 딱 맞는 절단감을 만들 수 있습니다. BPM 120 기준 16분음표 125ms, 32분음표 62.5ms입니다.' },
            ].map((tip, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${tip.color} 19%, transparent)`, borderRadius: 'var(--radius-m)', padding: '16px 20px', display: 'flex', gap: '14px' }}>
                <span style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }} aria-hidden="true">{tip.icon}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: tip.color, marginBottom: '6px' }}>{tip.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{tip.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 13. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 14. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/art/chord',       icon: '🎼', name: '코드 구성음',         desc: '코드별 구성 음정 표시' },
              { href: '/tools/art/capo',        icon: '🎸', name: '기타 카포 계산기',    desc: '카포 위치별 코드 변환·편곡' },
              { href: '/tools/art/frequency',   icon: '🎵', name: '주파수↔음정 변환기',  desc: 'Hz ↔ 음정·MIDI·파장' },
              { href: '/tools/art/vocal-range', icon: '🎤', name: '음역대 측정기',       desc: '마이크로 최저·최고음 측정' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
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
    </ToolPage>
  )
}
