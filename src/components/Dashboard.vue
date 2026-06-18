<template>
  <div class="home">
    <!-- 상단 네비게이션 -->
    <header class="home-nav">
      <div class="home-brand">
        <img class="home-logo" :src="logo" alt="로고" />
      </div>

      <nav class="home-pills">
        <button type="button" class="hpill active">
          <span class="material-symbols-outlined">dashboard</span> 홈
        </button>
        <button
          v-for="m in menus"
          :key="m.id"
          type="button"
          class="hpill icon-only"
          :title="m.label"
          @click="$emit('navigate', m.id)"
        >
          <span class="material-symbols-outlined">{{ m.icon }}</span>
        </button>
      </nav>

      <div class="home-right">
        <button class="hicon"><span class="material-symbols-outlined">settings</span></button>
        <button class="hicon"><span class="material-symbols-outlined">notifications</span></button>
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
      <h1 class="home-title">Property Overview</h1>
      <button class="home-share" @click="$emit('navigate', 'viewer')">
        <span class="material-symbols-outlined">ios_share</span> Share
      </button>
    </div>

    <div class="home-grid">
      <!-- Deal Closure Rate -->
      <div class="card g-deal">
        <div class="card-title">Deal Closure Rate</div>
        <div class="deal-top">
          <span class="big-stat">86<span class="big-unit">%</span></span>
          <span class="stat-sub">of plan</span>
        </div>
        <div class="deal-chart">
          <div class="y-axis"><span>100</span><span>50</span><span>0</span></div>
          <div class="vbars">
            <div v-for="(b, i) in dealBars" :key="i" class="vbar-col">
              <div class="vbar" :style="{ height: b + '%' }"></div>
              <span class="vbar-label">{{ months[i] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Active listings / Deals in progress -->
      <div class="g-stats">
        <div class="card mini-stat">
          <div class="card-title">Active listings</div>
          <span class="corner-arrow material-symbols-outlined">north_east</span>
          <div class="big-stat sm">26</div>
          <div class="stat-sub">+ 6 vs last week</div>
        </div>
        <div class="card mini-stat">
          <div class="card-title">Deals in progress</div>
          <span class="corner-arrow material-symbols-outlined">north_east</span>
          <div class="big-stat sm">7</div>
          <div class="stat-sub">+ 1 vs last week</div>
        </div>
      </div>

      <!-- Lead Trends -->
      <div class="card g-leads">
        <div class="card-title">Lead Trends</div>
        <div class="deal-top">
          <span class="big-stat sm">32</span>
          <span class="stat-sub">average per month</span>
        </div>
        <div class="lead-wrap">
          <span class="lead-tip">April: 30 leads</span>
          <svg class="area-svg" viewBox="0 0 100 50" preserveAspectRatio="none">
            <defs>
              <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#9bd97a" stop-opacity="0.5" />
                <stop offset="100%" stop-color="#9bd97a" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="leadArea.area" fill="url(#leadGrad)" />
            <path :d="leadArea.line" fill="none" stroke="#6cc04a" stroke-width="1.6" />
          </svg>
        </div>
      </div>

      <!-- 우측 레일: 캘린더 + 일정 + Pro -->
      <div class="g-rail">
        <div class="card rail-card">
          <div class="cal-head">
            <button class="cal-nav"><span class="material-symbols-outlined">chevron_left</span></button>
            <span class="cal-month">April</span>
            <button class="cal-nav"><span class="material-symbols-outlined">chevron_right</span></button>
          </div>
          <div class="cal-days">
            <button
              v-for="d in calDays"
              :key="d"
              class="cal-day"
              :class="{ active: d === 15 }"
            >{{ d }}</button>
          </div>

          <div class="schedule-title">Schedule</div>
          <ul class="schedule">
            <li v-for="(s, i) in schedule" :key="i">
              <span class="sch-time">{{ s.t }}</span>
              <span class="sch-text">{{ s.s }}</span>
              <span class="sch-check" :class="{ done: s.done }">
                <span v-if="s.done" class="material-symbols-outlined">check</span>
              </span>
            </li>
          </ul>
        </div>

        <div class="card cta-card">
          <div class="cta-title">Pro subscription</div>
          <div class="cta-sub">Everything an agent needs: listings, showings, leads, and deals</div>
          <button class="btn-dark wide">Get Pro for $9.99</button>
        </div>
      </div>

      <!-- New properties (Swiper) -->
      <div class="card g-new">
        <div class="np-head">
          <button class="np-nav np-prev" @click="prev"><span class="material-symbols-outlined">chevron_left</span></button>
          <span class="np-title">New properties</span>
          <button class="np-nav np-next" @click="next"><span class="material-symbols-outlined">chevron_right</span></button>
        </div>
        <Swiper
          class="np-swiper"
          :slides-per-view="1"
          :space-between="12"
          :loop="true"
          @swiper="onSwiper"
        >
          <SwiperSlide v-for="(p, i) in properties" :key="i">
            <div class="np-photo" :style="{ background: p.grad }">
              <span class="material-symbols-outlined">home</span>
            </div>
            <div class="np-info">
              <div>
                <div class="np-name">{{ p.name }}</div>
                <div class="np-avail">{{ p.avail }}</div>
              </div>
              <div class="np-price">{{ p.price }}</div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <!-- Revenue -->
      <div class="card g-revenue">
        <div class="card-head">
          <div>
            <div class="card-title">Revenue</div>
            <div class="big-stat">$8,512<span class="big-unit"> average per month</span></div>
          </div>
          <span class="dropdown-pill">6 months <span class="material-symbols-outlined">expand_more</span></span>
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
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import logo from '../assets/images/logo.png'

defineProps({
  menus: { type: Array, default: () => [] },
  userName: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  avatarInitial: { type: String, default: '' },
})
defineEmits(['navigate', 'open-sheet', 'file'])

// ── Swiper 제어 ──
let swiperRef = null
const onSwiper = (s) => { swiperRef = s }
function prev() { swiperRef?.slidePrev() }
function next() { swiperRef?.slideNext() }

// ── 임시(placeholder) 데이터 ──
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const dealBars = [62, 44, 72, 96, 68, 82]

const calDays = [12, 13, 14, 15, 16, 17, 18]

const schedule = [
  { t: '09:00', s: 'Client call', done: true },
  { t: '10:00', s: 'Property showing', done: true },
  { t: '11:30', s: 'Follow-up with buyer', done: true },
  { t: '13:00', s: 'Lunch break', done: true },
  { t: '14:00', s: 'Listing update', done: false },
  { t: '15:30', s: 'Document review', done: false },
  { t: '17:00', s: 'Client meeting', done: false },
]

const properties = [
  { name: 'Country house', price: '$2,400/month', avail: 'Available from Aug 15', grad: 'linear-gradient(135deg, #8fb8e6, #a7cf86)' },
  { name: 'City apartment', price: '$1,800/month', avail: 'Available now', grad: 'linear-gradient(135deg, #e6b58f, #e68f9c)' },
  { name: 'Beach villa', price: '$4,200/month', avail: 'Available from Sep 1', grad: 'linear-gradient(135deg, #8fe6d6, #6cc0e6)' },
]

const revMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
// 촘촘한 막대 — 결정적 패턴(랜덤 미사용)
const revenueBars = Array.from({ length: 48 }, (_, i) => {
  const v = 40 + 45 * Math.abs(Math.sin(i / 2.3)) * (0.55 + 0.45 * (i / 48))
  return Math.round(Math.min(96, Math.max(12, v)))
})

// Lead Trends 영역 차트 경로
const leadVals = [18, 20, 16, 22, 19, 24, 21, 28, 25, 30, 27, 33]
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
