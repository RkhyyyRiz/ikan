-- =====================================================================
-- Budi Daya Ikan Kalbar — skema Supabase (jalankan di SQL Editor)
-- =====================================================================
create extension if not exists pgcrypto;

-- ---------- TABEL ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  phone text,
  address text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  size_spec text not null,
  price_per_kg bigint not null check (price_per_kg >= 0),
  wholesale_min_kg numeric(10,2) not null default 5.00,
  wholesale_price_per_kg bigint check (wholesale_price_per_kg is null or wholesale_price_per_kg >= 0),
  cleaning_fee_per_kg bigint not null default 2000,
  stock_kg numeric(10,2) not null default 0.00 check (stock_kg >= 0),
  availability_type text not null default 'ready' check (availability_type in ('ready','preorder')),
  harvest_date date,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  invoice_code text unique not null,
  user_id uuid not null references public.profiles(id),
  total_amount bigint not null,
  payment_method text not null check (payment_method in ('transfer','cod')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','verifying','paid')),
  payment_proof_url text,
  order_status text not null default 'pending' check (order_status in ('pending','preparing','delivering','completed','cancelled')),
  delivery_address text not null,
  delivery_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  weight_kg numeric(10,2) not null,
  processing_option text not null check (processing_option in ('hidup','segar_es','bersih_siap_masak')),
  unit_price_applied bigint not null,
  cleaning_fee_applied bigint not null default 0,
  subtotal bigint not null
);

create index if not exists orders_user_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_idx on public.orders(order_status, payment_method);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ---------- FUNGSI BANTU ----------
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Profil otomatis saat pengguna baru mendaftar
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id,
          coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)),
          new.email);
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Pengguna biasa tidak boleh mengubah role sendiri (SQL Editor tetap boleh)
create or replace function public.guard_profile_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Tidak diizinkan mengubah peran.';
  end if;
  return new;
end; $$;

drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ---------- RPC ATOMIK ----------
create or replace function public.create_fish_order(
  p_product_id uuid,
  p_weight_kg numeric,
  p_processing_option text,
  p_payment_method text,
  p_delivery_address text,
  p_delivery_notes text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_p public.products%rowtype;
  v_unit bigint; v_clean bigint; v_sub bigint;
  v_order uuid; v_code text; v_tries int := 0;
begin
  if v_uid is null then raise exception 'Silakan masuk terlebih dahulu.'; end if;
  if p_weight_kg is null or p_weight_kg < 0.5 or mod(p_weight_kg * 2, 1) <> 0 then
    raise exception 'Berat minimal 0,5 kg dan berkelipatan 0,5 kg.'; end if;
  if p_processing_option not in ('hidup','segar_es','bersih_siap_masak') then
    raise exception 'Pilihan pengolahan tidak valid.'; end if;
  if p_payment_method not in ('transfer','cod') then
    raise exception 'Metode pembayaran tidak valid.'; end if;
  if p_delivery_address is null or length(trim(p_delivery_address)) < 8 then
    raise exception 'Alamat pengiriman wajib diisi lengkap.'; end if;

  select * into v_p from public.products where id = p_product_id for update;
  if not found or not v_p.is_active then raise exception 'Produk tidak tersedia.'; end if;
  if v_p.stock_kg < p_weight_kg then
    raise exception 'Stok tidak mencukupi. Sisa % kg.', v_p.stock_kg; end if;

  v_unit := case when v_p.wholesale_price_per_kg is not null and p_weight_kg >= v_p.wholesale_min_kg
                 then v_p.wholesale_price_per_kg else v_p.price_per_kg end;
  v_clean := case when p_processing_option = 'bersih_siap_masak'
                  then round(v_p.cleaning_fee_per_kg * p_weight_kg)::bigint else 0 end;
  v_sub := round(v_unit * p_weight_kg)::bigint + v_clean;

  update public.products set stock_kg = stock_kg - p_weight_kg where id = v_p.id;

  loop
    v_code := 'BIK-' || to_char(now() at time zone 'Asia/Pontianak', 'YYYYMMDD') || '-' ||
              lpad((floor(random() * 10000))::int::text, 4, '0');
    exit when not exists (select 1 from public.orders where invoice_code = v_code);
    v_tries := v_tries + 1;
    if v_tries > 20 then raise exception 'Gagal membuat kode pesanan, coba lagi.'; end if;
  end loop;

  insert into public.orders (invoice_code, user_id, total_amount, payment_method, delivery_address, delivery_notes)
  values (v_code, v_uid, v_sub, p_payment_method, trim(p_delivery_address), nullif(trim(coalesce(p_delivery_notes,'')), ''))
  returning id into v_order;

  insert into public.order_items (order_id, product_id, weight_kg, processing_option, unit_price_applied, cleaning_fee_applied, subtotal)
  values (v_order, v_p.id, p_weight_kg, p_processing_option, v_unit, v_clean, v_sub);

  return v_order;
end; $$;

create or replace function public.cancel_fish_order(p_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_o public.orders%rowtype; r record;
begin
  select * into v_o from public.orders where id = p_order_id for update;
  if not found then raise exception 'Pesanan tidak ditemukan.'; end if;
  if not (public.is_admin() or (v_o.user_id = auth.uid() and v_o.order_status = 'pending' and v_o.payment_status = 'unpaid')) then
    raise exception 'Anda tidak berwenang membatalkan pesanan ini.'; end if;
  if v_o.order_status in ('cancelled','completed') then
    raise exception 'Pesanan sudah % dan tidak dapat dibatalkan.', v_o.order_status; end if;

  for r in select product_id, weight_kg from public.order_items where order_id = p_order_id loop
    update public.products set stock_kg = stock_kg + r.weight_kg where id = r.product_id;
  end loop;
  update public.orders set order_status = 'cancelled' where id = p_order_id;
end; $$;

create or replace function public.submit_payment_proof(p_order_id uuid, p_path text) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.orders
     set payment_proof_url = p_path, payment_status = 'verifying'
   where id = p_order_id and user_id = auth.uid() and payment_method = 'transfer'
     and payment_status in ('unpaid','verifying') and order_status <> 'cancelled';
  if not found then raise exception 'Bukti pembayaran tidak dapat dikirim untuk pesanan ini.'; end if;
end; $$;

-- Rekap persiapan lapangan: total kg per produk & pengolahan (pending + preparing)
create or replace function public.field_prep_summary()
returns table (product_name text, processing_option text, total_kg numeric)
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Khusus admin.'; end if;
  return query
    select p.name, oi.processing_option, sum(oi.weight_kg)::numeric
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      join public.products p on p.id = oi.product_id
     where o.order_status in ('pending','preparing')
     group by p.name, oi.processing_option
     order by p.name, oi.processing_option;
end; $$;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_select" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_admin_update" on public.profiles for update using (public.is_admin());

drop policy if exists "products_select" on public.products;
drop policy if exists "products_admin_all" on public.products;
create policy "products_select" on public.products for select using (is_active or public.is_admin());
create policy "products_admin_all" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_select" on public.orders;
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_select" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "orders_admin_update" on public.orders for update using (public.is_admin()) with check (public.is_admin());
-- Pesanan dibuat hanya lewat RPC create_fish_order (security definer), jadi tanpa policy INSERT langsung.

drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items for select using (
  public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);

-- ---------- STORAGE ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fish-photos', 'fish-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false;

drop policy if exists "fish_photos_read" on storage.objects;
drop policy if exists "fish_photos_admin_write" on storage.objects;
drop policy if exists "fish_photos_admin_update" on storage.objects;
drop policy if exists "fish_photos_admin_delete" on storage.objects;
create policy "fish_photos_read" on storage.objects for select using (bucket_id = 'fish-photos');
create policy "fish_photos_admin_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'fish-photos' and public.is_admin());
create policy "fish_photos_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'fish-photos' and public.is_admin());
create policy "fish_photos_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'fish-photos' and public.is_admin());

-- Bukti bayar disimpan di folder <user_id>/...
drop policy if exists "proofs_insert_own" on storage.objects;
drop policy if exists "proofs_select_own_or_admin" on storage.objects;
create policy "proofs_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "proofs_select_own_or_admin" on storage.objects for select to authenticated
  using (bucket_id = 'payment-proofs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ---------- JADIKAN ADMIN (ganti email, jalankan setelah akun terdaftar) ----------
-- update public.profiles set role = 'admin' where email = 'email-anda@contoh.com';

-- ---------- STATISTIK ADMIN ----------
create or replace function public.admin_stats()
returns table (revenue_paid bigint, active_orders bigint, customers bigint)
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Khusus admin.'; end if;
  return query select
    coalesce((select sum(total_amount) from public.orders where payment_status = 'paid' and order_status <> 'cancelled'), 0)::bigint,
    (select count(*) from public.orders where order_status in ('pending','preparing','delivering'))::bigint,
    (select count(*) from public.profiles where role = 'user')::bigint;
end; $$;
