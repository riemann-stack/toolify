import Link from 'next/link'
import GolfDistanceClient from './GolfDistanceClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import { calcEnvCorrected, SENIOR_FACTOR, type EnvInput } from './golfDistanceUtils'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/sports/golf-distance',
  title: '골프 비거리 계산기 — 환경 보정·Gap 분석·내 기록',
  description: '드라이버·7번 아이언 기록으로 전체 클럽 비거리 자동 추정. 남녀·시니어 평균 비거리표와 바람·고도·기온 환경 보정, 갭웨지(AW) 필요 여부까지 Gap 자동 분석.',
  keywords: ['골프비거리계산기', '클럽비거리표', '7번아이언비거리', '골프클럽거리', '드라이버비거리', '웨지비거리', '골프갭분석', '갭웨지', '골프 환경 보정', '바람 비거리', '시니어 골프', '클럽 Gap 분석', '한국 아마추어 골퍼'],
})

/* ── 환경 보정 예시 — 계산기와 같은 calcEnvCorrected()로 빌드 시 계산 (7번 아이언 145m 기준) ── */
const ENV_BASE: EnvInput = {
  baseDistance: 145, unit: 'm', temperature: 20, elevation: 0,
  windDirection: 'none', windSpeed: 0, slopeAngle: 0, lieType: 'fairway',
}
const env = (patch: Partial<EnvInput>) => calcEnvCorrected({ ...ENV_BASE, ...patch })
const signed = (n: number, digits = 1) => `${n > 0 ? '+' : ''}${n.toFixed(digits)}`
const ENV_ROWS = [
  { f: '기온 30°C (기준 20°C)', r: env({ temperature: 30 }), note: '한여름' },
  { f: '기온 5°C', r: env({ temperature: 5 }), note: '초겨울·이른 봄 새벽' },
  { f: '해발 1,000m', r: env({ elevation: 1000 }), note: '고지대 코스' },
  { f: '맞바람 5m/s', r: env({ windDirection: 'head', windSpeed: 5 }), note: '1mph당 약 1%' },
  { f: '뒷바람 5m/s', r: env({ windDirection: 'tail', windSpeed: 5 }), note: '1mph당 약 0.5%' },
  { f: '오르막 5°', r: env({ slopeAngle: 5 }), note: '타깃이 약 13m 높음' },
  { f: '내리막 5°', r: env({ slopeAngle: -5 }), note: '타깃이 약 13m 낮음' },
  { f: '깊은 러프', r: env({ lieType: 'thick-rough' }), note: '라이 계수 0.85' },
  { f: '벙커', r: env({ lieType: 'bunker' }), note: '라이 계수 0.70' },
]
// 조건이 겹칠 때 — 5°C + 맞바람 5m/s + 오르막 3°
const ENV_COMBO = env({ temperature: 5, windDirection: 'head', windSpeed: 5, slopeAngle: 3 })
// 그 조건에서 145m를 보내려면 평소 몇 m를 보내는 클럽이 필요한가 (계수 5W 1.21 · 3W 1.32 — GolfDistanceClient RATIO_FROM_7I)
const COMBO_NEED = Math.round(145 / (1 + ENV_COMBO.changePercent / 100))
// 계절별 기온 범위 → 비거리 변화율 (기온 항목만)
const SEASONS = [
  { s: '봄·가을', lo: 15, hi: 20, d: '기준(20°C)에 가장 가까운 시기. 봄은 바람 변수가 큽니다.' },
  { s: '여름', lo: 25, hi: 30, d: '공기가 덜 촘촘해 조금 더 납니다. 무더위로 스윙이 무뎌지는 것은 별개.' },
  { s: '겨울', lo: -5, hi: 5, d: '공·몸이 모두 차가워 한 클럽 길게 잡는 것이 보통입니다.' },
].map((x) => ({ ...x, a: env({ temperature: x.lo }).changePercent, b: env({ temperature: x.hi }).changePercent }))

const TH: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }
const THR: React.CSSProperties = { ...TH, textAlign: 'right' }

