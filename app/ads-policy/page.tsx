/* app/ads-policy/page.tsx (server) — 광고 게재 원칙 (§10.18 신규 페이지 · 푸터 '광고' 고지의 상세)
   ─ 현재 광고 = Google 자동 광고(layout의 AutoAds, lib/ads ADS_ENABLED)뿐. 저장소에 slotId를 준 수동 AdSlot이 없으므로
     '광고 라벨·예약 높이·자리 제한'은 현재형으로 쓰지 않는다(자동 광고의 위치·개수는 Google이 정함) — 수동 슬롯 도입 시 원칙으로만 둔다.
     수동 슬롯(AdSlot 개편 + 실제 slotId 등록)이 들어가면 '앞으로' 소절을 현재형으로 올리고 변경 이력에 날짜를 남길 것.
   ─ 앵커·전면(비네트) 광고는 운영자가 AdSense 콘솔에서 꺼진 것을 확인하기 전까지 언급하지 않는다.
   ─ 제외 목록은 lib/ads(AD_EXCLUDED_PATHS·AD_REVIEW_MODE·AD_REVIEW_EXCLUDED_PATHS)에서 빌드 시 읽는다 — 화면과 실제 게이팅이 어긋나지 않게.
   ─ 이 페이지 자체도 광고 없음(AD_ALLOWED_PATHS 밖). */
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { allTools } from '@/lib/tools'
import { AD_EXCLUDED_PATHS, AD_REVIEW_MODE, AD_REVIEW_EXCLUDED_PATHS } from '@/lib/ads'
import Callout from '@/components/Callout'
import TrustPage, { AuthorMeta, dot } from '../_trust/TrustPage'
import s from '../_trust/trust.module.css'

export const metadata = buildMetadata({
  path: '/ads-policy',
  title: '광고 게재 원칙 — 광고가 나오는 곳·제외 페이지·제휴 표시',
  description: 'Youtil의 광고(Google AdSense 자동 광고)가 나오는 페이지와 나오지 않는 페이지, 광고를 싣지 않는 민감 주제 도구, 직접 광고 자리를 둘 때의 원칙, 제휴·협찬 표시 원칙을 공개합니다.',
})

const UPDATED = '2026-09-26'

const TOC = [
  { id: 'where', label: '광고가 나오는 곳' },
  { id: 'not', label: '광고를 두지 않는 곳' },
  { id: 'manual', label: '직접 광고 자리를 둘 때의 원칙' },
  { id: 'privacy', label: '광고와 개인정보' },
  { id: 'affiliate', label: '제휴·협찬 표시 원칙' },
  { id: 'history', label: '변경 이력' },
]

const TOOL_NAME = new Map(allTools.map(t => [t.href, t.name]))
const namesOf = (paths: readonly string[]) => paths.map(p => TOOL_NAME.get(p)).filter((n): n is string => !!n)
const sensitive = namesOf(AD_EXCLUDED_PATHS)
const reviewOnly = AD_REVIEW_MODE ? namesOf(AD_REVIEW_EXCLUDED_PATHS) : []

