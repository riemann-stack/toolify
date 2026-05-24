import Link from 'next/link'
import RentJeonseClient from './RentJeonseClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/finance/rent-jeonse',
  title: '월세·전세 비교 계산기 — 대출이자·기회비용·세액공제·손익분기점 시뮬 (2026년)',
  description:
    '전세·월세·반전세 3옵션 동시 비교. 대출이자·기회비용·세액공제 반영한 손익분기 + 전세사기 위험 점수와 HUG 보증보험료.',
  keywords: [
    '월세 전세 비교', '전세 월세 비교', '월세 vs 전세',
    '전월세 전환율', '반전세 계산', '반전세 시뮬',
    '전세대출 금리', '전세자금대출 이자', '버팀목 전세대출',
    '월세 세액공제', '월세 소득공제', '전세대출 소득공제',
    'HUG 전세보증보험', 'HUG 보증료',
    '전세사기', '깡통전세', '전세가율', '보증금 안전',
    '보증금 기회비용', '자기자본 운용',
    '손익분기점', '누적 비용 시뮬',
    '임대료 5% 인상', '계약갱신청구권', '주택임대차보호법',
    '확정일자', '전입신고', '우선변제권',
    '서울 전세 시세', '경기 전세 시세', '아파트 전세',
    '신혼 전세', '청년 전세대출', '2026년 전세',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}
const faqAnswer: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
  margin: 0,
}

