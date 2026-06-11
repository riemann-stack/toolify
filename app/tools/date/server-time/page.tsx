import Link from 'next/link'
import ServerTimeClient from './ServerTimeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'

// FAQ 본문 + 구조화 데이터(FAQPage)를 함께 쓰기 위해 배열로 추출
const FAQS = [
  {
    q: '본 도구의 서버 시간은 티켓팅 사이트와 완전히 같나요?',
    a: '완전히 같지는 않지만 보통 <strong>±50ms 이내로 일치</strong>합니다.<br/><br/>모든 상용 서버(인터파크·예스24·멜론티켓 등)는 NTP로 동기화되어 있어 서로 ms 단위까지 일치합니다. 본 도구의 Vercel Edge 서버도 NTP 동기화되어 있으므로 같은 기준 시각을 공유합니다.<br/><br/>다만 네트워크 지연(RTT) 때문에 마지막 ms는 다를 수 있으니, <strong>새로고침은 표시 시각보다 약 0.5~1초 일찍</strong> 시작하는 것을 권장합니다.',
  },
  {
    q: '내 PC 시계와 서버 시간이 차이 나는 이유?',
    a: 'OS 시계가 NTP 동기화가 안 됐거나 오래된 경우입니다.<br/><br/>· <strong>Windows 10·11</strong> — 기본은 1주일에 한 번만 동기화. 그 사이 평균 ±1~3초 드리프트<br/>· <strong>macOS</strong> — 30분마다 자동, 비교적 정확<br/>· <strong>스마트폰</strong> — 통신사 시간 동기화로 ±100ms<br/>· <strong>슬립·재부팅 직후</strong> — 일시적 오차 ↑<br/><br/>「내 PC 시계」 표시가 1초 이상 차이나면 OS 시계를 강제 동기화하세요.',
  },
  {
    q: 'F5 새로고침 vs URL 직접 접속, 어느 게 빠른가요?',
    a: '거의 비슷하지만 미세하게 <strong>URL 직접 접속(주소창 엔터)이 빠릅니다</strong>.<br/><br/>· F5 — 브라우저가 캐시 재검증(304 체크) 단계 추가<br/>· Ctrl+F5 — 캐시 완전 무시, 더 느림 (CSS·JS 재다운로드)<br/>· URL 입력 후 엔터 — 일반 GET 요청, 가장 빠름<br/><br/>티켓팅 사이트가 대기열 페이지로 리다이렉트하는 경우엔 어떤 방식이든 결국 대기열에 들어가므로 차이가 미미합니다. <strong>매크로·자동화 봇은 금지</strong>(IP 차단·계정 정지 위험).',
  },
  {
    q: '카운트다운이 0이 되는 정확한 순간에 클릭하면 되나요?',
    a: '아니요, <strong>0이 되기 0.3~0.5초 전</strong>이 황금 시점입니다.<br/><br/>이유 —<br/>· 마우스 클릭에서 서버 응답까지 평균 100~200ms<br/>· 사이트 자체 검증·렌더링에 100~200ms<br/>· 합계 200~400ms를 미리 보내야 정각에 도착<br/><br/>본 도구의 알림음(3초 / 1초 / 정각)을 활용해 1초 전부터 마우스 클릭 준비 → 0.5초 전 클릭 시작이 안정적입니다.',
  },
  {
    q: 'Wi-Fi vs 유선 인터넷, 차이가 큰가요?',
    a: '네, 티켓팅에서는 차이가 큽니다.<br/><br/>· <strong>유선(이더넷)</strong> — 지연 5~15ms, 가장 안정적<br/>· <strong>Wi-Fi 5/6 (5GHz)</strong> — 지연 10~30ms, 거의 차이 없음<br/>· <strong>Wi-Fi (2.4GHz)</strong> — 지연 30~100ms + 간섭 多<br/>· <strong>모바일 5G</strong> — 지연 20~50ms<br/>· <strong>모바일 LTE</strong> — 지연 50~150ms<br/><br/>중요한 티켓팅은 <strong>유선 + 5GHz Wi-Fi 백업</strong> 구성을 권장합니다. PC방의 빠른 인터넷도 좋은 선택.',
  },
  {
    q: '여러 탭·여러 기기로 동시 신청하면 유리한가요?',
    a: '경우에 따라 다릅니다.<br/><br/>· <strong>유리한 경우</strong> — 좌석 선택형 티켓팅(여러 좌석을 동시 확인)<br/>· <strong>불리한 경우</strong> — 단일 계정 동시 접속을 막는 사이트(대부분의 대학 수강신청, 인터파크 회원 1인 1결제)<br/><br/>이런 사이트는 동시 로그인 감지 시 모두 튕길 수 있으니 사이트 정책을 확인하세요. <strong>매크로·자동화 도구는 금지</strong> — IP 차단·법적 책임 위험.',
  },
  {
    q: '본 도구의 알림음이 정확한 시각에 울리나요?',
    a: '서버 시간 기준으로 정확히 울립니다. 다만 브라우저가 백그라운드 탭에 있으면 알림음 타이밍이 부정확할 수 있으니 <strong>해당 탭을 활성화 상태로 두세요</strong>.<br/><br/>iOS Safari는 사용자 상호작용 없이는 소리가 안 나므로 알림음 체크박스를 켤 때 한 번 사용자 클릭이 필요합니다 (자동 처리됨).',
  },
  {
    q: '본 도구로 매크로 만들면 되나요?',
    a: '<strong>안 됩니다.</strong> 본 도구는 「시간 확인」 용도이며, 자동 클릭·매크로·봇은 다음 위험이 있습니다 —<br/>· 사이트 약관 위반 → 계정 영구 정지<br/>· IP 차단 (가족·회사 인터넷 전체 영향)<br/>· 정보통신망법 위반 가능성 (자동화 우회 시)<br/>· 표 사재기 처벌(공연법 개정안)<br/><br/>본 도구는 정직한 사용자가 정확한 시각을 확인해 <strong>공정한 경쟁</strong>을 하도록 돕는 게 목적입니다.',
  },
]

