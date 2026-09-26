import Link from 'next/link'
import ThawingClient from './ThawingClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/cooking/thawing',
  title: '해동 시간 계산기 — 식품별·두께별·전자레인지 W별 해동 가이드',
  description: '냉장·전자레인지·찬물·실온 4가지 해동법 비교 + 식품별 위험도, 시작·완료 시각 자동, 두께·무게별 정확한 시간.',
  keywords: [
    '해동시간계산기', '고기해동시간', '냉동해동계산기', '냉장해동시간',
    '생선해동시간', '식품해동방법', '냉동보관기간', '전자레인지 해동',
    '닭 해동 시간', '갈치 해동', '안전 해동', '식품 위험 온도대',
    '재냉동 금지', '식중독 예방', '명절 갈비 해동', '삼겹살 해동',
  ],
})

const FAQ_LD = [
              { q: '냉장 해동이 왜 가장 안전한가요?', a: '냉장 온도(0~4°C)는 세균이 증식하기 어려운 환경입니다. 식품이 위험 온도대(4~60°C)에 노출되지 않아 식중독 위험이 최소화됩니다. 해동 후 1~2일 내 조리하면 가장 안전하며, 해동 중에도 위생적 품질이 유지됩니다.' },
              { q: '실온 해동은 왜 위험한가요?', a: '실온(20~25°C)은 위험 온도대(4~60°C) 한가운데라 세균이 빠르게 증식하는 온도입니다. 식품 표면이 먼저 해동되면서 위험 온도대에 수 시간 노출됩니다. 식약처는 실온 해동을 권하지 않고 냉장, 21°C 이하 흐르는 물, 전자레인지 해동을 안내합니다. 부득이한 경우에도 위험 온도대(4~60°C) 노출은 2시간을 넘기지 않아야 하며(미국 USDA의 2시간 규칙), 이를 초과하면 살모넬라·대장균 등 식중독균이 급증할 수 있습니다.' },
              { q: '전자레인지 해동 후 왜 즉시 조리해야 하나요?', a: '전자레인지 해동은 식품 일부가 부분적으로 조리될 수 있습니다. 이미 가열된 부분은 위험 온도대에 진입하여 세균이 빠르게 증식할 수 있으므로 해동 직후 바로 조리해야 합니다. 다시 냉장 보관하거나 재냉동하면 안 됩니다.' },
              { q: '해동한 고기를 다시 냉동해도 되나요?', a: '원칙적으로 생으로 해동한 식품의 재냉동은 권장하지 않습니다. 해동 과정에서 증식한 세균이 재냉동 시 그대로 보존되며, 해동-재냉동 반복은 품질(맛·식감) 저하와 세균 오염 위험을 동반합니다. 단, 완전히 익혀 조리한 음식은 식힌 뒤(조리 후 2시간 이내) 냉동해도 됩니다. 참고로 미국 USDA는 냉장고에서 해동한 생식품은 품질 저하를 감수하면 다시 얼려도 안전하다고 보지만, 찬물·전자레인지로 해동한 식품은 반드시 조리한 뒤에 얼리라고 안내합니다. 실용 팁: 1회분씩 소분 후 냉동 (해동 = 조리 예정).' },
              { q: '냉동 식품에 서리(성에)가 끼면 버려야 하나요?', a: '식품 표면의 서리는 수분이 승화된 것으로 안전에는 문제없습니다. 단, 식품 변색, 이취, 냉동 화상(freezer burn — 건조한 회색빛 부위)이 있다면 품질이 저하된 것입니다. 먹을 수는 있지만 맛·식감이 떨어집니다. 포장이 손상됐거나 해동 후 이상한 냄새가 나면 폐기하세요.' },
              { q: '닭고기·생선 같은 위험 식품은 어떻게 해동해야 가장 안전한가요?', a: '냉장 해동(4°C) 강력 권장. 닭·생선·해산물·다진 고기는 살모넬라·캠필로박터 등 위험 ↑. 냉장 해동: 24시간 전 냉동고 → 냉장 이동. 닭 1kg(4cm) ≈ 11시간, 갈치 500g(3cm) ≈ 5시간. 주의: 닭·생선용 도마·칼 별도 사용, 도마 즉시 세척, 손 30초 이상 세척, 75°C 이상 가열.' },
              { q: '전자레인지 출력에 따라 해동 시간이 얼마나 다른가요?', a: '1,000g 고기 기준: 700W ≈ 23분, 900W ≈ 18분, 1,100W ≈ 15분, 1,500W ≈ 11분. 본인 전자레인지 출력 확인: 본체 라벨 또는 매뉴얼의 「정격 출력 / Output Power」. 한국 가정용은 보통 700~900W. 전자레인지 해동 주의: 일부 익을 가능성, 해동 후 즉시 조리, 5cm+ 두꺼운 식품 비추천, 중간에 뒤집기.' },
              { q: '명절에 큰 고기 (갈비 5kg) 해동은 얼마나 걸리나요?', a: '5kg 갈비 (두께 5cm) 기준: 냉장 해동 약 2일(44~50시간, 통째), 찬물 해동(밀봉) 6~7시간(흐르는 물이 아니면 30분마다 물 갈기), 실온 해동 비추천(위험), 전자레인지 비추천(균등 해동 X). 추천: 명절 2~3일 전 냉장으로 이동, 또는 명절 당일 새벽에 찬물 해동 시작, 큰 덩어리는 작게 잘라서(가능 시) 해동 빠름.' },
              { q: '해동된 식품이 안전한지 어떻게 확인하나요?', a: '다음 신호 시 폐기 권장: 이상한 냄새(시큼함·암모니아), 변색(회색·녹색·검은빛), 끈적한 표면, 부풀은 포장, 위험 온도대(4~60°C) 2시간 초과 노출. 안전 확인: 정상 색상·냄새, 키친타올 표면 수분 정상, 손가락 누르면 부드럽게 들어감. 의심스러우면 폐기. 식중독은 회복 비용이 음식값보다 훨씬 큼.' },
              { q: '본 도구는 식품 안전 진단을 해주나요?', a: '아닙니다. 본 도구는 일반 정보 제공용 참고 도구이며, 식품 안전 진단·판정 도구가 아닙니다. 실제 해동 시간은 냉동고 온도·식품 포장·냉장고 성능에 따라 다르며, 면역력 약한 분(임산부·고령자·환자·영유아)은 더 엄격한 기준 적용 권장. 식약처 식품안전정보 1399 / foodsafetykorea.go.kr 참고.' },
            ]

