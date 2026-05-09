import Link from 'next/link'
import ScaleClient from './ScaleClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/art/scale',
  title: '스케일 음계 계산기 — 12키 × 12스케일 + 피아노·기타 지판 + 다이어토닉',
  description: 'C·D·E·F 등 12키 × Major·Minor·Pentatonic·Blues·Dorian·Lydian·Mixolydian 등 12 스케일 자동 계산. 피아노 건반·기타 지판 SVG 시각화 + 다이어토닉 7화음 + 7 교회 모드 비교 + Web Audio MIDI 재생.',
  keywords: ['스케일 계산기', '음계', 'C major 스케일', '블루스 스케일', '도리안 모드', '리디안', '믹솔리디안', '다이어토닉 코드', '기타 지판', '피아노 건반', '음악 이론'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
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
  marginBottom: '14px',
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

export default function ScalePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        음악
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎼 스케일 음계 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        12키 × <strong style={{ color: 'var(--text)' }}>12 스케일</strong> (Major·Minor·Pentatonic·Blues·Dorian·Lydian·Mixolydian 등) +{' '}
        피아노 건반·기타 지판 <strong style={{ color: 'var(--text)' }}>SVG 시각화</strong> + 다이어토닉 7화음 + 7 교회 모드 비교 +{' '}
        <strong style={{ color: 'var(--text)' }}>Web Audio MIDI 재생</strong> 4탭.
      </p>

      <ScaleClient />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>키 선택</strong> — C부터 B까지 12키 (♯·♭ 표기 토글)</li>
          <li><strong>스케일 선택</strong> — Major / Minor / Pentatonic / Blues / Dorian 등 12종</li>
          <li><strong>탭 전환</strong> — 스케일 / 기타 지판 / 다이어토닉 / 모드 비교</li>
          <li><strong>▶ 재생 버튼</strong>으로 음 직접 들으며 학습</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>피아노 건반</strong>의 음을 클릭하면 한 음이 재생됩니다.
          <strong style={{ color: 'var(--accent)' }}> 다이어토닉 탭</strong>에서 코드 카드를 누르면 합주 재생,
          진행 추천에서는 4코드 자동 진행을 들을 수 있어요.
        </p>
      </div>

      {/* 2. 12 스케일 종류 */}
      <h2 style={sectionTitle}>🎵 12 스케일 종류 가이드</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { t: '😊 Major (Ionian)',   d: '도-레-미-파-솔-라-시. 가장 밝음. 팝·동요·축가.', c: '#3EFFD0' },
            { t: '😢 Natural Minor',     d: '슬픔·차분. 록·발라드·블루스 표준.',              c: '#3EC8FF' },
            { t: '🌌 Harmonic Minor',    d: '7도 반음 ↑. 이국적·드라마틱·메탈·플라멩코.',     c: '#9B59B6' },
            { t: '✨ Melodic Minor',     d: '6·7도 ↑(상행). 재즈·세련·복합.',                 c: '#FFB83E' },
            { t: '🌸 Major Pentatonic',  d: '5음. 4·7도 제거로 불협 없음. 동요·민요.',         c: '#FF8C3E' },
            { t: '🎸 Minor Pentatonic',  d: '록·블루스 솔로 표준. 가장 쉬운 스케일.',          c: '#FF3E8C' },
            { t: '🎺 Blues',             d: 'Minor Pent + ♭5. 12-bar blues 표준.',           c: '#3EC8FF' },
            { t: '🍃 Dorian',            d: 'Minor + M6. 재즈·소울 모달.',                    c: '#3EFF9B' },
            { t: '🌶️ Phrygian',           d: 'Minor + ♭2. 스페인·메탈.',                       c: '#FFB83E' },
            { t: '🌙 Lydian',            d: 'Major + ♯4. 꿈결·환상적·OST.',                   c: '#C485E0' },
            { t: '🤘 Mixolydian',        d: 'Major + ♭7. 블루스·록·아일랜드.',                c: '#FF8C3E' },
            { t: '😈 Locrian',           d: '♭2 + ♭5. 가장 어두움. 메탈·실험.',               c: '#FF3E8C' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 다이어토닉 */}
      <h2 style={sectionTitle}>🎹 다이어토닉 코드 — 스케일 안의 7화음</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          스케일의 각 음을 루트로 3-5-7도를 쌓아 만든 7개의 자연 7화음.
          모든 곡의 코드는 대부분 다이어토닉 코드 안에서 진행됩니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 400 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '6px 0', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>도수</th>
                <th style={{ padding: '6px 0', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>C Major 예시</th>
                <th style={{ padding: '6px 0', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>기능</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['I',    'Cmaj7',  'Tonic (안정)',          '#3EFFD0'],
                ['ii',   'Dm7',    'Subdominant (전이)',     '#FFB83E'],
                ['iii',  'Em7',    'Tonic',                  '#3EFFD0'],
                ['IV',   'Fmaj7',  'Subdominant',            '#FFB83E'],
                ['V',    'G7',     'Dominant (긴장)',         '#FF3E8C'],
                ['vi',   'Am7',    'Tonic (relative minor)', '#3EFFD0'],
                ['viiº', 'Bm7♭5',  'Dominant',                '#FF3E8C'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 0', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>{row[0]}</td>
                  <td style={{ padding: '6px 0', fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--text)' }}>{row[1]}</td>
                  <td style={{ padding: '6px 0', color: row[3] }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          기능 분류: <strong style={{ color: '#3EFFD0' }}>Tonic</strong>(안정) /
          <strong style={{ color: '#FFB83E' }}> Subdominant</strong>(전이) /
          <strong style={{ color: '#FF3E8C' }}> Dominant</strong>(긴장 → Tonic으로 해결)
        </p>
      </div>

      {/* 4. 7 교회 모드 */}
      <h2 style={sectionTitle}>🌐 7 교회 모드(Modal) 입문 가이드</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          교회 모드는 메이저 스케일의 음을 다른 음에서 시작한 7가지 변형입니다.
          <strong> 같은 음을 사용</strong>하지만 <strong>시작점</strong>에 따라 분위기가 완전히 달라져요.
        </p>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>Ionian (1도)</strong> = Major. 가장 밝음.</li>
          <li><strong style={{ color: 'var(--text)' }}>Dorian (2도)</strong>: 재즈·소울 (So What — Miles Davis)</li>
          <li><strong style={{ color: 'var(--text)' }}>Phrygian (3도)</strong>: 스페인·메탈 (♭2가 핵심)</li>
          <li><strong style={{ color: 'var(--text)' }}>Lydian (4도)</strong>: 꿈결·OST (♯4가 핵심, Star Wars)</li>
          <li><strong style={{ color: 'var(--text)' }}>Mixolydian (5도)</strong>: 블루스·록 (Sweet Child O&apos; Mine)</li>
          <li><strong style={{ color: 'var(--text)' }}>Aeolian (6도)</strong> = Natural Minor. 가장 슬픔.</li>
          <li><strong style={{ color: 'var(--text)' }}>Locrian (7도)</strong>: 가장 어두움 (♭5 불안정)</li>
        </ul>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          → 모드 비교 탭에서 같은 키로 7 모드를 한 번에 들을 수 있어요.
        </p>
      </div>

      {/* 5. 작곡·즉흥 */}
      <h2 style={sectionTitle}>🎤 작곡·즉흥 연주 — 스케일 활용법</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>키와 스케일 결정</strong> — 곡의 분위기로 메이저/마이너 선택</li>
          <li><strong>다이어토닉 코드 진행 만들기</strong> — I-V-vi-IV (팝), ii-V-I (재즈) 등</li>
          <li><strong>멜로디는 스케일 음으로</strong> — 처음엔 도수 1·3·5만 사용해도 OK</li>
          <li><strong>변화 주기</strong> — 모드 차용·반음계·감화음 등으로 색채 추가</li>
          <li><strong>즉흥 연주(Improvisation)</strong> — 코드 진행 위에서 같은 키 스케일로 자유 연주</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 처음 즉흥 연주는 <strong style={{ color: 'var(--accent)' }}>Minor Pentatonic 1박스</strong>부터 시작하세요.
          록·블루스·팝의 90% 솔로가 이 박스 안에서 이루어집니다.
        </p>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. Major와 Minor 스케일의 차이는?</summary>
        <p style={faqAnswer}>
          핵심 차이는 <strong>3도</strong>입니다. Major는 <strong>장3도(M3, 4반음)</strong>로 밝고, Minor는 <strong>단3도(m3, 3반음)</strong>로 슬픔.
          C major: C-D-E-F-G-A-B (3도 = E)<br />
          C minor: C-D-E♭-F-G-A♭-B♭ (3도 = E♭)<br />
          또한 Minor는 6·7도도 ♭로 더 어두운 느낌. 같은 키라도 Major/Minor가 곡의 정서를 결정합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. Pentatonic 스케일은 왜 쉬운가요?</summary>
        <p style={faqAnswer}>
          <strong>4도와 7도를 제거</strong>해 5음으로 만든 스케일입니다.
          제거된 4·7도가 가장 불협화음이 되기 쉬운 음정이라, 어떤 음을 쳐도 자연스럽게 들립니다.<br />
          • <strong>Major Pentatonic</strong>: 1·2·3·5·6 (한국 민요·동요)<br />
          • <strong>Minor Pentatonic</strong>: 1·♭3·4·5·♭7 (록·블루스 솔로 표준)<br />
          그래서 록·블루스 즉흥 연주 입문에 가장 먼저 추천됩니다 — &quot;틀린 음이 없는&quot; 스케일.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. Blues 스케일에 ♭5가 있는 이유?</summary>
        <p style={faqAnswer}>
          Blues 스케일은 Minor Pentatonic(1·♭3·4·5·♭7)에 <strong>♭5(블루노트)</strong>를 추가한 6음 스케일입니다.
          ♭5는 Major도 Minor도 아닌 &quot;긁히는&quot; 불협화음이지만, 블루스의 정서적 핵심이에요.
          <strong>스쳐 지나가는 경과음</strong>으로 사용하면 즉시 블루지한 느낌이 납니다.
          BB King·Eric Clapton 등 블루스 마스터들이 ♭5를 절묘하게 활용해요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. Dorian과 Natural Minor 차이는?</summary>
        <p style={faqAnswer}>
          한 음 차이입니다. <strong>6도</strong>가 다릅니다.<br />
          • Natural Minor: 1·2·♭3·4·5·<strong>♭6</strong>·♭7 (어두운 6도)<br />
          • Dorian: 1·2·♭3·4·5·<strong>6</strong>·♭7 (밝은 6도)<br />
          이 한 음 차이로 Dorian은 더 <strong>밝고 재즈적</strong>으로 느껴집니다.
          재즈·소울·록 모달 작곡에 매우 자주 쓰여요. (예: Miles Davis &quot;So What&quot;, Pink Floyd 일부)
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 다이어토닉 코드란 무엇인가요?</summary>
        <p style={faqAnswer}>
          스케일 안의 음만 사용해 만든 <strong>7개의 자연 7화음</strong>입니다.
          C major 키의 다이어토닉 코드:<br />
          <strong>I (Cmaj7) - ii (Dm7) - iii (Em7) - IV (Fmaj7) - V (G7) - vi (Am7) - viiø (Bm7♭5)</strong><br />
          모든 곡의 코드 진행은 대부분 이 7개 코드 안에서 움직입니다.
          이 코드들의 기능(Tonic·Subdominant·Dominant)을 이해하면 작곡·편곡이 훨씬 쉬워져요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. I-V-vi-IV 진행이 인기 있는 이유?</summary>
        <p style={faqAnswer}>
          가장 자연스럽고 정서적으로 만족스러운 진행입니다. <strong>안정(I) → 긴장(V) → 부드러움(vi) → 전이(IV)</strong>의 흐름이
          뇌의 보상 회로를 자극해요.<br />
          C major: C - G - Am - F<br />
          • Let It Be (Beatles) · Don&apos;t Stop Believin&apos; (Journey)<br />
          • 4 Chord Songs라는 이름으로 유튜브에 수백 곡이 같은 진행임을 보여주는 영상도 유명.<br />
          K-Pop·OST에도 가장 흔히 쓰여, &quot;팝의 황금 진행&quot;이라 불려요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 기타 1박스 운지법이 뭔가요?</summary>
        <p style={faqAnswer}>
          한 손 모양으로 5프렛 범위 안의 모든 스케일 음을 외우는 운지법입니다.
          Minor Pentatonic은 5개 박스로 지판 전체를 커버하며, <strong>1박스(5포지션)</strong>가 가장 인기.<br />
          • A minor pentatonic 1박스: 5프렛부터 시작 (A=5프렛)<br />
          • 6번줄 5·8 → 5번줄 5·7 → 4번줄 5·7 → 3번줄 5·7 → 2번줄 5·8 → 1번줄 5·8<br />
          이 박스 안에서 즉흥 연주가 록·블루스 솔로의 시작이에요.
          기타 지판 탭에서 색칠된 음을 보고 패턴을 익히세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 같은 키에서 모드를 어떻게 바꾸나요?</summary>
        <p style={faqAnswer}>
          모드는 두 가지 방법으로 사용합니다:<br />
          <strong>1. 모드 차용 (Modal Borrowing)</strong>: 같은 키에서 다른 모드의 코드를 빌려옴.
          C major 곡에 C minor의 ♭III·♭VI·♭VII을 잠깐 사용 — Beatles &quot;Eleanor Rigby&quot;.<br />
          <strong>2. 모달 작곡 (Modal Composition)</strong>: 한 모드를 끝까지 유지.
          Dorian으로 시작하면 끝까지 Dorian 음만 사용. 재즈에서 흔함 — &quot;So What&quot;.<br />
          모드 비교 탭에서 같은 키의 7 모드를 들어보면 분위기 차이를 직관적으로 느낄 수 있어요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. Harmonic Minor의 7도가 왜 중요?</summary>
        <p style={faqAnswer}>
          Natural Minor의 7도가 <strong>♭7</strong>(단7도)인데, Harmonic Minor는 <strong>7</strong>(장7도)로 반음 올립니다.
          이로 인해:<br />
          1. <strong>V도가 메이저 코드</strong>가 됨 (Am 키에서 Em → E) — Dominant 7th 가능<br />
          2. <strong>리딩 톤(Leading tone)</strong>이 생겨 토닉으로 해결 강함<br />
          3. <strong>♭6 → 7</strong>이 1.5음(증2도) 점프로 이국적 느낌<br />
          그래서 클래식·중동·메탈·플라멩코에서 자주 쓰여요. 화성적으로 가장 강력한 단음계입니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 스케일 외운 후 즉흥 연주는 어떻게?</summary>
        <p style={faqAnswer}>
          순서대로 시도하세요:<br />
          1. <strong>Minor Pentatonic 1박스</strong>를 손에 익을 때까지 반복<br />
          2. <strong>백킹 트랙</strong> (YouTube에 무료 다수)에 맞춰 한 박스 안에서 자유 연주<br />
          3. <strong>루트 음(빨강)</strong>을 강박에 두고 시작·종결<br />
          4. <strong>3·5도</strong>를 강조해 안정감 만들기<br />
          5. <strong>♭5 블루노트</strong>를 경과음으로 살짝 추가<br />
          6. <strong>다른 박스</strong>로 확장해 지판 전체 커버<br />
          처음엔 어색하지만 매일 5~10분만 반복하면 1~2주 안에 즉흥 연주가 됩니다.
        </p>
      </details>

      {/* music 도구 크로스링크 */}
      <h2 style={sectionTitle}>🔗 함께 보면 좋은 음악 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/art/chord" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🎹</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>코드 구성음 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            Cmaj7·Dm7 코드 분석
          </p>
        </Link>
        <Link href="/tools/art/capo" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🎸</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>기타 카포·전조 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            카포 위치별 코드 변환
          </p>
        </Link>
        <Link href="/tools/art/frequency" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🎵</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>주파수 음정 변환기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            Hz ↔ 음정 + MIDI 번호
          </p>
        </Link>
      </div>
    </div>
  )
}
