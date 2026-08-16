/**
 * 동물병원 진료비 조회.
 *
 * ────────────────────────────────────────────────────────────────────────
 *  원본
 * ────────────────────────────────────────────────────────────────────────
 * 농림축산식품부 「동물병원 진료비 조사·공개 시스템」(animalclinicfee.or.kr).
 * 2023년부터 동물병원은 주요 진료비를 게시할 의무가 있고, 정부가 그것을
 * 해마다 조사해 **시군구 단위**로 최저·최고·평균·중간값을 공개한다.
 * 적재는 scripts/import-fees.mjs (시도 17 × 항목 35 = 595 요청).
 *
 * 공공데이터포털에는 전국 진료비 데이터셋이 없다. 포털에 있는 것은 동물병원
 * 인허가 목록(15045050)뿐이라 값은 위 시스템에서만 얻을 수 있다.
 *
 * ────────────────────────────────────────────────────────────────────────
 *  이 자료가 말하는 것과 말하지 않는 것
 * ────────────────────────────────────────────────────────────────────────
 * **병원별 가격이 아니다.** 시군구로 묶은 집계라 "강남구 A동물병원 중성화
 * 얼마"는 알 수 없고 "강남구에서 초진 진찰료가 어느 범위인가"만 알 수 있다.
 *
 * 그래서 화면은 **중간값을 앞세운다.** 최저·최고는 한 곳만 있어도 잡히는
 * 값이다. 실제로 강남구 초진 진찰료는 최저 5,000원 · 중간 11,000원 ·
 * 평균 15,078원 · 최고 50,000원인데, 평균이 최고값 하나에 끌려 올라가 있다.
 *
 * 지역끼리 비교할 때는 중간값이 아니라 **가격지수(price_index)** 를 쓴다.
 * 이유는 supabase/migrations/002 주석에 적어 두었다 — 요약하면 군 단위에는
 * MRI·CT 를 갖춘 병원이 없어 비싼 항목이 통째로 빠지고, 그러면 중간값이
 * 저절로 내려가 "싼 동네"처럼 보인다.
 */

import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

export const FEES_TABLE = "vet_fees";
export const REGIONS_TABLE = "vet_regions";
export const ITEMS_TABLE = "vet_items";

/** 자료의 기준 연도. 화면에 반복해서 노출한다. */
export const DATA_YEAR = 2025;
/** 조사 결과가 공개된 날 (농림축산식품부 보도자료) */
export const DATA_UPDATED = "2025년 12월 22일";
/** 조사 주기 */
export const DATA_CYCLE = "해마다 한 번";
/** 게시 의무 항목 수 (개체·체중별로 펼치면 35조합) */
export const ITEM_KINDS = 20;

/** 가격지수를 믿고 보여줄 최소 항목 수. 이보다 얇으면 표본이 부족하다 */
export const THIN_ITEM_COUNT = 20;

export interface FeeRow {
  item_slug: string;
  sido_code: string;
  sido_slug: string;
  sido_name: string;
  sigungu_name: string;
  region_slug: string;
  min_price: number | null;
  mid_price: number | null;
  avg_price: number | null;
  max_price: number | null;
}

export interface RegionStats {
  region_slug: string;
  sido_slug: string;
  sido_name: string;
  sigungu_name: string;
  /** 값이 있는 항목 수 (최대 35) */
  item_count: number;
  /** 그 지역 항목 중간값들의 중간값. **지역 비교에 쓰지 말 것** */
  median_of_mid: number | null;
  /** 전국=100 기준 가격지수. 지역 비교는 이 값으로 한다 */
  price_index: number | null;
  consult_mid: number | null;
  vaccine_mid: number | null;
}

export interface ItemStats {
  item_slug: string;
  /** 값이 있는 시군구 수 (최대 201) */
  region_count: number;
  min_price: number | null;
  max_price: number | null;
  /** 시군구 중간값들의 중간값. 이 사이트가 말하는 '전국 시세' */
  national_mid: number | null;
  cheapest_region: string | null;
  cheapest_mid: number | null;
  priciest_region: string | null;
  priciest_mid: number | null;
}

const FEE_COLUMNS =
  "item_slug, sido_code, sido_slug, sido_name, sigungu_name, region_slug, min_price, mid_price, avg_price, max_price";

const CACHE_SECONDS = 3600;
/** 조회 결과의 모양이 바뀌면 반드시 올린다. 안 올리면 예전 모양이 그대로 나온다. */
const CACHE_VERSION = "vet-v1";

/* ------------------------------- 조회 ------------------------------- */

