import Link from 'next/link'
import SalaryClient from './SalaryClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import { buildSalaryTable, formatEok } from './salaryUtils'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/finance/salary',
  title: '연봉 실수령액 계산기 2026 — 월급·세후·4대보험·역산·연봉표',
  description:
    '세금·4대보험 떼고 통장에 진짜 꽂히는 월급. 2026년 최신 기준 4대보험·근로소득세 자동 + 월 실수령 역산·체감 시급(야근·출퇴근 포함)·1,800만~2억 연봉표.',
  keywords: [
    '연봉실수령액', '연봉계산기2026', '세후연봉', '실수령액계산',
    '4대보험계산기', '월급실수령액', '연봉실수령액표',
    '연봉 역산', '연봉 협상', '시급 계산', '연봉 인상률',
    '비과세 식대', '근로소득 간이세액표',
  ],
})

const won = (n: number) => Math.round(n).toLocaleString('ko-KR') + '원'

/* 부양가족 1인·비과세 0원 기준 2026년 연봉 실수령액표 (1,800만~2억, 빌드 시 생성) */
const SALARY_TABLE = buildSalaryTable(1, 0, 0)

const FAQ_LD = [
              {
                q: '부양가족 수가 늘어나면 실수령액이 얼마나 달라지나요?',
                a: '근로소득세는 부양가족 수에 따라 기본공제(1인당 연 150만 원)가 적용됩니다. 연봉 5,000만 원 기준 부양가족 1인보다 3인이면 월 소득세가 약 5~8만 원 줄어듭니다. 8세~20세 자녀는 추가 자녀세액공제도 함께 적용됩니다.',
              },
              {
                q: '식대 20만 원 비과세를 적용하면 실수령액이 얼마나 늘어나나요?',
                a: '식대 월 20만 원이 비과세 처리되면 연봉 4,000만 원 기준 월 약 2~3만 원, 연간 약 25~35만 원의 추가 절세 효과가 있습니다. 식대 + 자가운전 + 육아수당을 모두 적용하면 월 60만원 비과세로 <strong>연 100만원 이상</strong> 실수령이 늘 수 있습니다.',
              },
              {
                q: '연봉 협상 시 세전과 세후 중 어느 기준으로 이야기해야 하나요?',
                a: '대부분의 연봉 계약은 세전(gross) 기준으로 이루어집니다. 실제 생활비 계획은 세후(net) 실수령액을 기준으로 해야 합니다. 본 도구의 <strong>[역산] 탭</strong>으로 원하는 월 실수령액에 필요한 세전 연봉을 미리 확인해 협상 시작 금액을 결정하세요.',
              },
              {
                q: '프리랜서·개인사업자는 이 계산기를 사용할 수 없나요?',
                a: '이 계산기는 4대보험에 가입된 근로소득자(직장인) 기준입니다. 프리랜서는 3.3% 원천징수가 적용되며 종합소득세 신고를 통해 정산합니다. 개인사업자는 종합소득세·부가세 별도 계산이 필요합니다.',
              },
              {
                q: '본 계산기와 실제 월급명세서가 다른 이유는?',
                a: '본 계산기는 2026년 4대보험 요율과 국세청 근로소득 간이세액표 기반 추정입니다. 실제 차이가 발생하는 원인 — 회사별 비과세 항목(식대·교통비·복지) / 상여금·성과급(지급 시점 따라 변동) / 두루누리 사회보험 지원(소규모 사업장) / 부양가족 변동(출생·결혼) / 추가 공제(의료비·기부금 등). 정확한 금액은 회사 인사팀 또는 급여명세서를 확인하세요. 본 도구는 ±2~5% 오차 범위의 추정치입니다.',
              },
              {
                q: '월 실수령액 역산은 어떻게 활용하나요?',
                a: '<strong>[역산] 탭</strong>에서 원하는 월 실수령액(예: 300만원)을 입력하면 필요한 세전 연봉(약 4,250만원)이 자동 계산됩니다. 이직·연봉 협상 시 매우 유용합니다 — 본인이 원하는 생활비 수준 → 필요 연봉 → 협상 시작 금액 결정. 본 도구는 협상 안정 범위(원하는 연봉의 +1~6%)도 함께 제시합니다.',
              },
              {
                q: '연봉 인상 시 실수령은 얼마나 늘어나나요?',
                a: '인상률 그대로 실수령이 늘지 않습니다 (누진 세율 때문). 연봉 5,000만 → 5%(5,250만) 인상 시 월 약 +11만원(실수령률 +3.1%) / 10% 인상 시 월 +26만 / 20% 인상 시 월 +57만. 세전 인상률보다 실수령 인상률이 약 1~3%p 낮음. 특히 8,800만(24% → 35% 구간) 이상에서 차이가 커집니다. 인상 후 연봉을 <strong>[실수령액] 탭</strong>에 직접 입력하면 늘어나는 월 실수령을 바로 확인할 수 있습니다.',
              },
              {
                q: '13월 월급(연말정산)은 어떻게 계산되나요?',
                a: '본 도구는 매월 원천징수 기준이며, 연말정산은 별도입니다. <strong>환급 가능 항목</strong> — 의료비 / 카드 사용액 / 월세·전세 / 보험료·기부금 / 연금저축·IRP. <strong>추가 납부 가능</strong> — 미신고 부양가족 / 부양가족 소득 변동 / 비과세 미적용. 평균: 직장인 약 30~80만원 환급(개인별 차이 큼). 정확한 연말정산은 국세청 홈택스 &lsquo;연말정산 미리보기&rsquo; 활용을 권장합니다.',
              },
              {
                q: '체감 시급은 어떻게 계산하나요?',
                a: '<strong>체감 시급 = 연 실수령 ÷ 연간 총 노동 시간(출퇴근 포함)</strong>. 연봉 4,000만원·왕복 출퇴근 60분·주 5시간 야근 가정 시 — 세전 시급 약 16,000원 / 세후 시급 약 13,900원 / 야근 포함 약 11,800원 / 체감 시급 약 9,500원. 같은 연봉이라도 출퇴근 30분 vs 90분 차이로 약 17% 차이날 수 있습니다. 본 도구의 <strong>[실수령액] 탭</strong>에서 &lsquo;체감 시급 보기&rsquo; 옵션을 켜면 본인 조건으로 비교 가능합니다.',
              },
            ]

