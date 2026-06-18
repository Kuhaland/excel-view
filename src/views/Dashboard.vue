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
      <!-- 테이블 회전율 -->
      <div class="card g-deal">
        <div class="card-title">테이블 회전율</div>
        <div class="deal-top">
          <span class="big-stat">78<span class="big-unit">%</span></span>
          <span class="stat-sub">목표 대비</span>
        </div>
        <div class="deal-chart">
          <div class="y-axis"><span>100</span><span>50</span><span>0</span></div>
          <div class="vbars">
            <div v-for="(b, i) in turnoverBars" :key="i" class="vbar-col">
              <div class="vbar" :style="{ height: b + '%' }"></div>
              <span class="vbar-label">{{ days[i] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 활성 테이블 / 조리 중 주문 -->
      <div class="g-stats">
        <div class="card mini-stat">
          <div class="card-title">활성 테이블</div>
          <span class="corner-arrow material-symbols-outlined">north_east</span>
          <div class="big-stat sm">18</div>
          <div class="stat-sub">+ 3 어제 대비</div>
        </div>
        <div class="card mini-stat">
          <div class="card-title">조리 중 주문</div>
          <span class="corner-arrow material-symbols-outlined">north_east</span>
          <div class="big-stat sm">5</div>
          <div class="stat-sub">+ 1 직전 30분</div>
        </div>
      </div>

      <!-- 신규 고객 추이 -->
      <div class="card g-leads">
        <div class="card-title">신규 고객</div>
        <div class="deal-top">
          <span class="big-stat sm">124</span>
          <span class="stat-sub">일 평균</span>
        </div>
        <div class="lead-wrap">
          <span class="lead-tip">토요일: 152명</span>
          <svg class="area-svg" viewBox="0 0 100 50" preserveAspectRatio="none">
            <defs>
              <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f0a64d" stop-opacity="0.5" />
                <stop offset="100%" stop-color="#f0a64d" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="leadArea.area" fill="url(#leadGrad)" />
            <path :d="leadArea.line" fill="none" stroke="#e8893a" stroke-width="1.6" />
          </svg>
        </div>
      </div>

      <!-- 우측 레일: 예약 일정 + Pro -->
      <div class="g-rail">
        <div class="card rail-card">
          <div class="cal-head">
            <button class="cal-nav"><span class="material-symbols-outlined">chevron_left</span></button>
            <span class="cal-month">오늘 · 6월 18일</span>
            <button class="cal-nav"><span class="material-symbols-outlined">chevron_right</span></button>
          </div>
          <div class="cal-days">
            <button v-for="d in calDays" :key="d" class="cal-day" :class="{ active: d === 18 }">{{ d }}</button>
          </div>

          <div class="schedule-title">예약 일정</div>
          <ul class="schedule">
            <li v-for="(s, i) in reservations" :key="i">
              <span class="sch-time">{{ s.t }}</span>
              <span class="sch-text">{{ s.s }}</span>
              <Checkbox v-model="s.done" />
            </li>
          </ul>
        </div>

        <div class="card cta-card">
          <div class="cta-title">Pro 플랜</div>
          <div class="cta-sub">매장 운영에 필요한 모든 기능: 예약, 주문, 재고, 매출 분석</div>
          <button class="btn-dark wide">Pro 시작하기 $9.99</button>
        </div>
      </div>

      <!-- 신규 메뉴 (Swiper) -->
      <div class="card g-new">
        <div class="np-head">
          <button class="np-nav np-prev" @click="prev"><span class="material-symbols-outlined">chevron_left</span></button>
          <span class="np-title">신규 메뉴</span>
          <button class="np-nav np-next" @click="next"><span class="material-symbols-outlined">chevron_right</span></button>
        </div>
        <Swiper
          class="np-swiper"
          :slides-per-view="1"
          :space-between="12"
          :loop="true"
          @swiper="onSwiper"
        >
          <SwiperSlide v-for="(p, i) in dishes" :key="i">
            <div class="np-photo" :style="{ background: p.grad }">
              <span class="material-symbols-outlined">{{ p.icon }}</span>
            </div>
            <div class="np-info">
              <div>
                <div class="np-name">{{ p.name }}</div>
                <div class="np-avail">{{ p.tag }}</div>
              </div>
              <div class="np-price">{{ p.price }}</div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <!-- 매출 -->
      <div class="card g-revenue">
        <div class="card-head">
          <div>
            <div class="card-title">매출</div>
            <div class="big-stat">$8,512<span class="big-unit"> 일 평균</span></div>
          </div>
          <span class="dropdown-pill">6개월 <span class="material-symbols-outlined">expand_more</span></span>
        </div>
        <div class="rev-chart">
          <div class="y-axis rev-y"><span>$10k</span><span>$5k</span><span>0</span></div>
          <div class="rev-bars">
            <span v-for="(b, i) in revenueBars" :key="i" :style="{ height: b + '%' }"></span>
          </div>
        </div>
        <div class="rev-months">
          <span v-for="m in revMonths" :key="m">{{ m }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import logo from '../assets/images/logo.png'
import Checkbox from '../components/Checkbox.vue'

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
onBeforeUnmount(() => window.removeEventListener('resize', moveIndicator))

function onPill(p) {
  emit('navigate', p.id)
}

// ── Swiper 제어 ──
let swiperRef = null
const onSwiper = (s) => { swiperRef = s }
function prev() { swiperRef?.slidePrev() }
function next() { swiperRef?.slideNext() }

// ── 임시(placeholder) 레스토랑 데이터 ──
const days = ['월', '화', '수', '목', '금', '토']
const turnoverBars = [55, 48, 64, 72, 88, 96]

const calDays = [16, 17, 18, 19, 20, 21, 22]

const reservations = ref([
  { t: '12:00', s: '4인 · 창가석', done: true },
  { t: '12:30', s: '2인 · 바 테이블', done: true },
  { t: '13:00', s: '6인 · 룸', done: true },
  { t: '18:00', s: '단체 12인 예약', done: true },
  { t: '19:00', s: '2인 · 기념일', done: false },
  { t: '19:30', s: '4인 · 창가석', done: false },
  { t: '20:00', s: '생일 케이크 요청', done: false },
])

const dishes = [
  { name: '트러플 크림 파스타', price: '₩18,000', tag: '신메뉴 · 점심 한정', icon: 'ramen_dining', grad: 'linear-gradient(135deg, #f0a64d, #e8893a)' },
  { name: '시그니처 버거', price: '₩15,000', tag: '베스트셀러', icon: 'lunch_dining', grad: 'linear-gradient(135deg, #e6705a, #d4504a)' },
  { name: '딸기 티라미수', price: '₩9,000', tag: '주말 한정 디저트', icon: 'cake', grad: 'linear-gradient(135deg, #e88fb0, #c76b9e)' },
]

const revMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
// 촘촘한 막대 — 결정적 패턴(랜덤 미사용)
const revenueBars = Array.from({ length: 48 }, (_, i) => {
  const v = 40 + 45 * Math.abs(Math.sin(i / 2.3)) * (0.55 + 0.45 * (i / 48))
  return Math.round(Math.min(96, Math.max(12, v)))
})

// 신규 고객 추이 영역 차트 경로
const leadVals = [88, 96, 84, 102, 95, 118, 110, 128, 120, 140, 132, 152]
const leadArea = (() => {
  const max = Math.max(...leadVals)
  const W = 100, H = 50
  const stepX = W / (leadVals.length - 1)
  const coords = leadVals.map((v, i) => [
    +(i * stepX).toFixed(2),
    +(H - (v / max) * (H - 8) - 4).toFixed(2),
  ])
  const line = coords.map((c, i) => (i ? 'L' : 'M') + c[0] + ' ' + c[1]).join(' ')
  return { line, area: line + ` L ${W} ${H} L 0 ${H} Z` }
})()
</script>
