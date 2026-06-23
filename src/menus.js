// ── 메뉴 정보구조(IA) 레지스트리 ──────────────────────────────────────────
// 트리: 섹션(top) → 항목(item) → 하위(children)
//   id   : 화면 식별자(라우팅 키)
//   label/title : 표시명
//   icon : 매트리얼 심볼 이름
//   tag  : 입력/처리 구분 배지 (수기 / 엑셀 / 계산 등)
//   home : 풀페이지 대시보드로 진입하는 섹션 표시
export const MENU_TREE = [
  {
    id: 'orders', title: '주문·영업 관리', icon: 'receipt_long',
    items: [
      { id: 'ord-daily', label: '일일 영업 입력', icon: 'edit_calendar', tag: '수기/엑셀' },
      { id: 'ord-list', label: '주문 내역 등록', icon: 'list_alt', tag: '엑셀' },
      { id: 'ord-refund', label: '환불·취소 기록', icon: 'undo', tag: '수기' },
      { id: 'ord-reserve', label: '예약 관리', icon: 'event', tag: '수기' },
    ],
  },
  {
    id: 'menu', title: '메뉴 관리', icon: 'restaurant_menu',
    items: [
      { id: 'menu-sell', label: '판매 구성', icon: 'tune', children: [
        { id: 'menu-course', label: '코스·세트 관리' },
        { id: 'menu-single', label: '단품·주류 관리' },
      ] },
      { id: 'menu-shabu', label: '샤브 구성 요소', icon: 'soup_kitchen', children: [
        { id: 'menu-meat', label: '고기 관리' },
        { id: 'menu-broth', label: '육수·베이스 관리' },
        { id: 'menu-refill', label: '사리·추가·리필 관리' },
      ] },
      { id: 'menu-common', label: '공통 설정', icon: 'settings_suggest', children: [
        { id: 'menu-option', label: '옵션 그룹 관리' },
        { id: 'menu-category', label: '카테고리·노출 관리' },
      ] },
      { id: 'menu-info', label: '표시 정보', icon: 'info', children: [
        { id: 'menu-origin', label: '원산지 관리' },
        { id: 'menu-allergy', label: '알레르기 정보 관리' },
      ] },
    ],
  },
  {
    id: 'inventory', title: '재료·재고 관리', icon: 'inventory_2',
    items: [
      { id: 'inv-master', label: '재료 마스터', icon: 'category', tag: '수기/엑셀' },
      { id: 'inv-stock', label: '재고 현황', icon: 'inventory', tag: '계산' },
      { id: 'inv-io', label: '입출고 관리', icon: 'sync_alt', tag: '수기/엑셀' },
      { id: 'inv-order', label: '발주 관리', icon: 'shopping_cart', tag: '수기' },
      { id: 'inv-recipe', label: '레시피/소요량', icon: 'menu_book', tag: '수기' },
      { id: 'inv-cost', label: '원가 분석', icon: 'calculate', tag: '계산' },
    ],
  },
  {
    id: 'sales', title: '매출·통계', icon: 'monitoring',
    items: [
      { id: 'sales-input', label: '매출 입력', icon: 'post_add', children: [
        { id: 'sales-daily', label: '일별 매출 등록', tag: '수기' },
        { id: 'sales-bulk', label: '엑셀 일괄 업로드', tag: '엑셀' },
        { id: 'sales-fix', label: '매출 정정·취소', tag: '수기' },
      ] },
      { id: 'sales-stat', label: '매출 통계', icon: 'bar_chart', children: [
        { id: 'sales-period', label: '기간별 (일/주/월/연)', tag: '계산' },
        { id: 'sales-hour', label: '시간대별', tag: '계산' },
        { id: 'sales-dow', label: '요일별', tag: '계산' },
      ] },
      { id: 'sales-menu', label: '메뉴 분석', icon: 'insights', children: [
        { id: 'sales-menu-qty', label: '메뉴별 판매량·매출', tag: '계산' },
        { id: 'sales-menu-rank', label: '베스트·워스트 메뉴', tag: '계산' },
      ] },
      { id: 'sales-pay', label: '결제·정산', icon: 'account_balance_wallet', children: [
        { id: 'sales-pay-method', label: '결제수단별 내역', tag: '계산' },
        { id: 'sales-pay-close', label: '일별 정산·마감', tag: '수기' },
        { id: 'sales-pay-tax', label: '세금계산서·영수증', tag: '수기' },
      ] },
      { id: 'sales-table', label: '객단가·테이블 분석', icon: 'table_restaurant', tag: '계산' },
    ],
  },
  {
    id: 'crm', title: '고객·마케팅', icon: 'loyalty',
    items: [
      { id: 'crm-member', label: '고객·멤버십 관리', icon: 'groups' },
      { id: 'crm-point', label: '적립·포인트', icon: 'stars' },
      { id: 'crm-coupon', label: '쿠폰·프로모션', icon: 'confirmation_number' },
      { id: 'crm-review', label: '리뷰 관리', icon: 'reviews' },
    ],
  },
  {
    id: 'store', title: '매장 설정', icon: 'storefront',
    items: [
      { id: 'store-info', label: '매장 기본 정보', icon: 'info' },
      { id: 'store-status', label: '영업 상태', icon: 'toggle_on' },
      { id: 'store-table', label: '테이블·좌석 설정', icon: 'table_bar' },
      { id: 'store-device', label: '기기 연동', icon: 'devices' },
    ],
  },
  {
    id: 'hr', title: '직원·인사·급여', icon: 'badge',
    items: [
      { id: 'hr-account', label: '직원 계정', icon: 'manage_accounts', tag: '수기' },
      { id: 'hr-role', label: '권한 설정', icon: 'admin_panel_settings', tag: '수기' },
      { id: 'hr-attend', label: '근태 입력', icon: 'schedule', tag: '수기/엑셀' },
      { id: 'hr-pay', label: '급여·인건비', icon: 'payments', children: [
        { id: 'hr-pay-set', label: '시급·월급 설정', tag: '수기' },
        { id: 'hr-pay-calc', label: '급여 산정', tag: '계산' },
        { id: 'hr-pay-paid', label: '인건비 지급 내역', tag: '수기' },
      ] },
      { id: 'hr-cost', label: '인건비 분석', icon: 'query_stats', tag: '계산' },
    ],
  },
  {
    id: 'system', title: '시스템·데이터', icon: 'storage',
    items: [
      { id: 'sys-upload', label: '엑셀 업로드 센터', icon: 'upload_file' },
      { id: 'sys-validate', label: '업로드 검증·미리보기', icon: 'fact_check' },
      { id: 'sys-mapping', label: '컬럼 매핑 설정', icon: 'view_column' },
      { id: 'sys-log', label: '수정 이력 로그', icon: 'history' },
    ],
  },
]

