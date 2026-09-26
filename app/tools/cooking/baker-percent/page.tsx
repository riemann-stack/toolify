import Link from 'next/link'
import BakerPercentClient from './BakerPercentClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/cooking/baker-percent',
  title: '베이커 퍼센트 계산기 — 제빵 배합비·수분율·르방 자동 계산',
  description: '밀가루 100% 기준 모든 재료 비율을 자동 계산하는 베이커 퍼센트 계산기. 빵 종류별 프리셋 8종, 수분율 가이드, 이스트 3종 변환, 르방·프리퍼먼트 분리 계산까지 제빵 배합비를 한 번에.',
  keywords: ['베이커퍼센트', '제빵배합비', '제빵계산기', '수분율계산', '하이드레이션', '사워도우배합', '바게트레시피', '르방계산', '제빵퍼센트'],
})

const FAQ_LD = [
              {
                q: '베이커 퍼센트의 합이 왜 100%를 넘나요?',
                a: '베이커 퍼센트는 <strong>밀가루를 100% 기준</strong>으로 다른 재료의 비율을 표시하는 방식입니다. 밀가루 외의 재료가 더해지면 합계가 자연스럽게 100%를 넘게 됩니다. 예를 들어 이 계산기의 식빵 프리셋은 183%, 브리오슈 프리셋은 228%입니다. 합이 클수록 부재료(설탕·버터·계란)가 풍부한 빵이라는 뜻입니다.',
              },
              {
                q: '수분율 70%와 65%의 차이는 큰가요?',
                a: '수분율 5% 차이는 <strong>식감에 큰 영향</strong>을 줍니다. 65%는 표준 식빵으로 다루기 쉽고 균일한 결을 가집니다. 70%는 약간 촉촉하고 기공이 큰 편이며 반죽이 약간 더 부드럽습니다. 75% 이상은 본격 고수분 빵(치아바타·사워도우)으로 다루기 어려워지지만 훨씬 큰 기공과 촉촉한 식감을 얻을 수 있습니다. 처음 도전한다면 <strong>65% 정도부터 시작</strong>하는 것이 권장됩니다.',
              },
              {
                q: '사워도우는 왜 일반 빵보다 수분율이 높나요?',
                a: '사워도우는 <strong>르방(천연발효종)을 사용하는데, 르방 자체가 수분율 100% 정도</strong>로 많은 수분을 포함하고 있습니다. 또한 사워도우 특유의 큰 기공과 촉촉한 크럼(속살)을 만들기 위해서는 70~80%의 고수분이 필요합니다. 르방을 별도로 계산하지 않고 본반죽 수분율만 보면 실제 전체 수분율보다 낮게 보일 수 있어, 본 계산기에서는 르방 안의 밀가루·물을 분리해 정확한 전체 수분율을 계산합니다.',
              },
              {
                q: '소금을 빼고 빵을 만들면 안 되나요?',
                a: '<strong>가능하지만 권장되지 않습니다.</strong> 소금은 단순히 맛을 위한 것이 아니라 ① 글루텐 강화(빵 구조 형성), ② 이스트 활동 조절(과발효 방지), ③ 풍미 향상의 역할을 합니다. 소금 없이 빵을 만들면 발효가 너무 빠르게 진행되고 풍미가 떨어집니다. 저염 빵을 원한다면 1% 정도까지 줄이는 것이 좋고, 완전히 빼는 것은 비권장입니다.',
              },
              {
                q: '베이커 퍼센트로 표시된 레시피를 어떻게 읽나요?',
                a: '모든 % 값을 <strong>밀가루 100% 기준</strong>으로 해석하면 됩니다. 예시: "밀가루 100%, 물 70%, 소금 2%, 이스트 1%" → 밀가루 500g 사용 시: 물 350g(500의 70%), 소금 10g, 이스트 5g. 반대로 직접 만들 빵의 양을 정하고 역산할 수도 있습니다. 목표 반죽량 900g, 총 배합률 180% → 밀가루 = 900 ÷ 1.8 = 500g. 본 계산기의 4개 탭에서 양방향 변환을 모두 지원합니다.',
              },
              {
                q: '르방을 넣으면 소금 %는 어떤 밀가루 기준으로 보나요?',
                a: '관례가 두 가지입니다. 이 계산기의 재료표는 <strong>본반죽 밀가루</strong>를 100%로 두고 소금·이스트 %를 표시하고, 수분율만 르방 속 밀가루·물까지 합친 <strong>전체 밀가루</strong> 기준으로 보여 줍니다. 사워도우 프리셋(밀가루 500g·소금 10g·르방 100g)이라면 재료표의 소금은 2.0%지만, 르방 밀가루 50g을 더한 전체 550g 기준으로는 1.82%입니다. 다른 사람의 레시피와 비교할 때는 어느 기준으로 적었는지 먼저 확인하세요 — 수분율 100% 르방이라면 소금 2% 기준으로 르방 20%일 때 약 0.18%p, 30%일 때 약 0.26%p 차이가 납니다.',
              },
            ]

