/* 배관 규격 변환기 — 데이터·계산 유틸 */

export type PipeSize =
  | '15A' | '20A' | '25A' | '32A' | '40A' | '50A'
  | '65A' | '80A' | '100A' | '125A' | '150A'

export type Material = 'steel' | 'pvc' | 'pb' | 'xl' | 'copper' | 'sts'

export const PIPE_SIZES: PipeSize[] = [
  '15A', '20A', '25A', '32A', '40A', '50A',
  '65A', '80A', '100A', '125A', '150A',
]

export interface SizeMeta {
  a: PipeSize
  inch: string       // B호칭
  inchVal: number    // 표기용 (수치 변환)
  dn: string         // ISO/EN
  dnVal: number      // 수치
}

export const SIZE_META: SizeMeta[] = [
  { a: '15A',  inch: '1/2"',  inchVal: 0.5,   dn: 'DN15',  dnVal: 15  },
  { a: '20A',  inch: '3/4"',  inchVal: 0.75,  dn: 'DN20',  dnVal: 20  },
  { a: '25A',  inch: '1"',    inchVal: 1.0,   dn: 'DN25',  dnVal: 25  },
  { a: '32A',  inch: '1¼"',   inchVal: 1.25,  dn: 'DN32',  dnVal: 32  },
  { a: '40A',  inch: '1½"',   inchVal: 1.5,   dn: 'DN40',  dnVal: 40  },
  { a: '50A',  inch: '2"',    inchVal: 2.0,   dn: 'DN50',  dnVal: 50  },
  { a: '65A',  inch: '2½"',   inchVal: 2.5,   dn: 'DN65',  dnVal: 65  },
  { a: '80A',  inch: '3"',    inchVal: 3.0,   dn: 'DN80',  dnVal: 80  },
  { a: '100A', inch: '4"',    inchVal: 4.0,   dn: 'DN100', dnVal: 100 },
  { a: '125A', inch: '5"',    inchVal: 5.0,   dn: 'DN125', dnVal: 125 },
  { a: '150A', inch: '6"',    inchVal: 6.0,   dn: 'DN150', dnVal: 150 },
]

export const getSizeMeta = (a: PipeSize) => SIZE_META.find((m) => m.a === a)!

/* ─────────────────────────────────────────────
   재질 메타
   ───────────────────────────────────────────── */

export interface MaterialMeta {
  id: Material
  emoji: string
  label: string
  std: string
  desc: string
  use: string
  /* 등급 토글 옵션 */
  grades?: { id: string; label: string; note: string }[]
}

