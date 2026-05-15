import Link from 'next/link'
import SupplementClient from './SupplementClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/health/supplement',
  title: '영양제 중복 체크 계산기 — 중복 합산·상한·약물 상호작용·임산부 안전 | Youtil',
  description: '50종 영양소 자동 합산, 권장량·상한 비교, 오메가3 EPA+DHA 합산, 약물 상호작용(항응고제·갑상선약·항생제 등) 체크, 임산부·고령자·청소년 안전 모드까지. 한국 식약처 기준.',
  keywords: [
    '영양제중복체크', '영양제성분체크', '영양제같이먹어도되나', '비타민D중복', '영양제상한량',
    '영양제복용조합', '영양제계산기', '오메가3합산', 'EPA DHA',
    '영양제약물상호작용', '임산부영양제', '고령자영양제', '갑상선약철분',
    '항응고제비타민E', 'PPI비타민B12', '센트룸실버', '임산부엽산',
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

export default function SupplementPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·웰빙</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💊 영양제 중복 체크 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        50종 영양소 자동 합산·권장량/상한 비교 + <strong style={{ color: 'var(--text)' }}>오메가3 EPA+DHA 합산·약물 상호작용·임산부·고령자 안전 체크</strong>까지.
        시너지·주의 조합, 복용 타이밍 가이드도 한 번에.
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
        ⚕️ <strong style={{ color: '#FF8C8C' }}>본 도구는 「성분 정보 정리」 참고용입니다.</strong> 의학적 진단·처방·복용 권유 도구가 아닙니다.
        처방약 복용 중·임신·수유 중·만성질환·65세 이상·18세 미만은 반드시 의사·약사 상담.<br />
        도움: 한국 식약처 식품안전정보 <strong style={{ color: '#FF8C8C' }}>1577-1255</strong> · 의약품안전사용서비스 <strong style={{ color: '#FF8C8C' }}>1577-2334</strong><br />
        <span style={{ color: 'var(--muted)', fontSize: 12 }}>참고: 한국영양학회, 보건복지부 한국인 영양소 섭취 기준 (2026)</span>
      </div>

      <SupplementClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 중복 TOP 5 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 중복되는 성분 TOP 5</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { rank: '1', name: '비타민D',   desc: '종합비타민 + 비타민D 단독 + 칼슘+D 복합제에 모두 포함' },
              { rank: '2', name: '비타민C',   desc: '종합비타민 + 비타민C 단독 + 콜라겐 제품에 모두 포함' },
              { rank: '3', name: '아연',      desc: '종합비타민 + 면역력 제품 + 남성 건강 제품에 포함' },
              { rank: '4', name: '엽산',      desc: '종합비타민 + 임산부용 + 비타민B복합체에 포함' },
              { rank: '5', name: '마그네슘',  desc: '종합비타민 + 수면 보조 + 근육 이완 제품에 포함' },
            ].map((item) => (
              <div key={item.rank} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--accent)', minWidth: '26px' }}>{item.rank}</span>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>주요 영양소 1일 권장량 & 상한 섭취량</h2>
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
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'Inter, system-ui, sans-serif' }}>{row[1]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'Inter, system-ui, sans-serif', color: '#FF8C3E' }}>{row[2]}</td>
                    <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, color: 'var(--muted)', fontSize: 12 }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. 복용 타이밍 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>복용 타이밍 완전 가이드</h2>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>주의해야 할 조합 5가지</h2>
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

        {/* 5. 오메가3 EPA + DHA 합산 가이드 (NEW) */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>🐟 오메가3 EPA + DHA 합산 가이드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            오메가3는 EPA + DHA <strong style={{ color: 'var(--text)' }}>합산</strong>으로 평가하는 게 표준입니다.
            본 도구의 「성분 분석」 탭에서 자동 합산.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>EPA + DHA 합산</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: '#3EC8FF', fontWeight: 700 }}>구간</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>설명</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}>250mg 미만</td><td style={cell}><strong style={{ color: '#FFD700' }}>🟡 권장 미달</strong></td><td style={cell}>식사 (등푸른 생선) 보충 권장</td></tr>
                <tr><td style={cell}>250~500mg</td><td style={cell}><strong style={{ color: '#3EFF9B' }}>🟢 적정 (일반 권장)</strong></td><td style={cell}>WHO·미국심장협회 일반 권장 범위</td></tr>
                <tr><td style={cell}>500~3,000mg</td><td style={cell}><strong style={{ color: '#FF8C3E' }}>🟠 약간 초과 (안전)</strong></td><td style={cell}>심혈관 치료 목적이면 의사 상담</td></tr>
                <tr><td style={cell}>3,000mg 초과</td><td style={cell}><strong style={{ color: '#FF6B6B' }}>🔴 상한 초과</strong></td><td style={cell}>FDA 상한 초과 — 출혈 위험 ↑, 즉시 조정</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ※ 일반 건강 목적 EPA+DHA 250~500mg/일 / 심혈관 치료 1,000mg+ (의사 처방). rTG 형태 &gt; EE 형태 (흡수율).
          </p>
        </div>

        {/* 6. 약물별 영양제 주의 (NEW) */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>💊 약물별 영양제 주의 가이드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            처방약 복용 중에는 영양제와 상호작용으로 흡수가 방해되거나 부작용이 생길 수 있습니다.
            본 도구의 「약물·특수 상황」 탭에서 약물 선택 시 자동 매칭.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>약물</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: '#FF6B6B', fontWeight: 700 }}>주의 영양제</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>대응</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}>🩸 항응고제 (와파린·아스피린)</td><td style={cell}>비타민E·K·오메가3·강황</td><td style={cell}>출혈 위험 ↑ → 의사 상담</td></tr>
                <tr><td style={cell}>🦋 갑상선약 (신지로이드)</td><td style={cell}>철분·칼슘·마그네슘</td><td style={cell}>흡수 큰 폭 방해 → 4시간 간격</td></tr>
                <tr><td style={cell}>💊 항생제 (테트라사이클린)</td><td style={cell}>칼슘·마그네슘·철분</td><td style={cell}>흡수 방해 → 2시간 간격</td></tr>
                <tr><td style={cell}>🦴 골다공증약 (비스포스포네이트)</td><td style={cell}>칼슘·철분·마그네슘</td><td style={cell}>골다공증약 후 2시간 이상</td></tr>
                <tr><td style={cell}>💗 혈압약 (ACE·ARB)</td><td style={cell}>칼륨</td><td style={cell}>고칼륨혈증 위험 → 주치의 상담</td></tr>
                <tr><td style={cell}>🍬 당뇨약</td><td style={cell}>크롬·알파리포산</td><td style={cell}>혈당 변화 가능</td></tr>
                <tr><td style={cell}>🫃 위산억제제 (PPI)</td><td style={cell}>비타민B12·철분·칼슘·마그네슘</td><td style={cell}>장기 복용 시 결핍 → 주기적 검사</td></tr>
                <tr><td style={cell}>🫀 콜레스테롤약 (스타틴)</td><td style={cell}>코엔자임Q10 (보충 권장) / 나이아신 고용량 X</td><td style={cell}>CoQ10 보충 OK</td></tr>
                <tr><td style={cell}>🧠 우울증약 (SSRI)</td><td style={cell}>오메가3 (시너지 가능)</td><td style={cell}>긍정적 — 의사와 협의</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ⚠️ 본 데이터는 가장 흔한 패턴만 표시. 정확한 평가는 단골 약사·주치의 상담 필수.
          </p>
        </div>

        {/* 7. 임산부·수유부 가이드 (NEW) */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>🤰 임산부·수유부 영양제 가이드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            <div style={{ background: 'rgba(62,255,155,0.04)', border: '1px solid rgba(62,255,155,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#3EFF9B', fontWeight: 700, marginBottom: 8 }}>✅ 임신 시 권장</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, lineHeight: 1.85, color: 'var(--muted)' }}>
                <li>엽산 600~800μg (신경관 결손 예방, 임신 전 3개월부터)</li>
                <li>철분 27mg (빈혈 예방)</li>
                <li>요오드 150μg 정확</li>
                <li>DHA 200mg+ (태아 뇌·시각)</li>
                <li>콜린 450mg (뇌 발달)</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#FF6B6B', fontWeight: 700, marginBottom: 8 }}>⚠️ 임신 시 주의</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, lineHeight: 1.85, color: 'var(--muted)' }}>
                <li>비타민A 레티놀 고용량 (3,000μg+) — 1삼분기 기형아 위험. 베타카로틴 형태로 변경</li>
                <li>비타민D 4,000IU 초과 — 태아 위험</li>
                <li>성요한초 — 안전성 미입증</li>
                <li>카페인 200mg/일 이하 (커피 1~2잔)</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 12 }}>
            ※ 임산부 전용 종합비타민 권장. 산부인과 상담 필수. 본 도구의 「약물·특수 상황」 탭에서 「임신 중」 모드 선택 시 자동 체크.
          </p>
        </div>

        {/* 8. 고령자(65세+) 가이드 (NEW) */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>👴 65세 이상 고령자 영양제 가이드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            <div style={{ background: 'rgba(62,255,155,0.04)', border: '1px solid rgba(62,255,155,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#3EFF9B', fontWeight: 700, marginBottom: 8 }}>✅ 고령자 권장 추가</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, lineHeight: 1.85, color: 'var(--muted)' }}>
                <li>비타민D 800~1,000IU (낙상·골절 예방)</li>
                <li>칼슘 1,200mg (남 1,000 / 여 1,200)</li>
                <li>비타민B12 2.4μg+ (위산 ↓로 흡수 ↓)</li>
                <li>오메가3 EPA+DHA 250mg+ (심혈관)</li>
                <li>마그네슘 (부족 흔함, 수면·근육)</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#FF6B6B', fontWeight: 700, marginBottom: 8 }}>⚠️ 고령자 주의</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, lineHeight: 1.85, color: 'var(--muted)' }}>
                <li>비타민E 400IU 초과 X (출혈 위험)</li>
                <li>철분 결핍 진단 X면 비섭취 (산화 스트레스)</li>
                <li>약물 복용률 ↑ → 상호작용 주의</li>
                <li>「실버 종합비타민」 권장</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 9. 시너지 조합 (NEW) */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>🟢 영양제 시너지 조합 (상호 보완)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { pair: '비타민D + 칼슘',     desc: '비타민D는 칼슘 흡수를 50%+ 향상' },
              { pair: '비타민C + 철분',     desc: '비타민C가 비헴철 흡수율 3배 향상' },
              { pair: '마그네슘 + 비타민B6', desc: 'B6가 마그네슘 세포 흡수와 활용 도움' },
              { pair: '비타민E + 셀레늄',   desc: '두 항산화제 시너지 — 활성산소 제거 효과 ↑' },
              { pair: '아연 + 비타민C',     desc: '면역력 강화 시너지' },
              { pair: '프로 + 프리바이오틱스', desc: '유산균 + 유산균 먹이 시너지' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(62,255,155,0.04)', border: '1px solid rgba(62,255,155,0.30)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#3EFF9B', fontWeight: 700, marginBottom: 4 }}>✅ {s.pair}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 10. FAQ (accordion - salary style) */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { q: '종합비타민과 개별 비타민을 같이 먹어도 되나요?', a: '종합비타민에 이미 여러 성분이 포함되어 있어 개별 비타민을 추가하면 중복 과잉이 될 수 있습니다. 특히 비타민 A·D·E, 철분, 아연은 상한량 초과에 주의해야 합니다. 본 계산기로 각 성분의 합산량을 먼저 확인하세요.' },
              { q: '수용성 비타민은 과잉 섭취해도 괜찮나요?', a: '비타민C·B군 등 수용성 비타민은 소변으로 배출되어 지용성 비타민(A·D·E·K)보다 축적 위험이 낮습니다. 하지만 비타민C 2,000mg 이상은 신장 결석 위험, 비타민B6 100mg 이상 장기 복용은 신경 손상 가능성이 있습니다. 수용성도 상한량 초과는 주의가 필요합니다.' },
              { q: '영양제와 약을 같이 먹을 때 주의사항은?', a: '오메가3·비타민E는 혈액 응고를 억제해 항응고제(와파린 등)와 상호작용할 수 있습니다. 칼슘·마그네슘은 일부 항생제 흡수를 방해하고, 철분은 갑상선약(신지로이드 등)과 4시간 이상 간격이 필요합니다. 본 도구의 「약물·특수 상황」 탭에서 자동 체크 가능. 처방약 복용 중이라면 반드시 의사·약사와 상담하세요.' },
              { q: '영양제는 언제 먹는 게 가장 효과적인가요?', a: '지용성 비타민(A·D·E·K)과 오메가3·코엔자임Q10은 지방이 포함된 식사 후가 흡수율이 높습니다. 철분은 공복에 비타민C와 함께 복용하면 흡수율이 올라가지만 위 자극이 강하면 식후 복용도 가능합니다. 마그네슘은 저녁에 복용하면 수면 개선 효과를 볼 수 있습니다.' },
              { q: '이 계산기로 나온 결과를 믿어도 되나요?', a: '본 계산기는 공개된 영양소 섭취 기준(한국영양학회, WHO)을 바탕으로 성분 합산량을 정리하는 참고용 도구입니다. 개인의 건강 상태, 체중, 기저 질환, 복용 약물에 따라 적정 섭취량이 달라질 수 있으므로 의사·약사와 상담하는 것을 권장합니다.' },
              { q: '오메가3 EPA와 DHA를 따로 보지 않고 합산해도 되나요?', a: '일반 건강 목적에서는 EPA+DHA 합산 기준이 더 의미 있습니다 (WHO·미국심장협회 250~500mg/일). 다만 심혈관 (EPA 비중 ↑) / 뇌·시각 (DHA 비중 ↑) / 우울증 (EPA ↑) / 임산부 (DHA ↑) 등 목적에 따라 비율도 고려. 본 도구가 자동 합산 표시.' },
              { q: '임산부는 어떤 영양제를 먹어야 하나요?', a: '임산부 전용 종합비타민 권장. 핵심: 엽산 600~800μg (신경관 결손 예방), 철분 27mg (빈혈 예방), 요오드 150μg, DHA 200mg+, 콜린 450mg. 주의: 비타민A 레티놀 고용량 X (베타카로틴 OK), 성요한초 X. 본 도구의 「약물·특수 상황」 탭 「임신 중」 모드에서 자동 체크.' },
              { q: '65세 이상 고령자는 일반 종합비타민으로 충분한가요?', a: '충분하지 않을 수 있습니다. 고령자 권장 추가: 비타민D 800~1,000IU, B12 2.4μg+, 칼슘 1,200mg, 오메가3 EPA+DHA 250mg+, 마그네슘. 주의: 비타민E 고용량 X, 약물 복용률 ↑로 상호작용 주의. 「실버 종합비타민」 권장.' },
              { q: '영양제 라벨 보고 입력하기 어려운데 도움이 있나요?', a: '본 도구의 「영양제 등록」 탭 빠른 입력 프리셋에서 종합비타민·비타민D 1,000~5,000IU·오메가3 (rTG)·임산부 종합비타민·프로바이오틱스·글루코사민·콜라겐 등 인기 제품 자동 입력 가능. 정확한 성분량은 제품마다 다를 수 있으니 라벨 확인 후 조정 권장.' },
              { q: '본 도구는 영양제를 추천해주나요?', a: '아닙니다. 본 도구는 일반 정보 제공 목적의 「성분 정보 정리」 참고용이며, 영양제 권유·복용 처방 도구가 아닙니다. 영양제는 식품(한국 식약처 분류)이며 효과·안전성은 의약품 수준 평가 X. 「많이 먹을수록 좋다」는 절대 X — 영양제는 부족분 보충용이며, 균형 잡힌 식단이 우선. 영양 상태 정확 평가는 혈액 검사 (병원·건강검진) 권장.' },
            ].map((faq, i) => (
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
        </div>

        {/* 11. 면책 강화 */}
        <div style={{
          background: 'rgba(255, 107, 107, 0.06)',
          border: '1px solid rgba(255, 107, 107, 0.30)',
          borderRadius: '12px',
          padding: '18px 20px',
          fontSize: '12.5px',
          color: 'var(--muted)',
          lineHeight: 1.85,
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#FF8C8C', marginBottom: 10 }}>⚕️ 면책 조항 (강화)</p>
          <p style={{ marginBottom: 8 }}>
            본 영양제 중복 체크 계산기는 <strong style={{ color: 'var(--text)' }}>일반 정보 제공 도구</strong>입니다.
            의학적 진단·처방·복용 권유 도구가 아닙니다.
          </p>
          <ul style={{ paddingLeft: 18, marginBottom: 10 }}>
            <li>영양제는 식품, 약 X (한국 식약처 분류)</li>
            <li>효과·안전성은 의약품 수준 평가 X</li>
            <li>개인의 건강 상태·약물에 따라 영향 다름</li>
            <li>라벨 표시량 vs 실제 함량 차이 가능</li>
            <li>정책·기준 변경 가능</li>
          </ul>
          <p style={{ marginBottom: 6, color: 'var(--text)', fontWeight: 600 }}>다음 경우 반드시 의료 전문가 상담:</p>
          <ul style={{ paddingLeft: 18, marginBottom: 10 }}>
            <li>처방약 복용 중</li>
            <li>임신·수유 중</li>
            <li>만성질환 (당뇨·간·신장·심혈관·갑상선)</li>
            <li>65세 이상 / 18세 미만</li>
            <li>영양제 부작용 의심</li>
            <li>효과 미흡 또는 의심</li>
          </ul>
          <p style={{ marginBottom: 6, color: 'var(--text)', fontWeight: 600 }}>도움 받기:</p>
          <ul style={{ paddingLeft: 18 }}>
            <li>단골 약사 상담 (가장 빠르고 정확)</li>
            <li>한국 식약처 식품안전정보: <strong style={{ color: '#FF8C8C' }}>1577-1255</strong></li>
            <li>의약품안전사용서비스: <strong style={{ color: '#FF8C8C' }}>1577-2334</strong></li>
            <li>한국임상영양학회</li>
          </ul>
          <p style={{ marginTop: 10, color: 'var(--text)', fontWeight: 600 }}>
            ⚠️ &ldquo;많이 먹을수록 좋다&rdquo;는 절대 X. 영양제는 부족분 보충용이며, 균형 잡힌 식단이 우선.
            영양 상태 정확 평가는 혈액 검사 (병원·건강검진) 권장.
          </p>
        </div>

        {/* 7. 관련 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
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
