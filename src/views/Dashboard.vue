<template>
  <div class="home" :class="isDark ? 'theme-dark' : 'theme-light'">
    <!-- 하단 앰비언트 블러 서클(천천히 크로스 이동) -->
    <div class="home-blobs" aria-hidden="true">
      <span class="blob b1"></span><span class="blob b2"></span>
      <span class="blob b3"></span><span class="blob b4"></span>
      <span class="blob b5"></span><span class="blob b6"></span>
      <span class="blob b7"></span><span class="blob b8"></span>
    </div>

    <!-- 상단 네비게이션 -->
    <header class="home-nav">
      <div class="home-brand">
        <img
          class="home-logo"
          :class="{ spin: logoSpin }"
          :src="logo"
          alt="로고"
          @click="logoSpin = true"
          @mouseenter="logoSpin = true"
          @animationend="logoSpin = false"
        />
      </div>

      <!-- 1차 메뉴(pills) + hover 시 하단 하위메뉴 -->
      <div class="home-menunav" @mouseleave="scheduleClose">
        <nav class="home-pills">
          <span class="pill-indicator" :style="indicatorStyle"></span>
          <button
            v-for="(p, i) in pills"
            :key="p.id"
            :ref="(el) => setPill(el, i)"
            type="button"
            class="hpill"
            :class="{ on: i === hoverIndex }"
            :aria-label="p.title"
            @mouseenter="openSub(i)"
          >
            <span class="material-symbols-outlined">{{ p.icon }}</span>
          </button>
        </nav>

        <Transition name="submenu">
          <div
            v-if="hoverSection && hoverSection.items.length"
            class="home-submenu"
            :style="{ left: submenuLeft + 'px' }"
            @mouseenter="keepSub"
            @mouseleave="scheduleClose"
          >
            <!-- 슬라이드 상단: 메뉴(섹션)명 명시 (클릭 이동 없음) -->
            <div class="hsub-head">
              <span class="material-symbols-outlined">{{ hoverSection.icon }}</span>
              {{ hoverSection.title }}
            </div>
            <button
              v-for="it in hoverSection.items"
              :key="it.id"
              type="button"
              class="hsub"
              @click="go(itemTarget(it))"
            >
              <span class="material-symbols-outlined">{{ it.icon }}</span>
              <span class="hsub-label">{{ it.label }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <div class="home-right">
        <ToggleSwitch
          v-model="isDark"
          on-icon="dark_mode"
          off-icon="light_mode"
          aria-label="다크/라이트 모드 전환"
        />
        <button
          v-for="m in rightMenus"
          :key="m.id"
          class="hicon"
          @click="$emit('navigate', m.id)"
        >
          <span class="material-symbols-outlined">{{ m.icon }}</span>
          <span class="hicon-tip">{{ m.label }}</span>
        </button>
        <NotificationBell trigger-class="hicon" @navigate="$emit('navigate', $event)" />
        <button class="hicon" @click="$emit('help')">
          <span class="material-symbols-outlined">help</span>
          <span class="hicon-tip">도움말</span>
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
      <div>
        <h1 class="home-title">오늘의 매장 현황</h1>
        <p class="home-subtitle">
          <span class="live-dot"></span> 영업 중 · {{ todayLabel }}
        </p>
      </div>
      <Button variant="primary" icon="ios_share" @click="$emit('navigate', 'sys-upload')">리포트</Button>
    </div>

    <div class="dash">
      <!-- ── 1. 상단 KPI ───────────────────────────── -->
      <section class="kpi-row">
        <div v-for="k in kpis" :key="k.label" class="card kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">{{ k.label }}</span>
            <span class="kpi-ic material-symbols-outlined" :style="{ color: k.color, background: k.tint }">{{ k.icon }}</span>
          </div>
          <div class="kpi-value">{{ k.value }}</div>
          <div class="kpi-foot">
            <span class="kpi-delta" :class="k.delta >= 0 ? 'up' : 'down'">
              <span class="material-symbols-outlined">{{ k.delta >= 0 ? 'arrow_upward' : 'arrow_downward' }}</span>
              {{ Math.abs(k.delta) }}%
            </span>
            <span class="kpi-subt">{{ k.sub }}</span>
          </div>
        </div>
      </section>

      <!-- ── 2. 매출 추이 + 결제수단 ───────────────── -->
      <section class="dash-row r-2-1">
        <div class="card">
          <div class="card-head">
            <div>
              <div class="card-title">매출 추이</div>
              <div class="big-stat">{{ won(salesSum) }}<span class="big-unit"> {{ salesCur.sub }}</span></div>
            </div>
            <div class="seg">
              <button
                v-for="u in salesPeriods"
                :key="u.id"
                type="button"
                class="seg-btn"
                :class="{ on: salesPeriod === u.id }"
                @click="salesPeriod = u.id"
              >{{ u.label }}</button>
            </div>
          </div>
          <div class="chart-box">
            <v-chart class="echart" :option="salesTrendOption" autoresize />
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <div class="card-title">결제수단 비중</div>
            <span class="stat-sub">오늘</span>
          </div>
          <div class="donut-card">
            <div class="donut-box">
              <v-chart class="echart" :option="payDonutOption" autoresize />
              <div class="donut-center">
                <div class="donut-total">₩{{ wonTick(payTotal) }}</div>
                <div class="donut-label">결제 총액</div>
              </div>
            </div>
            <ul class="legend">
              <li v-for="(p, i) in payMethods" :key="p.name">
                <span class="lg-dot" :style="{ background: menuColors[i] }"></span>
                <span class="lg-name">{{ p.name }}</span>
                <span class="lg-pct">{{ pctOf(p.value, payTotal) }}%</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ── 3. 메뉴 분석 ──────────────────────────── -->
      <h2 class="dash-h">메뉴 분석</h2>
      <section class="dash-row r-1-1">
        <div class="card">
          <div class="card-head">
            <div class="card-title">베스트셀러 TOP 5</div>
            <span class="stat-sub">판매량 · 매출</span>
          </div>
          <ul class="rank-list rank-list--menu">
            <li v-for="(m, i) in bestsellers" :key="m.name" class="rank-row">
              <span class="rank-no" :class="'r' + (i + 1)">{{ i + 1 }}</span>
              <div class="rank-info">
                <div class="rank-line">
                  <span class="rank-name">{{ m.name }}</span>
                  <span class="rank-rev">{{ won(m.rev) }}</span>
                </div>
                <div class="rank-bar"><span :style="{ width: barW(m.rev, bestMax), background: menuColors[i] }"></span></div>
              </div>
              <span class="rank-count">{{ m.qty }}개</span>
            </li>
          </ul>
        </div>

        <div class="card">
          <div class="card-head">
            <div class="card-title">카테고리별 매출 비중</div>
            <span class="stat-sub">{{ won(categoryTotal) }}</span>
          </div>
          <div class="hbars">
            <div v-for="(c, i) in categories" :key="c.name" class="hbar-row">
              <span class="hbar-name">{{ c.name }}</span>
              <div class="hbar-track"><span :style="{ width: pctOf(c.value, categoryTotal) + '%', background: menuColors[i] }"></span></div>
              <span class="hbar-val">{{ pctOf(c.value, categoryTotal) }}%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── 4. 주문·채널 ──────────────────────────── -->
      <h2 class="dash-h">주문 · 채널</h2>
      <section class="dash-row r-1-1">
        <div class="card">
          <div class="card-head">
            <div class="card-title">채널별 매출 비중</div>
            <span class="stat-sub">홀 · 포장 · 배달</span>
          </div>
          <div class="donut-card">
            <div class="donut-box">
              <v-chart class="echart" :option="channelDonutOption" autoresize />
              <div class="donut-center">
                <div class="donut-total">₩{{ wonTick(channelTotal) }}</div>
                <div class="donut-label">매출 총액</div>
              </div>
            </div>
            <ul class="legend">
              <li v-for="(c, i) in channels" :key="c.name">
                <span class="lg-dot" :style="{ background: menuColors[i] }"></span>
                <span class="lg-name">{{ c.name }}</span>
                <span class="lg-pct">{{ pctOf(c.value, channelTotal) }}%</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <div class="card-title">현재 주문 상태</div>
            <span class="stat-sub">실시간</span>
          </div>
          <div class="status-row">
            <div v-for="s in orderStatus" :key="s.name" class="status-tile" :class="'t-' + s.tone">
              <span class="status-ic material-symbols-outlined">{{ s.icon }}</span>
              <div class="status-count">{{ s.count }}</div>
              <div class="status-name">{{ s.name }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── 5. 보조 정보 ──────────────────────────── -->
      <h2 class="dash-h">고객 · 운영</h2>
      <section class="dash-row r-3">
        <!-- 신규 vs 재방문 -->
        <div class="card">
          <div class="card-head">
            <div class="card-title">신규 vs 재방문</div>
            <span class="stat-sub">오늘</span>
          </div>
          <div class="split-bar">
            <span class="split-seg split-new" :style="{ width: newRet.newPct + '%' }"></span>
            <span class="split-seg split-ret" :style="{ width: newRet.retPct + '%' }"></span>
          </div>
          <div class="split-legend">
            <div><span class="lg-dot dot-new"></span> 신규 <b>{{ newRet.newPct }}%</b> ({{ newRet.newCnt }}명)</div>
            <div><span class="lg-dot dot-ret"></span> 재방문 <b>{{ newRet.retPct }}%</b> ({{ newRet.retCnt }}명)</div>
          </div>
        </div>

        <!-- 리뷰 요약 -->
        <div class="card">
          <div class="card-head">
            <div class="card-title">리뷰 요약</div>
            <span class="stat-sub">{{ review.count.toLocaleString() }}개</span>
          </div>
          <div class="rv-head">
            <span class="rv-avg">{{ review.avg.toFixed(1) }}</span>
            <span class="rv-stars">
              <span
                v-for="(s, i) in starList(review.avg)"
                :key="i"
                class="material-symbols-outlined"
                :class="{ filled: s !== 'empty' }"
              >{{ s === 'half' ? 'star_half' : 'star' }}</span>
            </span>
          </div>
          <ul class="rv-list">
            <li v-for="(r, i) in review.recent" :key="i">
              <div class="rv-top">
                <span class="rv-name">{{ r.name }}</span>
                <span class="rv-mini">
                  <span v-for="n in r.stars" :key="n" class="material-symbols-outlined filled">star</span>
                </span>
              </div>
              <p class="rv-text">{{ r.text }}</p>
            </li>
          </ul>
        </div>

        <!-- 재고 알림 -->
        <div class="card">
          <div class="card-head">
            <div class="card-title">재고 알림</div>
            <span class="stat-sub">{{ stockAlerts.length }}건</span>
          </div>
          <ul class="stock-list">
            <li v-for="s in stockAlerts" :key="s.name" class="stock-row" :class="'s-' + s.tone">
              <span class="stock-ic material-symbols-outlined">{{ s.tone === 'danger' ? 'error' : 'warning' }}</span>
              <span class="stock-name">{{ s.name }}</span>
              <span class="stock-qty">{{ s.qty }}</span>
              <span class="stock-tag">{{ s.level }}</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import logo from '../assets/images/logo.png'
import ToggleSwitch from '../components/ToggleSwitch.vue'
import NotificationBell from '../components/NotificationBell.vue'
import Button from '../components/Button.vue'
import { MENU_TREE } from '../menus.js'

use([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, TooltipComponent])

const props = defineProps({
  menus: { type: Array, default: () => [] },
  userName: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  avatarInitial: { type: String, default: '' },
})
const emit = defineEmits(['navigate', 'open-sheet', 'file', 'help'])

// ── 컬러 모드 (다크/라이트) ──
const STORE_KEY = 'dash-theme'
const stored = (() => {
  try { return localStorage.getItem(STORE_KEY) } catch { return null }
})()
const isDark = ref(stored ? stored === 'dark' : false) // 기본 라이트
watch(isDark, (v) => {
  try { localStorage.setItem(STORE_KEY, v ? 'dark' : 'light') } catch { /* ignore */ }
})

// 로고 X축 회전 애니메이션
const logoSpin = ref(false)

// ── 상단 메뉴(1차=섹션 pills) + hover 시 하단 하위메뉴 ──
// 메인 메뉴와 LNB(사이드바)는 동일한 menus.js 트리(MENU_TREE) 사용
const rightMenus = computed(() => [])
const pills = MENU_TREE
const hoverIndex = ref(null)
const pillEls = ref([])
const indicatorStyle = ref({ opacity: 0 })
const submenuLeft = ref(0)
let closeTimer = null

const hoverSection = computed(() => (hoverIndex.value != null ? MENU_TREE[hoverIndex.value] : null))

function setPill(el, i) {
  if (el) pillEls.value[i] = el
}
function moveIndicator() {
  const i = hoverIndex.value
  if (i == null) {
    indicatorStyle.value = { ...indicatorStyle.value, opacity: 0 }
    return
  }
  const el = pillEls.value[i]
  if (!el) return
  indicatorStyle.value = {
    transform: `translateX(${el.offsetLeft}px)`,
    width: `${el.offsetWidth}px`,
    opacity: 1,
  }
  submenuLeft.value = el.offsetLeft
}
watch(hoverIndex, () => moveIndicator())

// hover 의도(약간의 지연)로 pill ↔ 드롭다운 사이 이동을 매끄럽게
function openSub(i) {
  clearTimeout(closeTimer)
  hoverIndex.value = i
}
function keepSub() {
  clearTimeout(closeTimer)
}
function scheduleClose() {
  closeTimer = setTimeout(() => { hoverIndex.value = null }, 150)
}

function itemTarget(it) {
  return it.children ? it.children[0].id : it.id
}
function go(id) {
  clearTimeout(closeTimer)
  hoverIndex.value = null
  emit('navigate', id)
}

onMounted(() => window.addEventListener('resize', moveIndicator))
onBeforeUnmount(() => {
  window.removeEventListener('resize', moveIndicator)
  clearTimeout(closeTimer)
})

// ── 오늘 날짜 라벨 ──
const WD = ['일', '월', '화', '수', '목', '금', '토']
const today = new Date()
const todayLabel = `${today.getMonth() + 1}월 ${today.getDate()}일 (${WD[today.getDay()]})`

// ── 원화 포맷 (값 단위: 만원) ──
function won(manwon) {
  return '₩' + Math.round(manwon * 10000).toLocaleString('ko-KR')
}
function wonTick(manwon) {
  if (manwon === 0) return '0'
  if (manwon >= 10000) return +(manwon / 10000).toFixed(1) + '억'
  return Math.round(manwon).toLocaleString() + '만'
}
function pctOf(v, total) {
  return total ? Math.round((v / total) * 100) : 0
}
function barW(v, max) {
  return (v / max) * 100 + '%'
}

// ── 차트 컬러 (다크/라이트 모드별 반응형) ──
function mixHex(a, b, t) {
  const ch = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16))
  const [ar, ag, ab] = ch(a)
  const [br, bg, bb] = ch(b)
  return '#' + [ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]
    .map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}