export const MATERIALS: MaterialMeta[] = [
  {
    id: 'steel', emoji: '🔩', label: '강관 (SGP/STPG)',
    std: 'KS D 3507 / D 3562',
    desc: '가장 전통적인 배관. 압력·내구성 우수. 부식 방지 위해 백관(아연도금)·코팅 사용.',
    use: '소방·산업 압력·증기·일반 배관',
    grades: [
      { id: 'sgp_white', label: '백관 (SGP 아연도금)', note: 'KS D 3507 · 일반 배관·소방·급수' },
      { id: 'sgp_black', label: '흑관 (SGP)',          note: 'KS D 3507 · 난방·기름·증기' },
      { id: 'sch40',     label: 'STPG Sch 40',         note: 'KS D 3562 · 압력 배관 표준' },
      { id: 'sch80',     label: 'STPG Sch 80',         note: 'KS D 3562 · 고압·두꺼움' },
    ],
  },
  {
    id: 'pvc', emoji: '🔵', label: 'PVC관 (경질염화비닐)',
    std: 'KS M 3401',
    desc: '경량·내약품·시공 쉬움. 자외선·고온 약함. 옥내 급수·배수·통기 표준.',
    use: '급수·배수·환기·통신관',
    grades: [
      { id: 'vg1',     label: 'VG1 (수도용 두꺼움)', note: '압력 1.0~1.6 MPa · 음용수' },
      { id: 'vg2',     label: 'VG2 (배수용 얇음)',   note: '비압력 · 배수·통기' },
      { id: 'hi_vg',   label: 'HI-VG (내충격)',       note: 'VG1 + 내충격 향상' },
    ],
  },
  {
    id: 'pb', emoji: '🟠', label: 'PB관 (폴리부틸렌)',
    std: 'KS M 3360',
    desc: '유연·내열·녹슬지 않음. 그립링+슬리브 시공. 한일·슈퍼 부속 호환 주의.',
    use: '급수·급탕·바닥난방·세대내 배관',
  },
  {
    id: 'xl', emoji: '🟢', label: 'XL관 (PE-X 가교폴리에틸렌)',
    std: 'KS M 3357',
    desc: '내열·내압·유연. 바닥난방·온수 분배기 표준. 17/20 외경이 한국 표준.',
    use: '바닥난방·급탕 분배·온수 코일',
  },
  {
    id: 'copper', emoji: '🟤', label: '동관 (Copper)',
    std: 'KS D 5301',
    desc: '항균·내식·열전도 우수. 가스·냉매·의료용 표준. 두께 등급 K/L/M.',
    use: '도시가스·LPG·에어컨 냉매·의료용',
    grades: [
      { id: 'k', label: 'K Type (가장 두꺼움)', note: '의료용·고압' },
      { id: 'l', label: 'L Type (중간)',         note: '가정 급수·가스 표준' },
      { id: 'm', label: 'M Type (가장 얇음)',    note: '저압·냉난방 일반' },
    ],
  },
  {
    id: 'sts', emoji: '⚪', label: '스테인리스관 (STS)',
    std: 'KS D 3595 / 3596',
    desc: '내식·위생 최강. 박벽으로 가벼움. 프레스·메탈터치 시공.',
    use: '음용수·위생관·식품·화학·고급 주택',
    grades: [
      { id: 'su',  label: 'Su (위생관 박벽)',  note: 'KS D 3595 · 음용수·위생' },
      { id: 'sts', label: 'STS 일반관',         note: 'KS D 3596 · 일반 압력' },
    ],
  },
]

export const getMaterial = (id: Material) => MATERIALS.find((m) => m.id === id)!

/* ─────────────────────────────────────────────
   재질별 사이즈 데이터 (OD / ID / 두께 mm)
   ───────────────────────────────────────────── */

export interface PipeDim {
  od: number     // 외경
  id: number     // 내경
  t: number      // 두께
  /* 등급 의존 변동치 */
  variants?: Record<string, { od: number; id: number; t: number }>
}

/* 강관 SGP (KS D 3507) — 일반 배관용 */
const STEEL_SGP: Record<PipeSize, PipeDim> = {
  '15A':  { od: 21.7,  id: 16.1,  t: 2.8 },
  '20A':  { od: 27.2,  id: 21.6,  t: 2.8 },
  '25A':  { od: 34.0,  id: 27.6,  t: 3.2 },
  '32A':  { od: 42.7,  id: 35.7,  t: 3.5 },
  '40A':  { od: 48.6,  id: 41.6,  t: 3.5 },
  '50A':  { od: 60.5,  id: 52.9,  t: 3.8 },
  '65A':  { od: 76.3,  id: 67.9,  t: 4.2 },
  '80A':  { od: 89.1,  id: 80.7,  t: 4.2 },
  '100A': { od: 114.3, id: 105.3, t: 4.5 },
  '125A': { od: 139.8, id: 130.8, t: 4.5 },
  '150A': { od: 165.2, id: 155.2, t: 5.0 },
}

/* 강관 STPG Sch 80 두께 보정 */
const STEEL_SCH80_T: Record<PipeSize, number> = {
  '15A': 3.7, '20A': 3.9, '25A': 4.5, '32A': 4.9, '40A': 5.1, '50A': 5.5,
  '65A': 6.0, '80A': 6.6, '100A': 7.1, '125A': 8.1, '150A': 9.3,
}

