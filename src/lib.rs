use wasm_bindgen::prelude::*;

use solarsystems::BodyId;
use solarsystems::config::parameters::default_bodies_with_belts;
use solarsystems::dynamics::integrator::Integrator;
use solarsystems::orchestrator::pipeline::Pipeline;

const AU: f64 = 1.495978707e11;
const PARSEC: f64 = 3.0857e16;
const LY: f64 = 9.461e15;
const KPC: f64 = PARSEC * 1000.0;

// ── Body kind — sent to JS for rendering logic ────
const KIND_STAR: u8 = 0;
const KIND_PLANET: u8 = 1;
const KIND_SAT: u8 = 2;
const KIND_BLACKHOLE: u8 = 3;
const KIND_DISTANT_STAR: u8 = 4;
const KIND_DWARF: u8 = 5;
const KIND_ASTEROID: u8 = 6;
const KIND_COMET: u8 = 7;
const KIND_BELT_ASTEROID: u8 = 8;
const KIND_KUIPER_OBJECT: u8 = 9;

fn body_kind(id: BodyId) -> u8 {
    match id {
        BodyId::Sun => KIND_STAR,
        _ if id.is_planet() => KIND_PLANET,
        _ if id.is_satellite() => KIND_SAT,
        _ if id.is_dwarf_planet() => KIND_DWARF,
        _ if id.is_belt_asteroid() => KIND_BELT_ASTEROID,
        _ if id.is_kuiper_object() => KIND_KUIPER_OBJECT,
        _ if id.is_asteroid() => KIND_ASTEROID,
        _ if id.is_comet() => KIND_COMET,
        _ => KIND_PLANET,
    }
}

fn body_color(id: BodyId) -> u32 {
    match id {
        BodyId::Sun => 0xFFD866,
        BodyId::Mercury => 0xB0B0B0,
        BodyId::Venus => 0xE8A84C,
        BodyId::Earth => 0x4DABF7,
        BodyId::Mars => 0xE74C3C,
        BodyId::Jupiter => 0xDEB887,
        BodyId::Saturn => 0xF0D58C,
        BodyId::Uranus => 0x7EC8E3,
        BodyId::Neptune => 0x3B5998,
        BodyId::Moon => 0xCCCCCC,
        BodyId::Phobos => 0x8A7F72,
        BodyId::Deimos => 0x9A8F82,
        BodyId::Io => 0xE8C840,
        BodyId::Europa => 0xC8D8F0,
        BodyId::Ganymede => 0xA0A8B8,
        BodyId::Callisto => 0x706058,
        BodyId::Titan => 0xD08830,
        BodyId::Enceladus => 0xE8F0F8,
        BodyId::Titania => 0xB0B8C0,
        BodyId::Oberon => 0x686060,
        BodyId::Triton => 0x90B0C0,
        BodyId::Pluto => 0xCDB380,
        BodyId::Eris => 0xD8D0C8,
        BodyId::Haumea => 0xC0C8D0,
        BodyId::Makemake => 0xD0A878,
        BodyId::Sedna => 0xA03030,
        BodyId::Ceres => 0x888070,
        BodyId::Vesta => 0xA0A090,
        BodyId::Pallas => 0x908880,
        BodyId::Hygiea => 0x787068,
        BodyId::Juno => 0xB0A890,
        BodyId::Halley => 0x80D0F0,
        BodyId::Encke => 0x70C8E0,
        BodyId::HaleBopp => 0x90D8F8,
        BodyId::ChuryumovGerasimenko => 0x60B8D8,
        BodyId::Tempel1 => 0x50B0D0,
        BodyId::BeltAsteroid(_) => 0x887766,
        BodyId::KuiperObject(_) => 0x556688,
    }
}

