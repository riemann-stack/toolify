import Link from 'next/link'
import CurtainBlindClient from './CurtainBlindClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/interior/curtain-blind',
  title: '커튼 블라인드 계산기 — 창문 측정·주문 사이즈',
  description: '창문 사이즈로 커튼·블라인드·롤스크린 주문 사이즈를 자동 계산. 주름 배수(1.5~3배)와 길이·커튼봉 위치, 인사이드 vs 아웃사이드 마운트, 시어·암막 커튼 선택 가이드까지 안내합니다.',
  keywords: ['커튼사이즈계산', '블라인드사이즈', '커튼길이추천', '커튼주름2배', '블라인드재는법', '롤스크린사이즈', '커튼봉길이', '커튼주문사이즈'],
})

const FAQ_LD = [
              {
                q: '커튼 주름은 몇 배가 좋은가요?',
                a: '한국 표준은 <strong>2배 주름</strong>입니다. 봉 길이가 200cm라면 커튼 전체 폭은 400cm가 됩니다. 1.5배는 가벼운 자연 주름, 2.5~3배는 호텔 스타일의 매우 풍성한 주름입니다. 일반 가정 거실·침실은 2배가 가장 안정적이고, 시어 커튼은 1.5~2배, 암막 커튼은 2~2.5배를 권장합니다.',
              },
              {
                q: '블라인드는 창문 안쪽과 바깥쪽 중 어디에 다는 게 좋나요?',
                a: '인테리어 스타일과 빛 차단 정도에 따라 다릅니다. <strong>인사이드 마운트(창문 안쪽)</strong>는 깔끔하지만 좌우 가장자리로 빛이 샙니다. <strong>아웃사이드 마운트(창문 바깥쪽)</strong>는 빛 차단이 우수하고 작은 창을 크게 보이게 합니다. 창문틀 깊이가 6cm 미만이면 인사이드 설치가 어려우니 아웃사이드를 선택하세요.',
              },
              {
                q: '커튼봉은 창문보다 얼마나 길어야 하나요?',
                a: '일반적으로 <strong>창문 폭 + 좌우 15cm씩 = 총 30cm 더 길게</strong> 합니다. 이렇게 하면 커튼을 활짝 열었을 때 창문이 완전히 보이고 빛이 충분히 들어옵니다. 더 시각적 효과를 원한다면 좌우 20cm씩(총 40cm) 더 길게 할 수도 있습니다.',
              },
              {
                q: '커튼 길이는 어디까지가 일반적인가요?',
                a: '한국에서 가장 인기 있는 길이는 <strong>"바닥에서 5cm 위"</strong>입니다. 깔끔한 인상을 주고 청소가 편리합니다. 호텔이나 고급 인테리어를 원한다면 "바닥에 닿거나 +15cm 풀링"을 선택할 수 있지만 청소가 어렵고 먼지가 쌓이기 쉽습니다. 창문이 작거나 라디에이터·가구가 있는 경우 "창문 + 10cm" 짧은 길이도 좋습니다.',
              },
              {
                q: '큰 거실 창문은 커튼 패널을 몇 장 해야 하나요?',
                a: '• 가로 200cm 이하: <strong>양쪽 한 쌍 (좌·우 각 1장)</strong><br/>• 가로 200~350cm: 양쪽 한 쌍 (1패널당 폭이 200cm를 넘으면 3분할 고려)<br/>• 가로 350cm 이상: <strong>3분할 (양쪽 + 중앙) 권장</strong>, 더 넓으면 맞춤 업체 상담<br/>패널이 너무 넓으면 무게 때문에 봉이 휘거나 작동이 어려워지므로 1패널당 폭 200cm 이하를 권장합니다.',
              },
              {
                q: '암막 커튼 차광 1급·2급은 무슨 기준인가요?',
                a: '널리 쓰이는 1~3급 구분은 <strong>일본 인테리어패브릭협회(NIF)</strong>가 JIS L 1055 A법(차광성 시험)에 따라 정한 업계 기준이 국내에 통용된 것입니다. 차광률로 1급 99.99% 이상, 2급 99.80% 이상~99.99% 미만, 3급 99.40% 이상~99.80% 미만이며 2018년 8월부터 1급은 다시 5단계(A++·A+·A·B·C)로 세분화됐습니다. 한국에는 <strong>KS K 0819 「커튼의 차광성 시험방법」</strong>이 현행 표준으로 있지만(2023-07-31 최종 확인 고시) 확인되는 것은 시험방법 표준의 실재까지이므로, 1~3급 숫자를 "KS 등급"이라고 단정한 상품 설명은 걸러 읽는 것이 좋습니다. (2026-07 확인 기준)',
              },
              {
                q: '원단은 몇 폭이 필요한가요?',
                a: '폭 140cm 원단을 기준으로 <strong>(창 폭 × 주름 배수) ÷ 140 → 올림</strong>으로 셉니다. 주름 배수는 2~2.5배가 통용 관행입니다. 예를 들어 창 220cm에 본 계산기 기준 봉 길이 250cm, 2배 주름이면 전체 폭 500cm → 500 ÷ 140 ≈ 3.57 → <strong>4폭</strong>, 2.5배면 5폭입니다. 길이 방향의 상단 헤딩·밑단 시접 여유는 봉제 방식과 업체마다 다르며, 본 계산기는 헴 10cm를 더한 원단 주문 길이를 함께 표시합니다.',
              },
            ]

