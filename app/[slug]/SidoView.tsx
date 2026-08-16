import {
  DATA_YEAR,
  THIN_ITEM_COUNT,
  formatWon,
  indexSign,
  indexText,
  listRegions,
} from "@/lib/fee-data";
import { ITEM_HUB_SLUG, featuredItems, itemFullLabel } from "@/lib/fee-items";
import { REGION_HUB_SLUG, SIDOS, type Sido } from "@/lib/regions";
import { breadcrumbJsonLd } from "@/lib/seo";
import StatTile from "@/components/fee/StatTile";
import DataNotice from "@/components/fee/DataNotice";
import Adsense from "@/components/Adsense";
import { AD_SLOTS } from "@/lib/ads";

export default async function SidoView({ sido }: { sido: Sido }) {
  const all = await listRegions();
  const rows = all
    .filter((r) => r.sido_slug === sido.slug)
    .sort((a, b) => (b.price_index ?? 0) - (a.price_index ?? 0));

  // 표본이 두꺼운 곳만 순위를 말한다. 항목이 8개뿐인 군을 1위로 올리면 거짓말이 된다.
  const solid = rows.filter((r) => r.item_count >= THIN_ITEM_COUNT);
  const priciest = solid[0] ?? null;
  const cheapest = solid[solid.length - 1] ?? null;

  const indices = solid
    .map((r) => r.price_index)
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);
  const median = indices.length
    ? indices[Math.floor((indices.length - 1) / 2)]
    : null;

  const others = SIDOS.filter((s) => s.slug !== sido.slug);

  const trail = [
    { name: "홈", path: "/" },
    { name: "지역", path: `/${REGION_HUB_SLUG}` },
    { name: sido.slug, path: `/${sido.slug}` },
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
        <span className="cat-badge cat-badge--region">지역별</span>
        <h1>{sido.name} 동물병원 진료비</h1>
        <p>
          {sido.name}의 시군구 {rows.length}곳을 가격 수준이 높은 순으로
          늘어놓았습니다. 100 이 전국 평균 수준이고, 숫자가 클수록 비쌉니다.
        </p>
      </div>

      <section className="stat-grid">
        <StatTile label="시군구" value={`${rows.length}곳`} />
        <StatTile
          label="가격 수준 중간"
          value={median !== null ? `${median}` : "-"}
          sub="전국 100 기준"
        />
        <StatTile
          label="가장 비싼 곳"
          value={priciest?.sigungu_name ?? "-"}
          sub={priciest?.price_index !== null && priciest ? `지수 ${priciest.price_index}` : undefined}
        />
        <StatTile
          label="가장 싼 곳"
          value={cheapest?.sigungu_name ?? "-"}
          sub={cheapest?.price_index !== null && cheapest ? `지수 ${cheapest.price_index}` : undefined}
        />
      </section>

      <div className="ad-slot">
        <Adsense slotId={AD_SLOTS.home} />
      </div>

      <section style={{ marginBottom: 24 }}>
        <div className="sec-head">
          <h2 className="sec-title">시군구별 가격 수준</h2>
        </div>
        <div className="panel">
          <p className="panel__desc">
            가격 수준은 <strong>항목마다 전국 중간값과 견준 비율</strong>의
            중간값입니다. 그냥 금액의 중간값을 쓰면 MRI·CT 병원이 없는 동네가
            저절로 싸 보이기 때문에 이렇게 계산합니다. 공개 항목이{" "}
            {THIN_ITEM_COUNT}개 미만인 곳은 표본이 얇다는 표시를 붙였습니다.
          </p>
          <div className="table-scroll">
            <table className="pr-table">
              <thead>
                <tr>
                  <th scope="col">시군구</th>
                  <th scope="col" className="is-num">
                    가격 수준
                  </th>
                  <th scope="col" className="is-num">
                    초진 진찰료
                  </th>
                  <th scope="col" className="is-num">
                    종합백신
                  </th>
                  <th scope="col" className="is-num">
                    항목
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.region_slug}>
                    <td>
                      <a
                        target="_self"
                        href={`/${r.region_slug}`}
                        className="pr-table__name pr-table__link"
                      >
                        {r.sigungu_name || r.sido_slug}
                      </a>
                      {r.item_count < THIN_ITEM_COUNT && (
                        <span className="pr-table__meta">표본 얇음</span>
                      )}
                    </td>
                    <td className="is-num">
                      {r.price_index !== null ? (
                        <span className={`rel rel--${indexSign(r.price_index)}`}>
                          {r.price_index}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="is-num">{formatWon(r.consult_mid)}</td>
                    <td className="is-num">{formatWon(r.vaccine_mid)}</td>
                    <td className="is-num">{r.item_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {priciest && cheapest && priciest.region_slug !== cheapest.region_slug && (
        <section className="panel">
          <h2 className="panel__title">
            같은 {sido.slug} 안에서도 이만큼 벌어집니다
          </h2>
          <p className="panel__desc" style={{ marginBottom: 0 }}>
            {priciest.sigungu_name}는 지수 {priciest.price_index}(
            {indexText(priciest.price_index)}), {cheapest.sigungu_name}는{" "}
            {cheapest.price_index}({indexText(cheapest.price_index)})입니다. 초진
            진찰료로 보면 {priciest.sigungu_name} {formatWon(priciest.consult_mid)},{" "}
            {cheapest.sigungu_name} {formatWon(cheapest.consult_mid)} 입니다.
            {DATA_YEAR}년 조사 기준입니다.
          </p>
        </section>
      )}

      <section style={{ marginBottom: 24 }}>
        <div className="sec-head">
          <h2 className="sec-title">항목으로 찾기</h2>
          <a target="_self" href={`/${ITEM_HUB_SLUG}`} className="sec-more">
            전체 항목 보기
          </a>
        </div>
        <div className="sido-block">
          <div className="region-chips">
            {featuredItems().map((i) => (
              <a target="_self" key={i.slug} href={`/${i.slug}`}>
                {itemFullLabel(i)}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <div className="sec-head">
          <h2 className="sec-title">다른 지역</h2>
          <a target="_self" href={`/${REGION_HUB_SLUG}`} className="sec-more">
            전체 지역 보기
          </a>
        </div>
        <div className="sido-block">
          <div className="region-chips">
            {others.map((s) => (
              <a target="_self" key={s.slug} href={`/${s.slug}`}>
                {s.slug}
              </a>
            ))}
          </div>
        </div>
      </section>

      <DataNotice />

      <div className="ad-slot">
        <Adsense slotId={AD_SLOTS.bottom} />
      </div>
    </>
  );
}
