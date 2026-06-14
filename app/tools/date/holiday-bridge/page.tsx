import Link from 'next/link'
import HolidayBridgeClient from './HolidayBridgeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/date/holiday-bridge',
  title: '징검다리 연휴 플래너 — 연차 최소로 최대 연휴 만들기',
  description:
    '보유 연차 일수를 입력하면 2026·2027 공휴일·대체공휴일에 맞춰 가장 길게 쉴 수 있는 연차 배치를 추천합니다.',
  keywords: [
    '징검다리 연휴',
    '2026 연차 언제',
    '황금연휴 2026',
    '연차 효율',
    '2026 공휴일 캘린더',
    '대체공휴일 2026',
    '연휴 플래너',
    '2027 설날 연휴',
  ],
})

const FAQ_LD = [
  {
    q: '2026년 연차 언제 쓰면 가장 길게 쉬나요?',
    a: '연차를 <strong>공휴일과 주말 사이의 평일</strong>에 끼워 넣는 것이 핵심입니다. 2026년은 추석(9/24목~9/26금) 앞 평일 9/21·9/22·9/23 사흘에 연차를 쓰면 직전 주말(9/19~20)까지 이어져 <strong>9/19~9/27 9일 연속</strong>이 됩니다. 연차 3개로 9일이니 효율 3.0배입니다. 설 연휴(2/16~18 화) 직후 2/19·2/20에 연차 2개를 더하면 2/14~2/22 9일도 가능합니다. 본 도구에 보유 연차를 입력하면 그해 가장 효율 높은 구간을 자동으로 찾아줍니다.',
  },
  {
    q: '2026 추석 연휴 며칠인가요? 연차 며칠 쓰면 길어지나요?',
    a: '2026년 추석은 <strong>9월 24일(목)·25일(금)·26일(토)</strong>이고 다음 날 9월 27일(일)까지 더하면 <strong>연차 없이 4일 연휴</strong>입니다. 여기에 추석 직전 평일 9/21(월)·9/22(화)·9/23(수) 사흘에 연차를 쓰면 직전 주말(9/19~20)부터 이어져 <strong>9/19~9/27 9일 연속</strong>이 됩니다. 연차 3개로 9일, 즉 1개당 3일을 버는 셈입니다.',
  },
  {
    q: '2026 광복절이 토요일인데 대체공휴일 있나요?',
    a: '네. 2026년 광복절 8월 15일이 <strong>토요일</strong>이라 다음 평일인 <strong>8월 17일(월)이 대체공휴일</strong>로 지정됩니다. 따라서 8/15(토)·8/16(일)·8/17(월)이 <strong>연차 없이 3일 연휴</strong>입니다. 삼일절·어린이날·부처님오신날·광복절·개천절·한글날·성탄절은 토요일이나 일요일과 겹치면 대체공휴일이 부여됩니다.',
  },
  {
    q: '징검다리 연휴에 연차 1~2개로 최대 며칠 쉴 수 있나요?',
    a: '구간에 따라 다릅니다. 2026년 기준 연차 <strong>1개</strong>면 5월 1일(근로자의 날·금)~5월 5일(어린이날·화) 사이 5월 4일(월) 하루만 써도 <strong>5일 연휴</strong>가 됩니다(근로자의 날 휴무 포함 시). 연차 <strong>2개</strong>면 설 연휴(2/16~18) 직후 평일 2개를 붙여 7~9일까지 늘릴 수 있습니다. 본 도구의 "최대 한 방" 모드가 보유 연차 안에서 가장 긴 구간을 골라줍니다.',
  },
  {
    q: '2027년 설날 연휴는 며칠인가요?',
    a: '2027년 설날은 <strong>2월 7일(일)</strong>이고 연휴는 2월 6일(토)·7일(일)·8일(월)입니다. 설 당일이 일요일이라 <strong>2월 9일(화)이 대체공휴일</strong>로 지정되어, 2/6~2/9 <strong>연차 없이 4일 연휴</strong>가 됩니다. 직후 평일 2/10·2/11·2/12에 연차 3개를 붙이면 주말까지 이어져 더 길게 만들 수 있습니다.',
  },
  {
    q: '6월 3일 지방선거날 쉬는 날인가요?',
    a: '네. 2026년 6월 3일은 <strong>제9회 전국동시지방선거일</strong>로 공직선거법상 <strong>공휴일</strong>입니다. 임기만료에 의한 전국 단위 선거일은 법정공휴일이라 관공서·학교가 휴무합니다. 다만 사업장에 따라 유급휴일 적용 여부가 다를 수 있으니 회사 인사규정을 확인하세요.',
  },
  {
    q: '근로자의 날(5월 1일)도 공휴일인가요?',
    a: '<strong>법정공휴일은 아닙니다.</strong> 근로자의 날은 "근로자의 날 제정에 관한 법률"에 따른 <strong>유급휴일</strong>로, 관공서의 공휴일에 관한 규정(대통령령)에 들어가는 빨간 날과는 근거 법이 다릅니다. 그래서 관공서·학교는 정상 운영하고 일반 기업 근로자는 쉽니다. 본 도구는 5월 1일 휴무 여부를 토글로 켜고 끌 수 있습니다.',
  },
  {
    q: '토요일 근무하는 회사도 연휴 계산할 수 있나요?',
    a: '네. "토요일 근무" 토글을 켜면 <strong>토요일을 평일(연차 후보)로 계산</strong>합니다. 주 6일 근무라 토요일에 출근하는 경우 토요일이 연휴를 끊는 평일이 되므로, 같은 공휴일이라도 연차가 더 필요해지거나 연속 일수가 달라집니다. 토글을 끄면 토요일을 휴무로 보고(주 5일제 기준) 계산합니다.',
  },
]

