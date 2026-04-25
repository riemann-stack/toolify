'use client'

import { useMemo, useState } from 'react'
import styles from './size.module.css'

// ──────────────────────────────────────
// 카테고리 정의
// ──────────────────────────────────────
type Category = 'shoes' | 'top' | 'bottom' | 'bra' | 'ring' | 'hat' | 'glove' | 'belt'
type Gender = 'm' | 'f'

const CLOTHING: { id: Category; label: string; emoji: string }[] = [
  { id: 'shoes',  label: '신발',  emoji: '👟' },
  { id: 'top',    label: '상의',  emoji: '👕' },
  { id: 'bottom', label: '하의',  emoji: '👖' },
  { id: 'bra',    label: '속옷',  emoji: '👙' },
]
const ACCESSORY: { id: Category; label: string; emoji: string }[] = [
  { id: 'ring',  label: '반지', emoji: '💍' },
  { id: 'hat',   label: '모자', emoji: '🧢' },
  { id: 'glove', label: '장갑', emoji: '🧤' },
  { id: 'belt',  label: '벨트', emoji: '🪢' },
]

const HAS_GENDER: Category[] = ['shoes', 'top', 'bottom', 'glove']

// ──────────────────────────────────────
// 데이터: 신발
// ──────────────────────────────────────
const SHOE_M = [
  { kr: 240, us: '6.5',  uk: '6',    eu: '39'   },
  { kr: 245, us: '7',    uk: '6.5',  eu: '39.5' },
  { kr: 250, us: '7.5',  uk: '7',    eu: '40'   },
  { kr: 255, us: '8',    uk: '7.5',  eu: '41'   },
  { kr: 260, us: '8.5',  uk: '8',    eu: '42'   },
  { kr: 265, us: '9',    uk: '8.5',  eu: '42.5' },
  { kr: 270, us: '9.5',  uk: '9',    eu: '43'   },
  { kr: 275, us: '10',   uk: '9.5',  eu: '44'   },
  { kr: 280, us: '10.5', uk: '10',   eu: '44.5' },
  { kr: 285, us: '11',   uk: '10.5', eu: '45'   },
  { kr: 290, us: '11.5', uk: '11',   eu: '46'   },
]
const SHOE_F = [
  { kr: 220, us: '5',    uk: '2.5', eu: '35'   },
  { kr: 225, us: '5.5',  uk: '3',   eu: '35.5' },
  { kr: 230, us: '6',    uk: '3.5', eu: '36'   },
  { kr: 235, us: '6.5',  uk: '4',   eu: '37'   },
  { kr: 240, us: '7',    uk: '4.5', eu: '37.5' },
  { kr: 245, us: '7.5',  uk: '5',   eu: '38'   },
  { kr: 250, us: '8',    uk: '5.5', eu: '38.5' },
  { kr: 255, us: '8.5',  uk: '6',   eu: '39'   },
  { kr: 260, us: '9',    uk: '6.5', eu: '40'   },
  { kr: 265, us: '9.5',  uk: '7',   eu: '40.5' },
]

// ──────────────────────────────────────
// 데이터: 상의
// ──────────────────────────────────────
const TOP_M = [
  { kr: '90 (S)',     us: 'XS',  eu: '44', chestMin: 88,  chestMax: 92,  neckIn: '14-14.5' },
  { kr: '95 (M)',     us: 'S',   eu: '46', chestMin: 92,  chestMax: 96,  neckIn: '15' },
  { kr: '100 (L)',    us: 'M',   eu: '48', chestMin: 96,  chestMax: 100, neckIn: '15.5' },
  { kr: '105 (XL)',   us: 'L',   eu: '50', chestMin: 100, chestMax: 104, neckIn: '16' },
  { kr: '110 (XXL)',  us: 'XL',  eu: '52', chestMin: 104, chestMax: 108, neckIn: '16.5' },
  { kr: '115 (XXXL)', us: 'XXL', eu: '54', chestMin: 108, chestMax: 112, neckIn: '17' },
]
const TOP_F = [
  { kr: '44', us: '0',  eu: '32', uk: '4',  chestMin: 78, chestMax: 82,  waistMin: 60, waistMax: 64 },
  { kr: '55', us: '2',  eu: '34', uk: '6',  chestMin: 82, chestMax: 86,  waistMin: 64, waistMax: 68 },
  { kr: '66', us: '4',  eu: '36', uk: '8',  chestMin: 86, chestMax: 90,  waistMin: 68, waistMax: 72 },
  { kr: '77', us: '6',  eu: '38', uk: '10', chestMin: 90, chestMax: 94,  waistMin: 72, waistMax: 76 },
  { kr: '88', us: '8',  eu: '40', uk: '12', chestMin: 94, chestMax: 98,  waistMin: 76, waistMax: 80 },
  { kr: '99', us: '10', eu: '42', uk: '14', chestMin: 98, chestMax: 104, waistMin: 80, waistMax: 86 },
]

// ──────────────────────────────────────
// 데이터: 하의
// ──────────────────────────────────────
const BOTTOM_M = [
  { kr: '28', us: '28', eu: '44', waist: 71 },
  { kr: '30', us: '30', eu: '46', waist: 76 },
  { kr: '32', us: '32', eu: '48', waist: 81 },
  { kr: '34', us: '34', eu: '50', waist: 86 },
  { kr: '36', us: '36', eu: '52', waist: 91 },
  { kr: '38', us: '38', eu: '54', waist: 96 },
]
const BOTTOM_F = [
  { kr: '24', us: '0',  eu: '32', waist: 60 },
  { kr: '25', us: '2',  eu: '34', waist: 64 },
  { kr: '26', us: '4',  eu: '36', waist: 66 },
  { kr: '27', us: '6',  eu: '38', waist: 68 },
  { kr: '28', us: '8',  eu: '40', waist: 71 },
  { kr: '29', us: '10', eu: '42', waist: 74 },
]

