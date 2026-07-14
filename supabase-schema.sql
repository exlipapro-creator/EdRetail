-- ════════════════════════════════════════════════════════════════
-- ED Retail — Supabase Schema
-- Run this entire file in Supabase → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════════

-- Products table (admin-managed, replaces static JSON in production)
create table if not exists products (
  id           text primary key,
  name_en      text not null,
  name_sw      text not null,
  category     text not null check (category in ('p4-slimming','health-wellness','lifestyle-beverages')),
  price        integer not null,
  price_usd    integer not null default 0,
  description_en text not null default '',
  description_sw text not null default '',
  usage_en     text not null default '',
  usage_sw     text not null default '',
  image        text not null default '',
  badge        text,
  in_stock     boolean not null default true,
  stock_qty    integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Sales table (app orders + cash sales)
create table if not exists sales (
  id                 uuid primary key default gen_random_uuid(),
  channel            text not null check (channel in ('app','cash','loan')),
  status             text not null default 'pending' check (status in ('pending','confirmed','delivered','cancelled')),
  customer_name      text not null,
  customer_phone     text not null default '',
  customer_location  text not null default '',
  items              jsonb not null default '[]',
  subtotal           integer not null default 0,
  amount_paid        integer not null default 0,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Loan records table
create table if not exists loans (
  id                 uuid primary key default gen_random_uuid(),
  sale_id            uuid references sales(id) on delete set null,
  customer_name      text not null,
  customer_phone     text not null default '',
  customer_location  text not null default '',
  items              jsonb not null default '[]',
  total_amount       integer not null default 0,
  amount_paid        integer not null default 0,
  balance            integer generated always as (total_amount - amount_paid) stored,
  due_date           date,
  status             text not null default 'active' check (status in ('active','partial','cleared')),
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Loan payments log
create table if not exists loan_payments (
  id        uuid primary key default gen_random_uuid(),
  loan_id   uuid not null references loans(id) on delete cascade,
  amount    integer not null,
  paid_at   timestamptz not null default now(),
  notes     text
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger products_updated_at before update on products
  for each row execute function update_updated_at();
create or replace trigger sales_updated_at before update on sales
  for each row execute function update_updated_at();
create or replace trigger loans_updated_at before update on loans
  for each row execute function update_updated_at();

-- RLS: only authenticated users (admin) can write; anon can read products
alter table products enable row level security;
alter table sales    enable row level security;
alter table loans    enable row level security;
alter table loan_payments enable row level security;

-- Products: public read, auth write
create policy "products_public_read"  on products for select using (true);
create policy "products_auth_insert"  on products for insert with check (auth.role() = 'authenticated');
create policy "products_auth_update"  on products for update using (auth.role() = 'authenticated');
create policy "products_auth_delete"  on products for delete using (auth.role() = 'authenticated');

-- Sales: anon INSERT allowed (storefront checkout), auth for everything else
create policy "sales_anon_insert"  on sales for insert with check (true);
create policy "sales_auth_select"  on sales for select using (auth.role() = 'authenticated');
create policy "sales_auth_update"  on sales for update using (auth.role() = 'authenticated');
create policy "sales_auth_delete"  on sales for delete using (auth.role() = 'authenticated');

-- Loans: auth only
create policy "loans_auth_all" on loans for all using (auth.role() = 'authenticated');

-- Loan payments: auth only
create policy "loan_payments_auth_all" on loan_payments for all using (auth.role() = 'authenticated');

-- Seed products from static data
insert into products (id, name_en, name_sw, category, price, price_usd, description_en, description_sw, usage_en, usage_sw, image, badge, in_stock, stock_qty)
values
  ('mrt-complex','MRT Complex','MRT Complex','p4-slimming',45000,17,
   'Meal Replacement Therapy for healthy weight management. High-protein formula that keeps you full and nourished while reducing calorie intake.',
   'Tiba ya Kubadilisha Mlo kwa usimamizi wa uzito wenye afya. Fomula ya protini nyingi inayokufanya ujisikie kamili na kupata lishe huku ukipunguza kalori.',
   'Mix 2 scoops with 200ml water or milk. Take once daily as a meal replacement, preferably breakfast or lunch.',
   'Changanya vijiko 2 na maji au maziwa 200ml. Tumia mara moja kwa siku badala ya mlo, ikiwezekana kiamsha kinywa au chakula cha mchana.',
   '/products/mrt-complex.png','Step 1',true,20),
  ('shake-off-phyto','Shake Off Phyto Fiber','Shake Off Phyto Fiber','p4-slimming',35000,13,
   'Colon cleansing formula with phytonutrients. Removes toxins and waste, improves digestion, and prepares the body to absorb nutrients efficiently.',
   'Fomula ya kusafisha utumbo mkubwa na virutubisho vya mmea. Huondoa sumu na taka, huboresha usagaji wa chakula, na kuandaa mwili kufyonza virutubisho.',
   'Mix 1 sachet with 250ml cold water. Drink immediately once daily, best taken in the morning before breakfast.',
   'Changanya kifurushi 1 na maji baridi 250ml. Kunywa mara moja kwa siku, inafaa kunywa asubuhi kabla ya kiamsha kinywa.',
   '/products/shake-off.png','Step 2',true,15),
  ('splina-chlorophyll','Splina Liquid Chlorophyll','Splina Klorofili ya Majimaji','health-wellness',28000,11,
   'Nature''s green miracle — detoxifies, alkalises, and energises your body. Rich in antioxidants and supports healthy blood production.',
   'Muujiza wa kijani wa asili — husafisha sumu, hutenganisha asidi, na kutoa nguvu mwilini. Tajiri katika vioksidishaji na inasaidia uzalishaji wa damu.',
   'Add 5ml (1 teaspoon) to a glass of water (300ml). Take 1–2 times daily, morning and/or evening.',
   'Ongeza 5ml (kijiko 1) kwenye glasi ya maji (300ml). Tumia mara 1–2 kwa siku, asubuhi na/au jioni.',
   '/products/splina.png','Bestseller',true,30),
  ('hawaiian-spirulina','Hawaiian Spirulina','Spirulina ya Hawaii','health-wellness',32000,12,
   'Premium blue-green algae superfood packed with proteins, vitamins, and antioxidants. Boosts immunity, energy, and overall vitality.',
   'Chakula bora cha mwani wa bluu-kijani kilichojaa protini, vitamini, na vioksidishaji. Huimarisha kinga, nishati, na nguvu ya jumla.',
   'Take 3–6 tablets daily with water. Best taken 30 minutes before meals for maximum absorption.',
   'Tumia vidonge 3–6 kwa siku na maji. Inafaa kunywa dakika 30 kabla ya mlo kwa ufyonzaji bora.',
   '/products/spirulina.png',null,true,25),
  ('ginseng-coffee','Ginseng Coffee','Kahawa ya Ginseng','lifestyle-beverages',25000,10,
   'Premium blend with Korean ginseng extract for sustained energy without jitters. Enhances focus, stamina, and mental clarity throughout the day.',
   'Mchanganyiko wa hali ya juu na dondoo ya ginseng ya Korea kwa nishati endelevu bila mshtuko. Huimarisha umakini, nguvu, na uwazi wa kiakili.',
   'Mix 1 sachet with 150–200ml hot water. Stir well and enjoy. Take 1–2 cups daily, preferably morning and early afternoon.',
   'Changanya kifurushi 1 na maji moto 150–200ml. Koroga vizuri na unywe. Tumia vikombe 1–2 kwa siku, ikiwezekana asubuhi na mchana.',
   '/products/ginseng-coffee.png',null,true,40),
  ('cafe-troika','Cafe Troika','Kahawa Troika','lifestyle-beverages',27000,10,
   'Three-in-one coffee with ganoderma, ginseng, and tongkat ali. A powerful wellness brew that supports vitality, stamina, and male health.',
   'Kahawa ya tatu-kwa-moja na ganoderma, ginseng, na tongkat ali. Kinywaji chenye nguvu kinachosaidia nguvu, stamina, na afya ya kiume.',
   'Mix 1 sachet with 150ml hot water. Take 1 cup daily, best in the morning. Do not exceed 2 cups per day.',
   'Changanya kifurushi 1 na maji moto 150ml. Tumia kikombe 1 kwa siku, inafaa asubuhi. Usizidi vikombe 2 kwa siku.',
   '/products/cafe-troika.png','Premium',true,35),
  ('cocollagen','Cocollagen','Cocollagen','lifestyle-beverages',30000,11,
   'Collagen-rich chocolate drink for radiant skin, stronger joints, and better sleep. Combines marine collagen with cocoa for a delicious daily ritual.',
   'Kinywaji cha chokoleti chenye kolajeni nyingi kwa ngozi yenye kung''aa, viungo imara, na usingizi bora. Inachanganya kolajeni ya baharini na kakao.',
   'Mix 1 sachet with 200ml warm water or milk. Take once daily, best in the evening before bed for overnight skin repair.',
   'Changanya kifurushi 1 na maji ya uvuguvugu au maziwa 200ml. Tumia mara moja kwa siku, inafaa jioni kabla ya kulala kwa ukarabati wa ngozi usiku.',
   '/products/cocollagen.png',null,true,28)
on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════════
-- MIGRATION: apply if schema already exists in Supabase
-- Run this separately if tables already exist from initial setup:
--
-- drop policy if exists "sales_auth_all" on sales;
-- create policy "sales_anon_insert" on sales for insert with check (true);
-- create policy "sales_auth_select" on sales for select using (auth.role() = 'authenticated');
-- create policy "sales_auth_update" on sales for update using (auth.role() = 'authenticated');
-- create policy "sales_auth_delete" on sales for delete using (auth.role() = 'authenticated');
-- ════════════════════════════════════════════════════════════════
