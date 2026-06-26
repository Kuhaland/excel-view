<template>
  <aside class="detail" v-os="{ options: { overflow: { x: 'hidden' } } }">
    <!-- 셀 선택됨 -->
    <template v-if="cell">
      <div class="detail-head">
        <div>
          <div class="detail-title">셀 {{ cell.address }}</div>
          <Badge tone="yellow">{{ colName }}{{ cell.ri + 1 }}행</Badge>
        </div>
        <button class="icon-btn" @click="$emit('clear')" title="닫기">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="detail-value">
        <div class="detail-label">값</div>
        <div class="value-box" v-os>{{ displayValue || '(빈 셀)' }}</div>
      </div>

      <div class="detail-section-title">서식</div>
      <ul class="attr-list">
        <li>
          <span class="attr-key">배경색</span>
          <span class="attr-val">
            <span class="swatch" :style="{ background: cell.cell?.bg || 'transparent' }"></span>
            {{ cell.cell?.bg || '없음' }}
          </span>
        </li>
        <li>
          <span class="attr-key">글자색</span>
          <span class="attr-val">
            <span class="swatch" :style="{ background: cell.cell?.fg || '#1c1c1c' }"></span>
            {{ cell.cell?.fg || '기본' }}
          </span>
        </li>
        <li>
          <span class="attr-key">글자 크기</span>
          <span class="attr-val">{{ cell.cell?.size ? cell.cell.size + 'pt' : '기본' }}</span>
        </li>
        <li>
          <span class="attr-key">스타일</span>
          <span class="attr-val">{{ styleText }}</span>
        </li>
        <li v-if="merged">
          <span class="attr-key">병합</span>
          <span class="attr-val">{{ merged }}</span>
        </li>
      </ul>

      <div class="detail-foot">
        <button class="btn-dark" @click="copyValue">
          <span class="material-symbols-outlined">content_copy</span> {{ copied ? '복사됨' : '값 복사' }}
        </button>
        <button class="btn-yellow" @click="$emit('clear')">
          <span class="material-symbols-outlined">undo</span> 선택 해제
        </button>
      </div>
    </template>

    <!-- 시트 요약 -->
    <template v-else>
      <div class="detail-head">
        <div class="detail-title">{{ sheetName || '시트' }}</div>
      </div>
      <div class="detail-hint">
        <span class="material-symbols-outlined">touch_app</span>
        <span>표의 셀을 클릭하면 상세 정보가 표시됩니다.</span>
      </div>

      <div class="detail-section-title">요약</div>
      <ul class="attr-list">
        <li><span class="attr-key">파일</span><span class="attr-val ellipsis">{{ fileName }}</span></li>
        <li><span class="attr-key">행 수</span><span class="attr-val">{{ rowCount.toLocaleString() }}</span></li>
        <li><span class="attr-key">열 수</span><span class="attr-val">{{ colCount.toLocaleString() }}</span></li>
      </ul>
    </template>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import Badge from '../../components/ui/Badge.vue'

const props = defineProps({
  cell: { type: Object, default: null }, // { ri, ci, address, cell }
  sheetName: { type: String, default: '' },
  fileName: { type: String, default: '' },
  rowCount: { type: Number, default: 0 },
  colCount: { type: Number, default: 0 },
})
defineEmits(['clear'])

const copied = ref(false)

const displayValue = computed(() => {
  const c = props.cell?.cell
  if (!c) return ''
  if (Array.isArray(c.runs)) return c.runs.map((r) => r.text).join('')
  return c.v ?? ''
})

const colName = computed(() => props.cell?.address?.replace(/\d+$/, '') ?? '')

const styleText = computed(() => {
  const c = props.cell?.cell
  if (!c) return '기본'
  const parts = []
  if (c.bold) parts.push('굵게')
  if (c.italic) parts.push('기울임')
  if (c.underline) parts.push('밑줄')
  if (c.strike) parts.push('취소선')
  return parts.length ? parts.join(', ') : '기본'
})

const merged = computed(() => {
  const c = props.cell?.cell
  if (!c) return ''
  if (c.rowspan > 1 || c.colspan > 1) return `${c.rowspan} × ${c.colspan}`
  return ''
})

async function copyValue() {
  try {
    await navigator.clipboard.writeText(String(displayValue.value ?? ''))
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    /* 클립보드 권한 없음 — 무시 */
  }
}
</script>
