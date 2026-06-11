import Link from 'next/link'
import RamenClient from './RamenClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import { RAMEN_TYPES, formatTime } from './ramenUtils'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/cooking/ramen',
  title: '라면 물양 계산기 — 18종 제품별 물양·조리시간·칼로리·나트륨 | Youtil',
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

const FAQ_LD = [
              {
                q: '라면 2개 끓일 때 물양은 얼마가 적당한가요?',
                a: '라면 종류에 따라 다르지만 일반 국물라면 기준 약 880~990ml (신라면 기준 940ml). 「550ml × 2 = 1,100ml」로 넣으면 싱거우므로 1.7배(약 940ml) 권장. 국물 진하게 좋아하면 880ml, 국물 넉넉하게면 1,000ml까지. 본 도구의 「물양 계산」 탭에서 자동 보정.',
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
                a: '라면 1봉 = 나트륨 1,800mg (WHO 일일 권장 2,000mg의 90%). 매일 라면 시 ① 나트륨 과다 → 고혈압·신장 부담, ② 포화지방 누적, ③ 영양 불균형 (단백질·비타민 ↓). 권장: ① 일주일 1~2회, ② 단백질·채소 토핑 추가 (계란·콩나물·대파), ③ 국물 다 먹지 X (나트륨 절반 줄임), ④ 다음 끼 싱겁게. 자세한 칼로리 관리는 BMR 계산기 참고.',
              },
              {
                q: '비빔면 물양은 얼마인가요?',
                a: '팔도 비빔면 1개 기준 600ml로 면만 끓이기(3분). 익은 면을 체에 받쳐 물 전부 따라내고 찬물(또는 얼음물)에 헹굼. 그 후 비빔장 + 비빔. 찬물 헹굼이 핵심 — 면이 쫄깃해지고 식감이 살아남.',
              },
              {
                q: '컵라면 물양은 어떻게 정하나요?',
                a: '컵라면은 뚜껑 안쪽에 표시된 「물양 선」까지 끓는 물을 부으면 됩니다. 표준 기준: ① 큰컵 (왕뚜껑·신컵): 약 460ml / 4분, ② 작은컵 (육개장·새우탕): 약 320ml / 3분, ③ 컵누들 (저칼로리): 약 350ml / 3분. 정수기·가스레인지로 끓인 물 권장 (전자레인지 끓는 물은 표면 거품이 적음).',
              },
              {
                q: '라면 국물을 다 먹으면 나트륨이 얼마나 들어가나요?',
                a: '라면 1봉 나트륨 1,800mg 중 약 60~70%(1,200mg)가 국물에 들어 있습니다. 국물 다 먹으면 나트륨 1,800mg 전부 섭취 (WHO 일일 권장 90%). 국물 절반만 먹으면 약 1,200mg(60%) — WHO 권장 안에 들어옴. 건강을 위해 국물 다 먹지 않는 것이 가장 효과적인 라면 절제 방법.',
              },
              {
                q: '라면 2개 + 만두를 끓이면 물양은?',
                a: '예: 신라면 2개(940ml) + 만두 2개(+80ml) = 약 1,020ml. 만두는 면 2분 전에 추가(찬 만두면 살짝 풀려야 면 익을 때 같이 익음). 본 도구의 「물양 계산」 탭에서 토핑 선택 시 자동 보정. 떡까지 추가하면 +80ml(총 1,100ml).',
              },
              {
                q: '라면 3개 끓일 때 냄비 크기는?',
                a: '22cm(2.5L) 깊은 양수냄비 권장. 18cm 라면냄비로는 물 넘침 위험 큼. 4개 이상은 24cm(3L) 또는 냄비 2개 분리 권장. 물 1.5L 넘으면 끓는 시간이 길어지고 면이 풀어지기 시작합니다 — 큰 냄비 + 강한 화력이 핵심.',
              },
            ]

