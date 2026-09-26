import Link from 'next/link'
import FoodStorageClient from './FoodStorageClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/cooking/food-storage',
  title: '식재료 보관 계산기 — 냉장·냉동 소비 기한 D-day',
  description: '냉장·냉동 식재료가 언제까지 안전한지 소비 기한 D-day로 관리. 식약처 소비기한 참고값을 바탕으로 닭고기·밥·국·우유·두부 등 식품별 보관 기간 가이드를 제공합니다.',
  keywords: ['식재료보관기간계산기', '닭고기냉장며칠', '익힌고기냉장며칠', '국냉장며칠', '밥냉동며칠', '다진고기냉장', '냉동보관기간', '소비기한계산기', '식재료유통기한'],
})

const FAQ_LD = [
              { q: '익힌 고기는 냉장고에서 며칠까지 먹을 수 있나요?',
                a: '조리 후 3~4일 이내가 일반적인 권장 기준입니다(계산기: 소·돼지고기 4일, 닭고기 3일). 조리 직후 빠르게 식혀 밀폐 보관했을 때 기준이며, 실온에 2시간 이상 두었거나 여러 번 데워 먹었다면 더 짧아집니다. 기한 안에 못 먹을 것 같다면 1회분씩 소분해 냉동(2~3개월)으로 옮기세요. 가공식품의 식품유형별 기준은 식약처가 식품안전나라(foodsafetykorea.go.kr)에 공개한 「식품유형별 소비기한 설정 보고서」 등 소비기한 자료에서 확인할 수 있습니다.' },
              { q: '한 번 해동한 고기를 다시 냉동해도 되나요?',
                a: '권장되지 않습니다. 얼렸다 녹이는 동안 표면 온도가 올라가 세균이 늘 수 있고, 다시 얼려도 세균은 죽지 않으며, 얼음 결정 때문에 육즙이 빠져 풍미·식감이 크게 떨어집니다. 국내 식품안전 안내도 해동한 식품은 다시 얼리지 말라고 권합니다. 미국 USDA는 <strong>냉장고 안에서 천천히 해동한 경우에 한해</strong> 조리 전 재냉동도 안전하다고 보지만 품질 저하를 경고하며, 실온·물·전자레인지로 해동한 고기는 바로 조리하라고 안내합니다. 가장 안전한 방법은 해동한 생고기를 익힌 뒤 조리된 상태로 소분 냉동하는 것입니다.' },
              { q: '밥은 냉장과 냉동 중 어디에 보관하는 게 좋나요?',
                a: '하루 이틀 안에 먹을 거라면 냉장(계산기 2일), 그 이상이면 냉동(계산기 30일)이 낫습니다. 밥은 0~5°C 냉장 온도에서 전분이 가장 빠르게 굳어(노화) 딱딱해지고 맛이 떨어집니다. 갓 지은 밥을 김이 빠질 정도로만 식혀 1회분씩 랩이나 밀폐용기에 담아 바로 얼리면, 데웠을 때 식감이 훨씬 잘 돌아옵니다.' },
              { q: '국·찌개는 냉장고에서 며칠까지 안전한가요?',
                a: '2~3일 이내가 권장 기준입니다(계산기 3일). 먹기 직전에 팔팔 끓이는 것은 그때 먹을 분량을 안전하게 하려는 것이지 보관 기한을 늘려 주지 않습니다. 일부 세균의 포자와 독소는 끓여도 남고, 끓이고 식히기를 반복할수록 풍미가 사라지고 위험도 누적됩니다. 먹을 만큼만 덜어 데우고 남는 양은 1회분씩 냉동하세요. 맑은 국·미역국처럼 건더기와 수분이 많은 국물은 짧게 잡는 것이 안전합니다.' },
              { q: '우유 유통기한이 지났는데 냄새가 멀쩡하면 먹어도 되나요?',
                a: '냉장 우유류는 소비기한 표시제의 예외로 <strong>2031년 1월 1일부터</strong> 소비기한으로 바뀌므로, 지금은 유통기한이 적힌 제품이 많습니다. 유통기한은 품질이 안전하게 유지되는 기간의 60~70% 지점으로 정하므로, 미개봉 상태로 계속 냉장 보관했다면 표시일이 하루 이틀 지났다고 곧바로 상하지는 않습니다. 다만 우유의 &lsquo;유통기한 경과 후 섭취 가능 일수&rsquo;를 정한 공식 기준은 없으니 되도록 기한 안에 마시고, 응어리·분리·시큼한 냄새 중 하나라도 있으면 버리세요. 개봉한 우유는 표시일과 무관하게 3~5일 안에 마시는 것이 좋습니다(계산기 4일).' },
              { q: '소비기한과 유통기한은 어떻게 다른가요?',
                a: '유통기한은 제조일로부터 소비자에게 판매가 허용되는 기한(영업자 중심)이고, 소비기한은 표시된 보관방법을 준수했을 때 섭취해도 안전에 이상이 없다고 판단되는 기한(소비자 중심)입니다. 식약처 기준으로 유통기한은 품질안전한계기간의 60~70%, 소비기한은 80~90% 시점으로 설정됩니다. 2023년 1월 1일부터 소비기한 표시제가 시행돼 식품 포장에는 유통기한 대신 소비기한이 표시됩니다(냉장 우유류는 2031년 1월 1일부터 적용). 소비기한이 지난 식품은 섭취하지 말고 폐기하세요. (출처: 식약처·대한민국 정책브리핑)' },
              { q: '김치는 냉장고에서 얼마나 보관할 수 있나요?',
                a: '식약처가 공개한 소비기한 참고값(2022년 12월 기준) 기준, 포장 김치의 소비기한 참고값은 35일로 기존 유통기한 30일보다 5일 깁니다. 단 이는 표시된 보관방법(냉장)을 준수한 제품 기준입니다. 집에서 담근 김치는 별도의 공인 기준이 없으며, 발효식품 특성상 시간이 지나면 상하기보다 신맛이 강해지는 쪽으로 변하는 것으로 알려져 있습니다. 군내·점성·푸른색이나 검은색 곰팡이 등 평소와 다른 이상이 보이면 폐기하세요.' },
              { q: '달걀은 어떻게 보관하는 게 좋나요?',
                a: '식약처는 달걀을 전용 용기에 담아 뾰족한 부분이 아래로 향하게 냉장 보관할 것을 권고합니다. 둥근 쪽에 있는 공기주머니(기실)가 위로 가야 세균 노출 위험이 줄어드는 것으로 알려져 있습니다. 금이 간 달걀은 세균 오염 위험이 있어 먹지 않는 것이 안전하며, 실온에 장시간 둔 달걀도 피하세요. 달걀 요리는 조리 후 60°C 이상 또는 5°C 이하에서 보관하는 것이 식약처 권고입니다. (출처: 식약처 카드뉴스, 2019)' },
              { q: '두부 유통기한이 하루 지났는데 먹어도 되나요?',
                a: '미개봉·냉장 보관 기준이라면 대개 안전합니다. 식약처 소비기한 참고값(2022년 12월 기준)에 따르면 두부의 소비기한 참고값은 23일로, 기존 유통기한 17일보다 6일 깁니다. 단 이는 표시된 보관방법을 준수한 미개봉 제품 기준이며, 개봉한 두부는 이와 무관하게 3~4일 이내에 먹는 것이 좋습니다. 쉰내·점성·포장 부풀음 중 하나라도 있으면 즉시 폐기하세요.' },
            ]

