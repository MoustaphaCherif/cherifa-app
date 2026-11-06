# Brancher Cherifa sur Supabase

Ce guide se fait une seule fois, en 20 à 30 minutes. Tant qu'il n'est pas fait, l'app tourne en **mode démo**.
Une fois fait : vrais comptes par SMS, vraies annonces avec photos, messagerie en temps réel.
Le paiement reste à brancher (étape 2, après la SUARL).

## 1. Créer le projet

1. Sur [supabase.com](https://supabase.com), crée une organisation **au nom de la société** (le plan de construction
   prévoit que tous les comptes soient à son nom ; tu pourras transférer le projet plus tard si la SUARL n'existe pas encore).
2. **New project** → nom `cherifa` → région **West EU (Paris)** → note le mot de passe de la base dans un gestionnaire
   de mots de passe (jamais dans Git).

## 2. Appliquer le schéma

Dans le projet : **SQL Editor** → **New query**. Colle et exécute, **dans l'ordre**, un fichier à la fois :

1. `supabase/migrations/0001_schema.sql` : tables, règles de sécurité, catégories de lancement ;
2. `supabase/migrations/0002_photos_temps_reel_offres.sql` : bucket de photos, temps réel, réponse aux offres.

Vérification rapide : **Table Editor** doit montrer les tables `listings`, `messages`…, et **Storage** un bucket `photos`.

## 3. Activer la connexion par SMS

**Authentication** → **Sign In / Providers** → **Phone** → activer.

- Il faut un fournisseur de SMS. Le plus simple à brancher est **Twilio** (compte, numéro expéditeur, puis
  Account SID, Auth Token et Message Service SID à coller dans Supabase). Compare le prix d'un SMS vers le
  Sénégal (+221) et la France (+33) avant de choisir : c'est la ligne « SMS de connexion » du budget.
- Désactive **Email** : l'app n'utilise pas d'e-mail.
- **Pour tester gratuitement** sans envoyer de vrais SMS : dans les réglages Phone, renseigne des
  **numéros de test** avec un code fixe (par exemple `221770000001` → `123456`). Crée deux numéros de test
  pour jouer l'acheteuse et la vendeuse dans deux navigateurs.

## 4. Relier l'app au projet

**Project Settings** → **API** : copie l'**URL du projet** et la clé **anon public**.

En local, crée `.env.local` à la racine (ce fichier n'est jamais commité) :

```bash
cp .env.example .env.local
```

puis remplis les deux lignes, et relance `npm run dev`. Le bandeau « Mode démo » disparaît de l'écran d'accueil.

La clé `anon` est publique par conception : la sécurité repose sur les règles RLS. **Ne mets jamais la clé
`service_role`** dans l'app, ni dans `.env.local`, ni dans Git.

Pour le site en ligne (Cloudflare Pages) : **Settings** → **Environment variables**, ajoute
`VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`, puis relance un déploiement.

## 5. Tester le parcours réel

Avec deux numéros de test, dans deux navigateurs (ou une fenêtre privée) :

1. Vendeuse : connexion → prénom et quartier → **Jaay** → publier un article avec photo.
2. Acheteuse : connexion → l'article apparaît dans l'accueil → **Faire une offre**.
3. Vendeuse : l'offre arrive **sans recharger la page** dans Messages → **Accepter**.
4. Acheteuse : « Offre acceptée » s'affiche → **Payer maintenant** → l'écran explique que le paiement arrive bientôt.

## Ce qui est protégé, et comment

| Règle | Où |
| --- | --- |
| Chacun n'envoie des photos que dans son propre dossier | Politiques `photos_upload_own` / `photos_delete_own` (0002) |
| Une annonce ne peut afficher que des photos de son vendeur | Contrainte et politique sur `listing_photos` (0002) |
| Seule l'autre personne peut accepter ou refuser une offre, une seule fois | Fonction `respond_to_offer` (0002) |
| On ne peut ni se déclarer vérifié, ni marquer vendu, ni créer de commande payée | Règles RLS (0001) |

Les 17 scénarios de `supabase/tests/` le vérifient (voir le README).
