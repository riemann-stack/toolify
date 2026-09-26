import Link from 'next/link'
import SubstituteClient from './SubstituteClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/cooking/substitute',
  title: '식재료 대체 계산기 — 버터·설탕·계란·생크림·한국 식재료 50종+',
  description: '버터·설탕·계란·생크림·참기름·고추장·된장 등 50+ 식재료 대체 비율. 비건·글루텐프리 옵션과 한국 식재료 14종+.',
  keywords: [
    '식재료대체', '버터대신오일', '설탕대신꿀', '생크림대체',
    '베이킹소다베이킹파우더', '계란대체', '비건베이킹', '레몬즙대체',
    '참기름 대체', '고추장 대체', '된장 대체', '간장 대체',
    '고춧가루 대체', '청양고추 대체', '막걸리 대체', '글루텐프리',
  ],
})

const FAQ_LD = [
              { q: '버터 대신 오일을 쓸 때 양은 어떻게 조절하나요?', a: '일반적으로 버터 100g을 오일 75ml(약 75%)로 대체합니다. 버터에는 수분(약 15%)이 포함되어 있어 같은 양을 쓰면 너무 기름지기 때문입니다. 쿠키나 페이스트리는 버터의 고체 성질이 중요해 오일 대체가 부적합하지만, 머핀·브라우니·팬케이크는 오일로 대체해도 잘 됩니다.' },
              { q: '베이킹소다 대신 베이킹파우더를 써도 되나요?', a: '가능하지만 양을 3배로 늘려야 합니다(베이킹소다 1작은술 ≈ 베이킹파우더 3작은술). 이렇게 하면 부풀기는 하지만 두 가지가 달라집니다. ① 베이킹파우더에 든 산성제·전분까지 3배로 들어가 쓴맛·짠맛이 날 수 있고, ② 소다로 중화하려던 레시피 속 산(버터밀크·요거트·식초)이 그대로 남아 신맛이 강해지고 갈색이 옅어집니다. 그래서 산성 재료가 많은 레시피일수록 결과 차이가 큽니다. 반대로 베이킹파우더가 없을 때는 베이킹소다 1/4작은술 + 주석영(크림 오브 타르타르) 1/2작은술로 1작은술을 만들 수 있습니다.' },
              { q: '설탕 대신 꿀을 쓸 때 주의할 점은?', a: '꿀은 설탕보다 단맛이 강하고 약 17~20%가 수분이라 양을 줄이고 다른 액체도 줄여야 합니다. 부피 기준으로는 설탕 1컵 → 꿀 3/4컵이 통용 규칙이지만, 꿀이 무거워 무게로 보면 설탕 약 200g 자리에 꿀 약 255g이 들어갑니다. 이 계산기는 부피가 아니라 단맛 기준 <strong>무게 0.75배</strong>(설탕 100g → 꿀 75g)를 쓰니 두 규칙을 섞지 마세요. 수분·산도 보정은 <strong>꿀 1컵(약 340g)당 다른 액체 1/4컵(약 60ml) 줄이기</strong>와 베이킹소다 1/4~1/2작은술 추가가 기준입니다 — 꿀 75g이면 줄일 액체는 약 13ml(1큰술 조금 못 되게), 베이킹소다는 한 꼬집 정도입니다. 꿀은 설탕보다 빨리 갈변하므로 오븐 온도를 <strong>약 15°C(25°F) 낮추세요</strong>(180°C → 약 165°C). 색이 진해지고 풍미가 깊어집니다.' },
              { q: '비건 베이킹에서 계란을 어떻게 대체하나요?', a: '가장 인기 있는 대체는 플랙스에그입니다. 아마씨 가루 1큰술과 물 3큰술을 섞어 5분 두면 끈끈해지는데 이것이 계란 1개 역할을 합니다. 무미·무취에 가까워 대부분 베이킹에 적합합니다. 달콤한 베이킹에는 으깬 바나나(계란 1개당 1/2개)나 사과소스도 좋습니다.' },
              { q: '생크림이 없을 때 어떻게 만들 수 있나요?', a: '생크림 1컵 = 우유 3/4컵 + 버터 1/4컵(녹여서 식힌 것)으로 대체 가능합니다. 단, 이 조합은 휘핑(거품 내기)이 안 되므로 휘핑크림 용도로는 사용할 수 없습니다. 소스, 수프, 카레 등 가열 요리에는 거의 동일하게 쓸 수 있습니다. 휘핑이 필요하다면 코코넛 크림(차갑게 식힌 것)을 사용하는 것이 좋습니다.' },
              { q: '한국 요리에서 참기름 대신 무엇을 쓸 수 있나요?', a: '가장 권장: 들기름 (1:1). 비슷한 풍미 + 들깨 향 + 오메가3 ↑. 다른 옵션: 올리브유(엑스트라버진) 1:1(한식 끝맛 X), 아보카도 오일(거의 무향, 튀김·고온 OK), 땅콩기름(비슷한 고소함, 알레르기 주의). 비빔·나물·미역국에는 들기름이 가장 좋고, 고추장 비빔밥·삼겹살에는 들기름·참기름 차이 미미.' },
              { q: '고추장이 떨어졌는데 대체 방법은?', a: '가장 권장: 미소된장 + 고춧가루 + 설탕 (미소 1큰술 + 고춧가루 1큰술 + 설탕 0.5작은술 → 비빔·찌개·볶음에 1:1 대체). 다른 옵션: 스리라차 + 미소(동남아 풍), 칠리 페이스트 + 설탕. 다만 고추장 특유의 깊은 발효감은 나지 않으므로 본격 한식보다는 가정식 응급 대체용입니다. 본 도구의 「🇰🇷 한국 식재료」 카테고리 참고.' },
              { q: '청양고추가 없는데 매운맛 어떻게 내요?', a: '매운맛 강도 비교 (SHU): 청양고추 4,000~12,000 / 할라피뇨 2,500~8,000 (가장 비슷) / 세라노 10,000~23,000 (약간 매움) / 태국 버드아이 50,000~100,000 (훨씬 매움) / 카이엔 가루 30,000~50,000. 대체: 할라피뇨 1:1(가장 추천), 세라노 1:1(약간 매움), 태국 칠리 1/2(훨씬 매우니 적게), 풋고추 + 카이엔(단계 조절).' },
              { q: '1컵 = 200g이라고 외워도 되나요?', a: '식재료마다 다릅니다. 미국 계량컵(240ml) 기준으로 밀가루 약 120g / 설탕 약 200g / 황설탕 약 220g / 버터 약 227g / 꿀 약 340g / 올리브유 약 220g / 우유 약 247g / 고추장 약 320g입니다. 한국 레시피에서 흔히 쓰는 1컵(200ml)은 이보다 1/6가량 적어 밀가루 약 100~110g, 설탕 약 170g 정도입니다. 본 도구의 「양 변환 가이드」 표 참고. 특히 베이킹은 ±10g 차이로도 결과 달라짐 → 저울 사용 강력 권장.' },
              { q: '알레르기가 있는 사람도 본 도구 결과 그대로 사용해도 되나요?', a: '그대로 쓰면 안 되고 <strong>대체재의 원재료명을 따로 확인</strong>해야 합니다. 대체재 자체가 알레르기 원료인 경우가 많습니다 — 두유·미소·간장은 대두, 간장은 대개 밀도 함유, 아몬드 가루·코코넛은 견과·열매류입니다. 특히 국내 「식품등의 표시기준」의 알레르기 표시 대상에 호두·잣·땅콩은 있지만 <strong>아몬드·캐슈넛·코코넛은 없어서</strong> 라벨의 알레르기 표시란만 보면 놓칠 수 있습니다. 또 우유 알레르기는 유당이 아닌 우유 단백질에 대한 반응이라 <strong>락토프리 우유도 안전하지 않습니다</strong>. 섭취 후 두드러기·입술 부기·호흡곤란이 생기면 즉시 119에 연락하고, 대체 식단은 알레르기 전문의나 임상영양사와 상의하세요.' },
            ]

