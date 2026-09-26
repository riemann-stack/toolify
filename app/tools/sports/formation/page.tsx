import Link from 'next/link'
import FormationClient from './FormationClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import { getFormationsByCount, positionLabel, ALL_FORMATIONS } from './formationData'

export const metadata = buildMetadata({
  path: '/tools/sports/formation',
  title: '축구 포메이션 생성기 — 4-3-3·4-4-2·5인제 풋살까지 라인업 시각화',
  description:
    '5·7·8·9·11인제 34개 포메이션 + 커스텀(4-2-3-1 등) 라인업을 그라운드 위에 시각화. 선수 카드 클릭으로 이름·번호 편집 + PNG 다운로드와 마크다운 공유.',
  keywords: [
    '축구 포메이션', '포메이션 만들기', '라인업 생성기', '풋살 포메이션',
    '4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '3-4-3',
    '8인제 포메이션', '초등 축구 포메이션', '9인제 포메이션', '7인제 축구', '5인제 풋살',
    '포메이션 그리기', '팀 라인업', '축구 명단 정리',
  ],
})

/* ── 표의 프리셋 목록·포지션 라벨은 도구 데이터(formationData)에서 빌드 시 생성 ── */
const RECOMMEND: Record<number, { label: string; pick: string; use: string }> = {
  11: { label: '11인 정규', pick: '4-3-3 · 4-2-3-1 · 4-4-2', use: '국제 표준 경기. 선수 구성에 따라 선택' },
  9: { label: '9인제', pick: '3-3-2 · 2-4-2', use: '해외 유소년 리그·일부 동호회 대회 형식' },
  8: { label: '8인제 (초등)', pick: '3-3-1 · 2-3-2', use: 'KFA 초등부 경기 형식(2019~). 68×48m, 전후반 각 20분(또는 15분)' },
  7: { label: '7인제', pick: '2-3-1 · 2-2-2', use: '동호회·사회인 축구. 공간이 좁아 좌우 전환이 빠름' },
  5: { label: '5인제 풋살', pick: '1-2-1 (다이아) · 2-2 (박스)', use: '다이아가 가장 흔함. 박스는 점유형' },
}
const COUNT_ROWS = [11, 9, 8, 7, 5].map((n) => ({ n, ...RECOMMEND[n], presets: getFormationsByCount(n).map((f) => f.name.replace(/\s*\(.*\)$/, '')) }))

const labelsOf = (lines: number[]) =>
  lines.map((c, li) => Array.from({ length: c }, (_, k) => positionLabel(lines, li, k)).join(' '))
const LABEL_ROWS = ['4-2-3-1', '3-5-2', '4-4-2', '8-3-3-1', '5-1-2-1'].map((id) => {
  const f = ALL_FORMATIONS.find((x) => x.id === id)!
  const total = 1 + f.lines.reduce((a, b) => a + b, 0)
  return { name: `${f.name.replace(/\s*\(.*\)$/, '')} (${total}인)`, lines: labelsOf(f.lines) }
})

const TH: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top' }
const ROW = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })
const TABLE: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 }

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
}

