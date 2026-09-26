import Link from 'next/link'
import CosmicCalendarClient from './CosmicCalendarClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import {
  EVENTS, cosmicPosition, yearsAgoOf, fmtRealYears, compress24h, compress1km,
  COSMIC_SECOND_REAL_YEARS, COSMIC_DAY_REAL_YEARS, COSMIC_YEAR_REAL_YEARS, DAYS_IN_COSMIC_YEAR, type CatKey,
} from './cosmicData'
import ToolPage from '@/components/ToolPage'

/* 안내 표에 실을 사건 — 도구와 같은 데이터에서 날짜를 계산한다 */
const TABLE_IDS = ['bigbang', 'firstGalaxies', 'milkyWay', 'solarSystem', 'earth', 'firstLife',
  'cambrian', 'dinosaurs', 'dinoExtinction', 'genusHomo', 'homoSapiens', 'agriculture', 'writing', 'industrial']
/** 역사 시대 사건의 '몇 년 전'은 해마다 바뀌므로, 정적 표에서는 연도를 그대로 보여 준다.
    이 기준 연도는 날짜 계산에만 쓰이고 표시에는 나오지 않는다(억 단위에서는 차이가 없다). */
const TABLE_REF_YEAR = 2026
const CAT_COLOR: Record<CatKey, string> = {
  cosmic: 'var(--amethyst)', solar: 'var(--yellow-700)', earth: 'var(--cyan-600)',
  life: 'var(--emerald-600)', human: 'var(--orange-600)', civilization: 'var(--red-600)', now: 'var(--teal-600)',
}

const ev = (id: string) => EVENTS.find(e => e.id === id)!
const ryOf = (id: string) => yearsAgoOf(ev(id), TABLE_REF_YEAR)

/** 연말(12월 31일 24시)까지 남은 코스믹 시간 — 본문 '마지막 N분' 숫자를 데이터에서 만든다 */
function lastSpan(realYearsAgo: number): string {
  const sec = realYearsAgo / COSMIC_SECOND_REAL_YEARS
  if (sec >= 3600) {
    const h = Math.floor(sec / 3600)
    return `${h}시간 ${Math.floor((sec - h * 3600) / 60)}분`
  }
  if (sec >= 60) return `${Math.floor(sec / 60)}분 ${Math.round(sec % 60)}초`
  if (sec >= 10) return `약 ${Math.round(sec)}초`
  return `약 ${sec.toFixed(2)}초`
}

/** 우주 나이를 다르게 잡았을 때의 달력 날짜(월·일) — 가정 민감도 표용 */
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
function dateAt(realYearsAgo: number, ageYears: number): string {
  let rest = (1 - realYearsAgo / ageYears) * DAYS_IN_COSMIC_YEAR
  for (let m = 0; m < 12; m++) {
    if (rest < MONTH_DAYS[m]) return `${m + 1}월 ${Math.floor(rest) + 1}일`
    rest -= MONTH_DAYS[m]
  }
  return '12월 31일'
}
const SAGAN_AGE = 15_000_000_000   // 『에덴의 용』(1977)이 쓴 우주 나이
const SENS_IDS = ['milkyWay', 'solarSystem', 'firstLife', 'cambrian', 'dinoExtinction']
const SENS = SENS_IDS.map(id => {
  const ry = ryOf(id)
  return {
    name: ev(id).name, ry,
    now: dateAt(ry, COSMIC_YEAR_REAL_YEARS),
    sagan: dateAt(ry, SAGAN_AGE),
    shift: ry * DAYS_IN_COSMIC_YEAR * (1 / COSMIC_YEAR_REAL_YEARS - 1 / SAGAN_AGE),
  }
})

/* 같은 사건을 세 가지 압축 방식으로 — 도구의 compress24h·compress1km와 같은 함수 */
const MODE_IDS = ['homoSapiens', 'agriculture', 'writing', 'industrial', 'moonLanding']

