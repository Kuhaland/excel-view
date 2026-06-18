<template>
  <div class="home">
    <!-- 상단 네비게이션 -->
    <header class="home-nav">
      <div class="home-brand">
        <img class="home-logo" :src="logo" alt="로고" />
      </div>

      <nav class="home-pills" @mouseleave="hoverIndex = null">
        <span class="pill-indicator" :style="indicatorStyle"></span>
        <button
          v-for="(p, i) in pills"
          :key="p.id"
          :ref="(el) => setPill(el, i)"
          type="button"
          class="hpill"
          :class="{ on: i === indicatorTarget }"
          @mouseenter="hoverIndex = i"
          @click="onPill(p)"
        >
          <span class="material-symbols-outlined">{{ p.icon }}</span>
          <span class="hpill-text">{{ p.label }}</span>
        </button>
      </nav>

      <div class="home-right">
        <button
          v-for="m in rightMenus"
          :key="m.id"
          class="hicon"
          @click="$emit('navigate', m.id)"
        >
          <span class="material-symbols-outlined">{{ m.icon }}</span>
          <span class="hicon-tip">{{ m.label }}</span>
        </button>
        <button class="hicon">
          <span class="material-symbols-outlined">notifications</span>
          <span class="hicon-tip">알림</span>
        </button>
        <div class="profile">
          <div class="avatar">{{ avatarInitial }}</div>
          <div class="profile-meta">
            <div class="profile-name">{{ userName }}</div>
            <div class="profile-mail">{{ userEmail }}</div>
          </div>
        </div>
      </div>
    </header>

    <!-- 타이틀 행 -->
    <div class="home-title-row">
      <h1 class="home-title">Overview</h1>
      <button class="home-share" @click="$emit('navigate', 'viewer')">
        <span class="material-symbols-outlined">ios_share</span> Share
      </button>
    </div>

    <div class="home-grid">
      <!-- 매출 추이 (년/월/일) -->
      <div class="card g-trend">
        <div class="card-head">
          <div>
            <div class="card-title">매출 추이</div>
            <div class="big-stat">{{ trendTotalLabel }}<span class="big-unit"> {{ trendCur.sub }}</span></div>
          </div>
          <div class="seg">
            <button
              v-for="u in trendUnits"
              :key="u.id"
              type="button"
              class="seg-btn"
              :class="{ on: trendUnit === u.id }"
              @click="setTrendUnit(u.id)"
            >{{ u.label }}</button>
          </div>
        </div>
        <div class="trend-chart">
          <v-chart class="echart" :option="trendOption" autoresize />
        </div>
      </div>

      <!-- 신규 고객 추이 -->
      <div class="card g-leads">
        <div class="card-title">매장 방문객 수</div>
        <div class="deal-top">
          <span class="big-stat sm">124</span>
          <span class="stat-sub">일 평균</span>
        </div>
        <div class="lead-wrap">
          <v-chart class="echart" :option="leadOption" autoresize />
        </div>
      </div>

      <!-- 우측 레일: 예약 일정 + Pro -->
      <div class="g-rail">
        <div class="card rail-card">
          <div class="cal-head">
            <button class="cal-nav" @click="shiftWeek(-1)"><span class="material-symbols-outlined">chevron_left</span></button>
            <span class="cal-month">{{ calLabel }}</span>
            <button class="cal-nav" @click="shiftWeek(1)"><span class="material-symbols-outlined">chevron_right</span></button>
          </div>
          <div class="cal-days">
            <button
              v-for="d in weekDays"
              :key="d.key"
              type="button"
              class="cal-day"
              :class="{ active: d.isSelected, today: d.isToday }"
              @click="selectDay(d.date)"
            >
              <span class="cal-wd">{{ d.wd }}</span>
              <span class="cal-num">{{ d.day }}</span>
            </button>
          </div>

          <div class="schedule-title">
            예약 일정
            <span class="schedule-count">{{ reservations.length }}건</span>
          </div>
          <ul v-if="reservations.length" class="schedule">
            <li v-for="(s, i) in reservations" :key="i">
              <span class="sch-time">{{ s.t }}</span>
              <span class="sch-text">{{ s.s }}</span>
              <Checkbox v-model="s.done" />
            </li>
          </ul>
          <div v-else class="schedule-empty">
            <span class="material-symbols-outlined">event_available</span>
            예약이 없습니다
          </div>
        </div>

        <div class="card cta-card">
          <div class="cta-title">Pro 플랜</div>
          <div class="cta-sub">매장 운영에 필요한 모든 기능: 예약, 주문, 재고, 매출 분석</div>
          <button class="btn-dark wide">Pro 시작하기 $9.99</button>
        </div>
      </div>

      <!-- 메뉴 판매 순위 -->
      <div class="card g-new">
        <div class="np-head">
          <span class="np-title">메뉴 판매 순위</span>
          <span class="rank-period">이번 주</span>
        </div>
        <ul class="rank-list">
          <li v-for="(m, i) in menuRanking" :key="m.name" class="rank-row">
            <span class="rank-no" :class="'r' + (i + 1)">{{ i + 1 }}</span>
            <span class="rank-icon" :style="{ background: m.color }">
              <span class="material-symbols-outlined">{{ m.icon }}</span>
            </span>
            <div class="rank-info">
              <div class="rank-name">{{ m.name }}</div>
              <div class="rank-bar"><span :style="{ width: rankBarW(m.count), background: m.color }"></span></div>
            </div>
            <span class="rank-count">{{ m.count.toLocaleString() }}건</span>
          </li>
        </ul>
      </div>

      <!-- 메뉴별 판매금액 -->
      <div class="card g-revenue">
        <div class="card-head">
          <div>
            <div class="card-title">메뉴별 판매금액</div>
            <div class="big-stat">{{ won(salesTotal) }}<span class="big-unit"> {{ rangeDays }}일 합계</span></div>
          </div>
          <div class="date-range">
            <input type="date" class="date-input" v-model="rangeStart" :max="rangeEnd" />
            <span class="date-sep">~</span>
            <input type="date" class="date-input" v-model="rangeEnd" :min="rangeStart" :max="todayISO" />
          </div>
        </div>
        <div class="sales-body">
          <div class="donut-wrap">
            <v-chart class="echart" :option="salesOption" autoresize />
            <div class="donut-center">
              <div class="donut-total">₩{{ wonTick(salesTotal) }}</div>
              <div class="donut-label">총 판매금액</div>
            </div>
          </div>
          <ul class="sales-legend">
            <li v-for="m in menuAmounts" :key="m.name">
              <span class="lg-dot" :style="{ background: m.color }"></span>
              <span class="lg-name">{{ m.name }}</span>
              <span class="lg-amt">{{ won(m.amount) }}</span>
              <span class="lg-pct">{{ salesPct(m.amount) }}%</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 결제 건수 (수단별 + 할인/쿠폰) -->
      <div class="card g-pay">
        <div class="card-head">
          <div>
            <div class="card-title">결제 건수</div>
            <div class="big-stat sm">{{ paymentTotal.toLocaleString() }}<span class="big-unit"> 건 결제</span></div>
          </div>
        </div>
        <div class="pay-chart">
          <v-chart class="echart" :option="payOption" autoresize />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import logo from '../assets/images/logo.png'