export default function AdsPolicyPage() {
  return (
    <TrustPage
      path="/ads-policy"
      eyebrow="운영 원칙"
      icon="flag"
      title="광고 게재 원칙"
      lead={<>Youtil은 무료로 운영하고, 운영비는 <strong>Google AdSense 광고</strong> 수익으로 충당하는 구조입니다. 광고가 계산과 읽기를 방해하지 않도록 지키는 원칙을 적었습니다.</>}
      meta={[
        <AuthorMeta key="a" />,
        <>최종 업데이트 <time dateTime={UPDATED}>{dot(UPDATED)}</time></>,
      ]}
      toc={TOC}
    >
      <h2 id="where">광고가 나오는 곳</h2>
      <p>
        광고는 <strong>도구 페이지</strong>에만 나옵니다. 현재 도구 페이지의 광고는 <strong>Google 자동 광고</strong>로 게재되며,
        페이지 안의 위치와 개수는 Google이 정합니다. 운영자가 정하는 것은 광고가 나올 수 있는 페이지(도구 페이지만)와 아래 제외 목록입니다.
      </p>
      <p>광고를 눌러 달라고 요청하지 않고, 광고를 누르게 만드는 문구나 배치를 쓰지 않습니다.</p>

      <h2 id="not">광고를 두지 않는 곳</h2>
      <ul>
        <li><strong>운영 문서와 안내 화면</strong> — 소개, 문의, 편집·검산 원칙, 업데이트 기록, 이 페이지, 개인정보처리방침, 이용약관, 면책조항, 찾을 수 없는 페이지(404). 오류 화면에서는 광고 요청을 멈추도록 해 두었습니다.</li>
        <li><strong>목록 페이지</strong> — 지금은 홈, 전체 도구, 분야 목록, 상황별 가이드에도 광고를 두지 않습니다.</li>
        {sensitive.length > 0 && (
          <li><strong>민감한 주제의 도구</strong> — 주류·도박과 가까운 주제, 민감한 건강 정보를 다루는 도구에는 광고를 싣지 않습니다: {sensitive.join(', ')}.</li>
        )}
        {reviewOnly.length > 0 && (
          <li><strong>화면 조작이 주목적인 도구</strong> — 타이머·측정·게임처럼 읽기보다 조작이 중심인 화면에는 현재 광고를 싣지 않습니다: {reviewOnly.join(', ')}.</li>
        )}
      </ul>

      <h2 id="manual">직접 광고 자리를 둘 때의 원칙</h2>
      <p>
        지금은 운영자가 직접 배치한 광고 자리가 없습니다. 앞으로 자동 광고 대신 광고 자리를 직접 정하게 되면 아래 원칙을 지키고,
        바뀐 날짜를 이 페이지 아래 변경 이력과 <Link href="/updates">업데이트 기록</Link>에 적겠습니다.
      </p>
      <div className={`tableScroll ${s.tableWrap}`}>
        <table className={s.table}>
          <caption>직접 배치할 때 쓸 광고 자리(도구 페이지)</caption>
          <thead><tr><th scope="col">자리</th><th scope="col">조건</th></tr></thead>
          <tbody>
            <tr><td>결과 카드 아래</td><td>결과를 다 본 뒤에 오도록 결과 <strong>아래</strong>에만 둡니다. 버튼과 충분히 떨어뜨립니다.</td></tr>
            <tr><td>설명 글 중간</td><td>설명 섹션이 3개 이상인 글에서 두 번째 섹션 뒤에 한 번. 표나 안내 상자 바로 옆에는 두지 않습니다.</td></tr>
            <tr><td>오른쪽 사이드</td><td>화면이 넓을 때(1200px 이상)만 목차 아래에 한 개.</td></tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>결과 숫자 위, 입력하는 계산기 카드 안, 자주 묻는 질문·참고 자료·면책 안내 사이에는 두지 않습니다.</li>
        <li>휴대폰에서는 한 페이지에 광고를 세 개보다 많이 두지 않습니다.</li>
        <li>모든 광고 자리에 <strong>&lsquo;광고&rsquo;</strong>라는 표시와 위아래 구분선을 붙여, 계산기나 추천 도구로 오해하지 않게 합니다.</li>
        <li>광고 자리의 높이를 미리 잡아 두어, 광고가 늦게 뜨면서 읽던 글이 밀려나지 않게 합니다. 광고 코드가 없는 자리는 빈칸을 남기지 않습니다.</li>
      </ul>

      <h2 id="privacy">광고와 개인정보</h2>
      <p>
        Google은 광고를 보여 주기 위해 쿠키를 쓸 수 있고, 방문 기록에 따라 맞춤 광고를 보여 줄 수 있습니다. 맞춤 광고를 끄는 방법은
        <Link href="/privacy#cookies"> 개인정보처리방침</Link>에 있습니다. 계산기에 입력한 건강·재무 값은 광고의 대상 설정에 쓰지 않습니다.
      </p>

      <h2 id="affiliate">제휴·협찬 표시 원칙</h2>
      <p>
        현재 Youtil에는 <strong>제휴(어필리에이트) 링크, 협찬을 받고 쓴 글, 유료로 순서를 바꾼 목록이 없습니다.</strong> 앞으로 제휴 링크를 쓰게 되면 다음을 지킵니다.
      </p>
      <ol className={s.steps}>
        <li><b>링크 가까이에 밝힙니다</b><span>제휴 링크나 협찬 내용 바로 옆에 &lsquo;제휴 링크&rsquo;·&lsquo;협찬&rsquo;을 적습니다. 공정거래위원회 「추천·보증 등에 관한 표시·광고 심사지침」의 표시 방식을 따릅니다.</span></li>
        <li><b>계산과 순위에 섞지 않습니다</b><span>제휴 여부가 계산 결과, 설명, 도구 순위, 추천에 영향을 주지 않게 합니다.</span></li>
        <li><b>먼저 알립니다</b><span>도입하기 전에 이 페이지와 <Link href="/updates">업데이트 기록</Link>에 날짜와 함께 적습니다.</span></li>
      </ol>

      <Callout tone="note" title="광고 관련 문의">
        광고가 계산을 가리거나 읽기를 방해하는 곳, 이 원칙과 다르게 보이는 곳이 있으면 <Link href="/contact">문의·오류 제보</Link>로 페이지 주소와 기기를 알려 주세요.
        확인해 광고 설정이나 제외 목록을 조정하겠습니다.
      </Callout>

      <h2 id="history">변경 이력</h2>
      <div className={`tableScroll ${s.tableWrap}`}>
        <table className={s.table}>
          <thead><tr><th scope="col">날짜</th><th scope="col">내용</th></tr></thead>
          <tbody>
            <tr><td><time dateTime="2026-09-26">{dot('2026-09-26')}</time></td><td>광고 게재 원칙 문서를 새로 만들었습니다.</td></tr>
          </tbody>
        </table>
      </div>
    </TrustPage>
  )
}
