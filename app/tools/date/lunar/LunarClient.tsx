'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import s from './lunar.module.css'

/**
 * LUNAR_INFO (1900–2049) — 한국천문연구원(KASI) 음력 기준.
 * korean-lunar-calendar(KASI 데이터, MIT) 패키지에서 생성·전수 등가 검증(양력 54,757일 + 음력 54,779조합 불일치 0).
 * ⚠️ 흔히 유통되는 중국력 계열 테이블과 61개 연도에서 다르다 (예: 한국 설날 2027=2/7, 중국 춘절=2/6).
 * 상한 2049: KASI 공식 음양력 데이터가 2050년 중반까지만 확정이라 완전한 마지막 연도로 제한.
 * 각 연도 20비트:
 *   bit 0–3  : 윤달 번호 (0 = 윤달 없음)
 *   bit 4–15 : 1월~12월 (1=30일/大, 0=29일/小)  (MSB = 1월)
 *   bit 16   : 윤달 大小 (1=30일, 0=29일)
 */
const LUNAR_INFO: number[] = [
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2, // 1900-1909
  0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x0da95,0x0b550,0x056a0,0x0ada2,0x095d0,0x04bb7, // 1910-1919
  0x049b0,0x0a4b0,0x0b4b5,0x06a90,0x0ad40,0x0bb54,0x02b60,0x095b0,0x05372,0x04970, // 1920-1929
  0x06566,0x0e4a0,0x0ea50,0x16a95,0x05b50,0x02b60,0x18ae3,0x092e0,0x1c8d7,0x0c950, // 1930-1939
  0x0d4a0,0x1d8a6,0x0b690,0x056d0,0x125b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0d557, // 1940-1949
  0x0b4a0,0x0b550,0x15555,0x04db0,0x025b0,0x18573,0x052b0,0x0a9b8,0x06950,0x06aa0, // 1950-1959
  0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05270,0x07263,0x0d950,0x06b57,0x056a0, // 1960-1969
  0x09ad0,0x04dd5,0x04ae0,0x0a4e0,0x0d4d4,0x0d250,0x0d598,0x0b540,0x0d6a0,0x195a6, // 1970-1979
  0x095b0,0x049b0,0x0a9b4,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0b756,0x02b60,0x095b0, // 1980-1989
  0x04b75,0x04970,0x064b0,0x074a3,0x0ea50,0x06d98,0x05ad0,0x02b60,0x096e5,0x092e0, // 1990-1999
  0x0c960,0x0e954,0x0d4a0,0x0da50,0x07552,0x056c0,0x0abb7,0x025d0,0x092d0,0x0cab5, // 2000-2009
  0x0a950,0x0b4a0,0x1b4a3,0x0b550,0x055d9,0x04ba0,0x0a5b0,0x05575,0x052b0,0x0a950, // 2010-2019
  0x0b954,0x06aa0,0x0ad50,0x06b52,0x04b60,0x0a6e6,0x0a570,0x05270,0x06a65,0x0d930, // 2020-2029
  0x05aa0,0x0b6a3,0x096d0,0x04afb,0x04ae0,0x0a4d0,0x1d0d6,0x0d250,0x0d520,0x0dd45, // 2030-2039
  0x0b6a0,0x096d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0b250,0x1b255,0x06d40,0x0ada0, // 2040-2049
]

const LUNAR_BASE_YEAR = 1900
const LUNAR_LAST_YEAR = 2049
// 1900-01-31 (양력) = 1900 음력 1/1. 로컬 타임존/DST 영향을 배제하기 위해 UTC 기준으로 고정.
const LUNAR_BASE_UTC = Date.UTC(1900, 0, 31)
const DAY_MS = 86400000

const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const STEMS_HAN = ['갑','을','병','정','무','기','경','신','임','계']
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
const BRANCHES_HAN = ['자','축','인','묘','진','사','오','미','신','유','술','해']
const ZODIAC = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지']
const ZODIAC_EMOJI = ['🐭','🐮','🐯','🐰','🐲','🐍','🐴','🐑','🐵','🐔','🐶','🐷']
const WEEKDAYS = ['일','월','화','수','목','금','토']

/** 해당 음력년의 전체 일수 */
function lunarYearDays(y: number): number {
  let sum = 348 // 12 * 29
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (LUNAR_INFO[y - LUNAR_BASE_YEAR] & i) ? 1 : 0
  }
  return sum + leapDays(y)
}

/** 해당 음력년의 윤달 일수 (0 = 윤달 없음) */
function leapDays(y: number): number {
  if (leapMonth(y)) {
    return (LUNAR_INFO[y - LUNAR_BASE_YEAR] & 0x10000) ? 30 : 29
  }
  return 0
}

/** 해당 음력년의 윤달 번호 (0 = 없음) */
function leapMonth(y: number): number {
  return LUNAR_INFO[y - LUNAR_BASE_YEAR] & 0xf
}

/** 해당 음력년/월 의 일수 (평달) */
function monthDays(y: number, m: number): number {
  return (LUNAR_INFO[y - LUNAR_BASE_YEAR] & (0x10000 >> m)) ? 30 : 29
}