/* PVC관 (KS M 3401) — VG1 기준 */
const PVC_VG1: Record<PipeSize, PipeDim> = {
  '15A':  { od: 22,   id: 17,    t: 2.5 },
  '20A':  { od: 26,   id: 21,    t: 2.5 },
  '25A':  { od: 32,   id: 27,    t: 2.5 },
  '32A':  { od: 38,   id: 33,    t: 2.5 },
  '40A':  { od: 48,   id: 42,    t: 3.0 },
  '50A':  { od: 60,   id: 54,    t: 3.0 },
  '65A':  { od: 76,   id: 69.4,  t: 3.3 },
  '80A':  { od: 89,   id: 81.6,  t: 3.7 },
  '100A': { od: 114,  id: 105.6, t: 4.2 },
  '125A': { od: 140,  id: 130.4, t: 4.8 },
  '150A': { od: 165,  id: 154.0, t: 5.5 },
}

/* PVC VG2 (배수용, 더 얇음) */
const PVC_VG2_T: Record<PipeSize, number> = {
  '15A': 2.0, '20A': 2.0, '25A': 2.0, '32A': 2.0, '40A': 2.2, '50A': 2.5,
  '65A': 2.7, '80A': 3.1, '100A': 3.5, '125A': 4.0, '150A': 4.5,
}

/* PB관 (한국 표준 외경) */
const PB_DATA: Record<PipeSize, PipeDim> = {
  '15A':  { od: 17,   id: 13.4, t: 1.8 },
  '20A':  { od: 22,   id: 17.4, t: 2.3 },
  '25A':  { od: 28,   id: 22.6, t: 2.7 },
  '32A':  { od: 35,   id: 28.2, t: 3.4 },
  '40A':  { od: 42,   id: 33.8, t: 4.1 },
  '50A':  { od: 54,   id: 43.4, t: 5.3 },
  '65A':  { od: 70,   id: 56.2, t: 6.9 },
  '80A':  { od: 80,   id: 64.2, t: 7.9 },
  '100A': { od: 110,  id: 88.2, t: 10.9 },
  '125A': { od: 125,  id: 100.2, t: 12.4 },
  '150A': { od: 160,  id: 128.2, t: 15.9 },
}

/* XL관 (PE-X) — 한국 외경 표준 17/20/25/32 중심 */
const XL_DATA: Record<PipeSize, PipeDim> = {
  '15A':  { od: 17,   id: 12.0,  t: 2.5 },
  '20A':  { od: 20,   id: 14.4,  t: 2.8 },
  '25A':  { od: 25,   id: 19.6,  t: 2.7 },
  '32A':  { od: 32,   id: 25.4,  t: 3.3 },
  '40A':  { od: 40,   id: 32.0,  t: 4.0 },
  '50A':  { od: 50,   id: 40.0,  t: 5.0 },
  '65A':  { od: 63,   id: 50.4,  t: 6.3 },
  '80A':  { od: 75,   id: 60.0,  t: 7.5 },
  '100A': { od: 110,  id: 88.0,  t: 11.0 },
  '125A': { od: 125,  id: 100.0, t: 12.5 },
  '150A': { od: 160,  id: 128.0, t: 16.0 },
}

/* 동관 (KS D 5301) — L Type 기준 */
const COPPER_L: Record<PipeSize, PipeDim> = {
  '15A':  { od: 15.88, id: 13.84, t: 1.02 },
  '20A':  { od: 22.22, id: 19.94, t: 1.14 },
  '25A':  { od: 28.58, id: 26.04, t: 1.27 },
  '32A':  { od: 34.92, id: 32.13, t: 1.40 },
  '40A':  { od: 41.28, id: 38.23, t: 1.52 },
  '50A':  { od: 53.98, id: 50.42, t: 1.78 },
  '65A':  { od: 66.68, id: 62.61, t: 2.03 },
  '80A':  { od: 79.38, id: 75.06, t: 2.16 },
  '100A': { od: 104.78, id: 99.95, t: 2.41 },
  '125A': { od: 130.18, id: 125.0,  t: 2.59 },
  '150A': { od: 155.58, id: 149.99, t: 2.79 },
}

