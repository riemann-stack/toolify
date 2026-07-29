import Link from 'next/link'
import CharCountClient from './CharCountClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/art/charcount',
  title: '글자수 세기 — 공백 포함·제외·원고지 매수·목표 글자수·SNS 제한',
  description: '공백 포함·제외 실시간 카운트 + 목표 글자수 카운트다운 + 원고지 매수. 자소서·SNS·논문 글자 수 체크와 바이트 분석, 자동 저장.',
  keywords: ['글자수세기', '글자수계산기', '자수세기', '단어수세기', '원고지매수', '원고지계산', '목표글자수', 'UTF-8바이트', 'SMS바이트계산', '트위터가중치', '자기소개서글자수', '플랫폼글자수제한', 'meta description 길이'],
})

const FAQ_LD = [
              { q: '공백을 글자수에 포함해야 하나요?', a: '플랫폼·문서 종류에 따라 다릅니다. <strong>SNS·자기소개서</strong>는 보통 공백 포함, <strong>학술 논문 분량 측정</strong>은 공백 제외가 일반적입니다. 본 도구는 두 값을 모두 표시하므로 양식에 맞게 사용하세요.' },
              { q: '이모지는 몇 글자로 세야 하나요?', a: '세는 기준에 따라 다릅니다. 본 도구의 총 글자수는 UTF-16 코드 유닛(JavaScript String.length) 기준이라 😀 같은 기본 이모지 1개가 <strong>2글자</strong>, 👨‍👩‍👧 같은 결합 이모지는 8글자로 집계됩니다. UTF-8 바이트로는 기본 이모지 1개가 4바이트이고, X(트위터)는 이모지를 가중치 2로 계산합니다.' },
              { q: '한글 자모(ㄱㄴㄷ)는 어떻게 세나요?', a: '본 도구는 자모(ㄱ, ㅏ 등)와 완성형 한글(가, 나)을 모두 한글로 카운트하며 별도 통계로 분리해 보여줍니다. 자모만 입력된 경우 일반적인 한글로 인식되지 않을 수 있어 입력 검증이 필요합니다.' },
              { q: 'X(트위터) 글자수가 280인데 한글로는 왜 140자인가요?', a: 'X는 영문/숫자/일부 라틴 문자를 가중치 1, 한글·중국어·일본어·이모지를 가중치 2로 계산해 <strong>총 280 가중치 한도</strong>를 적용합니다. 한글로만 글을 쓰면 약 140자가 한계입니다.' },
              { q: '원고지 1매는 몇 자인가요?', a: '가장 널리 쓰이는 200자 원고지 기준으로 <strong>1매 = 20자 × 10행 = 200자</strong>입니다. 본 도구의 원고지 매수는 공백 포함 글자수를 200으로 나눠 올림한 값입니다. 띄어쓰기도 원고지에서 한 칸을 차지하므로 공백 포함으로 세는 것이 관례이며, 실제 원고지에 옮겨 쓰면 문단 들여쓰기·줄 바꿈 여백 때문에 계산값보다 다소 늘어날 수 있습니다.' },
            ]

