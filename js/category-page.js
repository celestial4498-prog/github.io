// ══════════════════════════════════════════════════════════════
//  Celestial — Category Page Dynamic Card Generator
//  Reads CRATES_DATA + page config to build cards automatically
// ══════════════════════════════════════════════════════════════

(function () {
    'use strict';

    // ── Page-to-crate mapping ──
    const PAGE_CONFIG = {
        stars: {
            title: '⭐ Stars',
            tag: 'star',
            tagClass: 'tag-star',
            desc: 'Full stellar models with procedural generation — create any star from red dwarfs to blue supergiants. Every parameter grounded in real constants.',
            crates: ['suns', 'starsfactory'],
            accentVar: '--star-color',
        },
        blackholes: {
            title: '🕳️ Black Holes',
            tag: 'blackhole',
            tagClass: 'tag-blackhole',
            desc: 'Accretion disks, gravitational lensing, shadow rendering — from stellar-mass to supermassive. Ready for cinematic and game engines.',
            crates: ['blackholesfactory', 'sagittariusas'],
            accentVar: '--blackhole-color',
        },
        planets: {
            title: '🪐 Planets',
            tag: 'planet',
            tagClass: 'tag-planet',
            desc: '8 fully modeled planets — each with atmosphere, terrain, geology, rendering materials, and temporal systems. Drop them into your world.',
            crates: ['planetsfactory', 'mercurys', 'venuss', 'earths', 'marss', 'jupiters', 'saturns', 'uranuss', 'neptunes'],
            accentVar: '--planet-color',
        },
        satellites: {
            title: '🌙 Moons',
            tag: 'satellite',
            tagClass: 'tag-satellite',
            desc: '12 moons across 4 planetary systems — surface environments, orbital interactions, and unique terrain for each. Extend any planet with its natural companions.',
            crates: ['satellitesfactory', 'moons', 'phoboss', 'deimoss', 'ioss', 'europas', 'ganymedes', 'callistos', 'titanss', 'enceladuss', 'titanias', 'oberons', 'tritons'],
            accentVar: '--satellite-color',
        },
        dwarfplanets: {
            title: '🔮 Dwarf Planets',
            tag: 'dwarf',
            tagClass: 'tag-dwarf',
            desc: '5 dwarf planets from the Kuiper Belt to the inner Oort Cloud — Pluto, Eris, Haumea, Makemake, Sedna. Each generated via the dwarf planet factory with real orbital elements.',
            crates: ['dwarfplanetsfactory'],
            accentVar: '--accent-glow',
        },
        asteroids: {
            title: '☄️ Asteroids',
            tag: 'asteroid',
            tagClass: 'tag-asteroid',
            desc: '5 major asteroids — Ceres, Vesta, Pallas, Hygiea, Juno. From C-type carbonaceous to V-type basaltic, each with real spectral types, densities, and rotation periods.',
            crates: ['asteroidsfactory'],
            accentVar: '--accent-glow',
        },
        comets: {
            title: '💫 Comets',
            tag: 'comet',
            tagClass: 'tag-comet',
            desc: '5 famous comets — Halley, Encke, Hale-Bopp, 67P/Churyumov-Gerasimenko, Tempel 1. Short-period to long-period, with real orbital data and perihelion velocities.',
            crates: ['cometsfactory'],
            accentVar: '--accent-glow',
        },
        systems: {
            title: '🔭 Systems',
            tag: 'system',
            tagClass: 'tag-system',
            desc: 'The engines that assemble everything — run a full solar system with 36 bodies in real-time, or scale up to galactic dynamics.',
            crates: ['solarsystemsfactory', 'solarsystems'],
            accentVar: '--system-color',
        },
        galaxies: {
            title: '🌀 Galaxies',
            tag: 'galaxy',
            tagClass: 'tag-galaxy',
            desc: 'Galaxy-level simulation — spiral arm dynamics, stellar population synthesis, dark matter halos, interstellar medium phases, and multi-scale gravitational coupling.',
            crates: ['milkyway'],
            accentVar: '--accent-glow',
        },
    };

    // Color mapping for card accents
    const ACCENT_MAP = {
        star: 'var(--star-color)',
        factory: 'var(--factory-color)',
        blackhole: 'var(--blackhole-color)',
        planet: 'var(--planet-color)',
        satellite: 'var(--satellite-color)',
        dwarf: 'var(--accent-glow)',
        asteroid: '#ffb142',
        comet: '#74b9ff',
        system: 'var(--system-color)',
        galaxy: 'var(--accent-glow)',
    };

    const BG_MAP = {
        star: 'rgba(255,216,102,0.1)',
        factory: 'rgba(253,203,110,0.1)',
        blackhole: 'rgba(253,69,86,0.1)',
        planet: 'rgba(0,206,201,0.1)',
        satellite: 'rgba(225,122,255,0.1)',
        dwarf: 'rgba(162,155,254,0.1)',
        asteroid: 'rgba(255,177,66,0.1)',
        comet: 'rgba(116,185,255,0.1)',
        system: 'rgba(85,239,196,0.1)',
        galaxy: 'rgba(162,155,254,0.1)',
    };

    // Determine which page we're on
    const pageId = document.body.dataset.page;
    if (!pageId || !PAGE_CONFIG[pageId]) return;

    const config = PAGE_CONFIG[pageId];
    const contentEl = document.getElementById('category-content');
    if (!contentEl) return;

    // Wait for CRATES_DATA to be available
    if (typeof CRATES_DATA === 'undefined') {
        console.error('CRATES_DATA not loaded');
        return;
    }

    // ── Build page content ──
    let html = '';

    // Section header
    html += `
    <section class="section category-hero">
        <div class="container">
            <div class="section-header reveal">
                <span class="section-tag ${config.tagClass}">${config.tag.charAt(0).toUpperCase() + config.tag.slice(1)}</span>
                <h2>${config.title}</h2>
                <p>${config.desc}</p>
            </div>
        </div>
    </section>`;

    // Crate cards grid
    html += `
    <section class="section">
        <div class="container">
            <div class="crate-grid">`;

    config.crates.forEach(crateId => {
        const data = CRATES_DATA[crateId];
        if (!data) return;

        const cat = data.category;
        const accent = ACCENT_MAP[cat] || 'var(--text-dim)';
        const bg = BG_MAP[cat] || 'rgba(255,255,255,0.05)';
        const tagLabel = CATEGORY_META[cat] ? CATEGORY_META[cat].label : cat;
        const tagClass = 'tag-' + cat;

        const unpublishedBadge = data.published === false
            ? '<span class="badge badge-unpublished">🚧 Unpublished</span>'
            : '';

        html += `
                <a href="#" class="crate-card reveal${data.published === false ? ' crate-unpublished' : ''}" data-crate="${crateId}" data-cat="${cat}" style="--card-accent: ${accent};">
                    <div class="crate-icon">
                        <div class="emoji" style="background:${bg};">${data.emoji}</div>
                    </div>
                    <h3>${data.name}</h3>
                    <div class="desc">${data.tagline}</div>
                    <div class="meta">
                        <span class="badge ${tagClass}">${tagLabel}</span>
                        ${unpublishedBadge}
                        <span>v${data.version}</span>
                        <span>${data.label}</span>
                    </div>
                </a>`;
    });

    html += `
            </div>
        </div>
    </section>`;

    contentEl.innerHTML = html;

    // ── Init scroll reveal for new elements ──
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    contentEl.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // ── Card click → detail panel ──
    contentEl.querySelectorAll('.crate-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const crateId = card.dataset.crate;
            if (crateId && typeof openCrateDetail === 'function') {
                openCrateDetail(crateId);
            }
        });
    });

})();
