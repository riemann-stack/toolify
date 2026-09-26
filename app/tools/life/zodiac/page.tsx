import ZodiacClient from './ZodiacClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { STAR_SIGNS, BIRTH_MONTHS, getZodiacByYear } from './zodiacUtils'

export const metadata = buildMetadata({
  path: '/tools/life/zodiac',
  title: '띠·별자리 계산기 — 60갑자·궁합·탄생석·가족 비교',
  description: '내 띠·별자리·60갑자·오행·탄생석 통합 카드 + 두 사람 궁합 시뮬(삼합·육합·충)과 가족 띠 비교. 1924~2043 간지 120년 표와 양력·음력 띠 차이 정리까지.',
  keywords: [
    '띠계산기', '별자리계산기', '12간지', '60갑자', '띠궁합', '생년월일띠',
    '간지계산기', '나의별자리', '띠별자리', '두 사람 궁합', '탄생석',
    '탄생화', '가족 띠', '환갑', '삼합 육합', '쌍둥이자리 사자자리 궁합',
    '닭띠 돼지띠 궁합', '닭띠 호랑이띠', '음력 양력 변환',
  ],
})

// 60갑자 데이터 생성
const STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const STEMS_HANGUL = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']
const BRANCHES_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const BRANCHES_HANGUL = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']
const BRANCHES_ANIMAL = ['🐭쥐', '🐮소', '🐯호랑이', '🐰토끼', '🐲용', '🐍뱀', '🐴말', '🐑양', '🐵원숭이', '🐔닭', '🐶개', '🐷돼지']

// 60갑자 테이블: 1924~1983 (전반), 1984~2043 (후반)
function ganjiTable(startYear: number) {
  return Array.from({ length: 60 }, (_, i) => {
    const year = startYear + i
    const sIdx = ((year - 4) % 10 + 10) % 10
    const bIdx = ((year - 4) % 12 + 12) % 12
    return {
      year,
      hanja: `${STEMS_HANJA[sIdx]}${BRANCHES_HANJA[bIdx]}`,
      hangul: `${STEMS_HANGUL[sIdx]}${BRANCHES_HANGUL[bIdx]}`,
      animal: BRANCHES_ANIMAL[bIdx],
    }
  })
}

const GANJI_A = ganjiTable(1924) // 1924-1983
const GANJI_B = ganjiTable(1984) // 1984-2043

/* 연도별 설날(음력 1월 1일)의 양력 날짜 1940~2029 — korean-lunar-calendar(한국천문연구원 데이터) 패키지로 생성,
   lib/krHolidays.ts(2026~2029 설날)와 대조 일치. 인덱스 = 연도 − 1940 */
const SEOLLAL = (
  '2/8 1/27 2/15 2/5 1/26 2/13 2/2 1/22 2/10 1/29 ' +   // 1940s
  '2/17 2/6 1/27 2/14 2/4 1/24 2/12 1/31 2/19 2/8 ' +   // 1950s
  '1/28 2/15 2/5 1/25 2/13 2/2 1/22 2/9 1/30 2/17 ' +   // 1960s
  '2/6 1/27 2/15 2/3 1/23 2/11 1/31 2/18 2/7 1/28 ' +   // 1970s
  '2/16 2/5 1/25 2/13 2/2 2/20 2/9 1/29 2/18 2/6 ' +    // 1980s
  '1/27 2/15 2/4 1/23 2/10 1/31 2/19 2/8 1/28 2/16 ' +  // 1990s
  '2/5 1/24 2/12 2/1 1/22 2/9 1/29 2/18 2/7 1/26 ' +    // 2000s
  '2/14 2/3 1/23 2/10 1/31 2/19 2/8 1/28 2/16 2/5 ' +   // 2010s
  '1/25 2/12 2/1 1/22 2/10 1/29 2/17 2/7 1/27 2/13'     // 2020s
).split(' ')
const SEOLLAL_DECADES = Array.from({ length: 9 }, (_, d) => 1940 + d * 10)
/* 가이드 예시 — 설날 전 출생이면 음력 기준으로는 전년도 띠 */
const seollalOf = (y: number) => SEOLLAL[y - 1940]
const EX_1990 = { seollal: seollalOf(1990), solar: getZodiacByYear(1990).name, lunar: getZodiacByYear(1989).name }
const EX_2024 = { seollal: seollalOf(2024), solar: getZodiacByYear(2024).name, lunar: getZodiacByYear(2023).name }

