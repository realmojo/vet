/**
 * 동물병원 진료비 공개 시스템(animalclinicfee.or.kr)의 코드 목록.
 *
 * 조회 화면 `/info/payInfo.do` 의 <select> 와 라디오 버튼 data 속성에서 뽑았다.
 * 2026-08-17 기준. 항목이 늘거나 줄면 그 화면에서 다시 뽑아 이 파일을 갱신한다.
 */

/** 시도 코드 = 법정동코드 앞 2자리 */
export const SIDOS = [
  { code: "11", name: "서울특별시", short: "서울" },
  { code: "26", name: "부산광역시", short: "부산" },
  { code: "27", name: "대구광역시", short: "대구" },
  { code: "28", name: "인천광역시", short: "인천" },
  { code: "29", name: "광주광역시", short: "광주" },
  { code: "30", name: "대전광역시", short: "대전" },
  { code: "31", name: "울산광역시", short: "울산" },
  { code: "36", name: "세종특별자치시", short: "세종" },
  { code: "41", name: "경기도", short: "경기" },
  { code: "42", name: "강원특별자치도", short: "강원" },
  { code: "43", name: "충청북도", short: "충북" },
  { code: "44", name: "충청남도", short: "충남" },
  { code: "45", name: "전북특별자치도", short: "전북" },
  { code: "46", name: "전라남도", short: "전남" },
  { code: "47", name: "경상북도", short: "경북" },
  { code: "48", name: "경상남도", short: "경남" },
  { code: "50", name: "제주특별자치도", short: "제주" },
];

/**
 * 진료항목 35조합.
 *
 * `slug` 는 URL 이 되므로 **한 번 정하면 바꾸지 않는다.** 색인된 주소가 바뀐다.
 * 원문 제목(`title`)은 "…비와 판독료" 처럼 길어서 그대로 쓰지 않고,
 * 사람들이 실제로 검색하는 말(`label`)을 따로 둔다.
 */
