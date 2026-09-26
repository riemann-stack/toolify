import Link from 'next/link'
import RamenClient from './RamenClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import { RAMEN_TYPES, formatTime, calcRamen, MULTI_RAMEN_ADJUSTMENT, TOPPINGS, NOODLE_TEXTURE, POT_SIZE_RECOMMENDATIONS, WHO_DAILY_SODIUM } from './ramenUtils'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/cooking/ramen',
  title: '라면 물양 계산기 — 18종 제품별 물양·조리시간·칼로리·나트륨',
  description: '신라면·짜파게티·불닭·진짬뽕·열라면 등 한국 라면 18종 제품별 권장 물양·조리 시간·칼로리·나트륨(제조사 표기 기준). 개수·국물 농도·토핑까지 자동 보정.',
  keywords: [
    '라면 물양', '라면 물 ml', '라면 2개 물양', '라면 3개 물양', '라면 4개 물양',
    '신라면 물양', '진라면 물양', '안성탕면 물양', '너구리 물양', '진짬뽕 물양',
    '짜파게티 물양', '불닭볶음면 물양', '비빔면 물양', '컵라면 물양', '열라면 무파마탕면',
    '라면 끓이는 법', '라면 토핑', '라면 칼로리', '라면 나트륨',
    '신라면 칼로리', '짜파게티 칼로리', '불닭볶음면 칼로리', '라면 칼로리 비교', '라면 나트륨 순위',
  ],
})

/* 영양 정렬용(나트륨 내림차순) — 데이터(RAMEN_TYPES)에서 자동 생성 */
const RAMEN_BY_SODIUM = [...RAMEN_TYPES].sort((a, b) => b.sodium - a.sodium)

/* ── 가이드 표·예시 — 도구의 calcRamen()·보정 데이터로 빌드 시 생성 (신라면 기준) ── */
const SHIN = RAMEN_TYPES.find(r => r.id === 'shin')!
const shinWater = (count: number) =>
  calcRamen({ ramenId: 'shin', count, brothStrengthId: 'normal', textureId: 'normal', toppings: [] })!.recommendedWater
const MULTI_ROWS = MULTI_RAMEN_ADJUSTMENT.map(m => ({ count: m.count, naive: SHIN.baseWater * m.count, rec: shinWater(m.count), mult: m.multiplier }))
const EX = calcRamen({ ramenId: 'shin', count: 2, brothStrengthId: 'mild', textureId: 'firm', toppings: ['egg', 'rice-cake'] })!
const JJA2 = calcRamen({ ramenId: 'jjapaghetti', count: 2, brothStrengthId: 'normal', textureId: 'normal', toppings: [] })!
const TEXTURE_COLS = ['shin', 'neoguri', 'jjapaghetti', 'bibim'].map(id => RAMEN_TYPES.find(r => r.id === id)!)
const fmtMl = (ml: number) => `${ml.toLocaleString('ko-KR')}ml`
const fmtDelta = (ml: number) => (ml > 0 ? `+${ml}ml` : ml < 0 ? `−${Math.abs(ml)}ml` : '0')

