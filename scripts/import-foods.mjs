/**
 * 음식 사전을 petpawpaw.net 에서 이 사이트로 옮긴다.
 *
 *   node scripts/import-foods.mjs --dry-run   옮길 내용만 확인
 *   node scripts/import-foods.mjs             vet_foods 에 적재
 *
 * 두 사이트가 **같은 Supabase 프로젝트**를 쓰므로 네트워크를 건너지 않는다.
 * pawpaw_foods 를 읽어 vet_foods 로 upsert 할 뿐이고, **원본은 건드리지 않는다.**
 * petpawpaw 를 접기로 했어도 원본을 지우는 건 이 스크립트의 일이 아니다.
 *
 * pawpaw_foods 에는 있고 vet_foods 에는 없는 컬럼이 없으므로 컬럼 이름을
 * 그대로 쓴다. id 는 새로 받는다 — 원본과 같은 uuid 를 쓰면 나중에 원본을
 * 지울 때 무엇이 어디 것인지 헷갈린다.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

const SOURCE = "pawpaw_foods";
const TARGET = "vet_foods";

const DRY_RUN = process.argv.includes("--dry-run");

const COLUMNS = [
  "animal",
  "slug",
  "name",
  "emoji",
  "safety",
  "one_liner",
  "summary",
  "benefits",
  "risks",
  "symptoms",
  "serving_guide",
  "alternatives",
  "faq",
  "aliases",
  "body",
  "status",
  "published_at",
  "created_at",
];

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/** 빈 배열 컬럼이 null 로 넘어오면 not null 제약에 걸린다 */
function normalize(row) {
  const out = {};
  for (const c of COLUMNS) {
    const v = row[c];
    if (["benefits", "risks", "symptoms", "alternatives", "faq", "aliases", "body"].includes(c)) {
      out[c] = Array.isArray(v) ? v : [];
    } else {
      out[c] = v ?? null;
    }
  }
  out.status = row.status ?? "published";
  return out;
}

async function main() {
  const supabase = db();

  const { data: source, error } = await supabase
    .from(SOURCE)
    .select(COLUMNS.join(", "))
    .order("animal")
    .order("name")
    .limit(1000);

  if (error) throw new Error(`${SOURCE} 조회 실패: ${error.message}`);
  if (!source?.length) throw new Error(`${SOURCE} 에 행이 없습니다.`);

  const rows = source.map(normalize);

  const byAnimal = rows.reduce((a, r) => ((a[r.animal] = (a[r.animal] || 0) + 1), a), {});
  const bySafety = rows.reduce((a, r) => ((a[r.safety] = (a[r.safety] || 0) + 1), a), {});
  console.log(`읽은 행 ${rows.length}건`);
  console.log(`  동물: ${JSON.stringify(byAnimal)}`);
  console.log(`  분류: ${JSON.stringify(bySafety)}`);

  // 본문이 비어 있는 행은 상세 화면이 껍데기가 된다. 옮기기 전에 알린다.
  const thin = rows.filter((r) => r.body.length === 0);
  if (thin.length) {
    console.log(`  본문이 빈 행 ${thin.length}건: ${thin.map((r) => `${r.animal}/${r.slug}`).join(", ")}`);
  }

  if (DRY_RUN) {
    console.log("--dry-run 이라 적재는 건너뜁니다.");
    return;
  }

  // (animal, slug) 가 고유키라 다시 돌려도 중복되지 않는다
  const { error: upErr } = await supabase
    .from(TARGET)
    .upsert(rows, { onConflict: "animal,slug" });
  if (upErr) throw new Error(`${TARGET} 적재 실패: ${upErr.message}`);

  const { count } = await supabase
    .from(TARGET)
    .select("*", { count: "exact", head: true });
  console.log(`${TARGET} 적재 완료 — 현재 ${count}건`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
