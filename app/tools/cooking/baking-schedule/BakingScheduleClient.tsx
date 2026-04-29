/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './baking-schedule.module.css'
import {
  BREAD_PRESETS, FERMENTATION_MODES, MIXING_METHODS,
  type BreadDifficulty, type FermentationMode, type MixingMethod,
} from './breadPresets'
import {
  generateForwardSchedule, generateBackwardSchedule,
  fmtTime, fmtDateTimeKo, fmtDuration, dayDiffLabel, getTempInfo,
  loadRecipes, saveRecipes, newRecipeId, parseDateTimeLocal, toDateTimeLocal,
  calcWaterTemp, seasonalWaterGuide,
  type ScheduleResult, type ScheduleStep, type SavedRecipe,
} from './bakingUtils'

type Tab = 'forward' | 'backward' | 'preset' | 'recipe'

function diffBadgeClass(d: BreadDifficulty): string {
  if (d === '초급')   return s.diffEasy
  if (d === '초중급') return s.diffEasy
  if (d === '중급')   return s.diffMid
  if (d === '중상급') return s.diffHard
  return s.diffExpert
}

/* ═════════════════════════════════════════ Main ═════════════════════════════════════════ */
export default function BakingScheduleClient() {
  const [tab, setTab] = useState<Tab>('forward')

  /* 공통 상태 — 빵·발효·온도 */
  const [presetId, setPresetId] = useState('sourdough')
  const [fermentationMode, setFermentationMode] = useState<FermentationMode>('cold-final')
  const [roomTempC, setRoomTempC] = useState(22)
  const [includeOptional, setIncludeOptional] = useState(true)

  /* DDT (반죽 최종 온도) — 고급 옵션 */
  const [ddtEnabled, setDdtEnabled] = useState(false)
  const [targetDoughC, setTargetDoughC] = useState(25)   // 빵 변경 시 자동 갱신
  const [flourTempC, setFlourTempC] = useState<number | null>(null)  // null = 실내 온도 따라감
  const [levainTempC, setLevainTempC] = useState<number | null>(null)
  const [mixingMethod, setMixingMethod] = useState<MixingMethod>('hand')

  // 빵 변경 시 권장 반죽 온도 자동 적용
  useEffect(() => {
    const bp = BREAD_PRESETS.find(p => p.id === presetId)
    if (bp?.ddtTargetC) setTargetDoughC(bp.ddtTargetC)
  }, [presetId])

  const ddtProps = {
    ddtEnabled, setDdtEnabled,
    targetDoughC, setTargetDoughC,
    flourTempC, setFlourTempC,
    levainTempC, setLevainTempC,
    mixingMethod, setMixingMethod,
  }

  return (
    <div className={s.wrap}>
      <div className={s.disclaimer}>
        💡 <strong>표시되는 시간은 표준 레시피 기준 예상 일정입니다.</strong> 발효는 시간보다 <strong>반죽 상태</strong>가 우선입니다 — 부피 50~70% 증가, 큰 기포 형성, 손가락 자국 회복 속도를 함께 확인하세요. 본 도구는 참고용 가이드입니다.
      </div>

      <div className={s.tabs}>
        {([
          ['forward',  '시작 시간 기준'],
          ['backward', '완성 시간 역산'],
          ['preset',   '빵별 프리셋'],
          ['recipe',   '내 레시피'],
        ] as [Tab, string][]).map(([key, label]) => {
          const cls =
            tab !== key ? '' :
            key === 'backward' ? s.tabActiveBack :
            key === 'preset'   ? s.tabActivePreset :
            key === 'recipe'   ? s.tabActiveRecipe : s.tabActive
          return (
            <button key={key} className={`${s.tabBtn} ${cls}`} onClick={() => setTab(key)}>
              {label}
            </button>
          )
        })}
      </div>

      {tab === 'forward'  && <ForwardTab  presetId={presetId} setPresetId={setPresetId}
                                           fermentationMode={fermentationMode} setFermentationMode={setFermentationMode}
                                           roomTempC={roomTempC} setRoomTempC={setRoomTempC}
                                           includeOptional={includeOptional} setIncludeOptional={setIncludeOptional}
                                           {...ddtProps} />}
      {tab === 'backward' && <BackwardTab presetId={presetId} setPresetId={setPresetId}
                                           fermentationMode={fermentationMode} setFermentationMode={setFermentationMode}
                                           roomTempC={roomTempC} setRoomTempC={setRoomTempC}
                                           includeOptional={includeOptional} setIncludeOptional={setIncludeOptional}
                                           {...ddtProps} />}
      {tab === 'preset'   && <PresetTab onApply={(id) => { setPresetId(id); setTab('forward') }} />}
      {tab === 'recipe'   && <RecipeTab onApply={(r) => {
        setPresetId(r.presetId)
        setFermentationMode(r.fermentationMode)
        setRoomTempC(r.roomTempC)
        setIncludeOptional(r.includeOptional)
        setTab('forward')
      }} currentSettings={{
        presetId, fermentationMode, roomTempC, includeOptional,
      }} />}
    </div>
  )
}