export default function CurtainBlindPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        주거·인테리어
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="interior" />커튼 블라인드 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        창문 사이즈로 커튼·블라인드·롤스크린 <strong style={{ color: 'var(--text)' }}>추천 사이즈</strong>를 자동으로.
      </p>

      <CurtainBlindClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            커튼·블라인드 사이즈 핵심 공식
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
            <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: 4 }}>커튼</div>
            <div><span style={{ color: 'var(--muted)' }}>봉 길이</span> = 창문 폭 + 30cm (좌우 15cm씩)</div>
            <div><span style={{ color: 'var(--muted)' }}>커튼 폭</span> = 봉 길이 × 주름 배수 (1.5~3배)</div>
            <div><span style={{ color: 'var(--muted)' }}>1패널당 폭</span> = 커튼 폭 ÷ 패널 수</div>
            <div><span style={{ color: 'var(--muted)' }}>커튼 길이(완성)</span> = 봉 위치 ~ 끝점</div>
            <div><span style={{ color: 'var(--muted)' }}>원단 주문 길이</span> = 완성 + 헴 10cm <span style={{ color: 'var(--muted)' }}>(재단·맞춤 시)</span></div>
            <div style={{ marginTop: 14, color: '#0891B2', fontWeight: 700 }}>블라인드 (인사이드)</div>
            <div><span style={{ color: 'var(--muted)' }}>폭</span> = 창문 안쪽 폭 − 1cm (좌우 0.5씩)</div>
            <div><span style={{ color: 'var(--muted)' }}>길이</span> = 창문 안쪽 높이 − 0.5cm</div>
            <div style={{ marginTop: 14, color: '#EA580C', fontWeight: 700 }}>블라인드 (아웃사이드)</div>
            <div><span style={{ color: 'var(--muted)' }}>폭</span> = 창문 폭 + 10cm</div>
            <div><span style={{ color: 'var(--muted)' }}>길이</span> = 창문 높이 + 10cm</div>
          </div>
        </div>

        {/* ── 2. 한국 표준 창문 크기 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 가정 표준 창문 크기
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['창문 종류', '가로 (cm)', '세로 (cm)'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '일반 방 창',          w: '120~180', h: '120~150' },
                  { t: '거실 창 (소형)',      w: '200~250', h: '150' },
                  { t: '거실 창 (대형)',      w: '300~400', h: '200' },
                  { t: '전면 거실 창',        w: '400~500', h: '230' },
                  { t: '베란다 창',           w: '150',     h: '200~230' },
                  { t: '욕실 창',             w: '60~90',   h: '60~90' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.w}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 주름 배수 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎀 주름 배수 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { p: '×1.5', c: '#0891B2', t: '가벼운 주름',     d: '미니멀, 시어 커튼' },
              { p: '×2.0', c: 'var(--accent)', t: '한국 표준',  d: '풍성, 일반 거실·침실' },
              { p: '×2.5', c: '#EA580C', t: '매우 풍성',       d: '호텔 스타일' },
              { p: '×3.0', c: '#DC2626', t: '가장 풍성',       d: '고급 인테리어·암막' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 22, fontWeight: 800, color: s.c, marginBottom: 4 }}>{s.p}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 2 }}>{s.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3-1. 원단 소요량 감 잡기 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🧵 원단 소요량 감 잡기 — 폭 140cm 원단 기준
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            원단을 끊어 맞춤 제작할 때는 <strong style={{ color: 'var(--text)' }}>'몇 폭(幅)이 필요한가'</strong>로 주문합니다. 국내 유통 커튼 원단은 폭 140cm 안팎의 대폭 제품이 흔한데(업계 관행 — 실제 폭은 원단마다 다르니 표기 확인), 폭수는 이렇게 셉니다.
          </p>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
            marginBottom: '12px',
          }}>
            <div><span style={{ color: 'var(--muted)' }}>필요 폭수</span> = (창 폭 × 주름 배수) ÷ 원단 폭 140cm → <span style={{ color: 'var(--muted)' }}>소수점 올림</span></div>
            <div><span style={{ color: 'var(--muted)' }}>주름 배수</span> = 2~2.5배 <span style={{ color: 'var(--muted)' }}>(통용 관행 — 본 계산기 표준 2배)</span></div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '10px' }}>
            예를 들어 거실 창 220cm — 본 계산기는 창 폭에 좌우 여유 30cm를 더한 <strong style={{ color: 'var(--text)' }}>봉 길이 250cm</strong>에 배수를 곱합니다. 2배 주름이면 전체 폭 500cm → 500 ÷ 140 ≈ 3.57 → <strong style={{ color: 'var(--text)' }}>올림 4폭</strong>(양쪽 한 쌍이면 패널당 2폭씩), 2.5배면 625 ÷ 140 ≈ 4.46 → <strong style={{ color: 'var(--text)' }}>5폭</strong>. 창 폭 220cm에 바로 배수를 곱하는 간이 방식이면 440 ÷ 140 ≈ 3.14 → 역시 4폭이지만, 기준에 따라 경계에서 1폭이 갈릴 수 있으니 애매하면 큰 쪽이 안전합니다.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            길이 방향은 완성 길이에 상단 헤딩(봉집·심지)과 밑단 접기 시접을 더해 재단하는데, 여유량은 봉제 방식·업체마다 다릅니다(통용 관행). 본 계산기는 완성 길이에 <strong style={{ color: 'var(--text)' }}>헴 10cm</strong>를 더한 '원단 주문 길이'를 결과에 함께 표시합니다. 무늬 원단은 폭끼리 무늬를 맞추는 여유(리피트)가 추가로 필요합니다.
          </p>
        </div>

        {/* ── 3-2. 헤딩 방식별 주문 기준 차이 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🧷 아일릿·나비주름 — '주문 폭' 기준이 다릅니다
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: 12, padding: '12px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 4 }}>나비주름 (핀치 플리트)</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>
                주름을 접어 박은 상태로 출고되는 방식. 상품 폭이 주름 잡힌 <strong style={{ color: 'var(--text)' }}>완성 폭</strong>으로 표기되는 경우가 많아, 봉·레일 길이에 맞는 완성 폭으로 주문합니다 — 주름 배수는 제작 단계에서 이미 반영(통용 관행).
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--cat-interior)', borderRadius: 12, padding: '12px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--cat-interior)', fontWeight: 700, marginBottom: 4 }}>아일릿 (펀칭)</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>
                원단에 링을 박아 봉에 직접 끼우는 방식. 주름이 고정되지 않아 <strong style={{ color: 'var(--text)' }}>원단 폭</strong> 그대로 표기되는 경우가 많고, 이때는 본 계산기처럼 배수를 곱해 폭을 정합니다. 봉 위로 원단이 올라가는 구조라 완성 길이의 기준점(봉 상단인지 링 하단인지)도 업체 안내로 확인하세요(통용 관행).
              </p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginTop: '10px' }}>
            주문 전 상품 폭이 <strong style={{ color: 'var(--text)' }}>원단 폭 기준인지 완성 폭 기준인지</strong> 확인하세요. 본 계산기의 '커튼 전체 폭'은 주름 배수를 곱한 원단 기준 폭입니다.
          </p>
        </div>

        {/* ── 4. 커튼 길이 옵션 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            📏 커튼 길이 옵션 비교
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { i: '🪟', t: '창문형 (창문 + 10cm)',         d: '창문만 가리는 짧은 커튼. 작은 창문·주방·욕실에 적합.', c: '#0891B2' },
              { i: '🦵', t: '무릎형 (바닥 ~ 무릎)',          d: '한국에서는 비추천. 가구가 많은 공간에서 사용.', c: '#EA580C' },
              { i: '✨', t: '바닥형 (바닥 5cm 위) — 한국 표준', d: '깔끔한 인상, 청소 편함. 거실·침실 모두 적합.', c: 'var(--accent)' },
              { i: '👑', t: '바닥 닿기 / 풀링 (+15cm)',     d: '호텔·고급 인테리어. 우아하지만 청소 어려움.', c: '#9B59B6' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.c}`, borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22 }}>{s.i}</span>
                <div>
                  <p style={{ fontSize: 13, color: s.c, fontWeight: 700, marginBottom: 4 }}>{s.t}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 설치 방식별 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🔧 설치 방식별 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {[
              { t: '🟪 천장 매립 (커튼박스)',  c: '#9B59B6', d: '신축 아파트에 자주 있음. 가장 깔끔, 천장이 높아 보임. 길이는 천장 ~ 바닥까지.' },
              { t: '🟨 천장 부착',              c: '#A16207', d: '봉·레일을 천장에 직접. 콘크리트는 앵커, 석고보드는 보강 필수. 시각적으로 천장 높이 강조.' },
              { t: '⬜ 벽면 부착 (가장 일반적)', c: 'var(--accent)', d: '창문 위 벽에 봉·브래킷 설치. 창문 상단 +10~15cm 위 부착. 시공이 가장 쉬움.' },
              { t: '🔷 창문틀 안 (인사이드)',   c: '#0891B2', d: '깔끔하고 미니멀. 창문틀 깊이 6cm 이상 필요. 빛이 좌우 가장자리로 새는 단점.' },
              { t: '🔶 창문틀 밖 (아웃사이드)', c: '#EA580C', d: '빛 차단 효과 우수. 작은 창을 크게 보이게 함. 시각적 임팩트 큼.' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${s.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: s.c, fontWeight: 700, marginBottom: 6 }}>{s.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 측정 시 주의사항 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            ⚠️ 측정 시 주의사항
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 1.95,
          }}>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              <li>창문 <strong>3지점(좌·중·우) 측정</strong> 후 가장 작은 값 사용</li>
              <li>줄자는 <strong>수평·수직 정확히</strong> (기울어지면 1~2cm 오차)</li>
              <li>창문 가까이의 <strong>가구·라디에이터 위치 확인</strong></li>
              <li>오래된 집에서 창문 모서리가 <strong>직각이 아닌 경우</strong> 추가 여유 필요</li>
              <li>인사이드 마운트는 <strong>창문틀 깊이 6cm 이상</strong> 확인 필수</li>
            </ul>
          </div>
        </div>

        {/* ── 7. 커튼 vs 블라인드 vs 롤스크린 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🤔 어떤 걸 골라야 할까?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { i: '🪟', t: '커튼',       c: 'var(--accent)', d: '거실·침실, 포근한 느낌, 풍성한 인테리어, 단열·방음 우수' },
              { i: '🎚️', t: '블라인드',  c: '#0891B2',       d: '사무실·미니멀, 큰 창문(버티칼), 빛 양 세밀 조절' },
              { i: '📜', t: '롤스크린',   c: '#A16207',       d: '욕실·주방·작은 창, 단순한 인테리어, 가성비' },
              { i: '🧵', t: '로만쉐이드', c: '#9B59B6',       d: '커튼 분위기 + 블라인드 기능, 침실·소형 창문' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 22, marginBottom: 4 }}>{s.i}</p>
                <p style={{ fontSize: 14, color: s.c, fontWeight: 700, marginBottom: 4 }}>{s.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7-1. 암막 등급 기준 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🌒 '1급 암막', 기준이 뭘까
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            쇼핑몰의 '차광 1급·2급' 표기 — 널리 쓰이는 1~3급 구분은 <strong style={{ color: 'var(--text)' }}>일본 인테리어패브릭협회(NIF)</strong>가 JIS L 1055 A법(차광성 시험)에 따라 정한 업계 기준이 국내에 통용된 것입니다(2026-07 확인 기준).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['등급', '차광률 (NIF 기준)', '용도 매칭 (통용 관행)'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { g: '1급', r: '99.99% 이상',            u: '침실·홈시어터 (NIF 설명: 인물 표정 식별 불가 수준)' },
                  { g: '2급', r: '99.80% 이상 ~ 99.99% 미만', u: '거실 등 은은한 빛이 필요한 곳' },
                  { g: '3급', r: '99.40% 이상 ~ 99.80% 미만', u: '거실·서재 등 부드러운 채광용' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{r.g}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 600 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            2018년 8월부터 NIF는 1급을 다시 A++·A+·A·B·C 5단계로 세분화했습니다. 한국에는 <strong style={{ color: 'var(--text)' }}>KS K 0819 「커튼의 차광성 시험방법」</strong>이 있으며(1989 제정 · 2018 개정 · 2023-07-31 최종 확인 고시, 현행 유효) 확인되는 것은 이 '시험방법' 표준의 실재까지입니다 — 1~3급 구간 수치의 출처로 확인되는 것은 일본 NIF 기준이므로, 등급 숫자를 'KS 등급'으로 단정한 상품 설명은 걸러 읽는 것이 좋습니다.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '8px' }}>
            출처:{' '}
            <a href="https://www.sangetsu.co.jp/style/curtain_choose04.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>산겟츠 커튼 기능 가이드(NIF 구간)</a>
            {' · '}
            <a href="https://www.standard.go.kr/KSCI/standardIntro/getStandardSearchView.do?menuId=503&ksNo=KSK0819&tmprKsNo=KSK0819" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>e나라 표준인증 — KS K 0819</a>
          </p>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
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

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/interior/wallpaper', icon: '🧱', name: '도배 계산기',   desc: '벽지 롤 수·시공 비용' },
              { href: '/tools/interior/paint',     icon: '🎨', name: '페인트 계산기', desc: '벽·천장 페인트 양·구매 조합' },
              { href: '/tools/interior/room-area', icon: '📐', name: '공간 면적 계산기',     desc: '벽·바닥·천장·평수·부피' },
              { href: '/tools/unit/area',          icon: '🏠', name: '평수 변환기',    desc: '아파트 면적 단위 변환' },
              { href: '/tools/unit/converter',     icon: '🔄', name: '단위 변환기',          desc: '길이·면적·무게 등 14종 통합 변환' },
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
