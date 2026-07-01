<template>
  <PageLayout class="order-manage">
    <!-- 조회 조건 (좌: 기간·검색 / 우: 요약 지표) -->
    <template #filter>
      <div class="omf-left">
        <div class="omf-field">
          <span class="omf-label">조회 기간</span>
          <div class="omf-period">
            <div class="seg">
              <button
                v-for="p in PRESETS"
                :key="p.id"
                type="button"
                class="seg-btn"
                :class="{ on: preset === p.id }"
                @click="applyPreset(p.id)"
              >{{ p.label }}</button>
              <button type="button" class="seg-btn" :class="{ on: preset === 'custom' }" @click="preset = 'custom'">직접 선택</button>
            </div>
            <div class="date-range">
              <input class="date-input" type="date" v-model="rangeStart" :max="rangeEnd || undefined" @change="onDateEdit" />
              <span class="date-sep">~</span>
              <input class="date-input" type="date" v-model="rangeEnd" :min="rangeStart || undefined" @change="onDateEdit" />
            </div>
          </div>
        </div>
        <div class="omf-field omf-search-field">
          <span class="omf-label">검색</span>
          <div class="search om-search">
            <span class="material-symbols-outlined">search</span>
            <input v-model="search" type="text" placeholder="주문번호·이름·아이디·전화 검색" />
          </div>
        </div>
      </div>

      <!-- 요약 지표 (선택 기간 기준) -->
      <div class="omf-stats">
        <div class="omf-stat">
          <span class="omf-stat-lab">진행 주문</span>
          <span class="omf-stat-val">{{ progressCount }}건</span>
        </div>
        <div class="omf-stat">
          <span class="omf-stat-lab">주방 대기</span>
          <span class="omf-stat-val">{{ kitchenCount }}건</span>
        </div>
        <div class="omf-stat">
          <span class="omf-stat-lab">완료 매출</span>
          <span class="omf-stat-val accent">{{ won(doneSales) }}</span>
        </div>
      </div>
    </template>

    <!-- 툴바: 상태 필터 탭(선택 기간 기준 개수) / 엑셀 등록 -->
    <template #toolbar>
      <div class="tabs om-tabs">
        <button
          v-for="t in statusTabs"
          :key="t.value"
          type="button"
          class="tab"
          :class="{ active: statusFilter === t.value }"
          @click="statusFilter = t.value"
        >
          {{ t.label }}<span class="om-tab-count">{{ t.count }}</span>
        </button>
      </div>
    </template>
    <template #actions>
      <Button variant="primary" size="sm" icon="edit_note" @click="openAdd">내역 추가</Button>
      <Button variant="outline" size="sm" icon="download" @click="downloadSample">샘플 양식</Button>
      <Button variant="dark" size="sm" icon="upload_file" @click="pickExcel">엑셀로 등록</Button>
    </template>

    <!-- 엑셀 업로드용 숨김 입력 -->
    <input ref="excelInput" type="file" accept=".xlsx,.xls,.csv" hidden @change="onExcelPick" />

    <!-- 리스트 -->
    <DataTable
      :rows="viewOrders"
      split
      :empty-icon="isFiltering ? 'search_off' : 'receipt_long'"
      :empty-title="isFiltering ? '조건에 맞는 주문이 없습니다.' : '주문이 없습니다.'"
      :empty-description="isFiltering ? '필터나 검색어를 변경해 보세요.' : ''"
    >
      <!-- Header -->
      <template #head>
        <div class="dt-head dt-row">
          <span class="oc-id">주문번호</span>
          <span class="oc-cust">주문자</span>
          <span class="oc-items">주문 항목</span>
          <span class="oc-pay">금액 · 결제</span>
          <span class="oc-status">상태</span>
        </div>
      </template>

      <!-- Body -->
      <template #default="{ rows }">
        <div
          v-for="o in rows"
          :key="o.id"
          class="dt-row dt-data clickable"
          :class="{ active: o.id === activeId, online: CHANNEL[o.channel].online }"
          @click="onSelect(o.id)"
        >
          <span class="oc-id">
            <span class="oc-no">#{{ o.id }}</span>
            <span class="oc-time tnum">{{ o.date.slice(5) }} {{ o.time }}</span>
          </span>
          <span class="oc-cust">
            <span class="oc-rep truncate">{{ repName(o) }}</span>
            <span class="oc-meta">
              <Badge :tone="CHANNEL[o.channel].tone">{{ o.channel }}</Badge>
              <span class="oc-sub" :class="{ member: CHANNEL[o.channel].online }">{{ repSub(o) }}</span>
            </span>
          </span>
          <span class="oc-items truncate">{{ itemsSummary(o) }}</span>
          <span class="oc-pay">
            <span class="oc-amt tnum">{{ won(orderTotal(o)) }}</span>
            <span class="oc-method">{{ payLabel(o) }}</span>
          </span>
          <span class="oc-status">
            <Badge :tone="STATUS[o.status].tone">{{ STATUS[o.status].label }}</Badge>
          </span>
        </div>
      </template>

      <!-- No Data -->
      <template v-if="isFiltering" #empty-action>
        <Button variant="outline" size="sm" icon="restart_alt" @click="resetFilters">필터 초기화</Button>
      </template>

      <!-- 슬라이드 패널: 수기 등록 / 상세 -->
      <template #panel>
        <OrderCreatePanel
          v-if="adding"
          @close="adding = false"
          @submit="createOrder"
          @invalid="flash"
        />
        <OrderManageDetail
          v-else-if="detail"
          :order="detail"
          @close="activeId = null"
          @advance="onAdvance"
          @cancel="onCancel"
        />
      </template>
    </DataTable>

    <!-- 안내 토스트 -->
    <Toast v-model="toastShow" :message="toastMsg" />
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ExcelJS from 'exceljs'
import OrderManageDetail from './OrderManageDetail.vue'
import OrderCreatePanel from './OrderCreatePanel.vue'
import Badge from '../../components/ui/Badge.vue'
import Button from '../../components/ui/Button.vue'
import DataTable from '../../components/data/DataTable.vue'
import Toast from '../../components/overlay/Toast.vue'
import PageLayout from '../../components/layout/PageLayout.vue'
import { parseWorkbook } from '../../excel.js'
import {
  STATUS, STATUS_ORDER, STATUS_BY_LABEL, CHANNEL, CARD_BRANDS, PROGRESS_STATUSES, KITCHEN_STATUSES,
  won, orderTotal, repName, repSub, itemsSummary, payLabel,
} from './orderMeta.js'

