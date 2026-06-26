<template>
  <div class="page-col seat-editor">
    <!-- 툴바 -->
    <div class="seat-toolbar card">
      <div class="tb-group tb-stats">
        <span class="tb-stat"><b>{{ tableCount }}</b> 테이블</span>
        <span class="tb-stat"><b>{{ totalSeats }}</b> 좌석</span>
        <span class="tb-stat"><b>{{ fixtureCount }}</b> 기타</span>
      </div>
      <div class="tb-group">
        <Button variant="dark" icon="add_circle" :disabled="editMode" @click="addTable('round')">원형 테이블</Button>
        <Button variant="dark" icon="add_box" :disabled="editMode" @click="addTable('rect')">사각 테이블</Button>
        <Select
          v-model="fixturePick"
          :options="fixtureOptions"
          placeholder="선택"
          :disabled="editMode"
        />
        <Button variant="outline" icon="restart_alt" :disabled="editMode" @click="resetLayout">초기화</Button>
      </div>
    </div>

    <!-- 캔버스 + 속성 패널 -->
    <div class="seat-body">
      <div class="seat-canvas card">
        <!-- Konva 전용 호스트(이 안에는 Vue 관리 요소를 두지 않는다) -->
        <div ref="stageBox" class="stage-host"></div>

        <!-- 오버레이는 호스트의 형제로 분리 (Vue 패칭과 Konva DOM 충돌 방지) -->
        <div v-if="!tables.length" class="canvas-hint">
          <span class="material-symbols-outlined">table_restaurant</span>
          <p>상단의 <b>테이블 추가</b> 버튼으로 좌석 배치를 시작하세요.</p>
        </div>

        <!-- 캔버스 위 인라인 이름 편집(더블클릭) -->
        <input
          v-if="editing"
          ref="nameInput"
          class="name-edit"
          :style="{ left: editing.x + 'px', top: editing.y + 'px' }"
          v-model="editing.value"
          maxlength="12"
          @keydown.enter.prevent="commitEdit"
          @keydown.esc.prevent="cancelEdit"
          @blur="commitEdit"
        />
      </div>

      <aside class="seat-props card">
        <div class="sp-head">
          <span class="material-symbols-outlined">event_seat</span>
          <span>좌석 목록</span>
          <span v-if="tables.length" class="sp-badge">{{ tables.length }}</span>
        </div>

        <!-- 목록 (보기/수정 모드) -->
        <ul v-if="displayList.length" class="seat-list" v-os="{ options: { overflow: { x: 'hidden' } } }">
          <!-- 보기 모드 -->
          <template v-if="!editMode">
            <li
              v-for="t in tables"
              :key="t.id"
              class="seat-row"
              :class="{ active: t.id === selectedId, fixture: t.kind === 'fixture' }"
              @click="selectTable(t.id)"
            >
              <span class="sr-dot" :style="{ background: t.color }"></span>
              <span class="sr-name truncate">{{ t.label }}</span>
              <span class="sr-shape material-symbols-outlined">{{ iconFor(t) }}</span>
              <span v-if="t.kind === 'fixture'" class="sr-seats">기타</span>
              <span v-else class="sr-seats tnum">{{ t.seats }}석</span>
            </li>
          </template>

          <!-- 수정 모드 -->
          <template v-else>
            <li v-for="d in draft" :key="d.id" class="seat-edit">
              <div class="se-row">
                <span class="sr-dot" :style="{ background: d.color }"></span>
                <Input v-model="d.label" :placeholder="d.kind === 'fixture' ? '영역 이름' : '테이블 이름'" maxlength="12" />
                <button class="se-del" aria-label="삭제" @click="removeDraft(d.id)">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
              <div class="se-row se-sub">
                <template v-if="d.kind !== 'fixture'">
                  <span class="se-lab">좌석</span>
                  <Input class="se-seats" type="number" :min="1" :max="20" v-model="d.seats" />
                </template>
                <div class="se-colors">
                  <button
                    v-for="c in SWATCHES"
                    :key="c"
                    class="sw"
                    :class="{ on: d.color === c }"
                    :style="{ background: c }"
                    @click="d.color = c"
                  />
                </div>
              </div>
            </li>
          </template>
        </ul>

        <div v-else class="sp-empty">
          <span class="material-symbols-outlined">event_seat</span>
          <p>아직 생성된 테이블이 없습니다.</p>
          <p class="sp-tip">상단 버튼으로 테이블을 추가하세요.</p>
        </div>

        <!-- 하단 액션 -->
        <div class="sp-actions">
          <template v-if="!editMode">
            <Button variant="dark" icon="edit" :disabled="!tables.length" @click="enterEditMode">수정</Button>
          </template>
          <template v-else>
            <Button variant="outline" @click="cancelEditMode">취소</Button>
            <Button variant="primary" icon="save" @click="saveEditMode">저장</Button>
          </template>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Konva from 'konva'
