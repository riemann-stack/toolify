import type { Metadata } from 'next'
import Link from 'next/link'
import SupplementClient from './SupplementClient'

export const metadata: Metadata = {
  title: '영양제 성분 체크 계산기 — 중복 성분 합산·상한량 초과 확인 | Youtil',
  description: '여러 영양제의 중복 성분을 합산하고 1일 상한 섭취량 초과 여부를 확인합니다. 시너지·주의 조합, 복용 타이밍 가이드 제공. 비타민D·철분·아연·칼슘 중복 체크.',
  keywords: ['영양제중복체크', '영양제성분체크', '영양제같이먹어도되나', '비타민D중복', '영양제상한량', '영양제복용조합', '영양제계산기'],
}

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

export default function SupplementPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💊 영양제 성분 체크 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        여러 영양제를 등록하면 중복 성분을 합산하고 1일 권장량·상한 섭취량과 비교해드려요. 시너지·주의 조합과 복용 타이밍 가이드까지 한 번에 확인하세요.
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
        ⚕️ <strong style={{ color: '#FF8C8C' }}>본 계산기는 영양제 성분 정보를 정리하는 참고용 도구입니다.</strong><br />
        의학적 진단이나 복용 처방이 아니며, 개인의 건강 상태·약물 복용 여부에 따라 적절한 섭취량이 다를 수 있습니다. 영양제 복용 전 의사·약사와 상담하시기 바랍니다.<br />
        <span style={{ color: 'var(--muted)', fontSize: 12 }}>참고: 한국영양학회, 보건복지부 한국인 영양소 섭취 기준</span>
      </div>

      <SupplementClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 중복 TOP 5 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 중복되는 성분 TOP 5</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { rank: '1', name: '비타민D',   desc: '종합비타민 + 비타민D 단독 + 칼슘+D 복합제에 모두 포함' },
              { rank: '2', name: '비타민C',   desc: '종합비타민 + 비타민C 단독 + 콜라겐 제품에 모두 포함' },
              { rank: '3', name: '아연',      desc: '종합비타민 + 면역력 제품 + 남성 건강 제품에 포함' },
              { rank: '4', name: '엽산',      desc: '종합비타민 + 임산부용 + 비타민B복합체에 포함' },
              { rank: '5', name: '마그네슘',  desc: '종합비타민 + 수면 보조 + 근육 이완 제품에 포함' },
            ].map((item) => (
              <div key={item.rank} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--accent)', minWidth: '26px' }}>{item.rank}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>{item.name}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. RDA/UL 표 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>주요 영양소 1일 권장량 & 상한 섭취량</h2>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>한국영양학회 · 성인 기준</p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr>
                  <th style={headCell}>영양소</th>
                  <th style={headCell}>권장량</th>
                  <th style={headCell}>상한량</th>
                  <th style={headCell}>초과 주의사항</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['비타민A', '700μg',   '3,000μg', '간 독성, 임산부 기형아 위험'],
                  ['비타민D', '600IU',   '4,000IU', '고칼슘혈증, 신장 결석'],
                  ['비타민C', '100mg',   '2,000mg', '소화 장애, 신장 결석'],
                  ['비타민E', '15mg',    '1,000mg', '출혈 위험 증가'],
                  ['비타민B6','1.5mg',   '100mg',   '신경 손상 (고용량 장기)'],
                  ['엽산',    '400μg',   '1,000μg', 'B12 결핍 마스킹'],
                  ['철분',    '8~18mg',  '45mg',    '소화 장애, 장기 손상'],
                  ['아연',    '8~11mg',  '40mg',    '구리 흡수 방해, 면역 저하'],
                  ['셀레늄',  '55μg',    '400μg',   '탈모, 신경 손상'],
                  ['칼슘',    '800mg',   '2,500mg', '심혈관 위험, 신장 결석'],
                  ['마그네슘','310mg',   '350mg',   '설사 (보충제 기준)'],
                  ['요오드',  '150μg',   '1,100μg', '갑상선 기능 이상'],
                ].map((row, i, arr) => (
                  <tr key={i}>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontWeight: 600, color: 'var(--accent)' }}>{row[0]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'Syne, sans-serif' }}>{row[1]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'Syne, sans-serif', color: '#FF8C3E' }}>{row[2]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, color: 'var(--muted)', fontSize: 12 }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. 복용 타이밍 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>복용 타이밍 완전 가이드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              {
                title: '🍽️ 식후 (지용성)',
                items: ['비타민 A·D·E·K', '오메가3(EPA/DHA)', '코엔자임Q10', '루테인·지아잔틴'],
                tip: '식이지방과 함께 흡수율 최대 50% 향상',
              },
              {
                title: '🕗 공복/식전',
                items: ['비타민C (단독)', '철분 (+비타민C 조합)', '프로바이오틱스 (위산 낮을 때)'],
                tip: '공복 철분은 위 자극 강할 수 있음',
              },
              {
                title: '☀️ 아침 권장',
                items: ['비타민B군 (에너지 대사)', '비타민C (항산화)'],
                tip: '저녁에 먹으면 수면 방해 가능',
              },
              {
                title: '🌙 저녁/취침 전',
                items: ['마그네슘 (근육 이완)', '칼슘 (야간 골 흡수)', '프로바이오틱스 (위산 적은 시간)'],
                tip: '수면 질 개선 효과도 기대',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>{item.title}</p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {item.items.map((t, j) => (
                    <li key={j} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>• {t}</li>
                  ))}
                </ul>
                <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border)', lineHeight: 1.6 }}>💡 {item.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 주의 조합 5 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>주의해야 할 조합 5가지</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { pair: '철분 + 칼슘',          text: '칼슘이 철분 흡수를 방해합니다. 2시간 이상 간격 두고 복용하세요.' },
              { pair: '아연 과잉 + 구리',      text: '아연 장기 고용량 복용 시 구리 결핍 위험. 아연:구리 비율 8~15:1 유지.' },
              { pair: '비타민E 고용량 + 항응고제', text: '출혈 위험 증가. 와파린 등 항응고제 복용 중이라면 반드시 의사 상담.' },
              { pair: '셀레늄 + 브라질너트',   text: '브라질너트 1알에 셀레늄 상한량에 근접. 보충제와 동시 섭취 시 독성 위험.' },
              { pair: '비타민A + 레티놀 화장품', text: '경피 흡수도 소량 축적됩니다. 고용량 비타민A 보충제와 중복 고려.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(255, 140, 62, 0.06)', border: '1px solid rgba(255, 140, 62, 0.3)', borderRadius: '12px', padding: '14px 18px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFB86B', marginBottom: '4px' }}>⚡ {item.pair}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. FAQ */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '종합비타민과 개별 비타민을 같이 먹어도 되나요?', a: '종합비타민에 이미 여러 성분이 포함되어 있어 개별 비타민을 추가하면 중복 과잉이 될 수 있습니다. 특히 비타민 A·D·E, 철분, 아연은 상한량 초과에 주의해야 합니다. 본 계산기로 각 성분의 합산량을 먼저 확인하세요.' },
              { q: '수용성 비타민은 과잉 섭취해도 괜찮나요?', a: '비타민C·B군 등 수용성 비타민은 소변으로 배출되어 지용성 비타민(A·D·E·K)보다 축적 위험이 낮습니다. 하지만 비타민C 2,000mg 이상은 신장 결석 위험, 비타민B6 100mg 이상 장기 복용은 신경 손상 가능성이 있습니다. 수용성도 상한량 초과는 주의가 필요합니다.' },
              { q: '영양제와 약을 같이 먹을 때 주의사항은?', a: '오메가3·비타민E는 혈액 응고를 억제해 항응고제(와파린 등)와 상호작용할 수 있습니다. 칼슘·마그네슘은 일부 항생제 흡수를 방해하고, 철분은 갑상선약(신지로이드 등)과 2시간 이상 간격이 필요합니다. 처방약 복용 중이라면 반드시 의사·약사와 상담하세요.' },
              { q: '영양제는 언제 먹는 게 가장 효과적인가요?', a: '지용성 비타민(A·D·E·K)과 오메가3·코엔자임Q10은 지방이 포함된 식사 후가 흡수율이 높습니다. 철분은 공복에 비타민C와 함께 복용하면 흡수율이 올라가지만 위 자극이 강하면 식후 복용도 가능합니다. 마그네슘은 저녁에 복용하면 수면 개선 효과를 볼 수 있습니다.' },
              { q: '이 계산기로 나온 결과를 믿어도 되나요?', a: '본 계산기는 공개된 영양소 섭취 기준(한국영양학회, WHO)을 바탕으로 성분 합산량을 정리하는 참고용 도구입니다. 개인의 건강 상태, 체중, 기저 질환, 복용 약물에 따라 적정 섭취량이 달라질 수 있으므로 의사·약사와 상담하는 것을 권장합니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent)', marginBottom: '8px' }}>Q. {item.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. 하단 면책 */}
        <div style={{
          background: 'rgba(255, 107, 107, 0.06)',
          border: '1px solid rgba(255, 107, 107, 0.25)',
          borderRadius: '12px',
          padding: '14px 18px',
          fontSize: '12.5px',
          color: 'var(--muted)',
          lineHeight: 1.8,
          textAlign: 'center',
        }}>
          ⚕️ 본 계산기의 수치는 <strong style={{ color: '#FF8C8C' }}>한국영양학회·보건복지부 한국인 영양소 섭취 기준</strong>을 참고한 일반적인 성인 기준입니다.<br />
          임산부, 수유부, 소아, 기저 질환자, 처방약 복용자는 반드시 전문 의료인과 상담 후 복용하시기 바랍니다.
        </div>

        {/* 7. 관련 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/health/bmr',  emoji: '🔥', name: '기초대사량 계산기', desc: '하루 칼로리 관리' },
              { href: '/tools/health/bmi',  emoji: '⚖️', name: 'BMI 계산기',        desc: '체질량지수 확인' },
              { href: '/tools/cooking/nuts', emoji: '🌰', name: '견과류 섭취량 계산기', desc: '영양소 일일 기준' },
              { href: '/tools/health/pet',  emoji: '🐾', name: '반려동물 칼로리',    desc: '반려견·묘 급이량' },
            ].map((t) => (
              <Link key={t.href} href={t.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>{t.emoji}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>{t.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
