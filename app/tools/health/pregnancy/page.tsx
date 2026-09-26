import Link from 'next/link'
import PregnancyClient from './PregnancyClient'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import {
  CYCLE_LENGTHS, FETAL_SIZE_COMPARISON, PREGNANCY_TOTAL_DAYS, PREPARATION_CHECKLIST, PRENATAL_TESTS, TRIMESTERS,
} from './pregnancyUtils'
import ToolPage from '@/components/ToolPage'

const PREGNANCY_FAQ = [
  { q: '임신 주수는 어떻게 계산하나요?', a: '임신 주수는 마지막 생리 시작일로부터 계산합니다. 실제 수정은 배란일(생리 시작 후 약 14일)에 일어나지만, 정확한 배란일을 알기 어렵기 때문에 의학적으로는 마지막 생리 시작일을 기준으로 삼습니다. 따라서 임신 1주차는 아직 수정 전인 시기입니다.' },
  { q: '출산 예정일은 어떻게 계산하나요?', a: '출산 예정일은 마지막 생리 시작일로부터 280일(40주) 후입니다. 손으로 셈할 때는 네겔레 공식(마지막 생리 시작일 + 7일 − 3개월 + 1년)을 쓰는데, 달마다 일수가 달라 280일을 직접 더한 날짜보다 0~3일 늦게 나올 수 있습니다. 본 도구는 280일을 직접 더해 계산합니다. 실제 출산은 예정일 ±2주 사이에 일어나는 경우가 많습니다.' },
  { q: '초음파 주수와 생리 기준 주수가 달라요!', a: '초기 초음파 검사에서 태아의 크기(CRL, 머리-엉덩이 길이)를 측정하여 주수를 보정할 수 있습니다. 미국산부인과학회(ACOG) 위원회 의견 700번은 임신 9주 전에는 5일 넘게, 9주~14주 전에는 7일 넘게 차이 나면 초음파 기준으로 예정일을 바꾸도록 권합니다. 이 경우 의사가 새로 지정해 준 주수가 더 정확합니다. 본 계산기는 생리 기준 주수를 사용하므로, <strong>산부인과에서 보정받은 예정일이 있다면 [예정일 역산] 탭이나 &lsquo;출산 예정일&rsquo; 입력 방식으로 그 날짜를 넣어</strong> 주수를 맞추세요.' },
  { q: '임신 주수를 개월로 환산하면?', a: '국내에서는 4주를 1개월로 묶어 0~3주를 임신 1개월, 4~7주를 2개월로 셉니다. 예를 들어 28~31주는 임신 8개월, 36주부터 출산까지는 10개월(막달)입니다. 달력 기준(30~31일/월)과는 차이가 있으므로 임신 경과는 주수(week)로 소통하는 것이 가장 정확합니다.' },
  { q: '시험관(IVF) 임신이나 배란일을 정확히 알면 어떻게 입력하나요?', a: '입력 방식을 <strong>&lsquo;수정일(배란일)&rsquo;</strong>로 바꾸세요. 도구는 수정일에서 14일을 빼 마지막 생리일로 환산하고, 예정일은 수정일 + 266일이 됩니다. 시험관 임신은 ACOG가 배아 이식일과 배아 일령으로 예정일을 정하도록 권하는데, 이식일에서 배아 일령을 뺀 날짜(5일 배아면 이식일 − 5일, 3일 배아면 − 3일)를 수정일로 넣으면 같은 결과가 나옵니다(5일 배아: 이식일 + 261일). 수정일·예정일 입력 방식에는 생리주기 보정이 적용되지 않습니다.' },
  { q: '임신 초기 증상에는 어떤 것이 있나요?', a: '착상혈(소량 출혈), 유방 팽창 및 압통, 입덧(메스꺼움·구토), 피로감, 빈뇨, 미각·후각 변화 등이 나타날 수 있습니다. 증상의 정도는 개인차가 매우 크며, 아무런 증상이 없는 경우도 있습니다. <strong>구체적 증상 해석은 산부인과 상담을 권장합니다.</strong>' },
  { q: '산전 검사는 꼭 다 받아야 하나요?', a: '본 도구가 안내하는 검사들은 흔히 권장되는 일정이지만 모두 필수는 아닙니다.<br><br><strong>안전·태아 건강 직결 (필수에 가까움)</strong> — 첫 산전 검사 / 정밀 초음파 / 임신성 당뇨 검사 / GBS 검사 / 막달 검사·NST.<br><br><strong>선택적 검사 (산모 상황·가족력에 따라)</strong> — 기형아 검사(NIPT·쿼드 등) / 양수 검사(고위험 시).<br><br>비용·시기·필요성은 담당 산부인과와 상담 후 결정하세요. 임신이 확인되면 국민행복카드로 임신·출산 진료비 바우처(단태아 100만 원, 다태아는 태아 수에 따라 증액)를 신청해 진료비 본인부담금에 쓸 수 있습니다.' },
  { q: '태동을 언제부터 느끼나요?', a: '<strong>첫 임신(초산모)</strong>: 보통 18~22주차에 처음 느낌.<br><strong>경험 임신(경산모)</strong>: 보통 16~18주차에 더 빠름.<br><br>태동 종류:<br>· 초기: 가벼운 떨림·기포 터지는 느낌<br>· 중기: 분명한 발차기·움직임<br>· 후기: 강한 움직임·딸꾹질<br><br>28주차 이후는 매일 태동 횟수 기록을 권장하며, <strong>태동이 감소하면 즉시 산부인과 상담</strong>하세요.' },
  { q: '쌍태아 임신은 어떻게 적용하나요?', a: '출산 예정일 계산은 동일하게 가능하지만 다음이 다릅니다.<br><br><strong>검진 빈도</strong> — 단태아: 4주 간격 → 후기 1~2주 / 쌍태아: 더 자주 (2~3주 간격).<br><strong>추가 검사</strong> — 추가 정밀 초음파 / 임신성 당뇨 위험↑ / 자궁경부 길이 측정(조산 위험↑).<br><strong>분만 시기</strong> — 쌍태아는 절반 이상이 37주 전에 태어납니다(ACOG). 합병증이 없어도 분만 시기는 융모막 형태에 따라 달라, 이융모막 쌍태아는 38주대, 단일융모막 쌍태아는 그보다 이르게 계획하는 것이 일반적입니다.<br><br>본 도구의 일반 일정은 단태아 기준이므로, 쌍태아 임신은 담당 산부인과의 일정 안내를 우선하세요.' },
  { q: '임신 중 카페인·약은 어떻게 해야 하나요?', a: '본 도구는 일반 가이드라인만 제공하며, 구체적 결정은 의료진 상담이 필수입니다.<br><br><strong>카페인</strong> — 식약처는 임산부 하루 최대 섭취 권고량을 300mg 이하로, ACOG는 200mg 이하(커피 1~2잔)로 제시합니다. WHO도 하루 300mg을 넘게 마시는 임신부에게 섭취를 줄이도록 권고합니다. 임신 중에는 카페인이 몸에 더 오래 남으므로 더 낮은 기준을 따르는 편이 안전합니다.<br><br><strong>약물</strong> — 임신 전 복용 약: 즉시 산부인과 상담 / 처방약: 의사·약사에게 임신 알림 / 일반의약품(감기약·진통제 등): 1삼분기 피해야 할 약 多 / 한약·영양제: 안전성 확인 후.<br><br>"임신 중 안전" 표시도 본인 상황별로 다를 수 있으니 <strong>반드시 산부인과 또는 약사 상담 후 복용</strong>하세요.' },
]