// 안내 토스트
const toastShow = ref(false)
const toastMsg = ref('')
function flash(msg) {
  toastMsg.value = msg
  toastShow.value = true
}

// ───────────────────────────────────────────────────────────────────────────
// 데이터 연동 지점 — 현재는 목(mock). 실제 서버 연동 시 아래 두 함수만 교체하면 된다.
// ───────────────────────────────────────────────────────────────────────────
const orders = ref([])

// TODO: 실제 주문 목록 조회 API로 교체
//   예) const res = await fetch('/api/orders'); return res.json()
async function fetchOrders() {
  return generateMockOrders()
}

// TODO: 실제 주문 상태 변경 API로 교체
//   예) await fetch(`/api/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
async function updateOrderStatus(id, status) {
  const o = orders.value.find((x) => x.id === id)
  if (o) o.status = status // 목: 로컬 상태 즉시 반영(낙관적 갱신) → 목록/요약/상세 실시간 갱신
}

onMounted(async () => {
  orders.value = await fetchOrders()
})

// ── 필터/검색 상태 ──────────────────────────────────────────────────────────
const search = ref('')
const statusFilter = ref('all')
const activeId = ref(null)
const adding = ref(false) // 수기 등록 패널 표시 여부

// 수기 등록 패널 열기 / 행 선택(등록 패널 닫고 상세)
function openAdd() { activeId.value = null; adding.value = true }
function onSelect(id) { adding.value = false; activeId.value = id }

