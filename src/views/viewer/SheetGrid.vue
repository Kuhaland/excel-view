<template>
  <div class="sheet-box">
    <div v-if="rows.length === 0" class="empty">빈 시트입니다.</div>
    <table v-else class="grid">
      <thead>
        <tr>
          <th class="corner"></th>
          <th v-for="c in colLetters" :key="c">{{ c }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in displayRows"
          :key="item.ri"
          :class="{ 'header-row': headerRow && item.ri === 0 }"
        >
          <td class="row-num">{{ item.ri + 1 }}</td>
          <template v-for="ci in colCount" :key="ci">
            <td
              v-if="filtering || !item.row[ci - 1]?.skip"
              :rowspan="!filtering && item.row[ci - 1]?.rowspan > 1 ? item.row[ci - 1].rowspan : null"
              :colspan="!filtering && item.row[ci - 1]?.colspan > 1 ? item.row[ci - 1].colspan : null"
              :style="cellStyle(item.row[ci - 1])"
              :class="{ sel: selected && selected.ri === item.ri && selected.ci === ci }"
              @click="onCellClick(item.ri, ci, item.row[ci - 1])"
            >
              <template v-if="item.row[ci - 1]?.runs">
                <span v-for="(run, k) in item.row[ci - 1].runs" :key="k" :style="runStyle(run)">{{ run.text }}</span>
              </template>
              <template v-else>{{ item.row[ci - 1]?.v ?? '' }}</template>
            </td>
          </template>
        </tr>
        <tr v-if="!displayRows.length">
          <td class="row-num"></td>
          <td :colspan="colCount" class="empty">검색 결과가 없습니다.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rows: { type: Array, required: true },
  headerRow: { type: Boolean, default: true },
  search: { type: String, default: '' },
  selected: { type: Object, default: null }, // { ri, ci }
})
const emit = defineEmits(['select-cell'])

function onCellClick(ri, ci, cell) {
  emit('select-cell', {
    ri,
    ci,
    address: colLetter(ci - 1) + (ri + 1),
    cell: cell || null,
  })
}

const colCount = computed(() =>
  props.rows.reduce((m, r) => Math.max(m, r.length), 0)
)

const filtering = computed(() => props.search.trim().length > 0)

// 검색 시: 일치하는 행만 표시(머리글 행은 항상 유지). 원래 행 인덱스는 보존.
const displayRows = computed(() => {
  const all = props.rows.map((row, ri) => ({ row, ri }))
  if (!filtering.value) return all
  const q = props.search.trim().toLowerCase()
  return all.filter(({ row, ri }) => {
    if (props.headerRow && ri === 0) return true
    return row.some((c) => c && String(c.v ?? '').toLowerCase().includes(q))
  })
})

function colLetter(n) {
  let s = ''
  n += 1
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}
const colLetters = computed(() =>
  Array.from({ length: colCount.value }, (_, i) => colLetter(i))
)

function decoration(o) {
  const d = []
  if (o.underline) d.push('underline')
  if (o.strike) d.push('line-through')
  return d.length ? d.join(' ') : null
}

// 엑셀 폰트 크기(pt) -> CSS px (1pt = 96/72 px)
function ptToPx(pt) {
  return Math.round(pt * (96 / 72) * 100) / 100 + 'px'
}

function cellStyle(cell) {
  if (!cell) return null
  const s = {}
  if (cell.bg) s.backgroundColor = cell.bg
  if (cell.fg) s.color = cell.fg
  if (cell.size) s.fontSize = ptToPx(cell.size)
  if (cell.bold) s.fontWeight = '700'
  if (cell.italic) s.fontStyle = 'italic'
  const dec = decoration(cell)
  if (dec) s.textDecoration = dec
  if (cell.align) s.textAlign = cell.align
  if (cell.valign) s.verticalAlign = cell.valign
  // 셀 안 줄바꿈(\n) 보존. 자동 줄바꿈(wrap)이면 너비 안에서 접어줌
  s.whiteSpace = cell.wrap ? 'pre-wrap' : 'pre'
  if (cell.wrap) s.maxWidth = '320px'
  return s
}

function runStyle(run) {
  const s = {}
  if (run.bold) s.fontWeight = '700'
  if (run.italic) s.fontStyle = 'italic'
  if (run.color) s.color = run.color
  if (run.size) s.fontSize = ptToPx(run.size)
  const dec = decoration(run)
  if (dec) s.textDecoration = dec
  return s
}
</script>
