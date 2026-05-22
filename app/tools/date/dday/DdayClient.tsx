/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import Disclaimer from '@/components/Disclaimer'
import { useEffect, useMemo, useState } from 'react'
import s from './dday.module.css'
import {
  calcDday, calcProgress, calcWeekdays, calcBusinessDays, calcWeekendCount,
  holidaysBetween, calcYMDDiff, addDays, calcPace, nextRecurrence,
  loadDdays, saveDdays, newId, fmtDate, fmtDateKo,
  type DdayItem, type AddDaysMode,
} from './ddayUtils'
import {
  DDAY_CATEGORIES, RECURRENCE_OPTIONS, isHoliday,
  type RecurrenceId,
} from './koreanHolidays'

type Tab = 'list' | 'quick' | 'pace' | 'diff' | 'biz'

/* ═════════════════════════════════════════ Main ═════════════════════════════════════════ */
export default function DdayClient() {
  const [tab, setTab] = useState<Tab>('list')
  const [now, setNow] = useState(() => new Date())

  // 1초마다 갱신 — 라이브 카운트다운
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/date/age', label: '나이 계산기' },
          { href: '/tools/date/dday', label: 'D-day 계산기' },
          { href: '/tools/date/jet-lag', label: '시차 계산기' }
        ]}
      >
        D-day 데이터는 이 브라우저의 localStorage에 저장됩니다.
      </Disclaimer>

      <div className={s.tabs}>
        {([
          ['list',  '내 D-day'],
          ['quick', '바로 계산'],
          ['pace',  '하루 목표 계산'],
          ['diff',  '두 날짜 차이'],
          ['biz',   '영업일·N일 후'],
        ] as [Tab, string][]).map(([key, label]) => {
          const cls =
            tab !== key ? '' :
            key === 'quick' ? s.tabActiveQuick :
            key === 'pace'  ? s.tabActivePace :
            key === 'diff'  ? s.tabActiveDiff :
            key === 'biz'   ? s.tabActiveBiz : s.tabActive
          return (
            <button key={key} className={`${s.tabBtn} ${cls}`} onClick={() => setTab(key)}>
              {label}
            </button>
          )
        })}
      </div>

      {tab === 'list'  && <ListTab now={now} />}
      {tab === 'quick' && <QuickTab now={now} />}
      {tab === 'pace'  && <PaceTab now={now} />}
      {tab === 'diff'  && <DiffTab />}
      {tab === 'biz'   && <BizTab now={now} />}
    </div>
  )
}

/* ═════════════════════════════════════════ 탭 1 — 내 D-day 목록 ═════════════════════════════════════════ */
function ListTab({ now }: { now: Date }) {
  const [items, setItems] = useState<DdayItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // 초기 로드 (한 번만)
  useEffect(() => {
    const stored = loadDdays()
    setItems(stored)
    setLoaded(true)
  }, [])

  // 변경 시 저장
  useEffect(() => {
    if (loaded) saveDdays(items)
  }, [items, loaded])

  /* CRUD */
  const upsertItem = (item: DdayItem) => {
    setItems(prev => {
      const exists = prev.some(p => p.id === item.id)
      return exists ? prev.map(p => p.id === item.id ? item : p) : [...prev, item]
    })
    setShowForm(false)
    setEditingId(null)
  }
  const deleteItem = (id: string) => {
    if (!confirm('이 D-day를 삭제하시겠습니까?')) return
    setItems(prev => prev.filter(p => p.id !== id))
  }
  const togglePin = (id: string) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p))
  }
  const toggleComplete = (id: string) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, isCompleted: !p.isCompleted } : p))
  }

  /* 정렬 — 핀 우선 + 가까운 순 (고정) */
  const sorted = useMemo(() => {
    const xs = items.slice()
    xs.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1
      const ad = calcDday(a.targetDate, now)
      const bd = calcDday(b.targetDate, now)
      if (ad.isPast !== bd.isPast) return ad.isPast ? 1 : -1
      return ad.days - bd.days
    })
    return xs
  }, [items, now])

  return (
    <>
      {!showForm && !editingId && (
        <button className={s.bigCta} onClick={() => setShowForm(true)}>
          + 새 D-day 추가
        </button>
      )}

      {(showForm || editingId) && (
        <DdayEditForm
          editing={editingId ? items.find(it => it.id === editingId) ?? null : null}
          onSave={upsertItem}
          onCancel={() => { setShowForm(false); setEditingId(null) }}
        />
      )}

      {items.length === 0 && loaded && (
        <div className={s.empty}>
          <div className={s.emptyTitle}>📭 아직 저장된 D-day가 없어요</div>
          <p>[+ 새 D-day 추가] 로 첫 일정을 등록해 보세요.</p>
        </div>
      )}

      {sorted.length > 0 && (
        <div className={s.ddayGrid}>
          {sorted.map(it => (
            <DdayCard key={it.id} item={it} now={now}
              onPin={() => togglePin(it.id)}
              onEdit={() => setEditingId(it.id)}
              onDelete={() => deleteItem(it.id)}
              onComplete={() => toggleComplete(it.id)}
            />
          ))}
        </div>
      )}
    </>
  )
}

