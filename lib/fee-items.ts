/**
 * 진료항목 35개.
 *
 * 농림축산식품부가 게시를 의무화한 20종을, 개체·체중별로 값이 따로 공개되는
 * 것까지 펼치면 35조합이 된다. (초진 진찰료만 해도 5·10·20kg 세 값이다)
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  `slug` 은 URL 이다. 한 번 정하면 바꾸지 않는다.
 *  `scripts/fee-codes.mjs` 의 ITEMS[].slug 와 **정확히 같아야 한다.**
 *  한쪽만 고치면 적재된 item_slug 와 화면이 찾는 슬러그가 어긋나 404 가 된다.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type Species = "dog" | "cat" | "both";

export interface FeeItem {
  /** URL 슬러그 */
  slug: string;
  /** 큰 묶음 */
  group: string;
  /** 사람들이 실제로 쓰는 말. 원문 제목("…비와 판독료")은 길어 쓰지 않는다 */
  label: string;
  /** 같은 항목 안의 갈래. 예: 개 5kg */
  variant: string;
  species: Species;
  /** 상세 화면 도입부. 이 항목이 무엇인지 한 줄로 말한다 */
  note: string;
}

export const ITEMS: FeeItem[] = [
  // ── 진찰료 ──
  { slug: "초진-진찰료-5kg", group: "진찰료", label: "초진 진찰료", variant: "개 5kg", species: "dog",
    note: "처음 가는 병원에서 진찰을 받을 때 내는 기본 요금입니다. 검사·처치비는 여기에 따로 붙습니다." },
  { slug: "초진-진찰료-10kg", group: "진찰료", label: "초진 진찰료", variant: "개 10kg", species: "dog",
    note: "처음 가는 병원에서 진찰을 받을 때 내는 기본 요금입니다. 체중이 늘면 값도 대개 올라갑니다." },
  { slug: "초진-진찰료-20kg", group: "진찰료", label: "초진 진찰료", variant: "개 20kg", species: "dog",
    note: "대형견 기준 초진 진찰료입니다. 같은 병원이라도 체중대별로 요금표가 나뉩니다." },
  { slug: "재진-진찰료-5kg", group: "진찰료", label: "재진 진찰료", variant: "개 5kg", species: "dog",
    note: "같은 질환으로 다시 방문했을 때의 진찰료입니다. 초진보다 싼 것이 보통입니다." },
  { slug: "재진-진찰료-10kg", group: "진찰료", label: "재진 진찰료", variant: "개 10kg", species: "dog",
    note: "같은 질환으로 다시 방문했을 때의 진찰료입니다." },
  { slug: "재진-진찰료-20kg", group: "진찰료", label: "재진 진찰료", variant: "개 20kg", species: "dog",
    note: "같은 질환으로 다시 방문했을 때의 진찰료입니다." },
  { slug: "상담료", group: "진찰료", label: "진찰 상담료", variant: "기타 상담 행위", species: "both",
    note: "진료 없이 상담만 받는 경우의 요금입니다. 받지 않는 병원도 많아 0원으로 게시되기도 합니다." },

  // ── 입원비 ──
  { slug: "입원비-5kg", group: "입원비", label: "입원비", variant: "개 5kg", species: "dog",
    note: "하루 기준 입원비입니다. 처치·검사·약값은 별도로 붙어 실제 청구액은 이보다 큽니다." },
  { slug: "입원비-10kg", group: "입원비", label: "입원비", variant: "개 10kg", species: "dog",
    note: "하루 기준 입원비입니다. 처치·검사·약값은 별도입니다." },
  { slug: "입원비-20kg", group: "입원비", label: "입원비", variant: "개 20kg", species: "dog",
    note: "하루 기준 입원비입니다. 대형견은 입원실 크기 때문에 값이 더 올라갑니다." },
  { slug: "입원비-고양이", group: "입원비", label: "입원비", variant: "고양이", species: "cat",
    note: "고양이 하루 입원비입니다. 개와 분리된 입원실을 두는 병원은 값이 다를 수 있습니다." },

  // ── 예방접종비 ──
  { slug: "종합백신-강아지", group: "예방접종비", label: "종합백신 접종비", variant: "개", species: "dog",
    note: "DHPPL 등 종합백신 1회 접종 비용입니다. 어린 강아지는 2~4주 간격으로 여러 차례 맞습니다." },
  { slug: "종합백신-고양이", group: "예방접종비", label: "종합백신 접종비", variant: "고양이", species: "cat",
    note: "고양이 종합백신(FVRCP) 1회 접종 비용입니다." },
  { slug: "광견병백신", group: "예방접종비", label: "광견병백신 접종비", variant: "", species: "both",
    note: "광견병 예방접종 비용입니다. 지자체가 봄·가을에 지원 접종을 하면 훨씬 싸게 맞을 수 있습니다." },
  { slug: "켄넬코프백신", group: "예방접종비", label: "켄넬코프백신 접종비", variant: "", species: "dog",
    note: "전염성 기관지염 예방접종입니다. 애견카페·호텔·미용을 자주 이용하면 권장됩니다." },
  { slug: "코로나바이러스백신", group: "예방접종비", label: "코로나바이러스백신 접종비", variant: "", species: "dog",
    note: "개 코로나바이러스 장염 예방접종입니다. 사람 코로나와는 다른 질병입니다." },
  { slug: "인플루엔자백신", group: "예방접종비", label: "인플루엔자백신 접종비", variant: "", species: "dog",
    note: "개 인플루엔자 예방접종입니다." },

  // ── 혈액검사비 ──
  { slug: "전혈구검사", group: "혈액검사비", label: "전혈구 검사비", variant: "판독료 포함", species: "both",
    note: "적혈구·백혈구·혈소판 수를 보는 기본 혈액검사(CBC)입니다. 감염·빈혈을 가릅니다." },
  { slug: "혈액화학검사", group: "혈액검사비", label: "혈액화학 검사비", variant: "판독료 포함", species: "both",
    note: "간·신장 수치 등을 보는 검사입니다. 건강검진과 마취 전 검사에 거의 항상 들어갑니다." },
  { slug: "전해질검사", group: "혈액검사비", label: "전해질 검사비", variant: "판독료 포함", species: "both",
    note: "나트륨·칼륨 등 전해질 균형을 보는 검사입니다. 구토·설사가 심할 때 확인합니다." },

  // ── 영상검사비 ──
  { slug: "엑스레이-5kg", group: "영상검사비", label: "엑스선 촬영비", variant: "개 5kg", species: "dog",
    note: "엑스선 촬영과 판독료입니다. 이물 삼킴·골절·심장 크기 확인에 먼저 쓰는 검사입니다." },
  { slug: "엑스레이-10kg", group: "영상검사비", label: "엑스선 촬영비", variant: "개 10kg", species: "dog",
    note: "엑스선 촬영과 판독료입니다. 보통 2~3방향을 찍어 장수만큼 값이 붙습니다." },
  { slug: "엑스레이-20kg", group: "영상검사비", label: "엑스선 촬영비", variant: "개 20kg", species: "dog",
    note: "엑스선 촬영과 판독료입니다." },
  { slug: "초음파-5kg", group: "영상검사비", label: "초음파 검사비", variant: "개 5kg", species: "dog",
    note: "복부 초음파 검사와 판독료입니다. 엑스레이로 안 보이는 장기 안쪽을 봅니다." },
  { slug: "초음파-10kg", group: "영상검사비", label: "초음파 검사비", variant: "개 10kg", species: "dog",
    note: "복부 초음파 검사와 판독료입니다." },
  { slug: "초음파-20kg", group: "영상검사비", label: "초음파 검사비", variant: "개 20kg", species: "dog",
    note: "복부 초음파 검사와 판독료입니다." },
  { slug: "ct-5kg", group: "영상검사비", label: "CT 촬영비", variant: "개 5kg", species: "dog",
    note: "컴퓨터단층촬영과 판독료입니다. 장비를 갖춘 병원이 적어 값을 게시한 지역도 적습니다." },
  { slug: "ct-10kg", group: "영상검사비", label: "CT 촬영비", variant: "개 10kg", species: "dog",
    note: "컴퓨터단층촬영과 판독료입니다. 대개 전신마취가 필요해 마취비가 따로 붙습니다." },
  { slug: "ct-20kg", group: "영상검사비", label: "CT 촬영비", variant: "개 20kg", species: "dog",
    note: "컴퓨터단층촬영과 판독료입니다." },
  { slug: "mri-5kg", group: "영상검사비", label: "MRI 촬영비", variant: "개 5kg", species: "dog",
    note: "자기공명영상 촬영과 판독료입니다. 디스크·뇌질환 진단에 씁니다. 가장 비싼 검사 축입니다." },
  { slug: "mri-10kg", group: "영상검사비", label: "MRI 촬영비", variant: "개 10kg", species: "dog",
    note: "자기공명영상 촬영과 판독료입니다. 전신마취가 필요합니다." },
  { slug: "mri-20kg", group: "영상검사비", label: "MRI 촬영비", variant: "개 20kg", species: "dog",
    note: "자기공명영상 촬영과 판독료입니다." },

  // ── 투약·조제비 ──
  { slug: "심장사상충-예방", group: "투약·조제비", label: "심장사상충 예방비", variant: "", species: "both",
    note: "월 1회 투여하는 심장사상충 예방약 비용입니다. 모기가 옮기고 걸리면 치료가 훨씬 비쌉니다." },
  { slug: "외부기생충-예방", group: "투약·조제비", label: "외부기생충 예방비", variant: "", species: "both",
    note: "진드기·벼룩 예방약 비용입니다. 바르는 약과 먹는 약이 있고 값이 다릅니다." },
  { slug: "광범위-구충", group: "투약·조제비", label: "광범위 구충비", variant: "", species: "both",
    note: "내부·외부 기생충을 함께 잡는 구충제 비용입니다." },
];

