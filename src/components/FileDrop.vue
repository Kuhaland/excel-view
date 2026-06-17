<template>
  <div class="drop"
       :class="{ over }"
       @click="pick"
       @dragover.prevent="over = true"
       @dragleave.prevent="over = false"
       @drop.prevent="onDrop"
  >
    <div class="icon">📊</div>
    <div class="big">엑셀 파일을 여기에 끌어다 놓거나 클릭해서 선택</div>
    <div class="small">.xlsx · .xls · .csv 지원 — 파일은 서버로 전송되지 않고 브라우저에서만 처리됩니다</div>
    <input ref="input" type="file" accept=".xlsx,.xls,.csv" @change="onChange" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['file'])
const over = ref(false)
const input = ref(null)

function pick() {
  input.value?.click()
}
function onChange(e) {
  const f = e.target.files?.[0]
  if (f) emit('file', f)
  e.target.value = ''
}
function onDrop(e) {
  over.value = false
  const f = e.dataTransfer.files?.[0]
  if (f) emit('file', f)
}
</script>
