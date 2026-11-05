// Identité de la marque : TOUT ce qui dépend du nom de l'app est ici.
// Le nom définitif n'est pas encore choisi (pistes : Troki, Bazaro, Revendi, Kalabas).
// Changer le nom = modifier ce fichier (et le "name" du manifeste dans vite.config.ts).

export const brand = {
  name: 'Jënd Jaay',
  shortName: 'JendJaay',
  tagline: 'Vends en 1 minute. Garde 100 %. Achète sans risque.',
  colors: {
    terracotta: '#B9491F',
    pirogue: '#14396B',
    soleil: '#E9A23B',
    sable: '#F6EFE4',
    encre: '#1E1A16',
  },
} as const;

// Frais acheteur (hypothèse du business plan) : 5 % du prix + 100 FCFA.
export const BUYER_FEE_RATE = 0.05;
export const BUYER_FEE_FIXED = 100;

// Prix d'une course moto dans Dakar : à fixer avec les livreurs partenaires.
// Tant qu'il vaut null, l'app affiche « à confirmer » au lieu d'un faux prix.
export const DELIVERY_FEE_DAKAR_XOF: number | null = null;

export function buyerProtectionFee(priceXof: number): number {
  return Math.round(priceXof * BUYER_FEE_RATE + BUYER_FEE_FIXED);
}

export function formatXof(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} F`;
}

export function priceLabel(priceXof: number): string {
  return priceXof > 0 ? formatXof(priceXof) : 'Prix à venir';
}
