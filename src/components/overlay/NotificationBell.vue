<template>
  <div class="noti">
    <button
      type="button"
      :class="triggerClass"
      :aria-label="`알림 ${unread ? unread + '개 안읽음' : ''}`"
      @click="open = !open"
    >
      <span class="material-symbols-outlined">notifications</span>
      <span v-if="unread" class="noti-badge">{{ unread > 9 ? '9+' : unread }}</span>
    </button>

    <div v-if="open" class="noti-backdrop" @click="open = false"></div>

    <Transition name="noti-pop">
      <div v-if="open" class="noti-layer">
        <div class="noti-head">
          <span class="noti-title">알림</span>
          <span class="noti-headcount">{{ items.length }}</span>
        </div>

        <ul class="noti-list">
          <li v-for="n in visible" :key="n.id" class="noti-item" :class="{ unread: n.unread }">
            <span class="noti-ic material-symbols-outlined" :class="'t-' + n.type">{{ ICONS[n.type] || 'info' }}</span>
            <div class="noti-body">
              <div class="noti-msg">{{ n.msg }}</div>
              <div class="noti-time">{{ n.time }}</div>
            </div>
          </li>
          <li v-if="!items.length" class="noti-empty">새 알림이 없습니다.</li>
        </ul>

        <button type="button" class="noti-more" @click="goAll">
          전체 알림 보기
          <span v-if="items.length > max" class="noti-rest">+{{ items.length - max }}</span>
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  // 트리거 버튼 클래스 (대시보드: hicon / 서브: icon-btn)
  triggerClass: { type: String, default: 'hicon' },
  max: { type: Number, default: 10 },
  // 전체보기 시 이동할 화면 id (기본: 수정 이력 로그)
  to: { type: String, default: 'sys-log' },
  items: {
    type: Array,
    default: () => DEFAULT_ITEMS,
  },
})
const emit = defineEmits(['navigate'])

const open = ref(false)
const visible = computed(() => props.items.slice(0, props.max))
const unread = computed(() => props.items.filter((n) => n.unread).length)

function goAll() {
  open.value = false
  emit('navigate', props.to)
}
function onKey(e) {
  if (e.key === 'Escape') open.value = false
}
watch(open, (v) => {
  if (v) document.addEventListener('keydown', onKey)
  else document.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<script>
// 활동 유형별 아이콘
const ICONS = {
  add: 'add_circle',
  edit: 'edit',
  delete: 'delete',
  stock: 'warning',
  upload: 'upload_file',
  refund: 'undo',
  done: 'check_circle',
}

// 임시 알림(활동 로그) 데이터 — 진행/수정/삭제/재고/업로드 등
const DEFAULT_ITEMS = [
  { id: 1, type: 'edit', msg: '6월 21일 매출이 수정되었습니다', time: '방금 전', unread: true },
  { id: 2, type: 'add', msg: '신규 주문 14건이 등록되었습니다', time: '12분 전', unread: true },
  { id: 3, type: 'delete', msg: '중복 주문 2건이 삭제되었습니다', time: '38분 전', unread: true },
  { id: 4, type: 'stock', msg: '한우 등심 재고가 부족합니다 (2인분)', time: '1시간 전', unread: true },
  { id: 5, type: 'upload', msg: '엑셀 일괄 업로드 완료 — 124행 반영', time: '2시간 전' },
  { id: 6, type: 'refund', msg: '환불 처리 1건 (₩26,000)', time: '3시간 전' },
  { id: 7, type: 'done', msg: '6월 20일 정산·마감이 완료되었습니다', time: '어제' },
  { id: 8, type: 'edit', msg: '메뉴 "트러플 파스타" 가격이 변경되었습니다', time: '어제' },
  { id: 9, type: 'stock', msg: '생맥주 1000cc 소진 임박 (5잔)', time: '어제' },
  { id: 10, type: 'add', msg: '신규 리뷰 8건이 등록되었습니다', time: '2일 전' },
  { id: 11, type: 'delete', msg: '예약 1건이 취소되었습니다', time: '2일 전' },
  { id: 12, type: 'upload', msg: '근태 엑셀 업로드 완료 — 직원 6명', time: '3일 전' },
  { id: 13, type: 'edit', msg: '시급 설정이 수정되었습니다', time: '3일 전' },
]
export { ICONS, DEFAULT_ITEMS }
</script>

<style scoped>
.noti {
  position: relative;
  display: inline-flex;
}

.noti-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  background: #ef4444;
  border-radius: 999px;
}

.noti-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
}

