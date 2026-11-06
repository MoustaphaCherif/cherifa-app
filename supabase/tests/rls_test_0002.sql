-- Tests de la migration 0002, à lancer APRÈS rls_test.sql (réutilise Awa, Fatou, l'annonce et l'offre de 5 000 F).
-- Awa = acheteuse (1111…), Fatou = vendeuse (2222…). Résultat attendu indiqué pour chaque cas.
\set ON_ERROR_STOP 0
reset role;
grant authenticated to app_user;
grant usage on schema storage to app_user; grant all on all tables in schema storage to app_user;
grant execute on function storage.foldername(text) to app_user;
set role app_user;

select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222', false);
\echo '--- 9. Fatou envoie une photo dans SON dossier (doit REUSSIR)'
insert into storage.objects (bucket_id, name) values ('photos','22222222-2222-2222-2222-222222222222/aaaaaaaa-0000-0000-0000-000000000001/0.jpg');
\echo '--- 10. Fatou envoie une photo dans le dossier d Awa (doit ECHOUER)'
insert into storage.objects (bucket_id, name) values ('photos','11111111-1111-1111-1111-111111111111/aaaaaaaa-0000-0000-0000-000000000001/0.jpg');
\echo '--- 11. Fatou lie sa photo a son annonce (doit REUSSIR)'
insert into listing_photos (listing_id, storage_path) values ('aaaaaaaa-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222/aaaaaaaa-0000-0000-0000-000000000001/0.jpg');
\echo '--- 12. Fatou lie une photo du dossier d Awa a son annonce (doit ECHOUER)'
insert into listing_photos (listing_id, storage_path) values ('aaaaaaaa-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111/aaaaaaaa-0000-0000-0000-000000000001/0.jpg');
\echo '--- 13. Fatou modifie directement le statut de l offre (0 ligne attendue)'
update messages set offer_status = 'acceptee';

select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111', false);
\echo '--- 14. Awa accepte sa propre offre via la fonction (doit ECHOUER)'
select respond_to_offer((select id from messages where offer_xof = 5000), true);

select set_config('request.jwt.claim.sub','', false);
\echo '--- 15. Visiteur non connecte repond a l offre (doit ECHOUER)'
select respond_to_offer((select min(id) from messages), true);

select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222', false);
\echo '--- 16. Fatou accepte l offre d Awa (doit REUSSIR : acceptee)'
select respond_to_offer((select id from messages where offer_xof = 5000), true);
\echo '--- 17. Fatou repond une deuxieme fois a la meme offre (doit ECHOUER)'
select respond_to_offer((select id from messages where offer_xof = 5000), false);
select offer_xof, offer_status from messages where offer_xof is not null;
