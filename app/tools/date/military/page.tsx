import Link from 'next/link'
import MilitaryClient from './MilitaryClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/date/military',
  title: '군대 전역일 계산기 — 복무율·D-day·마일스톤 (2026년 최신)',
  description:
    '입대일 기준 전역일과 복무율을 시각화하는 군대 D-day 도구.',
  keywords: ['군대전역일계산기', '군전역일계산기', '복무율계산기', '전역일계산', '말년시작일', '입대100일', '육군전역일', '해군전역일', '공군전역일', '사회복무요원전역일', '대체복무요원'],
})

const FAQ_LD = [
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
              {
                q: '입대 100일이 왜 의미 있는 날인가요?',
                a: '<strong>이병 → 일병 진급</strong> 시점이기 때문입니다. 병역법 시행령상 이병은 입대 후 2개월 만에 일병으로 자동 진급하지만, 100일을 신병교육·자대 적응을 마치고 군 생활이 어느 정도 익숙해지는 첫 분기점으로 보는 문화가 있습니다. 가족이 100일 기념 면회·선물·휴가를 챙기는 풍습이 정착되어 있습니다.',
              },
              {
                q: '"말년", "왕고"는 정확히 언제부터인가요?',
                a: '관행적 정의 — <strong>말년 = 전역 D-100 이내</strong> (마지막 100일), <strong>왕고 = 전역 D-30 이내</strong> (마지막 한 달). 18개월 복무 기준 약 14~15개월 차에 말년에 진입합니다. 본 계산기의 「말년 시작 D-100」 카드와 진행바의 D-100 마커에서 시점을 자동 확인할 수 있습니다.',
              },
              {
                q: '본 계산기의 결과를 진단서·확인서로 사용할 수 있나요?',
                a: '아닙니다. 본 도구는 <strong>일반 공식에 기반한 추정 계산</strong>이므로 공식 증빙으로 사용할 수 없습니다. 정확한 전역일·복무 일수가 필요한 경우(전역증·복무 기간 확인서 등) <strong>병무청 민원24</strong>(mma.go.kr) 또는 소속 부대 인사처에서 공식 발급 받으시기 바랍니다.',
              },
            ]