const CC = computed(() => (isDark.value
  ? { muted: '#9a9aa2', grid: 'rgba(255,255,255,0.08)', accent: '#f2e24e', dim: '#6f6f77', menuFrom: '#f2e24e', menuTo: '#6f6f77' }
  : { muted: '#6b6d75', grid: 'rgba(0,0,0,0.08)', accent: '#caa11f', dim: '#e2d49a', menuFrom: '#caa11f', menuTo: '#5f4a12' }))
const CHART_FW = 700

// 5색 팔레트(모드별)
const menuColors = computed(() =>
  Array.from({ length: 5 }, (_, i) => mixHex(CC.value.menuFrom, CC.value.menuTo, (i / 4) * 0.9))
)

// ── 1. KPI (임시 데이터) ──
const kpis = [
  { label: '오늘 매출', value: '₩3,820,000', delta: 12.4, sub: '전일 대비', icon: 'payments', color: '#10b981', tint: 'rgba(16,185,129,0.15)' },
  { label: '주문 건수', value: '142건', delta: 8.1, sub: '완료 134 · 취소 8', icon: 'receipt_long', color: '#3b82f6', tint: 'rgba(59,130,246,0.15)' },
  { label: '객단가', value: '₩26,900', delta: -3.2, sub: '전일 대비', icon: 'sell', color: '#8b5cf6', tint: 'rgba(139,92,246,0.15)' },
  { label: '테이블 회전율', value: '4.8회', delta: 5.6, sub: '전일 대비', icon: 'table_restaurant', color: '#f59e0b', tint: 'rgba(245,158,11,0.16)' },
]

