-- Schéma initial de la marketplace (Supabase / PostgreSQL, région Paris).
-- Principe de sécurité : la base refuse tout par défaut (RLS activé partout),
-- puis on ouvre au cas par cas. Tout ce qui touche à l'argent (statuts de
-- commande, séquestre, versements) ne peut être modifié QUE côté serveur
-- (Edge Functions avec la clé service_role, appelées par les webhooks Wave /
-- Orange Money), jamais directement depuis l'app.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type item_condition as enum ('neuf', 'tres_bon', 'bon', 'satisfaisant');
create type listing_status as enum ('brouillon', 'en_ligne', 'reserve', 'vendu', 'retire');
create type order_status as enum (
  'en_attente_paiement', -- commande créée, paiement pas encore confirmé
  'payee',               -- argent reçu et BLOQUÉ (séquestre)
  'recuperee',           -- le livreur a l'article
  'livree',              -- remis à l'acheteur, en attente de confirmation
  'confirmee',           -- l'acheteur confirme : on peut payer le vendeur
  'litige',              -- l'acheteur signale un problème
  'remboursee',
  'annulee'
);
create type delivery_mode as enum ('moto', 'main_propre');
create type payment_provider as enum ('wave', 'orange_money');
create type payment_status as enum ('initie', 'reussi', 'echoue', 'rembourse');

-- ---------------------------------------------------------------------------
-- Profils (1 ligne par compte Supabase Auth, inscription par téléphone)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  neighborhood text,
  country_code text not null default 'SN',
  language text not null default 'fr' check (language in ('fr', 'wo')),
  is_verified_seller boolean not null default false, -- posé par l'équipe uniquement
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catégories (ouvertes une par une : mode et téléphones au lancement)
-- ---------------------------------------------------------------------------
create table categories (
  id text primary key,                   -- ex. 'mode-femme', 'telephones'
  label_fr text not null,
  label_wo text,
  parent_id text references categories (id),
  is_active boolean not null default false,
  requires_imei boolean not null default false
);

-- ---------------------------------------------------------------------------
-- Annonces
-- ---------------------------------------------------------------------------
create table listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles (id) on delete cascade,
  category_id text not null references categories (id),
  title text not null check (char_length(title) between 3 and 80),
  description text check (char_length(description) <= 2000),
  price_xof integer not null check (price_xof between 100 and 10000000),
  size text,
  brand text,
  condition item_condition not null,
  neighborhood text,
  imei text check (imei is null or imei ~ '^[0-9]{15}$'),
  imei_verified boolean not null default false,  -- posé côté serveur uniquement
  status listing_status not null default 'en_ligne',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index listings_feed_idx on listings (status, category_id, created_at desc);
create index listings_seller_idx on listings (seller_id);

create table listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  storage_path text not null,            -- chemin dans le bucket "photos"
  position smallint not null default 0
);

-- ---------------------------------------------------------------------------
-- Commandes et séquestre
-- ---------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id),
  buyer_id uuid not null references profiles (id),
  seller_id uuid not null references profiles (id),
  item_price_xof integer not null check (item_price_xof > 0),
  buyer_fee_xof integer not null check (buyer_fee_xof >= 0),
  delivery_fee_xof integer not null default 0 check (delivery_fee_xof >= 0),
  total_xof integer generated always as (item_price_xof + buyer_fee_xof + delivery_fee_xof) stored,
  delivery_mode delivery_mode not null,
  delivery_address text,
  -- Code de remise à 4 chiffres : on ne stocke qu'un hash, comparé côté serveur.
  handover_code_hash text,
  status order_status not null default 'en_attente_paiement',
  auto_confirm_at timestamptz,           -- confirmation automatique 48 h après livraison
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (buyer_id <> seller_id)
);
create index orders_buyer_idx on orders (buyer_id);
create index orders_seller_idx on orders (seller_id);
-- Un article ne peut avoir qu'une seule commande active à la fois.
create unique index orders_one_active_per_listing on orders (listing_id)
  where status not in ('annulee', 'remboursee');

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id),
  provider payment_provider not null,
  provider_reference text unique,        -- id de session Wave / Orange Money
  amount_xof integer not null check (amount_xof > 0),
  status payment_status not null default 'initie',
  raw_webhook jsonb,                     -- trace pour l'audit et les litiges
  created_at timestamptz not null default now()
);

create table payouts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders (id),
  seller_id uuid not null references profiles (id),
  amount_xof integer not null check (amount_xof > 0),
  provider payment_provider not null,
  provider_reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- Journal immuable des changements de statut (preuve en cas de litige).
create table order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references orders (id),
  from_status order_status,
  to_status order_status not null,
  actor text not null,                   -- 'system', 'buyer', 'admin', 'webhook:wave'…
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Messagerie et offres de prix
-- ---------------------------------------------------------------------------
create table conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  buyer_id uuid not null references profiles (id),
  seller_id uuid not null references profiles (id),
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create table messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references conversations (id) on delete cascade,
  sender_id uuid not null references profiles (id),
  body text check (char_length(body) <= 1000),
  offer_xof integer check (offer_xof is null or offer_xof > 0),
  offer_status text check (offer_status in ('proposee', 'acceptee', 'refusee')),
  created_at timestamptz not null default now(),
  check (body is not null or offer_xof is not null)
);

