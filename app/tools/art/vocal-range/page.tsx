import Link from 'next/link'
import VocalRangeClient from './VocalRangeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'
import Callout from '@/components/Callout'
import { midiToNote, noteNameToMidi } from './noteUtils'
import { VOCAL_RANGES, KOREAN_SONGS, classifyVocalRange, matchSongs } from './vocalData'

export const metadata = buildMetadata({
  path: '/tools/art/vocal-range',
  title: '음역대 측정기 — 실시간 음정 감지·최저음·최고음 자동 측정',
  description:
    '마이크로 실시간 음정 감지로 내 최저·최고음 자동 측정 + 한국 노래 30+곡 키 매칭으로 노래방 선곡까지.',
  keywords: [
    '음역대 측정', '보컬 음역', '음정 테스트', '최고음 측정',
    '베이스 바리톤 테너', '소프라노 알토', '보컬 트레이닝',
    '노래방 키 추천', '내 음역대', '음정 감지', 'pitch detection',
  ],
})

const FAQ_LD = [
              {
                q: '본 도구의 정확도는 어느 정도인가요?',
                a: '<strong>참고용·재미용 도구</strong>입니다. ±2~3반음 정도의 오차가 있을 수 있으며, 마이크 품질·주변 소음·발성 안정성에 크게 영향을 받습니다. 정확한 음역대 평가는 보컬 트레이너의 청각 평가와 전문 장비(예: VoceVista) 측정을 권장합니다. 본 도구는 트레이닝 효과를 <strong>상대적으로 추적</strong>(같은 환경에서 반복 측정)하는 데 더 유용합니다.',
              },
              {
                q: '마이크 권한이 안 잡혀요.',
                a: '브라우저별 확인 — <strong>Chrome/Edge</strong>: 주소창 왼쪽 사이트 정보 아이콘 → 마이크 [허용] / <strong>Safari(Mac)</strong>: Safari 설정 → 웹 사이트 → 마이크에서 이 사이트를 허용으로, 그래도 안 되면 macOS 시스템 설정 → 사운드 → 입력에서 사용할 마이크가 선택돼 있고 말할 때 입력 레벨이 움직이는지 확인 / <strong>iPhone·iPad</strong>: 설정의 Safari 항목에서 마이크 접근을 확인 또는 허용으로 / <strong>Firefox</strong>: 주소창 마이크 아이콘 클릭. 권한 거부 후 다시 허용 시에는 페이지를 새로고침해야 합니다. 브라우저는 <strong>보안 연결(HTTPS)</strong> 페이지에서만 마이크 접근을 허용합니다(개발용 localhost는 예외).',
              },
              {
                q: '진성과 가성의 차이는?',
                a: '<strong>진성(흉성)</strong>은 성대 전체가 진동하는 발성으로 가슴에서 울림이 느껴지며 굵고 안정적인 소리가 납니다. <strong>가성(falsetto)</strong>은 성대 가장자리만 진동하는 가볍고 부드러운 발성입니다. 흔히 &lsquo;두성&rsquo;과 섞어 부르지만 엄밀히는 다른 개념으로, 두성(head voice)은 진성 계열 발성이 머리 쪽 울림으로 느껴지는 상태를 가리키는 표현에 가깝습니다. 본 도구는 두 발성의 자동 구분이 어려우므로 <strong>측정 단계를 분리</strong>해 사용자가 직접 진성·가성 최고음을 따로 기록합니다.',
              },
              {
                q: '측정 결과가 매번 다른 이유?',
                a: '여러 요인이 있습니다 — ① <strong>워밍업 상태</strong>(아침 vs 저녁), ② <strong>발성 안정성</strong>(긴장·피로), ③ <strong>마이크 위치·환경 소음</strong>, ④ <strong>측정 알고리즘 한계</strong>(±2~3반음). 같은 환경·같은 시간대(예: 매일 저녁 워밍업 후)에 반복 측정하면 변화 추적이 더 정확합니다.',
              },
              {
                q: '음역대를 정말 늘릴 수 있나요?',
                a: '<strong>네, 넓어질 수 있습니다.</strong> 다만 "몇 개월이면 몇 반음"을 보장하는 연구는 없습니다. 훈련된 가창자와 비훈련자를 비교한 문헌에서는 <strong>고음역 쪽 차이가 크고 최저음 차이는 가장 작게</strong> 나타납니다 — 집단 간 비교일 뿐 개인의 확장 속도를 뜻하지 않습니다. ① 유전·신체적 한계 존재, ② 무리한 훈련은 성대 손상 위험, ③ 본 도구의 오차가 ±2~3반음이므로 소폭 변화는 오차와 구분되지 않습니다 — 같은 환경에서 반복 측정한 추세로만 판단하세요.',
              },
              {
                q: '내 음성 데이터가 서버로 전송되나요?',
                a: '<strong>아니요, 절대 전송되지 않습니다.</strong> 모든 마이크 입력은 브라우저 내 Web Audio API + pitchy 라이브러리로 처리되며, 주파수·MIDI 값만 추출됩니다. 측정 기록도 사용자 브라우저 localStorage에만 저장되며 서버에 전송되지 않습니다. 마이크 권한은 [정지] 버튼으로 즉시 해제할 수 있습니다.',
              },
              {
                q: '노래방에서 키 +1, -1은 무엇을 의미하나요?',
                a: '노래방 키 ±1은 <strong>1반음(semitone)</strong>을 의미합니다. +1 = 반음 올림(C → C#), -1 = 반음 내림(C → B). 반음 12개가 한 옥타브라서 키 +12는 한 옥타브 위와 같습니다. 본 도구의 [노래 매칭]은 ±6 키 범위에서 곡의 최저·최고음이 모두 내 음역 안에 들어오는 <strong>가장 작은 키 변경</strong>을 찾습니다. 일반적으로 ±1~2 키 조정은 자연스럽지만 ±5 이상은 곡 분위기가 크게 달라질 수 있습니다.',
              },
            ]

