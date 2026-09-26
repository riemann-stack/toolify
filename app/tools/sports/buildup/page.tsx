import Link from 'next/link'
import BuildupClient from './BuildupClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { DANIELS_PCT, E_FAST_PCT } from '@/lib/running'
import {
  calcBuildup, segmentsFromMode, PROFILE_LABEL, vdotFromRace, paceFromVdot, timeFromVdot,
  fmtPace, fmtHMS, type Profile,
} from './buildupUtils'

export const metadata = buildMetadata({
  path: '/tools/sports/buildup',
  title: '러닝 빌드업 계산기 — 구간별 페이스표·빌드업 훈련 설계',
  description: '거리와 목표 페이스만 넣으면 구간별 빌드업 페이스표를 자동 설계합니다. 4가지 가속 프로파일과 안전성 체크, 5K~풀코스 12개 프리셋, 워치 입력용 텍스트까지 제공.',
  keywords: ['빌드업 러닝', '빌드업 훈련 계산기', '프로그레시브 런', '빌드업 페이스', '5km 빌드업', '10km 빌드업', '하프 빌드업', '풀 마라톤 빌드업', 'VDOT 페이스', 'progression run', '러닝 페이스 그래프'],
})

/* ── 본문 표 수치는 손으로 적지 않고 도구와 같은 함수(buildupUtils·lib/running)로 빌드 시 계산 ── */
/** 00:55:00 → 55:00 · 01:03:49 → 1:03:49 */
const hms = (sec: number) => { const t = fmtHMS(sec); return t.startsWith('00:') ? t.slice(3) : t.replace(/^0/, '') }

// 예시 = 도구 기본값: 10km · 균등 5구간 · 6:00 → 5:00/km · 10K 48:00 기록
const EX_SEGS = segmentsFromMode(10, 'equal-5')
const EX_START = 360
const EX_END = 300
const EX_VDOT = vdotFromRace(10, 48 * 60)
const EX_MID_EM = (paceFromVdot(EX_VDOT, DANIELS_PCT.E) + paceFromVdot(EX_VDOT, DANIELS_PCT.M)) / 2
const PROFILES: Profile[] = ['linear', 'back-loaded', 'sprint-finish', 'race-pace-ladder']
const PROFILE_ROWS = PROFILES.map((p) => ({ p, r: calcBuildup(EX_SEGS, EX_START, EX_END, p, EX_VDOT) }))
const EX_LINEAR = PROFILE_ROWS[0].r
const EX_SPRINT = PROFILE_ROWS[2].r

const VDOT_ROWS = [30, 35, 40, 45, 50, 55, 60].map((v) => ({
  v,
  tenK: timeFromVdot(10, v),
  eSlow: paceFromVdot(v, DANIELS_PCT.E),
  eFast: paceFromVdot(v, E_FAST_PCT),
  m: paceFromVdot(v, DANIELS_PCT.M),
  t: paceFromVdot(v, DANIELS_PCT.T),
  fiveK: timeFromVdot(5, v) / 5,
}))

const TH: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top' }
const TDN: React.CSSProperties = { ...TD, fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }
const ROW = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })
const TABLE: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 }

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}
const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}

