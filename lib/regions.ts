/**
 * 지역 이름과 URL 슬러그.
 *
 * 진료비 원본은 시도를 `서울특별시`, 시군구를 `강남구` 처럼 준다. 주소를 그대로
 * 붙이면 `/서울특별시-강남구` 가 되는데 길고, 사람들이 검색할 때 쓰는 말도
 * 아니다. 시도는 **짧은 이름**으로 줄여 `/서울-강남구` 로 만든다.
 *
 * 이 규칙은 `scripts/fee-codes.mjs` 의 SIDOS 와 짝이 맞아야 한다.
 * 한쪽만 고치면 적재된 region_slug 와 화면이 찾는 슬러그가 어긋나 404 가 된다.
 */

export interface Sido {
  /** 법정동코드 앞 2자리 */
  code: string;
  /** 원문 이름. 예: 서울특별시 */
  name: string;
  /** 슬러그이자 화면에 쓰는 짧은 이름. 예: 서울 */
  slug: string;
}

export const SIDOS: Sido[] = [
  { code: "11", name: "서울특별시", slug: "서울" },
  { code: "26", name: "부산광역시", slug: "부산" },
  { code: "27", name: "대구광역시", slug: "대구" },
  { code: "28", name: "인천광역시", slug: "인천" },
  { code: "29", name: "광주광역시", slug: "광주" },
  { code: "30", name: "대전광역시", slug: "대전" },
  { code: "31", name: "울산광역시", slug: "울산" },
  { code: "36", name: "세종특별자치시", slug: "세종" },
  { code: "41", name: "경기도", slug: "경기" },
  { code: "42", name: "강원특별자치도", slug: "강원" },
  { code: "43", name: "충청북도", slug: "충북" },
  { code: "44", name: "충청남도", slug: "충남" },
  { code: "45", name: "전북특별자치도", slug: "전북" },
  { code: "46", name: "전라남도", slug: "전남" },
  { code: "47", name: "경상북도", slug: "경북" },
  { code: "48", name: "경상남도", slug: "경남" },
  { code: "50", name: "제주특별자치도", slug: "제주" },
];

const BY_NAME = new Map(SIDOS.map((s) => [s.name, s]));
const BY_SLUG = new Map(SIDOS.map((s) => [s.slug, s]));

export function sidoByName(name: string): Sido | undefined {
  return BY_NAME.get(name.trim());
}

export function sidoBySlug(slug: string): Sido | undefined {
  return BY_SLUG.get(slug.trim());
}

/** 시도 허브 경로 */
export const REGION_HUB_SLUG = "지역";

/**
 * 시군구 URL 슬러그. `서울-강남구`, `경기-성남시분당구`.
 *
 * 시군구 이름 안의 공백은 없앤다. 원본이 `성남시 분당구` 처럼 띄어 주는 경우가
 * 있는데, 슬러그에 공백이 들어가면 URL 에서 `%20` 이 되어 지저분하다.
 * 하이픈은 시도와 시군구를 가르는 구분자로만 쓴다.
 */
export function regionSlug(sidoShort: string, sigungu: string): string {
  return `${sidoShort}-${sigungu.replace(/\s+/g, "")}`;
}

/**
 * 세종처럼 시군구가 없는 곳.
 *
 * 원본이 ADDR2_NM 을 빈 값이나 시도 이름과 같은 값으로 주면 `세종-세종` 같은
 * 어색한 슬러그가 된다. 그때는 시도 이름 하나로 끝낸다.
 */
export function normalizeSigungu(sidoName: string, sigungu: string): string {
  const s = (sigungu ?? "").trim();
  if (!s || s === sidoName) return "";
  return s;
}

/** `서울-강남구` → { sido: "서울", sigungu: "강남구" }. 형식이 아니면 null */
export function parseRegionSlug(
  slug: string,
): { sido: Sido; sigungu: string } | null {
  const idx = slug.indexOf("-");
  if (idx < 1) {
    const only = sidoBySlug(slug);
    return only ? { sido: only, sigungu: "" } : null;
  }
  const sido = sidoBySlug(slug.slice(0, idx));
  if (!sido) return null;
  return { sido, sigungu: slug.slice(idx + 1) };
}

/** 화면에 쓰는 지역 이름. `서울 강남구` */
export function regionLabel(sidoShort: string, sigungu: string): string {
  return sigungu ? `${sidoShort} ${sigungu}` : sidoShort;
}
