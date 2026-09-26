/* app/contact/page.tsx (server) — 문의·오류 제보 (Trust Ledger 텍스트 페이지)
   운영자 표기 = SITE_OPERATOR(리만, 1인 운영) — about·푸터·JSON-LD와 같은 값. 응답 시간 문구는 푸터·SourceNotes와 같게('평일 기준 1~3일'). */
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { SITE_OPERATOR } from '@/components/SiteJsonLd'
import UiIcon from '@/components/UiIcon'
import Callout from '@/components/Callout'
import TrustPage, { OperatorCard } from '../_trust/TrustPage'
import s from '../_trust/trust.module.css'

export const metadata = buildMetadata({
  path: '/contact',
  title: '문의·오류 제보',
  description: 'Youtil 운영자 리만에게 계산 오류 제보, 데이터·내용 정정, 새 도구 제안, 광고·제휴 문의를 이메일(contact@youtil.kr)로 보낼 수 있습니다. 평일 기준 1~3일 안에 답장합니다.',
})

const EMAIL = SITE_OPERATOR.email
const mailto = (tag: string) => `mailto:${EMAIL}?subject=${encodeURIComponent(`[${tag}] `)}`

const KINDS: { tag: string; icon: string; title: string; desc: string; hint: string }[] = [
  { tag: '오류', icon: 'alert', title: '계산 오류 제보', desc: '결과가 이상하거나, 화면이 깨지거나, 버튼이 동작하지 않을 때.', hint: '도구 주소, 입력한 값, 기대한 결과와 실제 결과, 사용 중인 기기·브라우저를 적어 주시면 재현이 빠릅니다.' },
  { tag: '정정', icon: 'file', title: '데이터·내용 정정', desc: '수치가 틀렸거나, 법령·요율 개정이 반영되지 않았거나, 설명이 부정확할 때.', hint: '근거 자료(법령 조문, 기관 발표, 논문)의 주소를 함께 보내 주시면 검토가 빠릅니다.' },
  { tag: '제안', icon: 'bulb', title: '새 도구·기능 제안', desc: '있으면 좋을 계산기나 기능이 있을 때.', hint: '어떤 상황에서 어떻게 쓰고 싶은지 한두 줄로 적어 주시면 큰 도움이 됩니다.' },
  { tag: '제휴', icon: 'briefcase', title: '광고·제휴 문의', desc: '협업·광고·콘텐츠 제휴 같은 비즈니스 문의.', hint: '회사명·담당자·제안 내용을 정리해 보내 주세요. 제휴·협찬 표시 기준은 광고 게재 원칙에 적어 두었습니다.' },
]

export default function ContactPage() {
  return (
    <TrustPage
      path="/contact"
      eyebrow="문의"
      icon="mail"
      title="문의·오류 제보"
      lead={<>Youtil은 {SITE_OPERATOR.name} 혼자 운영합니다. 계산 결과가 이상하거나, 법령 개정이 반영되지 않았거나, 필요한 도구가 있다면 메일로 알려 주세요. <strong>가장 빠른 연락 수단은 이메일</strong>입니다.</>}
    >
      <div className={s.mail}>
        <span className={s.mailL}><UiIcon name="mail" size={16} />이메일</span>
        <a className={s.mailAddr} href={mailto('Youtil 문의')}>{EMAIL}</a>
        <p className={s.mailHint}>
          <b>평일 기준 1~3일 안에 답장합니다.</b> 메일 제목 앞에 <b>[오류]</b>·<b>[정정]</b>·<b>[제안]</b>·<b>[제휴]</b>처럼 분류를 붙여 주시면 더 빨리 확인할 수 있습니다.
        </p>
        <div className={s.actions}>
          <a className="ui-btn ui-btn-primary" href={mailto('오류')}><UiIcon name="mail" size={18} />오류 제보 메일 쓰기</a>
          <a className="ui-btn ui-btn-outline" href={mailto('Youtil 문의')}>일반 문의 메일 쓰기</a>
        </div>
      </div>

      <h2 id="kinds">무엇을 보내면 좋을까요</h2>
      <p>어떤 문의든 위 주소 하나로 받습니다. 아래 내용을 함께 적어 주시면 주고받는 횟수를 줄일 수 있습니다.</p>
      <ul className={s.items}>
        {KINDS.map(k => (
          <li key={k.tag}>
            <span className={s.itemHead}><UiIcon name={k.icon} size={18} />{k.title}</span>
            <p>{k.desc}</p>
            <small>{k.hint}</small>
          </li>
        ))}
      </ul>

      <h2 id="flow">제보를 받으면</h2>
      <ol className={s.steps}>
        <li><b>재현하고 대조합니다</b><span>보내 주신 조건으로 계산을 다시 해 보고, 공식 자료나 공식 모의계산기와 비교합니다.</span></li>
        <li><b>틀렸다면 고칩니다</b><span>계산 로직을 고친 경우에는 경계값을 다시 검산한 뒤 배포합니다.</span></li>
        <li><b>기록을 남깁니다</b><span>결과나 설명이 달라지는 정정은 <Link href="/updates">업데이트 기록</Link>에 남깁니다.</span></li>
        <li><b>답장합니다</b><span>확인 결과를 메일로 알려 드립니다. 틀리지 않은 경우에도 왜 그렇게 계산되는지 설명해 드립니다.</span></li>
      </ol>

      <h2 id="operator">운영자 정보</h2>
      <OperatorCard sub="도구 제작·자료 확인·문의 응답을 직접 하는 1인 운영자입니다." link />
      <dl className={s.facts}>
        <dt>사이트</dt><dd>Youtil · youtil.kr</dd>
        <dt>운영자</dt><dd>{SITE_OPERATOR.name} (필명) · 1인 운영</dd>
        <dt>운영 형태</dt><dd>개인이 운영하는 무료 웹서비스<small>운영비는 Google AdSense 광고 수익으로 충당하는 구조입니다 · <Link href="/ads-policy">광고 게재 원칙</Link></small></dd>
        <dt>운영 시작</dt><dd>2026년 4월</dd>
        <dt>응답 시간</dt><dd>평일 기준 1~3일</dd>
        <dt>연락 수단</dt><dd><a href={mailto('Youtil 문의')}>{EMAIL}</a><small>현재 연락 수단은 이메일 하나입니다. 개인정보 관련 요청은 <Link href="/privacy">개인정보처리방침</Link>의 보호책임자 항목을 참고해 주세요.</small></dd>
      </dl>

      <Callout tone="note" title="보내기 전에">
        메일에 주민등록번호·계좌번호·연락처 같은 개인정보는 적지 마세요. 계산에 쓴 값도 필요한 만큼만 적어 주시면 됩니다.
        Youtil의 결과는 일반 정보 제공을 위한 추정치이며, 의료·법률·세무·금융 판단은 해당 전문가와 기관에 확인하세요(<Link href="/terms">이용약관</Link>·<Link href="/disclaimer">면책조항</Link>).
      </Callout>
    </TrustPage>
  )
}
