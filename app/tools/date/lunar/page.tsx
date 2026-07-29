import Link from 'next/link'
import LunarClient from './LunarClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import Disclaimer from '@/components/Disclaimer'

export const metadata = buildMetadata({
  path: '/tools/date/lunar',
  title: '양력 음력 변환기 — 음력 생일·설날·추석 · 60갑자 간지',
  description: '양력 ↔ 음력 자유 변환 + 60갑자 간지·띠 자동 표시. 설날·추석 등 명절 양력 날짜와 윤달 계산, 제사·생일 음력 확인까지. 한국천문연구원 데이터 기준.',
  keywords: ['양력음력변환기', '양음력변환', '음력양력변환', '음력달력', '음력생일', '윤달계산', '60갑자', '간지계산', '설날 양력', '추석 양력', '음력 생일 양력'],
})

const FAQ_LD = [
              {
                q: '윤달이란 무엇인가요?',
                a: '음력은 1년이 약 354일이라 양력과 11일가량 차이가 납니다. 이를 보정하려고 2~3년에 한 번 한 달을 덧붙이는데, 이 달이 윤달입니다. 현행 규칙은 <strong>무중치윤법(無中置閏法)</strong> — 24절기 중 중기(中氣)가 들지 않는 달을 윤달로 삼으며, 결과적으로 약 19년에 7번꼴(메톤 주기 근사)이 됩니다. 예를 들어 윤4월은 「4월 다음에 다시 4월」이 한 번 더 오는 셈입니다.<br/><br/><strong>전통적으로 윤달은 「공달」</strong>이라 하여 손 없는 달로 여겨 이장(移葬)·수의 제작 등 평소 꺼리던 일을 하는 시기로 씁니다(한국민속대백과사전). 결혼은 이중적입니다 — 『동국세시기』 등 전통 문헌은 윤달 혼인을 좋다고 했지만, 현대에는 반대로 윤달 결혼을 피하는 속설도 퍼져 있습니다.',
              },
              {
                q: '음력 생일은 매년 양력으로 바뀌나요?',
                a: '네. 음력 생일은 매년 양력 날짜가 달라집니다. 예를 들어 <strong>음력 1월 1일(설날)은 2026년 2월 17일, 2027년 2월 7일</strong>입니다.<br/><br/>편차는 보통 ±11일 이내지만, 윤달이 끼면 그해는 같은 음력 날짜라도 양력 30일 이상 뒤로 밀릴 수 있습니다. 매년 본 계산기로 그해 양력 날짜를 확인해 미리 일정에 표시하는 것을 권장합니다.',
              },
              {
                q: '60갑자는 어떻게 계산되나요?',
                a: '천간 10개와 지지 12개를 순서대로 조합해 60년 주기로 순환합니다.<br/>· 2024년 = <strong>갑진(甲辰)</strong> · 청룡띠<br/>· 2025년 = <strong>을사(乙巳)</strong> · 푸른 뱀띠<br/>· 2026년 = <strong>병오(丙午)</strong> · 붉은 말띠<br/><br/>천간과 지지의 색·오행 의미가 결합되어 「청룡」, 「붉은 말」 등의 별칭으로 불리기도 합니다. 만 60세 생일을 「환갑(還甲)」이라 부르는 이유는 자기 출생 연도의 간지로 돌아오기 때문입니다.',
              },
              {
                q: '음력 생일을 양력으로 옮기면 띠가 달라질 수도 있나요?',
                a: '있습니다. <strong>띠는 음력 1월 1일(설날)을 기준</strong>으로 바뀌므로, 양력 1월~2월 초 출생자는 양력으로는 올해지만 음력으로는 전년도에 속할 수 있습니다.<br/><br/>예) 2024년 2월 5일 양력 출생 → 음력으로는 2023년(계묘·토끼띠) 12월. 본 계산기로 음력 변환 후 띠를 확인하는 것이 정확합니다.<br/><br/>참고: 설날 기준은 민속·달력 관행이며, 사주 명리에서는 <strong>입춘(2월 4일경)</strong>을 연도 경계로 삼아 결과가 다를 수 있습니다.',
              },
              {
                q: '설날·추석 양력 날짜는 매년 어떻게 정해지나요?',
                a: '설날 = 음력 1월 1일, 추석 = 음력 8월 15일로 음력 자체는 고정입니다. 양력 날짜는 그 해의 음력↔양력 매핑에 따라 결정되며, 한국천문연구원이 산출하고 정부가 매년 「월력요항」으로 발표합니다.<br/><br/>1900~2049년 실측 기준 —<br/>· 설날 양력 범위 — <strong>1월 22일 ~ 2월 20일</strong><br/>· 추석 양력 범위 — <strong>9월 8일 ~ 10월 8일</strong>',
              },
              {
                q: '이 계산기는 얼마나 정확한가요?',
                a: '한국천문연구원(KASI) 음력 데이터와 전 구간(1900~2049년) 일치를 검증했고, 2025~2030년 국가 공휴일 발표(설날·추석·부처님오신날)와도 교차 확인했습니다. 상한이 2049년인 이유는 KASI가 확정 계산해 배포한 음양력 자료가 2050년까지이기 때문입니다.<br/><br/>주의: 흔히 쓰이는 중국력 기반 변환기와는 <strong>다른 날이 있습니다</strong>. 한국 음력은 KST(UTC+9) 합삭 기준이라 예컨대 한국 설날 2027년은 2월 7일, 중국 춘절은 2월 6일로 하루 다릅니다.',
              },
              {
                q: '한국·중국·일본 음력이 모두 같은가요?',
                a: '대부분 같지만 다른 해가 있습니다. 음력은 「합삭(달과 태양이 일직선)」 시각이 든 날부터 한 달이 시작되는데, 각국 표준시(시차) 때문에 그 시각이 자정을 걸치면 시작일이 하루 달라집니다.<br/>· <strong>한국·중국</strong> — 시차 1시간(KST/CST). 합삭이 한국 자정 직후에 들면 하루 갈립니다. 실제로 <strong>1988·1997·2027·2028년 설날</strong>이 중국 춘절보다 하루 늦었고(2027년 한국 2/7 vs 중국 2/6), 2012년엔 윤달 배치가 달라(한국 윤3월 vs 중국 윤4월) 음력 4월 8일이 한 달 차이 났습니다. 같은 기간 추석 차이는 없었습니다.<br/>· <strong>일본</strong> — 1873년 1월 1일 메이지 개력으로 태양력 채택·음력 공식 폐지 (일부 전통 행사는 음력 사용)<br/>· <strong>베트남</strong> — UTC+7 기준 자체 음력. 1985년엔 설(Tết)이 1월 21일로 한국·중국(2월 20일)보다 <strong>한 달</strong> 빨랐고, 2007년(2/17 vs 2/18)처럼 하루 다른 해도 있습니다.',
              },
              {
                q: '음력 생일과 양력 생일 중 어느 쪽을 챙겨야 하나요?',
                a: '<strong>가족마다 다릅니다.</strong> 일반적인 패턴 —<br/>· 부모·조부모 세대 — 음력 생일을 본 생일로 인식<br/>· 1980년대 이후 출생자 — 대부분 양력 생일이 본 생일<br/>· 일부 가정 — 두 날을 모두 챙김 (양력은 친구·회사, 음력은 가족)<br/><br/>본인 음력 생일이 양력으로 매년 며칠인지 모르겠다면 본 계산기로 미리 5~10년치를 확인해 캘린더에 등록해두면 편합니다.',
              },
            ]

