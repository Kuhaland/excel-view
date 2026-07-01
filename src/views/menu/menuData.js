// 메뉴 설정 데이터 — 샤브79 메뉴판(front/back)에서 추출.
// 목록(메뉴관리/세트관리)과 편집 폼이 공유하는 초기 데이터·상수·포맷 유틸.

// 금액 포맷: 20000 → "20,000원"
export function won(n) {
  return (n || 0).toLocaleString('ko-KR') + '원'
}

// 가격 구성(tiers)에서 대표 가격/범위 문자열
export function priceRange(item) {
  const prices = (item.tiers || []).map((t) => Number(t.price) || 0).filter((p) => p > 0)
  if (!prices.length) return '-'
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? won(min) : `${won(min)} ~ ${won(max)}`
}

// 메뉴 구분 코드 — 대메뉴 / 세트메뉴 (문자열 리터럴 대신 코드로 처리)
export const MENU_TYPE = {
  MAIN: 'MAIN', // 대메뉴
  SET: 'SET',   // 세트메뉴
}
export const MENU_TYPES = [
  { code: MENU_TYPE.MAIN, label: '대메뉴' },
  { code: MENU_TYPE.SET, label: '세트메뉴' },
]
export const MENU_TYPE_LABEL = Object.fromEntries(MENU_TYPES.map((t) => [t.code, t.label]))

// 구분 코드별 카테고리(대메뉴) — 편집 시 Select 옵션
export const CATEGORIES = {
  [MENU_TYPE.MAIN]: ['고기', '육수', '사이드', '추가 고기', '추가 세트', '주류·음료'],
  [MENU_TYPE.SET]: ['79스페셜', '어린이'],
}

export function categoryOptions(type) {
  return (CATEGORIES[type] || []).map((c) => ({ label: c, value: c }))
}

// 세트 6단가(일반특선 100g / 점심특선 70g × 한우·목심·차돌양지) 생성 헬퍼
function setTiers(dinner, lunch) {
  return [
    { label: '일반특선 · 한우(1++)', price: dinner[0] },
    { label: '일반특선 · 목심', price: dinner[1] },
    { label: '일반특선 · 차돌양지', price: dinner[2] },
    { label: '점심특선 · 한우(1++)', price: lunch[0] },
    { label: '점심특선 · 목심', price: lunch[1] },
    { label: '점심특선 · 차돌양지', price: lunch[2] },
  ]
}
const one = (price) => [{ label: '', price }] // 단일 가격 항목

let seq = 0
const id = () => `m${++seq}`