export default function SalaryPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        금융·재테크
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💴 연봉 실수령액 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        <strong style={{ color: 'var(--text)' }}>최신 세법 기준</strong>, 정확한 연봉 실수령액 계산기.
      </p>

      <UpdatedMeta date="2026년 5월" basis="2026년 4대보험 요율·근로소득 간이세액표 기준" sources={[{"label":"홈택스","href":"https://hometax.go.kr"},{"label":"4대 사회보험 정보연계센터","href":"https://www.4insure.or.kr"}]} />

      <SalaryClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 연봉 실수령액 표 (SEO 핵심) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            연봉 실수령액 표
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '8px' }}>
            부양가족 1인(본인만)·비과세 없는 순수 급여 기준 <strong style={{ color: 'var(--text)' }}>2026년</strong> 연봉별 실수령액(1,800만~2억). 국민연금·건강보험·장기요양·고용보험·근로소득세를 모두 반영했습니다.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--accent)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💡</span>
            표에 없는 연봉, 부양가족·자녀·비과세 조건은 상단 계산기에서 직접 확인하세요.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>연봉</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>월 세전</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>월 실수령</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>연 실수령</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>실수령률</th>
                </tr>
              </thead>
              <tbody>
                {SALARY_TABLE.map((row, i) => (
                  <tr key={row.yearly} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatEok(row.yearly)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{won(row.monthlyGross)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>{won(row.monthlyNet)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{formatEok(row.yearlyNet)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{row.takeHomeRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            ※ 부양가족 1인 기준·비과세 미적용·2026년 4대보험 요율 및 근로소득 간이세액표 반영. 부양가족·자녀·비과세 항목을 반영한 정확한 값은 상단 계산기에서 확인하세요.
          </p>
        </section>

        {/* ── 2. 4대보험 요율 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            근로자 4대보험 요율 및 변경사항 총정리
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            2026년에는 국민연금 보험료율이 27년 만에 인상되고 건강보험·장기요양보험 요율도 조정되었습니다.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>항목</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>근로자</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>사업주</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: '#EA580C',       fontWeight: 500, whiteSpace: 'nowrap' }}>변경</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['국민연금',     '4.75%',             '4.75%',      '▲ 4.5% → 4.75%'],
                  ['건강보험',     '3.595%',            '3.595%',     '▲ 3.545% → 3.595%'],
                  ['장기요양보험', '건보료 × 13.14%',   '동일',       '▲ 12.95% → 13.14%'],
                  ['고용보험',     '0.9%',              '0.9%+α',     '동결'],
                  ['산재보험',     '없음',              '업종별',     '근로자 부담 없음'],
                ].map(([label, worker, employer, change], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>{worker}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{employer}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#EA580C', fontSize: '12px', whiteSpace: 'nowrap' }}>{change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.8 }}>
            ※ <strong style={{ color: 'var(--text)' }}>국민연금</strong>은 월 보수 상한 <strong style={{ color: 'var(--text)' }}>637만원</strong>까지만 부과 (초과분 적용 X). <strong style={{ color: 'var(--text)' }}>장기요양보험</strong>은 건강보험료에 연동(건보료 × 13.14%)됩니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '6px' }}>💡 2026년 국민연금 인상 배경</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              정부는 국민연금 기금 고갈 문제를 해결하기 위해 2026년부터 보험료율을 기존 9%(근로자 4.5%)에서
              9.5%(근로자 4.75%)로 인상했습니다. 이는 1998년 이후 27년 만의 인상으로,
              2033년까지 단계적으로 13%까지 올릴 계획입니다.
            </p>
          </div>
        </section>

        {/* ── 3. 비과세 항목 (기존 유지·확장) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>주요 비과세 급여 항목</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            비과세 수당은 4대보험료와 근로소득세 산정 기준에서 제외됩니다.
            <strong style={{ color: 'var(--text)' }}> 월 60만원 비과세(식대·자가운전·육아) 적용 시 연 약 110만원 실수령 ↑</strong>이 가능합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { title: '식대',           limit: '월 20만원 이내',  desc: '회사 별도 지급 시 적용' },
              { title: '자가운전보조금', limit: '월 20만원 이내',  desc: '본인 차량으로 업무 사용 시' },
              { title: '출산·보육수당', limit: '월 20만원 이내',  desc: '6세 이하 자녀 양육' },
              { title: '연구보조비',     limit: '월 20만원 이내',  desc: '연구 전담 직원 한정' },
              { title: '생산직 야간수당', limit: '연 240만원 이내', desc: '월정액급여 210만원 이하' },
              { title: '취재수당',       limit: '월 20만원 이내',  desc: '기자 등 취재 업무 직원' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{item.title}</span>
                <span style={{ fontSize: '11px', color: 'var(--accent)', background: 'var(--accent-dim)', borderRadius: '99px', padding: '2px 8px', alignSelf: 'flex-start' }}>{item.limit}</span>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. 소득세 누진 구간 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            소득세 (근로소득 간이세액표) — 누진 구간
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '14px' }}>
            국세청이 매년 발표하는 간이세액표 기반 매월 원천징수 → 연말정산으로 정산.
            과세표준에 따라 6~45% 누진 세율이 적용되며, 지방소득세는 소득세의 10%가 별도 부과됩니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>과세표준</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>세율</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1,400만 이하',     '6%',  '신입·저소득 구간'],
                  ['1,400 ~ 5,000만', '15%', '한국 직장인 다수'],
                  ['5,000 ~ 8,800만', '24%', '중상위 구간'],
                  ['8,800만 ~ 1.5억', '35%', '실수령률 ↓ 시작'],
                  ['1.5억 ~ 3억',    '38%', '고소득'],
                  ['3억 ~ 5억',      '40%', ''],
                  ['5억 ~ 10억',     '42%', ''],
                  ['10억 초과',       '45%', '최고 세율'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⓘ 본 도구는 간이세액표 기반 추정 — 실제 연말정산은 의료비·기부금·신용카드 등 추가 공제로 달라집니다.
          </p>
        </section>

        {/* ── 5. 월 실수령 역산 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            월 실수령 역산 — 연봉 협상 활용
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>&lsquo;월 300만원 받으려면 연봉 얼마?&rsquo;</strong> — 1인 가구·식대 미적용 기준 추정 —
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>월 실수령 목표</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>필요 세전 연봉</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['200만원', '약 2,650만',    '신입 평균'],
                  ['250만원', '약 3,300만',    ''],
                  ['300만원', '약 4,250만',    '중위 수준'],
                  ['350만원', '약 5,200만',    ''],
                  ['400만원', '약 6,200만',    ''],
                  ['500만원', '약 8,500만',    '상위 20%'],
                  ['700만원', '약 1.4억',      '상위 5%'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⓘ 본 도구의 <strong style={{ color: 'var(--text)' }}>[역산] 탭</strong>에서 본인 부양가족·비과세 조건으로 정확한 역산이 가능합니다. 이직·연봉 협상 시 본인이 원하는 월 실수령을 기준으로 시작 금액을 결정하세요.
          </p>
        </section>

        {/* ── 6. 시급·체감 시급 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            시급·체감 시급
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>세전 시급</strong> = 연봉 ÷ (12개월 × 209시간) — 한국 표준은 주 40시간 + 주휴 포함 209시간/월. 연봉 4,000만원 기준 약 16,000원.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { name: '세전 시급', desc: '공식 시급 — 연봉 ÷ (12 × 209h)', color: 'var(--muted)' },
              { name: '세후 시급', desc: '실수령 ÷ 209h — 약 86~91% 수준', color: 'var(--accent)' },
              { name: '야근 포함', desc: '실수령 ÷ (근무 + 야근) — 야근 많을수록 ↓', color: '#CA8A04' },
              { name: '체감 (출퇴근 포함)', desc: '실수령 ÷ 총 노동 시간 — 출퇴근 90분이면 17%↓', color: '#EA580C' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${m.color}40`, borderRadius: 10, padding: '11px 14px' }}>
                <p style={{ fontSize: 13.5, color: m.color, fontWeight: 700, marginBottom: 3 }}>{m.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{m.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text)' }}>참고</strong> — 2026년 최저시급 10,320원 / OECD 평균 연 1,750시간 / 한국 평균 1,950시간. 왕복 출퇴근 2시간 이상 직장은 체감 시급이 최저시급 수준에 근접할 수 있습니다.
          </p>
        </section>

        {/* ── 7. 연봉별 실수령률 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            연봉별 실수령률 — 누진 구조
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            세전 대비 실수령률은 누진 세율로 고연봉일수록 낮아집니다 (1인 가구·식대 미적용 추정).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>세전 연봉</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>실수령률</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>월 실수령 (참고)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['2,000만',  '약 91%', '약 152만'],
                  ['3,000만',  '약 90%', '약 224만'],
                  ['4,000만',  '약 87%', '약 290만'],
                  ['5,000만',  '약 85%', '약 354만'],
                  ['7,000만',  '약 81%', '약 470만'],
                  ['1억',     '약 76%', '약 632만'],
                  ['1.5억',   '약 70%', '약 880만'],
                  ['2억',     '약 67%', '약 1,120만'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 8. 한국 직장인 연봉 분포 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            한국 직장인 연봉 분포 (2026년 기준 추정)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' }}>
            {[
              { name: '평균 연봉',   value: '약 4,200만원' },
              { name: '중위소득',    value: '약 3,500만원' },
              { name: '신입 평균',   value: '약 2,800만원' },
              { name: '대기업 평균', value: '약 7,200만원' },
              { name: '중견기업',    value: '약 5,200만원' },
              { name: '중소기업',    value: '약 3,800만원' },
              { name: '상위 10%',   value: '약 8,000만원+' },
              { name: '상위 5%',    value: '약 1억+' },
            ].map((p, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'Noto Sans KR' }}>{p.name}</span>
                <span style={{ fontSize: 14, color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{p.value}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
            출처: 통계청 임금근로자 평균 / 국세청 근로소득 신고 자료. 본 도구의 <strong style={{ color: 'var(--text)' }}>[실수령액] 탭</strong>에서 본인 연봉의 분포 위치를 자동으로 표시합니다.
          </p>
        </section>

        {/* ── 9. FAQ (accordion) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((faq, i) => (
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

        {/* ── 면책 ── */}
        <section>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>ⓘ 면책 조항</p>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85 }}>
              본 계산기는 <strong style={{ color: 'var(--text)' }}>2026년 4대보험 요율과 국세청 근로소득 간이세액표 기반 추정</strong>입니다. 법적 효력 X.
              실제 급여는 회사별 비과세 항목·복지, 상여금·성과급, 부양가족 정확한 정보, 연말정산 결과, 두루누리 사회보험 지원 등에 따라 차이날 수 있습니다.
              정확한 급여명세서·연말정산은 회사 인사팀 또는 세무사 상담을 권장합니다.
            </p>
          </div>
        </section>

        {/* ── 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/loan',     icon: '💳', name: '대출이자 계산기',    desc: '월 실수령으로 감당 가능한 대출' },
              { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기',        desc: '월급 일부 투자 시 미래 자산' },
              { href: '/tools/finance/stock',    icon: '📉', name: '주식 물타기 계산기', desc: '급여 투자 후 평단가 관리' },
              { href: '/tools/finance/vat',      icon: '🧾', name: '부가세 계산기',      desc: '사업소득 세금 계산' },
              { href: '/tools/life/dutch',       icon: '🍻', name: '더치페이 계산기',    desc: '회식·모임 정산' },
              { href: '/tools/finance/car',      icon: '🚗', name: '자동차 유지비 계산기', desc: '월 차량 운영비' },
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
