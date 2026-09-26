import Link from 'next/link'
import JetLagClient from './JetLagClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'
import Callout from '@/components/Callout'

export const metadata = buildMetadata({
  path: '/tools/date/jet-lag',
  title: '시차 적응 계산기 — 여행 전·기내·도착 후 수면 타이밍',
  description: '여행 전·중·후 시차 적응 일정과 수면 타이밍 자동 가이드. 기내 수면 구간부터 멜라토닌·햇빛·카페인 컷오프 시각, 단기 출장 한국 시간 유지 전략까지.',
  keywords: ['시차적응계산기', '시차극복방법', '해외여행시차', '기내수면타이밍', '시차적응기간', '제트래그', '유럽시차적응', '미국시차적응'],
})

const FAQ_LD = [
              {
                q: '시차 적응에 며칠이나 걸리나요?',
                a: '생체시계는 하루에 <strong>서쪽(늦춤) 약 1.5시간, 동쪽(앞당김) 약 1시간</strong>씩 이동합니다(CDC 기준). 즉 위상이동 크기 ÷ 이 속도가 대략적인 적응 일수입니다. 서울→파리(약 8시간 서쪽)는 6일 안팎, 서울→뉴욕(약 14시간 서쪽)은 10일 안팎이 걸립니다. 개인차가 크며 젊을수록, 규칙적인 수면 습관을 가진 사람일수록 빠르게 적응합니다.',
              },
              {
                q: '서울→뉴욕은 동쪽으로 비행하는데 왜 「서쪽 이동」으로 분류되나요?',
                a: '시차 적응의 「동쪽/서쪽」은 비행 경로가 아니라 <strong>생체시계를 어느 쪽으로 옮기느냐</strong>입니다. 앞당김(동쪽)은 어렵고, 늦춤(서쪽)은 인간 내재주기(24.2시간)가 약간 길어 상대적으로 쉽습니다.<br/><br/>생체시계 오정렬의 최대치는 12시간이라 <strong>시계 차이가 12시간을 넘으면 더 짧은 반대 방향으로 적응</strong>합니다. 서울→뉴욕은 시계상 14시간 뒤지지만, 동시에 10시간 앞당김이기도 합니다. 다만 앞당김이 8시간을 넘는 대이동은 신체가 오히려 늦춤(지연)으로 재동조하는 경향이 있어 <strong>「서쪽」으로 처리</strong>합니다(Eastman & Burgess, 2009). 반면 서울→호놀룰루(시계 19시간 뒤)는 앞당김이 5시간뿐이라 <strong>「동쪽」</strong>이 더 짧습니다 — 계산기가 이를 자동 판별합니다.',
              },
              {
                q: '동쪽과 서쪽 이동 중 어느 쪽이 더 힘드나요?',
                a: '시간대 기준 <strong>동쪽 이동(시계 앞당김)</strong>이 더 어렵습니다. 인간의 생체시계는 자연적으로 약 24.2시간 주기로 작동해 「늘리는 것(서쪽)」은 쉽지만 「줄이는 것(동쪽)」은 힘듭니다. 같은 시차라도 동쪽은 서쪽보다 약 <strong>1.5배</strong> 더 긴 적응 기간이 필요합니다.<br/><br/>예) 서울→호놀룰루는 생체시계를 5시간 앞당겨야 해 약 5일, 반대로 호놀룰루→서울은 5시간 늦춤이라 약 4일 — 같은 5시간이라도 동쪽형이 하루 더 걸립니다(서울↔두바이도 가는 길 늦춤 4일, 귀국 앞당김 5일). 1~2시간처럼 작은 시차는 두 방향 모두 1~2일이라 차이가 거의 드러나지 않습니다.',
              },
              {
                q: '비행기에서 언제 자는 게 좋나요?',
                a: '<strong>도착지의 밤 시간(22:00~06:00)에 해당하는 구간</strong>에 수면하는 것이 이상적입니다. 본 계산기는 이륙 시각·비행 시간·시차를 바탕으로 비행 축에서 도착지 밤 시간이 어디 걸치는지 자동으로 계산해 「권장 수면 시작/종료/총 가능 시간」을 알려줍니다.',
              },
              {
                q: '단기 출장(1~3일)도 시차 적응을 해야 하나요?',
                a: '권장하지 않습니다. <strong>2~3일짜리 단기 출장</strong>은 적응 자체에 시차의 1~2배 시간이 들기 때문에 적응을 시도하지 말고 <strong>한국 시간 유지 전략</strong>(한국 낮 시간대에 회의·식사·수면)이 효율적입니다. 본 계산기는 체류 일수가 3일 이하면 한국 시간 유지를 자동 추천합니다.',
              },
              {
                q: '멜라토닌 복용이 효과적인가요?',
                a: '기관별 입장이 갈립니다. 시차 적응에 효과적이라는 연구가 다수 있고(Cochrane 리뷰: 5개 이상 시간대 이동에서 시차 감소) 미국 CDC 여행의학 지침도 선택지로 다루지만, <strong>영국 NHS는 근거 부족을 이유로 시차 목적 사용을 권장하지 않습니다</strong>. 복용한다면 타이밍은 <strong>도착지의 목표 취침 시각 30~60분 전</strong>이 기본이며, 낮에 잘못 복용하면 오히려 졸음·적응 지연을 유발합니다.<br/><br/>용량은 일반적으로 <strong>0.5~1mg 저용량</strong>이 사용됩니다. 고용량(3~5mg)도 시차 적응 효과는 비슷하지만, 저용량이 다음날 잔류 졸림 등 부작용이 적습니다(효과가 더 커서가 아니라 내약성 때문).<br/><br/>한국에서 멜라토닌은 <strong>전문의약품</strong>(서카딘 등)으로 분류되어 처방이 필요합니다 — 복용 여부는 의사·약사와 상담해 결정하세요. 임산부·청소년·우울증·자가면역질환자는 특히 주의가 필요합니다.',
              },
              {
                q: '도착 첫날 낮잠은 얼마나 자도 되나요?',
                a: '<strong>현지 오후 3시 이전</strong>이라면 20~30분 이내의 낮잠은 도움이 됩니다. 30분 이상 자면 깊은 수면 단계(SWS)에 들어가 오히려 피로감(sleep inertia)이 커지고 당일 밤 수면을 방해합니다. <strong>오후 5시 이후 낮잠은 당일 밤 수면을 크게 해치므로 피하세요</strong>. 본 계산기는 도착 시각을 기준으로 자동 판정해 「가능/주의/금지」를 표시합니다.',
              },
              {
                q: '카페인 컷오프 시각은 어떻게 정해지나요?',
                a: '카페인 반감기는 건강한 성인 평균 <strong>약 5시간</strong>(FDA 4~6시간)입니다. 취침 6시간 전에 섭취해도 총수면시간이 1시간 이상 줄었다는 연구가 있어(Drake 2013), 본 계산기는 잔류 효과까지 고려한 보수적 버퍼로 <strong>평소 취침 시각 − 8시간</strong>을 마지막 허용 시각으로 계산합니다(8시간은 반감기가 아니라 안전 버퍼). 예) 평소 23시 취침 → 15시 이후 카페인 컷.<br/><br/>임신부(반감기 최대 15시간까지 연장)·고혈압·불안장애가 있다면 반감기가 길어 더 <strong>이른 시각</strong>(예: 취침 10시간 전, 13시경)에 끊는 것이 안전합니다.',
              },
              {
                q: '햇빛 노출이 정말 시차 적응에 도움이 되나요?',
                a: '네. 햇빛은 가장 강력한 <strong>생체시계 동기화 신호(zeitgeber)</strong>입니다.<br/>· <strong>아침 햇빛(6~10시)</strong> — 생체시계를 앞당김 → 동쪽 이동 적응에 도움(단, 크게 앞당기는 여행의 첫 1~2일은 본문 「햇빛 타이밍」 섹션처럼 체온 최저점 이후로 미루세요)<br/>· <strong>저녁 햇빛(15~19시)</strong> — 생체시계를 늦춤 → 서쪽 이동 적응에 도움<br/><br/>실내에서도 창가에 앉거나 야외 산책 10~30분만으로 효과가 있습니다. 야외는 흐린 날에도 실내 조명(300~500 lux)보다 수 배~수십 배 밝습니다(짙은 흐림 1,000~2,000 lux, 밝은 흐림 1만 lux 이상, 맑은 날 직사광 10만 lux).',
              },
              {
                q: '7일 적응 스케줄대로 안 따르면 어떻게 되나요?',
                a: '몸이 자연 적응에 의존하게 되어 평균 적응 기간이 1.5~2배 길어질 수 있습니다. 특히 동쪽 이동은 자연 적응으로 2주 이상 걸리는 경우가 흔합니다. 본 계산기 스케줄은 <strong>점진적 수면 시각 조정 + 햇빛 활용 + 카페인 컷오프</strong>를 종합한 일반 가이드입니다. 직장 일정 등으로 100% 따르기 어렵다면 <strong>아침 햇빛·저녁 카페인 차단 두 가지만이라도</strong> 우선 지키세요.',
              },
            ]

