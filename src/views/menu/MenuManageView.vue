<template>
  <PageLayout class="menu-manage">
    <!-- 툴바: 탭 / 검색·등록 -->
    <template #toolbar>
      <div class="tabs">
        <button
          v-for="t in tabs"
          :key="t.value"
          type="button"
          class="tab"
          :class="{ active: activeTab === t.value }"
          @click="activeTab = t.value"
        >{{ t.label }}<span class="mc-count">{{ t.count }}</span></button>
      </div>
    </template>
    <template #actions>
      <div class="search mc-search">
        <span class="material-symbols-outlined">search</span>
        <input v-model="search" type="text" placeholder="메뉴명·설명 검색" />
      </div>
      <Button variant="dark" size="sm" icon="add" @click="openCreate">메뉴 등록</Button>
    </template>

    <!-- 대메뉴(카테고리)별 그룹 목록 -->
    <div class="mg-scroll card" v-os="{ options: { overflow: { x: 'hidden' } } }">
      <template v-if="groupedItems.length">
        <section v-for="g in groupedItems" :key="g.category" class="mg-group">
          <div class="mg-group-head">
            <span class="mg-group-name">{{ g.category }}</span>
            <span class="mg-group-count">{{ g.items.length }}</span>
          </div>
          <div class="mg-list">
            <div
              v-for="it in g.items"
              :key="it.id"
              class="mg-row clickable"
              @click="openEdit(it)"
            >
              <span class="mg-name">
                <span class="truncate">{{ it.name }}</span>
                <Badge v-if="it.soldOut" tone="red">품절</Badge>
              </span>
              <span class="mg-desc truncate">{{ it.desc || '-' }}</span>
              <span class="mg-price tnum">{{ priceRange(it) }}</span>
              <button class="ghost-icon-btn mg-del" aria-label="삭제" @click.stop="askDelete(it)">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        </section>
      </template>
      <div v-else class="mg-empty">
        <span class="material-symbols-outlined">{{ search ? 'search_off' : 'restaurant_menu' }}</span>
        <p>{{ search ? '검색 결과가 없습니다.' : '등록된 메뉴가 없습니다.' }}</p>
      </div>
    </div>

    <!-- 등록/수정 모달 -->
    <Modal v-model="editOpen" :title="editing ? '메뉴 수정' : '메뉴 등록'" width="560px">
      <div v-if="form" class="mf">
        <div class="mf-row">
          <span class="mf-label">구분</span>
          <Badge :tone="form.type === MENU_TYPE.SET ? 'purple' : 'gray'">{{ MENU_TYPE_LABEL[form.type] }}</Badge>
        </div>
        <div class="mf-row">
          <span class="mf-label">카테고리</span>
          <Select v-model="form.category" :options="categoryOptions(form.type)" :style="{ width: '200px' }" />
        </div>
        <div class="mf-row">
          <span class="mf-label">메뉴명</span>
          <div class="mf-field" :class="{ invalid: formError && !form.name.trim() }">
            <Input v-model="form.name" placeholder="메뉴명" maxlength="40" />
          </div>
        </div>
        <div class="mf-row">
          <span class="mf-label">설명</span>
          <Input v-model="form.desc" placeholder="구성/설명 (선택)" maxlength="120" />
        </div>
        <div class="mf-row mf-row-top">
          <span class="mf-label">가격 구성</span>
          <div class="mf-tiers">
            <div v-for="(t, i) in form.tiers" :key="i" class="mf-tier">
              <Input v-model="t.label" placeholder="옵션명 (예: 일반특선·한우)" maxlength="30" />
              <Input class="mf-price" type="number" :min="0" v-model="t.price" />
              <span class="mf-won">원</span>
              <button class="ghost-icon-btn" aria-label="가격 항목 삭제" :disabled="form.tiers.length <= 1" @click="removeTier(i)">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <Button variant="outline" size="sm" icon="add" @click="addTier">가격 항목 추가</Button>
          </div>
        </div>
        <div class="mf-row">
          <span class="mf-label">품절</span>
          <ToggleSwitch v-model="form.soldOut" aria-label="품절 여부" />
        </div>
      </div>
      <template #footer>
        <Button variant="outline" @click="editOpen = false">취소</Button>
        <Button variant="primary" icon="save" @click="saveForm">저장</Button>
      </template>
    </Modal>

    <!-- 삭제 확인 -->
    <Modal v-model="confirmDelete" title="메뉴 삭제" width="400px">
      <p class="mc-confirm">‘{{ deleteTarget?.name }}’ 메뉴를 삭제할까요?</p>
      <template #footer>
        <Button variant="outline" @click="confirmDelete = false">취소</Button>
        <Button variant="dark" icon="delete" @click="doDelete">삭제</Button>
      </template>
    </Modal>

    <!-- 안내 토스트 -->
    <Toast v-model="toastShow" :message="toastMsg" />
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Badge from '../../components/ui/Badge.vue'
import Button from '../../components/ui/Button.vue'
import Input from '../../components/ui/Input.vue'
import Select from '../../components/ui/Select.vue'
import ToggleSwitch from '../../components/ui/ToggleSwitch.vue'
import Modal from '../../components/overlay/Modal.vue'
import Toast from '../../components/overlay/Toast.vue'
import PageLayout from '../../components/layout/PageLayout.vue'
import { INITIAL_MENU, MENU_TYPE, MENU_TYPES, MENU_TYPE_LABEL, MENU_STORE_KEY, CATEGORIES, categoryOptions, priceRange, newId } from './menuData.js'