/** 양력 → 음력 변환 */
function solarToLunar(y: number, m: number, d: number): { y: number; m: number; d: number; isLeap: boolean } | null {
  if (y < LUNAR_BASE_YEAR || y > LUNAR_LAST_YEAR) return null
  const targetUTC = Date.UTC(y, m - 1, d)
  let offset = Math.round((targetUTC - LUNAR_BASE_UTC) / DAY_MS)
  if (offset < 0) return null

  let lY = LUNAR_BASE_YEAR
  let temp = 0
  for (; lY < LUNAR_LAST_YEAR + 1 && offset > 0; lY++) {
    temp = lunarYearDays(lY)
    if (offset < temp) break
    offset -= temp
  }

  const leap = leapMonth(lY)
  let isLeap = false
  let lM = 1
  for (; lM < 13 && offset > 0; lM++) {
    if (leap > 0 && lM === leap + 1 && !isLeap) {
      --lM
      isLeap = true
      temp = leapDays(lY)
    } else {
      temp = monthDays(lY, lM)
    }
    if (isLeap && lM === leap + 1) isLeap = false
    if (offset < temp) break
    offset -= temp
  }
  if (offset === 0 && leap > 0 && lM === leap + 1) {
    if (isLeap) {
      isLeap = false
    } else {
      isLeap = true
      --lM
    }
  }
  const lD = offset + 1
  return { y: lY, m: lM, d: lD, isLeap }
}

/** 음력 → 양력 변환 (UTC 기준 {y,m,d} 반환) */
function lunarToSolar(y: number, m: number, d: number, isLeap: boolean): { y: number; m: number; d: number } | null {
  if (y < LUNAR_BASE_YEAR || y > LUNAR_LAST_YEAR) return null
  if (m < 1 || m > 12) return null
  const leap = leapMonth(y)
  if (isLeap && leap !== m) return null

  let offset = 0
  for (let i = LUNAR_BASE_YEAR; i < y; i++) offset += lunarYearDays(i)

  for (let i = 1; i < m; i++) {
    offset += monthDays(y, i)
    if (leap === i) offset += leapDays(y)
  }
  if (isLeap) offset += monthDays(y, m)
  offset += d - 1

  const ms = LUNAR_BASE_UTC + offset * DAY_MS
  const date = new Date(ms)
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() }
}

/** 년 간지 */
function yearGanji(y: number): { hanja: string; hangul: string } {
  const si = (y - 4 + 10 * 100) % 10
  const bi = (y - 4 + 12 * 100) % 12
  return {
    hanja: STEMS[si] + BRANCHES[bi],
    hangul: STEMS_HAN[si] + BRANCHES_HAN[bi],
  }
}

/** 띠 */
function yearZodiac(y: number): { name: string; emoji: string } {
  const i = (y - 4 + 12 * 100) % 12
  return { name: ZODIAC[i], emoji: ZODIAC_EMOJI[i] }
}

// SSR/CSR 일치를 위해 빌드 시점 연도 고정값 사용 (연도가 바뀌어도 범위 내 기본값이면 충분)
const YEAR_DEFAULT = 2026
const YEARS = Array.from({ length: LUNAR_LAST_YEAR - LUNAR_BASE_YEAR + 1 }, (_, i) => LUNAR_BASE_YEAR + i) // 1900-2049
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

