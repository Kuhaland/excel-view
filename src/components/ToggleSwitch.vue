<template>
  <button
    type="button"
    class="toggle-switch"
    :class="{ on: modelValue }"
    role="switch"
    :aria-checked="modelValue ? 'true' : 'false'"
    :aria-label="ariaLabel"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span class="ts-track">
      <span v-if="offIcon" class="ts-ico ts-ico--off material-symbols-outlined">{{ offIcon }}</span>
      <span v-if="onIcon" class="ts-ico ts-ico--on material-symbols-outlined">{{ onIcon }}</span>
      <span class="ts-knob"></span>
    </span>
  </button>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  onIcon: { type: String, default: '' }, // 켜짐(true) 쪽 아이콘
  offIcon: { type: String, default: '' }, // 꺼짐(false) 쪽 아이콘
  ariaLabel: { type: String, default: '토글' },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.toggle-switch {
  /* 외부에서 --ts-* 로 커스터마이즈 가능 */
  --ts-w: 52px;
  --ts-h: 28px;
  --ts-pad: 3px;
  --ts-knob: calc(var(--ts-h) - var(--ts-pad) * 2);
  --ts-off-bg: rgba(128, 130, 138, 0.35);
  --ts-on-bg: #f2e24e;
  --ts-knob-bg: #ffffff;
  --ts-ico: rgba(255, 255, 255, 0.85);
  --ts-ico-active: #1b1b1f;

  display: inline-flex;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.ts-track {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: var(--ts-w);
  height: var(--ts-h);
  border-radius: 999px;
  background: var(--ts-off-bg);
  transition: background 0.25s ease;
}

.toggle-switch.on .ts-track {
  background: var(--ts-on-bg);
}

.ts-knob {
  position: absolute;
  top: var(--ts-pad);
  left: var(--ts-pad);
  width: var(--ts-knob);
  height: var(--ts-knob);
  border-radius: 50%;
  background: var(--ts-knob-bg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-switch.on .ts-knob {
  transform: translateX(calc(var(--ts-w) - var(--ts-knob) - var(--ts-pad) * 2));
}

/* 트랙 양쪽 아이콘 */
.ts-ico {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  color: var(--ts-ico);
  pointer-events: none;
  transition: color 0.25s ease, opacity 0.25s ease;
}
.ts-ico--off {
  left: 6px;
}
.ts-ico--on {
  right: 6px;
}
/* 활성 쪽(노브 반대편) 아이콘을 강조 */
.toggle-switch:not(.on) .ts-ico--off {
  color: var(--ts-ico-active);
}
.toggle-switch.on .ts-ico--on {
  color: var(--ts-ico-active);
}
</style>
