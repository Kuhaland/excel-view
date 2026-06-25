<template>
  <nav v-if="total > 0" class="pagination" aria-label="페이지 탐색">
    <span class="pg-summary">{{ rangeStart }}–{{ rangeEnd }} / {{ total.toLocaleString() }}</span>

    <div class="pg-controls">
      <button
        type="button"
        class="pg-btn pg-edge"
        :disabled="current <= 1"
        aria-label="이전 페이지"
        @click="go(current - 1)"
      >
        <span class="material-symbols-outlined">chevron_left</span>
      </button>

      <!-- 데스크탑: 번호 버튼 목록 -->
      <div class="pg-pages">
        <button
          v-for="(p, i) in pages"
          :key="i"
          type="button"
          class="pg-btn"
          :class="{ on: p === current, dots: p === '…' }"
          :disabled="p === '…'"
          :aria-current="p === current ? 'page' : undefined"
          @click="p !== '…' && go(p)"
        >
          {{ p }}
        </button>
      </div>

      <!-- 모바일: 현재/전체 페이지 표시(번호 목록 대체) -->
      <span class="pg-current">{{ current }} / {{ pageCount }}</span>

      <button
        type="button"
        class="pg-btn pg-edge"
        :disabled="current >= pageCount"
        aria-label="다음 페이지"
        @click="go(current + 1)"
      >
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  total: { type: Number, required: true },
  pageSize: { type: Number, default: 10 },
  siblingCount: { type: Number, default: 1 },
})
const emit = defineEmits(['update:modelValue'])

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const current = computed(() => Math.min(Math.max(1, props.modelValue), pageCount.value))

const rangeStart = computed(() => (props.total === 0 ? 0 : (current.value - 1) * props.pageSize + 1))
const rangeEnd = computed(() => Math.min(current.value * props.pageSize, props.total))

const pages = computed(() => {
  const last = pageCount.value
  const cur = current.value
  const sib = props.siblingCount
  const start = Math.max(cur - sib, 1)
  const end = Math.min(cur + sib, last)
  const arr = []
  for (let i = start; i <= end; i++) arr.push(i)
  if (start > 1) {
    if (start > 2) arr.unshift('…')
    arr.unshift(1)
  }
  if (end < last) {
    if (end < last - 1) arr.push('…')
    arr.push(last)
  }
  return arr
})

function go(p) {
  const next = Math.min(Math.max(1, p), pageCount.value)
  if (next !== props.modelValue) emit('update:modelValue', next)
}

// 항목 수가 줄어 현재 페이지가 범위를 벗어나면 보정
watch(pageCount, (pc) => {
  if (props.modelValue > pc) emit('update:modelValue', pc)
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.pg-summary {
  font-size: 13px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.pg-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}
.pg-pages {
  display: flex;
  align-items: center;
  gap: 4px;
}
/* 모바일 전용 현재/전체 표시 — 데스크탑에서는 숨김 */
.pg-current {
  display: none;
  min-width: 56px;
  padding: 0 8px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
.pg-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--card);
  color: var(--text);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.pg-btn:hover:not(:disabled):not(.on) {
  background: #f3f2ef;
  border-color: #c9cbd1;
}
.pg-btn.on {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
  cursor: default;
}
.pg-btn:disabled {
  opacity: 0.45;
  cursor: default;
}
.pg-btn.dots {
  border-color: transparent;
  background: transparent;
  cursor: default;
}
.pg-edge .material-symbols-outlined {
  font-size: 19px;
}

/* 모바일: 번호 목록 숨기고 현재/전체 표시로 압축(가로 넘침 방지) */
@media (max-width: 640px) {
  .pg-pages {
    display: none;
  }
  .pg-current {
    display: inline-block;
  }
}
</style>
