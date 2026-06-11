import Link from 'next/link'
import InheritanceClient from './InheritanceClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/finance/inheritance',
  title: '상속·증여세 계산기 2026 — 분배·배우자공제·10년 주기 절세 | Youtil',
  description: '관계별 공제·10년 합산·배우자 공제 반영한 정확한 상속·증여세. 상속인별 분배와 분산 증여 시뮬레이션으로 절세 전략까지.',
  keywords: [
    '상속세계산기', '증여세계산기', '상속증여비교', '증여세공제', '상속세공제',
    '분할증여계산기', '자녀증여세', '배우자상속공제', '법정상속분',
    '10년 합산 증여', '분산 증여', '미성년 자녀 증여', '한국 상속세',
    '유류분', '상속인 분배', '부동산 증여', '부담부증여',
  ],
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

const FAQ_LD = [
          {
            q: '10년 내 증여액이 합산된다는 게 무슨 의미인가요?',
            a: '동일인에게서 10년 이내에 증여받은 금액은 모두 합산해서 공제 한도와 세율을 계산합니다. 예: 2020년에 3천만원, 2024년에 4천만원을 자녀에게 증여하면 합계 7천만원에서 공제 5천만원을 뺀 2천만원이 과세표준이 됩니다.',
          },
          {
            q: '사망 전 증여는 상속세에 포함되나요?',
            a: '상속 개시일(사망일) 10년 이내에 상속인에게 증여한 재산은 상속세 계산 시 상속재산에 합산됩니다. 따라서 사망 직전에 급하게 증여해도 상속세 절세 효과가 없을 수 있습니다. 비상속인의 경우 5년 이내 증여분이 합산됩니다.',
          },
          {
            q: '배우자 상속공제는 얼마나 되나요?',
            a: '배우자가 실제로 상속받은 금액에 대해 최소 5억원, 최대 30억원까지 공제됩니다. 법정상속분 이내의 실제 취득 금액과 30억원 중 작은 금액이 공제됩니다. 「상속세 계산」 탭에서 실제 상속분에 따른 정량 시뮬을 자동 표시합니다.',
          },
          {
            q: '부동산을 증여할 때 세금 기준은 무엇인가요?',
            a: '원칙적으로 시가(실거래가, 감정평가액)를 기준으로 하며, 시가 산정이 어려운 경우 공시가격(주택은 공시가격, 토지는 개별공시지가)을 적용합니다. 공시가격이 시가보다 낮은 경우가 많아 절세 효과가 있을 수 있지만, 국세청이 시가 적용을 강화하는 추세입니다. 본 도구의 「부동산 증여 모드」에서 단순 추정 가능.',
          },
          {
            q: '미성년 자녀 공제는 2천만원인데 성년이 되면 추가로 받을 수 있나요?',
            a: '네. 성인이 된 후 새로운 10년 주기가 시작되면 5천만원 공제를 받을 수 있습니다. 단, 미성년 시절 증여와 성인 후 증여를 합산할 때 10년 이내 금액은 계속 합산 적용되므로 타이밍을 잘 계획해야 합니다.',
          },
          {
            q: '배우자 + 자녀 2명일 때 법정상속분은 어떻게 되나요?',
            a: '한국 민법 기준: 배우자 1.5, 자녀 각 1. 합계 비율 3.5에서 배우자 = 1.5/3.5 = 약 43%(3/7), 자녀 각 = 1/3.5 = 약 29%(2/7). 예: 총 7억 상속 시 배우자 3억, 자녀 1·2 각 2억. 협의 분할 시 다르게 나눌 수 있지만 유류분(법정 × 1/2) 침해 시 분쟁 가능. 본 도구의 「상속인별 분배」 탭에서 자동 계산.',
          },
          {
            q: '배우자가 상속을 더 많이 받으면 세금이 더 줄어드나요?',
            a: '법정상속분 한도까지는 줄어듭니다. 배우자 상속공제는 최소 5억 / 최대 30억 / 법정상속분 한도 적용. 예: 총 20억 / 배우자 + 자녀 2명 / 법정 한도 약 8.57억. 배우자 5억 → 공제 5억(최소) / 배우자 8.57억(법정) → 공제 8.57억 / 배우자 15억(협의) → 공제 8.57억(한도 X). ⚠️ 배우자 사망 시 2차 상속세 발생 — 단기 절세 + 장기 가족 계획 종합 고려.',
          },
          {
            q: '부모님과 조부모님 모두에게 증여받으면 공제가 별도인가요?',
            a: '부분적으로 별도, 부분적으로 합산. 부·모는 각자 다른 증여자(별도 5천만 가능)지만 직계존속 합산 5천만 기준으로 종합 검토 필요. 조부모는 직계존속 별도 5천만이지만 세대생략 30% 가산세(부모 살아 있을 때 손자녀 직접 증여 시). 며느리·사위 등 인척은 1천만 별도. 복잡한 경우 세무사 상담 필수.',
          },
          {
            q: '사망 직전에 자녀에게 증여하면 상속세 절세되나요?',
            a: '효과 없습니다. 사망 10년 이내 상속인 증여는 상속세에 자동 합산. 사망 5년 이내 비상속인 증여도 합산. 따라서 사망 1년 전 증여 → 상속세 합산(절세 X), 사망 11년 전 증여 → 미합산(절세 효과). 증여세 절세는 건강한 시기에 미리 시작해야 효과. 10년·20년 단위 장기 계획 권장.',
          },
          {
            q: '부동산 증여는 증여세만 내면 되나요?',
            a: '아닙니다. 다음 모두 별도 발생: ① 증여세(수증자), ② 취득세(시가표준액의 3.5~12%, 조정대상지역 다주택 12%), ③ 자금출처 소명(수증자), ④ 양도세(부담부증여 시 증여자), ⑤ 재산세(이전 후). 부동산 증여 1건 자문료 50~100만원이지만 잘못된 신고 시 가산세·과태료가 훨씬 큽니다. 세무사 상담 필수.',
          },
          {
            q: '유류분이란 무엇인가요?',
            a: '유류분은 유언으로도 침해할 수 없는 상속인의 최소 권리입니다. 배우자·직계비속(자녀)은 법정상속분 × 1/2, 직계존속(부모)은 법정상속분 × 1/3입니다. 형제자매의 유류분은 2024년 4월 25일 헌법재판소 위헌 결정(민법 1112조 4호)으로 폐지되었습니다. 예: 배우자 + 자녀 2명 / 자녀 법정상속분 2/7 → 유류분 1/7. 유언으로 일부 상속인을 배제하면 유류분 청구권 행사 가능 — 분쟁 발생. 본 도구의 「상속인별 분배」 탭에서 유류분 자동 표시.',
          },
          {
            q: '본 계산기는 절세 자문에 사용해도 되나요?',
            a: '아닙니다. 본 도구는 일반 정보 제공 목적의 단순 참고용 도구이며, 세무 자문·신고 도구가 아닙니다. 상속·증여 분야는 가장 복잡한 세무 영역이며, 부동산·부담부증여는 매우 단순한 추정만 제공합니다. 정확한 신고는 세무사·홈택스 권장. 한국세무사회 무료 상담 070-5008-1234, 국세청 126.',
          },
        ]

