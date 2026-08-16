/**
 * 동물병원 진료비를 시군구 단위로 받아 Supabase 에 적재한다.
 *
 *   node scripts/import-fees.mjs --probe     조합 하나만 받아 응답 모양 확인
 *   node scripts/import-fees.mjs --dry-run   전량 수집 후 파일로만 저장
 *   node scripts/import-fees.mjs             전량 수집 + 적재
 *
 * 출처: 농림축산식품부 동물병원 진료비 조사·공개 시스템
 *       https://animalclinicfee.or.kr  (조회 화면이 쓰는 내부 JSON)
 *
 * **공개 API 가 아니다.** 규격이 예고 없이 바뀔 수 있으므로 응답을 검증하고,
 * 조사가 연 1회라 자주 돌릴 이유도 없다. 요청 사이에 간격을 둔다.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { SIDOS, ITEMS } from "./fee-codes.mjs";

config({ path: ".env.local", quiet: true });

const ENDPOINT = "https://animalclinicfee.or.kr/info/searchPrice.json";
const RAW_PATH = "data/raw/fees.json";
const GAP_MS = 400;

const args = new Set(process.argv.slice(2));
const PROBE = args.has("--probe");
const DRY_RUN = args.has("--dry-run");
/** 이미 받아 둔 data/raw/fees.json 을 그대로 적재한다 (다시 긁지 않는다) */
const LOAD_ONLY = args.has("--load-only");

/** 한 (시도 × 진료항목) 조합의 시군구별 통계를 받는다 */
async function fetchOne(sidoCd, item) {
  const body = new URLSearchParams({
    sidoCd,
    mediTypeCd: item.medi,
    animalTypeCd: item.animal,
  });

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      Referer: "https://animalclinicfee.or.kr/info/payInfo.do",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
    },
    body,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} (${sidoCd}/${item.slug})`);

  const json = await res.json();
  if (!Array.isArray(json)) {
    throw new Error(
      `배열이 아닌 응답 (${sidoCd}/${item.slug}): ${JSON.stringify(json).slice(0, 200)}`,
    );
  }
  return json;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SIDO_BY_CODE = new Map(SIDOS.map((s) => [s.code, s]));
const SIDO_BY_NAME = new Map(SIDOS.map((s) => [s.name, s]));

/**
 * 응답 한 행을 우리 스키마로 옮긴다. 값이 없으면 null 로 둔다.
 *
 * 슬러그 규칙은 `lib/regions.ts` 의 regionSlug()·normalizeSigungu() 와 같아야
 * 한다. 한쪽만 고치면 적재된 주소와 화면이 찾는 주소가 어긋나 404 가 된다.
 */
function toRow(item, raw) {
  const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

  const code = String(raw.SIDO_CD ?? raw.ADDR1_CD ?? "");
  const name = (raw.ADDR1_NM ?? "").trim();
  const sido = SIDO_BY_CODE.get(code) ?? SIDO_BY_NAME.get(name);
  if (!sido) throw new Error(`모르는 시도: code=${code} name=${name}`);

  // 세종처럼 시군구가 없는 곳은 시도 이름 하나로 끝낸다
  const rawSigungu = (raw.ADDR2_NM ?? "").trim();
  const sigungu = !rawSigungu || rawSigungu === sido.name ? "" : rawSigungu;
  const compact = sigungu.replace(/\s+/g, "");

  return {
    item_slug: item.slug,
    sido_code: sido.code,
    sido_slug: sido.short,
    sido_name: sido.name,
    sigungu_name: sigungu,
    region_slug: compact ? `${sido.short}-${compact}` : sido.short,
    min_price: num(raw.MIN_PRICE),
    mid_price: num(raw.MID_PRICE),
    avg_price: num(raw.AVG_PRICE),
    max_price: num(raw.MAX_PRICE),
  };
}

async function collect() {
  const targets = PROBE ? [[SIDOS[0], ITEMS[0]]] : SIDOS.flatMap((s) => ITEMS.map((i) => [s, i]));

  console.log(`수집 대상 ${targets.length}건 (시도 ${SIDOS.length} × 항목 ${ITEMS.length})`);

  const rows = [];
  const failures = [];
  let done = 0;

  for (const [sido, item] of targets) {
    try {
      const raw = await fetchOne(sido.code, item);
      for (const r of raw) rows.push(toRow(item, r));
      if (PROBE) {
        console.log(`\n${sido.name} / ${item.label} ${item.variant} — ${raw.length}행`);
        console.log("원본 첫 행:", JSON.stringify(raw[0], null, 1));
        console.log("변환 결과:", JSON.stringify(toRow(item, raw[0]), null, 1));
        return { rows, failures };
      }
    } catch (err) {
      failures.push({ sido: sido.name, item: item.slug, message: err.message });
      console.warn(`  ! 실패 ${sido.short}/${item.slug} — ${err.message}`);
    }

    done += 1;
    if (done % 35 === 0) {
      console.log(`  ${done}/${targets.length} — 누적 ${rows.length}행 (${sido.name} 완료)`);
    }
    await sleep(GAP_MS);
  }

  return { rows, failures };
}

async function load(rows) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.");
  }
  const db = createClient(url, key, { auth: { persistSession: false } });

  // 전량 교체. 이번에 안 온 (항목 × 지역) 조합이 예전 값으로 남으면
  // 기준연도가 섞여서 어느 해 값인지 알 수 없게 된다.
  const { error: delErr } = await db.from("vet_fees").delete().gte("id", 0);
  if (delErr) throw new Error(`기존 행 삭제 실패: ${delErr.message}`);

  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error } = await db.from("vet_fees").insert(slice);
    if (error) throw new Error(`적재 실패 (${i}~): ${error.message}`);
    console.log(`  적재 ${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
  }

  // 집계 두 개(vet_regions·vet_items)를 다시 만든다.
  // 이걸 빠뜨리면 화면은 예전 집계를 그대로 보여준다.
  const { error: aggErr } = await db.rpc("refresh_vet_aggregates");
  if (aggErr) throw new Error(`집계 갱신 실패: ${aggErr.message}`);
  console.log("  집계 갱신 완료 (vet_regions · vet_items)");
}