/* 본문 예시 숫자 */
const DINO = cosmicPosition(ryOf('dinoExtinction'))
const ATOMS_AFTER = COSMIC_YEAR_REAL_YEARS - ryOf('firstAtoms')        // 빅뱅 후 38만 년
const ATOMS = cosmicPosition(ryOf('firstAtoms'))
const LIFE_SPREAD_DAYS = (4_100_000_000 - 3_500_000_000) / COSMIC_DAY_REAL_YEARS

export const metadata = buildMetadata({
  path: '/tools/edu/cosmic-calendar',
  title: '코스믹 캘린더 — 138억 년 우주 역사를 1년으로 압축',
  description: '138억 년 우주 역사를 1년 달력으로 압축한 인터랙티브 타임라인. 1초 ≈ 437년 환산 기준으로 빅뱅부터 은하·태양계·생명·인류까지 주요 사건 14가지 날짜표와 칼 세이건의 코스믹 캘린더 개념 해설까지.',
  keywords: ['코스믹캘린더', '우주달력', '우주역사', '빅뱅', '칼세이건', '우주시간', '인류역사', '우주시각화', '138억년', '우주1년'],
})

/* FAQ 수치도 도구와 같은 데이터에서 파생 — 예전 '첫 별 1월 6일경'·'1초 ≈ 437.5년'은 도구 표(1월 5일·437년)와 달랐다 */
const FIRST_STARS_DATE = cosmicPosition(EVENTS.find(e => e.id === 'firstStars')?.realYearsAgo ?? 13_600_000_000).label
const SEC_YEARS = Math.round(COSMIC_SECOND_REAL_YEARS)
const CIV_SEC = Math.round((12_000 / COSMIC_SECOND_REAL_YEARS) * 10) / 10
const SAPIENS_LAST = lastSpan(ryOf('homoSapiens'))

const FAQ_LD = [
              {
                q: '코스믹 캘린더는 누가 만들었나요?',
                a: '미국 천문학자 <strong>칼 세이건(Carl Sagan, 1934-1996)</strong>이 1977년 책 "에덴의 용(The Dragons of Eden)"에서 처음 제안했습니다. 이후 그의 다큐멘터리 <strong>"코스모스(Cosmos, 1980)"</strong>에서 시각화되어 널리 알려졌고, 2014년 후속 시리즈 "코스모스: 시공간 오디세이"에서도 다시 쓰였습니다. 상상하기 어려운 시간 규모를 익숙한 1년 달력에 옮겨 비교할 수 있게 한 것이 핵심입니다.',
              },
              {
                q: '코스믹 캘린더에서 1초는 실제 몇 년인가요?',
                a: `코스믹 캘린더에서 1초는 실제 <strong>약 ${SEC_YEARS}년</strong>에 해당합니다. 따라서 인류 문명 12,000년은 코스믹 캘린더로 약 ${CIV_SEC}초이며, 산업혁명(1760) 이후 ${ryOf('industrial')}년은 ${lastSpan(ryOf('industrial'))}, 월드와이드웹 공개(1993) 이후 ${ryOf('internet')}년은 ${lastSpan(ryOf('internet'))}에 불과합니다. <strong>당신의 30년 인생도 코스믹 캘린더로는 ${lastSpan(30)}</strong>입니다.`,
              },
              {
                q: '인류는 코스믹 캘린더의 어디에 위치하나요?',
                a: `현생 인류(호모 사피엔스)는 <strong>12월 31일 23시 48분경</strong> 등장했습니다. 한 해의 마지막 ${SAPIENS_LAST} 안에 현생 인류의 모든 역사가 들어 있다는 뜻입니다. 특히 문자·과학·인터넷 모든 것이 마지막 ${lastSpan(ryOf('writing'))} 안에 발생했습니다. 이는 우주 138억 년 중 인류 문명이 차지하는 비율이 <strong>0.0001% 미만</strong>이라는 의미입니다.`,
              },
              {
                q: '빅뱅 이후 첫 별은 언제 만들어졌나요?',
                a: `빅뱅 이후 약 2억 년 후에 최초의 별들이 핵융합을 시작했습니다. 코스믹 캘린더로는 <strong>${FIRST_STARS_DATE}경</strong>입니다. 빅뱅 후 약 38만 년까지는 우주가 뜨거운 플라스마 상태여서 빛이 자유롭게 다닐 수 없었고, 우주가 식으면서 최초의 원자(수소·헬륨)가 형성되었습니다(재결합). 그 이후 첫 별이 등장하기 전까지 빛나는 천체가 없던 기간을 "암흑 시대"라고 부르며, 물질이 중력으로 모여 첫 별들이 빛나면서 암흑 시대가 끝났습니다.`,
              },
              {
                q: '코스믹 캘린더의 사건 시점은 정확한가요?',
                a: '현재 과학계의 추정치를 기반으로 하며, <strong>새로운 발견에 따라 조정될 수 있습니다</strong>. 칼 세이건이 1977년에 쓴 우주 나이는 150억 년이었고, 이후 WMAP·Planck 위성의 우주배경복사 관측으로 약 138억 년으로 좁혀졌습니다. 지구 나이는 운석·광물의 방사성 연대 측정으로 약 45.4억 년이 정설입니다. 본 도구는 우주 나이로 Planck 위성 관측값(13.787 ± 0.020 Gyr)을 씁니다. <strong>최초의 별·은하가 정확히 언제 생겼는지는 아직 확정되지 않았고</strong>(제임스 웹 망원경이 계속 더 이른 은하를 찾고 있습니다), 생명·진화 사건의 연대도 추정 범위가 넓습니다. 따라서 분·초 단위의 코스믹 날짜는 <strong>추정 연대를 압축한 환산값</strong>이며, 정밀한 시각이 아니라 규모를 체감하기 위한 것입니다.',
              },
            ]