/* 동관 K Type (두꺼움) / M Type (얇음) — 두께 보정 */
const COPPER_K_T: Record<PipeSize, number> = {
  '15A': 1.24, '20A': 1.65, '25A': 1.65, '32A': 1.83, '40A': 1.83, '50A': 2.11,
  '65A': 2.41, '80A': 2.77, '100A': 3.05, '125A': 3.40, '150A': 3.61,
}
const COPPER_M_T: Record<PipeSize, number> = {
  '15A': 0.71, '20A': 0.81, '25A': 0.89, '32A': 1.07, '40A': 1.24, '50A': 1.47,
  '65A': 1.65, '80A': 1.83, '100A': 2.11, '125A': 2.41, '150A': 2.77,
}

/* 스테인리스 Su 위생관 (KS D 3595) */
const STS_SU: Record<PipeSize, PipeDim> = {
  '15A':  { od: 19.05,  id: 18.05,  t: 0.50 },
  '20A':  { od: 25.40,  id: 24.40,  t: 0.50 },
  '25A':  { od: 31.75,  id: 30.55,  t: 0.60 },
  '32A':  { od: 38.10,  id: 36.90,  t: 0.60 },
  '40A':  { od: 50.80,  id: 49.40,  t: 0.70 },
  '50A':  { od: 63.50,  id: 62.10,  t: 0.70 },
  '65A':  { od: 76.30,  id: 74.50,  t: 0.90 },
  '80A':  { od: 89.10,  id: 87.10,  t: 1.00 },
  '100A': { od: 114.30, id: 112.10, t: 1.10 },
  '125A': { od: 139.80, id: 137.30, t: 1.25 },
  '150A': { od: 165.20, id: 162.40, t: 1.40 },
}

/* 통합 함수 */
export function getDim(material: Material, size: PipeSize, grade?: string): PipeDim {
  switch (material) {
    case 'steel': {
      const base = STEEL_SGP[size]
      if (grade === 'sch80') {
        const t = STEEL_SCH80_T[size]
        return { od: base.od, id: +(base.od - 2 * t).toFixed(2), t }
      }
      // sch40 ≈ SGP, white/black 외경 동일
      return base
    }
    case 'pvc': {
      const base = PVC_VG1[size]
      if (grade === 'vg2') {
        const t = PVC_VG2_T[size]
        return { od: base.od, id: +(base.od - 2 * t).toFixed(2), t }
      }
      return base
    }
    case 'pb':     return PB_DATA[size]
    case 'xl':     return XL_DATA[size]
    case 'copper': {
      const base = COPPER_L[size]
      if (grade === 'k') {
        const t = COPPER_K_T[size]
        return { od: base.od, id: +(base.od - 2 * t).toFixed(2), t }
      }
      if (grade === 'm') {
        const t = COPPER_M_T[size]
        return { od: base.od, id: +(base.od - 2 * t).toFixed(2), t }
      }
      return base
    }
    case 'sts':    return STS_SU[size]
  }
}

/* ─────────────────────────────────────────────
   부속·연결법 / 단열재 / 곡률
   ───────────────────────────────────────────── */

export interface FittingInfo {
  name: string
  desc: string
  difficulty: 1 | 2 | 3
  note?: string
}

