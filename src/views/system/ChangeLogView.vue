<template>
  <div class="page-col">
    <!-- Filter -->
    <FilterBar title="이력 필터" :count="activeFilterCount" @reset="resetFilters">
      <Select v-model="actionFilter" :options="actionOptions" :style="{ width: '150px' }" />
      <Select v-model="targetFilter" :options="targetOptions" :style="{ width: '170px' }" />
      <template #trailing>
        <Select v-model="sort" :options="sortOptions" :style="{ width: '130px' }" />
      </template>
    </FilterBar>
    <!-- Table -->
    <DataTable :rows="viewRows"
               empty-icon="searsch_off"
               empty-title="조건에 맞는 이력이 없습니다."
               empty-description="필터를 변경하거나 초기화해 보세요."
    >
      <!-- Header -->
      <template #head>
        <div class="dt-head dt-row">
          <span class="lc-action">작업</span>
          <span class="lc-target">대상</span>
          <span class="lc-detail">내용</span>
          <span class="lc-user">사용자</span>
          <span class="lc-time">일시</span>
        </div>
      </template>

      <!-- Body -->
      <template #default="{ rows }">
        <div v-for="r in rows" :key="r.id" class="dt-row dt-data">
          <span class="lc-action">
            <Badge :tone="r.action.tone">{{ r.action.label }}</Badge>
          </span>
          <span class="lc-target truncate">{{ r.target }}</span>
          <span class="lc-detail truncate" :title="r.detail">{{ r.detail }}</span>
          <span class="lc-user cell-media">
            <Avatar :name="r.user" :color="r.color" :size="26" />
            <span class="truncate">{{ r.user }}</span>
          </span>
          <span class="lc-time tnum">{{ r.datetime }}</span>
        </div>
      </template>
      <!-- No Data -->
      <template #empty-action>
        <Button variant="outline" size="sm" icon="restart_alt" @click="resetFilters">필터 초기화</Button>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Select from '../../components/ui/Select.vue'
import Button from '../../components/ui/Button.vue'
import Badge from '../../components/ui/Badge.vue'
import Avatar from '../../components/ui/Avatar.vue'
import FilterBar from '../../components/data/FilterBar.vue'
import DataTable from '../../components/data/DataTable.vue'

const ACTIONS = [
  { key: 'create', label: '추가', tone: 'green' },
  { key: 'update', label: '수정', tone: 'blue' },
  { key: 'delete', label: '삭제', tone: 'red' },
  { key: 'upload', label: '업로드', tone: 'purple' },
]
const TARGETS = [
  '주문 내역', '재고 현황', '재료 마스터', '메뉴 관리', '코스·세트',
  '매출 입력', '발주 관리', '레시피/소요량', '직원 계정', '쿠폰·프로모션',
  '매장 기본 정보', '결제·정산',
]
const USERS = ['이현', '김민서', '박지우', '최유나', '정우성', '한서연', '오태경']
const AVA = ['#f6b48f', '#a3c4f3', '#9ee0bd', '#f7bdd8', '#c9bdf2', '#f5cf7a', '#9ad7d0']

const pad2 = (n) => String(n).padStart(2, '0')
const randInt = (n) => Math.floor(Math.random() * n)
const pick = (arr) => arr[randInt(arr.length)]

function detailOf(action, target) {
  switch (action.key) {
    case 'create': return `${target}에 새 항목 등록`
    case 'update': return `${target} 항목 정보 수정`
    case 'delete': return `${target} 항목 삭제`
    case 'upload': return `${target} 엑셀 일괄 업로드 (${1 + randInt(80)}건)`
    default: return target
  }
}

const rows = Array.from({ length: 100 }, (_, i) => {
  const action = pick(ACTIONS)
  const target = pick(TARGETS)
  const ui = randInt(USERS.length)
  const month = 1 + randInt(6)
  const day = 1 + randInt(28)
  const hh = randInt(24)
  const mm = randInt(60)
  return {
    id: i + 1,
    action,
    target,
    user: USERS[ui],
    color: AVA[ui % AVA.length],
    datetime: `2026-${pad2(month)}-${pad2(day)} ${pad2(hh)}:${pad2(mm)}`,
    sortKey: ((month * 100 + day) * 100 + hh) * 100 + mm,
    detail: detailOf(action, target),
  }
})

const actionOptions = [{ label: '전체 작업', value: 'all' }, ...ACTIONS.map((a) => ({ label: a.label, value: a.key }))]
const targetOptions = [{ label: '전체 대상', value: 'all' }, ...TARGETS.map((t) => ({ label: t, value: t }))]
const sortOptions = [
  { label: '최신순', value: 'desc' },
  { label: '오래된순', value: 'asc' },
]
const actionFilter = ref('all')
const targetFilter = ref('all')
const sort = ref('desc')

const activeFilterCount = computed(
  () => (actionFilter.value !== 'all' ? 1 : 0) + (targetFilter.value !== 'all' ? 1 : 0)
)
function resetFilters() {
  actionFilter.value = 'all'
  targetFilter.value = 'all'
}

const viewRows = computed(() => {
  let list = rows
  if (actionFilter.value !== 'all') list = list.filter((r) => r.action.key === actionFilter.value)
  if (targetFilter.value !== 'all') list = list.filter((r) => r.target === targetFilter.value)
  const dir = sort.value === 'asc' ? 1 : -1
  return [...list].sort((a, b) => (a.sortKey - b.sortKey) * dir)
})

</script>

<style lang="scss" scoped>
.dt-row {
  grid-template-columns: 84px 150px minmax(220px, 1fr) 130px 150px;
  min-width: 760px;
}

.lc-time { color: var(--muted); }
.lc-detail { color: var(--muted); }

@media (max-width: 900px) {
  .dt-row {
    grid-template-columns: 140px 120px 80px 1fr;
    min-width: 0;
  }
  .lc-target { display: none; }
}

@media (max-width: 640px) {
  .dt-row {
    grid-template-columns: auto 1fr;
    gap: 10px;
  }
  .lc-time,
  .lc-user { display: none; }
  .dt-data { height: 50px; }
}
</style>
