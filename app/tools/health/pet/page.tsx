import Link from 'next/link'
import PetClient from './PetClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/health/pet',
  title: '강아지·고양이 나이 계산기 — 사람 나이 환산·하루 사료량',
  description: '강아지·고양이 나이를 사람 나이로 환산합니다. 품종 크기·중성화 여부·활동량을 반영한 하루 권장 칼로리와 사료 그램 계산. 반려동물 건강 관리 필수 도구.',
  keywords: ['강아지나이계산기','고양이나이계산기','반려동물나이환산','강아지사료량계산기','고양이칼로리계산','개나이사람나이','강아지하루사료량'],
})

export default function PetPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·웰빙</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🐾 반려동물 나이·칼로리 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        강아지·고양이 나이를 사람 나이로 환산하고, 품종 크기·중성화·활동량에 맞는 하루 권장 칼로리와 사료량을 계산합니다.
      </p>

      <PetClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 나이 환산표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>강아지 나이 환산표</h2>
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
                    <td style={{ padding: '9px 10px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{age}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'Syne, sans-serif', color: '#FFB347' }}>{s}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>{m}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'Syne, sans-serif', color: 'var(--muted)' }}>{l}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>고양이 나이 환산표</h2>
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
                  ['1세',  '15세', '키튼',       '#3EC8FF'],
                  ['2세',  '24세', '성묘',        '#3EFF9B'],
                  ['7세',  '44세', '시니어',      '#C8FF3E'],
                  ['11세', '60세', '슈퍼시니어',  '#FF8C3E'],
                  ['15세', '76세', '고령',        '#FF6B6B'],
                  ['20세', '96세', '초고령',      '#FF4444'],
                ].map(([age, human, stage, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{age}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#C084FC' }}>{human}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center' }}><span style={{ background: color + '22', border: `1px solid ${color}66`, borderRadius: '6px', padding: '2px 10px', fontSize: '12px', color }}>{stage}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. ×7 공식이 틀린 이유 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>강아지 나이 = ×7이 틀린 이유</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            "개 나이 × 7 = 사람 나이"는 오랫동안 통용된 속설이지만 수의학적으로 부정확합니다. 강아지는 첫 1~2년 동안 <strong style={{ color: 'var(--text)' }}>사람의 청소년기까지 극도로 빠르게</strong> 성장하며, 이후 품종 크기에 따라 노화 속도가 크게 달라집니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {[
              { title: '문제 1 — 초기 성장 속도 무시', color: '#FFB347', desc: '강아지 1세는 사람 나이로 약 15세(사춘기), 2세는 24세에 해당합니다. ×7 공식으로 계산하면 각각 7세, 14세가 되어 실제보다 훨씬 어린 나이가 됩니다.' },
              { title: '문제 2 — 품종 크기 차이 무시', color: '#C084FC', desc: '소형견(치와와, 말티즈)은 15~20년 이상 살지만, 대형견(그레이트데인)의 평균 수명은 7~10년입니다. 같은 ×7을 적용하면 노령 판단 기준이 완전히 달라집니다.' },
              { title: '2019년 UC샌디에이고 연구', color: '#3EFF9B', desc: '개의 DNA 메틸화 패턴을 분석한 결과, 인간과 개의 노화는 로그함수적으로 일치하며, 특히 초기 성장기에 개의 노화 속도가 훨씬 빠름이 밝혀졌습니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}25`, borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: item.color, marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. RER/DER 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>칼로리 계산 공식 (RER / DER)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,179,71,0.2)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: '#FFB347', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>RER — 기초 에너지 요구량 (Resting Energy Requirement)</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>RER = 70 × 체중(kg)⁰·⁷⁵</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>완전한 안정 상태에서 생명 유지에 필요한 최소 칼로리입니다. 체중의 0.75 거듭제곱을 사용해 소형견과 대형견의 체표면적 차이를 반영합니다.</p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>DER — 일일 에너지 요구량 (Daily Energy Requirement)</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '10px' }}>DER = RER × 생활계수</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>상황</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--accent)', fontWeight: 600 }}>계수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['퍼피 / 성장기', '× 2.5'],
                      ['중성화 성견·성묘 (활동 낮음)', '× 1.2'],
                      ['중성화 성견·성묘 (활동 보통)', '× 1.4'],
                      ['미중성화 성견·성묘 (활동 보통)', '× 1.4~1.6'],
                      ['운동견 / 실외 고양이 (활동 높음)', '× 1.6~1.8'],
                      ['노령견·시니어 고양이', '× 1.1'],
                    ].map(([sit, fac], i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg3)' }}>
                        <td style={{ padding: '7px 8px', color: 'var(--muted)' }}>{sit}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{fac}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. 시나리오 예시 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>계산 예시</h2>
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
        </div>

        {/* ── 5. 연령대별 건강 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>연령대별 건강 관리 가이드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
            {[
              { pet: '🐶 강아지', stage: '퍼피 (~1세)', color: '#3EC8FF', items: ['기본 백신 (디스템퍼·파보·홍역) 접종', '심장사상충 예방약 투여 시작', '중성화 수술 시기 상담 (6~12개월)'] },
              { pet: '🐶 강아지', stage: '성견 (1~7세)', color: '#3EFF9B', items: ['연 1회 건강검진 및 혈액검사', '치석 스케일링 (1~2년마다)', '심장사상충·외부기생충 예방 지속'] },
              { pet: '🐶 강아지', stage: '노령견 (7세~)', color: '#FF8C3E', items: ['반기 1회 건강검진으로 빈도 증가', '관절 건강 및 관절염 모니터링', '신장·간 기능 혈액검사 주기 점검'] },
              { pet: '🐱 고양이', stage: '키튼 (~1세)', color: '#3EC8FF', items: ['종합백신 (FVRCP) 접종 시리즈', '중성화 수술 시기 상담 (5~7개월)', '내·외부 기생충 예방'] },
              { pet: '🐱 고양이', stage: '성묘 (1~7세)', color: '#3EFF9B', items: ['연 1회 건강검진 및 혈액검사', '구강 건강·치석 관리', '체중 모니터링 및 비만 예방'] },
              { pet: '🐱 고양이', stage: '시니어·슈퍼시니어 (7세~)', color: '#FF8C3E', items: ['갑상선 기능 항진증 검사', '신장 기능 (BUN·크레아티닌) 정기 확인', '혈압 측정 및 인지 기능 저하 관찰'] },
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
        </div>

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: '강아지 나이를 사람 나이로 곱하기 7을 하면 안 되나요?',
                a: '단순 7배 공식은 부정확합니다. 강아지는 첫 2년간 매우 빠르게 성장(1세≈15세, 2세≈24세)하며, 이후 품종 크기에 따라 노화 속도가 달라집니다. 소형견은 대형견보다 훨씬 오래 살므로 같은 나이라도 체감 노화 정도가 크게 다릅니다.',
              },
              {
                q: '하루 사료량이 포장지와 다른 이유는?',
                a: '포장지의 급여량은 평균적인 미중성화 성견 기준입니다. 중성화 여부, 활동량, 개체 대사율에 따라 실제 필요량은 10~30% 차이날 수 있습니다. 이 계산기는 RER(기초대사량)과 생활계수를 기반으로 개인화된 값을 제공합니다.',
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
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 면책 조항 ── */}
        <div style={{ background: 'rgba(255,62,62,0.07)', border: '1px solid rgba(255,62,62,0.2)', borderRadius: '14px', padding: '20px 22px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#ff7070', marginBottom: '8px' }}>⚠️ 수의학적 면책 조항</p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
            본 계산기는 수의영양학 기반 참고용 도구입니다. 개별 반려동물의 건강 상태, 질병 유무, 특수 식이 요건에 따라 실제 필요량은 다를 수 있습니다. 정확한 영양 관리와 건강 진단은 반드시 수의사와 상담하시기 바랍니다.
          </p>
        </div>

        {/* ── 8. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmi',        icon: '⚖️', name: 'BMI 계산기',          desc: '보호자 건강도 챙기세요' },
              { href: '/tools/health/weightloss',  icon: '🎯', name: '목표 체중 감량 계산기', desc: '칼로리 적자로 달성일 예측' },
              { href: '/tools/date/dday',          icon: '📅', name: 'D-day 계산기',         desc: '예방접종·검진 일정 관리' },
              { href: '/tools/life/pomodoro',      icon: '🍅', name: '뽀모도로 타이머',       desc: '반려동물 산책 루틴 설정' },
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
        </div>

      </div>
    </div>
  )
}
