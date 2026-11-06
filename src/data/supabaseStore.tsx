// Store BRANCHÉ SUR SUPABASE : comptes par SMS, vraies annonces, photos, messagerie en temps réel.
// Même interface que demoStore.tsx, pour que les écrans n'aient pas à savoir lequel tourne.
//
// Rappel des règles de sécurité (CLAUDE.md) : l'app ne fait que lire, publier ses annonces
// et envoyer des messages. Tout ce qui touche à l'argent passe par le serveur :
//  - accepter / refuser une offre → fonction SQL respond_to_offer (migration 0002)
//  - créer une commande et payer   → Edge Function, étape 2 (après la SUARL)
import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { compressPhoto } from '../lib/photos';
import { supabase as client } from '../lib/supabase';
import type { Category, ItemCondition, Listing, Seller } from './types';
import { StoreContext, type AuthState, type Conversation, type Store } from './model';

const supabase = client!; // ce store n'est utilisé que si le client existe (voir store.tsx)

// --- Lignes renvoyées par Supabase (seulement les colonnes demandées) -------------------
interface ProfileRow { id: string; display_name: string; is_verified_seller: boolean; neighborhood: string | null }
interface CategoryRow { id: string; label_fr: string; requires_imei: boolean; parent_id: string | null }
interface ListingRow {
  id: string; title: string; price_xof: number; category_id: string; size: string | null;
  condition: ItemCondition; neighborhood: string | null; imei_verified: boolean;
  seller: ProfileRow | null; listing_photos: { storage_path: string; position: number }[];
}
interface MessageRow { id: number; sender_id: string; body: string | null; offer_xof: number | null; offer_status: 'proposee' | 'acceptee' | 'refusee' | null }
interface ConversationRow {
  id: string; listing_id: string; buyer_id: string; seller_id: string;
  buyer: { display_name: string } | null; seller: { display_name: string } | null; messages: MessageRow[];
}

const LISTING_COLUMNS = `id, title, price_xof, category_id, size, condition, neighborhood, imei_verified,
  seller:profiles!listings_seller_id_fkey(id, display_name, is_verified_seller, neighborhood),
  listing_photos(storage_path, position)`;

const toSeller = (p: ProfileRow): Seller => ({
  id: p.id, displayName: p.display_name, verified: p.is_verified_seller, neighborhood: p.neighborhood ?? 'Dakar',
});

function toListing(r: ListingRow): Listing {
  const first = [...r.listing_photos].sort((a, b) => a.position - b.position)[0];
  return {
    id: r.id, title: r.title, priceXof: r.price_xof, categoryId: r.category_id, size: r.size ?? undefined,
    condition: r.condition, neighborhood: r.neighborhood ?? 'Dakar',
    seller: r.seller ? toSeller(r.seller) : { id: '', displayName: 'Vendeur', verified: false, neighborhood: 'Dakar' },
    photoColor: '#E9DFD0',
    photoUrl: first ? supabase.storage.from('photos').getPublicUrl(first.storage_path).data.publicUrl : undefined,
    imeiVerified: r.category_id === 'telephones' ? r.imei_verified : undefined,
  };
}

// Traduit les erreurs techniques en phrases compréhensibles.
function fail(context: string, error: { message?: string; code?: string } | null): never {
  console.error(context, error);
  if (error?.code === '42501') throw new Error("Tu n'as pas le droit de faire ça.");
  // Erreurs levées volontairement par nos fonctions SQL (messages déjà en français).
  if (error?.code === 'P0001' || error?.code === 'P0002') throw new Error(error.message);
  throw new Error(`${context} Vérifie ta connexion et réessaie.`);
}

// Chaque donnée chargée garde l'id du compte pour lequel elle a été chargée :
// après une déconnexion ou un changement de compte, l'ancienne n'est jamais affichée.
interface ForUser<T> { uid: string; value: T }

