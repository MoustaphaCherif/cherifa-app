# Plan de construction — Cherifa

Oct 28, 2026 · @cherif

## Vue d'ensemble

**En 20 semaines, de novembre 2026 à mars 2027, on passe de l'idée à une app en ligne à Dakar, avec 2 000 articles dès le premier jour.** On ne code rien avant d'avoir vu et testé l'app en maquette avec de vraies vendeuses.

La promesse à l'utilisateur tient en une phrase : **« Vends en 1 minute, garde 100 % de ton prix, achète sans risque. »**

| Phase | Semaines | Résultat |
| --- | --- | --- |
| A. Fondations | 1 à 2 | Le besoin confirmé par 30 vendeuses, le nom et l'identité choisis |
| B. Design | 3 à 5 | Une maquette cliquable testée et validée |
| C. Construction | 6 à 13 | L'app fonctionne de bout en bout, sans vrai argent |
| D. Paiement et sécurité | 12 à 15 | Wave et Orange Money branchés, argent bloqué jusqu'à réception |
| E. Bêta fermée | 16 à 19 | 100 vendeuses fondatrices, 2 000 articles en ligne |
| F. Lancement public | 20 et après | Ouverture à tout Dakar, campus en premier |

Les dates supposent un travail régulier à côté de tes études. Si ça glisse, on décale le lancement, jamais la bêta.

## L'expérience qui fait la différence

L'app doit donner l'impression d'être née à Dakar, pas traduite de Paris : chaleureuse, rapide, et utilisable par quelqu'un qui n'a jamais acheté en ligne.

**Six règles de design**

1. **Une minute pour vendre.** Photo, prix, taille, c'est publié. Tout le reste est facultatif.
2. **Le wolof partout.** Un bouton FR / WO visible dès l'accueil, et des mots du quotidien : « Jaay » pour vendre, « Jënd » pour acheter, « Sama armoire » pour son profil.
3. **L'argent toujours visible.** Le prix final, frais et livraison compris, s'affiche avant de payer. Jamais de surprise.
4. **La confiance en un coup d'œil.** Badge vendeuse vérifiée, nombre de ventes, note, et la mention « Argent bloqué jusqu'à réception » sur chaque article.
5. **Légère comme un statut.** Moins de 2 Mo au premier chargement, photos compressées, fonctionne en 3G et sur un téléphone d'entrée de gamme.
6. **Un clic vers WhatsApp.** Chaque annonce se partage en statut avec un beau visuel et le prix.

**Identité visuelle (propositions à tester)**

| Élément | Proposition | Pourquoi |
| --- | --- | --- |
| Couleur principale | Orange terre cuite, chaud et énergique | Se distingue du vert de Maket et du bleu de Wave |
| Couleur d'accent | Bleu pirogue profond | Évoque la mer et Dakar, rassure pour le paiement |
| Fond | Blanc cassé sable | Met en valeur les photos de vêtements |
| Typographie | Une police ronde et lisible, gros caractères | Lisible au soleil et pour tous les âges |
| Motifs | Petits motifs wax en touches discrètes | Identité locale sans surcharger |
| Ton | Tutoiement, phrases courtes, un peu d'humour | Comme une amie qui te conseille |

**Le détail qui fait péter** : chaque vente réussie génère une carte « Vendu sur Cherifa » à partager en statut. Les vendeuses deviennent ta publicité gratuite.

## Les écrans du MVP

Neuf écrans suffisent pour la première version ; tout le reste attend la bêta.

| # | Écran | Ce qu'on y fait | Le petit plus local |
| --- | --- | --- | --- |
| 1 | Bienvenue et inscription | Numéro de téléphone (+221 et +33), code SMS, choix FR ou WO | Pas d'e-mail, pas de mot de passe |
| 2 | Accueil | Fil d'articles, catégories, « Près de chez toi » | Catégories Tabaski, Korité, mariage, wax |
| 3 | Recherche | Filtres taille, prix, état, quartier, marque | Tailles européennes, US et « sur mesure » |
| 4 | Fiche article | Photos, prix, vendeuse et sa note, « Acheter » ou « Faire une offre » | Prix total livraison comprise affiché |
| 5 | Publier (Jaay) | Photos, prix, taille, état, en moins d'une minute | Import direct des photos WhatsApp |
| 6 | Messagerie | Discussion et offres de prix | Le marchandage est prévu, pas subi |
| 7 | Paiement | Wave ou Orange Money, récapitulatif clair | « Argent bloqué jusqu'à réception » |
| 8 | Suivi de commande | Étapes : payé, récupéré, en route, livré ; code de remise | Numéro du livreur visible |
| 9 | Sama armoire (profil) | Mes articles, mes ventes, mon argent, mes avis | Carte « Vendu » à partager en statut |

Côté équipe, un petit **tableau d'administration** permet de gérer les litiges, les livreurs et les remboursements. Tu peux réutiliser ce que tu as appris avec DMK Admin.

## Feuille de route de A à Z

| Phase | Semaines | Feu vert en fin de phase |
| --- | --- | --- |
| A. Fondations | 1 à 2 | — |
| B. Design | 3 à 5 | Une vendeuse publie un article en moins d'une minute |
| C. Construction | 6 à 13 | — |
| D. Paiement et sécurité | 12 à 15 | 20 paiements réels réussis, dont 3 remboursés |
| E. Bêta fermée | 16 à 19 | 2 000 articles, 100 ventes, moins de 5 % de litiges |
| F. Lancement public | 20 et après | — |

La construction et le paiement se chevauchent : la société et le compte Wave se lancent en semaine 8, pendant que le code avance, pour ne pas attendre les délais administratifs.

## Le détail de chaque phase

