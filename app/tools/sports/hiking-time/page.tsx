import Link from 'next/link'
import HikingTimeClient from './HikingTimeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/sports/hiking-time',
  title: '등산 시간 계산기 — Naismith·Tobler·한국 표준 3공식 + 100대 명산 35+ 프리셋 + 턴어라운드 안전 시간',
  description:
    'Naismith·Tobler·한국 코스타임 3공식 + 북한산·설악산·지리산·한라산 등 한국 100대 명산 35+ 프리셋. 일몰 전 하산 진단.',
  keywords: [
    '등산 시간 계산', '등산 소요시간', '산행 시간 계산',
    '북한산 시간', '북한산 백운대 시간', '설악산 시간', '설악산 대청봉 시간',
    '지리산 시간', '지리산 천왕봉', '한라산 시간', '한라산 백록담',
    'Naismith 공식', 'Tobler 공식', '등산 페이스',
    '100대 명산', '한국 명산', '등산 코스', '등산 난이도',
    '턴어라운드 시간', '회귀 시간', '일몰 하산',
    '등산 체력', '산행 페이스', '오르막 속도',
    '백운대 시간', '대청봉 시간', '천왕봉 시간', '백록담 시간',
    '도봉산 시간', '관악산 시간', '청계산 시간', '무등산 시간',
    '소백산 시간', '월악산 시간', '계룡산 시간',
    '등산 안전', '산악구조대', '국립공원 입산',
    '등산 준비물', '등산 체크리스트', '등산 비상',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  letterSpacing: '-0.01em',
}
const faqAnswer: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
  margin: 0,
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '16px 20px',
}

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Naismith vs Tobler 공식 차이는?',
    a: '<strong style="color:var(--text)">Naismith (1892)</strong>: 가장 오래된 등산 시간 공식. 평지 5km/h + 오르막 600m당 1시간. 단순하지만 내리막 보정이 없어 부정확.<br/><br/><strong style="color:var(--text)">Tobler Function (1993)</strong>: 경사도 함수 기반. 가파른 내리막에서는 오히려 속도가 느려진다는 사실 반영. 최대속도 6km/h가 약간 내리막(-2.86%)에서 발생.<br/><br/>한국 산은 가파르고 등산로가 좁아 두 공식 모두 보수적 추정이 필요. 본 도구의 <strong style="color:var(--accent)">한국 코스타임</strong> 기준(100대 명산 표준 소요시간 보정)이 가장 현실적.',
  },
  {
    q: '한국 산에서 평균 페이스는?',
    a: '한국 산은 가파르고 등산로가 좁아 국제 표준(평지 5km/h)보다 느립니다. 본 도구는 <strong style="color:var(--text)">100대 명산 표준 코스타임</strong>에 맞춰 보정했습니다.<ul style="padding-left:20px;margin:8px 0"><li><strong>오르막</strong>: 표고 100m당 약 16분 (≈ 시속 고도 375m)</li><li><strong>내리막</strong>: 표고 100m당 약 7분</li><li><strong>거리</strong>: 1km당 약 10분</li><li><strong>휴식</strong>: 50분 보행마다 10분 (별도 합산)</li></ul>종합하면 일반 코스 평균 약 1.5~2.5km/h(경사에 따라). 트레일러닝 수준이면 1.5배 빠름, 초보는 1.25배 느림.',
  },
  {
    q: '체력 등급은 어떻게 정하나요?',
    a: '월 산행 빈도와 운동 습관 기준:<ul style="padding-left:20px;margin:8px 0"><li><strong>초보</strong>: 월 1회 이하 / 일상 운동 거의 없음</li><li><strong>일반</strong>: 월 2~4회 / 주 2~3회 가벼운 운동</li><li><strong>상급</strong>: 월 5회+ / 주 4~5회 운동·훈련</li><li><strong>전문</strong>: 트레일러닝·산악인 / 거의 매일 훈련</li></ul>자가 진단이 어려우면 일단 “일반” 선택 후 첫 산행 시간 비교해 조정.',
  },
  {
    q: '오르막 100m가 평지 1km보다 오래 걸리는 이유?',
    a: '<strong style="color:var(--text)">물리적 일량(에너지)이 다르기 때문</strong>입니다. 오르막은 중력에 거슬러 올라가야 하므로 같은 거리라도 평지보다 5~10배 에너지 소모.<br/><br/>Naismith 공식: 600m 오르막 = 1시간 = 평지 5km. 즉 <strong>오르막 100m ≈ 평지 833m</strong>의 시간 가치. 한국 코스타임 기준은 더 보수적이어서 오르막 100m(약 16분) ≈ 평지 1.6km(약 16분) 수준.<br/><br/>한국에서 거리는 짧아도 표고차가 큰 코스(설악산 오색 9km/1300m 등)는 거리만 보면 안 되고 표고차가 핵심.',
  },
  {
    q: '야간 산행은 얼마나 더 걸리나?',
    a: '일반적으로 <strong style="color:var(--text)">+30%</strong>. 헤드랜턴으로도 시야가 제한되어 길 찾기·균형 잡기·돌멩이 회피가 모두 느려집니다.<br/><br/>또한 <strong style="color:#DC2626">위험도가 압도적으로 높음</strong>:<ul style="padding-left:20px;margin:8px 0"><li>길 잃을 확률 ↑↑</li><li>저체온증 위험 (산은 해 진 뒤 급격히 냉각)</li><li>구조 요청 시 발견 어려움</li></ul>야간 산행은 <strong style="color:var(--text)">경험자만</strong>. 초보는 일몰 1시간 전 하산 필수.',
  },
  {
    q: '어린이·노약자 동반 시 보정은?',
    a: '<ul style="padding-left:20px;margin:8px 0"><li><strong>어린이 (초등 이하)</strong>: ×1.30 (30% 추가). 페이스도 느리고 휴식·간식·화장실 자주 필요</li><li><strong>노약자 (60세+ 또는 회복기)</strong>: ×1.20 (20% 추가). 무릎·심장 부담</li></ul>추가 권장:<ul style="padding-left:20px;margin:8px 0"><li>코스: 초급 (북한산 사모바위·관악산 등) 권장</li><li>거리·표고차 절반으로 시작</li><li>중간 휴식 50분 → 30분으로 단축</li><li>물·간식 평소보다 1.5배</li></ul>',
  },
  {
    q: '겨울 산행 추가 시간은?',
    a: '<strong style="color:var(--text)">+20~30%</strong>. 변수가 많아 가장 보수적으로 잡아야 함.<ul style="padding-left:20px;margin:8px 0"><li>아이젠·스패츠 착용 필요 → 페이스 ↓</li><li>눈길 미끄럼 → 균형 잡기 시간 ↑</li><li>적설 시 발 빠짐 (러셀 필요)</li><li>방한복 + 보온병 → 배낭 무게 ↑</li><li>해 짧음 → 일몰 16:30~17:30</li></ul>겨울 산행은 일반 시간 ×1.30 + 일몰 시각 1시간 앞당김 + 동계 장비 필수. <strong style="color:#DC2626">경험 없는 초보는 동계 산행 자제 권장.</strong>',
  },
  {
    q: '회귀 시간(턴어라운드)이란?',
    a: '<strong style="color:var(--text)">“정상 도달 못 하면 하산해야 하는 시점”</strong>. 산악 등반의 핵심 안전 개념.<br/><br/>예: 일몰 18:30 → 하산 시점 17:30 → 정상 도달 시점 13:30 (왕복 4시간 가정). 13:30까지 정상에 도달 못 하면 그 자리에서 회귀해야 일몰 전 하산 가능.<br/><br/>본 도구는 입력값 기준 자동 계산:<ul style="padding-left:20px;margin:8px 0"><li>✓ <strong style="color:#059669">안전</strong>: 일몰 1시간 전 도착</li><li>⚠️ <strong style="color:#D97706">주의</strong>: 일몰 1시간 전 ~ 일몰 사이 → 헤드랜턴 필수</li><li>🚨 <strong style="color:#DC2626">위험</strong>: 일몰 이후 → 야간 산행으로 전환됨</li></ul>',
  },
]

