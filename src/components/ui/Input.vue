<template>
  <input
    class="ui-input"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :min="min"
    :max="max"
    :maxlength="maxlength"
    @input="onInput"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' }, // text | number
  placeholder: { type: String, default: '' },
  min: { type: [Number, String], default: undefined },
  max: { type: [Number, String], default: undefined },
  maxlength: { type: [Number, String], default: undefined },
})
const emit = defineEmits(['update:modelValue'])

function onInput(e) {
  const raw = e.target.value
  emit('update:modelValue', props.type === 'number' && raw !== '' ? Number(raw) : raw)
}
</script>

<style lang="scss" scoped>
.ui-input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--card);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.12s;

  &::placeholder { color: #b6b8bf; }
  &:focus { outline: none; border-color: var(--ink); }
}
</style>