fn body_display_name(id: BodyId) -> &'static str {
    match id {
        BodyId::ChuryumovGerasimenko => "67P/C-G",
        BodyId::HaleBopp => "Hale-Bopp",
        BodyId::Tempel1 => "Tempel-1",
        other => {
            // BodyId's Debug format gives us the variant name which works for most
            // We match the remaining ones explicitly to avoid allocating
            match other {
                BodyId::Sun => "Sun",
                BodyId::Mercury => "Mercury",
                BodyId::Venus => "Venus",
                BodyId::Earth => "Earth",
                BodyId::Mars => "Mars",
                BodyId::Jupiter => "Jupiter",
                BodyId::Saturn => "Saturn",
                BodyId::Uranus => "Uranus",
                BodyId::Neptune => "Neptune",
                BodyId::Moon => "Moon",
                BodyId::Phobos => "Phobos",
                BodyId::Deimos => "Deimos",
                BodyId::Io => "Io",
                BodyId::Europa => "Europa",
                BodyId::Ganymede => "Ganymede",
                BodyId::Callisto => "Callisto",
                BodyId::Titan => "Titan",
                BodyId::Enceladus => "Enceladus",
                BodyId::Titania => "Titania",
                BodyId::Oberon => "Oberon",
                BodyId::Triton => "Triton",
                BodyId::Pluto => "Pluto",
                BodyId::Eris => "Eris",
                BodyId::Haumea => "Haumea",
                BodyId::Makemake => "Makemake",
                BodyId::Sedna => "Sedna",
                BodyId::Ceres => "Ceres",
                BodyId::Vesta => "Vesta",
                BodyId::Pallas => "Pallas",
                BodyId::Hygiea => "Hygiea",
                BodyId::Juno => "Juno",
                BodyId::Halley => "Halley",
                BodyId::Encke => "Encke",
                BodyId::BeltAsteroid(_) => "Belt Asteroid",
                BodyId::KuiperObject(_) => "Kuiper Object",
                _ => "Unknown",
            }
        }
    }
}

// ── SolarSystem (exported to JS) — delegates to real solarsystems crate ───
#[wasm_bindgen]
pub struct SolarSystem {
    pipeline: Pipeline,
}

#[wasm_bindgen]
impl SolarSystem {
    #[wasm_bindgen(constructor)]
    pub fn new(dt: f64) -> Self {
        let bodies = default_bodies_with_belts(200, 200);
        let mut pipeline = Pipeline::new(bodies, dt, Integrator::LeapfrogKDK);
        pipeline.initialize();
        Self { pipeline }
    }

    pub fn step(&mut self, n: u32) -> f64 {
        for _ in 0..n {
            self.pipeline.step();
        }
        self.pipeline.time.days_elapsed()
    }

    pub fn count(&self) -> usize { self.pipeline.bodies.len() }

    pub fn positions_au(&self) -> Vec<f64> {
        let mut out = Vec::with_capacity(self.pipeline.bodies.len() * 3);
        for b in &self.pipeline.bodies {
            out.push(b.position.x / AU);
            out.push(b.position.y / AU);
            out.push(b.position.z / AU);
        }
        out
    }

    pub fn radii(&self) -> Vec<f64> {
        self.pipeline.bodies.iter().map(|b| b.radius).collect()
    }

    pub fn masses(&self) -> Vec<f64> {
        self.pipeline.bodies.iter().map(|b| b.mass).collect()
    }

    pub fn colors(&self) -> Vec<u32> {
        self.pipeline.bodies.iter().map(|b| body_color(b.id)).collect()
    }

    pub fn kinds(&self) -> Vec<u8> {
        self.pipeline.bodies.iter().map(|b| body_kind(b.id)).collect()
    }

    pub fn parents(&self) -> Vec<i8> {
        let ids: Vec<BodyId> = self.pipeline.bodies.iter().map(|b| b.id).collect();
        ids.iter().map(|id| {
            match id.parent() {
                Some(pid) if pid == BodyId::Sun => -1_i8,
                Some(pid) => ids.iter().position(|i| *i == pid).map_or(-1, |idx| idx as i8),
                None => -1,
            }
        }).collect()
    }

    pub fn names(&self) -> String {
        self.pipeline.bodies
            .iter()
            .map(|b| body_display_name(b.id))
            .collect::<Vec<_>>()
            .join(";")
    }

    pub fn elapsed_days(&self) -> f64 { self.pipeline.time.days_elapsed() }

    pub fn total_energy(&self) -> f64 {
        self.pipeline.total_energy()
    }
}

// ══════════════════════════════════════════════════════════════
//  Galaxy-scale view — static catalog (no N-body at this scale)
// ══════════════════════════════════════════════════════════════

/// A galaxy-scale body: position in kpc from galactic center, metadata for rendering.
#[derive(Clone)]
struct GalBody {
    name: &'static str,
    kind: u8,            // KIND_*
    x_kpc: f64,          // galactic X (kpc)
    y_kpc: f64,          // galactic Y (kpc)
    mass_solar: f64,     // mass in solar masses
    radius_px: f32,      // visual radius for canvas
    color: u32,          // 0xRRGGBB
    luminosity: f64,     // in solar luminosities (0 for BHs)
    temperature: f64,    // surface T in Kelvin (0 for BHs)
    spin: f64,           // dimensionless spin (for BHs)
}

