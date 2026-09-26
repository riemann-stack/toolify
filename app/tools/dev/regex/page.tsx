import Link from 'next/link'
import RegexClient from './RegexClient'
import { PATTERNS, formatLangSnippet, type LangId } from './regexUtils'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/dev/regex',
  title: '정규식 테스트기 — 매칭·캡처 그룹·치환·정규식 패턴 30+',
  description: 'JavaScript 정규식 실시간 매칭·하이라이트 + 캡처 그룹·치환·분할 + 6 flags + 정규식 패턴 30+(한국 데이터 10종: 휴대폰·주민번호·사업자번호 등).',
  keywords: [
    '정규식 테스트', '정규식 테스터', 'regex 테스터', 'regex tester',
    '정규식 매칭', '정규식 캡처 그룹', '정규식 치환', '정규식 분할',
    'JavaScript regex', 'JS 정규식', '자바스크립트 정규식',
    '한국 휴대폰 정규식', '주민번호 정규식', '사업자번호 정규식', '우편번호 정규식',
    '정규식 치트시트', '정규식 메타문자', 'lookahead', 'lookbehind',
    '한글 정규식', 'regex flags', 'g i m s u y',
    'catastrophic backtracking',
  ],
})

const TH: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', fontSize: 13, verticalAlign: 'top' }
const ROW: React.CSSProperties = { borderBottom: '1px solid var(--border)' }
const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 12 }
const codeStyle: React.CSSProperties = {
  background: 'var(--bg3)',
  padding: '2px 6px',
  borderRadius: 'var(--radius-xs)',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
}
const PRE: React.CSSProperties = { background: 'var(--bg2)', padding: '8px 12px', borderRadius: 'var(--radius-xs)', fontSize: 12, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }

