<template>
  <div class="page">
    <!-- 홈: 사이드바 없는 풀페이지 대시보드 -->
    <Dashboard
      v-if="activeMenu === 'home'"
      :menus="MENUS"
      :user-name="userName"
      :user-email="userEmail"
      :avatar-initial="avatarInitial"
      @navigate="activeMenu = $event"
      @help="helpOpen = true"
    />

    <!-- 그 외 화면: 사이드바 셸 -->
    <!-- 그 외 화면: 사이드바 셸 (홈에서 진입 시에만 페이드인) -->
    <Transition name="fade">
      <div v-if="activeMenu !== 'home'" class="app" :class="{ 'nav-open': navOpen }">
      <Sidebar
        :groups="sidebarGroups"
        v-model:active-menu="activeMenu"
        @home="goHome"
        @close="reset"
      />

      <!-- 모바일: 사이드바 드로어 백드롭 -->
      <div class="nav-backdrop" @click="navOpen = false"></div>

      <!-- 메인 영역 -->
      <main class="main">
        <header class="topbar">
          <button type="button" class="nav-toggle" aria-label="메뉴 열기" @click="navOpen = true">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <h1 class="page-title">{{ pageTitle }}</h1>
          <div class="topbar-actions">
            <NotificationBell trigger-class="icon-btn" @navigate="activeMenu = $event" />
            <button class="icon-btn" @click="helpOpen = true">
              <span class="material-symbols-outlined">help</span>
              <span class="hicon-tip">도움말</span>
            </button>
            <div class="profile">
              <div class="avatar">{{ avatarInitial }}</div>
              <div class="profile-meta">
                <div class="profile-name">{{ userName }}</div>
                <div class="profile-mail">{{ userEmail }}</div>
              </div>
            </div>
          </div>
        </header>

        <!-- 시트 뷰어인데 파일 없음 -->
        <div v-if="activeMenu === VIEWER_ID && !sheets.length" class="drop-area">
          <div class="sub">엑셀 파일을 올리면 내용과 셀 색상을 화면에 표로 보여줍니다. (브라우저에서만 처리 · 업로드 없음)</div>
          <FileDrop @file="onFile" />
          <div v-if="error" class="err"><span class="material-symbols-outlined">warning</span> {{ error }}</div>
        </div>

        <!-- 시트 뷰어 -->
        <template v-else-if="activeMenu === VIEWER_ID">
          <!-- 시트 탭 + 시트 이름 필터 -->
          <div class="sheet-picker" v-if="sheets.length > 1">
            <div class="search sheet-filter">
              <span class="material-symbols-outlined">search</span>
              <input type="text" v-model="sheetFilter" placeholder="시트 이름으로 필터..." />
            </div>
            <div class="tabs">
              <button
                v-for="s in filteredSheets"
                :key="s.index"
                type="button"
                class="tab"
                :class="{ active: s.index === active }"
                @click="active = s.index"
              >
                {{ s.name }}
              </button>
              <span v-if="!filteredSheets.length" class="no-match">일치하는 시트가 없습니다.</span>
            </div>
          </div>

          <div class="filterbar">
            <div class="search">
              <span class="material-symbols-outlined">search</span>
              <input type="text" v-model="rowSearch" placeholder="셀 내용으로 검색..." />
            </div>

            <div class="filterbar-right">
              <span class="chip" v-if="activeSheet">{{ activeSheet.rows.length.toLocaleString() }}행</span>
              <Checkbox v-model="headerRow" label="머리글" />
              <Button variant="dark" icon="folder_open" @click="pickFile">다른 파일 선택</Button>
            </div>
          </div>

          <div class="viewer-grid">
            <SheetGrid
              v-if="activeSheet"
              :rows="activeSheet.rows"
              :header-row="headerRow"
              :search="rowSearch"
              :selected="selectedCell ? { ri: selectedCell.ri, ci: selectedCell.ci } : null"
              @select-cell="selectedCell = $event"
            />

            <DetailPanel
              :cell="selectedCell"
              :sheet-name="activeSheet?.name"
              :file-name="fileName"
              :row-count="activeSheet?.rows.length || 0"
              :col-count="colCount"
              @clear="selectedCell = null"
            />
          </div>
        </template>

        <!-- 주문 내역 (테이블 + 상세 패널) -->
        <OrdersView v-else-if="activeMenu === 'ord-list'" />

        <!-- 수정 이력 로그 (테이블) -->
        <ChangeLogView v-else-if="activeMenu === 'sys-log'" />

        <!-- 그 외 메뉴: 준비 중 -->
        <div v-else class="placeholder">
          <span class="material-symbols-outlined">{{ activeMenuIcon }}</span>
          <div class="placeholder-title">{{ activeMenuLabel }}</div>
          <div class="placeholder-sub">준비 중인 메뉴입니다.</div>
        </div>
      </main>
      </div>
    </Transition>

    <!-- 다른 파일 선택용 숨김 입력 -->
    <input
      ref="fileInput"
      type="file"
      accept=".xlsx,.xls,.csv"
      hidden
      @change="onPick"
    />

    <!-- 도움말 팝업 (공통 Modal) -->
    <Modal v-model="helpOpen" title="도움말" width="640px">
      <HelpContent />
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { parseWorkbook } from './excel.js'
import { MENUS, SIDEBAR_GROUPS, VIEWER_ID, findMenu } from './menus.js'
import FileDrop from './components/ui/FileDrop.vue'
import Checkbox from './components/ui/Checkbox.vue'
import Button from './components/ui/Button.vue'
import Sidebar from './components/layout/Sidebar.vue'
import Dashboard from './views/dashboard/Dashboard.vue'
import OrdersView from './views/orders/OrdersView.vue'
import ChangeLogView from './views/system/ChangeLogView.vue'
import HelpContent from './views/help/HelpContent.vue'
import Modal from './components/overlay/Modal.vue'
import NotificationBell from './components/overlay/NotificationBell.vue'
import SheetGrid from './views/viewer/SheetGrid.vue'
import DetailPanel from './views/viewer/DetailPanel.vue'

