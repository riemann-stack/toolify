'use client'

import Disclaimer from '@/components/Disclaimer'
import { todayStr } from '@/lib/date'
import { useMemo, useState } from 'react'
import styles from './fight-weight.module.css'

/* ─────────────────────────────────────────────────────────
 * 체급 데이터
 * ───────────────────────────────────────────────────────── */
type Gender = 'male' | 'female' | 'both'
interface WeightClass {
  name: string
  nameEn?: string
  limit: number      // kg (이하). 무제한은 Infinity
  forGender?: Gender
}

interface Sport {
  id: string
  flag: string
  label: string
  cls: string
  classes: WeightClass[]
  policy: string
  weighInHours: number  // 계체 후 시합까지 시간 (재수화 시간)
}

// 프로 복싱은 여자 경기도 같은 lb 체급을 쓴다(여자 전용 아톰급 102lb 추가)
const BOXING: WeightClass[] = [
  { name: '아톰급(여)',     nameEn: 'Atomweight',          limit: 46.27, forGender: 'female' },
  { name: '미니멈웨이트',   nameEn: 'Minimumweight',       limit: 47.6,  forGender: 'both' },
  { name: '라이트플라이급', nameEn: 'Light Flyweight',     limit: 48.99, forGender: 'both' },
  { name: '플라이급',       nameEn: 'Flyweight',           limit: 50.8,  forGender: 'both' },
  { name: '슈퍼플라이급',   nameEn: 'Super Flyweight',     limit: 52.16, forGender: 'both' },
  { name: '밴텀급',         nameEn: 'Bantamweight',        limit: 53.52, forGender: 'both' },
  { name: '슈퍼밴텀급',     nameEn: 'Super Bantamweight',  limit: 55.34, forGender: 'both' },
  { name: '페더급',         nameEn: 'Featherweight',       limit: 57.15, forGender: 'both' },
  { name: '슈퍼페더급',     nameEn: 'Super Featherweight', limit: 58.97, forGender: 'both' },
  { name: '라이트급',       nameEn: 'Lightweight',         limit: 61.23, forGender: 'both' },
  { name: '슈퍼라이트급',   nameEn: 'Super Lightweight',   limit: 63.5,  forGender: 'both' },
  { name: '웰터급',         nameEn: 'Welterweight',        limit: 66.68, forGender: 'both' },
  { name: '슈퍼웰터급',     nameEn: 'Super Welterweight',  limit: 69.85, forGender: 'both' },
  { name: '미들급',         nameEn: 'Middleweight',        limit: 72.57, forGender: 'both' },
  { name: '슈퍼미들급',     nameEn: 'Super Middleweight',  limit: 76.2,  forGender: 'both' },
  { name: '라이트헤비급',   nameEn: 'Light Heavyweight',   limit: 79.38, forGender: 'both' },
  { name: '크루저급',       nameEn: 'Cruiserweight',       limit: 90.72, forGender: 'both' },
  { name: '헤비급',         nameEn: 'Heavyweight',         limit: Infinity, forGender: 'both' },
]

const UFC: WeightClass[] = [
  { name: '스트로급(여)',   nameEn: 'Strawweight',         limit: 52.2,  forGender: 'female' },
  { name: '플라이급',       nameEn: 'Flyweight',           limit: 56.7,  forGender: 'both' },
  { name: '밴텀급',         nameEn: 'Bantamweight',        limit: 61.2,  forGender: 'both' },
  { name: '페더급',         nameEn: 'Featherweight',       limit: 65.8,  forGender: 'both' },
  { name: '라이트급',       nameEn: 'Lightweight',         limit: 70.3,  forGender: 'male' },
  { name: '웰터급',         nameEn: 'Welterweight',        limit: 77.1,  forGender: 'male' },
  { name: '미들급',         nameEn: 'Middleweight',        limit: 83.9,  forGender: 'male' },
  { name: '라이트헤비급',   nameEn: 'Light Heavyweight',   limit: 93.0,  forGender: 'male' },
  { name: '헤비급',         nameEn: 'Heavyweight',         limit: 120.2, forGender: 'male' },
]

const ONE_FC: WeightClass[] = [
  { name: '아톰급(여)', limit: 52.2, forGender: 'female' },
  { name: '스트로급',   limit: 56.7, forGender: 'both' },
  { name: '플라이급',   limit: 61.2, forGender: 'both' },
  { name: '밴텀급',     limit: 65.8, forGender: 'both' },
  { name: '페더급',     limit: 70.3, forGender: 'male' },
  { name: '라이트급',   limit: 77.1, forGender: 'male' },
  { name: '웰터급',     limit: 83.9, forGender: 'male' },
  { name: '미들급',     limit: 93.0, forGender: 'male' },
  { name: '라이트헤비급', limit: 102.1, forGender: 'male' },
  { name: '헤비급',     limit: 120.2, forGender: 'male' },
]

// K-1 WORLD GP 체급 — 남자 -53 ~ -90kg(헤비급 무제한), 여자는 별도 체급(아톰 -45 · 미니멈 -48 · 플라이 -52kg)
const KICKBOXING: WeightClass[] = [
  { name: '밴텀급',         limit: 53.0 },
  { name: '슈퍼밴텀급',     limit: 55.0 },
  { name: '페더급',         limit: 57.5 },
  { name: '슈퍼페더급',     limit: 60.0 },
  { name: '라이트급',       limit: 62.5 },
  { name: '슈퍼라이트급',   limit: 65.0 },
  { name: '웰터급',         limit: 67.5 },
  { name: '슈퍼웰터급',     limit: 70.0 },
  { name: '미들급',         limit: 75.0 },
  { name: '크루저급',       limit: 90.0 },
  { name: '헤비급',         limit: Infinity },
  { name: '아톰급',         limit: 45.0, forGender: 'female' },
  { name: '미니멈급',       limit: 48.0, forGender: 'female' },
  { name: '플라이급',       limit: 52.0, forGender: 'female' },
]