const FAQ_LD = [
  {
    q: 'JavaScript 정규식과 PCRE·Python 정규식은 무엇이 다른가요?',
    a: '본 도구는 브라우저에 내장된 <strong>JavaScript(ECMAScript) 정규식 엔진</strong>으로 실행합니다. 다른 엔진에서 가져온 패턴이 안 될 때 주로 걸리는 차이는 다음과 같습니다. • <strong>lookbehind</strong> <code>(?&lt;=…)</code>: JS는 가변 길이도 허용하지만 Python <code>re</code>는 고정 길이만 받습니다. • <strong>atomic group</strong> <code>(?&gt;…)</code>·<strong>possessive</strong> <code>a*+</code>: PCRE·Java·Python 3.11+ <code>re</code>에는 있지만 JS에는 없습니다. <strong>재귀</strong> <code>(?R)</code>는 PCRE(Perl 계열) 전용입니다. • <strong>이름 그룹 표기</strong>: JS·PCRE <code>(?&lt;name&gt;…)</code>, Python <code>(?P&lt;name&gt;…)</code>. • <strong>유니코드 속성</strong> <code>\\p{…}</code>: JS는 <code>u</code>(또는 <code>v</code>) flag가 있어야 동작합니다. • <strong>인라인 flag</strong>: 패턴 맨 앞의 <code>(?i)</code> 같은 전역 인라인 flag는 Python·Java·PCRE에서만 되고 JS에서는 쓸 수 없습니다(ES2025부터 <code>(?i:…)</code>처럼 일부 구간에만 i·m·s를 거는 문법은 표준이 됐지만, 구형 브라우저에서는 오류). 그래서 치환 탭의 코드 스니펫은 flag를 언어별 표기로 바꿔 줍니다.',
  },
  {
    q: 'greedy(.*)와 lazy(.*?)의 차이는?',
    a: '<strong>greedy</strong>(<code>.*</code>, 기본값)는 가능한 한 길게, <strong>lazy</strong>(<code>.*?</code>)는 가능한 한 짧게 매치합니다. 입력 <code>&lt;b&gt;hello&lt;/b&gt;&lt;i&gt;world&lt;/i&gt;</code>에서 <code>&lt;.*&gt;</code>는 문자열 전체 1개를, <code>&lt;.*?&gt;</code>는 <code>&lt;b&gt;</code>·<code>&lt;/b&gt;</code>·<code>&lt;i&gt;</code>·<code>&lt;/i&gt;</code> 4개를 각각 매치합니다. 구분자 사이의 짧은 구간을 잡을 때는 lazy가 맞지만, <strong>중첩된 태그·괄호는 정규식만으로 정확히 파싱할 수 없습니다</strong> — HTML은 DOMParser, JSON은 JSON.parse 같은 파서를 쓰세요.',
  },
  {
    q: '캡처 그룹과 비캡처 그룹의 차이?',
    a: '<strong>캡처 그룹</strong> <code>(…)</code>은 매치한 부분을 기억해 치환에서 <code>$1</code>·<code>$2</code>로, 패턴 안에서 <code>\\1</code>로 다시 참조할 수 있습니다. <strong>비캡처 그룹</strong> <code>(?:…)</code>은 묶기만 하고 기억하지 않습니다. 비캡처 그룹을 쓰면 번호가 꼭 필요한 그룹에만 매겨져 <code>$1</code>이 가리키는 대상이 명확해집니다. 예: <code>(?:https?|ftp):\\/\\/(\\w+)</code> — 프로토콜은 묶기만 하고 호스트 첫 단어만 <code>$1</code>로 캡처합니다.',
  },
  {
    q: '이름 캡처 그룹(named group)은 어떻게 쓰나요?',
    a: 'ES2018에 추가된 문법으로, 그룹에 이름을 붙여 번호 대신 이름으로 꺼냅니다. <code>(?&lt;year&gt;\\d{4})-(?&lt;month&gt;\\d{2})-(?&lt;day&gt;\\d{2})</code>로 <code>2026-05-15</code>를 매치하면 <code>match.groups.year</code>가 <code>"2026"</code>이 되고, 치환 문자열에서는 <code>$&lt;year&gt;년</code>처럼 씁니다. 이름 그룹도 번호가 매겨지므로 <code>$1</code>로도 참조됩니다. 그룹을 추가·삭제해도 번호가 밀리지 않아 긴 패턴일수록 유지보수가 쉬워집니다.',
  },
  {
    q: 'lookahead와 lookbehind는?',
    a: '위치만 검사하고 글자를 소비하지 않는 <strong>폭 0 어서션</strong>입니다. <code>(?=…)</code> 뒤가 …일 때, <code>(?!…)</code> 뒤가 …이 아닐 때, <code>(?&lt;=…)</code> 앞이 …일 때, <code>(?&lt;!…)</code> 앞이 …이 아닐 때 매치합니다. 예: <code>\\d+(?=원)</code>에 <code>1000원, 2000$</code>를 주면 <code>1000</code>만 매치되고 <code>원</code>은 결과에 포함되지 않습니다. 비밀번호 규칙의 <code>(?=.*\\d)(?=.*[A-Z])</code>처럼 조건을 여러 개 겹칠 때도 씁니다.',
  },
  {
    q: 'flags g와 y의 차이는?',
    a: '둘 다 <code>lastIndex</code> 위치부터 매치를 시도하지만, <strong>g</strong>는 그 위치에서 실패하면 뒤로 한 칸씩 옮겨 가며 계속 찾고, <strong>y</strong>(sticky)는 <strong>정확히 그 위치에서만</strong> 시도합니다. 입력 <code>foo bar</code>에서 <code>lastIndex = 3</code>이면 <code>/bar/g</code>는 4번 위치의 bar를 찾지만 <code>/bar/y</code>는 3번 위치가 공백이라 실패합니다. y는 &lsquo;현재 위치에서 다음 토큰이 무엇인가&rsquo;를 확인하는 토크나이저·파서 작성에 씁니다.',
  },
  {
    q: 'u flag가 왜 필요한가요?',
    a: 'u flag가 없으면 JS 정규식은 문자열을 UTF-16 코드 단위로 봅니다. 그래서 이모지처럼 기본 다국어 평면(BMP) 밖 문자는 <code>.</code> 하나에 매치되지 않고(😀는 코드 단위 2개), <code>\\p{L}</code>은 유니코드 속성이 아니라 글자 <code>p{L}</code>로 해석돼 <strong>오류 없이 엉뚱한 결과</strong>가 나옵니다. u를 켜면 <code>\\p{L}</code>(모든 문자), <code>\\p{N}</code>(숫자), <code>\\p{Script=Hangul}</code>(한글 문자 체계), <code>\\p{Extended_Pictographic}</code>(그림 이모지)를 쓸 수 있습니다. 대신 u 모드는 문법이 엄격해 <code>\\-</code> 같은 불필요한 이스케이프를 오류로 처리합니다.',
  },
  {
    q: '한글·이모지 매칭은 어떻게 하나요?',
    a: '완성형 한글 음절은 <code>[가-힣]</code>(U+AC00~U+D7A3, 11,172자)이 표준입니다. 자음·모음 낱자(ㅋㅋ, ㅠㅠ)는 <code>[ㄱ-ㅎㅏ-ㅣ]</code>로 따로 넣어야 하고, 옛한글까지 넓히려면 <code>\\p{Script=Hangul}</code>(u flag)를 씁니다. 주의할 점은 <strong><code>\\w</code>와 <code>\\b</code>가 한글을 인식하지 못한다</strong>는 것입니다 — JS의 <code>\\w</code>는 u flag를 켜도 <code>[A-Za-z0-9_]</code>뿐이라 <code>/\\b한글\\b/</code>는 &lsquo;나는 한글 좋아&rsquo;에서도 실패합니다. 한글 단어 경계는 <code>(?&lt;![가-힣])한글(?![가-힣])</code>처럼 lookaround로 만드세요. 이모지는 <code>\\p{Emoji}</code>가 숫자 0~9·#·*까지 포함하므로 <code>\\p{Extended_Pictographic}</code>을 쓰고, 국기·피부톤·ZWJ 조합은 패턴 라이브러리의 이모지 패턴처럼 결합 문자까지 묶어야 한 덩어리로 잡힙니다.',
  },
  {
    q: '주민등록번호·카드번호를 정규식으로 검증하면 충분한가요?',
    a: '<strong>아니요. 정규식은 자릿수·구분자 같은 형식만 봅니다.</strong> 주민등록번호 패턴은 991399처럼 없는 날짜도 통과시키고, 2020년 10월 이후 새로 부여된 번호는 성별 자리 뒤 6자리가 임의번호라 예전 검증번호(체크섬) 공식이 맞지 않으므로 체크섬으로 거르면 정상 번호를 떨어뜨립니다. 카드번호는 Luhn 체크섬과 발급사 식별번호(BIN) 확인이 따로 필요합니다. 법적으로는 「개인정보 보호법 시행령」 제19조가 주민등록번호·여권번호·운전면허번호·외국인등록번호를 <strong>고유식별정보</strong>로 정하고, 주민등록번호는 법령 근거가 있을 때만 처리할 수 있으며 암호화해 보관해야 합니다(같은 법 제24조의2). 카드번호는 고유식별정보는 아니지만 결제 정보라 업계 보안 기준(PCI DSS)에 따라 저장하지 않거나 토큰화하는 것이 일반적입니다. 실제 서비스에서는 수집 자체가 필요한지부터 검토하세요.',
  },
  {
    q: '정규식이 너무 느려요 (catastrophic backtracking)',
    a: '<code>(a+)+$</code>처럼 <strong>반복 안에 반복</strong>이 있고 같은 글자를 여러 방식으로 나눠 가질 수 있으면, 매치에 실패하는 입력에서 엔진이 가능한 분할을 모두 시도해 시간이 입력 길이에 지수적으로 늘어납니다. 해결책은 ① 중첩 반복 제거 — <code>(a+)+</code> → <code>a+</code>, ② 분기끼리 겹치지 않게 — <code>(a|aa)+</code> → <code>a+</code>, ③ 구분자를 빼는 문자 클래스 — <code>".*"</code> → <code>"[^"]*"</code>, ④ JS에 없는 atomic group 대신 <code>(?=(a+))\\1</code>처럼 lookahead+역참조로 되돌아가기를 막기입니다. <strong>lazy(<code>+?</code>)로 바꾸는 것은 해결책이 아닙니다</strong> — 시도 순서만 바뀔 뿐 실패하는 입력에서는 똑같이 모든 경우를 탐색합니다. 본 도구는 정규식을 별도 작업 스레드(Web Worker)에서 실행해 1초가 넘으면 중단하고, 100ms를 넘기면 경고하며, 입력 100KB·매치 1만 개로 제한합니다.',
  },
]

