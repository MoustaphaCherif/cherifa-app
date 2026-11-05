\set ON_ERROR_STOP 0
create role app_user; grant usage on schema public, auth to app_user;
grant all on all tables in schema public to app_user; grant execute on function auth.uid() to app_user;
insert into auth.users values ('11111111-1111-1111-1111-111111111111'),('22222222-2222-2222-2222-222222222222');
insert into profiles (id, display_name) values ('11111111-1111-1111-1111-111111111111','Awa'),('22222222-2222-2222-2222-222222222222','Fatou');
insert into listings (id, seller_id, category_id, title, price_xof, condition) values ('aaaaaaaa-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','mode-femme','Robe wax',6000,'tres_bon');
set role app_user;
select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222', false);
\echo '--- 1. Vendeuse se declare verifiee (doit ECHOUER)'
update profiles set is_verified_seller = true where id = auth.uid();
select is_verified_seller as verifiee from profiles where id = auth.uid();
\echo '--- 2. Vendeuse marque son annonce vendue (doit ECHOUER)'
update listings set status = 'vendu' where id = 'aaaaaaaa-0000-0000-0000-000000000001';
\echo '--- 3. Vendeuse modifie son prix (doit REUSSIR)'
update listings set price_xof = 5500 where id = 'aaaaaaaa-0000-0000-0000-000000000001';
select price_xof from listings;
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111', false);
\echo '--- 4. Acheteuse cree une commande payee elle-meme (doit ECHOUER)'
insert into orders (listing_id, buyer_id, seller_id, item_price_xof, buyer_fee_xof, delivery_mode, status) values ('aaaaaaaa-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222',1,0,'main_propre','payee');
\echo '--- 5. Acheteuse modifie le prix de l annonce d une autre (0 ligne attendue)'
update listings set price_xof = 100 where id = 'aaaaaaaa-0000-0000-0000-000000000001';
\echo '--- 6. Acheteuse ouvre une conversation et fait une offre (doit REUSSIR)'
insert into conversations (id, listing_id, buyer_id, seller_id) values ('cccccccc-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222');
insert into messages (conversation_id, sender_id, offer_xof, offer_status) values ('cccccccc-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',5000,'proposee');
\echo '--- 7. Acheteuse accepte elle-meme l offre (doit ECHOUER)'
insert into messages (conversation_id, sender_id, offer_xof, offer_status) values ('cccccccc-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',100,'acceptee');
\echo '--- 8. Acheteuse laisse un avis sans commande confirmee (doit ECHOUER)'
insert into reviews (order_id, author_id, target_id, rating) values (gen_random_uuid(),'11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222',1);