const FAQ_LD = [
              {
                q: '드라이버와 7번 아이언 비거리만으로 전체를 추정할 수 있나요?',
                a: '네, 가능합니다. 골프 클럽은 설계상 각 번호마다 일정한 비율로 비거리가 줄어드는 구조입니다. 7번 아이언을 기준으로 각 클럽의 비율 계수를 적용해 전체 비거리를 추정합니다. 단, 개인별 스윙 특성에 따라 실제와 차이가 있을 수 있어 직접 실측한 값을 입력하면 더 정확합니다.',
              },
              {
                q: '클럽 간 적정 거리 간격은 얼마인가요?',
                a: '아이언은 번호당 10~15m, 우드와 유틸리티는 15~25m 간격이 일반적으로 권장됩니다. 간격이 너무 좁으면 클럽이 겹치고, 너무 넓으면 코스에서 대응하기 어려운 거리가 생깁니다. 특히 PW~SW 사이 30m 이상 간격이 생기면 갭웨지를 고려하세요.',
              },
              {
                q: '비거리는 어떻게 측정하는 게 정확한가요?',
                a: '연습장보다는 실제 코스나 야외 연습장에서 측정하는 게 정확합니다. 같은 클럽으로 5~10개를 치고 평균값을 사용하세요. 바람·경사·지면 상태가 없는 평지 조건이 이상적입니다. 최대 비거리가 아닌 안정적으로 낼 수 있는 평균 비거리를 기준으로 하세요.',
              },
              {
                q: '클럽 14개를 전부 사용해야 하나요?',
                a: '규정상 최대 14개까지 사용 가능하지만 반드시 14개일 필요는 없습니다. Gap 분석에서 간격이 겹치는 클럽이 있다면 줄이는 것도 방법입니다. 대신 웨지 구성을 다양하게 가져가는 것(PW · 50° · 54° · 58°)이 실전에서 더 도움이 됩니다.',
              },
              {
                q: '바람·기온·고도가 비거리에 얼마나 영향을 주나요?',
                a: `본 도구의 [환경 보정] 탭에서 자동 계산됩니다. 일반 가이드:<br/>• 바람은 거리에 비례합니다. 흔히 쓰는 TrackMan 경험칙은 정면 바람 시속 1마일(약 0.45m/s)당 약 1%, 뒷바람은 약 0.5%입니다. 정면 5m/s면 7번 아이언 145m는 약 16m, 드라이버 230m는 약 26m 줄어듭니다.<br/>• 한겨울(5°C, 봄 대비 -15°C)에는 약 4% 줄어듭니다.<br/>• 해발 800m 고지에서는 약 3.5% 늘어납니다.<br/>• 타깃이 높거나 낮으면 고저차 1m당 거리 약 1m로 봅니다. 145m 거리에서 5° 오르막이면 타깃이 약 13m 높아 그만큼 짧게 날아갑니다.<br/>한겨울 + 정면 강풍 + 오르막이 겹치면 비거리가 20% 넘게 줄어들 수 있습니다. 5°C·맞바람 5m/s·오르막 3°라면 7번 아이언 145m를 보내는 데 평소 약 ${COMBO_NEED}m짜리 클럽이 필요해, 한두 클럽이 아니라 네다섯 클럽 차이가 납니다.`,
              },
              {
                q: '시니어 골퍼는 어떤 클럽을 사용하면 좋나요?',
                a: '전문 피팅을 권장하지만 일반 가이드는 다음과 같습니다. ① 가벼운 그라파이트 샤프트 ② 헤드 스피드에 맞는 플렉스(R·SR·S) ③ 3번·4번 아이언 대신 하이브리드 ④ 5W·7W·9W 등 우드 비중 확대.<br/>한국 60대 이상 평균 비거리는 드라이버 약 180~190m, 7번 아이언 약 120~125m입니다. 본 도구는 [성별·연령]에서 [시니어 남성] 또는 [시니어 여성]을 선택하면 평균 기준이 자동 조정됩니다. 정확한 클럽 추천은 골프 피팅 센터에서 받아보세요.',
              },
              {
                q: '연습장과 실제 코스 비거리가 다른 이유는?',
                a: '일반적으로 코스 비거리는 연습장의 90~95% 수준입니다. 이유는 ① 코스에서는 다양한 스윙을 쓰느라 풀 스윙 빈도가 낮고 ② 잔디·경사·바람의 영향을 받으며 ③ 경기 중 압박감이 있고 ④ 연습장처럼 자유롭게 클럽을 고를 수 없기 때문입니다. 본인 평균 비거리를 잴 때는 최대값이 아니라 5~10개 샷의 평균을 사용하세요. 코스에서 측정한 값이 더 정확합니다.',
              },
              {
                q: '갭웨지(AW)는 꼭 필요한가요?',
                a: 'PW와 SW 사이 Gap에 따라 다릅니다.<br/>• PW(110m)~SW(85m)로 간격이 25m이면 보통 AW를 권장합니다.<br/>• PW(105m)~SW(75m)로 간격이 30m이면 AW를 강력 권장합니다.<br/>• PW와 SW 차이가 15m 이하이면 AW 없이도 충분합니다.<br/>AW 로프트별 비거리는 50°가 95~100m, 52°가 90~95m 수준입니다. 본 도구의 [클럽 분석] 탭은 직접 입력한 클럽이 3개 이상(드라이버·7번·PW 외 1개 포함)이면 간격을 판정하고 채울 클럽을 추천합니다.',
              },
              {
                q: '7번 아이언만 알면 정말 모든 클럽을 추정할 수 있나요?',
                a: '네, 큰 윤곽은 잡을 수 있습니다. 7번 아이언 145m 가정 시 드라이버 약 220m, 5번 아이언 약 165m, PW 약 110m, SW 약 90m로 추정됩니다.<br/>단, 드라이버는 스윙 메커니즘이 달라 별도로 보는 것이 좋고, 개인별로 ±20%까지 차이가 날 수 있어 직접 측정이 가장 정확합니다. 본 도구는 입력이 많을수록 정확해지며, 드라이버 + 7번 아이언 두 개만 입력해도 충분합니다.',
              },
              {
                q: 'm와 yard 차이가 어떻게 되나요?',
                a: '1 yard는 0.9144m(약 91cm), 1m는 약 1.0936 yard입니다. 한국 골프장은 m를 표준으로 쓰고, LPGA·PGA 통계는 yard를 사용합니다. 본 도구 상단의 [거리 단위] 토글로 즉시 변환할 수 있습니다. 예를 들어 7번 아이언 145m는 약 158 yard, 드라이버 220m는 약 240 yard입니다.',
              },
            ]