export const metadata = buildMetadata({
  path: '/tools/date/server-time',
  title: '실시간 서버 시간 — 수강신청·티켓팅 정확 시각 (KST 밀리초)',
  description:
    '수강신청·티켓팅·마라톤 신청을 위한 NTP 동기화 KST 밀리초 + 카운트다운·알림음·외부 사이트 트래킹까지.',
  keywords: [
    '서버 시간', '실시간 서버 시간', '정확한 시간', 'KST', '한국 표준시',
    '수강신청 시간', '티켓팅 시간', '콘서트 티켓팅', '마라톤 신청',
    '마라톤 접수', '동아마라톤', '경주 동아마라톤', '동마클럽', '마라톤 대회 신청', '풀코스 접수',
    'KBO 티켓', '인터파크 티켓', '예스24 티켓', '멜론티켓', '티켓링크',
    'NTP 동기화', '클럭 오프셋', '서버 시각 동기화', 'time.kr',
    '광클', '광클 연습', '티켓팅 팁',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

export default function ServerTimePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⏱️ 실시간 서버 시간
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        수강신청·티켓팅을 위한 <strong style={{ color: 'var(--text)' }}>NTP 동기화 KST를 밀리초</strong>로. 카운트다운·알림음 포함.
      </p>

      <ServerTimeClient />
      <FaqJsonLd items={FAQS} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 왜 정확한 서버 시간이 중요한가 */}
        <section>
          <h2 style={sectionTitle}>왜 정확한 서버 시간이 중요한가?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            수강신청·티켓팅에서는 서버 기준 시각보다 <strong style={{ color: 'var(--text)' }}>0.1초만 늦어도 매진</strong>되는 일이 흔합니다. 반대로 너무 빨리 새로고침하면 「아직 시작 안 됨」 페이지로 튕겨 다시 대기열에 밀려납니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            문제는 <strong style={{ color: 'var(--text)' }}>내 PC·스마트폰 시계가 NTP 동기화가 안 돼 있으면 평균 ±1~3초 오차</strong>가 있다는 점. Windows 10·11은 1주일에 한 번만 동기화하고, 일부 노트북은 슬립 후 시계가 어긋납니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            본 도구는 <strong style={{ color: 'var(--accent) ' }}>NTP 알고리즘으로 5회 측정 → 최소 RTT 채택</strong>해 일반적으로 ±50ms 정확도의 한국 표준시(KST)를 제공합니다. 새로고침 타이밍의 기준으로 활용하세요.
          </p>
        </section>

        {/* 2. 한국 주요 티켓팅·신청 사이트 정시 */}
        <section>
          <h2 style={sectionTitle}>한국 주요 티켓팅·신청 사이트 정시</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            대부분 시스템은 KST 기준 정각/30분 단위로 열립니다. 사이트별 권장 새로고침 타이밍.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>사이트</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>주요 시각</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--accent)', fontWeight: 700 }}>권장 새로고침</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { s: '🎓 학교 수강신청',   t: '09:00 정각',                p: '0.5~1초 전' },
                  { s: '🎤 인터파크 티켓',   t: '평일 20:00·주말 14:00',     p: '0.5초 전' },
                  { s: '🎟️ 예스24·티켓링크', t: '평일 20:00·주말 14:00',     p: '0.5초 전' },
                  { s: '🎵 멜론티켓',        t: '평일 20:00',                p: '0.5초 전' },
                  { s: '⚾ KBO·KBL 티켓',    t: '평일 11:00 (홈경기 7일 전)', p: '0.5~1초 전' },
                  { s: '🏃 마라톤 대회',     t: '대회별 다양 (10:00·12:00)', p: '1~2초 전' },
                  { s: '🏛️ 정부24·복권',     t: '평일 09:00',                p: '1초 전' },
                  { s: '🏥 진료 예약',       t: '병원별 (06:00·07:00 多)',   p: '0.5~1초 전' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{r.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 10 }}>
            ※ 권장 새로고침은 일반적인 사이트 응답 기준입니다. 실제로는 사이트별·시기별로 다를 수 있으니 미리 사전 접속해 「대기 페이지」 패턴을 익혀두세요.
          </p>
        </section>

        {/* 3. 마라톤 대회 신청 — 광클 전쟁 + 성공 스토리 */}
        <section>
          <h2 style={sectionTitle}>마라톤 대회 신청, 이제는 콘서트 티켓팅만큼 어렵습니다</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            러닝 인구가 폭발적으로 늘면서 인기 대회는 <strong style={{ color: 'var(--text)' }}>접수 시작 수 분, 빠르면 수십 초 만에 마감</strong>됩니다. 동아마라톤(서울)·JTBC 서울마라톤·춘천마라톤·손기정평화마라톤 같은 메이저 대회는 물론, 지방 대회들도 오픈과 동시에 품절이 뜨는 게 일상이 됐습니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            경쟁이 갈수록 치열해져서 <strong style={{ color: 'var(--text)' }}>접수 페이지가 열리는 정확한 타이밍을 잡는 것</strong>이 중요합니다. 내 PC·폰 시계가 1~2초만 빠르거나 느려도 한 발 늦어 대기열 수천 번째로 밀리거나, 너무 일찍 눌러 아직 오픈 전 페이지가 보일 수도 있습니다. 대회 신청 사이트를 미리 추가해서 태블릿으로 띄워두고, 정확한 타이밍에 새로고침하세요.
          </p>

          {/* 실사용 스토리 */}
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(13,148,136,0.35)', borderLeft: '3px solid #0D9488', borderRadius: 14, padding: '18px 20px' }}>
            <p style={{ fontSize: '12px', color: '#0D9488', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '10px' }}>
              실사용 사례 — 2026 경주 동아마라톤 접수 성공 (2026. 05. 26. 19시)
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '10px' }}>
              지난해 경주 동아마라톤은 10시 정각에 「시작!」 버튼을 눌렀는데도 이미 대기열 수천 번째였고, 결국 <strong style={{ color: 'var(--text)' }}>풀코스는 눈앞에서 마감</strong>됐습니다. 분명 시계는 10시였는데 왜 늦었을까 — 알고 보니 제 노트북 시계가 서버보다 <strong style={{ color: 'var(--text)' }}>약 1.8초 빨랐던</strong> 것이었습니다.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '10px' }}>
              올해 <strong style={{ color: 'var(--text)' }}>2026 경주 동아마라톤</strong>은 전략을 바꿨습니다. 접수 며칠 전부터 이 도구의 외부 사이트 트래킹에 <strong style={{ color: 'var(--text)' }}>동마클럽 서버</strong>를 등록해 두고, 내 시계와의 오차를 매일 확인했습니다. 당일엔 유선 인터넷에 연결하고, 알림음을 1초·정각으로 켠 뒤, 서버 시각 기준 <strong style={{ color: 'var(--text)' }}>약 0.7초 전</strong>에 새로고침을 눌렀습니다.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, fontWeight: 600 }}>
              결과 — 대기열 앞쪽에 진입해 결제까지 2분 만에 완료, 그렇게 어렵던 <strong style={{ color: '#0D9488' }}>풀코스 배번을 확보</strong>했습니다. 1초의 차이가 완주의 출발선이 됐습니다. 🏃
            </p>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 10 }}>
            ※ 개인 경험담이며 결과를 보장하지 않습니다. 대회 정원·접수 정책은 주최 측 공지를 따르세요. 매크로·자동화 접수는 금지됩니다.
          </p>
        </section>

        {/* 4. 작동 원리 */}
        <section>
          <h2 style={sectionTitle}>본 도구의 정확도 — 작동 원리</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { step: '1', title: '5회 측정', content: '클라이언트가 `/api/time`을 5번 호출하며 매 측정마다 RTT(왕복 시간)을 기록합니다.' },
              { step: '2', title: '최소 RTT 채택', content: '네트워크 지터를 최소화하기 위해 5개 측정 중 가장 빠른 응답 1개만 사용합니다 (NTP 표준 방식).' },
              { step: '3', title: '오프셋 계산', content: '서버 시간 + RTT/2(단방향 지연 추정) − 클라이언트 시간 = 오프셋. 이 값을 매 프레임 현재 시간에 더해 표시합니다.' },
              { step: '4', title: '5분마다 재동기화', content: '브라우저 슬립·시계 드리프트를 보정하기 위해 자동 재측정. 「↻ 다시 동기화」 버튼으로 수동 실행도 가능.' },
            ].map((item) => (
              <div key={item.step} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', gap: '14px' }}>
                <span style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '18px', fontWeight: 800, color: 'var(--accent)', minWidth: '24px' }}>{item.step}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>{item.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.content}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 12 }}>
            일반적 정확도는 RTT/2 (보통 10~50ms). 「측정 정확도」 영역에서 확인 가능.
          </p>
        </section>

        {/* 4. PC 시계 동기화 가이드 */}
        <section>
          <h2 style={sectionTitle}>내 PC·스마트폰 시계 동기화하기</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            본 도구로 오차가 ±1초 이상 나면 OS 시계를 강제 동기화하세요. 한국에서는 <strong style={{ color: 'var(--text)' }}>한국표준과학연구원(KRISS) NTP 서버</strong>가 가장 정확합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid #0891B2', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#0891B2', fontWeight: 700, marginBottom: 6 }}>🪟 Windows</p>
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
                설정 → 시간 및 언어 → 날짜 및 시간 → 「지금 동기화」<br/>
                또는 <code style={{ background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>w32tm /resync</code> (관리자 cmd)<br/>
                NTP 서버: <strong style={{ color: 'var(--text)' }}>time.kriss.re.kr</strong>
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid #0EA5E9', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#0EA5E9', fontWeight: 700, marginBottom: 6 }}>🍎 macOS</p>
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
                설정 → 일반 → 날짜 및 시간 → 자동 ON<br/>
                또는 <code style={{ background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>sudo sntp -sS time.apple.com</code><br/>
                기본 동기화: 매 30분
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid #FFD93E', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#FFD93E', fontWeight: 700, marginBottom: 6 }}>📱 Android·iPhone</p>
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
                설정 → 일반 → 날짜 및 시간 → 「자동 설정」 ON<br/>
                통신사 시간 동기화 (KT·SKT·LGU+) — 보통 ±100ms 정확<br/>
                Wi-Fi 환경에서는 NTP 자동 호출
              </p>
            </div>
          </div>
        </section>

        {/* 5. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQS.map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </section>

        {/* 6. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/dday',     icon: '📅', name: 'D-Day 계산기',         desc: '특정 날짜까지 D-day·진행률' },
              { href: '/tools/date/age',      icon: '🎂', name: '나이 계산기',          desc: '만 나이·D-day·인생 통계' },
              { href: '/tools/life/pomodoro', icon: '🍅', name: '뽀모도로 타이머',      desc: '집중·학습·티켓팅 대기 시간 관리' },
              { href: '/tools/date/jet-lag',  icon: '✈️', name: '시차 적응 계산기',     desc: '해외 티켓 오픈 시각 변환' },
              { href: '/tools/date/lunar',    icon: '🌙', name: '양력 음력 변환기',     desc: '음력 명절·티켓 오픈일 확인' },
              { href: '/tools/date/military', icon: '🎖️', name: '군대 전역일 계산기',   desc: '전역일·복무율 D-day' },
            ].map((t) => (
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
        </section>
      </div>
    </div>
  )
}
