// 사이드바 메뉴 레지스트리 (그룹 단위).
// id: 화면 식별자, label: 표시명, icon: 매트리얼 심볼 이름, badge: 우측 배지(옵션)
export const MENU_GROUPS = [
  {
    items: [
      { id: 'viewer', label: '시트 뷰어', icon: 'table_view' },
      { id: 'summary', label: '요약 정보', icon: 'monitoring' },
      { id: 'recent', label: '최근 파일', icon: 'history' },
      { id: 'stats', label: '통계', icon: 'bar_chart' },
    ],
  },
  {
    items: [
      { id: 'help', label: '도움말', icon: 'help' },
      { id: 'settings', label: '설정', icon: 'settings' },
    ],
  },
]

// 평탄화된 전체 메뉴 (라벨/아이콘 조회용)
export const MENUS = MENU_GROUPS.flatMap((g) => g.items)
