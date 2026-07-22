-- Adds missing profiles.activation column and backfills generated_items
-- from public.content for users that do not already have activation.generated_items.

alter table public.profiles
  add column if not exists activation jsonb not null default '{}'::jsonb;

do $$
begin
  if to_regclass('public.content') is not null then
    with ranked_content as (
      select
        c.user_id,
        c.id,
        c.brand_id,
        c.type,
        c.title,
        c.body,
        c.created_at,
        row_number() over (partition by c.user_id order by c.created_at desc, c.id desc) as rn
      from public.content c
      where c.user_id is not null
    ),
    aggregated as (
      select
        rc.user_id,
        jsonb_agg(
          jsonb_build_object(
            'id', rc.id,
            'user_id', rc.user_id,
            'brand_id', rc.brand_id,
            'type', rc.type,
            'title', coalesce(rc.title, 'Generated content'),
            'body', rc.body,
            'created_at', rc.created_at
          )
          order by rc.created_at desc, rc.id desc
        ) as generated_items
      from ranked_content rc
      where rc.rn <= 100
      group by rc.user_id
    )
    update public.profiles p
    set activation = jsonb_set(
      coalesce(p.activation, '{}'::jsonb),
      '{generated_items}',
      coalesce(a.generated_items, '[]'::jsonb),
      true
    )
    from aggregated a
    where p.id = a.user_id
      and coalesce(jsonb_array_length(coalesce(p.activation->'generated_items', '[]'::jsonb)), 0) = 0;
  else
    raise notice 'Skipping generated_items backfill: public.content table not found.';
  end if;
end
$$;