export const ITEMS = [
  // ── 진찰료 ──
  { slug: "초진-진찰료-5kg", medi: "MEDIT00001", animal: "ANITY00006", group: "진찰료", label: "초진 진찰료", variant: "개 5kg", species: "dog" },
  { slug: "초진-진찰료-10kg", medi: "MEDIT00001", animal: "ANITY00007", group: "진찰료", label: "초진 진찰료", variant: "개 10kg", species: "dog" },
  { slug: "초진-진찰료-20kg", medi: "MEDIT00001", animal: "ANITY00008", group: "진찰료", label: "초진 진찰료", variant: "개 20kg", species: "dog" },
  { slug: "재진-진찰료-5kg", medi: "MEDIT00002", animal: "ANITY00006", group: "진찰료", label: "재진 진찰료", variant: "개 5kg", species: "dog" },
  { slug: "재진-진찰료-10kg", medi: "MEDIT00002", animal: "ANITY00007", group: "진찰료", label: "재진 진찰료", variant: "개 10kg", species: "dog" },
  { slug: "재진-진찰료-20kg", medi: "MEDIT00002", animal: "ANITY00008", group: "진찰료", label: "재진 진찰료", variant: "개 20kg", species: "dog" },
  { slug: "상담료", medi: "MEDIT00003", animal: "", group: "진찰료", label: "진찰 상담료", variant: "기타 상담 행위", species: "both" },

  // ── 입원비 ──
  { slug: "입원비-5kg", medi: "MEDIT00004", animal: "ANITY00006", group: "입원비", label: "입원비", variant: "개 5kg", species: "dog" },
  { slug: "입원비-10kg", medi: "MEDIT00004", animal: "ANITY00007", group: "입원비", label: "입원비", variant: "개 10kg", species: "dog" },
  { slug: "입원비-20kg", medi: "MEDIT00004", animal: "ANITY00008", group: "입원비", label: "입원비", variant: "개 20kg", species: "dog" },
  { slug: "입원비-고양이", medi: "MEDIT00004", animal: "ANITY00005", group: "입원비", label: "입원비", variant: "고양이", species: "cat" },

  // ── 예방접종비 ──
  { slug: "종합백신-강아지", medi: "MEDIT00005", animal: "ANITY00001", group: "예방접종비", label: "종합백신 접종비", variant: "개", species: "dog" },
  { slug: "종합백신-고양이", medi: "MEDIT00005", animal: "ANITY00005", group: "예방접종비", label: "종합백신 접종비", variant: "고양이", species: "cat" },
  { slug: "광견병백신", medi: "MEDIT00007", animal: "", group: "예방접종비", label: "광견병백신 접종비", variant: "", species: "both" },
  { slug: "켄넬코프백신", medi: "MEDIT00008", animal: "", group: "예방접종비", label: "켄넬코프백신 접종비", variant: "", species: "dog" },
  { slug: "코로나바이러스백신", medi: "MEDIT00012", animal: "", group: "예방접종비", label: "코로나바이러스백신 접종비", variant: "", species: "dog" },
  { slug: "인플루엔자백신", medi: "MEDIT00009", animal: "", group: "예방접종비", label: "인플루엔자백신 접종비", variant: "", species: "dog" },

  // ── 혈액검사비 ──
  { slug: "전혈구검사", medi: "MEDIT00010", animal: "", group: "혈액검사비", label: "전혈구 검사비", variant: "판독료 포함", species: "both" },
  { slug: "혈액화학검사", medi: "MEDIT00013", animal: "", group: "혈액검사비", label: "혈액화학 검사비", variant: "판독료 포함", species: "both" },
  { slug: "전해질검사", medi: "MEDIT00014", animal: "", group: "혈액검사비", label: "전해질 검사비", variant: "판독료 포함", species: "both" },

  // ── 영상검사비 ──
  { slug: "엑스레이-5kg", medi: "MEDIT00011", animal: "ANITY00006", group: "영상검사비", label: "엑스선 촬영비", variant: "개 5kg", species: "dog" },
  { slug: "엑스레이-10kg", medi: "MEDIT00011", animal: "ANITY00007", group: "영상검사비", label: "엑스선 촬영비", variant: "개 10kg", species: "dog" },
  { slug: "엑스레이-20kg", medi: "MEDIT00011", animal: "ANITY00008", group: "영상검사비", label: "엑스선 촬영비", variant: "개 20kg", species: "dog" },
  { slug: "초음파-5kg", medi: "MEDIT00015", animal: "ANITY00006", group: "영상검사비", label: "초음파 검사비", variant: "개 5kg", species: "dog" },
  { slug: "초음파-10kg", medi: "MEDIT00015", animal: "ANITY00007", group: "영상검사비", label: "초음파 검사비", variant: "개 10kg", species: "dog" },
  { slug: "초음파-20kg", medi: "MEDIT00015", animal: "ANITY00008", group: "영상검사비", label: "초음파 검사비", variant: "개 20kg", species: "dog" },
  { slug: "ct-5kg", medi: "MEDIT00016", animal: "ANITY00006", group: "영상검사비", label: "CT 촬영비", variant: "개 5kg", species: "dog" },
  { slug: "ct-10kg", medi: "MEDIT00016", animal: "ANITY00007", group: "영상검사비", label: "CT 촬영비", variant: "개 10kg", species: "dog" },
  { slug: "ct-20kg", medi: "MEDIT00016", animal: "ANITY00008", group: "영상검사비", label: "CT 촬영비", variant: "개 20kg", species: "dog" },
  { slug: "mri-5kg", medi: "MEDIT00017", animal: "ANITY00006", group: "영상검사비", label: "MRI 촬영비", variant: "개 5kg", species: "dog" },
  { slug: "mri-10kg", medi: "MEDIT00017", animal: "ANITY00007", group: "영상검사비", label: "MRI 촬영비", variant: "개 10kg", species: "dog" },
  { slug: "mri-20kg", medi: "MEDIT00017", animal: "ANITY00008", group: "영상검사비", label: "MRI 촬영비", variant: "개 20kg", species: "dog" },

  // ── 투약·조제비 ──
  { slug: "심장사상충-예방", medi: "MEDIT00018", animal: "", group: "투약·조제비", label: "심장사상충 예방비", variant: "", species: "both" },
  { slug: "외부기생충-예방", medi: "MEDIT00019", animal: "", group: "투약·조제비", label: "외부기생충 예방비", variant: "", species: "both" },
  { slug: "광범위-구충", medi: "MEDIT00020", animal: "", group: "투약·조제비", label: "광범위 구충비", variant: "", species: "both" },
];

/** 항목 화면의 큰 묶음 순서 */
export const GROUPS = [
  "진찰료",
  "입원비",
  "예방접종비",
  "혈액검사비",
  "영상검사비",
  "투약·조제비",
];
