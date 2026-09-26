import Link from 'next/link'
import SleepDebtClient from './SleepDebtClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/health/sleep-debt',
  title: '수면 부채 트래커 — 7·14·30일 누적 부족 시간·회복 계획·규칙성',
  description:
    '지난 7·14·30일 누적 수면 부족 시간 + 회복까지 며칠 더 자야 0이 되는지 자동. 막대 차트·수면 규칙성·권장 취침 시각 역산.',
  keywords: [
    '수면 부채', '수면 부족 계산기', '수면 시간 계산기', '수면 트래커',
    '권장 수면 시간', '수면 부채 회복', '주말 몰아 자기', 'sleep debt',
    '취침 시각 계산', '기상 시각 계산', '수면 규칙성', '수면 일관성',
    '수면 다이어리', '낮잠 효과', '수면 부족 증상', '청소년 수면',
  ],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
}
const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const numCell: React.CSSProperties = { ...cell, textAlign: 'right', whiteSpace: 'nowrap' }
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const note: React.CSSProperties = { fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }

/* ── 계산 예시: SleepDebtClient의 analyze()·회복 계획·권장 취침 시각과 같은 규칙으로 빌드 시 계산 ──
   부족한 날 → 부족분 그대로 누적 / 초과한 날 → 초과분 × 0.5만큼 '이미 쌓인' 부채만 상쇄(0 미만으로 내려가지 않음)
   회복 일수 = ceil(누적 부채 ÷ ((회복 수면 − 목표) × 0.5)) · 권장 취침 = 기상 − 회복 수면 − 15분(잠드는 시간 가정) */
const RECOVERY_EFFICIENCY = 0.5 // SleepDebtClient RECOVERY_EFFICIENCY와 동일
const EX_TARGET = 8
const EX_WEEK: { day: string; hours: number }[] = [
  { day: '월', hours: 6.5 }, { day: '화', hours: 7 }, { day: '수', hours: 6 }, { day: '목', hours: 7.5 },
  { day: '금', hours: 6 }, { day: '토', hours: 9.5 }, { day: '일', hours: 9 },
]
const EX_ROWS = (() => {
  let debt = 0
  return EX_WEEK.map(r => {
    const diff = EX_TARGET - r.hours
    const before = debt
    debt = diff > 0 ? debt + diff : Math.max(0, debt + diff * RECOVERY_EFFICIENCY)
    return { ...r, diff, change: debt - before, debt }
  })
})()
const EX_DEBT = EX_ROWS[EX_ROWS.length - 1].debt
const EX_SHORT = EX_ROWS.filter(r => r.diff > 0).reduce((a, r) => a + r.diff, 0)
const EX_SURPLUS = EX_ROWS.filter(r => r.diff < 0).reduce((a, r) => a - r.diff, 0)
const EX_AVG = EX_WEEK.reduce((a, r) => a + r.hours, 0) / EX_WEEK.length
const recoveryDays = (debt: number, recoveryHours: number) =>
  Math.ceil(debt / ((recoveryHours - EX_TARGET) * RECOVERY_EFFICIENCY))
const EX_DAYS_9 = recoveryDays(EX_DEBT, 9)
const EX_DAYS_10 = recoveryDays(EX_DEBT, 10)
const bedtimeFor = (wake: string, sleepHours: number) => {
  const [h, m] = wake.split(':').map(Number)
  const t = (((h * 60 + m - sleepHours * 60 - 15) % 1440) + 1440) % 1440
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}
const EX_BED_9 = bedtimeFor('07:00', 9)
const fmtH = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, ''))
const signH = (n: number) => (n > 0 ? `+${fmtH(n)}` : n < 0 ? `−${fmtH(-n)}` : '0')

