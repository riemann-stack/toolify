/* app/editorial-policy/page.tsx (server) — 편집·검산 원칙 (스펙 §10.18 신규 페이지 · §1.2 '과장·자가 인증' · critique §3-4·3-5)
   ─ 숫자(출처 표기 도구 수·검산 도구 수)는 lib/toolMeta에서 빌드 시 집계한다 — 손으로 쓴 현황 숫자 금지.
   ─ AI 사용 고지는 저장소 기록(AI 보조 커밋)과 맞게, 과장·축소 없이. 운영자 = SITE_OPERATOR(리만, 1인).
     git 기록상 오류 감사·1차 출처 웹 대조도 AI 에이전트가 수행했다(3caeb55·845c583 등) → 출처 대조를 운영자 단독 업무로 쓰지 않는다.
   ─ 도구 머리 표기는 현재 상태대로: UpdatedMeta('기준 점검' + 기준 + 출처)가 있는 도구만. 작성자·git '최종 업데이트'는
     ToolPage/ToolHeader 코드모드 이후에 보인다 → '바꾸는 중'으로 쓴다(코드모드가 들어가면 현재형으로 되돌릴 것).
   ─ CI(tsc·test·build)는 main 푸시·PR에서 돈다. Vercel 배포를 막는 게이트는 아니므로 '배포할 때마다'라고 쓰지 않는다. */
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { allTools } from '@/lib/tools'
import { getToolMeta } from '@/lib/toolMeta'
import TrustPage, { AuthorMeta, OperatorCard, dot } from '../_trust/TrustPage'
import { UPDATES } from '../_trust/updatesData'
import s from '../_trust/trust.module.css'

export const metadata = buildMetadata({
  path: '/editorial-policy',
  title: '편집·검산 원칙 — 자료, 검산, AI 사용, 정정',
  description: 'Youtil 계산기를 누가 어떤 자료로 만들고, 어떻게 검산·정정하는지 공개합니다. 법정 수치는 공식 출처와 대조해 반영하고, AI 도구 사용 범위와 경험담 원칙, 기준 점검 주기를 밝힙니다.',
})

const UPDATED = '2026-09-26'

const TOC = [
  { id: 'who', label: '누가 만드나요' },
  { id: 'sources', label: '어떤 자료를 쓰나요' },
  { id: 'build', label: '계산기를 만드는 순서' },
  { id: 'status', label: '검산 현황' },
  { id: 'ai', label: 'AI 도구를 쓰는 범위' },
  { id: 'cadence', label: '기준 점검 주기와 날짜 표기' },
  { id: 'corrections', label: '오류 정정 절차' },
  { id: 'experience', label: '경험담 원칙' },
  { id: 'independence', label: '광고와 편집의 분리' },
]

/* ── 빌드 시 집계 (toolMeta = 페이지 출처·골든 테스트 기록에서 생성된 단일 소스) ── */
const metas = allTools.map(t => ({ t, m: getToolMeta(t.href) }))
const withSources = metas.filter(x => (x.m?.sources.length ?? 0) > 0).length
const verified = metas.filter(x => x.m?.verified).map(x => ({ name: x.t.name, href: x.t.href, v: x.m!.verified! }))
const verifiedCases = verified.reduce((n, x) => n + x.v.cases, 0)
const reviewedCount = metas.filter(x => !!x.m?.reviewed).length
const fixCount = UPDATES.filter(u => u.kind === 'fix').length

