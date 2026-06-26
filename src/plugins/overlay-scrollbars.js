// OverlayScrollbars 전역 플러그인
// ─────────────────────────────────────────────────────────────────────────────
// 목적: 맥(오버레이형)과 윈도우(영역 차지형)의 네이티브 스크롤바 차이를 제거하고,
//       모든 OS·브라우저에서 동일한 오버레이 스크롤바 UI를 표시한다.
// 사용: 스크롤이 필요한 요소에 `v-os` 디렉티브를 붙인다.
//   - 기본:      <div class="list" v-os>
//   - 옵션 지정:  <div class="home" v-os="{ options: { overflow: { x: 'hidden' } } }">
import 'overlayscrollbars/overlayscrollbars.css'
import { OverlayScrollbars } from 'overlayscrollbars'

// 전역 기본 옵션 — 모든 스크롤 영역에 동일하게 적용된다.
const DEFAULT_OPTIONS = {
  scrollbars: {
    theme: 'os-theme-dark', // 밝은 배경 기준 어두운 반투명 핸들
    autoHide: 'leave',      // 커서가 영역을 벗어나면 숨김
    autoHideDelay: 600,
    clickScroll: true,      // 트랙 클릭 시 해당 위치로 점프
  },
}

// 플렉스/그리드 컨테이너를 스크롤 호스트로 쓰면 OverlayScrollbars가 자식 요소를
// 내부 viewport 로 옮기면서 컨테이너 레이아웃(gap·정렬·flex:1 등)이 사라진다.
// → 초기화 직후 호스트의 컨테이너 스타일을 viewport 로 복제해 레이아웃을 보존한다.
const CONTAINER_PROPS = [
  'display', 'flexDirection', 'flexWrap',
  'gap', 'rowGap', 'columnGap',
  'alignItems', 'alignContent', 'justifyContent',
  'gridTemplateColumns', 'gridTemplateRows',
  'gridAutoRows', 'gridAutoColumns', 'gridAutoFlow',
]
const CONTAINER_DISPLAYS = ['flex', 'inline-flex', 'grid', 'inline-grid']

function snapshotContainer(el) {
  const cs = getComputedStyle(el)
  if (!CONTAINER_DISPLAYS.includes(cs.display)) return null
  const snap = {}
  for (const p of CONTAINER_PROPS) snap[p] = cs[p]
  return snap
}

const osDirective = {
  // 자식(스크롤 대상)이 모두 마운트된 뒤 초기화
  mounted(el, binding) {
    const container = snapshotContainer(el)
    const options = { ...DEFAULT_OPTIONS, ...(binding.value?.options || {}) }
    const instance = OverlayScrollbars(el, options, binding.value?.events || {})

    // 플렉스/그리드 호스트라면 컨테이너 스타일을 viewport 로 이관해 레이아웃 보존
    if (container) {
      Object.assign(instance.elements().viewport.style, container)
    }
    el._os = instance
  },
  // 언마운트 시 정리(메모리/옵저버 누수 방지)
  beforeUnmount(el) {
    el._os?.destroy()
    el._os = null
  },
}

export default {
  install(app) {
    app.directive('os', osDirective)
  },
}
