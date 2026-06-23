<template>
  <div class="filter-bar">
    <!-- 데스크탑: 인라인 필터 / 모바일: 필터 버튼 -->
    <div class="fb-left">
      <div v-if="!isMobile" class="fb-inline">
        <slot />
      </div>
      <button v-else type="button" class="fb-trigger" @click="open = true">
        <span class="material-symbols-outlined">tune</span>
        <span>{{ triggerLabel }}</span>
        <span v-if="count" class="fb-count">{{ count }}</span>
      </button>
    </div>

    <!-- 우측 고정 컨트롤(정렬 등) — 데스크탑/모바일 공통 노출 -->
    <div v-if="$slots.trailing" class="fb-trailing">
      <slot name="trailing" />
    </div>

    <!-- 모바일: 아래에서 위로 올라오는 바텀시트 -->
    <BottomSheet v-if="isMobile" v-model="open" :title="title">
      <div class="fb-fields">
        <slot />
      </div>
      <template #footer>
        <button type="button" class="fb-reset" @click="$emit('reset')">초기화</button>
        <button type="button" class="fb-apply" @click="open = false">적용</button>
      </template>
    </BottomSheet>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import BottomSheet from '../overlay/BottomSheet.vue'

const props = defineProps({
  title: { type: String, default: '필터' },
  triggerLabel: { type: String, default: '필터' },
  count: { type: Number, default: 0 }, // 적용된 필터 개수(버튼 배지)
  breakpoint: { type: String, default: '(max-width: 640px)' },
})
defineEmits(['reset'])

const open = ref(false)

// 반응형 모바일 판별 (setup 시점에 동기 초기화 → 초기 깜빡임 방지)
const mq = typeof window !== 'undefined' ? window.matchMedia(props.breakpoint) : null
const isMobile = ref(mq ? mq.matches : false)
function onMq(e) {
  isMobile.value = e.matches
}
onMounted(() => {
  mq && mq.addEventListener('change', onMq)
})
onBeforeUnmount(() => mq && mq.removeEventListener('change', onMq))

// 데스크탑으로 전환되면 시트 닫기
watch(isMobile, (m) => {
  if (!m) open.value = false
})
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
}
.fb-left {
  min-width: 0;
}
.fb-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.fb-trailing {
  flex-shrink: 0;
}

/* 모바일 필터 버튼 */
.fb-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: var(--card);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.fb-trigger:hover {
  background: #f3f2ef;
}
.fb-trigger .material-symbols-outlined {
  font-size: 20px;
}
.fb-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #f2e24e;
  color: #1b1b1f;
  font-size: 11px;
  font-weight: 700;
}

/* 바텀시트 내부 필드 — 세로 스택 + 셀렉트 전체폭 */
.fb-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.fb-fields :deep(.select) {
  width: 100% !important;
}

/* 시트 푸터 버튼 */
.fb-reset,
.fb-apply {
  height: 44px;
  border-radius: 11px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.fb-reset {
  flex: 0 0 auto;
  padding: 0 18px;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--text);
}
.fb-reset:hover {
  background: #f3f2ef;
}
.fb-apply {
  flex: 1;
  border: 0;
  background: var(--ink);
  color: #fff;
}
.fb-apply:hover {
  filter: brightness(1.12);
}
</style>
