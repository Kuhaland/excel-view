<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue" class="sheet-overlay" @click.self="close">
        <div class="sheet" role="dialog" aria-modal="true" :aria-label="title">
          <div class="sheet-grip" @click="close"></div>

          <header v-if="title || $slots.header" class="sheet-head">
            <slot name="header">
              <h3 class="sheet-title">{{ title }}</h3>
            </slot>
            <button class="sheet-x" type="button" aria-label="닫기" @click="close">
              <span class="material-symbols-outlined">close</span>
            </button>
          </header>

          <div class="sheet-body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="sheet-foot">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
function onKey(e) {
  if (e.key === 'Escape') close()
}
watch(
  () => props.modelValue,
  (open) => {
    if (open) document.addEventListener('keydown', onKey)
    else document.removeEventListener('keydown', onKey)
  }
)
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<style scoped>
.sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
}

.sheet {
  width: 100%;
  max-width: 560px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -16px 50px rgba(0, 0, 0, 0.28);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 상단 드래그 핸들(그립) */
.sheet-grip {
  flex-shrink: 0;
  width: 44px;
  height: 5px;
  margin: 10px auto 4px;
  border-radius: 999px;
  background: #d6d8de;
  cursor: pointer;
}

.sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 18px 12px;
  flex-shrink: 0;
}
.sheet-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #1b1b1f;
}
.sheet-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #6b6d75;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.sheet-x:hover {
  background: #f1f1ee;
  color: #1b1b1f;
}
.sheet-x .material-symbols-outlined {
  font-size: 22px;
}

.sheet-body {
  padding: 4px 18px 18px;
  overflow-y: auto;
  color: #1b1b1f;
}

.sheet-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px calc(16px + env(safe-area-inset-bottom));
  border-top: 1px solid #ececec;
  flex-shrink: 0;
}

/* 등장/퇴장 — 아래에서 위로 슬라이드 + 페이드 */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.24s ease;
}
.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(100%);
}
</style>
