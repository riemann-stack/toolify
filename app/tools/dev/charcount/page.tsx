import Link from 'next/link'
import CharCountClient from './CharCountClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/dev/charcount',
  title: '글자수 세기 — 공백 포함·제외·바이트·SNS 글자수 제한 비교',
  description: '한글·영문·이모지 실시간 글자수, 단어수, 줄수, 문장수, UTF-8/EUC-KR/UTF-16 바이트, SMS·트위터 가중치, 30+ 플랫폼 글자수 제한, 묵독·발화 시간, 케이스 변환, 찾기·바꾸기, 빈도 분석까지.',
  keywords: ['글자수세기', '글자수계산기', '자수세기', '단어수세기', 'UTF-8바이트', 'SMS바이트계산', '트위터가중치', '자기소개서글자수', '플랫폼글자수제한', 'meta description 길이'],
})

export default function CharCountPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        개발자·텍스트
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔡 글자수 세기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        텍스트를 입력하면 <strong style={{ color: 'var(--text)' }}>한글·영문·이모지 글자수, 단어/줄/문장수, UTF-8·EUC-KR·UTF-16 바이트, 트위터 가중치</strong>까지 실시간 계산.
        <strong style={{ color: 'var(--text)' }}>30+ 플랫폼 글자수 제한</strong>(SNS·블로그·자기소개서·앱스토어·SEO 메타) 비교, 케이스 변환, 찾기·바꾸기, 글자 빈도 분석을 한 번에.
      </p>

      <CharCountClient />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 무엇을 측정하나 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            글자수 vs 바이트 — 정확히 알아야 할 차이
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '글자수 (Length)',     c: 'var(--accent)', d: '문자 1개를 1로 셉니다. 한글 "안녕" = 2글자. JavaScript의 string.length와 동일.' },
              { t: 'UTF-8 바이트',        c: '#3EFF9B',       d: '웹 표준 인코딩. 한글 1자 = 3바이트, 영문/숫자 = 1바이트, 이모지 = 4바이트.' },
              { t: 'EUC-KR 바이트',       c: '#FFD700',       d: '한국 SMS·구형 시스템. 한글 1자 = 2바이트, 영문/숫자 = 1바이트.' },
              { t: 'X(트위터) 가중치',     c: '#3EC8FF',       d: '한글·이모지 1자 = 가중치 2. 280 weight 한도. 한글만으로는 약 140자.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 한글 1자의 진실 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한글 1자는 몇 바이트?
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['인코딩', '한글 1자', '영문 1자', '이모지', '주요 사용처'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i === 4 ? 'left' : 'right'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { e: 'UTF-8',  k: '3바이트',  l: '1바이트', em: '4바이트',  u: '웹 표준 (HTML, JSON, REST API)' },
                  { e: 'UTF-16', k: '2바이트',  l: '2바이트', em: '4바이트',  u: 'JavaScript 내부, Java String' },
                  { e: 'EUC-KR', k: '2바이트',  l: '1바이트', em: '미지원',   u: '한국 SMS, 구형 윈도우 (CP949)' },
                  { e: 'ASCII',  k: '미지원',   l: '1바이트', em: '미지원',   u: '영문 전용 (RFC, 도메인)' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.e}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.k}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.em}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. SMS 한도 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 SMS·LMS·MMS 글자수 한도
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: 'SMS (단문)',  b: '90바이트',  ko: '한글 약 45자',     en: '영문 90자',  c: 'var(--accent)' },
              { t: 'LMS (장문)',  b: '2,000바이트', ko: '한글 약 1,000자',  en: '영문 2,000자', c: '#3EFF9B' },
              { t: 'MMS (멀티)', b: '2,000바이트 + 이미지', ko: '본문 약 1,000자', en: '제목 30바이트', c: '#FFD700' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text)', marginBottom: 4 }}>{g.b}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{g.ko}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{g.en}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(255,140,62,0.05)',
            border: '1px solid rgba(255,140,62,0.30)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ⚠️ <strong style={{ color: '#FF8C3E' }}>주의:</strong> 통신사 정책상 1바이트라도 초과하면 LMS·MMS로 자동 전환되어 발송 단가가 올라갑니다.
            마케팅 문자는 SMS(45자) 안에 핵심을 담으세요.
          </div>
        </div>

        {/* ── 4. SEO 메타 길이 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            SEO 메타 태그 권장 길이
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: 'HTML <title>',    range: '50~60자',  c: 'var(--accent)', d: '구글 검색결과 모바일 최대 50자, 데스크탑 60자 표시. 초과 시 "..." 잘림.' },
              { t: 'meta description',range: '120~160자', c: '#3EFF9B',       d: '검색결과 스니펫. 모바일 120자, 데스크탑 160자 표시.' },
              { t: 'Open Graph title', range: '40~60자',  c: '#3EC8FF',       d: '카카오톡·페이스북 공유 카드 제목.' },
              { t: 'Open Graph description', range: '80~120자', c: '#FFD700', d: '공유 카드 설명. 너무 길면 줄임.' },
              { t: '이메일 제목',        range: '50자 (모바일)', c: '#FF8C3E', d: '받은편지함에서 짤리지 않는 안전 길이. 데스크탑은 78자.' },
              { t: 'URL slug',          range: '50~70자',  c: '#9B59B6',       d: '검색엔진과 공유 시 가독성 균형.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${g.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{g.t}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{g.range}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 자기소개서 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자기소개서·이력서 글자수 가이드
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['상황', '권장 글자수', '비고'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i === 1 ? 'right' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { s: '자기소개서 — 단문 (스타트업)',  l: '500자',     n: '핵심만 압축, 1~2 문단' },
                  { s: '자기소개서 — 일반 (중견기업)',  l: '1,000자',   n: '4문항 평균. 한 문항당 250자' },
                  { s: '자기소개서 — 대기업 표준',     l: '2,000자',   n: '4문항 × 500자 일반' },
                  { s: '자기소개서 — 장문 (공기업)',    l: '4,000자',   n: '4문항 × 1,000자' },
                  { s: '이력서 자기소개',              l: '800자',     n: '경력 요약, 5~6문장' },
                  { s: '직무 적합성 PR',              l: '300~500자', n: '3문장 안에 핵심 메시지' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 6. 묵독·발화 시간 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            묵독·발화 시간 추정
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>묵독 시간(분)</span> = 글자수 ÷ 300</div>
            <div><span style={{ color: 'var(--muted)' }}>발화 시간(분)</span> = 글자수 ÷ 150</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 한국어 평균 기준 추정. 영어 단어 기준 묵독 200~250 wpm, 발화 약 130 wpm</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, marginTop: 12 }}>
            {[
              { t: '카톡 짧은 메시지 50자',  r: '10초',    s: '20초' },
              { t: '트위터 글 280자',        r: '1분',     s: '2분' },
              { t: '블로그 단락 1,000자',    r: '3분',     s: '7분' },
              { t: '뉴스 기사 3,000자',      r: '10분',    s: '20분' },
              { t: '책 1챕터 10,000자',      r: '33분',    s: '67분' },
              { t: '논문 1편 50,000자',      r: '2시간 47분', s: '5시간 33분' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' }}>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 4 }}>{r.t}</p>
                <p style={{ fontSize: 12, color: 'var(--text)' }}>📖 묵독 <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{r.r}</strong></p>
                <p style={{ fontSize: 12, color: 'var(--text)' }}>🎙️ 발화 <strong style={{ color: '#3EC8FF', fontFamily: 'Syne, sans-serif' }}>{r.s}</strong></p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { q: '공백을 글자수에 포함해야 하나요?', a: '플랫폼·문서 종류에 따라 다릅니다. <strong>SNS·자기소개서</strong>는 보통 공백 포함, <strong>학술 논문 분량 측정</strong>은 공백 제외가 일반적입니다. 본 도구는 두 값을 모두 표시하므로 양식에 맞게 사용하세요.' },
              { q: '이모지는 몇 글자로 세야 하나요?', a: '단순 카운트 기준으로 이모지 1개 = 1글자입니다. 단 <strong>UTF-8 바이트는 4바이트</strong>이므로 SMS 전송 시에는 더 큰 비중을 차지합니다. X(트위터)는 이모지를 가중치 2로 계산합니다.' },
              { q: '한글 자모(ㄱㄴㄷ)는 어떻게 세나요?', a: '본 도구는 자모(ㄱ, ㅏ 등)와 완성형 한글(가, 나)을 모두 한글로 카운트하며 별도 통계로 분리해 보여줍니다. 자모만 입력된 경우 일반적인 한글로 인식되지 않을 수 있어 입력 검증이 필요합니다.' },
              { q: 'X(트위터) 글자수가 280인데 한글로는 왜 140자인가요?', a: 'X는 영문/숫자/일부 라틴 문자를 가중치 1, 한글·중국어·일본어·이모지를 가중치 2로 계산해 <strong>총 280 가중치 한도</strong>를 적용합니다. 한글로만 글을 쓰면 약 140자가 한계입니다.' },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/dev/base64',        icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트·파일·JWT Base64 변환' },
              { href: '/tools/dev/json',          icon: '📋', name: 'JSON 포맷터',          desc: 'JSON 정렬·압축·트리·검증' },
              { href: '/tools/dev/lorem',         icon: '📝', name: '더미 텍스트 생성기',   desc: 'Lorem Ipsum·한글 더미' },
              { href: '/tools/dev/color',         icon: '🎨', name: '색상 코드 변환기',     desc: 'HEX·RGB·HSL 변환' },
              { href: '/tools/dev/css-converter', icon: '🎨', name: 'CSS 값 변환기',         desc: 'px·rem·em·clamp() 변환' },
              { href: '/tools/unit/time',         icon: '⏱️', name: '시간 단위 변환기',     desc: '초·분·시간·일 변환' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
