import Link from 'next/link'
import ExposureClient from './ExposureClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/art/exposure',
  title: '사진 노출 계산기 — 조리개·셔터·ISO 3축 자유 시뮬레이터 + ND·Sunny 16',
  description: '조리개·셔터·ISO 3축을 자유롭게 + 옵션 잠금으로 등가 노출 시뮬. ND 필터·Sunny 16·별 사진 500 룰·180° 셔터까지.',
  keywords: ['사진 노출 계산기', '조리개 셔터 ISO', 'EV 계산', '노출 시뮬레이터', '등가 노출 계산기', 'ND 필터 환산', 'Sunny 16', '500 룰', '별 사진', '180도 셔터 룰', '심도 계산', '장노출', 'Stop 계산', '카메라 수동 모드'],
})

/* 화면 FAQ와 FAQPage JSON-LD를 이 한 배열에서 렌더 (<Faq>) — 답변 HTML은 JSON-LD에서 태그가 제거된다 */
const FAQ_LD = [
  { q: '조리개 1/3 stop과 풀스톱 차이는?',
    a: '풀스톱은 <strong>1.4 → 2 → 2.8 → 4 → 5.6 → 8 → 11 → 16</strong>처럼 √2 배수로 변하는 전통 단위입니다(1 stop = 광량 2배). 현대 카메라는 정밀 조절을 위해 <strong>1/3 stop</strong>(예: f/3.2, f/3.5, f/4) 단위로 세분화돼 있습니다. 이 도구는 f/1.0~f/22 사이 28개 조리개 값(풀 + 1/3 stop)을 지원하며, 슬라이더 한 칸이 1/3 stop입니다. 셔터(30초~1/8000)와 ISO(50~51200)도 같은 1/3 stop 간격이라 세 축의 칸 수를 맞바꾸면 노출이 유지됩니다.' },
  { q: '잠금(Lock) 토글은 어떻게 동작하나요?',
    a: '조리개·셔터·ISO 각각 <strong>독립 토글</strong>이며 <strong>최대 2개</strong>까지 동시에 잠글 수 있습니다.<br />• <strong>0개 (기본)</strong>: 자유 모드 — 각 슬라이더가 EV를 그대로 바꿈. 수동(M) 모드처럼 한 변수씩 효과를 익힐 때.<br />• <strong>1개</strong>: 등가 노출 모드 — 잠근 축은 고정, 나머지 두 축이 서로 보정해 EV 유지. 조리개 잠금 = 심도 유지(Av 모드에 해당), 셔터 잠금 = 움직임 표현 유지(Tv 모드), ISO 잠금 = 노이즈·화질 우선.<br />• <strong>2개</strong>: 1축 자유 — 두 축 고정, 남은 한 축만 움직임 → EV가 변함(실전 제약 시뮬).' },
  { q: '등가 노출(Equivalent Exposure)이란?',
    a: '<strong>같은 EV 값을 가지는 다른 조합들</strong>을 뜻합니다. 예: f/4·1/250·ISO 200 = f/2.8·1/500·ISO 200 = f/4·1/500·ISO 400. 밝기는 모두 같지만 효과는 다릅니다 — 두 번째는 조리개를 연 만큼 배경이 더 흐려지고(보케) 셔터가 빨라져 움직임도 더 잘 멈추며, 세 번째는 셔터를 빠르게 한 대신 ISO를 올려 노이즈가 약간 늘어납니다. 이 도구의 등가 노출 5종은 EV 차이 0.2 stop 이내 조합 중 ISO를 덜 바꾸는 쪽을 우선해, 조리개(조리개 잠금 시 셔터)가 다양한 5개를 보여 줍니다.' },
  { q: 'ND 필터 stop을 어떻게 셔터로 환산하나요?',
    a: 'ND 숫자는 <strong>빛을 줄이는 배율</strong>이라, 원래 셔터 시간에 그 배율을 곱하면 같은 노출이 됩니다(배율 = 2^stop, 즉 stop 수만큼 2를 거듭 곱한 값).<br />• ND8 (3 stop) + 원본 1/250 → 1/250 × 8 = 약 <strong>1/30초</strong><br />• ND1000 (약 10 stop) + 원본 1/250 → 1/250 × 1000 = <strong>4초</strong><br />ND1000을 &lsquo;10 stop&rsquo;으로 어림해 ×1024로 계산하면 4.1초가 나오지만 차이는 0.03 stop이라 실전에서는 무시해도 됩니다. 반대로 ND400을 9 stop(×512)으로 계산하면 28% 길어져 0.36 stop 과노출이 되므로, 이 도구는 항상 배율(×400)을 그대로 씁니다. 두 장을 겹치면 배율은 곱하고 stop은 더합니다.' },
  { q: 'Sunny 16 룰이 디지털에도 유효한가요?',
    a: '네, 햇빛의 밝기는 변하지 않으므로 <strong>그대로 유효</strong>합니다. 현대 카메라의 측광이 더 정밀하지만, Sunny 16은 <strong>측광이 속는 상황</strong>에서 기준점이 됩니다 — 역광, 눈밭, 검은 옷, 콘서트 무대처럼 화면 대부분이 아주 밝거나 어두우면 반사식 측광은 중간 회색에 맞추려다 노출을 틀립니다. 측광에 기대지 않고 노출을 이해하는 연습용으로도 좋습니다.' },
  { q: '별 사진 500 룰이 정확한가요?',
    a: '개략적인 <strong>출발점</strong>입니다. 공식은 <strong>최대 셔터(초) = 500 ÷ (초점거리 × 크롭 팩터)</strong>이고 24mm 풀프레임이면 500/24 = <strong>20.8초</strong>입니다. 다만 이 값은 필름 시대 착란원 기준이라 최근 센서에서는 대체로 깁니다 — 500 룰을 구현한 PhotoPills 자신도 &quot;노출 시간을 너무 크게 준다&quot;고 밝힙니다.<br />• 보수적인 <strong>300 룰</strong>: 300/24 = <strong>12.5초</strong><br />• 더 정밀한 <strong>NPF 룰</strong> 간단식: <strong>t = (35N + 30p) ÷ f</strong> (N = 조리개 f수, p = 픽셀 피치 µm, f = 초점거리 mm)<br />• NPF에는 <strong>크롭 팩터를 따로 곱하면 안 됩니다</strong> — 픽셀 피치에 포맷이 이미 반영돼 이중 계산이 됩니다<br />• 간이 룰들은 풀프레임·APS-C·M4/3 기준이라 <strong>1형(1인치) 이하</strong>에는 적용 근거가 없습니다<br />• 확대해서 별이 늘어나 보이면 셔터를 줄이고 ISO를 올리세요.' },
  { q: '영상 180° 셔터 룰이 뭔가요?',
    a: '영상에서 <strong>셔터 = 1 ÷ (2 × fps)</strong>로 설정하면 눈에 익은 자연스러운 모션 블러가 생깁니다.<br />• 24p → 1/48 (대부분 카메라에 없어 가장 가까운 <strong>1/50</strong> 사용)<br />• 30p → 1/60<br />• 60p → 1/120 (카메라 표기로는 <strong>1/125</strong>)<br />이름은 필름 카메라의 회전 셔터 원판이 180°만큼 열려 있던 데서 왔습니다. 더 빠른 셔터(예: 24p에 1/200)는 동작이 뚝뚝 끊겨 보이고, 더 느리면 흐름이 과해집니다. 밝은 야외에서 셔터를 1/50에 묶어 두려면 ND 필터로 빛을 줄입니다.' },
  { q: '풀프레임과 APS-C는 노출이 다른가요?',
    a: '<strong>EV 자체는 같습니다.</strong> f/2.8 · 1/250 · ISO 100은 센서 크기와 무관하게 같은 밝기의 사진을 만듭니다. 달라지는 것은 다음입니다.<br />• <strong>심도</strong>: 같은 화각·같은 거리로 찍으면 APS-C(×1.5)의 f/2.8은 풀프레임 f/4.2 정도의 심도가 됩니다(f수 × 크롭 팩터)<br />• <strong>화각</strong>: APS-C에 50mm = 풀프레임 약 75mm 화각<br />• <strong>고감도 노이즈</strong>: 같은 세대 센서라면 풀프레임이 약 1.2~1.4 stop 유리합니다. 센서 면적이 APS-C(크롭 ×1.5)의 약 2.25배(log₂ ≈ 1.17 stop), 캐논 APS-C(×1.6)의 약 2.56배(≈ 1.36 stop)라 같은 f수·셔터에서 받는 총 광량이 그만큼 많기 때문이며, 화소 하나의 크기보다 센서 전체 면적이 더 결정적입니다.<br />노출 계산은 센서와 무관하므로 이 도구의 EV는 모든 센서에 그대로 적용됩니다.' },
  { q: '회절(Diffraction)이 뭔가요? f/22가 흐린 이유는?',
    a: '조리개를 좁힐수록 빛이 구멍 가장자리에서 휘어 <strong>해상력이 떨어집니다</strong> — 회절입니다. 흔히 &quot;f/16부터&quot;라고 하지만 그건 필름 인화 기준의 옛 값이고, 화소 기준으로는 훨씬 먼저 시작합니다.<br />계산식: <strong>에어리 원반 지름 = 2.44 × λ × f수</strong>(녹색광 λ ≈ 550nm), <strong>회절 한계 f수 ≈ 픽셀 피치(µm) × 1.9</strong><br />여기서 <strong>두 개념을 구분</strong>해야 합니다.<br />• <strong>회절 한계(상한)</strong>: 24MP급 풀프레임 f/7~f/11, APS-C·M4/3 f/5.6~f/7 — 이보다 조이면 화소를 다 살리지 못합니다<br />• <strong>스위트 스폿(가장 선명한 지점)</strong>: 최대 개방에서 2~3 stop 조인 곳 — f/1.4 렌즈면 f/4~f/5.6, f/2.8 줌이면 f/5.6~f/8<br />• <strong>스마트폰은 대부분 조리개가 고정</strong>이라 고를 수 없습니다(일부 기종만 가변)<br />심도가 꼭 필요할 때(접사·풍경)만 더 조이고, 일반 풍경은 f/8 안팎이 화질·심도 균형점입니다.' },
  { q: '안전 셔터 룰(Safe Shutter)은?',
    a: '삼각대 없이 손으로 들고 찍을 때 흔들림을 막는 경험칙: 셔터를 <strong>1 ÷ (초점거리 × 크롭 팩터)</strong>초보다 빠르게.<br />• 50mm 풀프레임 → 1/50 이상<br />• 200mm 풀프레임 → 1/200 이상<br />• 200mm APS-C → 1/300 이상 (200 × 1.5)<br />[트레이드오프] 탭은 이 기준 대비 현재 셔터가 몇 stop 빠른지·느린지를 계산합니다. 현대 카메라의 <strong>손떨림 보정(IBIS)</strong>은 CIPA 규격 기준 중앙부 <strong>5~8.5 stop</strong>을 표방합니다(2026년 기준 캐논 R5 Mark II·소니 α1 II 8.5 stop, 파나소닉 S1RII 8.0, 니콘 Z5II 7.5). 다만 CIPA 값은 <strong>중앙부·규정 자세</strong> 기준이고 주변부는 1~2 stop 낮게 표기되며, 스마트폰·짐벌의 &quot;몇 stop&quot;은 전자식이라 같은 규격이 아닙니다. 본인 손떨림과 호흡을 고려해 1~2 stop 여유를 두는 게 좋습니다. 손떨림 보정은 피사체의 움직임은 멈추지 못한다는 점도 기억하세요.' },
]

