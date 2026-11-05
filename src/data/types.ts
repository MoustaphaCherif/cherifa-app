// Types côté app, alignés sur supabase/migrations/0001_schema.sql

export type ItemCondition = 'neuf' | 'tres_bon' | 'bon' | 'satisfaisant';

export const conditionLabels: Record<ItemCondition, string> = {
  neuf: 'Neuf',
  tres_bon: 'Très bon état',
  bon: 'Bon état',
  satisfaisant: 'Satisfaisant',
};

export interface Category {
  id: string;
  label: string;
  requiresImei: boolean;
}

export interface Seller {
  id: string;
  displayName: string;
  verified: boolean;
  neighborhood: string;
}

export interface Listing {
  id: string;
  title: string;
  priceXof: number;
  categoryId: string;
  size?: string;
  condition: ItemCondition;
  neighborhood: string;
  seller: Seller;
  photoColor: string; // couleur de fond en attendant (ou derrière) la photo
  photoUrl?: string;
  imeiVerified?: boolean;
}