export default function GolfDistancePage() {
  return (
    <ToolPage width={760} slug="/tools/sports/golf-distance">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />골프 비거리 계산기
      </h1>
      <p className="tp-lead">
        드라이버·7번 기록으로 <strong style={{ color: 'var(--text)' }}>전체 클럽 비거리 추정</strong> + 바람·고도·기온 보정.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="클럽 수 한도 — R&A·USGA 골프 규칙 4.1b(최대 14개) · 거리 단위 — 국제 야드(1yd = 0.9144m) · 평균 비거리·환경 보정 계수는 공식 통계가 아닌 경험칙 추정"
        sources={[
          { label: 'R&A 공식 사이트', href: 'https://www.randa.org' },
          { label: '대한골프협회 — 골프 규칙', href: 'https://www.kgagolf.or.kr' },
          { label: 'NIST 도량형국(OWM) — 야드·미터 환산', href: 'https://www.nist.gov/pml/owm' },
        ]}
      />

      <GolfDistanceClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 0. 추정 방식 ── */}
        <div>
          <h2 className="g-h2">클럽별 비거리는 이렇게 추정합니다</h2>
          <p className="g-p">
            계산기는 7번 아이언을 1로 두고 클럽마다 정해 둔 <strong>비율 계수</strong>를 곱합니다. 드라이버 1.50, 3번 우드 1.32, 5번 아이언 1.14, 피칭 웨지 0.76, 샌드 웨지 0.61 식이며,
            드라이버만 입력하면 드라이버 ÷ 1.50으로 7번 아이언 거리를 먼저 되짚은 뒤 같은 계수를 씁니다. 두 클럽을 모두 입력하면 두 추정값을 평균하고, 결과는 5m 단위로 반올림합니다.
          </p>
          <ul className="g-list">
            <li><strong>7번 아이언 145m만 입력</strong> → 드라이버 220m · 5번 아이언 165m · PW 110m · SW 90m</li>
            <li><strong>드라이버 230m + 7번 아이언 145m 입력</strong> → 3번 우드 195m · 5번 아이언 170m · PW 115m · SW 90m (드라이버가 7번 대비 긴 편이라 7번만 넣었을 때보다 3번 우드·5번 아이언·PW가 5m씩 길어지고 SW는 그대로)</li>
            <li><strong>직접 입력한 클럽</strong>은 추정하지 않고 그 값을 그대로 씁니다. 실측 클럽이 많을수록 추정에 기대는 부분이 줄어듭니다.</li>
            <li><strong>플레이 스타일</strong>을 파워로 두면 추정값에 +3%, 컨트롤로 두면 −3%를 적용합니다. 시니어를 고르면 비교 기준인 평균표만 {Math.round((1 - SENIOR_FACTOR) * 100)}% 낮아지고, 내 추정값은 바뀌지 않습니다.</li>
          </ul>
          <Callout tone="tip" title="계수가 맞지 않는 사람">
            헤드 스피드가 빠른 사람은 롱아이언·우드 간격이 넓게, 느린 사람은 좁게 나오는 경향이 있습니다. 추정값과 실제가 계속 어긋나는 클럽은 직접 입력해 두고, [클럽 분석] 탭으로 간격을 확인하세요.
          </Callout>
        </div>

        {/* ── 1. 아마추어 평균 비거리 참조표 ── */}
        <div>
          <h2 className="g-h2">
            아마추어 평균 클럽별 비거리
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            한국 아마추어 골퍼의 평균 비거리(m). 개인 스윙 스피드와 클럽 스펙에 따라 ±20~30% 편차가 있습니다.<br/>
            <span style={{ fontSize: '12px' }}>※ 공식 통계가 아니라, 일반적으로 알려진 아마추어 비거리 범위를 Youtil이 정리한 참고 추정치입니다 (기준 2026.06).</span>
          </p>

          {/* 남성 */}
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cyan-600)', marginBottom: '8px' }}>남성 아마추어 평균</p>
          <div className="tableScroll" style={{ marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>클럽</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>평균</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>범위</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['드라이버',     '210m', '170~260m'],
                  ['3번 우드',     '185m', '155~230m'],
                  ['5번 우드',     '170m', '140~210m'],
                  ['5번 아이언',   '160m', '130~195m'],
                  ['6번 아이언',   '150m', '120~185m'],
                  ['7번 아이언',   '140m', '110~175m'],
                  ['8번 아이언',   '130m', '100~160m'],
                  ['9번 아이언',   '120m', '90~150m'],
                  ['PW',           '110m', '80~140m'],
                  ['SW',           '85m',  '60~110m'],
                ].map(([club, avg, range], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text)' }}>{club}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--accent-ink)' }}>{avg}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-sans)', color: 'var(--muted)' }}>{range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 여성 */}
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--orange-600)', marginBottom: '8px' }}>여성 아마추어 평균</p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>클럽</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>평균</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>범위</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['드라이버',     '160m', '130~200m'],
                  ['3번 우드',     '140m', '115~175m'],
                  ['5번 우드',     '130m', '105~165m'],
                  ['5번 아이언',   '120m', '95~150m'],
                  ['6번 아이언',   '112m', '88~140m'],
                  ['7번 아이언',   '105m', '80~135m'],
                  ['8번 아이언',   '96m',  '75~125m'],
                  ['9번 아이언',   '88m',  '68~115m'],
                  ['PW',           '80m',  '60~105m'],
                  ['SW',           '62m',  '45~85m'],
                ].map(([club, avg, range], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text)' }}>{club}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--accent-ink)' }}>{avg}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-sans)', color: 'var(--muted)' }}>{range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. Gap 가이드 ── */}
        <div>
          <h2 className="g-h2">
            클럽 간 이상적인 거리 간격(Gap) 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '14px' }}>
            {[
              { label: '아이언 사이', range: '10~15m', color: 'var(--emerald-600)', desc: '번호당 한 클럽 차이가 이상적' },
              { label: '우드/유틸 사이', range: '15~25m', color: 'var(--cyan-600)', desc: '로프트 차이가 커서 간격도 큼' },
              { label: '아이언 ↔ 웨지', range: '10~15m', color: 'var(--accent-ink)', desc: '어프로치 거리 정확도 직결' },
              { label: '웨지 사이',     range: '10~18m', color: 'var(--orange-600)', desc: '4도 차이 = 약 10~12m 변화' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${g.color} 20%, transparent)`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>{g.label}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 800, color: g.color, marginBottom: '6px' }}>{g.range}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{g.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              <strong style={{ color: 'var(--text)' }}>너무 좁으면</strong>: 클럽 개수 낭비, 코스 공략 옵션이 겹침<br/>
              <strong style={{ color: 'var(--text)' }}>너무 넓으면</strong>: 특정 거리 대응 어려움<br/>
              <strong style={{ color: 'var(--red-600)' }}>가장 자주 발생하는 Gap</strong>: PW(110m) ~ SW(85m) 사이 — 갭웨지(AW)로 채우는 구간
            </p>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            계산기의 [클럽 분석] 탭은 직접 입력한 클럽만 긴 순서로 세운 뒤 이웃한 두 클럽의 차이를 봅니다. 아이언끼리는 8~16m, 우드·유틸끼리는 12~28m, 웨지끼리는 8~18m를 벗어나면 「좁음」 또는 「넓음」으로 표시하고,
            넓은 구간에는 두 거리의 중간값을 채울 클럽을 제안합니다. 추정값끼리의 간격은 비율표에서 나온 값이라 판정하지 않습니다. 골프 규칙상 한 라운드에 가지고 나갈 수 있는 클럽은 <strong>최대 14개</strong>(규칙 4.1b)이므로,
            간격이 좁은 클럽을 빼고 넓은 구간을 메우는 식으로 구성을 조정하면 됩니다.
          </p>
        </div>

        {/* ── 3. AW 필요성 ── */}
        <div>
          <h2 className="g-h2">
            갭웨지(AW)가 필요한 이유
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: '10px', marginBottom: '14px' }}>
            {[
              { name: 'PW', distance: '110~115m', loft: '44~48°', color: 'var(--cyan-600)' },
              { name: 'AW', distance: '95~100m',  loft: '50~52°', color: 'var(--accent-ink)' },
              { name: 'SW', distance: '80~90m',   loft: '54~56°', color: 'var(--orange-600)' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${c.color} 25%, transparent)`, borderRadius: 'var(--radius-m)', padding: '16px 14px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '24px', fontWeight: 800, color: c.color, marginBottom: '6px' }}>{c.name}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{c.distance}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{c.loft}</p>
              </div>
            ))}
          </div>
          <p className="g-p">
            PW와 SW 사이 <strong>약 25~30m 간격</strong>은 어프로치에서 가장 애매한 거리입니다.
            스윙 강도로 거리를 조절하면 정확도가 떨어지므로 로프트 50~52° 안팎의 AW(갭웨지)를 추가해 풀스윙으로 95~100m를 안정적으로 보낼 수 있게 구성하는 것이 유리합니다.
            웨지 로프트를 4~6° 간격으로 맞추면(예: PW 46° · 50° · 54° · 58°) 거리 간격도 고르게 벌어집니다. 최근 아이언 세트는 PW 로프트가 43~44°로 세워진 경우가 많아 간격이 더 벌어지기 쉬우니, 본인 PW 로프트부터 확인하세요.
          </p>
        </div>

        {/* ── 4. 7I 기준 클럽 ── */}
        <div>
          <h2 className="g-h2">
            7번 아이언이 골프 기준 클럽인 이유
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { t: '클럽 세트 중간에 위치', c: 'var(--accent-ink)', d: '드라이버~샌드 웨지 사이의 중간. 길이·로프트·라이각·헤드 무게가 균형 잡힌 클럽이라 롱아이언처럼 길지도, 웨지처럼 짧지도 않아 평균 스윙 특성을 잘 드러냅니다.' },
              { t: '레슨·피팅의 기준', c: 'var(--cyan-600)', d: '많은 골프 레슨이 7번 아이언으로 스윙을 가르치고, 클럽 피팅에서도 7번의 헤드 스피드·런치 각도·스핀량을 기준으로 다른 클럽 스펙을 맞춥니다.' },
              { t: '비거리 추정의 기준', c: 'var(--emerald-600)', d: '7번 아이언 비거리만 알면 클럽별 평균 비율(드라이버 약 1.5배, PW 약 0.76배 등)로 전체 비거리를 추정할 수 있습니다. 개인차가 있으나 큰 윤곽을 잡기에 충분합니다.' },
            ].map((x) => (
              <div key={x.t} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${x.c} 20%, transparent)`, borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: x.c, marginBottom: '8px' }}>{x.t}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{x.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 환경 보정 가이드 ── */}
        <div>
          <h2 className="g-h2">
            환경 보정 가이드 — 기온·바람·고도·경사
          </h2>
          <p className="g-p">
            [환경 보정] 탭은 기준 거리에 요인별 변화량을 따로 계산해 더합니다. 기온은 20°C 기준 1°C당 0.27%, 고도는 해발 1,000m당 4.5%, 바람은 풍속을 mph로 바꿔 맞바람 1mph당 1%·뒷바람 0.5%(옆바람은 거리 0),
            경사는 타깃과의 고저차(거리 × tan 각도)만큼 짧게 또는 길게, 라이는 러프 0.95·깊은 러프 0.85·디봇 0.92·벙커 0.70 계수를 곱합니다. 아래 표는 7번 아이언 145m에 조건을 하나씩 넣은 결과입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={TH}>조건</th>
                  <th scope="col" style={THR}>변화율</th>
                  <th scope="col" style={THR}>변화량</th>
                  <th scope="col" style={THR}>보정 거리</th>
                  <th scope="col" style={TH}>메모</th>
                </tr>
              </thead>
              <tbody>
                {ENV_ROWS.map((r, i) => (
                  <tr key={r.f} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text)', fontWeight: 600 }}>{r.f}</th>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-sans)', fontWeight: 700, color: r.r.changePercent < 0 ? 'var(--red-600)' : 'var(--emerald-600)' }}>{signed(r.r.changePercent)}%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>{signed(r.r.totalImpact)}m</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--accent-ink)' }}>{r.r.correctedDistance}m</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            조건은 서로 더해집니다. 5°C에 맞바람 5m/s, 3° 오르막이 겹치면 145m 샷이 약 <strong>{ENV_COMBO.correctedDistance}m</strong>({signed(ENV_COMBO.changePercent)}%)로 줄어, 145m를 보내려면 평소 약 <strong>{COMBO_NEED}m</strong>를 보내는 클럽이 필요합니다.
            계산기 계수로는 5번 우드(약 {Math.round(145 * 1.21)}m)와 3번 우드(약 {Math.round(145 * 1.32)}m) 사이라, 7번 아이언 대신 네다섯 클럽 긴 클럽을 잡아야 하는 셈입니다.
            변화율이 ±10%를 넘으면 한 클럽 위·아래를 고려하세요.
          </p>
          <Callout tone="warn" title="공식 수치가 아닙니다">
            계수는 론치 모니터 업체·코치들이 흔히 쓰는 경험칙을 바탕으로 Youtil이 정리한 추정 기준입니다. 공의 탄도·스핀, 바람의 높이별 세기에 따라 실제는 ±10% 이상 차이 날 수 있으니, 같은 조건에서 직접 친 기록으로 보정하세요.
          </Callout>
        </div>

        {/* ── 6. 한국 시즌별 비거리 변화 ── */}
        <div>
          <h2 className="g-h2">
            한국 시즌별 비거리 변화
          </h2>
          <p className="g-p">
            한국은 여름과 겨울 기온 차가 30°C를 넘어, 같은 스윙이라도 계절에 따라 비거리가 눈에 띄게 달라집니다. 아래 변화율은 계산기의 기온 계수(20°C 기준)만 적용한 값입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {SEASONS.map((r) => (
              <div key={r.s} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-ink)', marginBottom: '6px' }}>{r.s} ({r.lo}~{r.hi}°C)</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>{signed(r.a)}% ~ {signed(r.b)}%</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{r.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 시니어 골퍼 가이드 ── */}
        <div>
          <h2 className="g-h2">
            시니어 골퍼 가이드 (60대+)
          </h2>
          <p className="g-p">
            나이가 들면 헤드 스피드가 줄어 비거리도 조금씩 감소하므로, 최대 거리보다 정확도·일관성을 높이는 쪽이 점수에 더 도움이 됩니다. 계산기의 [성별·연령]에서 시니어를 고르면 비교용 평균이 일반 평균의 {Math.round(SENIOR_FACTOR * 100)}%로 조정됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={TH}>연령대</th>
                  <th scope="col" style={THR}>일반 대비</th>
                  <th scope="col" style={THR}>DR 평균</th>
                  <th scope="col" style={THR}>7I 평균</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { age: '20~50대 남성',  r: '기준',  dr: '210m', i7: '140m' },
                  { age: '60대+ 남성',    r: '약 -15%', dr: '180m', i7: '120m' },
                  { age: '70대+ 남성',    r: '약 -25%', dr: '160m', i7: '105m' },
                  { age: '20~50대 여성',  r: '—',    dr: '160m', i7: '105m' },
                  { age: '60대+ 여성',    r: '약 -15%', dr: '135m', i7: '90m' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.age}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.dr}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.i7}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            위 평균표와 같은 참고 추정치입니다. 시니어에게 흔히 권하는 구성은 가벼운 그라파이트 샤프트, 헤드 스피드에 맞는 플렉스(R·SR 등), 롱아이언 대신 하이브리드, 5W·7W 같은 우드 비중 확대입니다. 정확한 추천은 피팅 센터에서 받으세요.
          </p>
        </div>

        {/* ── 8. 비거리 기록 활용법 ── */}
        <div>
          <h2 className="g-h2">
            내 비거리 기록 활용법
          </h2>
          <p className="g-p">
            [내 기록] 탭에서 라운딩·연습장 비거리를 누적 기록할 수 있습니다(브라우저에만 저장, 1년이 지난 기록은 불러올 때 제외). 시즌별·장소별 변화를 추적해 발전 추이를 확인하세요.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { t: '시즌별 비교', d: '같은 7I·DR 비거리를 봄·여름·가을·겨울로 비교 → 본인의 시즌 보정값 발견' },
              { t: '연습장 vs 실전', d: '장소를 연습장·스크린·실전으로 나눠 기록하면 압박감·코스 조건이 비거리에 주는 영향을 확인할 수 있습니다.' },
              { t: '발전 추이', d: '최근 30일 평균과 그 이전 평균을 자동 비교. 레슨·스윙 변경 효과 측정' },
              { t: '환경 메모', d: '기온·바람을 함께 기록 → 같은 기온대끼리 비거리 비교' },
              { t: '프라이버시', d: '모든 기록은 본인 브라우저(localStorage)에만 저장되며 서버로 보내지 않습니다.' },
            ].map((it) => (
              <div key={it.t} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{it.t}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{it.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/golf-handicap', icon: '⛳', name: '골프 핸디캡 계산기',   desc: 'WHS 핸디캡 지수·코스 핸디캡' },
              { href: '/tools/sports/golf-cost',     icon: '⛳', name: '골프 비용 계산기', desc: '그린피·캐디피·1인당 비용 정산' },
              { href: '/tools/date/dday',          icon: '📅', name: 'D-day 계산기',           desc: '다음 라운딩까지 D-day' },
              { href: '/tools/life/pomodoro',      icon: '🍅', name: '뽀모도로 타이머',         desc: '연습장 루틴 관리' },
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