/**
 * 저장해 둔 원본을 다시 정규화한다.
 *
 * 원본 파일에는 응답에서 옮긴 값만 있고 슬러그가 없을 수 있다(수집 시점의
 * toRow 가 만들던 모양이 지금과 다르다). 이름으로 시도를 되찾아 다시 만든다.
 */
function renormalize(rows) {
  return rows.map((r) => {
    const sido =
      SIDO_BY_CODE.get(String(r.sido_code ?? "")) ??
      SIDO_BY_NAME.get((r.sido_name ?? "").trim());
    if (!sido) throw new Error(`모르는 시도: ${JSON.stringify(r).slice(0, 120)}`);

    const rawSigungu = (r.sigungu_name ?? "").trim();
    const sigungu = !rawSigungu || rawSigungu === sido.name ? "" : rawSigungu;
    const compact = sigungu.replace(/\s+/g, "");

    return {
      item_slug: r.item_slug,
      sido_code: sido.code,
      sido_slug: sido.short,
      sido_name: sido.name,
      sigungu_name: sigungu,
      region_slug: compact ? `${sido.short}-${compact}` : sido.short,
      min_price: r.min_price ?? null,
      mid_price: r.mid_price ?? null,
      avg_price: r.avg_price ?? null,
      max_price: r.max_price ?? null,
    };
  });
}

function summarize(rows) {
  const sigungu = new Set(rows.map((r) => `${r.sido_name} ${r.sigungu_name}`));
  const items = new Set(rows.map((r) => r.item_slug));
  const empty = rows.filter((r) => r.mid_price == null).length;
  console.log(`\n총 ${rows.length}행 / 시군구 ${sigungu.size}곳 / 항목 ${items.size}종`);
  if (empty) console.log(`중간값이 비어 있는 행: ${empty}`);
}

async function main() {
  if (LOAD_ONLY) {
    const rows = renormalize(JSON.parse(readFileSync(RAW_PATH, "utf8")));
    summarize(rows);
    await load(rows);
    console.log("완료 (--load-only)");
    return;
  }

  const { rows, failures } = await collect();
  if (PROBE) return;

  summarize(rows);
  if (failures.length) {
    console.log(`\n실패 ${failures.length}건:`);
    for (const f of failures) console.log(`  ${f.sido} / ${f.item} — ${f.message}`);
  }

  mkdirSync("data/raw", { recursive: true });
  writeFileSync(RAW_PATH, JSON.stringify(rows, null, 1));
  console.log(`\n원본 저장: ${RAW_PATH}`);

  if (DRY_RUN) {
    console.log("--dry-run 이라 적재는 건너뜁니다.");
    return;
  }
  await load(rows);
  console.log("완료");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
