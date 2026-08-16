-- vet.keywordegg.com 기본 테이블
--
--   vet_fees    : 동물병원 진료비 (시군구 × 진료항목). scripts/import-fees.mjs 가 채운다
--   vet_regions : 시군구 마스터 + 집계. 허브 목록과 전국 대비 비교에 쓴다
--   vet_items   : 진료항목 집계 한 줄씩. 항목 허브와 상세 상단에 쓴다
--   vet_foods   : 강아지·고양이 음식 사전 (petpawpaw.net 에서 이관)
--
-- 집계 두 개(vet_regions, vet_items)는 매 요청 계산하지 않고
-- refresh_vet_aggregates() 로 적재 후 한 번에 다시 만든다.

/* ------------------------------- 진료비 ------------------------------- */

create table if not exists public.vet_fees (
  id            bigserial primary key,
  -- scripts/fee-codes.mjs 의 ITEMS[].slug. URL 이 되므로 바꾸지 않는다
  item_slug     text        not null,
  sido_code     text        not null,   -- 법정동코드 앞 2자리. 예: 11
  sido_slug     text        not null,   -- 짧은 이름. 예: 서울
  sido_name     text        not null,   -- 원문 이름. 예: 서울특별시
  sigungu_name  text        not null,   -- 예: 강남구
  region_slug   text        not null,   -- lib/regions.ts 의 regionSlug() 결과. 예: 서울-강남구
  min_price     integer,
  mid_price     integer,
  avg_price     integer,
  max_price     integer,
  created_at    timestamptz not null default now()
);

comment on table public.vet_fees is
  '동물병원 진료비 (농림축산식품부 동물병원 진료비 조사·공개 시스템)';
comment on column public.vet_fees.mid_price is
  '중간값. 화면에서 앞세우는 값이다. 최저·최고는 한 곳만 있어도 잡혀 대표성이 없다';
comment on column public.vet_fees.region_slug is
  'URL 슬러그. lib/regions.ts 의 regionSlug(sido, sigungu) 와 같은 규칙이어야 한다';

-- 같은 (항목 × 지역) 이 두 번 들어가지 않게 한다
create unique index if not exists vet_fees_key
  on public.vet_fees (item_slug, region_slug);

create index if not exists vet_fees_region_idx
  on public.vet_fees (region_slug);

create index if not exists vet_fees_item_idx
  on public.vet_fees (item_slug, mid_price desc nulls last);

create index if not exists vet_fees_sido_idx
  on public.vet_fees (sido_slug);

/* ----------------------------- 지역 집계 ----------------------------- */

create table if not exists public.vet_regions (
  region_slug  text primary key,
  sido_slug    text    not null,
  sido_name    text    not null,
  sigungu_name text    not null,
  -- 값이 있는 진료항목 수 (최대 35). 0 이면 조사 대상 병원이 없던 지역이다
  item_count   integer not null default 0,
  -- 이 지역 항목별 중간값들의 중간값. 지역끼리 비싼지 싼지 견주는 기준
  median_of_mid integer,
  -- 대표 항목 두 개는 목록에서 바로 보여준다
  consult_mid  integer,   -- 초진 진찰료 5kg
  vaccine_mid  integer    -- 종합백신 접종비 (개)
);

comment on table public.vet_regions is '시군구 단위 진료비 집계 (vet_fees 에서 계산)';
comment on column public.vet_regions.median_of_mid is
  '항목별 중간값들의 중간값. 항목 구성이 지역마다 달라 평균보다 이쪽이 덜 흔들린다';

create index if not exists vet_regions_sido_idx
  on public.vet_regions (sido_slug, sigungu_name);

/* ----------------------------- 항목 집계 ----------------------------- */

create table if not exists public.vet_items (
  item_slug    text primary key,
  -- 값이 있는 시군구 수. 이 숫자가 작은 항목은 화면에서 뒤로 민다
  region_count integer not null default 0,
  min_price    integer,   -- 전국 최저 (어느 한 지역의 최저값)
  max_price    integer,   -- 전국 최고
  -- 시군구 중간값들의 중간값. 이 사이트가 말하는 '전국 시세'
  national_mid integer,
  -- 가장 싼 지역 / 가장 비싼 지역 (중간값 기준)
  cheapest_region  text,
  cheapest_mid     integer,
  priciest_region  text,
  priciest_mid     integer
);

