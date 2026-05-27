import Link from 'next/link'
import RegexClient from './RegexClient'
import { buildMetadata } from '@/lib/seo'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/dev/regex',
  title: '정규식 테스트기 — 매칭·캡처 그룹·치환·한국 데이터 패턴 30+',
  description: 'JavaScript 정규식 실시간 매칭·하이라이트 + 캡처 그룹·치환·분할 + 6 flags + 한국 데이터 패턴 30+(휴대폰·주민번호·사업자번호).',
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
const codeStyle: React.CSSProperties = {
  background: 'var(--bg3)',
  padding: '2px 6px',
  borderRadius: '4px',
  fontFamily: 'Syne, SF Mono, Consolas, monospace',
  fontSize: '12.5px',
}

const FAQ_LD = [
  { "q":"JavaScript 정규식과 PCRE/Python의 차이는?","a":"본 도구는 JavaScript regex 엔진(브라우저 네이티브)을 사용합니다. 다른 엔진과 차이: • 가변폭 lookbehind: JS는 가변폭 지원 (모던 브라우저), PCRE는 고정폭만 • Atomic group : PCRE 전용, JS 미지원 • 재귀 패턴 : PCRE 전용 • Verbose flag re.X: Python 전용 (한 줄에 모두 작성) • Possessive quantifier a*+: PCRE 전용 • 유니코드 속성 {`\\\\p`}: JS는 u flag 필수, PCRE는 항상 가능" },
  { "q":"greedy(.*)와 lazy(.*?)의 차이는?","a":"greedy(.*)는 가능한 한 많이 매치하려 합니다(기본값). lazy(.*?)는 가능한 한 적게 매치합니다. 예시 — 입력 : • (greedy) → 전체 매치 = • (lazy) → 4번 매치 = , , , HTML 태그·JSON 키 추출 등 중첩 가능한 데이터는 lazy가 안전합니다." },
  { "q":"캡처 그룹과 비캡처 그룹의 차이?","a":"캡처 그룹 (...)는 매치한 부분을 저장해 $1·$2로 참조 가능. 비캡처 그룹 (?:...)는 그룹화만 하고 저장 안 함. 비캡처 그룹을 쓰는 이유: • 성능 ↑ — 메모리·시간 절약 • 그룹 번호 절약 — $1·$2 등이 진짜 필요한 그룹만 차지 예: — 프로토콜은 그룹화만, 도메인만 $1로 캡처" },
  { "q":"이름 캡처 그룹 (?<name>...)이란?","a":"ES2018부터 추가된 기능으로, 그룹에 이름을 붙여 가독성을 높입니다. 예시: {`패턴: (?\\\\d)-(?\\\\d)-(?\\\\d) 매치: \"2026-05-15\" match.groups.year = \"2026\" match.groups.month = \"05\" match.groups.day = \"15\" 치환: \"$년 $월 $일\"`} $1·$2·$3처럼 번호로 셀 필요 없이 의미 있는 이름으로 접근 — 코드 가독성 ↑." },
  { "q":"lookahead와 lookbehind는?","a":"매치 위치를 검사만 하고 소비(consume)하지 않는 zero-width 어서션입니다. • Lookahead 양수 (?=...) — 뒤가 ...일 때 매치 • Lookahead 음수 (?!...) — 뒤가 ...아닐 때 매치 • Lookbehind 양수 (?<=...) — 앞이 ...일 때 매치 • Lookbehind 음수 (?<!...) — 앞이 ...아닐 때 매치 예시 — 가격 추출(원 앞 숫자만): + 입력 1000원, 2000$ → 1000만 매치 (2000은 뒤가 $이라 제외). 비밀번호 검증의 도 lookahead 활용." },
  { "q":"flags g와 y의 차이는?","a":"• g (Global) — matchAll·replace로 모든 매치 찾기. 어디서든 매치 가능. • y (Sticky) — regex.lastIndex 위치에서 정확히 매치 시도. 그 위치에서 매치 안 되면 실패. 차이 예: 입력 foo bar, lastIndex=4 • /bar/g → 4번 인덱스부터 검색 → 매치 (4-7) • /bar/y → 4번 인덱스에서 정확히 매치 → 매치 (4-7) 하지만 lastIndex=3이면: • /bar/g → 3번부터 검색 → 매치 (4-7) • /bar/y → 3번에 \"bar\"가 없음 → 실패 y flag는 토큰화·파서 작성 시 유용 (현재 위치만 검사)." },
  { "q":"flags u 플래그가 왜 필요한가요?","a":"유니코드 인식 모드를 켭니다. 한글·이모지·기타 BMP 외 문자를 정확히 매치해요. u flag 없을 때 문제: • 이모지(서로게이트 페어) → 한 글자가 두 코드 단위로 분리됨 • {`\\\\p`} 유니코드 속성 매칭 → 오류 u flag 사용 시 가능: • {`\\\\p`} — 이모지 • {`\\\\p`} — 모든 문자 (Letter) • {`\\\\p`} — 숫자 (Number) • {`\\\\p`} — 한글 스크립트 한글·이모지 정확 매칭이 필요하면 u flag 거의 필수입니다." },
  { "q":"한글·이모지 매칭은 어떻게 하나요?","a":"한글 매칭: • 완성형 한글: — 가장 일반적 • 자모 분리: — 초성·중성 • 유니코드 속성: {`\\\\p`} (u flag 필수) — 옛한글 포함 이모지 매칭: • 기본: {`\\\\p`} (u flag 필수) • 피부톤·복합 이모지: {`\\\\p`} 또는 {`\\\\p`} • 주의: 가족 이모지 같은 ZWJ 시퀀스는 정규식만으론 정확히 한 단위로 매치 어려움 본 도구의 [📚 패턴 라이브러리]에서 한글·자모·한자·이모지 패턴을 클릭으로 적용 가능합니다." },
  { "q":"주민번호·카드번호 검증 정규식 안전한가요?","a":"형식만 검증할 뿐 실제 유효성은 보장하지 않습니다. • 주민번호 — 형식 검증 외 체크섬(7자리 검증 알고리즘) + 출생연도·성별 코드 일관성 검증 필수 • 카드번호 — Luhn 알고리즘으로 체크섬 검증 + 카드사 BIN 확인 필요 • 사업자등록번호 — 자체 체크섬 (마지막 자리 검증) 개인정보 처리 시 주의: • 「개인정보 보호법」상 주민번호·카드번호는 고유식별정보 — 수집·저장·전송 시 암호화 의무 • 실 운영에서는 토큰화·마스킹 권장 (직접 저장 금지) • 본 도구의 패턴은 형식 검증 어림이며, 실제 검증·저장은 KISA·OWASP 가이드 + 검증 알고리즘(체크섬) + 안전한 암호화 절차가 추가로 필요합니다. 면책조항 참조." },
  { "q":"정규식이 너무 느려요 (catastrophic backtracking)","a":"중첩된 양화 한정자가 있으면 입력 길이에 지수적으로 시간이 늘어납니다. 위험 패턴: • — a N개 + ! 입력 시 2^N 시도 • — 분기 백트래킹 폭발 • — 무한 분기 해결 방법: 1. 중첩 양화 한정자 제거 — → 2. 분기 명확화 — 대신 {`a`} 3. 구체적 character class — 대신 4. lazy 양화 한정자 — 본 도구는 100ms 초과 시 ⚠️ 경고를 표시하며, 입력 100KB · 매치 1만 개로 자동 제한합니다." }
]

