/* 상황별 가이드 — 악기·작곡. 음 이름·주파수·한국식 옥타브 표기는 음역대 측정기의 noteUtils(A4 = 440Hz 평균율),
   딜레이 ms는 탭 템포의 delayUtils로 빌드 시 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { midiToFrequency, midiToNote, noteNameToMidi } from '@/app/tools/art/vocal-range/noteUtils'
import { VOCAL_RANGES } from '@/app/tools/art/vocal-range/vocalData'
import { calcDelay, rawDelay } from '@/app/tools/art/tap-tempo/delayUtils'
import { noteName } from '@/app/tools/art/scale/scaleUtils'
import { GuideSources, num, pct, type CollectionGuide } from './shared'

const REF_NOTES = ['E2', 'A2', 'C4', 'A4', 'C5', 'G5']
const BPM = 120
/** 카포 예시 — 원곡 키 B♭(10), 편한 코드 모양 G(7) */
const SONG_KEY = 10
const SHAPE_KEY = 7

function Body() {
  const refs = REF_NOTES.map((n) => midiToNote(noteNameToMidi(n)))
  const semitone = Math.pow(2, 1 / 12)
  const capo = (SONG_KEY - SHAPE_KEY + 12) % 12
  const tenor = VOCAL_RANGES.find((v) => v.id === 'tenor')
  const quarter = calcDelay(BPM, 1)
  const eighth = calcDelay(BPM, 0.5)
  const dottedEighth = Math.round(rawDelay(BPM, 0.5) * 1.5)
  const a4 = midiToFrequency(69)

  return (
    <>
      <h2>왜 음역 → 코드·키 → 박자 순서인가</h2>
      <p>
        노래를 부르거나 반주를 붙일 때 가장 먼저 부딪히는 문제는 &lsquo;이 키가 내 목소리에 맞는가&rsquo;입니다. 음역을 모르면 코드를 다 외워도 키를 정할 수 없고, 키가 정해져야 코드 모양과 카포 위치가 결정됩니다.
        그래서 <Link href="/tools/art/vocal-range">음역대 측정</Link>으로 편하게 낼 수 있는 가장 낮은 음과 높은 음을 확인하고, <Link href="/tools/art/chord">코드</Link>·<Link href="/tools/art/scale">스케일</Link>·
        <Link href="/tools/art/capo">카포 계산기</Link>로 키를 옮긴 뒤, 마지막으로 <Link href="/tools/art/tap-tempo">탭 템포</Link>로 박자와 이펙트 시간을 맞춥니다.
      </p>
      <p>
        모든 계산의 기준은 A4 = {num(a4)}Hz와 평균율입니다. 반음 하나는 주파수를 약 {num(semitone, 4)}배({pct(semitone - 1, 1)}) 바꾸고, 12반음(한 옥타브)이면 정확히 2배가 됩니다.
        그래서 <Link href="/tools/art/frequency">주파수 계산기</Link>로 조율기나 오디오 편집기에 뜬 Hz 값을 음 이름으로 바꿀 수 있습니다.
      </p>

      <h2>기준이 되는 음과 표기</h2>
      <DataFigure n={1} title="국제 표기·한국식 옥타브 표기·주파수" unit="A4 = 440Hz 평균율" source={<>계산: f = 440 × 2^((MIDI − 69) ÷ 12) — 음역대 측정기와 같은 식. 한국식 표기는 국내 보컬 커뮤니티 관행(과학 옥타브 − 2)</>}>
        <table>
          <thead>
            <tr><th scope="col">국제 표기</th><th scope="col">한국식</th><th scope="col" className="r">주파수</th></tr>
          </thead>
          <tbody>
            {refs.map((r) => (
              <tr key={r.name}><td>{r.name}</td><td>{r.korean}</td><td className="r">{num(r.frequency, 1)}Hz</td></tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        &lsquo;3옥타브 솔&rsquo;, &lsquo;2옥타브 라&rsquo; 같은 한국식 표기는 과학적 표기(C4 = 가운데 도)와 옥타브 숫자가 2만큼 다릅니다. 남성 고음의 기준처럼 쓰이는 A4는 한국식으로 {midiToNote(69).korean}입니다.
        {tenor ? ` 음역대 측정기의 분류에서 테너는 ${tenor.low}~${tenor.high} 정도를 기준으로 삼습니다.` : ''} 곡의 최고음이 내 편한 최고음보다 높다면 키를 내리면 되는데, 몇 반음을 내릴지는 두 음의 차이로 바로 나옵니다.
      </p>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>원곡 키를 그대로 치려고 어려운 코드를 외우기.</strong> 원곡이 {noteName(SONG_KEY, 'flat')} 키라면 {noteName(SHAPE_KEY)} 코드 모양으로 카포 {capo}프렛에 두고 치면 같은 음높이가 납니다. 카포가 너무 높아지면 소리가 얇아지니, 그럴 땐 다른 코드 모양을 고르세요.</li>
        <li><strong>옥타브 표기를 섞어 쓰기.</strong> 악보·조율 앱은 국제 표기, 보컬 커뮤니티는 한국식 표기를 쓰는 경우가 많습니다. 같은 음을 두 옥타브 차이로 착각하면 연습 목표가 크게 어긋납니다.</li>
        <li><strong>딜레이를 귀로만 맞추기.</strong> {BPM}BPM에서 4분음표는 {quarter}ms, 8분음표는 {eighth}ms, 점8분음표는 {dottedEighth}ms입니다. 템포에 맞춘 값에서 시작하면 반주와 메아리가 엇갈리지 않습니다.</li>
        <li><strong>탭 몇 번으로 템포를 확정하기.</strong> 사람이 두드리는 간격은 흔들리므로 여러 마디를 두드려 평균을 보고, 곡 중간에 템포가 바뀌는지도 확인하세요.</li>
      </ul>

      <Callout tone="note" title="음역 측정 결과를 볼 때">
        마이크 측정은 주변 소음과 컨디션의 영향을 받습니다. 무리해서 낸 최고음보다 여러 번 편하게 낸 음을 기준으로 삼고, 목에 통증이 있거나 쉰 목소리가 오래가면 연습보다 이비인후과 진료가 먼저입니다.
      </Callout>

      <GuideSources
        items={[
          { label: 'ISO 16:1975 — 표준 음고(A4 = 440Hz)', href: 'https://www.iso.org/standard/3601.html' },
          { label: 'UNSW Physics — Note names, MIDI numbers and frequencies', href: 'https://newt.phys.unsw.edu.au/jw/notes.html' },
          { label: 'NIDCD(미국 국립보건원) — Taking care of your voice', href: 'https://www.nidcd.nih.gov/health/taking-care-your-voice' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '악기·작곡, 키와 박자를 숫자로 맞추기', Body }
export default guide
