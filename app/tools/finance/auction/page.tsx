import Link from 'next/link'
import AuctionClient from './AuctionClient'
import { buildMetadata } from '@/lib/seo'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/finance/auction',
  title: '경매 비용 계산기 — 낙찰가 + 취득세 자동 + 명도·체납·LTV/DSR',
  description: '낙찰가 + 취득세·명도·체납·수리·법무·대출까지 진짜 들어가는 비용. 1주택·다주택·법인 시나리오와 LTV/DSR 자동 반영.',
  keywords: ['경매 총비용', '낙찰가 부대비용', '경매 취득세', '명도비', '체납 관리비', 'LTV DSR', '경매 대출', '다주택 취득세', '법인 명의', '경매 계산기'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '20px 22px',
  marginBottom: '14px',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text)',
  padding: '4px 0',
}
const faqAnswer: React.CSSProperties = {
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px solid var(--border)',
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
}

const FAQ_LD = [
  { "q":"경매 부대비용은 평균 낙찰가의 몇 %인가요?","a":"일반 경매 부대비용은 낙찰가의 10~15% 수준입니다. • 5억 낙찰 → 부대비용 5,000~7,500만원 • 1주택 실거주는 5~8%, 다주택·법인은 15~20%까지 올라감 • 명도·수리·체납이 많을수록 비율 ↑ 본 도구로 본인 케이스를 정확히 산정해 입찰가 결정에 활용하세요." },
  { "q":"취득세는 어떻게 계산되나요?","a":"주택 vs 비주택, 명의(1주택/다주택/법인), 지역(조정대상/비규제)에 따라 다릅니다. • 1주택 실거주 6억 이하: 1.1% • 1주택 9억 초과: 3.3% • 다주택 (3주택+): 12.4% (조정대상 동일) • 법인: 12.4% (명의·지역 무관) • 비주택 (오피스·상가·토지): 4.6% 모두 지방교육세 포함·전용 85㎡ 이하 기준(초과 시 농어촌특별세 추가). 본 도구는 위 매트릭스를 자동 적용합니다. 정확한 세액은 세무사 확인 권장." },
  { "q":"명도비는 얼마나 들까요?","a":"평균 100~500만원, 일반적으로 약 200만원이 표준입니다. • 임차인이 협조적이면 이사비 보조 100~200만원으로 해결 • 점유자 거부 시 강제집행 (집행관 신청 + 노무비) 300~500만원 • 점유자가 다수·조직적 점유면 1,000만원 이상 가능 입찰 전 매각물건명세서에서 점유 관계 확인 필수. 임차인이 명도확인서를 받아갔는지도 체크." },
  { "q":"체납 관리비는 누가 부담하나요?","a":"낙찰자는 전 소유자의 체납 관리비 중 '공용부분' 관리비(원금)만 승계합니다 (대법원 2001다8677 전원합의체). '전유부분' 관리비와 공용·전유 모두의 '연체료'는 승계되지 않습니다. 단 3년 단기소멸시효 도과분도 제외. • 입찰 전 필수 조사: 관리사무소 방문 → 미납 관리비 명세서 발급(공용·전유 구분) • 일반 평균: 100~500만원 (장기 빈집은 1,000만원+) • 협상 여지: 관리사무소와 분할 납부·일부 면제 협상 가능 승계 범위를 정확히 따져 입찰가에 반영하세요." },
  { "q":"경매도 중개수수료가 드나요?","a":"일반적으로 0원입니다. 법원 경매는 공인중개사 없이 본인이 입찰하기 때문에 중개수수료가 없습니다. 단 경매 컨설팅·자문 서비스를 이용하면 별도 수수료(낙찰가의 0.5~1%) 발생. 초보자는 첫 1~2건 컨설팅 도움을 받는 것도 좋은 선택입니다. 단 컨설팅 사기·과도한 수수료 업체에 주의 — 등록업체 + 후기 확인 필수." },
  { "q":"셀프 등기로 법무비 절감 가능?","a":"가능합니다. 법무비 30~200만원을 0원으로 절감할 수 있어요. • 난이도: ★★★ (등기소 방문 2회 + 서류 10여 종 준비) • 소요 시간: 5~10시간 (인터넷 정보 학습 + 서류 작성 + 등기소 대기) • 위험: 서류 누락 시 등기 반려, 재신청 필요 • 추천: 첫 1건은 법무사 위임 → 절차 익히고 2건째부터 셀프 셀프 등기 가이드는 대법원 인터넷등기소·등기소 직원 안내가 가장 정확합니다." },
  { "q":"경매 LTV는 얼마까지 가능?","a":"일반 매매와 동일한 LTV가 적용됩니다. • 비규제지역 + 1주택: 70% (가장 유리) • 조정대상지역 + 1주택: 50% • 투기과열지구: 40% • 다주택자: 30% 이하 또는 대출 불가 또한 DSR 40%(연소득 대비 연 원리금) 한도가 동시 적용. 둘 중 작은 값 적용. 정확한 한도는 은행·금감원 최신 가이드라인 확인." },
  { "q":"1주택 vs 다주택 취득세 차이가 얼마나?","a":"매우 큽니다. 5억 아파트 기준: • 실거주 1주택 (6억 이하): 5억 × 1.1% = 약 550만원 • 다주택 (3주택+): 5억 × 12.4% = 약 6,200만원 • 차액: 약 5,650만원 (약 11배) → 다주택 보유 시 추가 매수 의사결정에 결정적 영향. 시나리오 비교 탭에서 본인 가격으로 직접 확인 가능합니다." },
  { "q":"법인 명의로 사면 유리한가요?","a":"2020년 이후 법인 부동산 매수는 매우 불리해졌습니다. • 취득세 12.4% 단일 (1주택 특례 X) • 종합부동산세 최고 7% (개인 0.6~3%) • 양도소득세 → 법인세 + 추가 20% 가산 • 종합소득세 합산 → 단기 매도 의도가 명확하지 않다면 개인 명의가 절대적으로 유리. 법인은 임대업·개발업·다수 부동산 운용 등 특수 목적에 한정." },
  { "q":"유치권·법정지상권 비용은?","a":"물건별 변동 매우 큰 리스크입니다. • 유치권: 점유자가 미수금 주장으로 인도 거부. 수백~수천만원 협상 또는 소송 필요 • 법정지상권: 토지·건물 분리 매각 시 발생. 별도 토지 임차료·매수 협상 • 변호사·법무사 자문료: 사건당 200~500만원 • 소송 시 1~3년 소요, 추가 비용 1,000만원 이상 → 입찰 전 매각물건명세서 + 등기부등본 + 현장 조사로 권리 분석 필수. 자신 없으면 유치권·법정지상권 표시 물건은 회피가 정답입니다." }
]