import Button from '../../components/ui/Button.vue'
import Input from '../../components/ui/Input.vue'
import Select from '../../components/ui/Select.vue'

const GRID = 20
const STORE_KEY = 'seat-layout-v1'
const PALETTE = ['#f6b48f', '#a3c4f3', '#9ee0bd', '#f7bdd8', '#c9bdf2', '#f5cf7a', '#9ad7d0']
const MIN = 56

// 좌석 없는 인테리어 프리셋(쇼파·카운터·샐러드바·기타 영역)
const FIXTURES = [
  { key: 'sofa', label: '쇼파', icon: 'weekend', w: 150, h: 70, color: '#d8cfc0' },
  { key: 'counter', label: '카운터', icon: 'point_of_sale', w: 170, h: 54, color: '#cbb693' },
  { key: 'salad', label: '샐러드바', icon: 'local_dining', w: 120, h: 84, color: '#bcd6ad' },
  { key: 'etc', label: '기타 영역', icon: 'dashboard', w: 110, h: 90, color: '#cfd3d9' },
]
const fixtureOptions = FIXTURES.map((f) => ({ label: f.label, value: f.key }))
// 색상 스와치: 테이블용 파스텔 + 인테리어용 뉴트럴
const SWATCHES = [...PALETTE, '#d8cfc0', '#cbb693', '#bcd6ad', '#cfd3d9']

// ── 상태(데이터) — Konva 노드는 이 데이터로부터 생성 ──────────────────────
const tables = ref([])
const selectedId = ref(null)
const selected = computed(() => tables.value.find((t) => t.id === selectedId.value) || null)
const totalSeats = computed(() => tables.value.reduce((s, t) => s + (t.kind === 'fixture' ? 0 : t.seats), 0))
const tableCount = computed(() => tables.value.filter((t) => t.kind !== 'fixture').length)
const fixtureCount = computed(() => tables.value.filter((t) => t.kind === 'fixture').length)

// 리스트 아이콘: 인테리어는 프리셋 아이콘, 테이블은 모양 아이콘
function iconFor(t) {
  if (t.kind === 'fixture') return t.icon || 'dashboard'
  return t.type === 'round' ? 'circle' : 'crop_square'
}

// 캔버스 인라인 이름 편집 상태 { id, x, y, value }
const editing = ref(null)
const nameInput = ref(null)

// 인테리어 Select — 선택된 값을 표시(미선택 시 placeholder), 선택 시 추가
const fixturePick = ref('')

// 우측 리스트 수정 모드
const editMode = ref(false)
const draft = ref([]) // 수정 모드용 복사본
const displayList = computed(() => (editMode.value ? draft.value : tables.value))

let uid = 1
const nextId = () => `t${uid++}`

function seedDefault() {
  tables.value = [
    { id: 't1', kind: 'table', type: 'round', x: 180, y: 160, w: 96, h: 96, seats: 4, label: 'T1', color: PALETTE[0] },
    { id: 't2', kind: 'table', type: 'rect', x: 400, y: 160, w: 130, h: 84, seats: 6, label: 'T2', color: PALETTE[1] },
    { id: 't3', kind: 'table', type: 'round', x: 180, y: 340, w: 96, h: 96, seats: 2, label: 'T3', color: PALETTE[2] },
    { id: 't4', kind: 'fixture', fixtureType: 'counter', type: 'rect', x: 420, y: 360, w: 170, h: 54, seats: 0, label: '카운터', color: '#cbb693', icon: 'point_of_sale' },
  ]
  uid = 5
}

