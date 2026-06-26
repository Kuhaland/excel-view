<template>
  <div :class="{ 'split-view': isSplit }"
       :style="isSplit ? null : passthrough"
  >
    <!-- Table card -->
    <div class="data-table card">
      <!-- Content -->
      <div ref="bodyRef" class="dt-scroll" v-os>
        <!-- Header -->
        <slot name="head" />
        <!-- Body -->
        <slot :rows="pagedRows" />
        <!-- No Data -->
        <NoData v-if="!rows.length"
                :icon="emptyIcon"
                :title="emptyTitle"
                :description="emptyDescription"
        >
          <template v-if="$slots['empty-action']" #action>
            <slot name="empty-action" />
          </template>
        </NoData>
      </div>
      <!-- Footer -->
      <div class="dt-foot">
        <Pagination v-model="page" :total="rows.length" :page-size="pageSize" />
      </div>
    </div>
    <!-- Slide Panel -->
    <Transition v-if="isSplit" name="slide-panel">
      <slot name="panel" />
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, useSlots } from 'vue'
import Pagination from './Pagination.vue'
import NoData from './NoData.vue'

const props = defineProps({
  rows: { type: Array, required: true },
  rowHeight: { type: Number, default: 52 },
  emptyIcon: { type: String, default: 'inbox' },
  emptyTitle: { type: String, default: '데이터가 없습니다.' },
  emptyDescription: { type: String, default: '' },
  split: { type: Boolean, default: false },
})

const slots = useSlots()
const isSplit = computed(() => props.split || !!slots.panel)
const passthrough = { display: 'contents' }

const bodyRef = ref(null)
const page = ref(1)
const pageSize = ref(1)
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return props.rows.slice(start, start + pageSize.value)
})

function recalcPageSize() {
  const el = bodyRef.value
  if (!el) return
  const headH = el.querySelector('.dt-head')?.offsetHeight || 40
  const rowH = el.querySelector('.dt-data')?.offsetHeight || props.rowHeight
  const fit = Math.floor((el.clientHeight - headH) / rowH)
  pageSize.value = Math.max(1, fit)
}

let ro = null
onMounted(() => {
  nextTick(recalcPageSize)
  if (typeof ResizeObserver !== 'undefined' && bodyRef.value) {
    ro = new ResizeObserver(recalcPageSize)
    ro.observe(bodyRef.value)
  } else {
    window.addEventListener('resize', recalcPageSize)
  }
})
onBeforeUnmount(() => {
  if (ro) ro.disconnect()
  else window.removeEventListener('resize', recalcPageSize)
})

watch(() => props.rows, () => {
  page.value = 1
})
</script>
