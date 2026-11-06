# Cherifa — marketplace d'occasion, Sénégal et Afrique de l'Ouest

Nom de l'app : **Cherifa**.
Business plan et plan de construction : voir le dossier [`docs/`](docs/).
Le nom et les couleurs sont centralisés dans `src/config/brand.ts` et dans le manifeste de `vite.config.ts`.

## Lancer l'app

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # version de production (PWA installable)
npm run lint
```

Sans configuration, l'app tourne en **mode démo** avec des données fictives (`src/data/demo.ts`).
Pour la brancher sur Supabase, suivre le guide [`docs/supabase.md`](docs/supabase.md) (projet en région Paris,
schéma, SMS, puis `.env.local`). L'app choisit seule son mode : `src/data/store.tsx` charge
`demoStore.tsx` (en mémoire) ou `supabaseStore.tsx` (vraies données), qui ont la même interface.

## Ce qui est fait

| Élément | État |
| --- | --- |
| PWA React + Vite + TypeScript, installable | Fait |
| Identité (couleurs, typographies, logo) reprise des maquettes | Fait |
| Connexion par SMS (+221 / +33), saisie du code, création du profil | Fait, branché sur Supabase |
| Accueil (catégories, fil d'annonces) | Fait, branché sur Supabase |
| Recherche (texte sans accents, catégorie, état, prix, vendeurs vérifiés) | Fait, branché sur Supabase |
| Fiche article (prix, protection acheteur, vendeur vérifié) | Fait, branché sur Supabase |
| Publier (photos compressées, prix, catégorie, IMEI pour les téléphones) | Fait, branché sur Supabase (photos dans Storage) |
| Messagerie et offres de prix, en temps réel ; le vendeur accepte ou refuse | Fait, branché sur Supabase |
| Paiement (moto / main propre, Wave / Orange Money, récapitulatif) | Écran fait, paiement réel à brancher |
| Suivi de commande (étapes, code de remise, confirmation, litige) | Fait en démo ; réel avec le paiement |
| Sama armoire (mes annonces, mes achats, déconnexion) | Fait, branché sur Supabase |

En mode démo, tout le parcours marche de bout en bout : chercher → négocier → payer → suivre → confirmer,
et publier un article qui apparaît dans l'armoire. Les données sont en mémoire (`src/data/store.tsx`)
et disparaissent au rechargement de la page.

Le prix de la livraison moto n'est pas encore fixé : `DELIVERY_FEE_DAKAR_XOF` dans `src/config/brand.ts`
vaut `null`, et l'app affiche « À confirmer » plutôt qu'un faux prix.
| Schéma de base de données + règles de sécurité RLS | Fait et testé (`supabase/`) |
| Paiement Wave / Orange Money + séquestre (Edge Functions) | À faire, après création de la SUARL |

## Base de données

- `supabase/migrations/0001_schema.sql` : tables (profils, catégories, annonces, photos, commandes,
  paiements, versements, journal, messagerie, avis) et règles de sécurité.
- Principe : **tout ce qui touche à l'argent** (statut des commandes, séquestre, versements, validation IMEI,
  badge vendeur vérifié) ne peut être écrit que côté serveur, jamais depuis l'app.
- `supabase/migrations/0002_photos_temps_reel_offres.sql` : bucket `photos` (chacun écrit dans son dossier),
  temps réel sur la messagerie, fonction serveur `respond_to_offer` pour accepter ou refuser une offre.
- `supabase/tests/` : 17 scénarios sur un PostgreSQL de test. Ordre : `auth_stub.sql`, `storage_stub.sql`,
  les deux migrations, puis `rls_test.sql` (8 fraudes : se déclarer vérifié, marquer vendu, commande « payée »,
  accepter sa propre offre, faux avis…) et `rls_test_0002.sql` (photo dans le dossier d'un autre, réponse à sa
  propre offre, double réponse…). Chaque cas affiche le résultat attendu.

## Tests de l'app

`tests/parcours.e2e.mjs` vérifie 13 points dans un vrai navigateur, dont : la recherche sans accents,
le refus d'une offre supérieure au prix, l'application du prix d'une offre acceptée, le refus d'un prix
truqué dans l'adresse de la page, l'adresse obligatoire en livraison moto, l'impossibilité de confirmer
avant la livraison, et l'impossibilité d'acheter son propre article.
