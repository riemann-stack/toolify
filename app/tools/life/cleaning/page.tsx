import Link from 'next/link'
import CleaningClient from './CleaningClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import UpdatedMeta from '@/components/UpdatedMeta'
import { AGENTS, MIX_RISKS } from './cleaningData'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/life/cleaning',
  title: '상황별 청소 세제 계산기 — 구연산·과탄산·베이킹소다·락스 사용량·안전',
  description:
    '화장실·주방·냉장고·창틀·유리·기름때 상황별 추천 세제와 정확한 희석량 자동 계산. 락스+산성=염소가스 등 절대 섞으면 안 되는 조합까지 안전하게.',
  keywords: ['청소세제계산기', '구연산사용법', '과탄산소다사용법', '베이킹소다청소', '락스희석', '천연세제', '청소꿀팁', '세제혼합위험', '곰팡이제거'],
})

const sectionTitle: React.CSSProperties = { fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }
const card: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px' }
const cell: React.CSSProperties = { padding: '9px 11px', borderBottom: '1px solid var(--border)', fontSize: '13px', color: 'var(--text)', verticalAlign: 'top' }
const headCell: React.CSSProperties = { padding: '9px 11px', textAlign: 'left', fontWeight: 700, fontSize: '11px', color: 'var(--muted)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)', whiteSpace: 'nowrap' }
const faqDetails: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', marginBottom: '8px' }
const faqSummary: React.CSSProperties = { cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }
const faqAnswer: React.CSSProperties = { marginTop: '10px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }

const FAQ_LD = [
  { q: '베이킹소다·과탄산소다·세스퀴소다는 뭐가 다른가요?', a: '모두 알칼리성이지만 세기와 용도가 다릅니다. <strong>베이킹소다</strong>는 가장 순하고 연마·탈취에, <strong>세스퀴소다</strong>는 중간 세기로 생활 기름때·물걸레 만능 청소에, <strong>과탄산소다</strong>는 산소계 표백제라 표백·찌든때·곰팡이·삶기에 강합니다(따뜻한 물 40~60℃에서 활성화). 강한 기름때엔 더 센 <strong>소다회</strong>를 쓰기도 합니다.' },
  { q: '구연산과 식초는 같은 건가요?', a: '둘 다 산성으로 <strong>물때·석회·비누때 제거, 냄새 중화, 섬유유연제 대체</strong>에 비슷하게 쓰입니다. 구연산은 가루라 보관·농도 조절이 쉽고 냄새가 거의 없으며, 식초는 액체라 바로 쓰기 편하지만 특유의 냄새가 있습니다. <strong>둘 다 락스와 절대 섞으면 안 됩니다(염소가스).</strong>' },
  { q: '락스는 어떻게 안전하게 쓰나요?', a: '① <strong>물로만</strong> 희석하고 다른 세제와 섞지 않습니다. ② 창문·환풍기로 <strong>환기</strong>하고 장갑·마스크를 씁니다. ③ 일반 살균·곰팡이 모두 물 1L당 락스 <strong>약 10~25ml</strong>면 충분합니다(가정용 4~6% 기준, CDC 권장 수준). 곰팡이는 표백보다 <strong>세척·건조·습기 원인 제거</strong>가 먼저입니다. ④ 사용 후 <strong>물로 충분히 헹구고</strong>, 식품이 닿는 면·금속·대리석에는 주의합니다. 색이 있는 천·줄눈은 탈색될 수 있습니다.' },
  { q: '절대 섞으면 안 되는 조합은 무엇인가요?', a: '<strong>락스 + 산성(구연산·식초)</strong> → 염소가스, <strong>락스 + 암모니아 세제</strong> → 클로라민 가스, <strong>락스 + 과탄산소다·과산화수소</strong> → 가스 발생·효과 상쇄. 모두 호흡기에 치명적일 수 있습니다. 그 외 산성+알칼리(구연산+베이킹 등)는 위험은 낮지만 서로 중화돼 세정력이 사라집니다. <strong>원칙은 “한 번에 한 가지 세제만”</strong>입니다.' },
  { q: '천연세제(구연산·과탄산 등)는 항상 더 안전한가요?', a: '“천연”이라고 무조건 순한 건 아닙니다. 과탄산소다·소다회는 알칼리성이 강해 피부·점막을 자극하고, 구연산도 농도가 높으면 자극적이며 대리석·금속을 부식시킵니다. <strong>장갑 착용·환기·테스트(눈에 안 띄는 곳 먼저)</strong>는 종류와 무관하게 권장합니다.' },
  { q: '냉장고나 식기에 락스를 써도 되나요?', a: '식품이 직접 닿는 면에는 <strong>락스보다 베이킹소다·중성세제·뜨거운 물</strong>을 권장합니다. 살균이 꼭 필요하면 묽게 희석한 뒤 <strong>반드시 물로 여러 번 헹궈</strong> 잔류를 없애세요. 냉장고 내부 냄새·세척은 베이킹소다수로 닦고 물걸레로 한 번 더 닦는 것이 안전합니다.' },
]

export default function CleaningPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="life" />상황별 청소 세제 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        상황만 고르면 <strong style={{ color: 'var(--text)' }}>맞는 세제·정확한 희석량·사용법</strong>을 자동으로. <strong style={{ color: 'var(--text)' }}>섞으면 위험한 조합</strong>까지 안전하게.
      </p>

      <CleaningClient />

      <GuideDivider />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', marginTop: '48px' }}>

        {/* 혼합 위험 */}
        <div>
          <h2 style={sectionTitle}>🚫 절대 섞으면 안 되는 조합</h2>
          <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '14px', padding: '8px 0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <tbody>
                {MIX_RISKS.map((m, i) => (
                  <tr key={i} style={{ borderBottom: i < MIX_RISKS.length - 1 ? '1px solid rgba(220,38,38,0.15)' : 'none' }}>
                    <td style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 700, color: m.level === 'danger' ? '#DC2626' : '#EA580C', width: '42%' }}>{m.combo}</td>
                    <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>{m.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            가장 중요한 원칙은 <strong style={{ color: 'var(--text)' }}>“한 번에 한 가지 세제만”</strong>, 그리고 <strong style={{ color: 'var(--text)' }}>“락스는 물로만 희석·단독·환기”</strong>입니다.
          </p>
        </div>

        {/* 세제 비교 */}
        <div>
          <h2 style={sectionTitle}>🧴 세제 10종 비교</h2>
          <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>세제</th>
                  <th scope="col" style={headCell}>구분</th>
                  <th scope="col" style={headCell}>잘 맞는 오염</th>
                  <th scope="col" style={headCell}>핵심 주의</th>
                </tr>
              </thead>
              <tbody>
                {AGENTS.map((a) => (
                  <tr key={a.id}>
                    <td style={{ ...cell, fontWeight: 700, color: a.color, whiteSpace: 'nowrap' }}>{a.name}</td>
                    <td style={{ ...cell, whiteSpace: 'nowrap' }}>{a.type}<br /><span style={{ color: 'var(--muted)', fontSize: '11px' }}>pH {a.ph}</span></td>
                    <td style={cell}>{a.uses}</td>
                    <td style={{ ...cell, color: 'var(--muted)' }}>{a.tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 핵심 원리 */}
        <div>
          <h2 style={sectionTitle}>🧪 산성 vs 알칼리 — 원리만 알면 쉬워요</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ ...card, borderTop: '3px solid #EA580C' }}>
              <p style={{ fontSize: '13px', color: '#EA580C', fontWeight: 700, marginBottom: '8px' }}>산성 (구연산·식초)</p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
                <strong>물때·석회·비누때·소변석</strong> 같은 <strong>알칼리성 오염</strong>을 녹입니다. 전기포트 스케일, 섬유유연제 대체에도.
              </p>
            </div>
            <div style={{ ...card, borderTop: '3px solid #059669' }}>
              <p style={{ fontSize: '13px', color: '#059669', fontWeight: 700, marginBottom: '8px' }}>알칼리 (베이킹·과탄산·소다회)</p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
                <strong>기름때·찌든때·단백질 오염</strong> 같은 <strong>산성 오염</strong>을 분해합니다. 과탄산은 표백·살균까지.
              </p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            반대 성질의 오염엔 효과가 약하고, <strong style={{ color: 'var(--text)' }}>산성과 알칼리를 섞으면 서로 중화</strong>돼 둘 다 무력화됩니다. 살균·곰팡이엔 <strong style={{ color: 'var(--text)' }}>락스·과탄산</strong>이 따로 필요합니다.
          </p>
        </div>

        {/* 실전 레시피 */}
        <div>
          <h2 style={sectionTitle}>🧽 상황별 실전 레시피 — 대표 4가지</h2>
          <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>상황</th>
                  <th scope="col" style={headCell}>세제·사용량</th>
                  <th scope="col" style={headCell}>절차 요약</th>
                  <th scope="col" style={headCell}>금지</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { s: '☕ 전기포트·가습기 물때', a: '구연산 30g/L (약 2.5큰술)', how: '포트는 물+구연산을 끓이고, 가습기는 끓이지 말고 1~2시간만 담근다 → 깨끗한 물로 2~3회 헹굼 → 포트는 맹물을 한 번 더 끓여 마무리', no: '락스' },
                  { s: '🕳️ 배수구 냄새·기름막', a: '베이킹소다 가루 1컵 (희석 없이)', how: '거름망 찌꺼기를 먼저 제거 → 가루를 붓고 뜨거운 물을 천천히 흘림 → 5~10분 뒤 더운물로 마무리. “베이킹소다+식초 거품”은 서로 중화돼 세정력이 거의 없는 통념', no: '식초(중화·거품 압력)' },
                  { s: '🪞 유리·거울 얼룩', a: '식초 — 물:식초 1:1 분무', how: '분무 후 극세사 천·신문지로 한 방향으로 닦고 마른 천으로 광내기. 직사광선 아래선 얼룩지니 그늘에서', no: '락스' },
                  { s: '🍳 레인지·후드 기름때', a: '과탄산소다 20g/L (약 1.5큰술) + 따뜻한 물 40~60℃', how: '녹인 즉시 오염면에 바르고 10~20분 불린 뒤 닦기 → 물걸레 마무리. 만든 용액을 분무기에 밀폐 보관하지 말 것(산소 방출)', no: '락스' },
                ].map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...cell, fontWeight: 700 }}>{r.s}</td>
                    <td style={cell}>{r.a}</td>
                    <td style={{ ...cell, color: 'var(--muted)' }}>{r.how}</td>
                    <td style={{ ...cell, color: 'var(--danger)', whiteSpace: 'nowrap' }}>{r.no}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            위 농도는 <strong style={{ color: 'var(--text)' }}>본 도구가 쓰는 기준값(통용 관행)</strong>입니다. 구연산·과탄산소다 같은 살림 세제의 사용 농도를 정한 국가기관 공식 기준은 확인되지 않아(2026-07 기준), <strong style={{ color: 'var(--text)' }}>제품 라벨에 사용량이 있으면 라벨이 우선</strong>합니다. 큰술 환산은 밥숟가락(약 15ml) 기준의 대략적 관행 값으로, 가루마다 무게가 다릅니다(1큰술당 구연산 약 12g·과탄산 약 13g·베이킹소다 약 14g — 본 도구 기준값).
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '8px' }}>
            제조사 공식 안내가 있으면 그쪽을 우선하세요. 예: 테팔은 전기포트 물때에 <strong style={{ color: 'var(--text)' }}>“물 가득 + 구연산 2스푼을 끓인 뒤 5~10분 방치, 여러 번 헹굼”</strong>을, 물 경도가 높은 지역은 3개월에 한 번 세척을 안내합니다(테팔 웹진). 그리고 어떤 레시피든 위 <strong style={{ color: 'var(--text)' }}>‘절대 섞으면 안 되는 조합’이 최우선</strong>입니다.
          </p>
        </div>

        {/* 세탁조 통세척 — 제조사 공식 */}
        <div>
          <h2 style={sectionTitle}>🌀 세탁조 통세척 — 제조사 공식 안내</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '12px' }}>
            본 도구의 세탁조 레시피(과탄산 1~2컵)를 쓰기 전에 <strong style={{ color: 'var(--text)' }}>내 세탁기 제조사의 공식 안내</strong>를 먼저 확인하세요. LG와 삼성은 권장 세제 계열부터 다릅니다.
          </p>
          <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>코스</th>
                  <th scope="col" style={headCell}>주기·알림</th>
                  <th scope="col" style={headCell}>세제·온도</th>
                  <th scope="col" style={headCell}>핵심 수칙</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { c: 'LG 통돌이 통세척·통살균', when: '월 1회 권장 · 전원 시 ‘tCL’ 표시가 시점 알림', what: '산소계 표백제 성분 함유 세탁조 클리너 권장', rule: '염소계·산성 클리너는 변색·부식 위험 · 6개월 이상 미사용 시 연속 3회' },
                  { c: 'LG 드럼·워시타워 통살균', when: '코스 실행 시', what: '온수 급수 후 60℃ 유지', rule: '워시타워는 [통살균] 버튼 1초 터치 후 시작' },
                  { c: '삼성 무세제통세척 (탑재 모델)', when: '알림이 보통 1~2개월에 한 번 표시(사용 횟수 따라 다름)', what: '세제 없이 70℃ 온수 자동 세척', rule: '온도·헹굼·탈수 변경 불가 · 세탁물 절대 투입 금지' },
                  { c: '삼성 통세척 코스 (미탑재 모델)', when: '월 1회 권장 · 세탁 19회 후 20~25회째 알림 점등', what: '액체 염소계 표백제 150~300ml 또는 세탁조 전용세정제', rule: '염소계 과량 투입은 고장 원인 · 완료 후 문 열어 건조' },
                ].map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...cell, fontWeight: 700 }}>{r.c}</td>
                    <td style={cell}>{r.when}</td>
                    <td style={cell}>{r.what}</td>
                    <td style={{ ...cell, color: 'var(--muted)' }}>{r.rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px', marginBottom: '16px' }}>
            요점: <strong style={{ color: 'var(--text)' }}>LG는 산소계(과탄산 계열) 클리너를 권장</strong>하는 반면, <strong style={{ color: 'var(--text)' }}>삼성 일반 모델의 통세척 코스는 염소계 표백제 또는 전용세정제</strong>를 안내합니다. 본 도구의 과탄산 레시피는 LG 권장 계열과 같은 방향이고, 삼성 안내대로 염소계를 쓸 때는 <strong style={{ color: 'var(--danger)' }}>식초·구연산·산소계 표백제와의 혼용 절대 금지</strong>(유해가스 — 삼성 공식 경고)가 위 ‘절대 섞으면 안 되는 조합’과 그대로 겹칩니다.
          </p>
          <UpdatedMeta
            date="2026년 7월"
            basis="LG전자·삼성전자서비스 고객지원 공식 안내 기준"
            sources={[
              { label: 'LG전자 통돌이 통세척', href: 'https://www.lge.co.kr/support/solutions-1430889036106' },
              { label: 'LG전자 워시타워 통살균', href: 'https://www.lge.co.kr/support/solutions-20153936989467' },
              { label: '삼성전자서비스 무세제통세척', href: 'https://www.samsungsvc.co.kr/solution/40255' },
              { label: '삼성전자서비스 통세척', href: 'https://www.samsungsvc.co.kr/solution/41708' },
            ]}
          />
        </div>

        {/* 재질별 주의 */}
        <div>
          <h2 style={sectionTitle}>🧱 재질별 주의 — 같은 오염이어도 세제가 다릅니다</h2>
          <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>재질</th>
                  <th scope="col" style={headCell}>피해야 할 세제</th>
                  <th scope="col" style={headCell}>권장</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { m: '대리석·천연석·인조대리석', avoid: '산성(구연산·식초) — 부식·광택 손상', ok: '중성세제, 전용 클리너' },
                  { m: '알루미늄', avoid: '알칼리(과탄산·소다회·세스퀴)·락스 — 변색', ok: '중성세제' },
                  { m: '도금·유광 금속 수전', avoid: '산성 장시간·연마 가루 — 도금 손상', ok: '중성세제, 부드러운 천' },
                  { m: '코팅(논스틱) 팬', avoid: '과탄산·소다회·연마 — 코팅 손상', ok: '중성세제, 미온수' },
                  { m: '고무 패킹·실리콘', avoid: '락스 장시간 접촉 — 경화·변색', ok: '짧게 도포 후 충분히 헹굼' },
                  { m: '아크릴·플라스틱', avoid: '알코올·강알칼리 — 변형·균열(크레이징)', ok: '중성세제' },
                  { m: '원목·마감 목재', avoid: '과한 수분·산성·표백 — 마감·결 손상', ok: '물기 짠 천, 전용 제품' },
                ].map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...cell, fontWeight: 700, whiteSpace: 'nowrap' }}>{r.m}</td>
                    <td style={{ ...cell, color: '#DC2626' }}>{r.avoid}</td>
                    <td style={{ ...cell, color: 'var(--muted)' }}>{r.ok}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            어떤 세제든 <strong style={{ color: 'var(--text)' }}>눈에 안 띄는 곳에 먼저 테스트</strong>하고, 재질을 모르면 가장 순한 중성세제부터 시도하세요.
          </p>
        </div>

        {/* FAQ */}
        <div>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          {FAQ_LD.map((f, i) => (
            <details key={i} style={faqDetails}>
              <summary style={faqSummary}>Q{i + 1}. {f.q}</summary>
              <div style={faqAnswer} dangerouslySetInnerHTML={{ __html: f.a }} />
            </details>
          ))}
        </div>

        {/* 면책 */}
        <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '12px', padding: '16px 20px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>
          <strong style={{ color: '#DC2626' }}>⚠️ 안전 안내</strong>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)' }}>
            본 도구의 희석량은 일반적인 권장 근사치이며 <strong style={{ color: 'var(--text)' }}>제품 라벨의 사용법·경고가 우선</strong>합니다. 어떤 세제든 <strong style={{ color: 'var(--text)' }}>환기·장갑·눈에 안 띄는 곳 먼저 테스트</strong>를 권장하고, 락스 등은 절대 다른 세제와 섞지 마세요. 어린이·반려동물 손에 닿지 않게 보관하고, 흡입·피부 이상 시 환기 후 의료기관에 문의하세요.
          </p>
        </div>

        {/* 관련 도구 */}
        <div>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/laundry-dry', icon: '🧺', name: '빨래 건조 시간 계산기', desc: '날씨·소재별 건조 시간' },
              { href: '/tools/cooking/food-storage', icon: '🧊', name: '식재료 보관 계산기', desc: '냉장·냉동 보관 기간' },
              { href: '/tools/life/unit-price', icon: '🏷️', name: '단위가격 계산기', desc: '세제 용량당 가격 비교' },
              { href: '/tools/health/uv-protection', icon: '☀️', name: '자외선 지수 계산기', desc: '빨래·이불 일광소독' },
            ].map((t, i) => (
              <Link key={i} href={t.href} style={{ ...card, display: 'block', textDecoration: 'none', padding: '14px 16px' }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
