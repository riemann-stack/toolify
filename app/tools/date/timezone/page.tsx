import Link from 'next/link'
import TimezoneClient from './TimezoneClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'
import Callout from '@/components/Callout'
import { offsetMinutes, partsInZone } from './timezoneData'

export const metadata = buildMetadata({
  path: '/tools/date/timezone',
  title: '시간대(타임존) 변환기 — UTC·KST·EST·PST·BST·시드니·인도',
  description: 'UTC·KST·EST·PST·BST·시드니·인도(IST 30분)·이란(30분)·네팔(45분) 등 28개 도시 시간대 일괄 변환. DST(서머타임) 자동 적용, 회의 슬롯 추천.',
  keywords: ['시간대변환기', '타임존변환', 'UTC변환', 'KST', 'EST', 'PST', 'BST', '서머타임', 'DST', '시드니시간', '인도시간', '뉴욕시간', 'LA시간', '런던시간', '국제회의시간'],
})

const FAQ_LD = [
              {
                q: 'DST(서머타임)는 어떻게 자동 감지되나요?',
                a: '브라우저에 내장된 IANA 시간대 데이터(<strong>tzdata</strong>)를 사용합니다. 입력하신 날짜·시각에 해당 도시가 DST를 적용 중이면 카드에 노란 <strong>DST</strong> 배지가 표시되고, 약어도 EDT·BST처럼 서머타임 약어로 바뀝니다. 각국 정부가 제도를 바꾸면 IANA tzdata에 반영되고, 브라우저 업데이트를 통해 자동 적용됩니다.',
              },
              {
                q: '인도 시간이 30분 단위라는데, 왜 그런가요?',
                a: '인도는 동서로 약 30°(약 2시간 차이)에 걸친 큰 영토를 가졌지만 통일된 <strong>IST(UTC+5:30)</strong>를 사용합니다. 1906년 영국령 인도 시기에 도입되어 1947년 독립 후에도 국가 표준시로 유지된 것으로, 인도 중부의 <strong>82.5°E</strong>(82°30′E, 미르자푸르 인근) 자오선을 기준으로 합니다. 경도 15°가 1시간이므로 82.5°E가 정확히 UTC+5:30이 됩니다.<br/><br/>네팔은 가우리샹카르산을 지나는 86°15′E 자오선을 공식 기준으로 <strong>+5:45</strong>를 쓰며(1986년 채택) 인도와의 15분 차이는 독자성의 상징으로 널리 해석됩니다. 이란은 공식 자오선 52.5°E에 따라 자연스럽게 <strong>+3:30</strong>이 되었습니다.',
              },
              {
                q: '서울→뉴욕 시차가 13시간일 때도 있고 14시간일 때도 있어요. 어느 게 맞나요?',
                a: '둘 다 맞습니다. 미국이 <strong>DST를 시행하는 3월 둘째 일요일~11월 첫째 일요일</strong>에는 시차가 <strong>13시간</strong>(EDT=UTC-4), 그 외 기간엔 <strong>14시간</strong>(EST=UTC-5)입니다. 본 도구는 입력 날짜를 기준으로 자동 적용합니다.',
              },
              {
                q: '회의 슬롯의 "근무시간"은 어떻게 정의되나요?',
                a: '기본값은 <strong>09:00~18:00</strong>이지만, 직접 6:00~24:00 범위에서 조정 가능합니다. 모든 선택 도시가 근무시간 안에 들면 <strong>🟢 녹색</strong>, 전원이 확장 허용폭(<strong>근무 시작 1시간 전~종료 2시간 후</strong>, 기본값 기준 08~20시) 안에 들면 <strong>🟡 노랑</strong>, 그 외엔 불가(회색)로 평가합니다.',
              },
              {
                q: '베스트 슬롯 3개는 어떻게 추천되나요?',
                a: '24시간을 15분 단위(총 96슬롯)로 나누어 각 슬롯을 평가한 뒤, <strong>연속된 같은 색 구간</strong>을 묶어 길이가 긴 순으로 정렬합니다. 🟢 구간이 있으면 🟢 우선, 없으면 🟡 구간을 보여주고, 둘 다 없으면 <strong>가장 많은 도시가 근무·허용 시간대인 차선 구간(⚪)</strong>을 제시합니다. 각 후보에는 도시별 현지 시각이 함께 표시되며, LIVE 모드에서는 이미 지난 오늘 슬롯은 추천에서 제외합니다.',
              },
              {
                q: 'UTC와 GMT의 차이가 뭔가요?',
                a: '실용적으로는 동일합니다. <strong>GMT</strong>는 그리니치 천문대의 천문 관측 기반(1884년 채택), <strong>UTC</strong>는 원자시계 기반의 현재 국제 표준(1972년 채택)입니다. UTC는 윤초로 평균 태양시(=GMT)와의 차이를 0.9초 이내로 유지합니다.<br/><br/>일상 변환에서는 둘을 같은 것으로 다뤄도 무방하지만, 영국 자체는 <strong>겨울엔 GMT(UTC+0), 여름엔 BST(UTC+1)</strong>를 씁니다. 참고로 2022년 국제도량형총회(CGPM)는 늦어도 2035년까지 UT1−UTC 허용 폭을 넓혀 윤초를 사실상 없애기로 결의했고, 새 허용 폭 등 세부안은 이후 총회에서 정합니다. 윤초가 사라져도 UTC 기준 시차 계산은 달라지지 않습니다.',
              },
              {
                q: '날짜가 바뀌는 도시(+1d, -1d)는 어떻게 표시되나요?',
                a: '기준 도시의 날짜를 0일로 잡고, 다른 도시의 날짜가 다르면 카드에 <strong style="color:var(--success)">+1일</strong> 또는 <strong style="color:var(--danger)">-1일</strong> 배지가 붙습니다. 예) 서울 5월 21일 23:00 → LA는 5월 21일 07:00(-1일 아님), 뉴욕은 5월 21일 10:00(-1일 아님). 하지만 서울 5월 22일 02:00 → 뉴욕은 5월 21일 13:00 (-1일).',
              },
              {
                q: '"지금" LIVE 모드는 얼마나 자주 갱신되나요?',
                a: '30초마다 자동 갱신됩니다. 정확한 회의 시작 시각을 알아야 한다면 LIVE를 끄고 직접 시각을 입력하세요. LIVE 중에도 입력란을 수정하면 자동으로 LIVE가 해제되고 입력한 시각으로 고정됩니다.',
              },
              {
                q: '선택한 도시 목록이 저장되나요?',
                a: '네. 기준 도시·선택 도시·근무시간 설정은 <strong>브라우저 로컬 저장소</strong>에 저장되어 다음 방문 시 자동 복원됩니다. 다른 기기·브라우저 간에는 동기화되지 않습니다.',
              },
              {
                q: '1988년이나 1960년 날짜를 넣으면 서울 시차가 9시간이 아니게 나와요.',
                a: '오류가 아니라 실제 역사입니다. IANA 시간대 데이터에는 서울의 과거 표준시 변경이 기록되어 있고, 본 도구는 입력한 날짜의 규칙을 그대로 적용합니다.<br/><br/>· <strong>1954년 3월 21일~1961년 8월 9일</strong> — 동경 127.5° 기준 <strong>UTC+8:30</strong> (1955~1960년 여름엔 서머타임으로 +9:30)<br/>· <strong>1961년 8월 10일~</strong> — 「표준시에 관한 법률」에 따라 동경 135° 기준 <strong>UTC+9</strong><br/>· <strong>1987·1988년 5~10월</strong> — 서울올림픽 전후 서머타임으로 <strong>UTC+10</strong> (카드에 DST 배지 표시)<br/><br/>옛 신문·외신 기록의 시각을 환산할 때는 이 차이를 감안해야 합니다.',
              },
            ]