/* 한국 데이터 패턴 — PATTERNS(패턴 라이브러리와 같은 데이터)에서 패턴·예시를 가져와 빌드 시 통과 여부를 계산 */
const KR_LIMITS: Record<string, { counter: string; miss: string }> = {
  'ko-mobile': { counter: '010-12345678', miss: '010만 허용(01X 옛 번호 거부). 하이픈이 한쪽에만 있는 표기도 통과' },
  'ko-tel': { counter: '010-1234-5678', miss: '휴대폰 번호도 통과(0 + 두 자리 규칙). 1588 같은 전국대표번호는 거부' },
  'ko-rrn': { counter: '991399-1234567', miss: '생년월일 유효성 미검사. 1800년대 출생(9·0)은 거부. 2020.10 이후 번호는 체크섬 규칙 없음' },
  'ko-frn': { counter: '000000-5000000', miss: '생년월일 유효성 미검사 — 자릿수와 7번째 자리(5~8)만 확인' },
  'ko-biz': { counter: '000-00-00000', miss: '마지막 자리 검증번호(앞 9자리로 계산) 미검사' },
  'ko-corp': { counter: '000000-0000000', miss: '마지막 자리 검증번호 미검사 — 13자리 숫자면 통과' },
  'ko-zip': { counter: '99999', miss: '5자리 숫자면 모두 통과 — 실제 구역번호인지는 주소 DB로 확인' },
  'ko-car': { counter: '999힣9999', miss: '번호판에 쓰지 않는 한글도 통과. 지역명 구형 번호판(서울12가1234)·공백 표기는 거부' },
  'ko-card': { counter: '0000-0000-0000-0001', miss: 'Luhn 체크섬 미검사. 16자리 전용이라 15자리 카드(4-6-5)는 거부' },
  'ko-account': { counter: '1234567', miss: '은행마다 자릿수가 달라 7~20자리 숫자면 대부분 통과 — 은행·예금주 조회가 별도로 필요' },
}
const KR_ROWS = PATTERNS.filter((p) => p.category === 'korean').map((p) => {
  const re = new RegExp(p.pattern, p.flags)
  const lim = KR_LIMITS[p.id]
  return { id: p.id, name: p.name, pattern: p.pattern, example: p.example, exampleOk: re.test(p.example), counter: lim?.counter ?? '', counterOk: lim ? re.test(lim.counter) : false, miss: lim?.miss ?? '' }
})

