import Link from 'next/link'
import MorseCodeClient from './MorseCodeClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import { MORSE_EN, MORSE_KO, NATO } from './morseData'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/art/morse-code',
  title: '모스 부호 변환기 — 한글·영문 모스 + 소리·빛 재생 + NATO 음성기호',
  description:
    '텍스트를 모스 부호로, 모스 부호를 텍스트로 양방향 변환. 한글(국문 전신부호)·영문 모두 지원하고 소리·빛으로 재생합니다. NATO 음성기호(Alfa·Bravo) 철자 변환과 음성 문자표까지.',
  keywords: ['모스부호변환기', '모스부호', '한글모스부호', '모스부호표', 'SOS모스부호', 'NATO음성기호', '포네틱코드', '음성문자', 'morse code', '모스부호소리'],
})

const sectionTitle: React.CSSProperties = { fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }
const card: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px' }
const faqDetails: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', marginBottom: '8px' }
const faqSummary: React.CSSProperties = { cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }
const faqAnswer: React.CSSProperties = { marginTop: '10px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }

const codeCell: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
  padding: '8px 12px', background: 'var(--bg3)', borderRadius: '8px', border: '1px solid var(--border)',
}
const chStyle: React.CSSProperties = { fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, fontSize: '15px', color: 'var(--text)' }
const mcStyle: React.CSSProperties = { fontFamily: 'Inter, system-ui, monospace', color: 'var(--accent)', fontSize: '14px', letterSpacing: '0.08em', fontWeight: 600 }

const EN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const EN_DIGITS = '0123456789'.split('')
const EN_PUNCT = ['.', ',', '?', '!', "'", '"', '/', '(', ')', ':', ';', '=', '+', '-', '_', '@', '&', '$']
const PROSIGNS = [
  { sign: 'AR', code: '·−·−·', mean: '전문(메시지) 끝 — "+" 기호와 같은 부호' },
  { sign: 'SK', code: '···−·−', mean: '교신 종료(end of work)' },
  { sign: 'BT', code: '−···−', mean: '단락 구분·잠깐 쉼 — "=" 기호와 같은 부호' },
  { sign: 'K', code: '−·−', mean: '송신하세요(상대에게 응답 요청)' },
  { sign: 'AS', code: '·−···', mean: '잠시 대기(wait) — "&" 기호와 같은 부호' },
  { sign: 'HH', code: '········', mean: '정정 — 점 8개, 틀린 직전 단어를 다시 보냄' },
]
const KO_CONS = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ'.split('')
const KO_VOWELS = 'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣㅐㅔ'.split('')
const toBar = (m: string) => m.replace(/\./g, '·').replace(/-/g, '−')