// 서브페이지 LNB(사이드바) 그룹 — menus.js 단일 소스에서 파생 (메인 메뉴와 항상 동일)
const sidebarGroups = SIDEBAR_GROUPS

// 도움말 팝업
const helpOpen = ref(false)

function menuFromHash() {
  const id = window.location.hash.replace(/^#\/?/, '')
  if (!id) return 'home'
  return MENUS.some((m) => m.id === id) || id === 'settings' ? id : 'home'
}

const fileName = ref('')
const sheets = ref([])
const active = ref(0)
const activeMenu = ref(menuFromHash())
const error = ref('')
const headerRow = ref(true)
const rowSearch = ref('')
const sheetFilter = ref('')
const selectedCell = ref(null)
const fileInput = ref(null)
const navOpen = ref(false) // 모바일 사이드바 드로어 열림 상태

const userEmail = 'leehx78@gmail.com'
const userName = computed(() => userEmail.split('@')[0])
const avatarInitial = computed(() => userName.value.charAt(0).toUpperCase())

const activeSheet = computed(() => sheets.value[active.value] || null)

const filteredSheets = computed(() => {
  const q = sheetFilter.value.trim().toLowerCase()
  return sheets.value
    .map((s, index) => ({ name: s.name, index }))
    .filter((s) => !q || s.name.toLowerCase().includes(q))
})

const colCount = computed(() =>
  activeSheet.value ? activeSheet.value.rows.reduce((m, r) => Math.max(m, r.length), 0) : 0
)
const activeMenuItem = computed(() => findMenu(activeMenu.value))
const activeMenuLabel = computed(() => activeMenuItem.value?.label ?? '')
const activeMenuIcon = computed(() => activeMenuItem.value?.icon ?? 'widgets')
const pageTitle = computed(() => (activeMenu.value === 'home' ? '대시보드' : activeMenuLabel.value))

function goHome() {
  activeMenu.value = 'home'
  selectedCell.value = null
}

function openSheet(i) {
  active.value = i
  activeMenu.value = VIEWER_ID
}

watch(active, () => {
  rowSearch.value = ''
  selectedCell.value = null
})

watch(activeMenu, (id) => {
  navOpen.value = false // 메뉴 이동 시 모바일 드로어 닫기
  const target = id === 'home' ? '#/' : `#/${id}`
  if (window.location.hash !== target) window.location.hash = target
})
function onHashChange() {
  const id = menuFromHash()
  if (id !== activeMenu.value) activeMenu.value = id
}
onMounted(() => {
  if (!window.location.hash) window.location.hash = activeMenu.value === 'home' ? '#/' : `#/${activeMenu.value}`
  window.addEventListener('hashchange', onHashChange)
})
onBeforeUnmount(() => window.removeEventListener('hashchange', onHashChange))

function pickFile() {
  fileInput.value?.click()
}

function onPick(e) {
  const f = e.target.files?.[0]
  if (f) onFile(f)
  e.target.value = ''
}

async function onFile(file) {
  error.value = ''
  sheets.value = []
  rowSearch.value = ''
  sheetFilter.value = ''
  selectedCell.value = null
  activeMenu.value = VIEWER_ID
  fileName.value = file.name
  try {
    sheets.value = await parseWorkbook(file)
    active.value = 0
    if (sheets.value.length === 0) error.value = '읽을 수 있는 시트가 없습니다.'
  } catch (e) {
    error.value = '파일을 읽지 못했습니다: ' + (e.message || e)
    fileName.value = ''
  }
}

function reset() {
  fileName.value = ''
  sheets.value = []
  error.value = ''
  rowSearch.value = ''
  sheetFilter.value = ''
  selectedCell.value = null
  activeMenu.value = 'home'
}
</script>
