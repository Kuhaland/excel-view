<template>
  <aside class="ord-detail card" v-os="{ options: { overflow: { x: 'hidden' } } }">
    <div class="od-top">
      <div>
        <div class="od-no">주문 #{{ order.id }}</div>
        <div class="od-sub">
          <Badge :tone="statusTone(order.status)">{{ statusLabel(order.status) }}</Badge>
          <span class="od-date">{{ order.date }} · {{ order.time }}</span>
        </div>
      </div>
      <button class="od-x" aria-label="닫기" @click="$emit('close')">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <div class="od-cust">
      <Avatar :name="order.name" :color="order.color" :size="72" />
      <div class="od-name">{{ order.name }}</div>
      <div class="od-contacts">
        <button class="od-cc"><span class="material-symbols-outlined">mail</span></button>
        <button class="od-cc"><span class="material-symbols-outlined">call</span></button>
        <button class="od-cc"><span class="material-symbols-outlined">chat</span></button>
      </div>
    </div>

    <div class="od-items-title">주문 상품</div>
    <ul class="od-items" v-os="{ options: { overflow: { x: 'hidden' } } }">
      <li v-for="(it, i) in order.items" :key="i">
        <span class="od-thumb material-symbols-outlined">{{ it.icon }}</span>
        <div class="od-it-info">
          <div class="od-it-name">{{ it.name }}</div>
          <div class="od-it-price">{{ won(it.price) }}</div>
        </div>
      </li>
    </ul>

    <div class="od-total">
      <span>합계</span>
      <span class="od-total-val">{{ won(order.total) }}</span>
    </div>

    <div class="od-actions">
      <Button variant="dark" icon="my_location">배송 추적</Button>
      <Button variant="primary" icon="undo" @click="$emit('close')">취소</Button>
    </div>
  </aside>
</template>

<script setup>
import Button from '../../components/ui/Button.vue'
import Badge from '../../components/ui/Badge.vue'
import Avatar from '../../components/ui/Avatar.vue'

defineProps({
  order: { type: Object, required: true },
})
defineEmits(['close'])

function won(n) {
  return '₩' + n.toLocaleString('ko-KR')
}
function statusTone(s) {
  return { Paid: 'gray', Delivered: 'orange', Completed: 'green' }[s]
}
function statusLabel(s) {
  return { Paid: '결제완료', Delivered: '배송', Completed: '완료' }[s]
}
</script>

<style scoped>
.ord-detail {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
}

/* 태블릿: 테이블 아래로 쌓일 때 전체 폭 사용 */
@media (max-width: 1000px) {
  .ord-detail {
    width: auto;
  }
}
/* 모바일: 화면 전체를 덮는 고정 오버레이 패널(우→좌 슬라이드 인) */
@media (max-width: 640px) {
  .ord-detail {
    position: fixed;
    inset: 0;
    width: auto;
    z-index: 200;
    border-radius: 0;
    max-height: none;
    padding: 18px 16px calc(18px + env(safe-area-inset-bottom));
  }
}
.od-top {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
}
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

.od-cust {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 20px 0 18px;
  border-bottom: 1px solid var(--line);
}
.od-name { font-size: 15px; font-weight: 700; color: var(--text); }
.od-contacts { display: flex; gap: 10px; }
.od-cc {
  display: inline-flex; width: 40px; height: 40px;
  align-items: center; justify-content: center;
  border: 1px solid var(--line); border-radius: 50%;
  background: var(--card); color: var(--text); cursor: pointer;
  transition: background 0.12s;
}
.od-cc:hover { background: rgba(0, 0, 0, 0.04); }

.od-items-title {
  font-size: 13px; font-weight: 700; color: var(--text);
  margin: 16px 0 4px;
}
.od-items {
  list-style: none; margin: 0; padding: 0;
  flex: 1; min-height: 0; overflow-y: auto;
}
.od-items li {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0;
}
.od-thumb {
  flex-shrink: 0;
  width: 42px; height: 42px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 10px;
  background: #f1f0ec;
  color: #6b6d75;
  font-size: 22px;
}
.od-it-info { min-width: 0; }
.od-it-name {
  font-size: 13px; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;
}
.od-it-price { font-size: 13px; font-weight: 700; color: var(--text); margin-top: 1px; }

.od-total {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 0;
  border-top: 1px solid var(--line);
  font-size: 14px; color: var(--muted);
}
.od-total-val { font-size: 18px; font-weight: 800; color: var(--text); }

.od-actions { display: flex; gap: 10px; }
.od-actions > * { flex: 1; } /* Button 컴포넌트 균등 분배 */

</style>