export default function LunarPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="date" />양력 음력 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        양력 ↔ 음력 자유 변환 + <strong style={{ color: 'var(--text)' }}>60갑자 간지·띠</strong> 자동.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="한국천문연구원(KASI) 음력 데이터 1900~2049 전수 일치 · 2025~2030 공휴일 발표 교차 확인"
        sources={[
          { label: '한국천문연구원 음양력변환', href: 'https://astro.kasi.re.kr' },
          { label: '한국민속대백과사전', href: 'https://folkency.nfm.go.kr' },
        ]}
      />

      <LunarClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 양력 vs 음력 차이 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>양력과 음력, 무엇이 다를까?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>양력(태양력)</strong>은 지구가 태양을 한 바퀴 도는 365.25일을 기준으로 하며 현재 세계 표준 달력입니다.
            <strong style={{ color: 'var(--text)' }}> 음력(태음력)</strong>은 달이 차고 기우는 주기 약 29.5일을 한 달로 삼아 1년이 약 354일로 양력보다 11일가량 짧습니다.
            이 차이를 보정하기 위해 중기(中氣)가 들지 않는 달을 윤달로 삼는 <strong style={{ color: 'var(--accent)' }}>무중치윤법</strong>으로 윤달을 끼워 넣으며, 결과적으로 약 19년에 7번꼴(메톤 주기 근사)이 됩니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            한국의 공식 달력은 을미개혁 때 음력 1895년 11월 17일을 <strong style={{ color: 'var(--text)' }}>양력 1896년 1월 1일(건양 원년)</strong>로 삼은 이후 양력이지만, <strong style={{ color: 'var(--text)' }}>설날·추석·부처님오신날·단오·제사·음력 생일</strong> 등 전통 절기는 여전히 음력 기준으로 챙깁니다. 일부 가정은 음력 생일·양력 생일을 모두 챙기기도 합니다.
          </p>
          <div style={{ overflowX: 'auto', marginTop: 14 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>구분</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--accent)', fontWeight: 700 }}>양력 (태양력)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--cat-health)', fontWeight: 700 }}>음력 (태음력)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['기준', '지구의 태양 공전', '달의 차오름·이지러짐'],
                  ['1년 길이', '365일 (윤년 366일)', '약 354일 (윤달 든 해 383~385일)'],
                  ['1개월 길이', '28~31일 고정', '29일 또는 30일'],
                  ['윤 보정', '4년마다 윤일(2/29) 추가', '무중치윤법 (약 19년에 7번꼴)'],
                  ['시작', '1896년 채택 (을미개혁·건양)', '신라·고려·조선~현재'],
                  ['주 용도', '일상·법정·국제', '설·추석·제사·음력 생일'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontWeight: 500 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. 한국 명절 음력 → 양력 (2026~2028) */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>한국 명절 음력 → 양력 (2026~2028)</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            매년 양력 날짜가 바뀝니다. 설·추석은 한국에서 가장 큰 명절(3일 연휴).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>명절 (음력)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>2026</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>2027</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>2028</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🌅 설날 (1.1)',         '2/17', '2/7',  '1/27'],
                  ['🌕 정월 대보름 (1.15)', '3/3',  '2/21', '2/10'],
                  ['🌸 부처님오신날 (4.8)', '5/24', '5/13', '5/2'],
                  ['🌿 단오 (5.5)',         '6/19', '6/9',  '5/28'],
                  ['🌾 추석 (8.15)',        '9/25', '9/15', '10/3'],
                  ['🎋 중양절 (9.9)',       '10/19','10/8', '10/26'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap' }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[2]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 10 }}>
            ※ 한국천문연구원 데이터·국가 공휴일 발표 기준. 2027년 설날(2/7)·2028년 설날(1/27)은 중국 춘절(각 2/6·1/26)과 하루 다른 해입니다 —
            한국 음력은 KST 합삭 기준이라 중국력 기반 달력·앱과 차이가 날 수 있습니다.
          </p>
        </div>

        {/* 3. 60갑자 — 천간 · 지지 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>60갑자 — 천간(10) × 지지(12)</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            동아시아 전통 연도 표기. 천간 10개와 지지 12개를 순차로 조합해 60년마다 한 번 순환합니다 — 그래서 만 60세 환갑(還甲)은 「자기 출생 간지로 돌아오는」 의미.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            주기가 60년인 이유는 <strong style={{ color: 'var(--text)' }}>10과 12의 최소공배수가 60</strong>이기 때문입니다.
            또한 천간이 양(갑·병·무·경·임)이면 지지도 양(자·인·진·오·신·술)끼리만 짝지어지므로 120개가 아닌 <strong style={{ color: 'var(--text)' }}>60개 조합</strong>만 존재합니다 — 갑축(甲丑)·을자(乙子) 같은 간지는 없습니다.
            천간의 오행·색과 지지의 동물이 결합해 「청룡(갑진)」 「붉은 말(병오)」 같은 별칭이 만들어집니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>천간 (10)</p>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, fontFamily: 'Noto Sans KR, sans-serif' }}>
                甲(갑) · 乙(을) · 丙(병) · 丁(정) · 戊(무)<br/>
                己(기) · 庚(경) · 辛(신) · 壬(임) · 癸(계)
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(8,145,178,0.25)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--cat-health)', fontWeight: 700, marginBottom: 8 }}>지지 (12) · 띠</p>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, fontFamily: 'Noto Sans KR, sans-serif' }}>
                子(자·쥐) · 丑(축·소) · 寅(인·범) · 卯(묘·토끼)<br/>
                辰(진·용) · 巳(사·뱀) · 午(오·말) · 未(미·양)<br/>
                申(신·원숭이) · 酉(유·닭) · 戌(술·개) · 亥(해·돼지)
              </p>
            </div>
          </div>
          <div style={{ overflowX: 'auto', marginTop: 14 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>최근 연도</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>간지</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>띠</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['2024', '甲辰 (갑진)', '🐲 청룡띠'],
                  ['2025', '乙巳 (을사)', '🐍 푸른 뱀띠'],
                  ['2026', '丙午 (병오)', '🐴 붉은 말띠'],
                  ['2027', '丁未 (정미)', '🐑 붉은 양띠'],
                  ['2028', '戊申 (무신)', '🐒 누런 원숭이띠'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. 사용 방법 (기존 유지) */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>사용 방법</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { step: '1', title: '변환 방향 선택', content: '상단 토글에서 "양력 → 음력" 또는 "음력 → 양력" 을 고릅니다.' },
              { step: '2', title: '날짜 입력', content: '년/월/일 드롭다운에서 변환할 날짜를 선택합니다. 양력 1900년 1월 31일부터 2049년 12월 31일까지 지원됩니다 (한국천문연구원 확정 데이터 범위).' },
              { step: '3', title: '윤달 체크 (필요 시)', content: '음력 → 양력 변환 시 해당 월이 윤달이 있는 달이라면 "윤O월로 계산" 체크박스가 나타납니다.' },
              { step: '4', title: '결과 확인', content: '변환된 날짜와 해당 연도의 60갑자, 띠를 함께 확인할 수 있습니다.' },
            ].map((item) => (
              <div key={item.step} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '18px', fontWeight: 800, color: 'var(--accent)', minWidth: '24px' }}>{item.step}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>{item.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. FAQ (아코디언) */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* 면책·기준 고지 */}
        <Disclaimer
          variant="default"
          sources={[
            { label: '한국천문연구원 음양력변환', href: 'https://astro.kasi.re.kr' },
            { label: '2027년 월력요항 (우주항공청)', href: 'https://www.kasa.go.kr/prog/plcyBrf/brief/kor/sub01_01_04/view.do?plcyBrfNo=431' },
          ]}
        >
          본 변환기는 한국천문연구원(KASI) 음력 데이터(1900~2049) 기준입니다.
          한국 음력은 KST 합삭 시각 기준이라 중국·베트남 등 다른 나라 음력과 일부 날짜가 다를 수 있으며
          (예: 2027년 한국 설날 2월 7일 vs 중국 춘절 2월 6일), 중국력 기반 달력·앱과 결과가 다른 해가 있습니다.
          제사·택일 등 중요한 날짜는 그해 발표되는 공식 달력(월력요항)으로 재확인하세요.
        </Disclaimer>

        {/* 6. 관련 도구 — 2열 카드 그리드 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/zodiac',     icon: '🐲', name: '띠·별자리 계산기',   desc: '60갑자·궁합·삼합' },
              { href: '/tools/date/age',        icon: '🎂', name: '나이 계산기',         desc: '만 나이 통일법 기준' },
              { href: '/tools/date/dday',       icon: '📅', name: 'D-Day 계산기',        desc: '두 날짜 사이·페이스' },
              { href: '/tools/date/military',   icon: '🎖️', name: '군대 전역일 계산기',  desc: '전역일·복무율' },
              { href: '/tools/date/history-era', icon: '📜', name: '연호·연대 변환기',   desc: '단기·조선왕·간지·한·중·일' },
              { href: '/tools/date/life-time',  icon: '⏳', name: '생애 시간 계산기',    desc: '살아온 시간·앞으로의 시간' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