const cardBg = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px' }
const h2Style = { fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' } as const

export default function HolidayBridgePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🌉 징검다리 연휴 플래너
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        보유 연차를 입력하면 2026·2027년 공휴일·대체공휴일에 맞춰 <strong style={{ color: 'var(--text)' }}>가장 길게 쉴 수 있는 연차 배치</strong>를 찾아줍니다. 효율(연차 1개당 며칠)과 연차 0개 기준 대비 추가 획득일까지 비교합니다.
      </p>

      <UpdatedMeta
        date="2026년 6월"
        basis="2026~2027년 법정공휴일·대체공휴일 기준"
        sources={[
          { label: '국가법령정보센터(law.go.kr)', href: 'https://www.law.go.kr/' },
          { label: '인사혁신처', href: 'https://www.mpm.go.kr/' },
          { label: '한국천문연구원', href: 'https://astro.kasi.re.kr/' },
        ]}
      />

      <Disclaimer
        variant="default"
        sources={[
          { label: '관공서의 공휴일에 관한 규정 — 국가법령정보센터', href: 'https://www.law.go.kr/' },
          { label: '인사혁신처·행정안전부 공고', href: 'https://www.mpm.go.kr/' },
          { label: '한국천문연구원 음력', href: 'https://astro.kasi.re.kr/' },
        ]}
      >
        본 도구의 연휴 계산은 2026~2027년 한국 법정공휴일·대체공휴일 기준 참고용 추천입니다. 임시공휴일(정부 발표)·회사별 휴무·연차 정책은 사업장마다 다르므로, 실제 휴가 신청 전 회사 인사규정과 정부 최종 공고를 확인하세요. 임시공휴일은 발표 시 반영됩니다.
      </Disclaimer>

      <HolidayBridgeClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 징검다리 연휴란 */}
        <div>
          <h2 style={h2Style}>징검다리 연휴란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            공휴일과 주말 사이에 평일 하루이틀이 끼어 연휴가 끊길 때, 그 <strong style={{ color: 'var(--text)' }}>평일에 연차를 넣어 다리를 놓는 것</strong>을 징검다리 연휴라고 합니다. 예를 들어 2026년 추석은 9월 24일(목)부터 시작하는데, 그 앞 9/21(월)·9/22(화)·9/23(수)이 평일입니다. 이 사흘에 연차를 쓰면 직전 주말(9/19~20)부터 추석 끝(9/27)까지 <strong style={{ color: 'var(--text)' }}>9일이 한 번에 이어집니다</strong>. 연차 3개로 9일을 쉬니 효율은 3배입니다.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
            핵심은 <strong style={{ color: 'var(--text)' }}>양 끝이 모두 쉬는 날</strong>이어야 한다는 점입니다. 연휴 양 끝이 주말·공휴일로 닫혀 있어야 가운데 평일을 연차로 메웠을 때 통째로 이어집니다. 끝이 평일이면 연차를 더 써야 하거나 효율이 떨어집니다.
          </p>
        </div>

        {/* 2. 2026 황금연휴 best */}
        <div>
          <h2 style={h2Style}>2026년 황금연휴 best 구간</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['연휴', '공휴일', '연차 활용', '결과'].map(h => (
                    <th scope="col" key={h} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['설 연휴', '2/16(월)~2/18(수)', '2/19·2/20 연차 2개', '2/14~2/22 (9일)'],
                  ['어린이날', '5/5(화)', '5/4(월) 연차 1개', '5/2~5/6 (5일)'],
                  ['광복절', '8/15(토)~8/17(월 대체)', '연차 0개', '8/15~8/17 (3일)'],
                  ['추석', '9/24(목)~9/26(금)', '9/21·9/22·9/23 연차 3개', '9/19~9/27 (9일)'],
                  ['개천절', '10/3(토)~10/5(월 대체)', '연차 0개', '10/3~10/5 (3일)'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r[1]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r[2]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent-ink)', fontWeight: 700 }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            추석과 설은 연차 2~3개로 9일까지 늘어나 효율이 가장 좋습니다. 광복절·개천절은 토·일·월(대체)로 이미 3일이라 연차 없이 챙길 수 있는 구간입니다.
          </p>
        </div>

        {/* 3. 2027 미리 보기 */}
        <div>
          <h2 style={h2Style}>2027년 미리 보는 연휴</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            2027년은 설 연휴가 길게 잡힙니다. 설날 2월 7일(일)이라 <strong style={{ color: 'var(--text)' }}>2월 9일(화)이 대체공휴일</strong>로 붙어 2/6~2/9 4일이 연차 없이 생깁니다. 직후 2/10·2/11·2/12에 연차 3개를 넣으면 다음 주말까지 이어집니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
            {[
              { t: '설 연휴', d: '2/6~2/9 (대체 2/9 포함, 4일)' },
              { t: '추석', d: '9/14(화)~9/16(목), 앞뒤 연차로 확장' },
              { t: '광복절', d: '8/15(일) → 8/16(월) 대체공휴일' },
              { t: '한글날', d: '10/9(토) → 10/11(월) 대체공휴일' },
            ].map((c, i) => (
              <div key={i} style={{ ...cardBg, padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{c.t}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 몰아 쓸까 분산할까 */}
        <div>
          <h2 style={h2Style}>연차를 몰아 쓸까, 분산할까 — 효율배수로 따지기</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            같은 연차라도 어디에 쓰느냐에 따라 결과가 다릅니다. 판단 기준은 <strong style={{ color: 'var(--text)' }}>효율배수 = 총 연속일수 ÷ 사용 연차</strong>입니다. 추석 앞에 연차 3개를 몰면 9일(3배)이지만, 같은 3개를 짧은 징검다리 세 곳에 흩으면 한 곳당 4~5일짜리가 여러 개 생깁니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            <div style={{ ...cardBg, padding: '14px 16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '6px' }}>최대 한 방 (집중)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75 }}>
                한 번에 길게 — 추석·설처럼 긴 연휴 앞뒤에 연차를 몰아 9일 이상을 만듭니다. 해외여행·장기 휴식에 유리합니다.
              </p>
            </div>
            <div style={{ ...cardBg, padding: '14px 16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '6px' }}>골고루 분산</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75 }}>
                연중 여러 번 — 연차를 겹치지 않는 구간 여러 곳에 나눠 4~5일짜리 휴식을 분기마다 확보합니다. 자주 쉬고 싶을 때 적합합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 5. 토요일·근로자의 날·회사휴일 */}
        <div>
          <h2 style={h2Style}>토요일 근무·근로자의 날·회사 지정휴일 반영하기</h2>
          <ul style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
            <li>· <strong style={{ color: 'var(--text)' }}>토요일 근무</strong> — 주 6일 근무라면 토글을 켜세요. 토요일이 평일로 처리되어 연휴를 끊는 날이 되고, 같은 공휴일이라도 연차가 더 필요해집니다.</li>
            <li>· <strong style={{ color: 'var(--text)' }}>근로자의 날(5/1)</strong> — 법정공휴일이 아닌 유급휴일입니다. 회사가 쉬면 토글을 켜고, 정상 근무면 끄세요. 5월 초 황금연휴 길이가 크게 달라집니다.</li>
            <li>· <strong style={{ color: 'var(--text)' }}>회사 지정 휴일</strong> — 창립기념일·노조 창립일 등 회사만 쉬는 날을 날짜로 추가하면 그날도 휴무로 잡혀 연속 구간이 늘어납니다. 입력값은 이 브라우저에 저장됩니다.</li>
          </ul>
        </div>

        {/* 6. 대체공휴일 규칙 */}
        <div>
          <h2 style={h2Style}>대체공휴일 규칙 한눈에</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '14px' }}>
            대체공휴일은 <strong style={{ color: 'var(--text)' }}>관공서의 공휴일에 관한 규정 제3조</strong>에 따라 부여됩니다. 공휴일이 주말과 겹치면 평일 하루를 대신 쉬게 하는 제도입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['공휴일', '대체 조건', '비고'].map(h => (
                    <th scope="col" key={h} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['삼일절·어린이날·부처님오신날', '토 또는 일과 겹치면', '다음 첫 비공휴일에 부여'],
                  ['광복절·개천절·한글날·성탄절', '토 또는 일과 겹치면', '다음 첫 비공휴일에 부여'],
                  ['설날·추석 연휴', '일요일·다른 공휴일과 겹치면', '연휴 다음 비공휴일에 부여'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent-ink)', fontWeight: 600 }}>{r[1]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '12px' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            예: 2026년 광복절(8/15)은 토요일이라 8/17(월)이 대체공휴일입니다. 어린이날(5/5)은 화요일이라 대체 없이 그날만 쉽니다. 본 도구는 대체공휴일을 자동 반영합니다.
          </p>
        </div>

        {/* FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* 관련 도구 */}
        <div>
          <h2 style={h2Style}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/dday', icon: '📅', name: 'D-Day 계산기', desc: '연휴까지 카운트다운·영업일 계산' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', textDecoration: 'none' }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