const FAQ_LD = [
  {
    q: '포메이션 표기 「4-3-3」은 어떻게 읽나요?',
    a: '<strong>골키퍼를 빼고</strong>, 뒤(수비)부터 앞(공격) 순으로 라인별 인원을 적습니다. 4-3-3은 수비 4 + 미드 3 + 공격 3(+ GK 1) = 11명, 4-2-3-1은 수비 4 + 수비형 미드 2 + 공격형 미드 3 + 원톱 1(+ GK 1) = 11명, 3-4-3은 스리백 3 + 미드 4 + 스리톱 3(+ GK 1) = 11명입니다. 같은 형식으로 「커스텀」 칸에 적으면 그대로 그려집니다.',
  },
  {
    q: '5인제 풋살에서 가장 많이 쓰는 포메이션은?',
    a: '<strong>1-2-1 다이아몬드</strong>가 가장 흔합니다. 골레이로(GK) 앞에 픽소(최후방) 1명, 좌우 알라 2명, 최전방 피보 1명이 사방으로 자리 잡아 공수 균형이 좋습니다. 이 도구에는 1-2-1(다이아), 2-2(박스 — 점유·짧은 패스), 2-1-1(수비형 Y자), 1-1-2(공격형 역Y자), 1-3(공격적)이 들어 있고, 풋살 포지션 이름(픽소·알라·피보)으로 자동 표시됩니다.',
  },
  {
    q: '등번호·이름은 어떻게 입력하나요?',
    a: '그라운드 위 <strong>선수 카드를 클릭</strong>하거나 아래 선수 명단의 행을 누르면 편집 창이 열립니다. 등번호를 비워 두면 GK 1번부터 자동 번호가 붙고, 이름은 카드 폭에 맞춰 6자(한 줄에 선수가 많아 카드가 좁으면 4자)를 넘으면 말줄임표로 줄여 표시합니다. 입력한 명단·포메이션·팀 색상은 이 브라우저에 자동 저장돼 다시 열어도 유지됩니다.',
  },
  {
    q: 'PNG로 저장한 이미지를 단톡에 어떻게 보내나요?',
    a: '「PNG 다운로드」를 누르면 <strong>1600 × 2000 픽셀</strong> 이미지가 저장되고, 파일명은 <code>팀이름-4-3-3.png</code> 형태입니다(공백은 밑줄로 바뀜). 카카오톡·디스코드·블로그에 그대로 첨부할 수 있고, 모바일에서는 다운로드 후 갤러리나 파일 앱의 공유 메뉴로 보내면 됩니다. 글로만 공유하려면 마크다운 복사를 쓰세요.',
  },
  {
    q: '초등부 축구는 몇 인제인가요? 대한축구협회(KFA) 규정에 맞나요?',
    a: '대한축구협회는 2019년부터 초등부 경기를 <strong>8인제(골키퍼 포함 8명)</strong>로 치릅니다. KFA <a href="https://www.kfa.or.kr/img_src/data_rule/kfa_regulationofthe8vs8game_202201.pdf" target="_blank" rel="noopener noreferrer">「8인제 경기 규칙」</a> 기준 경기장은 68×48m, 경기 시간은 전후반 각 20분(또는 15분)이며 교체 인원 제한이 없습니다. 도구의 8인 프리셋(3-3-1·2-3-2 등)으로 초등부 라인업을 짤 수 있습니다. 9인제는 해외 유소년 리그나 일부 동호회 대회에서 쓰는 형식이라 대회마다 규정이 다르니 대회 요강을 확인하세요.',
  },
  {
    q: '커스텀 포메이션은 어떤 형식까지 입력되나요?',
    a: '라인별 인원을 하이픈이나 공백으로 구분해 <strong>2~5개 라인</strong>까지 적을 수 있고, 각 라인은 1~10명입니다. 라인 합계는 반드시 <strong>총원 − 1(골키퍼 제외)</strong>과 같아야 해서, 11인제라면 4-2-3-1(합 10)은 되지만 4-4-3(합 11)은 &lsquo;라인 합계가 맞지 않는다&rsquo;는 안내가 뜹니다. 숫자 외 문자나 소수는 받지 않으며, 인원 수(11·9·8·7·5)를 바꾸면 합계가 달라지므로 커스텀 포메이션은 해제됩니다.',
  },
]

