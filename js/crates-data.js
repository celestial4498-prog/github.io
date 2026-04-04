// ===== ALL CRATES DATA =====
// This file contains metadata, module trees, documentation, and source code
// for every crate in the Celestial Bodies ecosystem.

const CRATES_DATA = {
    // ==================== STARS ====================
    suns: {
        name: 'suns',
        emoji: '☀️',
        category: 'star',
        tagline: 'Complete solar physics simulation',
        description: 'Full simulation of the Sun — core nuclear fusion (PP-chain, CNO cycle), radiative & convective zone transport, photosphere/chromosphere/corona layer modeling, solar wind propagation, magnetic reconnection & flares, sunspot 11-year cycles, coronal mass ejections, and heliospheric current sheet.',
        version: '0.0.1',
        label: '☀️ The Sun',
        github: 'https://github.com/celestial4498-prog/Suns',
        color: '#ffd866',
        constants: [
            { name: 'SOLAR_RADIUS', value: '6.9634×10⁸ m', desc: 'Mean photospheric radius' },
            { name: 'SOLAR_LUMINOSITY', value: '3.828×10²⁶ W', desc: 'Total radiant power' },
            { name: 'SOLAR_EFFECTIVE_TEMP', value: '5778 K', desc: 'Photosphere temperature' },
            { name: 'SOLAR_CORE_TEMP', value: '1.57×10⁷ K', desc: 'Central temperature' },
            { name: 'SOLAR_CORE_PRESSURE', value: '2.477×10¹⁶ Pa', desc: 'Central pressure' },
            { name: 'SOLAR_WIND_SPEED_SLOW', value: '400 km/s', desc: 'Slow solar wind' },
            { name: 'SOLAR_WIND_SPEED_FAST', value: '800 km/s', desc: 'Fast solar wind' },
            { name: 'SOLAR_CYCLE_YEARS', value: '11 yr', desc: 'Schwabe cycle period' },
            { name: 'PP_CHAIN_ENERGY', value: '26.732 MeV', desc: 'Energy per PP-chain reaction' },
        ],
        modules: [
            { name: 'lib.rs', icon: '📦', desc: 'Root — all solar constants (radius, luminosity, temperature, core conditions, magnetic fields, nuclear reaction energies)' },
            { name: 'photosphere', icon: '🌅', desc: 'Photospheric layers (4400–6600K), thickness modeling, sunspot umbra/penumbra temperatures' },
            { name: 'chromosphere', icon: '🔥', desc: 'Chromosphere dynamics (4400–25000K), spicules, prominences' },
            { name: 'corona', icon: '👑', desc: 'Corona simulation (1–3 MK), coronal loops, heating problem models' },
            { name: 'core fusion', icon: '⚛️', desc: 'PP-chain & CNO cycle energy generation, neutrino flux' },
            { name: 'solar wind', icon: '💨', desc: 'Parker spiral, slow/fast wind, heliospheric current sheet' },
            { name: 'magnetic', icon: '🧲', desc: 'Dynamo model, 11yr cycle, reconnection events, CME generation' },
            { name: 'flares', icon: '⚡', desc: 'C/M/X class flares, energy release, particle acceleration' },
            { name: 'evolution', icon: '📈', desc: 'Main sequence evolution, luminosity increase over 4.6 Gyr' },
        ],
        source: `use sciforge::hub::domain::common::constants::{G, K_B, SIGMA_SB, SOLAR_MASS};

pub const SOLAR_RADIUS: f64 = 6.9634e8;        // m
pub const SOLAR_LUMINOSITY: f64 = 3.828e26;     // W
pub const SOLAR_EFFECTIVE_TEMP: f64 = 5778.0;   // K
pub const SOLAR_AGE_YR: f64 = 4.603e9;
pub const SOLAR_ROTATION_EQUATORIAL_DAYS: f64 = 25.05;
pub const SOLAR_ROTATION_POLAR_DAYS: f64 = 34.4;
pub const SOLAR_MEAN_DENSITY: f64 = 1408.0;     // kg/m³
pub const SOLAR_CORE_TEMP: f64 = 1.57e7;        // K
pub const SOLAR_CORE_DENSITY: f64 = 1.622e5;    // kg/m³
pub const SOLAR_CORE_PRESSURE: f64 = 2.477e16;  // Pa
pub const SOLAR_SURFACE_GRAVITY: f64 = 274.0;   // m/s²

pub const SOLAR_MAGNETIC_FIELD_POLAR_T: f64 = 1e-4;
pub const SOLAR_MAGNETIC_FIELD_SUNSPOT_T: f64 = 0.3;
pub const SOLAR_CYCLE_YEARS: f64 = 11.0;

pub const SOLAR_WIND_SPEED_SLOW: f64 = 4.0e5;   // m/s
pub const SOLAR_WIND_SPEED_FAST: f64 = 8.0e5;   // m/s

pub const PP_CHAIN_ENERGY_MEV: f64 = 26.732;
pub const CNO_CYCLE_ENERGY_MEV: f64 = 25.97;
pub const MEV_TO_JOULE: f64 = 1.60218e-13;

pub const PHOTOSPHERE_TEMP_MIN: f64 = 4400.0;
pub const PHOTOSPHERE_TEMP_MAX: f64 = 6600.0;
pub const CORONA_TEMP: f64 = 1.0e6;
pub const CORONA_TEMP_MAX: f64 = 3.0e6;

pub const CORE_RADIUS_FRAC: f64 = 0.25;
pub const RADIATIVE_ZONE_OUTER_FRAC: f64 = 0.70;
pub const CONVECTIVE_ZONE_BASE_FRAC: f64 = 0.70;`
    },

    starsfactory: {
        name: 'starsfactory',
        emoji: '🏭',
        category: 'factory',
        tagline: 'Procedural star generation engine',
        description: 'Generate realistic stars across the Hertzsprung-Russell diagram — spectral classification (O/B/A/F/G/K/M), luminosity classes (Ia-V), mass-luminosity relations, stellar population synthesis, main sequence lifetimes, and realistic physical parameter distributions.',
        version: '0.0.1',
        label: '🏭 Generator',
        github: 'https://github.com/celestial4498-prog/StarsFactory',
        color: '#fdcb6e',
        constants: [],
        modules: [
            { name: 'config', icon: '⚙️', desc: 'Generation parameters, spectral type distributions, IMF settings' },
            { name: 'engine', icon: '🔧', desc: 'Core star generation engine, HR diagram placement, mass-radius-luminosity relations' },
            { name: 'generator', icon: '🎲', desc: 'Procedural generation algorithms, statistical sampling, cluster generation' },
            { name: 'output', icon: '📤', desc: 'Star catalog export, serialization formats' },
            { name: 'physics', icon: '⚛️', desc: 'Stellar physics — nuclear burning rates, opacity, equation of state' },
            { name: 'utils', icon: '🔨', desc: 'Helper functions, unit conversions, interpolation' },
        ],
        source: `pub mod config;
pub mod engine;
pub mod generator;
pub mod output;
pub mod physics;
pub mod utils;`
    },

    // ==================== BLACK HOLES ====================
    blackholesfactory: {
        name: 'blackholesfactory',
        emoji: '🕳️',
        category: 'blackhole',
        tagline: 'Generate any black hole — stellar, intermediate, or supermassive',
        description: 'Black hole factory — generate and validate any type of black hole. Three built-in types: stellar-mass (Cygnus X-1 class), intermediate-mass (10²–10⁵ M☉), and supermassive (M87, Sgr A* class). Each comes with Kerr/Schwarzschild spacetime, accretion disk dynamics, relativistic jets, gravitational lensing, Hawking evaporation, shadow rendering, and photon orbit tracing. One crate, multiple binaries — produce any black hole you need.',
        version: '0.0.1',
        label: '🕳️ Factory — 3 types',
        github: 'https://github.com/celestial4498-prog/BlackHolesFactory',
        color: '#fd4556',
        constants: [],
        modules: [
            { name: 'config', icon: '⚙️', desc: 'Black hole parameters — mass ranges, spin, charge, validation thresholds' },
            { name: 'engine', icon: '🔧', desc: 'Accretion disk, jet dynamics, spacetime integration, evaporation' },
            { name: 'observables', icon: '👁️', desc: 'Shadow contours, gravitational lensing, accretion radiation' },
            { name: 'physics', icon: '⚛️', desc: 'Schwarzschild/Kerr metrics, Hawking radiation, gravitational waves' },
            { name: 'types/stellar_mass', icon: '💀', desc: 'Stellar-mass black holes (3–100 M☉) — Cygnus X-1 class' },
            { name: 'types/intermediate_mass', icon: '⚫', desc: 'Intermediate-mass (10²–10⁵ M☉) — QPO, recoil velocity' },
            { name: 'types/supermassive', icon: '🌀', desc: 'Supermassive (10⁶–10¹⁰ M☉) — M-σ relation, tidal disruption, jets' },
            { name: 'utils', icon: '🔨', desc: 'Coordinate transforms, numerical utilities' },
        ],
        source: `pub mod config;
pub mod engine;
pub mod observables;
pub mod physics;
pub mod types;
pub mod utils;`
    },

    sagittariusas: {
        name: 'sagittariusas',
        emoji: '🌀',
        category: 'blackhole',
        tagline: 'Sagittarius A* — Milky Way central SMBH',
        description: 'Dedicated simulation of Sagittarius A*, the 4 million solar mass supermassive black hole at the Milky Way\'s center. S-star orbital dynamics and precession, accretion flare events, relativistic jet modeling, galactic center gas dynamics, and Event Horizon Telescope shadow comparison.',
        version: '0.0.1',
        label: '🌀 4M☉ SMBH',
        github: 'https://github.com/celestial4498-prog/SagittariusA-s',
        color: '#fd4556',
        constants: [],
        modules: [
            { name: 'config', icon: '⚙️', desc: 'Sgr A* parameters — mass (4.15×10⁶ M☉), distance (8.178 kpc), spin' },
            { name: 'engine', icon: '🔧', desc: 'Orbital integration for S-stars, accretion dynamics' },
            { name: 'observables', icon: '👁️', desc: 'EHT shadow, NIR/X-ray flares, proper motion of S-stars' },
            { name: 'physics', icon: '⚛️', desc: 'GR precession, gravitational redshift, relativistic beaming' },
            { name: 'utils', icon: '🔨', desc: 'Galactic coordinate transforms, time delays' },
        ],
        source: `pub mod config;
pub mod engine;
pub mod observables;
pub mod physics;
pub mod utils;`
    },

    // ==================== PLANETS ====================
    planetsfactory: {
        name: 'planetsfactory',
        emoji: '🏭',
        category: 'factory',
        tagline: 'Planet classification & generation engine',
        description: 'Planet factory — classify, build and catalogue planets for any star system: Solar System, TRAPPIST-1, Kepler-90, Proxima Centauri, or fully custom worlds. Generates terrestrial, gas giant, ice giant, super-Earth, mini-Neptune, and hot Jupiter types with physically consistent parameters.',
        version: '0.0.2',
        label: '🏭 Generator',
        github: 'https://github.com/celestial4498-prog/PlanetsFactory',
        color: '#fdcb6e',
        constants: [],
        modules: [
            { name: 'config', icon: '⚙️', desc: 'Planet generation parameters, type distributions, mass-radius relations' },
            { name: 'engine', icon: '🔧', desc: 'Core planet generation engine, classification, atmosphere assignment' },
            { name: 'observables', icon: '👁️', desc: 'Transit depth, radial velocity amplitude, albedo, phase curves' },
            { name: 'physics', icon: '⚛️', desc: 'Interior structure, equation of state, thermal evolution' },
            { name: 'types', icon: '🪐', desc: 'Terrestrial, gas giant, ice giant, super-Earth, hot Jupiter types' },
            { name: 'utils', icon: '🔨', desc: 'Helper functions, unit conversions' },
        ],
        source: `pub mod config;\npub mod engine;\npub mod observables;\npub mod physics;\npub mod types;\npub mod utils;`
    },

    mercurys: {
        name: 'mercurys',
        emoji: '☿',
        category: 'planet',
        tagline: 'Mercury — the innermost planet',
        description: 'Simulation of Mercury — extreme diurnal temperature range (100K–700K), heavily cratered surface (Caloris Basin), sodium/potassium exosphere, 3:2 spin-orbit resonance, relativistic perihelion precession (43\"/century), large iron core (75% radius), and very thin magnetosphere.',
        version: '0.0.1',
        label: '☿ 0.39 AU',
        github: 'https://github.com/celestial4498-prog/Mercurys',
        color: '#00cec9',
        constants: [],
        modules: [
            { name: 'atmosphere', icon: '💨', desc: 'Sodium/potassium exosphere, solar wind sputtering, micro-meteorite vaporization' },
            { name: 'biosphere', icon: '🧬', desc: 'Abiotic surface chemistry, radiation environment' },
            { name: 'geodata', icon: '🗺️', desc: 'Crater catalog, Caloris Basin, elevation models' },
            { name: 'geology', icon: '🪨', desc: 'Iron core, mantle shrinkage, lobate scarps, volcanic plains' },
            { name: 'hydrology', icon: '💧', desc: 'Polar ice deposits in permanently shadowed craters' },
            { name: 'lighting', icon: '🌅', desc: 'Solar position, 176-day solar day, extreme thermal cycling' },
            { name: 'physics', icon: '⚛️', desc: 'Orbital mechanics, 3:2 resonance, GR precession, tides' },
            { name: 'terrain', icon: '🏔️', desc: 'Crater morphology, smooth plains, heightmap generation' },
            { name: 'temporal', icon: '⏰', desc: 'Hermean calendar, solar day vs sidereal day' },
            { name: 'rendering', icon: '🎨', desc: 'Surface reflectance, thermal emission' },
            { name: 'satellites', icon: '🛰️', desc: 'No natural satellites — MESSENGER/BepiColombo mission data' },
        ],
        source: `// Mercury planet crate — uniform modular structure
pub mod atmosphere;
pub mod biosphere;
pub mod geodata;
pub mod geology;
pub mod hydrology;
pub mod lighting;
pub mod physics;
pub mod terrain;
pub mod temporal;
pub mod rendering;
pub mod satellites;`
    },

    venuss: {
        name: 'venuss',
        emoji: '♀',
        category: 'planet',
        tagline: 'Venus — Earth\'s hellish twin',
        description: 'Venus simulation — 92 atm CO₂ atmosphere, 467°C surface temperature, sulfuric acid cloud decks, super-rotation winds (360 km/h at cloud tops), volcanic resurfacing (500 Myr cycles), retrograde rotation (243 days), and greenhouse runaway physics.',
        version: '0.0.1',
        label: '♀ 0.72 AU',
        github: 'https://github.com/celestial4498-prog/Venuss',
        color: '#00cec9',
        constants: [],
        modules: [
            { name: 'atmosphere', icon: '💨', desc: '92 atm CO₂, H₂SO₄ clouds, super-rotation, greenhouse effect' },
            { name: 'biosphere', icon: '🧬', desc: 'Hypothetical aerial biosphere, phosphine debate' },
            { name: 'geodata', icon: '🗺️', desc: 'Magellan radar data, Ishtar/Aphrodite Terra, coronae' },
            { name: 'geology', icon: '🪨', desc: 'Volcanic resurfacing, pancake domes, tessera, rift zones' },
            { name: 'hydrology', icon: '💧', desc: 'Ancient ocean hypothesis, water loss via UV photolysis' },
            { name: 'lighting', icon: '🌅', desc: 'Dim surface (scattered light), 116.75-day solar day' },
            { name: 'physics', icon: '⚛️', desc: 'Retrograde rotation, quasi-circular orbit, no magnetic field' },
            { name: 'terrain', icon: '🏔️', desc: 'Radar-derived topography, volcanic shields, tesserae' },
            { name: 'temporal', icon: '⏰', desc: 'Venusian calendar, sidereal vs solar day' },
            { name: 'rendering', icon: '🎨', desc: 'Thick cloud rendering, false-color radar surfaces' },
            { name: 'satellites', icon: '🛰️', desc: 'No natural satellites' },
        ],
        source: `pub mod atmosphere;   // 92 atm CO₂, sulfuric acid clouds
pub mod biosphere;
pub mod geodata;      // Magellan SAR data
pub mod geology;      // Volcanic resurfacing
pub mod hydrology;    // Ancient ocean loss
pub mod lighting;
pub mod physics;      // Retrograde rotation
pub mod terrain;
pub mod temporal;
pub mod rendering;
pub mod satellites;`
    },

    earths: {
        name: 'earths',
        emoji: '🌍',
        category: 'planet',
        tagline: 'Earth — the reference planet',
        description: 'Complete Earth simulation — troposphere to thermosphere atmosphere layers, full plate tectonics, ocean circulation, biosphere ecosystems, magnetosphere, Milankovitch cycles, tidally-locked Moon interaction, and climate models using sciforge physical constants.',
        version: '0.0.1',
        label: '🌍 1.00 AU',
        github: 'https://github.com/celestial4498-prog/Earths',
        color: '#00cec9',
        constants: [
            { name: 'EARTH_MASS', value: '5.9722×10²⁴ kg', desc: 'From sciforge constants' },
            { name: 'EARTH_RADIUS', value: '6.371×10⁶ m', desc: 'Mean radius' },
            { name: 'SURFACE_GRAVITY', value: 'G·M/R²', desc: 'Computed from constants' },
            { name: 'SEA_LEVEL_PRESSURE', value: '101325 Pa', desc: '1 atm' },
        ],
        modules: [
            { name: 'atmosphere', icon: '💨', desc: 'Troposphere/stratosphere/mesosphere/thermosphere, molecular masses from sciforge atomic_mass()' },
            { name: 'biosphere', icon: '🧬', desc: 'Ecosystem types, vegetation, fauna diversity' },
            { name: 'geodata', icon: '🗺️', desc: 'Coordinates, elevation, bathymetry, continental regions' },
            { name: 'geology', icon: '🪨', desc: 'Plate tectonics, earthquakes, volcanism, mountain building' },
            { name: 'hydrology', icon: '💧', desc: 'Oceans (NaCl molarity from atomic masses), rivers, glaciers' },
            { name: 'lighting', icon: '🌅', desc: 'Solar position, daylight calculation, seasons, eclipses' },
            { name: 'physics', icon: '⚛️', desc: 'Orbital mechanics, rotation, tides via Moon interaction' },
            { name: 'terrain', icon: '🏔️', desc: 'Heightmap, mesh generation, LOD, texturing' },
            { name: 'temporal', icon: '⏰', desc: 'Gregorian calendar, Julian dates, leap seconds, epoch' },
            { name: 'rendering', icon: '🎨', desc: 'Atmosphere scattering, ocean shaders, cloud layers' },
            { name: 'satellites', icon: '🛰️', desc: 'Moon data, artificial satellites, ISS orbit' },
        ],
        source: `use sciforge::hub::prelude::constants::elements::atomic_mass;
use sciforge::hub::prelude::constants::{
    ATM_TO_PASCAL, EARTH_MASS, EARTH_RADIUS, G, N_A, R_GAS
};
use std::sync::LazyLock;

pub fn mn2() -> f64 { 2.0 * atomic_mass(7) * 1e-3 }
pub fn mo2() -> f64 { 2.0 * atomic_mass(8) * 1e-3 }
pub fn mar() -> f64 { atomic_mass(18) * 1e-3 }
pub fn mh2o() -> f64 { (2.0 * atomic_mass(1) + atomic_mass(8)) * 1e-3 }
pub fn mco2() -> f64 { (atomic_mass(6) + 2.0 * atomic_mass(8)) * 1e-3 }
pub fn mdryair() -> f64 {
    0.78084 * mn2() + 0.20946 * mo2()
    + 0.00934 * mar() + 0.00036 * mco2()
}

pub static SURFACEGRAVITY: LazyLock<f64> = LazyLock::new(|| {
    G * EARTH_MASS / (EARTH_RADIUS * EARTH_RADIUS)
});

pub static SEALEVELAIRDENSITY: LazyLock<f64> = LazyLock::new(|| {
    let rspecific = R_GAS / mdryair();
    ATM_TO_PASCAL / (rspecific * 288.15)  // ISA @ sea level
});`
    },

    marss: {
        name: 'marss',
        emoji: '♂',
        category: 'planet',
        tagline: 'Mars — the red planet',
        description: 'Mars simulation — 6.36 mbar CO₂ atmosphere, global dust storms, Olympus Mons (21.9 km), Valles Marineris (4000 km), polar CO₂/H₂O ice caps, subsurface water evidence, Phobos/Deimos tidal evolution, and landing site terrain generation.',
        version: '0.0.1',
        label: '♂ 1.52 AU',
        github: 'https://github.com/celestial4498-prog/Marss',
        color: '#00cec9',
        constants: [],
        modules: [
            { name: 'atmosphere', icon: '💨', desc: '6.36 mbar CO₂, dust storms, seasonal pressure variation' },
            { name: 'biosphere', icon: '🧬', desc: 'Astrobiology, methane anomalies, subsurface habitability' },
            { name: 'geodata', icon: '🗺️', desc: 'MOLA topography, landing sites, geological provinces' },
            { name: 'geology', icon: '🪨', desc: 'Tharsis bulge, Olympus Mons, Valles Marineris, iron oxide regolith' },
            { name: 'hydrology', icon: '💧', desc: 'Polar caps (CO₂ + H₂O), subsurface ice, ancient rivers' },
            { name: 'lighting', icon: '🌅', desc: 'Blue sunsets, dust-scattered light, sol/day cycle' },
            { name: 'physics', icon: '⚛️', desc: 'Orbital eccentricity (0.0934), obliquity oscillations' },
            { name: 'terrain', icon: '🏔️', desc: 'MOLA heightmaps, dune fields, crater morphology' },
            { name: 'temporal', icon: '⏰', desc: 'Darian calendar, sols, Ls (solar longitude)' },
            { name: 'rendering', icon: '🎨', desc: 'Red-orange surface, dust skybox, thin atmosphere' },
            { name: 'satellites', icon: '🛰️', desc: 'Phobos & Deimos orbital parameters' },
        ],
        source: `pub mod atmosphere;   // 6.36 mbar CO₂
pub mod biosphere;    // astrobiology
pub mod geodata;      // MOLA topography
pub mod geology;      // Olympus Mons, Valles Marineris
pub mod hydrology;    // polar caps, subsurface ice
pub mod lighting;     // blue sunsets 
pub mod physics;
pub mod terrain;
pub mod temporal;     // Darian calendar
pub mod rendering;
pub mod satellites;   // Phobos & Deimos`
    },

    jupiters: {
        name: 'jupiters',
        emoji: '♃',
        category: 'planet',
        tagline: 'Jupiter — king of the gas giants',
        description: 'Jupiter simulation — Great Red Spot dynamics, metallic hydrogen interior, 79+ moons, intense radiation belts, Juno mission gravity field data, Galilean moon tidal heating cascade (Laplace resonance), ring system, and adiabatic interior structure.',
        version: '0.0.1',
        label: '♃ 5.20 AU',
        github: 'https://github.com/celestial4498-prog/Jupiters',
        color: '#00cec9',
        constants: [],
        modules: [
            { name: 'atmosphere', icon: '💨', desc: 'Zones & belts, GRS, ammonia/water clouds, deep convection' },
            { name: 'biosphere', icon: '🧬', desc: 'Hypothetical aerial ecosystems, phosphine' },
            { name: 'geodata', icon: '🗺️', desc: 'Cloud band mapping, vortex cataloging' },
            { name: 'geology', icon: '🪨', desc: 'Metallic H core, dilute core hypothesis, magnetic dynamo' },
            { name: 'hydrology', icon: '💧', desc: 'Deep water ocean layer, supercritical fluids' },
            { name: 'lighting', icon: '🌅', desc: '9.9 hr rotation, polar aurorae, lightning' },
            { name: 'physics', icon: '⚛️', desc: 'J2 oblateness, gravity harmonics, Laplace resonance' },
            { name: 'terrain', icon: '🏔️', desc: 'Cloud deck layers as terrain proxy' },
            { name: 'temporal', icon: '⏰', desc: 'Jovian time, revolution period (11.86 yr)' },
            { name: 'rendering', icon: '🎨', desc: 'Banded atmosphere, GRS, ring rendering' },
            { name: 'satellites', icon: '🛰️', desc: 'Galilean moons: Io, Europa, Ganymede, Callisto' },
        ],
        source: `pub mod atmosphere;   // zones, belts, GRS
pub mod biosphere;
pub mod geodata;
pub mod geology;      // metallic hydrogen
pub mod hydrology;    // deep water layer
pub mod lighting;     // 9.9h rotation
pub mod physics;      // J2, Laplace resonance
pub mod terrain;
pub mod temporal;
pub mod rendering;
pub mod satellites;   // Galilean moons`
    },

    saturns: {
        name: 'saturns',
        emoji: '♄',
        category: 'planet',
        tagline: 'Saturn — lord of the rings',
        description: 'Saturn simulation — 307 passing tests across 10 modules. Ring dynamics & Roche limit physics, hexagonal polar vortex, ammonia crystal clouds, helium rain interior, Cassini Division, shepherd moon interactions, Titan & Enceladus sub-system data, and oblate spheroid geometry.',
        version: '0.0.1',
        label: '♄ 9.54 AU',
        github: 'https://github.com/celestial4498-prog/Saturns',
        color: '#00cec9',
        constants: [],
        modules: [
            { name: 'atmosphere', icon: '💨', desc: 'Ammonia clouds, hexagonal vortex, 1800 km/h winds (28 tests)' },
            { name: 'biosphere', icon: '🧬', desc: 'Hypothetical aerial/subsurface life (31 tests)' },
            { name: 'geodata', icon: '🗺️', desc: 'Oblate geometry, ring system coordinates (32 tests)' },
            { name: 'geology', icon: '🪨', desc: 'Helium rain, metallic H layer, core (33 tests)' },
            { name: 'hydrology', icon: '💧', desc: 'Water-ammonia deeper layers, supercritical (30 tests)' },
            { name: 'lighting', icon: '🌅', desc: '10.7h rotation, ring shadow, seasons (25 tests)' },
            { name: 'physics', icon: '⚛️', desc: 'Ring dynamics, Roche limit, J2 (24 tests)' },
            { name: 'satellites', icon: '🛰️', desc: 'Titan, Enceladus, Mimas, 80+ moons (26 tests)' },
            { name: 'temporal', icon: '⏰', desc: 'Saturnian time, 29.46 yr period (39 tests)' },
            { name: 'terrain', icon: '🏔️', desc: 'Ring particle simulation, A/B/C/F rings (39 tests)' },
        ],
        source: `pub mod atmosphere;   // hexagonal vortex - 28 tests
pub mod biosphere;    // 31 tests
pub mod geodata;      // oblate geometry - 32 tests
pub mod geology;      // helium rain - 33 tests
pub mod hydrology;    // 30 tests
pub mod lighting;     // ring shadows - 25 tests
pub mod physics;      // ring dynamics - 24 tests
pub mod satellites;   // 80+ moons - 26 tests
pub mod temporal;     // 39 tests
pub mod terrain;      // ring particles - 39 tests

// Total: 307 tests, 3 examples, 0 clippy warnings`
    },

    uranuss: {
        name: 'uranuss',
        emoji: '⛢',
        category: 'planet',
        tagline: 'Uranus — the tilted ice giant',
        description: 'Uranus simulation — 97.77° axial tilt, ice giant interior (water-ammonia-methane ices under extreme pressure), CH₄ atmosphere giving blue-green color, faint epsilon ring system, extreme seasonal variations (42yr polar night), and 27 known moons.',
        version: '0.0.1',
        label: '⛢ 19.2 AU',
        github: 'https://github.com/celestial4498-prog/Uranuss',
        color: '#00cec9',
        constants: [],
        modules: [
            { name: 'atmosphere', icon: '💨', desc: 'H₂/He/CH₄ atmosphere, pale blue-green, minimal internal heat' },
            { name: 'biosphere', icon: '🧬', desc: 'Extremely hostile — no known potential' },
            { name: 'geodata', icon: '🗺️', desc: 'Voyager 2 data, oblate geometry, ring coordinates' },
            { name: 'geology', icon: '🪨', desc: 'Water-ammonia-methane ice mantle, small rocky core' },
            { name: 'hydrology', icon: '💧', desc: 'Supercritical water-ammonia ocean, diamond rain hypothesis' },
            { name: 'lighting', icon: '🌅', desc: '17.24h rotation, 42yr polar night/day, extreme seasons' },
            { name: 'physics', icon: '⚛️', desc: '97.77° tilt, faint rings, magnetic tilt (59° from spin)' },
            { name: 'terrain', icon: '🏔️', desc: 'Cloud layer modeling, ring system' },
            { name: 'temporal', icon: '⏰', desc: 'Uranian time, 84yr orbital period' },
            { name: 'rendering', icon: '🎨', desc: 'Pale cyan atmosphere, epsilon ring' },
            { name: 'satellites', icon: '🛰️', desc: 'Miranda, Ariel, Umbriel, Titania, Oberon + 22 more' },
        ],
        source: `pub mod atmosphere;   // H₂/He/CH₄
pub mod biosphere;
pub mod geodata;
pub mod geology;      // ice mantle, diamond rain
pub mod hydrology;    // supercritical ocean
pub mod lighting;     // 97.77° tilt seasons
pub mod physics;      // extreme axial tilt
pub mod terrain;
pub mod temporal;     // 84yr orbit
pub mod rendering;
pub mod satellites;   // 27 moons`
    },

    neptunes: {
        name: 'neptunes',
        emoji: '♆',
        category: 'planet',
        tagline: 'Neptune — the windiest world',
        description: 'Neptune simulation — 2100 km/h supersonic winds (fastest in the solar system), Great Dark Spot dynamics, ice giant interior with excess internal heat (2.6× received solar), vivid blue CH₄ atmosphere, and Triton\'s retrograde captured KBO orbit.',
        version: '0.0.1',
        label: '♆ 30.1 AU',
        github: 'https://github.com/celestial4498-prog/Neptunes',
        color: '#00cec9',
        constants: [],
        modules: [
            { name: 'atmosphere', icon: '💨', desc: '2100 km/h winds, Great Dark Spot, methane blue' },
            { name: 'biosphere', icon: '🧬', desc: 'No known potential' },
            { name: 'geodata', icon: '🗺️', desc: 'Voyager 2 data, oblate geometry' },
            { name: 'geology', icon: '🪨', desc: 'Ice mantle, 2.6× thermal excess, diamond rain' },
            { name: 'hydrology', icon: '💧', desc: 'Ionic water ocean, supercritical fluids' },
            { name: 'lighting', icon: '🌅', desc: '16.1h rotation, faint rings, feeble sunlight' },
            { name: 'physics', icon: '⚛️', desc: 'Orbital resonance with Pluto, internal heat source' },
            { name: 'terrain', icon: '🏔️', desc: 'Cloud bands, vortex systems' },
            { name: 'temporal', icon: '⏰', desc: 'Neptunian time, 164.8yr orbital period' },
            { name: 'rendering', icon: '🎨', desc: 'Deep blue atmosphere, ring arcs' },
            { name: 'satellites', icon: '🛰️', desc: 'Triton (retrograde), Nereid, 14 known moons' },
        ],
        source: `pub mod atmosphere;   // 2100 km/h winds
pub mod biosphere;
pub mod geodata;
pub mod geology;      // diamond rain
pub mod hydrology;    // ionic ocean
pub mod lighting;     // 16.1h rotation
pub mod physics;      // internal heat excess
pub mod terrain;
pub mod temporal;     // 164.8yr orbit
pub mod rendering;
pub mod satellites;   // Triton retrograde`
    },

    // ==================== SATELLITES ====================
    satellitesfactory: {
        name: 'satellitesfactory',
        emoji: '🏭',
        category: 'factory',
        tagline: 'Natural satellite classification & generation engine',
        description: 'Satellite factory — classify, build and catalogue natural satellites for any planetary system: Solar System moons (Moon, Galileans, Titan, Triton…) or custom configurations. Generates regular, irregular, captured, co-orbital, and trojan moon types with tidal locking, resonance chains, and Hill sphere validation.',
        version: '0.0.1',
        label: '🏭 Generator',
        github: 'https://github.com/celestial4498-prog/SatellitesFactory',
        color: '#fdcb6e',
        constants: [],
        modules: [
            { name: 'config', icon: '⚙️', desc: 'Generation parameters, orbital distributions, size-class definitions' },
            { name: 'engine', icon: '🔧', desc: 'Core satellite generation engine, tidal locking, resonance assignment' },
            { name: 'observables', icon: '👁️', desc: 'Transit timing variations, mutual events, eclipse prediction' },
            { name: 'physics', icon: '⚛️', desc: 'Tidal heating, Roche limits, Hill sphere, orbital decay' },
            { name: 'types', icon: '🌙', desc: 'Regular, irregular, captured, co-orbital, trojan types' },
            { name: 'utils', icon: '🔨', desc: 'Helper functions, coordinate transforms' },
        ],
        source: `pub mod config;\npub mod engine;\npub mod observables;\npub mod physics;\npub mod types;\npub mod utils;`
    },

    moons: {
        name: 'moons',
        emoji: '🌕',
        category: 'satellite',
        tagline: 'The Moon — Earth\'s companion',
        description: 'Complete lunar simulation — tidal locking, regolith, maria basalt plains, crater dynamics, libration, Earth-Moon gravitational interaction, GRAIL gravity data, Chandrayaan/LCROSS water ice detection, and Apollo mission site data.',
        version: '0.0.1',
        label: '🌍 Earth',
        github: 'https://github.com/celestial4498-prog/Moons',
        color: '#e17aff',
        constants: [
            { name: 'MOON_MASS', value: '7.342×10²² kg', desc: 'Lunar mass' },
            { name: 'MOON_RADIUS_M', value: '1,737,400 m', desc: 'Mean radius' },
            { name: 'EARTH_MOON_DISTANCE_M', value: '384,400 km', desc: 'Semi-major axis' },
            { name: 'SURFACE_GRAVITY', value: '1.62 m/s²', desc: 'Surface gravity' },
            { name: 'SIDEREAL_ORBIT_PERIOD', value: '27.32 days', desc: 'Orbital period' },
            { name: 'SYNODIC_MONTH', value: '29.53 days', desc: 'Phase cycle' },
        ],
        modules: [
            { name: 'environment', icon: '🌡️', desc: 'Surface temp (25K polar to 390K subsolar), radiation dose, vacuum' },
            { name: 'exosphere', icon: '💨', desc: 'Sodium, potassium, argon exosphere, sputtering rates' },
            { name: 'geodata', icon: '🗺️', desc: 'Selenographic coordinates, LOLA elevation data' },
            { name: 'geology', icon: '🪨', desc: 'Maria, highlands, anorthosite crust, magma ocean history' },
            { name: 'interactions', icon: '🔗', desc: 'Earth-Moon tidal interaction, orbital recession (3.8 cm/yr)' },
            { name: 'lighting', icon: '🌅', desc: 'Earthshine, 708.7h lunar day, permanently shadowed regions' },
            { name: 'missions', icon: '🚀', desc: 'Apollo sites, Artemis, LCROSS, Chandrayaan, Chang\'e' },
            { name: 'observation', icon: '🔭', desc: 'Phases, libration, occultations, eclipses' },
            { name: 'physics', icon: '⚛️', desc: 'Tidal locking, orbital mechanics, secular acceleration' },
            { name: 'rendering', icon: '🎨', desc: 'Albedo (0.12), regolith reflectance, earthshine' },
            { name: 'resources', icon: '⛏️', desc: 'Polar ice (LCROSS), He-3, ilmenite, ISRU potential' },
            { name: 'surface', icon: '🏜️', desc: 'Regolith depth, boulder distribution, thermal inertia' },
            { name: 'temporal', icon: '⏰', desc: 'Lunation count, eclipse cycles (Saros), libration' },
            { name: 'terrain', icon: '🏔️', desc: 'Crater morphology, ray systems, rills, domes' },
        ],
        source: `pub const MOON_MASS: f64 = 7.342e22;
pub const MOON_RADIUS_M: f64 = 1_737_400.0;
pub const EARTH_MOON_DISTANCE_M: f64 = 384_400_000.0;
pub const SIDEREAL_ORBIT_PERIOD_S: f64 = 27.321_661 * 86_400.0;
pub const SYNODIC_MONTH_S: f64 = 29.530_588 * 86_400.0;
pub const SURFACE_GRAVITY_M_S2: f64 = 1.62;
pub const ESCAPE_VELOCITY_M_S: f64 = 2_380.0;
pub const GEOMETRIC_ALBEDO: f64 = 0.12;
pub const POLAR_CRATER_MIN_TEMP_K: f64 = 25.0;
pub const SUBSOLAR_MAX_TEMP_K: f64 = 390.0;

pub mod environment;
pub mod exosphere;
pub mod geodata;
pub mod geology;
pub mod interactions;
pub mod lighting;
pub mod missions;
pub mod observation;
pub mod physics;
pub mod rendering;
pub mod resources;
pub mod surface;
pub mod temporal;
pub mod terrain;`
    },

    phoboss: {
        name: 'phoboss',
        emoji: '🪨',
        category: 'satellite',
        tagline: 'Phobos — Mars\'s doomed moon',
        description: 'Phobos simulation — Stickney crater (9 km), irregular shape (27×22×18 km), tidal orbital decay (inward spiral), Roche limit approach within ~50 Myr, possible D-type captured asteroid, and grooves/lineaments.',
        version: '0.0.1', label: '♂ Mars',
        github: 'https://github.com/celestial4498-prog/Phoboss',
        color: '#e17aff', constants: [],
        modules: [
            { name: 'environment', icon: '🌡️', desc: 'Temperature, radiation, micro-gravity environment' },
            { name: 'exosphere', icon: '💨', desc: 'Negligible — sputtered particles from solar wind' },
            { name: 'geodata', icon: '🗺️', desc: 'Shape model, Stickney crater coordinates' },
            { name: 'geology', icon: '🪨', desc: 'D-type composition, grooves, regolith' },
            { name: 'interactions', icon: '🔗', desc: 'Tidal decay, Roche limit approach, Mars tidal bulge' },
            { name: 'lighting', icon: '🌅', desc: '7.65h orbital period, eclipses from Mars surface' },
            { name: 'missions', icon: '🚀', desc: 'Mars Express, MMX (JAXA)' },
            { name: 'observation', icon: '🔭', desc: 'Transit across Mars, angular size from surface' },
            { name: 'physics', icon: '⚛️', desc: 'Synchronous orbit below, irregular shape dynamics' },
            { name: 'resources', icon: '⛏️', desc: 'Low delta-v from Mars orbit, staging potential' },
            { name: 'surface', icon: '🏜️', desc: 'Fine regolith, low albedo (0.071)' },
            { name: 'temporal', icon: '⏰', desc: 'Orbital period, decay timeline' },
            { name: 'terrain', icon: '🏔️', desc: 'Stickney, grooves, irregular terrain' },
        ],
        source: `pub mod environment;
pub mod exosphere;
pub mod geodata;
pub mod geology;
pub mod interactions;   // tidal decay → Roche limit
pub mod lighting;
pub mod missions;
pub mod observation;
pub mod physics;
pub mod resources;
pub mod surface;
pub mod temporal;
pub mod terrain;`
    },

    deimoss: {
        name: 'deimoss',
        emoji: '🪨',
        category: 'satellite',
        tagline: 'Deimos — Mars\'s outer moon',
        description: 'Deimos simulation — smooth regolith-covered surface, slowly outward-drifting orbit, captured D-type asteroid, and tiny (15×12×11 km) irregular shape.',
        version: '0.0.1', label: '♂ Mars',
        github: 'https://github.com/celestial4498-prog/Deimoss',
        color: '#e17aff', constants: [],
        modules: [
            { name: 'environment', icon: '🌡️', desc: 'Temperature, radiation environment' },
            { name: 'exosphere', icon: '💨', desc: 'Negligible' },
            { name: 'geodata', icon: '🗺️', desc: 'Shape model' },
            { name: 'geology', icon: '🪨', desc: 'D-type, smooth regolith filling craters' },
            { name: 'interactions', icon: '🔗', desc: 'Outward drift, minimal tidal interaction' },
            { name: 'lighting', icon: '🌅', desc: '30.3h orbital period' },
            { name: 'missions', icon: '🚀', desc: 'Viking, MRO' },
            { name: 'observation', icon: '🔭', desc: 'Barely visible from Mars surface' },
            { name: 'physics', icon: '⚛️', desc: 'Nearly circular orbit, small mass' },
            { name: 'resources', icon: '⛏️', desc: 'Staging point for Mars missions' },
            { name: 'surface', icon: '🏜️', desc: 'Very smooth, filled craters' },
            { name: 'temporal', icon: '⏰', desc: 'Orbital period' },
            { name: 'terrain', icon: '🏔️', desc: 'Smooth irregular terrain' },
        ],
        source: `pub mod environment;\npub mod exosphere;\npub mod geodata;\npub mod geology;\npub mod interactions;\npub mod lighting;\npub mod missions;\npub mod observation;\npub mod physics;\npub mod resources;\npub mod surface;\npub mod temporal;\npub mod terrain;`
    },

    ioss: {
        name: 'ioss',
        emoji: '🌋',
        category: 'satellite',
        tagline: 'Io — the volcanic moon',
        description: 'Io simulation — most volcanically active body in the solar system. 400+ active volcanoes, intense tidal heating from Jupiter (Europa-Ganymede Laplace resonance), SO₂ frost plains, Pele-class eruption plumes (500 km), lava lakes (Loki Patera), and extreme radiation environment.',
        version: '0.0.1', label: '♃ Jupiter',
        github: 'https://github.com/celestial4498-prog/Ios',
        color: '#e17aff', constants: [],
        modules: [
            { name: 'environment', icon: '🌡️', desc: 'Intense radiation (3600 rem/day), extreme volcanism' },
            { name: 'exosphere', icon: '💨', desc: 'SO₂ atmosphere, volcanic plume dynamics' },
            { name: 'geodata', icon: '🗺️', desc: 'Volcanic provinces, lava flow mapping' },
            { name: 'geology', icon: '🪨', desc: '400+ volcanoes, Pele, Loki Patera, sulfur chemistry' },
            { name: 'interactions', icon: '🔗', desc: 'Laplace resonance, Jupiter tidal heating, plasma torus' },
            { name: 'lighting', icon: '🌅', desc: '42.5h orbital period, Jupiter eclipses' },
            { name: 'missions', icon: '🚀', desc: 'Voyager, Galileo, Juno, JUICE' },
            { name: 'observation', icon: '🔭', desc: 'Volcanic hot spots in infrared' },
            { name: 'physics', icon: '⚛️', desc: 'Tidal dissipation, orbital resonance mechanics' },
            { name: 'resources', icon: '⛏️', desc: 'Sulfur compounds' },
            { name: 'surface', icon: '🏜️', desc: 'SO₂ frost, silicate lavas, sulfur flows' },
            { name: 'temporal', icon: '⏰', desc: 'Orbital period, eclipse timing' },
            { name: 'terrain', icon: '🏔️', desc: 'Volcanic calderas, plateaus, lava channels' },
        ],
        source: `pub mod environment;\npub mod exosphere;    // SO₂ atmosphere\npub mod geodata;\npub mod geology;      // 400+ volcanoes\npub mod interactions;  // Laplace resonance\npub mod lighting;\npub mod missions;\npub mod observation;\npub mod physics;      // tidal heating\npub mod resources;\npub mod surface;      // SO₂ frost, lava\npub mod temporal;\npub mod terrain;`
    },

    europas: {
        name: 'europas',
        emoji: '🧊',
        category: 'satellite',
        tagline: 'Europa — ocean world',
        description: 'Europa simulation — global subsurface ocean (100 km deep) beneath 15 km ice shell, tectonic lineae & ridges, possible hydrothermal vents, cryovolcanic plumes detected by Hubble/JWST, Laplace resonance tidal heating, and prime astrobiology target.',
        version: '0.0.1', label: '♃ Jupiter',
        github: 'https://github.com/celestial4498-prog/Europas',
        color: '#e17aff',
        constants: [
            { name: 'EUROPA_MASS', value: '4.7998×10²² kg', desc: 'Mass' },
            { name: 'EUROPA_RADIUS', value: '1,560,800 m', desc: 'Mean radius' },
            { name: 'SURFACE_GRAVITY', value: '1.314 m/s²', desc: 'Surface gravity' },
            { name: 'SURFACE_TEMP', value: '50–125 K', desc: 'Temperature range' },
            { name: 'GEOMETRIC_ALBEDO', value: '0.67', desc: 'Very reflective ice' },
        ],
        modules: [
            { name: 'environment', icon: '🌡️', desc: '50–125K surface, intense radiation, ice shell' },
            { name: 'exosphere', icon: '💨', desc: 'O₂ exosphere from radiolysis, vapor plumes' },
            { name: 'geodata', icon: '🗺️', desc: 'Lineae mapping, chaos terrain coordinates' },
            { name: 'geology', icon: '🪨', desc: 'Ice shell tectonics, ridges, chaos terrain' },
            { name: 'interactions', icon: '🔗', desc: 'Laplace resonance, Jupiter tidal flexing' },
            { name: 'lighting', icon: '🌅', desc: '85.2h orbital period, Jupiter shine' },
            { name: 'missions', icon: '🚀', desc: 'Europa Clipper, JUICE' },
            { name: 'observation', icon: '🔭', desc: 'Hubble plume detections, Clipper planning' },
            { name: 'physics', icon: '⚛️', desc: 'Ice shell dynamics, tidal dissipation, ocean currents' },
            { name: 'resources', icon: '⛏️', desc: 'Liquid water, hydrothermal energy' },
            { name: 'surface', icon: '🏜️', desc: 'Young ice surface (~60 Myr), high albedo' },
            { name: 'temporal', icon: '⏰', desc: 'Orbital period, eclipse timing' },
            { name: 'terrain', icon: '🏔️', desc: 'Double ridges, chaos blocks, smooth plains' },
        ],
        source: `pub const EUROPA_MASS: f64 = 4.7998e22;
pub const EUROPA_RADIUS_M: f64 = 1_560_800.0;
pub const JUPITER_EUROPA_DISTANCE_M: f64 = 671_100_000.0;
pub const SIDEREAL_ORBIT_PERIOD_S: f64 = 3.551 * 86_400.0;
pub const SURFACE_GRAVITY_M_S2: f64 = 1.314;
pub const GEOMETRIC_ALBEDO: f64 = 0.67;
pub const MIN_SURFACE_TEMP_K: f64 = 50.0;
pub const MAX_SURFACE_TEMP_K: f64 = 125.0;
pub const COSMIC_RAY_DOSE_MSV_DAY: f64 = 5.4;

pub mod environment;
pub mod exosphere;
pub mod geodata;
pub mod geology;
pub mod interactions;
pub mod lighting;
pub mod missions;
pub mod observation;
pub mod physics;
pub mod rendering;
pub mod resources;
pub mod surface;
pub mod temporal;
pub mod terrain;`
    },

    ganymedes: {
        name: 'ganymedes', emoji: '🔵', category: 'satellite',
        tagline: 'Ganymede — the giant moon',
        description: 'Ganymede simulation — largest moon in the solar system (5,268 km diameter, larger than Mercury), only moon with an intrinsic magnetic field, differentiated interior with iron core, subsurface ocean between ice layers, and ancient grooved terrain.',
        version: '0.0.1', label: '♃ Jupiter',
        github: 'https://github.com/celestial4498-prog/Ganymedes',
        color: '#e17aff', constants: [],
        modules: [
            { name: 'environment', icon: '🌡️', desc: 'Surface conditions, aurora from intrinsic magnetosphere' },
            { name: 'exosphere', icon: '💨', desc: 'Thin O₂ exosphere' },
            { name: 'geodata', icon: '🗺️', desc: 'Dark/light terrain regions, Galileo Regio' },
            { name: 'geology', icon: '🪨', desc: 'Grooved terrain, dark ancient surface, tectonics' },
            { name: 'interactions', icon: '🔗', desc: 'Laplace resonance, Jupiter magnetosphere interaction' },
            { name: 'physics', icon: '⚛️', desc: 'Intrinsic magnetic field, differentiated interior' },
            { name: 'missions', icon: '🚀', desc: 'Galileo, JUICE (ESA, arriving 2031)' },
            { name: 'surface', icon: '🏜️', desc: 'Ice-silicate mix, ancient heavily cratered dark terrain' },
            { name: 'terrain', icon: '🏔️', desc: 'Grooved terrain bands, sulci, palimpsests' },
        ],
        source: `pub mod environment;\npub mod exosphere;\npub mod geodata;\npub mod geology;       // grooved terrain\npub mod interactions;   // Laplace resonance\npub mod lighting;\npub mod missions;       // JUICE\npub mod observation;\npub mod physics;       // intrinsic magnetic field\npub mod rendering;\npub mod resources;\npub mod surface;\npub mod temporal;\npub mod terrain;`
    },

    callistos: {
        name: 'callistos', emoji: '⚫', category: 'satellite',
        tagline: 'Callisto — the ancient surface',
        description: 'Callisto simulation — most heavily cratered body in the solar system, ancient undifferentiated surface (~4 Gyr), possible subsurface ocean (indicated by induced magnetic field), low radiation environment (suitable for human bases), and Valhalla multi-ring impact basin.',
        version: '0.0.1', label: '♃ Jupiter',
        github: 'https://github.com/celestial4498-prog/Callistos',
        color: '#e17aff', constants: [],
        modules: [
            { name: 'environment', icon: '🌡️', desc: 'Low radiation — outside Jupiter\'s main belts' },
            { name: 'geology', icon: '🪨', desc: 'Undifferentiated, saturated cratering, Valhalla basin' },
            { name: 'interactions', icon: '🔗', desc: 'Not in Laplace resonance, induced magnetic field' },
            { name: 'physics', icon: '⚛️', desc: 'Possible subsurface ocean from induction signatures' },
            { name: 'surface', icon: '🏜️', desc: 'Dark ice-rock mix, oldest in Jovian system' },
            { name: 'terrain', icon: '🏔️', desc: 'Multi-ring basins, palimpsests, knob terrain' },
        ],
        source: `pub mod environment;\npub mod exosphere;\npub mod geodata;\npub mod geology;       // Valhalla basin\npub mod interactions;   // induced magnetosphere\npub mod lighting;\npub mod missions;\npub mod observation;\npub mod physics;\npub mod rendering;\npub mod resources;\npub mod surface;\npub mod temporal;\npub mod terrain;`
    },

    titanss: {
        name: 'titanss', emoji: '🟠', category: 'satellite',
        tagline: 'Titan — the methane world',
        description: 'Titan simulation — only moon with a thick atmosphere (1.5 atm N₂), methane lakes (Kraken Mare, Ligeia Mare), hydrocarbon rain cycle, prebiotic chemistry (tholins), Huygens landing data, dune fields, and possible subsurface water-ammonia ocean.',
        version: '0.0.1', label: '♄ Saturn',
        github: 'https://github.com/celestial4498-prog/Titanss',
        color: '#e17aff', constants: [],
        modules: [
            { name: 'environment', icon: '🌡️', desc: '94K surface, 1.5 atm N₂, hazy orange sky' },
            { name: 'exosphere', icon: '💨', desc: 'Thick N₂/CH₄ atmosphere, photochemical haze' },
            { name: 'geodata', icon: '🗺️', desc: 'Cassini RADAR, Huygens landing site, lake catalog' },
            { name: 'geology', icon: '🪨', desc: 'Cryovolcanism, ice bedrock, organic sediments' },
            { name: 'interactions', icon: '🔗', desc: 'Saturn tidal interaction, orbital resonance' },
            { name: 'physics', icon: '⚛️', desc: 'Methane cycle (analogous to Earth water cycle)' },
            { name: 'missions', icon: '🚀', desc: 'Cassini-Huygens, Dragonfly (2034)' },
            { name: 'surface', icon: '🏜️', desc: 'Dune fields, pebble ice, tholin deposits' },
            { name: 'terrain', icon: '🏔️', desc: 'Lakes, mountains, channels, dunes' },
        ],
        source: `pub mod environment;\npub mod exosphere;    // 1.5 atm N₂\npub mod geodata;      // Cassini RADAR\npub mod geology;      // cryovolcanism\npub mod interactions;\npub mod lighting;\npub mod missions;     // Huygens, Dragonfly\npub mod observation;\npub mod physics;      // methane cycle\npub mod rendering;\npub mod resources;\npub mod surface;      // dune fields\npub mod temporal;\npub mod terrain;`
    },

    enceladuss: {
        name: 'enceladuss', emoji: '💨', category: 'satellite',
        tagline: 'Enceladus — the plume moon',
        description: 'Enceladus simulation — tiger stripe fractures with cryovolcanic plumes ejecting water ice + organics, global subsurface ocean, possible hydrothermal vents on the seafloor, prime astrobiology target, and Saturn E-ring source.',
        version: '0.0.1', label: '♄ Saturn',
        github: 'https://github.com/celestial4498-prog/Enceladuss',
        color: '#e17aff', constants: [],
        modules: [
            { name: 'environment', icon: '🌡️', desc: 'Tiger stripe hot spots, 75K ambient surface' },
            { name: 'exosphere', icon: '💨', desc: 'Water vapor plumes, E-ring particle source' },
            { name: 'geology', icon: '🪨', desc: 'Tiger stripes, young smooth terrain, ancient craters' },
            { name: 'interactions', icon: '🔗', desc: 'Enceladus-Dione resonance, Saturn tidal heating' },
            { name: 'physics', icon: '⚛️', desc: 'Subsurface ocean dynamics, plume mechanics' },
            { name: 'missions', icon: '🚀', desc: 'Cassini flybys, proposed Enceladus Life Finder' },
            { name: 'surface', icon: '🏜️', desc: 'Highest albedo in solar system (0.99), fresh ice' },
        ],
        source: `pub mod environment;\npub mod exosphere;    // water plumes\npub mod geodata;\npub mod geology;      // tiger stripes\npub mod interactions;  // Dione resonance\npub mod lighting;\npub mod missions;     // Cassini\npub mod observation;\npub mod physics;      // subsurface ocean\npub mod rendering;\npub mod resources;\npub mod surface;      // 0.99 albedo\npub mod temporal;\npub mod terrain;`
    },

    titanias: {
        name: 'titanias', emoji: '❄️', category: 'satellite',
        tagline: 'Titania — Uranus\'s largest moon',
        description: 'Titania simulation — rift canyons up to 1500 km long, large impact craters, water ice surface with CO₂ frost, possible thin CO₂ atmosphere, and interior potentially containing subsurface ocean.',
        version: '0.0.1', label: '⛢ Uranus',
        github: 'https://github.com/celestial4498-prog/Titanias',
        color: '#e17aff', constants: [],
        modules: [
            { name: 'environment', icon: '🌡️', desc: '60–89K surface, low radiation' },
            { name: 'geology', icon: '🪨', desc: 'Tectonic rifts, large craters, smooth plains' },
            { name: 'physics', icon: '⚛️', desc: 'Tidally locked, 8.71 day period' },
            { name: 'surface', icon: '🏜️', desc: 'Water ice + CO₂ frost, moderate albedo' },
            { name: 'terrain', icon: '🏔️', desc: 'Messina Chasmata, large impact basins' },
        ],
        source: `pub mod environment;\npub mod exosphere;\npub mod geodata;\npub mod geology;       // tectonic rifts\npub mod interactions;\npub mod lighting;\npub mod missions;\npub mod observation;\npub mod physics;\npub mod rendering;\npub mod resources;\npub mod surface;       // H₂O + CO₂ ice\npub mod temporal;\npub mod terrain;`
    },

    oberons: {
        name: 'oberons', emoji: '🌑', category: 'satellite',
        tagline: 'Oberon — the outermost major Uranian moon',
        description: 'Oberon simulation — outermost of Uranus\'s five major moons, heavily cratered dark surface, mysterious large mountain (6 km), possible cryovolcanic resurfacing, and water ice + dark carbonaceous material composition.',
        version: '0.0.1', label: '⛢ Uranus',
        github: 'https://github.com/celestial4498-prog/Oberons',
        color: '#e17aff', constants: [],
        modules: [
            { name: 'environment', icon: '🌡️', desc: '70–80K surface' },
            { name: 'geology', icon: '🪨', desc: 'Large craters, dark floor deposits, 6km mountain' },
            { name: 'physics', icon: '⚛️', desc: 'Tidally locked, 13.46 day period' },
            { name: 'surface', icon: '🏜️', desc: 'Dark ice-carbon mix, moderate cratering' },
            { name: 'terrain', icon: '🏔️', desc: 'Hamlet crater, large unnamed mountain' },
        ],
        source: `pub mod environment;\npub mod exosphere;\npub mod geodata;\npub mod geology;\npub mod interactions;\npub mod lighting;\npub mod missions;\npub mod observation;\npub mod physics;\npub mod rendering;\npub mod resources;\npub mod surface;\npub mod temporal;\npub mod terrain;`
    },

    tritons: {
        name: 'tritons', emoji: '💠', category: 'satellite',
        tagline: 'Triton — the captured KBO',
        description: 'Triton simulation — retrograde orbit (only large moon), captured Kuiper Belt Object, nitrogen geysers (8 km plumes), cantaloupe terrain, 38K surface (coldest in solar system), thin N₂ atmosphere, and active cryovolcanism.',
        version: '0.0.1', label: '♆ Neptune',
        github: 'https://github.com/celestial4498-prog/Tritons',
        color: '#e17aff', constants: [],
        modules: [
            { name: 'environment', icon: '🌡️', desc: '38K surface — coldest known body' },
            { name: 'exosphere', icon: '💨', desc: 'Thin N₂ atmosphere, 14 µbar surface pressure' },
            { name: 'geology', icon: '🪨', desc: 'Cantaloupe terrain, cryovolcanic features' },
            { name: 'interactions', icon: '🔗', desc: 'Retrograde orbit, Neptune tidal interaction' },
            { name: 'physics', icon: '⚛️', desc: 'Captured KBO, orbital decay, tidal heating' },
            { name: 'surface', icon: '🏜️', desc: 'N₂/CH₄/CO frost, pink-tinted south polar cap' },
            { name: 'terrain', icon: '🏔️', desc: 'Cantaloupe cells, smooth plains, geysers' },
        ],
        source: `pub mod environment;   // 38K — coldest body
pub mod exosphere;    // thin N₂
pub mod geodata;
pub mod geology;      // cantaloupe terrain
pub mod interactions;  // retrograde orbit
pub mod lighting;
pub mod missions;     // Voyager 2
pub mod observation;
pub mod physics;      // captured KBO
pub mod rendering;
pub mod resources;    // N₂ ice, CH₄
pub mod surface;      // pink polar cap
pub mod temporal;
pub mod terrain;`
    },

    // ==================== DWARF PLANETS ====================
    dwarfplanetsfactory: {
        name: 'dwarfplanetsfactory',
        emoji: '🏭',
        category: 'factory',
        tagline: 'Dwarf planet classification & generation engine',
        description: 'Dwarf planet factory — classify, build and catalogue dwarf planets of any type: Kuiper belt, scattered disk, plutino (2:3 resonance), cold classical, detached, binary, Ceres-type, and sednoid. Each with orbital elements, surface composition, atmosphere (if any), and satellite systems.',
        version: '0.0.1',
        label: '🏭 8 types',
        github: 'https://github.com/celestial4498-prog/DwarfPlanetsFactory',
        color: '#fdcb6e',
        constants: [],
        modules: [
            { name: 'config', icon: '⚙️', desc: 'Classification thresholds, orbital distribution parameters' },
            { name: 'engine', icon: '🔧', desc: 'Core generation engine, resonance detection, binary formation' },
            { name: 'observables', icon: '👁️', desc: 'Occultation profiles, light curves, spectral properties' },
            { name: 'physics', icon: '⚛️', desc: 'Hydrostatic equilibrium check, tidal evolution, resonance locking' },
            { name: 'types', icon: '🪐', desc: 'Plutino, KuiperBelt, ScatteredDisk, CeresType, Sednoid, ColdClassical, Detached, Binary' },
            { name: 'utils', icon: '🔨', desc: 'Helper functions, unit conversions' },
        ],
        source: `pub mod config;\npub mod engine;\npub mod observables;\npub mod physics;\npub mod types;\npub mod utils;`
    },

    // ==================== ASTEROIDS ====================
    asteroidsfactory: {
        name: 'asteroidsfactory',
        emoji: '🏭',
        category: 'factory',
        tagline: 'Asteroid classification & generation engine',
        description: 'Asteroid factory — classify, build and catalogue asteroids of any type: near-Earth (Amor, Apollo, Aten, Atira), main belt, trojan, centaur, binary, rubble pile, metallic, and potentially hazardous. Spectral classification (C/S/M/V/D), YORP/Yarkovsky effects, and collision probability.',
        version: '0.0.1',
        label: '🏭 10+ types',
        github: 'https://github.com/celestial4498-prog/AsteroidsFactory',
        color: '#fdcb6e',
        constants: [],
        modules: [
            { name: 'config', icon: '⚙️', desc: 'Size-frequency distributions, spectral type ratios, orbital families' },
            { name: 'engine', icon: '🔧', desc: 'Core generation engine, family assignment, binary formation' },
            { name: 'observables', icon: '👁️', desc: 'Light curves, phase functions, radar cross-sections, thermal emission' },
            { name: 'physics', icon: '⚛️', desc: 'Yarkovsky drift, YORP spin-up, rubble pile cohesion, collision cascades' },
            { name: 'types', icon: '☄️', desc: 'MainBelt, NearEarth (Amor/Apollo/Aten/Atira), Trojan, Centaur, Binary, Metallic' },
            { name: 'utils', icon: '🔨', desc: 'Helper functions, spectral type lookup' },
        ],
        source: `pub mod config;\npub mod engine;\npub mod observables;\npub mod physics;\npub mod types;\npub mod utils;`
    },

    // ==================== COMETS ====================
    cometsfactory: {
        name: 'cometsfactory',
        emoji: '🏭',
        category: 'factory',
        tagline: 'Comet classification & generation engine',
        description: 'Comet factory — classify, build and catalogue comets of any type: short-period (Jupiter family), Halley-type, long-period (Oort cloud), sungrazer (Kreutz group), interstellar, main-belt comet, centaur-transition, and extinct. Coma dynamics, dust/gas production rates, and tail modeling.',
        version: '0.0.1',
        label: '🏭 8 types',
        github: 'https://github.com/celestial4498-prog/CometsFactory',
        color: '#fdcb6e',
        constants: [],
        modules: [
            { name: 'config', icon: '⚙️', desc: 'Nucleus size distributions, activity onset distance, volatile fractions' },
            { name: 'engine', icon: '🔧', desc: 'Core generation engine, orbit classification, activity modeling' },
            { name: 'observables', icon: '👁️', desc: 'Coma brightness, dust tail geometry, ion tail direction, light curves' },
            { name: 'physics', icon: '⚛️', desc: 'Sublimation rates, non-gravitational forces, nucleus splitting' },
            { name: 'types', icon: '☄️', desc: 'ShortPeriod, HalleyType, LongPeriod, Sungrazer, Interstellar, MainBeltComet, Extinct' },
            { name: 'utils', icon: '🔨', desc: 'Helper functions, ephemeris utilities' },
        ],
        source: `pub mod config;\npub mod engine;\npub mod observables;\npub mod physics;\npub mod types;\npub mod utils;`
    },

    // ==================== SYSTEMS ====================
    solarsystemsfactory: {
        name: 'solarsystemsfactory',
        emoji: '🏭',
        category: 'factory',
        published: false,
        tagline: 'Universal star-system factory',
        description: 'Universal star-system factory — build, simulate and analyse any planetary system: Solar System, TRAPPIST-1, Kepler-90, Proxima Centauri, or entirely custom configurations. Couples planetsfactory + satellitesfactory into a complete N-body system with stability analysis and habitable zone computation.',
        version: '0.0.1',
        label: '🏭 System builder',
        github: 'https://github.com/celestial4498-prog/SolarSystemsFactory',
        color: '#fdcb6e',
        constants: [],
        modules: [
            { name: 'config', icon: '⚙️', desc: 'System templates, multi-star support, zone definitions' },
            { name: 'dynamics', icon: '🧮', desc: 'N-body integration, stability analysis, resonance chains' },
            { name: 'gravity', icon: '🌀', desc: 'Gravitational coupling, tidal forces, secular perturbations' },
            { name: 'orbits', icon: '🛸', desc: 'Orbital element generation, spacing rules, Hill stability' },
            { name: 'orchestrator', icon: '🎯', desc: 'System assembly pipeline, body placement, validation' },
            { name: 'stars', icon: '⭐', desc: 'Host star configuration, binary/trinary support' },
        ],
        source: `pub mod config;\npub mod dynamics;\npub mod gravity;\npub mod orbits;\npub mod orchestrator;\npub mod stars;\n\npub use planetsfactory;\npub use satellitesfactory;`
    },

    solarsystems: {
        name: 'solarsystems', emoji: '🌌', category: 'system',
        published: false,
        tagline: 'Real-time solar system tracker',
        description: 'The orchestration crate — aggregates all celestial body crates into a full N-body gravitational simulation with 36 real bodies. Symplectic integrators (Leapfrog KDK, Velocity Verlet, Yoshida 4th-order), real-time tracking from J2000 to present, Keplerian orbital elements ↔ state vectors, Hohmann & bi-elliptic transfer computation, gravity assist trajectories, Lambert problem solver, relativistic GR corrections, J2 oblateness perturbations, Kozai-Lidov oscillations, event detection engine (conjunctions, oppositions, eclipses, periapsis/apoapsis, close approaches), Lyapunov exponent & MEGNO stability indicators, and multi-dimensional state export (3D → 8D vectors).',
        version: '0.0.1', label: '36 bodies — real-time',
        github: 'https://github.com/celestial4498-prog/SolarSystems',
        color: '#55efc4',
        constants: [],
        modules: [
            { name: 'config/', icon: '⚙️', desc: 'System configuration — default_bodies() with 36 bodies (NASA/JPL data), orbital parameters, mass catalog' },
            { name: 'dynamics/integrator', icon: '🧮', desc: 'Leapfrog KDK, Velocity Verlet, Yoshida 4th-order symplectic integrators' },
            { name: 'dynamics/events', icon: '📡', desc: 'Periapsis, apoapsis, close approach, conjunction, eclipse detection' },
            { name: 'dynamics/stability', icon: '📊', desc: 'Lyapunov exponents, MEGNO, Hill sphere, Mardling-Aarseth, resonance' },
            { name: 'dynamics/time', icon: '⏱️', desc: 'Ephemeris time, Julian date ↔ calendar, epoch management' },
            { name: 'gravity/nbody', icon: '🌀', desc: 'Direct N-body gravitational force computation, O(N²)' },
            { name: 'gravity/interactions', icon: '⚡', desc: 'J2 perturbation, GR corrections, tidal forces, drag' },
            { name: 'orbits/keplerian', icon: '🛸', desc: 'Elements ↔ state vectors, mean/true/eccentric anomaly, propagation' },
            { name: 'orbits/transfers', icon: '🚀', desc: 'Hohmann, bi-elliptic, gravity assist, Lambert TOF, vis-viva' },
            { name: 'orbits/perturbations', icon: '🔧', desc: 'Kozai-Lidov, secular perturbation, precession' },
            { name: 'exports/', icon: '📤', desc: '3D/5D/6D/7D/8D state vector export for external renderers' },
            { name: 'orchestrator/', icon: '🎯', desc: 'Pipeline scheduler, real-time tracking loop, event engine' },
            { name: 'planets/', icon: '🪐', desc: 'Re-exports: all 8 planet crates' },
            { name: 'asteroids/', icon: '☄️', desc: 'Ceres, Vesta, Pallas, Hygiea, Juno — via asteroidsfactory' },
            { name: 'comets/', icon: '💫', desc: 'Halley, Encke, Hale-Bopp, 67P, Tempel 1 — via cometsfactory' },
            { name: 'dwarfplanets/', icon: '🔮', desc: 'Pluto, Eris, Haumea, Makemake, Sedna — via dwarfplanetsfactory' },
            { name: 'suns/', icon: '☀️', desc: 'Re-exports: suns crate' },
            { name: 'satelites/', icon: '🌙', desc: 'Re-exports: all 12 satellite crates' },
        ],
        source: `pub mod asteroids;     // 5 asteroids via asteroidsfactory
pub mod comets;        // 5 comets via cometsfactory
pub mod config;
pub mod dwarfplanets;  // 5 dwarf planets via dwarfplanetsfactory
pub mod dynamics;      // integrator, events, stability, time
pub mod exports;       // 3D → 8D state vectors
pub mod gravity;       // nbody, interactions (J2, GR)
pub mod orbits;        // keplerian, transfers, perturbations
pub mod orchestrator;  // pipeline & scheduler
pub mod planets;       // all 8 planets
pub mod satelites;     // 12 moons
pub mod suns;          // solar data`
    },

    milkyway: {
        name: 'milkyway', emoji: '🌀', category: 'galaxy',
        published: false,
        tagline: 'Galactic-scale simulation engine',
        description: 'The galaxy-level orchestrator — spiral arm dynamics, stellar population synthesis across disk/bulge/halo, galactic rotation curve fitting (dark matter halo models), interstellar medium phases (HII regions, molecular clouds, hot coronal gas), supernova remnant evolution, and multi-scale gravitational coupling from planetary to galactic scales.',
        version: '0.0.1', label: '🔧 In development',
        github: 'https://github.com/celestial4498-prog/MilkyWay',
        color: '#55efc4',
        constants: [],
        modules: [
            { name: 'galaxy', icon: '🌀', desc: 'Spiral structure, bar, arms, rotation curve' },
            { name: 'populations', icon: '⭐', desc: 'Stellar populations I/II/III, IMF, metallicity distribution' },
            { name: 'ism', icon: '☁️', desc: 'Interstellar medium — HII, molecular clouds, hot gas' },
            { name: 'dynamics', icon: '🧮', desc: 'Galactic dynamics, N-body at kpc scale, tidal streams' },
            { name: 'dark_matter', icon: '🔮', desc: 'NFW/Einasto halo profiles, rotation curve fitting' },
            { name: 'center', icon: '🕳️', desc: 'Galactic center, integrates sagittariusas crate' },
        ],
        source: `// MilkyWay — galactic-scale engine
// Integrates all stellar, black hole, and planetary crates
// into a galaxy-level simulation

pub mod galaxy;       // spiral structure, rotation curve
pub mod populations;  // stellar pop I/II/III
pub mod ism;          // interstellar medium
pub mod dynamics;     // galactic N-body
pub mod dark_matter;  // halo profiles
pub mod center;       // Sgr A* integration`
    },
};