// ──────────────────────────────────────
// 데이터: 브라
// ──────────────────────────────────────
const BRA_BAND = [
  { kr: '65', us: '30', eu: '65', underMin: 60, underMax: 65 },
  { kr: '70', us: '32', eu: '70', underMin: 65, underMax: 70 },
  { kr: '75', us: '34', eu: '75', underMin: 70, underMax: 75 },
  { kr: '80', us: '36', eu: '80', underMin: 75, underMax: 80 },
  { kr: '85', us: '38', eu: '85', underMin: 80, underMax: 85 },
  { kr: '90', us: '40', eu: '90', underMin: 85, underMax: 90 },
]
const BRA_CUP = [
  { kr: 'AA',     us: 'AA',    eu: 'AA', uk: 'AA', diff: 10 },
  { kr: 'A',      us: 'A',     eu: 'A',  uk: 'A',  diff: 12.5 },
  { kr: 'B',      us: 'B',     eu: 'B',  uk: 'B',  diff: 15 },
  { kr: 'C',      us: 'C',     eu: 'C',  uk: 'C',  diff: 17.5 },
  { kr: 'D',      us: 'D',     eu: 'D',  uk: 'D',  diff: 20 },
  { kr: 'E (DD)', us: 'DD',    eu: 'E',  uk: 'DD', diff: 22.5 },
  { kr: 'F',      us: 'DDD/F', eu: 'F',  uk: 'E',  diff: 25 },
  { kr: 'G',      us: 'G',     eu: 'G',  uk: 'F',  diff: 27.5 },
]

// ──────────────────────────────────────
// 데이터: 반지
// ──────────────────────────────────────
const RING_DATA = [
  { kr: '7호',  inner: 14.5, circ: 45.5, us: '4',     uk: 'H',   eu: '46',     jp: '7' },
  { kr: '8호',  inner: 15.0, circ: 47.0, us: '4.5',   uk: 'I',   eu: '47',     jp: '8' },
  { kr: '9호',  inner: 15.3, circ: 48.0, us: '5',     uk: 'J',   eu: '48-49',  jp: '9' },
  { kr: '10호', inner: 15.7, circ: 49.3, us: '5.5',   uk: 'K',   eu: '49-50',  jp: '10' },
  { kr: '11호', inner: 16.0, circ: 50.3, us: '6',     uk: 'L',   eu: '51',     jp: '11' },
  { kr: '12호', inner: 16.5, circ: 51.8, us: '6.5',   uk: 'L½',  eu: '52',     jp: '12' },
  { kr: '13호', inner: 17.0, circ: 53.4, us: '7',     uk: 'N',   eu: '54',     jp: '13' },
  { kr: '14호', inner: 17.3, circ: 54.4, us: '7.25',  uk: 'N½',  eu: '54.5',   jp: '14' },
  { kr: '15호', inner: 17.5, circ: 55.0, us: '7.5',   uk: 'O',   eu: '55-56',  jp: '15' },
  { kr: '16호', inner: 17.7, circ: 55.7, us: '7.75',  uk: 'O½',  eu: '55.7',   jp: '16' },
  { kr: '17호', inner: 18.0, circ: 56.5, us: '8',     uk: 'P',   eu: '57',     jp: '17' },
  { kr: '18호', inner: 18.2, circ: 57.2, us: '8.25',  uk: 'P½',  eu: '57.5',   jp: '18' },
  { kr: '19호', inner: 18.5, circ: 58.1, us: '8.5',   uk: 'Q',   eu: '58',     jp: '19' },
  { kr: '20호', inner: 18.7, circ: 58.7, us: '8.75',  uk: 'Q½',  eu: '58.5',   jp: '20' },
  { kr: '21호', inner: 19.0, circ: 59.6, us: '9',     uk: 'R',   eu: '59-60',  jp: '21' },
  { kr: '22호', inner: 19.4, circ: 60.7, us: '9.5',   uk: 'S½',  eu: '61',     jp: '22' },
  { kr: '23호', inner: 19.8, circ: 62.0, us: '10',    uk: 'T',   eu: '62-63',  jp: '23' },
  { kr: '24호', inner: 20.0, circ: 62.8, us: '10.25', uk: 'T½',  eu: '63.5',   jp: '24' },
  { kr: '25호', inner: 20.2, circ: 63.4, us: '10.5',  uk: 'U',   eu: '64',     jp: '25' },
]

// ──────────────────────────────────────
// 데이터: 모자
// ──────────────────────────────────────
const HAT_DATA = [
  { head: 54, kr: 'S',     us: '6 ¾', uk: '6 ⅝', eu: '54', note: '작음' },
  { head: 55, kr: 'S/M',   us: '6 ⅞', uk: '6 ¾', eu: '55', note: '보통 작음' },
  { head: 56, kr: 'M',     us: '7',   uk: '6 ⅞', eu: '56', note: '표준' },
  { head: 57, kr: 'M/L',   us: '7 ⅛', uk: '7',   eu: '57', note: '표준+' },
  { head: 58, kr: 'L',     us: '7 ¼', uk: '7 ⅛', eu: '58', note: '큼' },
  { head: 59, kr: 'L/XL',  us: '7 ⅜', uk: '7 ¼', eu: '59', note: '큼+' },
  { head: 60, kr: 'XL',    us: '7 ½', uk: '7 ⅜', eu: '60', note: '매우 큼' },
  { head: 61, kr: 'XXL',   us: '7 ⅝', uk: '7 ½', eu: '61', note: '매우 큼+' },
  { head: 62, kr: 'XXXL',  us: '7 ¾', uk: '7 ⅝', eu: '62', note: '가장 큼' },
]

