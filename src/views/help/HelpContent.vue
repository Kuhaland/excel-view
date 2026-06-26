<template>
  <div class="help" v-os="{ options: { overflow: { x: 'hidden' } } }">
    <div class="help-head">
      <span class="material-symbols-outlined">help</span>
      <div>
        <div class="help-title">도움말 · 자주 묻는 질문</div>
        <div class="help-sub">엑셀 뷰어의 주요 기능을 질문/답변 형태로 안내합니다.</div>
      </div>
    </div>

    <ul class="qna">
      <li v-for="(item, i) in items" :key="i" class="qna-item" :class="{ open: open === i }">
        <button type="button" class="qna-q" @click="toggle(i)">
          <span class="q-mark">Q</span>
          <span class="q-text">{{ item.q }}</span>
          <span class="material-symbols-outlined chev">expand_more</span>
        </button>
        <div class="qna-a-wrap">
          <div class="qna-a-inner">
            <div class="qna-a">
              <span class="a-mark">A</span>
              <div class="a-text" v-html="item.a"></div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(0)
function toggle(i) {
  open.value = open.value === i ? -1 : i
}

const items = [
  {
    q: '어떤 파일을 열 수 있나요?',
    a: '엑셀 파일(<b>.xlsx</b>, <b>.xls</b>)과 <b>.csv</b> 파일을 지원합니다. 시작 화면의 드롭존에 파일을 끌어다 놓거나 클릭해서 선택할 수 있고, 시트 뷰어 우측 상단의 <b>“다른 파일 선택”</b> 버튼으로도 언제든 교체할 수 있습니다.',
  },
  {
    q: '업로드한 파일이 서버로 전송되나요?',
    a: '아니요. 모든 파싱과 표시는 <b>브라우저 안에서만</b> 처리됩니다. 파일이 서버로 업로드되거나 외부로 전송되지 않으므로 안심하고 사용할 수 있습니다.',
  },
  {
    q: '여러 시트가 있는 파일은 어떻게 보나요?',
    a: '시트가 2개 이상이면 상단에 <b>시트 탭</b>이 나타납니다. 탭을 클릭해 시트를 전환하고, 시트가 많을 때는 <b>“시트 이름으로 필터”</b> 입력창으로 원하는 시트만 추려서 찾을 수 있습니다.',
  },
  {
    q: '표 안에서 특정 값을 찾고 싶어요.',
    a: '필터바의 <b>“셀 내용으로 검색”</b> 입력창에 검색어를 넣으면, 해당 텍스트가 포함된 행만 표시됩니다. 머리글 행은 항상 유지되며, 검색 중에는 병합 셀을 평평하게 펼쳐 보여줍니다.',
  },
  {
    q: '“머리글” 체크박스는 무슨 기능인가요?',
    a: '체크하면 첫 번째 행을 <b>머리글(제목 행)</b>로 간주해 굵게 강조합니다. 데이터에 제목 행이 없을 때는 체크를 해제하면 됩니다.',
  },
  {
    q: '셀을 클릭하면 무엇을 볼 수 있나요?',
    a: '셀을 클릭하면 우측 <b>상세 패널</b>에 해당 셀의 정보가 표시됩니다. 셀 주소(예: B3), 값, 배경색·글자색(색상 미리보기 포함), 글자 크기, 굵게/기울임 등 서식, 병합 여부를 확인할 수 있고 <b>“값 복사”</b>로 클립보드에 복사할 수 있습니다.',
  },
  {
    q: '엑셀의 색상과 서식이 그대로 보이나요?',
    a: '네. 셀의 <b>배경색·글자색</b>, <b>굵게·기울임·밑줄·취소선</b>, <b>글자 크기(pt)</b>, <b>병합 셀</b>, 셀 안 부분 서식(리치 텍스트)까지 최대한 원본 그대로 재현합니다. 표 영역은 흰 용지처럼 표시되어 원본 색이 또렷하게 보입니다.',
  },
  {
    q: '사이드바가 너무 넓어요. 줄일 수 있나요?',
    a: '사이드바 상단의 <b>접기 버튼(‹)</b>을 누르면 아이콘만 남도록 축소되고, 다시 누르면 아이콘+텍스트로 펼쳐집니다. 축소 상태에서는 아이콘에 마우스를 올리면 메뉴 이름이 툴팁으로 표시됩니다.',
  },
  {
    q: '작업 중인 파일을 닫으려면?',
    a: '사이드바 하단의 <b>“로그아웃”</b>을 누르면 현재 파일이 닫히고 시작 화면(드롭존)으로 돌아갑니다.',
  },
]
</script>
