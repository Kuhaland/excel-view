// 주문 관리 화면 공용 메타/포맷 유틸
// 목록(OrderManageView)과 상세(OrderManageDetail)가 공유해 표기 규칙이 어긋나지 않게 한다.

// ── 주문 상태: 접수 → 조리중 → 준비완료 → 완료 / 취소 ────────────────────────
//   tone: Badge 색상, next: 다음 진행 단계(없으면 종료 상태)
export const STATUS = {
  received: { label: '접수',     tone: 'blue',   next: 'cooking', icon: 'inbox' },
  cooking:  { label: '조리중',   tone: 'orange', next: 'ready',   icon: 'skillet' },
  ready:    { label: '준비완료', tone: 'purple', next: 'done',    icon: 'room_service' },
  done:     { label: '완료',     tone: 'green',  next: null,      icon: 'check_circle' },
  canceled: { label: '취소',     tone: 'red',    next: null,      icon: 'cancel' },
}
// 필터 탭·카운트 노출 순서
export const STATUS_ORDER = ['received', 'cooking', 'ready', 'done', 'canceled']
// 라벨 → 키 역매핑 (엑셀 등록 시 "접수" → "received")
export const STATUS_BY_LABEL = Object.fromEntries(
  Object.entries(STATUS).map(([k, v]) => [v.label, k])
)
// 진행/주방 대기 집계용 상태 그룹
export const PROGRESS_STATUSES = ['received', 'cooking', 'ready'] // 진행 주문
export const KITCHEN_STATUSES = ['received', 'cooking']           // 주방 대기

// ── 채널: 매장·포장(오프라인·비회원) / 네이버·온라인(회원) ──────────────────
//   online=false 채널은 손님 이름/아이디가 없다(비회원).
//   네이버/온라인은 컬러 배지로 살짝 강조(매장/포장은 gray).
export const CHANNEL = {
  '매장':   { tone: 'gray',  online: false, icon: 'storefront' },
  '포장':   { tone: 'gray',  online: false, icon: 'takeout_dining' },
  '네이버': { tone: 'green', online: true,  icon: 'shopping_bag' },
  '온라인': { tone: 'blue',  online: true,  icon: 'language' },
}

// 카드 결제 시 카드사
export const CARD_BRANDS = ['신한', '삼성', '현대', 'KB국민', '롯데', '우리', '하나', 'BC', 'NH농협']

// 결제수단 표기: 카드이고 카드사가 있으면 "신한카드"처럼 함께 노출
export function payLabel(o) {
  if (o.pay === '카드' && o.card) return `${o.card}카드`
  return o.pay
}

// 금액 포맷: 12000 → "12,000원"
export function won(n) {
  return (n || 0).toLocaleString('ko-KR') + '원'
}

// 주문 합계 = Σ(수량 × 단가)
export function orderTotal(o) {
  return (o.items || []).reduce((s, it) => s + it.price * it.qty, 0)
}

export function isOnlineOrder(o) {
  return !!CHANNEL[o.channel]?.online
}

// 아이디 부분 마스킹: skypark07 → skypark**
export function maskAccount(a) {
  if (!a) return ''
  return a.length <= 2 ? '**' : a.slice(0, -2) + '**'
}

// 대표 표기: 매장="테이블 N번", 포장="포장 대기 N", 온라인/네이버=고객 이름
export function repName(o) {
  if (o.channel === '매장') return `테이블 ${o.table}번`
  if (o.channel === '포장') return `포장 대기 ${o.pickup}`
  return o.name
}

// 목록의 보조 표기: 오프라인="비회원", 온라인="@아이디(마스킹)"
export function repSub(o) {
  return isOnlineOrder(o) ? `@${maskAccount(o.account)}` : '비회원'
}

// 주문 항목 요약: "한우 샤브샤브 외 2건"
export function itemsSummary(o) {
  if (!o.items?.length) return '-'
  const more = o.items.length - 1
  return more > 0 ? `${o.items[0].name} 외 ${more}건` : o.items[0].name
}
