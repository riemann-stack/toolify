import Link from 'next/link'
import NetworkTestClient from './NetworkTestClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/dev/network-test',
  title: '인터넷 회선 진단 — 핑·지터·티켓팅 사이트 응답 시간 (브라우저 측정)',
  description:
    '핑·지터·실패율·다운로드 속도 브라우저 측정 + 인터파크·예스24·멜론·KBO 응답 시간으로 티켓팅·수강신청 적합도 종합 판정.',
  keywords: [
    '인터넷 속도 측정', '핑 측정', '지터 측정', '회선 진단', '티켓팅 회선',
    '수강신청 회선', 'speedtest', '네트워크 진단', 'Wi-Fi 진단',
    '광랜 속도', '5G 속도', 'LTE 속도', '핑테스트',
    '인터파크 응답속도', '예스24 응답속도', 'KBO 티켓 회선',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '20px 22px',
}
const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text)',
  listStyle: 'none',
  padding: '4px 0',
}
const faqAnswer: React.CSSProperties = {
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px solid var(--border)',
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
}

const FAQ_LD = [
  { "q":"측정값이 speedtest.net과 다릅니다. 왜인가요?","a":"speedtest.net 등 일반 속도 측정 사이트는 가장 가까운 자체 서버로 측정합니다 (광케이블 거리 최소화). 본 도구는 실제 티켓팅 경로에 가까운 환경(Vercel KR Edge)으로 측정하므로 실용적 결과가 나옵니다. 핑은 자동 비슷, 다운로드 속도는 본 도구가 더 보수적일 수 있습니다." },
  { "q":"ping 명령어와 결과가 다른데요?","a":"ping 명령어는 ICMP 패킷을 사용합니다 (네트워크 계층). 브라우저는 보안상 ICMP 사용 불가 — HTTP 요청으로 측정하므로 일반적으로 ping보다 10~30ms 높게 나옵니다 (TLS·HTTP 처리 오버헤드). 실제 티켓팅은 HTTP로 동작하므로 본 도구가 더 현실적입니다." },
  { "q":"사이트별 응답 시간이 실제 티켓팅 속도인가요?","a":"완전 같진 않습니다. 브라우저 → youtil Edge (서울) → 사이트로 측정 — 중간에 Edge를 한 번 거칩니다. 그러나 youtil Edge가 한국 내부망이라 거의 직접 연결과 비슷한 결과 — 상대적 비교(어떤 사이트가 더 빠른지)는 신뢰할 수 있습니다. 절대값은 실제 티켓팅 시 본인 브라우저에서 측정한 것보다 약간 높게 나옵니다." },
  { "q":"지터가 큰데 핑은 낮습니다. 사용해도 되나요?","a":"티켓팅에는 적합하지 않습니다. 평균 핑 30ms·지터 50ms = 어떤 요청은 90ms+ — 운 나쁘면 매진. 원인 점검: Wi-Fi 2.4GHz → 5GHz 전환 라우터 근처 전자레인지·블루투스 끄기 (2.4GHz 간섭) 같은 Wi-Fi에서 다른 기기 트래픽 ↓ 가능하면 유선 LAN" },
  { "q":"5G인데 핑이 100ms 넘게 나옵니다.","a":"5G도 기지국 거리·시간대·5G 모드로 큰 차이가 납니다. 5G NSA(Non-Standalone) vs 5G SA(Standalone) — SA가 핑 더 낮음 실내 5G는 신호 약함 (특히 지하·고층) 혼잡한 시간대 (저녁 8~11시)는 LTE보다 느려질 수 있음 실내에서 5G 핑이 LTE보다 나쁘면 일시적으로 4G/LTE 우선 모드로 전환 검토." },
  { "q":"본 도구는 데이터를 저장하나요?","a":"저장하지 않습니다. 모든 측정값은 본인 브라우저 메모리에만 존재. 페이지 새로고침 시 사라집니다. 측정 시 youtil Edge 서버(/api/time, /api/speedtest, /api/proxy-time)로 요청이 가지만 IP·결과 모두 로그 X." }
]

