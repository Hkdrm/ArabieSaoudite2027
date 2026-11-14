# Feuille de route

## V1 — MVP (fait)
Carte, recherche/filtres, fiches (faits vs traditions, fiabilité, sources), vidéos liées, favoris/visités/notes, FR/EN/AR, PWA.

## À faire avant publication publique
- [ ] Valider chaque fiche (renseigner `ver`, `src`, confirmer horaires/prix/accès/coordonnées `approx`)
- [ ] Ajouter photos libres de droits (avec crédit)
- [ ] Traduire les fiches en arabe (aujourd'hui : noms uniquement)
- [ ] Étendre le catalogue de Médine (puits historiques, lieux de la Sira, bons plans)
- [ ] Tester le mode hors ligne sur appareils réels (cartes hors ligne = chantier à part)

## V2 — Voyage
- Itinéraires plus intelligents (horaires d'ouverture, budget, regroupement par secteur)
- Bons plans locaux (transports, repas, points d'eau, toilettes, erreurs à éviter)
- Module Transports (bus, Haramain, taxis, coûts) et Sécurité/confort
- Alertes « lieu fermé / déplacé » avec date de dernière vérification

## V3 — IA
- Assistant en langage naturel (« lieux historiques gratuits à moins de 20 min de la mosquée »)
- **Vidéo → fiches** : extraction par IA des lieux, prix, horaires, conseils depuis les vidéos de créateurs
  → **validation humaine obligatoire** avant publication (risque d'erreurs de reconnaissance de lieux)
  → respecter les autorisations des créateurs et les conditions d'utilisation de YouTube (lien + crédit, pas de recopie du contenu)
- Nécessite un back-end (PostgreSQL/PostGIS + back-office de validation) ; la PWA actuelle est 100 % locale.

## Modèle d'application (à trancher)
1. Guide spécialisé Arabie saoudite — *choix actuel*
2. Guide mondial des lieux méconnus (structure de données déjà prête : villes avec `country`)
3. Carnet de voyage personnel (déjà couvert par favoris, notes, vidéos)
