import Link from 'next/link'
import BaseballStatsClient from './BaseballStatsClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import { KBO_SEASON_RECORDS as REC, fmtRecord, KBO_RECORDS_CHECKED } from './kboRecords'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/sports/baseball-stats',
  title: '야구 타율 계산기 — 출루율·장타율·ERA·WHIP 계산',
  description:
    '타율·출루율·장타율·OPS·ERA·WHIP 즉시 계산 + KBO 평균 비교로 내 기록이 어느 수준인지 한눈에. 규정타석 기준과 세이버메트릭스 입문 가이드까지.',
  keywords: ['야구타율계산기', 'OPS계산기', '출루율계산기', '장타율계산기', 'ERA계산기', 'WHIP계산기', 'KBO기록', '야구통계계산기'],
})

/* ── 계산 과정 예시 — 계산기 기본 입력값(타자·투수)을 같은 공식으로 빌드 시 계산 ── */
const BAT = { ab: 320, h: 97, b2: 20, b3: 2, hr: 15, bb: 45, hbp: 5, sf: 3, k: 72 }
const BAT_1B = BAT.h - BAT.b2 - BAT.b3 - BAT.hr
const BAT_TB = BAT_1B + BAT.b2 * 2 + BAT.b3 * 3 + BAT.hr * 4
const BAT_OBP_DEN = BAT.ab + BAT.bb + BAT.hbp + BAT.sf
const BAT_AVG = BAT.h / BAT.ab
const BAT_OBP = (BAT.h + BAT.bb + BAT.hbp) / BAT_OBP_DEN
const BAT_SLG = BAT_TB / BAT.ab
const BAT_BABIP_DEN = BAT.ab - BAT.k - BAT.hr + BAT.sf
const BAT_BABIP = (BAT.h - BAT.hr) / BAT_BABIP_DEN
// 계산기의 wOBA(간이) 가중치 — 볼넷 0.69 · 사구 0.72 · 1루타 0.89 · 2루타 1.27 · 3루타 1.62 · 홈런 2.10
const WOBA_W = { bb: 0.69, hbp: 0.72, s1: 0.89, s2: 1.27, s3: 1.62, hr: 2.10 }
const BAT_WOBA = (WOBA_W.bb * BAT.bb + WOBA_W.hbp * BAT.hbp + WOBA_W.s1 * BAT_1B + WOBA_W.s2 * BAT.b2 + WOBA_W.s3 * BAT.b3 + WOBA_W.hr * BAT.hr) / BAT_OBP_DEN

const PIT = { ipNote: '120.1', ip: 120 + 1 / 3, er: 46, h: 108, bb: 38, hbp: 5, hr: 14, k: 127, fipConst: 3.55 }
const PIT_ERA = (PIT.er * 9) / PIT.ip
const PIT_WHIP = (PIT.h + PIT.bb) / PIT.ip
const PIT_K9 = (PIT.k * 9) / PIT.ip
const PIT_FIP_RAW = (13 * PIT.hr + 3 * (PIT.bb + PIT.hbp) - 2 * PIT.k) / PIT.ip
const PIT_FIP = PIT_FIP_RAW + PIT.fipConst
const r3 = (v: number) => v.toFixed(3).replace(/^0/, '')
const r2 = (v: number) => v.toFixed(2)

