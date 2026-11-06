-- Migration 0002 : ce qu'il faut pour brancher l'app sur Supabase.
--  1. Stockage des photos (bucket "photos") : chacun n'écrit que dans SON dossier.
--  2. Messagerie en temps réel (publication Supabase Realtime).
--  3. Réponse à une offre de prix : fonction côté serveur, jamais un update depuis l'app.
-- Principe inchangé (voir 0001) : la base refuse tout par défaut.

-- ---------------------------------------------------------------------------
-- 1. Photos des annonces
-- ---------------------------------------------------------------------------
-- Bucket public en lecture (les photos d'annonces sont faites pour être vues, et le
-- CDN de Supabase les sert vite en 3G). Taille limitée à 2 Mo, images seulement :
-- l'app compresse les photos avant l'envoi (voir src/lib/photos.ts).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Chemin imposé : <id de l'utilisateur>/<id de l'annonce>/<n°>.jpg
-- Personne ne peut écrire ni effacer dans le dossier d'un autre.
create policy photos_upload_own on storage.objects for insert
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy photos_delete_own on storage.objects for delete
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- La ligne listing_photos doit pointer vers le dossier du vendeur de l'annonce :
-- impossible d'afficher sur son annonce la photo stockée par quelqu'un d'autre.
alter table listing_photos add constraint listing_photos_path_format
  check (storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9]+\.(jpg|png|webp)$');
drop policy photos_write_own on listing_photos;
create policy photos_write_own on listing_photos for all
  using (exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid()))
  with check (
    exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid())
    and split_part(storage_path, '/', 1) = auth.uid()::text
    and split_part(storage_path, '/', 2) = listing_id::text);

-- ---------------------------------------------------------------------------
-- 2. Temps réel : l'app reçoit les nouveaux messages et les réponses aux offres
-- sans recharger. Realtime respecte les règles RLS (msg_read, conv_read).
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table messages, conversations;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Accepter ou refuser une offre de prix
-- ---------------------------------------------------------------------------
-- La règle msg_send interdit d'insérer une offre « acceptée » depuis l'app, et il
-- n'existe aucune règle d'update sur messages. Cette fonction est donc le SEUL
-- chemin : elle tourne avec les droits du propriétaire de la base (security
-- definer) et vérifie elle-même que l'appelant a le droit de répondre.
-- Le prix réellement payé sera recalculé côté serveur à partir de cette ligne.
create function respond_to_offer(p_message_id bigint, p_accept boolean)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_msg messages%rowtype;
  v_conv conversations%rowtype;
  v_listing_status listing_status;
  v_new_status text := case when p_accept then 'acceptee' else 'refusee' end;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise' using errcode = '42501';
  end if;

  -- "for update" : deux réponses simultanées ne peuvent pas se croiser.
  select * into v_msg from messages where id = p_message_id for update;
  if not found or v_msg.offer_xof is null then
    raise exception 'Offre introuvable' using errcode = 'P0002';
  end if;

  select * into v_conv from conversations where id = v_msg.conversation_id;
  -- Seule l'AUTRE personne de la conversation répond (jamais celle qui a fait l'offre).
  if auth.uid() not in (v_conv.buyer_id, v_conv.seller_id) or auth.uid() = v_msg.sender_id then
    raise exception 'Tu ne peux pas répondre à cette offre' using errcode = '42501';
  end if;

  if v_msg.offer_status is distinct from 'proposee' then
    raise exception 'Cette offre a déjà reçu une réponse' using errcode = 'P0001';
  end if;

  select status into v_listing_status from listings where id = v_conv.listing_id;
  if p_accept and v_listing_status <> 'en_ligne' then
    raise exception 'Cet article n''est plus disponible' using errcode = 'P0001';
  end if;

  update messages set offer_status = v_new_status where id = p_message_id;
  return v_new_status;
end $$;

revoke all on function respond_to_offer(bigint, boolean) from public, anon;
grant execute on function respond_to_offer(bigint, boolean) to authenticated;
