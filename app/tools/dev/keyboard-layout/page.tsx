import Link from 'next/link'
import KeyboardLayoutClient from './KeyboardLayoutClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/dev/keyboard-layout',
  title: '한영타 변환기 — 두벌식 자판 오타 복원 (dkssud → 안녕)',
  description:
    '한영키를 안 누르고 잘못 친 글자를 복원합니다. 영문↔한글 양방향 변환, 두벌식 자판 매핑·겹받침·겹모음 처리, 복사까지.',
  keywords: ['한영타 변환', '한영 변환기', '두벌식 자판', '키보드 오타 복원', '한영키', 'dkssud 뜻', '한글 영타'],
})

const code: React.CSSProperties = { background: 'var(--bg2)', padding: '1px 5px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 13 }

/* 유니코드 완성형 음절 순서(초성 19 · 중성 21 · 종성 28) — 표의 순번·코드포인트는 빌드 시 글자에서 직접 분해해 계산 */
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
const JONG = ['(없음)','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
/* 두벌식 키는 도구 변환기로 검산한 값 (dks→안, sud→녕, rkqt→값, rhos→괜, qnpfr→뷁) */
const SYLLABLE_ROWS = ([['안', 'dks'], ['녕', 'sud'], ['값', 'rkqt'], ['괜', 'rhos'], ['뷁', 'qnpfr']] as const).map(([ch, keys]) => {
  const cp = ch.charCodeAt(0)
  const idx = cp - 0xAC00
  const cho = Math.floor(idx / 588)
  const jung = Math.floor((idx % 588) / 28)
  const jong = idx % 28
  return { ch, keys, cho, jung, jong, hex: 'U+' + cp.toString(16).toUpperCase(), dec: cp }
})

const FAQ_LD = [
  {
    q: '한영타 변환은 어떻게 하나요?',
    a: '위 입력칸에 잘못 친 글자를 그대로 붙여넣으면 됩니다. <code>dkssud</code>처럼 영문이 들어오면 한글(<strong>안녕</strong>)로, <code>ㅗ디ㅣㅐ</code>처럼 한글 자모가 들어오면 영문(<strong>hello</strong>)으로 바뀝니다. 기본값은 입력을 보고 방향을 자동으로 잡습니다. 한글만 있으면 영문으로, 영문이 있으면 한글로 바꾸고, <code>오늘 dkssud</code>처럼 섞여 있으면 영문 부분만 한글로 바꿉니다. 방향 버튼을 눌러 직접 고정할 수도 있습니다.',
  },
  {
    q: 'dkssud이 무슨 뜻인가요?',
    a: '한글 자판에서 <strong>안녕</strong>을 칠 때 누르는 키를 영문 상태에서 그대로 친 결과입니다. 두벌식 기준 d=ㅇ, k=ㅏ, s=ㄴ, s=ㄴ, u=ㅕ, d=ㅇ 순서로, 오토마타가 ㅇ+ㅏ+ㄴ=안, ㄴ+ㅕ+ㅇ=녕으로 조합합니다. <code>dkssudgktpdy</code>는 <strong>안녕하세요</strong>입니다.',
  },
  {
    q: '한영키를 안 누르고 입력한 거 복원할 수 있나요?',
    a: '네, 그것이 이 도구의 핵심 용도입니다. 한/영 전환을 깜빡하고 친 글자를 그대로 복사해 붙여넣으면 원래 의도한 글자로 되돌립니다. 영문→한글, 한글→영문 양방향 모두 됩니다. 영문 외 문자(공백·숫자·기호)는 변환하지 않고 위치 그대로 둡니다.',
  },
  {
    q: '변환 결과가 깨지는 이유는?',
    a: '입력이 실제로 두벌식 자판 순서를 따르지 않을 때 깨집니다. 예를 들어 자동완성·맞춤법 교정이 중간에 끼어들었거나, 백스페이스로 글자를 지웠다 다시 친 입력은 키 순서가 어긋나 원본과 달라집니다. 받침 뒤에 모음이 오면 받침이 다음 글자 초성으로 넘어가는 규칙(연음)도 입력기 동작과 미세하게 다를 수 있습니다.',
  },
  {
    q: '세벌식도 되나요?',
    a: '이 도구는 두벌식(2-set) 표준 자판만 지원합니다. 국내 사용자의 대부분이 두벌식을 쓰기 때문입니다. 세벌식 390·최종(3-set)은 자모 배치가 완전히 달라 같은 영문 키가 다른 글자로 매핑되므로, 세벌식으로 친 입력은 올바르게 복원되지 않습니다.',
  },
  {
    q: '입력기마다 결과가 조금씩 다른 이유는?',
    a: '겹받침(ㄳ·ㄵ·ㄺ 등)과 겹모음(ㅘ·ㅙ·ㅢ 등)을 조합·분해하는 시점이 운영체제 IME마다 미세하게 다릅니다. 이 도구는 유니코드 표준 조합 규칙을 따르며, 완성형 음절은 0xAC00 기준으로 초성·중성·종성을 분리해 처리합니다. 대부분의 일상 문장은 정확히 복원되지만, 드물게 겹자모 경계에서 차이가 날 수 있습니다.',
  },
]

const relatedTools = [
  { href: '/tools/dev/url-encode', icon: '🔗', name: 'URL 인코더/디코더', desc: '퍼센트 인코딩·한글 URL 변환' },
  { href: '/tools/art/charcount', icon: '🔡', name: '글자수 세기', desc: '바이트·플랫폼 글자수 한도' },
  { href: '/tools/dev/number-base', icon: '🔢', name: '진법 변환기', desc: 'ASCII·유니코드 코드 변환' },
]

export default function KeyboardLayoutPage() {
  return (
    <ToolPage width={760} slug="/tools/dev/keyboard-layout">
      <h1 className="tp-h1">
        <ToolIconBadge catId="dev" />한영타 변환기
      </h1>
      <p className="tp-lead">
        한/영 전환을 깜빡하고 친 글자를 원래 의도한 글자로 되돌립니다. <code style={{ background: 'var(--bg2)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 13 }}>dkssud</code> → <strong style={{ color: 'var(--text)' }}>안녕</strong>, <code style={{ background: 'var(--bg2)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 13 }}>ㅗ디ㅣㅐ</code> → <strong style={{ color: 'var(--text)' }}>hello</strong>처럼 양방향으로 변환합니다.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="KS X 5002(정보 처리용 건반 배열) 두벌식 · 유니코드 한글 음절 조합 규칙(3.12절)"
        sources={[
          { label: 'KS X 5002 정보 처리용 건반 배열 (e나라표준인증)', href: 'https://standard.go.kr/KSCI/standardIntro/getStandardSearchView.do?menuId=503&topMenuId=502&ksNo=KSX5002&tmprKsNo=KSX5002&reformNo=00' },
          { label: '유니코드 표준 3장 (3.12 Conjoining Jamo Behavior)', href: 'https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-3/' },
        ]}
      />

      <KeyboardLayoutClient />

      <GuideDivider />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 오타가 나는 이유 */}
        <div>
          <h2 className="g-h2">한영타 오타가 나는 이유</h2>
          <p className="g-p">
            한글과 영문은 같은 키보드의 같은 키를 공유합니다. 운영체제의 입력기(IME)가 지금 어느 모드인지에 따라 같은 키 <code style={code}>d</code>가 <strong>ㅇ</strong>이 되기도, <strong>d</strong>가 되기도 합니다. 한/영 키를 누르지 않은 채 타이핑하면 의도한 글자 대신 반대 언어가 입력됩니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
            <div><span style={{ color: 'var(--muted)' }}># 한글 모드라고 착각하고 &quot;안녕&quot;을 타이핑</span></div>
            <div>의도한 키: ㅇ ㅏ ㄴ / ㄴ ㅕ ㅇ</div>
            <div>영문 모드 출력: <span style={{ color: 'var(--cat-dev)' }}>d k s</span> <span style={{ color: 'var(--cat-dev)' }}>s u d</span> → <span style={{ color: 'var(--cat-dev)' }}>dkssud</span></div>
            <div style={{ marginTop: 6 }}><span style={{ color: 'var(--muted)' }}># 이 도구가 키 순서를 역으로 읽어 복원</span></div>
            <div>dkssud → <strong style={{ color: 'var(--cat-dev)' }}>안녕</strong></div>
          </div>
        </div>

        {/* 2. 자판 매핑 표 */}
        <div>
          <h2 className="g-h2">두벌식 자판 매핑 표</h2>
          <p className="g-p">
            두벌식은 1982년 국가 표준으로 정해진 뒤 지금의 KS X 5002(정보 처리용 건반 배열)로 이어지는 표준 한글 자판입니다. 알파벳 26개 키에 기본 자음 14개와 모음 12개를 하나씩 놓고, 대체로 왼손 쪽에 자음, 오른손 쪽에 모음을 모아 자음과 모음을 번갈아 치게 했습니다. Shift를 함께 누르면 된소리 5개(ㅃㅉㄸㄲㅆ)와 모음 2개(ㅒㅖ)가 나와, 키로 바로 칠 수 있는 자모는 자음 19개·모음 14개입니다.
          </p>
          <p className="g-p">
            한글 모음 21개 중 나머지 7개(ㅘㅙㅚㅝㅞㅟㅢ)는 전용 키가 없고 두 모음 키를 이어 쳐서 만듭니다. 예를 들어 ㅘ는 ㅗ(h)+ㅏ(k), ㅢ는 ㅡ(m)+ㅣ(l)입니다. 겹받침 11개(ㄳㄵㄶㄺㄻㄼㄽㄾㄿㅀㅄ)도 마찬가지로 자음 키 두 개의 조합이라, 이 도구는 이런 조합표를 따로 두고 한글 → 영문 변환 때 두 키로 다시 풀어냅니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['영문 키', '한글 자모', '분류'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 1 ? 'center' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { en: 'q w e r t', ko: 'ㅂ ㅈ ㄷ ㄱ ㅅ', cat: '자음' },
                  { en: 'a s d f g', ko: 'ㅁ ㄴ ㅇ ㄹ ㅎ', cat: '자음' },
                  { en: 'z x c v', ko: 'ㅋ ㅌ ㅊ ㅍ', cat: '자음' },
                  { en: 'y u i o p', ko: 'ㅛ ㅕ ㅑ ㅐ ㅔ', cat: '모음' },
                  { en: 'h j k l', ko: 'ㅗ ㅓ ㅏ ㅣ', cat: '모음' },
                  { en: 'b n m', ko: 'ㅠ ㅜ ㅡ', cat: '모음' },
                  { en: 'Q W E R T', ko: 'ㅃ ㅉ ㄸ ㄲ ㅆ', cat: 'Shift · 된소리' },
                  { en: 'O P', ko: 'ㅒ ㅖ', cat: 'Shift · 이중모음' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text)', fontWeight: 600 }}>{r.en}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--cat-dev)', fontWeight: 700, fontSize: 15 }}>{r.ko}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.cat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. 빈출 오타 조견표 */}
        <div>
          <h2 className="g-h2">빈출 한영타 오타 조견표</h2>
          <p className="g-p">
            한/영 전환 실수는 인사말·감사 인사처럼 손에 익어 빠르게 치는 문장에서 자주 반복됩니다. 많이 찾는 오타 문자열과 복원 결과를 조견표로 정리했습니다. 된소리(ㅃㅉㄸㄲㅆ)와 ㅒ·ㅖ는 Shift 키에 있으므로 <code style={code}>dPQmek</code>처럼 <strong>대문자를 그대로 유지</strong>해야 정확히 복원됩니다. 마지막 세 줄은 반대로 한글 모드인 채 영어 단어를 친 경우로, 한글 → 영문 방향의 복원 결과입니다. 표에 없는 문장은 공백·숫자·문장부호가 섞여 있어도 그대로 두고 변환되므로, 통째로 붙여넣으면 됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['잘못 친 입력', '복원 결과', '비고'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 1 ? 'center' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { en: 'dkssud', ko: '안녕', note: '' },
                  { en: 'dkssudgktpdy', ko: '안녕하세요', note: '' },
                  { en: 'rkskek', ko: '가나다', note: '' },
                  { en: 'rkatkgkqslek', ko: '감사합니다', note: '' },
                  { en: 'rhakqtmqslek', ko: '고맙습니다', note: '' },
                  { en: 'tkfkdgo', ko: '사랑해', note: '' },
                  { en: 'rhoscksgdkdy', ko: '괜찮아요', note: '겹모음 ㅙ · 겹받침 ㄶ' },
                  { en: 'anjgo', ko: '뭐해', note: '겹모음 ㅝ' },
                  { en: 'aldksgo', ko: '미안해', note: '' },
                  { en: 'dhsmf', ko: '오늘', note: '' },
                  { en: 'sodlf', ko: '내일', note: '' },
                  { en: 'gksrmf', ko: '한글', note: '' },
                  { en: 'qlalfqjsgh', ko: '비밀번호', note: '' },
                  { en: 'wjsghkqjsgh', ko: '전화번호', note: '겹모음 ㅘ' },
                  { en: 'dPQmek', ko: '예쁘다', note: 'Shift — P=ㅖ · Q=ㅃ' },
                  { en: 'Ekfrl', ko: '딸기', note: 'Shift — E=ㄸ' },
                  { en: 'ㅗ디ㅣㅐ', ko: 'hello', note: '한글 → 영문' },
                  { en: 'ㅜㅁㅍㄷㄱ', ko: 'naver', note: '한글 → 영문' },
                  { en: 'ㅛㅐㅕ셔ㅠㄷ', ko: 'youtube', note: '한글 → 영문' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text)', fontWeight: 600 }}>{r.en}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--cat-dev)', fontWeight: 700, fontSize: 15 }}>{r.ko}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. 도깨비불 현상 */}
        <div>
          <h2 className="g-h2">받침이 다음 글자로 넘어가는 이유 — 도깨비불 현상</h2>
          <p className="g-p">
            두벌식 자판의 자음 키에는 초성용·종성용 구분이 없습니다. 그래서 입력기는 모음 뒤에 온 자음을 <strong>일단 받침으로 붙여 두고</strong>, 다음 입력이 모음이면 그 받침을 떼어 다음 음절의 초성으로 넘깁니다. 받침이 다음 칸으로 옮겨붙으며 화면 글자가 깜빡이듯 바뀌는 모습 때문에 이를 <strong>도깨비불 현상</strong>이라고 부릅니다. <code style={code}>rkrtk</code>를 한 키씩 눌렀을 때 화면이 바뀌는 과정입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['누른 키', '자모', '화면 표시', '오토마타 동작'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 1 || i === 2 ? 'center' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'r', jamo: 'ㄱ', screen: 'ㄱ', desc: '초성 후보로 대기' },
                  { key: 'k', jamo: 'ㅏ', screen: '가', desc: '초성 + 중성 조합' },
                  { key: 'r', jamo: 'ㄱ', screen: '각', desc: '자음이라 일단 받침(종성)으로' },
                  { key: 't', jamo: 'ㅅ', screen: '갃', desc: 'ㄱ + ㅅ → 겹받침 ㄳ 조합' },
                  { key: 'k', jamo: 'ㅏ', screen: '각사', desc: '모음이 오자 ㅅ이 떨어져 다음 음절 초성으로' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text)', fontWeight: 600 }}>{r.key}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{r.jamo}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--cat-dev)', fontWeight: 700, fontSize: 15 }}>{r.screen}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            마지막 단계에서 겹받침 ㄳ이 쪼개져 ㅅ만 다음 글자로 넘어갔습니다. 이 규칙 때문에 한영타 복원은 글자 하나씩 바꾸는 단순 치환으로는 불가능하고, 이 도구처럼 키 순서 전체를 오토마타로 다시 실행해야 합니다. 같은 자음 키가 위치에 따라 초성도 종성도 되지만, 키 순서가 정해지면 결과는 한 가지로 결정됩니다. <code style={code}>rkqtl</code>은 항상 <strong>갑시</strong>, ㅇ(d)이 하나 끼어든 <code style={code}>rkqtdl</code>은 항상 <strong>값이</strong>로 복원되는 이유입니다.
          </p>
        </div>

        {/* 5. 음절 조합식 */}
        <div>
          <h2 className="g-h2">키 순서가 글자가 되는 계산 — 유니코드 음절 조합식</h2>
          <p className="g-p">
            오토마타가 초성·중성·종성을 확정하면, 도구는 완성형 음절 목록에서 글자를 하나하나 찾지 않고 유니코드 코드포인트를 직접 계산합니다. 현대 한글 완성형 음절 11,172자(초성 19 × 중성 21 × 종성 28, 종성 0은 받침 없음)는
            U+AC00 &lsquo;가&rsquo;부터 U+D7A3 &lsquo;힣&rsquo;까지 이 순서대로 빈틈없이 배열돼 있어서 <strong>음절 코드 = 0xAC00 + (초성 순번 × 21 + 중성 순번) × 28 + 종성 순번</strong> 식 하나로 조합이 끝납니다.
            &lsquo;안&rsquo;은 초성 ㅇ(11)·중성 ㅏ(0)·종성 ㄴ(4)이므로 44,032 + (11 × 21 + 0) × 28 + 4 = 50,504, 곧 U+C548입니다.
          </p>
          <p className="g-p">
            한글 → 영문 방향은 이 계산을 거꾸로 합니다. 코드포인트에서 0xAC00을 뺀 값을 588(21 × 28)로 나눈 몫이 초성, 나머지를 28로 나눈 몫이 중성, 마지막 나머지가 종성 순번입니다.
            아래 표로 식을 따라가 볼 수 있고, 두벌식 키 열의 영문을 위 변환기에 넣으면 왼쪽 음절로 바뀝니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['음절', '초성 (순번)', '중성 (순번)', '종성 (순번)', '코드포인트', '두벌식 키'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SYLLABLE_ROWS.map((r) => (
                  <tr key={r.ch} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--cat-dev)', fontWeight: 700, fontSize: 15 }}>{r.ch}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{CHO[r.cho]} ({r.cho})</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{JUNG[r.jung]} ({r.jung})</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{JONG[r.jong]} ({r.jong})</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.hex} <span style={{ color: 'var(--muted)' }}>({r.dec.toLocaleString('ko-KR')})</span></td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text)', fontWeight: 600 }}>{r.keys}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            종성 목록에는 ㄸ·ㅃ·ㅉ이 없습니다. 그래서 Shift로 친 ㅆ은 <code style={code}>rkT</code> → <strong>갔</strong>처럼 받침이 되지만,
            <code style={code}>rkE</code>는 ㄸ이 받침이 될 수 없어 <strong>가ㄸ</strong>으로 새 글자가 시작되고, 뒤에 모음이 오면 <code style={code}>rkEk</code> → <strong>가따</strong>가 됩니다.
            &lsquo;뷁&rsquo;처럼 겹모음(ㅞ)과 겹받침(ㄺ)이 함께 든 글자도 키 다섯 개(<code style={code}>qnpfr</code>)의 순서만 맞으면 한 번에 복원됩니다.
          </p>
        </div>

        {/* 6. 변환이 안 되는 경우 */}
        <div>
          <h2 className="g-h2">변환이 안 되거나 깨지는 경우</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '키 순서가 어긋난 입력', d: '중간에 백스페이스로 지웠다 다시 쳤거나 자동완성이 끼어든 글자는 실제 키 순서가 흐트러져 원본과 다르게 복원됩니다.' },
              { t: '세벌식으로 친 글자', d: '이 도구는 두벌식만 지원합니다. 세벌식은 같은 영문 키가 다른 자모로 매핑돼 복원이 어긋납니다.' },
              { t: '겹받침·겹모음 경계', d: '받침 뒤에 모음이 오면 받침이 다음 글자로 넘어가는 연음 처리, ㅘ·ㅢ 같은 겹모음 조합 시점이 IME마다 미세하게 다릅니다.' },
              { t: '특수문자·이모지', d: '자판에 매핑되지 않는 문자는 변환하지 않고 그 자리에 그대로 둡니다. 한글·영문이 섞여 있으면 자동 모드에서는 영문 부분만 한글로 바꿉니다.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--cat-dev)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 7. FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* 8. 관련 도구 */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {relatedTools.map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', textDecoration: 'none' }}
              >
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </ToolPage>
  )
}