/* 별자리 날짜표 — 계산기(getStarSign)가 쓰는 STAR_SIGNS 그대로 */
const md = (m: number, d: number) => `${m}/${d}`

const FAQ_LD = [
              { q: '띠는 음력 기준인가요 양력 기준인가요?', a: '엄밀히는 음력 설날을 기준으로 하지만, 실용적으로는 양력 1월 1일을 기준으로 계산하는 경우도 많습니다. 본 계산기는 양력 기준으로 계산합니다. 음력 설날 전후 출생자는 실제 띠와 1년 차이가 날 수 있습니다.' },
              { q: '별자리는 태양 별자리인가요?', a: '네, 본 계산기는 생일 기준 태양 별자리(Sun Sign)를 계산합니다. 점성술에서는 태양 별자리 외에도 달 별자리, 상승 별자리 등이 있으며, 정확한 점성술 분석은 출생 시간과 장소가 필요합니다.' },
              { q: '별자리 경계 날짜에 태어난 경우는?', a: '두 별자리의 경계 날짜(예: 양자리와 황소자리의 경계인 4월 19~20일)에 태어난 경우를 점성술에서는 「커스프(Cusp)」라고 부르며, 두 별자리의 특징을 함께 본다고 설명하기도 합니다. 태양이 경계(황경 30° 단위)를 넘는 시각은 해마다 몇 시간씩 달라서, 경계일 출생이라면 출생 연도·시각에 따라 별자리가 하루 앞뒤로 바뀔 수 있습니다. 본 계산기는 고정된 대표 날짜표로 판정합니다.' },
              { q: '음력 생년월일인 경우 어떻게 해야 하나요?', a: '본 계산기는 양력 기준입니다. 음력 생년월일만 아는 경우 본 사이트의 양력 음력 변환기에서 양력으로 변환한 뒤 이용하세요. 특히 음력 설날(1~2월) 전후 출생자는 띠가 1년 다를 수 있습니다.' },
              { q: '60갑자란 무엇인가요?', a: '10천간과 12지지를 차례로 짝지은 60개의 연도 주기로, 띠는 이 중 12지지에 해당합니다. 예를 들어 2026년은 병오(丙午)년 붉은 말띠이며, 환갑(還甲)은 본인이 태어난 간지가 다시 돌아오는 60세를 뜻합니다. 천간·지지의 구성과 60년 순환 원리는 본 사이트의 양력 음력 변환기에서 자세히 다룹니다.' },
              { q: '두 사람의 띠 궁합은 어떻게 계산하나요?', a: '본 도구의 「두 사람 궁합」 탭 사용. 12간지 궁합 기준 — 삼합(3개씩 묶음, 환상적 시너지: 신자진/사유축/인오술/해묘미), 육합(2개씩, 안정적: 자축/인해/묘술/진유/사신/오미), 충(정반대, 충돌: 자오/축미/인신/묘유/진술/사해). 본 결과는 재미용이며, 실제 관계는 노력·소통으로 만들어집니다.' },
              { q: '별자리 원소가 잘 맞는다는 게 무슨 뜻인가요?', a: '점성술 4원소: 불(양·사자·사수, 열정), 지(황소·처녀·염소, 안정), 공기(쌍둥이·천칭·물병, 소통), 물(게·전갈·물고기, 감성). 시너지: 같은 원소(자연스러운 공감), 불+공기(산소가 불 살림), 지+물(식물 자라기). 충돌: 불+물(가치관 차이), 지+공기(현실 vs 자유). 다만 별자리만으로 관계를 판단할 수 없으며, 실제 사람은 모든 원소 면을 갖고 있습니다.' },
              { q: '음력 생일이 양력보다 띠가 다를 수 있나요?', a: '네, 가능합니다. 예: 양력 1990년 1월 25일 출생 → 양력 띠(1월 1일 기준) 말띠(1990년), 음력 띠(음력 설날 기준) 뱀띠(1989년 음력). 본 도구는 양력 입력 → 양력 1월 1일 기준. 엄격한 사주 해석은 절기 기준(입춘 2/4 전후)도 사용.' },
              { q: '본 도구의 궁합 결과로 결혼을 결정해도 되나요?', a: '절대 안 됩니다. 본 궁합은 재미·문화 도구입니다. 실제 관계는 두 사람의 가치관·인생관·소통·이해 능력·함께 보낸 시간·노력·헌신·가족 환경으로 결정됩니다. 띠·별자리 궁합은 일반적 성향 참고·대화 소재·자기 이해 도구일 뿐. 결혼·이별 결정은 본인의 직접 경험·소통으로. 관계 갈등 시 여성긴급전화 1366(24시간), 청소년·가족 상담 1388.' },
              { q: '뱀주인자리(13번째 별자리)는 뭔가요? 제 별자리가 바뀌나요?', a: '천문학에서 쓰는 국제천문연맹(IAU)의 88개 별자리 경계로 보면 태양이 1년 동안 지나가는 별자리는 12개가 아니라 뱀주인자리를 포함한 13개이고, 태양은 대략 11월 30일~12월 18일 무렵 뱀주인자리를 지납니다. 반면 점성술의 12궁은 춘분점을 기점으로 황도를 30°씩 나눈 구획(트로피컬 방식)이라 실제 별자리 위치와 따로 움직입니다. 지구 자전축의 세차운동(약 2만 6천 년 주기, 약 72년에 1°) 때문에 두 기준은 2천여 년 사이 거의 한 칸 가까이 어긋났습니다. 이 계산기는 점성술의 12궁 날짜를 쓰므로 뱀주인자리를 넣지 않으며, 13별자리 이야기는 「별자리가 바뀌었다」기보다 기준이 다른 두 체계라고 이해하면 됩니다.' },
            ]

