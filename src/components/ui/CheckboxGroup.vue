<template>
  <div class="checkbox-group" role="group" :aria-labelledby="label ? labelId : undefined">
    <div v-if="label" :id="labelId" class="cg-label">{{ label }}</div>

    <div class="cg-items" :class="orientation">
      <!-- 전체 선택 (선택 상태에 따라 indeterminate 자동) -->
      <Checkbox
        v-if="selectAll"
        class="cg-all"
        :model-value="allChecked"
        :indeterminate="someChecked && !allChecked"
        :label="selectAllLabel"
        :disabled="!enabledValues.length"
        @change="toggleAll"
      />

      <Checkbox
        v-for="o in options"
        :key="o.value"
        v-model="model"
        :value="o.value"
        :label="o.label"
        :disabled="o.disabled"
        @change="onItemChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue'
import Checkbox from './Checkbox.vue'

const model = defineModel({ default: () => [] })

const props = defineProps({
  options: { type: Array, default: () => [] }, // [{ label, value, disabled }]
  label: { type: String, default: '' },
  orientation: { type: String, default: 'vertical' }, // 'vertical' | 'horizontal'
  selectAll: { type: Boolean, default: false },
  selectAllLabel: { type: String, default: '전체 선택' },
})
const emit = defineEmits(['change'])

const labelId = useId()

const enabledValues = computed(() => props.options.filter((o) => !o.disabled).map((o) => o.value))
const allChecked = computed(
  () => enabledValues.value.length > 0 && enabledValues.value.every((v) => model.value.includes(v))
)
const someChecked = computed(() => enabledValues.value.some((v) => model.value.includes(v)))

function toggleAll() {
  if (allChecked.value) {
    model.value = model.value.filter((v) => !enabledValues.value.includes(v))
  } else {
    model.value = [...new Set([...model.value, ...enabledValues.value])]
  }
  emit('change', model.value)
}
function onItemChange() {
  emit('change', model.value)
}
</script>

<style scoped>
.cg-label {
  font-size: 13px;
  font-weight: 700;
  color: #1b1b1f;
  margin-bottom: 6px;
}
.cg-items {
  display: flex;
}
.cg-items.vertical {
  flex-direction: column;
  gap: 2px;
}
.cg-items.horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px 18px;
}
.cg-all {
  font-weight: 700;
}
</style>