// ── Konva ─────────────────────────────────────────────────────────────────
const stageBox = ref(null)
let stage = null
let gridLayer = null
let tableLayer = null
let transformer = null
let ro = null

function buildSeats(t) {
  const pts = []
  if (t.type === 'round') {
    const r = t.w / 2 + 13
    for (let i = 0; i < t.seats; i++) {
      const a = (i / t.seats) * Math.PI * 2 - Math.PI / 2
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r })
    }
  } else {
    const top = Math.ceil(t.seats / 2)
    const bottom = t.seats - top
    const row = (count, y) => {
      for (let i = 0; i < count; i++) {
        pts.push({ x: -t.w / 2 + (t.w * (i + 1)) / (count + 1), y })
      }
    }
    row(top, -t.h / 2 - 13)
    row(bottom, t.h / 2 + 13)
  }
  return pts
}

function buildGroup(t) {
  const g = new Konva.Group({ id: t.id, x: t.x, y: t.y, rotation: t.rotation || 0, draggable: true })

  if (t.kind === 'fixture') {
    // 인테리어 영역: 점선 사각 + 중앙 라벨, 좌석 없음
    g.add(new Konva.Rect({
      x: -t.w / 2, y: -t.h / 2, width: t.w, height: t.h, cornerRadius: 10,
      fill: t.color, stroke: 'rgba(0,0,0,0.22)', strokeWidth: 1, dash: [7, 4], name: 'body',
    }))
    const label = new Konva.Text({ text: t.label, fontSize: 13, fontStyle: 'bold', fill: '#4a463e', listening: false })
    label.offsetX(label.width() / 2)
    label.offsetY(label.height() / 2)
    g.add(label)
  } else {
    // 좌석 점(테이블 뒤쪽 레이어 순서)
    for (const p of buildSeats(t)) {
      g.add(new Konva.Circle({ x: p.x, y: p.y, radius: 7, fill: '#ffffff', stroke: '#cdd0d6', strokeWidth: 1.5, listening: false }))
    }

    // 테이블 몸체
    const shape = t.type === 'round'
      ? new Konva.Circle({ radius: t.w / 2, fill: t.color, stroke: 'rgba(0,0,0,0.12)', strokeWidth: 1, name: 'body' })
      : new Konva.Rect({ x: -t.w / 2, y: -t.h / 2, width: t.w, height: t.h, cornerRadius: 12, fill: t.color, stroke: 'rgba(0,0,0,0.12)', strokeWidth: 1, name: 'body' })
    g.add(shape)

    // 라벨 + 좌석 수
    const label = new Konva.Text({ text: t.label, fontSize: 14, fontStyle: 'bold', fill: '#3a2c00', listening: false })
    label.offsetX(label.width() / 2)
    label.y(-label.height() - 1)
    const cap = new Konva.Text({ text: `${t.seats}석`, fontSize: 11, fill: '#6b5a2a', listening: false })
    cap.offsetX(cap.width() / 2)
    cap.y(2)
    g.add(label)
    g.add(cap)
  }

  // 이벤트 (더블클릭은 stage 레벨에서 처리)
  g.on('click tap', () => selectTable(t.id))
  g.on('mouseenter', () => { stage.container().style.cursor = 'move' })
  g.on('mouseleave', () => { stage.container().style.cursor = 'default' })
  g.on('dragstart', () => cancelEdit())
  g.on('dragmove', () => {
    g.x(Math.round(g.x() / GRID) * GRID)
    g.y(Math.round(g.y() / GRID) * GRID)
  })
  g.on('dragend', () => {
    const d = tables.value.find((x) => x.id === t.id)
    if (d) { d.x = g.x(); d.y = g.y() }
  })
  g.on('transformend', () => {
    const d = tables.value.find((x) => x.id === t.id)
    if (!d) return
    const sx = g.scaleX(); const sy = g.scaleY()
    g.scaleX(1); g.scaleY(1)
    if (d.type === 'round') {
      const dia = clamp(d.w * Math.max(sx, sy))
      d.w = dia; d.h = dia
    } else {
      d.w = clamp(d.w * sx); d.h = clamp(d.h * sy)
    }
    d.rotation = Math.round(g.rotation())
    d.x = g.x(); d.y = g.y()
    renderTables() // 새 크기에 맞춰 좌석 재배치
  })

  return g
}