export default function BakerPercentPage() {
  return (
    <ToolPage width={760} slug="/tools/cooking/baker-percent">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />베이커 퍼센트 계산기
      </h1>
      <p className="tp-lead">
        밀가루 100% 기준 모든 재료 비율 자동 + <strong style={{ color: 'var(--text)' }}>수분율·르방</strong>. 빵 종류별 프리셋 8종.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="베이커 퍼센트 정의(밀가루 = 100%)·소금 1.8~2.2%·이스트 환산(생 3 : 액티브 1.2~1.25 : 인스턴트 1)·프리퍼먼트 수분율은 King Arthur Baking 전문가 레퍼런스 기준, 계란 75%·우유 90% 수분 환산은 본 도구 기준값"
        sources={[
          { label: "King Arthur Baking — Baker's Percentage", href: 'https://www.kingarthurbaking.com/pro/reference/bakers-percentage' },
          { label: 'King Arthur Baking — Yeast', href: 'https://www.kingarthurbaking.com/pro/reference/yeast' },
          { label: 'King Arthur Baking — Preferment', href: 'https://www.kingarthurbaking.com/pro/reference/preferment' },
        ]}
      />

      <BakerPercentClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 베이커 퍼센트란? ── */}
        <div>
          <h2 className="g-h2">
            베이커 퍼센트(Baker&apos;s Percentage)란?
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '18px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>베이커 %</span> = (재료 무게 ÷ 밀가루 무게) × 100</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 밀가루를 항상 100%로 두고 다른 재료의 비율을 표시</div>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            일반 요리 레시피의 %는 &lsquo;전체 중 몇 %&rsquo;지만, 제빵의 베이커 퍼센트는 <strong>밀가루 무게 하나를 분모로 고정</strong>합니다.
            밀가루가 여러 종류라면(강력분 70 + 박력분 30처럼) 그 합이 100%가 되고, 물·소금·버터 같은 나머지 재료는 모두 밀가루 대비 비율로 적습니다.
            그래서 합계는 늘 100%를 넘고, 제빵기능사 실기 배합표처럼 &lsquo;비율(%)&rsquo;과 &lsquo;무게(g)&rsquo;를 나란히 적는 방식이 표준으로 쓰입니다.
          </p>
          <ul className="g-list">
            <li><strong>스케일 변경이 쉽다</strong> — 밀가루 무게만 바꾸면 모든 재료가 같은 비율로 따라 움직입니다.</li>
            <li><strong>레시피끼리 비교가 된다</strong> — 서로 다른 크기의 레시피도 수분율·소금·당·지방 비율을 바로 견줄 수 있습니다.</li>
            <li><strong>문제 진단이 빠르다</strong> — 반죽이 질거나 짜면 어느 재료가 표준 범위를 벗어났는지 숫자로 보입니다.</li>
          </ul>
        </div>

        {/* ── 2. 빵 종류별 표준 배합 ── */}
        <div>
          <h2 className="g-h2">
            빵 종류별 표준 배합비와 이 계산기의 프리셋
          </h2>
          <p className="g-p">
            왼쪽 세 열은 일반적으로 통용되는 범위이고, 오른쪽 두 열은 이 계산기 프리셋을 밀가루 500g으로 불러왔을 때 실제로 표시되는 값입니다.
            &lsquo;표시 수분율&rsquo;은 계란(수분 약 75%)·우유(약 90%)·르방 속 물까지 환산한 결과라 통용 범위와 다를 수 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['빵 종류', '통용 수분율', '소금', '이스트', '프리셋 총 배합률', '프리셋 표시 수분율'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '식빵',     h: '60~65%', s: '2%',   y: '1%',        t: '183%',   p: '65.0%' },
                  { n: '바게트',   h: '65~70%', s: '2%',   y: '0.5%',      t: '172.5%', p: '70.0%' },
                  { n: '치아바타', h: '75~80%', s: '2%',   y: '0.5%',      t: '185.5%', p: '80.0%' },
                  { n: '사워도우', h: '70~80%', s: '2%',   y: '0% (르방)', t: '197%',   p: '77.3%' },
                  { n: '피자 도우', h: '55~65%', s: '2.5%', y: '0.3%',      t: '165.8%', p: '60.0%' },
                  { n: '베이글',   h: '50~55%', s: '2%',   y: '1%',        t: '162%',   p: '55.0%' },
                  { n: '크루아상', h: '50~55%', s: '2%',   y: '1%',        t: '225%',   p: '53.0%' },
                  { n: '브리오슈', h: '60%',    s: '2%',   y: '1%',        t: '228%',   p: '48.0%' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--cyan-600)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.h}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.y}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{r.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 통용 범위는 참고값이며 레시피마다 차이가 있습니다. 브리오슈 프리셋은 계란 40%·우유 20%로 물을 넣지 않아, 액체 비율 합(60%)과 달리 수분 환산 후 48.0%로 표시됩니다. 크루아상은 충전용 버터 50%까지 총 배합률에 포함됩니다.
          </p>
        </div>

        {/* ── 3. 수분율 가이드 ── */}
        <div>
          <h2 className="g-h2">
            수분율(Hydration) 가이드
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '16px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2,
            marginBottom: 12,
          }}>
            <span style={{ color: 'var(--muted)' }}>수분율</span> = (액체 속 물 총량 ÷ 밀가루 총량) × 100
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { r: '50~60%', t: '저수분',     c: 'var(--emerald-600)', d: '베이글·비스킷·페이스트리. 다루기 쉬움.' },
              { r: '60~70%', t: '표준',       c: 'var(--accent-ink)', d: '식빵·단과자빵·일반 발효빵.' },
              { r: '70~80%', t: '고수분',     c: 'var(--orange-600)', d: '치아바타·캄파뉴·일부 사워도우. 큰 기공.' },
              { r: '80%+',   t: '매우 고수분', c: 'var(--red-600)', d: '포카치아·하이드라 사워도우. 다루기 어려움.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, fontFamily: 'var(--font-sans)', marginBottom: 4 }}>{g.r}</p>
                <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{g.d}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            같은 수분율이라도 밀가루에 따라 반죽 느낌이 달라집니다. 단백질이 많은 강력분·통밀가루는 물을 더 많이 흡수하므로, 박력분이 섞인 레시피를 강력분으로 바꾸면 같은 70%라도 덜 질게 느껴집니다.
            처음 쓰는 밀가루라면 물을 5%p 정도 남겨 두었다가 반죽 상태를 보며 넣는 편이 안전합니다.
          </p>
          <Callout tone="tip">
            고수분일수록 <strong>큰 기공·촉촉한 식감</strong>을 얻지만, 반죽이 끈적해 성형이 어려워지고 발효 시간이 길어질 수 있습니다. 65%에서 시작해 5%p씩 올려 보세요.
          </Callout>
        </div>

        {/* ── 4. 소금·이스트 가이드 ── */}
        <div>
          <h2 className="g-h2">
            소금·이스트 비율 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--amber-600)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--amber-600)', fontWeight: 700, marginBottom: 8 }}>소금 (밀가루 대비)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li><strong>1.8~2.2%</strong>: 일반적인 제빵 범위</li>
                <li>1% 이하: 맛 밋밋, 발효 조절 어려움</li>
                <li>3% 이상: 짠맛 강함, 이스트 활동 억제</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--amethyst)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--purple-600)', fontWeight: 700, marginBottom: 8 }}>이스트 (인스턴트 드라이 기준)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>0.3~0.5%: 장시간 저온발효 (12시간+)</li>
                <li><strong>0.5~1%</strong>: 일반 표준</li>
                <li>1~2%: 빠른 발효 (1~2시간)</li>
                <li>2%+: 매우 빠른 발효 (단과자빵)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 5. 이스트 변환표 ── */}
        <div>
          <h2 className="g-h2">
            이스트 종류 변환표 (인스턴트 드라이 기준)
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['종류', '환산 비율', '5g 기준'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '인스턴트 드라이', r: '× 1',     v: '5g' },
                  { t: '액티브 드라이',   r: '× 1.25',  v: '6.25g' },
                  { t: '생이스트',         r: '× 3',     v: '15g' },
                  { t: '천연발효종 (르방)', r: '별도 계산', v: '약 100~150g' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--purple-600)', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{r.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ King Arthur Baking 전문가 레퍼런스의 환산은 생이스트 : 액티브 드라이 : 인스턴트 = 3 : 1.2 : 1이며, 이 계산기는 가정용 계량 관행(인스턴트 1작은술 = 액티브 1¼작은술)에 맞춰 1.25를 씁니다. 액티브 드라이는 따뜻한 물에 풀어 활성화해야 하고, 생이스트는 냉장 보관·짧은 유효기간에 주의하세요.
          </p>
        </div>

        {/* ── 6. 르방·프리퍼먼트 ── */}
        <div>
          <h2 className="g-h2">
            르방·프리퍼먼트 활용
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { n: '르방 (Levain)',   d: '천연발효종 · 수분율 100% 일반' },
              { n: '폴리쉬 (Poolish)',d: '100% 수분율 · 보통 8~16시간 발효' },
              { n: '비가 (Biga)',     d: '50~60% 수분율 · 단단한 형태' },
              { n: '스펀지 (Sponge·중종)', d: '50~60% 수분율 · 짧은 발효' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'color-mix(in srgb, var(--purple-600) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--purple-600) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--purple-600)', fontWeight: 700, marginBottom: 6 }}>{c.n}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            프리퍼먼트를 무게만 알고 있을 때는 수분율로 속을 나눕니다. <strong>밀가루 = 총량 ÷ (1 + 수분율/100)</strong>, 물 = 총량 − 밀가루입니다.
            르방·프리퍼먼트 탭의 기본값(본반죽 밀가루 400g·물 280g + 르방 100g·수분율 100%)을 넣으면 르방은 밀가루 50g·물 50g으로 나뉘고,
            전체 수분율은 (280 + 50) ÷ (400 + 50) = <strong>73.3%</strong>로 본반죽만 본 70%보다 3.3%p 높게 나옵니다.
            같은 르방 100g이라도 수분율 60%짜리 비가라면 밀가루 62.5g·물 37.5g이 되어 전체 수분율은 68.6%로 내려갑니다.
          </p>
          <Callout tone="note" title="계산 시 주의">
            프리퍼먼트 안의 밀가루·물을 본반죽에 합산해야 정확한 전체 수분율이 나옵니다. 재료표에 &lsquo;르방 (100% 수분율)&rsquo;처럼 이름에 수분율을 적어 두면 계산기가 자동으로 나눠서 반영합니다.
          </Callout>
        </div>

        {/* ── 7. 계산 예시 ── */}
        <div>
          <h2 className="g-h2">
            계산 예시 — 반죽량에서 밀가루 역산하기
          </h2>
          <p className="g-p">
            &lsquo;총 반죽량 → 재료&rsquo; 탭은 <strong>밀가루 = 목표 반죽량 ÷ (총 배합률 ÷ 100)</strong>으로 계산합니다. 기본값인 식빵 프리셋(총 183%)으로 반죽 900g을 만들면
            밀가루는 900 ÷ 1.83 ≈ 491.8g이고, 나머지는 이 값에 각 비율을 곱합니다 — 물 65% ≈ 319.7g, 설탕 6% ≈ 29.5g, 버터 5% ≈ 24.6g, 분유 4% ≈ 19.7g, 소금 2% ≈ 9.8g, 이스트 1% ≈ 4.9g.
          </p>
          <p className="g-p">
            여기서 발효·굽기 손실을 잊으면 완성품이 작아집니다. 계산기는 식빵 약 12%, 바게트 약 15%, 사워도우 약 13%를 기본 손실률로 쓰므로 900g 반죽은 약 792g의 식빵이 됩니다.
            완성 무게를 맞춰야 한다면 목표 반죽량을 &lsquo;완성 무게 ÷ (1 − 손실률)&rsquo;로 먼저 늘려 잡으세요. 틀에 굽는 빵이라면 틀 용적 대비 반죽량도 함께 확인하는 편이 좋습니다.
          </p>
        </div>

        {/* ── 8. 자주 하는 실수 ── */}
        <div>
          <h2 className="g-h2">
            배합 계산에서 자주 하는 실수
          </h2>
          <ul className="g-list">
            <li><strong>밀가루를 하나만 100%로 잡기</strong> — 강력분 350g + 박력분 150g이면 분모는 500g입니다. 한쪽만 100%로 두면 모든 비율이 부풀려집니다.</li>
            <li><strong>르방 무게를 밀가루에 그대로 더하기</strong> — 르방 100g은 밀가루 100g이 아니라 (수분율 100% 기준) 밀가루 50g + 물 50g입니다.</li>
            <li><strong>우유·계란을 물과 1:1로 치기</strong> — 우유는 약 90%, 계란은 약 75%만 물로 봅니다. 물 대신 우유로 바꿀 때는 약 10%를 더 넣어야 같은 되기가 됩니다.</li>
            <li><strong>생이스트 레시피에 인스턴트를 같은 양 넣기</strong> — 인스턴트는 생이스트의 약 1/3이면 충분합니다. 같은 양이면 과발효로 신맛과 주저앉음이 생깁니다.</li>
            <li><strong>컵·스푼 계량</strong> — 밀가루 1컵은 떠 담는 방식에 따라 무게가 10% 넘게 달라집니다. 베이커 퍼센트는 무게 계량을 전제로 합니다.</li>
          </ul>
        </div>

        {/* ── 9. 활용 팁 ── */}
        <div>
          <h2 className="g-h2">
            베이커 퍼센트 활용 팁
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '레시피 스케일 조정', d: '식빵 1개(500g) → 식빵 3개(1500g): 베이커 퍼센트는 그대로, 무게만 비례 증가' },
              { t: '다른 레시피 비교',   d: '"이 식빵은 수분율 65%, 저 식빵은 70%" — 베이커 퍼센트로 변환하면 직관적' },
              { t: '배합 실험',          d: '수분율 5% 단위 조정, 소금·이스트 미세 조정으로 자신만의 레시피 찾기' },
              { t: '즐겨찾기 저장',      d: '본 계산기에서 최대 20개 레시피 저장 가능 (브라우저 localStorage)' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 10. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 11. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/sourdough',     icon: '🍞', name: '사워도우 스타터 계산기', desc: '르방 안정화·피크 시간·급이 스케줄' },
              { href: '/tools/cooking/recipe',        icon: '📐', name: '레시피 비율 계산기',     desc: '인분 수에 맞게 재료 비율 자동' },
              { href: '/tools/cooking/serving',       icon: '🍽️', name: '1인분 분량 계산기',       desc: '파스타·고기·쌀 분량 가이드' },
              { href: '/tools/cooking/food-storage',  icon: '🧊', name: '식재료 보관 계산기', desc: '냉장·냉동 보관 기간 추적' },
              { href: '/tools/cooking/substitute',    icon: '🔄', name: '식재료 대체 계산기', desc: '버터·설탕·계란 대체 비율' },
              { href: '/tools/unit/converter',        icon: '⚖️', name: '단위 변환기',             desc: '무게·부피·온도 등 14종 통합 변환' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-m)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </ToolPage>
  )
}
