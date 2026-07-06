'use client'

import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import { useEffect, useMemo, useState } from 'react'
import s from './vo2max.module.css'
import {
  METHODS, calcCooper, calcMile15, calcRockport, calcQueens, calcNorway, calcHRR,
  classifyLevel, LEVEL_META, getNormBand,
  predictRaces, fmtTime, fmtPace, trainingPaces,
  IMPROVE_TIPS, calcPAIndex,
  PA_FREQ_LABELS, PA_INTENSITY_LABELS, PA_DURATION_LABELS,
  type MethodId, type Sex,
} from './vo2maxData'

const STORAGE_KEY = 'youtil_vo2max_v1'

/** 복원값 범위 클램프 — 변조·구버전 저장값이 그대로 계산에 새지 않도록 */
const clampN = (v: unknown, lo: number, hi: number): number | null =>
  typeof v === 'number' && isFinite(v) ? Math.min(hi, Math.max(lo, v)) : null
/** PA 인덱스 enum 검증 (0|1|2|3) */
const isPA = (v: unknown): v is 0 | 1 | 2 | 3 => v === 0 || v === 1 || v === 2 || v === 3

export default function VO2MaxClient() {
  const [methodId, setMethodId] = useState<MethodId>('cooper')

  /* 공통 입력 */
  const [age, setAge] = useState(35)
  const [sex, setSex] = useState<Sex>('male')
  const [weightKg, setWeightKg] = useState(70)

  /* 쿠퍼 */
  const [cooperDistM, setCooperDistM] = useState(2400)

  /* 1.5마일 */
  const [mile15Min, setMile15Min] = useState(12)
  const [mile15Sec, setMile15Sec] = useState(0)

  /* 락포트 */
  const [rockportMin, setRockportMin] = useState(15)
  const [rockportSec, setRockportSec] = useState(0)
  const [rockportHR, setRockportHR] = useState(140)

  /* 퀸즈 */
  const [queensHR, setQueensHR] = useState(150)

  /* 노르웨이 */
  const [waistCm, setWaistCm] = useState(80)
  const [hrRest, setHrRest] = useState(65)
  const [paFreq, setPaFreq] = useState<0 | 1 | 2 | 3>(2)
  const [paIntensity, setPaIntensity] = useState<0 | 1 | 2 | 3>(2)
  const [paDuration, setPaDuration] = useState<0 | 1 | 2 | 3>(2)

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (METHODS.some(m => m.id === j.methodId)) setMethodId(j.methodId)
      if (j.sex === 'male' || j.sex === 'female') setSex(j.sex)
      const a = clampN(j.age, 10, 90); if (a !== null) setAge(a)
      const w = clampN(j.weightKg, 30, 150); if (w !== null) setWeightKg(w)
      const cd = clampN(j.cooperDistM, 500, 5000); if (cd !== null) setCooperDistM(cd)
      const m1 = clampN(j.mile15Min, 5, 30); if (m1 !== null) setMile15Min(m1)
      const m1s = clampN(j.mile15Sec, 0, 59); if (m1s !== null) setMile15Sec(m1s)
      const rm = clampN(j.rockportMin, 8, 30); if (rm !== null) setRockportMin(rm)
      const rs = clampN(j.rockportSec, 0, 59); if (rs !== null) setRockportSec(rs)
      const rhr = clampN(j.rockportHR, 80, 200); if (rhr !== null) setRockportHR(rhr)
      const qhr = clampN(j.queensHR, 100, 200); if (qhr !== null) setQueensHR(qhr)
      const wc = clampN(j.waistCm, 50, 150); if (wc !== null) setWaistCm(wc)
      const hr = clampN(j.hrRest, 40, 120); if (hr !== null) setHrRest(hr)
      if (isPA(j.paFreq)) setPaFreq(j.paFreq)
      if (isPA(j.paIntensity)) setPaIntensity(j.paIntensity)
      if (isPA(j.paDuration)) setPaDuration(j.paDuration)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        methodId, age, sex, weightKg,
        cooperDistM, mile15Min, mile15Sec,
        rockportMin, rockportSec, rockportHR,
        queensHR,
        waistCm, hrRest, paFreq, paIntensity, paDuration,
      }))
    } catch {}
  }, [methodId, age, sex, weightKg, cooperDistM, mile15Min, mile15Sec,
      rockportMin, rockportSec, rockportHR, queensHR, waistCm, hrRest,
      paFreq, paIntensity, paDuration])

  /* 결과 계산 */
  const vo2 = useMemo(() => {
    switch (methodId) {
      case 'cooper':   return calcCooper(cooperDistM)
      case 'mile1_5':  return calcMile15(mile15Min + mile15Sec / 60, weightKg, sex)
      case 'rockport': return calcRockport(rockportMin + rockportSec / 60, rockportHR, weightKg, age, sex)
      case 'queens':   return calcQueens(queensHR, sex)
      case 'norway':   return calcNorway({
        age, sex, waistCm, hrRest,
        paIndex: calcPAIndex({ frequency: paFreq, intensity: paIntensity, duration: paDuration }),
      })
      case 'hrr':      return calcHRR(hrRest, age)
    }
  }, [methodId, cooperDistM, mile15Min, mile15Sec, weightKg, sex,
      rockportMin, rockportSec, rockportHR, age, queensHR, waistCm, hrRest,
      paFreq, paIntensity, paDuration])

  const level = useMemo(() => vo2 > 0 ? classifyLevel(vo2, age, sex) : null, [vo2, age, sex])
  const levelMeta = level ? LEVEL_META[level] : null
  const band = getNormBand(age, sex)
  const races = useMemo(() => predictRaces(vo2), [vo2])
  const paces = useMemo(() => trainingPaces(vo2), [vo2])

  const currentMethod = METHODS.find(m => m.id === methodId)!

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/sports/race-predictor', label: '마라톤 기록 계산기' },
          { href: '/tools/sports/pace',            label: '러닝 페이스' },
          { href: '/tools/sports/interval-training', label: '인터벌 훈련' },
        ]}
      >
        건강한 성인 대상. 심장질환·고혈압·관절 통증 있으면 의사 상담 후 측정. 격렬한 테스트는 충분한 워밍업 + 본인 한계 존중.
      </Disclaimer>

      {/* ── 1. 신체 정보 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>신체 정보 (공통)</div>
        <div className={s.bioGrid}>
          <div className={s.field}>
            <label>성별</label>
            <div className={s.sexRow}>
              <button type="button" aria-pressed={sex === 'male'}
                className={`${s.sexBtn} ${sex === 'male' ? s.sexActive : ''}`}
                onClick={() => setSex('male')}>♂ 남성</button>
              <button type="button" aria-pressed={sex === 'female'}
                className={`${s.sexBtn} ${sex === 'female' ? s.sexActive : ''}`}
                onClick={() => setSex('female')}>♀ 여성</button>
            </div>
          </div>
          <div className={s.field}>
            <label>나이</label>
            <NumInput value={age} onChange={setAge} min={10} max={90} step={1} unit="세" ariaLabel="나이" />
          </div>
          <div className={s.field}>
            <label>체중</label>
            <NumInput value={weightKg} onChange={setWeightKg} min={30} max={150} step={0.5} unit="kg" ariaLabel="체중" />
          </div>
        </div>
      </div>

      {/* ── 2. 측정 방법 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>측정 방법 선택</div>
        <div className={s.methodGrid}>
          {METHODS.map(m => (
            <button
              key={m.id}
              type="button"
              aria-pressed={methodId === m.id}
              className={`${s.methodBtn} ${methodId === m.id ? s.methodActive : ''}`}
              onClick={() => setMethodId(m.id)}
            >
              <span className={s.methodEmoji}>{m.emoji}</span>
              <div className={s.methodBody}>
                <div className={s.methodName}>{m.name}</div>
                <div className={s.methodDesc}>{m.desc}</div>
                <div className={s.methodMeta}>
                  <span>⏱️ {m.duration}</span>
                  <span className={`${s.methodDiff} ${s[`diff_${m.difficulty}`]}`}>
                    {m.difficulty === 'easy' ? '쉬움' : m.difficulty === 'medium' ? '보통' : '어려움'}
                  </span>
                  <span className={s.methodAccuracy}>정확도 {m.accuracy}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. 방법별 입력 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>{currentMethod.emoji} {currentMethod.name} — 측정값 입력</div>

        {methodId === 'cooper' && (
          <div className={s.singleField}>
            <label>12분 동안 달린 거리</label>
            <NumInput value={cooperDistM} onChange={setCooperDistM} min={500} max={5000} step={50} unit="m" ariaLabel="12분 동안 달린 거리" />
            <p className={s.fieldHint}>
              💡 트랙 400m 기준 6바퀴 = 2,400m. 일반 성인 평균 2,100~2,400m.
            </p>
          </div>
        )}

        {methodId === 'mile1_5' && (
          <div className={s.singleField}>
            <label>2.4km(1.5마일) 완주 시간</label>
            <div className={s.timeRow}>
              <NumInput value={mile15Min} onChange={setMile15Min} min={5} max={30} step={1} unit="분" ariaLabel="1.5마일 완주 분" />
              <NumInput value={mile15Sec} onChange={setMile15Sec} min={0} max={59} step={1} unit="초" ariaLabel="1.5마일 완주 초" />
            </div>
            <p className={s.fieldHint}>
              💡 미군 표준: 남성 14분·여성 17분. 일반 성인 13~18분.
            </p>
          </div>
        )}

        {methodId === 'rockport' && (
          <>
            <div className={s.field}>
              <label>1마일(1.6km) 빠르게 걷기 시간</label>
              <div className={s.timeRow}>
                <NumInput value={rockportMin} onChange={setRockportMin} min={8} max={30} step={1} unit="분" ariaLabel="걷기 분" />
                <NumInput value={rockportSec} onChange={setRockportSec} min={0} max={59} step={1} unit="초" ariaLabel="걷기 초" />
              </div>
            </div>
            <div className={s.field} style={{ marginTop: 10 }}>
              <label>도착 직후 심박수 (15초 동안 측정 × 4)</label>
              <NumInput value={rockportHR} onChange={setRockportHR} min={80} max={200} step={1} unit="bpm" ariaLabel="도착 직후 심박수" />
            </div>
            <p className={s.fieldHint}>
              💡 측정 직후 손목·목 동맥에서 15초 카운트 × 4. 일반 도착 직후 HR: 120~170 bpm.
            </p>
          </>
        )}

        {methodId === 'queens' && (
          <div className={s.singleField}>
            <label>스텝 종료 5초 후 ~ 20초 측정 심박수</label>
            <NumInput value={queensHR} onChange={setQueensHR} min={100} max={200} step={1} unit="bpm" ariaLabel="스텝 종료 후 심박수" />
            <p className={s.fieldHint}>
              💡 41cm 높이 스텝 박스(또는 의자). 남성 24회/분, 여성 22회/분, 3분간 일정 박자.
              종료 직후 5초 쉬고 15초 동안 심박 카운트 × 4.
            </p>
          </div>
        )}

        {methodId === 'norway' && (
          <>
            <div className={s.norwayGrid}>
              <div className={s.field}>
                <label>허리둘레 (cm)</label>
                <NumInput value={waistCm} onChange={setWaistCm} min={50} max={150} step={1} unit="cm" ariaLabel="허리둘레" />
              </div>
              <div className={s.field}>
                <label>안정시 심박수 (아침 기상 직후)</label>
                <NumInput value={hrRest} onChange={setHrRest} min={40} max={120} step={1} unit="bpm" ariaLabel="안정시 심박수" />
              </div>
            </div>

            <div className={s.subLabel} style={{ marginTop: 14 }}>운동 활동 수준 (PA Index)</div>

            <PAField
              label="운동 빈도"
              options={PA_FREQ_LABELS}
              value={paFreq}
              onChange={(v) => setPaFreq(v as 0 | 1 | 2 | 3)}
            />
            <PAField
              label="운동 강도"
              options={PA_INTENSITY_LABELS}
              value={paIntensity}
              onChange={(v) => setPaIntensity(v as 0 | 1 | 2 | 3)}
            />
            <PAField
              label="1회 운동 시간"
              options={PA_DURATION_LABELS}
              value={paDuration}
              onChange={(v) => setPaDuration(v as 0 | 1 | 2 | 3)}
            />

            <p className={s.fieldHint}>
              💡 NTNU(노르웨이과학기술대) 연구 — 운동 없이도 일상 데이터로 추정.
              허리둘레는 평형호흡 끝 배꼽 위 측정.
            </p>
          </>
        )}

        {methodId === 'hrr' && (
          <div className={s.singleField}>
            <label>안정시 심박수 (아침 기상 직후)</label>
            <NumInput value={hrRest} onChange={setHrRest} min={40} max={120} step={1} unit="bpm" ariaLabel="안정시 심박수" />
            <p className={s.fieldHint}>
              💡 아침에 눈 뜬 뒤 일어나기 전 1분간 측정. 일반인 60~80, 운동인 50~60, 엘리트 35~50.
              <br />
              ⚠️ 가장 간단하지만 <strong>정확도는 낮음</strong> — 참고용으로만 활용.
            </p>
          </div>
        )}
      </div>

      {/* ── 4. 결과 히어로 ── */}
      <div className={s.heroCard} role="status" aria-live="polite">
        <div className={s.heroLabel}>예상 VO₂ Max</div>
        <div className={s.heroRow}>
          <span className={s.heroNum} style={{ color: levelMeta?.color ?? 'var(--accent)' }}>
            {vo2 > 0 ? vo2.toFixed(1) : '—'}
          </span>
          <span className={s.heroUnit}>mL/kg/min</span>
        </div>
        {levelMeta && (
          <div className={s.heroGrade}
            style={{ background: `${levelMeta.color}1A`, color: levelMeta.color, borderColor: `${levelMeta.color}55` }}>
            {levelMeta.label} — {levelMeta.desc}
          </div>
        )}
        <div className={s.heroMethod}>
          {currentMethod.emoji} {currentMethod.name} · {age}세 {sex === 'male' ? '남성' : '여성'}
        </div>
      </div>

      {/* ── 5. 비슷한 연령대 비교 — 가로 5분할 차트 ── */}
      {vo2 > 0 && (
        <div className={s.card}>
          <div className={s.cardLabel}>비슷한 연령대 비교 ({age}세 {sex === 'male' ? '남성' : '여성'})</div>
          <div className={s.segChart}>
            {[
              { id: 'poor',      label: '매우 미흡', range: `~${band.below}` },
              { id: 'below',     label: '미흡',      range: `${band.below}~${band.average}` },
              { id: 'average',   label: '평균',      range: `${band.average}~${band.good}` },
              { id: 'good',      label: '우수',      range: `${band.good}~${band.excellent}` },
              { id: 'excellent', label: '매우 우수', range: `${band.excellent}+` },
            ].map(b => {
              const meta = LEVEL_META[b.id as keyof typeof LEVEL_META]
              const isMe = level === b.id
              return (
                <div key={b.id}
                  className={`${s.seg} ${isMe ? s.segActive : ''}`}
                  style={isMe ? { borderColor: meta.color } : undefined}>
                  {isMe && <span className={s.segMe}>나 {vo2.toFixed(1)}</span>}
                  <span className={s.segBar} style={{ background: meta.color }} />
                  <span className={s.segLabel} style={{ color: meta.color }}>{b.label}</span>
                  <span className={s.segRange}>{b.range}</span>
                </div>
              )
            })}
          </div>
          <p className={s.bandSource}>단위 mL/kg/min · 출처: ACSM · Cooper Institute Fitness Norms</p>
        </div>
      )}

      {/* ── 6. 마라톤·구간 예측 ── */}
      {vo2 > 0 && (
        <div className={s.card}>
          <div className={s.cardLabel}>마라톤·구간 예상 시간 (Daniels VDOT 기반)</div>
          <div className={s.raceGrid}>
            <div className={s.raceCard}>
              <span className={s.raceDist}>5K</span>
              <span className={s.raceTime}>{fmtTime(races.fiveK)}</span>
              <span className={s.racePace}>{fmtPace(races.fiveK / 5)}/km</span>
            </div>
            <div className={s.raceCard}>
              <span className={s.raceDist}>10K</span>
              <span className={s.raceTime}>{fmtTime(races.tenK)}</span>
              <span className={s.racePace}>{fmtPace(races.tenK / 10)}/km</span>
            </div>
            <div className={s.raceCard}>
              <span className={s.raceDist}>하프</span>
              <span className={s.raceTime}>{fmtTime(races.halfM)}</span>
              <span className={s.racePace}>{fmtPace(races.halfM / 21.0975)}/km</span>
            </div>
            <div className={s.raceCard}>
              <span className={s.raceDist}>풀코스</span>
              <span className={s.raceTime}>{fmtTime(races.fullM)}</span>
              <span className={s.racePace}>{fmtPace(races.fullM / 42.195)}/km</span>
            </div>
          </div>
          <p className={s.fieldHint}>
            ⚠️ Riegel·Daniels 공식 기반 추정 — 실제 페이스는 훈련량·환경·전략에 따라 달라집니다.
            실제 레이스 기록 기반 정밀 예측(3공식 평균·환경/연령 보정·목표 역산)은{' '}
            <Link href="/tools/sports/race-predictor" style={{ color: 'var(--accent)' }}>마라톤 기록 계산기</Link>에서 확인하세요.
          </p>
        </div>
      )}

      {/* ── 7. 강도별 트레이닝 페이스 ── */}
      {vo2 > 0 && (
        <div className={s.card}>
          <div className={s.cardLabel}>강도별 트레이닝 페이스</div>
          <div className={s.paceGrid}>
            {[
              { id: 'E', name: 'Easy (회복)', desc: '대화 가능. 70~75% HRmax', sec: paces.E, color: '#059669' },
              { id: 'M', name: '마라톤',       desc: '풀코스 race pace',         sec: paces.M, color: '#0891B2' },
              { id: 'T', name: 'Threshold (역치)', desc: '1시간 race pace · 20~40분', sec: paces.T, color: '#A16207' },
              { id: 'I', name: 'Interval',     desc: 'VO₂max 자극 · 3~5분 반복',  sec: paces.I, color: '#EA580C' },
              { id: 'R', name: 'Repetition',   desc: '스피드 · 200~600m 반복',    sec: paces.R, color: '#DC2626' },
            ].map(p => (
              <div key={p.id} className={s.paceRow}
                style={{ borderLeftColor: p.color }}>
                <div className={s.paceLeft}>
                  <span className={s.paceCode} style={{ color: p.color }}>{p.id}</span>
                  <span className={s.paceName}>{p.name}</span>
                </div>
                <span className={s.paceVal}>{fmtPace(p.sec)}/km</span>
                <span className={s.paceDesc}>{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 8. VO2max 개선 방법 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>VO₂ Max 개선 방법</div>
        <div className={s.improveGrid}>
          {IMPROVE_TIPS.map((t, i) => (
            <div key={i} className={s.improveCard}>
              <div className={s.improveTitle}>{t.title}</div>
              <p className={s.improveDesc}>{t.desc}</p>
              <div className={s.improveWeeks}>📈 {t.weeks}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── 숫자 입력 (모바일 친화) ─── */
function NumInput({ value, onChange, min, max, step, unit, ariaLabel }: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  unit: string
  ariaLabel?: string
}) {
  return (
    <div className={s.numInputWrap}>
      <input
        type="number"
        inputMode="decimal"
        aria-label={ariaLabel ?? unit}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => {
          const v = parseFloat(e.target.value)
          // 입력 중엔 상한만 강제 (하한은 자릿수 쌓는 입력을 방해하므로 blur에서 확정)
          if (isFinite(v)) onChange(Math.min(max, v))
        }}
        onBlur={e => {
          const v = parseFloat(e.target.value)
          onChange(isFinite(v) ? Math.min(max, Math.max(min, v)) : min)
        }}
        className={s.numInput}
      />
      <span className={s.numUnit}>{unit}</span>
    </div>
  )
}

/* ─── PA 인덱스 4단계 토글 ─── */
function PAField({ label, options, value, onChange }: {
  label: string
  options: string[]
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className={s.paField}>
      <span className={s.paLabel}>{label}</span>
      <div className={s.paOptions}>
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={value === i}
            className={`${s.paOpt} ${value === i ? s.paOptActive : ''}`}
            onClick={() => onChange(i)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
