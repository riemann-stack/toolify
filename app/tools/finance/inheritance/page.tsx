import Link from 'next/link'
import InheritanceClient from './InheritanceClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/finance/inheritance',
  title: '상속·증여세 비교 계산기 2026 — 절세 시뮬레이션',
  description: '상속세와 증여세를 비교하는 간편 계산기. 관계별 공제, 10년 합산 규정, 배우자 상속공제, 분할 증여 시뮬레이션. 세무사 상담 전 참고용.',
  keywords: ['상속세계산기', '증여세계산기', '상속증여비교', '증여세공제', '상속세공제', '분할증여계산기', '자녀증여세', '배우자상속공제'],
})

const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const sectionTitle: React.CSSProperties = {
  fontFamily: 'Syne, sans-serif',
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

export default function InheritancePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏛️ 상속·증여세 비교 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        지금 증여할지, 나중에 상속할지 — 같은 재산을 옮길 때 세금 부담이 어떻게 달라지는지 비교해보세요. 관계별 공제·10년 합산·배우자 공제·분할 증여 시뮬레이션을 한 번에.
      </p>

      {/* 상단 면책 */}
      <div style={{
        background: 'rgba(255, 107, 107, 0.06)',
        border: '1px solid rgba(255, 107, 107, 0.25)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '32px',
        fontSize: '13px',
        color: 'var(--text)',
        lineHeight: 1.7,
      }}>
        ⚖️ <strong style={{ color: '#FF8C8C' }}>본 계산기는 단순 참고용 정보 도구입니다.</strong><br />
        실제 상속세·증여세는 재산 종류별 평가, 공제 적용 여부, 신고 시점, 사전 증여 이력, 채무 등 복합적 요소에 따라 실제 납부액과 크게 다를 수 있습니다.<br />
        절세 여부 판단 및 정확한 신고는 반드시 세무사와 상담하시기 바랍니다.<br />
        <span style={{ color: 'var(--muted)' }}>참고: 2026년 기준 상속세 및 증여세법</span>
      </div>

      <InheritanceClient />

      {/* 1. 증여세 공제 한도표 */}
      <h2 style={sectionTitle}>📋 증여세 핵심 공제 한도 (2026년 기준)</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        증여 공제는 <strong style={{ color: 'var(--text)' }}>10년간 합산</strong>되어 적용됩니다. 즉, 동일인에게서 받은 증여는 10년 단위로 누적 계산되며, 누적 합계가 공제 한도를 넘는 부분만 과세됩니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>관계</th>
              <th style={headCell}>10년 공제 한도</th>
              <th style={headCell}>비고</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}>🟡 배우자</td>
              <td style={cell}><strong>6억원</strong></td>
              <td style={cell}>10년간 합산</td>
            </tr>
            <tr>
              <td style={cell}>🟢 성인 자녀</td>
              <td style={cell}><strong>5천만원</strong></td>
              <td style={cell}>직계비속 (만 19세 이상)</td>
            </tr>
            <tr>
              <td style={cell}>🔵 미성년 자녀</td>
              <td style={cell}><strong>2천만원</strong></td>
              <td style={cell}>만 19세 미만</td>
            </tr>
            <tr>
              <td style={cell}>🟠 부모</td>
              <td style={cell}><strong>5천만원</strong></td>
              <td style={cell}>직계존속</td>
            </tr>
            <tr>
              <td style={cell}>⚪ 기타 친족</td>
              <td style={cell}><strong>1천만원</strong></td>
              <td style={cell}>6촌 혈족·4촌 인척</td>
            </tr>
            <tr>
              <td style={cell}>⚫ 타인</td>
              <td style={cell}><strong>0원</strong></td>
              <td style={cell}>공제 없음</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. 상속세 공제 항목 */}
      <h2 style={sectionTitle}>🏛️ 상속세 주요 공제 항목</h2>
      <div style={card}>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--text)' }}>
          <li><strong>일괄공제 5억원</strong> — 기초공제(2억) + 인적공제(자녀 1인당 5천만원 등) 합계와 비교해 큰 금액 적용</li>
          <li><strong>배우자 상속공제 최소 5억 ~ 최대 30억</strong> — 실제 배우자 상속분 기준</li>
          <li><strong>금융재산공제</strong> — 금융재산의 20% (최대 2억원)</li>
          <li><strong>동거주택공제</strong> — 주택 가액의 100% (최대 6억, 10년 이상 동거 등 조건 충족 시)</li>
          <li><strong>장례비 공제</strong> — 실제 사용액 (1천만원 한도, 봉안시설 별도 5백만원)</li>
        </ul>
      </div>

      {/* 3. 세율표 */}
      <h2 style={sectionTitle}>📊 증여세·상속세 세율표 (동일 누진 구조)</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>과세표준</th>
              <th style={headCell}>세율</th>
              <th style={headCell}>누진공제</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}>1억원 이하</td>
              <td style={cell}><strong style={{ color: '#3EFF9B' }}>10%</strong></td>
              <td style={cell}>-</td>
            </tr>
            <tr>
              <td style={cell}>1억 초과 ~ 5억 이하</td>
              <td style={cell}><strong style={{ color: '#C8FF3E' }}>20%</strong></td>
              <td style={cell}>1천만원</td>
            </tr>
            <tr>
              <td style={cell}>5억 초과 ~ 10억 이하</td>
              <td style={cell}><strong style={{ color: '#FFB83E' }}>30%</strong></td>
              <td style={cell}>6천만원</td>
            </tr>
            <tr>
              <td style={cell}>10억 초과 ~ 30억 이하</td>
              <td style={cell}><strong style={{ color: '#FF8C3E' }}>40%</strong></td>
              <td style={cell}>1억 6천만원</td>
            </tr>
            <tr>
              <td style={cell}>30억 초과</td>
              <td style={cell}><strong style={{ color: '#FF6B6B' }}>50%</strong></td>
              <td style={cell}>4억 6천만원</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 산출세액 = 과세표준 × 세율 − 누진공제. 예) 과세표준 2억 → 2억 × 20% − 1천만원 = <strong style={{ color: 'var(--text)' }}>3천만원</strong>.
        법정 신고기한 내 자진신고 시 산출세액의 3% 추가 공제됩니다.
      </p>

      {/* 4. 분할 증여 절세 전략 */}
      <h2 style={sectionTitle}>📐 분할 증여 절세 전략 (참고용)</h2>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
        ※ 이 내용은 절세 조언이 아닌 법적 공제 한도 안내입니다.
      </p>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>사례 1 — 자녀에게 1억원 증여</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '8px' }}>
          ① <strong style={{ color: 'var(--text)' }}>자녀 1명에게 1억 일괄 증여</strong> → 과세표준 5천만원 → 산출세액 약 500만원
        </p>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          ② <strong style={{ color: 'var(--text)' }}>자녀 2명에게 각 5천만원 증여</strong> → 각자 공제 범위 내 → 세금 <strong style={{ color: '#3EFF9B' }}>0원</strong>
        </p>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>사례 2 — 10년 주기 활용</h3>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--muted)' }}>
          <li><strong style={{ color: 'var(--text)' }}>2024년</strong> 자녀에게 5천만원 증여 → 세금 0원</li>
          <li><strong style={{ color: 'var(--text)' }}>2034년</strong> 추가 5천만원 증여 → 새 10년 주기 시작 → 세금 0원</li>
          <li>20년간 자녀 1인당 1억원 비과세 증여 가능</li>
        </ul>
      </div>

      {/* 5. 상속 vs 증여 선택 기준 */}
      <h2 style={sectionTitle}>⚖️ 상속세 vs 증여세 선택 기준 (참고용)</h2>

      <div style={{ ...card, borderTop: '3px solid #FF8C3E' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', color: '#FF8C3E' }}>📌 상속이 유리할 수 있는 경우</h3>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--text)' }}>
          <li>배우자가 있어 대규모 배우자 공제(최대 30억) 적용이 가능한 경우</li>
          <li>총 재산이 5억 이하 (일괄공제 범위 내)인 경우</li>
          <li>사전 증여 없이 상속인이 많아 인적공제·일괄공제 효과가 큰 경우</li>
        </ul>
      </div>

      <div style={{ ...card, borderTop: '3px solid #3EC8FF' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', color: '#3EC8FF' }}>📌 증여가 유리할 수 있는 경우</h3>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--text)' }}>
          <li>재산이 향후 크게 증가할 것으로 예상될 때 미리 이전</li>
          <li>자녀가 여럿이어서 분산 효과가 큰 경우</li>
          <li>10년 주기 공제를 여러 번 활용할 시간적 여유가 있는 경우</li>
        </ul>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        ※ 위 내용은 일반적인 참고 사항이며 개인 상황에 따라 결과가 달라집니다.
      </p>

      {/* 6. FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Q. 10년 내 증여액이 합산된다는 게 무슨 의미인가요?</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          동일인에게서 10년 이내에 증여받은 금액은 모두 합산해서 공제 한도와 세율을 계산합니다. 예를 들어 2020년에 3천만원, 2024년에 4천만원을 자녀에게 증여하면 합계 7천만원에서 공제 5천만원을 뺀 <strong style={{ color: 'var(--text)' }}>2천만원이 과세표준</strong>이 됩니다.
        </p>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Q. 사망 전 증여는 상속세에 포함되나요?</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          상속 개시일(사망일) <strong style={{ color: 'var(--text)' }}>10년 이내에 상속인에게 증여한 재산</strong>은 상속세 계산 시 상속재산에 합산됩니다. 따라서 사망 직전에 급하게 증여해도 상속세 절세 효과가 없을 수 있습니다. 비상속인의 경우 5년 이내 증여분이 합산됩니다.
        </p>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Q. 배우자 상속공제는 얼마나 되나요?</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          배우자가 실제로 상속받은 금액에 대해 <strong style={{ color: 'var(--text)' }}>최소 5억원, 최대 30억원</strong>까지 공제됩니다. 법정 상속분 이내의 실제 취득 금액과 30억원 중 작은 금액이 공제됩니다. 배우자가 있으면 상속세 부담이 크게 줄어드는 가장 큰 공제 항목입니다.
        </p>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Q. 부동산을 증여할 때 세금 기준은 무엇인가요?</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          원칙적으로 <strong style={{ color: 'var(--text)' }}>시가(실거래가, 감정평가액)</strong>를 기준으로 하며, 시가 산정이 어려운 경우 공시가격(주택은 공시가격, 토지는 개별공시지가)을 적용합니다. 공시가격이 시가보다 낮은 경우가 많아 절세 효과가 있을 수 있지만, 국세청이 시가 적용을 강화하는 추세입니다.
        </p>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Q. 미성년 자녀 공제는 2천만원인데 성년이 되면 추가로 받을 수 있나요?</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
          네. 성인이 된 후 새로운 10년 주기가 시작되면 <strong style={{ color: 'var(--text)' }}>5천만원 공제</strong>를 받을 수 있습니다. 단, 미성년 시절 증여와 성인 후 증여를 합산할 때 10년 이내 금액은 계속 합산 적용되므로 타이밍을 잘 계획해야 합니다.
        </p>
      </div>

      {/* 7. 함께 쓰면 좋은 도구 */}
      <h2 style={sectionTitle}>🔗 함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        <Link href="/tools/finance/compound" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📈</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>복리 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>증여 후 자산 성장 시뮬레이션</div>
        </Link>
        <Link href="/tools/finance/salary" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💴</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>연봉 실수령액 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>세후 소득 파악</div>
        </Link>
        <Link href="/tools/finance/loan" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💳</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>대출이자 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>부동산 관련 금융 계획</div>
        </Link>
        <Link href="/tools/finance/dividend" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💰</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>월배당 목표 자산 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>상속 자산 운용 계획</div>
        </Link>
      </div>

      {/* 하단 면책 재강조 */}
      <div style={{
        background: 'rgba(255, 107, 107, 0.06)',
        border: '1px solid rgba(255, 107, 107, 0.25)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginTop: '32px',
        fontSize: '13px',
        color: 'var(--muted)',
        lineHeight: 1.7,
      }}>
        ⚖️ 본 페이지의 모든 계산 결과·전략 안내는 <strong style={{ color: '#FF8C8C' }}>참고용</strong>이며, 법령 개정·개별 상황·재산 평가에 따라 실제 세액은 달라집니다. 중요한 의사결정 전 반드시 세무사·변호사 등 전문가와 상담하세요.
      </div>
    </div>
  )
}
