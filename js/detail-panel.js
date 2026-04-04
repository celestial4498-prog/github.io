// ══════════════════════════════════════════════════════════════
//  Celestial — Interactive Crate Detail Panel
//  Full-overlay with module tree, constants, source, and canvas demo
// ══════════════════════════════════════════════════════════════

(function () {
    'use strict';

    // ── Panel HTML skeleton (injected once) ──
    const PANEL_HTML = `
    <div class="detail-panel" id="detail-panel" aria-hidden="true">
        <div class="detail-backdrop"></div>
        <div class="detail-body">
            <button class="detail-close" aria-label="Close">&times;</button>
            <div class="detail-scroll">

                <!-- Header -->
                <div class="detail-header">
                    <div class="detail-icon"></div>
                    <div class="detail-header-info">
                        <h1 class="detail-name"></h1>
                        <p class="detail-tagline"></p>
                        <div class="detail-badges"></div>
                    </div>
                </div>

                <!-- Description -->
                <p class="detail-description"></p>

                <!-- Tab bar -->
                <div class="detail-tabs">
                    <button class="detail-tab active" data-dtab="modules">Modules</button>
                    <button class="detail-tab" data-dtab="constants">Constants</button>
                    <button class="detail-tab" data-dtab="source">Source</button>
                    <button class="detail-tab" data-dtab="demo">Demo</button>
                </div>

                <!-- Tab panels -->
                <div class="detail-panel-content">
                    <div class="dtab-panel active" id="dtab-modules"></div>
                    <div class="dtab-panel" id="dtab-constants"></div>
                    <div class="dtab-panel" id="dtab-source"></div>
                    <div class="dtab-panel" id="dtab-demo"></div>
                </div>
            </div>
        </div>
    </div>`;

    // Inject the panel once
    document.body.insertAdjacentHTML('beforeend', PANEL_HTML);

    const panel = document.getElementById('detail-panel');
    const backdrop = panel.querySelector('.detail-backdrop');
    const closeBtn = panel.querySelector('.detail-close');
    const detailIcon = panel.querySelector('.detail-icon');
    const detailName = panel.querySelector('.detail-name');
    const detailTagline = panel.querySelector('.detail-tagline');
    const detailBadges = panel.querySelector('.detail-badges');
    const detailDesc = panel.querySelector('.detail-description');
    const tabBtns = panel.querySelectorAll('.detail-tab');
    const tabPanels = panel.querySelectorAll('.dtab-panel');
    const modulesPanel = document.getElementById('dtab-modules');
    const constantsPanel = document.getElementById('dtab-constants');
    const sourcePanel = document.getElementById('dtab-source');
    const demoPanel = document.getElementById('dtab-demo');

    let currentCrate = null;
    let demoCanvas = null;
    let demoCtx = null;
    let demoAnimId = null;

    // ── Tab switching ──
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById('dtab-' + btn.dataset.dtab);
            if (target) target.classList.add('active');

            // Start demo canvas if switching to demo tab
            if (btn.dataset.dtab === 'demo' && currentCrate) {
                startDemo(currentCrate);
            } else {
                stopDemo();
            }
        });
    });

    // ── Close panel ──
    function closePanel() {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        stopDemo();
        currentCrate = null;
    }

    closeBtn.addEventListener('click', closePanel);
    backdrop.addEventListener('click', closePanel);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
    });

    // ── Open panel ──
    function openPanel(crateId) {
        const data = window.CRATES_DATA && window.CRATES_DATA[crateId];
        if (!data) return;
        currentCrate = data;

        // Header
        detailIcon.innerHTML = `<span class="emoji">${data.emoji}</span>`;
        detailIcon.style.background = `${data.color}15`;
        detailName.textContent = data.name;
        detailTagline.textContent = data.tagline;
        const unpubHtml = data.published === false
            ? '<span class="badge badge-unpublished">🚧 Unpublished</span>'
            : '';
        detailBadges.innerHTML = `
            <span class="badge" style="background:${data.color}22;color:${data.color}">${data.category}</span>
            ${unpubHtml}
            <span class="badge" style="background:rgba(255,255,255,0.06);color:var(--text-dim)">${data.version}</span>
            <a href="${data.github}" target="_blank" rel="noopener" class="badge badge-link" style="background:rgba(255,255,255,0.06);color:var(--text-dim)">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style="vertical-align:-1px"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                GitHub
            </a>
        `;

        detailDesc.textContent = data.description;

        // ── Modules tab ──
        buildModulesTab(data);

        // ── Constants tab ──
        buildConstantsTab(data);

        // ── Source tab ──
        buildSourceTab(data);

        // ── Demo tab ──
        buildDemoTab(data);

        // Reset to first tab
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        tabBtns[0].classList.add('active');
        tabPanels[0].classList.add('active');

        // Open
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        panel.querySelector('.detail-scroll').scrollTop = 0;
    }

    // ── Build modules tab ──
    function buildModulesTab(data) {
        if (!data.modules || !data.modules.length) {
            modulesPanel.innerHTML = '<p class="detail-empty">No modules documented yet.</p>';
            return;
        }
        let html = '<div class="detail-module-tree">';
        data.modules.forEach((m, idx) => {
            html += `
            <div class="detail-module-item" data-idx="${idx}">
                <span class="detail-module-icon">${m.icon}</span>
                <div class="detail-module-info">
                    <span class="detail-module-name">${escHtml(m.name)}</span>
                    <span class="detail-module-desc">${escHtml(m.desc)}</span>
                </div>
                <span class="detail-module-arrow">›</span>
            </div>`;
        });
        html += '</div>';

        // Selected module detail area
        html += '<div class="detail-module-detail" id="module-detail-area"></div>';
        modulesPanel.innerHTML = html;

        // Click to select module
        modulesPanel.querySelectorAll('.detail-module-item').forEach(item => {
            item.addEventListener('click', () => {
                // toggle active
                modulesPanel.querySelectorAll('.detail-module-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                const idx = parseInt(item.dataset.idx);
                const mod = data.modules[idx];
                const area = document.getElementById('module-detail-area');
                area.innerHTML = `
                    <div class="module-detail-card">
                        <div class="module-detail-header">
                            <span class="module-detail-icon">${mod.icon}</span>
                            <h3>${escHtml(mod.name)}</h3>
                        </div>
                        <p>${escHtml(mod.desc)}</p>
                        <div class="module-detail-path">
                            <code>${escHtml(data.name)}::${escHtml(mod.name.replace(/ /g, '_').replace(/\//g, '::'))}</code>
                        </div>
                    </div>`;
                area.classList.add('visible');
            });
        });
    }

    // ── Build constants tab ──
    function buildConstantsTab(data) {
        if (!data.constants || !data.constants.length) {
            constantsPanel.innerHTML = '<p class="detail-empty">No constants exported by this crate — check modules for computed values.</p>';
            return;
        }
        let html = '<div class="detail-constants-grid">';
        data.constants.forEach(c => {
            html += `
            <div class="detail-const-card">
                <div class="detail-const-name"><code>${escHtml(c.name)}</code></div>
                <div class="detail-const-value">${escHtml(c.value)}</div>
                <div class="detail-const-desc">${escHtml(c.desc)}</div>
            </div>`;
        });
        html += '</div>';
        constantsPanel.innerHTML = html;
    }

    // ── Build source tab ──
    function buildSourceTab(data) {
        if (!data.source) {
            sourcePanel.innerHTML = '<p class="detail-empty">No source preview available.</p>';
            return;
        }
        sourcePanel.innerHTML = `
        <div class="detail-source-viewer">
            <div class="detail-source-header">
                <span>src/lib.rs</span>
                <span class="detail-source-lang">Rust</span>
            </div>
            <pre class="detail-source-body"><code>${highlightRust(data.source)}</code></pre>
        </div>`;
    }

    // ── Build demo tab ──
    function buildDemoTab(data) {
        demoPanel.innerHTML = `
        <div class="detail-demo-container">
            <canvas id="detail-demo-canvas" width="600" height="400"></canvas>
            <div class="detail-demo-controls" id="demo-controls"></div>
            <div class="detail-demo-info" id="demo-info"></div>
        </div>`;
    }

    // ── Demo canvas rendering ──
    function stopDemo() {
        if (demoAnimId) {
            cancelAnimationFrame(demoAnimId);
            demoAnimId = null;
        }
        demoCanvas = null;
        demoCtx = null;
    }

    function startDemo(data) {
        stopDemo();
        demoCanvas = document.getElementById('detail-demo-canvas');
        if (!demoCanvas) return;
        demoCtx = demoCanvas.getContext('2d');

        // Resize canvas to container
        const container = demoCanvas.parentElement;
        demoCanvas.width = container.clientWidth;
        demoCanvas.height = Math.min(500, container.clientWidth * 0.6);

        const controlsEl = document.getElementById('demo-controls');
        const infoEl = document.getElementById('demo-info');

        const cat = data.category;

        if (cat === 'star' || data.name === 'suns') {
            buildStarDemo(data, controlsEl, infoEl);
        } else if (cat === 'blackhole') {
            buildBlackHoleDemo(data, controlsEl, infoEl);
        } else if (cat === 'planet') {
            buildPlanetDemo(data, controlsEl, infoEl);
        } else if (cat === 'satellite') {
            buildSatelliteDemo(data, controlsEl, infoEl);
        } else if (cat === 'factory') {
            buildFactoryDemo(data, controlsEl, infoEl);
        } else if (cat === 'system') {
            buildSystemDemo(data, controlsEl, infoEl);
        } else {
            infoEl.innerHTML = '<p>Interactive demo for this module is coming soon.</p>';
        }
    }

    // ═══════ DEMO: Stars ═══════
    function buildStarDemo(data, controlsEl, infoEl) {
        let temp = 5778, radius = 1.0, luminosity = 1.0;
        if (data.constants) {
            const tConst = data.constants.find(c => c.name.includes('EFFECTIVE_TEMP') || c.name.includes('TEMP'));
            if (tConst) temp = parseFloat(tConst.value.replace(/[^\d.]/g, ''));
        }

        controlsEl.innerHTML = `
            <label>Temperature <span id="demo-temp-val">${temp}</span> K
                <input type="range" id="demo-temp" min="2500" max="40000" value="${temp}" step="100">
            </label>
            <label>Radius <span id="demo-rad-val">${radius.toFixed(1)}</span> R☉
                <input type="range" id="demo-radius" min="0.1" max="20" value="${radius}" step="0.1">
            </label>`;

        const tempSlider = document.getElementById('demo-temp');
        const radSlider = document.getElementById('demo-radius');
        const tempVal = document.getElementById('demo-temp-val');
        const radVal = document.getElementById('demo-rad-val');

        tempSlider.addEventListener('input', () => { temp = +tempSlider.value; tempVal.textContent = temp; });
        radSlider.addEventListener('input', () => { radius = +radSlider.value; radVal.textContent = radius.toFixed(1); });

        function loop() {
            const w = demoCanvas.width, h = demoCanvas.height;
            const cx = w / 2, cy = h / 2;
            demoCtx.clearRect(0, 0, w, h);

            const col = tempToColor(temp);
            const r = 20 + radius * 12;
            const t = performance.now() * 0.001;

            // Corona
            const coronaR = r * 3.5 * (1 + 0.06 * Math.sin(t * 1.5));
            const corona = demoCtx.createRadialGradient(cx, cy, r * 0.3, cx, cy, coronaR);
            corona.addColorStop(0, `rgba(${col.r},${col.g},${col.b},0.5)`);
            corona.addColorStop(0.3, `rgba(${col.r},${col.g},${col.b},0.15)`);
            corona.addColorStop(1, 'transparent');
            demoCtx.fillStyle = corona;
            demoCtx.beginPath();
            demoCtx.arc(cx, cy, coronaR, 0, Math.PI * 2);
            demoCtx.fill();

            // Prominences
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + t * 0.15;
                const fLen = r * (1.6 + 0.4 * Math.sin(t * 2 + i * 1.7));
                const fx = cx + Math.cos(angle) * fLen;
                const fy = cy + Math.sin(angle) * fLen;
                const fg = demoCtx.createRadialGradient(fx, fy, 0, fx, fy, r * 0.5);
                fg.addColorStop(0, `rgba(${Math.min(col.r + 50, 255)},${Math.min(col.g, 200)},50,0.15)`);
                fg.addColorStop(1, 'transparent');
                demoCtx.fillStyle = fg;
                demoCtx.beginPath();
                demoCtx.arc(fx, fy, r * 0.5, 0, Math.PI * 2);
                demoCtx.fill();
            }

            // Core
            demoCtx.beginPath();
            demoCtx.arc(cx, cy, r, 0, Math.PI * 2);
            const cg = demoCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
            cg.addColorStop(0, '#fffef0');
            cg.addColorStop(0.3, `rgba(${col.r},${col.g},${col.b},1)`);
            cg.addColorStop(1, `rgba(${col.r},${col.g},${col.b},0.85)`);
            demoCtx.fillStyle = cg;
            demoCtx.fill();

            // Granulation
            demoCtx.globalAlpha = 0.05;
            for (let i = 0; i < 10; i++) {
                const gx = cx + Math.sin(i * 2.3 + t * 0.4) * r * 0.5;
                const gy = cy + Math.cos(i * 3.1 + t * 0.3) * r * 0.5;
                demoCtx.beginPath();
                demoCtx.arc(gx, gy, r * 0.25, 0, Math.PI * 2);
                demoCtx.fillStyle = '#fff';
                demoCtx.fill();
            }
            demoCtx.globalAlpha = 1;

            luminosity = Math.pow(radius, 2) * Math.pow(temp / 5778, 4);
            infoEl.innerHTML = `<span>L = ${luminosity.toFixed(2)} L☉</span>
                <span>Spectral: ${spectralClass(temp)}</span>
                <span>Stefan-Boltzmann: L ∝ R²T⁴</span>`;

            demoAnimId = requestAnimationFrame(loop);
        }
        loop();
    }

    // ═══════ DEMO: Black Holes ═══════
    function buildBlackHoleDemo(data, controlsEl, infoEl) {
        let mass = 10, spin = 0.5;
        if (data.name === 'sagittariusas') { mass = 4e6; spin = 0.9; }
        else if (data.name === 'blackholesfactory') { mass = 21.2; spin = 0.998; }

        const logMass = Math.log10(mass);
        controlsEl.innerHTML = `
            <label>Mass <span id="demo-mass-val">${mass.toExponential(1)}</span> M☉
                <input type="range" id="demo-mass" min="0.5" max="10" value="${logMass}" step="0.1">
            </label>
            <label>Spin <span id="demo-spin-val">${spin.toFixed(2)}</span>
                <input type="range" id="demo-spin" min="0" max="0.998" value="${spin}" step="0.01">
            </label>`;

        const massSlider = document.getElementById('demo-mass');
        const spinSlider = document.getElementById('demo-spin');
        const massVal = document.getElementById('demo-mass-val');
        const spinVal = document.getElementById('demo-spin-val');

        massSlider.addEventListener('input', () => { mass = Math.pow(10, +massSlider.value); massVal.textContent = mass.toExponential(1); });
        spinSlider.addEventListener('input', () => { spin = +spinSlider.value; spinVal.textContent = spin.toFixed(2); });

        function loop() {
            const w = demoCanvas.width, h = demoCanvas.height;
            const cx = w / 2, cy = h / 2;
            demoCtx.clearRect(0, 0, w, h);
            const t = performance.now() * 0.001;

            const r = 30 + Math.log10(mass) * 8;

            // Jets
            if (mass > 100) {
                const jetLen = r * 5;
                for (const dir of [-1, 1]) {
                    const jg = demoCtx.createLinearGradient(cx, cy, cx, cy + dir * jetLen);
                    jg.addColorStop(0, `rgba(120,80,255,0.3)`);
                    jg.addColorStop(0.5, `rgba(80,60,200,0.1)`);
                    jg.addColorStop(1, 'transparent');
                    demoCtx.fillStyle = jg;
                    demoCtx.beginPath();
                    demoCtx.moveTo(cx - r * 0.12, cy);
                    demoCtx.lineTo(cx + r * 0.12, cy);
                    demoCtx.lineTo(cx + r * 0.04, cy + dir * jetLen);
                    demoCtx.lineTo(cx - r * 0.04, cy + dir * jetLen);
                    demoCtx.closePath();
                    demoCtx.fill();
                }
            }

            // Lensing ring
            const lR = r * 1.8;
            const lGrad = demoCtx.createRadialGradient(cx, cy, r * 1.1, cx, cy, lR);
            lGrad.addColorStop(0, 'rgba(180,160,255,0.12)');
            lGrad.addColorStop(1, 'transparent');
            demoCtx.fillStyle = lGrad;
            demoCtx.beginPath();
            demoCtx.arc(cx, cy, lR, 0, Math.PI * 2);
            demoCtx.fill();

            // Accretion disk
            const diskR = r * 3;
            demoCtx.save();
            demoCtx.translate(cx, cy);
            for (let ring = 0; ring < 3; ring++) {
                const rR = diskR * (0.6 + ring * 0.18);
                const rH = rR * 0.3;
                demoCtx.save();
                demoCtx.rotate(t * spin * (1.2 - ring * 0.3) + ring * 0.5);
                for (let sl = 0; sl < 40; sl++) {
                    const a = (sl / 40) * Math.PI * 2;
                    const na = ((sl + 1) / 40) * Math.PI * 2;
                    const doppler = 0.5 + 0.5 * Math.sin(a);
                    const brightness = doppler * (0.55 - ring * 0.12);
                    demoCtx.beginPath();
                    demoCtx.ellipse(0, 0, rR, rH, 0, a, na);
                    demoCtx.ellipse(0, 0, rR * 0.85, rH * 0.85, 0, na, a, true);
                    demoCtx.closePath();
                    const hue = 280 + ring * 30 + doppler * 40;
                    demoCtx.fillStyle = `hsla(${hue},80%,${40 + doppler * 30}%,${brightness})`;
                    demoCtx.fill();
                }
                demoCtx.restore();
            }
            demoCtx.restore();

            // Event horizon
            const ehG = demoCtx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 0.65);
            ehG.addColorStop(0, 'rgba(0,0,0,1)');
            ehG.addColorStop(0.8, 'rgba(0,0,0,1)');
            ehG.addColorStop(1, 'rgba(0,0,0,0.3)');
            demoCtx.fillStyle = ehG;
            demoCtx.beginPath();
            demoCtx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
            demoCtx.fill();

            // Photon rings
            demoCtx.beginPath();
            demoCtx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
            demoCtx.strokeStyle = `rgba(220,180,255,${0.5 + 0.2 * Math.sin(t * 2.5)})`;
            demoCtx.lineWidth = 2;
            demoCtx.stroke();

            const rs = 2 * 6.674e-11 * mass * 1.989e30 / (3e8 * 3e8);
            const isco = spin > 0.5 ? rs * (3 + Math.sqrt(3 - 2 * spin)) : rs * 3;
            infoEl.innerHTML = `<span>R<sub>s</sub> = ${rs.toExponential(2)} m</span>
                <span>ISCO ≈ ${(isco / rs).toFixed(1)} R<sub>s</sub></span>
                <span>Spin: a/M = ${spin.toFixed(3)}</span>`;

            demoAnimId = requestAnimationFrame(loop);
        }
        loop();
    }

    // ═══════ DEMO: Planets ═══════
    function buildPlanetDemo(data, controlsEl, infoEl) {
        let rotSpeed = 1.0, axialTilt = 23.4;
        const planetStyles = getPlanetStyle(data.name);

        controlsEl.innerHTML = `
            <label>Rotation Speed <span id="demo-rot-val">1.0</span>x
                <input type="range" id="demo-rot" min="0.1" max="5" value="1" step="0.1">
            </label>
            <label>Axial Tilt <span id="demo-tilt-val">${axialTilt.toFixed(0)}</span>°
                <input type="range" id="demo-tilt" min="0" max="98" value="${axialTilt}" step="1">
            </label>`;

        const rotSlider = document.getElementById('demo-rot');
        const tiltSlider = document.getElementById('demo-tilt');
        const rotVal = document.getElementById('demo-rot-val');
        const tiltVal = document.getElementById('demo-tilt-val');

        rotSlider.addEventListener('input', () => { rotSpeed = +rotSlider.value; rotVal.textContent = rotSpeed.toFixed(1); });
        tiltSlider.addEventListener('input', () => { axialTilt = +tiltSlider.value; tiltVal.textContent = axialTilt.toFixed(0); });

        function loop() {
            const w = demoCanvas.width, h = demoCanvas.height;
            const cx = w / 2, cy = h / 2;
            demoCtx.clearRect(0, 0, w, h);
            const t = performance.now() * 0.001 * rotSpeed;

            const r = 60;
            const col = planetStyles.color;
            const tiltRad = axialTilt * Math.PI / 180;

            // Atmosphere glow
            const glowR = r * 1.6;
            const glow = demoCtx.createRadialGradient(cx, cy, r * 0.9, cx, cy, glowR);
            glow.addColorStop(0, `rgba(${col.r},${col.g},${col.b},0.12)`);
            glow.addColorStop(1, 'transparent');
            demoCtx.fillStyle = glow;
            demoCtx.beginPath();
            demoCtx.arc(cx, cy, glowR, 0, Math.PI * 2);
            demoCtx.fill();

            // Planet body
            demoCtx.beginPath();
            demoCtx.arc(cx, cy, r, 0, Math.PI * 2);
            const bg = demoCtx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
            bg.addColorStop(0, `rgba(${col.r},${col.g},${col.b},1)`);
            bg.addColorStop(1, `rgba(${Math.floor(col.r * 0.5)},${Math.floor(col.g * 0.5)},${Math.floor(col.b * 0.5)},1)`);
            demoCtx.fillStyle = bg;
            demoCtx.fill();

            // Planet-specific features
            demoCtx.save();
            demoCtx.beginPath();
            demoCtx.arc(cx, cy, r, 0, Math.PI * 2);
            demoCtx.clip();

            if (planetStyles.bands) {
                const stripe = (i) => {
                    const bandY = cy + Math.sin(i * 0.7 + t * 0.1) * r * 0.8;
                    demoCtx.fillStyle = `rgba(${col.r * 0.7},${col.g * 0.7},${col.b * 0.5},0.2)`;
                    demoCtx.fillRect(cx - r, bandY, r * 2, r * 0.15);
                };
                for (let i = 0; i < 8; i++) stripe(i);
            }

            if (planetStyles.iceCaps) {
                demoCtx.beginPath();
                demoCtx.ellipse(cx, cy - r * 0.82, r * 0.35, r * 0.12, 0, 0, Math.PI * 2);
                demoCtx.fillStyle = 'rgba(240,240,255,0.35)';
                demoCtx.fill();
                demoCtx.beginPath();
                demoCtx.ellipse(cx, cy + r * 0.85, r * 0.3, r * 0.1, 0, 0, Math.PI * 2);
                demoCtx.fillStyle = 'rgba(240,240,255,0.25)';
                demoCtx.fill();
            }

            if (planetStyles.continents) {
                const lands = [{dx: -0.2, dy: -0.3, s: 0.3}, {dx: 0.25, dy: 0.1, s: 0.22}, {dx: -0.1, dy: 0.35, s: 0.18}];
                for (const l of lands) {
                    const lx = cx + (l.dx + Math.sin(t * 0.2) * 0.05) * r;
                    demoCtx.beginPath();
                    demoCtx.arc(lx, cy + l.dy * r, r * l.s, 0, Math.PI * 2);
                    demoCtx.fillStyle = 'rgba(60,140,80,0.3)';
                    demoCtx.fill();
                }
                demoCtx.globalAlpha = 0.2;
                demoCtx.beginPath();
                demoCtx.ellipse(cx + Math.sin(t * 0.3) * r * 0.2, cy - r * 0.1, r * 0.4, r * 0.1, -0.3, 0, Math.PI * 2);
                demoCtx.fillStyle = '#fff';
                demoCtx.fill();
                demoCtx.globalAlpha = 1;
            }

            if (planetStyles.clouds) {
                demoCtx.globalAlpha = 0.12;
                for (let i = 0; i < 3; i++) {
                    demoCtx.beginPath();
                    demoCtx.ellipse(cx + Math.sin(t * 0.2 + i) * r * 0.3, cy + (i - 1) * r * 0.3, r * 0.5, r * 0.1, i * 0.5, 0, Math.PI * 2);
                    demoCtx.fillStyle = planetStyles.cloudColor || '#fff';
                    demoCtx.fill();
                }
                demoCtx.globalAlpha = 1;
            }

            demoCtx.restore();

            // Rings (Saturn)
            if (planetStyles.rings) {
                demoCtx.save();
                demoCtx.translate(cx, cy);
                demoCtx.scale(1, 0.28);
                const rings = [{r: 1.5, w: 0.12, a: 0.15}, {r: 1.85, w: 0.3, a: 0.35}, {r: 2.25, w: 0.02, a: 0.05}, {r: 2.45, w: 0.22, a: 0.25}];
                rings.forEach(ring => {
                    demoCtx.beginPath();
                    demoCtx.arc(0, 0, r * ring.r, 0, Math.PI * 2);
                    demoCtx.strokeStyle = `rgba(240,213,140,${ring.a})`;
                    demoCtx.lineWidth = r * ring.w;
                    demoCtx.stroke();
                });
                demoCtx.restore();
            }

            // Terminator
            const tg = demoCtx.createLinearGradient(cx - r, cy, cx + r, cy);
            tg.addColorStop(0, 'transparent');
            tg.addColorStop(0.7, 'transparent');
            tg.addColorStop(1, 'rgba(0,0,0,0.4)');
            demoCtx.beginPath();
            demoCtx.arc(cx, cy, r, 0, Math.PI * 2);
            demoCtx.fillStyle = tg;
            demoCtx.fill();

            // Axial tilt indicator
            demoCtx.save();
            demoCtx.translate(cx, cy);
            demoCtx.rotate(-tiltRad);
            demoCtx.beginPath();
            demoCtx.moveTo(0, -r - 15);
            demoCtx.lineTo(0, r + 15);
            demoCtx.strokeStyle = 'rgba(255,255,255,0.15)';
            demoCtx.lineWidth = 1;
            demoCtx.setLineDash([3, 3]);
            demoCtx.stroke();
            demoCtx.setLineDash([]);
            demoCtx.restore();

            // Info
            const dayLen = planetStyles.dayHours || 24;
            const displayDay = (dayLen / rotSpeed).toFixed(1);
            infoEl.innerHTML = `<span>Day length: ${displayDay}h</span>
                <span>Axial tilt: ${axialTilt.toFixed(0)}°</span>
                <span>${planetStyles.note || ''}</span>`;

            demoAnimId = requestAnimationFrame(loop);
        }
        loop();
    }

    // ═══════ DEMO: Satellites ═══════
    function buildSatelliteDemo(data, controlsEl, infoEl) {
        let orbitalSpeed = 1.0;

        controlsEl.innerHTML = `
            <label>Orbital Speed <span id="demo-ospd-val">1.0</span>x
                <input type="range" id="demo-ospd" min="0.1" max="10" value="1" step="0.1">
            </label>`;

        const spdSlider = document.getElementById('demo-ospd');
        const spdVal = document.getElementById('demo-ospd-val');
        spdSlider.addEventListener('input', () => { orbitalSpeed = +spdSlider.value; spdVal.textContent = orbitalSpeed.toFixed(1); });

        const satStyle = getSatelliteStyle(data.name);

        function loop() {
            const w = demoCanvas.width, h = demoCanvas.height;
            const cx = w / 2, cy = h / 2;
            demoCtx.clearRect(0, 0, w, h);
            const t = performance.now() * 0.001 * orbitalSpeed;

            // Parent planet (small)
            const pR = 25;
            const pc = satStyle.parentColor;
            demoCtx.beginPath();
            demoCtx.arc(cx, cy, pR, 0, Math.PI * 2);
            const pg = demoCtx.createRadialGradient(cx - pR * 0.3, cy - pR * 0.3, 0, cx, cy, pR);
            pg.addColorStop(0, `rgba(${pc.r},${pc.g},${pc.b},1)`);
            pg.addColorStop(1, `rgba(${pc.r * 0.5},${pc.g * 0.5},${pc.b * 0.5},1)`);
            demoCtx.fillStyle = pg;
            demoCtx.fill();

            // Orbit path
            const orbitR = 90;
            demoCtx.beginPath();
            demoCtx.arc(cx, cy, orbitR, 0, Math.PI * 2);
            demoCtx.strokeStyle = 'rgba(255,255,255,0.08)';
            demoCtx.lineWidth = 1;
            demoCtx.stroke();

            // Satellite
            const angle = t * 0.8;
            const sx = cx + Math.cos(angle) * orbitR;
            const sy = cy + Math.sin(angle) * orbitR;
            const sR = 10;
            const sc = satStyle.color;

            demoCtx.beginPath();
            demoCtx.arc(sx, sy, sR, 0, Math.PI * 2);
            const sg = demoCtx.createRadialGradient(sx - sR * 0.3, sy - sR * 0.3, 0, sx, sy, sR);
            sg.addColorStop(0, `rgba(${sc.r},${sc.g},${sc.b},1)`);
            sg.addColorStop(1, `rgba(${sc.r * 0.5},${sc.g * 0.5},${sc.b * 0.5},1)`);
            demoCtx.fillStyle = sg;
            demoCtx.fill();

            // Label
            demoCtx.fillStyle = '#aaa';
            demoCtx.font = '10px "SF Mono", monospace';
            demoCtx.textAlign = 'center';
            demoCtx.fillText(data.name, sx, sy + sR + 14);

            const period = (2 * Math.PI / 0.8 / orbitalSpeed).toFixed(1);
            infoEl.innerHTML = `<span>Orbital period: ${period}s (demo)</span>
                <span>${satStyle.note}</span>`;

            demoAnimId = requestAnimationFrame(loop);
        }
        loop();
    }

    // ═══════ DEMO: Factory ═══════
    function buildFactoryDemo(data, controlsEl, infoEl) {
        let count = 50;
        let stars = generateStars(count);

        controlsEl.innerHTML = `
            <label>Star Count <span id="demo-cnt-val">50</span>
                <input type="range" id="demo-count" min="10" max="200" value="50" step="10">
            </label>
            <button class="demo-btn" id="demo-regen">Regenerate</button>`;

        const cntSlider = document.getElementById('demo-count');
        const cntVal = document.getElementById('demo-cnt-val');
        const regenBtn = document.getElementById('demo-regen');

        cntSlider.addEventListener('input', () => { count = +cntSlider.value; cntVal.textContent = count; stars = generateStars(count); });
        regenBtn.addEventListener('click', () => { stars = generateStars(count); });

        function generateStars(n) {
            const result = [];
            for (let i = 0; i < n; i++) {
                const temp = 2500 + Math.random() * 37500;
                const lum = Math.pow(temp / 5778, 3.5);
                const col = tempToColor(temp);
                result.push({
                    x: Math.random() * demoCanvas.width,
                    y: Math.random() * demoCanvas.height,
                    r: 1 + Math.log10(Math.max(lum, 0.01)) * 1.5,
                    col, temp, lum
                });
            }
            return result;
        }

        function loop() {
            const w = demoCanvas.width, h = demoCanvas.height;
            demoCtx.clearRect(0, 0, w, h);
            const t = performance.now() * 0.001;

            for (const s of stars) {
                const twinkle = 0.7 + 0.3 * Math.sin(t * 2 + s.x * 0.1);
                demoCtx.globalAlpha = twinkle;

                // Glow
                const glR = s.r * 3;
                const g = demoCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glR);
                g.addColorStop(0, `rgba(${s.col.r},${s.col.g},${s.col.b},0.4)`);
                g.addColorStop(1, 'transparent');
                demoCtx.fillStyle = g;
                demoCtx.beginPath();
                demoCtx.arc(s.x, s.y, glR, 0, Math.PI * 2);
                demoCtx.fill();

                // Core
                demoCtx.beginPath();
                demoCtx.arc(s.x, s.y, Math.max(s.r, 1), 0, Math.PI * 2);
                demoCtx.fillStyle = `rgb(${s.col.r},${s.col.g},${s.col.b})`;
                demoCtx.fill();
            }
            demoCtx.globalAlpha = 1;

            infoEl.innerHTML = `<span>${stars.length} stars generated</span>
                <span>Spectral range: O → M</span>
                <span>Mass-luminosity: L ∝ M<sup>3.5</sup></span>`;

            demoAnimId = requestAnimationFrame(loop);
        }
        loop();
    }

    // ═══════ DEMO: Systems ═══════
    function buildSystemDemo(data, controlsEl, infoEl) {
        controlsEl.innerHTML = '<p style="color:var(--text-dim);font-size:0.8rem">The live N-body simulation runs in the hero section — click to zoom into the solar system.</p>';
        infoEl.innerHTML = `<span>21-body leapfrog KDK integration</span><span>Real-time on WASM</span>`;

        function loop() {
            const w = demoCanvas.width, h = demoCanvas.height;
            const cx = w / 2, cy = h / 2;
            demoCtx.clearRect(0, 0, w, h);
            const t = performance.now() * 0.001;

            // Simple mini solar system preview
            // Sun
            const sunR = 12;
            const sg = demoCtx.createRadialGradient(cx, cy, 0, cx, cy, sunR * 3);
            sg.addColorStop(0, 'rgba(255,216,102,0.6)');
            sg.addColorStop(0.3, 'rgba(255,216,102,0.15)');
            sg.addColorStop(1, 'transparent');
            demoCtx.fillStyle = sg;
            demoCtx.beginPath();
            demoCtx.arc(cx, cy, sunR * 3, 0, Math.PI * 2);
            demoCtx.fill();
            demoCtx.beginPath();
            demoCtx.arc(cx, cy, sunR, 0, Math.PI * 2);
            demoCtx.fillStyle = '#ffd866';
            demoCtx.fill();

            // Planets
            const planets = [
                {d: 35, s: 2, c: '#b0b0b0', speed: 4.2},
                {d: 50, s: 3, c: '#e8a84c', speed: 3.1},
                {d: 68, s: 3.5, c: '#4dabf7', speed: 2.5},
                {d: 85, s: 2.5, c: '#e74c3c', speed: 2.0},
                {d: 120, s: 7, c: '#deb887', speed: 1.1},
                {d: 155, s: 6, c: '#f0d58c', speed: 0.8},
                {d: 185, s: 4, c: '#7ec8e3', speed: 0.55},
                {d: 210, s: 4, c: '#3b5998', speed: 0.4},
            ];

            for (const p of planets) {
                // Orbit
                demoCtx.beginPath();
                demoCtx.arc(cx, cy, p.d, 0, Math.PI * 2);
                demoCtx.strokeStyle = 'rgba(255,255,255,0.05)';
                demoCtx.lineWidth = 0.5;
                demoCtx.stroke();

                const angle = t * p.speed;
                const px = cx + Math.cos(angle) * p.d;
                const py = cy + Math.sin(angle) * p.d;
                demoCtx.beginPath();
                demoCtx.arc(px, py, p.s, 0, Math.PI * 2);
                demoCtx.fillStyle = p.c;
                demoCtx.fill();
            }

            demoAnimId = requestAnimationFrame(loop);
        }
        loop();
    }

    // ══════════ Helpers ══════════

    function tempToColor(T) {
        // Approximate stellar color from temperature
        let r, g, b;
        if (T < 3500) { r = 255; g = 120 + (T - 2000) * 0.06; b = 50; }
        else if (T < 5000) { r = 255; g = 180 + (T - 3500) * 0.05; b = 100 + (T - 3500) * 0.06; }
        else if (T < 7500) { r = 255; g = 240 + (T - 5000) * 0.006; b = 200 + (T - 5000) * 0.022; }
        else if (T < 10000) { r = 220 - (T - 7500) * 0.012; g = 230 - (T - 7500) * 0.004; b = 255; }
        else if (T < 25000) { r = 170 - (T - 10000) * 0.003; g = 200 - (T - 10000) * 0.002; b = 255; }
        else { r = 130; g = 150; b = 255; }
        return { r: Math.max(0, Math.min(255, Math.round(r))), g: Math.max(0, Math.min(255, Math.round(g))), b: Math.max(0, Math.min(255, Math.round(b))) };
    }

    function spectralClass(T) {
        if (T >= 30000) return 'O';
        if (T >= 10000) return 'B';
        if (T >= 7500) return 'A';
        if (T >= 6000) return 'F';
        if (T >= 5200) return 'G';
        if (T >= 3700) return 'K';
        return 'M';
    }

    function getPlanetStyle(name) {
        const styles = {
            mercurys: { color: {r:176,g:176,b:176}, dayHours: 4222.6, note: '3:2 spin-orbit resonance' },
            venuss: { color: {r:232,g:168,b:76}, clouds: true, cloudColor: 'rgba(255,230,160,1)', dayHours: 5832, note: '467°C surface, 92 atm' },
            earths: { color: {r:77,g:171,b:247}, continents: true, clouds: true, dayHours: 24, note: 'The reference planet' },
            marss: { color: {r:231,g:76,b:60}, iceCaps: true, dayHours: 24.6, note: 'Olympus Mons, Valles Marineris' },
            jupiters: { color: {r:222,g:184,b:135}, bands: true, dayHours: 9.9, note: 'Great Red Spot, 79+ moons' },
            saturns: { color: {r:240,g:213,b:140}, bands: true, rings: true, dayHours: 10.7, note: 'Iconic ring system' },
            uranuss: { color: {r:126,g:200,b:227}, bands: true, dayHours: 17.2, note: '98° axial tilt' },
            neptunes: { color: {r:59,g:89,b:152}, bands: true, dayHours: 16.1, note: '2100 km/h supersonic winds' },
        };
        return styles[name] || { color: {r:150,g:150,b:150}, dayHours: 24, note: '' };
    }

    function getSatelliteStyle(name) {
        const styles = {
            moons: { color: {r:204,g:204,b:204}, parentColor: {r:77,g:171,b:247}, note: 'Tidally locked, 384,400 km' },
            phoboss: { color: {r:138,g:127,b:114}, parentColor: {r:231,g:76,b:60}, note: 'Spiraling inward — doomed' },
            deimoss: { color: {r:154,g:143,b:130}, parentColor: {r:231,g:76,b:60}, note: 'Drifting outward, smooth' },
            ioss: { color: {r:232,g:200,b:64}, parentColor: {r:222,g:184,b:135}, note: '400+ active volcanoes' },
            europas: { color: {r:200,g:216,b:240}, parentColor: {r:222,g:184,b:135}, note: 'Sub-ice global ocean' },
            ganymedes: { color: {r:160,g:168,b:184}, parentColor: {r:222,g:184,b:135}, note: 'Larger than Mercury' },
            callistos: { color: {r:112,g:96,b:88}, parentColor: {r:222,g:184,b:135}, note: 'Oldest surface in system' },
            titanss: { color: {r:208,g:136,b:48}, parentColor: {r:240,g:213,b:140}, note: 'Methane lakes & weather' },
            enceladuss: { color: {r:232,g:240,b:248}, parentColor: {r:240,g:213,b:140}, note: 'Water geysers, tiger stripes' },
            titanias: { color: {r:176,g:184,b:192}, parentColor: {r:126,g:200,b:227}, note: 'Largest Uranian moon' },
            oberons: { color: {r:104,g:96,b:96}, parentColor: {r:126,g:200,b:227}, note: 'Outermost major moon' },
            tritons: { color: {r:144,g:176,b:192}, parentColor: {r:59,g:89,b:152}, note: 'Captured, retrograde orbit' },
        };
        return styles[name] || { color: {r:180,g:180,b:180}, parentColor: {r:150,g:150,b:150}, note: '' };
    }

    function highlightRust(src) {
        return src
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/(\/\/.*)/g, '<span class="cmt">$1</span>')
            .replace(/\b(pub|mod|use|fn|let|mut|const|struct|impl|self|Self|for|in|if|else|match|return|true|false|as|ref|type|enum|trait|where|crate|super|static|unsafe|extern|async|await|dyn|move|loop|while|break|continue)\b/g, '<span class="kw">$1</span>')
            .replace(/\b(\d+\.?\d*(?:e[+-]?\d+)?)\b/g, '<span class="num">$1</span>')
            .replace(/"([^"]*?)"/g, '"<span class="str">$1</span>"');
    }

    function escHtml(s) {
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    // ── Wire up all crate cards ──
    function wireCards() {
        document.querySelectorAll('.crate-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const h3 = card.querySelector('h3');
                if (h3) openPanel(h3.textContent.trim());
            });
        });
    }

    // Wait for DOM ready then wire
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wireCards);
    } else {
        wireCards();
    }

    // Export for programmatic use
    window.openCrateDetail = openPanel;
})();
