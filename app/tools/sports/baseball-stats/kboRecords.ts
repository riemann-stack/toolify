/* KBO 기록 상수 — page 본문(역대 단일시즌 기록)과 Client(시즌 페이스 비교·명선수 비교표)가 함께 쓰는 단일 소스.
   확인: 2026년 9월 (레이예스 202안타 2024, 테임즈 OPS 1.288 2015, 폰세 252탈삼진 2025 — 언론 보도·KBO 기록 기준).
   2026 시즌 종료 후 경신 여부를 다시 확인할 것. */

export const KBO_RECORDS_CHECKED = '2026년 9월'

export interface SeasonRecord {
  holder: string
  value: string   // 표시용 (예: '202개', '1.288')
  year: number
  note?: string
}

export const KBO_SEASON_RECORDS = {
  hits:       { holder: '레이예스', value: '202개', year: 2024 },
  homeRuns:   { holder: '이승엽',   value: '56개',  year: 2003 },
  avg:        { holder: '백인천',   value: '0.412', year: 1982, note: '단축' },
  ops:        { holder: '테임즈',   value: '1.288', year: 2015 },
  era:        { holder: '선동열',   value: '0.78',  year: 1993 },
  strikeouts: { holder: '폰세',     value: '252개', year: 2025 },
  wins:       { holder: '장명부',   value: '30승',  year: 1983 },
  saves:      { holder: '오승환',   value: '47세이브', year: 2006 },
} satisfies Record<string, SeasonRecord>

export const fmtRecord = (r: SeasonRecord) => `${r.holder} ${r.value} (${r.year}${r.note ? `, ${r.note}` : ''})`

/* 역대 명선수 KBO 통산 슬래시 라인 (AVG / OBP / SLG / OPS).
   이승엽 .302/.389/.572, 양준혁 .316/.421/.529, 이정후 .340/.407/.491.
   (이전 표의 이승엽 SLG .519·장종훈 .291 등은 실제 통산 기록과 달라 수정·제외) */
export const KBO_LEGENDS: { name: string; avg: string; obp: string; slg: string; ops: string }[] = [
  { name: '이승엽', avg: '0.302', obp: '0.389', slg: '0.572', ops: '0.961' },
  { name: '양준혁', avg: '0.316', obp: '0.421', slg: '0.529', ops: '0.950' },
  { name: '이정후', avg: '0.340', obp: '0.407', slg: '0.491', ops: '0.898' },
]
