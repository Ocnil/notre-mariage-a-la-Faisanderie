# Site mariage Colin & Nikta

Site d'invitation pour le mariage du 5 septembre 2026 à 15h30, Place de la Libération, 93160 Noisy-le-Grand.

## Structure

```
notre-mariage-a-la-Faisanderie/
├── index.html          # Page principale
├── style.css           # Styles
├── script.js           # Animation parallaxe + compte à rebours
└── assets/
    ├── aqueduc.webp
    ├── blees-devant.webp
    ├── collines-devant.webp
    ├── maison-sans-porte.webp
    ├── maison.webp
    ├── mur-fond.webp
    ├── plantes.webp
    ├── porte-droite.webp
    ├── porte-gauche.webp
    └── statue.webp
```

## Sections du site

1. **Animation parallaxe** : les éléments du premier plan disparaissent progressivement (blés → plantes → collines → statue), puis les portes du bâtiment s'ouvrent et révèlent les noms et la date.
2. **Compte à rebours** : décompte en temps réel jusqu'au 5 septembre 2026 à 15h30 (heure de Paris).
3. **Le lieu** : carte Google Maps intégrée + bouton itinéraire.
4. **RSVP** : bouton vers le formulaire Google Forms.

## Déploiement sur GitHub Pages

1. Créez le dépôt `notre-mariage-a-la-Faisanderie` sur GitHub (visibilité **Public**)
2. Uploadez tous les fichiers + le dossier `assets/` (glisser-déposer)
3. Settings → Pages → Source : branche `main`, dossier `/ (root)` → Save
4. Le site sera disponible à : `https://[votre-pseudo].github.io/notre-mariage-a-la-Faisanderie/`

## Personnalisation rapide

Tout est modifiable directement dans `index.html` :

- Prénoms : recherchez `<span class="name-1">Colin</span>`
- Date affichée : recherchez `5 Septembre 2026`
- Heure : recherchez `15h30`
- Adresse : recherchez `Place de la Libération`
- Lien Google Forms : recherchez `https://forms.gle/`

Pour changer la date du compte à rebours, modifiez dans `script.js` :
```js
const weddingDate = new Date('2026-09-05T15:30:00+02:00').getTime();
```