export default function HikingTimePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🥾 등산 시간 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        한국 100대 명산 35+ 프리셋 + 체력·날씨 보정. <strong style={{ color: 'var(--text)' }}>일몰 전 하산</strong> 자동 진단.
      </p>

      <HikingTimeClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 3공식 가이드 */}
        <section>
          <h2 style={sectionTitle}>3개 등산 시간 공식 비교</h2>
          <p style={{ ...faqAnswer, marginBottom: '14px' }}>
            등산 시간 계산 공식은 130년간 발전해왔습니다. 각 공식은 다른 가정과 환경에 최적화되어 있어, 본인 산행 환경에 맞는 공식을 선택하는 것이 중요합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['공식', '발표', '핵심 가정', '한국 적합도', '특징'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Naismith Rule',     '1892',  '평지 5km/h + 600m당 +1h',          '⭐⭐⭐',    '단순·계산 쉬움. 영국 표준'],
                  ['Tobler Function',   '1993',  '경사도 기반 속도 함수',             '⭐⭐⭐⭐',  '경사 정밀. 내리막 보정 ✓'],
                  ['한국 코스타임',     '보정',  '거리 10분/km + 오르막 100m당 16분', '⭐⭐⭐⭐⭐', '100대 명산 표준 코스타임 보정'],
                ].map(([name, year, assumption, fit, note], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{year}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{assumption}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{fit}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. 보정 가이드 */}
        <section>
          <h2 style={sectionTitle}>보정 계수 가이드</h2>
          <p style={{ ...faqAnswer, marginBottom: '14px' }}>
            기본 공식 외에 본인 상황에 맞는 5가지 보정을 적용해 정확도를 높입니다. 각 보정은 곱 연산되므로 누적 효과가 큼.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['카테고리', '항목', '보정값', '설명'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['체력', '초보 / 일반 / 상급 / 전문',     '×1.25 / 1.0 / 0.85 / 0.70', '월 산행 빈도 기준'],
                  ['지형', '포장·일반·계단·암릉·너덜',    '×0.85 ~ 1.40',              '한국 산은 계단·암릉 많음'],
                  ['배낭', '당일 5kg / 1박 15kg / 장기 30kg', '×1.0 / 1.10 / 1.30',     '무게 5kg마다 ~5% 추가'],
                  ['인원', '1인·2~3인·4~6인·어린이·노약자', '×1.0 ~ 1.30',              '가장 느린 사람 기준'],
                  ['날씨', '평시·여름·겨울·우천·야간',    '×1.0 ~ 1.30',              '복합 시 추가'],
                ].map(([cat, item, factor, desc], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{cat}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{item}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{factor}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 인기 명산 시간표 */}
        <section>
          <h2 style={sectionTitle}>한국 인기 명산 시간 (일반 페이스 기준)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['산', '대표 코스', '거리', '표고차', '난이도', '시간'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['북한산',   '백운대',           '7.0km',  '720m',  '중급',   '4.5h'],
                  ['도봉산',   '자운봉',           '7.5km',  '710m',  '중급',   '4.5h'],
                  ['관악산',   '연주대',           '6.0km',  '500m',  '초급',   '3.5h'],
                  ['설악산',   '대청봉 (오색)',    '9.0km',  '1300m', '상급',   '8.0h'],
                  ['지리산',   '천왕봉 (중산리)',  '10.0km', '1400m', '상급',   '9.0h'],
                  ['한라산',   '백록담 (성판악)',  '19.2km', '1300m', '상급',   '9.0h'],
                  ['소백산',   '비로봉',           '8.0km',  '900m',  '중급',   '5.5h'],
                  ['속리산',   '문장대',           '9.0km',  '830m',  '중급',   '5.5h'],
                  ['무등산',   '천왕봉',           '10.0km', '900m',  '중급',   '5.5h'],
                  ['월출산',   '천황봉',           '6.5km',  '650m',  '상급',   '4.5h'],
                ].map(([mt, course, dist, elev, diff, time], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{mt}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{course}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{dist}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{elev}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{diff}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...faqAnswer, marginTop: '12px', fontSize: '12px' }}>
            ※ 일반 체력·평시 날씨·당일 배낭·1인 기준. 본 도구의 프리셋에서 추가 보정 적용 가능.
          </p>
        </section>

        {/* 4. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQ.map((f, i) => (
              <details key={i} style={{ ...card, padding: '12px 16px' }}>
                <summary style={{ cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Q{i + 1}. {f.q}</summary>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 10 }} dangerouslySetInnerHTML={{ __html: f.a }} />
              </details>
            ))}
          </div>
        </section>

        {/* 5. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { href: '/tools/sports/race-predictor', icon: '🏃', name: '마라톤 기록 계산기', desc: 'Riegel·VDOT 3공식' },
              { href: '/tools/sports/pace', icon: '⏱️', name: '러닝 페이스 계산기', desc: '페이스↔시간 변환' },
              { href: '/tools/sports/interval-training', icon: '🔁', name: '인터벌 훈련 계산기', desc: 'VDOT 기반 훈련' },
              { href: '/tools/health/bmr', icon: '🔥', name: '기초대사량 계산기', desc: '등산 칼로리 추정' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