export default function NetworkTestPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>개발자</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="dev" />인터넷 회선 진단
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        핑·지터·실패율·다운로드 + 인터파크·예스24·멜론·KBO 응답으로 <strong style={{ color: 'var(--text)' }}>티켓팅 적합도</strong> 판정.
      </p>

      <NetworkTestClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 왜 회선 진단이 중요한가 */}
        <section>
          <h2 style={sectionTitle}>왜 티켓팅·수강신청에 회선이 중요한가?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            티켓팅·수강신청은 「누가 먼저 서버에 도달하느냐」 경쟁입니다.
            정확한 시각을 알아도 <strong style={{ color: 'var(--text)' }}>회선이 100ms 느리면 0.1초가 그대로 손해</strong>입니다.
            인기 콘서트 매진은 보통 0.5~3초 사이 — 핑 100ms 차이가 당락을 가릅니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            중요한 두 지표는 <strong style={{ color: 'var(--text)' }}>핑(요청-응답 시간)</strong>과
            <strong style={{ color: 'var(--text)' }}> 지터(핑의 변동성)</strong>.
            평균 핑이 30ms여도 지터가 50ms면 어떤 요청은 100ms 넘게 걸려 페이지 로딩이 끊깁니다.
          </p>
        </section>

        {/* 2. 측정 지표 의미 */}
        <section>
          <h2 style={sectionTitle}>측정 지표 의미</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>지표</th>
                    <th scope="col" style={headCell}>의미</th>
                    <th scope="col" style={headCell}>티켓팅 권장</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={cell}><strong>핑 (Latency)</strong></td>
                    <td style={cell}>요청 후 응답까지 걸리는 시간</td>
                    <td style={cell}><strong style={{ color: '#059669' }}>&lt; 50ms</strong></td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>지터 (Jitter)</strong></td>
                    <td style={cell}>핑의 변동성 (표준편차)</td>
                    <td style={cell}><strong style={{ color: '#059669' }}>&lt; 10ms</strong></td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>실패율 (Loss)</strong></td>
                    <td style={cell}>요청이 응답을 받지 못하는 비율</td>
                    <td style={cell}><strong style={{ color: '#059669' }}>0%</strong></td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>다운로드 속도</strong></td>
                    <td style={cell}>대용량 데이터 받는 속도 (Mbps)</td>
                    <td style={cell}><strong style={{ color: '#059669' }}>20 Mbps 이상</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            💡 본 도구는 모두 <strong style={{ color: 'var(--text)' }}>브라우저에서 측정 가능한 HTTP 기반</strong> 지표만 사용합니다.
            ICMP ping(터미널 ping 명령)은 브라우저에서 불가능하므로 HTTP 요청-응답 시간으로 대체.
          </p>
        </section>

        {/* 3. 회선 환경별 권장 */}
        <section>
          <h2 style={sectionTitle}>회선 환경별 권장 사항</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { env: '🏠 광랜 (KT·SK·LGU+)', color: '#059669', tips: '유선 LAN 연결 시 최고. Wi-Fi 5GHz로도 충분. 라우터 5m 이내' },
              { env: '📡 5G (휴대폰)', color: '#0891B2', tips: '핑은 광랜급. 시간대·기지국 거리로 변동. 측정해서 적합 시 사용' },
              { env: '📶 LTE (휴대폰)', color: '#D97706', tips: '핑 50~120ms. 지터 큼. 티켓팅 권장 X — 필요 시 광랜·5G로 전환' },
              { env: '🌐 Wi-Fi 2.4GHz', color: '#EA580C', tips: '간섭·혼잡 심함. 핑 ↑·지터 ↑. 5GHz로 전환 또는 유선' },
              { env: '🏢 사내·학교 Wi-Fi', color: '#EA580C', tips: '프록시·방화벽 지연. 가능하면 개인 5G·핫스팟 사용' },
              { env: '☕ 카페·공공 Wi-Fi', color: '#DC2626', tips: '티켓팅 절대 X. 패킷 손실·지연·CAPTCHA 위험' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${b.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: b.color, fontWeight: 700, marginBottom: '6px' }}>{b.env}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{b.tips}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 회선 개선 체크리스트 */}
        <section>
          <h2 style={sectionTitle}>회선 개선 5분 체크리스트</h2>
          <div style={card}>
            <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', color: 'var(--text)', lineHeight: 1.9 }}>
              <li><strong>유선 LAN 연결</strong> — 노트북·데스크탑이라면 가능한 한 유선. Wi-Fi 대비 핑 ↓·지터 ↓·끊김 없음</li>
              <li><strong>Wi-Fi 5GHz 사용</strong> — 라우터 설정에서 2.4GHz·5GHz 분리, 5GHz로 접속</li>
              <li><strong>라우터 5m 이내 + 장애물 X</strong> — 벽 1개 통과마다 신호 30% 감쇠</li>
              <li><strong>다른 기기 Wi-Fi 끄기</strong> — 가족 영상 시청·게임 다운로드 중지</li>
              <li><strong>브라우저 시크릿 모드 + 확장 X</strong> — 광고 차단·번역 확장이 요청 지연</li>
              <li><strong>VPN·프록시 OFF</strong> — 모든 트래픽이 해외 경유하면 핑 200ms+ 증가</li>
              <li><strong>백그라운드 다운로드 중지</strong> — 클라우드 동기화·OS 업데이트 일시정지</li>
              <li><strong>측정 후 결정</strong> — 본 도구로 다시 측정해 효과 확인</li>
            </ol>
          </div>
        </section>

        {/* 5. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />

          <details style={faqDetails}>
            <summary style={faqSummary}>Q1. 측정값이 speedtest.net과 다릅니다. 왜인가요?</summary>
            <div style={faqAnswer}>
              speedtest.net 등 일반 속도 측정 사이트는 <strong style={{ color: 'var(--text)' }}>가장 가까운 자체 서버</strong>로 측정합니다 (광케이블 거리 최소화).
              본 도구는 <strong style={{ color: 'var(--text)' }}>실제 티켓팅 경로에 가까운 환경(Vercel KR Edge)</strong>으로 측정하므로 실용적 결과가 나옵니다.
              핑은 자동 비슷, 다운로드 속도는 본 도구가 더 보수적일 수 있습니다.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q2. ping 명령어와 결과가 다른데요?</summary>
            <div style={faqAnswer}>
              ping 명령어는 <strong style={{ color: 'var(--text)' }}>ICMP 패킷</strong>을 사용합니다 (네트워크 계층).
              브라우저는 보안상 ICMP 사용 불가 — HTTP 요청으로 측정하므로 일반적으로 ping보다 10~30ms 높게 나옵니다 (TLS·HTTP 처리 오버헤드).
              <br /><br />
              실제 티켓팅은 HTTP로 동작하므로 본 도구가 <strong style={{ color: 'var(--text)' }}>더 현실적</strong>입니다.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q3. 사이트별 응답 시간이 실제 티켓팅 속도인가요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: '#EA580C' }}>완전 같진 않습니다.</strong>
              브라우저 → youtil Edge (서울) → 사이트로 측정 — 중간에 Edge를 한 번 거칩니다.
              <br /><br />
              그러나 youtil Edge가 한국 내부망이라 거의 직접 연결과 비슷한 결과 — <strong>상대적 비교</strong>(어떤 사이트가 더 빠른지)는 신뢰할 수 있습니다.
              <br /><br />
              <strong style={{ color: 'var(--text)' }}>절대값</strong>은 실제 티켓팅 시 본인 브라우저에서 측정한 것보다 약간 높게 나옵니다.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q4. 지터가 큰데 핑은 낮습니다. 사용해도 되나요?</summary>
            <div style={faqAnswer}>
              티켓팅에는 <strong style={{ color: 'var(--text)' }}>적합하지 않습니다.</strong>
              평균 핑 30ms·지터 50ms = 어떤 요청은 90ms+ — 운 나쁘면 매진.
              <br /><br />
              원인 점검:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>Wi-Fi 2.4GHz → 5GHz 전환</li>
                <li>라우터 근처 전자레인지·블루투스 끄기 (2.4GHz 간섭)</li>
                <li>같은 Wi-Fi에서 다른 기기 트래픽 ↓</li>
                <li>가능하면 유선 LAN</li>
              </ul>
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q5. 5G인데 핑이 100ms 넘게 나옵니다.</summary>
            <div style={faqAnswer}>
              5G도 <strong style={{ color: 'var(--text)' }}>기지국 거리·시간대·5G 모드</strong>로 큰 차이가 납니다.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>5G NSA(Non-Standalone) vs 5G SA(Standalone) — SA가 핑 더 낮음</li>
                <li>실내 5G는 신호 약함 (특히 지하·고층)</li>
                <li>혼잡한 시간대 (저녁 8~11시)는 LTE보다 느려질 수 있음</li>
              </ul>
              실내에서 5G 핑이 LTE보다 나쁘면 일시적으로 <strong>4G/LTE 우선 모드</strong>로 전환 검토.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q6. 본 도구는 데이터를 저장하나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: '#059669' }}>저장하지 않습니다.</strong>
              모든 측정값은 본인 브라우저 메모리에만 존재. 페이지 새로고침 시 사라집니다.
              <br /><br />
              측정 시 youtil Edge 서버(/api/time, /api/speedtest, /api/proxy-time)로 요청이 가지만 IP·결과 모두 로그 X.
            </div>
          </details>
        </section>

        {/* 6. 한계 명시 */}
        <section>
          <h2 style={sectionTitle}>⚠️ 본 도구의 한계</h2>
          <div style={{
            background: 'rgba(217, 119, 6, 0.06)',
            border: '1px solid rgba(217, 119, 6, 0.25)',
            borderRadius: '12px',
            padding: '18px 22px',
            fontSize: '14px',
            color: 'var(--text)',
            lineHeight: 1.8,
          }}>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li>브라우저 한계로 <strong>ICMP ping·traceroute X</strong> — HTTP 기반 측정으로 대체</li>
              <li>사이트 응답 시간은 youtil Edge를 경유 — 절대값보다 <strong>상대 비교</strong>에 유용</li>
              <li>측정은 단일 시점 — 시간대별로 결과가 다를 수 있음 (혼잡 시간 측정 권장)</li>
              <li>다운로드 속도는 단일 연결 — 실제는 멀티 커넥션으로 더 빠를 수 있음 (참고용)</li>
              <li>모바일 데이터 환경에서 큰 다운로드는 요금 발생 가능 — 1MB 옵션 권장</li>
            </ul>
          </div>
        </section>

        {/* 7. 함께 쓰면 좋은 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/date/server-time" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>⏱️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>실시간 서버 시간</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>티켓팅·수강신청 정시</div>
            </Link>
            <Link href="/tools/dev/http-status" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🌐</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>HTTP 상태 코드 검색기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>429·503 의미 확인</div>
            </Link>
            <Link href="/tools/dev/curl" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🌀</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>cURL 변환기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>API 요청 디버깅</div>
            </Link>
            <Link href="/tools/dev/url-encode" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔗</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>URL 인코더/디코더</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>UTM·추적 파라미터</div>
            </Link>
            <Link href="/tools/life/pomodoro" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍅</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>뽀모도로 타이머</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>집중 모드</div>
            </Link>
            <Link href="/tools/health/caffeine" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>☕</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>카페인 잔존량 트래커</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>티켓팅 직전 컨디션</div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
