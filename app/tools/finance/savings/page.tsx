import Link from 'next/link'
import SavingsClient from './SavingsClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import UpdatedMeta from '@/components/UpdatedMeta'
import FaqJsonLd from '@/components/FaqJsonLd'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/finance/savings',
  title: '저축액 계산기 — 저축률 진단 + 6 항아리 + 청년미래적금·ISA·연금저축',
  description: '수입·지출로 저축률을 진단하고 연령대별 권장 수준과 비교합니다. 6 항아리 분배, 청년미래적금·ISA·연금저축 절세 상품 비교, 1억 모으기 목표 역산까지.',
  keywords: ['저축률 계산', '월 저축 가능 금액', '권장 저축률', '6 항아리 모델', '청년미래적금', '청년도약계좌', 'ISA 계좌', '연금저축', 'IRP', '재무 진단', '목표 금액 역산'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
  marginTop: '40px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}

const FAQ_LD = [
            {
              q: '한국인 평균 저축률은 얼마인가요?',
              a: '기준으로 삼는 지표에 따라 크게 다릅니다. 가계동향조사가 발표하는 <strong>흑자율</strong>(처분가능소득 중 소비하고 남은 비율)은 2025년 분기별 약 30% 안팎이지만, 여기에는 대출 원금 상환도 포함돼 이 도구의 저축률(대출 원리금을 지출로 빼고 계산)과 바로 비교하기 어렵습니다. 한국은행 국민계정의 가계 순저축률은 이보다 훨씬 낮은 한 자릿수~10% 안팎입니다. 평균과 비교하기보다 연령대별 권장 저축률(20~50%)과 본인 목표를 기준으로 삼는 편이 실용적입니다.',
            },
            {
              q: '사회 초년생은 월급의 몇 %를 저축해야 하나요?',
              a: '<strong>30~40%</strong> 권장입니다. 월급 250만원이면 75~100만원 저축이 목표. 왜냐하면 ① 부양 부담이 가장 적은 시기, ② 복리 효과가 가장 큰 시기 (1년 빠른 저축 = 30년 후 큰 차이), ③ 결혼·내 집 마련·차량 구입 등 큰 지출 대비. 2026년 6월 출시된 청년미래적금은 정부기여금을 더해 주므로 만 19~34세라면 모집 기간(매년 6월·12월)에 가입 요건을 먼저 확인해 보세요.',
            },
            {
              q: '고정비와 변동비 구분 기준은?',
              a: '<strong>고정비</strong>는 매월 일정 금액이 자동으로 빠져나가며 단기간 줄이기 어려운 비용 — 월세·관리비·대출 원리금·통신비·교통비 정기권·보험료. <strong>변동비</strong>는 본인 의사로 조절 가능한 비용 — 식비·외식·쇼핑·문화·여행. 저축률 개선의 핵심은 <strong>변동비 30% 절감 + 고정비 1년에 한 번 재점검</strong>입니다.',
            },
            {
              q: '청년도약계좌는 아직 가입할 수 있나요?',
              a: '<strong>신규 가입은 2025년 12월에 종료</strong>됐습니다. 이미 가입한 사람은 만기(5년)까지 유지하면 정부 기여금과 비과세 혜택을 계속 받을 수 있으니, 중도해지보다는 유지를 먼저 검토하세요. 새로 시작하는 만 19~34세 청년은 2026년 6월 출시된 <strong>청년미래적금</strong>(월 최대 50만원·3년, 정부기여금 일반형 6%·우대형 12%)을 확인하면 됩니다. 소득 요건과 우대형 대상은 금융위원회·서민금융진흥원 공고로 확인하세요.',
            },
            {
              q: 'ISA와 연금저축 어느 게 더 좋은가요?',
              a: '<strong>둘 다 가입하는 게 가장 효율적</strong>입니다. <strong>ISA</strong>는 3년 후 중도 인출 가능, 연 200만원 비과세(서민형 400). 단기·중기 자금 운용 + 절세. <strong>연금저축</strong>은 만 55세 이후 연금 수령, 즉시 세액공제 환급(연 99만원). 우선순위는 직장인이라면 연금저축 600 채우기 → 추가 자금은 ISA로 운용 → 여유 있으면 IRP로 추가 300.',
            },
            {
              q: '비상금은 얼마나 모아야 하나요?',
              a: '<strong>월 생활비의 6개월치</strong>가 표준입니다. 월 200만원 쓰면 1,200만원 비상금. 갑작스런 실직·질병·사고 시 6개월 안에 새 직장·회복이 가능하다는 가정. <strong>보관 장소</strong>는 즉시 인출 가능한 CMA·자유입출금 통장(적금·펀드 X). 이자율은 낮지만 유동성이 우선. 자영업자·프리랜서는 12개월치까지 권장.',
            },
            {
              q: '6 항아리 모델은 한국 상황에 맞나요?',
              a: '기본 비율은 미국 기준이라 <strong>한국 현실에 맞춰 조정이 필요</strong>합니다. 한국은 월세·통신비·교육비가 비싸 <strong>NEC를 60~65%로 늘리고, GIVE를 0~3%로 줄이는 것</strong>이 일반적입니다. 핵심 원칙은 <strong>저축+투자 합 20%+ 유지</strong>입니다.',
            },
            {
              q: '1억 모으려면 월 얼마 저축?',
              a: '기간·수익률에 따라 다릅니다(복리 적용). <strong>5년·연 3%</strong>: 월 약 155만원 / <strong>5년·연 6%</strong>: 월 약 143만원 / <strong>7년·연 6%</strong>: 월 약 95만원 / <strong>10년·연 6%</strong>: 월 약 61만원 / <strong>15년·연 7%</strong>: 월 약 31만원. 시간이 길수록 복리 효과로 필요 월 저축액이 급감합니다 — <strong>일찍 시작이 가장 효율적</strong>입니다. 목표 역산 탭에서 본인 조건으로 즉시 확인하세요.',
            },
            {
              q: '부채가 많을 때 저축이 우선인가 상환이 우선인가?',
              a: '<strong>금리 비교가 핵심</strong>입니다. <strong>부채 금리 &gt; 저축 금리 + 4%p</strong>면 상환 우선(예: 신용대출 6%, 적금 3% → 상환 우선). 비슷하거나 부채 금리가 낮으면 비상금 6개월치 + 청년 적금·세제혜택 한도까지는 저축 + 잉여로 상환. 고금리 부채(현금서비스·카드론 15%+)는 무조건 1순위 상환. 단, 최소 비상금 1~3개월치는 항상 확보하세요.',
            },
          ]

export default function SavingsPage() {
  return (
    <ToolPage width={880} slug="/tools/finance/savings">
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        금융·재테크
      </p>
      <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="finance" />저축액 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        수입·지출 → 저축률과 권장 수준 비교 + <strong style={{ color: 'var(--text)' }}>6 항아리 분배</strong>. 청년미래적금·ISA 절세 비교.
      </p>

      <UpdatedMeta date="2026년 9월" basis="2026년 절세 상품 기준 · 1인 가구 소비지출은 2024년 가계동향조사(168.9만원)" sources={[{"label":"국가데이터처 KOSIS","href":"https://kosis.kr"},{"label":"금융위원회 (청년미래적금)","href":"https://www.fsc.go.kr"},{"label":"국세청","href":"https://www.nts.go.kr"}]} />

      <SavingsClient />

      <GuideDivider />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>가구·연령 선택</strong> — 1인/2인/3인/4인+, 20대~50대</li>
          <li><strong>월 실수령액 입력</strong> — <Link href="/tools/finance/salary" style={{ color: 'var(--accent)' }}>연봉 실수령액 계산기</Link>에서 정확히 계산</li>
          <li><strong>고정비·변동비 항목별 입력</strong> — 월세·통신·식비·외식·쇼핑 등 13항목</li>
          <li><strong>결과 확인</strong> — 저축액·저축률·등급(S~D) + 평균/권장 비교 + 변동비 절감 시뮬</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>목표 역산 탭</strong>에서 1억·5억·내 집 마련 등 인기 목표를 선택하면
          월 필요 저축액과 연도별 누적표를 즉시 확인할 수 있어요.
        </p>
      </div>

      {/* 2. 한국인 평균 vs 권장 */}
      <h2 style={sectionTitle}>📊 한국인 평균 저축률 vs 권장 저축률</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          &lsquo;평균 저축률&rsquo;은 지표마다 크게 다릅니다. 가계동향조사의 흑자율은 대출 원금 상환까지 포함해 30% 안팎으로 나오고,
          국민계정의 가계 순저축률은 그보다 훨씬 낮습니다. 그래서 평균과 견주기보다 연령대별 권장 저축률을 기준으로 삼는 편이 실용적이에요.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 12 }}>
          {[
            { t: '20대 사회초년생', d: '30~40%', desc: '복리 효과 시작 시기. 결혼·내 집 자금 준비.', c: 'var(--teal-600)' },
            { t: '30대 미혼', d: '40~50%', desc: '소득 증가 + 부양 부담 적음. 황금 저축기.', c: 'var(--emerald-600)' },
            { t: '30대 기혼', d: '30~40%', desc: '내 집 마련·결혼·양가 부양 시기.', c: 'var(--cyan-600)' },
            { t: '40대 가족', d: '20~30%', desc: '교육비·주거비 정점. 일시 하락 OK.', c: 'var(--amber-600)' },
            { t: '50대 은퇴 준비', d: '30~40%', desc: '자녀 독립 + 마지막 저축 골든타임.', c: 'var(--orange-600)' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 18, color: 'var(--text)', fontWeight: 800, margin: '0 0 6px', fontFamily: 'var(--font-sans)' }}>{g.d}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 6 항아리 모델 */}
      <h2 style={sectionTitle}>🏺 6 항아리 모델이란?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          <strong>T. Harv Eker</strong>의 재정 분배 모델(JARS). 그의 책 &quot;Secrets of the Millionaire Mind&quot;에서
          널리 알려진 방법으로, 수입을 6개 카테고리에 비율로 배분해 균형 잡힌 재정 관리를 합니다.
        </p>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>생활비 (NEC) 55%</strong> — 의식주·교통·통신 등 기본 생활</li>
          <li><strong style={{ color: 'var(--text)' }}>교육·자기개발 (EDU) 10%</strong> — 책·강의·자격증 (한국에선 자녀 교육 포함)</li>
          <li><strong style={{ color: 'var(--text)' }}>놀이·취미 (PLAY) 10%</strong> — 즐거움·여행·외식</li>
          <li><strong style={{ color: 'var(--text)' }}>저축·재정자유 (FFA) 10%</strong> — 비상금·단기 저축</li>
          <li><strong style={{ color: 'var(--text)' }}>장기 투자 (LTSS) 10%</strong> — 주식·연금·부동산</li>
          <li><strong style={{ color: 'var(--text)' }}>기부·나눔 (GIVE) 5%</strong> — 기부·후원·선물</li>
        </ul>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ※ 한국 상황에서는 월세·통신비가 비싸 NEC 60~65%, 기부 0~3%로 현실적으로 조정하기도 합니다.
          항아리는 <strong>별도 계좌·통장</strong>으로 관리하면 가장 효과적이에요.
        </p>
      </div>

      {/* 4. 절세 상품 비교 */}
      <h2 style={sectionTitle}>🌱 청년미래적금 vs ISA vs 연금저축 비교</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>상품</th>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>자격</th>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>한도/년</th>
                <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>핵심 혜택</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['청년미래적금', '만 19~34세 + 소득 요건', '600만원 (월 50만원)', '정부기여금 일반형 6%·우대형 12% (2026.6 출시)'],
                ['ISA', '만 19세↑', '2,000만원', '200만원 비과세 + 9.9% 분리과세'],
                ['연금저축', '만 18세↑', '600만원', '세액공제 16.5% (연 99만원 환급)'],
                ['IRP', '근로자·자영업자', '900만원 (저축 합산)', '연 148만원 환급 (저축 합산)'],
                ['주택청약', '무주택자', '300만원', '소득공제 40% (120만원 한도)'],
                ['청년도약계좌', '기존 가입자만 (신규 2025.12 종료)', '840만원', '정부 기여금 월 최대 약 3.3만원 + 비과세'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '9px 12px',
                      fontFamily: j === 0 ? 'var(--font-sans)' : (j === 2 ? 'var(--font-sans)' : 'inherit'),
                      color: j === 0 || j === 3 ? 'var(--text)' : 'var(--muted)',
                      fontWeight: j === 0 ? 700 : (j === 2 ? 600 : 400),
                      fontSize: 13,
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, background: 'var(--bg3)' }}>
          <strong style={{ color: 'var(--text)' }}>우선순위 추천</strong>:
          청년이라면 <strong>청년미래적금 → 주택청약 → ISA → 연금저축</strong> 순(청년도약계좌 기존 가입자는 만기 유지 우선),
          30~40대 직장인은 <strong>연금저축 600 → IRP 추가 (총 900) → ISA</strong> 순이 일반적입니다.
        </div>
      </div>

      {/* 5. 변동비 절감 팁 */}
      <h2 style={sectionTitle}>💸 변동비 절감 5가지 팁</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>외식·배달 30% 줄이기</strong> — 점심 도시락 + 주말 1회 외식 → 월 5~10만원 절약</li>
          <li><strong>구독 서비스 정리</strong> — OTT·음악·뉴스 중복 정리 → 월 2~5만원 (본인이 매일 쓰는 1~2개만)</li>
          <li><strong>커피·카페 가계부 작성</strong> — 1잔 5,000원 × 매일 = 월 15만원, 텀블러·홈카페로 대체</li>
          <li><strong>충동 구매 24시간 룰</strong> — 장바구니 담고 24시간 후 결정 (대부분 사고 싶은 마음 사라짐)</li>
          <li><strong>고정비도 1년에 한 번 점검</strong> — 통신사·보험·구독 매년 비교 → 30% 절감 가능</li>
        </ol>
      </div>

      {/* FAQ — 최근 도구들과 동일 포맷 */}
      <section>
        <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
        <FaqJsonLd items={FAQ_LD} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQ_LD.map((f, i) => (
            <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
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

      {/* 면책 */}
      <Disclaimer
        variant="finance"
        open
        sources={[
          { label: '금융위원회', href: 'https://www.fsc.go.kr' },
          { label: '국세청', href: 'https://www.nts.go.kr' },
        ]}
      >
        본 계산기의 저축률 진단·목표 역산은 단순 복리 모델 기반 참고용 추정치입니다. 청년미래적금 기여금·가입 요건, ISA·연금저축 한도와 세율 등 절세 상품 조건은 연도별로 변동되므로, 가입·투자 전 금융위원회·서민금융진흥원·국세청과 취급 금융기관의 최신 공고를 확인하세요.
      </Disclaimer>

      {/* 관련 도구 — 최신 도구들과 동일 포맷 */}
      <section style={{ marginTop: '40px' }}>
        <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { href: '/tools/finance/salary',      icon: '💰', name: '연봉 실수령액 계산기',  desc: '4대보험·세금 + 월 실수령' },
            { href: '/tools/finance/compound',    icon: '📈', name: '복리 계산기',           desc: '거치·적립·목표역산·시나리오' },
            { href: '/tools/finance/dividend',    icon: '💰', name: '월배당 목표 자산',      desc: '은퇴 자산 + 배당 ETF 시뮬' },
            { href: '/tools/finance/inheritance', icon: '🏛️', name: '상속·증여세 계산기',     desc: '관계별 공제·10년 합산' },
            { href: '/tools/finance/loan',        icon: '💳', name: '대출이자 계산기',       desc: '원리금균등·갈아타기·중도상환' },
            { href: '/tools/finance/housing-score', icon: '🏠', name: '청약 가점 계산기',    desc: '84점 만점 자동 + 특공 자가진단' },
          ].map((tool, i) => (
            <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '22px' }}>{tool.icon}</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </ToolPage>
  )
}
