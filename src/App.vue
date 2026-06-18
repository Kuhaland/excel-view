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
    />

    <!-- 그 외 화면: 사이드바 셸 -->
    <!-- 그 외 화면: 사이드바 셸 (홈에서 진입 시에만 페이드인) -->
    <Transition name="fade">
      <div v-if="activeMenu !== 'home'" class="app">
      <Sidebar
        :groups="sidebarGroups"
        v-model:active-menu="activeMenu"
        @home="goHome"
        @close="reset"
      />

      <!-- 메인 영역 -->
      <main class="main">
        <header class="topbar">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <div class="topbar-actions">
            <button
              v-for="m in topRightMenus"
              :key="m.id"
              class="icon-btn"
              :class="{ active: activeMenu === m.id }"
              @click="activeMenu = m.id"
            >
              <span class="material-symbols-outlined">{{ m.icon }}</span>
              <span class="hicon-tip">{{ m.label }}</span>
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
        <div v-if="activeMenu === 'viewer' && !sheets.length" class="drop-area">
          <div class="sub">엑셀 파일을 올리면 내용과 셀 색상을 화면에 표로 보여줍니다. (브라우저에서만 처리 · 업로드 없음)</div>
          <FileDrop @file="onFile" />
          <div v-if="error" class="err"><span class="material-symbols-outlined">warning</span> {{ error }}</div>
        </div>

        <!-- 시트 뷰어 -->
        <template v-else-if="activeMenu === 'viewer'">
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
              <Checkbox v-model="headerRow">머리글</Checkbox>
              <button class="btn-file" @click="pickFile">
                <span class="material-symbols-outlined">folder_open</span> 다른 파일 선택
              </button>
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

        <!-- 도움말 -->
        <HelpContent v-else-if="activeMenu === 'help'" />

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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { parseWorkbook } from './excel.js'
import { MENU_GROUPS, MENUS } from './menus.js'
import FileDrop from './components/FileDrop.vue'
import Checkbox from './components/Checkbox.vue'
import Sidebar from './components/layout/Sidebar.vue'
import Dashboard from './views/Dashboard.vue'
import HelpContent from './views/HelpContent.vue'
import SheetGrid from './views/viewer/SheetGrid.vue'
import DetailPanel from './views/viewer/DetailPanel.vue'

// 도움말·설정은 LNB에서 빼고 상단 우측으로
const RIGHT_IDS = ['help', 'settings']
const sidebarGroups = MENU_GROUPS
  .map((g) => ({ ...g, items: g.items.filter((i) => !RIGHT_IDS.includes(i.id)) }))
  .filter((g) => g.items.length)
const topRightMenus = RIGHT_IDS.map((id) => MENUS.find((m) => m.id === id)).filter(Boolean)

const fileName = ref('')
const sheets = ref([])
const active = ref(0)
const activeMenu = ref('home')
const error = ref('')
const headerRow = ref(true)
const rowSearch = ref('')
const sheetFilter = ref('')
const selectedCell = ref(null)
const fileInput = ref(null)

const userEmail = 'leehx78@smartscore.kr'
const userName = computed(() => userEmail.split('@')[0])
const avatarInitial = computed(() => userName.value.charAt(0).toUpperCase())

const activeSheet = computed(() => sheets.value[active.value] || null)

// 시트 이름 필터에 일치하는 시트만 추리되 원래 인덱스는 유지
const filteredSheets = computed(() => {
  const q = sheetFilter.value.trim().toLowerCase()
  return sheets.value
    .map((s, index) => ({ name: s.name, index }))
    .filter((s) => !q || s.name.toLowerCase().includes(q))
})

const colCount = computed(() =>
  activeSheet.value ? activeSheet.value.rows.reduce((m, r) => Math.max(m, r.length), 0) : 0
)
const activeMenuItem = computed(() => MENUS.find((m) => m.id === activeMenu.value) || MENUS[0])
const activeMenuLabel = computed(() => activeMenuItem.value?.label ?? '')
const activeMenuIcon = computed(() => activeMenuItem.value?.icon ?? 'widgets')
const pageTitle = computed(() => (activeMenu.value === 'home' ? '대시보드' : activeMenuLabel.value))

function goHome() {
  activeMenu.value = 'home'
  selectedCell.value = null
}

function openSheet(i) {
  active.value = i
  activeMenu.value = 'viewer'
}

// 시트를 바꾸면 행 검색어/선택 셀 초기화
watch(active, () => {
  rowSearch.value = ''
  selectedCell.value = null
})

function pickFile() {
  fileInput.value?.click()
}

function onPick(e) {
  const f = e.target.files?.[0]
  if (f) onFile(f)
  e.target.value = '' // 같은 파일 다시 선택 가능하도록 초기화
}

async function onFile(file) {
  error.value = ''
  sheets.value = []
  rowSearch.value = ''
  sheetFilter.value = ''
  selectedCell.value = null
  activeMenu.value = 'viewer'
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
