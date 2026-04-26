import Link from 'next/link'
import BpmClient from './BpmClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/music/bpm',
  title: 'BPM 딜레이 타임 계산기 — DAW 없이 딜레이/리버브 설정',
  description: 'BPM(템포)을 입력하면 4분음표·8분음표·16분음표 딜레이 타임(ms)을 즉시 계산합니다. 점음표·셋잇단음표 변형, 클립보드 복사, DAW 딜레이·리버브 설정에 바로 활용.',
  keywords: ['BPM딜레이계산기', '딜레이타임계산', '음악제작계산기', 'BPM딜레이', '딜레이ms계산', 'DAW딜레이설정', '음악템포계산기'],
})

export default async function BpmPage({
  searchParams,
}: {
  searchParams?: Promise<{ bpm?: string }>
}) {
  const sp = (await searchParams) ?? {}
  const raw = typeof sp.bpm === 'string' ? sp.bpm : ''
  const parsed = parseFloat(raw)
  const initialBpm = parsed > 0 && parsed <= 300 ? String(Math.round(parsed)) : '120'
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>음악</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎵 BPM 딜레이 타임 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        BPM을 입력하면 딜레이·리버브 프리딜레이 설정에 필요한 ms 값을 즉시 계산합니다.
      </p>

      <BpmClient initialBpm={initialBpm} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            BPM 딜레이 타임 계산 공식
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            BPM(Beats Per Minute)은 1분당 박자 수를 나타냅니다. 딜레이 타임(ms)은 60,000을 BPM으로 나누어 구하며,
            음표의 종류에 따라 추가로 나눕니다. 점음표(dotted)는 ×1.5, 셋잇단음표(triplet)는 ×⅔를 곱합니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '20px 22px', textAlign: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>4분음표 딜레이 계산식</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
              딜레이(ms) = 60,000 ÷ BPM
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              예시: BPM 120 → 60,000 ÷ 120 = <strong style={{ color: 'var(--accent)' }}>500ms</strong>
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { label: '점음표 (Dotted)',        formula: '기본값 × 1.5',     example: '500ms → 750ms' },
              { label: '셋잇단음표 (Triplet)',   formula: '기본값 × ⅔',      example: '500ms → 333ms' },
              { label: '16분음표',               formula: '60,000 ÷ BPM ÷ 4', example: '120BPM → 125ms' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '6px', fontWeight: 600 }}>{item.label}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '4px', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{item.formula}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.example}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 주요 BPM별 딜레이 타임 표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            장르별 BPM 및 4분음표 딜레이 타임 참고표
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['장르', 'BPM 범위', '4분음표', '8분음표', '16분음표'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['발라드·슬로우', '60~70 BPM', '857~1000ms', '429~500ms', '214~250ms', '#3EC8FF'],
                  ['팝·R&B',        '80~100 BPM', '600~750ms',  '300~375ms', '150~188ms', '#3EFF9B'],
                  ['댄스·팝',       '120 BPM',    '500ms',      '250ms',     '125ms',     '#C8FF3E'],
                  ['UK 하우스',     '128~130 BPM','461~469ms',  '231~234ms', '115~117ms', '#FF8C3E'],
                  ['드럼앤베이스',  '160~180 BPM','333~375ms',  '167~188ms', '83~94ms',   '#FF3E8C'],
                ].map(([genre, bpmRange, q, e, s, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 700 }}>{genre}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{bpmRange}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{q}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{e}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. DAW 설정 팁 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🎛️ DAW에서 딜레이·리버브 설정하는 법
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '⏱️', color: '#C8FF3E', title: '딜레이 타임 (Delay Time)', content: '딜레이 플러그인의 "Time" 또는 "Delay Time" 파라미터에 계산된 ms 값을 직접 입력합니다. 4분음표는 비트와 딱 맞는 리듬감을 주고, 8분음표나 셋잇단음표는 더 촘촘하고 그루비한 느낌을 만듭니다.' },
              { icon: '🌊', color: '#3EC8FF', title: '리버브 프리딜레이 (Pre-Delay)', content: '리버브의 Pre-Delay는 원음과 잔향 사이의 시간차입니다. 보통 16분음표나 32분음표 값을 사용합니다. BPM 120 기준으로 16분음표(125ms)를 프리딜레이에 적용하면 자연스럽고 리드미컬한 공간감을 얻을 수 있습니다.' },
              { icon: '🎚️', color: '#FF8C3E', title: '템포 싱크 vs 수동 입력', content: '대부분의 DAW(Ableton, Logic, FL Studio 등)는 딜레이 플러그인에 "Sync" 버튼이 있어 BPM에 자동 연동됩니다. 그러나 외부 하드웨어 이펙터나 빈티지 플러그인, 혹은 미묘한 timing offset이 필요한 경우에는 ms 값을 직접 입력해야 합니다.' },
            ].map((tip, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${tip.color}30`, borderRadius: '12px', padding: '16px 20px', display: 'flex', gap: '14px' }}>
                <span style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }}>{tip.icon}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: tip.color, marginBottom: '6px' }}>{tip.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{tip.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '점음표(dotted)는 왜 ×1.5인가요?',
                a: '점음표는 원래 음표 길이에 절반을 더한 값입니다. 예를 들어 점 4분음표는 4분음표 + 8분음표 = 1.5배 길이입니다. 딜레이에서 점음표 설정은 Slapback echo나 핑퐁 딜레이에서 리듬감을 극대화할 때 많이 사용합니다.' },
              { q: '셋잇단음표(triplet)는 ×⅔인 이유는?',
                a: '셋잇단음표는 2박자 공간에 3개의 음을 넣는 방식으로, 1개 음의 길이가 원래 값의 2/3입니다. BPM 120의 4분음표는 500ms이지만 셋잇단 4분음표는 약 333ms입니다. 트리플렛 딜레이는 펑키하고 스윙감 있는 그루브를 만들 때 효과적입니다.' },
              { q: 'BPM이 소수(예: 128.5)여도 계산되나요?',
                a: '네, 이 계산기는 소수점 BPM도 지원합니다. 예를 들어 128.5 BPM의 4분음표 딜레이는 60,000 ÷ 128.5 ≈ 467ms입니다. 하드웨어 드럼머신이나 빈티지 신디사이저의 경우 정수가 아닌 BPM이 있을 수 있습니다.' },
              { q: '딜레이 피드백(Feedback)은 어떻게 설정하나요?',
                a: '피드백은 딜레이 반복 횟수를 제어합니다. 보통 20~40% 설정이 자연스럽고, 50% 이상은 점점 쌓이는 느낌, 100% 근처는 무한 반복(셀프 오실레이션)이 됩니다. 이 계산기는 딜레이 타임(ms) 계산에 특화되어 있으며, 피드백은 DAW에서 직접 설정하세요.' },
              { q: '리버브 프리딜레이와 딜레이 타임의 차이는?',
                a: '딜레이 타임은 에코 효과처럼 원음 이후 반복 신호가 들어오는 간격입니다. 리버브 프리딜레이는 리버브 잔향이 시작되기 전의 짧은 공백으로, 원음을 공간감 속에서 분리시켜 선명하게 들리게 합니다. 프리딜레이는 보통 16분음표 이하의 짧은 값(10~125ms)을 사용합니다.' },
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
              { href: '/tools/date/dday',       icon: '📅', name: 'D-day 계산기',       desc: '앨범·프로젝트 마감일 카운트다운' },
              { href: '/tools/dev/color',       icon: '🎨', name: '색상 코드 변환기',   desc: 'DAW 커버아트·앨범 디자인 색상' },
              { href: '/tools/dev/charcount',   icon: '🔡', name: '글자수 세기',         desc: '음악 플랫폼 설명·歌詞 글자수 확인' },
              { href: '/tools/unit/length',     icon: '📏', name: '길이 변환기',         desc: '스튜디오 장비 케이블 길이 변환' },
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