export const metadata = buildMetadata({
  path: '/tools/health/pregnancy',
  title: '임신 주수 계산기 — 출산 예정일·산전 검사·태아 크기·체크리스트',
  description:
    '지금 임신 몇 주차 + 산전 검사 일정·태아 크기 비교·출산 준비 체크리스트를 자동 타임라인으로. 생리주기 보정 포함.',
  keywords: [
    '임신주수계산기', '출산예정일계산기', '임신주수', '임신계산기',
    '출산예정일', '산전검사일정', '태아크기', '네겔레공식',
    '임신 체크리스트', '삼분기', '임신 캘린더',
  ],
})

/* ── 본문 예시 날짜: pregnancyUtils와 같은 규칙(LMP + (주기 − 28) + 280일)으로 빌드 시 계산 ── */
const EX_LMP: [number, number, number] = [2026, 5, 1]
const exDate = (addDays: number) => new Date(EX_LMP[0], EX_LMP[1] - 1, EX_LMP[2] + addDays)
const fmtK = (d: Date) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
const fmtMD = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`
const EX_DUE = exDate(PREGNANCY_TOTAL_DAYS)
const EX_NAEGELE = new Date(EX_LMP[0] + 1, EX_LMP[1] - 1 - 3, EX_LMP[2] + 7)
const CYCLE_ROWS = CYCLE_LENGTHS.map(c => ({
  ...c,
  ovulation: exDate(c.value - 14),               // 보정된 데이팅 LMP + 14일
  due: exDate(c.adjustment + PREGNANCY_TOTAL_DAYS),
}))
const CHECKLIST_TOTAL = Object.values(PREPARATION_CHECKLIST).reduce((a, l) => a + l.length, 0)
const FETAL_WEEKS = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40]
const TRI_COLOR = Object.fromEntries(TRIMESTERS.map(t => [t.id, t.color])) as Record<1 | 2 | 3, string>

const th: React.CSSProperties = { padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, fontSize: '12px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }
const td: React.CSSProperties = { padding: '9px 10px', color: 'var(--text)', fontSize: '13px', borderBottom: '1px solid var(--border)', verticalAlign: 'top' }
const note: React.CSSProperties = { fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }

export default function PregnancyPage() {
  return (
    <ToolPage width={760} slug="/tools/health/pregnancy">
      <h1 className="tp-h1">
        <ToolIconBadge catId="health" />임신 주수 계산기
      </h1>
      <p className="tp-lead">
        지금 임신 몇 주차인지 + 산전 검사·태아 크기·출산 준비를 <strong style={{ color: 'var(--text)' }}>자동 타임라인</strong>으로.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="네겔레 공식 — 마지막 생리일(LMP) + 280일(40주) = 출산 예정일, 배란 LMP+14일·주기 28일 외 ±보정, GBS 검사 36~37주 일정"
        sources={[
          { label: 'NCBI Bookshelf — Estimated Date of Delivery', href: 'https://www.ncbi.nlm.nih.gov/books/NBK536986/' },
          { label: 'ACOG — GBS 조기 감염 예방 지침', href: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2020/02/prevention-of-group-b-streptococcal-early-onset-disease-in-newborns' },
          { label: 'ACOG 위원회 의견 700 — 출산 예정일 산정법', href: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date' },
          { label: 'WHO(2016) — 산전 진료 권고', href: 'https://www.ncbi.nlm.nih.gov/books/NBK409108/' },
          { label: '보건복지부 — 임신·출산 진료비 지원', href: 'https://www.mohw.go.kr/menu.es?mid=a10705020100' },
        ]}
      />

      <PregnancyClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 네겔레 공식 ── */}
        <section>
          <h2 className="g-h2">
            출산 예정일 산출법 — 네겔레 공식
          </h2>
          <p className="g-p">
            네겔레 공식(Naegele&apos;s Rule)은 1800년대 독일 산부인과 의사 프란츠 카를 네겔레가 정리한 출산 예정일 계산법입니다.
            마지막 생리 시작일(LMP)로 예정일을 셈하는 표준 방법이며, 임신 초기에 초음파를 봤다면 그 결과로 예정일을 보정합니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: '20px 22px', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--cat-date-ink)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px' }}>
              네겔레 공식 (Naegele&apos;s Rule)
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {[
                { label: '출산 예정일', isResult: true },
                { label: '=', isSym: true },
                { label: '마지막 생리\n시작일', isInput: true },
                { label: '+', isSym: true },
                { label: '7일', isOp: true },
                { label: '−', isSym: true },
                { label: '3개월', isOp: true },
                { label: '+', isSym: true },
                { label: '1년', isOp: true },
              ].map((item, i) => (
                item.isSym
                  ? <span key={i} style={{ fontSize: '20px', color: 'var(--muted)', fontWeight: 700, flexShrink: 0 }}>{item.label}</span>
                  : <div key={i} style={{
                    background: item.isResult ? 'var(--cat-date-soft)' : item.isInput ? 'var(--bg3)' : 'var(--accent-soft)',
                    border: `1px solid ${item.isResult ? 'var(--cat-date)' : item.isInput ? 'var(--border)' : 'var(--accent-line)'}`,
                    borderRadius: 'var(--radius-s)', padding: '8px 12px', textAlign: 'center',
                    fontSize: '12px', fontWeight: 600, whiteSpace: 'pre-line', lineHeight: 1.4,
                    color: item.isResult ? 'var(--cat-date-ink)' : item.isInput ? 'var(--text)' : 'var(--accent-ink)',
                  }}>{item.label}</div>
              ))}
            </div>
            <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius-s)', padding: '12px 14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <strong style={{ color: 'var(--text)' }}>예시:</strong> 마지막 생리 시작일이 <strong style={{ color: 'var(--text)' }}>{fmtK(exDate(0))}</strong>이라면<br />
                → {fmtMD(exDate(0))} + 7일 = {fmtMD(exDate(7))} → − 3개월 → + 1년 = {fmtK(EX_NAEGELE)} (네겔레 셈법)<br />
                → 280일을 직접 더하면 <strong style={{ color: 'var(--cat-date-ink)' }}>{fmtK(EX_DUE)}</strong>로, 본 도구는 이 날짜를 출산 예정일로 표시합니다. 달마다 일수가 달라 네겔레 셈법이 0~3일 늦게 나올 수 있습니다.
              </p>
            </div>
          </div>

          <p className="g-p">
            네겔레 공식은 생리 주기가 28일이고 배란이 14일째 일어난다는 가정을 기반으로 합니다.
            생리 주기가 불규칙하거나 길/짧은 경우 실제 예정일과 차이가 날 수 있습니다. 미국산부인과학회(ACOG)는 임신 초기 초음파의 머리-엉덩이 길이(CRL)로 잰 주수가 9주 전에는 5일 넘게, 9주~14주 전에는 7일 넘게 LMP 주수와 다르면 초음파 기준으로 예정일을 바꾸도록 권합니다.
          </p>
        </section>

        {/* ── 2. 삼분기별 변화 ── */}
        <section>
          <h2 className="g-h2">삼분기별 주요 변화</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 1 as const, items: ['수정란 착상 → 배아 형성', '심장·뇌·척수 등 주요 장기 형성', '입덧 시작 (8~10주에 최고조)', '첫 산전 검사 및 기형아 1차 검사'] },
              { id: 2 as const, items: ['입덧 감소, 안정기 진입', '태동 시작 (18~22주)', '성별 확인 가능 (초음파)', '정밀 초음파, 기형아 2차 검사'] },
              { id: 3 as const, items: ['태아 급성장 (체중·폐 발달)', '분만 준비 교육 권장', 'GBS 검사, NST(태아심박동 검사)', '출산 준비 (입원 가방 등)'] },
            ].map(t => {
              const tri = TRIMESTERS.find(x => x.id === t.id)!
              return (
                <div key={t.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `4px solid ${tri.color}`, borderRadius: 'var(--radius-m)', padding: '16px 20px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: tri.color, marginBottom: '10px' }}>{tri.name} ({tri.startWeek}~{tri.endWeek}주)</p>
                  <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {t.items.map((item, j) => (
                      <li key={j} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{item}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── 3. 산전 검사 가이드 (pregnancyUtils PRENATAL_TESTS) ── */}
        <section>
          <h2 className="g-h2">
            산전 검사 가이드
          </h2>
          <p className="g-p">
            아래 표는 도구의 [산전 검사] 탭이 날짜를 계산할 때 쓰는 일정 그대로입니다. 국내 산부인과에서 흔히 안내하는 시기를 정리한 일반 가이드이며, 시작 주차의 첫날부터 끝 주차의 마지막 날(예: 36~37주 → 37주 6일)까지를 권장 기간으로 봅니다.
            WHO(2016)는 임신 중 최소 8회의 산전 진료 접촉과 24주 전 1회 이상의 초음파를 권고합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
              <caption className="srOnly">산전 검사 일정</caption>
              <thead>
                <tr>
                  <th scope="col" style={th}>검사</th>
                  <th scope="col" style={{ ...th, textAlign: 'center' }}>주차</th>
                  <th scope="col" style={th}>목적</th>
                  <th scope="col" style={th}>구분</th>
                </tr>
              </thead>
              <tbody>
                {PRENATAL_TESTS.map(t => (
                  <tr key={t.id}>
                    <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left' }}>{t.name}</th>
                    <td style={{ ...td, textAlign: 'center', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{t.startWeek}~{t.endWeek}주</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{t.desc}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap', color: t.importance === 'essential' ? 'var(--text)' : 'var(--muted)' }}>{t.importance === 'essential' ? '필수에 가까움' : '상황에 따라'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '12px' }}>
            <Callout tone="warn">
              검사 시기·항목은 병원·산모 상태·고위험 임신 여부·쌍태아 여부에 따라 달라질 수 있으며, 본 도구의 일정은 일반 가이드라인입니다. 실제 일정은 담당 산부인과의 안내를 우선하세요.
            </Callout>
          </div>
        </section>

        {/* ── 4. 태아 크기 비유 (pregnancyUtils FETAL_SIZE_COMPARISON) ── */}
        <section>
          <h2 className="g-h2">
            태아 크기 비유 가이드
          </h2>
          <p className="g-p">
            주차별 태아 크기를 과일·채소에 빗댄 일반 비유입니다(참고용 · 의학적 진단 X). 도구 [태아 크기] 탭의 데이터 중 4주 간격만 옮겼습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
              <caption className="srOnly">주차별 태아 크기 비유와 발달</caption>
              <thead>
                <tr>
                  <th scope="col" style={th}>주차</th>
                  <th scope="col" style={th}>크기 비유</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>길이</th>
                  <th scope="col" style={th}>이 시기 발달</th>
                </tr>
              </thead>
              <tbody>
                {FETAL_WEEKS.map(wk => {
                  const f = FETAL_SIZE_COMPARISON[wk]
                  return (
                    <tr key={wk}>
                      <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left', color: 'var(--cat-date-ink)' }}>{wk}주</th>
                      <td style={td}>{f.size}</td>
                      <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>{f.length}</td>
                      <td style={{ ...td, color: 'var(--muted)' }}>{f.development}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p style={note}>
            20주까지는 머리~엉덩이 길이, 21주부터는 머리~발끝 길이 기준이라 그 사이 수치가 크게 늘어납니다. 비유는 일반 가이드이며 정확한 태아 크기는 초음파 검사로만 확인 가능합니다. 본 도구 [태아 크기] 탭에서 1~40주 전체 그리드를 확인할 수 있습니다.
          </p>
        </section>

        {/* ── 5. 출산 준비 체크리스트 ── */}
        <section>
          <h2 className="g-h2">
            삼분기별 출산 준비 체크리스트
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 1 as const, items: ['산부인과 등록·정기 검진 시작', '엽산 섭취 시작 (산부인과 상담)', '음주·흡연·카페인 제한', '직장·보험 검토', '입덧 기록·식이 조절'] },
              { id: 2 as const, items: ['정밀 초음파 (20~24주)', '임신성 당뇨 검사', '태동 기록 시작', '산모교실·임산부 요가', '출산 병원 결정', '태명 정하기'] },
              { id: 3 as const, items: ['GBS 검사 (36~37주)', '출산 가방·신생아 용품', '아기침대·카시트', '산후조리원 예약', '분만 신호 학습', '응급 연락처 준비', '출산 휴가·육아 휴직 신청'] },
            ].map(t => {
              const tri = TRIMESTERS.find(x => x.id === t.id)!
              return (
                <div key={t.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `4px solid ${TRI_COLOR[t.id]}`, borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: TRI_COLOR[t.id], marginBottom: '8px' }}>{tri.name} ({tri.startWeek}~{tri.endWeek}주)</p>
                  <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {t.items.map((it, j) => (
                      <li key={j} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{it}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
          <p style={note}>
            본 도구의 [체크리스트] 탭에서 {CHECKLIST_TOTAL}개 항목 진행률을 이 브라우저에 저장해 추적할 수 있습니다. 개인 상황·고위험·다태아 시 추가/변경 항목이 있을 수 있으니 담당 산부인과와 상담하세요.
          </p>
        </section>

        {/* ── 6. 생리주기 보정 (pregnancyUtils CYCLE_LENGTHS) ── */}
        <section>
          <h2 className="g-h2">
            생리주기 보정의 중요성
          </h2>
          <p className="g-p">
            네겔레 공식은 28일 주기 가정입니다. 배란 뒤 다음 생리까지(황체기)는 약 14일로 비교적 일정하고 주기 길이의 차이는 주로 배란 전 기간에서 생기므로, 도구는 주기가 28일보다 긴 만큼 배란과 예정일을 늦추고 짧은 만큼 앞당깁니다.
            아래는 마지막 생리 시작일이 {fmtK(exDate(0))}일 때 도구가 계산하는 값입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '420px' }}>
              <caption className="srOnly">생리주기별 예정일 보정 예시</caption>
              <thead>
                <tr>
                  <th scope="col" style={th}>생리 주기</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>보정</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>추정 배란일</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>출산 예정일</th>
                </tr>
              </thead>
              <tbody>
                {CYCLE_ROWS.map(c => (
                  <tr key={c.value} style={c.value === 28 ? { background: 'var(--accent-soft)' } : undefined}>
                    <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 700 }}>{c.name}</th>
                    <td style={{ ...td, textAlign: 'right' }}>{c.adjustment === 0 ? '0일' : `${c.adjustment > 0 ? '+' : '−'}${Math.abs(c.adjustment)}일`}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{fmtMD(c.ovulation)}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{fmtK(c.due)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={note}>
            <strong style={{ color: 'var(--text)' }}>불규칙 주기 시</strong> — 보정은 &lsquo;평소 주기가 일정하다&rsquo;는 전제의 추정이라, 주기가 들쭉날쭉하면 초음파 기준 주수가 더 정확합니다. 본 도구 [고급 옵션]에서 본인 주기를 설정하면 자동 보정되며, 산부인과에서 초음파 기준으로 주수를 보정받았다면 그 결과를 우선 적용하세요.
          </p>
        </section>

        {/* ── 7. 임신 중 응급 신호 ── */}
        <section>
          <Callout tone="warn" title="임신 중 응급 신호 — 다음 증상 시 즉시 의료기관">
            <ul style={{ paddingLeft: '20px', margin: '0 0 8px' }}>
              {[
                '질 출혈 (소량이라도)',
                '심한 복통·경련',
                '발열 (38℃ 이상)',
                '심한 두통·시야 변화 (자간전증 의심)',
                '부종 급증 (얼굴·손)',
                '태동 감소 (2삼분기 이후)',
                '양수 누출 의심',
              ].map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
            즉시 <strong>119</strong> 또는 가까운 산부인과 응급실로 연락하세요.
          </Callout>
        </section>

        {/* ── 8. FAQ ── */}
        <section>
          <Faq items={PREGNANCY_FAQ} />
        </section>

        {/* ── 9. 면책 ── */}
        <section>
          <Disclaimer variant="medical" open>
            정확한 임신 주수는 초음파 검사로만 확인할 수 있습니다. 본 도구의 산전 검사 일정은 일반 가이드라인이고, 태아 크기·발달은 정상 범위 안에서도 개체차가 큽니다. 이 정보로 자가 진단·자가 처방은 하지 마세요.
            <br />
            본 도구의 정보는 <strong>공개된 산과 지침(ACOG·WHO)과 국내에서 일반적으로 안내되는 진료 일정</strong>을 바탕으로 일반화한 추정치이며, 개별 산모·태아에 적용 시 반드시 의료진 상담이 필요합니다.
            <br />
            응급 시 — 즉시 <strong>119</strong> 또는 가까운 산부인과 응급실.
          </Disclaimer>
        </section>

        {/* ── 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/dday',         icon: '📅', name: 'D-day 계산기',           desc: '출산 예정일 카운트다운' },
              { href: '/tools/health/bmi',        icon: '⚖️', name: 'BMI 계산기',             desc: '임신 전·후 적정 체중' },
              { href: '/tools/health/weightloss', icon: '🎯', name: '체중 감량 기간 계산기',   desc: '산후 체중 관리 (출산 후)' },
              { href: '/tools/date/age',          icon: '🎂', name: '만 나이 계산기',         desc: '아이 나이·예방접종 일정' },
              { href: '/tools/health/bmr',        icon: '🔥', name: '기초대사량 계산기',       desc: '하루 소비 칼로리 (임신 중엔 별도 기준)' },
              { href: '/tools/date/lunar',        icon: '🌙', name: '음양력 변환기',           desc: '명리·전통 활용 시' },
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
        </section>

      </div>
    </ToolPage>
  )
}
