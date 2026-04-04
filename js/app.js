// ===== STARFIELD CANVAS =====
class Starfield {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.stars = [];
        this.shootingStars = [];
        this.nebulae = [];
        this.mouse = { x: 0, y: 0 };
        this.resize();
        this.init();
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.stars = [];
        const count = Math.min(400, Math.floor(window.innerWidth * 0.25));
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                z: Math.random() * 3 + 0.5, // depth layer
                size: Math.random() * 1.8 + 0.3,
                brightness: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinklePhase: Math.random() * Math.PI * 2,
                color: this.randomStarColor()
            });
        }
        // Init nebula clouds
        this.nebulae = [
            { x: 0.2, y: 0.3, r: 200, color: [108, 92, 231], opacity: 0.015 },
            { x: 0.8, y: 0.7, r: 250, color: [225, 122, 255], opacity: 0.01 },
            { x: 0.5, y: 0.1, r: 180, color: [0, 206, 201], opacity: 0.008 },
        ];
    }

    randomStarColor() {
        const colors = [
            [255, 255, 255],
            [255, 248, 230],
            [200, 220, 255],
            [255, 220, 180],
            [180, 200, 255],
            [255, 216, 102],
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    spawnShootingStar() {
        if (Math.random() > 0.003) return;
        this.shootingStars.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height * 0.4,
            vx: (Math.random() * 4 + 4) * (Math.random() > 0.5 ? 1 : -1),
            vy: Math.random() * 2 + 2,
            life: 1.0,
            decay: Math.random() * 0.015 + 0.01,
            length: Math.random() * 40 + 30,
        });
    }

    draw(time) {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw nebulae
        for (const n of this.nebulae) {
            const nx = n.x * canvas.width + this.mouse.x * 10;
            const ny = n.y * canvas.height + this.mouse.y * 10;
            const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.r);
            grad.addColorStop(0, `rgba(${n.color.join(',')}, ${n.opacity})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw stars
        for (const s of this.stars) {
            const parallaxX = this.mouse.x * s.z * 8;
            const parallaxY = this.mouse.y * s.z * 8;
            const sx = s.x + parallaxX;
            const sy = s.y + parallaxY;
            
            s.twinklePhase += s.twinkleSpeed;
            const twinkle = 0.5 + 0.5 * Math.sin(s.twinklePhase);
            const alpha = (0.3 + 0.7 * twinkle) * (0.4 + s.brightness * 0.6);

            ctx.beginPath();
            ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${s.color[0]}, ${s.color[1]}, ${s.color[2]}, ${alpha})`;
            ctx.fill();

            // Glow for brighter stars
            if (s.size > 1.2) {
                ctx.beginPath();
                ctx.arc(sx, sy, s.size * 3, 0, Math.PI * 2);
                const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.size * 3);
                glow.addColorStop(0, `rgba(${s.color[0]}, ${s.color[1]}, ${s.color[2]}, ${alpha * 0.2})`);
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow;
                ctx.fill();
            }
        }

        // Shooting stars
        this.spawnShootingStar();
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const ss = this.shootingStars[i];
            ss.x += ss.vx;
            ss.y += ss.vy;
            ss.life -= ss.decay;

            if (ss.life <= 0) {
                this.shootingStars.splice(i, 1);
                continue;
            }

            const tailX = ss.x - ss.vx * ss.length * 0.3;
            const tailY = ss.y - ss.vy * ss.length * 0.3;

            const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
            grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
            grad.addColorStop(1, `rgba(255, 255, 255, ${ss.life * 0.8})`);

            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(ss.x, ss.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Head glow
            ctx.beginPath();
            ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${ss.life})`;
            ctx.fill();
        }

        requestAnimationFrame((t) => this.draw(t));
    }

    start() {
        requestAnimationFrame((t) => this.draw(t));
    }
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ===== NAVBAR SCROLL =====
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// ===== TABS =====
function initTabs() {
    document.querySelectorAll('.tabs').forEach(tabBar => {
        const buttons = tabBar.querySelectorAll('.tab-btn');
        const container = tabBar.parentElement;
        const panels = container.querySelectorAll('.tab-panel');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const panel = container.querySelector(`#${btn.dataset.tab}`);
                if (panel) panel.classList.add('active');
            });
        });
    });
}

// ===== TYPING EFFECT FOR CODE =====
function typeCode(element, code, speed = 15) {
    let i = 0;
    element.innerHTML = '';
    function type() {
        if (i < code.length) {
            // Parse for HTML tags (skip them instantly)
            if (code[i] === '<') {
                const end = code.indexOf('>', i);
                if (end !== -1) {
                    element.innerHTML += code.substring(i, end + 1);
                    i = end + 1;
                    type();
                    return;
                }
            }
            element.innerHTML += code[i];
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// ===== PARTICLE FLOAT FOR CRATE PAGE =====
class FloatingParticles {
    constructor(container, color, count = 20) {
        this.container = container;
        this.color = color;
        this.particles = [];
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                border-radius: 50%;
                background: ${color};
                opacity: ${Math.random() * 0.3 + 0.1};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat ${Math.random() * 10 + 10}s ease-in-out infinite;
                animation-delay: ${Math.random() * -10}s;
                pointer-events: none;
            `;
            container.appendChild(p);
        }
    }
}

// Add particle float keyframe dynamically
const particleStyle = document.createElement('style');
particleStyle.textContent = `
@keyframes particleFloat {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
    25% { transform: translate(${Math.random()*40-20}px, ${Math.random()*40-20}px) scale(1.3); opacity: 0.3; }
    50% { transform: translate(${Math.random()*60-30}px, ${Math.random()*60-30}px) scale(0.8); opacity: 0.2; }
    75% { transform: translate(${Math.random()*40-20}px, ${Math.random()*40-20}px) scale(1.1); opacity: 0.25; }
}
`;
document.head.appendChild(particleStyle);

// ===== COUNTER ANIMATION =====
function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        const duration = 2000;
        const start = performance.now();

        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = Math.round(target * ease);
            if (progress < 1) requestAnimationFrame(step);
        }
        
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                requestAnimationFrame(step);
                observer.unobserve(el);
            }
        });
        observer.observe(el);
    });
}

// ===== SMOOTH PARALLAX ON SCROLL =====
function initParallax() {
    const elements = document.querySelectorAll('.parallax-slow, .parallax-fast');
    if (!elements.length) return;
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        elements.forEach(el => {
            const speed = el.classList.contains('parallax-fast') ? 0.3 : 0.1;
            el.style.transform = `translateY(${scrollY * speed}px)`;
        });
    }, { passive: true });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    // Starfield
    const canvas = document.getElementById('starfield');
    if (canvas) {
        const sf = new Starfield(canvas);
        sf.start();
    }

    initNavbar();
    initScrollReveal();
    initTabs();
    animateCounters();
    initParallax();
});