/* 치환 토큰 — 같은 입력·정규식에 토큰만 바꿔 String.prototype.replace를 빌드 시 실행한 결과 */
const TOKEN_INPUT = 'abc-123-xyz'
const TOKEN_RE = new RegExp('(\\d)(?<rest>\\d+)') // 리터럴은 tsconfig target(ES2017)에서 이름 그룹 문법 오류
const TOKENS: [string, string][] = [
  ['$&', '매치 전체'],
  ['$1', '1번 그룹'],
  ['$2', '2번 그룹 (이름 그룹도 번호를 가짐)'],
  ['$<rest>', '이름 그룹'],
  ['$`', '매치 앞부분 전체'],
  ["$'", '매치 뒷부분 전체'],
  ['$$', '달러 기호 자체'],
]
const TOKEN_ROWS = TOKENS.map(([tok, desc]) => ({ tok, desc, out: TOKEN_INPUT.replace(TOKEN_RE, `[${tok}]`) }))

/* 언어별 치환 코드 — 치환 탭의 코드 스니펫과 같은 함수(formatLangSnippet)로 생성 */
const SNIP_PATTERN = '(?<y>\\d{4})-(?<m>\\d{2})-(?<d>\\d{2})'
const SNIP_REPL = '$<y>년 $<m>월 $<d>일'
const SNIP_INPUT = '2026-09-26, 2027-01-05'
const SNIP_OUT = SNIP_INPUT.replace(new RegExp(SNIP_PATTERN, 'g'), SNIP_REPL)
const LANG_LABEL: Record<LangId, string> = { js: 'JavaScript', python: 'Python', java: 'Java', php: 'PHP' }
const SNIPPETS = (['js', 'python', 'java', 'php'] as const).map((l) => ({ lang: LANG_LABEL[l], code: formatLangSnippet(l, SNIP_PATTERN, 'g', 'replace', SNIP_REPL) }))

