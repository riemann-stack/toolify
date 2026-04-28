import DdayClient from './DdayClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/date/dday',
  title: 'D-day 계산기·일정 관리 — 카운트다운, 진행률, 영업일, 페이스 계산',
  description:
    '여러 D-day를 저장·관리하고 남은 일수, 평일·영업일, 진행률, 일일 페이스까지 계산합니다. 시험·여행·결혼·마라톤·금연 D+까지 한 번에. 한국 공휴일 자동 반영(2026~2030).',
  keywords: [
    'D-day 계산기', '디데이 계산기', '날짜 카운트다운', '평일 계산', '영업일 계산',
    '두 날짜 사이', 'D+ 계산', '시험 D-day', '여행 카운트다운', '진행률 계산',
    '날짜 차이 계산기', '디데이 관리', '한국 공휴일', '페이스 계산', '반복 D-day',
    '수능 디데이', '결혼 디데이',
  ],
})

export default function DdayPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📅 D-day 계산기·일정 관리
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        목표 날짜 카운트다운, 진행률, 평일·영업일, 페이스 계산, 반복 D-day까지 한 번에. 여러 D-day를 브라우저에 저장해 관리하고 한국 공휴일을 자동 반영합니다.
      </p>

      <DdayClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. D-day vs D+ */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>D-day와 D+의 차이</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>D-day</strong>는 목표 날짜까지 남은 일수, <strong style={{ color: 'var(--text)' }}>D+</strong>는 지난 날짜로부터 경과한 일수입니다. 본 도구는 둘 다 자동 표시합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'D-30',  desc: '시험까지 30일 남음 (미래 카운트다운)' },
              { label: 'D-day', desc: '오늘이 목표 날짜 (D-0과 동일)' },
              { label: 'D+1',   desc: '어제가 목표 날짜였음' },
              { label: 'D+100', desc: '입사 100일째, 결혼 100일 등 경과 기록' },
            ].map((it, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', color: 'var(--accent)', fontWeight: 800 }}>{it.label}</p>
                <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '4px', lineHeight: 1.6 }}>{it.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 평일 vs 영업일 vs 달력일 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>평일·영업일·달력일 차이</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['구분', '월~금', '주말', '한국 공휴일', '활용'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['달력일', '포함', '포함', '포함', '여행·기념일·체류 일수'],
                  ['평일',   '포함', '제외', '포함', '시험 준비·학습'],
                  ['영업일', '포함', '제외', '제외', '계약·법적 기한·배송'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row[3]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 한국 공휴일 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>한국 공휴일 (2026~2030 자동 반영)</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            본 도구는 영업일 계산 시 <strong style={{ color: 'var(--text)' }}>한국 법정 공휴일</strong>을 자동 반영합니다 — 신정·설날(3일)·삼일절·어린이날·부처님오신날·현충일·광복절·추석(3일)·개천절·한글날·성탄절 + 대체 공휴일.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.30)', borderRadius: 10, padding: '12px 14px' }}>
            ⚠️ <strong style={{ color: '#FF6B6B' }}>임시 공휴일</strong>(정부 발표)·근로자의 날(5/1)·회사별 공휴일은 자동 반영되지 않습니다. 정부 발표 시 별도 확인이 필요합니다.
          </p>
        </section>

        {/* 4. 진행률 계산 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>진행률 계산</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text)' }}>시작일 + 목표일 + 오늘</strong>로 진행률(%)을 계산합니다:
          </p>
          <pre style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, color: 'var(--text)' }}>
{`진행률 = (오늘 - 시작일) / (목표일 - 시작일) × 100`}
          </pre>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}>
            활용 예: 프로젝트 진행 상황 · 학습 목표 달성률 · 다이어트·금연 등 장기 목표 · 임신 주수 · 군 복무 진행률.
          </p>
        </section>

        {/* 5. 페이스 계산 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>페이스 계산 — 목표 달성 도구</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>목표 + 총량 + 현재 완료량</strong>으로 일일 페이스를 자동 산출합니다.
          </p>
          <pre style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text)', lineHeight: 1.8 }}>
{`일일 목표  = 남은 분량 / 남은 일수
현재 페이스 = 완료량 / 경과 일수
예상 완료량 = 현재 페이스 × 남은 일수
부족분     = 목표 − 예상 완료량`}
          </pre>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
            {[
              { case: '시험 교재', detail: '600페이지 / 30일 → 일일 20페이지' },
              { case: '외국어 단어', detail: '1,000개 / 100일 → 일일 10개' },
              { case: '저축 목표', detail: '1,000만원 / 12개월 → 월 83만원' },
              { case: '마라톤 훈련', detail: '50km / 12주 → 주간 4.2km' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>{c.case}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. 반복 D-day */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>반복 D-day</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            매년·매월·매주 반복되는 D-day는 자동으로 다음 발생일을 갱신합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {[
              { label: '매년', items: ['생일', '결혼기념일', '창립일', '회사 입사일'] },
              { label: '매월', items: ['월급일', '카드 결제일', '구독 갱신', '월간 보고서'] },
              { label: '매주', items: ['정기 회의', '운동 약속', '주간 보고서', '가족 식사'] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{g.label}</p>
                <ul style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                  {g.items.map(it => <li key={it}>· {it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 7. D+ 활용 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>D+ 활용 — 지난 날짜 기록</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            의미 있는 시작 시점을 기록하면 매일 D+가 늘어나며 동기 부여가 됩니다. 유튜버·블로거가 자주 활용하는 패턴입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              '입사·창업 D+',
              '금연·금주 D+',
              '운동·다이어트 시작 D+',
              '연애·결혼 D+',
              '블로그·유튜브 시작 D+',
              '새 도시 이사 D+',
            ].map((d, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: 'var(--text)' }}>
                {d}
              </div>
            ))}
          </div>
        </section>

        {/* 8. FAQ */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: 'D-day 데이터는 어디에 저장되나요?',
                a: '사용자 브라우저의 <strong>localStorage</strong>에 저장됩니다. 회원가입·로그인 불필요, 빠른 접근, 사생활 보호(서버 저장 X). 다만 같은 브라우저·기기에서만 접근 가능하며 캐시 삭제·시크릿 모드 시 사라집니다. 다른 기기 사용 시 [📥 백업 다운로드] 기능으로 JSON 파일을 저장하시기 바랍니다.',
              },
              {
                q: '영업일 계산은 어떤 공휴일이 반영되나요?',
                a: '<strong>한국 법정 공휴일 2026~2030년</strong> 자동 반영: 신정, 설날 3일, 삼일절, 어린이날, 부처님오신날, 현충일, 광복절, 추석 3일, 개천절, 한글날, 성탄절 + 대체 공휴일. <strong>임시 공휴일·근로자의 날(5/1)</strong>은 별도이며 정부 발표 시 업데이트됩니다. 회사별 공휴일·연차는 본 도구에서 처리하지 않으니 별도 관리하세요.',
              },
              {
                q: '평일과 영업일의 차이는?',
                a: '<strong>평일</strong>은 월~금, <strong>영업일</strong>은 평일에서 공휴일을 제외한 실제 일하는 날입니다. 예: 5월 5일(어린이날)이 화요일이면 평일이지만 영업일은 아닙니다. 법적·계약상 기한 계산은 보통 영업일 기준, 학습·준비 기간 계산은 평일 기준이 일반적입니다.',
              },
              {
                q: '페이스 계산은 어떤 목표에 적합한가요?',
                a: '<strong>분할 가능한 모든 목표</strong>에 적용 가능합니다 — 학습(페이지·단어·문제), 운동(km·횟수·체중), 저축(금액), 글쓰기(글 수·단어), 다이어트(kg). 현재 페이스 분석으로 <strong>목표 달성 가능 여부와 추가 노력량</strong>을 파악할 수 있어 장기 목표 관리에 유용합니다.',
              },
              {
                q: '반복 D-day는 어떻게 작동하나요?',
                a: '반복 D-day는 다음 발생일을 자동 계산합니다. 예: 매년 반복 생일 D-day는 올해 생일이 지나면 자동으로 내년 생일로 갱신됩니다. 매월 반복(월급일·결제일)도 다음 달 자동 갱신됩니다. 반복 옵션: <strong>매년·매월·매주</strong>. 한 번 설정으로 평생 자동 관리됩니다.',
              },
              {
                q: '"날짜 차이 계산기"는 어디로 갔나요?',
                a: '<strong>본 도구의 [두 날짜 사이] 탭으로 통합</strong>되었습니다. 기존 <code>/tools/date/diff</code> 주소는 자동으로 본 페이지로 redirect 되며, 두 날짜 사이의 일수·평일·영업일·공휴일·년월일 차이를 모두 한곳에서 계산할 수 있습니다.',
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
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { href: '/tools/date/age',             icon: '🎂', name: '만 나이·생일 통계',     desc: '생일까지 D-day, 인생 통계' },
              { href: '/tools/edu/review-interval',  icon: '📚', name: '복습 간격 계산기',      desc: '시험 D-day와 복습 시너지' },
              { href: '/tools/date/military',        icon: '🎖️', name: '군 전역일 계산기',      desc: '입대일·전역일·복무율' },
              { href: '/tools/date/lunar',           icon: '🌙', name: '음양력 변환기',         desc: '띠·세시풍속' },
              { href: '/tools/date/jet-lag',         icon: '✈️', name: '시차 계산기',           desc: '도시 간 시차·도착 시간' },
              { href: '/tools/date/life-time',       icon: '⏳', name: '인생 시간 계산기',      desc: '남은 인생을 구체적으로' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 참고 자료 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>참고 자료</h2>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
            <li><strong style={{ color: 'var(--text)' }}>관공서의 공휴일에 관한 규정</strong> — 대통령령</li>
            <li><strong style={{ color: 'var(--text)' }}>한국천문연구원 천문력</strong> — 24절기·음력 환산</li>
            <li><strong style={{ color: 'var(--text)' }}>대체공휴일에 관한 법률</strong> — 2014.5 시행</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
