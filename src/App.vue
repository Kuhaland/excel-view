<template>
  <div class="page">
    <div class="app">
      <Sidebar
        :groups="menuGroups"
        v-model:active-menu="activeMenu"
        @close="reset"
      />

      <!-- 메인 영역 -->
      <main class="main">
        <header class="topbar">
          <h1 class="page-title">{{ activeMenuLabel }}</h1>
          <div class="topbar-actions">
            <button class="icon-btn"><span class="material-symbols-outlined">mail</span></button>
            <button class="icon-btn"><span class="material-symbols-outlined">search</span></button>
            <div class="profile">
              <div class="avatar">{{ avatarInitial }}</div>
              <div class="profile-meta">
                <div class="profile-name">{{ userName }}</div>
                <div class="profile-mail">{{ userEmail }}</div>
              </div>
            </div>
          </div>
        </header>

        <!-- 파일 없음 -->
        <div v-if="!sheets.length" class="drop-area">
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
              <label class="toggle">
                <input type="checkbox" v-model="headerRow" /> 머리글
              </label>
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

        <!-- 그 외 메뉴: 준비 중 -->
        <div v-else class="placeholder">
          <span class="material-symbols-outlined">{{ activeMenuIcon }}</span>
          <div class="placeholder-title">{{ activeMenuLabel }}</div>
          <div class="placeholder-sub">준비 중인 메뉴입니다.</div>
        </div>
      </main>
    </div>

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
import SheetGrid from './components/SheetGrid.vue'
import Sidebar from './components/Sidebar.vue'
import DetailPanel from './components/DetailPanel.vue'

const menuGroups = MENU_GROUPS
const fileName = ref('')
const sheets = ref([])
const active = ref(0)
const activeMenu = ref('viewer')
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
  activeMenu.value = 'viewer'
}
</script>
