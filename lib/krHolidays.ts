/* 한국 법정 공휴일 단일 소스 (2026~2030).
   - 양력 고정: 신정·삼일절·어린이날·현충일·광복절·개천절·한글날·성탄절
   - 음력 환산: 설날·추석·부처님오신날 (2028년 이후 한국천문연구원 천문력 기준, 재검증 권장)
   - 대체공휴일: 관공서의 공휴일에 관한 규정 제3조 — 삼일절·어린이날·부처님오신날·광복절·
     개천절·한글날·성탄절이 토/일과 겹치거나, 설·추석 연휴가 일요일·다른 공휴일과 겹치면
     다음 첫 비공휴일에 부여. (한글날 2021·성탄절 2023 개정 반영)
   - 선거일: 임기만료에 의한 전국단위 선거일은 공직선거법상 공휴일.
   - 임시공휴일(정부 재량 지정)은 미포함 — 발표 시 별도 추가 필요.
   기준일 2026-06-01 · 출처: 국가법령정보센터, 인사혁신처·행정안전부 공고, 한국천문연구원. */

export type Holiday = { date: string; name: string }

export const KOREAN_HOLIDAYS: Record<number, Holiday[]> = {
  2026: [
    { date: '2026-01-01', name: '신정' },
    { date: '2026-02-16', name: '설날 연휴' },
    { date: '2026-02-17', name: '설날' },
    { date: '2026-02-18', name: '설날 연휴' },
    { date: '2026-03-01', name: '삼일절' },
    { date: '2026-03-02', name: '삼일절 대체공휴일' },
    { date: '2026-05-05', name: '어린이날' },
    { date: '2026-05-24', name: '부처님오신날' },
    { date: '2026-05-25', name: '부처님오신날 대체공휴일' },
    { date: '2026-06-03', name: '제9회 전국동시지방선거' },
    { date: '2026-06-06', name: '현충일' },
    { date: '2026-08-15', name: '광복절' },
    { date: '2026-08-17', name: '광복절 대체공휴일' },
    { date: '2026-09-24', name: '추석 연휴' },
    { date: '2026-09-25', name: '추석' },
    { date: '2026-09-26', name: '추석 연휴' },
    { date: '2026-10-03', name: '개천절' },
    { date: '2026-10-05', name: '개천절 대체공휴일' },
    { date: '2026-10-09', name: '한글날' },
    { date: '2026-12-25', name: '성탄절' },
  ],
  2027: [
    { date: '2027-01-01', name: '신정' },
    { date: '2027-02-06', name: '설날 연휴' },
    { date: '2027-02-07', name: '설날' },
    { date: '2027-02-08', name: '설날 연휴' },
    { date: '2027-02-09', name: '설날 대체공휴일' },
    { date: '2027-03-01', name: '삼일절' },
    { date: '2027-05-05', name: '어린이날' },
    { date: '2027-05-13', name: '부처님오신날' },
    { date: '2027-06-06', name: '현충일' },
    { date: '2027-08-15', name: '광복절' },
    { date: '2027-08-16', name: '광복절 대체공휴일' },
    { date: '2027-09-14', name: '추석 연휴' },
    { date: '2027-09-15', name: '추석' },
    { date: '2027-09-16', name: '추석 연휴' },
    { date: '2027-10-03', name: '개천절' },
    { date: '2027-10-04', name: '개천절 대체공휴일' },
    { date: '2027-10-09', name: '한글날' },
    { date: '2027-10-11', name: '한글날 대체공휴일' },
    { date: '2027-12-25', name: '성탄절' },
    { date: '2027-12-27', name: '성탄절 대체공휴일' },
  ],
  2028: [
    { date: '2028-01-01', name: '신정' },
    { date: '2028-01-26', name: '설날 연휴' },
    { date: '2028-01-27', name: '설날' },
    { date: '2028-01-28', name: '설날 연휴' },
    { date: '2028-03-01', name: '삼일절' },
    { date: '2028-05-02', name: '부처님오신날' },
    { date: '2028-05-05', name: '어린이날' },
    { date: '2028-06-06', name: '현충일' },
    { date: '2028-08-15', name: '광복절' },
    { date: '2028-10-02', name: '추석 연휴' },
    { date: '2028-10-03', name: '추석·개천절' },
    { date: '2028-10-04', name: '추석 연휴' },
    { date: '2028-10-05', name: '추석 대체공휴일' },
    { date: '2028-10-09', name: '한글날' },
    { date: '2028-12-25', name: '성탄절' },
  ],
  2029: [
    { date: '2029-01-01', name: '신정' },
    { date: '2029-02-12', name: '설날 연휴' },
    { date: '2029-02-13', name: '설날' },
    { date: '2029-02-14', name: '설날 연휴' },
    { date: '2029-03-01', name: '삼일절' },
    { date: '2029-05-05', name: '어린이날·부처님오신날' },
    { date: '2029-05-07', name: '어린이날 대체공휴일' },
    { date: '2029-06-06', name: '현충일' },
    { date: '2029-08-15', name: '광복절' },
    { date: '2029-09-21', name: '추석 연휴' },
    { date: '2029-09-22', name: '추석' },
    { date: '2029-09-23', name: '추석 연휴' },
    { date: '2029-09-24', name: '추석 대체공휴일' },
    { date: '2029-10-03', name: '개천절' },
    { date: '2029-10-09', name: '한글날' },
    { date: '2029-12-25', name: '성탄절' },
  ],
  2030: [
    { date: '2030-01-01', name: '신정' },
    { date: '2030-02-02', name: '설날 연휴' },
    { date: '2030-02-03', name: '설날' },
    { date: '2030-02-04', name: '설날 연휴' },
    { date: '2030-02-05', name: '설날 대체공휴일' },
    { date: '2030-03-01', name: '삼일절' },
    { date: '2030-05-05', name: '어린이날' },
    { date: '2030-05-06', name: '어린이날 대체공휴일' },
    { date: '2030-05-09', name: '부처님오신날' },
    { date: '2030-06-06', name: '현충일' },
    { date: '2030-08-15', name: '광복절' },
    { date: '2030-09-11', name: '추석 연휴' },
    { date: '2030-09-12', name: '추석' },
    { date: '2030-09-13', name: '추석 연휴' },
    { date: '2030-10-03', name: '개천절' },
    { date: '2030-10-09', name: '한글날' },
    { date: '2030-12-25', name: '성탄절' },
  ],
}

/** 'YYYY-MM-DD' 문자열로 공휴일 조회 (없으면 null) */
export function isHolidayStr(dateStr: string): Holiday | null {
  const y = Number(dateStr.slice(0, 4))
  return KOREAN_HOLIDAYS[y]?.find(h => h.date === dateStr) ?? null
}

/** Date 객체로 공휴일 조회 — 로컬 연·월·일 기준 (UTC 변환 안 함) */
export function isHoliday(date: Date): Holiday | null {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return isHolidayStr(`${y}-${m}-${d}`)
}

/** 해당 연도 공휴일 목록 (날짜 오름차순, 데이터 없으면 빈 배열) */
export function holidaysInYear(year: number): Holiday[] {
  return KOREAN_HOLIDAYS[year] ?? []
}

/** 데이터가 존재하는 연도 범위 */
export const HOLIDAY_YEARS = Object.keys(KOREAN_HOLIDAYS)
  .map(Number)
  .sort((a, b) => a - b)
