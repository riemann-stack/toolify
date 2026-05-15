import Link from 'next/link'
import LaundryDryClient from './LaundryDryClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/life/laundry-dry',
  title: '빨래 건조 시간 계산기 — 최단 조합 추천·전기료 비교·욕실 건조',
  description: '온도·습도·소재별 건조 시간 + 사용자 보유 장비(선풍기·제습기·서큘·욕실 환풍기)별 최단 조합 추천. 목표 시간 역산, 한국 전기료 비교, 장마·겨울 가이드까지.',
  keywords: ['빨래건조시간계산기', '빨래건조시간', '세탁건조시간', '실내빨래건조', '청바지건조시간', '빨래빨리말리는법', '빨래건조팁', '장마철 빨래', '욕실 빨래 건조', '제습기 효과', '서큘레이터 빨래', '빨래 전기료', '한국 가정 빨래'],
})

export default function LaundryDryPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧺 빨래 건조 시간 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        온도·습도·소재 + <strong style={{ color: 'var(--text)' }}>보유 장비별 최단 건조 조합 추천</strong> + 목표 시간 역산 + 한국 장비 전기료 비교까지 한 화면에.
      </p>

      <LaundryDryClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 4요소 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            건조에 영향을 주는 4가지 핵심 요소
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { n: '①', title: '습도',   desc: '가장 큰 영향 요인. 습도 90% vs 40%는 건조 시간 <strong>약 3배 차이</strong>가 납니다. 공기 중 수증기가 많으면 옷의 수분이 증발할 공간이 없습니다.', color: 'var(--accent)' },
              { n: '②', title: '온도',   desc: '온도가 <strong>10°C 올라갈 때마다</strong> 증발 속도가 약 <strong>20% 향상</strong>됩니다. 다만 습도가 낮을 때만 효과가 크며, 고습도에선 온도 효과가 제한적입니다.', color: '#FF8C3E' },
              { n: '③', title: '바람',   desc: '바람은 옷 표면의 포화층을 쓸어내 건조를 가속합니다. 강풍 시 무풍 대비 건조 시간이 <strong>절반 이하</strong>로 줄어듭니다.', color: '#3EC8FF' },
              { n: '④', title: '소재',   desc: '울·데님은 섬유가 두껍고 흡수율이 높아 오래 걸립니다. 합성섬유는 친수성이 낮아 면보다 30% 빠르게 건조됩니다.', color: '#3EFF9B' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: item.color, fontWeight: 700, marginBottom: '6px' }}>{item.n} {item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }} dangerouslySetInnerHTML={{ __html: item.desc.replace(/<strong>/g, '<strong style="color: var(--text)">') }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 소재별·의류별 평균 건조 시간표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            소재별·의류별 평균 건조 시간
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            기준 조건: 실외, 온도 20°C, 습도 60%, 바람 약함, 직사광
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['의류', '소재', '겉마름', '완전건조'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i < 2 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { item: '티셔츠',   mat: '면',        surf: '1~1.5시간',  full: '2~3시간' },
                  { item: '티셔츠',   mat: '합성섬유',   surf: '0.5~1시간',  full: '1~1.5시간' },
                  { item: '청바지',   mat: '데님',       surf: '3~4시간',    full: '5~7시간' },
                  { item: '수건',     mat: '면',        surf: '1.5~2시간',  full: '3~4시간' },
                  { item: '후드티',   mat: '면 혼방',    surf: '2.5~3시간',  full: '4~6시간' },
                  { item: '이불커버', mat: '면',        surf: '3~4시간',    full: '6~8시간' },
                  { item: '양말',     mat: '합성혼방',   surf: '30분',       full: '1~1.5시간' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{row.item}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row.mat}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#3EC8FF', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row.surf}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row.full}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 환경별 건조 속도 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            환경별 건조 속도 비교
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            동일 조건 기준: 면 티셔츠, 탈수 보통, 간격 보통
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['환경', '여름 (28°C, 70%)', '봄·가을 (18°C, 55%)', '겨울 (5°C, 60%)'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { env: '실외 직사광',   summer: '1.5~2시간',   spring: '2.5~3시간',   winter: '4~6시간' },
                  { env: '베란다 간접광', summer: '2~3시간',     spring: '3~4시간',     winter: '6~8시간' },
                  { env: '실내 환기',     summer: '3~4시간',     spring: '4~6시간',     winter: '8~12시간' },
                  { env: '실내 밀폐',     summer: '5~7시간',     spring: '8~12시간',    winter: '12시간 이상' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{row.env}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#FF8C3E', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row.summer}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row.spring}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#3EC8FF', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row.winter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 4. 장마·겨울 실내 팁 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            장마철·겨울 실내 건조 팁
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,200,255,0.3)', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: '#3EC8FF', fontWeight: 700, marginBottom: '10px' }}>🌧️ 장마철 (습도 80~90%)</p>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <li>제습기 필수 (없으면 에어컨 제습 모드)</li>
                <li>선풍기로 바람 직접 쐬기</li>
                <li>화장실 환풍기 틀고 욕실 건조 추천</li>
                <li>건조 시간 최소 <strong style={{ color: 'var(--text)' }}>1.5~2배</strong> 예상</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,140,62,0.3)', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: '#FF8C3E', fontWeight: 700, marginBottom: '10px' }}>❄️ 겨울 실내 건조</p>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <li>난방 건조한 공기 활용 가능하지만 정전기 주의</li>
                <li>가습기 사용 중이면 건조 효과 상쇄</li>
                <li>라디에이터·히터 <strong style={{ color: 'var(--text)' }}>근처</strong>에 두면 빨리 마름</li>
                <li>⚠️ 히터에 직접 접촉은 화재 위험</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 5. 빨리 말리는 법 TOP 7 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            빨래 빨리 말리는 법 TOP 7
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { n: '1', icon: '💨', title: '선풍기·서큘레이터 직접 바람 쐬기', save: '30~40% 단축' },
              { n: '2', icon: '↔️', title: '빨래 간격 손 하나 이상 벌려 널기',   save: '25% 단축' },
              { n: '3', icon: '🌀', title: '탈수 한 번 더 강하게 돌리기',        save: '15~20% 단축' },
              { n: '4', icon: '🧻', title: '수건으로 남은 물기 눌러서 제거',     save: '10% 단축' },
              { n: '5', icon: '🔄', title: '청바지·후드는 뒤집어서 건조',        save: '균일 건조' },
              { n: '6', icon: '🔀', title: '두꺼운 것은 자주 위치 바꾸기',       save: '얼룩 방지' },
              { n: '7', icon: '☀️', title: '오전 10시~오후 2시 습도 낮은 시간대', save: '자연 건조 최적' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '12px 16px',
              }}>
                <span style={{
                  fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800, fontSize: '16px',
                  color: 'var(--accent)', minWidth: 24,
                }}>{item.n}</span>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{item.title}</span>
                <span style={{ fontSize: '12px', color: '#3EFF9B', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, whiteSpace: 'nowrap' }}>{item.save}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 한국 장비별 효과 비교 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            한국 가정 장비별 효과 & 전력 비교
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구의 [최단 조합 추천] 탭에서 보유 장비를 체크하면 모든 조합(2<sup>N</sup>개)을 평가해 가장 효율적인 조합을 자동 추천합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>장비</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>효과</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>전력</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>5시간 전기료</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '💨 선풍기',          eff: '시간 -30%',      w: '50W',    cost: '약 50원' },
                  { n: '🌀 서큘레이터',      eff: '시간 -40% (강력)', w: '30W',    cost: '약 30원' },
                  { n: '🚿 욕실 환풍기 ★',   eff: '시간 -25%',      w: '30W',    cost: '약 30원' },
                  { n: '💧 제습기',          eff: '습도 -15%p',     w: '200W',   cost: '약 200원' },
                  { n: '❄️ 에어컨 제습',     eff: '습도 -20%p · 온도 -3°C', w: '800W', cost: '약 800원' },
                  { n: '🔥 난방·라디에이터', eff: '온도 +5°C',      w: '1,500W', cost: '약 1,500원' },
                  { n: '📐 건조대 2개',      eff: '시간 -15%',      w: '0W',     cost: '0원 (★)' },
                  { n: '🌪️ 추가 탈수 1회',  eff: '시간 -18%',      w: '100W',   cost: '약 3원 (10분)' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.eff}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{r.w}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>{r.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 한국 평균 200원/kWh 기준. 같은 카테고리(예: 선풍기 + 서큘레이터) 동시 사용 시 효과가 큰 쪽만 적용됩니다.
          </p>
        </div>

        {/* ── 7. 한국 전기료 누진제 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            한국 전기료 누진제 영향
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구는 한국 평균 약 <strong style={{ color: 'var(--text)' }}>200원/kWh</strong>(2단계) 기준으로 전기료를 추정합니다. 실제 요금은 누진제 단계에 따라 큰 차이가 납니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>구간 (월)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>kWh당 요금</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>예시 가정</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { s: '1단계 (200kWh 이하)',     p: '약 90원',   e: '1~2인 가정·절약 가구' },
                  { s: '2단계 (201~400kWh)',     p: '약 190원',  e: '평균 가정 (본 도구 기준)' },
                  { s: '3단계 (400kWh 초과)',    p: '약 290원',  e: '여름·겨울 에어컨/난방 가정' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            ⚠️ 여름·겨울 누진제 ↑ 시기에는 빨래 비용도 ↑. 정확한 요금은 한국전력 고객센터(123) 또는 한전 모바일 앱에서 확인.
          </p>
        </div>

        {/* ── 8. 욕실 건조 가이드 (NEW, 한국 핵심) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🚿 욕실 빨래 건조 가이드 (한국 가정 인기 방법)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            한국 가정에서 흔한 욕실 건조법. 작은 공간 + 환풍기 효율로 시간 25% 단축 효과. 단, 곰팡이 주의가 필수입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,255,155,0.3)', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: '#3EFF9B', fontWeight: 700, marginBottom: '10px' }}>✅ 장점</p>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <li>작은 공간 + 환풍기 효율 ↑ (-25%)</li>
                <li>거실·방 공간 절약</li>
                <li>장마철 실내 체류 시 추천</li>
                <li>환풍기 30W로 매우 저렴 (5시간 약 30원)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,140,62,0.3)', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: '#FF8C3E', fontWeight: 700, marginBottom: '10px' }}>⚠️ 주의</p>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <li>욕실 곰팡이 발생 위험 ↑</li>
                <li>사용 후 24시간+ 환풍기 가동 (환기)</li>
                <li>1~2명분만 (이불·다수 X)</li>
                <li>대안: 발코니/베란다 우선, 코인세탁 건조기</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 9. FAQ (accordion) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { q: '겉마름과 완전 건조의 차이는 무엇인가요?',
                a: '겉마름은 표면이 건조한 상태이지만 내부 섬유에 수분이 남아있는 상태입니다. 겉마름 상태로 접어 보관하면 냄새가 날 수 있습니다. 완전 건조는 섬유 내부까지 수분이 없는 상태로, 특히 두꺼운 수건·청바지·후드티는 겉은 말라도 안쪽은 축축한 경우가 많아 완전 건조 시간이 중요합니다.' },
              { q: '실내 건조 시 빨래 냄새를 없애려면?',
                a: '실내 건조 냄새의 주범은 모라넬라 균입니다. 예방법은 ① 세탁 후 즉시 건조 시작(30분 이상 방치 금지), ② 건조 시간 최대한 단축(선풍기·제습기 활용), ③ 세탁 시 구연산·베이킹소다 추가, ④ 통풍이 잘 되는 곳에서 건조하는 것입니다.' },
              { q: '탈수를 강하게 하면 옷이 상하나요?',
                a: '면·합성섬유는 강한 탈수에 비교적 강하지만, 울·실크·린넨은 형태가 변형될 수 있습니다. 울은 손 세탁 후 수건으로 물기를 눌러 제거하는 것이 가장 안전합니다. 속옷이나 얇은 소재는 보통~약한 탈수를 권장합니다.' },
              { q: '이불커버는 얼마나 걸리나요?',
                a: '이불커버는 면 소재 기준 실외 맑은 날 6~8시간, 실내에서는 12시간 이상 걸릴 수 있습니다. 건조 중 1~2회 위치를 바꿔주면 접힌 부분도 균일하게 마릅니다. 이불 본체는 훨씬 오래 걸려 가능하면 코인세탁방 건조기 사용을 추천합니다.' },
              { q: '빨래건조지수란 무엇인가요?',
                a: '기상청에서 제공하는 생활기상지수로, 온도·습도·풍속·일사량을 종합해 빨래 건조에 얼마나 적합한지 5단계(매우 나쁨~매우 좋음)로 나타냅니다. 본 계산기는 이와 유사한 방식으로 각 조건을 종합해 예상 건조 시간을 계산합니다.' },
              { q: '보유 장비별 가장 빠른 건조 조합은?',
                a: '본 도구의 [⚡ 최단 조합 추천] 탭 활용. 일반적 추천 (장마철):<br/>• <strong>1순위:</strong> 제습기 + 서큘레이터 + 추가 탈수 (-50%)<br/>• 2순위: 제습기 + 선풍기 (-45%)<br/>• 3순위: 에어컨 제습 + 선풍기 (-50%, 전기료 ↑)<br/>• 가장 저렴: 서큘레이터만 (-40%, 거의 무료)<br/>봄·가을은 서큘레이터 + 추가 탈수만으로 충분, 겨울은 난방 + 선풍기 권장.' },
              { q: '빨래 건조에 전기료 얼마나 드나요?',
                a: '한국 평균 5시간 사용 기준 (2026, 2단계 200원/kWh):<br/>• 선풍기: <strong>약 50원</strong><br/>• 서큘레이터: 약 30원 (★ 가장 효율적)<br/>• 제습기: 약 200원 (장마철 필수)<br/>• 에어컨 제습: 약 800원 (전기료 ↑)<br/>• 난방·라디에이터: 약 1,500원<br/>가장 저렴한 옵션은 서큘레이터만 사용. 누진제 3단계(400kWh+)면 표시 금액 ×약 1.5배.' },
              { q: '욕실에서 빨래 건조해도 되나요?',
                a: '한국 가정 인기 방법, 단 주의 필요:<br/><strong>장점</strong> — 작은 공간 + 환풍기 효율 ↑ (-25%), 거실 공간 절약<br/><strong>주의</strong> — 욕실 곰팡이 ↑ 가능성 / 사용 후 24시간+ 환풍기 가동 / 1~2명분만 (이불·다수 X) / 대안으로 발코니·베란다 우선 권장.' },
              { q: '오늘 저녁 6시까지 빨래 마르나요?',
                a: '본 도구의 [🎯 목표 시간 역산] 탭 활용. 목표 시각·보유 장비를 입력하면 ① 가장 빠른 ② 균형 ③ 최저 비용 ④ 자연 건조 4가지 시나리오를 자동 비교합니다. 일반 가이드 (티셔츠 기준): 2시간 → 실외 + 직사광 + 서큘 / 4시간 → 베란다 + 제습기 / 6시간 → 실내 + 자연 건조 + 선풍기 / 12시간 → 장마철 자연 건조(무리).' },
              { q: '빨래 곰팡이·세균 냄새 어떻게 예방하나요?',
                a: '모라넬라 균이 주범. 예방법:<br/>1. <strong>세탁 후 30분 이내 건조 시작</strong><br/>2. 건조 시간 6시간 이내 목표<br/>3. 세탁 시 구연산·베이킹소다 (반 컵)<br/>4. 통풍·바람 (선풍기 필수)<br/>5. 빨래 간격 손바닥 1개 이상<br/>6. 60°C 이상 삶기 (수건·속옷, 주 1회)<br/>7. 세탁기 통세척 (월 1회)<br/>장마철은 제습기 필수 + 욕실 환풍기 활용 + 60°C 삶기 빈도 ↑. ⚠️ 곰팡이 냄새 심하면 의류 폐기 권장(포자 ↑).' },
            ].map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {faq.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: faq.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* ── 7. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/pomodoro',    icon: '🍅', name: '뽀모도로 타이머',  desc: '건조 시간 동안 집중 작업' },
              { href: '/tools/date/dday',        icon: '📅', name: 'D-Day 계산기', desc: '두 날짜 사이·시간 단위 기간' },
              { href: '/tools/unit/temperature', icon: '🌡️', name: '온도 변환기',       desc: '°C ↔ °F ↔ K 즉시 변환' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
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
    </div>
  )
}
