/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './regex.module.css'
import {
  ALL_FLAGS, PATTERNS, CATEGORIES, CHEATSHEET,
  type FlagId, type PatternCategory, type LangId, type Mode,
  buildRegex, runMatches, runReplace, runSplit,
  tokenizeForHighlight, colorForMatch, formatLangSnippet,
  byteLength, fmtMs, fmtInt,
  MAX_INPUT_BYTES, SLOW_THRESHOLD_MS,
} from './regexUtils'

type Tab = 'match' | 'replace' | 'library' | 'cheatsheet'

const STORAGE_KEY = 'youtil_regex_v1'

export default function RegexClient() {
  const [tab, setTab] = useState<Tab>('match')

  /* ═══ 공유 상태 ═══ */
  const [pattern, setPattern] = useState<string>('\\b\\w+\\b')
  const [flags, setFlags] = useState<Record<FlagId, boolean>>({
    g: true, i: false, m: false, s: false, u: false, y: false,
  })
  const [text, setText] = useState<string>('Hello World — 안녕하세요 정규식 테스트입니다.\nLine 2 with numbers 123 and email@example.com.')

  /* ═══ 탭 2 ═══ */
  const [mode, setMode] = useState<Mode>('replace')
  const [replacement, setReplacement] = useState<string>('[$&]')

  /* ═══ 탭 3 ═══ */
  const [filter, setFilter] = useState<PatternCategory | 'all'>('all')

  /* ═══ 입력 길이 경고 ═══ */
  const [tooLong, setTooLong] = useState<boolean>(false)

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (typeof j.pattern === 'string') setPattern(j.pattern)
      if (j.flags && typeof j.flags === 'object') {
        setFlags({
          g: !!j.flags.g, i: !!j.flags.i, m: !!j.flags.m,
          s: !!j.flags.s, u: !!j.flags.u, y: !!j.flags.y,
        })
      }
      if (typeof j.text === 'string') setText(j.text)
      if (j.mode) setMode(j.mode)
      if (typeof j.replacement === 'string') setReplacement(j.replacement)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        pattern, flags, text, mode, replacement,
      }))
    } catch {}
  }, [pattern, flags, text, mode, replacement])

  /* flags 문자열 */
  const flagsStr = useMemo(
    () => (Object.keys(flags) as FlagId[]).filter((f) => flags[f]).join(''),
    [flags],
  )

  /* 정규식 빌드 */
  const built = useMemo(() => buildRegex(pattern, flagsStr), [pattern, flagsStr])

  /* 매치 실행 (디바운스 200ms) */
  const [matchResult, setMatchResult] = useState<ReturnType<typeof runMatches>>({ matches: [], executionMs: 0, truncated: false })
  useEffect(() => {
    const handle = setTimeout(() => {
      if (built.regex) {
        try {
          const r = runMatches(built.regex, text)
          setMatchResult(r)
        } catch {
          setMatchResult({ matches: [], executionMs: 0, truncated: false })
        }
      } else {
        setMatchResult({ matches: [], executionMs: 0, truncated: false })
      }
    }, 200)
    return () => clearTimeout(handle)
  }, [built.regex, text])

  /* 치환 결과 */
  const replaceResult = useMemo(() => {
    if (!built.regex || mode !== 'replace') return null
    return runReplace(built.regex, text, replacement)
  }, [built.regex, text, replacement, mode])

  /* 분할 결과 */
  const splitResult = useMemo(() => {
    if (!built.regex || mode !== 'split') return null
    return runSplit(built.regex, text)
  }, [built.regex, text, mode])

  /* 입력 길이 */
  const textBytes = useMemo(() => byteLength(text), [text])

  /* 텍스트 입력 핸들러 — 100KB 제한 */
  const onTextChange = (val: string) => {
    const bytes = byteLength(val)
    if (bytes > MAX_INPUT_BYTES) {
      setTooLong(true)
      setTimeout(() => setTooLong(false), 3000)
      /* 유효한 길이까지만 자르기 */
      let cut = val
      while (byteLength(cut) > MAX_INPUT_BYTES) {
        cut = cut.slice(0, Math.floor(cut.length * 0.95))
      }
      setText(cut)
    } else {
      setText(val)
    }
  }

  /* 토큰 (하이라이트용) */
  const tokens = useMemo(
    () => tokenizeForHighlight(text, matchResult.matches),
    [text, matchResult.matches],
  )

  /* 패턴 라이브러리 적용 */
  const applyPattern = (p: typeof PATTERNS[number]) => {
    setPattern(p.pattern)
    setFlags({
      g: p.flags.includes('g'),
      i: p.flags.includes('i'),
      m: p.flags.includes('m'),
      s: p.flags.includes('s'),
      u: p.flags.includes('u'),
      y: p.flags.includes('y'),
    })
    setText('')   /* 실수로 개인정보 입력 방지 */
    setTab('match')
  }

  const filteredPatterns = useMemo(
    () => filter === 'all' ? PATTERNS : PATTERNS.filter((p) => p.category === filter),
    [filter],
  )

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        <button className={`${s.tab} ${tab === 'match' ? s.tabActive : ''}`}      onClick={() => setTab('match')}>🔍 매칭</button>
        <button className={`${s.tab} ${tab === 'replace' ? s.tabActive : ''}`}    onClick={() => setTab('replace')}>🔄 치환·분할</button>
        <button className={`${s.tab} ${tab === 'library' ? s.tabActive : ''}`}    onClick={() => setTab('library')}>📚 패턴 라이브러리</button>
        <button className={`${s.tab} ${tab === 'cheatsheet' ? s.tabActive : ''}`} onClick={() => setTab('cheatsheet')}>📖 치트시트</button>
      </div>

      {/* ═════════════ 공통: 정규식 + flags + 테스트 문자열 (탭 1·2 공유) ═════════════ */}
      {(tab === 'match' || tab === 'replace') && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>🔣 정규식 패턴</span>
            <div className={s.patternRow}>
              <span className={s.patternSlash}>/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="정규식 입력 (구분자 / 없이)"
                className={s.patternInput}
                spellCheck={false}
                autoComplete="off"
              />
              <span className={s.patternSlash}>/{flagsStr}</span>
            </div>
            {built.error && (
              <div className={s.errorBox}>
                ⚠️ <strong>정규식 오류</strong>: {built.error}
              </div>
            )}
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>🚩 flags ({flagsStr || '없음'})</span>
            <div className={s.flagsRow}>
              {ALL_FLAGS.map((f) => (
                <label key={f.id} className={`${s.flagChip} ${flags[f.id] ? s.flagChipActive : ''}`} title={f.longDesc}>
                  <input
                    type="checkbox"
                    checked={flags[f.id]}
                    onChange={(e) => setFlags((prev) => ({ ...prev, [f.id]: e.target.checked }))}
                  />
                  <span className={s.flagLetter}>{f.label}</span>
                  <span className={s.flagDesc}>{f.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>
              📝 테스트 문자열 ({fmtInt(textBytes)} / {fmtInt(MAX_INPUT_BYTES)} bytes)
            </span>
            <textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="여기에 테스트 문자열 입력..."
              rows={6}
              className={s.textarea}
              spellCheck={false}
            />
            {tooLong && (
              <p className={s.warnText}>⚠️ 100KB 한도 초과 — 추가 입력이 차단되었습니다.</p>
            )}
          </div>
        </>
      )}

      {/* ═════════════ 탭 1: 매칭 결과 ═════════════ */}
      {tab === 'match' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📊 통계</span>
            <p className={s.statText}>
              <strong className={s.statBig}>{fmtInt(matchResult.matches.length)}</strong>개 매치
              {' · '}실행 <strong className={matchResult.executionMs >= SLOW_THRESHOLD_MS ? s.slowText : ''}>{fmtMs(matchResult.executionMs)}</strong>
              {matchResult.executionMs >= SLOW_THRESHOLD_MS && ' ⚠️ 복잡한 패턴 — catastrophic backtracking 의심'}
              {matchResult.truncated && (
                <span className={s.warnInline}> · ⚠️ {fmtInt(matchResult.matches.length)}개로 잘림 (1만 매치 한도)</span>
              )}
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>✨ 하이라이트 미리보기</span>
            <div className={s.previewBox}>
              {tokens.length === 1 && tokens[0].matchIndex === -1 && !built.regex ? (
                <span className={s.muted}>정규식을 입력하면 매치가 강조됩니다.</span>
              ) : tokens.length === 1 && tokens[0].matchIndex === -1 ? (
                <span>{text}</span>
              ) : (
                tokens.map((tok, i) => {
                  if (tok.matchIndex === -1) return <span key={i}>{tok.text}</span>
                  return (
                    <mark
                      key={i}
                      className={s.matchMark}
                      style={{ background: colorForMatch(tok.matchIndex) + '40', borderBottom: `2px solid ${colorForMatch(tok.matchIndex)}` }}
                    >
                      {tok.text || '​'}
                    </mark>
                  )
                })
              )}
            </div>
            <p className={s.hint}>
              💡 색상 5종 로테이션 · 매치 위치 강조. zero-width 매치(예: <code>\b</code>)는 보이지 않을 수 있어요.
            </p>
          </div>

          {/* 매치 카드 리스트 */}
          {matchResult.matches.length > 0 && (
            <div className={s.card}>
              <span className={s.cardLabel}>📋 매치 상세 ({matchResult.matches.length}개)</span>
              <div className={s.matchList}>
                {matchResult.matches.slice(0, 100).map((m, i) => (
                  <div key={i} className={s.matchItem} style={{ borderLeftColor: colorForMatch(i) }}>
                    <div className={s.matchHead}>
                      <span className={s.matchNum} style={{ color: colorForMatch(i) }}>#{i + 1}</span>
                      <span className={s.matchPos}>인덱스 {m.index} · 길이 {m.length}</span>
                    </div>
                    <code className={s.matchFull}>{m.fullMatch || '(zero-width)'}</code>
                    {(m.groups.length > 0 || Object.keys(m.namedGroups).length > 0) && (
                      <div className={s.groupList}>
                        {m.groups.map((g, gi) => (
                          <div key={gi} className={s.groupItem}>
                            <span className={s.groupKey}>${gi + 1}</span>
                            <code className={s.groupVal}>{g === '' ? '(empty)' : g}</code>
                          </div>
                        ))}
                        {Object.entries(m.namedGroups).map(([k, v]) => (
                          <div key={k} className={s.groupItem}>
                            <span className={s.groupKey}>{`<${k}>`}</span>
                            <code className={s.groupVal}>{v === '' ? '(empty)' : v}</code>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {matchResult.matches.length > 100 && (
                  <p className={s.hint}>... 첫 100개만 표시 (전체 {fmtInt(matchResult.matches.length)}개)</p>
                )}
              </div>
            </div>
          )}

          {built.regex && matchResult.matches.length === 0 && !built.error && pattern && (
            <div className={s.emptyState}>
              <p>정규식은 유효하지만 <strong>매치가 0개</strong>입니다. 패턴이 테스트 문자열과 일치하는지 확인해 보세요.</p>
            </div>
          )}
        </>
      )}

      {/* ═════════════ 탭 2: 치환·분할 ═════════════ */}
      {tab === 'replace' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>🎛️ 모드</span>
            <div className={s.unitRow}>
              <button className={`${s.unitBtn} ${mode === 'replace' ? s.unitBtnActive : ''}`} onClick={() => setMode('replace')}>🔄 치환</button>
              <button className={`${s.unitBtn} ${mode === 'split' ? s.unitBtnActive : ''}`} onClick={() => setMode('split')}>✂️ 분할</button>
            </div>
          </div>

          {mode === 'replace' && (
            <>
              <div className={s.card}>
                <span className={s.cardLabel}>🔄 치환 패턴</span>
                <input
                  type="text"
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder="치환 문자열 ($1, $&, $`, $', $<name>)"
                  className={s.patternInput}
                  style={{ width: '100%' }}
                />
                <details className={s.helpDetails}>
                  <summary>💡 치환 패턴 도움말</summary>
                  <ul className={s.helpList}>
                    <li><code>$&</code> — 전체 매치 (예: <code>[$&]</code> → 매치를 [..]로 감싸기)</li>
                    <li><code>$1</code> ~ <code>$9</code> — 캡처 그룹 (예: <code>(\w+)@(\w+)</code> + <code>$2/$1</code> → 도메인/유저)</li>
                    <li><code>$`</code> — 매치 이전 텍스트</li>
                    <li><code>$&apos;</code> — 매치 이후 텍스트</li>
                    <li><code>{`$<name>`}</code> — 이름 캡처 그룹</li>
                  </ul>
                </details>
              </div>

              {replaceResult && (
                <>
                  <div className={s.card}>
                    <span className={s.cardLabel}>📤 치환 결과 (실행 {fmtMs(replaceResult.executionMs)})</span>
                    <textarea
                      value={replaceResult.result}
                      readOnly
                      rows={6}
                      className={s.textarea}
                    />
                  </div>
                  <CodeSnippetBox pattern={pattern} flags={flagsStr} mode="replace" replacement={replacement} />
                </>
              )}
            </>
          )}

          {mode === 'split' && splitResult && (
            <>
              <div className={s.card}>
                <span className={s.cardLabel}>✂️ 분할 결과 — {fmtInt(splitResult.parts.length)}개 항목 (실행 {fmtMs(splitResult.executionMs)})</span>
                <div className={s.splitList}>
                  {splitResult.parts.slice(0, 200).map((p, i) => (
                    <div key={i} className={s.splitItem}>
                      <span className={s.splitIdx}>[{i}]</span>
                      <code className={s.splitVal}>{p === '' ? '(empty string)' : p}</code>
                    </div>
                  ))}
                  {splitResult.parts.length > 200 && (
                    <p className={s.hint}>... 첫 200개만 표시 (전체 {fmtInt(splitResult.parts.length)}개)</p>
                  )}
                </div>
              </div>
              <CodeSnippetBox pattern={pattern} flags={flagsStr} mode="split" replacement="" />
            </>
          )}
        </>
      )}

      {/* ═════════════ 탭 3: 패턴 라이브러리 ═════════════ */}
      {tab === 'library' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📂 카테고리</span>
            <div className={s.categoryRow}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className={`${s.categoryBtn} ${filter === c.id ? s.categoryBtnActive : ''}`}
                  onClick={() => setFilter(c.id as PatternCategory | 'all')}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className={s.patternGrid}>
            {filteredPatterns.map((p) => (
              <div key={p.id} className={s.patternCard}>
                {p.warning && <span className={s.warnBadge}>⚠️</span>}
                <p className={s.patternName}>{p.name}</p>
                <code className={s.patternRegex}>/{p.pattern}/{p.flags}</code>
                <p className={s.patternDesc}>{p.desc}</p>
                <p className={s.patternExample}>예시: <strong>{p.example}</strong></p>
                {p.warning && <p className={s.patternWarn}>{p.warning}</p>}
                <button className={s.applyBtn} onClick={() => applyPattern(p)}>
                  탭 1에 적용 →
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ═════════════ 탭 4: 치트시트 ═════════════ */}
      {tab === 'cheatsheet' && (
        <>
          {/* flags 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🚩 flags 6종</span>
            <table className={s.cheatTable}>
              <thead>
                <tr><th>flag</th><th>의미</th><th>설명</th></tr>
              </thead>
              <tbody>
                {ALL_FLAGS.map((f) => (
                  <tr key={f.id}>
                    <td><code className={s.codeMono}>{f.label}</code></td>
                    <td><strong>{f.desc}</strong></td>
                    <td className={s.descCell}>{f.longDesc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 치트시트 5개 표 */}
          {CHEATSHEET.map((sec, si) => (
            <div key={si} className={s.card}>
              <span className={s.cardLabel}>{sec.emoji} {sec.title}</span>
              <table className={s.cheatTable}>
                <thead>
                  <tr><th>구문</th><th>설명</th><th>예시</th></tr>
                </thead>
                <tbody>
                  {sec.rows.map((r, ri) => (
                    <tr key={ri}>
                      <td><code className={s.codeMono}>{r.syntax}</code></td>
                      <td className={s.descCell}>{r.desc}</td>
                      <td>{r.example && <code className={s.codeMonoSm}>{r.example}</code>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {/* JS 한계 박스 */}
          <div className={s.warnBox}>
            <p className={s.warnTitle}>⚠️ JavaScript regex 한계 (PCRE/Python과 차이)</p>
            <ul className={s.warnList}>
              <li><strong>가변폭 lookbehind</strong> — <code>(?&lt;=\w+)</code> 같이 길이가 달라지는 lookbehind는 일부 환경(구형 Safari) 미지원</li>
              <li><strong>Atomic group</strong> — <code>(?&gt;...)</code> PCRE 전용, JS 미지원</li>
              <li><strong>Possessive quantifier</strong> — <code>a*+</code> JS 미지원</li>
              <li><strong>재귀 패턴</strong> — <code>(?R)</code> JS 미지원 (PCRE 전용)</li>
              <li><strong>Verbose flag (re.X)</strong> — Python 전용, JS 미지원 (한 줄에 모두 작성)</li>
              <li><strong>유니코드 속성</strong> — <code>{'\\p{L}'}</code>, <code>{'\\p{Emoji}'}</code>는 <strong>u flag 필수</strong></li>
            </ul>
          </div>

          {/* 흔한 실수 박스 */}
          <div className={s.tipBox}>
            <p className={s.tipTitle}>💡 흔한 실수 5가지</p>
            <ul className={s.warnList}>
              <li><strong>메타문자 escape 빠뜨림</strong> — <code>.</code>은 모든 글자, 점 자체는 <code>\.</code>로 (예: 이메일 도메인)</li>
              <li><strong>Greedy 함정</strong> — <code>&lt;.*&gt;</code>는 첫 <code>&lt;</code>부터 마지막 <code>&gt;</code>까지 → <code>&lt;.*?&gt;</code> (lazy) 사용</li>
              <li><strong>한글·이모지 매칭 시 u flag</strong> — <code>{'\\p{Emoji}'}</code>는 u flag 없으면 오류</li>
              <li><strong>캡처 vs 비캡처 그룹</strong> — 그룹화만 필요하면 <code>(?:...)</code>로 성능·가독성 ↑</li>
              <li><strong>Anchor 헷갈림</strong> — <code>^</code>·<code>$</code>는 기본 전체 문자열 시작·끝, <code>m</code> flag 시 줄 단위</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

/* ═════════════════════════════════════════════
   서브 컴포넌트
   ═════════════════════════════════════════════ */

function CodeSnippetBox({ pattern, flags, mode, replacement }: {
  pattern: string; flags: string; mode: Mode; replacement: string
}) {
  const [lang, setLang] = useState<LangId>('js')
  const snippet = formatLangSnippet(lang, pattern, flags, mode, replacement)
  return (
    <div className={s.card}>
      <span className={s.cardLabel}>💻 코드 스니펫</span>
      <div className={s.langRow}>
        {(['js', 'python', 'java', 'php'] as LangId[]).map((l) => (
          <button
            key={l}
            className={`${s.langBtn} ${lang === l ? s.langBtnActive : ''}`}
            onClick={() => setLang(l)}
          >
            {l === 'js' ? 'JavaScript' : l === 'python' ? 'Python' : l === 'java' ? 'Java' : 'PHP'}
          </button>
        ))}
      </div>
      <pre className={s.codeBlock}>{snippet}</pre>
    </div>
  )
}
