import Link from 'next/link'
import VO2MaxClient from './VO2MaxClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/sports/vo2max',
  title: 'VO₂ Max 계산기 — 쿠퍼·1.5마일·락포트·노르웨이 6가지 방법',
  description:
    '쿠퍼 12분·1.5마일 달리기·락포트 1마일 걷기·퀸즈칼리지 스텝·노르웨이 비운동·안정시 심박 6가지 VO₂max 추정 + 동년배 5단계 등급 + 마라톤·5K·10K·하프 예상 시간 + 강도별 트레이닝 페이스.',
  keywords: [
    'VO2max 계산기', 'VO₂ Max', '심폐지구력 측정', '쿠퍼 12분 테스트',
    '1.5마일 테스트', '락포트 워킹', '퀸즈칼리지 스텝',
    '노르웨이 VO2max', 'NTNU VO2', '안정시 심박수 VO2',
    '러닝 체력 측정', '심폐 체력', 'VDOT', 'Daniels VDOT',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '20px 22px',
}
const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text)',
  listStyle: 'none',
  padding: '4px 0',
}
const faqAnswer: React.CSSProperties = {
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px solid var(--border)',
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
}

const FAQ_LD = [
  { "q":"어떤 방법이 가장 정확한가요?","a":"가스 분석기 실험실 측정(트레드밀 점진 부하)이 절대 기준입니다 (±2~3% 오차). 본 도구의 6가지 추정 방법 중에선: 러너: 쿠퍼 12분 또는 1.5마일 (전력 달리기 가능 시) 초보·고령: 락포트 1마일 걷기 (관절 부담 X) 실내: 퀸즈칼리지 스텝테스트 측정 자체가 어렵다면: 노르웨이 비운동 추정 (정확도 ±10~15% 오차이지만 운동 X) 안정시 심박 비율법은 가장 간단하지만 오차가 크므로 추세 추적용으로만." },
  { "q":"VO₂max는 얼마까지 올릴 수 있나요?","a":"유전이 약 50% 영향 + 훈련이 30~40% 영향이라고 알려져 있습니다 (Bouchard 1999). 일반인 기준: 비운동인 → 운동인: 6개월~1년에 +10~20% (예: 38 → 45) 운동인 → 마라톤 입문: 추가 +5~10% (45 → 50) 아마 마스터즈 → 서브3: VO₂max 58+ 필요 엘리트: 남성 75~85, 여성 65~75 (유전·훈련 모두 상위) 킵초게(엘리우드)·잉바이·반드페이는 80~85 수준으로 추정됩니다." },
  { "q":"나이가 들면 VO₂max는 얼마나 떨어지나요?","a":"비활동인은 10년에 약 10% 감소 (30대 45 → 60대 27). 그러나 꾸준한 유산소 운동으로 감소를 절반 이하로 늦출 수 있습니다 (10년에 4~5% 감소). 마스터즈 러너 연구에서: 50대 마라톤 러너의 VO₂max는 비활동 25세 청년과 비슷 (40~45) 70대 마스터즈 챔피언은 평균 30대 수준 유지 가능 (40+) VO₂max는 노화의 가장 강력한 지표지만 동시에 가장 통제 가능한 지표입니다." },
  { "q":"VO₂max가 낮으면 무엇이 문제인가요?","a":"심혈관 사망률·전체 사망률의 가장 강력한 단일 예측 인자입니다. Mandsager 2018 (JAMA Cardiology) 12만 명 연구: VO₂max 하위 25% → 상위 25% 대비 사망률 약 5배 흡연·당뇨·고혈압보다 더 강한 위험 인자 VO₂max +1 mL → 사망률 약 9% ↓ VO₂max가 「매우 미흡」 단계라면 의사 상담 후 점진적 유산소 운동 시작 권장." },
  { "q":"워치(가민·애플)의 VO₂max 표시는 정확한가요?","a":"가민·폴라·애플 워치의 VO₂max는 러닝 중 페이스 + 심박수 비교로 추정합니다. 일반적으로 ±5~10% 오차로 본 도구의 추정 방법과 비슷한 수준입니다. 주의: 꾸준히 달려야 갱신됨 (가민은 7일+ 데이터 필요) 업힐·다운힐·강풍 환경에선 과대/과소 평가 광학 심박 센서 오차 ±5bpm → VO₂max ±3 본 도구 + 워치 + 3~6개월 추세를 함께 보면 가장 신뢰 가능." },
  { "q":"마라톤 예상 시간은 어떻게 계산되나요?","a":"본 도구는 VO₂max ≈ Daniels VDOT 가정 + Riegel 공식으로 5km·10km·하프·풀코스 예상 기록을 간단 추정합니다 (예: VO₂max 50 → 5km 약 23분 / 풀 약 3시간 40분). 실제 기록은 젖산 역치·러닝 이코노미·글리코겐 저장량·멘탈의 영향으로 ±10~15% 변동 가능한 참고용입니다. 실제 레이스 기록 기반의 정밀 예측(3공식 평균·환경/연령 보정·목표 역산)은 마라톤 기록 계산기를 이용하세요." }
]