const FAQ_LD = [
              {
                q: 'OPS와 wOBA 중 어느 게 더 정확한가요?',
                a: 'wOBA가 이론적으로 더 정확합니다. OPS는 출루율과 장타율을 단순 합산하지만, wOBA는 각 타격 행위(볼넷·1루타·홈런 등)에 다른 가중치를 부여합니다. 다만 OPS는 계산이 간단하고 직관적이라 일반 팬들에게 더 널리 쓰이며, 본 계산기도 두 지표를 모두 제공합니다.',
              },
              {
                q: '타율 3할의 의미는 무엇인가요?',
                a: '타율 0.300(3할)은 100타수 중 30개의 안타를 친다는 의미입니다(볼넷·사구·희생타는 타수에서 제외). KBO·MLB 모두에서 우수 타자의 기준선으로 통하지만, 3할 타자 수는 타고투저·투고타저 같은 리그 환경에 따라 해마다 크게 달라지므로 그해 리그 평균 타율과 함께 봐야 합니다. 4할(0.400)은 KBO에서 1982년 백인천(0.412, 팀당 80경기였던 원년 시즌) 한 번뿐이고, MLB에서도 1941년 테드 윌리엄스(0.406) 이후 나오지 않았습니다.',
              },
              {
                q: 'ERA와 FIP 중 어느 것을 봐야 하나요?',
                a: 'ERA는 실제 자책점 기반이라 직관적이지만 수비력에 영향을 받습니다. <strong>FIP는 투수가 직접 컨트롤하는 요소(삼진·볼넷·홈런)만으로 계산</strong>해 투수의 진짜 실력을 더 정확히 보여줍니다. <strong>FIP가 ERA보다 낮으면</strong> 수비·운이 받쳐주지 않아 자책점이 부풀려진(운이 나빴던) 신호로 이후 ERA가 내려갈 여지가 있고, 반대로 <strong>FIP가 ERA보다 높으면</strong> 운이 좋았던 신호로 ERA가 오를 여지가 있습니다.',
              },
              {
                q: '투수 이닝에서 5.1, 5.2는 무슨 의미인가요?',
                a: '<strong>5.1 = 5와 1/3 이닝</strong>(5이닝 + 아웃 1개 더), <strong>5.2 = 5와 2/3 이닝</strong>입니다. 야구는 한 이닝 = 3아웃이므로 1/3·2/3 이닝 단위로 표기합니다. 본 계산기는 자동으로 정확한 분수로 변환해 ERA를 계산합니다.',
              },
              {
                q: '사회인 야구에서도 같은 공식을 쓰나요?',
                a: '네, 타율·OPS 등 기본 공식은 동일합니다. 다만 사회인 야구는 게임 수가 적고 타석 수도 부족해 프로 기준의 평가는 적절하지 않습니다. 본인 팀 평균과 비교하거나 자신의 시즌별 발전을 추적하는 용도로 활용하세요.',
              },
            ]

