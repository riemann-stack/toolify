import Link from 'next/link'
import VentilationClient from './VentilationClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'
import { SPACE_STANDARDS, CO2_BY_ACTIVITY, estimateCO2Risk } from './ventilationUtils'

/* ── 가이드 표·예시 — 빌드 시 ventilationUtils의 기준표·CO₂ 모델로 생성 (손으로 옮겨 적지 않는다) ── */
const nf = (v: number, d = 0) => v.toLocaleString('ko-KR', { minimumFractionDigits: d, maximumFractionDigits: d })
const OUTDOOR_PPM = 420   // ventilationUtils estimateCO2Risk의 외기 농도와 같음
const LIMIT_PPM = 1000
/* 정상상태 질량수지: 1인당 외기량(㎥/h) = CO₂ 발생량(㎥/h) ÷ (허용 농도 − 외기 농도) */
const PER_PERSON_ROWS = CO2_BY_ACTIVITY.map(a => ({
  ...a,
  airPerPerson: (a.co2LperHour / 1000) / ((LIMIT_PPM - OUTDOOR_PPM) / 1_000_000),
}))
/* 예시: 5평(16.5㎡) 침실 · 천장 2.4m · 2명 취침 */
const BED_VOL = 16.5 * 2.4
const BED_CLOSED = estimateCO2Risk({ volume: BED_VOL, occupants: 2, durationMinutes: 480, airflowM3PerHour: 0, activityId: 'rest' })!
const BED_05 = estimateCO2Risk({ volume: BED_VOL, occupants: 2, durationMinutes: 480, airflowM3PerHour: BED_VOL * 0.5, activityId: 'rest' })!
const BED_NEED = 2 * PER_PERSON_ROWS.find(r => r.id === 'rest')!.airPerPerson

export const metadata = buildMetadata({
  path: '/tools/interior/ventilation',
  title: '환기량 계산기 — ACH·CO₂·공기청정기·창문 환기 시간',
  description:
    '공간 부피·인원·ACH로 필요 환기량 + 공기청정기 CADR 매칭·CO₂ 위험·창문 환기 권장 시간. 학교·회의실 등 용도별 권장 ACH 표와 미세먼지 날 환기 요령까지 안내합니다.',
  keywords: [
    '환기량 계산', 'ACH 계산', '공기청정기 CADR', 'CO2 농도',
    '창문 환기 시간', '회의실 환기', '교실 환기',
    '공간 용도별 환기 횟수', '한국 환기 기준', '실내 공기질',
  ],
})

