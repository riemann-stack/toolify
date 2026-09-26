import Link from 'next/link'
import CycleClient from './CycleClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import { ovulationDayOf, phaseDayBounds, calcCycle, analyzeRecords, fmtMonthDay, PHASE_META } from './cycleUtils'

export const metadata = buildMetadata({
  path: '/tools/health/cycle',
  title: '생리주기·배란일 계산기 — 다음 생리·가임기·PMS 시각화·컨디션 가이드',
  description: '마지막 생리일·평균 주기 → 다음 생리·배란·가임기·PMS를 원형·월간 캘린더로 시각화 + 4단계 phase별 컨디션 가이드.',
  keywords: ['생리주기 계산기', '배란일 계산기', '가임기 계산기', 'PMS 계산기', '생리예정일 계산기', '월경주기 계산기', '난포기 황체기', '생리주기 캘린더', '여성 주기 트래킹', 'menstrual cycle calculator'],
})

/* ── 본문 표·예시 = 계산기와 같은 cycleUtils로 빌드 시 생성 (표와 계산기 값 영구 일치) ── */
const CYCLE_LENGTHS = [21, 24, 26, 28, 30, 32, 35, 40, 45]
const DEFAULT_PERIOD = 5
const CYCLE_ROWS = CYCLE_LENGTHS.map(c => {
  const ov = ovulationDayOf(c)
  return { c, ov, fs: ov - 5, fe: ov + 1, pmsStart: c - 6, pmsEnd: c, overlapsPeriod: ov - 5 <= DEFAULT_PERIOD }
})
const B28 = phaseDayBounds(DEFAULT_PERIOD, 28)
const PHASE_ROWS = [
  { phase: 'menstrual' as const, days: `1~${B28.mEnd - 1}일`, feat: '자궁내막이 떨어져 나오는 시기 · 피로·복통이 흔함 · 가벼운 운동과 휴식 위주' },
  { phase: 'follicular' as const, days: `${B28.mEnd}~${B28.oStart - 1}일`, feat: '난포가 자라며 에스트로겐이 오르는 시기 · 컨디션이 회복되는 편' },
  { phase: 'ovulation' as const, days: `${B28.oStart}~${B28.oEnd - 1}일`, feat: '배란 예상일(15일째)과 앞뒤 하루씩, 3일 · 투명하고 잘 늘어나는 분비물·일부 배란통(중간통)' },
  { phase: 'luteal' as const, days: `${B28.oEnd}~28일`, feat: '프로게스테론 우세 · 배란 뒤 기초체온이 약 0.2~0.5°C 높게 유지 · 후반부 PMS 가능' },
]
/* 예시 ① 9월 1일 시작·30일 주기·오늘 9월 10일 / ② 같은 조건에서 7월 1일을 입력(두 주기 경과) */
const EX = calcCycle({ lastPeriod: new Date(2026, 8, 1), periodLength: DEFAULT_PERIOD, avgCycle: 30, today: new Date(2026, 8, 10) })
const EX_OLD = calcCycle({ lastPeriod: new Date(2026, 6, 1), periodLength: DEFAULT_PERIOD, avgCycle: 30, today: new Date(2026, 8, 10) })
/* 예시 ③ 내 기록 탭 — 생리 시작일 5번 기록 */
const REC_DATES = ['2026-05-01', '2026-05-30', '2026-06-30', '2026-07-27', '2026-08-29']
const REC = analyzeRecords(REC_DATES.map((date, i) => ({ id: `ex${i}`, date, isPeriodStart: true })))

const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const tableWrap: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  marginBottom: '14px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}

