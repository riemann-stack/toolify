import Link from 'next/link'
import LeagueScenariosClient from './LeagueScenariosClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/sports/league-scenarios',
  title: '축구 순위·승점 경우의 수 계산기 — 32강 진출 조건·자력/타력·시즌 승점 예측',
  description: '월드컵·K리그·챔피언스리그 잔여 경기 순위 경우의 수와 자력/타력 진출 조건, 대회별 타이브레이커(골득실·승자승) 반영. 시즌 승점 탭에서 PPG 최종 승점 예측·목표 승점 조합·라이벌 추격, EPL·K리그1 10시즌 우승·강등 승점 기준선까지.',
  keywords: ['축구 경우의 수', '월드컵 32강 경우의 수', '월드컵 16강 경우의 수', '조별리그 순위', '진출 경우의 수', '자력 진출', '골득실 계산', 'K리그 순위 경우의 수', '챔피언스리그 진출', '승자승', '리그 순위 시나리오', '축구 승점 계산기', 'K리그 승점', 'EPL 승점', '승점 계산', '우승 가능성 계산', '강등 승점'],
})

const FAQ_LD = [
  {
    q: '자력 진출과 타력 진출은 어떻게 다른가요?',
    a: '<strong>자력 진출</strong>은 우리 팀의 남은 경기 결과만으로 진출이 확정되는 경우입니다. 예를 들어 ‘마지막 경기를 이기면 다른 경기 결과와 상관없이 조 2위 이내’라면 자력입니다. <strong>타력 진출</strong>은 우리 결과만으로는 부족해 다른 팀들의 경기 결과까지 특정 조건으로 나와야 올라가는 경우입니다. 본 도구는 관심 팀의 자기 경기 결과별로 ‘이기면/비기면/지면’을 나눠, 그 결과가 곧 진출 확정(자력)인지 다른 경기에 달렸는지(타력)를 구분해 보여줍니다.',
  },
  {
    q: '승점이 같으면 순위는 무엇으로 정하나요?',
    a: '승점이 같을 때 적용하는 기준(타이브레이커)은 대회마다 다릅니다. 흔한 순서는 <strong>승점 → 골득실차 → 다득점 → 승자승</strong>이지만, 대회에 따라 승자승(맞대결)이 골득실보다 먼저 오기도 합니다. 본 도구는 선택한 대회 프리셋의 실제 순서를 그대로 적용하고, 동점이 골득실·다득점처럼 스코어로 갈리는 경계는 ‘확정’ 대신 <strong>‘골득실차에 따라 갈림’</strong>처럼 사유를 표시합니다.',
  },
  {
    q: '월드컵과 챔피언스리그, K리그는 동점 규칙이 어떻게 다른가요?',
    a: '<strong>2026 FIFA 월드컵</strong>은 승점 다음에 <strong>승자승(맞대결)을 전체 골득실보다 먼저</strong> 봅니다(2022년까지와 반대). <strong>UEFA 챔피언스리그 구 조별리그</strong>도 승자승 우선이었고, 2024/25부터의 리그페이즈는 전체 골득실 우선입니다. <strong>K리그1</strong>은 2016년부터 승점 다음에 <strong>다득점(많이 넣은 팀)을 골득실보다 먼저</strong> 봅니다(공격 축구 장려 취지). 같은 동점이라도 어느 규칙이냐에 따라 순위가 정반대로 갈릴 수 있어, 프리셋을 정확히 골라야 합니다.',
  },
  {
    q: '승자승(상대전적)은 어떻게 계산하나요?',
    a: '승자승은 동점인 팀들끼리 <strong>자기들끼리 맞붙은 경기만 따로 모아 미니리그</strong>를 만들어 그 안에서 승점·골득실·다득점을 비교하는 방식입니다. 그래서 세 팀 이상이 동점이면 그 팀들 사이 경기 결과가 모두 필요합니다. 본 도구에서 승자승 우선 대회를 고르면 ‘이미 치른 맞대결 결과’ 입력란이 권장됩니다. 입력하면 승자승이 정확히 반영되고, 비워두면 승자승으로 갈리는 동점은 ‘승자승(맞대결 결과 필요)’으로 솔직하게 표시됩니다.',
  },
  {
    q: '이 도구로 진출 확률이나 베팅 확률을 알 수 있나요?',
    a: '아니요. 본 도구가 보여주는 ‘진출 확률(참고)’은 <strong>남은 경기의 모든 결과(승·무·패)가 똑같이 나온다고 가정</strong>한 단순 경우의 수 비율일 뿐입니다. 팀 전력·최근 경기력·홈/원정·선수 상태를 전혀 반영하지 않으므로 실제 가능성과 다릅니다. 베팅·도박 목적의 수치가 아니며, 어디까지나 ‘몇 가지 경우에 진출하는가’를 세는 참고용입니다.',
  },
  {
    q: 'K리그나 일반 리그 순위 경쟁도 계산할 수 있나요?',
    a: '네. 대회 프리셋에서 ‘K리그1(다득점 우선)’이나 ‘프리미어리그·일반 리그(골득실 우선)’를 고르면 그 규칙으로 계산합니다. 팀 수와 진출(또는 우승·잔류) 자리 수를 조정하고, 순위 경쟁 중인 팀들과 그들의 잔여 경기만 넣으면 됩니다. 잔여 경기가 많으면(12경기 이상) 전수 계산이 어려우니, 관심 팀과 직접 관련된 핵심 경기 위주로 줄여서 보는 편이 좋습니다. 시즌 전체의 최종 승점 예측·목표 승점 조합·라이벌 추격은 <strong>‘시즌 승점’ 탭</strong>에서 계산합니다.',
  },
  {
    q: '실시간 경기 결과가 자동으로 반영되나요?',
    a: '아니요. 본 도구는 실시간 중계나 외부 API와 연동하지 않습니다. 현재 순위표(승·무·패·득실)와 잔여 경기를 <strong>직접 입력</strong>하면 그 값을 기준으로 경우의 수를 계산합니다. 경기가 끝날 때마다 순위표 숫자를 갱신하면서 사용하세요. ‘순위 경우의 수’ 탭의 입력값은 브라우저에만 저장되어 다음 방문 때 그대로 불러옵니다(‘시즌 승점’ 탭 입력값은 저장하지 않습니다).',
  },
  {
    q: '우승 확정은 언제 가능한가요?',
    a: '수학적으로 라이벌 팀이 남은 경기 모두 승리해도 나의 현재 승점을 따라잡지 못할 때 우승이 확정됩니다. 예를 들어 5경기 남은 시점에서 라이벌과의 격차가 16점 이상이면, 라이벌이 5승(15점)을 거둬도 따라잡을 수 없어 <strong>우승 확정</strong>입니다.',
  },
  {
    q: '잔류는 몇 점 정도면 안전한가요?',
    a: '통설로는 <strong>EPL 40점</strong>이 “안전 승점”으로 통하지만, 실측으로 보면 최근 10시즌(2016-17~2025-26) 18위 승점은 <strong>25~39점</strong>(평균 32.2점)이었습니다. 2023-24 루턴 26점, 2024-25 레스터 25점처럼 20점대 강등이 이어지다가 2025-26에는 웨스트햄이 <strong>39점으로도 강등</strong>돼 40점 기준선이 다시 유효해졌습니다. K리그1은 12위(직행 강등) 승점이 최근 10시즌 기준 27~39점(38경기 시즌 — 2020 단축시즌은 25점)에 분포했고, 10·11위는 승강 플레이오프로 밀리기 때문에 2025년 수원FC처럼 <strong>42점으로도 강등</strong>될 수 있습니다. 가능한 한 빨리 잔류 승점을 확보하는 것이 안전합니다.',
  },
  {
    q: '득실차는 왜 중요한가요?',
    a: '승점이 동률일 때 순위를 가르는 핵심 지표이기 때문입니다. 시즌 막판 우승·강등권 다툼에서 <strong>득실차 1점 차이로 순위가 갈리는 사례</strong>가 자주 있습니다. 이 때문에 강팀들은 약팀 상대로 골 차이를 벌리려 하고, 강등권 팀들은 패배해도 실점을 줄이려 노력합니다.',
  },
  {
    q: '챔피언스리그 진출권은 몇 위까지인가요?',
    a: '주요 유럽 리그는 보통 <strong>상위 4팀</strong>이 챔피언스리그 본선에 직행합니다. 여기에 UEFA의 <strong>리그 성과 순위(European Performance Spots)</strong>에 따라 직전 시즌 대회 성적이 가장 좋은 1~2개 리그에 5번째 진출권이 추가될 수 있어, 리그별 장수가 매 시즌 달라집니다. 리그앙은 대체로 1~3위, K리그1은 1위가 ACL 엘리트, 2~3위가 ACL2(아시아 대회) 출전권을 받습니다. 실제로 2025-26 시즌 EPL은 리그 성과 순위로 5장을 확보해 1~5위(아스널·맨체스터 시티·맨체스터 유나이티드·아스톤 빌라·리버풀)가 모두 챔피언스리그에 진출했습니다.',
  },
]

