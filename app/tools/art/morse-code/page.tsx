import Link from 'next/link'
import MorseCodeClient from './MorseCodeClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import { MORSE_EN, MORSE_KO, NATO, encodeMorse } from './morseData'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/art/morse-code',
  title: '모스 부호 변환기 — 한글·영문 모스 + 소리 재생 + NATO 음성 문자',
  description:
    '텍스트를 모스 부호로, 모스 부호를 텍스트로 양방향 변환. 한글(국문 전신부호)·영문 모두 지원하고 소리로 재생합니다. NATO 음성 문자(Alfa·Bravo) 철자 변환과 ICAO 규정 발음표까지.',
  keywords: ['모스부호변환기', '모스부호', '한글모스부호', '모스부호표', 'SOS모스부호', 'NATO음성기호', '포네틱코드', '음성문자', 'morse code', '모스부호소리'],
})

const card: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: '18px 20px' }
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top' }
const rowStyle = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' }

const codeCell: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
  padding: '8px 12px', background: 'var(--bg3)', borderRadius: 'var(--radius-s)', border: '1px solid var(--border)',
}
const chStyle: React.CSSProperties = { fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '15px', color: 'var(--text)' }
const mcStyle: React.CSSProperties = { fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '14px', letterSpacing: '0.08em', fontWeight: 600 }

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

/* ── WPM 타이밍 표 — 도구의 재생 로직(MorseCodeClient play·playSeconds)과 같은 규칙으로 빌드 시 계산 ──
   단점 1 · 장점 3 · 부호 안 1 · 글자 사이 3 · 단어 사이 7단위, 1단위 = 1.2초 ÷ WPM(PARIS 50단위 기준) */