async function fetchAllItemStats(): Promise<ItemStats[]> {
  if (!supabaseAdmin) return [];
  try {
    const { data, error } = await supabaseAdmin
      .from(ITEMS_TABLE)
      .select("*")
      .order("national_mid", { ascending: false, nullsFirst: false })
      .limit(200);
    if (error) {
      console.error("fetchAllItemStats", error.message);
      return [];
    }
    return (data ?? []) as ItemStats[];
  } catch {
    return [];
  }
}

async function fetchAllRegions(): Promise<RegionStats[]> {
  if (!supabaseAdmin) return [];
  try {
    const { data, error } = await supabaseAdmin
      .from(REGIONS_TABLE)
      .select("*")
      .order("sido_slug")
      .order("sigungu_name")
      .limit(1000);
    if (error) {
      console.error("fetchAllRegions", error.message);
      return [];
    }
    return (data ?? []) as RegionStats[];
  } catch {
    return [];
  }
}

/** 항목 하나의 전국 시군구 행 (최대 201) */
async function fetchItemFees(itemSlug: string): Promise<FeeRow[]> {
  if (!supabaseAdmin) return [];
  try {
    const { data, error } = await supabaseAdmin
      .from(FEES_TABLE)
      .select(FEE_COLUMNS)
      .eq("item_slug", itemSlug)
      .order("mid_price", { ascending: false, nullsFirst: false })
      .limit(1000);
    if (error) {
      console.error("fetchItemFees", error.message);
      return [];
    }
    return (data ?? []) as unknown as FeeRow[];
  } catch {
    return [];
  }
}

/** 지역 하나의 전체 항목 (최대 35) */
async function fetchRegionFees(regionSlug: string): Promise<FeeRow[]> {
  if (!supabaseAdmin) return [];
  try {
    const { data, error } = await supabaseAdmin
      .from(FEES_TABLE)
      .select(FEE_COLUMNS)
      .eq("region_slug", regionSlug)
      .limit(100);
    if (error) {
      console.error("fetchRegionFees", error.message);
      return [];
    }
    return (data ?? []) as unknown as FeeRow[];
  } catch {
    return [];
  }
}

/* --------------------------- 캐시를 씌운 조회 --------------------------- */

const cachedItemStats = unstable_cache(
  fetchAllItemStats,
  [CACHE_VERSION, "item-stats"],
  { revalidate: CACHE_SECONDS, tags: ["vet"] },
);
const cachedRegions = unstable_cache(fetchAllRegions, [CACHE_VERSION, "regions"], {
  revalidate: CACHE_SECONDS,
  tags: ["vet"],
});
const cachedItemFees = unstable_cache(fetchItemFees, [CACHE_VERSION, "item-fees"], {
  revalidate: CACHE_SECONDS,
  tags: ["vet"],
});
const cachedRegionFees = unstable_cache(
  fetchRegionFees,
  [CACHE_VERSION, "region-fees"],
  { revalidate: CACHE_SECONDS, tags: ["vet"] },
);

export function listItemStats() {
  return cachedItemStats();
}
export function listRegions() {
  return cachedRegions();
}
export function listItemFees(itemSlug: string) {
  return cachedItemFees(itemSlug);
}
export function listRegionFees(regionSlug: string) {
  return cachedRegionFees(regionSlug);
}

export async function getItemStats(itemSlug: string): Promise<ItemStats | null> {
  const all = await cachedItemStats();
  return all.find((i) => i.item_slug === itemSlug) ?? null;
}

export async function getRegion(regionSlug: string): Promise<RegionStats | null> {
  const all = await cachedRegions();
  return all.find((r) => r.region_slug === regionSlug) ?? null;
}

export async function itemStatsMap(): Promise<Map<string, ItemStats>> {
  const all = await cachedItemStats();
  return new Map(all.map((i) => [i.item_slug, i]));
}

export async function regionsMap(): Promise<Map<string, RegionStats>> {
  const all = await cachedRegions();
  return new Map(all.map((r) => [r.region_slug, r]));
}

/* ----------------------------- 화면용 계산 ----------------------------- */

/** 원 단위 금액. 만 원 이상은 "12만 5,000원" 처럼 끊어 읽기 좋게 쓴다. */
export function formatWon(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  if (value < 10000) return `${Math.round(value).toLocaleString("ko-KR")}원`;
  const man = Math.floor(value / 10000);
  const rest = Math.round(value % 10000);
  if (rest === 0) return `${man.toLocaleString("ko-KR")}만원`;
  return `${man.toLocaleString("ko-KR")}만 ${rest.toLocaleString("ko-KR")}원`;
}

