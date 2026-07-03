import Link from 'next/link'
import TimezoneClient from './TimezoneClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/date/timezone',
  title: '시간대(타임존) 변환기 — UTC·KST·EST·PST·BST·시드니·인도',
  description: 'UTC·KST·EST·PST·BST·시드니·인도(IST 30분)·이란(30분)·네팔(45분) 등 25개 도시 시간대 일괄 변환. DST(서머타임) 자동 적용, 회의 슬롯 추천.',
  keywords: ['시간대변환기', '타임존변환', 'UTC변환', 'KST', 'EST', 'PST', 'BST', '서머타임', 'DST', '시드니시간', '인도시간', '뉴욕시간', 'LA시간', '런던시간', '국제회의시간'],
})

const FAQ_LD = [
              {
                q: 'DST(서머타임)는 어떻게 자동 감지되나요?',
                a: '브라우저에 내장된 IANA 시간대 데이터(<strong>tzdata</strong>)를 사용합니다. 입력하신 날짜·시각에 해당 도시가 DST를 적용 중이면 카드에 노란 <strong>DST</strong> 배지가 표시됩니다. 매년 미국 정부와 IANA가 DST 전환 규칙을 업데이트하면 브라우저에 자동 반영됩니다.',
              },
              {
                q: '인도 시간이 30분 단위라는데, 왜 그런가요?',
                a: '인도는 동서로 약 30°(약 2시간 차이)에 걸친 큰 영토를 가졌지만 통일된 <strong>IST(UTC+5:30)</strong>를 사용합니다. 1947년 독립 이후 정해진 것으로, 인도 중부의 81.75°E 자오선을 기준으로 합니다. 1시간 단위 표준시로 바꾸기엔 사회·경제적 부담이 크다는 판단입니다.<br/><br/>네팔은 인도와 15분 차이를 두기 위해 의도적으로 <strong>+5:45</strong>를 택했고, 이란은 자오선 위치상 자연스럽게 <strong>+3:30</strong>이 되었습니다.',
              },
              {
                q: '서울→뉴욕 시차가 13시간일 때도 있고 14시간일 때도 있어요. 어느 게 맞나요?',
                a: '둘 다 맞습니다. 미국이 <strong>DST를 시행하는 3월 둘째 일요일~11월 첫째 일요일</strong>에는 시차가 <strong>13시간</strong>(EDT=UTC-4), 그 외 기간엔 <strong>14시간</strong>(EST=UTC-5)입니다. 본 도구는 입력 날짜를 기준으로 자동 적용합니다.',
              },
              {
                q: '회의 슬롯의 "근무시간"은 어떻게 정의되나요?',
                a: '기본값은 <strong>09:00~18:00</strong>이지만, 직접 6:00~24:00 범위에서 조정 가능합니다. 모든 선택 도시가 근무시간 안에 들면 <strong>🟢 녹색</strong>, 일부가 근무시간 ±2시간(즉 08~20시) 내라면 <strong>🟡 노랑</strong>, 그 외엔 빨강으로 평가합니다.',
              },
              {
                q: '베스트 슬롯 3개는 어떻게 추천되나요?',
                a: '24시간을 15분 단위(총 96슬롯)로 나누어 각 슬롯을 🟢/🟡/🔴 평가한 뒤, <strong>연속된 같은 색 구간</strong>을 묶어 길이가 긴 순으로 정렬합니다. 🟢 구간이 있으면 🟢 우선, 없으면 🟡 구간을 보여줍니다.',
              },
              {
                q: 'UTC와 GMT의 차이가 뭔가요?',
                a: '실용적으로는 동일합니다. <strong>GMT</strong>는 그리니치 천문대의 천문 관측 기반(1884년 채택), <strong>UTC</strong>는 원자시계 기반의 현재 국제 표준(1972년 채택)입니다. UTC는 윤초로 평균 태양시(=GMT)와의 차이를 0.9초 이내로 유지합니다.<br/><br/>일상 변환에서는 둘을 같은 것으로 다뤄도 무방하지만, 영국 자체는 <strong>겨울엔 GMT(UTC+0), 여름엔 BST(UTC+1)</strong>를 씁니다.',
              },
              {
                q: '날짜가 바뀌는 도시(+1d, -1d)는 어떻게 표시되나요?',
                a: '기준 도시의 날짜를 0일로 잡고, 다른 도시의 날짜가 다르면 카드에 <strong style="color:#059669">+1일</strong> 또는 <strong style="color:#DC2626">-1일</strong> 배지가 붙습니다. 예) 서울 5월 21일 23:00 → LA는 5월 21일 07:00(-1일 아님), 뉴욕은 5월 21일 10:00(-1일 아님). 하지만 서울 5월 22일 02:00 → 뉴욕은 5월 21일 13:00 (-1일).',
              },
              {
                q: '"지금" LIVE 모드는 얼마나 자주 갱신되나요?',
                a: '30초마다 자동 갱신됩니다. 정확한 회의 시작 시각을 알아야 한다면 LIVE를 끄고 직접 시각을 입력하세요. 라이브 토글 중 입력란을 수정하면 자동으로 LIVE가 해제됩니다.',
              },
              {
                q: '선택한 도시 목록이 저장되나요?',
                a: '네. 기준 도시·선택 도시·근무시간 설정은 <strong>브라우저 로컬 저장소</strong>에 저장되어 다음 방문 시 자동 복원됩니다. 다른 기기·브라우저 간에는 동기화되지 않습니다.',
              },
            ]

