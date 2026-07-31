import Link from 'next/link'
import MoldingClient from './MoldingClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/interior/molding',
  title: '몰딩 계산기 — 천장 몰딩·걸레받이·띠몰딩 개수',
  description: '천장 몰딩·걸레받이·띠몰딩·문틀 프레임의 필요 길이와 2.4m·3.6m 본 수, 재질별(PVC·MDF·우드) 자재비를 자동 계산. 45도 모서리 절단 여유분과 평수별 참조표, 셀프 시공 가이드까지 포함합니다.',
  keywords: ['몰딩계산기', '걸레받이길이', '천장몰딩개수', '몰딩소요량', 'MDF몰딩', 'PVC몰딩', '몰딩비용', '몰딩45도절단'],
})

const FAQ_LD = [
              {
                q: '24평 공간 천장 몰딩에 몇 개가 필요한가요?',
                a: '본 계산기는 평수를 <strong>단일 정사각형 공간</strong>으로 가정합니다. 24평이면 둘레 ≈ √면적×4 = <strong>약 35.6m</strong>이고, 천장 몰딩만 시공할 경우 +10% 로스 + 모서리 여유 ≈ <strong>약 39m</strong>로 <strong>2.4m 몰딩 17개</strong> 또는 <strong>3.6m 몰딩 11개</strong> 정도입니다. 걸레받이까지 함께 시공하면 약 두 배입니다. 다만 실제 아파트는 방이 여러 개로 나뉘어 방마다 둘레가 더해지므로 길이가 더 늘어납니다 — 방별로 가로×세로를 입력하거나 실측을 권장합니다.',
              },
              {
                q: '걸레받이는 문 폭을 빼야 하나요?',
                a: '네, <strong>문이 있는 곳은 걸레받이가 끊기므로 문 폭만큼 제외</strong>해야 합니다. 일반 방문 폭은 <strong>약 0.9m</strong>, 현관·중문은 약 1.0m 정도이며, 문이 여러 개 있으면 모두 합산해서 빼주세요. 문틀 자체는 별도 출입문 프레임 몰딩으로 처리됩니다.',
              },
              {
                q: '모서리 절단 시 여유분은 얼마나 잡아야 하나요?',
                a: '모서리 1개당 <strong>약 5~10cm 여유분</strong>을 권장합니다. 직사각형 방은 모서리 4개이므로 총 20~40cm가 추가로 필요합니다. 마이터 박스 사용 시 5cm로 충분하지만, 마이터 톱 없이 자르면 시행착오로 더 많은 자투리가 발생할 수 있어 <strong>+10cm 정도 잡는 것이 안전</strong>합니다.',
              },
              {
                q: '몰딩은 셀프 시공이 가능한가요?',
                a: '<strong>PVC·스티렌은 셀프 시공 충분히 가능</strong>합니다. 마이터 박스(만원대)와 본드, 가위로 작업할 수 있습니다. <strong>MDF·우드는 마이터 톱 등 도구가 필요</strong>하고 못 작업도 들어가서 난이도가 있습니다. 석고 몰딩은 곡선 마감·도장 작업까지 필요해 전문 시공을 권장합니다.',
              },
              {
                q: '몰딩 가격은 보통 얼마인가요?',
                a: '2026년 기준 한국 시판가로 <strong>스티렌 1,000원/m, PVC 1,500원/m, MDF 2,500원/m, 석고 4,000원/m, 우드 5,000~10,000원/m</strong> 정도입니다(1m당, 1본 2.4m이면 ×2.4 · 매장·등급별 편차 큼). 24평(단일 정사각형 공간 가정) 천장+걸레받이를 MDF로 시공하면 <strong>자재비 약 20만원</strong>, 전문 시공비는 m당 5,000원 추가로 <strong>약 59만원</strong> 정도입니다.',
              },
              {
                q: '도배·바닥재와 몰딩은 어떤 순서로 시공하나요?',
                a: '통용 시공 순서 기준으로 <strong>천장 몰딩·문선(목공) → 도배 → 바닥재 → 걸레받이</strong>가 일반적입니다. 천장 몰딩을 먼저 달아야 벽지를 몰딩 경계선에 맞춰 재단할 수 있고, 걸레받이는 바닥재 가장자리 틈을 덮는 역할이라 바닥 시공 후 마지막에 답니다. 다만 장판처럼 걸레받이를 먼저 대고 자재를 맞춰 재단하는 현장도 있어, 자재·현장에 따라 순서가 바뀔 수 있으니 시공사와 미리 협의하세요.',
              },
              {
                q: '무몰딩으로 하려면 어떤 조건이 필요한가요?',
                a: '몰딩이 가려주던 천장·벽 경계가 그대로 드러나므로, 통용 관행 기준 <strong>천장·벽면 평탄도와 마감 정밀도</strong>가 뒷받침되어야 합니다. 도배 마감은 경계의 벽지 들뜸·미세 크랙이 그대로 보일 수 있어 도장(페인트) 마감과 함께 가는 경우가 많고, 도배만 다시 하는 부분 공사보다 천장 마감까지 함께 손보는 공사에서 적용하기 쉽습니다. 매립형인 마이너스몰딩은 채널 목공이 선행되어야 해 신축·전면 리모델링 단계에서 계획해야 합니다. 가능 여부·비용은 현장 편차가 크니 시공사 견적으로 확인하세요. 본 계산기에서는 <strong>천장 몰딩 체크를 해제</strong>하고 걸레받이만 선택해 계산하면 됩니다.',
              },
            ]