/* 서머타임 전환 일시 — 빌드 시점에 도구와 같은 tzdata 헬퍼(offsetMinutes·partsInZone)로 계산.
   하루 단위(UTC 정오)로 오프셋 변화를 찾은 뒤 그 24시간을 15분 간격으로 훑어 전환 순간을 확정한다. */
const DST_ZONES = [
  { name: '뉴욕 (미국·캐나다 동부)', tz: 'America/New_York' },
  { name: '런던 (영국)', tz: 'Europe/London' },
  { name: '파리·베를린 (EU)', tz: 'Europe/Paris' },
  { name: '시드니 (호주 동남부)', tz: 'Australia/Sydney' },
  { name: '오클랜드 (뉴질랜드)', tz: 'Pacific/Auckland' },
]
const WD = ['일', '월', '화', '수', '목', '금', '토']
const hh = (n: number) => String(n).padStart(2, '0')

function dstShifts(tz: string, year: number): { start: string; end: string } {
  const DAY = 86400000, STEP = 900000
  const out = { start: '—', end: '—' }
  let prevT = Date.UTC(year, 0, 1, 12)
  let prev = offsetMinutes(new Date(prevT), tz)
  for (let t = prevT + DAY; new Date(t).getUTCFullYear() === year; t += DAY) {
    const o = offsetMinutes(new Date(t), tz)
    if (o !== prev) {
      let x = prevT
      while (x < t && offsetMinutes(new Date(x), tz) === prev) x += STEP
      const after = partsInZone(new Date(x), tz)
      const beforeMin = after.hour * 60 + after.minute - (o - prev)
      const label = `${after.month}/${after.day}(${WD[after.weekday]}) ${hh(Math.floor(((beforeMin % 1440) + 1440) % 1440 / 60))}:00→${hh(after.hour)}:00`
      if (o > prev) out.start = label
      else out.end = label
      prev = o
    }
    prevT = t
  }
  return out
}

