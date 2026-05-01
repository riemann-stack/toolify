/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import s from './random.module.css'
import {
  pickItems, pickWithWeights, pickWeightedIndex,
  divideIntoTeams, arrangeOrder, arrangeSeats,
  simulateFairness, calcRouletteAngle, describePieSlice,
  parseNamesText, detectDuplicates, genColors,
  loadLists, saveLists, newId,
  type WeightedItem, type SavedList, type FairnessRow,
} from './randomUtils'
import { TEMPLATES, TEMPLATE_CATEGORIES, getTemplate } from './templates'

type Tab = 'simple' | 'weighted' | 'roulette' | 'team' | 'order' | 'fair'

/* ═════════════════════════════════════════ Main ═════════════════════════════════════════ */
export default function RandomClient() {
  const [tab, setTab] = useState<Tab>('simple')

  return (
    <div className={s.wrap}>
      <div className={s.disclaimer}>
        💡 <strong>본 도구는 Math.random() 기반 의사난수 알고리즘을 사용합니다.</strong> 일반적인 무작위 추첨에는 충분히 공정하며, [공정성 검증] 탭에서 실제 분포를 확인할 수 있습니다. 법적·계약적·금전적 효력이 있는 추첨에는 공증 절차를 권장합니다. 명단은 이 브라우저의 localStorage에 저장됩니다.
      </div>

      <div className={s.tabs}>
        {([
          ['simple',   '간단 추첨'],
          ['weighted', '가중치 추첨'],
          ['roulette', '룰렛'],
          ['team',     '팀 나누기'],
          ['order',    '순서·자리'],
          ['fair',     '공정성 검증'],
        ] as [Tab, string][]).map(([key, label]) => {
          const cls =
            tab !== key ? '' :
            key === 'weighted' ? s.tabActiveWeight :
            key === 'roulette' ? s.tabActiveRoul :
            key === 'team'     ? s.tabActiveTeam :
            key === 'order'    ? s.tabActiveOrder :
            key === 'fair'     ? s.tabActiveFair :
            s.tabActive
          return (
            <button key={key} className={`${s.tabBtn} ${cls}`} onClick={() => setTab(key)}>
              {label}
            </button>
          )
        })}
      </div>

      {tab === 'simple'   && <SimpleTab />}
      {tab === 'weighted' && <WeightedTab />}
      {tab === 'roulette' && <RouletteTab />}
      {tab === 'team'     && <TeamTab />}
      {tab === 'order'    && <OrderTab />}
      {tab === 'fair'     && <FairnessTab />}

      <SavedListsSection />
    </div>
  )
}

