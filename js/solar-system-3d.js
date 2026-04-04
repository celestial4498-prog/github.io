// ══════════════════════════════════════════════════════════════
//  Celestial — Three.js 3D Solar System (WASM N-body)
//  Positions: LINEAR in AU (no sqrt compression)
//  Radii: proportional to real crate data (sqrt scaling)
//  All data from the real solarsystems Rust crate
// ══════════════════════════════════════════════════════════════

/* global THREE, wasm_bindgen */

const OrbitControls = THREE.OrbitControls;
const CSS2DRenderer = THREE.CSS2DRenderer;
const CSS2DObject   = THREE.CSS2DObject;

const KIND_STAR           = 0;
const KIND_PLANET         = 1;
const KIND_SAT            = 2;
const KIND_DWARF          = 5;
const KIND_ASTEROID       = 6;
const KIND_COMET          = 7;
const KIND_BELT_ASTEROID  = 8;
const KIND_KUIPER_OBJECT  = 9;

// ── Scaling ──
// Distances: 1 AU = 5 scene units (LINEAR — true proportions)
const AU_SCALE = 5;

// Satellite offsets are amplified so moons orbit visibly outside parents.
// Proportional: distant moons (Callisto) further than close moons (Io).
const SAT_AMPLIFY = 500;

function initSolarSystem3D(container) {
    const sim = new wasm_bindgen.SolarSystem(3600.0);

    const bodyCount = sim.count();
    const names     = sim.names().split(';');
    const colors    = sim.colors();
    const realRadii = sim.radii();   // meters (from CelestialBody.radius)
    const masses    = sim.masses();  // kg     (from CelestialBody.mass)
    const kinds     = sim.kinds();
    const parents   = sim.parents();

    // ── Visual radii: sqrt‐proportional to real physical radii ──
    // Sun → 2.0 scene units.  Preserves ordering & rough proportions.
    // Jupiter ≈ 0.63, Earth ≈ 0.19, Moon ≈ 0.10, Titan ≈ 0.12
    const SUN_RADIUS_M = realRadii[0];
    const SUN_VISUAL   = 2.0;
    const radii = new Float64Array(bodyCount);
    for (let i = 0; i < bodyCount; i++) {
        radii[i] = SUN_VISUAL * Math.sqrt(realRadii[i] / SUN_RADIUS_M);
        if (radii[i] < 0.03) radii[i] = 0.03;
    }

    let scene, camera, renderer, labelRenderer, controls;
    let bodyMeshes = [];
    let bodyLabels = [];
    let sunMesh, sunGlow;
    let cometTails = [];
    let raycaster, mouse;
    let hoveredBody = -1;
    let tooltip;
    let stepsPerFrame = 96;   // 96 h = 4 days per frame
    let paused = false;

    // ── Scene ──
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000008);

    // ── Camera — further out so the linear layout is visible ──
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(50, aspect, 0.001, 8000);
    camera.position.set(15, 40, 55);
    camera.lookAt(0, 0, 0);

    // ── Renderers ──
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.left = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);

    // ── Controls ──
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.5;
    controls.maxDistance = 4000;
    controls.maxPolarAngle = Math.PI * 0.85;

    // ── Lights ──
    const sunLight = new THREE.PointLight(0xfff5e0, 3, 2000, 0.3);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x111122, 0.4));

    // ── Build ──
    buildStarfield();
    buildBodies();
    buildTooltip();
    buildControls();

    // ── Raycaster ──
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(-999, -999);

    // ── Events ──
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onBodyClick);
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);

    updatePositions();
    animate();

    // ═══════ BUILD ═══════

    function buildStarfield() {
        const count = 6000;
        const positions = new Float32Array(count * 3);
        const starColors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 2000 + Math.random() * 4000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
            const t = Math.random();
            if (t < 0.1)      { starColors[i*3]=0.7; starColors[i*3+1]=0.8; starColors[i*3+2]=1.0; }
            else if (t < 0.3) { starColors[i*3]=1.0; starColors[i*3+1]=0.95;starColors[i*3+2]=0.85;}
            else               { starColors[i*3]=1.0; starColors[i*3+1]=1.0; starColors[i*3+2]=1.0; }
        }
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
        scene.add(new THREE.Points(geom, new THREE.PointsMaterial({
            size: 1.2, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: 0.85,
        })));
    }

    function segmentsForRadius(r) {
        if (r > 1.0) return 128;
        if (r > 0.3) return 96;
        if (r > 0.1) return 64;
        if (r > 0.05) return 48;
        return 32;
    }

    let beltInstancedMesh = null;    // InstancedMesh for all belt/kuiper bodies
    let beltBodyIndices = [];        // maps instance index → body index
    let beltDummy = new THREE.Object3D();

    function buildBodies() {
        // First pass: count belt bodies to allocate InstancedMesh
        let beltCount = 0;
        for (let i = 0; i < bodyCount; i++) {
            if (kinds[i] === KIND_BELT_ASTEROID || kinds[i] === KIND_KUIPER_OBJECT) beltCount++;
        }

        // Create a single InstancedMesh for all belt objects (1 draw call)
        if (beltCount > 0) {
            const beltGeom = new THREE.SphereGeometry(1, 32, 32);
            const beltMat = new THREE.MeshStandardMaterial({
                color: 0x887766, roughness: 0.9, metalness: 0.2,
            });
            beltInstancedMesh = new THREE.InstancedMesh(beltGeom, beltMat, beltCount);
            // Per-instance colors
            const beltColors = new Float32Array(beltCount * 3);
            let bIdx = 0;
            for (let i = 0; i < bodyCount; i++) {
                if (kinds[i] !== KIND_BELT_ASTEROID && kinds[i] !== KIND_KUIPER_OBJECT) continue;
                const c = new THREE.Color(colors[i]);
                beltColors[bIdx * 3]     = c.r;
                beltColors[bIdx * 3 + 1] = c.g;
                beltColors[bIdx * 3 + 2] = c.b;
                bIdx++;
            }
            beltInstancedMesh.instanceColor = new THREE.InstancedBufferAttribute(beltColors, 3);
            scene.add(beltInstancedMesh);
        }

        // Second pass: build individual meshes for named bodies, proxies for belt
        let beltIdx = 0;
        for (let i = 0; i < bodyCount; i++) {
            const kind  = kinds[i];
            const color = colors[i];
            const meshRadius = radii[i];
            const name  = names[i];
            const hex   = '#' + color.toString(16).padStart(6, '0');

            if (kind === KIND_STAR) {
                buildSun(meshRadius, name);
                bodyMeshes.push(sunMesh);
                bodyLabels.push(null);
                continue;
            }

            const isBeltBody = (kind === KIND_BELT_ASTEROID || kind === KIND_KUIPER_OBJECT);

            if (isBeltBody) {
                // Belt bodies use InstancedMesh — push a dummy placeholder
                beltBodyIndices.push(i);
                // Invisible placeholder so bodyMeshes[i] indexing stays consistent
                const placeholder = new THREE.Object3D();
                scene.add(placeholder);
                bodyMeshes.push(placeholder);
                bodyLabels.push(null);
                beltIdx++;
                continue;
            }

            const segs = segmentsForRadius(meshRadius);
            const geom = new THREE.SphereGeometry(meshRadius, segs, segs);

            let emissive = 0x000000;
            let emissiveIntensity = 0.0;
            if (kind === KIND_PLANET) {
                emissive = (color >> 1) & 0x7f7f7f;
                emissiveIntensity = 0.15;
            } else if (kind === KIND_COMET) {
                emissive = 0x204060;
                emissiveIntensity = 0.4;
            }

            const mat = new THREE.MeshStandardMaterial({
                color: color,
                emissive: emissive,
                emissiveIntensity: emissiveIntensity,
                roughness: (kind === KIND_COMET) ? 0.5 : 0.8,
                metalness: (kind === KIND_ASTEROID) ? 0.25 : 0.1,
            });
            const mesh = new THREE.Mesh(geom, mat);
            scene.add(mesh);
            bodyMeshes.push(mesh);

            if (name === 'Saturn') {
                const ringSegs = 128;
                const ringGeom = new THREE.RingGeometry(meshRadius * 1.4, meshRadius * 2.8, ringSegs);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: 0xc8b070, side: THREE.DoubleSide, transparent: true, opacity: 0.45,
                });
                const ring = new THREE.Mesh(ringGeom, ringMat);
                ring.rotation.x = Math.PI / 2 + 27 * Math.PI / 180;
                mesh.add(ring);
            }

            if (kind === KIND_COMET) {
                const tailLen = 40;
                const tailPos = new Float32Array(tailLen * 3);
                const tailGeom = new THREE.BufferGeometry();
                tailGeom.setAttribute('position', new THREE.BufferAttribute(tailPos, 3));
                const tailMat = new THREE.PointsMaterial({
                    color: color, size: 0.1, transparent: true, opacity: 0.5,
                    blending: THREE.AdditiveBlending, depthWrite: false,
                });
                const tail = new THREE.Points(tailGeom, tailMat);
                scene.add(tail);
                cometTails.push({ bodyIdx: i, points: tail, history: [] });
            }

            const label = makeLabel(name, hex);
            label.visible = false;
            mesh.add(label);
            label.position.set(0, meshRadius + 0.3, 0);
            bodyLabels.push(label);
        }
    }

    function buildSun(meshRadius, name) {
        const sunGeom = new THREE.SphereGeometry(meshRadius, 128, 128);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffdd44 });
        sunMesh = new THREE.Mesh(sunGeom, sunMat);
        scene.add(sunMesh);

        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = 512; glowCanvas.height = 512;
        const gCtx = glowCanvas.getContext('2d');
        const gGrad = gCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gGrad.addColorStop(0, 'rgba(255,240,200,0.8)');
        gGrad.addColorStop(0.15, 'rgba(255,220,100,0.5)');
        gGrad.addColorStop(0.4, 'rgba(255,180,50,0.15)');
        gGrad.addColorStop(0.7, 'rgba(255,140,30,0.03)');
        gGrad.addColorStop(1, 'rgba(255,100,0,0)');
        gCtx.fillStyle = gGrad;
        gCtx.fillRect(0, 0, 512, 512);
        const glowMat = new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(glowCanvas),
            transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        });
        sunGlow = new THREE.Sprite(glowMat);
        const glowSize = meshRadius * 6;
        sunGlow.scale.set(glowSize, glowSize, 1);
        scene.add(sunGlow);

        const label = makeLabel(name, '#ffd866');
        label.position.set(0, meshRadius + 0.8, 0);
        scene.add(label);
    }

    function makeLabel(text, color) {
        const div = document.createElement('div');
        div.className = 'planet-label';
        div.textContent = text;
        div.style.color = color;
        return new CSS2DObject(div);
    }

    function buildTooltip() {
        tooltip = document.createElement('div');
        tooltip.className = 'solar-tooltip';
        tooltip.style.display = 'none';
        container.appendChild(tooltip);
    }

    let controlsPanel, speedLabel, dateLabel, playBtn;

    function buildControls() {
        controlsPanel = document.createElement('div');
        controlsPanel.className = 'solar-controls';

        const row = document.createElement('div');
        row.className = 'solar-controls-row';

        const slowBtn = document.createElement('button');
        slowBtn.textContent = '−';
        slowBtn.title = 'Slower (↓ or −)';
        slowBtn.addEventListener('click', () => { changeSpeed(-1); });

        playBtn = document.createElement('button');
        playBtn.textContent = '⏸';
        playBtn.title = 'Pause / Play (Space)';
        playBtn.addEventListener('click', () => { togglePause(); });

        const fastBtn = document.createElement('button');
        fastBtn.textContent = '+';
        fastBtn.title = 'Faster (↑ or +)';
        fastBtn.addEventListener('click', () => { changeSpeed(1); });

        speedLabel = document.createElement('span');
        speedLabel.id = 'sol-speed-label';

        row.append(slowBtn, playBtn, speedLabel, fastBtn);

        dateLabel = document.createElement('div');
        dateLabel.id = 'sol-date';

        controlsPanel.append(row, dateLabel);
        container.appendChild(controlsPanel);
        refreshHUD();
    }

    function togglePause() {
        paused = !paused;
        refreshHUD();
    }

    function changeSpeed(dir) {
        if (dir > 0) stepsPerFrame = Math.min(1920, stepsPerFrame * 2);
        else stepsPerFrame = Math.max(1, Math.floor(stepsPerFrame / 2));
        refreshHUD();
    }

    function refreshHUD() {
        if (!speedLabel) return;
        const daysPerFrame = stepsPerFrame; // dt=3600s → 1 step = 1h
        let txt;
        if (daysPerFrame >= 24) txt = (daysPerFrame / 24).toFixed(0) + ' d/f';
        else txt = daysPerFrame + ' h/f';
        speedLabel.textContent = paused ? '⏸ ' + txt : '▶ ' + txt;
        playBtn.textContent = paused ? '▶' : '⏸';
    }

    // ═══════ POSITIONS ═══════

    function updatePositions() {
        const pos = sim.positions_au(); // now [x,y,z, x,y,z, ...]
        const sceneX = new Float64Array(bodyCount);
        const sceneY = new Float64Array(bodyCount);
        const sceneZ = new Float64Array(bodyCount);

        // Linear mapping: AU → scene units (true 3D proportions)
        for (let i = 0; i < bodyCount; i++) {
            sceneX[i] = pos[i * 3]     * AU_SCALE;
            sceneY[i] = pos[i * 3 + 2] * AU_SCALE;  // sim z → scene y (up)
            sceneZ[i] = pos[i * 3 + 1] * AU_SCALE;  // sim y → scene z (depth)
        }

        // Satellite offset amplification (proportional to real orbital distance)
        for (let i = 0; i < bodyCount; i++) {
            const pi = parents[i];
            if (pi < 0 || kinds[i] !== KIND_SAT) continue;

            const dxAU = pos[i * 3]     - pos[pi * 3];
            const dyAU = pos[i * 3 + 1] - pos[pi * 3 + 1];
            const dzAU = pos[i * 3 + 2] - pos[pi * 3 + 2];
            const dr = Math.sqrt(dxAU * dxAU + dyAU * dyAU + dzAU * dzAU);
            if (dr < 1e-18) continue;

            const minOffset = radii[pi] + radii[i] + 0.12;
            const amp = Math.max(dr * SAT_AMPLIFY, minOffset);
            sceneX[i] = sceneX[pi] + (dxAU / dr) * amp;
            sceneY[i] = sceneY[pi] + (dzAU / dr) * amp;
            sceneZ[i] = sceneZ[pi] + (dyAU / dr) * amp;
        }

        for (let i = 0; i < bodyCount; i++) {
            bodyMeshes[i].position.set(sceneX[i], sceneY[i], sceneZ[i]);
        }

        // Update belt InstancedMesh positions
        if (beltInstancedMesh) {
            for (let inst = 0; inst < beltBodyIndices.length; inst++) {
                const bi = beltBodyIndices[inst];
                const s = radii[bi];
                beltDummy.position.set(sceneX[bi], sceneY[bi], sceneZ[bi]);
                beltDummy.scale.set(s, s, s);
                beltDummy.updateMatrix();
                beltInstancedMesh.setMatrixAt(inst, beltDummy.matrix);
            }
            beltInstancedMesh.instanceMatrix.needsUpdate = true;
        }

        for (const ct of cometTails) {
            const bp = bodyMeshes[ct.bodyIdx].position;
            ct.history.push(bp.x, bp.y, bp.z);
            const maxPts = 40 * 3;
            if (ct.history.length > maxPts) ct.history.splice(0, ct.history.length - maxPts);
            const attr = ct.points.geometry.getAttribute('position');
            const arr = attr.array;
            arr.fill(0);
            for (let j = 0; j < ct.history.length; j++) arr[j] = ct.history[j];
            attr.needsUpdate = true;
        }
    }

    // ═══════ EVENTS ═══════

    function onMouseMove(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(bodyMeshes);

        if (intersects.length > 0) {
            const idx = bodyMeshes.indexOf(intersects[0].object);
            if (idx >= 0 && idx !== hoveredBody) {
                if (hoveredBody >= 0 && bodyLabels[hoveredBody]) bodyLabels[hoveredBody].visible = false;
                hoveredBody = idx;
                if (bodyLabels[idx]) bodyLabels[idx].visible = true;
                renderer.domElement.style.cursor = 'pointer';

                const kindNames = {0:'Star',1:'Planet',2:'Moon',5:'Dwarf Planet',6:'Asteroid',7:'Comet',8:'Belt Asteroid',9:'Kuiper Object'};
                const kindStr = kindNames[kinds[idx]] || '';
                const p = sim.positions_au();
                const distAU = Math.sqrt(p[idx*3]*p[idx*3] + p[idx*3+1]*p[idx*3+1] + p[idx*3+2]*p[idx*3+2]);
                const rKm = (realRadii[idx] / 1000).toFixed(1);
                const mKg = masses[idx].toExponential(3);

                tooltip.innerHTML = `
                    <strong>${names[idx]}</strong><br>
                    <em>${kindStr}</em><br>
                    ${distAU.toFixed(3)} AU from Sun<br>
                    Radius: ${rKm} km — Mass: ${mKg} kg
                `;
                tooltip.style.display = 'block';
                tooltip.style.left = (event.clientX - rect.left + 15) + 'px';
                tooltip.style.top  = (event.clientY - rect.top - 10) + 'px';
            } else if (idx === hoveredBody) {
                tooltip.style.left = (event.clientX - rect.left + 15) + 'px';
                tooltip.style.top  = (event.clientY - rect.top - 10) + 'px';
            }
        } else {
            if (hoveredBody >= 0 && bodyLabels[hoveredBody]) bodyLabels[hoveredBody].visible = false;
            hoveredBody = -1;
            tooltip.style.display = 'none';
            renderer.domElement.style.cursor = 'grab';
        }
    }

    function onBodyClick() {
        if (hoveredBody < 0) return;
        const mesh = bodyMeshes[hoveredBody];
        const target = mesh.position.clone();
        const d = radii[hoveredBody] * 5 + 2;
        const offset = new THREE.Vector3(d * 0.7, d * 0.5, d * 0.7);
        animateCamera(target.clone().add(offset), target, 1000);
    }

    function onKeyDown(e) {
        if (e.code === 'Space') { e.preventDefault(); togglePause(); }
        if (e.code === 'ArrowUp'   || e.key === '+') changeSpeed(1);
        if (e.code === 'ArrowDown' || e.key === '-') changeSpeed(-1);
    }

    function animateCamera(newPos, newTarget, duration) {
        const startPos = camera.position.clone();
        const startTarget = controls.target.clone();
        const startTime = performance.now();
        function step() {
            const elapsed = performance.now() - startTime;
            const t = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            camera.position.lerpVectors(startPos, newPos, ease);
            controls.target.lerpVectors(startTarget, newTarget, ease);
            controls.update();
            if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    function onResize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        labelRenderer.setSize(w, h);
    }

    // ═══════ ANIMATION ═══════

    function animate() {
        requestAnimationFrame(animate);

        if (!paused) {
            sim.step(stepsPerFrame);
            updatePositions();
        }

        // Update elapsed time display
        if (dateLabel) {
            const days = sim.elapsed_days();
            const years = days / 365.25;
            if (years >= 1) dateLabel.textContent = years.toFixed(2) + ' years';
            else dateLabel.textContent = days.toFixed(0) + ' days';
        }

        const now = performance.now();
        const pulse = 1.0 + 0.03 * Math.sin(now * 0.002);
        const gs = radii[0] * 6 * pulse;
        sunGlow.scale.set(gs, gs, 1);

        controls.update();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
    }
}
