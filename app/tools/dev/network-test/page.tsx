import Link from 'next/link'
import NetworkTestClient from './NetworkTestClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'

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

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
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
  whiteSpace: 'nowrap',
}

const FAQ_LD = [
  {
    q: '측정값이 speedtest.net 같은 속도 측정 사이트와 다릅니다. 왜인가요?',
    a: '재는 방식이 다릅니다. 일반 속도 측정 사이트는 <strong>가까운 측정 서버</strong>와 <strong>여러 연결을 동시에</strong> 열어 10초 안팎 동안 최대한 많이 받아 회선의 최고 속도를 잽니다. 본 도구는 youtil Edge 서버에서 <strong>연결 1개로 1MB 또는 5MB</strong>를 한 번 받습니다. 파일이 작으면 TCP가 속도를 끌어올리기 전에 전송이 끝나 다운로드 속도는 대체로 더 낮게 나옵니다. 대신 티켓팅에서 중요한 &lsquo;웹 요청 하나가 오가는 시간&rsquo;(핑·지터)은 실제 웹사이트 이용과 같은 HTTP 방식으로 잽니다.',
  },
  {
    q: '터미널 ping 명령과 결과가 다른데요?',
    a: 'ping은 ICMP 패킷으로 네트워크 왕복만 재지만, 브라우저는 보안상 ICMP를 보낼 수 없어 본 도구는 <strong>HTTP 요청-응답 시간</strong>을 잽니다. 여기에는 서버가 요청을 받아 응답을 만드는 처리 시간이 더해지므로 보통 ping보다 조금 높게 나옵니다. 첫 요청은 DNS 조회·TLS 연결 수립이 섞여 버리고, 이후 20회는 이미 열린 연결로 보냅니다. 회선 자체의 성능은 튀는 값의 영향을 받지 않는 <strong>최소 핑</strong>으로 판정합니다.',
  },
  {
    q: '사이트별 응답 시간이 곧 그 사이트에서의 티켓팅 속도인가요?',
    a: '아닙니다. 브라우저는 다른 사이트에 직접 시간을 재는 요청을 보낼 수 없어(CORS 제한), 표시값은 <strong>「내 브라우저 → youtil Edge → 사이트 → Edge → 내 브라우저」</strong> 전체 왕복입니다. Edge에서 사이트로 가는 구간은 새 연결을 맺으며 DNS·TLS 시간까지 포함될 수 있어, 이미 접속해 있는 상태로 그 사이트를 이용할 때보다 크게 나옵니다. HTTP 상태 옆에 표시되는 &lsquo;Edge→사이트&rsquo; 값과 함께 <strong>사이트끼리 상대 비교</strong>하는 용도로 보세요. HEAD 요청을 막는 사이트는 403·405 같은 상태 코드가 보일 수 있는데, 응답은 받았으므로 시간 값은 유효합니다.',
  },
  {
    q: '지터가 큰데 핑은 낮습니다. 티켓팅에 써도 되나요?',
    a: '권하지 않습니다. 본 도구의 지터는 <strong>연속한 두 측정값 차이의 평균</strong>이라, 최소 핑 20ms에 지터 40ms면 요청 하나하나가 수십 ms씩 들쭉날쭉하다는 뜻입니다. 오픈 순간의 요청이 운 나쁘게 느린 쪽에 걸릴 수 있습니다. 지터는 대부분 Wi-Fi 구간에서 생기므로 ① 유선 LAN 연결, ② 2.4GHz 대신 5GHz 접속, ③ 공유기와 가까운 자리로 이동, ④ 같은 공유기에서 영상 스트리밍·대용량 다운로드 중지 순서로 점검한 뒤 다시 측정하세요.',
  },
  {
    q: '5G인데 핑이 100ms 넘게 나옵니다.',
    a: '5G는 기지국과의 거리, 실내·지하 여부, 같은 기지국 사용자 수에 따라 지연이 크게 달라집니다. 실내에서는 5G 신호가 약해 LTE로 오가며 전환되는 과정에서 지연이 튀기도 합니다. 같은 자리에서 시간대를 바꿔 두세 번 측정해 보고, 계속 높으면 휴대폰 설정에서 LTE 우선으로 바꿔 비교하거나 유선·Wi-Fi 5GHz 환경을 쓰세요. 참고로 정부 평가의 5G 평균 다운로드 속도(973.55Mbps)는 전국 평가 지점에서 정해진 측정 절차로 잰 평균이라 개인 기기의 순간 측정값과 직접 비교하기 어렵습니다.',
  },
  {
    q: '다운로드 속도가 가입한 요금제 속도(예: 500Mbps)보다 훨씬 낮아요.',
    a: '대부분 측정 방식 때문입니다. ① 1MB는 너무 작아 연결이 최고 속도에 오르기 전에 끝나므로 5MB 옵션이 더 정확합니다. ② 연결 1개만 쓰므로 여러 연결을 동시에 쓰는 속도 측정 사이트보다 낮습니다. ③ Wi-Fi 구간(공유기 규격·거리·벽)이 병목인 경우가 많습니다 — 같은 기기를 유선으로 연결해 다시 재 보면 원인을 가를 수 있습니다. 티켓팅에는 다운로드 속도보다 핑·지터가 훨씬 중요하니, 수십 Mbps 이상이면 속도는 크게 신경 쓰지 않아도 됩니다.',
  },
]

