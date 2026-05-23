import Link from 'next/link'
import PregnancyClient from './PregnancyClient'
import FaqJsonLd from '@/components/FaqJsonLd'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

const PREGNANCY_FAQ = [
  { q: '임신 주수는 어떻게 계산하나요?', a: '임신 주수는 마지막 생리 시작일로부터 계산합니다. 실제 수정은 배란일(생리 시작 후 약 14일)에 일어나지만, 정확한 배란일을 알기 어렵기 때문에 의학적으로는 마지막 생리 시작일을 기준으로 삼습니다. 따라서 임신 1주차는 아직 수정 전인 시기입니다.' },
  { q: '출산 예정일은 어떻게 계산하나요?', a: '출산 예정일은 마지막 생리 시작일로부터 280일(40주) 후입니다. 네겔레 공식에 따라 마지막 생리 시작일에 7일을 더하고 3개월을 빼면 됩니다. 실제 출산은 예정일 ±2주 사이에 일어나는 경우가 많습니다.' },
  { q: '초음파 주수와 생리 기준 주수가 달라요!', a: '초기 초음파 검사에서 태아의 크기(CRL, 두부-둔부 길이)를 측정하여 주수를 보정할 수 있습니다. 이 경우 의사가 새로 지정해 준 주수가 더 정확합니다. 본 계산기는 생리 기준 주수를 사용하므로 초음파 결과와 1~2주 차이가 날 수 있으며, <strong>산부인과에서 보정받은 주수가 있다면 그 결과를 우선 적용</strong>하세요.' },
  { q: '임신 주수를 개월로 환산하면?', a: '의학적으로는 4주를 1개월로 봅니다. 예를 들어 28주는 7개월이 됩니다. 하지만 일반적인 달력 기준(30~31일/월)과는 차이가 있을 수 있으므로, 임신 경과는 주수(week)로 소통하는 것이 가장 정확합니다.' },
  { q: '임신 초기 증상에는 어떤 것이 있나요?', a: '착상혈(소량 출혈), 유방 팽창 및 압통, 입덧(메스꺼움·구토), 피로감, 빈뇨, 미각·후각 변화 등이 나타날 수 있습니다. 증상의 정도는 개인차가 매우 크며, 아무런 증상이 없는 경우도 있습니다. <strong>구체적 증상 해석은 산부인과 상담을 권장합니다.</strong>' },
  { q: '산전 검사는 꼭 다 받아야 하나요?', a: '본 도구가 안내하는 검사들은 표준 권장 사항이지만 모두 필수는 아닙니다.<br><br><strong>안전·태아 건강 직결 (필수에 가까움)</strong> — 첫 산전 검사 / 정밀 초음파 / 임신성 당뇨 검사 / GBS 검사.<br><br><strong>선택적 검사 (산모 상황·가족력에 따라)</strong> — 기형아 검사(NIPT·쿼드 등) / 양수 검사(고위험 시).<br><br>비용·시기·필요성은 담당 산부인과와 상담 후 결정하세요. 국민건강보험에서 일부 검사 비용을 지원합니다 (본인부담률 차이).' },
  { q: '태동을 언제부터 느끼나요?', a: '<strong>첫 임신(초산모)</strong>: 보통 18~22주차에 처음 느낌.<br><strong>경험 임신(경산모)</strong>: 보통 16~18주차에 더 빠름.<br><br>태동 종류:<br>· 초기: 가벼운 떨림·기포 터지는 느낌<br>· 중기: 분명한 발차기·움직임<br>· 후기: 강한 움직임·딸꾹질<br><br>28주차 이후는 매일 태동 횟수 기록을 권장하며, <strong>태동이 감소하면 즉시 산부인과 상담</strong>하세요.' },
  { q: '본 계산기 데이터는 어디에 저장되나요?', a: '입력한 정보(생리일·태명·체크리스트 진행)는 사용자 브라우저의 <strong>localStorage</strong>에 저장됩니다. 회원가입·로그인 불필요 / 사생활 보호 (서버 저장 X) / 같은 브라우저·기기에서만 접근 / 캐시 삭제 시 사라짐. 다른 기기 사용 시 출산 정보를 따로 백업하시기 바랍니다.' },
  { q: '쌍태아 임신은 어떻게 적용하나요?', a: '출산 예정일 계산은 동일하게 가능하지만 다음이 다릅니다.<br><br><strong>검진 빈도</strong> — 단태아: 4주 간격 → 후기 1~2주 / 쌍태아: 더 자주 (2~3주 간격).<br><strong>추가 검사</strong> — 추가 정밀 초음파 / 임신성 당뇨 위험↑ / 자궁경부 길이 측정(조산 위험↑).<br><strong>분만 시기</strong> — 단태아 평균 40주 / 쌍태아 평균 36~37주 (조산 빈도↑).<br><br>본 도구의 일반 일정은 단태아 기준이므로, 쌍태아 임신은 담당 산부인과의 일정 안내를 우선하세요.' },
  { q: '임신 중 카페인·약은 어떻게 해야 하나요?', a: '본 도구는 일반 가이드라인만 제공하며, 구체적 결정은 의료진 상담이 필수입니다.<br><br><strong>카페인</strong> — WHO 권장: 하루 200mg 이하 (커피 1~2잔). 너무 많은 카페인: 유산·저체중 위험↑.<br><br><strong>약물</strong> — 임신 전 복용 약: 즉시 산부인과 상담 / 처방약: 의사·약사에게 임신 알림 / 일반의약품(감기약·진통제 등): 1삼분기 피해야 할 약 多 / 한약·영양제: 안전성 확인 후.<br><br>"임신 중 안전" 표시도 본인 상황별로 다를 수 있으니 <strong>반드시 산부인과 또는 약사 상담 후 복용</strong>하세요.' },
]