export default function RamenPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🍜 라면 물양 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        라면 개수·국물 농도·토핑별 권장 물양과 시간. <strong style={{ color: 'var(--text)' }}>신라면·짜파게티·불닭·비빔면</strong> 전부.
      </p>

      <RamenClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 제품별 물양·시간·영양 종합표 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🍜 라면 종류별 물양·조리시간·칼로리·나트륨 (제품 표기 기준)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            한국 인기 라면 <strong style={{ color: 'var(--text)' }}>{RAMEN_TYPES.length}종</strong>의 1개(1봉/1용기) 기준 권장 물양·조리 시간과
            제조사 표기 영양정보입니다. 본 도구는 여기에 <strong style={{ color: 'var(--text)' }}>개수·국물 농도·토핑·면 익힘</strong>까지 자동 보정합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>라면</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>물양</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>시간</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>칼로리</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#EA580C', fontWeight: 500, whiteSpace: 'nowrap' }}>나트륨</th>
                </tr>
              </thead>
              <tbody>
                {RAMEN_TYPES.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {r.emoji} {r.name} <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 11 }}>{r.brand}</span>
                    </td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {r.baseWater}ml{r.waterDrainMl ? '*' : ''}
                    </td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', whiteSpace: 'nowrap' }}>{formatTime(r.cookTime)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', whiteSpace: 'nowrap' }}>{r.kcal}kcal</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: r.sodium >= 1800 ? '#DC2626' : '#EA580C', fontFamily: 'Inter, system-ui, sans-serif', whiteSpace: 'nowrap' }}>{r.sodium.toLocaleString()}mg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            * 짜파게티·불닭볶음면은 끓인 뒤 물 8큰술(약 120ml)만 남기고 따라냅니다. 영양정보는 제조사 봉지/용기 표기(1개) 기준이며 리뉴얼 시 달라질 수 있습니다.
          </p>
        </div>

        {/* 2. 다개수 보정 — 단순 ×N 안 되는 이유 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            ⚠️ 라면 2개에 단순 ×2가 안 되는 이유
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            「550ml × 2 = 1,100ml」 넣으면 <strong style={{ color: '#DC2626' }}>국물이 싱거워집니다</strong>. 이유:
          </p>
          <ul style={{ fontSize: '13.5px', color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 18, marginBottom: 16 }}>
            <li>냄비 표면적 증가 → 증발량 증가</li>
            <li>면이 흡수하는 물 증가</li>
            <li>국물 비율 체감 감소</li>
            <li>끓는 시간 증가</li>
          </ul>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>개수</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#DC2626', fontWeight: 700 }}>단순 ×N (X)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>권장 (✓)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>배수</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1개', '550ml',   '550ml',   '1.00배'],
                  ['2개', '1,100ml', '940ml',   '1.70배'],
                  ['3개', '1,650ml', '1,350ml', '2.45배'],
                  ['4개', '2,200ml', '1,760ml', '3.20배'],
                  ['5개', '2,750ml', '2,150ml', '3.90배'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#DC2626', fontFamily: 'Inter, system-ui, sans-serif', textDecoration: 'line-through', opacity: 0.7 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ※ 신라면 기준. 본 도구의 「물양 계산」 탭에서 자동 보정.
          </p>
        </div>

        {/* 3. 짜장·볶음·비빔 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            ⚫ 짜파게티·🔥 불닭·❄️ 비빔면 — 물 빼기 가이드
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { emoji: '⚫', name: '짜파게티', color: '#A16207', steps: ['600ml로 끓이기 (5분)', '면이 익으면 8큰술(120ml)만 남기고 따라냄', '분말스프 + 올리브유 + 비비기'] },
              { emoji: '🔥', name: '불닭볶음면', color: '#DC2626', steps: ['600ml로 끓이기 (5분)', '8큰술 남기고 따라냄', '액상소스 + 후레이크 + 김 비비기'] },
              { emoji: '❄️', name: '비빔면', color: '#0891B2', steps: ['600ml로 면만 익히기 (3분)', '물 전부 따라내고 찬물에 헹굼', '비빔장 + 비비기'] },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${s.color}55`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: s.color, fontWeight: 700, marginBottom: 10, fontFamily: 'Noto Sans KR, sans-serif' }}>
                  {s.emoji} {s.name}
                </p>
                <ol style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 20, margin: 0 }}>
                  {s.steps.map((step, j) => <li key={j}>{step}</li>)}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 토핑 추가 시 보정 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🥢 토핑 추가 시 물양 보정
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '14px' }}>
            <strong style={{ color: 'var(--text)' }}>물양 보정 기준</strong> — 끓이는 동안 재료가 흡수·증발시키는 물을 더하거나 빼서 국물 농도를 유지합니다.
            전분류(떡·만두·면사리)는 물을 흡수하므로 <strong style={{ color: '#EA580C' }}>보충(+)</strong>, 순두부처럼 자체 수분이 많은 재료는
            <strong style={{ color: '#0891B2' }}> 차감(−)</strong>, 계란·치즈·대파처럼 물 흡수가 거의 없는 재료는 <strong>0</strong>입니다.
            <br />
            <strong style={{ color: 'var(--text)' }}>투입 타이밍 기준</strong> — 재료가 익는 데 필요한 시간을 면 투입 시점에 맞춰 환산했습니다.
            냉동 만두·떡은 면보다 <strong>먼저</strong>, 계란·치즈·대파는 풀어지지 않도록 <strong>나중에</strong> 넣습니다.
            (칼로리·단백질·나트륨 등 토핑 영양은 USDA·식약처 일반 평균으로 제품·분량에 따라 차이가 있습니다.)
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>토핑</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#EA580C', fontWeight: 700 }}>물양 보정</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>칼로리</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>투입 타이밍</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🥚 계란',          '0',     '+70 kcal',  '마지막 1분 전'],
                  ['🧀 치즈 1장',      '0',     '+70 kcal',  '불 끈 직후'],
                  ['🍡 떡 100g',       '+80ml', '+240 kcal', '면 1분 전'],
                  ['🥟 만두 2개',      '+80ml', '+200 kcal', '면 2분 전'],
                  ['🌱 콩나물 한 줌',  '+50ml', '+15 kcal',  '면 1분 전'],
                  ['⬜ 순두부 1/2팩',  '-50ml', '+60 kcal',  '면 1분 전 (자체 수분)'],
                  ['🍜 추가 면사리',   '+200ml', '+350 kcal','본 면과 동시'],
                  ['🥫 스팸 100g',     '+30ml', '+290 kcal', '면과 동시'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#EA580C', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[1]}{row[1] !== '0' ? '' : ''}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ※ 본 도구의 「물양 계산」 탭에서 16종 토핑 자동 반영. 「토핑·시간」 탭에서 전체 영향 확인.
          </p>
        </div>

        {/* 5. 면 익힘 시간 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            ⏱️ 면 익힘 정도별 시간
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>익힘 정도</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>조리 시간</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>추천</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['매우 꼬들', '3분',     '치아로 약간 저항감'],
                  ['꼬들 ⭐',  '4분',     '한국인 다수 선호'],
                  ['기본',     '4분 30초', '봉지 권장'],
                  ['부드럽게', '5분',     '아이·노인 추천'],
                  ['매우 푹',  '6분',     '죽처럼'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ※ 신라면 기준. 너구리·짬뽕은 +30초. 컵라면은 -1~1.5분.
          </p>
        </div>

        {/* 6. 칼로리·나트륨 비교 (제품별 순위) */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            💪 라면 칼로리·나트륨 비교 (나트륨 많은 순)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            제조사 표기 기준 1봉/1용기 영양정보입니다. <strong style={{ color: '#DC2626' }}>나트륨 1,800mg = WHO 일일 권장(2,000mg)의 90%</strong> —
            국물을 남기면 실제 섭취 나트륨은 절반 수준으로 줄어듭니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>라면</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#EA580C', fontWeight: 700, whiteSpace: 'nowrap' }}>나트륨</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>WHO 대비</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>칼로리</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>단백질</th>
                </tr>
              </thead>
              <tbody>
                {RAMEN_BY_SODIUM.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.emoji} {r.name}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: r.sodium >= 1800 ? '#DC2626' : '#EA580C', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.sodium.toLocaleString()}mg</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif', whiteSpace: 'nowrap' }}>{Math.round(r.sodium / 2000 * 100)}%</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', whiteSpace: 'nowrap' }}>{r.kcal}kcal</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif', whiteSpace: 'nowrap' }}>{r.protein}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ⚠️ 짜장·볶음류(짜파게티·불닭)는 국물이 없어 나트륨이 상대적으로 낮습니다. 라면 2개 + 토핑 = 한 끼 권장(700kcal)의 약 1.5배.
            라면은 가끔의 즐거움 — <strong style={{ color: 'var(--text)' }}>일주일 1~2회 권장</strong>. 정확한 값은 제품 포장·식품안전나라(식약처)에서 확인하세요.
          </p>
        </div>

        {/* 7. 냄비 크기 가이드 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🍲 라면 개수별 냄비 크기 가이드
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>개수</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>권장 냄비</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>설명</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1개', '18cm (1.5L)', '한국 표준 라면냄비'],
                  ['2개', '20cm (2.0L)', '양수냄비'],
                  ['3개', '22cm (2.5L)', '깊은 형태 권장'],
                  ['4개', '24cm (3.0L)', '대형 또는 냄비 2개 분리'],
                  ['5개', '26cm (3.5L)', '대형 + 전기레인지 권장'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 8. FAQ — accordion */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {faq.q}
                </summary>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* 9. 면책 */}
        <div style={{ background: 'rgba(234,88,12,0.04)', border: '1px solid rgba(234,88,12,0.30)', borderRadius: 12, padding: '16px 20px' }}>
          <p style={{ fontSize: 13, color: '#EA580C', fontWeight: 700, marginBottom: 10 }}>🍜 면책</p>
          <p style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85, marginBottom: 8 }}>
            본 도구의 권장 물양은 <strong style={{ color: 'var(--text)' }}>일반 가이드</strong>입니다. 정확한 양은 다음에 따라 다를 수 있음:
          </p>
          <ul style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 18, marginBottom: 8 }}>
            <li>라면 브랜드·종류·생산 시기</li>
            <li>냄비 크기·재질 (스테인리스·코팅)</li>
            <li>화력·고도·습도</li>
            <li>개인 취향</li>
          </ul>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
            봉지 권장량과 다를 수 있으며, 본인 취향에 맞게 조정 권장. 라면은 가끔의 즐거움 — 일주일 1~2회 권장.
          </p>
        </div>

        {/* 10. 함께 쓰면 좋은 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
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
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
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
    </div>
  )
}