// WT 시니어 체급
const TAEKWONDO: WeightClass[] = [
  { name: '핀급',  limit: 54.0 },
  { name: '플라이급', limit: 58.0 },
  { name: '밴텀급', limit: 63.0 },
  { name: '페더급', limit: 68.0 },
  { name: '라이트급', limit: 74.0 },
  { name: '웰터급', limit: 80.0 },
  { name: '미들급', limit: 87.0 },
  { name: '헤비급', limit: Infinity },
  { name: '핀급',     limit: 46.0, forGender: 'female' },
  { name: '플라이급', limit: 49.0, forGender: 'female' },
  { name: '밴텀급',   limit: 53.0, forGender: 'female' },
  { name: '페더급',   limit: 57.0, forGender: 'female' },
  { name: '라이트급', limit: 62.0, forGender: 'female' },
  { name: '웰터급',   limit: 67.0, forGender: 'female' },
  { name: '미들급',   limit: 73.0, forGender: 'female' },
  { name: '헤비급',   limit: Infinity, forGender: 'female' },
]

// IJF 체급 (남 7 + 여 7)
const JUDO: WeightClass[] = [
  { name: '-60kg급',  limit: 60.0 },
  { name: '-66kg급',  limit: 66.0 },
  { name: '-73kg급',  limit: 73.0 },
  { name: '-81kg급',  limit: 81.0 },
  { name: '-90kg급',  limit: 90.0 },
  { name: '-100kg급', limit: 100.0 },
  { name: '+100kg급', limit: Infinity },
  { name: '-48kg급',  limit: 48.0, forGender: 'female' },
  { name: '-52kg급',  limit: 52.0, forGender: 'female' },
  { name: '-57kg급',  limit: 57.0, forGender: 'female' },
  { name: '-63kg급',  limit: 63.0, forGender: 'female' },
  { name: '-70kg급',  limit: 70.0, forGender: 'female' },
  { name: '-78kg급',  limit: 78.0, forGender: 'female' },
  { name: '+78kg급',  limit: Infinity, forGender: 'female' },
]

// 복싱과 같은 lb 체계 (WBC Muaythai·WMC 등). 크루저급 이상 한도는 단체별 차이가 있다.
const MUAY_THAI: WeightClass[] = [
  { name: '미니플라이급',   limit: 47.63, forGender: 'both' },
  { name: '라이트플라이급', limit: 48.99, forGender: 'both' },
  { name: '플라이급',       limit: 50.8,  forGender: 'both' },
  { name: '슈퍼플라이급',   limit: 52.16, forGender: 'both' },
  { name: '밴텀급',         limit: 53.52, forGender: 'both' },
  { name: '슈퍼밴텀급',     limit: 55.34, forGender: 'both' },
  { name: '페더급',         limit: 57.15, forGender: 'both' },
  { name: '슈퍼페더급',     limit: 58.97, forGender: 'both' },
  { name: '라이트급',       limit: 61.23, forGender: 'both' },
  { name: '슈퍼라이트급',   limit: 63.5,  forGender: 'both' },
  { name: '웰터급',         limit: 66.68, forGender: 'both' },
  { name: '슈퍼웰터급',     limit: 69.85, forGender: 'both' },
  { name: '미들급',         limit: 72.57, forGender: 'both' },
  { name: '슈퍼미들급',     limit: 76.2,  forGender: 'both' },
  { name: '라이트헤비급',   limit: 79.38, forGender: 'both' },
  { name: '크루저급',       limit: 86.18, forGender: 'both' },
  { name: '헤비급',         limit: 95.25, forGender: 'both' },
  { name: '슈퍼헤비급',     limit: Infinity, forGender: 'both' },
]

const WRESTLING_FREE: WeightClass[] = [
  // UWW 자유형 시니어 — 남자 10체급 + 여자 10체급
  { name: '57kg',  limit: 57 },
  { name: '61kg',  limit: 61 },
  { name: '65kg',  limit: 65 },
  { name: '70kg',  limit: 70 },
  { name: '74kg',  limit: 74 },
  { name: '79kg',  limit: 79 },
  { name: '86kg',  limit: 86 },
  { name: '92kg',  limit: 92 },
  { name: '97kg',  limit: 97 },
  { name: '125kg', limit: 125 },
  { name: '50kg',  limit: 50, forGender: 'female' },
  { name: '53kg',  limit: 53, forGender: 'female' },
  { name: '55kg',  limit: 55, forGender: 'female' },
  { name: '57kg',  limit: 57, forGender: 'female' },
  { name: '59kg',  limit: 59, forGender: 'female' },
  { name: '62kg',  limit: 62, forGender: 'female' },
  { name: '65kg',  limit: 65, forGender: 'female' },
  { name: '68kg',  limit: 68, forGender: 'female' },
  { name: '72kg',  limit: 72, forGender: 'female' },
  { name: '76kg',  limit: 76, forGender: 'female' },
]

const SPORTS: Sport[] = [
  { id: 'boxing', flag: '🥊', label: '복싱',         cls: 'sportBoxing', classes: BOXING,          policy: '시합 전날 또는 당일 계체 (단체별 차이) · 재수화 시간 충분 → 큰 차이 가능', weighInHours: 24 },
  { id: 'ufc',    flag: '🥋', label: 'UFC (MMA)',   cls: 'sportUFC',    classes: UFC,              policy: '시합 전날 오전 계체 · 약 30~36시간 재수화 자유 → 8~12kg 차이 흔함', weighInHours: 30 },
  { id: 'one',    flag: '🌿', label: 'ONE',          cls: 'sportONE',    classes: ONE_FC,           policy: '수분 감량 금지(2015~) · 시합 3주 전 매주 체중 보고 · 매일 소변 비중 측정', weighInHours: 0 },
  { id: 'kick',   flag: '🦵', label: '킥복싱(K-1)', cls: 'sportKick',   classes: KICKBOXING,       policy: '대회별 다양 · 일반적으로 시합 전날 계체', weighInHours: 18 },
  { id: 'judo',   flag: '🥋', label: '유도',         cls: 'sportJudo',   classes: JUDO,             policy: '국제 대회는 시합 당일 새벽 계체 · 재수화 시간 짧음 (수 시간)', weighInHours: 4 },
  { id: 'tkd',    flag: '🦿', label: '태권도',       cls: 'sportTKD',    classes: TAEKWONDO,        policy: '시합 당일 또는 전날 계체 · 대회별 차이 큼', weighInHours: 12 },
  { id: 'muay',   flag: '🥊', label: '무에타이',     cls: 'sportMuay',   classes: MUAY_THAI,        policy: '시합 전날 계체 · 재수화 일반적', weighInHours: 18 },
  { id: 'wrest',  flag: '🤼', label: '레슬링(자유)', cls: 'sportWrest',  classes: WRESTLING_FREE,   policy: '국제 대회 시합 당일 새벽 계체 · 재수화 시간 매우 짧음', weighInHours: 3 },
]