const morseUnits = (code: string): number => {
  let u = 0
  code.trim().split(/\s*\/\s*/).forEach((word, wi) => {
    if (wi > 0) u += 7
    word.split(/\s+/).filter(Boolean).forEach((letter, li) => {
      if (li > 0) u += 3
      ;[...letter].forEach((el, ei) => { if (ei > 0) u += 1; u += el === '-' ? 3 : 1 })
    })
  })
  return u
}
const DEMO_TEXT = '안녕하세요' // 도구의 기본 입력
const DEMO_CODE = encodeMorse(DEMO_TEXT, 'ko')
const DEMO_UNITS = morseUnits(DEMO_CODE)
const DEMO_JAMO = DEMO_CODE.split(/\s+/).filter(Boolean).length
const SOS_UNITS = morseUnits('...---...')        // 프로사인 — 글자 간격 없이 한 덩어리
const SOS_AS_LETTERS = morseUnits('... --- ...') // 글자 셋으로 띄워 보내면
const PARIS_UNITS = morseUnits(encodeMorse('PARIS', 'en')) // 뒤따르는 단어 간격 7단위 제외
const WPM_ROWS = [5, 7, 10, 13, 15, 18, 20, 25, 30]
const sec = (units: number, wpm: number) => (units * 1.2) / wpm

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
    <ToolPage width={760} slug="/tools/art/morse-code">
      <h1 className="tp-h1">
        <ToolIconBadge catId="art" />모스 부호 · NATO 변환기
      </h1>
      <p className="tp-lead">
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

      <div>

        {/* 모스 부호란 */}
        <div>
          <h2 className="g-h2">모스 부호, 한눈에</h2>
          <ul className="g-list">
            <li><strong>단점(·)·장점(−)</strong>의 조합으로 글자를 표현하는 신호 부호입니다.</li>
            <li><strong>길이 규칙</strong> — 단점 1, 장점 3, 부호 간격 1, 글자 간격 3, 단어 간격 7.</li>
            <li><strong>한글 모스(국문 전신부호)</strong> — 김학우가 고안해 1888년 「전보장정」에 규정된 한국형 체계로, 자모 단위로 타전합니다.</li>
            <li><strong>SOS(S̅O̅S̅ ···−−−···)</strong> — 글자 사이를 띄우지 않고 이어 보내는 국제 조난 신호(1906년 베를린 협약).</li>
          </ul>
        </div>

        {/* 한글 모스표 */}
        <div>
          <h2 className="g-h2">한글 모스 부호표 (국문 전신부호)</h2>
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
            <p className="g-note" style={{ marginTop: 16 }}>
              겹자음(ㄲ·ㅆ 등)은 같은 자음을 두 번, 겹받침·겹모음(닭·과 등)은 구성 자모를 차례로 타전합니다. 표에 따로 부호가 없어서 그렇게 보내는 것이고, 1888년 규정에 명시된 방식은 아닌 <strong style={{ color: 'var(--text)' }}>널리 쓰이는 관행</strong>입니다. 표의 26자 가운데 <strong style={{ color: 'var(--text)' }}>ㅐ·ㅔ는 1888년 원 규정(24자)에 없던 후대 추가분</strong>이라 자료에 따라 빠지기도 합니다.
            </p>
          </div>
          <h3 className="g-h3">받을 때 생기는 모호함 — 음절 경계가 없습니다</h3>
          <p className="g-p">
            한글 모스는 자모를 차례로 보낼 뿐 <strong style={{ color: 'var(--text)' }}>어디서 음절이 끊기는지는 보내지 않습니다.</strong> 그래서 받은 자모열이 여러 낱말로 읽힙니다 — <strong style={{ color: 'var(--text)' }}>ㅇ ㅏ ㄱ ㄱ ㅏ</strong>는 &lsquo;아까&rsquo;도 &lsquo;악가&rsquo;도 되고, 같은 모양의 <strong style={{ color: 'var(--text)' }}>ㄱ ㅜ ㄱ ㄱ ㅏ</strong>는 &lsquo;국가&rsquo;입니다. 구조만으로는 가릴 방법이 없어요(둘 다 모음 사이에 자음 두 개).
          </p>
          <p className="g-p">
            이 변환기는 <strong style={{ color: 'var(--text)' }}>받침을 먼저 붙이는 해석</strong>을 기본으로 내놓고, 달리 읽을 수 있으면 후보를 함께 보여 줍니다. 기본값을 이렇게 정한 것은 실제 한국어 산문 4,000낱말로 두 방식을 견줘 본 결과입니다 — 받침 우선이 <strong style={{ color: 'var(--text)' }}>99.0%</strong>, 된소리 초성 우선이 98.8%로, 후자는 &lsquo;있습니다 → 잇씁니다&rsquo;처럼 아주 흔한 낱말을 깨뜨렸습니다. 실제 전신에서도 수신자가 문맥으로 가려 읽었습니다.
          </p>
          <h3 className="g-h3">원본과 오늘날의 표가 다른 곳 — ㅡ·ㅣ</h3>
          <p className="g-p">
            1888년 「전보장정」의 <a href="https://cha.go.kr/cmm/fms/BoardFileDown.do?atchFileId=FILE_000000000001378&amp;bbsId=BBSMSTR_1019&amp;dwldHistYn=Y&amp;fileSn=1" style={{ color: 'var(--accent-ink)', textDecoration: 'underline' }} target="_blank" rel="noopener nofollow">원본 도판</a>(문화재청 2012년도 문화재위원회 근대문화재분과 제7차 회의록 46쪽 수록)을 확대해 보면, 모음 10자 가운데 여덟 자는 오늘날 표와 같지만 <strong style={{ color: 'var(--text)' }}>ㅡ와 ㅣ는 서로 반대</strong>입니다 — 원본은 <strong style={{ color: 'var(--text)' }}>ㅡ가 ··−, ㅣ가 −··</strong>인데 오늘날 통용되는 표는 ㅡ −··, ㅣ ··−예요. 도판의 모음 배열은 ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ 순이고, 아홉째 글자가 가로획(一)·열째가 세로획(丨)인 것이 획 모양으로 분명합니다.
          </p>
          <p className="g-p">
            언제 왜 바뀌었는지를 밝힌 자료는 찾지 못했습니다. 이 변환기는 다른 변환기·자료와 결과를 맞추기 위해 <strong style={{ color: 'var(--text)' }}>오늘날 통용되는 표</strong>를 씁니다. 한글 모스 부호가 법으로 정해진 표준이 아니라 관행으로 이어져 왔다는 점을 잘 보여 주는 대목이에요.
          </p>
        </div>

        {/* 영문 모스표 */}
        <div>
          <h2 className="g-h2">영문·숫자 모스 부호표</h2>
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
          <h2 className="g-h2">문장부호 부호표 + 절차신호(Prosign)</h2>
          <p className="g-p">
            물음표·쉼표 같은 문장부호도 국제 표준인 <strong style={{ color: 'var(--text)' }}>ITU-R 권고 M.1677-1</strong> §1.1.3에 부호가 정해져 있습니다. 물음표(··−−··)와 쉼표(−−··−−)는 점·선을 서로 뒤집은 <strong style={{ color: 'var(--text)' }}>거울 관계</strong>라 짝으로 외우면 쉽고, 마침표(·−·−·−)는 점·선이 번갈아 나오는 리듬입니다. 골뱅이(@ ·−−·−·)는 이메일 주소를 타전할 일이 생기면서 <strong style={{ color: 'var(--text)' }}>2004년 M.1677 초판</strong>에 정식 편입된 비교적 새 부호예요.
          </p>
          <p className="g-p">
            반대로 느낌표(!)·세미콜론(;)·밑줄(_)·달러($)·<strong style={{ color: 'var(--text)' }}>앰퍼샌드(&amp;)</strong>는 ITU 표준 문서에 없는 관용 부호입니다. 특히 &amp;(·−···)는 ITU가 문자가 아니라 <strong style={{ color: 'var(--text)' }}>&lsquo;대기(Wait)&rsquo; 신호</strong>로만 정의한 부호를 관용적으로 문자에 갖다 쓴 것이라, 표준 통신에서는 문자 &amp;로 읽히지 않습니다. 이 변환기는 관용 부호도 함께 지원하되 그 구분을 밝혀 둡니다.
          </p>
          <div style={{ ...card, marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: '6px' }}>
              {EN_PUNCT.map((c) => (
                <div key={c} style={codeCell}><span style={chStyle}>{c}</span><span style={mcStyle}>{toBar(MORSE_EN[c])}</span></div>
              ))}
            </div>
          </div>
          <p className="g-p">
            <strong style={{ color: 'var(--text)' }}>절차신호(prosign)</strong>는 두 글자를 글자 간격 없이 붙여 하나의 신호로 보내는 운용 신호입니다. 예를 들어 AR은 A(·−)와 R(·−·)을 이어 ·−·−·가 되죠. ITU-R M.1172는 이를 두고 <strong style={{ color: 'var(--text)' }}>&ldquo;전신에서 글자 위에 그은 줄은 그 글자들을 하나의 신호로 보내라는 뜻&rdquo;</strong>이라고 각주로 밝힙니다 — S̅O̅S̅를 줄 하나로 묶어 적는 것도 같은 규칙이에요.
          </p>
          <p className="g-p">
            아래 부호는 <strong style={{ color: 'var(--text)' }}>전부 ITU 표준</strong>입니다. 부호와 용도는 M.1677-1 §1.1.3·제2부가, 두 글자 약어는 M.1172 제II절이 정합니다. 흔히 &lsquo;아마추어무선 은어&rsquo;로 소개되지만 그렇지 않아요 — 다만 <strong style={{ color: 'var(--text)' }}>SK·HH라는 약칭만은</strong> ITU 문서에 없는 관행입니다.
          </p>
          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['약어', '부호', 'ITU 근거', '뜻·쓰임'].map((h) => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {PROSIGNS.map((p, i) => (
                  <tr key={p.sign} style={rowStyle(i)}>
                    <th scope="row" style={{ ...td, ...chStyle, fontSize: '14px', textAlign: 'left' }}>{p.sign}</th>
                    <td style={{ ...td, ...mcStyle, fontSize: '13px', whiteSpace: 'nowrap' }}>{p.code}</td>
                    <td style={{ ...td, color: 'var(--accent-ink)', fontSize: '12px', fontWeight: 600, minWidth: 140 }}>{p.itu}</td>
                    <td style={{ ...td, color: 'var(--muted)', lineHeight: 1.6, minWidth: 220 }}>{p.mean}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note" style={{ marginTop: 12 }}>
            M.1677-1 §1.1.3에는 이 밖에도 송신 시작(−·−·−)·수신 양해 Understood(···−·) 신호가 있고, 문자 쪽으로는 곱셈 기호 ×(−··−, 문자 X와 같은 부호)와 악상테귀 é(··−··)도 정의되어 있습니다. 분(′)·초(″) 기호는 아포스트로피 부호(·−−−−·)를 한 번 또는 두 번 써서 나타내며, 인용부호(·−··−·)를 초 기호로 쓰는 것은 금지됩니다(§3.5.1).
          </p>
        </div>

        {/* NATO */}
        <div>
          <h2 className="g-h2">음성 문자(NATO 포네틱 코드)란?</h2>
          <p className="g-p">
            전화나 무전으로 영문 철자를 또렷이 전할 때 쓰는 국제 표준 단어들입니다. <strong style={{ color: 'var(--text)' }}>“B as in Bravo, D as in Delta”</strong>처럼 헷갈리는 글자를 단어로 풀어 말하죠. 흔히 &lsquo;NATO 음성기호&rsquo;라 부르지만 정식 명칭은 <strong style={{ color: 'var(--text)' }}>무선전화 철자 알파벳(Radiotelephony Spelling Alphabet, ICAO Annex 10 Vol II)</strong>입니다 — 국제음성기호(IPA)와는 전혀 다른 것이라 이 페이지는 &lsquo;음성 문자&rsquo;로 적습니다.
          </p>
          <p className="g-p">
            A는 alpha가 아니라 <strong style={{ color: 'var(--text)' }}>Alfa</strong>, J는 <strong style={{ color: 'var(--text)' }}>Juliett</strong>로 적습니다. ph를 f로 읽지 않는 언어권 화자를 고려해 f로 바꿨고, 프랑스어권이 어말 t를 묵음 처리하는 것을 막으려고 t를 겹쳤다는 것이 ICAO의 설명이에요.
          </p>
          <p className="g-p">
            총 {NATO.filter((n) => /[A-Z]/.test(n.ch)).length}개 알파벳 + 숫자로 구성되며, <strong style={{ color: 'var(--text)' }}>콜센터·항공·예약번호·운송장 번호</strong> 확인에 특히 유용합니다. 위 도구의 NATO 모드에서 바로 변환해 보세요.
          </p>
        </div>

        {/* WPM 타이밍 표 */}
        <div>
          <h2 className="g-h2">속도(WPM)별 부호 길이 — 이 도구의 재생 타이밍</h2>
          <p className="g-p">
            모스 부호의 모든 길이는 단점 하나의 길이, 곧 <strong>1단위</strong>의 배수입니다. WPM은 기준 단어 PARIS를 1분에 몇 번 보내는지를 뜻하고, PARIS는 글자 부분 {PARIS_UNITS}단위에 뒤따르는 단어 간격 7단위를 더해 정확히 50단위이므로 <strong>1단위 = 60초 ÷ (50 × WPM) = 1.2초 ÷ WPM</strong>이 됩니다. 이 도구는 소리·빛을 재생할 때 이 값을 그대로 쓰고(판스워스처럼 간격만 늘리는 처리는 없음), 슬라이더 옆의 &lsquo;재생 길이&rsquo;도 같은 규칙으로 셉니다. 아래 표는 슬라이더 범위(5~30 WPM)의 주요 속도에서 계산한 값입니다.
          </p>
          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['WPM', '단점·부호 안 간격', '장점·글자 간격', '단어 간격', '분당 글자(PARIS 기준)', 'SOS 1회', `기본 입력 '${DEMO_TEXT}'`, '빛 점멸 최대'].map((h) => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {WPM_ROWS.map((w, i) => (
                  <tr key={w} style={rowStyle(i)}>
                    <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left' }}>{w}{w === 13 ? ' (기본)' : ''}</th>
                    <td style={td}>{Math.round(1200 / w)}ms</td>
                    <td style={td}>{Math.round(3600 / w)}ms</td>
                    <td style={td}>{Math.round(8400 / w)}ms</td>
                    <td style={td}>{w * 5}자</td>
                    <td style={td}>{sec(SOS_UNITS, w).toFixed(2)}초</td>
                    <td style={td}>{sec(DEMO_UNITS, w).toFixed(1)}초</td>
                    <td style={{ ...td, fontWeight: w / 2.4 > 3 ? 700 : 400 }}>{(w / 2.4).toFixed(1)}회/초</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note" style={{ marginTop: 12 }}>
            * 분당 글자는 PARIS(5글자)를 한 단어로 치는 명목값입니다. 빛 점멸은 단점이 연속될 때(켜짐 1 + 꺼짐 1단위)의 최대치로, 굵은 값은 WCAG 2.3.1이 제한하는 초당 3회를 넘습니다.
          </p>
          <p className="g-p" style={{ marginTop: 16 }}>
            표를 읽는 법을 예로 들면, 기본값 13 WPM에서 단점은 {Math.round(1200 / 13)}ms이고 기본 입력 &lsquo;{DEMO_TEXT}&rsquo;는 약 {sec(DEMO_UNITS, 13).toFixed(1)}초가 걸립니다. 한글은 한 음절이 보통 자모 2~4개로 나뉘어 타전되므로 5음절이 자모 {DEMO_JAMO}개, {DEMO_UNITS}단위가 됩니다. 같은 다섯 글자인 PARIS의 글자 부분({PARIS_UNITS}단위)보다 약 {(DEMO_UNITS / PARIS_UNITS).toFixed(1)}배 길어서, 같은 WPM이라도 한글 문장은 영문보다 체감 속도가 훨씬 느립니다.
          </p>
          <p className="g-p">
            SOS는 점 3·선 3·점 3을 글자 간격 없이 이어 보내는 한 덩어리라 {SOS_UNITS}단위이고, S·O·S 세 글자로 띄워 보내면 글자 간격 두 번이 끼어 {SOS_AS_LETTERS}단위가 됩니다. 도구의 SOS 버튼은 앞의 방식으로 재생하므로 20 WPM에서 {sec(SOS_UNITS, 20).toFixed(2)}초, 글자로 띄우면 {sec(SOS_AS_LETTERS, 20).toFixed(2)}초입니다. 빛 재생은 점멸이 빠른 만큼 광과민성 위험이 있어 기본으로 꺼 두었고, 초당 3회 이하를 지키려면 약 7 WPM 이하로 낮춰야 합니다.
          </p>
        </div>

        {/* 학습법 */}
        <div>
          <h2 className="g-h2">모스 학습법 — 코흐 방식과 판스워스 타이밍</h2>
          <p className="g-p">
            <strong style={{ color: 'var(--text)' }}>코흐(Koch) 방식</strong>은 루트비히 코흐(Ludwig Koch)가 1936년 브라운슈바이크 공대 학위논문에서 제시한 훈련법입니다. 핵심은 <strong style={{ color: 'var(--text)' }}>처음부터 점·선을 셀 수 없을 만큼 빠른 속도로 듣는 것</strong> — 코흐는 세는 습관이 생기는 임계 속도를 분당 50자(약 10 WPM)로 보고, 그보다 빠른 <strong style={{ color: 'var(--text)' }}>12 WPM</strong>을 훈련 속도로 제시했어요. K·M처럼 소리가 뚜렷이 다른 <strong style={{ color: 'var(--text)' }}>2글자</strong>로 시작해 정답률 90%를 넘기면 글자를 하나씩 추가하고, 모든 글자를 익힌 뒤 20 WPM까지 올립니다(요즘 코흐 트레이너는 대개 글자 속도 20 WPM을 기본값으로 씁니다).
          </p>
          <p className="g-p">
            <strong style={{ color: 'var(--text)' }}>판스워스(Farnsworth) 타이밍</strong>은 글자 하나하나는 빠른 속도의 리듬으로 보내되, 글자·단어 사이 간격만 길게 늘려 전체 속도를 낮추는 방식입니다. 이름의 유래로는 1950년대에 이 방식을 보급한 미국 아마추어무선사 판스워스(W6TTB)가 거론되는데, 그가 창안자인지는 자료마다 서술이 갈립니다. 오늘날 통용되는 기준은 ARRL 표준(Jon Bloom KE3Z, QEX 1990년 4월)으로, <strong style={{ color: 'var(--text)' }}>18 WPM 미만이면 글자를 18 WPM 타이밍으로 보내고 늘어난 지연을 글자 3 : 단어 7 비율로 나눕니다</strong>(18 WPM 이상은 표준 타이밍). 18 WPM이라는 경계는 ARRL이 표준을 세우며 고른 값입니다. 느린 속도로 배우면 점·선을 세는 습관이 굳어 나중에 리듬 인식으로 갈아타야 하는 정체 구간이 생기는데(흔히 말하는 <strong style={{ color: 'var(--text)' }}>‘13 WPM 장벽’</strong>), 이를 피할 수 있죠.
          </p>
          <p className="g-p">
            이 도구의 <strong style={{ color: 'var(--text)' }}>WPM 슬라이더(5~30)</strong>로 비슷하게 연습할 수 있습니다. 단점 1개 길이는 1.2초 ÷ WPM(20 WPM이면 0.06초)이에요 — 다만 이 도구는 표준 타이밍이라 슬라이더의 WPM이 글자 속도이자 전체 속도이고, 판스워스에서는 이 값이 <strong style={{ color: 'var(--text)' }}>글자 속도</strong>만 가리킨다는 점이 다릅니다. ① 20 WPM 안팎에서 E(·)·T(−)처럼 쉬운 글자 한두 개를 반복 재생하며 소리로 구분하고 → ② 글자가 익으면 짧은 단어를 같은 속도로 듣고 → ③ 문장 전체는 10~13 WPM쯤에서 시작해 조금씩 올려 보세요.
          </p>
        </div>

        {/* FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* 관련 도구 */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
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
    </ToolPage>
  )
}