const FAQ_LD = [
  { q: '한글도 모스 부호로 바꿀 수 있나요?', a: '네. 한국에는 <strong>국문 전신부호(한글 모스 부호)</strong>가 있습니다. 1888년경 김학우가 사용 빈도와 자모 순서를 고려해 만든 체계로, 가장 많이 쓰는 ‘ㅏ’에 가장 짧은 부호(·)를 배정했어요. 이 변환기는 한글을 <strong>자음·모음(자모) 단위로 분해</strong>해 부호로 바꾸고, 반대로 부호를 음절로 재조합합니다. 받침(닭·값)이나 겹모음(의·과)도 처리합니다.' },
  { q: '모스 부호는 어떻게 읽나요?', a: '짧은 신호 <strong>단점(·, dot)</strong>과 긴 신호 <strong>장점(−, dash)</strong>의 조합입니다. 길이 규칙은 단점 1, 장점 3, 부호 안 간격 1, 글자 사이 3, 단어 사이 7(단점 길이 기준)이에요. 이 도구의 <strong>소리·빛 재생</strong>을 들어 보면 리듬으로 감이 잡힙니다. 속도(WPM)를 낮추면 더 또렷하게 들려요.' },
  { q: 'SOS는 왜 ···−−−··· 인가요?', a: 'SOS(··· −−− ···)는 특정 단어의 약자가 아니라, <strong>외우기 쉽고 혼동 없는 조난 신호</strong>로 정해진 것입니다. 점 세 번·선 세 번·점 세 번의 단순한 리듬이라 끊김 없이 반복해도 알아듣기 쉬워, 1900년대 초 국제 표준 조난 신호가 되었어요. 도구의 🆘 버튼으로 바로 들어볼 수 있습니다.' },
  { q: 'NATO 음성기호는 언제 쓰나요?', a: '전화·무전에서 <strong>영문 철자를 또렷이 전달</strong>할 때 씁니다. B와 D, M과 N처럼 헷갈리는 글자를 “B는 Bravo, D는 Delta”처럼 단어로 풀어 말하는 거예요. <strong>콜센터·항공·국제 통화·예약번호·운송장 번호</strong> 확인에 유용합니다. 이 도구는 입력한 글자를 Alfa·Bravo… 로 풀고 한국어 발음도 함께 보여줍니다.' },
  { q: '재생 속도(WPM)는 무슨 뜻인가요?', a: 'WPM(Words Per Minute)은 분당 단어 수로 모스 부호의 속도를 나타냅니다. 기준 단어 ‘PARIS’를 1분에 몇 번 보내는지로 정의해, <strong>단점 1개 길이 = 1.2초 ÷ WPM</strong>으로 계산해요. 입문자는 보통 5~13 WPM으로 듣고, 숙련자는 20 WPM 이상으로도 주고받습니다. 이 도구의 슬라이더로 5~30 WPM을 조절할 수 있어요.' },
  { q: '다른 한글 모스 변환기와 결과가 다를 수 있나요?', a: '한글 모스 부호는 <strong>표준 국문 전신부호</strong>를 따르지만, 사이트마다 ‘ㅐ·ㅔ’ 같은 모음이나 겹받침 분해 방식을 조금씩 다르게 표기하기도 합니다. 이 변환기는 한국어 위키백과 등에 정리된 표준 자모표를 기준으로 하며, 한글을 보낼 때는 자모를 차례로 타전하고 받을 때 음절로 재조합하는 방식을 씁니다.' },
]

