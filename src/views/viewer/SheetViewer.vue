<template>
  <!-- 파일 없음 -->
  <div v-if="!sheets.length" class="drop-area">
    <div class="sub">엑셀 파일을 올리면 내용과 셀 색상을 화면에 표로 보여줍니다. (브라우저에서만 처리 · 업로드 없음)</div>
    <FileDrop @file="onFile" />
    <div v-if="error" class="err"><span class="material-symbols-outlined">warning</span> {{ error }}</div>
  </div>

  <!-- 시트 뷰어 -->
  <template v-else>
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

  <!-- 다른 파일 선택용 숨김 입력 -->
  <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" hidden @change="onPick" />
</template>

<script setup>
import { ref } from 'vue'
import { useWorkbook } from '../../composables/useWorkbook.js'
import FileDrop from '../../components/ui/FileDrop.vue'
import Checkbox from '../../components/ui/Checkbox.vue'
import SheetGrid from './SheetGrid.vue'
import DetailPanel from './DetailPanel.vue'

const {
  fileName,
  sheets,
  active,
  error,
  headerRow,
  rowSearch,
  sheetFilter,
  selectedCell,
  activeSheet,
  filteredSheets,
  colCount,
  onFile,
} = useWorkbook()

const fileInput = ref(null)

function pickFile() {
  fileInput.value?.click()
}
function onPick(e) {
  const f = e.target.files?.[0]
  if (f) onFile(f)
  e.target.value = '' // 같은 파일 다시 선택 가능하도록 초기화
}
</script>
