'use client'

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './ogPreview.module.css'
import {
  normalizeTags, parseHtmlInput, validate, domainOf, absoluteUrl,
  generateHeadTags, SAMPLE_HTML,
  type MetaData,
} from './ogPreviewData'

type Mode = 'url' | 'html'
const STORAGE_KEY = 'youtil_og_preview_v1'
const PLACEHOLDER = 'https://placehold.co/1200x630/1A1A1A/666?text=No+og%3Aimage'

export default function OgPreviewClient() {
  const [mode, setMode] = useState<Mode>('url')
  const [urlInput, setUrlInput] = useState('')
  const [htmlInput, setHtmlInput] = useState('')
  const [rawTags, setRawTags] = useState<Record<string, string>>({})
  const [fetchedUrl, setFetchedUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const j = JSON.parse(raw)
        if (j.mode) setMode(j.mode)
        if (typeof j.urlInput === 'string') setUrlInput(j.urlInput)
        if (typeof j.htmlInput === 'string') setHtmlInput(j.htmlInput)
      }
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, urlInput, htmlInput })) } catch {}
  }, [mode, urlInput, htmlInput])

  // HTML 모드: 입력 변경 시 즉시 파싱
  useEffect(() => {
    if (mode !== 'html') return
    setRawTags(parseHtmlInput(htmlInput))
    setError('')
    setFetchedUrl('')
  }, [mode, htmlInput])

  const meta: MetaData = useMemo(() => normalizeTags(rawTags), [rawTags])
  const issues = useMemo(() => validate(meta), [meta])

  const baseForImage = meta.url || fetchedUrl || urlInput
  const imageUrl = meta.image ? absoluteUrl(meta.image, baseForImage) : ''
  const twitterImageUrl = meta.twitterImage ? absoluteUrl(meta.twitterImage, baseForImage) : imageUrl

  const handleFetch = async () => {
    if (!urlInput.trim()) { setError('URL을 입력해 주세요.'); return }
    setLoading(true); setError(''); setRawTags({}); setFetchedUrl('')
    try {
      const res = await fetch(`/api/og-preview?url=${encodeURIComponent(urlInput.trim())}`)
      const j = await res.json() as { ok: boolean; tags?: Record<string, string>; fetchedUrl?: string; error?: string }
      if (!j.ok) { setError(j.error ?? '알 수 없는 오류'); return }
      setRawTags(j.tags ?? {})
      setFetchedUrl(j.fetchedUrl ?? '')
    } catch {
      setError('네트워크 오류 — 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleSample = () => {
    setMode('html')
    setHtmlInput(SAMPLE_HTML)
  }

  const generatedCode = useMemo(() => generateHeadTags(meta), [meta])

  const copyCode = () => {
    if (!generatedCode) return
    navigator.clipboard.writeText(generatedCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const hasData = meta.title || meta.description || meta.image
  const domain = domainOf(meta.url || fetchedUrl || urlInput)

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/dev/json', label: 'JSON 포맷터' },
          { href: '/tools/dev/url-encode', label: 'URL 인코더' },
          { href: '/tools/dev/token-counter', label: 'AI 토큰 카운터' },
        ]}
      >
        미리보기는 실제 카드에 가깝게 시뮬레이션한 결과이며, 각 플랫폼의 알고리즘·캐시 정책에 따라 다르게 표시될 수 있습니다. 카카오톡은 한번 캐시되면 약 48시간 유지되므로 변경 후 <strong>카카오톡 캐시 초기화 도구</strong>에서 새로고침 권장.
      </Disclaimer>

      {/* 모드 토글 */}
      <div className={s.card}>
        <div className={s.modeRow}>
          <button
            type="button"
            className={`${s.modeBtn} ${mode === 'url' ? s.modeBtnActive : ''}`}
            onClick={() => setMode('url')}
          >🔗 URL 입력</button>
          <button
            type="button"
            className={`${s.modeBtn} ${mode === 'html' ? s.modeBtnActive : ''}`}
            onClick={() => setMode('html')}
          >📝 HTML 붙여넣기</button>
          <button type="button" className={s.sampleBtn} onClick={handleSample}>샘플 불러오기</button>
        </div>

        {mode === 'url' ? (
          <>
            <div className={s.urlRow}>
              <input
                type="url"
                placeholder="https://example.com/article"
                className={s.urlInput}
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleFetch() }}
              />
              <button type="button" className={s.fetchBtn} onClick={handleFetch} disabled={loading}>
                {loading ? '불러오는 중…' : '미리보기'}
              </button>
            </div>
            <p className={s.note}>
              ⓘ 서버를 통해 페이지를 받아와 메타태그를 추출합니다. 일부 사이트는 봇 차단으로 실패할 수 있으니, 그럴 땐 <strong>HTML 붙여넣기</strong> 모드를 사용하세요.
            </p>
            {error && <div className={s.errBox}>⚠️ {error}</div>}
          </>
        ) : (
          <>
            <textarea
              className={s.htmlInput}
              placeholder='<head>의 일부 또는 전체를 붙여넣으세요. 예: <meta property="og:title" content="..." />'
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              rows={8}
              spellCheck={false}
            />
            <p className={s.note}>ⓘ 브라우저에서 <code className={s.kbd}>Cmd+U</code> / <code className={s.kbd}>Ctrl+U</code>로 페이지 소스를 본 뒤 <code className={s.kbd}>&lt;head&gt;</code> 영역을 복사해 붙여넣으세요.</p>
          </>
        )}
      </div>

      {hasData && (
        <>
          {/* 검증 결과 */}
          <div className={s.card}>
            <span className={s.cardLabel}>메타태그 검증</span>
            <div className={s.issueList}>
              {issues.map((iss, i) => (
                <div key={i} className={`${s.issue} ${s['issue_' + iss.severity]}`}>
                  <span className={s.issueIcon}>
                    {iss.severity === 'ok' ? '✓' : iss.severity === 'error' ? '✕' : iss.severity === 'warn' ? '!' : 'ⓘ'}
                  </span>
                  <code className={s.issueField}>{iss.field}</code>
                  <span className={s.issueMsg}>{iss.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 플랫폼 미리보기 */}
          <div className={s.card}>
            <span className={s.cardLabel}>플랫폼별 미리보기</span>
            <div className={s.previewGrid}>
              <KakaoPreview meta={meta} image={imageUrl} domain={domain} />
              <FacebookPreview meta={meta} image={imageUrl} domain={domain} />
              <TwitterPreview meta={meta} image={twitterImageUrl} domain={domain} />
              <LinkedInPreview meta={meta} image={imageUrl} domain={domain} />
              <SlackPreview meta={meta} image={imageUrl} domain={domain} />
            </div>
          </div>

          {/* 코드 생성 */}
          <div className={s.card}>
            <div className={s.cardHead}>
              <span className={s.cardLabel}>완성된 메타태그 코드</span>
              <button className={`${s.copyBtn} ${copied ? s.copyBtnDone : ''}`} onClick={copyCode}>
                {copied ? '✓ 복사됨' : '📋 복사'}
              </button>
            </div>
            <pre className={s.code}>{generatedCode}</pre>
            <p className={s.note}>
              ⓘ 위 코드를 사이트 <code className={s.kbd}>&lt;head&gt;</code> 안에 붙여넣으세요. 카카오톡 캐시 초기화: <a href="https://developers.kakao.com/tool/clear/og" target="_blank" rel="noopener noreferrer" className={s.link}>developers.kakao.com/tool/clear/og</a>
            </p>
          </div>
        </>
      )}

      {!hasData && (
        <div className={s.empty}>
          <p className={s.emptyTitle}>📋 위 입력칸에 URL이나 HTML을 넣으면 5개 플랫폼 미리보기가 표시됩니다</p>
          <p>지원: 🇰🇷 카카오톡 · Facebook · X(Twitter) · LinkedIn · Slack</p>
        </div>
      )}
    </div>
  )
}

/* ─── 플랫폼별 카드 미리보기 ────────────────────────────── */
function KakaoPreview({ meta, image, domain }: { meta: MetaData; image: string; domain: string }) {
  return (
    <div className={s.previewBlock}>
      <p className={s.previewHead}>🇰🇷 카카오톡 (가로형)</p>
      <div className={s.kakaoWrap}>
        <div className={s.kakaoCard}>
          {image ? (
            <img src={image} alt="" className={s.kakaoImg} onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER }} />
          ) : (
            <div className={s.kakaoImgPlaceholder}>이미지 없음</div>
          )}
          <div className={s.kakaoBody}>
            <div className={s.kakaoTitle}>{meta.title || '제목 없음'}</div>
            <div className={s.kakaoDesc}>{meta.description || '설명 없음'}</div>
            <div className={s.kakaoDomain}>{domain || '도메인'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FacebookPreview({ meta, image, domain }: { meta: MetaData; image: string; domain: string }) {
  return (
    <div className={s.previewBlock}>
      <p className={s.previewHead}>Facebook</p>
      <div className={s.fbCard}>
        {image ? (
          <img src={image} alt="" className={s.fbImg} onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER }} />
        ) : (
          <div className={s.fbImgPlaceholder}>이미지 없음</div>
        )}
        <div className={s.fbBody}>
          <div className={s.fbDomain}>{(domain || 'example.com').toUpperCase()}</div>
          <div className={s.fbTitle}>{meta.title || '제목 없음'}</div>
          <div className={s.fbDesc}>{meta.description || '설명 없음'}</div>
        </div>
      </div>
    </div>
  )
}