Chaque phase se termine par un livrable concret : si le livrable n'est pas là, on ne passe pas à la suite.

### A. Fondations (semaines 1 à 2)

- [ ] **Associé** : interroger 30 vendeuses de statut WhatsApp et 30 acheteuses à Dakar (questionnaire préparé avec Claude)
- [ ] **Toi** : tester Maket et Beam en achat réel, noter tout ce qui coince
- [ ] **Toi + Claude** : nom choisi : Cherifa ; vérifier qu'il est libre à l'OAPI, en domaine (.sn, .com) et sur l'App Store
- [ ] **Ensemble** : répartir les parts et les rôles par écrit entre associés

**Livrable :** un résumé des entretiens et le nom réservé.

### B. Design (semaines 3 à 5)

- [ ] **Claude** : logo, couleurs et maquettes des 9 écrans
- [ ] **Toi** : ajuster les maquettes, faire relire les textes wolof par un locuteur natif
- [ ] **Associé** : faire tester la maquette cliquable à 10 vendeuses, chronométrer la publication

**Livrable :** une maquette où une vendeuse publie un article en moins d'une minute, sans aide.

### C. Construction (semaines 6 à 13)

- [ ] **Toi + Claude** : PWA React + Vite sur Cloudflare Pages, base de données et authentification Supabase en région Paris, photos sur Supabase Storage ou Cloudflare R2 avec CDN (tous les comptes au nom de la société)
- [ ] Inscription par SMS, publication, fil, recherche, fiche article
- [ ] Messagerie et offres de prix
- [ ] Commandes et suivi, tableau d'administration
- [ ] **Associé** : signer avec 3 à 5 livreurs moto, fixer les prix par zone

**Livrable :** une commande complète de bout en bout, avec un faux paiement.

### D. Paiement et sécurité (semaines 12 à 15)

- [ ] **Toi** : créer la SUARL à l'APIX (à lancer dès la semaine 8, car Wave demande 3 à 7 jours)
- [ ] **Toi** : ouvrir les comptes marchands Wave Business et Orange Money
- [ ] **Toi + Claude** : brancher les API en mode test, puis le séquestre et les remboursements
- [ ] **Toi** : revue de sécurité (ton domaine) : authentification, droits, journalisation, anti-fraude
- [ ] Faire valider le mécanisme de séquestre par un juriste ou un comptable au Sénégal, et déposer auprès de la CDP la déclaration et la demande de transfert des données vers la France

**Livrable :** 20 paiements réels de test réussis, dont 3 remboursés.

### E. Bêta fermée (semaines 16 à 19)

- [ ] **Associé** : recruter 100 vendeuses fondatrices (badge à vie, 0 frais de boost pendant 3 mois)
- [ ] Les aider à publier : objectif 2 000 articles
- [ ] Ventes réelles entre testeurs, corriger les bugs chaque semaine
- [ ] **Toi + Claude** : ajouter la carte « Vendu » à partager en statut

**Livrable :** 2 000 articles, au moins 100 ventes, moins de 5 % de litiges.

### F. Lancement public (semaine 20 et après)

Voir la section suivante.

## Le lancement qui fait parler

On lance quand l'app est déjà pleine : un visiteur qui arrive le premier jour doit trouver des milliers d'articles, pas une vitrine vide.

| Moment | Action | Objectif |
| --- | --- | --- |
| 3 semaines avant | Teasers TikTok et Instagram : « Vends ton dressing, garde 100 % » ; liste d'attente | 2 000 inscrits en attente |
| 2 semaines avant | 5 à 10 micro-influenceuses dakaroises reçoivent un accès anticipé et vident leur dressing sur l'app | Contenu prêt pour le jour J |
| Jour J | Ouverture sur les campus (UCAD, ISM, UCAO) avec ambassadeurs, codes promo livraison offerte | 1 000 téléchargements la première semaine |
| Semaines 1 à 4 | Défi TikTok « Mon look à 5 000 FCFA » ; parrainage 500 FCFA pour les deux | Bouche-à-oreille |
| Mois 2 à 3 | « Vide ton armoire avant Tabaski » ou autre fête proche ; ouverture à tout Dakar | 300 ventes par mois |

**Le message central, partout :** « Ailleurs on te prend 25 %. Ici tu gardes tout. » Compare sans nommer le concurrent.

## Budget de construction et indicateurs de réussite

Jusqu'au lancement, le projet coûte moins d'un million de FCFA (environ 1 500 €) : le gros de la valeur vient de ton temps de développement.

| Poste | Estimation | Quand |
| --- | --- | --- |
| SUARL à l'APIX (frais) | 50 000 à 100 000 FCFA | Semaine 8 |
| Capital de la SUARL (récupérable) | 100 000 FCFA | Semaine 8 |
| Nom de domaine et dépôt de marque OAPI | À chiffrer au moment du dépôt | Semaine 2 |
| Hébergement et base de données | Gratuit puis environ 25 $ par mois (Supabase région Paris, Cloudflare) | Semaine 6 |
| SMS de connexion | Quelques FCFA par SMS, selon le fournisseur | Semaine 6 |
| Compte développeur Apple (si app iPhone) | 99 $ par an | Après la bêta |
| Lancement (influenceuses, ambassadeurs, promos) | 300 000 à 500 000 FCFA | Semaines 17 à 24 |

**Les chiffres à suivre chaque semaine**

- Temps moyen pour publier un article : moins d'une minute
- Articles en ligne : 2 000 au lancement
- Ventes par mois : 300 trois mois après le lancement
- Taux de litiges : moins de 5 %
- Part des vendeuses qui revendent le mois suivant : plus de 40 %

Ces objectifs sont des points de départ à ajuster après la bêta.
