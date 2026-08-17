#!/usr/bin/env node
/**
 * 전체 URL 을 naver-indexing/urls.txt 로 뽑는다.
 *
 * 네이버 서치어드바이저는 사이트맵과 별개로 URL 목록 제출을 받는다.
 * 인코딩 규칙은 lib/seo.ts 의 absoluteUrl 과 같아야 한다 — 한 조각씩
 * encodeURIComponent 를 걸고 슬래시로 다시 잇는다.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

import { SIDOS, ITEMS } from "./fee-codes.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
dotenv.config({ path: path.join(ROOT, ".env.local"), quiet: true });

const SITE = "https://vet.keywordegg.com";
const abs = (p) =>
  !p || p === "/"
    ? SITE
    : `${SITE}${(p.startsWith("/") ? p : `/${p}`)
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`;

/** lib/menu.ts · lib/foods.ts 의 고정 경로와 같아야 한다 */
const STATIC = [
  "/",
  "/진료비",
  "/지역",
  "/음식",
  "/강아지",
  "/고양이",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

const ANIMAL_SLUG = { dog: "강아지", cat: "고양이" };

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(".env.local 확인");
    process.exit(1);
  }
  const sb = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const urls = [
    ...STATIC.map(abs),
    ...SIDOS.map((s) => abs(`/${s.short}`)),
    ...ITEMS.map((i) => abs(`/${i.slug}`)),
  ];

  const { data: regions, error: regErr } = await sb
    .from("vet_regions")
    .select("region_slug")
    .limit(1000);
  if (regErr) throw new Error(regErr.message);
  for (const r of regions ?? []) urls.push(abs(`/${r.region_slug}`));

  const { data: foods, error: foodErr } = await sb
    .from("vet_foods")
    .select("animal, slug")
    .eq("status", "published")
    .limit(1000);
  if (foodErr) throw new Error(foodErr.message);
  for (const f of foods ?? []) {
    urls.push(abs(`/${ANIMAL_SLUG[f.animal] ?? f.animal}-${f.slug}`));
  }

  const uniq = [...new Set(urls)];
  // URL 목록은 m/naver-indexing/data/<사이트>/ 한곳에서 관리한다.
  const out = path.resolve(ROOT, "../naver-indexing/data/vet/urls.txt");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${uniq.join("\n")}\n`, "utf8");

  console.log(
    `고정 ${STATIC.length} · 시도 ${SIDOS.length} · 항목 ${ITEMS.length} · 지역 ${regions?.length ?? 0} · 음식 ${foods?.length ?? 0}`,
  );
  console.log(`합계 ${uniq.length}\n${out}`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
