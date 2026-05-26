// ─────────────────────────────────────────────────────────────
// /api/produce-price?items=baechu,mu,gochugaru
//   - 농산물 가격 조회 — KAMIS OpenAPI (한국농수산식품유통공사)
//   - 환경변수 KAMIS_API_KEY / KAMIS_API_ID 설정 시 실시간 조회
//   - 미설정 또는 응답 없음 시 폴백: 최근 평균 소매가
//   - 1시간 캐싱 (revalidate)
// ─────────────────────────────────────────────────────────────

// KAMIS는 해외·글로벌 IP에서 응답이 막히거나 매우 느립니다(타임아웃).
// 서울 리전(icn1) Node 런타임에서 호출해 국내 IP로 도달 가능성을 높입니다.
export const runtime = 'nodejs'
export const preferredRegion = 'icn1'
export const revalidate = 3600  // 1h 캐시

/** 김장·명절 도구의 ingredient id → KAMIS 품목/품종 코드 매핑
 *  실측 코드는 https://www.kamis.or.kr/customer/reference/openapi_list.do 참조
 *  unitFactor: p_convert_kg_yn=Y 사용 시 dpr1은 kg당 가격이므로,
 *              kg → 도구 단위(포기/개/g/단)로 환산하는 계수 */
const KAMIS_MAP: Record<string, { itemCode: string; kindCode: string; unitFactor: number; defaultPrice: number; unit: string }> = {
  baechu:    { itemCode: '211', kindCode: '01', unitFactor: 3,    defaultPrice: 5500, unit: '포기' },  // 1포기 ≈ 3kg
  mu:        { itemCode: '231', kindCode: '01', unitFactor: 1,    defaultPrice: 2200, unit: '개' },    // 1개 ≈ 1kg
  jjokpa:    { itemCode: '245', kindCode: '00', unitFactor: 1,    defaultPrice: 4000, unit: '단' },
  gochugaru: { itemCode: '244', kindCode: '00', unitFactor: 0.001,defaultPrice: 55,   unit: 'g' },     // kg → g
  maneul:    { itemCode: '258', kindCode: '00', unitFactor: 0.001,defaultPrice: 25,   unit: 'g' },
  saenggang: { itemCode: '241', kindCode: '00', unitFactor: 0.001,defaultPrice: 22,   unit: 'g' },
  // 🎑 명절 상차림용
  sagua:     { itemCode: '411', kindCode: '06', unitFactor: 0.25, defaultPrice: 2500, unit: '개' },    // 부사 1개 ≈ 250g
  bae:       { itemCode: '412', kindCode: '02', unitFactor: 0.55, defaultPrice: 4500, unit: '개' },    // 신고배 1개 ≈ 550g
  gam:       { itemCode: '413', kindCode: '06', unitFactor: 0.20, defaultPrice: 1500, unit: '개' },    // 단감 1개 ≈ 200g
  sigeumchi: { itemCode: '226', kindCode: '00', unitFactor: 1,    defaultPrice: 3500, unit: '단' },
  hobak:     { itemCode: '224', kindCode: '00', unitFactor: 0.30, defaultPrice: 2000, unit: '개' },    // 애호박 1개 ≈ 300g
  daepa:     { itemCode: '246', kindCode: '00', unitFactor: 1,    defaultPrice: 3500, unit: '단' },
}

