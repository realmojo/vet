import {
  FOOD_HUB_SLUG,
  SAFETY_META,
  animalByKey,
  foodPath,
  listFoods,
  relatedFoods,
  type Food,
} from "@/lib/foods";
import { ITEM_HUB_SLUG, featuredItems, itemFullLabel } from "@/lib/fee-items";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import SafetyBadge from "@/components/food/SafetyBadge";
import FoodCard from "@/components/food/FoodCard";
import Adsense from "@/components/Adsense";
import { AD_SLOTS } from "@/lib/ads";

export default async function FoodView({ food }: { food: Food }) {
  const all = await listFoods();
  const related = relatedFoods(all, food);
  const animal = animalByKey(food.animal);
  const meta = SAFETY_META[food.safety];
  const animalName = animal?.name ?? "반려동물";

  const trail = [
    { name: "홈", path: "/" },
    { name: "음식", path: `/${FOOD_HUB_SLUG}` },
    { name: animalName, path: `/${animal?.slug ?? ""}` },
    { name: food.name, path: foodPath(food) },
  ];

  return (
    <div className="single-wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(trail)),
        }}
      />
      {food.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              faqJsonLd(food.faq.map((f) => ({ question: f.q, answer: f.a }))),
            ),
          }}
        />
      )}

      <article className="single-article">
        <div className="single-article__inner">
          <header className="entry-header">
            <nav className="crumbs" aria-label="이동 경로">
              <a target="_self" href="/">
                홈
              </a>
              <span aria-hidden>›</span>
              <a target="_self" href={`/${FOOD_HUB_SLUG}`}>
                음식
              </a>
              <span aria-hidden>›</span>
              <a target="_self" href={`/${animal?.slug ?? ""}`}>
                {animalName}
              </a>
            </nav>
            <h1 className="entry-title">
              <span aria-hidden>{food.emoji ?? "🍽️"}</span> {animalName}{" "}
              {food.name} 먹어도 되나요
            </h1>
            <div className="entry-header__bottom">
              <div className="entry-meta">
                <span>{animalName}</span>
                <span className="entry-meta__sep" aria-hidden />
                <span>음식 사전</span>
              </div>
              <SafetyBadge safety={food.safety} long />
            </div>
          </header>

          <div className={`verdict verdict--${food.safety}`}>
            <span className="verdict__mark" aria-hidden>
              {meta.emoji}
            </span>
            <div>
              <p className="verdict__head">{meta.label}</p>
              {food.one_liner && <p className="verdict__body">{food.one_liner}</p>}
            </div>
          </div>

          {food.aliases.length > 0 && (
            <div className="alias-row">
              {food.aliases.map((a) => (
                <span key={a}>{a}</span>
              ))}
            </div>
          )}

          <div className="ad-slot">
            <Adsense slotId={AD_SLOTS.top} format="fluid" />
          </div>

          <div className="entry-content">
            {food.summary && <p>{food.summary}</p>}

            {(food.benefits.length > 0 || food.risks.length > 0) && (
              <div className="pro-con">
                {food.benefits.length > 0 && (
                  <div className="pro-con__box pro-con__box--good">
                    <h3>좋은 점</h3>
                    <ul>
                      {food.benefits.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {food.risks.length > 0 && (
                  <div className="pro-con__box pro-con__box--bad">
                    <h3>위험한 점</h3>
                    <ul>
                      {food.risks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {food.symptoms.length > 0 && (
              <div className="symptom-box">
                <h3>이런 증상이 보이면 병원으로</h3>
                <ul>
                  {food.symptoms.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {food.serving_guide && (
              <>
                <h2>어떻게 줘야 하나</h2>
                <p>{food.serving_guide}</p>
              </>
            )}

            {food.body.map((block, i) => (
              <section key={i}>
                <h2>{block.h}</h2>
                {block.p.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </section>
            ))}

            {food.alternatives.length > 0 && (
              <>
                <h2>대신 줄 수 있는 것</h2>
                <ul>
                  {food.alternatives.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="ad-slot">
            <Adsense slotId={AD_SLOTS.middle} format="fluid" />
          </div>

          {food.faq.length > 0 && (
            <div className="faq">
              <h2 className="faq__title">자주 묻는 질문</h2>
              {food.faq.map((f, i) => (
                <div className="faq__item" key={i}>
                  <p className="faq__q">{f.q}</p>
                  <p className="faq__a">{f.a}</p>
                </div>
              ))}
            </div>
          )}

          <div className="notice">
            <strong>이건 참고이지 진단이 아닙니다.</strong> 같은 음식이라도
            몸무게·나이·지병에 따라 위험이 다릅니다. 이미 먹었고 증상이 보인다면
            기다리지 말고 동물병원에서 확인하세요. 얼마나 나올지 궁금하다면{" "}
            <a target="_self" href={`/${ITEM_HUB_SLUG}`}>
              진료비
            </a>
            를 먼저 보셔도 됩니다.
          </div>

          {related.length > 0 && (
            <div className="related">
              <h2 className="related__title">{animalName}의 다른 음식</h2>
              <div className="food-grid">
                {related.map((f) => (
                  <FoodCard key={f.id} food={f} />
                ))}
              </div>
            </div>
          )}

          <div className="related">
            <h2 className="related__title">병원에 가기 전에</h2>
            <div className="region-chips">
              {featuredItems()
                .slice(0, 5)
                .map((i) => (
                  <a target="_self" key={i.slug} href={`/${i.slug}`}>
                    {itemFullLabel(i)}
                  </a>
                ))}
            </div>
          </div>

          <div className="ad-slot">
            <Adsense slotId={AD_SLOTS.bottom} />
          </div>
        </div>
      </article>
    </div>
  );
}
