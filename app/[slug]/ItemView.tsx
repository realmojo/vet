import {
  DATA_YEAR,
  formatWon,
  formatWonShort,
  listItemFees,
  priceRatio,
  ratioText,
  relative,
  relativeSign,
  regionsMap,
  withParticle,
  type ItemStats,
} from "@/lib/fee-data";
import {
  ITEM_HUB_SLUG,
  itemFullLabel,
  itemHeadline,
  siblingItems,
  type FeeItem,
} from "@/lib/fee-items";
import { REGION_HUB_SLUG, SIDOS } from "@/lib/regions";
import { breadcrumbJsonLd, datasetJsonLd } from "@/lib/seo";
import StatTile from "@/components/fee/StatTile";
import DataNotice from "@/components/fee/DataNotice";
import Adsense from "@/components/Adsense";
import { AD_SLOTS } from "@/lib/ads";

/** 표에 한 번에 늘어놓을 지역 수. 나머지는 시도 허브로 넘긴다 */
const TABLE_LIMIT = 60;

export default async function ItemView({
  item,
  stats,
}: {
  item: FeeItem;
  stats: ItemStats;
}) {
  const [rows, regions] = await Promise.all([listItemFees(item.slug), regionsMap()]);

  const priced = rows.filter((r) => r.mid_price !== null);
  const base = stats.national_mid ?? 0;
  const ratio = priceRatio(stats);
  const label = itemFullLabel(item);

  // 시도별로 접어 보여준다. 201개를 그냥 늘어놓으면 자기 동네를 찾을 수 없다.
  const bySido = SIDOS.map((s) => ({
    sido: s,
    rows: priced
      .filter((r) => r.sido_slug === s.slug)
      .sort((a, b) => (b.mid_price ?? 0) - (a.mid_price ?? 0)),
  })).filter((g) => g.rows.length > 0);

  const cheapest = stats.cheapest_region
    ? regions.get(stats.cheapest_region)
    : null;
  const priciest = stats.priciest_region
    ? regions.get(stats.priciest_region)
    : null;

  const top = priced.slice(0, TABLE_LIMIT);
  const siblings = siblingItems(item);

  const trail = [
    { name: "홈", path: "/" },
    { name: "진료비", path: `/${ITEM_HUB_SLUG}` },
    { name: label, path: `/${item.slug}` },
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
              name: `${label} 동물병원 진료비`,
              path: `/${item.slug}`,
              description: `전국 시군구 ${stats.region_count}곳의 ${label} 중간값·최저·최고 금액 (${DATA_YEAR}년 조사)`,
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
              <a target="_self" href={`/${ITEM_HUB_SLUG}`}>
                진료비
              </a>
              <span aria-hidden>›</span>
              <span>{item.group}</span>
            </nav>
            <h1 className="entry-title">{itemHeadline(item)}</h1>
            <div className="entry-header__bottom">
              <div className="entry-meta">
                <span>{item.group}</span>
                <span className="entry-meta__sep" aria-hidden />
                <span>{DATA_YEAR}년 조사</span>
                <span className="entry-meta__sep" aria-hidden />
                <span>시군구 {stats.region_count}곳</span>
              </div>
            </div>
          </header>

          <p className="entry-lead">{item.note}</p>

          <div className="ad-slot">
            <Adsense slotId={AD_SLOTS.top} format="fluid" />
          </div>

          <section className="stat-grid" style={{ marginTop: 24 }}>
            <StatTile
              label="전국 중간값"
              value={formatWon(stats.national_mid)}
              sub="시군구 중간값들의 중간값"
            />
            <StatTile
              label="가장 싼 지역"
              value={formatWonShort(stats.cheapest_mid)}
              sub={cheapest ? `${cheapest.sido_slug} ${cheapest.sigungu_name}` : "-"}
            />
            <StatTile
              label="가장 비싼 지역"
              value={formatWonShort(stats.priciest_mid)}
              sub={priciest ? `${priciest.sido_slug} ${priciest.sigungu_name}` : "-"}
            />
            <StatTile
              label="최저~최고 차이"
              value={ratioText(ratio)}
              sub={`${formatWonShort(stats.min_price)} ~ ${formatWonShort(stats.max_price)}`}
            />
          </section>

          <div className="entry-content">
            <h2>{label} 얼마쯤 나오나</h2>
            <p>
              전국 시군구 {stats.region_count}곳을 모으면 {withParticle(label, "이가")}{" "}
              중간값 <strong>{formatWon(stats.national_mid)}</strong> 입니다. 가장
              싼 지역은{" "}
              {cheapest ? (
                <a target="_self" href={`/${cheapest.region_slug}`}>
                  {cheapest.sido_slug} {cheapest.sigungu_name}
                </a>
              ) : (
                "-"
              )}{" "}
              {formatWon(stats.cheapest_mid)}, 가장 비싼 지역은{" "}
              {priciest ? (
                <a target="_self" href={`/${priciest.region_slug}`}>
                  {priciest.sido_slug} {priciest.sigungu_name}
                </a>
              ) : (
                "-"
              )}{" "}
              {formatWon(stats.priciest_mid)} 입니다.
            </p>
            {ratio && (
              <p>
                개별 병원까지 내려가면 최저 {formatWon(stats.min_price)} 부터 최고{" "}
                {formatWon(stats.max_price)} 까지 <strong>{ratioText(ratio)}</strong>{" "}
                벌어집니다. 다만 양 끝은 한 곳만 있어도 잡히는 값이라, 실제로
                내게 될 금액은 중간값 쪽에 가깝습니다.
              </p>
            )}
          </div>

          <div className="ad-slot">
            <Adsense slotId={AD_SLOTS.middle} format="fluid" />
          </div>

          <div className="entry-content">
            <h2>지역별 {label}</h2>
            <p>
              중간값이 높은 순입니다. 전국 중간값({formatWon(base)}) 대비 몇 퍼센트인지
              함께 적었습니다.
            </p>
          </div>

          <div className="panel">
            <div className="table-scroll">
              <table className="pr-table">
                <thead>
                  <tr>
                    <th scope="col">지역</th>
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
                  {top.map((r) => (
                    <tr key={r.region_slug}>
                      <td>
                        <a
                          target="_self"
                          href={`/${r.region_slug}`}
                          className="pr-table__name pr-table__link"
                        >
                          {r.sigungu_name || r.sido_slug}
                        </a>
                        <span className="pr-table__meta">{r.sido_slug}</span>
                      </td>
                      <td className="is-num">
                        <strong>{formatWon(r.mid_price)}</strong>
                      </td>
                      <td className="is-num">
                        {formatWonShort(r.min_price)} ~ {formatWonShort(r.max_price)}
                      </td>
                      <td className="is-num">
                        {base && r.mid_price !== null ? (
                          <span
                            className={`rel rel--${relativeSign(r.mid_price, base)}`}
                          >
                            {relative(r.mid_price, base)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {priced.length > TABLE_LIMIT && (
              <p
                className="panel__desc"
                style={{ marginTop: 14, marginBottom: 0 }}
              >
                중간값이 높은 {TABLE_LIMIT}곳만 실었습니다. 나머지{" "}
                {priced.length - TABLE_LIMIT}곳은{" "}
                <a target="_self" href={`/${REGION_HUB_SLUG}`}>
                  지역별 화면
                </a>
                에서 동네를 골라 보세요.
              </p>
            )}
          </div>

          {bySido.length > 0 && (
            <div className="panel">
              <h2 className="panel__title">시도로 찾기</h2>
              <p className="panel__desc">
                자기 동네가 위 표에 없으면 시도를 눌러 들어가세요.
              </p>
              <div className="region-chips">
                {bySido.map((g) => (
                  <a target="_self" key={g.sido.slug} href={`/${g.sido.slug}`}>
                    {g.sido.slug}
                    <span style={{ color: "var(--c-text-sub)", fontWeight: 500 }}>
                      {g.rows.length}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {siblings.length > 0 && (
            <div className="related">
              <h2 className="related__title">같은 묶음의 다른 진료</h2>
              <div className="region-chips">
                {siblings.map((s) => (
                  <a target="_self" key={s.slug} href={`/${s.slug}`}>
                    {itemFullLabel(s)}
                  </a>
                ))}
              </div>
            </div>
          )}

          <DataNotice />

          <div className="ad-slot">
            <Adsense slotId={AD_SLOTS.bottom} />
          </div>
        </div>
      </article>
    </div>
  );
}