/* 성별 필터 — forGender 미지정은 남자 체급 */
function fitsGender(c: WeightClass, gender: Gender): boolean {
  return c.forGender === 'both' || (c.forGender ?? 'male') === gender
}

/* 안전한 숫자 파싱 */
function n(v: string | number): number {
  const x = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(x) || x < 0) return 0
  return x
}

/* 적정 체급 추천 (BMI 22 기준, -3~+6kg 범위) */
function recommendClasses(height: number, weight: number, classes: WeightClass[], gender: Gender): WeightClass[] {
  if (height <= 0) {
    // 키 미입력 시 현재 체중 기준 ±2kg 범위에서 추천
    return classes
      .filter(c => fitsGender(c, gender))
      .filter(c => c.limit !== Infinity && Math.abs(c.limit - weight) <= 4)
      .slice(0, 3)
  }
  const ideal = 22 * Math.pow(height / 100, 2)
  const lower = ideal - 3
  const upper = ideal + 6
  return classes
    .filter(c => fitsGender(c, gender))
    .filter(c => c.limit >= lower && c.limit <= upper && c.limit !== Infinity)
    .slice(0, 4)
}

/* 위험도 평가 */
function evalRisk(weeklyLossKg: number, currentWeight: number): { level: 'safe' | 'caution' | 'danger' | 'severe'; cls: string; label: string } {
  if (currentWeight <= 0) return { level: 'safe', cls: styles.riskSafe, label: '✅ 입력 대기' }
  const pct = (weeklyLossKg / currentWeight) * 100
  if (pct <= 1.0) return { level: 'safe',    cls: styles.riskSafe,    label: '✅ 안전' }
  if (pct <= 1.5) return { level: 'caution', cls: styles.riskCaution, label: '🔶 주의' }
  if (pct <= 2.0) return { level: 'danger',  cls: styles.riskDanger,  label: '🚨 위험' }
  return { level: 'severe', cls: styles.riskSevere, label: '❌ 매우 위험' }
}

/* kg → lbs */
function toLbs(kg: number): number { return kg * 2.20462 }

/* ─────────────────────────────────────────────────────────
 * 메인
 * ───────────────────────────────────────────────────────── */
