import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ITEM_HUB_SLUG,
  ITEMS,
  itemBySlug,
  itemFullLabel,
  itemHeadline,
  type FeeItem,
} from "@/lib/fee-items";
import {
  REGION_HUB_SLUG,
  SIDOS,
  regionLabel,
  sidoBySlug,
  type Sido,
} from "@/lib/regions";
import {
  ANIMALS,
  FOOD_HUB_SLUG,
  SAFETY_META,
  animalBySlug,
  animalByKey,
  findFoodBySlug,
  type Food,
} from "@/lib/foods";
import {
  DATA_YEAR,
  ITEM_KINDS,
  formatWon,
  getItemStats,
  getRegion,
  indexText,
  type ItemStats,
  type RegionStats,
} from "@/lib/fee-data";
import { buildMetadata, SITE } from "@/lib/seo";
import { decodeSlug } from "@/lib/slug";
import ItemHubView from "./ItemHubView";
import ItemView from "./ItemView";
import RegionHubView from "./RegionHubView";
import SidoView from "./SidoView";
import RegionView from "./RegionView";
import FoodHubView from "./FoodHubView";
import AnimalView from "./AnimalView";
import FoodView from "./FoodView";

/**
 * 한 라우트가 여덟 화면을 맡는다.
 *
 *   /진료비            → 항목 허브
 *   /지역              → 지역 허브
 *   /음식              → 음식 허브
 *   /강아지 /고양이     → 동물별 음식 목록
 *   /초진-진찰료-5kg    → 항목 상세  (lib/fee-items.ts)
 *   /서울              → 시도 상세  (lib/regions.ts)
 *   /서울-강남구        → 시군구 상세 (vet_regions.region_slug)
 *   /강아지-초콜릿      → 음식 상세  (vet_foods)
 *
 * **찾는 순서가 중요하다.** 고정 슬러그(허브·동물·시도)를 먼저 찾고, 그 다음이
 * 코드에 박힌 항목 슬러그, 마지막이 DB 에서 오는 지역·음식이다. 순서를 뒤집으면
 * DB 값이 고정 화면을 가릴 수 있다.
 *
 * 슬러그 공간이 겹치지 않는 것도 확인해 두었다 — 음식은 `강아지-`·`고양이-`
 * 로 시작하고, 지역은 시도 짧은 이름(`서울-`, `경기-` …)으로 시작한다.
 * 항목 슬러그에는 그 접두사가 없다.
 */
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

/** 슬러그 하나가 무엇인지 한 번에 가른다. 메타데이터와 본문이 같은 판단을 쓴다. */
type Resolved =
  | { kind: "item-hub" }
  | { kind: "region-hub" }
  | { kind: "food-hub" }
  | { kind: "animal"; animal: (typeof ANIMALS)[number] }
  | { kind: "item"; item: FeeItem; stats: ItemStats }
  | { kind: "sido"; sido: Sido }
  | { kind: "region"; region: RegionStats }
  | { kind: "food"; food: Food }
  | { kind: "none" };