export default function LunarClient() {
  const [dir, setDir] = useState<'s2l' | 'l2s'>('s2l')
  const [year, setYear] = useState(YEAR_DEFAULT)
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const [isLeap, setIsLeap] = useState(false)

  // 마운트 후 실제 현재 연도로 (빌드 연도와 다를 때만 의미) — hydration mismatch 방지 패턴
  useEffect(() => {
    const now = new Date().getFullYear()
    if (now >= LUNAR_BASE_YEAR && now <= LUNAR_LAST_YEAR) setYear(now)
  }, [])

  const daysInMonth = useMemo(() => {
    if (dir === 's2l') {
      return new Date(year, month, 0).getDate()
    }
    if (isLeap) return leapDays(year)
    return monthDays(year, month)
  }, [dir, year, month, isLeap])

  const leapForYear = useMemo(() => (dir === 'l2s' ? leapMonth(year) : 0), [dir, year])
  const canLeap = dir === 'l2s' && leapForYear !== 0 && leapForYear === month

  // 양력 1900년 1월은 31일(음력 1900/1/1)부터만 데이터 존재 — 1~30일은 선택지에서 제외
  const minDay = dir === 's2l' && year === 1900 && month === 1 ? 31 : 1
  // day 가 현재 월 범위를 벗어나면 보정
  const safeDay = Math.min(Math.max(day, minDay), daysInMonth)

  const result = useMemo(() => {
    try {
      if (dir === 's2l') {
        const r = solarToLunar(year, month, safeDay)
        if (!r) return { error: '1900년 1월 31일(음력 1900년 1월 1일)부터 2049년 12월 31일까지 지원합니다.' }
        const gz = yearGanji(r.y)
        const zd = yearZodiac(r.y)
        const wd = WEEKDAYS[new Date(year, month - 1, safeDay).getDay()]
        return {
          text: `음력 ${r.y}년 ${r.isLeap ? '윤' : ''}${r.m}월 ${r.d}일 (${wd})`,
          sub: `${r.y} / ${r.isLeap ? '윤' : ''}${r.m} / ${r.d}`,
          ganji: gz,
          zodiac: zd,
          year: r.y,
        }
      } else {
        const useLeap = canLeap && isLeap
        const r = lunarToSolar(year, month, safeDay, useLeap)
        if (!r) return { error: '유효하지 않은 음력 날짜입니다.' }
        const gz = yearGanji(year)
        const zd = yearZodiac(year)
        const yyyy = r.y
        const mm = String(r.m).padStart(2, '0')
        const dd = String(r.d).padStart(2, '0')
        const wd = WEEKDAYS[new Date(Date.UTC(r.y, r.m - 1, r.d)).getUTCDay()]
        return {
          text: `양력 ${yyyy}년 ${mm}월 ${dd}일 (${wd})`,
          sub: `${yyyy}-${mm}-${dd}`,
          ganji: gz,
          zodiac: zd,
          year,
        }
      }
    } catch {
      return { error: '변환 중 오류가 발생했습니다.' }
    }
  }, [dir, year, month, safeDay, canLeap, isLeap])

  return (
    <div className={s.wrap}>
      {/* 입력 카드 */}
      <div className={s.card}>
        <span className={s.cardLabel}>변환 방향</span>
        <div className={s.dirRow}>
          <button
            type="button" aria-pressed={dir === 's2l'}
            className={`${s.dirBtn} ${dir === 's2l' ? s.dirActive : ''}`}
            onClick={() => { setDir('s2l'); setIsLeap(false) }}
          >
            양력 → 음력
          </button>
          <button
            type="button" aria-pressed={dir === 'l2s'}
            className={`${s.dirBtn} ${dir === 'l2s' ? s.dirActive : ''}`}
            onClick={() => { setDir('l2s'); setIsLeap(false) }}
          >
            음력 → 양력
          </button>
        </div>

        <div className={s.selectRow}>
          <div className={s.selectWrap}>
            <select className={s.select} aria-label="연도" value={year}
              onChange={(e) => { setYear(Number(e.target.value)); setIsLeap(false) }}>
              {YEARS.map((y) => <option key={y} value={y}>{y}년</option>)}
            </select>
            <span className={s.selectArrow} aria-hidden="true">▼</span>
          </div>
          <div className={s.selectWrap}>
            <select className={s.select} aria-label="월" value={month} onChange={(e) => { setMonth(Number(e.target.value)); setIsLeap(false) }}>
              {MONTHS.map((m) => <option key={m} value={m}>{m}월</option>)}
            </select>
            <span className={s.selectArrow} aria-hidden="true">▼</span>
          </div>
          <div className={s.selectWrap}>
            <select className={s.select} aria-label="일" value={safeDay} onChange={(e) => setDay(Number(e.target.value))}>
              {Array.from({ length: daysInMonth - minDay + 1 }, (_, i) => minDay + i).map((d) => (
                <option key={d} value={d}>{d}일</option>
              ))}
            </select>
            <span className={s.selectArrow} aria-hidden="true">▼</span>
          </div>
        </div>

        {canLeap && (
          <div className={s.leapRow}>
            <input
              id="leap"
              type="checkbox"
              className={s.leapCheck}
              checked={isLeap}
              onChange={(e) => setIsLeap(e.target.checked)}
            />
            <label htmlFor="leap" className={s.leapLabel}>
              <strong>{year}년 윤{leapForYear}월</strong>로 계산
            </label>
          </div>
        )}
      </div>

      {/* 결과 */}
      {'error' in result ? (
        <div className={s.errorBox} role="alert">{result.error}</div>
      ) : (
        <div className={s.resultCard}>
          {/* role=status는 날짜·간지 블록만 — 링크 목록까지 낭독되지 않게 */}
          <div role="status">
            <p className={s.resultLead}>변환 결과</p>
            <div className={s.resultDate}>{result.text}</div>
            <p className={s.resultSub}>
              <span aria-hidden="true">{result.zodiac.emoji}</span> <strong>{result.zodiac.name}띠</strong> · {result.ganji.hanja}({result.ganji.hangul})년
            </p>
          </div>

          <div className={s.linkRow}>
            <Link href="/tools/life/zodiac" className={s.linkBtn}>
              <span className={s.linkEmoji}>🐲</span>
              <span>띠·별자리 계산기</span>
            </Link>
            <Link href="/tools/date/age" className={s.linkBtn}>
              <span className={s.linkEmoji}>🎂</span>
              <span>만 나이 계산기</span>
            </Link>
            <Link href="/tools/date/dday" className={s.linkBtn}>
              <span className={s.linkEmoji}>📅</span>
              <span>D-day 계산기</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