// ── 2. 매출 추이 (일=시간대 / 주=요일 / 월=주차), 단위 만원 ──
const SALES = {
  day: { sub: '오늘', unit: '시', labels: ['11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'], data: [28, 82, 96, 54, 33, 29, 40, 72, 138, 150, 96] },
  week: { sub: '이번 주', unit: '', labels: ['월', '화', '수', '목', '금', '토', '일'], data: [210, 235, 248, 256, 320, 420, 360] },
  month: { sub: '이번 달', unit: '', labels: ['1주', '2주', '3주', '4주', '5주'], data: [1480, 1620, 1560, 1740, 980] },
}
const salesPeriods = [
  { id: 'day', label: '일' },
  { id: 'week', label: '주' },
  { id: 'month', label: '월' },
]
const salesPeriod = ref('day')
const salesCur = computed(() => SALES[salesPeriod.value])
const salesSum = computed(() => salesCur.value.data.reduce((a, b) => a + b, 0))

const salesTrendOption = computed(() => {
  const d = salesCur.value
  const max = Math.max(...d.data)
  return {
    textStyle: { fontWeight: CHART_FW },
    grid: { left: 4, right: 10, top: 16, bottom: 6, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      textStyle: { fontWeight: CHART_FW },
      formatter: (p) => `${p[0].axisValue}${d.unit}  ${won(p[0].value)}`,
    },
    xAxis: {
      type: 'category',
      data: d.labels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: CC.value.grid } },
      axisLabel: { color: CC.value.muted, fontSize: 11, fontWeight: CHART_FW },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: CC.value.muted, fontSize: 10, fontWeight: CHART_FW, formatter: (v) => wonTick(v) },
      splitLine: { lineStyle: { color: CC.value.grid } },
    },
    series: [{
      type: 'bar',
      barMaxWidth: 30,
      // 피크타임 막대는 강조색, 나머지는 흐린색
      data: d.data.map((v) => ({
        value: v,
        itemStyle: { borderRadius: [5, 5, 0, 0], color: v >= max * 0.66 ? CC.value.accent : mixHex(CC.value.accent, CC.value.dim, 0.7) },
      })),
    }],
  }
})

