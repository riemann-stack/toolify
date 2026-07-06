/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './boltWrench.module.css'
import {
  BOLT_SIZES, BOLT_TYPES, BOLT_DATA, BOLT_DATA_EXTRA,
  NUT_TYPES, WASHER_TYPES, TOOL_KITS, GRADE_INFO,
  INCH_SPANNERS, type BoltSize, type BoltType, type Standard,
  getSpanner, getAllen, isStandardDifferent,
  reverseLookupSpanner, reverseLookupAllen, findClosestMetric,
  fmt,
} from './boltWrenchUtils'

type Tab = 'find' | 'reverse' | 'nutwasher' | 'kit'

const STORAGE_KEY = 'youtil_bolt_wrench_v1'

export default function BoltWrenchClient() {
  const [tab, setTab] = useState<Tab>('find')
  const [size, setSize] = useState<BoltSize>('M8')
  const [boltType, setBoltType] = useState<BoltType>('hex')
  const [std, setStd] = useState<Standard>('iso')

  /* 역검색 입력 */
  const [revSpanner, setRevSpanner] = useState('17')
  const [revAllen, setRevAllen] = useState('5')
  const [revInch, setRevInch] = useState('1/2')

  /* 너트·와셔 탭 선택 */
  const [nutTypeId, setNutTypeId] = useState('std')
  const [washerTypeId, setWasherTypeId] = useState('flat')

  /* 공구 세트 */
  const [kitId, setKitId] = useState('bike')

  /* localStorage 복원·저장 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.size && BOLT_SIZES.includes(j.size)) setSize(j.size)
      if (j.boltType && BOLT_TYPES.some((t) => t.id === j.boltType)) setBoltType(j.boltType)
      if (j.std === 'iso' || j.std === 'jis') setStd(j.std)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ size, boltType, std }))
    } catch {}
  }, [size, boltType, std])

  /* ───────── 계산 ───────── */
  const data = BOLT_DATA[size]
  const spanner = getSpanner(size, std)
  const diffWarn = isStandardDifferent(size)
  const allen = getAllen(size, boltType)
  const usesAllen = boltType !== 'hex'

  const reverseHits = useMemo(() => {
    const v = parseFloat(revSpanner)
    return isNaN(v) ? [] : reverseLookupSpanner(v)
  }, [revSpanner])

  const reverseAllenHits = useMemo(() => {
    const v = parseFloat(revAllen)
    return isNaN(v) ? [] : reverseLookupAllen(v)
  }, [revAllen])

  const inchMatch = useMemo(() => {
    const found = INCH_SPANNERS.find((x) => x.fraction.replace('″', '') === revInch.trim())
    if (!found) return null
    return { ...found, ...findClosestMetric(found.mm) }
  }, [revInch])

  const kit = TOOL_KITS.find((k) => k.id === kitId)!
  const nut = NUT_TYPES.find((n) => n.id === nutTypeId)!
  const washer = WASHER_TYPES.find((w) => w.id === washerTypeId)!

  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/interior/wallpaper', label: '도배 소요량' },
          { href: '/tools/interior/paint', label: '페인트 계산' },
          { href: '/tools/interior/room-area', label: '방 면적 계산' }
        ]}
      >
        사용 안내 표시 사이즈·토크는 KS·ISO·DIN <strong>표준 일반치 참고용</strong>입니다. 고강도·안전부품·고급 차량은 반드시 <strong>제조사 매뉴얼·도면</strong>을 따르세요. 옛 JIS 사이즈는 1990년대 이전 일본·한국 산 부품에 주로 잔존합니다.
      </Disclaimer>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`} role="tablist" aria-label="볼트 스패너 도구 모드">
        {([
          { id: 'find',      label: '사이즈 찾기' },
          { id: 'reverse',   label: '역검색' },
          { id: 'nutwasher', label: '너트·와셔' },
          { id: 'kit',       label: '공구 세트' },
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

      {/* ════════ 탭 1: 사이즈 찾기 ════════ */}
      {tab === 'find' && (
        <>
          {/* 볼트 종류 선택 */}
          <div className={s.card}>
            <span className={s.cardLabel}>볼트 종류</span>
            <div className={s.systemGrid}>
              {BOLT_TYPES.map((t) => (
                <button
                  key={t.id}
                  aria-pressed={boltType === t.id}
                  className={`${s.systemBtn} ${boltType === t.id ? s.systemBtnActive : ''}`}
                  onClick={() => setBoltType(t.id)}
                  type="button"
                >
                  <span className={s.systemEmoji} aria-hidden="true">{t.emoji}</span>
                  <span className={s.systemLabel}>{t.label}</span>
                  <span className={s.systemDesc}>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 사이즈 + 규격 */}
          <div className={s.card}>
            <span className={s.cardLabel}>볼트 사이즈 · 규격</span>

            <div className={s.field}>
              <label className={s.fieldLabel}>볼트 사이즈</label>
              <div className={s.pillRow}>
                {BOLT_SIZES.map((b) => (
                  <button
                    key={b}
                    aria-pressed={size === b}
                    className={`${s.pill} ${size === b ? s.pillActive : ''}`}
                    onClick={() => setSize(b)}
                    type="button"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {!usesAllen && (
              <div className={s.field}>
                <label className={s.fieldLabel}>규격 (외부 6각만 차이)</label>
                <div className={s.pillRow}>
                  <button
                    aria-pressed={std === 'iso'}
                    className={`${s.pill} ${std === 'iso' ? s.pillActive : ''}`}
                    onClick={() => setStd('iso')}
                    type="button"
                  >
                    ISO·DIN·KS (현행)
                  </button>
                  <button
                    aria-pressed={std === 'jis'}
                    className={`${s.pill} ${std === 'jis' ? s.pillActive : ''}`}
                    onClick={() => setStd('jis')}
                    type="button"
                  >
                    옛 JIS
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 메인 결과 카드 */}
          <div className={s.hero} role="status">
            <p className={s.heroLabel}>
              {BOLT_TYPES.find((t) => t.id === boltType)!.emoji} {size}{' '}
              {BOLT_TYPES.find((t) => t.id === boltType)!.label}
              {!usesAllen && ` · ${std === 'iso' ? 'ISO·DIN·KS' : '옛 JIS'}`}
            </p>
            {usesAllen ? (
              <p className={s.heroValue}>
                알렌렌치 <strong>{allen} mm</strong>
              </p>
            ) : (
              <p className={s.heroValue}>
                스패너 / 소켓 <strong>{spanner} mm</strong>
              </p>
            )}
            <p className={s.heroSub}>
              {usesAllen
                ? `내부 6각 홈 대변 거리 (across-flat)`
                : `머리 대변 거리 (across-flat) · 같은 사이즈 소켓도 동일`}
            </p>
            {!usesAllen && diffWarn && (
              <div className={s.warnBadge}>
                ⚠️ {size}는 ISO {data.spannerISO}mm vs 옛 JIS {data.spannerJIS}mm,
                같은 볼트라도 규격이 다르면 안 맞습니다.
                {std === 'iso'
                  ? ` 옛 한국·일본 제품은 ${data.spannerJIS}mm일 수 있어요.`
                  : ` 현행 ISO·DIN 제품은 ${data.spannerISO}mm 이에요.`}
              </div>
            )}
          </div>

          {/* 상세 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>{size} 상세 사양</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th scope="col">항목</th>
                    <th scope="col">값</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>표준 피치 (거친나사)</td><td className={s.cellMono}>{data.pitchCoarse} mm</td></tr>
                  <tr><td>관통홀 (중간 클리어런스)</td><td className={s.cellMono}>⌀ {data.clearanceHole} mm</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>스패너 / 소켓 (외부 6각)</td></tr>
                  <tr><td>ISO·DIN·KS 현행</td><td className={`${s.cellMono} ${diffWarn ? s.cellAccent : ''}`}>{data.spannerISO} mm</td></tr>
                  <tr><td>옛 JIS</td><td className={`${s.cellMono} ${diffWarn ? s.cellAccent : ''}`}>{data.spannerJIS} mm</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>알렌렌치 (내부 6각, 머리 종류별)</td></tr>
                  <tr><td>소켓캡 (DIN 912)</td><td className={s.cellMono}>{data.allenSocket} mm</td></tr>
                  <tr><td>버튼헤드 (ISO 7380)</td><td className={s.cellMono}>{data.allenButton} mm</td></tr>
                  <tr><td>플랫헤드 (DIN 7991)</td><td className={s.cellMono}>{data.allenFlat} mm</td></tr>
                  <tr><td>무두볼트 (DIN 913~916)</td><td className={s.cellMono}>{data.allenSet} mm</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>너트 높이</td></tr>
                  <tr><td>표준 너트 (DIN 934 계열)</td><td className={s.cellMono}>{data.nutStd} mm</td></tr>
                  <tr><td>박형 너트 (ISO 4035)</td><td className={s.cellMono}>{data.nutThin} mm</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>평와셔 (KS B 1326)</td></tr>
                  <tr><td>내경 d</td><td className={s.cellMono}>⌀ {data.washerInner} mm</td></tr>
                  <tr><td>외경 D</td><td className={s.cellMono}>⌀ {data.washerOuter} mm</td></tr>
                  <tr><td>두께 t</td><td className={s.cellMono}>{data.washerThick} mm</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>스프링와셔 (KS B 1324)</td></tr>
                  <tr><td>내경 / 외경 / 두께</td><td className={s.cellMono}>{data.springInner} / {data.springOuter} / {data.springThick} mm</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 토크 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>참고 체결 토크 (Nm)</span>
            <p className={s.helpText}>
              ISO 16047 일반 참고치(마찰계수 0.14). 정확한 값은 제조사 매뉴얼·도면을 따르세요.
            </p>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th scope="col">강도등급</th>
                    <th scope="col">4.8</th>
                    <th scope="col">8.8</th>
                    <th scope="col">10.9</th>
                    <th scope="col">12.9</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>토크 ({size})</td>
                    <td className={s.cellMono}>{fmt(data.torque4_8, data.torque4_8 < 10 ? 1 : 0)} Nm</td>
                    <td className={s.cellMono}>{fmt(data.torque8_8, data.torque8_8 < 10 ? 1 : 0)} Nm</td>
                    <td className={s.cellMono}>{fmt(data.torque10_9, data.torque10_9 < 10 ? 1 : 0)} Nm</td>
                    <td className={s.cellMono}>{fmt(data.torque12_9, data.torque12_9 < 10 ? 1 : 0)} Nm</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={s.gradeRow}>
              {GRADE_INFO.map((g) => (
                <div key={g.grade} className={s.gradeChip} style={{ borderColor: g.color }}>
                  <strong style={{ color: g.color }}>{g.grade}</strong>
                  <span>{g.tensile} / {g.yield}</span>
                  <em>{g.use}</em>
                </div>
              ))}
            </div>
          </div>

          {/* 크로스링크 */}
          <Link href="/tools/interior/screw" className={s.crossLink}>
            🔩 나사 규격 계산기 → 탭홀·관통홀·인치↔mm 변환은 여기로
          </Link>

          <div className={s.warnCard}>
            <strong>⚠️ 안전 주의</strong>
            <p>
              표시 토크는 ISO 일반 참고치이며 실제 적용은 제조사 매뉴얼이 우선입니다.
              <br />안전부품(에어백·브레이크·휠너트·시트벨트 등)은 정비공장 권장.
              <br />옛 JIS 사이즈는 1990년대 이전 제품에 주로 잔존합니다.
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 역검색 ════════ */}
      {tab === 'reverse' && (
        <>
          {/* 스패너 사이즈 → 볼트 */}
          <div className={s.card}>
            <span className={s.cardLabel}>스패너 / 소켓 사이즈 → 볼트</span>
            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="bolt-wrench-mm">스패너 사이즈 (mm)</label>
              <input id="bolt-wrench-mm"
                type="number" inputMode="decimal"
                className={s.input}
                value={revSpanner}
                onChange={(e) => setRevSpanner(e.target.value)}
                min={4}
                max={50}
                step={0.5}
              />
              <div className={s.pillRow} style={{ marginTop: 8 }}>
                {[10, 12, 13, 14, 17, 19, 22, 24].map((mm) => (
                  <button
                    key={mm}
                    className={s.pill}
                    onClick={() => setRevSpanner(String(mm))}
                    type="button"
                  >
                    {mm} mm
                  </button>
                ))}
              </div>
              <p className={s.helpText} style={{ marginTop: 8 }}>지원 범위 4~50mm · 표준 사이즈만 매칭됩니다.</p>
            </div>

            <div className={s.convertResult}>
              {reverseHits.length === 0 ? (
                <>
                  <p className={s.convertLabel}>가능한 볼트</p>
                  <p className={s.convertValue}>해당 없음</p>
                  <p className={s.convertSub}>표준 사이즈가 아닐 수 있어요. 인치 호환표를 확인해보세요.</p>
                </>
              ) : (
                <>
                  <p className={s.convertLabel}>{revSpanner} mm 스패너 → 가능한 볼트</p>
                  <div className={s.hitGrid}>
                    {reverseHits.map((h, i) => (
                      <div key={i} className={s.hitCard}>
                        <strong>{h.size}</strong>
                        <span>{h.stdLabel}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 알렌 사이즈 → 볼트 */}
          <div className={s.card}>
            <span className={s.cardLabel}>알렌렌치 사이즈 → 볼트</span>
            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="bolt-wrench-mm-2">알렌(육각렌치) 사이즈 (mm)</label>
              <input id="bolt-wrench-mm-2"
                type="number" inputMode="decimal"
                className={s.input}
                value={revAllen}
                onChange={(e) => setRevAllen(e.target.value)}
                min={1}
                max={24}
                step={0.5}
              />
              <div className={s.pillRow} style={{ marginTop: 8 }}>
                {[2, 2.5, 3, 4, 5, 6, 8, 10].map((mm) => (
                  <button
                    key={mm}
                    className={s.pill}
                    onClick={() => setRevAllen(String(mm))}
                    type="button"
                  >
                    {mm} mm
                  </button>
                ))}
              </div>
              <p className={s.helpText} style={{ marginTop: 8 }}>지원 범위 1~24mm · 표준 사이즈만 매칭됩니다.</p>
            </div>

            <div className={s.convertResult}>
              {reverseAllenHits.length === 0 ? (
                <>
                  <p className={s.convertLabel}>가능한 볼트</p>
                  <p className={s.convertValue}>해당 없음</p>
                </>
              ) : (
                <>
                  <p className={s.convertLabel}>{revAllen} mm 알렌 → 가능한 볼트</p>
                  <div className={s.hitGrid}>
                    {reverseAllenHits.map((h, i) => (
                      <div key={i} className={s.hitCard}>
                        <strong>{h.size}</strong>
                        <span>{h.typeLabel}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 인치 호환표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>인치 스패너 ↔ 미터 호환</span>
            <div className={s.field}>
              <label className={s.fieldLabel}>인치 사이즈 선택</label>
              <div className={s.pillRow}>
                {INCH_SPANNERS.map((i) => (
                  <button
                    key={i.fraction}
                    aria-pressed={revInch === i.fraction.replace('″', '')}
                    className={`${s.pill} ${revInch === i.fraction.replace('″', '') ? s.pillActive : ''}`}
                    onClick={() => setRevInch(i.fraction.replace('″', ''))}
                    type="button"
                  >
                    {i.fraction}
                  </button>
                ))}
              </div>
            </div>

            {inchMatch && (
              <div className={s.convertResult}>
                <p className={s.convertLabel}>{inchMatch.fraction}</p>
                <p className={s.convertValue}>{inchMatch.mm.toFixed(2)} mm</p>
                <p className={s.convertSub}>
                  ≈ {inchMatch.iso ? `${inchMatch.iso}(ISO)` : '직접 매칭 없음'}
                  {inchMatch.jis && inchMatch.jis !== inchMatch.iso ? ` · ${inchMatch.jis}(옛 JIS)` : ''}
                </p>
              </div>
            )}

            <div className={s.tableScroll} style={{ marginTop: 14 }}>
              <table className={s.compactTable}>
                <thead>
                  <tr>
                    <th scope="col">인치</th>
                    <th scope="col">mm</th>
                    <th scope="col">ISO 매칭</th>
                    <th scope="col">옛 JIS 매칭</th>
                  </tr>
                </thead>
                <tbody>
                  {INCH_SPANNERS.map((i) => {
                    const m = findClosestMetric(i.mm)
                    return (
                      <tr key={i.fraction}>
                        <td className={s.cellMono}>{i.fraction}</td>
                        <td className={s.cellMono}>{i.mm.toFixed(2)}</td>
                        <td className={s.cellMono}>{m.iso ?? '—'}</td>
                        <td className={s.cellMono}>{m.jis && m.jis !== m.iso ? m.jis : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className={s.helpText}>
              ※ 인치 스패너는 미터 볼트에 살짝 헐겁거나 빡빡합니다. 응급용으로만 권장.
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 3: 너트·와셔 ════════ */}
      {tab === 'nutwasher' && (
        <>
          {/* 너트 */}
          <div className={s.card}>
            <span className={s.cardLabel}>너트 종류</span>
            <div className={s.systemGrid}>
              {NUT_TYPES.map((n) => (
                <button
                  key={n.id}
                  aria-pressed={nutTypeId === n.id}
                  className={`${s.systemBtn} ${nutTypeId === n.id ? s.systemBtnActive : ''}`}
                  onClick={() => setNutTypeId(n.id)}
                  type="button"
                >
                  <span className={s.systemEmoji} aria-hidden="true">{n.emoji}</span>
                  <span className={s.systemLabel}>{n.label}</span>
                  <span className={s.systemDesc}>{n.desc}</span>
                </button>
              ))}
            </div>

            <div className={s.infoBox}>
              <p><strong>{nut.label}</strong></p>
              <p>규격: {nut.std}</p>
              <p>용도: {nut.desc}</p>
              <p>
                재사용:{' '}
                <span style={{
                  color: nut.reuse === '재사용 가능' ? 'var(--accent)'
                    : nut.reuse === '1회용 권장' ? '#DB2777' : '#D97706',
                  fontWeight: 700,
                }}>
                  {nut.reuse}
                </span>
              </p>
            </div>

            {/* 너트 사이즈 표 (표준 6각 너트 기준) */}
            <p className={s.helpText} style={{ marginTop: 14 }}>
              📋 아래 표는 <strong>표준 6각 너트(DIN 934 계열)</strong> 기준 공통 치수입니다 — 위에서 고른 너트 종류와 무관합니다.
            </p>
            <div className={s.tableScroll} style={{ marginTop: 8 }}>
              <table className={s.compactTable}>
                <thead>
                  <tr>
                    <th scope="col">사이즈</th>
                    <th scope="col">스패너 (ISO)</th>
                    <th scope="col">표준 높이</th>
                    <th scope="col">박형 높이</th>
                  </tr>
                </thead>
                <tbody>
                  {BOLT_SIZES.map((b) => (
                    <tr key={b}>
                      <td className={s.cellMono}>{b}</td>
                      <td className={s.cellMono}>{BOLT_DATA[b].spannerISO} mm</td>
                      <td className={s.cellMono}>{BOLT_DATA[b].nutStd} mm</td>
                      <td className={s.cellMono}>{BOLT_DATA[b].nutThin} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 와셔 */}
          <div className={s.card}>
            <span className={s.cardLabel}>와셔 종류</span>
            <div className={s.systemGrid}>
              {WASHER_TYPES.map((w) => (
                <button
                  key={w.id}
                  aria-pressed={washerTypeId === w.id}
                  className={`${s.systemBtn} ${washerTypeId === w.id ? s.systemBtnActive : ''}`}
                  onClick={() => setWasherTypeId(w.id)}
                  type="button"
                >
                  <span className={s.systemEmoji} aria-hidden="true">{w.emoji}</span>
                  <span className={s.systemLabel}>{w.label}</span>
                  <span className={s.systemDesc}>{w.desc}</span>
                </button>
              ))}
            </div>

            <div className={s.infoBox}>
              <p><strong>{washer.label}</strong></p>
              <p>규격: {washer.std}</p>
              <p>특징: {washer.desc}</p>
              <p>용도: {washer.use}</p>
            </div>

            {/* 와셔 사이즈 표 */}
            <p className={s.helpText} style={{ marginTop: 14 }}>
              📋 아래 표는 <strong>평와셔·스프링와셔</strong> 기준 치수입니다 — 위에서 고른 와셔 종류와 무관합니다.
            </p>
            <div className={s.tableScroll} style={{ marginTop: 8 }}>
              <table className={s.compactTable}>
                <thead>
                  <tr>
                    <th scope="col">볼트</th>
                    <th scope="col">평와셔 d</th>
                    <th scope="col">평와셔 D</th>
                    <th scope="col">평와셔 t</th>
                    <th scope="col">스프링 d/D/t</th>
                  </tr>
                </thead>
                <tbody>
                  {BOLT_SIZES.map((b) => {
                    const d = BOLT_DATA[b]
                    return (
                      <tr key={b}>
                        <td className={s.cellMono}>{b}</td>
                        <td className={s.cellMono}>{d.washerInner}</td>
                        <td className={s.cellMono}>{d.washerOuter}</td>
                        <td className={s.cellMono}>{d.washerThick}</td>
                        <td className={s.cellMono}>{d.springInner}/{d.springOuter}/{d.springThick}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* M27, M30 추가 */}
          <div className={s.card}>
            <span className={s.cardLabel}>대형 사이즈 참고 (M27 · M30)</span>
            <div className={s.tableScroll}>
              <table className={s.compactTable}>
                <thead>
                  <tr>
                    <th scope="col">사이즈</th>
                    <th scope="col">스패너</th>
                    <th scope="col">알렌(소켓캡)</th>
                    <th scope="col">너트 높이</th>
                    <th scope="col">참고 토크 (8.8)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(BOLT_DATA_EXTRA).map(([k, v]) => (
                    <tr key={k}>
                      <td className={s.cellMono}>{k}</td>
                      <td className={s.cellMono}>{v.spannerISO} mm</td>
                      <td className={s.cellMono}>{v.allenSocket} mm</td>
                      <td className={s.cellMono}>{v.nutStd} mm</td>
                      <td className={s.cellMono}>{v.torque8_8} Nm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════════ 탭 4: 공구 세트 ════════ */}
      {tab === 'kit' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>용도별 공구 세트</span>
            <div className={s.systemGrid}>
              {TOOL_KITS.map((k) => (
                <button
                  key={k.id}
                  aria-pressed={kitId === k.id}
                  className={`${s.systemBtn} ${kitId === k.id ? s.systemBtnActive : ''}`}
                  onClick={() => setKitId(k.id)}
                  type="button"
                >
                  <span className={s.systemEmoji} aria-hidden="true">{k.emoji}</span>
                  <span className={s.systemLabel}>{k.label}</span>
                  <span className={s.systemDesc}>{k.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={s.hero} role="status">
            <p className={s.heroLabel}>{kit.emoji} {kit.label} 추천 구성</p>
            <p className={s.heroValue}><strong>예산 {kit.budget}</strong></p>
            <p className={s.heroSub}>{kit.desc}</p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>구성 항목</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th scope="col">공구 종류</th>
                    <th scope="col">사이즈 / 스펙</th>
                  </tr>
                </thead>
                <tbody>
                  {kit.items.map((it, i) => (
                    <tr key={i}>
                      <td>{it.type}</td>
                      <td style={{ textAlign: 'left', fontFamily: 'inherit', fontWeight: 'normal' }}>
                        {it.sizes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>공구 구입 팁</strong>
            <p>
              • 처음엔 <strong>9피스 알렌렌치 세트 + 8~19mm 콤비스패너 세트</strong>면 80% 커버<br />
              • 자동차는 <strong>3/8″ 라쳇 + 소켓 풀세트</strong>가 핵심<br />
              • 임팩트는 반드시 <strong>임팩트 전용(검정) 소켓</strong> 사용<br />
              • 토크렌치는 마지막 조임에만 사용 (풀 때 X)
            </p>
          </div>
        </>
      )}

    </div>
  )
}
