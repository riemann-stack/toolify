import Link from 'next/link'
import HousingScoreClient from './HousingScoreClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import { todayStr } from '@/lib/date'
import ToolPage from '@/components/ToolPage'
import {
  CUTLINES,
  bankbookScore,
  calcTotalScore,
  computeBankbookYears,
  computeUnhomedYears,
  dependentScore,
  unhomedScore,
} from './housingScoreData'

export const metadata = buildMetadata({
  path: '/tools/finance/housing-score',
  title: '청약 가점 계산기 — 84점 만점 자동 + 커트라인 비교·시뮬레이션',
  description:
    '주택 청약 가점제 84점(무주택 32 + 부양가족 35 + 통장 17) 자동 계산. 생년월일·결혼일로 무주택 기간 자동 산정 + 최근 평균 당첨 가점 비교 + 가점 향상 시뮬 + 6가지 특별공급 자격 가이드 + 위장전입 등 함정 가이드 (2026년 기준).',
  keywords: [
    '청약 가점 계산기', '청약 가점', '주택청약', '청약 점수',
    '무주택 기간', '부양가족 가점', '청약통장 가입기간',
    '신혼부부 특별공급', '생애최초 특공', '다자녀 특공', '노부모 부양',
    '청약 커트라인', '서울 청약', '청약 1순위', '청약 함정',
    '재당첨 제한', '1주택 처분서약',
  ],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
}
const tableBox: React.CSSProperties = { ...card, padding: 0, overflow: 'hidden' }
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

/* 계산 예시 — 도구와 같은 산식(housingScoreData)으로 빌드 시 계산. 기준일은 고정(2026-09-01)이라 빌드 날짜와 무관 */
const EX_REF = new Date(2026, 8, 1)
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day)
const ymd = (x: Date) => `${x.getFullYear()}.${x.getMonth() + 1}.${x.getDate()}`
const EXAMPLES = [
  { who: '만 34세 미혼 1인 가구', birth: d(1992, 3, 15), married: null, dependents: 0, depNote: '없음', joined: d(2016, 5, 1) },
  { who: '만 26세에 혼인한 신혼부부 + 자녀 1', birth: d(1995, 6, 10), married: d(2022, 4, 20), dependents: 2, depNote: '배우자·자녀 1', joined: d(2019, 1, 15) },
  { who: '만 31세에 혼인, 부모님 모시는 6인 가구', birth: d(1986, 8, 20), married: d(2017, 10, 1), dependents: 5, depNote: '배우자·자녀 2·부모 2', joined: d(2012, 2, 1) },
  { who: '만 27세에 혼인한 4인 가구', birth: d(1983, 11, 2), married: d(2011, 5, 14), dependents: 3, depNote: '배우자·자녀 2', joined: d(2009, 3, 1) },
].map(e => {
  const age30 = new Date(e.birth); age30.setFullYear(age30.getFullYear() + 30)
  const start = e.married && e.married.getTime() < age30.getTime() ? e.married : age30
  const r = calcTotalScore({
    unhomedYears: computeUnhomedYears(e.birth, e.married, EX_REF),
    dependentCount: e.dependents,
    bankbookYears: computeBankbookYears(e.joined, EX_REF),
  })
  return { ...e, start, r }
})

/* 점수표 — 도구 함수로 생성 (별표1과 같은 구간) */
const UNHOMED_ROWS = Array.from({ length: 16 }, (_, y) => ({
  label: y === 0 ? '1년 미만' : y === 15 ? '15년 이상' : `${y}년 이상 ~ ${y + 1}년 미만`,
  pts: unhomedScore(y === 0 ? 0.5 : y),
}))
const BANKBOOK_ROWS = [
  { label: '6개월 미만', pts: bankbookScore(0.2) },
  { label: '6개월 이상 ~ 1년 미만', pts: bankbookScore(0.7) },
  ...Array.from({ length: 14 }, (_, i) => ({ label: `${i + 1}년 이상 ~ ${i + 2}년 미만`, pts: bankbookScore(i + 1) })),
  { label: '15년 이상', pts: bankbookScore(15) },
]

