/**
 * 강아지·고양이 음식 사전.
 *
 * petpawpaw.net 에서 옮겨 왔다 (scripts/import-foods.mjs). 66건이고
 * 개 42 · 고양이 24, 안전 22 · 주의 24 · 위험 20 으로 나뉜다.
 *
 * 진료비와 붙여 놓은 이유는 검색 의도가 이어지기 때문이다. "강아지가
 * 초콜릿 먹었어요" 로 들어온 사람이 다음에 찾는 것이 "우리 동네 동물병원
 * 얼마" 다. 두 축을 서로 링크로 잇는다.
 */

import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

export const FOODS_TABLE = "vet_foods";

/** 음식 허브 경로 */
export const FOOD_HUB_SLUG = "음식";

export type Animal = "dog" | "cat";
export type Safety = "safe" | "caution" | "danger";

/**
 * 동물별 경로. `/강아지`, `/고양이`
 *
 * `subject` 를 따로 두는 이유는 조사 때문이다. 이름을 그대로 이어 붙이면
 * "강아지이 먹어도 되는 음식" 이 된다. 둘 다 받침이 없어 주격 조사는 `가` 다.
 */
export interface AnimalMeta {
  key: Animal;
  slug: string;
  name: string;
  /** 주격 조사를 붙인 형태. 예: 강아지가 */
  subject: string;
  emoji: string;
}

export const ANIMALS: AnimalMeta[] = [
  { key: "dog", slug: "강아지", name: "강아지", subject: "강아지가", emoji: "🐶" },
  { key: "cat", slug: "고양이", name: "고양이", subject: "고양이가", emoji: "🐱" },
];

const ANIMAL_BY_SLUG = new Map(ANIMALS.map((a) => [a.slug, a]));
const ANIMAL_BY_KEY = new Map(ANIMALS.map((a) => [a.key, a]));

export function animalBySlug(slug: string) {
  return ANIMAL_BY_SLUG.get(slug);
}
export function animalByKey(key: string) {
  return ANIMAL_BY_KEY.get(key as Animal);
}

/** 신호등. 색과 말이 짝을 이뤄야 색맹 사용자도 구분할 수 있다 */
export const SAFETY_META: Record<
  Safety,
  { label: string; emoji: string; short: string }
> = {
  safe: { label: "먹어도 됩니다", emoji: "🟢", short: "안전" },
  caution: { label: "조건부로 조금만", emoji: "🟡", short: "주의" },
  danger: { label: "주면 안 됩니다", emoji: "🔴", short: "위험" },
};

export const SAFETY_ORDER: Safety[] = ["danger", "caution", "safe"];

export interface FoodBlock {
  h: string;
  p: string[];
}

export interface FoodFaq {
  q: string;
  a: string;
}

export interface Food {
  id: string;
  animal: Animal;
  slug: string;
  name: string;
  emoji: string | null;
  safety: Safety;
  one_liner: string | null;
  summary: string | null;
  benefits: string[];
  risks: string[];
  symptoms: string[];
  serving_guide: string | null;
  alternatives: string[];
  faq: FoodFaq[];
  aliases: string[];
  body: FoodBlock[];
  published_at: string | null;
}

const FOOD_COLUMNS =
  "id, animal, slug, name, emoji, safety, one_liner, summary, benefits, risks, symptoms, serving_guide, alternatives, faq, aliases, body, published_at";

const CACHE_SECONDS = 3600;
const CACHE_VERSION = "vet-foods-v1";

async function fetchFoods(): Promise<Food[]> {
  if (!supabaseAdmin) return [];
  try {
    const { data, error } = await supabaseAdmin
      .from(FOODS_TABLE)
      .select(FOOD_COLUMNS)
      .eq("status", "published")
      .order("animal")
      .order("name")
      .limit(1000);
    if (error) {
      console.error("fetchFoods", error.message);
      return [];
    }
    return (data ?? []) as unknown as Food[];
  } catch {
    return [];
  }
}

const cachedFoods = unstable_cache(fetchFoods, [CACHE_VERSION, "all"], {
  revalidate: CACHE_SECONDS,
  tags: ["vet"],
});

export function listFoods() {
  return cachedFoods();
}

export async function listFoodsByAnimal(animal: Animal): Promise<Food[]> {
  const all = await cachedFoods();
  return all.filter((f) => f.animal === animal);
}

/**
 * 음식 상세 URL 슬러그. `강아지-초콜릿`, `고양이-포도`.
 *
 * 개와 고양이가 같은 이름을 각자 가진다(초콜릿·아보카도·딸기 등). 동물을
 * 앞에 붙이지 않으면 둘 중 하나가 가려진다.
 */
export function foodSlug(animal: Animal, slug: string): string {
  const a = ANIMAL_BY_KEY.get(animal);
  return `${a?.slug ?? animal}-${slug}`;
}

export function foodPath(food: Pick<Food, "animal" | "slug">): string {
  return `/${foodSlug(food.animal, food.slug)}`;
}

/**
 * `강아지-초콜릿` → 그 음식. 형식이 아니거나 없는 음식이면 null.
 *
 * 음식 이름에도 하이픈이 들어갈 수 있으므로 **처음 하이픈에서만** 자른다.
 */
export async function findFoodBySlug(slug: string): Promise<Food | null> {
  const idx = slug.indexOf("-");
  if (idx < 1) return null;
  const animal = ANIMAL_BY_SLUG.get(slug.slice(0, idx));
  if (!animal) return null;

  const name = slug.slice(idx + 1);
  const all = await cachedFoods();
  return all.find((f) => f.animal === animal.key && f.slug === name) ?? null;
}

/** 같은 동물의 다른 음식. 같은 신호등 색을 먼저 보여준다 */
export function relatedFoods(all: Food[], food: Food, limit = 6): Food[] {
  const pool = all.filter((f) => f.animal === food.animal && f.id !== food.id);
  const same = pool.filter((f) => f.safety === food.safety);
  const rest = pool.filter((f) => f.safety !== food.safety);
  return [...same, ...rest].slice(0, limit);
}

export function countBySafety(foods: Food[]): Record<Safety, number> {
  return foods.reduce(
    (acc, f) => {
      acc[f.safety] = (acc[f.safety] ?? 0) + 1;
      return acc;
    },
    { safe: 0, caution: 0, danger: 0 } as Record<Safety, number>,
  );
}
