/* ──────────────────────────────────────────────────────
   interior/paint/paintUtils.ts
   페인트 통 조합 추천·입력 파싱 (순수 함수, node 검산용)
   ────────────────────────────────────────────────────── */

/** 입력 문자열 → 숫자. 빈 값·비숫자는 fallback, 범위 밖은 [min, max]로 클램프 (계산 단계 전용) */
export function parseClamp(s: string, min: number, max: number, fallback = min): number {
  const x = parseFloat(s)
  if (!Number.isFinite(x)) return fallback
  return Math.min(max, Math.max(min, x))
}

/** '기타 도장 면적' 입력 상한 (㎡) */
export const EXTRA_AREA_MAX = 5000

/* ─────────────────────────────────────────────────────────
 * 추천 구매 조합 알고리즘 (한국 시판 18·4·2·1L)
 *  - requiredL 이상이면서 surplus 최소, 동률이면 통 수 최소
 *  - 추가 후보 2~3개도 함께 반환
 *  - 400L를 넘는 대용량은 18L 통을 먼저 채운 뒤 나머지만 탐색 — 탐색 루프 폭주를 막으면서도
 *    필요량을 잘라내지 않는다(예전에는 400L로 절삭해 454L 필요에 400L 조합을 '여유 0L'로 추천)
 * ───────────────────────────────────────────────────────── */
export interface Combo { c18: number; c4: number; c2: number; c1: number; total: number; cans: number; surplus: number }

const SEARCH_CAP_L = 400

function searchCans(requiredL: number): { best: Combo | null; alts: Combo[] } {
  const candidates: Combo[] = []
  const max18 = Math.floor(requiredL / 18) + 1
  for (let c18 = 0; c18 <= max18; c18++) {
    for (let c4 = 0; c4 <= 6; c4++) {
      for (let c2 = 0; c2 <= 4; c2++) {
        for (let c1 = 0; c1 <= 5; c1++) {
          const total = c18 * 18 + c4 * 4 + c2 * 2 + c1 * 1
          if (total < requiredL) continue
          // 의미 없는 조합 (다른 사이즈로 대체 가능) 1차 필터
          if (c1 >= 2 && c2 === 0) continue   // 1L 2통은 2L 1통과 동치
          if (c2 >= 2 && c4 === 0 && c18 === 0) continue  // 2L 2통은 4L 1통과 동치
          if (c4 >= 5 && c18 === 0) continue  // 4L 5통은 18L에 가까움
          const cans = c18 + c4 + c2 + c1
          if (cans === 0) continue
          candidates.push({ c18, c4, c2, c1, total, cans, surplus: total - requiredL })
        }
      }
    }
  }
  if (candidates.length === 0) return { best: null, alts: [] }

  // 정렬: 1) surplus 최소, 2) 통 수 최소, 3) 큰 통 우선
  candidates.sort((a, b) => {
    if (a.surplus !== b.surplus) return a.surplus - b.surplus
    if (a.cans !== b.cans) return a.cans - b.cans
    return (b.c18 - a.c18) || (b.c4 - a.c4)
  })

  const best = candidates[0]
  // 대안 — best와 다른 조합으로 surplus 큰 순 1~2개 (안전 마진)
  const alts: Combo[] = []
  for (const c of candidates) {
    if (alts.length >= 2) break
    if (c === best) continue
    if (c.surplus <= best.surplus) continue
    if (c.surplus >= best.surplus + 6) break
    if (alts.find(a => a.total === c.total && a.cans === c.cans)) continue
    alts.push(c)
  }

  return { best, alts }
}

export function recommendCans(requiredL: number): { best: Combo | null; alts: Combo[] } {
  if (!(requiredL > 0) || !Number.isFinite(requiredL)) return { best: null, alts: [] }
  if (requiredL <= SEARCH_CAP_L) return searchCans(requiredL)

  // 대용량: 18L 통 bulk개를 먼저 배정하고 나머지(360~378L 구간)만 탐색 → 합계·여유는 원래 필요량 기준
  const bulk = Math.floor(requiredL / 18) - 20
  const rest = searchCans(requiredL - bulk * 18)
  const addBulk = (c: Combo): Combo => ({
    ...c, c18: c.c18 + bulk, total: c.total + bulk * 18, cans: c.cans + bulk,
  })
  return {
    best: rest.best ? addBulk(rest.best) : null,
    alts: rest.alts.map(addBulk),
  }
}
