# Cherifa — marketplace d'occasion, Sénégal et Afrique de l'Ouest

Nom de l'app : **Cherifa**.
Le nom et les couleurs sont centralisés dans `src/config/brand.ts` et dans le manifeste de `vite.config.ts`.

## Lancer l'app

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # version de production (PWA installable)
npm run lint
```

Sans configuration, l'app tourne en **mode démo** avec des données fictives (`src/data/demo.ts`).
Pour la brancher sur Supabase : copier `.env.example` en `.env.local` et remplir l'URL et la clé `anon`
du projet Supabase (région Paris).

## Ce qui est fait

| Élément | État |
| --- | --- |
| PWA React + Vite + TypeScript, installable | Fait |
| Identité (couleurs, typographies, logo) reprise des maquettes | Fait |
| Écran Bienvenue (connexion par SMS via Supabase, +221 / +33) | Fait, testé en démo |
| Accueil (catégories, fil d'annonces) | Fait, données démo |
| Recherche (texte sans accents, catégorie, état, prix, vendeurs vérifiés) | Fait, données démo |
| Fiche article (prix, protection acheteur, vendeur vérifié) | Fait, données démo |
| Publier (photos, prix, catégorie, IMEI pour les téléphones, validation) | Fait, enregistré en mémoire (démo) |
| Messagerie et offres de prix (réponse du vendeur simulée) | Fait, démo |
| Paiement (moto / main propre, Wave / Orange Money, récapitulatif) | Écran fait, paiement réel à brancher |
| Suivi de commande (étapes, code de remise, confirmation, litige) | Fait, étapes simulées en démo |
| Sama armoire (mes annonces, mes achats, argent disponible) | Fait, démo |

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
- `supabase/tests/rls_test.sql` : 8 scénarios de fraude (se déclarer vérifié, marquer une annonce vendue,
  créer une commande « payée », accepter sa propre offre, laisser un faux avis…) qui doivent tous être refusés.
  À lancer après `auth_stub.sql` sur un PostgreSQL de test.

## Tests de l'app

`tests/parcours.e2e.mjs` vérifie 13 points dans un vrai navigateur, dont : la recherche sans accents,
le refus d'une offre supérieure au prix, l'application du prix d'une offre acceptée, le refus d'un prix
truqué dans l'adresse de la page, l'adresse obligatoire en livraison moto, l'impossibilité de confirmer
avant la livraison, et l'impossibilité d'acheter son propre article.
