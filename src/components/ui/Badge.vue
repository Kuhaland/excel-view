<template>
  <span class="ui-badge" :class="`ui-badge--${tone}`"><slot /></span>
</template>

<script setup>
defineProps({
  // gray | green | blue | red | purple | orange | yellow
  tone: { type: String, default: 'gray' },
})
</script>

<style lang="scss" scoped>
.ui-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 11px;
  border-radius: 999px;
  white-space: nowrap;
  letter-spacing: var(--tracking-caption); // 소형 라벨 자간 복원
}

.ui-badge--gray   { background: #f0efe8; color: #6b6d75; }
.ui-badge--green  { background: rgba(34, 197, 94, 0.16); color: #16a34a; }
.ui-badge--blue   { background: rgba(59, 130, 246, 0.16); color: #2563eb; }
.ui-badge--red    { background: rgba(239, 68, 68, 0.16); color: #dc2626; }
.ui-badge--purple { background: rgba(139, 92, 246, 0.16); color: #7c3aed; }
.ui-badge--orange { background: rgba(240, 150, 90, 0.18); color: #c9692e; }
.ui-badge--yellow { background: #f7eeb6; color: #8a6d12; }
</style>