/* ─── D-day 카드 ─── */
function DdayCard({ item, now, onPin, onEdit, onDelete, onComplete }: {
  item: DdayItem; now: Date
  onPin: () => void; onEdit: () => void; onDelete: () => void; onComplete: () => void
}) {
  // 반복 D-day는 다음 발생일 기준
  const effectiveTarget = item.recurrence !== 'none' ? fmtDate(nextRecurrence(item, now)) : item.targetDate
  const dday = calcDday(effectiveTarget, now)
  const cat = DDAY_CATEGORIES.find(c => c.id === item.category) ?? DDAY_CATEGORIES[10]
  const progress = item.startDate ? calcProgress(item.startDate, effectiveTarget, now) : null
  const pace = item.goal ? calcPace(effectiveTarget, item.startDate ?? item.createdAt, item.goal.totalAmount, item.goal.completedAmount, now) : null

  const cardClass = [
    s.ddayCard,
    item.isPinned ? s.ddayPinned : '',
    dday.urgency === 'urgent' || dday.urgency === 'today' ? s.ddayUrgent :
    dday.urgency === 'soon' ? s.ddaySoon : '',
    dday.isPast || item.isCompleted ? s.ddayPast : '',
  ].filter(Boolean).join(' ')

  const heroClass = [
    s.ddayHero,
    dday.urgency === 'urgent' || dday.urgency === 'today' ? s.ddayHeroUrgent :
    dday.urgency === 'soon' ? s.ddayHeroSoon :
    dday.isPast ? s.ddayHeroPast : '',
  ].filter(Boolean).join(' ')

  const badgeClass =
    dday.urgency === 'urgent' || dday.urgency === 'today' ? s.badgeUrgent :
    dday.urgency === 'soon' ? s.badgeSoon :
    dday.isPast ? s.badgePast : s.badgeOk

  const badgeText =
    dday.urgency === 'today' ? '오늘' :
    dday.urgency === 'urgent' ? '임박' :
    dday.urgency === 'soon' ? '준비 단계' :
    dday.isPast ? '지남' : '여유'

  return (
    <div className={cardClass} style={{ borderLeftColor: cat.color }}>
      <div className={s.ddayHeader}>
        <span className={s.ddayCategory}>
          <span style={{ fontSize: 14 }}>{item.emoji || cat.emoji}</span>
          {cat.name}
          {item.recurrence !== 'none' && <span style={{ fontSize: 10, marginLeft: 4 }}>🔁</span>}
        </span>
        <div className={s.ddayActions}>
          <button className={s.ddayPinBtn} onClick={onPin} title="핀">📌</button>
          <button className={s.ddayMenuBtn} onClick={onEdit} title="편집">✏️</button>
          <button className={s.ddayMenuBtn} onClick={onComplete} title="완료">{item.isCompleted ? '↩️' : '✅'}</button>
          <button className={s.ddayMenuBtn} onClick={onDelete} title="삭제">✕</button>
        </div>
      </div>

      <div className={s.ddayTitle}>{item.title}</div>
      <div className={heroClass}>{dday.label}</div>
      <div className={s.ddayDate}>{fmtDateKo(effectiveTarget)}</div>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <span className={`${s.ddayBadge} ${badgeClass}`}>{badgeText}</span>
      </div>

      {progress && (
        <>
          <div className={s.ddayProgress}>
            <div className={s.ddayProgressBar} style={{ width: `${progress.percent}%`, background: `linear-gradient(90deg, var(--accent), ${cat.color})` }} />
          </div>
          <div className={s.ddayMeta}>
            <span>진행률 <span className={s.ddayProgressLabel}>{progress.percent.toFixed(0)}%</span></span>
            <span>{progress.elapsedDays} / {progress.totalDays}일</span>
          </div>
        </>
      )}

      {pace && pace.remainingDays > 0 && (
        <div className={s.ddayPace}>
          <span>일일 목표</span>
          <strong>{pace.dailyTarget} {item.goal?.unit ?? ''} {pace.isOnTrack ? '✓' : '⚠️'}</strong>
        </div>
      )}

      {!progress && !pace && (
        <div className={s.ddayMeta}>
          <span>{dday.weeks}주 {dday.weekDays}일</span>
          <span>{dday.hours.toLocaleString()}시간</span>
        </div>
      )}
    </div>
  )
}

