/* app/collections/_guides — 상황별 가이드 본문 (slug → 본문). 밑줄 폴더라 라우트가 아니다.
   각 본문: 왜 이 순서인가 → 단계별로 확인할 숫자(표, 도구와 같은 lib·util로 빌드 시 계산) → 자주 하는 실수 → 전문가·기관 확인 → 참고 자료.
   법정·공식 수치는 lib 값을 보간한다(손으로 치지 않기). 도구 페이지 가이드 문단을 옮겨 오지 않는다. */
import type { CollectionGuide } from './shared'
import overseasTravel from './overseas-travel'
import homeBuying from './home-buying'
import familyHoliday from './family-holiday'
import ticketing from './ticketing'
import officeParty from './office-party'
import yearEnd from './year-end'
import workoutRoutine from './workout-routine'
import diet from './diet'
import soloLiving from './solo-living'
import photography from './photography'
import camping from './camping'
import overseasShopping from './overseas-shopping'
import carOwnership from './car-ownership'
import businessOwner from './business-owner'
import investing from './investing'
import examPrep from './exam-prep'
import newBaby from './new-baby'
import winterCooking from './winter-cooking'
import homeBaking from './home-baking'
import golf from './golf'
import musicMaking from './music-making'
import contentCreator from './content-creator'
import diyRepair from './diy-repair'
import developerToolkit from './developer-toolkit'

export const COLLECTION_GUIDES: Readonly<Record<string, CollectionGuide>> = {
  'overseas-travel': overseasTravel,
  'home-buying': homeBuying,
  'family-holiday': familyHoliday,
  ticketing,
  'office-party': officeParty,
  'year-end': yearEnd,
  'workout-routine': workoutRoutine,
  diet,
  'solo-living': soloLiving,
  photography,
  camping,
  'overseas-shopping': overseasShopping,
  'car-ownership': carOwnership,
  'business-owner': businessOwner,
  investing,
  'exam-prep': examPrep,
  'new-baby': newBaby,
  'winter-cooking': winterCooking,
  'home-baking': homeBaking,
  golf,
  'music-making': musicMaking,
  'content-creator': contentCreator,
  'diy-repair': diyRepair,
  'developer-toolkit': developerToolkit,
}