export function SupabaseStoreProvider({ children }: { children: ReactNode }) {
  // undefined = on ne sait pas encore s'il y a une session (premier chargement).
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [profile, setProfile] = useState<ForUser<Seller | null> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [convs, setConvs] = useState<ForUser<Conversation[]> | null>(null);
  const uid = session?.user.id ?? null;
  const listingsRef = useRef(listings);
  useEffect(() => { listingsRef.current = listings; }, [listings]);

  // État de connexion et données, déduits à chaque affichage.
  const profileLoaded = !!uid && profile?.uid === uid;
  const me = profileLoaded ? profile.value : null;
  const auth: AuthState = session === undefined ? 'chargement'
    : !uid ? 'deconnecte'
    : !profileLoaded ? 'chargement'
    : me ? 'connecte' : 'sans_profil';
  const conversations = useMemo(() => (uid && convs?.uid === uid ? convs.value : []), [uid, convs]);

  // --- Session : au démarrage, puis à chaque connexion / déconnexion ----------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // --- Profil de la personne connectée -------------------------------------------------------
  useEffect(() => {
    if (!uid) return;
    supabase.from('profiles').select('id, display_name, is_verified_seller, neighborhood').eq('id', uid).maybeSingle()
      .then(({ data, error }) => {
        if (error) return console.error(error);
        setProfile({ uid, value: data ? toSeller(data as ProfileRow) : null });
      });
  }, [uid]);

  // --- Catégories actives (lisibles même sans compte) ----------------------------------------
  useEffect(() => {
    supabase.from('categories').select('id, label_fr, requires_imei, parent_id').order('id').then(({ data, error }) => {
      if (error) return console.error(error);
      const rows = (data ?? []) as CategoryRow[];
      // Les catégories principales d'abord, puis leurs sous-catégories.
      rows.sort((a, b) => Number(!!a.parent_id) - Number(!!b.parent_id));
      setCategories(rows.map((c) => ({ id: c.id, label: c.label_fr, requiresImei: c.requires_imei, parentId: c.parent_id ?? undefined })));
    });
  }, []);

  // --- Annonces : celles en ligne + les miennes (tous statuts) --------------------------------
  const loadListings = useCallback(async () => {
    let query = supabase.from('listings').select(LISTING_COLUMNS).order('created_at', { ascending: false }).limit(200);
    query = uid ? query.or(`status.in.(en_ligne,reserve),seller_id.eq.${uid}`) : query.in('status', ['en_ligne', 'reserve']);
    const { data, error } = await query;
    if (error) return console.error(error);
    setListings(((data ?? []) as unknown as ListingRow[]).map(toListing));
  }, [uid]);

  useEffect(() => { void Promise.resolve().then(loadListings); }, [loadListings]);

  // --- Conversations et messages ---------------------------------------------------------------
  const loadConversations = useCallback(async () => {
    if (!uid) return;
    const { data, error } = await supabase.from('conversations')
      .select(`id, listing_id, buyer_id, seller_id,
        buyer:profiles!conversations_buyer_id_fkey(display_name),
        seller:profiles!conversations_seller_id_fkey(display_name),
        messages(id, sender_id, body, offer_xof, offer_status)`)
      .order('created_at', { ascending: false })
      .order('id', { referencedTable: 'messages', ascending: true });
    if (error) return console.error(error);
    const rows = (data ?? []) as unknown as ConversationRow[];
    setConvs({ uid, value: rows.map((c) => ({
      id: c.id,
      listingId: c.listing_id,
      otherName: (c.buyer_id === uid ? c.seller?.display_name : c.buyer?.display_name) ?? 'Membre',
      messages: c.messages.map((m) => ({
        id: String(m.id), from: m.sender_id === uid ? 'me' : 'other', body: m.body ?? undefined,
        offerXof: m.offer_xof ?? undefined, offerStatus: m.offer_status ?? undefined,
      })),
    })) });

    // Une annonce vendue ou retirée n'est plus dans le fil : on la charge pour garder la conversation lisible.
    const known = new Set(listingsRef.current.map((l) => l.id));
    const missing = [...new Set(rows.map((c) => c.listing_id))].filter((id) => !known.has(id));
    if (missing.length > 0) {
      const res = await supabase.from('listings').select(LISTING_COLUMNS).in('id', missing);
      if (!res.error) setListings((ls) => [...ls, ...((res.data ?? []) as unknown as ListingRow[]).map(toListing)]);
    }
  }, [uid]);

  useEffect(() => { void Promise.resolve().then(loadConversations); }, [loadConversations]);

  // Temps réel : à chaque message (ou réponse à une offre) qui me concerne, on recharge.
  // Supabase Realtime applique les règles RLS : on ne reçoit que ses propres conversations.
  useEffect(() => {
    if (!uid) return;
    const channel = supabase.channel(`messagerie-${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => { loadConversations(); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, () => { loadConversations(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [uid, loadConversations]);

  // --- Actions ------------------------------------------------------------------------------------
  const requireUid = useCallback(() => {
    if (!uid) throw new Error('Connecte-toi pour continuer.');
    return uid;
  }, [uid]);

  const createProfile: Store['createProfile'] = useCallback(async (displayName, neighborhood) => {
    const id = requireUid();
    const { data, error } = await supabase.from('profiles')
      .insert({ id, display_name: displayName, neighborhood })
      .select('id, display_name, is_verified_seller, neighborhood').single();
    if (error) fail("Ton profil n'a pas pu être créé.", error);
    setProfile({ uid: id, value: toSeller(data as ProfileRow) });
  }, [requireUid]);

  const signOut: Store['signOut'] = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const addListing: Store['addListing'] = useCallback(async ({ photos, imei, ...l }) => {
    const sellerId = requireUid();
    // 1. Compression d'abord : si une photo est illisible, on n'a encore rien créé.
    const blobs = await Promise.all(photos.map(compressPhoto));

    // 2. Annonce en brouillon (invisible pour les autres tant que les photos ne sont pas là).
    const { data, error } = await supabase.from('listings').insert({
      seller_id: sellerId, category_id: l.categoryId, title: l.title, price_xof: l.priceXof,
      size: l.size ?? null, condition: l.condition, neighborhood: me?.neighborhood ?? null,
      imei: imei ?? null, status: 'brouillon',
    }).select('id').single();
    if (error) fail("L'annonce n'a pas pu être créée.", error);
    const listingId = (data as { id: string }).id;

    // 3. Photos dans le dossier <mon id>/<id annonce>/ (seul chemin autorisé par le stockage).
    for (const [i, blob] of blobs.entries()) {
      const path = `${sellerId}/${listingId}/${i}.jpg`;
      const up = await supabase.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' });
      if (up.error) fail("Une photo n'a pas pu être envoyée. Ton annonce est gardée en brouillon.", up.error);
      const row = await supabase.from('listing_photos').insert({ listing_id: listingId, storage_path: path, position: i });
      if (row.error) fail("Une photo n'a pas pu être enregistrée. Ton annonce est gardée en brouillon.", row.error);
    }

    // 4. Tout est prêt : on met en ligne.
    const pub = await supabase.from('listings').update({ status: 'en_ligne' }).eq('id', listingId);
    if (pub.error) fail("L'annonce n'a pas pu être mise en ligne. Elle est gardée en brouillon.", pub.error);
    await loadListings();
    return listingId;
  }, [requireUid, me, loadListings]);

  const openConversation: Store['openConversation'] = useCallback(async (listingId) => {
    const buyerId = requireUid();
    const listing = listingsRef.current.find((l) => l.id === listingId);
    if (!listing) throw new Error('Article introuvable.');
    const existing = conversations.find((c) => c.listingId === listingId);
    if (existing) return existing.id;

    const { data, error } = await supabase.from('conversations')
      .insert({ listing_id: listingId, buyer_id: buyerId, seller_id: listing.seller.id }).select('id').single();
    let id = (data as { id: string } | null)?.id;
    if (error?.code === '23505') {
      // Déjà ouverte (par exemple sur un autre téléphone) : on la reprend.
      const res = await supabase.from('conversations').select('id').eq('listing_id', listingId).eq('buyer_id', buyerId).single();
      id = (res.data as { id: string } | null)?.id;
    } else if (error) {
      fail("La conversation n'a pas pu être ouverte.", error);
    }
    if (!id) throw new Error("La conversation n'a pas pu être ouverte.");
    await loadConversations();
    return id;
  }, [requireUid, conversations, loadConversations]);

  const sendMessage: Store['sendMessage'] = useCallback(async (convId, body) => {
    const { error } = await supabase.from('messages').insert({ conversation_id: convId, sender_id: requireUid(), body });
    if (error) fail("Le message n'est pas parti.", error);
    await loadConversations();
  }, [requireUid, loadConversations]);

  const sendOffer: Store['sendOffer'] = useCallback(async (convId, amountXof) => {
    const { error } = await supabase.from('messages')
      .insert({ conversation_id: convId, sender_id: requireUid(), offer_xof: amountXof, offer_status: 'proposee' });
    if (error) fail("L'offre n'est pas partie.", error);
    await loadConversations();
  }, [requireUid, loadConversations]);

  const respondToOffer: Store['respondToOffer'] = useCallback(async (_convId, messageId, accept) => {
    const { error } = await supabase.rpc('respond_to_offer', { p_message_id: Number(messageId), p_accept: accept });
    if (error) fail("La réponse n'a pas pu être envoyée.", error);
    await loadConversations();
  }, [loadConversations]);

  // Étape 2 du plan : Edge Function qui crée la session Wave / Orange Money.
  const createOrder: Store['createOrder'] = useCallback(async () => {
    throw new Error('Le paiement en ligne arrive bientôt. Pour l’instant, discute avec le vendeur dans la messagerie.');
  }, []);
  const notInProduction = useCallback(() => {}, []);

  const value = useMemo<Store>(() => ({
    isDemo: false, auth, me, categories, listings, conversations, orders: [],
    createProfile, signOut, addListing, openConversation, sendMessage, sendOffer, respondToOffer, createOrder,
    advanceOrder: notInProduction, confirmOrder: notInProduction, reportProblem: notInProduction,
  }), [auth, me, categories, listings, conversations, createProfile, signOut, addListing, openConversation,
    sendMessage, sendOffer, respondToOffer, createOrder, notInProduction]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
