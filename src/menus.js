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
      { id: 'ord-list', label: '주문 내역', icon: 'list_alt'},
      { id: 'ord-reserve', label: '예약 관리', icon: 'event'},
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
      { id: 'inv-master', label: '재료 마스터', icon: 'category'},
      { id: 'inv-stock', label: '재고 현황', icon: 'inventory'},
      { id: 'inv-io', label: '입출고 관리', icon: 'sync_alt'},
      { id: 'inv-order', label: '발주 관리', icon: 'shopping_cart'},
      { id: 'inv-recipe', label: '레시피/소요량', icon: 'menu_book'},
      { id: 'inv-cost', label: '원가 분석', icon: 'calculate'},
    ],
  },
  {
    id: 'sales', title: '매출·통계', icon: 'monitoring',
    items: [
      { id: 'sales-input', label: '매출 입력', icon: 'post_add', children: [
        { id: 'sales-daily', label: '일별 매출 등록'},
        { id: 'sales-bulk', label: '엑셀 일괄 업로드'},
        { id: 'sales-fix', label: '매출 정정·취소'},
      ] },
      { id: 'sales-stat', label: '매출 통계', icon: 'bar_chart', children: [
        { id: 'sales-period', label: '기간별 (일/주/월/연)'},
        { id: 'sales-hour', label: '시간대별'},
        { id: 'sales-dow', label: '요일별'},
      ] },
      { id: 'sales-menu', label: '메뉴 분석', icon: 'insights', children: [
        { id: 'sales-menu-qty', label: '메뉴별 판매량·매출'},
        { id: 'sales-menu-rank', label: '베스트·워스트 메뉴'},
      ] },
      { id: 'sales-pay', label: '결제·정산', icon: 'account_balance_wallet', children: [
        { id: 'sales-pay-method', label: '결제수단별 내역'},
        { id: 'sales-pay-close', label: '일별 정산·마감'},
        { id: 'sales-pay-tax', label: '세금계산서·영수증'},
      ] },
      { id: 'sales-table', label: '객단가·테이블 분석', icon: 'table_restaurant'},
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
    ],
  },
  {
    id: 'hr', title: '직원·인사·급여', icon: 'badge',
    items: [
      { id: 'hr-account', label: '직원 계정', icon: 'manage_accounts'},
      { id: 'hr-role', label: '권한 설정', icon: 'admin_panel_settings'},
      { id: 'hr-attend', label: '근태 입력', icon: 'schedule'},
      { id: 'hr-pay', label: '급여·인건비', icon: 'payments', children: [
        { id: 'hr-pay-set', label: '시급·월급 설정'},
        { id: 'hr-pay-calc', label: '급여 산정'},
        { id: 'hr-pay-paid', label: '인건비 지급 내역'},
      ] },
      { id: 'hr-cost', label: '인건비 분석', icon: 'query_stats'},
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

export const VIEWER_ID = 'sys-upload'

function firstLeaf(section) {
  const it = section.items[0]
  return it.children ? it.children[0].id : it.id
}

export const SIDEBAR_GROUPS = MENU_TREE

export const SECTIONS = MENU_TREE.map((sec) => ({
  id: sec.id,
  title: sec.title,
  label: sec.title,
  icon: sec.icon,
  home: !!sec.home,
  to: sec.home ? 'home' : firstLeaf(sec),
}))

export const MENUS = MENU_TREE.flatMap((sec) =>
  sec.items.flatMap((it) => (it.children
    ? it.children.map((c) => ({ ...c, icon: c.icon || it.icon, section: sec.id }))
    : [{ ...it, section: sec.id }]))
)

export const SETTINGS_MENU = { id: 'settings', label: '설정', icon: 'settings' }

export function findMenu(id) {
  return (
    MENUS.find((m) => m.id === id) ||
    SECTIONS.find((s) => s.id === id) ||
    (id === SETTINGS_MENU.id ? SETTINGS_MENU : null)
  )
}

// 상단 우측으로 뺄 메뉴(현재 IA에는 없음)
export const RIGHT_IDS = []