export default function FoodStoragePage() {
  return (
    <ToolPage width={760} slug="/tools/cooking/food-storage">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />식재료 보관 계산기
      </h1>
      <p className="tp-lead">
        냉장·냉동 식재료가 <strong style={{ color: 'var(--text)' }}>언제까지 안전한지</strong> + 소비 기한 알림으로 음식물 쓰레기 줄이기.
      </p>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        이 도구는 <strong style={{ color: 'var(--text)' }}>언제까지 보관할 수 있는지(소비 기한 D-day)</strong>를 다룹니다. 냉동한 식재료를 얼마 만에 녹일 수 있는지는 <Link href="/tools/cooking/thawing" style={{ color: 'var(--accent)' }}>해동 시간 계산기</Link>에서 확인하세요.
      </p>

      {/* ── 면책 조항 (상단) ── */}
      <div style={{ marginBottom: '40px' }}>
        <Disclaimer
          variant="default"
          open
          sources={[
            { label: '식약처 「식품유형별 소비기한 설정 보고서」 — 식품안전나라 소비기한 자료실', href: 'https://www.foodsafetykorea.go.kr/portal/board/board.do?menu_grp=MENU_NEW01&menu_no=4612' },
            { label: '소비기한 표시제 Q&A — 대한민국 정책브리핑', href: 'https://www.korea.kr/news/healthView.do?newsId=148911057' },
            { label: 'USDA FSIS — Freezing and Food Safety', href: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/freezing-and-food-safety' },
          ]}
        >
          본 계산기는 식약처 권고 일반 기준에 따른 <strong>참고용 정보</strong>입니다. 실제 보관 가능 기간은 냉장고 온도·포장 상태·취급 환경에 따라 크게 달라질 수 있습니다. 색·냄새·점성에 이상이 있다면 D-day와 무관하게 폐기하세요.
        </Disclaimer>
      </div>

      <FoodStorageClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* ── 1. 계산 방식 ── */}
        <section>
          <h2 className="g-h2">D-day는 이렇게 계산됩니다</h2>
          <p className="g-p">
            식재료를 등록할 때 고르는 <strong>기준일</strong>(구매일·조리일·개봉일·냉동일)과 <strong>보관 방법·상태</strong>(생것·조리됨·개봉 후)로 보관 가능 일수가 정해집니다. 계산기는 오늘 0시 기준으로 기준일부터 며칠이 지났는지 세고, <strong>남은 일수 = 보관 가능 일수 − 지난 일수</strong>로 D-day를 냅니다.
            상태는 네 단계입니다 — 남은 일수가 0 미만이면 &lsquo;기한 초과&rsquo;, 0~1일이면 &lsquo;위급&rsquo;, 보관 기간의 70% 이상이 지났으면 &lsquo;주의&rsquo;, 그 전이면 &lsquo;안전&rsquo;. 목록은 위험한 것부터 위로 정렬됩니다.
          </p>
          <p className="g-p">
            예를 들어 소고기(생)를 월요일에 사서 냉장 보관하면 보관 가능 일수는 3일입니다. 화요일에는 2일 남아 &lsquo;안전&rsquo;, 수요일에는 1일 남아 &lsquo;위급&rsquo;이 되면서 <strong>냉동 전환 권장</strong> 표시가 함께 뜨고(소·돼지고기는 2일, 닭고기·다진 고기·생선은 1일이 지나면 표시), 목요일은 D-day, 금요일부터 &lsquo;기한 초과&rsquo;입니다. 반대로 계란처럼 보관 기간이 긴 식재료(냉장 35일)는 구매 후 25일이 지나면(25÷35≈71%) &lsquo;주의&rsquo;로 바뀌어 미리 소진 계획을 세울 수 있습니다.
          </p>
          <p className="g-p">
            냉동실로 옮긴 식재료는 보관 방법을 &lsquo;냉동&rsquo;, 기준일을 &lsquo;냉동일&rsquo;로 다시 등록하면 냉동 보관 일수로 계산됩니다. 냉동 기간은 안전보다 <strong>품질</strong>의 기준입니다 — −18°C 이하에서 꾸준히 얼어 있는 식품은 세균이 늘지 않지만, 오래 두면 수분이 날아가 냉동 화상(표면 건조·변색)이 생기고 풍미가 떨어집니다. 고른 조합에 기준값이 없으면(예: 생선을 &lsquo;조리됨&rsquo;으로, 회를 냉동으로 선택) 등록 전에 &lsquo;정보 없음&rsquo; 안내가 뜨니, 가장 가까운 항목(생선 대신 익힌 고기 등)을 골라 보수적으로 판단하세요.
          </p>
        </section>

        {/* ── 2. 빠른 참조표 ── */}
        <section>
          <h2 className="g-h2">
            자주 검색되는 식재료 보관 기간 빠른 참조표
          </h2>
          <p className="g-p">
            냉장고 0~5°C, 냉동 −18°C 이하 · 밀폐 보관 기준입니다. 범위의 짧은 쪽을 기준으로 잡으면 안전합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['식재료', '상태', '냉장', '냉동', '핵심 메모'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '닭고기 (생)',     s: '미개봉', f: '1~2일',  z: '6~9개월',  m: '가장 빨리 상함, 즉시 냉동 권장' },
                  { n: '다진 고기',       s: '생',     f: '1~2일',  z: '3~4개월',  m: '표면적 넓어 세균이 빨리 늘어남' },
                  { n: '익힌 고기',       s: '조리 후', f: '3~4일',  z: '2~3개월',  m: '바로 식혀 밀폐, 1회분 소분' },
                  { n: '생선 (생)',       s: '미개봉', f: '1~2일',  z: '3~4개월',  m: '비린내 시작되면 폐기' },
                  { n: '국·찌개',         s: '조리 후', f: '2~3일',  z: '1개월 안팎', m: '빨리 식혀 소분 보관' },
                  { n: '밥',              s: '조리 후', f: '1~2일',  z: '2~4주',    m: '굳기 전 1회분 소분 냉동' },
                  { n: '계란',            s: '미개봉', f: '3~5주',  z: '권장 X',   m: '뾰족한 쪽 아래로 보관' },
                  { n: '우유 (개봉)',     s: '개봉',   f: '3~5일',  z: '권장 X',   m: '표시일과 관계없이 개봉 후 5일 이내' },
                  { n: '두부 (개봉)',     s: '개봉',   f: '3~4일',  z: '권장 X',   m: '물에 담가 매일 갈아주기, 냉동 시 식감 변화' },
                  { n: '햄·소시지 (개봉)', s: '개봉',   f: '5~7일',  z: '1~2개월',  m: '미개봉은 포장의 소비기한 우선' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{r.s}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.f}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.z}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 3. 소비기한·유통기한 ── */}
        <section>
          <h2 className="g-h2">포장의 소비기한과 이 계산기의 D-day는 다릅니다</h2>
          <p className="g-p">
            2023년 1월 1일부터 식품 포장에는 유통기한 대신 <strong>소비기한</strong>이 표시됩니다. 소비기한은 &lsquo;표시된 보관방법을 지켰을 때 먹어도 안전한 기한&rsquo;으로, 품질이 안전하게 유지되는 기간의 80~90% 지점에서 정합니다(예전 유통기한은 60~70%). 냉장 우유류만 2030년 12월 31일까지 유통기한 표시가 이어집니다(2031년 1월 1일부터 소비기한).
            통조림·레토르트·잼·장류처럼 오래 두는 일부 식품에는 안전 기한이 아니라 맛과 품질이 유지되는 &lsquo;품질유지기한&rsquo;이 붙기도 합니다.
          </p>
          <p className="g-p">
            포장의 기한은 <strong>미개봉 제품을 표시된 조건대로 보관했을 때</strong>만 유효합니다. 뜯는 순간, 또는 조리해서 반찬통에 옮기는 순간부터는 가정 보관 기준을 따라야 하고, 이 계산기의 D-day가 바로 그 기준입니다. 그래서 두부·햄·우유는 &lsquo;개봉 후&rsquo; 값으로 잡혀 있고, 미개봉 제품은 포장의 소비기한을 우선하라고 안내합니다. 반대로 포장 기한이 넉넉히 남았더라도 냉장고 문을 자주 여닫아 온도가 오르내렸거나 장보기 후 차 안에 오래 두었다면 기한을 짧게 잡는 편이 안전합니다.
          </p>
        </section>

        {/* ── 4. 보관 방식별 핵심 가이드 ── */}
        <section>
          <h2 className="g-h2">
            보관 방식별 핵심 가이드
          </h2>
          <h3 className="g-h3">실온 — 15~25°C, 직사광선 피하기</h3>
          <ul className="g-list">
            <li>양파·마늘·감자·바나나·토마토는 실온이 더 적합합니다(토마토는 익은 뒤 냉장).</li>
            <li>한여름 실내가 28°C를 넘으면 실온 보관 식품도 냉장으로 옮기는 편이 안전합니다.</li>
            <li>쌀·밀가루는 밀폐용기에 담아 서늘하고 어두운 곳에 둡니다.</li>
          </ul>
          <h3 className="g-h3">냉장 — 5°C 이하, 70% 이하로 채우기</h3>
          <ul className="g-list">
            <li>냉장고 안쪽이 가장 차갑고 문 쪽이 가장 따뜻합니다. 계란·우유는 안쪽에 두세요.</li>
            <li>날것과 익힌 음식은 칸을 나눠 교차 오염을 막고, 생고기·생선은 맨 아래 칸에 둡니다.</li>
            <li>뜨거운 음식은 한 김 식힌 뒤 넣고, 양이 많으면 얕은 용기에 나눠 빨리 식힙니다.</li>
          </ul>
          <h3 className="g-h3">냉동 — −18°C 이하, 진공·밀폐</h3>
          <ul className="g-list">
            <li>1회 사용 분량으로 소분해 얼리면 해동·재냉동을 반복하지 않아도 됩니다.</li>
            <li>봉지에 내용물과 냉동일을 적어 두고, 계산기에 &lsquo;냉동일&rsquo;로 등록하세요.</li>
            <li>냉동은 세균을 죽이지 않고 멈춰 둘 뿐이라, 해동하면 다시 늘기 시작합니다.</li>
          </ul>
          <p className="g-note">
            ※ 국내 식품안전 안내는 냉장 5°C 이하·냉동 −18°C 이하를, 미국 USDA는 냉장 4°C(40°F) 이하를 권합니다. 냉장고 표시 온도와 실제 온도는 다를 수 있으니 냉장고용 온도계로 한 번 확인해 보세요.
          </p>
        </section>

        {/* ── 5. 냉장 → 냉동 전환 권장 기준 ── */}
        <section>
          <h2 className="g-h2">
            냉장 → 냉동 전환 권장 기준
          </h2>
          <p className="g-p">
            냉장 며칠 안에 못 먹을 것 같다면 미리 냉동으로 옮기세요. 기한이 거의 다 된 뒤에 얼리면 이미 늘어난 세균도 그대로 얼어 있다가 해동 후 다시 늘어납니다.
          </p>
          <div className="tableScroll" style={{ marginBottom: '14px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['식재료', '냉장 → 냉동 전환 권장', '냉동 후 보관'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '소·돼지고기 (생)',    a: '구입 후 1~2일',    b: '4~6개월' },
                  { n: '닭고기 (생)',         a: '구입 당일~1일',    b: '9개월 이내' },
                  { n: '다진 고기',           a: '구입 당일',        b: '3~4개월' },
                  { n: '생선 (생)',           a: '구입 당일',        b: '3~4개월' },
                  { n: '익힌 고기·요리',      a: '조리 후 2~3일',    b: '2~3개월' },
                  { n: '국·찌개',             a: '조리 후 2일',      b: '1개월 안팎' },
                  { n: '밥',                  a: '식자마자',         b: '2~4주' },
                  { n: '빵·식빵',             a: '구입 후 2일',      b: '1~3개월' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="tip" title="냉동 잘하는 법">
            1회 사용 분량으로 <strong>소분</strong>하고, 완전히 식힌 뒤 공기를 빼 <strong>밀폐·진공</strong> 포장하면 냉동 화상을 줄일 수 있습니다. 고기는 봉지에 넣어 <strong>얇고 평평하게</strong> 펴서 얼려야 빨리 얼고 빨리 녹습니다.
          </Callout>
        </section>

        {/* ── 6. 위험 신호 ── */}
        <section>
          <h2 className="g-h2">
            위험 신호 — 절대 먹지 말아야 할 식재료
          </h2>
          <p className="g-p">
            D-day가 남아 있어도 다음 신호가 보이면 <strong>즉시 폐기</strong>하세요. 반대로 냄새·색이 멀쩡하다고 안전하다는 뜻은 아닙니다 — 식중독균 상당수는 냄새나 맛을 바꾸지 않습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['식재료', '폐기 신호'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '고기',    d: '회녹색·회갈색 변색, 끈적한 점액, 시큼하거나 강한 암모니아 냄새' },
                  { n: '생선',    d: '눈이 흐리고 움푹 들어감, 시큼한 비린내, 살이 쉽게 으스러짐' },
                  { n: '계란',    d: '깼을 때 흰자가 물처럼 퍼지고 노른자가 쉽게 터짐, 썩은 달걀 냄새' },
                  { n: '우유',    d: '응어리지거나 분리됨, 시큼한 냄새' },
                  { n: '밥·면',   d: '실 같은 곰팡이, 끈적한 점액, 시큼한 발효 냄새' },
                  { n: '채소',    d: '물러서 진물이 남, 곰팡이, 불쾌한 냄새' },
                  { n: '국·찌개', d: '표면 거품·기포, 시큼한 냄새, 평소와 다른 점성' },
                  { n: '빵',      d: '곰팡이(녹색·흰색·검은색) — 한 부분만 보여도 전체 폐기' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="warn" title="위험 온도대 약 5~60°C">
            식중독균은 이 온도 범위에서 가장 빠르게 늘어납니다. 조리한 음식을 <strong>실온에 2시간 이상</strong>(기온 32°C를 넘는 한여름 야외에서는 1시간) 두었다면 보관 기간과 무관하게 버리는 것이 안전합니다.
          </Callout>
        </section>

        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* ── 참고 기준·출처 ── */}
        <section>
          <h2 className="g-h2">참고 기준과 도움받을 곳</h2>
          <p className="g-p">
            본 계산기의 보관 기간은 <strong>일반 정보 제공용 참고값</strong>이며 식품 안전을 진단·판정하는 도구가 아닙니다. 기준을 더 확인하려면 아래 자료를 참고하세요.
          </p>
          <ul className="g-list">
            <li>식약처 「식품유형별 소비기한 설정 보고서」 — <a href="https://www.foodsafetykorea.go.kr/portal/board/board.do?menu_grp=MENU_NEW01&menu_no=4612" target="_blank" rel="noopener noreferrer">식품안전나라 소비기한 자료실</a></li>
            <li>식품유형별 소비기한 참고값 검색 (한국식품산업협회, 2026년 6월 기준 약 2,000개 품목) — <a href="https://www.kfia.or.kr/kfia/sub.php?menukey=1513" target="_blank" rel="noopener noreferrer">kfia.or.kr</a></li>
            <li>소비기한 표시제 Q&amp;A (식약처·대한민국 정책브리핑, 2023년 시행) — <a href="https://www.korea.kr/news/healthView.do?newsId=148911057" target="_blank" rel="noopener noreferrer">korea.kr</a></li>
            <li>USDA FSIS 냉동과 식품 안전(영문) — <a href="https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/freezing-and-food-safety" target="_blank" rel="noopener noreferrer">fsis.usda.gov</a></li>
            <li>식품 안전 상담: 식약처 부정·불량식품 신고 및 상담 <strong>1399</strong></li>
          </ul>
        </section>

        {/* ── 관련 도구 ── */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/thawing', icon: '🧊', name: '해동 시간 계산기',  desc: '고기 해동 시간·안전 가이드' },
              { href: '/tools/cooking/serving', icon: '🍽️', name: '1인분 분량 계산기',     desc: '인분별 장보기 분량 가이드' },
              { href: '/tools/cooking/recipe',  icon: '📐', name: '레시피 비율 계산기',     desc: '인분 수에 맞게 재료 비율 조정' },
              { href: '/tools/date/dday',       icon: '📅', name: 'D-day 계산기',          desc: '소비 기한·기념일 D-day' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }} aria-hidden="true">{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
