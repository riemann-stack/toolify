import Link from 'next/link'
import RoomModeClient from './RoomModeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import {
  ROOM_PRESETS, TRAPS,
  soundSpeed, modeFreq, schroederFreq, diagnoseRatio, inBoltArea, listenerScore, fmt,
} from './roomModeUtils'

export const metadata = buildMetadata({
  path: '/tools/edu/room-mode',
  title: '룸 모드 계산기 — 홈오디오·홈스튜디오 평면도·베이스 트랩 가이드',
  description: '방 가로·세로·높이 → 축방향·접선·사선 모드 30+ + 슈로더 주파수·평면도 시각화·38% 룰·베이스 트랩 가이드.',
  keywords: ['룸 모드', '룸 모드 계산기', '베이스 트랩', '슈로더 주파수', '38% 룰', 'Bolt Area', '방 비율 진단', '홈오디오', '홈스튜디오', '음향 측정'],
})

/* 가이드 표·예시 수치는 손으로 적지 않고 계산기와 같은 roomModeUtils 함수로 빌드 시 계산한다. */
const C20 = soundSpeed(20)

/** EBU Tech 3276·ITU-R BS.1116-3: 치수 비(l/h·w/h·l/w)가 정수의 ±5% 이내면 피할 것 (계산기 판정에는 없는 추가 점검) */
function nearIntegerRatios(L: number, W: number, H: number): string[] {
  const long = Math.max(L, W)
  const short = Math.min(L, W)
  const pairs: [string, number][] = [['길이/높이', long / H], ['너비/높이', short / H], ['길이/너비', long / short]]
  return pairs
    .filter(([, r]) => { const n = Math.round(r); return n >= 1 && Math.abs(r - n) / n <= 0.05 })
    .map(([k, r]) => `${k} ${r.toFixed(2)}`)
}

const PRESET_ROWS = ROOM_PRESETS.map((p) => {
  const d = diagnoseRatio(p.W, p.L, p.H)
  return {
    id: p.id,
    label: p.label,
    dims: `${p.L} × ${p.W} × ${p.H}`,
    V: p.L * p.W * p.H,
    fL: modeFreq(1, 0, 0, p.L, p.W, p.H, C20),
    fW: modeFreq(0, 1, 0, p.L, p.W, p.H, C20),
    fH: modeFreq(0, 0, 1, p.L, p.W, p.H, C20),
    fs: schroederFreq(p.L, p.W, p.H, 0.4),
    grade: `${d.diagnosis} · ${d.label}`,
    bolt: inBoltArea(p.W / p.H, p.L / p.H),
    nearInt: nearIntegerRatios(p.L, p.W, p.H),
  }
})

