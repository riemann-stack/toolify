/* 노란우산(소기업·소상공인 공제부금) 소득공제 한도 — 조세특례제한법 §86의3① 단일 소스.
   한도는 해당 과세기간의 사업소득금액 구간(상한 '이하')으로 정하고, 공제부금을 납입한 과세기간 기준으로 키를 둔다.
   · 2025 키: 2025.3.14 개정(법률 제20778호) §86의3① 1~4호 — 4천만 이하 600만 / 4천만 초과 6천만 이하 500만 /
     6천만 초과 1억 이하 400만 / 1억 초과 200만. 부칙 §11①: 시행일이 속하는 과세기간(2025년) 납입분부터.
   · 2024 키: 개정 직전(2024년 납입분까지) — 4천만 이하 500만 / 4천만 초과 1억 이하 300만 / 1억 초과 200만.
     (그보다 앞선 개정 이력은 표에 두지 않았다 — 조회 시 첫 키로 대체)
   새 개정이 나오면 적용 과세기간을 키로 추가한다. 기준일 2026-09. 단위: 원. */

export interface YellowUmbrellaTier {
  upTo: number   // 사업소득금액 상한(이하), 마지막 구간은 Infinity
  limit: number  // 연 소득공제 한도
}

export type YellowUmbrellaYear = 2024 | 2025

export const YELLOW_UMBRELLA_TIERS_BY_YEAR: Record<YellowUmbrellaYear, readonly YellowUmbrellaTier[]> = {
  2024: [
    { upTo: 40_000_000, limit: 5_000_000 },
    { upTo: 100_000_000, limit: 3_000_000 },
    { upTo: Infinity, limit: 2_000_000 },
  ],
  2025: [
    { upTo: 40_000_000, limit: 6_000_000 },  // 1호
    { upTo: 60_000_000, limit: 5_000_000 },  // 2호
    { upTo: 100_000_000, limit: 4_000_000 }, // 3호
    { upTo: Infinity, limit: 2_000_000 },    // 4호
  ],
}

/** 납입 과세기간에 적용되는 표의 키 — 표보다 뒤 연도는 마지막 키, 앞 연도는 첫 키 */
export function yellowUmbrellaTableYear(year: number): YellowUmbrellaYear {
  const keys = (Object.keys(YELLOW_UMBRELLA_TIERS_BY_YEAR).map(Number) as YellowUmbrellaYear[]).sort((a, b) => a - b)
  let pick = keys[0]
  for (const k of keys) if (k <= year) pick = k
  return pick
}

/** 납입 과세기간의 한도 구간표 */
export function yellowUmbrellaTiers(year: number): readonly YellowUmbrellaTier[] {
  return YELLOW_UMBRELLA_TIERS_BY_YEAR[yellowUmbrellaTableYear(year)]
}

/** 노란우산 소득공제 한도 (사업소득금액 기준 — 구간 상한 '이하') */
export function yellowUmbrellaLimit(businessIncome: number, year: number): number {
  const tiers = yellowUmbrellaTiers(year)
  return (tiers.find((t) => businessIncome <= t.upTo) ?? tiers[tiers.length - 1]).limit
}