const FAQ_LD = [
  { q: '수면 부채는 정말 회복되나요?', a: '단기(1~2주) 부채는 대체로 회복됩니다. 다만 본 도구는 초과 수면의 회복 효율을 50%로 보기 때문에, 목표보다 +1시간씩 더 자면 하루 약 0.5시간씩 부채가 줄어듭니다 — 7시간 부채라면 약 2주(또는 +2시간씩이면 약 1주)가 걸립니다. 7일간 수면을 줄인 뒤 3일 동안 8시간씩 자게 한 실험(Belenky 외 2003)에서는 3일 회복 기간이 끝날 때까지 수행 능력이 기준선으로 완전히 돌아오지 않았습니다. 또 만성적인 짧은 수면은 관상동맥질환·뇌졸중(Cappuccio 외 2011 메타분석)·치매(Sabia 외 2021 코호트) 위험 증가와 연관된다고 보고됩니다. 연관이 곧 인과는 아니지만, 만성화되기 전에 회복하는 것이 좋습니다.' },
  { q: '주말에 몰아 자면 부채 0이 되나요?', a: '그렇게 보기 어렵습니다. 평일 5일은 하루 5시간만 자고 주말에는 원하는 만큼 자게 한 실험(Depner 외 2019, Current Biology)에서 참가자들은 주말에 평소보다 더 잤지만, 다시 수면 제한으로 돌아가자 인슐린 감수성이 기준 대비 9~27% 떨어졌고 저녁 이후 섭취량과 체중이 늘었습니다. 주말 늦잠은 생체시계를 뒤로 밀어 월요일 아침을 더 힘들게 만들기도 합니다(사회적 시차). 본 도구의 회복 효율 0.5는 이런 결과를 반영해 &lsquo;초과 수면이 부족분을 1:1로 갚지 못한다&rsquo;는 점을 단순화한 가정이며, 측정된 상수는 아닙니다. 그래서 몰아 자기보다 <strong>매일 목표보다 0.5~1시간 더 자는 점진 회복</strong>을 권합니다.' },
  { q: '목표 수면 시간은 몇 시간으로 잡아야 하나요?', a: '성인은 7~9시간(NSF 2015), 미국 CDC 기준으로는 &lsquo;7시간 이상&rsquo;이 출발점입니다. 도구 기본값은 8시간이고 5~10시간 사이에서 30분 단위로 바꿀 수 있습니다. 목표를 5~6시간으로 낮추면 부채가 0으로 보이지만 실제 부족이 사라지는 것은 아니므로, 성인이라면 7시간 아래로 내리지 않는 것이 좋습니다. 개인 필요량을 가늠하는 실용적인 방법은 알람 없이 지낼 수 있는 휴가 기간에 처음 며칠(밀린 잠을 자는 기간)을 빼고, 낮에 졸리지 않으면서 자연스럽게 깨는 수면 길이를 보는 것입니다.' },
  { q: '수면 시간은 충분한데 피곤한 이유는?', a: '수면 「질」이 낮을 수 있습니다. 시간만큼 중요한 요인들 — ① 수면 규칙성(취침·기상 시각 일관성, 본 도구 표시) ② 방해 요소(소음·빛·온도·반려동물·아이) ③ 수면 무호흡·코골이(본인은 알기 어려워 가족 관찰 필요) ④ 알코올·카페인·과식(깊은 수면 차단) ⑤ 스트레스·우울(표면적 수면만 가능). 지속되면 수면 클리닉 진단(수면다원검사, PSG)을 권장합니다.' },
  { q: '낮잠은 부채 회복에 도움이 되나요?', a: '20~30분 낮잠은 효과적입니다. 10~20분은 가벼운 회복과 인지·기분 향상 / 20~30분은 부채 일부 상쇄(특히 오후 1~3시) / 30~60분은 깊은 수면 단계에 들어가 깰 때 멍함(잠 관성) / 60분 이상은 야간 수면을 방해할 수 있습니다. 본 도구는 낮잠을 별도 기록하지 않지만, 야간 수면이 부족한 날은 직접 입력 모드로 「6h + 낮잠 0.5h = 6.5h」로 합산 가능합니다.' },
  { q: '기록을 며칠 빠뜨리면 계산이 어떻게 되나요?', a: '기록이 없는 날은 계산에서 <strong>빠집니다</strong>(부족 0시간으로 보는 것이 아니라 아예 건너뜀). 그래서 잠을 못 잔 날만 골라 기록을 빠뜨리면 부채가 실제보다 작게 나옵니다. 결과 카드의 &lsquo;기록 일수&rsquo;가 분석 기간(7·14·30일)보다 적으면 그만큼 추정이 불완전하다는 뜻입니다. 같은 날짜에 다시 기록하면 이전 기록을 덮어쓰고, 날짜는 <strong>일어난 날</strong> 기준입니다. 수면 규칙성 점수는 잠든·일어난 시각으로 입력한 기록이 3일 이상 있어야 표시되며, 시간만 직접 입력한 기록은 규칙성 계산에서 제외됩니다. 기록은 이 브라우저에만 저장되며 서버로 전송되지 않습니다. 시크릿 모드·다른 기기와는 공유되지 않고, 브라우저 데이터를 지우면 기록도 사라집니다.' },
  { q: '한국 평균 수면 시간은?', a: 'OECD 생활시간 통계(2016년 집계)에서 한국인의 하루 평균 수면은 약 7시간 41분으로, OECD 평균 8시간 22분보다 41분 짧아 최하위권이었습니다. 생활시간 조사는 일지 응답 방식이라 실제로 잠든 시간보다 길게 잡힐 수 있다는 점도 감안해야 합니다. 청소년은 더 짧아서, 질병관리청 청소년건강행태조사(중1~고3) 2025년 결과에서 주중 평균 수면시간은 남학생 6.6시간, 여학생 5.9시간이었습니다(권장 8~10시간). 평균은 개인차를 가리므로, 내 수면이 부족한지는 본인 목표 수면과 비교해 보는 것이 정확합니다.' },
  { q: '수면 클리닉은 언제 가야 하나요?', a: '다음 신호가 있으면 진료를 권장합니다 — ① 주 3회 이상·3개월 이상 잠들기 어려움 또는 자주 깸(만성 불면, NHLBI 기준) ② 심한 코골이와 가족이 「숨이 멎는 듯」 관찰(수면 무호흡) ③ 7~8시간 자도 낮에 졸리고 집중력 저하 ④ 다리 불편함·움찔거림으로 잠 못 듦(하지불안증후군) ⑤ 악몽·잠꼬대·몽유 빈번 ⑥ 본 도구에서 &lsquo;만성 부채&rsquo;(20시간 이상)가 기록을 충분히 채운 상태로 몇 주째 이어짐. 수면다원검사(PSG)는 2018년 7월부터 수면무호흡증·기면증·특발성 과다수면증이 의심될 때 건강보험이 적용됩니다(단순 코골이는 제외). 수면다원검사가 가능한 병원의 신경과·정신건강의학과·이비인후과 수면클리닉에서 상담할 수 있습니다.' },
]

