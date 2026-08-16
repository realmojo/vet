import type { Metadata } from "next";
import { buildMetadata, SITE } from "@/lib/seo";
import { OFFICIAL_LINKS } from "@/lib/menu";
import { DATA_UPDATED, DATA_YEAR, ITEM_KINDS } from "@/lib/fee-data";
import { ITEM_HUB_SLUG, ITEMS } from "@/lib/fee-items";
import { SIDOS } from "@/lib/regions";
import { FOOD_HUB_SLUG } from "@/lib/foods";

export const metadata: Metadata = buildMetadata({
  path: "/about",
  title: `사이트 소개 | ${SITE.name}`,
  description:
    "동물병원비는 농림축산식품부가 공개한 진료비 조사 결과를 시군구별로 정리하고, 강아지·고양이가 먹어도 되는 음식을 함께 담은 사이트입니다. 자료의 기준 시점과 한계를 분명히 밝힙니다.",
});

export default function AboutPage() {
  return (
    <>
      <div className="page-head">
        <h1>
          <span aria-hidden>🐾</span>
          사이트 소개
        </h1>
        <p>
          &ldquo;이 접종 얼마예요?&rdquo;에 답이 하나가 아니라는 것부터 알아야
          합니다.
        </p>
      </div>

      <section className="panel">
        <h2 className="panel__title">무엇을 보여주나</h2>
        <p className="panel__desc">
          동물병원 진료에는 <strong>건강보험이 없습니다.</strong> 나라가 정한
          수가가 없으니 병원이 값을 스스로 매기고, 그래서 같은 예방접종인데도
          동네에 따라 두세 배씩 벌어집니다. 이 사이트는 농림축산식품부가 해마다
          조사해 공개하는 {DATA_YEAR}년 자료로{" "}
          <strong>항목마다 대체로 얼마인지</strong>, 그리고{" "}
          <strong>어느 동네가 비싸고 싼지</strong>를 정리합니다.
        </p>
        <p className="panel__desc" style={{ marginBottom: 0 }}>
          진료 항목은 {ITEMS.length}가지, 지역은 {SIDOS.length}개 시도 아래
          시군구 201곳입니다. 여기에{" "}
          <a target="_self" href={`/${FOOD_HUB_SLUG}`}>
            강아지·고양이가 먹어도 되는 음식
          </a>{" "}
          66가지를 함께 담았습니다.
        </p>
      </section>

      <section className="panel">
        <h2 className="panel__title">이 자료의 한계</h2>
        <p className="panel__desc">
          가장 오해하기 쉬운 부분이라 먼저 적습니다.{" "}
          <strong>여기 적힌 금액은 특정 동물병원의 가격이 아닙니다.</strong>
        </p>
        <ul className="panel__desc" style={{ paddingLeft: 18, marginBottom: 0 }}>
          <li>
            원본이 <strong>집계 통계</strong>입니다. 한 항목에 대해 그 시군구의
            최저·최고·평균·중간값 네 값만 있습니다. &ldquo;강남구 A동물병원
            엑스레이 얼마&rdquo;는 이 자료로 알 수 없습니다.
          </li>
          <li>
            그래서 화면에서 <strong>중간값을 앞세웁니다.</strong> 최저·최고는 한
            곳만 있어도 잡히는 값이라 예산을 잡는 기준이 되지 못합니다.
          </li>
          <li>
            <strong>게시 의무 {ITEM_KINDS}종만</strong> 조사 대상입니다.
            중성화·발치·수술처럼 값이 크게 나오는 진료는 여기에 없습니다.
          </li>
          <li>
            지역끼리 견줄 때는 금액이 아니라 <strong>가격지수</strong>를 씁니다.
            군 단위에는 MRI·CT 를 갖춘 병원이 없어 비싼 항목이 통째로 빠지는데,
            금액의 중간값을 그대로 쓰면 그런 동네가 저절로 싸 보이기 때문입니다.
          </li>
          <li>
            실제로 갈 병원의 금액은 <strong>전화로 물어보시는 것</strong>이 가장
            확실합니다. 2023년부터 동물병원은 주요 진료비를 병원 안에 게시할
            의무가 있습니다.
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2 className="panel__title">데이터 출처와 범위</h2>
        <p className="panel__desc">
          농림축산식품부{" "}
          <a
            href={OFFICIAL_LINKS.dataset}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline" }}
          >
            「동물병원 진료비 조사·공개 시스템」
          </a>
          이 공개한 값을 그대로 옮겼습니다. 원본에 없는 값을 추정해서 채우지
          않습니다.
        </p>
        <ul className="panel__desc" style={{ paddingLeft: 18, marginBottom: 0 }}>
          <li>제공 기관: 농림축산식품부</li>
          <li>
            범위: 게시 의무 {ITEM_KINDS}종 · 시군구 단위 최저·최고·평균·중간값
          </li>
          <li>
            기준: {DATA_YEAR}년 조사 · {DATA_UPDATED} 공개
          </li>
          <li>
            음식 정보는 자체적으로 정리한 것이며 수의학 문헌과 공개 자료를
            참고했습니다.
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2 className="panel__title">하지 않는 것</h2>
        <ul className="panel__desc" style={{ paddingLeft: 18, marginBottom: 0 }}>
          <li>
            <strong>동물병원을 추천하거나 순위를 매기지 않습니다.</strong> 값이
            싸다고 좋은 병원도, 비싸다고 나쁜 병원도 아닙니다.
          </li>
          <li>
            <strong>진단하지 않습니다.</strong> 음식 정보는 일반적인 안내일
            뿐입니다. 이상이 있으면 수의사에게 보여야 합니다.
          </li>
          <li>
            <strong>진료를 중개하지 않습니다.</strong>
          </li>
        </ul>
      </section>

      <div className="empty-box">
        <a
          target="_self"
          href={`/${ITEM_HUB_SLUG}`}
          style={{ textDecoration: "underline" }}
        >
          항목별 진료비 보러 가기
        </a>
      </div>
    </>
  );
}
