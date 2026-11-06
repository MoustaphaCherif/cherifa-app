// Store du MODE DÉMO : annonces, conversations et commandes en mémoire.
// Utilisé quand .env.local n'existe pas. Même interface que supabaseStore.tsx.
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { buyerProtectionFee } from '../config/brand';
import { categories, listings as demoListings } from './demo';
import type { Listing, Seller } from './types';
import { ORDER_STEPS, StoreContext, type Conversation, type Message, type Order, type Store } from './model';

const ME: Seller = { id: 'me', displayName: 'Moi', verified: false, neighborhood: 'Dakar' };

let counter = 0;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

const seedConversations: Conversation[] = [
  {
    id: 'c-demo',
    listingId: 'l1',
    otherName: 'Fatou D.',
    messages: [
      { id: 'm1', from: 'me', body: 'Salam, la robe est toujours dispo ? Elle tombe comment ?' },
      { id: 'm2', from: 'other', body: 'Waaw, toujours là. Elle tombe aux chevilles pour 1,65 m.' },
    ],
  },
];

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(demoListings);
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [orders, setOrders] = useState<Order[]>([]);

  const pushMessage = useCallback((convId: string, m: Message) => {
    setConversations((cs) => cs.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, m] } : c)));
  }, []);

  const noop = useCallback(async () => {}, []);

  const addListing: Store['addListing'] = useCallback(async ({ photos, imei, ...l }) => {
    const id = newId('l');
    const listing: Listing = {
      ...l, id, seller: ME, neighborhood: ME.neighborhood, photoColor: '#E9DFD0',
      photoUrl: photos[0] ? URL.createObjectURL(photos[0]) : undefined,
      imeiVerified: imei ? false : undefined, // la vérification IMEI se fait côté serveur
    };
    setListings((ls) => [listing, ...ls]);
    return id;
  }, []);

  const openConversation: Store['openConversation'] = useCallback(
    async (listingId) => {
      const existing = conversations.find((c) => c.listingId === listingId);
      if (existing) return existing.id;
      const id = newId('c');
      const otherName = listings.find((l) => l.id === listingId)?.seller.displayName ?? 'Vendeur';
      setConversations((cs) => [...cs, { id, listingId, otherName, messages: [] }]);
      return id;
    },
    [conversations, listings],
  );

  const sendMessage: Store['sendMessage'] = useCallback(
    async (convId, body) => pushMessage(convId, { id: newId('m'), from: 'me', body }),
    [pushMessage],
  );

  const sendOffer: Store['sendOffer'] = useCallback(
    async (convId, amountXof) => pushMessage(convId, { id: newId('m'), from: 'me', offerXof: amountXof, offerStatus: 'proposee' }),
    [pushMessage],
  );

  // En démo, on simule la réponse du vendeur à NOTRE offre (il n'y a pas d'autre personne).
  const respondToOffer: Store['respondToOffer'] = useCallback(async (convId, messageId, accept) => {
    setConversations((cs) =>
      cs.map((c) => (c.id !== convId ? c : {
        ...c,
        messages: c.messages.map((m) => (m.id === messageId && m.offerStatus === 'proposee' ? { ...m, offerStatus: accept ? 'acceptee' : 'refusee' } : m)),
      })),
    );
  }, []);

  const createOrder: Store['createOrder'] = useCallback(async (o) => {
    const id = newId('o');
    const handoverCode = String(Math.floor(1000 + Math.random() * 9000));
    setOrders((os) => [...os, { ...o, id, step: 'payee', dispute: false, handoverCode, buyerFeeXof: buyerProtectionFee(o.itemPriceXof) }]);
    return id;
  }, []);

  const advanceOrder: Store['advanceOrder'] = useCallback((orderId) => {
    setOrders((os) =>
      os.map((o) => {
        if (o.id !== orderId) return o;
        const i = ORDER_STEPS.indexOf(o.step);
        // On ne passe jamais à "confirmee" par simulation : seul l'acheteur confirme.
        return i < ORDER_STEPS.indexOf('livree') ? { ...o, step: ORDER_STEPS[i + 1] } : o;
      }),
    );
  }, []);

  const confirmOrder: Store['confirmOrder'] = useCallback((orderId) => {
    setOrders((os) => os.map((o) => (o.id === orderId && o.step === 'livree' && !o.dispute ? { ...o, step: 'confirmee' } : o)));
  }, []);

  const reportProblem: Store['reportProblem'] = useCallback((orderId) => {
    setOrders((os) => os.map((o) => (o.id === orderId && o.step !== 'confirmee' ? { ...o, dispute: true } : o)));
  }, []);

  const value = useMemo<Store>(
    () => ({
      isDemo: true, auth: 'demo', me: ME, categories, listings, conversations, orders,
      createProfile: noop, signOut: noop, addListing, openConversation, sendMessage, sendOffer, respondToOffer,
      createOrder, advanceOrder, confirmOrder, reportProblem,
    }),
    [listings, conversations, orders, noop, addListing, openConversation, sendMessage, sendOffer, respondToOffer, createOrder, advanceOrder, confirmOrder, reportProblem],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
