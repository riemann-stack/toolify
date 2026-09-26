import Link from 'next/link'
import CharCountClient from './CharCountClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import { fmtMin, PLATFORM_GROUPS } from './charcountUtils'

export const metadata = buildMetadata({
  path: '/tools/art/charcount',
  title: '글자수 세기 — 공백 포함·제외·원고지 매수·목표 글자수·SNS 제한',
  description: '공백 포함·제외 실시간 카운트 + 목표 글자수 카운트다운 + 원고지 매수. 자소서·SNS·논문 글자 수 체크와 바이트 분석, 자동 저장.',
  keywords: ['글자수세기', '글자수계산기', '자수세기', '단어수세기', '원고지매수', '원고지계산', '목표글자수', 'UTF-8바이트', 'SMS바이트계산', '트위터가중치', '자기소개서글자수', '플랫폼글자수제한', 'meta description 길이'],
})

const FAQ_LD = [
              { q: '공백을 글자수에 포함해야 하나요?', a: '플랫폼·문서 종류에 따라 다릅니다. <strong>SNS·자기소개서</strong>는 보통 공백 포함, <strong>학술 논문 분량 측정</strong>은 공백 제외가 일반적입니다. 본 도구는 두 값을 모두 표시하므로 양식에 맞게 사용하세요.' },
              { q: '이모지는 몇 글자로 세야 하나요?', a: '세는 기준에 따라 다릅니다. 본 도구의 총 글자수는 UTF-16 코드 유닛(JavaScript String.length) 기준이라 😀 같은 기본 이모지 1개가 <strong>2글자</strong>, 👨‍👩‍👧 같은 결합 이모지는 8글자로 집계됩니다. UTF-8 바이트로는 기본 이모지 1개가 4바이트이고, X(트위터)는 이모지를 가중치 2로 계산합니다.' },
              { q: '한글 자모(ㄱㄴㄷ)는 어떻게 세나요?', a: '본 도구는 완성형 음절(가~힣)과 자모(ㅋ·ㅠ 같은 호환 자모, 첫가끝 조합용 자모)를 모두 한글로 셉니다. 문자 종류별 분석의 &lsquo;한글&rsquo; 칸은 음절과 자모를 합친 값입니다. ㅋㅋ처럼 자모만 쓴 글자도 1자 = 1글자입니다. 주의할 경우는 <strong>조합형(NFD)으로 저장된 한글</strong>입니다. macOS에서 만든 파일 이름을 복사해 붙이면 &lsquo;한글&rsquo; 2자가 ㅎ·ㅏ·ㄴ·ㄱ·ㅡ·ㄹ 6개 코드로 들어와 <strong>총 글자수가 6</strong>으로 셀 수 있습니다. 이모지 없이 한글만 쓴 글인데 총 글자수가 &lsquo;그래핌(눈에 보이는 글자)&rsquo; 값보다 크게 나온다면(예: 총 글자수 6, 그래핌 2) 이 경우이니, 제출할 시스템에 붙여 넣기 전에 한 번 다시 입력하거나 완성형으로 변환하세요.' },
              { q: 'X(트위터) 글자수가 280인데 한글로는 왜 140자인가요?', a: 'X는 영문/숫자/일부 라틴 문자를 가중치 1, 한글·중국어·일본어·이모지를 가중치 2로 계산해 <strong>총 280 가중치 한도</strong>를 적용합니다. 한글로만 글을 쓰면 약 140자가 한계입니다.' },
              { q: '줄바꿈도 글자수에 들어가나요?', a: '본 도구의 <strong>총 글자수(공백 포함)에는 줄바꿈 1개가 1글자</strong>로 들어가고, <strong>공백 제외</strong> 값은 띄어쓰기·탭·줄바꿈을 모두 뺀 값입니다. 입사지원 시스템처럼 웹 입력창에 붙여 넣는 경우, 브라우저 입력창의 maxlength는 줄바꿈을 1글자로 세지만 서버로 전송될 때는 줄바꿈이 CR+LF 두 글자로 바뀌어 전달되므로 서버 쪽 검사에서 줄바꿈 수만큼 더 세는 시스템도 있습니다. 한도에 딱 맞춘 글이라면 문단 수만큼 여유를 두는 편이 안전합니다.' },
              { q: '원고지 1매는 몇 자인가요?', a: '가장 널리 쓰이는 200자 원고지 기준으로 <strong>1매 = 20자 × 10행 = 200자</strong>입니다. 본 도구의 원고지 매수는 공백 포함 글자수를 200으로 나눠 올림한 값입니다. 띄어쓰기도 원고지에서 한 칸을 차지하므로 공백 포함으로 세는 것이 관례이며, 실제 원고지에 옮겨 쓰면 문단 들여쓰기·줄 바꿈 여백 때문에 계산값보다 다소 늘어날 수 있습니다.' },
            ]