// ── 초기 메뉴 데이터 ─────────────────────────────────────────────────────────
export const INITIAL_MENU = [
  // ===== 세트메뉴 : 79스페셜 (기본 + 모듬) =====
  { id: id(), type: MENU_TYPE.SET, category: '79스페셜', name: '79스페셜 (기본)', desc: '고기와 샐러드바를 이용하는 샤브79 기본 메뉴', soldOut: false,
    tiers: setTiers([20000, 18000, 16000], [18000, 15500, 13500]) },
  { id: id(), type: MENU_TYPE.SET, category: '79스페셜', name: '건강 버섯 모듬', desc: '황금팽이·흰색만가닥·갈색만가닥·표고·흰목이·검은목이·새송이 (2인 이상)', soldOut: false,
    tiers: setTiers([26000, 23000, 21000], [24000, 21000, 19000]) },
  { id: id(), type: MENU_TYPE.SET, category: '79스페셜', name: '피쉬볼 해물 모듬', desc: '피쉬볼 5종·새우·그린홍합·솔방울 오징어 (2인 이상)', soldOut: false,
    tiers: setTiers([26000, 23000, 21000], [24000, 21000, 19000]) },
  { id: id(), type: MENU_TYPE.SET, category: '79스페셜', name: '신선 해물 모듬', desc: '꽃게·쭈꾸미·새우·그린홍합·솔방울 오징어 (2인 이상)', soldOut: false,
    tiers: setTiers([27000, 24000, 22000], [25000, 22000, 20000]) },
  { id: id(), type: MENU_TYPE.SET, category: '79스페셜', name: '문어 해물 모듬', desc: '문어·표고버섯·새우·그린홍합·솔방울 오징어 (2인 이상)', soldOut: false,
    tiers: setTiers([28000, 25000, 23000], [26000, 23000, 21000]) },
  // ===== 세트메뉴 : 어린이 =====
  { id: id(), type: MENU_TYPE.SET, category: '어린이', name: '어린이 메뉴', desc: '초등학생(8~13세) · 1인분 70g', soldOut: false,
    tiers: [
      { label: '한우(1++)', price: 16000 },
      { label: '목심', price: 12000 },
      { label: '차돌양지', price: 10000 },
    ] },

  // ===== 대메뉴 : 고기(특선 선택 고기) =====
  { id: id(), type: MENU_TYPE.MAIN, category: '고기', name: '한우(1++)', desc: '샐러드바 포함 · 특선 선택 고기', soldOut: false, tiers: one(0) },
  { id: id(), type: MENU_TYPE.MAIN, category: '고기', name: '소고기(목심)', desc: '호주/뉴질랜드 · 특선 선택 고기', soldOut: false, tiers: one(0) },
  { id: id(), type: MENU_TYPE.MAIN, category: '고기', name: '소고기(차돌양지)', desc: '호주/뉴질랜드 · 특선 선택 고기', soldOut: false, tiers: one(0) },
  // ===== 대메뉴 : 육수 =====
  { id: id(), type: MENU_TYPE.MAIN, category: '육수', name: '맑은 육수', desc: '샤브 육수 선택', soldOut: false, tiers: one(0) },
  { id: id(), type: MENU_TYPE.MAIN, category: '육수', name: '얼큰 육수', desc: '샤브 육수 선택', soldOut: false, tiers: one(0) },
  { id: id(), type: MENU_TYPE.MAIN, category: '육수', name: '반반 육수', desc: '맑은+얼큰 반반', soldOut: false, tiers: one(0) },
  // ===== 대메뉴 : 사이드 =====
  { id: id(), type: MENU_TYPE.MAIN, category: '사이드', name: '왕만두사리', desc: '4개', soldOut: false, tiers: one(6000) },
  { id: id(), type: MENU_TYPE.MAIN, category: '사이드', name: '피쉬볼모듬', desc: '5종 · 10개', soldOut: false, tiers: one(5500) },
  // ===== 대메뉴 : 추가 고기 (1인분/특선 기준) =====
  { id: id(), type: MENU_TYPE.MAIN, category: '추가 고기', name: '한우(1++)', desc: '1인분 · 특선 기준', soldOut: false, tiers: one(16000) },
  { id: id(), type: MENU_TYPE.MAIN, category: '추가 고기', name: '목심', desc: '1인분 · 특선 기준', soldOut: false, tiers: one(12000) },
  { id: id(), type: MENU_TYPE.MAIN, category: '추가 고기', name: '차돌양지', desc: '1인분 · 특선 기준', soldOut: false, tiers: one(10000) },
  // ===== 대메뉴 : 추가 세트 (1인분 기준) =====
  { id: id(), type: MENU_TYPE.MAIN, category: '추가 세트', name: '건강 버섯 모듬', desc: '2인 이상', soldOut: false, tiers: one(7000) },
  { id: id(), type: MENU_TYPE.MAIN, category: '추가 세트', name: '피쉬볼 해물 모듬', desc: '2인 이상', soldOut: false, tiers: one(7000) },
  { id: id(), type: MENU_TYPE.MAIN, category: '추가 세트', name: '신선 해물 모듬', desc: '2인 이상', soldOut: false, tiers: one(8000) },
  { id: id(), type: MENU_TYPE.MAIN, category: '추가 세트', name: '문어 해물 모듬', desc: '2인 이상', soldOut: false, tiers: one(9000) },
  // ===== 대메뉴 : 주류·음료 =====
  { id: id(), type: MENU_TYPE.MAIN, category: '주류·음료', name: '소주', desc: '후레쉬/오리지널/진로/처음처럼/새로', soldOut: false, tiers: one(5000) },
  { id: id(), type: MENU_TYPE.MAIN, category: '주류·음료', name: '맥주', desc: '카스/테라', soldOut: false, tiers: one(5000) },
  { id: id(), type: MENU_TYPE.MAIN, category: '주류·음료', name: '청하', desc: '', soldOut: false, tiers: one(6000) },
  { id: id(), type: MENU_TYPE.MAIN, category: '주류·음료', name: '음료수', desc: '코카콜라/제로콜라/사이다/환타(오렌지·파인애플)/뽀로로 음료', soldOut: false, tiers: one(2000) },
  { id: id(), type: MENU_TYPE.MAIN, category: '주류·음료', name: '분다버그', desc: '핑크/망고/진저비어/레몬', soldOut: false, tiers: one(4000) },
]

// 다음 신규 id 발급기(등록용) — 초기 seq 이후로 이어서 부여
let addSeq = seq
export function newId() {
  return `m${++addSeq}`
}
