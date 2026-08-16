import { SITE_LINKS, OFFICIAL_LINKS } from "@/lib/menu";
import { REGION_HUB_SLUG, SIDOS } from "@/lib/regions";
import { ITEM_HUB_SLUG, featuredItems, itemFullLabel } from "@/lib/fee-items";
import { ANIMALS, FOOD_HUB_SLUG } from "@/lib/foods";
import { DATA_YEAR } from "@/lib/fee-data";

export default function SiteFooter() {
  const featured = featuredItems().slice(0, 4);

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <div className="site-footer__logo">
              <span aria-hidden>🐾</span> 동물병원비
            </div>
            <p className="site-footer__desc">
              동물병원 진료비를 시군구별로 정리하고, 강아지·고양이가 먹어도 되는
              음식을 함께 담았습니다. 같은 진료도 어느 동네에서 받느냐에 따라
              값이 갈립니다.
            </p>
          </div>

          <div className="site-footer__col">
            <h3>진료비</h3>
            <ul>
              <li>
                <a target="_self" href={`/${ITEM_HUB_SLUG}`}>
                  전체 항목 보기
                </a>
              </li>
              {featured.map((i) => (
                <li key={i.slug}>
                  <a target="_self" href={`/${i.slug}`}>
                    {itemFullLabel(i)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__col">
            <h3>지역별</h3>
            <ul>
              <li>
                <a target="_self" href={`/${REGION_HUB_SLUG}`}>
                  전체 지역 보기
                </a>
              </li>
              {SIDOS.slice(0, 4).map((s) => (
                <li key={s.slug}>
                  <a target="_self" href={`/${s.slug}`}>
                    {s.slug}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__col">
            <h3>음식 사전</h3>
            <ul>
              <li>
                <a target="_self" href={`/${FOOD_HUB_SLUG}`}>
                  전체 음식 보기
                </a>
              </li>
              {ANIMALS.map((a) => (
                <li key={a.slug}>
                  <a target="_self" href={`/${a.slug}`}>
                    {a.subject} 먹어도 되는 것
                  </a>
                </li>
              ))}
              <li>
                <a target="_self" href="/강아지-초콜릿">
                  강아지 초콜릿
                </a>
              </li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h3>사이트</h3>
            <ul>
              {SITE_LINKS.map((item) => (
                <li key={item.href}>
                  <a target="_self" href={item.href}>
                    {item.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={OFFICIAL_LINKS.dataset}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  데이터 원본
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {new Date().getFullYear()} 동물병원비. All rights reserved.</p>
          <p className="site-footer__note">
            여기 적힌 금액은 농림축산식품부가 공개한{" "}
            <strong>{DATA_YEAR}년 조사</strong> 집계값입니다. 시군구로 묶은
            값이라 특정 동물병원의 가격이 아닙니다. 음식 정보도 일반적인 안내일
            뿐 진단이 아니므로, 이상이 있으면 수의사에게 보이시기 바랍니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