export default function VO2MaxPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🫁 VO₂ Max 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        쿠퍼·1.5마일·락포트·노르웨이 등 <strong style={{ color: 'var(--text)' }}>6가지 방법</strong>으로 심폐 체력(VO₂max) 추정 + 동년배 5단계 등급 + 마라톤 예상 시간 + 강도별 트레이닝 페이스.
      </p>

      <VO2MaxClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. VO2max란? */}
        <section>
          <h2 style={sectionTitle}>VO₂ Max란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            VO₂ Max(최대 산소 섭취량)는 <strong style={{ color: 'var(--text)' }}>운동 중 1분에 체중 1kg당 흡수할 수 있는 산소량(mL/kg/min)</strong>입니다.
            심폐 체력의 <strong style={{ color: 'var(--text)' }}>객관적 단일 지표</strong>로, 러닝·사이클·수영 등 지구력 종목의 잠재력을 결정합니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            높은 VO₂max는 단순히 운동 능력뿐 아니라 <strong style={{ color: 'var(--text)' }}>심혈관 질환·당뇨·치매·전체 사망률을 낮추는 가장 강력한 단일 예측 인자</strong>로 알려져 있습니다 (Mayo Clinic 2018, JAMA Cardiology).
          </p>
        </section>

        {/* 2. 6가지 측정법 비교 */}
        <section>
          <h2 style={sectionTitle}>6가지 측정 방법 비교</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>방법</th>
                    <th scope="col" style={headCell}>소요</th>
                    <th scope="col" style={headCell}>난이도</th>
                    <th scope="col" style={headCell}>정확도</th>
                    <th scope="col" style={headCell}>특징</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={cell}>🏃 <strong>쿠퍼 12분</strong></td>
                    <td style={cell}>12분</td>
                    <td style={cell}>어려움</td>
                    <td style={cell}><strong style={{ color: '#059669' }}>높음</strong></td>
                    <td style={cell}>러너 표준. 트랙·러닝머신 필요. 전력으로 12분 달리기</td>
                  </tr>
                  <tr>
                    <td style={cell}>🏃‍♂️ <strong>1.5마일</strong></td>
                    <td style={cell}>10~16분</td>
                    <td style={cell}>어려움</td>
                    <td style={cell}><strong style={{ color: '#059669' }}>높음</strong></td>
                    <td style={cell}>미군·소방관 체력 표준. 시간을 측정해서 단순 변환</td>
                  </tr>
                  <tr>
                    <td style={cell}>🚶 <strong>락포트 1마일 걷기</strong></td>
                    <td style={cell}>12~20분</td>
                    <td style={cell}>쉬움</td>
                    <td style={cell}><strong style={{ color: '#D97706' }}>보통</strong></td>
                    <td style={cell}>관절 부담 X. 초보·고령·재활 단계 적합. HR 측정 필요</td>
                  </tr>
                  <tr>
                    <td style={cell}>🪜 <strong>퀸즈칼리지 스텝</strong></td>
                    <td style={cell}>3분</td>
                    <td style={cell}>보통</td>
                    <td style={cell}><strong style={{ color: '#D97706' }}>보통</strong></td>
                    <td style={cell}>실내 가능. 41cm 박스 + 메트로놈. 박자 못 맞추면 오차 ↑</td>
                  </tr>
                  <tr>
                    <td style={cell}>📋 <strong>노르웨이 비운동</strong></td>
                    <td style={cell}>1분</td>
                    <td style={cell}>쉬움</td>
                    <td style={cell}><strong style={{ color: '#D97706' }}>보통</strong></td>
                    <td style={cell}>운동 X. 나이·허리둘레·HR·운동습관만으로 추정 (NTNU)</td>
                  </tr>
                  <tr>
                    <td style={cell}>❤️ <strong>안정시 심박</strong></td>
                    <td style={cell}>30초</td>
                    <td style={cell}>쉬움</td>
                    <td style={cell}><strong style={{ color: '#EA580C' }}>낮음</strong></td>
                    <td style={cell}>가장 간단. 신뢰도는 가장 낮음 — 참고용 추세 추적</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            💡 <strong style={{ color: 'var(--text)' }}>가장 정확하게 측정하려면</strong> 실험실에서 가스 분석기로 트레드밀 점진 부하 검사 (Bruce 프로토콜). 대학·체육과학연구원에서 약 15~30만 원.
            본 도구의 6가지 추정 방법은 <strong>참고용</strong>이며 ±10~15% 오차 가능.
          </p>
        </section>

        {/* 3. ACSM 등급 표 */}
        <section>
          <h2 style={sectionTitle}>ACSM 등급표 (mL/kg/min)</h2>

          {/* 남성 */}
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>♂ 남성</p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px', fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>연령</th>
                    <th scope="col" style={headCell}>매우 미흡</th>
                    <th scope="col" style={headCell}>미흡</th>
                    <th scope="col" style={headCell}>평균</th>
                    <th scope="col" style={headCell}>우수</th>
                    <th scope="col" style={headCell}>매우 우수</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={cell}><strong>20대</strong></td><td style={cell}>&lt; 38</td><td style={cell}>38~43</td><td style={cell}>44~51</td><td style={cell}>52~56</td><td style={cell}><strong style={{ color: '#059669' }}>57+</strong></td></tr>
                  <tr><td style={cell}><strong>30대</strong></td><td style={cell}>&lt; 34</td><td style={cell}>34~39</td><td style={cell}>40~47</td><td style={cell}>48~51</td><td style={cell}><strong style={{ color: '#059669' }}>52+</strong></td></tr>
                  <tr><td style={cell}><strong>40대</strong></td><td style={cell}>&lt; 30</td><td style={cell}>30~35</td><td style={cell}>36~43</td><td style={cell}>44~47</td><td style={cell}><strong style={{ color: '#059669' }}>48+</strong></td></tr>
                  <tr><td style={cell}><strong>50대</strong></td><td style={cell}>&lt; 25</td><td style={cell}>25~31</td><td style={cell}>32~39</td><td style={cell}>40~43</td><td style={cell}><strong style={{ color: '#059669' }}>44+</strong></td></tr>
                  <tr><td style={cell}><strong>60대+</strong></td><td style={cell}>&lt; 21</td><td style={cell}>21~26</td><td style={cell}>27~35</td><td style={cell}>36~39</td><td style={cell}><strong style={{ color: '#059669' }}>40+</strong></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 여성 */}
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', margin: '20px 0 8px' }}>♀ 여성</p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px', fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>연령</th>
                    <th scope="col" style={headCell}>매우 미흡</th>
                    <th scope="col" style={headCell}>미흡</th>
                    <th scope="col" style={headCell}>평균</th>
                    <th scope="col" style={headCell}>우수</th>
                    <th scope="col" style={headCell}>매우 우수</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={cell}><strong>20대</strong></td><td style={cell}>&lt; 28</td><td style={cell}>28~33</td><td style={cell}>34~41</td><td style={cell}>42~46</td><td style={cell}><strong style={{ color: '#059669' }}>47+</strong></td></tr>
                  <tr><td style={cell}><strong>30대</strong></td><td style={cell}>&lt; 27</td><td style={cell}>27~32</td><td style={cell}>33~40</td><td style={cell}>41~45</td><td style={cell}><strong style={{ color: '#059669' }}>46+</strong></td></tr>
                  <tr><td style={cell}><strong>40대</strong></td><td style={cell}>&lt; 25</td><td style={cell}>25~30</td><td style={cell}>31~38</td><td style={cell}>39~42</td><td style={cell}><strong style={{ color: '#059669' }}>43+</strong></td></tr>
                  <tr><td style={cell}><strong>50대</strong></td><td style={cell}>&lt; 22</td><td style={cell}>22~28</td><td style={cell}>29~36</td><td style={cell}>37~40</td><td style={cell}><strong style={{ color: '#059669' }}>41+</strong></td></tr>
                  <tr><td style={cell}><strong>60대+</strong></td><td style={cell}>&lt; 20</td><td style={cell}>20~25</td><td style={cell}>26~32</td><td style={cell}>33~36</td><td style={cell}><strong style={{ color: '#059669' }}>37+</strong></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ ACSM Guidelines for Exercise Testing and Prescription (11판) · Cooper Institute Fitness Norms 기준
          </p>
        </section>

        {/* 4. 측정 팁 */}
        <section>
          <h2 style={sectionTitle}>📌 정확한 측정을 위한 팁</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { icon: '🌡️', title: '같은 조건', desc: '같은 시각·기온·풍속에서 측정. 더운 날·강풍 시 결과 ↓' },
              { icon: '💧', title: '수분·식사', desc: '2시간 전 식사 + 충분한 수분. 카페인은 30~40분 전 1잔까지 OK' },
              { icon: '🛌', title: '컨디션', desc: '8시간 수면 + 전날 강도 운동 X. 측정 24시간 전 알코올 X' },
              { icon: '🏃', title: '워밍업', desc: '10~15분 점진 워밍업 필수. 부상·심혈관 사고 예방' },
              { icon: '⏱️', title: '재측정', desc: '3~6개월마다 같은 방법으로. 추세가 절대값보다 중요' },
              { icon: '⚠️', title: '주의', desc: '심장질환·고혈압·관절 통증 있으면 의사 상담 후 측정' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{b.icon} {b.title}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 향상 트레이닝 */}
        <section>
          <h2 style={sectionTitle}>📈 VO₂ Max 향상 트레이닝 (검증된 방법)</h2>
          <div style={{ ...card }}>
            <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
              <li><strong style={{ color: 'var(--text)' }}>HIIT 4×4 (Bjørn Mæhlum 프로토콜)</strong>: 4분 격렬(90~95% HRmax) + 3분 회복 × 4 세트, 주 2회 → 8주 +6~10%</li>
              <li><strong style={{ color: 'var(--text)' }}>30/30 인터벌</strong>: 30초 전력 + 30초 회복 × 15~20 세트 — 시간 효율 ↑</li>
              <li><strong style={{ color: 'var(--text)' }}>Threshold 런</strong>: 20~40분 역치 페이스 (1시간 race pace) — 젖산 처리 ↑</li>
              <li><strong style={{ color: 'var(--text)' }}>Long Run</strong>: 주 1회 90~120분 E 페이스 — 미토콘드리아 발달</li>
              <li><strong style={{ color: 'var(--text)' }}>크로스 트레이닝</strong>: 자전거·수영·로잉 등 다른 종목으로 회복일 활용</li>
              <li><strong style={{ color: 'var(--text)' }}>호흡근 훈련</strong>: 파워 브리드 등 IMT 기기 — 폐활량 자체 ↑</li>
            </ul>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 12, lineHeight: 1.7 }}>
              💡 <strong style={{ color: 'var(--text)' }}>일반인 8~12주 트레이닝 시 +3~10 mL/kg/min</strong> 향상 가능 (시작 수준·성실도에 따라).
              엘리트 수준에선 향상 폭이 작아지지만 1년에 +1~2 mL 가능.
            </p>
          </div>
        </section>

        {/* 6. 한국인 평균 */}
        <section>
          <h2 style={sectionTitle}>🇰🇷 한국 성인 VO₂ Max 평균</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9, marginBottom: 12 }}>
            국민체력100·체육과학연구원(KISS) 통계상 한국 성인 평균은 다음 수준입니다:
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>연령 / 성별</th>
                  <th scope="col" style={headCell}>평균 VO₂max</th>
                  <th scope="col" style={headCell}>일반 운동 가이드</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}>20대 남성</td><td style={cell}><strong>44~48</strong></td><td style={cell}>이미 평균 이상이면 인터벌 권장</td></tr>
                <tr><td style={cell}>30대 남성</td><td style={cell}><strong>40~44</strong></td><td style={cell}>주 3~4회 LSD + 1회 HIIT</td></tr>
                <tr><td style={cell}>40대 남성</td><td style={cell}><strong>36~40</strong></td><td style={cell}>유산소 + 근력 병행</td></tr>
                <tr><td style={cell}>20대 여성</td><td style={cell}><strong>34~38</strong></td><td style={cell}>20분 이상 중강도 유산소</td></tr>
                <tr><td style={cell}>30대 여성</td><td style={cell}><strong>32~36</strong></td><td style={cell}>주 3회 30~45분 조깅·자전거</td></tr>
                <tr><td style={cell}>40대 여성</td><td style={cell}><strong>30~34</strong></td><td style={cell}>관절 부담 적은 자전거·수영 권장</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 한국스포츠개발원 KISS 표준 + 국민체력100 데이터 기준. 개인차 ±5~10.
          </p>
        </section>

        {/* 7. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />

          <details style={faqDetails}>
            <summary style={faqSummary}>Q1. 어떤 방법이 가장 정확한가요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>가스 분석기 실험실 측정(트레드밀 점진 부하)</strong>이 절대 기준입니다 (±2~3% 오차).
              본 도구의 6가지 추정 방법 중에선:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li><strong>러너:</strong> 쿠퍼 12분 또는 1.5마일 (전력 달리기 가능 시)</li>
                <li><strong>초보·고령:</strong> 락포트 1마일 걷기 (관절 부담 X)</li>
                <li><strong>실내:</strong> 퀸즈칼리지 스텝테스트</li>
                <li><strong>측정 자체가 어렵다면:</strong> 노르웨이 비운동 추정 (정확도 ±10~15% 오차이지만 운동 X)</li>
              </ul>
              <strong style={{ color: '#D97706' }}>안정시 심박 비율법</strong>은 가장 간단하지만 오차가 크므로 추세 추적용으로만.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q2. VO₂max는 얼마까지 올릴 수 있나요?</summary>
            <div style={faqAnswer}>
              유전이 약 50% 영향 + 훈련이 30~40% 영향이라고 알려져 있습니다 (Bouchard 1999).
              일반인 기준:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li><strong style={{ color: 'var(--text)' }}>비운동인 → 운동인</strong>: 6개월~1년에 +10~20% (예: 38 → 45)</li>
                <li><strong style={{ color: 'var(--text)' }}>운동인 → 마라톤 입문</strong>: 추가 +5~10% (45 → 50)</li>
                <li><strong style={{ color: 'var(--text)' }}>아마 마스터즈 → 서브3</strong>: VO₂max 58+ 필요</li>
                <li><strong style={{ color: 'var(--text)' }}>엘리트:</strong> 남성 75~85, 여성 65~75 (유전·훈련 모두 상위)</li>
              </ul>
              킵초게(엘리우드)·잉바이·반드페이는 80~85 수준으로 추정됩니다.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q3. 나이가 들면 VO₂max는 얼마나 떨어지나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>비활동인은 10년에 약 10% 감소</strong> (30대 45 → 60대 27).
              그러나 <strong style={{ color: '#059669' }}>꾸준한 유산소 운동</strong>으로 감소를 절반 이하로 늦출 수 있습니다 (10년에 4~5% 감소).
              <br /><br />
              마스터즈 러너 연구에서:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>50대 마라톤 러너의 VO₂max는 비활동 25세 청년과 비슷 (40~45)</li>
                <li>70대 마스터즈 챔피언은 평균 30대 수준 유지 가능 (40+)</li>
              </ul>
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q4. VO₂max가 낮으면 무엇이 문제인가요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: '#DC2626' }}>심혈관 사망률·전체 사망률의 가장 강력한 단일 예측 인자</strong>입니다.
              Mandsager 2018 (JAMA Cardiology) 12만 명 연구:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>VO₂max 하위 25% → 상위 25% 대비 사망률 약 5배</li>
                <li>흡연·당뇨·고혈압보다 더 강한 위험 인자</li>
                <li>VO₂max +1 mL → 사망률 약 9% ↓</li>
              </ul>
              VO₂max가 「매우 미흡」 단계라면 의사 상담 후 점진적 유산소 운동 시작 권장.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q5. 워치(가민·애플)의 VO₂max 표시는 정확한가요?</summary>
            <div style={faqAnswer}>
              가민·폴라·애플 워치의 VO₂max는 <strong style={{ color: 'var(--text)' }}>러닝 중 페이스 + 심박수 비교</strong>로 추정합니다.
              일반적으로 ±5~10% 오차로 <strong>본 도구의 추정 방법과 비슷한 수준</strong>입니다.
              <br /><br />
              주의:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>꾸준히 달려야 갱신됨 (가민은 7일+ 데이터 필요)</li>
                <li>업힐·다운힐·강풍 환경에선 과대/과소 평가</li>
                <li>광학 심박 센서 오차 ±5bpm → VO₂max ±3</li>
              </ul>
              <strong style={{ color: 'var(--text)' }}>본 도구 + 워치 + 3~6개월 추세</strong>를 함께 보면 가장 신뢰 가능.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q6. 마라톤 예상 시간은 어떻게 계산되나요?</summary>
            <div style={faqAnswer}>
              본 도구는 <strong style={{ color: 'var(--text)' }}>VO₂max ≈ Daniels VDOT</strong> 가정 + Riegel 공식으로 5km·10km·하프·풀코스 예상 기록을 간단 추정합니다 (예: VO₂max 50 → 5km 약 23분 / 풀 약 3시간 40분).
              실제 기록은 <strong>젖산 역치 · 러닝 이코노미 · 글리코겐 저장량 · 멘탈</strong>의 영향으로 ±10~15% 변동 가능한 참고용입니다.
              실제 레이스 기록 기반의 정밀 예측(3공식 평균 · 환경/연령 보정 · 목표 역산)은 <Link href="/tools/sports/race-predictor" style={{ color: 'var(--accent)' }}>마라톤 기록 계산기</Link>를 이용하세요.
            </div>
          </details>
        </section>

        {/* 8. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/sports/race-predictor" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏅</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>마라톤 기록 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>5K·10K·하프 → 풀 예측</div>
            </Link>
            <Link href="/tools/sports/pace" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>러닝 페이스 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>페이스 ↔ 완주 시간</div>
            </Link>
            <Link href="/tools/sports/interval-training" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>⏱️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>인터벌 훈련</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>VDOT 기반 페이스</div>
            </Link>
            <Link href="/tools/sports/buildup" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>📈</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>러닝 빌드업</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>점진 페이스 설계</div>
            </Link>
            <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량(BMR)</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>일일 소비 칼로리</div>
            </Link>
            <Link href="/tools/health/sleep-debt" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>😴</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>수면 부채 트래커</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>회복·컨디션 관리</div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