export default function FormationPage() {
  return (
    <ToolPage width={880} slug="/tools/sports/formation">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />축구 포메이션 생성기
      </h1>
      <p className="tp-lead">
        5·7·8·9·11인제 34개 포메이션을 <strong style={{ color: 'var(--text)' }}>그라운드 위에 시각화</strong>. 선수 카드 클릭으로 이름·번호 편집, PNG 다운로드로 단톡·블로그 공유.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="대회 결과·전술 트렌드는 2026 FIFA 북중미 월드컵 종료(2026-07-19) 기준, 대표팀 감독 체제는 2026-07-30 기준"
        sources={[
          { label: 'FIFA 공식 경기 리포트', href: 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026' },
          { label: 'FIFA Training Centre (기술연구그룹 분석)', href: 'https://www.fifatrainingcentre.com/' },
          { label: '대한축구협회 8인제 경기 규칙', href: 'https://www.kfa.or.kr/img_src/data_rule/kfa_regulationofthe8vs8game_202201.pdf' },
        ]}
      />

      <FormationClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 사용법 */}
        <section>
          <h2 className="g-h2">사용법 3단계</h2>
          <ol className="g-list">
            <li><strong>인원과 포메이션 선택</strong> — 11·9·8·7·5인 중 고르고 프리셋을 누르거나 커스텀 칸에 4-2-3-1처럼 적습니다.</li>
            <li><strong>선수 카드 클릭</strong>으로 등번호·이름을 편집합니다. 비워 두면 GK 1번부터 자동 번호가 붙습니다.</li>
            <li><strong>PNG 다운로드</strong>로 단톡·블로그에 공유하거나, 마크다운 복사로 텍스트 명단을 붙여 넣습니다.</li>
          </ol>
          <Callout tone="tip">
            입력한 명단·포메이션·등번호·팀 색상은 이 브라우저에 자동 저장돼 새로고침해도 유지됩니다. 전반·후반 라인업을 따로 쓰려면 하나를 PNG로 저장한 뒤 바꾸면 됩니다.
          </Callout>
          <p className="g-p">
            회사·동호회의 주말 라인업 공유, 초등부 8인제 코치진의 보드 자료, 풋살장 예약 팀의 사전 포지션 정리, 관전평·전술 분석 글의 시각 자료, 체육 수업의 팀 나누기처럼 &lsquo;누가 어디에 서는지&rsquo;를 한 장으로 전달해야 할 때 쓰기 좋습니다.
          </p>
        </section>

        {/* 2. 인원별 권장 포메이션 */}
        <section>
          <h2 className="g-h2">인원별 추천 포메이션</h2>
          <p className="g-p">
            인원이 줄면 경기장도 작아지고 라인 수도 줄어듭니다. 아래 &lsquo;도구 프리셋&rsquo; 열은 실제로 도구에서 한 번에 고를 수 있는 목록이며, 여기에 없는 배치는 커스텀으로 입력합니다.
          </p>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['인원', '추천', '특징·활용', '도구 프리셋'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {COUNT_ROWS.map((r, i) => (
                  <tr key={r.n} style={ROW(i)}>
                    <th scope="row" style={{ ...TD, fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{r.label}</th>
                    <td style={{ ...TD, whiteSpace: 'nowrap' }}>{r.pick}</td>
                    <td style={{ ...TD, color: 'var(--muted)' }}>{r.use}</td>
                    <td style={{ ...TD, color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{r.presets.length}개 — {r.presets.join(' · ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 포지션 라벨 규칙 */}
        <section>
          <h2 className="g-h2">포지션 라벨은 이렇게 붙습니다</h2>
          <p className="g-p">
            도구는 선수 카드마다 포지션 약어를 자동으로 붙입니다. 같은 3명이라도 어느 라인에 있느냐에 따라 이름이 달라집니다 — 미드 라인이 둘 이상이면 가장 뒤 라인은 1~3명일 때 수비형(DM), 4명이면 측면 미드(LM·RM)와 중앙 미드(CM)로, 공격 라인 바로 뒤는 1~3명일 때 공격형(AM·윙)으로 붙습니다. 예를 들어 4-3-2-1의 두 미드 라인은 LDM·CDM·RDM / LAM·RAM, 4-4-1-1은 LM·LCM·RCM·RM / CAM입니다. 스리백에서 5인 미드의 양 끝은 윙백(WB)으로 표시됩니다. 5인제는 풋살 용어(픽소·알라·피보)를 씁니다.
          </p>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['포메이션', '라인별 자동 라벨 (수비 → 공격, GK 제외)'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {LABEL_ROWS.map((r, i) => (
                  <tr key={r.name} style={ROW(i)}>
                    <th scope="row" style={{ ...TD, fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{r.name}</th>
                    <td style={{ ...TD, fontFamily: 'var(--font-sans)' }}>{r.lines.join('  /  ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. 주요 11인 포메이션 비교 */}
        <section>
          <h2 className="g-h2">주요 11인 포메이션 비교</h2>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['포메이션', '성격', '특징·대표 사례'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['4-4-2', '클래식', '측면 미드와 투톱의 역할이 명확한 균형의 정석. 알렉스 퍼거슨의 맨유 황금기'],
                  ['4-3-3', '현대 공격', '윙어 활용 + 중원 3인. 과르디올라의 바르셀로나, 클롭의 리버풀'],
                  ['4-2-3-1', '현대 표준', '수비형 미드 2명이 뒤를 받치고 공격형 미드 3명이 원톱을 지원. 2010년대 이후 클럽·대표팀에서 가장 널리 쓰인 시스템 중 하나'],
                  ['3-5-2', '스리백', '윙백의 공격 가담 + 투톱. 안토니오 콘테의 인테르'],
                  ['3-4-3', '공격적 스리백', '윙백 + 스리톱. 콘테의 첼시(2016-17 우승), 2002 한일 월드컵 히딩크호'],
                  ['5-4-1', '5백 카운터', '두 줄 수비로 공간을 잠그고 빠른 역습. 강팀 상대로 자주 쓰임'],
                  ['4-1-4-1', '수비 안정', '수비형 미드 1명이 포백 앞을 지키고 미드 4명이 폭을 확보. 점유와 안정을 함께 노림'],
                  ['3-6-1', '점유 압도', '미드 6명으로 중원 숫자 우위. 빌드업·점유 위주'],
                ].map((r, i) => (
                  <tr key={r[0]} style={ROW(i)}>
                    <th scope="row" style={{ ...TD, fontWeight: 800, textAlign: 'left', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', color: 'var(--accent-ink)' }}>{r[0]}</th>
                    <td style={{ ...TD, whiteSpace: 'nowrap' }}>{r[1]}</td>
                    <td style={{ ...TD, color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. 포지션 약어 */}
        <section>
          <h2 className="g-h2">포지션 약어 가이드</h2>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['약어', '풀네임 · 역할', '대표 선수'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['GK', 'Goalkeeper · 골키퍼', '김승규·조현우·노이어'],
                  ['CB', 'Center Back · 중앙 수비', '김민재·반다이크'],
                  ['LB/RB', 'Left/Right Back · 풀백', '이용·트렌트 알렉산더-아놀드'],
                  ['LWB/RWB', 'Wing Back · 스리백 시스템의 측면', '알폰소 데이비스·아슈라프 하키미'],
                  ['DM', 'Defensive Mid · 수비형 미드 (홀딩)', '로드리·조르지뉴'],
                  ['CM', 'Central Mid · 중앙 미드', '케빈 더브라위너·모드리치'],
                  ['AM', 'Attacking Mid · 공격형 미드', '이강인·외데가르'],
                  ['LM/RM', 'Left/Right Mid · 측면 미드', '황희찬'],
                  ['LW/RW', 'Left/Right Wing · 윙어', '손흥민·비니시우스·살라'],
                  ['ST/CF', 'Striker · 중앙 공격수', '해리 케인·홀란드·음바페'],
                ].map((r, i) => (
                  <tr key={r[0]} style={ROW(i)}>
                    <th scope="row" style={{ ...TD, fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{r[0]}</th>
                    <td style={TD}>{r[1]}</td>
                    <td style={{ ...TD, color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. 한국 축구 포메이션 흐름 */}
        <section>
          <h2 className="g-h2">한국 축구의 포메이션 흐름</h2>
          <p className="g-p">
            대한민국 대표팀의 주력 포메이션은 감독과 세대에 따라 바뀌어 왔습니다.
            클린스만 사임 후 황선홍·홍명보 체제에서 4-2-3-1을 표준으로 삼았지만,
            <strong>2026 북중미 월드컵 본선에서는 손흥민 원톱의 스리백 3-4-3</strong>을
            주 시스템으로 운용했습니다(체코전·남아공전 선발 모두 스리백 — 스포츠경향·이투데이 보도).
          </p>
          <p className="g-note">※ 대표팀 감독·주류 포메이션은 2026 월드컵 종료(2026-07) 기준이며 시기에 따라 달라질 수 있습니다.</p>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대회', '주력 포메이션', '특징'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['2002 한일 월드컵', '3-4-3', '거스 히딩크 — 공격적 스리백, 4강 (박지성·안정환·이영표 세대)'],
                  ['2010 남아공 월드컵', '4-4-2', '허정무 — 박주영·염기훈 투톱, 박지성·이청용 측면. 원정 첫 16강'],
                  ['2018 러시아 월드컵', '4-3-3 / 4-4-2', '신태용 — 스웨덴전 4-3-3 이후 손흥민을 투톱에 세운 4-4-2, 독일전 2-0 승'],
                  ['2022 카타르 월드컵', '4-2-3-1 / 4-4-2', '벤투 — 빌드업 강화, 황희찬·이강인·조규성. 16강'],
                  ['2024~2026 예선', '4-2-3-1 / 4-1-4-1', '대표팀 표준. 김민재·이강인·손흥민·황희찬'],
                  ['2026 북중미 월드컵', '3-4-3', '홍명보 — 손흥민 원톱 스리백. 체코전 2-1 승(16년 만의 1차전 승리) 후 멕시코·남아공에 0-1 연패, 1승 2패 조 3위로 32강 진출 실패(최종 34위)'],
                ].map((r, i) => (
                  <tr key={r[0]} style={ROW(i)}>
                    <th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 500, whiteSpace: 'nowrap' }}>{r[0]}</th>
                    <td style={{ ...TD, fontWeight: 700, whiteSpace: 'nowrap' }}>{r[1]}</td>
                    <td style={{ ...TD, color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            홍명보 감독은 32강 진출 실패의 책임을 지고 2026년 6월 29일 사퇴했습니다(뉴시스).
            대한축구협회는 7월 24일 이사회에서 후임을 감독+코칭스태프 사단 형태의 공개채용으로 뽑되,
            11월 A매치 윈도우까지는 임시감독 체제로 치르고 2027년 1월 아시안컵 전 정식 선임을 목표로 정했습니다
            — 2026년 7월 30일 현재 후임 미정.
          </p>

          <h3 className="g-h3">2026 월드컵이 보여준 세계 전술 트렌드</h3>
          <p className="g-p">
            우승팀 스페인은 골든볼 수상자 <strong>로드리를 단일 피벗으로 둔 점유 기반 4-3-3</strong>으로
            대회를 지배했고, 결승에서 같은 4-3-3의 아르헨티나를 연장 1-0(페란 토레스 106분 결승골)으로 꺾어
            2010년 이후 16년 만에 통산 두 번째 우승을 차지했습니다(FIFA.com 공식 경기 리포트).
            3위는 잉글랜드, 4위는 프랑스. FIFA 기술연구그룹(TSG)이 공식 분석에서 꼽은 대회 3대 트렌드는 다음과 같습니다(FIFA Training Centre).
          </p>
          <ol className="g-list">
            <li><strong>교체 자원의 영향력 확대</strong> — 조별리그에서 교체 투입 선수가 43골을 기록. 선발 11명만큼 벤치 구성이 중요해졌습니다.</li>
            <li><strong>카운터-프레싱 확산</strong> — 승리팀이 패배팀보다 평균 4초 빨리 볼을 재탈환. 소유권을 잃은 직후의 즉각 압박이 승패를 갈랐습니다.</li>
            <li><strong>골키퍼의 플레이메이커화</strong> — GK가 골킥을 직접 처리한 비율이 2018년 100% → 2022년 91% → 2026년 52%로 줄어, 골키퍼의 빌드업 관여가 크게 늘었습니다.</li>
          </ol>
          <p className="g-p">
            이와 함께 빌드업 국면에서 수비형 미드나 풀백을 내려 일시적으로 백3를 만드는 <strong>가변형 백3 빌드업</strong>과
            센터백-풀백 사이 인사이드 채널 공략도 주요 흐름으로 분석됐습니다(FIFA Training Centre 라운드 리뷰) —
            고정 스리백의 유행이 아니라 빌드업 국면의 가변 전환이라는 점이 특징입니다. 도구에서 같은 선수 명단으로 4-2-3-1과 3-4-3을 번갈아 그려 보면 이 전환이 어떤 자리 이동인지 한눈에 보입니다.
          </p>
        </section>

        {/* 7. 포메이션 선택 가이드 */}
        <section>
          <h2 className="g-h2">우리 팀 포메이션 선택 가이드</h2>
          <p className="g-p">동호회·청소년 팀이 포메이션을 고를 때는 아래 네 가지를 차례로 따져 보면 대부분 답이 나옵니다.</p>
          <ol className="g-list">
            <li><strong>선수 구성의 강점</strong> — 빠른 윙어가 많으면 4-3-3, 중앙 미드가 강하면 4-2-3-1, 단단한 수비와 역습이면 5-3-2.</li>
            <li><strong>경기장 크기</strong> — 7인제·풋살은 공간이 좁아 1-2-1 다이아·2-3-1이 유리하고, 11인제 정규 규격은 4-3-3·4-2-3-1이 무난합니다.</li>
            <li><strong>상대 강도</strong> — 약한 상대에는 공격적인 4-3-3·3-4-3, 강한 상대에는 수비적인 5-4-1·4-5-1.</li>
            <li><strong>체력 수준</strong> — 풀백·윙백의 오버래핑은 체력 소모가 큽니다. 동호회는 4-4-2·4-2-3-1, 초등부 8인제는 3-3-1·2-3-2가 무난합니다.</li>
          </ol>
        </section>

        {/* 8. 등번호 */}
        <section>
          <h2 className="g-h2">축구 등번호의 전통적 의미</h2>
          <p className="g-p">
            선발 11명이 1~11번을 달던 시절의 관습이 남아, 등번호는 지금도 <strong>포지션의 상징</strong>처럼 쓰입니다. 다만 번호와 포지션의 대응은 나라·팀·시대마다 달라서(예: 4번은 팀에 따라 중앙 수비수가 달기도, 수비형 미드필더가 달기도 합니다) 아래는 가장 흔한 관습일 뿐입니다. 도구는 등번호를 자유 입력으로 둡니다.
          </p>
          <div className="tableScroll">
            <table style={{ ...TABLE, minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['번호', '전통 포지션', '상징적인 선수'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1', '골키퍼', '노이어·부폰'],
                  ['2~5', '수비수 (2 RB · 3 LB · 4·5 CB — 나라별 차이 있음)', '—'],
                  ['6', '수비형 미드 / 중앙 수비', '프랑코 바레시·사비'],
                  ['7', '측면 공격 / 에이스', '호날두·손흥민'],
                  ['8', '중앙 미드 (박스 투 박스)', '제라드·램파드·이니에스타'],
                  ['9', '중앙 공격수', '호나우두·홀란드'],
                  ['10', '플레이메이커·팀 에이스', '펠레·마라도나·메시'],
                  ['11', '측면 공격·세컨드 스트라이커', '라이언 긱스·살라'],
                ].map((r, i) => (
                  <tr key={r[0]} style={ROW(i)}>
                    <th scope="row" style={{ ...TD, fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{r[0]}</th>
                    <td style={TD}>{r[1]}</td>
                    <td style={{ ...TD, color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 9. 라인업 작성 팁 */}
        <section>
          <h2 className="g-h2">라인업 작성 실전 팁</h2>
          <ul className="g-list">
            <li><strong>주전 + 후보 5~7명</strong> — 동호회는 출석 인원이 들쭉날쭉하니 포지션별 대체 자원을 미리 적어 둡니다.</li>
            <li><strong>좌우 발 균형</strong> — 왼발잡이를 왼쪽, 오른발잡이를 오른쪽에 두면 크로스·드리블 각도가 자연스럽습니다.</li>
            <li><strong>골키퍼를 가장 먼저 확정</strong> — GK 자원은 대체가 어려우니 모집 단계부터 챙깁니다.</li>
            <li><strong>연습 경기는 다양하게, 중요한 경기는 익숙하게</strong> — 친선전에서 4-3-3 ↔ 3-5-2 등을 시험하고, 토너먼트에서는 손에 익은 시스템을 씁니다.</li>
            <li><strong>전반·후반 분리 라인업</strong> — 체력 안배로 후반 포메이션을 바꿀 계획이면 PNG를 두 장 만들어 미리 공유합니다.</li>
          </ul>
        </section>

        <Faq items={FAQ_LD} />

        {/* 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/life/random" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎲</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>랜덤 추첨기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>팀 나누기·발표 순서</div>
            </Link>
            <Link href="/tools/sports/league-scenarios" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏆</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>축구 순위·승점 경우의 수</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>리그·토너먼트 운영</div>
            </Link>
            <Link href="/tools/sports/pace" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>러닝 페이스 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>체력 훈련 페이스</div>
            </Link>
            <Link href="/tools/sports/interval-training" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>⏱️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>인터벌 트레이닝</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>축구 체력 훈련</div>
            </Link>
            <Link href="/tools/sports/baseball-stats" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>⚾</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>야구 기록 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>스포츠 종합</div>
            </Link>
            <Link href="/tools/life/dutch" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍻</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>더치페이 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>모임 회식비 정산</div>
            </Link>
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
