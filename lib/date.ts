// ─────────────────────────────────────────────────────────────
// 날짜 컨벤션 공용 헬퍼
// toISOString()은 UTC 기준이라 KST 자정~09시에 '어제' 날짜가 나온다.
// '오늘 날짜' 문자열은 반드시 이 함수(기기 로컬 기준)를 쓸 것.
// ─────────────────────────────────────────────────────────────

/** 기기 로컬 기준 YYYY-MM-DD (기본: 오늘) */
export function todayStr(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
