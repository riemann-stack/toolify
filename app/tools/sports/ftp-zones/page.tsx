import Link from 'next/link'
import FtpZonesClient from './FtpZonesClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/sports/ftp-zones',
  title: 'FTP·파워존 계산기 — 사이클 훈련 강도 (Coggan)',
  description: '20분·램프·8분 테스트로 FTP를 추정하고 Coggan 7단계 파워존(W)과 W/kg 등급, 즈위프트 레이스 카테고리를 계산. 실내 사이클·즈위프트 훈련용.',
  keywords: [
    'FTP 계산기', 'FTP 테스트', '파워존 계산', '즈위프트 FTP', 'W/kg 등급',
    '사이클 파워존', '20분 파워 테스트', 'Coggan 파워존', '램프 테스트',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

const FAQ_LD = [
  {
    q: 'FTP가 뭔가요?',
    a: '<strong>FTP(Functional Threshold Power, 기능적 역치 파워)</strong>는 <strong>1시간 동안 유지할 수 있는 최대 평균 파워(W)</strong>를 뜻합니다. 사이클 훈련 강도의 기준점으로, FTP를 알면 회복·지구력·역치·VO₂max 등 각 훈련 구간을 파워(W)로 정확히 설정할 수 있습니다. 실제로 1시간을 전력으로 타긴 어려워서, 보통 20분·램프 테스트로 추정합니다.',
  },
  {
    q: '20분 테스트에 왜 0.95를 곱하나요?',
    a: '1시간(FTP)보다 <strong>20분은 더 높은 파워</strong>를 낼 수 있기 때문입니다. 20분 전력 평균에 <strong>0.95(95%)</strong>를 곱하면 1시간 유지 가능 파워에 가깝게 보정됩니다. 예를 들어 20분 평균이 260W라면 FTP는 약 247W입니다. 이 방식은 Allen·Coggan의 표준 프로토콜로, 20분 테스트 전 5분 전력 구간을 넣어 무산소 능력을 미리 소진시키는 것이 정석입니다.',
  },
  {
    q: '램프 테스트와 20분 테스트 중 뭐가 정확한가요?',
    a: '<strong>20분 테스트가 더 정확</strong>하다고 보지만 훨씬 고통스럽습니다. 램프 테스트(즈위프트 기본)는 강도를 1분마다 올리다 탈진하는 방식으로, 짧고 편하지만 개인의 무산소 능력에 따라 <strong>과대·과소 추정</strong>될 수 있습니다(최대 1분 파워 × 0.75). 무산소 능력이 좋은 스프린터형은 램프에서 FTP가 높게 나오는 경향이 있습니다. 처음엔 램프로 대략 잡고, 주기적으로 20분 테스트로 보정하는 것을 권합니다.',
  },
  {
    q: 'W/kg는 왜 중요한가요?',
    a: '오르막과 가속에서는 <strong>절대 파워(W)보다 체중당 파워(W/kg)</strong>가 속도를 좌우합니다. 같은 300W라도 60kg 라이더(5.0 W/kg)가 90kg 라이더(3.3 W/kg)보다 언덕을 훨씬 빠르게 오릅니다. 그래서 클라이머는 W/kg을, 평지 스프린터·타임트라이얼은 절대 W를 더 중시합니다. 즈위프트 페이스 그룹도 zFTP W/kg을 주 기준으로 하되 절대 와트 조건을 함께 봅니다.',
  },
  {
    q: '즈위프트 카테고리는 어떻게 정해지나요?',
    a: '즈위프트 공식 페이스 그룹 표(오픈 이벤트)는 <strong>zFTP W/kg</strong>을 기준으로 A 4.2 이상 · B 3.36 이상 · C 2.63 이상 · D 2.63 미만으로 나눕니다. 다만 실제 배정은 zFTP만 보는 것이 아니라 <strong>zMAP</strong>(A 5.1 · B 4.1 · C 3.2 W/kg)과 <strong>절대 와트</strong>(A 250W · B 200W · C 150W)를 함께 보며, 여성 전용 이벤트는 A 기준이 3.88 W/kg으로 다릅니다. 또 현재는 대부분의 이벤트가 A~D 대신 <strong>레이싱 스코어(0~1,000점)</strong>로 배정되고, 즈위프트는 두 체계가 서로 대응하지 않는다고 명시합니다. 이 계산기의 카테고리는 <strong>zFTP W/kg 기준의 참고 구간</strong>이며, 실제 배정은 즈위프트 앱에서 확인하세요.',
  },
  {
    q: 'FTP는 얼마나 자주 다시 재나요?',
    a: '보통 <strong>4~6주마다</strong> 재측정합니다. 훈련이 잘 되면 FTP가 오르고, 그에 맞춰 파워존도 다시 계산해야 훈련 강도가 정확해집니다. 다만 테스트 자체가 매우 힘들어 컨디션·수면·더위에 따라 값이 출렁이므로, 한 번의 결과보다 <strong>추세</strong>를 보는 것이 좋습니다. 큰 대회 전에는 테스트로 피로를 쌓지 않도록 시점을 조절하세요.',
  },
]

const RELATED = [
  { href: '/tools/sports/vo2max', icon: '🫁', name: 'VO₂ Max 계산기', desc: '심폐 체력 추정' },
  { href: '/tools/sports/interval-training', icon: '🔁', name: '인터벌 훈련 계산기', desc: '고강도 인터벌 설계' },
  { href: '/tools/sports/pace', icon: '🏃', name: '러닝 페이스 계산기', desc: '페이스↔기록' },
  { href: '/tools/sports/carb-loading', icon: '🍚', name: '카보로딩 계산기', desc: '대회 전 탄수화물' },
  { href: '/tools/health/heat-hydration', icon: '💧', name: '폭염 수분·전해질', desc: '실내 라이딩 수분' },
  { href: '/tools/sports/strength-level', icon: '🏋️', name: '파워리프팅 계산기', desc: 'DOTS·1RM' },
]

export default function FtpZonesPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        스포츠
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="sports" />FTP·파워존 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        20분·램프 테스트로 <strong style={{ color: 'var(--text)' }}>FTP와 7단계 파워존(W)</strong> + W/kg 등급·즈위프트 카테고리.
      </p>

      <FtpZonesClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. FTP 추정식 */}
        <section>
          <h2 style={sectionTitle}>FTP 추정 방법</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>20분 테스트</span> = 20분 평균 파워 × 0.95</div>
            <div><span style={{ color: 'var(--muted)' }}>램프 테스트</span> = 최고 1분 파워 × 0.75</div>
            <div><span style={{ color: 'var(--muted)' }}>8분 테스트</span> = 2회 중 높은 쪽 평균 × 0.90</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 계수의 출처는 각각 다릅니다 — 20분 ×0.95는 Hunter Allen(Peaks Coaching Group)·TrainingPeaks, 램프 ×0.75는 TrainerRoad·Zwift 공식,
            8분 ×0.90은 CTS(Carmichael Training Systems) 필드 테스트(8분 올아웃 2회, 사이 10분 회복 — 필드 테스트 파워가 실험실 역치보다
            약 10% 높다는 CTS 관찰에 따른 실무 계수). 실제 역치는 컨디션·측정 조건·무산소 능력에 따라 달라지니 추세로 판단하세요.
          </p>
        </section>

        {/* 1-2. 20분 테스트 실제 절차 */}
        <section>
          <h2 style={sectionTitle}>20분 FTP 테스트 — 실제 진행 절차</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 14 }}>
            20분 테스트는 <strong style={{ color: 'var(--text)' }}>&ldquo;20분만 전력으로 타는 것&rdquo;이 아닙니다</strong>. 프로토콜을 공개한 Hunter Allen(<em>Training and Racing with a Power Meter</em> 공저자·WKO 공동 개발자)의 순서를 보면 본 측정 앞에 45분가량의 준비 구간이 붙고, 그 안에 <strong style={{ color: 'var(--text)' }}>5분 올아웃</strong>이 반드시 들어갑니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 500 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['순서', '구간', '시간', '강도·요령'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 2 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1', '워밍업', '20분', '최대심박 약 65%의 지구력 페이스'],
                  ['2', '고회전 드릴', '1분 × 3회', '100rpm 빠른 페달링 — 사이사이 1분 이지 회복'],
                  ['3', '이지', '5분', '최대심박 65%로 되돌리기'],
                  ['4', '올아웃', '5분', '전력 — 20분 결과를 좌우하는 구간'],
                  ['5', '이지', '10분', '지구력 페이스로 회복'],
                  ['6', '20분 타임트라이얼', '20분', '측정 구간 — 균등 페이스로 끝까지'],
                  ['7', '쿨다운', '10~15분', '지구력 페이스'],
                  ['8', '마무리', '10~15분', '이지 페달링'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[1]}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 출처: Peaks Coaching Group — Hunter Allen, &ldquo;So you&rsquo;re ready for your first FTP test?!?&rdquo;(2019-02-04 게시)의 원문 순서. 재측정할 때도 <strong>같은 워밍업</strong>을 쓰는 것이 비교의 전제입니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>5분 올아웃을 20분 TT 앞에 두는 세 가지 이유</p>
            {[
              ['다리를 연다', '본 측정 전에 다리를 깨워, 20분 구간 초반부터 제 파워가 나오게 합니다.'],
              ['VO₂max 파워 측정', '이 5분 자체가 VO₂max 존에서 낼 수 있는 파워를 재는 측정 구간입니다.'],
              ['‘신선함’ 제거', '무산소 여력을 미리 덜어내야, 이어지는 20분 파워가 FTP를 대표하는 값이 됩니다.'],
            ].map((r, i) => (
              <p key={i} style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
                <strong style={{ color: 'var(--accent-ink)' }}>{i + 1}. {r[0]}</strong> — {r[1]}
              </p>
            ))}
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              그래서 이 5분을 빼면 20분 평균이 올라갑니다. 훈련된 사이클리스트 21명에게 워밍업만 4가지로 바꿔 같은 20분 TT를 시킨 연구에서, 5분 TT가 포함된 45분 워밍업 뒤의 20분 파워는 256±30W·257±30W였지만, 고회전 위주 25분·자율 선택 10분 워밍업 뒤에는 270±30W로 <strong style={{ color: 'var(--text)' }}>약 14W(≈5%) 높았습니다</strong>. 준비 구간을 건너뛴 20분 평균에 그대로 ×0.95를 적용하면 그만큼 FTP가 과대추정됩니다.
            </p>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 워밍업 비교 연구: Borszcz FK 외, &ldquo;Functional Threshold Power Estimated from a 20-minute Time-trial Test is Warm-up-dependent&rdquo;, <em>Int J Sports Med</em> 2022;43(5):411-417 (PMID 34749416).
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginTop: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>×0.95의 근거와 한계</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
              Allen의 설명은 단순합니다 — 20분 노력에는 무산소 능력이 더 섞여 60분 노력보다 파워가 약 5% 부풀려지므로, 20분 <strong style={{ color: 'var(--text)' }}>전체 평균 파워</strong>(정규화 파워가 아님)에서 5%를 뺍니다. 원문 예시는 평균 300W → 15W 차감 → FTP 285W입니다. TrainingPeaks도 &lsquo;최근 최고 20분 평균 파워의 95%가 현재 설정된 역치보다 크면 역치 상향을 제안한다&rsquo;는 규칙을 제품에 그대로 구현해 두었습니다(헬프센터 2025-05-21 갱신 기준).
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 8 }}>
              다만 0.95가 모두에게 맞는 값은 아닙니다. 같은 TrainingPeaks 블로그에서 코치 Kolie Moore는 이 계수가 <strong style={{ color: 'var(--text)' }}>인구의 약 50~60%에만 정확</strong>하며, 자신이 지도하는 선수들의 20분 파워 대비 FTP 비율은 트랙 스프린터 86%부터 타임트라이얼 선수 96%까지 벌어진다고 밝혔습니다. 무산소 능력이 좋을수록 0.95는 과대추정 쪽으로 기웁니다.
            </p>
          </div>
        </section>

        {/* 2. Coggan 7존 표 */}
        <section>
          <h2 style={sectionTitle}>Coggan 파워존 (FTP 대비 %)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 500 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['존', '이름', 'FTP 대비', '목적'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 2 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Z1', '회복', '~55%', '적극적 회복'],
                  ['Z2', '지구력', '56~75%', '유산소 기초·장거리'],
                  ['Z3', '템포', '76~90%', '지속 강도'],
                  ['Z4', '역치', '91~105%', 'FTP 향상 핵심'],
                  ['Z5', 'VO₂max', '106~120%', '최대산소섭취'],
                  ['Z6', '무산소', '121%↑', '무산소 파워'],
                  ['Z7', '신경근', '%FTP 미정의', '스프린트'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[1]}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 채택 판본: Andrew Coggan 본인 명의의 TrainingPeaks 게시글 &ldquo;Cycling Power Zones Explained: Coggan&rsquo;s 7-Level System&rdquo;의 표(%FTP 열) — 55% 미만 / 56~75 / 76~90 / 91~105 / 106~120 / 121% 초과 / Z7은 N/A. 원표에서 <strong>Z6는 상한이 없고 Z7은 %FTP로 정의되지 않습니다</strong>. 위 계산기가 Z6를 150%에서 끊고 Z7을 그 위로 잡는 것은 표시용 관행값입니다. TrainingPeaks의 공식 Zones Calculator도 같은 이유로 존 7을 빼고 6존만 제공하며, 필요하면 15~20초 스프린트 테스트 결과를 Z6·Z7 경계로 직접 입력하라고 안내합니다. 한편 같은 TrainingPeaks의 Joe Friel 글이 책 판본을 인용한 표는 55~74 / 75~89 / 90~104 / 105~120 / 120% 초과로 경계가 1%p씩 다릅니다 — 판본 차이이므로 다른 사이트와 값이 어긋나도 오류가 아닙니다.
          </p>
        </section>

        {/* 2-2. 존별 대표 세션 */}
        <section>
          <h2 style={sectionTitle}>존별 대표 훈련 세션</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 14 }}>
            존 경계만 안다고 훈련이 되지는 않습니다. Coggan은 각 존이 실제로 어떤 <strong style={{ color: 'var(--text)' }}>지속 시간의 인터벌</strong>로 수행되는지도 함께 적어 두었습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['존', '대표 세션 형태', '실행 시 주의'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Z3 템포', '길게 이어 타는 지속 주행', '지속 시간이 지나치지 않으면 연속일 실시도 가능'],
                  ['Z4 역치', '10~30분 블록을 여러 번 반복(repeats·modules·blocks)', '한 블록을 처음부터 끝까지 균등하게 — FTP 향상의 핵심'],
                  ['Z5 VO₂max', '3~8분 인터벌', '한 세션 총량 30~40분을 넘기기 어렵고, 연속일 실시는 권장되지 않음'],
                  ['Z6 무산소', '30초~3분 고강도 인터벌', '회복 구간을 충분히 — 총량보다 한 번의 질'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 출처: 위와 같은 Coggan 원문의 존별 서술. 참고로 이 7단계 체계에는 <strong>&lsquo;스윗스팟&rsquo;이 없습니다</strong>(템포가 76~90%). 용어를 만든 Frank Overton(FasCat Coaching, 2005년 1월 명명)은 84~97% FTP로, TrainerRoad는 88~94% FTP로 정의해 서로 다르므로 단일 표준처럼 쓰지 마세요.
          </p>

          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginTop: 20, marginBottom: 10 }}>파워미터가 없다면 — 심박(%LTHR)·RPE로</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['존', '심박 (%LTHR)', 'RPE (주관적 강도)'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Z1 회복', '68% 미만', '2 미만'],
                  ['Z2 지구력', '69~83%', '2~3'],
                  ['Z3 템포', '84~94%', '3~4'],
                  ['Z4 역치', '95~105%', '4~5'],
                  ['Z5 VO₂max', '106% 초과', '6~7'],
                  ['Z6 무산소', '해당 없음', '7 초과'],
                  ['Z7 신경근', '해당 없음', '최대'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[0]}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--text)', fontWeight: 600 }}>{r[1]}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 여기서 %는 <strong>최대심박이 아니라 LTHR(젖산역치 심박)</strong> 기준입니다. LTHR은 혼자서(대회·동료 없이) 30분 타임트라이얼을 하고 10분 지점에서 랩을 끊어 <strong>마지막 20분의 평균 심박</strong>을 보면 근사치가 나옵니다(Joe Friel, TrainingPeaks). Friel은 최대심박을 &lsquo;220 − 나이&rsquo;로 구하지 말라고 못 박습니다 — 맞을 확률과 틀릴 확률이 비슷하다는 이유입니다.
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
            ※ 파워존과 심박존은 1:1로 대응하지 않습니다. TrainingPeaks 공식 문서도 자사 Zones Calculator의 Coggan 심박존이 파워존에 &lsquo;대략 대응하도록(approximately correspond)&rsquo; 만들어진 것이라고 밝힙니다(헬프센터 2025-04-24 갱신 기준). Coggan 원표에도 Z4 심박은 훈련 초반에 기준까지 오르지 않을 수 있고, Z5는 심박 반응 지연과 최대심박 상한 때문에 평균 심박이 기준에 못 미칠 수 있다는 단서가 달려 있습니다.
          </p>
        </section>

        {/* 3. W/kg 등급 */}
        <section>
          <h2 style={sectionTitle}>W/kg 등급 참고표</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {[
              ['5.0 W/kg 이상', '엘리트/프로급'],
              ['4.0~5.0', '매우 우수 (레이서)'],
              ['3.2~4.0', '우수 (숙련 동호인)'],
              ['2.5~3.2', '보통 (중급)'],
              ['1.8~2.5', '입문 (초급)'],
              ['1.8 미만', '초보 시작 단계'],
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[0]}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{r[1]}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 커뮤니티 통용 참고값(남성 20분 FTP 기준). 성별·연령·종목에 따라 다르며 절대 기준이 아닙니다.
          </p>
        </section>

        {/* 4. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 5. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {RELATED.map((t, i) => (
              <Link key={i} href={t.href} style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, textDecoration: 'none' }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