function clamp(v) { return Math.max(MIN, Math.round(v)) }

function renderTables() {
  if (!tableLayer) return
  transformer.remove() // 디태치(파괴 방지) 후 그룹만 정리
  tableLayer.destroyChildren()
  for (const t of tables.value) tableLayer.add(buildGroup(t))
  tableLayer.add(transformer)
  applyTransformer()
  tableLayer.draw()
}

function applyTransformer() {
  if (!transformer) return
  const node = selectedId.value ? tableLayer.findOne(`#${selectedId.value}`) : null
  if (node) {
    transformer.nodes([node])
    transformer.keepRatio(selected.value?.type === 'round')
  } else {
    transformer.nodes([])
  }
}

function drawGrid() {
  gridLayer.destroyChildren()
  const w = stage.width(); const h = stage.height()
  for (let x = 0; x <= w; x += GRID) {
    gridLayer.add(new Konva.Line({ points: [x, 0, x, h], stroke: '#eef0f2', strokeWidth: 1 }))
  }
  for (let y = 0; y <= h; y += GRID) {
    gridLayer.add(new Konva.Line({ points: [0, y, w, y], stroke: '#eef0f2', strokeWidth: 1 }))
  }
  gridLayer.draw()
}

// ── 액션 ──────────────────────────────────────────────────────────────────
function centerXY() {
  const w = stage ? stage.width() : 600
  const h = stage ? stage.height() : 400
  return { x: Math.round((w / 2) / GRID) * GRID, y: Math.round((h / 2) / GRID) * GRID }
}

function addTable(type) {
  const { x, y } = centerXY()
  const t = {
    id: nextId(),
    kind: 'table',
    type,
    x,
    y,
    w: type === 'round' ? 96 : 130,
    h: type === 'round' ? 96 : 84,
    seats: 4,
    label: `T${tableCount.value + 1}`,
    color: PALETTE[tableCount.value % PALETTE.length],
    rotation: 0,
  }
  tables.value.push(t)
  selectedId.value = t.id
  renderTables()
}

// 좌석 없는 인테리어 영역 추가
function addFixture(key) {
  if (!key) return
  const preset = FIXTURES.find((f) => f.key === key)
  if (!preset) return
  const { x, y } = centerXY()
  const t = {
    id: nextId(),
    kind: 'fixture',
    fixtureType: key,
    type: 'rect',
    x,
    y,
    w: preset.w,
    h: preset.h,
    seats: 0,
    label: preset.label,
    color: preset.color,
    icon: preset.icon,
    rotation: 0,
  }
  tables.value.push(t)
  selectedId.value = t.id
  renderTables()
}

// Select에서 인테리어 종류를 고르면 해당 영역 추가(선택값은 표시 유지)
watch(fixturePick, (key) => { if (key) addFixture(key) })

function selectTable(id) {
  selectedId.value = id
  applyTransformer()
  tableLayer.draw()
}

function clearSelection() {
  selectedId.value = null
  applyTransformer()
  tableLayer.draw()
}

function removeSelected() {
  if (!selectedId.value) return
  cancelEdit()
  tables.value = tables.value.filter((t) => t.id !== selectedId.value)
  selectedId.value = null
  renderTables()
}

// 캔버스에서 더블클릭 → 이름 인라인 편집
function startEdit(id) {
  if (editMode.value) return // 리스트 수정 중에는 인라인 편집 비활성
  const node = tableLayer.findOne(`#${id}`)
  const t = tables.value.find((x) => x.id === id)
  if (!node || !t) return
  selectedId.value = id
  applyTransformer()
  tableLayer.draw()
  const pos = node.getAbsolutePosition() // 그룹 원점 = 테이블 중심(스테이지=컨테이너 좌표)
  editing.value = { id, x: pos.x - 70, y: pos.y - 16, value: t.label }
  nextTick(() => { nameInput.value?.focus(); nameInput.value?.select() })
}
function commitEdit() {
  if (!editing.value) return
  const { id, value } = editing.value
  const v = value.trim()
  editing.value = null
  const d = tables.value.find((x) => x.id === id)
  if (d && v && v !== d.label) { d.label = v; renderTables() }
}
function cancelEdit() {
  editing.value = null
}

