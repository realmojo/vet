import type { Metadata } from "next";
import { formatWonShort, itemStatsMap, listRegions } from "@/lib/fee-data";
import { ITEMS, itemFullLabel } from "@/lib/fee-items";
import { SAFETY_META, foodPath, listFoods } from "@/lib/foods";
import { regionLabel } from "@/lib/regions";
import { buildMetadata, SITE } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...buildMetadata({
    path: "/search",
    title: `검색 | ${SITE.name}`,
    description: "진료 항목·지역·음식을 검색합니다.",
  }),
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const keyword = (q ?? "").trim();
  const key = keyword.replace(/\s+/g, "");
  const strip = (v: string) => v.replace(/\s+/g, "");

  const [stats, regions, foods] = keyword
    ? await Promise.all([itemStatsMap(), listRegions(), listFoods()])
    : [new Map(), [], []];

  const items = keyword
    ? ITEMS.filter(
        (i) =>
          strip(i.label).includes(key) ||
          strip(i.slug).includes(key) ||
          strip(i.group).includes(key) ||
          strip(i.variant).includes(key),
      ).slice(0, 40)
    : [];

  const places = keyword
    ? regions
        .filter(
          (r) =>
            strip(r.sigungu_name).includes(key) || strip(r.sido_slug).includes(key),
        )
        .slice(0, 60)
    : [];

  // 별칭까지 훑는다. "천도복숭아" 로 찾아도 복숭아가 나와야 한다.
  const dishes = keyword
    ? foods
        .filter(
          (f) =>
            strip(f.name).includes(key) ||
            f.aliases.some((a) => strip(a).includes(key)),
        )
        .slice(0, 40)
    : [];

  const total = items.length + places.length + dishes.length;

  return (
    <>
      <div className="page-head">
        <h1>
          <span aria-hidden>🔍</span>
          검색
        </h1>
        <p>
          {keyword
            ? `"${keyword}" 검색 결과 ${total}건`
            : "진료 항목이나 지역 이름, 음식 이름을 입력해주세요."}
        </p>
      </div>

      {items.length > 0 && (
        <section className="sido-block">
          <h2 className="sido-block__title">
            진료 항목
            <span className="sido-block__count">{items.length}가지</span>
          </h2>
          <div className="region-chips">
            {items.map((i) => (
              <a target="_self" key={i.slug} href={`/${i.slug}`}>
                {itemFullLabel(i)}
                <span style={{ fontSize: 11, color: "#8b9184" }}>
                  {formatWonShort(stats.get(i.slug)?.national_mid)}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {places.length > 0 && (
        <section className="sido-block">
          <h2 className="sido-block__title">
            지역
            <span className="sido-block__count">{places.length}곳</span>
          </h2>
          <div className="region-chips">
            {places.map((r) => (
              <a target="_self" key={r.region_slug} href={`/${r.region_slug}`}>
                {regionLabel(r.sido_slug, r.sigungu_name)}
              </a>
            ))}
          </div>
        </section>
      )}

      {dishes.length > 0 && (
        <section className="sido-block">
          <h2 className="sido-block__title">
            음식
            <span className="sido-block__count">{dishes.length}가지</span>
          </h2>
          <div className="region-chips">
            {dishes.map((f) => (
              <a target="_self" key={f.id} href={foodPath(f)}>
                <span aria-hidden>{f.emoji ?? "🍽️"}</span>
                {f.animal === "dog" ? "강아지" : "고양이"} {f.name}
                <span style={{ fontSize: 11, color: "#8b9184" }}>
                  {SAFETY_META[f.safety].emoji}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {keyword && total === 0 && (
        <div className="empty-box">검색 결과가 없습니다.</div>
      )}
    </>
  );
}