const FAQ_LD = [
              {
                q: '라면 2개 끓일 때 물양은 얼마가 적당한가요?',
                a: '1개 물양이 550ml인 대부분의 국물라면(신라면·진라면·안성탕면 등)은 <strong>약 940ml</strong>, 1개 600ml인 진짬뽕은 약 1,020ml입니다. 「550ml × 2 = 1,100ml」로 넣으면 싱거워지기 쉬워 본 도구는 단순 2배 대신 1.7배(도구 추정 배수)를 씁니다. 신라면 2개 기준으로 짜게(진하게) 먹으려면 약 840ml, 싱겁게는 약 1,040ml, 국물을 넉넉하게 하려면 약 1,140ml입니다. 본 도구의 「물양 계산」 탭에서 자동 보정됩니다.',
              },
              {
                q: '짜파게티 물양과 끓이는 법은?',
                a: '짜파게티 1개 기준 600ml로 끓인 뒤 면이 익으면 물 8큰술(약 120ml)만 남기고 따라냅니다. 그 후 분말스프 + 올리브유 + 비벼서 완성. 2개일 때는 약 1,150ml로 끓인 뒤 240ml(16큰술) 남김. 불닭볶음면도 같은 방식.',
              },
              {
                q: '라면에 계란을 넣으면 물양을 늘려야 하나요?',
                a: '거의 영향 없음. 계란 1개 추가해도 물양 그대로 유지 가능. 다만 국물이 약간 묽어질 수 있어서 풀어 넣으면(계란찜 형태) 국물 약간 묽어지고, 통째로(반숙) 넣으면 거의 영향 없음. 마지막 1분 전에 투입 권장. 본 도구는 16종 토핑별 물양 보정 자동.',
              },
              {
                q: '라면 봉지 권장량과 본 도구의 권장량이 다른 이유는?',
                a: '봉지는 1개 기준 표준 권장량입니다. 본 도구는 다음을 추가 반영: ① 다개수 보정 (단순 ×N X), ② 국물 농도 (짜게~싱겁게 5단계), ③ 토핑 영향 (16종), ④ 면 익힘 정도 (5단계). 봉지 권장량은 「기본」이고 취향과 상황에 맞게 조정 가능합니다.',
              },
              {
                q: '라면 매일 먹으면 건강에 어떤 영향이 있나요?',
                a: '국물라면 1봉의 나트륨은 제품 표기 기준 대략 1,400~1,900mg(신라면 1,790mg)으로, WHO 성인 권고량(하루 2,000mg 미만)의 70~90%대를 한 끼에 채웁니다. 매일 먹으면 ① 나트륨 과다 → 혈압 상승 위험, ② 튀긴 면의 포화지방 누적, ③ 단백질·채소·비타민 부족으로 식단이 한쪽으로 쏠리기 쉽습니다. 먹는다면 ① 횟수를 정해 두고, ② 계란·콩나물·대파처럼 단백질·채소 토핑을 더하고, ③ 국물을 남기고, ④ 그날 다른 끼니를 싱겁게 하는 것이 현실적인 방법입니다. 칼로리 관리는 BMR 계산기를 참고하세요.',
              },
              {
                q: '비빔면 물양은 얼마인가요?',
                a: '팔도 비빔면 1개 기준 600ml로 면만 끓이기(3분). 익은 면을 체에 받쳐 물 전부 따라내고 찬물(또는 얼음물)에 헹굼. 그 후 비빔장 + 비빔. 찬물 헹굼이 핵심 — 면이 쫄깃해지고 식감이 살아남.',
              },
              {
                q: '컵라면 물양은 어떻게 정하나요?',
                a: '컵라면은 용기 안쪽에 표시된 「물 붓는 선」까지 끓는 물을 부으면 됩니다. 본 도구의 대표값은 ① 큰컵(왕뚜껑·신컵류) 약 460ml / 4분, ② 작은컵(육개장·새우탕류) 약 320ml / 3분, ③ 컵누들 약 350ml / 3분이지만 제품마다 선 위치가 다르니 용기 표시가 우선입니다. 여러 컵이면 컵 수만큼 그대로 곱하면 되고(국물라면처럼 줄이지 않음), 토핑을 넣어도 물은 선까지만 붓습니다. 정수기 온수는 끓는 물보다 온도가 낮아 표시 시간에 면이 덜 익을 수 있으니 1분쯤 더 두세요.',
              },
              {
                q: '라면 국물을 다 먹으면 나트륨이 얼마나 들어가나요?',
                a: '국물을 다 마시면 봉지에 표기된 나트륨(신라면 1,790mg)을 거의 그대로 먹는 셈입니다. 수프의 나트륨은 대부분 국물에 녹아 있고 면에 스며드는 양은 일부라서, <strong>국물을 남길수록 실제 섭취량이 크게 줄어듭니다</strong>. 면과 국물에 나뉘는 비율은 제품·물양·조리 시간에 따라 달라 정확한 값은 없지만, 국물을 절반만 먹어도 한 끼 나트륨을 수백 mg 줄일 수 있습니다. 수프를 처음부터 2/3만 넣고 「싱겁게」 농도로 끓이는 것도 같은 효과입니다.',
              },
              {
                q: '라면 2개 + 만두를 끓이면 물양은?',
                a: '예: 신라면 2개(935ml) + 만두 2개(+80ml) = 1,015ml → 10ml 단위로 반올림해 약 1,020ml. 만두는 면보다 2분 먼저 넣어야(냉동 만두는 속까지 익는 데 시간이 더 걸림) 면과 함께 다 익습니다. 떡 100g까지 추가하면 +80ml로 약 1,100ml. 본 도구의 「물양 계산」 탭에서 토핑을 고르면 자동 보정됩니다.',
              },
              {
                q: '라면 3개 끓일 때 냄비 크기는?',
                a: '22cm(2.5L) 깊은 양수냄비 권장. 18cm 라면냄비로는 물 넘침 위험 큼. 4개 이상은 24cm(3L) 또는 냄비 2개 분리 권장. 물 1.5L 넘으면 끓는 시간이 길어지고 면이 풀어지기 시작합니다 — 큰 냄비 + 강한 화력이 핵심.',
              },
            ]

