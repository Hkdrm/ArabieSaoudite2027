# 🕋 Mon Voyage Omra

Application web (PWA) pour préparer vos vacances et votre Omra en Arabie saoudite.
Interface **français / العربية (RTL) / English**. Fonctionne hors ligne une fois installée.

## Concept : « Hidden Arabia »
Plutôt que de copier Google Maps ou Tripadvisor : **découvrir des lieux méconnus, comprendre leur histoire, savoir comment les visiter.**
Chaque fiche sépare les *faits établis* des *traditions non confirmées*, indique la fiabilité, la source et la date de vérification.
⚠️ Les fiches actuelles sont **non vérifiées** (rédigées de mémoire) : elles doivent être validées par un humain avant publication (`ver` dans `js/places.js`).

## Fonctionnalités
- **Explorer** : carte + recherche + filtres (catégorie, ville) + « près de moi » ; **fiches détaillées** (nom arabe pour les taxis, histoire, prix, durée, horaires, accès, conseils, GPS, sources)
- **Vidéos liées aux lieux** : lien YouTube + créateur + passage exact (ajout manuel, le créateur est toujours cité)
- **Départ / Retour** : vols aller et retour (escales, horaires, terminal, référence), alimente le compte à rebours de l'accueil
- **Carnet** : favoris, lieux visités, notes personnelles, planning jour par jour, **créateur d'itinéraire** (temps disponible + centres d'intérêt)
- **Accueil** : compte à rebours, prochaine prière, date hégirienne
- **Planning** : étapes jour par jour (ville, notes, cases à cocher), exemple fourni
- **Guide de l'Omra** : 7 étapes, invocations en arabe + phonétique + traduction, compteurs de tawaf et de sa'i
- **Prière & Qibla** : horaires calculés hors ligne (Umm al-Qura, MWL, UOIF, ISNA, Égypte), boussole Qibla
- **Outils** : checklist, budget SAR ⇄ devise, sauvegarde/import JSON

Les données sont stockées localement sur l'appareil (`localStorage`), rien n'est envoyé à un serveur.

## Lancer en local
```bash
python3 -m http.server 8000   # puis ouvrir http://localhost:8000
```
Aucune étape de build : HTML/CSS/JS purs.

## Publier (GitHub Pages)
Settings → Pages → Source : **Deploy from a branch** → `main` / `(root)`. Le site se met à jour à chaque push sur `main`.
Sur téléphone : ouvrir l'URL puis « Ajouter à l'écran d'accueil ».

## Structure
```
index.html · sw.js · manifest.webmanifest
css/style.css
js/places.js  catalogue des lieux (fiches)
js/data.js    traductions, villes, étapes de l'Omra, checklist
js/prayer.js  calcul des prières & Qibla
js/app.js     interface et logique
js/trip.js    onglet Départ / Retour (vols)
```

## Avertissement
Les contenus religieux sont un aide-mémoire ; référez-vous à un savant ou au guide de votre agence. Les coordonnées des lieux sont approximatives. Les horaires sont calculés (précision ≈ 1 min) : vérifiez avec les horaires officiels locaux.
