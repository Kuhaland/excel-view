<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div
          class="modal"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          :style="{ maxWidth: width }"
        >
          <header v-if="title || $slots.header" class="modal-head">
            <slot name="header">
              <h2 class="modal-title">{{ title }}</h2>
            </slot>
            <button class="modal-x" type="button" aria-label="닫기" @click="close">
              <span class="material-symbols-outlined">close</span>
            </button>
          </header>

          <div class="modal-body" v-os="{ options: { overflow: { x: 'hidden' } } }">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="modal-foot">
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
  width: { type: String, default: '560px' }, // 최대 너비
})
const emit = defineEmits(['update:modelValue', 'close'])

function close() {
  emit('update:modelValue', false)
  emit('close')
}
function onKey(e) {
  if (e.key === 'Escape') close()
}
// 열림 상태에 따라 ESC 처리 + 배경 스크롤 잠금
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }
)
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
}

.modal {
  width: 100%;
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #ececec;
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1b1b1f;
}

.modal-x {
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
.modal-x:hover {
  background: #f1f1ee;
  color: #1b1b1f;
}
.modal-x .material-symbols-outlined {
  font-size: 22px;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  color: #1b1b1f;
}

.modal-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid #ececec;
  flex-shrink: 0;
}

/* 등장/퇴장 애니메이션 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: translateY(12px) scale(0.98);
  opacity: 0;
}

/* 모바일: 모달을 전체 화면으로 */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 0;
  }
  .modal {
    width: 100%;
    height: 100%;
    max-width: none !important; /* 인라인 max-width 덮어쓰기 */
    max-height: none;
    border-radius: 0;
  }
  .modal-body {
    flex: 1; /* 남는 높이 채움 */
  }
  /* 전체화면이라 살짝 떠오르는 등장 애니메이션은 단순 페이드로 */
  .modal-enter-from .modal,
  .modal-leave-to .modal {
    transform: none;
  }
}
</style>
