import Link from 'next/link'
import MorseCodeClient from './MorseCodeClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import { MORSE_EN, MORSE_KO, NATO } from './morseData'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/art/morse-code',
  title: '모스 부호 변환기 — 한글·영문 모스 + 소리 재생 + NATO 음성 문자',
  description:
    '텍스트를 모스 부호로, 모스 부호를 텍스트로 양방향 변환. 한글(국문 전신부호)·영문 모두 지원하고 소리로 재생합니다. NATO 음성 문자(Alfa·Bravo) 철자 변환과 ICAO 규정 발음표까지.',
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
/* 약어·부호·근거를 분리했다.
   ⚠️ 예전 표는 6종을 뭉뚱그려 '아마추어무선 교신에서 쓰는 운용 신호'로 소개하고, 각주에서
      ITU 표준으로는 송신 시작·수신 양해 둘만 언급했다. 실제로는 **부호 6종이 전부**
      ITU-R M.1677-1 §1.1.3의 같은 표에 있고, 두 글자 약어도 AR·AS·BT·VA·K는
      ITU-R M.1172 제II절에 정식 등재돼 있다(직접 대조 확인). ITU에 없는 것은 SK·HH뿐이다. */
const PROSIGNS = [
  { sign: 'AR', code: '·−·−·', itu: 'M.1172 “End of transmission”', mean: '송신 끝. M.1677-1은 같은 부호를 십자·덧셈 부호 [+]로 싣고, 제2부 5항이 모든 전보를 이 부호로 끝내도록 정한다.' },
  { sign: 'VA', code: '···−·−', itu: 'M.1172 “End of work”', mean: '교신 종료. 아마추어무선에서는 흔히 SK라 부르지만, ITU에 등재된 약어는 VA다.' },
  { sign: 'BT', code: '−···−', itu: 'M.1172 “Signal to mark the separation…”', mean: '전문의 서로 다른 부분을 가르는 구분 신호. M.1677-1은 같은 부호를 이중 하이픈 [=]으로 싣는다.' },
  { sign: 'K', code: '−·−', itu: 'M.1172 “Invitation to transmit”', mean: '송신하세요. M.1677-1 제2부 6항도 “invitation to transmit signal K”라고 글자 K를 직접 쓴다.' },
  { sign: 'AS', code: '·−···', itu: 'M.1172 “Waiting period”', mean: '잠시 대기. 제2부 2.1항은 대기가 10분을 넘을 것 같으면 사유와 예상 시간을 함께 알리도록 정한다.' },
  { sign: 'HH', code: '········', itu: '— (관행)', mean: '정정(점 8개). 부호는 M.1677-1의 “Error (eight dots)”지만, HH라는 약칭과 “틀린 직전 단어를 다시 보낸다”는 규칙은 ITU 규정이 아닌 관행이다.' },
]
const KO_CONS = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ'.split('')
const KO_VOWELS = 'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣㅐㅔ'.split('')
const toBar = (m: string) => m.replace(/\./g, '·').replace(/-/g, '−')

