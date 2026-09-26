import Link from 'next/link'
import ScaleClient from './ScaleClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import { SCALES, getScale, buildScaleNames, buildDiatonicChords, noteFreq, type ScaleId } from './scaleUtils'

export const metadata = buildMetadata({
  path: '/tools/art/scale',
  title: '스케일 음계 계산기 — 12키 × 12스케일 + 피아노·기타 지판 + 다이어토닉',
  description: '12키 × 12스케일(Major·Minor·Pentatonic·Blues·Dorian·Lydian 등) + 피아노·기타 지판 SVG·7 모드 비교·소리 재생.',
  keywords: ['스케일 계산기', '음계', 'C major 스케일', '블루스 스케일', '도리안 모드', '리디안', '믹솔리디안', '다이어토닉 코드', '기타 지판', '피아노 건반', '음악 이론'],
})

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', fontSize: 13 }
const tdMono: React.CSSProperties = { ...td, fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }
const rowBorder: React.CSSProperties = { borderBottom: '1px solid var(--border)' }

/* 가이드 표는 계산기와 같은 scaleUtils로 빌드 시 계산한다 — 손입력 표가 계산기 결과와 어긋나지 않도록 */
const SCALE_NOTE: Record<ScaleId, string> = {
  major:      '밝고 안정적. 팝·동요·축가',
  natminor:   '슬픔·차분. 록·발라드 단조 곡의 기본',
  harmonic:   '자연단음계의 7도를 반음 올림. 이국적·드라마틱',
  melodic:    '6·7도를 반음 올림(상행). 재즈의 기본 단음계',
  majpenta:   '장음계에서 4·7도를 뺌. 동요·민요·컨트리',
  minpenta:   '자연단음계에서 2·♭6도를 뺌. 록·블루스 솔로 입문',
  blues:      '마이너 펜타 + ♭5(블루노트). 블루스·록',
  dorian:     '자연단음계 + 장6도. 재즈·소울 모달',
  phrygian:   '자연단음계 + ♭2. 스페인·메탈',
  lydian:     '장음계 + ♯4. 꿈결·환상·영화음악',
  mixolydian: '장음계 + ♭7. 블루스·록·아일랜드 민요',
  locrian:    '♭2 + ♭5. 가장 어둡고 불안정',
}
const C_MAJOR = buildDiatonicChords(0, getScale('major'), 'sharp')
const A_NATURAL = buildDiatonicChords(9, getScale('natminor'), 'sharp')
const A_HARMONIC = buildDiatonicChords(9, getScale('harmonic'), 'sharp')
const FN_KO = { Tonic: '토닉 (안정)', Subdominant: '서브도미넌트 (전이)', Dominant: '도미넌트 (긴장)' } as const
const EB_MAJOR = buildScaleNames(3, getScale('major'), 'flat')
const FS_MAJOR = buildScaleNames(6, getScale('major'), 'sharp')
const GB_MAJOR = buildScaleNames(6, getScale('major'), 'flat')
const C_BLUES = buildScaleNames(0, getScale('blues'), 'flat')
const C4_HZ = noteFreq(0, 4)

