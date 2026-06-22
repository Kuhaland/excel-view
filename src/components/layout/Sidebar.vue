<template>
  <aside class="sidebar" :class="{ collapsed }">
    <!-- 브랜드 + 접기/펼치기 토글 -->
    <div class="brand">
      <button type="button" class="brand-home" title="홈" @click="$emit('home')">
        <img class="brand-logo-img" :src="logo" alt="홈" />
      </button>
      <button
        type="button"
        class="collapse-btn"
        :title="collapsed ? '펼치기' : '접기'"
        @click="collapsed = !collapsed"
      >
        <span class="material-symbols-outlined">{{ collapsed ? 'chevron_right' : 'chevron_left' }}</span>
      </button>
    </div>

    <!-- 메뉴 트리 (섹션 → 항목 → 하위) -->
    <nav class="menu-wrap">
      <div v-for="group in groups" :key="group.id" class="menu-section">
        <div class="menu-title">{{ group.title }}</div>
        <SidebarMenu
          :items="group.items"
          :active="activeMenu"
          @select="$emit('update:activeMenu', $event)"
        />
      </div>
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
import SidebarMenu from '../SidebarMenu.vue'
import logo from '../../assets/images/logo.png'

defineProps({
  groups: { type: Array, required: true },
  activeMenu: { type: String, default: '' },
})
defineEmits(['update:activeMenu', 'close', 'home'])

const collapsed = ref(false)
</script>
