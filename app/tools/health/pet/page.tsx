import Link from 'next/link'
import PetClient from './PetClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/health/pet',
  title: '반려동물 계산기 — 강아지·고양이 사람 나이·사료량·체중 평가',
  description:
    '강아지·고양이 사람 나이 + RER/DER 칼로리, 사료량(건식·습식), 체중 평가, 수명 진행률을 반려동물 한 카드로.',
  keywords: [
    '강아지나이계산기', '고양이나이계산기', '반려동물나이환산',
    '강아지사료량계산기', '고양이칼로리계산', '개나이사람나이', '강아지하루사료량',
    'RER 계산', 'DER 계산', '강아지 적정 체중', '평균 수명',
  ],
})

export default function PetPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·웰빙</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🐾 반려동물 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        강아지·고양이 사람 나이와 사료량·체중 평가·<strong style={{ color: 'var(--text)' }}>수명 진행률</strong>을 한눈에.
      </p>

      <PetClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 나이 환산표 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>강아지 나이 환산표</h2>
          <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['실제 나이', '소형견 (~10kg)', '중형견 (10~25kg)', '대형견 (25kg~)'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1세',  '15세', '15세',  '15세'],
                  ['2세',  '24세', '24세',  '24세'],
                  ['5세',  '36세', '37세',  '40세'],
                  ['10세', '56세', '60세',  '70세'],
                  ['15세', '76세', '83세',  '100세'],
                ].map(([age, s, m, l], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{age}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif', color: '#FFB347' }}>{s}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--text)' }}>{m}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--muted)' }}>{l}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>고양이 나이 환산표</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['실제 나이', '사람 나이', '생애 단계'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1세',  '15세', '키튼',       '#0891B2'],
                  ['2세',  '24세', '성묘',        '#059669'],
                  ['7세',  '44세', '시니어',      '#0EA5E9'],
                  ['11세', '60세', '슈퍼시니어',  '#EA580C'],
                  ['15세', '76세', '고령',        '#DC2626'],
                  ['20세', '96세', '초고령',      '#FF4444'],
                ].map(([age, human, stage, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{age}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, color: '#C084FC' }}>{human}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center' }}><span style={{ background: color + '22', border: `1px solid ${color}66`, borderRadius: '6px', padding: '2px 10px', fontSize: '12px', color }}>{stage}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 2. ×7 공식이 틀린 이유 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>강아지 나이 = ×7이 틀린 이유</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            &quot;개 나이 × 7 = 사람 나이&quot;는 오랫동안 통용된 속설이지만 수의학적으로 부정확합니다. 강아지는 첫 1~2년 동안 <strong style={{ color: 'var(--text)' }}>사람의 청소년기까지 극도로 빠르게</strong> 성장하며, 이후 품종 크기에 따라 노화 속도가 크게 달라집니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {[
              { title: '문제 1 — 초기 성장 속도 무시', color: '#FFB347', desc: '강아지 1세는 사람 나이로 약 15세(사춘기), 2세는 24세에 해당합니다. ×7 공식으로 계산하면 각각 7세, 14세가 되어 실제보다 훨씬 어린 나이가 됩니다.' },
              { title: '문제 2 — 품종 크기 차이 무시', color: '#C084FC', desc: '소형견(치와와, 말티즈)은 15~20년 이상 살지만, 대형견(그레이트데인)의 평균 수명은 7~10년입니다. 같은 ×7을 적용하면 노령 판단 기준이 완전히 달라집니다.' },
              { title: '2019년 UC샌디에이고 연구', color: '#059669', desc: '개의 DNA 메틸화 패턴을 분석한 결과, 인간과 개의 노화는 로그함수적으로 일치하며, 특히 초기 성장기에 개의 노화 속도가 훨씬 빠름이 밝혀졌습니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}25`, borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: item.color, marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. RER/DER 공식 (기존 유지 + 표 정확화) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>칼로리 계산 공식 (RER / DER)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,179,71,0.2)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: '#FFB347', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>RER — 기초 에너지 요구량 (Resting Energy Requirement)</p>
              <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>RER = 70 × 체중(kg)⁰·⁷⁵</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>완전한 안정 상태에서 생명 유지에 필요한 최소 칼로리입니다. 체중의 0.75 거듭제곱을 사용해 소형견과 대형견의 체표면적 차이를 반영합니다.</p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>DER — 일일 에너지 요구량 (Daily Energy Requirement)</p>
              <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '10px' }}>DER = RER × 생활계수</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>상황</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--accent)', fontWeight: 600 }}>계수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['퍼피 / 키튼 / 성장기',                    '× 2.5'],
                      ['중성화 + 활동 낮음 (실내)',              '× 1.2'],
                      ['중성화 + 활동 보통',                      '× 1.4'],
                      ['중성화 + 활동 높음',                      '× 1.6'],
                      ['미중성화 + 활동 낮음',                    '× 1.4'],
                      ['미중성화 + 활동 보통',                    '× 1.6'],
                      ['미중성화 + 활동 높음 (실외 고양이 포함)', '× 1.8'],
                      ['노령견·시니어 고양이',                    '× 1.1'],
                    ].map(([sit, fac], i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg3)' }}>
                        <td style={{ padding: '7px 8px', color: 'var(--muted)' }}>{sit}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{fac}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
                ⓘ 본 도구는 <strong style={{ color: 'var(--text)' }}>중성화 × 활동량 6가지 조합</strong>을 명시적 매핑 테이블로 정확히 반영합니다 (조건문 분기 누락 방지).
              </p>
            </div>
          </div>
        </section>

        {/* ── 4. 시나리오 예시 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>계산 예시</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {[
              {
                label: '예시 1',
                desc: '말티즈 4kg · 5세 · 중성화 · 실내',
                color: '#FFB347',
                items: ['사람 나이: 약 36세 (중년견)', 'RER: 70 × 4⁰·⁷⁵ ≈ 197kcal', 'DER: 197 × 1.4 ≈ 276kcal', '사료 권장량: 약 79g / 일 (350kcal/100g)'],
              },
              {
                label: '예시 2',
                desc: '골든리트리버 30kg · 3세 · 미중성화 · 활동적',
                color: '#C084FC',
                items: ['사람 나이: 약 28세 (청년견)', 'RER: 70 × 30⁰·⁷⁵ ≈ 862kcal', 'DER: 862 × 1.8 ≈ 1,552kcal', '사료 권장량: 약 443g / 일 (350kcal/100g)'],
              },
            ].map((ex, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${ex.color}30`, borderRadius: '14px', padding: '18px 20px' }}>
                <p style={{ fontSize: '11px', color: ex.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{ex.label}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>{ex.desc}</p>
                {ex.items.map((item, j) => (
                  <p key={j} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: ex.color, flexShrink: 0 }}>›</span>{item}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. 적정 체중 평가 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>적정 체중 평가</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '14px' }}>
            본 도구는 입력한 체중을 품종 크기 기준 정상 범위와 비교해 <strong style={{ color: 'var(--text)' }}>저체중·적정·과체중·비만 4단계</strong>로 자동 평가합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,179,71,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFB347', marginBottom: '8px' }}>🐶 강아지 정상 체중</p>
              <ul style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 초소형: <strong style={{ color: 'var(--text)' }}>1.5~5kg</strong></li>
                <li>· 소형: <strong style={{ color: 'var(--text)' }}>5~10kg</strong></li>
                <li>· 중형: <strong style={{ color: 'var(--text)' }}>10~25kg</strong></li>
                <li>· 대형: <strong style={{ color: 'var(--text)' }}>25~45kg</strong></li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(192,132,252,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#C084FC', marginBottom: '8px' }}>🐱 고양이 정상 체중</p>
              <ul style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 적정: <strong style={{ color: 'var(--text)' }}>3.0~5.5kg</strong></li>
                <li>· 과체중: 5.5~7.0kg</li>
                <li>· 비만: 7.0kg+</li>
                <li>· 일부 대형 품종(메인쿤·노르웨이숲)은 6~9kg 정상</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7 }}>
            ⓘ 정확한 BCS(Body Condition Score 1~9 또는 1~5)는 수의사가 갈비뼈·허리·복부를 직접 만져 평가합니다. 같은 체중이라도 골격·근육량·품종에 따라 달라질 수 있으니 연 1회 건강검진 시 수의사 평가를 권장합니다.
          </p>
        </section>

        {/* ── 6. 평균 수명 가이드 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>평균 수명 가이드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '14px' }}>
            본 도구는 품종 크기·생활 환경별 평균 수명과 진행률을 자동 계산합니다.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>구분</th>
                  <th style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>평균 수명</th>
                  <th style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>최장수</th>
                  <th style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>특징</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['초소형견', '14년', '18년+', '가장 오래 삽니다 (치와와·말티즈)'],
                  ['소형견',   '13년', '16년',  '치와와 출신은 18년+ 사례도 있음'],
                  ['중형견',   '12년', '15년',  ''],
                  ['대형견',   '10년', '13년',  '대형견은 노화 속도가 빠름'],
                  ['실내 고양이', '15년', '20년+', '실내·중성화 고양이는 18~20세 사례도 흔함'],
                  ['실외 고양이', '7년',  '10년',  '사고·질병 위험으로 평균 수명 ↓'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{row[1]}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{row[2]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '12px' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7 }}>
            ⓘ 평균 수명은 통계 평균이며 개체차가 매우 큽니다. 유전·식이·운동·검진·환경에 따라 평균보다 훨씬 오래 사는 사례 많습니다. 본 도구의 진행률은 보호자의 건강 관리 인식 도구이며 <strong style={{ color: 'var(--text)' }}>수명 예측이 아닙니다</strong>.
          </p>
        </section>

        {/* ── 7. 건식 vs 습식 vs 혼합 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>건식 vs 습식 사료 — 칼로리 밀도 차이</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>같은 일일 칼로리도 사료 종류에 따라 그램 수가 크게 다릅니다.</strong> 건식은 100g당 약 350~380kcal, 습식은 약 70~120kcal로 4배 정도 차이.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,179,71,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFB347', marginBottom: '6px' }}>건식 (Dry · Kibble)</p>
              <ul style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 칼로리 밀도: <strong style={{ color: 'var(--text)' }}>350~400kcal/100g</strong></li>
                <li>· 장점: 보관 편함·치석 ↓·가성비</li>
                <li>· 단점: 수분 부족 (약 10%)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(8,145,178,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#0891B2', marginBottom: '6px' }}>습식 (Wet · Pâté)</p>
              <ul style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 칼로리 밀도: <strong style={{ color: 'var(--text)' }}>70~120kcal/100g</strong></li>
                <li>· 장점: 수분 70~80%·기호성 ↑</li>
                <li>· 단점: 보관 어려움·가격 ↑</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>혼합 (건식 + 습식)</strong> — 한국에서 점점 표준이 되어가는 방식. 건식 70% + 습식 30% 비율 권장 — 보관·가성비는 건식, 수분·기호성은 습식으로 보완. 본 도구의 <strong style={{ color: 'var(--text)' }}>고양이 [건식+습식] 모드</strong>에서 자동 분배 그램 수를 계산합니다.
          </p>
        </section>

        {/* ── 8. 연령대별 건강 가이드 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>연령대별 건강 관리 가이드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
            {[
              { pet: '🐶 강아지', stage: '퍼피 (~1세)', color: '#0891B2', items: ['기본 백신 (디스템퍼·파보·홍역) 접종', '심장사상충 예방약 투여 시작', '중성화 수술 시기 상담 (6~12개월)'] },
              { pet: '🐶 강아지', stage: '성견 (1~7세)', color: '#059669', items: ['연 1회 건강검진 및 혈액검사', '치석 스케일링 (1~2년마다)', '심장사상충·외부기생충 예방 지속'] },
              { pet: '🐶 강아지', stage: '노령견 (7세~)', color: '#EA580C', items: ['반기 1회 건강검진으로 빈도 증가', '관절 건강 및 관절염 모니터링', '신장·간 기능 혈액검사 주기 점검'] },
              { pet: '🐱 고양이', stage: '키튼 (~1세)', color: '#0891B2', items: ['종합백신 (FVRCP) 접종 시리즈', '중성화 수술 시기 상담 (5~7개월)', '내·외부 기생충 예방'] },
              { pet: '🐱 고양이', stage: '성묘 (1~7세)', color: '#059669', items: ['연 1회 건강검진 및 혈액검사', '구강 건강·치석 관리', '체중 모니터링 및 비만 예방'] },
              { pet: '🐱 고양이', stage: '시니어·슈퍼시니어 (7세~)', color: '#EA580C', items: ['갑상선 기능 항진증 검사', '신장 기능 (BUN·크레아티닌) 정기 확인', '혈압 측정 및 인지 기능 저하 관찰'] },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>{item.pet}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: item.color, marginBottom: '10px' }}>{item.stage}</p>
                {item.items.map((it, j) => (
                  <p key={j} style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <span style={{ color: item.color, flexShrink: 0 }}>•</span>{it}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── 9. FAQ (accordion) — 기존 5개 + 신규 2개 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '강아지 나이를 사람 나이로 곱하기 7을 하면 안 되나요?',
                a: '단순 7배 공식은 부정확합니다. 강아지는 첫 2년간 매우 빠르게 성장(1세≈15세, 2세≈24세)하며, 이후 품종 크기에 따라 노화 속도가 달라집니다. 소형견은 대형견보다 훨씬 오래 살므로 같은 나이라도 체감 노화 정도가 크게 다릅니다.',
              },
              {
                q: '하루 사료량이 포장지와 다른 이유는?',
                a: '포장지의 급여량은 평균적인 미중성화 성견 기준입니다. 중성화 여부, 활동량, 개체 대사율에 따라 실제 필요량은 10~30% 차이날 수 있습니다. 본 도구는 RER(기초대사량)과 생활계수(중성화 × 활동량 6조합 명시 매핑)를 기반으로 개인화된 값을 제공합니다.',
              },
              {
                q: '간식은 하루에 얼마나 줘도 되나요?',
                a: '수의영양학에서는 하루 총 칼로리의 10% 이내를 권장합니다. 예를 들어 일일 권장 칼로리가 300kcal라면 간식은 30kcal 이내로 제한하고, 간식만큼 사료를 줄여야 비만을 예방할 수 있습니다.',
              },
              {
                q: '고양이는 왜 습식 사료를 먹여야 하나요?',
                a: '고양이는 본능적으로 물을 잘 마시지 않아 만성 탈수와 신장병 위험이 높습니다. 습식 사료는 수분 함량이 70~80%로 자연스러운 수분 보충에 도움이 됩니다. 특히 비뇨기 질환 병력이 있거나 시니어 고양이에게 습식 사료가 더 권장됩니다.',
              },
              {
                q: '노령견·노령묘는 사료를 얼마나 줄여야 하나요?',
                a: '노령 반려동물은 기초대사량이 줄어들어 성견 대비 약 10~20% 칼로리를 감량하는 것이 일반적입니다. 다만 근감소증 예방을 위해 단백질 함량은 유지해야 합니다. 고단백·저지방의 시니어 전용 사료를 선택하고, 정확한 관리는 수의사와 상담하시기 바랍니다.',
              },
              {
                q: '우리 강아지 체중이 정상인지 어떻게 알 수 있나요?',
                a: '본 도구는 품종 크기 기준 정상 범위를 자동 표시합니다 (예: 소형견 5~10kg, 중형 10~25kg). 다만 같은 체중이라도 골격·근육량에 따라 다르므로 집에서 간단히 확인하는 방법:<br>· <strong>갈비뼈</strong>: 손바닥으로 살짝 만질 때 느껴짐 (보이면 저체중, 안 만져지면 과체중)<br>· <strong>허리</strong>: 위에서 봤을 때 모래시계 모양 (사라지면 과체중)<br>· <strong>복부</strong>: 옆에서 봤을 때 약간 들어감 (처지면 과체중)<br>정확한 BCS(Body Condition Score)는 연 1회 건강검진 시 수의사가 1~9 또는 1~5 척도로 평가합니다.',
              },
              {
                q: '강아지·고양이 평균 수명을 넘겼는데 괜찮을까요?',
                a: '평균 수명은 통계 평균일 뿐입니다. 유전·식이·운동·검진·환경 관리가 좋다면 평균보다 훨씬 오래 사는 사례가 많습니다. 다만 평균 수명을 지난 고령 반려동물은:<br>· 검진 빈도 ↑ (반기 1회 → 분기 1회)<br>· 신장·간·심장 기능 정기 모니터링<br>· 관절·치아 통증 신호 관찰<br>· 식욕·활동·배변 변화 즉시 수의사 상담<br>본 도구의 진행률 게이지는 보호자의 건강 관리 인식 도구이며, <strong>&quot;수명 예측&quot;이 아닙니다.</strong>',
              },
            ].map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {faq.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: faq.a }}
                />
              </details>
            ))}
          </div>
        </section>

        {/* ── 면책 조항 (기존 유지·강화) ── */}
        <section>
          <div style={{ background: 'rgba(255,62,62,0.07)', border: '1px solid rgba(255,62,62,0.2)', borderRadius: '14px', padding: '20px 22px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#ff7070', marginBottom: '8px' }}>⚠️ 수의학적 면책 조항</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
              본 계산기는 수의영양학 기반 <strong style={{ color: 'var(--text)' }}>참고용 도구</strong>입니다.
              <strong style={{ color: 'var(--text)' }}> 의료 진단·치료 도구 X / 약물 용량 계산 X / 영양제 추천 X.</strong>
              개별 반려동물의 건강 상태, 질병 유무, 특수 식이 요건에 따라 실제 필요량은 다를 수 있습니다.
              체중 증감·식욕 변화·활동량 변화가 있다면 반드시 수의사와 상담하시기 바랍니다.
            </p>
          </div>
        </section>

        {/* ── 함께 쓰면 좋은 도구 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmi',        icon: '⚖️', name: 'BMI 계산기',          desc: '보호자 건강도 챙기세요' },
              { href: '/tools/health/weightloss',  icon: '🎯', name: '체중 감량 기간 계산기', desc: '칼로리 적자로 달성일 예측' },
              { href: '/tools/health/bmr',         icon: '🔥', name: '기초대사량 계산기',     desc: '보호자 일일 칼로리 계산' },
              { href: '/tools/date/dday',          icon: '📅', name: 'D-day 계산기',         desc: '예방접종·검진 일정 관리' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