// 엑셀 뷰어(파일 업로드→표 보기) 기능이 연결되는 leaf id
export const VIEWER_ID = 'sys-upload'

// 첫 leaf id (그룹은 첫 하위, 단일은 자신)
function firstLeaf(section) {
  const it = section.items[0]
  return it.children ? it.children[0].id : it.id
}

// 서브페이지 LNB(사이드바)는 트리 전체
export const SIDEBAR_GROUPS = MENU_TREE

// 메인 메뉴(대시보드 상단) = 섹션 단위. to = 진입할 화면 id
export const SECTIONS = MENU_TREE.map((sec) => ({
  id: sec.id,
  title: sec.title,
  label: sec.title,
  icon: sec.icon,
  home: !!sec.home,
  to: sec.home ? 'home' : firstLeaf(sec),
}))

// 평탄화된 전체 leaf (라벨/아이콘/태그 조회용)
export const MENUS = MENU_TREE.flatMap((sec) =>
  sec.items.flatMap((it) => (it.children
    ? it.children.map((c) => ({ ...c, icon: c.icon || it.icon, section: sec.id }))
    : [{ ...it, section: sec.id }]))
)

// 하단 고정 메뉴(섹션/대시보드 IA 밖, 사이드바 하단에만 노출)
export const SETTINGS_MENU = { id: 'settings', label: '설정', icon: 'settings' }

// id로 메뉴(또는 섹션) 조회
export function findMenu(id) {
  return (
    MENUS.find((m) => m.id === id) ||
    SECTIONS.find((s) => s.id === id) ||
    (id === SETTINGS_MENU.id ? SETTINGS_MENU : null)
  )
}

// 상단 우측으로 뺄 메뉴(현재 IA에는 없음)
export const RIGHT_IDS = []