/* ── 가이드 표 — 도구의 noteUtils·vocalData로 빌드 시 계산(손으로 적은 숫자 아님) ── */
const hz = (f: number) => (f >= 100 ? Math.round(f).toLocaleString('ko-KR') : f.toFixed(1))
const RANGE_ROWS = VOCAL_RANGES.map((r) => {
  const lo = midiToNote(r.midiLow)
  const hi = midiToNote(r.midiHigh)
  return { name: r.name, en: r.shortName, gender: r.gender, intl: `${r.low}~${r.high}`, kr: `${lo.korean} ~ ${hi.korean}`, hz: `${hz(lo.frequency)}~${hz(hi.frequency)}Hz` }
})
const REF_NOTES: { note: string; memo: string }[] = [
  { note: 'E2', memo: '베이스 음역 하한으로 흔히 드는 음' },
  { note: 'A2', memo: '이 도구의 곡 데이터에서 남성 곡 최저음으로 가장 많은 음' },
  { note: 'C4', memo: '가온 도(피아노 가운데 도)' },
  { note: 'A4', memo: '표준 음높이 440Hz · 남성 고음 기준으로 자주 쓰는 “2옥타브 라”' },
  { note: 'C5', memo: '남성 고음의 대표 기준 “3옥타브 도”' },
  { note: 'G5', memo: '소찬휘 「Tears」 최고음 “3옥타브 솔”' },
  { note: 'C6', memo: '소프라노 음역 상한으로 흔히 드는 음' },
]
const REF_ROWS = REF_NOTES.map(({ note, memo }) => {
  const n = midiToNote(noteNameToMidi(note))
  return { intl: n.name, kr: n.korean, midi: n.midi, hz: n.frequency.toFixed(2), memo }
})
const EXAMPLES = [
  { label: '예시 ① A2 ~ A4', low: 'A2', high: 'A4' },
  { label: '예시 ② A3 ~ E5', low: 'A3', high: 'E5' },
].map((ex) => {
  const lo = noteNameToMidi(ex.low)
  const hi = noteNameToMidi(ex.high)
  const male = classifyVocalRange(lo, hi, 'male')
  const female = classifyVocalRange(lo, hi, 'female')
  const songs = matchSongs(lo, hi, KOREAN_SONGS.length)  // 곡 수는 데이터 전체를 센다
  const screen = matchSongs(lo, hi)  // 도구 화면과 같은 호출(기본 상위 12곡)
  const shifted = songs.filter((m) => m.bestKeyShift !== 0)
  return {
    ...ex,
    semis: hi - lo,
    krLow: midiToNote(lo).korean,
    krHigh: midiToNote(hi).korean,
    male: male?.name ?? '—',
    female: female?.name ?? '—',
    fitCount: songs.filter((m) => m.bestKeyShift === 0).length,
    firstSongs: songs.filter((m) => m.bestKeyShift === 0).slice(0, 3).map((m) => `${m.title}(${m.lowest}~${m.highest})`).join(', '),
    shifted: shifted.slice(0, 2).map((m) => `${m.title}(${m.lowest}~${m.highest}) 키 ${m.bestKeyShift > 0 ? '+' : ''}${m.bestKeyShift}`).join(', '),
    /* 원키 곡이 화면 한도(12곡)를 채우면 키 조정 곡은 화면 목록에 나오지 않는다 */
    shiftedHidden: shifted.length > 0 && !screen.some((m) => m.bestKeyShift !== 0),
    screenLimit: screen.length,
  }
})