/**
 * 표 안에서 자리를 아껴야 할 때 쓰는 짧은 표기.
 *
 * 10만원을 넘으면 소수점을 버린다. "93.0만원" 은 자릿수만 늘린다. 반대로
 * 1만원대는 소수점이 없으면 1만원과 1만 9천원이 같아 보이므로 한 자리를 남긴다.
 */
export function formatWonShort(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  if (value < 10000) return `${Math.round(value).toLocaleString("ko-KR")}원`;
  const man = value / 10000;
  const rounded = man >= 10 ? Math.round(man) : Math.round(man * 10) / 10;
  return `${rounded.toLocaleString("ko-KR")}만원`;
}

/** 최고 ÷ 최저. 같은 진료인데 얼마나 벌어지는지 한 숫자로 말해 준다. */
export function priceRatio(row: {
  min_price: number | null;
  max_price: number | null;
}): number | null {
  if (!row.min_price || !row.max_price) return null;
  const r = row.max_price / row.min_price;
  if (!Number.isFinite(r) || r < 1) return null;
  return r >= 10 ? Math.round(r) : Math.round(r * 10) / 10;
}

export function ratioText(ratio: number | null): string {
  if (!ratio) return "-";
  return `${ratio.toLocaleString("ko-KR")}배`;
}

/**
 * "최저 ~ 최고". 한쪽만 있는 경우가 있어서 그때는 있는 쪽만 말한다.
 * "- ~ 10만원" 처럼 보이면 값이 없는 것인지 0원인지 알 수 없다.
 */
export function rangeText(row: {
  min_price: number | null;
  max_price: number | null;
}): string {
  const { min_price: lo, max_price: hi } = row;
  if (lo === null && hi === null) return "-";
  if (lo === null) return `${formatWonShort(hi)} 이하`;
  if (hi === null) return `${formatWonShort(lo)} 이상`;
  if (lo === hi) return formatWonShort(lo);
  return `${formatWonShort(lo)} ~ ${formatWonShort(hi)}`;
}

/** 기준값 대비. "+38%" / "−12%" / "±0%" */
export function relative(value: number, base: number): string {
  if (!base) return "-";
  const pct = Math.round(((value - base) / base) * 100);
  if (pct === 0) return "±0%";
  return `${pct > 0 ? "+" : "−"}${Math.abs(pct)}%`;
}

export function relativeSign(value: number, base: number): "up" | "down" | "flat" {
  if (!base) return "flat";
  const pct = Math.round(((value - base) / base) * 100);
  return pct > 0 ? "up" : pct < 0 ? "down" : "flat";
}

/** 가격지수를 말로 옮긴다. 숫자만 보여주면 100 이 무슨 뜻인지 알기 어렵다. */
export function indexText(index: number | null): string {
  if (index === null) return "자료 부족";
  if (index >= 110) return "전국보다 비싼 편";
  if (index >= 103) return "전국보다 조금 비쌈";
  if (index > 97) return "전국과 비슷";
  if (index > 90) return "전국보다 조금 쌈";
  return "전국보다 싼 편";
}

export function indexSign(index: number | null): "up" | "down" | "flat" {
  if (index === null) return "flat";
  if (index > 103) return "up";
  if (index < 97) return "down";
  return "flat";
}

/**
 * 앞말의 받침에 맞는 조사를 붙인다.
 *
 * 항목 이름이 그대로 문장에 들어가므로 "은(는)" 같은 표기를 쓰지 않는다.
 * MRI·CT 처럼 영문으로 끝나는 것이 있어 읽는 소리를 기준으로 고른다.
 */
const LATIN_JONG = new Set(["l", "m", "n", "r", "z"]);
const DIGIT_JONG = new Set(["0", "1", "3", "6", "7", "8"]);

export function withParticle(word: string, pair: "은는" | "이가"): string {
  const bare = word
    .trim()
    .replace(/\s*[([{][^)\]}]*[)\]}]\s*$/, "")
    .replace(/[\s.,·]+$/, "")
    .trim();

  const last = (bare || word.trim()).slice(-1).toLowerCase();
  const code = last.charCodeAt(0);

  let hasJong: boolean;
  if (code >= 0xac00 && code <= 0xd7a3) {
    hasJong = (code - 0xac00) % 28 !== 0;
  } else if (/[a-z]/.test(last)) {
    hasJong = LATIN_JONG.has(last);
  } else if (/[0-9]/.test(last)) {
    hasJong = DIGIT_JONG.has(last);
  } else {
    return pair === "은는" ? `${word}은(는)` : `${word}이(가)`;
  }

  if (pair === "은는") return `${word}${hasJong ? "은" : "는"}`;
  return `${word}${hasJong ? "이" : "가"}`;
}
