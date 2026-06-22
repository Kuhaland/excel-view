<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block, 'is-disabled': disabled }]"
    :disabled="disabled"
  >
    <span v-if="icon" class="material-symbols-outlined btn-ic">{{ icon }}</span>
    <span v-if="$slots.default" class="btn-label"><slot /></span>
    <span v-if="iconRight" class="material-symbols-outlined btn-ic">{{ iconRight }}</span>
  </button>
</template>

<script setup>
defineProps({
  // primary(옐로) | dark(잉크) | outline | ghost
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' }, // sm | md | lg
  icon: { type: String, default: '' }, // 좌측 아이콘(material symbol)
  iconRight: { type: String, default: '' },
  block: { type: Boolean, default: false }, // 가로 100%
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})
// click 등 네이티브 이벤트/attr은 단일 루트라 자동 fallthrough
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: 12px;
  font-family: inherit;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: filter 0.12s, background 0.12s, border-color 0.12s, box-shadow 0.12s;
}
.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
}

/* 크기 */
.btn--sm { height: 32px; padding: 0 12px; font-size: 13px; }
.btn--md { height: 40px; padding: 0 16px; font-size: 14px; }
.btn--lg { height: 46px; padding: 0 20px; font-size: 15px; }
.btn--block { width: 100%; }

.btn-ic { font-size: 18px; }
.btn--lg .btn-ic { font-size: 20px; }

/* variant */
.btn--primary { background: #f2e24e; color: #1b1b1f; }
.btn--primary:not(.is-disabled):hover { filter: brightness(0.96); }

.btn--dark { background: #1b1b1f; color: #fff; }
.btn--dark:not(.is-disabled):hover { filter: brightness(1.25); }

.btn--outline {
  background: transparent;
  border-color: #d6d7dd;
  color: #1b1b1f;
}
.btn--outline:not(.is-disabled):hover { background: rgba(0, 0, 0, 0.04); border-color: #b3b5bd; }

.btn--ghost { background: transparent; color: inherit; }
.btn--ghost:not(.is-disabled):hover { background: rgba(0, 0, 0, 0.05); }

/* disabled */
.btn.is-disabled {
  cursor: not-allowed;
  opacity: 0.55;
  filter: none;
}
</style>