export default function ZodiacPage() {
  return (
    <ToolPage width={760} slug="/tools/life/zodiac">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />띠·별자리 계산기
      </h1>
      <p className="tp-lead">
        내 띠·별자리·60갑자·오행을 한 카드로 + <strong style={{ color: 'var(--text)' }}>두 사람 궁합</strong>과 가족 띠 비교까지.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="띠·60갑자는 양력 연도 기준 계산(음력 설날 기준표는 한국천문연구원 음양력 데이터) · 별자리는 서양 점성술 12궁 대표 날짜 · 탄생석은 현대 목록(GIA 안내)"
        sources={[
          { label: '한국천문연구원 — 음양력 변환계산', href: 'https://astro.kasi.re.kr/life/pageView/8' },
          { label: 'IAU — The Constellations', href: 'https://www.iau.org/IAU/IAU/Astronomy-FAQs/Constellations.aspx' },
          { label: 'GIA — Birthstones', href: 'https://www.gia.edu/birthstones' },
        ]}
      />

      <ZodiacClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 12간지 순서 ── */}
        <div>
          <h2 className="g-h2">12간지 순서와 해당 연도</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['띠', '지지', '순서', '최근 해당 연도'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['🐭 쥐',     '子 (자)', '1번째',  '1996, 2008, 2020'],
                  ['🐮 소',     '丑 (축)', '2번째',  '1997, 2009, 2021'],
                  ['🐯 호랑이', '寅 (인)', '3번째',  '1998, 2010, 2022'],
                  ['🐰 토끼',   '卯 (묘)', '4번째',  '1999, 2011, 2023'],
                  ['🐲 용',     '辰 (진)', '5번째',  '2000, 2012, 2024'],
                  ['🐍 뱀',     '巳 (사)', '6번째',  '2001, 2013, 2025'],
                  ['🐴 말',     '午 (오)', '7번째',  '2002, 2014, 2026'],
                  ['🐑 양',     '未 (미)', '8번째',  '2003, 2015, 2027'],
                  ['🐵 원숭이', '申 (신)', '9번째',  '2004, 2016, 2028'],
                  ['🐔 닭',     '酉 (유)', '10번째', '2005, 2017, 2029'],
                  ['🐶 개',     '戌 (술)', '11번째', '2006, 2018, 2030'],
                  ['🐷 돼지',   '亥 (해)', '12번째', '2007, 2019, 2031'],
                ].map(([animal, jiji, order, years], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{animal}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontWeight: 600 }}>{jiji}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{order}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{years}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 별자리 날짜표 ── */}
        <div>
          <h2 className="g-h2">별자리 날짜표</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['별자리', '기간', '원소'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAR_SIGNS.map((sg, i) => (
                  <tr key={sg.name} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent-ink)', fontWeight: 700 }}>{sg.emoji} {sg.name}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{md(sg.startMonth, sg.startDay)} ~ {md(sg.endMonth, sg.endDay)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontWeight: 500 }}>{sg.element}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 별자리 경계 날짜는 <strong style={{ color: 'var(--text)' }}>대표적인 서양 점성술(트로피컬) 기준</strong>이며, 출생 연도·시간대에 따라 경계일이 ±1일 달라질 수 있습니다.
          </p>
          <p className="g-p" style={{ marginTop: 12 }}>
            점성술의 12궁은 밤하늘의 실제 별자리 모양이 아니라, 태양이 1년 동안 지나는 길(황도)을 <strong>춘분점에서 출발해 30°씩 12칸</strong>으로 나눈 구획입니다.
            태양이 한 칸을 지나는 데 약 한 달이 걸려 날짜표가 만들어지는데, 1년이 정확히 365일이 아니고 윤년이 끼기 때문에 태양이 경계를 넘는 시각이 해마다 몇 시간씩 달라집니다.
            그래서 경계일 전후 출생자는 자료마다 별자리가 다르게 나올 수 있습니다. 한편 천문학의 별자리 경계는 국제천문연맹(IAU)이 88개로 정하고 1930년 경계를 확정·발표한 구역이며,
            지구 자전축이 약 2만 6천 년 주기로 도는 세차운동 때문에 춘분점은 지금 실제로는 물고기자리 영역에 있습니다. 이 계산기의 별자리는 점성술 12궁 기준입니다.
          </p>
        </div>

        {/* ── 섹션 A: 60갑자 ── */}
        <div>
          <h2 className="g-h2">
            60갑자 (干支) 표
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '18px' }}>
            10천간과 12지지를 차례로 짝지은 60개의 연도 주기로, <strong style={{ color: 'var(--text)' }}>띠는 이 중 12지지에 해당</strong>합니다 (예: 2026년 병오년 = 붉은 말띠).
            내 생년의 간지·띠는 위 계산기에서 바로 확인하고, 1924~2043년 전체 표는 아래에서 펼쳐 보세요.
            천간·지지의 구성과 60년 순환 원리(환갑의 유래)는{' '}
            <Link href="/tools/date/lunar" style={{ color: 'var(--accent)', fontWeight: 600 }}>양력 음력 변환기</Link>에서 자세히 다룹니다.
          </p>

          <details>
            <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: 'var(--accent)', padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', listStyle: 'none' }}>
              📜 1924~2043년 간지 120년 전체표 펼쳐보기
            </summary>
            <div style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>甲子(갑자) 1924 ~ 癸亥(계해) 1983</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '6px', marginBottom: '20px' }}>
            {GANJI_A.map(g => (
              <div key={g.year} style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-s)',
                padding: '8px 10px',
                fontSize: '12px',
                lineHeight: 1.5,
              }}>
                <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--accent)', fontWeight: 700, fontSize: '15px' }}>
                  {g.hanja}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '11px' }}>
                  {g.hangul} · {g.year}
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>甲子(갑자) 1984 ~ 癸亥(계해) 2043</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '6px' }}>
            {GANJI_B.map(g => (
              <div key={g.year} style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-s)',
                padding: '8px 10px',
                fontSize: '12px',
                lineHeight: 1.5,
              }}>
                <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--accent)', fontWeight: 700, fontSize: '15px' }}>
                  {g.hanja}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '11px' }}>
                  {g.hangul} · {g.year}
                </div>
              </div>
            ))}
          </div>
            </div>
          </details>
        </div>

        {/* ── 섹션 B: 띠별 성격·궁합 ── */}
        <div>
          <h2 className="g-h2">
            띠별 성격 및 궁합 요약표
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['띠', '핵심 성격', '최고 궁합', '주의 궁합'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { z: '🐭 쥐',    p: '영리·적응력·기민',   b: '🐲 용, 🐵 원숭이',    a: '🐴 말' },
                  { z: '🐮 소',    p: '성실·인내·신뢰',     b: '🐍 뱀, 🐔 닭',        a: '🐑 양' },
                  { z: '🐯 호랑이', p: '용감·리더십·열정',  b: '🐴 말, 🐶 개',        a: '🐵 원숭이' },
                  { z: '🐰 토끼',  p: '온순·섬세·행운',     b: '🐑 양, 🐷 돼지',      a: '🐔 닭' },
                  { z: '🐲 용',    p: '카리스마·야망',      b: '🐭 쥐, 🐵 원숭이',    a: '🐶 개' },
                  { z: '🐍 뱀',    p: '지혜·직관·신중',     b: '🐮 소, 🐔 닭',        a: '🐷 돼지' },
                  { z: '🐴 말',    p: '자유·활동·열정',     b: '🐯 호랑이, 🐶 개',    a: '🐭 쥐' },
                  { z: '🐑 양',    p: '온화·창의·공감',     b: '🐰 토끼, 🐷 돼지',    a: '🐮 소' },
                  { z: '🐵 원숭이', p: '영리·유머·변화',    b: '🐭 쥐, 🐲 용',        a: '🐯 호랑이' },
                  { z: '🐔 닭',    p: '꼼꼼·성실·솔직',     b: '🐮 소, 🐍 뱀',        a: '🐰 토끼' },
                  { z: '🐶 개',    p: '충직·정직·의리',     b: '🐯 호랑이, 🐴 말',    a: '🐲 용' },
                  { z: '🐷 돼지',  p: '너그러움·낙천·행복', b: '🐰 토끼, 🐑 양',      a: '🐍 뱀' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontWeight: 700 }}>{r.z}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{r.p}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--success)' }}>{r.b}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--warning)' }}>{r.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 섹션 C: 별자리 원소별 특징 ── */}
        <div>
          <h2 className="g-h2">
            별자리 원소별 특징
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { el: '불', signs: '♈ 양 · ♌ 사자 · ♐ 사수', traits: '열정·리더십·직관' },
              { el: '지', signs: '♉ 황소 · ♍ 처녀 · ♑ 염소', traits: '현실적·안정·끈기' },
              { el: '공기', signs: '♊ 쌍둥이 · ♎ 천칭 · ♒ 물병', traits: '소통·지성·자유' },
              { el: '물', signs: '♋ 게 · ♏ 전갈 · ♓ 물고기', traits: '감성·직관·공감' },
            ].map((e) => (
              <div key={e.el} style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid var(--accent)',
                borderRadius: 'var(--radius-m)',
                padding: '14px 16px',
              }}>
                <p style={{ fontSize: '14px', color: 'var(--accent-ink)', fontWeight: 700, marginBottom: '6px' }}>{e.el}</p>
                <p style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '4px' }}>{e.signs}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{e.traits}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 두 사람 궁합 가이드 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            두 사람 궁합 가이드 (재미용)
          </h2>
          <p className="g-p">
            12간지 궁합은 전통적으로 <strong>삼합·육합·충</strong>으로 평가합니다.
            본 도구의 「두 사람 궁합」 탭은 먼저 충인지 보고, 아니면 삼합, 그다음 육합 순서로 판정해 점수를 매깁니다(같은 띠·해당 없음은 3점).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--success)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 700, marginBottom: 8 }}>삼합 (5점) — 환상적 시너지</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                <li>신자진: 원숭이·쥐·용</li>
                <li>사유축: 뱀·닭·소</li>
                <li>인오술: 호랑이·말·개</li>
                <li>해묘미: 돼지·토끼·양</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 8 }}>육합 (4점) — 안정적</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                <li>자축: 쥐·소</li>
                <li>인해: 호랑이·돼지</li>
                <li>묘술: 토끼·개</li>
                <li>진유: 용·닭</li>
                <li>사신: 뱀·원숭이</li>
                <li>오미: 말·양</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--danger)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 700, marginBottom: 8 }}>충 (1점) — 충돌·도전</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                <li>자오: 쥐·말</li>
                <li>축미: 소·양</li>
                <li>인신: 호랑이·원숭이</li>
                <li>묘유: 토끼·닭</li>
                <li>진술: 용·개</li>
                <li>사해: 뱀·돼지</li>
              </ul>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <Callout tone="warn" title="재미로만 보세요">
              실제 관계는 두 사람의 노력·소통·이해로 결정됩니다. 본 결과로 결혼·이별을 결정하지 마세요.
            </Callout>
          </div>
        </div>

        {/* ── 별자리 원소 시너지 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            별자리 4원소 궁합
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>조합</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>평가</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>해석</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['같은 원소', '5점', '자연스러운 공감과 이해', 'var(--success)'],
                  ['불 + 공기', '5점', '공기가 불을 살리는 시너지 — 활력·영감', 'var(--success)'],
                  ['지 + 물', '5점', '물과 흙의 시너지 — 안정·성장', 'var(--success)'],
                  ['불 + 지 · 공기 + 물', '3점', '특별한 시너지·충돌 없음 — 노력으로 좋아짐', 'var(--text)'],
                  ['불 + 물', '2점', '가치관 차이 큼, 타협 필요', 'var(--danger)'],
                  ['지 + 공기', '2점', '현실 vs 자유 거리감', 'var(--danger)'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: row[3] as string, fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 별자리만으로 관계를 판단할 수 없으며, 실제 사람은 모든 원소 면을 갖고 있습니다.
          </p>
        </div>

        {/* ── 탄생석·탄생화·탄생색 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            월별 탄생석·탄생화·탄생색
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>월</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--accent)', fontWeight: 700 }}>탄생석</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>탄생화</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>탄생색</th>
                </tr>
              </thead>
              <tbody>
                {BIRTH_MONTHS.map((row, i) => (
                  <tr key={row.month} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--accent-ink)', fontWeight: 700 }}>{row.month}월</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)' }}>{row.stone}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--muted)' }}>{row.flower}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--muted)' }}>{row.color}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 탄생석·탄생화·탄생색은 보석협회·국가·시대별로 목록이 달라 <strong style={{ color: 'var(--text)' }}>대표적인 현대 서양권 기준</strong>만 표기했습니다. 월별로 여러 대체 보석이 있을 수 있습니다.
          </p>
          <p className="g-p" style={{ marginTop: 12 }}>
            오늘날 널리 쓰이는 탄생석 목록은 1912년 미국 보석상 협회가 정한 목록을 바탕으로 1952년 등에 개정된 것이라, 옛 목록과 다를 수 있습니다.
            예를 들어 12월은 1912년 목록의 터키석·청금석 가운데 청금석이 빠지고 지르콘(1952년)과 탄자나이트(2002년)가 더해졌으며, 11월의 시트린도 1952년 개정 때 추가됐습니다.
            탄생화는 공인 기관이 정한 목록이 없고 나라마다 관행이 달라, 이 표는 서양에서 흔히 쓰는 월별 꽃을 옮겼습니다(3월의 존퀼은 수선화속 식물입니다).
            탄생색은 근거 있는 공식 목록이 없는 관용 표현이니 선물 색 고르기 정도의 참고로만 쓰세요.
          </p>
        </div>

        {/* ── 양력 vs 음력 띠 차이 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            양력 vs 음력 띠 차이 — 연도별 설날표
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
            <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
              <li>일상에서는 간편하게 <strong>양력 연도</strong>로 띠를 따지는 경우가 많음 (이 계산기도 양력 연도 기준)</li>
              <li>민간에서는 전통적으로 <strong>음력 설날 (양력 1월 21일~2월 20일 사이)</strong>에 띠가 바뀐다고 봄</li>
              <li>사주명리는 <strong>입춘 (2월 4일 전후)</strong>을 기준 — 절기 기준</li>
              <li>음력 설날 전후 출생자는 띠가 1년 차이날 수 있음</li>
            </ul>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 12 }}>
              예: 양력 1990년 1월 25일 출생<br />
              · 양력 띠 (1월 1일 기준): 말띠 (1990년)<br />
              · 음력 띠 (음력 설날 기준): 뱀띠 (1989년 음력)<br />
              본 도구는 양력 입력 → 양력 1월 1일 기준으로 계산합니다.
            </p>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            1월이나 2월 초에 태어났다면 아래 표에서 태어난 해의 설날(음력 1월 1일)을 찾아보세요. 생일이 그해 설날보다 앞이면 음력으로는 아직 전년도라서
            <strong> 음력 기준 띠는 한 해 앞의 띠</strong>가 되고, 설날 당일이나 이후라면 계산기가 보여 주는 양력 연도의 띠와 같습니다.
            예를 들어 1990년 설날은 양력 {EX_1990.seollal}이라 1990년 1월 25일생은 양력 기준 {EX_1990.solar}띠, 음력 기준 {EX_1990.lunar}띠이고,
            2024년 설날은 {EX_2024.seollal}이라 2024년 2월 9일생은 양력 기준 {EX_2024.solar}띠, 음력 기준 {EX_2024.lunar}띠입니다.
            명리학에서 쓰는 입춘은 설날과 달리 절기라 매년 양력 2월 4일 무렵으로 거의 고정되어 있으므로, 설날과 입춘 사이에 태어났다면 두 기준의 띠가 서로 다릅니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <caption className="srOnly">연도별 설날(음력 1월 1일)의 양력 날짜, 1940~2029년</caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '8px 8px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>연대＼끝자리</th>
                  {Array.from({ length: 10 }, (_, k) => (
                    <th scope="col" key={k} style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SEOLLAL_DECADES.map((dec, i) => (
                  <tr key={dec} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '8px 8px', textAlign: 'left', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{dec}년대</th>
                    {Array.from({ length: 10 }, (_, k) => (
                      <td key={k} style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{seollalOf(dec + k)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 월/일은 양력. 예: 1990년대 행의 0열 「1/27」 = 1990년 설날이 양력 1월 27일. 한국천문연구원 음양력 데이터 기준이며, 중국 춘절과 날짜가 다른 해가 있습니다(예: 1997년).
          </p>
        </div>

        {/* ── FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 면책 강화 ── */}
        <Disclaimer variant="default" open>
          본 띠·별자리 계산기는 <strong>재미용·교육용 도구</strong>입니다.
          <ul style={{ paddingLeft: 18, margin: '6px 0 0' }}>
            <li>점성술·사주명리는 재미·문화 영역</li>
            <li>인생 결정 도구 X (결혼·이별·취업·이주)</li>
            <li>운세·미래 예측 X</li>
            <li>절대화 표현 X (「반드시」·「절대 안 됨」)</li>
            <li>한국 사주 ≠ 서양 점성술 (혼동 주의)</li>
          </ul>
          <p style={{ margin: '8px 0 4px', fontWeight: 600 }}>본 도구의 궁합 결과는:</p>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li>일반적 성향 분석 + 문화적 해석</li>
            <li>두 사람 관계 ≠ 띠/별자리만으로 결정</li>
            <li>실제 관계는 노력·소통·이해</li>
          </ul>
          <p style={{ margin: '8px 0 4px', fontWeight: 600 }}>도움이 필요하면:</p>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li>여성긴급전화 (가족·관계 위기, 24시간): <strong>1366</strong></li>
            <li>청소년·가족 상담: <strong>1388</strong></li>
            <li>자살예방 상담 (24시간): <strong>109</strong></li>
            <li>정신건강 상담: <strong>1577-0199</strong></li>
            <li>사주·점성 자문: 본 도구 영역 X</li>
          </ul>
        </Disclaimer>

        {/* ── 관련 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/age',          icon: '🎂', name: '만 나이 계산기',            desc: '법 개정 기준 만 나이' },
              { href: '/tools/date/lunar',        icon: '🌙', name: '양력 음력 변환기',             desc: '음력 ↔ 양력 변환·간지 확인' },
              { href: '/tools/date/history-era',  icon: '📜', name: '연호·연대 변환기',     desc: '단기·조선 왕 연호·간지' },
              { href: '/tools/date/dday',         icon: '📅', name: 'D-Day 계산기',    desc: '생일까지·두 날짜 사이·페이스' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '20px' }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </ToolPage>
  )
}
