import Link from 'next/link'
import FootballPointsClient from './FootballPointsClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/sports/football-points',
  title: '축구 승점 계산기 — K리그·EPL 순위 시나리오·우승 가능성',
  description:
    '남은 경기 시나리오로 목표 승점 달성 가능성 + 라이벌 추격 자동 계산. 득실차·승무패 조합까지.',
  keywords: ['축구승점계산기', 'K리그승점', 'EPL승점', '승점계산', '리그순위계산기', '우승가능성계산', '축구시뮬레이션'],
})

const FAQ_LD = [
              {
                q: '승점이 같을 때 순위는 어떻게 정해지나요?',
                a: '유럽 주요 리그는 1차 <strong>득실차</strong>, 2차 <strong>다득점</strong> 순으로 결정합니다. EPL과 분데스리가가 이 방식입니다. 반면 <strong>K리그는 2016년부터 다득점을 득실차보다 먼저</strong> 적용합니다(승점 → 다득점 → 득실차 → 다승 순, 공격 축구 장려 취지). 라리가는 <strong>head-to-head(상대 전적)</strong>를 먼저 적용합니다. 리그마다 다르므로 해당 리그 규정을 확인하세요.',
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

export default function FootballPointsPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        스포츠
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="sports" />축구 승점 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        남은 경기 시나리오로 목표 승점 달성 가능성 + <strong style={{ color: 'var(--text)' }}>라이벌 추격</strong> 자동 계산.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="EPL 2016-17~2025-26 · K리그1 2016~2025 최종 순위표 실측 승점"
        sources={[
          { label: 'Premier League 공식 순위표', href: 'https://www.premierleague.com/en/tables' },
          { label: 'K리그 공식 기록', href: 'https://www.kleague.com/record/team.do' },
        ]}
      />

      <FootballPointsClient />

      {/* 본문 광고 — 도구 결과 직후 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 축구 승점 시스템 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            축구 승점 시스템 가이드
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 18px',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 1.85,
          }}>
            <p style={{ marginBottom: 10 }}>
              <strong style={{ color: 'var(--accent)' }}>현대 표준 (3-1-0)</strong> — 승 3점 / 무 1점 / 패 0점.
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.85 }}>
              1981년 잉글랜드 1부 리그(현 EPL의 전신)에서 처음 도입되었으며, 1994년 미국 월드컵부터 FIFA가 공식 채택하면서 전 세계 표준이 되었습니다.
              이전에는 <strong style={{ color: 'var(--text)' }}>2-1-0 시스템</strong>(승 2점)이 사용되었으나, 무승부 가치가 너무 높아 수비적 경기가 늘어나자 “공격 축구를 장려하라”는 명분으로 승점 가치를 1점 더 높였습니다.
            </p>
          </div>
        </div>

        {/* ── 2. EPL·K리그1 최근 10시즌 실측 우승·강등 승점 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            EPL·K리그1 최근 10시즌 — 실제 우승·강등 승점
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            “몇 점이면 우승, 몇 점이면 강등”을 추정치가 아닌 <strong style={{ color: 'var(--text)' }}>최종 순위표 실측값</strong>으로 정리했습니다.
            EPL은 20팀 38경기, K리그1은 12팀 38경기(2020년 제외) 기준입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['EPL 시즌', '우승팀', '우승 승점', '18위(강등)', '18위 승점'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
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
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.y}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.c}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.cp}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--danger)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.rp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['K리그1 시즌', '우승팀', '우승 승점', '12위(직행 강등)', '12위 승점'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
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
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.y}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.c}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.cp}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--danger)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.rp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px 18px',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 1.8,
            marginTop: 12,
          }}>
            표에서 곧바로 계산되는 기준선 — EPL 우승 평균 <strong style={{ color: 'var(--accent)' }}>91.8점</strong>(최저 84·최고 100),
            18위 평균 <strong>32.2점</strong>(최저 25·최고 39). K리그1은 38경기 시즌 기준 우승 평균 <strong style={{ color: 'var(--accent)' }}>76.6점</strong>,
            12위는 27~39점에 분포합니다. “40점이면 잔류”라는 통설과 달리 2025-26 웨스트햄은 39점으로도 강등됐고, 2024 K리그1 인천도 39점으로 최하위였습니다.
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 2020 K리그1은 코로나19로 27경기 단축 시즌. 2019년은 전북·울산이 나란히 79점으로 마쳐 보조 지표로 우승이 갈렸습니다.
            2016년 전북은 심판 매수 사건 승점 9점 감점으로 67점 2위. K리그1 12위는 자동 강등이며, 10·11위는 별도 승강 플레이오프를 치릅니다.
          </p>
        </div>

        {/* ── 3. 순위 결정 기준 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            순위 결정 기준 (Tie-Breaker)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            대부분의 리그가 승점이 동률일 때 아래 순서로 순위를 가르지만, <strong style={{ color: 'var(--text)' }}>리그마다 우선순위가 다릅니다.</strong>
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <ol style={{ paddingLeft: 22, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
              <li><strong>1차</strong> — 승점</li>
              <li><strong>2차</strong> — 득실차 (득점 − 실점)</li>
              <li><strong>3차</strong> — 다득점 (Goals For)</li>
              <li><strong>4차</strong> — 상대 전적 (Head-to-Head)</li>
              <li><strong>5차</strong> — 원정 다득점</li>
              <li><strong>6차</strong> — 추첨 또는 플레이오프</li>
            </ol>
          </div>
          <div style={{
            background: 'rgba(8,145,178,0.06)',
            border: '1px solid rgba(8,145,178,0.2)',
            borderRadius: '12px',
            padding: '14px 18px',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 1.8,
            marginTop: 12,
          }}>
            <strong style={{ color: '#0891B2' }}>리그별 차이</strong> — EPL·분데스리가는 <strong>득실차 → 다득점</strong> 순서이지만,
            <strong> K리그는 2016년부터 다득점 → 득실차</strong> 순서(공격 축구 장려 취지)를 적용하고,
            라리가는 <strong>head-to-head 우선</strong> 적용으로 시즌 막판 동률 다툼에서 결과가 자주 갈립니다.
          </div>
        </div>

        {/* ── 4. K리그1 파이널 라운드 승점 계산 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            K리그1 파이널 라운드 — 승점 계산이 달라지는 지점
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            K리그1은 유럽 리그처럼 38경기를 한 번에 돌지 않고 <strong style={{ color: 'var(--text)' }}>시즌을 두 단계로 나눕니다.</strong>
            정규 33라운드(11개 상대와 3번씩 맞대결) 후 1~6위는 파이널A, 7~12위는 파이널B로 분리되어 같은 그룹 팀과만 5경기를 더 치릅니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
              <li><strong>승점 전액 승계</strong> — 33라운드까지 쌓은 승점·득실을 그대로 안고 파이널 라운드를 진행합니다.</li>
              <li><strong>그룹 간 역전 불가</strong> — 파이널B 팀이 승점을 더 쌓아도 최종 순위는 7위가 상한. 우승·ACL 경쟁은 33라운드 종료 시점에 6위 안에 들어야 시작됩니다.</li>
              <li><strong>강등 구조</strong> — 12위 직행 강등, 10·11위는 K리그2 팀과 승강 플레이오프. 한 시즌 최대 3팀이 교체됩니다.</li>
            </ul>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.8 }}>
            그래서 K리그1 잔류 계산은 “승점 몇 점”보다 <strong style={{ color: 'var(--text)' }}>“파이널B를 몇 위로 마치느냐”</strong>가 핵심입니다.
            파이널B에서는 강등 경쟁팀끼리 직접 맞붙어 한 경기가 사실상 6점짜리가 되고, 승강 PO라는 변수가 하나 더 붙습니다.
            실제로 2024년 전북(10위·42점)과 대구(11위·40점)는 승강 PO에서 이겨 잔류했지만, 2025년 수원FC는 같은 42점(10위)으로도 PO에서 패해 강등됐습니다.
            계산기에 33라운드 시점 승점과 남은 경기 5를 넣고 경쟁팀을 라이벌로 설정하면 파이널B 시나리오를 그대로 시뮬레이션할 수 있습니다.
          </p>
        </div>

        {/* ── 5. PPG로 최종 승점 예측 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            경기당 승점(PPG)으로 최종 승점 예측하기
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            시즌 중반에 “이 페이스면 몇 점으로 끝날까”를 가장 빠르게 어림하는 방법이 <strong style={{ color: 'var(--text)' }}>경기당 평균 승점(PPG, Points Per Game)</strong> 환산입니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <ol style={{ paddingLeft: 22, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
              <li><strong>1단계</strong> — PPG = 현재 승점 ÷ 치른 경기 수. 예: 20경기 32점 → 32 ÷ 20 = <strong style={{ color: 'var(--accent)' }}>1.60</strong></li>
              <li><strong>2단계</strong> — 예상 최종 승점 = PPG × 시즌 전체 경기 수. 예: 1.60 × 38 = 60.8 → <strong style={{ color: 'var(--accent)' }}>약 61점</strong></li>
              <li><strong>3단계</strong> — 위 실측 표와 비교. 61점은 잔류에는 넉넉하지만 우승 페이스(EPL 평균 91.8점 = PPG 2.42)에는 크게 못 미치는 수준입니다.</li>
            </ol>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.8 }}>
            기준 PPG — 38경기 리그에서 <strong style={{ color: 'var(--text)' }}>EPL 우승 평균 91.8점은 PPG 2.42</strong>,
            K리그1 우승 평균 76.6점은 PPG 2.01, EPL 18위(강등) 평균 32.2점은 PPG 0.85입니다.
            PPG 1.05(38경기 환산 40점) 이상을 유지하면 최근 10시즌 어떤 EPL 강등팀보다 높은 페이스입니다.
            다만 PPG는 남은 일정의 난이도를 반영하지 못하는 참고치이므로, 확정 계산은 계산기에 현재 승점·남은 경기 수·목표 승점을 넣어
            승무패 조합으로 확인하세요. 위 예시라면 남은 18경기에서 29점(9승 2무 이상)을 더해야 61점에 도달합니다.
          </p>
        </div>

        {/* ── 6. 자주 검색되는 시나리오 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 검색되는 시나리오 예시
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            {[
              { q: 'EPL에서 우승하려면 몇 점 필요?', a: '최근 10시즌 평균 91.8점',          sub: '최저 리버풀 84점(2024-25) · 최고 맨시티 100점(2017-18)' },
              { q: 'K리그1 잔류하려면?',              a: '12위 직강 승점 27~39점(38경기 기준)', sub: '10·11위 승강 PO — 2025년엔 42점(수원FC)도 PO 강등' },
              { q: '챔피언스리그 진출권 (EPL)',       a: '1~4위 — 보통 65~70점',              sub: '리그 성과 순위로 5위도 진출 가능 (2025-26 리버풀)' },
              { q: '수학적 우승 확정이란?',            a: '필요 승점 = 라이벌 최대 승점 + 1', sub: '남은 경기 결과와 무관하게 1위 보장' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>Q. {c.q}</p>
                <p style={{ fontSize: 16, color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', marginBottom: 4, letterSpacing: '-0.3px' }}>{c.a}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 무승부 가치 전략 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎯 승점 활용 전략 — 무승부 가치
          </h2>
          <div style={{
            background: 'rgba(14,165,233,0.05)',
            border: '1px solid rgba(14,165,233,0.25)',
            borderRadius: '12px',
            padding: '16px 18px',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 1.9,
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
              하지만 강팀 상대로 무승부는 <strong style={{ color: 'var(--text)' }}>사실상 승점 획득</strong>입니다. 시즌 막판 “0:0 무승부도 1점은 1점”이라는 말이 나오는 이유입니다. 강등권 팀들은 강팀 원정에서 무승부만 거둬도 잔류 확률이 크게 올라갑니다.
            </p>
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/formation',      icon: '⚽', name: '축구 포메이션 생성기', desc: '5·7·9·11인제 포메이션 + 명단 시각화·PNG 저장' },
              { href: '/tools/date/dday',             icon: '📅', name: 'D-day 계산기',           desc: '다음 경기·시즌 종료까지 D-day' },
              { href: '/tools/life/random',           icon: '🎲', name: '랜덤 추첨기',             desc: '대진표·순서 무작위 추첨' },
              { href: '/tools/sports/baseball-stats', icon: '⚾', name: '야구 타율 계산기',       desc: '타율·OPS·ERA·WHIP + 리그 평균 비교' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
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