async function resolve(slug: string): Promise<Resolved> {
  if (slug === ITEM_HUB_SLUG) return { kind: "item-hub" };
  if (slug === REGION_HUB_SLUG) return { kind: "region-hub" };
  if (slug === FOOD_HUB_SLUG) return { kind: "food-hub" };

  const animal = animalBySlug(slug);
  if (animal) return { kind: "animal", animal };

  const sido = sidoBySlug(slug);
  if (sido) {
    // 세종은 시군구가 없다. 시도 슬러그와 지역 슬러그가 똑같이 `세종` 이라
    // 시도 화면을 먼저 잡으면 진료비 상세를 볼 길이 사라진다. 그럴 때는
    // 시군구 목록 대신 지역 상세를 바로 보여준다.
    const self = await getRegion(slug);
    if (self) return { kind: "region", region: self };
    return { kind: "sido", sido };
  }

  const item = itemBySlug(slug);
  if (item) {
    const stats = await getItemStats(slug);
    // 집계가 아직 없으면(적재 전) 화면을 그려도 빈 표만 나온다
    if (stats) return { kind: "item", item, stats };
  }

  const food = await findFoodBySlug(slug);
  if (food) return { kind: "food", food };

  const region = await getRegion(slug);
  if (region) return { kind: "region", region };

  return { kind: "none" };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeSlug((await params).slug);
  const found = await resolve(slug);

  switch (found.kind) {
    case "item-hub":
      return buildMetadata({
        path: `/${ITEM_HUB_SLUG}`,
        title: `동물병원 진료비 항목별 금액 — ${DATA_YEAR}년 조사 | ${SITE.name}`,
        description: `예방접종·진찰료·엑스레이·초음파·구충까지, 동물병원이 게시할 의무가 있는 ${ITEM_KINDS}종의 전국 중간값과 최저·최고 금액을 정리했습니다.`,
        keywords: [
          "동물병원 진료비",
          "강아지 예방접종 비용",
          "고양이 병원비",
          "동물병원 엑스레이 비용",
          "종합백신 가격",
        ],
      });

    case "region-hub":
      return buildMetadata({
        path: `/${REGION_HUB_SLUG}`,
        title: `지역별 동물병원 진료비 — 시군구 201곳 비교 | ${SITE.name}`,
        description:
          "우리 동네 동물병원은 비싼 편일까. 전국 시군구 201곳의 진료비를 전국 평균과 견줘 정리했습니다.",
        keywords: ["지역별 동물병원비", "우리동네 동물병원 진료비", "동물병원 가격 비교"],
      });

    case "food-hub":
      return buildMetadata({
        path: `/${FOOD_HUB_SLUG}`,
        title: `강아지·고양이가 먹어도 되는 음식 | ${SITE.name}`,
        description:
          "초콜릿·포도·양파처럼 위험한 것부터 사과·수박처럼 줘도 되는 것까지, 신호등으로 갈라 정리했습니다.",
        keywords: [
          "강아지가 먹으면 안되는 음식",
          "고양이 먹어도 되는 음식",
          "강아지 초콜릿",
          "고양이 포도",
        ],
      });

    case "animal": {
      const { animal } = found;
      return buildMetadata({
        path: `/${animal.slug}`,
        title: `${animal.subject} 먹어도 되는 음식 총정리 | ${SITE.name}`,
        description: `${animal.name}에게 줘도 되는 음식과 절대 주면 안 되는 음식을 신호등으로 갈라 정리했습니다. 증상과 대처법도 함께 담았습니다.`,
        keywords: [
          `${animal.name} 먹어도 되는 음식`,
          `${animal.name}가 먹으면 안되는 음식`,
          `${animal.name} 사료 외 간식`,
        ],
      });
    }

    case "item": {
      const { item, stats } = found;
      const label = itemFullLabel(item);
      return buildMetadata({
        path: `/${item.slug}`,
        title: `${itemHeadline(item)} — 전국 중간값 ${formatWon(stats.national_mid)} | ${SITE.name}`,
        description: `${label}는 ${DATA_YEAR}년 조사 기준 전국 중간값 ${formatWon(stats.national_mid)}, 시군구 ${stats.region_count}곳에서 ${formatWon(stats.min_price)}~${formatWon(stats.max_price)} 범위입니다. 지역별 금액을 함께 정리했습니다.`,
        keywords: [
          label,
          `${item.label} 비용`,
          `${item.label} 가격`,
          "동물병원 진료비",
          item.group,
        ],
        type: "article",
      });
    }

    case "sido": {
      const { sido } = found;
      return buildMetadata({
        path: `/${sido.slug}`,
        title: `${sido.name} 동물병원 진료비 — 시군구별 비교 (${DATA_YEAR}년) | ${SITE.name}`,
        description: `${sido.name}의 시군구별 동물병원 진료비를 비교했습니다. 어느 동네가 비싸고 싼지, 초진 진찰료와 종합백신 값으로 확인하세요.`,
        keywords: [
          `${sido.slug} 동물병원 진료비`,
          `${sido.slug} 강아지 예방접종`,
          `${sido.name} 동물병원비`,
        ],
      });
    }

    case "region": {
      const { region } = found;
      const name = regionLabel(region.sido_slug, region.sigungu_name);
      return buildMetadata({
        path: `/${region.region_slug}`,
        title: `${name} 동물병원 진료비 — 초진 ${formatWon(region.consult_mid)} | ${SITE.name}`,
        description: `${name}의 동물병원 진료비 ${region.item_count}개 항목을 정리했습니다. 가격 수준은 전국 100 기준 ${region.price_index ?? "-"}(${indexText(region.price_index)})입니다.`,
        keywords: [
          `${name} 동물병원`,
          `${name} 동물병원 진료비`,
          `${region.sigungu_name} 강아지 예방접종 비용`,
        ],
      });
    }

    case "food": {
      const { food } = found;
      const animal = animalByKey(food.animal);
      const animalName = animal?.name ?? "반려동물";
      const meta = SAFETY_META[food.safety];
      return buildMetadata({
        path: `/${animal?.slug}-${food.slug}`,
        title: `${animalName} ${food.name} 먹어도 되나요 — ${meta.label} | ${SITE.name}`,
        description:
          food.one_liner ??
          `${animalName}에게 ${food.name}을 줘도 되는지, 위험은 무엇이고 얼마나 줘도 되는지 정리했습니다.`,
        keywords: [
          `${animalName} ${food.name}`,
          `${animalName} ${food.name} 먹어도 되나요`,
          ...food.aliases.map((a) => `${animalName} ${a}`),
        ],
        type: "article",
      });
    }

    default:
      return {};
  }
}

export default async function SlugPage({ params }: Props) {
  const slug = decodeSlug((await params).slug);
  const found = await resolve(slug);

  switch (found.kind) {
    case "item-hub":
      return <ItemHubView />;
    case "region-hub":
      return <RegionHubView />;
    case "food-hub":
      return <FoodHubView />;
    case "animal":
      return <AnimalView animal={found.animal} />;
    case "item":
      return <ItemView item={found.item} stats={found.stats} />;
    case "sido":
      return <SidoView sido={found.sido} />;
    case "region":
      return <RegionView region={found.region} />;
    case "food":
      return <FoodView food={found.food} />;
    default:
      notFound();
  }
}

/** 코드에 박혀 있어 DB 없이도 아는 경로만 미리 만든다 */
export function generateStaticParams(): { slug: string }[] {
  return [
    { slug: ITEM_HUB_SLUG },
    { slug: REGION_HUB_SLUG },
    { slug: FOOD_HUB_SLUG },
    ...ANIMALS.map((a) => ({ slug: a.slug })),
    ...SIDOS.map((s) => ({ slug: s.slug })),
    ...ITEMS.map((i) => ({ slug: i.slug })),
  ];
}
