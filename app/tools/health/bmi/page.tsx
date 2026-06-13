import Link from 'next/link'
import BmiClient from './BmiClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'

export const metadata = buildMetadata({
  path: '/tools/health/bmi',
  title: 'BMI 계산기 2026 — 체질량지수·키별 정상 체중·허리둘레·체중 시뮬',
  description:
    '키·몸무게로 비만도와 정상 체중 범위를 한눈에. 허리둘레·허리-신장비, 체중 시뮬, 체지방률 추정과 WHO·대한비만학회 기준 토글.',
  keywords: [
    'BMI 계산기', '체질량지수', '비만도 계산기', 'BMI 비만',
    '체중 계산기', 'BMI 정상 범위', '러닝 체중 관리',
    '정상 체중', '허리둘레', '복부비만',
    '체중 감량', '체지방률', '목표 BMI', '허리-신장비',
  ],
})

const FAQ_LD = [
              {
                q: 'BMI가 정상인데 왜 배가 나올까요?',
                a: 'BMI는 체지방의 분포를 반영하지 않습니다. 근육량이 적고 복부에 지방이 집중된 경우 BMI가 정상이어도 복부비만일 수 있습니다. 허리둘레가 남성 90cm, 여성 85cm 이상이면 복부비만으로 판정합니다. 본 도구의 <strong>[허리·체지방] 탭</strong>에서 BMI + 허리둘레를 종합해 "마른 비만"을 자동으로 감지합니다.',
              },
              {
                q: '운동선수나 근육량이 많은 사람의 BMI는 어떻게 해석하나요?',
                a: 'BMI는 근육과 지방을 구분하지 않아 근육량이 많은 운동선수는 BMI가 높게 나와도 실제로는 건강할 수 있습니다. 정확한 체성분 분석을 원한다면 인바디 검사나 체지방률 측정을 권장합니다. 본 도구의 <strong>[허리·체지방] 탭</strong>에서 Navy 공식 기반 추정값을 확인할 수 있습니다.',
              },
              {
                q: 'BMI를 낮추려면 얼마나 감량해야 하나요?',
                a: 'BMI 1 단위를 낮추려면 키에 따라 다르지만, 170cm 기준으로 약 <strong>2.9kg 감량</strong>이 필요합니다. 의학적으로 체중의 5~10%를 감량하면 혈압, 혈당, 콜레스테롤 수치 개선에 효과적이라고 알려져 있습니다. 본 도구의 BMI 결과 화면에서 <strong>"BMI 1당 ?kg"</strong> 정보를 본인 키 기준으로 자동 계산해 보여줍니다.',
              },
              {
                q: 'BMI 계산기는 어린이나 노인에게도 적용되나요?',
                a: 'BMI는 <strong>성인(18세 이상) 기준</strong>입니다. 어린이와 청소년은 나이와 성별을 고려한 백분위수 기준을 사용하고, 65세 이상 노인은 근감소증 위험으로 인해 BMI 22~27도 적정일 수 있습니다. 본 도구는 나이를 입력하면 청소년·고령자 안내를 자동으로 표시합니다.',
              },
              {
                q: 'BMI가 정상인데도 비만일 수 있나요?',
                a: 'BMI는 체중과 키만으로 계산하기 때문에 근육량과 체지방률을 구분하지 못합니다. 근육이 많은 운동선수는 BMI가 높아도 실제로는 건강한 체형일 수 있고, 반대로 BMI가 정상이어도 체지방률이 높은 <strong>"마른 비만"</strong>일 수 있습니다. 정확한 체성분 파악을 위해 체성분 분석(InBody 등)을 함께 활용하는 것이 좋습니다.',
              },
              {
                q: '한국 기준과 WHO 기준이 다른 이유는?',
                a: '아시아인은 서양인에 비해 같은 BMI에서 체지방률이 더 높고, 복부 비만 경향이 강해 심혈관 질환 위험이 더 높습니다. 이에 한국 비만학회는 WHO보다 낮은 기준(<strong>과체중 23 이상, 비만 25 이상</strong>)을 적용하고 있습니다. 본 도구는 두 기준을 토글로 제공해 결과 비교가 가능합니다.',
              },
              {
                q: '임산부는 BMI를 어떻게 해석해야 하나요?',
                a: '임신 중에는 체중이 자연스럽게 증가하므로 일반 BMI 기준을 그대로 적용하기 어렵습니다. <strong>임신 전 BMI</strong>를 기준으로 저체중(18.5 미만)은 12~18kg, 정상(18.5~24.9)은 11~16kg, 과체중(25 이상)은 7~11kg 증가를 권장합니다. 구체적인 목표는 담당 의사와 상담하세요.',
              },
              {
                q: 'BMI만으로 건강을 판단해도 될까요?',
                a: 'BMI는 비만도를 빠르게 파악하는 데 유용하지만 완벽한 지표는 아닙니다. <strong>허리둘레(복부비만), 체지방률, 혈압, 혈당, 콜레스테롤</strong> 수치 등을 함께 고려해야 종합적인 건강 상태를 평가할 수 있습니다. BMI와 함께 기초대사량(BMR) 계산기도 활용해 보세요.',
              },
              {
                q: '키별 정상 체중 범위는 어떻게 계산하나요?',
                a: '본 도구는 입력한 키에 따라 자동으로 계산합니다 — 저체중(BMI 18.5 미만)·정상(18.5~22.9 한국 / 18.5~24.9 WHO)·과체중·비만 모든 구간을 본인 키 기준 kg 범위로 변환해 표시합니다. 예: 키 170cm → 정상 53.5~66.5kg (한국 기준). 결과 화면의 <strong>"키별 체중 구간 표"</strong>에서 모든 구간이 한눈에 보입니다.',
              },
              {
                q: '허리-신장비는 무엇이며 어떻게 활용하나요?',
                a: '허리-신장비(WHtR)는 허리둘레를 키로 나눈 비율입니다 (허리cm ÷ 키cm). 기준 — 0.4 미만(매우 마름)·0.4~0.5(건강 범위)·0.5~0.6(복부비만 주의)·0.6 이상(복부비만). <strong>"허리둘레가 키의 절반을 넘지 않도록"</strong>이라는 단순 원칙(0.5 미만 유지)으로 기억하면 편리합니다. BMI보다 복부비만 위험을 직관적으로 파악할 수 있어 국제적으로 보조 지표로 자주 활용됩니다.',
              },
              {
                q: '체중 시뮬레이터는 어떻게 활용하나요?',
                a: '체중 시뮬레이터는 체중 변화에 따른 BMI 변화를 실시간으로 보여줍니다. <strong>"3kg 빼면 BMI 어떻게 될까?", "정상 BMI까지 얼마나 더?", "5kg 늘면 비만 진입할까?"</strong> 같은 질문을 슬라이더로 직관적으로 확인 가능합니다. 주당 0.3~0.5kg 페이스 시뮬레이터로 4·8·12·24주 후 예상 체중도 확인할 수 있습니다. 주당 0.5kg 초과 변화는 권장되지 않습니다.',
              },
              {
                q: '본 BMI 계산기 결과를 저장할 수 있나요?',
                a: '네, <strong>"💾 기록 저장"</strong> 버튼으로 BMI·체중·허리둘레·체지방률을 localStorage에 저장합니다. 회원가입·로그인 불필요, 같은 브라우저·기기에서만 접근 가능 (다른 기기는 백업 필요), 캐시 삭제 시 사라집니다. 최대 60개까지 저장되어 다이어트 진행 추적에 활용할 수 있습니다.',
              },
              {
                q: '체중 강박·다이어트 중독이 걱정됩니다.',
                a: 'BMI는 건강 지표 중 하나일 뿐, 자존감의 절대값이 아닙니다.<br><br><strong>체중 강박 신호</strong> — 매일·하루 여러 번 체중 측정 / 정상 체중인데 더 빼야 한다고 느낌 / 음식·운동 강박적 통제 / 외모·체중에 대한 부정적 사고 지속.<br><br><strong>도움 받기</strong><br>· 한국 정신건강 위기상담: <strong>1577-0199</strong> (24시간)<br>· 보건복지부 자살예방상담: <strong>1393</strong> (24시간)<br>· 가까운 정신건강복지센터 방문<br><br>건강한 체중 관리는 정신 건강 + 신체 건강 모두 고려해야 합니다.',
              },
            ]