export default function TimezonePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="date" />시간대(타임존) 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        UTC·KST·EST·PST·BST·시드니·인도(+5:30)·이란(+3:30)·네팔(+5:45) 등 <strong style={{ color: 'var(--text)' }}>25개 도시 동시 변환</strong>.
        DST(서머타임) 자동 적용 · 국제 회의 잡기용 <strong style={{ color: 'var(--text)' }}>겹치는 근무시간 슬롯 추천</strong>.
      </p>

      <TimezoneClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 사용법 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>이렇게 쓰세요</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { n: '1', t: '기준 도시 선택', d: '회의를 잡고 싶은 본인 위치 (보통 🇰🇷 서울)' },
              { n: '2', t: '날짜/시각 입력', d: '"지금"으로 라이브 토글 가능 (30초마다 갱신)' },
              { n: '3', t: '도시 추가', d: '뉴욕·런던·LA·시드니 등 ＋ 버튼으로 추가' },
              { n: '4', t: '회의 슬롯 확인', d: '24시간 막대그래프와 베스트 슬롯 3개 자동' },
            ].map((s) => (
              <div key={s.n} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-strong)', color: '#fff', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{s.n}</span>
                  <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{s.t}</strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. DST 설명 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>DST(서머타임) — 시기에 따라 시차가 바뀌는 이유</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            북미·유럽·호주 등 많은 국가는 <strong style={{ color: 'var(--text)' }}>여름철에 시계를 1시간 앞당기는 일광절약제(Daylight Saving Time)</strong>를 시행합니다.
            그래서 같은 서울→뉴욕이라도 <strong style={{ color: 'var(--accent)' }}>겨울엔 14시간 차이, 여름엔 13시간 차이</strong>가 납니다.
            본 도구는 IANA 시간대 데이터를 사용해 입력 날짜의 DST 적용 여부를 자동 판정합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
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
                  ['미국 (NYC·시카고·LA)', '3월 둘째 일요일', '11월 첫째 일요일', '여름 -13h / 겨울 -14h'],
                  ['영국 (런던)',           '3월 마지막 일요일', '10월 마지막 일요일', '여름 -8h / 겨울 -9h'],
                  ['EU (파리·베를린)',      '3월 마지막 일요일', '10월 마지막 일요일', '여름 -7h / 겨울 -8h'],
                  ['호주 (시드니)',         '10월 첫째 일요일', '4월 첫째 일요일', '여름 +2h / 겨울 +1h'],
                  ['한국·일본·중국·인도',   '시행 안함', '—', '연중 동일'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. 특수 오프셋 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>30분·45분 단위 시간대 — 인도·이란·네팔</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            대부분의 시간대는 UTC에서 1시간 단위로 차이가 나지만, 일부 국가는 <strong style={{ color: 'var(--text)' }}>30분·45분 단위</strong>의 독특한 오프셋을 사용합니다.
            본 도구는 이 비표준 오프셋도 정확히 처리합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { flag: '🇮🇳', name: '인도 (뉴델리·뭄바이)', off: 'UTC+5:30', note: '국토 동서가 넓지만 통일된 표준시 사용. 영국 식민지 시기의 유산.' },
              { flag: '🇳🇵', name: '네팔 (카트만두)',     off: 'UTC+5:45', note: '인도와 15분 차이로 차별화. 가우리샹카르산 자오선 기준.' },
              { flag: '🇮🇷', name: '이란 (테헤란)',       off: 'UTC+3:30', note: '2022년부터 DST 폐지. 연중 동일 오프셋.' },
              { flag: '🇦🇫', name: '아프가니스탄 (카불)', off: 'UTC+4:30', note: '인접국과 다른 단독 오프셋.' },
              { flag: '🇲🇲', name: '미얀마 (양곤)',       off: 'UTC+6:30', note: '인도(+5:30)와 태국(+7:00) 중간.' },
              { flag: '🇨🇦', name: '뉴펀들랜드 (캐나다)', off: 'UTC-3:30', note: '캐나다 동쪽 끝, 본토와 30분 차이.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '18px' }}>{c.flag}</span>
                  <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{c.name}</strong>
                  <span style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginLeft: 'auto' }}>{c.off}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{c.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 시간대 vs 시간차 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>UTC·GMT·KST — 약어 정리</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { abbr: 'UTC', name: '협정 세계시', desc: '국제 표준시. 모든 시간대의 기준점. 1972년부터 GMT를 대체.' },
              { abbr: 'GMT', name: '그리니치 평균시', desc: '영국 그리니치 천문대 기준. 실용상 UTC와 동일. 영국은 겨울에 GMT, 여름엔 BST(GMT+1).' },
              { abbr: 'KST', name: '한국 표준시', desc: 'UTC+9. 일본(JST)·동쪽 인도네시아와 동일. DST 시행 안함.' },
              { abbr: 'EST/EDT', name: '미 동부 표준시/일광절약시', desc: '뉴욕·토론토. EST=UTC-5(겨울), EDT=UTC-4(여름).' },
              { abbr: 'PST/PDT', name: '미 태평양 표준시/일광절약시', desc: 'LA·밴쿠버·시애틀. PST=UTC-8(겨울), PDT=UTC-7(여름).' },
              { abbr: 'BST', name: '영국 서머타임', desc: '영국 여름철 시간. UTC+1. 약어가 방콕 표준시(BMT)와 혼동되므로 주의.' },
              { abbr: 'IST', name: '인도 표준시', desc: 'UTC+5:30. 이스라엘 표준시(Israel ST)와 약어가 같으니 주의.' },
              { abbr: 'AEST/AEDT', name: '호주 동부 표준시/일광절약시', desc: '시드니·멜버른. AEST=UTC+10(겨울), AEDT=UTC+11(여름).' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <code style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '13px', color: 'var(--accent)', fontWeight: 800, background: 'var(--accent-dim)', padding: '3px 9px', borderRadius: '6px', minWidth: '70px', textAlign: 'center' }}>{item.abbr}</code>
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>국제 회의 잡기 — 실전 팁</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#059669', marginBottom: '10px' }}>✅ 권장</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '한·미·유럽 회의: 한국 오후 9~10시 = 미동부 오전 8~9시 = 유럽 오후 1~2시',
                  '한·미 서부 회의: 한국 오전 9~10시 = LA 오후 5~6시 (LA 입장 약간 불편)',
                  '한·호주 회의: 한국 오전 8~10시 = 시드니 오전 9~11시 (가장 이상적)',
                  'DST 전환 직후 한 주는 시차 확인 한 번 더',
                ].map((t, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>• {t}</li>)}
              </ul>
            </div>
            <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626', marginBottom: '10px' }}>⚠️ 주의</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '미국은 "EST/PST" 약어가 DST 시기에도 관용적으로 쓰임 — 실제론 EDT/PDT',
                  '"오후 3시" 같은 12시간 표기보다 "15:00 KST"가 안전',
                  '캘린더 초대 시 시작 시각의 시간대를 명시 (Outlook/Google Calendar는 자동)',
                  '회의 결과 메일엔 모든 참석자 현지 시각 병기',
                ].map((t, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>• {t}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* 6. FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* 7. 관련 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/jet-lag',     emoji: '✈️', name: '시차 적응 계산기',  desc: '여행 전·중·후 수면 일정' },
              { href: '/tools/date/server-time', emoji: '⏱️', name: '실시간 서버 시간',  desc: 'NTP 동기화 KST 밀리초' },
              { href: '/tools/date/dday',        emoji: '📅', name: 'D-Day 계산기',     desc: '회의 D-day·기간 계산' },
              { href: '/tools/date/age',         emoji: '🎂', name: '나이 계산기',       desc: '여권·만 나이 확인용' },
            ].map((t) => (
              <Link key={t.href} href={t.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
    </div>
  )
}
