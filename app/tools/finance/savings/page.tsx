import Link from 'next/link'
import SavingsClient from './SavingsClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import UpdatedMeta from '@/components/UpdatedMeta'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/finance/savings',
  title: '저축액 계산기 — 저축률 진단 + 6 항아리 + 청년도약·ISA·연금저축',
  description: '수입·지출 → 저축률과 한국 평균 비교 + 6 항아리 분배. 청년도약·ISA·연금저축 절세 시나리오와 목표 역산까지.',
  keywords: ['저축률 계산', '월 저축 가능 금액', '한국 평균 저축률', '6 항아리 모델', '청년도약계좌', 'ISA 계좌', '연금저축', 'IRP', '재무 진단', '목표 금액 역산'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
  marginTop: '40px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '20px 22px',
  marginBottom: '14px',
}

const FAQ_LD = [
            {
              q: '한국인 평균 저축률은 얼마인가요?',
              a: '통계청 가계동향조사 기준 <strong>가구 평균 저축률은 약 15~20%</strong>입니다. 단, 이 수치는 부채 상환·연금 납입을 제외한 순저축률이며, 청년·고령층은 더 낮고 30~40대 가구주는 25% 정도까지 올라갑니다. 본인이 평균 이상이면 일단 양호하지만, 재정 자유·내 집 마련 목표라면 30%+ 권장입니다.',
            },
            {
              q: '사회 초년생은 월급의 몇 %를 저축해야 하나요?',
              a: '<strong>30~40%</strong> 권장입니다. 월급 250만원이면 75~100만원 저축이 목표. 왜냐하면 ① 부양 부담이 가장 적은 시기, ② 복리 효과가 가장 큰 시기 (1년 빠른 저축 = 30년 후 큰 차이), ③ 결혼·내 집 마련·차량 구입 등 큰 지출 대비. 청년도약계좌는 정부 기여금까지 받을 수 있어 사회 초년생에게 1순위입니다.',
            },
            {
              q: '고정비와 변동비 구분 기준은?',
              a: '<strong>고정비</strong>는 매월 일정 금액이 자동으로 빠져나가며 단기간 줄이기 어려운 비용 — 월세·관리비·대출 원리금·통신비·교통비 정기권·보험료. <strong>변동비</strong>는 본인 의사로 조절 가능한 비용 — 식비·외식·쇼핑·문화·여행. 저축률 개선의 핵심은 <strong>변동비 30% 절감 + 고정비 1년에 한 번 재점검</strong>입니다.',
            },
            {
              q: '청년도약계좌 가입 자격이 어떻게 되나요?',
              a: '<strong>만 19~34세 + 개인소득 7,500만원 이하 + 가구소득 중위 250% 이하</strong>가 기본 조건입니다. 5년 만기, 월 최대 70만원 납입, 정부가 소득에 따라 월 최대 약 3.3만원(2025년 확대) 기여금을 더해 주고 만기 시 비과세. 5년 만기 시 약 5,000만원 자산 형성 가능. 단 중도해지 시 정부 지원금은 환수되니 5년 유지 가능한 금액으로 시작하세요.',
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
              a: '<strong>금리 비교가 핵심</strong>입니다. <strong>부채 금리 &gt; 저축 금리 + 4%p</strong>면 상환 우선(예: 신용대출 6%, 적금 3% → 상환 우선). 비슷하거나 부채 금리가 낮으면 비상금 6개월치 + 청년도약·세제혜택 한도까지는 저축 + 잉여로 상환. 고금리 부채(현금서비스·카드론 15%+)는 무조건 1순위 상환. 단, 최소 비상금 1~3개월치는 항상 확보하세요.',
            },
          ]

export default function SavingsPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        금융·재테크
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💰 저축액 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        수입·지출 → 저축률과 한국 평균 비교 + <strong style={{ color: 'var(--text)' }}>6 항아리 분배</strong>. 청년도약·ISA 절세 시뮬.
      </p>

      <UpdatedMeta date="2026년 5월" basis="2026년 절세 상품 기준·통계청 가계동향 평균 지출 참고" sources={[{"label":"통계청 KOSIS","href":"https://kosis.kr"},{"label":"서민금융진흥원 청년도약계좌","href":"https://ylaccount.kinfa.or.kr"},{"label":"국세청","href":"https://www.nts.go.kr"}]} />

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
          통계청 가계동향조사 기준 한국인 가구 평균 저축률은 <strong>15~20%</strong> 수준입니다.
          하지만 재정 자유·내 집 마련·은퇴 자산을 위해서는 더 높은 저축률이 필요해요.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 12 }}>
          {[
            { t: '20대 사회초년생', d: '30~40%', desc: '복리 효과 시작 시기. 결혼·내 집 자금 준비.', c: '#0D9488' },
            { t: '30대 미혼', d: '40~50%', desc: '소득 증가 + 부양 부담 적음. 황금 저축기.', c: '#059669' },
            { t: '30대 기혼', d: '30~40%', desc: '내 집 마련·결혼·양가 부양 시기.', c: '#0891B2' },
            { t: '40대 가족', d: '20~30%', desc: '교육비·주거비 정점. 일시 하락 OK.', c: '#D97706' },
            { t: '50대 은퇴 준비', d: '30~40%', desc: '자녀 독립 + 마지막 저축 골든타임.', c: '#EA580C' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 18, color: 'var(--text)', fontWeight: 800, margin: '0 0 6px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{g.d}</p>
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
      <h2 style={sectionTitle}>🌱 청년도약계좌 vs ISA vs 연금저축 비교</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
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
                ['청년도약계좌', '만 19~34세 + 소득 7,500↓', '840만원', '정부 기여금 월 최대 3.3만원 + 비과세'],
                ['ISA', '만 19세↑', '2,000만원', '200만원 비과세 + 9.9% 분리과세'],
                ['연금저축', '만 18세↑', '600만원', '세액공제 16.5% (연 99만원 환급)'],
                ['IRP', '근로자·자영업자', '900만원 (저축 합산)', '연 148만원 환급 (저축 합산)'],
                ['주택청약', '무주택자', '300만원', '소득공제 40% (120만원 한도)'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '9px 12px',
                      fontFamily: j === 0 ? 'Noto Sans KR, sans-serif' : (j === 2 ? 'Inter, "Noto Sans KR", system-ui, sans-serif' : 'inherit'),
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
          청년이라면 <strong>청년도약 → 주택청약 → ISA → 연금저축</strong> 순,
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
            <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '22px' }}>{tool.icon}</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