// 도넛 공통 옵션
function donutOption(items) {
  return {
    textStyle: { fontWeight: CHART_FW },
    tooltip: { trigger: 'item', textStyle: { fontWeight: CHART_FW }, formatter: (p) => `${p.name}: ${won(p.value)} (${p.percent}%)` },
    series: [{
      type: 'pie',
      radius: ['60%', '92%'],
      avoidLabelOverlap: false,
      label: { show: false },
      labelLine: { show: false },
      data: items.map((it, i) => ({ name: it.name, value: it.value, itemStyle: { color: menuColors.value[i] } })),
    }],
  }
}

// 결제수단 비중
const payMethods = [
  { name: '카드', value: 248 },
  { name: '간편결제', value: 92 },
  { name: '현금', value: 42 },
]
const payTotal = computed(() => payMethods.reduce((a, p) => a + p.value, 0))
const payDonutOption = computed(() => donutOption(payMethods))

// ── 3. 메뉴 분석 ──
const bestsellers = [
  { name: '시그니처 버거', qty: 86, rev: 129 },
  { name: '트러플 크림 파스타', qty: 64, rev: 115 },
  { name: '마르게리타 피자', qty: 58, rev: 87 },
  { name: '수제 감자튀김', qty: 73, rev: 44 },
  { name: '아메리카노', qty: 91, rev: 36 },
]
const bestMax = Math.max(...bestsellers.map((m) => m.rev))