import Checkbox from '../components/Checkbox.vue'

use([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, TooltipComponent])

const props = defineProps({
  menus: { type: Array, default: () => [] },
  userName: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  avatarInitial: { type: String, default: '' },
})
const emit = defineEmits(['navigate', 'open-sheet', 'file'])

// ── 상단 메뉴 + 슬라이딩 인디케이터 ──
// 우측(home-right)으로 보낼 메뉴 id
const RIGHT_IDS = ['help', 'settings']
const rightMenus = computed(() =>
  RIGHT_IDS.map((id) => props.menus.find((m) => m.id === id)).filter(Boolean)
)
// 홈 메뉴는 제외 (가운데에는 시트 뷰어/요약/최근/통계만)
const pills = computed(() => props.menus.filter((m) => !RIGHT_IDS.includes(m.id)))
const hoverIndex = ref(null)
const indicatorTarget = computed(() => hoverIndex.value)
const pillEls = ref([])
const indicatorStyle = ref({ opacity: 0 })

function setPill(el, i) {
  if (el) pillEls.value[i] = el
}
function moveIndicator() {
  const idx = hoverIndex.value
  if (idx === null) {
    indicatorStyle.value = { ...indicatorStyle.value, opacity: 0 }
    return
  }
  const el = pillEls.value[idx]
  if (!el) return
  indicatorStyle.value = {
    transform: `translateX(${el.offsetLeft}px)`,
    width: `${el.offsetWidth}px`,
    opacity: 1,
  }
}
watch(hoverIndex, () => moveIndicator())
onMounted(() => {
  window.addEventListener('resize', moveIndicator)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', moveIndicator)
})

