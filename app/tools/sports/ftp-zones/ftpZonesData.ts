/* ──────────────────────────────────────────────────────
   sports/ftp-zones/ftpZonesData.ts
   FTP 추정 + Coggan 파워존 + W/kg 등급 + 즈위프트 카테고리
   ──────────────────────────────────────────────────────
   근거
   - FTP 추정 계수의 출처가 각각 다름:
     · 20분 ×0.95 — Hunter Allen(Peaks Coaching Group) 본인 게시·TrainingPeaks 제품 규칙
     · 램프(최고 1분) ×0.75 — TrainerRoad·Zwift 공식
     · 8분 ×0.90 — CTS(Carmichael Training Systems) 필드 테스트: 8분 올아웃 2회(사이 10분 회복)
       중 높은 쪽 평균 × .90. 근거는 '필드 테스트 파워가 실험실 젖산역치보다 약 10% 높다'는
       CTS 자체 관찰(실무 계수 — 피어리뷰 논문 아님). TrainingPeaks 가이드도 동일 계수 병기.
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
  { id: 't8', name: '8분 테스트 (CTS)', factor: 0.90, inputLabel: '8분 평균 파워', desc: 'CTS 필드 테스트 — 8분 올아웃 2회 중 높은 쪽 평균 × 0.90' },
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
  // Coggan 원표에서 Z6는 상한 없는 '>121%'이고 Z7은 %FTP로 정의되지 않는다(N/A).
  // 아래 150/151 분할은 두 존을 화면에 나눠 보여주기 위한 표시용 관행값 — 공식 경계가 아니다.
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

/** 즈위프트 페이스 그룹 A~D — 오픈 이벤트 공식 경계(zFTP W/kg 기준).
    출처: Zwift 공식 페이스 그룹 표. 실제 판정은 zFTP W/kg에 더해 zMAP(A 5.1·B 4.1·C 3.2 W/kg)과
    절대 와트(A 250W·B 200W·C 150W) 조건을 함께 보며, 여성 전용 이벤트는 A만 3.88 W/kg로 다르다.
    또 현재 대부분의 이벤트는 A~D 대신 Racing Score(0~1,000)를 쓰고, 두 체계는 서로 대응하지 않는다.
    → 아래 값은 zFTP W/kg 기준의 참고 구간이며, 정확한 배정은 Zwift 앱에서 확인해야 한다. */
export interface ZwiftCat {
  cat: string
  minWkg: number
  /** 절대 와트 하한(zFTP W) — W/kg와 함께 둘 다 넘어야 해당 그룹 */
  minWatt: number
  color: string
}
export const ZWIFT_CATS: ZwiftCat[] = [
  { cat: 'A', minWkg: 4.2,  minWatt: 250, color: 'var(--danger)' },
  { cat: 'B', minWkg: 3.36, minWatt: 200, color: 'var(--warning)' },
  { cat: 'C', minWkg: 2.63, minWatt: 150, color: 'var(--success)' },
  { cat: 'D', minWkg: 0,    minWatt: 0,   color: 'var(--cat-health)' },
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
  // W/kg와 절대 와트 하한을 모두 만족하는 가장 높은 그룹
  const zwift = wkg !== null ? (ZWIFT_CATS.find((c) => wkg >= c.minWkg && ftp >= c.minWatt) ?? null) : null

  // 존 경계를 각각 반올림하면 55%→56% 사이 등에서 어느 존에도 속하지 않는 와트가 생기므로
  // 각 존의 하한은 '이전 존 상한 + 1W'로 이어 붙인다.
  const zones: ZoneRow[] = []
  let prevHi: number | null = null
  for (const zn of POWER_ZONES) {
    const loW: number = prevHi === null ? Math.round((ftp * zn.loPct) / 100) : prevHi + 1
    const hiW: number | null = zn.hiPct !== null ? Math.max(loW, Math.round((ftp * zn.hiPct) / 100)) : null
    zones.push({ z: zn.z, name: zn.name, loW, hiW, desc: zn.desc })
    prevHi = hiW
  }

  return { ftp, wkg, grade, zwift, zones }
}

/** W/kg 표시값 — 판정(원값 ≥ 경계)과 어긋나지 않도록 소수 2자리에서 내림 */
export function fmtWkg(wkg: number): string {
  return (Math.floor(wkg * 100 + 1e-9) / 100).toFixed(2)
}