/// Convert a distance in light-years to kpc.
fn ly_to_kpc(light_years: f64) -> f64 {
    (light_years * LY) / KPC
}

/// Convert a distance in parsecs to kpc.
fn pc_to_kpc(parsecs: f64) -> f64 {
    (parsecs * PARSEC) / KPC
}

fn galaxy_catalog() -> Vec<GalBody> {
    // Sun is at ~8178 pc from galactic center (Orion Arm).
    let sun_dist_pc: f64 = 8178.0;
    let sun_x = pc_to_kpc(sun_dist_pc);
    let sun_y: f64 = 0.0;

    vec![
        // ── Supermassive black hole at galactic center ──
        // From SagittariusA*s crate: mass 4.0e6 M☉, distance 8178 pc, spin 0.9
        GalBody {
            name: "Sagittarius A*", kind: KIND_BLACKHOLE,
            x_kpc: 0.0, y_kpc: 0.0,
            mass_solar: 4.0e6, radius_px: 18.0, color: 0x1A0033,
            luminosity: 0.0, temperature: 0.0, spin: 0.9,
        },

        // ── Solar System (our reference point) ──
        GalBody {
            name: "Solar System", kind: KIND_STAR,
            x_kpc: sun_x, y_kpc: sun_y,
            mass_solar: 1.0, radius_px: 8.0, color: 0xFFD866,
            luminosity: 1.0, temperature: 5778.0, spin: 0.0,
        },

        // ── Nearby stars (from StarsFactory crate) ──
        // Proxima Centauri — 4.24 ly from Sun
        GalBody {
            name: "Proxima Centauri", kind: KIND_DISTANT_STAR,
            x_kpc: sun_x + ly_to_kpc(4.0), y_kpc: sun_y + ly_to_kpc(1.3),
            mass_solar: 0.122, radius_px: 2.0, color: 0xFF4422,
            luminosity: 0.0017, temperature: 3042.0, spin: 0.0,
        },
        // Sirius — 8.6 ly from Sun
        GalBody {
            name: "Sirius", kind: KIND_DISTANT_STAR,
            x_kpc: sun_x - ly_to_kpc(6.5), y_kpc: sun_y + ly_to_kpc(5.6),
            mass_solar: 2.063, radius_px: 5.0, color: 0xCAE1FF,
            luminosity: 25.4, temperature: 9940.0, spin: 0.0,
        },
        // Vega — 25 ly from Sun
        GalBody {
            name: "Vega", kind: KIND_DISTANT_STAR,
            x_kpc: sun_x + ly_to_kpc(16.3), y_kpc: sun_y + ly_to_kpc(18.9),
            mass_solar: 2.135, radius_px: 4.5, color: 0xD0E8FF,
            luminosity: 40.12, temperature: 9602.0, spin: 0.0,
        },
        // Betelgeuse — 700 ly from Sun
        GalBody {
            name: "Betelgeuse", kind: KIND_DISTANT_STAR,
            x_kpc: sun_x - ly_to_kpc(330.0), y_kpc: sun_y + ly_to_kpc(620.0),
            mass_solar: 16.5, radius_px: 10.0, color: 0xFF6030,
            luminosity: 126000.0, temperature: 3600.0, spin: 0.0,
        },
        // Aldebaran — 65 ly from Sun
        GalBody {
            name: "Aldebaran", kind: KIND_DISTANT_STAR,
            x_kpc: sun_x + ly_to_kpc(49.0), y_kpc: sun_y - ly_to_kpc(42.3),
            mass_solar: 1.16, radius_px: 6.0, color: 0xFF8844,
            luminosity: 518.0, temperature: 3910.0, spin: 0.0,
        },

        // ── Notable black holes (from BlackHolesFactory crate) ──
        // Cygnus X-1 — stellar BH, 6850 ly from Sun
        GalBody {
            name: "Cygnus X-1", kind: KIND_BLACKHOLE,
            x_kpc: sun_x - ly_to_kpc(4900.0), y_kpc: sun_y + ly_to_kpc(4730.0),
            mass_solar: 21.2, radius_px: 6.0, color: 0x220044,
            luminosity: 0.0, temperature: 0.0, spin: 0.998,
        },
        // HLX-1 (ESO 243-49) — intermediate-mass BH, 290 Mly from Sun
        // Mapped to galactic edge for catalog completeness (real distance: ~89 Mpc)
        GalBody {
            name: "HLX-1", kind: KIND_BLACKHOLE,
            x_kpc: pc_to_kpc(14000.0), y_kpc: pc_to_kpc(12000.0),
            mass_solar: 2.0e4, radius_px: 8.0, color: 0x330055,
            luminosity: 0.0, temperature: 0.0, spin: 0.5,
        },
        // M87* — supermassive BH, 16.4 Mpc from Sun
        // Mapped to opposite galactic edge for catalog completeness
        GalBody {
            name: "M87*", kind: KIND_BLACKHOLE,
            x_kpc: -pc_to_kpc(15000.0), y_kpc: pc_to_kpc(13000.0),
            mass_solar: 6.5e9, radius_px: 16.0, color: 0x1A0033,
            luminosity: 0.0, temperature: 0.0, spin: 0.9,
        },
    ]
}