// ── 조회 기간(date range) ────────────────────────────────────────────────────
const PRESETS = [
  { id: 'today', label: '오늘' },
  { id: 'yesterday', label: '어제' },
  { id: '7d', label: '최근 7일' },
  { id: 'month', label: '이번 달' },
]
const rangeStart = ref('') // 'YYYY-MM-DD'
const rangeEnd = ref('')
const preset = ref('today')

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function daysAgo(n) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d
}
function applyPreset(id) {
  preset.value = id
  const today = new Date(); today.setHours(0, 0, 0, 0)
  if (id === 'today') { rangeStart.value = ymd(today); rangeEnd.value = ymd(today) }
  else if (id === 'yesterday') { const y = daysAgo(1); rangeStart.value = ymd(y); rangeEnd.value = ymd(y) }
  else if (id === '7d') { rangeStart.value = ymd(daysAgo(6)); rangeEnd.value = ymd(today) } // 오늘 포함 7일
  else if (id === 'month') { rangeStart.value = ymd(new Date(today.getFullYear(), today.getMonth(), 1)); rangeEnd.value = ymd(today) }
}
// 날짜를 직접 수정하면 프리셋을 "직접 선택"으로 전환
function onDateEdit() { preset.value = 'custom' }
applyPreset('today') // 기본: 오늘

// 조회 순서 1) 기간 — 이후 요약/탭/목록 집계의 기준 집합
const periodOrders = computed(() => {
  const s = rangeStart.value
  const e = rangeEnd.value
  return orders.value.filter((o) => (!s || o.date >= s) && (!e || o.date <= e))
})

const isFiltering = computed(() => statusFilter.value !== 'all' || !!search.value.trim())

// 상태 탭(선택 기간 기준 각 개수)
const statusTabs = computed(() => [
  { value: 'all', label: '전체', count: periodOrders.value.length },
  ...STATUS_ORDER.map((k) => ({
    value: k,
    label: STATUS[k].label,
    count: periodOrders.value.filter((o) => o.status === k).length,
  })),
])

// 상단 요약(선택 기간 기준)
const progressCount = computed(() => periodOrders.value.filter((o) => PROGRESS_STATUSES.includes(o.status)).length)
const kitchenCount = computed(() => periodOrders.value.filter((o) => KITCHEN_STATUSES.includes(o.status)).length)
const doneSales = computed(() =>
  periodOrders.value.filter((o) => o.status === 'done').reduce((s, o) => s + orderTotal(o), 0)
)

// 목록: 조회 순서 2) 상태 필터 → 3) 검색
const viewOrders = computed(() => {
  let list = periodOrders.value
  if (statusFilter.value !== 'all') list = list.filter((o) => o.status === statusFilter.value)

  const q = search.value.trim().toLowerCase()
  if (q) {
    const qDigits = q.replace(/\D/g, '')
    list = list.filter((o) =>
      o.id.toLowerCase().includes(q) ||
      (o.name && o.name.toLowerCase().includes(q)) ||
      (o.account && o.account.toLowerCase().includes(q)) ||
      (qDigits && o.phone && o.phone.replace(/\D/g, '').includes(qDigits))
    )
  }
  return list
})

const detail = computed(() => orders.value.find((o) => o.id === activeId.value) || null)

function resetFilters() {
  statusFilter.value = 'all'
  search.value = ''
}

// 상태 변경(상세 패널 → 실시간 갱신)
function onAdvance(id) {
  const o = orders.value.find((x) => x.id === id)
  const next = o && STATUS[o.status].next
  if (next) updateOrderStatus(id, next)
}
function onCancel(id) {
  updateOrderStatus(id, 'canceled')
}

// TODO: 실제 서비스라면 수기 등록분을 서버 등록 API로 전송 후 목록 재조회
function createOrder(o) {
  o.id = uniqueId()
  orders.value.unshift(o)
  // 등록분이 보이도록 조회 기간 확장 + 필터 초기화
  if (o.date) {
    if (!rangeStart.value || o.date < rangeStart.value) rangeStart.value = o.date
    if (!rangeEnd.value || o.date > rangeEnd.value) rangeEnd.value = o.date
    preset.value = 'custom'
  }
  statusFilter.value = 'all'
  search.value = ''
  adding.value = false
  activeId.value = o.id // 등록 직후 해당 주문 상세 표시
  flash('주문을 등록했습니다.')
}