/* ─── 공통 입력 그룹 ─── */
type CommonInputsProps = {
  presetId: string
  setPresetId: (id: string) => void
  fermentationMode: FermentationMode
  setFermentationMode: (m: FermentationMode) => void
  roomTempC: number
  setRoomTempC: (n: number) => void
  includeOptional: boolean
  setIncludeOptional: (b: boolean) => void
  /* DDT */
  ddtEnabled: boolean
  setDdtEnabled: (b: boolean) => void
  targetDoughC: number
  setTargetDoughC: (n: number) => void
  flourTempC: number | null
  setFlourTempC: (n: number | null) => void
  levainTempC: number | null
  setLevainTempC: (n: number | null) => void
  mixingMethod: MixingMethod
  setMixingMethod: (m: MixingMethod) => void
}

function CommonInputs(p: CommonInputsProps) {
  const tempInfo = getTempInfo(p.roomTempC)
  const tempCls =
    tempInfo.band === 'cold'   ? s.tempCold :
    tempInfo.band === 'normal' ? s.tempNormal :
    tempInfo.band === 'fast'   ? s.tempFast :
    s.tempDanger

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          빵 종류
          <span className={s.cardLabelHint}>8가지 표준 일정</span>
        </label>
        <div className={s.breadGrid}>
          {BREAD_PRESETS.map(bp => (
            <button key={bp.id} className={`${s.breadCard} ${p.presetId === bp.id ? s.breadCardActive : ''}`}
              onClick={() => p.setPresetId(bp.id)}>
              <div className={s.breadCardEmoji}>{bp.icon}</div>
              <div className={s.breadCardName}>{bp.name.split(' ')[0]}</div>
              <div className={s.breadCardMeta}>약 {bp.totalTimeHours}시간</div>
              <span className={`${s.diffBadge} ${diffBadgeClass(bp.difficulty)}`}>{bp.difficulty}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>발효 방식</label>
        <div className={s.fermRow}>
          {FERMENTATION_MODES.map(m => (
            <button key={m.id} className={`${s.fermBtn} ${p.fermentationMode === m.id ? s.fermActive : ''}`}
              onClick={() => p.setFermentationMode(m.id)}>
              <strong>{m.name}</strong>
              <small>{m.desc}</small>
            </button>
          ))}
        </div>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>
          실내 온도
          <span className={s.cardLabelHint}>1차·2차 발효 시간 보정</span>
        </label>
        <div className={s.tempBox}>
          <div className={s.tempRow}>
            <span className={s.tempLabelMin}>16℃</span>
            <input type="range" className={s.tempSlider} min={16} max={32} step={1}
              value={p.roomTempC} onChange={e => p.setRoomTempC(Number(e.target.value))} />
            <span className={s.tempValue}>{p.roomTempC}℃</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span className={s.tempLabelMin}>차가움</span>
            <span className={s.tempLabelMax}>32℃ 더움</span>
          </div>
          <div className={`${s.tempInfo} ${tempCls}`}>
            <strong>{tempInfo.warning}</strong> · 1차·2차 발효 시간 ×{tempInfo.multiplier}배
          </div>
        </div>
      </div>

      <div className={s.card}>
        <label className={s.toggleLabel}>
          <input type="checkbox" checked={p.includeOptional}
            onChange={e => p.setIncludeOptional(e.target.checked)} />
          오토리즈 등 선택적 단계 포함
        </label>
      </div>

      {/* 고급 옵션 — DDT 토글 */}
      <button className={s.advancedToggle} onClick={() => p.setDdtEnabled(!p.ddtEnabled)} type="button">
        {p.ddtEnabled ? '— ' : '+ '}
        <strong>고급 옵션:</strong> 반죽 온도 정밀 계산 (DDT)
        <span style={{ marginLeft: 6, color: 'var(--muted)', fontSize: 11 }}>
          {p.ddtEnabled ? '닫기' : '권장 물 온도 자동 산출'}
        </span>
      </button>

      {p.ddtEnabled && <DDTPanel {...p} />}
    </>
  )
}

/* ═════════════════════════════════════════ DDT 패널 ═════════════════════════════════════════ */
function DDTPanel(p: CommonInputsProps) {
  const preset = BREAD_PRESETS.find(b => b.id === p.presetId)
  const hasLevain = !!preset?.hasLevain
  const flourC = p.flourTempC ?? p.roomTempC
  const levainC = p.levainTempC ?? p.roomTempC

  const result = calcWaterTemp({
    targetDoughC: p.targetDoughC,
    flourTempC: flourC,
    roomTempC: p.roomTempC,
    levainTempC: hasLevain ? levainC : undefined,
    hasLevain,
    mixingMethod: p.mixingMethod,
  })

  const season = seasonalWaterGuide(p.roomTempC)

  const bandClass =
    result.band === 'frozen' ? s.ddtBandFrozen :
    result.band === 'cold'   ? s.ddtBandCold :
    result.band === 'normal' ? s.ddtBandNormal :
    result.band === 'warm'   ? s.ddtBandWarm :
    s.ddtBandHot

  const formula = hasLevain
    ? `물 온도 = 목표 ${p.targetDoughC} × 4 − 밀가루 ${flourC} − 실내 ${p.roomTempC} − 르방 ${levainC} − 마찰 ${result.friction}\n        = ${result.waterTempC}℃`
    : `물 온도 = 목표 ${p.targetDoughC} × 3 − 밀가루 ${flourC} − 실내 ${p.roomTempC} − 마찰 ${result.friction}\n        = ${result.waterTempC}℃`

  return (
    <div className={s.ddtCard}>
      <div className={s.ddtTitle}>
        🌡️ DDT — 권장 물 온도
        <small>{hasLevain ? '르방 사용 (×4 공식)' : '이스트 사용 (×3 공식)'}</small>
      </div>

      <div className={s.ddtFieldRow}>
        <div className={s.ddtField}>
          <span className={s.ddtFieldLabel}>목표 반죽 온도 (℃)</span>
          <input type="number" className={s.ddtNumInput} step={0.5} min={18} max={30}
            value={p.targetDoughC}
            onChange={e => p.setTargetDoughC(Number(e.target.value) || 25)} />
          {preset?.ddtTargetC !== undefined && (
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              {preset.icon} {preset.name.split(' ')[0]} 권장: {preset.ddtTargetC}℃
            </span>
          )}
        </div>

        <div className={s.ddtField}>
          <span className={s.ddtFieldLabel}>밀가루 온도 (℃)</span>
          <input type="number" className={s.ddtNumInput} step={0.5} min={0} max={40}
            value={p.flourTempC ?? p.roomTempC}
            onChange={e => {
              const v = e.target.value
              p.setFlourTempC(v === '' ? null : Number(v))
            }} />
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            기본: 실내 온도와 동일 ({p.roomTempC}℃)
          </span>
        </div>
      </div>

      {hasLevain && (
        <div className={s.ddtField}>
          <span className={s.ddtFieldLabel}>르방 온도 (℃)</span>
          <input type="number" className={s.ddtNumInput} step={0.5} min={0} max={40}
            value={p.levainTempC ?? p.roomTempC}
            onChange={e => {
              const v = e.target.value
              p.setLevainTempC(v === '' ? null : Number(v))
            }} />
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            기본: 실내 온도와 동일. 냉장 르방 사용 시 4~8℃로 입력
          </span>
        </div>
      )}

      <div className={s.ddtField}>
        <span className={s.ddtFieldLabel}>반죽 방식 (마찰열 자동)</span>
        <div className={s.mixRow}>
          {MIXING_METHODS.map(m => (
            <button key={m.id} type="button"
              className={`${s.mixBtn} ${p.mixingMethod === m.id ? s.mixActive : ''}`}
              onClick={() => p.setMixingMethod(m.id)}>
              <strong>{m.name}</strong>
              <small>{m.desc}</small>
            </button>
          ))}
        </div>
      </div>

      <div className={s.ddtResult}>
        <div className={s.ddtResultLabel}>권장 물 온도</div>
        <div className={`${s.ddtResultValue} ${bandClass}`}>
          {result.waterTempC}<span className={s.ddtResultUnit}>℃</span>
        </div>
        <p className={s.ddtResultAdvice}>{result.advice}</p>
      </div>

      {result.warning && <div className={s.ddtWarn}>{result.warning}</div>}

      <pre className={s.ddtFormula}>{formula}</pre>

      <div className={s.ddtSeasonGuide}>
        <strong>{season.season}</strong> · {season.advice}
      </div>

      <div className={s.ddtDisclaimer}>
        ⚠️ <strong style={{ color: 'var(--text)' }}>마찰열은 믹서 종류·반죽 시간·반죽량에 따라 다릅니다.</strong> 표시값은 일반적 평균이며 첫 반죽 후 실측해 다음 회 보정하세요. <strong style={{ color: 'var(--text)' }}>반죽 온도계 사용을 권장합니다.</strong>
      </div>
    </div>
  )
}

/* ─── 타임라인 표시 (체크리스트) ─── */
function TimelineList({ result }: { result: ScheduleResult }) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const toggle = (idx: number) => {
    setChecked(prev => {
      const next = new Set(prev)
      const key = String(idx)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }

  // 단계별 일자 변경 감지 — 다음날/이틀 후 등 표시
  type Row = { kind: 'step'; step: ScheduleStep; idx: number } | { kind: 'break'; label: string }
  const rows: Row[] = []
  let prevDay: Date | null = null
  result.steps.forEach((step, i) => {
    if (i === 0) {
      rows.push({ kind: 'step', step, idx: i })
      prevDay = step.startTime
      return
    }
    const lbl = prevDay ? dayDiffLabel(prevDay, step.startTime) : null
    if (lbl) {
      rows.push({ kind: 'break', label: lbl })
      prevDay = step.startTime
    }
    rows.push({ kind: 'step', step, idx: i })
  })

  return (
    <div className={s.timelineWrap}>
      {rows.map((r, i) => {
        if (r.kind === 'break') {
          return <div key={'b' + i} className={s.tlDayBreak}>───── {r.label} ─────</div>
        }
        const step = r.step
        const isChecked = checked.has(String(r.idx))
        const cls =
          step.id.includes('cold') || step.id === 'remove' ? s.tlCold :
          step.id === 'bake' || step.id === 'preheat'      ? s.tlBake :
          step.id.startsWith('fold')                        ? s.tlFold :
          step.tempSensitive                                ? s.tlTempSensitive : ''
        return (
          <div key={r.idx}
            className={`${s.tlRow} ${cls}
              ${step.observationKey ? s.tlObservation : ''}
              ${step.isOptional ? s.tlOptional : ''}
              ${isChecked ? s.tlChecked : ''}`}>
            <input type="checkbox" className={s.tlChk} checked={isChecked} onChange={() => toggle(r.idx)} />
            <span className={s.tlTime}>{fmtTime(step.startTime)}</span>
            <span className={s.tlEmoji}>{step.emoji}</span>
            <span className={s.tlBody}>
              {step.name}
              {step.guide && <small>{step.guide}</small>}
              {step.warning && <small style={{ color: '#FFD700' }}>⚠️ {step.warning}</small>}
            </span>
            <span className={s.tlDuration}>{fmtDuration(step.duration)}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── 결과 텍스트로 변환 (복사용) ─── */
function scheduleToText(result: ScheduleResult, mode: 'forward' | 'backward'): string {
  const head = `${result.preset.icon} ${result.preset.name} · ${FERMENTATION_MODES.find(m => m.id === result.fermentationMode)?.name} · 실내 ${result.roomTempC}℃`
  const meta = mode === 'forward'
    ? `시작: ${fmtDateTimeKo(result.startTime)}\n완성: ${fmtDateTimeKo(result.endTime)}\n총 소요: ${fmtDuration(result.totalMinutes)}`
    : `완성: ${fmtDateTimeKo(result.endTime)}\n시작: ${fmtDateTimeKo(result.startTime)}\n총 소요: ${fmtDuration(result.totalMinutes)}`
  const body = result.steps.map(st => {
    const t = `${st.startTime.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric' })} ${fmtTime(st.startTime)}`
    return `${t}  ${st.emoji} ${st.name} (${fmtDuration(st.duration)})`
  }).join('\n')
  return `${head}\n${meta}\n\n${body}\n\n— youtil.kr 제빵 타임라인 계산기`
}

/* ═════════════════════════════════════════ 탭 1 — Forward ═════════════════════════════════════════ */
function ForwardTab(p: CommonInputsProps) {
  // 기본값: 오늘 09:00
  const defaultStart = useMemo(() => {
    const d = new Date()
    d.setHours(9, 0, 0, 0)
    if (d < new Date()) d.setDate(d.getDate() + 1)
    return toDateTimeLocal(d)
  }, [])
  const [startStr, setStartStr] = useState(defaultStart)
  const [copied, setCopied] = useState(false)

  const startDate = parseDateTimeLocal(startStr)
  const result = startDate ? generateForwardSchedule(p.presetId, startDate, p.fermentationMode, p.roomTempC, p.includeOptional) : null

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(scheduleToText(result, 'forward')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <>
      <CommonInputs {...p} />

      <div className={s.card}>
        <label className={s.cardLabel}>시작 시간</label>
        <input className={s.dateInput} type="datetime-local" value={startStr}
          onChange={e => setStartStr(e.target.value)} />
      </div>

      {!result && <div className={s.empty}>시작 시간을 선택하면 일정이 생성됩니다</div>}

      {result && (
        <>
          <div className={s.hero}>
            <div className={s.heroEmoji}>{result.preset.icon}</div>
            <div className={s.heroTitle}>{result.preset.name}</div>
            <div className={s.heroMeta}>
              {FERMENTATION_MODES.find(m => m.id === result.fermentationMode)?.name} · 실내 {result.roomTempC}℃ · {result.preset.difficulty}
            </div>
            <div className={s.heroTimes}>
              <div className={s.heroTimeBox}>
                <div className={s.heroTimeLabel}>시작</div>
                <div className={s.heroTimeValue}>{fmtDateTimeKo(result.startTime)}</div>
              </div>
              <div className={s.heroTimeBox}>
                <div className={s.heroTimeLabel}>완성 예상</div>
                <div className={s.heroTimeValue}>
                  {fmtDateTimeKo(result.endTime)}
                  {dayDiffLabel(result.startTime, result.endTime) && (
                    <span className={s.heroDayLabel}>· {dayDiffLabel(result.startTime, result.endTime)}</span>
                  )}
                </div>
              </div>
            </div>
            <div className={s.heroTotal}>
              총 소요 <strong>{fmtDuration(result.totalMinutes)}</strong>
            </div>
          </div>

          <div className={s.observeBox}>
            ⭐ <strong>발효는 시간보다 반죽 상태가 우선</strong>입니다.
            ① 1차 발효: <strong>부피 50~70% 증가, 큰 기포 형성</strong>
            ② 2차 발효: <strong>손가락 자국이 천천히 회복</strong>
            ③ 글루텐: <strong>윈도우 페인 테스트 (얇은 막)</strong>
            아래 시간은 22℃ 표준 기준 예상 일정이며, 실내 온도·반죽 상태에 따라 가감하세요.
          </div>

          <div className={s.card}>
            <label className={s.cardLabel}>
              타임라인
              <span className={s.cardLabelHint}>{result.steps.length}단계 · 체크리스트로 활용</span>
            </label>
            <TimelineList result={result} />
          </div>

          {result.preset.notes && (
            <div className={s.presetNote}>
              <strong>💡 {result.preset.name.split(' ')[0]} 팁:</strong> {result.preset.notes}
            </div>
          )}

          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={handleCopy}>
            {copied ? '✓ 복사됨' : '📋 일정 텍스트 복사'}
          </button>
        </>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 2 — Backward ═════════════════════════════════════════ */
function BackwardTab(p: CommonInputsProps) {
  // 기본값: 내일 09:00
  const defaultEnd = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(9, 0, 0, 0)
    return toDateTimeLocal(d)
  }, [])
  const [endStr, setEndStr] = useState(defaultEnd)
  const [copied, setCopied] = useState(false)

  const endDate = parseDateTimeLocal(endStr)
  const result = endDate ? generateBackwardSchedule(p.presetId, endDate, p.fermentationMode, p.roomTempC, p.includeOptional) : null

  // 시작 시간이 너무 이른지 안내
  const startHour = result?.startTime.getHours() ?? -1
  const isEarlyMorning = result && (startHour >= 0 && startHour < 5)
  const isLateNight = result && startHour >= 22

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(scheduleToText(result, 'backward')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <>
      <CommonInputs {...p} />

      <div className={s.card}>
        <label className={s.cardLabel}>완성 시간 (먹고 싶은 시간)</label>
        <input className={s.dateInput} type="datetime-local" value={endStr}
          onChange={e => setEndStr(e.target.value)} />
      </div>

      {!result && <div className={s.empty}>완성 시간을 선택하면 시작 시간이 역산됩니다</div>}

      {result && (
        <>
          <div className={`${s.hero} ${s.heroBack}`}>
            <div className={s.heroEmoji}>{result.preset.icon}</div>
            <div className={s.heroTitle}>{result.preset.name}</div>
            <div className={s.heroMeta}>
              {FERMENTATION_MODES.find(m => m.id === result.fermentationMode)?.name} · 실내 {result.roomTempC}℃
            </div>
            <div className={s.heroTimes}>
              <div className={s.heroTimeBox}>
                <div className={s.heroTimeLabel}>⚠️ 시작해야 할 시간</div>
                <div className={s.heroTimeValue}>{fmtDateTimeKo(result.startTime)}</div>
              </div>
              <div className={s.heroTimeBox}>
                <div className={s.heroTimeLabel}>완성 (목표)</div>
                <div className={s.heroTimeValue}>{fmtDateTimeKo(result.endTime)}</div>
              </div>
            </div>
            <div className={s.heroTotal}>
              총 소요 <strong>{fmtDuration(result.totalMinutes)}</strong>
            </div>
          </div>

          {(isEarlyMorning || isLateNight) && (
            <div className={`${s.tempInfo} ${s.tempDanger}`} style={{ marginTop: 0 }}>
              {isEarlyMorning ? '⚠️ 새벽 시간 시작이 필요합니다' : '⚠️ 밤늦은 시간 시작이 필요합니다'}.
              {' '}다른 옵션을 고려하세요:
              <strong> 냉장 발효 활용</strong>(전날 반죽 → 다음날 굽기) 또는
              <strong> 더 단순한 빵</strong>(식빵·포카치아) 또는
              <strong> 비가·푸어리쉬</strong>(전날 종 만들기).
            </div>
          )}

          <div className={s.observeBox}>
            ⭐ <strong>역산 일정은 가이드일 뿐</strong>입니다. 실제 발효는 ±20% 변동 가능하니 완성 시간보다 30분~1시간 여유 있게 시작하시고, 마지막 발효 단계에서 자주 반죽 상태를 확인하세요.
          </div>

          <div className={s.card}>
            <label className={s.cardLabel}>
              역산 타임라인
              <span className={s.cardLabelHint}>{result.steps.length}단계</span>
            </label>
            <TimelineList result={result} />
          </div>

          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={handleCopy}>
            {copied ? '✓ 복사됨' : '📋 일정 텍스트 복사'}
          </button>
        </>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 3 — 빵별 프리셋 ═════════════════════════════════════════ */
function PresetTab({ onApply }: { onApply: (id: string) => void }) {
  const [selectedId, setSelectedId] = useState<string>('sourdough')
  const preset = BREAD_PRESETS.find(p => p.id === selectedId) ?? BREAD_PRESETS[0]
  const totalSteps = preset.steps.length
  const totalMins = preset.steps.reduce((sum, s) => sum + s.minutes, 0)

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          빵 종류 선택
          <span className={s.cardLabelHint}>각 빵의 표준 일정·팁 확인</span>
        </label>
        <div className={s.breadGrid}>
          {BREAD_PRESETS.map(bp => (
            <button key={bp.id} className={`${s.breadCard} ${selectedId === bp.id ? s.breadCardActive : ''}`}
              onClick={() => setSelectedId(bp.id)}>
              <div className={s.breadCardEmoji}>{bp.icon}</div>
              <div className={s.breadCardName}>{bp.name.split(' ')[0]}</div>
              <div className={s.breadCardMeta}>약 {bp.totalTimeHours}시간</div>
              <span className={`${s.diffBadge} ${diffBadgeClass(bp.difficulty)}`}>{bp.difficulty}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={s.presetDetail}>
        <div className={s.presetDetailHeader}>
          <span className={s.presetDetailEmoji}>{preset.icon}</span>
          <div>
            <div className={s.presetDetailName}>{preset.name}</div>
            <div className={s.presetDetailDesc}>{preset.description}</div>
          </div>
        </div>

        <div className={s.presetMetaGrid}>
          <div className={s.presetMetaBox}>
            <div className={s.presetMetaLabel}>난이도</div>
            <div className={s.presetMetaValue}>{preset.difficulty}</div>
          </div>
          <div className={s.presetMetaBox}>
            <div className={s.presetMetaLabel}>총 소요</div>
            <div className={s.presetMetaValue}>약 {preset.totalTimeHours}시간</div>
          </div>
          <div className={s.presetMetaBox}>
            <div className={s.presetMetaLabel}>단계 수</div>
            <div className={s.presetMetaValue}>{totalSteps}단계</div>
          </div>
          {preset.waterRatio !== undefined && (
            <div className={s.presetMetaBox}>
              <div className={s.presetMetaLabel}>수분율</div>
              <div className={s.presetMetaValue}>{preset.waterRatio}%</div>
            </div>
          )}
          {preset.yeastRatio !== undefined && (
            <div className={s.presetMetaBox}>
              <div className={s.presetMetaLabel}>이스트</div>
              <div className={s.presetMetaValue}>{preset.yeastRatio}%</div>
            </div>
          )}
          {preset.levainRatio !== undefined && (
            <div className={s.presetMetaBox}>
              <div className={s.presetMetaLabel}>르방</div>
              <div className={s.presetMetaValue}>{preset.levainRatio}%</div>
            </div>
          )}
        </div>

        <div className={s.presetNote}>
          <strong>💡 핵심 팁:</strong> {preset.notes}
        </div>

        <div>
          <span className={s.subLabel}>표준 일정 ({fmtDuration(totalMins)})</span>
          <div className={s.timelineWrap}>
            {preset.steps.map((step, i) => (
              <div key={i} className={`${s.tlRow} ${step.optional ? s.tlOptional : ''}
                ${step.tempSensitive ? s.tlTempSensitive : ''}
                ${step.id.includes('cold') ? s.tlCold : ''}
                ${step.id === 'bake' || step.id === 'preheat' ? s.tlBake : ''}
                ${step.id.startsWith('fold') ? s.tlFold : ''}
                ${step.observationKey ? s.tlObservation : ''}`}>
                <span style={{ width: 18 }} />
                <span className={s.tlTime}>{i + 1}.</span>
                <span className={s.tlEmoji}>—</span>
                <span className={s.tlBody}>
                  {step.name}{step.optional && <span style={{ color: 'var(--muted)', marginLeft: 4 }}>(선택)</span>}
                  {step.guide && <small>{step.guide}</small>}
                </span>
                <span className={s.tlDuration}>{fmtDuration(step.minutes)}</span>
              </div>
            ))}
          </div>
        </div>

        <button className={s.actionBtn} onClick={() => onApply(preset.id)}>
          → 이 빵으로 일정 만들기
        </button>
      </div>
    </>
  )
}

/* ═════════════════════════════════════════ 탭 4 — 내 레시피 ═════════════════════════════════════════ */
function RecipeTab({
  onApply,
  currentSettings,
}: {
  onApply: (r: SavedRecipe) => void
  currentSettings: { presetId: string; fermentationMode: FermentationMode; roomTempC: number; includeOptional: boolean }
}) {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setRecipes(loadRecipes())
    setLoaded(true)
  }, [])
  useEffect(() => {
    if (loaded) saveRecipes(recipes)
  }, [recipes, loaded])

  const startNew = () => {
    setEditingId(null)
    setName('')
    setNotes('')
    setShowForm(true)
  }
  const startEdit = (r: SavedRecipe) => {
    setEditingId(r.id)
    setName(r.name)
    setNotes(r.notes ?? '')
    setShowForm(true)
  }
  const handleSave = () => {
    if (!name.trim()) { alert('레시피 이름을 입력해 주세요'); return }
    const now = new Date().toISOString()
    if (editingId) {
      setRecipes(prev => prev.map(r => r.id === editingId
        ? { ...r, name: name.trim(), notes: notes.trim() || undefined, updatedAt: now,
            // 편집 시 현재 설정도 함께 업데이트
            presetId: currentSettings.presetId,
            fermentationMode: currentSettings.fermentationMode,
            roomTempC: currentSettings.roomTempC,
            includeOptional: currentSettings.includeOptional,
          }
        : r))
    } else {
      setRecipes(prev => [...prev, {
        id: newRecipeId(),
        name: name.trim(),
        presetId: currentSettings.presetId,
        fermentationMode: currentSettings.fermentationMode,
        roomTempC: currentSettings.roomTempC,
        includeOptional: currentSettings.includeOptional,
        notes: notes.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      }])
    }
    setShowForm(false)
    setEditingId(null)
  }
  const handleDelete = (id: string) => {
    if (!confirm('이 레시피를 삭제하시겠습니까?')) return
    setRecipes(prev => prev.filter(r => r.id !== id))
  }

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          내 레시피
          <span className={s.cardLabelHint}>{recipes.length}개 저장됨</span>
        </label>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 10 }}>
          자주 만드는 빵의 설정(빵 종류·발효 방식·실내 온도·메모)을 브라우저에 저장합니다. 다른 탭에서 현재 입력한 설정을 바로 저장하려면 [+ 새 레시피 저장] 클릭.
        </p>
        {!showForm && (
          <button className={s.actionBtn} onClick={startNew}>+ 새 레시피 저장 (현재 설정 기반)</button>
        )}
      </div>

      {showForm && (
        <div className={s.recipeForm}>
          <div className={s.recipeFormTitle}>{editingId ? '레시피 편집' : '새 레시피 저장'}</div>

          <div>
            <span className={s.inlineLabel}>레시피 이름 *</span>
            <input className={s.textInput} type="text" placeholder="예: 내 사워도우 - 수분율 78%"
              value={name} onChange={e => setName(e.target.value)} maxLength={50} />
          </div>

          <div>
            <span className={s.inlineLabel}>현재 적용될 설정</span>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: 'var(--text)', lineHeight: 1.7, fontFamily: 'Noto Sans KR, sans-serif' }}>
              {(() => {
                const bp = BREAD_PRESETS.find(b => b.id === currentSettings.presetId)
                const fm = FERMENTATION_MODES.find(m => m.id === currentSettings.fermentationMode)
                return (
                  <>
                    {bp?.icon} <strong>{bp?.name}</strong> · {fm?.name} · 실내 {currentSettings.roomTempC}℃
                    {currentSettings.includeOptional ? ' · 선택 단계 포함' : ' · 선택 단계 제외'}
                  </>
                )
              })()}
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              다른 빵·설정으로 저장하려면 먼저 [시작 시간 기준] 또는 [빵별 프리셋] 탭에서 변경 후 저장하세요.
            </p>
          </div>

          <div>
            <span className={s.inlineLabel}>메모 (선택)</span>
            <textarea className={s.textInput} rows={3} maxLength={300}
              placeholder="예: 냉장 16시간이 가장 좋음, 르방 100g 사용"
              value={notes} onChange={e => setNotes(e.target.value)}
              style={{ fontFamily: 'Noto Sans KR, sans-serif', resize: 'vertical' }} />
          </div>

          <div className={s.btnRow}>
            <button className={s.actionBtn} style={{ width: 'auto', flex: 1 }} onClick={handleSave}>
              {editingId ? '수정 완료' : '저장'}
            </button>
            <button className={s.miniBtn} onClick={() => { setShowForm(false); setEditingId(null) }}>
              취소
            </button>
          </div>
        </div>
      )}

      {recipes.length === 0 && loaded && !showForm && (
        <div className={s.empty}>
          <div className={s.emptyTitle}>📭 저장된 레시피가 없어요</div>
          <p>다른 탭에서 빵·발효·온도 설정 후 [+ 새 레시피 저장]으로 등록하세요.</p>
        </div>
      )}

      {recipes.length > 0 && (
        <div className={s.recipeGrid}>
          {recipes.map(r => {
            const bp = BREAD_PRESETS.find(b => b.id === r.presetId)
            const fm = FERMENTATION_MODES.find(m => m.id === r.fermentationMode)
            return (
              <div key={r.id} className={s.recipeCard}>
                <div className={s.recipeCardHeader}>
                  <div className={s.recipeCardTitle}>{bp?.icon} {r.name}</div>
                </div>
                <div className={s.recipeCardMeta}>
                  마지막 수정: {new Date(r.updatedAt).toLocaleDateString('ko-KR')}
                </div>
                <div className={s.recipeCardBadges}>
                  <span className={s.recipeBadge}>{bp?.name.split(' ')[0]}</span>
                  <span className={s.recipeBadge}>{fm?.name}</span>
                  <span className={s.recipeBadge}>{r.roomTempC}℃</span>
                </div>
                {r.notes && <div className={s.recipeNote}>{r.notes}</div>}
                <div className={s.btnRow}>
                  <button className={s.actionBtn} style={{ width: 'auto', flex: 1, padding: '9px 14px', fontSize: 12.5 }}
                    onClick={() => onApply(r)}>
                    → 일정 만들기
                  </button>
                  <button className={s.miniBtn} onClick={() => startEdit(r)}>편집</button>
                  <button className={`${s.miniBtn} ${s.miniDanger}`} onClick={() => handleDelete(r.id)}>삭제</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