const FAQ_LD = [
  { q: '한글도 모스 부호로 바꿀 수 있나요?', a: '네. 한국에는 <strong>국문 전신부호(한글 모스 부호)</strong>가 있습니다. 1884년 가을 전신 기술을 배우러 일본에 건너간 <strong>김학우(金鶴羽, 1862~1894)</strong>가 고안한 것으로 전해지며, 1888년 「전보장정(電報章程)」에 <strong>‘국문자모 호마타법(國文字母號碼打法)’</strong>으로 처음 공식 규정됐습니다. 이 변환기는 한글을 <strong>자음·모음(자모) 단위로 분해</strong>해 부호로 바꾸고, 반대로 부호를 음절로 재조합합니다. 받침(닭·값)이나 겹모음(의·과)도 처리합니다.' },
  { q: '모스 부호는 어떻게 읽나요?', a: '짧은 신호 <strong>단점(·, dot)</strong>과 긴 신호 <strong>장점(−, dash)</strong>의 조합입니다. 길이 규칙은 단점 1, 장점 3, 부호 안 간격 1, 글자 사이 3, 단어 사이 7(단점 길이 기준)이에요. 이 도구의 <strong>소리·빛 재생</strong>을 들어 보면 리듬으로 감이 잡힙니다. 속도(WPM)를 낮추면 더 또렷하게 들려요.' },
  { q: 'SOS는 왜 ···−−−··· 인가요?', a: 'SOS는 특정 단어의 약자가 아니라, <strong>외우기 쉽고 혼동 없는 조난 신호</strong>로 정해진 것입니다. 1905년 4월 1일 독일 무선전신 규칙이 조난 신호(Notzeichen)로 먼저 채택했고, <strong>1906년 11월 3일 베를린 국제무선전신협약 업무규칙 제16조</strong>가 이를 국제 표준으로 삼아 1908년 7월 1일 발효했습니다. 그전까지 마르코니사는 CQD를 썼고, 1912년 타이타닉은 둘을 함께 타전했죠. 규정 원문에도 S·O·S라는 <strong>글자 이름 없이 점 3·선 3·점 3의 배열만</strong> 적혀 있습니다 — 세 글자가 아니라 <strong>글자 사이를 띄우지 않고 이어 보내는 하나의 신호(S̅O̅S̅)</strong>예요. 도구의 SOS 버튼은 이 규정대로의 리듬으로 재생합니다.' },
  { q: 'NATO 음성기호(음성 문자)는 언제 쓰나요?', a: '전화·무전에서 <strong>영문 철자를 또렷이 전달</strong>할 때 씁니다. B와 D, M과 N처럼 헷갈리는 글자를 “B는 Bravo, D는 Delta”처럼 단어로 풀어 말하는 거예요. <strong>콜센터·항공·국제 통화·예약번호·운송장 번호</strong> 확인에 유용합니다. 이 도구는 입력한 글자를 Alfa·Bravo… 로 풀고 <strong>ICAO 규정 발음</strong>과 한국어 근사음을 함께 보여줍니다. 영어로 무선 통신할 때 숫자 발음은 규정 사항이라 3은 TREE, 4는 FOW-er, 5는 FIFE, 9는 NIN-er, 8은 AIT로 읽어야 하고, Q도 일상 독음 ‘퀘벡’이 아니라 <strong>KEH BECK</strong>입니다.' },
  { q: '재생 속도(WPM)는 무슨 뜻인가요?', a: 'WPM(Words Per Minute)은 분당 단어 수로 모스 부호의 속도를 나타냅니다. 기준 단어 ‘PARIS’를 1분에 몇 번 보내는지로 정의하는데, PARIS는 뒤따르는 단어 간격까지 포함해 정확히 <strong>50단위</strong>여서 1분에 s단어면 50s단위 → <strong>단점 1개 = 60 ÷ 50s = 1.2초 ÷ WPM</strong>이 됩니다. 입문자는 보통 5~13 WPM으로 듣고, 숙련자는 20 WPM 이상으로도 주고받습니다. 미국 FCC의 아마추어무선 모스 시험도 한때 <strong>5·13·20 WPM 세 등급</strong>이었습니다(Element 1(A)·1(B)·1(C)). 2000년 4월 15일 5 WPM 하나로 통합됐고, 2007년 2월 23일 모스 시험 자체가 폐지됐어요. 이 도구의 슬라이더로 5~30 WPM을 조절할 수 있습니다.' },
  { q: '다른 한글 모스 변환기와 결과가 다를 수 있나요?', a: '네, 다를 수 있습니다. 한글 모스 부호는 <strong>한국산업표준(KS)이나 정부 고시로 정해진 것이 아닙니다.</strong> 법적 근거였던 「전보장정」(1888)은 1896년 「국내전보규칙」 제정으로 폐지됐고, 그 뒤로는 관행으로 이어져 왔어요. 그래서 사이트마다 ‘ㅐ·ㅔ’ 같은 모음이나 겹받침 분해 방식이 조금씩 다릅니다. 실제로 <strong>1888년 원 규정에는 자음 14 + 모음 10, 모두 24자만</strong> 있었고 ‘ㅐ·ㅔ’는 뒤에 덧붙은 것이라, 24자표만 싣거나 ‘ㅐ’를 ‘ㅏ+ㅣ’로 풀어 보내는 자료도 있습니다. 이 변환기는 ㅐ·ㅔ를 포함한 26자표를 씁니다.' },
]

