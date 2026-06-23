<template>
  <div class="logs">
    <!-- 필터/정렬 툴바 (공통 FilterBar: 모바일은 필터 버튼 + 바텀시트) -->
    <FilterBar title="이력 필터" :count="activeFilterCount" @reset="resetFilters">
      <Select v-model="actionFilter" :options="actionOptions" :style="{ width: '150px' }" />
      <Select v-model="targetFilter" :options="targetOptions" :style="{ width: '170px' }" />
      <template #trailing>
        <Select v-model="sort" :options="sortOptions" :style="{ width: '130px' }" />
      </template>
    </FilterBar>

    <!-- 테이블 -->
    <div class="log-table card">
      <!-- 헤더 + 본문 단일 스크롤 → 내용이 넓으면 가로 스크롤(헤더 sticky) -->
      <div ref="bodyRef" class="log-scroll">
        <div class="log-head log-row">
          <span class="lc-time">일시</span>
          <span class="lc-user">사용자</span>
          <span class="lc-target">대상</span>
          <span class="lc-action">작업</span>
          <span class="lc-detail">내용</span>
        </div>

        <div v-for="r in pagedRows" :key="r.id" class="log-row log-data">
          <span class="lc-time">{{ r.datetime }}</span>
          <span class="lc-user">
            <span class="avatar-sm" :style="{ background: r.color }">{{ r.user.charAt(0) }}</span>
            <span class="user-name">{{ r.user }}</span>
          </span>
          <span class="lc-target">{{ r.target }}</span>
          <span class="lc-action">
            <span class="log-badge" :class="r.action.cls">{{ r.action.label }}</span>
          </span>
          <span class="lc-detail" :title="r.detail">{{ r.detail }}</span>
        </div>

        <div v-if="!viewRows.length" class="log-empty">조건에 맞는 이력이 없습니다.</div>
      </div>

      <!-- 페이지네이션(테이블 카드 하단 고정) -->
      <div class="log-foot">
        <Pagination v-model="page" :total="viewRows.length" :page-size="pageSize" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Select from '../../components/ui/Select.vue'
import FilterBar from '../../components/data/FilterBar.vue'
import Pagination from '../../components/data/Pagination.vue'

// 작업 유형 정의(배지 색)
const ACTIONS = [
  { key: 'create', label: '추가', cls: 'a-create' },
  { key: 'update', label: '수정', cls: 'a-update' },
  { key: 'delete', label: '삭제', cls: 'a-delete' },
  { key: 'upload', label: '업로드', cls: 'a-upload' },
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

// 무작위 100건 생성
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

// 필터/정렬
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

// 페이징 — 페이지당 행 수는 본문 높이에 맞춰 동적 계산
const ROW_H = 52
const bodyRef = ref(null)
const page = ref(1)
const pageSize = ref(1)
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return viewRows.value.slice(start, start + pageSize.value)
})

function recalcPageSize() {
  const el = bodyRef.value
  if (!el) return
  const headH = el.querySelector('.log-head')?.offsetHeight || 40
  const rowH = el.querySelector('.log-data')?.offsetHeight || ROW_H
  const fit = Math.floor((el.clientHeight - headH) / rowH)
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
watch([actionFilter, targetFilter, sort], () => {
  page.value = 1
})
</script>

<style scoped>
.logs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 테이블 카드 */
.log-table {
  flex: 1;
  min-width: 0;
  min-height: 0; /* 컬럼 플렉스에서 내부 스크롤이 정상 동작하도록 */
  display: flex;
  flex-direction: column;
  padding: 6px 6px 6px;
  overflow: hidden;
}
.log-row {
  display: grid;
  grid-template-columns: 150px 130px 150px 84px minmax(220px, 1fr);
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  min-width: 760px; /* 이보다 좁아지면 가로 스크롤 */
}
.log-head {
  position: sticky;
  top: 0;
  z-index: 1;
  height: 40px;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  background: var(--card);
  border-bottom: 1px solid var(--line);
}
/* 헤더 + 본문 단일 스크롤 영역 — 세로/가로 모두 스크롤 */
.log-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
/* 페이지네이션 푸터 — 카드 하단 고정(본문만 스크롤) */
.log-foot {
  flex-shrink: 0;
  padding: 10px 10px 4px;
  border-top: 1px solid var(--line);
}
.log-data {
  height: 52px;
  border-radius: 12px;
  font-size: 13px;
  color: var(--text);
}
.log-data:hover { background: rgba(0, 0, 0, 0.03); }

/* 셀 */
.lc-time { color: var(--muted); font-variant-numeric: tabular-nums; }
.lc-user { display: flex; align-items: center; gap: 8px; min-width: 0; }
.user-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lc-target { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lc-detail { color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.avatar-sm {
  flex-shrink: 0;
  width: 26px; height: 26px;
  border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #3a2c00;
}

.log-empty {
  padding: 40px 10px;
  text-align: center;
  font-size: 13px;
  color: var(--muted);
}

/* 작업 배지 */
.log-badge {
  display: inline-block;
  font-size: 12px; font-weight: 700;
  padding: 4px 11px; border-radius: 999px;
}
.a-create { background: rgba(34, 197, 94, 0.16); color: #16a34a; }
.a-update { background: rgba(59, 130, 246, 0.16); color: #2563eb; }
.a-delete { background: rgba(239, 68, 68, 0.16); color: #dc2626; }
.a-upload { background: rgba(139, 92, 246, 0.16); color: #7c3aed; }

/* 태블릿: 내용 컬럼 축소 위해 대상 숨김 (가로 스크롤 없이 맞춤) */
@media (max-width: 900px) {
  .log-row {
    grid-template-columns: 140px 120px 80px 1fr;
    min-width: 0;
  }
  .lc-target { display: none; }
}

/* 모바일: 핵심 컬럼만(작업 · 내용) + 일시는 보조 표시 */
@media (max-width: 640px) {
  .log-row {
    grid-template-columns: auto 1fr;
    gap: 10px;
  }
  .lc-time,
  .lc-user { display: none; }
  .log-data { height: 50px; }
}
</style>