// ──────────────────────────────────────
// 데이터: 장갑
// ──────────────────────────────────────
const GLOVE_M = [
  { handMin: 18, handMax: 19, kr: 'S',   us: '7',  eu: 'S' },
  { handMin: 20, handMax: 21, kr: 'M',   us: '8',  eu: 'M' },
  { handMin: 22, handMax: 23, kr: 'L',   us: '9',  eu: 'L' },
  { handMin: 24, handMax: 25, kr: 'XL',  us: '10', eu: 'XL' },
  { handMin: 26, handMax: 27, kr: 'XXL', us: '11', eu: 'XXL' },
]
const GLOVE_F = [
  { handMin: 15, handMax: 16, kr: 'XS', us: '6',   eu: 'XS' },
  { handMin: 17, handMax: 18, kr: 'S',  us: '6.5', eu: 'S' },
  { handMin: 18, handMax: 19, kr: 'M',  us: '7',   eu: 'M' },
  { handMin: 20, handMax: 21, kr: 'L',  us: '7.5', eu: 'L' },
  { handMin: 22, handMax: 23, kr: 'XL', us: '8',   eu: 'XL' },
]

// ──────────────────────────────────────
// 데이터: 벨트
// ──────────────────────────────────────
const BELT_DATA = [
  { waist: 70,  krIn: '28', usIn: '28', eu: '70'  },
  { waist: 75,  krIn: '30', usIn: '30', eu: '75'  },
  { waist: 80,  krIn: '32', usIn: '32', eu: '80'  },
  { waist: 85,  krIn: '34', usIn: '34', eu: '85'  },
  { waist: 90,  krIn: '36', usIn: '36', eu: '90'  },
  { waist: 95,  krIn: '38', usIn: '38', eu: '95'  },
  { waist: 100, krIn: '40', usIn: '40', eu: '100' },
  { waist: 105, krIn: '42', usIn: '42', eu: '105' },
]

// ──────────────────────────────────────
// 카테고리 메타
// ──────────────────────────────────────
const CATEGORY_META: Record<Category, { title: string; subtitle: string; hint: string }> = {
  shoes:  { title: '👟 신발 사이즈', subtitle: '한국 mm ↔ US/UK/EU 변환', hint: '📏 발 길이: 종이 위에 발을 올리고 가장 긴 발가락 끝과 뒤꿈치 사이를 측정 (양쪽 발 중 더 긴 쪽 기준)' },
  top:    { title: '👕 상의 사이즈', subtitle: '가슴둘레 기반 한국 ↔ US/EU/UK 변환', hint: '📏 가슴둘레: 양팔을 자연스럽게 내리고 가슴의 가장 두꺼운 부분을 수평으로 측정' },
  bottom: { title: '👖 하의 사이즈', subtitle: '허리 인치·cm 동시 표시', hint: '📏 허리둘레: 배꼽 위 1~2cm, 가장 가는 부분을 수평으로 측정 (청바지 인치는 허리 둘레의 인치)' },
  bra:    { title: '👙 브라 사이즈', subtitle: '밑가슴 + 컵 사이즈 변환', hint: '📏 밴드: 가슴 바로 아래 갈비뼈 둘레 측정 / 컵: 가슴 가장 두꺼운 부분 둘레 - 밑가슴 둘레' },
  ring:   { title: '💍 반지 사이즈', subtitle: '한국 호 ↔ US/UK/EU/일본', hint: '📏 손가락 둘레: 종이를 손가락에 감아 표시 후 펜으로 표시한 길이를 자로 측정 (관절을 통과해야 함)' },
  hat:    { title: '🧢 모자 사이즈', subtitle: '머리 둘레 기반 변환', hint: '📏 머리 둘레: 이마(눈썹 위 약 2cm)와 뒤통수의 가장 두꺼운 부분을 수평으로 측정' },
  glove:  { title: '🧤 장갑 사이즈', subtitle: '손바닥 둘레 기반 변환', hint: '📏 손바닥 둘레: 엄지를 제외한 손등의 가장 두꺼운 부분(중지 시작점 부근)을 측정' },
  belt:   { title: '🪢 벨트 사이즈', subtitle: '허리 둘레 기반 변환', hint: '📏 벨트: 기존에 잘 맞는 바지의 허리 사이즈 + 5cm 또는 직접 허리 둘레 측정 (벨트 총 길이 = 허리 + 12~15cm)' },
}