export default function RamenPage() {
  return (
    <ToolPage width={760} slug="/tools/cooking/ramen">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />라면 물양 계산기
      </h1>
      <p className="tp-lead">
        라면 개수·국물 농도·토핑별 권장 물양과 시간. <strong style={{ color: 'var(--text)' }}>신라면·짜파게티·불닭·비빔면</strong> 전부.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="물양·시간·영양은 제조사 봉지/용기 표기(1개) 기준, 개수·농도·토핑 보정은 도구 자체 경험값 · 나트륨 비교는 WHO 성인 권고(하루 2,000mg 미만)"
        sources={[
          { label: 'WHO Sodium reduction 팩트시트', href: 'https://www.who.int/news-room/fact-sheets/detail/sodium-reduction' },
          { label: '식약처 식품영양성분 데이터베이스', href: 'https://various.foodsafetykorea.go.kr/nutrient/' },
        ]}
      />

      <RamenClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 제품별 물양·시간·영양 종합표 */}
        <div>
          <h2 className="g-h2">
            라면 종류별 물양·조리시간·칼로리·나트륨 (제품 표기 기준)
          </h2>
          <p className="g-p">
            한국 인기 라면 <strong style={{ color: 'var(--text)' }}>{RAMEN_TYPES.length}종</strong>의 1개(1봉/1용기) 기준 권장 물양·조리 시간과
            제조사 표기 영양정보입니다. 본 도구는 여기에 <strong style={{ color: 'var(--text)' }}>개수·국물 농도·토핑·면 익힘</strong>까지 자동 보정합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>라면</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>물양</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>시간</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>칼로리</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--warning)', fontWeight: 500, whiteSpace: 'nowrap' }}>나트륨</th>
                </tr>
              </thead>
              <tbody>
                {RAMEN_TYPES.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {r.emoji} {r.name} <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 11 }}>{r.brand}</span>
                    </td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {r.baseWater}ml{r.waterDrainMl ? '*' : ''}
                    </td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{formatTime(r.cookTime)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{r.kcal}kcal</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: r.sodium >= 1800 ? 'var(--danger)' : 'var(--warning)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{r.sodium.toLocaleString()}mg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 짜파게티·불닭볶음면은 끓인 뒤 물 8큰술(약 120ml)만 남기고 따라냅니다. 영양정보는 제조사 봉지/용기 표기(1개) 기준이며 리뉴얼 시 달라질 수 있습니다.
          </p>
        </div>

        {/* 2. 다개수 보정 — 단순 ×N 안 되는 이유 */}
        <div>
          <h2 className="g-h2">
            라면 2개에 단순 ×2가 안 되는 이유
          </h2>
          <p className="g-p">
            봉지 표기(1개 550ml)를 개수만큼 곱해 「550ml × 2 = 1,100ml」를 넣으면 <strong style={{ color: 'var(--danger)' }}>국물이 싱거워지기 쉽습니다</strong>. 수프는 개수만큼 늘지만 물은 그보다 덜 늘려야 같은 농도가 되는 이유는 이렇습니다.
          </p>
          <ul className="g-list">
            <li>봉지 물양에는 끓는 동안 날아가는 물이 포함돼 있는데, 같은 냄비에서 비슷한 시간 끓이면 증발량은 개수만큼 두 배, 세 배로 늘지 않습니다.</li>
            <li>물이 많을수록 면을 넣은 뒤 다시 끓어오르는 데 오래 걸려 면이 먼저 퍼지기 쉽습니다 — 물을 덜 넣으면 이 시간도 줄어듭니다.</li>
            <li>그래서 계산기는 국물라면에 2개 1.7배 · 3개 2.45배 · 4개 3.2배 · 5개 3.9배의 배수를 씁니다. 이 배수는 제조사 공식 수치가 아닌 도구 자체의 추정값이므로, 제조사가 여러 개 조리 시 물양을 따로 안내하는 제품이라면 그 안내를 우선하세요. 넓고 얕은 냄비로 오래 끓이면 증발이 늘어나니 결과 범위(±5%)의 위쪽을 고르세요.</li>
          </ul>

          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>개수</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--danger)', fontWeight: 700 }}>단순 ×N (X)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700 }}>권장 (✓)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>배수</th>
                </tr>
              </thead>
              <tbody>
                {MULTI_ROWS.map((row, i) => (
                  <tr key={row.count} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{row.count}개</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--danger)', fontFamily: 'var(--font-sans)', textDecoration: row.count > 1 ? 'line-through' : 'none', opacity: 0.7 }}>{fmtMl(row.naive)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{fmtMl(row.rec)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{row.mult.toFixed(2)}배</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 신라면(1개 550ml) 기준, 10ml 단위 반올림. 이 배수는 국물라면에만 씁니다 — 물을 따라내는 짜장·볶음·비빔면은 면 삶을 물이라 거의 개수만큼(2개째부터 0.92배씩) 늘리고, 컵라면은 컵 수만큼 그대로 곱합니다.
          </p>
        </div>

        {/* 3. 짜장·볶음·비빔 */}
        <div>
          <h2 className="g-h2">
            짜파게티·불닭·비빔면 — 물 빼기 가이드
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { emoji: '⚫', name: '짜파게티', color: 'var(--cat-cooking-ink)', steps: ['600ml로 끓이기 (5분)', '면이 익으면 8큰술(120ml)만 남기고 따라냄', '분말스프 + 올리브유 + 비비기'] },
              { emoji: '🔥', name: '불닭볶음면', color: 'var(--danger)', steps: ['600ml로 끓이기 (5분)', '8큰술 남기고 따라냄', '액상소스 + 후레이크 + 김 비비기'] },
              { emoji: '❄️', name: '비빔면', color: 'var(--cat-health)', steps: ['600ml로 면만 익히기 (3분)', '물 전부 따라내고 찬물에 헹굼', '비빔장 + 비비기'] },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${s.color}55`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: s.color, fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font-sans)' }}>
                  {s.emoji} {s.name}
                </p>
                <ol style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 20, margin: 0 }}>
                  {s.steps.map((step, j) => <li key={j}>{step}</li>)}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 토핑 추가 시 보정 */}
        <div>
          <h2 className="g-h2">
            토핑 추가 시 물양 보정
          </h2>
          <p className="g-p">
            <strong>물양 보정 기준</strong> — 끓이는 동안 재료가 흡수·증발시키는 물을 더하거나 빼서 국물 농도를 유지합니다.
            전분류(떡·만두·면사리)는 물을 흡수하므로 <strong style={{ color: 'var(--warning)' }}>보충(+)</strong>, 순두부처럼 자체 수분이 많은 재료는
            <strong style={{ color: 'var(--cat-health)' }}> 차감(−)</strong>, 계란·치즈·대파처럼 물 흡수가 거의 없는 재료는 <strong>0</strong>입니다.
          </p>
          <p className="g-p">
            <strong>투입 타이밍 기준</strong> — 재료가 익는 데 필요한 시간을 면 투입 시점에 맞춰 환산했습니다.
            냉동 만두·떡은 면보다 <strong>먼저</strong>, 계란·치즈·대파는 풀어지지 않도록 <strong>나중에</strong> 넣습니다.
            (칼로리·단백질·나트륨 등 토핑 영양은 USDA·식약처 일반 평균으로 제품·분량에 따라 차이가 있습니다.)
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>토핑</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--warning)', fontWeight: 700 }}>물양 보정</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>칼로리</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>나트륨</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>투입 타이밍</th>
                </tr>
              </thead>
              <tbody>
                {TOPPINGS.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{t.name}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--warning)', fontFamily: 'var(--font-sans)', fontWeight: 700, whiteSpace: 'nowrap' }}>{fmtDelta(t.waterDelta)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>+{t.kcal}kcal</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{t.sodium ? `+${t.sodium.toLocaleString()}mg` : '—'}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{t.timeAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 본 도구의 「물양 계산」 탭에서 {TOPPINGS.length}종 토핑 자동 반영, 「토핑·시간」 탭에서 전체 영향 확인. 컵라면은 물 붓는 선까지만 붓기 때문에 토핑 물양 보정을 하지 않습니다. 치즈·김치·햄·스팸은 나트륨을 크게 올리니 국물 농도를 「싱겁게」로 두는 편이 좋습니다.
          </p>
        </div>

        {/* 5. 면 익힘 시간 */}
        <div>
          <h2 className="g-h2">
            면 익힘 정도별 시간
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>익힘 정도</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>보정</th>
                  {TEXTURE_COLS.map(r => (
                    <th scope="col" key={r.id} style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.name}</th>
                  ))}
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>추천</th>
                </tr>
              </thead>
              <tbody>
                {NOODLE_TEXTURE.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{t.name}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{t.timeDelta === 0 ? '봉지 표기' : `${t.timeDelta > 0 ? '+' : '−'}${Math.abs(t.timeDelta)}초`}</td>
                    {TEXTURE_COLS.map(r => (
                      <td key={r.id} style={{ padding: '10px 12px', textAlign: 'right', color: t.timeDelta === 0 ? 'var(--accent-ink)' : 'var(--text)', fontWeight: t.timeDelta === 0 ? 700 : 400, whiteSpace: 'nowrap' }}>{formatTime(Math.max(60, r.cookTime + t.timeDelta))}</td>
                    ))}
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{t.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 봉지 표기 시간에 익힘 보정을 더한 값입니다(최소 1분). 면을 건져 그릇에 옮기는 동안에도 뜨거운 국물 속에서 계속 익으므로, 꼬들한 면을 좋아하면 불을 끄자마자 바로 먹는 것이 보정값보다 중요합니다.
          </p>
        </div>

        {/* 6. 칼로리·나트륨 비교 (제품별 순위) */}
        <div>
          <h2 className="g-h2">
            라면 칼로리·나트륨 비교 (나트륨 많은 순)
          </h2>
          <p className="g-p">
            제조사 표기 기준 1봉/1용기 영양정보입니다. WHO는 성인 나트륨 섭취를 <strong>하루 2,000mg 미만</strong>(소금 5g 미만)으로 권고하므로, <strong style={{ color: 'var(--danger)' }}>나트륨 1,800mg이면 그 90%</strong>를 한 봉지에 채우는 셈입니다(식약처 영양성분 표시의 1일 기준치도 나트륨 2,000mg).
            표의 &lsquo;WHO 대비&rsquo;는 표기 나트륨 ÷ {WHO_DAILY_SODIUM.toLocaleString()}mg이며, 국물라면은 국물을 남기는 만큼 실제 섭취량이 줄어듭니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>라면</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--warning)', fontWeight: 700, whiteSpace: 'nowrap' }}>나트륨</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>WHO 대비</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>칼로리</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>단백질</th>
                </tr>
              </thead>
              <tbody>
                {RAMEN_BY_SODIUM.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.emoji} {r.name}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: r.sodium >= 1800 ? 'var(--danger)' : 'var(--warning)', fontFamily: 'var(--font-sans)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.sodium.toLocaleString()}mg</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{Math.round(r.sodium / 2000 * 100)}%</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{r.kcal}kcal</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{r.protein}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            짜장·볶음류(짜파게티·불닭)는 표기 나트륨이 국물라면보다 낮지만, 소스를 면에 전부 비벼 먹기 때문에 표기량을 거의 그대로 섭취합니다. 반대로 국물라면은 표기량이 높아도 국물을 남기면 실제 섭취가 줄어듭니다.
            라면 2개에 토핑을 더하면 하루 2,000kcal를 세 끼로 나눈 한 끼(약 700kcal)의 1.5배를 쉽게 넘습니다. 정확한 값은 제품 포장이나 식약처 식품영양성분 데이터베이스에서 확인하세요.
          </p>
        </div>

        {/* 7. 냄비 크기 가이드 */}
        <div>
          <h2 className="g-h2">
            라면 개수별 냄비 크기 가이드
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>개수</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700 }}>권장 냄비</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>신라면 물양</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>설명</th>
                </tr>
              </thead>
              <tbody>
                {POT_SIZE_RECOMMENDATIONS.map(p => [`${p.count}개`, `${p.diameter}cm (${p.liters.toFixed(1)}L)`, p.desc, fmtMl(shinWater(p.count))]).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700, whiteSpace: 'nowrap' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{row[3]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            표의 냄비는 권장 물양이 냄비 용량의 약 40~60%가 되는 크기입니다. 라면은 끓어오를 때 거품이 크게 부풀고 면·토핑 부피가 더해지므로, 물이 용량의 3분의 2를 넘는 냄비는 넘치기 쉽습니다. 4개 이상이면 냄비 두 개로 나눠 끓이는 편이 면 익힘도 고릅니다.
          </p>
        </div>

        {/* 7-1. 계산 방식 — calcRamen()으로 생성 */}
        <div>
          <h2 className="g-h2">물양·시간 계산 방식과 예시</h2>
          <p className="g-p">
            계산기는 제품별 1개 물양(봉지 표기)에서 출발해 네 단계로 보정합니다. ① <strong>개수</strong>: 국물라면은 위 표의 도구 추정 배수(2개 1.7배 등), 물을 따라내는 라면은 1 + 0.92 × (개수 − 1), 컵라면은 컵 수 그대로. ② <strong>국물 농도</strong>: 국물라면에만 1개당 매우 진하게 −100ml · 짜게 −50ml · 싱겁게 +50ml · 국물 넉넉 +100ml. ③ <strong>토핑</strong>: 위 표의 물양 보정을 합산(컵라면 제외). ④ 합계를 10ml 단위로 반올림하고 ±5%를 허용 범위로 보여줍니다.
            조리 시간은 봉지 표기 시간에 면 익힘 보정(−90초~+90초)만 더하고, 냄비 크기는 개수로 정합니다.
          </p>
          <p className="g-p">
            예를 들어 <strong>신라면 2개 · 싱겁게 · 꼬들 · 떡 100g + 계란</strong>이면 550 × 1.7 = 935ml에 싱겁게 +100ml(2개), 떡 +80ml, 계란 0을 더해 1,115ml → <strong>{fmtMl(EX.recommendedWater)}</strong>(범위 {fmtMl(EX.rangeMin)}~{fmtMl(EX.rangeMax)})이 나옵니다.
            시간은 4분 30초 − 30초 = <strong>{formatTime(EX.cookTimeSeconds)}</strong>이고, 떡은 면보다 1분 먼저, 계란은 불 끄기 1분 전에 넣으라는 타임라인이 함께 표시됩니다.
            영양은 라면 2개 표기값에 토핑을 더해 {EX.totalKcal.toLocaleString()}kcal · 나트륨 {EX.totalSodium.toLocaleString()}mg(WHO 권고의 {Math.round(EX.totalSodium / WHO_DAILY_SODIUM * 100)}%)으로, 국물을 다 마신다고 가정한 최대치입니다.
            짜파게티 2개는 {fmtMl(JJA2.recommendedWater)}로 끓인 뒤 물을 {fmtMl((JJA2.ramenInfo.waterDrainMl ?? 0) * 2)}(16큰술)만 남기고 따라내라는 안내가 나옵니다.
          </p>
        </div>

        {/* 8. FAQ — accordion */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* 9. 면책 */}
        <Callout tone="note" title="면책">
          본 도구의 권장 물양은 <strong>일반 가이드</strong>입니다. 라면 브랜드·종류·생산 시기(리뉴얼), 냄비 크기·재질, 화력·고도, 개인 취향에 따라 알맞은 양이 달라질 수 있으니 봉지 표기를 기본으로 취향에 맞게 조정하세요. 영양정보는 제조사 표기 기준이며 제품 리뉴얼 시 바뀔 수 있습니다.
        </Callout>

        {/* 10. 함께 쓰면 좋은 도구 */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/recipe',  icon: '📐', name: '레시피 비율 계산기', desc: '인분 환산 + 단위 변환' },
              { href: '/tools/cooking/serving', icon: '🍽️', name: '1인분 분량 계산기', desc: '쌀·고기·파스타 분량' },
              { href: '/tools/health/bmr',      icon: '💪', name: 'BMR 계산기',          desc: '1일 권장 칼로리' },
              { href: '/tools/health/bmi',      icon: '📊', name: 'BMI 계산기',          desc: '체질량 지수' },
              { href: '/tools/cooking/thawing', icon: '🧊', name: '냉동·해동 시간',     desc: '식품 안전 가이드' },
            ].map(t => (
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