const FAQ_LD = [
              {
                q: '공기청정기만 켜면 환기 안 해도 되나요?',
                a: '<strong>아닙니다.</strong> 공기청정기는 미세먼지·일부 입자만 줄이며, <strong>CO₂·산소·냄새·습기는 외부 공기와의 환기로만 해결</strong>됩니다. 신선한 외부 공기 도입은 공기청정기로 대체할 수 없습니다. 미세먼지 나쁜 날에도 5~10분 짧게 환기 후 공기청정기를 가동하는 것을 권장합니다.',
              },
              {
                q: '우리 집 환기 횟수가 얼마나 되는지 어떻게 알 수 있나요?',
                a: '다음 방법으로 확인 — ① <strong>환풍기·전열교환기 사양</strong>(㎥/h 표시) ÷ 공간 부피 = ACH / ② <strong>공기청정기 CADR</strong> 확인 (실내 순환량) / ③ <strong>창문 환기는 본 도구의 [창문 환기] 탭</strong> 활용. 30세대 이상 신축 공동주택은 「건축물의 설비기준 등에 관한 규칙」에 따라 시간당 0.5회 이상 환기할 수 있는 설비를 갖춰야 해서, 최근 아파트는 대부분 기계 환기 설비(전열교환기)가 설치되어 있습니다.',
              },
              {
                q: 'CADR 100 vs 표시면적 30㎡, 어느 게 큰가요?',
                a: '<strong>표시면적 30㎡ 쪽이 약 2배 이상 큽니다.</strong> 대략적 환산 — 표시면적 (㎡) × 7~8 ≈ CADR (㎥/h). 즉 <strong>표시면적 30㎡ ≈ CADR 약 210~240㎥/h</strong>이고, <strong>CADR 100 ≈ 표시면적 13~14㎡</strong>에 해당합니다 (50㎡ ≈ CADR 약 350~400). 사양표에 청정화능력이 ㎥/min으로 적혀 있으면 60을 곱해 ㎥/h로 바꾼 뒤 비교하면 표시면적 환산보다 정확합니다.',
              },
              {
                q: 'CO₂ 1,000 ppm이 정말 위험한가요?',
                a: '<strong>의학적 &quot;위험&quot; 수준은 아니지만 다음 영향 가능</strong> — 1,000~1,500 ppm: 집중력 저하·졸음(학습·업무 효율↓) / 1,500~2,500 ppm: 두통·피로 / 2,500~5,000 ppm: 호흡 부담(드문 경우). 국내 다중이용시설·사무실·학교 교실의 유지기준은 1,000 ppm 이하(환기설비로 주로 환기하는 교실은 1,500 ppm). CO₂ 자체보다 &quot;환기 부족&quot;의 지표로 보는 것이 더 정확합니다.',
              },
              {
                q: '미세먼지 나쁜 날에는 환기를 안 하는 게 좋나요?',
                a: '<strong>짧은 환기 + 공기청정기 병행이 권장</strong>됩니다.<br>· 매우 나쁨: 5분 이내 짧은 환기 + 즉시 공기청정기<br>· 나쁨: 5~10분 환기 + 공기청정기 가동<br>· 보통: 일반 환기 (10~15분) 가능<br>· 좋음: 자유롭게 환기<br><br>장시간 환기 X도 산소·CO₂ 문제로 위험할 수 있으니 <strong>짧고 강한 환기로 균형</strong>을 맞추는 것이 좋습니다.',
              },
              {
                q: '신축 아파트 전열교환기는 24시간 켜두는 게 좋나요?',
                a: '<strong>네, 권장됩니다.</strong> 전열교환기는 환기와 동시에 실내외 온도·습도를 50~70% 회수하므로 냉난방 손실이 적습니다. 다만 — ① 미세먼지 매우 나쁜 날 헤파 필터 등급(H13+) 확인 / ② 정기 필터 청소·교체 (3~6개월) / ③ 전기 요금: 24시간 가동해도 월 5,000~10,000원 수준. 끄고 살면 신축의 강한 단열 때문에 CO₂·습기·VOC 누적이 빨라 권장하지 않습니다.',
              },
              {
                q: '회의실에 4명, 1시간 회의 시 환기는 어느 정도 필요한가요?',
                a: '본 도구의 [환기량 계산] 탭에서 <strong>회의실 (8 ACH 권장)</strong>로 자동 계산됩니다. 예 — 20㎡ × 2.4m = 48㎥ 회의실 → 필요 환기량 약 384㎥/h. 무환기 시 약 20~25분이면 CO₂ 1,000 ppm에 도달할 수 있으므로(4명·대화~업무 기준) 20분 안팎마다 5~10분 맞통풍 환기를 권장합니다. 인원·활동량에 따라 달라지며 [CO₂·인원] 탭에서 자동 계산됩니다.',
              },
              {
                q: '천식이나 호흡기 질환자가 있는 집은?',
                a: '<strong>본 도구는 일반 가이드이며 의료 전문가 상담을 우선</strong>해야 합니다. 일반적 권장 — ① 공기청정기 CADR을 표준보다 1.5~2배 (예: 권장 200 → 300~400) / ② HEPA H13+ 필터 사용 / ③ 환기 시 미세먼지 농도 실시간 확인 / ④ 습도 40~60% 유지 (가습기·제습기). 천식 발작이 있다면 즉시 의료기관에 연락하시고 개별 환경 설계는 알레르기내과·호흡기내과 상담을 권장합니다.',
              },
            ]

