import Link from 'next/link'
import FightWeightClient from './FightWeightClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/sports/fight-weight',
  title: '격투기 체급 계산기 — 복싱·UFC·MMA 감량 계획 D-day',
  description:
    '복싱, UFC, ONE Championship, 킥복싱, 유도, 태권도 체급별 감량 필요량과 D-day별 안전한 감량 일정을 계산합니다. 종목별 감량 정책·재수화 가이드 포함.',
  keywords: ['격투기체급계산기', 'UFC체급', '복싱체급', 'MMA감량', '계체감량', '격투기감량계획', '체급별감량', 'UFC라이트급', '복싱웰터급'],
})

export default function FightWeightPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        스포츠
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🥊 격투기 체급 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        복싱·UFC·ONE·킥복싱·유도·태권도·무에타이·레슬링 8종목 체급을 한 번에. 키·체중·계체일을 입력하면 <strong style={{ color: 'var(--text)' }}>적정 체급 추천 · 감량 필요량 · 위험도 평가 · 단계별(체지방·수분·재수화) 일정표</strong>를 자동 생성합니다.
      </p>

      <FightWeightClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 면책 강조 ── */}
        <div style={{
          background: 'rgba(255,107,107,0.08)',
          border: '2px solid rgba(255,107,107,0.4)',
          borderRadius: '14px',
          padding: '18px 22px',
          fontSize: '14px',
          color: 'var(--text)',
          lineHeight: 1.85,
        }}>
          <strong style={{ color: '#FF6B6B', fontSize: '14px' }}>⚠️ 시작 전 반드시 읽어주세요</strong>
          <p style={{ marginTop: '10px' }}>
            본 계산기는 격투기 체급과 감량 일정을 계획하기 위한 참고용 도구입니다.
            급격한 체중 감량은 <strong style={{ color: 'var(--text)' }}>심혈관·신장·신경계에 심각한 손상</strong>을 일으킬 수 있으며,
            실제 격투기 선수 사망 사례가 다수 보고되어 있습니다.
            실제 감량은 반드시 자격을 갖춘 <strong style={{ color: 'var(--text)' }}>트레이너·영양사·의사 감독</strong> 하에 체계적으로 진행하시기 바랍니다.
          </p>
        </div>

        {/* ── 2. 종목별 체급 비교 (체중 70kg 기준) ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            종목별 체급 비교 — 체중 70kg 기준
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px', lineHeight: 1.7 }}>
            같은 체중이라도 종목·단체별로 분류 체급이 다릅니다. 예시 70kg 남성:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { sport: '🥊 복싱',     cls: '슈퍼웰터급', limit: '69.85kg', color: '#FF6B6B' },
              { sport: '🥋 UFC',      cls: '라이트급',   limit: '70.3kg',  color: '#FFD700' },
              { sport: '🌿 ONE',      cls: '페더급',     limit: '70.3kg (수분 감량 금지)', color: '#3EFF9B' },
              { sport: '🦵 킥복싱',   cls: '슈퍼라이트급', limit: '70.0kg', color: '#3EC8FF' },
              { sport: '🥋 유도',     cls: '-73kg급',    limit: '73.0kg',  color: '#C8FF3E' },
              { sport: '🦿 태권도',   cls: '라이트급',   limit: '74.0kg',  color: '#9B59B6' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${c.color}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 12, color: c.color, fontWeight: 700, marginBottom: 4 }}>{c.sport}</p>
                <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{c.cls}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 700, marginTop: 4 }}>{c.limit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. 격투기 감량 3단계 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            격투기 감량의 3단계 완전 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FF8C3E', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: '#FF8C3E', fontWeight: 700, marginBottom: 6 }}>1단계 · 체지방 감량 (D-30 ~ D-7)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>칼로리 적자 500~750kcal/일</li>
                <li>유산소 + 근력 운동 병행</li>
                <li>단백질 섭취 유지 (체중 × 2g/일)</li>
                <li>주당 1kg 이내 안전한 감량</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EC8FF', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: '#3EC8FF', fontWeight: 700, marginBottom: 6 }}>2단계 · 수분 감량 (D-7 ~ D-1)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>나트륨 제한 (D-5)</li>
                <li>탄수화물 제한 (D-3)</li>
                <li>수분 제한 + 사우나 (D-1)</li>
                <li>단기간 5~10kg 감량 가능 — 가장 위험</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EFF9B', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: '#3EFF9B', fontWeight: 700, marginBottom: 6 }}>3단계 · 재수화 (계체 후 ~ 시합)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>계체 직후 IV 수액 (UFC 등 일부 단체 금지)</li>
                <li>전해질 음료 + 탄수화물 보충</li>
                <li>6~24시간 내 4~12kg 회복</li>
                <li>ONE Championship은 재수화 제한</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 4. 단체별 정책 비교표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            종목·단체별 감량·계체 정책 비교
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['단체', '계체 시각', '재수화 시간', '특이사항'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { o: '🥋 UFC',           t: '시합 전날 오전',  r: '약 30~36시간', x: '재수화 자유 → 8~12kg 차이 흔함, 1회 한정 1lb 초과 허용' },
                  { o: '🌿 ONE Champ',     t: '실측+소변 검사',  r: '제한적',        x: '수분 감량 금지 (2015~), 매주 체중 보고' },
                  { o: '🥊 복싱 (WBA·WBC)',t: '전날 또는 당일',   r: '24~36시간',    x: '단체별 차이 있음, 재수화 자유' },
                  { o: '🤼 ADCC·주짓수',   t: '시합 1시간 전',    r: '거의 불가능',   x: '실제 체중과 거의 동일' },
                  { o: '🥋 유도·레슬링',  t: '당일 새벽',        r: '수 시간',       x: '국제 대회 기준, 짧은 재수화' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.o}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: '#3EC8FF', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.x}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. 위험 사례 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            ⚠️ 위험한 감량 사례 — 경각심 환기
          </h2>
          <div style={{
            background: 'rgba(255,70,70,0.06)',
            border: '1px solid rgba(255,70,70,0.3)',
            borderRadius: '12px',
            padding: '16px 18px',
          }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
              다음은 실제 격투기 선수의 안타까운 사례입니다. 무리한 감량의 위험성을 인지하시기 바랍니다.
            </p>
            <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text)', lineHeight: 2, margin: 0 }}>
              <li><strong>Yang Jian Bing</strong> (2015, ONE Championship) — 21세, 감량 중 사망</li>
              <li><strong>Leandro Souza</strong> (2013, MMA) — 26세, 감량 직후 사망</li>
              <li><strong>Mike Bell</strong> (2014, MMA) — 32세, 사우나 감량 중 사망</li>
            </ul>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.75, fontStyle: 'italic' }}>
              ※ 이 사고들은 ONE Championship의 수분 감량 금지 정책 도입 계기가 되었습니다.
            </p>
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '복싱과 UFC의 체급은 같은가요?',
                a: '다릅니다. 복싱은 <strong>17체급</strong>(미니멈웨이트~헤비급)으로 매우 세분화되어 있고 UFC는 <strong>9체급</strong>(스트로급~헤비급)으로 단순합니다. 같은 70kg이라도 복싱은 슈퍼웰터급, UFC는 라이트급에 해당합니다. 체급 한계도 단체마다 0.5~2kg 차이가 납니다.',
              },
              {
                q: '격투기 선수들은 왜 그렇게 많이 감량하나요?',
                a: '자기보다 가벼운 선수와 시합해 <strong>체격적 우위</strong>를 얻기 위해서입니다. UFC 선수들은 평소 체중보다 8~12kg 무거운 상태로 시합에 임합니다. 예를 들어 라이트급(70.3kg) 선수가 평소 78~80kg을 유지하다 계체 직전 수분으로 8kg을 빼고, 계체 후 다시 8kg을 회복해 실제 시합은 78kg 정도로 진행합니다.',
              },
              {
                q: '안전한 감량 속도는 어느 정도인가요?',
                a: '의학적으로 <strong>주당 체중의 1% 이내(약 0.5~1kg)</strong>가 안전합니다. 체중 80kg 기준 주당 0.8kg, 한 달 3.2kg이 권장 한도입니다. 주당 1.5kg을 넘으면 근손실·면역 저하·생리 이상 등이 발생할 수 있고, 주당 2kg을 넘으면 심혈관·신장 손상 위험이 급증합니다.',
              },
              {
                q: '수분 감량은 어떻게 하나요?',
                a: '일반적으로 시합 1주일 전부터 단계적으로 진행됩니다.<br/>• <strong>D-7~D-3</strong>: 나트륨 제한 → 체수분 자연 배출<br/>• <strong>D-3~D-1</strong>: 탄수화물 제한 → 글리코겐 저장 수분 배출<br/>• <strong>D-1</strong>: 수분 제한 + 사우나·뜨거운 욕조 → 발한<br/>단, 이 방법은 매우 위험하므로 전문 감독이 필수입니다.',
              },
              {
                q: 'ONE Championship의 체중 정책은 무엇인가요?',
                a: 'ONE은 2015년 격투기 사망 사고들을 계기로 <strong>수분 감량을 금지</strong>했습니다. 시합 3주 전부터 매주 체중을 보고하고 시합 주에는 매일 소변 비중을 측정해 수분 상태를 검사합니다. 한도를 넘으면 시합 자격이 박탈됩니다. 선수 안전을 위한 가장 엄격한 정책으로 평가받습니다.',
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
        </div>

        {/* ── 7. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/health/bmi',         icon: '⚖️', name: '비만도(BMI) 계산기',       desc: '체질량지수로 비만도 빠르게 확인' },
              { href: '/tools/health/bmr',         icon: '🔥', name: '기초대사량(BMR) 계산기',  desc: '하루 권장 칼로리·BMR 계산' },
              { href: '/tools/health/weightloss',  icon: '🎯', name: '체중 감량 기간 계산기',    desc: '목표 체중까지 칼로리 적자' },
              { href: '/tools/health/one-rm',      icon: '🏋️', name: '1RM 계산기',               desc: '근력 훈련 최대 중량 추정' },
              { href: '/tools/health/supplement',  icon: '💊', name: '영양제 성분 체크 계산기',  desc: '영양제 성분 중복·상한량 체크' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
