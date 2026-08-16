import { REGION_HUB_SLUG } from "./regions";
import { ITEM_HUB_SLUG } from "./fee-items";
import { FOOD_HUB_SLUG } from "./foods";

export interface MenuItem {
  name: string;
  href: string;
}

export const NAV: MenuItem[] = [
  { name: "홈", href: "/" },
  { name: "진료비", href: `/${ITEM_HUB_SLUG}` },
  { name: "지역별", href: `/${REGION_HUB_SLUG}` },
  { name: "음식", href: `/${FOOD_HUB_SLUG}` },
];

export const SITE_LINKS: MenuItem[] = [
  { name: "사이트 소개", href: "/about" },
  { name: "문의하기", href: "/contact" },
  { name: "개인정보처리방침", href: "/privacy" },
  { name: "이용약관", href: "/terms" },
];

/**
 * 공식 창구.
 *
 * 이 사이트가 보여주는 것은 시군구로 묶은 **집계값**이라 특정 병원의 값이
 * 아니다. 실제로 갈 병원의 값은 아래에서 확인하도록 넘긴다.
 */
export const OFFICIAL_LINKS = {
  /** 농림축산식품부 동물병원 진료비 조사·공개 시스템 (원본) */
  dataset: "https://animalclinicfee.or.kr",
  /** 농림축산식품부 */
  mafra: "https://www.mafra.go.kr",
  /** 동물보호관리시스템 — 동물등록·유실동물 */
  animal: "https://www.animal.go.kr",
} as const;
