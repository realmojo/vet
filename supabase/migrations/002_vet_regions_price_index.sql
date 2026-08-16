-- 지역끼리 비싼지 싼지 견주는 기준을 바꾼다.
--
-- 예전 median_of_mid(그 지역 항목 중간값들의 중간값)는 **지역 비교에 쓸 수
-- 없다.** 시골 군 단위는 MRI·CT 를 갖춘 병원이 없어 항목이 8~19개만 잡히는데,
-- 빠지는 것이 하나같이 비싼 항목이라 중간값이 저절로 내려간다. 실제로
-- 충남 서천군이 7,500원으로 전국 최저로 보였지만 그건 싼 게 아니라
-- 값이 있는 항목이 15개뿐이어서 생긴 착시였다.
--
-- 대신 **가격지수**를 쓴다. 그 지역이 가진 항목마다 (지역 중간값 ÷ 전국
-- 중간값) 을 구하고 그 비율들의 중간값을 100 기준으로 적는다. 어떤 항목을
-- 가졌든 각 항목을 전국과 1:1 로 견주므로 구성이 달라도 비교가 성립한다.
--
-- 함께 고친 것: 이 프로젝트는 pg_safeupdate 가 켜져 있어 WHERE 없는 DELETE 가
-- 막힌다. 집계 테이블은 매번 통째로 다시 만드는 것이 맞으므로 `where true` 를
-- 붙인다.

alter table public.vet_regions
  add column if not exists price_index integer;

comment on column public.vet_regions.price_index is
  '전국=100 기준 가격지수. 항목별 (지역 중간값 ÷ 전국 중간값) 비율들의 중간값';
comment on column public.vet_regions.median_of_mid is
  '그 지역 항목 중간값들의 중간값. 항목 구성에 휘둘리므로 지역 비교에 쓰지 말 것';
comment on column public.vet_regions.item_count is
  '값이 있는 항목 수 (최대 35). 작을수록 가격지수의 표본이 얇다';

create or replace function public.refresh_vet_aggregates()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 1) 항목 집계가 먼저다. 지역 가격지수가 여기의 national_mid 를 쓴다.
  delete from public.vet_items where true;

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
    (array_agg(f.region_slug order by f.mid_price asc  nulls last, f.region_slug))[1],
    min(f.mid_price),
    (array_agg(f.region_slug order by f.mid_price desc nulls last, f.region_slug))[1],
    max(f.mid_price)
  from public.vet_fees f
  group by f.item_slug;

  -- 2) 지역 집계
  delete from public.vet_regions where true;

  insert into public.vet_regions (
    region_slug, sido_slug, sido_name, sigungu_name,
    item_count, median_of_mid, price_index, consult_mid, vaccine_mid
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
    -- 전국=100 기준 가격지수
    round(
      percentile_cont(0.5) within group (
        order by f.mid_price::numeric / nullif(i.national_mid, 0)
      ) filter (where f.mid_price is not null and i.national_mid > 0)
      * 100
    )::integer,
    max(f.mid_price) filter (where f.item_slug = '초진-진찰료-5kg'),
    max(f.mid_price) filter (where f.item_slug = '종합백신-강아지')
  from public.vet_fees f
  join public.vet_items i on i.item_slug = f.item_slug
  group by f.region_slug;
end;
$$;
