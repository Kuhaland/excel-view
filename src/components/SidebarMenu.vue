<template>
  <nav class="menu">
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="nav-item"
      :class="{ active: item.id === active }"
      :title="item.label"
      @click="$emit('select', item.id)"
    >
      <span class="material-symbols-outlined">{{ item.icon }}</span>
      <span class="nav-text">{{ item.label }}</span>
      <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
    </button>
  </nav>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
  active: { type: String, default: '' },
})
defineEmits(['select'])
</script>
