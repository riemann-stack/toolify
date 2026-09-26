import Link from 'next/link'
import ParkGolfClient from './ParkGolfClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { DEFAULT_PARS_9, MAX_STROKES, scoreTerm, playerTotal, rankPlayers } from './parkGolfData'

export const metadata = buildMetadata({
  path: '/tools/sports/park-golf',
  title: '파크골프 스코어카드 — 9홀·18홀 점수 계산기',
  description: '파크골프 스코어카드 계산기 — 9홀 파33·18홀 파66, 최대 4인 동반 실시간 합계·순위 + OB 2벌타 규칙·라운드 기록 저장. 대한파크골프협회 경기규칙 기준.',
  keywords: [
    '파크골프 스코어카드', '파크골프 점수 계산', '파크골프 규칙', '파크골프 OB 벌타',
    '파크골프 파33', '파크골프 용어', '파크골프 스코어 기록', '파크골프장',
  ],
})

/* ── 예시 라운드 — 도구와 같은 함수(parkGolfData)로 빌드 시 계산 ── */
const PAR_SUM = DEFAULT_PARS_9.reduce((a, b) => a + b, 0)
const PAR_COUNT = [3, 4, 5].map((p) => ({ p, n: DEFAULT_PARS_9.filter((x) => x === p).length }))
const EX_A = [4, 3, 5, 5, 2, 4, 3, 6, 3] // 8번 홀: 티샷 OB(1타 + 2벌타) 후 3타 더 → 6타
const EX_B = [3, 3, 4, 4, 3, 5, 1, 4, 3] // 7번 홀(파3) 홀인원
const EX_TOT = [playerTotal(EX_A, DEFAULT_PARS_9), playerTotal(EX_B, DEFAULT_PARS_9)]
const EX_RANK = rankPlayers(EX_TOT)
// 진행 중 비교: A는 5홀, C는 4홀까지 입력 — 총타수는 C가 적지만 파 대비로는 A가 앞선다
const MID_A = playerTotal(EX_A.slice(0, 5), DEFAULT_PARS_9.slice(0, 5))
const MID_B = playerTotal([4, 4, 5, 4], DEFAULT_PARS_9.slice(0, 4))
const MID_RANK = rankPlayers([MID_A, MID_B])
const toParStr = (n: number) => (n === 0 ? 'E' : n > 0 ? `+${n}` : `${n}`)

const TH: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top' }
const TDN: React.CSSProperties = { ...TD, fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }
const ROW = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

