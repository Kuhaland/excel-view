<template>
  <aside class="ord-detail card" v-os="{ options: { overflow: { x: 'hidden' } } }">
    <!-- 헤더 -->
    <div class="od-top">
      <div>
        <div class="od-no">주문 #{{ order.id }}</div>
        <div class="od-sub">
          <Badge :tone="STATUS[order.status].tone">{{ STATUS[order.status].label }}</Badge>
          <span class="od-date tnum">{{ order.date }} · {{ order.time }}</span>
        </div>
      </div>
      <button class="od-x" aria-label="닫기" @click="$emit('close')">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <!-- 채널 + 고객정보(채널 규칙) -->
    <div class="od-block">
      <div class="od-row">
        <span class="od-k">채널</span>
        <span class="od-v"><Badge :tone="CHANNEL[order.channel].tone">{{ order.channel }}</Badge></span>
      </div>
      <template v-if="isOnline">
        <div class="od-row"><span class="od-k">이름</span><span class="od-v">{{ order.name }}</span></div>
        <div class="od-row"><span class="od-k">아이디</span><span class="od-v">@{{ order.account }}</span></div>
        <div class="od-row"><span class="od-k">연락처</span><span class="od-v tnum">{{ order.phone }}</span></div>
      </template>
      <template v-else>
        <div class="od-row">
          <span class="od-k">주문자</span>
          <span class="od-v">{{ rep }} <Badge tone="gray">비회원</Badge></span>
        </div>
      </template>
    </div>

    <!-- 결제 + 요청사항 -->
    <div class="od-block">
      <div class="od-row"><span class="od-k">결제수단</span><span class="od-v">{{ payLabel(order) }}</span></div>
      <div class="od-row"><span class="od-k">요청사항</span><span class="od-v od-memo">{{ order.memo || '없음' }}</span></div>
    </div>

    <!-- 항목별 금액 -->
    <div class="od-items-title">주문 항목</div>
    <ul class="od-items" v-os="{ options: { overflow: { x: 'hidden' } } }">
      <li v-for="(it, i) in order.items" :key="i">
        <div class="od-it-info">
          <div class="od-it-name truncate">{{ it.name }}</div>
          <div class="od-it-sub">{{ won(it.price) }} × {{ it.qty }}</div>
        </div>
        <div class="od-it-amt tnum">{{ won(it.price * it.qty) }}</div>
      </li>
    </ul>

    <div class="od-total">
      <span>합계</span>
      <span class="od-total-val">{{ won(total) }}</span>
    </div>

    <!-- 상태 변경 액션 -->
    <div class="od-actions">
      <Button v-if="nextLabel" variant="dark" icon="arrow_forward" @click="$emit('advance', order.id)">{{ nextLabel }}</Button>
      <Button v-if="canCancel" variant="outline" icon="close" @click="$emit('cancel', order.id)">주문 취소</Button>
      <div v-if="!nextLabel && !canCancel" class="od-final">{{ STATUS[order.status].label }}된 주문입니다.</div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import Button from '../../components/ui/Button.vue'
import Badge from '../../components/ui/Badge.vue'
import { STATUS, CHANNEL, won, orderTotal, isOnlineOrder, repName, payLabel } from './orderMeta.js'

const props = defineProps({
  order: { type: Object, required: true },
})
defineEmits(['close', 'advance', 'cancel'])

const isOnline = computed(() => isOnlineOrder(props.order))
const rep = computed(() => repName(props.order))
const total = computed(() => orderTotal(props.order))
const nextKey = computed(() => STATUS[props.order.status].next)
const nextLabel = computed(() => (nextKey.value ? `${STATUS[nextKey.value].label}(으)로 변경` : ''))
const canCancel = computed(() => ['received', 'cooking', 'ready'].includes(props.order.status))
</script>

<style scoped>
.ord-detail {
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
}
/* 태블릿: 테이블 아래로 쌓일 때 전체 폭 */
@media (max-width: 1000px) { .ord-detail { width: auto; } }
/* 모바일: 전체 화면 오버레이 */
@media (max-width: 640px) {
  .ord-detail {
    position: fixed; inset: 0; width: auto; z-index: 200;
    border-radius: 0; max-height: none;
    padding: 18px 16px calc(18px + env(safe-area-inset-bottom));
  }
}

.od-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.od-no { font-size: 18px; font-weight: 800; color: var(--text); }
.od-sub { display: flex; align-items: center; gap: 8px; margin-top: 7px; }
.od-date { font-size: 13px; color: var(--muted); }
.od-x {
  display: inline-flex; width: 30px; height: 30px;
  align-items: center; justify-content: center;
  border: 0; border-radius: 9px; background: transparent;
  color: var(--muted); cursor: pointer;
}
.od-x:hover { background: rgba(0, 0, 0, 0.05); color: var(--text); }

.od-block {
  display: flex; flex-direction: column; gap: 9px;
  padding: 16px 0;
  border-bottom: 1px solid var(--line);
}
.od-row { display: flex; align-items: center; gap: 10px; }
.od-k { flex: 0 0 64px; font-size: 13px; color: var(--muted); }
.od-v {
  flex: 1; min-width: 0;
  display: flex; align-items: center; gap: 6px;
  font-size: 14px; font-weight: 600; color: var(--text);
}
.od-memo { font-weight: 400; line-height: 1.5; }

.od-items-title { font-size: 13px; font-weight: 700; color: var(--text); margin: 16px 0 4px; }
.od-items { list-style: none; margin: 0; padding: 0; flex: 1; min-height: 0; overflow-y: auto; }
.od-items li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; }
.od-it-info { min-width: 0; }
.od-it-name { font-size: 14px; color: var(--text); max-width: 210px; }
.od-it-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
.od-it-amt { font-size: 14px; font-weight: 700; color: var(--text); }

.od-total {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 0; border-top: 1px solid var(--line);
  font-size: 14px; color: var(--muted);
}
.od-total-val { font-size: 18px; font-weight: 800; color: var(--text); }

.od-actions { display: flex; gap: 10px; }
.od-actions > * { flex: 1; } /* 버튼 균등 분배 */
.od-final { text-align: center; font-size: 13px; color: var(--muted); padding: 9px 0; }
</style>
