import DdayClient from './DdayClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import Callout from '@/components/Callout'
import { addDays, calcBusinessDays, calcWeekdays, fmtDateKo } from './ddayUtils'

export const metadata = buildMetadata({
  path: '/tools/date/dday',
  title: 'D-Day 계산기 — 카운트다운, 진행률, 영업일, 페이스 계산',
  description:
    '여러 D-day 저장 + 진행률·평일·영업일 페이스 계산 + 반복 D-day와 두 날짜 사이 일수까지.',
  keywords: [
    'D-day 계산기', '디데이 계산기', '날짜 카운트다운', '평일 계산', '영업일 계산',
    '두 날짜 사이', 'D+ 계산', '시험 D-day', '여행 카운트다운', '진행률 계산',
    '날짜 차이 계산기', '디데이 관리', '한국 공휴일', '페이스 계산', '반복 D-day',
    '수능 디데이', '결혼 디데이',
  ],
})

const FAQ_LD = [
              {
                q: 'D-day 데이터는 어디에 저장되나요?',
                a: '사용자 브라우저의 <strong>localStorage</strong>에 저장됩니다. 회원가입·로그인 불필요, 빠른 접근, 사생활 보호(서버 저장 X). 다만 같은 브라우저·기기에서만 접근 가능하며 캐시 삭제·시크릿 모드 시 사라집니다. 다른 기기 사용 시 [📥 백업 다운로드] 기능으로 JSON 파일을 저장하시기 바랍니다.',
              },
              {
                q: '영업일 계산은 어떤 공휴일이 반영되나요?',
                a: '<strong>한국 법정 공휴일 2026~2030년</strong> 자동 반영: 신정, 설날 3일, 삼일절, <strong>노동절(5/1)</strong>, 어린이날, 부처님오신날, 현충일, <strong>제헌절(7/17)</strong>, 광복절, 추석 3일, 개천절, 한글날, 성탄절 + 대체 공휴일. 2026년 개정(대통령령 제36290호)으로 <strong>노동절은 2026-05-01부터, 제헌절은 2026-05-11부터</strong> 관공서 공휴일로 편입됐고 <strong>둘 다 대체공휴일 대상</strong>입니다. <strong>임시 공휴일</strong>은 정부 발표 시 업데이트됩니다. 회사별 공휴일·연차는 본 도구에서 처리하지 않으니 별도 관리하세요.',
              },
              {
                q: '평일과 영업일의 차이는?',
                a: '<strong>평일</strong>은 월~금, <strong>영업일</strong>은 평일에서 공휴일을 제외한 실제 일하는 날입니다. 예: 5월 5일(어린이날)이 화요일이면 평일이지만 영업일은 아닙니다. 법적·계약상 기한 계산은 보통 영업일 기준, 학습·준비 기간 계산은 평일 기준이 일반적입니다.',
              },
              {
                q: '페이스 계산은 어떤 목표에 적합한가요?',
                a: '<strong>분할 가능한 모든 목표</strong>에 적용 가능합니다 — 학습(페이지·단어·문제), 운동(km·횟수·체중), 저축(금액), 글쓰기(글 수·단어), 다이어트(kg). 현재 페이스 분석으로 <strong>목표 달성 가능 여부와 추가 노력량</strong>을 파악할 수 있어 장기 목표 관리에 유용합니다.',
              },
              {
                q: '반복 D-day는 어떻게 작동하나요?',
                a: '반복 D-day는 다음 발생일을 자동 계산합니다. 예: 매년 반복 생일 D-day는 올해 생일이 지나면 자동으로 내년 생일로 갱신됩니다. 매월 반복(월급일·결제일)도 다음 달 자동 갱신됩니다. 반복 옵션: <strong>매년·매월·매주</strong>. 한 번 설정으로 평생 자동 관리됩니다.',
              },
              {
                q: '"날짜 차이 계산기"는 어디로 갔나요?',
                a: '<strong>본 도구의 [두 날짜 차이] 탭으로 통합</strong>되었습니다. 기존 <code>/tools/date/diff</code> 주소는 자동으로 본 페이지로 redirect 되며, 두 날짜 사이의 일수·평일·영업일·공휴일·년월일 차이를 모두 한곳에서 계산할 수 있습니다.',
              },
            ]