// Delete/Backspace → 선택 테이블 삭제 (입력 중에는 무시)
function onKeydown(e) {
  if (editing.value) return
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId.value) {
    e.preventDefault()
    removeSelected()
  }
}

// ── 우측 리스트 수정 모드 ───────────────────────────────────────────────────
function enterEditMode() {
  if (!tables.value.length) return
  cancelEdit() // 인라인 편집 중이면 해제
  draft.value = tables.value.map((t) => ({ ...t })) // 깊은 복사(평면 객체)
  editMode.value = true
}
function cancelEditMode() {
  editMode.value = false
  draft.value = []
}
function removeDraft(id) {
  draft.value = draft.value.filter((d) => d.id !== id)
}
function saveEditMode() {
  // 1) 삭제 반영
  const keep = new Set(draft.value.map((d) => d.id))
  tables.value = tables.value.filter((t) => keep.has(t.id))
  // 2) 편집 필드(이름·좌석·색상)만 반영 — 위치/크기/회전은 보존
  for (const d of draft.value) {
    const t = tables.value.find((x) => x.id === d.id)
    if (!t) continue
    const name = String(d.label || '').trim()
    if (name) t.label = name
    if (t.kind !== 'fixture') t.seats = Math.min(20, Math.max(1, parseInt(d.seats, 10) || t.seats))
    t.color = d.color
  }
  editMode.value = false
  draft.value = []
  if (selectedId.value && !tables.value.some((t) => t.id === selectedId.value)) {
    selectedId.value = null
  }
  renderTables()
}

function resetLayout() {
  seedDefault()
  selectedId.value = null
  renderTables()
}

// ── 저장/복원 ───────────────────────────────────────────────────────────────
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(tables.value)) } catch { /* 무시 */ }
}
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return false
    const data = JSON.parse(raw)
    if (!Array.isArray(data) || !data.length) return false
    tables.value = data
    uid = data.reduce((m, t) => Math.max(m, parseInt(String(t.id).replace(/\D/g, '')) || 0), 0) + 1
    return true
  } catch { return false }
}
watch(tables, save, { deep: true })

// ── 마운트 ──────────────────────────────────────────────────────────────────
function fitStage() {
  if (!stage || !stageBox.value) return
  stage.width(stageBox.value.clientWidth)
  stage.height(stageBox.value.clientHeight)
  drawGrid()
}

onMounted(() => {
  if (!load()) seedDefault()

  stage = new Konva.Stage({
    container: stageBox.value,
    width: stageBox.value.clientWidth,
    height: stageBox.value.clientHeight,
  })
  gridLayer = new Konva.Layer({ listening: false })
  tableLayer = new Konva.Layer()
  stage.add(gridLayer)
  stage.add(tableLayer)

  transformer = new Konva.Transformer({
    rotationSnaps: [0, 90, 180, 270],
    anchorSize: 9,
    anchorStroke: '#1b1b1f',
    anchorFill: '#fff',
    borderStroke: '#1b1b1f',
    borderDash: [4, 3],
    padding: 6,
    boundBoxFunc: (oldBox, newBox) => (newBox.width < MIN || newBox.height < MIN ? oldBox : newBox),
  })

  // 빈 곳 클릭 시 선택 해제
  stage.on('click tap', (e) => { if (e.target === stage) clearSelection() })

  // 더블클릭 → 해당 테이블 이름 인라인 편집 (Transformer/자식 도형 무관하게 그룹 탐색)
  stage.on('dblclick dbltap', (e) => {
    if (e.target === stage) return
    const grp = e.target.findAncestor('Group', true)
    if (grp && grp.id()) startEdit(grp.id())
  })

  drawGrid()
  renderTables()
  window.addEventListener('keydown', onKeydown)

  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(fitStage)
    ro.observe(stageBox.value)
  } else {
    window.addEventListener('resize', fitStage)
  }
})

onBeforeUnmount(() => {
  if (ro) ro.disconnect()
  else window.removeEventListener('resize', fitStage)
  window.removeEventListener('keydown', onKeydown)
  if (stage) stage.destroy()
})
</script>

<style lang="scss" scoped>
.seat-editor { gap: 14px; }

