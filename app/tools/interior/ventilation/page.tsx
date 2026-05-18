import Link from 'next/link'
import VentilationClient from './VentilationClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/interior/ventilation',
  title: '환기량 계산기 — ACH·CO₂·공기청정기·창문 환기 시간',
  description:
    '공간 부피·인원·ACH로 필요 환기량 + 공기청정기 CADR 매칭·CO₂ 위험·창문 환기 권장 시간.',
  keywords: [
    '환기량 계산', 'ACH 계산', '공기청정기 CADR', 'CO2 농도',
    '창문 환기 시간', '회의실 환기', '교실 환기',
    '공간 용도별 환기 횟수', '한국 환기 기준', '실내 공기질',
  ],
})

export default function VentilationPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>주거·인테리어</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💨 환기량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        공간 부피·인원으로 필요 환기량 + <strong style={{ color: 'var(--text)' }}>공기청정기 CADR 매칭</strong>과 창문 환기 시간.
      </p>

      <VentilationClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. ACH란 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>ACH (시간당 환기 횟수)란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>ACH (Air Changes per Hour)</strong> = 환기량(㎥/h) ÷ 공간 부피(㎥). 1 ACH는 1시간에 공간 공기를 1번 완전 교체한다는 의미입니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(232,151,87,0.20)', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 18, fontWeight: 800, color: '#E89757', marginBottom: 6 }}>
              ACH = 환기량(㎥/h) ÷ 공간 부피(㎥)
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              예: 부피 50㎥, 환풍기 100㎥/h → ACH 2.0 (30분에 1회 교체)
            </p>
          </div>
        </section>

        {/* 2. 공간 용도별 권장 ACH */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>공간 용도별 한국 권장 ACH</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>공간</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: '#E89757', fontWeight: 700 }}>권장 ACH</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>출처·비고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🛏️ 침실',          '0.5~1',  '국토교통부 (신축 0.5 ACH 의무)'],
                  ['🛋️ 거실',          '0.5~1',  '국토교통부'],
                  ['📚 공부방·서재',   '2~4',    'ASHRAE 62.1 (집중·CO₂ 누적 방지)'],
                  ['💼 사무실',        '2~6',    'ASHRAE 62.1'],
                  ['👥 회의실',        '6~10',   'ASHRAE 62.1 (인원 밀집)'],
                  ['🎒 교실',          '4~6',    '교육부 학교보건법 (학생 1인당 21.6㎥/h)'],
                  ['☕ 카페·식당',     '8~12',   'KOSHA (냄새·습기·인원 밀집)'],
                  ['🏋️ 헬스장',        '6~10',   'KOSHA (운동·CO₂ 빠른 누적)'],
                  ['🍳 주방',          '10~15',  '국토교통부 (조리 시 후드 사용)'],
                  ['🚽 화장실',        '5~8',    '국토교통부 (5 ACH 의무)'],
                  ['🏥 의료시설',      '6~12',   '의료법 시행규칙 (감염 예방)'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', color: '#E89757', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)', fontSize: '12px' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. CADR vs 한국 표시면적 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>CADR vs 한국 표시면적 — 공기청정기 비교</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            한국 공기청정기는 <strong style={{ color: 'var(--text)' }}>표시면적(㎡)</strong>으로 표기되지만, 미국·국제 표준은 <strong style={{ color: 'var(--text)' }}>CADR(㎥/h)</strong>입니다. 환산 공식 —
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,200,255,0.30)', borderRadius: 12, padding: '14px 18px', textAlign: 'center', marginBottom: 12 }}>
            <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, fontWeight: 800, color: '#3EC8FF' }}>
              CADR (㎥/h) ≈ 한국 표시면적 (㎡) × 7~8
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>한국 표시면적</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: '#3EC8FF', fontWeight: 700 }}>대략 CADR</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>적합 공간 부피</th>
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
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', color: '#3EC8FF', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)', fontSize: '12px' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. 공기청정기 ≠ 환기 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>공기청정기 ≠ 환기 (중요)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,200,255,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#3EC8FF', marginBottom: '6px' }}>🌀 공기청정기</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none' }}>
                <li>✅ 미세먼지·꽃가루 제거</li>
                <li>✅ 일부 입자·VOC</li>
                <li>❌ CO₂ 제거 X</li>
                <li>❌ 산소 보충 X</li>
                <li>❌ 냄새(장기) X</li>
                <li>❌ 습기·곰팡이 X</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(232,151,87,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#E89757', marginBottom: '6px' }}>💨 환기 (외부 공기 도입)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none' }}>
                <li>✅ CO₂ 배출</li>
                <li>✅ 신선한 산소 보충</li>
                <li>✅ 냄새·습기 배출</li>
                <li>⚠️ 미세먼지 나쁜 날 짧게만</li>
                <li>⚠️ 냉난방 에너지 손실</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>결론</strong> — 미세먼지 나쁜 날에도 짧게(5분) 환기 후 즉시 공기청정기를 가동하는 것이 가장 균형 잡힌 방식입니다. 두 도구는 보완 관계이며 어느 하나만으로는 부족합니다.
          </p>
        </section>

        {/* 5. 창문 환기 효율 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>창문 환기 효율 (한국 가정 기준)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>방식</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: '#3EFF9B', fontWeight: 700 }}>ACH 범위</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['한쪽 창 조금',     '0.5~1.5', '환기 효율 낮음 — 가능하면 피하기'],
                  ['한쪽 창 크게',     '1~4',     '차선책'],
                  ['맞통풍 (양쪽)',     '3~15',    '⭐ 가장 효율적 — 5~10분 짧게'],
                  ['환풍기 + 창문',    '2~6',     '욕실·주방에 적합'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', color: '#3EFF9B', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)', fontSize: '12px' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⓘ 자연환기량은 창문 크기·바람 세기·실내외 온도차에 따라 ±300% 변동 가능합니다. 본 표는 일반 가정 표준 창문(1.5×1.5m) 기준 추정값입니다.
          </p>
        </section>

        {/* 6. CO₂ 농도와 영향 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>CO₂ 농도와 영향</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>ppm</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>등급</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>영향</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['400~600',   '🟢 쾌적',     '실외 신선 공기 수준', '#3EFF9B'],
                  ['600~800',   '🔵 양호',     '일반 거주 환경', '#3EC8FF'],
                  ['800~1,000', '🟡 보통',     '환기 권장', '#FFD700'],
                  ['1,000~1,500', '🟠 미흡',  '집중력 저하·졸음 가능', '#FF8C3E'],
                  ['1,500~2,500', '🔴 나쁨',  '두통·피로 가능', '#FF6B6B'],
                  ['2,500+',     '⛔ 매우 나쁨', '즉시 환기 필요', '#CC4444'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: row[3] as string, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)', fontSize: '12px' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⓘ <strong style={{ color: 'var(--text)' }}>한국 학교보건법 / KOSHA 사무실 기준 1,000 ppm 이하 권장</strong>. CO₂ 자체보다 &quot;환기 부족&quot;의 지표로 보는 것이 정확합니다.
          </p>
        </section>

        {/* 7. 냉난방 손실 줄이기 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>환기 시 냉난방 손실 줄이기</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '✅', title: '짧고 강한 맞통풍 (5~10분)', desc: '에너지 손실 최소 + 빠른 공기 교체 — 가장 권장' },
              { icon: '❌', title: '오래 조금 열어두기', desc: '에너지 손실 큼 + 환기 효율 낮음' },
              { icon: '🌫️', title: '미세먼지 나쁜 날', desc: '5분 짧은 환기 + 즉시 공기청정기 가동' },
              { icon: '🏢', title: '신축 아파트 전열교환기', desc: '50~70% 에너지 회수 가능 (24시간 가동 권장)' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', display: 'grid', gridTemplateColumns: '32px 1fr', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{m.icon}</span>
                <div>
                  <p style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 700, marginBottom: 3 }}>{m.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. FAQ */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '공기청정기만 켜면 환기 안 해도 되나요?',
                a: '<strong>아닙니다.</strong> 공기청정기는 미세먼지·일부 입자만 줄이며, <strong>CO₂·산소·냄새·습기는 외부 공기와의 환기로만 해결</strong>됩니다. 신선한 외부 공기 도입은 공기청정기로 대체할 수 없습니다. 미세먼지 나쁜 날에도 5~10분 짧게 환기 후 공기청정기를 가동하는 것을 권장합니다.',
              },
              {
                q: '우리 집 환기 횟수가 얼마나 되는지 어떻게 알 수 있나요?',
                a: '다음 방법으로 확인 — ① <strong>환풍기·전열교환기 사양</strong>(㎥/h 표시) ÷ 공간 부피 = ACH / ② <strong>공기청정기 CADR</strong> 확인 (실내 순환량) / ③ <strong>창문 환기는 본 도구의 [창문 환기] 탭</strong> 활용. 신축 공동주택은 법정 최소 0.5 ACH 환기 의무이므로 대부분 자동 환기 시스템(전열교환기)이 설치되어 있습니다.',
              },
              {
                q: 'CADR 100 vs 표시면적 30㎡, 어느 게 큰가요?',
                a: '비슷한 수준입니다. <strong>대략적 환산</strong> — 표시면적 (㎡) × 7~8 ≈ CADR (㎥/h). 표시면적 30㎡ ≈ CADR 약 210~240 / 50㎡ ≈ CADR 약 350~400. 한국 공기청정기는 보수적 환산을 사용하므로 실제 CADR이 약 1.4배 높을 수 있습니다.',
              },
              {
                q: 'CO₂ 1,000 ppm이 정말 위험한가요?',
                a: '<strong>의학적 &quot;위험&quot; 수준은 아니지만 다음 영향 가능</strong> — 1,000~1,500 ppm: 집중력 저하·졸음(학습·업무 효율↓) / 1,500~2,500 ppm: 두통·피로 / 2,500~5,000 ppm: 호흡 부담(드문 경우). 한국·국제 학교보건·사무실 기준은 1,000 ppm 이하 권장. CO₂ 자체보다 &quot;환기 부족&quot;의 지표로 보는 것이 더 정확합니다.',
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
                a: '본 도구의 [환기량 계산] 탭에서 <strong>회의실 (8 ACH 권장)</strong>로 자동 계산됩니다. 예 — 20㎡ × 2.4m = 48㎥ 회의실 → 필요 환기량 약 384㎥/h. 무환기 시 약 30~45분이면 CO₂ 1,000 ppm 도달 가능하므로 30~45분마다 5~10분 맞통풍 환기를 권장합니다.',
              },
              {
                q: '천식이나 호흡기 질환자가 있는 집은?',
                a: '<strong>본 도구는 일반 가이드이며 의료 전문가 상담을 우선</strong>해야 합니다. 일반적 권장 — ① 공기청정기 CADR을 표준보다 1.5~2배 (예: 권장 200 → 300~400) / ② HEPA H13+ 필터 사용 / ③ 환기 시 미세먼지 농도 실시간 확인 / ④ 습도 40~60% 유지 (가습기·제습기). 천식 발작이 있다면 즉시 의료기관에 연락하시고 개별 환경 설계는 알레르기내과·호흡기내과 상담을 권장합니다.',
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

        {/* 면책 강화 */}
        <section>
          <div style={{ background: 'rgba(255,107,107,0.05)', border: '1px solid rgba(255,107,107,0.30)', borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#FF6B6B', marginBottom: '8px' }}>⚠️ 면책 조항</p>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '6px' }}>
              본 도구는 일반 환기·공기질 가이드를 제공하는 <strong style={{ color: 'var(--text)' }}>참고용 계산기</strong>입니다. 의료·산업안전 진단 도구가 아닙니다.
            </p>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '6px' }}>
              <strong style={{ color: 'var(--text)' }}>본 도구의 한계</strong> — CO₂ 추정은 단순 모델 (±50% 오차) / 자연환기량은 ±300% 변동 / 공기청정기 CADR은 미세먼지 기준 (다른 오염물질 별도) / 산업·의료시설은 별도 법규 우선.
            </p>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85 }}>
              천식·호흡기 질환자, 영유아, 임산부 등 민감군은 의료 전문가 상담을 권장하며, 정확한 실내 공기질 측정은 CO₂·미세먼지·VOC 센서 사용을 권장합니다.
            </p>
          </div>
        </section>

        {/* 참고 자료 */}
        <section>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>참고 자료</p>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                '국토교통부 「건축물의 설비기준 등에 관한 규칙」',
                '교육부 「학교보건법 시행규칙」',
                'KOSHA (한국산업안전보건공단) 「산업환기 지침」',
                'ASHRAE 62.1 (실내공기질 표준)',
                'AHAM CADR (공기청정기 표준)',
                '의료법 시행규칙 (의료시설 환기 기준)',
              ].map((source, i) => (
                <li key={i} style={{ fontSize: '12px', color: 'var(--muted)' }}>{source}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* 함께 쓰면 좋은 도구 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/interior/room-area', icon: '📐', name: '공간 면적 계산기',     desc: '벽·바닥·천장·평수·부피 (입력값 자동 호환)' },
              { href: '/tools/interior/wallpaper', icon: '🧱', name: '도배 계산기',   desc: '벽지 롤 수·면적·셀프 시공 비용' },
              { href: '/tools/interior/paint',     icon: '🎨', name: '페인트 계산기', desc: '벽·천장 페인트 양' },
              { href: '/tools/health/uv-protection', icon: '☀️', name: '자외선 노출 가이드',   desc: '실내·실외 자외선' },
              { href: '/tools/unit/converter',     icon: '📐', name: '단위 변환기',     desc: '면적·부피 단위 환산' },
              { href: '/tools/unit/area',          icon: '🏠', name: '평수 변환기',     desc: '아파트 평형' },
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
