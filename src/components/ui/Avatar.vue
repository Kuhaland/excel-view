<template>
  <span class="ui-avatar" :style="style"><slot>{{ initial }}</slot></span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },   // 첫 글자를 이니셜로 표시
  color: { type: String, default: '#e5e5e5' }, // 배경색
  size: { type: Number, default: 28 },    // 지름(px)
})

const initial = computed(() => props.name.charAt(0).toUpperCase())
const style = computed(() => ({
  background: props.color,
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${Math.round(props.size * 0.43)}px`,
}))
</script>

<style lang="scss" scoped>
.ui-avatar {
  flex-shrink: 0;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #3a2c00; // 파스텔 배경 위 가독성용 진한 갈색
}
</style>
