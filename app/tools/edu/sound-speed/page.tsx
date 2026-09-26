import Link from 'next/link'
import SoundSpeedClient from './SoundSpeedClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import { LIGHT_SPEED, MEDIUM_SPEEDS, ROOM_PRESETS, calcRT60, calcSoundSpeed } from './soundData'

export const metadata = buildMetadata({
  path: '/tools/edu/sound-speed',
  title: '음속 계산기 — 천둥 번개 거리·소리 도달 시간·빛 vs 소리',
  description: '번개와 천둥 사이 시간으로 낙뢰 거리를 계산하고 소리 도달 시간·반향·RT60까지 다루는 음향 물리 도구. 온도별·매질별(물·강철) 음속 비교표와 NWS 낙뢰 안전 수칙(천둥이 들리면 실내로) 안내 포함.',
  keywords: ['음속계산기', '천둥번개거리', '소리도달시간', '음속공식', '광속', '마하', '에코지연', '잔향시간', 'RT60', '소닉붐'],
})

/* 가이드 표는 손으로 적지 않고 계산기와 같은 soundData 함수·데이터로 빌드 시 계산한다. */
const V20 = calcSoundSpeed(20)
const V0 = calcSoundSpeed(0)
const V30 = calcSoundSpeed(30)
const LIGHT_RATIO = LIGHT_SPEED / V20
const THUNDER_ROWS = [1, 3, 5, 10, 15, 30].map(sec => ({
  sec, d0: sec * V0, d20: sec * V20, d30: sec * V30, rule: (sec / 3) * 1000,
}))
/* 비고: 계산기 카드용 note에서 '공기의 약 N배'는 옆 열(공기 대비)과 겹치므로 뺀다 */
const MEDIUM_ROWS = MEDIUM_SPEEDS.map(m => ({
  ...m, ratio: m.speed / 343, tableNote: m.note.replace(/^공기의 약 [\d.]+배(\s*—\s*)?/, '') || '—',
}))
const RT_ROWS = ROOM_PRESETS.map(p => ({ ...p, calc: calcRT60(p.w, p.d, p.h, p.wall, p.floor, p.ceil) }))
const fmtM = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(2)}km` : `${Math.round(m).toLocaleString()}m`)

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', fontSize: 13, verticalAlign: 'top' }
const tdNum: React.CSSProperties = { ...td, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const rowBorder: React.CSSProperties = { borderBottom: '1px solid var(--border)' }

const FAQ_LD = [
              {
                q: '천둥 번개 사이 시간으로 거리를 어떻게 계산하나요?',
                a: '<strong>거리(km) = 시간(초) × 0.343</strong> (20°C 기준), 또는 간단히 <strong>거리(km) ≈ 시간(초) ÷ 3</strong>입니다. 예를 들어 번개를 본 후 5초 뒤 천둥이 들리면 약 <strong>1.7km 떨어진 곳</strong>입니다. 빛은 거의 즉시 도달하므로 시간 차이는 사실상 소리만의 도달 시간입니다. 30초 이상 차이가 나면 약 10km 이상 떨어져 있다는 뜻이지만, 낙뢰는 뇌우 중심에서 10km 넘게 떨어진 곳에도 떨어질 수 있어 <strong>천둥이 들리는 한 거리와 무관하게 위험권</strong>입니다. NWS(미국 기상청)는 천둥이 들리면 거리와 무관하게 즉시, 기상청은 번개 후 30초 안에 천둥이 들리면 즉시 건물·차 안으로 대피하라고 하며, 두 기관 모두 마지막 천둥 후 30분은 기다리라고 합니다.',
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
                a: '비행기가 음속(<strong>1마하</strong>, 20°C 지상 기준 약 1,235km/h)보다 빠르게 날 때 생긴 <strong>충격파</strong>가 지상에 닿아 &quot;쾅&quot; 하고 들리는 폭음으로, 음속을 넘는 순간 한 번이 아니라 초음속으로 나는 내내 비행 경로 아래로 이어집니다. 충격파가 생기는 원리, 고도에 따라 1마하가 달라지는 이유, 첫 음속 돌파 기록은 본문 &lsquo;마하와 음속 — 소닉붐의 비밀&rsquo;에 정리했습니다.',
              },
              {
                q: '왜 우주에서는 소리가 안 들리나요?',
                a: '<strong>소리는 매질(공기·물·고체 등)이 있어야 전달</strong>됩니다. 우주는 거의 진공 상태(매우 적은 분자만 존재)이므로 음파가 전달될 매질이 없어 소리가 들리지 않습니다. 반면 빛은 매질 없이도 진공을 통과할 수 있어 우주에서도 별빛을 볼 수 있습니다. 영화에서 우주 폭발 소리가 들리는 장면은 과학적으로 정확하지 않습니다.',
              },
            ]

export default function SoundSpeedPage() {
  return (
    <ToolPage width={760} slug="/tools/edu/sound-speed">
      <h1 className="tp-h1">
        <ToolIconBadge catId="edu" />음속 계산기
      </h1>
      <p className="tp-lead">
        천둥·번개 거리·소리 도달 시간·반향·RT60. <strong style={{ color: 'var(--text)' }}>빛 vs 소리</strong>를 직관적으로.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="건조 공기 1기압 음속 근사식(331.3 + 0.606 × 기온) · 빛의 속도 정의값 · 낙뢰 행동요령(기상청·NWS) · Sabine 잔향식"
        sources={[
          { label: '기상청 날씨누리 — 낙뢰 국민행동요령', href: 'https://www.weather.go.kr/w/hazard/safety-guide/lightning.do' },
          { label: 'NWS Lightning Safety', href: 'https://www.weather.gov/safety/lightning-safety' },
          { label: 'NASA Glenn — Speed of Sound', href: 'https://www.grc.nasa.gov/www/k-12/airplane/sound.html' },
          { label: 'NIST CODATA — 진공 중 빛의 속도', href: 'https://physics.nist.gov/cgi-bin/cuu/Value?c' },
        ]}
      />

      <SoundSpeedClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 음속 기본 공식 ── */}
        <div>
          <h2 className="g-h2">
            음속 기본 공식
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '18px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--teal-700)' }}>음속(m/s)</span> = 331.3 + 0.606 × 기온(°C)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 건조한 공기, 1기압 표준 조건</div>
            <div></div>
            <div><span style={{ color: 'var(--muted)' }}># 주요 온도</span></div>
            <div>0°C  → 약 <strong style={{ color: 'var(--teal-700)' }}>{V0.toFixed(1)} m/s</strong></div>
            <div>20°C → 약 <strong style={{ color: 'var(--teal-700)' }}>{V20.toFixed(1)} m/s</strong> (흔히 343으로 씀)</div>
            <div>30°C → 약 <strong style={{ color: 'var(--teal-700)' }}>{V30.toFixed(1)} m/s</strong></div>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            온도가 1°C 오르면 음속은 약 <strong>0.6 m/s 빨라집니다.</strong> 공기 분자가 더 빨리 움직여 압력 변화를 더 빨리 전달하기 때문입니다.
            겨울 0°C와 여름 30°C를 비교하면 음속이 약 18 m/s(<strong>약 5%</strong>) 차이 나고, 계산기 슬라이더 양 끝(−20°C ↔ 40°C)에서는 약 11%까지 벌어집니다.
            이 식은 0°C 음속(331.3 m/s)에서 출발하는 선형 근사라 일상 기온 범위에서는 오차가 매우 작지만, 습도(습할수록 조금 빨라짐)와 기압·고도 차이는 반영하지 않습니다.
          </p>
        </div>

        {/* ── 2. 천둥 번개 거리 ── */}
        <div>
          <h2 className="g-h2">
            천둥 번개 거리 계산
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '18px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div>거리(m) = <span style={{ color: 'var(--teal-700)' }}>음속</span> × <span style={{ color: 'var(--yellow-700)' }}>시간(초)</span></div>
            <div></div>
            <div><span style={{ color: 'var(--muted)' }}># 빠른 추정 공식</span></div>
            <div>거리(km) ≈ 시간(초) ÷ 3</div>
            <div>거리(mile) ≈ 시간(초) ÷ 5</div>
            <div></div>
            <div><span style={{ color: 'var(--muted)' }}># 예시</span></div>
            <div>5초 × 343 m/s = <strong style={{ color: 'var(--teal-700)' }}>1,715m (≈ 1.7km)</strong></div>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            번개를 본 순간부터 천둥이 들릴 때까지 초를 세어 음속을 곱하면 됩니다. 빛은 1km를 약 3.3마이크로초에 가므로 번개는 사실상 즉시 보인다고 봐도 됩니다.
            아래 표는 같은 초수라도 기온에 따라 거리가 얼마나 달라지는지, 그리고 &lsquo;초 ÷ 3&rsquo; 어림이 얼마나 맞는지 계산기와 같은 식으로 계산한 것입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr style={rowBorder}>
                  <th scope="col" style={th}>번개~천둥</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>0°C</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>20°C</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>30°C</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>÷3 어림</th>
                </tr>
              </thead>
              <tbody>
                {THUNDER_ROWS.map(r => (
                  <tr key={r.sec} style={rowBorder}>
                    <th scope="row" style={{ ...tdNum, fontWeight: 600, textAlign: 'left' }}>{r.sec}초</th>
                    <td style={{ ...tdNum, textAlign: 'right' }}>{fmtM(r.d0)}</td>
                    <td style={{ ...tdNum, textAlign: 'right', fontWeight: 700 }}>{fmtM(r.d20)}</td>
                    <td style={{ ...tdNum, textAlign: 'right' }}>{fmtM(r.d30)}</td>
                    <td style={{ ...tdNum, textAlign: 'right', color: 'var(--muted)' }}>{fmtM(r.rule)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            &lsquo;÷3&rsquo; 어림은 초당 333m로 계산하는 셈이라 20°C에서는 실제보다 약 3%, 30°C에서는 약 5% 짧게 나옵니다.
            그래도 번개를 보고 초를 세기 시작하는 순간의 오차가 이보다 크므로, 현장에서 쓰는 어림으로는 충분합니다. 천둥은 번개 경로 전체에서 나오기 때문에 우르릉 소리가 몇 초씩 이어지는데,
            거리 계산에는 <strong>처음 들린 소리</strong>까지의 시간을 쓰세요. 그게 가장 가까운 지점까지의 거리입니다.
          </p>
          <Callout tone="warn" title="거리는 안전 판정이 아닙니다">
            낙뢰는 뇌우 중심에서 10km 넘게 떨어진 곳에도 떨어질 수 있습니다. 미국 기상청(NWS)은 &quot;When Thunder Roars, Go Indoors&quot; — 천둥이 들리면 거리와 무관하게 위험권으로 보고 즉시 실내로 대피하라고 안내합니다.
            기상청 국민행동요령은 번개 후 30초 안에 천둥이 들리면 즉시 대피하는 &lsquo;30-30 규칙&rsquo;을 소개하며, 두 기관 모두 <strong>마지막 천둥 후 30분</strong>은 기다렸다가 움직이라고 합니다.
            등산 중이라면 봉우리·능선·키 큰 나무 아래를 피해 몸을 낮추고, 우산·등산 스틱 같은 긴 물건은 몸에서 떨어뜨리세요.
          </Callout>
        </div>

        {/* ── 3. 빛 vs 소리 ── */}
        <div>
          <h2 className="g-h2">
            빛 vs 소리 — 우주의 두 속도
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--teal-600)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--teal-700)', fontWeight: 700, marginBottom: 8 }}>빛의 속도 (진공, 정의값)</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 22, color: 'var(--text)', marginBottom: 4 }}>
                299,792,458 m/s
              </p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>≈ 30만 km/s · 1초에 지구 약 7바퀴 반</p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--orange-600)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--warning)', fontWeight: 700, marginBottom: 8 }}>음속 (공기, 20°C)</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 22, color: 'var(--text)', marginBottom: 4 }}>
                343 m/s
              </p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>≈ 1,235 km/h · 1마하</p>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            빛은 20°C 공기 중 소리보다 약 <strong>{Math.round(LIGHT_RATIO / 10000)}만 배</strong> 빠릅니다.
            같은 1km를 가는 데 빛은 약 0.0000033초(3.3마이크로초), 소리는 약 {(1000 / V20).toFixed(1)}초가 걸립니다.
            빛의 속도 299,792,458 m/s는 측정값이 아니라 1983년부터 미터의 정의에 쓰이는 <strong>정확한 정의값</strong>입니다 — 1미터가 &lsquo;빛이 진공에서 1/299,792,458초 동안 가는 거리&rsquo;로 정해져 있기 때문입니다.
            공기 중에서는 빛이 이보다 약 0.03% 느리지만 천둥 계산에는 영향이 없습니다.
          </p>
        </div>

        {/* ── 4. 매질별 음속 ── */}
        <div>
          <h2 className="g-h2">
            매질별 음속 차이
          </h2>
          <p className="g-p">
            소리는 매질이 있어야 전달됩니다. 음속은 매질의 <strong>탄성(단단함)과 밀도의 비</strong>로 정해지는데,
            고체는 밀도가 커도 탄성이 훨씬 크게 앞서기 때문에 대체로 기체 → 액체 → 고체 순으로 빨라집니다.
            아래 값은 계산기 매질 탭과 같은 대표 근사값으로, 나무는 결 방향·수종, 금속은 합금·파동 종류(종파 기준)에 따라 달라집니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
              <thead>
                <tr style={rowBorder}>
                  <th scope="col" style={th}>매질</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>음속 (m/s)</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>공기(343) 대비</th>
                  <th scope="col" style={th}>비고</th>
                </tr>
              </thead>
              <tbody>
                {MEDIUM_ROWS.map(r => (
                  <tr key={r.medium} style={rowBorder}>
                    <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{r.medium}</th>
                    <td style={{ ...tdNum, textAlign: 'right', fontWeight: 700 }}>{r.speed.toLocaleString()}</td>
                    <td style={{ ...tdNum, textAlign: 'right' }}>{r.speed === 0 ? '전달 안 됨' : `${r.ratio.toFixed(1)}배`}</td>
                    <td style={{ ...td, color: 'var(--muted)', fontSize: 12 }}>{r.tableNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            철로에 귀를 대면 기차 소리가 공기로 오는 소리보다 먼저 들리는 것, 물속에서 소리의 방향을 가늠하기 어려운 것(양쪽 귀에 닿는 시간차가 공기 중의 약 4분의 1로 줄어듦)이
            모두 매질에 따른 음속 차이 때문입니다.
          </p>
        </div>

        {/* ── 5. 마하·소닉붐 ── */}
        <div>
          <h2 className="g-h2">
            마하와 음속 — 소닉붐의 비밀
          </h2>
          <p className="g-p">
            마하 수는 속도를 <strong>그 자리 공기의 음속</strong>으로 나눈 값입니다. 음속이 기온에 따라 달라지므로 같은 시속이라도 마하 수가 달라집니다.
            지상 20°C에선 1마하가 약 343 m/s(1,235 km/h)지만, 여객기가 순항하는 약 11km 상공은 영하 55°C 안팎이라 음속이 약 295 m/s로 떨어집니다.
          </p>
          <ul className="g-list">
            <li>지상 기준: 걷기 약 0.004마하 · 고속도로 자동차 약 0.08마하 · KTX 약 0.25마하</li>
            <li>고고도 기준(음속 약 295 m/s): 여객기 순항 약 0.85마하</li>
            <li>F-16 약 2.0마하 · F-15 약 2.5마하 · SR-71 정찰기 약 3.3마하 (모두 고고도 공칭 최고 속도)</li>
          </ul>
          <p className="g-p">
            <strong>소닉붐(Sonic Boom)</strong>은 비행기가 자기가 만든 음파를 앞질러 가면서 압력 변화가 한 면에 몰려 생긴 충격파가 지상에 닿아 들리는 폭음입니다.
            &lsquo;음속을 돌파하는 순간 한 번 나는 소리&rsquo;로 오해하기 쉽지만, 실제로는 <strong>초음속으로 나는 내내</strong> 비행 경로 아래를 따라 폭이 수십 km에 이르는
            &lsquo;붐 카펫&rsquo;을 끌고 다닙니다. 초음속 여객기가 육지 위에서 초음속 비행을 제한받는 이유입니다.
            공식 기록상 첫 음속 돌파는 <strong>1947년 척 예거(Chuck Yeager)</strong>가 조종한 X-1의 마하 1.06입니다.
          </p>
        </div>

        {/* ── 6. 에코·잔향 ── */}
        <div>
          <h2 className="g-h2">
            에코(반향) 원리와 잔향 시간 RT60
          </h2>
          <p className="g-p">
            <strong>에코(반향)</strong>는 벽이나 산에 부딪혀 돌아온 소리입니다. 지연 시간 = 왕복 거리 ÷ 음속이므로, 벽까지 17m면 왕복 34m를 약 0.1초에 돌아옵니다.
            계산기는 지연이 50ms 미만이면 원래 소리와 섞여 하나로, 50~100ms면 소리가 약간 길게, 100ms~1초면 분리된 에코로, 1초 이상이면 뚜렷한 메아리로 구분합니다.
            대략 50ms 안쪽으로 돌아온 반사음은 귀가 원래 소리의 일부로 합쳐 듣기 때문에, 강당·교실 설계에서 이 시간을 넘는 늦은 반사를 줄이는 것이 중요합니다.
          </p>
          <p className="g-p">
            <strong>잔향 시간 RT60</strong>은 소리를 끈 뒤 음압 레벨이 60dB 떨어질 때까지 걸리는 시간입니다. 계산기는 Sabine 공식을 씁니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)', lineHeight: 2, margin: '0 0 16px' }}>
            RT60 = 0.161 × V / A<br />
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>V: 방 부피(m³) · A: 흡음량 = Σ(면적 × 흡음률), 흡음률은 500Hz 부근 대표값</span>
          </div>
          <p className="g-p">
            아래 표는 계산기 잔향 탭의 프리셋입니다. &lsquo;전형 RT60&rsquo;은 그런 공간에서 흔한 값이고, 오른쪽은 프리셋 치수·재질을 Sabine 식에 넣어 계산한 값입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={rowBorder}>
                  <th scope="col" style={th}>공간</th>
                  <th scope="col" style={th}>치수 (m)</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>부피</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>전형 RT60</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>Sabine 계산</th>
                </tr>
              </thead>
              <tbody>
                {RT_ROWS.map(r => (
                  <tr key={r.name} style={rowBorder}>
                    <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left' }}>{r.name}</th>
                    <td style={tdNum}>{r.w} × {r.d} × {r.h}</td>
                    <td style={{ ...tdNum, textAlign: 'right' }}>{Math.round(r.calc.V).toLocaleString()}m³</td>
                    <td style={{ ...tdNum, textAlign: 'right' }}>{r.rt}초</td>
                    <td style={{ ...tdNum, textAlign: 'right', fontWeight: 700 }}>{r.calc.rt60.toFixed(2)}초</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            말소리가 중요한 공간일수록 잔향이 짧아야 합니다. 미국 교실 음향 표준(ANSI/ASA S12.60)은 부피 283m³ 이하 교실의 잔향 시간을 0.6초 이하로 권고하고,
            음악을 위한 콘서트홀은 소리가 풍성하게 이어지도록 1.5~2초 안팎으로 설계합니다(너무 짧으면 소리가 메마르고, 너무 길면 음이 뭉개짐). Sabine 식은 흡음이 적은 방에서 잘 맞고, 흡음재가 많은 방에서는 실제보다 길게 나오는 경향이 있습니다.
            가구·사람·공기의 흡음은 빠져 있으니 실제 방은 계산보다 대체로 짧다고 보면 됩니다.
          </p>
        </div>

        {/* ── 7. 흥미로운 사실 모음 ── */}
        <div>
          <h2 className="g-h2">
            음속·광속 흥미로운 사실
          </h2>
          <ul className="g-list">
            <li><strong>빛의 1초</strong> — 지구 둘레(약 4만 km)를 약 7바퀴 반 도는 거리. 소리는 같은 1초에 축구장 세 개 남짓(약 343m)을 갑니다.</li>
            <li><strong>태양빛</strong> — 태양에서 지구까지 약 8분 20초. 지금 보는 태양은 8분여 전의 모습입니다.</li>
            <li><strong>달까지 빛</strong> — 약 1.3초. 아폴로 우주인과 관제센터의 대화에 왕복 2.6초 남짓 지연이 있었던 이유입니다.</li>
          </ul>
        </div>

        {/* ── 7.5 계산 가정 (출처 링크는 ToolPage가 UpdatedMeta sources로 '참고 자료'를 자동 렌더) ── */}
        <div>
          <h2 className="g-h2">
            계산 가정
          </h2>
          <ul className="g-list">
            <li>공기 중 음속은 건조 공기·1기압 근사식 <strong>331.3 + 0.606×T</strong>를 사용합니다 (습도 영향 미반영).</li>
            <li>천둥 거리 = 시간 × 음속. 거리는 참고 정보이며 <strong>안전 거리 판정이 아닙니다</strong>.</li>
            <li>RT60은 Sabine 간이식(0.161·V/A)으로, 표면 흡음률(500Hz 부근 대표값)만 반영합니다 — 가구·청중·공기 흡음 미반영.</li>
            <li>매질별 음속·항공기 속도는 대표 근사값입니다 (종파 기준, 조건에 따라 달라짐).</li>
          </ul>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/edu/planet-comparison',  icon: '🪐', name: '행성 비교 계산기',     desc: '8개 행성에서 내 몸무게·나이·하루' },
              { href: '/tools/edu/cosmic-calendar',    icon: '🌌', name: '코스믹 캘린더',         desc: '138억 년 우주 역사를 1년으로' },
              { href: '/tools/edu/circuit-simulator',  icon: '⚡', name: '옴의 법칙 계산기',  desc: '직렬·병렬 회로 시각화' },
              { href: '/tools/unit/converter',         icon: '📐', name: '단위 변환기',           desc: '길이·무게·시간 등 14종 통합 변환' },
              { href: '/tools/edu/sig-figs',           icon: '🧪', name: '유효숫자·과학적 표기', desc: '과학적 표기·SI 접두어·물리 상수' },
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
                  borderRadius: 'var(--radius-m)',
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
    </ToolPage>
  )
}