export default function VocalRangePage() {
  return (
    <ToolPage width={760} slug="/tools/art/vocal-range">
      <h1 className="tp-h1">
        <ToolIconBadge catId="art" />음역대 측정기
      </h1>
      <p className="tp-lead">
        마이크로 실시간 음정 감지로 내 <strong style={{ color: 'var(--text)' }}>최저·최고음 측정</strong> + 한국 노래 30+곡 키 매칭.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="음이름↔주파수 = 12평균율·A4 440Hz(ISO 16) · MIDI = 69 + 12·log₂(f/440) · 옥타브는 국제 표기(C4 = 가운데 도)와 한국 대중음악 관행(국제 옥타브 − 2)을 병기 · 성부 음역은 교재 관행값이라 자료마다 1~2음 차이"
        sources={[
          { label: 'ISO 16:1975 표준 음높이(A = 440Hz)', href: 'https://www.iso.org/standard/3601.html' },
          { label: 'MDN — getUserMedia(보안 컨텍스트 필요)', href: 'https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia' },
          { label: 'NIDCD — Taking Care of Your Voice', href: 'https://www.nidcd.nih.gov/health/taking-care-your-voice' },
        ]}
      />

      <VocalRangeClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 보컬 음역대란 */}
        <section>
          <h2 className="g-h2">보컬 음역대란?</h2>
          <p className="g-p">
            <strong style={{ color: 'var(--text)' }}>안정적으로 낼 수 있는 가장 낮은 음 ~ 가장 높은 음의 범위</strong>를 의미합니다. 보통 <strong>진성(흉성) 음역</strong>과 <strong>가성 음역</strong>으로 나뉘며, 본 도구는 둘을 분리해 측정할 수 있습니다.
          </p>
          <p className="g-p">
            노래에 실제로 쓰는 음역은 흔히 1.5~2옥타브(18~24반음)로 이야기되며, 훈련받은 성악가·가수에게서는 3옥타브를 넘는 측정치도 보고됩니다. 다만 이는 훈련 집단에서 관측된 값이지 훈련하면 누구나 도달한다는 보장이 아니며, 가성 포함 여부에 따라서도 크게 달라집니다.
          </p>
        </section>

        {/* 2. 음역대 분류 */}
        <section>
          <h2 className="g-h2">음역대 8단계 분류</h2>
          <p className="g-p">
            도구가 결과를 분류할 때 쓰는 기준표입니다. 국제 표기와 한국식 표기, 주파수는 도구의 변환 함수로 계산한 값이라 측정 화면에 나오는 표기와 같습니다.
            분류는 <strong>측정한 최저음과 최고음의 가운데 음</strong>을 각 성부 음역의 가운데 음과 비교해 가장 가까운 것을 고르는 간이 방식이며, 측정 폭이 5반음 미만이면 분류를 보류합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>분류</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>국제 표기</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>한국식 표기</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>주파수</th>
                </tr>
              </thead>
              <tbody>
                {RANGE_ROWS.map((row, i) => (
                  <tr key={row.en} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row.gender === 'male' ? '남성' : '여성'} · {row.name} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({row.en})</span></td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--purple-600)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{row.intl}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row.kr}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{row.hz}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 위 분류는 클래식 성악 교재의 관행 범위를 따른 것이며, 바리톤을 A2~A4로 잡는 교재가 있는 등 경계는 자료마다 1~2음씩 다릅니다. 대중가수에게는 공인된 성부 분류가 없어,
            측정 결과 화면에 함께 나오는 가수 예시는 음색·음역 관행에 따른 참고용 추정입니다. 같은 가수도 곡에 따라 전혀 다른 음역을 씁니다.
          </p>
        </section>

        {/* 2b. 옥타브 표기 */}
        <section>
          <h2 className="g-h2">&lsquo;3옥타브 솔&rsquo;은 어느 음일까 — 옥타브 표기 두 가지</h2>
          <p className="g-p">
            튜너 앱·악보 프로그램은 피아노 가운데 도를 <strong>C4</strong>로 부르는 국제 표기(과학적 음높이 표기)를 씁니다. 반면 한국 보컬 커뮤니티에서 말하는 &lsquo;2옥타브 라&rsquo;·&lsquo;3옥타브 도&rsquo;는
            이보다 <strong>옥타브 숫자가 2 작은</strong> 관행 표기라서, 국제 표기 A4가 &lsquo;2옥타브 라&rsquo;, C5가 &lsquo;3옥타브 도&rsquo;가 됩니다. 도구는 두 표기를 함께 보여 주며, 둘을 섞어 읽으면 한 옥타브 이상 착각하기 쉽습니다.
            주파수는 A4 = 440Hz를 기준으로 반음마다 2의 12제곱근(약 1.0595)배씩 올라가므로, 한 옥타브(12반음) 위는 정확히 2배입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>국제 표기</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>한국식 표기</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>MIDI</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>주파수(Hz)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>참고</th>
                </tr>
              </thead>
              <tbody>
                {REF_ROWS.map((r, i) => (
                  <tr key={r.intl} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{r.intl}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.kr}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{r.midi}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.hz}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.memo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 작동 원리 */}
        <section>
          <h2 className="g-h2">본 도구의 작동 원리</h2>
          <ul className="g-list">
            <li><strong>마이크 입력</strong> — Web Audio API로 파형 데이터를 2,048샘플 단위로 읽습니다. 샘플레이트는 기기 기본값(대개 44.1kHz 또는 48kHz)을 따르며, 음정이 왜곡되지 않도록 브라우저의 에코 제거·잡음 억제·자동 음량 조절은 끄고 받습니다.</li>
            <li><strong>피치 감지</strong> — pitchy 라이브러리(McLeod Pitch Method)가 한 구간의 기본 주파수와 신뢰도(clarity)를 계산합니다.</li>
            <li><strong>MIDI 변환</strong> — MIDI = 69 + 12 × log₂(주파수 ÷ 440). A4(440Hz)가 69, 가운데 도(C4)가 60이고 1 차이가 반음 하나입니다.</li>
            <li><strong>품질 필터</strong> — 소리 크기(RMS) 0.01 미만, 신뢰도 85% 미만, 70~2,200Hz 밖의 값은 버립니다. 숨소리·배경 소음이 음정으로 잡히는 것을 막기 위한 장치입니다.</li>
            <li><strong>안정 음 감지</strong> — 0.5초 이상, 평균에서 0.7반음 이내로 유지된 음만 기록하고, 0.25초 넘게 끊기면 다른 발성으로 나눕니다. 스치듯 지나간 음이나 글리산도는 최저·최고음에 들어가지 않습니다.</li>
            <li><strong>음역 분류</strong> — 측정한 최저·최고음의 가운데 음과 가장 가까운 성부를 고르는 간이 분류입니다. 성별을 고르면 해당 성별 분류로 좁히고, 고르지 않으면 남녀 기준을 함께 표시합니다.</li>
          </ul>
        </section>

        {/* 4. 정확도 한계 */}
        <section>
          <h2 className="g-h2">측정 정확도 한계 (중요)</h2>
          <p className="g-p">
            마이크 기반 음정 측정은 조건에 따라 결과가 쉽게 달라집니다. 아래 요인을 줄일수록 같은 사람의 측정값이 안정되고, 기록 탭의 추세를 믿을 수 있게 됩니다.
          </p>
          <Callout tone="warn" title="본 도구의 정확도 한계">
            <ul>
              <li><strong>마이크 품질</strong> 영향 큼 — 대체로 외장 마이크가 노트북·휴대폰 내장 마이크보다 안정적</li>
              <li><strong>주변 소음</strong> — 반주·말소리·에어컨 소리는 측정값을 흔듭니다</li>
              <li><strong>비브라토·떨림</strong> — 0.7반음 넘게 흔들리면 안정 음으로 인정되지 않아 음역이 좁게 측정될 수 있음</li>
              <li><strong>진성/가성 자동 구분 불가</strong> — 측정 단계를 나눠 사용자가 직접 구분</li>
              <li><strong>±2~3반음 오차 가능</strong> — 정확한 평가는 보컬 트레이너 권장</li>
            </ul>
          </Callout>
        </section>

        {/* 5. 한국 노래 키 매칭 */}
        <section>
          <h2 className="g-h2">한국 노래 키 매칭 — 결과 읽는 법</h2>
          <p className="g-p">
            도구는 한국 인기곡 <strong>30곡 이상</strong>의 최저·최고음 데이터를 갖고 있습니다. 곡의 최저음과 최고음이 모두 내 음역 안에 들어오면 원키로 부를 수 있는 곡으로 보고,
            그렇지 않으면 키를 0에서 ±6까지 한 칸씩 옮겨 가며 <strong>들어맞는 가장 작은 키 변경</strong>을 찾습니다. 점수는 원키 100점에서 키 1칸마다 10점씩 깎고, 화면에는 점수가 높은 순으로 최대 12곡을 보여 줍니다.
          </p>
          <ul className="g-list">
            <li><strong style={{ color: 'var(--emerald-600)' }}>원키</strong> — 키 변경 없이 부를 수 있는 곡</li>
            <li><strong style={{ color: 'var(--yellow-700)' }}>±1~2 키</strong> — 살짝 조정으로 안정적</li>
            <li><strong style={{ color: 'var(--orange-600)' }}>±3~6 키</strong> — 큰 폭 조정 필요 (편곡 분위기가 달라짐)</li>
          </ul>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>측정 음역</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>폭</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>분류 (남성 / 여성 기준)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>매칭 결과 일부</th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map((ex, i) => (
                  <tr key={ex.label} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{ex.label}<br /><span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 12 }}>{ex.krLow} ~ {ex.krHigh}</span></td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{ex.semis}반음</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{ex.male} / {ex.female}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>
                      원키 {ex.fitCount}곡(데이터 {KOREAN_SONGS.length}곡 중): {ex.firstSongs}{ex.fitCount > 3 ? ' 등' : ''}
                      {ex.shifted && <><br />키 조정: {ex.shifted}</>}
                      {ex.shiftedHidden && <><br />(원키 곡이 {ex.screenLimit}곡을 넘어 도구 화면에는 점수 상위 {ex.screenLimit}곡, 곧 원키 곡만 보이고 키 조정 곡은 나오지 않습니다)</>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            키 +3은 곡 전체를 반음 3개 올린다는 뜻입니다. 예를 들어 최저음 F♯3·최고음 A4인 곡을 키 +3으로 부르면 A3~C5가 되어 예시 ②의 음역 안에 들어옵니다.
            다만 이 매칭은 <strong>최저·최고음만 비교</strong>한 결과라, 고음이 한 번 스치는 곡과 후렴 내내 고음을 버티는 곡을 구분하지 못합니다. 실제 난이도는 멜로디 도약·리듬·발성 기교에 따라 더 어려울 수 있고,
            곡 데이터도 음원 버전·라이브 키에 따라 달라질 수 있는 참고값입니다.
          </p>
        </section>

        {/* 6. 보컬 트레이닝 효과 추적 */}
        <section>
          <h2 className="g-h2">보컬 트레이닝 효과 추적</h2>
          <p className="g-p">
            <strong>측정 기록 탭에서 이 브라우저의 localStorage에 최대 30회</strong> 저장됩니다 (서버 전송 없음). 주간·월간 변화를 추적하면 트레이닝 효과를 확인할 수 있는데,
            도구 오차(±2~3반음)보다 작은 변화는 우연과 구분되지 않으므로 <strong>같은 마이크·같은 방·같은 시간대(워밍업 후)</strong>에 여러 번 잰 추세로 판단하세요.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            {[
              { name: '최저음', desc: '복부 호흡·후두 안정 훈련 영역. 문헌상 훈련 여부에 따른 차이가 가장 작은 영역입니다' },
              { name: '최고음', desc: '두성·믹스 보이스 훈련 영역. 훈련·비훈련 집단 차이가 가장 크게 관측되는 영역입니다' },
              { name: '안정 음역', desc: '워밍업·발성 안정성 향상으로 흔들림 감소' },
              { name: '가성 최고음', desc: '두성 발성 훈련 영역. 변화 폭은 개인차가 커 일반적 수치를 제시하기 어렵습니다' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-s)', padding: '12px 14px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{m.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 음역대 늘리기 일반 정보 */}
        <section>
          <h2 className="g-h2">음역대 늘리기 — 일반 정보</h2>
          <ul className="g-list">
            <li><strong>워밍업 5~10분</strong> — 립트릴·립버즈로 성대 풀기</li>
            <li><strong>가장자리 음역 천천히 도전</strong> — 매일 조금씩, 무리하지 않기</li>
            <li><strong>복부 호흡(횡격막 호흡)</strong> — 안정적 발성 기초</li>
            <li><strong>믹스 보이스 훈련</strong> — 진성·가성 연결 (전문가 지도 권장)</li>
          </ul>
          <Callout tone="warn" title="금기 — 무리한 고음·소리 지르기">
            성대 결절·출혈 위험이 있습니다. 본 도구는 일반 정보만 제공합니다. 통증·쉰 목소리·발성 이상이 있으면 즉시 중단하고 이비인후과·보컬 트레이너 상담을 권장합니다.
          </Callout>
        </section>

        {/* 8. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 면책 강화 */}
        <section>
          <Disclaimer
            variant="medical"
            open
            sources={[
              { label: 'NIDCD — Taking Care of Your Voice (음성 건강 지침)', href: 'https://www.nidcd.nih.gov/health/taking-care-your-voice' },
              { label: 'pitchy — McLeod Pitch Method 구현 (피치 감지 라이브러리)', href: 'https://github.com/ianprime0509/pitchy' },
            ]}
          >
            본 도구는 <strong>마이크 입력 기반 추정 도구</strong>이며 정확한 음역대 측정·평가 도구가 아닙니다. 보컬 트레이너의 청각 평가·전문 장비를 권장합니다.
            <br />
            <strong>안전 주의</strong> — 무리한 고음·소리 지르기는 성대 결절·출혈 위험이 있습니다. 통증·쉰 목소리·발성 이상이 지속되면 즉시 중단하고 이비인후과 진료를 받으세요.
          </Disclaimer>
        </section>

        {/* 함께 쓰면 좋은 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/art/frequency', icon: '🎵', name: '주파수↔음정 변환기',  desc: 'Hz ↔ 음정·MIDI 번호' },
              { href: '/tools/art/capo',      icon: '🎸', name: '기타 카포 계산기',     desc: '카포 위치·키 변경' },
              { href: '/tools/art/chord',     icon: '🎼', name: '코드 구성음',         desc: '코드별 음정 표시' },
              { href: '/tools/art/scale',     icon: '🎹', name: '스케일 음계 계산기',  desc: '키별 음계·모드 확인' },
              { href: '/tools/art/tap-tempo', icon: '🥁', name: '탭 템포',             desc: 'BPM 즉시 측정' },
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