const FAQ_LD = [
  {
    q: '파크골프 9홀은 파 몇인가요?',
    a: '표준 9홀은 <strong>파33 — 파3 홀 4개 + 파4 홀 4개 + 파5 홀 1개</strong> 구성입니다(국내·국제 공통). 18홀(2코스)은 파66이에요. 홀 길이는 국내 협회 계열 기준 파3 40~60m, 파4 60~100m, 파5 100~150m로 9홀 합계 500~790m이고, 국제파크골프협회(IPGA) 기준은 1홀 최대 100m·9홀 총 500m 이내로 더 짧습니다. 구장마다 홀 순서·배치가 다르니 위 스코어카드에서 홀별 파를 조정해 쓰세요.',
  },
  {
    q: 'OB가 나면 몇 벌타인가요?',
    a: '대한파크골프협회 경기규칙은 <strong>"모든 벌타는 2타"</strong> 체계라 OB도 2벌타입니다. 처리 방법은 공이 나간 것으로 추정되는 지점에서 깃대를 바라보고 서서 <strong>좌우 2클럽 이내, 홀컵에 가깝지 않은 곳</strong>에 공을 놓고 계속 칩니다(홀컵 쪽에 놓으면 추가 2벌타). 예를 들어 티샷이 OB면 티샷 1타 + 벌타 2타로 다음 샷이 4타째예요. 스코어카드에는 벌타를 합산한 총 타수를 적습니다.',
  },
  {
    q: '버디·이글 같은 용어를 파크골프에서도 쓰나요?',
    a: '네, 골프와 동일합니다. 기준 타수(파) 대비 <strong>−1 버디, −2 이글, −3 알바트로스, +1 보기, +2 더블보기</strong>이고, 파의 2배를 치면 더블파(속칭 양파)예요. 파크골프는 홀이 짧아 <strong>파4·파5에서도 홀인원이 실제로 나옵니다</strong> — 파4 홀인원은 −3으로 알바트로스와 같은 값이죠. 위 스코어카드는 입력하면 용어를 자동으로 표시해 줍니다.',
  },
  {
    q: '한 홀 최대 타수 제한(양파 컷)이 있나요?',
    a: '<strong>공식 경기규칙에는 최대 타수 제한이 없습니다</strong> — 원칙은 홀아웃(컵인)까지 치는 것이에요. 다만 진행 속도를 위해 대회위원회나 구장에서 <strong>더블파(파의 2배)에서 끊는 로컬룰</strong>을 두는 관행이 흔하고, 파+4로 정하는 곳도 있습니다. 위 스코어카드의 &lsquo;더블파 컷&rsquo; 옵션을 켜면 로컬룰대로 입력이 제한돼요.',
  },
  {
    q: '몇 명이 한 조로 치나요? 순서는요?',
    a: '경기규칙상 조 편성은 <strong>3~4명</strong>이 원칙입니다. 1번 홀 티샷 순서는 추첨(번호 뽑기 등)으로 정하고, <strong>2번 홀부터는 직전 홀에서 가장 적게 친 사람이 먼저</strong> 칩니다(아너·동타면 이전 순서 유지). 티샷은 반드시 티 위에 공을 올려서 치고, 조원 전원이 홀아웃할 때까지 그린 주변에서 기다리는 게 매너이자 규칙이에요.',
  },
  {
    q: '파크골프 클럽과 공 규격은요?',
    a: '클럽은 <strong>1자루만</strong> 사용합니다(경기규칙 제7조) — 전장 86cm 이하, 무게 600g 이하, 헤드는 목재. 시판품 실중량은 440~565g대예요. 공은 <strong>지름 6cm, 무게 80~95g</strong>의 합성수지 재질(물에 뜹니다). 골프처럼 클럽을 바꿔 드는 게임이 아니라 한 자루로 티샷부터 퍼팅까지 해결하는 것이 파크골프의 핵심 재미입니다.',
  },
  {
    q: '전국에 파크골프장이 얼마나 있나요?',
    a: '대한파크골프협회 집계 기준 <strong>2025년 7월 말 약 490개소</strong>로, 2020년(254개소)의 약 2배로 늘었습니다(비공인 구장 포함 1,000여 개소 추산 보도도 있어요). 협회 등록 회원은 2025년 약 23만 명에 도달했고, 비등록 동호인까지 포함하면 50만~100만 명 수준으로 추정하는 보도가 있습니다(공식 통계는 없음). 60대 이상에게 무릎 부담이 적은 생활체육으로 인기가 높아요.',
  },
]

const RELATED = [
  { href: '/tools/sports/golf-handicap', icon: '⛳', name: '골프 핸디캡 계산기', desc: '라운드 기록 핸디 산출' },
  { href: '/tools/sports/golf-distance', icon: '🏌️', name: '골프 거리 계산기', desc: '클럽별 비거리 관리' },
  { href: '/tools/sports/golf-cost', icon: '💰', name: '골프 비용 계산기', desc: '라운드 비용 정산' },
  { href: '/tools/sports/hiking-time', icon: '⛰️', name: '등산 시간 계산기', desc: '코스별 소요 시간' },
  { href: '/tools/life/dutch', icon: '🍻', name: '더치페이 계산기', desc: '라운드 후 정산' },
  { href: '/tools/health/heat-hydration', icon: '💧', name: '폭염 수분 계산기', desc: '야외 운동 수분 보충' },
]

