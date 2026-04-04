// ══════════════════════════════════════════════════════════════
//  Celestial — Multi-scale WASM simulation renderer
//  Galaxy view ↔ Solar System (N-body) with events, asteroids,
//  time controls, and custom system builder
// ══════════════════════════════════════════════════════════════

const KIND_STAR = 0, KIND_PLANET = 1, KIND_SAT = 2,
      KIND_BLACKHOLE = 3, KIND_DISTANT_STAR = 4;

let wasm, SolarSystem, GalaxyView;

// ── State ──
let sim = null;
let galaxy = null;
let canvas, ctx;
let zoomLevel = 0;
let zoomTarget = 0;
const ZOOM_SPEED = 0.04;
let animId = null;
let hovered = -1;
let mouseX = 0, mouseY = 0;

// ── Time controls ──
let timeSpeed = 1.0;         // multiplier: 0 = paused, 0.1 → 10
let paused = false;
let stepsPerFrame = 24;      // base steps per frame (1 day at 60fps)

// ── Asteroids ──
const asteroids = [];
const ASTEROID_COUNT = 280;

// ── Events log ──
const eventLog = [];
const MAX_EVENTS = 50;
let eventFlash = null;       // {msg, time, x, y}
let lastEventCheck = 0;

// ── Custom system mode ──
let customMode = false;
let customBodies = [];       // {x, y, vx, vy, r, color, name, kind}
let placingBody = null;      // body being placed
let dragStart = null;        // for velocity vector drag

// Cached data from WASM
let galPositions, galRadii, galColors, galKinds, galNames, galLuminosities, galSpins;
let galSpiralPts, galSpiralCount, galSolarIdx;
let solNames, solRadii, solColors, solKinds, solParents;

// ── Init ──
export async function initSimulation(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load WASM
    try {
        const wasmModule = await import('../wasm-pkg/celestial_wasm_demo.js');
        await wasmModule.default();
        SolarSystem = wasmModule.SolarSystem;
        GalaxyView = wasmModule.GalaxyView;

        galaxy = new GalaxyView();
        sim = new SolarSystem(3600.0);

        // Cache galaxy data (static)
        galPositions = galaxy.positions_kpc();
        galRadii = galaxy.radii();
        galColors = galaxy.colors();
        galKinds = galaxy.kinds();
        galNames = galaxy.names().split(';');
        galLuminosities = galaxy.luminosities();
        galSpins = galaxy.spins();
        galSpiralPts = galaxy.spiral_arms_kpc();
        galSpiralCount = galaxy.spiral_point_count();
        galSolarIdx = galaxy.solar_system_index();

        // Cache solar system static data
        solNames = sim.names().split(';');
        solRadii = sim.radii();
        solColors = sim.colors();
        solKinds = sim.kinds();
        solParents = sim.parents();

        // Generate asteroids
        generateAsteroids();
    } catch (err) {
        console.error('WASM load failed, running fallback:', err);
        // Fallback: generate a pure-JS solar system view
        generateFallbackSystem();
    }

    // Build control panel
    buildControlPanel();

    // Events
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Keyboard
    document.addEventListener('keydown', onKeyDown);

    loop();
}

// ── Generate asteroid belt (Mars-Jupiter, 2.1-3.3 AU) ──
function generateAsteroids() {
    asteroids.length = 0;
    for (let i = 0; i < ASTEROID_COUNT; i++) {
        const a = 2.1 + Math.random() * 1.2;                      // semi-major axis in AU
        const e = Math.random() * 0.15;                            // eccentricity
        const theta = Math.random() * Math.PI * 2;                 // initial angle
        const phase = Math.random() * Math.PI * 2;                 // phase offset for scatter
        const size = 0.3 + Math.random() * 0.8;                   // visual size
        const brightness = 0.3 + Math.random() * 0.5;
        const speed = 1.0 / Math.pow(a, 1.5);                     // Kepler's 3rd (relative)
        asteroids.push({ a, e, theta, phase, size, brightness, speed });
    }
}

// ── Fallback if WASM fails ──
let fallbackBodies = null;
let fallbackTime = 0;

function generateFallbackSystem() {
    // Simple circular orbits — no WASM needed
    fallbackBodies = [
        { name: 'Sun',     dist: 0,    r: 16, color: 0xFFD866, kind: KIND_STAR,   speed: 0 },
        { name: 'Mercury', dist: 3.9,  r: 2.5,color: 0xB0B0B0, kind: KIND_PLANET, speed: 4.15 },
        { name: 'Venus',   dist: 7.2,  r: 4,  color: 0xE8A84C, kind: KIND_PLANET, speed: 1.63 },
        { name: 'Earth',   dist: 10,   r: 4.5,color: 0x4DABF7, kind: KIND_PLANET, speed: 1.0 },
        { name: 'Mars',    dist: 15.2, r: 3,  color: 0xE74C3C, kind: KIND_PLANET, speed: 0.53 },
        { name: 'Jupiter', dist: 52,   r: 12, color: 0xDEB887, kind: KIND_PLANET, speed: 0.084 },
        { name: 'Saturn',  dist: 95,   r: 10, color: 0xF0D58C, kind: KIND_PLANET, speed: 0.034 },
        { name: 'Uranus',  dist: 192,  r: 6.5,color: 0x7EC8E3, kind: KIND_PLANET, speed: 0.012 },
        { name: 'Neptune', dist: 301,  r: 6,  color: 0x3B5998, kind: KIND_PLANET, speed: 0.006 },
    ];
    // Generate asteroids for fallback too
    generateAsteroids();
}

function resizeCanvas() {
    if (!canvas) return;
    // Canvas fills the hero — use its own parent (the hero element)
    const hero = canvas.parentElement;
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
    }
}

// ── Coordinate transforms ──
function galToScreen(xKpc, yKpc) {
    const scale = Math.min(canvas.width, canvas.height) / 36; // ~±18 kpc visible
    return {
        x: canvas.width / 2 + xKpc * scale,
        y: canvas.height / 2 - yKpc * scale
    };
}