const TH: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)' }

export default function CosmicCalendarPage() {
  return (
    <ToolPage width={760} slug="/tools/edu/cosmic-calendar">
      <h1 className="tp-h1">
        <ToolIconBadge catId="edu" />코스믹 캘린더
      </h1>
      <p className="tp-lead">
        138억 년 우주 역사를 <strong style={{ color: 'var(--text)' }}>1년 달력으로 압축</strong>한 인터랙티브 타임라인.
      </p>

      <UpdatedMeta
        date="2026년 8월"
        basis="우주 나이 Planck 2018(13.787 Gyr) · 사건 연대는 추정 범위이며 환산값입니다"
        sources={[
          { label: '우주 나이 — NASA Universe', href: 'https://science.nasa.gov/universe/overview/' },
          { label: '최초의 별·은하 시기 — NASA (JWST)', href: 'https://science.nasa.gov/asset/webb/first-stars-timeline-of-the-universe/' },
          { label: 'Planck 2018 results VI. Cosmological parameters (A&A 641, A6)', href: 'https://doi.org/10.1051/0004-6361/201833910' },
          { label: '칼 세이건 코스믹 캘린더 (개념)', href: 'https://en.wikipedia.org/wiki/Cosmic_Calendar' },
        ]}
      />

      <CosmicCalendarClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 코스믹 캘린더란? ── */}
        <div>
          <h2 className="g-h2">
            코스믹 캘린더란?
          </h2>
          <p className="g-p">
            <strong>코스믹 캘린더(Cosmic Calendar)</strong>는 천문학자 <strong>칼 세이건</strong>이 그의 책
            &ldquo;에덴의 용(The Dragons of Eden, 1977)&rdquo;에서 제안한 개념입니다.
            우주의 역사를 1년(365일)으로 압축해, 인간이 직관적으로 이해하기 어려운 우주의 시간 스케일을 체감하게 합니다.
            이 도구는 우주 나이를 Planck 위성 관측값 137.87억 년으로 잡고, 달력을 12월 31일 자정에 끝나는 365일로 둡니다.
          </p>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '18px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
            marginTop: 12,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>1년</span> = 138억 년</div>
            <div><span style={{ color: 'var(--muted)' }}>1일</span> ≈ 3,777만 년</div>
            <div><span style={{ color: 'var(--muted)' }}>1시간</span> ≈ 157만 년</div>
            <div><span style={{ color: 'var(--muted)' }}>1분</span> ≈ <strong style={{ color: 'var(--teal-600)' }}>26,200년</strong></div>
            <div><span style={{ color: 'var(--muted)' }}>1초</span> ≈ <strong style={{ color: 'var(--teal-600)' }}>437년</strong></div>
          </div>
        </div>

        {/* ── 2. 주요 사건 요약 ── */}
        <div>
          <h2 className="g-h2">
            우주 달력의 주요 사건 (요약)
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['코스믹 날짜', '사건', '실제 연도'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i === 2 ? 'right' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* ⚠️ 예전에는 이 표의 날짜를 손으로 적어 두어, 도구가 계산하는 값과 어긋났다
                    (은하수는 66일 차). 같은 데이터 모듈에서 생성해 어긋날 수 없게 한다. */}
                {TABLE_IDS.map((id) => {
                  const e = EVENTS.find((x) => x.id === id)!
                  const ry = yearsAgoOf(e, TABLE_REF_YEAR)
                  return {
                    d: cosmicPosition(ry).label,
                    e: e.name,
                    r: typeof e.year === 'number' && e.year > -10_000 ? `${e.year < 0 ? `기원전 ${-e.year}` : `${e.year}`}년` : fmtRealYears(ry),
                    c: CAT_COLOR[e.category],
                  }
                }).map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--teal-600)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>
                      <span aria-hidden="true" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: r.c, marginRight: 8, verticalAlign: 'middle' }} />
                      {r.e}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 날짜 계산 방법 ── */}
        <div>
          <h2 className="g-h2">날짜는 이렇게 계산합니다</h2>
          <p className="g-p">
            계산은 단순한 비례식입니다. 어떤 사건이 지금으로부터 T년 전이라면, 빅뱅(1월 1일 0시)부터 그 사건까지 흐른 몫은 <strong>1 − T ÷ 우주 나이</strong>이고,
            여기에 365일을 곱하면 달력의 경과 일수가 나옵니다. 경과 일수의 정수 부분으로 월·일을, 소수 부분에 24시간을 곱해 시각을 정합니다.
          </p>
          <p className="g-p">
            예를 들어 공룡을 멸종시킨 K-Pg 대멸종(6,600만 년 전)은 (1 − 0.066 ÷ 13.787) × 365 ≈ {DINO.elapsedDays.toFixed(2)}일이므로
            <strong> {DINO.label} {DINO.hour}시경</strong>입니다. 반대로 빅뱅 후 38만 년의 재결합(최초의 원자)은 {Math.round(ATOMS_AFTER).toLocaleString('ko-KR')}년 ÷ 우주 나이 × 365일로
            <strong> 1월 1일 0시 {ATOMS.minute}분</strong>에 해당합니다. 빅뱅 직후 몇 분 동안 일어난 원소 합성 같은 사건은 달력에서 0초와 구분되지 않습니다 — 선형 압축의 한계입니다.
          </p>
          <Callout tone="note" title="날짜가 ‘정답’이 아닌 이유">
            1일이 약 3,777만 년이라 연대 추정이 조금만 달라져도 날짜가 움직입니다. 최초 생명의 흔적은 논쟁이 적은 화석 증거로 약 35억 년 전, 논쟁 중인 흔적까지 넣으면 41억 년 전까지 거슬러 올라가는데,
            이 6억 년 폭은 달력에서 약 {Math.round(LIFE_SPREAD_DAYS)}일에 해당합니다. 도구는 38억 년 한 값을 씁니다.
          </Callout>
        </div>

        {/* ── 4. 우주 나이 가정 ── */}
        <div>
          <h2 className="g-h2">세이건의 150억 년 달력과 무엇이 다른가</h2>
          <p className="g-p">
            세이건이 1977년에 코스믹 캘린더를 제안할 때 쓴 우주 나이는 150억 년이었습니다. 지금은 우주배경복사 관측으로 약 138억 년이 표준값이 되었고, 이 도구도 그 값을 씁니다.
            같은 사건 연대를 두 달력에 올리면 아래처럼 <strong>오래된 사건일수록 날짜가 크게 움직입니다</strong>. 책이나 영상마다 &lsquo;태양계는 9월 ○일&rsquo;이 다르게 적혀 있다면 대개 이 가정 차이 때문입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <caption style={{ captionSide: 'bottom', textAlign: 'left', fontSize: 12, color: 'var(--muted)', paddingTop: 8 }}>
                사건 연대는 이 도구의 값으로 같게 두고 우주 나이만 바꿔 계산했습니다(세이건 원판의 사건 연대와는 다를 수 있음).
              </caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['사건', '연대', '137.87억 년 달력', '150억 년 달력', '차이'].map(h => (
                    <th scope="col" key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SENS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ ...TD, fontWeight: 600 }}>{r.name}</td>
                    <td style={{ ...TD, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{fmtRealYears(r.ry)}</td>
                    <td style={{ ...TD, color: 'var(--teal-600)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.now}</td>
                    <td style={{ ...TD, whiteSpace: 'nowrap' }}>{r.sagan}</td>
                    <td style={{ ...TD, color: 'var(--muted)', whiteSpace: 'nowrap' }}>+{r.shift.toFixed(1)}일</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. 12월 31일 ── */}
        <div>
          <h2 className="g-h2">
            12월 31일 - 인류 등장
          </h2>
          <ul className="g-list">
            <li>호모(Homo) 속은 우주 달력의 마지막 <strong>{lastSpan(ryOf('genusHomo'))}</strong>에 등장했습니다.</li>
            <li>현생 인류(호모 사피엔스)는 마지막 <strong>{lastSpan(ryOf('homoSapiens'))}</strong>.</li>
            <li>농업이 시작된 뒤의 역사는 마지막 <strong>{lastSpan(ryOf('agriculture'))}</strong>, 문자가 발명된 뒤의 역사는 마지막 <strong>{lastSpan(ryOf('writing'))}</strong>.</li>
            <li>산업혁명 이후는 <strong>{lastSpan(ryOf('industrial'))}</strong>, 월드와이드웹 공개(1993) 이후는 <strong>{lastSpan(ryOf('internet'))}</strong>.</li>
          </ul>
          <p className="g-p">
            같은 사건을 하루(24시간)나 1km 산책로로 압축하면 감각이 또 달라집니다. 아래 표는 도구의 &lsquo;압축 방식&rsquo; 전환과 같은 계산입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['사건', '1년 달력', '24시간 시계', '1km 산책로'].map(h => (
                    <th scope="col" key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODE_IDS.map((id, i) => {
                  const ry = ryOf(id)
                  return (
                    <tr key={id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                      <td style={{ ...TD, fontWeight: 600 }}>{ev(id).name}</td>
                      <td style={{ ...TD, color: 'var(--teal-600)', whiteSpace: 'nowrap' }}>{cosmicPosition(ry).label.replace('12월 31일 ', '12/31 ')}</td>
                      <td style={{ ...TD, whiteSpace: 'nowrap' }}>{compress24h(ry)}</td>
                      <td style={{ ...TD, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{compress1km(ry)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 6. 138억 년 핵심 시기 ── */}
        <div>
          <h2 className="g-h2">
            달력으로 본 다섯 시기
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '초기 우주 (1월~3월)',        c: 'var(--amethyst)', d: '빅뱅, 원자 형성, 최초의 별·은하 등장. 우리 은하는 3월 중순에 지금의 꼴을 갖춰 갑니다.' },
              { t: '별·행성의 시대 (3월~8월)',    c: 'var(--yellow-700)', d: '여러 세대의 별이 내부 핵융합으로 무거운 원소를 만들고, 항성풍과 초신성 폭발로 우주에 퍼뜨림' },
              { t: '태양계와 지구 (9월)',         c: 'var(--cyan-600)', d: '태양 형성, 지구·달 형성, 생명이 등장' },
              { t: '생명의 진화 (10월~12월)',     c: 'var(--emerald-600)', d: '단세포 → 다세포 → 동식물, 캄브리아기 폭발 → 공룡 → 포유류' },
              { t: '인류의 등장 (12월 31일)',     c: 'var(--red-600)', d: '단 하루 안에 모든 인류 진화·문명 발생' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 칼 세이건 관점 ── */}
        <div>
          <h2 className="g-h2">
            칼 세이건의 코스믹 관점
          </h2>
          <p className="g-p">
            세이건은 《코스모스》(1980)에서 우리 몸이 별 속에서 만들어진 물질(star-stuff)로 이루어져 있고, 인간은 우주가 스스로를 알아 가는 한 방법이라고 말했습니다.
            코스믹 캘린더에는 그가 전하려 한 두 가지 메시지가 담겨 있습니다.
          </p>
          <ul className="g-list">
            <li><strong>인류의 짧음에 대한 겸손</strong> — 우주 시간에서 문자 이후 모든 역사는 마지막 약 12초</li>
            <li><strong>인류의 특별함에 대한 경이</strong> — 우리가 아는 한, 자신의 기원을 묻는 존재는 인간뿐</li>
          </ul>
        </div>

        {/* ── 8. 우주 시간 이해의 의미 ── */}
        <div>
          <h2 className="g-h2">
            우주 시간 이해의 의미
          </h2>
          <p className="g-p">
            코스믹 캘린더는 단순한 숫자 놀이가 아니라, <strong>인간이 자기 자신을 바라보는 거울</strong>입니다.
            138억 년을 1년으로 줄여 놓으면, 평범한 일상도 전혀 다른 무게로 다가옵니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '찰나를 사는 존재', d: '평균 수명 80년은 우주 달력에서 0.2초도 되지 않습니다. 그 척도 앞에서 오늘의 경쟁·불안·조급함을 한 걸음 떨어져 바라보게 됩니다.' },
              { t: '별의 먼지로 된 몸', d: '우리 몸의 탄소·산소·철은 수십억 년 전 별 내부의 핵융합과 초신성 폭발로 만들어진 원소입니다. 우리는 비유가 아니라 문자 그대로 우주의 일부입니다.' },
              { t: '우주가 스스로를 보는 눈', d: '우리가 아는 한, 138억 년의 역사 속에서 자신의 기원을 묻는 물질은 인간이 처음입니다. 그 드문 능력이 바로 지금의 인간입니다.' },
              { t: '남은 찰나에 대한 책임', d: '모든 인류 역사가 마지막 몇 초라면, 우리가 지구에 남기는 흔적(기후·생태)은 그 찰나가 다음 세대에게 보내는 신호입니다.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--teal-600)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 9. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 10. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/edu/planet-comparison', icon: '🪐', name: '행성 비교 계산기',     desc: '8개 행성에서 내 몸무게·나이·하루' },
              { href: '/tools/unit/converter',        icon: '📐', name: '단위 변환기',           desc: '시간·길이·무게 등 14종 통합 변환' },
              { href: '/tools/date/history-era',      icon: '📜', name: '연호·연대 변환기', desc: '단기·왕 연호·간지 ↔ 서기 변환' },
              { href: '/tools/date/age?tab=life',     icon: '⏳', name: '나이 계산기 › 인생 통계', desc: '기대수명 기준 살아온 시간·앞으로의 시간' },
              { href: '/tools/edu/fermi-estimate',    icon: '🧮', name: '페르미 추정 계산기',    desc: '큰 수를 변수로 쪼개 대략의 규모 가늠' },
              { href: '/tools/edu',                   icon: '🔬', name: '교육·학습 카테고리',    desc: '추가 교육 도구 더보기' },
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

        {/* ── 11. 참고 자료 ── */}
        <div>
          <h2 className="g-h2">
            참고 자료
          </h2>
          <ul className="g-list">
            <li>칼 세이건, &ldquo;에덴의 용&rdquo;(The Dragons of Eden), 1977 — 코스믹 캘린더 최초 제안(우주 나이 150억 년 기준)</li>
            <li>칼 세이건, &ldquo;코스모스&rdquo;(Cosmos), 1980 다큐멘터리</li>
            <li>Planck Collaboration, &ldquo;Planck 2018 results. VI. Cosmological parameters&rdquo;, Astronomy &amp; Astrophysics 641, A6 (2020) — 우주 나이 13.787 ± 0.020 Gyr</li>
            <li>NASA Science(science.nasa.gov) · 한국천문연구원(kasi.re.kr) · 국제천문연맹(iau.org) · 유럽우주국(esa.int)</li>
          </ul>
        </div>

      </div>
    </ToolPage>
  )
}