export default function ThawingPage() {
  return (
    <ToolPage width={760} slug="/tools/cooking/thawing">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />해동 시간 계산기
      </h1>
      <p className="tp-lead">
        냉장·전자레인지·찬물·실온 <strong style={{ color: 'var(--text)' }}>4가지 해동법 비교</strong> + 식품별 위험도와 시작·완료 시각.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="안전 해동법(냉장·흐르는 찬물·전자레인지)·위험 온도대 2시간 규칙은 식약처·USDA FSIS 안내, 냉장 해동 시간은 USDA '5파운드당 24시간'(≈1kg당 10.6시간)에 맞춘 도구 모델"
        sources={[
          { label: '식약처 식품안전나라', href: 'https://www.foodsafetykorea.go.kr/' },
          { label: 'USDA FSIS The Big Thaw', href: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/big-thaw-safe-defrosting-methods' },
          { label: 'USDA FSIS Freezing and Food Safety', href: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/freezing-and-food-safety' },
        ]}
      />
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        이 도구는 냉동 식재료를 <strong style={{ color: 'var(--text)' }}>얼마 만에 녹일 수 있는지(해동 시간)</strong>를 다룹니다. 언제까지 보관할 수 있는지는 <Link href="/tools/cooking/food-storage" style={{ color: 'var(--accent-ink)' }}>식재료 보관 계산기</Link>에서 확인하세요.
      </p>

      {/* 상단 면책 */}
      <div style={{ marginBottom: '32px' }}>
        <Callout tone="warn" title="식품 안전 안내">
          본 계산기는 <strong>일반적인 참고용 수치</strong>를 제공합니다.
          실제 해동 시간은 냉동고 온도, 식품 포장 상태, 냉장고 성능에 따라 다를 수 있습니다.
          식품 안전을 위해 항상 중심부가 녹았는지 확인하고 <strong>의심스러운 식품은 폐기</strong>하세요.
        </Callout>
      </div>

      <ThawingClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 해동 방법 비교 ── */}
        <div>
          <h2 className="g-h2">
            해동 방법별 비교
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['방법', '속도', '안전도', '권장 식품', '주의사항'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['🧊 냉장 해동',   '느림 (5~48h)',  '★★★★★', '모든 식품',    '1~2일 내 조리',   'var(--success)'],
                  ['💧 흐르는 물',   '빠름 (1~7h)',   '★★★★',  '생선·해산물',  '2시간 이내 · 밀봉', 'var(--accent-ink)'],
                  ['🌡️ 실온 해동',   '보통 (2~16h)',  '★★',    '비권장',       '2시간 초과 금지', 'var(--danger)'],
                  ['⚡ 전자레인지',  '매우빠름 (5~40분)', '★★★', '얇은 육류',   '즉시 조리 필수',  'var(--warning)'],
                ].map(([m, sp, saf, food, note, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 700 }}>{m}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{sp}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{saf}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>{food}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 1-1. 계산 방식 ── */}
        <div>
          <h2 className="g-h2">해동 시간은 이렇게 계산됩니다</h2>
          <p className="g-p">
            계산기의 기준은 <strong>냉장 해동(4°C)</strong>입니다. 3cm 두께 1kg 고기를 10.8시간으로 잡는데, 이는 미국 USDA가 큰 덩어리의 냉장 해동에 안내하는 &lsquo;5파운드(약 2.3kg)당 최소 24시간&rsquo;, 즉 1kg당 약 10.6시간에 맞춘 값입니다.
            여기에 <strong>식품 계수</strong>(소·돼지 1.0 · 닭 0.9 · 생선 0.8 · 조리음식 0.7 · 채소 0.5 · 빵 0.45), <strong>두께 보정</strong> √(두께 ÷ 3cm)(0.5~1.7배로 제한), <strong>무게 보정</strong> (무게kg)<sup>0.75</sup>, 부분 냉동이면 0.6을 곱합니다.
            무게에 0.75제곱을 쓰는 이유는 같은 모양이라면 덩어리가 커질수록 열이 중심까지 가는 시간이 무게에 정비례하는 것보다 덜 늘어나기 때문입니다 — 무게가 두 배면 시간은 약 1.7배입니다.
          </p>
          <p className="g-p">
            나머지 방법은 냉장 시간에서 환산합니다. <strong>흐르는 찬물은 냉장 ÷ 7</strong>, <strong>실온은 냉장 ÷ 3</strong>(비교용일 뿐 권장하지 않음), <strong>전자레인지</strong>는 900W 기준 100g당 식품 계수(소·돼지 1.8분 · 닭 1.7분 · 조리음식 1.5분 · 생선 1.4분 · 빵 1.2분 · 채소 1.0분)에 두께 보정 (두께 ÷ 3)<sup>0.4</sup>를 곱하고, 출력이 다르면 900 ÷ W를 곱합니다.
            예를 들어 계산기 기본값인 <strong>소·돼지고기 500g · 3cm · 완전 냉동</strong>은 냉장 10.8 × 0.5<sup>0.75</sup>(≈0.59) = 약 6시간 25분, 흐르는 찬물 약 55분, 전자레인지 900W 9분 · 700W 약 12분이 나옵니다. 같은 고기가 반쯤 녹은 부분 냉동 상태라면 냉장 약 3시간 50분으로 줄어듭니다.
          </p>
          <p className="g-p">
            USDA 안내와 비교하면, 1파운드(약 450g) 정도의 작은 포장은 찬물에서 1시간 안팎, 3~4파운드는 2~3시간이 걸린다고 하는데 계산기의 찬물 시간(1kg 고기 약 1시간 30분)도 이 범위에 들어갑니다. 다만 모든 값은 평평하게 얼린 덩어리를 가정한 추정치라, 뼈가 있거나 여러 조각이 한데 얼어붙어 있으면 더 오래 걸립니다. 조리 전에 가장 두꺼운 부분을 눌러 보거나 칼끝으로 찔러 중심까지 녹았는지 확인하세요.
          </p>
        </div>

        {/* ── 2. 냉동 보관 기간 ── */}
        <div>
          <h2 className="g-h2">
            식품별 냉동 보관 기간
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['식품', '최적 기간', '최대 기간', '냉동 팁'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : i === 3 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['🥩 소고기',       '3~4개월', '6~12개월', '공기 최대한 제거·진공포장 시 더 오래'],
                  ['🐷 돼지고기',     '2~3개월', '6개월',    '1회분씩 소분 냉동'],
                  ['🍗 닭고기',       '2~3개월', '4개월',    '뼈 제거 후 냉동 시 공간 절약'],
                  ['🐟 생선 (흰살)',  '2~3개월', '4개월',    '물기 제거 필수·호일 포장'],
                  ['🦐 새우·오징어',  '2~3개월', '6개월',    '손질 후 냉동·얼음막 코팅'],
                  ['🥦 채소',         '8~12개월', '12개월',   '블랜칭(데치기) 후 냉동'],
                  ['🍞 빵',           '1~2개월', '3개월',    '슬라이스 후 냉동·토스터 해동'],
                  ['🍱 조리된 음식',  '1~2개월', '3개월',    '완전히 식힌 후 소분'],
                ].map(([food, best, max, tip], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{food}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{best}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{max}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: '12px' }}>{tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            −18°C 이하로 계속 얼어 있던 식품은 세균이 증식하지 못해 안전성은 유지됩니다(USDA FSIS). 위 기간은 맛·식감·냉동 화상 같은 <strong>품질 기준</strong>이라, 기간을 넘겼다고 곧바로 위험한 것은 아니지만 건조·이취가 심하면 버리는 편이 낫습니다. 냉동 전 날짜를 적어 두면 관리가 쉽습니다.
          </p>
        </div>

        {/* ── 3. 위험 온도대 ── */}
        <div>
          <h2 className="g-h2">
            위험 온도대와 2시간 규칙
          </h2>
          <p className="g-p">
            <strong style={{ color: 'var(--danger)' }}>4°C ~ 60°C는 세균이 가장 빠르게 증식하는 위험 온도대</strong>입니다.
            식품이 이 구간에 <strong style={{ color: 'var(--text)' }}>2시간 이상 노출</strong>되면 살모넬라·대장균·리스테리아 등 식중독균이 급증해 폐기하는 것이 안전합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
            {[
              { range: '−24°C 이하', label: '급속 냉동', color: 'var(--cat-unit)', desc: '조직 손상 최소' },
              { range: '−18°C 이하', label: '냉동 안전', color: 'var(--cat-unit)', desc: '장기 보관 가능' },
              { range: '0~4°C',     label: '냉장 안전', color: 'var(--success)', desc: '세균 증식 억제' },
              { range: '4~60°C',    label: '위험 온도대', color: 'var(--danger)', desc: '세균 급증' },
              { range: '60~75°C',   label: '조리 구간', color: 'var(--warning)', desc: '가열 살균' },
              { range: '75°C 이상', label: '조리 완료', color: 'var(--accent-ink)', desc: '중심부 1분 이상 (식약처)' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 800, color: item.color, marginBottom: '4px' }}>{item.range}</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>{item.label}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 시나리오 ── */}
        <div>
          <h2 className="g-h2">
            올바른 해동 시나리오
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                title: '시나리오 1 — 오늘 저녁 삼겹살 파티 (3인분, 600g · 2cm)',
                body: '아침 8시에 냉장실로 옮기면 오후 2시쯤(약 6시간) 완전 해동. 급하면 밀봉 후 흐르는 찬물에 약 50분. 해동 후 키친타올로 물기 제거해 구우세요.',
              },
              {
                title: '시나리오 2 — 급하게 닭볶음탕 (닭 1마리, 1kg · 4cm)',
                body: '냉장 해동은 약 11시간. 급하면 지퍼백 밀봉 후 흐르는 찬물에 1.5~2시간, 또는 전자레인지 해동(700W 약 25분, 900W 약 19분) 후 즉시 조리. 도마·칼은 사용 후 뜨거운 물과 세제로 즉시 세척.',
              },
              {
                title: '시나리오 3 — 명절 제수용 생선 (갈치 500g · 3cm)',
                body: '냉장 해동 약 5시간. 전날 저녁 냉장실로 옮겨 두면 다음날 아침에는 충분히 녹아 있습니다. 해동 후 키친타올로 물기 제거하고 바로 조리. 다시 냉동하지 마세요.',
              },
            ].map((sc, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-ink)', marginBottom: '6px' }}>{sc.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{sc.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 재냉동 안내 ── */}
        <div>
          <h2 className="g-h2">해동 후 재냉동 — 되는 경우와 안 되는 경우</h2>
          <ul className="g-list">
            <li><strong>원칙</strong>: 생으로 해동한 식품은 다시 얼리지 않는 것이 국내 가정용 안내의 기본입니다. 해동 중 늘어난 세균은 냉동해도 죽지 않고 그대로 남고, 녹였다 얼리기를 반복하면 육즙이 빠져 맛도 떨어집니다.</li>
            <li><strong>미국 USDA 기준</strong>: 냉장고 안에서만 해동한 생식품은 조리하지 않고 다시 얼려도 안전하다고 봅니다(품질 저하는 감수). 반면 찬물·전자레인지로 해동한 식품은 반드시 조리한 뒤에 얼려야 합니다.</li>
            <li><strong>조리한 음식</strong>: 완전히 익힌 음식은 빨리 식혀 조리 후 2시간 안에 냉장·냉동하면 됩니다.</li>
            <li><strong>권장 습관</strong>: &ldquo;해동 = 조리 예정&rdquo;으로 생각하고 1회분씩 <strong>소분 냉동</strong>해 두면 재냉동 고민 자체가 사라집니다.</li>
          </ul>
        </div>

        {/* ── 6. 전자레인지 W별 해동 시간 보정 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            전자레인지 W별 해동 시간 보정
          </h2>
          <p className="g-p">
            본 도구의 「해동 시간」 탭에서 전자레인지 출력(700·900·1,100·1,500W)을 고르면 900W 기준 시간에 900 ÷ W를 곱해 자동 보정합니다. 아래는 소·돼지고기 1kg(3cm) 기준입니다. 해동 모드는 출력을 낮춰 켰다 껐다 하므로 실제로는 표보다 길어질 수 있으니, 중간에 한 번 뒤집고 녹은 가장자리가 익기 시작하면 멈추세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>출력</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700 }}>1kg 고기 해동</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>특징</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>700W</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>약 23분</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>900W 대비 1.29배 · 도구 기본값</td></tr>
                <tr style={{ background: 'var(--bg2)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>900W</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>약 18분</td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>계산 기준 (×1.0)</td>
                </tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>1,100W (대형)</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>약 15분</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>900W 대비 0.82배</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>1,500W (인버터)</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>약 11분</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>900W 대비 0.6배</td></tr>
              </tbody>
            </table>
          </div>
          <p className="g-note">
            전자레인지 해동 주의: 일부가 익을 수 있으니 해동 후 즉시 조리, 재냉동 금지, 5cm 이상 두꺼운 덩어리는 비추천, 중간에 뒤집어 고르게 해동.
          </p>
        </div>

        {/* ── 7. 식품별 해동 후 조리 팁 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            식품별 해동 후 조리 팁
          </h2>
          <p className="g-p">
            6종 식품별 정확한 조리·교차오염 방지 팁. 본 도구의 「📖 식품별 가이드」 탭에서 자세히.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            {[
              { emoji: '🥩', name: '소·돼지고기', tip: '키친타올 수분 제거 · 굽기 전 10~20분 실온 적응 · 24시간 내 조리' },
              { emoji: '🍗', name: '닭·가금류 (고위험)', tip: '살모넬라 위험 · 도마/칼 별도 즉시 세척 · 75°C+ 가열 · 12시간 내 조리' },
              { emoji: '🐟', name: '생선·해산물 (고위험)', tip: '냉장 해동 권장 · 전자레인지 X (식감 손상) · 비린내 줄이기 우유·청주 5분' },
              { emoji: '🥦', name: '채소·과일', tip: '대부분 냉동 상태로 바로 조리 · 실온 해동 X · 끓는 물·기름 직접' },
              { emoji: '🍞', name: '빵·반죽', tip: '식빵: 실온 30분~1시간 또는 토스터 직접 · 크루아상: 200°C 오븐 5분' },
              { emoji: '🍱', name: '조리된 음식', tip: '재가열 시 중심부 75°C에서 1분 이상 · 2시간 이상 실온 방치 시 폐기 · 재냉동 X' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{f.emoji} {f.name}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{f.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 8. 위험도 평가 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            식품 안전 위험도 — 5요인 평가
          </h2>
          <p className="g-p">
            본 도구의 「해동 시간」 탭에서 자동 평가. 4단계 위험도(🟢 안전 / 🟡 주의 / 🟠 위험 / 🔴 매우 위험)로 표시.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>요인</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>평가 기준</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>해동 방법</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>🟢 냉장 / 🟡 찬물·전자레인지 / 🔴 실온</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>식품 종류</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>🟢 일반 / 🟡 닭·생선·해산물·조리음식 (고위험)</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>두께</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>🟢 ~5cm / 🟡 5~7cm / 🟠 7cm+ (덩어리)</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>위험 온도대 노출</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>🔴 실온 + 2시간 초과 / 🟡 찬물 + 2시간 초과 / 🟢 안전</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>치명적 조합</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>🔴 닭/생선 + 실온 / 🔴 5cm+ + 실온 / 🔴 조리음식 + 4시간+</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 9. 한국 인기 냉동 식품 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            한국 인기 냉동 식품 해동 가이드
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>식품</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>무게·두께</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--accent-ink)', fontWeight: 700 }}>권장 방법</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)' }}>🥓 삼겹살 600g</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>600g · 2cm</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>냉장 약 6시간 · 급하면 찬물 약 50분</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)' }}>🍗 닭볶음탕 1마리</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>1kg · 4cm</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>냉장 약 11시간 · 급하면 찬물 1.5~2시간</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)' }}>🍖 갈비 2kg</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>2kg · 5cm</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>냉장 약 23시간 (하루 전 이동)</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)' }}>🐟 갈치 500g</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>500g · 3cm</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>냉장 약 5시간</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)' }}>🦐 새우 500g</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>500g · 1cm</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>찬물 20~30분 (밀봉)</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)' }}>🦑 오징어 400g</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>400g · 1cm</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>찬물 20~30분 (밀봉)</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)' }}>🎁 명절 갈비 5kg</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>5kg · 5cm</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>냉장 약 2일(44~50시간) · 2~3일 전 미리</td></tr>
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 위 시간은 계산기 공식으로 낸 완전 냉동 기준 값이며, 「해동 시간」 탭 상단의 빠른 입력 프리셋으로 같은 조건을 바로 불러올 수 있습니다.
          </p>
        </div>

        {/* ── 10. FAQ (accordion) ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 11. 면책 강화 + 참고 출처 ── */}
        <Callout tone="note" title="면책 · 식품 안전 도움">
          본 해동 시간 계산기는 <strong>일반 정보 제공 도구</strong>이며 식품 안전 진단·판정 도구가 아닙니다. 실제 해동 시간은 냉동고 온도·식품 포장·냉장고 성능에 따라 다르고, 위험 온도대(4~60°C)에 2시간 넘게 둔 식품이나 냄새·색·식감이 의심스러운 식품은 버리세요. 면역력이 약한 분(임산부·고령자·환자·영유아)은 더 엄격한 기준을 적용하세요. 본 도구의 결과를 따르다 생긴 식중독 등 피해에 대해 책임지지 않습니다.
          도움: 식약처 식품안전정보 <strong>1399</strong> · <a href="https://www.foodsafetykorea.go.kr/" target="_blank" rel="noopener noreferrer">식품안전나라</a> · 식중독 의심 응급 <strong>119</strong> · <a href="https://www.fsis.usda.gov/" target="_blank" rel="noopener noreferrer">USDA FSIS</a>(영문).
        </Callout>

        {/* ── 8. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/recipe', icon: '📐', name: '레시피 비율 계산기', desc: '인분 수에 맞게 재료 자동 계산' },
              { href: '/tools/cooking/serving', icon: '🍽️', name: '1인분 분량 계산기', desc: '쌀·고기·파스타 분량' },
              { href: '/tools/cooking/ramen', icon: '🍜', name: '라면 물양 계산기', desc: '제품별 권장 물양·조리시간' },
              { href: '/tools/cooking/nuts', icon: '🌰', name: '견과류 섭취량 계산기', desc: '견과류별 하루 권장량' },
              { href: '/tools/date/dday', icon: '📅', name: 'D-day 계산기', desc: '해동 알림·유통기한 관리' },
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
