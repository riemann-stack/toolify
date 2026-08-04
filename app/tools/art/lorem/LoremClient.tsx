'use client'

import Disclaimer from '@/components/Disclaimer'
import { useMemo, useRef, useState } from 'react'
import styles from './lorem.module.css'
import {
  DATA_TYPE_OPTIONS,
  DataItem,
  DataType,
  FORMAT_OPTIONS,
  FormatType,
  LENGTH_PRESETS,
  Lang,
  LengthKey,
  NAME_POOLS,
  NICKNAME_POOLS,
  OVERFLOW_TESTS,
  PRODUCT_DESC_POOLS,
  PRODUCT_NAME_POOLS,
  SCENARIOS,
  SUBTITLE_POOLS,
  Scenario,
  TITLE_POOLS,
  TONE_AWARE_ELEMENTS,
  TONE_OPTIONS,
  Tab,
  Tone,
  UIElement,
  UI_ELEMENT_OPTIONS,
  cycled,
  formatData,
  generateMany,
  generateParagraph,
  generateParagraphs,
  generateUIBatch,

  generateUX,
  pick,
  poolSizeFor,
  randInt,
  randomDateISO,
} from './loremUtils'


const TABS: [Tab, string][] = [
  ['paragraph', '문단'],
  ['ui',        'UI 요소'],
  ['json',      'JSON 데이터'],
  ['card',      '카드 목업'],
  ['ux',        'UX 라이팅'],
  ['length',    '길이 테스트'],
]

/* ───────── 클립보드 ───────── */
function useCopy(): [string | null, (key: string, text: string) => void] {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const copy = (key: string, text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    })
  }
  return [copiedKey, copy]
}

