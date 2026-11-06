# Cherifa — instructions pour Claude

Lis ce fichier en entier avant de travailler sur le projet. Il résume les décisions déjà prises :
ne les remets pas en cause sans que Cherif (le porteur du projet) le demande.

## Le projet

Cherifa est une marketplace d'occasion entre particuliers (modèle type Vinted) pour le Sénégal,
puis l'Afrique de l'Ouest francophone. Promesse : « Vends en 1 minute. Garde 100 %. Achète sans risque. »

- **Langue** : tout (code commenté, interface, échanges) en français. Mots wolof dans l'interface
  (« Jaay » = vendre, « Sama armoire » = mon profil) ; les textes wolof doivent être relus par un locuteur natif.
- **Cibles** : vendeuses de statut WhatsApp, étudiantes de Dakar, familles, diaspora.
- **Catégories au lancement** : mode (dont tenues de fête) et téléphones (IMEI obligatoire, 15 chiffres).
  Les autres catégories s'ouvrent une par une. Voitures et immobilier exclus.
- **Concurrent principal** : Maket (vrai modèle Vinted, prend 25 % au vendeur). Notre différence :
  vendre est gratuit, l'acheteur paie une protection de 5 % + 100 FCFA.

Documents de référence : `docs/business-plan.md` et `docs/plan-de-construction.md`.

## Décisions techniques

| Sujet | Décision |
| --- | --- |
| App | PWA React + Vite + TypeScript, mobile d'abord (largeur max 480 px), légère pour la 3G |
| Base de données et comptes | Supabase, **région Paris** ; connexion par code SMS (+221 et +33), sans e-mail |
| Hébergement du site | Cloudflare Pages ; photos sur Supabase Storage ou Cloudflare R2 avec CDN |
| Paiement | Wave et Orange Money avec **séquestre** (argent bloqué jusqu'à confirmation de réception ou 48 h) |
| Monnaie | FCFA (XOF), affichage via `formatXof` |
| Marque | Nom, couleurs, frais : **uniquement** dans `src/config/brand.ts` (+ manifeste dans `vite.config.ts`) |

Couleurs : terre cuite `#B9491F` (actions), bleu pirogue `#14396B` (confiance, paiement), soleil `#E9A23B`
(badges), sable `#F6EFE4` (fond), encre `#1E1A16`. Polices : Bricolage Grotesque (titres), Nunito Sans (texte).

## Règles de sécurité à ne jamais casser

1. **Tout ce qui touche à l'argent s'écrit côté serveur uniquement** (Edge Functions avec la clé
   service_role, déclenchées par les webhooks Wave / Orange Money) : statut des commandes, séquestre,
   versements, validation IMEI, badge « vendeur vérifié », acceptation d'une offre. Jamais depuis l'app.
2. Les règles RLS de `supabase/migrations/0001_schema.sql` refusent tout par défaut. Toute nouvelle
   table active le RLS. Toute modification du schéma passe par une **nouvelle** migration numérotée.
3. Un prix venant de l'URL ou du client n'est jamais cru : le serveur recalcule (prix de l'annonce
   ou offre réellement acceptée).
4. Le code de remise à 4 chiffres est généré et vérifié côté serveur ; seul son hash est stocké.
5. La clé `anon` de Supabase est publique par conception ; aucun autre secret dans le code ni dans Git
   (`.env.local` n'est jamais commité).
6. Pas de prix inventé : le tarif de livraison moto (`DELIVERY_FEE_DAKAR_XOF`) vaut `null` tant qu'il
   n'est pas fixé avec les livreurs, et l'app affiche « À confirmer ».

## Lancer et vérifier

```bash
npm install
npm run dev      # http://localhost:5173 (mode démo sans .env.local)
npm run build    # doit passer sans erreur
npm run lint     # doit passer sans avertissement
```

- Test de bout en bout : `npm run build && npx vite preview --port 4173`, puis
  `node tests/parcours.e2e.mjs <dossier contenant photo.png>` (13 vérifications, voir le README).
- Test de sécurité du schéma, sur un PostgreSQL de test : `auth_stub.sql`, `storage_stub.sql`, les migrations
  dans l'ordre, puis `rls_test.sql` et `rls_test_0002.sql` ; 17 cas, résultat attendu affiché pour chacun.
- Avant chaque commit : build + lint OK. Après un changement d'écran, relancer le test de bout en bout.

## Organisation du code

- `src/screens/` : un fichier par écran (Bienvenue, Accueil, Recherche, Article, Publier, Messages,
  Conversation, Paiement, Suivi, Armoire).
- `src/data/model.ts` : types, interface `Store` et contexte. `src/data/store.tsx` choisit entre
  `demoStore.tsx` (mémoire, sans `.env.local`) et `supabaseStore.tsx` (vraies données). Les deux stores ont
  la même interface : un écran ne doit jamais tester le mode, sauf pour afficher une aide « mode démo » (`isDemo`).
- `src/lib/supabase.ts` : client Supabase ; `isDemoMode` vaut `true` sans `.env.local`.
- `src/lib/photos.ts` : compression des photos (1280 px, JPEG) avant l'envoi.
- Pages réservées aux comptes : composant `Connecte` dans `src/App.tsx` (redirige vers `/` ou `/profil`).
- Accessibilité : vrais `<button>`, `<label>` sur chaque champ, `aria-label` sur les boutons-icônes,
  zones tactiles d'au moins 44 px.

## Où en est le projet (6 novembre 2026)

Fait : les 9 écrans, parcours complet en mode démo (chercher → offre → payer → suivre → confirmer,
publier), schéma Supabase sécurisé et testé, nom Cherifa.

Étape 1 (code) faite : l'app est branchée sur Supabase quand `.env.local` est rempli. Connexion SMS
(`/code`, `/profil`), annonces et photos réelles, messagerie temps réel, réponse aux offres côté serveur
(migration 0002). Elle n'a pas encore tourné contre un vrai projet : à valider avec `docs/supabase.md`
dès que le projet existe. En mode Supabase, « Payer » affiche « bientôt disponible » et les commandes sont vides.

Prochaines étapes, dans l'ordre :
1. Cherif crée le projet Supabase et suit `docs/supabase.md` ; on teste le parcours réel à deux comptes.
2. Edge Functions de paiement Wave / Orange Money + séquestre (création de commande, code de remise
   haché, prix recalculé depuis l'offre acceptée) — après création de la SUARL au Sénégal.
3. Tableau d'administration (litiges, livreurs, remboursements, validation IMEI).

En attente côté Cherif : projet Supabase et fournisseur SMS, SUARL et comptes marchands, vérification du
nom Cherifa (OAPI, domaines, réseaux), prix de la livraison moto.

## Façon de travailler

- Cherif est étudiant en cybersécurité (React / Vite connus) : explique simplement, en français.
- Petits commits clairs en français ; pousser sur `main` après vérification.
- Mets à jour la section « Où en est le projet » de ce fichier à la fin de chaque étape importante.
