import Link from 'next/link'
import MilitaryClient from './MilitaryClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/date/military',
  title: '군 전역일 계산기 — 복무율·D-day·마일스톤 (2026년 최신)',
  description:
    '입대일과 복무 형태(육군·해군·공군·해병대·사회복무요원·산업기능요원·전문연구요원·대체복무)를 입력해 전역일과 복무율, 100일·50%·말년 시작일 마일스톤을 계산합니다. 2026년 병무청 기준.',
  keywords: ['군전역일계산기', '복무율계산기', '전역일계산', '말년시작일', '입대100일', '육군전역일', '해군전역일', '공군전역일', '사회복무요원전역일', '대체복무요원'],
})

export default function MilitaryPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎖️ 군 전역일·복무율 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        입대일과 복무 형태를 입력하면 <strong style={{ color: 'var(--text)' }}>전역일·복무율·100일·말년 시작일</strong>까지 한 번에 계산합니다.
        2026년 병무청 기준 9가지 복무 형태 + 직접 입력 옵션, 특정 날짜 기준 미리보기, 마일스톤 타임라인 시각화.
      </p>

      <MilitaryClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 면책 ── */}
        <div style={{
          background: 'rgba(255,107,107,0.06)',
          border: '1px solid rgba(255,107,107,0.25)',
          borderRadius: '12px',
          padding: '14px 18px',
          fontSize: '13px',
          color: 'var(--text)',
          lineHeight: 1.8,
        }}>
          <strong style={{ color: '#FF8C8C' }}>⚠️ 안내</strong> — 복무기간은 제도 변경, 복무 형태, 개인별 사유에 따라 달라질 수 있습니다.
          포상휴가·징계·병가·연장복무 등으로 실제 전역일이 달라질 수 있으니 정확한 전역일은
          <strong style={{ color: 'var(--text)' }}> 병무청 또는 소속 부대</strong>에 확인하세요. 참고: 2026년 기준 병무청 병역이행안내.
        </div>

        {/* ── 2. 2026년 복무 기간 표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            2026년 기준 병역 의무 복무 기간
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['복무 형태', '복무 기간', '복무 일수'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '육군 현역',           p: '18개월', d: '약 548일', c: '#3EFF9B' },
                  { t: '해병대 현역',         p: '18개월', d: '약 548일', c: '#3EFF9B' },
                  { t: '상근예비역',          p: '18개월', d: '약 548일', c: '#3EFF9B' },
                  { t: '해군 현역',           p: '20개월', d: '약 610일', c: '#C8FF3E' },
                  { t: '공군 현역',           p: '21개월', d: '약 640일', c: '#FFD700' },
                  { t: '사회복무요원',        p: '21개월', d: '약 640일', c: '#FFD700' },
                  { t: '산업기능요원 (보충역)', p: '23개월', d: '약 700일', c: '#FF8C3E' },
                  { t: '산업기능요원 (현역)',   p: '34개월', d: '약 1,034일', c: '#FF6B6B' },
                  { t: '전문연구요원',        p: '36개월', d: '약 1,095일', c: '#9B59B6' },
                  { t: '대체복무요원',        p: '36개월', d: '약 1,095일', c: '#9B59B6' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: r.c, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ <strong style={{ color: 'var(--text)' }}>의무경찰·의무소방·해양경찰 제도는 2023년 모두 폐지</strong>되어 신규 선발이 종료되었습니다.
          </p>
        </div>

        {/* ── 3. 군 복무 마일스톤 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎯 군 복무 주요 마일스톤 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { i: '🎒', t: '입대 30일',         d: '자대 배치 일반적 (육군 기준)', color: '#3EC8FF' },
              { i: '🥇', t: '입대 100일',        d: '일병 진급 (이병 → 일병)',     color: '#C8FF3E' },
              { i: '⏱️', t: '복무 50% (반환점)', d: '상병 진급 시점 근처',          color: 'var(--accent)' },
              { i: '🎯', t: '복무 75%',          d: '병장 진급 시점',                color: '#3EFF9B' },
              { i: '🔥', t: '전역 D-100',        d: '"말년" 시작',                    color: '#FF8C3E' },
              { i: '👑', t: '전역 D-30',         d: '"왕고" 시기',                    color: '#FF6B6B' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${m.color}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 18, marginBottom: 4 }}>{m.i}</p>
                <p style={{ fontSize: 13, color: m.color, fontWeight: 700, marginBottom: 2 }}>{m.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{m.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 휴가 종류와 영향 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            휴가 종류와 전역일 영향
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EFF9B', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#3EFF9B', fontWeight: 700, marginBottom: 6 }}>📈 포상휴가 (전역 단축)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>우수 표창·전투력 측정 우수 등</li>
                <li>일반적으로 1~7일씩 단축</li>
                <li>실제 전역일이 앞당겨짐</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EC8FF', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#3EC8FF', fontWeight: 700, marginBottom: 6 }}>= 특별휴가 (영향 없음)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>청원휴가·위로휴가</li>
                <li>복무 인정 휴가</li>
                <li>전역일에 영향 없음</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FF8C3E', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#FF8C3E', fontWeight: 700, marginBottom: 6 }}>⚠️ 병가 연장</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>일반적으로 복무 산입</li>
                <li>정도에 따라 연장 가능성</li>
                <li>장기 입원 시 케이스별 판정</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FF6B6B', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#FF6B6B', fontWeight: 700, marginBottom: 6 }}>📉 군기교육대 (영창 폐지)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>7일 이내: 복무 인정</li>
                <li>그 이상: 복무 연장</li>
                <li>2020년 영창 폐지 이후 도입</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 5. 복무 형태별 상세 안내 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            복무 형태별 상세 안내
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                t: '🪖 현역병 (육군·해군·공군·해병대)',
                color: '#3EFF9B',
                items: ['입영 후 5주 신병교육 → 자대 배치', '부대 내 거주, 정기 휴가 분기별', '18~21개월 복무 (군별 다름)'],
              },
              {
                t: '🏠 상근예비역',
                color: '#3EFF9B',
                items: ['출퇴근 형태로 복무 (자기 집에서 출퇴근)', '18개월, 육군 현역과 동일', '거주지 인근 부대 배치'],
              },
              {
                t: '🏢 사회복무요원 (구 공익근무요원)',
                color: '#FFD700',
                items: ['사회복지·행정기관 등에서 복무', '출퇴근 형태', '21개월 복무'],
              },
              {
                t: '🕊️ 대체복무요원',
                color: '#9B59B6',
                items: ['양심적 병역거부자 대상', '교정시설 등에서 합숙 근무', '36개월 복무'],
              },
              {
                t: '🏭 산업기능요원·🔬 전문연구요원',
                color: '#FF8C3E',
                items: ['지정업체에서 연구·생산직 종사', '전문연구요원: 박사학위 소지자 36개월', '산업기능요원: 현역 34개월 / 보충역 23개월'],
              },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.color}`, borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ fontSize: 14, color: s.color, fontWeight: 700, marginBottom: 8 }}>{s.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                  {s.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 직접 계산 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            전역일 직접 계산 공식
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
            <div><span style={{ color: 'var(--muted)' }}>전역일</span> = 입대일 + 복무 개월 − 1일</div>
            <div><span style={{ color: 'var(--muted)' }}>복무율 (%)</span> = (오늘 − 입대일) ÷ (전역일 − 입대일) × 100</div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 12 }}>
            예시: 2026년 1월 15일에 18개월 육군으로 입대 → 전역일은 <strong style={{ color: 'var(--accent)' }}>2027년 7월 14일</strong>.
          </p>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 7. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '전역일은 입대일로부터 정확히 몇 개월 뒤인가요?',
                a: '선택한 복무 기간을 기준으로 입대일에 해당 개월을 더한 후 1일을 뺀 날짜입니다. 예를 들어 2026년 1월 15일에 18개월 육군으로 입대하면 전역일은 <strong>2027년 7월 14일</strong>입니다. 다만 실제 전역일은 포상휴가·징계·병가 등에 따라 달라질 수 있으므로 정확한 전역일은 소속 부대 또는 병무청에 확인하세요.',
              },
              {
                q: '사회복무요원도 계산할 수 있나요?',
                a: '네. 사회복무요원 복무 기간 <strong>21개월</strong> 기준으로 계산할 수 있습니다. 병무청은 사회복무요원의 복무 기간을 21개월로 안내하고 있으며, 본 계산기에서 동일 기준으로 적용합니다.',
              },
              {
                q: '복무 기간 표는 어떤 기준인가요?',
                a: '<strong>2026년 병무청 병역이행안내 기준</strong>입니다. 현역병은 육군·해병대 18개월, 해군 20개월, 공군 21개월, 상근예비역 18개월, 사회복무요원 21개월, 산업기능요원 현역 34개월·보충역 23개월, 전문연구요원과 대체복무요원은 각 36개월입니다.',
              },
              {
                q: '의무경찰·의무소방은 왜 선택지에 없나요?',
                a: '의무경찰·의무소방·해양경찰 제도는 <strong>2023년 모두 폐지</strong>되어 현재 신규 선발이 이루어지지 않습니다. 해당 제도로 복무 중이거나 복무한 분들은 <strong>"직접 입력" 옵션</strong>으로 복무 기간을 입력해 사용하실 수 있습니다.',
              },
              {
                q: '포상휴가나 특별휴가는 전역일에 영향을 주나요?',
                a: '<strong>포상휴가</strong>는 일반적으로 복무 기간에 산입되어 전역일이 앞당겨집니다. <strong>특별휴가(청원·위로)</strong>는 복무 인정 휴가이므로 전역일에 영향이 없습니다. 반대로 <strong>군기교육대 입소(7일 초과)</strong>나 병가 일부는 복무 기간 연장 사유가 될 수 있습니다. 개인별 휴가 사용 내역은 부대 인사담당자에게 확인하세요.',
              },
              {
                q: '특정 날짜 기준으로도 복무율을 계산할 수 있나요?',
                a: '네. 본 계산기는 <strong>"특정 날짜 기준"</strong> 옵션을 제공합니다. 다음 휴가 복귀일, 새해, 생일 등 임의의 날짜를 기준으로 한 복무율과 D-day를 계산할 수 있어 일정 계획에 유용합니다.',
              },
            ].map((f, i) => (
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

        {/* ── 8. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/date/dday',      icon: '📅', name: 'D-day 계산기·일정 관리', desc: '두 날짜 사이·페이스 통합' },
              { href: '/tools/date/age',       icon: '🎂', name: '만 나이 계산기',    desc: '법 개정 기준 만 나이' },
              { href: '/tools/date/jet-lag',   icon: '✈️', name: '시차 적응 계산기',  desc: '여행 시차 적응 일정' },
              { href: '/tools/date/life-time', icon: '⏳', name: '생애 시간 계산기',  desc: '기대수명 기준 시간 환산' },
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