/* 기념일 셈법 표 — 빌드 시 ddayUtils로 계산 (계산기와 같은 함수). 기준 시작일은 예시일 뿐 */
const ANNIV_START = '2026-03-01'
const ANNIV_ROWS = [
  { label: '100일', n: 99 },
  { label: '200일', n: 199 },
  { label: '300일', n: 299 },
  { label: '1주년', n: 365 },
  { label: '500일', n: 499 },
  { label: '1000일', n: 999 },
].map(r => ({ ...r, date: fmtDateKo(addDays(ANNIV_START, r.n, 'calendar')) }))

/* 월별 평일·영업일 — 빌드 시 ddayUtils(lib/krHolidays 공휴일 데이터)로 계산 */
const BIZ_YEARS = [2026, 2027] as const
const BIZ_MONTHS = Array.from({ length: 12 }, (_, i) => {
  const m = i + 1
  const cells = BIZ_YEARS.map(y => {
    const mm = String(m).padStart(2, '0')
    const last = new Date(y, m, 0).getDate()
    const from = `${y}-${mm}-01`
    const to = `${y}-${mm}-${String(last).padStart(2, '0')}`
    return { weekdays: calcWeekdays(from, to), biz: calcBusinessDays(from, to) }
  })
  return { m, cells }
})
const BIZ_TOTALS = BIZ_YEARS.map((y, yi) => ({
  y,
  weekdays: BIZ_MONTHS.reduce((s, r) => s + r.cells[yi].weekdays, 0),
  biz: BIZ_MONTHS.reduce((s, r) => s + r.cells[yi].biz, 0),
}))