export const FITTINGS: Record<Material, FittingInfo[]> = {
  steel: [
    { name: 'TS (나사식 PT)',  desc: 'PT나사 + 시일테이프. 가장 전통적. 분해 가능.',     difficulty: 2 },
    { name: 'DT (이종조인)',    desc: '서로 다른 재질·사이즈 연결용. 어댑터 형태.',       difficulty: 2 },
    { name: '플랜지',           desc: '대구경·고압·정기 분해. 볼트 4~12개 체결.',         difficulty: 3 },
    { name: '용접',             desc: '영구 결합. 자격(아크용접·TIG) 필요.',              difficulty: 3, note: '고압·플랜트' },
  ],
  pvc: [
    { name: 'TS (접착식)',      desc: '전용 접착제로 화학 융착. 가장 흔함.',              difficulty: 1 },
    { name: 'DT (나사식)',      desc: 'PT나사. 분해·재시공 가능.',                        difficulty: 1 },
    { name: 'KP (소켓+고무링)', desc: '대구경 배수 표준. 신축·진동 흡수.',                 difficulty: 1 },
  ],
  pb: [
    { name: '그립링+인서트+슬리브', desc: '한국 PB 표준 시공법. 전용 공구 필요.', difficulty: 2,
      note: '⚠️ 한일 vs 슈퍼 부속 호환성 다름 — 같은 브랜드로 통일' },
    { name: '몰코·푸시핏',           desc: '원터치 결합. 점검·재시공 쉬움.',         difficulty: 1 },
  ],
  xl: [
    { name: '황동 인서트+슬리브', desc: '바닥난방 표준. 동파·내압 강함.',     difficulty: 2 },
    { name: '푸시핏',              desc: '원터치 (한국 표준 17/20).',           difficulty: 1 },
    { name: '확관식',              desc: '확관기로 관 끝을 벌려 결합. 시공기 필수.', difficulty: 3 },
  ],
  copper: [
    { name: '용접 (브레이징)',    desc: '은납·동납 + 토치. 가스·냉매 표준.',           difficulty: 3, note: '가스 자격 필요' },
    { name: '플레어',             desc: '관 끝 나팔 가공 + 너트 체결. 분해 가능.',     difficulty: 2 },
    { name: '압축식',             desc: 'Compression Fitting. 너트로 압착.',           difficulty: 2 },
    { name: '프레스 (P-fit)',     desc: '전용 압착기. 수가스용 신공법.',                difficulty: 2 },
  ],
  sts: [
    { name: '프레스 (M·V형)',     desc: '전용 압착기. STS 표준 시공법. 빠름.',          difficulty: 2 },
    { name: '메탈터치',           desc: '금속끼리 면 접촉 + 너트 체결.',                difficulty: 2 },
    { name: '클램프 (그립)',      desc: '점검·재시공 쉬움. 위생관 표준.',               difficulty: 1 },
    { name: '용접 (TIG)',         desc: '영구 결합. 자격 필요.',                        difficulty: 3 },
  ],
}

/* 단열재 권장 두께 (mm) — 동파·결로 방지 일반치 */
export const INSULATION_THICK: Record<PipeSize, number> = {
  '15A': 10, '20A': 10, '25A': 15, '32A': 15, '40A': 20, '50A': 25,
  '65A': 25, '80A': 25, '100A': 30, '125A': 30, '150A': 40,
}

/* 곡률 최소 반지름 (관 OD 배수) */
export const BEND_RADIUS_MULT: Record<Material, number> = {
  steel: 4,    // OD × 4
  pvc:   8,    // 굳을 때 거의 안 휨, 엘보 사용
  pb:    4,    // OD × 4 (저온은 8)
  xl:    8,    // OD × 8 (저온 10)
  copper: 4,   // 연동관 OD × 4
  sts:   8,    // 박벽은 10~12
}

/* ─────────────────────────────────────────────
   유속·유량
   ───────────────────────────────────────────── */

export interface FlowGuide {
  use: string
  min: number
  max: number
  emoji: string
}

export const FLOW_GUIDES: FlowGuide[] = [
  { use: '급수', min: 1.5, max: 2.5,  emoji: '💧' },
  { use: '급탕', min: 1.0, max: 2.0,  emoji: '🔥' },
  { use: '배수', min: 0.6, max: 3.0,  emoji: '🚽' },
  { use: '냉온수 순환', min: 0.6, max: 1.5, emoji: '♻️' },
  { use: '가스', min: 0,   max: 25,   emoji: '🔥' },
]

/* 유량 계산: Q (m³/s) = π/4 × d² × v */
export function calcFlow(idMm: number, velocityMs: number) {
  const dM = idMm / 1000
  const area = Math.PI * 0.25 * dM * dM
  const qM3s = area * velocityMs
  const lpm = qM3s * 60 * 1000
  const m3h = qM3s * 3600
  return { lpm, m3h, qM3s }
}

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 1) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