export default function InheritancePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏛️ 상속·증여세 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        관계별 공제·10년 합산·배우자 공제 반영한 정확한 세액 + <strong style={{ color: 'var(--text)' }}>분산 증여 시뮬레이션</strong>.
      </p>

      <UpdatedMeta date="2026년 5월" basis="2026년 상속·증여세법 기준" sources={[{"label":"국세청","href":"https://www.nts.go.kr"},{"label":"홈택스","href":"https://hometax.go.kr"}]} />

      <InheritanceClient />

      {/* 1. 증여세 공제 한도표 (기존 SEO 보존) */}
      <h2 style={sectionTitle}>📋 증여세 공제 한도 (2026년 기준)</h2>
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
            <tr><td style={cell}>배우자</td><td style={cell}><strong>6억원</strong></td><td style={cell}>10년간 합산</td></tr>
            <tr><td style={cell}>성인 자녀</td><td style={cell}><strong>5천만원</strong></td><td style={cell}>직계비속 (만 19세 이상)</td></tr>
            <tr><td style={cell}>미성년 자녀</td><td style={cell}><strong>2천만원</strong></td><td style={cell}>만 19세 미만</td></tr>
            <tr><td style={cell}>부모·조부모</td><td style={cell}><strong>5천만원</strong></td><td style={cell}>직계존속 합산</td></tr>
            <tr><td style={cell}>손자녀</td><td style={cell}><strong>5천만원</strong></td><td style={cell}>세대생략 30% 가산</td></tr>
            <tr><td style={cell}>며느리·사위</td><td style={cell}><strong>1천만원</strong></td><td style={cell}>인척</td></tr>
            <tr><td style={cell}>기타 친족</td><td style={cell}><strong>1천만원</strong></td><td style={cell}>6촌 혈족·4촌 인척</td></tr>
            <tr><td style={cell}>타인</td><td style={cell}><strong>0원</strong></td><td style={cell}>공제 없음</td></tr>
          </tbody>
        </table>
      </div>

      {/* 2. 상속세 공제 항목 (기존 SEO 보존·강화) */}
      <h2 style={sectionTitle}>🏛️ 상속세 주요 공제 항목</h2>
      <div style={card}>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--text)' }}>
          <li><strong>일괄공제 5억원</strong> — 기초공제(2억) + 인적공제(자녀 1인당 5천만원 등) 합계와 비교해 큰 금액 적용</li>
          <li><strong>배우자 상속공제 최소 5억 ~ 최대 30억</strong> — 실제 배우자 상속분 기준, 법정상속분 한도 적용</li>
          <li><strong>금융재산공제</strong> — 순금융재산 2천만 이하 전액 · 1억 이하 2천만 · 초과분 20% (최대 2억원)</li>
          <li><strong>동거주택공제</strong> — 주택 가액의 100% (최대 6억, 10년 이상 동거 등 조건 충족 시)</li>
          <li><strong>장례비 공제</strong> — 실제 사용액 (1천만원 한도, 봉안시설 별도 5백만원)</li>
        </ul>
      </div>

      {/* 3. 세율표 (기존 SEO 보존) */}
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
            <tr><td style={cell}>1억원 이하</td><td style={cell}><strong style={{ color: '#059669' }}>10%</strong></td><td style={cell}>-</td></tr>
            <tr><td style={cell}>1억 초과 ~ 5억 이하</td><td style={cell}><strong style={{ color: '#0EA5E9' }}>20%</strong></td><td style={cell}>1천만원</td></tr>
            <tr><td style={cell}>5억 초과 ~ 10억 이하</td><td style={cell}><strong style={{ color: '#D97706' }}>30%</strong></td><td style={cell}>6천만원</td></tr>
            <tr><td style={cell}>10억 초과 ~ 30억 이하</td><td style={cell}><strong style={{ color: '#EA580C' }}>40%</strong></td><td style={cell}>1억 6천만원</td></tr>
            <tr><td style={cell}>30억 초과</td><td style={cell}><strong style={{ color: '#DC2626' }}>50%</strong></td><td style={cell}>4억 6천만원</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 산출세액 = 과세표준 × 세율 − 누진공제. 예) 과세표준 2억 → 2억 × 20% − 1천만원 = <strong style={{ color: 'var(--text)' }}>3천만원</strong>.
        법정 신고기한 내 자진신고 시 산출세액의 3% 추가 공제됩니다.
      </p>

      {/* 4. 법정상속분 가이드 (NEW) */}
      <h2 style={sectionTitle}>👨‍👩‍👧‍👦 법정상속분 가이드</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
        한국 민법 기준 — 배우자는 다른 상속인보다 0.5만큼 더 많이 받습니다 (1.5 : 1).
        본 도구의 「상속인별 분배」 탭에서 자동 계산.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>가족 구성</th>
              <th style={headCell}>배우자</th>
              <th style={headCell}>자녀</th>
              <th style={headCell}>부모</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['배우자 + 자녀 1명',     '3/5 (60%)',  '2/5 (40%)',   '—'],
              ['배우자 + 자녀 2명',     '3/7 (43%)',  '각 2/7 (29%)', '—'],
              ['배우자 + 자녀 3명',     '3/9 (33%)',  '각 2/9 (22%)', '—'],
              ['배우자만 (자녀·부모 X)', '100%',        '—',           '—'],
              ['자녀만 (배우자 X)',     '—',           '각 1/n',      '—'],
              ['배우자 + 부모 (자녀 X)','3/7 (43%)',  '—',           '각 2/7'],
              ['부모만',                '—',          '—',           '각 1/n'],
            ].map((row, i) => (
              <tr key={i}>
                <td style={cell}>{row[0]}</td>
                <td style={cell}>{row[1]}</td>
                <td style={cell}>{row[2]}</td>
                <td style={cell}>{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        ※ 협의 분할 시 법정 비율과 다르게 나눌 수 있습니다. 다만 <strong style={{ color: '#EA580C' }}>유류분 (법정상속분 × 1/2)</strong> 침해 시 분쟁 가능.
      </p>

      {/* 5. 배우자 상속공제 정량 가이드 (NEW) */}
      <h2 style={sectionTitle}>💍 배우자 상속공제 — 실제 상속분에 따른 차이</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
        배우자가 실제 상속받은 금액에 대해 <strong style={{ color: 'var(--text)' }}>최소 5억, 최대 30억</strong> 공제 (법정상속분 한도 내).
        본 도구의 「상속세 계산」 탭에서 자동 시뮬.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <p style={{ fontSize: '12px', color: 'var(--muted)', padding: '10px 14px', margin: 0, background: 'var(--bg3)' }}>
          예시 — 총 상속 20억 / 배우자 + 자녀 2명 / 법정한도 약 8.57억 (일괄공제 5억 별도 반영)
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>배우자 실제 상속</th>
              <th style={headCell}>적용 공제</th>
              <th style={headCell}>과세표준</th>
              <th style={headCell}>상속세 (대략)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>0원 (포기)</td><td style={cell}>5억 (최소)</td><td style={cell}>10억</td><td style={cell}>약 2.33억</td></tr>
            <tr><td style={cell}>5억</td><td style={cell}>5억</td><td style={cell}>10억</td><td style={cell}>약 2.33억</td></tr>
            <tr><td style={cell}>7억</td><td style={cell}>7억</td><td style={cell}>8억</td><td style={cell}>약 1.75억</td></tr>
            <tr><td style={cell}>8.57억 (법정)</td><td style={cell}><strong style={{ color: 'var(--accent)' }}>8.57억 ★</strong></td><td style={cell}>6.43억</td><td style={cell}><strong style={{ color: 'var(--accent)' }}>약 1.29억</strong></td></tr>
            <tr><td style={cell}>10억</td><td style={cell}>8.57억 (한도)</td><td style={cell}>6.43억</td><td style={cell}>약 1.29억</td></tr>
            <tr><td style={cell}>15억</td><td style={cell}>8.57억 (한도)</td><td style={cell}>6.43억</td><td style={cell}>약 1.29억</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 배우자가 법정상속분(약 8.57억)까지 받으면 공제 효과 최대. 그 이상 받아도 추가 공제 X.
        다만 배우자 사망 시 2차 상속세 발생(이중과세) — 가족 상황·자녀 나이 종합 고려.
      </p>

      {/* 6. 10년 주기 활용 (NEW) */}
      <h2 style={sectionTitle}>📅 10년 주기 활용 — 30년 절세 계획</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
        10년마다 새로운 공제 한도가 시작됩니다. 일찍 시작할수록 비과세 증여 효과 ↑.
      </p>
      <div style={card}>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--text)' }}>
          <li><strong>2026년 (자녀 5세)</strong>: 미성년 2,000만 증여</li>
          <li><strong>2034년 (자녀 13세)</strong>: 추가 2,000만 (10년 후 새 주기)</li>
          <li><strong>2044년 (자녀 23세, 성인)</strong>: 추가 5,000만</li>
          <li><strong>2054년 (자녀 33세)</strong>: 추가 5,000만</li>
          <li><strong>2064년 (자녀 43세)</strong>: 추가 5,000만</li>
        </ul>
        <p style={{ fontSize: '13px', color: 'var(--accent)', marginTop: 12, fontWeight: 700 }}>
          → 자녀 1명 기준 총 1억 9,000만 비과세 증여 가능
        </p>
        <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
          ⚠️ 단, 재산 변동·법령 개정·사망 시점 등 변수 다양. 장기 계획은 세무사·변호사와 상담 권장.
          부와 모가 각자 증여하면 위 금액의 2배 가능.
        </p>
      </div>

      {/* 7. 사전증여 합산 주의 (NEW) */}
      <h2 style={sectionTitle}>⚠️ 사전증여 합산 — 사망 직전 증여는 효과 X</h2>
      <div style={{ ...card, borderTop: '3px solid #DC2626' }}>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--text)' }}>
          <li><strong>사망 10년 이내 상속인 증여</strong>는 상속세에 자동 합산</li>
          <li><strong>사망 5년 이내 비상속인 증여</strong>도 합산 (예: 손자녀, 며느리)</li>
          <li>사망 11년 전 증여는 상속세 미합산 → 절세 효과</li>
          <li>증여세 절세는 <strong style={{ color: '#DC2626' }}>건강한 시기에 미리 시작</strong>해야 효과</li>
        </ul>
      </div>

      {/* 8. 신고 기한 (NEW) */}
      <h2 style={sectionTitle}>📆 상속·증여세 신고 기한</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
        <div style={{ ...card, borderTop: '3px solid #EA580C', marginBottom: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#EA580C', marginBottom: 8 }}>🏛️ 상속세</p>
          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, lineHeight: 1.85, color: 'var(--text)' }}>
            <li>사망일 후 <strong>6개월 이내</strong> 신고·납부</li>
            <li>재외동포는 9개월</li>
            <li>자진신고 시 산출세액의 <strong style={{ color: 'var(--accent)' }}>3% 세액공제</strong></li>
          </ul>
        </div>
        <div style={{ ...card, borderTop: '3px solid var(--accent)', marginBottom: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>💝 증여세</p>
          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, lineHeight: 1.85, color: 'var(--text)' }}>
            <li>증여일 후 <strong>3개월 이내</strong> 신고·납부</li>
            <li>다음 달 말일 X — 증여일로부터 3개월</li>
            <li>자진신고 시 <strong style={{ color: 'var(--accent)' }}>3% 세액공제</strong></li>
          </ul>
        </div>
      </div>

      {/* 9. 부동산 증여 시 주의사항 */}
      <h2 style={sectionTitle}>🏠 부동산 증여 시 주의사항</h2>
      <div style={{ ...card, borderTop: '3px solid #EA580C' }}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginBottom: 10 }}>
          부동산 증여는 <strong>증여세 외에 다음이 모두 별도 발생</strong>합니다:
        </p>
        <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, lineHeight: 1.9, color: 'var(--text)' }}>
          <li><strong>취득세</strong> (수증자 부담): 일반 3.5% / 다주택자 8% / 조정대상지역 다주택 12%</li>
          <li><strong>양도세</strong> (부담부증여 시 증여자 부담)</li>
          <li><strong>재산세</strong> (이전 후 매년)</li>
          <li><strong>자금출처 소명</strong> (수증자가 자금 출처를 입증)</li>
          <li><strong>시가 vs 공시가격</strong> — 원칙은 시가, 시가 산정 어려우면 공시가</li>
        </ul>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginTop: 10 }}>
          본 도구는 <strong style={{ color: '#EA580C' }}>증여세·취득세만 단순 추정</strong>합니다.
          부동산 증여 1건 자문료 50~100만원이지만, 잘못된 신고 시 가산세·과태료가 훨씬 큽니다.
          부담부증여는 양도세까지 얽혀 가장 복잡한 세무 영역 — 반드시 세무사·변호사 상담 후 진행 권장.
        </p>
      </div>

      {/* 10. 상속 vs 증여 선택 기준 (기존 SEO 보존) */}
      <h2 style={sectionTitle}>⚖️ 상속세 vs 증여세 선택 기준 (참고용)</h2>
      <div style={{ ...card, borderTop: '3px solid #EA580C' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', color: '#EA580C' }}>📌 상속이 유리할 수 있는 경우</h3>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--text)' }}>
          <li>배우자가 있어 대규모 배우자 공제(최대 30억) 적용이 가능한 경우</li>
          <li>총 재산이 5억 이하 (일괄공제 범위 내)인 경우</li>
          <li>사전 증여 없이 상속인이 많아 인적공제·일괄공제 효과가 큰 경우</li>
        </ul>
      </div>
      <div style={{ ...card, borderTop: '3px solid #0891B2' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', color: '#0891B2' }}>📌 증여가 유리할 수 있는 경우</h3>
        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.9, color: 'var(--text)' }}>
          <li>재산이 향후 크게 증가할 것으로 예상될 때 미리 이전</li>
          <li>자녀가 여럿이어서 분산 효과가 큰 경우</li>
          <li>10년 주기 공제를 여러 번 활용할 시간적 여유가 있는 경우</li>
        </ul>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        ※ 위 내용은 일반적인 참고 사항이며 개인 상황에 따라 결과가 달라집니다.
      </p>

      {/* 11. FAQ (accordion - salary style) */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {FAQ_LD.map((faq, i) => (
          <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
              Q{i + 1}. {faq.q}
            </summary>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}>
              {faq.a}
            </p>
          </details>
        ))}
      </div>

      {/* 12. 함께 쓰면 좋은 도구 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/finance/compound" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📈</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>복리 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>증여 후 자산 성장 시뮬레이션</div>
        </Link>
        <Link href="/tools/finance/dividend" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💰</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>월배당 목표 자산</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>상속 자산 운용</div>
        </Link>
        <Link href="/tools/finance/loan" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💳</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>대출이자 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>부동산 자금 계획</div>
        </Link>
        <Link href="/tools/finance/salary" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💰</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>연봉 실수령액</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>세후 소득 파악</div>
        </Link>
      </div>

    </div>
  )
}
