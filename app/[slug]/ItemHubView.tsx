import {
  DATA_YEAR,
  ITEM_KINDS,
  formatWon,
  formatWonShort,
  itemStatsMap,
  priceRatio,
  ratioText,
} from "@/lib/fee-data";
import { ITEM_HUB_SLUG, ITEMS, groupItems, itemFullLabel } from "@/lib/fee-items";
import { REGION_HUB_SLUG } from "@/lib/regions";
import { breadcrumbJsonLd } from "@/lib/seo";
import StatTile from "@/components/fee/StatTile";
import DataNotice from "@/components/fee/DataNotice";
import Adsense from "@/components/Adsense";
import { AD_SLOTS } from "@/lib/ads";

export default async function ItemHubView() {
  const stats = await itemStatsMap();
  const groups = groupItems();

  const widest = ITEMS.map((i) => ({ item: i, s: stats.get(i.slug) }))
    .filter((x) => x.s && x.s.region_count >= 100)
    .map((x) => ({ ...x, ratio: priceRatio(x.s!) }))
    .filter((x) => x.ratio !== null)
    .sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0))
    .slice(0, 6);

  const trail = [
    { name: "홈", path: "/" },
    { name: "진료비", path: `/${ITEM_HUB_SLUG}` },
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
          <span aria-hidden>🩺</span> 동물병원 진료비 항목별
        </h1>
        <p>
          동물병원이 게시할 의무가 있는 {ITEM_KINDS}종을 개체·체중별로 펼치면{" "}
          {ITEMS.length}가지가 됩니다. 아래 금액은 전국 시군구 중간값들의
          중간값입니다.
        </p>
      </div>

      <section className="stat-grid">
        <StatTile label="진료 항목" value={`${ITEMS.length}가지`} sub={`의무 게시 ${ITEM_KINDS}종`} />
        <StatTile label="묶음" value={`${groups.length}개`} />
        <StatTile label="기준" value={`${DATA_YEAR}년`} sub="해마다 조사" />
        <StatTile label="지역" value="시군구 201곳" />
      </section>

      <div className="ad-slot">
        <Adsense slotId={AD_SLOTS.home} />
      </div>

      {widest.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div className="sec-head">
            <h2 className="sec-title">지역 차이가 가장 큰 진료</h2>
          </div>
          <div className="panel">
            <p className="panel__desc">
              집계된 최저와 최고가 몇 배 벌어지는지입니다. 이런 항목일수록 진료
              전에 값을 물어보는 편이 낫습니다.
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
                          {item.label}
                        </a>
                        <span className="pr-table__meta">
                          {item.variant || item.group}
                        </span>
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

      {groups.map((g) => (
        <section key={g.group} style={{ marginBottom: 28 }}>
          <div className="sec-head">
            <h2 className="sec-title">{g.group}</h2>
          </div>
          <div className="panel">
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
                    <th scope="col" className="is-num">
                      지역
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {g.items.map((i) => {
                    const s = stats.get(i.slug);
                    return (
                      <tr key={i.slug}>
                        <td>
                          <a
                            target="_self"
                            href={`/${i.slug}`}
                            className="pr-table__name pr-table__link"
                          >
                            {itemFullLabel(i)}
                          </a>
                        </td>
                        <td className="is-num">
                          <strong>{formatWon(s?.national_mid)}</strong>
                        </td>
                        <td className="is-num">
                          {formatWonShort(s?.min_price)} ~{" "}
                          {formatWonShort(s?.max_price)}
                        </td>
                        <td className="is-num">{s?.region_count ?? 0}곳</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ))}

      <section className="panel">
        <h2 className="panel__title">여기 없는 진료는 왜 없나</h2>
        <p className="panel__desc">
          <strong>중성화·발치·수술은 게시 의무 항목이 아닙니다.</strong> 정부가
          공개하도록 정한 것은 진찰료·입원비·예방접종·검사·구충 등{" "}
          {ITEM_KINDS}종이라, 값이 크게 나오는 수술 계열은 이 조사에 들어 있지
          않습니다.
        </p>
        <p className="panel__desc" style={{ marginBottom: 0 }}>
          다만 동물병원은 <strong>병원 안에 진료비를 게시할 의무</strong>가
          있습니다. 수술 예정이라면 전화로 총액을 물어보시는 편이 확실합니다.
        </p>
      </section>

      <section style={{ margin: "28px 0" }}>
        <div className="sec-head">
          <h2 className="sec-title">우리 동네로 보기</h2>
          <a target="_self" href={`/${REGION_HUB_SLUG}`} className="sec-more">
            지역별 보기
          </a>
        </div>
      </section>

      <DataNotice />

      <div className="ad-slot">
        <Adsense slotId={AD_SLOTS.bottom} />
      </div>
    </>
  );
}
