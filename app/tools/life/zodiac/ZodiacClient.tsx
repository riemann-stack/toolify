/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import styles from './zodiac.module.css'
import {
  getZodiacByYear,
  getStarSign,
  getGanji,
  getBirthMonth,
  getAgeInfo,
  evalZodiacPair,
  evalElementPair,
  elementSynergyText,
  loadFamily,
  saveFamily,
  newFamilyId,
  RELATION_KINDS,
  relationTip,
  type RelationKind,
  type FamilyMember,
} from './zodiacUtils'

type TabId = 'profile' | 'compat' | 'family'

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - 1930 + 1 }, (_, i) => currentYear - i)

export default function ZodiacClient() {
  const [tab, setTab] = useState<TabId>('profile')

  // ── 프로필 탭 (기존 강화) ──
  const [year,  setYear]  = useState('')
  const [month, setMonth] = useState('')
  const [day,   setDay]   = useState('')
  const [copied, setCopied] = useState(false)

  // ── 두 사람 궁합 탭 ──
  const [aYear, setAYear] = useState('1993'); const [aMonth, setAMonth] = useState('5');  const [aDay, setADay] = useState('27')
  const [bYear, setBYear] = useState('1995'); const [bMonth, setBMonth] = useState('8');  const [bDay, setBDay] = useState('15')
  const [relKind, setRelKind] = useState<RelationKind>('lover')

  // ── 가족 탭 ──
  const [family, setFamily] = useState<FamilyMember[]>([])
  const [famLoaded, setFamLoaded] = useState(false)
  const [newRel, setNewRel] = useState<FamilyMember['relation']>('자녀')
  const [newName, setNewName] = useState('')
  const [newY, setNewY] = useState(''); const [newM, setNewM] = useState(''); const [newD, setNewD] = useState('')

  useEffect(() => { setFamily(loadFamily()); setFamLoaded(true) }, [])

  const daysInMonth = year && month ? getDaysInMonth(parseInt(year), parseInt(month)) : 31
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  /* ── 메인 프로필 결과 ── */
  const profile = useMemo(() => {
    const y = parseInt(year), m = parseInt(month), d = parseInt(day)
    if (!y || !m || !d) return null
    const chinese = getZodiacByYear(y)
    const star = getStarSign(m, d)
    const ganji = getGanji(y)
    const birthMonth = getBirthMonth(m)
    const ageInfo = getAgeInfo(y, m, d)
    return { chinese, star, ganji, birthMonth, ageInfo, year: y, month: m, day: d }
  }, [year, month, day])

  /* ── 두 사람 궁합 결과 ── */
  const compatResult = useMemo(() => {
    const y1 = parseInt(aYear), m1 = parseInt(aMonth), d1 = parseInt(aDay)
    const y2 = parseInt(bYear), m2 = parseInt(bMonth), d2 = parseInt(bDay)
    if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return null
    const a = { chinese: getZodiacByYear(y1), star: getStarSign(m1, d1), ganji: getGanji(y1) }
    const b = { chinese: getZodiacByYear(y2), star: getStarSign(m2, d2), ganji: getGanji(y2) }
    const zodiacEval = evalZodiacPair(a.chinese.name, b.chinese.name)
    const elementEval = evalElementPair(a.star.element, b.star.element)
    // 종합: 띠 60% + 별자리 40%
    const overall = Math.round((zodiacEval.score * 0.6 + elementEval.score * 0.4) * 10) / 10
    return { a, b, zodiacEval, elementEval, overall }
  }, [aYear, aMonth, aDay, bYear, bMonth, bDay])

  /* ── 핸들러 ── */
  const handleMonthChange = (v: string, kind: 'self') => {
    if (kind === 'self') { setMonth(v); setDay('') }
  }

  const handleCopy = async () => {
    if (!profile) return
    const text = `🎂 ${profile.year}년 ${profile.month}월 ${profile.day}일 출생
${profile.chinese.emoji} ${profile.chinese.name}띠 (${profile.chinese.hanja}) · ${profile.star.emoji} ${profile.star.name}
60갑자: ${profile.ganji.hanja} (${profile.ganji.hangul})
${profile.month}월 탄생석: ${profile.birthMonth.stone}
다음 생일까지: D-${profile.ageInfo.daysToBirthday}
환갑: ${profile.ageInfo.hwangapYear}년
youtil.kr/tools/life/zodiac (재미용 도구)`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  /* ── 가족 추가/삭제 ── */
  const handleAddFamily = () => {
    const y = parseInt(newY), m = parseInt(newM), d = parseInt(newD)
    if (!y || !m || !d || !newName.trim()) return
    const next: FamilyMember[] = [...family, {
      id: newFamilyId(), name: newName.trim(), relation: newRel,
      year: y, month: m, day: d,
    }]
    setFamily(next); saveFamily(next)
    setNewName(''); setNewY(''); setNewM(''); setNewD('')
  }
  const handleDelFamily = (id: string) => {
    if (!confirm('이 가족 구성원을 삭제하시겠습니까?')) return
    const next = family.filter(f => f.id !== id)
    setFamily(next); saveFamily(next)
  }

  return (
    <div className={styles.wrap}>
      {/* 강화된 면책 */}
      <div className={styles.disclaimerStrong}>
        ⚠️ <strong>본 도구는 재미용·교육용 도구입니다.</strong>{' '}
        점성술·사주명리는 재미·문화 영역이며, 인생 결정 도구가 아닙니다 (결혼·이별·취업 결정 X).
        운세·미래 예측 X, 절대화 표현 X. 관계 갈등 시 전문 상담 권장 (한국 결혼관계 상담 1644-2255).
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        <button className={`${styles.tabBtn} ${tab === 'profile' ? styles.tabActive : ''}`} onClick={() => setTab('profile')}>
          🐯 프로필 카드
        </button>
        <button className={`${styles.tabBtn} ${tab === 'compat' ? styles.tabActiveCompat : ''}`} onClick={() => setTab('compat')}>
          💕 두 사람 궁합
        </button>
        <button className={`${styles.tabBtn} ${tab === 'family' ? styles.tabActiveFamily : ''}`} onClick={() => setTab('family')}>
          👨‍👩‍👧 가족 띠
        </button>
      </div>

      {/* ──────── TAB 1: 프로필 카드 ──────── */}
      {tab === 'profile' && (
        <>
          {/* 입력 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>생년월일 선택 (양력)</label>
            <div className={styles.selectRow}>
              <div className={styles.selectWrap}>
                <select className={styles.select} value={year} onChange={e => { setYear(e.target.value); setDay('') }}>
                  <option value="">년도</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
                </select>
                <span className={styles.selectArrow}>▾</span>
              </div>
              <div className={styles.selectWrap}>
                <select className={styles.select} value={month} onChange={e => handleMonthChange(e.target.value, 'self')}>
                  <option value="">월</option>
                  {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
                <span className={styles.selectArrow}>▾</span>
              </div>
              <div className={styles.selectWrap}>
                <select className={styles.select} value={day} onChange={e => setDay(e.target.value)} disabled={!month}>
                  <option value="">일</option>
                  {days.map(d => <option key={d} value={d}>{d}일</option>)}
                </select>
                <span className={styles.selectArrow}>▾</span>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
              💡 <strong style={{ color: 'var(--text)' }}>음력 생년월일</strong>이라면{' '}
              <Link href="/tools/date/lunar" style={{ color: '#3EC8FF', textDecoration: 'underline' }}>양음력 변환기</Link>로
              먼저 양력 변환 후 입력하세요. 음력 설날 전후 출생자는 띠가 1년 차이날 수 있습니다.
            </div>
          </div>

          {profile ? (
            <>
              {/* ★ 통합 프로필 카드 (NEW) */}
              <div className={styles.profileCard}>
                <div className={styles.profileTitle}>
                  🎂 {profile.year}년 {profile.month}월 {profile.day}일 (양력)
                </div>
                <div className={styles.profileBigRow}>
                  <div className={styles.profileBigItem}>
                    <div className={styles.profileBigType}>띠</div>
                    <div className={styles.profileBigEmoji}>{profile.chinese.emoji}</div>
                    <div className={styles.profileBigName}>{profile.chinese.name}띠 ({profile.chinese.hanja})</div>
                  </div>
                  <div className={styles.profileBigItem}>
                    <div className={styles.profileBigType}>별자리</div>
                    <div className={styles.profileBigEmoji}>{profile.star.emoji}</div>
                    <div className={styles.profileBigName} style={{ color: profile.star.color }}>
                      {profile.star.name}
                    </div>
                  </div>
                </div>
                <div className={styles.profileMeta}>
                  <div className={styles.profileMetaCard}>
                    <div className={styles.profileMetaLabel}>📅 60갑자</div>
                    <div className={styles.profileMetaValue}>{profile.ganji.hanja} ({profile.ganji.hangul})</div>
                    <div className={styles.profileMetaSub}>
                      {profile.ganji.stem.element} · {profile.ganji.branch.element} 조합
                    </div>
                  </div>
                  <div className={styles.profileMetaCard}>
                    <div className={styles.profileMetaLabel}>🌬️ 별자리 원소</div>
                    <div className={styles.profileMetaValue} style={{ color: profile.star.color }}>{profile.star.element}</div>
                    <div className={styles.profileMetaSub}>{profile.star.traits.join(' · ')}</div>
                  </div>
                  <div className={styles.profileMetaCard}>
                    <div className={styles.profileMetaLabel}>✨ {profile.month}월 탄생석</div>
                    <div className={styles.profileMetaValue}>{profile.birthMonth.stone}</div>
                    <div className={styles.profileMetaSub}>🌸 {profile.birthMonth.flower} · 🎨 {profile.birthMonth.color}</div>
                  </div>
                  <div className={styles.profileMetaCard}>
                    <div className={styles.profileMetaLabel}>🎂 만 나이 · 다음 생일</div>
                    <div className={styles.profileMetaValue}>만 {profile.ageInfo.age}세 · D-{profile.ageInfo.daysToBirthday}</div>
                    <div className={styles.profileMetaSub}>환갑: {profile.ageInfo.hwangapYear}년 ({profile.year + 60})</div>
                  </div>
                </div>
              </div>

              {/* 띠 성격 */}
              <div className={styles.card}>
                <label className={styles.cardLabel}>{profile.chinese.name}띠 성격 — 일반적 해석</label>
                <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.85, margin: 0 }}>
                  {profile.chinese.personality}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {profile.chinese.traits.map(t => (
                    <span key={t} className={styles.trait}>{t}</span>
                  ))}
                </div>
              </div>

              {/* 별자리 강·약 */}
              <div className={styles.card}>
                <label className={styles.cardLabel}>{profile.star.emoji} {profile.star.name} — 강점·주의점</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
                  <div style={{ background: 'rgba(62,255,155,0.04)', border: '1px solid rgba(62,255,155,0.30)', borderRadius: 10, padding: '10px 12px' }}>
                    <p style={{ fontSize: 12, color: '#3EFF9B', fontWeight: 700, marginBottom: 4 }}>💪 강점</p>
                    <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7 }}>{profile.star.strengths.join(' · ')}</p>
                  </div>
                  <div style={{ background: 'rgba(255,140,62,0.04)', border: '1px solid rgba(255,140,62,0.30)', borderRadius: 10, padding: '10px 12px' }}>
                    <p style={{ fontSize: 12, color: '#FF8C3E', fontWeight: 700, marginBottom: 4 }}>⚠️ 주의점</p>
                    <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7 }}>{profile.star.cautions.join(' · ')}</p>
                  </div>
                </div>
              </div>

              {/* 60갑자 해석 */}
              <div className={styles.ganjiCard}>
                <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                  나의 60갑자 (干支)
                </div>
                <div className={styles.ganjiHanja}>{profile.ganji.hanja}</div>
                <div className={styles.ganjiHangul}>{profile.ganji.hangul}년생 · {profile.chinese.name}띠</div>
                <div className={styles.ganjiSub}>
                  60갑자 중 <strong>{profile.ganji.order}번째</strong> · 천간 {profile.ganji.stem.k}({profile.ganji.stem.element}) · 지지 {profile.ganji.branch.k}({profile.ganji.branch.element})
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginTop: 10 }}>
                  ⚠️ 60갑자 해석은 사주명리학의 일부분이며, 정확한 분석은 출생 시간·월·일까지 모두 고려해야 합니다.
                  본 해석은 일반적·재미용 가이드입니다.
                </p>
              </div>

              {/* 같은 띠 해 */}
              <div className={styles.yearSection}>
                <div className={styles.yearHead}>같은 {profile.chinese.name}띠 해 (12년 주기)</div>
                <div className={styles.yearRow}>
                  {profile.chinese.years.map(y => (
                    <span key={y} className={`${styles.yearTag} ${y === profile.year ? styles.yearTagActive : ''}`}>
                      {y}년
                    </span>
                  ))}
                </div>
              </div>

              {/* 공유 */}
              <div className={styles.shareCard}>
                <div className={styles.shareText}>
                  <strong>내 통합 프로필</strong>을 친구에게 공유 (재미용)
                </div>
                <button type="button"
                  className={`${styles.shareBtn} ${copied ? styles.copied : ''}`}
                  onClick={handleCopy}>
                  {copied ? '✅ 복사됨' : '📋 결과 복사'}
                </button>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              {year && month && !day
                ? '일(日)을 선택해주세요'
                : '생년월일을 선택하면 통합 프로필 카드가 생성됩니다'}
            </div>
          )}
        </>
      )}

      {/* ──────── TAB 2: 두 사람 궁합 ──────── */}
      {tab === 'compat' && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>두 사람의 생년월일 (양력)</label>

            <div className={styles.twoPersonRow}>
              <div className={styles.personPanel}>
                <div className={styles.personPanelTitle}>🙋 나</div>
                <div className={styles.personPanelRow}>
                  <select className={styles.personPanelSelect} value={aYear} onChange={e => setAYear(e.target.value)}>
                    {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
                  </select>
                  <select className={styles.personPanelSelect} value={aMonth} onChange={e => setAMonth(e.target.value)}>
                    {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                  </select>
                  <select className={styles.personPanelSelect} value={aDay} onChange={e => setADay(e.target.value)}>
                    {Array.from({ length: getDaysInMonth(parseInt(aYear) || 2000, parseInt(aMonth) || 1) }, (_, i) => i + 1)
                      .map(d => <option key={d} value={d}>{d}일</option>)}
                  </select>
                </div>
                {compatResult && (
                  <div className={styles.personSummary}>
                    <strong>{compatResult.a.chinese.emoji} {compatResult.a.chinese.name}띠</strong>{' · '}
                    <strong>{compatResult.a.star.emoji} {compatResult.a.star.name}</strong>{' · '}
                    {compatResult.a.ganji.hanja}
                  </div>
                )}
              </div>
              <div className={styles.personPanel}>
                <div className={styles.personPanelTitle}>👤 상대</div>
                <div className={styles.personPanelRow}>
                  <select className={styles.personPanelSelect} value={bYear} onChange={e => setBYear(e.target.value)}>
                    {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
                  </select>
                  <select className={styles.personPanelSelect} value={bMonth} onChange={e => setBMonth(e.target.value)}>
                    {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                  </select>
                  <select className={styles.personPanelSelect} value={bDay} onChange={e => setBDay(e.target.value)}>
                    {Array.from({ length: getDaysInMonth(parseInt(bYear) || 2000, parseInt(bMonth) || 1) }, (_, i) => i + 1)
                      .map(d => <option key={d} value={d}>{d}일</option>)}
                  </select>
                </div>
                {compatResult && (
                  <div className={styles.personSummary}>
                    <strong>{compatResult.b.chinese.emoji} {compatResult.b.chinese.name}띠</strong>{' · '}
                    <strong>{compatResult.b.star.emoji} {compatResult.b.star.name}</strong>{' · '}
                    {compatResult.b.ganji.hanja}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>관계 유형</label>
            <div className={styles.relationKindRow}>
              {RELATION_KINDS.map(k => (
                <button key={k.id}
                  className={`${styles.relationKindBtn} ${relKind === k.id ? styles.relationKindBtnActive : ''}`}
                  onClick={() => setRelKind(k.id)}>
                  <span className={styles.relationKindEmoji}>{k.emoji}</span>
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          {compatResult && (
            <>
              {/* 종합 점수 카드 */}
              <div className={`${styles.compatScoreCard} ${
                compatResult.zodiacEval.type === '삼합' ? styles.compatScoreCardSamhap :
                compatResult.zodiacEval.type === '육합' ? styles.compatScoreCardYukhap :
                compatResult.zodiacEval.type === '충' ? styles.compatScoreCardChung : styles.compatScoreCardOk
              }`}>
                <div className={styles.compatScoreLabel}>종합 궁합 (재미용)</div>
                <div className={styles.compatScoreNum}
                  style={{ color: compatResult.zodiacEval.score >= 4 ? '#3EFF9B' : compatResult.zodiacEval.score === 3 ? '#FFD700' : '#FF6B6B' }}>
                  {compatResult.overall.toFixed(1)} / 5.0
                </div>
                <div className={styles.starRow}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <span key={n} className={n <= Math.round(compatResult.overall) ? styles.starOn : styles.starOff}>★</span>
                  ))}
                </div>
                <div className={styles.compatScoreType}>
                  띠: {compatResult.zodiacEval.type} · 별자리 원소: {compatResult.elementEval.type === '삼합' ? '시너지' : compatResult.elementEval.type === '충' ? '거리감' : '평범'}
                </div>
              </div>

              {/* 띠 궁합 */}
              <div className={styles.card}>
                <label className={styles.cardLabel}>🐯 띠 궁합 ({compatResult.a.chinese.name} × {compatResult.b.chinese.name})</label>
                <p style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.85, margin: 0 }}>
                  <strong style={{ color: 'var(--accent)' }}>{compatResult.zodiacEval.type}</strong> 조합 — {compatResult.zodiacEval.desc}
                </p>
              </div>

              {/* 별자리 원소 궁합 */}
              <div className={styles.card}>
                <label className={styles.cardLabel}>🌬️ 별자리 원소 궁합 ({compatResult.a.star.element} × {compatResult.b.star.element})</label>
                <p style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.85, margin: 0 }}>
                  {elementSynergyText(compatResult.a.star.element, compatResult.b.star.element)}
                </p>
              </div>

              {/* 관계별 팁 */}
              <div className={styles.relationTipBox}>
                <strong>{RELATION_KINDS.find(r => r.id === relKind)?.emoji} {RELATION_KINDS.find(r => r.id === relKind)?.label} 관계 팁:</strong><br />
                {relationTip(relKind, compatResult.zodiacEval.score)}
              </div>

              <div className={styles.disclaimerStrong}>
                <strong>⚠️ 본 궁합은 재미용 해석입니다.</strong>{' '}
                실제 관계는 두 사람의 노력·소통·이해로 결정됩니다.
                <strong> 본 결과로 인생 결정 (결혼·이별 등)을 하지 마세요.</strong>
                <ul>
                  <li>한국 결혼관계 상담: 1644-2255</li>
                  <li>청소년·가족 상담: 1388</li>
                  <li>정신건강 위기상담: 1577-0199</li>
                </ul>
              </div>
            </>
          )}
        </>
      )}

      {/* ──────── TAB 3: 가족 띠 ──────── */}
      {tab === 'family' && famLoaded && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>👨‍👩‍👧 가족 구성원 추가 (브라우저에 저장)</label>
            <div className={styles.familyAddRow}>
              <select className={styles.personPanelSelect} value={newRel} onChange={e => setNewRel(e.target.value as FamilyMember['relation'])}>
                <option value="본인">본인</option>
                <option value="배우자">배우자</option>
                <option value="자녀">자녀</option>
                <option value="부모">부모</option>
                <option value="형제자매">형제자매</option>
                <option value="기타">기타</option>
              </select>
              <input className={styles.personPanelSelect} type="text" placeholder="이름" maxLength={20}
                value={newName} onChange={e => setNewName(e.target.value)} />
              <input className={styles.personPanelSelect} type="number" placeholder="년" min={1900} max={currentYear}
                value={newY} onChange={e => setNewY(e.target.value)} />
              <input className={styles.personPanelSelect} type="number" placeholder="월" min={1} max={12}
                value={newM} onChange={e => setNewM(e.target.value)} />
              <input className={styles.personPanelSelect} type="number" placeholder="일" min={1} max={31}
                value={newD} onChange={e => setNewD(e.target.value)} />
              <button className={styles.familyDelBtn} onClick={handleAddFamily} title="추가" style={{ color: '#3EC8FF' }}>+</button>
            </div>
            {family.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                아직 추가된 가족 없음. 위 입력 후 +를 누르세요.
              </p>
            )}
          </div>

          {family.length > 0 && (
            <>
              <div className={styles.card}>
                <label className={styles.cardLabel}>📋 가족 띠 표 ({family.length}명)</label>
                <div className={styles.familyTableWrap}>
                  <table className={styles.familyTable}>
                    <thead>
                      <tr>
                        <th>관계</th>
                        <th>이름</th>
                        <th>생년월일</th>
                        <th>띠</th>
                        <th>별자리</th>
                        <th>60갑자</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {family.map(f => {
                        const z = getZodiacByYear(f.year)
                        const s = getStarSign(f.month, f.day)
                        const g = getGanji(f.year)
                        return (
                          <tr key={f.id}>
                            <td>{f.relation}</td>
                            <td><strong>{f.name}</strong></td>
                            <td className="numCol">{f.year}.{f.month}.{f.day}</td>
                            <td>{z.emoji} {z.name}</td>
                            <td>{s.emoji} {s.name}</td>
                            <td className="numCol">{g.hanja}</td>
                            <td><button className={styles.familyDelBtn} onClick={() => handleDelFamily(f.id)}>×</button></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 가족 궁합 매트릭스 */}
              {family.length >= 2 && (
                <div className={styles.card}>
                  <label className={styles.cardLabel}>💕 가족 궁합 매트릭스 (재미용)</label>
                  <div className={styles.familyTableWrap}>
                    <table className={styles.familyTable}>
                      <thead>
                        <tr>
                          <th></th>
                          {family.map(f => <th key={f.id}>{f.name}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {family.map(a => (
                          <tr key={a.id}>
                            <td><strong>{a.name}</strong></td>
                            {family.map(b => {
                              if (a.id === b.id) return <td key={b.id} style={{ color: 'var(--muted)' }}>—</td>
                              const aZ = getZodiacByYear(a.year)
                              const bZ = getZodiacByYear(b.year)
                              const ev = evalZodiacPair(aZ.name, bZ.name)
                              const color = ev.score >= 4 ? '#3EFF9B' : ev.score === 3 ? '#FFD700' : '#FF6B6B'
                              const icon = ev.score >= 4 ? '🟢' : ev.score === 3 ? '🟡' : '🔴'
                              return (
                                <td key={b.id} style={{ color, fontSize: 11 }}>
                                  {icon} {ev.type}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
                    ⚠️ 가족 궁합은 재미용. 실제 가족 관계는 함께 보낸 시간·이해·사랑으로 결정됩니다.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