const FAQ_LD = [
  {
    q: '빌드업 vs 인터벌 vs 템포런 차이는?',
    a: '<strong>빌드업</strong>은 한 번의 달리기 안에서 점점 빨라지는 훈련(E → T), <strong>인터벌</strong>은 고강도 구간과 회복을 반복하는 훈련, <strong>템포런</strong>은 역치(T) 페이스를 20~40분 일정하게 유지하는 훈련입니다. 빌드업은 페이스 조절 감각과 피로한 상태에서의 가속 능력, 인터벌은 V̇O₂max, 템포는 젖산 역치를 주로 겨냥합니다. 이 도구는 빌드업 한 세션 설계 전용이고, 인터벌 페이스·주간 스케줄은 <a href="/tools/sports/interval-training">인터벌 훈련 계산기</a>에서 다룹니다.',
  },
  {
    q: '시작 페이스는 어떻게 정하나요?',
    a: '본인 <strong>E(이지) 페이스 범위 안에서</strong>, 대화가 편한 속도로 시작하는 것이 표준입니다. 레이스 기반 탭에 5K·10K·하프 기록을 넣으면 VDOT 기준 E·M·T·I·R 페이스가 표시되고, 프리셋과 추천 빌드업의 시작 페이스도 E 범위 안쪽(VDOT 대비 65% 강도 페이스에 최대 +15초/km)으로 잡힙니다. 끝까지 E로 달리는 회복형 프리셋만 E 범위의 느린 끝(59%)에 여유를 더해 시작합니다.',
  },
  {
    q: '끝 페이스는 5K 페이스보다 빨라도 되나요?',
    a: '권하지 않습니다. 5K 레이스 페이스보다 빠른 속도는 I·R(인터벌·반복) 영역이라 빌드업의 취지를 벗어납니다. 이 도구는 레이스 기록을 넣었을 때 <strong>끝 페이스가 5K 페이스보다 5초/km 넘게 빠르면 빨강(인터벌 영역)</strong>, 5K 페이스와 10초/km 이내로 비슷하면 주황(매우 강한 빌드업)으로 표시합니다. 일반적인 끝 지점은 T(역치) 페이스에서 10K 페이스 사이입니다.',
  },
  {
    q: '5km 빌드업은 어떻게 짜야 하나요?',
    a: '거리가 짧으면 가속할 시간이 부족하므로 <strong>마지막 자극(sprint finish)</strong> 프로파일이 잘 맞습니다. 1~4km는 E 페이스로 편하게, 마지막 1km만 M 또는 T 페이스로 올립니다. 프리셋 탭의 &lsquo;회복 후 5km 가벼운 자극&rsquo;이 이 구성(균등 5구간·끝 M 페이스)입니다.',
  },
  {
    q: '풀 마라톤 대비 빌드업은 언제 하나요?',
    a: '흔히 쓰는 흐름은 대회 <strong>6~8주 전 25km</strong>(후반 가속 후 마지막 5km를 M 페이스로), <strong>4~6주 전 20km</strong>(15km 편하게 + 마지막 5km M 페이스), <strong>1~2주 전 12km</strong>(E → M → HM → 10K 단계로 페이스 점검)입니다. 프리셋 탭의 &lsquo;풀 대비 20km·25km&rsquo;, &lsquo;풀 직전 12km 점검&rsquo;이 이 구성이며, 실제 일정은 주간 거리와 컨디션에 맞춰 조정하세요.',
  },
  {
    q: '트레드밀에서도 빌드업 가능한가요?',
    a: '가능합니다. 트레드밀은 속도(km/h)로 입력하므로 60 ÷ 페이스(분)로 환산합니다 — 5:00/km = 12.0 km/h, 5:30/km = 10.9 km/h, 6:00/km = 10.0 km/h. 바람 저항이 없어 같은 속도라도 야외보다 조금 쉬운데, 경사를 <strong>1%</strong>로 두면 야외 평지 달리기의 에너지 비용에 가장 가깝다는 연구가 있습니다(Jones &amp; Doust 1996, 약 5:42~3:20/km 속도 범위에서 측정).',
  },
  {
    q: '워치 포맷은 어떤 워치에서 쓰나요?',
    a: '이 도구는 &ldquo;2.0km @ 5:30/km&rdquo; 같은 <strong>단순 텍스트</strong>를 만들어 줍니다. 워치 제조사마다 가져오기 형식이 달라 파일로 바로 넣을 수는 없고, 가민 Connect의 워크아웃 만들기·COROS 앱 워크아웃 빌더·애플워치 운동 앱의 사용자 지정 운동에서 구간별 거리와 목표 페이스를 이 텍스트대로 입력하면 됩니다.',
  },
  {
    q: '안전성 체크가 빨강이면 절대 하면 안 되나요?',
    a: '금지가 아니라 <strong>설계를 다시 보라는 신호</strong>입니다. 빨강은 시작이 끝보다 빠르거나 같을 때, 끝이 5K 페이스보다 빠를 때, T 이상 구간이 전체 거리의 50%를 넘을 때, 15km 이상 세션에서 M보다 10초/km 넘게 빠른 구간이 8km 이상일 때 뜹니다. 페이스·거리·구간 수를 조정하거나 프리셋에서 수준에 맞는 것을 고르세요. 레이스 기록을 넣지 않으면 강도 관련 항목은 판정되지 않으므로 기록 입력을 권합니다. 통증이나 이상 징후가 있으면 즉시 중단하세요.',
  },
  {
    q: '인터벌 훈련 계산기·마라톤 기록 계산기와 무엇이 다른가요?',
    a: '이 도구는 <strong>오늘 한 번의 빌드업 세션</strong>(거리·프로파일·구간 페이스)을 설계합니다. 인터벌 페이스·400m 랩·4~16주 스케줄은 <a href="/tools/sports/interval-training">인터벌 훈련 계산기</a>, 기록 예측·환경 보정·목표 역산은 <a href="/tools/sports/race-predictor">마라톤 기록 계산기</a>, 단순 페이스↔시간 변환은 <a href="/tools/sports/pace">러닝 페이스 계산기</a>가 맡습니다.',
  },
  {
    q: '시작·끝 페이스가 같은데 프로파일마다 총 시간이 다른 이유는?',
    a: `각 구간 시간은 거리 × 구간 페이스라서, 느린 구간이 많을수록 총 시간이 늘어납니다. 10km·5구간·6:00 → 5:00 기준으로 균등 빌드업은 ${hms(EX_LINEAR.totalSec)}(평균 ${fmtPace(EX_LINEAR.avgPaceSec)}/km)이지만, 마지막 구간만 빨라지는 마지막 자극은 ${hms(EX_SPRINT.totalSec)}(평균 ${fmtPace(EX_SPRINT.avgPaceSec)}/km)입니다. 평균 페이스가 (시작 + 끝) ÷ 2 부근에 오는 것은 가속이 전 구간에 고르게 퍼진 균등·레이스 페이스 단계이고, 후반에 몰아서 빨라지는 <strong>마지막 자극·후반 집중은 같은 숫자를 넣어도 더 가벼운 세션</strong>입니다.`,
  },
]