export default function VentilationPage() {
  return (
    <ToolPage width={760} slug="/tools/interior/ventilation">
      <h1 className="tp-h1">
        <ToolIconBadge catId="interior" />환기량 계산기
      </h1>
      <p className="tp-lead">
        공간 부피·인원으로 필요 환기량 + <strong style={{ color: 'var(--text)' }}>공기청정기 CADR 매칭</strong>과 창문 환기 시간.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="신축 30세대 이상 공동주택 시간당 0.5회 환기(건축물의 설비기준 등에 관한 규칙)·학교 1인당 21.6㎥/h(학교보건법 시행규칙)·CO₂ 1,000ppm(실내공기질 관리법 시행규칙) — 그 외 용도별 ACH는 권장 범위"
        sources={[
          { label: '건축물의 설비기준 등에 관한 규칙', href: 'https://www.law.go.kr/법령/건축물의설비기준등에관한규칙' },
          { label: '학교보건법 시행규칙', href: 'https://www.law.go.kr/법령/학교보건법시행규칙' },
          { label: '실내공기질 관리법 시행규칙', href: 'https://www.law.go.kr/법령/실내공기질관리법시행규칙' },
        ]}
      />

      <VentilationClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. ACH란 */}
        <section>
          <h2 className="g-h2">ACH (시간당 환기 횟수)란?</h2>
          <p className="g-p">
            <strong style={{ color: 'var(--text)' }}>ACH (Air Changes per Hour)</strong> = 환기량(㎥/h) ÷ 공간 부피(㎥). 1 ACH는 1시간에 공간 공기를 1번 완전 교체한다는 의미입니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--orange-600) 20%, transparent)', borderRadius: 'var(--radius-m)', padding: '16px 20px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 800, color: 'var(--orange-600)', marginBottom: 6 }}>
              ACH = 환기량(㎥/h) ÷ 공간 부피(㎥)
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              예: 부피 50㎥, 환풍기 100㎥/h → ACH 2.0 (30분에 1회 교체)
            </p>
          </div>
        </section>

        {/* 2. 공간 용도별 권장 ACH */}
        <section>
          <h2 className="g-h2">공간 용도별 한국 권장 ACH</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>공간</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--orange-600)', fontWeight: 700 }}>권장 ACH</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>출처·비고</th>
                </tr>
              </thead>
              <tbody>
                {SPACE_STANDARDS.map((sp, i) => (
                  <tr key={sp.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, textAlign: 'left' }}>{sp.name}</th>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--orange-600)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{sp.achMin}~{sp.achMax}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: '12px' }}>{sp.standard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 위 ACH는 표준의 1인당·면적당 외기량(L/s·인, L/s·㎡)을 일반 천장고로 <strong style={{ color: 'var(--text)' }}>ACH로 환산</strong>한 실무 권장값입니다. 30세대 이상 신축 공동주택의 시간당 0.5회 환기(국토교통부)와 학교 1인당 21.6㎥/h(교육부)는 법령 수치이며, 그 외 범위는 권장 가이드입니다. 정확한 설계는 아래 참고 자료의 원문(판본·조항)을 확인하세요.
          </p>
        </section>

        {/* 3. CADR vs 한국 표시면적 */}
        <section>
          <h2 className="g-h2">CADR vs 한국 표시면적 — 공기청정기 비교</h2>
          <p className="g-p">
            한국 공기청정기는 <strong style={{ color: 'var(--text)' }}>표시면적(㎡)</strong>으로 표기되지만, 미국·국제 표준은 <strong style={{ color: 'var(--text)' }}>CADR(㎥/h)</strong>입니다. 환산 공식 —
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--cyan-600) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '14px 18px', textAlign: 'center', marginBottom: 12 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 800, color: 'var(--cyan-600)' }}>
              CADR (㎥/h) ≈ 한국 표시면적 (㎡) × 7~8
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>본 계산기는 보수적으로 7.5를 적용합니다.</p>
          </div>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>한국 표시면적</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--cyan-600)', fontWeight: 700 }}>대략 CADR</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>적합 공간 (라벨 최소)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['16~20㎡', '120~150 ㎥/h',  '소형 침실 (40~50㎥)'],
                  ['25~33㎡', '180~250 ㎥/h',  '중형 거실 (60~80㎥)'],
                  ['40~50㎡', '300~400 ㎥/h',  '큰 거실 (100~130㎥)'],
                  ['60㎡+',   '450 ㎥/h+',      '대형 공간 또는 다중 사용'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--cyan-600)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: '12px' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 위 &apos;적합 공간&apos;은 제조사 표시면적 라벨 기준의 <strong style={{ color: 'var(--text)' }}>최소 적용 부피</strong>입니다. 본 계산기 [공기청정기] 탭은 더 빠른 청정(4~5 ACH)을 기준으로 <strong style={{ color: 'var(--text)' }}>실사용 면적의 약 1.5배</strong> 표시면적을 권장하므로, 같은 방이라도 표보다 큰 제품을 제시할 수 있습니다. 민감군·미세먼지 잦은 지역은 큰 쪽을 권장합니다.
          </p>
        </section>

        {/* 4. 공기청정기 ≠ 환기 */}
        <section>
          <h2 className="g-h2">공기청정기 ≠ 환기 (중요)</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>오염 요소</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--cyan-600)', fontWeight: 700 }}>공기청정기</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--orange-600)', fontWeight: 700 }}>환기 (외부 공기 도입)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['미세먼지·꽃가루', '제거 (필터 등급·CADR에 비례)', '바깥이 나쁘면 오히려 유입 — 짧게'],
                  ['CO₂', '제거 못 함', '배출 — 유일한 해결책'],
                  ['냄새·VOC', '일부 (탈취 필터 종류에 따라)', '배출'],
                  ['습기·곰팡이', '제거 못 함', '배출 (외기가 더 건조할 때)'],
                  ['냉난방 에너지', '손실 없음', '손실 있음 — 짧고 강하게'],
                ].map((row, i) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, textAlign: 'left' }}>{row[0]}</th>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            <strong>결론</strong> — 미세먼지 나쁜 날에도 짧게(5분) 환기 후 즉시 공기청정기를 가동하는 것이 가장 균형 잡힌 방식입니다. 두 도구는 보완 관계이며 어느 하나만으로는 부족합니다.
          </p>
        </section>

        {/* 5. 창문 환기 효율 */}
        <section>
          <h2 className="g-h2">창문 환기 효율 (한국 가정 기준)</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>방식</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--emerald-600)', fontWeight: 700 }}>ACH 범위</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['한쪽 창 조금',     '0.5~1.5', '환기 효율 낮음 — 가능하면 피하기'],
                  ['한쪽 창 크게',     '1~4',     '차선책'],
                  ['맞통풍 (양쪽)',     '3~15',    '가장 효율적 — 5~10분 짧게'],
                  ['환풍기 + 창문',    '2~6',     '욕실·주방에 적합'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--emerald-600)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: '12px' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 자연환기량은 창문 크기·바람 세기·실내외 온도차에 따라 ±300% 변동 가능합니다. 본 표는 일반 가정 표준 창문(1.5×1.5m) 기준 추정값입니다.
          </p>
        </section>

        {/* 6. CO₂ 농도와 영향 */}
        <section>
          <h2 className="g-h2">CO₂ 농도와 영향</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>ppm</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>등급</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>영향</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['400~600',   '쾌적',     '실외 신선 공기 수준', 'var(--emerald-600)'],
                  ['600~800',   '양호',     '일반 거주 환경', 'var(--cyan-600)'],
                  ['800~1,000', '보통',     '환기 권장', 'var(--yellow-700)'],
                  ['1,000~1,500', '미흡',  '집중력 저하·졸음 가능', 'var(--orange-600)'],
                  ['1,500~2,500', '나쁨',  '두통·피로 가능', 'var(--red-600)'],
                  ['2,500+',     '매우 나쁨', '즉시 환기 필요', 'var(--danger)'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: row[3] as string, fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: '12px' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 학교(학교보건법 시행규칙)·다중이용시설(실내공기질 관리법 시행규칙)·사무실(고용노동부 사무실 공기관리 지침)의 CO₂ 유지기준은 <strong style={{ color: 'var(--text)' }}>1,000 ppm</strong>입니다(학교 중 환기설비로 주로 환기하는 교실은 1,500 ppm). 등급 구분(쾌적~매우 나쁨)은 이 계산기의 안내용 구간이며, CO₂ 자체보다 &quot;환기 부족&quot;의 지표로 보는 것이 정확합니다.
          </p>
        </section>

        {/* 6b. 1인당 필요 외기량 */}
        <section>
          <h2 className="g-h2">CO₂ 1,000ppm을 지키려면 1인당 외기가 얼마나 필요할까</h2>
          <p className="g-p">
            환기를 계속하면 실내 CO₂는 &lsquo;사람이 내뿜는 양 = 환기가 빼내는 양&rsquo;이 되는 농도에서 멈춥니다. 이 균형식을 거꾸로 풀면 목표 농도를 지키는 데 필요한 외기량이 나옵니다 — <strong>1인당 외기량(㎥/h) = 1인 CO₂ 발생량 ÷ (1,000 − 외기 {OUTDOOR_PPM}) ppm</strong>. 아래 표는 이 계산기의 활동별 CO₂ 발생량으로 계산한 값입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>활동</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>1인 CO₂ 발생량</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>1,000ppm 유지 외기량</th>
                </tr>
              </thead>
              <tbody>
                {PER_PERSON_ROWS.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, textAlign: 'left' }}>{r.name}</th>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r.co2LperHour} L/h</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700 }}>약 {nf(r.airPerPerson, 0)} ㎥/h·인</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            학교보건법 시행규칙의 1인당 21.6㎥/h는 휴식에 가까운 활동량에서 1,000ppm 안팎을 유지하는 수준이라, 대화·업무처럼 활동량이 늘면 그보다 많은 외기가 필요하다는 것을 알 수 있습니다. 예를 들어 5평(16.5㎡, 천장 2.4m → {nf(BED_VOL, 1)}㎥) 침실에서 틈새 환기를 0으로 보는 이 계산기 모델로는 2명이 창을 닫고 자면 약 <strong>{BED_CLOSED.recommendVentilateMinutes}분</strong> 만에 1,000ppm을 넘고(실제로는 틈새 환기만큼 더 늦어짐), 공동주택 법정 최소인 시간당 0.5회({nf(BED_VOL * 0.5, 1)}㎥/h)로 계속 환기해도 결국 약 <strong>{nf(BED_05.steadyStatePpm ?? 0)}ppm</strong>에서 균형을 이룹니다. 두 사람이 밤새 1,000ppm 아래에 머물려면 약 {nf(BED_NEED, 0)}㎥/h, 이 방 기준 시간당 {nf(BED_NEED / BED_VOL, 1)}회 정도의 환기가 필요합니다. 침실 문을 조금 열어 두거나 전열교환기를 켜 두는 것이 도움이 되는 이유입니다.
          </p>
        </section>

        {/* 7. 냉난방 손실 줄이기 */}
        <section>
          <h2 className="g-h2">환기 시 냉난방 손실 줄이기</h2>
          <ul className="g-list">
            <li><strong>짧고 강한 맞통풍 (5~10분)</strong> — 에너지 손실 최소 + 빠른 공기 교체. 가장 권장하는 방식입니다. 벽·가구에 저장된 열은 그대로 남아 창을 닫으면 온도가 빨리 돌아옵니다.</li>
            <li><strong>오래 조금 열어두기는 피하기</strong> — 한쪽 창을 조금 연 채 오래 두면 환기 효율은 낮고 벽·창틀이 식어 에너지 손실과 결로 위험이 커집니다.</li>
            <li><strong>미세먼지 나쁜 날</strong> — 5분 짧은 환기 후 즉시 공기청정기를 가동합니다.</li>
            <li><strong>전열교환기가 있는 집</strong> — 배기 공기의 열·습기를 50~70% 회수하므로 24시간 약하게 켜 두는 편이 창문 환기보다 손실이 적습니다. 필터는 제조사 안내 주기에 맞춰 청소·교체하세요.</li>
          </ul>
        </section>

        {/* 8. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 면책 강화 */}
        <section>
          <Disclaimer variant="default" open>
            본 도구는 일반 환기·공기질 가이드를 제공하는 <strong>참고용 계산기</strong>입니다. 의료·산업안전 진단 도구가 아닙니다.
            <br />
            <strong>본 도구의 한계</strong> — CO₂ 추정은 단순 모델 (±50% 오차) / 자연환기량은 ±300% 변동 / 공기청정기 CADR은 미세먼지 기준 (다른 오염물질 별도) / 산업·의료시설은 별도 법규 우선.
            <br />
            천식·호흡기 질환자, 영유아, 임산부 등 민감군은 의료 전문가 상담을 권장하며, 정확한 실내 공기질 측정은 CO₂·미세먼지·VOC 센서 사용을 권장합니다.
          </Disclaimer>
        </section>

        {/* 참고 자료 */}
        <section>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 20px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>참고 자료</p>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: '국토교통부 「건축물의 설비기준 등에 관한 규칙」 (신축 공동주택 0.5 ACH)', href: 'https://www.law.go.kr/법령/건축물의설비기준등에관한규칙' },
                { label: '교육부 「학교보건법 시행규칙」 (1인당 21.6㎥/h)', href: 'https://www.law.go.kr/법령/학교보건법시행규칙' },
                { label: '의료법 시행규칙 (의료시설 환기 기준)', href: 'https://www.law.go.kr/법령/의료법시행규칙' },
                { label: 'KOSHA (한국산업안전보건공단) 산업환기 지침', href: 'https://www.kosha.or.kr' },
                { label: 'ANSI/ASHRAE 62.1-2025 (실내공기질 환기 표준)', href: 'https://www.ashrae.org/technical-resources/bookstore/standards-62-1-62-2' },
                { label: 'AHAM CADR / 한국 표준사용면적 (공기청정기 표준)', href: 'https://www.ahamverifide.org' },
              ].map((s, i) => (
                <li key={i} style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)', textDecoration: 'underline' }}>{s.label}</a>
                </li>
              ))}
            </ul>
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.6 }}>
              ※ 국내 법령은 국가법령정보센터(law.go.kr) 현행 원문 기준. 외부 링크는 새 창에서 열립니다.
            </p>
          </div>
        </section>

        {/* 함께 쓰면 좋은 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/interior/room-area', icon: '📐', name: '공간 면적 계산기',     desc: '벽·바닥·천장·평수·부피' },
              { href: '/tools/interior/wallpaper', icon: '🧱', name: '도배 계산기',   desc: '벽지 롤 수·면적·셀프 시공 비용' },
              { href: '/tools/interior/paint',     icon: '🎨', name: '페인트 계산기', desc: '벽·천장 페인트 양' },
              { href: '/tools/health/uv-protection', icon: '☀️', name: '자외선 노출 가이드',   desc: '실내·실외 자외선' },
              { href: '/tools/unit/converter',     icon: '📐', name: '단위 변환기',     desc: '면적·부피 단위 환산' },
              { href: '/tools/unit/area',          icon: '🏠', name: '평수 변환기',     desc: '아파트 평형' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
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
    </ToolPage>
  )
}
