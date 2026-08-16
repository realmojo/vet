import {
  FOOD_HUB_SLUG,
  SAFETY_META,
  SAFETY_ORDER,
  countBySafety,
  listFoodsByAnimal,
  type AnimalMeta,
} from "@/lib/foods";
import { ITEM_HUB_SLUG, featuredItems, itemFullLabel } from "@/lib/fee-items";
import { breadcrumbJsonLd } from "@/lib/seo";
import StatTile from "@/components/fee/StatTile";
import FoodCard from "@/components/food/FoodCard";
import Adsense from "@/components/Adsense";
import { AD_SLOTS } from "@/lib/ads";

export default async function AnimalView({
  animal,
}: {
  animal: AnimalMeta;
}) {
  const foods = await listFoodsByAnimal(animal.key);
  const counts = countBySafety(foods);

  const trail = [
    { name: "홈", path: "/" },
    { name: "음식", path: `/${FOOD_HUB_SLUG}` },
    { name: animal.name, path: `/${animal.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(trail)),
        }}
      />

      <div className="page-head">
        <span className="cat-badge cat-badge--food">음식 사전</span>
        <h1>
          <span aria-hidden>{animal.emoji}</span> {animal.subject} 먹어도 되는
          음식
        </h1>
        <p>
          {animal.name}에게 줘도 되는지 신호등으로 갈라 놓았습니다. 위험한 것부터
          봅니다 — 급한 쪽이 그쪽이기 때문입니다.
        </p>
      </div>

      <section className="stat-grid">
        <StatTile label="전체" value={`${foods.length}가지`} />
        {SAFETY_ORDER.map((s) => (
          <StatTile
            key={s}
            label={`${SAFETY_META[s].emoji} ${SAFETY_META[s].short}`}
            value={`${counts[s]}가지`}
          />
        ))}
      </section>

      <div className="ad-slot">
        <Adsense slotId={AD_SLOTS.home} />
      </div>

      {SAFETY_ORDER.map((s) => {
        const list = foods.filter((f) => f.safety === s);
        if (list.length === 0) return null;
        return (
          <section key={s} style={{ marginBottom: 30 }}>
            <div className="sec-head">
              <h2 className="sec-title">
                {SAFETY_META[s].emoji} {SAFETY_META[s].label}
              </h2>
            </div>
            <div className="food-grid">
              {list.map((f) => (
                <FoodCard key={f.id} food={f} />
              ))}
            </div>
          </section>
        );
      })}

      {foods.length === 0 && (
        <div className="empty-box">아직 등록된 음식이 없습니다.</div>
      )}

      <section className="panel">
        <h2 className="panel__title">병원에 가야 할 것 같다면</h2>
        <p className="panel__desc">
          진료비를 미리 알고 가면 마음이 놓입니다. 우리 동네 동물병원의 진찰료와
          검사비를 정리해 두었습니다.
        </p>
        <div className="region-chips">
          {featuredItems()
            .slice(0, 5)
            .map((i) => (
              <a target="_self" key={i.slug} href={`/${i.slug}`}>
                {itemFullLabel(i)}
              </a>
            ))}
          <a target="_self" href={`/${ITEM_HUB_SLUG}`}>
            전체 진료비 보기
          </a>
        </div>
      </section>

      <div className="ad-slot">
        <Adsense slotId={AD_SLOTS.bottom} />
      </div>
    </>
  );
}
