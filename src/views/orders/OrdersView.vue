<template>
  <div class="orders">
    <!-- 필터/정렬 툴바 (공통 FilterBar: 모바일은 필터 버튼 + 바텀시트) -->
    <FilterBar title="주문 필터" :count="activeFilterCount" @reset="resetFilters">
      <Select v-model="statusFilter" :options="statusOptions" :style="{ width: '150px' }" />
      <Select v-model="range" :options="rangeOptions" :style="{ width: '170px' }" />
      <template #trailing>
        <Select v-model="sort" :options="sortOptions" :style="{ width: '130px' }" />
      </template>
    </FilterBar>

    <div class="ord-grid">
      <!-- 테이블 -->
      <div class="ord-table card">
        <div class="ord-head ord-row">
          <span class="oc-check">
            <Checkbox
              :model-value="allChecked"
              :indeterminate="someChecked && !allChecked"
              @change="toggleAll"
            />
          </span>
          <span class="oc-id">주문번호</span>
          <span class="oc-cust">고객</span>
          <span class="oc-status">상태</span>
          <span class="oc-total">금액</span>
          <span class="oc-date">날짜</span>
          <span class="oc-more"></span>
        </div>

        <div ref="bodyRef" class="ord-body">
          <div
            v-for="o in pagedOrders"
            :key="o.id"
            class="ord-row ord-data"
            :class="{ active: o.id === activeId }"
            @click="activeId = o.id"
          >
            <span class="oc-check" @click.stop>
              <Checkbox v-model="selectedIds" :value="o.id" />
            </span>
            <span class="oc-id">#{{ o.id }}</span>
            <span class="oc-cust">
              <span class="avatar-sm" :style="{ background: o.color }">{{ initial(o.name) }}</span>
              <span class="cust-name">{{ o.name }}</span>
            </span>
            <span class="oc-status">
              <span class="ord-badge" :class="statusClass(o.status)">{{ statusLabel(o.status) }}</span>
            </span>
            <span class="oc-total">{{ won(o.total) }}</span>
            <span class="oc-date">{{ o.date }}</span>
            <span class="oc-more">
              <button class="ord-more-btn" @click.stop aria-label="더보기">
                <span class="material-symbols-outlined">more_horiz</span>
              </button>
            </span>
          </div>
        </div>

        <!-- 페이지네이션(테이블 카드 하단 고정) -->
        <div class="ord-foot">
          <Pagination v-model="page" :total="viewOrders.length" :page-size="pageSize" />
        </div>
      </div>

      <!-- 상세 패널 (row 클릭 시 우측에서 슬라이드 인 / 닫기 시 우측으로 슬라이드 아웃) -->
      <Transition name="slide-panel">
        <OrderDetailPanel v-if="detail" :order="detail" @close="activeId = null" />
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import OrderDetailPanel from './OrderDetailPanel.vue'
import Checkbox from '../../components/ui/Checkbox.vue'
import Select from '../../components/ui/Select.vue'
import FilterBar from '../../components/data/FilterBar.vue'
import Pagination from '../../components/data/Pagination.vue'

// 필터/정렬 옵션 (Select 컴포넌트용)
const statusOptions = [
  { label: '전체 상태', value: 'all' },
  { label: '결제완료', value: 'Paid' },
  { label: '배송', value: 'Delivered' },
  { label: '완료', value: 'Completed' },
]
const rangeOptions = [
  { label: '전체 금액', value: 'all' },
  { label: '~50만원', value: 'lo' },
  { label: '50만~150만원', value: 'mid' },
  { label: '150만원~', value: 'hi' },
]
const sortOptions = [
  { label: '날짜순', value: 'date' },
  { label: '금액순', value: 'total' },
]

function won(n) {
  return '₩' + n.toLocaleString('ko-KR')
}
function initial(name) {
  return name.charAt(0).toUpperCase()
}
function statusClass(s) {
  return { Paid: 's-paid', Delivered: 's-delivered', Completed: 's-completed' }[s]
}
function statusLabel(s) {
  return { Paid: '결제완료', Delivered: '배송', Completed: '완료' }[s]
}

const AVA = ['#f6b48f', '#a3c4f3', '#9ee0bd', '#f7bdd8', '#c9bdf2', '#f5cf7a', '#9ad7d0']

