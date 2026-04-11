'use client'

import { useState } from 'react'
import styles from './lorem.module.css'

const KO_SENTENCES = [
  '가나다라마바사아자차카타파하 순서로 배열되는 한글은 세계에서 가장 과학적인 문자 중 하나로 알려져 있습니다.',
  '디자인 작업을 할 때 실제 콘텐츠 대신 더미 텍스트를 사용하면 레이아웃에 집중할 수 있습니다.',
  '웹 개발과 UI 디자인에서 자리 채우기 텍스트는 폰트 크기, 줄 간격, 여백을 확인하는 데 유용합니다.',
  '프로토타입 단계에서 더미 텍스트를 활용하면 클라이언트에게 전체적인 시각적 구조를 보여줄 수 있습니다.',
  '한국어 더미 텍스트는 실제 한글 문장의 자간과 어간을 반영하여 보다 자연스러운 레이아웃 테스트를 가능하게 합니다.',
  '소프트웨어 개발 과정에서 목업 데이터와 더미 텍스트는 빠른 프로토타이핑을 위한 필수 도구입니다.',
  '타이포그래피는 시각 디자인의 핵심 요소로, 적절한 폰트 선택과 텍스트 배치가 사용자 경험에 큰 영향을 미칩니다.',
  '반응형 웹 디자인에서는 다양한 화면 크기에 따라 텍스트가 어떻게 줄 바꿈되는지 미리 확인하는 것이 중요합니다.',
]

const EN_PARAS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
  'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi.',
  'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.',
  'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores.',
]

function generateKo(paragraphs: number) {
  return Array.from({ length: paragraphs }, (_, pi) => {
    const count = 3 + Math.floor(Math.random() * 3)
    return Array.from({ length: count }, (_, si) =>
      KO_SENTENCES[(pi * 3 + si) % KO_SENTENCES.length]
    ).join(' ')
  }).join('\n\n')
}

function generateEn(paragraphs: number) {
  return Array.from({ length: paragraphs }, (_, i) =>
    EN_PARAS[i % EN_PARAS.length]
  ).join('\n\n')
}

export default function LoremClient() {
  const [lang,       setLang]       = useState<'ko' | 'en'>('en')
  const [paragraphs, setParagraphs] = useState('3')
  const [output,     setOutput]     = useState('')
  const [copied,     setCopied]     = useState(false)

  const PARA_PRESETS = [1, 2, 3, 5, 10]

  const handleGenerate = () => {
    const p = Math.min(20, Math.max(1, parseInt(paragraphs) || 3))
    setOutput(lang === 'ko' ? generateKo(p) : generateEn(p))
    setCopied(false)
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.wrap}>

      {/* 언어 선택 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>언어 선택</label>
        <div className={styles.langRow}>
          <button
            className={`${styles.langBtn} ${lang === 'en' ? styles.langActive : ''}`}
            onClick={() => setLang('en')}>
            <span className={styles.langFlag}>🇺🇸</span>
            <div className={styles.langText}>
              <span className={styles.langName}>영문</span>
              <span className={styles.langDesc}>Lorem Ipsum</span>
            </div>
          </button>
          <button
            className={`${styles.langBtn} ${lang === 'ko' ? styles.langActive : ''}`}
            onClick={() => setLang('ko')}>
            <span className={styles.langFlag}>🇰🇷</span>
            <div className={styles.langText}>
              <span className={styles.langName}>한글</span>
              <span className={styles.langDesc}>한글 더미 텍스트</span>
            </div>
          </button>
        </div>
      </div>

      {/* 문단 수 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>문단 수</label>
        <div className={styles.inputRow}>
          <input className={styles.numInput} type="number" inputMode="numeric"
            placeholder="3" value={paragraphs}
            onChange={e => setParagraphs(e.target.value)} min={1} max={20} />
          <span className={styles.unit}>문단</span>
        </div>
        <div className={styles.presets}>
          {PARA_PRESETS.map(p => (
            <button key={p}
              className={`${styles.presetBtn} ${paragraphs === String(p) ? styles.presetActive : ''}`}
              onClick={() => setParagraphs(String(p))}>
              {p}문단
            </button>
          ))}
        </div>
      </div>

      {/* 생성 버튼 */}
      <button className={styles.generateBtn} onClick={handleGenerate}>
        ✨ 텍스트 생성
      </button>

      {/* 결과 */}
      {output && (
        <div className={styles.outputCard}>
          <div className={styles.outputHeader}>
            <span className={styles.cardLabel}>생성된 텍스트</span>
            <button
              className={`${styles.copyBtn} ${copied ? styles.copiedBtn : ''}`}
              onClick={handleCopy}>
              {copied ? '✓ 복사됨' : '📋 복사'}
            </button>
          </div>
          <textarea
            className={styles.outputTextarea}
            value={output}
            readOnly
            rows={Math.min(20, (parseInt(paragraphs) || 3) * 4 + 2)}
          />
        </div>
      )}
    </div>
  )
}