export default function SleepDebtPage() {
  return (
    <ToolPage width={880} slug="/tools/health/sleep-debt">
      <h1 className="tp-h1">
        <ToolIconBadge catId="health" />수면 부채 트래커
      </h1>
      <p className="tp-lead">
        지난 7·14·30일 누적 수면 부족 시간 + <strong style={{ color: 'var(--text)' }}>회복까지 며칠 더 자야 0</strong>이 되는지 자동.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="연령별 권장 수면 범위(NSF 2015, 성인 7~9시간) 기준 · 일별 부채 = 목표 − 실제 수면, 초과 수면은 회복효율 0.5 적용(단순화 가정)"
        sources={[
          { label: 'NSF 2015 — 권장 수면 시간(최종 보고)', href: 'https://www.sleephealthjournal.org/article/S2352-7218(15)00160-6/abstract' },
          { label: 'CDC — About Sleep (성인 7시간+)', href: 'https://www.cdc.gov/sleep/about/index.html' },
          { label: 'Van Dongen 외 2003 — 만성 수면 제한의 누적 비용(SLEEP)', href: 'https://academic.oup.com/sleep/article-abstract/26/2/117/2709164' },
          { label: '질병관리청 — 청소년건강행태조사', href: 'https://www.kdca.go.kr/yhs/' },
        ]}
      />

      <SleepDebtClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 수면 부채란? */}
        <section>
          <h2 className="g-h2">수면 부채(Sleep Debt)란?</h2>
          <p className="g-p">
            수면 부채는 <strong>본인의 권장 수면량 대비 부족한 시간이 누적된 양</strong>입니다.
            예: 매일 8시간 필요한데 7시간만 자면 1시간씩 부채가 쌓여, 일주일이면 7시간 부채.
          </p>
          <p className="g-p">
            부족이 조금씩이라도 매일 이어지면 영향이 쌓입니다. 하루 6시간 수면을 14일 이어 간 실험(Van Dongen 외 2003)에서 주의력 저하는 날마다 누적돼 이틀 밤을 꼬박 새운 것과 비슷한 수준까지 커졌는데, 참가자 스스로 느끼는 졸림은 그만큼 늘지 않았습니다.
            &ldquo;6시간이면 버틸 만하다&rdquo;는 체감이 실제 상태를 과소평가할 수 있다는 뜻이라, 체감 대신 기록으로 부족분을 보는 것이 이 도구의 목적입니다.
          </p>
          <p className="g-p">
            짧은 기간의 부채도 며칠 몰아 잔다고 곧바로 100% 회복되지는 않습니다 — Belenky 외(2003)는 7일간 수면을 제한한 뒤 3일의 회복 기간 안에서는 <strong>수행 능력이 완전히 돌아오지 않았다</strong>고 보고했습니다.
            또한 <strong>만성적인 수면 부족은 장기적으로 인지 저하·치매·심혈관·대사 질환 위험 증가와 연관</strong>된다고 알려져 있습니다. 다만 &ldquo;1개월이면 영구 손상&rdquo;처럼 특정 시점을 경계로 단정할 근거는 분명치 않으므로, 정확한 시점보다 <strong>만성화 전 꾸준한 회복</strong>이 중요합니다.
          </p>
        </section>

        {/* 2. 본 도구의 계산 모델 */}
        <section>
          <h2 className="g-h2">본 도구의 계산 모델</h2>
          <div style={card}>
            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: '0 0 12px' }}>
              <strong>일별 부채</strong> = 목표 수면 - 실제 수면
            </p>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: '18px', margin: 0 }}>
              <li><strong style={{ color: 'var(--text)' }}>부족한 날</strong>: 부족분 그대로 부채에 누적</li>
              <li><strong style={{ color: 'var(--text)' }}>초과한 날</strong>: 초과분 × <strong>0.5</strong>만큼 부채 상쇄 (회복 효율)</li>
              <li><strong style={{ color: 'var(--text)' }}>누적 부채</strong>: 날짜순으로 더하되 0 미만으로 내려가지 않음 — 초과 수면은 <strong>이미 쌓인 부채</strong>만 줄이고 미래의 부족분을 선불하지 않습니다</li>
              <li><strong style={{ color: 'var(--text)' }}>회복 계획</strong>: 회복 일수 = 누적 부채 ÷ ((회복 수면 − 목표) × 0.5), 올림</li>
              <li><strong style={{ color: 'var(--text)' }}>권장 취침 시각</strong>: 내일 기상 시각 − 회복 수면 시간 − 15분(잠드는 데 걸리는 시간 가정)</li>
            </ul>
          </div>
          <div style={{ marginTop: '12px' }}>
            <Callout tone="note" title="왜 회복 효율 0.5인가">
              몰아서 더 잔 시간이 부족분을 1:1로 갚지 못한다는 연구 결과(아래 &lsquo;수면 부족 영향&rsquo; 표의 Belenky·Depner 실험)를 반영해 보수적으로 50%를 적용합니다.
              따라서 목표보다 +1시간 더 자도 하루 약 <strong>0.5시간</strong>씩만 줄어 — 7시간 부채는 약 2주가 걸립니다.
              수면 부채는 정확한 &ldquo;시간 통장&rdquo;처럼 환산되지 않으며, 0.5는 연구에서 측정된 상수가 아니라 단순화한 가정입니다.
            </Callout>
          </div>
        </section>

        {/* 3. 계산 예시 (빌드 시 계산) */}
        <section>
          <h2 className="g-h2">계산 예시 — 평일 부족·주말 늦잠 한 주</h2>
          <p className="g-p">
            목표 {EX_TARGET}시간인 사람이 평일에 6~7.5시간, 주말에 9~9.5시간 잤다고 해 봅시다. 아래 표는 도구와 같은 규칙으로 날마다 누적 부채를 계산한 값입니다.
            한 주 평균은 {EX_AVG.toFixed(1)}시간으로 목표에 크게 못 미치지 않아 보이지만, 평일 부족분 {fmtH(EX_SHORT)}시간 중 주말에 더 잔 {fmtH(EX_SURPLUS)}시간은 절반인 {fmtH(EX_SURPLUS * RECOVERY_EFFICIENCY)}시간만 상쇄돼 일요일 밤 누적 부채는 <strong>{fmtH(EX_DEBT)}시간</strong>으로 남습니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '440px' }}>
                <caption className="srOnly">목표 {EX_TARGET}시간 기준 일주일 수면 부채 계산 예시</caption>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>요일</th>
                    <th scope="col" style={{ ...headCell, textAlign: 'right' }}>실제 수면</th>
                    <th scope="col" style={{ ...headCell, textAlign: 'right' }}>목표 − 실제</th>
                    <th scope="col" style={{ ...headCell, textAlign: 'right' }}>부채 변화</th>
                    <th scope="col" style={{ ...headCell, textAlign: 'right' }}>누적 부채</th>
                  </tr>
                </thead>
                <tbody>
                  {EX_ROWS.map(r => (
                    <tr key={r.day}>
                      <th scope="row" style={{ ...cell, fontWeight: 600, textAlign: 'left' }}>{r.day}</th>
                      <td style={numCell}>{fmtH(r.hours)}h</td>
                      <td style={numCell}>{signH(r.diff)}h</td>
                      <td style={{ ...numCell, color: r.change < 0 ? 'var(--success)' : 'var(--text)' }}>{signH(r.change)}h</td>
                      <td style={{ ...numCell, fontWeight: 700 }}>{fmtH(r.debt)}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: '14px' }}>
            이 상태에서 회복 계획을 매일 9시간으로 잡으면 하루 {fmtH((9 - EX_TARGET) * RECOVERY_EFFICIENCY)}시간씩 줄어 <strong>{EX_DAYS_9}일</strong>, 10시간으로 잡으면 {EX_DAYS_10}일이 걸립니다.
            내일 07:00에 일어나야 한다면 9시간 회복 기준 권장 취침 시각은 <strong>{EX_BED_9}</strong>입니다(잠드는 데 15분 가정).
            현실적으로 10시간을 매일 확보하기 어렵다면 9시간 계획을 꾸준히 지키는 편이 낫고, 그 사이 다시 부족한 날이 생기면 회복 일수도 늘어납니다.
          </p>
        </section>

        {/* 4. 결과 읽는 법 */}
        <section>
          <h2 className="g-h2">결과 읽는 법 — 부채 등급과 수면 규칙성</h2>
          <p className="g-p">
            결과 카드의 등급은 선택한 기간(7·14·30일)의 누적 부채 시간으로 나눕니다. 같은 10시간이라도 7일 기간이면 하루 평균 약 1.4시간씩, 30일 기간이면 하루 20분 남짓 부족한 셈이므로,
            등급과 함께 <strong>기간·평균 수면·기록 일수</strong>를 같이 보세요.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '440px' }}>
                <caption className="srOnly">누적 수면 부채 등급 기준</caption>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>누적 부채</th>
                    <th scope="col" style={headCell}>도구 표시</th>
                    <th scope="col" style={headCell}>이렇게 읽으세요</th>
                  </tr>
                </thead>
                <tbody>
                  {/* SleepDebtClient debtStatus 구간과 동일 */}
                  <tr><td style={cell}>1시간 미만</td><td style={{ ...cell, color: 'var(--success)', fontWeight: 700 }}>정상</td><td style={cell}>목표와 거의 같게 자는 중. 규칙성만 유지하면 됩니다.</td></tr>
                  <tr><td style={cell}>1~5시간 미만</td><td style={{ ...cell, fontWeight: 700 }}>양호</td><td style={cell}>며칠 30분~1시간 덜 잔 수준. 목표 8시간이라면 회복 계획을 기본값 9시간으로 잡을 때 최대 열흘 안팎, 10시간이면 그 절반가량이면 0이 됩니다.</td></tr>
                  <tr><td style={cell}>5~10시간 미만</td><td style={{ ...cell, color: 'var(--warning)', fontWeight: 700 }}>경미한 부채</td><td style={cell}>평일 부족이 반복되는 패턴. 취침 시각을 30분 앞당기는 것부터.</td></tr>
                  <tr><td style={cell}>10~20시간 미만</td><td style={{ ...cell, color: 'var(--warning)', fontWeight: 700 }}>누적 부채</td><td style={cell}>7일 기간이라면 하루 평균 약 1.4시간 이상 부족. 운전·위험 작업 전 특히 주의.</td></tr>
                  <tr><td style={cell}>20시간 이상</td><td style={{ ...cell, color: 'var(--danger)', fontWeight: 700 }}>만성 부채</td><td style={cell}>생활 패턴 점검이 먼저. 몇 주째 이어지면 수면 장애 여부를 진료로 확인.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: '14px' }}>
            <strong>수면 규칙성</strong>은 기간 안의 잠든 시각·일어난 시각이 날마다 얼마나 흔들리는지(표준편차)를 분 단위로 계산해, 둘 중 더 큰 값으로 판정합니다.
            20분 미만이면 &lsquo;매우 일관적&rsquo;, 40분 미만 &lsquo;일관적&rsquo;, 75분 미만 &lsquo;보통&rsquo;, 120분 미만 &lsquo;불규칙&rsquo;, 그 이상은 &lsquo;매우 불규칙&rsquo;입니다.
            평일 07:00·주말 10:00에 일어나는 식이면 총 수면 시간이 충분해도 기상 시각 편차가 커져 &lsquo;보통&rsquo; 이하로 나오는데, 이것이 월요일 아침이 유독 힘든 사회적 시차의 신호입니다.
          </p>
        </section>

        {/* 5. 연령별 권장 수면 */}
        <section>
          <h2 className="g-h2">연령별 권장 수면 시간 (NSF 2015 권장 범위)</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '440px' }}>
                <caption className="srOnly">연령별 권장 수면 시간</caption>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>연령</th>
                    <th scope="col" style={headCell}>권장 시간</th>
                    <th scope="col" style={headCell}>비고</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={cell}>신생아 (0~3개월)</td><td style={cell}><strong>14~17h</strong></td><td style={cell}>자주 깸 정상</td></tr>
                  <tr><td style={cell}>영아 (4~11개월)</td><td style={cell}><strong>12~15h</strong></td><td style={cell}>낮잠 포함</td></tr>
                  <tr><td style={cell}>유아 (1~2세)</td><td style={cell}><strong>11~14h</strong></td><td style={cell}>낮잠 1~2회</td></tr>
                  <tr><td style={cell}>학령전 (3~5세)</td><td style={cell}><strong>10~13h</strong></td><td style={cell}>낮잠 점차 ↓</td></tr>
                  <tr><td style={cell}>학령기 (6~13세)</td><td style={cell}><strong>9~11h</strong></td><td style={cell}>학습·성장 영향</td></tr>
                  <tr><td style={cell}>청소년 (14~17세)</td><td style={cell}><strong style={{ color: 'var(--warning)' }}>8~10h</strong></td><td style={cell}>국내 중·고생 주중 평균 남 6.6h·여 5.9h (질병관리청 2025)</td></tr>
                  <tr><td style={cell}>젊은 성인 (18~25세)</td><td style={cell}><strong style={{ color: 'var(--accent-ink)' }}>7~9h</strong></td><td style={cell}>늦은 취침·불규칙 기상이 흔한 연령대</td></tr>
                  <tr><td style={cell}>성인 (26~64세)</td><td style={cell}><strong style={{ color: 'var(--accent-ink)' }}>7~9h</strong></td><td style={cell}>CDC도 성인 하루 7시간 이상 권고</td></tr>
                  <tr><td style={cell}>고령자 (65세+)</td><td style={cell}><strong>7~8h</strong></td><td style={cell}>분절 수면 흔함</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <p style={note}>
            위 범위는 <strong style={{ color: 'var(--text)' }}>미국 National Sleep Foundation(NSF) 2015</strong> 권장이며, 미국 CDC는 성인에게 &ldquo;하루 7시간 이상&rdquo;을 권합니다(상한은 따로 제시하지 않음). 본 도구는 본인 목표를 5~10시간 자유 설정 가능하니, 7시간으로도 낮 동안 개운하면 7시간을 목표로 두면 됩니다.
          </p>
        </section>

        {/* 6. 수면 부족 영향 */}
        <section>
          <h2 className="g-h2">수면 부족 영향 — 실험에서 확인된 것들</h2>
          <p className="g-p">
            &ldquo;몇 시간 부족하면 어떻게 된다&rdquo;는 시간표는 없지만, 수면을 통제한 실험에서 보고된 결과는 비교적 분명합니다. 아래는 본문에 인용한 연구의 핵심 결과를 상황별로 정리한 것입니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                <caption className="srOnly">수면 부족 상황별 연구 결과</caption>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>상황</th>
                    <th scope="col" style={headCell}>보고된 결과</th>
                    <th scope="col" style={headCell}>연구</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={cell}>17~19시간 연속 깨어 있음</td>
                    <td style={cell}>일부 인지·운동 과제 수행이 혈중알코올농도 0.05%와 같거나 더 나쁨</td>
                    <td style={cell}>Williamson &amp; Feyer 2000</td>
                  </tr>
                  <tr>
                    <td style={cell}>24시간 연속 깨어 있음</td>
                    <td style={cell}>손-눈 협응 과제 수행이 혈중알코올농도 약 0.10% 수준으로 저하</td>
                    <td style={cell}>Dawson &amp; Reid 1997</td>
                  </tr>
                  <tr>
                    <td style={cell}>하루 6시간 수면 × 14일</td>
                    <td style={cell}>주의력 저하가 매일 누적돼 이틀 철야와 비슷한 수준. 본인이 느끼는 졸림은 그만큼 늘지 않음</td>
                    <td style={cell}>Van Dongen 외 2003</td>
                  </tr>
                  <tr>
                    <td style={cell}>7일 수면 제한 후 3일 8시간 수면</td>
                    <td style={cell}>3일 회복으로는 수행 능력이 기준선까지 돌아오지 않음</td>
                    <td style={cell}>Belenky 외 2003</td>
                  </tr>
                  <tr>
                    <td style={cell}>평일 하루 5시간 + 주말 몰아 자기 반복</td>
                    <td style={cell}>인슐린 감수성 9~27% 저하, 저녁 이후 섭취·체중 증가 — 주말 수면이 막지 못함</td>
                    <td style={cell}>Depner 외 2019</td>
                  </tr>
                  <tr>
                    <td style={cell}>습관적으로 짧은 수면(수년)</td>
                    <td style={cell}>관상동맥질환·뇌졸중 발생·사망 위험 증가와 연관(관찰 연구 메타분석)</td>
                    <td style={cell}>Cappuccio 외 2011</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <Callout tone="warn">
              급성 철야(한 번에 오래 깨어 있음)와 여러 날에 걸친 부분 수면 제한은 기전이 다르고, 결과는 실험 조건·과제·개인차에 따라 달라집니다.
              위 표를 &ldquo;부채가 몇 시간이면 이런 증상&rdquo;이라는 시간표로 읽지 마세요. 다만 졸음이 느껴지지 않아도 운전·기계 조작 능력은 이미 떨어져 있을 수 있다는 점은 여러 연구가 공통으로 보여 줍니다.
            </Callout>
          </div>
        </section>

        {/* 7. 회복 전략 */}
        <section>
          <h2 className="g-h2">수면 부채 회복 전략 — 무엇이 진짜 효과 있나?</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                <caption className="srOnly">수면 부채 회복 전략 비교</caption>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>전략</th>
                    <th scope="col" style={headCell}>기대 효과</th>
                    <th scope="col" style={headCell}>비고</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={cell}>매일 목표보다 0.5~1h 더 자기</td>
                    <td style={{ ...cell, color: 'var(--success)', fontWeight: 700 }}>가장 권장</td>
                    <td style={cell}>생체리듬을 유지하면서 부채를 줄임. 이 도구 모델로 부채 7h, +1h씩이면 약 2주</td>
                  </tr>
                  <tr>
                    <td style={cell}>20~30분 낮잠 (오후 1~3시)</td>
                    <td style={{ ...cell, color: 'var(--success)', fontWeight: 700 }}>보조 효과 큼</td>
                    <td style={cell}>졸림·주의력 일시 개선. 30분을 넘기면 잠 관성·야간 수면 방해</td>
                  </tr>
                  <tr>
                    <td style={cell}>수면 환경 개선 (서늘하고 어둡고 조용하게)</td>
                    <td style={{ ...cell, color: 'var(--success)', fontWeight: 700 }}>보조 효과 큼</td>
                    <td style={cell}>같은 시간을 누워 있어도 중간에 깨는 횟수를 줄여 실제 수면을 늘림</td>
                  </tr>
                  <tr>
                    <td style={cell}>주말 +2~3h 늦잠</td>
                    <td style={{ ...cell, color: 'var(--warning)', fontWeight: 700 }}>제한적</td>
                    <td style={cell}>졸림은 줄지만 대사 영향은 막지 못했다는 실험(Depner 2019). 월요일 사회적 시차</td>
                  </tr>
                  <tr>
                    <td style={cell}>한 번에 12h 이상 몰아 자기</td>
                    <td style={{ ...cell, color: 'var(--danger)', fontWeight: 700 }}>비권장</td>
                    <td style={cell}>깬 뒤 멍함(잠 관성)·두통, 그날 밤 잠들기 어려워 다음 주 부채로 이어짐</td>
                  </tr>
                  <tr>
                    <td style={cell}>카페인으로 버티기</td>
                    <td style={{ ...cell, color: 'var(--danger)', fontWeight: 700 }}>회복 아님</td>
                    <td style={cell}>졸림을 가릴 뿐 부채는 그대로. 늦은 오후 섭취는 그날 밤 수면을 줄임</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 8. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 9. 본문 인용 연구 */}
        <section>
          <h2 className="g-h2">본문에 인용한 연구·공식 자료</h2>
          <div style={card}>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: '18px', margin: 0 }}>
              <li>
                <a href="https://www.thensf.org/how-many-hours-of-sleep-do-you-really-need/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>National Sleep Foundation — 연령별 권장 수면(2015)</a>
              </li>
              <li>
                <a href="https://www.nhlbi.nih.gov/health/insomnia" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>NHLBI — Insomnia (만성 불면: 주 3회·3개월 이상)</a>
              </li>
              <li>
                <a href="https://academic.oup.com/sleep/article-abstract/26/2/117/2709164" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>Van Dongen 외 2003 — The cumulative cost of additional wakefulness (SLEEP 26:117)</a>
              </li>
              <li>
                <a href="https://doi.org/10.1046/j.1365-2869.2003.00337.x" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>Belenky 외 2003 — Sleep dose-response study (J Sleep Res 12:1)</a>
              </li>
              <li>
                <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC1739867/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>Williamson &amp; Feyer 2000 — 중등도 수면 박탈과 혈중알코올 비교 (Occup Environ Med)</a>
              </li>
              <li>
                <a href="https://www.nature.com/articles/40775" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>Dawson &amp; Reid 1997 — Fatigue, alcohol and performance impairment (Nature)</a>
              </li>
              <li>
                <a href="https://www.cell.com/current-biology/fulltext/S0960-9822(19)30098-3" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>Depner 외 2019 — 주말 회복 수면과 대사 이상 (Current Biology)</a>
              </li>
              <li>
                <a href="https://www.kdca.go.kr/yhs/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>질병관리청 — 청소년건강행태조사 (주중 평균 수면시간)</a>
              </li>
            </ul>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', marginBottom: 0, lineHeight: 1.7 }}>
              국내 수면 건강 정보: 질병관리청 국가건강정보포털 · 대한수면연구학회. 본 도구의 수치는 위 자료를 바탕으로 한 일반 참고용 추정입니다.
            </p>
          </div>
        </section>

        {/* 10. 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/health/caffeine" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>☕</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>카페인 잔존량 트래커</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>취침 시 잔존량 영향</div>
            </Link>
            <Link href="/tools/health/blood-alcohol" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍺</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>혈중알코올 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>알코올과 수면 질</div>
            </Link>
            <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량(BMR)</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>대사·식욕과 수면</div>
            </Link>
            <Link href="/tools/life/pomodoro" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍅</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>뽀모도로 타이머</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>집중·휴식 관리</div>
            </Link>
            <Link href="/tools/health/weightloss" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎯</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>체중 감량 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>수면·체중 상관</div>
            </Link>
            <Link href="/tools/date/server-time" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>⏱️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>실시간 서버 시간</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>정확한 KST</div>
            </Link>
          </div>
        </section>

        {/* 11. 면책 — ToolPage가 시트 밖 맨 끝으로 옮긴다 */}
        <section>
          <Disclaimer variant="medical" open>
            본 도구는 <strong>일반 트래킹·교육용</strong>이며 수면 장애를 진단·치료하지 않습니다. 회복 효율 0.5는 단순화한 평균 모델이라 개인차가 큽니다.
            만성 불면·과수면·수면무호흡이 의심되면 수면클리닉 진료를 받으세요.
            <br />
            정신건강 위기상담 <strong>1577-0199</strong> · 자살예방상담 <strong>109</strong> (24시간).
          </Disclaimer>
        </section>

      </div>
    </ToolPage>
  )
}
