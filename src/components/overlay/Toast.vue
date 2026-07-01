<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="modelValue" class="toast" role="status" aria-live="polite">
        <span v-if="icon" class="material-symbols-outlined toast-ic">{{ icon }}</span>
        <span class="toast-msg">{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }, // 표시 여부(v-model)
  message: { type: String, default: '' },        // 표시 문구
  icon: { type: String, default: '' },           // 매트리얼 심볼 이름(선택)
  duration: { type: Number, default: 1800 },     // 자동 닫힘(ms), 0이면 유지
})
const emit = defineEmits(['update:modelValue'])

let timer = null
function arm() {
  if (timer) clearTimeout(timer)
  if (props.duration > 0) {
    timer = setTimeout(() => emit('update:modelValue', false), props.duration)
  }
}
// 열릴 때(또는 열린 채 문구가 바뀔 때) 자동 닫힘 타이머 재설정
watch(
  () => [props.modelValue, props.message],
  () => {
    if (props.modelValue) arm()
    else if (timer) { clearTimeout(timer); timer = null }
  }
)
onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
</script>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  z-index: 1100; /* Modal(1000) 위 */
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: min(90vw, 420px);
  padding: 10px 16px;
  border-radius: 999px;
  background: #1b1b1f;
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
}
.toast-ic { font-size: 18px; }
.toast-msg { line-height: 1.3; }

.toast-enter-active,
.toast-leave-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translate(-50%, 8px); }
</style>
