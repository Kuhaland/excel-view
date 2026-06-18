<template>
  <div class="placeholder">
    <span class="material-symbols-outlined">{{ icon }}</span>
    <div class="placeholder-title">{{ title }}</div>
    <div class="placeholder-sub">준비 중인 메뉴입니다.</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta.title ?? '')
const icon = computed(() => route.meta.icon ?? 'widgets')
</script>
