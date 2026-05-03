/* ============================================================
   SITE MARIAGE COLIN & NIKTA — Script final
   ============================================================ */

// ============================================================
// PRÉCHARGEMENT (HD ou MD selon écran)
// ============================================================

const isMobile = window.matchMedia('(max-width: 1280px)').matches;
const suffix = isMobile ? '-md' : '';

const IMAGES_TO_LOAD = [
    `assets/aqueduc${suffix}.webp`,
    `assets/mur-fond${suffix}.webp`,
    `assets/maison-sans-porte${suffix}.webp`,
    `assets/porte-gauche${suffix}.webp`,
    `assets/porte-droite${suffix}.webp`,
    `assets/statue${suffix}.webp`,
    `assets/collines-devant${suffix}.webp`,
    `assets/plantes${suffix}.webp`,
    `assets/blees-devant${suffix}.webp`
];

const loader = document.getElementById('loader');
const loaderBarFill = document.getElementById('loaderBarFill');

let imagesLoaded = 0;
const totalImages = IMAGES_TO_LOAD.length;

function updateLoadProgress() {
    loaderBarFill.style.width = (imagesLoaded / totalImages) * 100 + '%';
}

function onAllImagesLoaded() {
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
        updateParallax();
        // Démarrer le compte à rebours après chargement
        startCountdown();
    }, 400);
}

IMAGES_TO_LOAD.forEach(src => {
    const img = new Image();
    img.onload = img.onerror = () => {
        imagesLoaded++;
        updateLoadProgress();
        if (imagesLoaded === totalImages) onAllImagesLoaded();
    };
    img.src = src;
});

// Sécurité : si quelque chose bloque
setTimeout(() => {
    if (!loader.classList.contains('hidden')) {
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
        startCountdown();
    }
}, 8000);


// ============================================================
// ANIMATION PARALLAXE
// Phases qui se chevauchent à 60% pour un mouvement organique :
//   Phase 1 (collines)       0.00 → 0.30
//   Phase 2 (plantes)        0.18 → 0.48   (démarre à 60% de phase 1)
//   Phase 3 (blés)           0.30 → 0.55
//   Phase 4 (zoom maison)    0.25 → 0.65   (se termine AVANT les portes)
//   Phase 5 (portes ouvrent) 0.65 → 0.85   (scale figé, pure rotation)
//   Phase 6 (traversée)      0.80 → 1.00   (on plonge dans les portes)
//   Phase 7 (révélation)     0.92 → 1.00
// ============================================================

const stage = document.getElementById('stage');
const sky = document.getElementById('sky');
const layerAqueduc = document.getElementById('layerAqueduc');
const layerMur = document.getElementById('layerMur');
const layerMaison = document.getElementById('layerMaison');
const layerStatue = document.getElementById('layerStatue');
const layerCollines = document.getElementById('layerCollines');
const layerPlantes = document.getElementById('layerPlantes');
const layerBlees = document.getElementById('layerBlees');
const layerDoorLeft = document.getElementById('layerDoorLeft');
const layerDoorRight = document.getElementById('layerDoorRight');
const doorGlow = document.getElementById('doorGlow');
const revealContent = document.getElementById('revealContent');
const scrollHint = document.getElementById('scrollHint');

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const eIO = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
const eOQ = t => 1 - Math.pow(1-t, 4);
const eIQ = t => t * t * t * t;

// Cadrage final calibré
const FINAL_ZOOM = 1.55;

// Phases qui se chevauchent à 60% :
//   Action A dure 0 → 1.0
//   Action B commence quand A est à 0.60 → soit B démarre à offsetA + 0.60*durationA
//
// Plages choisies pour un défilement organique :
//   Phase 1 (collines)   : 0.00 → 0.30   |  durée 0.30
//   Phase 2 (plantes)    : 0.18 → 0.48   |  démarre à 60% de phase 1
//   Phase 3 (blés)       : 0.30 → 0.55   |  démarre à 60% de phase 2
//   Phase 4 (zoom maison): 0.25 → 0.75   |  démarre tôt et chevauche tout
//   Phase 5 (statue out) : 0.45 → 0.70   |  s'efface au moment du zoom
//   Phase 6 (portes)     : 0.70 → 0.92   |  démarre quand le zoom est à 90%
//   Phase 7 (révélation) : 0.88 → 1.00

