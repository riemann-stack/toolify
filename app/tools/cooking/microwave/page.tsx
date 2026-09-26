import Link from 'next/link'
import MicrowaveClient from './MicrowaveClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { POWER_OPTIONS, convertTime, efficiencyFactor, fmtSec } from './microwaveUtils'

export const metadata = buildMetadata({
  path: '/tools/cooking/microwave',
  title: '전자레인지 출력 환산기 — 700W·900W·1200W + 식품·타이머',
  description: '600W 레시피를 우리집 800W에선 몇 분? 햇반·만두·즉석국 등 한국 식품 12종 프리셋 + 카운트다운 타이머와 안전 가이드.',
  keywords: ['전자레인지 환산', '700W 900W', '냉동밥 시간', '햇반 데우기', '냉동만두', '즉석국', '전자레인지 W', '카운트다운 타이머', '용기 안전', '계란 폭발'],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}

/* 700W 라벨 시간 → 출력별 환산표 — 계산기와 같은 convertTime(효율 보정 포함)으로 빌드 시 생성 */
const LABEL_W = 700
const LABEL_SECS = [30, 60, 90, 120, 180, 300]
const CONVERT_ROWS = LABEL_SECS.map(sec => ({
  label: fmtSec(sec),
  cells: POWER_OPTIONS.map(w => fmtSec(convertTime(LABEL_W, sec, w))),
}))
/* 본문 예시: 1000W 라벨 1분 30초 → 700W */
const EX_1000_TO_700 = fmtSec(convertTime(1000, 90, 700))

const FAQ_LD = [
  {
    q: '700W를 900W로 바꾸면 시간이 얼마나 줄어드나요?',
    a: '공식: 새 시간 = 기준 시간 × (기준 W ÷ 새 W).<br />• <strong>700W 2분</strong> → 900W: 2 × (700/900) ≈ <strong>1분 33초</strong> (약 22% 감소)<br />• <strong>700W 5분</strong> → 900W: 5 × (700/900) ≈ <strong>3분 53초</strong><br />• <strong>700W 1분</strong> → 1000W: 1 × (700/1000)에 고출력 −5% 보정 ≈ <strong>40초</strong><br />기억하기 쉬운 비율: 700W → 900W는 약 <strong>78%</strong>의 시간이면 충분합니다.',
  },
  {
    q: '출력이 낮을수록 시간이 더 필요한 이유는?',
    a: '전자레인지의 W(고주파 출력)는 1초에 음식 쪽으로 내보내는 마이크로파 에너지의 양입니다. 출력이 낮으면 같은 에너지를 전달하는 데 그만큼 오래 걸리므로 시간은 출력에 <strong>반비례</strong>합니다. 여기에 더해 본 도구는 600W 이하에 +7%, 1000W 이상에 −5%의 보정을 곱합니다. 이는 물리 법칙이 아니라, 라벨 시간을 저출력 기기에 그대로 환산하면 덜 데워지는 경우가 많다는 사용 경험을 반영한 <strong>경험적 보정값</strong>입니다.',
  },
  {
    q: '양을 2배로 하면 시간도 2배인가요?',
    a: '<strong>아니요.</strong> 본 도구는 양이 늘 때 시간을 <strong>N<sup>0.75</sup></strong>배로 늘립니다.<br />• 1인분 → 2인분: ×<strong>1.68</strong><br />• 1인분 → 3인분: ×<strong>2.28</strong><br />• 1인분 → 5인분: ×<strong>3.34</strong><br />양이 적을 때는 마이크로파 일부가 음식에 흡수되지 못하고 조리실 안에서 반사되는데, 양이 늘면 흡수되는 비율이 올라가서 필요한 시간이 양에 정비례하지는 않습니다. 흔히 말하는 &lsquo;양을 두 배로 하면 시간은 1.5~1.75배&rsquo; 경험칙과 같은 범위입니다. 다만 두께가 두꺼워지면 가운데가 늦게 데워지므로 중간에 한 번 섞어 주세요.',
  },
  {
    q: '냉동·냉장·상온에서 시작하면 시간이 얼마나 다른가요?',
    a: '시작 온도가 높을수록 시간이 적게 듭니다. 본 도구는 냉동(−18°C)을 기준으로 냉장(4°C)은 약 <strong>20%</strong>, 상온(20°C)은 약 <strong>40%</strong> 짧게 잡습니다.<br />라벨 시간은 제품이 원래 보관되는 상태를 전제로 하므로, 식품마다 라벨 기준 보관 상태(햇반·즉석국은 상온, 편의점 도시락·우유는 냉장, 냉동식품은 냉동)를 표준으로 두고 다른 온도에서 시작할 때만 시간을 보정합니다.<br />예: 햇반은 상온 보관 제품이라 700W 2분이 라벨 그대로이고, 집에서 얼린 밥이라면 냉동을 골라 약 <strong>3분 20초</strong>로 계산됩니다.',
  },
  {
    q: '계란을 껍질째 전자레인지에 데우면 왜 안 되나요?',
    a: '<strong>폭발 위험</strong> 때문입니다. 껍질이나 막으로 싸인 식품은 속의 수분이 수증기로 바뀌어도 빠져나갈 곳이 없어 압력이 쌓이고, 가열 중이나 꺼낸 뒤 자르거나 씹는 순간 터질 수 있습니다. 뜨거운 내용물이 튀어 얼굴·손에 화상을 입는 사고로 이어집니다.<br />• 껍질째·통째 가열 금지<br />• 계란은 깨서 그릇에 풀거나, 노른자를 이쑤시개로 찔러 막을 터뜨린 뒤 가열<br />• 삶은 계란을 데우려면 잘라서 가열<br />메추리알·밤·소시지·토마토처럼 껍질·막이 있는 식품도 칼집을 내고 데우세요.',
  },
  {
    q: '알루미늄 호일·금속 그릇은 왜 안 되나요?',
    a: '금속은 마이크로파를 반사하고, 모서리·주름·얇은 테두리에서는 전기가 몰리며 <strong>스파크(아크)</strong>가 튈 수 있습니다. 미국 FDA도 금속 팬·호일은 마이크로파를 반사해 음식이 고르게 데워지지 않고 기기를 손상시킬 수 있다며 사용하지 말라고 안내합니다.<br />• 알루미늄 호일·캔·금속 그릇·포크·금색·은색 테두리 그릇<br />• 철사가 든 빵 끈(트위스트 타이)<br />• 가장 흔한 실수: <strong>금색·은색 장식 테두리 도자기</strong> (선물·빈티지 식기 주의)<br />전자레인지에 쓸 수 있는 재질은 식약처 안내 기준으로 유리·도자기·종이, 그리고 &lsquo;전자레인지용&rsquo; 표시가 있는 PP·HDPE 플라스틱입니다.',
  },
  {
    q: '비닐 포장째 데워도 되나요?',
    a: '<strong>&lsquo;전자레인지용&rsquo; 표시가 있는 포장만</strong> 가능하고, 그 경우에도 조리법에 적힌 대로 뚜껑을 열거나 끝을 1~2cm 잘라 증기가 빠질 길을 만들어야 합니다. 식약처는 밀봉된 포장째 가열하면 수증기 압력으로 터질 수 있다고 안내합니다.<br />• 즉석국·즉석밥처럼 전자레인지 조리 표시가 있는 제품 — 표시된 개봉 방법대로<br />• 표시 없는 비닐·용기 — 모양이 변하거나 성분이 음식으로 옮겨갈 수 있어 사용하지 않기<br />가장 무난한 방법은 <strong>내열 그릇에 옮겨 담아</strong> 뚜껑을 살짝 덮고 가열하는 것입니다.',
  },
  {
    q: '가운데가 안 데워지는 이유는?',
    a: '마이크로파는 음식 표면에서 수 cm 안쪽까지만 직접 에너지를 전달하고, 더 깊은 가운데는 바깥의 열이 전도로 옮겨 가며 데워집니다. 그래서 두껍고 큰 덩어리일수록 가운데가 늦고, 미국 농무부(USDA FSIS)는 이런 <strong>&lsquo;콜드 스폿&rsquo;</strong>에서 세균이 살아남을 수 있다고 경고합니다.<br />해결법:<br />1. <strong>중간에 한 번 섞거나 뒤집기</strong> (1/2 지점)<br />2. <strong>가장자리에 두껍게, 가운데는 얇게</strong> (도넛 모양 배치)<br />3. <strong>휴지</strong> (가열 → 1분 휴지 → 추가 가열) — 쉬는 동안 열이 가운데로 퍼짐<br />4. <strong>회전판 확인</strong> — 회전이 멈추면 가열이 매우 불균일',
  },
  {
    q: '빵을 데우면 왜 딱딱해지나요?',
    a: '마이크로파가 빵 속 수분을 빠르게 데워 증발시키고, 식으면서 전분이 다시 단단해지기 때문입니다.<br />해결법:<br />• <strong>10초 단위로 짧게</strong> 가열<br />• <strong>물을 살짝 뿌리거나 젖은 키친타월</strong>로 감싸 가열 (찜 효과)<br />• 데운 즉시 먹기 — 식으면 더 빨리 굳음<br />바삭한 겉면이 중요하면 오븐 토스터·프라이팬이 낫습니다.',
  },
  {
    q: '햇반 데우는 표준 시간은?',
    a: '즉석밥 라벨은 보통 <strong>700W 약 2분</strong>입니다(제품마다 다르니 포장 표시 우선). 본 도구의 즉석밥 프리셋(상온 보관·700W 2분 기준)으로 환산하면:<br />• <strong>600W</strong>: 약 2분 30초<br />• <strong>700W</strong>: 약 2분<br />• <strong>800W</strong>: 약 1분 45초<br />• <strong>900W</strong>: 약 1분 33초<br />• <strong>1000W</strong>: 약 1분 20초<br />• <strong>1200W</strong>: 약 1분 7초<br />두 개를 한 번에 데우면 ×1.68을 적용해 800W 기준 약 2분 57초가 됩니다. 데운 뒤 한 번 섞어 주면 고르게 부드러워집니다.',
  },
  {
    q: '물만 데웠는데 꺼내는 순간 갑자기 끓어 넘쳤어요.',
    a: '<strong>과열(돌비) 현상</strong>입니다. 깨끗한 컵에 물만 넣고 오래 데우면 끓는점을 넘어도 기포가 생기지 않다가, 컵을 움직이거나 티백·커피를 넣는 순간 한꺼번에 끓어오를 수 있습니다. 미국 FDA도 같은 위험을 안내합니다.<br />• 필요한 만큼만, 30초~1분 단위로 나눠 데우기<br />• 전자레인지용 젓개(나무·실리콘)를 넣고 데우거나, 꺼내기 전 잠시 두기<br />• 꺼낼 때 얼굴을 컵 위로 가져가지 않기',
  },
  {
    q: '우리 집 전자레인지 출력(W)은 어디서 확인하나요?',
    a: '문 안쪽이나 뒷면의 <strong>정격 표시(명판)</strong>와 사용설명서에서 &lsquo;고주파 출력&rsquo; 또는 &lsquo;정격 출력&rsquo; 값을 찾으세요. 국내 가정용은 700W가 가장 흔하고, 1000W 이상 고출력 제품도 있습니다. 같은 명판의 <strong>&lsquo;소비전력&rsquo;은 전기를 쓰는 양</strong>으로 출력보다 수백 W 크기 때문에 환산에 넣으면 시간이 크게 짧게 나옵니다. 출력을 단계로 고르는 기기라면 &lsquo;고&rsquo; 단계가 정격 출력이고, &lsquo;중&rsquo;·&lsquo;해동&rsquo;은 그보다 낮습니다.',
  },
]

export default function MicrowavePage() {
  return (
    <ToolPage width={880} slug="/tools/cooking/microwave">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />전자레인지 출력 환산기
      </h1>
      <p className="tp-lead">
        600W 레시피를 <strong style={{ color: 'var(--text)' }}>우리집 800W에선 몇 분?</strong> 한국 식품 12종 프리셋 + 카운트다운 타이머.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="출력 환산은 시간 × (기준 W ÷ 새 W) 반비례에 본 도구의 경험적 보정(600W 이하 +7%·1000W 이상 −5%)을 곱한 값 · 용기·안전 안내는 식약처·미국 FDA·USDA FSIS 기준"
        sources={[
          { label: '식품안전나라 — 전자레인지 전용 식품용기, 바로 알고 사용해요', href: 'https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?menu_no=2694&menu_grp=MENU_NEW01&bbs_no=bbs231&ntctxt_no=1082132' },
          { label: 'U.S. FDA — Microwave Ovens', href: 'https://www.fda.gov/radiation-emitting-products/resources-you-radiation-emitting-products/microwave-ovens' },
          { label: 'USDA FSIS — Cooking with Microwave Ovens', href: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/cooking-microwave-ovens' },
        ]}
      />

      <MicrowaveClient />

      <GuideDivider />

      {/* 1. 어떻게 사용하나요? */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>출력 환산 탭</strong> — 라벨 W·시간 입력 → 내 전자레인지 시간 자동 (W별 비교 막대)</li>
          <li><strong>식품 프리셋 탭</strong> — 12 식품 중 선택 → 양·온도 보정 자동</li>
          <li><strong>타이머 탭</strong> — 환산된 시간으로 즉시 카운트다운 + 종료 알림음</li>
          <li><strong>가이드 탭</strong> — 안전 용기·금지 용기·골든 팁 10가지</li>
        </ol>
      </div>
      <Callout tone="tip">
        환산 결과의 <strong>&lsquo;타이머 시작&rsquo;</strong> 버튼을 누르면 바로 카운트다운이 시작됩니다. 마지막 3초에 비프음, 종료 시 3회 비프음이 울립니다.
      </Callout>

      {/* 2. W 환산 공식 */}
      <h2 className="g-h2">W 환산 공식과 보정</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          전자레인지 출력(W)이 다르면 같은 음식이라도 가열 시간이 반비례로 달라집니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius-s)', padding: '14px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 14, color: 'var(--accent-ink)', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 700, lineHeight: 2 }}>
            새 시간 = 기준 시간 × (기준 W ÷ 새 W) × (새 W 보정 ÷ 기준 W 보정)
          </p>
        </div>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>보정값</strong>: 600W 이하 ×{efficiencyFactor(600).toFixed(2)} · 700~900W ×{efficiencyFactor(800).toFixed(2)} · 1000W 이상 ×{efficiencyFactor(1000).toFixed(2)}</li>
          <li><strong style={{ color: 'var(--text)' }}>예: 700W 5분 → 900W</strong>: 5 × (700/900) ≈ <strong>3분 53초</strong></li>
          <li><strong style={{ color: 'var(--text)' }}>예: 700W 5분 → 600W</strong>: 5 × (700/600) × 1.07 ≈ <strong>6분 15초</strong></li>
          <li><strong style={{ color: 'var(--text)' }}>예: 1000W 1분 30초 → 700W</strong>: 90초 × (1000/700) ÷ 0.95 ≈ <strong>{EX_1000_TO_700}</strong></li>
        </ul>
      </div>
      <p className="g-p">
        보정값은 물리 상수가 아니라 이 도구가 쓰는 경험값입니다. 라벨이 고출력 기준이고 내 기기가 저출력이면 보정이 양쪽에서 곱해지므로 단순 반비례보다 시간이 조금 더 길게 나옵니다.
        처음 데우는 음식이라면 환산 시간의 80% 정도로 먼저 돌리고 상태를 본 뒤 10~20초씩 추가하는 편이 과열을 막는 가장 확실한 방법입니다.
      </p>

      {/* 3. 환산표 (빌드 시 계산) */}
      <h2 className="g-h2">700W 라벨 시간 → 출력별 환산표</h2>
      <p className="g-p">
        포장에 가장 흔한 700W 표기를 기준으로, 계산기와 같은 공식·보정을 적용한 결과입니다. 라벨이 다른 W라면 위 &lsquo;출력 환산&rsquo; 탭에서 직접 계산하세요.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 620 }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>700W 라벨</th>
              {POWER_OPTIONS.map(w => (
                <th scope="col" key={w} style={{ padding: '10px 12px', textAlign: 'right', color: w === LABEL_W ? 'var(--accent-ink)' : 'var(--muted)', fontSize: 12 }}>{w}W</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CONVERT_ROWS.map(r => (
              <tr key={r.label} style={{ borderBottom: '1px solid var(--border)' }}>
                <th scope="row" style={{ padding: '9px 12px', textAlign: 'left', color: 'var(--text)', fontWeight: 700 }}>{r.label}</th>
                {r.cells.map((c, j) => (
                  <td key={j} style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'var(--font-sans)', color: POWER_OPTIONS[j] === LABEL_W ? 'var(--accent-ink)' : 'var(--text)', fontWeight: POWER_OPTIONS[j] === LABEL_W ? 700 : 400 }}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. 고주파 출력 vs 소비전력 */}
      <h2 className="g-h2">라벨의 W는 &lsquo;고주파 출력&rsquo; — 소비전력과 다릅니다</h2>
      <p className="g-p">
        전자레인지 명판에는 W가 두 번 나옵니다. 식품 라벨의 700W와 맞춰 볼 값은 <strong>고주파 출력(정격 출력)</strong>으로, 음식 쪽으로 내보내는 마이크로파의 세기입니다.
        같은 명판의 <strong>소비전력</strong>은 기계가 콘센트에서 끌어 쓰는 전력이라 출력보다 훨씬 큽니다(700W 출력 제품의 소비전력이 1,000W를 넘는 식). 소비전력을 &lsquo;내 W&rsquo;에 넣으면 시간이 짧게 계산되어 덜 데워집니다.
      </p>
      <p className="g-p">
        정격 출력은 국제 표준 IEC 60705(가정용 전자레인지 성능 측정 방법)처럼 정해진 양의 물을 데워 올라간 온도로 산출하는 값이라, 실제 음식의 양·모양·용기에 따라 체감 속도는 달라질 수 있습니다.
        출력 단계를 고르는 기기라면 &lsquo;고&rsquo;가 정격 출력이고 &lsquo;중&rsquo;·&lsquo;약&rsquo;·&lsquo;해동&rsquo;은 그보다 낮은 출력입니다(일반 기기는 마그네트론을 켰다 껐다 하며 평균 출력을 낮추고, 인버터 기기는 출력 자체를 낮춥니다).
      </p>

      {/* 5. 한국 시장 식품 가이드 */}
      <h2 className="g-h2">한국 시장 냉동·즉석 식품 가이드</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>식품</th>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>700W 표준</th>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>핵심 팁</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['햇반·즉석밥',     '2분',          '뚜껑 살짝 열기 + 데운 후 한 번 섞기'],
                ['냉동만두',        '1.5분 + 휴지 + 1분', '휴지(레스팅)가 균일 가열 핵심'],
                ['냉동피자',        '3분',          '오븐 토스터가 더 좋음 (가장자리 타기 쉬움)'],
                ['냉동도시락',      '4분 + 휴지 + 1분', '위치별 가열 차이 큼, 중간 회전 권장'],
                ['즉석국 (CJ·오뚜기)', '2.5분',     '포장에 적힌 개봉 방법대로 (밀봉째 가열 금지)'],
                ['편의점 도시락',   '2~3분',        '뚜껑 비닐 끝 제거'],
                ['우유 (200ml)',    '1분',         '30초씩 분할 + 컵 80%만 (끓어 넘침)'],
                ['빵',              '10초 단위',    '물 한 방울 뿌리면 부드러움 유지'],
                ['계란 통째',       '금지',        '폭발 위험. 풀어서만 가열'],
                ['떡',              '30초',        '물 1~2 스푼, 비닐 X'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '9px 12px',
                      fontFamily: 'var(--font-sans)',
                      color: j === 1 ? 'var(--accent-ink)' : (j === 0 ? 'var(--text)' : 'var(--muted)'),
                      fontWeight: j === 0 || j === 1 ? 700 : 400,
                      fontSize: 13,
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. 안전·금지 용기 */}
      <h2 className="g-h2">안전한 용기 · 금지 용기</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { t: '사용 가능', c: 'var(--teal-600)', items: ['도자기 (금속 장식 없는 것)', '내열유리', '‘전자레인지용’ 표시 PP·HDPE', '키친타월'] },
            { t: '주의', c: 'var(--amber-600)', items: ['전자레인지 조리 표시가 있는 포장 (표시된 대로 개봉)', '오래된 도자기 (테두리 장식 확인)'] },
            { t: '사용 금지', c: 'var(--pink-600)', items: ['알루미늄 호일·캔', '금속 그릇·포크', '금색·은색 테두리', '멜라민·페놀·요소수지 식기', '표시 없는 플라스틱·PET 용기', '계란 통째', '밀봉된 용기·포장'] },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-s)', padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 6px' }}>{g.t}</p>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--muted)', lineHeight: 1.8 }}>
                {g.items.map((it, j) => <li key={j}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="g-p">
        식약처는 전자레인지에 쓸 수 있는 재질로 유리·도자기·종이·폴리프로필렌(PP) 등을 들고, 플라스틱은 반드시 <strong>&lsquo;전자레인지용&rsquo; 표시</strong>를 확인하라고 안내합니다.
        반대로 멜라민·페놀·요소수지 식기(도자기처럼 보이지만 가볍고 잘 깨지지 않는 식당용 그릇 등)는 가열하면 포름알데히드가 나올 수 있어 전자레인지에 쓰면 안 되는 재질로 분류합니다. 전자레인지용으로 만들지 않은 PET 용기(생수병·음료 컵 등)도 변형되거나 미량의 화학물질이 옮겨갈 수 있어 피해야 합니다. 가정간편식도 밀봉한 채 데우면 수증기 압력이 올라가므로 뚜껑을 열거나 포장을 개봉한 뒤 가열하세요.
      </p>
      <Callout tone="warn" title="가장 흔한 사고">
        금색·은색 테두리 그릇(선물·빈티지 식기)에서 스파크가 튀는 경우가 가장 흔합니다. 음식 없이 <strong>빈 채로 돌리는 것</strong>도 마그네트론(본체)을 손상시킬 수 있으니 피하세요.
      </Callout>

      {/* 7. 속까지 안전하게 */}
      <h2 className="g-h2">남은 음식, 속까지 안전하게 데우기</h2>
      <p className="g-p">
        전자레인지는 빠르지만 고르게 데우지는 못합니다. 미국 농무부(USDA FSIS)는 전자레인지 가열이 고르지 않아 생기는 &lsquo;콜드 스폿&rsquo;에서 해로운 세균이 살아남을 수 있다며,
        음식을 고르게 펼치고 뚜껑이나 랩을 살짝 열어 증기가 빠지게 덮은 뒤 가열하라고 권합니다. 덮개 속 수증기가 겉과 속의 온도 차를 줄여 줍니다.
      </p>
      <ul className="g-list">
        <li><strong>중간에 섞거나 뒤집기</strong> — 특히 국·카레·볶음처럼 저을 수 있는 음식은 한 번 섞는 것만으로 편차가 크게 줄어듭니다.</li>
        <li><strong>휴지 시간 지키기</strong> — 가열이 끝난 뒤 1분 정도 두면 열이 가운데로 퍼집니다. 식품 프리셋의 만두·도시락이 &lsquo;가열 → 휴지 → 추가 가열&rsquo;로 설계된 이유입니다.</li>
        <li><strong>온도로 확인하기</strong> — 조리 온도계가 있다면 가장 두꺼운 가운데를 재 보세요. 식약처 식중독 예방 수칙은 고기류를 중심온도 75℃에서 1분 이상 익히도록 안내합니다.</li>
        <li><strong>큰 덩어리 고기는 중간 출력으로 오래</strong> — USDA는 큰 고기는 최대 출력이 아닌 중간 출력으로 더 오래 가열하라고 권합니다. 해동 후에는 바로 조리하세요.</li>
      </ul>

      {/* 8. 골든 팁 */}
      <h2 className="g-h2">전자레인지 골든 팁 10가지</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>중간에 한 번 섞기</strong> — 가운데 안 데워질 때</li>
          <li><strong>가장자리에 음식 두기</strong> — 가운데보다 빠름</li>
          <li><strong>냉동밥은 물 1스푼</strong> — 갓 지은 밥처럼</li>
          <li><strong>빵은 10초 단위</strong> — 오래 데우면 딱딱</li>
          <li><strong>포장은 표시된 대로 개봉</strong> — 밀봉째 가열 금지</li>
          <li><strong>저어주며 데우기</strong> — 끓어 넘침 방지</li>
          <li><strong>휴지(레스팅) 활용</strong> — 만두·도시락 균일 가열</li>
          <li><strong>80%로 시작 → 부족하면 추가</strong> — 과조리 방지</li>
          <li><strong>키친타월 활용</strong> — 빵 보온, 튀김 기름 흡수</li>
          <li><strong>꺼낼 때 화상 주의</strong> — 그릇 매우 뜨거움</li>
        </ol>
      </div>

      {/* FAQ */}
      <Faq items={FAQ_LD} />

      {/* cooking 도구 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/cooking/thawing" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🧊</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해동 시간 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            식품·두께·전자레인지 W별 4가지 해동법
          </p>
        </Link>
        <Link href="/tools/cooking/frying" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🍳</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>튀김 시간 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            기름 온도·에어프라이어 변환
          </p>
        </Link>
        <Link href="/tools/cooking/ramen" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🍜</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>라면 물양 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            1~4개·국물 농도·라면별
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
