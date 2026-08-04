'use client'

import { useEffect, useMemo, useState } from 'react'
import s from '../../dev/dev.module.css'
import {
  twitterCount, reverseText, countSentences, fmtMin,
  eucKrBytes as eucKrCount, utf8Bytes, utf16Bytes, graphemes, countFor,
  PLATFORM_GROUPS, SOURCE_TIER_LABEL, METHOD_LABEL, TWITTER_CONFIG,
  type PlatformLimit,
} from './charcountUtils'

const STORAGE_KEY = 'youtil_charcount_v1'

// ─────────────────────────────────────────────
// 한글 분석
// ─────────────────────────────────────────────
const HANGUL_SYL_START = 0xAC00
const HANGUL_SYL_END   = 0xD7A3
const HANGUL_JAMO_RANGE = (cp: number) =>
  (cp >= 0x1100 && cp <= 0x11FF) ||  // 자모
  (cp >= 0x3130 && cp <= 0x318F) ||  // 호환 자모
  (cp >= 0xA960 && cp <= 0xA97F)     // 자모 확장-A

function isLatin(cp: number): boolean {
  return (cp >= 0x41 && cp <= 0x5A) || (cp >= 0x61 && cp <= 0x7A)
}
function isDigit(cp: number): boolean {
  return cp >= 0x30 && cp <= 0x39
}
function isSpace(ch: string): boolean {
  return /\s/.test(ch)
}