function auToScreen(xAu, yAu) {
    // Auto-scale so outermost planet (Neptune ~30 AU) fits in 90% of smaller dimension
    const maxAu = 35;
    const scale = (Math.min(canvas.width, canvas.height) * 0.45) / maxAu;
    return {
        x: canvas.width / 2 + xAu * scale,
        y: canvas.height / 2 - yAu * scale
    };
}

// ── Color util ──
function hexToRgb(hex) {
    return { r: (hex >> 16) & 0xFF, g: (hex >> 8) & 0xFF, b: hex & 0xFF };
}

function rgbStr(hex, alpha) {
    const c = hexToRgb(hex);
    return `rgba(${c.r},${c.g},${c.b},${alpha})`;
}

// ── Drawing: Galaxy view ──
function drawGalaxy(fade) {
    const alpha = fade;
    const t = performance.now() * 0.001;

    // ── Galactic diffuse halo ──
    const center = galToScreen(0, 0);
    const haloR = Math.min(canvas.width, canvas.height) * 0.42;
    const halo = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, haloR);
    halo.addColorStop(0, `rgba(40,30,60,${0.06 * alpha})`);
    halo.addColorStop(0.5, `rgba(20,15,35,${0.03 * alpha})`);
    halo.addColorStop(1, 'transparent');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(center.x, center.y, haloR, 0, Math.PI * 2);
    ctx.fill();

    // ── Spiral arms — multi-layered dust + gas ──
    // Layer 1: Broad diffuse gas
    ctx.globalAlpha = alpha * 0.06;
    for (let i = 0; i < galSpiralCount; i += 2) {
        const sx = galSpiralPts[i * 2];
        const sy = galSpiralPts[i * 2 + 1];
        const p = galToScreen(sx, sy);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
        g.addColorStop(0, 'rgba(160,140,200,0.4)');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fill();
    }

    // Layer 2: bright dust particles within arms
    ctx.globalAlpha = alpha * 0.25;
    for (let i = 0; i < galSpiralCount; i++) {
        const sx = galSpiralPts[i * 2];
        const sy = galSpiralPts[i * 2 + 1];
        const jx = sx + Math.sin(i * 0.73) * 0.35;
        const jy = sy + Math.cos(i * 1.17) * 0.35;
        const p = galToScreen(jx, jy);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.0 + (i % 3) * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = i % 5 === 0
            ? 'rgba(200,180,240,1)'  // bluish dust
            : 'rgba(180,160,210,0.8)';
        ctx.fill();
    }

    // Layer 3: HII regions / nebulae along arms (pink-red glowing patches)
    ctx.globalAlpha = alpha * 0.08;
    for (let i = 0; i < galSpiralCount; i += 12) {
        const sx = galSpiralPts[i * 2];
        const sy = galSpiralPts[i * 2 + 1];
        const p = galToScreen(sx, sy);
        const nebR = 5 + (i % 7) * 2;
        const nebGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, nebR);
        const hue = (i * 37) % 60;  // pinkish-red range
        nebGrad.addColorStop(0, `hsla(${330 + hue}, 70%, 60%, 0.5)`);
        nebGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = nebGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, nebR, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ── Galactic center — multi-layered bulge ──
    const bulgeR = Math.min(canvas.width, canvas.height) * 0.1;
    // Outer warm glow
    const bulgeOuter = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, bulgeR);
    bulgeOuter.addColorStop(0, `rgba(255,230,180,${0.2 * alpha})`);
    bulgeOuter.addColorStop(0.3, `rgba(255,200,140,${0.1 * alpha})`);
    bulgeOuter.addColorStop(0.6, `rgba(200,160,120,${0.04 * alpha})`);
    bulgeOuter.addColorStop(1, 'transparent');
    ctx.fillStyle = bulgeOuter;
    ctx.beginPath();
    ctx.arc(center.x, center.y, bulgeR, 0, Math.PI * 2);
    ctx.fill();
    // Inner bright core
    const bulgeInner = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, bulgeR * 0.35);
    bulgeInner.addColorStop(0, `rgba(255,240,200,${0.25 * alpha})`);
    bulgeInner.addColorStop(1, 'transparent');
    ctx.fillStyle = bulgeInner;
    ctx.beginPath();
    ctx.arc(center.x, center.y, bulgeR * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // ── Catalog bodies ──
    const count = galaxy.body_count();
    for (let i = 0; i < count; i++) {
        const x = galPositions[i * 2];
        const y = galPositions[i * 2 + 1];
        const p = galToScreen(x, y);
        const r = galRadii[i];
        const color = galColors[i];
        const kind = galKinds[i];

        if (kind === KIND_BLACKHOLE) {
            drawBlackHole(p.x, p.y, r, color, galSpins[i], alpha);
        } else {
            drawStar(p.x, p.y, r, color, galLuminosities[i], alpha);
        }

        // Name label with subtle text shadow
        ctx.globalAlpha = alpha * 0.75;
        ctx.fillStyle = '#000';
        ctx.font = `${kind === KIND_BLACKHOLE || i === galSolarIdx ? 11 : 9}px "SF Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(galNames[i], p.x + 1, p.y + r + 15);
        ctx.fillStyle = '#ddd';
        ctx.fillText(galNames[i], p.x, p.y + r + 14);
        ctx.globalAlpha = 1;
    }

    // "Click Solar System to zoom" hint — pulsing circle
    if (zoomLevel < 0.1) {
        const solP = galToScreen(galPositions[galSolarIdx * 2], galPositions[galSolarIdx * 2 + 1]);
        const pulse = 0.4 + 0.35 * Math.sin(t * 3);
        ctx.globalAlpha = alpha * pulse;
        ctx.strokeStyle = '#FFD866';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(solP.x, solP.y, 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    }
}

function drawStar(x, y, r, color, luminosity, alpha) {
    ctx.globalAlpha = alpha;
    const logLum = Math.log10(Math.max(luminosity, 0.001));

    // Outer halo (very faint, atmospheric scattering)
    const haloR = r + Math.min(logLum * 6, 35);
    const halo = ctx.createRadialGradient(x, y, 0, x, y, haloR);
    halo.addColorStop(0, rgbStr(color, 0.5));
    halo.addColorStop(0.15, rgbStr(color, 0.2));
    halo.addColorStop(0.5, rgbStr(color, 0.04));
    halo.addColorStop(1, 'transparent');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, haloR, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow — tighter, brighter
    const glowR = r * 2.5;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    glow.addColorStop(0, rgbStr(color, 0.95));
    glow.addColorStop(0.4, rgbStr(color, 0.35));
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Core — bright white center fading to spectral color
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    coreGrad.addColorStop(0, `rgba(255,255,255,${0.95 * alpha})`);
    coreGrad.addColorStop(0.4, rgbStr(color, 1));
    coreGrad.addColorStop(1, rgbStr(color, 0.85));
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Diffraction spikes — for luminous stars only
    if (luminosity > 5) {
        const spikeLen = r + Math.min(logLum * 4, 20);
        ctx.strokeStyle = rgbStr(color, 0.15 * alpha);
        ctx.lineWidth = 0.8;
        for (let a = 0; a < 4; a++) {
            const angle = (a * Math.PI) / 4 + 0.3;
            ctx.beginPath();
            ctx.moveTo(x - Math.cos(angle) * spikeLen, y - Math.sin(angle) * spikeLen);
            ctx.lineTo(x + Math.cos(angle) * spikeLen, y + Math.sin(angle) * spikeLen);
            ctx.stroke();
        }
    }

    ctx.globalAlpha = 1;
}

function drawBlackHole(x, y, r, color, spin, alpha) {
    ctx.globalAlpha = alpha;
    const t = performance.now() * 0.001;

    // ── Relativistic jets (faint, only for large BHs) ──
    if (r > 10) {
        const jetLen = r * 6;
        for (const dir of [-1, 1]) {
            const jg = ctx.createLinearGradient(x, y, x, y + dir * jetLen);
            jg.addColorStop(0, `rgba(120,80,255,${0.25 * alpha})`);
            jg.addColorStop(0.4, `rgba(80,60,200,${0.1 * alpha})`);
            jg.addColorStop(1, 'transparent');
            ctx.fillStyle = jg;
            ctx.beginPath();
            ctx.moveTo(x - r * 0.15, y);
            ctx.lineTo(x + r * 0.15, y);
            ctx.lineTo(x + r * 0.05, y + dir * jetLen);
            ctx.lineTo(x - r * 0.05, y + dir * jetLen);
            ctx.closePath();
            ctx.fill();
        }
    }

    // ── Gravitational lensing ring (Einstein ring) ──
    const lensR = r * 1.8;
    const lensGrad = ctx.createRadialGradient(x, y, r * 1.2, x, y, lensR);
    lensGrad.addColorStop(0, `rgba(180,160,255,${0.12 * alpha})`);
    lensGrad.addColorStop(0.5, `rgba(100,80,200,${0.06 * alpha})`);
    lensGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = lensGrad;
    ctx.beginPath();
    ctx.arc(x, y, lensR, 0, Math.PI * 2);
    ctx.fill();

    // ── Accretion disk — multi-layered with Doppler asymmetry ──
    const diskR = r * 3.0;
    ctx.save();
    ctx.translate(x, y);

    // Doppler beaming: approaching side brighter (left), receding side dimmer (right)
    for (let ring = 0; ring < 3; ring++) {
        const ringR = diskR * (0.6 + ring * 0.2);
        const ringH = ringR * 0.3;
        const rotSpeed = spin * (1.2 - ring * 0.3);

        ctx.save();
        ctx.rotate(t * rotSpeed + ring * 0.5);

        // Draw elliptical disk slices with varying brightness
        for (let slice = 0; slice < 32; slice++) {
            const angle = (slice / 32) * Math.PI * 2;
            const nextAngle = ((slice + 1) / 32) * Math.PI * 2;

            // Doppler factor: brighter on approaching side
            const doppler = 0.5 + 0.5 * Math.sin(angle);
            const brightness = doppler * (0.6 - ring * 0.15);

            ctx.beginPath();
            ctx.ellipse(0, 0, ringR, ringH, 0, angle, nextAngle);
            ctx.ellipse(0, 0, ringR * 0.85, ringH * 0.85, 0, nextAngle, angle, true);
            ctx.closePath();

            const hue = 280 + ring * 30 + doppler * 40; // purple → orange
            ctx.fillStyle = `hsla(${hue}, 80%, ${40 + doppler * 30}%, ${brightness * alpha})`;
            ctx.fill();
        }
        ctx.restore();
    }
    ctx.restore();

    // ── Event horizon — pure black core with soft edge ──
    const ehR = r * 0.65;
    const ehGrad = ctx.createRadialGradient(x, y, ehR * 0.5, x, y, ehR);
    ehGrad.addColorStop(0, `rgba(0,0,0,${alpha})`);
    ehGrad.addColorStop(0.8, `rgba(0,0,0,${alpha})`);
    ehGrad.addColorStop(1, `rgba(0,0,0,${0.3 * alpha})`);
    ctx.fillStyle = ehGrad;
    ctx.beginPath();
    ctx.arc(x, y, ehR, 0, Math.PI * 2);
    ctx.fill();

    // ── Photon ring — bright thin ring at ISCO ──
    ctx.beginPath();
    ctx.arc(x, y, r * 0.85, 0, Math.PI * 2);
    const prGlow = 0.6 + 0.2 * Math.sin(t * 2.5);
    ctx.strokeStyle = `rgba(220,180,255,${prGlow * alpha})`;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Inner photon ring
    ctx.beginPath();
    ctx.arc(x, y, r * 0.75, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,200,150,${0.3 * alpha})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.globalAlpha = 1;
}

// ── Drawing: Solar System view ──
function drawSolarSystem(fade) {
    const alpha = fade;
    const t = performance.now() * 0.001;

    let positions, count, days;

    if (sim) {
        // Step the N-body simulation — timeSpeed controls how many steps per frame
        if (!paused) {
            const steps = Math.max(1, Math.round(stepsPerFrame * timeSpeed));
            sim.step(steps);
        }
        positions = sim.positions_au();
        count = sim.count();
        days = sim.elapsed_days();
    } else if (fallbackBodies) {
        // Fallback rendering (no WASM)
        if (!paused) fallbackTime += 0.016 * timeSpeed;
        count = fallbackBodies.length;
        days = fallbackTime * 365.25;
        positions = new Float64Array(count * 2);
        for (let i = 0; i < count; i++) {
            const b = fallbackBodies[i];
            const angle = fallbackTime * b.speed * Math.PI * 2;
            positions[i * 2] = b.dist * Math.cos(angle) * 0.1;
            positions[i * 2 + 1] = b.dist * Math.sin(angle) * 0.1;
        }
    } else return;

    // Orbit trails (faint circles for planets)
    ctx.globalAlpha = alpha * 0.08;
    const centerScreen = auToScreen(0, 0);
    for (let i = 1; i < count; i++) {
        if (sim && solKinds[i] !== KIND_PLANET) continue;
        if (!sim && fallbackBodies[i].kind !== KIND_PLANET) continue;
        const px = positions[i * 2];
        const py = positions[i * 2 + 1];
        const dist = Math.sqrt(px * px + py * py);
        const edge = auToScreen(dist, 0);
        const rPx = edge.x - centerScreen.x;
        ctx.beginPath();
        ctx.arc(centerScreen.x, centerScreen.y, Math.abs(rPx), 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ── Asteroid belt ──
    drawAsteroids(alpha, t);

    // ── Draw bodies ──
    for (let i = 0; i < count; i++) {
        const x = positions[i * 2];
        const y = positions[i * 2 + 1];
        const p = auToScreen(x, y);
        const r = sim ? solRadii[i] : fallbackBodies[i].r;
        const color = sim ? solColors[i] : fallbackBodies[i].color;
        const kind = sim ? solKinds[i] : fallbackBodies[i].kind;
        const name = sim ? solNames[i] : fallbackBodies[i].name;

        if (kind === KIND_STAR) {
            drawSolStar(p.x, p.y, r, color, alpha);
        } else if (kind === KIND_PLANET) {
            drawPlanet(p.x, p.y, r, color, alpha, name);
        } else {
            drawSatellite(p.x, p.y, r, color, alpha);
        }

        // Labels for planets + Sun
        if (kind !== KIND_SAT) {
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillStyle = '#ccc';
            ctx.font = `${kind === KIND_STAR ? 11 : 9}px "SF Mono", monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(name, p.x, p.y + r + 12);
            ctx.globalAlpha = 1;
        }
    }

    // ── Custom bodies (if custom mode) ──
    if (customMode) drawCustomBodies(alpha);

    // ── Event detection (every ~30 frames) ──
    if (!paused && t - lastEventCheck > 0.5) {
        lastEventCheck = t;
        checkEvents(positions, count, days);
    }

    // ── Event flash ──
    drawEventFlash(alpha, t);

    // ── HUD — elapsed time + speed ──
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillStyle = '#aaa';
    ctx.font = '11px "SF Mono", monospace';
    ctx.textAlign = 'left';
    const years = (days / 365.25).toFixed(2);
    const speedLabel = paused ? '⏸ PAUSED' : `${timeSpeed.toFixed(1)}×`;
    const bodyCount = count + asteroids.length + customBodies.length;
    ctx.fillText(`T + ${Math.floor(days)}d (${years} yr)  │  ${bodyCount} bodies  │  ${speedLabel}  │  N-body leapfrog`, 12, canvas.height - 12);
    ctx.globalAlpha = 1;
}