export default function ParkGolfPage() {
  return (
    <ToolPage width={760} slug="/tools/sports/park-golf">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />파크골프 스코어카드
      </h1>
      <p className="tp-lead">
        9홀 파33부터 18홀까지 — <strong style={{ color: 'var(--text)' }}>최대 4인 실시간 합계·순위</strong>에 라운드 기록 저장까지. 종이 스코어카드는 이제 그만.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="대한파크골프협회 경기규칙 (파 구성·OB 2벌타·조 편성) + IPGA 코스 기준"
        sources={[
          { label: '대한파크골프협회', href: 'https://www.kpga7330.com' },
        ]}
      />

      <ParkGolfClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 계산 방식 */}
        <section>
          <h2 className="g-h2">스코어카드는 이렇게 계산합니다</h2>
          <p className="g-p">
            홀마다 <strong>벌타까지 포함한 총 타수</strong>를 적으면 합계·파 대비 점수·순위가 바로 갱신됩니다. 각 칸의 ＋를 처음 누르면 그 홀의 파 타수부터 시작해 입력이 빠르고, 한 홀은 최대 {MAX_STROKES}타까지 기록됩니다. 홀별 파는 3~5 사이에서 바꿀 수 있어 구장마다 다른 홀 배치를 그대로 옮길 수 있습니다.
          </p>
          <ul className="g-list">
            <li><strong>합계</strong> — 입력한 홀의 타수를 모두 더합니다. 18홀이면 전반(1~9홀)·후반(10~18홀) 합을 괄호로 함께 보여 줍니다.</li>
            <li><strong>파 대비</strong> — 합계에서 <strong>입력한 홀들의 파 합</strong>을 뺀 값입니다. 0이면 E(이븐), 음수면 언더, 양수면 오버입니다.</li>
            <li><strong>순위</strong> — 총타수가 아니라 파 대비 점수로 매깁니다. 같은 점수면 공동 순위이고, 아직 입력이 없는 사람은 순위에서 빠집니다.</li>
            <li><strong>더블파 컷</strong> — 켜면 각 홀 타수가 파의 2배를 넘지 않게 잘립니다. 켜는 순간 이미 적은 점수와 이후 파를 낮춘 홀에도 소급 적용됩니다.</li>
          </ul>
          <p className="g-p">
            순위를 파 대비로 매기는 이유는 진행 중 비교 때문입니다. 예를 들어 A가 5홀까지 {MID_A.total}타({toParStr(MID_A.toPar)}), C가 4홀까지 {MID_B.total}타({toParStr(MID_B.toPar)})라면 총타수로는 C가 앞서 보이지만 그건 한 홀을 덜 쳤기 때문입니다. 파 대비로 비교하면 A {MID_RANK[0]}위, C {MID_RANK[1]}위가 되고, 모두가 같은 홀을 마치면 총타수 순위와 같아집니다.
          </p>
        </section>

        {/* 2. 예시 라운드 */}
        <section>
          <h2 className="g-h2">예시 라운드 — 표준 9홀 파{PAR_SUM}</h2>
          <p className="g-p">
            도구의 기본 홀 배치(파 {DEFAULT_PARS_9.join('·')})로 두 사람이 친 라운드를 스코어카드에 넣으면 아래처럼 표시됩니다. A의 8번 홀은 티샷이 OB가 나 1타 + 2벌타로 3타를 쓴 뒤, 처치한 공으로 3타 만에 컵인해 총 6타(더블보기)입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 360 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['홀', '파', 'A', 'B'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {DEFAULT_PARS_9.map((par, h) => (
                  <tr key={h} style={ROW(h)}>
                    <th scope="row" style={{ ...TDN, textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h + 1}</th>
                    <td style={TDN}>{par}</td>
                    {[EX_A[h], EX_B[h]].map((sc, k) => (
                      <td key={k} style={TDN}>
                        <strong>{sc}</strong> <span style={{ color: 'var(--muted)', fontSize: 12 }}>{scoreTerm(sc, par)?.label}</span>
                      </td>
                    ))}
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--border)' }}>
                  <th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 700 }}>합계</th>
                  <td style={{ ...TDN, fontWeight: 700 }}>{PAR_SUM}</td>
                  {EX_TOT.map((t, k) => (
                    <td key={k} style={{ ...TDN, fontWeight: 700, color: 'var(--accent-ink)' }}>
                      {t.total}타 ({toParStr(t.toPar)}) · {EX_RANK[k]}위
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="g-note">
            B의 7번 홀처럼 1타 만에 넣으면 파와 관계없이 &lsquo;홀인원&rsquo;으로 표시됩니다(파3 홀인원 = −2, 파4 홀인원 = −3).
          </p>
        </section>

        {/* 3. 스코어 용어 */}
        <section>
          <h2 className="g-h2">스코어 용어 — 골프와 똑같아요</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 400 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['파 대비', '명칭', '파4 홀 기준'].map((h) => (
                    <th scope="col" key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['−3', '알바트로스', '1타 (홀인원)'],
                  ['−2', '이글', '2타'],
                  ['−1', '버디', '3타'],
                  ['0', '파', '4타'],
                  ['+1', '보기', '5타'],
                  ['+2', '더블보기', '6타'],
                  ['파×2', '더블파 (양파)', '8타'],
                ].map((r, i) => (
                  <tr key={i} style={ROW(i)}>
                    <td style={{ ...TDN, color: 'var(--accent-ink)', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ ...TD, fontWeight: 600 }}>{r[1]}</td>
                    <td style={{ ...TD, color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            파크골프는 홀이 짧아 파4·파5 홀인원도 실제로 나옵니다 — 파4 홀인원은 −3으로 알바트로스와 같은 값이에요.
          </p>
        </section>

        {/* 4. OB 규칙 */}
        <section>
          <h2 className="g-h2">OB 처리 3단계 — 스코어가 갈리는 지점</h2>
          <ol className="g-list">
            <li><strong>2벌타 가산</strong> — 협회 규칙상 모든 벌타는 2타입니다. OB가 확인되면 지금까지 친 타수에 2벌타를 더합니다. 티샷 OB면 1 + 2 = 3타를 쓴 셈입니다.</li>
            <li><strong>처치 위치</strong> — 공이 나간 것으로 추정되는 지점에서 깃대를 보고 서서 좌우 2클럽 이내, 홀컵에 가깝지 않은 곳에 공을 놓습니다.</li>
            <li><strong>다음 샷 계산</strong> — 티샷 OB라면 처치 후 치는 샷이 4타째입니다. 그 샷이 바로 컵인되면 총 4타 — 파4 홀이면 파로 기록됩니다.</li>
          </ol>
          <Callout tone="warn">
            처치한 공을 홀컵 쪽(전방)에 놓으면 추가 2벌타가 붙습니다. 벌타는 별도 칸이 아니라 그 홀의 타수에 합산해 적으세요.
          </Callout>
        </section>

        {/* 5. 코스 규격 */}
        <section>
          <h2 className="g-h2">코스 규격 — 국내 기준 vs 국제 기준</h2>
          <p className="g-p">
            파는 홀 길이로 정해집니다. 표준 9홀 파{PAR_SUM}의 구성과 파별 홀 길이 기준은 아래와 같고, 국제 기준(IPGA·일본 NPGA)은 같은 파 구성을 더 짧은 코스에 담습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['파', '표준 9홀 개수', '국내 협회 계열 홀 길이', '국제(IPGA)'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {PAR_COUNT.map(({ p, n }, i) => (
                  <tr key={p} style={ROW(i)}>
                    <th scope="row" style={{ ...TDN, textAlign: 'left', fontWeight: 700 }}>파{p}</th>
                    <td style={TDN}>{n}개</td>
                    <td style={TDN}>{p === 3 ? '40~60m' : p === 4 ? '60~100m' : '100~150m'}</td>
                    <td style={{ ...TD, color: 'var(--muted)' }}>1홀 최대 100m</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--border)' }}>
                  <th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 700 }}>9홀 합</th>
                  <td style={{ ...TDN, fontWeight: 700 }}>파{PAR_SUM}</td>
                  <td style={TDN}>500~790m (확장형 허용)</td>
                  <td style={{ ...TD, color: 'var(--muted)' }}>총 500m 이내</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. 자주 틀리는 기록 */}
        <section>
          <h2 className="g-h2">스코어를 적을 때 자주 틀리는 부분</h2>
          <ul className="g-list">
            <li><strong>벌타를 따로 적기</strong> — 종이 카드 습관으로 벌타를 옆에 메모만 하고 합계에서 빠뜨리는 경우가 많습니다. OB 한 번이면 그 홀 타수에 바로 +2를 더하세요.</li>
            <li><strong>구장 배치를 그대로 두기</strong> — 기본값은 표준 파 배열일 뿐, 1번 홀이 파3인 구장도 흔합니다. 첫 홀을 치기 전에 구장 안내판대로 파를 맞춰야 파 대비 점수가 맞습니다.</li>
            <li><strong>더블파 컷을 공식 규칙으로 착각</strong> — 컷은 진행 속도를 위한 로컬룰입니다. 대회라면 요강에 컷 규정이 있는지 확인하고, 없으면 컵인까지의 실제 타수를 적습니다.</li>
            <li><strong>중간 순위를 총타수로 비교</strong> — 동반자마다 입력한 홀 수가 다르면 총타수는 공정하지 않습니다. 리더보드의 파 대비 점수와 &lsquo;입력한 홀 수/전체 홀&rsquo; 표시를 함께 보세요.</li>
          </ul>
          <p className="g-p">
            라운드를 저장하면 날짜·구장·홀 수·인원과 베스트 스코어가 이 브라우저에 최근 30개까지 남습니다. 같은 구장의 기록을 쌓아 두면 홀별로 어디서 타수를 잃는지 비교하기 쉽습니다. 공식 대회 기록은 대회 규정과 경기위원 판정이 우선합니다.
          </p>
        </section>

        {/* 7. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 8. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {RELATED.map((t, i) => (
              <Link key={i} href={t.href} style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', textDecoration: 'none' }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
