import Link from 'next/link'
import BpmClient from './BpmClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/art/bpm',
  title: 'BPM 딜레이 계산기 — DAW 없이 딜레이/리버브 설정',
  description: 'BPM만 입력하면 음표별 딜레이 타임(ms) 자동 계산 + 리버브 프리딜레이 참고값. 음악 프로듀서·홈레코딩·DJ 도구.',
  keywords: ['BPM딜레이계산기', '딜레이타임계산', '음악제작계산기', 'BPM딜레이', '딜레이ms계산', 'DAW딜레이설정', '음악템포계산기'],
})

const FAQ_LD = [
              { q: '점음표(dotted)는 왜 ×1.5인가요?',
                a: '점음표는 원래 음표 길이에 <strong>절반을 더한 값</strong>입니다. 예를 들어 점 4분음표는 4분음표 + 8분음표 = 1.5배 길이입니다. 점 8분음표 딜레이는 핑퐁 딜레이 등에서 리듬감을 줄 때 널리 쓰입니다. 참고로 슬랩백 에코는 이와 달리 75~120ms 안팎의 짧은 단일 반복 효과로, 음표 동기와는 다른 개념입니다.' },
              { q: '셋잇단음표(triplet)는 ×⅔인 이유는?',
                a: '셋잇단음표는 <strong>2박자 공간에 3개의 음을 넣는 방식</strong>으로, 1개 음의 길이가 원래 값의 2/3입니다. BPM 120의 4분음표는 500ms이지만 셋잇단 4분음표는 약 333ms입니다. 트리플렛 딜레이는 펑키하고 스윙감 있는 그루브를 만들 때 효과적입니다.' },
              { q: 'BPM이 소수(예: 128.5)여도 계산되나요?',
                a: '네, 이 계산기는 소수점 BPM도 지원합니다. 예를 들어 128.5 BPM의 4분음표 딜레이는 <code>60,000 ÷ 128.5 ≈ 467ms</code>입니다. 하드웨어 드럼머신이나 빈티지 신디사이저의 경우 정수가 아닌 BPM이 있을 수 있습니다.' },
              { q: '딜레이 피드백(Feedback)은 어떻게 설정하나요?',
                a: '피드백은 딜레이 반복 횟수를 제어합니다. 보통 <strong>20~40% 설정이 자연스럽고</strong>, 50% 이상은 점점 쌓이는 느낌, 100% 근처는 무한 반복(셀프 오실레이션)이 됩니다. 단, 슬랩백 에코는 피드백 0~15%로 1회 반복이 정석입니다. 이 계산기는 딜레이 타임(ms) 계산에 특화되어 있으며, 피드백은 DAW에서 직접 설정하세요.' },
              { q: '리버브 프리딜레이와 딜레이 타임의 차이는?',
                a: '<strong>딜레이 타임</strong>은 에코 효과처럼 원음 이후 반복 신호가 들어오는 간격입니다. <strong>리버브 프리딜레이</strong>는 리버브 잔향이 시작되기 전의 짧은 공백으로, 원음을 공간감 속에서 분리시켜 선명하게 들리게 합니다. 프리딜레이는 보통 짧은 값(약 10~125ms — 120 BPM 기준 16분음표 이하)을 사용하며, 템포가 느리면 같은 음표값이라도 ms가 길어집니다.' },
              { q: '딜레이 ms 값을 LFO 속도(Hz)로 변환하려면?',
                a: '주파수는 시간의 역수이므로 <code>Hz = 1,000 ÷ ms</code>로 변환합니다. 예를 들어 BPM 120의 4분음표 딜레이 500ms는 1,000 ÷ 500 = <strong>2Hz</strong>, 8분음표 250ms는 4Hz입니다. 트레몰로·오토팬·코러스처럼 LFO 속도를 Hz로 입력하는 플러그인을 박자에 맞출 때 사용합니다.' },
              { q: '한 마디(1 bar) 길이는 어떻게 계산하나요?',
                a: '4/4박자 기준 한 마디는 4분음표 4개이므로 <code>240,000 ÷ BPM</code>(ms)입니다. BPM 120이면 240,000 ÷ 120 = <strong>2,000ms(2초)</strong>입니다. 리버브 디케이를 한 마디나 반 마디 길이에 맞추거나, 루프·샘플 길이를 가늠할 때 활용할 수 있습니다.' },
              { q: '리버브 프리딜레이도 꼭 BPM에 맞춰야 하나요?',
                a: '필수는 아닙니다. 룸 0~10ms 안팎, 홀 20ms 이상처럼 <strong>공간 크기에 따른 통용 범위</strong>를 출발점으로 잡고 귀로 조정하는 방식이 일반적입니다. 다만 프리딜레이를 16분·32분음표 값(60,000 ÷ BPM ÷ 4 또는 ÷ 8)에 맞추면 잔향이 박자와 어울려 더 음악적으로 들리는 방법도 널리 알려져 있습니다.' },
            ]