/* 판정 기준 — NetworkTestClient의 rateLatency·rateJitter·rateSpeed 경계값과 같게 유지 */
const GRADE_ROWS = [
  ['매우 좋음', '20ms 미만', '5ms 미만 (매우 안정)', '100Mbps 이상'],
  ['좋음', '20~50ms', '5~15ms (안정)', '50~100Mbps'],
  ['보통', '50~100ms', '15~30ms (약간 불안정)', '20~50Mbps'],
  ['느림', '100~200ms', '—', '5~20Mbps'],
  ['매우 느림', '200ms 이상', '30ms 이상 (매우 불안정)', '5Mbps 미만'],
]

/* 종합 점수 — NetworkTestClient의 overall 계산과 같은 공식 (핑 40 · 지터 30 · 다운로드 30, 다운로드 실패 시 50점 처리) */
function overallScore(minMs: number, jitterMs: number, mbps: number | null) {
  const lat = Math.max(0, 100 - minMs)
  const jit = Math.max(0, 100 - jitterMs * 4)
  const dl = mbps === null ? 50 : Math.min(100, (mbps / 100) * 100)
  return { lat, jit, dl, total: Math.round(lat * 0.4 + jit * 0.3 + dl * 0.3) }
}
const SCORE_EXAMPLES = [
  { label: '유선 광랜', min: 12, jitter: 3, mbps: 85 as number | null },
  { label: '다운로드 측정 실패', min: 15, jitter: 4, mbps: null },
  { label: '혼잡한 2.4GHz Wi-Fi', min: 38, jitter: 22, mbps: 30 },
  { label: '약한 모바일 신호', min: 65, jitter: 35, mbps: 12 },
].map((e) => ({ ...e, ...overallScore(e.min, e.jitter, e.mbps) }))

