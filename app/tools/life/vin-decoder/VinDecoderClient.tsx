/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import styles from './vin-decoder.module.css'
import {
  decodeVin, sanitizeVin, wmiByCountry, WMI_DATA, YEAR_TABLE,
  yearFromCode, codeFromYear, VIN_INVALID_LETTERS,
  type VinSection,
} from '@/lib/vinDecoder'

type TabKey = 'decode' | 'makers' | 'year'
const TABS: { key: TabKey; label: string }[] = [
  { key: 'decode', label: 'VIN 해석' },
  { key: 'makers', label: '제조사 사전' },
  { key: 'year', label: '연식 코드' },
]

// 체크 디지트까지 유효한 예시 VIN (구조 시연용 — 실차량 식별 아님)
const SAMPLES: { vin: string; label: string }[] = [
  { vin: 'KMHLN4AG7PU100001', label: '현대 (한국)' },
  { vin: 'KNARH81G6R5200002', label: '기아 (한국)' },
  { vin: 'WBA13AK02RC400004', label: 'BMW (독일)' },
]

const SEG_DEFS: { key: VinSection; label: string; cls: string; dot: string; from: number; to: number; pos: string }[] = [
  { key: 'wmi',    label: 'WMI 제조사', cls: styles.cWmi,    dot: styles.dWmi,    from: 0,  to: 3,  pos: '1–3' },
  { key: 'vds',    label: 'VDS 사양',   cls: styles.cVds,    dot: styles.dVds,    from: 3,  to: 8,  pos: '4–8' },
  { key: 'check',  label: '체크',       cls: styles.cCheck,  dot: styles.dCheck,  from: 8,  to: 9,  pos: '9' },
  { key: 'year',   label: '연식',       cls: styles.cYear,   dot: styles.dYear,   from: 9,  to: 10, pos: '10' },
  { key: 'plant',  label: '공장',       cls: styles.cPlant,  dot: styles.dPlant,  from: 10, to: 11, pos: '11' },
  { key: 'serial', label: '일련번호',   cls: styles.cSerial, dot: styles.dSerial, from: 11, to: 17, pos: '12–17' },
]

const REC_KEY = 'youtil:vin-decoder:recent-v1'
function loadRecents(): string[] {
  try {
    const r = localStorage.getItem(REC_KEY)
    const a = r ? JSON.parse(r) : []
    return Array.isArray(a) ? a.filter((v) => typeof v === 'string') : []
  } catch { return [] }
}
function saveRecents(r: string[]): void {
  try { localStorage.setItem(REC_KEY, JSON.stringify(r)) } catch { /* noop */ }
}
const maskVin = (v: string): string => (v.length >= 12 ? v.slice(0, 11) + '••••••' : v)