function updateParallax() {
    const stageRect = stage.getBoundingClientRect();
    const stageHeight = stage.offsetHeight;
    const viewportHeight = window.innerHeight;

    const scrolled = -stageRect.top;
    const maxScroll = stageHeight - viewportHeight;
    const progress = clamp(scrolled / maxScroll, 0, 1);

    if (progress > 0.03) scrollHint.classList.add('hidden');
    else scrollHint.classList.remove('hidden');

    // ===== PHASE 1 : COLLINES descendent (0 → 0.30) =====
    const ph1 = clamp(progress / 0.30, 0, 1);
    const ph1e = eIO(ph1);
    layerCollines.style.transform = `translate3d(0, ${ph1e * 90}%, 0) scale(${1 + ph1e * 0.4})`;
    layerCollines.style.opacity = clamp(1 - eIQ(ph1) * 1.3, 0, 1);

    // ===== PHASE 2 : PLANTES (0.18 → 0.48) — démarre à 60% de phase 1 =====
    const ph2 = clamp((progress - 0.18) / 0.30, 0, 1);
    const ph2e = eIO(ph2);
    layerPlantes.style.transform = `translate3d(0, ${ph2e * 100}%, 0) scale(${1 + ph2e * 0.7})`;
    layerPlantes.style.opacity = clamp(1 - eIQ(ph2) * 1.5, 0, 1);

    // ===== PHASE 3 : BLÉS (0.30 → 0.55) =====
    const ph3 = clamp((progress - 0.30) / 0.25, 0, 1);
    const ph3e = eIO(ph3);
    layerBlees.style.transform = `translate3d(0, ${ph3e * 130}%, 0) scale(${1 + ph3e * 1.2})`;
    layerBlees.style.opacity = clamp(1 - eIQ(ph3) * 1.6, 0, 1);

    /* ============================================================
       PHASE 4 : ZOOM SUR LA MAISON (0.25 → 0.65)
       Le zoom s'arrête AVANT que les portes ne s'ouvrent (à 0.65)
       Comme ça les portes n'ont plus aucun changement de scale
       quand elles pivotent → plus de coulissement
       ============================================================ */
    const ph4 = clamp((progress - 0.25) / 0.40, 0, 1);
    const ph4e = eIO(ph4);
    const stableZoom = 1 + ph4e * (FINAL_ZOOM - 1);

    layerMaison.style.transform = `scale(${stableZoom}) translateZ(0)`;
    layerMur.style.transform = `scale(${1 + ph4e * 0.5}) translateZ(0)`;
    layerAqueduc.style.transform = `scale(${1 + ph4e * 0.3}) translate3d(0, -${ph4e * 5}%, 0)`;
    sky.style.transform = `scale(${1 + ph4e * 0.2}) translateZ(0)`;

    // Statue suit le zoom puis disparaît
    const statueOpacity = clamp(1 - clamp((progress - 0.45) / 0.15, 0, 1) * 0.95, 0, 1);
    layerStatue.style.transform = `scale(${stableZoom}) translateZ(0)`;
    layerStatue.style.opacity = statueOpacity;

    /* ============================================================
       PHASE 5 : OUVERTURE DES PORTES (0.65 → 0.85)
       Le zoom de la maison est terminé (ph4 = 1, scale = FINAL_ZOOM)
       Les portes ont DÉJÀ ce scale stable, plus aucun mouvement de
       scale pendant la rotation → AUCUN coulissement possible
       ============================================================ */
    const ph5 = clamp((progress - 0.65) / 0.20, 0, 1);
    const ph5e = eOQ(ph5);
    const doorAngle = ph5e * 110;

    // Portes : SCALE FIGÉ à FINAL_ZOOM dès le début, juste une rotation
    layerDoorLeft.style.transform = `scale(${FINAL_ZOOM}) rotateY(-${doorAngle}deg) translateZ(0)`;
    layerDoorRight.style.transform = `scale(${FINAL_ZOOM}) rotateY(${doorAngle}deg) translateZ(0)`;

    // Lueur dorée qui s'intensifie
    doorGlow.style.opacity = ph5 * 0.95;
    doorGlow.style.transform = `translate(-50%, -50%) scale(${FINAL_ZOOM + ph5 * 1.2}) translateZ(0)`;

    /* ============================================================
       PHASE 6 : TRAVERSÉE — on rentre dans les portes (0.80 → 1.0)
       Zoom rapide qui plonge à travers les portes ouvertes
       Le ciel et tout le décor zooment énormément vers le centre
       Les portes elles-mêmes zooment et sortent du cadre par les côtés
       ============================================================ */
    const ph6 = clamp((progress - 0.80) / 0.20, 0, 1);
    const ph6e = eIQ(ph6); // courbe accélérée pour effet "plongeon"

    if (ph6 > 0) {
        // Zoom supplémentaire rapide qui traverse les portes
        const dashScale = 1 + ph6e * 4; // x5 supplémentaire en peu de temps
        const totalMaisonScale = FINAL_ZOOM * dashScale;

        layerMaison.style.transform = `scale(${totalMaisonScale}) translateZ(0)`;
        layerMur.style.transform = `scale(${(1 + 0.5) * dashScale}) translateZ(0)`;
        layerAqueduc.style.transform = `scale(${(1 + 0.3) * dashScale}) translate3d(0, -${5 + ph6e * 10}%, 0)`;
        sky.style.transform = `scale(${(1 + 0.2) * dashScale}) translateZ(0)`;

        // Les portes traversent l'écran : on les fait sortir par les côtés en grossissant
        const doorPullOutScale = FINAL_ZOOM * (1 + ph6e * 4);
        layerDoorLeft.style.transform = `scale(${doorPullOutScale}) rotateY(-110deg) translateZ(0)`;
        layerDoorRight.style.transform = `scale(${doorPullOutScale}) rotateY(110deg) translateZ(0)`;

        // Tout le décor s'estompe au fur et à mesure de l'entrée
        const decorFade = clamp(1 - ph6e * 1.3, 0, 1);
        layerMaison.style.opacity = decorFade;
        layerMur.style.opacity = decorFade;
        layerAqueduc.style.opacity = decorFade;
        layerDoorLeft.style.opacity = decorFade;
        layerDoorRight.style.opacity = decorFade;

        // Lueur disparaît dans le blanc
        doorGlow.style.opacity = clamp(0.95 - ph6e * 1.2, 0, 0.95);
    } else {
        // Hors phase 6 : rétablir les opacités à 1
        layerMaison.style.opacity = '';
        layerMur.style.opacity = '';
        layerAqueduc.style.opacity = '';
        layerDoorLeft.style.opacity = '';
        layerDoorRight.style.opacity = '';
    }

    // ===== PHASE 7 : RÉVÉLATION du contenu (0.92 → 1.0) =====
    const ph7 = clamp((progress - 0.92) / 0.08, 0, 1);
    if (ph7 > 0.1) revealContent.classList.add('visible');
    else revealContent.classList.remove('visible');
}