// Ordered list for prev/next navigation
const CRATES_ORDER = [
    'suns', 'starsfactory',
    'blackholesfactory', 'sagittariusas',
    'planetsfactory', 'mercurys', 'venuss', 'earths', 'marss', 'jupiters', 'saturns', 'uranuss', 'neptunes',
    'satellitesfactory', 'moons', 'phoboss', 'deimoss', 'ioss', 'europas', 'ganymedes', 'callistos',
    'titanss', 'enceladuss', 'titanias', 'oberons', 'tritons',
    'dwarfplanetsfactory',
    'asteroidsfactory',
    'cometsfactory',
    'solarsystemsfactory', 'solarsystems',
    'milkyway',
];

// Category display config
const CATEGORY_META = {
    star:      { label: 'Star',         color: '#ffd866', bg: 'rgba(255,216,102,0.1)' },
    factory:   { label: 'Factory',      color: '#fdcb6e', bg: 'rgba(253,203,110,0.1)' },
    blackhole: { label: 'Black Hole',   color: '#fd4556', bg: 'rgba(253,69,86,0.1)' },
    planet:    { label: 'Planet',       color: '#00cec9', bg: 'rgba(0,206,201,0.1)' },
    satellite: { label: 'Satellite',    color: '#e17aff', bg: 'rgba(225,122,255,0.1)' },
    dwarf:     { label: 'Dwarf Planet', color: '#a29bfe', bg: 'rgba(162,155,254,0.1)' },
    asteroid:  { label: 'Asteroid',     color: '#ffb142', bg: 'rgba(255,177,66,0.1)' },
    comet:     { label: 'Comet',        color: '#74b9ff', bg: 'rgba(116,185,255,0.1)' },
    system:    { label: 'System',       color: '#55efc4', bg: 'rgba(85,239,196,0.1)' },
    galaxy:    { label: 'Galaxy',       color: '#a29bfe', bg: 'rgba(162,155,254,0.1)' },
};

// Expose on window for detail-panel.js
window.CRATES_DATA = CRATES_DATA;
window.CRATES_ORDER = CRATES_ORDER;
window.CATEGORY_META = CATEGORY_META;