/* ─── D-day 편집 폼 ─── */
function DdayEditForm({ editing, onSave, onCancel }: {
  editing: DdayItem | null
  onSave: (item: DdayItem) => void
  onCancel: () => void
}) {
  const isNew = !editing
  const [title, setTitle] = useState(editing?.title ?? '')
  const [emoji, setEmoji] = useState(editing?.emoji ?? '')
  const [targetDate, setTargetDate] = useState(editing?.targetDate ?? '')
  const [recurrence, setRecurrence] = useState<RecurrenceId>(editing?.recurrence ?? 'none')

  const handleSave = () => {
    if (!title.trim()) { alert('제목을 입력해 주세요'); return }
    if (!targetDate) { alert('목표 날짜를 선택해 주세요'); return }

    onSave({
      id: editing?.id ?? newId(),
      title: title.trim(),
      emoji: emoji.trim() || '📌',
      category: editing?.category ?? 'other',
      targetDate,
      startDate: editing?.startDate,
      recurrence,
      isPinned: editing?.isPinned ?? false,
      isCompleted: editing?.isCompleted ?? false,
      goal: editing?.goal,
      notes: editing?.notes,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    })
  }

  return (
    <div className={s.editForm}>
      <div className={s.editFormTitle}>{isNew ? '+ 새 D-day' : '✏️ D-day 편집'}</div>

      <div>
        <span className={s.inlineLabel}>제목 *</span>
        <input className={s.textInput} type="text" placeholder="예: 한국사능력검정시험"
          value={title} onChange={e => setTitle(e.target.value)} maxLength={50} />
      </div>

      <div className={s.fieldRow}>
        <div>
          <span className={s.inlineLabel}>목표 날짜 *</span>
          <input className={s.dateInput} type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
        </div>
        <div>
          <span className={s.inlineLabel}>이모지 (선택)</span>
          <input className={s.textInput} type="text" placeholder="📚" maxLength={2}
            value={emoji} onChange={e => setEmoji(e.target.value)} />
        </div>
      </div>

      <div>
        <span className={s.inlineLabel}>반복</span>
        <div className={s.recurRow}>
          {RECURRENCE_OPTIONS.map(r => (
            <button key={r.id} className={`${s.recurBtn} ${recurrence === r.id ? s.recurActive : ''}`}
              onClick={() => setRecurrence(r.id)}>
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <div className={s.btnRow}>
        <button className={s.actionBtn} onClick={handleSave}>
          {isNew ? '저장' : '수정 완료'}
        </button>
        <button className={s.miniBtn} onClick={onCancel}>취소</button>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════ 탭 2 — 빠른 계산기 ═════════════════════════════════════════ */
function QuickTab({ now }: { now: Date }) {
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')

  if (!target) {
    return (
      <>
        <div className={s.card}>
          <label className={s.cardLabel}>바로 계산</label>
          <div className={s.fieldRow}>
            <div>
              <span className={s.inlineLabel}>제목 (선택)</span>
              <input className={s.textInput} type="text" placeholder="예: 프로젝트 마감"
                value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <span className={s.inlineLabel}>목표 날짜 *</span>
              <input className={s.dateInput} type="date" value={target} onChange={e => setTarget(e.target.value)} />
            </div>
          </div>
        </div>
        <div className={s.empty}>목표 날짜를 선택하면 결과가 표시됩니다</div>
      </>
    )
  }

  const dday = calcDday(target, now)
  const targetDate = new Date(target)
  const targetMs = new Date(target).setHours(0, 0, 0, 0)
  const liveMs = Math.abs(targetMs - now.getTime())
  const liveDays  = Math.floor(liveMs / (1000 * 60 * 60 * 24))
  const liveHours = Math.floor((liveMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const liveMins  = Math.floor((liveMs % (1000 * 60 * 60)) / (1000 * 60))
  const liveSecs  = Math.floor((liveMs % (1000 * 60)) / 1000)

  const todayStr = fmtDate(now)
  const weekdays  = !dday.isPast ? calcWeekdays(todayStr, target) : 0
  const businessDays = !dday.isPast ? calcBusinessDays(todayStr, target) : 0
  const weekendCount = !dday.isPast ? calcWeekendCount(todayStr, target) : 0
  const holidayList  = !dday.isPast ? holidaysBetween(todayStr, target) : []

  const heroClass = [
    s.heroNum,
    dday.urgency === 'urgent' || dday.urgency === 'today' ? s.heroNumUrgent :
    dday.urgency === 'soon' ? s.heroNumSoon : '',
  ].filter(Boolean).join(' ')

  const status =
    dday.urgency === 'urgent' || dday.urgency === 'today' ? '🔴 임박! 마무리 점검' :
    dday.urgency === 'soon' ? '🟡 준비 단계' :
    dday.isPast ? '⚫ 지난 일정' :
    dday.diff <= 100 ? '🟢 충분한 시간' : '🔵 장기 계획'

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>바로 계산 입력</label>
        <div className={s.fieldRow}>
          <div>
            <span className={s.inlineLabel}>제목 (선택)</span>
            <input className={s.textInput} type="text" placeholder="예: 프로젝트 마감"
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <span className={s.inlineLabel}>목표 날짜 *</span>
            <input className={s.dateInput} type="date" value={target} onChange={e => setTarget(e.target.value)} />
          </div>
        </div>
      </div>

      <div className={s.heroBig}>
        <div className={s.heroLabel}>{title || '카운트다운'}</div>
        <div className={heroClass}>{dday.label}</div>
        <div className={s.heroSub}>{fmtDateKo(targetDate)} · {status}</div>

        {!dday.isPast && (
          <div className={s.countdown4}>
            <div className={s.box}><div className={s.num}>{liveDays}</div><div className={s.lbl}>일</div></div>
            <div className={s.box}><div className={s.num}>{String(liveHours).padStart(2,'0')}</div><div className={s.lbl}>시간</div></div>
            <div className={s.box}><div className={s.num}>{String(liveMins).padStart(2,'0')}</div><div className={s.lbl}>분</div></div>
            <div className={s.box}><div className={s.num}>{String(liveSecs).padStart(2,'0')}</div><div className={s.lbl}>초</div></div>
          </div>
        )}
      </div>

      <div className={s.statsGrid}>
        <div className={s.statBox}>
          <div className={s.statNum}>{dday.days.toLocaleString()}</div>
          <div className={s.statLabel}>{dday.isPast ? '지난 일수' : '남은 일수'}</div>
          <div className={s.statSub}>{dday.weeks}주 {dday.weekDays}일</div>
        </div>
        <div className={s.statBox}>
          <div className={s.statNum}>{dday.hours.toLocaleString()}</div>
          <div className={s.statLabel}>시간</div>
          <div className={s.statSub}>{(dday.hours * 60).toLocaleString()}분</div>
        </div>
        {!dday.isPast && (
          <>
            <div className={s.statBox}>
              <div className={s.statNum}>{weekdays}</div>
              <div className={s.statLabel}>평일</div>
              <div className={s.statSub}>월~금 (공휴일 포함)</div>
            </div>
            <div className={s.statBox}>
              <div className={s.statNum}>{businessDays}</div>
              <div className={s.statLabel}>영업일</div>
              <div className={s.statSub}>공휴일 {holidayList.length}개 제외</div>
            </div>
            <div className={s.statBox}>
              <div className={s.statNum}>{weekendCount}</div>
              <div className={s.statLabel}>주말</div>
              <div className={s.statSub}>일요일 카운트</div>
            </div>
          </>
        )}
      </div>

      {holidayList.length > 0 && (
        <div className={s.card}>
          <label className={s.cardLabel}>포함된 한국 공휴일</label>
          <p className={s.holidayList}>
            {holidayList.map(h => `${h.date} ${h.name}`).join(' · ')}
          </p>
        </div>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 3 — 페이스 ═════════════════════════════════════════ */
function PaceTab({ now }: { now: Date }) {
  const [target, setTarget] = useState('')
  const [start, setStart] = useState('')
  const [unit, setUnit] = useState('페이지')
  const [total, setTotal] = useState('600')
  const [done, setDone] = useState('200')

  const totalN = Number(total) || 0
  const doneN  = Number(done) || 0
  const pace = (target && totalN > 0)
    ? calcPace(target, start || fmtDate(now), totalN, doneN, now)
    : null

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          목표 입력
          <span className={s.cardLabelHint}>목표 날짜까지 하루에 얼마씩</span>
        </label>
        <div className={s.fieldRow}>
          <div>
            <span className={s.inlineLabel}>시작일 (선택)</span>
            <input className={s.dateInput} type="date" value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div>
            <span className={s.inlineLabel}>목표 날짜 *</span>
            <input className={s.dateInput} type="date" value={target} onChange={e => setTarget(e.target.value)} />
          </div>
        </div>
        <div className={s.fieldRow3} style={{ marginTop: 10 }}>
          <div>
            <span className={s.inlineLabel}>전체 목표량</span>
            <input className={s.numInput} type="number" inputMode="numeric" placeholder="예: 600"
              value={total} onChange={e => setTotal(e.target.value)} />
          </div>
          <div>
            <span className={s.inlineLabel}>현재까지 완료</span>
            <input className={s.numInput} type="number" inputMode="numeric" placeholder="예: 200"
              value={done} onChange={e => setDone(e.target.value)} />
          </div>
          <div>
            <span className={s.inlineLabel}>단위</span>
            <input className={s.textInput} type="text" placeholder="페이지·km·만원"
              value={unit} onChange={e => setUnit(e.target.value)} maxLength={10} />
          </div>
        </div>
        <p className={s.holidayList} style={{ marginTop: 8 }}>
          예) 책 600페이지 중 200페이지를 읽었고 목표 날짜까지 남았다면 → 전체 목표량 600, 현재까지 완료 200, 단위 「페이지」.
        </p>
      </div>

      {!pace && <div className={s.empty}>목표 날짜와 전체 목표량을 입력하면 하루 목표가 계산됩니다</div>}

      {pace && pace.remainingDays <= 0 && (
        <div className={s.empty}>이미 목표 날짜가 지났습니다. 새로운 목표 날짜를 선택해 보세요.</div>
      )}

      {pace && pace.remainingDays > 0 && (
        <>
          <div className={s.paceHero}>
            <div className={s.heroLabel}>일일 목표</div>
            <div className={s.paceHeroNum}>{pace.dailyTarget.toLocaleString()} {unit}</div>
            <div className={s.paceHeroSub}>
              남은 {pace.remainingDays}일 동안 매일 / 주간 {pace.weeklyTarget} {unit}
            </div>
          </div>

          <div className={s.card}>
            <label className={s.cardLabel}>상세 분석</label>
            <div className={s.paceTable}>
              <div className={s.paceRow}><span>남은 일수</span><span>{pace.remainingDays}일</span></div>
              <div className={s.paceRow}><span>남은 분량</span><span>{pace.remainingAmount.toLocaleString()} {unit}</span></div>
              <div className={s.paceRow}><span>일일 목표</span><span>{pace.dailyTarget.toLocaleString()} {unit}</span></div>
              <div className={s.paceRow}><span>주간 목표</span><span>{pace.weeklyTarget.toLocaleString()} {unit}</span></div>
              <div className={s.paceRow}>
                <span>현재 페이스</span>
                <span className={pace.isOnTrack ? s.paceOk : s.paceWarn}>
                  {pace.currentPace.toLocaleString()} {unit}/일
                </span>
              </div>
              <div className={s.paceRow}>
                <span>예상 완료량</span>
                <span className={pace.isOnTrack ? s.paceOk : s.paceWarn}>
                  {pace.expectedFinish.toLocaleString()} {unit}
                </span>
              </div>
              {!pace.isOnTrack && (
                <>
                  <div className={s.paceRow}><span>부족분</span><span className={s.paceWarn}>{pace.deficit.toLocaleString()} {unit}</span></div>
                  <div className={s.paceRow}><span>추가 일일 목표</span><span className={s.paceWarn}>+{pace.additionalDailyNeeded.toLocaleString()} {unit}</span></div>
                </>
              )}
              <div className={s.paceRow}><span>현재 진행률</span><span>{pace.percent.toFixed(0)}%</span></div>
            </div>

            <div className={s.paceBars}>
              <div className={s.paceBarRow}>
                <span className={s.paceBarLabel}>이상적 100%</span>
                <span className={s.paceBarTrack}><span className={s.paceBarFill} style={{ width: '100%', background: 'var(--accent)' }} /></span>
                <span className={s.paceBarValue}>{totalN.toLocaleString()}</span>
              </div>
              <div className={s.paceBarRow}>
                <span className={s.paceBarLabel}>현재 페이스</span>
                <span className={s.paceBarTrack}>
                  <span className={s.paceBarFill}
                    style={{
                      width: `${Math.min(100, totalN > 0 ? (pace.expectedFinish / totalN) * 100 : 0)}%`,
                      background: pace.isOnTrack ? '#059669' : '#DC2626',
                    }} />
                </span>
                <span className={s.paceBarValue}>{pace.expectedFinish.toLocaleString()}</span>
              </div>
              <div className={s.paceBarRow}>
                <span className={s.paceBarLabel}>완료한 양</span>
                <span className={s.paceBarTrack}>
                  <span className={s.paceBarFill} style={{ width: `${pace.percent}%`, background: '#0891B2' }} />
                </span>
                <span className={s.paceBarValue}>{doneN.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className={`${s.paceVerdict} ${!pace.isOnTrack ? s.paceVerdictWarn : ''}`}>
            {pace.isOnTrack ? (
              <>현재 페이스(<strong>{pace.currentPace} {unit}/일</strong>)로 목표 달성 가능합니다 ✓ 이대로 유지하면 예상 <strong>{pace.expectedFinish.toLocaleString()} {unit}</strong> 완료, 목표({totalN.toLocaleString()} {unit}) 달성!</>
            ) : (
              <>현재 페이스(<strong>{pace.currentPace} {unit}/일</strong>)로는 목표 달성이 어렵습니다. 남은 <strong>{pace.remainingDays}일 동안 매일 {pace.dailyTarget} {unit}</strong>씩(추가 +{pace.additionalDailyNeeded} {unit}) 진행해야 목표({totalN.toLocaleString()} {unit})를 채울 수 있습니다.</>
            )}
          </div>
        </>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 4 — 두 날짜 사이 ═════════════════════════════════════════ */
function DiffTab() {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  if (!start || !end) {
    return (
      <>
        <div className={s.card}>
          <label className={s.cardLabel}>두 날짜 입력</label>
          <div className={s.fieldRow}>
            <div>
              <span className={s.inlineLabel}>시작 날짜</span>
              <input className={s.dateInput} type="date" value={start} onChange={e => setStart(e.target.value)} />
            </div>
            <div>
              <span className={s.inlineLabel}>종료 날짜</span>
              <input className={s.dateInput} type="date" value={end} onChange={e => setEnd(e.target.value)} />
            </div>
          </div>
        </div>
        <div className={s.empty}>두 날짜를 선택하면 차이가 계산됩니다</div>
      </>
    )
  }

  const startD = new Date(start); startD.setHours(0,0,0,0)
  const endD = new Date(end); endD.setHours(0,0,0,0)
  const swapped = endD < startD
  const a = swapped ? end : start
  const b = swapped ? start : end
  const aD = new Date(a); aD.setHours(0,0,0,0)
  const bD = new Date(b); bD.setHours(0,0,0,0)

  const totalDays = Math.abs(Math.round((bD.getTime() - aD.getTime()) / (1000 * 60 * 60 * 24)))
  const ymd = calcYMDDiff(a, b)
  const weekdays = calcWeekdays(a, b)
  const businessDays = calcBusinessDays(a, b)
  const weekends = calcWeekendCount(a, b)
  const holidays = holidaysBetween(a, b)

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>두 날짜 입력</label>
        <div className={s.fieldRow}>
          <div>
            <span className={s.inlineLabel}>시작 날짜</span>
            <input className={s.dateInput} type="date" value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div>
            <span className={s.inlineLabel}>종료 날짜</span>
            <input className={s.dateInput} type="date" value={end} onChange={e => setEnd(e.target.value)} />
          </div>
        </div>
      </div>

      <div className={s.diffHero}>
        <div className={s.heroLabel}>두 날짜 차이</div>
        <div className={s.diffHeroNum}>{totalDays.toLocaleString()}일</div>
        <div className={s.heroSub}>{fmtDateKo(aD, false)} → {fmtDateKo(bD, false)}{swapped && ' (반대 입력 자동 보정)'}</div>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>상세 분석</label>
        <div className={s.diffTable}>
          <div className={s.diffRow}><span>일수</span><span>{totalDays.toLocaleString()}일</span></div>
          <div className={s.diffRow}><span>주</span><span>{Math.floor(totalDays / 7)}주 {totalDays % 7}일</span></div>
          <div className={s.diffRow}><span>시간</span><span>{(totalDays * 24).toLocaleString()}시간</span></div>
          <div className={s.diffRow}><span>분</span><span>{(totalDays * 24 * 60).toLocaleString()}분</span></div>
          <div className={s.diffRow}><span>평일</span><span>{weekdays}일</span></div>
          <div className={s.diffRow}><span>영업일</span><span>{businessDays}일</span></div>
          <div className={s.diffRow}><span>주말 횟수</span><span>{weekends}번</span></div>
          <div className={s.diffRow}><span>한국 공휴일</span><span>{holidays.length}개</span></div>
          <div className={s.diffRow}><span>차이 (년·월·일)</span><span>{ymd.years}년 {ymd.months}월 {ymd.days}일</span></div>
        </div>
        {holidays.length > 0 && (
          <p className={s.holidayList}>
            <strong style={{ color: 'var(--text)' }}>포함 공휴일:</strong> {holidays.map(h => h.name).join(' · ')}
          </p>
        )}
      </div>
    </>
  )
}

/* ═════════════════════════════════════════ 탭 5 — 영업일·N일 후 ═════════════════════════════════════════ */
function BizTab({ now }: { now: Date }) {
  const todayStr = fmtDate(now)
  const [startDate, setStartDate] = useState(todayStr)
  const [n, setN] = useState('30')
  const [mode, setMode] = useState<AddDaysMode>('calendar')

  const nNum = Number(n) || 0
  const result = startDate && nNum !== 0 ? addDays(startDate, nNum, mode) : null

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>N일 후 계산</label>
        <div className={s.fieldRow}>
          <div>
            <span className={s.inlineLabel}>시작 날짜</span>
            <input className={s.dateInput} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <span className={s.inlineLabel}>N일 (음수 가능)</span>
            <input className={s.numInput} type="number" placeholder="30"
              value={n} onChange={e => setN(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <span className={s.inlineLabel}>계산 모드</span>
          <div className={s.modeRow}>
            {([
              ['calendar', '달력일'],
              ['weekday',  '평일'],
              ['business', '영업일'],
            ] as [AddDaysMode, string][]).map(([k, l]) => (
              <button key={k} className={`${s.modeBtn} ${mode === k ? s.modeActive : ''}`}
                onClick={() => setMode(k)}>{l}</button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text)' }}>달력일</strong>: 모든 날짜 / <strong style={{ color: 'var(--text)' }}>평일</strong>: 월~금 / <strong style={{ color: 'var(--text)' }}>영업일</strong>: 평일 + 한국 공휴일 제외
          </p>
        </div>
      </div>

      {result && (
        <>
          <div className={s.heroBig}>
            <div className={s.heroLabel}>
              {nNum > 0 ? `${nNum} ` : `${Math.abs(nNum)}일 전 `}
              {mode === 'calendar' ? '달력일' : mode === 'weekday' ? '평일' : '영업일'}
              {nNum > 0 ? ' 후' : ''}
            </div>
            <div className={s.heroNum} style={{ fontSize: 'clamp(36px, 8vw, 56px)' }}>
              {fmtDate(result)}
            </div>
            <div className={s.heroSub}>{fmtDateKo(result)}</div>
          </div>

          <div className={s.statsGrid}>
            <div className={s.statBox}>
              <div className={s.statNum}>{['일', '월', '화', '수', '목', '금', '토'][result.getDay()]}</div>
              <div className={s.statLabel}>요일</div>
              <div className={s.statSub}>
                {result.getDay() === 0 || result.getDay() === 6 ? '주말' : '평일'}
              </div>
            </div>
            <div className={s.statBox}>
              <div className={s.statNum}>{isHoliday(result) ? '✓' : '—'}</div>
              <div className={s.statLabel}>한국 공휴일</div>
              <div className={s.statSub}>{isHoliday(result)?.name ?? '아님'}</div>
            </div>
            <div className={s.statBox}>
              <div className={s.statNum}>
                {Math.abs(Math.round((result.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))}
              </div>
              <div className={s.statLabel}>달력일</div>
              <div className={s.statSub}>시작일~결과</div>
            </div>
          </div>
        </>
      )}

      <div className={s.card}>
        <label className={s.cardLabel}>빠른 예시 — 오늘 기준</label>
        <div className={s.fieldRow}>
          <div>
            <span className={s.inlineLabel}>14일 후</span>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text)' }}>
              {fmtDate(addDays(todayStr, 14, mode))}
            </div>
          </div>
          <div>
            <span className={s.inlineLabel}>30일 후</span>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text)' }}>
              {fmtDate(addDays(todayStr, 30, mode))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
