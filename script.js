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
// Les phases se CHEVAUCHENT à 60% — chaque action commence
// quand la précédente n'est qu'à 60% de sa progression.
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

    // ===== PHASE 3 : BLÉS (0.30 → 0.55) — démarre à 60% de phase 2 =====
    const ph3 = clamp((progress - 0.30) / 0.25, 0, 1);
    const ph3e = eIO(ph3);
    layerBlees.style.transform = `translate3d(0, ${ph3e * 130}%, 0) scale(${1 + ph3e * 1.2})`;
    layerBlees.style.opacity = clamp(1 - eIQ(ph3) * 1.6, 0, 1);

    // ===== PHASE 4 : ZOOM MAISON (0.25 → 0.75) — démarre tôt =====
    const ph4 = clamp((progress - 0.25) / 0.50, 0, 1);
    const ph4e = eIO(ph4);
    const currentScale = 1 + ph4e * (FINAL_ZOOM - 1);

    layerMaison.style.transform = `scale(${currentScale}) translateZ(0)`;
    layerMur.style.transform = `scale(${1 + ph4e * 0.5}) translateZ(0)`;
    layerAqueduc.style.transform = `scale(${1 + ph4e * 0.3}) translate3d(0, -${ph4e * 5}%, 0)`;
    sky.style.transform = `scale(${1 + ph4e * 0.2}) translateZ(0)`;

    // ===== PHASE 5 : STATUE disparaît (0.45 → 0.70) =====
    const ph5 = clamp((progress - 0.45) / 0.25, 0, 1);
    const ph5e = eIO(ph5);
    // Statue suit le scale de la maison, et s'efface
    layerStatue.style.transform = `scale(${currentScale}) translateZ(0)`;
    layerStatue.style.opacity = clamp(1 - ph5e * 0.95, 0, 1);

    // ===== PHASE 6 : OUVERTURE DES PORTES (0.70 → 0.92) =====
    // CRITIQUE : pour éviter le coulissement, les portes doivent UNIQUEMENT
    // pivoter, pas changer d'échelle pendant qu'elles s'ouvrent.
    // Solution : on fige le scale au début de la phase 6 (= scale au moment
    // où progress=0.70, c'est-à-dire FINAL_ZOOM atteint à ce moment-là).
    //
    // On calcule le scale "figé" : scale au moment où ph4 = (0.70 - 0.25) / 0.50 = 0.90
    const scaleAtDoorStart = 1 + eIO(0.90) * (FINAL_ZOOM - 1);

    const ph6 = clamp((progress - 0.70) / 0.22, 0, 1);
    const ph6e = eOQ(ph6);
    const doorAngle = ph6e * 105;

    // Pendant l'ouverture (ph6 > 0), on fige le scale ; sinon on suit la maison
    const doorScale = ph6 > 0 ? scaleAtDoorStart : currentScale;

    layerDoorLeft.style.transform = `scale(${doorScale}) rotateY(-${doorAngle}deg) translateZ(0)`;
    layerDoorRight.style.transform = `scale(${doorScale}) rotateY(${doorAngle}deg) translateZ(0)`;

    // Lueur dorée
    doorGlow.style.opacity = ph6 * 0.95;
    doorGlow.style.transform = `translate(-50%, -50%) scale(${doorScale + ph6 * 1.8}) translateZ(0)`;

    // ===== PHASE 7 : RÉVÉLATION (0.88 → 1.0) — chevauche fin d'ouverture =====
    const ph7 = clamp((progress - 0.88) / 0.12, 0, 1);
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