// ── Spiral arm geometry (logarithmic spiral, 4 arms) ──
fn spiral_arm_points(n_per_arm: usize) -> Vec<(f64, f64)> {
    let mut pts = Vec::with_capacity(4 * n_per_arm);
    let pitch_angle: f64 = 12.0_f64.to_radians();  // ~12° pitch for Milky Way
    let k = pitch_angle.tan();
    for arm in 0..4 {
        let theta_offset = (arm as f64) * std::f64::consts::FRAC_PI_2; // 90° between arms
        for i in 0..n_per_arm {
            let frac = i as f64 / n_per_arm as f64;
            let r = 2.0 + frac * 13.0;  // 2 kpc to 15 kpc radius
            let theta = theta_offset + (r / k).ln();
            let x = r * theta.cos();
            let y = r * theta.sin();
            pts.push((x, y));
        }
    }
    pts
}

#[wasm_bindgen]
pub struct GalaxyView {
    bodies: Vec<GalBody>,
    spiral_points: Vec<(f64, f64)>,
}

#[wasm_bindgen]
impl GalaxyView {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let bodies = galaxy_catalog();
        let spiral_points = spiral_arm_points(120);
        Self { bodies, spiral_points }
    }

    pub fn body_count(&self) -> usize { self.bodies.len() }

    /// Flat [x0,y0, x1,y1, …] in kpc.
    pub fn positions_kpc(&self) -> Vec<f64> {
        let mut out = Vec::with_capacity(self.bodies.len() * 2);
        for b in &self.bodies {
            out.push(b.x_kpc);
            out.push(b.y_kpc);
        }
        out
    }

    pub fn radii(&self) -> Vec<f32> {
        self.bodies.iter().map(|b| b.radius_px).collect()
    }

    pub fn colors(&self) -> Vec<u32> {
        self.bodies.iter().map(|b| b.color).collect()
    }

    pub fn kinds(&self) -> Vec<u8> {
        self.bodies.iter().map(|b| b.kind).collect()
    }

    /// Mass in solar masses for each body.
    pub fn masses(&self) -> Vec<f64> {
        self.bodies.iter().map(|b| b.mass_solar).collect()
    }

    /// Luminosity in solar luminosities.
    pub fn luminosities(&self) -> Vec<f64> {
        self.bodies.iter().map(|b| b.luminosity).collect()
    }

    /// Surface temperature (K).
    pub fn temperatures(&self) -> Vec<f64> {
        self.bodies.iter().map(|b| b.temperature).collect()
    }

    /// Dimensionless spin parameter (for black holes).
    pub fn spins(&self) -> Vec<f64> {
        self.bodies.iter().map(|b| b.spin).collect()
    }

    /// Semicolon-separated name list.
    pub fn names(&self) -> String {
        self.bodies.iter().map(|b| b.name).collect::<Vec<_>>().join(";")
    }

    /// Spiral arm dot positions: flat [x0,y0, x1,y1, …] in kpc.
    pub fn spiral_arms_kpc(&self) -> Vec<f64> {
        let mut out = Vec::with_capacity(self.spiral_points.len() * 2);
        for &(x, y) in &self.spiral_points {
            out.push(x);
            out.push(y);
        }
        out
    }

    pub fn spiral_point_count(&self) -> usize { self.spiral_points.len() }

    /// Index of the Solar System body in the catalog.
    pub fn solar_system_index(&self) -> usize { 1 }
}
