import Link from 'next/link'
import FryingClient from './FryingClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/cooking/frying',
  title: '튀김 시간 계산기 — 재료별 기름 온도·에어프라이어 변환',
  description: '재료별 최적 기름 온도와 튀김 시간 + 에어프라이어 변환 가이드. 새우·치킨·돈가스·고구마·오징어 등 한국 메뉴 다수.',
  keywords: ['튀김시간계산기', '감자튀김온도', '돈까스튀기는시간', '치킨튀김온도', '튀김기름온도', '에어프라이어변환', '새우튀김시간', '냉동만두튀기기'],
})

const FAQ_LD = [
              { q: '기름 온도를 모르는데 어떻게 확인하나요?',
                a: '가장 간단한 방법은 나무젓가락을 기름에 담그는 것입니다. 젓가락 끝에서 기포가 활발하게 올라오면 170~180°C입니다. 기포가 없거나 아주 느리면 아직 온도가 낮은 상태이고, 격렬하게 끓어오르면 190°C 이상의 고온입니다.' },
              { q: '냉동 재료는 해동하고 튀겨야 하나요?',
                a: '재료에 따라 다릅니다. 치킨처럼 두꺼운 육류는 반드시 해동 후 튀겨야 내부까지 익혀집니다. 냉동 만두는 반해동 상태로 튀겨도 되지만, 새우튀김은 찬물 해동 후 물기 제거 후 튀기는 것을 권장합니다. 냉동 감자튀김은 해동 없이 바로 튀겨도 됩니다.' },
              { q: '2차 튀김은 왜 하나요?',
                a: '1차로 꺼낸 직후에는 속에 남은 수분이 수증기로 빠져나오면서 튀김옷을 다시 눅눅하게 만듭니다. 2~3분 쉬게 해 속의 수분을 겉으로 끌어낸 뒤 고온에서 짧게 한 번 더 튀기면 그 수분이 날아가 바삭함이 오래갑니다. 감자튀김은 1차(저온으로 속 익히기) → 2차(고온으로 겉 바삭하게)가 기본이고, 계산기에서도 감자튀김·치킨은 2차를 필수·권장으로 보고 총 시간에 휴지와 2차를 포함합니다.' },
              { q: '에어프라이어로 하면 맛이 다른가요?',
                a: '에어프라이어는 기름을 거의 사용하지 않아 칼로리가 낮지만, 고온 공기 순환 방식이라 기름에 직접 튀기는 것보다 겉면의 바삭함이 약간 다를 수 있습니다. 기름 분사(에어프라이어 내부에 식용유 약간 뿌리기)를 하면 튀김에 더 가까운 식감을 낼 수 있습니다.' },
              { q: '튀기다 색이 너무 진해졌는데 꺼내야 하나요?',
                a: '육류(치킨, 돈까스)는 겉색이 진해도 속이 안 익었을 수 있습니다. 기름 온도가 너무 높아 겉만 빨리 익은 경우가 많으니, 꺼내서 가장 두꺼운 부분을 잘라 분홍빛이 남았는지 보고, 가능하면 탐침 온도계로 중심온도 75°C를 확인하세요. 육즙 색만으로는 확실하지 않습니다. 덜 익었다면 온도를 160°C대로 낮춰 다시 튀기면 겉이 더 타지 않고 속을 익힐 수 있습니다. 채소·해산물은 황금갈색이 완성 신호이고, 진갈색에 가까워지면 쓴맛이 날 수 있습니다.' },
              { q: '치킨 안전 내부온도가 자료마다 75°C, 74°C로 다른 이유는?',
                a: '기관별 기준 체계가 다르기 때문입니다. 한국 식약처는 부위 구분 없이 육류·가금류는 중심온도 75°C, 어패류는 85°C에서 1분 이상 익히도록 일괄 권고합니다. 반면 미국 USDA FSIS는 부위별로 세분해 가금류 74°C(165°F), 다짐육 71°C(160°F), 통살 스테이크류 63°C(145°F)에 3분 휴지를 제시합니다. 서로 다른 체계의 숫자를 섞어 쓰면 안 되며, 가정에서는 더 보수적인 식약처 기준을 따르면 됩니다.' },
            ]

