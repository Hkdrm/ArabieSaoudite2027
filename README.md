# 🕋 Mon Voyage Omra

Application web (PWA) pour préparer vos vacances et votre Omra en Arabie saoudite.
Interface **français / العربية (RTL) / English**. Fonctionne hors ligne une fois installée.

## Fonctionnalités
- **Accueil** : compte à rebours, prochaine prière, date hégirienne
- **Planning** : étapes jour par jour (ville, notes, cases à cocher), exemple fourni
- **Guide de l'Omra** : 7 étapes, invocations en arabe + phonétique + traduction, compteurs de tawaf et de sa'i
- **Prière & Qibla** : horaires calculés hors ligne (Umm al-Qura, MWL, UOIF, ISNA, Égypte), boussole Qibla
- **Carte** : lieux saints, miqats, sites à visiter, aéroports (Leaflet / OpenStreetMap)
- **Outils** : checklist, budget SAR ⇄ devise, sauvegarde/import JSON

Les données sont stockées localement sur l'appareil (`localStorage`), rien n'est envoyé à un serveur.

## Lancer en local
```bash
python3 -m http.server 8000   # puis ouvrir http://localhost:8000
```
Aucune étape de build : HTML/CSS/JS purs.

## Publier (GitHub Pages)
Settings → Pages → Source : **GitHub Actions**. Le workflow `.github/workflows/pages.yml` déploie à chaque push sur `main`.
Sur téléphone : ouvrir l'URL puis « Ajouter à l'écran d'accueil ».

## Structure
```
index.html · sw.js · manifest.webmanifest
css/style.css
js/data.js    traductions, lieux, étapes de l'Omra, checklist
js/prayer.js  calcul des prières & Qibla
js/app.js     interface et logique
```

## Avertissement
Les contenus religieux sont un aide-mémoire ; référez-vous à un savant ou au guide de votre agence. Les coordonnées des lieux sont approximatives. Les horaires sont calculés (précision ≈ 1 min) : vérifiez avec les horaires officiels locaux.
