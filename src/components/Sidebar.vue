<template>
  <aside class="sidebar" :class="{ collapsed }">
    <!-- 브랜드 + 접기/펼치기 토글 -->
    <div class="brand">
      <span class="brand-logo material-symbols-outlined">monitoring</span>
      <span class="brand-name">엑셀 뷰어</span>
      <button
        type="button"
        class="collapse-btn"
        :title="collapsed ? '펼치기' : '접기'"
        @click="collapsed = !collapsed"
      >
        <span class="material-symbols-outlined">{{ collapsed ? 'chevron_right' : 'chevron_left' }}</span>
      </button>
    </div>

    <!-- 메뉴 그룹 -->
    <nav class="menu-wrap">
      <template v-for="(group, gi) in groups" :key="gi">
        <div v-if="gi > 0" class="menu-divider"></div>
        <SidebarMenu
          :items="group.items"
          :active="activeMenu"
          @select="$emit('update:activeMenu', $event)"
        />
      </template>
    </nav>

    <!-- 하단: 로그아웃 -->
    <button type="button" class="logout" title="로그아웃" @click="$emit('close')">
      <span class="material-symbols-outlined">logout</span>
      <span class="logout-text">로그아웃</span>
    </button>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import SidebarMenu from './SidebarMenu.vue'

defineProps({
  groups: { type: Array, required: true },
  activeMenu: { type: String, default: '' },
})
defineEmits(['update:activeMenu', 'close'])

const collapsed = ref(false)
</script>