export default function MorseCodePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>예술·창작</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="art" />모스 부호 · NATO 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        텍스트 ↔ <strong style={{ color: 'var(--text)' }}>모스 부호</strong>를 한글·영문으로 양방향 변환하고 <strong style={{ color: 'var(--text)' }}>소리로 재생</strong>합니다. NATO 음성 문자 철자 변환까지.
      </p>

      <UpdatedMeta
        date="2026년 8월"
        basis="ITU-R M.1677-1(모스 부호)·M.1172(약어)·ICAO Annex 10 Vol II(음성 문자) 기준"
        sources={[
          { label: 'ITU-R M.1677-1 국제 모스 부호', href: 'https://www.itu.int/rec/R-REC-M.1677/en' },
          { label: 'ITU-R M.1172 약어·신호', href: 'https://www.itu.int/rec/R-REC-M.1172/en' },
          { label: '국가등록문화재 「전보장정」 해설', href: 'https://www.heritage.go.kr/heri/cul/culSelectDetail.do?ccbaKdcd=79&ccbaAsno=05290000&ccbaCtcd=11' },
        ]}
      />

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
              <li><strong style={{ color: 'var(--text)' }}>한글 모스(국문 전신부호)</strong> — 김학우가 고안해 1888년 「전보장정」에 규정된 한국형 체계로, 자모 단위로 타전합니다.</li>
              <li><strong style={{ color: 'var(--text)' }}>SOS(S̅O̅S̅ ···−−−···)</strong> — 글자 사이를 띄우지 않고 이어 보내는 국제 조난 신호(1906년 베를린 협약).</li>
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
              겹자음(ㄲ·ㅆ 등)은 같은 자음을 두 번, 겹받침·겹모음(닭·과 등)은 구성 자모를 차례로 타전합니다. 표에 따로 부호가 없어서 그렇게 보내는 것이고, 1888년 규정에 명시된 방식은 아닌 <strong style={{ color: 'var(--text)' }}>널리 쓰이는 관행</strong>입니다. 표의 26자 가운데 <strong style={{ color: 'var(--text)' }}>ㅐ·ㅔ는 1888년 원 규정(24자)에 없던 후대 추가분</strong>이라 자료에 따라 빠지기도 합니다.
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
              물음표·쉼표 같은 문장부호도 국제 표준인 <strong style={{ color: 'var(--text)' }}>ITU-R 권고 M.1677-1</strong> §1.1.3에 부호가 정해져 있습니다. 물음표(··−−··)와 쉼표(−−··−−)는 점·선을 서로 뒤집은 <strong style={{ color: 'var(--text)' }}>거울 관계</strong>라 짝으로 외우면 쉽고, 마침표(·−·−·−)는 점·선이 번갈아 나오는 리듬입니다. 골뱅이(@ ·−−·−·)는 이메일 주소를 타전할 일이 생기면서 <strong style={{ color: 'var(--text)' }}>2004년 M.1677 초판</strong>에 정식 편입된 비교적 새 부호예요.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, margin: '0 0 14px' }}>
              반대로 느낌표(!)·세미콜론(;)·밑줄(_)·달러($)·<strong style={{ color: 'var(--text)' }}>앰퍼샌드(&amp;)</strong>는 ITU 표준 문서에 없는 관용 부호입니다. 특히 &amp;(·−···)는 ITU가 문자가 아니라 <strong style={{ color: 'var(--text)' }}>&lsquo;대기(Wait)&rsquo; 신호</strong>로만 정의한 부호를 관용적으로 문자에 갖다 쓴 것이라, 표준 통신에서는 문자 &amp;로 읽히지 않습니다. 이 변환기는 관용 부호도 함께 지원하되 그 구분을 밝혀 둡니다.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: '6px', marginBottom: '18px' }}>
              {EN_PUNCT.map((c) => (
                <div key={c} style={codeCell}><span style={chStyle}>{c}</span><span style={mcStyle}>{toBar(MORSE_EN[c])}</span></div>
              ))}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, margin: '0 0 10px' }}>
              <strong style={{ color: 'var(--text)' }}>절차신호(prosign)</strong>는 두 글자를 글자 간격 없이 붙여 하나의 신호로 보내는 운용 신호입니다. 예를 들어 AR은 A(·−)와 R(·−·)을 이어 ·−·−·가 되죠. ITU-R M.1172는 이를 두고 <strong style={{ color: 'var(--text)' }}>&ldquo;전신에서 글자 위에 그은 줄은 그 글자들을 하나의 신호로 보내라는 뜻&rdquo;</strong>이라고 각주로 밝힙니다 — S̅O̅S̅를 줄 하나로 묶어 적는 것도 같은 규칙이에요.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, margin: '0 0 10px' }}>
              아래 부호는 <strong style={{ color: 'var(--text)' }}>전부 ITU 표준</strong>입니다. 부호와 용도는 M.1677-1 §1.1.3·제2부가, 두 글자 약어는 M.1172 제II절이 정합니다. 흔히 &lsquo;아마추어무선 은어&rsquo;로 소개되지만 그렇지 않아요 — 다만 <strong style={{ color: 'var(--text)' }}>SK·HH라는 약칭만은</strong> ITU 문서에 없는 관행입니다.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {PROSIGNS.map((p) => (
                <div key={p.sign} style={{ ...codeCell, alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px 12px' }}>
                  <span style={{ ...chStyle, minWidth: '28px' }}>{p.sign}</span>
                  <span style={{ ...mcStyle, minWidth: '88px' }}>{p.code}</span>
                  <span style={{ fontSize: '11px', color: 'var(--accent-ink)', fontWeight: 600 }}>{p.itu}</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, flexBasis: '100%' }}>{p.mean}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '14px 0 0', lineHeight: 1.7 }}>
              M.1677-1 §1.1.3에는 이 밖에도 송신 시작(−·−·−)·수신 양해 Understood(···−·) 신호가 있고, 문자 쪽으로는 곱셈 기호 ×(−··−, 문자 X와 같은 부호)와 악상테귀 é(··−··)도 정의되어 있습니다. 분(′)·초(″) 기호는 아포스트로피 부호(·−−−−·)를 한 번 또는 두 번 써서 나타내며, 인용부호(·−··−·)를 초 기호로 쓰는 것은 금지됩니다(§3.5.1).
            </p>
          </div>
        </div>

        {/* NATO */}
        <div>
          <h2 style={sectionTitle}>🗣️ 음성 문자(NATO 포네틱 코드)란?</h2>
          <div style={{ ...card, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <p style={{ margin: '0 0 10px' }}>
              전화나 무전으로 영문 철자를 또렷이 전할 때 쓰는 국제 표준 단어들입니다. <strong style={{ color: 'var(--text)' }}>“B as in Bravo, D as in Delta”</strong>처럼 헷갈리는 글자를 단어로 풀어 말하죠. 흔히 &lsquo;NATO 음성기호&rsquo;라 부르지만 정식 명칭은 <strong style={{ color: 'var(--text)' }}>무선전화 철자 알파벳(Radiotelephony Spelling Alphabet, ICAO Annex 10 Vol II)</strong>입니다 — 국제음성기호(IPA)와는 전혀 다른 것이라 이 페이지는 &lsquo;음성 문자&rsquo;로 적습니다.
            </p>
            <p style={{ margin: '0 0 10px' }}>
              A는 alpha가 아니라 <strong style={{ color: 'var(--text)' }}>Alfa</strong>, J는 <strong style={{ color: 'var(--text)' }}>Juliett</strong>로 적습니다. ph를 f로 읽지 않는 언어권 화자를 고려해 f로 바꿨고, 프랑스어권이 어말 t를 묵음 처리하는 것을 막으려고 t를 겹쳤다는 것이 ICAO의 설명이에요.
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
              <strong style={{ color: 'var(--text)' }}>코흐(Koch) 방식</strong>은 루트비히 코흐(Ludwig Koch)가 1936년 브라운슈바이크 공대 학위논문에서 제시한 훈련법입니다. 핵심은 <strong style={{ color: 'var(--text)' }}>처음부터 점·선을 셀 수 없을 만큼 빠른 속도로 듣는 것</strong> — 코흐는 세는 습관이 생기는 임계 속도를 분당 50자(약 10 WPM)로 보고, 그보다 빠른 <strong style={{ color: 'var(--text)' }}>12 WPM</strong>을 훈련 속도로 제시했어요. K·M처럼 소리가 뚜렷이 다른 <strong style={{ color: 'var(--text)' }}>2글자</strong>로 시작해 정답률 90%를 넘기면 글자를 하나씩 추가하고, 모든 글자를 익힌 뒤 20 WPM까지 올립니다(요즘 코흐 트레이너는 대개 글자 속도 20 WPM을 기본값으로 씁니다).
            </p>
            <p style={{ margin: '0 0 10px' }}>
              <strong style={{ color: 'var(--text)' }}>판스워스(Farnsworth) 타이밍</strong>은 글자 하나하나는 빠른 속도의 리듬으로 보내되, 글자·단어 사이 간격만 길게 늘려 전체 속도를 낮추는 방식입니다. 이름의 유래로는 1950년대에 이 방식을 보급한 미국 아마추어무선사 판스워스(W6TTB)가 거론되는데, 그가 창안자인지는 자료마다 서술이 갈립니다. 오늘날 통용되는 기준은 ARRL 표준(Jon Bloom KE3Z, QEX 1990년 4월)으로, <strong style={{ color: 'var(--text)' }}>18 WPM 미만이면 글자를 18 WPM 타이밍으로 보내고 늘어난 지연을 글자 3 : 단어 7 비율로 나눕니다</strong>(18 WPM 이상은 표준 타이밍). 18 WPM이라는 경계는 ARRL이 표준을 세우며 고른 값입니다. 느린 속도로 배우면 점·선을 세는 습관이 굳어 나중에 리듬 인식으로 갈아타야 하는 정체 구간이 생기는데(흔히 말하는 <strong style={{ color: 'var(--text)' }}>‘13 WPM 장벽’</strong>), 이를 피할 수 있죠.
            </p>
            <p style={{ margin: 0 }}>
              이 도구의 <strong style={{ color: 'var(--text)' }}>WPM 슬라이더(5~30)</strong>로 비슷하게 연습할 수 있습니다. 단점 1개 길이는 1.2초 ÷ WPM(20 WPM이면 0.06초)이에요 — 다만 이 도구는 표준 타이밍이라 슬라이더의 WPM이 글자 속도이자 전체 속도이고, 판스워스에서는 이 값이 <strong style={{ color: 'var(--text)' }}>글자 속도</strong>만 가리킨다는 점이 다릅니다. ① 20 WPM 안팎에서 E(·)·T(−)처럼 쉬운 글자 한두 개를 반복 재생하며 소리로 구분하고 → ② 글자가 익으면 짧은 단어를 같은 속도로 듣고 → ③ 문장 전체는 10~13 WPM쯤에서 시작해 조금씩 올려 보세요.
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
