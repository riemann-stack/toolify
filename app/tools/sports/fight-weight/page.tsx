import Link from 'next/link'
import FightWeightClient from './FightWeightClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/sports/fight-weight',
  title: '격투기 체급 계산기 — 복싱·UFC·MMA 감량 계획 D-day',
  description:
    '복싱·UFC·MMA 체급별 감량 계획과 D-day 일정 + 위험도 자동 경고. 안전 감량 페이스와 수분·근육량 손실 시뮬.',
  keywords: ['격투기체급계산기', 'UFC체급', '복싱체급', 'MMA감량', '계체감량', '격투기감량계획', '체급별감량', 'UFC라이트급', '복싱웰터급'],
})

const FAQ_LD = [
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
              {
                q: '체지방률이 낮은데도 무리한 감량이 가능할까요?',
                a: '<strong>매우 위험합니다.</strong> 남성 체지방률 8% 미만, 여성 16% 미만은 호르몬·면역 기능에 영향을 주는 한계선입니다. 체지방이 더 낮은 상태에서 추가 감량은 대부분 <strong>근육과 수분</strong>에서 빠지므로 퍼포먼스 급락·골밀도 감소·테스토스테론 저하가 발생합니다. 이 경우 체급을 한 단계 위로 올리거나 평소 체중 자체를 천천히 늘리는(벌크업) 장기 전략이 필요합니다.',
              },
              {
                q: '재수화는 어떻게 해야 하나요?',
                a: '계체 직후 한 번에 물 1L 이상을 들이키면 저나트륨혈증·구토·심장 부담이 생깁니다. 권장 순서 —<br/>① <strong>0~30분</strong>: 전해질 음료(나트륨·칼륨 포함) 500~750ml를 천천히<br/>② <strong>30분~3시간</strong>: 탄수화물 + 수분 (체중 1kg당 1g 탄수화물)<br/>③ <strong>3~24시간</strong>: 일반식 점진 복귀, 단백질·지방 추가<br/>UFC 등 일부 단체는 IV 수액(정맥주사)을 금지하므로 경구 재수화로만 진행해야 합니다.',
              },
              {
                q: '체중을 매일 어떻게 측정해야 정확한가요?',
                a: '아침 기상 직후, 화장실 다녀온 후, <strong>옷을 벗고 빈 위장</strong> 상태에서 측정합니다. 같은 체중계로 같은 시각에 매일 측정해야 추세를 정확히 볼 수 있습니다. 하루 사이 체중은 수분·음식·소화 상태로 1~2kg 출렁이므로 <strong>3~5일 평균</strong>을 추세로 봐야 합니다. 시합 직전에는 호텔/대회장 체중계와 평소 체중계의 차이를 미리 점검하는 것이 중요합니다.',
              },
              {
                q: '아마추어·체육관 시합에서도 본 도구를 써도 되나요?',
                a: '체급 한계 자체는 단체별 규정을 따라야 합니다(아마추어 복싱은 IBA·World Boxing 등 소속 단체 규정, MMA는 단체별 차이). 본 도구의 <strong>감량 일정·위험도 평가</strong>는 일반 가이드라인에 기반하므로 아마추어에도 그대로 적용 가능합니다. 다만 아마추어 시합은 재수화 시간이 짧거나 당일 계체가 많으므로 <strong>수분 감량보다 체지방 감량 위주</strong>로 평소 체중을 체급 한도 +3kg 이내로 유지하는 것이 안전합니다.',
              },
              {
                q: '여성 선수의 감량 시 유의점은?',
                a: '여성은 평균 체지방률이 남성보다 8~10%p 높지만, 호르몬 영향으로 <strong>월경주기에 따라 수분 변동이 큽니다</strong>(생리 직전 1~2kg 증가). 시합·계체일이 생리 전후에 겹치면 수분 감량 부담이 커지므로 일정 점검 필수. 또 체지방률이 16% 이하로 떨어지면 <strong>무월경·골밀도 감소</strong> 위험이 있어 장기적으로 권장되지 않습니다. 여성 선수는 체중보다 컨디션·근력 유지 지표를 우선시하는 것이 안전합니다.',
              },
              {
                q: '체중 감량 중 운동은 어떻게 해야 하나요?',
                a: '단계별로 다릅니다.<br/>• <strong>체지방 감량기</strong> — 근력 운동 주 3~4회 + 유산소 주 4~5회. 근력 유지가 핵심이므로 무게는 평소의 80~85% 유지.<br/>• <strong>수분 감량기</strong> — 강도 ↓, 기술·스파링 위주. 무리한 유산소는 탈수·실신 위험.<br/>• <strong>시합 3일 전~D-1</strong> — 가벼운 쉐도우·줄넘기·스트레칭만. 부상·컨디션 망가뜨릴 강한 운동 금지.',
              },
            ]