/** 화면에 늘어놓는 순서 */
export const GROUPS = [
  "진찰료",
  "입원비",
  "예방접종비",
  "혈액검사비",
  "영상검사비",
  "투약·조제비",
] as const;

const BY_SLUG = new Map(ITEMS.map((i) => [i.slug, i]));

export function itemBySlug(slug: string): FeeItem | undefined {
  return BY_SLUG.get(slug);
}

/** 항목 허브 경로 */
export const ITEM_HUB_SLUG = "진료비";

/** `초진 진찰료 (개 5kg)`. 갈래가 없으면 이름만 */
export function itemFullLabel(item: FeeItem): string {
  return item.variant ? `${item.label} (${item.variant})` : item.label;
}

/** 제목용. 35개가 전부 "○○ 비용" 이면 자동 생성으로 읽혀 묶음마다 갈라 쓴다 */
export function itemHeadline(item: FeeItem): string {
  const who = item.variant ? ` ${item.variant}` : "";
  switch (item.group) {
    case "진찰료":
      return `${item.label}${who} 얼마`;
    case "입원비":
      return `동물병원 입원비${who} 하루 얼마`;
    case "예방접종비":
      return `${item.label.replace(" 접종비", "")} 접종 비용`;
    case "혈액검사비":
    case "영상검사비":
      return `${item.label.replace(" 검사비", "").replace(" 촬영비", "")}${who} 검사 비용`;
    default:
      return `${item.label} 얼마`;
  }
}

/** 같은 묶음의 다른 항목 (상세 화면 아래 내부 링크) */
export function siblingItems(item: FeeItem, limit = 12): FeeItem[] {
  return ITEMS.filter((i) => i.group === item.group && i.slug !== item.slug).slice(0, limit);
}

/** 묶음별로 나눈다 (허브 화면) */
export function groupItems(): Array<{ group: string; items: FeeItem[] }> {
  return GROUPS.map((g) => ({
    group: g,
    items: ITEMS.filter((i) => i.group === g),
  })).filter((g) => g.items.length > 0);
}

/**
 * 앞세울 항목.
 *
 * 35개를 그대로 늘어놓으면 사람들이 실제로 찾는 것이 묻힌다.
 * 검색으로 들어올 만한 말을 기준으로 골랐다.
 */
export const FEATURED_SLUGS = [
  "종합백신-강아지",
  "초진-진찰료-5kg",
  "심장사상충-예방",
  "엑스레이-5kg",
  "전혈구검사",
  "입원비-5kg",
  "초음파-5kg",
  "광견병백신",
] as const;

export function featuredItems(): FeeItem[] {
  return FEATURED_SLUGS.map((s) => BY_SLUG.get(s)).filter((i): i is FeeItem => Boolean(i));
}