export default function EditorialPolicyPage() {
  return (
    <TrustPage
      path="/editorial-policy"
      eyebrow="운영 원칙"
      icon="shield"
      title="편집·검산 원칙"
      lead={<>Youtil의 계산기와 설명을 누가, 어떤 자료로, 어떻게 만들고 고치는지 적은 문서입니다. 이 원칙과 다르게 된 곳을 발견하면 <Link href="/contact">알려 주세요</Link>.</>}
      meta={[
        <AuthorMeta key="a" />,
        <>최종 업데이트 <time dateTime={UPDATED}>{dot(UPDATED)}</time></>,
      ]}
      toc={TOC}
    >
      <h2 id="who">누가 만드나요</h2>
      <p>
        Youtil의 계산기와 설명은 운영자 <strong>리만</strong> 한 사람이 만들고 고칩니다. 편집팀·외부 필진·감수자는 없습니다.
        페이지에 적힌 &lsquo;작성 리만&rsquo;은 이 사실을 그대로 적은 것이며, 있지 않은 자격이나 소속을 내세우지 않습니다.
      </p>
      <OperatorCard sub="필명을 쓰는 1인 운영자 · 기획·개발·자료 확인·문의 응답" link />

      <h2 id="sources">어떤 자료를 쓰나요</h2>
      <ul>
        <li><strong>법정 수치</strong>(세율, 4대보험 요율, 최저임금, 공휴일, 국민연금 기준소득월액 등)는 법령 원문, 정부 고시, 담당 기관 발표만 근거로 씁니다.</li>
        <li><strong>과학·기술 수치</strong>는 국제 표준, 제조사 공식 사양, 학술 논문 같은 1차 자료를 우선합니다.</li>
        <li><strong>통계</strong>는 통계를 낸 기관의 원자료를 쓰고, 어느 해 자료인지 함께 적습니다(예: 국세청 연말정산 국세통계, 국가데이터처 생명표).</li>
        <li>공식 기록이 없는 통용 정보(예: 노래의 음역)는 여러 자료를 서로 대조해 통용되는 값을 씁니다.</li>
      </ul>
      <p>
        여러 계산기가 함께 쓰는 법정 수치는 사이트 전체가 <strong>한 곳에 둔 값</strong>을 씁니다. 소득세 누진세율, 4대보험 요율과 최저시급, 공휴일, 취득세가 그렇습니다.
        개정이 있으면 그 한 곳을 고치고, 그 값을 쓰는 계산기가 함께 바뀝니다.
      </p>

      <h2 id="build">계산기를 만드는 순서</h2>
      <ol className={s.steps}>
        <li><b>기준을 먼저 정리합니다</b><span>공식 산식과 예시, 그리고 결과를 가르는 규칙(구간 경계, 반올림·절사, 날짜를 세는 방식)을 먼저 적어 둡니다.</span></li>
        <li><b>계산을 화면과 분리합니다</b><span>계산 로직은 화면 코드와 다른 파일에 두어 따로 검산할 수 있게 합니다.</span></li>
        <li><b>경계값을 검산합니다</b><span>구간이 바뀌는 지점, 월말·윤년, 0·음수·아주 큰 수를 스크립트로 대조하고, 수정할 때는 고치기 전후 결과를 비교합니다. 핵심 금융 계산은 기대값을 고정한 자동 테스트를 만들어, 코드를 main에 올릴 때마다 CI에서 다시 돌립니다.</span></li>
        <li><b>기준과 출처를 적습니다</b><span>적용 기준과 공식 출처를 도구 페이지에 적습니다. &lsquo;검산&rsquo; 표시는 자동 테스트가 실제로 통과한 도구에만 붙입니다.</span></li>
        <li><b>바뀌면 다시 봅니다</b><span>법령·고시가 바뀌면 해당 값을 고치고 관련 계산기를 다시 검산합니다.</span></li>
      </ol>

      <h2 id="status">검산 현황</h2>
      <p>아래 숫자는 사이트를 만들 때 도구 기록에서 자동으로 집계합니다. 원칙을 모두 지키지 못한 부분도 그대로 보여 드립니다.</p>
      <div className={s.stats}>
        <p className={s.stat}><span className={s.statV}>{allTools.length}<small>개</small></span><span className={s.statL}>전체 도구</span></p>
        <p className={s.stat}><span className={s.statV}>{withSources}<small>개</small></span><span className={s.statL}>공식 출처를 페이지에 표기한 도구</span></p>
        <p className={s.stat}><span className={s.statV}>{verified.length}<small>개</small></span><span className={s.statL}>자동 테스트로 검산하는 도구{verifiedCases > 0 ? ` (${verifiedCases.toLocaleString('ko-KR')}건)` : ''}</span></p>
      </div>
      {verified.length > 0 && (
        <div className={`tableScroll ${s.tableWrap}`}>
          <table className={s.table}>
            <caption>자동 테스트로 검산하는 도구와 범위</caption>
            <thead><tr><th scope="col">도구</th><th scope="col">검산 범위</th><th scope="col">케이스</th></tr></thead>
            <tbody>
              {verified.map(x => (
                <tr key={x.href}>
                  <td><Link href={x.href}>{x.name}</Link></td>
                  <td>{x.v.scope}{x.v.full ? '' : <small>일부 범위</small>}</td>
                  <td className="num">{x.v.cases}건</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p>
        출처 표기가 없는 {allTools.length - withSources}개 도구는 차례로 보강하고 있습니다. 표기가 없다고 근거 없이 만들었다는 뜻은 아니지만,
        읽는 분이 직접 확인할 수 있게 적는 것이 원칙이므로 아직 끝나지 않은 일로 봅니다.
        지금까지 공개한 정정은 {fixCount}건이며 <Link href="/updates">업데이트 기록</Link>에 있습니다.
      </p>

      <h2 id="ai">AI 도구를 쓰는 범위</h2>
      <p>Youtil은 소프트웨어와 AI의 도움을 받아 만듭니다. 숨길 일이 아니라고 생각해 범위를 적어 둡니다.</p>
      <ul>
        <li><strong>AI를 쓰는 일</strong> — 코드 작성과 정리, 자료 조사와 설명 초안, 검산 스크립트와 자동 테스트 작성, 오류 감사와 공식 출처 대조(교차 검증) 보조.</li>
        <li><strong>운영자가 직접 하는 일</strong> — 법정 수치의 최종 확인, 무엇을 게시하고 어떤 문구로 쓸지 정하는 일, 제보를 확인하고 답하는 일.</li>
        <li><strong>하지 않는 일</strong> — AI가 제시한 수치를 출처와 대조하지 않고 싣는 일, AI로 경험담·후기·사례를 지어내는 일.</li>
      </ul>
      <p>
        AI의 도움을 받아 고친 부분에서 새 불일치가 생겨 다시 고친 적도 있습니다. 그래서 계산을 고칠 때마다 고치기 전후 결과를 비교하고, 경계값을 다시 검산합니다.
      </p>

      <h2 id="cadence">기준 점검 주기와 날짜 표기</h2>
      <div className={`tableScroll ${s.tableWrap}`}>
        <table className={s.table}>
          <caption>법정 수치 점검 시점</caption>
          <thead><tr><th scope="col">시점</th><th scope="col">대상</th></tr></thead>
          <tbody>
            <tr><td>매년 1월</td><td>새해부터 적용되는 세법, 4대보험 요율, 최저임금, 실업급여 상·하한 등</td></tr>
            <tr><td>매년 7월</td><td>국민연금 기준소득월액 상·하한</td></tr>
            <tr><td>수시</td><td>공휴일 지정, 법령 개정, 기관 발표 수치 변경(공포·시행일 기준)</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        도구 머리에는 기준값을 확인한 <strong>기준 점검</strong> 시점을 적습니다(현재 {reviewedCount}개 도구). 개발 기록(git)에서 그 도구가 마지막으로 바뀐 날인
        <strong> 최종 업데이트</strong>도 함께 보이도록 바꾸는 중입니다. 이 날짜에는 디자인 일괄 변경처럼 내용이 그대로인 수정을 넣지 않고, 날짜만 새로 고치는 갱신도 하지 않습니다.
      </p>

      <h2 id="corrections">오류 정정 절차</h2>
      <ol className={s.steps}>
        <li><b>접수</b><span><Link href="/contact">문의·오류 제보</Link>나 이메일로 받습니다. 스스로 점검하다 찾은 오류도 같은 절차를 밟습니다.</span></li>
        <li><b>재현과 대조</b><span>같은 조건으로 계산해 보고 공식 자료·공식 모의계산기와 비교합니다.</span></li>
        <li><b>수정과 검산</b><span>틀린 곳을 고치고 경계값을 다시 검산합니다. 같은 원인이 다른 도구에도 있는지 함께 봅니다.</span></li>
        <li><b>기록</b><span>결과나 설명이 달라지는 정정은 무엇이 얼마나 틀렸는지와 함께 <Link href="/updates">업데이트 기록</Link>에 남깁니다. 정정 내역을 지우거나 숨기지 않습니다.</span></li>
        <li><b>답장</b><span>제보해 주신 분께 결과를 알려 드립니다. 평일 기준 1~3일 안에 답장합니다.</span></li>
      </ol>

      <h2 id="experience">경험담 원칙</h2>
      <p>
        설명에 들어가는 1인칭 경험담은 운영자가 실제로 겪은 것만 씁니다. 지금 도구 설명에 남아 있는 것은 자동차 엔진오일 교환 주기, 하프마라톤 기록,
        집필 중인 만세력 책의 원고 분량이고, 운영자가 겪은 일은 <Link href="/about#me">소개</Link>에 모아 두었습니다. 해 보지 않은 분야에는 경험담을 넣지 않고, 사용 후기나 사례를 지어내지 않습니다.
      </p>

      <h2 id="independence">광고와 편집의 분리</h2>
      <p>
        광고주나 제휴사는 계산 결과, 설명, 도구 순위에 관여하지 않습니다. 홈의 &lsquo;많이 찾는 계산기&rsquo; 순위는 실제 방문 통계(Google Analytics 조회수)로 매주 정합니다.
        현재 제휴 링크나 협찬 글은 없으며, 광고를 어디에 두고 어디에 두지 않는지는 <Link href="/ads-policy">광고 게재 원칙</Link>에 적었습니다.
      </p>
    </TrustPage>
  )
}