export default function MilitaryPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎖️ 군대 전역일 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        입대일 기준 <strong style={{ color: 'var(--text)' }}>전역일과 복무율</strong>을 시각화.
      </p>

      <MilitaryClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 면책 ── */}
        <div style={{
          background: 'rgba(220,38,38,0.06)',
          border: '1px solid rgba(220,38,38,0.25)',
          borderRadius: '12px',
          padding: '14px 18px',
          fontSize: '13px',
          color: 'var(--text)',
          lineHeight: 1.8,
        }}>
          <strong style={{ color: '#DC2626' }}>⚠️ 안내</strong> — 복무기간은 제도 변경, 복무 형태, 개인별 사유에 따라 달라질 수 있습니다.
          포상휴가·징계·병가·연장복무 등으로 실제 전역일이 달라질 수 있으니 정확한 전역일은
          <strong style={{ color: 'var(--text)' }}> 병무청 또는 소속 부대</strong>에 확인하세요. 참고: 2026년 기준 병무청 병역이행안내.
        </div>

        {/* ── 2. 복무 기간·형태 통합표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            2026년 기준 병역 복무 형태 한눈에 보기
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            병무청 병역이행안내 기준 9가지 복무 형태입니다. <strong style={{ color: 'var(--text)' }}>2018년 단축 정책</strong> 이후 육·해·공·해병대 현역 기간이 모두 줄어 현재 수준이 되었습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['복무 형태', '기간', '일수', '특징'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i < 2 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '육군·해병대 현역', p: '18개월', d: '약 548일', c: '#059669', note: '신병교육 5주 → 자대 배치' },
                  { t: '상근예비역',       p: '18개월', d: '약 548일', c: '#059669', note: '거주지 인근 부대 출퇴근' },
                  { t: '해군 현역',         p: '20개월', d: '약 610일', c: '#0EA5E9', note: '함정·해상 작전' },
                  { t: '공군 현역',         p: '21개월', d: '약 640일', c: '#A16207', note: '기지·방공 작전' },
                  { t: '사회복무요원',      p: '21개월', d: '약 640일', c: '#A16207', note: '복지·행정기관 출퇴근' },
                  { t: '산업기능요원(보충역)', p: '23개월', d: '약 700일', c: '#EA580C', note: '지정업체 생산직' },
                  { t: '산업기능요원(현역)',   p: '34개월', d: '약 1,034일', c: '#DC2626', note: '지정업체 생산직' },
                  { t: '전문연구요원',      p: '36개월', d: '약 1,095일', c: '#9B59B6', note: '박사학위·연구소' },
                  { t: '대체복무요원',      p: '36개월', d: '약 1,095일', c: '#9B59B6', note: '교정시설 합숙' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: r.c, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ <strong style={{ color: 'var(--text)' }}>의무경찰·의무소방·해양경찰</strong> 제도는 2023년 모두 폐지되어 신규 선발이 종료되었습니다. 이전 복무자는 본 계산기의 <strong style={{ color: 'var(--text)' }}>「직접 입력」</strong>으로 복무 기간을 지정해 사용하세요.
          </p>
        </div>

        {/* ── 3. 군 복무 마일스톤 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎯 군 복무 주요 마일스톤 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { i: '🎒', t: '입대 30일',         d: '자대 배치 일반적 (육군 기준)', color: '#0891B2' },
              { i: '🥇', t: '입대 100일',        d: '일병 진급 (이병 → 일병)',     color: '#0EA5E9' },
              { i: '⏱️', t: '복무 50% (반환점)', d: '상병 진급 시점 근처',          color: 'var(--accent)' },
              { i: '🎯', t: '복무 75%',          d: '병장 진급 시점',                color: '#059669' },
              { i: '🔥', t: '전역 D-100',        d: '"말년" 시작',                    color: '#EA580C' },
              { i: '👑', t: '전역 D-30',         d: '"왕고" 시기',                    color: '#DC2626' },
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            휴가 종류와 전역일 영향
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #059669', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#059669', fontWeight: 700, marginBottom: 6 }}>📈 포상휴가 (전역 단축)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>우수 표창·전투력 측정 우수 등</li>
                <li>일반적으로 1~7일씩 단축</li>
                <li>실제 전역일이 앞당겨짐</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #0891B2', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#0891B2', fontWeight: 700, marginBottom: 6 }}>= 특별휴가 (영향 없음)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>청원휴가·위로휴가</li>
                <li>복무 인정 휴가</li>
                <li>전역일에 영향 없음</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #EA580C', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#EA580C', fontWeight: 700, marginBottom: 6 }}>⚠️ 병가 연장</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>일반적으로 복무 산입</li>
                <li>정도에 따라 연장 가능성</li>
                <li>장기 입원 시 케이스별 판정</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #DC2626', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 700, marginBottom: 6 }}>📉 군기교육대 (영창 폐지)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>7일 이내: 복무 인정</li>
                <li>그 이상: 복무 연장</li>
                <li>2020년 영창 폐지 이후 도입</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 5. 계급 진급 시점 (육군 18개월 기준) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎖️ 현역병 계급 진급 시점 (육군 18개월 기준)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            병역법 시행령 제25조 진급 최저복무기간에 따라 자동 진급됩니다. 해·공군은 일부 시점이 1~2개월씩 늦어집니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['계급', '진급 시점', '복무 누적', '비고'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { r: '이병',   t: '입대 직후',          d: '0~2개월',   c: '#0891B2',     note: '신병교육·자대 적응' },
                  { r: '일병',   t: '입대 후 2개월',      d: '2~8개월',   c: '#0EA5E9',     note: '입대 100일 ≈ 일병 진급 무렵' },
                  { r: '상병',   t: '일병 후 6개월',      d: '8~14개월',  c: 'var(--accent)', note: '복무 절반(반환점) 근처' },
                  { r: '병장',   t: '상병 후 6개월',      d: '14~18개월', c: '#EA580C',     note: '말년 D-100 시작과 비슷한 시기' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: r.c, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: '12px' }}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 부대 사정·징계 등으로 진급이 지연될 수 있습니다. 정확한 진급일은 인사담당자에게 확인하세요.
          </p>
        </div>

        {/* ── 5-1. 한국 군 복무 기간 단축 역사 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            📜 한국 군 복무 기간 단축 역사
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            육군 기준 복무 기간은 1953년 36개월에서 시작해 점진적으로 단축되어 현재 <strong style={{ color: 'var(--text)' }}>18개월</strong>까지 줄었습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['시점', '육군', '해군', '공군', '비고'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['~1959', '36개월', '36개월', '36개월', '6·25 직후'],
                  ['1968',  '30개월', '36개월', '36개월', '1·21 사태 후 강화'],
                  ['1993',  '26개월', '30개월', '30개월', '문민정부'],
                  ['2003',  '24개월', '26개월', '28개월', '국방개혁 시작'],
                  ['2011',  '21개월', '23개월', '24개월', '단계적 단축'],
                  ['2020',  '18개월', '20개월', '21개월', '국방개혁 2.0 완료 (현재)'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r[1]}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--muted)' }}>{r[2]}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--muted)' }}>{r[3]}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--muted)', fontSize: 12 }}>{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 6. 직접 계산 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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

        {/* ── 8. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/dday',      icon: '📅', name: 'D-Day 계산기', desc: '두 날짜 사이·페이스 통합' },
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