const FAQ_LD = [
  { q: '청약 가점은 어디서 공식 확인하나요?', a: '한국부동산원 청약홈(applyhome.co.kr)에서 본인 인증 후 청약자격·가점을 조회할 수 있습니다. 청약 신청 화면에서도 입력한 정보로 가점이 계산되지만, 무주택 기간·부양가족 수는 <strong>신청자가 입력한 값</strong>이 기준이라 틀리게 적으면 당첨 후 서류 검증에서 부적격 처리됩니다. 신청 직전 주민등록표등본·가족관계증명서와 대조해 한 번 더 확인하세요.' },
  { q: '만 30세 이전에 결혼하면 가점이 얼마나 유리한가요?', a: '무주택 기간을 혼인신고일부터 세기 때문에 유리합니다. 만 27세에 혼인하면 만 42세에 무주택 15년(32점 만점)을 채우지만, 미혼이면 만 30세 생일부터 세어 만 45세에야 만점이 됩니다. 같은 나이에서 비교하면 3년 = 무주택 6점 차이입니다. 반대로 만 30세 이후 혼인은 기산일을 앞당기지 못합니다(혼인일이 아니라 만 30세 생일부터).' },
  { q: '1주택자도 청약 가능한가요?', a: '가능하지만 무주택 기간 가점은 0점입니다. 입주자모집공고일 현재 주택을 가진 세대는 처분 조건을 걸어도 무주택 기간 점수를 받지 못하며, 처분 조건은 주로 민영주택 추첨제 물량과 관련됩니다(규제지역·수도권 등은 추첨 물량의 75% 이상을 무주택자에게 먼저 배정하고, 나머지를 무주택자와 기존 주택 처분 조건 1주택자에게 공급). 처분 조건으로 당첨되면 입주 가능일부터 6개월 안에 기존 주택을 처분해야 하며, 지키지 않으면 공급계약 취소 등 불이익이 따릅니다. 이미 집을 팔았다면 그 처분일부터 무주택 기간을 다시 셉니다.' },
  { q: '부모님을 부양가족으로 인정받으려면?', a: '다음 3가지를 모두 충족해야 합니다. ① 신청자 본인이 세대주 ② 부모(배우자의 부모 포함, 직계존속)가 최근 3년 이상 계속 같은 주민등록표에 등재 ③ 부모와 그 배우자 모두 무주택(한 명이라도 주택을 가지면 두 분 모두 부양가족 제외). 나이 요건은 없습니다(만 60세 기준은 신청자 무주택 판정 특례, 만 65세는 노부모부양 특별공급 요건이라 별개입니다). 형식상 전입만 해 둔 위장전입은 당첨 취소와 형사처벌 대상이니 실제 동거 여부를 증빙할 수 있어야 합니다.' },
  { q: '배우자의 청약통장 가입기간도 합산되나요?', a: '2024년 3월 25일부터 민영주택 가점제에서는 <strong>배우자 통장 가입기간의 2분의 1</strong>을 본인 가입기간 점수에 더할 수 있습니다. 배우자 몫은 최대 3점이고, 합산 후에도 통장 점수는 17점을 넘지 않습니다. 이 계산기는 신청자 본인 통장만 반영하므로, 배우자 통장이 오래됐다면 청약홈에서 합산 점수를 따로 확인하세요.' },
  { q: '가점이 부족한데 어떻게 해야 하나요?', a: '세 가지를 병행하세요. ① 특별공급 자격 확인 — 신혼부부·생애최초·신생아·다자녀 특별공급은 일반공급 가점과 별개로 경쟁합니다. ② 추첨 물량이 큰 평형 노리기 — 투기과열지구 60㎡ 이하는 추첨 60%, 비규제지역 85㎡ 초과는 추첨 100%입니다(반대로 투기과열지구 85㎡ 초과는 가점 80%라 가점이 낮으면 불리). ③ 가점 누적 — 통장과 무주택을 유지하면 1년에 최대 3점(무주택 2 + 통장 1)씩 오릅니다. 30대 초반이라면 ①·②를 먼저 검토하는 편이 현실적입니다.' },
  { q: '청약통장에는 한 달에 얼마씩 넣어야 하나요?', a: '가점(통장 17점)은 <strong>가입기간만</strong> 보므로 금액과 무관합니다. 금액이 의미 있는 경우는 셋입니다. ① 공공분양(국민주택) — 전용 40㎡ 초과는 같은 순위 안에서 인정 저축총액이 많은 순으로 뽑는데, 2024년 11월부터 월 인정 한도가 10만 원에서 <strong>25만 원</strong>으로 올랐습니다. ② 민영주택 — 지역·면적별 예치금(서울 85㎡ 이하 300만 원 등)만 채우면 됩니다. ③ 소득공제 — 무주택 세대주·총급여 7천만 원 이하면 연 300만 원 한도 납입액의 40%를 공제받습니다. 공공분양을 노린다면 월 25만 원, 민영 위주라면 예치금만 채우고 최소 금액으로 기간을 유지하는 방식이 흔합니다.' },
  { q: '이 계산기 결과와 청약홈 가점이 다를 수 있는 경우는?', a: '계산 규칙(주택공급에 관한 규칙 별표1)은 같지만 다음 경우는 입력만으로 판단할 수 없어 차이가 날 수 있습니다. ① 과거 주택을 소유했다가 처분한 이력(처분일부터 재기산) ② 이혼·재혼(최초 혼인신고일 기준 여부) ③ 소형·저가주택, 60세 이상 직계존속 소유 주택 등 무주택 간주 특례 ④ 배우자 통장 합산 ⑤ 해외 체류로 주민등록이 말소됐던 기간. 해당하면 청약홈 조회값을 우선하세요.' },
]

