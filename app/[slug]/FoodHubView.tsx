import {
  ANIMALS,
  FOOD_HUB_SLUG,
  SAFETY_META,
  SAFETY_ORDER,
  countBySafety,
  listFoods,
} from "@/lib/foods";
import { ITEM_HUB_SLUG } from "@/lib/fee-items";
import { breadcrumbJsonLd } from "@/lib/seo";
import StatTile from "@/components/fee/StatTile";
import FoodCard from "@/components/food/FoodCard";
import Adsense from "@/components/Adsense";
import { AD_SLOTS } from "@/lib/ads";

export default async function FoodHubView() {
  const foods = await listFoods();
  const counts = countBySafety(foods);

  const trail = [
    { name: "홈", path: "/" },
    { name: "음식", path: `/${FOOD_HUB_SLUG}` },
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
        <h1>
          <span aria-hidden>🍽️</span> 먹어도 되는 음식, 안 되는 음식
        </h1>
        <p>
          강아지·고양이가 먹어도 되는지 신호등으로 갈라 놓았습니다. 지금 뭘
          먹었는지부터 찾아보세요.
        </p>
      </div>

      <section className="stat-grid">
        <StatTile label="전체" value={`${foods.length}가지`} />
        {SAFETY_ORDER.map((s) => (
          <StatTile
            key={s}
            label={`${SAFETY_META[s].emoji} ${SAFETY_META[s].short}`}
            value={`${counts[s]}가지`}
            sub={SAFETY_META[s].label}
          />
        ))}
      </section>

      <div className="ad-slot">
        <Adsense slotId={AD_SLOTS.home} />
      </div>

      <section style={{ marginBottom: 32 }}>
        <div className="sec-head">
          <h2 className="sec-title">어느 쪽을 키우시나요</h2>
        </div>
        <div className="bento-grid">
          {ANIMALS.map((a) => {
            const mine = foods.filter((f) => f.animal === a.key);
            const c = countBySafety(mine);
            return (
              <a
                target="_self"
                key={a.slug}
                href={`/${a.slug}`}
                className="bento-card"
              >
                <div className="bento-card__icon" aria-hidden>
                  {a.emoji}
                </div>
                <h3 className="bento-card__title">
                  {a.subject} 먹어도 되는 음식
                </h3>
                <p className="bento-card__desc">
                  {mine.length}가지 · 🟢 안전 {c.safe} · 🟡 주의 {c.caution} · 🔴
                  위험 {c.danger}
                </p>
              </a>
            );
          })}
        </div>
      </section>

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

      <section className="panel">
        <h2 className="panel__title">이건 참고이지 진단이 아닙니다</h2>
        <p className="panel__desc">
          같은 음식이라도 몸무게·나이·지병에 따라 위험이 다릅니다. 여기 적힌
          것은 일반적인 안내일 뿐입니다.
        </p>
        <p className="panel__desc" style={{ marginBottom: 0 }}>
          <strong>이미 먹었고 증상이 보인다면 바로 동물병원으로 가세요.</strong>{" "}
          가기 전에{" "}
          <a target="_self" href={`/${ITEM_HUB_SLUG}`}>
            우리 동네 진료비
          </a>
          를 확인해 두면 마음이 조금 놓입니다.
        </p>
      </section>

      <div className="ad-slot">
        <Adsense slotId={AD_SLOTS.bottom} />
      </div>
    </>
  );
}