export default async function BpmPage({
  searchParams,
}: {
  searchParams?: Promise<{ bpm?: string }>
}) {
  const sp = (await searchParams) ?? {}
  const raw = typeof sp.bpm === 'string' ? sp.bpm : ''
  const parsed = parseFloat(raw)
  /* 소수 1자리 보존 — FAQ가 소수 BPM 지원을 명시하고 탭 템포 연동값도 소수일 수 있음 (정수 반올림 금지) */
  const initialBpm = parsed > 0 && parsed <= 300 ? String(Math.round(parsed * 10) / 10) : '120'
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>음악</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="art" />BPM 딜레이 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        BPM만 입력하면 음표별 <strong style={{ color: 'var(--text)' }}>딜레이 타임(ms)</strong> 자동 계산. 리버브 프리딜레이의 박자 동기 참고값으로도 활용할 수 있습니다.
      </p>

      <BpmClient initialBpm={initialBpm} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            BPM 딜레이 타임 계산 공식
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            BPM(Beats Per Minute)은 1분당 박자 수를 나타냅니다. 딜레이 타임(ms)은 60,000을 BPM으로 나누어 구하며,
            음표의 종류에 따라 추가로 나눕니다. 점음표(dotted)는 ×1.5, 셋잇단음표(triplet)는 ×⅔를 곱합니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '20px 22px', textAlign: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>4분음표 딜레이 계산식</p>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
              딜레이(ms) = 60,000 ÷ BPM
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              예시: BPM 120 → 60,000 ÷ 120 = <strong style={{ color: 'var(--accent)' }}>500ms</strong>
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            {[
              { label: '점음표 (Dotted)',        formula: '기본값 × 1.5',     example: '500ms → 750ms' },
              { label: '셋잇단음표 (Triplet)',   formula: '기본값 × ⅔',      example: '500ms → 333ms' },
              { label: '16분음표',               formula: '60,000 ÷ BPM ÷ 4', example: '120BPM → 125ms' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '6px', fontWeight: 600 }}>{item.label}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '4px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{item.formula}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.example}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 1-1. 음표값 전체 딜레이 타임 표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            음표값별 딜레이 타임 전체 표 (BPM 120 기준)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            기본값은 <strong style={{ color: 'var(--text)' }}>60,000 ÷ BPM × 배수</strong>(온음표 ×4, 2분음표 ×2, 4분음표 ×1, 8분음표 ×0.5, 16분음표 ×0.25, 32분음표 ×0.125)로 계산합니다.
            점음표는 기본값 ×1.5, 셋잇단음표는 기본값 ×⅔입니다. 아래는 BPM 120(4분음표 = 500ms) 기준 예시입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
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
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{base}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{dot}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{trip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
            예: BPM 120의 8분음표 = 60,000 ÷ 120 × 0.5 = 250ms. 다른 BPM은 위 계산기에 입력하면 자동 계산됩니다.
          </p>
        </div>

        {/* ── 2. 장르별 딜레이 설정 표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            장르별 딜레이 타임 설정 참고표
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            장르의 통상 BPM 범위를 기준으로 자주 쓰는 딜레이 타임을 미리 계산한 표입니다(60,000 ÷ BPM × 배수).
            4분음표는 비트와 딱 맞는 기본 딜레이, 점8분음표(×0.75)는 핑퐁 딜레이 등에서 리듬감을 줄 때 많이 쓰는 설정입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['장르', 'BPM 범위', '4분음표 딜레이', '점8분음표 딜레이', '8분음표 딜레이'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['발라드·슬로우', '60~70 BPM', '857~1000ms', '643~750ms', '429~500ms', '#0891B2'],
                  ['팝·R&B',        '80~100 BPM', '600~750ms',  '450~563ms', '300~375ms', '#059669'],
                  ['댄스·팝',       '120 BPM',    '500ms',      '375ms',     '250ms',     '#0EA5E9'],
                  ['하우스',        '120~128 BPM','469~500ms',  '352~375ms', '234~250ms', '#EA580C'],
                  ['드럼앤베이스',  '160~180 BPM','333~375ms',  '250~281ms', '167~188ms', '#DB2777'],
                ].map(([genre, bpmRange, q, d, e, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 700 }}>{genre}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{bpmRange}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{q}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{d}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
            점8분음표 딜레이는 8분음표 × 1.5 = 4분음표 × 0.75로 계산합니다(예: 120 BPM → 250 × 1.5 = 375ms).
            내 곡의 BPM을 모르면 <Link href="/tools/art/tap-tempo" style={{ color: 'var(--accent)', fontWeight: 600 }}>탭 템포 계산기</Link>에서 박자에 맞춰 탭해 측정하세요 —
            측정 결과의 &lsquo;이 BPM으로 딜레이 계산&rsquo; 버튼을 누르면 이 계산기에 자동 입력됩니다. 장르별 BPM 구분과 측정 요령도 그 페이지에서 다룹니다.
          </p>
        </div>

        {/* ── 3. DAW 설정 팁 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🎛️ DAW에서 딜레이·리버브 설정하는 법
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '⏱️', color: '#0EA5E9', title: '딜레이 타임 (Delay Time)', content: '딜레이 플러그인의 "Time" 또는 "Delay Time" 파라미터에 계산된 ms 값을 직접 입력합니다. 4분음표는 비트와 딱 맞는 리듬감을 주고, 8분음표나 셋잇단음표는 더 촘촘하고 그루비한 느낌을 만듭니다.' },
              { icon: '🌊', color: '#0891B2', title: '리버브 프리딜레이 (Pre-Delay)', content: '리버브의 Pre-Delay는 원음과 잔향 사이의 시간차입니다. 아래 표의 통용 범위(보컬 20~80ms 등)를 출발점으로 잡고, 잔향을 박자에 맞추고 싶다면 32분음표 값(120 BPM 기준 62.5ms)부터 시도해 보세요. 16분음표(125ms)는 의도적으로 잔향을 늦게 시작시키는 특수한 연출에 가깝습니다.' },
              { icon: '🎚️', color: '#EA580C', title: '템포 싱크 vs 수동 입력', content: '대부분의 DAW(Ableton, Logic, FL Studio 등)는 딜레이 플러그인에 "Sync" 버튼이 있어 BPM에 자동 연동됩니다. 그러나 외부 하드웨어 이펙터나 빈티지 플러그인, 혹은 미묘한 timing offset이 필요한 경우에는 ms 값을 직접 입력해야 합니다.' },
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

        {/* ── 3-1. 리버브 프리딜레이 통용 범위 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🌊 리버브 타입별 프리딜레이 통용 범위
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            프리딜레이는 공간이 클수록 길게 잡는 것이 일반적입니다. 아래는 해외 오디오 엔지니어링 가이드(iZotope·Loopmasters·eMastered, 2026-06 확인 기준)에서
            통용되는 범위로, 절대 규칙이 아닌 <strong style={{ color: 'var(--text)' }}>출발점</strong>으로 활용하고 곡의 템포·질감에 맞게 조정하는 것이 권장됩니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['리버브 타입', '통용 프리딜레이 범위', '비고'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['룸 (Room)',     '0~10ms 안팎',  '작은 공간 시뮬레이션. 중간 크기 룸·체임버는 10~20ms 안팎', '#0EA5E9'],
                  ['플레이트 (Plate)', '소스별 15~70ms', '물리 공간이 아닌 금속판 잔향이라 소스 기준으로 설정 — 드럼 20~25ms, 기타 15~50ms, 보컬 20~70ms 통용', '#059669'],
                  ['홀 (Hall)',     '20ms 이상',    '큰 공간일수록 길게. 보컬에 30~50ms대로 쓰는 사례가 흔함', '#EA580C'],
                ].map(([type, range, note, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 700 }}>{type}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{range}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', lineHeight: 1.6 }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
            악기별로는 보컬 20~80ms, 기타 40~100ms, 드럼 5~50ms 범위가 통용되는 것으로 알려져 있습니다(<a href="https://www.izotope.com/en/learn/reverb-pre-delay" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>iZotope 프리딜레이 가이드</a>, 2026-06 확인).
            프리딜레이를 박자에 맞추고 싶다면 위 계산기의 16분·32분음표 값을 그대로 적용해 보세요.
          </p>
        </div>

        {/* ── 3-2. BPM 동기화 활용 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🔄 딜레이 외 BPM 동기화 활용법
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            60,000 ÷ BPM 공식으로 구한 ms 값은 딜레이뿐 아니라 시간 파라미터가 있는 거의 모든 이펙터에 응용할 수 있습니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '〰️', color: '#0EA5E9', title: 'LFO 속도 (코러스·트레몰로·오토팬)', content: 'LFO 속도를 Hz로 입력하는 플러그인은 Hz = 1,000 ÷ ms로 변환합니다. BPM 120의 4분음표(500ms)는 2Hz, 8분음표(250ms)는 4Hz입니다. 트레몰로나 오토팬을 박자에 맞추면 리듬과 일체감 있는 모듈레이션이 됩니다.' },
              { icon: '🎚️', color: '#059669', title: '컴프레서 릴리즈 (Release)', content: '릴리즈 타임을 8분음표나 16분음표 길이 부근으로 잡으면 컴프레서의 펌핑이 그루브와 동기화되는 접근이 흔히 사용됩니다. BPM 120 기준 8분음표는 250ms, 16분음표는 125ms입니다. 귀로 들으며 미세 조정하는 것이 전제입니다.' },
              { icon: '🚪', color: '#EA580C', title: '게이트 홀드·릴리즈 (Gate)', content: '게이티드 리버브나 트랜스 게이트 효과에서 홀드(Hold) 타임을 16분음표·32분음표 값으로 설정하면 박자에 딱 맞는 절단감을 만들 수 있습니다. BPM 120 기준 16분음표 125ms, 32분음표 62.5ms입니다.' },
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

        {/* ── 5. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/art/tap-tempo',   icon: '🥁', name: '탭 템포',             desc: '박자에 맞춰 탭해 BPM 즉시 측정' },
              { href: '/tools/art/frequency',   icon: '🎵', name: '주파수↔음정 변환기',  desc: 'Hz ↔ 음정·MIDI 번호 변환' },
              { href: '/tools/art/vocal-range', icon: '🎤', name: '음역대 측정기',       desc: '마이크로 최저·최고음 측정' },
              { href: '/tools/art/chord',       icon: '🎼', name: '코드 구성음',         desc: '코드별 구성 음정 표시' },
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
