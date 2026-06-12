import Link from 'next/link'
import DividendClient from './DividendClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import Disclaimer from '@/components/Disclaimer'

export const metadata = buildMetadata({
  path: '/tools/finance/dividend',
  title: '월배당 목표 자산 계산기 2026 — 배당 FIRE·역산·포트폴리오·종합과세 | Youtil',
  description: '매달 받고 싶은 배당액에서 필요한 원금·월 적립액 자동 역산. 포트폴리오, 종합과세 경계, ISA·연금저축 절세 시나리오 비교.',
  keywords: [
    '월배당계산기', '배당투자계산기', '월배당목표자산', 'FIRE계산기', '배당FIRE',
    '월100만원배당', '필요투자원금계산', '배당소득세계산기', '월적립역산',
    '배당포트폴리오', '종합과세경계', 'ISA배당', '연금저축배당',
    '월배당ETF', 'SCHD JEPI', 'DGI배당성장', '월별현금흐름',
  ],
})

const FAQ_LD = [
              {
                q: '세후 배당수익률과 세전의 차이는 얼마나 되나요?',
                a: '국내주식 배당소득세 15.4% 기준으로, 세전 5% 배당은 세후 4.23%가 됩니다. 즉 세후 기준으로 원금이 약 18% 더 필요합니다. 실제 수령액 기반으로 목표를 세우려면 반드시 세후 수익률로 계산해야 합니다.',
              },
              {
                q: '안전계수는 얼마로 설정하는 게 좋나요?',
                a: '기업의 배당 삭감, 배당 공백기, 환율 변동 등을 고려하면 110~120%를 권장합니다. 특히 해외 ETF 투자자라면 환율 리스크가 있어 120% 이상을 권장합니다. 배당 삭감 위험이 낮은 안정적 배당주(공기업, 우량 대형주)라면 100~110%도 충분합니다.',
              },
              {
                q: '월배당 ETF와 분기배당 ETF 중 어느 게 유리한가요?',
                a: '월배당 ETF는 현금흐름이 안정적이지만 수익률이 낮거나 분배금이 일정하지 않을 수 있습니다(JEPI, QYLD 등). 분기배당은 배당 성장주(SCHD, VIG 등)에 많으며 장기적으로 복리 효과가 더 높을 수 있습니다. 생활비가 필요하면 월배당, 재투자가 목적이면 분기배당이 유리합니다.',
              },
              {
                q: '금융소득 종합과세는 언제부터 해당되나요?',
                a: '이자소득과 배당소득의 합계가 연간 2,000만원을 초과하면 종합과세 대상이 됩니다. 배당수익률 4.5% 기준으로는 약 4억 4,000만원 이상 투자 시 해당될 수 있습니다. 이 경우 세율이 최대 49.5%까지 올라가므로 ISA 계좌, 연금저축 등 절세 계좌를 활용해야 합니다. 본 도구의 「종합과세 경계」 탭에서 한도 진행률을 확인할 수 있습니다.',
              },
              {
                q: '배당주 투자와 채권 이자 중 어느 게 더 유리한가요?',
                a: '채권은 원금 보장과 고정 이자로 안정적이지만 자본 이득이 없습니다. 배당주는 배당 성장과 주가 상승의 잠재력이 있지만 원금 손실 위험이 있습니다. 일반적으로 10년 이상 장기 투자 시 우량 배당주가 채권보다 총 수익률이 높은 경향이 있습니다. 두 자산을 분산해 보유하는 것이 안전합니다.',
              },
              {
                q: '월배당 100만원 만들려면 매월 얼마를 적립해야 하나요?',
                a: '본 도구의 「월 적립 역산」 탭 사용. 시드 1,000만 + 4.5% + 시세차익 3% + 배당 재투자 가정 — 5년: 월 약 423만(비현실적), 10년: 월 약 173만(도전적), 20년: 월 약 55만(합리적), 30년: 월 약 21만(매우 합리적). 기간이 핵심이며 배당 재투자·복리 효과로 후반 가속됩니다. 일찍 시작할수록 부담이 1/N로 감소.',
              },
              {
                q: '종합과세에 진입하지 않는 안전한 투자 원금은 얼마인가요?',
                a: '배당수익률에 따라 다름 — 4%: 약 5억까지, 4.5%: 약 4.4억, 5%: 약 4억, 6%: 약 3.3억, 7%: 약 2.9억 (모두 연 2,000만 도달 기준). 초과 시 ISA·연금저축·IRP로 분산 권장. 특히 ISA는 종합과세 비포함이므로 「한도 외」 효과가 있습니다.',
              },
              {
                q: '분기 배당주만 투자하면 월별 현금흐름이 들쭉날쭉한가요?',
                a: '네, 한국·미국 분기 배당주 대부분이 3·6·9·12월에 집중 지급. 1·2·4·5·7·8·10·11월은 배당이 거의 0이라 월별 생활비 운용이 어렵습니다. 대안: 월배당 ETF(JEPI·QYLD·NOBL 등) 비중 ↑, 시기 다른 분기 ETF 분산(1·4·7·10월 vs 3·6·9·12월), 채권·예금 일부 보유. 본 도구의 「포트폴리오」 탭에서 12개월 막대 차트로 시각화.',
              },
              {
                q: 'ISA·연금저축 같은 절세 계좌가 진짜 효과 있나요?',
                a: '네, 장기일수록 효과 큼. 같은 30년 / 4.5% / 월 적립 30만 가정 — 일반(15.4%): 누적 세금 약 2,772만, ISA(9.9%): 약 1,584만, 연금저축·IRP(5.5%): 약 990만 + 세액공제 30년 누적 약 4,500만. 특히 연금저축·IRP는 매년 16.5% 세액공제(총급여 5,500만 이하), 연 600만 한도 → 연 99만 환급, 30년 누적 환급액 약 3,000~4,500만. ⚠️ ISA·연금저축은 의무 기간이 있으므로 본인 자금 흐름 고려 후 선택.',
              },
              {
                q: '미국 배당 ETF는 환율 변동을 어떻게 고려해야 하나요?',
                a: 'USD/KRW 변동 ±10% → 배당 ±10%. 예: SCHD 분배금 $100 + 환율 1,300원: 13만원, 1,400원: 14만원(+8%), 1,500원: 15만원(+15%). 환율 변동 대응: ① 환헤지 ETF(수수료 ↑), ② 분할 매수(환율 평균화), ③ 원화 + 달러 자산 분산, ④ 장기 보유(환율 평균에 수렴). 본 도구의 「포트폴리오」 탭 환율 변동 영향 표 참고.',
              },
              {
                q: '본 계산기는 종목 추천을 해주나요?',
                a: '아닙니다. 본 도구는 입력값 기반의 수학적 시뮬레이션이며, 종목 추천이나 투자 자문이 아닙니다. 과거 배당이 미래 배당을 보장하지 않으며, 배당주는 기업 실적·정책·환율·세금 변화로 분배금이 줄거나 끊길 수 있습니다. 가입 전 본인 분석·산업 동향·투자 성향 검토 필요. 문의: 한국 금융감독원 e-금융민원 1332.',
              },
            ]