export default function BaseballStatsPage() {
  return (
    <ToolPage width={760} slug="/tools/sports/baseball-stats">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />야구 타율 계산기
      </h1>
      <p className="tp-lead">
        타율·출루율·장타율·OPS·ERA·WHIP 즉시 계산 + <strong style={{ color: 'var(--text)' }}>KBO 평균 비교</strong>.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="타율·출루율·OPS·ERA·WHIP 표준 공식 · 규정타석(경기수×3.1)·규정이닝(경기수×1.0) = 공식야구규칙 9.22 기준"
        sources={[
          { label: 'KBO 공식 기록실', href: 'https://www.koreabaseball.com/Record/Player/HitterBasic/Basic1.aspx' },
          { label: 'MLB 공식 용어집(Rate Stats Qualifiers)', href: 'https://www.mlb.com/glossary/standard-stats/rate-stats-qualifiers' },
          { label: 'FanGraphs Sabermetrics Library — FIP', href: 'https://library.fangraphs.com/pitching/fip/' },
        ]}
      />

      <BaseballStatsClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 타격 지표 공식 ── */}
        <div>
          <h2 className="g-h2">
            야구 핵심 타격 지표 공식
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
            <div><span style={{ color: 'var(--muted)' }}>타율 (AVG)</span> = 안타 ÷ 타수</div>
            <div><span style={{ color: 'var(--muted)' }}>출루율 (OBP)</span> = (안타 + 볼넷 + 사구) ÷ (타수 + 볼넷 + 사구 + 희생플라이)</div>
            <div><span style={{ color: 'var(--muted)' }}>장타율 (SLG)</span> = 루타수 ÷ 타수</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 루타수 = 1루타 + 2루타×2 + 3루타×3 + 홈런×4</div>
            <div><span style={{ color: 'var(--muted)' }}>OPS</span> = 출루율 + 장타율</div>
          </div>
        </div>

        {/* ── 1-0. 기본값으로 본 계산 과정 ── */}
        <div>
          <h2 className="g-h2">
            기본 입력값으로 따라가 보는 계산 과정
          </h2>
          <p className="g-p">
            계산기를 처음 열면 들어 있는 타자 기록(타수 {BAT.ab} · 안타 {BAT.h} · 2루타 {BAT.b2} · 3루타 {BAT.b3} · 홈런 {BAT.hr} · 볼넷 {BAT.bb} · 사구 {BAT.hbp} · 희생플라이 {BAT.sf} · 삼진 {BAT.k})과
            투수 기록({PIT.ipNote}이닝 · 자책 {PIT.er} · 피안타 {PIT.h} · 볼넷 {PIT.bb} · 사구 {PIT.hbp} · 피홈런 {PIT.hr} · 탈삼진 {PIT.k})을 공식에 그대로 넣으면 아래와 같습니다.
            결과 화면의 숫자와 한 줄씩 대조해 보면 어느 칸이 어느 분모로 들어가는지 금방 익힐 수 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['지표', '대입', '결과'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 2 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['타율', `${BAT.h} ÷ ${BAT.ab}`, r3(BAT_AVG)],
                  ['출루율', `(${BAT.h} + ${BAT.bb} + ${BAT.hbp}) ÷ (${BAT.ab} + ${BAT.bb} + ${BAT.hbp} + ${BAT.sf})`, r3(BAT_OBP)],
                  ['루타수', `1루타 ${BAT_1B} + 2루타 ${BAT.b2}×2 + 3루타 ${BAT.b3}×3 + 홈런 ${BAT.hr}×4`, String(BAT_TB)],
                  ['장타율', `${BAT_TB} ÷ ${BAT.ab}`, r3(BAT_SLG)],
                  ['OPS', `${r3(BAT_OBP)} + ${r3(BAT_SLG)}`, r3(BAT_OBP + BAT_SLG)],
                  ['ISO', `${r3(BAT_SLG)} − ${r3(BAT_AVG)}`, r3(BAT_SLG - BAT_AVG)],
                  ['BABIP', `(${BAT.h} − ${BAT.hr}) ÷ (${BAT.ab} − ${BAT.k} − ${BAT.hr} + ${BAT.sf})`, r3(BAT_BABIP)],
                  ['wOBA (간이)', `가중 합 ÷ ${BAT_OBP_DEN}`, r3(BAT_WOBA)],
                  ['ERA', `${PIT.er} × 9 ÷ ${r2(PIT.ip)}이닝`, r2(PIT_ERA)],
                  ['WHIP', `(${PIT.h} + ${PIT.bb}) ÷ ${r2(PIT.ip)}`, r2(PIT_WHIP)],
                  ['K/9', `${PIT.k} × 9 ÷ ${r2(PIT.ip)}`, r2(PIT_K9)],
                  ['FIP (KBO 상수)', `(13×${PIT.hr} + 3×(${PIT.bb}+${PIT.hbp}) − 2×${PIT.k}) ÷ ${r2(PIT.ip)} + ${PIT.fipConst}`, r2(PIT_FIP)],
                ].map((r, i) => (
                  <tr key={r[0]} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            이닝 {PIT.ipNote}은 &lsquo;120과 1/3이닝&rsquo;이라 {r2(PIT.ip)}로 바꿔 나눕니다. 120.1을 그대로 나누면 ERA가 조금 다르게 나오는데, 계산기는 이 변환을 자동으로 합니다.
            이 타자는 타율 3할에 OPS가 {r3(BAT_OBP + BAT_SLG)}라 아래 표의 &lsquo;올스타급&rsquo; 구간이고, BABIP {r3(BAT_BABIP)}는 흔히 기준으로 삼는 .300보다 높아 운이 조금 따랐을 가능성도 함께 보여 줍니다.
            투수는 ERA {r2(PIT_ERA)}보다 FIP {r2(PIT_FIP)}가 높으니, 삼진·볼넷·홈런만 보면 실점 억제가 다소 운에 기댔다고 해석할 수 있습니다.
            wOBA 가중치(볼넷 {WOBA_W.bb} · 사구 {WOBA_W.hbp} · 1루타 {WOBA_W.s1} · 2루타 {WOBA_W.s2} · 3루타 {WOBA_W.s3} · 홈런 {WOBA_W.hr})는 리그·시즌마다 조금씩 달라 계산기는 대표값을 씁니다.
          </p>
        </div>

        {/* ── 1-1. 타석(PA) vs 타수(AB) 구분 ── */}
        <div>
          <h2 className="g-h2">
            타석(PA) vs 타수(AB) — 입력 실수 방지 가이드
          </h2>
          <p className="g-p">
            타율이 이상하게 나오는 가장 흔한 원인은 <strong style={{ color: 'var(--text)' }}>타석(PA)과 타수(AB)의 혼동</strong>입니다.
            타석은 타자가 타격을 완료한 모든 기회이고, 타수는 거기서 볼넷·사구·희생번트·희생플라이를 뺀 값입니다.
            지표마다 분모가 달라서, 기록지의 어느 칸을 입력하느냐가 결과를 좌우합니다. 모든 항목은 타석(PA)에는 포함됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['기록 항목', '타수(AB)', '출루율 분모', '지표에 미치는 영향'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { item: '안타·범타·삼진',        ab: '포함', obp: '포함', note: '타율·출루율 모두 반영' },
                  { item: '볼넷 (BB)',              ab: '제외', obp: '포함', note: '타율 불변 · 출루율 상승' },
                  { item: '사구 (HBP, 몸에 맞는 공)', ab: '제외', obp: '포함', note: '볼넷과 동일 취급' },
                  { item: '희생번트 (SH)',          ab: '제외', obp: '제외', note: '타율·출루율 모두 불변' },
                  { item: '희생플라이 (SF)',        ab: '제외', obp: '포함', note: '타율 불변 · 출루율은 하락' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.item}</td>
                    <td style={{ padding: '10px 12px', color: r.ab === '포함' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{r.ab}</td>
                    <td style={{ padding: '10px 12px', color: r.obp === '포함' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{r.obp}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            예를 들어 한 경기 5타석에서 <strong style={{ color: 'var(--text)' }}>안타 1·볼넷 1·희생번트 1·희생플라이 1·뜬공 아웃 1</strong>을 기록했다면
            타수는 2(안타+뜬공 아웃)입니다. 타율 = 1÷2 = 0.500, 출루율 = (1+1)÷(2+1+1) = 0.500이 됩니다.
            볼넷을 타수에 넣어 1÷3 = 0.333으로 계산하는 것이 대표적인 실수입니다.
            희생번트는 출루율 분모에서도 빠져 기록상 손해가 없지만, 희생플라이는 분모에만 들어가 출루율을 깎는다는 점도 자주 헷갈리는 부분입니다.
            KBO 공식 기록실 역시 PA·AB·희생번트(SAC)·희생플라이(SF)를 별도 열로 나눠 집계합니다.
          </p>
        </div>

        {/* ── 2. OPS 수준 평가 ── */}
        <div>
          <h2 className="g-h2">
            OPS 수준 평가 기준
          </h2>
          <p className="g-p">
            계산기의 OPS 등급은 아래 구간을 그대로 씁니다. 다만 같은 OPS라도 리그 전체가 잘 치는 해에는 가치가 낮아지므로, 리그 평균을 100으로 놓고 비교하는
            OPS+를 함께 보세요. OPS+ 120은 리그 평균 타자보다 약 20% 생산적이라는 뜻입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['OPS', '평가', '해석'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { ops: '1.000+',       lv: 'MVP급',       cls: 'var(--yellow-700)', who: `시즌을 지배하는 수준 — KBO 단일 시즌 최고는 ${fmtRecord(REC.ops)}` },
                  { ops: '0.900~1.000',  lv: '올스타급',    cls: 'var(--accent-ink)', who: '리그 상위권 강타자' },
                  { ops: '0.800~0.900',  lv: '주전급',      cls: 'var(--emerald-600)', who: '리그 평균을 확실히 웃도는 주전 타자' },
                  { ops: '0.700~0.800',  lv: '평균',        cls: 'var(--muted)', who: '리그 평균 부근 — 리그 평균 OPS 자체가 해마다 이 구간 안에서 오르내림' },
                  { ops: '0.600~0.700',  lv: '평균 이하',   cls: 'var(--orange-600)', who: '수비·주루 기여가 커야 주전을 지키는 수준' },
                  { ops: '0.600 미만',   lv: '백업·교체',   cls: 'var(--red-600)', who: '타격만으로는 주전 경쟁이 어려운 수준' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.ops}</td>
                    <td style={{ padding: '10px 12px', color: r.cls, fontWeight: 600 }}>{r.lv}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.who}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 투수 핵심 지표 ── */}
        <div>
          <h2 className="g-h2">
            투수 핵심 지표
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
            <div><span style={{ color: 'var(--muted)' }}>ERA (평균자책점)</span> = (자책점 × 9) ÷ 투구이닝</div>
            <div><span style={{ color: 'var(--muted)' }}>WHIP (이닝당 출루)</span> = (피안타 + 볼넷) ÷ 투구이닝</div>
            <div><span style={{ color: 'var(--muted)' }}>K/9</span> = (탈삼진 × 9) ÷ 투구이닝</div>
            <div><span style={{ color: 'var(--muted)' }}>K/BB</span> = 탈삼진 ÷ 볼넷</div>
            <div><span style={{ color: 'var(--muted)' }}>FIP (간이)</span> = (13×HR + 3×(BB+HBP) − 2×K) ÷ IP + 리그 상수</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 상수는 리그·시즌마다 다름. 이 도구는 리그별 근사 상수 사용 (MLB·NPB 3.1, KBO 3.55)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ FIP = 수비·운 요소 제거한 투수 진짜 실력</div>
          </div>
        </div>

        {/* ── 3-1. 규정타석·규정이닝 ── */}
        <div>
          <h2 className="g-h2">
            규정타석·규정이닝 — 순위표에 오르는 최소 기준
          </h2>
          <p className="g-p">
            타율·출루율·ERA 같은 비율 지표 순위에 이름을 올리려면 최소 출전 기준을 채워야 합니다.
            공식야구규칙 9.22는 <strong style={{ color: 'var(--text)' }}>규정타석 = 팀 경기수 × 3.1</strong>,
            <strong style={{ color: 'var(--text)' }}> 규정이닝 = 팀 경기수 × 1.0</strong>으로 정하며,
            소수점이 나오면 가장 가까운 정수로 반올림합니다(예: 502.2 → 502).
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['리그', '시즌 경기수', '규정타석 (×3.1)', '규정이닝 (×1.0)'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { lg: 'KBO', games: '144경기', pa: '144 × 3.1 = 446.4 → 446타석', ip: '144이닝' },
                  { lg: 'MLB', games: '162경기', pa: '162 × 3.1 = 502.2 → 502타석', ip: '162이닝' },
                  { lg: 'NPB', games: '143경기', pa: '143 × 3.1 = 443.3 → 443타석', ip: '143이닝' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.lg}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.games}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.pa}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            3.1은 주전 타자가 경기당 들어서는 평균적인 타석 수에서 나온 비율로, 시즌 내내 꾸준히 출전한 선수만 비율 지표 타이틀을 다투게 하려는 장치입니다.
            타자에게는 구제 조항도 있습니다 — 규정타석에 못 미친 타자라도 <strong style={{ color: 'var(--text)' }}>부족한 타석을 전부 무안타 타수로 채워 다시 계산했을 때 여전히 리그 1위</strong>라면
            타이틀이 인정되며, 공식 기록에는 원래 타율이 표기됩니다(규칙 9.22(a)).
            사회인 리그에도 같은 비율을 적용할 수 있습니다. 예컨대 30경기 리그라면 30 × 3.1 = 93타석, 투수는 30이닝이 공정한 비교 기준이 됩니다.
          </p>
        </div>

        {/* ── 4. 세이버메트릭스 입문 ── */}
        <div>
          <h2 className="g-h2">
            세이버메트릭스 입문 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {[
              { name: 'ISO', kor: '순수 장타율', formula: 'SLG − AVG', tip: '단타 외 장타 비율 측정. 0.200 이상 = 슬러거급.', color: 'var(--yellow-700)' },
              { name: 'BABIP', kor: '인플레이 타율', formula: '(H − HR) ÷ (AB − K − HR + SF)', tip: '인플레이 타구의 타율. 0.300 평균, 0.350+ 운빨 의심, 0.250- 불운.', color: 'var(--cyan-600)' },
              { name: 'wOBA', kor: '가중 출루율', formula: '타격 행위별 가중치 통합', tip: '출루율보다 정확한 타자 가치 측정. 0.370+ 엘리트급.', color: 'var(--accent-ink)' },
              { name: 'FIP', kor: '수비 무관 ERA', formula: 'HR·BB·K만 사용', tip: 'ERA보다 낮으면 운 나빴음, 높으면 운 좋았음 신호.', color: 'var(--orange-600)' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: s.color, marginBottom: 6, fontFamily: 'var(--font-sans)' }}>{s.name} <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-sans)', fontWeight: 400 }}>— {s.kor}</span></p>
                <p style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-mono)', marginBottom: 6, opacity: 0.85 }}>{s.formula}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{s.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. KBO 역대 기록 ── */}
        <div>
          <h2 className="g-h2">
            KBO 역대 단일시즌 주요 기록
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 10 }}>타자</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
                <li>최다 안타 — <strong>{fmtRecord(REC.hits)}</strong></li>
                <li>최다 홈런 — <strong>{fmtRecord(REC.homeRuns)}</strong>, 박병호 53개 (2015)</li>
                <li>최고 타율 — <strong>{fmtRecord(REC.avg)}</strong></li>
                <li>최고 OPS — <strong>{fmtRecord(REC.ops)}</strong></li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--cyan-600)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--cyan-600)', fontWeight: 700, marginBottom: 10 }}>투수</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
                <li>최저 ERA — <strong>{fmtRecord(REC.era)}</strong></li>
                <li>최다 탈삼진 — <strong>{fmtRecord(REC.strikeouts)}</strong></li>
                <li>최다 승 — <strong>{fmtRecord(REC.wins)}</strong></li>
                <li>최다 세이브 — <strong>{fmtRecord(REC.saves)}</strong></li>
              </ul>
            </div>
          </div>
          <p className="g-note">
            ※ {KBO_RECORDS_CHECKED} 확인 기준(KBO 공식 기록실·언론 보도)이며, 집계 시점·출처에 따라 소폭 차이날 수 있습니다. 2026 시즌 기록은 시즌 종료 후 반영합니다.
          </p>
        </div>

        {/* ── 6. 자주 검색되는 질문 ── */}
        <div>
          <h2 className="g-h2">
            자주 검색되는 시나리오
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {[
              { q: '"3할 타자" 기준은?', a: '타율 0.300 = 10타수 3안타', sub: '3할 타자 수는 리그 환경(타고투저·투고타저)에 따라 해마다 크게 달라짐' },
              { q: '20-20 클럽',         a: '시즌 20+ 홈런 + 20+ 도루', sub: '파워와 스피드 겸비한 5툴 지표' },
              { q: '30-30 클럽',         a: '시즌 30+ 홈런 + 30+ 도루', sub: 'KBO에서 손에 꼽히는 위업' },
              { q: '퀄리티스타트 (QS)',  a: '선발 6이닝+ / 자책 3점 이하', sub: '선발 투수의 기본 평가 지표' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>Q. {c.q}</p>
                <p style={{ fontSize: 16, color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-sans)', marginBottom: 4, letterSpacing: '-0.3px' }}>{c.a}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 7. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 8. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/league-scenarios', icon: '⚽', name: '축구 승점·경우의 수 계산기', desc: '시즌 승점 예측·조별리그 경우의 수' },
              { href: '/tools/sports/golf-handicap',     icon: '⛳', name: '골프 핸디캡 계산기',       desc: 'WHS 방식 핸디캡·코스 핸디캡' },
              { href: '/tools/sports/golf-distance',     icon: '🎯', name: '골프 비거리 계산기', desc: '클럽별 비거리·Gap 분석' },
              { href: '/tools/sports/golf-cost',         icon: '🏌️', name: '골프 비용 계산기', desc: '그린피·카트·캐디 1인 정산' },
              { href: '/tools/life/random',            icon: '🎲', name: '랜덤 추첨기',             desc: '대진표·순서 무작위 추첨' },
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
