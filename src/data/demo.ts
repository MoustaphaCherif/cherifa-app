// Données de démonstration, en attendant la connexion à Supabase.
// Les prix marqués 0 sont à compléter (pas de prix inventé pour les téléphones).
import type { Category, Listing, Seller } from './types';

export const categories: Category[] = [
  { id: 'mode', label: 'Mode', requiresImei: false },
  { id: 'telephones', label: 'Téléphones', requiresImei: true },
  { id: 'tenues-fete', label: 'Tenues de fête', requiresImei: false },
];

const fatou: Seller = { id: 's1', displayName: 'Fatou D.', verified: true, neighborhood: 'Mermoz' };
const moussa: Seller = { id: 's2', displayName: 'Moussa K.', verified: false, neighborhood: 'Ouakam' };

export const listings: Listing[] = [
  { id: 'l1', title: 'Robe wax longue', priceXof: 6000, categoryId: 'mode', size: 'M', condition: 'tres_bon', neighborhood: 'Mermoz', seller: fatou, photoColor: '#F1D9C8' },
  { id: 'l2', title: 'Baskets Nike Air', priceXof: 12500, categoryId: 'mode', size: '42', condition: 'bon', neighborhood: 'Ouakam', seller: moussa, photoColor: '#DCE3EC' },
  { id: 'l3', title: 'Sac à main cuir', priceXof: 4000, categoryId: 'mode', condition: 'tres_bon', neighborhood: 'Liberté 6', seller: fatou, photoColor: '#EFE3C9' },
  { id: 'l4', title: 'Chemise en lin', priceXof: 3000, categoryId: 'mode', size: 'L', condition: 'neuf', neighborhood: 'Point E', seller: moussa, photoColor: '#E4E9DD' },
  { id: 'l5', title: 'iPhone 11 · 64 Go', priceXof: 0, categoryId: 'telephones', condition: 'bon', neighborhood: 'Sacré-Cœur', seller: moussa, photoColor: '#DCE3EC', imeiVerified: true },
  { id: 'l6', title: 'Grand boubou bazin', priceXof: 0, categoryId: 'tenues-fete', size: 'L', condition: 'tres_bon', neighborhood: 'Mermoz', seller: fatou, photoColor: '#EFE3C9' },
];

export function findListing(id: string | undefined): Listing | undefined {
  return listings.find((l) => l.id === id);
}