const props = defineProps({
  defaultTab: { type: String, default: MENU_TYPE.MAIN }, // 'MAIN'(대메뉴) | 'SET'(세트메뉴)
})

// 안내 토스트
const toastShow = ref(false)
const toastMsg = ref('')
function flash(msg) { toastMsg.value = msg; toastShow.value = true }

const clone = (o) => JSON.parse(JSON.stringify(o))

// ── 데이터 (목 + localStorage 유지) ─────────────────────────────────────────
const STORE_KEY = MENU_STORE_KEY
const items = ref([])

// TODO: 실제 메뉴 목록 조회 API로 교체
function loadItems() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const d = JSON.parse(raw)
      if (Array.isArray(d) && d.length) { items.value = d; return }
    }
  } catch { /* 무시 */ }
  items.value = INITIAL_MENU.map(clone)
}
// TODO: 실제 메뉴 저장 API로 교체
function persist() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(items.value)) } catch { /* 무시 */ }
}
onMounted(loadItems)

// ── 탭/검색/목록 ────────────────────────────────────────────────────────────
const activeTab = ref(props.defaultTab === MENU_TYPE.SET ? MENU_TYPE.SET : MENU_TYPE.MAIN)
const search = ref('')

const tabs = computed(() =>
  MENU_TYPES.map((t) => ({ value: t.code, label: t.label, count: items.value.filter((i) => i.type === t.code).length }))
)

// 활성 탭의 항목을 대메뉴(카테고리)별로 그룹핑
const groupedItems = computed(() => {
  const q = search.value.trim().toLowerCase()
  const inTab = items.value.filter((i) => i.type === activeTab.value)
  const filtered = q
    ? inTab.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        (i.desc || '').toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q))
    : inTab
  // 정의된 카테고리 순서를 유지하고, 정의 밖 카테고리는 뒤에 추가
  const order = [...(CATEGORIES[activeTab.value] || [])]
  filtered.forEach((i) => { if (!order.includes(i.category)) order.push(i.category) })
  return order
    .map((cat) => ({ category: cat, items: filtered.filter((i) => i.category === cat) }))
    .filter((g) => g.items.length)
})

// ── 등록/수정 ───────────────────────────────────────────────────────────────
const editOpen = ref(false)
const editing = ref(null) // 수정 대상(원본 참조) / null이면 신규
const form = ref(null)
const formError = ref(false)

function blankForm(type) {
  return {
    id: null,
    type,
    category: (CATEGORIES[type] || [])[0] || '',
    name: '',
    desc: '',
    soldOut: false,
    tiers: [{ label: '', price: 0 }],
  }
}
function openCreate() {
  editing.value = null
  form.value = blankForm(activeTab.value)
  formError.value = false
  editOpen.value = true
}
function openEdit(item) {
  editing.value = item
  form.value = clone(item)
  formError.value = false
  editOpen.value = true
}
function addTier() { form.value.tiers.push({ label: '', price: 0 }) }
function removeTier(i) { if (form.value.tiers.length > 1) form.value.tiers.splice(i, 1) }

