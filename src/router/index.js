import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import SheetViewer from '../views/viewer/SheetViewer.vue'
import HelpContent from '../views/HelpContent.vue'
import PlaceholderView from '../views/PlaceholderView.vue'

// meta.home: 사이드바 셸 없이 풀페이지로 렌더 / title: 상단 타이틀 / icon: 플레이스홀더 아이콘
const routes = [
  { path: '/', name: 'home', component: Dashboard, meta: { home: true, title: '대시보드' } },
  { path: '/viewer', name: 'viewer', component: SheetViewer, meta: { title: '시트 뷰어' } },
  { path: '/summary', name: 'summary', component: PlaceholderView, meta: { title: '요약 정보', icon: 'monitoring' } },
  { path: '/recent', name: 'recent', component: PlaceholderView, meta: { title: '최근 파일', icon: 'history' } },
  { path: '/stats', name: 'stats', component: PlaceholderView, meta: { title: '통계', icon: 'bar_chart' } },
  { path: '/help', name: 'help', component: HelpContent, meta: { title: '도움말' } },
  { path: '/settings', name: 'settings', component: PlaceholderView, meta: { title: '설정', icon: 'settings' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
