<template>
  <div ref="rootRef" class="select" :class="{ 'is-open': open, 'is-disabled': disabled }">
    <button
      ref="triggerRef"
      type="button"
      class="sel-trigger"
      role="combobox"
      :aria-expanded="open ? 'true' : 'false'"
      aria-haspopup="listbox"
      :aria-controls="listId"
      :disabled="disabled"
      @click="toggle"
      @keydown="onKey"
    >
      <span class="sel-value" :class="{ placeholder: !selectedOption }">
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <span
        v-if="clearable && selectedOption && !disabled"
        class="sel-clear"
        role="button"
        aria-label="선택 해제"
        @click.stop="clear"
      >
        <span class="material-symbols-outlined">close</span>
      </span>
      <span class="sel-arrow material-symbols-outlined">expand_more</span>
    </button>

    <ul
      v-show="open"
      v-os="{ options: { overflow: { x: 'hidden' } } }"
      :id="listId"
      ref="listRef"
      class="sel-list"
      role="listbox"
      :aria-activedescendant="highlighted >= 0 ? optId(highlighted) : undefined"
    >
      <li
        v-for="(o, i) in options"
        :id="optId(i)"
        :key="o.value"
        class="sel-option"
        :class="{ active: i === highlighted, selected: o.value === model, disabled: o.disabled }"
        role="option"
        :aria-selected="o.value === model ? 'true' : 'false'"
        :aria-disabled="o.disabled ? 'true' : undefined"
        @click="select(i)"
        @mousemove="highlighted = i"
      >
        <span class="opt-label">{{ o.label }}</span>
        <span v-if="o.value === model" class="material-symbols-outlined opt-check">check</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, useId } from 'vue'

const model = defineModel({ default: null })

const props = defineProps({
  options: { type: Array, default: () => [] }, // [{ label, value, disabled }]
  placeholder: { type: String, default: '선택' },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
})
const emit = defineEmits(['change'])

const listId = useId()
const rootRef = ref(null)
const triggerRef = ref(null)
const listRef = ref(null)
const open = ref(false)
const highlighted = ref(-1)

const selectedOption = computed(() => props.options.find((o) => o.value === model.value) || null)
function optId(i) {
  return `${listId}-opt-${i}`
}

function firstEnabled() {
  return props.options.findIndex((o) => !o.disabled)
}
function openList() {
  if (props.disabled) return
  open.value = true
  const sel = props.options.findIndex((o) => o.value === model.value)
  highlighted.value = sel >= 0 ? sel : firstEnabled()
  nextTick(scrollToActive)
}
function closeList(focusTrigger = true) {
  open.value = false
  if (focusTrigger) nextTick(() => triggerRef.value?.focus())
}
function toggle() {
  open.value ? closeList(false) : openList()
}

function select(i) {
  const o = props.options[i]
  if (!o || o.disabled) return
  model.value = o.value
  emit('change', o.value)
  closeList()
}
function clear() {
  model.value = null
  emit('change', null)
}

function move(dir) {
  if (!open.value) {
    openList()
    return
  }
  const n = props.options.length
  if (!n) return
  let i = highlighted.value
  for (let k = 0; k < n; k++) {
    i = (i + dir + n) % n
    if (!props.options[i].disabled) break
  }
  highlighted.value = i
  nextTick(scrollToActive)
}
function scrollToActive() {
  listRef.value?.querySelector('.sel-option.active')?.scrollIntoView({ block: 'nearest' })
}

function onKey(e) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      move(1)
      break
    case 'ArrowUp':
      e.preventDefault()
      move(-1)
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      if (open.value && highlighted.value >= 0) select(highlighted.value)
      else openList()
      break
    case 'Escape':
      if (open.value) {
        e.preventDefault()
        closeList()
      }
      break
    case 'Tab':
      if (open.value) closeList(false)
      break
  }
}

function onDocClick(e) {
  if (open.value && rootRef.value && !rootRef.value.contains(e.target)) closeList(false)
}
onMounted(() => document.addEventListener('mousedown', onDocClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick))
</script>

<style scoped>
.select {
  --sel-border: #d6d7dd;
  --sel-primary: #1b1b1f;
  --sel-ring: rgba(59, 130, 246, 0.4);
  position: relative;
  display: inline-block;
  width: 220px;
  font-size: 14px;
}

.sel-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  height: 40px;
  padding: 0 10px 0 14px;
  border: 1px solid var(--sel-border);
  border-radius: 10px;
  background: #fff;
  color: #1b1b1f;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.sel-trigger:hover {
  border-color: #b3b5bd;
}
.sel-trigger:focus-visible {
  outline: none;
  border-color: var(--sel-primary);
  box-shadow: 0 0 0 3px var(--sel-ring);
}
.is-open .sel-trigger {
  border-color: var(--sel-primary);
}

.sel-value {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sel-value.placeholder {
  align-items: flex-start;
  border: 0;
  color: #b8bac0;
}

.sel-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  color: #9a9ca4;
  cursor: pointer;
}
.sel-clear:hover {
  background: #f1f1ee;
  color: #1b1b1f;
}
.sel-clear .material-symbols-outlined {
  font-size: 18px;
}

.sel-arrow {
  font-size: 20px;
  color: #8b8d96;
  transition: transform 0.18s ease;
}
.is-open .sel-arrow {
  transform: rotate(180deg);
}

.sel-list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 50;
  margin: 0;
  padding: 6px;
  list-style: none;
  max-height: 260px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 12px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.14);
}
.sel-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 10px;
  border-radius: 8px;
  cursor: pointer;
  color: #2a2c32;
}
.sel-option.active {
  background: #f3f2ef;
}
.sel-option.selected {
  font-weight: 700;
  color: #1b1b1f;
}
.sel-option.disabled {
  color: #c2c4cc;
  cursor: not-allowed;
}
.opt-check {
  font-size: 18px;
  color: var(--sel-primary);
}

.is-disabled .sel-trigger {
  background: #f5f5f3;
  color: #b8bac0;
  cursor: not-allowed;
  border-color: #e6e6ea;
}
</style>
