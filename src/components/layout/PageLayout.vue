<template>
  <div class="page-col page-layout">
    <!-- 상단 조회 조건 카드 (#filter 슬롯이 있을 때만) -->
    <div v-if="$slots.filter" class="pl-filter card">
      <slot name="filter" />
    </div>

    <!-- 툴바: 좌측(탭/필터) + 우측(액션) -->
    <div v-if="$slots.toolbar || $slots.actions" class="pl-toolbar">
      <div class="pl-toolbar-main"><slot name="toolbar" /></div>
      <div v-if="$slots.actions" class="pl-actions"><slot name="actions" /></div>
    </div>

    <!-- 본문(리스트/DataTable 등) — 남은 높이를 채운다 -->
    <slot />
  </div>
</template>

<script setup>
// 기준 페이지 레이아웃 — 주문내역 페이지를 표준으로 삼은 목록형 화면 셸.
//   #filter  : 상단 조회 조건 카드 내용 (없으면 카드 자체를 렌더하지 않음)
//   #toolbar : 탭/필터 등 좌측 컨트롤
//   #actions : 우측 액션 버튼
//   기본 슬롯: 본문(리스트/DataTable 등)
</script>

<style lang="scss" scoped>
.page-layout { gap: 14px; }

/* 조회 조건 카드 */
.pl-filter {
  flex-shrink: 0;
  padding: 16px 18px;
  overflow: visible; /* Select·date 드롭다운이 잘리지 않도록 */
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px 28px;
}

/* 툴바 */
.pl-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.pl-toolbar-main { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; min-width: 0; }
.pl-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
</style>