function saveForm() {
  const name = (form.value.name || '').trim()
  if (!name) { formError.value = true; flash('메뉴명을 입력해 주세요.'); return }
  const tiers = form.value.tiers.map((t) => ({ label: (t.label || '').trim(), price: Number(t.price) || 0 }))
  const payload = { ...form.value, name, desc: (form.value.desc || '').trim(), tiers: tiers.length ? tiers : [{ label: '', price: 0 }] }

  if (editing.value) {
    Object.assign(editing.value, payload) // 원본 갱신(반응형)
    flash('메뉴를 수정했습니다.')
  } else {
    payload.id = newId()
    items.value.unshift(payload)
    activeTab.value = payload.type
    flash('메뉴를 등록했습니다.')
  }
  persist()
  editOpen.value = false
}

// ── 삭제 ────────────────────────────────────────────────────────────────────
const confirmDelete = ref(false)
const deleteTarget = ref(null)
function askDelete(item) { deleteTarget.value = item; confirmDelete.value = true }
function doDelete() {
  items.value = items.value.filter((i) => i.id !== deleteTarget.value?.id)
  confirmDelete.value = false
  deleteTarget.value = null
  persist()
  flash('메뉴를 삭제했습니다.')
}
</script>

<style lang="scss" scoped>
/* 툴바 내부(레이아웃 셸은 PageLayout이 담당) */
.mc-count { margin-left: 6px; font-size: 11px; font-weight: 700; opacity: 0.75; }
.mc-search { width: 240px; max-width: 100%; }

/* 대메뉴(카테고리) 그룹 목록 */
.mg-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 6px 14px 14px;
}
.mg-group { margin-top: 12px; }
.mg-group:first-child { margin-top: 2px; }
.mg-group-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  background: var(--card);
  border-bottom: 1px solid var(--line);
}
.mg-group-name { font-size: 14px; font-weight: 800; color: var(--text); }
.mg-group-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 6px;
  border-radius: 999px; background: #f1efe9;
  font-size: 11px; font-weight: 700; color: var(--muted);
}
.mg-list { display: flex; flex-direction: column; }
.mg-row {
  display: grid;
  grid-template-columns: minmax(140px, 1fr) minmax(180px, 1.6fr) 160px 36px;
  align-items: center;
  gap: 10px;
  min-width: 560px;
  height: 48px;
  padding: 0 12px;
  border-bottom: 1px solid #f3f2ef;
  border-radius: 8px;
  transition: background 0.12s;
}
.mg-row.clickable { cursor: pointer; }
.mg-row:hover { background: rgba(0, 0, 0, 0.03); }
.mg-name { display: flex; align-items: center; gap: 8px; min-width: 0; font-weight: 600; color: var(--text); }
.mg-desc { color: var(--muted); font-size: 13px; font-weight: 500;}
.mg-price { font-weight: 700; text-align: right; }
.mg-del { justify-self: end; }

.mg-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; padding: 60px 0; color: var(--muted);
  .material-symbols-outlined { font-size: 44px; color: #c4c6cd; }
  p { font-size: 14px; }
}

/* 편집 폼 */
.mf { display: flex; flex-direction: column; gap: 14px; }
.mf-row { display: flex; align-items: center; gap: 12px; }
.mf-row-top { align-items: flex-start; }
.mf-label { flex: 0 0 76px; font-size: 13px; font-weight: 600; color: var(--muted); padding-top: 2px; }
.mf-field { flex: 1; min-width: 0; }
.mf-field.invalid :deep(.ui-input) { border-color: #e5484d; }
.mf-row > :deep(.ui-input) { flex: 1; min-width: 0; }

.mf-tiers { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.mf-tier { display: flex; align-items: center; gap: 8px; }
.mf-tier :deep(.ui-input) { flex: 1; min-width: 0; }
.mf-tier .mf-price { flex: 0 0 96px; }
.mf-tier .mf-price :deep(.ui-input) { text-align: right; }
.mf-won { font-size: 13px; color: var(--muted); }

.mc-confirm { margin: 0; font-size: 14px; line-height: 1.6; color: var(--text); }

@media (max-width: 640px) {
  .mg-row { grid-template-columns: minmax(0, 1fr) auto 36px; min-width: 0; }
  .mg-desc { display: none; }
}
</style>
