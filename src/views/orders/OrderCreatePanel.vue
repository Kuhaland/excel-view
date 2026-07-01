<template>
  <aside class="order-create card" v-os="{ options: { overflow: { x: 'hidden' } } }">
    <div class="oc-top">
      <div class="oc-title">주문 수기 등록</div>
      <button class="oc-x" aria-label="닫기" @click="$emit('close')">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <div class="oc-body" v-os="{ options: { overflow: { x: 'hidden' } } }">
      <div class="oc-2col">
        <div class="oc-field">
          <label>채널</label>
          <Select v-model="f.channel" :options="channelOptions" />
        </div>
        <div class="oc-field">
          <label>상태</label>
          <Select v-model="f.status" :options="statusOptions" />
        </div>
      </div>

      <div class="oc-2col">
        <div class="oc-field"><label>날짜</label><input class="oc-native" type="date" v-model="f.date" /></div>
        <div class="oc-field"><label>시간</label><input class="oc-native" type="time" v-model="f.time" /></div>
      </div>

      <!-- 채널별 고객/자리 정보 -->
      <template v-if="isOnline">
        <div class="oc-field"><label>이름</label><Input v-model="f.name" placeholder="고객 이름" maxlength="20" /></div>
        <div class="oc-2col">
          <div class="oc-field"><label>아이디</label><Input v-model="f.account" placeholder="아이디" maxlength="30" /></div>
          <div class="oc-field"><label>연락처</label><Input v-model="f.phone" placeholder="010-0000-0000" maxlength="20" /></div>
        </div>
      </template>
      <div v-else-if="f.channel === '매장'" class="oc-field" :class="{ invalid: showError && !f.table.trim() }">
        <label>테이블</label><Input v-model="f.table" placeholder="예: 5" maxlength="10" />
      </div>
      <div v-else class="oc-field" :class="{ invalid: showError && !f.pickup.trim() }">
        <label>대기번호</label><Input v-model="f.pickup" placeholder="예: 12" maxlength="10" />
      </div>

      <div class="oc-2col">
        <div class="oc-field">
          <label>결제수단</label>
          <Select v-model="f.pay" :options="payOptions" />
        </div>
        <div v-if="f.pay === '카드'" class="oc-field" :class="{ invalid: showError && !f.card }">
          <label>카드사</label>
          <Select v-model="f.card" :options="cardOptions" placeholder="카드사 선택" />
        </div>
      </div>

      <div class="oc-field">
        <label>요청사항</label>
        <Input v-model="f.memo" placeholder="요청사항 (선택)" maxlength="60" />
      </div>

      <!-- 주문 항목 -->
      <div class="oc-items-head">
        <span>주문 항목</span>
        <Button variant="outline" size="sm" icon="add" @click="addItem">항목 추가</Button>
      </div>
      <div class="oc-item oc-item-head">
        <span>메뉴명</span><span>수량</span><span>단가</span><span></span>
      </div>
      <div v-for="(it, i) in f.items" :key="i" class="oc-item" :class="{ invalid: showError && !it.menuId }">
        <Select :model-value="it.menuId" :options="menuOptions" placeholder="메뉴 선택" @update:model-value="(v) => onPickMenu(it, v)" />
        <Input class="oc-num" type="number" :min="1" v-model="it.qty" />
        <Input class="oc-num" type="number" :min="0" v-model="it.price" />
        <button class="ghost-icon-btn" aria-label="항목 삭제" :disabled="f.items.length <= 1" @click="removeItem(i)">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="oc-total">
        <span>합계</span>
        <span class="oc-total-val">{{ won(total) }}</span>
      </div>
    </div>

    <div class="oc-actions">
      <Button variant="outline" @click="$emit('close')">취소</Button>
      <Button variant="primary" icon="check" @click="submit">등록</Button>
    </div>
  </aside>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import Input from '../../components/ui/Input.vue'
import Select from '../../components/ui/Select.vue'
import Button from '../../components/ui/Button.vue'
import { STATUS, STATUS_ORDER, CHANNEL, CARD_BRANDS, won, orderTotal } from './orderMeta.js'
import { loadMenuItems, menuBasePrice } from '../menu/menuData.js'

const emit = defineEmits(['close', 'submit', 'invalid'])

// 실메뉴 목록(메뉴 관리 데이터) — 항목 메뉴명 선택용
const menuList = loadMenuItems()
const menuOptions = menuList.map((m) => ({ label: `${m.name} (${m.category})`, value: m.id }))
const menuById = new Map(menuList.map((m) => [m.id, m]))
function onPickMenu(it, id) {
  it.menuId = id
  const m = menuById.get(id)
  if (m) { it.name = m.name; it.price = menuBasePrice(m) }
}

