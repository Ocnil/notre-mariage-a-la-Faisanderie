/* ============================================================
   SITE MARIAGE COLIN & NIKTA
   - Animation parallaxe au scroll
   - Compte à rebours vers le 5 septembre 2026 à 15h30
   ============================================================ */

// ----- ANIMATION PARALLAXE -----

const stage = document.getElementById('stage');
const sky = document.getElementById('sky');
const layerAqueduc = document.getElementById('layerAqueduc');
const layerMur = document.getElementById('layerMur');
const layerMaison = document.getElementById('layerMaison');
const layerStatue = document.getElementById('layerStatue');
const layerCollines = document.getElementById('layerCollines');
const layerPlantes = document.getElementById('layerPlantes');
const layerBlees = document.getElementById('layerBlees');
const doorLeft = document.getElementById('doorLeft');
const doorRight = document.getElementById('doorRight');
const doorGlow = document.getElementById('doorGlow');
const revealContent = document.getElementById('revealContent');
const scrollHint = document.getElementById('scrollHint');

// Helpers
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
const easeInOutCubic = t => t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

function updateParallax() {
    const stageRect = stage.getBoundingClientRect();
    const stageHeight = stage.offsetHeight;
    const viewportHeight = window.innerHeight;

    // Progression globale dans la section sticky (0 à 1)
    const scrolled = -stageRect.top;
    const maxScroll = stageHeight - viewportHeight;
    const progress = clamp(scrolled / maxScroll, 0, 1);

    // Cacher l'indicateur après début du scroll
    if (progress > 0.03) {
        scrollHint.classList.add('hidden');
    } else {
        scrollHint.classList.remove('hidden');
    }

    /* ===== PHASE 1 : APPROCHE (0 - 0.65) =====
       Les éléments du premier plan s'effacent progressivement
       Le bâtiment grossit doucement (effet d'avancée)
    */
    const approachProgress = clamp(progress / 0.65, 0, 1);
    const ap = easeInOutCubic(approachProgress);

    // Blés au premier plan : descendent et s'effacent en premier
    layerBlees.style.transform = `translateY(${ap * 60}%) scale(${1 + ap * 0.8})`;
    layerBlees.style.opacity = clamp(1 - ap * 1.4, 0, 1);

    // Plantes : descendent et s'élargissent
    layerPlantes.style.transform = `translateY(${ap * 50}%) scale(${1 + ap * 0.6})`;
    layerPlantes.style.opacity = clamp(1 - ap * 1.2, 0, 1);

    // Collines : descendent en s'élargissant
    layerCollines.style.transform = `translateY(${ap * 40}%) scale(${1 + ap * 0.5})`;
    layerCollines.style.opacity = clamp(1 - ap * 1.1, 0, 1);

    // Statue : reste un peu plus longtemps puis grossit avec la maison
    layerStatue.style.transform = `scale(${1 + ap * 1.2}) translateY(${ap * 8}%)`;
    layerStatue.style.opacity = clamp(1 - ap * 0.8, 0, 1);

    // Maison : grossit progressivement (effet de zoom vers les portes)
    const maisonScale = 1 + ap * 1.15;
    layerMaison.style.transform = `scale(${maisonScale})`;

    // Mur de fond : grossit légèrement
    layerMur.style.transform = `scale(${1 + ap * 0.8})`;

    // Aqueduc : grossit doucement et monte un peu
    layerAqueduc.style.transform = `scale(${1 + ap * 0.6}) translateY(-${ap * 5}%)`;

    // Ciel : très léger zoom
    sky.style.transform = `scale(${1 + ap * 0.3})`;

    /* ===== PHASE 2 : OUVERTURE DES PORTES (0.55 - 0.85) =====
       Les portes s'ouvrent en rotation 3D
    */
    const doorProgress = clamp((progress - 0.55) / 0.30, 0, 1);
    const doorEased = easeOutQuart(doorProgress);
    const doorAngle = doorEased * 92;

    doorLeft.style.transform = `scale(${maisonScale}) rotateY(-${doorAngle}deg)`;
    doorRight.style.transform = `scale(${maisonScale}) rotateY(${doorAngle}deg)`;

    // Lueur : apparaît avec l'ouverture
    doorGlow.style.opacity = doorProgress * 0.95;
    doorGlow.style.transform = `translate(-50%, -50%) scale(${maisonScale + doorProgress * 1.5})`;

    /* ===== PHASE 3 : RÉVÉLATION (0.85 - 1.0) =====
       Apparition des noms et de la date
    */
    const revealProgress = clamp((progress - 0.85) / 0.15, 0, 1);
    if (revealProgress > 0.1) {
        revealContent.classList.add('visible');
    } else {
        revealContent.classList.remove('visible');
    }
}

// Optimisation avec requestAnimationFrame
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


// ----- COMPTE À REBOURS -----

// Date du mariage : 5 septembre 2026 à 15h30
const weddingDate = new Date('2026-09-05T15:30:00+02:00').getTime();

const cdDays = document.getElementById('cdDays');
const cdHours = document.getElementById('cdHours');
const cdMinutes = document.getElementById('cdMinutes');
const cdSeconds = document.getElementById('cdSeconds');

function updateCountdown() {
    const now = Date.now();
    const distance = weddingDate - now;

    if (distance < 0) {
        // Le mariage a eu lieu
        cdDays.textContent = '0';
        cdHours.textContent = '0';
        cdMinutes.textContent = '0';
        cdSeconds.textContent = '0';
        document.querySelector('.countdown-subtitle').textContent = 'Merci d\'avoir partagé ce moment avec nous';
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