function onPill(p) {
  emit('navigate', p.id)
}


// ── 원화 포맷 ──
// 값 단위는 만원. 정확 표기는 ₩, 축 라벨은 만/억으로 축약
function won(manwon) {
  return '₩' + (manwon * 10000).toLocaleString('ko-KR')
}
function wonTick(manwon) {
  if (manwon === 0) return '0'
  if (manwon >= 10000) return +(manwon / 10000).toFixed(1) + '억'
  return manwon.toLocaleString() + '만'
}

// ── 매출 추이(년/월/일) 임시 데이터 (단위: 만원) ──
const TREND = {
  day: {
    sub: '오늘',
    labels: ['월', '화', '수', '목', '금', '토', '일'],
    data: [420, 510, 470, 630, 880, 1200, 950],
  },
  month: {
    sub: '이번 달',
    labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    data: [9800, 10200, 8800, 11500, 13200, 15800, 14100, 12600, 11900, 13400, 15200, 18600],
  },
  year: {
    sub: '올해',
    labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
    data: [98000, 112000, 125000, 141000, 158000, 92000],
  },
}
const trendUnits = [
  { id: 'year', label: '년' },
  { id: 'month', label: '월' },
  { id: 'day', label: '일' },
]
const trendUnit = ref('month')
const trendCur = computed(() => TREND[trendUnit.value])
const trendTotalLabel = computed(() => won(trendCur.value.data[trendCur.value.data.length - 1]))

function setTrendUnit(id) {
  trendUnit.value = id
}

// ── 예약 캘린더 ──
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const today = new Date()
today.setHours(0, 0, 0, 0)
const selectedDate = ref(new Date(today))

function startOfWeek(d) {
  const x = new Date(d)
  const offset = (x.getDay() + 6) % 7 // 월요일 시작
  x.setDate(x.getDate() - offset)
  x.setHours(0, 0, 0, 0)
  return x
}
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function dateKey(d) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

// 선택된 날짜가 속한 주(월~일) 7일
const weekDays = computed(() => {
  const start = startOfWeek(selectedDate.value)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return {
      date: d,
      key: dateKey(d),
      day: d.getDate(),
      wd: WEEKDAYS[d.getDay()],
      isToday: sameDay(d, today),
      isSelected: sameDay(d, selectedDate.value),
    }
  })
})

const calLabel = computed(() => {
  const d = selectedDate.value
  const base = `${d.getMonth() + 1}월 ${d.getDate()}일`
  return sameDay(d, today) ? `오늘 · ${base}` : `${base} (${WEEKDAYS[d.getDay()]})`
})

function shiftWeek(delta) {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + delta * 7)
  selectedDate.value = d
}
function selectDay(d) {
  selectedDate.value = new Date(d)
}

// 날짜별 임시 예약 데이터 풀(빈 날짜 포함)
const RESV_POOL = [
  [
    { t: '12:00', s: '4인 · 창가석', done: true },
    { t: '13:00', s: '6인 · 룸', done: false },
    { t: '18:30', s: '단체 10인 예약', done: false },
    { t: '19:30', s: '2인 · 기념일', done: false },
  ],
  [
    { t: '11:30', s: '2인 · 바 테이블', done: true },
    { t: '12:30', s: '4인 · 창가석', done: true },
    { t: '13:30', s: '비즈니스 미팅 8인', done: false },
    { t: '18:00', s: '단체 12인 예약', done: false },
    { t: '20:00', s: '생일 케이크 요청', done: false },
  ],
  [
    { t: '12:00', s: '6인 · 룸', done: false },
    { t: '19:00', s: '커플 디너 2인', done: false },
  ],
  [
    { t: '11:00', s: '오픈 케이터링 준비', done: true },
    { t: '13:00', s: '4인 · 창가석', done: true },
    { t: '17:30', s: '와인 페어링 6인', done: false },
    { t: '18:30', s: '단체 15인 예약', done: false },
    { t: '19:30', s: '2인 · 기념일', done: false },
    { t: '21:00', s: '심야 바 4인', done: false },
  ],
  [], // 예약 없는 날
]

