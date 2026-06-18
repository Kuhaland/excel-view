// 워크북(엑셀 파일) 공유 상태 — 모듈 스코프 싱글톤이라 라우트 전환에도 유지된다.
import { ref, computed, watch } from 'vue'
import { parseWorkbook } from '../excel.js'

const fileName = ref('')
const sheets = ref([])
const active = ref(0)
const error = ref('')
const headerRow = ref(true)
const rowSearch = ref('')
const sheetFilter = ref('')
const selectedCell = ref(null)

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

// 시트를 바꾸면 행 검색어/선택 셀 초기화
watch(active, () => {
  rowSearch.value = ''
  selectedCell.value = null
})

async function onFile(file) {
  error.value = ''
  sheets.value = []
  rowSearch.value = ''
  sheetFilter.value = ''
  selectedCell.value = null
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
}

export function useWorkbook() {
  return {
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
    reset,
  }
}