function TwitterPreview({ meta, image, domain }: { meta: MetaData; image: string; domain: string }) {
  const isLarge = (meta.twitterCard || 'summary_large_image') === 'summary_large_image'
  return (
    <div className={s.previewBlock}>
      <p className={s.previewHead}>X (Twitter) · <small>{meta.twitterCard || 'summary_large_image'}</small></p>
      {isLarge ? (
        <div className={s.twCardLarge}>
          {image ? (
            <img src={image} alt="" className={s.twImgLarge} onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER }} />
          ) : (
            <div className={s.fbImgPlaceholder}>이미지 없음</div>
          )}
          <div className={s.twBody}>
            <div className={s.twDomain}>{domain || 'example.com'}</div>
            <div className={s.twTitle}>{meta.twitterTitle || meta.title || '제목 없음'}</div>
            <div className={s.twDesc}>{meta.twitterDescription || meta.description || ''}</div>
          </div>
        </div>
      ) : (
        <div className={s.twCardSmall}>
          {image ? (
            <img src={image} alt="" className={s.twImgSmall} onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER }} />
          ) : (
            <div className={s.twImgSmallPlaceholder}>×</div>
          )}
          <div className={s.twBody}>
            <div className={s.twDomain}>{domain || 'example.com'}</div>
            <div className={s.twTitle}>{meta.twitterTitle || meta.title || '제목 없음'}</div>
            <div className={s.twDesc}>{meta.twitterDescription || meta.description || ''}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function LinkedInPreview({ meta, image, domain }: { meta: MetaData; image: string; domain: string }) {
  return (
    <div className={s.previewBlock}>
      <p className={s.previewHead}>LinkedIn</p>
      <div className={s.liCard}>
        {image ? (
          <img src={image} alt="" className={s.liImg} onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER }} />
        ) : (
          <div className={s.fbImgPlaceholder}>이미지 없음</div>
        )}
        <div className={s.liBody}>
          <div className={s.liTitle}>{meta.title || '제목 없음'}</div>
          <div className={s.liDomain}>{domain || 'example.com'}</div>
        </div>
      </div>
    </div>
  )
}

function SlackPreview({ meta, image, domain }: { meta: MetaData; image: string; domain: string }) {
  return (
    <div className={s.previewBlock}>
      <p className={s.previewHead}>Slack</p>
      <div className={s.slackCard}>
        <div className={s.slackBar} />
        <div className={s.slackContent}>
          <div className={s.slackSite}>{meta.siteName || domain || 'example.com'}</div>
          <div className={s.slackTitle}>{meta.title || '제목 없음'}</div>
          <div className={s.slackDesc}>{meta.description || ''}</div>
          {image && (
            <img src={image} alt="" className={s.slackImg} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
        </div>
      </div>
    </div>
  )
}