// ── 엑셀로 리스트 등록 ───────────────────────────────────────────────────────
const excelInput = ref(null)
function pickExcel() { excelInput.value?.click() }
function onExcelPick(e) {
  const f = e.target.files?.[0]
  if (f) importExcel(f)
  e.target.value = '' // 같은 파일 재선택 허용
}

// 주문항목 셀 파싱: "한우 샤브샤브 (2인) x1 @39000; 공깃밥 x2 @1000"
function parseItems(s) {
  if (!s) return []
  return s
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const m = /^(.*?)\s*[x×*]\s*(\d+)\s*@\s*(\d+)\s*$/i.exec(p)
      return m
        ? { name: m[1].trim(), qty: parseInt(m[2], 10), price: parseInt(m[3], 10) }
        : { name: p, qty: 1, price: 0 }
    })
}

// parseWorkbook 결과(rows: Cell[][])를 주문 객체 배열로 변환
const HEADERS = ['채널', '상태', '날짜', '시간', '테이블', '대기번호', '이름', '아이디', '연락처', '결제수단', '카드사', '요청사항', '주문항목']
function parseOrdersFromRows(rows) {
  if (!rows.length) return []
  // 헤더는 정확 일치 또는 접두어 일치로 매핑(예: "주문항목 (…)" → 주문항목)
  const col = {}
  rows[0].forEach((c, i) => {
    const key = (c?.v ?? '').trim()
    if (!key) return
    const canon = HEADERS.find((h) => key === h || key.startsWith(h))
    if (canon && col[canon] == null) col[canon] = i
  })
  const val = (row, name) => (col[name] != null ? (row[col[name]]?.v ?? '').trim() : '')

  const out = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.every((c) => !(c?.v ?? '').trim())) continue // 빈 행 skip
    const channel = val(row, '채널')
    if (!CHANNEL[channel]) continue // 유효 채널 아니면 skip

    const o = {
      id: uniqueId(),
      date: val(row, '날짜') || ymd(daysAgo(0)),
      time: val(row, '시간') || '00:00',
      channel,
      status: STATUS_BY_LABEL[val(row, '상태')] || 'received',
      pay: val(row, '결제수단') || '카드',
      memo: val(row, '요청사항'),
      items: parseItems(val(row, '주문항목')),
    }
    if (o.pay === '카드') o.card = val(row, '카드사')
    if (CHANNEL[channel].online) {
      o.name = val(row, '이름')
      o.account = val(row, '아이디')
      o.phone = val(row, '연락처')
    } else if (channel === '매장') {
      o.table = val(row, '테이블')
    } else {
      o.pickup = val(row, '대기번호')
    }
    out.push(o)
  }
  return out
}

// TODO: 실제 서비스라면 파싱한 주문을 서버 등록 API로 전송 후 목록 재조회
async function importExcel(file) {
  try {
    const sheets = await parseWorkbook(file)
    const imported = parseOrdersFromRows(sheets[0]?.rows || [])
    if (!imported.length) {
      flash('등록할 주문을 찾지 못했습니다. 샘플 양식을 확인해 주세요.')
      return
    }
    orders.value = [...imported, ...orders.value]
    // 등록분이 화면에 보이도록 조회 기간을 확장하고 필터 초기화
    const dates = imported.map((o) => o.date).filter(Boolean).sort()
    if (dates.length) {
      if (!rangeStart.value || dates[0] < rangeStart.value) rangeStart.value = dates[0]
      if (!rangeEnd.value || dates[dates.length - 1] > rangeEnd.value) rangeEnd.value = dates[dates.length - 1]
      preset.value = 'custom'
    }
    statusFilter.value = 'all'
    search.value = ''
    flash(`${imported.length}건의 주문을 등록했습니다.`)
  } catch (e) {
    flash('파일을 읽지 못했습니다. 엑셀(.xlsx)/CSV 파일인지 확인해 주세요.')
  }
}