let ticking = false;
function onScroll() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateParallax();
            ticking = false;
        });
        ticking = true;
    }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });
window.addEventListener('load', updateParallax);
updateParallax();


// ============================================================
// COMPTE À REBOURS
// Démarre uniquement après le chargement (pas de "--" visible)
// ============================================================

const weddingDate = new Date('2026-09-05T15:00:00+02:00').getTime();

const cdDays = document.getElementById('cdDays');
const cdHours = document.getElementById('cdHours');
const cdMinutes = document.getElementById('cdMinutes');
const cdSeconds = document.getElementById('cdSeconds');

let countdownInterval = null;

function updateCountdown() {
    const now = Date.now();
    const distance = weddingDate - now;

    if (distance < 0) {
        cdDays.textContent = '0';
        cdHours.textContent = '0';
        cdMinutes.textContent = '0';
        cdSeconds.textContent = '0';
        const subtitle = document.querySelector('.countdown-subtitle');
        if (subtitle) subtitle.textContent = 'Merci d\'avoir partagé ce moment avec nous';
        if (countdownInterval) clearInterval(countdownInterval);
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    cdDays.textContent = days;
    cdHours.textContent = String(hours).padStart(2, '0');
    cdMinutes.textContent = String(minutes).padStart(2, '0');
    cdSeconds.textContent = String(seconds).padStart(2, '0');

    // Retirer la classe placeholder une fois les vraies valeurs affichées
    [cdDays, cdHours, cdMinutes, cdSeconds].forEach(el => {
        el.classList.remove('placeholder');
    });
}

function startCountdown() {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

// Initialiser avec le placeholder
[cdDays, cdHours, cdMinutes, cdSeconds].forEach(el => {
    if (el) el.classList.add('placeholder');
});


// ============================================================
// FADE-IN DES SECTIONS AU SCROLL
// ============================================================

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    });

    // Cibler tous les blocs qu'on veut animer
    document.querySelectorAll('.venue-card, .timeline-item, .info-block, .hotel-card, .rental-link')
        .forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });
}
