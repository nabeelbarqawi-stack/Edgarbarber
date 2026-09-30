-- Edgarbarber launch schema: products, waitlist, admins, storage.
-- See specs/001-launch-site/data-model.md.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(name) between 1 and 80),
  tagline text not null default '',
  description text not null check (char_length(description) > 0),
  ingredients text[] not null check (cardinality(ingredients) >= 1),
  size_label text not null default '',
  price_cents integer not null check (price_cents > 0),
  images jsonb not null default '[]'::jsonb check (jsonb_typeof(images) = 'array'),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  consent boolean not null check (consent),
  ip_hash text,
  unsubscribed_at timestamptz,
  confirmation_email_status text not null default 'pending'
    check (confirmation_email_status in ('pending', 'sent', 'failed')),
  email_error text,
  created_at timestamptz not null default now()
);

create unique index waitlist_signups_email_key on public.waitlist_signups (lower(email));
create index waitlist_signups_ip_recent_idx on public.waitlist_signups (ip_hash, created_at);

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- Keep products.updated_at current.
create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Adds or re-subscribes a waitlist signup. Returns created = false when the email
-- is already subscribed (the caller shows the same success message either way).
create function public.join_waitlist(
  p_name text,
  p_email text,
  p_consent boolean,
  p_ip_hash text
) returns table (id uuid, created boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_existing public.waitlist_signups%rowtype;
  v_recent integer;
begin
  if not coalesce(p_consent, false) then
    raise exception 'consent_required';
  end if;

  if p_ip_hash is not null then
    select count(*) into v_recent
    from public.waitlist_signups s
    where s.ip_hash = p_ip_hash and s.created_at > now() - interval '1 hour';
    if v_recent >= 5 then
      raise exception 'rate_limited';
    end if;
  end if;

  select * into v_existing
  from public.waitlist_signups s
  where lower(s.email) = lower(p_email)
  for update;

  if found then
    if v_existing.unsubscribed_at is not null then
      update public.waitlist_signups s
      set unsubscribed_at = null,
          name = p_name,
          consent = true,
          confirmation_email_status = 'pending',
          email_error = null
      where s.id = v_existing.id;
      return query select v_existing.id, true;
    else
      return query select v_existing.id, false;
    end if;
    return;
  end if;

  return query
  insert into public.waitlist_signups as s (name, email, consent, ip_hash)
  values (p_name, lower(p_email), true, p_ip_hash)
  returning s.id, true;
end;
$$;

revoke all on function public.join_waitlist(text, text, boolean, text) from public, anon, authenticated;
grant execute on function public.join_waitlist(text, text, boolean, text) to service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.waitlist_signups enable row level security;
alter table public.admins enable row level security;

create policy "Active products are public"
  on public.products for select
  using (is_active or public.is_admin());

create policy "Admins manage products"
  on public.products for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins read waitlist"
  on public.waitlist_signups for select to authenticated
  using (public.is_admin());

create policy "Admins read own admin row"
  on public.admins for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage: product photos
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Product images are public"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Admins delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