const fmt = (v: number) => v.toLocaleString('ko-KR')

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function CharCountClient() {
  const [tab, setTab] = useState<'count' | 'platforms' | 'tools'>('count')
  const [text, setText] = useState('')
  const [targetLimit, setTargetLimit] = useState('')

  // tools tab
  const [findStr, setFindStr] = useState('')
  const [replaceStr, setReplaceStr] = useState('')
  const [findCaseSensitive, setFindCaseSensitive] = useState(false)

  /* 자동 저장 — 자소서·이력서 전문이 브라우저에 남을 수 있어 끄는 스위치를 둔다 */
  const [saveEnabled, setSaveEnabled] = useState(true)
  // 자동 저장 — 새로고침해도 입력·목표 글자수 유지
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    // localStorage 복원 — 마운트 후 1회, 하이드레이션 안전 패턴(의도됨)
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const j = JSON.parse(raw)
        if (typeof j.text === 'string') setText(j.text)
        if (typeof j.targetLimit === 'string') setTargetLimit(j.targetLimit)
        if (typeof j.saveEnabled === 'boolean') setSaveEnabled(j.saveEnabled)
      }
    } catch {}
    setHydrated(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])
  useEffect(() => {
    if (!hydrated) return
    try {
      if (saveEnabled) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ text, targetLimit, saveEnabled }))
      } else {
        /* 끄면 저장해 둔 본문까지 즉시 지운다 — 끄기만 하고 남아 있으면 의미가 없다 */
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ saveEnabled }))
      }
    } catch {}
  }, [hydrated, text, targetLimit, saveEnabled])

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
    const sentences = countSentences(text)

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
    const euc = eucKrCount(text)
    const eucKr = euc.bytes
    const eucUnsupported = euc.unsupported
    const twc = twitterCount(text)
    const tw = twc.weighted

    // 읽기·말하기 시간 (한국어 기준 약 300자/분 묵독, 150자/분 발화)
    const readingMin = len / 300
    const speakingMin = len / 150
    const englishWPM = words / 200

    // 원고지 매수 (200자 원고지 기준, 공백 포함)
    const manuscript200 = len === 0 ? 0 : Math.ceil(len / 200)

    // 추출 카운트
    const hashtags = (text.match(/#[^\s#]+/g) || []).length
    const mentions = (text.match(/@[^\s@]+/g) || []).length
    const urls = (text.match(/https?:\/\/[^\s]+/g) || []).length
    const emails = (text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || []).length
    const numbers = (text.match(/[+-]?\d+(?:[.,]\d+)?/g) || []).length

    return {
      len, lenNoSpace, words, lines, paragraphs, sentences,
      hangul, hangulSyll, hangulJamo, latin, digit, space, special, cjk, emoji,
      utf8, utf16, eucKr, eucUnsupported, tw, twc,
      graphemeCount: graphemes(text).length,
      readingMin, speakingMin, englishWPM, manuscript200,
      hashtags, mentions, urls, emails, numbers,
    }
  }, [text])

  // 플랫폼별 카운트 — 각 플랫폼이 실제로 쓰는 계산 방식으로
  function platformCount(p: PlatformLimit): number {
    return countFor(text, p.method)
  }

  // 도구 — 변환 결과
  const conversions = useMemo(() => {
    if (!text) return null
    const lines = text.split('\n')
    return {
      upper: text.toUpperCase(),
      lower: text.toLowerCase(),
      title: text.replace(/\b\w/g, m => m.toUpperCase()),
      snake: text.toLowerCase().replace(/\s+/g, '_'),
      kebab: text.toLowerCase().replace(/\s+/g, '-'),
      camel: text.toLowerCase().replace(/\s+(.)/g, (_, c) => c.toUpperCase()),
      reverse: reverseText(text),
      trim: text.trim().replace(/\s+/g, ' '),
      // 정리 도구
      removeBlankLines: lines.filter(l => l.trim() !== '').join('\n'),
      collapseBlankLines: text.replace(/\n{3,}/g, '\n\n'),
      dedupeLines: [...new Set(lines)].join('\n'),
      sortLines: lines.slice().sort((a, b) => a.localeCompare(b, 'ko')).join('\n'),
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
        <button type="button" role="tab" aria-selected={tab === 'count'} className={`${s.tabBtn} ${tab === 'count'     ? s.tabActive : ''}`} onClick={() => setTab('count')}>실시간 통계</button>
        <button type="button" role="tab" aria-selected={tab === 'platforms'} className={`${s.tabBtn} ${tab === 'platforms' ? s.tabActive : ''}`} onClick={() => setTab('platforms')}>플랫폼별 제한</button>
        <button type="button" role="tab" aria-selected={tab === 'tools'} className={`${s.tabBtn} ${tab === 'tools'     ? s.tabActive : ''}`} onClick={() => setTab('tools')}>변환·찾기·빈도</button>
      </div>

      {/* 입력 — 모든 탭 공통 */}
      <div className={s.card}>
        <div className={s.cardTop}>
          <label className={s.cardLabel} htmlFor="cc-text">텍스트 입력</label>
          {text && <button type="button" className={s.clearBtn} onClick={() => setText('')}>지우기</button>}
        </div>
        <textarea
          id="cc-text"
          className={s.textarea}
          placeholder="여기에 텍스트를 입력하세요..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={tab === 'count' ? 6 : 8}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={saveEnabled}
              onChange={(e) => setSaveEnabled(e.target.checked)}
            />
            <span>이 브라우저에 자동 저장</span>
          </label>
          <span>
            — 입력한 글은 <strong>이 기기의 브라우저 저장소</strong>에만 남고 서버로 전송되지 않습니다.
            자기소개서처럼 민감한 글을 공용 PC에서 다룬다면 저장을 끄세요(끄면 저장된 내용도 바로 지워집니다).
          </span>
        </div>

        {stats.eucUnsupported.length > 0 && (
          <p role="status" style={{
            marginTop: 10, fontSize: 12, lineHeight: 1.75, color: 'var(--text)',
            background: 'color-mix(in srgb, var(--warning) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--warning) 35%, transparent)',
            borderRadius: 8, padding: '10px 12px',
          }}>
            ⚠️ EUC-KR로 표현할 수 없는 문자가 <strong>{stats.eucUnsupported.length}개</strong> 있습니다
            ({[...new Set(stats.eucUnsupported)].slice(0, 8).join(' ')}
            {new Set(stats.eucUnsupported).size > 8 ? ' …' : ''}).
            {' '}SMS/LMS는 EUC-KR 기반이라 이모지는 바이트 수에 포함하지 않았습니다 — 실제 발송 시 제거되거나
            MMS로 전환될 수 있으니 문자 발송 서비스의 안내를 확인하세요.
          </p>
        )}

        {(stats.twc.urlCount > 0 || stats.twc.emojiCount > 0) && (
          <p style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', lineHeight: 1.75 }}>
            ⓘ X 가중치 {fmt(stats.tw)} / {TWITTER_CONFIG.maxWeightedTweetLength} —
            {stats.twc.urlCount > 0 && ` URL ${stats.twc.urlCount}개는 실제 길이와 무관하게 각 ${TWITTER_CONFIG.transformedURLLength}자로 계산됩니다.`}
            {stats.twc.emojiCount > 0 && ` 이모지 ${stats.twc.emojiCount}개는 결합 여부와 무관하게 각 2자입니다.`}
          </p>
        )}

        {/* 목표 글자수 — 실시간 카운트다운 */}
        {(() => {
          const targetN = parseInt(targetLimit, 10)
          const hasTarget = Number.isFinite(targetN) && targetN > 0
          const over = hasTarget && stats.len > targetN
          const pct = hasTarget ? Math.min((stats.len / targetN) * 100, 100) : 0
          return (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <label htmlFor="cc-target" style={{ fontSize: 12, color: 'var(--muted)' }}>목표 글자수</label>
                <input id="cc-target"
                  type="number" inputMode="numeric" min={0} placeholder="예: 500"
                  value={targetLimit}
                  onChange={e => setTargetLimit(e.target.value.replace(/[^\d]/g, ''))}
                  style={{
                    width: 110, background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '7px 10px', fontFamily: 'var(--font-mono)',
                    fontSize: 14, color: 'var(--text)', textAlign: 'right',
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>자 (공백 포함)</span>
                {hasTarget && (
                  <span style={{ marginLeft: 'auto', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, fontSize: 14, color: over ? 'var(--danger)' : 'var(--accent-ink)' }}>
                    {over ? `초과 ${fmt(stats.len - targetN)}자` : `남은 ${fmt(targetN - stats.len)}자`}
                    <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 12, marginLeft: 6 }}>{fmt(stats.len)} / {fmt(targetN)}</span>
                  </span>
                )}
              </div>
              {hasTarget && (
                <div className={s.progressBar} style={{ marginTop: 8 }}>
                  <div className={`${s.progressFill} ${over ? s.progressOver : ''}`} style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          )
        })()}
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
            <div className={s.miniStat}><p className={s.miniStatLabel}>그래핌(눈에 보이는 글자)</p><p className={s.miniStatValue}>{fmt(stats.graphemeCount)}</p></div>
          </div>

          {/* 문자 종류별 분석 */}
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>문자 종류별 분석</label>
            </div>
            <div className={s.statsGrid6}>
              <div className={s.miniStat}><p className={s.miniStatLabel}>한글</p>     <p className={s.miniStatValue}>{fmt(stats.hangul)}</p></div>
              <div className={s.miniStat}><p className={s.miniStatLabel}>영문</p>     <p className={s.miniStatValue}>{fmt(stats.latin)}</p></div>
              <div className={s.miniStat}><p className={s.miniStatLabel}>숫자</p>     <p className={s.miniStatValue}>{fmt(stats.digit)}</p></div>
              <div className={s.miniStat}><p className={s.miniStatLabel}>·  특수</p>     <p className={s.miniStatValue}>{fmt(stats.special)}</p></div>
              <div className={s.miniStat}><p className={s.miniStatLabel}>한자</p>     <p className={s.miniStatValue}>{fmt(stats.cjk)}</p></div>
              <div className={s.miniStat}><p className={s.miniStatLabel}>이모지</p>   <p className={s.miniStatValue}>{fmt(stats.emoji)}</p></div>
            </div>
          </div>

          {/* 원고지·읽기·말하기 시간 + 추출 */}
          <div className={s.statsGrid4}>
            <div className={s.miniStat}><p className={s.miniStatLabel}>원고지(200자)</p> <p className={s.miniStatValue}>{fmt(stats.manuscript200)}매</p></div>
            <div className={s.miniStat}><p className={s.miniStatLabel}>묵독 시간</p>     <p className={s.miniStatValue}>{fmtMin(stats.readingMin)}</p></div>
            <div className={s.miniStat}><p className={s.miniStatLabel}>발화 시간</p>     <p className={s.miniStatValue}>{fmtMin(stats.speakingMin)}</p></div>
            <div className={s.miniStat}><p className={s.miniStatLabel}>#해시태그</p>        <p className={s.miniStatValue}>{fmt(stats.hashtags)}</p></div>
            <div className={s.miniStat}><p className={s.miniStatLabel}>URL</p>           <p className={s.miniStatValue}>{fmt(stats.urls)}</p></div>
            <div className={s.miniStat}><p className={s.miniStatLabel}>@멘션</p>            <p className={s.miniStatValue}>{fmt(stats.mentions)}</p></div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
            ※ 원고지는 200자 기준(공백 포함) · 묵독 약 300자/분 · 발화 약 150자/분 (한국어 표준 기준 추정)
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
                          {p.name}
                          <span
                            title={SOURCE_TIER_LABEL[p.tier]}
                            style={{
                              fontSize: 10, marginLeft: 6, padding: '1px 6px', borderRadius: 999,
                              border: '1px solid var(--border)',
                              color: p.tier === 'official' ? 'var(--success)' : 'var(--muted)',
                              background: 'var(--bg3)', whiteSpace: 'nowrap',
                            }}
                          >
                            {p.tier === 'official' ? '공식' : p.tier === 'community' ? '통용값' : '프리셋'}
                          </span>
                          <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 6 }}>
                            · {METHOD_LABEL[p.method]}
                          </span>
                          {p.note && <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 6 }}>· {p.note}</span>}
                        </span>
                        <span className={`${s.limitCount} ${over ? s.limitOver : ''}`}>
                          {fmt(cur)} / {fmt(p.limit)}{p.method.endsWith('Bytes') ? 'B' : ''}
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
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 14, lineHeight: 1.8 }}>
            <p style={{ margin: '0 0 6px' }}>
              <strong style={{ color: 'var(--success)' }}>공식</strong> = 플랫폼 공식 문서에 명시된 값 ·
              {' '}<strong>통용값</strong> = 공식 문서화가 없어 널리 쓰이는 값 ·
              {' '}<strong>프리셋</strong> = 규격이 아니라 편의용 기준
            </p>
            <p style={{ margin: '0 0 6px' }}>
              계산 방식도 플랫폼마다 다릅니다 — X는 가중치(한글·이모지 2, URL은 길이 무관 23),
              SMS는 EUC-KR 바이트, Threads는 UTF-8 바이트, 나머지는 UTF-16 길이입니다.
            </p>
            <p style={{ margin: 0 }}>
              ※ 2026년 8월 확인 기준이며 플랫폼 정책은 예고 없이 바뀝니다. 중요한 게시물은 공식 페이지에서 최신 한도를 확인하세요.
            </p>
          </div>
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
                <button type="button" className={s.subActionBtn} onClick={() => applyConversion(conversions.upper)}>UPPER</button>
                <button type="button" className={s.subActionBtn} onClick={() => applyConversion(conversions.lower)}>lower</button>
                <button type="button" className={s.subActionBtn} onClick={() => applyConversion(conversions.title)}>Title Case</button>
                <button type="button" className={s.subActionBtn} onClick={() => applyConversion(conversions.snake)}>snake_case</button>
                <button type="button" className={s.subActionBtn} onClick={() => applyConversion(conversions.kebab)}>kebab-case</button>
                <button type="button" className={s.subActionBtn} onClick={() => applyConversion(conversions.camel)}>camelCase</button>
                <button type="button" className={s.subActionBtn} onClick={() => applyConversion(conversions.reverse)}>역순</button>
                <button type="button" className={s.subActionBtn} onClick={() => applyConversion(conversions.trim)}>공백 정리</button>
              </div>
            </div>
          )}

          {/* 줄 정리 도구 */}
          {conversions && (
            <div className={s.card}>
              <div className={s.cardTop}>
                <label className={s.cardLabel}>줄 정리 (클릭 시 입력 텍스트에 적용)</label>
              </div>
              <div className={s.subActionRow}>
                <button type="button" className={s.subActionBtn} onClick={() => applyConversion(conversions.removeBlankLines)}>빈 줄 모두 제거</button>
                <button type="button" className={s.subActionBtn} onClick={() => applyConversion(conversions.collapseBlankLines)}>연속 빈 줄 1개로</button>
                <button type="button" className={s.subActionBtn} onClick={() => applyConversion(conversions.dedupeLines)}>중복 줄 제거</button>
                <button type="button" className={s.subActionBtn} onClick={() => applyConversion(conversions.sortLines)}>줄 가나다 정렬</button>
              </div>
            </div>
          )}

          {/* 찾기 / 바꾸기 */}
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>찾기·바꾸기</label>
              {findReplaceResult && (
                <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>
                  {findReplaceResult.count}회 일치
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
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
              <button type="button"
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