/** 폴백 표기용 현재 연·월 (YYYY-MM). 고정 날짜가 시간이 지나며 낡아 보이는 문제 방지. */
function currentMonth(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

interface PriceResult {
  id: string
  price: number       // unit당 원
  unit: string
  date: string        // YYYY-MM 또는 YYYY-MM-DD
  source: 'kamis' | 'fallback'
}

interface KamisItem {
  item_code?: string
  itemcode?: string
  kind_code?: string
  kindcode?: string
  dpr1?: string
  day1?: string
  regday?: string
  unit?: string
}

function json(data: { ok: boolean; results?: PriceResult[]; error?: string }, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

/** UTC 기준 daysAgo일 전 날짜 (YYYY-MM-DD). KAMIS는 KST/UTC 모두 같은 날짜로 인식. */
function kamisDate(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86_400_000)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 카테고리 단위로 1회 호출 — 결과를 응답 그대로의 item 배열로 돌려줍니다. */
async function fetchKamisCategory(categoryCode: string, regday: string): Promise<KamisItem[]> {
  const apiKey = process.env.KAMIS_API_KEY
  const apiId = process.env.KAMIS_API_ID
  if (!apiKey || !apiId) return []

  const url = new URL('https://www.kamis.or.kr/service/price/xml.do')
  url.searchParams.set('action', 'dailyPriceByCategoryList')
  url.searchParams.set('p_product_cls_code', '01')        // 01: 소매
  url.searchParams.set('p_country_code', '1101')          // 1101: 서울
  url.searchParams.set('p_regday', regday)
  url.searchParams.set('p_convert_kg_yn', 'Y')
  url.searchParams.set('p_item_category_code', categoryCode)
  url.searchParams.set('p_cert_key', apiKey)
  url.searchParams.set('p_cert_id', apiId)
  url.searchParams.set('p_returntype', 'json')

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) })
    if (!res.ok) {
      console.error('[kamis] HTTP', res.status, categoryCode, regday)
      return []
    }
    const j: unknown = await res.json()
    // 응답 구조 변종 흡수: {data:{item:[...]}} | {data:[...]} | {price:[...]}
    type AnyShape = { data?: { item?: KamisItem[] } | KamisItem[]; price?: KamisItem[]; error_code?: string }
    const root = j as AnyShape
    if (Array.isArray(root.data)) return root.data
    if (root.data && Array.isArray((root.data as { item?: KamisItem[] }).item)) {
      return (root.data as { item?: KamisItem[] }).item ?? []
    }
    if (Array.isArray(root.price)) return root.price
    return []
  } catch (e) {
    console.error('[kamis] fetch error', categoryCode, regday, String(e))
    return []
  }
}

/** 어제·그제·3일·5일 전까지 차례로 시도. 주말/공휴일 데이터 공백 대응. */
async function fetchKamisCategoryWithRetry(categoryCode: string): Promise<{ items: KamisItem[]; date: string }> {
  for (const daysAgo of [1, 2, 3, 5]) {
    const date = kamisDate(daysAgo)
    const items = await fetchKamisCategory(categoryCode, date)
    if (items.length > 0) return { items, date }
  }
  return { items: [], date: '' }
}

/** 품목 코드 첫 자리로 category code 추정 (200=채소·식량, 400=과일) */
function categoryFromItemCode(itemCode: string): string {
  if (itemCode.startsWith('4')) return '400'
  return '200'
}

function matchItem(items: KamisItem[], itemCode: string, kindCode: string): KamisItem | undefined {
  return items.find((x) => {
    const ic = x.item_code ?? x.itemcode
    const kc = x.kind_code ?? x.kindcode
    return ic === itemCode && kc === kindCode
  })
}

/** KAMIS 연결 진단 — /api/produce-price?debug=1
 *  키/ID는 응답에 노출하지 않고(REDACTED), HTTP 상태·소요시간·원본 응답 일부만 반환.
 *  Vercel 배포 환경에서 직접 호출해 "키는 맞는데 왜 안 되는지"를 확인할 수 있습니다. */
