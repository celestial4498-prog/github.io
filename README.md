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

It's a collection of **27 independent crates** — each one represents a real celestial body or system. Stars, black holes, planets, moons, solar systems, galaxies. Every single one of them is a self-contained, reusable building block.

The idea is simple: you pick the pieces you need, you assemble them, and you get a universe. Your universe. With whatever rules you want, at whatever scale you want.

Everything under the hood is grounded in real scientific constants and real physics — but that's the foundation, not the point. The point is **what you build on top of it**.

> All scientific constants come from [sciforge](https://crates.io/crates/sciforge) and verified astrophysical sources. If you're interested in the pure science side, sciforge already handles that. Celestial is about turning those numbers into worlds.

---

## Why?

Because there's no good way to generate coherent, physically-grounded universes today — not for games, not for film, not for AI, not for anything.

Celestial exists to change that.

### 🎮 Games

Procedural generation that doesn't feel random. A planet with rings should have Roche limit physics. A moon orbiting a gas giant should experience tidal heating. A star system should have stable orbits, not just dots placed on a skybox.

Celestial gives you all of that as composable Rust crates. Drop them into your game engine, your ECS, your server — wherever you need them.

### 🎬 Audiovisual & VFX

Need a scientifically coherent solar system for a film? A black hole that actually warps light correctly? A planet with a real atmosphere model that renders properly?

Each crate already ships with a `rendering` module — PBR materials, atmosphere parameters, surface textures, lighting models. These are designed to plug into real rendering pipelines.

### 🤖 AI Endpoints

Train your models on coherent planetary data. Generate millions of unique but physically consistent star systems. Provide structured, typed Rust data that serializes cleanly for ML pipelines.

Every single body exposes its full state as structured data — orbital elements, surface conditions, atmospheric composition, thermal environment. Everything is computable, everything is queryable.

### 🎮 Unreal-like Real-time Engines

Celestial is built for performance. Rust, zero-copy where possible, symplectic integrators that conserve energy over millions of timesteps. The N-body engine in `solarsystems` runs 21 bodies with sub-second performance.

The long-term goal: compile to WASM, run in the browser, or link directly as a native plugin for Unreal, Bevy, or any engine that speaks C/Rust FFI.

---

## What's Inside

### ☀️ Stars
| Crate | What it is |
|-------|-----------|
| **suns** | The Sun — full stellar model, layers, activity cycles, wind |
| **starsfactory** | Procedural star generator — any spectral type, any size, on-demand |

### 🕳️ Black Holes
| Crate | What it is |
|-------|-----------|
| **blackholesfactory** | Black hole engine — accretion, jets, shadows, lensing, evaporation |
| **sagittariusas** | Sagittarius A* — the Milky Way's central supermassive black hole |

### 🪐 Planets
8 planets, each with 11 modules: atmosphere, geology, terrain, physics, rendering, and more.

| Crate | Body |
|-------|------|
| **mercurys** | Mercury |
| **venuss** | Venus |
| **earths** | Earth — the reference planet |
| **marss** | Mars |
| **jupiters** | Jupiter |
| **saturns** | Saturn — 307 tests, 10 modules |
| **uranuss** | Uranus |
| **neptunes** | Neptune |

### 🌙 Satellites
12 moons, each with 13-14 modules. Every one simulates its parent planet interaction.

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
| **solarsystems** | N-body orchestrator — 21 bodies, symplectic integrators, orbital mechanics, event detection |
| **milkyway** | Galaxy-scale simulation — spiral dynamics, stellar populations, dark matter halos. *In development.* |

---

## The Bigger Picture

Right now, each crate models a single body. But the end goal is **universe generation**.

Imagine this:
- You call an API and get back a complete, unique star system — with a star, 3-8 planets, moons, orbital dynamics, all consistent
- You feed parameters ("red dwarf, 2 rocky planets, 1 gas giant with rings") and get back a full simulation
- You run it in real-time in your game, or as a batch job for your dataset, or as a microservice behind an API
- You create 10,000 of them, each different, each coherent, each explorable

That's where this is going. Every crate that exists today is a building block for that future.

---

## Architecture

```
celestialsbodies/
├── stars/
│   ├── Suns/           — The Sun
│   └── StarsFactory/   — Star generator
├── blackholes/
│   ├── BlackHolesFactory/  — BH engine
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
    └── SolarSystems/   — N-body orchestrator
```

Every crate has the same structure:
```
src/
├── lib.rs          — constants + module declarations
├── main.rs         — simulation binary
├── atmosphere/     — gas model
├── geology/        — internal structure
├── physics/        — orbital & rotational mechanics
├── terrain/        — heightmaps, biomes, texturing
├── rendering/      — PBR materials, visual data
├── temporal/       — calendars, time management
└── ...             — 5-8 more domain modules
```

---

## Quick Start

```toml
[dependencies]
earths = "*"
suns = "*"
solarsystems = "*"
```

```rust
use earths::*;
use earths::physics::orbit::EarthOrbit;

fn main() {
    let orbit = EarthOrbit::new();
    println!("Semi-major axis: {:.3e} m", orbit.semi_major_axis_m);
}
```

Or run a full simulation:
```bash
cd planets/Earths && cargo run --release
```

Every crate has a binary that runs the complete simulation for that body — not a demo, a real multi-step physics pipeline validated against known data.

---

## What's Coming

- **Universe generator API** — assemble complete star systems from parameters
- **WASM builds** — run simulations in the browser
- **Rendering pipeline** — each crate already has PBR materials, next step is wgpu/Bevy integration
- **MilkyWay completion** — galactic-scale dynamics
- **Exoplanet templates** — generate non-solar bodies with the factory crates
- **Native engine plugins** — C FFI / Unreal / Bevy / Godot bindings
- **Data export** — HDF5, Arrow, FITS for researchers and ML pipelines
- **SolarSystems publication** — finishing the last 5 planet integrations

---

## About the Science

Every value in this project traces back to a real constant — IAU standards, NASA data, published astrophysical parameters. The foundation crate [sciforge](https://crates.io/crates/sciforge) provides the physical constants and mathematical framework.

But let's be clear: **Celestial is not a scientific research tool**. It's an engine. The science is there to make the output *believable* and *coherent*, not to produce publishable papers. If you need the raw science, sciforge is the right place. Celestial takes those numbers and turns them into usable, composable, renderable worlds.

---

## Contributing

I've built this alone so far. I'm open to contributions, but I'm particular about quality.

If you want to contribute:
- Open a discussion or issue first
- Show you understand the structure
- Don't send surprise PRs — let's talk before you write code

---

## License

MIT — use it, build on it, ship it.

---

<p align="center">
  <em>Built by <a href="https://github.com/celestial4498-prog">Rayan Morel</a></em>
</p>
