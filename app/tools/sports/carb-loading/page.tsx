import Link from 'next/link'
import CarbLoadingClient from './CarbLoadingClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/sports/carb-loading',
  title: '카보로딩 계산기 — 마라톤 탄수화물 로딩 플래너',
  description: '체중·대회 유형으로 대회 전 하루 탄수화물 목표량(g)과 날짜별 플랜을 계산. 밥·바나나·에너지젤 등 음식 환산 + 대회 아침 섭취량까지.',
  keywords: [
    '카보로딩', '카보로딩 방법', '마라톤 카보로딩', '탄수화물 로딩', '글리코겐 로딩',
    '마라톤 전날 식사', '카보로딩 음식', '대회 전 식단',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

const FAQ_LD = [
  {
    q: '카보로딩이 뭔가요?',
    a: '<strong>카보로딩(carbohydrate loading, 글리코겐 로딩)</strong>은 지구력 대회 전에 탄수화물을 평소보다 많이 먹어 근육·간에 저장되는 <strong>글리코겐(에너지 저장 형태)</strong>을 최대로 채워두는 식이 전략입니다. 마라톤처럼 90분을 넘는 경기에서는 저장된 글리코겐이 바닥나면 이른바 "벽(bonking)"에 부딪혀 급격히 느려지는데, 로딩으로 이 시점을 늦출 수 있습니다.',
  },
  {
    q: '탄수화물을 얼마나 먹어야 하나요?',
    a: '풀코스·울트라처럼 <strong>90분을 넘는 경기</strong>는 대회 전 1~2일간 <strong>체중 1kg당 10~12g</strong>의 탄수화물이 권장됩니다(IOC·ACSM). 65kg이면 하루 650~780g입니다. 하프나 60~90분 경기는 8~10g/kg, 10km 이하 짧은 경기는 7~8g/kg 정도로 전날 일반 충전이면 충분하고 굳이 극단적인 로딩은 필요 없습니다. 위 계산기에 체중과 대회 유형을 넣으면 하루 목표량과 음식 환산이 나옵니다.',
  },
  {
    q: '언제부터 시작해야 하나요?',
    a: '풀코스 기준 <strong>대회 2~3일 전(D-2)부터</strong> 시작하는 것이 일반적입니다. 예전에는 일주일 전 탄수화물을 극도로 줄였다가 채우는 "고갈-로딩" 방식을 썼지만, 요즘은 <strong>고갈 단계 없이 대회 전 36~48시간만 충전</strong>하는 방식이 부작용이 적고 효과는 비슷하다고 봅니다. 이 기간에는 훈련량을 줄여(테이퍼링) 저장된 글리코겐을 아껴야 합니다.',
  },
  {
    q: '로딩하면 몸무게가 느는데 괜찮나요?',
    a: '흔히 나타나는 반응입니다. 글리코겐은 몸에 저장될 때 수분을 함께 끌어들이기 때문에, 로딩을 제대로 하면 <strong>체중이 늘고 몸이 약간 무겁게</strong> 느껴진다고 알려져 있습니다(자주 인용되는 &lsquo;글리코겐 1g당 물 3g·체중 1~2kg 증가&rsquo;라는 수치는 널리 퍼져 있지만 ACSM/AND/DC 2016 공동 성명 등 공식 지침에서 확인되는 값은 아니라, 여기서는 수치 없이 경향만 적습니다). 늘어난 체중을 걱정해 로딩을 건너뛰면 후반에 더 크게 무너질 수 있습니다.',
  },
  {
    q: '무엇을 먹어야 하나요?',
    a: '소화가 잘 되고 <strong>지방·식이섬유가 적은 탄수화물</strong> 위주가 좋습니다 — 흰쌀밥·떡·감자·고구마·파스타·식빵·바나나·스포츠음료 등. 로딩 기간에 <strong>식이섬유(현미·잡곡·채소)를 줄이면</strong> 대회 당일 화장실 문제를 줄일 수 있습니다. 가장 중요한 원칙은 <strong>대회 당일과 전날에 새로운 음식을 시도하지 않는 것</strong> — 반드시 평소 먹어 소화가 검증된 음식만 드세요.',
  },
  {
    q: '대회 당일 아침은 어떻게 먹나요?',
    a: '출발 <strong>1~4시간 전에 체중 1kg당 1~4g</strong>의 탄수화물을 먹습니다(ACSM). 시작 시간이 가까울수록 적게, 소화 시간이 넉넉할수록 많이 드세요. 예를 들어 출발 3시간 전이라면 밥·바나나·식빵 등으로 충분히, 1시간 전이라면 바나나·에너지젤처럼 가볍고 빠른 것으로. 카페인에 익숙하다면 커피 한 잔도 도움이 될 수 있지만, 이 역시 평소 마시던 것만 드세요.',
  },
]

const RELATED = [
  { href: '/tools/sports/race-plan', icon: '🏁', name: '레이스 페이스 플래너', desc: '구간별 목표 페이스' },
  { href: '/tools/health/heat-hydration', icon: '💧', name: '폭염 수분·전해질', desc: '대회 수분 전략' },
  { href: '/tools/sports/race-predictor', icon: '⏱️', name: '마라톤 기록 계산기', desc: '완주 예상 시간' },
  { href: '/tools/sports/pace', icon: '🏃', name: '러닝 페이스 계산기', desc: '페이스↔기록 환산' },
  { href: '/tools/health/bmr', icon: '🔥', name: '기초대사량 계산기', desc: '하루 소비 칼로리' },
  { href: '/tools/sports/vo2max', icon: '🫁', name: 'VO₂ Max 계산기', desc: '심폐 체력 추정' },
]

export default function CarbLoadingPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        스포츠
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="sports" />카보로딩 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        마라톤 대회 전 <strong style={{ color: 'var(--text)' }}>하루 탄수화물 목표량과 날짜별 플랜</strong> + 밥·바나나·젤 음식 환산.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="ACSM/AND/DC 2016 공동 성명 Table 2 (g/kg) + 국가표준식품성분 DB 10.4(2026)"
        sources={[
          { label: 'ACSM/AND/DC 공동 성명 — Nutrition and Athletic Performance (2016)', href: 'https://pubmed.ncbi.nlm.nih.gov/26891166/' },
          { label: '농촌진흥청 농식품올바로 — 국가표준식품성분표', href: 'https://koreanfood.rda.go.kr/kfi/fct/fctFoodSrch/list' },
        ]}
      />

      <CarbLoadingClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 원리 */}
        <section>
          <h2 style={sectionTitle}>카보로딩은 왜, 어떻게 효과가 있나</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            우리 몸은 탄수화물을 <strong style={{ color: 'var(--text)' }}>글리코겐</strong> 형태로 근육과 간에 저장합니다. 하지만 저장량은 한정돼 있어, 마라톤처럼 오래 달리면 대개 <strong style={{ color: 'var(--text)' }}>30km 안팎에서 바닥</strong>나며 이때 몸이 급격히 무거워지는 &lsquo;벽&rsquo;을 만납니다. 대회 전 며칠간 탄수화물을 늘리고 운동량을 줄이면 이 저장고를 평소보다 크게 채워, 벽에 부딪히는 시점을 뒤로 미룰 수 있습니다.
          </p>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>하루 목표(g)</span> = 체중(kg) × 탄수화물 계수(g/kg)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>90분 초과: 10~12 · 60~90분: 8~10 · 60분 이내: 7~8</div>
            <div><span style={{ color: 'var(--muted)' }}>대회 아침</span> = 체중 × 1~4 g (출발 1~4시간 전)</div>
          </div>
        </section>

        {/* 2. 대회 유형별 표 */}
        <section>
          <h2 style={sectionTitle}>대회 유형별 로딩 가이드</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대회', '탄수화물', '로딩 기간', '비고'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 1 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['풀코스·울트라', '10~12 g/kg', '대회 전 2일', '집중 로딩 효과 큼'],
                  ['하프·장시간 훈련', '8~10 g/kg', '대회 전날', '가벼운 충전'],
                  ['10km 이하', '7~8 g/kg', '대회 전날', '극단 로딩 불필요'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 공식 지침 원문 수치 */}
        <section>
          <h2 style={sectionTitle}>공식 지침 권장량 — ACSM/AND/DC 2016</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            미국스포츠의학회(ACSM)·미국영양학회(AND)·캐나다영양사협회(DC)가 함께 낸 공동 성명 <strong style={{ color: 'var(--text)' }}>Nutrition and Athletic Performance(2016)</strong>의 Table 2는 경기 전·중 탄수화물 섭취량을 상황별로 못 박아 두었습니다. 아래는 그 표에서 지구력 대회에 해당하는 행을 그대로 옮긴 것입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['상황', '권장량', '조건·단서'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 1 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['카보로딩', '10~12 g/kg', '90분 초과 지속·간헐 고강도 경기 준비 — 36~48시간 동안 24시간당'],
                  ['일반 연료 보충', '7~12 g/kg', '90분 미만 경기 준비 — 로딩이 아니라 평소 하루 필요량 수준으로 24시간당'],
                  ['경기 전 식사', '1~4 g/kg', '60분 초과 운동에 한해 — 시작 1~4시간 전'],
                  ['경기 중 45분 미만', '불필요', '따로 챙길 필요 없음'],
                  ['경기 중 45~75분', '소량', '고강도 지속 운동 — 마우스 린스(입안 헹굼)를 포함한 소량'],
                  ['경기 중 1~2.5시간', '30~60 g/h', '지구성 경기 + 스톱앤고 방식의 종목 포함'],
                  ['경기 중 2.5~3시간 초과', '최대 90 g/h', '포도당:과당 같은 복합 수송 탄수화물일 때 높은 산화율 달성'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', whiteSpace: 'nowrap' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: '10px 0 0' }}>
            같은 표의 하루 필요량은 훈련 강도에 따라 저강도 3~5, 중강도(약 1시간/일) 5~7, 지구성 프로그램(1~3시간/일) 6~10, 극단적 훈련량(4~5시간/일 초과) 8~12 g/kg/일입니다. 카보로딩의 10~12 g/kg는 훈련량이 가장 많은 선수의 평상시 상한과 맞먹는 양인 셈입니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>이 계산기의 값은 표의 어디에 해당하나</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.75, margin: 0 }}>
              &lsquo;풀코스·울트라(90분 초과)&rsquo;를 골랐을 때 나오는 <strong style={{ color: 'var(--text)' }}>10~12 g/kg</strong>는 표의 카보로딩 행 그대로입니다. 하프·10km에 쓰는 8~10·7~8 g/kg는 90분 미만 경기의 <strong style={{ color: 'var(--text)' }}>7~12 g/kg</strong> 범위 안에서 잡은 값으로, 지침상 상한은 12 g/kg입니다. 결과 카드의 &lsquo;대회 아침 체중×1~4g&rsquo;은 경기 전 식사 행(60분 초과 운동, 시작 1~4시간 전)에 해당합니다. 다만 <strong style={{ color: 'var(--text)' }}>경기 중 섭취는 이 계산기가 다루지 않으므로</strong> 위 표의 시간당 g을 따로 챙겨야 합니다 — 상한 90 g/h는 IOC 스포츠영양 합의문(2010)도 &lsquo;약 3시간을 넘는 경기&rsquo;의 목표치로 동일하게 제시하며, 장에서 흡수를 견디도록 훈련 때 미리 연습하라고 못 박습니다.
            </p>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: '10px 0 0' }}>
            기준 시점 — ACSM은 2026년 6월 이 성명의 개정판 집필진을 공모했고(완료 예상 24개월), 2026년 7월 현재 인용 가능한 최신 현행판은 <strong style={{ color: 'var(--text)' }}>2016년판</strong>입니다.
          </p>
        </section>

        {/* 4. 섭취량 감 잡기 */}
        <section>
          <h2 style={sectionTitle}>섭취량 감 잡기 — 100 g당 탄수화물</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            &lsquo;하루 700 g&rsquo;이 얼마나 되는 양인지 감이 오지 않는다면 아래 표를 기준으로 잡으세요. 농촌진흥청 국가표준식품성분표(<strong style={{ color: 'var(--text)' }}>국가표준식품성분 DB 10.4, 2026</strong>) 수록값이며 모두 <strong style={{ color: 'var(--text)' }}>100 g 기준</strong>입니다. 면류는 삶으면 물을 머금어 100 g당 탄수화물이 크게 낮아지므로 조리 상태를 함께 봐야 합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['식품 (100 g)', '탄수화물', '열량'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['꿀', '84.83 g', '313 kcal'],
                  ['귀리 오트밀', '64.9 g', '382 kcal'],
                  ['백설기', '53.45 g', '245 kcal'],
                  ['인절미(콩고물)', '49.69 g', '231 kcal'],
                  ['식빵(쇼트닝 첨가)', '49.61 g', '267 kcal'],
                  ['가래떡', '48.8 g', '213 kcal'],
                  ['찐 고구마', '39.41 g', '163 kcal'],
                  ['스파게티면(삶은 것)', '36.83 g', '197 kcal'],
                  ['현미밥', '35.34 g', '166 kcal'],
                  ['즉석밥(백미)', '33.59 g', '152 kcal'],
                  ['백미밥', '31.71 g', '146 kcal'],
                  ['소면(삶은 것)', '25.36 g', '126 kcal'],
                  ['바나나(생것)', '20 g', '77 kcal'],
                  ['찐 감자(수미)', '17.28 g', '75 kcal'],
                  ['이온 음료(레몬향)', '9.16 g', '37 kcal'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: '10px 0 0' }}>
            표의 &lsquo;이온 음료&rsquo;는 특정 브랜드 제품이 아니라 성분표에 실린 일반 대표값입니다(100 g당 나트륨 44 mg·칼륨 22 mg). mL 단위로 환산하려면 밀도 보정이 필요하므로 100 g 기준으로 적었고, 국내 시판 제품의 실제 값은 제품 라벨을 확인하세요. 성분표는 개정판마다 값이 조금씩 달라지므로 위 수치는 <strong style={{ color: 'var(--text)' }}>현행 DB 10.4(2026)</strong> 기준임을 함께 봐 주세요.
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: '10px 0 0' }}>
            위 계산기 결과의 <strong style={{ color: 'var(--text)' }}>&lsquo;음식으로 환산하면&rsquo;</strong> 목록도 이 표와 같은 성분표 값에서 산출합니다(밥 1공기는 31.71 g/100 g × 210 g ≒ 67 g, 식빵 1장은 49.61 × 0.35 ≒ 17 g). 계산기 목록은 &lsquo;하루 목표를 한 가지 음식으로만 채우면 몇 인분인가&rsquo;를 가늠하는 용도이므로 정수로 반올림해 표시합니다. 에너지젤은 제조사 공식 표기가 Maurten 25 g · SiS 22 g · GU 21~23 g으로 달라 대표값 25 g을 씁니다.
          </p>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, margin: '16px 0 0' }}>
            보건복지부·한국영양학회의 2020 한국인 영양소 섭취기준은 곡류군 1인 1회 분량을 <strong style={{ color: 'var(--text)' }}>밥 210 g</strong>으로 잡습니다. 성분표 값으로 환산하면 밥 한 공기가 탄수화물 약 <strong style={{ color: 'var(--text)' }}>66.6 g</strong>(31.71×2.1로 계산한 값이며 성분표 수록값은 아님). 체중 70 kg이 카보로딩 하한 10 g/kg, 즉 하루 700 g을 흰밥만으로 채우려면 약 10.5공기가 필요하다는 뜻입니다. 그래서 같은 100 g에 흰밥의 약 1.5~1.7배가 들어가는 <strong style={{ color: 'var(--text)' }}>떡</strong>이나 꿀처럼 부피 대비 밀도가 높은 급원을 섞고, 끼니 사이 간식으로 나눠 넣는 것이 실전 요령입니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>에너지젤 1회분 (제조사 공식 표기)</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.75, margin: 0 }}>
              Maurten GEL 100 = 사셰당 <strong style={{ color: 'var(--text)' }}>25 g</strong>(과당:포도당 0.8:1, 약 100 kcal) · SiS GO Isotonic 60 mL = <strong style={{ color: 'var(--text)' }}>22 g</strong> · GU Original = <strong style={{ color: 'var(--text)' }}>21~23 g</strong>(1개 100 kcal, 맛에 따라 차이). 시간당 90 g을 젤로만 채운다면 22 g 제품 기준 약 4개가 필요하다는 계산이 나오고, SiS도 &lsquo;종목·강도에 따라 시간당 1~3개로 60~90 g 목표&rsquo;라고 안내합니다. GU는 1~2시간 운동에서 20~30분마다 1개를 수분과 함께 섭취하도록 권합니다.
            </p>
          </div>
        </section>

        {/* 5. 실수 */}
        <section>
          <h2 style={sectionTitle}>흔한 실수 4가지</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {[
              { t: '새 음식 시도', d: '대회 전날·당일 처음 먹는 음식은 배탈 위험. 검증된 음식만.' },
              { t: '지방·기름 과다', d: '삼겹살·튀김 등은 소화 느림. 탄수화물 위주로.' },
              { t: '식이섬유 과다', d: '현미·잡곡·생채소는 화장실 문제. 로딩 땐 흰쌀·정제 탄수화물.' },
              { t: '운동을 그대로', d: '로딩 기간에 훈련량 안 줄이면 채운 글리코겐을 다 써버림.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>❌ {c.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 면책 */}
        <Disclaimer
          variant="medical"
          open
          sources={[
            { label: 'ACSM/AND/DC 공동 성명 — Nutrition and Athletic Performance (2016), Table 2', href: 'https://pubmed.ncbi.nlm.nih.gov/26891166/' },
            { label: '농촌진흥청 농식품올바로 — 국가표준식품성분표 (DB 10.4, 2026)', href: 'https://koreanfood.rda.go.kr/kfi/fct/fctFoodSrch/list' },
          ]}
        >
          본 계산기는 <strong>일반 스포츠영양 가이드</strong>이며 개인 맞춤 처방이 아닙니다. 권장량은 <strong>ACSM/AND/DC 2016 공동 성명</strong>(2026년 7월 현재 현행판, 개정 진행 중) 기준이고, 본문 음식 표는 국가표준식품성분표 100 g당 수록값(계산기의 음식 환산 목록은 1인분 기준 통용 근사값)입니다. 당뇨·신장질환 등 질환이 있거나 식이 조절이 필요한 경우 반드시 전문의·임상영양사와 상담 후 적용하세요.
        </Disclaimer>

        {/* 7. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {RELATED.map((t, i) => (
              <Link key={i} href={t.href} style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, textDecoration: 'none' }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
