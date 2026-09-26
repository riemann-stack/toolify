/* 상황별 가이드 — 티켓팅·수강신청. 표는 서버 시간 도구의 동기화 방식(5회 측정 → RTT가 가장 작은 측정 채택,
   오프셋 = 서버 시각 + RTT/2 − 수신 시각, 오차 한계 ±RTT/2)을 예시 측정값에 그대로 적용한다 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { GuideSources, type CollectionGuide } from './shared'

/** 서버 시간 도구의 추정식: 응답이 서버를 떠난 시점을 왕복시간(RTT)의 절반 전으로 본다 → 편도 지연이 한쪽으로 몰리면 최대 RTT/2만큼 틀릴 수 있다 */
const halfRtt = (rttMs: number) => Math.round(rttMs / 2)
/** 설명용 예시 — 지터가 있는 와이파이에서 연달아 5번 잰 왕복시간(ms). 도구도 동기화할 때 5번 잰다 */
const SAMPLE_RTTS = [62, 38, 145, 41, 97]

function Body() {
  // 도구와 같은 선택: RTT 오름차순 정렬 뒤 첫 측정
  const best = [...SAMPLE_RTTS].sort((a, b) => a - b)[0]
  const worst = Math.max(...SAMPLE_RTTS)
  return (
    <>
      <h2>왜 회선 → 시각 → 카운트다운 순서인가</h2>
      <p>
        오픈 시각에 정확히 버튼을 누르려면 두 가지를 알아야 합니다. 예매처 서버의 시계가 내 시계와 얼마나 다른지, 그리고 내 요청이 서버까지 가는 데 얼마나 걸리는지입니다. 두 번째 값을 모르면
        첫 번째 값도 정확히 잴 수 없습니다. <Link href="/tools/date/server-time">서버 시간 도구</Link>는 요청을 보낸 뒤 응답이 돌아오기까지의 왕복시간(RTT)의 절반을 편도 지연으로 보고 서버 시각을
        보정하는데, 이 가정은 회선이 안정적일 때만 맞습니다. 그래서 먼저 <Link href="/tools/dev/network-test">네트워크 테스트</Link>로 핑과 지터(측정할 때마다 지연이 흔들리는 폭)를 확인하고, 그다음에
        시각을 맞추고, 마지막에 카운트다운을 겁니다.
      </p>

      <h2>단계별로 확인할 숫자</h2>
      <DataFigure n={1} title={`${SAMPLE_RTTS.length}번 잰 왕복시간과 시각 추정 오차 한계`} unit="단위: ms · 예시 측정값" source={<>계산: 서버 시간 도구와 같은 방식 — {SAMPLE_RTTS.length}회 측정 뒤 RTT가 가장 작은 측정으로 보정, 오차 한계 = ±RTT ÷ 2</>}>
        <table>
          <thead>
            <tr><th scope="col">측정</th><th scope="col" className="r">RTT</th><th scope="col" className="r">이 측정으로 보정할 때 오차 한계</th></tr>
          </thead>
          <tbody>
            {SAMPLE_RTTS.map((rtt, i) => (
              <tr key={i}>
                <td>{i + 1}회{rtt === best ? ' — 채택' : ''}</td>
                <td className="r">{rtt}</td>
                <td className="r">±{halfRtt(rtt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        같은 회선에서 잰 {SAMPLE_RTTS.length}번 가운데 가장 느린 측정({worst}ms)으로 보정했다면 서버 시각이 최대 ±{halfRtt(worst)}ms까지 틀릴 수 있지만, 가장 빠른 측정({best}ms)을 쓰면
        {' '}±{halfRtt(best)}ms로 줄어듭니다. 서버 시간 도구가 여러 번 재서 가장 작은 RTT를 쓰는 이유입니다. 가장 빨리 돌아온 측정이 대기열·재전송의 영향을 가장 적게 받았기 때문입니다.
        측정마다 RTT가 이만큼 흔들린다는 것(지터)은 같은 순간에 눌러도 요청 도착 시각이 매번 달라진다는 뜻이기도 하니, 오픈 직전에는 다운로드나 영상 스트리밍처럼 회선을 차지하는 작업을 멈추는 편이 낫습니다.
      </p>
      <p>
        외부 사이트의 시각은 응답 헤더(Date)로 읽는데, 이 값은 초 단위까지만 적혀 있습니다. 그래서 다른 사이트의 서버 시각은 0.1초 단위로 단정할 수 없고, 초가 바뀌는 순간을 여러 번 관찰해
        범위를 좁히는 방식으로 봐야 합니다. 해외 예매처라면 <Link href="/tools/date/timezone">세계 시간</Link>에서 현지 오픈 시각이 서머타임 적용 기간인지도 함께 확인하세요.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>PC 시계를 믿기.</strong> 운영체제의 인터넷 시간 동기화는 주기가 길어 며칠 사이에 수 초가 어긋날 수 있습니다. 시계를 믿지 말고 오픈 5~10분 전에 서버 시간을 다시 재세요.</li>
        <li><strong>한 번 잰 값으로 끝내기.</strong> 회선 상태는 시간대마다 달라집니다. 저녁 시간대 오픈이라면 전날 같은 시각에 미리 한 번 재 두면 그날의 편차를 가늠할 수 있습니다.</li>
        <li><strong>새로고침을 연타하기.</strong> 대기열 방식 예매처는 접속 순서로 번호를 매기는 경우가 많아, 이미 받은 순번을 새로고침으로 잃을 수 있습니다. 예매처의 대기열 안내를 먼저 읽으세요.</li>
        <li><strong>인증·결제를 오픈 뒤에 하기.</strong> 본인 인증, 결제 수단 등록, 수강신청 장바구니처럼 미리 할 수 있는 단계는 전날 끝내 두어야 오픈 순간의 몇 초를 아낄 수 있습니다.</li>
      </ul>
      <p>
        <Link href="/tools/date/dday">D-day 계산기</Link>는 오픈 며칠 전부터 준비 일정을 거꾸로 짤 때 씁니다. 원서 접수·수강신청처럼 마감이 있는 일은 오픈 시각보다 마감 시각이 더 중요할 때도 있으니
        두 날짜를 함께 등록해 두세요.
      </p>

      <Callout tone="note" title="먼저 확인할 것">
        예매처와 학교는 대기열 방식, 동시 접속 제한, 자동 입력 프로그램 금지 같은 자체 규정을 둡니다. 이 도구들은 시각과 회선을 확인하는 용도이며, 규정과 다른 방법을 안내하지 않습니다.
        규정은 각 예매처 공지와 학교 학사 안내를 기준으로 삼으세요.
      </Callout>

      <GuideSources
        items={[
          { label: 'IETF RFC 9110 — HTTP Semantics, Date 헤더(초 단위 IMF-fixdate)', href: 'https://www.rfc-editor.org/rfc/rfc9110#field.date' },
          { label: 'IETF RFC 5905 — Network Time Protocol v4 (왕복 지연 보정)', href: 'https://www.rfc-editor.org/rfc/rfc5905' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '티켓팅, 1초를 가르는 숫자 읽기', Body }
export default guide