export default function ExposurePage() {
  return (
    <ToolPage width={880} slug="/tools/art/exposure">
      <h1 className="tp-h1">
        <ToolIconBadge catId="art" />사진 노출 계산기
      </h1>
      <p className="tp-lead">
        조리개·셔터·ISO 3축을 자유롭게 + <strong style={{ color: 'var(--text)' }}>옵션 잠금으로 등가 노출</strong> 시뮬. ND·Sunny 16 포함.
      </p>

      <UpdatedMeta
        date="2026년 8월"
        basis="조리개 1/3 stop 계열 = ISO 517(표준 f수 계열, 공비 2^(1/6)) · EV↔조명 대응 = ANSI PH2.7-1973/1986 계열 노출 가이드(직사광 행은 일출 2시간 후~일몰 2시간 전·정면광 기준) · ND 배율↔stop = 제조사 공식 표기 · IBIS stop = CIPA 규격 기준 제조사 발표값"
        sources={[
          { label: 'ISO 517 (f수 표준 계열)', href: 'https://www.iso.org/standard/50089.html' },
          { label: 'PhotoPills — 별 사진 셔터 룰(500·NPF)', href: 'https://www.photopills.com/articles/how-photograph-milky-way' },
          { label: 'EV↔조명 대응표 (ANSI PH2.7 인용)', href: 'https://en.wikipedia.org/wiki/Exposure_value' },
          { label: 'Sunny 16 룰', href: 'https://en.wikipedia.org/wiki/Sunny_16_rule' },
        ]}
      />

      <ExposureClient />

      <GuideDivider />

      {/* 1. 어떻게 사용하나요? */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <ol className="g-list">
        <li><strong>먼저 자유롭게 움직여 보기</strong> — 잠금 0개 상태가 기본. 각 슬라이더가 EV를 그대로 바꿉니다 (수동 모드와 동일)</li>
        <li><strong>축 잠금 (옵션·최대 2개)</strong> — 1개 잠그면 등가 노출 모드 / 2개 잠그면 나머지 한 축만 EV 변경 가능</li>
        <li><strong>EV 확인</strong> — 현재 설정이 맞는 광량(ISO 100 환산 EV) + 기본값(f/4·1/250·ISO 200) 대비 stop 변화</li>
        <li><strong>등가 노출 5종 클릭</strong> — 같은 EV·다른 효과 조합 즉시 적용</li>
        <li><strong>ND 필터·상황 가이드·트레이드오프 탭</strong>에서 장노출 셔터, 상황별 추천값, 손떨림 여유(stop)를 확인</li>
      </ol>
      <p className="g-note">
        조리개·셔터·ISO·잠금 상태와 센서 크기·초점거리·ND 선택은 이 브라우저에만 저장되어 새로고침해도 유지됩니다.
      </p>

      {/* 1.5 잠금 모델 */}
      <h2 className="g-h2">잠금 모드 3가지 — 학습 → 응용 → 제약 시뮬</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 14 }}>
        <div style={{ background: 'var(--bg2)', borderLeft: '3px solid var(--cat-edu)', borderRadius: 'var(--radius-s)', padding: '14px 16px' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px' }}>0개 잠금 — 자유 모드</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.75 }}>
            각 슬라이더가 EV를 직접 변경. 노출 3요소를 처음 배울 때, 또는 효과(심도·흔들림·노이즈)를 한 변수씩 비교해볼 때.
          </p>
        </div>
        <div style={{ background: 'var(--bg2)', borderLeft: '3px solid var(--cat-cooking)', borderRadius: 'var(--radius-s)', padding: '14px 16px' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px' }}>1개 잠금 — 등가 노출 모드</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.75 }}>
            잠근 축 고정 + 나머지 두 축이 서로 보정. 「심도 유지하면서 셔터·ISO만 바꿔보고 싶을 때」 가장 유용. Av/Tv 모드 시뮬에 가까움.
          </p>
        </div>
        <div style={{ background: 'var(--bg2)', borderLeft: '3px solid var(--cat-date)', borderRadius: 'var(--radius-s)', padding: '14px 16px' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px' }}>2개 잠금 — 1축 자유</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.75 }}>
            두 축 고정 + 남은 한 축만 움직임 → EV가 변함. 「조리개 f/8 + ISO 100 고정인 풍경 촬영에서 셔터만 조정」처럼 실전 제약 시뮬.
          </p>
        </div>
      </div>

      {/* 2. 노출 3요소 — 핵심 개념 */}
      <h2 className="g-h2">노출 3요소 — 핵심 개념</h2>
      <p className="g-p">
        사진의 밝기(노출)는 <strong>조리개</strong>·<strong>셔터스피드</strong>·<strong>ISO</strong> 세 축의 조합으로 결정됩니다.
        한 축의 변화는 <strong>stop</strong>(2배 광량 단위)으로 표현되며, 같은 stop만큼 다른 축에서 빼면 노출이 유지됩니다.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 14 }}>
        <div style={{ background: 'var(--bg2)', borderTop: '3px solid var(--cat-edu)', borderRadius: 'var(--radius-s)', padding: '12px 14px' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 4px' }}>조리개 (Aperture)</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
            렌즈 구멍 크기. f/1.4 = 큼(밝음·얕은 심도) / f/22 = 작음(어두움·깊은 심도). 풀스톱 = 1.4 → 2 → 2.8 → 4 → 5.6 → 8 → 11 → 16 → 22.
          </p>
        </div>
        <div style={{ background: 'var(--bg2)', borderTop: '3px solid var(--cat-cooking)', borderRadius: 'var(--radius-s)', padding: '12px 14px' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 4px' }}>셔터스피드 (Shutter)</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
            빛 받는 시간. 30s = 길음(밝음·흐림 위험) / 1/8000 = 짧음(어두움·정지). 1 stop = 2배. 30 → 15 → 8 → 4 → 2 → 1 → 1/2 …
          </p>
        </div>
        <div style={{ background: 'var(--bg2)', borderTop: '3px solid var(--cat-date)', borderRadius: 'var(--radius-s)', padding: '12px 14px' }}>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 4px' }}>ISO (감도)</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
            센서 신호의 증폭. ISO 100 = 깨끗 / ISO 51200 = 어두운 곳에서 촬영 가능하지만 노이즈. 1 stop = 2배. 100 → 200 → 400 → 800 …
          </p>
        </div>
      </div>

      {/* 3. EV (Exposure Value) */}
      <h2 className="g-h2">EV(Exposure Value) — 광량 단위 이해</h2>
      <p className="g-p">
        EV는 <strong>ISO 100 기준 광량</strong>을 표현하는 표준 단위입니다. 1 EV 차이 = 2배 광량 차이(=1 stop).
        이 도구의 공식은 <strong>EV = log₂(N² ÷ t) − log₂(ISO ÷ 100)</strong>(N = 조리개 f수, t = 셔터 초)입니다.
      </p>
      <p className="g-p">
        도구의 기본값 f/4 · 1/250 · ISO 200을 넣어 보면 log₂(4² ÷ (1/250)) = log₂(16 × 250) = log₂(4000) ≈ 11.97이고, ISO를 100에서 200으로 1 stop 올린 만큼 1을 빼 <strong>EV ≈ 11.0</strong>이 됩니다.
        결과 숫자는 &lsquo;이 설정이 알맞게 찍히는 장면의 밝기&rsquo;로 읽으면 됩니다 — 아래 표에서 EV 11은 일몰 무렵이므로, 기본값을 그대로 맑은 한낮(EV 15)에 쓰면 약 4 stop(16배) 과노출이 됩니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 380 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>EV</th>
              <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>광량</th>
              <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>대표 상황</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['16', '눈·모래·물 반사', '직사광 + 반사광 (스키장·해변) — f/22'],
              ['15', '맑은 한낮', '그림자 윤곽 뚜렷 — Sunny 16 (f/16)'],
              ['14', '엷은 구름 낀 해', '그림자 부드러움 (f/11)'],
              ['13', '흐림', '그림자 거의 없음 (f/8)'],
              ['12', '짙게 흐림 · 맑은 날 그늘', '두꺼운 구름 / 나무 그늘 (f/5.6)'],
              ['11', '일몰 무렵', '해 지기 직전·직후 (f/4)'],
              ['7~9', '실내 밝음', '창가·LED 매장'],
              ['4~6', '실내 어둑함', '백열등·식당·무대 조명'],
              ['0~3', '야경·새벽', '도시 야경 + 삼각대'],
              ['−3~−1', '달빛', '보름달 야외 (달 고도 40° 이상)'],
              ['−6~−4', '은하수 촬영 관행값', '실촬영 f/2.8·20초·ISO 1600~3200 — 표준표의 별빛 값은 아님'],
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--accent-ink)', whiteSpace: 'nowrap' }}>{row[0]}</td>
                <td style={{ padding: '8px 10px', color: 'var(--text)' }}>{row[1]}</td>
                <td style={{ padding: '8px 10px', color: 'var(--muted)' }}>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        → 카메라 측광이 EV 12를 가리키면 ISO 100 기준으로 <strong>f/8 → 1/60</strong>, f/5.6 → 1/125, f/4 → 1/250입니다.
        같은 EV의 등가 노출은 무수히 많아요. (예전 이 자리에 적혀 있던 &quot;f/8 → 1/250&quot;은 EV 14로 2 stop 어긋난 값이었습니다.)
        <br />위 값은 ANSI PH2.7 계열 노출 가이드의 공칭값이며, 직사광 행은 <strong>일출 2시간 후 ~ 일몰 2시간 전, 정면광</strong> 기준입니다.
      </p>

      {/* 4. ND 필터 */}
      <h2 className="g-h2">ND 필터 — 대낮에 장노출하기</h2>
      <p className="g-p">
        ND(Neutral Density) 필터는 <strong>색을 바꾸지 않고 빛의 양만 줄이는</strong> 회색 필터입니다.
        대낮에도 폭포 실크 효과(2초 이상), 안개 같은 파도(15초 이상) 등 장노출이 가능해집니다.
        [ND 필터] 탭은 원래 셔터 × ND 배율로 새 셔터를 계산하고, 두 장을 겹치면 배율을 곱합니다.
      </p>
      <ul className="g-list">
        <li><strong>ND2/4/8</strong> (1~3 stop): 대낮 인물 + 조리개 활짝(보케)</li>
        <li><strong>ND16/32</strong> (4~5 stop): 폭포 실크 효과 (1/2 ~ 2초)</li>
        <li><strong>ND64/400</strong> (6 ~ 약 8⅔ stop): 파도 안개·구름 흐름 (5 ~ 60초)</li>
        <li><strong>ND1000</strong> (약 10 stop): 구름 흐름·사람 지우기 (1 ~ 5분)</li>
      </ul>
      <Callout tone="tip" title="적층과 가변 ND">
        ND8(3 stop) + ND64(6 stop) = 9 stop(×512). 가변 ND는 편광판 두 장을 겹친 구조라, 소광에 가까울수록 <strong>어두운 X자 띠</strong>가 생깁니다(색번짐이 아니라 편광 축이 어긋나 생기는 기하학적 현상). 광각일수록 잘 보입니다.
      </Callout>
      <p className="g-note">
        ND 숫자는 <strong>배율(투과율의 역수)</strong>이 정의라 stop은 종속값입니다 — ND400은 9 stop이 아니라 log₂400 = <strong>약 8⅔ stop</strong>(켄코 공식 표기 「8 2/3段分」)입니다.
      </p>

      {/* 5. Sunny 16 룰 */}
      <h2 className="g-h2">Sunny 16 룰 — 측광 없이 노출 잡기</h2>
      <p className="g-p">
        오래된 필름 시대 룰입니다. <strong>밝은 햇빛 + ISO 100 + 조리개 f/16 → 셔터 1/100</strong>이 적정 노출.
        여기서 한 stop씩 보정하면 대부분 상황의 노출을 추정할 수 있습니다. [상황 가이드] 탭의 날씨별 추천값도 이 사다리를 따릅니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 380 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>날씨</th>
              <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>조리개 (ISO 100, 셔터 1/100 기준)</th>
              <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>그림자</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['눈·모래·물 반사', 'f/22',  '뚜렷 + 반사광'],
              ['맑거나 옅게 흐린 해', 'f/16',  '윤곽 뚜렷 (Sunny 16 기본)'],
              ['엷은 구름 낀 해', 'f/11',  '부드러움'],
              ['흐림',            'f/8',   '거의 없음'],
              ['짙게 흐림',       'f/5.6', '없음'],
              ['열린 그늘·일몰 무렵', 'f/4',   '없음 (해는 나 있으나 그늘)'],
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 10px', color: 'var(--text)' }}>{row[0]}</td>
                <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--accent-ink)' }}>{row[1]}</td>
                <td style={{ padding: '8px 10px', color: 'var(--muted)' }}>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="g-list" style={{ marginTop: 12 }}>
        <li><strong>역광 보정</strong>: 통용 표는 +1 stop, Kodak 각주는 <strong>역광 클로즈업에 한해 +2 stop</strong>(f/16 → f/8)을 제시합니다.</li>
        <li>판정 기준은 &quot;해가 보이는가&quot;가 아니라 <strong>그림자 윤곽이 뚜렷한가</strong>입니다 — 옅게 흐린 해도 f/16 칸입니다.</li>
        <li><strong>열린 그늘</strong>(해는 났지만 그늘에 들어간 상황)을 Kodak은 짙은 흐림과 묶어 f/5.6으로 둡니다. 위 표는 통용 6단 사다리라 f/4로 한 칸 더 엽니다.</li>
        <li>셔터는 <strong>1/ISO</strong>가 원칙이라 ISO 100에서 1/100이지만, 다이얼에 1/100이 없는 기종은 1/125를 씁니다(약 0.3 stop 차이).</li>
        <li>카메라 측광이 잘못된 상황(역광·눈·검은 옷)에서 최후의 보루. RAW로 찍으면 후보정 여유가 더 많아집니다.</li>
      </ul>

      {/* FAQ — 화면 목록과 FAQPage JSON-LD를 같은 배열에서 렌더 */}
      <Faq items={FAQ_LD} />

      {/* 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/art/color" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🎨</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>색상 코드 변환기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            HEX·RGB·HSL·CMYK 변환
          </p>
        </Link>
        <Link href="/tools/art/golden-ratio" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📐</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>황금비율 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            구도·디자인 황금비
          </p>
        </Link>
        <Link href="/tools/edu/sound-speed" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔊</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>소리 속도 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            번개·천둥 거리 계산
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
