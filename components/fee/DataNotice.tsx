import { DATA_CYCLE, DATA_UPDATED, DATA_YEAR, ITEM_KINDS } from "@/lib/fee-data";
import { OFFICIAL_LINKS } from "@/lib/menu";

/**
 * 진료비 화면 하단 공통 안내.
 *
 * 이 자료는 **집계 통계**다. 병원 하나하나의 가격이 아니라 시군구로 묶은
 * 값이다. 이걸 밝히지 않으면 "여기 나온 금액을 그 병원이 받는다"로 읽힌다.
 * 가장 오해하기 쉬운 지점이라 화면마다 반복해서 적는다.
 */
export default function DataNotice() {
  return (
    <div className="notice">
      <p style={{ margin: "0 0 8px" }}>
        <strong>이 금액을 어떻게 읽어야 하나</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        <li>
          농림축산식품부가 공개한 <strong>{DATA_YEAR}년 조사</strong> 결과를
          그대로 옮긴 것입니다. 조사는 {DATA_CYCLE} 이뤄지고 이번 결과는{" "}
          {DATA_UPDATED}에 공개됐습니다.
        </li>
        <li>
          <strong>동물병원 한 곳의 가격이 아닙니다.</strong> 시군구 단위로 묶어
          낸 최저·최고·평균·중간값입니다. 최저와 최고는 한 곳만 있어도 잡히는
          값이라{" "}
          <strong>중간값을 기준으로 보시는 편이 실제에 가깝습니다.</strong>
        </li>
        <li>
          게시가 의무인 <strong>{ITEM_KINDS}종</strong>만 조사 대상입니다.
          중성화·발치·수술처럼 값이 크게 나오는 진료는 의무 항목이 아니라 여기에
          없습니다.
        </li>
        <li>
          <strong>실제로 갈 병원의 값은 따로 확인하세요.</strong> 동물병원은
          진료비를 병원 안에 게시할 의무가 있고, 전화로 물어보는 것이 가장
          확실합니다. 원본은{" "}
          <a
            href={OFFICIAL_LINKS.dataset}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline" }}
          >
            동물병원 진료비 공개 시스템
          </a>
          에서 볼 수 있습니다.
        </li>
      </ul>
    </div>
  );
}