// 상품 풀
const P = [
  { name: 'Ryobi ONE 드릴/드라이버', price: 409000, icon: 'handyman' },
  { name: 'Socket Systeme Electric', price: 238000, icon: 'power' },
  { name: 'DVB-T2 리시버 bbk', price: 139000, icon: 'router' },
  { name: 'Inforce 오일프리 컴프레서', price: 135000, icon: 'mode_fan' },
  { name: 'TIG-200 용접 인버터', price: 699000, icon: 'bolt' },
  { name: '마끼다 임팩 드릴', price: 520000, icon: 'construction' },
  { name: '보쉬 앵글 그라인더', price: 187000, icon: 'build' },
  { name: '디월트 레이저 측정기', price: 96000, icon: 'straighten' },
]

// 주문 목록(임시) — total은 items 합계로 계산
const NAMES = [
  'Michelle Black', 'Janice Chandler', 'Mildred Hall', 'Ana Carter', 'John Sherman',
  'James Miller', 'Travis French', 'Ralph Hall', 'Gary Gilbert', 'Frances Howell',
  'Herbert Boyd', 'Alan White', 'Julie Martin', 'Emma Lewis', 'Oscar Reed',
  'Nina Patel', 'Leo Turner', 'Grace Kim', 'Victor Ross', 'Diana Park',
  'Henry Cole', 'Olivia Shaw', 'Marcus Bell', 'Sofia Nguyen', 'Ethan Wood',
  'Chloe Adams', 'Liam Foster', 'Maya Diaz', 'Noah Price', 'Ivy Bennett',
]
const STATUSES = ['Paid', 'Delivered', 'Completed']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad2 = (n) => String(n).padStart(2, '0')
const randInt = (n) => Math.floor(Math.random() * n)
const pick = (arr) => arr[randInt(arr.length)]

const usedIds = new Set()
function uniqueId() {
  let id
  do {
    id = String(100000 + randInt(900000)) // 6자리
  } while (usedIds.has(id))
  usedIds.add(id)
  return id
}

// 무작위 100건 생성
const RAW = Array.from({ length: 100 }, () => {
  // 상품 1~4개 무작위(중복 없이)
  const pool = [...Array(P.length).keys()]
  const count = 1 + randInt(Math.min(4, pool.length))
  const it = []
  for (let k = 0; k < count; k++) it.push(pool.splice(randInt(pool.length), 1)[0])
  return {
    id: uniqueId(),
    name: pick(NAMES),
    status: pick(STATUSES),
    date: `${pick(MONTHS)} ${1 + randInt(28)}`,
    time: `${pad2(randInt(24))}:${pad2(randInt(60))}`,
    it,
  }
})

const orders = RAW.map((o, idx) => {
  const items = o.it.map((i) => P[i])
  return {
    ...o,
    color: AVA[idx % AVA.length],
    items,
    total: items.reduce((a, it) => a + it.price, 0),
  }
})

const statusFilter = ref('all')
const range = ref('all')
const sort = ref('date')

// 적용된 필터 개수(모바일 필터 버튼 배지) — 정렬은 제외
const activeFilterCount = computed(
  () => (statusFilter.value !== 'all' ? 1 : 0) + (range.value !== 'all' ? 1 : 0)
)
function resetFilters() {
  statusFilter.value = 'all'
  range.value = 'all'
}
const activeId = ref(null) // row 클릭 시 상세 패널 활성
const selectedIds = ref([]) // Checkbox 배열 v-model

const viewOrders = computed(() => {
  let list = orders
  if (statusFilter.value !== 'all') list = list.filter((o) => o.status === statusFilter.value)
  if (range.value === 'lo') list = list.filter((o) => o.total < 500000)
  else if (range.value === 'mid') list = list.filter((o) => o.total >= 500000 && o.total < 1500000)
  else if (range.value === 'hi') list = list.filter((o) => o.total >= 1500000)
  if (sort.value === 'total') list = [...list].sort((a, b) => b.total - a.total)
  return list
})

// 페이징 — 페이지당 행 수는 ord-body 높이에 맞춰 동적 계산
const ROW_H = 56 // .ord-data 행 높이(px)
const bodyRef = ref(null)
const page = ref(1)
const pageSize = ref(1)
const pagedOrders = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return viewOrders.value.slice(start, start + pageSize.value)
})

