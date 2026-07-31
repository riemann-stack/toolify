import Link from 'next/link'
import GlycemicLoadClient from './GlycemicLoadClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/health/glycemic-load',
  title: '당부하지수(GL) 계산기 — 식품별 GI·GL 조회표',
  description: '음식과 섭취량으로 당부하지수(GL)를 계산하고 한 끼 총 GL을 합산. 밥·과일·간식 GI 조회표와 저·중·고 판정. 혈당 스파이크 관리 참고용.',
  keywords: [
    '당부하지수 계산', 'GL 지수', '혈당지수 GI 표', '당부하지수 낮은 음식',
    '혈당 스파이크 음식', 'GI GL 차이', '혈당지수 계산기', '식품 GI',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

type GiRow =
  | { group: string }
  | { food: string; gi: string; src: string; tone?: 'low' | 'mid' | 'high' }

/* 값은 아래 4개 1차 출처의 표기를 그대로 옮긴 것(포도당=100).
   국제표 = Atkinson FS 등 Diabetes Care 2008;31(12):2281-2283(및 온라인 부록 Table A1) /
            Am J Clin Nutr 2021;114(5):1625-1632(및 ISO 26642 준수 Supplemental Table 1)
   한국(학회지) = 김도연 등, 한국식품영양과학회지 44(1):14-23(2015), 건강 남성 60명
   한국(농진청) = 「탄수화물 다소비 식품의 당지수 관련 분석 및 평가」(농촌진흥청 발주·경희대 수행, 2015), 건강 성인 151명 */
const GI_ROWS: GiRow[] = [
  { group: '밥·죽·떡' },
  { food: '백미밥', gi: '73±4', src: '국제표 2008', tone: 'high' },
  { food: '쌀밥', gi: '69.9±5.7', src: '한국(농진청)', tone: 'mid' },
  { food: '자스민 백미 (18개 연구)', gi: '89', src: '국제표 2021', tone: 'high' },
  { food: '바스마티 백미 (10개 연구)', gi: '60', src: '국제표 2021', tone: 'mid' },
  { food: '현미밥 ※1', gi: '65~68 / 87.6±12.0', src: '국제표 / 한국(농진청)' },
  { food: '흑미밥', gi: '92.4±7.2', src: '한국(농진청)', tone: 'high' },
  { food: '보리밥', gi: '35.4±9.2', src: '한국(농진청)', tone: 'low' },
  { food: '정맥보리 삶음', gi: '28±2', src: '국제표 2008', tone: 'low' },
  { food: '쌀죽', gi: '78±9 / 92.5±8.8', src: '국제표 2008 / 한국(농진청)', tone: 'high' },
  { food: '가래떡', gi: '50.6±7.2', src: '한국(농진청)', tone: 'low' },
  { food: '찹쌀경단', gi: '96.9±15.1', src: '한국(농진청)', tone: 'high' },
  { group: '빵·면·시리얼' },
  { food: '흰 식빵', gi: '75±2', src: '국제표 2008', tone: 'high' },
  { food: '잡곡·씨앗빵 (27종)', gi: '56', src: '국제표 2021', tone: 'mid' },
  { food: '콘플레이크', gi: '81±6', src: '국제표 2008', tone: 'high' },
  { food: '흰 스파게티 삶음', gi: '49±2', src: '국제표 2008', tone: 'low' },
  { food: '소면 국수', gi: '49.0±7.0', src: '한국(농진청)', tone: 'low' },
  { food: '메밀국수', gi: '59.6±13.3', src: '한국(농진청)', tone: 'mid' },
  { food: '인스턴트 라면', gi: '50±2 / 49.3±10.2', src: '국제표 2008 / 한국(농진청)', tone: 'low' },
  { group: '감자·고구마·옥수수' },
  { food: '삶은 감자', gi: '82±7 / 73', src: '국제표 2008 / 2021', tone: 'high' },
  { food: '찐 감자', gi: '93.6±11.6', src: '한국(학회지·농진청)', tone: 'high' },
  { food: '감자전', gi: '28.0±5.1', src: '한국(학회지)', tone: 'low' },
  { food: '삶아 하룻밤 냉장한 감자', gi: '49', src: '국제표 2021', tone: 'low' },
  { food: '군고구마', gi: '90.9±9.6', src: '한국(학회지·농진청)', tone: 'high' },
  { food: '찐 고구마', gi: '70.8±6.1', src: '한국(학회지)', tone: 'high' },
  { food: '삶은 고구마 (13개 연구)', gi: '46', src: '국제표 2021', tone: 'low' },
  { food: '구운 고구마 (11개 연구)', gi: '88', src: '국제표 2021', tone: 'high' },
  { food: '찐 옥수수', gi: '73.4±9.9', src: '한국(학회지)', tone: 'high' },
  { group: '과일·유제품·간식' },
  { food: '생사과', gi: '36±2', src: '국제표 2008', tone: 'low' },
  { food: '생바나나 ※2', gi: '51±3', src: '국제표 2008', tone: 'low' },
  { food: '수박 ※3', gi: '76±4 / 약 50', src: '국제표 2008 / 2021' },
  { food: '전지우유', gi: '39±3', src: '국제표 2008', tone: 'low' },
  { food: '플레인(무가당) 요거트', gi: '19±6', src: '국제표 2008', tone: 'low' },
  { food: '가당 저지방 요거트', gi: '33±3', src: '국제표 2008', tone: 'low' },
  { food: '밀크초콜릿', gi: '43±3', src: '국제표 2008', tone: 'low' },
  { food: '찐 팥', gi: '22.1±3.2', src: '한국(학회지)', tone: 'low' },
]

const TONE_COLOR: Record<'low' | 'mid' | 'high', string> = {
  low: 'var(--success)',
  mid: 'var(--warning)',
  high: 'var(--danger)',
}

/* 한국 기능성 쌀 품종 — ⚠️ 인체시험 GI가 아니라 in vitro(시험관) 소화 실험의 '예측 GI'다.
   출처: Lee C-M 외, Front Plant Sci 2025 Dec 11;16:1724565 (PMC12738849) Table 1(아밀로스)·Table 2(저항전분·예측 GI).
   값·± 표기는 논문 표기 그대로. ISO 26642:2010은 in vitro 결과를 GI라 부르지 말 것을 명시하므로
   위 GI_ROWS(인체시험·국제표)와 같은 층위로 섞거나 색 등급(TONE_COLOR)을 적용하지 말 것.
   백진주는 논문 내 최고 예측 GI 값(신동진 아님) — 아밀로스·저항전분은 이 정리에 옮기지 않아 '—'. */
type RiceRow =
  | { group: string }
  | { name: string; amylose: string; rs: string; pgi: string }

const RICE_ROWS: RiceRow[] = [
  { group: '고아밀로스 계열 (도담쌀·고아미 — 자포니카)' },
  { name: '도담쌀', amylose: '41.83 ± 0.25', rs: '3.51 ± 0.96', pgi: '52.52 ± 0.05' },
  { name: '고아미', amylose: '27.91 ± 0.23', rs: '0.50 ± 0.03', pgi: '57.04 ± 1.25' },
  { name: '고아미2호', amylose: '32.64 ± 0.26', rs: '4.11 ± 0.91', pgi: '58.17 ± 1.76' },
  { name: '고아미4호', amylose: '34.45 ± 0.23', rs: '4.30 ± 1.08', pgi: '58.98 ± 3.67' },
  { group: '슬로미 계열 (인디카 육종 소재)' },
  { name: '슬로미1', amylose: '25.99 ± 0.23', rs: '0.35 ± 0.05', pgi: '55.37 ± 1.94' },
  { name: '슬로미2', amylose: '20.51 ± 0.36', rs: '0.29 ± 0.06', pgi: '59.84 ± 3.00' },
  { name: '슬로미3', amylose: '24.70 ± 0.13', rs: '0.37 ± 0.09', pgi: '54.69 ± 3.26' },
  { group: '비교용으로 함께 옮긴 품종' },
  { name: '신동진', amylose: '19.43 ± 0.21', rs: '0.20 ± 0.00', pgi: '76.85 ± 2.82' },
  { name: '백진주 ※', amylose: '—', rs: '—', pgi: '87.76 ± 8.86' },
]

const FAQ_LD = [
  {
    q: 'GI와 GL(당부하지수)의 차이가 뭔가요?',
    a: '<strong>GI(혈당지수)</strong>는 그 음식의 탄수화물이 <strong>얼마나 빨리 혈당을 올리는지</strong>를 포도당(100) 기준으로 나타낸 값입니다. 하지만 GI는 "실제로 얼마나 먹는지"를 반영하지 못합니다. 대표적으로 <strong>수박은 GI가 72로 높지만</strong> 한 쪽에 든 탄수화물이 적어 실제 혈당 영향은 작습니다. 이를 보완한 것이 <strong>GL(당부하지수) = 탄수화물량 × GI ÷ 100</strong>으로, 먹는 양까지 반영해 더 현실적입니다.',
  },
  {
    q: 'GL은 얼마부터 높은 건가요?',
    a: '1회 섭취 기준으로 <strong>GL 10 이하는 낮음, 11~19는 보통, 20 이상은 높음</strong>으로 봅니다(한국식품영양과학회지 44권 1호 2015년 논문도 저 10 이하·중 10~19·고 20 이상으로 같은 구간을 씁니다). 하루 총합 기준선은 공인된 값이 확인되지 않아 이 도구는 <strong>1회 섭취 기준</strong>으로만 판정합니다. 예를 들어 흰쌀밥 한 공기는 GL이 약 46으로 매우 높고, 사과 한 개는 약 9로 낮습니다. GL이 높은 음식을 자주·많이 먹으면 혈당이 급격히 오르내리는 "혈당 스파이크"가 반복될 수 있습니다.',
  },
  {
    q: '혈당 스파이크가 왜 문제인가요?',
    a: '혈당이 <strong>급격히 올랐다가 급격히 떨어지는 것</strong>을 혈당 스파이크라고 합니다. 반복되면 인슐린 저항성을 키우고, 급강하 뒤에 다시 배고픔·피로·집중력 저하가 오기 쉽습니다. GL이 낮은 음식을 고르고, 흰쌀밥 같은 고GL 음식은 <strong>채소·단백질과 함께, 양을 조절해</strong> 먹으면 스파이크를 완만하게 만들 수 있습니다.',
  },
  {
    q: '같은 음식이라도 GI가 달라질 수 있나요?',
    a: '네, 꽤 많이 달라집니다. <strong>조리법(오래 익힐수록 ↑), 숙성도(잘 익은 바나나 ↑), 가공(주스로 갈면 ↑), 함께 먹는 음식(지방·단백질·식이섬유는 ↓)</strong>에 따라 실제 혈당 반응이 바뀝니다. 그래서 이 조회표의 GI 값은 <strong>대표 참고치</strong>이며, 같은 음식도 상황에 따라 ±10 이상 차이날 수 있습니다.',
  },
  {
    q: 'GL을 낮추는 실전 팁이 있나요?',
    a: '① <strong>먹는 순서</strong> — 채소·단백질을 먼저, 밥·면을 나중에. ② <strong>낮은 GI 곡물 섞기</strong> — 국내 인체시험 기준 보리밥(35.4)은 쌀밥(69.9)의 절반 수준입니다. 다만 현미밥은 국내 시험에서 87.6으로 오히려 높게 나온 값도 있어 &lsquo;통곡물이면 무조건 낮다&rsquo;고 단정하기는 어렵습니다. ③ <strong>통째로 먹기</strong> — 주스보다 생과일, 곱게 간 것보다 덜 가공된 형태. ④ <strong>식후 가벼운 활동</strong> — 10~15분 걷기만으로도 식후 혈당이 완만해집니다. 양을 줄이는 것만으로도 GL은 비례해서 내려갑니다.',
  },
  {
    q: '당뇨가 있으면 이대로 먹으면 되나요?',
    a: '<strong>아니요. 이 도구는 참고용입니다.</strong> 당뇨·임신성 당뇨·전단계가 있으면 개인의 혈당 반응·약물·전체 식단을 고려해야 하므로, 반드시 <strong>의사·영양사와 상의</strong>해 식이를 정하세요. GI·GL은 식품을 비교하는 하나의 지표일 뿐, 열량·영양 균형·전체 식사 맥락을 대체하지 않습니다.',
  },
]

const RELATED = [
  { href: '/tools/health/hba1c', icon: '🩸', name: '당화혈색소 변환기', desc: 'HbA1c↔평균혈당' },
  { href: '/tools/health/bmr', icon: '🔥', name: '기초대사량 계산기', desc: '하루 소비 칼로리' },
  { href: '/tools/health/weightloss', icon: '🎯', name: '체중 감량 계산기', desc: '목표까지 기간' },
  { href: '/tools/cooking/nuts', icon: '🥜', name: '견과류 섭취량 계산기', desc: '하루 적정량' },
  { href: '/tools/health/bmi', icon: '⚖️', name: 'BMI 계산기', desc: '비만도·정상 체중' },
  { href: '/tools/cooking/serving', icon: '🍚', name: '1인분 분량 계산기', desc: '식재료 1인분' },
]

export default function GlycemicLoadPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        건강·웰빙
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="health" />당부하지수(GL) 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        음식·섭취량으로 <strong style={{ color: 'var(--text)' }}>당부하지수(GL)를 계산</strong>하고 한 끼 총 GL 합산 + 식품별 GI 조회표.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="GL = 탄수화물(g)×GI÷100 · 판정 저 ≤10 / 중 11~19 / 고 ≥20 (1회 기준) · GI 조회표는 국제표 2008·2021판 + 한국 인체시험(2015) 원문 값 · 기능성 쌀 품종 표는 인체시험 GI가 아니라 Front Plant Sci 2025;16:1724565의 시험관 예측값(ISO 26642:2010·Atkinson 2021 기준 GI로 부를 수 없음) + 농촌진흥청 보도자료(2014·2021·2026)"
        sources={[
          { label: '국제 GI 표 2008 (Atkinson, Diabetes Care)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2584181/' },
          { label: '국제 GI 표 2021 (Atkinson, Am J Clin Nutr)', href: 'https://nutrition.org/ajcn-publishes-international-tables-of-glycemic-index-and-glycemic-load-values-2021-a-systematic-review/' },
          { label: '한국식품영양과학회지 44(1) 인체시험 (2015)', href: 'https://koreascience.kr/article/JAKO201506565684482.pdf' },
          { label: '기능성 쌀 품종 예측 GI — Front Plant Sci 2025;16:1724565', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12738849/' },
          { label: 'ISO 26642:2010 (GI 측정 표준)', href: 'https://www.iso.org/standard/43633.html' },
        ]}
      />

      <GlycemicLoadClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 공식 */}
        <section>
          <h2 style={sectionTitle}>당부하지수(GL) 계산 공식</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>GL</span> = 1회 섭취 탄수화물(g) × GI ÷ 100</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>판정: 저 ≤10 · 중 11~19 · 고 ≥20 (1회 기준)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>예: 흰쌀밥 1공기 = 66g × 70 ÷ 100 ≈ 46 (고)</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ GI가 높아도 실제 먹는 양의 탄수화물이 적으면 GL은 낮습니다(예: 수박). 그래서 <strong style={{ color: 'var(--text)' }}>양까지 반영한 GL</strong>이 혈당 영향을 더 현실적으로 보여줍니다.
          </p>
        </section>

        {/* 2. GI vs GL 대표 예 */}
        <section>
          <h2 style={sectionTitle}>GI는 높은데 GL은 낮은 음식</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['식품 (1회분)', 'GI', '탄수', 'GL', '판정'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i >= 1 && i <= 3 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['수박 (1쪽)', '50', '11g', '5.5', '낮음', 'var(--success)'],
                  ['흰쌀밥 (1공기)', '70', '66g', '46', '높음', 'var(--danger)'],
                  ['사과 (중 1개)', '36', '25g', '9', '낮음', 'var(--success)'],
                  ['감자 찐 (중 1개)', '94', '24g', '23', '높음', 'var(--danger)'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r[2]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[3]}</td>
                    <td style={{ padding: '10px 12px', color: r[5], fontWeight: 700 }}>{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            수박·사과는 GI만 보면 오해할 수 있지만, 실제 먹는 양 기준 GL은 낮습니다. 반대로 흰쌀밥·감자는 GI도 높고 양도 많아 GL이 큽니다.
            GI는 아래 조회표와 같은 값(흰쌀밥·찐감자는 국내 인체시험, 수박·사과는 국제표)을 쓰며, 조리법·숙성도에 따라 달라질 수 있습니다.
          </p>
        </section>

        {/* 3. 한국 상용 식품 GI 조회표 */}
        <section>
          <h2 style={sectionTitle}>한국 상용 식품 GI 조회표</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, margin: '0 0 14px' }}>
            국제 GI 표(2008·2021판)와 한국인을 대상으로 한 국내 인체시험 값을 <strong style={{ color: 'var(--text)' }}>출처를 나눠 그대로</strong> 실었습니다.
            국제표 2008판 부록(정상 내당능 1,879항목)과 2021판 ISO 26642 준수 표(약 2,100항목)에서 한국에서 시험된 식품 항목은 확인되지 않아,
            밥·떡·국수처럼 한국 식단 고유 항목은 국내 연구 값을 별도 행으로 병기했습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['식품 (조리 형태)', 'GI', '출처'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 1 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GI_ROWS.map((r, i) => 'group' in r ? (
                  <tr key={i} style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                    <th scope="rowgroup" colSpan={3} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em' }}>
                      {r.group}
                    </th>
                  </tr>
                ) : (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.food}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: r.tone ? TONE_COLOR[r.tone] : 'var(--text)' }}>{r.gi}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.src}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.8 }}>
            포도당=100 기준. 색은 <strong style={{ color: 'var(--success)' }}>저 GI ≤55</strong> · <strong style={{ color: 'var(--warning)' }}>중 56~69</strong> · <strong style={{ color: 'var(--danger)' }}>고 ≥70</strong> 구분이며, ± 표기는 원 논문의 오차 표기(국제표 2008판은 평균±표준오차)를 그대로 옮긴 것입니다.
            <br />출처 — 국제표: Atkinson FS 등, <em>Diabetes Care</em> 2008;31(12):2281-2283 및 온라인 부록 Table A1 / Atkinson FS 등, <em>Am J Clin Nutr</em> 2021;114(5):1625-1632 및 ISO 26642:2010 준수 Supplemental Table 1.
            한국(학회지): 김도연 등, 「탄수화물 간식류 식품 및 조리방법에 따른 혈당지수 및 혈당부하지수」, 한국식품영양과학회지 44(1):14-23(2015) — 건강 남성 60명 인체시험.
            한국(농진청): 「탄수화물 다소비 식품의 당지수 관련 분석 및 평가」(농촌진흥청 발주·경희대학교 수행, 2015) — 건강 성인 151명, 13종을 50가지 조리 형태로 측정.
            <br />⚠️ GI는 <strong style={{ color: 'var(--text)' }}>시험 조건에 따라 변동</strong>하는 값입니다 — 품종·도정·불림·가열 시간·측정 실험실이 달라지면 같은 식품도 값이 크게 바뀌므로(국제표의 개별 백미 항목만 해도 GI 38~93 분포), 표의 값은 확정치가 아니라 대표 참고치로만 쓰세요.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: 'var(--text)' }}>※1 현미밥</strong> — 국제표는 65(2021판 현미 평균)~68±4(2008판)인데 국내 인체시험은 87.6±12.0으로 20 이상 벌어집니다. 품종·조리 조건에 따라 연구 간 차이가 커서 어느 값이 한국 현미밥을 대표하는지 확정할 수 없어 두 값을 함께 적었습니다.<br />
              <strong style={{ color: 'var(--text)' }}>※2 생바나나</strong> — 숙성도에 따라 덜 익은 것 39, 잘 익은 것 47±5, 과숙 57±8(2021판)로 달라집니다.<br />
              <strong style={{ color: 'var(--text)' }}>※3 수박</strong> — 2008판 대표값은 여러 연구 평균 76±4(개별 호주 시험 72±13·80±3), 2021판은 말레이시아 ISO 준수 시험 4건 평균 약 50입니다. 다만 1회 120 g의 이용가능 탄수화물이 6 g뿐이어서 <strong style={{ color: 'var(--text)' }}>GL은 4~5로 낮다</strong>는 결론은 양쪽이 같습니다.
            </p>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.8 }}>
            표에서 가장 눈에 띄는 것은 <strong style={{ color: 'var(--text)' }}>조리법이 GI 순서를 뒤집는다</strong>는 점입니다. 같은 감자가 찜 93.6 → 감자전 28.0(국내 인체시험), 국제표에서도 삶은 감자 73 → 삶아 하룻밤 냉장 49로 내려갑니다.
            국내 논문은 그 기전을 죽처럼 분쇄·가열하면 표면적이 늘어 소화효소가 쉽게 작용해 GI가 오르고, 튀기면 amylose-lipid 복합체가 α-amylase 소화를 늦춰 GI가 내려간다고 설명합니다.
            같은 논문이 <strong style={{ color: 'var(--text)' }}>“튀김류는 GI가 낮아도 장기 섭취 시 대사성질환 위험이 높아 자주 먹는 것을 피해야 한다”</strong>고 못박은 것도 함께 기억할 부분입니다 — 저GI는 건강식 인증이 아닙니다.
            국내 연구가 필요한 이유도 명확합니다. 농촌진흥청 보고서는 비만·당뇨 환자 식사요법에 외국 당지수를 그대로 쓰는 것은 매우 불합리하며 한국 고유 GI 자료가 필수라고 밝혔습니다.
          </p>
        </section>

        {/* 4. 한국 기능성 쌀 품종 — in vitro 예측 GI */}
        <section>
          <h2 style={sectionTitle}>한국 기능성 쌀 품종 — 이건 GI가 아니라 「개발 지표」입니다</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, margin: '0 0 14px' }}>
            농촌진흥청은 도담쌀을 <strong style={{ color: 'var(--text)' }}>&ldquo;저항전분이 많고 혈당지수가 낮은 쌀 품종&rdquo;</strong>이라고 설명합니다.
            이런 국산 기능성 쌀에는 GI처럼 보이는 숫자가 붙어 다니는데, 원 논문을 열어 보면 그 값은 <strong style={{ color: 'var(--text)' }}>사람에게 먹여 잰 값이 아니라 시험관(in vitro) 소화 실험에서 나온 예측치</strong>입니다.
            표를 보기 전에 이 구분부터 짚습니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning)', margin: '0 0 8px' }}>
              ⚠️ 먼저 — 아래 표의 값은 GI가 아닙니다
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.85, margin: 0 }}>
              ① GI 측정의 국제 표준인 <strong style={{ color: 'var(--text)' }}>ISO 26642:2010</strong>은 서문에서, 시험관 방법으로 소화율·가수분해 지수를 얻을 수는 있어도
              그 결과를 <strong style={{ color: 'var(--text)' }}>&ldquo;GI 값이라고 불러서는 안 된다&rdquo;</strong>(the results should not be referred to as GI values)고 못박습니다.<br />
              ② 같은 표준은 GI 측정 자체를 <strong style={{ color: 'var(--text)' }}>사람 지원자(human volunteers)</strong>의 혈당 반응을 재는 것으로 정의하고(2.7항),
              건강한 피험자를 <strong style={{ color: 'var(--text)' }}>최소 10명</strong> 선발하도록 요구합니다(5.3.1항).<br />
              ③ 또 GI는 <strong style={{ color: 'var(--text)' }}>실제로 시험한 그 식품에, 먹은 그 상태 그대로만</strong> 부여할 수 있고(only tested foods shall have a GI assigned, 4장),
              재료별 값을 수학적으로 계산해 만들어낼 수 없습니다.<br />
              ④ 국제 GI 표(Atkinson 2021)도 ISO 준수 데이터(약 2,100항목)를 별도 목록으로 분리했고,
              <strong style={{ color: 'var(--text)' }}> 시험관 방법으로 GI를 추정한 연구는 수록 대상에서 아예 제외</strong>했습니다.<br />
              → 그래서 아래 표는 위 GI 조회표(인체시험·국제표 값)와 <strong style={{ color: 'var(--text)' }}>같은 줄에 놓고 비교할 수 없습니다</strong>.
              품종을 고르고 개량하기 위한 실험실 지표로만 읽으세요. 아래 표에 저·중·고 색을 입히지 않은 것도 같은 이유입니다.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['품종', '아밀로스(%)', '저항전분(%)', '예측 GI (시험관)'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RICE_ROWS.map((r, i) => 'group' in r ? (
                  <tr key={i} style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                    <th scope="rowgroup" colSpan={4} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em' }}>
                      {r.group}
                    </th>
                  </tr>
                ) : (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.name}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.amylose}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.rs}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.pgi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.8 }}>
            전부 Lee C-M 등, <em>Front Plant Sci</em> 2025;16:1724565(2025년 12월 11일 게재)의 Table 1·Table 2 값이며 ± 는 논문의 표준편차입니다.
            아밀로스는 비색법 측정치, 예측 GI는 시험관 가수분해 곡선의 면적을 논문의 회귀식(pGI = 0.0781 × 보정 AUC + 47.8876)에 넣어 산출한 값입니다.
            품종별 아밀로스·저항전분 수치는 <strong style={{ color: 'var(--text)' }}>이 연구의 측정치</strong>이지 농촌진흥청이 공표한 품종 스펙이 아닙니다.
            <br />※ 백진주는 여기에 예측 GI만 옮겼습니다. 논문이 다룬 16개 계통 가운데 예측 GI가 가장 높은 것은 신동진(76.85)이 아니라 <strong style={{ color: 'var(--text)' }}>백진주(87.76)</strong>이며, 신선찰(87.66 ± 10.36)도 신동진보다 높습니다.
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.8 }}>
            표를 세로로 훑으면 <strong style={{ color: 'var(--text)' }}>저항전분 순위와 예측 GI 순위가 일치하지 않는다</strong>는 점이 먼저 보입니다.
            이 논문 측정에서 저항전분이 가장 높은 것은 고아미4호(4.30%)·고아미2호(4.11%)이고 도담쌀(3.51%)은 그다음인데, 예측 GI가 가장 낮은 것은 도담쌀입니다.
            논문은 그 이유를 저항전분 단독이 아니라 <strong style={{ color: 'var(--text)' }}>가장 높은 아밀로스 함량(41.83%)과 결합된 결과</strong>로 설명합니다.
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.8 }}>
            논문 저자들도 선을 그었습니다 — 결론에서 이 계통들을 상업적으로 제안하기 전에 <strong style={{ color: 'var(--text)' }}>&ldquo;human clinical validation … are required&rdquo;</strong>(사람 대상 임상 검증이 필요하다)고 명시했고,
            장기적인 혈당 이점은 인체 임상시험으로 확인해야 한다고 덧붙였습니다. 실제로 이 연구의 생체 검증은 사람이 아니라 <strong style={{ color: 'var(--text)' }}>생쥐(군당 5마리)</strong> 실험이었습니다.
            덧붙여 ISO 26642는 저항전분처럼 소화가 잘 안 되는 탄수화물을 GI 시험용 탄수화물 50 g(또는 25 g)에 의도적으로 포함하지 않도록 하고,
            시험 중 섭취량이 위장 불편을 일으킬 만큼 저항전분이 많은 식품은 <strong style={{ color: 'var(--text)' }}>GI 시험에 적합하지 않다</strong>고 봅니다. 고저항전분 쌀은 애초에 GI 시험 설계가 까다로운 대상입니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>도담쌀은 어떤 쌀인가</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.85, margin: 0 }}>
              농촌진흥청이 <strong style={{ color: 'var(--text)' }}>2013년 개발</strong>한 품종으로, 고아미와 고아미2호를 교배해 얻은 자포니카 계통입니다.
              공식 설명부터가 <strong style={{ color: 'var(--text)' }}>&ldquo;일반 밥쌀과 전분구조가 달라서 주로 가공용으로 이용되는 기능성 쌀&rdquo;</strong> — 밥쌀 대체재로 소개된 품종이 아닙니다.
              2014년 발표 당시 수치는 아밀로스 <strong style={{ color: 'var(--text)' }}>42.8%</strong>(일반 쌀의 2배), 저항전분 <strong style={{ color: 'var(--text)' }}>13.6%</strong>(일반 쌀의 10배 정도), 식이섬유 5.3%였고,
              현행 공식 표현은 &ldquo;저항전분 <strong style={{ color: 'var(--text)' }}>10% 이상</strong>&rdquo;입니다(2026년 7월 보도자료 기준).<br />
              여기서 정직하게 밝혀 둘 것이 있습니다. <strong style={{ color: 'var(--text)' }}>농진청의 13.6%와 위 표 논문의 3.51%는 크게 다릅니다.</strong>
              두 수치 모두 각각의 1차 출처에서 그대로 확인되지만, 어느 쪽 자료에도 측정 조건을 맞대어 비교한 내용이 없어 <strong style={{ color: 'var(--text)' }}>차이의 원인은 확인되지 않았습니다</strong>.
              그래서 이 글은 한쪽을 고르지 않고 두 수치를 병기합니다.<br />
              유통은 실재합니다. 2026년 7월 기준 관련 기술이전이 70여 건(35개 업체)에 이르고 <strong style={{ color: 'var(--text)' }}>쌀과자·쌀국수·선식·즉석밥</strong>으로 상용화됐으며,
              진천·남해 지역 농가와 40헥타르 규모 계약재배로 원료곡을 공급받고 있습니다.
            </p>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>사람 대상 시험은 있습니다 — 다만 GI 측정이 아닙니다</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.85, margin: 0 }}>
              농촌진흥청은 차병원과 공동으로, 농진청 기술이 적용된 <strong style={{ color: 'var(--text)' }}>도담쌀 선식</strong>을 비만 환자에게 적용한 인체적용시험을 수행해
              인슐린 저항성 지표인 <strong style={{ color: 'var(--text)' }}>HOMA-IR가 38.2% 감소</strong>하고 당독소(AGEs) 축적이 <strong style={{ color: 'var(--text)' }}>3% 감소</strong>했다고 발표했습니다(게재지 <em>Nutrients</em> 2023;15:2248, 농진청 보도자료 경유 확인).
              즉 사람 대상 자료가 아예 없는 것은 아닙니다. 다만 이 시험이 본 것은 인슐린 저항성·당독소 <strong style={{ color: 'var(--text)' }}>지표</strong>이지 ISO 26642 방식의 GI 값을 산출한 것이 아닙니다.
              &ldquo;도담쌀은 인체시험으로 GI가 낮다고 입증됐다&rdquo;고 말할 수 있는 자료는 확인되지 않습니다.
            </p>
          </div>

          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.8 }}>
            한 가지 더. <strong style={{ color: 'var(--text)' }}>슬로미1~3은 완성된 보급 품종이 아닙니다.</strong>
            논문도 이들을 기능성 품종 개발을 위한 <strong style={{ color: 'var(--text)' }}>&ldquo;promising prototypes&rdquo;</strong>(유망한 시제 계통)로 서술하고,
            농촌진흥청 국립식량과학원 보도자료 본문 검색(2026년 7월 31일 조회)에서 &lsquo;슬로미&rsquo;는 0건입니다 — 같은 검색에서 &lsquo;도담쌀&rsquo;은 7건, &lsquo;고아미&rsquo;는 10건이 나옵니다.
            계통도 도담쌀·고아미(자포니카)와 달리 인디카(장립종)입니다. 표에서 보듯 저항전분도 0.29~0.37%로 비교용으로 함께 옮긴 신동진(0.20%)과 큰 차이가 없어,
            저항전분이 3~4%대로 나온 <strong style={{ color: 'var(--text)' }}>도담쌀·고아미2호·고아미4호와 한 묶음으로 볼 수는 없습니다</strong>. 시장에서 찾을 수 있는 쌀로 생각하지 마세요.
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.8 }}>
            출처 — Lee C-M 등, 「Evaluation of glycemic response and starch digestibility in Korean rice toward the development of low GI rice」, <em>Front Plant Sci</em> 2025;16:1724565 (Table 1·2, Discussion·Conclusion) /
            ISO 26642:2010 <em>Food products — Determination of the glycaemic index (GI) and recommendation for food classification</em> (Introduction·2.7·4장·5.3.1) /
            Atkinson FS 등, <em>Am J Clin Nutr</em> 2021;114:1625-1632 /
            농촌진흥청 보도자료 2014년 8월 25일, 국립식량과학원 보도자료 2021년 8월 20일·2026년 7월 23일.
          </p>
        </section>

        {/* 5. GL 낮추기 */}
        <section>
          <h2 style={sectionTitle}>혈당 스파이크 줄이는 실전 습관</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {[
              { t: '먹는 순서 바꾸기', d: '채소·단백질 먼저 → 밥·면 나중에. 식후 혈당 상승이 완만해집니다.' },
              { t: '보리·콩 섞어 먹기', d: "국내 인체시험에서 보리밥 GI는 35.4로 쌀밥(69.9)의 절반 수준. 반면 현미밥·통밀빵은 흰쌀밥·흰빵과 큰 차이가 없거나 더 높게 나온 시험도 있어, '통곡물이면 무조건 낮다'고 보기는 어렵습니다." },
              { t: '주스보다 생과일', d: '갈거나 즙을 내면 GI가 올라갑니다. 통째로 씹어 먹기.' },
              { t: '식후 10분 걷기', d: '가벼운 활동만으로도 식후 혈당이 낮아집니다.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>✅ {c.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

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