/* 계산 예시 — 계산기 첫 화면 기본값(세로 5.0 · 가로 3.5 · 높이 2.4m, 20°C, RT60 0.4초) */
const EX = { L: 5.0, W: 3.5, H: 2.4 }
const EX_L1 = modeFreq(1, 0, 0, EX.L, EX.W, EX.H, C20)
const EX_W1 = modeFreq(0, 1, 0, EX.L, EX.W, EX.H, C20)
const EX_H1 = modeFreq(0, 0, 1, EX.L, EX.W, EX.H, C20)
const EX_L2 = modeFreq(2, 0, 0, EX.L, EX.W, EX.H, C20)
const EX_T110 = modeFreq(1, 1, 0, EX.L, EX.W, EX.H, C20)
const EX_FS = schroederFreq(EX.L, EX.W, EX.H, 0.4)
const EX_FS06 = schroederFreq(EX.L, EX.W, EX.H, 0.6)
const EX_DIAG = diagnoseRatio(EX.W, EX.L, EX.H)
const EX_NEAR = nearIntegerRatios(EX.L, EX.W, EX.H)
const SCORE_38 = listenerScore(0.5, 0.38)
const SCORE_50 = listenerScore(0.5, 0.5)
const SCORE_25 = listenerScore(0.5, 0.25)

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', fontSize: 13, verticalAlign: 'top' }
const tdNum: React.CSSProperties = { ...td, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const rowBorder: React.CSSProperties = { borderBottom: '1px solid var(--border)' }
const formulaBox: React.CSSProperties = { background: 'var(--bg3)', borderRadius: 'var(--radius-m)', padding: '14px 16px', margin: '0 0 16px', fontSize: 14, color: 'var(--text)', lineHeight: 1.9, maxWidth: 'var(--w-read)' }

const FAQ_LD = [
  { q: '룸 모드는 왜 생기나요?',
    a: '밀폐된 방 안에서 <strong>음파가 평행 벽 사이를 왕복</strong>하며 같은 위상으로 겹치면 정상파(standing wave)가 생깁니다. 정상파는 <strong>방 치수로 정해지는 특정 주파수에서만</strong> 강하게 생겨 자리마다 저음 크기가 달라져요. 예: 길이 5m 방의 1차 축방향 모드 = 343/(2×5) ≈ 34.3Hz. 이 주파수에서 앞·뒤 벽 근처는 음압 최대(부풀림), 방 한가운데는 음압이 0에 가까운 노드가 됩니다.' },
  { q: '가장 안 좋은 방 형태는?',
    a: '<strong>정육면체(1:1:1)나 두 변이 같은 방(1:1:N)</strong>입니다. 여러 축의 모드가 같은 주파수에 겹쳐 그 음만 유독 크게 울립니다. 예: 3×3×3m 방은 가로·세로·높이 1차 모드가 모두 약 57Hz에 몰립니다. 권장 비율의 예로 <strong>Sepmeyer 1:1.14:1.39, Louden 1:1.4:1.9</strong> 등이 있지만 단일 최적 비율은 없습니다. 방송 청취실 기준(EBU Tech 3276·ITU-R BS.1116)은 비율이 정수배의 ±5% 안에 드는 것도 피하라고 합니다.' },
  { q: '슈로더 주파수가 뭔가요?',
    a: '<strong>개별 룸 모드가 소리를 좌우하는 영역과, 모드가 촘촘해져 통계적으로 다룰 수 있는 영역의 경계</strong>입니다. 이 아래에서는 자리마다 저음이 크게 달라 EQ만으로는 보정이 잘 안 되고, 청취 위치 조정과 베이스 트랩 같은 물리적 처리가 우선입니다.<br>공식: fs = 2000 × √(RT60 / V). RT60 0.4초 기준 체적 40~50m³ 거실은 약 180~200Hz입니다. 이 도구는 RT60 기본값 0.4초로 계산하며, 방 치수 카드의 슬라이더로 0.2~1.0초 사이에서 바꿀 수 있습니다.' },
  { q: '38% 룰은 무엇인가요?',
    a: '청취 위치를 방 길이의 38% 지점(앞 벽 기준)에 두라는 출발점입니다. 예: 5m 방 → 앞 벽에서 1.9m. 평면도 탭에 38% 라인이 자동으로 표시되며, 왜 38%인지와 스피커 배치는 본문 &lsquo;38% 룰 — 청취자·스피커 위치&rsquo;에 정리했습니다.' },
  { q: '도구의 RT60 기본값 0.4초가 우리 방과 다르면?',
    a: '방 치수 카드의 RT60 슬라이더(0.2~1.0초)로 바꿔 보세요. <strong>RT60(잔향시간)은 슈로더 주파수 계산에만</strong> 들어가고, 룸 모드 주파수 자체는 방 치수와 온도만으로 정해집니다.<br>• 잔향이 긴 반사성 방(RT60 0.6초): 슈로더 주파수 약 <strong>22% 상승</strong> (√(0.6/0.4) ≈ 1.22)<br>• 흡음재가 많은 방(RT60 0.25초): 약 <strong>21% 하강</strong> (√(0.25/0.4) ≈ 0.79)<br>모드 표와 평면도 시각화는 RT60과 무관하게 그대로 유효합니다. 실제 RT60은 <a href="/tools/edu/sound-speed">음속 계산기</a>의 잔향 탭으로 어림하거나 측정 소프트웨어로 잴 수 있습니다.' },
  { q: '베이스 트랩은 꼭 필요한가요?',
    a: '저음이 특정 자리에서만 붕붕 울리거나 특정 음이 사라진다면 효과가 큽니다. 슈로더 주파수 아래의 부밍은 EQ로 잡기 어렵기 때문입니다.<br>• <strong>홈오디오 감상</strong>: 코너 트랩 2~4개 + 1차 반사 지점 패널 2~4개<br>• <strong>홈스튜디오(믹싱·녹음)</strong>: 트랩 + 흡음 패널 + 필요하면 디퓨저까지 종합 설계<br>• <strong>일반 TV 시청</strong>: 청취 위치 조정과 코너 트랩 몇 개만으로도 체감 개선<br>글라스울·미네랄울 보드에 천 마감으로 직접 만들면 개당 5~10만원 선입니다(재료 두께·크기에 따라 다름).' },
  { q: '권장 비율(1:1.14:1.39 등)을 못 맞추면?',
    a: '아파트 거실은 치수를 바꿀 수 없으니 <strong>위치와 흡음으로 보완</strong>합니다.<br>• 청취 위치를 정중앙(50%)에서 빼 38% 근처로<br>• 저음 압력이 모이는 코너에 두꺼운 흡음재(코너 트랩)<br>• 러그·커튼으로 중고음 1차 반사 정리<br>• 측정 마이크 + REW 같은 측정 프로그램으로 부밍 주파수를 확인한 뒤, 튀어나온 피크만 EQ로 깎기(딥은 EQ로 채우지 않음)<br>비율 등급보다 <strong>청취 위치와 코너 흡음</strong>이 체감에 더 큰 경우가 많습니다.' },
  { q: '모드와 부밍·먹먹함의 관계?',
    a: '• <strong>부밍(Boomy)</strong>: 특정 저음(대개 30~150Hz)이 부풀어 &quot;웅~&quot; 울림 — 앉은 자리가 그 모드의 음압 최대점일 때<br>• <strong>딥(Null)</strong>: 반대로 특정 저음이 거의 안 들림 — 앉은 자리가 노드일 때. 볼륨·EQ를 올려도 잘 채워지지 않음<br>• <strong>먹먹함(Muddy)</strong>: 100~300Hz가 답답함 — 모드 중첩 + 가까운 벽의 반사음<br>• <strong>해결 순서</strong>: ① 청취 위치 이동(38% 룰) ② 스피커와 벽 거리 조정 ③ 코너 트랩 ④ 측정 후 피크만 EQ' },
  { q: '측정 마이크 없이 어떻게 확인하나요?',
    a: '정확하지는 않지만 대략 확인할 수 있습니다.<br>1. <strong>이 도구로 모드 주파수 예측</strong> — 어디서 부밍이 날지 미리 파악<br>2. <strong>사인파 톤 재생</strong> — 도구가 표시한 주파수(예: 35·50·70Hz)를 작은 볼륨으로 틀고 방 안을 걸어 다니며 커지고 작아지는 자리를 확인<br>3. <strong>박수 테스트는 저음용이 아닙니다</strong> — 박수는 고음 위주라 평행 벽 사이의 &quot;찡~&quot; 하는 플러터 에코 확인에 쓰고, 저음 모드 판단에는 맞지 않아요<br>4. 제대로 하려면 <strong>USB 측정 마이크(10만원대) + REW(무료 측정 프로그램)</strong>로 주파수 응답을 재는 것이 정석입니다.' },
  { q: '가구·소파가 룸 모드에 영향을 주나요?',
    a: '줍니다. 이 도구는 <strong>벽이 단단한 빈 직사각형 방</strong>을 가정하므로 실제와 차이가 있어요.<br>• <strong>책장·옷장</strong>: 소리 산란 + 일부 흡음<br>• <strong>큰 소파·매트리스</strong>: 중저음 일부 흡수<br>• <strong>두꺼운 러그·커튼</strong>: 주로 중·고음 흡수(저음 모드에는 영향 작음)<br>• <strong>열린 문·창문·주방과 이어진 개방형 거실</strong>: 벽 하나가 사라진 셈이라 해당 축의 모드가 약해지거나 이동<br>• <strong>석고보드 벽</strong>: 저음에서 벽 자체가 떨며 일부 흡수 — 콘크리트 벽보다 모드가 덜 날카로움<br>모든 면이 콘크리트·유리처럼 단단하고 비어 있을수록 계산값에 가깝게 강한 모드가 나타납니다.' },
]

export default function RoomModePage() {
  return (
    <ToolPage width={880} slug="/tools/edu/room-mode">
      <h1 className="tp-h1">
        <ToolIconBadge catId="edu" />룸 모드 계산기
      </h1>
      <p className="tp-lead">
        방 가로·세로·높이로 축방향·접선·사선 모드 + <strong style={{ color: 'var(--text)' }}>슈로더 주파수와 베이스 트랩</strong> 가이드.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="Rayleigh 직사각형 방 모드 공식 · Schroeder 주파수 · 청취실 비율 조건(EBU Tech 3276 · ITU-R BS.1116-3)"
        sources={[
          { label: 'ITU-R BS.1116-3 (청취실 조건)', href: 'https://www.itu.int/rec/R-REC-BS.1116-3-201502-I/en' },
          { label: 'EBU Tech 3276 (청취 조건)', href: 'https://tech.ebu.ch/publications/tech3276' },
        ]}
      />

      <RoomModeClient />

      <GuideDivider />

      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <ol className="g-list">
        <li><strong>방 치수 입력</strong> — 가로 W·세로 L·높이 H (또는 한국 거실 프리셋)</li>
        <li><strong>온도 조정</strong> — 음속에 영향 (20°C → 약 343 m/s)</li>
        <li><strong>모드 분석 탭</strong>에서 룸 모드 목록 + 슈로더 주파수 + 부밍 위험 구간 확인</li>
        <li><strong>평면도 탭</strong>에서 청취자 위치 점수·스피커 배치 가이드(대칭·청취각) 확인</li>
        <li><strong>비율 진단 탭</strong>에서 Walker(Bolt) 영역·Bonello 기준으로 점검 — 참고 지표이며 통과가 좋은 저음을 보장하진 않음</li>
        <li><strong>트랩 탭</strong>에서 방 크기에 맞는 베이스 트랩 권장 수량·비용 확인</li>
      </ol>
      <Callout tone="tip">
        청취자 마커를 드래그(또는 키보드·좌표 입력)해 점수 100점에 가까운 위치를 찾고, 스피커 마커는 좌우 대칭·청취각 60° 가이드로 확인하세요.
        38% 룰 라인은 자동으로 표시됩니다.
      </Callout>

      <h2 className="g-h2">룸 모드란? — 축방향·접선·사선 3종</h2>
      <p className="g-p">
        밀폐된 방 안에서 음파가 평행 벽 사이를 왕복하며 정상파(standing wave)를 만드는 현상입니다.
        정상파가 생기는 주파수에서는 자리에 따라 음압이 부풀거나 거의 사라져 <strong>부밍(boomy)·저음 빠짐(null)·먹먹함(muddy)</strong>의 원인이 됩니다.
        모드는 소리가 몇 개의 면 사이를 오가느냐에 따라 세 종류로 나뉩니다.
      </p>
      <ul className="g-list">
        <li><strong>축방향(Axial)</strong> — 마주 보는 벽 2개 사이(앞뒤·좌우·바닥천장). 가장 강한 모드로, 계산기는 이를 기준 세기 1.0으로 둡니다.</li>
        <li><strong>접선(Tangential)</strong> — 벽 4개를 도는 모드. 진폭 기준 축방향의 약 70%(−3dB).</li>
        <li><strong>사선(Oblique)</strong> — 6개 면을 모두 거치는 모드. 진폭 기준 축방향의 약 50%(−6dB).</li>
      </ul>
      <div style={formulaBox}>
        <strong style={{ color: 'var(--accent-ink)' }}>Rayleigh 공식</strong><br />
        f(p,q,r) = (c/2) × √[(p/L)² + (q/W)² + (r/H)²]<br />
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
          c = 음속(331.3 + 0.606×온도, 20°C ≈ {fmt(C20, 1)} m/s), p·q·r = 0,1,2… (각 축의 모드 차수). 0이 아닌 차수가 1개면 축방향, 2개면 접선, 3개면 사선입니다.
        </span>
      </div>
      <p className="g-p">
        계산기는 20~300Hz 사이에 들어오는 모든 (p,q,r) 조합을 계산해 낮은 순으로 보여 줍니다. 차수는 고정값이 아니라 축마다
        &lsquo;2 × 치수 × 300 ÷ 음속&rsquo;까지 늘려 긴 방에서도 높은 차수의 축방향 모드가 빠지지 않게 했습니다.
        부밍 위험 구간은 <strong>200Hz 이하에서 5Hz 안에 모드가 3개 이상 몰린 곳</strong>, 최대 갭은 200Hz 이하에서 이웃한 모드 사이가 가장 크게 벌어진 구간입니다.
      </p>

      <h2 className="g-h2">계산 예시 — 5.0 × 3.5 × 2.4m 거실</h2>
      <p className="g-p">
        계산기 첫 화면 기본값(세로 {EX.L}m · 가로 {EX.W}m · 높이 {EX.H}m, 20°C)을 그대로 풀어 보면 다음과 같습니다.
        길이 방향 1차 축방향 모드는 {fmt(C20, 1)} ÷ (2 × {EX.L}) ≈ <strong>{fmt(EX_L1)}Hz</strong>, 가로 방향은 <strong>{fmt(EX_W1)}Hz</strong>, 높이 방향은 <strong>{fmt(EX_H1)}Hz</strong>입니다.
        가장 낮은 접선 모드(1,1,0)는 {fmt(EX_T110)}Hz예요.
      </p>
      <p className="g-p">
        눈여겨볼 곳은 70Hz 부근입니다. 길이 방향 2차 모드({fmt(EX_L2)}Hz)와 높이 방향 1차 모드({fmt(EX_H1)}Hz)가
        {' '}{fmt(EX_H1 - EX_L2)}Hz 차이로 붙어 있어, 베이스 기타·킥드럼이 몰리는 이 대역이 자리에 따라 과하게 울릴 수 있습니다.
        길이 ÷ 높이가 {(EX.L / EX.H).toFixed(2)}로 정수 2에 가깝기 때문입니다.
        계산기의 비율 판정은 &lsquo;{EX_DIAG.diagnosis} · {EX_DIAG.label}&rsquo;로 나오지만, 방송 청취실 기준(EBU·ITU)의 &lsquo;정수비 ±5% 회피&rsquo; 조건으로 보면
        {EX_NEAR.length > 0 ? ` ${EX_NEAR.join(', ')}이 걸립니다.` : ' 걸리는 비율이 없습니다.'} 등급 하나만 보지 말고 모드 목록에서 서로 붙은 주파수를 직접 확인하는 이유입니다.
      </p>
      <p className="g-p">
        체적은 {fmt(EX.L * EX.W * EX.H)}m³이고, RT60 0.4초 가정의 슈로더 주파수는 약 <strong>{Math.round(EX_FS)}Hz</strong>입니다(RT60 0.6초면 약 {Math.round(EX_FS06)}Hz).
        즉 이 방에서는 대략 {Math.round(EX_FS)}Hz 아래 저음이 개별 모드의 영향을 강하게 받습니다.
        청취 위치 점수는 38% 지점이 {SCORE_38}점, 방 정중앙(1차 노드)이 {SCORE_50}점, 25% 지점(2차 노드)이 {SCORE_25}점으로 계산됩니다(가로 중앙 기준).
      </p>

      <h2 className="g-h2">한국 거실 프리셋별 룸 모드 한눈에 보기</h2>
      <p className="g-p">
        계산기 프리셋 5종을 20°C·RT60 0.4초로 계산한 값입니다. &lsquo;정수비 ±5%&rsquo; 열은 계산기 판정에는 없는 추가 점검으로,
        EBU Tech 3276과 ITU-R BS.1116-3이 피하라고 권하는 조건(치수 비가 정수배의 ±5% 이내)에 걸리는 비율을 적었습니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>프리셋</th>
              <th scope="col" style={th}>L × W × H (m)</th>
              <th scope="col" style={th}>체적</th>
              <th scope="col" style={th}>1차 축방향 L · W · H</th>
              <th scope="col" style={th}>슈로더</th>
              <th scope="col" style={th}>계산기 비율 판정</th>
              <th scope="col" style={th}>Walker 조건식</th>
              <th scope="col" style={th}>정수비 ±5%</th>
            </tr>
          </thead>
          <tbody>
            {PRESET_ROWS.map((r) => (
              <tr key={r.id} style={rowBorder}>
                <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{r.label}</th>
                <td style={tdNum}>{r.dims}</td>
                <td style={tdNum}>{fmt(r.V)}m³</td>
                <td style={tdNum}>{fmt(r.fL)} · {fmt(r.fW)} · {fmt(r.fH)}Hz</td>
                <td style={{ ...tdNum, color: 'var(--accent-ink)', fontWeight: 700 }}>{Math.round(r.fs)}Hz</td>
                <td style={td}>{r.grade}</td>
                <td style={td}>{r.bolt ? '충족' : '미충족'}</td>
                <td style={{ ...td, color: r.nearInt.length ? 'var(--warning)' : 'var(--muted)' }}>{r.nearInt.length ? r.nearInt.join(', ') : '해당 없음'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        L은 긴 변(세로), W는 짧은 변(가로)입니다. 한국 아파트 천장고(약 2.3~2.4m) 때문에 높이 방향 1차 모드는 어느 평형이든 70Hz대에 놓이고,
        방이 클수록 길이 방향 모드가 낮아지며 슈로더 주파수도 내려갑니다.
      </p>

      <h2 className="g-h2">슈로더 주파수와 모드 지배 영역</h2>
      <p className="g-p">
        <strong>슈로더 주파수(Schroeder Frequency)</strong>는 개별 룸 모드가 소리를 좌우하는 영역과, 모드가 촘촘히 겹쳐 방 전체가 고르게 반응하는 영역의 경계입니다.
        이 주파수 아래에서는 앉는 자리 몇십 cm 차이로 저음 크기가 크게 달라지므로 <strong>청취 위치 조정과 베이스 트랩이 가장 효과적</strong>이고,
        위에서는 흡음·확산 패널로 반사음을 다루는 일반적인 방법이 통합니다.
      </p>
      <div style={formulaBox}>
        fs = 2000 × √(RT60 / V)<br />
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>RT60 = 잔향시간(초, 일반 거실 약 0.4초), V = 방 체적(m³)</span>
      </div>
      <ul className="g-list">
        <li><strong>일반 거실(40~50m³)</strong>: 약 180~200Hz</li>
        <li><strong>홈스튜디오(30~40m³)</strong>: 약 200~230Hz</li>
        <li><strong>작은 방(20~30m³)</strong>: 약 230~280Hz</li>
      </ul>
      <p className="g-p">
        작은 방일수록 슈로더 주파수가 높아 모드 문제가 넓은 대역에 걸칩니다. 원룸이나 작은 방에 큰 우퍼를 두면 저음이 오히려 불균일해지는 이유입니다.
      </p>

      <h2 className="g-h2">38% 룰 — 청취자·스피커 위치</h2>
      <p className="g-p">
        스튜디오 디자이너 <strong>Wes Lachot</strong>이 널리 알린 청취 위치 가이드라인입니다.
        청취자를 방 길이의 <strong>38% 위치(앞 벽에서)</strong>에 두면 1차 모드 노드(50%)·2차 모드 노드(25%)와 벽·중앙의 음압 최대점을 모두 비켜 가
        저음 피크·딥이 절충됩니다. 엄격한 법칙이 아니라 방 정중앙(50%)을 벗어나기 위한 <strong>출발점</strong>으로 쓰는 것이 맞습니다.
      </p>
      <ul className="g-list">
        <li>청취자 = 방 길이의 38%(앞 벽 기준) — 예: 5m 방이면 앞 벽에서 1.9m</li>
        <li>스피커 ↔ 청취자 = 정삼각형(청취각 60°)이 표준 출발점</li>
        <li>좌우 스피커의 측벽 거리는 서로 같게 — 대칭이 원칙</li>
        <li>스피커를 벽에서 0.5~1m 띄우면 약 86~172Hz에 1/4파장 상쇄 딥이 생길 수 있음(f = c ÷ (4 × 벽 거리)) — 벽에 가깝게 붙이거나 충분히 띄운 뒤 청감·측정으로 조정</li>
      </ul>

      <h2 className="g-h2">방 비율은 어떻게 판정하나요?</h2>
      <p className="g-p">
        비율 진단 탭은 세 가지 기준을 함께 보여 줍니다. 첫째, <strong>Walker 조건식</strong>(Bolt 곡선 영역의 근사)입니다.
        긴 변 l, 짧은 변 w, 높이 h에 대해 <strong>1.1 × (w/h) ≤ l/h ≤ 4.5 × (w/h) − 4</strong>이고 l/h·w/h가 모두 3 미만이면 영역 안입니다.
        EBU Tech 3276과 ITU-R BS.1116-3이 표준 청취실 조건으로 채택한 식입니다.
      </p>
      <p className="g-p">
        둘째, <strong>Bonello 기준</strong>입니다. 20~200Hz를 1/3 옥타브 대역으로 나눠 각 대역의 모드 개수를 세고,
        위 대역으로 갈수록 개수가 줄지 않는지, 같은 주파수에 겹친 모드가 있는 대역은 모드가 5개 이상인지 확인합니다.
        셋째, 계산기 자체 등급(S~D)은 방 비율을 가장 짧은 변 기준으로 정규화한 뒤 Sepmeyer A·B·C, Louden 권장 비율 중 가장 가까운 것과의 거리로 매깁니다.
        두 변 길이 비가 0.05 이내로 같으면 거리와 관계없이 &lsquo;두 축 동일&rsquo;, 세 변이 모두 같으면 &lsquo;정육면체 위험&rsquo;으로 먼저 분류합니다.
      </p>
      <Callout tone="note" title="판정은 참고 지표입니다">
        세 기준 모두 &lsquo;모드가 고르게 퍼질 가능성&rsquo;을 보는 간접 지표입니다. 위 예시처럼 등급이 좋아도 특정 두 모드가 붙어 있을 수 있고,
        반대로 등급이 낮아도 청취 위치와 코너 흡음으로 충분히 좋은 저음을 얻을 수 있습니다.
      </Callout>

      <h2 className="g-h2">베이스 트랩 — 종류와 설치 위치</h2>
      <p className="g-p">
        베이스 트랩은 <strong>저주파 음압이 가장 높은 코너와 벽면</strong>에 두어 모드의 에너지를 흡수하는 음향 처리재입니다.
        모든 축방향 모드는 벽에서 음압이 최대이고, 세 면이 만나는 코너에는 여러 모드의 최대점이 겹치므로 같은 흡음재라도 코너에 둘 때 효과가 큽니다.
        아래 표는 계산기 트랩 탭과 같은 데이터이며, 가격은 흔한 시중가 범위의 어림값입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>종류</th>
              <th scope="col" style={th}>효과 시작 대략</th>
              <th scope="col" style={th}>두께</th>
              <th scope="col" style={th}>설치 위치</th>
              <th scope="col" style={th}>가격 어림</th>
            </tr>
          </thead>
          <tbody>
            {TRAPS.map((t) => (
              <tr key={t.id} style={rowBorder}>
                <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left' }}>{t.label}</th>
                <td style={tdNum}>{t.effectiveFrom}Hz~</td>
                <td style={tdNum}>{t.thicknessMm}</td>
                <td style={td}>{t.position}</td>
                <td style={td}>{t.diyPrice} / {t.proPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p">
        다공성 흡음재(글라스울·미네랄울)는 두꺼울수록, 벽에서 띄울수록 낮은 주파수까지 흡수합니다. 멤브레인·헬름홀츠 방식은 특정 대역만 노리는 대신
        설계가 틀리면 효과가 없으므로, 먼저 측정으로 문제 주파수를 확인한 뒤 쓰는 것이 순서입니다.
      </p>

      <h2 className="g-h2">계산의 한계와 전문가가 필요한 경우</h2>
      <p className="g-p">
        이 계산은 <strong>벽이 완전히 단단하고 비어 있는 직사각형 방</strong>을 전제로 합니다. 실제 아파트 거실은 주방·복도로 한쪽이 트여 있고,
        석고보드 벽은 저음에서 함께 떨며 에너지를 흡수하고, 가구가 공간을 나눕니다. 그래서 실측 주파수는 계산값에서 몇 Hz씩 어긋나고,
        개방된 방향의 모드는 약해지거나 사라지기도 합니다. 계산기는 &lsquo;어느 대역을 의심해야 하는지&rsquo;를 알려 주는 출발점이고, 최종 판단은 측정입니다.
      </p>
      <p className="g-p">
        벽체를 새로 세우는 홈스튜디오·전용 청취실 시공, 이웃에게 저음이 새는 차음 문제, 수백만 원 단위의 음향재 구매를 앞두고 있다면
        측정 장비를 갖춘 음향 설계 전문가에게 현장 측정을 맡기는 편이 결과적으로 비용을 줄입니다. 차음(소리가 밖으로 새지 않게 하기)은 흡음과 전혀 다른 문제라
        베이스 트랩으로는 해결되지 않는다는 점도 기억해 두세요.
      </p>

      <Faq items={FAQ_LD} />

      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/edu/sound-speed" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔊</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>음속 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            천둥·번개 거리·반향·RT60
          </p>
        </Link>
        <Link href="/tools/interior/lighting" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>💡</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>조명 밝기 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            공간별 권장 루멘
          </p>
        </Link>
        <Link href="/tools/interior/wire" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>⚡</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>전선 굵기·허용전류</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            홈오디오 전원·앰프 회로
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
