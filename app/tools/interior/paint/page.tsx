import Link from 'next/link'
import PaintClient from './PaintClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import Callout from '@/components/Callout'
import { recommendCans, type Combo } from './paintUtils'

/* ── 평수별 참조표 — 빌드 시 PaintClient [간편 계산]과 같은 가정·공식 + recommendCans로 생성 ──
   정사각형 한 공간 · 천장 2.4m · 창 1.5×1.5m 1개·문 0.9×2.1m 1개 차감 · 벽만 2회 · 로스 10% · 수성 1L당 10㎡ */
const PYUNG_TO_M2 = 3.3058
const comboText = (c: Combo | null) => {
  if (!c) return '—'
  const used = [[18, c.c18], [4, c.c4], [2, c.c2], [1, c.c1]].filter(([, n]) => n > 0)
  const parts = used.map(([size, n]) => (n > 1 || used.length === 1 ? `${size}L × ${n}` : `${size}L`))
  return `${parts.join(' + ')} = ${c.total}L`
}
const QUICK_ROWS = [5, 7, 10, 15, 20, 24, 30].map(py => {
  const side = Math.sqrt(py * PYUNG_TO_M2)
  const net = side * 4 * 2.4 - 1.5 * 1.5 - 0.9 * 2.1
  const liters = (net * 2 / 10) * 1.1
  return { py, net, liters, combo: recommendCans(liters).best }
})
/* 공식 예시 — 도장 면적 28㎡ · 2회 · 수성(10㎡/L) · 로스 10% */
const EX_L = (28 * 2 / 10) * 1.1
const EX_COMBO = recommendCans(EX_L).best

export const metadata = buildMetadata({
  path: '/tools/interior/paint',
  title: '페인트 계산기 — 벽·천장 페인트 양·구매 조합',
  description: '벽·천장 면적과 칠할 횟수로 필요한 페인트량과 구매 조합을 자동 계산. 수성·유성·에나멜 도포 면적 비교, 한국 시판 용량 가이드, 평수별 소요량 표와 셀프 vs 전문 시공 비용까지 안내합니다.',
  keywords: ['페인트계산기', '페인트소요량', '페인트양계산', '셀프페인트', '수성페인트', '벽페인트', '천장페인트', '페인트견적'],
})