-- ---------------------------------------------------------------------------
-- Avis (un par commande confirmée et par sens)
-- ---------------------------------------------------------------------------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id),
  author_id uuid not null references profiles (id),
  target_id uuid not null references profiles (id),
  rating smallint not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 500),
  created_at timestamptz not null default now(),
  unique (order_id, author_id)
);

-- ---------------------------------------------------------------------------
-- Sécurité : Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table categories enable row level security;
alter table listings enable row level security;
alter table listing_photos enable row level security;
alter table orders enable row level security;
alter table payments enable row level security;
alter table payouts enable row level security;
alter table order_events enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table reviews enable row level security;

-- Profils : lecture publique, chacun modifie le sien, sans pouvoir se déclarer vérifié.
create policy profiles_read on profiles for select using (true);
create policy profiles_insert_self on profiles for insert with check (id = auth.uid() and is_verified_seller = false);
create policy profiles_update_self on profiles for update using (id = auth.uid())
  with check (id = auth.uid() and is_verified_seller = (select p.is_verified_seller from profiles p where p.id = auth.uid()));

-- Catégories : lecture des catégories actives seulement.
create policy categories_read on categories for select using (is_active);

-- Annonces : tout le monde voit celles en ligne ; le vendeur voit et gère les siennes.
create policy listings_read on listings for select
  using (status in ('en_ligne', 'reserve', 'vendu') or seller_id = auth.uid());
create policy listings_insert_own on listings for insert
  with check (seller_id = auth.uid() and imei_verified = false and status in ('brouillon', 'en_ligne'));
-- Le vendeur peut modifier ou retirer son annonce, mais pas la marquer vendue
-- ni valider son IMEI lui-même : c'est le serveur qui le fait.
create policy listings_update_own on listings for update using (seller_id = auth.uid())
  with check (seller_id = auth.uid() and imei_verified = false and status in ('brouillon', 'en_ligne', 'retire'));

create policy photos_read on listing_photos for select using (
  exists (select 1 from listings l where l.id = listing_id
          and (l.status in ('en_ligne', 'reserve', 'vendu') or l.seller_id = auth.uid())));
create policy photos_write_own on listing_photos for all using (
  exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid()))
  with check (exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid()));

-- Commandes, paiements, versements, journal : LECTURE seule pour les parties.
-- Aucune politique d'écriture : seules les Edge Functions (service_role) écrivent.
create policy orders_read_parties on orders for select using (auth.uid() in (buyer_id, seller_id));
create policy payments_read_buyer on payments for select using (
  exists (select 1 from orders o where o.id = order_id and o.buyer_id = auth.uid()));
create policy payouts_read_seller on payouts for select using (seller_id = auth.uid());
create policy events_read_parties on order_events for select using (
  exists (select 1 from orders o where o.id = order_id and auth.uid() in (o.buyer_id, o.seller_id)));

-- Messagerie : seuls l'acheteur et le vendeur de la conversation.
create policy conv_read on conversations for select using (auth.uid() in (buyer_id, seller_id));
create policy conv_create_buyer on conversations for insert with check (
  buyer_id = auth.uid() and buyer_id <> seller_id
  and exists (select 1 from listings l where l.id = listing_id and l.seller_id = conversations.seller_id and l.status = 'en_ligne'));
create policy msg_read on messages for select using (
  exists (select 1 from conversations c where c.id = conversation_id and auth.uid() in (c.buyer_id, c.seller_id)));
create policy msg_send on messages for insert with check (
  sender_id = auth.uid()
  and (offer_status is null or offer_status = 'proposee') -- accepter une offre passe par le serveur
  and exists (select 1 from conversations c where c.id = conversation_id and auth.uid() in (c.buyer_id, c.seller_id)));

-- Avis : lecture publique ; écriture seulement après une commande confirmée.
create policy reviews_read on reviews for select using (true);
create policy reviews_write on reviews for insert with check (
  author_id = auth.uid()
  and exists (select 1 from orders o where o.id = order_id and o.status = 'confirmee'
              and auth.uid() in (o.buyer_id, o.seller_id)
              and target_id = case when auth.uid() = o.buyer_id then o.seller_id else o.buyer_id end));

-- ---------------------------------------------------------------------------
-- Catégories de lancement
-- ---------------------------------------------------------------------------
insert into categories (id, label_fr, label_wo, parent_id, is_active, requires_imei) values
  ('mode', 'Mode', null, null, true, false),
  ('mode-femme', 'Femme', null, 'mode', true, false),
  ('mode-homme', 'Homme', null, 'mode', true, false),
  ('tenues-fete', 'Tenues de fête', null, 'mode', true, false),
  ('telephones', 'Téléphones', null, null, true, true),
  ('enfants', 'Enfants', null, null, false, false),
  ('maison', 'Maison et électroménager', null, null, false, false);
