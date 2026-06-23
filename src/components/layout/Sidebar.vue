<template>
  <aside ref="rootRef" class="sidebar" :class="{ collapsed }">
    <!-- 브랜드 + 접기/펼치기 -->
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

    <!-- 메인 카테고리(아이콘 + 아코디언) → 하위 항목(텍스트) -->
    <nav class="menu-wrap">
      <div
        v-for="g in groups"
        :key="g.id"
        class="menu-section"
        :class="{ open: secOpen.has(g.id), 'has-active': sectionHasActive(g) }"
        @mouseenter="onEnter(g, $event)"
        @mouseleave="onLeave"
      >
        <button type="button" class="menu-sec-head" :title="g.title" @click="onHeadClick(g, $event)">
          <span class="material-symbols-outlined menu-sec-icon">{{ g.icon }}</span>
          <span class="menu-sec-title">{{ g.title }}</span>
          <span class="material-symbols-outlined menu-sec-caret">expand_more</span>
        </button>

        <!-- 펼침: 인라인 아코디언 / 접힘: 클릭 시 우측 플라이아웃(fixed) -->
        <div
          class="menu-sec-body"
          :class="{ 'sec-flyout': collapsed }"
          :style="collapsed && flyId === g.id ? flyStyle : null"
          v-show="collapsed ? flyId === g.id : secOpen.has(g.id)"
        >
          <div class="sec-fly-title">{{ g.title }}</div>
          <SidebarMenu :items="g.items" :active="activeMenu" @select="onSelect" />
        </div>
      </div>
    </nav>

    <!-- 하단 고정: 설정 / 로그아웃 -->
    <button
      type="button"
      class="logout nav-foot-btn"
      :class="{ active: activeMenu === 'settings' }"
      title="설정"
      @click="onSelect('settings')"
    >
      <span class="material-symbols-outlined">settings</span>
      <span class="logout-text">설정</span>
    </button>
    <button type="button" class="logout" title="로그아웃" @click="$emit('close')">
      <span class="material-symbols-outlined">logout</span>
      <span class="logout-text">로그아웃</span>
    </button>

    <!-- 접힘 상태 hover 툴팁 (좌→우 슬라이드) -->
    <Transition name="nav-tip">
      <div v-if="tip.show" class="nav-tip" :style="tip.style">{{ tip.label }}</div>
    </Transition>
  </aside>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import SidebarMenu from '../SidebarMenu.vue'
import logo from '../../assets/images/partner/smartscore.svg'
const props = defineProps({
  groups: { type: Array, required: true },
  activeMenu: { type: String, default: '' },
})
const emit = defineEmits(['update:activeMenu', 'close', 'home'])

const collapsed = ref(false)
const rootRef = ref(null)

// 활성 항목이 속한 섹션 판별 → 자동 펼침
function sectionHasActive(g) {
  return g.items.some(
    (it) => it.id === props.activeMenu || (it.children && it.children.some((c) => c.id === props.activeMenu))
  )
}
const secOpen = ref(new Set())
function syncSec() {
  props.groups.forEach((g) => {
    if (sectionHasActive(g)) secOpen.value.add(g.id)
  })
}
syncSec()
watch(() => props.activeMenu, syncSec)

// ── 접힘 상태: 클릭 = 메뉴 플라이아웃 / hover = 타이틀 툴팁 ──
const flyId = ref(null)
const flyStyle = ref({})
const tip = ref({ show: false, label: '', style: {} })

function onHeadClick(g, e) {
  if (!collapsed.value) {
    // 펼침: 아코디언 토글
    const next = new Set(secOpen.value)
    next.has(g.id) ? next.delete(g.id) : next.add(g.id)
    secOpen.value = next
    return
  }
  // 접힘: 클릭으로 플라이아웃 메뉴 토글
  tip.value = { ...tip.value, show: false }
  if (flyId.value === g.id) {
    flyId.value = null
    return
  }
  const sr = rootRef.value.getBoundingClientRect()
  const r = e.currentTarget.getBoundingClientRect()
  flyStyle.value = { position: 'fixed', top: `${Math.max(8, r.top)}px`, left: `${sr.right + 8}px` }
  flyId.value = g.id
}

function onEnter(g, e) {
  if (!collapsed.value) return
  if (flyId.value === g.id) return // 플라이아웃 열린 항목은 툴팁 생략
  const sr = rootRef.value.getBoundingClientRect()
  const r = e.currentTarget.getBoundingClientRect()
  tip.value = {
    show: true,
    label: g.title,
    style: { position: 'fixed', top: `${r.top + r.height / 2}px`, left: `${sr.right + 10}px` },
  }
}
function onLeave() {
  tip.value = { ...tip.value, show: false }
}

function onSelect(id) {
  emit('update:activeMenu', id)
  flyId.value = null // 항목 선택 시 플라이아웃 닫기
}

// 바깥 클릭 / Esc 로 플라이아웃 닫기
function onDocMousedown(e) {
  if (collapsed.value && flyId.value && rootRef.value && !rootRef.value.contains(e.target)) flyId.value = null
}
function onKey(e) {
  if (e.key === 'Escape') flyId.value = null
}
onMounted(() => {
  document.addEventListener('mousedown', onDocMousedown)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocMousedown)
  document.removeEventListener('keydown', onKey)
})
</script>