const sec = { fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 700, marginBottom: '12px' } as const
const lead = { fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' } as const
const strong = { color: 'var(--text)' } as const
const box = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 20px' } as const

const EPL_SEASONS = [
  { y: '2016-17', c: '첼시',          cp: '93점',  r: '헐 시티',     rp: '34점' },
  { y: '2017-18', c: '맨체스터 시티', cp: '100점', r: '스완지 시티', rp: '33점' },
  { y: '2018-19', c: '맨체스터 시티', cp: '98점',  r: '카디프 시티', rp: '34점' },
  { y: '2019-20', c: '리버풀',        cp: '99점',  r: '본머스',      rp: '34점' },
  { y: '2020-21', c: '맨체스터 시티', cp: '86점',  r: '풀럼',        rp: '28점' },
  { y: '2021-22', c: '맨체스터 시티', cp: '93점',  r: '번리',        rp: '35점' },
  { y: '2022-23', c: '맨체스터 시티', cp: '89점',  r: '레스터 시티', rp: '34점' },
  { y: '2023-24', c: '맨체스터 시티', cp: '91점',  r: '루턴 타운',   rp: '26점' },
  { y: '2024-25', c: '리버풀',        cp: '84점',  r: '레스터 시티', rp: '25점' },
  { y: '2025-26', c: '아스널',        cp: '85점',  r: '웨스트햄',    rp: '39점' },
]

const KLEAGUE_SEASONS = [
  { y: '2016', c: 'FC서울',    cp: '70점', r: '수원FC',          rp: '39점' },
  { y: '2017', c: '전북 현대', cp: '75점', r: '광주FC',          rp: '30점' },
  { y: '2018', c: '전북 현대', cp: '86점', r: '전남 드래곤즈',   rp: '32점' },
  { y: '2019', c: '전북 현대', cp: '79점', r: '제주 유나이티드', rp: '27점' },
  { y: '2020', c: '전북 현대', cp: '60점', r: '부산 아이파크',   rp: '25점' },
  { y: '2021', c: '전북 현대', cp: '76점', r: '광주FC',          rp: '37점' },
  { y: '2022', c: '울산 현대', cp: '76점', r: '성남FC',          rp: '30점' },
  { y: '2023', c: '울산 현대', cp: '76점', r: '수원 삼성',       rp: '33점' },
  { y: '2024', c: '울산 HD',   cp: '72점', r: '인천 유나이티드', rp: '39점' },
  { y: '2025', c: '전북 현대', cp: '79점', r: '대구FC',          rp: '34점' },
]

function SeasonTable({ head, rows }: { head: string[]; rows: typeof EPL_SEASONS }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 540 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          {head.map((h, i) => (
            <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
            <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>{r.y}</td>
            <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.c}</td>
            <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.cp}</td>
            <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.r}</td>
            <td style={{ padding: '10px 12px', color: 'var(--danger)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.rp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function LeagueScenariosPage() {
  return (
    <ToolPage width={880} slug="/tools/sports/league-scenarios">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />축구 순위·승점 경우의 수 계산기
      </h1>
      <p className="tp-lead">
        조별리그·정규 리그의 <strong style={strong}>잔여 경기 결과 조합</strong>을 모두 따져 진출 확정 경우의 수와 <strong style={strong}>자력·타력 진출 조건</strong>을 정리합니다. 월드컵·K리그·챔피언스리그 등 대회별 동점 규칙(골득실·승자승)을 프리셋으로 반영합니다. <strong style={strong}>시즌 승점</strong> 탭은 PPG로 최종 승점·목표 승점·라이벌 추격을 계산합니다.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="EPL 2016-17~2025-26·K리그1 2016~2025 최종 순위표 실측 승점 · 대회별 타이브레이커 2026년 6월 확인 기준"
        sources={[
          { label: 'Premier League 공식 순위표', href: 'https://www.premierleague.com/en/tables' },
          { label: 'K리그 공식 기록', href: 'https://www.kleague.com/record/team.do' },
        ]}
      />

      <Disclaimer variant="default">
        본 축구 순위·승점 경우의 수 계산기는 경우의 수 참고 도구입니다. 모든 잔여 경기 결과(승/무/패) 조합을 기준으로 계산하며, 확률은 “모든 결과가 동일하게 나온다”는 단순 가정의 수치로 팀 전력을 반영하지 않습니다. ‘시즌 승점’ 탭의 예상 최종 승점은 현재 경기당 승점(PPG)이 유지된다는 가정의 참고치로, 남은 일정의 난이도를 반영하지 못합니다. 타이브레이커(동점 시 순위)는 대회별 규정 기준이며 시즌·대회별로 바뀔 수 있으니 정확한 규정은 해당 대회 공식 발표를 확인하세요. ⚠️ 본 도구는 베팅·도박 목적이 아니며, 실시간 경기 연동·전력 기반 승률 예측·선수/전술 분석을 제공하지 않습니다.
      </Disclaimer>

      <LeagueScenariosClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 순위 결정 방식 */}
        <div>
          <h2 style={sec}>조별리그 순위는 무엇으로 정해지나요</h2>
          <p style={lead}>
            먼저 <strong style={strong}>승점</strong>으로 줄을 세웁니다. 이기면 3점, 비기면 1점, 지면 0점입니다. 승점이 같은 팀이 둘 이상이면 <strong style={strong}>타이브레이커(동점 시 순위 기준)</strong>를 순서대로 적용합니다. 자주 쓰이는 기준은 다음과 같습니다.
          </p>
          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.9 }}>
            <li><strong style={strong}>골득실차</strong> — 총 득점에서 총 실점을 뺀 값. +5가 +2보다 위.</li>
            <li><strong style={strong}>다득점</strong> — 더 많이 넣은 팀이 위. 공격 축구를 장려하는 기준.</li>
            <li><strong style={strong}>승자승(맞대결)</strong> — 동점 팀들끼리 맞붙은 경기 결과만 따로 비교.</li>
            <li><strong style={strong}>다승·원정 다득점·페어플레이·추첨(또는 플레이오프)</strong> — 그래도 같으면 대회 규정에 따라 차례로 적용.</li>
          </ul>
        </div>

        {/* 2. 대회별 타이브레이커 차이 */}
        <div>
          <h2 style={sec}>대회별 동점 규칙 차이 (★ 핵심)</h2>
          <p style={lead}>
            가장 중요한 차이는 <strong style={strong}>승자승(맞대결)이 전체 골득실보다 앞이냐 뒤냐</strong>입니다. 이게 대회마다 정반대라 같은 동점이라도 순위가 뒤집힙니다. K리그는 한술 더 떠 2016년부터 <strong style={strong}>다득점을 골득실보다 먼저</strong> 봅니다(공격 축구 장려 취지).
          </p>
          <div className="tableScroll" style={{ borderRadius: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>대회</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--accent)', fontWeight: 700 }}>승점 다음 순서</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['2026 월드컵', '승자승 → … → 골득실 (승자승 우선)'],
                  ['2022 월드컵 방식', '골득실 → 다득점 → 승자승 (골득실 우선)'],
                  ['아시안컵', '승자승 → … → 골득실 (승자승 우선)'],
                  ['챔스 구 조별리그', '승자승 → … → 골득실 (승자승 우선)'],
                  ['챔스 리그페이즈(신)', '골득실 → 다득점 (승자승 없음)'],
                  ['K리그1', '다득점 → 골득실 → 다승 → 승자승'],
                  ['프리미어리그·분데스리가·일반', '골득실 → 다득점 → 승자승'],
                  ['라리가', '승자승 → 골득실 (승자승 우선)'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 ? 'var(--bg2)' : 'transparent' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...lead, marginTop: 16, marginBottom: 0 }}>
            <strong style={strong}>승자승 우선</strong> 대회(2026 월드컵·아시안컵·라리가·챔스 구 조별)에서는 맞대결 결과가 결정적이라, 도구의 ‘이미 치른 맞대결’ 입력을 채우는 것이 좋습니다. <strong style={strong}>골득실 우선</strong> 대회(2022 월드컵·EPL·챔스 리그페이즈)와 <strong style={strong}>다득점 우선</strong>인 K리그는 골/득점 숫자가 더 중요합니다.
          </p>
        </div>

        {/* 3. 자력 vs 타력 */}
        <div>
          <h2 style={sec}>자력 진출과 타력 진출</h2>
          <p style={lead}>
            <strong style={strong}>자력 진출</strong>은 남은 우리 경기 결과만으로 진출이 결정되는 상황입니다. 예: 3차전을 이기기만 하면 같은 조 다른 경기와 상관없이 조 2위 이내 확정. 반대로 <strong style={strong}>타력 진출</strong>은 우리가 이겨도 다른 경기까지 특정 결과가 나와야 올라가는 상황입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { t: '자력 예시', d: '2승(승점 6) 한 팀이 마지막 경기를 이기면 9점으로 조 1위 확정 — 다른 경기 무관.' },
              { t: '타력 예시', d: '우리가 이겨도 같은 승점 팀이 생겨, 그 팀이 다른 경기서 지거나 비겨야 올라가는 경우.' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', margin: '0 0 6px' }}>{m.t}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{m.d}</p>
              </div>
            ))}
          </div>
          <p style={{ ...lead, marginTop: 16, marginBottom: 0 }}>
            도구의 시나리오 카드는 관심 팀의 자기 경기 결과별로 ‘이기면/비기면/지면’을 나눠, 그게 바로 진출 확정(자력)인지 다른 경기 결과에 달렸는지(타력)를 표시합니다.
          </p>
        </div>

        {/* 4. 경우의 수 원리 */}
        <div>
          <h2 style={sec}>경우의 수는 어떻게 세나요</h2>
          <p style={lead}>
            한 경기에는 홈 승·무·원정 승 세 가지 결과가 있습니다. 잔여 경기가 <strong style={strong}>n경기</strong>면 가능한 결과 조합은 <strong style={strong}>3<sup>n</sup>가지</strong>입니다. 2경기면 9가지, 3경기면 27가지, 5경기면 243가지로 빠르게 늘어납니다. 도구는 이 모든 조합을 하나씩 만들어 각 경우에서 관심 팀의 순위와 진출 여부를 판정합니다.
          </p>
          <p style={{ ...lead, marginBottom: 0 }}>
            여기서 보여주는 ‘진출 확률(참고)’은 <strong style={strong}>이 모든 조합이 똑같이 일어난다고 가정</strong>한 비율일 뿐입니다. 실제로는 팀 전력에 따라 어떤 결과는 더 자주, 어떤 결과는 드물게 나오므로 이 수치는 실제 가능성과 다릅니다. 베팅·승부예측이 아니라 ‘몇 가지 경우에 진출하는가’를 세는 용도로만 보세요.
          </p>
        </div>

        {/* 5. 조별리그 진출 일반 시나리오 */}
        <div>
          <h2 style={sec}>월드컵 조별리그 진출 일반 시나리오</h2>
          <p style={lead}>
            4팀이 풀리그로 3경기씩 치릅니다. 2022년까지(32팀)는 조 1·2위가 16강에 갔고, 48팀으로 늘어난 2026년 대회부터는 조 1·2위에 더해 12개 조 3위 가운데 성적이 좋은 8팀까지 32강에 오릅니다. 본 도구는 다른 조 3위와의 비교까지는 계산하지 않으므로, 조 3위는 ‘타 조 성적에 따라 진출 가능’으로 따로 표시합니다. 마지막 3차전 전, 조 2위 이내를 기준으로 흔히 나오는 상황은 다음과 같습니다.
          </p>
          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.9 }}>
            <li><strong style={strong}>2승(승점 6)</strong> — 보통 마지막 경기 결과와 무관하게 조 2위 이내 확정에 가깝습니다(자력).</li>
            <li><strong style={strong}>1승 1무(승점 4)</strong> — 마지막 경기를 이기면 대개 자력 진출, 비기거나 지면 타 경기 결과가 필요합니다.</li>
            <li><strong style={strong}>1승 1패(승점 3)</strong> — 마지막 경기를 이겨야 가능성이 크게 열리며, 골득실·승자승 싸움이 됩니다.</li>
            <li><strong style={strong}>1무 1패(승점 1)</strong> — 마지막 경기를 이겨도 다른 경기 결과까지 맞물려야 하는 타력 상황이 많습니다.</li>
          </ul>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            실제 진출 여부는 같은 조 다른 팀들의 승점·골득실에 따라 달라지므로, 현재 순위표를 정확히 넣고 도구로 확인하세요.
          </p>
        </div>

        {/* 6. 승자승 미니리그 */}
        <div>
          <h2 style={sec}>승자승(상대전적)과 미니리그 재계산</h2>
          <p style={lead}>
            승자승 우선 대회에서 동점이 생기면, 그 동점 팀들끼리 맞붙은 경기만 <strong style={strong}>따로 떼어 작은 리그</strong>를 만듭니다. 이 미니리그 안에서 다시 승점 → 골득실 → 다득점 순으로 비교해 순위를 가립니다. 두 팀 동점이면 두 팀의 맞대결 결과 하나로 끝나지만, 세 팀 이상이 동점이면 그 팀들 사이 경기 결과가 모두 있어야 합니다.
          </p>
          <p style={{ ...lead, marginBottom: 0 }}>
            그래서 승자승 우선 대회를 고르면 도구가 ‘이미 치른 맞대결 결과’ 입력을 권장합니다. 이 값을 넣으면 동점이 승자승으로 어떻게 갈리는지 정확히 계산되고, 비워두면 도구는 단정하지 않고 <strong style={strong}>‘승자승(맞대결 결과 필요)으로 갈림’</strong>이라고 솔직하게 표시합니다.
          </p>
        </div>

        {/* 7. 승점 제도와 무승부 가치 (구 축구 승점 계산기) */}
        <div>
          <h2 style={sec}>승점 제도(3-1-0)와 무승부의 가치</h2>
          <div style={{ ...box, padding: '16px 18px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.85 }}>
            <p style={{ marginBottom: 10 }}>
              <strong style={{ color: 'var(--accent)' }}>현대 표준 (3-1-0)</strong> — 승 3점 / 무 1점 / 패 0점.
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.85 }}>
              1981년 잉글랜드 1부 리그(현 EPL의 전신)에서 처음 도입되었으며, 1994년 미국 월드컵부터 FIFA가 공식 채택하면서 전 세계 표준이 되었습니다.
              이전에는 <strong style={strong}>2-1-0 시스템</strong>(승 2점)이 사용되었으나, 무승부 가치가 너무 높아 수비적 경기가 늘어나자 “공격 축구를 장려하라”는 명분으로 승점 가치를 1점 더 높였습니다.
              ‘시즌 승점’ 탭의 고급 옵션에서 고전(2-1-0) 방식으로도 계산할 수 있습니다.
            </p>
          </div>
          <div style={{
            background: 'color-mix(in srgb, var(--accent) 5%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
            borderRadius: 'var(--radius-m)',
            padding: '16px 18px',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 1.9,
            marginTop: 12,
          }}>
            <p style={{ marginBottom: 10 }}>
              <strong style={{ color: 'var(--accent)' }}>3-1-0 시스템에서</strong>:
            </p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li>1승 1패 = 3점</li>
              <li>2무 = 2점</li>
              <li>→ 같은 2경기에서 승 1경기가 무 2경기보다 50% 더 많은 승점 획득</li>
            </ul>
            <p style={{ marginTop: 12, color: 'var(--muted)', fontSize: 13 }}>
              하지만 강팀 상대로 무승부는 <strong style={strong}>사실상 승점 획득</strong>입니다. 시즌 막판 “0:0 무승부도 1점은 1점”이라는 말이 나오는 이유입니다. 강등권 팀들은 강팀 원정에서 무승부만 거둬도 잔류 확률이 크게 올라갑니다.
            </p>
          </div>
        </div>

        {/* 8. EPL·K리그1 최근 10시즌 실측 우승·강등 승점 (구 축구 승점 계산기) */}
        <div>
          <h2 style={sec}>EPL·K리그1 최근 10시즌 — 실제 우승·강등 승점</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            “몇 점이면 우승, 몇 점이면 강등”을 추정치가 아닌 <strong style={strong}>최종 순위표 실측값</strong>으로 정리했습니다.
            EPL은 20팀 38경기, K리그1은 12팀 38경기(2020년 제외) 기준입니다.
          </p>
          <div className="tableScroll">
            <SeasonTable head={['EPL 시즌', '우승팀', '우승 승점', '18위(강등)', '18위 승점']} rows={EPL_SEASONS} />
          </div>
          <div className="tableScroll" style={{ marginTop: 16 }}>
            <SeasonTable head={['K리그1 시즌', '우승팀', '우승 승점', '12위(직행 강등)', '12위 승점']} rows={KLEAGUE_SEASONS} />
          </div>
          <div style={{ ...box, padding: '14px 18px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, marginTop: 12 }}>
            표에서 곧바로 계산되는 기준선 — EPL 우승 평균 <strong style={{ color: 'var(--accent)' }}>91.8점</strong>(최저 84·최고 100),
            18위 평균 <strong>32.2점</strong>(최저 25·최고 39). K리그1은 38경기 시즌 기준 우승 평균 <strong style={{ color: 'var(--accent)' }}>76.6점</strong>,
            12위는 27~39점에 분포합니다. “40점이면 잔류”라는 통설과 달리 2025-26 웨스트햄은 39점으로도 강등됐고, 2024 K리그1 인천도 39점으로 최하위였습니다.
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 2020 K리그1은 코로나19로 27경기 단축 시즌. 2019년은 전북·울산이 나란히 79점으로 마쳐 보조 지표로 우승이 갈렸습니다.
            2016년 전북은 심판 매수 사건 승점 9점 감점으로 67점 2위. K리그1 12위는 자동 강등이며, 10·11위는 별도 승강 플레이오프를 치릅니다.
          </p>
        </div>

        {/* 9. K리그1 파이널 라운드 (구 축구 승점 계산기) */}
        <div>
          <h2 style={sec}>K리그1 파이널 라운드 — 승점 계산이 달라지는 지점</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            K리그1은 유럽 리그처럼 38경기를 한 번에 돌지 않고 <strong style={strong}>시즌을 두 단계로 나눕니다.</strong>
            정규 33라운드(11개 상대와 3번씩 맞대결) 후 1~6위는 파이널A, 7~12위는 파이널B로 분리되어 같은 그룹 팀과만 5경기를 더 치릅니다.
          </p>
          <div style={box}>
            <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
              <li><strong>승점 전액 승계</strong> — 33라운드까지 쌓은 승점·득실을 그대로 안고 파이널 라운드를 진행합니다.</li>
              <li><strong>그룹 간 역전 불가</strong> — 파이널B 팀이 승점을 더 쌓아도 최종 순위는 7위가 상한. 우승·ACL 경쟁은 33라운드 종료 시점에 6위 안에 들어야 시작됩니다.</li>
              <li><strong>강등 구조</strong> — 12위 직행 강등, 10·11위는 K리그2 팀과 승강 플레이오프. 한 시즌 최대 3팀이 교체됩니다.</li>
            </ul>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.8 }}>
            그래서 K리그1 잔류 계산은 “승점 몇 점”보다 <strong style={strong}>“파이널B를 몇 위로 마치느냐”</strong>가 핵심입니다.
            파이널B에서는 강등 경쟁팀끼리 직접 맞붙어 한 경기가 사실상 6점짜리가 되고, 승강 PO라는 변수가 하나 더 붙습니다.
            실제로 2024년 전북(10위·42점)과 대구(11위·40점)는 승강 PO에서 이겨 잔류했지만, 2025년 수원FC는 같은 42점(10위)으로도 PO에서 패해 강등됐습니다.
            ‘시즌 승점’ 탭에서 K리그1(38경기)을 고르고 33라운드 시점 승·무·패를 넣으면 남은 경기가 5로 잡히고, 경쟁팀을 라이벌로 설정하면 파이널B 시나리오를 그대로 시뮬레이션할 수 있습니다.
          </p>
        </div>

        {/* 10. PPG로 최종 승점 예측 (구 축구 승점 계산기) */}
        <div>
          <h2 style={sec}>경기당 승점(PPG)으로 최종 승점 예측하기</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            시즌 중반에 “이 페이스면 몇 점으로 끝날까”를 가장 빠르게 어림하는 방법이 <strong style={strong}>경기당 평균 승점(PPG, Points Per Game)</strong> 환산입니다.
          </p>
          <div style={box}>
            <ol style={{ paddingLeft: 22, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
              <li><strong>1단계</strong> — PPG = 현재 승점 ÷ 치른 경기 수. 예: 20경기 32점 → 32 ÷ 20 = <strong style={{ color: 'var(--accent)' }}>1.60</strong></li>
              <li><strong>2단계</strong> — 예상 최종 승점 = PPG × 시즌 전체 경기 수. 예: 1.60 × 38 = 60.8 → <strong style={{ color: 'var(--accent)' }}>약 61점</strong></li>
              <li><strong>3단계</strong> — 위 실측 표와 비교. 61점은 잔류에는 넉넉하지만 우승 페이스(EPL 평균 91.8점 = PPG 2.42)에는 크게 못 미치는 수준입니다.</li>
            </ol>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.8 }}>
            기준 PPG — 38경기 리그에서 <strong style={strong}>EPL 우승 평균 91.8점은 PPG 2.42</strong>,
            K리그1 우승 평균 76.6점은 PPG 2.01, EPL 18위(강등) 평균 32.2점은 PPG 0.85입니다.
            PPG 1.05(38경기 환산 40점) 이상을 유지하면 최근 10시즌 어떤 EPL 강등팀보다 높은 페이스입니다.
            다만 PPG는 남은 일정의 난이도를 반영하지 못하는 참고치이므로, 확정 계산은 ‘시즌 승점’ 탭에 현재 승·무·패와 리그(총 경기 수)·목표 승점을 넣어
            승무패 조합으로 확인하세요. 위 예시라면 남은 18경기에서 29점(9승 2무 이상)을 더해야 61점에 도달합니다.
          </p>
        </div>

        {/* 11. 자주 검색되는 시나리오 (구 축구 승점 계산기) */}
        <div>
          <h2 style={sec}>자주 검색되는 시나리오 예시</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 10 }}>
            {[
              { q: 'EPL에서 우승하려면 몇 점 필요?', a: '최근 10시즌 평균 91.8점',          sub: '최저 리버풀 84점(2024-25) · 최고 맨시티 100점(2017-18)' },
              { q: 'K리그1 잔류하려면?',              a: '12위 직강 승점 27~39점(38경기 기준)', sub: '10·11위 승강 PO — 2025년엔 42점(수원FC)도 PO 강등' },
              { q: '챔피언스리그 진출권 (EPL)',       a: '1~4위 — 보통 65~70점',              sub: '리그 성과 순위로 5위도 진출 가능 (2025-26 리버풀)' },
              { q: '수학적 우승 확정이란?',            a: '필요 승점 = 라이벌 최대 승점 + 1', sub: '남은 경기 결과와 무관하게 1위 보장' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>Q. {c.q}</p>
                <p style={{ fontSize: 16, color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-sans)', marginBottom: 4, letterSpacing: '-0.3px' }}>{c.a}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* 함께 쓰면 좋은 도구 */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/formation', icon: '⚽', name: '축구 포메이션 생성기', desc: '5·7·9·11인제 포메이션 + 명단 시각화·PNG 저장' },
              { href: '/tools/date/dday', icon: '📅', name: 'D-day 계산기', desc: '대회·경기 일정까지 남은 날짜' },
              { href: '/tools/sports/baseball-stats', icon: '⚾', name: '야구 타율 계산기', desc: '타율·OPS·ERA·WHIP + 리그 평균 비교' },
              { href: '/tools/sports/pace', icon: '🏃', name: '러닝 페이스 계산기', desc: '페이스↔완주 시간·구간 스플릿' },
            ].map((t) => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
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
    </ToolPage>
  )
}
