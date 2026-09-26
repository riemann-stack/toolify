/* app/about/page.tsx (server) — 운영자 소개 (adsense P1-3 · critique §3-5 · 스펙 §1.2 '익명성')
   리만(필명)이 1인칭으로 쓰는 운영자 페이지. 규칙:
   ─ 저장소에 이미 공개된 사실만 쓴다: 필명 리만·1인 운영, 도구 설명에 넣었던 운영자 경험(3356009 — GV70 공기압·연비·오일 교환,
     밀양·고양 하프 기록, 집필 중인 만세력 책 323,364자), 검증 방식, 정정 기록(/updates), 광고로 운영비 충당, 수집 정보.
   ─ 도구 설명에 있는 1인칭 노트: tire-pressure(GV70 공기압)·fuel-economy(FAQ 연비)·car-cost(엔진오일)·race-predictor(하프)·charcount(원고).
     도구 쪽에서 문장이 빠지면 아래 '설명에도 적어 두었습니다' 링크를 같이 고칠 것.
   ─ 광고: 현재 Google 자동 광고뿐(수동 슬롯·'광고' 라벨 없음) → 라벨·자리 약속을 쓰지 않는다(/ads-policy와 같은 사실).
   ─ 자격·직장·학위·지어낸 경험 금지. 개인정보 보호책임자의 실명은 개인정보처리방침(법정 기재)에만 둔다.
   ─ 운영자 표기는 SITE_OPERATOR(푸터·JSON-LD·바이라인과 같은 값). */
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { categories, totalTools } from '@/lib/tools'
import { SITE_OPERATOR } from '@/components/SiteJsonLd'
import CatIcon from '@/components/CatIcon'
import TrustPage, { AuthorMeta, OperatorCard, dot } from '../_trust/TrustPage'
import s from '../_trust/trust.module.css'

export const metadata = buildMetadata({
  path: '/about',
  title: '소개 — Youtil을 혼자 만드는 리만입니다',
  description: 'Youtil은 필명 리만이 혼자 만들고 운영하는 생활 계산기 사이트입니다. 계산기를 만들고 검산하는 방법, 틀린 것을 고치는 방법, 운영비(광고)와 수집하지 않는 정보를 운영자가 직접 설명합니다.',
})

/** 이 문서를 마지막으로 고친 날 */
const UPDATED = '2026-09-26'

const TOC = [
  { id: 'why', label: 'Youtil은 무엇인가요' },
  { id: 'me', label: '직접 겪어 본 것들' },
  { id: 'method', label: '계산기를 만들고 확인하는 방법' },
  { id: 'fix', label: '틀린 것을 고치는 방법' },
  { id: 'money', label: '운영비와 광고' },
  { id: 'data', label: '모으는 정보, 모으지 않는 정보' },
  { id: 'tools', label: '분야별 도구' },
]

