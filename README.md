# 엑셀 뷰어 (Vue 3 + Vite)

엑셀 파일을 올리면 그 내용을 **셀 색상까지 그대로** 화면에 스프레드시트 형태로 보여주는 페이지입니다.

- **순수 프론트엔드** — 파일은 서버로 전송되지 않고 브라우저(ExcelJS)에서만 파싱됩니다.
- 드래그&드롭 또는 클릭으로 파일 선택 (`.xlsx`, `.csv`)
- 여러 시트는 탭으로 전환, 열 문자(A, B, C…)·행 번호 표시
- **셀 배경색 / 글자색 / 굵게 / 기울임 / 밑줄 / 취소선 / 정렬**을 추출해 그대로 렌더링
- **셀 안 줄바꿈(Alt+Enter)·자동 줄바꿈(wrap text)·셀 내부 부분 서식(리치 텍스트)** 처리
- **병합 셀(merge)** 을 colspan/rowspan 으로 원본처럼 렌더링
- 첫 행 머리글 강조 토글

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
```

프로덕션 빌드:

```bash
npm run build    # dist/ 생성
npm run preview
```

## 구조

```
test-1/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.js
    ├── style.css
    ├── excel.js                 # ExcelJS 파싱 + 색상/스타일 추출
    ├── App.vue                  # 시트 탭/툴바
    └── components/
        ├── FileDrop.vue         # 드래그&드롭 / 파일 선택
        └── SheetGrid.vue        # 스프레드시트형 표 + 셀 스타일 렌더링
```

## 색상 추출 방식 / 참고

- **`xlsx`(SheetJS) 무료판은 셀 스타일을 읽지 못합니다.** 그래서 스타일을 지원하는 **ExcelJS**를 사용합니다.
- 색상 종류별 처리:
  - **명시적 RGB(ARGB)** 색상 — 그대로 정확히 표시 (예: 빨강 `#FF0000`).
  - **테마 색상 + tint** — Office 표준 테마 팔레트로 근사 변환 후 tint(밝기) 적용
    (예: 강조1 + 40% 밝게 → `#8faadc`). 사용자가 테마를 커스터마이즈한 파일은 약간 다를 수 있습니다.
  - **indexed 색상** — Excel 기본 56색 팔레트로 변환 (많은 파일이 이 방식 사용).
- **병합 셀**은 `worksheet.model.merges` 를 읽어 마스터 셀에 colspan/rowspan 을 주고
  가려지는 셀은 렌더링하지 않습니다.
- **색상 정보는 `.xlsx`에만 존재합니다.** `.csv`는 색상이 없어 값만 표시됩니다.
- 구형 `.xls`(BIFF) 형식은 ExcelJS가 지원하지 않습니다. `.xlsx`로 저장 후 사용하세요.
