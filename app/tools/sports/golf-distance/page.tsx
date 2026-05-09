import Link from 'next/link'
import GolfDistanceClient from './GolfDistanceClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/sports/golf-distance',
  title: '골프 클럽 비거리 계산기 — 환경 보정·Gap 분석·내 기록',
  description: '드라이버·7번 아이언 입력만으로 전체 클럽 비거리 자동 추정. 기온·바람·고도·경사 환경 보정, Gap 자동 분석, 갭웨지 추천, m/yard 변환, 내 비거리 기록까지.',
  keywords: ['골프비거리계산기', '클럽비거리표', '7번아이언비거리', '골프클럽거리', '드라이버비거리', '웨지비거리', '골프갭분석', '갭웨지', '골프 환경 보정', '바람 비거리', '시니어 골프', '클럽 Gap 분석', '한국 아마추어 골퍼'],
})

export default function GolfDistancePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏌️ 골프 클럽 비거리 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        드라이버·7번 아이언만 입력 → 전체 클럽 비거리 자동 추정 + <strong style={{ color: 'var(--text)' }}>환경 보정(바람·고도·기온) + Gap 자동 분석 + 내 비거리 기록</strong>까지.
      </p>

      <GolfDistanceClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 아마추어 평균 비거리 참조표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            아마추어 평균 클럽별 비거리
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            한국 아마추어 골퍼의 평균 비거리(m). 개인 스윙 스피드와 클럽 스펙에 따라 ±20~30% 편차가 있습니다.
          </p>

          {/* 남성 */}
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#3EC8FF', marginBottom: '8px' }}>👨 남성 아마추어 평균</p>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>클럽</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>평균</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>범위</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['드라이버',     '210m', '170~260m'],
                  ['3번 우드',     '185m', '155~230m'],
                  ['5번 우드',     '170m', '140~210m'],
                  ['5번 아이언',   '160m', '130~195m'],
                  ['6번 아이언',   '150m', '120~185m'],
                  ['7번 아이언',   '140m', '110~175m'],
                  ['8번 아이언',   '130m', '100~160m'],
                  ['9번 아이언',   '120m', '90~150m'],
                  ['PW',           '110m', '80~140m'],
                  ['SW',           '85m',  '60~110m'],
                ].map(([club, avg, range], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text)' }}>{club}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>{avg}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--muted)' }}>{range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 여성 */}
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#FF8C3E', marginBottom: '8px' }}>👩 여성 아마추어 평균</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>클럽</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>평균</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>범위</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['드라이버',     '160m', '130~200m'],
                  ['3번 우드',     '140m', '115~175m'],
                  ['5번 우드',     '130m', '105~165m'],
                  ['5번 아이언',   '120m', '95~150m'],
                  ['6번 아이언',   '112m', '88~140m'],
                  ['7번 아이언',   '105m', '80~135m'],
                  ['8번 아이언',   '96m',  '75~125m'],
                  ['9번 아이언',   '88m',  '68~115m'],
                  ['PW',           '80m',  '60~105m'],
                  ['SW',           '62m',  '45~85m'],
                ].map(([club, avg, range], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text)' }}>{club}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>{avg}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--muted)' }}>{range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. Gap 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            클럽 간 이상적인 거리 간격(Gap) 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '14px' }}>
            {[
              { label: '아이언 사이', range: '10~15m', color: '#3EFF9B', desc: '번호당 한 클럽 차이가 이상적' },
              { label: '우드/유틸 사이', range: '15~25m', color: '#3EC8FF', desc: '로프트 차이가 커서 간격도 큼' },
              { label: '아이언 ↔ 웨지', range: '10~15m', color: '#C8FF3E', desc: '어프로치 거리 정확도 직결' },
              { label: '웨지 사이',     range: '10~18m', color: '#FF8C3E', desc: '4도 차이 = 약 10~12m 변화' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${g.color}30`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>{g.label}</p>
                <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 800, color: g.color, marginBottom: '6px' }}>{g.range}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{g.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              <strong style={{ color: 'var(--text)' }}>너무 좁으면</strong>: 클럽 개수 낭비, 코스 공략 옵션이 겹침<br/>
              <strong style={{ color: 'var(--text)' }}>너무 넓으면</strong>: 특정 거리 대응 어려움<br/>
              <strong style={{ color: '#FF6B6B' }}>가장 자주 발생하는 Gap</strong>: PW(110m) ~ SW(85m) 사이 — 갭웨지(AW)로 채우는 구간
            </p>
          </div>
        </div>

        {/* ── 3. AW 필요성 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎯 갭웨지(AW)가 필요한 이유
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
            {[
              { name: 'PW', distance: '110~115m', loft: '44~48°', color: '#3EC8FF' },
              { name: 'AW', distance: '95~100m',  loft: '50~52°', color: '#C8FF3E' },
              { name: 'SW', distance: '80~90m',   loft: '54~56°', color: '#FF8C3E' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${c.color}40`, borderRadius: '12px', padding: '16px 14px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '24px', fontWeight: 800, color: c.color, marginBottom: '6px' }}>{c.name}</p>
                <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{c.distance}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{c.loft}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(200,255,62,0.06)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              PW와 SW 사이 <strong style={{ color: '#FF6B6B' }}>약 30m 간격</strong>은 어프로치에서 가장 애매한 거리입니다.
              스윙 강도로 거리를 조절하면 정확도가 떨어지므로 <strong style={{ color: 'var(--accent)' }}>AW(52도 웨지)</strong>를 추가해
              풀스윙으로 95~100m를 안정적으로 보낼 수 있게 구성하는 것이 유리합니다.
              많은 투어 프로는 PW · 50도 · 54도 · 58도(또는 60도) 4개 웨지를 사용합니다.
            </p>
          </div>
        </div>

        {/* ── 4. 7I 기준 클럽 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            7번 아이언이 골프 기준 클럽인 이유
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>📐 클럽 세트 중간에 위치</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
                드라이버~샌드 웨지 사이의 정중앙. 길이·로프트·라이각·헤드 무게가 가장 균형 잡힌 클럽입니다.
                롱아이언처럼 길지도, 웨지처럼 짧지도 않아 평균 스윙 특성을 가장 잘 드러냅니다.
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,200,255,0.2)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#3EC8FF', marginBottom: '8px' }}>🎓 레슨·피팅의 기준</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
                대부분의 골프 레슨에서 7번 아이언으로 스윙을 가르치고, 클럽 피팅에서도 7I 비거리·런치 앵글·스핀량을 기준으로 다른 클럽 스펙을 결정합니다.
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,255,155,0.2)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#3EFF9B', marginBottom: '8px' }}>🔢 비거리 추정의 기준</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
                7번 아이언 비거리만 알면 다른 클럽의 평균 비율(DR ≒ 2.3배, PW ≒ 0.76배 등)로 전체 비거리를 추정할 수 있습니다.
                개인별 차이가 있으나 큰 윤곽을 잡기에 충분합니다.
              </p>
            </div>
          </div>
        </div>

        {/* ── 5. 환경 보정 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🌬️ 환경 보정 가이드 — 기온·바람·고도·경사
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구의 [🌬️ 환경 보정] 탭에서 자동 계산. 비거리 변화가 ±10% 이상이면 한 클럽 위/아래 사용 권장.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>환경 요인</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>변화율</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>예시 (7I 145m 기준)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: '🌡️ 기온 +10°C', r: '+2.7%',  e: '+3.9m (여름)', c: '#FF8C3E' },
                  { f: '🌡️ 기온 -15°C', r: '-4.0%',  e: '-5.9m (한겨울)', c: '#3EC8FF' },
                  { f: '🏔️ 고도 +1,000m', r: '+4.5%', e: '+6.5m (강원도 고지대)', c: '#3EFF9B' },
                  { f: '💨 정면 5m/s', r: '-7%',     e: '-10m (강한 역풍)', c: '#FF6B6B' },
                  { f: '💨 등 5m/s',   r: '+5%',     e: '+7.5m (순풍)', c: '#3EFF9B' },
                  { f: '⛰️ 오르막 5°', r: '-2%',     e: '-2.5m (약 오르막)', c: '#FF8C3E' },
                  { f: '⛰️ 내리막 5°', r: '+2.5%',   e: '+3.5m', c: '#3EFF9B' },
                  { f: '🌿 깊은 러프', r: '-15%',    e: '-22m (코스 진입)', c: '#FF6B6B' },
                  { f: '🏖️ 벙커',     r: '-30%',    e: '-44m', c: '#FF6B6B' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.f}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: r.c, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⚠️ 본 추정은 일반 가이드(PGA·Trackman 데이터 기반). 실제 ±10% 차이 가능.
          </p>
        </div>

        {/* ── 6. 한국 시즌별 비거리 변화 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🍂 한국 시즌별 비거리 변화
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            한국 사계절 기온차(약 35°C)는 비거리에 의미 있는 영향을 줍니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
            {[
              { s: '🌸 봄 (15~20°C)',   r: '기준 (100%)', d: '바람 多 — 정확한 클럽 선택' },
              { s: '☀️ 여름 (25~30°C)', r: '+1~2%',      d: '온도·습도 ↑ — 약간 ↑' },
              { s: '🍁 가을 (15~20°C)', r: '기준',        d: '최적기 — 바람 적음' },
              { s: '❄️ 겨울 (-5~5°C)',  r: '-5~7%',      d: '한 클럽 위 권장' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>{r.s}</p>
                <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>{r.r}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{r.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 시니어 골퍼 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            👴 시니어 골퍼 가이드 (60대+)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            한국 시니어 골퍼 인구가 급증 중입니다. 비거리는 점차 감소(10년에 약 5~10%)하나 정확도·일관성이 더 중요합니다. 본 도구의 [성별·연령]에서 [시니어]를 선택하면 평균 기준이 자동 조정됩니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>연령대</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>일반 대비</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>DR 평균</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>7I 평균</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { age: '20~50대 남성',  r: '기준',  dr: '210m', i7: '140m' },
                  { age: '60대+ 남성',    r: '약 -15%', dr: '180m', i7: '120m' },
                  { age: '70대+ 남성',    r: '약 -25%', dr: '160m', i7: '105m' },
                  { age: '20~50대 여성',  r: '—',    dr: '160m', i7: '105m' },
                  { age: '60대+ 여성',    r: '약 -15%', dr: '135m', i7: '90m' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.age}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.dr}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.i7}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            💡 시니어 추천 — 그라파이트 샤프트(가벼움) / 헤드 스피드에 맞는 플렉스(R·SR·S) / 하이브리드 활용 / 우드 비중 ↑ (5W·7W·9W). 정확한 클럽 추천은 골프 피팅 센터.
          </p>
        </div>

        {/* ── 8. 비거리 기록 활용법 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            📅 내 비거리 기록 활용법
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구의 [📅 내 기록] 탭에서 라운딩·연습장 비거리를 누적 기록 (브라우저 로컬, 1년 보관). 시즌별·장소별 변화를 추적해 발전 추이를 확인하세요.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { e: '📊', t: '시즌별 비교', d: '같은 7I·DR 비거리를 봄·여름·가을·겨울로 비교 → 본인의 시즌 보정값 발견' },
              { e: '🎯', t: '연습장 vs 실전', d: '연습장 평균 = 실전 비거리 × 105~110% (보통). 압박감·코스 영향 확인' },
              { e: '📈', t: '발전 추이', d: '최근 30일 vs 이전 평균 자동 비교. 레슨·스윙 변경 효과 측정' },
              { e: '🌬️', t: '환경 메모', d: '기온·바람 함께 기록 → 같은 기온대 비거리 비교' },
              { e: '🔒', t: '프라이버시', d: '모든 기록은 본인 브라우저(localStorage)에만 저장. 서버 X' },
            ].map((it, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{it.e}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{it.t}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{it.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 9. FAQ (accordion) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '드라이버와 7번 아이언 비거리만으로 전체를 추정할 수 있나요?',
                a: '네, 가능합니다. 골프 클럽은 설계상 각 번호마다 일정한 비율로 비거리가 줄어드는 구조입니다. 7번 아이언을 기준으로 각 클럽의 비율 계수를 적용해 전체 비거리를 추정합니다. 단, 개인별 스윙 특성에 따라 실제와 차이가 있을 수 있어 직접 실측한 값을 입력하면 더 정확합니다.',
              },
              {
                q: '클럽 간 적정 거리 간격은 얼마인가요?',
                a: '아이언은 번호당 10~15m, 우드와 유틸리티는 15~25m 간격이 일반적으로 권장됩니다. 간격이 너무 좁으면 클럽이 겹치고, 너무 넓으면 코스에서 대응하기 어려운 거리가 생깁니다. 특히 PW~SW 사이 30m 이상 간격이 생기면 갭웨지를 고려하세요.',
              },
              {
                q: '비거리는 어떻게 측정하는 게 정확한가요?',
                a: '연습장보다는 실제 코스나 야외 연습장에서 측정하는 게 정확합니다. 같은 클럽으로 5~10개를 치고 평균값을 사용하세요. 바람·경사·지면 상태가 없는 평지 조건이 이상적입니다. 최대 비거리가 아닌 안정적으로 낼 수 있는 평균 비거리를 기준으로 하세요.',
              },
              {
                q: '클럽 14개를 전부 사용해야 하나요?',
                a: '규정상 최대 14개까지 사용 가능하지만 반드시 14개일 필요는 없습니다. Gap 분석에서 간격이 겹치는 클럽이 있다면 줄이는 것도 방법입니다. 대신 웨지 구성을 다양하게 가져가는 것(PW · 50° · 54° · 58°)이 실전에서 더 도움이 됩니다.',
              },
              {
                q: '바람·기온·고도가 비거리에 얼마나 영향을 주나요?',
                a: '본 도구의 [🌬️ 환경 보정] 탭에서 자동 계산. 일반 가이드:<br/>• 정면 바람 5m/s → 약 10m ↓<br/>• 한겨울(5°C, 봄 대비 -15°C) → 약 4% ↓<br/>• 해발 800m 고지 → 약 3.5% ↑<br/>• 오르막 5° → 약 2~3m ↓<br/>복합 환경(한겨울 + 정면 강풍 + 오르막) = 비거리 -10~15%, 한 클럽 위 사용 권장.',
              },
              {
                q: '시니어 골퍼는 어떤 클럽을 사용하면 좋나요?',
                a: '일반 가이드(전문 피팅 권장): ① 그라파이트 샤프트 (가벼움) ② 헤드 스피드에 맞는 플렉스 (R·SR·S) ③ 하이브리드 (3I·4I 대신) ④ 우드 비중 ↑ (5W·7W·9W).<br/>60대+ 평균 비거리(한국): DR 약 180~190m, 7I 약 120~125m. 본 도구는 [성별·연령]에서 [시니어 남성] 또는 [시니어 여성] 선택 시 평균 기준이 자동 조정됩니다. 정확한 클럽 추천은 골프 피팅 센터.',
              },
              {
                q: '연습장과 실제 코스 비거리가 다른 이유는?',
                a: '일반적으로 코스 비거리 = 연습장의 90~95%. 이유: ① 풀 스윙 빈도 ↓ (코스는 다양한 스윙) ② 잔디·경사·바람 영향 ③ 압박감(경기 중) ④ 클럽 선택 신중도 ↓ (연습장은 자유). 본인 평균 비거리 측정 시 5~10개 평균 사용(최대값 X), 일관된 5분할 거리 사용. 코스 측정이 더 정확.',
              },
              {
                q: '갭웨지(AW)는 꼭 필요한가요?',
                a: 'PW와 SW 사이 Gap에 따라 다름.<br/>• PW(110m) ~ SW(85m) = 25m → 보통 AW 권장<br/>• PW(105m) ~ SW(75m) = 30m → AW 강력 권장<br/>• PW와 SW 차이 15m 이하 → AW 불필요<br/>AW 로프트: 50° → 95~100m / 52° → 90~95m. 본 도구의 [🔍 클럽 분석] 탭이 자동 추천합니다.',
              },
              {
                q: '7번 아이언만 알면 정말 모든 클럽을 추정할 수 있나요?',
                a: '네, 큰 윤곽은 정확. 7I 145m 가정 시: DR ≒ 약 220m / 5I ≒ 155m / PW ≒ 110m / SW ≒ 80m.<br/>⚠️ 단: 드라이버는 별도(스윙 메커닉스 다름) / 개인별 차이 ±20% 가능 / 직접 측정이 가장 정확. 본 도구는 입력 많을수록 정확 — 드라이버 + 7I 두 개만 입력해도 충분.',
              },
              {
                q: 'm와 yard 차이가 어떻게 되나요?',
                a: '1 yard = 0.9144m (약 91cm), 1m = 1.0936 yard. 한국 골프장은 m 표준, LPGA·PGA 통계는 yard 사용. 본 도구의 상단 [거리 단위] 토글로 즉시 변환 가능. 예: 7I 145m = 약 158 yard / DR 220m = 약 240 yard.',
              },
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

        {/* ── 6. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/golf-handicap', icon: '⛳', name: '골프 핸디캡 계산기',   desc: 'WHS 핸디캡 지수·코스 핸디캡' },
              { href: '/tools/sports/golf-cost',     icon: '⛳', name: '골프 라운딩 비용 계산기', desc: '그린피·캐디피·1인당 비용 정산' },
              { href: '/tools/date/dday',          icon: '📅', name: 'D-day 계산기',           desc: '다음 라운딩까지 D-day' },
              { href: '/tools/life/pomodoro',      icon: '🍅', name: '뽀모도로 타이머',         desc: '연습장 루틴 관리' },
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
