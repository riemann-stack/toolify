/* 인기 도구 매니페스트 생성 — GA4 Data API에서 최근 28일 조회수 상위 도구를 조회.
   로컬/CI에서 실행 → app/popular-tools.json 커밋. Vercel 빌드는 이 JSON만 읽음(빌드에 GA 의존성 없음).
   HomeClient가 이 순서로 Top5를 렌더하며, 조회수가 없는 도구는 큐레이션 폴백으로 보충.

   [필요 환경변수]
   - GA4_PROPERTY_ID : GA4 속성 ID(숫자만, 예: 123456789). GA 관리 > 속성 설정 상단.
   - GA_SERVICE_ACCOUNT_KEY : 서비스 계정 JSON 키 전체(문자열). GA4 속성에 '뷰어' 권한 부여 필요.
     (또는 GOOGLE_APPLICATION_CREDENTIALS 로 키 파일 경로 지정)

   환경변수가 없으면 매니페스트를 건드리지 않고 그대로 종료(기존 시드/커밋본 유지) — 안전 폴백. */
import { writeFileSync } from 'node:fs'
import { GoogleAuth } from 'google-auth-library'
import { allTools } from '../lib/tools'

const PROPERTY_ID = process.env.GA4_PROPERTY_ID
const SA_KEY = process.env.GA_SERVICE_ACCOUNT_KEY
const TOP_N = 10
const DAYS = 28

const KNOWN = new Set(allTools.map((t) => t.href))

function normalizePath(p: string): string | null {
  // 쿼리·앵커·트레일링 슬래시 제거 후 /tools/<cat>/<slug> 형태만 통과
  const clean = p.split(/[?#]/)[0].replace(/\/+$/, '')
  return /^\/tools\/[^/]+\/[^/]+$/.test(clean) && KNOWN.has(clean) ? clean : null
}

async function main() {
  if (!PROPERTY_ID || (!SA_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    console.log('[gen-popular] GA4_PROPERTY_ID / GA_SERVICE_ACCOUNT_KEY 미설정 — 매니페스트 유지하고 종료(폴백).')
    return
  }

  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    credentials: SA_KEY ? JSON.parse(SA_KEY) : undefined,
  })
  const token = await auth.getAccessToken()

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: `${DAYS}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 400,
      }),
    },
  )
  if (!res.ok) throw new Error(`GA4 API ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = (await res.json()) as { rows?: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[] }

  // pagePath 정규화 → href 별 조회수 합산(쿼리 변형 병합) → 상위 N
  const views = new Map<string, number>()
  for (const row of data.rows ?? []) {
    const href = normalizePath(row.dimensionValues[0].value)
    if (!href) continue
    views.set(href, (views.get(href) ?? 0) + Number(row.metricValues[0].value || 0))
  }
  const hrefs = [...views.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_N).map(([h]) => h)

  if (hrefs.length === 0) {
    console.log('[gen-popular] GA에서 매칭된 도구 조회수 0건 — 매니페스트 유지(트래픽 부족).')
    return
  }

  const out = { generated: new Date().toISOString().slice(0, 10), source: 'ga4', days: DAYS, hrefs }
  writeFileSync('app/popular-tools.json', JSON.stringify(out, null, 0) + '\n')
  console.log(`[gen-popular] GA4 상위 ${hrefs.length}개 반영:`, hrefs.join(', '))
}

main().catch((e) => {
  console.error('[gen-popular] 실패:', e.message)
  process.exit(1)
})
