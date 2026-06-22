<template>
  <label
    :for="id"
    class="base-checkbox"
    :class="{ 'is-checked': checked, 'is-indeterminate': indeterminate, 'is-disabled': disabled }"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <input
      :id="id"
      ref="inputRef"
      class="bc-input"
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
      @change="onChange"
    />
    <span class="bc-box" aria-hidden="true">
      <!-- indeterminate: 가로선 / checked: 체크 -->
      <svg v-if="indeterminate" class="bc-icon" viewBox="0 0 16 16">
        <line x1="4" y1="8" x2="12" y2="8" />
      </svg>
      <svg v-else class="bc-icon" viewBox="0 0 16 16">
        <polyline points="3.5,8.5 6.6,11.5 12.5,4.5" />
      </svg>
    </span>
    <span v-if="label || $slots.default" class="bc-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
import { ref, computed, watch, onMounted, useId } from 'vue'

// 단독: boolean / 그룹: 배열
const model = defineModel({ default: false })

const props = defineProps({
  label: { type: String, default: '' },
  value: { default: undefined }, // 그룹(배열) 모드에서 이 항목 값
  disabled: { type: Boolean, default: false },
  indeterminate: { type: Boolean, default: false },
})
const emit = defineEmits(['change'])

const id = useId()
const inputRef = ref(null)

const checked = computed(() => {
  if (Array.isArray(model.value)) return model.value.includes(props.value)
  return !!model.value
})

function onChange() {
  if (props.disabled) return
  let next
  if (Array.isArray(model.value)) {
    next = model.value.includes(props.value)
      ? model.value.filter((v) => v !== props.value)
      : [...model.value, props.value]
  } else {
    next = !model.value
  }
  model.value = next
  emit('change', next)
}

// indeterminate는 DOM 속성으로 직접 반영
function syncIndeterminate() {
  if (inputRef.value) inputRef.value.indeterminate = props.indeterminate
}
watch(() => props.indeterminate, syncIndeterminate)
onMounted(syncIndeterminate)
</script>

<style scoped>
.base-checkbox {
  --bc-size: 18px;
  --bc-radius: 6px;
  --bc-primary: #1b1b1f; /* checked/indeterminate 배경 */
  --bc-border: #c7c9d1;
  --bc-ring: rgba(59, 130, 246, 0.45);

  display: inline-flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  line-height: 1.4;
  color: #1b1b1f;
  /* 클릭 영역 확보 */
  padding: 4px 2px;
}

/* 실제 input은 시각적으로 숨기되 접근/포커스는 유지 */
.bc-input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.bc-box {
  flex-shrink: 0;
  width: var(--bc-size);
  height: var(--bc-size);
  border: 1.5px solid var(--bc-border);
  border-radius: var(--bc-radius);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s, border-color 0.12s, box-shadow 0.12s;
}

.bc-icon {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: #fff;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
  transition: opacity 0.12s;
}

/* checked / indeterminate */
.is-checked .bc-box,
.is-indeterminate .bc-box {
  background: var(--bc-primary);
  border-color: var(--bc-primary);
}
.is-checked .bc-icon,
.is-indeterminate .bc-icon {
  opacity: 1;
}

/* focus-visible ring */
.bc-input:focus-visible + .bc-box {
  box-shadow: 0 0 0 3px var(--bc-ring);
  border-color: var(--bc-primary);
}

/* hover */
.base-checkbox:not(.is-disabled):hover .bc-box {
  border-color: #9a9ca4;
}
.base-checkbox:not(.is-disabled).is-checked:hover .bc-box,
.base-checkbox:not(.is-disabled).is-indeterminate:hover .bc-box {
  border-color: var(--bc-primary);
}

/* disabled */
.is-disabled {
  cursor: not-allowed;
  color: #b8bac0;
}
.is-disabled .bc-box {
  background: #f1f1f3;
  border-color: #e2e2e6;
}
.is-disabled.is-checked .bc-box,
.is-disabled.is-indeterminate .bc-box {
  background: #c7c9d1;
  border-color: #c7c9d1;
}

.bc-label {
  font-family: inherit;
}
</style>