export default function RentJeonsePage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏠 월세·전세 비교 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        전세·월세·반전세 3옵션 동시 비교. <strong style={{ color: 'var(--text)' }}>대출이자·기회비용·세액공제</strong> 반영한 손익분기.
      </p>

      <RentJeonseClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 옵션 비교표 */}
        <section>
          <h2 style={sectionTitle}>전세 vs 월세 vs 반전세 — 한눈에 비교</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', '전세', '월세', '반전세'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['초기 자금',         '시세 60~80% 보증금',  '소액 보증금 + 월세',     '중간 보증금 + 적은 월세'],
                  ['월 비용',           '대출이자 + 기회비용',  '월세 + 보증금 이자',     '대출이자 + 줄어든 월세'],
                  ['세제 혜택',         '대출이자 소득공제 40% (한도 400만)', '월세 세액공제 17% (한도 750만)', '둘 다 부분 적용'],
                  ['주요 위험',         '전세사기·깡통전세',    '임대료 인상 5%',         '보증금 + 월세 양쪽 위험'],
                  ['임차인 부담',       '대출 부담 + 보증금 묶임', '매월 현금 지출',        '중간'],
                  ['장기 거주 시',       '임대료 인상 적음',     '누적 비용 증가',         '인상 영향 작음'],
                  ['단기 거주 시',       '대출 수수료 손실',     '유연성 ↑',              '중간'],
                  ['추천 상황',          '저금리 + 무주택자',    '단기 + 세액공제 자격',    '자기자본 부족 + 안정성'],
                ].map(([item, j, m, s], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{item}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{j}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{m}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. 전세대출 종류 */}
        <section>
          <h2 style={sectionTitle}>전세자금대출 종류 비교 (2026년)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['상품', '대상', '한도', '금리', '특징'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['버팀목 전세자금',      '청년·신혼·일반',   '최대 2.4억',       '연 1.5~2.7%',    '정부 지원 · 가장 저금리'],
                  ['청년 버팀목',          '만 19~34세 무주택', '1.5억 (수도권 2억)', '연 1.5~2.1%',  '청년 전용 · 우대 금리'],
                  ['신혼부부 버팀목',       '혼인 7년 이내',    '3억 (수도권)',      '연 1.5~2.7%',   '신혼 우대 · 자녀 추가 우대'],
                  ['HUG 안심전세',         '시세 90% 이하',    '5억',              '연 3.5~4.0%',    'HUG 보증 · 2단계 보호'],
                  ['시중은행 전세대출',     '근로소득자 일반',  '5억',              '연 3.5~4.5%',    '한도 큼 · 금리 변동'],
                  ['카카오뱅크 등',        '간편 신청',       '2.2억',            '연 3.7~4.5%',    '비대면 · 빠름'],
                ].map(([prod, target, limit, rate, feat], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{prod}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{target}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{limit}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{rate}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{feat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...faqAnswer, marginTop: '12px', fontSize: '12px' }}>
            ※ 한국주택금융공사·HF·은행 사이트에서 최신 금리 확인. 매년 정책 변경 가능.
          </p>
        </section>

        {/* 3. 임대차보호법 4조항 */}
        <section>
          <h2 style={sectionTitle}>한국 주택임대차보호법 핵심 4조항</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { title: '① 계약갱신청구권 (2+2년)', desc: '임차인은 1회에 한해 2년 추가 갱신을 청구할 수 있습니다. 임대인은 본인 거주·매도 등 정당한 사유 없이 거절 불가.' },
              { title: '② 임대료 5% 상한제', desc: '갱신 시 임대료 인상은 5% 이내. 단, 신규 계약(다른 임차인 또는 4년 후 신규)에는 적용되지 않고 시세대로 가능.' },
              { title: '③ 우선변제권 (확정일자 + 전입신고)', desc: '잔금일 당일 동사무소에서 확정일자 + 전입신고 → 다음 날 0시부터 효력 발생. 보증금 회수 시 다른 채권자보다 우선.' },
              { title: '④ 임차권등기명령', desc: '계약 만료 후 보증금을 돌려받지 못하고 이사해야 할 때 임차권을 등기로 등록 → 우선변제권 유지.' },
            ].map((law, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
                <p style={{ fontFamily: 'Noto Sans KR, sans-serif', fontWeight: 700, color: 'var(--accent)', margin: '0 0 6px', fontSize: '14px' }}>{law.title}</p>
                <p style={faqAnswer}>{law.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 전세사기 8대 유형 */}
        <section>
          <h2 style={sectionTitle}>전세사기 8대 유형 (피해 사례)</h2>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--muted)', lineHeight: 2 }}>
            <li><strong style={{ color: 'var(--text)' }}>깡통전세</strong> — 시세보다 보증금이 더 높음. 경매 시 회수 불가능</li>
            <li><strong style={{ color: 'var(--text)' }}>이중계약</strong> — 임대인이 동시에 여러 임차인과 계약 후 보증금 횡령</li>
            <li><strong style={{ color: 'var(--text)' }}>대리계약 사기</strong> — 가짜 위임장으로 실소유자 모르게 계약 체결</li>
            <li><strong style={{ color: 'var(--text)' }}>근저당 가려서 표시</strong> — 등기부에 거액 근저당 있는데 미고지</li>
            <li><strong style={{ color: 'var(--text)' }}>다가구 선순위 사기</strong> — 다가구 주택 선순위 보증금 합계가 시세 초과</li>
            <li><strong style={{ color: 'var(--text)' }}>신탁등기 함정</strong> — 신탁회사 명의로 등기되어 있는데 사문서로 계약</li>
            <li><strong style={{ color: 'var(--text)' }}>매매로 위장</strong> — 매도인이 임차인 보증금으로 잔금 처리 후 도주</li>
            <li><strong style={{ color: 'var(--text)' }}>법인 명의 사기</strong> — 일회용 법인 명의로 계약 후 폐업</li>
          </ul>
          <p style={{ ...faqAnswer, marginTop: '12px' }}>
            대응: HUG 전세보증보험 가입 + 등기부 재확인 + 실거래가 확인 + 다가구 선순위 보증금 확인. 의심 시 <strong style={{ color: 'var(--text)' }}>전세사기 피해자 지원센터</strong> (1533-8030) 또는 국토부 콜센터.
          </p>
        </section>

        {/* 5. 손익분기점 해석 가이드 (SEO 보완) */}
        <section>
          <h2 style={sectionTitle}>손익분기점 해석 가이드 — 전세 ↔ 월세 ↔ 반전세</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            본 도구의 <strong style={{ color: 'var(--text)' }}>시뮬레이션 탭</strong>은 누적 비용 곡선이 교차하는 시점을 자동으로 찾아 손익분기점으로 표시합니다.
            거주 예정 기간과 손익분기점을 비교하면 합리적인 선택이 가능합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '단기 거주 (1~2년)', d: '월세 유리 가능', desc: '전세대출 수수료·이사비 회수 어려움 + 보증금 운용 기회 ↑', c: '#DC2626' },
              { t: '중기 거주 (3~5년)', d: '손익분기점 ≈ 24~36개월', desc: '대출금리·전환율·세액공제 자격에 따라 결정', c: '#D97706' },
              { t: '장기 거주 (5년+)', d: '전세 유리 경향', desc: '월세 누적이 보증금 이자 + 기회비용을 초과', c: '#0891B2' },
              { t: '반전세 우위 구간', d: '전세 한도 부족 또는 보증금 분산', desc: '전환율 &lt; 대출금리일 때 월세 분할이 합리적', c: '#0EA5E9' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderLeft: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 12.5, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
                <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px' }}>{g.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: g.desc }} />
              </div>
            ))}
          </div>
        </section>

        {/* 6. FAQ — 최신 도구들과 동일 포맷 */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '월세가 항상 비싼가요?',
                a: '아닙니다. 다음 조건이 맞으면 월세가 더 유리할 수 있습니다. <strong>월세 세액공제 자격</strong>(무주택 + 총급여 7천 이하 → 연 약 127만 절세), <strong>단기 거주</strong>(1~2년, 전세대출 수수료·이사비 회수 어려움), <strong>자기자본 운용 기회</strong>(보증금 묶지 않고 7%+ 수익 가능), <strong>전세대출 금리 &gt; 전월세 전환율</strong>일 때 — 본 도구의 누적 비용 차트로 즉시 판단 가능합니다.',
              },
              {
                q: '전세대출 vs 신용대출, 어느 쪽이 좋나요?',
                a: '전세대출이 압도적으로 유리합니다. <strong>시중은행 전세대출 금리 3.5~4.5%</strong> vs 신용대출 5~7%. 전세대출은 보증금 자체가 담보가 되어 금리가 낮고, 원리금의 40%(한도 400만)까지 소득공제도 가능. 정부 지원 상품(버팀목·HUG)은 1.5~2.7%로 더 저렴하므로 청년·신혼·무주택자라면 우선 검토.',
              },
              {
                q: '월세 세액공제 받는 조건은?',
                a: '4가지 모두 충족해야 합니다. <strong>무주택 세대주(또는 세대원)</strong>, <strong>총급여 7천만 이하</strong>(또는 종합소득금액 6천만 이하), <strong>국민주택규모 85㎡ 이하</strong>(또는 기준시가 4억 이하), <strong>본인 또는 배우자 명의 계약</strong>. 연 750만 한도 × 17%(7천 이하) / 15%(이상) = 최대 약 127.5만 환급. 5월 종합소득세 신고 또는 연말정산 시 적용.',
              },
              {
                q: '전세사기 안 당하는 5가지 핵심 체크는?',
                a: '① <strong>등기부등본 확인</strong> — 근저당·신탁·압류 여부(대법원 인터넷등기소 700원). ② <strong>전세가율 80% 이하</strong> — 국토부 실거래가 대비. ③ <strong>HUG 전세보증보험 가입</strong>(보증료 약 0.128%, 사고 시 100% 보장). ④ <strong>잔금일 당일 등기부 재확인 + 확정일자 + 전입신고</strong>. ⑤ <strong>임대인 신원 확인</strong> — 신분증 vs 등기부 명의 일치, 대리계약 시 위임장·인감증명서. 의심 시 국토부 안심전세 앱에서 임대인 사고이력 조회.',
              },
              {
                q: '반전세는 언제 유리한가요?',
                a: '<strong>전세대출 한도가 부족</strong>한데 보증금이 큰 매물, <strong>전월세 전환율 &lt; 전세대출 금리</strong>(예: 전환율 4% vs 대출 4.5%), <strong>임대인이 대출 부담 회피</strong>를 원할 때, <strong>보증금 위험을 줄이고 싶을 때</strong>(보증금 작아짐 → 사고 시 손실 ↓) 합리적입니다. 본 도구는 입력값 기준 반전세 시나리오를 자동 계산하므로 3옵션 누적 비용을 비교해 판단할 수 있습니다.',
              },
              {
                q: '전월세 전환율이 뭔가요?',
                a: '같은 집의 전세 보증금 일부를 월세로 환산할 때 적용되는 비율. 예: 전세 1억을 월세 전환 시 5% 적용 → 월 (1억 × 5% ÷ 12) = 41.7만원. <strong>법정 한도</strong>는 한국은행 기준금리 + 2%(현재 약 5.5%) — 초과 인상은 무효. 시장 평균 4~6%. <strong>본인의 전세대출 금리보다 전환율이 낮으면 월세가 수학적으로 유리</strong>합니다.',
              },
              {
                q: '보증금 기회비용은 어떻게 계산하나요?',
                a: '보증금에 묶인 자기자본을 다른 곳에 운용했을 때의 잠재 수익이 기회비용입니다. 본 도구는 입력한 기대수익률(예금 3% / 채권 4% / 주식 7% 등)을 자기자본에 곱해 월별 기회비용으로 자동 반영합니다. 예: 자기자본 3억 × 기대수익률 5% → 연 1,500만 / 월 125만의 잠재 수익을 포기하는 셈. 이를 반영해야 월세와의 진짜 비용 차이가 보입니다.',
              },
              {
                q: '갱신청구권으로 5% 이상 인상 가능한가요?',
                a: '<strong>갱신청구권 행사 시에만 5% 상한이 적용</strong>됩니다. <strong>갱신청구권 행사(2+2년)</strong>는 5% 상한, <strong>합의에 의한 갱신</strong>은 5% 상한 미적용(합의로 시세 반영 가능), <strong>4년 후 신규 계약</strong>은 시세대로 자유롭게, <strong>임대인 본인 거주 시</strong>는 갱신 거절 가능 → 시세 신규 계약. 분쟁 시 주택임대차분쟁조정위원회를 활용하세요.',
              },
              {
                q: 'HUG 전세보증보험은 꼭 들어야 하나요?',
                a: '필수는 아니지만 <strong>강력히 권장</strong>됩니다. 보증료는 약 0.128%(보증금 1억당 연 12.8만 수준)이며 사고 시 보증금 100% 회수 보장. 가입 조건은 전세가율 90% 이하, 시세 7억 이하 등 — 시세 대비 전세금이 높은 매물은 가입 자체가 불가하므로 매물 선택 단계부터 확인 필요. 잔금일 기준 60일 이내 가입 권장.',
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

        {/* 7. 함께 쓰면 좋은 도구 — 최신 포맷 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/finance/loan',          icon: '💳', name: '대출이자 계산기',         desc: '전세자금대출 원리금균등·금리 시뮬' },
              { href: '/tools/finance/real-estate',   icon: '🏘️', name: '부동산 수익률 계산기',    desc: '매매 vs 임대 ROI 비교' },
              { href: '/tools/finance/savings',       icon: '💰', name: '저축액 계산기',           desc: '월세 절약분으로 자산 만들기' },
              { href: '/tools/finance/compound',      icon: '📈', name: '복리 계산기',             desc: '보증금 운용 시 장기 수익' },
              { href: '/tools/finance/freelance-tax', icon: '🧾', name: '프리랜서 종합소득세',     desc: '사업소득자 월세 세액공제' },
              { href: '/tools/finance/salary',        icon: '💴', name: '연봉 실수령액 계산기',    desc: '월급·세후로 임대료 부담 판단' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center', color: 'inherit' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