comment on table public.vet_items is '진료항목 단위 전국 집계 (vet_fees 에서 계산)';
comment on column public.vet_items.national_mid is
  '시군구 중간값들의 중간값. 시군구마다 병원 수가 달라 단순 평균은 대도시 쪽으로 쏠린다';

/* ------------------------------ 음식 사전 ------------------------------ */

create table if not exists public.vet_foods (
  id            uuid primary key default gen_random_uuid(),
  animal        text        not null,   -- dog | cat
  slug          text        not null,   -- 한글. 예: 초콜릿
  name          text        not null,
  emoji         text,
  safety        text        not null,   -- safe | caution | danger
  one_liner     text,
  summary       text,
  benefits      jsonb       not null default '[]'::jsonb,
  risks         jsonb       not null default '[]'::jsonb,
  symptoms      jsonb       not null default '[]'::jsonb,
  serving_guide text,
  alternatives  jsonb       not null default '[]'::jsonb,
  faq           jsonb       not null default '[]'::jsonb,
  aliases       jsonb       not null default '[]'::jsonb,
  body          jsonb       not null default '[]'::jsonb,
  status        text        not null default 'published',
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint vet_foods_animal_check check (animal in ('dog', 'cat')),
  constraint vet_foods_safety_check check (safety in ('safe', 'caution', 'danger'))
);

comment on table public.vet_foods is
  '강아지·고양이가 먹어도 되는 음식 (petpawpaw.net 에서 이관)';
comment on column public.vet_foods.body is
  '본문 블록 [{"h":"소제목","p":["문단",...]}] 형식';

-- 같은 동물 안에서 음식 이름은 하나뿐이다.
-- 개와 고양이는 같은 이름을 각자 가진다 (초콜릿·아보카도 등)
create unique index if not exists vet_foods_key
  on public.vet_foods (animal, slug);

create index if not exists vet_foods_animal_idx
  on public.vet_foods (animal, safety, name);

/* ------------------------------ 집계 갱신 ------------------------------ */

-- 적재 스크립트가 vet_fees 를 새로 채운 뒤 한 번 호출한다.
create or replace function public.refresh_vet_aggregates()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.vet_regions;

  insert into public.vet_regions (
    region_slug, sido_slug, sido_name, sigungu_name,
    item_count, median_of_mid, consult_mid, vaccine_mid
  )
  select
    f.region_slug,
    min(f.sido_slug),
    min(f.sido_name),
    min(f.sigungu_name),
    count(*) filter (where f.mid_price is not null),
    percentile_disc(0.5) within group (
      order by f.mid_price
    ) filter (where f.mid_price is not null)::integer,
    max(f.mid_price) filter (where f.item_slug = '초진-진찰료-5kg'),
    max(f.mid_price) filter (where f.item_slug = '종합백신-강아지')
  from public.vet_fees f
  group by f.region_slug;

  delete from public.vet_items;

  insert into public.vet_items (
    item_slug, region_count, min_price, max_price, national_mid,
    cheapest_region, cheapest_mid, priciest_region, priciest_mid
  )
  select
    f.item_slug,
    count(*) filter (where f.mid_price is not null),
    min(f.min_price),
    max(f.max_price),
    percentile_disc(0.5) within group (
      order by f.mid_price
    ) filter (where f.mid_price is not null)::integer,
    -- 중간값이 가장 낮은/높은 지역. 값이 같으면 이름 순으로 하나를 고른다
    (array_agg(f.region_slug order by f.mid_price asc  nulls last, f.region_slug))[1],
    min(f.mid_price),
    (array_agg(f.region_slug order by f.mid_price desc nulls last, f.region_slug))[1],
    max(f.mid_price)
  from public.vet_fees f
  group by f.item_slug;
end;
$$;

comment on function public.refresh_vet_aggregates() is
  'vet_fees 적재 후 vet_regions·vet_items 를 다시 만든다';

/* -------------------------------- 접근 제어 -------------------------------- */

-- 서비스 롤 키를 쓰는 서버 컴포넌트만 접근한다 (RLS 를 켜고 정책은 두지 않는다)
alter table public.vet_fees    enable row level security;
alter table public.vet_regions enable row level security;
alter table public.vet_items   enable row level security;
alter table public.vet_foods   enable row level security;