// ── Asteroid belt rendering ──
function drawAsteroids(alpha, t) {
    if (asteroids.length === 0) return;
    ctx.globalAlpha = alpha * 0.6;
    for (let i = 0; i < asteroids.length; i++) {
        const a = asteroids[i];
        // Animate orbital position
        if (!paused) a.theta += a.speed * timeSpeed * 0.002;
        const r = a.a * (1 - a.e * Math.cos(a.theta + a.phase));
        const ax = r * Math.cos(a.theta);
        const ay = r * Math.sin(a.theta);
        const p = auToScreen(ax, ay);

        // Twinkling
        const twinkle = 0.5 + 0.5 * Math.sin(t * 2.0 + i * 0.37);
        ctx.globalAlpha = alpha * a.brightness * twinkle * 0.6;
        ctx.fillStyle = '#b0a890';
        ctx.beginPath();
        ctx.arc(p.x, p.y, a.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// ── Event detection ──
function checkEvents(positions, count, days) {
    if (!sim) return;
    // Only check planets (indices 1-8 typically)
    const planetIndices = [];
    for (let i = 0; i < count; i++) {
        if (solKinds[i] === KIND_PLANET) planetIndices.push(i);
    }
    const sunX = positions[0], sunY = positions[1];

    // Conjunction detection — two planets within 5° as seen from Sun
    for (let a = 0; a < planetIndices.length; a++) {
        for (let b = a + 1; b < planetIndices.length; b++) {
            const ia = planetIndices[a], ib = planetIndices[b];
            const ax = positions[ia * 2] - sunX, ay = positions[ia * 2 + 1] - sunY;
            const bx = positions[ib * 2] - sunX, by = positions[ib * 2 + 1] - sunY;
            const angleA = Math.atan2(ay, ax);
            const angleB = Math.atan2(by, bx);
            let diff = Math.abs(angleA - angleB);
            if (diff > Math.PI) diff = Math.PI * 2 - diff;
            if (diff < 0.087) { // ~5 degrees
                const msg = `⚡ Conjunction: ${solNames[ia]} — ${solNames[ib]}`;
                pushEvent(msg, days, positions[ia * 2], positions[ia * 2 + 1]);
            }
        }
    }

    // Opposition detection — planet opposite from Sun relative to Earth
    const earthIdx = planetIndices.find(i => solNames[i] === 'Earth');
    if (earthIdx !== undefined) {
        const ex = positions[earthIdx * 2], ey = positions[earthIdx * 2 + 1];
        for (const pi of planetIndices) {
            if (pi === earthIdx) continue;
            const px = positions[pi * 2] - ex, py = positions[pi * 2 + 1] - ey;
            const sx = sunX - ex, sy = sunY - ey;
            const anglePlanet = Math.atan2(py, px);
            const angleSun = Math.atan2(sy, sx);
            let diff = Math.abs(anglePlanet - angleSun);
            if (diff > Math.PI) diff = Math.PI * 2 - diff;
            if (diff > Math.PI - 0.05) { // Nearly opposite
                const msg = `🌑 Opposition: ${solNames[pi]}`;
                pushEvent(msg, days, positions[pi * 2], positions[pi * 2 + 1]);
            }
        }
    }

    // Close approach — any two bodies within threshold (0.05 AU for moons, 0.3 AU for planets)
    for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
            if (solKinds[i] === KIND_STAR || solKinds[j] === KIND_STAR) continue;
            const dx = positions[i * 2] - positions[j * 2];
            const dy = positions[i * 2 + 1] - positions[j * 2 + 1];
            const dist = Math.sqrt(dx * dx + dy * dy);
            const threshold = (solKinds[i] === KIND_SAT || solKinds[j] === KIND_SAT) ? 0.008 : 0.15;
            if (dist < threshold && solParents[i] !== j && solParents[j] !== i) {
                const msg = `☄️ Close approach: ${solNames[i]} ↔ ${solNames[j]} (${dist.toFixed(3)} AU)`;
                pushEvent(msg, days, positions[i * 2], positions[i * 2 + 1]);
            }
        }
    }
}

function pushEvent(msg, days, auX, auY) {
    // Deduplicate: don't push same type within ~30 days
    const base = msg.split(':')[0];
    if (eventLog.length > 0) {
        const last = eventLog[eventLog.length - 1];
        if (last.msg.startsWith(base) && Math.abs(last.days - days) < 30) return;
    }
    const p = auToScreen(auX, auY);
    eventLog.push({ msg, days, x: p.x, y: p.y });
    if (eventLog.length > MAX_EVENTS) eventLog.shift();
    eventFlash = { msg, time: performance.now() * 0.001, x: p.x, y: p.y };
}

function drawEventFlash(alpha, t) {
    if (!eventFlash) return;
    const age = t - eventFlash.time;
    if (age > 4) { eventFlash = null; return; }
    const fade = age < 0.3 ? age / 0.3 : age > 3 ? 1 - (age - 3) : 1;
    ctx.globalAlpha = alpha * fade * 0.9;
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = 'rgba(138,43,226,0.6)';
    ctx.lineWidth = 1;

    // Flash badge at top
    ctx.font = '12px "SF Mono", monospace';
    const textW = ctx.measureText(eventFlash.msg).width;
    const bx = canvas.width / 2 - textW / 2 - 12;
    const by = 60;
    roundRect(bx, by, textW + 24, 28, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e0d0ff';
    ctx.textAlign = 'center';
    ctx.fillText(eventFlash.msg, canvas.width / 2, by + 18);

    // Glowing marker at position
    if (eventFlash.x > 0 && eventFlash.y > 0) {
        ctx.beginPath();
        ctx.arc(eventFlash.x, eventFlash.y, 8 + age * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(138,43,226,${fade * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ── Custom system builder ──
function drawCustomBodies(alpha) {
    const t = performance.now() * 0.001;
    // Simple N-body step for custom bodies
    if (!paused && customBodies.length > 1) stepCustomBodies();

    for (let i = 0; i < customBodies.length; i++) {
        const b = customBodies[i];
        const p = auToScreen(b.x, b.y);

        if (b.kind === KIND_STAR) {
            drawSolStar(p.x, p.y, b.r, b.color, alpha);
        } else {
            drawPlanet(p.x, p.y, b.r, b.color, alpha, b.name);
        }

        // Name label
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = '#9f9';
        ctx.font = '9px "SF Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(b.name, p.x, p.y + b.r + 12);
        ctx.globalAlpha = 1;
    }

    // Placing body preview
    if (placingBody) {
        const mp = auToScreen(placingBody.x, placingBody.y);
        ctx.globalAlpha = alpha * 0.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#9f9';
        ctx.beginPath();
        ctx.arc(mp.x, mp.y, placingBody.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Velocity vector if dragging
        if (dragStart) {
            ctx.beginPath();
            ctx.moveTo(mp.x, mp.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = '#f66';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Arrow head
            const angle = Math.atan2(mouseY - mp.y, mouseX - mp.x);
            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY);
            ctx.lineTo(mouseX - 8 * Math.cos(angle - 0.4), mouseY - 8 * Math.sin(angle - 0.4));
            ctx.lineTo(mouseX - 8 * Math.cos(angle + 0.4), mouseY - 8 * Math.sin(angle + 0.4));
            ctx.closePath();
            ctx.fillStyle = '#f66';
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}

function stepCustomBodies() {
    const G = 2.96e-4; // AU³ / (M☉ · day²)
    const dt = 0.5 * timeSpeed;
    for (let i = 0; i < customBodies.length; i++) {
        let ax = 0, ay = 0;
        for (let j = 0; j < customBodies.length; j++) {
            if (i === j) continue;
            const dx = customBodies[j].x - customBodies[i].x;
            const dy = customBodies[j].y - customBodies[i].y;
            const dist2 = dx * dx + dy * dy + 0.01;
            const dist = Math.sqrt(dist2);
            const f = G * customBodies[j].mass / dist2;
            ax += f * dx / dist;
            ay += f * dy / dist;
        }
        customBodies[i].vx += ax * dt;
        customBodies[i].vy += ay * dt;
    }
    for (const b of customBodies) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
    }
}

function drawSolStar(x, y, r, color, alpha) {
    ctx.globalAlpha = alpha;
    const t = performance.now() * 0.001;

    // Outer corona — pulsating
    const coronaPulse = 1 + 0.08 * Math.sin(t * 1.5);
    const coronaR = r * 4 * coronaPulse;
    const corona = ctx.createRadialGradient(x, y, r * 0.3, x, y, coronaR);
    corona.addColorStop(0, rgbStr(color, 0.6));
    corona.addColorStop(0.15, rgbStr(color, 0.25));
    corona.addColorStop(0.4, rgbStr(0xFF9F43, 0.08));
    corona.addColorStop(1, 'transparent');
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(x, y, coronaR, 0, Math.PI * 2);
    ctx.fill();

    // Solar prominences (subtle flares)
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + t * 0.2;
        const flareLen = r * (1.8 + 0.5 * Math.sin(t * 2.3 + i * 1.7));
        const fx = x + Math.cos(angle) * flareLen;
        const fy = y + Math.sin(angle) * flareLen;
        const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, r * 0.6);
        fg.addColorStop(0, `rgba(255,180,50,${0.12 * alpha})`);
        fg.addColorStop(1, 'transparent');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(fx, fy, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }

    // Core — white-hot center → spectral color
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    coreGrad.addColorStop(0, '#fffef0');
    coreGrad.addColorStop(0.3, '#fff5d0');
    coreGrad.addColorStop(0.6, rgbStr(color, 1));
    coreGrad.addColorStop(1, rgbStr(color, 0.85));
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Surface detail — subtle granulation
    ctx.globalAlpha = alpha * 0.06;
    for (let i = 0; i < 8; i++) {
        const gx = x + (Math.sin(i * 2.3 + t * 0.5) * r * 0.5);
        const gy = y + (Math.cos(i * 3.1 + t * 0.3) * r * 0.5);
        ctx.beginPath();
        ctx.arc(gx, gy, r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

function drawPlanet(x, y, r, color, alpha, name) {
    ctx.globalAlpha = alpha;

    // ── Atmosphere glow (all planets) ──
    const glowR = r * 2.2;
    const glow = ctx.createRadialGradient(x, y, r * 0.9, x, y, glowR);
    glow.addColorStop(0, rgbStr(color, 0.12));
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();

    // ── Body base ──
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    const bodyGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    bodyGrad.addColorStop(0, rgbStr(color, 1));
    bodyGrad.addColorStop(1, rgbStr(color, 0.5));
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // ── Per-planet unique features ──
    if (name === 'Jupiter') {
        // Banded atmosphere — alternating horizontal stripes
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.clip();
        const bands = [0.78, 0.58, 0.38, 0.18, -0.02, -0.22, -0.42, -0.62, -0.82];
        const bandColors = ['rgba(180,140,90,0.3)', 'rgba(210,170,110,0.15)', 'rgba(160,110,60,0.3)',
                            'rgba(220,180,120,0.12)', 'rgba(190,100,50,0.35)', 'rgba(220,180,120,0.12)',
                            'rgba(160,110,60,0.3)', 'rgba(210,170,110,0.15)', 'rgba(180,140,90,0.3)'];
        for (let i = 0; i < bands.length; i++) {
            const by = y + bands[i] * r;
            ctx.fillStyle = bandColors[i];
            ctx.fillRect(x - r, by, r * 2, r * 0.2);
        }
        // Great Red Spot
        ctx.beginPath();
        ctx.ellipse(x + r * 0.25, y + r * 0.15, r * 0.22, r * 0.14, 0.1, 0, Math.PI * 2);
        const spotGrad = ctx.createRadialGradient(x + r * 0.25, y + r * 0.15, 0, x + r * 0.25, y + r * 0.15, r * 0.22);
        spotGrad.addColorStop(0, 'rgba(200,80,40,0.5)');
        spotGrad.addColorStop(1, 'rgba(180,100,60,0.15)');
        ctx.fillStyle = spotGrad;
        ctx.fill();
        ctx.restore();
    }

    else if (name === 'Saturn') {
        // ── Ring system — multi-band with Cassini division ──
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, 0.28);

        // C ring (faint inner)
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180,160,120,${0.15 * alpha})`;
        ctx.lineWidth = r * 0.15;
        ctx.stroke();

        // B ring (bright main)
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.85, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(240,213,140,${0.4 * alpha})`;
        ctx.lineWidth = r * 0.35;
        ctx.stroke();

        // Cassini Division (dark gap)
        ctx.beginPath();
        ctx.arc(0, 0, r * 2.15, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(5,5,16,${0.6 * alpha})`;
        ctx.lineWidth = r * 0.06;
        ctx.stroke();

        // A ring (outer)
        ctx.beginPath();
        ctx.arc(0, 0, r * 2.45, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(220,200,150,${0.3 * alpha})`;
        ctx.lineWidth = r * 0.25;
        ctx.stroke();

        // F ring (thin outermost)
        ctx.beginPath();
        ctx.arc(0, 0, r * 2.75, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200,180,130,${0.12 * alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    else if (name === 'Earth') {
        // Continents + oceans + clouds
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.clip();
        // Land masses (green-brown patches)
        const lands = [{dx:-0.2, dy:-0.3, s:0.35}, {dx:0.3, dy:0.1, s:0.25}, {dx:-0.1, dy:0.4, s:0.2}];
        for (const l of lands) {
            ctx.beginPath();
            ctx.arc(x + l.dx * r, y + l.dy * r, r * l.s, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(60,140,80,0.3)';
            ctx.fill();
        }
        // Cloud wisps
        ctx.globalAlpha = alpha * 0.2;
        ctx.beginPath();
        ctx.ellipse(x - r * 0.15, y - r * 0.1, r * 0.5, r * 0.12, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + r * 0.2, y + r * 0.3, r * 0.35, r * 0.1, 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.restore();

        // Thin blue atmosphere edge
        ctx.beginPath();
        ctx.arc(x, y, r * 1.05, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(77,171,247,${0.3 * alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
    }

    else if (name === 'Mars') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.clip();
        // Polar ice caps
        ctx.beginPath();
        ctx.ellipse(x, y - r * 0.8, r * 0.4, r * 0.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240,240,255,0.35)';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x, y + r * 0.85, r * 0.3, r * 0.12, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240,240,255,0.25)';
        ctx.fill();
        // Dark regions (Syrtis Major)
        ctx.beginPath();
        ctx.ellipse(x + r * 0.1, y + r * 0.05, r * 0.3, r * 0.4, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(120,40,20,0.2)';
        ctx.fill();
        ctx.restore();
    }

    else if (name === 'Venus') {
        // Thick cloudy atmosphere — uniform yellowish haze
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.beginPath();
        ctx.ellipse(x, y, r * 0.8, r * 0.3, -0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,230,160,0.15)';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x, y + r * 0.2, r * 0.6, r * 0.2, 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240,210,140,0.12)';
        ctx.fill();
        ctx.restore();
    }

    else if (name === 'Neptune' || name === 'Uranus') {
        // Ice giant — subtle atmospheric bands
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.clip();
        for (let b = -0.6; b <= 0.6; b += 0.3) {
            ctx.fillStyle = name === 'Neptune'
                ? 'rgba(30,50,120,0.2)'
                : 'rgba(80,160,180,0.15)';
            ctx.fillRect(x - r, y + b * r, r * 2, r * 0.12);
        }
        ctx.restore();
    }

    // ── Terminator (day/night boundary) — 3D shading ──
    const termGrad = ctx.createLinearGradient(x - r, y, x + r, y);
    termGrad.addColorStop(0, 'transparent');
    termGrad.addColorStop(0.7, 'transparent');
    termGrad.addColorStop(1, `rgba(0,0,0,${0.4 * alpha})`);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = termGrad;
    ctx.fill();

    ctx.globalAlpha = 1;
}

function drawSatellite(x, y, r, color, alpha) {
    ctx.globalAlpha = alpha * 0.9;

    // Subtle glow
    const glowR = r * 2.5;
    const g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    g.addColorStop(0, rgbStr(color, 0.15));
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Body with 3D shading
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    const bodyGrad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 0, x, y, r);
    bodyGrad.addColorStop(0, rgbStr(color, 1));
    bodyGrad.addColorStop(0.7, rgbStr(color, 0.7));
    bodyGrad.addColorStop(1, rgbStr(color, 0.35));
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    ctx.globalAlpha = 1;
}

// ── Interaction ──
function onClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Check custom mode palette clicks first
    if (customMode && zoomLevel > 0.5) {
        const hit = hitTestPalette(mx, my);
        if (hit) {
            startPlacingBody(hit);
            return;
        }
    }

    if (zoomLevel < 0.5) {
        // Check if clicked near Solar System point
        const solP = galToScreen(galPositions[galSolarIdx * 2], galPositions[galSolarIdx * 2 + 1]);
        const d = Math.hypot(mx - solP.x, my - solP.y);
        if (d < 30) {
            zoomTarget = 1;
            return;
        }
    }
    // Toggle zoom (only if not in custom placement mode)
    if (!placingBody) {
        zoomTarget = zoomTarget > 0.5 ? 0 : 1;
    }
}

function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    // Update placing body position
    if (placingBody && !dragStart) {
        const au = screenToAu(mouseX, mouseY);
        placingBody.x = au.x;
        placingBody.y = au.y;
    }
}

function onMouseDown(e) {
    if (e.button !== 0) return;
    if (placingBody && zoomLevel > 0.5) {
        // Start dragging for velocity vector
        dragStart = { x: mouseX, y: mouseY };
    }
}

function onMouseUp(e) {
    if (e.button !== 0) return;
    if (placingBody && dragStart) {
        // Compute velocity from drag vector
        const au1 = screenToAu(dragStart.x, dragStart.y);
        const au2 = screenToAu(mouseX, mouseY);
        placingBody.vx = (au2.x - au1.x) * 5;
        placingBody.vy = (au2.y - au1.y) * 5;

        // Finalize placement
        customBodies.push({ ...placingBody });
        placingBody = null;
        dragStart = null;
    } else if (placingBody) {
        // Place with zero velocity
        placingBody.vx = 0;
        placingBody.vy = 0;
        customBodies.push({ ...placingBody });
        placingBody = null;
    }
}

function onKeyDown(e) {
    switch (e.key) {
        case ' ':
            e.preventDefault();
            paused = !paused;
            updateControlState();
            break;
        case '+': case '=':
            timeSpeed = Math.min(timeSpeed * 1.5, 50);
            updateControlState();
            break;
        case '-': case '_':
            timeSpeed = Math.max(timeSpeed / 1.5, 0.05);
            updateControlState();
            break;
        case 'c': case 'C':
            if (zoomLevel > 0.5) {
                customMode = !customMode;
                updateControlState();
            }
            break;
        case 'Escape':
            if (placingBody) { placingBody = null; dragStart = null; }
            else if (customMode) { customMode = false; updateControlState(); }
            break;
        case 'Delete': case 'Backspace':
            if (customMode && customBodies.length > 0) {
                customBodies.pop();
            }
            break;
    }
}

// ── Screen ↔ AU conversion ──
function screenToAu(sx, sy) {
    const maxAu = 35;
    const scale = (Math.min(canvas.width, canvas.height) * 0.45) / maxAu;
    return {
        x: (sx - canvas.width / 2) / scale,
        y: -(sy - canvas.height / 2) / scale
    };
}

// ── Custom mode: palette & body placement ──
const PALETTE_ITEMS = [
    { label: '★ Star',    kind: KIND_STAR,   r: 14, color: 0xFFD866, mass: 1.0 },
    { label: '● Planet',  kind: KIND_PLANET, r: 5,  color: 0x4DABF7, mass: 0.001 },
    { label: '· Moon',    kind: KIND_SAT,    r: 2,  color: 0xB0B0B0, mass: 0.00001 },
    { label: '◌ Giant',   kind: KIND_PLANET, r: 10, color: 0xDEB887, mass: 0.01 },
];

function hitTestPalette(mx, my) {
    const px = canvas.width - 110;
    const py = 100;
    for (let i = 0; i < PALETTE_ITEMS.length; i++) {
        const iy = py + i * 34;
        if (mx > px && mx < px + 100 && my > iy && my < iy + 28) {
            return PALETTE_ITEMS[i];
        }
    }
    return null;
}

function startPlacingBody(template) {
    const au = screenToAu(mouseX, mouseY);
    placingBody = {
        x: au.x, y: au.y, vx: 0, vy: 0,
        r: template.r, color: template.color,
        kind: template.kind, mass: template.mass,
        name: `${template.label.split(' ')[1]}-${customBodies.length + 1}`
    };
}

function drawPalette(alpha) {
    if (!customMode || zoomLevel < 0.5) return;
    const px = canvas.width - 115;
    const py = 100;

    // Background
    ctx.globalAlpha = alpha * 0.85;
    ctx.fillStyle = 'rgba(10,10,25,0.9)';
    ctx.strokeStyle = 'rgba(138,43,226,0.4)';
    ctx.lineWidth = 1;
    roundRect(px - 5, py - 30, 115, PALETTE_ITEMS.length * 34 + 45, 8);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.fillStyle = '#9f9';
    ctx.font = 'bold 10px "SF Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CREATE MODE', px + 5, py - 12);

    // Items
    for (let i = 0; i < PALETTE_ITEMS.length; i++) {
        const item = PALETTE_ITEMS[i];
        const iy = py + i * 34;
        const hover = mouseX > px && mouseX < px + 100 && mouseY > iy && mouseY < iy + 28;

        ctx.fillStyle = hover ? 'rgba(138,43,226,0.3)' : 'rgba(40,40,60,0.6)';
        roundRect(px, iy, 100, 28, 4);
        ctx.fill();

        ctx.fillStyle = rgbStr(item.color, 1);
        ctx.beginPath();
        ctx.arc(px + 14, iy + 14, Math.min(item.r, 6), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ddd';
        ctx.font = '10px "SF Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, px + 28, iy + 18);
    }
    ctx.globalAlpha = 1;
}

// ── Event log panel ──
function drawEventLog(alpha) {
    if (eventLog.length === 0 || zoomLevel < 0.5) return;
    const px = 12;
    const py = 80;
    const visibleCount = Math.min(eventLog.length, 6);

    ctx.globalAlpha = alpha * 0.8;
    ctx.fillStyle = 'rgba(10,10,25,0.85)';
    ctx.strokeStyle = 'rgba(100,80,180,0.3)';
    ctx.lineWidth = 1;
    roundRect(px, py, 320, visibleCount * 18 + 32, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#b0a0d0';
    ctx.font = 'bold 10px "SF Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('EVENTS', px + 8, py + 14);

    ctx.font = '9px "SF Mono", monospace';
    for (let i = 0; i < visibleCount; i++) {
        const ev = eventLog[eventLog.length - 1 - i];
        ctx.fillStyle = i === 0 ? '#e0d0ff' : '#888';
        const dayStr = `[${Math.floor(ev.days)}d]`;
        ctx.fillText(`${dayStr} ${ev.msg}`, px + 8, py + 30 + i * 18);
    }
    ctx.globalAlpha = 1;
}

// ── Build control panel (DOM overlay) ──
function buildControlPanel() {
    const panel = document.createElement('div');
    panel.id = 'sim-controls';
    panel.innerHTML = `
        <button id="sim-pause" title="Space">⏸</button>
        <input type="range" id="sim-speed" min="-3" max="4" step="0.1" value="0" title="Time speed">
        <span id="sim-speed-label">1.0×</span>
        <button id="sim-create" title="C">✏️ Create</button>
        <button id="sim-reset" title="Reset custom bodies">🗑️</button>
    `;
    canvas.parentElement.appendChild(panel);

    // Wire events
    const pauseBtn = document.getElementById('sim-pause');
    pauseBtn.addEventListener('click', () => {
        paused = !paused;
        updateControlState();
    });

    const speedSlider = document.getElementById('sim-speed');
    speedSlider.addEventListener('input', () => {
        timeSpeed = Math.pow(2, parseFloat(speedSlider.value));
        updateControlState();
    });

    const createBtn = document.getElementById('sim-create');
    createBtn.addEventListener('click', () => {
        if (zoomLevel > 0.5) {
            customMode = !customMode;
            updateControlState();
        }
    });

    const resetBtn = document.getElementById('sim-reset');
    resetBtn.addEventListener('click', () => {
        customBodies.length = 0;
        placingBody = null;
        dragStart = null;
    });
}

function updateControlState() {
    const pauseBtn = document.getElementById('sim-pause');
    const speedLabel = document.getElementById('sim-speed-label');
    const speedSlider = document.getElementById('sim-speed');
    const createBtn = document.getElementById('sim-create');

    if (pauseBtn) pauseBtn.textContent = paused ? '▶' : '⏸';
    if (speedLabel) speedLabel.textContent = `${timeSpeed.toFixed(1)}×`;
    if (speedSlider) speedSlider.value = Math.log2(timeSpeed).toFixed(1);
    if (createBtn) createBtn.style.background = customMode ? 'rgba(138,43,226,0.5)' : '';
}

// ── Mode label — subtle bottom-right indicator ──
function drawModeLabel() {
    let label = zoomLevel < 0.5 ? 'MILKY WAY' : 'SOLAR SYSTEM — N-BODY';
    if (customMode && zoomLevel > 0.5) label += ' + CUSTOM';
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#aaa';
    ctx.font = '9px "SF Mono", "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(label, canvas.width - 16, canvas.height - 16);
    ctx.globalAlpha = 1;
}

// ── Main loop ──
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Smooth zoom interpolation
    zoomLevel += (zoomTarget - zoomLevel) * ZOOM_SPEED;
    if (Math.abs(zoomLevel - zoomTarget) < 0.001) zoomLevel = zoomTarget;

    if (zoomLevel < 0.99) {
        drawGalaxy(1 - zoomLevel);
    }
    if (zoomLevel > 0.01) {
        drawSolarSystem(zoomLevel);
    }

    // Overlays (always drawn when zoomed in)
    if (zoomLevel > 0.5) {
        drawEventLog(zoomLevel);
        drawPalette(zoomLevel);
    }

    drawModeLabel();

    animId = requestAnimationFrame(loop);
}