// 토글 상태가 날짜별로 유지되도록 캐시
const resvStore = reactive({})
const reservations = computed(() => {
  const key = dateKey(selectedDate.value)
  if (!resvStore[key]) {
    const d = selectedDate.value
    const idx = (d.getDate() + d.getDay()) % RESV_POOL.length
    resvStore[key] = RESV_POOL[idx].map((r) => ({ ...r }))
  }
  return resvStore[key]
})

// ── 메뉴 판매 순위(임시 데이터, 판매 건수 내림차순) ──
// 메뉴별 색상 — 순위/판매금액 차트에서 동일 메뉴 = 동일 색, 서로는 분리도 높은 팔레트
const menuRanking = [
  { name: '시그니처 버거', count: 1240, icon: 'lunch_dining', color: '#f6b48f' },
  { name: '트러플 크림 파스타', count: 980, icon: 'ramen_dining', color: '#a3c4f3' },
  { name: '마르게리타 피자', count: 760, icon: 'local_pizza', color: '#9ee0bd' },
  { name: '딸기 티라미수', count: 540, icon: 'cake', color: '#f7bdd8' },
  { name: '아메리카노', count: 430, icon: 'local_cafe', color: '#c9bdf2' },
]
const rankMax = Math.max(...menuRanking.map((m) => m.count))
function rankBarW(count) {
  return (count / rankMax) * 100 + '%'
}

// ── 메뉴별 판매금액 (날짜 범위 선택) ──
// 메뉴별 일평균 판매금액(만원) + 색상
const MENU_SALES = [
  { name: '시그니처 버거', daily: 62, color: '#f6b48f' },
  { name: '트러플 크림 파스타', daily: 49, color: '#a3c4f3' },
  { name: '마르게리타 피자', daily: 38, color: '#9ee0bd' },
  { name: '딸기 티라미수', daily: 27, color: '#f7bdd8' },
  { name: '아메리카노', daily: 21, color: '#c9bdf2' },
]