export default function FightWeightPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        스포츠
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="sports" />격투기 체급 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        복싱·UFC·MMA 체급별 <strong style={{ color: 'var(--text)' }}>감량 계획과 D-day 일정</strong> + 위험도 자동 경고.
      </p>

      <FightWeightClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 면책 강조 ── */}
        <div style={{
          background: 'rgba(220,38,38,0.08)',
          border: '2px solid rgba(220,38,38,0.4)',
          borderRadius: '14px',
          padding: '18px 22px',
          fontSize: '14px',
          color: 'var(--text)',
          lineHeight: 1.85,
        }}>
          <strong style={{ color: '#DC2626', fontSize: '14px' }}>⚠️ 시작 전 반드시 읽어주세요</strong>
          <p style={{ marginTop: '10px' }}>
            본 계산기는 격투기 체급과 감량 일정을 계획하기 위한 참고용 도구입니다.
            급격한 체중 감량은 <strong style={{ color: 'var(--text)' }}>심혈관·신장·신경계에 심각한 손상</strong>을 일으킬 수 있으며,
            실제 격투기 선수 사망 사례가 다수 보고되어 있습니다.
            실제 감량은 반드시 자격을 갖춘 <strong style={{ color: 'var(--text)' }}>트레이너·영양사·의사 감독</strong> 하에 체계적으로 진행하시기 바랍니다.
          </p>
        </div>

        {/* ── 2. 종목별 체급 비교 (체중 70kg 기준) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            종목별 체급 비교 — 체중 70kg 기준
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px', lineHeight: 1.7 }}>
            같은 체중이라도 종목·단체별로 분류 체급이 다릅니다. 예시 70kg 남성:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { sport: '복싱',     cls: '슈퍼웰터급', limit: '69.85kg', color: '#DC2626' },
              { sport: 'UFC',      cls: '라이트급',   limit: '70.3kg',  color: '#A16207' },
              { sport: 'ONE',      cls: '페더급',     limit: '70.3kg (수분 감량 금지)', color: '#059669' },
              { sport: '킥복싱',   cls: '슈퍼라이트급', limit: '70.0kg', color: '#0891B2' },
              { sport: '유도',     cls: '-73kg급',    limit: '73.0kg',  color: '#0EA5E9' },
              { sport: '태권도',   cls: '라이트급',   limit: '74.0kg',  color: '#9B59B6' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${c.color}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 12, color: c.color, fontWeight: 700, marginBottom: 4 }}>{c.sport}</p>
                <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{c.cls}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, marginTop: 4 }}>{c.limit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. 격투기 감량 3단계 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            격투기 감량의 3단계 완전 가이드
          </h2>
          <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 12, padding: '12px 16px', marginBottom: 12, fontSize: 13, color: 'var(--text)', lineHeight: 1.75 }}>
            ⚠️ 아래는 <strong>실행 매뉴얼이 아니라 위험을 이해하기 위한 설명</strong>입니다. 특히 2단계 수분 감량(나트륨·수분 제한·사우나)은 탈수·신장 손상·심정지로 이어질 수 있어, <strong>반드시 전문 코치·영양사·스포츠의학 전문의 감독</strong> 하에서만 진행해야 합니다. 청소년·아마추어는 수분 감량보다 평소 체중을 체급 한도 가까이 유지하는 방식을 권장합니다.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #EA580C', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: '#EA580C', fontWeight: 700, marginBottom: 6 }}>1단계 · 체지방 감량 (D-30 ~ D-7)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>칼로리 적자 500~750kcal/일</li>
                <li>유산소 + 근력 운동 병행</li>
                <li>단백질 섭취 유지 (체중 × 2g/일)</li>
                <li>주당 1kg 이내 안전한 감량</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #0891B2', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: '#0891B2', fontWeight: 700, marginBottom: 6 }}>2단계 · 수분 감량 (D-7 ~ D-1)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>나트륨 제한 (D-5)</li>
                <li>탄수화물 제한 (D-3)</li>
                <li>수분 제한 + 사우나 (D-1)</li>
                <li>단기간 5~10kg 감량 가능 — 가장 위험</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #059669', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: '#059669', fontWeight: 700, marginBottom: 6 }}>3단계 · 재수화 (계체 후 ~ 시합)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>경구 재수화만 — 전해질 음료를 천천히 (IV 정맥수액은 USADA·WADA 도핑 금지)</li>
                <li>탄수화물 보충 (체중 1kg당 1g)</li>
                <li>6~24시간 내 4~12kg 회복</li>
                <li>ONE Championship은 재수화 제한</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 4. 단체별 정책 비교표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            종목·단체별 감량·계체 정책 비교
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['단체', '계체 시각', '재수화 시간', '특이사항'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { o: 'UFC',           t: '시합 전날 오전',  r: '약 30~36시간', x: '재수화 자유 → 8~12kg 차이 흔함, 1회 한정 1lb 초과 허용' },
                  { o: 'ONE Champ',     t: '실측+소변 검사',  r: '제한적',        x: '수분 감량 금지 (2015~), 매주 체중 보고' },
                  { o: '복싱 (WBA·WBC)',t: '전날 또는 당일',   r: '24~36시간',    x: '단체별 차이 있음, 재수화 자유' },
                  { o: 'ADCC·주짓수',   t: '시합 1시간 전',    r: '거의 불가능',   x: '실제 체중과 거의 동일' },
                  { o: '유도·레슬링',  t: '당일 새벽',        r: '수 시간',       x: '국제 대회 기준, 짧은 재수화' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.o}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: '#0891B2', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.x}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 체급 한계는 각 단체 공식 규정 기준(UFC·복싱 WBC/WBA/IBF/WBO·유도 IJF·레슬링 UWW·태권도 WT·ONE Championship), 계체·재수화 시간은 단체 규정과 통념을 종합한 참고치입니다(기준 2026). 단체·대회·아마추어/프로에 따라 달라지니 출전 규정을 반드시 확인하세요.
          </p>
        </div>

        {/* ── 4-1. 체중 1kg = 며칠? 감량 기간 추정 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            감량 필요량별 권장 기간 — 한눈에 보기
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px', lineHeight: 1.7 }}>
            안전 한도(주당 체중 1%) 기준으로 계산한 권장 감량 기간입니다. 80kg 선수 기준.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>감량 필요</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>안전 (1%/주)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: '#A16207', fontWeight: 700 }}>적극 (1.5%/주)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: '#EA580C', fontWeight: 700 }}>위험 (2%/주)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { l: '2kg', s: '2~3주', a: '약 2주',   d: '1주' },
                  { l: '4kg', s: '5주',   a: '3~4주',   d: '2.5주' },
                  { l: '6kg', s: '7~8주', a: '5주',     d: '4주' },
                  { l: '8kg', s: '10주',  a: '7주',     d: '5주' },
                  { l: '10kg', s: '13주', a: '8~9주',   d: '6~7주' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#A16207', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#EA580C', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.75 }}>
            ※ 위 기간은 <strong style={{ color: 'var(--text)' }}>체지방 감량 단계</strong>만 고려한 값입니다. 시합 1주일 전 수분 감량으로 추가 2~5kg 빼는 것이 일반적입니다.
          </p>
        </div>

        {/* ── 4-2. 감량 단계별 영양 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            감량 단계별 영양·식단 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                stage: '🍗 체지방 감량기 (D-30 ~ D-7)',
                color: '#EA580C',
                items: [
                  '단백질 — 체중 1kg당 2.0~2.4g (근손실 방지 핵심)',
                  '탄수화물 — 체중 1kg당 3~4g (운동량 유지)',
                  '지방 — 총 칼로리의 20~25%',
                  '수분 — 하루 4~5L (대사·노폐물 배출)',
                  '식사 빈도 — 하루 4~5회 소량 분산',
                ],
              },
              {
                stage: '💧 수분 감량기 (D-7 ~ D-1)',
                color: '#0891B2',
                items: [
                  '⚠️ 아래는 관행 설명이며 실행 매뉴얼이 아닙니다 — 반드시 전문 코치·의사 감독 하에서만',
                  'D-7~D-3 — 나트륨을 크게 줄이는 방식이 쓰임',
                  'D-5~D-3 — 섬유질 감소 (장 잔여물 줄임)',
                  'D-3~D-1 — 탄수화물 제한으로 글리코겐 저장 수분을 줄이는 단계',
                  'D-1 — 수분 제한·발한(사우나 등)으로 마무리하는 방식이 쓰이나, 탈수·신장 손상 위험이 가장 큰 단계',
                  '⚠️ 카페인·이뇨제 사용은 신장 부담 ↑ 비권장',
                ],
              },
              {
                stage: '🔋 재수화·시합기 (계체 후 ~ 시합)',
                color: '#059669',
                items: [
                  '계체 직후 30분 — 전해질 음료 500~750ml',
                  '~6시간 — 탄수화물 (체중 1kg당 5~10g) 재충전',
                  '~24시간 — 단백질·지방 추가, 일반식 점진 복귀',
                  '시합 2~4시간 전 — 가벼운 탄수화물 200~400kcal',
                  '시합 1시간 전 — 액상 탄수화물·카페인 가능',
                ],
              },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.color}`, borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ fontSize: 13, color: s.color, fontWeight: 700, marginBottom: 8 }}>{s.stage}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                  {s.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4-3. 체급 선택 전략 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎯 체급 선택 전략 — 어떤 체급이 유리할까?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              {
                head: '✅ 한 단계 아래 체급으로 내리는 게 유리한 경우',
                color: '#059669',
                items: [
                  '체지방률이 평균(남 15%·여 23%) 이상 — 줄일 여지 ↑',
                  '키·리치(팔 길이) 우위가 명확',
                  '체급 한도가 자기 평소 체중의 −8% 이내',
                  '시합까지 8주 이상 — 안전한 페이스 가능',
                  '재수화 시간 충분 (UFC·복싱)',
                ],
              },
              {
                head: '⚠️ 한 단계 위 체급으로 올리는 게 나은 경우',
                color: '#EA580C',
                items: [
                  '체지방률이 이미 낮음 (남 10%·여 18% 이하)',
                  '체급 한도가 평소보다 −10% 초과',
                  '시합까지 4주 미만',
                  '계체 당일·새벽 정책 (유도·레슬링)',
                  'ONE Championship — 수분 감량 금지',
                  '이전 감량에서 부상·컨디션 난조 경험',
                ],
              },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${c.color}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: c.color, fontWeight: 700, marginBottom: 6 }}>{c.head}</p>
                <ul style={{ paddingLeft: 16, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                  {c.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 위험 사례 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
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
        </div>

        {/* ── 7. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmi',         icon: '⚖️', name: '비만도(BMI) 계산기',       desc: '체질량지수로 비만도 빠르게 확인' },
              { href: '/tools/health/bmr',         icon: '🔥', name: '기초대사량(BMR) 계산기',  desc: '하루 권장 칼로리·BMR 계산' },
              { href: '/tools/health/weightloss',  icon: '🎯', name: '체중 감량 기간 계산기',    desc: '목표 체중까지 칼로리 적자' },
              { href: '/tools/sports/one-rm',      icon: '🏋️', name: '1RM 계산기',               desc: '근력 훈련 최대 중량 추정' },
              { href: '/tools/health/supplement',  icon: '💊', name: '영양제 중복 체크 계산기',  desc: '영양제 성분 중복·상한량 체크' },
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
