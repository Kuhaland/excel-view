<template>
  <div class="page-col">
    <!-- Filter -->
    <FilterBar title="주문 필터" :count="activeFilterCount" @reset="resetFilters">
      <Select v-model="statusFilter" :options="statusOptions" :style="{ width: '150px' }" />
      <Select v-model="range" :options="rangeOptions" :style="{ width: '170px' }" />
      <template #trailing>
        <Select v-model="sort" :options="sortOptions" :style="{ width: '130px' }" />
      </template>
    </FilterBar>
    <!-- Table -->
    <DataTable :rows="viewOrders"
               :empty-icon="activeFilterCount ? 'search_off' : 'receipt_long'"
               :empty-title="activeFilterCount ? '조건에 맞는 주문이 없습니다.' : '주문 내역이 없습니다.'"
               :empty-description="activeFilterCount ? '필터를 변경하거나 초기화해 보세요.' : ''"
               split
    >
      <!-- Header -->
      <template #head>
        <div class="dt-head dt-row">
          <span class="oc-check">
            <Checkbox :model-value="allChecked"
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
      </template>
      <!-- Body -->
      <template #default="{ rows }">
        <div v-for="o in rows"
             :key="o.id"
             class="dt-row dt-data clickable"
             :class="{ active: o.id === activeId }"
             @click="activeId = o.id"
        >
          <span class="oc-check" @click.stop>
            <Checkbox v-model="selectedIds" :value="o.id" />
          </span>
          <span class="oc-id">#{{ o.id }}</span>
          <span class="oc-cust cell-media">
            <Avatar :name="o.name" :color="o.color" :size="28" />
            <span class="truncate">{{ o.name }}</span>
          </span>
          <span class="oc-status">
            <Badge :tone="statusTone(o.status)">{{ statusLabel(o.status) }}</Badge>
          </span>
          <span class="oc-total tnum">{{ won(o.total) }}</span>
          <span class="oc-date tnum">{{ o.date }}</span>
          <span class="oc-more">
            <button class="ghost-icon-btn" @click.stop aria-label="더보기">
              <span class="material-symbols-outlined">more_horiz</span>
            </button>
          </span>
        </div>
      </template>
      <!-- No Data -->
      <template v-if="activeFilterCount" #empty-action>
        <Button variant="outline" size="sm" icon="restart_alt" @click="resetFilters">필터 초기화</Button>
      </template>
      <!-- Slide Panel -->
      <template #panel>
        <OrderDetailPanel v-if="detail" :order="detail" @close="activeId = null" />
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import OrderDetailPanel from './OrderDetailPanel.vue'
import Checkbox from '../../components/ui/Checkbox.vue'
import Select from '../../components/ui/Select.vue'
import Button from '../../components/ui/Button.vue'
import Badge from '../../components/ui/Badge.vue'
import Avatar from '../../components/ui/Avatar.vue'
import FilterBar from '../../components/data/FilterBar.vue'
import DataTable from '../../components/data/DataTable.vue'

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
function statusTone(s) {
  return { Paid: 'gray', Delivered: 'orange', Completed: 'green' }[s]
}
function statusLabel(s) {
  return { Paid: '결제완료', Delivered: '배송', Completed: '완료' }[s]
}

const AVA = ['#f6b48f', '#a3c4f3', '#9ee0bd', '#f7bdd8', '#c9bdf2', '#f5cf7a', '#9ad7d0']

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

const NAMES = [
  'Michelle Black', 'Janice Chandler', 'Mildred Hall', 'Ana Carter', 'John Sherman',
  'James Miller', 'Travis French', 'Ralph Hall', 'Gary Gilbert', 'Frances Howell',
  'Herbert Boyd', 'Alan White', 'Julie Martin', 'Emma Lewis', 'Oscar Reed',
  'Nina Patel', 'Leo Turner', 'Grace Kim', 'Victor Ross', 'Diana Park',
  'Henry Cole', 'Olivia Shaw', 'Marcus Bell', 'Sofia Nguyen', 'Ethan Wood',
  'Chloe Adams', 'Liam Foster', 'Maya Diaz', 'Noah Price', 'Ivy Bennett',
]
const STATUSES = ['Paid', 'Delivered', 'Completed']

const pad2 = (n) => String(n).padStart(2, '0')
const randInt = (n) => Math.floor(Math.random() * n)
const pick = (arr) => arr[randInt(arr.length)]

const usedIds = new Set()
function uniqueId() {
  let id
  do {
    id = String(100000 + randInt(900000))
  } while (usedIds.has(id))
  usedIds.add(id)
  return id
}

const RAW = Array.from({ length: 100 }, () => {
  const pool = [...Array(P.length).keys()]
  const count = 1 + randInt(Math.min(4, pool.length))
  const it = []
  for (let k = 0; k < count; k++) it.push(pool.splice(randInt(pool.length), 1)[0])
  return {
    id: uniqueId(),
    name: pick(NAMES),
    status: pick(STATUSES),
    date: `2026-${pad2(1 + randInt(12))}-${pad2(1 + randInt(28))}`,
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

const activeFilterCount = computed(
  () => (statusFilter.value !== 'all' ? 1 : 0) + (range.value !== 'all' ? 1 : 0)
)
function resetFilters() {
  statusFilter.value = 'all'
  range.value = 'all'
}
const activeId = ref(null)
const selectedIds = ref([])

const viewOrders = computed(() => {
  let list = orders
  if (statusFilter.value !== 'all') list = list.filter((o) => o.status === statusFilter.value)
  if (range.value === 'lo') list = list.filter((o) => o.total < 500000)
  else if (range.value === 'mid') list = list.filter((o) => o.total >= 500000 && o.total < 1500000)
  else if (range.value === 'hi') list = list.filter((o) => o.total >= 1500000)
  if (sort.value === 'total') list = [...list].sort((a, b) => b.total - a.total)
  return list
})

const detail = computed(() => orders.find((o) => o.id === activeId.value) || null)

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

<style lang="scss" scoped>
.dt-row {
  grid-template-columns: 40px 96px minmax(180px, 1.4fr) 110px 120px 80px 40px;
  min-width: 720px;
}

.oc-check :deep(.base-checkbox) { padding: 0; }
.oc-total { font-weight: 600; }
.oc-date { color: var(--muted); }
.oc-more { display: flex; justify-content: flex-end; }

@media (max-width: 640px) {
  .dt-row {
    grid-template-columns: 1fr auto auto;
    gap: 10px;
    min-width: 0;
  }
  .oc-check,
  .oc-id,
  .oc-date,
  .oc-more { display: none; }

  .dt-data { height: 52px; }
}
</style>
