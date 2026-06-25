<template>
  <div class="no-data" :class="`no-data--${size}`">
    <span class="material-symbols-outlined nd-icon">{{ icon }}</span>
    <p class="nd-title">{{ title }}</p>
    <p v-if="description" class="nd-desc">{{ description }}</p>
    <div v-if="$slots.action" class="nd-action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  icon: { type: String, default: 'inbox' },
  title: { type: String, default: '데이터가 없습니다.' },
  description: { type: String, default: '' },
  size: { type: String, default: 'md' },
})
</script>

<style lang="scss" scoped>
.no-data {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  height: calc(100% - 40px);
  color: var(--muted); text-align: center;
  &.no-data--md { padding: 56px 20px; }
  &.no-data--sm { padding: 28px 16px; }
  .nd-icon {
    margin-bottom: 6px;
    font-size: 44px; line-height: 1; color: #c4c6cd;
  }
  .no-data--sm .nd-icon { font-size: 32px; margin-bottom: 2px; }
  .nd-title { margin-bottom: 8px; font-size: 18px; font-weight: 600; color: var(--text);}
  .no-data--sm .nd-title { font-size: 14px; }
  .nd-desc { margin-top: 0; font-size: 14px; color: var(--muted);}
  .nd-action { margin-top: 12px;}
}
</style>
