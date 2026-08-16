import {
  DATA_YEAR,
  THIN_ITEM_COUNT,
  formatWon,
  indexSign,
  listRegions,
} from "@/lib/fee-data";
import { REGION_HUB_SLUG, SIDOS } from "@/lib/regions";
import { breadcrumbJsonLd } from "@/lib/seo";
import StatTile from "@/components/fee/StatTile";
import DataNotice from "@/components/fee/DataNotice";
import Adsense from "@/components/Adsense";
import { AD_SLOTS } from "@/lib/ads";

export default async function RegionHubView() {
  const all = await listRegions();

  const bySido = SIDOS.map((s) => ({
    sido: s,
    rows: all
      .filter((r) => r.sido_slug === s.slug)
      .sort((a, b) => a.sigungu_name.localeCompare(b.sigungu_name, "ko")),
  })).filter((g) => g.rows.length > 0);

  const solid = all.filter((r) => r.item_count >= THIN_ITEM_COUNT);
  const ranked = solid
    .filter((r) => r.price_index !== null)
    .sort((a, b) => (b.price_index ?? 0) - (a.price_index ?? 0));

  const trail = [
    { name: "홈", path: "/" },
    { name: "지역", path: `/${REGION_HUB_SLUG}` },
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
          <span aria-hidden>📍</span> 지역별 동물병원 진료비
        </h1>
        <p>
          전국 시군구 {all.length}곳의 동물병원 진료비입니다. 우리 동네를 눌러
          항목별 금액을 확인하거나, 아래에서 전국 순위를 먼저 보세요.
        </p>
      </div>

      <section className="stat-grid">
        <StatTile label="시군구" value={`${all.length}곳`} />
        <StatTile label="시도" value={`${bySido.length}개`} />
        <StatTile
          label="표본이 두꺼운 곳"
          value={`${solid.length}곳`}
          sub={`항목 ${THIN_ITEM_COUNT}개 이상`}
        />
        <StatTile label="기준" value={`${DATA_YEAR}년`} sub="해마다 조사" />
      </section>

      <div className="ad-slot">
        <Adsense slotId={AD_SLOTS.home} />
      </div>

      {ranked.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div className="sec-head">
            <h2 className="sec-title">진료비가 비싼 동네 · 싼 동네</h2>
          </div>
          <div className="panel">
            <p className="panel__desc">
              전국을 100 으로 놓은 가격 수준입니다. 공개 항목이{" "}
              {THIN_ITEM_COUNT}개 이상인 {solid.length}곳만 견줬습니다 — 항목이
              적은 곳은 비싼 진료가 통째로 빠져 있어 함께 줄 세우면 없는 차이가
              생깁니다.
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
                  {Array.from({ length: Math.min(8, Math.floor(ranked.length / 2)) }).map(
                    (_, i) => {
                      const hi = ranked[i];
                      const lo = ranked[ranked.length - 1 - i];
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
                            <a
                              target="_self"
                              href={`/${lo.region_slug}`}
                              className="pr-table__name pr-table__link"
                            >
                              {lo.sido_slug} {lo.sigungu_name}
                            </a>
                          </td>
                          <td className="is-num">
                            <span className={`rel rel--${indexSign(lo.price_index)}`}>
                              {lo.price_index}
                            </span>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="sec-head">
          <h2 className="sec-title">우리 동네 찾기</h2>
        </div>
        {bySido.map((g) => (
          <div className="sido-block" key={g.sido.slug}>
            <h3 className="sido-block__title">
              <a target="_self" href={`/${g.sido.slug}`}>
                {g.sido.name}
              </a>
              <span className="sido-block__count">{g.rows.length}곳</span>
            </h3>
            <div className="region-chips">
              {g.rows.map((r) => (
                <a
                  target="_self"
                  key={r.region_slug}
                  href={`/${r.region_slug}`}
                  data-empty={r.item_count === 0 ? "true" : undefined}
                  title={
                    r.consult_mid
                      ? `초진 진찰료 ${formatWon(r.consult_mid)}`
                      : undefined
                  }
                >
                  {r.sigungu_name || r.sido_slug}
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>

      <DataNotice />

      <div className="ad-slot">
        <Adsense slotId={AD_SLOTS.bottom} />
      </div>
    </>
  );
}