export default function AuctionPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        금융·재테크
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏛️ 경매 비용 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        낙찰가 + 취득세·명도·체납·수리·대출까지 <strong style={{ color: 'var(--text)' }}>진짜 들어가는 비용</strong>을 시나리오별로.
      </p>

      <AuctionClient />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>낙찰가·물건 종류·명의·지역 입력</strong> — 4가지 핵심 정보</li>
          <li><strong>자동 추정 항목 확인</strong> — 취득세·법무비·인지세·채권 자동 계산</li>
          <li><strong>경매 특화 비용 입력</strong> — 명도비·체납·수리비 (가장 변동 큰 항목)</li>
          <li><strong>대출·자기자본 탭</strong>에서 LTV/DSR로 실제 자기자본 부족액 진단</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>시나리오 비교 탭</strong>에서 같은 낙찰가에 명의(실거주/다주택/법인)별
          취득세 차이를 한 번에 비교할 수 있어요. 명의 선택이 수천만원~억 단위 차이를 만듭니다.
        </p>
      </div>

      {/* 2. 부대비용 10대 항목 */}
      <h2 style={sectionTitle}>💵 경매 부대비용 어디까지 들어가나요? (10대 항목)</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>항목</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>일반 금액</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>구분</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['🏛️ 취득세 (지방교육세 포함)',  '낙찰가 1.1~12.4%',         '필수 / 자동 계산'],
                ['📋 인지세',                       '구간별 2~35만원',          '필수 / 자동'],
                ['🎟️ 국민주택채권 즉시 매도 손실',    '낙찰가 0.5~1.2%',          '필수 / 자동'],
                ['⚖️ 법무비 (등기 위임)',           '30~200만원',               '선택 (셀프 0원)'],
                ['🚪 명도비 (이사비·강제집행)',     '50~500만원',               '경매 특화'],
                ['💸 체납 관리비',                 '100~500만원',              '경매 특화'],
                ['⚡ 체납 공과금',                 '20~100만원',               '경매 특화'],
                ['🔨 수리비 (도배·바닥·주방)',      '평당 30~100만원',          '선택'],
                ['🤝 중개수수료',                  '경매 보통 0',               '매매 시 0.4~0.9%'],
                ['📦 기타 (감정·자문·세무)',        '50~200만원',               '선택'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '9px 12px',
                      fontFamily: j === 0 ? 'Noto Sans KR, sans-serif' : 'inherit',
                      color: j === 1 ? 'var(--accent)' : (j === 2 ? 'var(--muted)' : 'var(--text)'),
                      fontWeight: j === 0 ? 700 : 500,
                      fontSize: 12.5,
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 취득세 1주택 vs 다주택 vs 법인 */}
      <h2 style={sectionTitle}>🏛️ 취득세 자동 계산 — 1주택 vs 다주택 vs 법인</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          취득세는 <strong>명의 유형이 가장 큰 변수</strong>입니다. 같은 5억 아파트도 실거주는 약 550만원, 다주택은 약 6,200만원으로
          <strong style={{ color: 'var(--accent)' }}> 약 11배 차이</strong>가 납니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '6px 0', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>주택 가격</th>
                <th style={{ padding: '6px 0', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>실거주 1주택</th>
                <th style={{ padding: '6px 0', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>2주택 (조정)</th>
                <th style={{ padding: '6px 0', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>3주택+ / 법인</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['6억 이하', '1.1%',       '8.4% (조정 12.4%)', '12.4%'],
                ['6~9억',    '1.1~3.3%',   '8.4% (조정 12.4%)', '12.4%'],
                ['9억 초과', '3.3%',       '8.4% (조정 12.4%)', '12.4%'],
              ].map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '6px 0',
                      textAlign: j === 0 ? 'left' : 'right',
                      color: j === 1 ? 'var(--accent)' : 'var(--text)',
                      fontFamily: j === 0 ? 'Noto Sans KR, sans-serif' : 'Inter, system-ui, sans-serif',
                      fontWeight: j === 0 ? 600 : 700,
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>비주택 (오피스텔·상가·토지)</strong>: 단일 4.6%</li>
          <li><strong style={{ color: 'var(--text)' }}>법인</strong>: 명의·지역 무관 12.4% 단일</li>
          <li><strong style={{ color: 'var(--text)' }}>특례 감면</strong>: 신혼부부·생애최초·청년·다자녀 등 일부 취득세 감면 가능 (양도세 비과세와는 별개, 별도 신청)</li>
          <li><strong style={{ color: 'var(--text)' }}>주의</strong>: 표는 취득세 + 지방교육세 통합 세율(전용 85㎡ 이하 기준). 85㎡ 초과 주택은 농어촌특별세가 추가됩니다</li>
        </ul>
      </div>

      {/* 4. 명도·체납·수리 */}
      <h2 style={sectionTitle}>🚪 명도·체납·수리 — 경매 특화 비용 가이드</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          일반 매매에는 없는 <strong>경매만의 추가 비용</strong>이며, 물건별 변동이 매우 큽니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 12 }}>
          {[
            { t: '🚪 명도비 (이사비)', d: '점유자 인도 비용. 평균 200만원, 협상 시 50~70% 절감 가능. 최후 수단은 강제집행.', c: '#EA580C' },
            { t: '💸 체납 관리비', d: '전 소유자 미납 관리비 중 공용부분만 낙찰자 승계 (전유부분·연체료 제외). 입찰 전 관리사무소 확인 필수.', c: '#DB2777' },
            { t: '⚡ 체납 공과금', d: '전기·수도·가스 미납. 대부분 100만원 이내, 한국전력·가스공사 조회.', c: '#D97706' },
            { t: '🔨 수리비', d: '도배·바닥·주방·욕실 평당 30~100만원. DIY·셀프 시공으로 30~50% 절감.', c: '#0891B2' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ⚠️ <strong style={{ color: '#DB2777' }}>유치권·법정지상권</strong>이 있는 물건은 추가 변호사·법무사 비용
          (수백만~수천만원) 발생 가능. 입찰 전 반드시 법무사 자문을 받으세요.
        </p>
      </div>

      {/* 5. LTV·DSR */}
      <h2 style={sectionTitle}>🏦 대출 LTV·DSR — 자기자본 얼마나 필요?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          경매 대출은 <strong>두 가지 한도</strong>가 동시에 적용됩니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, margin: '0 0 6px' }}>LTV (담보인정비율)</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              부동산 가치 대비 대출 한도.<br />
              일반 70% / 규제지역 50~60% / 다주택 30%.
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, margin: '0 0 6px' }}>DSR (총부채원리금상환비율)</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              연소득 대비 연 원리금 — 40% 한도.<br />
              기존 대출 + 신규 대출 합산 적용.
            </p>
          </div>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          → 둘 중 <strong style={{ color: 'var(--text)' }}>더 작은 값</strong>이 실제 대출 가능액. 고소득자도 LTV에 막히고,
          저소득자는 DSR에 막히는 식. 정확한 한도는 <strong style={{ color: 'var(--text)' }}>은행·금융사</strong>에서
          신용등급·DTI 등을 종합 평가합니다.
        </p>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 경매 부대비용은 평균 낙찰가의 몇 %인가요?</summary>
        <p style={faqAnswer}>
          일반 경매 부대비용은 <strong>낙찰가의 10~15%</strong> 수준입니다.
          • 5억 낙찰 → 부대비용 5,000~7,500만원<br />
          • 1주택 실거주는 5~8%, 다주택·법인은 15~20%까지 올라감<br />
          • 명도·수리·체납이 많을수록 비율 ↑<br />
          본 도구로 본인 케이스를 정확히 산정해 입찰가 결정에 활용하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 취득세는 어떻게 계산되나요?</summary>
        <p style={faqAnswer}>
          <strong>주택 vs 비주택, 명의(1주택/다주택/법인), 지역(조정대상/비규제)</strong>에 따라 다릅니다.<br />
          • 1주택 실거주 6억 이하: <strong>1.1%</strong><br />
          • 1주택 9억 초과: <strong>3.3%</strong><br />
          • 다주택 (3주택+): <strong>12.4%</strong> (조정대상 동일)<br />
          • 법인: <strong>12.4%</strong> (명의·지역 무관)<br />
          • 비주택 (오피스·상가·토지): <strong>4.6%</strong><br />
          위 세율은 취득세 + 지방교육세 통합 기준(전용 85㎡ 이하). 85㎡ 초과 주택은 농어촌특별세가 추가됩니다. 정확한 세액은 세무사 확인 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 명도비는 얼마나 들까요?</summary>
        <p style={faqAnswer}>
          평균 <strong>100~500만원</strong>, 일반적으로 <strong>약 200만원</strong>이 표준입니다.
          • 임차인이 협조적이면 이사비 보조 100~200만원으로 해결<br />
          • 점유자 거부 시 강제집행 (집행관 신청 + 노무비) 300~500만원<br />
          • 점유자가 다수·조직적 점유면 1,000만원 이상 가능<br />
          입찰 전 <strong>매각물건명세서</strong>에서 점유 관계 확인 필수. 임차인이 명도확인서를 받아갔는지도 체크.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 체납 관리비는 누가 부담하나요?</summary>
        <p style={faqAnswer}>
          낙찰자는 전 소유자 체납 관리비 중 <strong>‘공용부분’ 관리비(원금)만 승계</strong>합니다 (대법원 2001다8677 전원합의체).
          <strong>‘전유부분’ 관리비와 연체료(공용·전유 모두)는 승계되지 않습니다.</strong> 3년 단기소멸시효 도과분도 제외.<br />
          • <strong>입찰 전 필수 조사</strong>: 관리사무소 방문 → 미납 명세서 발급(공용·전유 구분)<br />
          • <strong>일반 평균</strong>: 100~500만원 (장기 빈집은 1,000만원+)<br />
          • <strong>협상 여지</strong>: 관리사무소와 분할 납부·일부 면제 협상 가능<br />
          승계 범위를 정확히 따져 입찰가에 반영하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 경매도 중개수수료가 드나요?</summary>
        <p style={faqAnswer}>
          <strong>일반적으로 0원</strong>입니다. 법원 경매는 공인중개사 없이 본인이 입찰하기 때문에
          중개수수료가 없습니다.<br />
          단 <strong>경매 컨설팅·자문 서비스</strong>를 이용하면 별도 수수료(낙찰가의 0.5~1%) 발생.
          초보자는 첫 1~2건 컨설팅 도움을 받는 것도 좋은 선택입니다. 단 컨설팅 사기·과도한 수수료
          업체에 주의 — 등록업체 + 후기 확인 필수.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 셀프 등기로 법무비 절감 가능?</summary>
        <p style={faqAnswer}>
          가능합니다. 법무비 30~200만원을 <strong>0원으로 절감</strong>할 수 있어요.<br />
          • <strong>난이도</strong>: ★★★ (등기소 방문 2회 + 서류 10여 종 준비)<br />
          • <strong>소요 시간</strong>: 5~10시간 (인터넷 정보 학습 + 서류 작성 + 등기소 대기)<br />
          • <strong>위험</strong>: 서류 누락 시 등기 반려, 재신청 필요<br />
          • <strong>추천</strong>: 첫 1건은 법무사 위임 → 절차 익히고 2건째부터 셀프<br />
          셀프 등기 가이드는 대법원 인터넷등기소·등기소 직원 안내가 가장 정확합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 경매 LTV는 얼마까지 가능?</summary>
        <p style={faqAnswer}>
          일반 매매와 동일한 LTV가 적용됩니다.<br />
          • <strong>비규제지역 + 1주택</strong>: <strong>70%</strong> (가장 유리)<br />
          • <strong>조정대상지역 + 1주택</strong>: <strong>50%</strong><br />
          • <strong>투기과열지구</strong>: <strong>40%</strong><br />
          • <strong>다주택자</strong>: <strong>30% 이하</strong> 또는 대출 불가<br />
          또한 <strong>DSR 40%</strong>(연소득 대비 연 원리금) 한도가 동시 적용. 둘 중 작은 값 적용.
          정확한 한도는 은행·금감원 최신 가이드라인 확인.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 1주택 vs 다주택 취득세 차이가 얼마나?</summary>
        <p style={faqAnswer}>
          매우 큽니다. <strong>5억 아파트 기준</strong>:<br />
          • 실거주 1주택 (6억 이하): 5억 × 1.1% = <strong>약 550만원</strong><br />
          • 다주택 (3주택+): 5억 × 12.4% = <strong>약 6,200만원</strong><br />
          • 차액: <strong style={{ color: 'var(--accent)' }}>약 5,650만원 (약 11배)</strong><br />
          → 다주택 보유 시 추가 매수 의사결정에 결정적 영향. 시나리오 비교 탭에서 본인 가격으로 직접 확인 가능합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 법인 명의로 사면 유리한가요?</summary>
        <p style={faqAnswer}>
          <strong>2020년 이후 법인 부동산 매수는 매우 불리</strong>해졌습니다.<br />
          • 취득세 <strong>12.4% 단일</strong> (1주택 특례 X)<br />
          • 종합부동산세 <strong>최고 7%</strong> (개인 0.6~3%)<br />
          • 양도소득세 → <strong>법인세 + 추가 20% 가산</strong><br />
          • 종합소득세 합산<br />
          → 단기 매도 의도가 명확하지 않다면 <strong>개인 명의가 절대적으로 유리</strong>.
          법인은 임대업·개발업·다수 부동산 운용 등 특수 목적에 한정.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 유치권·법정지상권 비용은?</summary>
        <p style={faqAnswer}>
          <strong>물건별 변동 매우 큰 리스크</strong>입니다.<br />
          • <strong>유치권</strong>: 점유자가 미수금 주장으로 인도 거부. 수백~수천만원 협상 또는 소송 필요<br />
          • <strong>법정지상권</strong>: 토지·건물 분리 매각 시 발생. 별도 토지 임차료·매수 협상<br />
          • <strong>변호사·법무사 자문료</strong>: 사건당 200~500만원<br />
          • <strong>소송 시 1~3년 소요</strong>, 추가 비용 1,000만원 이상<br />
          → 입찰 전 매각물건명세서 + 등기부등본 + 현장 조사로 권리 분석 필수. 자신 없으면 <strong>유치권·법정지상권 표시 물건은 회피</strong>가
          정답입니다.
        </p>
      </details>

      {/* finance 도구 크로스링크 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/finance/loan" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>💳</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>대출이자 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            원리금균등·중도상환·갈아타기
          </p>
        </Link>
        <Link href="/tools/finance/real-estate" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🏘️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>부동산 투자 수익률</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            매매·임대·레버리지 수익률
          </p>
        </Link>
        <Link href="/tools/finance/savings" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>💰</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>월 저축가능 금액</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            저축률 진단·자기자본 마련
          </p>
        </Link>
      </div>
    </div>
  )
}
