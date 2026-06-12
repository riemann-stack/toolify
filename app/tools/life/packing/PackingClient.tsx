/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './packing.module.css'
import {
  CLIMATES, LAUNDRIES, ACTIVITIES, PHOTOS, CHECKLISTS, SCENARIOS,
  type Climate, type Laundry, type Activity, type PhotoLevel, type PackingInputs,
  getClimate, getLaundry,
  calcPacking, fmt, fmtKg,
} from './packingUtils'

type Tab = 'calc' | 'check' | 'climate' | 'scenario'

const STORAGE_KEY = 'youtil_packing_v1'

export default function PackingClient() {
  const [tab, setTab] = useState<Tab>('calc')

  /* 입력 */
  const [days, setDays] = useState('5')
  const [climate, setClimate] = useState<Climate>('mild')
  const [laundry, setLaundry] = useState<Laundry>('weekly')
  const [activity, setActivity] = useState<Activity>('city')
  const [photo, setPhoto] = useState<PhotoLevel>('normal')
  const [needSports, setNeedSports] = useState(false)
  const [needFormal, setNeedFormal] = useState(false)
  const [needBaby, setNeedBaby] = useState(false)
  const [people, setPeople] = useState('1')

  /* 체크리스트 상태 */
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.days) setDays(j.days)
      if (j.climate) setClimate(j.climate)
      if (j.laundry) setLaundry(j.laundry)
      if (j.activity) setActivity(j.activity)
      if (j.photo) setPhoto(j.photo)
      if (typeof j.needSports === 'boolean') setNeedSports(j.needSports)
      if (typeof j.needFormal === 'boolean') setNeedFormal(j.needFormal)
      if (typeof j.needBaby === 'boolean') setNeedBaby(j.needBaby)
      if (j.people) setPeople(j.people)
      if (j.checked) setChecked(j.checked)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ days, climate, laundry, activity, photo, needSports, needFormal, needBaby, people, checked }))
    } catch {}
  }, [days, climate, laundry, activity, photo, needSports, needFormal, needBaby, people, checked])

  /* 계산 */
  const inp: PackingInputs = useMemo(() => ({
    days: parseInt(days) || 1,
    climate, laundry, activity, photo, needSports, needFormal,
    people: parseInt(people) || 1,
  }), [days, climate, laundry, activity, photo, needSports, needFormal, people])

  const minResult = useMemo(() => calcPacking(inp, 'min'), [inp])
  const comfortResult = useMemo(() => calcPacking(inp, 'comfort'), [inp])

  const cliMeta = getClimate(climate)
  const lauMeta = getLaundry(laundry)

  /* 시나리오 적용 */
  const applyScenario = (id: string) => {
    const sc = SCENARIOS.find((s) => s.id === id)
    if (!sc) return
    setDays(String(sc.inputs.days))
    setClimate(sc.inputs.climate)
    setLaundry(sc.inputs.laundry)
    setActivity(sc.inputs.activity)
    setPhoto(sc.inputs.photo)
    setNeedSports(sc.inputs.needSports)
    setNeedFormal(sc.inputs.needFormal)
    setNeedBaby(sc.id === 'baby_family')
    setPeople(String(sc.inputs.people))
    setTab('calc')
  }

  /* 체크리스트 토글 */
  const toggleCheck = (id: string) => setChecked((p) => ({ ...p, [id]: !p[id] }))
  /* 아기 동반이 아니면 아기 카테고리 숨김 (PKR2-6) */
  const visibleChecklists = useMemo(
    () => CHECKLISTS.filter((c) => !c.optional || needBaby),
    [needBaby],
  )
  /* 진행률 분모 = 의류(계산 결과) + 화면에 보이는 체크리스트만 → 100% 초과 방지 (PKR2-2) */
  const checkIds = useMemo(() => {
    const ids: string[] = comfortResult.items.map((it) => `top_${it.id}`)
    visibleChecklists.forEach((c) => {
      for (let i = 0; i < c.items.length; i++) ids.push(`${c.id}_${i}`)
    })
    return ids
  }, [comfortResult, visibleChecklists])
  const totalCheckItems = checkIds.length
  const checkedCount = checkIds.filter((id) => checked[id]).length
  const checkedPct = totalCheckItems > 0 ? Math.round((checkedCount / totalCheckItems) * 100) : 0

  /* 체크리스트 텍스트 복사 */
  const copyChecklist = async () => {
    let text = `🧳 여행 체크리스트 (${days}일 · ${cliMeta.label})\n\n`
    text += `👕 의류 (계산 결과)\n`
    comfortResult.items.forEach((it) => {
      text += `  □ ${it.label}: ${it.count}개\n`
    })
    text += '\n'
    visibleChecklists.forEach((c) => {
      text += `${c.emoji} ${c.label}\n`
      c.items.forEach((it) => {
        text += `  □ ${it}\n`
      })
      text += '\n'
    })
    try {
      await navigator.clipboard.writeText(text)
      alert('✅ 체크리스트가 클립보드에 복사되었습니다!')
    } catch {
      alert('❌ 복사 실패. 브라우저가 지원하지 않을 수 있어요.')
    }
  }

  return (
    <div className={s.wrap}>
      {/* 안내 */}
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/life/travel-budget', label: '여행 예산' },
          { href: '/tools/life/lotto', label: '로또 번호 생성기' },
          { href: '/tools/life/dutch', label: '더치페이 계산기' }
        ]}
      >
        사용 안내 권장 개수는 일반 가이드 — 개인 취향·세탁 빈도·날씨 변화에 따라 조정. 항공사 수하물 한도는 항공사·노선·등급에 따라 다름 (확인 필수). 비상시 현지 구입 가능 (속옷·양말은 마트·편의점).
      </Disclaimer>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`} role="tablist" aria-label="여행 짐 도구 모드">
        {([
          { id: 'calc',     label: '🧳 옷 계산' },
          { id: 'check',    label: '✅ 체크리스트' },
          { id: 'climate',  label: '🌡️ 기온별 가이드' },
          { id: 'scenario', label: '🎯 시나리오' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`${s.tab} ${tab === t.id ? s.tabActive : ''}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════ 탭 1: 옷 계산 ════════ */}
      {tab === 'calc' && (
        <>
          {/* 입력 — 슬라이더 2개만, 프리셋 제거 */}
          <div className={s.card}>
            <span className={s.cardLabel}>여행 기본 정보</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.sliderLabel}>
                  여행 일수
                  <strong className={s.sliderValue}>{days}일 <span className={s.sliderValueHint}>({Math.max(0, parseInt(days) - 1)}박)</span></strong>
                </label>
                <input type="range" min={1} max={30} step={1} value={days} onChange={(e) => setDays(e.target.value)} className={s.slider} aria-label="여행 일수" aria-valuetext={`${days}일 (${Math.max(0, parseInt(days) - 1)}박)`} />
              </div>
              <div className={s.field}>
                <label className={s.sliderLabel}>
                  인원
                  <strong className={s.sliderValue}>{people}명</strong>
                </label>
                <input type="range" min={1} max={6} step={1} value={people} onChange={(e) => setPeople(e.target.value)} className={s.slider} aria-label="인원" aria-valuetext={`${people}명`} />
              </div>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>여행지 기온</span>
            <div className={s.climateRow} role="group" aria-label="여행지 기온">
              {CLIMATES.map((c) => (
                <button
                  key={c.id}
                  aria-pressed={climate === c.id}
                  aria-label={`${c.label} (${c.range})`}
                  className={`${s.climateBtn} ${climate === c.id ? s.climateBtnActive : ''}`}
                  onClick={() => setClimate(c.id)}
                  type="button"
                  style={{ borderTopColor: c.color }}
                >
                  <span className={s.climateEmoji} aria-hidden="true">{c.emoji}</span>
                  <span className={s.climateLabel}>{c.label}</span>
                  <span className={s.climateRange}>{c.range}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 세탁·활동량·사진·옵션 — 한 카드로 통합해 모바일 공간 절약 */}
          <div className={s.card}>
            <span className={s.cardLabel}>세탁 · 활동량 · 사진</span>
            <div className={s.compactGrid}>
              <div className={s.compactField}>
                <span className={s.compactLabel}>세탁</span>
                <div className={s.pillRow} role="group" aria-label="세탁 가능 여부">
                  {LAUNDRIES.map((l) => (
                    <button key={l.id} aria-pressed={laundry === l.id} className={`${s.pill} ${laundry === l.id ? s.pillActive : ''}`} onClick={() => setLaundry(l.id)} type="button" title={l.desc}>
                      {l.emoji} {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={s.compactField}>
                <span className={s.compactLabel}>활동량</span>
                <div className={s.pillRow} role="group" aria-label="활동량">
                  {ACTIVITIES.map((a) => (
                    <button key={a.id} aria-pressed={activity === a.id} className={`${s.pill} ${activity === a.id ? s.pillActive : ''}`} onClick={() => setActivity(a.id)} type="button" title={a.desc}>
                      {a.emoji} {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={s.compactField}>
                <span className={s.compactLabel}>사진</span>
                <div className={s.pillRow} role="group" aria-label="사진 중요도">
                  {PHOTOS.map((p) => (
                    <button key={p.id} aria-pressed={photo === p.id} className={`${s.pill} ${photo === p.id ? s.pillActive : ''}`} onClick={() => setPhoto(p.id)} type="button">
                      {p.emoji} {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={s.optionToggleRow}>
              <button
                type="button"
                className={`${s.optionToggle} ${needSports ? s.optionToggleActive : ''}`}
                onClick={() => setNeedSports(!needSports)}
                aria-pressed={needSports}
              >
                <span className={s.optionToggleCheck}>{needSports ? '✓' : ''}</span>
                🏃 운동복
              </button>
              <button
                type="button"
                className={`${s.optionToggle} ${needFormal ? s.optionToggleActive : ''}`}
                onClick={() => setNeedFormal(!needFormal)}
                aria-pressed={needFormal}
              >
                <span className={s.optionToggleCheck}>{needFormal ? '✓' : ''}</span>
                👔 격식
              </button>
              <button
                type="button"
                className={`${s.optionToggle} ${needBaby ? s.optionToggleActive : ''}`}
                onClick={() => setNeedBaby(!needBaby)}
                aria-pressed={needBaby}
              >
                <span className={s.optionToggleCheck}>{needBaby ? '✓' : ''}</span>
                👶 아기 동반
              </button>
            </div>
            <p className={s.helpText} style={{ marginTop: 6 }}>{lauMeta.desc}</p>
            {needBaby && <p className={s.helpText} style={{ marginTop: 2 }}>👶 아기 용품은 <strong>✅ 체크리스트</strong> 탭에 별도 카테고리로 추가됩니다 (의류 수량 계산과는 별개).</p>}
          </div>

          {/* 메인 결과 */}
          <div className={s.hero} aria-live="polite">
            <p className={s.heroLabel}>{cliMeta.emoji} {cliMeta.label} · {days}일 ({Math.max(0, parseInt(days) - 1)}박) · {people}명</p>
            <p className={s.heroValue}>
              1인 총 무게 <strong>{fmtKg(comfortResult.totalWeight)}</strong>
            </p>
            <p className={s.heroSub}>
              의류 {fmtKg(comfortResult.clothingWeight)} + 비의류 추정 {fmtKg(comfortResult.extrasWeight)} + 캐리어 {fmtKg(comfortResult.carrierWeight)}
              {inp.people > 1 && <> · 전체 {inp.people}명 ≈ <strong style={{ color: 'var(--accent)' }}>{fmtKg(comfortResult.groupTotal)}</strong></>}
              <br />추천 캐리어 (1인당) <strong style={{ color: 'var(--accent)' }}>{comfortResult.carrier.label}</strong>
              {' · '}{comfortResult.carrier.capacity}
              <br />🗜️ 압축팩은 <strong>부피만 약 30% 절약</strong> — 무게·항공 수하물 한도는 그대로입니다
            </p>
          </div>

          {/* 2 버전 비교 */}
          <div className={s.versionGrid}>
            <div className={s.versionCard}>
              <p className={s.versionTitle}>🎒 최소 짐 (Minimal)</p>
              <p className={s.versionDesc}>가볍게 + 세탁 활용</p>
              <p className={s.versionTotal}>{fmtKg(minResult.totalWeight)}</p>
              <table className={s.versionTable}>
                <tbody>
                  {minResult.items.map((it) => (
                    <tr key={it.id}>
                      <td>{it.emoji} {it.label}</td>
                      <td className={s.cellMono}>{it.count}개</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={`${s.versionCard} ${s.versionCardComfort}`}>
              <p className={s.versionTitle}>🧳 넉넉한 버전 (Comfort)</p>
              <p className={s.versionDesc}>여유롭게 + 비상복</p>
              <p className={s.versionTotal} style={{ color: 'var(--accent)' }}>{fmtKg(comfortResult.totalWeight)}</p>
              <table className={s.versionTable}>
                <tbody>
                  {comfortResult.items.map((it) => (
                    <tr key={it.id}>
                      <td>{it.emoji} {it.label}</td>
                      <td className={`${s.cellMono} ${s.cellAccent}`}>{it.count}개</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className={s.helpText} style={{ textAlign: 'center', marginTop: -2 }}>
            ※ 모든 무게는 <strong>1인 1캐리어 기준</strong> — 의류 + 비의류 추정 2.5kg(세면·화장품·전자·약·잡화) + 캐리어 자체
          </p>

          {/* 캐리어 안내 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🛄 캐리어·항공사 수하물 (1인 기준)</span>
            <p className={s.tipBox}>{comfortResult.airline}</p>
            <div className={s.tableScroll} style={{ marginTop: 10 }}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th scope="col">캐리어</th>
                    <th scope="col">크기</th>
                    <th scope="col">용량</th>
                    <th scope="col">적합한 일수</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>🎒 기내 휴대 (20인치)</td><td className={s.cellMono}>~ 55cm</td><td className={s.cellMono}>~ 7kg</td><td>1~3박</td></tr>
                  <tr><td>🧳 24인치 (중형)</td><td className={s.cellMono}>~ 65cm</td><td className={s.cellMono}>~ 15kg</td><td>3~7박</td></tr>
                  <tr><td>🧳 28인치 (대형)</td><td className={s.cellMono}>~ 75cm</td><td className={s.cellMono}>~ 23kg</td><td>7박~</td></tr>
                </tbody>
              </table>
            </div>
            <p className={s.helpText} style={{ marginTop: 8 }}>
              ※ 항공사·노선·등급별 한도 다름. LCC 기내 7~10kg, 위탁 15~20kg / 풀서비스 7~12kg, 위탁 23kg 표준.
            </p>
            {(climate === 'frigid' || climate === 'winter') && (
              <p className={s.tipBox} style={{ marginTop: 8 }}>
                🧥 겨울 패딩·니트는 무게가 가벼워도 <strong>부피가 커서</strong> 추천보다 한 단계 큰 캐리어가 필요할 수 있어요. 압축팩으로 부피를 줄이면 도움이 됩니다.
              </p>
            )}
          </div>

          {/* 기온 가이드 카드 */}
          <div className={s.card}>
            <span className={s.cardLabel}>{cliMeta.emoji} {cliMeta.label} ({cliMeta.range}) 가이드</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <tbody>
                  <tr><td>권장 상의</td><td>{cliMeta.tops}</td></tr>
                  <tr><td>권장 아우터</td><td>{cliMeta.outers} ({cliMeta.outerCount}벌)</td></tr>
                  <tr><td>필수 악세서리</td><td>{cliMeta.accessories}</td></tr>
                </tbody>
              </table>
            </div>
            <p className={s.tipBox} style={{ marginTop: 10 }}>💡 {cliMeta.tip}</p>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 체크리스트 ════════ */}
      {tab === 'check' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>✅ 통합 체크리스트</p>
            <p className={s.heroValue}>
              <strong>{checkedCount}</strong> / {totalCheckItems}
            </p>
            <p className={s.heroSub}>
              완료 <strong style={{ color: 'var(--accent)' }}>{checkedPct}%</strong>
              <br /><span style={{ fontSize: 12, color: 'var(--muted)' }}>의류(계산 결과) + {needBaby ? '아기 포함 ' : ''}준비물 기준</span>
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
              <button className={s.copyBtn} onClick={copyChecklist} type="button">📋 클립보드 복사</button>
              <button className={s.copyBtn} onClick={() => setChecked({})} type="button">↺ 초기화</button>
            </div>
          </div>

          {/* 의류 (계산 결과 자동) */}
          <div className={s.card}>
            <span className={s.cardLabel}>👕 의류 (계산 결과)</span>
            <div className={s.checkGrid}>
              {comfortResult.items.map((it) => (
                <label key={it.id} className={s.checkItem}>
                  <input type="checkbox" checked={!!checked[`top_${it.id}`]} onChange={() => toggleCheck(`top_${it.id}`)} />
                  <span>{it.emoji} {it.label} <strong>×{it.count}</strong></span>
                </label>
              ))}
            </div>
          </div>

          {/* 카테고리별 체크리스트 (아기 동반 시에만 아기 카테고리 노출) */}
          {visibleChecklists.map((cat) => (
            <div key={cat.id} className={s.card}>
              <span className={s.cardLabel}>{cat.emoji} {cat.label} {cat.optional && <span style={{ color: 'var(--muted)', textTransform: 'none' }}>(선택)</span>}</span>
              <div className={s.checkGrid}>
                {cat.items.map((item, i) => {
                  const id = `${cat.id}_${i}`
                  return (
                    <label key={id} className={s.checkItem}>
                      <input type="checkbox" checked={!!checked[id]} onChange={() => toggleCheck(id)} />
                      <span>{item}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ════════ 탭 3: 기온별 가이드 ════════ */}
      {tab === 'climate' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>🌡️ 기온대별 패킹 가이드</p>
            <p className={s.heroValue}>6 기온대</p>
            <p className={s.heroSub}>여행지 기온에 맞게 의류·아우터·악세서리 추천</p>
          </div>

          <div className={s.climateGuideGrid}>
            {CLIMATES.map((c) => (
              <button
                key={c.id}
                aria-pressed={climate === c.id}
                className={`${s.climateGuideCard} ${climate === c.id ? s.climateGuideActive : ''}`}
                onClick={() => { setClimate(c.id); setTab('calc') }}
                type="button"
                style={{ borderTopColor: c.color }}
              >
                <p className={s.climateGuideHead}>
                  <span className={s.climateGuideEmoji}>{c.emoji}</span>
                  <strong>{c.label}</strong>
                  <span style={{ color: c.color, fontSize: 11, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{c.range}</span>
                </p>
                <div className={s.climateGuideContent}>
                  <p><strong>👕 상의</strong>: {c.tops}</p>
                  <p><strong>🧥 아우터</strong>: {c.outers} ({c.outerCount}벌)</p>
                  <p><strong>🎒 악세서리</strong>: {c.accessories}</p>
                </div>
                <p className={s.climateGuideTip}>💡 {c.tip}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ════════ 탭 4: 시나리오 프리셋 ════════ */}
      {tab === 'scenario' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>🎯 한국인 자주 가는 6 시나리오</p>
            <p className={s.heroValue}>원클릭 자동 입력</p>
            <p className={s.heroSub}>신혼·동남아·유럽·골프·캠핑·아기 동반</p>
          </div>

          <div className={s.scenarioGrid}>
            {SCENARIOS.map((sc) => {
              const r = calcPacking(sc.inputs, 'comfort')
              return (
                <div key={sc.id} className={s.scenarioCard}>
                  <p className={s.scenarioHead}>
                    <span className={s.scenarioEmoji}>{sc.emoji}</span>
                    <strong>{sc.title}</strong>
                  </p>
                  <p className={s.scenarioDesc}>{sc.desc}</p>
                  <div className={s.scenarioMeta}>
                    <span>📅 {Math.max(0, sc.inputs.days - 1)}박 {sc.inputs.days}일</span>
                    <span>{getClimate(sc.inputs.climate).emoji} {getClimate(sc.inputs.climate).label}</span>
                    <span>👥 {sc.inputs.people}명</span>
                    <span>⚖️ 1인 {fmtKg(r.totalWeight)}</span>
                  </div>
                  <div className={s.scenarioNotes}>
                    {sc.notes.map((n, i) => (
                      <p key={i} className={s.scenarioNote}>{n}</p>
                    ))}
                  </div>
                  <button className={s.scenarioApply} onClick={() => applyScenario(sc.id)} type="button">
                    이 시나리오로 시작 →
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* 크로스링크 */}
      <Link href="/tools/life/travel-budget" className={s.crossLink}>
        ✈️ 해외여행 예산 계산기 → 18 도시 × 3 스타일 + 항목 진단
      </Link>
    </div>
  )
}

void fmt
