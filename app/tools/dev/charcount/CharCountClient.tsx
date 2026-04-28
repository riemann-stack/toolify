'use client'

import { useMemo, useState } from 'react'
import s from '../dev.module.css'

// ─────────────────────────────────────────────
// 한글 분석
// ─────────────────────────────────────────────
const HANGUL_SYL_START = 0xAC00
const HANGUL_SYL_END   = 0xD7A3
const HANGUL_JAMO_RANGE = (cp: number) =>
  (cp >= 0x1100 && cp <= 0x11FF) ||  // 자모
  (cp >= 0x3130 && cp <= 0x318F) ||  // 호환 자모
  (cp >= 0xA960 && cp <= 0xA97F)     // 자모 확장-A

function isHangul(cp: number): boolean {
  return (cp >= HANGUL_SYL_START && cp <= HANGUL_SYL_END) || HANGUL_JAMO_RANGE(cp)
}
function isLatin(cp: number): boolean {
  return (cp >= 0x41 && cp <= 0x5A) || (cp >= 0x61 && cp <= 0x7A)
}
function isDigit(cp: number): boolean {
  return cp >= 0x30 && cp <= 0x39
}
function isSpace(ch: string): boolean {
  return /\s/.test(ch)
}

// 플랫폼 글자수 제한 (한국 + 글로벌)
type PlatformLimit = { name: string; limit: number; note?: string; method?: 'len' | 'twitterWeighted' | 'bytes' | 'lines' }
const PLATFORM_GROUPS: { group: string; items: PlatformLimit[] }[] = [
  {
    group: '🌐 글로벌 SNS',
    items: [
      { name: 'X (트위터) — 한글 가중치',  limit: 280,    method: 'twitterWeighted', note: '한글 1자 = 2 weight' },
      { name: '인스타그램 캡션',           limit: 2200,   method: 'len' },
      { name: '인스타그램 댓글',           limit: 2200,   method: 'len' },
      { name: '인스타그램 프로필 소개',    limit: 150,    method: 'len' },
      { name: '페이스북 게시물',           limit: 63206,  method: 'len' },
      { name: '페이스북 프로필 소개',      limit: 101,    method: 'len' },
      { name: '링크드인 게시물',           limit: 3000,   method: 'len' },
      { name: '링크드인 헤드라인',         limit: 220,    method: 'len' },
      { name: 'Threads 게시물',            limit: 500,    method: 'len' },
    ],
  },
  {
    group: '📺 동영상 플랫폼',
    items: [
      { name: '유튜브 제목',               limit: 100,    method: 'len',   note: '검색 최적화 70자 이내 권장' },
      { name: '유튜브 설명',               limit: 5000,   method: 'len',   note: '처음 150자가 검색 결과 표시' },
      { name: '유튜브 댓글',               limit: 10000,  method: 'len' },
      { name: '쇼츠/릴스 제목',            limit: 100,    method: 'len' },
      { name: 'TikTok 캡션',               limit: 4000,   method: 'len' },
    ],
  },
  {
    group: '🇰🇷 한국 메신저·SMS',
    items: [
      { name: '카카오톡 메시지',           limit: 10000,  method: 'len' },
      { name: '카카오톡 프로필 상태',      limit: 60,     method: 'len' },
      { name: 'SMS (단문)',                limit: 90,     method: 'bytes', note: '한글 45자 / 영문 90자 (EUC-KR 기준)' },
      { name: 'LMS (장문)',                limit: 2000,   method: 'bytes', note: '한글 약 1,000자' },
      { name: 'MMS (멀티미디어)',          limit: 2000,   method: 'bytes' },
    ],
  },
  {
    group: '📝 한국 블로그·커뮤니티',
    items: [
      { name: '네이버 블로그 제목',        limit: 100,    method: 'len' },
      { name: '네이버 블로그 본문',        limit: 1500000,method: 'len' },
      { name: '네이버 카페 제목',          limit: 60,     method: 'len' },
      { name: '티스토리 제목',             limit: 200,    method: 'len' },
      { name: '브런치 제목',               limit: 30,     method: 'len' },
      { name: '브런치 부제',               limit: 60,     method: 'len' },
    ],
  },
  {
    group: '💼 채용·자기소개서',
    items: [
      { name: '자기소개서 (단문)',         limit: 500,    method: 'len' },
      { name: '자기소개서 (일반)',         limit: 1000,   method: 'len' },
      { name: '자기소개서 (대기업)',       limit: 2000,   method: 'len' },
      { name: '자기소개서 (장문)',         limit: 4000,   method: 'len' },
      { name: '이력서 자기소개',           limit: 800,    method: 'len' },
    ],
  },
  {
    group: '🛒 쇼핑·앱스토어',
    items: [
      { name: 'Apple App Store 제목',      limit: 30,     method: 'len' },
      { name: 'Apple App Store 설명',      limit: 4000,   method: 'len' },
      { name: 'Google Play 제목',          limit: 30,     method: 'len' },
      { name: 'Google Play 짧은 설명',     limit: 80,     method: 'len' },
      { name: 'Google Play 자세한 설명',   limit: 4000,   method: 'len' },
      { name: '쿠팡 상품명',               limit: 60,     method: 'len' },
    ],
  },
  {
    group: '🔍 SEO·메타',
    items: [
      { name: 'HTML title (검색결과)',     limit: 60,     method: 'len',  note: '50~60자가 검색결과 표시 최적' },
      { name: 'meta description',          limit: 160,    method: 'len',  note: '120~160자 권장' },
      { name: '이메일 제목 (모바일)',      limit: 50,     method: 'len' },
      { name: '이메일 제목 (데스크탑)',    limit: 78,     method: 'len' },
    ],
  },
]

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
const fmt = (v: number) => v.toLocaleString('ko-KR')

