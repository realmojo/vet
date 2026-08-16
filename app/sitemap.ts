import { MetadataRoute } from "next";
import { SITE_LINKS } from "@/lib/menu";
import { REGION_HUB_SLUG, SIDOS } from "@/lib/regions";
import { ITEM_HUB_SLUG, ITEMS } from "@/lib/fee-items";
import { ANIMALS, FOOD_HUB_SLUG, foodSlug, listFoods } from "@/lib/foods";
import { THIN_ITEM_COUNT, itemStatsMap, listRegions } from "@/lib/fee-data";
import { absoluteUrl } from "@/lib/seo";

/**
 * 전체 URL 이 320개쯤(항목 35 + 시군구 201 + 시도 17 + 음식 66 + 고정)이라
 * 한 파일로 충분하다. yoyang 처럼 인덱스로 쪼갤 필요가 없다.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [regions, stats, foods] = await Promise.all([
    listRegions(),
    itemStatsMap(),
    listFoods(),
  ]);

  const statics = [
    "/",
    `/${ITEM_HUB_SLUG}`,
    `/${REGION_HUB_SLUG}`,
    `/${FOOD_HUB_SLUG}`,
    ...ANIMALS.map((a) => `/${a.slug}`),
    ...SITE_LINKS.map((l) => l.href),
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: (path === "/" ? "daily" : "monthly") as "daily" | "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  return [
    ...statics,
    ...SIDOS.map((s) => ({
      url: absoluteUrl(`/${s.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    // 넓게 집계된 항목을 앞세운다. MRI·CT 는 값이 있는 지역이 20여 곳뿐이라
    // 페이지가 얇다.
    ...ITEMS.map((i) => ({
      url: absoluteUrl(`/${i.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: (stats.get(i.slug)?.region_count ?? 0) >= 100 ? 0.9 : 0.6,
    })),
    // 공개 항목이 얇은 지역은 페이지 내용도 얇다
    ...regions.map((r) => ({
      url: absoluteUrl(`/${r.region_slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: r.item_count >= THIN_ITEM_COUNT ? 0.8 : 0.5,
    })),
    ...foods.map((f) => ({
      url: absoluteUrl(`/${foodSlug(f.animal, f.slug)}`),
      lastModified: f.published_at ? new Date(f.published_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