// ──────────────────────────────────────
// 컴포넌트
// ──────────────────────────────────────
export default function SizeClient() {
  const [category, setCategory] = useState<Category>('shoes')
  const [gender, setGender] = useState<Gender>('m')

  // 측정값 상태
  const [shoeMm, setShoeMm] = useState<string>('')
  const [chestCm, setChestCm] = useState<string>('')
  const [waistCm, setWaistCm] = useState<string>('')
  const [bustCm, setBustCm] = useState<string>('')
  const [underBustCm, setUnderBustCm] = useState<string>('')
  const [fingerMm, setFingerMm] = useState<string>('')
  const [headCm, setHeadCm] = useState<string>('')
  const [handCm, setHandCm] = useState<string>('')

  const [search, setSearch] = useState('')

  const meta = CATEGORY_META[category]
  const hasGender = HAS_GENDER.includes(category)

  function selectCategory(c: Category) {
    setCategory(c)
    setSearch('')
    if (c === 'bra') setGender('f')
  }

  function getActiveClass(c: Category) {
    if (category !== c) return ''
    if (c === 'bra') return styles.tabActivePink
    if (CLOTHING.find(x => x.id === c)) return styles.tabActive
    return styles.tabActiveBlue
  }

  return (
    <div className={styles.wrap}>
      {/* 카테고리 선택 (2단) */}
      <div className={styles.categoryGroup}>
        <div className={styles.categoryRow}>
          <span className={styles.categoryRowLabel}>의류</span>
          <div className={styles.categoryTabs}>
            {CLOTHING.map(c => (
              <button
                key={c.id}
                className={`${styles.tab} ${getActiveClass(c.id)}`}
                onClick={() => selectCategory(c.id)}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.categoryRow}>
          <span className={styles.categoryRowLabel}>액세서리</span>
          <div className={styles.categoryTabs}>
            {ACCESSORY.map(c => (
              <button
                key={c.id}
                className={`${styles.tab} ${getActiveClass(c.id)}`}
                onClick={() => selectCategory(c.id)}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 카테고리 헤더 + 성별 토글 */}
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 15, color: 'var(--text)', fontWeight: 700, margin: 0 }}>{meta.title}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{meta.subtitle}</p>
          </div>
          {hasGender && (
            <div className={styles.genderToggle} style={{ minWidth: 160 }}>
              <button
                className={`${styles.genderBtn} ${gender === 'm' ? styles.genderBtnActive : ''}`}
                onClick={() => setGender('m')}
              >👨 남성</button>
              <button
                className={`${styles.genderBtn} ${gender === 'f' ? styles.genderBtnActive : ''}`}
                onClick={() => setGender('f')}
              >👩 여성</button>
            </div>
          )}
        </div>
        <div className={styles.measureHint}>{meta.hint}</div>
      </div>

      {/* 카테고리별 렌더링 */}
      {category === 'shoes' && (
        <ShoeView gender={gender} mm={shoeMm} setMm={setShoeMm} search={search} setSearch={setSearch} />
      )}
      {category === 'top' && (
        <TopView gender={gender} chest={chestCm} setChest={setChestCm} search={search} setSearch={setSearch} />
      )}
      {category === 'bottom' && (
        <BottomView gender={gender} waist={waistCm} setWaist={setWaistCm} search={search} setSearch={setSearch} />
      )}
      {category === 'bra' && (
        <BraView underBust={underBustCm} setUnderBust={setUnderBustCm} bust={bustCm} setBust={setBustCm} search={search} setSearch={setSearch} />
      )}
      {category === 'ring' && (
        <RingView mm={fingerMm} setMm={setFingerMm} search={search} setSearch={setSearch} />
      )}
      {category === 'hat' && (
        <HatView cm={headCm} setCm={setHeadCm} search={search} setSearch={setSearch} />
      )}
      {category === 'glove' && (
        <GloveView gender={gender} cm={handCm} setCm={setHandCm} search={search} setSearch={setSearch} />
      )}
      {category === 'belt' && (
        <BeltView cm={waistCm} setCm={setWaistCm} search={search} setSearch={setSearch} />
      )}
    </div>
  )
}

// ──────────────────────────────────────
// 공통 헬퍼
// ──────────────────────────────────────
function num(s: string): number | null {
  const n = parseFloat(s)
  return isFinite(n) && n > 0 ? n : null
}

function MeasureCard({ children }: { children: React.ReactNode }) {
  return <div className={styles.measureCard}>{children}</div>
}

function MeasureField({ label, unit, value, onChange, placeholder }: {
  label: string; unit: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div className={styles.measureField}>
      <span className={styles.measureLabel}>{label}</span>
      <div className={styles.measureInputWrap}>
        <input
          type="number"
          className={`${styles.measureInput} ${value ? styles.measureInputFilled : ''}`}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          step="0.1"
          min="0"
        />
        <span className={styles.measureInputUnit}>{unit}</span>
      </div>
    </div>
  )
}

function Recommend({ label, value, meta }: { label: string; value: string; meta?: string }) {
  return (
    <div className={styles.recommend}>
      <span className={styles.recommendLabel}>{label}</span>
      <span className={styles.recommendValue}>{value}</span>
      {meta && <span className={styles.recommendMeta}>{meta}</span>}
    </div>
  )
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className={styles.searchBox}>
      <input
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

// ──────────────────────────────────────
// 신발
// ──────────────────────────────────────
function ShoeView({ gender, mm, setMm, search, setSearch }: { gender: Gender; mm: string; setMm: (v: string) => void; search: string; setSearch: (v: string) => void }) {
  const data = gender === 'm' ? SHOE_M : SHOE_F
  const mmVal = num(mm)
  const recommendIdx = useMemo(() => {
    if (!mmVal) return -1
    let best = 0, diff = Infinity
    data.forEach((r, i) => { const d = Math.abs(r.kr - mmVal); if (d < diff) { diff = d; best = i } })
    return best
  }, [mmVal, data])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data
    return data.filter(r =>
      r.kr.toString().includes(q) || r.us.toLowerCase().includes(q) ||
      r.uk.toLowerCase().includes(q) || r.eu.toLowerCase().includes(q)
    )
  }, [search, data])

  return (
    <>
      <MeasureCard>
        <span className={styles.cardLabel}>발 길이로 사이즈 추천</span>
        <div className={styles.measureRowSingle}>
          <MeasureField label="발 길이" unit="mm" value={mm} onChange={setMm} placeholder={gender === 'm' ? '270' : '240'} />
        </div>
        {mmVal && recommendIdx >= 0 && (
          <Recommend
            label="추천 사이즈"
            value={`${data[recommendIdx].kr}mm`}
            meta={`US ${data[recommendIdx].us} · UK ${data[recommendIdx].uk} · EU ${data[recommendIdx].eu}`}
          />
        )}
      </MeasureCard>

      <SearchBox value={search} onChange={setSearch} placeholder="US, EU, UK 또는 mm 검색..." />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {['한국 (mm)', 'US', 'UK', 'EU'].map(h => <th key={h} className={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const dataIdx = data.indexOf(r)
              const isHi = dataIdx === recommendIdx && mmVal !== null
              return (
                <tr key={r.kr} className={`${styles.tr} ${isHi ? styles.trHighlight : ''}`}>
                  <td className={`${styles.td} ${styles.tdAccent}`}>{r.kr}mm</td>
                  <td className={styles.td}>{r.us}</td>
                  <td className={styles.td}>{r.uk}</td>
                  <td className={styles.td}>{r.eu}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ──────────────────────────────────────
// 상의
// ──────────────────────────────────────
function TopView({ gender, chest, setChest, search, setSearch }: { gender: Gender; chest: string; setChest: (v: string) => void; search: string; setSearch: (v: string) => void }) {
  const chestVal = num(chest)

  const recommendIdx = useMemo(() => {
    if (!chestVal) return -1
    const data = gender === 'm' ? TOP_M : TOP_F
    const i = data.findIndex(r => chestVal >= r.chestMin && chestVal <= r.chestMax)
    if (i >= 0) return i
    let best = 0, diff = Infinity
    data.forEach((r, idx) => {
      const c = (r.chestMin + r.chestMax) / 2
      const d = Math.abs(c - chestVal)
      if (d < diff) { diff = d; best = idx }
    })
    return best
  }, [chestVal, gender])

  if (gender === 'm') {
    const filtered = TOP_M.filter(r => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return r.kr.toLowerCase().includes(q) || r.us.toLowerCase().includes(q) || r.eu.includes(q)
    })

    return (
      <>
        <MeasureCard>
          <span className={styles.cardLabel}>가슴둘레로 사이즈 추천</span>
          <div className={styles.measureRowSingle}>
            <MeasureField label="가슴둘레" unit="cm" value={chest} onChange={setChest} placeholder="98" />
          </div>
          {chestVal && recommendIdx >= 0 && (
            <Recommend
              label="추천 사이즈"
              value={TOP_M[recommendIdx].kr}
              meta={`US ${TOP_M[recommendIdx].us} · EU ${TOP_M[recommendIdx].eu}`}
            />
          )}
        </MeasureCard>

        <SearchBox value={search} onChange={setSearch} placeholder="한국, US, EU 사이즈 검색..." />

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['한국', 'US', 'EU', '가슴 (cm)', '셔츠목 (인치)'].map(h => <th key={h} className={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const idx = TOP_M.indexOf(r)
                const isHi = idx === recommendIdx && chestVal !== null
                return (
                  <tr key={r.kr} className={`${styles.tr} ${isHi ? styles.trHighlight : ''}`}>
                    <td className={`${styles.td} ${styles.tdAccent}`}>{r.kr}</td>
                    <td className={styles.td}>{r.us}</td>
                    <td className={styles.td}>{r.eu}</td>
                    <td className={styles.td}>{r.chestMin}–{r.chestMax}</td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{r.neckIn}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  // 여성
  const filteredF = TOP_F.filter(r => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return r.kr.includes(q) || r.us.includes(q) || r.eu.includes(q) || r.uk.includes(q)
  })

  return (
    <>
      <MeasureCard>
        <span className={styles.cardLabel}>가슴둘레로 사이즈 추천</span>
        <div className={styles.measureRowSingle}>
          <MeasureField label="가슴둘레" unit="cm" value={chest} onChange={setChest} placeholder="86" />
        </div>
        {chestVal && recommendIdx >= 0 && (
          <Recommend
            label="추천 사이즈"
            value={TOP_F[recommendIdx].kr}
            meta={`US ${TOP_F[recommendIdx].us} · EU ${TOP_F[recommendIdx].eu} · UK ${TOP_F[recommendIdx].uk}`}
          />
        )}
      </MeasureCard>

      <SearchBox value={search} onChange={setSearch} placeholder="한국, US, EU, UK 사이즈 검색..." />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {['한국', 'US', 'EU', 'UK', '가슴 (cm)', '허리 (cm)'].map(h => <th key={h} className={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filteredF.map((r) => {
              const idx = TOP_F.indexOf(r)
              const isHi = idx === recommendIdx && chestVal !== null
              return (
                <tr key={r.kr} className={`${styles.tr} ${isHi ? styles.trHighlight : ''}`}>
                  <td className={`${styles.td} ${styles.tdAccent}`}>{r.kr}</td>
                  <td className={styles.td}>{r.us}</td>
                  <td className={styles.td}>{r.eu}</td>
                  <td className={styles.td}>{r.uk}</td>
                  <td className={styles.td}>{r.chestMin}–{r.chestMax}</td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{r.waistMin}–{r.waistMax}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ──────────────────────────────────────
// 하의
// ──────────────────────────────────────
function BottomView({ gender, waist, setWaist, search, setSearch }: { gender: Gender; waist: string; setWaist: (v: string) => void; search: string; setSearch: (v: string) => void }) {
  const data = gender === 'm' ? BOTTOM_M : BOTTOM_F
  const waistVal = num(waist)
  const recommendIdx = useMemo(() => {
    if (!waistVal) return -1
    let best = 0, diff = Infinity
    data.forEach((r, i) => { const d = Math.abs(r.waist - waistVal); if (d < diff) { diff = d; best = i } })
    return best
  }, [waistVal, data])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data
    return data.filter(r =>
      r.kr.includes(q) || r.us.includes(q) || r.eu.includes(q) || r.waist.toString().includes(q)
    )
  }, [search, data])

  return (
    <>
      <MeasureCard>
        <span className={styles.cardLabel}>허리둘레로 사이즈 추천</span>
        <div className={styles.measureRowSingle}>
          <MeasureField label="허리둘레" unit="cm" value={waist} onChange={setWaist} placeholder={gender === 'm' ? '81' : '68'} />
        </div>
        {waistVal && recommendIdx >= 0 && (
          <Recommend
            label="추천 사이즈"
            value={`${data[recommendIdx].kr}${gender === 'm' ? ' (인치)' : '(여)'}`}
            meta={`US ${data[recommendIdx].us} · EU ${data[recommendIdx].eu} · 허리 ${data[recommendIdx].waist}cm`}
          />
        )}
      </MeasureCard>

      <SearchBox value={search} onChange={setSearch} placeholder="한국, US, EU 또는 cm 검색..." />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {['한국', 'US 인치', 'EU', '허리 (cm)'].map(h => <th key={h} className={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const idx = data.indexOf(r)
              const isHi = idx === recommendIdx && waistVal !== null
              return (
                <tr key={r.kr} className={`${styles.tr} ${isHi ? styles.trHighlight : ''}`}>
                  <td className={`${styles.td} ${styles.tdAccent}`}>{r.kr}</td>
                  <td className={styles.td}>{r.us}"</td>
                  <td className={styles.td}>{r.eu}</td>
                  <td className={styles.td}>{r.waist}cm</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ──────────────────────────────────────
// 브라
// ──────────────────────────────────────
function BraView({ underBust, setUnderBust, bust, setBust, search, setSearch }: { underBust: string; setUnderBust: (v: string) => void; bust: string; setBust: (v: string) => void; search: string; setSearch: (v: string) => void }) {
  const ub = num(underBust)
  const b  = num(bust)
  const cupDiff = ub && b && b > ub ? b - ub : null

  const bandIdx = useMemo(() => {
    if (!ub) return -1
    const i = BRA_BAND.findIndex(r => ub >= r.underMin && ub < r.underMax)
    if (i >= 0) return i
    let best = 0, diff = Infinity
    BRA_BAND.forEach((r, idx) => {
      const c = (r.underMin + r.underMax) / 2
      const d = Math.abs(c - ub)
      if (d < diff) { diff = d; best = idx }
    })
    return best
  }, [ub])

  const cupIdx = useMemo(() => {
    if (cupDiff === null) return -1
    let best = 0, diff = Infinity
    BRA_CUP.forEach((r, idx) => {
      const d = Math.abs(r.diff - cupDiff)
      if (d < diff) { diff = d; best = idx }
    })
    return best
  }, [cupDiff])

  const recommend = ub && cupDiff !== null && bandIdx >= 0 && cupIdx >= 0
    ? `${BRA_BAND[bandIdx].kr}${BRA_CUP[cupIdx].kr.replace(/\s.*/, '')}`
    : null

  const filteredBand = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return BRA_BAND
    return BRA_BAND.filter(r => r.kr.includes(q) || r.us.includes(q) || r.eu.includes(q))
  }, [search])

  const filteredCup = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return BRA_CUP
    return BRA_CUP.filter(r => r.kr.toLowerCase().includes(q) || r.us.toLowerCase().includes(q))
  }, [search])

  return (
    <>
      <MeasureCard>
        <span className={styles.cardLabel}>밑가슴 + 가슴 둘레로 사이즈 추천</span>
        <div className={styles.measureRow}>
          <MeasureField label="밑가슴 둘레" unit="cm" value={underBust} onChange={setUnderBust} placeholder="73" />
          <MeasureField label="가슴 둘레" unit="cm" value={bust} onChange={setBust} placeholder="88" />
        </div>
        {recommend && (
          <Recommend
            label="추천 사이즈 (한국)"
            value={recommend}
            meta={`밑가슴 ${ub}cm · 컵 차이 ${cupDiff?.toFixed(1)}cm`}
          />
        )}
        {ub && cupDiff !== null && (
          <div className={styles.infoBox} style={{ marginTop: 10 }}>
            <strong>표기 방식:</strong> 한국·EU = 밑가슴 cm + 컵 (예: {recommend ?? '75B'}) · US = 밑가슴 인치 + 컵 (예: 34B)
          </div>
        )}
      </MeasureCard>

      <SearchBox value={search} onChange={setSearch} placeholder="브라 사이즈 검색..." />

      {/* 밴드 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>1. 밴드 사이즈 (밑가슴 둘레)</span>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['한국', 'US', 'EU', '밑가슴 (cm)'].map(h => <th key={h} className={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredBand.map((r) => {
                const idx = BRA_BAND.indexOf(r)
                const isHi = idx === bandIdx && ub !== null
                return (
                  <tr key={r.kr} className={`${styles.tr} ${isHi ? styles.trHighlight : ''}`}>
                    <td className={`${styles.td} ${styles.tdAccent}`}>{r.kr}</td>
                    <td className={styles.td}>{r.us}</td>
                    <td className={styles.td}>{r.eu}</td>
                    <td className={styles.td}>{r.underMin}–{r.underMax}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 컵 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>2. 컵 사이즈 (가슴 - 밑가슴)</span>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['한국', 'US', 'EU', 'UK', '컵 차이 (cm)'].map(h => <th key={h} className={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredCup.map((r) => {
                const idx = BRA_CUP.indexOf(r)
                const isHi = idx === cupIdx && cupDiff !== null
                return (
                  <tr key={r.kr} className={`${styles.tr} ${isHi ? styles.trHighlight : ''}`}>
                    <td className={`${styles.td} ${styles.tdAccent}`}>{r.kr}</td>
                    <td className={styles.td}>{r.us}</td>
                    <td className={styles.td}>{r.eu}</td>
                    <td className={styles.td}>{r.uk}</td>
                    <td className={styles.td}>~{r.diff}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ──────────────────────────────────────
// 반지
// ──────────────────────────────────────
function RingView({ mm, setMm, search, setSearch }: { mm: string; setMm: (v: string) => void; search: string; setSearch: (v: string) => void }) {
  const mmVal = num(mm)
  const recommendIdx = useMemo(() => {
    if (!mmVal) return -1
    let best = 0, diff = Infinity
    // mm은 둘레 또는 안지름. 안지름 추정: 14~21mm, 둘레 추정: 44~64mm
    const isCirc = mmVal > 30
    RING_DATA.forEach((r, i) => {
      const v = isCirc ? r.circ : r.inner
      const d = Math.abs(v - mmVal)
      if (d < diff) { diff = d; best = i }
    })
    return best
  }, [mmVal])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return RING_DATA
    return RING_DATA.filter(r =>
      r.kr.includes(q) || r.us.includes(q) || r.uk.toLowerCase().includes(q) || r.eu.includes(q) || r.jp.includes(q)
    )
  }, [search])

  return (
    <>
      <MeasureCard>
        <span className={styles.cardLabel}>손가락 둘레 또는 안지름으로 추천</span>
        <div className={styles.measureRowSingle}>
          <MeasureField label="둘레 또는 안지름" unit="mm" value={mm} onChange={setMm} placeholder="50 (둘레) 또는 16 (안지름)" />
        </div>
        {mmVal && recommendIdx >= 0 && (
          <Recommend
            label="추천 사이즈"
            value={RING_DATA[recommendIdx].kr}
            meta={`US ${RING_DATA[recommendIdx].us} · EU ${RING_DATA[recommendIdx].eu} · 일본 ${RING_DATA[recommendIdx].jp}`}
          />
        )}
        <div className={styles.infoBox} style={{ marginTop: 10 }}>
          <strong>한국 평균:</strong> 여성 9~13호 · 남성 17~21호 · 30mm 초과 = 둘레, 30mm 이하 = 안지름으로 자동 인식
        </div>
      </MeasureCard>

      <SearchBox value={search} onChange={setSearch} placeholder="호, US, UK, EU 사이즈 검색..." />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {['한국 호', '안지름', '둘레', 'US', 'UK', 'EU', '일본'].map(h => <th key={h} className={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const idx = RING_DATA.indexOf(r)
              const isHi = idx === recommendIdx && mmVal !== null
              return (
                <tr key={r.kr} className={`${styles.tr} ${isHi ? styles.trHighlight : ''}`}>
                  <td className={`${styles.td} ${styles.tdAccent}`}>{r.kr}</td>
                  <td className={styles.td}>{r.inner}mm</td>
                  <td className={styles.td}>{r.circ}mm</td>
                  <td className={styles.td}>{r.us}</td>
                  <td className={styles.td}>{r.uk}</td>
                  <td className={styles.td}>{r.eu}</td>
                  <td className={styles.td}>{r.jp}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ──────────────────────────────────────
// 모자
// ──────────────────────────────────────
function HatView({ cm, setCm, search, setSearch }: { cm: string; setCm: (v: string) => void; search: string; setSearch: (v: string) => void }) {
  const cmVal = num(cm)
  const recommendIdx = useMemo(() => {
    if (!cmVal) return -1
    let best = 0, diff = Infinity
    HAT_DATA.forEach((r, i) => { const d = Math.abs(r.head - cmVal); if (d < diff) { diff = d; best = i } })
    return best
  }, [cmVal])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return HAT_DATA
    return HAT_DATA.filter(r =>
      r.kr.toLowerCase().includes(q) || r.us.toLowerCase().includes(q) ||
      r.uk.toLowerCase().includes(q) || r.eu.includes(q) || r.head.toString().includes(q)
    )
  }, [search])

  return (
    <>
      <MeasureCard>
        <span className={styles.cardLabel}>머리 둘레로 사이즈 추천</span>
        <div className={styles.measureRowSingle}>
          <MeasureField label="머리 둘레" unit="cm" value={cm} onChange={setCm} placeholder="57" />
        </div>
        {cmVal && recommendIdx >= 0 && (
          <Recommend
            label="추천 사이즈"
            value={HAT_DATA[recommendIdx].kr}
            meta={`US ${HAT_DATA[recommendIdx].us} · ${HAT_DATA[recommendIdx].head}cm · ${HAT_DATA[recommendIdx].note}`}
          />
        )}
        <div className={styles.infoBox} style={{ marginTop: 10 }}>
          <strong>평균:</strong> 한국 여성 54~57cm · 한국 남성 57~60cm · 미국은 인치(머리 둘레 ÷ π) 단위
        </div>
      </MeasureCard>

      <SearchBox value={search} onChange={setSearch} placeholder="사이즈 검색..." />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {['한국', '머리 (cm)', 'US', 'UK', 'EU', '메모'].map(h => <th key={h} className={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const idx = HAT_DATA.indexOf(r)
              const isHi = idx === recommendIdx && cmVal !== null
              return (
                <tr key={r.head} className={`${styles.tr} ${isHi ? styles.trHighlight : ''}`}>
                  <td className={`${styles.td} ${styles.tdAccent}`}>{r.kr}</td>
                  <td className={styles.td}>{r.head}cm</td>
                  <td className={styles.td}>{r.us}</td>
                  <td className={styles.td}>{r.uk}</td>
                  <td className={styles.td}>{r.eu}</td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>{r.note}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ──────────────────────────────────────
// 장갑
// ──────────────────────────────────────
function GloveView({ gender, cm, setCm, search, setSearch }: { gender: Gender; cm: string; setCm: (v: string) => void; search: string; setSearch: (v: string) => void }) {
  const data = gender === 'm' ? GLOVE_M : GLOVE_F
  const cmVal = num(cm)

  const recommendIdx = useMemo(() => {
    if (!cmVal) return -1
    const i = data.findIndex(r => cmVal >= r.handMin && cmVal <= r.handMax)
    if (i >= 0) return i
    let best = 0, diff = Infinity
    data.forEach((r, idx) => {
      const c = (r.handMin + r.handMax) / 2
      const d = Math.abs(c - cmVal)
      if (d < diff) { diff = d; best = idx }
    })
    return best
  }, [cmVal, data])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data
    return data.filter(r => r.kr.toLowerCase().includes(q) || r.us.toLowerCase().includes(q))
  }, [search, data])

  return (
    <>
      <MeasureCard>
        <span className={styles.cardLabel}>손바닥 둘레로 사이즈 추천</span>
        <div className={styles.measureRowSingle}>
          <MeasureField label="손바닥 둘레" unit="cm" value={cm} onChange={setCm} placeholder={gender === 'm' ? '21' : '18'} />
        </div>
        {cmVal && recommendIdx >= 0 && (
          <Recommend
            label="추천 사이즈"
            value={data[recommendIdx].kr}
            meta={`US ${data[recommendIdx].us} · ${data[recommendIdx].handMin}–${data[recommendIdx].handMax}cm`}
          />
        )}
      </MeasureCard>

      <SearchBox value={search} onChange={setSearch} placeholder="사이즈 검색..." />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {['손둘레 (cm)', '한국', 'US', 'EU'].map(h => <th key={h} className={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const idx = data.indexOf(r)
              const isHi = idx === recommendIdx && cmVal !== null
              return (
                <tr key={r.kr} className={`${styles.tr} ${isHi ? styles.trHighlight : ''}`}>
                  <td className={styles.td}>{r.handMin}–{r.handMax}</td>
                  <td className={`${styles.td} ${styles.tdAccent}`}>{r.kr}</td>
                  <td className={styles.td}>{r.us}</td>
                  <td className={styles.td}>{r.eu}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ──────────────────────────────────────
// 벨트
// ──────────────────────────────────────
function BeltView({ cm, setCm, search, setSearch }: { cm: string; setCm: (v: string) => void; search: string; setSearch: (v: string) => void }) {
  const cmVal = num(cm)
  const recommendIdx = useMemo(() => {
    if (!cmVal) return -1
    let best = 0, diff = Infinity
    BELT_DATA.forEach((r, i) => { const d = Math.abs(r.waist - cmVal); if (d < diff) { diff = d; best = i } })
    return best
  }, [cmVal])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return BELT_DATA
    return BELT_DATA.filter(r => r.krIn.includes(q) || r.usIn.includes(q) || r.eu.includes(q) || r.waist.toString().includes(q))
  }, [search])

  return (
    <>
      <MeasureCard>
        <span className={styles.cardLabel}>허리 둘레로 사이즈 추천</span>
        <div className={styles.measureRowSingle}>
          <MeasureField label="허리 둘레" unit="cm" value={cm} onChange={setCm} placeholder="80" />
        </div>
        {cmVal && recommendIdx >= 0 && (
          <Recommend
            label="추천 사이즈"
            value={`${BELT_DATA[recommendIdx].krIn}인치`}
            meta={`벨트 총 길이 ${cmVal + 12}~${cmVal + 15}cm 권장 · EU ${BELT_DATA[recommendIdx].eu}`}
          />
        )}
        <div className={styles.infoBox} style={{ marginTop: 10 }}>
          <strong>벨트 길이 안내:</strong> 가운데 구멍이 표준 사이즈 (양쪽 2개씩 여유) · 총 길이 = 허리 + 12~15cm
        </div>
      </MeasureCard>

      <SearchBox value={search} onChange={setSearch} placeholder="사이즈 검색..." />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {['허리 (cm)', '한국 인치', 'US 인치', 'EU'].map(h => <th key={h} className={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const idx = BELT_DATA.indexOf(r)
              const isHi = idx === recommendIdx && cmVal !== null
              return (
                <tr key={r.waist} className={`${styles.tr} ${isHi ? styles.trHighlight : ''}`}>
                  <td className={styles.td}>{r.waist}cm</td>
                  <td className={`${styles.td} ${styles.tdAccent}`}>{r.krIn}"</td>
                  <td className={styles.td}>{r.usIn}"</td>
                  <td className={styles.td}>{r.eu}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
