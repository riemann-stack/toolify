import Link from 'next/link'
import HolidayTableClient from './HolidayTableClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import { HOLIDAYS, calcRows, type HolidayId, type FormatId } from './holidayData'

export const metadata = buildMetadata({
  path: '/tools/cooking/holiday-table',
  title: '명절 상차림 계산기 — 설날·추석·제사 인원별 품목·비용 자동',
  description:
    '명절(설날·추석·제사) × 차례상·간소 차림·식사 위주 + 인원만 입력하면 떡국떡·갈비·전·나물·과일 등 35종 품목별 수량과 비용 자동 계산. 주요 농산물 KAMIS 실시간 시세 + 5열 차례상 배치 가이드.',
  keywords: [
    '명절 상차림', '차례상', '제사상', '설날 차례', '추석 차례',
    '명절 비용', '제사 비용', '차례상 차림', '5열 차례상',
    '어동육서', '홍동백서', '조율이시', '명절 장보기', 'KAMIS 시세',
    '설날 떡국', '추석 송편', '제사 음식',
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
}

/* 가이드 비용표 — 계산기와 같은 calcRows(기본 단가, 실시간 시세 미반영)로 빌드 시 생성 */
const won = (n: number) => `${n.toLocaleString('ko-KR')}원`
const sumWon = (h: HolidayId, f: FormatId, people: number) => calcRows(h, f, people).reduce((s, r) => s + r.totalPriceWon, 0)
const COST_ROWS = (['seol', 'chuseok', 'jesa'] as HolidayId[]).flatMap(h =>
  (['formal', 'simple', 'meal'] as FormatId[]).map(f => {
    const rows = calcRows(h, f, 4)
    const total = rows.reduce((s, r) => s + r.totalPriceWon, 0)
    const meat = rows.filter(r => r.item.category === '정육').reduce((s, r) => s + r.totalPriceWon, 0)
    return { key: `${h}-${f}`, holiday: HOLIDAYS[h].name, format: HOLIDAYS[h].formats[f].name, count: rows.length, total, meatPct: total > 0 ? Math.round((meat / total) * 100) : 0 }
  }),
)
const PER_PERSON = [1, 2, 4, 8, 12].map(n => ({ n, total: sumWon('chuseok', 'formal', n) }))
const SEOL_FORMAL = sumWon('seol', 'formal', 4)
const SEOL_SIMPLE = sumWon('seol', 'simple', 4)
const CHU_FORMAL = sumWon('chuseok', 'formal', 4)
const CHU_SIMPLE = sumWon('chuseok', 'simple', 4)
const CHU_MEAL = sumWon('chuseok', 'meal', 4)
const GALBI_4 = calcRows('seol', 'formal', 4).find(r => r.item.id === 'galbi_beef')?.totalPriceWon ?? 0
const man = (n: number) => `약 ${Math.round(n / 10000)}만 원`
const cutPct = (from: number, to: number) => Math.round((1 - to / from) * 100)

const FAQ_LD = [
  {
    q: '4인 가족 설날 차례상 비용은 보통 얼마인가요?',
    a: `<strong>aT(한국농수산식품유통공사)</strong>가 2026년 2월 6일 조사한 4인 가족 설 차례상 비용은 평균 <strong>약 20만 3천 원</strong>(전통시장 약 18만 5천 원, 대형유통업체 약 22만 8천 원)이었습니다. aT 조사는 24개 품목 기준이라 품목 구성이 본 도구와 다릅니다. 본 도구로 「설날 + 차례상 + 4인」을 계산하면 갈비찜·전 3종 등을 넉넉히 넣은 정석 기준이라 <strong>${man(SEOL_FORMAL)}</strong>, 간소 차림은 <strong>${man(SEOL_SIMPLE)}</strong>입니다(기본 단가 기준). 명절 직전 시세가 오르면 더 나올 수 있으니 계산기의 「최신 시세」로 확인하세요.`,
  },
  {
    q: '차례상에서 빼면 안 되는 음식은?',
    a: `전통적으로는 설날 <strong>떡국</strong>, 추석 <strong>송편</strong>, 제사 <strong>메·갱(밥·국)</strong>과 술이 중심이고, 과일·나물을 곁들입니다. 성균관 의례정립위원회가 2022년 9월 발표한 차례상 표준안은 <strong>송편·나물·구이(적)·김치·과일·술</strong> 6가지를 기본으로 제시했고, 여유가 있으면 육류·생선·떡을 더해도 되지만 <strong>9가지를 넘지 않게</strong> 하라고 했습니다. 기름에 부치거나 튀긴 전은 올리지 않아도 된다는 것도 이때 나온 설명입니다. 설날에는 송편 자리에 떡국을 두면 됩니다.`,
  },
  {
    q: '명절 비용을 줄이는 가장 효과적인 방법은?',
    a: `<strong>가짓수를 줄이는 것</strong>이 가장 큽니다. 본 도구 기준 4인 추석 차림은 정석 ${man(CHU_FORMAL)} → 간소 ${man(CHU_SIMPLE)}으로 약 ${cutPct(CHU_FORMAL, CHU_SIMPLE)}% 줄어듭니다. 구매처는 명절마다 유불리가 바뀝니다 — aT 조사에서 2026년 설은 전통시장이 대형유통업체보다 약 19% 쌌지만, 같은 해 추석은 정부 할인 지원과 유통업체 할인으로 대형유통업체(약 19만 2천 원)가 전통시장(약 19만 6천 원)보다 조금 쌌습니다. 그 밖에 <strong>곶감·밤·대추·건고사리처럼 저장성 있는 품목은 미리</strong>, 시금치 같은 엽채류는 직전에 사고, 전통시장 온누리상품권 환급 행사처럼 명절 한정 지원이 있는지 확인하세요. 광고지 가격은 계산기의 단가 칸에 직접 넣어 비교할 수 있습니다.`,
  },
  {
    q: '차례상에 올리지 않는다는 음식이 있나요?',
    a: '전해 오는 관행으로는 <strong>복숭아</strong>(귀신을 쫓는 과일로 여김), 이름이 &lsquo;치&rsquo;로 끝나는 <strong>꽁치·삼치·갈치</strong>, <strong>고춧가루·마늘</strong>로 진하게 양념한 음식, <strong>붉은팥</strong>(흰 고물 사용)을 피합니다. 법이나 예서에 정해진 규칙이 아니라 지역·가문마다 다른 관행입니다. 본 도구의 차례상(정석·간소) 구성은 이 관행에 따라 마늘을 넣지 않았고, 식사 위주·음복 식사는 일반 가정식이라 마늘이 들어갑니다.',
  },
  {
    q: '4인 가족 추석 차례상과 식사 위주 비용은 얼마나 차이 나나요?',
    a: `본 도구 기준(4인, 기본 단가): <strong>추석 차례상(정석) ${man(CHU_FORMAL)}</strong>, 간소 차림 ${man(CHU_SIMPLE)}, 식사 위주 ${man(CHU_MEAL)}입니다. 정석 차림은 어동육서·조율이시 격식에 맞춰 여러 종류를 조금씩 갖춰야 해서 비쌉니다. 참고로 aT가 2026년 9월 18일 조사한 4인 가족 추석 차례상 비용은 평균 <strong>19만 6,630원</strong>(전통시장 19만 5,911원, 대형유통업체 19만 1,511원)으로 지난해보다 1.5% 내렸습니다. aT 조사는 24개 품목 기준이라 갈비찜(4인 약 ${won(GALBI_4)})을 넣은 본 도구의 정석 차림보다 낮게 나옵니다.`,
  },
  {
    q: '인원이 적으면 1인당 비용이 왜 더 비싼가요?',
    a: `사과·배·조기·애호박처럼 <strong>낱개로 사는 품목은 올림</strong>해서 계산하기 때문입니다. 추석 차례상(정석)을 1명 분량으로 계산하면 ${won(PER_PERSON[0].total)}이지만, 12명이면 1인당 약 ${won(Math.round(PER_PERSON[4].total / 12))}으로 내려갑니다. 조기 반 마리·배 반 개는 살 수 없으니 1~2인 가구라면 과일·생선 가짓수를 줄이거나 소포장 제수 세트를 고려해 보세요.`,
  },
  {
    q: '제사를 저녁에 지내도 되나요?',
    a: '성균관 의례정립위원회가 2023년 11월 발표한 「전통 제례 보존 및 현대화 권고안」은 기제사를 돌아가신 날 첫 새벽(오후 11시~오전 1시)에 지내는 것이 원칙이지만, <strong>가족이 합의하면 돌아가신 날 초저녁(오후 6~8시)</strong>에 지내도 좋다고 했습니다. 음식도 밥·국·술과 과일 정도로 줄이고 고인이 좋아하던 음식을 올려도 되며, 준비는 가족이 함께 하라고 권했습니다. 본 도구의 「간소 제사」가 이런 축소 차림에 가깝습니다.',
  },
  {
    q: '본 도구의 가격·분량 데이터는 어디서 가져오나요?',
    a: '<strong>농산물 8종</strong>(무·사과·배·감·시금치·애호박·대파·마늘)은 KAMIS(aT 농산물유통정보) OpenAPI의 일별 서울 소매가를 불러오고, 실패하면 기본 단가를 씁니다. <strong>육류·수산·가공식품</strong>은 최근 마트·정육점 가격 수준으로 정한 기본 단가이며, <strong>인당 분량</strong>은 가정 조리 관행을 바탕으로 본 도구가 정한 기본값입니다(공식 표준이 아님). 단가는 칸을 눌러 직접 고칠 수 있고, 입력값은 본인 브라우저(localStorage)에만 저장됩니다.',
  },
]

export default function HolidayTablePage() {
  return (
    <ToolPage width={880} slug="/tools/cooking/holiday-table">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />명절 상차림 계산기
      </h1>
      <p className="tp-lead">
        설날·추석·제사 × 상 형식 + 인원만 입력하면 <strong style={{ color: 'var(--text)' }}>품목별 수량과 비용 자동</strong>. 주요 농산물 KAMIS 실시간 시세 + 5열 차례상 배치 가이드.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="aT 차례상 비용 조사(2026년 설 2.6·추석 9.18)·KAMIS 일별 시세 기준 · 성균관 의례정립위원회 차례상 표준안(2022.9)·제례 현대화 권고안(2023.11)"
        sources={[
          { label: 'aT 한국농수산식품유통공사', href: 'https://www.at.or.kr' },
          { label: 'KAMIS 농산물유통정보', href: 'https://www.kamis.or.kr' },
          { label: '성균관 — 차례상 표준안·제례 권고안 발표 기관', href: 'https://www.skkok.com' },
        ]}
      />

      <HolidayTableClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 명절·차례·제사 차이 */}
        <section>
          <h2 className="g-h2">차례 vs 제사 vs 명절 식사 — 무엇이 다른가</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>구분</th>
                  <th scope="col" style={headCell}>시기</th>
                  <th scope="col" style={headCell}>대상</th>
                  <th scope="col" style={headCell}>특징</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={cell}><strong style={{ color: 'var(--amber-600)' }}>차례</strong></td>
                  <td style={cell}>설날·추석 아침</td>
                  <td style={cell}>기제사를 모시는 조상을 함께 (전통적으로 4대까지)</td>
                  <td style={cell}>명절 음식 중심의 간소한 차림. 설 떡국·추석 송편</td>
                </tr>
                <tr>
                  <td style={cell}><strong style={{ color: 'var(--red-600)' }}>제사 (기제사)</strong></td>
                  <td style={cell}>고인 기일 매년</td>
                  <td style={cell}>특정 조상 (전통적으로 4대까지)</td>
                  <td style={cell}>메·갱·전·나물·과일을 갖춘 5열 제사상 (본 도구는 탕을 탕국 1종으로 간소화)</td>
                </tr>
                <tr>
                  <td style={cell}><strong style={{ color: 'var(--emerald-600)' }}>명절 식사</strong></td>
                  <td style={cell}>차례 직후 또는 별도</td>
                  <td style={cell}>가족 모임</td>
                  <td style={cell}>실용적 메뉴 — 떡국·갈비·잡채 등</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            본 도구는 세 가지를 모두 지원합니다. 명절을 고른 뒤 「차례상(정석)」 · 「간소 차림」 · 「식사 위주」를 바꾸면 품목과 분량이 함께 바뀝니다.
          </p>
        </section>

        {/* 2. 5열 차례상 원칙 */}
        <section>
          <h2 className="g-h2">5열 차례상 — 전해 오는 배치 원칙</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { name: '어동육서 (魚東肉西)',  color: 'var(--cyan-600)', desc: '동쪽에 어물(생선), 서쪽에 육류. 생선 머리는 동쪽, 꼬리는 서쪽 향함' },
              { name: '두동미서 (頭東尾西)',  color: 'var(--emerald-600)', desc: '머리는 동쪽, 꼬리는 서쪽. 어물 배치의 세부 원칙' },
              { name: '홍동백서 (紅東白西)',  color: 'var(--red-600)', desc: '동쪽에 붉은 과일(대추·사과), 서쪽에 흰 과일(배·곶감)' },
              { name: '조율이시 (棗栗梨柿)',  color: 'var(--amber-600)', desc: '대추→밤→배→감(곶감) 순서로 서쪽(왼쪽)부터 배치' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${b.color} 27%, transparent)`, borderRadius: 'var(--radius-m)', padding: '12px 16px' }}>
                <p style={{ fontSize: 14, color: b.color, fontWeight: 700, marginBottom: 6 }}>{b.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            방향은 제주가 신위를 바라보는 기준이라 <strong>동쪽은 제주의 오른쪽, 서쪽은 왼쪽</strong>입니다. 조율이시는 대추(붉은색)를 가장 왼쪽(서쪽)에 두므로 붉은 과일을 동쪽에 두는 홍동백서와 서로 어긋나고, 이 때문에 집안마다 따르는 방식이 다릅니다.
          </p>
          <Callout tone="note" title="예서에 없는 원칙도 있습니다">
            성균관 의례정립위원회는 2022년 차례상 표준안을 발표하며 &lsquo;홍동백서&rsquo;·&lsquo;조율이시&rsquo;는 옛 예법 문헌에 없는 표현이라고 설명하고, 과일은 놓기 편한 대로 올려도 된다고 했습니다. 배치 원칙은 집안 전통을 따르되 정답이 하나인 규칙으로 여길 필요는 없습니다.
          </Callout>
        </section>

        {/* 3. 성균관 표준안 */}
        <section>
          <h2 className="g-h2">성균관 표준안 — 얼마나 줄여도 되나</h2>
          <p className="g-p">
            명절 음식 준비 부담이 갈등으로 이어진다는 지적에 따라 성균관 의례정립위원회는 두 차례 간소화 기준을 내놓았습니다.
            <strong>2022년 9월 차례상 표준안</strong>은 송편(설에는 떡국)·나물·구이(적)·김치·과일·술 6가지를 기본으로 하고, 더 올리더라도 육류·생선·떡을 포함해 9가지 이내로 하라고 했습니다. 전을 부치느라 고생할 필요가 없다는 설명도 함께였습니다.
            <strong>2023년 11월 제례 현대화 권고안</strong>은 기제사를 가족 합의로 초저녁(오후 6~8시)에 지낼 수 있고, 밥·국·술과 과일 정도로 차려도 되며, 음식 준비는 가족이 함께 하라고 권했습니다.
          </p>
          <p className="g-p">
            본 도구의 「간소 차림」은 이 표준안을 그대로 옮긴 목록이 아니라, 가정에서 흔히 남기는 핵심 메뉴(떡국·송편, 갈비찜, 전 1종, 과일)를 묶은 것입니다. 표준안에 맞추고 싶다면 전 재료를 빼고 김치·나물을 남기는 식으로 품목 칸을 조정해 보세요.
          </p>
        </section>

        {/* 4. 명절별 핵심 음식 */}
        <section>
          <h2 className="g-h2">명절별 대표 음식</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 15, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>설날 (음력 1.1)</p>
              <ul style={{ fontSize: 13, color: 'var(--muted)', paddingLeft: 18, margin: 0, lineHeight: 1.85 }}>
                <li><strong style={{ color: 'var(--text)' }}>떡국</strong> — 흰 가래떡으로 끓임</li>
                <li>갈비찜 — 한우 사용 비중 높음</li>
                <li>전 3종 (동태·동그랑땡·호박)</li>
                <li>3색 나물·과일</li>
                <li>식혜·청주·한과</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 15, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>추석 (음력 8.15)</p>
              <ul style={{ fontSize: 13, color: 'var(--muted)', paddingLeft: 18, margin: 0, lineHeight: 1.85 }}>
                <li><strong style={{ color: 'var(--text)' }}>송편</strong> — 햇곡식의 의미</li>
                <li>토란국 — 추석 대표 국물</li>
                <li>햇과일 (햇사과·햇배·단감)</li>
                <li>갈비찜·전·3색 나물</li>
                <li>한과·식혜</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 15, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>제사 (기일)</p>
              <ul style={{ fontSize: 13, color: 'var(--muted)', paddingLeft: 18, margin: 0, lineHeight: 1.85 }}>
                <li><strong style={{ color: 'var(--text)' }}>메·갱</strong> (밥·국) 위(位)별 1세트</li>
                <li>탕 3종 (육탕·소탕·어탕)</li>
                <li>적·전 (어동육서)</li>
                <li>3색 나물·3색 과일</li>
                <li>시루떡·청주·식혜</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. 4인 기준 비용표 (빌드 시 계산) */}
        <section>
          <h2 className="g-h2">4인 기준 예상 비용 — 상차림별 비교</h2>
          <p className="g-p">
            계산기와 같은 방식(인당 분량 × 인원 × 기본 단가, 낱개 품목은 올림)으로 4인분을 계산한 값입니다. 실시간 시세는 반영하지 않은 기본 단가 기준이라 실제 장보기 금액과는 차이가 납니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>명절</th>
                  <th scope="col" style={headCell}>상차림</th>
                  <th scope="col" style={{ ...headCell, textAlign: 'right' }}>품목 수</th>
                  <th scope="col" style={{ ...headCell, textAlign: 'right' }}>합계</th>
                  <th scope="col" style={{ ...headCell, textAlign: 'right' }}>정육 비중</th>
                </tr>
              </thead>
              <tbody>
                {COST_ROWS.map(r => (
                  <tr key={r.key}>
                    <td style={cell}>{r.holiday}</td>
                    <td style={cell}>{r.format}</td>
                    <td style={{ ...cell, textAlign: 'right', fontFamily: 'var(--font-sans)' }}>{r.count}종</td>
                    <td style={{ ...cell, textAlign: 'right', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--accent-ink)' }}>{won(r.total)}</td>
                    <td style={{ ...cell, textAlign: 'right', fontFamily: 'var(--font-sans)', color: 'var(--muted)' }}>{r.meatPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            설·추석 차림에서 비용을 가장 크게 좌우하는 것은 <strong>갈비찜</strong>입니다. 4인분 한우 갈비 1kg만 {won(GALBI_4)}이라 정석 차림의 약 3분의 1을 차지합니다.
            aT의 차례상 비용 조사(24개 품목, 2026년 설 평균 20만 2,691원·추석 평균 19만 6,630원)가 본 도구의 정석 차림보다 낮은 것도 이런 구성 차이 때문입니다. 갈비 대신 산적이나 수입육을 쓰면 단가 칸만 바꿔 바로 비교할 수 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
              <caption style={{ captionSide: 'top', textAlign: 'left', fontSize: 13, color: 'var(--muted)', padding: '0 0 8px' }}>추석 차례상(정석) — 인원별 합계와 1인당 비용</caption>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>인원</th>
                  <th scope="col" style={{ ...headCell, textAlign: 'right' }}>합계</th>
                  <th scope="col" style={{ ...headCell, textAlign: 'right' }}>1인당</th>
                </tr>
              </thead>
              <tbody>
                {PER_PERSON.map(r => (
                  <tr key={r.n}>
                    <td style={cell}>{r.n}명</td>
                    <td style={{ ...cell, textAlign: 'right', fontFamily: 'var(--font-sans)' }}>{won(r.total)}</td>
                    <td style={{ ...cell, textAlign: 'right', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{won(Math.round(r.total / r.n))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. 가격 데이터·KAMIS */}
        <section>
          <h2 className="g-h2">가격 데이터 — KAMIS 실시간 시세 연동</h2>
          <div style={card}>
            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: '0 0 10px' }}>
              본 도구는 <strong style={{ color: 'var(--amber-600)' }}>KAMIS(한국농수산식품유통공사 농산물유통정보)</strong> OpenAPI를 통해
              명절 핵심 농산물의 서울 소매 시세를 조회합니다.
            </p>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: '20px', margin: 0 }}>
              <li><strong style={{ color: 'var(--text)' }}>실시간 연동 품목</strong>: 무·사과·배·감·시금치·애호박·대파·마늘 (8종 중 고른 차림에 들어가는 품목에만 적용)</li>
              <li><strong style={{ color: 'var(--text)' }}>폴백</strong>: API 키 미설정·실패 시 <strong>기본 단가</strong> 사용</li>
              <li><strong style={{ color: 'var(--text)' }}>캐싱</strong>: 1시간 단위로 호출 절약</li>
              <li><strong style={{ color: 'var(--text)' }}>가격 직접 수정</strong>: 각 품목 단가 칸을 눌러 자유롭게 변경 — 마트 광고지 가격 적용 가능</li>
            </ul>
          </div>
          <Callout tone="warn">
            명절이 가까워지면 시금치·사과·배처럼 수요가 몰리는 품목의 가격이 크게 움직입니다. 장보기 직전에 「최신 시세」 버튼으로 현재 가격을 다시 확인하세요.
          </Callout>
        </section>

        {/* 7. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 8. 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/cooking/kimjang" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🥬</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>김장 양 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>배추·양념 + KAMIS 연동</div>
            </Link>
            <Link href="/tools/cooking/serving" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍽️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>1인분 분량 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>일상 식단·장보기</div>
            </Link>
            <Link href="/tools/cooking/recipe" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>📐</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>레시피 비율 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>인분 자동 보정</div>
            </Link>
            <Link href="/tools/cooking/food-storage" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🧊</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>식재료 보관 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>명절 후 남은 음식</div>
            </Link>
            <Link href="/tools/date/lunar" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🌙</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>음력 변환기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>명절·제사 음력 날짜</div>
            </Link>
            <Link href="/tools/life/dutch" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍻</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>더치페이 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>형제·자매 분담</div>
            </Link>
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