.noti-layer {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 61;
  width: 340px;
  max-width: 86vw;
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 14px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.noti-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px 16px;
  border-bottom: 1px solid #f1f1ee;
}
.noti-title {
  font-size: 14px;
  font-weight: 700;
  color: #1b1b1f;
}
.noti-headcount {
  font-size: 11px;
  font-weight: 700;
  color: #8b8d96;
  background: #f1f1ee;
  border-radius: 999px;
  padding: 1px 8px;
}

.noti-list {
  list-style: none;
  margin: 0;
  padding: 4px;
  max-height: 360px;
  overflow-y: auto;
}
.noti-item {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 10px 10px;
  border-radius: 10px;
}
.noti-item.unread {
  background: rgba(242, 226, 78, 0.12);
}
.noti-ic {
  flex-shrink: 0;
  font-size: 20px;
  margin-top: 1px;
}
.noti-ic.t-add { color: #16a34a; }
.noti-ic.t-edit { color: #3b82f6; }
.noti-ic.t-delete { color: #dc2626; }
.noti-ic.t-refund { color: #dc2626; }
.noti-ic.t-stock { color: #f59e0b; }
.noti-ic.t-upload { color: #8b5cf6; }
.noti-ic.t-done { color: #16a34a; }
.noti-body { min-width: 0; }
.noti-msg {
  font-size: 13px;
  font-weight: 500;
  color: #2a2c32;
  line-height: 1.4;
}
.noti-time {
  margin-top: 3px;
  font-size: 11.5px;
  color: #9a9aa2;
}
.noti-empty {
  padding: 28px 10px;
  text-align: center;
  font-size: 13px;
  color: #9a9aa2;
}

.noti-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 12px;
  border: 0;
  border-top: 1px solid #f1f1ee;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #1b1b1f;
  cursor: pointer;
  transition: background 0.12s;
}
.noti-more:hover { background: #f7f6f1; }
.noti-more .noti-rest {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: #ef4444;
  border-radius: 999px;
  padding: 1px 7px;
}
.noti-more .material-symbols-outlined { font-size: 18px; }

/* 다크 대시보드에서 레이어를 다크로 */
:global(.home.theme-dark) .noti-layer {
  background: #26262b;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.5);
}
:global(.home.theme-dark) .noti-head,
:global(.home.theme-dark) .noti-more { border-color: rgba(255, 255, 255, 0.08); }
:global(.home.theme-dark) .noti-title,
:global(.home.theme-dark) .noti-msg,
:global(.home.theme-dark) .noti-more { color: #f2f2f4; }
:global(.home.theme-dark) .noti-headcount { color: #c9c9cf; background: rgba(255, 255, 255, 0.08); }
:global(.home.theme-dark) .noti-more:hover { background: rgba(255, 255, 255, 0.06); }

/* 팝오버 트랜지션 */
.noti-pop-enter-active,
.noti-pop-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.noti-pop-enter-from,
.noti-pop-leave-to { opacity: 0; transform: translateY(-6px); }

/* 모바일: 화면 밖으로 나가지 않게 가운데 정렬 + 내용 전체 표시 */
@media (max-width: 640px) {
  .noti-backdrop {
    background: rgba(0, 0, 0, 0.35);
  }
  .noti-layer {
    position: fixed;
    top: 60px;
    left: 50%;
    right: auto;
    width: 92vw;
    max-width: 92vw;
    margin-left: -46vw; /* 92vw의 절반 → 가운데 정렬(transform은 트랜지션용으로 비움) */
    max-height: 78vh;
    display: flex;
    flex-direction: column;
  }
  .noti-head,
  .noti-more { flex-shrink: 0; }
  .noti-list {
    flex: 1;
    min-height: 0;
    max-height: none; /* 레이어 높이에 맞춰 스크롤 → 내용 잘림 없음 */
  }
}
</style>