export default function RegexPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        개발자
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔍 정규식 테스트기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        JavaScript 정규식 실시간 매칭·하이라이트 + 캡처·치환·분할 + <strong style={{ color: 'var(--text)' }}>한국 데이터 패턴 30+</strong>.
      </p>

      {/* 면책 박스 */}
      <div style={{
        background: 'rgba(255, 138, 62, 0.06)',
        border: '1px solid rgba(255, 138, 62, 0.40)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '32px',
      }}>
        <p style={{ fontSize: '12.5px', color: 'var(--text)', lineHeight: 1.75, margin: 0 }}>
          ⚠️ 본 도구의 정규식 매칭은 모두 <strong>브라우저에서 실행</strong>되며 입력 데이터는 외부로 전송되지 않습니다.
          주민번호·카드번호 등 <strong>개인정보를 다룰 때는 본 도구가 아닌 KISA·OWASP 가이드</strong>를 따른 안전한 검증 절차를 사용하세요.
          잘못된 정규식은 브라우저를 일시 정지시킬 수 있습니다 (catastrophic backtracking) —{' '}
          <strong>입력 100KB · 매치 1만 개 · 실행 시간 자동 제한</strong>. 분야별 안전 안내는 <Link href="/disclaimer#dev" style={{ color: 'var(--accent)' }}>면책조항</Link> 참고.
        </p>
      </div>

      <RegexClient />

      {/* 1. 사용법 */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>탭 1 매칭</strong> — 정규식 + flags + 테스트 문자열 → 하이라이트 + 매치 카드(인덱스·길이·캡처 그룹·이름 그룹) 자동 표시</li>
          <li><strong>탭 2 치환·분할</strong> — 같은 정규식·flags로 치환($1·$&·$<code>{`<name>`}</code>) 또는 split 결과 + JS/Python/Java/PHP 코드 스니펫 자동 생성</li>
          <li><strong>탭 3 패턴 라이브러리</strong> — 한국 휴대폰·주민번호·사업자번호·우편번호 + 이메일·URL·UUID·HTML·마크다운 등 30+ 카드. 클릭 시 자동 적용</li>
          <li><strong>탭 4 치트시트</strong> — 메타문자·양화한정자·문자클래스·그룹·앵커·룩어라운드·flags 6종 + JS regex 한계 + 흔한 실수</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 정규식·flags·테스트 문자열·치환 패턴은 자동 저장됩니다. 200ms 디바운스로 입력 변화 시 즉시 재계산.
        </p>
      </div>

      {/* 2. 정규식 기본 — 메타문자·양화한정자 */}
      <h2 style={sectionTitle}>📘 정규식 기본 — 메타문자·양화한정자</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          정규식은 <strong>패턴(메타문자) + 반복(양화한정자)</strong>의 조합입니다. 가장 자주 쓰는 것부터 익히세요.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>구문</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>의미</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>예시</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['.',     '줄바꿈 외 모든 글자', '.+ → "abc"'],
                ['\\d',   '숫자 [0-9]',          '\\d{3} → "123"'],
                ['\\w',   '단어 문자',           '\\w+@ → "user@"'],
                ['\\s',   '공백',                '\\s+ → "   "'],
                ['^ $',   '시작·끝 앵커',        '^abc$ → "abc" 전체 매치'],
                ['*',     '0회 이상 (greedy)',   'a* → "", "a", "aaa"'],
                ['+',     '1회 이상',            '\\d+ → "1", "12", "123"'],
                ['?',     '0/1회',               'colou?r → "color", "colour"'],
                ['{n,m}', 'n~m회',               '\\d{2,4} → 2~4자리 숫자'],
                ['*?',    '0회+ (lazy)',         '<.*?> → 짧은 매치'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px' }}><code style={codeStyle}>{row[0]}</code></td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)' }}>{row[1]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--muted)', fontFamily: 'Syne, monospace', fontSize: 12 }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong>greedy vs lazy</strong> — <code style={codeStyle}>.*</code>는 가능한 많이 매치(욕심), <code style={codeStyle}>.*?</code>는 가능한 적게 매치(게으름). HTML/JSON 추출에 lazy가 안전합니다.
        </p>
      </div>

      {/* 3. 캡처 그룹 */}
      <h2 style={sectionTitle}>🪪 캡처 그룹 — 인덱스 vs 이름 그룹</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          그룹은 <strong>괄호 ()</strong>로 감싸 만듭니다. 매치된 부분을 따로 추출하거나 치환에 참조할 수 있어요.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginTop: 14 }}>
          <div style={{ background: 'var(--bg3)', borderLeft: '3px solid #0EA5E9', borderRadius: 8, padding: '12px 16px' }}>
            <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 6px', color: '#0EA5E9' }}>1. 인덱스 캡처 그룹 (...)</p>
            <p style={{ fontSize: 13, color: 'var(--text)', margin: '0 0 6px', lineHeight: 1.7 }}>
              번호로 참조 (<code style={codeStyle}>$1</code>, <code style={codeStyle}>$2</code>, ...). 위치 순서대로 자동 번호.
            </p>
            <pre style={{ background: 'var(--bg2)', padding: '8px 12px', borderRadius: 6, fontSize: 12, color: 'var(--text)', margin: 0, fontFamily: 'Syne, monospace' }}>
{`패턴: (\\w+)@(\\w+\\.\\w+)
매치: "hello@example.com"
$1 = "hello"
$2 = "example.com"
치환 패턴 "$2/$1" → "example.com/hello"`}
            </pre>
          </div>
          <div style={{ background: 'var(--bg3)', borderLeft: '3px solid #0D9488', borderRadius: 8, padding: '12px 16px' }}>
            <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 6px', color: '#0D9488' }}>2. 이름 캡처 그룹 (?&lt;name&gt;...)</p>
            <p style={{ fontSize: 13, color: 'var(--text)', margin: '0 0 6px', lineHeight: 1.7 }}>
              이름으로 참조 (<code style={codeStyle}>{`$<user>`}</code>). 가독성 ↑, ES2018+ 표준.
            </p>
            <pre style={{ background: 'var(--bg2)', padding: '8px 12px', borderRadius: 6, fontSize: 12, color: 'var(--text)', margin: 0, fontFamily: 'Syne, monospace' }}>
{`패턴: (?<user>\\w+)@(?<domain>\\w+\\.\\w+)
매치: "hello@example.com"
groups.user   = "hello"
groups.domain = "example.com"`}
            </pre>
          </div>
          <div style={{ background: 'var(--bg3)', borderLeft: '3px solid #D97706', borderRadius: 8, padding: '12px 16px' }}>
            <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 6px', color: '#D97706' }}>3. 비캡처 그룹 (?:...)</p>
            <p style={{ fontSize: 13, color: 'var(--text)', margin: '0 0 6px', lineHeight: 1.7 }}>
              그룹화만 하고 캡처는 하지 않음. <strong>성능 ↑·번호 절약</strong>.
            </p>
            <pre style={{ background: 'var(--bg2)', padding: '8px 12px', borderRadius: 6, fontSize: 12, color: 'var(--text)', margin: 0, fontFamily: 'Syne, monospace' }}>
{`패턴: (?:https?|ftp):\\/\\/(\\w+)
매치: "https://example.com"
$1 = "example" (도메인만 캡처)
프로토콜은 그룹화만 됨`}
            </pre>
          </div>
        </div>
      </div>

      {/* 4. flags 6종 */}
      <h2 style={sectionTitle}>🚩 flags 6종 상세</h2>
      <div style={card}>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 540 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>flag</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>이름</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>설명</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>예시</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['g', '전역(Global)',     '모든 매치 찾기 (한 번이 아닌 모든 위치)',     'matchAll·전체 치환'],
                ['i', '대소문자 무시',    'A=a 동일 취급',                              '/Hello/i → "hello", "HELLO"'],
                ['m', '다중행(Multiline)', '^과 $가 각 줄 시작·끝에도 매치',             '/^#/gm → 마크다운 헤더'],
                ['s', 'dotAll',           '. 메타문자가 줄바꿈도 매치',                  '/<.*>/s → 여러 줄 HTML'],
                ['u', 'Unicode',          '한글·이모지·\\p{...} 유니코드 속성 매칭',     '/\\p{Emoji}/u → 😀'],
                ['y', 'Sticky',           'lastIndex 위치에서만 매치 시도',              '토큰화·파싱'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px' }}><code style={{ ...codeStyle, color: '#0EA5E9', fontWeight: 700 }}>{row[0]}</code></td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontWeight: 600 }}>{row[1]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)' }}>{row[2]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--muted)', fontFamily: 'Syne, monospace', fontSize: 11.5 }}>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Catastrophic backtracking */}
      <h2 style={sectionTitle}>⚡ Catastrophic Backtracking 주의</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          잘못된 정규식은 <strong>지수적 시간 복잡도</strong>로 브라우저·서버를 멈출 수 있습니다.
          본 도구는 <strong>입력 100KB · 매치 1만 개 · 실행 시간 측정</strong> 3중 안전망을 제공합니다.
        </p>
        <div style={{ background: 'rgba(219, 39, 119, 0.06)', border: '1px solid #DB2777', borderRadius: 10, padding: '14px 16px', marginTop: 14 }}>
          <p style={{ fontSize: 13, color: '#DB2777', fontWeight: 700, margin: '0 0 8px' }}>🚨 위험 패턴 사례</p>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
            <li><code style={codeStyle}>{`(a+)+$`}</code> + <code style={codeStyle}>aaaaaaaaaaaaa!</code> — 매치 시도 2^N</li>
            <li><code style={codeStyle}>{`(a|aa)+$`}</code> — 분기 백트래킹 폭발</li>
            <li><code style={codeStyle}>{`(.*)*`}</code> — 무한 분기</li>
            <li><code style={codeStyle}>{`(\\w+\\s?)+$`}</code> — 긴 입력 시 멈춤</li>
          </ul>
        </div>
        <div style={{ background: 'rgba(14, 165, 233, 0.06)', border: '1px solid #0EA5E9', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 13, color: '#0EA5E9', fontWeight: 700, margin: '0 0 8px' }}>✅ 안전한 대체 패턴</p>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
            <li>중첩 양화 한정자 피하기 — <code style={codeStyle}>{`(a+)+`}</code> → <code style={codeStyle}>{`a+`}</code></li>
            <li>분기는 가능한 한 명확하게 — <code style={codeStyle}>{`(?:foo|bar)`}</code></li>
            <li>가능하면 lazy 사용 — <code style={codeStyle}>{`.*?`}</code></li>
            <li>구체적인 character class — <code style={codeStyle}>{`[^"]+`}</code> like</li>
            <li>입력 길이 제한 (서버에서도 100KB·1MB 권장)</li>
          </ul>
        </div>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. JavaScript 정규식과 PCRE/Python의 차이는?</summary>
        <p style={faqAnswer}>
          본 도구는 <strong>JavaScript regex 엔진</strong>(브라우저 네이티브)을 사용합니다. 다른 엔진과 차이:<br />
          • <strong>가변폭 lookbehind</strong>: JS는 가변폭 지원 (모던 브라우저), PCRE는 고정폭만<br />
          • <strong>Atomic group</strong> <code>{`(?>...)`}</code>: PCRE 전용, JS 미지원<br />
          • <strong>재귀 패턴</strong> <code>{`(?R)`}</code>: PCRE 전용<br />
          • <strong>Verbose flag</strong> <code>re.X</code>: Python 전용 (한 줄에 모두 작성)<br />
          • <strong>Possessive quantifier</strong> <code>a*+</code>: PCRE 전용<br />
          • <strong>유니코드 속성</strong> <code>{`\\p{...}`}</code>: JS는 <strong>u flag 필수</strong>, PCRE는 항상 가능
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. greedy(.*)와 lazy(.*?)의 차이는?</summary>
        <p style={faqAnswer}>
          <strong>greedy(.*)</strong>는 가능한 한 <strong>많이</strong> 매치하려 합니다(기본값). <strong>lazy(.*?)</strong>는 가능한 한 <strong>적게</strong> 매치합니다.<br />
          예시 — 입력 <code style={codeStyle}>{`<b>hello</b><i>world</i>`}</code>:<br />
          • <code style={codeStyle}>{`<.*>`}</code> (greedy) → 전체 매치 = <code style={codeStyle}>{`<b>hello</b><i>world</i>`}</code><br />
          • <code style={codeStyle}>{`<.*?>`}</code> (lazy) → 4번 매치 = <code style={codeStyle}>{`<b>`}</code>, <code style={codeStyle}>{`</b>`}</code>, <code style={codeStyle}>{`<i>`}</code>, <code style={codeStyle}>{`</i>`}</code><br />
          HTML 태그·JSON 키 추출 등 <strong>중첩 가능한 데이터</strong>는 lazy가 안전합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 캡처 그룹과 비캡처 그룹의 차이?</summary>
        <p style={faqAnswer}>
          <strong>캡처 그룹</strong> <code style={codeStyle}>(...)</code>는 매치한 부분을 저장해 <code style={codeStyle}>$1</code>·<code style={codeStyle}>$2</code>로 참조 가능.<br />
          <strong>비캡처 그룹</strong> <code style={codeStyle}>(?:...)</code>는 그룹화만 하고 저장 안 함.<br />
          <strong>비캡처 그룹을 쓰는 이유</strong>:<br />
          • <strong>성능 ↑</strong> — 메모리·시간 절약<br />
          • <strong>그룹 번호 절약</strong> — <code style={codeStyle}>$1</code>·<code style={codeStyle}>$2</code> 등이 진짜 필요한 그룹만 차지<br />
          예: <code style={codeStyle}>{`(?:https?|ftp):\\/\\/(\\w+)`}</code> — 프로토콜은 그룹화만, 도메인만 <code style={codeStyle}>$1</code>로 캡처
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 이름 캡처 그룹 (?&lt;name&gt;...)이란?</summary>
        <div style={faqAnswer}>
          ES2018부터 추가된 기능으로, 그룹에 <strong>이름</strong>을 붙여 가독성을 높입니다.<br />
          예시:<br />
          <pre style={{ background: 'var(--bg3)', padding: '8px 12px', borderRadius: 6, fontSize: 12, fontFamily: 'Syne, monospace', color: 'var(--text)', marginTop: 6 }}>
{`패턴: (?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})
매치: "2026-05-15"
match.groups.year   = "2026"
match.groups.month  = "05"
match.groups.day    = "15"
치환: "$<year>년 $<month>월 $<day>일"`}
          </pre>
          <code style={codeStyle}>$1·$2·$3</code>처럼 번호로 셀 필요 없이 의미 있는 이름으로 접근 — 코드 가독성 ↑.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. lookahead와 lookbehind는?</summary>
        <p style={faqAnswer}>
          <strong>매치 위치를 검사만 하고 소비(consume)하지 않는</strong> zero-width 어서션입니다.<br />
          • <strong>Lookahead 양수</strong> <code style={codeStyle}>(?=...)</code> — 뒤가 ...일 때 매치<br />
          • <strong>Lookahead 음수</strong> <code style={codeStyle}>(?!...)</code> — 뒤가 ...아닐 때 매치<br />
          • <strong>Lookbehind 양수</strong> <code style={codeStyle}>(?&lt;=...)</code> — 앞이 ...일 때 매치<br />
          • <strong>Lookbehind 음수</strong> <code style={codeStyle}>(?&lt;!...)</code> — 앞이 ...아닐 때 매치<br />
          예시 — 가격 추출(원 앞 숫자만):<br />
          <code style={codeStyle}>{`\\d+(?=원)`}</code> + 입력 <code style={codeStyle}>1000원, 2000$</code> → <strong>1000만 매치</strong> (2000은 뒤가 $이라 제외).<br />
          비밀번호 검증의 <code style={codeStyle}>{`(?=.*\\d)(?=.*[A-Z])`}</code>도 lookahead 활용.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. flags g와 y의 차이는?</summary>
        <p style={faqAnswer}>
          • <strong>g (Global)</strong> — <code>matchAll</code>·<code>replace</code>로 <strong>모든 매치</strong> 찾기. 어디서든 매치 가능.<br />
          • <strong>y (Sticky)</strong> — <code>regex.lastIndex</code> 위치에서 <strong>정확히</strong> 매치 시도. 그 위치에서 매치 안 되면 실패.<br />
          <strong>차이 예</strong>: 입력 <code style={codeStyle}>foo bar</code>, lastIndex=4<br />
          • <code style={codeStyle}>/bar/g</code> → 4번 인덱스부터 검색 → 매치 (4-7)<br />
          • <code style={codeStyle}>/bar/y</code> → 4번 인덱스에서 정확히 매치 → 매치 (4-7)<br />
          하지만 lastIndex=3이면:<br />
          • <code style={codeStyle}>/bar/g</code> → 3번부터 검색 → 매치 (4-7)<br />
          • <code style={codeStyle}>/bar/y</code> → 3번에 &quot;bar&quot;가 없음 → <strong>실패</strong><br />
          y flag는 <strong>토큰화·파서</strong> 작성 시 유용 (현재 위치만 검사).
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. flags u 플래그가 왜 필요한가요?</summary>
        <p style={faqAnswer}>
          <strong>유니코드 인식 모드</strong>를 켭니다. 한글·이모지·기타 BMP 외 문자를 정확히 매치해요.<br />
          <strong>u flag 없을 때 문제</strong>:<br />
          • 이모지(서로게이트 페어) → 한 글자가 두 코드 단위로 분리됨<br />
          • <code style={codeStyle}>{`\\p{...}`}</code> 유니코드 속성 매칭 → <strong>오류</strong><br />
          <strong>u flag 사용 시 가능</strong>:<br />
          • <code style={codeStyle}>{`\\p{Emoji}`}</code> — 이모지<br />
          • <code style={codeStyle}>{`\\p{L}`}</code> — 모든 문자 (Letter)<br />
          • <code style={codeStyle}>{`\\p{N}`}</code> — 숫자 (Number)<br />
          • <code style={codeStyle}>{`\\p{Script=Hangul}`}</code> — 한글 스크립트<br />
          한글·이모지 정확 매칭이 필요하면 <strong>u flag 거의 필수</strong>입니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 한글·이모지 매칭은 어떻게 하나요?</summary>
        <p style={faqAnswer}>
          <strong>한글 매칭</strong>:<br />
          • <strong>완성형 한글</strong>: <code style={codeStyle}>{`[가-힣]`}</code> — 가장 일반적<br />
          • <strong>자모 분리</strong>: <code style={codeStyle}>{`[ㄱ-ㅎㅏ-ㅣ]`}</code> — 초성·중성<br />
          • <strong>유니코드 속성</strong>: <code style={codeStyle}>{`\\p{Script=Hangul}`}</code> (u flag 필수) — 옛한글 포함<br />
          <strong>이모지 매칭</strong>:<br />
          • <strong>기본</strong>: <code style={codeStyle}>{`\\p{Emoji}`}</code> (u flag 필수)<br />
          • <strong>피부톤·복합 이모지</strong>: <code style={codeStyle}>{`\\p{Emoji_Presentation}`}</code> 또는 <code style={codeStyle}>{`\\p{Extended_Pictographic}`}</code><br />
          • <strong>주의</strong>: 가족 이모지 같은 ZWJ 시퀀스는 정규식만으론 정확히 한 단위로 매치 어려움<br />
          본 도구의 [📚 패턴 라이브러리]에서 한글·자모·한자·이모지 패턴을 클릭으로 적용 가능합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 주민번호·카드번호 검증 정규식 안전한가요?</summary>
        <p style={faqAnswer}>
          <strong>형식만</strong> 검증할 뿐 실제 유효성은 보장하지 않습니다.<br />
          • <strong>주민번호</strong> — 형식 검증 외 <strong>체크섬(7자리 검증 알고리즘)</strong> + 출생연도·성별 코드 일관성 검증 필수<br />
          • <strong>카드번호</strong> — <strong>Luhn 알고리즘</strong>으로 체크섬 검증 + 카드사 BIN 확인 필요<br />
          • <strong>사업자등록번호</strong> — 자체 체크섬 (마지막 자리 검증)<br />
          <strong>개인정보 처리 시 주의</strong>:<br />
          • 「개인정보 보호법」상 주민번호·카드번호는 <strong>고유식별정보</strong> — 수집·저장·전송 시 암호화 의무<br />
          • 실 운영에서는 <strong>토큰화·마스킹</strong> 권장 (직접 저장 금지)<br />
          • 본 도구의 패턴은 <strong>형식 검증 어림</strong>이며, 실제 검증·저장은 KISA·OWASP 가이드 + 검증 알고리즘(체크섬) + 안전한 암호화 절차가 추가로 필요합니다. <Link href="/disclaimer#dev" style={{ color: 'var(--accent)' }}>면책조항 참조</Link>.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 정규식이 너무 느려요 (catastrophic backtracking)</summary>
        <p style={faqAnswer}>
          <strong>중첩된 양화 한정자</strong>가 있으면 입력 길이에 지수적으로 시간이 늘어납니다.<br />
          <strong>위험 패턴</strong>:<br />
          • <code style={codeStyle}>{`(a+)+$`}</code> — <code style={codeStyle}>a</code> N개 + <code style={codeStyle}>!</code> 입력 시 2^N 시도<br />
          • <code style={codeStyle}>{`(a|aa)+`}</code> — 분기 백트래킹 폭발<br />
          • <code style={codeStyle}>{`(.*)*`}</code> — 무한 분기<br />
          <strong>해결 방법</strong>:<br />
          1. <strong>중첩 양화 한정자 제거</strong> — <code style={codeStyle}>{`(a+)+`}</code> → <code style={codeStyle}>{`a+`}</code><br />
          2. <strong>분기 명확화</strong> — <code style={codeStyle}>{`a|aa`}</code> 대신 <code style={codeStyle}>{`a{1,2}`}</code><br />
          3. <strong>구체적 character class</strong> — <code style={codeStyle}>{`.+`}</code> 대신 <code style={codeStyle}>{`[^"]+`}</code><br />
          4. <strong>lazy 양화 한정자</strong> — <code style={codeStyle}>{`.*?`}</code><br />
          본 도구는 100ms 초과 시 ⚠️ 경고를 표시하며, 입력 100KB · 매치 1만 개로 자동 제한합니다.
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/dev/hash" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔒</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해시 생성기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            MD5·SHA·HMAC·파일 무결성
          </p>
        </Link>
        <Link href="/tools/dev/base64" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔐</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>Base64 인코더/디코더</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            텍스트·파일 ↔ Base64
          </p>
        </Link>
        <Link href="/tools/dev/json" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📋</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>JSON 포맷터</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            JSON 정렬·압축·유효성 검사
          </p>
        </Link>
      </div>
    </div>
  )
}