/* ── 가이드 표 — 계산기와 같은 식·표시 함수(fmtMin)로 빌드 시 계산 ── */
const READ_PER_MIN = 300
const SPEAK_PER_MIN = 150
const READING_ROWS = [
  { label: '카톡 짧은 메시지', chars: 50 },
  { label: 'X 게시물 한도만큼 영문', chars: 280 },
  { label: '블로그 단락', chars: 1000 },
  { label: '뉴스 기사', chars: 3000 },
  { label: '책 1챕터', chars: 10000 },
  { label: '논문 1편', chars: 50000 },
].map((r) => ({ ...r, read: fmtMin(r.chars / READ_PER_MIN), speak: fmtMin(r.chars / SPEAK_PER_MIN) }))
const COVER_LETTER_ROWS = (PLATFORM_GROUPS.find((g) => g.group.startsWith('자기소개서'))?.items ?? []).map((it) => ({
  limit: it.limit,
  sheets: Math.ceil(it.limit / 200),
  read: fmtMin(it.limit / READ_PER_MIN),
  speak: fmtMin(it.limit / SPEAK_PER_MIN),
  utf8: it.limit * 3,
}))

export default function CharCountPage() {
  return (
    <ToolPage width={760} slug="/tools/art/charcount">
      <h1 className="tp-h1">
        <ToolIconBadge catId="art" />글자수 세기
      </h1>
      <p className="tp-lead">
        공백 포함·제외 <strong style={{ color: 'var(--text)' }}>실시간 카운트</strong>. SNS·자소서·논문 글자 수 체크.
      </p>

      <UpdatedMeta
        date="2026년 8월"
        basis="총 글자수 = UTF-16 코드 유닛(String.length) 기준 · X 가중치 = 공식 twitter-text config v3(4구간·기본 가중치 2·URL 23자 고정·NFC 정규화·이모지 엔티티 1개당 2자) · 플랫폼 한도는 항목별로 공식 문서 확인값/공식 미문서화 통용값/편의 프리셋을 구분해 표시 · SMS 90바이트는 EUC-KR 기준"
        sources={[
          { label: '유튜브 고객센터', href: 'https://support.google.com/youtube/answer/57404?hl=ko' },
          { label: 'twitter-text 공식 설정 (config/v3.json)', href: 'https://github.com/twitter/twitter-text/blob/master/config/v3.json' },
          { label: 'X — 글자수 세는 법', href: 'https://docs.x.com/fundamentals/counting-characters' },
          { label: 'Google — 제목 링크 가이드', href: 'https://developers.google.com/search/docs/appearance/title-link?hl=ko' },
          { label: 'Google — 스니펫 가이드', href: 'https://developers.google.com/search/docs/appearance/snippet?hl=ko' },
          { label: 'WHATWG HTML — maxlength(코드 유닛 길이)', href: 'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#attr-fe-maxlength' },
          { label: 'Unicode UAX #29 — 그래핌 경계', href: 'https://www.unicode.org/reports/tr29/' },
        ]}
      />

      <CharCountClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 무엇을 측정하나 ── */}
        <div>
          <h2 className="g-h2">
            글자수 vs 바이트 — 정확히 알아야 할 차이
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '글자수 (Length)',     c: 'var(--accent)', d: 'UTF-16 코드 유닛 수. 한글·영문 1자 = 1, 기본 이모지 1개 = 2. JavaScript의 String.length와 동일.' },
              { t: 'UTF-8 바이트',        c: 'var(--success)',       d: '웹 표준 인코딩. 한글 1자 = 3바이트, 영문/숫자 = 1바이트, 이모지 = 4바이트.' },
              { t: 'EUC-KR 바이트',       c: 'var(--cat-sports)',       d: '한국 SMS·구형 시스템. 한글 1자 = 2바이트, 영문/숫자 = 1바이트.' },
              { t: 'X(트위터) 가중치',     c: 'var(--cat-health)',       d: '한글·이모지 1자 = 가중치 2. 280 weight 한도. 한글만으로는 약 140자.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 한글 1자의 진실 ── */}
        <div>
          <h2 className="g-h2">
            한글 1자는 몇 바이트?
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['인코딩', '한글 1자', '영문 1자', '이모지', '주요 사용처'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i === 4 ? 'left' : 'right'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
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
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.e}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.k}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.em}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 결합 이모지·그래핌 단위 ── */}
        <div>
          <h2 className="g-h2">
            결합 이모지 👨‍👩‍👧는 왜 8글자로 세어질까
          </h2>
          <p className="g-p">
            가족 이모지 👨‍👩‍👧는 눈에는 1글자지만, 실제로는 👨·👩·👧 세 이모지를 폭이 없는 결합 문자 <strong style={{ color: 'var(--text)' }}>ZWJ(U+200D)</strong> 2개로
            이어 붙인 시퀀스입니다. 어떤 단위로 세느냐에 따라 1(그래핌)·5(코드포인트)·8(UTF-16 코드 유닛)로 답이 전부 달라지는데,
            글자수 카운터마다 결과가 다른 이유가 바로 이것입니다. 본 도구의 총 글자수는 JavaScript <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text)' }}>String.length</span>와
            같은 <strong style={{ color: 'var(--text)' }}>UTF-16 코드 유닛 기준</strong>입니다. HTML 표준의 입력창 <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text)' }}>maxlength</span>도
            같은 코드 유닛 단위로 정의되어 있어, 웹 입력 폼의 글자수 제한과 대부분 일치합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['입력', '눈에 보이는 글자(그래핌)', '본 도구 총 글자수', '코드포인트', 'UTF-8'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '안녕',            g: '2', l: '2', cp: '2', b: '6바이트' },
                  { t: '😀',              g: '1', l: '2', cp: '1', b: '4바이트' },
                  { t: '👍🏽 (피부색 조합)', g: '1', l: '4', cp: '2', b: '8바이트' },
                  { t: '🇰🇷 (국기)',        g: '1', l: '4', cp: '2', b: '8바이트' },
                  { t: '👨‍👩‍👧 (ZWJ 결합)',   g: '1', l: '8', cp: '5', b: '18바이트' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r.g}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.cp}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 문자 종류별 분석은 코드포인트 단위로 순회하므로 👨‍👩‍👧는 이모지 3 + 특수(ZWJ) 2로 집계됩니다.
            워드프로세서처럼 그래핌 단위로 세는 카운터와 값이 다를 수 있으니, 제출 대상 시스템이 어느 기준인지 먼저 확인하세요.
          </p>
        </div>

        {/* ── 3. SMS 한도 ── */}
        <div>
          <h2 className="g-h2">
            한국 SMS·LMS·MMS 글자수 한도
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: 'SMS (단문)',  b: '90바이트',  ko: '한글 약 45자',     en: '영문 90자',  c: 'var(--accent)' },
              { t: 'LMS (장문)',  b: '2,000바이트', ko: '한글 약 1,000자',  en: '영문 2,000자', c: 'var(--success)' },
              { t: 'MMS (멀티)', b: '2,000바이트 + 이미지', ko: '본문 약 1,000자', en: '제목 길이 한도는 발송 서비스마다 다름', c: 'var(--cat-sports)' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 18, color: 'var(--text)', marginBottom: 4 }}>{g.b}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{g.ko}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{g.en}</p>
              </div>
            ))}
          </div>
          <Callout tone="warn" title="90바이트를 넘으면 LMS로 넘어갑니다">
            자동 전환 여부와 과금 방식은 문자 발송 서비스마다 다르므로 사용하는 서비스의 요금 안내를 확인하세요.
            이모지는 EUC-KR에 없는 문자라 단문에 넣으면 깨지거나 장문·멀티 메시지로 처리될 수 있습니다 — 이런 문자가 있으면 계산기가 &lsquo;EUC-KR로 표현할 수 없는 문자&rsquo; 경고로 따로 알려 주고, EUC-KR 바이트 수에서는 뺍니다.
          </Callout>
        </div>

        {/* ── 4. SEO 메타 길이 가이드 ── */}
        <div>
          <h2 className="g-h2">
            SEO 메타 태그 권장 길이
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: 'HTML <title>',    range: '50~60자 (권장)',  c: 'var(--accent)', d: '구글은 고정 글자수 제한을 두지 않고 화면 폭·검색어에 따라 잘라 표시합니다. 잘림 기준은 글자 수가 아니라 픽셀 폭이라, 폭이 넓은 한글은 더 짧게 잡는 편이 안전합니다.' },
              { t: 'meta description',range: '120~160자 (권장)', c: 'var(--success)', d: '역시 고정 제한이 없습니다. 구글이 페이지 내용으로 스니펫을 다시 쓰는 경우도 많아, 정확한 길이보다 첫 문장에 핵심을 담는 편이 낫습니다.' },
              { t: 'Open Graph title', range: '40~60자 (권장)',  c: 'var(--cat-health)', d: '카카오톡·페이스북 공유 카드 제목.' },
              { t: 'Open Graph description', range: '80~120자 (권장)', c: 'var(--cat-sports)', d: '공유 카드 설명. 너무 길면 줄임.' },
              { t: '이메일 제목',        range: '50자 (모바일 권장)', c: 'var(--cat-life)', d: '받은편지함 폭에 따라 달라지는 경험칙입니다. 데스크탑은 78자 안팎.' },
              { t: 'URL slug',          range: '50~70자 (권장)',  c: 'var(--cat-unit)', d: '검색엔진과 공유 시 가독성 균형.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{g.t}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{g.range}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65 }}>{g.d}</p>
              </div>
            ))}
          </div>
          <p className="g-note">
            ※ 위 범위는 규격이 아니라 업계에서 통용되는 경험칙입니다. 구글 문서는 title·description에 고정 글자수 제한이 없다고 밝히고,
            Open Graph 명세(ogp.me)에도 길이 규정은 없습니다. 공유 카드·검색 결과가 잘리는 지점은 기기 화면 폭과 글꼴에 따라 달라지므로 핵심 단어를 앞쪽에 두는 것이 가장 확실한 대응입니다.
          </p>
        </div>

        {/* ── 플랫폼 공식 한도 ── */}
        <div>
          <h2 className="g-h2">
            주요 플랫폼 글자수 한도 — 공식 문서 확인값
          </h2>
          <p className="g-p">
            플랫폼 글자수 제한은 블로그마다 값이 제각각이라, 공식 고객센터·공식 명세로 확인되는 값 위주로 정리했습니다.
            입력한 텍스트가 각 한도의 몇 %인지 실시간 비교는 계산기의 &lsquo;플랫폼별 제한&rsquo; 탭에서 할 수 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', '한도', '비고'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 1 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { s: '유튜브 동영상 제목',       l: '100자',      n: '고객센터 명시. 유효하지 않은 문자 포함 불가' },
                  { s: '유튜브 동영상 설명',       l: '5,000자',    n: '고객센터 명시' },
                  { s: 'X(트위터) 게시물',         l: '280 가중치', n: '한글·이모지 = 2, 영문·숫자 = 1 → 한글만 쓰면 약 140자' },
                  { s: '인스타그램 캡션',          l: '2,200자',    n: '피드에서는 앞 몇 줄만 보이고 ‘더 보기’로 접힘 (노출 길이는 공식 수치 없음)' },
                  { s: '인스타그램 프로필 소개',   l: '150자',      n: '인스타그램 고객센터 명시' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ X 가중치는 공식 오픈소스 twitter-text 설정값(기본 가중치 2, 라틴 문자 등 일부 구간만 1, 총 280 한도)을 따른 것입니다.
            네이버 블로그·카카오톡처럼 공식 문서에 한도가 명시되지 않은 서비스는 표에서 제외했으며, 플랫폼 정책은 수시로 바뀔 수 있으니
            제출 직전 해당 서비스에서 최종 확인을 권장합니다.
          </p>
        </div>

        {/* ── 5. 자기소개서 가이드 ── */}
        <div>
          <h2 className="g-h2">
            자기소개서·이력서 — 제한 글자수를 분량으로 환산하면
          </h2>
          <p className="g-p">
            자기소개서 문항의 글자수 제한은 기업·공고·문항마다 다르고 공통 규격이 없습니다. 계산기의 &lsquo;플랫폼별 제한&rsquo; 탭에 있는 자기소개서 항목(500·1,000·2,000·4,000자)도
            규정이 아니라 <strong>자주 보이는 분량을 모아 둔 편의 프리셋</strong>이니, 실제 한도는 반드시 채용 공고와 지원 시스템의 입력창에서 확인하세요.
            대신 한도가 정해졌을 때 그 분량이 어느 정도인지 감을 잡는 데는 아래 환산이 쓸모 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['제한 (공백 포함)', '200자 원고지', '묵독 (300자/분)', '소리 내 읽기 (150자/분)', '한글만일 때 UTF-8'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COVER_LETTER_ROWS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{r.limit.toLocaleString('ko-KR')}자</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{r.sheets}매</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{r.read}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{r.speak}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>최대 {r.utf8.toLocaleString('ko-KR')}바이트</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            제출 전에 확인할 것은 세 가지입니다. ① 한도가 <strong>공백 포함인지 제외인지</strong> — 공고에 별말이 없으면 입력창에 직접 붙여 넣어 남은 글자수 표시로 확인하는 것이 가장 정확합니다.
            ② <strong>바이트 제한</strong>인지 — 오래된 채용 시스템 중에는 글자가 아니라 바이트로 세는 곳이 있어, 한글 1자가 2바이트(EUC-KR)나 3바이트(UTF-8)로 계산되면 같은 &lsquo;1,000&rsquo;이라도 쓸 수 있는 한글은 500자나 333자로 줄어듭니다.
            ③ <strong>줄바꿈</strong> — 본 도구는 1글자로 세지만 서버에서 2글자로 세는 시스템이 있습니다(아래 자주 묻는 질문 &lsquo;줄바꿈도 글자수에 들어가나요?&rsquo; 참고).
          </p>
        </div>

        {/* ── 5-2. 원고지 매수 ── */}
        <div>
          <h2 className="g-h2">
            원고지 매수 계산 기준
          </h2>
          <p className="g-p">
            국내에서 통용되는 원고지는 <strong style={{ color: 'var(--text)' }}>200자 원고지(20자 × 10행)</strong>입니다.
            본 도구의 원고지 매수는 <strong style={{ color: 'var(--text)' }}>공백 포함 글자수 ÷ 200을 올림</strong>한 값으로,
            띄어쓰기도 원고지에서 한 칸을 차지하기 때문에 공백 포함으로 세는 것이 관례입니다.
          </p>
          <ul className="g-list">
            <li><strong>대입 논술·논술 학원 과제</strong> — &quot;원고지 5매 내외(1,000자)&quot;처럼 분량이 원고지 매수로 제시되는 대표 사례입니다.</li>
            <li><strong>백일장·문학 공모전</strong> — 시·수필·단편 부문에서 &quot;200자 원고지 ○매 이내&quot; 규정이 여전히 널리 쓰입니다.</li>
            <li><strong>주의</strong> — 실제 원고지에 옮겨 쓰면 문단 첫 칸 들여쓰기, 문단이 바뀔 때 남는 칸 때문에 계산값보다 1~2매 더 나올 수 있습니다. 제출 규정이 엄격하면 여유를 두세요.</li>
          </ul>
        </div>

        {/* ── 6. 묵독·발화 시간 ── */}
        <div>
          <h2 className="g-h2">
            묵독·발화 시간 추정
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '18px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>묵독 시간(분)</span> = 글자수 ÷ 300</div>
            <div><span style={{ color: 'var(--muted)' }}>발화 시간(분)</span> = 글자수 ÷ 150</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 300·150은 계산기에 설정된 가정값이며 공식 평균 통계가 아닙니다. 글자수는 공백 포함 기준입니다.</div>
          </div>
          <div className="tableScroll" style={{ marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['예시 분량', '묵독', '발화'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {READING_ROWS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.label} <span style={{ color: 'var(--muted)' }}>({r.chars.toLocaleString('ko-KR')}자)</span></td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.read}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.speak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 표의 시간은 계산기와 같은 식(공백 포함 글자수 ÷ 300, ÷ 150)과 같은 표시 형식으로 만든 값입니다. 읽고 말하는 속도는 사람·글의 난이도·목적에 따라 차이가 크므로,
            발표·영상 원고처럼 시간이 중요한 글은 이 값을 출발점으로 삼고 실제로 소리 내어 읽으며 초시계로 한 번 재 보는 것이 정확합니다.
          </p>
        </div>

        {/* 운영자 노트 — 자가출판 분량 */}
        <Callout tone="note" title="자가출판 분량, 글자수로 가늠하기">
          <p>
            종이책은 판형·글자 크기에 따라 다르지만 대략 한 페이지에 1,000자 정도 들어갑니다. 참고로 제가 쓰고 있는 만세력 책을 이 도구로 세어보니 323,364자였는데, 그대로 환산하면 약 320페이지짜리 책이 됩니다. 전자책은 기기·폰트 설정마다 페이지가 달라져 글자수로 보는 편이 정확합니다.
          </p>
        </Callout>

        {/* ── 7. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/dev/base64',        icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트·파일·JWT Base64 변환' },
              { href: '/tools/dev/json',          icon: '📋', name: 'JSON 포맷터',          desc: 'JSON 정렬·압축·트리·검증' },
              { href: '/tools/art/lorem',         icon: '📝', name: '더미 텍스트 생성기',   desc: 'Lorem Ipsum·한글 더미' },
              { href: '/tools/art/color',         icon: '🎨', name: '색상 코드 변환기',     desc: 'HEX·RGB·HSL 변환' },
              { href: '/tools/dev/css-converter', icon: '🎨', name: 'CSS 단위 변환기',         desc: 'px·rem·em·clamp() 변환' },
              { href: '/tools/unit/converter',    icon: '📐', name: '단위 변환기',           desc: '시간·길이·무게 등 14종 통합 변환' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-m)',
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
    </ToolPage>
  )
}
