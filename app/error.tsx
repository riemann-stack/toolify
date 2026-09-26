'use client'

/* app/error.tsx — 세그먼트 에러 바운더리 (Trust Ledger 상태 화면)
   도구 하나의 런타임 예외가 사이트 전체 백화면이 되는 것을 막는다. Nav·Footer는 루트 레이아웃이 유지하고 본문만 이 화면으로 바뀐다.
   ─ 광고 없음: <AdFreeScreen />이 마운트된 동안 AutoAds·AdSlot이 광고를 만들지 않는다(오류 화면 광고 금지 — adsense §3.4).
     경로가 정상 도구 경로 그대로라 lib/ads 경로 판정만으로는 못 막기 때문.
   ─ 다시 시도: Next 16.2의 unstable_retry(세그먼트를 다시 가져와 렌더)가 있으면 그것을, 없으면 reset. */
import Link from 'next/link'
import { AdFreeScreen } from '@/components/AutoAds'
import UiIcon from '@/components/UiIcon'
import s from './_trust/trust.module.css'

export default function RouteError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  reset: () => void
  unstable_retry?: () => void
}) {
  const retry = () => (unstable_retry ?? reset)()
  return (
    <div className={s.state}>
      <AdFreeScreen />
      <div role="alert">
        <p className={s.stateCode}><UiIcon name="alert" size={16} />일시적인 오류</p>
        <h1 className={s.stateTitle}>화면을 불러오지 못했습니다</h1>
      </div>
      <p className={s.stateLead}>
        이 페이지를 그리는 중에 문제가 생겼습니다. 일시적인 문제라면 다시 시도해 해결될 수 있습니다. 반복되면{' '}
        <a href={`mailto:contact@youtil.kr?subject=${encodeURIComponent('[오류] 화면 오류')}`}>contact@youtil.kr</a>로
        페이지 주소{error.digest ? '와 아래 오류 코드' : ''}를 알려 주세요.
      </p>
      {error.digest && (
        <p className={s.stateDigest}>오류 코드 <code>{error.digest}</code></p>
      )}
      <div className={s.actions}>
        <button type="button" className="ui-btn ui-btn-primary" onClick={retry}>
          <UiIcon name="refresh" size={18} />다시 시도
        </button>
        <Link className="ui-btn ui-btn-outline" href="/">홈으로</Link>
        <Link className="ui-btn ui-btn-outline" href="/tools">전체 도구</Link>
      </div>
    </div>
  )
}