/* ═════════════════════════════════════════ 탭 1 — 간단 추첨 ═════════════════════════════════════════ */
function SimpleTab() {
  type Mode = 'number' | 'item'
  const [mode, setMode] = useState<Mode>('number')
  const [minNum, setMinNum] = useState('1')
  const [maxNum, setMaxNum] = useState('100')
  const [pickCount, setPickCount] = useState('1')
  const [noRepeat, setNoRepeat] = useState(true)
  const [sorted, setSorted] = useState(false)
  const [itemText, setItemText] = useState('')
  const [activeCat, setActiveCat] = useState('food')
  const [results, setResults] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const items = parseNamesText(itemText)
  const dupes = detectDuplicates(items)
  const cnt = Math.max(1, parseInt(pickCount) || 1)

  const handleDraw = () => {
    if (mode === 'number') {
      const min = parseInt(minNum) || 0
      const max = parseInt(maxNum) || 100
      if (min > max) { alert('시작 번호가 끝 번호보다 큽니다'); return }
      const range = Array.from({ length: max - min + 1 }, (_, i) => i + min)
      const picked = pickItems(range, cnt, !noRepeat).map(String)
      if (sorted) picked.sort((a, b) => Number(a) - Number(b))
      setResults(picked)
    } else {
      if (items.length === 0) return
      const picked = pickItems(items, cnt, !noRepeat)
      if (sorted) picked.sort((a, b) => a.localeCompare(b))
      setResults(picked)
    }
    setCopied(false)
  }

  const handleCopy = () => {
    if (results.length === 0) return
    navigator.clipboard.writeText(results.join(', ')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const applyTemplate = (id: string) => {
    const t = getTemplate(id)
    if (!t || t.items.length === 0) return
    setMode('item')
    setItemText(t.items.join('\n'))
  }

  const filteredTpls = useMemo(() => {
    const cat = TEMPLATE_CATEGORIES.find(c => c.id === activeCat)
    return TEMPLATES.filter(t => cat?.templates.includes(t.id) && t.items.length > 0)
  }, [activeCat])

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>모드</label>
        <div className={s.modeRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <button className={`${s.modeBtn} ${mode === 'number' ? s.modeBtnActive : ''}`}
            onClick={() => setMode('number')}>🔢 숫자 추첨</button>
          <button className={`${s.modeBtn} ${mode === 'item' ? s.modeBtnActive : ''}`}
            onClick={() => setMode('item')}>📝 항목 추첨</button>
        </div>
      </div>

      {mode === 'number' && (
        <div className={s.card}>
          <label className={s.cardLabel}>숫자 범위</label>
          <div className={s.rangeRow}>
            <input className={s.numInput} type="number" value={minNum}
              onChange={e => setMinNum(e.target.value)} />
            <span className={s.rangeSep}>~</span>
            <input className={s.numInput} type="number" value={maxNum}
              onChange={e => setMaxNum(e.target.value)} />
          </div>
          <div className={s.miniRow} style={{ marginTop: 10 }}>
            <button className={s.miniBtn} onClick={() => { setMinNum('1'); setMaxNum('45') }}>1~45 (로또)</button>
            <button className={s.miniBtn} onClick={() => { setMinNum('1'); setMaxNum('10') }}>1~10</button>
            <button className={s.miniBtn} onClick={() => { setMinNum('1'); setMaxNum('100') }}>1~100</button>
            <button className={s.miniBtn} onClick={() => { setMinNum('0'); setMaxNum('9') }}>0~9</button>
          </div>
        </div>
      )}

      {mode === 'item' && (
        <>
          <div className={s.card}>
            <label className={s.cardLabel}>
              항목 입력
              <span className={s.cardLabelHint}>줄바꿈·쉼표·번호(&quot;1. 김민수&quot;) 자동 인식</span>
            </label>
            <textarea className={s.textarea}
              placeholder={'김민수\n이지은\n박서준\n최수아\n\n또는: 김민수, 이지은, 박서준'}
              value={itemText} onChange={e => setItemText(e.target.value)} />
            <div className={s.metaRow}>
              <span><strong>{items.length}</strong>개 항목</span>
              {dupes.length > 0 && (
                <span className={s.dupWarn}>
                  ⚠️ 중복: {dupes.join(', ')}
                  <button className={s.miniBtn} style={{ marginLeft: 6 }}
                    onClick={() => setItemText([...new Set(items)].join('\n'))}>
                    중복 제거
                  </button>
                </span>
              )}
            </div>
          </div>

          <div className={s.card}>
            <label className={s.cardLabel}>
              빠른 시작 — 템플릿
              <span className={s.cardLabelHint}>한 번 클릭으로 명단 채우기</span>
            </label>
            <div className={s.catRow}>
              {TEMPLATE_CATEGORIES.map(c => (
                <button key={c.id}
                  className={`${s.catChip} ${activeCat === c.id ? s.catActive : ''}`}
                  onClick={() => setActiveCat(c.id)}>
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
            <div className={s.tplGrid}>
              {filteredTpls.map(t => (
                <button key={t.id} className={s.tplCard} onClick={() => applyTemplate(t.id)}>
                  <div className={s.tplEmoji}>{t.icon}</div>
                  <div className={s.tplName}>{t.name}</div>
                  <div className={s.tplCount}>{t.items.length}개</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className={s.card}>
        <label className={s.cardLabel}>옵션</label>
        <div className={s.miniRow} style={{ marginBottom: 10 }}>
          <span className={s.subLabel} style={{ alignSelf: 'center', margin: 0, marginRight: 8 }}>추첨 개수</span>
          <div className={s.countRow}>
            {[1, 2, 3, 5, 10].map(n => (
              <button key={n}
                className={`${s.countBtn} ${pickCount === String(n) ? s.countActive : ''}`}
                onClick={() => setPickCount(String(n))}>{n}개</button>
            ))}
            <input className={s.numInput} type="number" min={1} max={100}
              style={{ width: 70 }}
              value={pickCount} onChange={e => setPickCount(e.target.value)} />
          </div>
        </div>
        <label className={s.toggleLabel}>
          <input type="checkbox" checked={noRepeat} onChange={e => setNoRepeat(e.target.checked)} />
          중복 제외 (한 번 뽑힌 항목 다시 안 뽑힘)
        </label>
        <label className={s.toggleLabel}>
          <input type="checkbox" checked={sorted} onChange={e => setSorted(e.target.checked)} />
          결과 정렬 (가나다·번호순)
        </label>
      </div>

      <button className={s.bigDraw} onClick={handleDraw}
        disabled={mode === 'item' && items.length === 0}>
        🎲 추첨하기
      </button>

      {results.length > 0 && (
        <>
          <div className={s.resultCard}>
            <div className={s.resultLabel}>🎉 추첨 결과 ({results.length}개)</div>
            {results.length === 1 ? (
              <div className={s.resultBig}>{results[0]}</div>
            ) : (
              <div className={s.resultList}>
                {results.map((r, i) => (
                  <div key={i} className={s.resultRow}>
                    <span className={s.resultRank}>{i + 1}.</span>
                    <span className={s.resultName}>{r}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={s.resultActions}>
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={handleCopy}>
              {copied ? '✓ 복사됨' : '📋 복사'}
            </button>
            <button className={s.copyBtn} onClick={handleDraw}>🔄 다시 추첨</button>
            <button className={s.copyBtn} onClick={() => alert('💡 [룰렛] 탭에서 시각적 효과로 추첨할 수 있어요.')}>
              🎰 룰렛으로
            </button>
          </div>
        </>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 2 — 가중치 추첨 ═════════════════════════════════════════ */
function WeightedTab() {
  const [items, setItems] = useState<{ id: string; name: string; weight: number }[]>([
    { id: newId(), name: '비빔밥', weight: 4 },
    { id: newId(), name: '김치찌개', weight: 3 },
    { id: newId(), name: '파스타', weight: 2 },
    { id: newId(), name: '초밥', weight: 1 },
  ])
  const [pickCount, setPickCount] = useState(1)
  const [allowDup, setAllowDup] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const totalWeight = items.reduce((s, it) => s + Math.max(0, it.weight), 0)
  const valid = items.filter(it => it.name.trim() && it.weight > 0)

  const handleDraw = () => {
    if (valid.length === 0) return
    const wItems: WeightedItem[] = valid.map(it => ({ name: it.name.trim(), weight: it.weight }))
    setResults(pickWithWeights(wItems, pickCount, allowDup))
    setCopied(false)
  }

  const updateItem = (id: string, patch: Partial<{ name: string; weight: number }>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it))
  }
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id))
  }
  const addItem = () => {
    if (items.length >= 30) return
    setItems(prev => [...prev, { id: newId(), name: '', weight: 1 }])
  }

  const handleCopy = () => {
    if (results.length === 0) return
    navigator.clipboard.writeText(results.join(', ')).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    })
  }

  const colors = useMemo(() => genColors(valid.length, 70, 60), [valid.length])

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          항목·가중치
          <span className={s.cardLabelHint}>{items.length}/30 · 총합 {totalWeight}</span>
        </label>
        <div className={s.weightList}>
          {items.map((it, idx) => {
            const pct = totalWeight > 0 ? (it.weight / totalWeight) * 100 : 0
            return (
              <div key={it.id} className={s.weightRow}>
                <input className={s.textInput} type="text" placeholder={`항목 ${idx + 1}`}
                  value={it.name} onChange={e => updateItem(it.id, { name: e.target.value })} />
                <input type="range" className={s.weightSlider} min={1} max={20} step={1}
                  value={Math.min(20, Math.max(1, it.weight))}
                  onChange={e => updateItem(it.id, { weight: parseInt(e.target.value) })} />
                <span className={s.weightPct}>{pct.toFixed(1)}%</span>
                <button className={s.removeBtn} onClick={() => removeItem(it.id)}
                  disabled={items.length <= 2}>×</button>
              </div>
            )
          })}
        </div>
        <button className={s.addItemBtn} onClick={addItem} disabled={items.length >= 30}>
          + 항목 추가
        </button>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>확률 미리보기</label>
        <div className={s.probBars}>
          {valid.map((it, i) => {
            const pct = totalWeight > 0 ? (it.weight / totalWeight) * 100 : 0
            return (
              <div key={it.id} className={s.probRow}>
                <span className={s.probName}>{it.name || '—'} (×{it.weight})</span>
                <span className={s.probTrack}>
                  <span className={s.probFill} style={{ width: `${pct}%`, background: colors[i] }} />
                </span>
                <span className={s.probValue}>{pct.toFixed(1)}%</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>옵션</label>
        <div className={s.miniRow}>
          <span className={s.subLabel} style={{ alignSelf: 'center', margin: 0, marginRight: 8 }}>뽑기 개수</span>
          <div className={s.countRow}>
            {[1, 2, 3, 5].map(n => (
              <button key={n}
                className={`${s.countBtn} ${pickCount === n ? s.countActive : ''}`}
                onClick={() => setPickCount(n)}>{n}개</button>
            ))}
          </div>
        </div>
        <label className={s.toggleLabel} style={{ marginTop: 10 }}>
          <input type="checkbox" checked={allowDup} onChange={e => setAllowDup(e.target.checked)} />
          중복 허용 (같은 항목이 여러 번 뽑힐 수 있음)
        </label>
      </div>

      <button className={s.bigDraw} onClick={handleDraw} disabled={valid.length === 0}>
        🎯 가중치 추첨
      </button>

      {results.length > 0 && (
        <>
          <div className={s.resultCard}>
            <div className={s.resultLabel}>🎉 가중치 추첨 결과</div>
            {results.length === 1 ? (
              <div className={s.resultBig}>{results[0]}</div>
            ) : (
              <div className={s.resultList}>
                {results.map((r, i) => (
                  <div key={i} className={s.resultRow}>
                    <span className={s.resultRank}>{i + 1}.</span>
                    <span className={s.resultName}>{r}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={s.resultActions}>
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={handleCopy}>
              {copied ? '✓ 복사됨' : '📋 복사'}
            </button>
            <button className={s.copyBtn} onClick={handleDraw}>🔄 다시 추첨</button>
            <button className={s.copyBtn} onClick={() => alert('💡 [공정성 검증] 탭에서 1,000~100,000회 시뮬레이션으로 분포를 확인할 수 있습니다.')}>
              📊 공정성 검증
            </button>
          </div>
        </>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 3 — 룰렛 ═════════════════════════════════════════ */
function RouletteTab() {
  const [items, setItems] = useState<{ id: string; name: string; weight: number }[]>([
    { id: newId(), name: '김치찌개', weight: 1 },
    { id: newId(), name: '파스타',   weight: 1 },
    { id: newId(), name: '비빔밥',   weight: 1 },
    { id: newId(), name: '초밥',     weight: 1 },
    { id: newId(), name: '치킨',     weight: 1 },
    { id: newId(), name: '피자',     weight: 1 },
  ])
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)

  const valid = items.filter(it => it.name.trim() && it.weight > 0)
  const total = valid.reduce((s, it) => s + it.weight, 0)
  const colors = useMemo(() => genColors(valid.length, 75, 58), [valid.length])

  const updateItem = (id: string, patch: Partial<{ name: string; weight: number }>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it))
  }
  const removeItem = (id: string) => setItems(prev => prev.filter(it => it.id !== id))
  const addItem = () => {
    if (items.length >= 16) return
    setItems(prev => [...prev, { id: newId(), name: '', weight: 1 }])
  }

  const handleSpin = () => {
    if (valid.length < 2 || spinning) return
    const wItems: WeightedItem[] = valid.map(it => ({ name: it.name, weight: it.weight }))
    const idx = pickWeightedIndex(wItems)
    const targetAngle = calcRouletteAngle(wItems, idx, 5)
    // 누적 회전 (이전 + 새 회전)
    setRotation(prev => prev + targetAngle)
    setWinner(null)
    setSpinning(true)
    setTimeout(() => {
      setWinner(wItems[idx].name)
      setSpinning(false)
    }, 4000)
  }

  /* SVG slices 계산 */
  const slices = useMemo(() => {
    if (total === 0 || valid.length === 0) return []
    const r = 140
    let cum = 0
    return valid.map((it, i) => {
      const sweep = (it.weight / total) * 360
      const start = cum
      const end = cum + sweep
      cum = end
      const path = describePieSlice(150, 150, r, start, end)
      const midAngle = start + sweep / 2
      const labelX = 150 + (r * 0.6) * Math.cos(((midAngle - 90) * Math.PI) / 180)
      const labelY = 150 + (r * 0.6) * Math.sin(((midAngle - 90) * Math.PI) / 180)
      const labelRotation = midAngle > 180 ? midAngle - 180 : midAngle
      return { ...it, path, color: colors[i], labelX, labelY, labelRotation, midAngle }
    })
  }, [valid, total, colors])

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          항목 (최대 16개)
          <span className={s.cardLabelHint}>{items.length}/16 · 가중치 큰 칸이 더 큼</span>
        </label>
        <div className={s.weightList}>
          {items.map((it, idx) => (
            <div key={it.id} className={s.weightRow}>
              <input className={s.textInput} type="text" placeholder={`항목 ${idx + 1}`}
                value={it.name} onChange={e => updateItem(it.id, { name: e.target.value })} />
              <input type="range" className={s.weightSlider} min={1} max={10} step={1}
                value={Math.min(10, Math.max(1, it.weight))}
                onChange={e => updateItem(it.id, { weight: parseInt(e.target.value) })} />
              <span className={s.weightPct} style={{ color: '#FF6B6B' }}>×{it.weight}</span>
              <button className={s.removeBtn} onClick={() => removeItem(it.id)}
                disabled={items.length <= 2}>×</button>
            </div>
          ))}
        </div>
        <button className={s.addItemBtn} onClick={addItem} disabled={items.length >= 16}>
          + 항목 추가
        </button>
      </div>

      <div className={s.rouletteWrap}>
        <div className={s.rouletteArrow} />
        <svg viewBox="0 0 300 300" className={s.rouletteSvg}
          style={{ transform: `rotate(${rotation}deg)` }} aria-hidden="true">
          {slices.map((sl, i) => (
            <g key={i}>
              <path d={sl.path} fill={sl.color} stroke="#0a0a2e" strokeWidth={2} />
              {sl.name && (
                <text x={sl.labelX} y={sl.labelY} textAnchor="middle" dominantBaseline="middle"
                  className={s.sliceText}
                  transform={`rotate(${sl.midAngle - 90} ${sl.labelX} ${sl.labelY})`}>
                  {sl.name.length > 6 ? sl.name.slice(0, 6) + '…' : sl.name}
                </text>
              )}
            </g>
          ))}
          <circle cx={150} cy={150} r={14} className={s.rouletteHub} />
        </svg>
        <button className={s.bigDraw} onClick={handleSpin} disabled={spinning || valid.length < 2}>
          {spinning ? '🌀 회전 중...' : '🎰 룰렛 돌리기'}
        </button>
      </div>

      {winner && (
        <div className={s.rouletteResult}>
          <div className={s.rouletteResultLabel}>🎉 결과 발표</div>
          <div className={s.rouletteResultName}>{winner}</div>
          <div className={s.resultActions} style={{ marginTop: 16 }}>
            <button className={s.copyBtn}
              onClick={() => navigator.clipboard.writeText(winner)}>📋 복사</button>
            <button className={s.copyBtn} onClick={handleSpin}>🔄 다시 돌리기</button>
            <button className={s.copyBtn} onClick={() => setWinner(null)}>✕ 닫기</button>
          </div>
        </div>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 4 — 팀 나누기 ═════════════════════════════════════════ */
function TeamTab() {
  const [namesText, setNamesText] = useState('김민수\n이지은\n박서준\n최수아\n정현우\n강하늘\n조민지\n윤도현')
  const [splitMode, setSplitMode] = useState<'count' | 'size'>('count')
  const [teamCount, setTeamCount] = useState(2)
  const [teamSize, setTeamSize] = useState(4)
  const [keepTogetherText, setKeepTogetherText] = useState('')
  const [keepApartText, setKeepApartText] = useState('')
  const [leadersText, setLeadersText] = useState('')
  const [teams, setTeams] = useState<string[][]>([])
  const [copied, setCopied] = useState(false)

  const names = parseNamesText(namesText)
  const dupes = detectDuplicates(names)
  const colors = useMemo(() => genColors(Math.max(2, teams.length || teamCount), 70, 60), [teams.length, teamCount])

  const parseGroupLines = (txt: string): string[][] =>
    txt.split('\n').map(line => parseNamesText(line)).filter(g => g.length > 0)

  const handleDraw = () => {
    if (names.length === 0) return
    const opts = {
      teamCount: splitMode === 'count' ? teamCount : undefined,
      teamSize: splitMode === 'size' ? teamSize : undefined,
      keepTogether: keepTogetherText ? parseGroupLines(keepTogetherText) : undefined,
      keepApart: keepApartText ? parseGroupLines(keepApartText) : undefined,
      leaders: leadersText ? parseNamesText(leadersText) : undefined,
    }
    setTeams(divideIntoTeams(names, opts))
    setCopied(false)
  }

  const handleCopy = () => {
    if (teams.length === 0) return
    const text = teams.map((team, i) =>
      `${String.fromCharCode(65 + i)}팀 (${team.length}명)\n${team.map((m, j) =>
        leadersText.split(',').map(s => s.trim()).includes(m) || j === 0 && leadersText.includes(m) ? `⭐ ${m}` : `· ${m}`
      ).join('\n')}`
    ).join('\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    })
  }

  const leaderSet = new Set(parseNamesText(leadersText))

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          참가자 명단
          <span className={s.cardLabelHint}>{names.length}명{dupes.length > 0 && ' · ⚠️ 중복'}</span>
        </label>
        <textarea className={s.textarea} value={namesText} onChange={e => setNamesText(e.target.value)} />
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>분배 방식</label>
        <div className={s.modeRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <button className={`${s.modeBtn} ${splitMode === 'count' ? s.modeBtnActive : ''}`}
            onClick={() => setSplitMode('count')}>팀 수 지정</button>
          <button className={`${s.modeBtn} ${splitMode === 'size' ? s.modeBtnActive : ''}`}
            onClick={() => setSplitMode('size')}>팀당 인원 지정</button>
        </div>
        <div style={{ marginTop: 10 }}>
          {splitMode === 'count' ? (
            <div className={s.countRow}>
              <span className={s.subLabel} style={{ alignSelf: 'center', margin: 0, marginRight: 8 }}>팀 수</span>
              {[2, 3, 4, 5, 6].map(n => (
                <button key={n}
                  className={`${s.countBtn} ${teamCount === n ? s.countActive : ''}`}
                  onClick={() => setTeamCount(n)}>{n}팀</button>
              ))}
            </div>
          ) : (
            <div className={s.countRow}>
              <span className={s.subLabel} style={{ alignSelf: 'center', margin: 0, marginRight: 8 }}>팀당</span>
              {[2, 3, 4, 5, 6].map(n => (
                <button key={n}
                  className={`${s.countBtn} ${teamSize === n ? s.countActive : ''}`}
                  onClick={() => setTeamSize(n)}>{n}명</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>고급 옵션 (선택)</label>
        <span className={s.subLabel}>같이 묶을 사람 (한 줄에 한 그룹, 쉼표 구분)</span>
        <textarea className={s.textarea} style={{ minHeight: 60 }}
          placeholder={'김민수, 이지은\n박서준, 최수아'}
          value={keepTogetherText} onChange={e => setKeepTogetherText(e.target.value)} />
        <span className={s.subLabel} style={{ marginTop: 10 }}>떨어뜨릴 사람 (한 줄에 한 그룹)</span>
        <textarea className={s.textarea} style={{ minHeight: 60 }}
          placeholder={'정현우, 강하늘'}
          value={keepApartText} onChange={e => setKeepApartText(e.target.value)} />
        <span className={s.subLabel} style={{ marginTop: 10 }}>각 팀 리더 (1팀 1명, 쉼표 구분)</span>
        <input className={s.textInput} type="text"
          placeholder="김민수, 이지은, 박서준"
          value={leadersText} onChange={e => setLeadersText(e.target.value)} />
      </div>

      <button className={s.bigDraw} onClick={handleDraw} disabled={names.length === 0}>
        👥 팀 나누기
      </button>

      {teams.length > 0 && (
        <>
          <div className={s.teamGrid}>
            {teams.map((team, i) => (
              <div key={i} className={s.teamCard} style={{ borderLeftColor: colors[i] }}>
                <div className={s.teamHeader}>
                  <span className={s.teamName}>{String.fromCharCode(65 + i)}팀</span>
                  <span className={s.teamCount}>{team.length}명</span>
                </div>
                <div className={s.teamMembers}>
                  {team.map((m, j) => (
                    <div key={j} className={`${s.teamMember} ${leaderSet.has(m) ? s.teamLeader : ''}`}>
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={s.resultActions}>
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={handleCopy}>
              {copied ? '✓ 복사됨' : '📋 텍스트 복사'}
            </button>
            <button className={s.copyBtn} onClick={handleDraw}>🔄 다시 섞기</button>
            <button className={s.copyBtn} onClick={() => setTeams([])}>✕ 닫기</button>
          </div>
        </>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 5 — 순서·자리 ═════════════════════════════════════════ */
function OrderTab() {
  const [mode, setMode] = useState<'order' | 'seat'>('order')
  const [namesText, setNamesText] = useState('김민수\n이지은\n박서준\n최수아\n정현우\n강하늘')
  // order
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [excludedText, setExcludedText] = useState('')
  // seat
  const [rows, setRows] = useState(4)
  const [cols, setCols] = useState(6)
  const [keepApartText, setKeepApartText] = useState('')
  // results
  const [order, setOrder] = useState<string[] | null>(null)
  const [seats, setSeats] = useState<(string | null)[][] | null>(null)
  const [copied, setCopied] = useState(false)

  const names = parseNamesText(namesText)

  const handleOrder = () => {
    const fixed: { name: string; position: number | 'last' }[] = []
    if (firstName.trim()) fixed.push({ name: firstName.trim(), position: 1 })
    if (lastName.trim())  fixed.push({ name: lastName.trim(), position: 'last' })
    const excluded = parseNamesText(excludedText)
    setOrder(arrangeOrder(names, { fixed, excluded }))
    setSeats(null)
    setCopied(false)
  }
  const handleSeat = () => {
    const apart = keepApartText
      ? keepApartText.split('\n').map(l => parseNamesText(l)).filter(g => g.length > 0)
      : undefined
    setSeats(arrangeSeats(names, { rows, cols, keepApart: apart }))
    setOrder(null)
    setCopied(false)
  }

  const handleCopy = () => {
    let text = ''
    if (order) {
      text = `📋 발표 순서\n` + order.map((n, i) => `${i + 1}. ${n}`).join('\n')
    } else if (seats) {
      text = `💺 자리 배치 (${rows}×${cols})\n` +
        seats.map(row => row.map(c => c ?? '·').join('\t')).join('\n')
    }
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    })
  }

  const fixedSet = new Set([firstName.trim(), lastName.trim()].filter(Boolean))

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>모드</label>
        <div className={s.orderModeRow}>
          <button className={`${s.orderModeBtn} ${mode === 'order' ? s.orderModeActive : ''}`}
            onClick={() => setMode('order')}>📋 발표 순서</button>
          <button className={`${s.orderModeBtn} ${mode === 'seat' ? s.orderModeActive : ''}`}
            onClick={() => setMode('seat')}>💺 자리 배치</button>
        </div>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>
          참가자 명단
          <span className={s.cardLabelHint}>{names.length}명</span>
        </label>
        <textarea className={s.textarea} value={namesText} onChange={e => setNamesText(e.target.value)} />
      </div>

      {mode === 'order' && (
        <div className={s.card}>
          <label className={s.cardLabel}>고정 순서 (선택)</label>
          <div className={s.fieldRow}>
            <div>
              <span className={s.subLabel}>1번 (맨 처음)</span>
              <input className={s.textInput} type="text" placeholder="(선택)"
                value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div>
              <span className={s.subLabel}>마지막</span>
              <input className={s.textInput} type="text" placeholder="(선택)"
                value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>
          <span className={s.subLabel} style={{ marginTop: 10 }}>제외할 사람 (선택)</span>
          <input className={s.textInput} type="text" placeholder="이름들 (쉼표 구분)"
            value={excludedText} onChange={e => setExcludedText(e.target.value)} />
        </div>
      )}

      {mode === 'seat' && (
        <div className={s.card}>
          <label className={s.cardLabel}>자리 크기 ({rows} × {cols} = {rows * cols}자리)</label>
          <div className={s.fieldRow}>
            <div>
              <span className={s.subLabel}>행</span>
              <input className={s.numInput} type="number" min={1} max={20}
                value={rows} onChange={e => setRows(Math.max(1, parseInt(e.target.value) || 1))} />
            </div>
            <div>
              <span className={s.subLabel}>열</span>
              <input className={s.numInput} type="number" min={1} max={20}
                value={cols} onChange={e => setCols(Math.max(1, parseInt(e.target.value) || 1))} />
            </div>
          </div>
          <span className={s.subLabel} style={{ marginTop: 10 }}>떨어뜨릴 사람 (인접 X · 한 줄에 한 그룹)</span>
          <textarea className={s.textarea} style={{ minHeight: 60 }}
            placeholder={'철수, 영희\n민수, 지은'}
            value={keepApartText} onChange={e => setKeepApartText(e.target.value)} />
        </div>
      )}

      <button className={s.bigDraw} onClick={mode === 'order' ? handleOrder : handleSeat}
        disabled={names.length === 0}>
        {mode === 'order' ? '📋 순서 추첨' : '💺 자리 배치'}
      </button>

      {order && (
        <>
          <div className={s.card}>
            <label className={s.cardLabel}>📋 발표 순서</label>
            <div className={s.orderList}>
              {order.map((n, i) => {
                const fixed = fixedSet.has(n)
                return (
                  <div key={i} className={`${s.orderRow} ${fixed ? s.orderRowFixed : ''}`}>
                    <span className={s.orderRank}>{i + 1}.</span>
                    <span className={s.orderName}>
                      {n}
                      {fixed && i === 0 && <small>고정 1번</small>}
                      {fixed && i === order.length - 1 && <small>고정 마지막</small>}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className={s.resultActions}>
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={handleCopy}>
              {copied ? '✓ 복사됨' : '📋 복사'}
            </button>
            <button className={s.copyBtn} onClick={handleOrder}>🔄 다시 섞기</button>
            <button className={s.copyBtn} onClick={() => setOrder(null)}>✕ 닫기</button>
          </div>
        </>
      )}

      {seats && (
        <>
          <div className={s.card}>
            <label className={s.cardLabel}>💺 자리 배치 ({rows} × {cols})</label>
            <div className={s.seatGrid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {seats.map((row, r) => row.map((cell, c) => (
                <div key={`${r}-${c}`}
                  className={`${s.seatCell} ${!cell ? s.seatCellEmpty : ''}`}
                  title={cell ?? `${r + 1}행 ${c + 1}열 (비어있음)`}>
                  {cell ?? '—'}
                </div>
              )))}
            </div>
          </div>
          <div className={s.resultActions}>
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={handleCopy}>
              {copied ? '✓ 복사됨' : '📋 복사'}
            </button>
            <button className={s.copyBtn} onClick={handleSeat}>🔄 다시 섞기</button>
            <button className={s.copyBtn} onClick={() => setSeats(null)}>✕ 닫기</button>
          </div>
        </>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 6 — 공정성 검증 ═════════════════════════════════════════ */
function FairnessTab() {
  const [items, setItems] = useState<{ id: string; name: string; weight: number }[]>([
    { id: newId(), name: 'A', weight: 1 },
    { id: newId(), name: 'B', weight: 1 },
    { id: newId(), name: 'C', weight: 1 },
    { id: newId(), name: 'D', weight: 1 },
  ])
  const [trials, setTrials] = useState(1000)
  const [results, setResults] = useState<FairnessRow[] | null>(null)
  const [running, setRunning] = useState(false)

  const updateItem = (id: string, patch: Partial<{ name: string; weight: number }>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it))
  }
  const removeItem = (id: string) => setItems(prev => prev.filter(it => it.id !== id))
  const addItem = () => {
    if (items.length >= 20) return
    setItems(prev => [...prev, { id: newId(), name: String.fromCharCode(65 + prev.length), weight: 1 }])
  }

  const valid = items.filter(it => it.name.trim() && it.weight > 0)

  const handleRun = () => {
    if (valid.length < 2) return
    setRunning(true)
    setTimeout(() => {
      const wItems: WeightedItem[] = valid.map(it => ({ name: it.name, weight: it.weight }))
      setResults(simulateFairness(wItems, trials))
      setRunning(false)
    }, 50)
  }

  const totalWeight = valid.reduce((s, it) => s + it.weight, 0)
  const maxBar = results ? Math.max(...results.map(r => Math.max(r.actualPct, r.expectedPct))) : 0

  const devClass = (d: number) => {
    const abs = Math.abs(d)
    if (abs < 5) return s.devSmall
    if (abs < 15) return s.devMid
    return s.devLarge
  }

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          항목·가중치
          <span className={s.cardLabelHint}>총합 {totalWeight}</span>
        </label>
        <div className={s.weightList}>
          {items.map((it, idx) => {
            const expected = totalWeight > 0 ? (it.weight / totalWeight) * 100 : 0
            return (
              <div key={it.id} className={s.weightRow}>
                <input className={s.textInput} type="text" placeholder={`항목 ${idx + 1}`}
                  value={it.name} onChange={e => updateItem(it.id, { name: e.target.value })} />
                <input type="range" className={s.weightSlider} min={1} max={20} step={1}
                  value={Math.min(20, Math.max(1, it.weight))}
                  onChange={e => updateItem(it.id, { weight: parseInt(e.target.value) })} />
                <span className={s.weightPct} style={{ color: '#3EFF9B' }}>{expected.toFixed(1)}%</span>
                <button className={s.removeBtn} onClick={() => removeItem(it.id)}
                  disabled={items.length <= 2}>×</button>
              </div>
            )
          })}
        </div>
        <button className={s.addItemBtn} onClick={addItem} disabled={items.length >= 20}>
          + 항목 추가
        </button>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>시뮬레이션 횟수</label>
        <div className={s.simRow}>
          {[100, 1000, 10000, 100000].map(n => (
            <button key={n}
              className={`${s.simBtn} ${trials === n ? s.simActive : ''}`}
              onClick={() => setTrials(n)}>
              {n.toLocaleString()}회
            </button>
          ))}
        </div>
      </div>

      <button className={s.bigDraw} onClick={handleRun}
        disabled={running || valid.length < 2}>
        {running ? '시뮬레이션 중...' : `📊 ${trials.toLocaleString()}회 시뮬레이션`}
      </button>

      {results && (
        <>
          <div className={s.card}>
            <label className={s.cardLabel}>
              시뮬레이션 결과
              <span className={s.cardLabelHint}>{trials.toLocaleString()}회</span>
            </label>
            <div className={s.fairTable}>
              <div className={s.fairRow} style={{ background: 'transparent', borderColor: 'transparent', fontWeight: 700, fontSize: 11, color: 'var(--muted)' }}>
                <span>항목 (가중치)</span>
                <span style={{ textAlign: 'right' }}>기대</span>
                <span style={{ textAlign: 'right' }}>실제</span>
                <span style={{ textAlign: 'right' }}>편차</span>
              </div>
              {results.map(r => (
                <div key={r.name} className={s.fairRow}>
                  <span className={s.fairName}>{r.name} (×{r.weight})</span>
                  <span className={s.fairExpected}>
                    {r.expected}회<br /><small>{r.expectedPct.toFixed(1)}%</small>
                  </span>
                  <span className={s.fairActual}>
                    {r.actual}회<br /><small>{r.actualPct.toFixed(1)}%</small>
                  </span>
                  <span className={`${s.fairDeviation} ${devClass(r.deviation)}`}>
                    {r.deviation >= 0 ? '+' : ''}{r.deviation}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <label className={s.cardLabel}>실제 vs 기대 비율</label>
            <div className={s.fairBars}>
              {results.map(r => (
                <div key={r.name} className={s.fairBarRow}>
                  <span className={s.fairName}>{r.name}</span>
                  <span className={s.fairBarTrack}>
                    <span className={s.fairBarFill}
                      style={{ width: `${maxBar > 0 ? (r.actualPct / maxBar) * 100 : 0}%` }} />
                    <span className={s.fairBarMark}
                      style={{ left: `${maxBar > 0 ? (r.expectedPct / maxBar) * 100 : 0}%` }}
                      title="기대 비율" />
                  </span>
                  <span className={s.weightPct} style={{ color: '#3EFF9B' }}>
                    {r.actualPct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>
              ⓘ 흰색 마커는 <strong style={{ color: 'var(--text)' }}>기대 비율</strong>, 초록 막대는 <strong style={{ color: '#3EFF9B' }}>실제 비율</strong>입니다.
            </p>
          </div>

          <div className={s.fairExplain}>
            💡 <strong>큰 수의 법칙 (Law of Large Numbers)</strong> — 시행 횟수가 많을수록 실제 비율이 기대 확률에 수렴합니다.
            <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
              <li><strong>100회</strong>: 편차 ±10% (작은 표본은 변동 큼)</li>
              <li><strong>1,000회</strong>: 편차 ±2~3% (상당히 균등)</li>
              <li><strong>10,000회</strong>: 편차 ±1% 미만</li>
              <li><strong>100,000회</strong>: 편차 ±0.5% 미만 (거의 이론값)</li>
            </ul>
            본 도구의 <strong>Math.random() 의사난수</strong>는 1,000회 이상에서 매우 균등한 분포를 보입니다.
          </div>
        </>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 저장된 명단 ═════════════════════════════════════════ */
function SavedListsSection() {
  const [lists, setLists] = useState<SavedList[]>([])
  const [loaded, setLoaded] = useState(false)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [showForm, setShowForm] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => { setLists(loadLists()); setLoaded(true) }, [])

  const handleSave = () => {
    if (!name.trim()) { alert('명단 이름을 입력해 주세요'); return }
    const items = parseNamesText(text)
    if (items.length === 0) { alert('명단을 1개 이상 입력해 주세요'); return }
    const now = new Date().toISOString()
    const next = [...lists, {
      id: newId(),
      name: name.trim(),
      items,
      createdAt: now,
      updatedAt: now,
    }]
    setLists(next)
    saveLists(next)
    setShowForm(false)
    setName(''); setText('')
  }
  const handleDelete = (id: string) => {
    if (!confirm('이 명단을 삭제하시겠습니까?')) return
    const next = lists.filter(l => l.id !== id)
    setLists(next)
    saveLists(next)
  }
  const handleCopy = (l: SavedList) => {
    navigator.clipboard.writeText(l.items.join('\n'))
  }

  if (!loaded) return null

  return (
    <div className={s.card}>
      <label className={s.cardLabel}>
        💾 저장된 명단
        <span className={s.cardLabelHint}>{lists.length}/30 · 클립보드 복사 후 다른 탭에 붙여넣기</span>
      </label>

      {!showForm && (
        <button className={s.actionBtn} onClick={() => setShowForm(true)}>
          + 새 명단 저장
        </button>
      )}

      {showForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
          <input className={s.textInput} type="text" placeholder="명단 이름 (예: 우리 동아리)"
            value={name} onChange={e => setName(e.target.value)} />
          <textarea className={s.textarea} style={{ minHeight: 100 }}
            placeholder={'김민수\n이지은\n박서준'}
            value={text} onChange={e => setText(e.target.value)} />
          <div className={s.miniRow}>
            <button className={s.actionBtn} style={{ width: 'auto', flex: 1 }} onClick={handleSave}>저장</button>
            <button className={s.miniBtn} onClick={() => setShowForm(false)}>취소</button>
          </div>
        </div>
      )}

      {lists.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
          {lists.map(l => (
            <div key={l.id} className={s.savedRow}>
              <div className={s.savedName}>
                {l.name}
                <small>{l.items.length}명 · {new Date(l.updatedAt).toLocaleDateString('ko-KR')}</small>
              </div>
              <div className={s.miniRow}>
                <button className={s.miniBtn} onClick={() => handleCopy(l)}>📋 복사</button>
                <button className={`${s.miniBtn} ${s.miniDanger}`} onClick={() => handleDelete(l.id)}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input ref={fileRef} type="file" accept=".json" hidden />
    </div>
  )
}