export default function VinDecoderClient() {
  const [tab, setTab] = useState<TabKey>('decode')
  const [vin, setVin] = useState('')
  const [recents, setRecents] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [dirQuery, setDirQuery] = useState('')
  const [yearCode, setYearCode] = useState('')
  const [yearNum, setYearNum] = useState('')

  useEffect(() => { setRecents(loadRecents()); setMounted(true) }, [])

  // ── 해석 (렌더 중 파생 — 순수·저비용) ──
  const r = decodeVin(vin)

  function saveCurrent() {
    if (!r.valid17) return
    const next = [r.clean, ...recents.filter((v) => v !== r.clean)].slice(0, 8)
    setRecents(next); saveRecents(next)
    setSavedFlash(true); window.setTimeout(() => setSavedFlash(false), 1200)
  }
  function delRecent(v: string) {
    const next = recents.filter((x) => x !== v)
    setRecents(next); saveRecents(next)
  }
  function clearRecents() { setRecents([]); saveRecents([]) }

  // ── 제조사 사전 필터 ──
  const q = dirQuery.trim().toUpperCase()
  const dirGroups = wmiByCountry()
    .map((g) => ({
      country: g.country,
      entries: g.entries.filter((e) => !q || e.prefix.includes(q) || e.maker.toUpperCase().includes(q)),
    }))
    .filter((g) => g.entries.length > 0)

  // ── 연식 변환 ──
  const ycInput = yearCode.trim().toUpperCase().slice(0, 1)
  const ycYears = ycInput ? yearFromCode(ycInput) : null
  const ynInput = parseInt(yearNum.trim(), 10)
  const ynCode = Number.isFinite(ynInput) ? codeFromYear(ynInput) : null

  return (
    <div className={styles.wrap}>
      {/* ── 탭 ── */}
      <div className={styles.tabs} role="tablist" aria-label="VIN 도구">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key}
            className={`${styles.tabBtn} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════ 탭: VIN 해석 ═══════════ */}
      {tab === 'decode' && (
        <>
          <div className={styles.card}>
            <span className={styles.cardLabel}>차대번호(VIN) 17자리 입력</span>
            <div className={styles.vinInputRow}>
              <input
                className={styles.vinInput}
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                aria-label="차대번호(VIN) 입력"
                placeholder="예: KMHLN4AG7PU100001 (17자리)"
                value={vin}
                onChange={(e) => setVin(sanitizeVin(e.target.value))}
              />
              <div className={styles.inputMeta}>
                <span className={`${styles.lenCount} ${r.valid17 ? styles.lenOk : ''}`}>
                  {r.length}/17{r.valid17 ? ' ✓' : ''}
                </span>
                {r.length > 0 && (
                  <button type="button" className={styles.clearBtn} onClick={() => setVin('')}>지우기</button>
                )}
              </div>
            </div>

            <div className={styles.sampleRow}>
              {SAMPLES.map((s) => (
                <button key={s.vin} type="button" className={styles.sampleBtn} onClick={() => setVin(s.vin)}>
                  {s.label}
                </button>
              ))}
            </div>

            {r.hasIOQ && (
              <p className={styles.warnBox}>
                <strong>⚠️ I·O·Q 포함</strong> — 차대번호에는 숫자 1·0과 헷갈리는 <strong>I·O·Q를 쓰지 않습니다</strong>.
                입력을 다시 확인하세요 (입력하신 문자: {r.invalidChars.join(', ')}).
              </p>
            )}
            {r.length > 0 && r.length < 17 && (
              <p className={styles.warnBox}>입력 중… 아직 <strong>{r.length}자</strong>입니다 (총 17자 필요).</p>
            )}

            <p className={styles.helpText}>
              입력한 VIN은 <strong>이 브라우저에서만 즉시 해석</strong>되며 서버로 전송·자동 저장되지 않습니다.
            </p>
          </div>

          {r.valid17 ? (
            <>
              {/* 자리별 분해 시각화 (시각 보조 — 텍스트 결과는 아래 카드) */}
              <div className={styles.card}>
                <span className={styles.cardLabel}>자리별 구성</span>
                <div className={styles.segViz} aria-hidden="true">
                  {SEG_DEFS.map((sd) => (
                    <div key={sd.key} className={styles.segGroup}>
                      <div className={styles.segGroupHead}>
                        <span className={`${styles.segDot} ${sd.dot}`} />{sd.label}
                      </div>
                      <div className={styles.segChars}>
                        {r.clean.slice(sd.from, sd.to).split('').map((ch, i) => (
                          <span key={i}
                            className={`${styles.segChar} ${sd.cls}`}
                            style={VIN_INVALID_LETTERS.includes(ch) ? { borderColor: '#DC2626', color: '#DC2626' } : undefined}>
                            {ch}
                          </span>
                        ))}
                      </div>
                      <div className={styles.segPos}>{sd.pos}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 해석 결과 카드 */}
              <div className={styles.card} aria-live="polite">
                <span className={styles.cardLabel}>VIN 해석 결과</span>
                <div className={styles.resultList}>
                  {/* WMI */}
                  <div className={styles.resRow}>
                    <span className={styles.resIcon}>📍</span>
                    <div className={styles.resMain}>
                      <span className={styles.resLabel}>제조국 · 제조사 (WMI {r.sections.wmi})</span>
                      <span className={styles.resValue}>
                        {r.wmi.maker
                          ? `${r.wmi.country} · ${r.wmi.maker}`
                          : `${r.wmi.region}${r.wmi.country ? ` · ${r.wmi.country}` : ''}`}
                      </span>
                      <span className={styles.resSub}>
                        {r.wmi.maker
                          ? (r.wmi.approx
                              ? `${r.wmi.matched} 계열로 제조사 식별 — 정확한 3자리 WMI는 미수록`
                              : `WMI 매칭: ${r.wmi.matched} (정확)`)
                          : '수록되지 않은 WMI입니다. 1번째 자리로 제조 지역만 추정했습니다 (정확한 제조사는 제조사·등록증 확인).'}
                      </span>
                    </div>
                  </div>
                  {/* VDS */}
                  <div className={styles.resRow}>
                    <span className={styles.resIcon}>🔧</span>
                    <div className={styles.resMain}>
                      <span className={styles.resLabel}>차종 · 사양 (VDS 4–8)</span>
                      <span className={`${styles.resValue} ${styles.resCode}`}>{r.sections.vds}</span>
                      <span className={styles.resSub}>차체·엔진·등급 등을 담지만 <strong>제조사마다 자체 체계</strong>라 일반 해석에는 한계가 있습니다.</span>
                    </div>
                  </div>
                  {/* Check */}
                  <div className={styles.resRow}>
                    <span className={styles.resIcon}>{!r.check.computable ? '➖' : r.check.valid ? '✅' : r.check.required ? '⚠️' : '➖'}</span>
                    <div className={styles.resMain}>
                      <span className={styles.resLabel}>체크 디지트 (9번째)</span>
                      <span className={styles.resValue}>
                        <span className={styles.resCode}>{r.sections.check || '—'}</span>{' '}
                        {!r.check.computable ? (
                          <span className={`${styles.badge} ${styles.badgeNeutral}`}>계산 불가</span>
                        ) : r.check.valid ? (
                          <span className={`${styles.badge} ${styles.badgeOk}`}>계산값 일치</span>
                        ) : r.check.required ? (
                          <span className={`${styles.badge} ${styles.badgeWarn}`}>불일치 · 오타 확인 (계산값 {r.check.expected})</span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeNeutral}`}>미적용일 수 있음 (북미식 계산값 {r.check.expected})</span>
                        )}
                      </span>
                      <span className={styles.resSub}>
                        체크 디지트는 <strong>북미(NHTSA)·중국</strong>에서 의무인 검증식입니다. 한국 현대·기아·제네시스는 적용해 보통 일치하지만,
                        <strong> 유럽 수입차(BMW·벤츠 등)는 적용하지 않아 달라도 정상</strong>입니다 — 불일치가 곧 위조는 아닙니다(오타·비적용 가능). 정확한 확인은 제조사·자동차등록증.
                      </span>
                    </div>
                  </div>
                  {/* Year */}
                  <div className={styles.resRow}>
                    <span className={styles.resIcon}>📅</span>
                    <div className={styles.resMain}>
                      <span className={styles.resLabel}>모델 연식 (10번째 · {r.sections.year || '—'})</span>
                      <span className={styles.resValue}>
                        {r.year.years ? `${r.year.years[1]}년 또는 ${r.year.years[0]}년` : '유효한 연식 코드 아님'}
                      </span>
                      <span className={styles.resSub}>
                        {r.year.years
                          ? '연식 코드는 30년 주기로 중복됩니다. 최근 차량은 대부분 뒤쪽(2010~) 연도입니다.'
                          : 'I·O·Q·U·Z·0은 연식 코드로 쓰지 않습니다.'}
                      </span>
                    </div>
                  </div>
                  {/* Plant */}
                  <div className={styles.resRow}>
                    <span className={styles.resIcon}>🏭</span>
                    <div className={styles.resMain}>
                      <span className={styles.resLabel}>조립 공장 (11번째)</span>
                      <span className={`${styles.resValue} ${styles.resCode}`}>{r.sections.plant || '—'}</span>
                      <span className={styles.resSub}>제조사별 공장 코드입니다 (공통 표준 없음).</span>
                    </div>
                  </div>
                  {/* Serial */}
                  <div className={styles.resRow}>
                    <span className={styles.resIcon}>🔢</span>
                    <div className={styles.resMain}>
                      <span className={styles.resLabel}>일련번호 (12–17)</span>
                      <span className={`${styles.resValue} ${styles.resCode}`}>{r.sections.serial}</span>
                      <span className={styles.resSub}>생산 순서를 나타내는 고유 번호입니다.</span>
                    </div>
                  </div>
                </div>

                <button type="button"
                  className={styles.recentClear}
                  onClick={saveCurrent}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14,
                    border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: savedFlash ? '#059669' : 'var(--muted)' }}>
                  {savedFlash ? '✓ 이 브라우저에 저장됨' : '최근 조회에 저장 (이 브라우저에만)'}
                </button>
              </div>
            </>
          ) : r.length === 17 && r.hasIOQ ? (
            <div className={styles.emptyHint}>
              I·O·Q가 포함되어 있어 해석할 수 없습니다 — 위 경고에서 잘못 입력된 문자를 확인하세요
              (대개 <strong>I→1, O·Q→0</strong> 오타입니다).
            </div>
          ) : (
            <div className={styles.emptyHint}>
              17자리 차대번호(VIN)를 입력하면 제조국·제조사·연식·공장·체크 디지트를 자리별로 해석합니다.<br />
              위 예시 버튼으로 먼저 확인해 볼 수 있어요.
            </div>
          )}

          {/* 최근 조회 (opt-in·로컬 전용) */}
          {mounted && recents.length > 0 && (
            <div className={styles.card}>
              <span className={styles.cardLabel}>최근 조회 (이 브라우저에만 저장)</span>
              <div className={styles.recentList}>
                {recents.map((v) => {
                  const rr = decodeVin(v)
                  return (
                    <div key={v} className={styles.recentItem}>
                      <button type="button" className={styles.recentBtn} onClick={() => { setVin(v); setTab('decode') }}>
                        <span className={styles.recentVin}>{maskVin(v)}</span>
                        <span className={styles.recentMeta}>
                          {rr.wmi.maker || rr.wmi.region}{rr.year.years ? ` · ${rr.year.years[1]}년식` : ''}
                        </span>
                      </button>
                      <button type="button" className={styles.recentDel} aria-label={`${maskVin(v)} 삭제`} onClick={() => delRecent(v)}>×</button>
                    </div>
                  )
                })}
              </div>
              <button type="button" className={styles.recentClear} onClick={clearRecents}>전체 삭제</button>
              <p className={styles.helpText}>최근 조회는 <strong>이 브라우저(localStorage)에만</strong> 저장되며 어디에도 전송되지 않습니다. 일련번호는 화면에서 가려집니다.</p>
            </div>
          )}

          {/* VIN 위치 / vs 번호판 안내 */}
          <div className={styles.infoCard}>
            <p className={styles.infoTitle}>차대번호(VIN)는 어디에 있나요?</p>
            <ul className={styles.infoList}>
              <li>운전석 <strong>앞유리 하단</strong>(대시보드 끝)에서 밖으로 보이는 금속판</li>
              <li>운전석 <strong>도어를 열면 보이는 안쪽 스티커</strong></li>
              <li><strong>보닛 내부·엔진룸</strong> 각인</li>
              <li><strong>자동차등록증·보험증서</strong>의 차대번호 항목</li>
            </ul>
          </div>
          <div className={styles.infoCard}>
            <p className={styles.infoTitle}>차대번호(VIN) vs 차량번호(번호판)</p>
            <ul className={styles.infoList}>
              <li><strong>차대번호(VIN):</strong> 차량 고유 식별번호 · 17자리 · 영구 불변</li>
              <li><strong>차량번호(번호판):</strong> 등록 번호 · 이전·말소 시 변경 가능</li>
              <li>본 도구는 <strong>차대번호(VIN)</strong>를 해석합니다.</li>
            </ul>
          </div>

          {/* 경계·개인정보 안내 */}
          <div className={styles.privacyBox}>
            본 도구는 <strong>VIN 구조 해석</strong>만 합니다. 사고·주행거리·소유자·압류 등 <strong>이력 조회가 아닙니다</strong>.
            차량 이력은 <a className={styles.link} href="https://www.carhistory.or.kr" target="_blank" rel="noopener noreferrer">카히스토리(보험개발원)</a>,
            압류·저당은 <a className={styles.link} href="https://www.gov.kr" target="_blank" rel="noopener noreferrer">정부24 자동차등록원부</a> 등 공식 서비스를 이용하세요.
          </div>
        </>
      )}

      {/* ═══════════ 탭: 제조사 사전 ═══════════ */}
      {tab === 'makers' && (
        <div className={styles.card}>
          <span className={styles.cardLabel}>WMI 제조사 코드 사전 ({WMI_DATA.length}개 · 한국·일본·독일·미국 주요)</span>
          <input
            className={styles.dirSearch}
            type="text"
            aria-label="제조사 또는 코드 검색"
            placeholder="코드(KMH) 또는 제조사명(현대·BMW) 검색"
            value={dirQuery}
            onChange={(e) => setDirQuery(e.target.value)}
          />
          {dirGroups.length === 0 ? (
            <div className={styles.emptyHint}>검색 결과가 없습니다. 코드(예: KMH) 또는 제조사명(예: 기아)으로 검색해 보세요.</div>
          ) : (
            dirGroups.map((g) => (
              <div key={g.country} className={styles.dirGroup}>
                <p className={styles.dirCountry}>{g.country}</p>
                {g.entries.map((e) => (
                  <div key={e.prefix} className={styles.dirRow}>
                    <span className={styles.dirPrefix}>{e.prefix}</span>
                    <span className={styles.dirMaker}>{e.maker}</span>
                  </div>
                ))}
              </div>
            ))
          )}
          <p className={styles.helpText}>
            WMI는 전 세계 수천 개로, 본 사전은 <strong>주요 제조사 위주</strong>입니다. 미수록 코드는 1번째 자리로 제조 지역만 추정됩니다.
            2자리 항목은 브랜드, 3자리 항목은 차종 힌트를 포함합니다.
          </p>
        </div>
      )}

      {/* ═══════════ 탭: 연식 코드 ═══════════ */}
      {tab === 'year' && (
        <>
          <div className={styles.card}>
            <span className={styles.cardLabel}>연식 코드 ↔ 연도 변환 (10번째 자리)</span>
            <div className={styles.convRow}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="vin-yc">코드 → 연도</label>
                <input id="vin-yc" className={styles.input} type="text" inputMode="text" maxLength={1}
                  placeholder="예: T" value={yearCode}
                  onChange={(e) => setYearCode(e.target.value.replace(/[^A-Za-z0-9]/g, ''))} />
                {ycInput && (
                  <div className={styles.convResult}>
                    {ycYears ? (
                      <>
                        <div className={styles.convBig}><strong>{ycYears[1]}</strong> 또는 {ycYears[0]}</div>
                        <div className={styles.convNote}>30년 주기 중복 — 최근 차량은 대개 {ycYears[1]}년</div>
                      </>
                    ) : (
                      <div className={styles.convNote}>‘{ycInput}’은(는) 연식 코드가 아닙니다 (I·O·Q·U·Z·0 제외).</div>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="vin-yn">연도 → 코드</label>
                <input id="vin-yn" className={styles.input} type="text" inputMode="numeric" maxLength={4}
                  placeholder="예: 2026" value={yearNum}
                  onChange={(e) => setYearNum(e.target.value.replace(/[^0-9]/g, ''))} />
                {yearNum.length === 4 && (
                  <div className={styles.convResult}>
                    {ynCode ? (
                      <>
                        <div className={styles.convBig}>코드 <strong>{ynCode}</strong></div>
                        <div className={styles.convNote}>{ynInput}년 모델의 10번째 자리</div>
                      </>
                    ) : (
                      <div className={styles.convNote}>1980~2039년만 지원합니다.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <span className={styles.cardLabel}>연식 코드 전체표 (30년 주기)</span>
            <table className={styles.yearTable}>
              <thead>
                <tr><th scope="col">코드</th><th scope="col">1차 (1980~)</th><th scope="col">2차 (2010~)</th></tr>
              </thead>
              <tbody>
                {YEAR_TABLE.map((row) => (
                  <tr key={row.code}>
                    <td>{row.code}</td>
                    <td>{row.y1}</td>
                    <td>{row.y2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={styles.helpText}><strong>I·O·Q·U·Z·0</strong>은 연식 코드로 쓰지 않습니다 (숫자·다른 글자와 혼동 방지).</p>
          </div>
        </>
      )}
    </div>
  )
}
