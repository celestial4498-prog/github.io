<p align="center">
  <img src="celestial.png" alt="Celestial" width="280" />
</p>

<h1 align="center">Celestial</h1>

<p align="center">
  <em>Build universes. Not just one — as many as you need.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/language-Rust-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/crates-27-blueviolet?style=flat-square" />
  <img src="https://img.shields.io/badge/edition-2024-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" />
</p>

---

## What is Celestial?

Celestial is a **modular universe engine** written in Rust.

**27 independent crates** — stars, black holes, planets, moons, solar systems, galaxies — each one a self-contained building block. You pick the pieces you need, you assemble them, and you get a universe. Your universe. At whatever scale you want.

Everything is grounded in real scientific constants from [sciforge](https://crates.io/crates/sciforge) and verified astrophysical sources. The science makes the output believable. What you do with it is up to you.

---

## What it's for

### 🎮 Games

Procedural generation that doesn't feel random. A planet with rings has Roche limit physics. A moon orbiting a gas giant experiences tidal heating. A star system has stable orbits — not dots placed on a skybox.

27 composable Rust crates. Drop them into your game engine, your ECS, your server — wherever you need them.

### 🎬 Audiovisual & VFX

Every crate ships with a `rendering` module — PBR materials, atmosphere parameters, surface textures, lighting models. A black hole that warps light correctly. A planet with a real atmosphere model. A solar system that moves.

Designed to plug into real rendering pipelines.

### 🤖 AI & Data Endpoints

Every body exposes its full state as structured, typed data — orbital elements, surface conditions, atmospheric composition, thermal environment. Feed parameters, get back coherent star systems. Generate millions of unique, physically consistent worlds for training sets.

### 🖥️ Real-time Engines

Rust performance. Zero-copy where possible. Symplectic integrators that conserve energy over millions of timesteps. WASM target for browser. Native plugins for Unreal, Bevy, Godot — any engine that speaks C/Rust FFI.

---

## What's inside

### ☀️ Stars
| Crate | What it is |
|-------|-----------|
| **suns** | The Sun — full stellar model, layers, activity cycles, solar wind |
| **starsfactory** | Procedural star generator — any spectral type, any size, on-demand |

### 🕳️ Black Holes
| Crate | What it is |
|-------|-----------|
| **blackholesfactory** | Black hole engine — accretion, jets, shadows, lensing, evaporation |
| **sagittariusas** | Sagittarius A* — the Milky Way's central supermassive black hole |

### 🪐 Planets

8 planets, each with up to 11 modules — atmosphere, geology, terrain, physics, rendering, and more.

| Crate | Body |
|-------|------|
| **mercurys** | Mercury |
| **venuss** | Venus |
| **earths** | Earth — the reference planet |
| **marss** | Mars |
| **jupiters** | Jupiter |
| **saturns** | Saturn |
| **uranuss** | Uranus |
| **neptunes** | Neptune |

### 🌙 Moons

12 moons across 4 planetary systems, each with 13-14 modules.

| Crate | Parent |
|-------|--------|
| **moons** | 🌍 Earth |
| **phoboss** / **deimoss** | ♂ Mars |
| **ioss** / **europas** / **ganymedes** / **callistos** | ♃ Jupiter |
| **titanss** / **enceladuss** | ♄ Saturn |
| **titanias** / **oberons** | ⛢ Uranus |
| **tritons** | ♆ Neptune |

### 🌌 Systems
| Crate | What it is |
|-------|-----------|
| **solarsystems** | N-body engine — 21 bodies, symplectic integrators, orbital mechanics, event detection |
| **milkyway** | Galaxy-scale — spiral dynamics, stellar populations, dark matter halos |

---

## Where it goes

The end goal is **universe generation at scale**.

- Call an API, get back a complete star system — star, planets, moons, orbital dynamics, all consistent
- Feed parameters — "red dwarf, 2 rocky planets, 1 gas giant with rings" — get back a full universe
- Run it in real-time in your game, or batch-generate 10,000 unique systems for your dataset
- Export to WASM for the browser, compile as a native plugin for any engine, serve it behind an API

Every crate that exists today is a building block for that.

---

## Architecture

```
celestialsbodies/
├── stars/
│   ├── Suns/               — The Sun
│   └── StarsFactory/       — Procedural star generator
├── blackholes/
│   ├── BlackHolesFactory/  — Black hole engine
│   └── SagittariusA*s/     — Milky Way SMBH
├── planets/
│   ├── Mercurys/  Venuss/  Earths/  Marss/
│   └── Jupiters/  Saturns/  Uranuss/  Neptunes/
├── satellites/
│   ├── Moons/  Phoboss/  Deimoss/
│   ├── Ioss/  Europas/  Ganymedes/  Callistos/
│   ├── Titanss/  Enceladuss/
│   └── Titanias/  Oberons/  Tritons/
└── Systems/
    └── SolarSystems/       — N-body orchestrator
```

Every crate follows the same modular structure:

```
src/
├── lib.rs          — constants + module declarations
├── main.rs         — simulation binary
├── atmosphere/     — gas model, layers, weather
├── geology/        — internal structure, tectonics
├── physics/        — orbital & rotational mechanics
├── terrain/        — heightmaps, biomes, texturing
├── rendering/      — PBR materials, visual data
├── temporal/       — calendars, time systems
└── ...             — 5-8 more domain modules
```

---

## Roadmap

- **Universe generator API** — assemble complete star systems from parameters
- **WASM builds** — run in the browser
- **Rendering pipeline** — wgpu/Bevy integration with existing PBR materials
- **AI endpoints** — structured data export for ML pipelines
- **Native engine plugins** — C FFI / Unreal / Bevy / Godot bindings
- **MilkyWay** — galactic-scale dynamics
- **Exoplanet templates** — procedural non-solar bodies via factory crates
- **Data export** — HDF5, Arrow, FITS

---

## About the science

Every value traces back to a real constant — IAU standards, NASA data, published astrophysical parameters. The foundation crate [sciforge](https://crates.io/crates/sciforge) provides the physical constants and mathematical framework.

**Celestial is not a scientific research tool.** It's an engine. The science is there to make the output believable and coherent — not to produce papers. If you want the raw science, sciforge is the right place. Celestial takes those numbers and turns them into worlds.

---

## Contributing

Built solo so far. Open to contributions, but particular about quality.

- Open a discussion or issue first
- Show you understand the structure
- No surprise PRs — let's talk before you write code

---

## License

MIT — use it, build on it, ship it.

---

<p align="center">
  <em>Built by <a href="https://github.com/celestial4498-prog">Rayan Morel</a></em>
</p>
