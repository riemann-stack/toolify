'use client'

import { useState } from 'react'
import {
  RELATIONSHIPS, REL_MAP, COMPANIONS, ENVELOPE, calcGift, MEAL_COST, type Mode,
} from './giftMoneyData'
import s from './gift-money.module.css'

const won = (man: number) => (man * 10000).toLocaleString('ko-KR')

const MODE_COLOR: Record<Mode, string> = { wedding: '#E11D48', funeral: '#475569' }

export default function GiftMoneyClient() {
  const [mode, setMode] = useState<Mode>('wedding')
  const [relId, setRelId] = useState('friend')
  const [attend, setAttend] = useState(true)
  const [compId, setCompId] = useState('solo')

  const rel = REL_MAP[relId] ?? RELATIONSHIPS[0]
  const comp = COMPANIONS.find((c) => c.id === compId) ?? COMPANIONS[0]
  const res = calcGift(rel, mode, attend, comp.extra)
  const accent = MODE_COLOR[mode]
  const isWedding = mode === 'wedding'
  // 동반(식대 가산)이 추천액을 실제로 바꾸는 관계에서만 노출 — 가까운 친척·직계가족은
  // 금액이 식대를 크게 웃돌아 동반을 더해도 관례 금액이 그대로(죽은 컨트롤 방지)
  const companionMatters = isWedding && attend
    && calcGift(rel, 'wedding', true, 2).recommend !== calcGift(rel, 'wedding', true, 0).recommend

  return (
    <div className={s.wrap}>
      {/* 모드 토글 */}
      <div className={s.modeToggle} role="tablist" aria-label="경조사 종류">
        <button type="button" role="tab" aria-selected={isWedding}
          className={`${s.modeBtn} ${isWedding ? s.modeActive : ''}`}
          style={isWedding ? { background: accent, color: '#fff' } : undefined}
          onClick={() => setMode('wedding')}>🎉 축의금</button>
        <button type="button" role="tab" aria-selected={!isWedding}
          className={`${s.modeBtn} ${!isWedding ? s.modeActive : ''}`}
          style={!isWedding ? { background: accent, color: '#fff' } : undefined}
          onClick={() => setMode('funeral')}>🕊️ 부의금</button>
      </div>

      {/* 관계 */}
      <div className={s.card}>
        <span className={s.cardLabel}>{isWedding ? '결혼식 — 누구의 경사인가요?' : '장례 — 고인·상주와의 관계는?'}</span>
        <div className={s.selectWrap}>
          <select className={s.select} value={relId} onChange={(e) => setRelId(e.target.value)}
            aria-label={isWedding ? '결혼 당사자와의 관계' : '고인·상주와의 관계'}>
            {RELATIONSHIPS.map((r) => (
              <option key={r.id} value={r.id}>{r.label} — {r.hint}</option>
            ))}
          </select>
          <span className={s.selectArrow} aria-hidden="true">▼</span>
        </div>
      </div>

      {/* 참석 여부 */}
      <div className={s.card}>
        <span className={s.cardLabel}>{isWedding ? '예식 참석 여부' : '조문(빈소 방문) 여부'}</span>
        <div className={s.segment} role="group" aria-label="참석 여부">
          <button type="button" aria-pressed={attend}
            className={`${s.segBtn} ${attend ? s.segActive : ''}`}
            style={attend ? { background: accent, color: '#fff', borderColor: accent } : undefined}
            onClick={() => setAttend(true)}>{isWedding ? '참석 (식사)' : '직접 조문'}</button>
          <button type="button" aria-pressed={!attend}
            className={`${s.segBtn} ${!attend ? s.segActive : ''}`}
            style={!attend ? { background: accent, color: '#fff', borderColor: accent } : undefined}
            onClick={() => setAttend(false)}>{isWedding ? '불참 (마음만)' : '못 감 (마음만)'}</button>
        </div>

        {/* 동반 — 식대 가산이 추천액을 바꾸는 관계에서만 */}
        {companionMatters && (
          <div style={{ marginTop: 14 }}>
            <span className={s.subLabel}>동반 인원 — 1인당 식대 약 {MEAL_COST}만원 가산</span>
            <div className={s.segment} role="group" aria-label="동반 인원">
              {COMPANIONS.map((c) => (
                <button key={c.id} type="button" aria-pressed={compId === c.id}
                  className={`${s.segBtn} ${compId === c.id ? s.segActive : ''}`}
                  style={compId === c.id ? { background: accent, color: '#fff', borderColor: accent } : undefined}
                  onClick={() => setCompId(c.id)}>{c.label}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 결과 */}
      <div className={s.hero} role="status" style={{ background: `linear-gradient(135deg, ${accent}1a 0%, ${accent}0d 100%)`, borderColor: `${accent}4d` }}>
        <p className={s.heroLead}>추천 {isWedding ? '축의금' : '부의금'}</p>
        <p className={s.heroValue} style={{ color: accent }}>{res.recommend}만원</p>
        <p className={s.heroWon}>{won(res.recommend)}원</p>
        <p className={s.heroSub}>
          일반적으로 <strong>{res.low === res.high ? `${res.high}만원` : `${res.low}만 ~ ${res.high}만원`}</strong> 선
          {res.mealAdd > 0
            ? ` · 기본 ${res.base}만 + 동반 식대 ${res.mealAdd}만 (1인 ${MEAL_COST}만 기준)`
            : (res.attendBased ? ` · ${attend
                ? (isWedding ? '식사하므로 식대 고려' : '직접 조문 기준')
                : (isWedding ? '참석 안 해 한 단계 낮게' : '조문 못 해 한 단계 낮게')}` : '')}
        </p>
      </div>

      {/* 봉투 문구 */}
      <div className={s.card}>
        <span className={s.cardLabel}>봉투 앞면 문구</span>
        <div className={s.envList}>
          {ENVELOPE[mode].map((e, i) => (
            <div key={i} className={s.envRow}>
              <div className={s.envText}>
                <span className={s.envKo} style={i === 0 ? { color: accent } : undefined}>{e.ko}</span>
                <span className={s.envHanja}>{e.hanja}</span>
              </div>
              <span className={s.envNote}>{e.note}{i === 0 ? ' ✓' : ''}</span>
            </div>
          ))}
        </div>
        <p className={s.helpText}>봉투 <strong>뒷면 왼쪽 아래</strong>에 이름을 세로로 적고, 소속이 있으면 이름 오른쪽에 작게 적어요.</p>
      </div>

      {/* 매너 체크 */}
      <div className={s.card}>
        <span className={s.cardLabel}>꼭 기억할 매너</span>
        <ul className={s.mannerList}>
          <li>
            <strong>지폐 상태 —</strong>{' '}
            {isWedding
              ? '새 지폐(신권)로 준비하면 “미리 축하를 준비했다”는 정성의 표현이에요. 은행·ATM에서 교환할 수 있어요.'
              : '조의금은 전통적으로 신권을 피해요. 빳빳한 새 돈은 부고를 미리 준비한 듯한 인상을 줄 수 있어, 헌 지폐를 쓰거나 지폐를 반으로 접어 넣기도 해요.'}
          </li>
          <li>
            <strong>금액 관례 —</strong> 3·5·7처럼 홀수가 길하다고 보며, 10만원과 그 이상 10단위는 무방해요. <strong>4만원(죽을 사)·9만원(아홉수)은 피하세요.</strong>
          </li>
          {isWedding ? (
            <li><strong>전달 —</strong> 보통 예식장 접수대에서 방명록을 적고 봉투를 내요. 못 가면 가까운 사람 편에 전하거나 계좌로 보내도 괜찮아요.</li>
          ) : (
            <li><strong>조문 인사 —</strong> 빈소에서는 “삼가 고인의 명복을 빕니다” 정도로 짧게 인사하고, 유가족에게 말을 길게 붙이지 않는 것이 예의예요.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