const pad2 = (n) => String(n).padStart(2, '0')
const now = new Date()
const today = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
const nowHm = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`

const f = reactive({
  channel: '매장',
  status: 'received',
  date: today,
  time: nowHm,
  table: '', pickup: '',
  name: '', account: '', phone: '',
  pay: '카드', card: '', // 카드사 최초 미선택
  memo: '',
  items: [{ menuId: null, name: '', qty: 1, price: 0 }],
})

const isOnline = computed(() => CHANNEL[f.channel].online)
const channelOptions = Object.keys(CHANNEL).map((c) => ({ label: c, value: c }))
const statusOptions = STATUS_ORDER.map((k) => ({ label: STATUS[k].label, value: k }))
const payOptions = ['카드', '현금', '간편결제', '네이버페이', '계좌이체'].map((p) => ({ label: p, value: p }))
const cardOptions = CARD_BRANDS.map((c) => ({ label: `${c}카드`, value: c }))
const total = computed(() => orderTotal({ items: f.items.map((it) => ({ price: Number(it.price) || 0, qty: Number(it.qty) || 1 })) }))

function addItem() { f.items.push({ menuId: null, name: '', qty: 1, price: 0 }) }
function removeItem(i) { if (f.items.length > 1) f.items.splice(i, 1) }

const showError = ref(false)

function submit() {
  showError.value = true // 실패 시 조건별 필드 하이라이트 활성화
  // 메뉴 미선택 항목
  if (f.items.some((it) => !it.menuId)) { emit('invalid', '메뉴를 선택하지 않은 항목이 있습니다.'); return }
  // 온라인 고객명
  if (isOnline.value && !f.name.trim()) { emit('invalid', '고객 이름을 입력해 주세요.'); return }
  // 매장 테이블 / 포장 대기번호
  if (f.channel === '매장' && !f.table.trim()) { emit('invalid', '테이블 번호를 입력해 주세요.'); return }
  if (f.channel === '포장' && !f.pickup.trim()) { emit('invalid', '대기번호를 입력해 주세요.'); return }
  // 카드 결제 시 카드사
  if (f.pay === '카드' && !f.card) { emit('invalid', '카드사를 선택해 주세요.'); return }
  showError.value = false

  const items = f.items.map((it) => ({
    name: it.name.trim(),
    qty: Math.max(1, Number(it.qty) || 1),
    price: Number(it.price) || 0,
  }))

  const o = {
    date: f.date, time: f.time, channel: f.channel, status: f.status,
    pay: f.pay, memo: f.memo.trim(), items,
  }
  if (f.pay === '카드') o.card = f.card
  if (isOnline.value) {
    o.name = f.name.trim(); o.account = f.account.trim(); o.phone = f.phone.trim()
  } else if (f.channel === '매장') {
    o.table = f.table.trim()
  } else {
    o.pickup = f.pickup.trim()
  }
  emit('submit', o)
}
</script>

<style scoped>
.order-create {
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
}
@media (max-width: 1000px) { .order-create { width: auto; } }
@media (max-width: 640px) {
  .order-create {
    position: fixed; inset: 0; width: auto; z-index: 200;
    border-radius: 0; max-height: none;
    padding: 18px 16px calc(18px + env(safe-area-inset-bottom));
  }
}

.oc-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-shrink: 0; }
.oc-title { font-size: 17px; font-weight: 800; color: var(--text); }
.oc-x {
  display: inline-flex; width: 30px; height: 30px;
  align-items: center; justify-content: center;
  border: 0; border-radius: 9px; background: transparent; color: var(--muted); cursor: pointer;
}
.oc-x:hover { background: rgba(0, 0, 0, 0.05); color: var(--text); }

.oc-body { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding: 16px 0; }
.oc-2col { display: flex; gap: 10px; }
.oc-2col > .oc-field { flex: 1; min-width: 0; }
.oc-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.oc-field label { font-size: 12px; font-weight: 600; color: var(--muted); }
/* Select 기본 폭(220px 고정)이 2단 레이아웃에서 겹치지 않도록 컨테이너 폭에 맞춤 */
.oc-field :deep(.select) { width: 100%; }
/* 유효성 오류 강조 */
.oc-field.invalid :deep(.ui-input),
.oc-field.invalid :deep(.sel-trigger) { border-color: #e5484d; }
.oc-native {
  height: 38px; padding: 0 12px;
  border: 1px solid var(--line); border-radius: 10px; background: var(--card);
  color: var(--text); font-family: inherit; font-size: 14px;
}
.oc-native:focus { outline: none; border-color: var(--ink); }

.oc-items-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 4px; font-size: 13px; font-weight: 700; color: var(--text);
}
.oc-item { display: grid; grid-template-columns: 1fr 52px 78px 32px; align-items: center; gap: 6px; }
.oc-item-head { font-size: 11px; font-weight: 600; color: var(--muted); }
.oc-item-head span:nth-child(2), .oc-item-head span:nth-child(3) { text-align: center; }
.oc-item :deep(.select) { width: 100%; min-width: 0; }
/* 좁은 칸이라 드롭다운은 트리거보다 넓게 펼쳐 옵션 라벨이 잘리지 않게 */
.oc-item :deep(.sel-list) { right: auto; min-width: 260px; }
.oc-item :deep(.opt-label) { white-space: nowrap; }
.oc-item.invalid :deep(.sel-trigger) { border-color: #e5484d; }
.oc-num :deep(.ui-input) { text-align: right; padding: 0 8px; }

.oc-total {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 4px; padding-top: 12px; border-top: 1px solid var(--line);
  font-size: 14px; color: var(--muted);
}
.oc-total-val { font-size: 18px; font-weight: 800; color: var(--text); }

.oc-actions { display: flex; gap: 10px; flex-shrink: 0; }
.oc-actions > * { flex: 1; }
</style>