export default function MorseCodePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>예술·창작</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="art" />모스 부호 · NATO 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        텍스트 ↔ <strong style={{ color: 'var(--text)' }}>모스 부호</strong>를 한글·영문으로 양방향 변환하고 <strong style={{ color: 'var(--text)' }}>소리·빛으로 재생</strong>합니다. NATO 음성기호 철자 변환까지.
      </p>

      <MorseCodeClient />

      <GuideDivider />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', marginTop: '48px' }}>

        {/* 모스 부호란 */}
        <div>
          <h2 style={sectionTitle}>📡 모스 부호, 한눈에</h2>
          <div style={{ ...card }}>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--muted)', lineHeight: 1.95 }}>
              <li><strong style={{ color: 'var(--text)' }}>단점(·)·장점(−)</strong>의 조합으로 글자를 표현하는 신호 부호입니다.</li>
              <li><strong style={{ color: 'var(--text)' }}>길이 규칙</strong> — 단점 1, 장점 3, 부호 간격 1, 글자 간격 3, 단어 간격 7.</li>
              <li><strong style={{ color: 'var(--text)' }}>한글 모스(국문 전신부호)</strong> — 김학우가 만든 한국형 체계로 자모 단위로 타전합니다.</li>
              <li><strong style={{ color: 'var(--text)' }}>SOS(··· −−− ···)</strong> — 외우기 쉽게 정해진 국제 조난 신호.</li>
            </ul>
          </div>
        </div>

        {/* 한글 모스표 */}
        <div>
          <h2 style={sectionTitle}>🇰🇷 한글 모스 부호표 (국문 전신부호)</h2>
          <div style={{ ...card }}>
            <p style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700, margin: '0 0 10px' }}>자음 14</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '6px', marginBottom: '18px' }}>
              {KO_CONS.map((c) => (
                <div key={c} style={codeCell}><span style={chStyle}>{c}</span><span style={mcStyle}>{toBar(MORSE_KO[c])}</span></div>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700, margin: '0 0 10px' }}>모음 12</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '6px' }}>
              {KO_VOWELS.map((v) => (
                <div key={v} style={codeCell}><span style={chStyle}>{v}</span><span style={mcStyle}>{toBar(MORSE_KO[v])}</span></div>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '16px 0 0', lineHeight: 1.7 }}>
              겹자음(ㄲ·ㅆ 등)은 같은 자음을 두 번, 겹받침·겹모음(닭·과 등)은 구성 자모를 차례로 타전합니다.
            </p>
          </div>
        </div>

        {/* 영문 모스표 */}
        <div>
          <h2 style={sectionTitle}>🔤 영문·숫자 모스 부호표</h2>
          <div style={{ ...card }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: '6px', marginBottom: '18px' }}>
              {EN_LETTERS.map((c) => (
                <div key={c} style={codeCell}><span style={chStyle}>{c}</span><span style={mcStyle}>{toBar(MORSE_EN[c])}</span></div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: '6px' }}>
              {EN_DIGITS.map((c) => (
                <div key={c} style={codeCell}><span style={chStyle}>{c}</span><span style={mcStyle}>{toBar(MORSE_EN[c])}</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* 문장부호·절차신호 */}
        <div>
          <h2 style={sectionTitle}>✒️ 문장부호 부호표 + 절차신호(Prosign)</h2>
          <div style={{ ...card }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, margin: '0 0 14px' }}>
              물음표·쉼표 같은 문장부호도 국제 표준인 <strong style={{ color: 'var(--text)' }}>ITU-R 권고 M.1677-1</strong>에 부호가 정해져 있습니다. 물음표(··−−··)와 쉼표(−−··−−)는 점·선을 서로 뒤집은 <strong style={{ color: 'var(--text)' }}>거울 관계</strong>라 짝으로 외우면 쉽고, 마침표(·−·−·−)는 점·선이 번갈아 나오는 리듬입니다. 느낌표(−·−·−−)·세미콜론(;)·밑줄(_)·달러($)는 ITU 표준 문서에는 없지만 관용적으로 널리 쓰이는 부호로, 이 변환기도 함께 지원합니다.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: '6px', marginBottom: '18px' }}>
              {EN_PUNCT.map((c) => (
                <div key={c} style={codeCell}><span style={chStyle}>{c}</span><span style={mcStyle}>{toBar(MORSE_EN[c])}</span></div>
              ))}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, margin: '0 0 10px' }}>
              <strong style={{ color: 'var(--text)' }}>절차신호(prosign)</strong>는 두 글자를 글자 간격 없이 붙여 하나의 신호로 보내는 운용 신호입니다. 예를 들어 AR은 A(·−)와 R(·−·)을 이어 ·−·−·가 되죠. 전보·아마추어무선 교신에서 문장부호 대신 대화의 흐름을 제어하는 데 씁니다.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {PROSIGNS.map((p) => (
                <div key={p.sign} style={{ ...codeCell, justifyContent: 'flex-start', gap: '12px' }}>
                  <span style={{ ...chStyle, minWidth: '28px' }}>{p.sign}</span>
                  <span style={{ ...mcStyle, minWidth: '88px' }}>{p.code}</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{p.mean}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '14px 0 0', lineHeight: 1.7 }}>
              ITU 표준에는 이 밖에도 송신 시작(−·−·−)·수신 양해 Understood(···−·) 신호가 정의되어 있습니다.
            </p>
          </div>
        </div>

        {/* NATO */}
        <div>
          <h2 style={sectionTitle}>🗣️ NATO 음성기호란?</h2>
          <div style={{ ...card, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <p style={{ margin: '0 0 10px' }}>
              전화나 무전으로 영문 철자를 또렷이 전할 때 쓰는 국제 표준 단어들입니다. <strong style={{ color: 'var(--text)' }}>“B as in Bravo, D as in Delta”</strong>처럼 헷갈리는 글자를 단어로 풀어 말하죠.
            </p>
            <p style={{ margin: 0 }}>
              총 {NATO.filter((n) => /[A-Z]/.test(n.ch)).length}개 알파벳 + 숫자로 구성되며, <strong style={{ color: 'var(--text)' }}>콜센터·항공·예약번호·운송장 번호</strong> 확인에 특히 유용합니다. 위 도구의 NATO 모드에서 바로 변환해 보세요.
            </p>
          </div>
        </div>

        {/* 학습법 */}
        <div>
          <h2 style={sectionTitle}>🎧 모스 학습법 — 코흐 방식과 판스워스 타이밍</h2>
          <div style={{ ...card, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <p style={{ margin: '0 0 10px' }}>
              <strong style={{ color: 'var(--text)' }}>코흐(Koch) 방식</strong>은 1930년대 독일의 루트비히 코흐(Ludwig Koch)가 고안한 훈련법입니다. 처음부터 실전 속도(보통 15~20 WPM)의 리듬으로 딱 <strong style={{ color: 'var(--text)' }}>2글자</strong>만 듣기 시작하고, 정답률 90%를 넘기면 글자를 하나씩 추가해요. 점·선 개수를 세는 습관이 굳기 전에 글자를 통째로 ‘소리 패턴’으로 외우게 하는 것이 핵심입니다.
            </p>
            <p style={{ margin: '0 0 10px' }}>
              <strong style={{ color: 'var(--text)' }}>판스워스(Farnsworth) 타이밍</strong>은 글자 하나하나는 빠른 속도의 리듬으로 보내되, 글자·단어 사이 간격만 길게 늘려 전체 속도를 낮추는 방식입니다. 느린 속도로 배우면 나중에 빠른 리듬을 처음부터 다시 익혀야 하는 정체 구간이 생기는데, 이를 피할 수 있죠.
            </p>
            <p style={{ margin: 0 }}>
              이 도구의 <strong style={{ color: 'var(--text)' }}>WPM 슬라이더(5~30)</strong>로 비슷하게 연습할 수 있습니다. 단점 1개 길이는 1.2초 ÷ WPM(20 WPM이면 0.06초)이에요. ① 20 WPM 안팎에서 E(·)·T(−)처럼 쉬운 글자 한두 개를 반복 재생하며 소리로 구분하고 → ② 글자가 익으면 짧은 단어를 같은 속도로 듣고 → ③ 문장 전체는 10~13 WPM쯤에서 시작해 조금씩 올려 보세요.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          {FAQ_LD.map((f, i) => (
            <details key={i} style={faqDetails}>
              <summary style={faqSummary}>Q{i + 1}. {f.q}</summary>
              <div style={faqAnswer} dangerouslySetInnerHTML={{ __html: f.a }} />
            </details>
          ))}
        </div>

        {/* 관련 도구 */}
        <div>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/art/charcount', icon: '🔡', name: '글자수 세기', desc: '공백 포함·제외 카운트' },
              { href: '/tools/dev/base64', icon: '🔐', name: 'Base64 인코더', desc: '텍스트 ↔ Base64' },
              { href: '/tools/dev/number-base', icon: '🔢', name: '진법 변환기', desc: '2·8·16진 + ASCII' },
              { href: '/tools/art/frequency', icon: '🎵', name: '주파수↔음정 변환기', desc: 'Hz ↔ 음정·MIDI' },
            ].map((t, i) => (
              <Link key={i} href={t.href} style={{ ...card, display: 'block', textDecoration: 'none', padding: '14px 16px' }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