const FAQ_LD = [
  { q: "평균 주기 28일이 아닌데 정상인가요?", a: "미국 NICHD는 성인의 정상 주기를 <strong>21~35일</strong>로 보고, 초경 후 몇 년 동안의 청소년은 최대 45일까지도 흔합니다(영국 NHS는 21~40일도 흔하다고 안내). \"28일\"은 평균값일 뿐이며, 본인의 일정한 리듬(예: 항상 26일 또는 32일)이 있으면 정상입니다. 21일 미만이거나 성인이 35일을 꾸준히 넘으면 산부인과 상담을 권합니다. 같은 사람이 매월 들쭉날쭉하면(이 도구 기준 변동폭 ±8일 이상) 상담을 권장합니다." },
  { q: "가임기는 어떻게 계산하나요?", a: "이 도구는 <strong>배란 예상일 5일 전부터 1일 후까지</strong>를 가임기로 봅니다. 정자는 몸속에서 최대 5일, 난자는 배란 뒤 약 24시간 동안 수정이 가능하기 때문입니다. 배란 예상일은 황체기 길이가 비교적 일정하다는 점을 이용해 <strong>다음 생리 예정일에서 14일을 빼서</strong> 구합니다(28일 주기라면 15일째). 통계적 평균이라 실제 배란일은 ±2일 이상 달라질 수 있고, 정확한 확인은 산부인과 초음파나 LH 검사로 합니다." },
  { q: "본 도구를 피임으로 써도 되나요?", a: "절대 비추천입니다. 달력·기초체온·분비물 관찰 같은 주기 기반 피임(가임인지법)은 방법과 실천에 따라 일반적인 사용 실패율 편차가 크고 높은 편입니다(미국 CDC 기준 대략 2~23%대). 배란일은 스트레스·수면·체중·여행 등으로 ±2일 이상 변동할 수 있습니다. 본 도구는 참고 정보만 제공합니다. 피임 방법은 산부인과 상담이 필수입니다(호르몬·기구·자연 등 다양한 옵션). 보건복지상담센터 129." },
  { q: "주기가 들쭉날쭉한데 어떻게 해야 하나요?", a: "본 도구의 주기 규칙성에서 \"많이 불규칙\"을 선택하면 안내가 표시됩니다. 변동폭이 ±3일 이내면 정상(규칙적)이고, ±4~7일이면 약간 불규칙이므로 스트레스·체중 변화를 점검하세요. ±8일 이상이면 불규칙으로 산부인과 상담을 권장합니다(PCOS·갑상선·조기난소부전 등 가능성). 내 기록 탭에서 매번 생리 시작일을 체크하면 본인 변동폭이 자동 분석됩니다." },
  { q: "PMS는 무엇이고 언제 산부인과 가야 하나요?", a: "PMS(생리전증후군)는 생리 시작 1주~며칠 전부터 나타나는 몸과 기분의 변화입니다. 생리 전 증상을 한두 가지라도 겪는 사람은 대다수이지만, 진단 기준을 충족할 만큼 일상에 영향을 주는 PMS는 연구에 따라 20~30%대, 가장 심한 형태인 월경전불쾌장애(PMDD)는 수 % 수준으로 보고됩니다(조사 기준에 따라 폭이 큼). 붓기·기분 변화·식욕 증가 같은 흔한 증상은 이 도구의 컨디션 가이드를 참고해 관리할 수 있습니다. 출근이나 대인관계가 힘들 만큼 일상에 큰 지장을 준다면 PMDD일 수 있으니 산부인과나 정신건강의학과 상담을 권합니다(보건복지상담센터 129)." },
  { q: "임신 테스트기는 언제 사용하면 정확한가요?", a: "<strong>생리 예정일이 지난 뒤</strong>에 쓰는 편이 더 정확합니다. 너무 일찍 검사하면 임신이어도 음성이 나올 수 있어, 음성 결과만으로 임신이 아니라고 확정할 수는 없습니다. 이 도구의 가임기 참고 탭에서 임신 준비 중을 선택하면 생리 예정일을 기준으로 안내하며, 정확한 진단은 산부인과의 혈액(hCG) 검사와 초음파로 합니다." },
  { q: "황체기에 체중이 늘어요. 살이 찐 건가요?", a: "생리 직전에는 호르몬 영향으로 몸에 수분이 머물러 <strong>체중이 일시적으로 1~2kg 안팎 늘었다가 생리가 시작되면 빠지는 일이 흔합니다</strong>. 소화·식욕이 달라지는 것도 영향을 주며, 지방이 늘어난 것이 아닌 경우가 많습니다. 체중 추세는 주간 평균으로 보고, 다이어트 중이라면 황체기에는 유지에 집중하고 난포기에 감량을 이어가 보세요." },
  { q: "생리 기간(일수)을 바꾸면 결과가 어떻게 달라지나요?", a: "생리 기간은 원형 차트·월간 캘린더의 <strong>'생리기' 구간 길이와, 그에 따라 오늘이 어느 phase로 분류되는지(원형 차트 가운데 표시·컨디션 가이드)</strong>만 바꿉니다. 예를 들어 주기 6일째는 생리 기간 5일이면 난포기, 7일이면 생리기로 표시됩니다. 다음 생리 예정일·배란 예상일·가임기·PMS 예상 구간은 마지막 생리 시작일과 평균 주기만으로 정해지므로, 생리 기간을 3일에서 7일로 바꿔도 이 날짜들은 그대로입니다. 다만 주기가 짧고 생리가 긴 경우(예: 21일 주기·7일 생리)에는 생리기가 배란기 바로 앞까지 이어져 원형 차트에서 난포기 구간이 사라질 수 있는데, 이는 오류가 아니라 짧은 주기에서 실제로 생길 수 있는 겹침입니다." },
  { q: "본 도구와 임신 주수 계산기 차이는?", a: "쓰는 시기가 다릅니다. 이 도구는 <strong>임신 전</strong> 주기를 기록하고 다음 생리·가임기를 가늠하는 용도이고, <a href=\"/tools/health/pregnancy\">임신 주수 계산기</a>는 <strong>임신을 확인한 뒤</strong> 주수·태아 발달·검사 일정·출산 준비를 보는 용도입니다. 가임기 참고로 준비하다가 임신이 확인되면 임신 주수 계산기로 넘어가면 됩니다." },
  { q: "청소년인데 사용해도 되나요?", a: "본 도구는 일반 주기 트래킹 도구이므로 누구나 사용할 수 있습니다. 다만 초경 후 2~3년은 주기가 매우 불규칙한 것이 정상이고, 심한 통증이나 과다 출혈이 있으면 부모와 함께 산부인과를 찾으세요. 임신·피임 관련 정보는 전문가 상담이 우선입니다(학교 보건교사·소아청소년과·산부인과). 청소년 상담 1388(24시간)·보건복지상담센터 129를 이용할 수 있습니다. 본 도구는 의료 상담을 대체하지 않습니다." }
]