// 샘플 엑셀 양식 생성·다운로드 (ExcelJS)
async function downloadSample() {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('주문')
  ws.columns = [
    { header: '채널', key: 'channel', width: 10 },
    { header: '상태', key: 'status', width: 10 },
    { header: '날짜', key: 'date', width: 12 },
    { header: '시간', key: 'time', width: 8 },
    { header: '테이블', key: 'table', width: 8 },
    { header: '대기번호', key: 'pickup', width: 9 },
    { header: '이름', key: 'name', width: 10 },
    { header: '아이디', key: 'account', width: 14 },
    { header: '연락처', key: 'phone', width: 16 },
    { header: '결제수단', key: 'pay', width: 10 },
    { header: '카드사 (결제수단이 카드일 때)', key: 'card', width: 20 },
    { header: '요청사항', key: 'memo', width: 22 },
    { header: '주문항목 (이름 x수량 @단가 ; 로 구분)', key: 'items', width: 46 },
  ]
  ws.getRow(1).font = { bold: true }
  const today = ymd(new Date())
  ws.addRow({ channel: '매장', status: '접수', date: today, time: '12:30', table: 5, pay: '카드', card: '신한', memo: '덜 맵게 해주세요', items: '한우 샤브샤브 (2인) x1 @39000; 공깃밥 x2 @1000' })
  ws.addRow({ channel: '포장', status: '조리중', date: today, time: '13:10', pickup: 12, pay: '현금', items: '해물 샤브샤브 x1 @28000' })
  ws.addRow({ channel: '네이버', status: '준비완료', date: today, time: '18:05', name: '박서준', account: 'skypark07', phone: '010-1234-5678', pay: '네이버페이', memo: '수저 3개', items: '소고기 샤브 세트 x2 @25000; 맥주 x2 @5000' })
  ws.addRow({ channel: '온라인', status: '완료', date: today, time: '19:40', name: '김하윤', account: 'hayoon_k', phone: '010-2222-3333', pay: '카드', card: '삼성', items: '버섯 모둠 x1 @9000; 칼국수 사리 x1 @3000' })

  const buf = await wb.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const a = document.createElement('a')
  a.href = url
  a.download = '주문_등록_샘플.xlsx'
  a.click()
  URL.revokeObjectURL(url)
  flash('샘플 양식을 다운로드했습니다.')
}

// ───────────────────────────────────────────────────────────────────────────
// 목(mock) 데이터 생성 — fetchOrders를 실제 API로 바꾸면 이 아래는 제거 가능
// ───────────────────────────────────────────────────────────────────────────
const MENU = [
  { name: '한우 샤브샤브 (2인)', price: 39000 },
  { name: '소고기 샤브 세트', price: 25000 },
  { name: '해물 샤브샤브', price: 28000 },
  { name: '버섯 모둠', price: 9000 },
  { name: '수제 만두', price: 6000 },
  { name: '칼국수 사리', price: 3000 },
  { name: '공깃밥', price: 1000 },
  { name: '콜라', price: 2000 },
  { name: '소주', price: 5000 },
  { name: '맥주', price: 5000 },
]
// 온라인/네이버 고객 (이름 + 아이디)
const CUSTOMERS = [
  { name: '박서준', account: 'skypark07' },
  { name: '김하윤', account: 'hayoon_k' },
  { name: '이도현', account: 'dohyun92' },
  { name: '최지우', account: 'jiwoo.choi' },
  { name: '정민재', account: 'minjae0303' },
  { name: '강수아', account: 'sooa_kang' },
  { name: '윤예린', account: 'yerin88' },
  { name: '임채원', account: 'chaewon_lim' },
]
const MEMOS = ['', '', '덜 맵게 해주세요', '유아용 의자 필요', '수저 3개 부탁드려요', '포장 꼼꼼히 부탁드립니다', '음료 먼저 주세요']
const CHANNELS = ['매장', '매장', '포장', '네이버', '온라인'] // 오프라인 비중 ↑

const pad2 = (n) => String(n).padStart(2, '0')
const randInt = (n) => Math.floor(Math.random() * n)
const pick = (arr) => arr[randInt(arr.length)]

const usedIds = new Set()
function uniqueId() {
  let id
  do { id = String(240000 + randInt(60000)) } while (usedIds.has(id))
  usedIds.add(id)
  return id
}
function randPhone() {
  return `010-${1000 + randInt(9000)}-${1000 + randInt(9000)}`
}