const FAQ_LD = [
              {
                q: '24평 아파트 벽 페인트 시공에 페인트 몇 통이 필요한가요?',
                a: '계산기 [간편 계산]에 24평을 넣으면 <strong>정사각형 한 공간</strong>(거실 하나처럼 칸막이 없는 벽 약 81㎡) 기준이라 2회 도장에 약 <strong>18L</strong>가 나옵니다. 방·거실·주방으로 나뉜 24평 아파트 <strong>집 전체</strong>는 칸막이 벽이 더해져 벽 면적이 그보다 훨씬 넓으므로, 구조에 따라 <strong>대략 30L 이상</strong>(18L 통 2개 수준)을 잡는 것이 안전합니다. 정확한 양은 [상세 계산] 탭에서 방마다 벽을 입력해 합산하세요. 천장까지 칠하면 그만큼 더 늘어나고, 벽지 위에 칠하는지 벽지를 뜯고 칠하는지에 따라서도 흡수량이 달라집니다.',
              },
              {
                q: '페인트는 몇 회 도장해야 하나요?',
                a: '일반적으로 <strong>2회 도장이 한국 표준</strong>입니다. 1회 도장은 색이 균일하지 않거나 비치는 부분이 생길 수 있고, 3회는 진한 색 위에 옅은 색을 칠하거나 완전히 다른 색으로 변경할 때 필요합니다. 특히 진한 벽을 흰색·옅은 색으로 덮을 때나, 빨강·노랑처럼 은폐력이 낮은 채도 높은 색을 칠할 때는 3회 도장을 염두에 두세요.',
              },
              {
                q: '페인트 1L로 몇 ㎡를 칠할 수 있나요?',
                a: '한국 표준 수성 페인트는 <strong>1L당 약 9~10㎡(1회 도장 기준)</strong>를 칠할 수 있습니다. 유성 페인트는 11~13㎡, 에나멜은 13~15㎡로 더 넓은 면적을 칠할 수 있습니다. 다만 표면 상태(매끄러움·흡수율)에 따라 실제 도장 면적은 ±15% 정도 차이 날 수 있어 여유분(10%)을 포함해 구매하는 것이 안전합니다.',
              },
              {
                q: '셀프 페인트 vs 도배, 어느 게 더 쉬운가요?',
                a: '<strong>페인트가 일반적으로 더 쉽습니다.</strong> 페인트는 롤러로 균일하게 칠하면 되고, 실수해도 다시 덧칠할 수 있어 초보자에게 친화적입니다. 다만 마스킹·바닥 보호 등 사전 작업이 중요합니다. 도배는 무늬 맞춤·기포 제거 등 기술이 필요해 더 까다롭습니다.',
              },
              {
                q: '페인트 시공 시 환기는 얼마나 해야 하나요?',
                a: '<strong>수성 페인트</strong>는 시공 중과 시공 후 24시간 환기가 권장됩니다. <strong>유성 페인트</strong>는 시너 냄새가 강해 시공 중 강제 환기 + 시공 후 48~72시간 환기가 필요합니다. 친환경 저VOC 페인트도 안전을 위해 12시간 이상 환기를 권장합니다. 특히 임산부·영유아·민감자는 친환경 페인트를 사용하고 충분히 환기 후 입실하세요.',
              },
              {
                q: '남은 페인트는 어떻게 버리나요?',
                a: '남은 페인트는 환경부(현 기후에너지환경부) <strong>「생활계 유해폐기물 관리지침」</strong>의 관리 대상이라 일반 쓰레기로 버리면 안 됩니다. 공식 경로는 관할 유역환경청의 <strong>소량 지정폐기물 수거 서비스</strong>(처리비 kg당 600원에 방문 수거비가 회당 1만~2만원 붙으며, 금액은 지역 안내마다 다르고 직접 운반하면 방문비가 면제됨)이고, 서울시는 내용물이 남은 페인트·락카 통을 특수규격마대로 배출하도록 안내합니다. 흔히 알려진 ‘굳혀서 종량제 배출’은 지자체마다 허용 여부가 달라 거주지 시·군·구 확인이 먼저 필요합니다.',
              },
            ]