export default function FryingPage() {
  return (
    <ToolPage width={760} slug="/tools/cooking/frying">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />튀김 시간 계산기
      </h1>
      <p className="tp-lead">
        재료별 <strong style={{ color: 'var(--text)' }}>최적 기름 온도와 시간</strong> + 에어프라이어 변환. 바삭함은 디테일에서.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="안전 중심온도는 식약처 식중독 예방 수칙(육류 75℃·어패류 85℃, 1분 이상)과 USDA FSIS 안전 최저 내부온도표 · 재료별 온도·시간은 가정 조리 참고값"
        sources={[
          { label: '식품의약품안전처', href: 'https://www.mfds.go.kr' },
          { label: 'USDA FSIS Safe Minimum Internal Temperature Chart', href: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart' },
          { label: '소방청', href: 'https://www.nfa.go.kr' },
        ]}
      />

      <FryingClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 기름 온도별 용도 가이드 ── */}
        <div>
          <h2 className="g-h2">
            기름 온도별 용도 완전 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {[
              { range: '150~160°C', label: '저온',     color: 'var(--cyan-600)', desc: '채소·고구마·두꺼운 재료 속 익히기' },
              { range: '160~170°C', label: '중저온',   color: 'var(--sky-500)', desc: '두꺼운 고기류 1차 튀김, 냉동 재료' },
              { range: '170~180°C', label: '중온(표준)', color: 'var(--teal-600)', desc: '대부분 재료의 적정 온도' },
              { range: '180~190°C', label: '고온',     color: 'var(--amber-600)', desc: '얇은 재료, 2차 튀김 바삭함 완성' },
              { range: '190°C 이상', label: '초고온',  color: 'var(--red-600)', desc: '오징어·새우 등 빠른 완성, 타기 쉬우니 주의' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `4px solid ${r.color}`, borderRadius: 'var(--radius-s)', padding: '12px 16px', display: 'grid', gridTemplateColumns: '110px 80px 1fr', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 800, color: r.color }}>{r.range}</span>
                <span style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 600 }}>{r.label}</span>
                <span style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{r.desc}</span>
              </div>
            ))}
          </div>
          <Callout tone="tip" title="온도계가 없을 때 — 마른 나무젓가락으로 확인">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>기포 없음 → 150°C 이하</li>
              <li>젓가락 끝에서 잔 기포가 천천히 → 160°C 전후</li>
              <li>젓가락 전체에서 기포가 활발하게 → 170~180°C (대부분 재료의 적정 온도)</li>
              <li>기포가 격렬하게 솟음 → 190°C 이상</li>
            </ul>
            젓가락이 젖어 있으면 물이 끓는 기포와 헷갈리니 반드시 마른 것을 쓰고, 기름 양·냄비 재질에 따라 차이가 나므로 대략적인 신호로만 쓰세요.
          </Callout>
        </div>

        {/* ── 2. 재료별 빠른 참조표 ── */}
        <div>
          <h2 className="g-h2">
            재료별 튀김 시간 빠른 참조표
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>
            * 기준: 생재료, 보통 크기, 보통 튀김옷, 각 재료 권장 온도 (위 계산기와 동일). 조건이 바뀌면 계산기에서 자동 보정됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '권장 온도', '1차', '2차', '포인트'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '감자튀김', t: '160→180°C', a: '3~4분',   b: '1~1.5분', p: '2차 필수' },
                  { n: '새우튀김', t: '170~180°C', a: '1.5~2.5분', b: '없음',   p: '빨리 꺼내기' },
                  { n: '돈까스',   t: '160~180°C', a: '4~6분',   b: '선택(1~2분)', p: '내부 확인 필수' },
                  { n: '치킨',     t: '160~175°C', a: '12~15분', b: '2~3분',  p: '중심 75°C 확인' },
                  { n: '오징어',   t: '175~185°C', a: '1~2분',   b: '없음',   p: '오래 튀기면 질김' },
                  { n: '만두',     t: '165~180°C', a: '4~6분',   b: '없음',   p: '과밀 금지' },
                  { n: '고구마',   t: '160~175°C', a: '3~5분',   b: '선택',   p: '당분 주의(탐)' },
                  { n: '김말이',   t: '170~180°C', a: '2~3분',   b: '없음',   p: '굴려 가며, 김 탐 주의' },
                  { n: '가지',     t: '170~180°C', a: '1.5~2.5분', b: '없음', p: '기름 흡수 많음' },
                  { n: '생선',     t: '170~185°C', a: '3~5분',   b: '선택',   p: '뒤집기 한 번만' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '10px 10px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.a}</td>
                    <td style={{ padding: '10px 10px', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{r.b}</td>
                    <td style={{ padding: '10px 10px', color: 'var(--muted)' }}>{r.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2-1. 계산 방식 ── */}
        <div>
          <h2 className="g-h2">시간 보정은 이렇게 계산됩니다</h2>
          <p className="g-p">
            계산기는 위 표의 1차·2차 기준 시간에 네 가지 조건 계수를 곱합니다. 재료 상태는 생 1.0·냉장 1.15·냉동 1.4, 두께는 얇음 0.8·보통 1.0·두꺼움 1.3, 튀김옷은 없음 0.85·얇음 0.95·보통 1.0·두꺼움 1.2, 한 번에 넣는 양은 적음 0.95·보통 1.0·많음 1.25입니다.
            여기에 <strong>기름 온도 보정</strong>이 더해지는데, 재료 권장 온도 구간의 가운데 값보다 1°C 높을 때마다 시간을 1.5% 줄이고 1°C 낮을 때마다 1.5% 늘립니다(0.5~2배로 제한).
            2차 튀김이 필수·권장인 재료(감자튀김·치킨)는 총 시간에 휴지 2~3분과 2차 시간을 더하고, &lsquo;선택&rsquo;인 재료는 2차를 따로 안내만 합니다.
          </p>
          <p className="g-p">
            예를 들어 기본값인 <strong>돈까스·생·보통 두께·보통 튀김옷·180°C</strong>는 권장 구간(160~180°C)의 가운데 170°C보다 10°C 높아 시간이 0.85배가 되므로 1차 3분 24초~5분 6초, 선택 2차 51초~1분 42초로 나옵니다.
            <strong>치킨을 170°C</strong>에서 튀기면 가운데 값 167.5°C보다 2.5°C 높아 0.9625배 — 1차 11분 33초~14분 26초, 휴지와 2차를 더한 총 시간은 15분 29초~20분 20초입니다.
            <strong>냉동 만두를 170°C</strong>에서 튀기면 상태 계수 1.4에 온도 계수 1.0375가 곱해져 5분 49초~8분 43초가 되고, 속까지 익었는지 확인하라는 안내가 함께 뜹니다.
          </p>
          <Callout tone="note" title="감자튀김처럼 1·2차 온도가 다를 때">
            계산기는 입력한 한 가지 기름 온도로 1차와 2차를 함께 보정합니다. 감자튀김은 1차 온도 160°C를 넣어 1차 시간(3분 14초~4분 18초)을 보고, 2차는 이미 고온(180°C) 2차를 전제로 한 기준값이므로 위 표의 1~1.5분을 그대로 쓰세요. 180°C를 입력하면 권장 범위를 벗어났다는 경고와 함께 2차가 더 짧게 계산됩니다.
          </Callout>
        </div>

        {/* ── 3. 2차 튀김의 과학 ── */}
        <div>
          <h2 className="g-h2">
            2차 튀김의 과학
          </h2>
          <p className="g-p">
            두 번 튀기면 왜 바삭해질까? 핵심은 <strong style={{ color: 'var(--text)' }}>수분 제거 과정</strong>입니다. 1차에서 막 꺼낸 튀김은 겉이 바삭해 보여도 속의 수증기가 계속 밖으로 나오면서 튀김옷을 다시 눅눅하게 만듭니다.
            잠시 쉬게 해 속의 열과 수분이 겉으로 올라오게 한 뒤 고온에서 짧게 한 번 더 튀기면, 이 수분이 날아가 식은 뒤에도 바삭함이 오래갑니다. 반대로 새우·오징어처럼 금방 익는 재료는 두 번 튀기면 속이 질겨지기만 합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {[
              { n: '1차', c: 'var(--cyan-600)', t: '속 익히기', d: '내부 수분을 증발시키면서 속까지 익힘. 중저온(160~170°C)으로 천천히.' },
              { n: '휴지', c: 'var(--amber-600)', t: '온도 균일화', d: '2~3분 쉬어 내부 온도가 전체로 퍼짐. 증기가 빠지며 튀김옷이 마르기 시작.' },
              { n: '2차', c: 'var(--teal-600)', t: '크리스피 완성', d: '고온(180~190°C) 짧게. 속에서 다시 올라온 표면 수분을 날려 바삭하게.' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${s.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '22px', fontWeight: 800, color: s.c, marginBottom: '4px' }}>{s.n}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '6px' }}>{s.t}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: 'var(--success)' }}>필수·권장:</strong> 감자튀김·치킨<br />
              <strong style={{ color: 'var(--accent-ink)' }}>선택:</strong> 돈까스·고구마·생선<br />
              <strong style={{ color: 'var(--muted)' }}>불필요:</strong> 새우·오징어·만두·김말이·가지
            </p>
          </div>
        </div>

        {/* ── 4. 냉동 재료 가이드 ── */}
        <div>
          <h2 className="g-h2">
            냉동 재료 튀김 완전 가이드
          </h2>
          <p className="g-p">
            차가운 재료, 특히 냉동 재료는 넣는 순간 기름 온도를 크게 떨어뜨립니다. 한 번에 많이 넣으면 온도가 회복되지 않아 튀김옷이 기름을 머금고 눅눅해집니다. 계산기가 냉동 상태에 시간 1.4배를 곱하는 것도 속까지 열이 닿는 데 더 오래 걸리기 때문입니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            {[
              { n: '냉동 생닭(치킨)', c: 'var(--danger)', d: '해동 후 튀기기. 두꺼운 고기는 냉동 상태로 넣으면 겉만 타고 속이 덜 익기 쉽고, 얼음이 기름을 튀깁니다.' },
              { n: '냉동 만두',    c: 'var(--warning)', d: '살짝 해동 후 튀김 권장. 완전 냉동 상태는 터짐과 온도 급락 원인.' },
              { n: '냉동 새우',    c: 'var(--cyan-600)', d: '찬물에 해동 → 물기 완전 제거 → 튀김옷 → 고온 단시간.' },
              { n: '냉동 감자',    c: 'var(--success)', d: '제품 대부분은 해동 없이 바로 튀기도록 만들어져 있습니다. 해동하면 물러져 바삭함이 떨어집니다. 포장 조리법을 우선하세요.' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${f.c}`, borderRadius: 'var(--radius-s)', padding: '12px 16px' }}>
                <p style={{ fontSize: '13px', color: f.c, fontWeight: 700, marginBottom: '4px' }}>{f.n}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{f.d}</p>
              </div>
            ))}
          </div>
          <Callout tone="tip" title="온도 급락 방지">
            재료를 <strong>3~5개씩 나눠</strong> 넣고, 한 번 건진 뒤에는 기름 온도가 다시 오를 때까지 기다렸다가 다음 재료를 넣으세요. 기름 표면이 재료로 덮일 만큼 한꺼번에 넣으면 온도가 회복되지 않습니다. 계산기에서 &lsquo;양 많음&rsquo;을 고르면 시간이 1.25배로 늘어나는 것도 이 때문입니다.
          </Callout>
        </div>

        {/* ── 5. 에어프라이어 변환 ── */}
        <div>
          <h2 className="g-h2">
            에어프라이어 완전 변환 가이드
          </h2>
          <p className="g-p">
            에어프라이어는 뜨거운 공기로 익히는데, 공기는 기름보다 열을 훨씬 느리게 전달합니다. 그래서 같은 재료라도 온도는 기름 튀김 권장 온도의 위쪽 끝과 같거나 그보다 높게(감자튀김은 200°C) 잡고, 시간은 훨씬 길게 잡아야 합니다.
            계산기 데이터 기준으로 온도는 180~200°C, 시간은 기름 튀김의 약 1.4~5배입니다. 치킨처럼 원래 오래 튀기는 두꺼운 재료는 배율이 작고, 1~2분이면 끝나는 새우·오징어처럼 얇은 재료는 배율이 큽니다. 그러니 &lsquo;기름 시간 × 몇 배&rsquo; 같은 한 가지 공식보다 아래 표처럼 재료별 값을 쓰는 편이 정확합니다.
          </p>
          <Callout tone="tip" title="에어프라이어 공통 요령">
            예열 3~5분 · 중간에 한 번 뒤집기 · 바스켓에 겹치지 않게 한 층으로 · 겉면에 식용유를 살짝 뿌리면 튀김에 가까운 색과 식감. 기기 용량·출력에 따라 차이가 크니 처음에는 표의 짧은 시간에서 확인하세요.
          </Callout>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '기름 튀김', '에어프라이어', '시간 배율(중간값)'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '감자튀김', o: '160~170°C · 1차+2차 약 4분 45초', t: '200°C', m: '15~20분', f: '약 3.7배' },
                  { n: '새우튀김', o: '170~180°C · 약 2분',  t: '190°C', m: '8~10분',  f: '약 4.5배' },
                  { n: '돈까스',   o: '160~180°C · 약 5분',  t: '180°C', m: '12~15분', f: '약 2.7배' },
                  { n: '치킨',     o: '160~175°C · 1차+2차 약 16분', t: '180°C', m: '20~25분', f: '약 1.4배' },
                  { n: '오징어튀김', o: '175~185°C · 약 1분 30초', t: '190°C', m: '6~9분', f: '약 5배' },
                  { n: '고구마튀김', o: '160~175°C · 약 4분', t: '180°C', m: '15~20분', f: '약 4.4배' },
                  { n: '만두',     o: '165~180°C · 약 5분',  t: '180°C', m: '10~12분', f: '약 2.2배' },
                  { n: '김말이',   o: '170~180°C · 약 2분 30초', t: '180°C', m: '7~10분', f: '약 3.4배' },
                  { n: '가지튀김', o: '170~180°C · 약 2분',  t: '190°C', m: '6~9분',  f: '약 3.8배' },
                  { n: '생선튀김', o: '170~185°C · 약 4분',  t: '185°C', m: '10~14분', f: '약 3배' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.o}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.t} · {r.m}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.f}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 기름 튀김 시간은 계산기 기준값(생·보통 두께·보통 튀김옷)의 중간값이고, 2차가 필수인 재료는 1차와 2차를 합쳤습니다(휴지 제외). 배율은 에어프라이어 시간 중간값 ÷ 기름 튀김 시간입니다.
          </p>
        </div>

        {/* ── 6. 겉바속촉 팁 10가지 ── */}
        <div>
          <h2 className="g-h2">
            겉바속촉을 위한 팁 10가지
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
            {[
              '재료 표면 물기 완전 제거 (키친타올)',
              '반죽은 찬물로, 가루가 약간 남을 만큼만 가볍게 섞기',
              '반죽에 탄산수 사용 (바삭함 향상)',
              '기름 충분히 예열 후 재료 투입',
              '재료 과밀 금지 (온도 유지 핵심)',
              '중간에 젓가락으로 저어주기 (균일 가열)',
              '건져낸 후 기름 망 위에 세워 놓기',
              '소금은 완성 직후 뿌리기',
              '2차 튀김 전 2~3분 휴지',
              '식은 튀김은 고온 기름이나 에어프라이어로 짧게 재가열',
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-s)', padding: '10px 14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 800, color: 'var(--accent-ink)', flexShrink: 0, minWidth: 24 }}>{i + 1}</span>
                <span style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.6 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 식품 안전 ── */}
        <div>
          <h2 className="g-h2">
            식품 안전 주의사항
          </h2>
          <p className="g-p">
            계산기의 시간은 참고용입니다. 조리 환경, 재료 크기, 냉동·냉장 보관 상태에 따라 실제 시간이 다를 수 있으니 육류와 냉동 재료는 시간과 상관없이 가장 두꺼운 부분의 익힘을 확인하세요. 속까지 확실히 보려면 탐침 온도계가 가장 정확합니다.
          </p>
          <p className="g-p">
            안전 내부온도는 기관마다 체계가 다릅니다. <strong style={{ color: 'var(--text)' }}>한국 식약처는 부위 구분 없이 일괄 기준</strong>을 권고하고, <strong style={{ color: 'var(--text)' }}>미국 USDA FSIS는 부위·형태별로 세분</strong>합니다. 두 체계의 숫자를 한 표에 섞으면 안 됩니다 — 예컨대 닭고기 75°C는 식약처, 74°C(165°F)는 USDA 기준입니다.
          </p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>① 식약처 기준 — 일괄 권고 (중심온도 1분 이상 유지)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '6px' }}>
            {[
              { n: '🍗 육류·가금류(치킨·돈까스)', t: '75°C', c: 'var(--danger)' },
              { n: '🐟 어패류(생선·오징어·새우)', t: '85°C', c: 'var(--cat-health)' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${s.c}44`, borderRadius: '10px', padding: '12px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{s.n}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '22px', fontWeight: 800, color: s.c, margin: 0 }}>{s.t} 이상</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '2px 0 0' }}>중심온도 1분 이상</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '18px' }}>
            출처: 식품의약품안전처 식중독 예방 6대 수칙 &lsquo;익혀먹기&rsquo;(mfds.go.kr)
          </p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>② USDA FSIS 기준 — 부위·형태별 세분</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '6px' }}>
            {[
              { n: '가금류(통째·부분·분쇄)', t: '74°C', f: '165°F', c: 'var(--danger)', d: '' },
              { n: '분쇄육(소·돼지 다짐육)', t: '71°C', f: '160°F', c: 'var(--cat-life)', d: '' },
              { n: '통살 스테이크·찹·로스트', t: '63°C', f: '145°F', c: 'var(--warning)', d: '+ 3분 휴지 필수' },
              { n: '생선·조개류', t: '63°C', f: '145°F', c: 'var(--cat-health)', d: '' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${s.c}44`, borderRadius: '10px', padding: '12px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{s.n}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '22px', fontWeight: 800, color: s.c, margin: 0 }}>{s.t}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '2px 0 0' }}>{s.f}{s.d ? ` ${s.d}` : ''}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '14px' }}>
            출처: USDA FSIS, Safe Minimum Internal Temperature Chart(2025년 4월 갱신). °C는 °F 원문의 환산값(반올림).
          </p>
          <Callout tone="tip" title="어느 기준을 따라야 하나요?">
            가정에서는 더 보수적인 식약처 기준(75°C·85°C, 1분 이상)을 따르는 것이 안전합니다. USDA의 낮은 온도(예: 통살 63°C)는 3분 휴지 같은 시간 조건과 한 세트라, 온도 숫자만 떼어 쓰면 기준 미달이 됩니다.
          </Callout>
          <p className="g-p" style={{ marginTop: '16px' }}>
            <strong>기름 화재도 식품 안전만큼 중요합니다.</strong> 기름에서 연기가 계속 오르면 발화 직전 신호이니 바로 불을 끄세요. 기름에 불이 붙었을 때 물을 부으면 물이 순간적으로 끓어오르며 불붙은 기름을 사방으로 튀겨 불이 커집니다.
            불을 끄고 뚜껑이나 젖지 않은 큰 쟁반으로 덮어 산소를 막고, 주방에는 식용유 화재용(K급) 소화기를 두는 것이 좋습니다. 튀김 중에는 자리를 비우지 말고, 기름 온도를 재료 권장 온도 이상으로 올리지 마세요.
          </p>
        </div>

        {/* ── 8. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/recipe',  icon: '📐', name: '레시피 비율 계산기', desc: '튀김 반죽 비율 자동 계산' },
              { href: '/tools/life/pomodoro',   icon: '🍅', name: '뽀모도로 타이머',   desc: '튀김 시간 관리' },
              { href: '/tools/life/dutch',      icon: '🍻', name: '더치페이 계산기',   desc: '홈파티 비용 정산' },
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