function generateMockOrders() {
  const rows = Array.from({ length: 26 }, () => {
    const channel = pick(CHANNELS)
    const online = CHANNEL[channel].online
    const items = Array.from({ length: 1 + randInt(3) }, () => {
      const m = pick(MENU)
      return { name: m.name, qty: 1 + randInt(3), price: m.price }
    })
    const o = {
      id: uniqueId(),
      // 기본 조회기간(오늘)에서도 목록이 충분히 보이도록 약 절반은 오늘, 나머지는 최근 3주 분포
      date: ymd(daysAgo(randInt(2) === 0 ? 0 : randInt(21))),
      time: `${pad2(11 + randInt(11))}:${pad2(randInt(60))}`, // 영업시간 11:00~21:59
      channel,
      status: pick(STATUS_ORDER),
      pay: online ? pick(['카드', '네이버페이', '간편결제', '계좌이체']) : pick(['카드', '현금', '간편결제']),
      memo: pick(MEMOS),
      items,
    }
    if (o.pay === '카드') o.card = pick(CARD_BRANDS)
    if (online) {
      const c = pick(CUSTOMERS)
      o.name = c.name
      o.account = c.account
      o.phone = randPhone()
    } else if (channel === '매장') {
      o.table = 1 + randInt(20)
    } else {
      o.pickup = 1 + randInt(30)
    }
    return o
  })
  return rows.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)) // 최신순(날짜+시간)
}
</script>

<style lang="scss" scoped>
.order-manage { gap: 14px; }

/* 조회 조건 카드 내부(레이아웃 셸은 PageLayout이 담당) */
.omf-left { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px 24px; min-width: 0; }
.omf-field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.omf-label { font-size: 12px; font-weight: 700; color: var(--muted); }
.omf-period { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.omf-search-field .om-search { width: 280px; max-width: 100%; }
.omf-period .date-input { height: 34px; }

/* 요약 지표 (필터 우측) */
.omf-stats { display: flex; align-items: stretch; margin-left: auto; }
.omf-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 2px 18px;
  border-left: 1px solid var(--line);
  text-align: right;
}
.omf-stat:first-child { border-left: 0; padding-left: 0; }
.omf-stat:last-child { padding-right: 0; }
.omf-stat-lab { font-size: 12px; font-weight: 600; color: var(--muted); }
.omf-stat-val { font-size: 20px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; }
.omf-stat-val.accent { color: #8a6d12; } /* 완료 매출 강조(골드) */

/* 상태 탭 */
.om-tab-count { margin-left: 6px; font-size: 11px; font-weight: 700; opacity: 0.75; }
.om-search { max-width: 300px; }

/* 리스트 행 */
.dt-row {
  grid-template-columns: 116px minmax(190px, 1.5fr) minmax(150px, 1.1fr) 132px 92px;
  min-width: 780px;
}
.dt-data { height: 60px; } /* 2줄(대표표기+채널/아이디) 수용 */
/* 온라인/네이버 주문 살짝 강조 — 좌측 얇은 액센트 */
.dt-data.online { box-shadow: inset 3px 0 0 rgba(34, 197, 94, 0.45); }

.oc-id { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.oc-no { font-weight: 700; }
.oc-time { font-size: 12px; color: var(--muted); }

.oc-cust { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.oc-rep { font-weight: 600; }
.oc-meta { display: flex; align-items: center; gap: 6px; min-width: 0; }
.oc-sub { font-size: 12px; color: var(--muted); }
.oc-sub.member { color: var(--text); font-weight: 600; } /* 온라인 아이디는 조금 더 진하게 */

.oc-items {
  color: var(--muted);
  &.truncate { font-weight: 500;}
}

.oc-pay { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.oc-amt { font-weight: 700; }
.oc-method { font-size: 12px; color: var(--muted); }

@media (max-width: 720px) {
  .omf-stats { margin-left: 0; }
  .omf-stat:first-child { padding-left: 0; }
}
@media (max-width: 640px) {
  .dt-row {
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 10px;
    min-width: 0;
  }
  .oc-id,
  .oc-items { display: none; }
}
</style>
