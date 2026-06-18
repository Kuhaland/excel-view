<template>
  <label class="ui-checkbox" :class="{ checked: modelValue, disabled }">
    <input
      type="checkbox"
      class="ui-checkbox-input"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="ui-checkbox-box">
      <span v-if="modelValue" class="material-symbols-outlined">check</span>
    </span>
    <span v-if="$slots.default" class="ui-checkbox-label"><slot /></span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.ui-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.ui-checkbox.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.ui-checkbox-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.ui-checkbox-box {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border: 1.5px solid #d9dbe0;
  border-radius: 7px;
  background: #fff;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
}

.ui-checkbox-box .material-symbols-outlined {
  font-size: 15px;
  font-weight: 700;
}

.ui-checkbox:hover .ui-checkbox-box {
  border-color: #7fce4f;
}

.ui-checkbox:active .ui-checkbox-box {
  transform: scale(0.92);
}

.ui-checkbox.checked .ui-checkbox-box {
  background: #7fce4f;
  border-color: #7fce4f;
}

.ui-checkbox-input:focus-visible + .ui-checkbox-box {
  outline: 2px solid #7fce4f;
  outline-offset: 2px;
}

.ui-checkbox-label {
  font-size: 13px;
  color: inherit;
}
</style>
