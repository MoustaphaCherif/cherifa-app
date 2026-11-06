// État partagé du MODE DÉMO : annonces, conversations et commandes en mémoire.
// Quand Supabase sera branché, chaque action ci-dessous deviendra un appel :
//  - addListing        → insert dans "listings" + upload des photos
//  - sendMessage/Offer → insert dans "messages"
//  - createOrder       → Edge Function qui crée la session Wave / Orange Money
//  - advance/confirm   → webhooks et Edge Functions (jamais depuis l'app : voir le schéma RLS)
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { buyerProtectionFee } from '../config/brand';
import { listings as demoListings } from './demo';
import type { Listing } from './types';
import { ME, ORDER_STEPS, StoreContext, type Conversation, type Message, type Order, type Store } from './model';

let counter = 0;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

const seedConversations: Conversation[] = [
  {
    id: 'c-demo',
    listingId: 'l1',
    messages: [
      { id: 'm1', from: 'me', body: 'Salam, la robe est toujours dispo ? Elle tombe comment ?' },
      { id: 'm2', from: 'seller', body: 'Waaw, toujours là. Elle tombe aux chevilles pour 1,65 m.' },
    ],
  },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(demoListings);
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [orders, setOrders] = useState<Order[]>([]);

  const pushMessage = useCallback((convId: string, m: Message) => {
    setConversations((cs) => cs.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, m] } : c)));
  }, []);

  const addListing: Store['addListing'] = useCallback((l) => {
    const id = newId('l');
    setListings((ls) => [{ ...l, id, seller: ME }, ...ls]);
    return id;
  }, []);

  const openConversation: Store['openConversation'] = useCallback(
    (listingId) => {
      const existing = conversations.find((c) => c.listingId === listingId);
      if (existing) return existing.id;
      const id = newId('c');
      setConversations((cs) => [...cs, { id, listingId, messages: [] }]);
      return id;
    },
    [conversations],
  );

  const sendMessage: Store['sendMessage'] = useCallback(
    (convId, body) => pushMessage(convId, { id: newId('m'), from: 'me', body }),
    [pushMessage],
  );

  const sendOffer: Store['sendOffer'] = useCallback(
    (convId, amountXof) => pushMessage(convId, { id: newId('m'), from: 'me', offerXof: amountXof, offerStatus: 'proposee' }),
    [pushMessage],
  );

  const simulateSellerReply: Store['simulateSellerReply'] = useCallback((convId, accept) => {
    setConversations((cs) =>
      cs.map((c) => {
        if (c.id !== convId) return c;
        const idx = c.messages.map((m) => m.offerStatus).lastIndexOf('proposee');
        if (idx < 0) return c;
        const messages = c.messages.map((m, i) => (i === idx ? { ...m, offerStatus: accept ? ('acceptee' as const) : ('refusee' as const) } : m));
        return { ...c, messages };
      }),
    );
  }, []);

  const createOrder: Store['createOrder'] = useCallback((o) => {
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

  const value = useMemo(
    () => ({ listings, conversations, orders, addListing, openConversation, sendMessage, sendOffer, simulateSellerReply, createOrder, advanceOrder, confirmOrder, reportProblem }),
    [listings, conversations, orders, addListing, openConversation, sendMessage, sendOffer, simulateSellerReply, createOrder, advanceOrder, confirmOrder, reportProblem],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
