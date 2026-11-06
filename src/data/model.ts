// Modèle de données partagé par les deux stores (démo en mémoire et Supabase) :
// types, étapes de commande, contexte React.
import { createContext, useContext } from 'react';
import type { Category, ItemCondition, Listing, Seller } from './types';

export interface Message {
  id: string;
  from: 'me' | 'other'; // 'other' = l'autre personne de la conversation
  body?: string;
  offerXof?: number;
  offerStatus?: 'proposee' | 'acceptee' | 'refusee';
}

export interface Conversation {
  id: string;
  listingId: string;
  otherName: string; // nom affiché de l'autre personne (vendeur ou acheteur)
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

export interface NewListing {
  title: string;
  priceXof: number;
  categoryId: string;
  size?: string;
  condition: ItemCondition;
  imei?: string; // téléphones : vérifié ensuite côté serveur
  photos: File[];
}

// État de connexion :
//  - demo        : pas de .env.local, données fictives, pas de compte
//  - chargement  : on vérifie s'il y a une session Supabase
//  - deconnecte  : personne n'est connecté
//  - sans_profil : code SMS validé, mais prénom et quartier pas encore donnés
//  - connecte    : compte et profil prêts
export type AuthState = 'demo' | 'chargement' | 'deconnecte' | 'sans_profil' | 'connecte';

export interface Store {
  isDemo: boolean;
  auth: AuthState;
  me: Seller | null;
  categories: Category[];
  listings: Listing[];
  conversations: Conversation[];
  orders: Order[];
  // Les actions renvoient une promesse : avec Supabase, elles passent par le réseau.
  // En cas d'échec, elles lèvent une Error dont le message s'affiche tel quel.
  createProfile: (displayName: string, neighborhood: string) => Promise<void>;
  signOut: () => Promise<void>;
  addListing: (l: NewListing) => Promise<string>;
  openConversation: (listingId: string) => Promise<string>;
  sendMessage: (convId: string, body: string) => Promise<void>;
  sendOffer: (convId: string, amountXof: number) => Promise<void>;
  respondToOffer: (convId: string, messageId: string, accept: boolean) => Promise<void>;
  createOrder: (o: Omit<Order, 'id' | 'step' | 'dispute' | 'handoverCode' | 'buyerFeeXof'>) => Promise<string>;
  // Simulation du mode démo uniquement (en production : webhooks et Edge Functions).
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

// Un article de « Femme » apparaît aussi quand on choisit la catégorie « Mode ».
export function inCategory(listing: Listing, categoryId: string, categories: Category[]): boolean {
  if (listing.categoryId === categoryId) return true;
  return categories.find((c) => c.id === listing.categoryId)?.parentId === categoryId;
}

// Message d'erreur lisible, quelle que soit la forme de l'erreur reçue.
export function errorText(e: unknown): string {
  return e instanceof Error && e.message ? e.message : 'Une erreur est survenue. Réessaie dans un instant.';
}