/* 툴바 */
.seat-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  flex-wrap: wrap;
  /* .card 의 overflow:hidden 이 Select 드롭다운을 자르지 않도록 해제 +
     드롭다운이 아래 캔버스 위에 확실히 뜨도록 stacking context 부여 */
  overflow: visible;
  position: relative;
  z-index: 5;
}
.tb-group { display: flex; align-items: center; gap: 8px; }
.tb-stats { gap: 16px; }
.tb-stat { font-size: 14px; color: var(--muted); }
.tb-stat b { font-size: 17px; font-weight: 800; color: var(--text); margin-right: 2px; }

/* 본문: 캔버스 + 속성 */
.seat-body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 14px;
}
.seat-canvas {
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 0;
  overflow: hidden;
}
.stage-host {
  position: absolute;
  inset: 0;
}
/* 캔버스 인라인 이름 편집 입력 */
.name-edit {
  position: absolute;
  z-index: 3;
  width: 140px;
  height: 32px;
  padding: 0 10px;
  border: 2px solid var(--ink);
  border-radius: 8px;
  background: #fff;
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
  &:focus { outline: none; }
}

.canvas-hint {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--muted);
  pointer-events: none;
  .material-symbols-outlined { font-size: 48px; color: #c4c6cd; }
  p { font-size: 14px; }
}

/* 속성 패널 */
.seat-props {
  width: 300px;
  flex-shrink: 0;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.sp-head {
  flex-shrink: 0;
  display: flex; align-items: center; gap: 8px;
  font-size: 15px; font-weight: 700; color: var(--text);
  .material-symbols-outlined { font-size: 20px; }
}
.sp-badge {
  margin-left: auto;
  min-width: 22px; height: 22px; padding: 0 7px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 999px; background: var(--ink); color: #fff;
  font-size: 12px; font-weight: 700;
}

/* 목록 (스크롤 영역) */
.seat-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-inline-start: 0;
}

/* 보기 모드 행 */
.seat-row {
  display: flex; align-items: center; gap: 10px;
  padding: 0 12px; height: 46px;
  border: 1px solid var(--line); border-radius: 12px;
  background: var(--card); cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  &:hover { background: #f6f5f2; }
  &.active { border-color: var(--ink); background: rgba(242, 226, 78, 0.12); }
}
.sr-dot { flex-shrink: 0; width: 16px; height: 16px; border-radius: 50%; }
.seat-row.fixture .sr-dot { border-radius: 5px; } /* 인테리어는 사각 점으로 구분 */
.sr-name { flex: 1; font-size: 14px; font-weight: 600; color: var(--text); }
.sr-shape { font-size: 16px; color: var(--muted); }
.sr-seats { font-size: 13px; font-weight: 600; color: var(--muted); }

/* 수정 모드 카드 */
.seat-edit {
  display: flex; flex-direction: column; gap: 8px;
  padding: 12px; border: 1px solid var(--line); border-radius: 12px;
}
.se-row { display: flex; align-items: center; gap: 8px; }
.se-sub { flex-wrap: wrap; }
.se-lab { font-size: 13px; font-weight: 600; color: var(--muted); }
.se-seats { width: 72px; flex-shrink: 0; }
.se-del {
  flex-shrink: 0; width: 38px; height: 38px;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid var(--line); border-radius: 10px; background: var(--card);
  color: #dc2626; cursor: pointer; transition: background 0.12s;
  &:hover { background: rgba(239, 68, 68, 0.1); }
}
.se-colors { display: flex; flex-wrap: wrap; gap: 6px; }
.sw {
  width: 26px; height: 26px; border-radius: 50%; border: 2px solid transparent;
  cursor: pointer; transition: transform 0.1s;
  &:hover { transform: scale(1.1); }
  &.on { border-color: var(--ink); box-shadow: 0 0 0 2px #fff inset; }
}

/* 빈 상태 */
.sp-empty {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  text-align: center; color: var(--muted);
  .material-symbols-outlined { font-size: 40px; color: #c4c6cd; }
  p { font-size: 13px; line-height: 1.5; }
  .sp-tip { font-size: 12px; color: #a9abb2; }
}

/* 하단 액션 버튼 */
.sp-actions {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  :deep(.btn) { flex: 1; }
}

@media (max-width: 900px) {
  .seat-body { flex-direction: column; }
  .seat-props { width: auto; }
}
</style>