export default function NetworkTestPage() {
  return (
    <ToolPage width={880} slug="/tools/dev/network-test">
      <h1 className="tp-h1">
        <ToolIconBadge catId="dev" />인터넷 회선 진단
      </h1>
      <p className="tp-lead">
        핑·지터·실패율·다운로드 + 인터파크·예스24·멜론·KBO 응답으로 <strong style={{ color: 'var(--text)' }}>티켓팅 적합도</strong> 판정.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="LTE·5G 평균: 과기정통부·NIA 2025 통신서비스 품질평가 (2025.12.30 발표)"
        sources={[
          { label: '과기정통부 보도자료(정책브리핑)', href: 'https://www.korea.kr/briefing/pressReleaseView.do?newsId=156737428' },
          { label: 'KDI 경제정보센터 게시본', href: 'https://eiec.kdi.re.kr/policy/materialView.do?num=275568' },
          { label: 'RFC 3550 (지터 정의)', href: 'https://www.rfc-editor.org/rfc/rfc3550' },
        ]}
      />

      <NetworkTestClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 왜 회선 진단이 중요한가 */}
        <section>
          <h2 className="g-h2">왜 티켓팅·수강신청에 회선이 중요한가?</h2>
          <p className="g-p">
            티켓팅·수강신청은 오픈 시각에 몰린 요청 가운데 <strong>누구의 요청이 먼저 서버에 도착하느냐</strong>의 경쟁입니다.
            시계를 정확히 맞춰도 요청이 서버까지 가는 데 100ms가 더 걸린다면, 그만큼 늦게 줄을 서는 셈입니다.
            좌석 선택·결제처럼 여러 번 요청이 오가는 과정에서는 이 차이가 단계마다 쌓입니다.
          </p>
          <p className="g-p">
            그래서 중요한 지표는 다운로드 속도보다 <strong>핑(요청-응답 시간)</strong>과 <strong>지터(핑의 흔들림)</strong>입니다.
            평균 핑이 낮아도 지터가 크면 결정적인 순간의 요청 하나가 느린 쪽에 걸릴 수 있습니다.
          </p>
        </section>

        {/* 2. 측정 방식 */}
        <section>
          <h2 className="g-h2">이 도구가 실제로 재는 것</h2>
          <p className="g-p">
            측정은 3단계로 15~30초 걸립니다. 브라우저에서 할 수 있는 방법만 쓰므로, 숫자가 무엇을 뜻하는지 알고 보면 해석이 정확해집니다.
          </p>
          <ol className="g-list">
            <li><strong>핑·지터·실패율</strong> — youtil Edge 서버에 작은 HTTP 요청을 보내 응답까지의 시간을 잽니다. 첫 요청은 DNS·TLS 연결 수립이 섞이므로 버리고, 이어서 20회를 차례로 보냅니다. 5초 안에 응답이 없으면 실패로 셉니다.</li>
            <li><strong>사이트 응답</strong> — 인터파크·예스24·멜론·티켓링크·KBO·Google 6곳에 Edge 서버가 대신 HEAD 요청을 보내고, 브라우저는 그 전체 왕복 시간을 잽니다(8초 제한).</li>
            <li><strong>다운로드</strong> — 압축되지 않는 무작위 바이트 1MB(1,000,000바이트) 또는 5MB를 받아, 응답 헤더를 받은 뒤부터 본문을 다 받을 때까지의 시간으로 속도(Mbps = 바이트 × 8 ÷ 초 ÷ 10<sup>6</sup>)를 계산합니다.</li>
          </ol>
          <p className="g-p">
            20개 샘플에서 최소·중앙값·평균·P95(95번째 백분위)·최대를 구하고, <strong>지터는 측정 순서대로 이웃한 두 값의 차이(절댓값)를 평균</strong>한 값입니다.
            예를 들어 샘플이 20, 24, 21, 35ms라면 차이는 4, 3, 14ms이고 지터는 (4+3+14)÷3 = 7.0ms입니다.
            인터넷 음성·영상 전송 규격인 RFC 3550은 같은 차이를 1/16씩 누적해 부드럽게 만든 추정식을 쓰는데, 본 도구는 20개로 끝나는 짧은 측정이라 단순 평균을 씁니다.
            튀는 값 하나가 표준편차처럼 전체를 크게 부풀리지 않는 방식입니다.
          </p>
        </section>

        {/* 3. 판정 기준 */}
        <section>
          <h2 className="g-h2">판정 기준 — 핑·지터·다운로드 등급표</h2>
          <p className="g-p">
            결과 카드의 색·등급은 아래 경계값으로 매깁니다. 핑 등급은 평균이 아니라 <strong>최소 핑</strong>(회선이 낼 수 있는 가장 빠른 왕복)을 기준으로 합니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                <thead>
                  <tr>
                    {['등급', '최소 핑', '지터', '다운로드'].map((h) => <th scope="col" key={h} style={headCell}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {GRADE_ROWS.map((r) => (
                    <tr key={r[0]}>
                      <th scope="row" style={{ ...cell, textAlign: 'left', fontWeight: 700 }}>{r[0]}</th>
                      <td style={cell}>{r[1]}</td>
                      <td style={cell}>{r[2]}</td>
                      <td style={cell}>{r[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="g-note">
            지터는 4단계, 핑·다운로드는 5단계입니다. 추천 문구는 최소 핑 100ms 초과, 지터 15ms 초과, 실패율 5% 초과, 다운로드 20Mbps 미만일 때 각각 나타납니다.
          </p>
        </section>

        {/* 4. 종합 점수 */}
        <section>
          <h2 className="g-h2">종합 점수는 이렇게 계산해요</h2>
          <p className="g-p">
            종합 점수(100점 만점)는 <strong>핑 40% + 지터 30% + 다운로드 30%</strong>의 가중 평균입니다.
            핑 점수 = 100 − 최소 핑(ms), 지터 점수 = 100 − 지터 × 4, 다운로드 점수 = Mbps(100 이상은 100)이고, 각 점수는 0 아래로 내려가지 않습니다.
            다운로드 측정이 실패하면 다운로드 점수를 50점으로 둡니다. 아래는 가상의 측정값을 같은 공식에 넣어 계산한 예시입니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                <thead>
                  <tr>
                    {['예시 상황', '최소 핑', '지터', '다운로드', '핑 점수 ×0.4', '지터 점수 ×0.3', '다운로드 점수 ×0.3', '종합'].map((h) => <th scope="col" key={h} style={headCell}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {SCORE_EXAMPLES.map((e) => (
                    <tr key={e.label}>
                      <th scope="row" style={{ ...cell, textAlign: 'left', fontWeight: 600 }}>{e.label}</th>
                      <td style={cell}>{e.min}ms</td>
                      <td style={cell}>{e.jitter}ms</td>
                      <td style={cell}>{e.mbps === null ? '실패' : `${e.mbps}Mbps`}</td>
                      <td style={cell}>{e.lat} → {(e.lat * 0.4).toFixed(1)}</td>
                      <td style={cell}>{e.jit} → {(e.jit * 0.3).toFixed(1)}</td>
                      <td style={cell}>{e.dl} → {(e.dl * 0.3).toFixed(1)}</td>
                      <td style={{ ...cell, fontWeight: 700, color: 'var(--accent-ink)' }}>{e.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            지터는 ms당 4점씩 깎이므로 <strong>지터 25ms부터 지터 점수가 0점</strong>이 됩니다. 핑이 괜찮아도 Wi-Fi가 불안정하면 종합 점수가 크게 떨어지는 이유입니다.
            반대로 다운로드는 100Mbps에서 만점이라, 기가 인터넷이라도 점수가 더 오르지 않습니다 — 티켓팅에서 속도보다 지연·안정성을 중시하도록 만든 배점입니다.
          </p>
        </section>

        {/* 5. 정부 평가 기준값 */}
        <section>
          <h2 className="g-h2">참고 기준값 — 2025년 통신서비스 품질평가</h2>
          <p className="g-p">
            다운로드 결과 아래의 LTE·5G 평균은 과학기술정보통신부·한국지능정보사회진흥원(NIA)이 2025년 12월 30일 발표한 품질평가 결과입니다.
            전국 평가 지점에서 정해진 측정 절차로 잰 평균이라, 브라우저 연결 하나로 잰 본 도구의 값보다 높게 나오는 것이 정상입니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                <thead>
                  <tr>
                    {['구분', '평균 다운로드', '비고'].map((h) => <th scope="col" key={h} style={headCell}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['5G (3사 평균)', '973.55Mbps', '전년 1,025.52Mbps에서 하락. KT 1,030.25 · SKT 1,024.50 · LGU+ 865.88Mbps'],
                    ['LTE (3사 평균)', '96.18Mbps', '5G·LTE 동시 측정 방식(실제 이용 환경 반영). 본 도구가 표시하는 값'],
                    ['LTE (독립 측정)', '172.60Mbps', '전년과 같은 방식으로 LTE만 따로 잰 값(전년 178.05Mbps)'],
                  ].map((r) => (
                    <tr key={r[0]}>
                      <th scope="row" style={{ ...cell, textAlign: 'left', fontWeight: 600 }}>{r[0]}</th>
                      <td style={{ ...cell, fontWeight: 700 }}>{r[1]}</td>
                      <td style={{ ...cell, color: 'var(--muted)', fontSize: 12 }}>{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 6. 회선 환경별 권장 */}
        <section>
          <h2 className="g-h2">회선 환경별 권장 사항</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { env: '광랜 유선 LAN', color: 'var(--success)', tips: '지연·흔들림이 가장 적은 환경. 노트북이라도 가능하면 LAN 케이블로 연결' },
              { env: '광랜 + Wi-Fi 5GHz', color: 'var(--success)', tips: '공유기와 같은 방·가까운 거리라면 충분. 벽·층을 사이에 두면 신호가 급격히 약해짐' },
              { env: '5G (휴대폰)', color: 'var(--accent-ink)', tips: 'LTE보다 지연이 낮은 편이지만 기지국 거리·혼잡도에 따라 변동. 오픈 전 같은 자리에서 측정' },
              { env: 'LTE (휴대폰)', color: 'var(--warning)', tips: '5G·광랜보다 지연과 흔들림이 큰 편. 가능하면 유선·Wi-Fi 5GHz로 전환' },
              { env: 'Wi-Fi 2.4GHz', color: 'var(--warning)', tips: '벽 투과는 좋지만 전자레인지·블루투스·이웃 공유기와 간섭이 잦음. 5GHz로 전환 또는 유선' },
              { env: '공용·카페 Wi-Fi', color: 'var(--danger)', tips: '여러 사람이 대역폭을 나눠 써 지연·손실이 크고, 인증 페이지 세션이 끊길 수 있어 비권장' },
            ].map((b) => (
              <div key={b.env} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${b.color} 30%, transparent)`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: b.color, fontWeight: 700, marginBottom: '6px' }}>{b.env}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{b.tips}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 회선 개선 체크리스트 */}
        <section>
          <h2 className="g-h2">회선 개선 5분 체크리스트</h2>
          <ol className="g-list">
            <li><strong>유선 LAN 연결</strong> — Wi-Fi 구간이 사라지면 지터와 실패율이 가장 크게 줄어듭니다.</li>
            <li><strong>Wi-Fi 5GHz 접속</strong> — 공유기가 2.4GHz·5GHz를 같은 이름으로 내보내면 관리 화면에서 이름을 나눠 5GHz에 직접 붙으세요.</li>
            <li><strong>공유기 가까이</strong> — 5GHz는 벽·문·층을 지날 때 신호가 크게 약해지므로 같은 공간에서 쓰는 것이 좋습니다.</li>
            <li><strong>같은 공유기의 다른 사용 줄이기</strong> — 영상 스트리밍·게임 업데이트·클라우드 동기화가 대역폭을 나눠 가집니다.</li>
            <li><strong>VPN·프록시 끄기</strong> — 해외 서버를 거치면 국내 사이트까지 왕복 거리가 늘어 지연이 수십~수백 ms 더해집니다.</li>
            <li><strong>브라우저 정리</strong> — 불필요한 탭과 확장 프로그램을 끄고, 시크릿 창에서 한 번 더 측정해 비교합니다.</li>
            <li><strong>바꾼 뒤 다시 측정</strong> — 한 가지씩 바꾸고 재측정해야 무엇이 효과가 있었는지 알 수 있습니다.</li>
          </ol>
        </section>

        {/* 8. 한계 */}
        <section>
          <h2 className="g-h2">본 도구의 한계</h2>
          <Callout tone="warn" title="측정값은 참고용입니다">
            <ul>
              <li>브라우저에서는 ICMP ping·traceroute를 쓸 수 없어 HTTP 요청 시간으로 대신 잽니다.</li>
              <li>사이트 응답 시간은 youtil Edge를 경유한 값이라 절대값보다 사이트 간 상대 비교에 유용합니다.</li>
              <li>한 번의 측정은 그 순간의 상태입니다. 실제로 쓸 시간대에 같은 자리에서 다시 재 보세요.</li>
              <li>다운로드는 연결 1개로 재는 참고치입니다. 모바일 데이터에서는 1MB 옵션을 권장합니다.</li>
              <li>측정 API는 시각·무작위 바이트·대상 사이트 응답 시간만 돌려주며, 측정 결과는 서버에 저장하지 않고 새로고침하면 사라집니다.</li>
            </ul>
          </Callout>
        </section>

        {/* 9. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 10. 함께 쓰면 좋은 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
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
    </ToolPage>
  )
}
