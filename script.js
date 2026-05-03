/* ============================================================
   SITE MARIAGE COLIN & NIKTA
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

setTimeout(() => {
    if (!loader.classList.contains('hidden')) {
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
    }
}, 8000);


// ============================================================
// ANIMATION PARALLAXE — Scénario narratif :
//   0    - 0.25  Phase 1 : Collines descendent doucement
//   0.25 - 0.50  Phase 2 : Plantes et blés s'écartent / sortent
//   0.30 - 0.70  Phase 3 : Zoom progressif vers les portes (cadrage précis)
//   0.70 - 0.92  Phase 4 : Ouverture des portes
//   0.92 - 1.00  Phase 5 : Révélation des noms
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

// Cadrage final calibré : zoom modéré qui ne coupe pas la maison
const FINAL_ZOOM = 1.55;

function updateParallax() {
    const stageRect = stage.getBoundingClientRect();
    const stageHeight = stage.offsetHeight;
    const viewportHeight = window.innerHeight;

    const scrolled = -stageRect.top;
    const maxScroll = stageHeight - viewportHeight;
    const progress = clamp(scrolled / maxScroll, 0, 1);

    if (progress > 0.03) scrollHint.classList.add('hidden');
    else scrollHint.classList.remove('hidden');

    // ===== PHASE 1 : COLLINES (0 - 0.25) =====
    const ph1 = clamp(progress / 0.25, 0, 1);
    const ph1e = eIO(ph1);
    layerCollines.style.transform = `translate3d(0, ${ph1e * 90}%, 0) scale(${1 + ph1e * 0.4})`;
    layerCollines.style.opacity = clamp(1 - eIQ(ph1) * 1.3, 0, 1);

    // ===== PHASE 2 : PLANTES + BLÉS (0.25 - 0.50) =====
    const ph2 = clamp((progress - 0.25) / 0.25, 0, 1);
    const ph2e = eIO(ph2);

    layerPlantes.style.transform = `translate3d(0, ${ph2e * 100}%, 0) scale(${1 + ph2e * 0.7})`;
    layerPlantes.style.opacity = clamp(1 - eIQ(ph2) * 1.5, 0, 1);

    layerBlees.style.transform = `translate3d(0, ${ph2e * 120}%, 0) scale(${1 + ph2e * 1.0})`;
    layerBlees.style.opacity = clamp(1 - eIQ(ph2) * 1.6, 0, 1);

    // ===== PHASE 3 : ZOOM SUR LES PORTES (0.30 - 0.70) =====
    const ph3 = clamp((progress - 0.30) / 0.40, 0, 1);
    const ph3e = eIO(ph3);
    const currentScale = 1 + ph3e * (FINAL_ZOOM - 1);

    layerMaison.style.transform = `scale(${currentScale}) translateZ(0)`;
    layerMur.style.transform = `scale(${1 + ph3e * 0.5}) translateZ(0)`;
    layerAqueduc.style.transform = `scale(${1 + ph3e * 0.3}) translate3d(0, -${ph3e * 5}%, 0)`;
    sky.style.transform = `scale(${1 + ph3e * 0.2}) translateZ(0)`;

    // Statue : suit la maison puis disparaît
    layerStatue.style.transform = `scale(${1 + ph3e * 0.8}) translateZ(0)`;
    layerStatue.style.opacity = clamp(1 - ph3e * 0.95, 0, 1);

    // ===== PHASE 4 : OUVERTURE DES PORTES (0.70 - 0.92) =====
    const ph4 = clamp((progress - 0.70) / 0.22, 0, 1);
    const ph4e = eOQ(ph4);
    const doorAngle = ph4e * 105;

    // Portes : MÊME scale que la maison + rotation sur leurs charnières (CSS)
    layerDoorLeft.style.transform = `scale(${currentScale}) rotateY(-${doorAngle}deg) translateZ(0)`;
    layerDoorRight.style.transform = `scale(${currentScale}) rotateY(${doorAngle}deg) translateZ(0)`;

    // Lueur
    doorGlow.style.opacity = ph4 * 0.95;
    doorGlow.style.transform = `translate(-50%, -50%) scale(${currentScale + ph4 * 1.8}) translateZ(0)`;

    // ===== PHASE 5 : RÉVÉLATION (0.92 - 1.0) =====
    const ph5 = clamp((progress - 0.92) / 0.08, 0, 1);
    if (ph5 > 0.1) revealContent.classList.add('visible');
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
// ============================================================

const weddingDate = new Date('2026-09-05T15:30:00+02:00').getTime();

const cdDays = document.getElementById('cdDays');
const cdHours = document.getElementById('cdHours');
const cdMinutes = document.getElementById('cdMinutes');
const cdSeconds = document.getElementById('cdSeconds');

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
}

updateCountdown();
setInterval(updateCountdown, 1000);