export default function JetLagPage() {
  return (
    <ToolPage width={760} slug="/tools/date/jet-lag">
      <h1 className="tp-h1">
        <ToolIconBadge catId="date" />시차 적응 계산기
      </h1>
      <p className="tp-lead">
        여행 전·중·후 <strong style={{ color: 'var(--text)' }}>시차 적응 일정과 수면 타이밍</strong> 자동 가이드.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="시차·서머타임 = IANA 시간대 데이터(출발일 기준) · 적응 속도 = 동쪽 1시간/일·서쪽 1.5시간/일 (CDC Yellow Book)"
        sources={[
          { label: 'CDC Yellow Book — Jet Lag Disorder', href: 'https://www.cdc.gov/yellow-book/hcp/travel-air-sea/jet-lag-disorder.html' },
          { label: 'AASM 임상 진료지침 (SLEEP 2007)', href: 'https://aasm.org/wp-content/uploads/2017/07/PP_CircadianRhythm.pdf' },
          { label: 'NHS — Jet lag', href: 'https://www.nhs.uk/conditions/jet-lag/' },
          { label: 'IANA Time Zone Database', href: 'https://www.iana.org/time-zones' },
        ]}
      />

      <JetLagClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 과학 */}
        <div>
          <h2 className="g-h2">시차 적응의 과학 — 왜 힘든가</h2>
          <p className="g-p">
            인간의 뇌에는 약 <strong style={{ color: 'var(--text)' }}>24.2시간 주기</strong>로 작동하는 생체시계(서카디안 리듬)가 있습니다.
            어두워지면 <strong style={{ color: 'var(--text)' }}>멜라토닌</strong>이 분비돼 수면 신호를 보내고, 아침엔 <strong style={{ color: 'var(--text)' }}>코르티솔</strong>이 분비돼 각성 신호를 보냅니다.
          </p>
          <p className="g-p">
            장거리 비행 뒤엔 이 두 호르몬의 분비 타이밍이 현지 시간과 어긋나면서 피로·불면·소화장애가 생깁니다.
            특히 <strong style={{ color: 'var(--accent)' }}>동쪽 이동(시계를 앞당김)이 서쪽 이동(시계를 늦춤)보다 힘든 이유</strong>는 생체시계가 24시간보다 약간 길기 때문입니다. 늘리는 건 쉽지만 줄이는 건 어렵습니다.
          </p>
        </div>

        {/* 2. 여행지별 시차 표 — 값은 JetLagClient의 circadian()·적응일수 규칙으로 2026-01-15/07-15 정오(UTC) 기준 산출·검산 */}
        <div>
          <h2 className="g-h2">인기 여행지별 시차 &amp; 적응 기간 (가는 길·귀국)</h2>
          <p className="g-p">
            서울 출발 기준으로 계산기가 내놓는 값을 그대로 옮겼습니다. 서머타임을 쓰는 도시는 <strong>1월(표준시)</strong>과 <strong>7월(서머타임)</strong> 값이 다르고, 남반구 시드니는 반대로 1월이 서머타임입니다.
            귀국 칸은 현지에 완전히 적응한 뒤 서울로 돌아올 때의 역(逆)시차입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['목적지', '시계 차이 (1월 / 7월)', '가는 길: 생체시계 이동 → 적응', '귀국: 생체시계 이동 → 적응'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['도쿄', '0시간', '없음', '없음'],
                  ['방콕', '−2시간', '늦춤 2h → 2일', '앞당김 2h → 2일'],
                  ['두바이', '−5시간', '늦춤 5h → 4일', '앞당김 5h → 5일'],
                  ['파리', '−8 / −7시간', '늦춤 8h → 6일 / 늦춤 7h → 5일', '늦춤 16h → 11일 / 앞당김 7h → 7일'],
                  ['런던', '−9 / −8시간', '늦춤 9h → 6일 / 늦춤 8h → 6일', '늦춤 15h → 10일 / 늦춤 16h → 11일'],
                  ['뉴욕', '−14 / −13시간', '늦춤 14h → 10일 / 늦춤 13h → 9일', '늦춤 10h → 7일 / 늦춤 11h → 8일'],
                  ['LA', '−17 / −16시간', '앞당김 7h → 7일 / 늦춤 16h → 11일', '늦춤 7h → 5일 / 늦춤 8h → 6일'],
                  ['호놀룰루', '−19시간', '앞당김 5h → 5일', '늦춤 5h → 4일'],
                  ['시드니', '+2 / +1시간', '앞당김 2h → 2일 / 앞당김 1h → 1일', '늦춤 2h → 2일 / 늦춤 1h → 1일'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 값이 하나면 1월·7월이 같습니다. 「늦춤」은 서쪽형, 「앞당김」은 동쪽형 적응입니다. 뉴욕·LA·호놀룰루처럼 시계 차이가 12시간을 넘으면 더 짧은 반대 방향으로 셉니다.
            LA는 1월엔 7시간 앞당김, 7월엔 16시간 늦춤으로 판정이 갈려 적응일수가 7일↔11일로 크게 달라집니다. 실제 출발일을 넣으면 그날의 서머타임이 반영됩니다.
          </p>
          <p className="g-p">
            눈여겨볼 곳은 <strong>유럽→서울 귀국</strong>입니다. 겨울 파리→서울은 시계로 8시간 앞당겨야 하는데, 계산기는 앞당김이 8시간 이상이면 몸이 반대로 16시간을 늦춰 맞춘다고 보고(아래 계산 방식 ②) 적응일수를 11일로 냅니다.
            연구에서도 이 구간에서는 앞당김으로 적응하는 사람과 늦춤으로 도는 사람이 섞여 나오므로, 실제로는 앞당김 기준 약 8일(8시간 ÷ 1시간/일)과 11일 사이로 보는 것이 현실적입니다.
            여름(서머타임)에는 같은 노선이 7시간 앞당김이라 7일로 바로 떨어집니다.
          </p>
        </div>

        {/* 3. 계산 방식 — JetLagClient.tsx 로직과 1:1 */}
        <div>
          <h2 className="g-h2">계산기는 이렇게 계산합니다</h2>
          <ol className="g-list">
            <li><strong>시계 차이</strong> — 입력한 출발일 정오(UTC) 시점의 두 도시 UTC 오프셋을 IANA 시간대 데이터로 구해 뺍니다. 서머타임 시작·종료일이 도시마다 달라 날짜가 바뀌면 결과도 바뀝니다.</li>
            <li><strong>생체시계 방향</strong> — 시계 차이를 −12~+12시간 사이의 가장 짧은 이동으로 바꿉니다. 앞당김이 8시간 이상이면 몸이 늦춤(24 − 앞당김)으로 재동조하는 경향을 반영해 서쪽형으로 처리합니다(Eastman &amp; Burgess, 2009).</li>
            <li><strong>완전 적응 일수</strong> — 앞당김은 하루 1시간, 늦춤은 하루 1.5시간씩 옮겨진다고 보고 올림합니다. 50%·80% 적응 시점은 이 값의 절반·80%를 올림한 날입니다.</li>
            <li><strong>출국 전 조정표</strong> — 하루 조정폭은 이동량 ÷ 5를 올림하되 최대 2시간, 출국 전에 미리 옮기는 총량은 최대 3시간으로 제한합니다. 집에서 3시간 넘게 생활을 옮기기는 어렵기 때문입니다.</li>
            <li><strong>도착 현지 시각</strong> = 이륙 시각(출발지) + 비행 시간 + 시계 차이.</li>
            <li><strong>기내 수면 권장 구간</strong> — 비행 중 도착지 시각을 15분 단위로 훑어 22:00~06:00에 걸리는 가장 긴 구간을 고릅니다.</li>
            <li><strong>카페인 마감</strong> = 평소 취침 − 8시간. <strong>낮잠</strong>은 도착 시각이 15시 전이면 30분, 15~17시면 15분, 17시 이후면 금지이고, 평소 취침~기상 사이에 도착하면 바로 취침으로 판정합니다.</li>
            <li><strong>피로도</strong> — 기내 수면을 비행 시간의 약 3분의 1(최대 6시간)로 가정하고, 도착 후 취침까지 버틸 시간과 함께 4단계로 나눕니다.</li>
          </ol>
        </div>

        {/* 3-1. 계산 예시 — 계산기 출력값과 일치 (서울→파리, 출발일 1월 중순) */}
        <div>
          <h2 className="g-h2">계산 예시 — 서울→파리, 1월, 13:00 이륙</h2>
          <p className="g-p">
            비행 14시간, 평소 23:00 취침·07:00 기상, 체류 7일로 넣으면 다음과 같이 나옵니다. 1월 파리는 표준시(UTC+1)라 시계 차이는 8시간입니다.
          </p>
          <ul className="g-list">
            <li><strong>판정</strong> — 생체시계 8시간 늦춤(서쪽형), 완전 적응 약 6일(50%는 3일, 80%는 5일 후).</li>
            <li><strong>출국 전</strong> — 하루 2시간씩 늦춰 D-2 23:00 → D-1 01:00 → 출발일 02:00 취침(기상은 07:00 → 09:00 → 10:00). 총 3시간에서 멈춥니다.</li>
            <li><strong>기내</strong> — 이륙 순간 파리는 05:00, 도착은 파리 19:00입니다. 파리 밤(22~06시)과 겹치는 건 이륙 후 첫 1시간뿐이라 권장 수면은 1.0시간이고, 나머지는 깨어 있는 편이 도착 첫날 밤잠에 유리합니다.</li>
            <li><strong>도착 후</strong> — 현지 23:00 취침까지 4시간을 버티면 됩니다(피로도 「보통」). 19시 도착이라 낮잠은 「금지」, 카페인은 15:00 이후 끊고, 햇빛은 현지 15~19시에 쬐고 이른 아침(05~08시) 강한 빛은 피합니다.</li>
            <li><strong>첫 2~3일 주의</strong> — 서울의 23:00~07:00이 파리의 15:00~23:00이라 오후 늦게 졸음이 몰리고, 반대로 한밤중에 눈이 떠지기 쉽습니다.</li>
          </ul>
          <p className="g-note">
            ※ 같은 노선을 7월에 가면 시계 차이 7시간(늦춤 7h)이라 적응 약 5일, 도착 현지 시각도 20:00으로 1시간 늦어집니다.
          </p>
        </div>

        {/* 3-2. 햇빛 타이밍 — 위상반응곡선 */}
        <div>
          <h2 className="g-h2">햇빛 타이밍 — 체온이 가장 낮은 시각이 기준</h2>
          <p className="g-p">
            빛이 생체시계를 앞당길지 늦출지는 시계 시각이 아니라 <strong>몸의 심부체온이 가장 낮아지는 시각</strong>(보통 평소 기상 2~3시간 전)을 기준으로 정해집니다.
            그 <strong>이전</strong>에 받는 빛은 시계를 늦추고, <strong>이후</strong>에 받는 빛은 앞당깁니다. 도착 직후 몸은 아직 서울 시각대로 움직이므로 이 기준점도 서울 시각에 머물러 있습니다.
          </p>
          <p className="g-p">
            평소 07:00에 일어나는 사람의 체온 최저점은 서울 새벽 4~5시 무렵입니다. 파리(겨울)로 가면 이 시점이 현지 저녁 8~9시라, 계산기가 권하는 오후 3~7시 빛은 최저점 이전 → 늦춤 방향으로 정확히 작동합니다.
            반면 호놀룰루(5시간 앞당김)에선 최저점이 현지 오전 9~10시에 놓여, 첫날 이른 아침 햇빛은 오히려 시계를 늦출 수 있습니다.
          </p>
          <Callout tone="tip" title="큰 폭으로 앞당겨야 하는 동쪽형 여행의 첫 1~2일">
            계산기의 「현지 06~10시 햇빛」은 적응이 진행된 뒤의 일반 원칙입니다. 첫날은 서울 기준 체온 최저점(평소 기상 2~3시간 전)을 현지 시각으로 옮긴 시각까지는 선글라스 등으로 빛을 피하고, 그 이후에 밖으로 나가세요 — 평소 07:00 기상이라면 호놀룰루(앞당김 5h)는 현지 10시 이후, 1월 LA(앞당김 7h)는 정오 이후입니다. 적응이 진행되면 최저점이 하루 1시간 정도씩 앞당겨지므로 햇빛 시간대도 그만큼 앞으로 옮기면 됩니다.
          </Callout>
        </div>

        {/* 4. 방향별 가이드 */}
        <div>
          <h2 className="g-h2">이동 방향별 완전 가이드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '12px' }}>
            <div style={{ background: 'color-mix(in srgb, var(--cyan-600) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--cyan-600) 25%, transparent)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cat-health)', marginBottom: '10px' }}>← 서쪽 이동 (미주·유럽)</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '출국 전: 매일 1~2시간씩 취침 늦추기',
                  '기내: 현지 밤 시간대에 수면',
                  '도착 후: 저녁 햇빛 노출 (생체시계 지연)',
                  '멜라토닌: 상담 후 도착지 저녁에 (국내 처방 필요)',
                ].map((t, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>• {t}</li>)}
              </ul>
            </div>
            <div style={{ background: 'color-mix(in srgb, var(--cat-life) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--cat-life) 25%, transparent)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cat-life)', marginBottom: '10px' }}>→ 동쪽 이동 (호주·하와이)</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '출국 전: 매일 1~2시간씩 취침 앞당기기',
                  '기내: 현지 낮 시간대 각성 유지',
                  '도착 후: 아침 햇빛 — 단, 첫 1~2일은 체온 최저점이 지난 뒤부터 (위 햇빛 타이밍 참고)',
                  '주의: 서쪽보다 1.5배 더 어려움',
                ].map((t, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>• {t}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* 5. 단기 vs 장기 */}
        <div>
          <h2 className="g-h2">단기 출장 vs 장기 여행 전략</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px' }}>단기 출장 (2~3일)</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '적응 포기, 한국 시간 유지 전략',
                  '회의는 한국 낮 시간대에 맞춰 일정',
                  '카페인은 한국 낮 시간대에 맞춰 활용, 수면제는 의사 상담 후',
                ].map((t, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>• {t}</li>)}
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px' }}>1주일 이상</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '적응 전략 적극 시행',
                  '도착 즉시 현지 시간 동기화',
                  '낮잠 최소화, 햇빛 적극 활용',
                ].map((t, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>• {t}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* 5-1. 전문가 상담 */}
        <div>
          <h2 className="g-h2">자주 하는 실수와 상담이 필요한 경우</h2>
          <ul className="g-list">
            <li><strong>출발지 기준 시각을 도착지 시각으로 착각</strong> — 이륙 시각은 항공권의 출발지 현지 시각을 넣어야 도착 시각·기내 수면 구간이 맞습니다. 경유편은 대기 시간을 포함한 총 이동 시간을 넣으세요.</li>
            <li><strong>서머타임 전환 주간을 표준시로 계산</strong> — 3~4월·10~11월 전후 출발이면(미국·유럽·호주의 전환일이 서로 다릅니다) 반드시 실제 출발일을 입력하세요. 1시간 차이로 LA처럼 적응 방향이 뒤집히는 노선이 있습니다.</li>
            <li><strong>도착 첫날 긴 낮잠</strong> — 오후 늦게 1~2시간 깊이 자면 그날 밤잠이 흐트러져 현지 리듬에 맞추기가 더 늦어집니다.</li>
            <li><strong>귀국 후 역시차를 계획하지 않음</strong> — 위 표처럼 귀국 적응이 가는 길보다 긴 노선이 있습니다. 귀국 다음 날 중요한 일정을 잡을 때 참고하세요.</li>
          </ul>
          <p className="g-p">
            계산기의 적응 일수는 평균적인 속도를 가정한 추정입니다. 예상 기간이 지나도 불면·낮 졸림·소화 장애가 계속되거나, 잦은 장거리 비행·교대근무로 수면 리듬이 만성적으로 깨졌다면 수면의학 진료를 받아 보세요.
            수면제나 멜라토닌(국내 전문의약품)을 쓰려면 복용 시각·용량·운전 등 다음 날 활동까지 의사·약사와 상의해야 합니다.
          </p>
        </div>

        {/* 6. FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* 7. 관련 도구 */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/dday',      emoji: '📅', name: 'D-Day 계산기', desc: '여행 출발 D-day·기간' },
              { href: '/tools/life/pomodoro',  emoji: '🍅', name: '뽀모도로 타이머',   desc: '기내 활동 루틴' },
              { href: '/tools/date/age',       emoji: '🎂', name: '만 나이 계산기',    desc: '여권 만료 확인용' },
              { href: '/tools/date/lunar',     emoji: '🌙', name: '음양력 변환기',     desc: '여행지 명절 확인' },
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