export default function PaintPage() {
  return (
    <ToolPage width={760} slug="/tools/interior/paint">
      <h1 className="tp-h1">
        <ToolIconBadge catId="interior" />페인트 계산기
      </h1>
      <p className="tp-lead">
        벽·천장 면적과 칠할 횟수로 <strong style={{ color: 'var(--text)' }}>필요한 페인트량</strong>과 구매 조합.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="수성 1L당 약 10㎡(1회 도장) 기준 — 페인트·시공 단가는 시장 통용 범위, 폐페인트 처리비는 유역환경청·지자체 안내 기준"
        sources={[
          { label: '서울 중구청 소량 지정폐기물 처리 서비스', href: 'https://www.junggu.seoul.kr/content.do?cmsid=15486' },
          { label: '인천시 소량 유해폐기물 처리 서비스 안내', href: 'https://incheon.go.kr/IC010101/view?curPage=&nttNo=2042396&srchKey=&srchSiteRealmCode=&srchWord=' },
          { label: '서울시 재활용 비해당품목 배출기준', href: 'https://news.seoul.go.kr/env/archives/563504' },
          { label: '기후에너지환경부 — 생활계 유해폐기물 관리지침(2023.12 개정)', href: 'https://www.mcee.go.kr/m/mob/policy_data/read.do?menuId=34&condition.code=A6&seq=8220' },
        ]}
      />

      <PaintClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 className="g-h2">
            페인트 소요량 핵심 공식
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
            <div><span style={{ color: 'var(--muted)' }}>도장 면적</span> = 벽·천장·문·창틀 면적 합 (창문·문 차감)</div>
            <div><span style={{ color: 'var(--muted)' }}>필요 페인트 (L)</span> = (도장 면적 × 칠할 횟수) ÷ 1L당 도장 면적</div>
            <div><span style={{ color: 'var(--muted)' }}>여유분 포함</span> = 위 값 × (1 + 로스율 / 100)</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>예시:</strong> 도장 면적 28㎡, 2회 도장, 수성 페인트 (1L=10㎡)<br />
            • 면적 × 회수 = 28 × 2 = <strong style={{ color: 'var(--text)' }}>56㎡</strong><br />
            • 56 ÷ 10 = <strong style={{ color: 'var(--text)' }}>5.6L</strong><br />
            • 10% 여유: <strong style={{ color: 'var(--accent-ink)' }}>{EX_L.toFixed(2)}L</strong> → 추천 <strong style={{ color: 'var(--accent-ink)' }}>{comboText(EX_COMBO)}</strong>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            추천 조합은 시판 용량(18·4·2·1L)을 섞어 필요량 이상이 되는 조합 가운데 남는 양이 가장 적은 것을 고르고, 남는 양이 같으면 통 수가 적은 쪽을 고릅니다. 그래서 6.16L처럼 애매한 양은 4L 2통(8L)보다 4L+2L+1L(7L)이 먼저 나옵니다. 1L당 도장 면적은 통 라벨이나 제품 기술자료의 &lsquo;이론 도포면적&rsquo;을 넣는 것이 가장 정확하며, 이론값은 매끈한 면을 기준으로 한 값이라 거친 면에서는 실제로 덜 칠해진다는 점을 로스율로 보완합니다.
          </p>
        </div>

        {/* ── 2. 페인트 종류별 1L당 도장 면적 ── */}
        <div>
          <h2 className="g-h2">
            한국 페인트 종류별 1L당 도장 면적
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['종류', '1L당 면적 (1회)', '추천 용도'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i === 1 ? 'center' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '수성 페인트',         a: '9~10㎡',  u: '실내 벽·천장',           c: 'var(--accent)' },
                  { t: '유성 페인트',         a: '11~13㎡', u: '나무·금속',              c: 'var(--orange-600)' },
                  { t: '에나멜',              a: '13~15㎡', u: '문·창틀·가구',          c: 'var(--yellow-700)' },
                  { t: '외부용',              a: '7~9㎡',   u: '외벽·옥상',              c: 'var(--cyan-600)' },
                  { t: '프라이머',            a: '8~10㎡',  u: '밑칠 (도장 전 처리)',   c: 'var(--orange-600)' },
                  { t: '친환경 (저VOC)',      a: '9~10㎡',  u: '아이방·민감자',          c: 'var(--emerald-600)' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: r.c, fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2b. 진한 색 커버리지·조색 ── */}
        <div>
          <h2 className="g-h2">
            진한 색은 더 든다 — 커버리지와 조색
          </h2>
          <p className="g-p">
            위 표의 1L당 면적은 흰색·연한 색 도장을 기준으로 한 평균적인 값에 가깝습니다. 업계에서 통용되는 설명으로는, 빨강·노랑 같은 원색이나 채도 높은 진한 색은 안료 특성상 <strong style={{ color: 'var(--text)' }}>은폐력(밑색을 가리는 힘)이 상대적으로 낮은</strong> 경우가 많아, 같은 면적이라도 도포 횟수가 늘어날 수 있습니다. 얼마나 더 드는지는 색상·제품마다 달라 일률적인 배수로 말하기 어렵습니다.
          </p>
          <Callout tone="tip" title="계산기 반영법">
            진한 색으로 바꾸거나 기존의 진한 색을 덮을 때는 칠할 횟수를 <strong style={{ color: 'var(--text)' }}>3회(색상 변경)</strong>로 올리고, 발색이 걱정되면 로스율을 <strong style={{ color: 'var(--text)' }}>15%</strong>로 선택해 여유를 두세요. 조색(틴팅) 페인트는 나중에 추가 구매하면 같은 색을 정확히 다시 맞추기 어려울 수 있다는 것이 통용 관행이므로, 추천 구매 조합의 여유분을 포함해 한 번에 사는 편이 안전합니다.
          </Callout>
        </div>

        {/* ── 3. 평수별 빠른 참조표 ── */}
        <div>
          <h2 className="g-h2">
            평수별 페인트 양 빠른 참조표
          </h2>
          <p className="g-p">
            정사각형 한 공간 가정 · 천장 2.4m · 표준 창문(1.5×1.5m)·문(0.9×2.1m) 각 1개 차감 · <strong style={{ color: 'var(--text)' }}>벽만 2회 도장</strong> · 로스율 10% · 수성(1L당 10㎡) 기준. 도장 면적은 개구부를 뺀 실제 벽 면적입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['평수', '도장 면적', '필요 페인트', '추천 구매'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {QUICK_ROWS.map((r, i) => (
                  <tr key={r.py} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, fontFamily: 'var(--font-sans)', textAlign: 'left' }}>{r.py}평</th>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{Math.round(r.net)}㎡</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.liters.toFixed(1)}L</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontSize: '12px' }}>{comboText(r.combo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            이 표는 칸막이 없는 한 공간 기준이라 &lsquo;집 전체&rsquo; 양으로 쓰면 크게 모자랍니다. 방·거실·주방으로 나뉜 집은 칸막이벽 양면이 모두 도장 면적에 들어가므로, [상세 계산] 탭에서 방마다 가로·세로를 넣어 합산하세요. 천장까지 칠하면 바닥 면적만큼(24평이면 약 79㎡) 도장 면적이 더해져 필요량이 두 배 가까이 늘어납니다.
          </p>
        </div>

        {/* ── 4. 시판 용량 가이드 ── */}
        <div>
          <h2 className="g-h2">
            한국 페인트 시판 용량 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
            {[
              { s: '1L',  c: 'var(--yellow-700)', t: '작은 면적·터치업·견본' },
              { s: '2L',  c: 'var(--cyan-600)', t: '1방 부분 도장' },
              { s: '4L',  c: 'var(--emerald-600)', t: '1방 전체 도장 (인기)' },
              { s: '18L', c: 'var(--accent)', t: '집 전체 도장 (대용량, 약 10~15% 저렴)' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${s.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 26, fontWeight: 800, color: s.c, marginBottom: 4 }}>{s.s}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{s.t}</p>
              </div>
            ))}
          </div>
          <Callout tone="tip" title="경제적 조합 팁">
            18L 1통이 4L 4통(16L)보다 저렴한 경우가 많습니다. 계산기는 남는 양이 가장 적은 조합을 추천하므로, 필요량이 16L를 넘으면 추천 조합과 18L 1통의 가격을 한 번 비교해 보세요.
          </Callout>
        </div>

        {/* ── 5. 면 종류별 흡수율 ── */}
        <div>
          <h2 className="g-h2">
            면 종류별 흡수율 (도장 면적 보정)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { t: '벽지 위 도장',     d: '1L당 면적 약 10% 감소',   color: 'var(--orange-600)' },
              { t: '시멘트 벽',        d: '첫 회 흡수율 매우 높음, 프라이머 필수', color: 'var(--red-600)' },
              { t: '나무 표면',        d: '흡수율 높음, 1.5배 가량 더 필요', color: 'var(--amber-600)' },
              { t: '금속·플라스틱',    d: '흡수율 거의 없음, 1L당 면적 1.2배', color: 'var(--cyan-600)' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.color}`, borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: s.color, fontWeight: 700, marginBottom: 4 }}>{s.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <Callout tone="tip" title="계산기에 반영하는 법">
            위 보정은 계산기의 <strong style={{ color: 'var(--text)' }}>로스율</strong> 버튼으로 적용하세요. 시멘트·무도장 목재처럼 흡수율이 높은 면은 로스율을 <strong style={{ color: 'var(--text)' }}>15%</strong>로 올리고, 벽지 위·금속처럼 흡수가 적은 면은 <strong style={{ color: 'var(--text)' }}>5~10%</strong>면 충분합니다. 새 시멘트·목재는 <strong style={{ color: 'var(--text)' }}>프라이머 1회</strong>를 별도로 — 페인트 종류에서 &lsquo;프라이머&rsquo;를 골라 1회 도장으로 따로 계산한 뒤 합산하면 됩니다.
          </Callout>
        </div>

        {/* ── 5b. 칠하기 전 체크 — 벽지 위 도장·곰팡이 벽 ── */}
        <div>
          <h2 className="g-h2">
            칠하기 전 체크 — 벽지 위 도장·곰팡이 벽
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 6 }}>벽지 위에 칠해도 되나 — 합지 vs 실크</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.75 }}>
                LX하우시스 공식 구분으로 <strong style={{ color: 'var(--text)' }}>합지벽지는 종이 위에 종이를 붙인 종이 벽지</strong>, <strong style={{ color: 'var(--text)' }}>실크벽지는 종이 위에 PVC(염화비닐수지)를 코팅한 비닐 벽지</strong>입니다(물걸레로 닦아도 되는 쪽이 실크). 통용 시공 관행으로는 들뜸·기포 없이 밀착된 합지는 그 위에 바로 도장하는 경우가 많고, 표면이 PVC인 실크벽지는 수성 페인트가 잘 붙지 않아 부착용 프라이머(젯소)를 먼저 칠하거나 벽지를 제거한 뒤 도장하는 쪽이 권장됩니다. 1L당 면적 보정은 위 &lsquo;면 종류별 흡수율&rsquo;을 참고하세요.
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--danger)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 700, marginBottom: 6 }}>곰팡이 벽 — 페인트로 바로 덮지 않기</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.75 }}>
                통용 시공 원칙은 <strong style={{ color: 'var(--text)' }}>제거 → 건조 → 원인 해결 → 도장</strong> 순서입니다. 곰팡이 위에 바로 칠하면 도막 아래에서 재발하기 쉬우므로, 곰팡이를 먼저 제거하고 벽을 완전히 말린 뒤 결로·누수 같은 원인을 잡고 나서 도장하세요. 곰팡이 방지 기능성 도료를 쓰더라도 제거·건조가 선행돼야 한다는 것이 업계 공통 안내입니다.
              </p>
            </div>
          </div>
        </div>

        {/* ── 6. 시공 단계 가이드 ── */}
        <div>
          <h2 className="g-h2">
            페인트 시공 6단계 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { n: '1', t: '표면 정리',     d: '먼지·기름 제거, 균열·구멍 메우기, 사포로 표면 거칠게 (페인트 부착력↑)' },
              { n: '2', t: '마스킹·커버',   d: '마스킹 테이프로 경계 처리, 바닥·가구는 비닐로 커버' },
              { n: '3', t: '프라이머 (선택)', d: '새 시멘트 벽, 색상 변경 시 필수. 나무 표면 사전 처리' },
              { n: '4', t: '1회 도장',      d: '롤러로 큰 면적, 붓으로 모서리·디테일' },
              { n: '5', t: '건조 (4~6시간)', d: '환기 필수. 완전히 마르기 전에 덧칠하지 않기 — 통 라벨의 재도장 간격이 우선이며 저온·다습하면 더 길어짐' },
              { n: '6', t: '2회 도장',      d: '균일한 색상·내구성 확보, 1회보다 훨씬 깨끗한 마감' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-s)', padding: '12px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 800, color: 'var(--accent-ink)', minWidth: 24 }}>{s.n}</span>
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 2 }}>{s.t}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 셀프 vs 전문 ── */}
        <div>
          <h2 className="g-h2">
            셀프 페인트 vs 전문 시공
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 8 }}>셀프 페인트</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>24평 집 전체 약 35~40만원 (재료비, 페인트 약 30~36L 기준)</li>
                <li>시간: 2~3일 (천천히)</li>
                <li>만족도 매우 높음</li>
                <li>페인트는 도배보다 셀프 진입 쉬움</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--cyan-600)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--cyan-600)', fontWeight: 700, marginBottom: 8 }}>전문 시공</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>24평 기준 약 80~120만원</li>
                <li>시간: 1~2일 (빠르게)</li>
                <li>깔끔한 마감</li>
                <li>바닥 평당 약 33,000~50,000원 (인건비 포함)</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 비용은 2026년 기준, 온라인 자재몰·시공 플랫폼 통용 범위이며 지역·브랜드·등급에 따라 달라집니다.
          </p>
        </div>

        {/* ── 7b. 남은 페인트 폐기 ── */}
        <div>
          <h2 className="g-h2">
            남은 페인트, 어떻게 버리나
          </h2>
          <p className="g-p">
            남은 페인트는 일반 쓰레기가 아니라 환경부(현 기후에너지환경부) <strong style={{ color: 'var(--text)' }}>「생활계 유해폐기물 관리지침」</strong>이 정한 생활계 유해폐기물 관리 대상입니다(폐농약·폐의약품 등과 함께 — 2023년 12월 개정판 기준). 공식 배출 경로는 다음 두 가지가 대표적입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--success)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 700, marginBottom: 6 }}>① 유역환경청 소량 지정폐기물 수거</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.75 }}>
                가정에서 나온 폐페인트·폐락카 등 <strong style={{ color: 'var(--text)' }}>소량 지정폐기물 7종</strong>을 전화 신청으로 방문 수거합니다. 처리비 <strong style={{ color: 'var(--text)' }}>kg당 600원</strong> + 방문 수거비 <strong style={{ color: 'var(--text)' }}>회당 1만~2만원</strong>(지역 안내마다 다름)이며, 지정 접수처로 직접 가져가면 방문비가 면제됩니다(10kg 미만 직접 운반 가능, 위험성이 낮으면 20kg까지). 서울권은 한강유역환경청, 세종권은 금강유역환경청 등 관할 유역환경청에 신청합니다. (서울 중구청·세종시·인천시 안내 기준)
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 6 }}>② 서울시 — 특수규격마대 배출</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.75 }}>
                서울시 분리배출 기준은 <strong style={{ color: 'var(--text)' }}>내용물이 남아 있는 페인트·락카 통</strong>을 일반 종량제봉투가 아니라 불연성 폐기물용 <strong style={{ color: 'var(--text)' }}>특수규격마대</strong>로 배출하도록 안내합니다. 폭발·화재 우려가 있는 경우에는 한강유역환경청에 수거를 신청해 별도 처리합니다.
              </p>
            </div>
          </div>
          <Callout tone="warn">
            흔히 알려진 <strong style={{ color: 'var(--text)' }}>&lsquo;신문지·흡착제에 부어 굳힌 뒤 종량제봉투로 배출&rsquo;</strong>은 민간 분리배출 안내에서 널리 퍼진 통용 관행일 뿐, 전국 공통으로 적용되는 공적 원문은 확인되지 않았고 배출 방법은 지자체 조례마다 다릅니다. 소량이라도 거주지 시·군·구(청소행정 부서) 안내를 먼저 확인하세요. 애초에 남기지 않는 것이 최선 — 위 계산기의 추천 구매 조합이 필요량 대비 여유(잉여)를 최소로 잡는 이유이기도 합니다.
          </Callout>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/interior/wallpaper', icon: '🧱', name: '도배 계산기',   desc: '벽지 롤 수·면적·셀프 시공 비용' },
              { href: '/tools/unit/area',          icon: '🏠', name: '평수 변환기',    desc: '아파트 면적 단위 변환' },
              { href: '/tools/unit/converter',     icon: '📐', name: '단위 변환기',          desc: '길이·면적·무게 등 14종 통합 변환' },
              { href: '/tools/life/unit-price',    icon: '🏷️', name: '단가 비교 계산기',     desc: '페인트 가성비 단가 비교' },
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