export default function CyclePage() {
  return (
    <ToolPage width={880} slug="/tools/health/cycle">
      <h1 className="tp-h1">
        <ToolIconBadge catId="health" />생리주기·배란일 계산기
      </h1>
      <p className="tp-lead">
        마지막 생리일과 평균 주기로 다음 생리·배란·가임기를 <strong style={{ color: 'var(--text)' }}>원형 시각화</strong> + phase별 컨디션.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="황체기 14일 고정 모델 — 배란일 = 다음 생리 −14일, 가임기 = 배란 −5일~+1일(정자 생존 최대 5일·난자 약 24시간), 정상 주기 성인 21~35일(NICHD)·청소년 최대 45일, 무월경 = 임신 아닌데 3개월 이상 생리 없음"
        sources={[
          { label: 'NICHD — Menstruation', href: 'https://www.nichd.nih.gov/health/topics/menstruation/conditioninfo' },
          { label: 'NICHD — 월경 불순(Menstrual irregularities)', href: 'https://www.nichd.nih.gov/health/topics/menstruation/conditioninfo/irregularities' },
          { label: 'ACOG — 가임인지법(FABM)', href: 'https://www.acog.org/womens-health/faqs/fertility-awareness-based-methods-of-family-planning' },
          { label: 'Wilcox 외, BMJ 2000 — 가임창 시기 전향 연구', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC27529/' },
        ]}
      />

      <CycleClient />

      <GuideDivider />

      {/* 1. 계산 원리 + 예시 */}
      <h2 className="g-h2">이 계산기가 날짜를 구하는 방법</h2>
      <p className="g-p">
        입력은 <strong>마지막 생리 시작일</strong>·<strong>평균 주기</strong>·<strong>생리 기간</strong> 세 가지뿐이고, 모든 날짜는 아래 네 줄의 식으로 나옵니다.
        배란 뒤 다음 생리까지의 황체기는 사람마다 비교적 일정(평균 약 14일)한 반면 생리 시작부터 배란까지의 난포기는 길이가 크게 달라지기 때문에,
        이 도구는 &lsquo;다음 생리 예정일에서 거꾸로 14일&rsquo;을 배란 예상일로 잡습니다.
      </p>
      <ul className="g-list">
        <li><strong>다음 생리 예정일</strong> = 마지막 생리 시작일 + 평균 주기</li>
        <li><strong>배란 예상일</strong> = 다음 생리 예정일 − 14일 (주기 &lsquo;평균 주기 − 13&rsquo;일째, 28일 주기면 15일째)</li>
        <li><strong>가임기</strong> = 배란 예상일 5일 전 ~ 1일 후 (7일)</li>
        <li><strong>PMS 예상 구간</strong> = 다음 생리 예정일 7일 전 ~ 1일 전</li>
      </ul>
      <p className="g-p">
        예를 들어 9월 1일에 생리를 시작했고 평균 주기가 30일, 오늘이 9월 10일이라면 오늘은 주기 {EX.dayInCycle}일째({PHASE_META[EX.phase].label})이고,
        다음 생리 예정일은 <strong>{fmtMonthDay(EX.nextPeriodDate)}</strong>, 배란 예상일은 <strong>{fmtMonthDay(EX.ovulationDate)}</strong>,
        가임기는 {fmtMonthDay(EX.fertilityStart)}~{fmtMonthDay(EX.fertilityEnd)}, PMS 예상 구간은 {fmtMonthDay(EX.pmsStart)}~{fmtMonthDay(EX.pmsEnd)}입니다.
        계산기에 같은 값을 넣으면 같은 날짜가 나옵니다.
      </p>
      <p className="g-p">
        마지막 생리일을 한동안 기록하지 않아 오래된 날짜를 넣어도 예정일이 과거로 나오지 않습니다. 같은 조건에서 7월 1일을 입력하면
        평균 주기({EX_OLD.cycleLength}일)만큼씩 {EX_OLD.cyclesSinceLog}주기가 지난 것으로 보고 가장 최근 추정 시작일부터 다시 계산해,
        다음 생리 예정일 {fmtMonthDay(EX_OLD.nextPeriodDate)}·배란 예상일 {fmtMonthDay(EX_OLD.ovulationDate)}을 보여 줍니다.
        다만 이 보정은 &lsquo;그동안 주기가 평균대로 왔다&rsquo;는 가정이라, 실제 시작일을 알면 그 날짜로 고쳐 넣는 편이 훨씬 정확합니다.
      </p>

      {/* 2. 주기 길이별 일차표 */}
      <h2 className="g-h2">주기 길이별 배란 예상일·가임기 일차표</h2>
      <p className="g-p">
        위 식을 주기 길이별로 풀어 본 표입니다(생리 시작일 = 1일째). 황체기를 14일로 고정했기 때문에 주기가 길어지면 배란과 가임기가 그만큼 뒤로 밀리고,
        주기가 짧으면 앞당겨집니다. 주기 차이는 대부분 난포기 길이 차이라는 뜻입니다.
      </p>
      <div className="tableScroll" style={tableWrap}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>평균 주기</th>
              <th scope="col" style={headCell}>배란 예상</th>
              <th scope="col" style={headCell}>가임기</th>
              <th scope="col" style={headCell}>PMS 예상</th>
            </tr>
          </thead>
          <tbody>
            {CYCLE_ROWS.map(r => (
              <tr key={r.c}>
                <td style={{ ...cell, fontWeight: 700 }}>{r.c}일</td>
                <td style={cell}>{r.ov}일째</td>
                <td style={cell}>{r.fs}~{r.fe}일째{r.overlapsPeriod && <span style={{ color: 'var(--muted)' }}> · 생리 기간과 겹칠 수 있음</span>}</td>
                <td style={cell}>{r.pmsStart}~{r.pmsEnd}일째</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p">
        짧은 주기에서는 가임기가 생리 중이나 직후에 시작할 수 있다는 점을 표가 보여 줍니다(21일 주기는 3일째부터). &lsquo;생리 직후는 안전하다&rsquo;는 통념이
        모든 사람에게 맞지 않는 이유입니다. 반대로 40일 이상 긴 주기에서는 배란이 한 달의 후반으로 밀려, 28일 기준 앱이나 달력으로 짐작한 날짜와 1~2주씩 어긋날 수 있습니다.
      </p>
      <Callout tone="note" title="평균 모델의 한계 — 실제 가임창은 더 넓게 퍼진다">
        소변 호르몬으로 배란일을 직접 확인한 전향 연구(Wilcox 외, BMJ 2000 · 여성 221명·696주기)에서, 가임창(배란일로 끝나는 6일)이
        흔히 안내되는 10~17일째 안에 전부 들어온 경우는 약 30%에 그쳤고, 6~21일째의 어느 날이든 가임창일 확률이 최소 10%였습니다.
        주기가 규칙적인 사람도 배란일이 예측과 다를 수 있으니, 이 표와 계산 결과는 &lsquo;가장 가능성이 높은 날&rsquo;로만 읽으세요.
      </Callout>

      {/* 3. 4 phase 가이드 */}
      <h2 className="g-h2">4단계 phase 가이드 (생리주기 변화)</h2>
      <p className="g-p">
        평균 28일 주기·생리 5일 기준으로 계산기가 나누는 네 구간입니다. 배란기는 배란 예상일 하루 전부터 하루 뒤까지 3일로 표시하며, 구간 경계는 입력한 주기와 생리 기간에 맞춰 자동으로 바뀝니다.
      </p>
      <div className="tableScroll" style={tableWrap}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>Phase</th>
              <th scope="col" style={headCell}>일자 (28일 기준)</th>
              <th scope="col" style={headCell}>일반 특징</th>
            </tr>
          </thead>
          <tbody>
            {PHASE_ROWS.map(r => (
              <tr key={r.phase}>
                <td style={cell}><strong style={{ color: PHASE_META[r.phase].ink }}>{PHASE_META[r.phase].label}</strong></td>
                <td style={cell}>{r.days}</td>
                <td style={cell}>{r.feat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout tone="tip">
        컨디션 가이드 탭은 이 구간 구분에 러닝·다이어트·수면 중 선택한 생활 방식을 겹쳐 오늘 phase에 맞는 운동 강도·식사·수면 팁을 보여 줍니다. 컨디션 변화는 개인차가 크므로 본인 기록과 함께 보세요.
      </Callout>

      {/* 4. 평균 주기 28일 ≠ 모두 */}
      <h2 className="g-h2">평균 주기 28일 ≠ 모두 — 성인 21~35일·청소년 ~45일</h2>
      <p className="g-p">
        교과서에서 흔히 말하는 &ldquo;28일 주기&rdquo;는 <strong>평균값</strong>일 뿐입니다.
        미국 NICHD는 성인의 일반적인 주기를 <strong>21~35일</strong>로 보고, 초경 후 몇 년 동안의 <strong>청소년은 최대 45일까지</strong>도 흔합니다.
        의학적으로는 35일보다 긴 간격을 희발월경, 21일보다 짧은 간격을 빈발월경이라 부르며, 임신이 아닌데 3개월 이상 생리가 없으면 무월경으로 봅니다.
        본인의 일정한 리듬이 있다면 28일이 아니어도 괜찮습니다.
      </p>
      <ul className="g-list">
        <li>21일 미만: 너무 짧음 → 산부인과 상담</li>
        <li>21~35일: 성인 정상 범위 (본인 평균을 기억해 두기)</li>
        <li>36~45일: 청소년은 정상일 수 있음 · 성인은 다소 길어 상담 고려</li>
        <li>45일 초과: 너무 김 → 산부인과 상담 (계산기 입력 범위도 21~45일)</li>
        <li>변동폭 ±8일 이상: 불규칙 → 산부인과 상담</li>
      </ul>

      {/* 5. 기록 분석 */}
      <h2 className="g-h2">기록으로 내 평균 주기·규칙성 확인하기</h2>
      <p className="g-p">
        &lsquo;평균 주기&rsquo;를 모르겠다면 내 기록 탭에서 생리가 시작한 날마다 &lsquo;생리 시작&rsquo;을 체크해 두세요. 시작일이 두 번 이상 쌓이면
        이웃한 시작일 사이의 일수를 주기로 계산해 평균과 변동폭(가장 긴 주기 − 가장 짧은 주기)을 보여 줍니다.
        같은 생리를 연달아 체크한 경우(간격 15일 미만)는 한 번으로 합치고, 간격이 60일을 넘으면 중간 기록이 빠진 것으로 보고 평균에서 뺍니다.
      </p>
      <p className="g-p">
        예를 들어 시작일을 5월 1일·5월 30일·6월 30일·7월 27일·8월 29일로 기록했다면 주기는 {REC ? REC.cycles.join('·') : ''}일,
        평균 {REC ? Math.round(REC.avg) : ''}일, 변동폭 {REC ? REC.variance : ''}일로 &lsquo;규칙적&rsquo;으로 판정됩니다(변동폭 6일 이하 = ±3일 이내 규칙적,
        7~15일 = 약간 불규칙, 16일 이상 = 불규칙). 이 평균을 캘린더 탭의 평균 주기에 넣으면 예측이 본인 리듬에 맞춰집니다.
        기록이 3~6회 이상 쌓일수록 평균이 안정되며, NICHD는 주기 간 차이가 20일을 넘는 경우를 불규칙 월경의 예로 듭니다 — 이 도구는 그보다 이른 단계(변동폭 16일 이상)에서 상담을 권합니다.
      </p>

      {/* 6. 피임이 될 수 없는 이유 */}
      <h2 className="g-h2">가임기 계산이 피임 수단이 될 수 없는 이유</h2>
      <p className="g-p">
        달력·기초체온·분비물 관찰 등 가임인지법은 미국 CDC 자료에서 일반적인 사용 시 1년 실패율이 방법에 따라 약 2~23%로 폭이 큽니다(달력만 쓰는 방법은 이 범위의 높은 쪽). 피임 목적으로 설계된 달력법조차
        이 도구보다 훨씬 넓은 구간을 조심합니다. 예컨대 표준일수법(Standard Days Method)은 주기가 26~32일로 일정한 사람만 쓰도록 제한하고,
        그 안에서도 <strong>8~19일째 12일 전체</strong>를 가임 가능일로 봅니다. 이 도구의 가임기는 배란 예상일 5일 전부터 1일 뒤까지 7일이라 피임 판단에 쓰기에는 너무 좁습니다.
      </p>
      <p className="g-p">
        임신을 준비하는 경우에도 날짜 예측만으로는 한계가 있습니다. 배란 여부를 더 직접적으로 확인하려면 배란 직전의 LH 급상승을 잡는 배란 테스트기,
        배란 뒤 체온이 오른 상태로 유지되는지 보는 기초체온 기록, 분비물 변화 관찰을 함께 쓰고, 1년(35세 이상은 6개월) 이상 임신이 되지 않으면 산부인과 상담을 받는 것이 일반적인 권고입니다.
      </p>

      {/* 7. PMS 일반 가이드 */}
      <h2 className="g-h2">PMS·생리전증후군 일반 가이드</h2>
      <p className="g-p">
        PMS(Premenstrual Syndrome)는 생리 시작 1주~수일 전부터 나타나 생리가 시작되면 사라지는 신체·정서 변화입니다. 증상을 한두 가지라도 겪는 사람은 대다수이지만,
        진단 기준을 충족하는 PMS는 연구에 따라 20~30%대, 가장 심한 형태인 PMDD는 수 % 수준으로 보고됩니다.
        계산기의 PMS 예상 구간(다음 생리 7일 전~1일 전)은 이 시기를 미리 알고 일정을 조정하는 용도입니다.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        {[
          { name: '신체 증상', color: 'var(--warning)', items: '붓기·체중 일시 ↑·복부 팽만·유방 압통·두통·여드름·피로' },
          { name: '정서 증상', color: 'var(--cat-unit-ink)', items: '기분 변동·짜증·불안·우울·집중력 ↓·식욕 ↑·수면 변화' },
          { name: '일반 대처', color: 'var(--cat-finance-ink)', items: '카페인·염분 ↓·수분 ↑·규칙 운동·충분한 수면·일정 여유' },
          { name: '심한 PMS (PMDD)', color: 'var(--danger)', items: '일상에 심각한 영향 → 산부인과·정신건강의학과 상담 권장' },
        ].map((b, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${b.color} 27%, transparent)`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
            <p style={{ fontSize: '13px', color: b.color, fontWeight: 700, marginBottom: '6px' }}>{b.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{b.items}</p>
          </div>
        ))}
      </div>
      <p className="g-p">
        증상이 생리 주기와 정말 맞물리는지 확인하려면 두 주기 이상 날짜와 함께 기록해 보는 것이 좋습니다. 생리 뒤에도 증상이 이어진다면 PMS보다 다른 원인을 먼저 살펴야 합니다.
        본 도구는 PMS 일반 안내만 제공하며, 정확한 진단·약물은 산부인과 영역입니다(보건복지상담센터 129).
      </p>

      {/* 8. 산부인과 상담 신호 */}
      <h2 className="g-h2">산부인과 상담이 필요한 신호</h2>
      <Callout tone="warn" title="다음 경우 산부인과 상담을 권장합니다">
        <ul style={{ marginBottom: 8 }}>
          <li>주기 변동폭 <strong>±8일 이상</strong>이 계속됨 (PCOS·갑상선 질환·스트레스 등 가능성)</li>
          <li><strong>부정출혈</strong> — 생리 기간이 아닌 때의 출혈, 성관계 후 출혈</li>
          <li><strong>과다 출혈</strong> — 1~2시간마다 패드·탐폰을 갈아야 할 정도, 큰 핏덩어리가 반복됨</li>
          <li>임신이 아닌데(임신 테스트 음성) <strong>3개월 이상</strong> 생리가 없음</li>
          <li>일상에 지장을 주는 심한 PMS·생리통</li>
          <li>21일 미만 또는 45일 초과 주기</li>
          <li>임신 계획·피임 방법 결정</li>
        </ul>
        도움 받기: 보건복지상담센터 <strong>129</strong> · 청소년 상담 <strong>1388</strong> · 응급 <strong>119</strong>
      </Callout>

      {/* 9. FAQ */}
      <Faq items={FAQ_LD} />

      {/* 10. 공식 참고 자료 */}
      <h2 className="g-h2">공식 참고 자료</h2>
      <ul className="g-list">
        <li>
          <a href="https://www.nichd.nih.gov/health/topics/menstruation/conditioninfo/irregularities" target="_blank" rel="noopener noreferrer">NICHD — Menstrual irregularities</a>
          {' '}(미국 국립아동보건·인간발달연구소 · 정상 주기 21~35일, 무월경·희발월경 정의)
        </li>
        <li>
          <a href="https://www.cdc.gov/contraception/about/index.html" target="_blank" rel="noopener noreferrer">CDC — Contraception</a>
          {' '}(미국 질병통제예방센터 · 피임법별 효과·실패율)
        </li>
        <li>
          <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC27529/" target="_blank" rel="noopener noreferrer">Wilcox AJ 외, BMJ 2000;321:1259</a>
          {' '}(가임창 시기의 개인차 — 소변 호르몬으로 확인한 696주기)
        </li>
        <li>
          <a href="https://www.nhs.uk/conditions/periods/" target="_blank" rel="noopener noreferrer">NHS — Periods</a>
          {' '}(영국 국민보건서비스 · 생리·주기 일반)
        </li>
      </ul>
      <p className="g-note">
        국내 상담: 대한산부인과학회 · 보건복지상담센터 <strong>129</strong>. 본 도구의 수치는 위 공식 자료를 바탕으로 한 일반 참고용 추정입니다.
      </p>

      {/* 면책 — ToolPage가 페이지 끝으로 옮긴다 */}
      <Disclaimer variant="medical" open>
        본 도구는 <strong>피임 방법·임신 확진·의학 진단·약물 추천이 아닙니다</strong>. 주기·배란일·가임기는 통계 평균 모델로, 실제로는 ±2일 이상 달라질 수 있습니다(스트레스·수면·체중·약물).
        입력과 기록은 이 브라우저(localStorage)에만 저장되고 서버로 전송되지 않으며, 다른 기기와 동기화되지 않으니 필요하면 내 기록 탭의 CSV 백업을 이용하세요.
        도움 받기: 보건복지상담센터 <strong>129</strong> · 청소년 <strong>1388</strong> · 응급 <strong>119</strong>.
      </Disclaimer>

      {/* 함께 쓰면 좋은 도구 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/health/pregnancy" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🤰</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>임신 주수 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>임신 확인 후 주차·태아·검사</div>
        </Link>
        <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량(BMR)</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>phase별 칼로리 일반 안내</div>
        </Link>
        <Link href="/tools/health/bmi" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>⚖️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>BMI 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>체중 적정성</div>
        </Link>
        <Link href="/tools/health/supplement" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💊</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>영양제 성분 체크</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>철분·B6 일반 안내</div>
        </Link>
        <Link href="/tools/health/weightloss" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎯</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>체중 감량</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>황체기 변동 이해</div>
        </Link>
        <Link href="/tools/date/dday" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📅</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>D-day 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>생리·검진 일정</div>
        </Link>
      </div>
    </ToolPage>
  )
}