const categories = [
  { name: '메인', value: 210 },
  { name: '사이드', value: 78 },
  { name: '음료', value: 64 },
  { name: '디저트', value: 30 },
]
const categoryTotal = computed(() => categories.reduce((a, c) => a + c.value, 0))

// ── 4. 주문·채널 ──
const channels = [
  { name: '홀', value: 196 },
  { name: '포장', value: 92 },
  { name: '배달', value: 94 },
]
const channelTotal = computed(() => channels.reduce((a, c) => a + c.value, 0))
const channelDonutOption = computed(() => donutOption(channels))

const orderStatus = [
  { name: '접수', count: 6, icon: 'inbox', tone: 'info' },
  { name: '조리중', count: 9, icon: 'skillet', tone: 'warn' },
  { name: '완료', count: 127, icon: 'check_circle', tone: 'ok' },
]

// ── 5. 보조 정보 ──
const newRet = { newPct: 38, retPct: 62, newCnt: 54, retCnt: 88 }

const review = {
  avg: 4.6,
  count: 1284,
  recent: [
    { name: '김○○', stars: 5, text: '버거가 정말 맛있어요. 재방문 의사 100%!' },
    { name: '이○○', stars: 4, text: '분위기 좋고 직원분들 친절합니다. 다만 조금 짠 편.' },
    { name: '박○○', stars: 5, text: '트러플 파스타 강추! 웨이팅 있을 만해요.' },
  ],
}
function starList(avg) {
  return Array.from({ length: 5 }, (_, i) => (avg >= i + 1 ? 'full' : avg >= i + 0.5 ? 'half' : 'empty'))
}

const stockAlerts = [
  { name: '한우 등심', qty: '2인분', level: '부족', tone: 'warn' },
  { name: '생맥주 1000cc', qty: '5잔', level: '소진 임박', tone: 'warn' },
  { name: '트러플 오일', qty: '0', level: '품절', tone: 'danger' },
  { name: '딸기 (디저트용)', qty: '1팩', level: '부족', tone: 'warn' },
]
</script>
