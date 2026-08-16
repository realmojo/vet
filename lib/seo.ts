import type { Metadata } from "next";

export const SITE = {
  name: "동물병원비",
  nameEn: "Vet Fee",
  url: "https://vet.keywordegg.com",
  locale: "ko_KR",
  ogImage: "/opengraph-image",
  description:
    "종합백신 2만 5천원, 그런데 우리 동네는 얼마일까. 농림축산식품부가 공개한 동물병원 진료비를 시군구별로 정리하고, 강아지·고양이가 먹어도 되는 음식을 함께 담았습니다.",
} as const;

export function absoluteUrl(path: string): string {
  if (!path || path === "/") return SITE.url;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.url}${p.split("/").map(encodeURIComponent).join("/")}`;
}

export interface BuildMetadataInput {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  type?: "website" | "article";
  image?: string;
}

export function buildMetadata({
  path,
  title,
  description,
  keywords,
  type = "website",
  image,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const socialImage = image ?? SITE.ogImage;
  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type,
      images: [
        { url: socialImage, width: 1200, height: 630, alt: `${SITE.name} - ${title}` },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function breadcrumbJsonLd(trail: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "ko-KR",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}

/**
 * 진료비 화면은 공개 자료를 집계한 것이라 Article 이 아니라 Dataset 으로 적는다.
 * 사람이 쓴 글이 아닌데 Article 로 표기하면 실제와 어긋난다.
 */
export function datasetJsonLd({
  name,
  path,
  description,
}: {
  name: string;
  path: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "ko-KR",
    creator: { "@type": "Organization", name: "농림축산식품부" },
    isBasedOn: "https://animalclinicfee.or.kr",
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
}