const FAQ_LD = [
  { q: 'Major와 Minor 스케일의 차이는?',
    a: '핵심 차이는 <strong>3도</strong>입니다. Major는 <strong>장3도(M3, 4반음)</strong>로 밝고, Minor는 <strong>단3도(m3, 3반음)</strong>로 어둡게 들립니다.<br>C major: C-D-E-F-G-A-B (3도 = E)<br>C minor: C-D-E♭-F-G-A♭-B♭ (3도 = E♭)<br>자연단음계는 6·7도도 반음 낮아(♭6·♭7) 더 어두운 느낌을 줍니다. 같은 으뜸음이라도 장·단 선택이 곡의 정서를 좌우합니다.' },
  { q: 'Pentatonic 스케일은 왜 쉬운가요?',
    a: '5음 스케일 안에 <strong>반음 간격(단2도)이 하나도 없기 때문</strong>입니다. 반음으로 부딪히는 음이 없어 어떤 순서로 쳐도 크게 거슬리지 않습니다.<br>• <strong>Major Pentatonic</strong>: 장음계에서 4·7도를 뺀 1·2·3·5·6 (동요·민요)<br>• <strong>Minor Pentatonic</strong>: 자연단음계에서 2·♭6도를 뺀 1·♭3·4·5·♭7 (록·블루스 솔로 표준)<br>두 스케일은 같은 5음을 공유하는 나란한 관계입니다(C 메이저 펜타 = A 마이너 펜타). 그래서 록·블루스 즉흥 연주 입문에 가장 먼저 추천되고, 흔히 &quot;틀린 음이 없는&quot; 스케일이라고 불려요.' },
  { q: 'Blues 스케일에 ♭5가 있는 이유?',
    a: 'Blues 스케일은 Minor Pentatonic(1·♭3·4·5·♭7)에 <strong>♭5(블루노트)</strong>를 더한 6음 스케일입니다. ♭5는 완전5도보다 반음 낮은 음(증4도와 같은 높이)으로, 4도와 5도 사이를 반음씩 잇는 <strong>경과음</strong>으로 쓰면 블루스 특유의 긁히는 긴장감이 생깁니다. 오래 머무르기보다 4→♭5→5처럼 스쳐 지나가게 쓰는 것이 일반적입니다.' },
  { q: 'Dorian과 Natural Minor 차이는?',
    a: '한 음 차이입니다. <strong>6도</strong>가 다릅니다.<br>• Natural Minor: 1·2·♭3·4·5·<strong>♭6</strong>·♭7 (어두운 6도)<br>• Dorian: 1·2·♭3·4·5·<strong>6</strong>·♭7 (밝은 6도)<br>이 한 음 차이로 Dorian은 단조이면서도 더 <strong>밝고 재즈적</strong>으로 느껴집니다. 재즈·소울·록의 모달 작곡에 자주 쓰여요. (예: Miles Davis &quot;So What&quot;, 영국 민요 &quot;Scarborough Fair&quot;)' },
  { q: '다이어토닉 코드란 무엇인가요?',
    a: '스케일 안의 음만 사용해 각 음 위에 3도씩 쌓아 만든 <strong>7개의 화음</strong>입니다. C major 키의 다이어토닉 7화음:<br><strong>I (Cmaj7) - ii (Dm7) - iii (Em7) - IV (Fmaj7) - V (G7) - vi (Am7) - viiø (Bm7♭5)</strong><br>많은 곡의 코드 진행이 이 7개 코드를 중심으로 움직입니다(차용 화음·세컨더리 도미넌트 같은 예외도 흔해요). 이 코드들의 기능(Tonic·Subdominant·Dominant)을 이해하면 작곡·편곡이 훨씬 쉬워져요.' },
  { q: 'I-V-vi-IV 진행이 인기 있는 이유?',
    a: '<strong>안정(I) → 긴장(V) → 이완(vi) → 전이(IV)</strong>로 이어지는 흐름이 익숙하고, 네 코드가 반복되며 다시 I로 자연스럽게 돌아가기 때문입니다.<br>C major: C - G - Am - F<br>• Let It Be (Beatles) · Don&#39;t Stop Believin&#39; (Journey)<br>• 호주 코미디 밴드 Axis of Awesome의 &quot;4 Chords&quot; 메들리가 이 진행 하나로 수십 곡을 이어 불러 유명해졌습니다.<br>K-Pop·드라마 OST에서도 자주 쓰여 &quot;팝의 황금 진행&quot;이라고도 불려요.' },
  { q: '기타 1박스 운지법이 뭔가요?',
    a: '한 손 모양으로 약 4~5프렛 범위 안의 스케일 음을 모두 잡는 운지법입니다. Minor Pentatonic은 5개 박스로 지판 전체를 커버하며, 그중 <strong>1박스</strong>가 가장 먼저 배우는 모양입니다.<br>• A minor pentatonic 1박스: 5프렛에서 시작 (6번줄 5프렛 = A)<br>• 6번줄 5·8 → 5번줄 5·7 → 4번줄 5·7 → 3번줄 5·7 → 2번줄 5·8 → 1번줄 5·8<br>이 박스 안에서 즉흥 연주하는 것이 록·블루스 솔로의 출발점이에요. 기타 지판 탭에서 색칠된 음을 보고 패턴을 익히세요.' },
  { q: '같은 키에서 모드를 어떻게 바꾸나요?',
    a: '모드는 두 가지 방법으로 사용합니다:<br><strong>1. 모드 차용 (Modal Borrowing)</strong>: 같은 으뜸음의 다른 모드에서 코드를 빌려옴. C major 곡이 C minor의 화음(♭III·♭VI·♭VII이나 단조 iv)을 잠깐 빌려 씀 — Radiohead &quot;Creep&quot;(G장조 속 Cm), Beatles &quot;Hey Jude&quot; 코다(I–♭VII–IV).<br><strong>2. 모달 작곡 (Modal Composition)</strong>: 한 모드를 끝까지 유지. Dorian으로 시작하면 끝까지 Dorian 음만 사용. 재즈에서 흔함 — &quot;So What&quot;.<br>모드 비교 탭에서 같은 키의 7 모드를 들어보면 분위기 차이를 직관적으로 느낄 수 있어요.' },
  { q: 'Harmonic Minor의 7도가 왜 중요?',
    a: 'Natural Minor의 7도는 <strong>♭7</strong>(단7도)인데, Harmonic Minor는 이를 <strong>7</strong>(장7도)로 반음 올립니다. 이로 인해:<br>1. <strong>V도가 장화음</strong>이 됨 (A단조에서 Em → E, 7화음이면 E7) — 도미넌트 7th 가능<br>2. <strong>이끎음(Leading tone)</strong>이 생겨 으뜸음으로 강하게 해결<br>3. <strong>♭6 → 7</strong>이 1.5음(증2도) 간격이라 이국적인 느낌<br>이름 그대로 단조의 화성(V–i 해결)을 위해 7도를 올린 음계로, 클래식 단조 곡의 화성 기반이 되고 중동풍·메탈·플라멩코에서도 자주 들립니다.' },
  { q: '스케일 외운 후 즉흥 연주는 어떻게?',
    a: '순서대로 시도하세요:<br>1. <strong>Minor Pentatonic 1박스</strong>를 손에 익을 때까지 반복<br>2. <strong>백킹 트랙</strong>(같은 키의 반주 음원)에 맞춰 한 박스 안에서 자유 연주<br>3. <strong>루트 음</strong>을 강박에 두고 시작·종결<br>4. 지금 울리는 코드의 <strong>3·5도</strong>에 머물러 안정감 만들기<br>5. <strong>♭5 블루노트</strong>를 경과음으로 살짝 추가<br>6. <strong>다른 박스</strong>로 확장해 지판 전체 커버<br>처음엔 어색해도 짧게라도 매일 반복하면 손이 먼저 패턴을 기억하게 됩니다.' },
]