export default function MoldingPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        주거·인테리어
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="interior" />몰딩 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        천장 몰딩·걸레받이·띠몰딩의 <strong style={{ color: 'var(--text)' }}>길이·개수·비용</strong>.
      </p>

      <MoldingClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 몰딩 종류별 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            몰딩 종류별 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { t: '천장 몰딩 (Crown)',   c: 'var(--accent)', d: '천장과 벽 경계 마감. 한국에서 가장 흔한 PVC·MDF.', s: '폭 5~10cm · 1,500~5,000원/m' },
              { t: '걸레받이 (Baseboard)', c: '#EA580C',       d: '벽-바닥 경계. 청소 흔적·의자 상처 가림.',           s: '높이 6~10cm · 1,000~3,000원/m' },
              { t: '띠몰딩 (Chair Rail)',  c: '#9B59B6',       d: '벽 중간 장식 (보통 바닥 90cm). 데코 목적.',         s: '폭 3~6cm · 2,000~5,000원/m' },
              { t: '출입문 프레임',         c: '#0891B2',       d: '문틀 ㄷ자 3면(좌·우·상) 마감. 폭 4~7cm 표준.',       s: '문 1개 ≈ 5.1m · 2,000~6,000원/m' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 6 }}>{g.d}</p>
                <p style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{g.s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 무몰딩·마이너스몰딩 vs 몰딩 시공 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            무몰딩·마이너스몰딩 vs 몰딩 시공
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '12px' }}>
            천장·벽 경계를 어떻게 마감할지는 몰딩 개수 계산보다 먼저 정하는 결정입니다. 아래 비교는 <strong style={{ color: 'var(--text)' }}>통용 관행 수준의 일반론</strong>이며, 비용·가능 여부는 현장 편차가 커 시공사 견적으로 확인해야 합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['구분', '몰딩 시공', '무몰딩', '마이너스몰딩'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: '마감 방식', a: '경계를 몰딩재로 덮음', b: '몰딩 없이 경계 노출', c: '경계에 홈(채널) 매립 — 음각 라인' },
                  { k: '디자인 인상', a: '무난·클래식', b: '미니멀 — 벽·천장이 한 면처럼', c: '미니멀 + 정돈된 음영 라인' },
                  { k: '시공 난도', a: '낮음 — 경계 오차를 몰딩이 가려줌', b: '높음 — 천장·벽 평탄도, 마감 정밀도 요구', c: '가장 높음 — 채널 매립 목공 선행' },
                  { k: '하자 리스크', a: '낮음 — 부분 보수 쉬움', b: '경계 크랙·벽지 들뜸이 그대로 보임', c: '채널 주변 크랙 시 재목공 부담' },
                  { k: '적용 시점', a: '도배만 하는 부분 공사에도 가능', b: '천장 마감까지 함께 손보는 공사에서 유리', c: '신축·전면 리모델링 단계에서 계획' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.k}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.b}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 무몰딩·마이너스몰딩은 몰딩 자재비가 빠지는 대신 정밀 마감 공정이 늘어 총비용이 오히려 높아지는 경우가 많다는 것이 업계 통용 설명입니다 — 금액은 시공사 견적으로 확인하세요.
            무몰딩·마이너스몰딩을 계획 중이라면 본 계산기에서 <strong style={{ color: 'var(--text)' }}>천장 몰딩 체크를 해제</strong>하고 걸레받이·출입문 프레임만 계산하면 됩니다(매립 채널 자재는 프리셋 단가와 달라 재질 &lsquo;직접 입력&rsquo; 권장).
          </p>
        </div>

        {/* ── 3. 걸레받이 높이 선택 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            걸레받이 높이 선택 — 6·8·10cm
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '12px' }}>
            시판 걸레받이는 대체로 <strong style={{ color: 'var(--text)' }}>높이 6~10cm</strong> 범위에서 고르게 됩니다(본 도구 가이드 기준값). 높이에 따른 인상 차이는 통용 관행 수준에서 다음과 같습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { t: '6cm 안팎 — 낮게', d: '걸레받이 존재감이 줄어 벽이 길어 보이고 미니멀한 인상. 최근 인테리어에서 선호되는 경향(통용 관행). 벽 하단 보호 범위는 좁아집니다.' },
              { t: '8cm 안팎 — 중간', d: '낮은 높이와 클래식한 높이 사이의 절충. 기성품에서 흔히 유통되는 높이대로, 어느 쪽으로도 튀지 않는 무난한 선택입니다.' },
              { t: '10cm 안팎 — 높게', d: '클래식하고 안정감 있는 인상. 청소기·대걸레·의자 다리가 닿는 벽 하단 보호 면적이 넓지만, 낮은 천장에서는 무거워 보일 수 있습니다.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>본 계산기와의 연결:</strong> 걸레받이 필요 길이·본 수는 <strong style={{ color: 'var(--text)' }}>둘레(m) 기준</strong>이라 높이를 6cm로 하든 10cm로 하든 개수는 같습니다.
            높이가 바꾸는 것은 공간 인상과 m당 단가 — 높이·폭이 큰 제품일수록 단가가 높은 경향(통용 관행)이니 실제 구매가는 재질 카드의 &lsquo;직접 입력&rsquo;으로 반영하세요.
            교체 공사라면 기존보다 낮은 걸레받이는 벽지에 이전 자국·경계선이 드러날 수 있어 <strong style={{ color: 'var(--text)' }}>기존 높이 이상</strong>을 고르는 것이 통용 관행입니다.
          </div>
        </div>

        {/* ── 4. 한국 표준 몰딩 길이 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 표준 몰딩 길이
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>몰딩 1개</span> = <strong style={{ color: 'var(--accent)' }}>2.4m</strong> (가장 일반적)</div>
            <div><span style={{ color: 'var(--muted)' }}>몰딩 1개</span> = 3.0m (중간 사이즈)</div>
            <div><span style={{ color: 'var(--muted)' }}>몰딩 1개</span> = 3.6m (큰 사이즈, 자투리 적음)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 길이가 길수록 자투리 손실이 적지만, 운반·취급 난이도 ↑</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> 24평 단일 정사각형 공간, 천장 몰딩 + 걸레받이<br />
            • 둘레 ≈ 35.6m (√면적×4) × 2(천장·걸레받이) ≈ 71m<br />
            • +10% 로스율 + 모서리 8개×5cm = 약 78m<br />
            • <strong style={{ color: 'var(--accent)' }}>2.4m 34개</strong> 또는 <strong style={{ color: 'var(--accent)' }}>3.6m 22개</strong>
          </div>
        </div>

        {/* ── 5. 재질별 가격 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            재질별 가격·특징 비교
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재질', '가격(m)', '난이도', '특징'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i === 1 ? 'right' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: 'PVC',    p: '1,500원',         d: '★☆☆',     u: '셀프 OK · 방수 · 변색 적음' },
                  { t: 'MDF',    p: '2,500원',         d: '★★☆',     u: '도장 후 사용 · 한국 인기' },
                  { t: '우드',   p: '5,000~10,000원',  d: '★★★',     u: '천연 우드 · 고급' },
                  { t: '석고',   p: '4,000원',         d: '★★★',     u: '욕실·곡선 디자인 가능' },
                  { t: '스티렌', p: '1,000원',         d: '★☆☆',     u: '저렴·가벼움·임시' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontSize: 12 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 가격은 2026년 기준, 온라인 자재몰·시공 플랫폼 통용 범위이며 지역·브랜드·등급에 따라 달라집니다.
          </p>
        </div>

        {/* ── 6. 모서리 절단 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            모서리 45도 절단 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { t: '🔪 마이터 박스', c: 'var(--accent)', d: '저렴(만원대), 손톱+가이드. 셀프 시공 권장.' },
              { t: '⚙️ 마이터 톱', c: '#0891B2', d: '전동 톱, 정밀도 우수. 대량 작업·전문 시공.' },
              { t: '📐 외각 vs 내각', c: '#EA580C', d: '외각(밖으로 튀어나온 모서리) +0.5cm, 내각(안쪽) -0.5cm 보정.' },
              { t: '🧪 시운전', c: '#9B59B6', d: '본 자재 자르기 전 자투리 자재로 각도·맞물림 시험.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${c.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: c.c, fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(220,38,38,0.05)',
            border: '1px solid rgba(220,38,38,0.25)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.75,
          }}>
            ⚠️ 모서리 1개당 <strong style={{ color: '#EA580C' }}>5~10cm 여유분</strong> 권장.
            직사각형 방은 모서리 4개 = 20~40cm. 자투리 1개를 보수용으로 남겨두세요.
          </div>
        </div>

        {/* ── 7. 평수별 빠른 참조 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            평수별 몰딩 길이 빠른 참조 (천장 + 걸레받이, +10% 로스)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['평수', '둘레', '총 길이', '2.4m 몰딩', '3.6m 몰딩', 'MDF 자재비'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[5, 7, 10, 15, 20, 24, 30, 35].map((py, i) => {
                  // 둘레 = √(평×3.3058)×4 (정사각형 가정 — 계산기와 동일)
                  const peri = Math.sqrt(py * 3.3058) * 4
                  // 천장 + 걸레받이 (걸레받이는 문 1개 -0.9m)
                  const ceil = peri * 1.10 + 0.20 // +10% + 모서리 4×5cm
                  const base = (peri - 0.9) * 1.10 + 0.20
                  const total = ceil + base
                  const c24 = Math.ceil(ceil / 2.4) + Math.ceil(base / 2.4)
                  const c36 = Math.ceil(ceil / 3.6) + Math.ceil(base / 3.6)
                  const cost = c24 * 2.4 * 2500
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{py}평</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{peri.toFixed(1)}m</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{total.toFixed(1)}m</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{c24}개</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{c36}개</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{Math.round(cost).toLocaleString('ko-KR')}원</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ <strong style={{ color: 'var(--text)' }}>단일 정사각형 공간</strong> 가정 둘레(√면적×4), 천장 몰딩 + 걸레받이(문 1개 폭 0.9m 제외) 모두 시공 기준, MDF 2,500원/m 자재비.
            아파트 전체는 방마다 둘레를 더해 더 길어지니 방별로 가로×세로 입력 또는 실측을 권장합니다.
          </p>
        </div>

        {/* ── 8. 시공 시 주의사항 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            시공 시 주의사항
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {[
              { t: '🔪 모서리 절단', d: '45도 절단(마이터 톱 또는 마이터 박스 필수). 자투리 1개당 5~10cm 여유.' },
              { t: '🔧 본드 + 못', d: '본드 + 못 병행이 안정적. PVC는 본드만으로 가능, MDF는 못으로 보강.' },
              { t: '🎨 도장 순서', d: 'MDF는 시공 후 도장보다 시공 전 도장이 깔끔. 끝부분만 보수 도장.' },
              { t: '📏 실측 우선', d: '평수 기반은 정사각형 가정값. 실제 둘레는 실측 권장.' },
              { t: '🔁 추가 여유', d: '시공 미숙·셀프 시공은 +5% 추가 권장. 보수용 1~2개 남겨두기.' },
              { t: '🌡️ 자재 적응', d: 'PVC·MDF는 시공 24시간 전부터 시공할 방에 두기 (변형 방지).' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 9. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* ── 10. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/interior/room-area',     icon: '📐', name: '공간 면적 계산기',           desc: '벽·바닥·천장·평수·부피' },
              { href: '/tools/interior/wallpaper',     icon: '🧱', name: '도배 계산기',         desc: '벽지 롤 수·시공 비용' },
              { href: '/tools/interior/paint',         icon: '🎨', name: '페인트 계산기',       desc: '벽·천장 페인트 양' },
              { href: '/tools/interior/flooring',      icon: '🪵', name: '바닥재 계산기',       desc: '마루·장판·데코타일 박스 수' },
              { href: '/tools/interior/curtain-blind', icon: '🪟', name: '커튼·블라인드 사이즈',       desc: '창문 사이즈로 추천 사이즈' },
              { href: '/tools/unit/converter',         icon: '🔄', name: '단위 변환기',                desc: '길이·면적·무게 등 14종 통합 변환' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
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
    </div>
  )
}