export default function SubstitutePage() {
  return (
    <ToolPage width={760} slug="/tools/cooking/substitute">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />식재료 대체 계산기
      </h1>
      <p className="tp-lead">
        버터가 없을 때, 고추장이 떨어졌을 때 — <strong style={{ color: 'var(--text)' }}>50+ 식재료 대체 비율</strong>과 비건·GF 옵션.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="대체 비율은 제과·요리 통용 환산 종합(꿀 대체·계량 무게는 King Arthur Baking 등 제과 레퍼런스 참고) · 알레르기 표시 대상은 「식품등의 표시기준」 기준"
        sources={[
          { label: '국가법령정보센터 — 식품등의 표시기준', href: 'https://www.law.go.kr/행정규칙/식품등의표시기준' },
          { label: '식품안전나라 — 알레르기 유발 식품 표시', href: 'https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?menu_no=3120&menu_grp=MENU_NEW01&bbs_no=bbs001&ntctxt_no=1091412' },
          { label: 'King Arthur Baking — Ingredient Weight Chart', href: 'https://www.kingarthurbaking.com/learn/ingredient-weight-chart' },
        ]}
      />

      <SubstituteClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 빠른 참조표 ── */}
        <div>
          <h2 className="g-h2">
            자주 검색되는 대체 가이드 빠른 참조표
          </h2>

          {/* 버터 대체 */}
          <h3 className="g-h3">버터 대체</h3>
          <div className="tableScroll" style={{ marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대체재', '비율', '용도', '주의'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '식물성 오일', r: '0.75배', u: '일반 요리', w: '쿠키 부적합' },
                  { n: '코코넛 오일', r: '1.0배',  u: '베이킹',     w: '코코넛 향' },
                  { n: '그릭요거트',  r: '0.5배',  u: '머핀·케이크', w: '약간 신맛' },
                  { n: '아보카도',    r: '1.0배',  u: '브라우니',   w: '단맛 베이킹만' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '11px' }}>{r.w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 설탕 대체 */}
          <h3 className="g-h3">설탕 대체</h3>
          <div className="tableScroll" style={{ marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대체재', '비율', '용도', '주의'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '꿀',         r: '0.75배',    u: '머핀·드레싱',   w: '오븐 약 15°C↓' },
                  { n: '메이플시럽', r: '0.75배',    u: '팬케이크',       w: '액체 줄이기' },
                  { n: '알룰로스',   r: '1.3배',     u: '저당 디저트',    w: '단맛 약함' },
                  { n: '스테비아',   r: '매우 적게', u: '음료',           w: '부피 손실' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '11px' }}>{r.w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 생크림 대체 */}
          <h3 className="g-h3">생크림 대체</h3>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대체재', '비율', '용도', '주의'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '우유 + 버터',  r: '1.0배', u: '소스·수프',  w: '휘핑 X' },
                  { n: '코코넛 크림',  r: '1.0배', u: '카레·비건',  w: '코코넛 향' },
                  { n: '에바포레이티드 밀크', r: '1.0배', u: '파스타 소스', w: '단맛 약간' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '11px' }}>{r.w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 베이킹소다 vs 베이킹파우더 ── */}
        <div>
          <h2 className="g-h2">
            베이킹소다 vs 베이킹파우더 차이
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--orange-600)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
              <p style={{ fontSize: '14px', color: 'var(--orange-600)', fontWeight: 700, marginBottom: '8px' }}>베이킹소다 (탄산수소나트륨, NaHCO₃)</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
                <li>산이 없으면 거의 부풀지 않음</li>
                <li>산성 재료(식초·레몬즙·요거트·코코아)와 만나야 부풂</li>
                <li>베이킹파우더보다 약 <strong style={{ color: 'var(--text)' }}>3배 강함</strong></li>
                <li>너무 많이 쓰면 쓴맛</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
              <p style={{ fontSize: '14px', color: 'var(--accent-ink)', fontWeight: 700, marginBottom: '8px' }}>베이킹파우더</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
                <li>베이킹소다 + 산성제(주석영·인산염 등) + 전분</li>
                <li><strong style={{ color: 'var(--text)' }}>단독 사용 가능</strong></li>
                <li>일반 케이크·머핀에 사용</li>
                <li>대부분의 시판품은 이중 작용 — 반죽할 때·구울 때 두 번 가스 발생</li>
              </ul>
            </div>
          </div>
          <Callout tone="note" title="대체 공식">
            <ul>
              <li>베이킹파우더 1작은술 = <strong>베이킹소다 1/4작은술 + 주석영(크림 오브 타르타르) 1/2작은술</strong> — 주석영이 없으면 식초·레몬즙 1/2작은술로도 대신합니다.</li>
              <li>베이킹소다 1작은술 ≈ <strong>베이킹파우더 3작은술</strong> — 부풀기는 하지만 쓴맛이 나거나, 레시피 속 산이 중화되지 않아 신맛이 남고 색이 옅어질 수 있습니다.</li>
            </ul>
          </Callout>
          <p className="g-p">
            소다가 산과 만나면 이산화탄소가 나오며 반죽을 부풀리고, 남는 알칼리는 반죽의 pH를 올려 갈변을 돕습니다. 그래서 버터밀크·요거트·코코아가 들어간 레시피는 소다를, 산성 재료가 없는 레시피는 베이킹파우더를 쓰는 것이 기본입니다.
            소다를 너무 많이 넣으면 비누 같은 쓴맛과 누런 속살이 생기므로, 대체할 때는 계량스푼을 깎아서 정확히 재세요.
          </p>
        </div>

        {/* ── 3. 비건 대체 가이드 ── */}
        <div>
          <h2 className="g-h2">
            비건 대체 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--purple-600)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
              <p style={{ fontSize: '14px', color: 'var(--purple-600)', fontWeight: 700, marginBottom: '8px' }}>계란 1개 대체</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
                <li><strong style={{ color: 'var(--text)' }}>플랙스에그</strong>: 아마씨 1큰술 + 물 3큰술 (5분 불림)</li>
                <li><strong style={{ color: 'var(--text)' }}>치아씨드</strong>: 1큰술 + 물 3큰술 (10분 불림)</li>
                <li><strong style={{ color: 'var(--text)' }}>으깬 바나나 1/2개</strong>: 단맛·바나나향 추가</li>
                <li><strong style={{ color: 'var(--text)' }}>두부 60g</strong>: 무미, 키슈·스크램블 적합</li>
                <li><strong style={{ color: 'var(--text)' }}>아쿠아파바 3큰술</strong>: 병아리콩 삶은 물. 흰자 1개는 2큰술, 휘핑하면 머랭 가능</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--cyan-600)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
              <p style={{ fontSize: '14px', color: 'var(--cyan-600)', fontWeight: 700, marginBottom: '8px' }}>유제품 대체</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
                <li><strong style={{ color: 'var(--text)' }}>우유 → 두유·아몬드밀크·귀리밀크</strong> (1:1 비율)</li>
                <li><strong style={{ color: 'var(--text)' }}>버터 → 코코넛 오일</strong> (1:1, 고체 상태)</li>
                <li><strong style={{ color: 'var(--text)' }}>생크림 → 코코넛 크림</strong> (1:1, 차갑게 하면 휘핑 가능)</li>
                <li><strong style={{ color: 'var(--text)' }}>요거트 → 두유 + 레몬즙</strong> (1컵당 1큰술)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 4. 글루텐프리 대체 ── */}
        <div>
          <h2 className="g-h2">
            글루텐프리 대체 (밀가루 1컵 대체)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { n: '쌀가루 + 잔탄검',     r: '쌀가루 1컵 + 잔탄검 1/4작은술', c: 'var(--emerald-600)', d: '글루텐 효과를 잔탄검으로 보완. 가장 무난한 선택.' },
              { n: '아몬드 가루',         r: '동량 (액체 약간 줄이기)',         c: 'var(--amber-600)', d: '쿠키·케이크에 적합. 너트향, 진한 색.' },
              { n: '오트밀 가루 + 잔탄검', r: '동량 + 잔탄검 1/4작은술',         c: 'var(--sky-500)', d: '머핀·쿠키. 진한 식감.' },
              { n: '시판 글루텐프리 믹스', r: '동량',                            c: 'var(--cyan-600)', d: '가장 무난. 이미 잔탄검·여러 가루가 섞여 있음 (셀리악이면 인증·교차오염 표시 확인).' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${g.c} 20%, transparent)`, borderLeft: `3px solid ${g.c}`, borderRadius: 'var(--radius-s)', padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: '13px', color: g.c, fontWeight: 700 }}>{g.n}</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{g.r}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 한국 식재료 대체 가이드 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            한국 식재료 대체 가이드 (15종)
          </h2>
          <p className="g-p">
            본 도구의 「카테고리 둘러보기」 → <strong style={{ color: 'var(--text)' }}>🇰🇷 한국 식재료</strong>에서 자세히. 해외 거주·재료 부족 시 응급 대체용. 고춧가루를 카이엔으로 대신할 때가 가장 실수하기 쉬운데, 카이엔은 한국 고춧가루보다 훨씬 매우므로 색은 파프리카 가루로 내고 카이엔은 조금씩 넣으며 맛을 맞추세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>원재료</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--accent-ink)', fontWeight: 700 }}>대체</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>비율</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🌰 참기름',     '들기름 (오메가3 ↑)',           '1.0×'],
                  ['🌶️ 고추장',     '미소 + 고춧가루 + 설탕',       '1.0×'],
                  ['🍲 된장',       '일본 미소된장 (적·백)',         '1.0×'],
                  ['🥢 간장 (양조)', '진간장 / 코코넛 아미노',        '0.7~1.0×'],
                  ['🐟 멸치액젓',   '까나리액젓 / 베트남 느억맘',     '1.0×'],
                  ['🧂 다시다',     '멸치 다시팩 (10~15분 우림)',    '1.0×'],
                  ['🍶 막걸리 (요리용)', '청주 + 물 + 설탕',           '1.0×'],
                  ['🍷 청주 (요리용)', '미림 / 맛술',                  '0.7~1.0×'],
                  ['🌶️ 고춧가루',   '파프리카 가루 + 카이엔 소량',    '1.0×'],
                  ['🌶️ 청양고추',   '할라피뇨 / 세라노',              '1.0×'],
                  ['🌿 부추',       '쪽파 / 실파',                    '1.0×'],
                  ['🍡 떡볶이 떡',  '가래떡 (썰어서)',                '1.0×'],
                  ['🥬 김치',       '사우어크라우트 + 고춧가루 + 마늘', '1.0×'],
                  ['🍯 물엿',       '꿀 / 옥수수시럽 / 쌀엿',         '0.7~1.0×'],
                  ['🧄 다진 마늘',  '마늘가루 (1tsp = 1/8tsp)',       '0.125×'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 6. 양 변환 정확 가이드 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            양 변환 정확 가이드 — 같은 1컵이라도 다름
          </h2>
          <p className="g-p">
            식재료마다 밀도가 달라 1컵 무게가 다릅니다. 베이킹은 ±10g 차이로도 결과가 달라지므로 <strong style={{ color: 'var(--text)' }}>저울 사용 강력 권장</strong>.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>식재료</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700 }}>1컵 (240ml)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>1큰술</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🌾 박력분 (밀가루)', '약 120g',  '약 8g'],
                  ['🌾 강력분 (식빵)',   '약 130g',  '약 8g'],
                  ['🌾 쌀가루',          '약 158g',  '약 10g'],
                  ['🍯 설탕 (백)',       '약 200g',  '약 12.5g'],
                  ['🍬 황설탕',          '약 220g',  '약 14g'],
                  ['🧈 버터',            '약 227g',  '약 14g'],
                  ['🍯 꿀',              '약 340g',  '약 21g'],
                  ['🫒 올리브유',        '약 220g',  '약 14g'],
                  ['🥛 우유',            '약 247g',  '약 15g'],
                  ['🌶️ 고추장',          '약 320g',  '약 20g'],
                  ['🍲 된장',            '약 280g',  '약 17g'],
                  ['🌶️ 고춧가루',        '약 90g',   '약 5.5g'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            액체류(우유·꿀·기름)는 밀도 × 240ml로 계산한 값이라 비교적 일정하지만, 가루류는 체에 치는지·꾹꾹 눌러 담는지에 따라 10% 넘게 달라집니다. 같은 밀가루 1컵을 King Arthur Baking 무게표는 120g, 설탕 1컵은 198g으로 잡는 식으로 레퍼런스마다 몇 g씩 차이가 납니다.
            한국 레시피의 1컵은 200ml라 위 값에 약 5/6을 곱하면 되고(밀가루 약 100g, 설탕 약 167g), 1큰술 15ml·1작은술 5ml는 두 나라가 거의 같습니다.
          </p>
        </div>

        {/* ── 7. 알레르기·식이 제한 가이드 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            알레르기·식이 제한 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            <div style={{ background: 'color-mix(in srgb, var(--red-600) 4%, transparent)', border: '1px solid color-mix(in srgb, var(--red-600) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--red-600)', fontWeight: 700, marginBottom: 8 }}>알레르기 환자 주의</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                <li>견과류 알레르기 → 아몬드 가루·헤이즐넛·코코넛 대체재 피하기</li>
                <li>글루텐 알레르기 (셀리악) → 시판 글루텐프리 믹스도 교차오염 가능</li>
                <li>우유 알레르기 → 락토프리 우유도 우유 단백질이 그대로라 안 됨</li>
                <li>계란 알레르기 → 시판 베이킹 믹스 라벨 확인</li>
                <li>대두 알레르기 → 두유·두부·미소·간장 피하기</li>
              </ul>
            </div>
            <div style={{ background: 'color-mix(in srgb, var(--cyan-600) 4%, transparent)', border: '1px solid color-mix(in srgb, var(--cyan-600) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--cyan-600)', fontWeight: 700, marginBottom: 8 }}>식이 제한 대체 가이드</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                <li>견과류 X: 해바라기씨·호박씨로 대체</li>
                <li>글루텐프리: 쌀가루·아몬드 가루·시판 GF 믹스</li>
                <li>유당불내증: 락토프리 우유·두유·아몬드밀크·귀리밀크</li>
                <li>계란 X: 플랙스에그 (1큰술 + 물 3큰술 5분) / 치아씨드</li>
                <li>비건: 동물성 모두 X (꿀·계란·유제품·생선소스 포함)</li>
              </ul>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            대체재는 원재료가 알레르기 원료인 경우가 많아, 원래 재료를 피하려다 다른 알레르기 원료를 새로 들이기 쉽습니다. 아래는 이 도구에 나오는 대체재와 국내 「식품등의 표시기준」 알레르기 표시 대상(알류·우유·메밀·땅콩·대두·밀·고등어·게·새우·돼지고기·복숭아·토마토·아황산류·호두·닭고기·쇠고기·오징어·조개류·잣)을 대조한 것입니다.
            표시 대상은 (최종 제품에 이산화황이 1kg당 10mg 이상일 때만 표시하는 아황산류를 제외하면) 함량과 관계없이 원재료명 옆에 따로 표시되지만, 목록에 없는 재료는 알레르기 표시란에 나오지 않으니 원재료명을 직접 읽어야 합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>대체재</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--accent-ink)', fontWeight: 700 }}>확인할 알레르기 원료</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>표시 대상 여부</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['두유·두부·미소된장', '대두', '표시 대상'],
                  ['진간장·양조간장', '대두, 대부분 밀', '표시 대상'],
                  ['우유+버터·그릭요거트·에바포레이티드 밀크', '우유', '표시 대상'],
                  ['땅콩기름', '땅콩', '표시 대상'],
                  ['아몬드 가루·아몬드밀크', '아몬드', '표시 대상 아님 — 원재료명 확인'],
                  ['코코넛 오일·크림·밀크', '코코넛', '표시 대상 아님 — 원재료명 확인'],
                  ['오트밀 가루', '귀리 자체는 아님, 밀 혼입 가능', '혼입 주의 문구 확인'],
                  ['시판 글루텐프리 믹스', '제품마다 다름 (대두·우유·알류 등)', '제품 라벨 확인'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="warn" title="증상이 생기면">
            섭취 후 두드러기·입술 부기·구토·숨이 차는 증상이 생기면 즉시 119에 연락하세요. 국번 없이 1399는 식약처의 <strong>부정·불량식품 신고</strong> 번호로, 알레르기 표시 누락 같은 표시 위반을 신고할 때 씁니다(의료 상담 번호가 아님).
          </Callout>
        </div>

        {/* ── 8. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 9. 면책 (NEW) ── */}
        <Disclaimer variant="default" open>
          본 식재료 대체 계산기는 <strong>일반 요리 가이드</strong>입니다. 영양 자문 도구가 아닙니다.
          <ul style={{ paddingLeft: 18, margin: '6px 0 0' }}>
            <li>정확한 영양 성분은 식약처 식품안전나라 권장</li>
            <li>알레르기 환자는 라벨 확인 + 의사 상담 필수</li>
            <li>식이 제한 (당뇨·신장 등)은 영양사 상담</li>
            <li>발효 식재료는 브랜드별 차이 큼</li>
          </ul>
          <p style={{ margin: '8px 0 4px', fontWeight: 600 }}>도움 받기:</p>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li>부정·불량식품·표시 위반 신고: <strong>1399</strong></li>
            <li>식품안전나라: foodsafetykorea.go.kr</li>
            <li>알레르기 응급: <strong>119</strong></li>
          </ul>
        </Disclaimer>

        {/* ── 6. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/recipe',  icon: '📐', name: '레시피 비율 계산기',     desc: '인분 변경 시 재료 비율 조정' },
              { href: '/tools/cooking/serving', icon: '🍽️', name: '1인분 분량 계산기',       desc: '쌀·고기·파스타 분량' },
              { href: '/tools/cooking/thawing', icon: '🧊', name: '해동 시간 계산기',   desc: '식품 안전 가이드' },
              { href: '/tools/cooking/ramen',   icon: '🍜', name: '라면 물양 계산기',        desc: '제품별 권장 물양·조리시간' },
              { href: '/tools/cooking/baker-percent', icon: '🥖', name: '베이커 퍼센트',     desc: '제빵 배합비' },
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