export default function AboutPage() {
  return (
    <TrustPage
      path="/about"
      eyebrow="소개"
      icon="user"
      title="Youtil을 혼자 만드는 리만입니다"
      lead={<>Youtil은 제가 <strong>혼자 기획하고, 코드를 쓰고, 자료를 확인하고, 문의에 답하는</strong> 1인 사이트입니다. 편집팀이나 외부 필진은 없습니다. 이 페이지에는 제가 무엇을 알고 무엇을 모르는지, 계산기를 어떻게 만들고 고치는지 적었습니다.</>}
      meta={[
        <AuthorMeta key="a" />,
        <>최종 업데이트 <time dateTime={UPDATED}>{dot(UPDATED)}</time></>,
      ]}
      toc={TOC}
    >
      <OperatorCard sub={<>필명을 쓰는 1인 운영자 · 2026년 4월 첫 배포 · 문의 <a href={`mailto:${SITE_OPERATOR.email}`}>{SITE_OPERATOR.email}</a></>} />

      <h2 id="why">Youtil은 무엇인가요</h2>
      <p>
        Youtil(Your Utility)은 월급 실수령액, 대출 이자, 만 나이, 평수처럼 생활하면서 자주 마주치는 계산을 한곳에서 해 볼 수 있게 만든 사이트입니다.
        지금은 {categories.length}개 분야에 {totalTools}개 도구가 있고, 로그인이나 설치 없이 브라우저에서 바로 계산합니다.
      </p>
      <p>
        제가 가장 신경 쓰는 것은 숫자 옆에 <strong>근거</strong>를 두는 일입니다. 세율이나 보험료율처럼 법으로 정해진 숫자에는 어느 시점의 어떤 자료를 썼는지 적고,
        그 자료가 바뀌면 계산기도 바꿉니다. 결과는 어디까지나 참고용 추정치이며, 세무·의료·법률 판단을 대신하지 않습니다(<Link href="/disclaimer">면책조항</Link>).
      </p>

      <h2 id="me">직접 겪어 본 것들</h2>
      <p>
        세금·보험·건강처럼 전문 분야의 숫자는 제 판단 대신 공식 자료를 따릅니다.
        다만 제가 실제로 해 본 일은 이렇습니다.
      </p>
      <ul>
        <li>
          <strong>자동차</strong> — GV70(18인치 휠)을 탑니다. 도어 스티커 권장 공기압은 앞 33 / 뒤 36psi이고, 한참 달린 뒤 주유소에서 재면 타이어가 데워져
          4~5psi쯤 높게 나옵니다. 그래서 공기압은 아침 첫 주행 전에 재라고 권합니다. 연비는 보통 카탈로그 복합연비보다 5%쯤 낮게 나오는데,
          가장 크게 깎아 먹는 건 시내 정체였고 추운 날엔 더 떨어졌습니다. 엔진오일은 신차 무상 쿠폰 덕분에 5~6천 km 또는 6개월 중 먼저 오는 쪽에 갈고 있습니다(매뉴얼 기준은 1만 km).
          공기압·연비·엔진오일 이야기는 각각 <Link href="/tools/unit/tire-pressure">타이어 계산기</Link>, <Link href="/tools/unit/fuel-economy">연비 변환기</Link>,
          <Link href="/tools/finance/car-cost">자동차 유지비 계산기</Link> 설명에도 적어 두었습니다.
        </li>
        <li>
          <strong>달리기</strong> — 하프마라톤을 뜁니다. 2026년 2월 밀양 하프(기온 20도 안팎, 오르막이 많은 코스)는 1시간 51분대, 2주 뒤 3월 고양 하프(0~3도, 평지)는 1시간 44분대였습니다.
          2주 사이에 실력이 7분 늘었을 리는 없으니, 차이는 대부분 날씨와 코스 몫이었습니다. <Link href="/tools/sports/race-predictor">마라톤 기록 예측기</Link>에
          &lsquo;예측값은 선선한 날씨·평탄한 코스 기준에 가깝다&rsquo;고 적은 이유입니다.
        </li>
        <li>
          <strong>책 원고</strong> — 만세력(음력·간지 달력) 책을 쓰고 있습니다. 원고를 <Link href="/tools/art/charcount">글자 수 세기</Link>로 세어 보니 323,364자였고,
          한 쪽에 1,000자쯤 들어간다고 보면 약 320쪽 분량입니다. 음력과 간지는 이 책의 주제이기도 합니다.
          사이트의 <Link href="/tools/date/lunar">음력 변환기</Link>는 2026년 7월에 음력 표를 한국천문연구원 기준 데이터로 통째로 바꿨는데,
          그 전에는 중국 역법 계열 표를 쓰고 있어 2027년 설날이 하루 틀리게 나왔습니다.
        </li>
      </ul>
      <p>
        반대로 제가 직접 해 보지 않은 분야(예: 제과·제빵)에는 경험담을 넣지 않고, 공식 자료와 널리 쓰이는 기준만 정리합니다.
        경험을 지어내는 일은 하지 않습니다.
      </p>

      <h2 id="method">계산기를 만들고 확인하는 방법</h2>
      <ol className={s.steps}>
        <li><b>공식 자료부터 확인합니다</b><span>법령·고시, 국세청·국민연금공단·한국천문연구원 같은 기관의 발표와 산식을 먼저 찾습니다. 세율·요율 같은 법정 수치는 공식 자료가 아니면 싣지 않습니다.</span></li>
        <li><b>한 곳에서 관리합니다</b><span>소득세율, 4대보험 요율, 최저시급, 공휴일처럼 여러 계산기가 함께 쓰는 법정 수치는 사이트 전체가 파일 하나의 값을 씁니다. 그래서 개정이 있으면 관련 계산기가 한꺼번에 바뀝니다.</span></li>
        <li><b>경계값을 따로 검산합니다</b><span>세율 구간이 바뀌는 지점, 월말·윤년 같은 날짜 경계를 별도 스크립트로 대조합니다. 연봉·4대보험·국민연금 같은 핵심 금융 계산은 기대값을 고정해 둔 자동 테스트를 만들어, 코드를 main에 올릴 때마다 CI에서 다시 돌립니다.</span></li>
        <li><b>기준일과 출처를 적습니다</b><span>어떤 해의 요율을 썼는지, 어느 기관 자료인지 도구 페이지에 적습니다. 아직 기준일이나 출처 표기가 없는 도구는 차례로 보강하고 있습니다.</span></li>
        <li><b>바뀌면 고칩니다</b><span>늦을 때도 있습니다. 국민연금 기준소득월액 상·하한은 매년 7월에 바뀌는데, 2026년 7월 개정을 제때 반영하지 못해 9월 26일에야 새 값(41만~659만 원)으로 고쳤고, 그 사이 계산이 틀렸다는 사실을 <Link href="/updates#national-pension">업데이트 기록</Link>에 남겼습니다. 이제는 이 값을 7월 기준 기간으로 관리합니다.</span></li>
      </ol>
      <p>
        코드와 설명 초안, 오류 감사와 출처 대조에는 AI 도구의 도움을 받습니다. 법정 수치는 공식 자료와 대조한 뒤에 싣고, 그 최종 확인과 게시 여부·최종 문구는 제가 맡습니다.
        자세한 원칙은 <Link href="/editorial-policy">편집·검산 원칙</Link>에 따로 적었습니다.
      </p>

      <h2 id="fix">틀린 것을 고치는 방법</h2>
      <p>
        혼자 만들다 보니 틀린 곳이 생깁니다. 지금까지도 음력 표, 군 전역일의 월말 계산, 조선 왕의 원년, 양도소득세 보유 기간 같은 오류를 고쳤고,
        고친 내용은 <Link href="/updates">업데이트 기록</Link>에 무엇이 얼마나 틀렸는지와 함께 남겨 두었습니다.
      </p>
      <p>
        결과가 이상하면 <a href={`mailto:${SITE_OPERATOR.email}?subject=${encodeURIComponent('[오류 제보] ')}`}>{SITE_OPERATOR.email}</a>로
        도구 주소, 입력한 값, 기대한 결과를 알려 주세요. 평일 기준 1~3일 안에 답장합니다. 공식 자료와 대조해 틀린 것이 확인되면 고치고, 기록에 남깁니다.
      </p>

      <h2 id="money">운영비와 광고</h2>
      <p>
        Youtil은 무료이고, 운영비는 <strong>Google AdSense 광고</strong> 수익으로 충당하는 구조입니다. 유료 기능, 제휴(어필리에이트) 링크, 협찬을 받고 쓴 글은 없습니다.
        광고는 도구 페이지에만 나옵니다. 이 페이지 같은 운영 문서에는 광고를 두지 않고, 지금은 홈과 분야 목록 페이지에도 두지 않습니다.
        어디에 두고 어디에 두지 않는지는 <Link href="/ads-policy">광고 게재 원칙</Link>에 적었습니다.
      </p>

      <h2 id="data">모으는 정보, 모으지 않는 정보</h2>
      <ul>
        <li><strong>계산에 넣는 값</strong>은 대부분 브라우저 안에서만 계산되고 서버로 보내지 않습니다. 서버 시간 확인, 농산물 시세 조회처럼 외부 정보를 가져와야 하는 몇몇 도구만 예외이며, 그때도 건강·재무 같은 민감한 값은 보내지 않습니다.</li>
        <li><strong>최근 본 도구와 즐겨찾기</strong>는 여러분의 브라우저(localStorage)에만 저장됩니다. 저는 이 목록을 볼 수 없습니다.</li>
        <li><strong>방문 통계</strong>는 Google Analytics로, <strong>광고</strong>는 Google AdSense로 처리하며 이 과정에서 쿠키가 쓰입니다.</li>
        <li><strong>회원가입</strong>이 없어 이름·전화번호 같은 개인정보를 받지 않습니다. 문의 메일을 보내면 답장을 위해 메일 주소와 내용만 씁니다.</li>
      </ul>
      <p>
        법에 따른 자세한 내용과 개인정보 보호책임자는 <Link href="/privacy">개인정보처리방침</Link>에 있습니다.
      </p>

      <h2 id="tools">분야별 도구</h2>
      <p>{categories.length}개 분야에 도구가 {totalTools}개 있습니다. 분야를 누르면 도구 목록과 분야 안내로 이동합니다.</p>
      <ul className={s.cats}>
        {categories.map(c => (
          <li key={c.id}>
            <Link href={`/tools/${c.id}`} data-cat={c.id}>
              <span className="ui-chipIc ui-sm" aria-hidden="true"><CatIcon id={c.id} size={16} /></span>
              {c.name}
              <small>{c.tools.length}개</small>
            </Link>
          </li>
        ))}
      </ul>
    </TrustPage>
  )
}