async function debugKamis(): Promise<Record<string, unknown>> {
  const apiKey = process.env.KAMIS_API_KEY
  const apiId = process.env.KAMIS_API_ID
  const regday = kamisDate(1)

  const url = new URL('https://www.kamis.or.kr/service/price/xml.do')
  url.searchParams.set('action', 'dailyPriceByCategoryList')
  url.searchParams.set('p_product_cls_code', '01')
  url.searchParams.set('p_country_code', '1101')
  url.searchParams.set('p_regday', regday)
  url.searchParams.set('p_convert_kg_yn', 'Y')
  url.searchParams.set('p_item_category_code', '200')
  url.searchParams.set('p_cert_key', apiKey ?? '')
  url.searchParams.set('p_cert_id', apiId ?? '')
  url.searchParams.set('p_returntype', 'json')

  let redacted = url.toString()
  if (apiKey) redacted = redacted.split(encodeURIComponent(apiKey)).join('<KEY>').split(apiKey).join('<KEY>')
  if (apiId) redacted = redacted.split(encodeURIComponent(apiId)).join('<ID>').split(apiId).join('<ID>')

  const diag: Record<string, unknown> = {
    env: {
      KAMIS_API_KEY_present: !!apiKey,
      KAMIS_API_ID_present: !!apiId,
      keyLength: apiKey?.length ?? 0,
      idLength: apiId?.length ?? 0,
    },
    regday,
    requestUrl: redacted,
  }

  if (!apiKey || !apiId) {
    diag.note = '환경변수(KAMIS_API_KEY / KAMIS_API_ID)가 비어 있습니다. Vercel → Settings → Environment Variables 에서 Production 스코프에 설정했는지, 재배포했는지 확인하세요.'
    return diag
  }

  try {
    const t0 = Date.now()
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) })
    diag.httpStatus = res.status
    diag.elapsedMs = Date.now() - t0
    const text = await res.text()
    diag.bodyPreview = text.slice(0, 1200)
    diag.hint =
      'bodyPreview에 가격 데이터(dpr1 등)가 보이면 정상. "001" 등 짧은 코드나 인증 에러가 보이면 cert_key/cert_id 불일치(둘이 바뀌었는지 확인). 빈 배열이면 해당 날짜 데이터 없음(주말·공휴일).'
  } catch (e) {
    diag.error = String(e)
    diag.hint =
      '타임아웃/네트워크 오류 — KAMIS가 해외·클라우드(Vercel) IP를 차단·제한할 수 있습니다. 이 경우 키가 맞아도 호출이 실패하며 폴백(추정가)으로 표시됩니다.'
  }
  return diag
}

export async function GET(req: Request): Promise<Response> {
  const sp = new URL(req.url).searchParams

  // 진단 모드
  if (sp.get('debug') === '1') {
    const diag = await debugKamis()
    return new Response(JSON.stringify({ ok: true, debug: diag }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  const itemsParam = sp.get('items') ?? ''
  const ids = itemsParam.split(',').map((s) => s.trim()).filter(Boolean)
  if (ids.length === 0) return json({ ok: false, error: 'items 파라미터 필요' }, 400)

  // 매핑된 항목만 추출
  const targets = ids
    .map((id) => ({ id, m: KAMIS_MAP[id] }))
    .filter((x): x is { id: string; m: typeof KAMIS_MAP[string] } => !!x.m)

  // 카테고리별로 1회씩만 호출 (9개 아이템이라도 200+400 두 번이면 끝)
  const neededCategories = Array.from(new Set(targets.map((t) => categoryFromItemCode(t.m.itemCode))))
  const fetched = await Promise.all(
    neededCategories.map(async (cat) => [cat, await fetchKamisCategoryWithRetry(cat)] as const)
  )
  const byCategory = new Map(fetched)

  const results: PriceResult[] = targets.map(({ id, m }) => {
    const cat = categoryFromItemCode(m.itemCode)
    const bundle = byCategory.get(cat)
    if (bundle && bundle.items.length > 0) {
      const hit = matchItem(bundle.items, m.itemCode, m.kindCode)
      if (hit?.dpr1) {
        const priceNum = parseInt(String(hit.dpr1).replace(/[^0-9.]/g, ''), 10)
        if (isFinite(priceNum) && priceNum > 0) {
          return {
            id,
            price: Math.round(priceNum * m.unitFactor),
            unit: m.unit,
            date: hit.day1 ?? hit.regday ?? bundle.date,
            source: 'kamis',
          }
        }
      }
    }
    return {
      id,
      price: m.defaultPrice,
      unit: m.unit,
      date: currentMonth(),
      source: 'fallback',
    }
  })

  return json({ ok: true, results })
}