export default function BuildupPage() {
  return (
    <ToolPage width={880} slug="/tools/sports/buildup">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />러닝 빌드업 계산기
      </h1>
      <p className="tp-lead">
        거리·페이스·구간·프로파일 → 구간별 페이스표와 <strong style={{ color: 'var(--text)' }}>워치 포맷</strong> 자동 + 안전성 체크.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="Daniels 훈련 페이스표를 재현하도록 잡은 도구 계수(VDOT 대비 E 59~74% · M 82% · T 88% · I 97% · R 106%)와 Daniels·Gilbert VDOT 식 — 마라톤 기록 계산기와 같은 계수"
        sources={[
          { label: "Daniels' Running Formula — Human Kinetics (도구 계수는 3판·2014 페이스표 기준, 링크는 현행 4판)", href: 'https://us.humankinetics.com/products/daniels-running-formula-4th-edition' },
          { label: 'VDOT O2 러닝 계산기 (Jack Daniels 공식)', href: 'https://vdoto2.com/calculator/' },
          { label: 'Seiler (2010) 지구성 훈련 강도 분포 — IJSPP', href: 'https://journals.humankinetics.com/view/journals/ijspp/5/3/article-p276.xml' },
          { label: 'Jones & Doust (1996) 트레드밀 1% 경사 — J Sports Sci', href: 'https://pubmed.ncbi.nlm.nih.gov/8887211/' },
        ]}
      />

      <BuildupClient />

      <GuideDivider />

      {/* 1. 빌드업 vs 인터벌 vs 템포런 */}
      <h2 className="g-h2">빌드업·인터벌·템포런 — 무엇이 다른가</h2>
      <p className="g-p">
        세 훈련 모두 빠른 구간이 들어가지만 구조와 노리는 효과가 다릅니다. 빌드업(progression run)은 쉬운 페이스로 시작해 끝으로 갈수록 빨라지므로, 이미 피로가 쌓인 상태에서 페이스를 올리는 연습이 됩니다. 레이스 후반에 무너지지 않는 감각을 기르는 데 쓰는 이유입니다.
      </p>
      <div className="tableScroll">
        <table style={{ ...TABLE, minWidth: 520 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['훈련', '구조', '주효과', '예시'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ['빌드업 (이 도구)', '점진적 가속 (E → T)', '페이스 조절·후반 지구력', '10km를 6:00 → 5:00/km'],
              ['인터벌', '고강도 + 회복 반복', 'V̇O₂max·심폐 자극', '800m × 6회 (회복 3분)'],
              ['템포런', '20~40분 일정 페이스', '젖산 역치 향상', '30분 @ T 페이스'],
            ].map((r, i) => (
              <tr key={i} style={ROW(i)}>
                <td style={{ ...TD, fontWeight: 700 }}>{r[0]}</td>
                <td style={TD}>{r[1]}</td>
                <td style={TD}>{r[2]}</td>
                <td style={{ ...TD, color: 'var(--muted)' }}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        인터벌 페이스·16주 훈련 스케줄은 <Link href="/tools/sports/interval-training" style={{ color: 'var(--accent-ink)' }}>인터벌 훈련 계산기</Link>에서 설계합니다.
      </p>

      {/* 2. 계산 방식 */}
      <h2 className="g-h2">구간 페이스는 이렇게 계산됩니다</h2>
      <p className="g-p">
        먼저 총거리를 구간으로 나눕니다. <strong>균등 N구간</strong>은 총거리 ÷ N씩, <strong>1km 단위</strong>는 1km씩 자르고 0.05km를 넘는 자투리는 마지막 구간으로 붙입니다. 그다음 구간 위치를 0(첫 구간)~1(마지막 구간)로 두고, <strong>첫 구간은 입력한 시작 페이스, 마지막 구간은 끝 페이스</strong>가 되도록 프로파일별 곡선으로 채웁니다.
      </p>
      <ul className="g-list">
        <li><strong>균등</strong> — 위치에 비례해 같은 폭으로 빨라집니다(선형 보간).</li>
        <li><strong>후반 집중</strong> — 위치 70%까지는 시작 페이스를 유지하고, 70~100% 사이에서 끝 페이스까지 선형으로 올립니다.</li>
        <li><strong>마지막 자극</strong> — 위치 80%까지 시작 페이스, 마지막 20%에서만 가속합니다. 5구간이면 마지막 1구간만 빨라집니다.</li>
        <li><strong>레이스 페이스 단계</strong> — 시작(E)과 끝(10K) 사이의 0·35·65·100% 지점에 E·M·HM·10K 페이스를 놓습니다. 4구간이면 그대로, 5구간 이상이면 네 단계 사이를 보간하고, 3구간 이하면 균등으로 대체됩니다.</li>
      </ul>
      <p className="g-p">
        구간 시간은 <strong>구간 거리 × 구간 페이스</strong>, 평균 페이스는 <strong>총시간 ÷ 총거리</strong>입니다. 웜업·쿨다운 거리는 시작 페이스로 계산해 세션 총시간에 더하므로, 실제로 더 천천히 몸을 풀면 전체 시간이 조금 늘어납니다.
      </p>

      {/* 3. 프로파일 비교 — 빌드 시 계산 */}
      <h2 className="g-h2">4가지 프로파일 비교 — 10km, 6:00 → 5:00 기준</h2>
      <p className="g-p">
        도구의 기본값(10km·균등 5구간·6:00 → 5:00/km)을 네 프로파일에 똑같이 넣은 결과입니다. 시작과 끝이 같아도 가운데 구간이 달라서 총시간과 강도가 달라집니다. 강도(E·M·T)는 10K 48:00 기록(VDOT {EX_VDOT.toFixed(1)})을 기준으로 도구가 분류한 값입니다.
      </p>
      <div className="tableScroll">
        <table style={{ ...TABLE, minWidth: 620 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={TH}>프로파일</th>
              {EX_SEGS.map((_, i) => <th scope="col" key={i} style={TH}>{i + 1}구간</th>)}
              <th scope="col" style={TH}>총시간</th>
              <th scope="col" style={TH}>평균</th>
            </tr>
          </thead>
          <tbody>
            {PROFILE_ROWS.map(({ p, r }, i) => (
              <tr key={p} style={ROW(i)}>
                <th scope="row" style={{ ...TD, fontWeight: 700, textAlign: 'left' }}>{PROFILE_LABEL[p]}</th>
                {r.segments.map((s) => (
                  <td key={s.index} style={TDN}>{fmtPace(s.paceSec)}<span style={{ color: 'var(--muted)', fontSize: 11 }}> {s.intensity}</span></td>
                ))}
                <td style={{ ...TDN, fontWeight: 700 }}>{hms(r.totalSec)}</td>
                <td style={TDN}>{fmtPace(r.avgPaceSec)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">구간 거리는 모두 2km. 페이스는 분:초/km, 총시간은 웜업·쿨다운 제외.</p>
      <ul className="g-list">
        <li><strong>균등</strong> — 가장 단순하고 모든 거리에 무난합니다. 10km 5구간이 대표적인 형태입니다.</li>
        <li><strong>후반 집중</strong> — 앞부분을 편하게 쌓고 마지막 30%만 올립니다. 하프·풀 대비 장거리 빌드업에 맞습니다.</li>
        <li><strong>마지막 자극</strong> — 회복 주간이나 평일 짧은 달리기에 가벼운 자극만 줄 때 씁니다. 같은 숫자로 가장 쉬운 세션이 됩니다.</li>
        <li><strong>레이스 페이스 단계</strong> — E·M·HM·10K를 차례로 밟아 레이스 페이스 감각을 익힙니다. 4구간일 때 설계 의도와 정확히 맞습니다.</li>
      </ul>

      {/* 4. VDOT별 강도 페이스 — 빌드 시 계산 */}
      <h2 className="g-h2">VDOT별 강도 페이스 참고표</h2>
      <p className="g-p">
        시작·끝 페이스를 정할 때 기준이 되는 값입니다. 레이스 기반 탭과 같은 식(Daniels·Gilbert VDOT, 도구 강도 계수 E 59~74%·M 82%·T 88%)으로 계산했습니다. 최근 10K 기록이 가장 가까운 행을 찾아 <strong>끝을 T 페이스 근처로</strong> 잡으면 10km·균등 5구간 기준으로 경고 없이 통과합니다. 다만 VDOT 35 이하에서 E의 느린 끝으로 시작하면 시작·끝 격차가 120초/km를 넘어 &lsquo;페이스 격차 큼&rsquo;(주황)이 뜨므로, 이 구간에서는 E 범위의 빠른 쪽에서 시작하세요. 끝을 10K 기록 페이스(10K 기록 ÷ 10)까지 올리면 VDOT 45 이상에서는 5K 페이스와 10초/km 이내라 &lsquo;매우 강한 빌드업&rsquo;(주황)이 뜹니다. 5K 페이스 열은 경고 기준선으로, 끝 페이스가 여기에 10초/km 이내로 다가가면 주황, 5초/km 넘게 빠르면 빨강입니다.
      </p>
      <div className="tableScroll">
        <table style={{ ...TABLE, minWidth: 560 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['VDOT', '10K 기록', 'E (쉬움)', 'M (마라톤)', 'T (역치)', '5K 페이스'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {VDOT_ROWS.map((r, i) => (
              <tr key={r.v} style={ROW(i)}>
                <th scope="row" style={{ ...TDN, fontWeight: 700, textAlign: 'left', color: 'var(--accent-ink)' }}>{r.v}</th>
                <td style={TDN}>{hms(r.tenK)}</td>
                <td style={TDN}>{fmtPace(r.eSlow)}~{fmtPace(r.eFast)}</td>
                <td style={TDN}>{fmtPace(r.m)}</td>
                <td style={TDN}>{fmtPace(r.t)}</td>
                <td style={TDN}>{fmtPace(r.fiveK)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">페이스 단위 분:초/km. 5K 페이스는 같은 VDOT의 5K 예상 기록 ÷ 5.</p>
      <p className="g-p">
        예를 들어 10K를 48:00에 달리면 VDOT은 {EX_VDOT.toFixed(1)}이고, 기본 설계(6:00 → 5:00 균등)의 구간은 위 비교표처럼 {EX_LINEAR.segments.map((s) => s.intensity).join('·')}로 분류됩니다. 도구는 인접한 두 강도 페이스의 <strong>중간값을 경계</strong>로 쓰기 때문에, E의 느린 끝과 M 페이스의 중간({fmtPace(EX_MID_EM)}/km)보다 빠른 구간은 E 범위 안이라도 M으로 표시됩니다. 끝 페이스 5:00은 5K 예상 페이스보다 충분히 느려 경고 없이 &lsquo;균형 잡힌 빌드업&rsquo;으로 나옵니다.
      </p>

      {/* 5. 거리·목적별 표준 */}
      <h2 className="g-h2">거리·목적별 빌드업 표준</h2>
      <div className="tableScroll">
        <table style={{ ...TABLE, minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['거리', '구간', '추천 프로파일', '활용'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ['3~5km', '3~5구간', '마지막 자극', '회복 후 첫 자극·입문자'],
              ['6~8km', '4~6구간', '균등 / 후반 집중', '평일 자극주'],
              ['10km', '5구간 (2km씩)', '균등', '가장 표준적·10K 대비'],
              ['14~16km', '4구간', '레이스 페이스 단계', '하프 준비'],
              ['18~25km', '4~5구간', '후반 집중', '풀 마라톤 장거리'],
            ].map((r, i) => (
              <tr key={i} style={ROW(i)}>
                <td style={{ ...TD, fontWeight: 700 }}>{r[0]}</td>
                <td style={TD}>{r[1]}</td>
                <td style={TD}>{r[2]}</td>
                <td style={{ ...TD, color: 'var(--muted)' }}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout tone="tip">
        프리셋 탭의 12개 예시(일반 러닝 훈련 원칙 기반)는 한 번 클릭으로 설계 탭에 적용됩니다. 레이스 기록을 먼저 넣으면 프리셋 페이스가 본인 VDOT에 맞춰 다시 계산됩니다.
      </Callout>

      {/* 6. 안전성 체크 기준 */}
      <h2 className="g-h2">안전성 체크 — 경고가 뜨는 조건</h2>
      <p className="g-p">
        결과 아래의 안전성 체크는 아래 조건을 그대로 적용합니다. 강도 관련 항목(비율·장거리)은 레이스 기록으로 VDOT을 추정했을 때만 판정되고, 아무 조건에도 걸리지 않으면 &lsquo;균형 잡힌 빌드업&rsquo;이 표시됩니다.
      </p>
      <div className="tableScroll">
        <table style={{ ...TABLE, minWidth: 520 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['항목', '조건', '표시'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ['가속 방향', '시작 페이스 ≤ 끝 페이스 (빨라지지 않음)', '빨강'],
              ['페이스 격차', '시작 − 끝 > 120초/km', '주황'],
              ['페이스 격차', '시작 − 끝 < 30초/km', '초록 (가벼운 빌드업)'],
              ['끝 페이스', '5K 페이스보다 5초/km 넘게 빠름', '빨강 (인터벌 영역)'],
              ['끝 페이스', '5K 페이스와 10초/km 이내', '주황'],
              ['고강도 비율', 'T·I·R 구간이 총거리의 50% 초과 / 35% 초과', '빨강 / 주황'],
              ['마지막 구간', '5km 이상인 마지막 구간이 I·R 강도', '주황'],
              ['장거리 과속', '총 15km 이상에서 M보다 10초/km 넘게 빠른 구간 합계 8km 이상', '빨강'],
            ].map((r, i) => (
              <tr key={i} style={ROW(i)}>
                <td style={{ ...TD, fontWeight: 700, whiteSpace: 'nowrap' }}>{r[0]}</td>
                <td style={TD}>{r[1]}</td>
                <td style={{ ...TD, whiteSpace: 'nowrap' }}>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>표에 걸리는 설계는 대개 아래 다섯 가지 실수에서 나옵니다.</p>
      <ol className="g-list">
        <li><strong>시작이 너무 빠름</strong> — E 페이스보다 빠르게 출발하면 후반에 올릴 여력이 없습니다. 대화가 편한 속도에서 시작하세요.</li>
        <li><strong>끝이 5K 페이스 이하</strong> — 빌드업은 레이스가 아닙니다. 끝은 T 페이스 근처가 표준이고, 10K 페이스까지 올리면 강한 세션으로 봐야 합니다.</li>
        <li><strong>격차가 너무 큼</strong> — 6:30 → 4:00처럼 120초/km를 넘는 가속은 적응이 어렵습니다. 90초/km 안쪽으로 줄이거나 거리·구간을 늘리세요.</li>
        <li><strong>고강도 구간이 절반 이상</strong> — 후반 절반 이상이 T·I 강도면 사실상 인터벌입니다. 고강도는 마지막 20~30%로 제한하세요.</li>
        <li><strong>힘든 훈련 다음날 강한 빌드업</strong> — 전날 장거리·인터벌을 했다면 회복형 프리셋이나 휴식이 낫습니다.</li>
      </ol>

      {/* 7. 회복 */}
      <h2 className="g-h2">빌드업 후 회복과 주간 배치</h2>
      <ul className="g-list">
        <li><strong>쿨다운</strong> — 빌드업 직후 5~10분은 E 페이스보다 느리게 조깅하거나 걸으며 호흡과 심박을 내립니다.</li>
        <li><strong>스트레칭</strong> — 정적 스트레칭 5~10분(햄스트링·종아리·고관절 굴근).</li>
        <li><strong>다음날</strong> — E 페이스 30~40분 회복 달리기 또는 휴식. 강한 빌드업을 연달아 넣지 않습니다.</li>
        <li><strong>주간 빈도</strong> — 엘리트 지구성 선수들의 훈련을 모은 분석(Seiler 2010)에서 세션의 약 80%는 저강도, 20% 정도만 고강도였습니다. 주 4~5회 달린다면 빌드업·인터벌을 합친 고강도 세션은 주 1회 정도가 이 비율에 맞습니다(주 2회는 달리는 횟수가 더 많을 때). 같은 주에 인터벌이 있으면 빌드업을 마지막 자극 프로파일처럼 가볍게 바꾸세요.</li>
      </ul>
      <Callout tone="warn">
        통증이나 평소와 다른 심한 피로가 있으면 페이스와 관계없이 즉시 멈추고 쉬세요. 부상이 의심되면 정형외과·재활의학과 진료를 받는 것이 우선입니다.
      </Callout>

      <Faq items={FAQ_LD} />

      {/* 면책 */}
      <Disclaimer variant="safety" open>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li>본 도구는 <strong>일반 빌드업 설계 가이드</strong>입니다. 페이스·거리 추천은 평균값 — 컨디션·날씨·지형에 따라 조정.</li>
          <li>안전성 체크는 일반 가이드 — 본인 한계 보장 X.</li>
          <li>본 도구는 <strong>부상 진단·영양 자문·신발/기어 추천·약물/도핑 정보</strong>를 제공하지 않습니다.</li>
          <li>인터벌·16주 훈련 스케줄은 <Link href="/tools/sports/interval-training" style={{ color: 'var(--accent-ink)' }}>인터벌 훈련 계산기</Link>.</li>
          <li>통증·심한 피로 시 즉시 휴식. 부상 의심 시 정형외과·재활의학과.</li>
          <li>도움 받기: 한국스포츠의학회 / 정형외과·재활의학과 / 응급 119.</li>
        </ul>
      </Disclaimer>

      {/* 함께 쓰면 좋은 도구 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/sports/race-predictor" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏅</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>마라톤 기록 예측</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>VDOT·환경 보정·역산</div>
        </Link>
        <Link href="/tools/sports/interval-training" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃‍♂️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>인터벌 훈련 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>16주 스케줄·인터벌 페이스</div>
        </Link>
        <Link href="/tools/sports/pace" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>러닝 페이스 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>페이스↔시간 변환</div>
        </Link>
        <Link href="/tools/sports/one-rm" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏋️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>1RM 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>러너 근력 보강</div>
        </Link>
        <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량(BMR)</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>훈련일 칼로리</div>
        </Link>
        <Link href="/tools/date/dday" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📅</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>D-day 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>대회 일정 추적</div>
        </Link>
      </div>
    </ToolPage>
  )
}
