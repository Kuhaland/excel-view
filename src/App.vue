<template>
  <div class="wrap">
    <h1>📊 엑셀 뷰어</h1>
    <div class="sub">엑셀 파일을 올리면 내용과 셀 색상을 화면에 표로 보여줍니다. (브라우저에서만 처리 · 업로드 없음)</div>

    <FileDrop v-if="!sheets.length" @file="onFile" />

    <div v-if="error" class="err">⚠️ {{ error }}</div>

    <template v-if="sheets.length">
      <div class="toolbar">
        <span class="file-name">{{ fileName }}</span>
        <span class="chip">시트 {{ sheets.length }}개</span>
        <span class="chip" v-if="activeSheet">{{ activeSheet.rows.length }}행</span>
        <label class="toggle">
          <input type="checkbox" v-model="headerRow" /> 첫 행을 머리글로 표시
        </label>
        <button class="btn ghost" style="margin-left:auto" @click="reset">다른 파일 열기</button>
      </div>

      <div class="tabs" v-if="sheets.length > 1">
        <div
          v-for="(s, i) in sheets"
          :key="s.name"
          class="tab"
          :class="{ active: i === active }"
          @click="active = i"
        >
          {{ s.name }}
        </div>
      </div>

      <SheetGrid v-if="activeSheet" :rows="activeSheet.rows" :header-row="headerRow" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { parseWorkbook } from './excel.js'
import FileDrop from './components/FileDrop.vue'
import SheetGrid from './components/SheetGrid.vue'

const fileName = ref('')
const sheets = ref([])
const active = ref(0)
const error = ref('')
const headerRow = ref(true)

const activeSheet = computed(() => sheets.value[active.value] || null)

async function onFile(file) {
  error.value = ''
  sheets.value = []
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
}
</script>