const DST_YEAR = new Date().getFullYear()
const DST_ROWS = DST_ZONES.map(z => ({ ...z, y0: dstShifts(z.tz, DST_YEAR), y1: dstShifts(z.tz, DST_YEAR + 1) }))

export default function TimezonePage() {
  return (
    <ToolPage width={760} slug="/tools/date/timezone">
      <h1 className="tp-h1">
        <ToolIconBadge catId="date" />시간대(타임존) 변환기
      </h1>
      <p className="tp-lead">
        UTC·KST·EST·PST·BST·시드니·인도(+5:30)·이란(+3:30)·네팔(+5:45) 등 <strong style={{ color: 'var(--text)' }}>28개 도시 동시 변환</strong>.
        DST(서머타임) 자동 적용 · 국제 회의 잡기용 <strong style={{ color: 'var(--text)' }}>겹치는 근무시간 슬롯 추천</strong>.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="IANA 시간대 데이터베이스(브라우저 내장 tzdata) · 한국 표준시 UTC+9(표준시에 관한 법률)"
        sources={[
          { label: 'IANA Time Zone Database', href: 'https://www.iana.org/time-zones' },
          { label: '표준시에 관한 법률', href: 'https://www.law.go.kr/법령/표준시에관한법률' },
          { label: 'BIPM 제27차 CGPM 결의 4 (UTC·윤초)', href: 'https://www.bipm.org/en/cgpm-2022/resolution-4' },
        ]}
      />

      <TimezoneClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 사용법 */}
        <div>
          <h2 className="g-h2">이렇게 쓰세요</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { n: '1', t: '기준 도시 선택', d: '회의를 잡고 싶은 본인 위치 (보통 🇰🇷 서울)' },
              { n: '2', t: '날짜/시각 입력', d: '"지금"으로 라이브 토글 가능 (30초마다 갱신)' },
              { n: '3', t: '도시 추가', d: '뉴욕·런던·LA·시드니 등 ＋ 버튼으로 추가' },
              { n: '4', t: '회의 슬롯 확인', d: '24시간 막대그래프와 베스트 슬롯 3개 자동' },
            ].map((s) => (
              <div key={s.n} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-strong)', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{s.n}</span>
                  <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{s.t}</strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 1-1. 계산 원리 */}
        <div>
          <h2 className="g-h2">계산 원리 — 모든 도시 시각은 UTC 한 순간에서 나옵니다</h2>
          <p className="g-p">
            이 변환기는 「서울 −14시간」처럼 고정된 시차를 빼지 않습니다. 먼저 기준 도시에 입력한 날짜·시각을 <strong>UTC 기준의 한 순간</strong>으로 바꾸고,
            그 순간을 각 도시의 IANA 시간대 ID(Asia/Seoul, America/New_York, Asia/Kathmandu 등)에 담긴 규칙으로 다시 풀어 현지 시각을 표시합니다.
            그래서 날짜에 따라 달라지는 서머타임, 인도·네팔의 30·45분 오프셋, 나라별 과거 제도 변경이 모두 그 날짜 기준으로 반영됩니다.
          </p>
          <p className="g-p">
            까다로운 부분은 첫 단계입니다. 현지 시각을 UTC로 바꾸려면 그 시점의 오프셋을 알아야 하는데, 오프셋 자체가 시점에 따라 바뀝니다.
            도구는 입력값을 일단 UTC로 가정해 오프셋을 구하고 다시 보정하는 과정을 반복하며, 서머타임 경계 근처에서는 전날·당일·다음 날의 오프셋 후보를 모두 대입해
            <strong> 입력한 현지 시각으로 정확히 되돌아오는 값만</strong> 채택합니다.
          </p>
          <h3 className="g-h3">예시 — 같은 「서울 오전 10시」라도 주가 바뀌면 결과가 다릅니다 (2026년)</h3>
          <ul className="g-list">
            <li>3월 6일(금) 서울 10:00 → 뉴욕 <strong>3월 5일(목) 20:00 EST</strong> — 14시간 차이</li>
            <li>3월 9일(월) 서울 10:00 → 뉴욕 <strong>3월 8일(일) 21:00 EDT</strong> — 13시간 차이 (뉴욕은 3월 8일 새벽 서머타임 시작)</li>
            <li>같은 3월 9일 런던은 01:00 GMT — 영국은 3월 29일에야 서머타임을 시작하므로 서울과 여전히 9시간 차이</li>
          </ul>
          <p className="g-p">
            즉 2026년에는 <strong>3월 8일~28일 3주 동안 뉴욕–런던 차이가 평소 5시간이 아니라 4시간</strong>이고(미국은 3월 둘째 일요일, 유럽은 마지막 일요일에 시작하므로 해마다 2~3주),
            가을에도 유럽이 먼저 서머타임을 끝내는 10월 25일~31일 한 주간 같은 일이 생깁니다.
            미국·유럽 참석자가 함께 있는 정기 회의가 이 기간에 한 시간씩 어긋나는 흔한 이유입니다.
          </p>
        </div>

        {/* 2. DST 설명 */}
        <div>
          <h2 className="g-h2">DST(서머타임) — 시기에 따라 시차가 바뀌는 이유</h2>
          <p className="g-p">
            북미·유럽·호주 등 많은 국가는 <strong style={{ color: 'var(--text)' }}>여름철에 시계를 1시간 앞당기는 일광절약제(Daylight Saving Time)</strong>를 시행합니다.
            그래서 같은 서울→뉴욕이라도 <strong style={{ color: 'var(--accent-ink)' }}>겨울엔 14시간 차이, 여름엔 13시간 차이</strong>가 납니다.
            본 도구는 IANA 시간대 데이터를 사용해 입력 날짜의 DST 적용 여부를 자동 판정합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>지역</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>DST 시작</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>DST 종료</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>서울 시차</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['미국 (뉴욕 기준)', '3월 둘째 일요일', '11월 첫째 일요일', '여름 -13h / 겨울 -14h · 시카고 −1h, LA −3h'],
                  ['영국 (런던)',           '3월 마지막 일요일', '10월 마지막 일요일', '여름 -8h / 겨울 -9h'],
                  ['EU (파리·베를린)',      '3월 마지막 일요일', '10월 마지막 일요일', '여름 -7h / 겨울 -8h'],
                  ['호주 (시드니)',         '10월 첫째 일요일', '4월 첫째 일요일', '여름 +2h / 겨울 +1h'],
                  ['뉴질랜드 (오클랜드)',   '9월 마지막 일요일', '4월 첫째 일요일', '여름 +4h / 겨울 +3h'],
                  ['한국·일본·중국·인도',   '시행 안함', '—', '연중 동일'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 20 }}>
            규칙을 실제 날짜로 풀면 아래와 같습니다. 이 표는 페이지를 만들 때 계산기와 같은 tzdata 함수로 전환 순간을 찾아 채운 값이며, 시각은 모두 <strong>그 도시의 현지 시계</strong> 기준입니다.
            남반구(시드니·오클랜드)는 한 해 안에서 4월에 서머타임이 끝나고 9~10월에 다시 시작합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <caption className="srOnly">{DST_YEAR}~{DST_YEAR + 1}년 도시별 서머타임 전환 일시 (현지 시각, 앞 시각→뒤 시각)</caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>도시</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{DST_YEAR} 시작</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{DST_YEAR} 종료</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{DST_YEAR + 1} 시작</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{DST_YEAR + 1} 종료</th>
                </tr>
              </thead>
              <tbody>
                {DST_ROWS.map((r, i) => (
                  <tr key={r.tz} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text)', fontWeight: 500 }}>{r.name}</th>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{r.y0.start}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{r.y0.end}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{r.y1.start}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{r.y1.end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            예) 「02:00→03:00」은 새벽 2시가 되는 순간 시계를 3시로 넘긴다는 뜻으로, 그날 02:00~02:59는 존재하지 않습니다. 「02:00→01:00」은 1시대가 두 번 지나갑니다.
          </p>
        </div>

        {/* 2-1. DST 경계 처리 */}
        <div>
          <h2 className="g-h2">존재하지 않는 시각, 두 번 오는 시각 — 전환일 입력 주의</h2>
          <p className="g-p">
            서머타임이 시작되는 날 새벽에는 한 시간이 통째로 사라지고, 끝나는 날에는 한 시간이 반복됩니다.
            2026년 뉴욕을 기준 도시로 두고 <strong>3월 8일 02:30</strong>을 입력하면 그런 현지 시각은 실제로 없으므로, 도구가 경고 문구와 함께 실제 계산에 쓴 인접 시각을 보여 줍니다.
            <strong> 11월 1일 01:30</strong>은 EDT(UTC−4)로 한 번, EST(UTC−5)로 또 한 번 오기 때문에, 도구는 앞선 시점(서머타임 쪽)을 택하고 그 사실을 알려 줍니다.
          </p>
          <p className="g-p">
            이런 모호함은 <strong>기준 도시에 입력할 때만</strong> 생깁니다. 변환 대상 도시의 시각은 UTC 한 순간에서 한 방향으로 계산하므로 항상 하나로 정해집니다.
            한국은 서머타임이 없어 서울을 기준으로 두면 경계 문제를 피할 수 있습니다. 다만 1987·1988년 여름과 1954~1961년(8월 9일까지) 날짜는 한국도 UTC+9가 아니었으니 아래 FAQ를 참고하세요.
          </p>
        </div>

        {/* 3. 특수 오프셋 */}
        <div>
          <h2 className="g-h2">30분·45분 단위 시간대 — 인도·이란·네팔</h2>
          <p className="g-p">
            대부분의 시간대는 UTC에서 1시간 단위로 차이가 나지만, 일부 국가는 <strong style={{ color: 'var(--text)' }}>30분·45분 단위</strong>의 독특한 오프셋을 사용합니다.
            본 도구는 이 비표준 오프셋도 정확히 처리하며, 아래 여섯 지역 모두 위 도시 목록(＋ 도시 추가)에서 직접 선택할 수 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { flag: '🇮🇳', name: '인도 (뉴델리·뭄바이)', off: 'UTC+5:30', note: '국토 동서가 넓지만 통일된 표준시 사용. 1906년 도입된 영국 식민지 시기의 유산.' },
              { flag: '🇳🇵', name: '네팔 (카트만두)',     off: 'UTC+5:45', note: '가우리샹카르산(86°15′E) 자오선 기준, 1986년 채택. 인도와의 15분 차이는 독자성 상징으로 해석.' },
              { flag: '🇮🇷', name: '이란 (테헤란)',       off: 'UTC+3:30', note: '2022년 9월 마지막 서머타임 종료 후 DST 폐지 — 연중 +3:30 고정.' },
              { flag: '🇦🇫', name: '아프가니스탄 (카불)', off: 'UTC+4:30', note: '인접국과 다른 단독 오프셋.' },
              { flag: '🇲🇲', name: '미얀마 (양곤)',       off: 'UTC+6:30', note: '인도(+5:30)와 태국(+7:00) 중간.' },
              { flag: '🇨🇦', name: '뉴펀들랜드 (캐나다)', off: 'UTC-3:30', note: '캐나다 동쪽 끝. 표준시 −3:30, 3~11월 서머타임(NDT)엔 −2:30.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '18px' }}>{c.flag}</span>
                  <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{c.name}</strong>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginLeft: 'auto' }}>{c.off}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{c.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 시간대 vs 시간차 */}
        <div>
          <h2 className="g-h2">UTC·GMT·KST — 약어 정리</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { abbr: 'UTC', name: '협정 세계시', desc: '국제 표준시. 모든 시간대의 기준점. 1972년부터 GMT를 대체.' },
              { abbr: 'GMT', name: '그리니치 평균시', desc: '영국 그리니치 천문대 기준. 실용상 UTC와 동일. 영국은 겨울에 GMT, 여름엔 BST(GMT+1).' },
              { abbr: 'KST', name: '한국 표준시', desc: 'UTC+9. 일본(JST)·동쪽 인도네시아와 동일. DST 시행 안함.' },
              { abbr: 'EST/EDT', name: '미 동부 표준시/일광절약시', desc: '뉴욕·토론토. EST=UTC-5(겨울), EDT=UTC-4(여름).' },
              { abbr: 'PST/PDT', name: '미 태평양 표준시/일광절약시', desc: 'LA·밴쿠버·시애틀. PST=UTC-8(겨울), PDT=UTC-7(여름).' },
              { abbr: 'CST', name: '중국/미 중부 표준시', desc: '같은 약어가 중국 표준시(UTC+8, 베이징)와 미 중부 표준시(UTC-6, 시카고) 둘 다를 뜻합니다 — 14시간 차이이므로 문맥 확인 필수.' },
              { abbr: 'BST', name: '영국 서머타임', desc: '영국 여름철 시간. UTC+1. 같은 약어 BST가 방글라데시 표준시(UTC+6)를 뜻하기도 하므로 혼동 주의.' },
              { abbr: 'IST', name: '인도 표준시', desc: 'UTC+5:30. 이스라엘 표준시(UTC+2)·아일랜드 표준시(여름 UTC+1)와 약어가 같으니 주의.' },
              { abbr: 'AEST/AEDT', name: '호주 동부 표준시/일광절약시', desc: '시드니·멜버른. AEST=UTC+10(겨울), AEDT=UTC+11(여름).' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <code style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--accent)', fontWeight: 800, background: 'var(--accent-dim)', padding: '3px 9px', borderRadius: '6px', minWidth: '70px', textAlign: 'center' }}>{item.abbr}</code>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{item.name}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. 회의 잡기 팁 */}
        <div>
          <h2 className="g-h2">국제 회의 잡기 — 실전 팁</h2>
          <h3 className="g-h3">무난한 시간대 (북반구 서머타임 시기 기준)</h3>
          <ul className="g-list">
            {[
              '한·미·유럽 회의: 한국 오후 9~10시 = 미동부 오전 8~9시 = 중부유럽 오후 2~3시',
              '한·미 서부 회의: 한국 오전 9~10시 = LA는 전날 오후 5~6시 (LA 입장 약간 불편)',
              '한·호주 회의: 한국 오전 8~10시 = 시드니 오전 9~11시 (가장 이상적)',
              '겨울(11~3월)엔 같은 한국 시각이 미국·유럽 현지로는 1시간 이르고, 시드니는 남반구라 반대로 10~4월이 서머타임(+1h)입니다',
              '서머타임 전환 직후 한 주, 특히 미국·유럽이 엇갈리는 3월·10월 말에는 시차를 한 번 더 확인하세요',
            ].map((t, i) => <li key={i}>{t}</li>)}
          </ul>
          <Callout tone="warn" title="자주 하는 실수">
            <ul>
              <li>미국은 서머타임 기간에도 「EST/PST」라고 관용적으로 쓰는 경우가 많습니다 — 실제로는 EDT/PDT이므로 날짜를 넣어 확인하세요.</li>
              <li>「오후 3시」 같은 12시간 표기보다 「15:00 KST」처럼 24시간제+시간대 약어가 안전합니다. CST·IST·BST처럼 한 약어가 여러 나라를 뜻하기도 합니다.</li>
              <li>캘린더 초대는 시작 시각의 시간대를 명시하고(Outlook·Google 캘린더는 자동 변환), 회의 결과 메일엔 참석자별 현지 시각을 병기하세요.</li>
            </ul>
          </Callout>
        </div>

        {/* 6. FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* 7. 관련 도구 */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/date/jet-lag',     emoji: '✈️', name: '시차 적응 계산기',  desc: '여행 전·중·후 수면 일정' },
              { href: '/tools/date/server-time', emoji: '⏱️', name: '실시간 서버 시간',  desc: 'NTP 동기화 KST 밀리초' },
              { href: '/tools/date/dday',        emoji: '📅', name: 'D-Day 계산기',     desc: '회의 D-day·기간 계산' },
              { href: '/tools/date/age',         emoji: '🎂', name: '나이 계산기',       desc: '여권·만 나이 확인용' },
            ].map((t) => (
              <Link key={t.href} href={t.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>{t.emoji}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>{t.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