function utf8Bytes(text: string): number {
  return new TextEncoder().encode(text).length
}
function utf16Bytes(text: string): number {
  return text.length * 2  // BMP 가정
}
function eucKrBytes(text: string): number {
  // 단순 추정: 한글 2바이트, ASCII 1바이트, 기타 2바이트
  let bytes = 0
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0
    if (cp < 128) bytes += 1
    else bytes += 2
  }
  return bytes
}

// 트위터 가중치: 영문/숫자/일부기호 = 1, 한글/한자/이모지 = 2
function twitterWeight(text: string): number {
  let w = 0
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0
    if (cp < 0x80) w += 1
    else if (cp >= 0x80 && cp <= 0xFF) w += 1 // Latin-1
    else if (cp >= 0x100 && cp <= 0x10FF) w += 1 // 일부 라틴 확장
    else w += 2
  }
  return w
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function CharCountClient() {
  const [tab, setTab] = useState<'count' | 'platforms' | 'tools'>('count')
  const [text, setText] = useState('')

  // tools tab
  const [findStr, setFindStr] = useState('')
  const [replaceStr, setReplaceStr] = useState('')
  const [findCaseSensitive, setFindCaseSensitive] = useState(false)

  // ─────────────────────────────────────────────
  // 통계 계산
  // ─────────────────────────────────────────────
  const stats = useMemo(() => {
    const len = text.length
    const lenNoSpace = text.replace(/\s/g, '').length
    const trimmed = text.trim()
    const words = trimmed === '' ? 0 : trimmed.split(/\s+/).length
    const lines = text === '' ? 0 : text.split('\n').length
    const paragraphs = text === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim() !== '').length
    const sentences = text === '' ? 0 : (text.match(/[.!?。？！]+(\s|$)/g) || []).length || (text.trim() ? 1 : 0)

    // 문자 종류별 카운트
    let hangulSyll = 0
    let hangulJamo = 0
    let latin = 0
    let digit = 0
    let space = 0
    let special = 0
    let cjk = 0
    let emoji = 0
    for (const ch of text) {
      const cp = ch.codePointAt(0) ?? 0
      if (cp >= HANGUL_SYL_START && cp <= HANGUL_SYL_END) hangulSyll++
      else if (HANGUL_JAMO_RANGE(cp)) hangulJamo++
      else if (isLatin(cp)) latin++
      else if (isDigit(cp)) digit++
      else if (isSpace(ch)) space++
      else if ((cp >= 0x4E00 && cp <= 0x9FFF) || (cp >= 0x3400 && cp <= 0x4DBF)) cjk++
      else if (cp >= 0x1F000) emoji++
      else special++
    }
    const hangul = hangulSyll + hangulJamo

    // 인코딩 바이트
    const utf8 = utf8Bytes(text)
    const utf16 = utf16Bytes(text)
    const eucKr = eucKrBytes(text)
    const tw = twitterWeight(text)

    // 읽기·말하기 시간 (한국어 기준 약 300자/분 묵독, 150자/분 발화)
    const readingMin = len / 300
    const speakingMin = len / 150
    const englishWPM = words / 200

    // 추출 카운트
    const hashtags = (text.match(/#[^\s#]+/g) || []).length
    const mentions = (text.match(/@[^\s@]+/g) || []).length
    const urls = (text.match(/https?:\/\/[^\s]+/g) || []).length
    const emails = (text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || []).length
    const numbers = (text.match(/[+-]?\d+(?:[.,]\d+)?/g) || []).length

    return {
      len, lenNoSpace, words, lines, paragraphs, sentences,
      hangul, hangulSyll, hangulJamo, latin, digit, space, special, cjk, emoji,
      utf8, utf16, eucKr, tw,
      readingMin, speakingMin, englishWPM,
      hashtags, mentions, urls, emails, numbers,
    }
  }, [text])

  // 시간 포맷
  function fmtMin(m: number): string {
    if (m === 0) return '0초'
    if (m < 1 / 60) return '< 1초'
    if (m < 1) return `${Math.round(m * 60)}초`
    const min = Math.floor(m)
    const sec = Math.round((m - min) * 60)
    if (sec === 0) return `${min}분`
    if (min === 0) return `${sec}초`
    return `${min}분 ${sec}초`
  }

  // 플랫폼별 카운트 계산
  function platformCount(p: PlatformLimit): number {
    if (p.method === 'twitterWeighted') return stats.tw
    if (p.method === 'bytes') return stats.eucKr
    if (p.method === 'lines') return stats.lines
    return stats.len
  }

  // 도구 — 변환 결과
  const conversions = useMemo(() => {
    if (!text) return null
    return {
      upper: text.toUpperCase(),
      lower: text.toLowerCase(),
      title: text.replace(/\b\w/g, m => m.toUpperCase()),
      snake: text.toLowerCase().replace(/\s+/g, '_'),
      kebab: text.toLowerCase().replace(/\s+/g, '-'),
      camel: text.toLowerCase().replace(/\s+(.)/g, (_, c) => c.toUpperCase()),
      reverse: [...text].reverse().join(''),
      trim: text.trim().replace(/\s+/g, ' '),
    }
  }, [text])

  // 빈도 분석 (top 10)
  const freqTop = useMemo(() => {
    if (!text) return []
    const map = new Map<string, number>()
    for (const ch of text) {
      if (isSpace(ch)) continue
      map.set(ch, (map.get(ch) ?? 0) + 1)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
  }, [text])

  // 찾기·바꾸기
  const findReplaceResult = useMemo(() => {
    if (!findStr || !text) return null
    const flags = findCaseSensitive ? 'g' : 'gi'
    let count = 0
    try {
      const re = new RegExp(findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)
      const matches = text.match(re)
      count = matches ? matches.length : 0
      const replaced = text.replace(re, replaceStr)
      return { count, replaced }
    } catch {
      return { count: 0, replaced: text }
    }
  }, [findStr, replaceStr, findCaseSensitive, text])

  function applyConversion(value: string) {
    setText(value)
  }

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabsThree}`}>
        <button className={`${s.tabBtn} ${tab === 'count'     ? s.tabActive : ''}`} onClick={() => setTab('count')}>실시간 통계</button>
        <button className={`${s.tabBtn} ${tab === 'platforms' ? s.tabActive : ''}`} onClick={() => setTab('platforms')}>플랫폼별 제한</button>
        <button className={`${s.tabBtn} ${tab === 'tools'     ? s.tabActive : ''}`} onClick={() => setTab('tools')}>변환·찾기·빈도</button>
      </div>

      {/* 입력 — 모든 탭 공통 */}
      <div className={s.card}>
        <div className={s.cardTop}>
          <label className={s.cardLabel}>텍스트 입력</label>
          {text && <button className={s.clearBtn} onClick={() => setText('')}>지우기</button>}
        </div>
        <textarea
          className={s.textarea}
          placeholder="여기에 텍스트를 입력하세요..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={tab === 'count' ? 6 : 8}
        />
      </div>

      {/* ─── TAB 1: 실시간 통계 ─── */}
      {tab === 'count' && (
        <>
          {/* 핵심 4개 요약 */}
          <div className={s.summaryGrid}>
            <div className={`${s.summaryItem} ${s.summaryItemBig}`}>
              <p className={s.summaryItemLabel}>총 글자수</p>
              <p className={s.summaryItemNum}>{fmt(stats.len)}</p>
            </div>
            <div className={s.summaryItem}>
              <p className={s.summaryItemLabel}>공백 제외</p>
              <p className={s.summaryItemNum}>{fmt(stats.lenNoSpace)}</p>
            </div>
            <div className={s.summaryItem}>
              <p className={s.summaryItemLabel}>단어수</p>
              <p className={s.summaryItemNum}>{fmt(stats.words)}</p>
            </div>
            <div className={s.summaryItem}>
              <p className={s.summaryItemLabel}>UTF-8 바이트</p>
              <p className={s.summaryItemNum}>{fmt(stats.utf8)}</p>
            </div>
          </div>

          {/* 6개 부가 통계 */}
          <div className={s.statsGrid6}>
            <div className={s.miniStat}><p className={s.miniStatLabel}>줄수</p>          <p className={s.miniStatValue}>{fmt(stats.lines)}</p></div>
            <div className={s.miniStat}><p className={s.miniStatLabel}>문장수</p>        <p className={s.miniStatValue}>{fmt(stats.sentences)}</p></div>
            <div className={s.miniStat}><p className={s.miniStatLabel}>단락수</p>        <p className={s.miniStatValue}>{fmt(stats.paragraphs)}</p></div>
            <div className={s.miniStat}><p className={s.miniStatLabel}>UTF-16</p>         <p className={s.miniStatValue}>{fmt(stats.utf16)}B</p></div>
            <div className={s.miniStat}><p className={s.miniStatLabel}>EUC-KR (SMS)</p>  <p className={s.miniStatValue}>{fmt(stats.eucKr)}B</p></div>
            <div className={s.miniStat}><p className={s.miniStatLabel}>X 가중치</p>      <p className={s.miniStatValue}>{fmt(stats.tw)}</p></div>
          </div>

          {/* 문자 종류별 분석 */}
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>문자 종류별 분석</label>
            </div>
            <div className={s.statsGrid6}>
              <div className={s.miniStat}><p className={s.miniStatLabel}>🇰🇷 한글</p>     <p className={s.miniStatValue}>{fmt(stats.hangul)}</p></div>
              <div className={s.miniStat}><p className={s.miniStatLabel}>🅰️ 영문</p>     <p className={s.miniStatValue}>{fmt(stats.latin)}</p></div>
              <div className={s.miniStat}><p className={s.miniStatLabel}>🔢 숫자</p>     <p className={s.miniStatValue}>{fmt(stats.digit)}</p></div>
              <div className={s.miniStat}><p className={s.miniStatLabel}>·  특수</p>     <p className={s.miniStatValue}>{fmt(stats.special)}</p></div>
              <div className={s.miniStat}><p className={s.miniStatLabel}>📝 한자</p>     <p className={s.miniStatValue}>{fmt(stats.cjk)}</p></div>
              <div className={s.miniStat}><p className={s.miniStatLabel}>😀 이모지</p>   <p className={s.miniStatValue}>{fmt(stats.emoji)}</p></div>
            </div>
          </div>

          {/* 읽기·말하기 시간 + 추출 */}
          <div className={s.statsGrid4}>
            <div className={s.miniStat}><p className={s.miniStatLabel}>📖 묵독 시간</p>     <p className={s.miniStatValue}>{fmtMin(stats.readingMin)}</p></div>
            <div className={s.miniStat}><p className={s.miniStatLabel}>🎙️ 발화 시간</p>     <p className={s.miniStatValue}>{fmtMin(stats.speakingMin)}</p></div>
            <div className={s.miniStat}><p className={s.miniStatLabel}>#해시태그</p>        <p className={s.miniStatValue}>{fmt(stats.hashtags)}</p></div>
            <div className={s.miniStat}><p className={s.miniStatLabel}>🔗 URL</p>           <p className={s.miniStatValue}>{fmt(stats.urls)}</p></div>
          </div>

          <p style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.7 }}>
            ※ 묵독 약 300자/분 · 발화 약 150자/분 (한국어 표준 기준 추정)
          </p>
        </>
      )}

      {/* ─── TAB 2: 플랫폼별 제한 ─── */}
      {tab === 'platforms' && (
        <div className={s.card}>
          {PLATFORM_GROUPS.map((g, gi) => (
            <div key={gi}>
              <p className={s.platformGroupTitle}>{g.group}</p>
              <div className={s.limitList}>
                {g.items.map(p => {
                  const cur = platformCount(p)
                  const pct = Math.min((cur / p.limit) * 100, 100)
                  const over = cur > p.limit
                  return (
                    <div key={p.name} className={s.limitRow}>
                      <div className={s.limitMeta}>
                        <span className={s.limitName}>
                          {p.name}{p.note && <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 6 }}>· {p.note}</span>}
                        </span>
                        <span className={`${s.limitCount} ${over ? s.limitOver : ''}`}>
                          {fmt(cur)} / {fmt(p.limit)}{p.method === 'bytes' ? 'B' : ''}
                        </span>
                      </div>
                      <div className={s.progressBar}>
                        <div className={`${s.progressFill} ${over ? s.progressOver : ''}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 14, lineHeight: 1.7 }}>
            ※ X(트위터)는 한글 1자 = 가중치 2로 계산 (실제 280 weight). SMS는 EUC-KR 바이트로 계산 (한글 2B / 영문 1B).
            플랫폼 정책은 변동될 수 있으므로 공식 페이지에서 최신 한도를 확인하세요.
          </p>
        </div>
      )}

      {/* ─── TAB 3: 변환·찾기·빈도 ─── */}
      {tab === 'tools' && (
        <>
          {/* 대소문자·케이스 변환 */}
          {conversions && (
            <div className={s.card}>
              <div className={s.cardTop}>
                <label className={s.cardLabel}>케이스 변환 (클릭 시 입력 텍스트에 적용)</label>
              </div>
              <div className={s.subActionRow}>
                <button className={s.subActionBtn} onClick={() => applyConversion(conversions.upper)}>UPPER</button>
                <button className={s.subActionBtn} onClick={() => applyConversion(conversions.lower)}>lower</button>
                <button className={s.subActionBtn} onClick={() => applyConversion(conversions.title)}>Title Case</button>
                <button className={s.subActionBtn} onClick={() => applyConversion(conversions.snake)}>snake_case</button>
                <button className={s.subActionBtn} onClick={() => applyConversion(conversions.kebab)}>kebab-case</button>
                <button className={s.subActionBtn} onClick={() => applyConversion(conversions.camel)}>camelCase</button>
                <button className={s.subActionBtn} onClick={() => applyConversion(conversions.reverse)}>역순</button>
                <button className={s.subActionBtn} onClick={() => applyConversion(conversions.trim)}>공백 정리</button>
              </div>
            </div>
          )}

          {/* 찾기 / 바꾸기 */}
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>찾기·바꾸기</label>
              {findReplaceResult && (
                <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                  {findReplaceResult.count}회 일치
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input
                type="text"
                placeholder="찾을 문자열"
                value={findStr}
                onChange={e => setFindStr(e.target.value)}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)',
                }}
              />
              <input
                type="text"
                placeholder="바꿀 문자열"
                value={replaceStr}
                onChange={e => setReplaceStr(e.target.value)}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)',
                }}
              />
            </div>
            <label className={s.toggleLabel} style={{ marginTop: 10 }}>
              <input type="checkbox" className={s.checkbox} checked={findCaseSensitive} onChange={e => setFindCaseSensitive(e.target.checked)} />
              대소문자 구분
            </label>
            {findReplaceResult && findStr && (
              <button
                className={s.subActionBtn}
                style={{ marginTop: 10 }}
                onClick={() => setText(findReplaceResult.replaced)}
                disabled={findReplaceResult.count === 0}
              >
                ↻ 모두 바꾸기 ({findReplaceResult.count}회)
              </button>
            )}
          </div>

          {/* 빈도 분석 */}
          {freqTop.length > 0 && (
            <div className={s.card}>
              <div className={s.cardTop}>
                <label className={s.cardLabel}>가장 많이 쓰인 글자 Top 10</label>
              </div>
              <div className={s.limitList}>
                {freqTop.map(([ch, n]) => {
                  const max = freqTop[0][1]
                  const pct = (n / max) * 100
                  return (
                    <div key={ch} className={s.limitRow}>
                      <div className={s.limitMeta}>
                        <span className={s.limitName} style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                          &lsquo;{ch}&rsquo;
                        </span>
                        <span className={s.limitCount}>{fmt(n)}회</span>
                      </div>
                      <div className={s.progressBar}>
                        <div className={s.progressFill} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
