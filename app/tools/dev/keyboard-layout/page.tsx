import Link from 'next/link'
import KeyboardLayoutClient from './KeyboardLayoutClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/dev/keyboard-layout',
  title: '한영타 변환기 — 두벌식 자판 오타 복원 (dkssud → 안녕)',
  description:
    '한영키를 안 누르고 잘못 친 글자를 복원합니다. 영문↔한글 양방향 변환, 두벌식 자판 매핑·겹받침·겹모음 처리, 복사까지.',
  keywords: ['한영타 변환', '한영 변환기', '두벌식 자판', '키보드 오타 복원', '한영키', 'dkssud 뜻', '한글 영타'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

const FAQ_LD = [
  {
    q: '한영타 변환은 어떻게 하나요?',
    a: '위 입력칸에 잘못 친 글자를 그대로 붙여넣으면 됩니다. <code>dkssud</code>처럼 영문이 들어오면 한글(<strong>안녕</strong>)로, <code>ㅗ디ㅣㅐ</code>처럼 한글 자모가 들어오면 영문(<strong>hello</strong>)으로 바뀝니다. 기본값은 입력에 한글이 있으면 자동으로 방향을 잡지만, 방향 버튼을 눌러 직접 고정할 수도 있습니다.',
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
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--cat-dev)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 700 }}>
        개발자
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="dev" />한영타 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        한/영 전환을 깜빡하고 친 글자를 원래 의도한 글자로 되돌립니다. <code style={{ background: 'var(--bg2)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 13 }}>dkssud</code> → <strong style={{ color: 'var(--text)' }}>안녕</strong>, <code style={{ background: 'var(--bg2)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 13 }}>ㅗ디ㅣㅐ</code> → <strong style={{ color: 'var(--text)' }}>hello</strong>처럼 양방향으로 변환합니다.
      </p>

      <KeyboardLayoutClient />

      <GuideDivider />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 오타가 나는 이유 */}
        <div>
          <h2 style={sectionTitle}>한영타 오타가 나는 이유</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            한글과 영문은 같은 키보드의 같은 키를 공유합니다. 운영체제의 입력기(IME)가 지금 어느 모드인지에 따라 같은 키 <code style={{ background: 'var(--bg2)', padding: '1px 5px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 13 }}>d</code>가 <strong style={{ color: 'var(--text)' }}>ㅇ</strong>이 되기도, <strong style={{ color: 'var(--text)' }}>d</strong>가 되기도 합니다. 한/영 키를 누르지 않은 채 타이핑하면 의도한 글자 대신 반대 언어가 입력됩니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
            <div><span style={{ color: 'var(--muted)' }}># 한글 모드라고 착각하고 &quot;안녕&quot;을 타이핑</span></div>
            <div>의도한 키: ㅇ ㅏ ㄴ / ㄴ ㅕ ㅇ</div>
            <div>영문 모드 출력: <span style={{ color: 'var(--cat-dev)' }}>d k s</span> <span style={{ color: 'var(--cat-dev)' }}>s u d</span> → <span style={{ color: 'var(--cat-dev)' }}>dkssud</span></div>
            <div style={{ marginTop: 6 }}><span style={{ color: 'var(--muted)' }}># 이 도구가 키 순서를 역으로 읽어 복원</span></div>
            <div>dkssud → <strong style={{ color: 'var(--cat-dev)' }}>안녕</strong></div>
          </div>
        </div>

        {/* 2. 자판 매핑 표 */}
        <div>
          <h2 style={sectionTitle}>두벌식 자판 매핑 표</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            두벌식은 자음 19개와 모음 21개를 QWERTY 키에 배치합니다. 왼손 자리에 자음, 오른손 자리에 모음이 모여 있어 한 손씩 번갈아 누르도록 설계됐습니다. Shift를 함께 누르면 된소리(ㅃㅉㄸㄲㅆ)와 이중모음(ㅒㅖ)이 나옵니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
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
          <h2 style={sectionTitle}>빈출 한영타 오타 조견표</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            한/영 전환 실수는 인사말·감사 인사처럼 손에 익어 빠르게 치는 문장에서 자주 반복됩니다. 많이 찾는 오타 문자열과 복원 결과를 조견표로 정리했습니다. 된소리(ㅃㅉㄸㄲㅆ)와 ㅒ·ㅖ는 Shift 키에 있으므로 <code style={{ background: 'var(--bg2)', padding: '1px 5px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 13 }}>dPQmek</code>처럼 <strong style={{ color: 'var(--text)' }}>대문자를 그대로 유지</strong>해야 정확히 복원됩니다. 마지막 세 줄은 반대로 한글 모드인 채 영어 단어를 친 경우로, 한글 → 영문 방향의 복원 결과입니다. 표에 없는 문장은 공백·숫자·문장부호가 섞여 있어도 그대로 두고 변환되므로, 통째로 붙여넣으면 됩니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
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
          <h2 style={sectionTitle}>받침이 다음 글자로 넘어가는 이유 — 도깨비불 현상</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            두벌식 자판의 자음 키에는 초성용·종성용 구분이 없습니다. 그래서 입력기는 모음 뒤에 온 자음을 <strong style={{ color: 'var(--text)' }}>일단 받침으로 붙여 두고</strong>, 다음 입력이 모음이면 그 받침을 떼어 다음 음절의 초성으로 넘깁니다. 받침이 다음 칸으로 옮겨붙으며 화면 글자가 깜빡이듯 바뀌는 모습 때문에 이를 <strong style={{ color: 'var(--text)' }}>도깨비불 현상</strong>이라고 부릅니다. <code style={{ background: 'var(--bg2)', padding: '1px 5px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 13 }}>rkrtk</code>를 한 키씩 눌렀을 때 화면이 바뀌는 과정입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
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
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, marginTop: 12 }}>
            마지막 단계에서 겹받침 ㄳ이 쪼개져 ㅅ만 다음 글자로 넘어갔습니다. 이 규칙 때문에 한영타 복원은 글자 하나씩 바꾸는 단순 치환으로는 불가능하고, 이 도구처럼 키 순서 전체를 오토마타로 다시 실행해야 합니다. 같은 자음 키가 위치에 따라 초성도 종성도 되지만, 키 순서가 정해지면 결과는 한 가지로 결정됩니다. <code style={{ background: 'var(--bg2)', padding: '1px 5px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 13 }}>rkqtl</code>은 항상 <strong style={{ color: 'var(--text)' }}>갑시</strong>, ㅇ(d)이 하나 끼어든 <code style={{ background: 'var(--bg2)', padding: '1px 5px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 13 }}>rkqtdl</code>은 항상 <strong style={{ color: 'var(--text)' }}>값이</strong>로 복원되는 이유입니다.
          </p>
        </div>

        {/* 5. 변환이 안 되는 경우 */}
        <div>
          <h2 style={sectionTitle}>변환이 안 되거나 깨지는 경우</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '키 순서가 어긋난 입력', d: '중간에 백스페이스로 지웠다 다시 쳤거나 자동완성이 끼어든 글자는 실제 키 순서가 흐트러져 원본과 다르게 복원됩니다.' },
              { t: '세벌식으로 친 글자', d: '이 도구는 두벌식만 지원합니다. 세벌식은 같은 영문 키가 다른 자모로 매핑돼 복원이 어긋납니다.' },
              { t: '겹받침·겹모음 경계', d: '받침 뒤에 모음이 오면 받침이 다음 글자로 넘어가는 연음 처리, ㅘ·ㅢ 같은 겹모음 조합 시점이 IME마다 미세하게 다릅니다.' },
              { t: '특수문자·이모지', d: '자판에 매핑되지 않는 문자는 변환하지 않고 그 자리에 그대로 둡니다. 한글·영문이 섞여 있어도 됩니다.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--cat-dev)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* 7. 관련 도구 */}
        <div>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {relatedTools.map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, textDecoration: 'none' }}
              >
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