export default function FightWeightClient() {
  const [tab, setTab] = useState<'search' | 'plan' | 'tables'>('search')
  const [sportId, setSportId] = useState('boxing')

  const [weightStr, setWeightStr] = useState('78')
  const [heightStr, setHeightStr] = useState('175')
  const [gender, setGender] = useState<Gender>('male')

  // 계체 예정일 (default: 30일 후)
  const [weighInDate, setWeighInDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30)
    return todayStr(d)
  })

  const [targetClassName, setTargetClassName] = useState('')
  const [copied, setCopied] = useState(false)

  const weight = n(weightStr)
  const height = n(heightStr)
  const sport = SPORTS.find(s => s.id === sportId)!

  // 종목 변경 시 목표 체급 초기화
  function selectSport(id: string) {
    setSportId(id)
    setTargetClassName('')
  }

  // 성별 변경 시에도 목표 체급 초기화 (남녀 체급 이름이 겹치는 종목이 있음)
  function selectGender(g: Gender) {
    setGender(g)
    setTargetClassName('')
  }

  // 성별로 필터된 체급
  const availableClasses = useMemo(
    () => sport.classes.filter(c => fitsGender(c, gender)),
    [sport, gender]
  )

  // 추천 체급
  const recommended = useMemo(
    () => recommendClasses(height, weight, sport.classes, gender),
    [height, weight, sport.classes, gender]
  )

  // 현재 체급 (체중이 속하는 가장 가벼운 체급) — 체급 검색 탭용
  const currentClass = useMemo(() => {
    const c = availableClasses.find(c => c.limit >= weight)
    return c ?? availableClasses[availableClasses.length - 1]
  }, [availableClasses, weight])

  // 체급 사다리 (현재 체급 주변 5체급) — 체급 검색 탭용
  const ladder = useMemo(() => {
    if (availableClasses.length === 0) return []
    const idx = availableClasses.indexOf(currentClass)
    const start = Math.max(0, idx - 3)
    const end = Math.min(availableClasses.length, idx + 2)
    return availableClasses.slice(start, end)
  }, [availableClasses, currentClass])

  // 목표 체급 (직접 선택 or 추천 첫 번째)
  const targetClass = useMemo(() => {
    if (targetClassName) {
      const picked = availableClasses.find(c => c.name === targetClassName)
      if (picked) return picked
    }
    // 디폴트: 현재 체중에서 한 체급 아래(실제 감량 목표). 없으면 가장 가벼운 체급 — "이미 통과"가 기본값이 되지 않게.
    const finite = availableClasses.filter(c => c.limit !== Infinity)
    const below = [...finite].reverse().find(c => c.limit < weight)
    return below ?? finite[0] ?? availableClasses[availableClasses.length - 1]
  }, [targetClassName, availableClasses, weight])

  // 감량 필요량
  const needToLose = targetClass && targetClass.limit !== Infinity ? Math.max(0, weight - targetClass.limit) : 0

  // D-day
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const weighInMs = useMemo(() => new Date(weighInDate + 'T00:00:00').getTime(), [weighInDate])
  const validDate = Number.isFinite(weighInMs)   // 날짜를 비우면 NaN → 가드
  // 두 값 모두 로컬 자정 → 반올림으로 DST 1시간 오차 흡수
  const rawDays = validDate ? Math.round((weighInMs - today.getTime()) / (1000 * 60 * 60 * 24)) : NaN
  const pastDate = validDate && rawDays <= 0      // 오늘 또는 지난 날짜 — 계획 계산 불가
  const planReady = validDate && !pastDate
  const daysToWeighIn = planReady ? rawDays : 1
  const minDate = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 1); return todayStr(d) }, [])

  // 일평균/주간 감량
  const dailyLossKg  = needToLose / daysToWeighIn
  const weeklyLossKg = dailyLossKg * 7

  // 위험도
  const risk = evalRisk(weeklyLossKg, weight)

  // 단계 분리 — ONE은 수분 감량(사우나) 금지 단체라 전량 체지방 감량으로 배정
  const waterCut = sport.id !== 'one'
  const fatPhaseLoss   = needToLose * (waterCut ? 0.7 : 1)
  const waterPhaseLoss = needToLose * (waterCut ? 0.3 : 0)

  // 단계 경계: 체지방 D-N → D-waterStart, 수분 D-waterStart → D-1.
  // 14일 이상 남으면 수분 단계는 마지막 7일, 그보다 짧으면 남은 기간을 반씩 나눈다(체지방 단계가 하루로 몰리지 않게).
  // ONE(수분 감량 금지)은 D-N → D-1 전체를 체지방 단계로 둔다.
  const waterStart = waterCut ? Math.min(7, Math.max(1, Math.floor(daysToWeighIn / 2))) : 1
  // 수분으로 빼야 하는 양의 체중 대비 비율 — 2%를 넘으면 수행 능력 저하·열 질환 위험 (ACSM 수분 섭취 권고)
  const waterPct = weight > 0 ? (waterPhaseLoss / weight) * 100 : 0
  // 7일 이내라도 체중의 1% 이하(위험도 '안전' 구간)면 경고하지 않는다 — 위험도 카드와 메시지가 엇갈리지 않게
  const rapidShort = needToLose > 0 && daysToWeighIn <= 7 && needToLose / weight > 0.01
  const rapidCut = rapidShort || (needToLose > 0 && waterCut && waterPct >= 2)
  // 재수화 회복 예시 — 수분 감량분을 넘지 않게 (시작 체중보다 무거워지는 표시 방지)
  const rehydrateKg = !waterCut ? 0 : Math.min(sport.weighInHours > 12 ? 5 : sport.weighInHours > 4 ? 2.5 : 1, waterPhaseLoss)

  // 일정표 생성
  const schedule = useMemo(() => {
    if (needToLose <= 0 || daysToWeighIn < 2) return []
    type Row = { dLabel: string; weightTarget: number; phase: 'fat' | 'water' | 'rehy' | 'dday'; advice: string }
    const rows: Row[] = []
    // 마일스톤 시점들
    const checkpoints: number[] = []
    if (daysToWeighIn >= 30) checkpoints.push(daysToWeighIn, 25, 20, 14, 10, 7, 5, 3, 1, 0, -1)
    else if (daysToWeighIn >= 14) checkpoints.push(daysToWeighIn, Math.floor(daysToWeighIn * 0.7), 7, 5, 3, 1, 0, -1)
    else if (daysToWeighIn >= 7) checkpoints.push(daysToWeighIn, waterStart, 5, 3, 1, 0, -1)
    else checkpoints.push(daysToWeighIn, waterStart, 1, 0, -1)
    checkpoints.sort((a, b) => b - a)

    const advicesFat: Record<string, string> = {
      start: '식단·계체 식단 시작',
      mid:   '유산소 5일/주 + 칼로리 -500/일',
      late:  '근력 운동 유지 + 단백질 섭취',
    }
    const advicesWater: Record<string, string> = {
      D7: '나트륨 제한 시작',
      D5: '나트륨·탄수화물 점진 감소',
      D3: '수분 점진 감소 — 소변 색·어지럼 확인',
      D1: '수분 조절 마무리 — 감독자 없이 사우나·땀복 금지',
    }

    const seen = new Set<number>()
    for (const d of checkpoints) {
      if (seen.has(d)) continue
      if (d > daysToWeighIn) continue
      seen.add(d)
      let target = weight
      let phase: Row['phase'] = 'fat'
      let advice = ''

      if (d > waterStart) {
        // 체지방 단계 — 첫 행(d === N)은 항상 현재 체중
        const elapsed = (daysToWeighIn - d) / (daysToWeighIn - waterStart)
        target = weight - fatPhaseLoss * elapsed
        phase = 'fat'
        advice = !waterCut && d <= 7
          ? '체지방 위주 점진 감량 — ONE은 수분 감량·사우나 금지'
          : elapsed < 0.3 ? advicesFat.start : elapsed < 0.7 ? advicesFat.mid : advicesFat.late
      } else if (d > 0) {
        // 수분 단계 — D-waterStart에 체지방 목표 도달, D-1에 최종 목표 도달
        const fatEnd = weight - fatPhaseLoss
        const waterElapsed = waterStart > 1 ? (waterStart - d) / (waterStart - 1) : 1
        target = d === 1 ? weight - needToLose : fatEnd - waterPhaseLoss * waterElapsed
        phase = waterCut ? 'water' : 'fat'
        if (!waterCut) advice = '체지방 위주 점진 감량 — ONE은 수분 감량·사우나 금지'
        else if (d >= 7) advice = advicesWater.D7
        else if (d >= 5) advice = advicesWater.D5
        else if (d >= 3) advice = advicesWater.D3
        else advice = advicesWater.D1
      } else if (d === 0) {
        target = targetClass ? targetClass.limit : weight - needToLose
        phase = 'dday'
        advice = '계체 통과 🎯'
      } else {
        // d === -1: 재수화
        target = (targetClass ? targetClass.limit : weight - needToLose) + rehydrateKg
        phase = 'rehy'
        advice = sport.id === 'one'
          ? '재수화 제한 — 자연 회복'
          : `경구 재수화 — 물·전해질 조금씩 (${rehydrateKg.toFixed(1)}kg 회복 예시)`
      }

      const dLabel = d === 0 ? 'D-Day' : d > 0 ? `D-${d}` : `D+${Math.abs(d)}`
      rows.push({ dLabel, weightTarget: Math.max(0, target), phase, advice })
    }
    return rows
  }, [needToLose, daysToWeighIn, weight, fatPhaseLoss, waterPhaseLoss, waterStart, rehydrateKg, targetClass, sport.id, waterCut])

  // 체급 변경 권장 여부
  const recommendNextClass = useMemo(() => {
    if (!targetClass || targetClass.limit === Infinity) return null
    if (risk.level === 'severe' || (needToLose / weight) > 0.07) {
      // 한 단계 위 체급
      const idx = sport.classes.indexOf(targetClass)
      const next = sport.classes
        .slice(idx + 1)
        .find(c => fitsGender(c, gender))
      return next ?? null
    }
    return null
  }, [targetClass, risk.level, needToLose, weight, sport.classes, gender])

  /* 결과 복사 */
  function handleCopy() {
    const txt = [
      `── 격투기 감량 계획 (${sport.label}) ──`,
      targetClass
        ? `체중 ${weight}kg → 목표 ${targetClass.name} (${targetClass.limit === Infinity ? '무제한' : `${targetClass.limit}kg`})`
        : `체중 ${weight}kg → 목표 체급 없음`,
      planReady
        ? `감량 필요: ${needToLose.toFixed(2)}kg / 계체까지 D-${daysToWeighIn}`
        : `감량 필요: ${needToLose.toFixed(2)}kg / 계체 예정일 확인 필요`,
      ...(planReady ? [
        `일평균 감량: ${dailyLossKg.toFixed(2)}kg/일 / 주간 ${weeklyLossKg.toFixed(2)}kg/주`,
        `위험도: ${risk.label}`,
      ] : []),
      'youtil.kr/tools/sports/fight-weight',
    ].join('\n')
    navigator.clipboard?.writeText(txt).then(() => {
      setCopied(true); window.setTimeout(() => setCopied(false), 1500)
    })
  }

  /* 체급 표 — 현재 선택된 종목만 (영문 컬럼 제외, 모바일 2줄 줄바꿈 방지) */
  function renderClassTable(s: Sport) {
    // 남녀 체급이 다른 종목이 있어 현재 성별 체급만 표시 (행 클릭 → 같은 성별 목록에서 목표 지정)
    const rows = s.classes.filter(c => fitsGender(c, gender))
    return (
      <div className={styles.card} key={s.id}>
        <div className={styles.cardLabel}>
          <span>{s.label} {gender === 'female' ? '여자' : '남자'} 체급표</span>
          <span className={styles.cardLabelHint}>{rows.length}체급 · 행 클릭 시 감량 계획으로 이동</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 12 }}>{s.policy} · 성별은 체급 검색 탭에서 바꿀 수 있습니다.</p>
        <div className="tableScroll">
          <table className={styles.classTable}>
            <thead>
              <tr><th scope="col">체급</th><th scope="col">kg</th><th scope="col">lbs</th></tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr
                  key={i}
                  className={styles.clickableRow}
                  onClick={() => {
                    setSportId(s.id)
                    setTargetClassName(c.name)
                    setTab('plan')
                    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSportId(s.id)
                      setTargetClassName(c.name)
                      setTab('plan')
                      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
                  role="button" aria-label={`${c.name} 체급으로 계획 세우기`} tabIndex={0}
                >
                  <td>{c.name}</td>
                  <td>{c.limit === Infinity ? '무제한' : c.limit.toFixed(2)}</td>
                  <td>{c.limit === Infinity ? '—' : toLbs(c.limit).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>

      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/sports/race-predictor', label: '마라톤 예측' },
          { href: '/tools/sports/pace', label: '러닝 페이스' },
          { href: '/tools/sports/one-rm', label: '1RM 계산기' }
        ]}
      >
        본 계산기는 <strong>참고용 추정</strong>이며 의학적 조언이 아닙니다. 급격한 체중 감량(특히 마지막 수분 감량)은 탈수·신장 손상·심정지로 이어질 수 있어,
        반드시 <strong>전문 코치·영양사·스포츠의학 전문의 감독</strong> 하에 진행하고 청소년·아마추어는 무리한 감량을 피하세요.
        계체 후 <strong>정맥(IV) 수액 재수화는 USADA·WADA 도핑 규정상 금지</strong>(의료 목적 예외)이므로 경구(물·전해질) 재수화를 권장합니다.
      </Disclaimer>

      {/* 종목 선택 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>종목 선택</span>
          <span className={styles.cardLabelHint}>좌우로 스크롤</span>
        </div>
        <div className={styles.sportScroller}>
          {SPORTS.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.sportBtn} ${styles[s.cls]} ${sportId === s.id ? styles.sportActive : ''}`}
              onClick={() => selectSport(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 */}
      <div className={styles.tabs} role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'search'} className={`${styles.tabBtn} ${tab === 'search' ? styles.tabActive : ''}`} onClick={() => setTab('search')}>체급 검색</button>
        <button type="button" role="tab" aria-selected={tab === 'plan'} className={`${styles.tabBtn} ${tab === 'plan' ? styles.tabActive : ''}`}   onClick={() => setTab('plan')}>감량 계획</button>
        <button type="button" role="tab" aria-selected={tab === 'tables'} className={`${styles.tabBtn} ${tab === 'tables' ? styles.tabActive : ''}`} onClick={() => setTab('tables')}>체급표</button>
      </div>

      {/* ─────────────────── 탭 1: 체급 검색 ─────────────────── */}
      {tab === 'search' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>기본 정보</span>
              <span className={styles.cardLabelHint}>{sport.label}</span>
            </div>

            {/* 체중·키·성별 한 줄 (모바일도 3열) */}
            <div className={styles.inputGrid3}>
              <div className={styles.inputCell}>
                <label htmlFor="fw-weight" className={styles.inputLabel} style={{ display: 'block' }}>체중</label>
                <div className={styles.inputRow}>
                  <input id="fw-weight" className={styles.bigInput} type="number" inputMode="decimal" min={0} step="0.1" aria-label="현재 체중 (kg)" value={weightStr} onChange={e => setWeightStr(e.target.value)} />
                  <span className={styles.unit}>kg</span>
                </div>
              </div>
              <div className={styles.inputCell}>
                <label htmlFor="fw-height" className={styles.inputLabel} style={{ display: 'block' }}>키</label>
                <div className={styles.inputRow}>
                  <input id="fw-height" className={styles.bigInput} type="number" inputMode="decimal" min={0} step="1" aria-label="키 (cm)" value={heightStr} onChange={e => setHeightStr(e.target.value)} />
                  <span className={styles.unit}>cm</span>
                </div>
              </div>
              <div className={styles.inputCell}>
                <p className={styles.inputLabel}>성별</p>
                <div className={styles.genderRow}>
                  <button type="button" aria-pressed={gender === 'male'} className={`${styles.genderBtn} ${gender === 'male' ? styles.genderActive : ''}`}   onClick={() => selectGender('male')} aria-label="남성">♂</button>
                  <button type="button" aria-pressed={gender === 'female'} className={`${styles.genderBtn} ${gender === 'female' ? styles.genderActive : ''}`} onClick={() => selectGender('female')} aria-label="여성">♀</button>
                </div>
              </div>
            </div>
          </div>

          {/* 적정 체급 추천 */}
          {recommended.length > 0 && (
            <div className={styles.recommendCard}>
              <p className={styles.recommendLead}>적정 체급 추천</p>
              <p className={styles.recommendBody}>
                {height > 0 && <>키 <strong>{height}cm</strong> · </>}체중 <strong>{weight}kg</strong> {gender === 'male' ? '남성' : '여성'} → {sport.label}{' '}
                <strong>{recommended.map(c => `${c.name} (${c.limit}kg 이하)`).join(', ')}</strong> 후보 적정.
              </p>
            </div>
          )}

          {/* 현재 체급 */}
          <div role="status">
            {currentClass && (
              <div className={styles.hero}>
                <p className={styles.heroLead}>현재 체급 · {sport.label}{gender === 'female' ? ' (여)' : ''}</p>
                <p className={styles.heroClassName}>{currentClass.name}</p>
                <p className={styles.heroSub}>
                  체중 {weight}kg · {currentClass.limit === Infinity ? '무제한급' : `한도 ${currentClass.limit}kg 이하`}
                  {currentClass.limit !== Infinity && weight <= currentClass.limit && ` · 한도까지 ${(currentClass.limit - weight).toFixed(1)}kg`}
                  {currentClass.limit !== Infinity && weight > currentClass.limit && ` · ${(weight - currentClass.limit).toFixed(1)}kg 초과`}
                </p>
              </div>
            )}
          </div>

          {/* 체급 사다리 */}
          {ladder.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>
                <span>체급 사다리</span>
                <span className={styles.cardLabelHint}>내 위치 · {weight}kg</span>
              </div>
              <div className={styles.ladder}>
                {ladder.map((c, i) => {
                  const isCurrent = c === currentClass
                  const over = c.limit !== Infinity && weight > c.limit
                  return (
                    <div key={i} className={`${styles.ladderRow} ${isCurrent ? styles.ladderCurrent : ''}`}>
                      <span className={styles.ladderName}>{c.name}</span>
                      <span className={styles.ladderLimit}>{c.limit === Infinity ? '무제한' : `${c.limit.toFixed(2)} kg`}</span>
                      <span className={`${styles.ladderTag} ${isCurrent ? styles.ladderTagCurrent : over ? styles.ladderTagOver : styles.ladderTagOk}`}>
                        {isCurrent ? '현재' : c.limit === Infinity ? '충족' : over ? `${(weight - c.limit).toFixed(1)}kg 초과` : '충족'}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>
                전체 체급은 <strong style={{ color: 'var(--text)' }}>체급표</strong> 탭에서, 목표 체급까지의 감량 계획은 <strong style={{ color: 'var(--text)' }}>감량 계획</strong> 탭에서 확인하세요.
              </p>
            </div>
          )}
        </>
      )}

      {/* ─────────────────── 탭 2: 감량 계획 ─────────────────── */}
      {tab === 'plan' && (
        <>
          {/* 감량 목표 설정 — 목표 체급 + 계체 예정일 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>감량 목표 설정</span>
              <span className={styles.cardLabelHint}>현재 {weight}kg · {sport.label}</span>
            </div>
            <label htmlFor="fw-target" className={styles.inputLabel} style={{ display: 'block', marginBottom: 6 }}>목표 체급</label>
            <select id="fw-target" className={styles.classSelect} value={targetClassName} onChange={e => setTargetClassName(e.target.value)}>
              <option value="">— 자동 추천 —</option>
              {availableClasses.map((c, i) => (
                <option key={i} value={c.name}>
                  {c.name} ({c.limit === Infinity ? '무제한' : `${c.limit}kg 이하`})
                </option>
              ))}
            </select>
            <div style={{ height: 12 }} />
            <label htmlFor="fw-date" className={styles.inputLabel} style={{ display: 'block', marginBottom: 6 }}>계체 예정일{planReady ? ` (D-${daysToWeighIn})` : ''}</label>
            <input id="fw-date" className={styles.dateInput} type="date" min={minDate} value={weighInDate} onChange={e => setWeighInDate(e.target.value)} />
          </div>

          {!validDate && (
            <div className={styles.healthWarn} style={{ background: 'rgba(234,88,12,0.08)', borderColor: 'rgba(234,88,12,0.45)', color: 'var(--text)' }}>
              <span className={styles.warnIcon}>📅</span>
              <div><p><strong>계체 예정일을 선택하세요.</strong> 날짜를 입력해야 D-day·감량 일정·위험도가 계산됩니다.</p></div>
            </div>
          )}

          {pastDate && (
            <div className={styles.healthWarn} style={{ background: 'rgba(234,88,12,0.08)', borderColor: 'rgba(234,88,12,0.45)', color: 'var(--text)' }}>
              <span className={styles.warnIcon}>📅</span>
              <div>
                <p><strong>계체 예정일이 오늘이거나 이미 지났습니다.</strong> 내일 이후 날짜를 선택해야 감량 일정과 위험도를 계산할 수 있습니다.</p>
                <p style={{ marginTop: 6 }}>계체 당일 남은 체중을 사우나·수분 제한으로 한꺼번에 빼는 것은 가장 위험한 방식입니다. 한도를 넘는다면 체급 조정을 먼저 상의하세요.</p>
              </div>
            </div>
          )}

          {planReady && (<>
          {/* 히어로 — 감량 필요량 */}
          {targetClass && (
            <div className={styles.hero} role="status">
              <p className={styles.heroLead}>{targetClass.name} 진입까지 감량</p>
              {needToLose > 0 ? (
                <p className={`${styles.heroNum} ${styles.heroNumLoss}`}>
                  {needToLose.toFixed(2)}<span className={styles.heroUnit}>kg</span>
                </p>
              ) : (
                <p className={styles.heroNum}>
                  ✓<span className={styles.heroUnit}>이미 통과</span>
                </p>
              )}
              <p className={styles.heroSub}>
                현재 {weight}kg → 목표 {targetClass.limit === Infinity ? '무제한' : `${targetClass.limit}kg 이하`} · 계체까지 D-{daysToWeighIn}
              </p>
            </div>
          )}

          {/* KPI — 일평균/주간/비율 */}
          {needToLose > 0 && (
            <div className={styles.kpiGrid}>
              <div className={styles.kpiCard}>
                <div className={styles.kpiLabel}>일평균 감량</div>
                <div className={styles.kpiValue}>{dailyLossKg.toFixed(2)}<span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>kg/일</span></div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiLabel}>주간 감량</div>
                <div className={`${styles.kpiValue} ${risk.level === 'safe' ? styles.kpiValuePos : risk.level === 'caution' ? styles.kpiValueWarn : styles.kpiValueDanger}`}>
                  {weeklyLossKg.toFixed(2)}<span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>kg/주</span>
                </div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiLabel}>체중 비율 / 주</div>
                <div className={styles.kpiValue}>{weight > 0 ? ((weeklyLossKg / weight) * 100).toFixed(1) : '0.0'}<span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>%</span></div>
              </div>
            </div>
          )}

          {/* 위험도 카드 */}
          <div className={styles.card} style={{ textAlign: 'center' }}>
            <span className={`${styles.riskBadge} ${risk.cls}`}>{risk.label}</span>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 6 }}>
              {needToLose <= 0
                ? (targetClass ? `이미 ${targetClass.name} 한도 이하입니다. 계체일까지 컨디션 유지에 집중하세요.` : '목표 체급을 선택하세요.')
                : <>주당 <strong style={{ color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{weeklyLossKg.toFixed(2)}kg</strong> 감량은 체중의 <strong style={{ color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{((weeklyLossKg / weight) * 100).toFixed(1)}%</strong> 입니다. 의학 가이드라인은 체중의 1%/주 이내를 권장합니다.</>}
            </p>
          </div>

          {/* 단계 요약 */}
          {needToLose > 0 && (
            <div className={styles.kpiGrid}>
              <div className={styles.kpiCard}>
                <span className={`${styles.phaseChip} ${styles.chipFat}`}>체지방</span>
                <div className={styles.kpiValue} style={{ marginTop: 6 }}>{fatPhaseLoss.toFixed(2)}<span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>kg</span></div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>D-{daysToWeighIn} ~ D-{waterStart}</div>
              </div>
              <div className={styles.kpiCard}>
                <span className={`${styles.phaseChip} ${styles.chipWater}`}>수분</span>
                <div className={styles.kpiValue} style={{ marginTop: 6 }}>{waterCut ? <>{waterPhaseLoss.toFixed(2)}<span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>kg</span></> : '금지'}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{waterCut ? (waterStart > 1 ? `D-${waterStart} ~ D-1` : 'D-1') : 'ONE은 수분 감량 금지'}</div>
              </div>
              <div className={styles.kpiCard}>
                <span className={`${styles.phaseChip} ${styles.chipRehy}`}>재수화</span>
                <div className={styles.kpiValue} style={{ marginTop: 6 }}>
                  {sport.id === 'one' ? '제한' : <>{rehydrateKg.toFixed(1)}<span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>kg</span></>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>계체 후 ~ 시합 · 수분 감량분 이내</div>
              </div>
            </div>
          )}

          {/* 일정표 */}
          {schedule.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>
                <span>감량 일정표 (자동 생성)</span>
                <span className={styles.cardLabelHint}>D-{daysToWeighIn} → 시합</span>
              </div>
              <div className="tableScroll">
                <table className={styles.scheduleTable}>
                  <thead>
                    <tr><th scope="col">D-day</th><th scope="col">목표 체중</th><th scope="col">단계</th><th scope="col">권장 활동</th></tr>
                  </thead>
                  <tbody>
                    {schedule.map((r, i) => (
                      <tr key={i} className={
                        r.phase === 'dday'  ? styles.dDay  :
                        r.phase === 'fat'   ? styles.phaseFat :
                        r.phase === 'water' ? styles.phaseWater :
                        styles.phaseRehy
                      }>
                        <td>{r.dLabel}</td>
                        <td>{r.weightTarget.toFixed(1)} kg</td>
                        <td>
                          <span className={`${styles.phaseChip} ${
                            r.phase === 'fat'   ? styles.chipFat :
                            r.phase === 'water' ? styles.chipWater :
                            r.phase === 'dday'  ? styles.chipDday :
                            styles.chipRehy
                          }`}>
                            {r.phase === 'fat' ? '체지방' : r.phase === 'water' ? '수분' : r.phase === 'dday' ? '계체' : '재수화'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--muted)' }}>{r.advice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {waterCut && (
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
                  수분 단계는 선수들이 실제로 쓰는 관행을 보여 주는 예시일 뿐, 따라 하라는 권장 방법이 아닙니다.
                  청소년·아마추어는 수분 감량 없이 체지방 감량만으로 계체를 통과할 수 있는 체급을 고르세요.
                </p>
              )}
            </div>
          )}

          {/* 탈수·급속 감량 경고 — 7일 이내에 체중의 1% 넘게 빼거나 수분 감량분이 체중의 2% 이상 */}
          {rapidCut && (
            <div className={styles.healthWarn}>
              <span className={styles.warnIcon}>🚨</span>
              <div>
                <p><strong>
                  {rapidShort
                    ? `계체까지 ${daysToWeighIn}일 남은 상태에서 ${needToLose.toFixed(1)}kg을 빼면 대부분 체지방이 아니라 수분이 빠집니다.`
                    : `수분으로 빼야 하는 양(${waterPhaseLoss.toFixed(1)}kg)이 체중의 ${waterPct.toFixed(1)}%입니다.`}
                </strong></p>
                <p style={{ marginTop: 6 }}>
                  체중의 2% 정도만 탈수돼도 지구력·근력·판단력이 떨어지고, 그 이상 진행되면 열사병·급성 신장 손상·부정맥 위험이 커집니다.
                  보고된 감량 사망 사례들에서는 사우나·땀복·이뇨제 등을 이용한 급격한 탈수가 주요 원인으로 지적됐습니다.
                </p>
                <ul>
                  <li>이뇨제·설사약·구토 유도·침 뱉기로 체중을 빼지 마세요 (이뇨제는 도핑 금지 약물이기도 합니다).</li>
                  <li>감독자 없이 사우나·땀복·뜨거운 욕조를 쓰지 마세요. 혼자 있다가 쓰러지면 대처할 사람이 없습니다.</li>
                  <li>어지럼·두통·혼미, 소변이 거의 안 나오거나 매우 진한 색, 근육 경련, 가슴 두근거림이 나타나면 즉시 멈추고 물과 전해질을 섭취하세요. 의식이 흐리거나 쓰러지면 바로 119에 연락하세요.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 건강 경고 */}
          {(risk.level === 'danger' || risk.level === 'severe') && (
            <div className={styles.healthWarn}>
              <span className={styles.warnIcon}>⚠️</span>
              <div>
                <p><strong>주당 {weeklyLossKg.toFixed(2)}kg 감량은 의학적 권장(1%/주)을 초과합니다.</strong></p>
                <ul>
                  <li>근손실, 면역 저하, 신장 손상 위험</li>
                  <li>시합 당일 퍼포먼스 급락 가능</li>
                  <li>무리한 수분 감량은 사망 사례 보고 (Yang Jian Bing 2015, Leandro Souza 2013, Jessica Lindsay 2017 등)</li>
                </ul>
                <p style={{ marginTop: 8 }}>전문 트레이너·영양사 감독 하에 진행하세요.</p>
              </div>
            </div>
          )}

          {/* 체급 변경 권장 */}
          {recommendNextClass && (
            <div className={styles.healthWarn} style={{ background: 'rgba(234,88,12,0.08)', borderColor: 'rgba(234,88,12,0.45)', color: 'var(--text)' }}>
              <span className={styles.warnIcon}>🔶</span>
              <div>
                <p><strong style={{ color: 'var(--warning)' }}>{daysToWeighIn}일 이내 {needToLose.toFixed(2)}kg 감량은 권장되지 않습니다.</strong></p>
                <p style={{ marginTop: 6 }}>
                  한 단계 위 체급 — <strong style={{ color: 'var(--text)' }}>{recommendNextClass.name} ({recommendNextClass.limit === Infinity ? '무제한' : `${recommendNextClass.limit}kg 이하`})</strong> 또는 계체일을 늦추는 것을 고려해보세요.
                </p>
              </div>
            </div>
          )}
          </>)}

          {/* 종목별 감량 정책 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>종목별 감량·계체 정책</span>
              <span className={styles.cardLabelHint}>현재 선택: {sport.label}</span>
            </div>
            <div className={styles.policyGrid}>
              <div className={styles.policyCard}>
                <p className={styles.policyTitle}>UFC (MMA)</p>
                <p className={styles.policyBody}>계체 후 <strong>약 30~36시간</strong> 재수화 자유 → 8~12kg 차이 흔함</p>
              </div>
              <div className={styles.policyCard}>
                <p className={styles.policyTitle}>ONE Championship</p>
                <p className={styles.policyBody}>2015년부터 <strong>수분 감량 금지</strong> · 매일 소변 비중 측정 · 차이 적음</p>
              </div>
              <div className={styles.policyCard}>
                <p className={styles.policyTitle}>복싱</p>
                <p className={styles.policyBody}>시합 24~36시간 전 계체 · 재수화 자유 · 단체별 차이</p>
              </div>
              <div className={styles.policyCard}>
                <p className={styles.policyTitle}>유도·레슬링</p>
                <p className={styles.policyBody}>시합 당일 새벽 계체 · 재수화 시간 짧음 (수 시간 이내)</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─────────────────── 탭 3: 체급표 (선택 종목만) ─────────────────── */}
      {tab === 'tables' && renderClassTable(sport)}

      {/* 결과 복사 */}
      <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
        {copied ? '✓ 복사 완료' : '결과 텍스트 복사'}
      </button>
    </div>
  )
}