export default function ScalePage() {
  return (
    <ToolPage width={880} slug="/tools/art/scale">
      <h1 className="tp-h1">
        <ToolIconBadge catId="art" />스케일 음계 계산기
      </h1>
      <p className="tp-lead">
        12키 × 12스케일 + 피아노·기타 지판 시각화 + <strong style={{ color: 'var(--text)' }}>7 모드 비교와 소리 재생</strong>.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="장음계 간격 W-W-H-W-W-W-H · 음이름은 도수마다 A~G 글자를 한 번씩(레터워크) · 교회 모드 = 장음계의 회전 · 블루스 = 마이너 펜타토닉 + ♭5 경과음 · 다이어토닉 7화음 로마숫자 표기(대문자 장·소문자 단·ø 반감7) · 재생음 A4 = 440Hz 12평균율"
        sources={[
          { label: 'Music Theory for the 21st-Century Classroom — 장음계 (Univ. of Puget Sound)', href: 'https://musictheory.pugetsound.edu/mt21c/TheMajorScale.html' },
          { label: '같은 교재 — 단음계 3종', href: 'https://musictheory.pugetsound.edu/mt21c/MinorScales.html' },
          { label: '같은 교재 — 다이어토닉 7화음 로마숫자', href: 'https://musictheory.pugetsound.edu/mt21c/RomanNumeralsOfDiatonicSeventhChords.html' },
          { label: 'Open Music Theory — Diatonic Modes', href: 'https://viva.pressbooks.pub/openmusictheory/chapter/diatonic-modes/' },
          { label: 'Open Music Theory — Blues Melodies and the Blues Scale', href: 'https://viva.pressbooks.pub/openmusictheory/chapter/blues-melodies-and-the-blues-scale/' },
        ]}
      />

      <ScaleClient />

      <GuideDivider />

      {/* 1. 어떻게 사용하나요? */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <ol className="g-list">
        <li><strong>키 선택</strong> — C부터 B까지 12키 (♯·♭ 표기 토글)</li>
        <li><strong>스케일 선택</strong> — Major / Minor / Pentatonic / Blues / Dorian 등 12종</li>
        <li><strong>탭 전환</strong> — 스케일 / 기타 지판 / 다이어토닉 / 모드 비교</li>
        <li><strong>재생 버튼</strong>으로 음을 직접 들으며 학습</li>
      </ol>
      <Callout tone="tip" title="소리로 확인하기">
        <strong>피아노 건반</strong>의 음을 클릭하면 한 음이 재생됩니다. <strong>다이어토닉 탭</strong>에서 코드 카드를 누르면 화음이,
        진행 추천에서는 4코드 자동 진행이 재생됩니다. 모드 비교 탭은 같은 으뜸음의 7 모드마다 ▶ 버튼이 있어 하나씩 들으며 색채 차이를 귀로 비교할 수 있어요.
      </Callout>

      {/* 2. 12 스케일 공식표 */}
      <h2 className="g-h2">12 스케일 공식표 — 도수·간격·C 기준 구성음</h2>
      <p className="g-p">
        스케일은 &lsquo;으뜸음에서 몇 반음 떨어진 음들을 쓰느냐&rsquo;로 정의됩니다. 아래 표는 계산기에 들어 있는 12개 스케일의 도수 공식과 간격 패턴,
        그리고 C를 으뜸음으로 했을 때의 구성음을 계산기와 같은 함수로 뽑은 것입니다. 다른 키는 모든 음을 같은 반음 수만큼 옮기면 됩니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>스케일</th>
              <th scope="col" style={th}>도수 공식</th>
              <th scope="col" style={th}>간격</th>
              <th scope="col" style={th}>C 기준 구성음</th>
              <th scope="col" style={th}>성격·쓰임</th>
            </tr>
          </thead>
          <tbody>
            {SCALES.map((sc) => (
              <tr key={sc.id} style={rowBorder}>
                <td style={{ ...td, fontWeight: 700, whiteSpace: 'nowrap' }}>{sc.label}</td>
                <td style={tdMono}>{sc.degrees.join('·')}</td>
                <td style={{ ...tdMono, color: 'var(--muted)' }}>{sc.pattern}</td>
                <td style={{ ...tdMono, color: 'var(--accent-ink)', fontWeight: 700 }}>{buildScaleNames(0, sc, 'flat').join(' ')}</td>
                <td style={{ ...td, color: 'var(--muted)' }}>{SCALE_NOTE[sc.id]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        간격 표기: W = 온음(2반음), H = 반음(1반음), W½ = 온음 반(3반음 — 화성단음계의 ♭6→7, 펜타토닉의 건너뛴 자리).
        펜타토닉·블루스는 5·6음이라 간격 개수도 5·6개입니다.
      </p>

      {/* 3. 음 이름이 정해지는 원리 */}
      <h2 className="g-h2">계산 원리 — 반음 번호로 음을 찾고, 도수로 이름을 붙인다</h2>
      <p className="g-p">
        계산기는 먼저 C = 0, C♯ = 1 … B = 11처럼 12개 음에 번호를 붙이고, 선택한 키 번호에 스케일의 반음 간격을 더해 음을 찾습니다.
        장음계의 간격 배열은 [0, 2, 4, 5, 7, 9, 11]이라 E♭(3)에서 시작하면 3·5·7·8·10·0·2가 되고, 이름으로 옮기면 <strong>{EB_MAJOR.join(' ')}</strong>입니다.
      </p>
      <p className="g-p">
        이름은 반음 번호가 아니라 <strong>도수</strong>가 정합니다. 7음 스케일은 A~G 일곱 글자를 한 번씩 쓰도록 철자하기 때문에,
        F♯ 장조의 7도는 같은 높이의 F가 아니라 E♯(<strong>{FS_MAJOR.join(' ')}</strong>)이고, G♭ 장조의 4도는 B가 아니라 C♭(<strong>{GB_MAJOR.join(' ')}</strong>)입니다.
        블루스처럼 같은 숫자 도수가 두 번 나오는 스케일은 같은 글자를 공유합니다 — C 블루스의 ♭5와 5는 G♭과 G({C_BLUES.join(' ')})입니다.
      </p>
      <ul className="g-list">
        <li><strong>이중임시표가 필요한 키</strong> — D♯ 장조는 3도·7도가 F𝄪·C𝄪(더블 샤프)가 되는 이론상의 조성이라, 계산기는 실용 관행대로 같은 높이의 E♭ 장조로 바꿔 표기하고 결과 화면에 그 사실을 알립니다.</li>
        <li><strong>♯·♭ 토글</strong> — 검은건반 루트(C♯/D♭ 등)의 표기만 바꿉니다. 흰건반 루트의 스케일 철자는 도수 규칙대로 정해지므로 토글과 관계없이 같습니다.</li>
        <li><strong>재생 음높이</strong> — A4 = 440Hz 12평균율로 f = 440 × 2<sup>(n − 69) / 12</sup>(n = MIDI 번호)를 씁니다. 가운데 도 C4(MIDI 60)는 {C4_HZ.toFixed(2)}Hz입니다.</li>
      </ul>

      {/* 4. 다이어토닉 */}
      <h2 className="g-h2">다이어토닉 코드 — 스케일 안의 7화음</h2>
      <p className="g-p">
        스케일의 각 음을 루트로 스케일 음만 써서 3·5·7도를 쌓으면 7개의 자연 7화음이 나옵니다.
        많은 대중음악의 코드 진행이 다이어토닉 코드를 중심으로 움직입니다(차용 화음·세컨더리 도미넌트 같은 예외도 흔해요). 아래는 계산기 다이어토닉 탭의 C major 결과입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>도수</th>
              <th scope="col" style={th}>C Major 코드</th>
              <th scope="col" style={th}>구성음</th>
              <th scope="col" style={th}>기능</th>
            </tr>
          </thead>
          <tbody>
            {C_MAJOR.map((c) => (
              <tr key={c.degree} style={rowBorder}>
                <td style={{ ...tdMono, fontWeight: 700, color: 'var(--accent-ink)' }}>{c.degree}</td>
                <td style={{ ...tdMono, fontWeight: 700 }}>{c.name}</td>
                <td style={{ ...tdMono, color: 'var(--muted)' }}>{c.notesNames.join('-')}</td>
                <td style={td}>{c.function ? FN_KO[c.function] : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        기능 분류는 장·단조 화성학 기준입니다. 도리안 같은 교회 모드에서는 토닉·도미넌트 관계가 장·단조처럼 작동하지 않아 계산기도 기능 표시를 생략합니다.
        Pentatonic·Blues는 5·6음이라 3도씩 쌓은 7화음 세트가 성립하지 않으므로, 다이어토닉 탭은 코드 대신 7음 스케일을 고르라는 안내를 보여 줍니다.
      </p>

      <h3 className="g-h3">자연단음계 vs 화성단음계 — 7도 하나가 바꾸는 화음</h3>
      <p className="g-p">
        같은 A 단조라도 7도(G ↔ G♯)만 다르면 G가 들어 있는 다이어토닉 화음 네 개가 바뀝니다. 특히 v(Em7)가 V(E7)로 바뀌어 으뜸화음으로 끌려가는 힘이 생기는 것이
        화성단음계를 쓰는 이유입니다(아래 FAQ 참고).
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>A 자연단음계</th>
              <th scope="col" style={th}>코드</th>
              <th scope="col" style={th}>A 화성단음계</th>
              <th scope="col" style={th}>코드</th>
            </tr>
          </thead>
          <tbody>
            {A_NATURAL.map((c, i) => {
              const h = A_HARMONIC[i]
              const changed = h.name !== c.name
              return (
                <tr key={c.degree} style={{ ...rowBorder, background: changed ? 'var(--accent-soft)' : undefined }}>
                  <td style={{ ...tdMono, fontWeight: 700 }}>{c.degree}</td>
                  <td style={tdMono}>{c.name}</td>
                  <td style={{ ...tdMono, fontWeight: 700 }}>{h.degree}</td>
                  <td style={{ ...tdMono, fontWeight: changed ? 700 : 400, color: changed ? 'var(--accent-ink)' : 'var(--text)' }}>{h.name}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        색칠된 행이 7도(G→G♯)의 영향을 받은 화음입니다: i(Am7→AmM7), ♭III(Cmaj7→Cmaj7♯5), 그리고 v→V(Em7→E7)·♭VII→viiº(G7→G♯dim7).
      </p>

      {/* 5. 7 교회 모드 */}
      <h2 className="g-h2">7 교회 모드(Modal) 입문 가이드</h2>
      <p className="g-p">
        교회 모드는 메이저 스케일을 각 음에서 시작한 7가지 변형입니다.
        C Ionian·D Dorian·E Phrygian처럼 <strong>같은 음 집합을 공유하는 관계</strong>를 상대 모드,
        C Ionian·C Dorian처럼 <strong>루트를 고정하고 음 집합을 바꾸는 관계</strong>를 평행 모드라 불러요.
        (이 도구의 모드 비교 탭은 색채 차이를 직접 듣기 좋은 <strong>평행 모드</strong> 배치입니다.)
      </p>
      <ul className="g-list">
        <li><strong>Ionian (1도)</strong> = Major. 밝고 안정적(모드 중에서는 Lydian 다음으로 밝음).</li>
        <li><strong>Dorian (2도)</strong>: 재즈·소울 (So What — Miles Davis)</li>
        <li><strong>Phrygian (3도)</strong>: 스페인·메탈 (♭2가 핵심)</li>
        <li><strong>Lydian (4도)</strong>: 꿈결·OST (♯4가 핵심, The Simpsons 테마·E.T. 비행 테마)</li>
        <li><strong>Mixolydian (5도)</strong>: 블루스·록 (Sweet Child O&apos; Mine)</li>
        <li><strong>Aeolian (6도)</strong> = Natural Minor. 단조의 기본.</li>
        <li><strong>Locrian (7도)</strong>: 가장 어두움 (♭5 때문에 으뜸화음이 감화음이라 불안정)</li>
      </ul>
      <p className="g-p">
        밝기 순서로 다시 줄 세우면 Lydian → Ionian → Mixolydian → Dorian → Aeolian → Phrygian → Locrian입니다. 이웃한 두 모드는 음 하나만 반음 차이 나므로,
        모드 비교 탭(목록은 Ionian→Locrian 도수 순)에서 각 모드의 ▶를 이 밝기 순서대로 눌러 들으면 한 음씩 어두워지는 변화를 가장 분명하게 느낄 수 있어요.
      </p>

      {/* 6. 작곡·즉흥 */}
      <h2 className="g-h2">작곡·즉흥 연주 — 스케일 활용법</h2>
      <ol className="g-list">
        <li><strong>키와 스케일 결정</strong> — 곡의 분위기로 메이저/마이너 선택</li>
        <li><strong>다이어토닉 코드 진행 만들기</strong> — I-V-vi-IV (팝), ii-V-I (재즈) 등</li>
        <li><strong>멜로디는 스케일 음으로</strong> — 처음엔 도수 1·3·5만 사용해도 OK</li>
        <li><strong>변화 주기</strong> — 모드 차용·반음계·감화음 등으로 색채 추가</li>
        <li><strong>즉흥 연주(Improvisation)</strong> — 코드 진행 위에서 같은 키 스케일로 자유 연주</li>
      </ol>
      <Callout tone="tip" title="첫 즉흥 연주는 1박스부터">
        처음 즉흥 연주는 <strong>Minor Pentatonic 1박스</strong>부터 시작하세요. 반음 충돌이 없는 5음이라 틀린 음 걱정 없이 리듬과 프레이징에 집중할 수 있습니다.
        장조 곡이라면 나란한 단조의 마이너 펜타(C 장조 → A 마이너 펜타)를 쓰면 같은 모양으로 메이저 펜타 소리가 납니다.
      </Callout>

      {/* FAQ — 화면·JSON-LD 단일 소스 */}
      <Faq items={FAQ_LD} />

      {/* 출처 */}
      <p className="g-note">
        이론 출처 · 장음계 철자(음이름 A~G 한 번씩)·로마숫자 표기: <a href="https://musictheory.pugetsound.edu/mt21c/TheMajorScale.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>Music Theory for the 21st-Century Classroom</a> (University of Puget Sound) ·
        모드(상대·평행)·블루스 스케일: <a href="https://viva.pressbooks.pub/openmusictheory/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>Open Music Theory</a> ·
        확인일 2026-09-26. 표기는 학파·교재에 따라 조금씩 다를 수 있습니다.
      </p>

      {/* music 도구 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/art/chord" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🎹</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>코드 구성음 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            Cmaj7·Dm7 코드 분석
          </p>
        </Link>
        <Link href="/tools/art/capo" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🎸</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>기타 카포 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            카포 위치별 코드 변환
          </p>
        </Link>
        <Link href="/tools/art/frequency" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🎵</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>주파수↔음정 변환기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            Hz ↔ 음정 + MIDI 번호
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