export const metadata = buildMetadata({
  path: '/tools/health/pregnancy',
  title: '임신 주수 계산기 — 출산 예정일·산전 검사·태아 크기·체크리스트',
  description:
    '지금 임신 몇 주차 + 산전 검사 일정·태아 크기 비교·출산 준비 체크리스트를 자동 타임라인으로. 생리주기 보정 포함.',
  keywords: [
    '임신주수계산기', '출산예정일계산기', '임신주수', '임신계산기',
    '출산예정일', '산전검사일정', '태아크기', '네겔레공식',
    '임신 체크리스트', '삼분기', '임신 캘린더',
  ],
})

export default function PregnancyPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·웰빙</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🤰 임신 주수 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        지금 임신 몇 주차인지 + 산전 검사·태아 크기·출산 준비를 <strong style={{ color: 'var(--text)' }}>자동 타임라인</strong>으로.
      </p>

      <PregnancyClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 네겔레 공식 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            출산 예정일 산출법 — 네겔레 공식
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            네겔레 공식(Naegele&apos;s Rule)은 1800년대 독일 산부인과 의사 프란츠 카를 네겔레가 개발한 출산 예정일 계산법입니다.
            현재 전 세계 산부인과에서 가장 널리 사용되는 표준 방법입니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(219,39,119,0.25)', borderRadius: '14px', padding: '20px 22px', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: '#DB2777', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px' }}>
              네겔레 공식 (Naegele&apos;s Rule)
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {[
                { label: '출산 예정일', isResult: true },
                { label: '=', isSym: true },
                { label: '마지막 생리\n시작일', isInput: true },
                { label: '+', isSym: true },
                { label: '7일', isOp: true },
                { label: '−', isSym: true },
                { label: '3개월', isOp: true },
                { label: '+', isSym: true },
                { label: '1년', isOp: true },
              ].map((item, i) => (
                item.isSym
                  ? <span key={i} style={{ fontSize: '20px', color: 'var(--muted)', fontWeight: 700, flexShrink: 0 }}>{item.label}</span>
                  : <div key={i} style={{
                    background: item.isResult ? 'rgba(219,39,119,0.15)' : item.isInput ? 'var(--bg3)' : 'rgba(14,165,233,0.1)',
                    border: `1px solid ${item.isResult ? 'rgba(219,39,119,0.4)' : item.isInput ? 'var(--border)' : 'rgba(14,165,233,0.3)'}`,
                    borderRadius: '8px', padding: '8px 12px', textAlign: 'center',
                    fontSize: '12px', fontWeight: 600, whiteSpace: 'pre-line', lineHeight: 1.4,
                    color: item.isResult ? '#DB2777' : item.isInput ? 'var(--text)' : 'var(--accent)',
                  }}>{item.label}</div>
              ))}
            </div>
            <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '12px 14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9 }}>
                📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> 마지막 생리 시작일이 <strong style={{ color: 'var(--text)' }}>2025년 10월 1일</strong>이라면<br />
                → 10월 1일 + 7일 = 10월 8일 → 10월 − 3개월 = 7월 8일 → + 1년 = <strong style={{ color: '#DB2777' }}>2026년 7월 8일</strong>이 출산 예정일
              </p>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
            ※ 네겔레 공식은 생리 주기가 28일이고 배란이 14일째 일어난다는 가정을 기반으로 합니다.
            생리 주기가 불규칙하거나 길/짧은 경우 실제 예정일과 차이가 날 수 있으며, 최종 예정일은 초음파 검사로 확인합니다.
          </p>
        </section>

        {/* ── 2. 삼분기별 변화 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>삼분기별 주요 변화</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { period: '1삼분기 (1~13주)', color: '#CA8A04', items: ['수정란 착상 → 배아 형성', '심장·뇌·척수 등 주요 장기 형성', '입덧 시작 (8~10주에 최고조)', '첫 산전 검사 및 기형아 1차 검사'] },
              { period: '2삼분기 (14~27주)', color: '#059669', items: ['입덧 감소, 안정기 진입', '태동 시작 (18~22주)', '성별 확인 가능 (초음파)', '정밀 초음파, 기형아 2차 검사'] },
              { period: '3삼분기 (28~40주)', color: '#EA580C', items: ['태아 급성장 (체중·폐 발달)', '분만 준비 교육 권장', 'GBS 검사, NST(태아심박동 검사)', '출산 준비 (입원 가방 등)'] },
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${t.color}40`, borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: t.color, marginBottom: '10px' }}>{t.period}</p>
                <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {t.items.map((item, j) => (
                    <li key={j} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. 산전 검사 가이드 (NEW) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            산전 검사 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '14px' }}>
            본 도구의 검사 일정은 다음 표준 기반 — <strong style={{ color: 'var(--text)' }}>보건복지부 임신·출산 가이드라인 / 대한산부인과학회(KSOG) 산전 진료 지침 / WHO 임산부 산전 진료 권고안</strong>.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '9px 10px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>검사</th>
                  <th style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>주차</th>
                  <th style={{ padding: '9px 10px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>목적</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['① 첫 산전 검사 (혈액·소변)',     '6~8주',   '임신 확정·기본 혈액 검사'],
                  ['② 기형아 1차 (NT·통합)',          '11~13주', '목 투명대(NT) + 다운증후군 통합검사'],
                  ['③ 기형아 2차 (쿼드)',             '16~18주', '쿼드 검사·신경관결손 평가'],
                  ['④ 정밀 초음파 (level 2)',         '20~24주', '태아 장기·구조 점검 / 성별 확인'],
                  ['⑤ 임신성 당뇨 (GTT)',             '24~28주', '50g/100g 당부하 검사'],
                  ['⑥ 후기 정밀 초음파',              '28~32주', '성장·양수량·태반 위치'],
                  ['⑦ GBS (B군 연쇄상구균)',         '35~37주', '신생아 감염 예방'],
                  ['⑧ 막달 검사·NST',                 '35~39주', '태아심박동·자궁수축 모니터링'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{row[1]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⚠️ 검사 시기·항목은 병원·산모 상태·고위험 임신 여부·쌍태아 여부에 따라 달라질 수 있으며, 본 도구의 일정은 일반 가이드라인입니다. 실제 일정은 담당 산부인과의 안내를 우선하세요.
          </p>
        </section>

        {/* ── 4. 태아 크기 비유 (NEW) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            태아 크기 비유 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            주차별 태아 크기 일반 비유 (참고용 · 의학적 진단 X) —
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              ['4주', '🌱 양귀비씨 (~2mm)'],
              ['8주', '🥜 강낭콩 (~16mm)'],
              ['12주', '🟣 자두 (~5cm)'],
              ['16주', '🥑 아보카도 (~11cm)'],
              ['20주', '🍌 바나나 (~17cm)'],
              ['24주', '🌽 옥수수 (~30cm)'],
              ['28주', '🍆 큰 가지 (~37cm)'],
              ['32주', '🍯 큰 도자기 (~42cm)'],
              ['36주', '🍈 파파야 (~47cm)'],
              ['40주', '🍉 큰 수박 (~51cm)'],
            ].map(([w, label], i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid rgba(219,39,119,0.25)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, color: '#DB2777', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{w}</span>
                <span style={{ fontSize: 12.5, color: 'var(--text)' }}>{label}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            ⓘ 비유는 일반 가이드이며 정확한 태아 크기는 초음파 검사로만 확인 가능합니다. 본 도구 [태아 크기] 탭에서 1~40주 전체 그리드를 확인할 수 있습니다.
          </p>
        </section>

        {/* ── 5. 출산 준비 체크리스트 (NEW) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            삼분기별 출산 준비 체크리스트
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                period: '1삼분기 (1~13주)', color: '#CA8A04',
                items: ['산부인과 등록·정기 검진 시작', '엽산 섭취 시작 (산부인과 상담)', '음주·흡연·카페인 제한', '직장·보험 검토', '입덧 기록·식이 조절'],
              },
              {
                period: '2삼분기 (14~27주)', color: '#059669',
                items: ['정밀 초음파 (20~24주)', '임신성 당뇨 검사', '태동 기록 시작', '산모교실·임산부 요가', '출산 병원 결정', '태명 정하기'],
              },
              {
                period: '3삼분기 (28~40주)', color: '#EA580C',
                items: ['GBS 검사 (35~37주)', '출산 가방·신생아 용품', '아기침대·카시트', '산후조리원 예약', '분만 신호 학습', '응급 연락처 준비', '출산 휴가·육아 휴직 신청'],
              },
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${t.color}40`, borderLeft: `4px solid ${t.color}`, borderRadius: '12px', padding: '14px 18px' }}>
                <p style={{ fontSize: '13.5px', fontWeight: 700, color: t.color, marginBottom: '8px' }}>{t.period}</p>
                <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {t.items.map((it, j) => (
                    <li key={j} style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7 }}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            ⓘ 본 도구의 [체크리스트] 탭에서 28개 항목 진행률을 localStorage에 저장 추적할 수 있습니다. 개인 상황·고위험·다태아 시 추가/변경 항목 있을 수 있으니 담당 산부인과와 상담 권장.
          </p>
        </section>

        {/* ── 6. 생리주기 보정 (NEW) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            생리주기 보정의 중요성
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '14px' }}>
            네겔레 공식은 28일 주기 가정. 본인 주기가 다르면 실제 예정일과 차이가 발생합니다 —
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: 12 }}>
            {[
              { c: '24일 주기', d: '예정일 약 4일 빠름' },
              { c: '26일 주기', d: '예정일 약 2일 빠름' },
              { c: '28일 (표준)', d: '네겔레 공식 그대로' },
              { c: '30일 주기', d: '예정일 약 2일 늦음' },
              { c: '32일 주기', d: '예정일 약 4일 늦음' },
              { c: '35일 주기', d: '예정일 약 7일 늦음' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 13px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{r.c}</span>
                <span style={{ fontSize: 12.5, color: 'var(--text)' }}>{r.d}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>불규칙 주기 시</strong> — 초음파 기준 주수가 더 정확합니다. 본 도구 [고급 옵션]에서 본인 주기를 설정하면 자동 보정됩니다. 산부인과에서 초음파 기준으로 주수를 보정받았다면 그 결과를 우선 적용하세요.
          </p>
        </section>

        {/* ── 7. 임신 중 응급 신호 (NEW · 의료 필수 정보) ── */}
        <section>
          <div style={{ background: 'rgba(220,38,38,0.08)', border: '2px solid #DC2626', borderRadius: 12, padding: '18px 22px' }}>
            <p style={{ fontSize: '15px', fontWeight: 800, color: '#DC2626', marginBottom: '12px' }}>
              ⚠️ 임신 중 응급 신호 — 다음 증상 시 즉시 의료기관
            </p>
            <ul style={{ paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '5px', margin: 0 }}>
              {[
                '질 출혈 (소량이라도)',
                '심한 복통·경련',
                '발열 (38℃ 이상)',
                '심한 두통·시야 변화 (자간전증 의심)',
                '부종 급증 (얼굴·손)',
                '태동 감소 (2삼분기 이후)',
                '양수 누출 의심',
              ].map((s, i) => (
                <li key={i} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>{s}</li>
              ))}
            </ul>
            <p style={{ fontSize: '13px', color: 'var(--text)', marginTop: '12px', lineHeight: 1.7, fontWeight: 600 }}>
              📞 <strong style={{ color: '#DC2626' }}>119</strong> 또는 가까운 산부인과 응급실 / 한국 응급의료정보센터 <strong style={{ color: '#DC2626' }}>1339</strong>
            </p>
          </div>
        </section>

        {/* ── 8. FAQ (accordion) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={PREGNANCY_FAQ} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PREGNANCY_FAQ.map((faq, i) => (
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

        {/* ── 9. 면책 강화 ── */}
        <section>
          <div style={{ background: 'rgba(220,38,38,0.05)', border: '2px solid #DC2626', borderRadius: 12, padding: '18px 22px' }}>
            <p style={{ fontSize: '14px', fontWeight: 800, color: '#DC2626', marginBottom: '10px' }}>
              ⚕️ 의료 면책 조항 — 본 도구는 참고용이며 의학적 진단·치료 도구가 아닙니다
            </p>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '8px' }}>
              <strong style={{ color: 'var(--text)' }}>다음 사항을 반드시 명심해주세요</strong> — 정확한 임신 주수는 초음파 검사로만 확인 가능 / 본 도구의 산전 검사 일정은 일반 가이드라인 / 태아 크기·발달은 개체차 매우 큼(정상 범위 내 다양함) / 본 정보로 자가 진단·자가 처방 절대 X.
            </p>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85 }}>
              본 도구의 정보는 <strong style={{ color: 'var(--text)' }}>보건복지부·대한산부인과학회·WHO 공식 자료</strong>를 기반으로 일반화한 추정치이며, 개별 산모·태아에 적용 시 반드시 의료진 상담이 필요합니다.
              <br /><br />응급 시 — <strong style={{ color: '#DC2626' }}>119</strong> · 한국 응급의료정보센터 <strong style={{ color: '#DC2626' }}>1339</strong>.
            </p>
          </div>
        </section>

        {/* ── 참고 출처 (기존 유지·확장) ── */}
        <section>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>참고 출처</p>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                '보건복지부 임신·출산 가이드라인',
                '대한산부인과학회 (KSOG) 산전 진료 지침',
                'WHO 임산부 산전 진료 권고안',
                '미국 산부인과학회 (ACOG) 가이드라인',
              ].map((source, i) => (
                <li key={i} style={{ fontSize: '12px', color: 'var(--muted)' }}>{source}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/dday',         icon: '📅', name: 'D-day 계산기',           desc: '출산 예정일 카운트다운' },
              { href: '/tools/health/bmi',        icon: '⚖️', name: 'BMI 계산기',             desc: '임신 전·후 적정 체중' },
              { href: '/tools/health/weightloss', icon: '🎯', name: '체중 감량 기간 계산기',   desc: '산후 체중 관리 (출산 후)' },
              { href: '/tools/date/age',          icon: '🎂', name: '만 나이 계산기',         desc: '아이 나이·예방접종 일정' },
              { href: '/tools/health/bmr',        icon: '🔥', name: '기초대사량 계산기',       desc: '하루 칼로리 (임산부 +300)' },
              { href: '/tools/date/lunar',        icon: '🌙', name: '음양력 변환기',           desc: '명리·전통 활용 시' },
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
