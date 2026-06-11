/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './tea.module.css'
import {
  TEAS, VESSELS, STRENGTHS, COLD_GUIDES,
  type TeaId, type Vessel, type Strength, type ColdMode,
  getTea, getVessel, recommendWaterMl, recommendLeafG, recommendTemp, recommendTime,
  caffeineMg, tanninRisk, tanninZoneColor, tanninLabel,
  buildSteepSchedule, fmt, fmtTime,
} from './teaUtils'

type Tab = 'calc' | 'guide'

const STORAGE_KEY = 'youtil_tea_v1'

const LEAF_PRESETS = [2, 3, 5]
const WATER_PRESETS = [200, 350, 500]
const ALL_VESSELS: Vessel[] = VESSELS.map((v) => v.id)

export default function TeaClient() {
  const [tab, setTab] = useState<Tab>('calc')

  /* 공통 */
  const [teaId, setTeaId] = useState<TeaId>('green')
  const [vessel, setVessel] = useState<Vessel>('mug')
  const [strength, setStrength] = useState<Strength>('normal')
  const [leafG, setLeafG] = useState('3')
  const [waterMl, setWaterMl] = useState('200')
  const [coldOn, setColdOn] = useState(false)
  const [coldMode, setColdMode] = useState<ColdMode>('fridge')

  /* 떫음 게이지용 시간 */
  const [actualSec, setActualSec] = useState('60')

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.teaId) setTeaId(j.teaId)
      if (j.vessel) setVessel(j.vessel)
      if (j.strength) setStrength(j.strength)
      if (j.leafG) setLeafG(j.leafG)
      if (j.waterMl) setWaterMl(j.waterMl)
      if (typeof j.coldOn === 'boolean') setColdOn(j.coldOn)
      if (j.coldMode) setColdMode(j.coldMode)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ teaId, vessel, strength, leafG, waterMl, coldOn, coldMode }))
    } catch {}
  }, [teaId, vessel, strength, leafG, waterMl, coldOn, coldMode])

  const tea = getTea(teaId)
  const leaf = parseFloat(leafG) || 0
  const water = parseFloat(waterMl) || 0
  const sec = parseInt(actualSec) || 0

  // 차별 허용 다구 — 비현실 조합 차단 (말차=차완, 옥로=다관/게이완). 선택값이 허용 밖이면 추천 다구로 대체
  const allowedVessels = tea.vessels ?? ALL_VESSELS
  const effVessel: Vessel = allowedVessels.includes(vessel) ? vessel : tea.vessel

  // React Compiler가 자동 메모이즈 — 순수 파생값이라 수동 useMemo 불필요
  const recoWater = recommendWaterMl(tea, leaf, strength)
  const recoLeaf = recommendLeafG(tea, water, strength)
  const tempReco = recommendTemp(tea, strength)
  const timeReco = recommendTime(tea, strength, effVessel)
  const caffeine = caffeineMg(tea, leaf)
  const risk = tanninRisk(tea, sec, strength, effVessel)

  const coldGuide = COLD_GUIDES.find((g) => g.mode === coldMode)!

  /* 다탕 스케줄 — 시간은 진하기와 무관(원칙), 티백만 0.7배 → 1탕은 위 권장 시간과 일치 */
  const steepTimeMul = effVessel === 'teabag' ? 0.7 : 1
  const steepSchedule = buildSteepSchedule(tea, steepTimeMul)

  /* 카페인 막대그래프 (탭 2) */
  const maxCaff = Math.max(...TEAS.map((t) => t.caffeineMgPerG))

  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/cooking/recipe', label: '레시피 비율 계산기' },
          { href: '/tools/cooking/brew', label: '커피 브루잉 계산기' },
          { href: '/tools/cooking/egg-timer', label: '계란 삶는 시간' }
        ]}
      >
        사용 안내 권장값은 한국·일본·중국 차 협회 일반 가이드입니다. 차 등급·산지·로스팅·개인 취향에 따라 자유롭게 조정하세요. 카페인 함량은 추정치이며, 임산부·수면 민감자는 참고만 하세요.
      </Disclaimer>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs2}`} role="tablist" aria-label="차 계산기 메뉴">
        {([
          { id: 'calc',  label: '🍵 우리기 계산' },
          { id: 'guide', label: '📊 차 가이드' },
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

      {/* ════════ 탭 1: 우리기 계산 ════════ */}
      {tab === 'calc' && (
        <>
          {/* 차 종류 — 3열 컴팩트 */}
          <div className={s.card}>
            <span className={s.cardLabel}>차 종류 (9종)</span>
            <div className={s.teaGrid}>
              {TEAS.map((t) => (
                <button
                  key={t.id}
                  aria-pressed={teaId === t.id}
                  className={`${s.teaBtn} ${teaId === t.id ? s.teaBtnActive : ''}`}
                  onClick={() => setTeaId(t.id)}
                  type="button"
                >
                  <span className={s.teaHead}>
                    <span className={s.teaEmoji}>{t.emoji}</span>
                    <span className={s.teaLabel}>{t.shortName}</span>
                  </span>
                  <span className={s.teaDesc}>{t.tempMin}~{t.tempMax}°C · 1:{t.ratioWaterPerLeaf}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 다구·진하기 */}
          <div className={s.card}>
            <span className={s.cardLabel}>다구 · 진하기</span>
            <div className={s.field}>
              <label className={s.fieldLabel}>다구</label>
              <div className={s.pillRow}>
                {VESSELS.filter((v) => allowedVessels.includes(v.id)).map((v) => (
                  <button
                    key={v.id}
                    aria-pressed={effVessel === v.id}
                    className={`${s.pill} ${effVessel === v.id ? s.pillActive : ''}`}
                    onClick={() => setVessel(v.id)}
                    type="button"
                    title={v.desc}
                  >
                    {v.emoji} {v.label}
                  </button>
                ))}
              </div>
              <p className={s.helpText}>
                💡 {tea.shortName} 추천: {getVessel(tea.vessel).emoji} <strong>{getVessel(tea.vessel).label}</strong>
              </p>
            </div>

            <div className={s.field}>
              <label className={s.fieldLabel}>진하기</label>
              <div className={s.pillRow}>
                {(Object.keys(STRENGTHS) as Strength[]).map((st) => (
                  <button
                    key={st}
                    aria-pressed={strength === st}
                    className={`${s.pill} ${strength === st ? s.pillActive : ''}`}
                    onClick={() => setStrength(st)}
                    type="button"
                  >
                    {STRENGTHS[st].emoji} {STRENGTHS[st].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 찻잎·물 — 항상 2-column */}
          <div className={s.card}>
            <span className={s.cardLabel}>찻잎 · 물</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>찻잎 (g)</label>
                <input
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={leafG}
                  onChange={(e) => setLeafG(e.target.value)}
                  min={0.5} max={50} step={0.5}
                />
                <div className={s.pillRow} style={{ marginTop: 6 }}>
                  {LEAF_PRESETS.map((g) => (
                    <button key={g} aria-pressed={parseFloat(leafG) === g}
                      className={`${s.pill} ${parseFloat(leafG) === g ? s.pillActive : ''}`}
                      onClick={() => setLeafG(String(g))} type="button">
                      {g}g
                    </button>
                  ))}
                </div>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>물 (ml)</label>
                <input
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={waterMl}
                  onChange={(e) => setWaterMl(e.target.value)}
                  min={50} max={2000} step={10}
                />
                <div className={s.pillRow} style={{ marginTop: 6 }}>
                  {WATER_PRESETS.map((w) => (
                    <button key={w} aria-pressed={parseFloat(waterMl) === w}
                      className={`${s.pill} ${parseFloat(waterMl) === w ? s.pillActive : ''}`}
                      onClick={() => setWaterMl(String(w))} type="button">
                      {w}ml
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <label className={s.coldToggle}>
              <input
                type="checkbox"
                checked={coldOn}
                onChange={(e) => setColdOn(e.target.checked)}
              />
              🧊 냉침 모드 (상온·냉장 장시간 추출)
            </label>
            {coldOn && (
              <div className={s.pillRow} style={{ marginTop: 8 }}>
                {COLD_GUIDES.map((g) => (
                  <button
                    key={g.mode}
                    aria-pressed={coldMode === g.mode}
                    className={`${s.pill} ${coldMode === g.mode ? s.pillActive : ''}`}
                    onClick={() => setColdMode(g.mode)}
                    type="button"
                  >
                    {g.mode === 'fridge' ? '❄️' : '🌡️'} {g.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 메인 결과 — 냉침 OFF/ON 분기 */}
          {coldOn ? (
            <div className={s.hero}>
              <p className={s.heroLabel}>{tea.emoji} {tea.shortName} · {coldGuide.label}</p>
              <div className={s.heroResult}>
                <div className={s.heroBlock}>
                  <span className={s.heroBlockLabel}>물 온도</span>
                  <strong className={s.heroBlockValue}>
                    {coldMode === 'room' ? '~20°C' : '~4°C'}
                  </strong>
                </div>
                <div className={s.heroBlock}>
                  <span className={s.heroBlockLabel}>우림 시간</span>
                  <strong className={s.heroBlockValue}>{coldGuide.hourMin}~{coldGuide.hourMax}시간</strong>
                </div>
                <div className={s.heroBlock}>
                  <span className={s.heroBlockLabel}>예상 카페인</span>
                  <strong className={s.heroBlockValue}>{fmt(caffeine * 0.6, 0)} mg</strong>
                </div>
              </div>
              <p className={s.heroSub} style={{ marginTop: 12 }}>
                찻잎 {leaf}g + 물 {water}ml · 핫 추출 대비 카페인·탄닌 약 40~50% 적음
              </p>
            </div>
          ) : (
            <div className={s.hero}>
              <p className={s.heroLabel}>{tea.emoji} {tea.shortName} · {STRENGTHS[strength].emoji} {STRENGTHS[strength].label}</p>
              <div className={s.heroResult}>
                <div className={s.heroBlock}>
                  <span className={s.heroBlockLabel}>물 온도</span>
                  <strong className={s.heroBlockValue}>{tempReco.min}~{tempReco.max}°C</strong>
                </div>
                <div className={s.heroBlock}>
                  <span className={s.heroBlockLabel}>1탕 시간</span>
                  <strong className={s.heroBlockValue}>{fmtTime(timeReco)}</strong>
                </div>
                <div className={s.heroBlock}>
                  <span className={s.heroBlockLabel}>권장 물</span>
                  <strong className={s.heroBlockValue}>{recoWater}ml</strong>
                </div>
              </div>
              <p className={s.heroSub} style={{ marginTop: 12 }}>
                찻잎:물 {leaf > 0 ? `1:${Math.round(water / leaf)}` : '—'} (입력) vs 권장 1:{Math.round(tea.ratioWaterPerLeaf * STRENGTHS[strength].ratioMul)}
                {water > 0 && <> · 물 {water}ml 기준 권장 찻잎 <strong>{recoLeaf}g</strong></>}
              </p>
            </div>
          )}

          {/* 냉침 비교표 (냉침 ON일 때만) */}
          {coldOn && (
            <div className={s.card}>
              <span className={s.cardLabel}>핫 추출 vs 냉침</span>
              <div className={s.tableScroll}>
                <table className={s.detailTable}>
                  <thead>
                    <tr><th>항목</th><th>핫 추출</th><th>냉침</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>카페인</td><td className={s.cellMono}>{fmt(caffeine, 0)} mg</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmt(caffeine * 0.6, 0)} mg (−40%)</td></tr>
                    <tr><td>탄닌</td><td className={s.cellMono}>표준</td><td className={`${s.cellMono} ${s.cellAccent}`}>약 50% 적음</td></tr>
                    <tr><td>맛·향</td><td>풍부·강함</td><td>부드럽고 섬세</td></tr>
                    <tr><td>시간</td><td className={s.cellMono}>1~5분</td><td className={s.cellMono}>{coldGuide.hourMin}~{coldGuide.hourMax}시간</td></tr>
                  </tbody>
                </table>
              </div>
              <p className={s.helpText} style={{ marginTop: 10 }}>
                💡 위생: 끓인 후 식힌 물·정수기물 권장, 추출 후 24~48시간 내 음용. 너무 진하면 물·우유로 희석.
              </p>
            </div>
          )}

          {/* 떫음 게이지 — 핫 추출일 때만 */}
          {!coldOn && (
            <div className={s.card}>
              <span className={s.cardLabel}>떫어질 위험도 (실제 우림 시간 기준)</span>
              <div className={s.field}>
                <label className={s.fieldLabel}>실제 우림 시간 (초) — 권장 {fmtTime(timeReco)}</label>
                <input
                  type="range"
                  min={5}
                  max={Math.max(timeReco * 3, 600)}
                  step={5}
                  value={Math.min(sec, Math.max(timeReco * 3, 600))}
                  onChange={(e) => setActualSec(e.target.value)}
                  className={s.slider}
                />
                <input
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={actualSec}
                  onChange={(e) => setActualSec(e.target.value)}
                  min={1} max={1200} step={5}
                  style={{ marginTop: 8 }}
                />
              </div>

              <svg viewBox="0 0 420 60" width="100%" style={{ maxWidth: 600 }}>
                <defs>
                  <linearGradient id="tanninGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0D9488" />
                    <stop offset="40%" stopColor="#0D9488" />
                    <stop offset="50%" stopColor="#D97706" />
                    <stop offset="70%" stopColor="#D97706" />
                    <stop offset="80%" stopColor="#DB2777" />
                    <stop offset="100%" stopColor="#DB2777" />
                  </linearGradient>
                </defs>
                <rect x={0} y={20} width={420} height={22} rx={5} fill="var(--bg3)" />
                <rect x={0} y={20} width={(risk / 100) * 420} height={22} rx={5} fill="url(#tanninGrad)" />
                <line x1={(30 / 100) * 420} y1={15} x2={(30 / 100) * 420} y2={47} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3,2" />
                <text x={(30 / 100) * 420} y={56} fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>권장</text>
              </svg>

              <div className={s.hero} style={{ marginTop: 12 }}>
                <p className={s.heroLabel}>현재 위험도</p>
                <p className={s.heroValue} style={{ color: tanninZoneColor(risk) }}>
                  <strong>{risk}%</strong>
                </p>
                <p className={s.heroSub}>{tanninLabel(risk)}</p>
              </div>
            </div>
          )}

          {/* 진하기 조절 원칙 */}
          {!coldOn && (
            <div className={s.tipCard}>
              <strong>💡 진하게 마시고 싶다면</strong>
              <ul>
                <li>✅ <strong>찻잎 양 1.5배</strong> (3g → 4.5g)</li>
                <li>✅ <strong>물 줄이기</strong> (1:50 → 1:40)</li>
                <li>✅ <strong>온도 ±5°C</strong> 미세 조정</li>
                <li>❌ <strong>시간 늘리기 금지</strong> — 떫음·쓴맛이 폭증해 마실 수 없게 됨</li>
              </ul>
            </div>
          )}

          {/* 다탕 스케줄 — 탕마다 시간 (핫 추출 시) */}
          {!coldOn && (
            <div className={s.card}>
              <span className={s.cardLabel}>
                다탕 스케줄 — 탕마다 시간{effVessel === 'teabag' ? ' (티백 −30%)' : ''}
              </span>
              <div className={s.stepGrid}>
                {steepSchedule.map((step) => (
                  <div key={step.id} className={s.stepCard} style={{ borderLeftColor: step.color }}>
                    <p className={s.stepHead}>
                      <span className={s.stepEmoji}>{step.emoji}</span>
                      <strong>{step.label}</strong>
                      <span className={s.stepTime}>{fmtTime(step.sec)}</span>
                    </p>
                    <p className={s.stepDesc}>{step.desc}</p>
                  </div>
                ))}
              </div>
              <p className={s.helpText} style={{ marginTop: 8 }}>
                💡 같은 찻잎으로 최대 <strong>{tea.maxSteeps}탕</strong>{tea.rinse ? ' · 세차(헹굼) 후 본 추출' : ''}. 탕마다 향·바디가 달라집니다.
              </p>
            </div>
          )}

          {/* 다탕 우림 팁 — 정리된 ul */}
          <div className={s.tipCard}>
            <strong>🍵 다탕(多湯) 우림 팁</strong>
            <ul>
              <li>같은 찻잎으로 여러 번 우려 풍미 변화를 즐기는 방식</li>
              <li>우롱·보이는 <strong>5~8탕</strong>까지, 녹차·홍차는 보통 <strong>2~3탕</strong></li>
              <li>탕마다 다른 면이 드러남 — 1탕 산뜻 / 2탕 균형 / 3탕 후미</li>
              <li>보이·우롱은 <strong>세차(헹굼) 10초 후 버림</strong>이 정석</li>
              <li>현재 <strong>{tea.shortName}</strong>은 최대 <strong>{tea.maxSteeps}탕</strong>{tea.rinse ? ' · 세차 권장' : ''}</li>
            </ul>
          </div>

          {/* 차 상세 */}
          <div className={s.card}>
            <span className={s.cardLabel}>{tea.label} 상세 정보</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <tbody>
                  <tr><td>권장 온도</td><td className={s.cellMono}>{tea.tempMin}~{tea.tempMax}°C</td></tr>
                  <tr><td>표준 비율</td><td className={s.cellMono}>1:{tea.ratioWaterPerLeaf}</td></tr>
                  <tr><td>카페인</td><td className={s.cellMono}>{tea.caffeineMgPerG} mg/g · 추정 {fmt(caffeine, 0)} mg</td></tr>
                  <tr><td>다탕 가능</td><td className={s.cellMono}>{tea.maxSteeps}회 ({tea.rinse ? '세차 후' : '바로'})</td></tr>
                  <tr><td>추천 다구</td><td>{getVessel(tea.vessel).emoji} {getVessel(tea.vessel).label}</td></tr>
                  <tr><td>주요 산지</td><td style={{ textAlign: 'right', fontFamily: 'inherit', fontWeight: 'normal', fontSize: 12 }}>{tea.origin}</td></tr>
                </tbody>
              </table>
            </div>
            <div className={s.tipBox}>
              💡 <strong>{tea.shortName} 팁</strong> — {tea.tip}
            </div>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 차 가이드 ════════ */}
      {tab === 'guide' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>9종 매트릭스</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th>차</th>
                    <th>온도</th>
                    <th>1탕</th>
                    <th>비율</th>
                    <th>카페인</th>
                  </tr>
                </thead>
                <tbody>
                  {TEAS.map((t) => (
                    <tr key={t.id}>
                      <td>{t.emoji} {t.shortName}</td>
                      <td className={s.cellMono}>{t.tempMin}~{t.tempMax}°C</td>
                      <td className={s.cellMono}>{fmtTime(t.steeps[0])}</td>
                      <td className={s.cellMono}>1:{t.ratioWaterPerLeaf}</td>
                      <td className={s.cellMono}>{t.caffeineMgPerG} mg/g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>카페인 함량 비교 (mg/g)</span>
            <div className={s.barChart}>
              {TEAS.map((t) => {
                const w = maxCaff > 0 ? (t.caffeineMgPerG / maxCaff) * 100 : 0
                return (
                  <div key={t.id} className={s.barRow}>
                    <span className={s.barLabel}>{t.emoji} {t.shortName}</span>
                    <div className={s.barTrack}>
                      <div
                        className={s.barFill}
                        style={{
                          width: `${Math.max(w, 3)}%`,
                          background: t.caffeineMgPerG === 0 ? 'var(--bg3)' : undefined,
                        }}
                      >
                        <span className={s.barValue}>{t.caffeineMgPerG}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className={s.helpText} style={{ marginTop: 10 }}>
              ※ 같은 1g당 카페인. 실제 1잔 카페인은 사용 찻잎량과 추출 강도에 따라 달라집니다.
              <br />⚠️ 임산부·아이·수면 민감자: 허브티·루이보스(0mg), 백차(저카페인) 권장.
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>다구별 권장 매트릭스</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th>다구</th>
                    <th>설명</th>
                    <th>추천 차</th>
                  </tr>
                </thead>
                <tbody>
                  {VESSELS.map((v) => (
                    <tr key={v.id}>
                      <td>{v.emoji} {v.label}</td>
                      <td style={{ textAlign: 'left', fontFamily: 'inherit', fontWeight: 'normal', fontSize: 12 }}>{v.desc}</td>
                      <td style={{ textAlign: 'left', fontFamily: 'inherit', fontWeight: 'normal', fontSize: 12 }}>{v.recommend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 크로스링크 */}
      <Link href="/tools/cooking/brew" className={s.crossLink}>
        ☕ 커피 브루잉 계산기 → 6 추출법·푸어 스케줄·강도 진단
      </Link>
    </div>
  )
}