export default function HousingScorePage() {
  return (
    <ToolPage width={880} slug="/tools/finance/housing-score">
      <h1 className="tp-h1">
        <ToolIconBadge catId="finance" />청약 가점 계산기
      </h1>
      <p className="tp-lead">
        생년월일·결혼일·자녀 수만 입력하면 <strong style={{ color: 'var(--text)' }}>84점 만점 자동 계산</strong> + 최근 인기 단지 커트라인 비교 + 가점 향상 시뮬 + 6가지 특별공급 자격·조건 안내.
      </p>

      <UpdatedMeta date="2026년 9월" basis="주택공급에 관한 규칙 별표1(가점)·별표2(예치금), 2026.6.15 개정(민영 신생아 특별공급) 반영" sources={[{"label":"청약홈","href":"https://www.applyhome.co.kr"},{"label":"국토교통부","href":"https://www.molit.go.kr"},{"label":"국가법령정보센터 주택공급에 관한 규칙","href":"https://www.law.go.kr/법령/주택공급에관한규칙"}]} />

      {/* buildDate: SSG와 hydration이 같은 기준일을 쓰도록 빌드 시점 날짜 전달 (useToday 참고) */}
      <HousingScoreClient buildDate={todayStr()} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 가점제 84점 구조 */}
        <section>
          <h2 className="g-h2">청약 가점제 84점 구조</h2>
          <p className="g-p">
            「주택공급에 관한 규칙」 별표1 기준 — 가점제는 <strong>3개 영역의 합계 84점</strong>입니다. 민영주택에서는 일반공급 가점제 물량과 노부모부양 특별공급이 이 점수 순으로 당첨자를 정합니다(국민주택은 가점 대신 납입 횟수·저축총액 순).
            계산기는 입주자모집공고일 대신 오늘 날짜를 기준일로 쓰므로, 실제 공고일이 몇 달 뒤라면 그만큼 기간이 늘어난 값으로 다시 확인하세요.
          </p>
          <div style={tableBox}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>영역</th>
                    <th scope="col" style={headCell}>최대</th>
                    <th scope="col" style={headCell}>비중</th>
                    <th scope="col" style={headCell}>핵심</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={cell}><strong>무주택 기간</strong></td>
                    <td style={cell}><strong style={{ color: 'var(--cyan-600)' }}>32점</strong></td>
                    <td style={cell}>38%</td>
                    <td style={cell}>만 30세 또는 혼인신고일부터. 1년 미만 2점, 이후 1년당 +2점, 15년 이상 만점</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>부양가족</strong></td>
                    <td style={cell}><strong style={{ color: 'var(--emerald-600)' }}>35점</strong></td>
                    <td style={cell}>42%</td>
                    <td style={cell}>본인 제외 0명 = 5점, 1명당 +5점, 6명 이상 만점</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>청약통장 가입기간</strong></td>
                    <td style={cell}><strong style={{ color: 'var(--yellow-700)' }}>17점</strong></td>
                    <td style={cell}>20%</td>
                    <td style={cell}>6개월 미만 1점, 6개월~1년 2점, 이후 1년당 +1점, 15년 이상 만점</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <Callout tone="tip" title="가장 크게 움직이는 영역은 부양가족">
            무주택·통장 점수는 시간이 지나면 저절로 오르지만 1년에 최대 3점입니다. 반면 결혼(배우자 +5점)이나 자녀 1명(+5점)은 한 번에 5점이 움직여, 인기 단지 커트라인 근처에서는 당락을 가르는 경우가 많습니다.
          </Callout>
        </section>

        {/* 2. 계산 예시 */}
        <section>
          <h2 className="g-h2">사례로 보는 가점 계산 (2026년 9월 1일 기준)</h2>
          <p className="g-p">
            아래 네 가구는 이 계산기와 같은 산식으로 계산한 값입니다. 기간은 <strong>달력 기준 만(滿) 개월</strong>로 세고 12로 나눈 뒤 소수점 아래를 버려 구간을 정합니다 — 예컨대 무주택 4년 11개월은 &lsquo;4년 이상~5년 미만&rsquo; 구간(10점)이고, 기념일 당일에 한 구간 올라갑니다.
            세 번째 사례처럼 만 30세가 지난 뒤 혼인했다면 기산일은 혼인일이 아니라 <strong>만 30세 생일</strong>입니다.
          </p>
          <div style={tableBox}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>사례</th>
                    <th scope="col" style={headCell}>무주택 기산일</th>
                    <th scope="col" style={headCell}>무주택</th>
                    <th scope="col" style={headCell}>부양가족</th>
                    <th scope="col" style={headCell}>통장 (가입일)</th>
                    <th scope="col" style={headCell}>합계</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAMPLES.map(e => (
                    <tr key={e.who}>
                      <td style={cell}>{e.who}</td>
                      <td style={cell}>{ymd(e.start)}{e.married && e.start !== e.married ? ' (만 30세)' : e.married ? ' (혼인)' : ' (만 30세)'}</td>
                      <td style={cell}>{e.r.unhomedYears === null ? '산정 전' : `${Math.floor(e.r.unhomedYears)}년`} → {e.r.unhomedPoints}점</td>
                      <td style={cell}>{e.depNote} ({e.dependents}명) → {e.r.dependentPoints}점</td>
                      <td style={cell}>{Math.floor(e.r.bankbookYears)}년 ({ymd(e.joined)}) → {e.r.bankbookPoints}점</td>
                      <td style={cell}><strong style={{ color: 'var(--accent-ink)' }}>{e.r.total}점</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            첫 번째 1인 가구는 부양가족 기본점 5점이 전부라, 통장·무주택을 15년 채워도 최대 54점입니다. 1인 가구가 인기 단지 가점제로 당첨되기 어려운 이유이며, 이 경우 추첨 물량이나 생애최초 특별공급을 함께 보는 편이 현실적입니다.
          </p>
        </section>

        {/* 3. 무주택 기간 상세 */}
        <section>
          <h2 className="g-h2">무주택 기간 — 언제부터 세나</h2>
          <div style={{ ...card }}>
            <ul className="g-list" style={{ margin: 0 }}>
              <li><strong>만 30세 이상 미혼</strong>: 만 30세 생일부터</li>
              <li><strong>만 30세 이전 혼인</strong>: 혼인신고일부터 (가장 유리)</li>
              <li><strong>만 30세 이후 혼인</strong>: 만 30세 생일부터 (혼인일과 무관)</li>
              <li><strong>만 30세 미만 미혼</strong>: 산정 전 — 0점 (&lsquo;1년 미만 2점&rsquo;도 받지 못함)</li>
              <li><strong>주택 소유 중 (처분 조건 포함)</strong>: 0점 — 처분해 무주택이 된 날부터 다시 셈</li>
              <li><strong>신청자·배우자 기준</strong>: 둘 다 무주택이어야 하며, 과거에 집을 가졌다면 마지막으로 무주택이 된 날부터 다시 셈</li>
            </ul>
          </div>
          <div style={{ ...tableBox, marginTop: 12 }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>무주택 기간</th>
                    <th scope="col" style={headCell}>점수</th>
                    <th scope="col" style={headCell}>청약통장 가입기간</th>
                    <th scope="col" style={headCell}>점수</th>
                  </tr>
                </thead>
                <tbody>
                  {BANKBOOK_ROWS.map((b, i) => {
                    const u = i === 0 ? null : UNHOMED_ROWS[i - 1]
                    return (
                      <tr key={b.label}>
                        <td style={cell}>{u ? u.label : '—'}</td>
                        <td style={cell}>{u ? `${u.pts}점` : '—'}</td>
                        <td style={cell}>{b.label}</td>
                        <td style={cell}>{b.pts}점</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="g-note">※ 두 점수표 모두 계산기 함수에서 생성합니다(주택공급에 관한 규칙 별표1과 같은 구간).</p>
        </section>

        {/* 4. 부양가족 상세 */}
        <section>
          <h2 className="g-h2">부양가족 — 누구를 셀 수 있나</h2>
          <p className="g-p">
            부양가족은 입주자모집공고일 현재 신청자 또는 배우자와 <strong>같은 주민등록표등본에 올라 있는</strong> 배우자·직계존속·직계비속만 셉니다. 배우자가 세대를 분리해 살고 있어도 배우자는 부양가족으로 인정되며, 배우자 등본에 함께 올라 있는 자녀도 셀 수 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { ok: true, name: '배우자', desc: '혼인신고 완료 — 세대 분리 중이어도 인정' },
              { ok: true, name: '자녀 (미성년)', desc: '미혼 + 같은 등본 (태아 포함)' },
              { ok: true, name: '자녀 (성인 미혼)', desc: '미혼 + 같은 등본 (만 30세 이상은 최근 1년 이상 같은 등본)' },
              { ok: true, name: '직계존속 (부모·배우자 부모)', desc: '본인이 세대주 + 최근 3년 이상 같은 등본 + 부모 부부 모두 무주택' },
              { ok: true, name: '조부모·외조부모', desc: '직계존속 — 부모와 같은 요건 (나이 요건 없음)' },
              { ok: false, name: '형제·자매', desc: '방계 — 부양가족으로 인정되지 않음' },
              { ok: false, name: '만 30세 이상 미혼 자녀 (1년 미만)', desc: '같은 등본 1년 미만이면 제외' },
              { ok: false, name: '기혼 자녀', desc: '나이 무관 — 제외' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-s)', padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: b.ok ? 'var(--success)' : 'var(--danger)', fontWeight: 700, margin: '0 0 4px' }}>{b.ok ? '인정' : '제외'} · {b.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ ...tableBox, marginTop: 12 }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>부양가족 수 (본인 제외)</th>
                    <th scope="col" style={headCell}>점수</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3, 4, 5, 6].map(n => (
                    <tr key={n}><td style={cell}>{n === 0 ? '0명 (단독 세대)' : n === 6 ? '6명 이상' : `${n}명`}</td><td style={cell}>{dependentScore(n)}점{n === 6 ? ' (만점)' : ''}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. 청약통장 */}
        <section>
          <h2 className="g-h2">청약통장 — 가점 기간 vs 1순위 조건</h2>
          <p className="g-p">
            가점은 <strong>가입기간</strong>만 봅니다(납입 횟수·금액과 무관). 그러나 <strong>1순위 자격</strong>은 국민주택이면 가입기간과 납입 횟수, 민영주택이면 가입기간과 예치금을 함께 채워야 합니다.
            계산기의 1순위 판정은 국민주택 기준(가입기간·납입 횟수)이며, 민영주택 예치금은 아래 표로 따로 확인하세요.
          </p>
          <div style={tableBox}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>구분</th>
                    <th scope="col" style={headCell}>가점 반영</th>
                    <th scope="col" style={headCell}>1순위 조건</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={cell}><strong>가입 기간</strong></td>
                    <td style={cell}>반영 (1~17점)</td>
                    <td style={cell}>수도권 12개월 / 비수도권 6개월 / 투기과열지구·청약과열지역 24개월</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>납입 횟수</strong></td>
                    <td style={cell}>반영 안 함</td>
                    <td style={cell}>국민주택: 수도권 12회 / 비수도권 6회 / 투기과열지구·청약과열지역 24회</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>예치금</strong></td>
                    <td style={cell}>반영 안 함</td>
                    <td style={cell}>민영주택: 거주지·면적별 예치기준금액 (아래 표)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ ...tableBox, marginTop: 12 }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                <caption style={{ captionSide: 'top', textAlign: 'left', padding: '10px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>민영주택 청약 예치기준금액 (별표2, 단위 만 원)</caption>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>신청자 거주지</th>
                    <th scope="col" style={headCell}>85㎡ 이하</th>
                    <th scope="col" style={headCell}>102㎡ 이하</th>
                    <th scope="col" style={headCell}>135㎡ 이하</th>
                    <th scope="col" style={headCell}>모든 면적</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['서울특별시·부산광역시', '300', '600', '1,000', '1,500'],
                    ['그 밖의 광역시', '250', '400', '700', '1,000'],
                    ['특별시·광역시 외 시·군', '200', '300', '400', '500'],
                  ].map(r => (
                    <tr key={r[0]}>{r.map((c, i) => <td key={i} style={cell}>{c}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="g-note">※ 예치금은 주택 소재지가 아니라 입주자모집공고일 현재 <strong>신청자의 주민등록상 거주지</strong> 기준입니다. 공고일까지 입금을 마쳐야 합니다.</p>
        </section>

        {/* 6. 가점제·추첨제 비율 */}
        <section>
          <h2 className="g-h2">가점제로 뽑는 물량 — 지역·면적별 비율</h2>
          <p className="g-p">
            민영주택 일반공급은 한 단지 안에서도 <strong>가점제 물량과 추첨제 물량</strong>이 나뉩니다. 가점이 낮을수록 추첨 비율이 큰 평형이 유리하고, 가점이 높다면 가점 비율이 큰 평형이 유리합니다.
            2025년 10·15 대책으로 서울 전역과 경기 12곳이 투기과열지구로 지정돼, 이 지역 신규 분양은 아래 투기과열지구 비율을 따릅니다.
          </p>
          <div style={tableBox}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>지역</th>
                    <th scope="col" style={headCell}>60㎡ 이하</th>
                    <th scope="col" style={headCell}>60㎡ 초과~85㎡ 이하</th>
                    <th scope="col" style={headCell}>85㎡ 초과</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={cell}><strong>투기과열지구</strong></td>
                    <td style={cell}>가점 40% · 추첨 60%</td>
                    <td style={cell}>가점 70% · 추첨 30%</td>
                    <td style={cell}>가점 80% · 추첨 20%</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>비규제지역</strong></td>
                    <td style={cell} colSpan={2}>가점 40% 이하(지자체 결정) · 나머지 추첨</td>
                    <td style={cell}>추첨 100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="g-note">※ 조정대상지역(투기과열지구 아님)은 별도 비율이 적용되고, 공공택지 등 예외가 있어 실제 비율은 입주자모집공고문의 &lsquo;공급 방법&rsquo; 항목에서 확인하세요.</p>
        </section>

        {/* 7. 최근 평균 당첨 가점 */}
        <section>
          <h2 className="g-h2">지역별 당첨 가점 대략 범위</h2>
          <p className="g-p">
            계산기 결과 화면의 커트라인 비교에 쓰는 참고 범위입니다. 같은 지역이라도 단지·평형·분양가·시기에 따라 ±5~10점씩 움직이므로, 지원할 단지와 비슷한 최근 단지의 당첨자 발표 자료를 청약홈에서 직접 찾아보는 것이 가장 정확합니다.
          </p>
          <div style={tableBox}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>지역</th>
                    <th scope="col" style={headCell}>평균 당첨</th>
                    <th scope="col" style={headCell}>최저 당첨</th>
                    <th scope="col" style={headCell}>비고</th>
                  </tr>
                </thead>
                <tbody>
                  {CUTLINES.map(c => (
                    <tr key={c.region}>
                      <td style={cell}>{c.region.replace(/^\S+\s/, '')}</td>
                      <td style={cell}><strong style={{ color: 'var(--accent-ink)' }}>{c.avg}점</strong></td>
                      <td style={cell}>{c.min}점</td>
                      <td style={cell}>{c.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="g-note">
            ※ 한국부동산원 청약홈이 단지별로 공개하는 당첨 가점 자료(2023~2025년)를 바탕으로 한 대략적 범위이며 공식 통계가 아닙니다. 청약홈에서 단지·주택형별 당첨 가점(최저·최고·평균)을 조회할 수 있습니다.
          </p>
        </section>

        {/* 8. 특별공급 */}
        <section>
          <h2 className="g-h2">특별공급 — 가점이 부족할 때의 경로</h2>
          <p className="g-p">
            특별공급은 일반공급과 별개 물량이라, 가점이 낮아도 자격만 맞으면 따로 경쟁합니다. 특별공급은 원칙적으로 한 세대당 평생 한 번만 당첨될 수 있으니 어느 유형으로 쓸지 신중히 고르세요. 세부 조건은 계산기의 「특별공급 자격 가이드」에서 펼쳐 볼 수 있습니다.
          </p>
          <div style={tableBox}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>유형</th>
                    <th scope="col" style={headCell}>핵심 자격</th>
                    <th scope="col" style={headCell}>최근 바뀐 점·확인 포인트</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={cell}><strong>신혼부부</strong></td>
                    <td style={cell}>혼인 7년 이내 무주택, 소득·자산 기준</td>
                    <td style={cell}>2024년 맞벌이 소득 기준 완화 — 공급 유형별 소득 비율은 공고 확인</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>생애최초</strong></td>
                    <td style={cell}>세대원 전원 주택 소유 이력 없음, 1순위, 소득세 5년 이상 납부</td>
                    <td style={cell}>국민주택은 저축액 600만 원 이상, 민영은 1인 가구도 일부 물량 신청 가능</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>신생아</strong></td>
                    <td style={cell}>만 2세 미만 자녀(임신·입양 포함) 무주택 가구</td>
                    <td style={cell}>공공 2024년 도입, 민영은 2026년 6월 15일부터 10% 별도 신설 — 혼인 기간 무관</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>다자녀</strong></td>
                    <td style={cell}>미성년 자녀 2명 이상 (태아·입양 포함)</td>
                    <td style={cell}>2024년 3월 25일 3자녀 → 2자녀 완화, 자녀 수·무주택 기간 등 별도 배점</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>노부모부양</strong></td>
                    <td style={cell}>만 65세 이상 직계존속 3년 이상 동거 부양, 1순위 세대주</td>
                    <td style={cell}>민영주택은 일반공급과 같은 84점 가점제로 경쟁(위 결과 활용) — 국민주택은 납입 횟수·저축총액 순차제</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>기관추천</strong></td>
                    <td style={cell}>국가유공자·장애인·장기복무군인·중소기업 근로자 등</td>
                    <td style={cell}>해당 기관 추천서 필요 — 2026년 6월 개정으로 지방정부 추천 대상·절차 확대</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <Callout tone="warn" title="부적격 당첨은 당첨 취소 + 청약 제한">
            가점을 실제보다 높게 입력해 당첨되면 서류 검증에서 부적격 처리되고, 일정 기간 다른 분양 청약이 제한됩니다. 무주택 기간·부양가족 수는 등본·가족관계증명서와, 통장 가입일은 은행 가입확인서와 반드시 대조하세요.
          </Callout>
        </section>

        {/* 9. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 10. 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { href: '/tools/finance/rent-jeonse', name: '월세·전세 비교', desc: '분양 대기 중 거주 옵션' },
              { href: '/tools/finance/loan', name: '대출이자 계산기', desc: '당첨 후 잔금·중도금 대출' },
              { href: '/tools/finance/real-estate', name: '부동산 수익률', desc: '분양가 투자 가치 평가' },
              { href: '/tools/finance/compound', name: '복리 계산기', desc: '청약 자금 모으기' },
              { href: '/tools/finance/savings', name: '월 저축 계산기', desc: '청약저축·ISA·연금' },
              { href: '/tools/finance/ipo-deposit', name: '공모주 증거금', desc: '주식 청약 분야' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{ ...card, display: 'block', textDecoration: 'none' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{t.desc}</div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
