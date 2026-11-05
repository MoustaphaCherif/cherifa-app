// Modèle de données partagé du mode démo (types, étapes de commande, contexte).
import { createContext, useContext } from 'react';
import type { Listing, Seller } from './types';

export const ME: Seller = { id: 'me', displayName: 'Moi', verified: false, neighborhood: 'Dakar' };

export interface Message {
  id: string;
  from: 'me' | 'seller';
  body?: string;
  offerXof?: number;
  offerStatus?: 'proposee' | 'acceptee' | 'refusee';
}

export interface Conversation {
  id: string;
  listingId: string;
  messages: Message[];
}

export type DeliveryMode = 'moto' | 'main_propre';
export type Provider = 'wave' | 'orange_money';

// Étapes dans l'ordre, alignées sur l'enum order_status du schéma.
export const ORDER_STEPS = ['payee', 'recuperee', 'en_route', 'livree', 'confirmee'] as const;
export type OrderStep = (typeof ORDER_STEPS)[number];

export interface Order {
  id: string;
  listingId: string;
  itemPriceXof: number;
  buyerFeeXof: number;
  deliveryFeeXof: number | null; // null = tarif livreur pas encore fixé
  mode: DeliveryMode;
  address?: string;
  provider: Provider;
  step: OrderStep;
  dispute: boolean;
  handoverCode: string; // en production : généré et vérifié côté serveur uniquement
}

export interface Store {
  listings: Listing[];
  conversations: Conversation[];
  orders: Order[];
  addListing: (l: Omit<Listing, 'id' | 'seller'>) => string;
  openConversation: (listingId: string) => string;
  sendMessage: (convId: string, body: string) => void;
  sendOffer: (convId: string, amountXof: number) => void;
  simulateSellerReply: (convId: string, accept: boolean) => void;
  createOrder: (o: Omit<Order, 'id' | 'step' | 'dispute' | 'handoverCode' | 'buyerFeeXof'>) => string;
  advanceOrder: (orderId: string) => void;
  confirmOrder: (orderId: string) => void;
  reportProblem: (orderId: string) => void;
}

export const StoreContext = createContext<Store | null>(null);

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore doit être utilisé dans <StoreProvider>');
  return s;
}
