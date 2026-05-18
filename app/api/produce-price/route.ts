// ─────────────────────────────────────────────────────────────
// /api/produce-price?items=baechu,mu,gochugaru
//   - 농산물 가격 조회 — KAMIS OpenAPI (한국농수산식품유통공사)
//   - 환경변수 KAMIS_API_KEY / KAMIS_API_ID 설정 시 실시간 조회
//   - 미설정 시 폴백: 2024.11 평균 소매가 반환
//   - 1시간 캐싱 (revalidate)
// ─────────────────────────────────────────────────────────────

export const runtime = 'edge'
export const revalidate = 3600  // 1h 캐시

/** 김장 도구의 ingredient id → KAMIS 품목/품종 코드 매핑
 *  실측 코드는 https://www.kamis.or.kr/customer/reference/openapi_list.do 참조 */
const KAMIS_MAP: Record<string, { itemCode: string; kindCode: string; unitFactor: number; defaultPrice: number; defaultDate: string; unit: string }> = {
  // unitFactor: KAMIS 단가(보통 kg 또는 단)를 도구의 unit(포기/개/g 등)로 환산할 때 쓰는 임시값
  baechu:    { itemCode: '211', kindCode: '01', unitFactor: 3,    defaultPrice: 5500, defaultDate: '2024-11', unit: '포기' },  // 1포기 ≈ 3kg
  mu:        { itemCode: '231', kindCode: '01', unitFactor: 1,    defaultPrice: 2200, defaultDate: '2024-11', unit: '개' },
  jjokpa:    { itemCode: '245', kindCode: '00', unitFactor: 1,    defaultPrice: 4000, defaultDate: '2024-11', unit: '단' },
  gochugaru: { itemCode: '244', kindCode: '00', unitFactor: 0.001,defaultPrice: 55,   defaultDate: '2024-11', unit: 'g' },     // kg→g
  maneul:    { itemCode: '258', kindCode: '00', unitFactor: 0.001,defaultPrice: 25,   defaultDate: '2024-11', unit: 'g' },
  saenggang: { itemCode: '241', kindCode: '00', unitFactor: 0.001,defaultPrice: 22,   defaultDate: '2024-11', unit: 'g' },
  // 🎑 명절 상차림용
  sagua:     { itemCode: '411', kindCode: '06', unitFactor: 0.25, defaultPrice: 2500, defaultDate: '2024-10', unit: '개' },    // 사과 부사 1개 ≈ 250g
  bae:       { itemCode: '412', kindCode: '02', unitFactor: 0.55, defaultPrice: 4500, defaultDate: '2024-10', unit: '개' },    // 신고배 1개 ≈ 550g
  gam:       { itemCode: '413', kindCode: '06', unitFactor: 0.20, defaultPrice: 1500, defaultDate: '2024-10', unit: '개' },    // 단감 1개 ≈ 200g
  sigeumchi: { itemCode: '226', kindCode: '00', unitFactor: 1,    defaultPrice: 3500, defaultDate: '2024-10', unit: '단' },   // 시금치 단(약 200g)
  hobak:     { itemCode: '224', kindCode: '00', unitFactor: 0.30, defaultPrice: 2000, defaultDate: '2024-10', unit: '개' },    // 애호박 1개 ≈ 300g
  daepa:     { itemCode: '246', kindCode: '00', unitFactor: 1,    defaultPrice: 3500, defaultDate: '2024-10', unit: '단' },
}

interface PriceResult {
  id: string
  price: number       // unit당 원
  unit: string
  date: string        // YYYY-MM 또는 YYYY-MM-DD
  source: 'kamis' | 'fallback'
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

async function fetchKamis(itemCode: string, kindCode: string): Promise<{ price: number; date: string } | null> {
  const apiKey = process.env.KAMIS_API_KEY
  const apiId = process.env.KAMIS_API_ID
  if (!apiKey || !apiId) return null

  try {
    const url = new URL('https://www.kamis.or.kr/service/price/xml.do')
    url.searchParams.set('action', 'dailyPriceByCategoryList')
    url.searchParams.set('p_product_cls_code', '01')   // 01: 소매
    url.searchParams.set('p_item_category_code', '200')
    url.searchParams.set('p_item_code', itemCode)
    url.searchParams.set('p_kind_code', kindCode)
    url.searchParams.set('p_country_code', '1101')      // 서울
    url.searchParams.set('p_cert_key', apiKey)
    url.searchParams.set('p_cert_id', apiId)
    url.searchParams.set('p_returntype', 'json')

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const data = await res.json() as {
      price?: Array<{ dpr1: string; regday?: string }>
    }
    const first = data.price?.[0]
    if (!first || !first.dpr1) return null
    const priceNum = parseInt(first.dpr1.replace(/,/g, ''), 10)
    if (!isFinite(priceNum) || priceNum <= 0) return null
    return { price: priceNum, date: first.regday || new Date().toISOString().slice(0, 10) }
  } catch {
    return null
  }
}

export async function GET(req: Request): Promise<Response> {
  const itemsParam = new URL(req.url).searchParams.get('items') ?? ''
  const ids = itemsParam.split(',').map(s => s.trim()).filter(Boolean)
  if (ids.length === 0) return json({ ok: false, error: 'items 파라미터 필요' }, 400)

  const results: PriceResult[] = []
  for (const id of ids) {
    const m = KAMIS_MAP[id]
    if (!m) continue

    const kamis = await fetchKamis(m.itemCode, m.kindCode)
    if (kamis) {
      // KAMIS는 보통 kg 또는 포기 단위 → 도구 내부 unit으로 환산
      results.push({
        id,
        price: Math.round(kamis.price * m.unitFactor),
        unit: m.unit,
        date: kamis.date,
        source: 'kamis',
      })
    } else {
      results.push({
        id,
        price: m.defaultPrice,
        unit: m.unit,
        date: m.defaultDate,
        source: 'fallback',
      })
    }
  }

  return json({ ok: true, results })
}