export default function RegexPage() {
  return (
    <ToolPage width={880} slug="/tools/dev/regex">
      <h1 className="tp-h1">
        <ToolIconBadge catId="dev" />정규식 테스트기
      </h1>
      <p className="tp-lead">
        JavaScript 정규식 실시간 매칭·하이라이트 + 캡처·치환·분할 + <strong style={{ color: 'var(--text)' }}>정규식 패턴 30+ (한국 데이터 10종)</strong>.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="ECMAScript 정규식(브라우저 내장 엔진) 문법 기준 · 주민등록번호 부여체계 개편(2020.10) · 개인정보 보호법 시행령 제19조"
        sources={[
          { label: 'MDN 정규 표현식 안내서', href: 'https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Regular_expressions' },
          { label: 'ECMA-262 (ECMAScript 명세)', href: 'https://tc39.es/ecma262/' },
          { label: 'OWASP ReDoS', href: 'https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS' },
          { label: '개인정보 보호법 시행령 제19조', href: 'https://www.law.go.kr/법령/개인정보보호법시행령/제19조' },
          { label: '행정안전부 주민번호 부여체계 개편', href: 'https://www.korea.kr/briefing/policyBriefingView.do?newsId=148872723' },
        ]}
      />

      <Callout tone="warn" title="개인정보 검증은 정규식만으로 끝내지 마세요">
        정규식 매칭은 모두 브라우저에서 실행되며 입력 데이터는 외부로 전송되지 않습니다. 주민등록번호·카드번호 패턴은 형식만 확인하므로 실제 서비스의 검증·저장은 관련 법령과
        KISA·OWASP 가이드를 따르세요. 잘못된 정규식이 브라우저를 멈추지 않도록 별도 스레드에서 실행하고 <strong>입력 100KB · 매치 1만 개 · 실행 1초</strong>로 제한합니다.
        분야별 안전 안내는 <Link href="/disclaimer#dev">면책조항</Link> 참고.
      </Callout>

      <RegexClient />

      <GuideDivider />

      {/* 1. 사용법 */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <ol className="g-list">
        <li><strong>매칭</strong> — 정규식·flags·테스트 문자열을 넣으면 매치를 하이라이트하고, 매치마다 위치(인덱스)·길이·캡처 그룹·이름 그룹을 카드로 보여 줍니다.</li>
        <li><strong>치환·분할</strong> — 같은 정규식으로 치환(<code style={codeStyle}>$1</code>·<code style={codeStyle}>$&amp;</code>·<code style={codeStyle}>{'$<name>'}</code>) 또는 split 결과를 보고, JavaScript·Python·Java·PHP 코드 스니펫을 복사합니다.</li>
        <li><strong>패턴 라이브러리</strong> — 한국 데이터 10종(휴대폰·주민등록번호·사업자등록번호·우편번호 등)과 이메일·URL·UUID·HTML·마크다운 등 30여 개. 누르면 바로 적용됩니다.</li>
        <li><strong>치트시트</strong> — 메타문자·양화 한정자·문자 클래스·그룹·룩어라운드·flags를 한 표로.</li>
      </ol>
      <p className="g-note">
        정규식·flags·치환 패턴은 이 브라우저에 자동 저장되고, 테스트 문자열은 개인정보가 들어갈 수 있어 저장하지 않습니다. 입력이 바뀌면 200ms 뒤 다시 계산합니다.
      </p>

      {/* 2. 기본 문법 */}
      <h2 className="g-h2">정규식 기본 — 메타문자·양화 한정자</h2>
      <p className="g-p">
        정규식은 <strong>무엇을</strong>(메타문자·문자 클래스) <strong>몇 번</strong>(양화 한정자) 찾을지의 조합입니다. 한국어 텍스트를 다룰 때는 <code style={codeStyle}>\w</code>·<code style={codeStyle}>\d</code>가
        ASCII 전용이라는 점이 가장 흔한 함정입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
          <thead>
            <tr style={ROW}>
              {['구문', '의미', '예시', '한국어 텍스트 주의점'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ['.', '줄바꿈을 뺀 글자 1개', '.+ → "abc"', 'u flag 없으면 이모지는 2글자로 취급'],
              ['\\d', '숫자 [0-9]', '\\d{3} → "123"', '전각 숫자 １２３은 불일치'],
              ['\\w', '단어 문자 [A-Za-z0-9_]', '\\w+@ → "user@"', '한글은 포함되지 않음 (u flag여도 동일)'],
              ['\\s', '공백·탭·줄바꿈 등', '\\s+ → "   "', '전각 공백(U+3000)·NBSP도 포함'],
              ['\\b', '단어 경계', '\\bcat\\b', '\\w 기준이라 한글 단어 경계로 못 씀'],
              ['^ $', '시작·끝 (m flag면 각 줄)', '^abc$', '—'],
              ['* + ?', '0회 이상 · 1회 이상 · 0~1회', 'colou?r → "color"', '—'],
              ['{n,m}', 'n~m회', '\\d{2,4}', '—'],
              ['*? +?', '가능한 적게 (lazy)', '<.*?> → 태그 하나씩', '—'],
            ].map((r) => (
              <tr key={r[0]} style={ROW}>
                <th scope="row" style={{ ...TD, textAlign: 'left' }}><code style={codeStyle}>{r[0]}</code></th>
                <td style={TD}>{r[1]}</td>
                <td style={{ ...TD, ...MONO, color: 'var(--muted)' }}>{r[2]}</td>
                <td style={{ ...TD, color: 'var(--muted)', fontSize: 12 }}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. 캡처 그룹 */}
      <h2 className="g-h2">캡처 그룹 — 번호 그룹 · 이름 그룹 · 비캡처 그룹</h2>
      <p className="g-p">
        괄호로 묶으면 그 부분을 따로 꺼내거나 치환에서 다시 쓸 수 있습니다. 번호는 여는 괄호 <code style={codeStyle}>(</code>가 나오는 순서대로 1번부터 매겨집니다.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10, marginTop: 4 }}>
        {[
          {
            t: '번호 캡처 그룹 (...)', d: '$1, $2 … 로 참조. 패턴 안에서는 \\1로 같은 글자 반복을 찾을 수 있습니다.',
            code: '패턴: (\\w+)@(\\w+\\.\\w+)\n매치: "hello@example.com"\n$1 = "hello"\n$2 = "example.com"\n치환 "$2/$1" → "example.com/hello"',
          },
          {
            t: '이름 캡처 그룹 (?<name>...)', d: '$<name>으로 참조(ES2018+). 그룹을 추가해도 참조가 밀리지 않습니다.',
            code: '패턴: (?<user>\\w+)@(?<domain>\\w+\\.\\w+)\n매치: "hello@example.com"\ngroups.user   = "hello"\ngroups.domain = "example.com"',
          },
          {
            t: '비캡처 그룹 (?:...)', d: '묶기만 하고 번호를 매기지 않아, 필요한 그룹만 $1·$2를 차지합니다.',
            code: '패턴: (?:https?|ftp):\\/\\/(\\w+)\n매치: "https://example.com"\n$1 = "example" (호스트 첫 단어만 캡처)',
          },
        ].map((c) => (
          <div key={c.t} style={{ background: 'var(--bg3)', borderLeft: '3px solid var(--accent)', borderRadius: 'var(--radius-s)', padding: '12px 16px' }}>
            <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 6px', color: 'var(--accent-ink)' }}>{c.t}</p>
            <p style={{ fontSize: 13, color: 'var(--text)', margin: '0 0 6px', lineHeight: 1.7 }}>{c.d}</p>
            <pre style={PRE}>{c.code}</pre>
          </div>
        ))}
      </div>

      {/* 4. 치환 토큰 */}
      <h2 className="g-h2">치환 문자열의 $ 토큰 — 실행 결과로 보기</h2>
      <p className="g-p">
        치환 탭은 JavaScript <code style={codeStyle}>String.prototype.replace</code> 규칙을 그대로 따릅니다. 아래 표는 입력 <code style={codeStyle}>{TOKEN_INPUT}</code>에
        정규식 <code style={codeStyle}>{String(TOKEN_RE)}</code>를 적용하고 치환 문자열을 <code style={codeStyle}>[토큰]</code>으로 바꿔 가며 실제로 실행한 결과입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr style={ROW}>
              {['토큰', '의미', '실행 결과'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {TOKEN_ROWS.map((r) => (
              <tr key={r.tok} style={ROW}>
                <th scope="row" style={{ ...TD, textAlign: 'left' }}><code style={codeStyle}>{r.tok}</code></th>
                <td style={TD}>{r.desc}</td>
                <td style={{ ...TD, ...MONO, color: 'var(--accent-ink)' }}>{r.out}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        같은 치환을 다른 언어로 옮기면 참조 표기가 달라집니다. 패턴 <code style={codeStyle}>{SNIP_PATTERN}</code>, 치환 <code style={codeStyle}>{SNIP_REPL}</code>, g flag로
        치환 탭이 만들어 주는 코드는 다음과 같고, <code style={codeStyle}>{SNIP_INPUT}</code>은 <strong>{SNIP_OUT}</strong>이 됩니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr style={ROW}>
              {['언어', '생성 코드'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {SNIPPETS.map((s) => (
              <tr key={s.lang} style={ROW}>
                <th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{s.lang}</th>
                <td style={{ ...TD, ...MONO, overflowWrap: 'anywhere' }}>{s.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        Python은 이름 그룹을 <code style={codeStyle}>(?P&lt;name&gt;…)</code>, 참조를 <code style={codeStyle}>\g&lt;name&gt;</code>으로 쓰고, PHP의 <code style={codeStyle}>preg_replace</code>는
        치환 문자열에서 이름 참조를 지원하지 않아 번호(<code style={codeStyle}>{'${1}'}</code>)로 바뀝니다. Java는 g flag 대신 <code style={codeStyle}>replaceAll</code>/<code style={codeStyle}>replaceFirst</code>로 구분합니다.
      </p>

      {/* 5. flags */}
      <h2 className="g-h2">flags 6종 상세</h2>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
          <thead>
            <tr style={ROW}>
              {['flag', '이름', '설명', '예시'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ['g', '전역(Global)', '첫 매치에서 멈추지 않고 모든 매치를 찾음', 'matchAll·전체 치환'],
              ['i', '대소문자 무시', 'A와 a를 같은 글자로 취급', '/hello/i → "HELLO"'],
              ['m', '다중행(Multiline)', '^과 $가 문자열 전체가 아니라 각 줄의 시작·끝에 매치', '/^#/gm → 마크다운 제목 줄'],
              ['s', 'dotAll', '.이 줄바꿈까지 매치', '/<p>.*<\\/p>/s → 여러 줄 단락'],
              ['u', 'Unicode', '코드 포인트 단위 처리 + \\p{…} 유니코드 속성', '/\\p{Script=Hangul}+/u'],
              ['y', 'Sticky', 'lastIndex 위치에서만 매치 시도', '토크나이저·파서'],
            ].map((r) => (
              <tr key={r[0]} style={ROW}>
                <th scope="row" style={{ ...TD, textAlign: 'left' }}><code style={{ ...codeStyle, color: 'var(--accent-ink)', fontWeight: 700 }}>{r[0]}</code></th>
                <td style={{ ...TD, fontWeight: 600 }}>{r[1]}</td>
                <td style={TD}>{r[2]}</td>
                <td style={{ ...TD, ...MONO, color: 'var(--muted)' }}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        최신 JavaScript에는 매치 위치를 그룹별로 돌려주는 <code style={codeStyle}>d</code>(hasIndices, ES2022)와 문자 클래스의 차집합·교집합을 지원하는 <code style={codeStyle}>v</code>(unicodeSets, ES2024)도 있습니다.
        본 도구는 위 6종만 선택할 수 있으므로, 두 flag가 필요한 패턴은 브라우저 개발자 도구 콘솔에서 확인하세요.
      </p>

      {/* 6. 한국 데이터 패턴 한계 */}
      <h2 className="g-h2">한국 데이터 패턴 10종 — 통과해도 틀릴 수 있는 값</h2>
      <p className="g-p">
        패턴 라이브러리의 한국 데이터 패턴은 <strong>입력 형식</strong>을 거르는 1차 필터입니다. 아래 표의 &lsquo;반례&rsquo;는 형식은 맞지만 실제로는 유효하지 않은 값으로,
        각 패턴에 넣어 빌드 때 직접 실행한 결과입니다. 이런 값까지 막으려면 날짜 검사·검증번호 계산·외부 조회를 코드로 추가해야 합니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr style={ROW}>
              {['패턴', '정규식', '예시', '반례', '정규식이 확인하지 않는 것'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {KR_ROWS.map((r) => (
              <tr key={r.id} style={ROW}>
                <th scope="row" style={{ ...TD, textAlign: 'left', fontWeight: 600 }}>{r.name}</th>
                <td style={{ ...TD, ...MONO, overflowWrap: 'anywhere', minWidth: 150 }}>{r.pattern}</td>
                <td style={{ ...TD, ...MONO, whiteSpace: 'nowrap' }}>{r.example} <span style={{ color: r.exampleOk ? 'var(--success)' : 'var(--danger)' }}>{r.exampleOk ? '통과' : '거부'}</span></td>
                <td style={{ ...TD, ...MONO, whiteSpace: 'nowrap' }}>{r.counter} <span style={{ color: r.counterOk ? 'var(--warning)' : 'var(--success)' }}>{r.counterOk ? '통과' : '거부'}</span></td>
                <td style={{ ...TD, color: 'var(--muted)', fontSize: 12 }}>{r.miss}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        주민등록번호는 2020년 10월부터 새로 부여·변경되는 번호의 뒷자리가 성별 1자리 + 임의번호 6자리로 바뀌었습니다. 예전 번호용 검증번호 공식으로 거르면 새 번호를 잘못 거부하게 됩니다.
      </p>

      {/* 7. Catastrophic backtracking */}
      <h2 className="g-h2">Catastrophic Backtracking — 정규식이 멈추는 이유</h2>
      <p className="g-p">
        JavaScript 정규식 엔진은 실패하면 되돌아가(backtrack) 다른 분할을 시도합니다. <code style={codeStyle}>(a+)+$</code>에 a 25개와 느낌표를 주면, a들을 안쪽·바깥쪽 반복에 나눠 담는 방법이
        2<sup>24</sup>가지 넘게 있고 엔진은 그 전부를 시도한 뒤에야 실패를 선언합니다. 입력이 한 글자 늘 때마다 시간이 약 2배가 되므로, 서버에서 사용자 입력에 이런 정규식을 쓰면
        서비스 거부(ReDoS) 공격에 노출됩니다. 본 도구는 정규식을 별도 작업 스레드(Web Worker)에서 돌려 <strong>1초가 넘으면 자동 중단</strong>합니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
          <thead>
            <tr style={ROW}>
              {['위험 패턴', '문제', '안전한 대체'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ['(a+)+$', '반복 안의 반복 — 분할 경우의 수가 지수적', 'a+$'],
              ['(a|aa)+$', '두 분기가 같은 글자열을 서로 다르게 나눠 가짐', 'a+$'],
              ['(\\w+\\s?)+$', '공백이 선택적이라 단어 경계를 어디서든 나눌 수 있음', '\\w+(?:\\s\\w+)*$'],
              ['"(.*)*"', '빈 문자열도 매치하는 그룹을 반복', '"[^"]*"'],
            ].map((r) => (
              <tr key={r[0]} style={ROW}>
                <th scope="row" style={{ ...TD, textAlign: 'left' }}><code style={{ ...codeStyle, color: 'var(--danger)' }}>{r[0]}</code></th>
                <td style={TD}>{r[1]}</td>
                <td style={TD}><code style={{ ...codeStyle, color: 'var(--success)' }}>{r[2]}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="g-list" style={{ marginTop: 16 }}>
        <li><strong>lazy로 바꾸는 것은 해결책이 아닙니다</strong> — <code style={codeStyle}>(a+?)+?$</code>도 실패하는 입력에서는 같은 경우의 수를 모두 탐색합니다. 탐색 순서만 달라질 뿐입니다.</li>
        <li><strong>atomic group 흉내</strong> — JS에는 <code style={codeStyle}>(?&gt;…)</code>가 없지만 <code style={codeStyle}>(?=(a+))\1</code>처럼 lookahead로 잡은 뒤 역참조로 소비하면 그 부분은 되돌아가지 않습니다.</li>
        <li><strong>입력 길이 제한</strong> — 서버 측 정규식은 입력 길이 상한과 실행 시간 제한을 함께 두세요. 지수 시간 패턴도 입력이 짧으면 문제가 드러나지 않아 테스트에서 놓치기 쉽습니다.</li>
      </ul>

      <Faq items={FAQ_LD} />

      {/* 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {[
          { href: '/tools/dev/hash', icon: '🔒', name: '해시 생성기', desc: 'MD5·SHA·HMAC·파일 무결성' },
          { href: '/tools/dev/base64', icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트·파일 ↔ Base64' },
          { href: '/tools/dev/json', icon: '📋', name: 'JSON 포맷터', desc: 'JSON 정렬·압축·유효성 검사' },
        ].map((t) => (
          <Link key={t.href} href={t.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
            <p style={{ fontSize: 22, margin: '0 0 4px' }}>{t.icon}</p>
            <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>{t.name}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{t.desc}</p>
          </Link>
        ))}
      </div>
    </ToolPage>
  )
}