export default function DdayPage() {
  return (
    <ToolPage width={880} slug="/tools/date/dday">
      <h1 className="tp-h1">
        <ToolIconBadge catId="date" />D-Day 계산기
      </h1>
      <p className="tp-lead">
        여러 D-day 저장 + <strong style={{ color: 'var(--text)' }}>진행률·평일·영업일</strong> 페이스 + 반복 D-day.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="시험 일정은 시행기관 공고 기준 · 공휴일 2026~2030년 반영"
        sources={[
          { label: '국가법령정보센터(관공서의 공휴일에 관한 규정)', href: 'https://www.law.go.kr' },
          { label: '공휴일에 관한 법률 — 국가법령정보센터', href: 'https://www.law.go.kr/법령/공휴일에관한법률' },
          { label: '한국산업인력공단 Q-Net', href: 'https://www.q-net.or.kr' },
          { label: '한국교육과정평가원 수능', href: 'https://www.suneung.re.kr' },
        ]}
      />

      <DdayClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. D-day vs D+ */}
        <section>
          <h2 className="g-h2">D-day와 D+의 차이</h2>
          <p className="g-p">
            <strong style={{ color: 'var(--text)' }}>D-day</strong>는 목표 날짜까지 남은 일수, <strong style={{ color: 'var(--text)' }}>D+</strong>는 지난 날짜로부터 경과한 일수입니다. 본 도구는 둘 다 자동 표시합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'D-30',  desc: '시험까지 30일 남음 (미래 카운트다운)' },
              { label: 'D-day', desc: '오늘이 목표 날짜 (D-0과 동일)' },
              { label: 'D+1',   desc: '어제가 목표 날짜였음' },
              { label: 'D+99', desc: '시작일을 1일째로 세는 「100일」(연애·백일·입사 100일)' },
            ].map((it, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', color: 'var(--accent)', fontWeight: 800 }}>{it.label}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px', lineHeight: 1.6 }}>{it.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 주요 시험·이벤트 D-day (확정 일정) */}
        <section>
          <h2 className="g-h2">주요 시험·이벤트 D-day (확정 일정)</h2>
          <p className="g-p">
            시행기관이 공고한 <strong style={{ color: 'var(--text)' }}>확정 일정</strong>만 모았습니다. 날짜를 상단 계산기의 목표 날짜에 그대로(<code>YYYY-MM-DD</code>) 입력하면 남은 달력일·평일·영업일이 즉시 계산되고, D-day로 저장하면 매일 자동 갱신됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['일정', '날짜 (입력용)', '시행기관', '비고'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['한국사능력검정 제80회',        '2026-10-17 (토)', '국사편찬위원회',        '심화만 시행 · 접수 9/15~9/22'],
                  ['제37회 공인중개사 자격시험',    '2026-10-31 (토)', '한국산업인력공단(Q-Net)', '1·2차 동시 · 합격자 발표 12/2'],
                  ['토익 제581회 정기시험',        '2026-10-31 (토)', '한국토익위원회',        '토요일 시행 회차'],
                  ['2027학년도 대학수학능력시험',   '2026-11-19 (목)', '교육부',               '원서접수(방문) 8/24~9/4'],
                  ['수능 성적 통지',              '2026-12-11 (금)', '교육부',               '수능과 별도 D-day 저장 추천'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            시행기관 공고 기준(2026-07 확인). 시험 일정은 변경될 수 있으니 응시 전 반드시 시행기관 원문 공고를 재확인하세요. 수능처럼 학습량이 걸린 시험은 남은 <strong style={{ color: 'var(--text)' }}>평일 수</strong>에 아래 페이스 계산을 결합하면 하루 학습량까지 나옵니다.
          </p>
        </section>

        {/* 3. 평일 vs 영업일 vs 달력일 */}
        <section>
          <h2 className="g-h2">평일·영업일·달력일 차이</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['구분', '월~금', '주말', '한국 공휴일', '활용'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['달력일', '포함', '포함', '포함', '여행·기념일·체류 일수'],
                  ['평일',   '포함', '제외', '포함', '시험 준비·학습'],
                  ['영업일', '포함', '제외', '제외', '계약·법적 기한·배송'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row[3]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', marginTop: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '6px' }}>실전 예시 — &ldquo;계약 후 영업일 10일&rdquo; 기한 산정</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '8px' }}>
              2026-09-21(월) 계약 체결, 다음 날부터 기산해 영업일 10일 이내 지급 조건이라면:
            </p>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
              <li>· 9/22(화)~23(수) = <strong style={{ color: 'var(--text)' }}>2영업일</strong> → 추석 연휴(9/24~26)·일요일 건너뜀</li>
              <li>· 9/28(월)~10/2(금) = <strong style={{ color: 'var(--text)' }}>7영업일째</strong> → 개천절(10/3)·대체공휴일(10/5) 건너뜀</li>
              <li>· 10/6(화)~10/8(목) = 10영업일째 → 기한일 <strong style={{ color: 'var(--accent)' }}>2026-10-08(목)</strong></li>
            </ul>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8, marginTop: '8px' }}>
              달력일로는 17일 — 주말 4일과 평일에 낀 공휴일 3일(추석 연휴 9/24·25, 개천절 대체 10/5)이 빠진 결과입니다. 본 도구의 영업일 계산은 이 공휴일들을 자동 제외합니다. 기산 방식(계약 당일 포함 여부)은 계약 문언에 따라 다를 수 있으니 계약서를 먼저 확인하세요.
            </p>
          </div>
        </section>

        {/* 4. 한국 공휴일 */}
        <section>
          <h2 className="g-h2">한국 공휴일 (2026~2030 자동 반영)</h2>
          <p className="g-p">
            본 도구는 영업일 계산 시 <strong style={{ color: 'var(--text)' }}>한국 법정 공휴일</strong>을 자동 반영합니다 — 신정·설날(3일)·삼일절·노동절(5/1, 2026~)·어린이날·부처님오신날·현충일·제헌절(7/17, 2026~)·광복절·추석(3일)·개천절·한글날·성탄절 + 대체 공휴일.
          </p>
          <Callout tone="warn" title="임시공휴일·회사 휴무일은 자동 반영되지 않습니다">
            <strong>임시공휴일</strong>(정부 발표)·회사별 공휴일은 계산에 들어가지 않습니다. 노동절(2026-05-01 시행)과 제헌절(2026-05-11 시행)은 대통령령 제36290호로 관공서 공휴일에 편입됐고, 토·일이나 다른 공휴일과 겹치면 대체공휴일이 부여됩니다.
          </Callout>
          <h3 className="g-h3">월별 평일·영업일 수 (2026·2027)</h3>
          <p className="g-p">
            계산기와 같은 공휴일 데이터로 각 달 1일~말일(양 끝 포함)을 센 값입니다. 월 단위 업무 일정, 일할 계산, 배송·처리 기한을 가늠할 때 기준으로 쓸 수 있습니다.
            설·추석이 평일에 걸린 달은 평일과 영업일의 차이가 2~3일로 벌어집니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 360 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>월</th>
                  {BIZ_YEARS.map(y => (
                    <th scope="col" key={y} style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{y}년 평일 / 영업일</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BIZ_MONTHS.map((r, i) => (
                  <tr key={r.m} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text)', fontWeight: 600 }}>{r.m}월</th>
                    {r.cells.map((c, j) => (
                      <td key={j} style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text)' }}>
                        {c.weekdays} / <strong style={{ color: c.biz < c.weekdays ? 'var(--accent-ink)' : 'var(--text)' }}>{c.biz}</strong>
                      </td>
                    ))}
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--border)' }}>
                  <th scope="row" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text)', fontWeight: 700 }}>연간</th>
                  {BIZ_TOTALS.map(t => (
                    <td key={t.y} style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontWeight: 700 }}>{t.weekdays} / {t.biz}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 영업일 = 월~금 중 법정공휴일·대체공휴일·전국 선거일이 아닌 날. 2026년은 5월 노동절·6월 지방선거일이 포함됩니다. 노동절(2027년은 토요일이라 대체공휴일 5/3)에 정상 근무하는 사업장이라면 그만큼 5월 영업일을 더해서 보세요.
          </p>
        </section>

        {/* 5. 진행률 계산 */}
        <section>
          <h2 className="g-h2">진행률 계산</h2>
          <p className="g-p">
            <strong style={{ color: 'var(--text)' }}>시작일 + 목표일 + 오늘</strong>로 진행률(%)을 계산합니다:
          </p>
          <pre style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)' }}>
{`진행률 = (오늘 - 시작일) / (목표일 - 시작일) × 100`}
          </pre>
          <p className="g-p">
            진행률의 분모는 시작일과 목표일의 날짜 차이(시작일 제외)라, 시작일 당일은 0%, 목표일 당일은 100%입니다. 오늘이 시작일보다 앞이면 0%, 목표일을 지나면 100%로 고정됩니다.
            활용 예: 프로젝트 진행 상황 · 학습 목표 달성률 · 다이어트·금연 등 장기 목표 · 임신 주수 · 군 복무 진행률.
          </p>
        </section>

        {/* 6. 페이스 계산 */}
        <section>
          <h2 className="g-h2">페이스 계산 — 목표 달성 도구</h2>
          <p className="g-p">
            <strong style={{ color: 'var(--text)' }}>목표 + 총량 + 현재 완료량</strong>으로 일일 페이스를 자동 산출합니다.
          </p>
          <pre style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)', lineHeight: 1.8 }}>
{`일일 목표  = 남은 분량 / 남은 일수
현재 페이스 = 완료량 / 경과 일수
예상 완료량 = 완료량 + 현재 페이스 × 남은 일수
부족분     = 목표 − 예상 완료량`}
          </pre>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
            {[
              { case: '시험 교재', detail: '600페이지 / 30일 → 일일 20페이지' },
              { case: '외국어 단어', detail: '1,000개 / 100일 → 일일 10개' },
              { case: '저축 목표', detail: '1,000만원 / 12개월 → 월 83만원' },
              { case: '러닝 누적 거리', detail: '300km / 12주 → 주간 25km' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>{c.case}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 반복 D-day */}
        <section>
          <h2 className="g-h2">반복 D-day</h2>
          <p className="g-p">
            매년·매월·매주 반복되는 D-day는 자동으로 다음 발생일을 갱신합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {[
              { label: '매년', items: ['생일', '결혼기념일', '창립일', '회사 입사일'] },
              { label: '매월', items: ['월급일', '카드 결제일', '구독 갱신', '월간 보고서'] },
              { label: '매주', items: ['정기 회의', '운동 약속', '주간 보고서', '가족 식사'] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{g.label}</p>
                <ul style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                  {g.items.map(it => <li key={it}>· {it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 8. D+ 활용 — 기념일 셈법 */}
        <section>
          <h2 className="g-h2">D+ 활용 — 「100일」은 D+99</h2>
          <p className="g-p">
            이 계산기의 <strong>D+N은 시작일로부터 N일이 지났다</strong>는 뜻입니다(시작일 당일 = D-day, 다음 날 = D+1). 반면 한국에서 연애 100일·아기 백일·입대 100일처럼 부르는 기념일은 <strong>시작일을 1일째로 세는</strong> 관행이라, 100일째는 시작일 + 99일 = <strong>D+99</strong>입니다.
            1주년처럼 「년」 단위 기념일은 다음 해 같은 날짜라 D+365(윤일 2월 29일이 끼면 D+366)입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['기념일', '계산기 표시', `날짜 (시작일 ${fmtDateKo(ANNIV_START)})`].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ANNIV_ROWS.map((r, i) => (
                  <tr key={r.label} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.label}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>D+{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p">
            헷갈리면 [두 날짜 차이] 탭에 시작일과 기념일을 넣어 보세요. 「차이」는 시작일을 뺀 값(D+와 같음), 「양 끝 포함」은 시작일을 1일째로 센 값이라 100일째 날짜에서 양 끝 포함이 100일로 나옵니다.
            금연·운동·블로그 시작일처럼 매일 늘어나는 기록을 저장해 두면 목록에서 D+가 자동으로 올라갑니다.
          </p>
        </section>

        {/* 9. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/date/age',             icon: '🎂', name: '나이 계산기',           desc: '생일까지 D-day, 인생 통계' },
              { href: '/tools/edu/review-interval',  icon: '📚', name: '복습 간격 계산기',      desc: '시험 D-day와 복습 시너지' },
              { href: '/tools/date/military',        icon: '🎖️', name: '군대 전역일 계산기',   desc: '입대일·전역일·복무율' },
              { href: '/tools/date/lunar',           icon: '🌙', name: '음양력 변환기',         desc: '띠·세시풍속' },
              { href: '/tools/date/jet-lag',         icon: '✈️', name: '시차 계산기',           desc: '도시 간 시차·도착 시간' },
              { href: '/tools/date/holiday-bridge',  icon: '🏖️', name: '징검다리 연휴 플래너',  desc: '공휴일 사이 연차 배치 추천' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 참고 자료 */}
        <section>
          <h2 className="g-h2">참고 자료</h2>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
            <li><strong style={{ color: 'var(--text)' }}>관공서의 공휴일에 관한 규정</strong> — 대통령령 (대체공휴일 제3조·2013 개정 도입, 제헌절·노동절 편입 2026 개정 = 대통령령 제36290호)</li>
            <li><strong style={{ color: 'var(--text)' }}>공휴일에 관한 법률</strong> — 법률 제18291호 (2021 제정·2022 시행, 대체공휴일 법제화)</li>
            <li><strong style={{ color: 'var(--text)' }}>한국천문연구원 천문력</strong> — 24절기·음력 환산</li>
            <li><strong style={{ color: 'var(--text)' }}>2027학년도 수능 시행 기본계획</strong> — 교육부 보도자료 (시행일·성적 통지일)</li>
            <li><strong style={{ color: 'var(--text)' }}>시험 시행계획 공고</strong> — Q-Net·한국산업인력공단(공인중개사·주택관리사보) / 한국토익위원회(토익 연간 일정) / 국사편찬위원회(한국사능력검정)</li>
          </ul>
        </section>

      </div>
    </ToolPage>
  )
}