/* ═════════════════════════════════════════ Main ═════════════════════════════════════════ */
export default function LoremClient() {
  const [tab, setTab] = useState<Tab>('paragraph')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const onTabKeyDown = (e: React.KeyboardEvent, i: number) => {
    const last = TABS.length - 1
    let next = -1
    if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1
    else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    if (next < 0) return
    e.preventDefault()
    setTab(TABS[next][0])
    tabRefs.current[next]?.focus()
  }
  const [tone, setTone] = useState<Tone>('default')
  const [copiedKey, copy] = useCopy()
  /* 결과 본문(수천 자)을 통째로 aria-live에 넣으면 스크린리더가 전문을 다시 읽는다.
     짧은 상태 문장만 라이브로 알리고, 본문은 일반 영역에 둔다. */
  const [liveMsg, setLiveMsg] = useState('')

  /* 문단 탭 */
  const [lang, setLang] = useState<Lang>('ko')
  const [pLen, setPLen] = useState<LengthKey>('medium')
  const [pCount, setPCount] = useState(3)
  const [pOutput, setPOutput] = useState('')
  const handleGenerateP = () => {
    setPOutput(generateParagraphs(tone, pLen, pCount, lang))
    setLiveMsg(`문단 ${pCount}개를 생성했습니다.`)
  }

  /* UI 요소 탭 */
  const [uiEl, setUiEl] = useState<UIElement>('titles')
  const [uiCount, setUiCount] = useState(8)
  const [uiOutput, setUiOutput] = useState<string[]>([])
  /* ⚠️ 예전에는 항목마다 독립적으로 pick()해서 풀이 5개일 때 8개를 뽑으면 서너 번씩 겹쳤다. */
  const handleGenerateUI = () => {
    setUiOutput(generateUIBatch(uiEl, tone, uiCount))
    setLiveMsg(`UI 문구 ${uiCount}개를 생성했습니다.`)
  }
  const uiPoolSize = poolSizeFor(uiEl, tone)
  const uiToneAware = TONE_AWARE_ELEMENTS.has(uiEl)

  /* JSON 탭
     ⚠️ 예전에는 포맷된 **문자열**만 저장해서, 포맷 버튼을 눌러도 라벨만 바뀌고 본문은
        그대로였다("같은 데이터를 8가지 형식으로 즉시 변환"이라는 설명과 반대로 재생성이
        필요했고, 재생성하면 데이터 자체가 바뀌었다). 원본 배열을 저장하고 표시만 파생한다. */
  const [dType, setDType] = useState<DataType>('userProfile')
  const [dFormat, setDFormat] = useState<FormatType>('json')
  const [dCount, setDCount] = useState(5)
  const [dData, setDData] = useState<DataItem[] | null>(null)
  /** 생성 당시의 데이터 종류 — 생성 후 종류만 바꿔도 TS 인터페이스 이름이 어긋나지 않게 */
  const [dDataType, setDDataType] = useState<DataType>('userProfile')
  const dOutput = useMemo(
    () => (dData ? formatData(dData, dFormat, dDataType) : ''),
    [dData, dFormat, dDataType],
  )
  const handleGenerateD = () => {
    setDData(generateMany(dType, dCount))
    setDDataType(dType)
    setLiveMsg(`${dCount}개 레코드를 생성했습니다.`)
  }

  /* 카드 UI 미리보기 탭 */
  type CardStyle = 'product' | 'article' | 'profile'
  const [cardStyle, setCardStyle] = useState<CardStyle>('product')
  const [cardCount, setCardCount] = useState(6)
  type CardData =
    | { kind: 'product'; icon: string; title: string; desc: string; price: string; rating: string; badge?: string }
    | { kind: 'article'; icon: string; title: string; desc: string; author: string; date: string }
    | { kind: 'profile'; icon: string; title: string; desc: string; followers: string; nickname: string }
  const [cards, setCards] = useState<CardData[]>([])
  const generateCards = () => {
    const ICONS_PRODUCT = ['🛍️', '👜', '👟', '⌚', '🎧', '📱', '💄', '🧴', '🪑', '📚']
    const ICONS_ARTICLE = ['📰', '📖', '🗞️', '📓', '🧠', '✍️', '📝', '📊']
    const ICONS_PROFILE = ['😀', '🐶', '🐱', '🦊', '🦁', '🐼', '🐨', '🦄', '🐯', '🐻']
    const out: CardData[] = []
    /* 카드 목록 안에서 같은 상품명이 반복되면 목업으로서 설득력이 떨어진다 */
    const productTitles = cycled(PRODUCT_NAME_POOLS, cardCount)
    const productDescs = cycled(PRODUCT_DESC_POOLS, cardCount)
    const articleTitles = cycled(TITLE_POOLS[tone], cardCount)
    const cardSubs = cycled(SUBTITLE_POOLS[tone], cardCount)
    const profileNames = cycled(NAME_POOLS, cardCount)
    for (let i = 0; i < cardCount; i++) {
      if (cardStyle === 'product') {
        out.push({
          kind: 'product',
          icon: pick(ICONS_PRODUCT),
          title: productTitles[i],
          desc: productDescs[i],
          price: '₩' + (randInt(5, 250) * 1000).toLocaleString(),
          rating: '★ ' + (3.5 + Math.random() * 1.5).toFixed(1),
          badge: Math.random() < 0.4 ? pick(['NEW', 'HOT', 'SALE', 'BEST']) : undefined,
        })
      } else if (cardStyle === 'article') {
        out.push({
          kind: 'article',
          icon: pick(ICONS_ARTICLE),
          title: articleTitles[i],
          desc: cardSubs[i],
          author: pick(NAME_POOLS),
          date: randomDateISO(),
        })
      } else {
        const name = profileNames[i]
        out.push({
          kind: 'profile',
          icon: pick(ICONS_PROFILE),
          title: name,
          desc: cardSubs[i],
          followers: randInt(50, 50000).toLocaleString() + ' 팔로워',
          nickname: '@' + pick(NICKNAME_POOLS),
        })
      }
    }
    setCards(out)
    setLiveMsg(`카드 ${cardCount}개를 생성했습니다.`)
  }

  /* UX 라이팅 탭 */
  const [scenario, setScenario] = useState<Scenario>('login')
  const ux = useMemo(() => generateUX(scenario, tone), [scenario, tone])

  /* 길이 테스트 탭 */
  const lenSamples = useMemo(() => {
    return LENGTH_PRESETS.map(p => {
      // 한 문단 만들고 글자수에 맞춰 자르거나 반복
      const base = generateParagraph(tone, p.key, 'ko')
      let text = base
      while (text.length < p.targetChars) text += ' ' + base
      return { key: p.key, label: p.label, text: text.slice(0, p.targetChars), len: text.slice(0, p.targetChars).length }
    })
     
  }, [tone])

  /* ═════════════════════════════════════════ UI ═════════════════════════════════════════ */
  return (
    <div className={styles.wrap}>

      {/* 면책 */}
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/art/color', label: '색상 변환' },
          { href: '/tools/art/gradient-generator', label: '그라디언트' },
          { href: '/tools/art/golden-ratio', label: '황금 비율' }
        ]}
      >
        참고용 더미 콘텐츠
      </Disclaimer>

      {/* 탭 — role="tablist"를 붙이는 이상 WAI-ARIA APG가 요구하는 화살표키·Home/End 이동과
          roving tabindex를 함께 구현한다. 키보드 동작 없이 role만 붙이면 스크린리더 사용자에게
          "화살표로 이동 가능"이라고 알려 놓고 실제로는 동작하지 않는 상태가 된다. */}
      <div className={styles.tabs} role="tablist" aria-label="더미 생성 종류">
        {TABS.map(([key, label], i) => (
          <button type="button" key={key}
            id={`lorem-tab-${key}`}
            role="tab"
            aria-selected={tab === key}
            aria-controls={`lorem-panel-${key}`}
            tabIndex={tab === key ? 0 : -1}
            ref={el => { tabRefs.current[i] = el }}
            className={`${styles.tabBtn} ${tab === key ? styles.tabActive : ''}`}
            onKeyDown={e => onTabKeyDown(e, i)}
            onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* 생성 결과 알림 — 시각적으로는 숨기고 스크린리더에만 전달 */}
      <p className={styles.srOnly} role="status" aria-live="polite">{liveMsg}</p>

      {/* 톤 (모든 탭 공통) */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>
          톤 선택
          <span className={styles.cardLabelHint}>9가지 분위기 중에서 선택</span>
        </label>
        <div className={styles.toneRow}>
          {TONE_OPTIONS.map(t => (
            <button type="button" key={t.key}
              aria-pressed={tone === t.key}
              className={`${styles.toneBtn} ${tone === t.key ? styles.toneActive : ''}`}
              onClick={() => setTone(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 문단 탭 ─── */}
      {tab === 'paragraph' && (
        <div className={styles.panel} role="tabpanel" id="lorem-panel-paragraph" aria-labelledby="lorem-tab-paragraph">
          <div className={styles.card}>
            <label className={styles.cardLabel}>언어</label>
            <div className={styles.toggleRow}>
              <button type="button" aria-pressed={lang === 'ko'} className={`${styles.toggleBtn} ${lang === 'ko' ? styles.toggleActive : ''}`} onClick={() => setLang('ko')}>🇰🇷 한글</button>
              <button type="button" aria-pressed={lang === 'en'} className={`${styles.toggleBtn} ${lang === 'en' ? styles.toggleActive : ''}`} onClick={() => setLang('en')}>🇺🇸 영문 (Lorem)</button>
            </div>
            {lang === 'en' && (
              <p className={styles.scopeNote}>
                영문은 고전 Lorem Ipsum(의사 라틴어)이라 <strong>톤 구분이 적용되지 않습니다</strong>. 톤은 한글 문단에만 반영됩니다.
              </p>
            )}
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>길이 프리셋</label>
            <div className={styles.optRow}>
              {LENGTH_PRESETS.map(p => (
                <button type="button" key={p.key}
                  className={`${styles.optBtn} ${pLen === p.key ? styles.optActive : ''}`}
                  onClick={() => setPLen(p.key)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel} htmlFor="lorem-f1">
              문단 수
              <span className={styles.cardLabelHint}>{pCount}개</span>
            </label>
            <div className={styles.sliderRow}>
              <input id="lorem-f1" type="range" min={1} max={20} value={pCount} onChange={e => setPCount(parseInt(e.target.value))} />
              <span className={styles.sliderValue}>{pCount}</span>
            </div>
          </div>

          <div className={styles.btnRow}>
            <button type="button" className={styles.actionBtn} onClick={handleGenerateP}>문단 생성</button>
          </div>

          {pOutput && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>
                생성 결과
                <span className={styles.cardLabelHint}>{pOutput.length}자 · {pOutput.split('\n\n').length}문단</span>
              </label>
              <div className={styles.outputBox}>{pOutput}</div>
              <div style={{ marginTop: '12px' }}>
                <button type="button"
                  className={`${styles.copyBtn} ${copiedKey === 'p' ? styles.copied : ''}`}
                  onClick={() => copy('p', pOutput)}>
                  {copiedKey === 'p' ? '✓ 복사됨' : '전체 복사'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── UI 요소 탭 ─── */}
      {tab === 'ui' && (
        <div className={styles.panel} role="tabpanel" id="lorem-panel-ui" aria-labelledby="lorem-tab-ui">
          <div className={styles.card}>
            <label className={styles.cardLabel}>요소 종류</label>
            <div className={styles.elementGrid}>
              {UI_ELEMENT_OPTIONS.map(opt => (
                <button type="button" key={opt.key}
                  aria-pressed={uiEl === opt.key}
                  className={`${styles.elementCard} ${uiEl === opt.key ? styles.elementActive : ''}`}
                  onClick={() => setUiEl(opt.key)}>
                  <small>{opt.icon}</small>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel} htmlFor="lorem-count">
              생성 개수
              <span className={styles.cardLabelHint}>{uiCount}개</span>
            </label>
            <div className={styles.sliderRow}>
              <input id="lorem-count" type="range" min={1} max={30} value={uiCount} onChange={e => setUiCount(parseInt(e.target.value))} />
              <span className={styles.sliderValue}>{uiCount}</span>
            </div>
            {/* 풀 크기를 숨기면 "왜 같은 문구가 또 나오지?"가 된다 — 미리 밝힌다 */}
            <p className={styles.scopeNote}>
              이 종류의 문구 풀은 <strong>{uiPoolSize}개</strong>
              {uiToneAware ? ' (톤별로 다름)' : ' (톤과 무관한 데이터)'}입니다.
              {uiCount > uiPoolSize && ` 요청하신 ${uiCount}개는 풀보다 많아 일부가 다시 등장합니다.`}
            </p>
          </div>

          <div className={styles.btnRow}>
            <button type="button" className={styles.actionBtn} onClick={handleGenerateUI}>UI 요소 생성</button>
          </div>

          {uiOutput.length > 0 && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>
                생성 결과
                <span className={styles.cardLabelHint}>{uiOutput.length}개</span>
              </label>
              <div className={styles.resultList}>
                {uiOutput.map((item, i) => (
                  <div key={i} className={styles.resultItem}>
                    <span>{item}</span>
                    <button type="button"
                      className={`${styles.miniCopyBtn} ${copiedKey === 'ui-' + i ? styles.miniCopied : ''}`}
                      onClick={() => copy('ui-' + i, item)}>
                      {copiedKey === 'ui-' + i ? '✓' : '복사'}
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '12px' }}>
                <button type="button"
                  className={`${styles.copyBtn} ${copiedKey === 'ui-all' ? styles.copied : ''}`}
                  onClick={() => copy('ui-all', uiOutput.join('\n'))}>
                  {copiedKey === 'ui-all' ? '✓ 복사됨' : '전체 복사 (줄바꿈 구분)'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── JSON 데이터 탭 ─── */}
      {tab === 'json' && (
        <div className={styles.panel} role="tabpanel" id="lorem-panel-json" aria-labelledby="lorem-tab-json">
          <div className={styles.card}>
            <label className={styles.cardLabel}>데이터 종류</label>
            <div className={styles.dataTypeGrid}>
              {DATA_TYPE_OPTIONS.map(opt => (
                <button type="button" key={opt.key}
                  aria-pressed={dType === opt.key}
                  className={`${styles.dataTypeBtn} ${dType === opt.key ? styles.dataTypeActive : ''}`}
                  onClick={() => setDType(opt.key)}>
                  <small>{opt.icon}</small>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>출력 형식</label>
            <div className={styles.formatRow}>
              {FORMAT_OPTIONS.map(opt => (
                <button type="button" key={opt.key}
                  aria-pressed={dFormat === opt.key}
                  className={`${styles.formatBtn} ${dFormat === opt.key ? styles.formatActive : ''}`}
                  onClick={() => setDFormat(opt.key)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel} htmlFor="lorem-f3">
              레코드 수
              <span className={styles.cardLabelHint}>{dCount}개</span>
            </label>
            <div className={styles.sliderRow}>
              <input id="lorem-f3" type="range" min={1} max={50} value={dCount} onChange={e => setDCount(parseInt(e.target.value))} />
              <span className={styles.sliderValue}>{dCount}</span>
            </div>
          </div>

          <div className={styles.btnRow}>
            <button type="button" className={styles.actionBtn} onClick={handleGenerateD}>데이터 생성</button>
          </div>
          <p className={styles.scopeNote}>
            JSON 더미는 이름·금액·날짜 같은 <strong>값</strong>이라 톤 설정의 영향을 받지 않습니다. 톤은 문단·UI 문구·카드·UX 라이팅에 적용됩니다.
          </p>

          {dOutput && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>
                생성 결과
                <span className={styles.cardLabelHint}>{dCount}개 · {dFormat.toUpperCase()}</span>
              </label>
              <pre className={styles.codeBlock}>{dOutput}</pre>
              {/* 값이 왜 이렇게 생겼는지 화면에서 알려 준다 — 모르면 '진짜 같은 값'으로 바꿔 쓰게 된다 */}
              {(dType === 'userProfile' || dType === 'address') && (
                <p className={styles.safetyNote}>
                  이메일은 <strong>example.com</strong> 계열(RFC 2606 예약 · 메일 배달 불가), 휴대전화는 <strong>010-0·010-1</strong> 대역(전기통신번호관리세칙상 부여되지 않는 형식)만 생성합니다. 실존 주소·번호와 겹치지 않게 하려는 의도이므로, 실제 발송 테스트용으로는 쓰지 마세요.
                </p>
              )}
              <div style={{ marginTop: '12px' }}>
                <button type="button"
                  className={`${styles.copyBtn} ${copiedKey === 'd' ? styles.copied : ''}`}
                  onClick={() => copy('d', dOutput)}>
                  {copiedKey === 'd' ? '✓ 복사됨' : '복사'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── 카드 UI 목업 탭 ─── */}
      {tab === 'card' && (
        <div className={styles.panel} role="tabpanel" id="lorem-panel-card" aria-labelledby="lorem-tab-card">
          <div className={styles.card}>
            <label className={styles.cardLabel}>카드 스타일</label>
            <div className={styles.optRow}>
              {([['product', '상품 카드'], ['article', '아티클 카드'], ['profile', '프로필 카드']] as [CardStyle, string][]).map(([k, l]) => (
                <button type="button" key={k}
                  className={`${styles.optBtn} ${cardStyle === k ? styles.optActive : ''}`}
                  onClick={() => setCardStyle(k)}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel} htmlFor="lorem-f4">
              카드 수
              <span className={styles.cardLabelHint}>{cardCount}개</span>
            </label>
            <div className={styles.sliderRow}>
              <input id="lorem-f4" type="range" min={2} max={12} value={cardCount} onChange={e => setCardCount(parseInt(e.target.value))} />
              <span className={styles.sliderValue}>{cardCount}</span>
            </div>
          </div>

          <div className={styles.btnRow}>
            <button type="button" className={styles.actionBtn} onClick={generateCards}>카드 목업 생성</button>
          </div>

          {cards.length > 0 && (
            <div className={styles.previewGrid3}>
              {cards.map((c, i) => (
                <div key={i} className={styles.previewCard}>
                  {c.kind === 'product' && c.badge && <span className={styles.previewBadge}>{c.badge}</span>}
                  <div className={styles.previewIcon}>{c.icon}</div>
                  <div className={styles.previewTitle}>{c.title}</div>
                  <div className={styles.previewDesc}>{c.desc}</div>
                  {c.kind === 'product' && (
                    <div className={styles.previewMeta}>
                      <span className={styles.previewPrice}>{c.price}</span>
                      <span className={styles.previewRating}>{c.rating}</span>
                    </div>
                  )}
                  {c.kind === 'article' && (
                    <div className={styles.previewMeta}>
                      <span>{c.author}</span>
                      <span>{c.date}</span>
                    </div>
                  )}
                  {c.kind === 'profile' && (
                    <div className={styles.previewMeta}>
                      <span>{c.nickname}</span>
                      <span>{c.followers}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── UX 라이팅 탭 ─── */}
      {tab === 'ux' && (
        <div className={styles.panel} role="tabpanel" id="lorem-panel-ux" aria-labelledby="lorem-tab-ux">
          <div className={styles.card}>
            <label className={styles.cardLabel}>시나리오</label>
            <div className={styles.scenarioGrid}>
              {SCENARIOS.map(s => (
                <button type="button" key={s.key}
                  aria-pressed={scenario === s.key}
                  className={`${styles.scenarioBtn} ${scenario === s.key ? styles.scenarioActive : ''}`}
                  onClick={() => setScenario(s.key)}>
                  <small>{s.icon}</small>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              UX 카피 (현재 톤: {TONE_OPTIONS.find(t => t.key === tone)?.label})
            </label>
            <div className={styles.uxResultCard}>
              <div className={styles.uxRow}><strong>제목</strong>{ux.title}</div>
              <div className={styles.uxRow}><strong>본문</strong>{ux.body}</div>
              <div className={styles.uxRow}><strong>주 버튼</strong>{ux.primary}</div>
              <div className={styles.uxRow}><strong>보조 버튼</strong>{ux.secondary}</div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <span className={styles.subLabel}>실제 UI 미리보기</span>
              <div className={styles.previewCard}>
                <div className={styles.previewTitle}>{ux.title}</div>
                <div className={styles.previewDesc}>{ux.body}</div>
                <div className={styles.btnPreviewRow}>
                  <button type="button" className={styles.btnPrimary}>{ux.primary}</button>
                  <button type="button" className={styles.btnSecondary}>{ux.secondary}</button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <button type="button"
                className={`${styles.copyBtn} ${copiedKey === 'ux' ? styles.copied : ''}`}
                onClick={() => copy('ux', `[${ux.title}]\n${ux.body}\n\n${ux.primary} / ${ux.secondary}`)}>
                {copiedKey === 'ux' ? '✓ 복사됨' : '카피 복사'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 길이 테스트 탭 ─── */}
      {tab === 'length' && (
        <div className={styles.panel} role="tabpanel" id="lorem-panel-length" aria-labelledby="lorem-tab-length">
          <div className={styles.card}>
            <label className={styles.cardLabel}>
              길이 샘플
              <span className={styles.cardLabelHint}>5단계 — 카드/모달 디자인용</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {lenSamples.map(s => (
                <div key={s.key} className={styles.lenItem}>
                  <span className={styles.lenLabel}>{s.label}</span>
                  <span className={styles.lenText}>{s.text}</span>
                  <span className={styles.lenSize}>{s.len}자</span>
                  <button type="button"
                    className={`${styles.miniCopyBtn} ${styles.lenCopy} ${copiedKey === 'l-' + s.key ? styles.miniCopied : ''}`}
                    aria-label={`${s.label} 샘플 복사`}
                    onClick={() => copy('l-' + s.key, s.text)}>
                    {copiedKey === 'l-' + s.key ? '✓' : '📋'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              오버플로 테스트
              <span className={styles.cardLabelHint}>truncate / 줄바꿈 / 특수문자 검증용</span>
            </label>
            <div className={styles.previewBoxRow}>
              {OVERFLOW_TESTS.map(t => (
                <div key={t.key} className={`${styles.previewBox} ${styles.previewBoxScroll}`}>
                  <div className={styles.previewBoxLabel}>{t.label}</div>
                  <div>{t.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              truncate 동작 비교
              <span className={styles.cardLabelHint}>1줄 / 2줄 / 3줄 말줄임</span>
            </label>
            <div className={styles.previewBoxRow}>
              <div className={styles.previewBox}>
                <div className={styles.previewBoxLabel}>1줄 truncate</div>
                <div className={styles.truncate1}>{lenSamples[3]?.text}</div>
              </div>
              <div className={styles.previewBox}>
                <div className={styles.previewBoxLabel}>2줄 truncate</div>
                <div className={styles.truncate2}>{lenSamples[3]?.text}</div>
              </div>
              <div className={styles.previewBox}>
                <div className={styles.previewBoxLabel}>3줄 truncate</div>
                <div className={styles.truncate3}>{lenSamples[3]?.text}</div>
              </div>
              <div className={styles.previewBox}>
                <div className={styles.previewBoxLabel}>제한 없음</div>
                <div>{lenSamples[3]?.text}</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