export default function DividendPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💰 월배당 목표 자산 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        매달 받고 싶은 배당액에서 거꾸로 — <strong style={{ color: 'var(--text)' }}>필요한 원금과 월 적립액</strong>, ISA·연금 절세까지.
      </p>

      <DividendClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 계산 공식 (기존 SEO 보존) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            핵심 계산 공식 4단계
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {[
              { n: 'STEP 1', f: '연 목표 배당금 = 월 목표 × 12' },
              { n: 'STEP 2', f: '세후 수익률 = 연 배당수익률 × (1 − 세율)' },
              { n: 'STEP 3', f: '보정 연 목표 = 연 목표 × 안전계수' },
              { n: 'STEP 4', f: '필요 원금 = 보정 연 목표 ÷ 세후 수익률' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '12px', fontWeight: 800, color: 'var(--accent)', flexShrink: 0, letterSpacing: '0.06em' }}>{s.n}</span>
                <span style={{ fontSize: '13px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{s.f}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: '10px', padding: '14px 18px' }}>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>예시: 월 100만원, 연 4.5%, 세율 15.4%</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, margin: 0, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>
              → 세후수익률 = 4.5% × (1−0.154) = <strong style={{ color: 'var(--accent)' }}>3.807%</strong><br />
              → 필요원금 = 1,200만원 ÷ 0.03807 = <strong style={{ color: 'var(--accent)' }}>약 3억 1,523만원</strong>
            </p>
          </div>
        </div>

        {/* ── 2. 목표 월배당금별 필요 원금 (기존 SEO 보존) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            목표 월배당금별 필요 원금
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>
            * 세율 15.4%, 연 4.5% 배당수익률 기준
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['목표 월배당', '연 배당 필요', '필요 원금'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { m: '월 30만원',  a: '360만원',   p: '약 9,457만원' },
                  { m: '월 50만원',  a: '600만원',   p: '약 1억 5,761만원' },
                  { m: '월 100만원', a: '1,200만원', p: '약 3억 1,523만원' },
                  { m: '월 200만원', a: '2,400만원', p: '약 6억 3,046만원' },
                  { m: '월 300만원', a: '3,600만원', p: '약 9억 4,569만원' },
                  { m: '월 500만원', a: '6,000만원', p: '약 15억 7,614만원' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.m}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 600, textAlign: 'right' }}>{r.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 배당소득세 완전 가이드 (기존 SEO 보존) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            배당소득세 완전 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {[
              { t: '🇰🇷 국내 주식', c: '#0EA5E9', r: '15.4%', d: '배당소득세 14% + 지방소득세 1.4%. 증권사가 원천징수 후 입금.' },
              { t: '🇺🇸 해외 ETF', c: '#0891B2', r: '15.0%', d: '미국 배당의 경우 조세조약으로 현지 원천징수. 추가 국내 과세 없음(2,000만원 이하).' },
              { t: '📊 종합과세', c: '#EA580C', r: '6.6~49.5%', d: '연간 금융소득 2,000만원 초과 시 다른 소득과 합산. 과표 구간별 누진세율.' },
            ].map((z, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${z.c}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: z.c, fontWeight: 700, marginBottom: '4px' }}>{z.t}</p>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>{z.r}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{z.d}</p>
              </div>
            ))}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['금융소득 구간', '세율', '비고'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { r: '2,000만원 이하',       t: '15.4%',    n: '분리과세' },
                  { r: '2,000만 ~ 5,000만원',  t: '26.4%',    n: '종합과세 (과표 구간별)' },
                  { r: '5,000만원 초과',        t: '38.5%~',   n: '다른 소득과 합산' },
                  { r: '과표 10억원 초과',      t: '49.5%',    n: '최고 세율' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
            * 배당수익률 4.5% 기준, 투자 원금 <strong style={{ color: 'var(--text)' }}>약 4억 4,444만원 이상</strong>이면 종합과세 구간 진입을 검토해야 합니다. ISA·연금저축 등 절세 계좌 활용 권장 — 본 도구의 「절세 계좌」 탭 참고.
          </p>
        </div>

        {/* ── 4. 고배당 함정 (기존 SEO 보존) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            ⚠️ 고배당 함정 주의 안내
          </h2>
          <div style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '14px' }}>
            <p style={{ fontSize: '13px', color: '#EA580C', fontWeight: 700, marginBottom: '6px' }}>수익률 경고 구간</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
              <strong>7% 이상</strong> — 주의 필요 &nbsp;·&nbsp; <strong>10% 이상</strong> — 함정 배당 가능성 높음
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            {[
              { n: '①', t: '주가 하락으로 배당수익률이 올라간 경우 (분자 상승이 아닌 분모 하락)' },
              { n: '②', t: '배당성향(배당금/순이익) 100% 이상 — 순이익보다 많이 지급, 지속 불가' },
              { n: '③', t: '커버드콜 ETF의 프리미엄 감소 리스크 (변동성 하락 국면에서 수익률 급락)' },
              { n: '④', t: '리츠(REITs) — 금리 인상 시 주가 하락과 임대료 하락 이중 타격' },
            ].map((w, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '12px' }}>
                <span style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '16px', fontWeight: 800, color: '#EA580C', flexShrink: 0 }}>{w.n}</span>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, margin: 0 }}>{w.t}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: '#059669', fontWeight: 700, marginBottom: '6px' }}>✅ 안전한 고배당 기준</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
              배당수익률 <strong>4~6%</strong> · 배당성향 <strong>50~70%</strong> · <strong>10년 이상</strong> 배당 유지 기록
            </p>
          </div>
        </div>

        {/* ── 5. 배당 성장 투자 전략 DGI (기존 SEO 보존) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            배당 성장 투자 전략 (DGI)
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 22px', marginBottom: '14px' }}>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '17px', fontWeight: 700, color: 'var(--accent)', textAlign: 'center', margin: '0 0 6px' }}>
              &ldquo;지금 3%로 시작해도 10년 후 6%가 될 수 있다&rdquo;
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', margin: 0 }}>
              DGI(Dividend Growth Investing) — 원금 대비 yield on cost 개념
            </p>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '10px' }}>
            배당 성장률 연 <strong style={{ color: 'var(--text)' }}>7%</strong> 가정 시 원금 대비 수익률 변화:
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['현재 수익률', '10년 후', '20년 후'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { s: '2.5%', a: '4.9%', b: '9.7%' },
                  { s: '3.0%', a: '5.9%', b: '11.6%' },
                  { s: '4.0%', a: '7.9%', b: '15.5%' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 600 }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', color: '#059669', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
            * SCHD·VIG·코카콜라·P&G 등 배당 귀족주(Dividend Aristocrats)가 이 전략의 대표 종목.
          </p>
        </div>

        {/* ── 6. 월 적립 역산 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🎯 월 적립 역산 — &ldquo;월배당 100만 만들려면 월 얼마?&rdquo;
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            「월 적립 역산」 탭은 목표 월배당 + 기간 + 시드 + 배당 재투자 가정을 받아 <strong style={{ color: '#A16207' }}>이진 탐색</strong>으로 필요 월 적립액을 계산하고,
            결과를 4단계(매우 합리적/합리적/도전적/비현실적) 배지로 평가합니다.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>월배당 100만 목표 + 시드 1,000만</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: '#A16207', fontWeight: 700 }}>월 적립 필요</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>현실성</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['5년 / 4.5%',  '월 약 423만',   '🔴 비현실적'],
                  ['10년 / 4.5%', '월 약 173만',   '🟡 도전적'],
                  ['15년 / 4.5%', '월 약 93만',    '🟡 도전적'],
                  ['20년 / 4.5%', '월 약 55만',    '🔵 합리적'],
                  ['30년 / 4.5%', '월 약 21만',    '🟢 매우 합리적'],
                  ['30년 / 6%',   '월 약 9만',     '🟢 매우 합리적'],
                  ['30년 / 7%',   '월 약 4만',     '🟢 매우 합리적'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#A16207', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ※ 시세 차익 3% + 배당 재투자 + 안전계수 100% 가정. 기간을 2배 늘리면 월 적립이 약 1/3로 감소 — <strong style={{ color: 'var(--text)' }}>일찍 시작이 핵심</strong>.
          </p>
        </div>

        {/* ── 7. 배당 포트폴리오 구성 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            📊 배당 포트폴리오 구성 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구의 「포트폴리오」 탭은 자산별 투자금·수익률·배당 주기를 입력하면 종합 가중평균 + 월별 현금흐름 + 환율 영향을 자동 계산합니다.
            현실적인 1.5억 가정 조합:
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>자산</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>투자금</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: '#0891B2', fontWeight: 700 }}>배당수익률</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>주기</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['국내 배당주 (KT&G·SK텔레콤 등)', '5,000만', '4.0%', '분기'],
                  ['미국 ETF (SCHD·VIG)',          '5,000만', '3.5%', '분기'],
                  ['월배당 ETF (JEPI 등)',          '3,000만', '7.0%', '월',   '⚠ 변동성'],
                  ['한국 리츠 (제이알·맵스)',       '2,000만', '6.0%', '분기'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}{row[4] && <span style={{ marginLeft: 8, color: '#EA580C', fontSize: 11 }}>{row[4]}</span>}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#0891B2', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ※ 위 조합(도구 기본 프리셋·총 1.5억) → 가중평균 세전 약 4.70%(세후 3.99%) / 월 평균 약 49.8만 (세후). 「포트폴리오」 탭에서 자유롭게 조합 가능.
            JEPI·QYLD 등 커버드콜 ETF는 변동성 손실 위험이 있어 비중 신중.
          </p>
        </div>

        {/* ── 8. 월별 현금흐름 — 분기 배당의 함정 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            📅 월별 현금흐름 — 분기 배당의 함정
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            한국·미국 분기 배당주 대부분이 <strong style={{ color: 'var(--text)' }}>3·6·9·12월</strong>에 집중 지급되어,
            1·2·4·5·7·8·10·11월에는 배당이 거의 없어 현금흐름이 들쭉날쭉할 수 있습니다.
            본 도구의 「포트폴리오」 탭에서 12개월 막대 차트로 시각화 가능.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(234,88,12,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#EA580C', fontWeight: 700, marginBottom: 6 }}>⚠️ 분기 배당 위주 단점</p>
              <ul style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 16, margin: 0 }}>
                <li>3·6·9·12월에 배당 집중</li>
                <li>나머지 8개월은 거의 0</li>
                <li>월별 생활비 운용 어려움</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(16,185,129,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#059669', fontWeight: 700, marginBottom: 6 }}>✅ 월별 격차 줄이기</p>
              <ul style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 16, margin: 0 }}>
                <li>월배당 ETF 비중 ↑ (변동성 주의)</li>
                <li>시기 다른 분기 ETF 분산 (1·4·7·10 vs 3·6·9·12)</li>
                <li>채권·예금 일부 보유 → 비배당월 보충</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 9. 종합과세 회피 전략 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🛡️ 금융소득 종합과세 회피 전략
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            금융소득(이자+배당) 합계가 연 <strong style={{ color: 'var(--text)' }}>2,000만원 초과</strong> 시 종합과세 누진세 (최대 49.5%)로 전환됩니다.
            본 도구의 「종합과세 경계」 탭에서 한도 진행률·세율 적용을 시각화합니다.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { name: 'ISA 계좌',     color: '#0891B2',  desc: '200~400만 비과세 + 9.9% 분리과세 · 종합과세 비포함 · 연 2,000만 한도 / 총 1억' },
              { name: '연금저축',     color: '#A16207',  desc: '5.5% 분리과세 (55세 이후) + 16.5% 세액공제 · 연 600만 한도' },
              { name: 'IRP',          color: '#9333EA',  desc: '연금저축 합산 연 900만 한도 · 추가 300만 세액공제' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${s.color}55`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: s.color, fontWeight: 700, marginBottom: 6 }}>{s.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 12 }}>
            ※ 그 외 자산 분산(부부 명의·시점 분산), 자녀 명의(증여세 별도)도 활용 가능.
            정확한 세무 결정은 한국 국세청 126 또는 세무사 상담 권장.
          </p>
        </div>

        {/* ── 10. 환율 변동 영향 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            💱 환율 변동 영향 — 미국 ETF (서학개미)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            USD/KRW 변동 ±10% → 원화 배당 ±10%. 장기 평균은 1,200~1,400 변동.
            예: SCHD 분배금 $100 + 환율
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 360 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>환율</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: '#0891B2', fontWeight: 700 }}>$100 → 원화</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>변동</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1,200원/$',  '120,000원', '-7.7%'],
                  ['1,300원/$',  '130,000원', '기준'],
                  ['1,400원/$',  '140,000원', '+7.7%'],
                  ['1,500원/$',  '150,000원', '+15.4%'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#0891B2', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: row[2].startsWith('+') ? '#059669' : row[2] === '기준' ? 'var(--muted)' : '#DC2626', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ※ 환율 변동 대응: 환헤지 ETF (수수료 ↑), 분할 매수 (환율 평균화), 원화 + 달러 자산 분산, 장기 보유 (평균 수렴).
          </p>
        </div>

        {/* ── 11. FAQ (accordion - salary style) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
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
        </div>

        {/* ── 12. 면책 ── */}
        <Disclaimer variant="finance" open>
          본 월배당 계산기는 <strong>수학적 시뮬레이션 도구</strong>이며, 투자 자문·종목 권유 도구가 아닙니다.
          <ul style={{ paddingLeft: 18, margin: '6px 0 0' }}>
            <li>과거 배당이 미래 배당을 보장하지 않습니다</li>
            <li>배당주는 기업 실적·정책·환율·세금 변화로 분배금이 줄거나 끊길 수 있습니다</li>
            <li>고배당(7%↑·10%↑)은 함정 가능성 — 분자 상승이 아닌 분모 하락 점검 필수</li>
            <li>커버드콜 ETF(JEPI·QYLD)는 변동성 손실 위험</li>
            <li>본인 투자 성향·기간·세무 상황에 맞는 결정 필수</li>
          </ul>
          <p style={{ margin: '8px 0 4px', fontWeight: 600 }}>투자 도움 필요 시:</p>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li>한국 금융감독원 e-금융민원: <strong>1332</strong></li>
            <li>한국 국세청 (세무 상담): <strong>126</strong></li>
            <li>거래 증권사 고객센터 상담</li>
            <li>큰 손실로 인한 정신적 어려움 시 — 한국 정신건강 위기상담: <strong>1577-0199</strong></li>
          </ul>
        </Disclaimer>

        {/* ── 13. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기',          desc: '배당 재투자 시뮬레이션 — ISA·연금 절세 비교' },
              { href: '/tools/finance/salary',   icon: '💰', name: '연봉 실수령액 계산기', desc: '월 투자 여력 파악' },
              { href: '/tools/finance/loan',     icon: '💳', name: '대출이자 계산기',       desc: '대출 vs 투자 비교' },
              { href: '/tools/finance/stock',    icon: '📉', name: '주식 물타기 계산기',   desc: '배당주 추가 매수 시 평단 관리' },
              { href: '/tools/finance/vat',      icon: '🧾', name: '부가세 계산기',        desc: '사업소득 + 배당소득 종합' },
              { href: '/tools/finance/real-estate', icon: '🏘️', name: '부동산 투자 수익률', desc: '월세 vs 배당 비교' },
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
