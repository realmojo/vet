import type { Metadata } from "next";
import "./globals.css";
import { SITE, buildMetadata } from "@/lib/seo";
import { AD_CLIENT } from "@/lib/ads";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

const title = "동물병원비 — 우리 동네 진료비와 먹어도 되는 음식";
const description =
  "종합백신 2만 5천원, 초진 진찰료 9천 5백원. 농림축산식품부가 공개한 동물병원 진료비를 시군구 201곳으로 정리하고, 강아지·고양이가 먹어도 되는 음식을 함께 담았습니다.";

const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ?? "";
// keywordegg 계열이 한 속성을 함께 쓴다. 환경변수로 덮어쓸 수 있게 두되
// 기본값을 공통 ID 로 둔다 — 비어 있으면 GA 가 아예 안 붙는다.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-5BM9W5BC3P";

export const metadata: Metadata = {
  ...buildMetadata({
    path: "/",
    title,
    description,
    keywords: [
      "동물병원 진료비",
      "강아지 예방접종 비용",
      "고양이 병원비",
      "종합백신 가격",
      "동물병원 엑스레이 비용",
      "강아지가 먹으면 안되는 음식",
      "고양이 먹어도 되는 음식",
    ],
  }),
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "pets",
  formatDetection: { telephone: false, email: false, address: false },
  verification: {
    ...(GOOGLE_VERIFICATION ? { google: GOOGLE_VERIFICATION } : {}),
    other: { "google-adsense-account": AD_CLIENT },
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE.url}/#website`,
  name: SITE.name,
  alternateName: SITE.nameEn,
  url: SITE.url,
  inLanguage: "ko-KR",
  description,
  publisher: { "@id": `${SITE.url}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE.url}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  alternateName: SITE.nameEn,
  url: SITE.url,
  description,
  logo: {
    "@type": "ImageObject",
    url: `${SITE.url}/opengraph-image`,
    width: 1200,
    height: 630,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          id="json-ld-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* 네이버 애널리틱스 (서치어드바이저 유입 확인용) */}
        <script type="text/javascript" src="//wcs.pstatic.net/wcslog.js" />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html:
              'if(!wcs_add) var wcs_add = {}; wcs_add["wa"] = "159f7184d59b700"; if(window.wcs) {wcs_do();}',
          }}
        />

        <script
          async
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`}
        />
        {/* 측정 ID 를 아직 안 받았으면 gtag 자체를 넣지 않는다 */}
        {GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <script
              id="google-analytics"
              dangerouslySetInnerHTML={{
                __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `,
              }}
            />
          </>
        )}
      </head>
      <body>
        <SiteHeader />
        <main className="site-main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
