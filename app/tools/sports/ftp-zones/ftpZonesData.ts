/* ──────────────────────────────────────────────────────
   sports/ftp-zones/ftpZonesData.ts
   FTP 추정 + Coggan 파워존 + W/kg 등급 + 즈위프트 카테고리
   ──────────────────────────────────────────────────────
   근거
   - FTP 추정: 20분 테스트 ×0.95 / 램프(최대 1분) ×0.75 / 8분 ×0.90
     (Allen & Coggan, Training and Racing with a Power Meter).
   - Coggan Classic 7 파워존: FTP 대비 % (동일 문헌).
   - W/kg 등급·즈위프트 카테고리는 커뮤니티 통용 기준(참고용).
   ────────────────────────────────────────────────────── */

export interface TestMethod {
  id: string
  name: string
  factor: number
  inputLabel: string
  desc: string
}
export const TEST_METHODS: TestMethod[] = [
  { id: 't20', name: '20분 테스트', factor: 0.95, inputLabel: '20분 평균 파워', desc: '가장 널리 쓰임 — 20분 전력 평균 × 0.95' },
  { id: 'ramp', name: '램프 테스트', factor: 0.75, inputLabel: '최대 1분 파워', desc: '즈위프트 램프 — 탈진 직전 1분 평균 × 0.75' },
  { id: 't8', name: '8분 테스트', factor: 0.90, inputLabel: '8분 평균 파워', desc: '8분 전력 평균 × 0.90 (2회 중 우수치)' },
  { id: 'direct', name: 'FTP 직접 입력', factor: 1.0, inputLabel: '내 FTP', desc: '이미 아는 FTP를 그대로 입력' },
]

/** Coggan Classic 7존 — FTP 대비 하한·상한 (%) */
export interface PowerZone {
  z: string
  name: string
  loPct: number
  hiPct: number | null   // null = 상한 없음
  desc: string
}
export const POWER_ZONES: PowerZone[] = [
  { z: 'Z1', name: '회복 (Active Recovery)', loPct: 0,   hiPct: 55,  desc: '아주 가벼운 회복 주행' },
  { z: 'Z2', name: '지구력 (Endurance)',     loPct: 56,  hiPct: 75,  desc: '오래 탈 수 있는 유산소 기초' },
  { z: 'Z3', name: '템포 (Tempo)',           loPct: 76,  hiPct: 90,  desc: '약간 힘든 지속 강도' },
  { z: 'Z4', name: '역치 (Threshold)',       loPct: 91,  hiPct: 105, desc: 'FTP 근처 — 20~60분 유지' },
  { z: 'Z5', name: 'VO₂max',                 loPct: 106, hiPct: 120, desc: '3~8분 인터벌, 최대산소섭취' },
  { z: 'Z6', name: '무산소 (Anaerobic)',     loPct: 121, hiPct: 150, desc: '30초~3분 고강도' },
  { z: 'Z7', name: '신경근 (Neuromuscular)', loPct: 151, hiPct: null, desc: '스프린트 — 짧고 폭발적' },
]

/** W/kg 등급 (참고) */
export interface WkgGrade {
  min: number
  label: string
}
export const WKG_GRADES: WkgGrade[] = [
  { min: 5.0, label: '엘리트/프로급' },
  { min: 4.0, label: '매우 우수 (레이서)' },
  { min: 3.2, label: '우수 (숙련 동호인)' },
  { min: 2.5, label: '보통 (중급)' },
  { min: 1.8, label: '입문 (초급)' },
  { min: 0,   label: '초보 시작 단계' },
]

/** 즈위프트 레이스 카테고리 (W/kg, 남성 기준 통용값 — 리그마다 상이) */
export interface ZwiftCat {
  cat: string
  minWkg: number
  color: string
}
export const ZWIFT_CATS: ZwiftCat[] = [
  { cat: 'A', minWkg: 4.0, color: 'var(--danger)' },
  { cat: 'B', minWkg: 3.2, color: 'var(--warning)' },
  { cat: 'C', minWkg: 2.5, color: 'var(--success)' },
  { cat: 'D', minWkg: 0,   color: 'var(--cat-health)' },
]

export interface ZoneRow {
  z: string
  name: string
  loW: number
  hiW: number | null
  desc: string
}
export interface FtpResult {
  ftp: number
  wkg: number | null
  grade: string
  zwift: ZwiftCat | null
  zones: ZoneRow[]
}

export function calcFtp(inputWatt: number, method: TestMethod, weightKg: number): FtpResult {
  const ftp = Math.round(Math.max(0, inputWatt) * method.factor)
  const w = Math.max(0, weightKg)
  const wkg = w > 0 ? ftp / w : null

  const grade = wkg !== null
    ? (WKG_GRADES.find((g) => wkg >= g.min)?.label ?? WKG_GRADES[WKG_GRADES.length - 1].label)
    : '체중 입력 시 표시'
  const zwift = wkg !== null ? (ZWIFT_CATS.find((c) => wkg >= c.minWkg) ?? null) : null

  const zones: ZoneRow[] = POWER_ZONES.map((zn) => ({
    z: zn.z,
    name: zn.name,
    loW: Math.round((ftp * zn.loPct) / 100),
    hiW: zn.hiPct !== null ? Math.round((ftp * zn.hiPct) / 100) : null,
    desc: zn.desc,
  }))

  return { ftp, wkg, grade, zwift, zones }
}