export default function CharCountPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        예술·창작
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="art" />글자수 세기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        공백 포함·제외 <strong style={{ color: 'var(--text)' }}>실시간 카운트</strong>. SNS·자소서·논문 글자 수 체크.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="총 글자수 = UTF-16 코드 유닛(String.length) 기준 · 플랫폼 한도는 공식 문서 확인값"
        sources={[
          { label: '유튜브 고객센터', href: 'https://support.google.com/youtube/answer/57404?hl=ko' },
          { label: 'X twitter-text 공식 설정', href: 'https://github.com/twitter/twitter-text/blob/master/config/v3.json' },
        ]}
      />

      <CharCountClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 무엇을 측정하나 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            글자수 vs 바이트 — 정확히 알아야 할 차이
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '글자수 (Length)',     c: 'var(--accent)', d: '문자 1개를 1로 셉니다. 한글 "안녕" = 2글자. JavaScript의 string.length와 동일.' },
              { t: 'UTF-8 바이트',        c: '#059669',       d: '웹 표준 인코딩. 한글 1자 = 3바이트, 영문/숫자 = 1바이트, 이모지 = 4바이트.' },
              { t: 'EUC-KR 바이트',       c: '#A16207',       d: '한국 SMS·구형 시스템. 한글 1자 = 2바이트, 영문/숫자 = 1바이트.' },
              { t: 'X(트위터) 가중치',     c: '#0891B2',       d: '한글·이모지 1자 = 가중치 2. 280 weight 한도. 한글만으로는 약 140자.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 한글 1자의 진실 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한글 1자는 몇 바이트?
          </h2>
          <div style={{ overflowX: 'auto' }}>
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
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.e}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.k}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.em}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 결합 이모지·그래핌 단위 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            결합 이모지 👨‍👩‍👧는 왜 8글자로 세어질까
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            가족 이모지 👨‍👩‍👧는 눈에는 1글자지만, 실제로는 👨·👩·👧 세 이모지를 폭이 없는 결합 문자 <strong style={{ color: 'var(--text)' }}>ZWJ(U+200D)</strong> 2개로
            이어 붙인 시퀀스입니다. 어떤 단위로 세느냐에 따라 1(그래핌)·5(코드포인트)·8(UTF-16 코드 유닛)로 답이 전부 달라지는데,
            글자수 카운터마다 결과가 다른 이유가 바로 이것입니다. 본 도구의 총 글자수는 JavaScript <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text)' }}>String.length</span>와
            같은 <strong style={{ color: 'var(--text)' }}>UTF-16 코드 유닛 기준</strong>입니다. HTML 표준의 입력창 <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text)' }}>maxlength</span>도
            같은 코드 유닛 단위로 정의되어 있어, 웹 입력 폼의 글자수 제한과 대부분 일치합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
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
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.cp}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginTop: 10 }}>
            ※ 문자 종류별 분석은 코드포인트 단위로 순회하므로 👨‍👩‍👧는 이모지 3 + 특수(ZWJ) 2로 집계됩니다.
            워드프로세서처럼 그래핌 단위로 세는 카운터와 값이 다를 수 있으니, 제출 대상 시스템이 어느 기준인지 먼저 확인하세요.
          </p>
        </div>

        {/* ── 3. SMS 한도 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 SMS·LMS·MMS 글자수 한도
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: 'SMS (단문)',  b: '90바이트',  ko: '한글 약 45자',     en: '영문 90자',  c: 'var(--accent)' },
              { t: 'LMS (장문)',  b: '2,000바이트', ko: '한글 약 1,000자',  en: '영문 2,000자', c: '#059669' },
              { t: 'MMS (멀티)', b: '2,000바이트 + 이미지', ko: '본문 약 1,000자', en: '제목 30바이트', c: '#A16207' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text)', marginBottom: 4 }}>{g.b}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{g.ko}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{g.en}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(234,88,12,0.05)',
            border: '1px solid rgba(234,88,12,0.30)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ⚠️ <strong style={{ color: '#EA580C' }}>주의:</strong> 통신사 정책상 1바이트라도 초과하면 LMS·MMS로 자동 전환되어 발송 단가가 올라갑니다.
            마케팅 문자는 SMS(45자) 안에 핵심을 담으세요.
          </div>
        </div>

        {/* ── 4. SEO 메타 길이 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            SEO 메타 태그 권장 길이
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: 'HTML <title>',    range: '50~60자',  c: 'var(--accent)', d: '구글 검색결과 모바일 최대 50자, 데스크탑 60자 표시. 초과 시 "..." 잘림.' },
              { t: 'meta description',range: '120~160자', c: '#059669',       d: '검색결과 스니펫. 모바일 120자, 데스크탑 160자 표시.' },
              { t: 'Open Graph title', range: '40~60자',  c: '#0891B2',       d: '카카오톡·페이스북 공유 카드 제목.' },
              { t: 'Open Graph description', range: '80~120자', c: '#A16207', d: '공유 카드 설명. 너무 길면 줄임.' },
              { t: '이메일 제목',        range: '50자 (모바일)', c: '#EA580C', d: '받은편지함에서 짤리지 않는 안전 길이. 데스크탑은 78자.' },
              { t: 'URL slug',          range: '50~70자',  c: '#9B59B6',       d: '검색엔진과 공유 시 가독성 균형.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${g.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{g.t}</p>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{g.range}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 플랫폼 공식 한도 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            주요 플랫폼 글자수 한도 — 공식 문서 확인값
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            플랫폼 글자수 제한은 블로그마다 값이 제각각이라, 공식 고객센터·공식 명세로 확인되는 값 위주로 정리했습니다.
            입력한 텍스트가 각 한도의 몇 %인지 실시간 비교는 계산기의 &lsquo;플랫폼별 제한&rsquo; 탭에서 할 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
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
                  { s: '인스타그램 캡션',          l: '2,200자',    n: '피드에서는 처음 125자만 보이고 이후 더 보기로 접힘' },
                  { s: '인스타그램 프로필 소개',   l: '150자',      n: '복수 가이드 일치값' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginTop: 10 }}>
            ※ X 가중치는 공식 오픈소스 twitter-text 설정값(기본 가중치 2, 라틴 문자 등 일부 구간만 1, 총 280 한도)을 따른 것입니다.
            네이버 블로그·카카오톡처럼 공식 문서에 한도가 명시되지 않은 서비스는 표에서 제외했으며, 플랫폼 정책은 수시로 바뀔 수 있으니
            제출 직전 해당 서비스에서 최종 확인을 권장합니다.
          </p>
        </div>

        {/* ── 5. 자기소개서 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자기소개서·이력서 글자수 가이드
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['상황', '권장 글자수', '비고'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i === 1 ? 'right' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
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
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5-2. 원고지 매수 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            원고지 매수 계산 기준
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            국내에서 통용되는 원고지는 <strong style={{ color: 'var(--text)' }}>200자 원고지(20자 × 10행)</strong>입니다.
            본 도구의 원고지 매수는 <strong style={{ color: 'var(--text)' }}>공백 포함 글자수 ÷ 200을 올림</strong>한 값으로,
            띄어쓰기도 원고지에서 한 칸을 차지하기 때문에 공백 포함으로 세는 것이 관례입니다.
          </p>
          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 2 }}>
            <li><strong style={{ color: 'var(--text)' }}>대입 논술·논술 학원 과제</strong> — &quot;원고지 5매 내외(1,000자)&quot;처럼 분량이 원고지 매수로 제시되는 대표 사례입니다.</li>
            <li><strong style={{ color: 'var(--text)' }}>백일장·문학 공모전</strong> — 시·수필·단편 부문에서 &quot;200자 원고지 ○매 이내&quot; 규정이 여전히 널리 쓰입니다.</li>
            <li><strong style={{ color: 'var(--text)' }}>주의</strong> — 실제 원고지에 옮겨 쓰면 문단 첫 칸 들여쓰기, 문단이 바뀔 때 남는 칸 때문에 계산값보다 1~2매 더 나올 수 있습니다. 제출 규정이 엄격하면 여유를 두세요.</li>
          </ul>
        </div>

        {/* ── 6. 묵독·발화 시간 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{r.t}</p>
                <p style={{ fontSize: 12, color: 'var(--text)' }}>📖 묵독 <strong style={{ color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.r}</strong></p>
                <p style={{ fontSize: 12, color: 'var(--text)' }}>🎙️ 발화 <strong style={{ color: '#0891B2', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.s}</strong></p>
              </div>
            ))}
          </div>
        </div>

        {/* 운영자 노트 — 자가출판 분량 */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>📖 자가출판 분량, 글자수로 가늠하기</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
            종이책은 판형·글자 크기에 따라 다르지만 대략 한 페이지에 1,000자 정도 들어갑니다. 참고로 제가 쓰고 있는 만세력 책을 이 도구로 세어보니 323,364자였는데, 그대로 환산하면 약 320페이지짜리 책이 됩니다. 전자책은 기기·폰트 설정마다 페이지가 달라져 글자수로 보는 편이 정확합니다.
          </p>
        </div>

        {/* ── 7. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
