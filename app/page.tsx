import {
  DATA_UPDATED,
  DATA_YEAR,
  ITEM_KINDS,
  THIN_ITEM_COUNT,
  formatWon,
  formatWonShort,
  indexSign,
  itemStatsMap,
  listRegions,
  priceRatio,
  ratioText,
} from "@/lib/fee-data";
import {
  ITEM_HUB_SLUG,
  featuredItems,
  groupItems,
  itemFullLabel,
} from "@/lib/fee-items";
import { REGION_HUB_SLUG, SIDOS } from "@/lib/regions";
import {
  ANIMALS,
  FOOD_HUB_SLUG,
  SAFETY_META,
  countBySafety,
  listFoods,
} from "@/lib/foods";
import StatTile from "@/components/fee/StatTile";
import DataNotice from "@/components/fee/DataNotice";
import FoodCard from "@/components/food/FoodCard";
import Adsense from "@/components/Adsense";
import { AD_SLOTS } from "@/lib/ads";

export const revalidate = 300;

export default async function HomePage() {
  const [stats, regions, foods] = await Promise.all([
    itemStatsMap(),
    listRegions(),
    listFoods(),
  ]);

  const featured = featuredItems();
  const groups = groupItems();

  // 위험한 음식을 앞세운다. "강아지가 초콜릿 먹었어요" 가 가장 급한 검색이다.
  const dangerous = foods.filter((f) => f.safety === "danger").slice(0, 6);

  const solid = regions.filter((r) => r.item_count >= THIN_ITEM_COUNT);
  const ranked = solid
    .filter((r) => r.price_index !== null)
    .sort((a, b) => (b.price_index ?? 0) - (a.price_index ?? 0));
  const priciest = ranked.slice(0, 5);
  const cheapest = ranked.slice(-5).reverse();

  const widest = featured
    .map((i) => ({ item: i, s: stats.get(i.slug) }))
    .filter((x) => x.s)
    .map((x) => ({ ...x, ratio: priceRatio(x.s!) }))
    .filter((x) => x.ratio !== null)
    .sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0))
    .slice(0, 5);

  return (
    <>
      <div className="page-head">
        <h1>
          <span aria-hidden>🐾</span>
          같은 종합백신인데 동네마다 값이 다릅니다
        </h1>
        <p>
          동물병원은 진료비를 스스로 정합니다. 농림축산식품부가 해마다 조사해
          공개하는 자료로 <strong>시군구 {regions.length}곳</strong>의 진료비를
          정리하고, 강아지·고양이가 먹어도 되는 음식{" "}
          <strong>{foods.length}가지</strong>를 함께 담았습니다.
        </p>
      </div>

      <section className="stat-grid">
        <StatTile
          label="진료 항목"
          value={`${stats.size}가지`}
          sub={`의무 게시 ${ITEM_KINDS}종`}
        />
        <StatTile label="지역" value={`시군구 ${regions.length}곳`} />
        <StatTile label="음식 사전" value={`${foods.length}가지`} sub="강아지·고양이" />
        <StatTile label="기준" value={`${DATA_YEAR}년`} sub={DATA_UPDATED} />
      </section>

      <div className="ad-slot">
        <Adsense slotId={AD_SLOTS.home} />
      </div>

      <section style={{ marginBottom: 36 }}>
        <div className="sec-head">
          <h2 className="sec-title">많이 찾는 진료비</h2>
          <a target="_self" href={`/${ITEM_HUB_SLUG}`} className="sec-more">
            전체 항목 보기
          </a>
        </div>
        <div className="panel">
          <p className="panel__desc">
            전국 시군구 중간값들의 중간값입니다. 최저·최고는 한 곳만 있어도
            잡히는 값이라 중간값으로 보시는 편이 실제에 가깝습니다.
          </p>
          <div className="table-scroll">
            <table className="pr-table">
              <thead>
                <tr>
                  <th scope="col">항목</th>
                  <th scope="col" className="is-num">
                    전국 중간값
                  </th>
                  <th scope="col" className="is-num">
                    최저~최고
                  </th>
                </tr>
              </thead>
              <tbody>
                {featured.map((i) => {
                  const s = stats.get(i.slug);
                  return (
                    <tr key={i.slug}>
                      <td>
                        <a
                          target="_self"
                          href={`/${i.slug}`}
                          className="pr-table__name pr-table__link"
                        >
                          {i.label}
                        </a>
                        <span className="pr-table__meta">
                          {i.variant || i.group}
                        </span>
                      </td>
                      <td className="is-num">
                        <strong>{formatWon(s?.national_mid)}</strong>
                      </td>
                      <td className="is-num">
                        {formatWonShort(s?.min_price)} ~{" "}
                        {formatWonShort(s?.max_price)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {priciest.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <div className="sec-head">
            <h2 className="sec-title">동네마다 이만큼 다릅니다</h2>
            <a target="_self" href={`/${REGION_HUB_SLUG}`} className="sec-more">
              지역별 보기
            </a>
          </div>
          <div className="panel">
            <p className="panel__desc">
              전국을 100 으로 놓은 가격 수준입니다. 공개 항목이{" "}
              {THIN_ITEM_COUNT}개 이상인 {solid.length}곳만 견줬습니다.
            </p>
            <div className="table-scroll">
              <table className="pr-table">
                <thead>
                  <tr>
                    <th scope="col">비싼 동네</th>
                    <th scope="col" className="is-num">
                      수준
                    </th>
                    <th scope="col">싼 동네</th>
                    <th scope="col" className="is-num">
                      수준
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {priciest.map((hi, i) => {
                    const lo = cheapest[i];
                    return (
                      <tr key={hi.region_slug}>
                        <td>
                          <a
                            target="_self"
                            href={`/${hi.region_slug}`}
                            className="pr-table__name pr-table__link"
                          >
                            {hi.sido_slug} {hi.sigungu_name}
                          </a>
                        </td>
                        <td className="is-num">
                          <span className={`rel rel--${indexSign(hi.price_index)}`}>
                            {hi.price_index}
                          </span>
                        </td>
                        <td>
                          {lo && (
                            <a
                              target="_self"
                              href={`/${lo.region_slug}`}
                              className="pr-table__name pr-table__link"
                            >
                              {lo.sido_slug} {lo.sigungu_name}
                            </a>
                          )}
                        </td>
                        <td className="is-num">
                          {lo && (
                            <span className={`rel rel--${indexSign(lo.price_index)}`}>
                              {lo.price_index}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {dangerous.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <div className="sec-head">
            <h2 className="sec-title">🔴 이건 주면 안 됩니다</h2>
            <a target="_self" href={`/${FOOD_HUB_SLUG}`} className="sec-more">
              음식 사전 전체
            </a>
          </div>
          <div className="food-grid">
            {dangerous.map((f) => (
              <FoodCard key={f.id} food={f} />
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: 36 }}>
        <div className="sec-head">
          <h2 className="sec-title">음식 사전</h2>
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
                  {mine.length}가지 · {SAFETY_META.safe.emoji} {c.safe} ·{" "}
                  {SAFETY_META.caution.emoji} {c.caution} ·{" "}
                  {SAFETY_META.danger.emoji} {c.danger}
                </p>
              </a>
            );
          })}
        </div>
      </section>

      {widest.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <div className="sec-head">
            <h2 className="sec-title">값이 가장 벌어지는 진료</h2>
          </div>
          <div className="panel">
            <p className="panel__desc">
              집계된 최저와 최고가 몇 배 차이 나는지입니다. 이런 항목일수록
              가기 전에 값을 물어보는 편이 낫습니다.
            </p>
            <div className="table-scroll">
              <table className="pr-table">
                <thead>
                  <tr>
                    <th scope="col">항목</th>
                    <th scope="col" className="is-num">
                      중간값
                    </th>
                    <th scope="col" className="is-num">
                      차이
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {widest.map(({ item, s, ratio }) => (
                    <tr key={item.slug}>
                      <td>
                        <a
                          target="_self"
                          href={`/${item.slug}`}
                          className="pr-table__name pr-table__link"
                        >
                          {itemFullLabel(item)}
                        </a>
                      </td>
                      <td className="is-num">{formatWon(s?.national_mid)}</td>
                      <td className="is-num">
                        <strong>{ratioText(ratio)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <section style={{ marginBottom: 36 }}>
        <div className="sec-head">
          <h2 className="sec-title">지역으로 찾기</h2>
          <a target="_self" href={`/${REGION_HUB_SLUG}`} className="sec-more">
            전체 지역 보기
          </a>
        </div>
        <div className="sido-block">
          <div className="region-chips">
            {SIDOS.map((s) => (
              <a target="_self" key={s.slug} href={`/${s.slug}`}>
                {s.slug}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 36 }}>
        <div className="sec-head">
          <h2 className="sec-title">묶음으로 찾기</h2>
          <a target="_self" href={`/${ITEM_HUB_SLUG}`} className="sec-more">
            전체 항목 보기
          </a>
        </div>
        <div className="bento-grid">
          {groups.map((g) => (
            <a
              target="_self"
              key={g.group}
              href={`/${ITEM_HUB_SLUG}`}
              className="bento-card"
            >
              <h3 className="bento-card__title">{g.group}</h3>
              <p className="bento-card__desc">
                {g.items.length}가지 ·{" "}
                {g.items
                  .slice(0, 3)
                  .map((i) => i.label)
                  .join(", ")}
              </p>
            </a>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">왜 병원마다 값이 다른가</h2>
        <p className="panel__desc">
          사람 병원과 달리 동물병원 진료에는 건강보험이 없습니다. 나라가 정한
          수가가 없으니 <strong>병원이 값을 스스로 매깁니다.</strong> 그래서 같은
          예방접종인데도 동네에 따라 두세 배씩 벌어집니다.
        </p>
        <p className="panel__desc" style={{ marginBottom: 0 }}>
          <strong>값이 싸다고 진료가 나쁜 것은 아닙니다.</strong> 다만 미리
          물어보지 않으면 생각보다 많이 나올 수 있습니다. 2023년부터 동물병원은
          주요 진료비를 병원 안에 게시할 의무가 있으니, 가기 전에 전화로 물어보는
          것이 가장 확실합니다.
        </p>
      </section>

      <DataNotice />

      <div className="ad-slot">
        <Adsense slotId={AD_SLOTS.bottom} />
      </div>
    </>
  );
}
