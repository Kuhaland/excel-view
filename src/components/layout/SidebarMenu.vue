<template>
  <div class="menu">
    <template v-for="item in items" :key="item.id">
      <!-- 하위가 있는 항목: 텍스트 + 아코디언(2차) -->
      <div v-if="item.children" class="nav-group-wrap">
        <button
          type="button"
          class="nav-item nav-group"
          :class="{ open: open.has(item.id), 'has-active': hasActiveChild(item) }"
          @click="toggleGroup(item.id)"
        >
          <span class="nav-text">{{ item.label }}</span>
          <span class="material-symbols-outlined nav-caret">expand_more</span>
        </button>
        <div v-show="open.has(item.id)" class="nav-children">
          <button
            v-for="c in item.children"
            :key="c.id"
            type="button"
            class="nav-item nav-child"
            :class="{ active: c.id === active }"
            :title="c.label"
            @click="$emit('select', c.id)"
          >
            <span class="nav-dot"></span>
            <span class="nav-text">{{ c.label }}</span>
          </button>
        </div>
      </div>

      <!-- 단일 항목: 텍스트만 -->
      <button
        v-else
        type="button"
        class="nav-item"
        :class="{ active: item.id === active }"
        :title="item.label"
        @click="$emit('select', item.id)"
      >
        <span class="nav-text">{{ item.label }}</span>
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  active: { type: String, default: '' },
})
defineEmits(['select'])

function hasActiveChild(item) {
  return !!item.children && item.children.some((c) => c.id === props.active)
}

// 2차 그룹 아코디언 (활성 포함 그룹 자동 펼침)
const open = ref(new Set())
function syncOpen() {
  props.items.forEach((it) => {
    if (it.children && hasActiveChild(it)) open.value.add(it.id)
  })
}
syncOpen()
watch(() => props.active, syncOpen)

function toggleGroup(id) {
  const next = new Set(open.value)
  next.has(id) ? next.delete(id) : next.add(id)
  open.value = next
}
</script>