export default function BmiPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·웰빙</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⚖️ BMI 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        키·몸무게로 비만도와 정상 체중 범위. <strong style={{ color: 'var(--text)' }}>허리둘레·체지방률 추정</strong>까지 한 화면에.
      </p>

      <BmiClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. BMI 공식 (기존 유지·보완) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            BMI 체질량지수 산출 공식
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            BMI(Body Mass Index)는 체중(kg)을 키(m)의 제곱으로 나눈 값입니다.
            1832년 벨기에 통계학자 아돌프 케틀레가 개발한 지표로, 현재 WHO와 전 세계 의료 기관에서
            비만도 판정의 표준 지표로 사용됩니다.
            한국인을 포함한 아시아인은 서양인보다 같은 BMI에서 체지방률이 높아
            대한비만학회에서는 별도 기준을 적용합니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '20px 22px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>BMI 계산 공식</p>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
              BMI = 체중(kg) ÷ 키(m)²
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              예시: 키 170cm, 체중 65kg → BMI = 65 ÷ (1.7 × 1.7) = <strong style={{ color: 'var(--accent)' }}>22.5</strong> (정상)
            </p>
          </div>
        </section>

        {/* ── 2. WHO vs 대한비만학회 기준표 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            BMI 기준표 — WHO vs 대한비만학회
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>분류</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>WHO 기준</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>대한비만학회 기준</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>건강 위험도</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['저체중',     '18.5 미만',   '18.5 미만',   '낮음 (영양불량 위험)', '#0891B2'],
                  ['정상',       '18.5 ~ 24.9', '18.5 ~ 22.9', '보통',                '#059669'],
                  ['과체중',     '25.0 ~ 29.9', '23.0 ~ 24.9', '약간 높음',           '#A16207'],
                  ['비만 1단계', '30.0 ~ 34.9', '25.0 ~ 29.9', '높음',                '#EA580C'],
                  ['비만 2단계', '35.0 ~ 39.9', '30.0 ~ 34.9', '매우 높음',           '#DC2626'],
                  ['비만 3단계', '40.0 이상',   '35.0 이상',   '고도 위험',           '#CC4444'],
                ].map(([label, who, korea, risk, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 700 }}>{label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{who}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{korea}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⓘ 본 도구는 두 기준을 모두 토글로 지원합니다. 한국인은 같은 BMI에서 체지방률이 더 높고 복부비만 경향이 강해 대한비만학회 기준을 권장합니다.
          </p>
        </section>

        {/* ── 3. 키별 정상 체중 범위 (기존 유지·확장) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            키별 정상 체중 범위 (대한비만학회 기준)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>키</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>정상 체중 범위</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>과체중 기준</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>비만 기준</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['150cm', '41.6 ~ 51.5kg', '51.6 ~ 56.2kg', '56.3kg 이상'],
                  ['155cm', '44.4 ~ 55.0kg', '55.1 ~ 60.1kg', '60.2kg 이상'],
                  ['160cm', '47.4 ~ 58.6kg', '58.7 ~ 64.0kg', '64.1kg 이상'],
                  ['165cm', '50.3 ~ 62.3kg', '62.4 ~ 68.1kg', '68.2kg 이상'],
                  ['170cm', '53.5 ~ 66.2kg', '66.3 ~ 72.3kg', '72.4kg 이상'],
                  ['175cm', '56.7 ~ 70.2kg', '70.3 ~ 76.6kg', '76.7kg 이상'],
                  ['180cm', '59.9 ~ 74.2kg', '74.3 ~ 81.0kg', '81.1kg 이상'],
                  ['185cm', '63.3 ~ 78.4kg', '78.5 ~ 85.6kg', '85.7kg 이상'],
                ].map(([height, normal, over, obese], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{height}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#059669' }}>{normal}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#A16207' }}>{over}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#DC2626' }}>{obese}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⓘ 본 도구의 결과 화면은 입력한 키 기준으로 모든 구간을 자동 표시합니다.
          </p>
        </section>

        {/* ── 4. 풍부한 결과 활용 가이드 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            풍부한 결과 활용 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            본 도구의 결과 카드는 다음 정보를 포함합니다 — &lsquo;내가 어디쯤인지&rsquo;, &lsquo;얼마나 더/덜 가야 하는지&rsquo;를 한눈에 파악할 수 있습니다.
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
            <li>· <strong style={{ color: 'var(--text)' }}>현재 BMI + 분류</strong> — 정상·과체중·비만 등 색상 코딩</li>
            <li>· <strong style={{ color: 'var(--text)' }}>BMI 게이지</strong> — 0~40 구간에서 현재 위치 시각화</li>
            <li>· <strong style={{ color: 'var(--text)' }}>키별 체중 구간</strong> — 본인 키 기준 저체중·정상·과체중·비만 자동 계산</li>
            <li>· <strong style={{ color: 'var(--text)' }}>정상 범위까지 거리</strong> — kg 단위로 부족·여유 표시</li>
            <li>· <strong style={{ color: 'var(--text)' }}>다음 단계 시작 체중</strong> — 과체중·비만 진입 경계</li>
            <li>· <strong style={{ color: 'var(--text)' }}>BMI 22까지 필요 감량</strong> — 한국 권장 BMI 도달까지</li>
            <li>· <strong style={{ color: 'var(--text)' }}>BMI 1 변화 = ?kg</strong> — 본인 키에서 BMI 1 단위 변화에 필요한 체중</li>
          </ul>
        </section>

        {/* ── 5. 허리둘레와 복부비만 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            허리둘레와 복부비만 — BMI의 한계 보완
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            BMI의 가장 큰 약점은 <strong style={{ color: 'var(--text)' }}>체지방 분포를 반영하지 못한다</strong>는 점입니다.
            근육 우세형(운동선수)·마른 비만 모두 BMI 단독으로는 구분할 수 없습니다. 본 도구는 허리둘레로 이를 보완합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(234,88,12,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#EA580C', marginBottom: '6px' }}>📐 허리둘레 기준 (대한비만학회)</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 남성: <strong style={{ color: 'var(--text)' }}>90cm 이상</strong> = 복부비만</li>
                <li>· 여성: <strong style={{ color: 'var(--text)' }}>85cm 이상</strong> = 복부비만</li>
                <li>· 측정: 배꼽 위 2cm, 호흡 후 자연 자세</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(8,145,178,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#0891B2', marginBottom: '6px' }}>📏 허리-신장비 (WHtR)</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 허리(cm) ÷ 키(cm)</li>
                <li>· <strong style={{ color: 'var(--text)' }}>0.5 미만</strong> 권장</li>
                <li>· &ldquo;허리둘레가 키의 절반을 넘지 말라&rdquo;</li>
              </ul>
            </div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>BMI + 허리둘레 종합 — 4가지 경우</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
              <p>✅ <strong style={{ color: '#059669' }}>BMI 정상 + 허리 정상</strong> — 건강한 체형. 현재 상태 유지 권장.</p>
              <p>⚠️ <strong style={{ color: '#A16207' }}>BMI 정상 + 허리 비만</strong> — 마른 비만 가능성. 근력 운동 + 식단 점검.</p>
              <p>⚠️ <strong style={{ color: '#0891B2' }}>BMI 비만 + 허리 정상</strong> — 근육 우세형 가능성. 체성분 검사 권장.</p>
              <p>🔴 <strong style={{ color: '#DC2626' }}>BMI 비만 + 허리 비만</strong> — 종합 비만. 의료 상담 필요.</p>
            </div>
          </div>
        </section>

        {/* ── 6. 목표 BMI 설정 가이드 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            목표 BMI 설정 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            모든 사람에게 동일한 BMI 목표가 최적이지는 않습니다. 상황별로 다음을 권장합니다 —
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: '👤', name: '일반 성인',          range: 'BMI 21~22 (한국 권장)',          desc: '건강 위험 최저 구간' },
              { icon: '💪', name: '운동·근육 관리',     range: 'BMI 22~24',                       desc: '근육량 포함 시 안전 범위' },
              { icon: '🥗', name: '다이어트 중',        range: 'BMI 18.5~22',                     desc: '정상 하한~상한, 무리하지 않게' },
              { icon: '🧓', name: '노인 (65세+)',       range: 'BMI 22~27',                       desc: '근감소증·낙상 위험 고려, 적정 가능' },
              { icon: '🏃', name: '마라톤·지구력',     range: 'BMI 18~21 (체중↓ 유리)',          desc: '단, 근육·골밀도 유지가 우선' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>{g.icon}</span>
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 2 }}>{g.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>{g.desc}</p>
                </div>
                <span style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800 }}>{g.range}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            ⓘ 단순히 BMI를 낮추는 것보다 <strong style={{ color: 'var(--text)' }}>체지방률·근육량을 함께 고려</strong>하는 것이 중요합니다. 무리한 감량은 요요·근손실을 유발합니다.
          </p>
        </section>

        {/* ── 7. 러너 전용 팁 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🏃 러닝 효율을 높이는 체중 관리
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            마라톤과 같은 지구력 운동에서는 체중과 기록이 밀접하게 연결됩니다.
            단순히 체중을 줄이는 것이 아니라 <strong style={{ color: 'var(--text)' }}>근육량을 유지하면서 체지방률을 조절</strong>하는 것이 기록 향상의 핵심입니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {[
              { icon: '⚡', color: '#0EA5E9', title: '체중과 러닝 기록의 관계',   content: '스포츠 과학 연구에 따르면 체중 1kg 감량 시 10km 레이스에서 약 2~3분, 마라톤에서 약 8~12분 기록이 향상될 수 있습니다. 단, 이는 근육량을 유지한 상태의 체지방 감량일 때 해당합니다.' },
              { icon: '⚠️', color: '#EA580C', title: '무리한 감량의 위험',         content: '마라톤과 같은 지구력 운동에서 낮은 BMI가 유리할 수 있지만, 무리한 체중 감량은 피로 골절, 근육 손실, 면역력 저하 등 부상 위험을 크게 높입니다. 특히 여성 러너의 경우 지나친 저체중은 골밀도 감소와 호르몬 이상을 유발할 수 있습니다.' },
              { icon: '🎯', color: '#0891B2', title: '러너에게 권장하는 BMI 범위', content: '엘리트 마라토너의 평균 BMI는 남성 약 18~20, 여성 약 17~19 수준이지만, 일반 러너는 정상 범위(18.5~22.9)를 목표로 하는 것이 건강하고 지속 가능합니다.' },
            ].map((tip, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${tip.color}30`, borderRadius: '12px', padding: '16px 20px', display: 'flex', gap: '14px' }}>
                <span style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }}>{tip.icon}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: tip.color, marginBottom: '6px' }}>{tip.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{tip.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '10px' }}>✅ 러너를 위한 체중 관리 핵심 요약</p>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                '급격한 체중 감량보다 주당 0.3~0.5kg 이내의 점진적 감량 권장',
                '단백질 섭취를 충분히 유지해 근육량 손실 방지 (체중 1kg당 1.2~1.6g)',
                '훈련 강도가 높은 시기에는 감량보다 컨디션 유지 우선',
                'BMI보다 체지방률(남성 10~15%, 여성 16~22%)이 더 정확한 지표',
              ].map((item, i) => (
                <li key={i} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 8. 체지방률 추정 정확도 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            체지방률 추정 정확도
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            본 도구의 체지방률 추정은 <strong style={{ color: 'var(--text)' }}>미 해군 군 측정법(Navy formula)</strong> 기반입니다 —
            성별·키·허리·목(여성은 엉덩이 추가)만으로 추정 가능하지만, 정확도는 <strong style={{ color: 'var(--text)' }}>±3~5%</strong>로 빠른 참고용입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>측정법</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>정확도</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>특징</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Navy 공식 (본 도구)', '±3~5%', '줄자만 있으면 가능, 빠른 추정'],
                  ['InBody (생체전기저항)', '±2~3%', '국내 헬스장·검진 보편화'],
                  ['DEXA (이중에너지 X선)', '±1~2%', '가장 정확, 의료기관'],
                  ['수중 체중법',          '±1%',   '전문 시설, 일반 활용 어려움'],
                  ['캘리퍼 (피부 두께)',   '±3~5%', '숙련도 영향 큼'],
                ].map(([m, a, d], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{m}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{a}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⓘ 본 도구의 체지방률은 빠른 추정용이며, 정확한 측정은 <strong style={{ color: 'var(--text)' }}>InBody 검사</strong>를 권장합니다. 다이어트 진척 추적은 측정법을 일관되게 유지하는 것이 더 중요합니다.
          </p>
        </section>

        {/* ── 9. FAQ (accordion 방식) ── */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* ── 면책 강화 ── */}
        <section>
          <Disclaimer variant="medical" open>
            BMI는 다음 한계가 있습니다 —
            근육량과 체지방을 구분하지 못함 / 체지방 분포(복부 vs 전신) 반영 X / 나이·성별·인종에 따라 해석 다름 / 운동선수·노인·임산부에 부적합할 수 있음.
            <br />
            <strong>종합적 건강 평가에는</strong> 허리둘레·체지방률 측정, 혈압·혈당·콜레스테롤 검사, 의료 전문가 상담이 함께 필요합니다.
            <br />
            체중 강박·거식증 우려 시 — 정신건강 위기상담 <strong>1577-0199</strong> · 자살예방 <strong>1393</strong> (24시간)
          </Disclaimer>
        </section>

        {/* ── 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmr',         icon: '🔥', name: '기초대사량(BMR) 계산기',     desc: '하루 기본 소비 칼로리 계산' },
              { href: '/tools/health/weightloss',  icon: '🎯', name: '체중 감량 기간 계산기',       desc: '칼로리 적자로 목표 달성일 예측' },
              { href: '/tools/sports/pace',        icon: '🏃', name: '러닝 페이스 계산기',         desc: '목표 기록별 적정 페이스' },
              { href: '/tools/health/supplement',  icon: '💊', name: '영양제 성분 체크',          desc: '영양제 중복·상한량 체크' },
              { href: '/tools/date/age',           icon: '🎂', name: '만 나이 계산기',             desc: '나이별 건강 관리 계획' },
              { href: '/tools/health/pregnancy',   icon: '🤰', name: '임신 주수·예정일 계산기',    desc: '임신 중 체중 증가 가이드' },
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
