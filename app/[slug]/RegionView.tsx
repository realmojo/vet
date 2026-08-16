import {
  DATA_YEAR,
  THIN_ITEM_COUNT,
  formatWon,
  formatWonShort,
  indexText,
  itemStatsMap,
  listRegionFees,
  relative,
  relativeSign,
  type RegionStats,
} from "@/lib/fee-data";
import {
  GROUPS,
  ITEM_HUB_SLUG,
  itemBySlug,
} from "@/lib/fee-items";
import { REGION_HUB_SLUG, regionLabel } from "@/lib/regions";
import { ANIMALS } from "@/lib/foods";
import { breadcrumbJsonLd, datasetJsonLd } from "@/lib/seo";
import StatTile from "@/components/fee/StatTile";
import DataNotice from "@/components/fee/DataNotice";
import Adsense from "@/components/Adsense";
import { AD_SLOTS } from "@/lib/ads";

export default async function RegionView({ region }: { region: RegionStats }) {
  const [rows, stats] = await Promise.all([
    listRegionFees(region.region_slug),
    itemStatsMap(),
  ]);

  const name = regionLabel(region.sido_slug, region.sigungu_name);

  // 묶음 순서대로. 값이 없는 항목은 아예 빼서 "-" 만 늘어놓지 않는다.
  const grouped = GROUPS.map((group) => ({
    group,
    rows: rows
      .filter((r) => r.mid_price !== null && itemBySlug(r.item_slug)?.group === group)
      .sort((a, b) => (b.mid_price ?? 0) - (a.mid_price ?? 0)),
  })).filter((g) => g.rows.length > 0);

  const thin = region.item_count < THIN_ITEM_COUNT;

  const trail = [
    { name: "홈", path: "/" },
    { name: "지역", path: `/${REGION_HUB_SLUG}` },
    { name: name, path: `/${region.region_slug}` },
  ];

  return (
    <div className="single-wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(trail)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            datasetJsonLd({
              name: `${name} 동물병원 진료비`,
              path: `/${region.region_slug}`,
              description: `${name}의 동물병원 진료비 ${region.item_count}개 항목 중간값 (${DATA_YEAR}년 조사)`,
            }),
          ),
        }}
      />

      <article className="single-article">
        <div className="single-article__inner">
          <header className="entry-header">
            <nav className="crumbs" aria-label="이동 경로">
              <a target="_self" href="/">
                홈
              </a>
              <span aria-hidden>›</span>
              <a target="_self" href={`/${REGION_HUB_SLUG}`}>
                지역
              </a>
              <span aria-hidden>›</span>
              <a target="_self" href={`/${region.sido_slug}`}>
                {region.sido_slug}
              </a>
            </nav>
            <h1 className="entry-title">{name} 동물병원 진료비</h1>
            <div className="entry-header__bottom">
              <div className="entry-meta">
                <span>{DATA_YEAR}년 조사</span>
                <span className="entry-meta__sep" aria-hidden />
                <span>항목 {region.item_count}개</span>
              </div>
            </div>
          </header>

          <p className="entry-lead">
            {name}에서 공개된 동물병원 진료비입니다. 병원 한 곳의 값이 아니라{" "}
            {name} 안의 병원들을 모아 낸 중간값입니다.
          </p>

          <div className="ad-slot">
            <Adsense slotId={AD_SLOTS.top} format="fluid" />
          </div>

          <section className="stat-grid" style={{ marginTop: 24 }}>
            <StatTile
              label="가격 수준"
              value={region.price_index !== null ? `${region.price_index}` : "-"}
              sub={`전국 100 기준 · ${indexText(region.price_index)}`}
            />
            <StatTile
              label="초진 진찰료"
              value={formatWon(region.consult_mid)}
              sub="개 5kg 기준"
            />
            <StatTile
              label="종합백신"
              value={formatWon(region.vaccine_mid)}
              sub="개 1회 접종"
            />
            <StatTile
              label="공개 항목"
              value={`${region.item_count}개`}
              sub="전체 35개 중"
            />
          </section>

          {thin && (
            <div className="notice notice--muted">
              <strong>이 지역은 공개된 항목이 {region.item_count}개뿐입니다.</strong>{" "}
              조사 대상 병원이 적어서 그렇습니다. 항목이 적으면 위의 가격 수준도
              표본이 얇아 흔들립니다. 이웃 시군구도 함께 보시는 편이 좋습니다.
            </div>
          )}

          <div className="entry-content">
            <h2>{name}는 비싼 편인가</h2>
            <p>
              {region.price_index !== null ? (
                <>
                  {name}의 가격 수준은 전국을 100 으로 놓았을 때{" "}
                  <strong>{region.price_index}</strong> 입니다.{" "}
                  {indexText(region.price_index)}이라는 뜻입니다.
                </>
              ) : (
                <>{name}은 공개된 값이 적어 가격 수준을 계산하지 못했습니다.</>
              )}
            </p>
            <p>
              이 숫자는 <strong>항목마다 전국 중간값과 1:1 로 견준 비율</strong>의
              중간값입니다. 단순히 이 지역 금액의 중간값을 쓰면, MRI·CT 를 갖춘
              병원이 없는 동네가 저절로 싸 보입니다. 비싼 항목이 통째로 빠지기
              때문입니다.
            </p>
          </div>

          <div className="ad-slot">
            <Adsense slotId={AD_SLOTS.middle} format="fluid" />
          </div>

          {grouped.map((g) => (
            <div className="panel" key={g.group}>
              <h2 className="panel__title">{g.group}</h2>
              <p className="panel__desc">
                {name}의 중간값과, 전국 중간값 대비 얼마나 높고 낮은지입니다.
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
                        최저~최고
                      </th>
                      <th scope="col" className="is-num">
                        전국 대비
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((r) => {
                      const item = itemBySlug(r.item_slug);
                      const nation = stats.get(r.item_slug)?.national_mid ?? 0;
                      return (
                        <tr key={r.item_slug}>
                          <td>
                            <a
                              target="_self"
                              href={`/${r.item_slug}`}
                              className="pr-table__name pr-table__link"
                            >
                              {item ? item.label : r.item_slug}
                            </a>
                            {item?.variant && (
                              <span className="pr-table__meta">{item.variant}</span>
                            )}
                          </td>
                          <td className="is-num">
                            <strong>{formatWon(r.mid_price)}</strong>
                          </td>
                          <td className="is-num">
                            {formatWonShort(r.min_price)} ~{" "}
                            {formatWonShort(r.max_price)}
                          </td>
                          <td className="is-num">
                            {nation && r.mid_price !== null ? (
                              <span
                                className={`rel rel--${relativeSign(r.mid_price, nation)}`}
                              >
                                {relative(r.mid_price, nation)}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {grouped.length === 0 && (
            <div className="empty-box">
              이 지역은 아직 공개된 진료비가 없습니다.
              <br />
              <a target="_self" href={`/${region.sido_slug}`}>
                {region.sido_slug}의 다른 시군구
              </a>
              를 보세요.
            </div>
          )}

          <div className="related">
            <h2 className="related__title">이런 것도 궁금하실 겁니다</h2>
            <div className="region-chips">
              <a target="_self" href={`/${region.sido_slug}`}>
                {region.sido_slug} 전체 시군구 비교
              </a>
              <a target="_self" href={`/${ITEM_HUB_SLUG}`}>
                진료 항목 전체 보기
              </a>
              {ANIMALS.map((a) => (
                <a target="_self" key={a.slug} href={`/${a.slug}`}>
                  {a.emoji} {a.subject} 먹어도 되는 음식
                </a>
              ))}
            </div>
          </div>

          <DataNotice />

          <div className="ad-slot">
            <Adsense slotId={AD_SLOTS.bottom} />
          </div>
        </div>
      </article>
    </div>
  );
}