// ord-body 가용 높이 ÷ 행 높이 = 한 페이지에 들어갈 행 수
function recalcPageSize() {
  const el = bodyRef.value
  if (!el) return
  const rowH = el.querySelector('.ord-data')?.offsetHeight || ROW_H
  const fit = Math.floor(el.clientHeight / rowH)
  pageSize.value = Math.max(1, fit)
}

let ro = null
onMounted(() => {
  nextTick(recalcPageSize)
  if (typeof ResizeObserver !== 'undefined' && bodyRef.value) {
    ro = new ResizeObserver(recalcPageSize)
    ro.observe(bodyRef.value)
  } else {
    window.addEventListener('resize', recalcPageSize)
  }
})
onBeforeUnmount(() => {
  if (ro) ro.disconnect()
  else window.removeEventListener('resize', recalcPageSize)
})

// 필터/정렬이 바뀌면 1페이지로
watch([statusFilter, range, sort], () => {
  page.value = 1
})

const detail = computed(() => orders.find((o) => o.id === activeId.value) || null)

// 전체 선택(현재 보이는 목록 기준) + indeterminate
const viewIds = computed(() => viewOrders.value.map((o) => o.id))
const allChecked = computed(() => viewIds.value.length > 0 && viewIds.value.every((id) => selectedIds.value.includes(id)))
const someChecked = computed(() => viewIds.value.some((id) => selectedIds.value.includes(id)))
function toggleAll() {
  if (allChecked.value) {
    selectedIds.value = selectedIds.value.filter((id) => !viewIds.value.includes(id))
  } else {
    selectedIds.value = [...new Set([...selectedIds.value, ...viewIds.value])]
  }
}
</script>

<style scoped>
.orders {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}


/* 레이아웃 */
.ord-grid {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 16px;
}

/* 테이블 카드 */
.ord-table {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 6px 6px 6px;
  overflow: hidden;
}
.ord-row {
  display: grid;
  grid-template-columns: 40px 96px 1.4fr 110px 120px 80px 40px;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
}
.ord-head {
  height: 40px;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  border-bottom: 1px solid var(--line);
}
.ord-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
/* 페이지네이션 푸터 — 카드 하단 고정(본문만 스크롤) */
.ord-foot {
  flex-shrink: 0;
  padding: 10px 10px 4px;
  border-top: 1px solid var(--line);
}
.ord-data {
  height: 56px;
  border-radius: 12px;
  font-size: 13.5px;
  color: var(--text);
  cursor: pointer;
  transition: background 0.12s;
}
.ord-data:hover { background: rgba(0, 0, 0, 0.03); }
.ord-data.active { background: rgba(242, 226, 78, 0.16); }

/* 체크박스 셀 정렬 (체크박스는 Checkbox 컴포넌트) */
.oc-check :deep(.base-checkbox) { padding: 0; }

/* 셀 */
.oc-cust { display: flex; align-items: center; gap: 9px; min-width: 0; }
.cust-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.oc-total { font-weight: 600; font-variant-numeric: tabular-nums; }
.oc-date { color: var(--muted); font-variant-numeric: tabular-nums; }
.oc-more { display: flex; justify-content: flex-end; }
.ord-more-btn {
  display: inline-flex;
  width: 28px; height: 28px;
  align-items: center; justify-content: center;
  border: 0; border-radius: 8px; background: transparent;
  color: var(--muted); cursor: pointer;
}
.ord-more-btn:hover { background: rgba(0, 0, 0, 0.05); color: var(--text); }

.avatar-sm {
  flex-shrink: 0;
  width: 28px; height: 28px;
  border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #3a2c00;
}

/* 상태 배지 */
.ord-badge {
  display: inline-block;
  font-size: 12px; font-weight: 700;
  padding: 4px 11px; border-radius: 999px;
}
.s-paid { background: #f0efe8; color: #6b6d75; }
.s-delivered { background: rgba(240, 150, 90, 0.18); color: #c9692e; }
.s-completed { background: rgba(34, 197, 94, 0.16); color: #16a34a; }

@media (max-width: 1000px) {
  .ord-grid { flex-direction: column; }
}

/* 모바일: 테이블 핵심 컬럼만(고객·상태·금액) */
@media (max-width: 640px) {

  .ord-row {
    grid-template-columns: 1fr auto auto;
    gap: 10px;
  }
  .oc-check,
  .oc-id,
  .oc-date,
  .oc-more { display: none; }

  .ord-data { height: 52px; }
}
</style>