function toISO(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dd}`
}
// 요일·메뉴별로 결정적 변동을 줘서 기간에 따라 구성비가 달라지게 함
function dayFactor(menuIdx, date) {
  return 0.7 + 0.6 * Math.abs(Math.sin((date.getDay() + 1) * (menuIdx + 2) / 3))
}

const todayISO = toISO(today)
const rangeStartInit = new Date(today)
rangeStartInit.setDate(rangeStartInit.getDate() - 29)
const rangeStart = ref(toISO(rangeStartInit))
const rangeEnd = ref(todayISO)

const rangeDays = computed(() => {
  const s = new Date(rangeStart.value)
  const e = new Date(rangeEnd.value)
  const n = Math.round((e - s) / 86400000) + 1
  return n > 0 ? n : 0
})

// 선택 기간의 메뉴별 판매금액 합계(만원)
const menuAmounts = computed(() => {
  const s = new Date(rangeStart.value); s.setHours(0, 0, 0, 0)
  const e = new Date(rangeEnd.value); e.setHours(0, 0, 0, 0)
  const sums = MENU_SALES.map(() => 0)
  for (let t = new Date(s); t <= e; t.setDate(t.getDate() + 1)) {
    MENU_SALES.forEach((m, idx) => { sums[idx] += Math.round(m.daily * dayFactor(idx, t)) })
  }
  return MENU_SALES.map((m, idx) => ({ ...m, amount: sums[idx] }))
})
const salesTotal = computed(() => menuAmounts.value.reduce((a, m) => a + m.amount, 0))
function salesPct(amount) {
  return salesTotal.value ? Math.round((amount / salesTotal.value) * 100) : 0
}

// 신규 고객(요일별 임의 데이터)
const leadDays = ['월', '화', '수', '목', '금', '토', '일']
const leadVals = [88, 96, 84, 102, 118, 152, 110]

// ── ECharts 공통 ──
const MUTED = '#8a8f98'
const GRID = 'rgba(0, 0, 0, 0.06)'

// 매출 추이 — 막대 (년/월/일 토글)
const trendOption = computed(() => ({
  grid: { left: 4, right: 12, top: 16, bottom: 8, containLabel: true },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (p) => won(p[0].value),
  },
  xAxis: {
    type: 'category',
    data: trendCur.value.labels,
    axisLine: { lineStyle: { color: GRID } },
    axisTick: { show: false },
    axisLabel: { color: MUTED, fontSize: 11 },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: MUTED, fontSize: 10, formatter: (v) => wonTick(v) },
    splitLine: { lineStyle: { color: GRID } },
  },
  series: [{
    type: 'bar',
    data: trendCur.value.data,
    barMaxWidth: 34,
    itemStyle: {
      borderRadius: [6, 6, 0, 0],
      color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#aee37e' }, { offset: 1, color: '#7fce4f' }] },
    },
  }],
}))

// 신규 고객 — 영역(라인)
const leadOption = computed(() => ({
  grid: { left: 0, right: 0, top: 12, bottom: 4, containLabel: true },
  tooltip: { trigger: 'axis', formatter: (p) => p[0].value + '명' },
  xAxis: {
    type: 'category',
    data: leadDays,
    boundaryGap: false,
    axisLine: { lineStyle: { color: GRID } },
    axisTick: { show: false },
    axisLabel: { color: MUTED, fontSize: 11 },
  },
  yAxis: { type: 'value', show: false, scale: true },
  series: [{
    type: 'line',
    data: leadVals,
    smooth: true,
    showSymbol: false,
    symbolSize: 7,
    lineStyle: { color: '#e8893a', width: 2 },
    itemStyle: { color: '#e8893a' },
    areaStyle: {
      color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(240, 166, 77, 0.5)' }, { offset: 1, color: 'rgba(240, 166, 77, 0)' }] },
    },
  }],
}))

// 메뉴별 판매금액 — 도넛(구성비)
const salesOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (p) => `${p.name}: ${won(p.value)} (${p.percent}%)`,
  },
  series: [{
    type: 'pie',
    radius: ['68%', '96%'],
    avoidLabelOverlap: false,
    label: { show: false },
    labelLine: { show: false },
    data: menuAmounts.value.map((m) => ({ name: m.name, value: m.amount, itemStyle: { color: m.color } })),
  }],
}))

// ── 결제 건수 (수단별 + 할인/쿠폰 사용량) ──
const PAY_METHODS = [
  { name: '카드', count: 1840, color: '#a3c4f3' },
  { name: '현금', count: 520, color: '#9ee0bd' },
  { name: '상품권', count: 180, color: '#f6b48f' },
]
const PROMO = [
  { name: '할인 적용', count: 430, color: '#f7bdd8' },
  { name: '쿠폰 사용', count: 260, color: '#c9bdf2' },
]
const payItems = [...PAY_METHODS, ...PROMO]
const paymentTotal = PAY_METHODS.reduce((a, i) => a + i.count, 0)

// 가로 막대 — 카드/현금/상품권 + 할인/쿠폰 건수
const payOption = computed(() => {
  const items = [...payItems].reverse() // 위에서부터 카드 순으로 표시
  return {
    grid: { left: 4, right: 52, top: 6, bottom: 2, containLabel: true },
    tooltip: { trigger: 'item', formatter: (p) => `${p.name}: ${p.value.toLocaleString()}건` },
    xAxis: { type: 'value', axisLabel: { show: false }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: GRID } } },
    yAxis: {
      type: 'category',
      data: items.map((i) => i.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#4a4c54', fontSize: 12, fontWeight: 600 },
    },
    series: [{
      type: 'bar',
      barWidth: 14,
      data: items.map((i) => ({ value: i.count, itemStyle: { color: i.color, borderRadius: [0, 6, 6, 0] } })),
      label: { show: true, position: 'right', formatter: (p) => p.value.toLocaleString() + '건', color: MUTED, fontSize: 11, fontWeight: 600 },
    }],
  }
})
</script>
