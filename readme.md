# Tawaf GPU

An open-source [WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) walk around the Kaaba. You stand on the mataf, move a pilgrim through the circuit, and stop at the Black Stone, the door, Maqam Ibrahim, Hijr Ismail, and the Yemeni Corner.

Use it **to learn** tawaf, Hajj, and Umrah as a spatial lesson — the sites are places you walk to, not a list on a page. Use it **to build**: it is a technical demo of how to put an interactive scene in the browser, with a playable character, guided stops, and short notes at each one. Fork it and grow it into a classroom, a museum piece, or another rite entirely.

This is **not** a fiqh reference. The cards are brief spatial notes. For rulings, follow a teacher you trust.

**Live:** [tawaf-gpu.pages.dev](https://tawaf-gpu.pages.dev)  
**Author:** [Uzair](https://www.linkedin.com/in/spatial-uzair)  
**Repo:** [github.com/ujji77/tawaf-gpu](https://github.com/ujji77/tawaf-gpu)

Built on **[False Earth](https://github.com/momentchan/false-earth)** by [Ming-Jyun Hung](https://mingjyunhung.com/) — React Three Fiber, Three.js WebGPU, and TSL — with the grass field replaced by the Haram plaza.

## Features

- **Data-driven sites** — each hotspot is id, title, subtitle, body, stand position, look-at, and trigger radius
- **Guided run** — **N** / **P** / click lerp the pilgrim to a stop, then turn him to face the site
- **Proximity cards** — walk into a radius (with hysteresis so the card does not flicker) and the note opens
- **Play area** — circular collision around the Kaaba, circular outer bound at the tiled edge
- **Camera** — Follow / FPV / Detached / BirdsEye; **V** view-lock eases the follow camera back behind the character after a WASD orbit
- **Day / night** — Preetham atmosphere with clouds, or a starfield; the sun drives the directional light
- **TSL post** — bloom, depth of field, tone mapping; screenshots flush after the post pass
- **Adaptive DPR** — `PerformanceMonitor` scales resolution under load
- **HTTPS dev server** — required for WebGPU in many browsers

## Getting started

A browser with WebGPU (Chrome, Edge, or recent Safari) and Node.js. The Vite dev server uses HTTPS because many browsers only enable WebGPU on a secure context.

```bash
git clone --recurse-submodules https://github.com/ujji77/tawaf-gpu.git
cd tawaf-gpu
npm install
npm run dev      # HTTPS on localhost
```

If you already cloned without submodules:

```bash
git submodule update --init --recursive
```

```bash
npm run build
npm run preview
```

The canvas will not start without WebGPU. Incompatible GPUs show **SYSTEM INCOMPATIBLE** on the intro card.

```bash
npm test          # hotspot order, collision, blends, store
npm run test:watch
```

Tests cover the lesson contract — tawaf stop order, stand-off outside the Kaaba, play-area bounds, animation blends, N/P guidance, screenshot arming, and restart. They do **not** boot WebGPU or screenshot the canvas; that would be slow, flaky, and a poor fit for a forkable demo.

Shared helpers live in the [`packages/three-core`](https://github.com/momentchan/three-core) submodule. Do not commit local edits there.

## Deploy

`npm run build` produces a plain static site in `dist/`. There is no server, no
database, and no build-time secrets — serve `dist/` from any static host (GitHub
Pages, Netlify, Cloudflare Pages, Vercel, S3, nginx). `base: "./"` in
`vite.config.js` means it also works from a subpath.

HTTPS is required at runtime because browsers only expose WebGPU on a secure
context.

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs the tests and build on
every push and PR; it does not deploy anywhere. Host-specific notes (the
`public/_headers` CSP file, the submodule checkout) are in
[`docs/deploy.md`](docs/deploy.md).

## Controls

| Key | Action |
| --- | --- |
| Arrow keys | Move |
| Shift | Run |
| W A S D | Orbit (third person) |
| Q / E | Zoom |
| V | View lock (ease back behind the pilgrim) |
| C | Camera mode |
| T | Day / night |
| N / P | Next / previous site |
| Click marker | Run to that site |
| X | Screenshot (hides HUD and markers) |
| R | Restart (intro card; assets stay loaded) |
| H | Toggle Leva |
| `?debug=true` | Eruda console on mobile |

On a phone: left stick moves, drag looks.

Walk into a marker for a short note. **N** / **P** guide you around the five stops in tawaf order.

Site copy and stand-off points live in [`src/components/hotspots/config.ts`](src/components/hotspots/config.ts). Plaza size and spawn are in [`src/core/worldConfig.ts`](src/core/worldConfig.ts).

## Extending

This is a starting scene, not a finished product. Ideas that fit the same pattern:

- **The rest of Hajj and Umrah** — Saʿi between Safa and Marwah, Mina, Muzdalifah, the Jamarat, then back to tawaf al-ifadah. Same character and hotspot cards, new grounds.
- **Masjid Nabawi** — the Rawdah, the minbars, the green dome; a quieter walk with notes at each station.
- **Mount Arafah** — standing at Jabal al-Rahmah, with the plain opening out around you.
- **Other Islamic sites** — Al-Aqsa, the Cave of Hira, local masajid. Anywhere a lesson is better *stood in* than read.
- **Classroom and museum builds** — slower camera, longer cards, a locked path for a group.

The cheapest first change is still a new stop in `HOTSPOTS`: id, title, body, stand position, look-at. Keep cards short. The popup is a glance, not an article.

## Credits

Please keep these credits if you fork or ship a build.

### Engine

The renderer loop, WebGPU / TSL stack, character camera, post path, and much of the app shell come from **[False Earth](https://github.com/momentchan/false-earth)** by [Ming-Jyun Hung](https://mingjyunhung.com/).

### 3D models

All three Sketchfab assets are [CC Attribution](https://creativecommons.org/licenses/by/4.0/). Redistribute the models only with attribution, and do not strip author/source links.

| Asset | Author | License | Source |
| --- | --- | --- | --- |
| [Kaaba in Mecca](https://sketchfab.com/3d-models/kaaba-in-mecca-43041d42a0ae4cb58e20a86edc572688) | [agrees_putra](https://sketchfab.com/agrees_putra) | CC BY 4.0 | Sketchfab |
| [Floor: WhiteTile 20×20 m](https://sketchfab.com/3d-models/floor-whitetile-20x20-meters-b689f03555b14f7a8d064128c2e8c220) | [Pichael Productions](https://sketchfab.com/Pichael3000) | CC BY 4.0 | Sketchfab |
| [Hajj man animated](https://sketchfab.com/3d-models/hajj-man-animated-a8806a0125274befb8d021e16c727fdf) | [Mostafa Ebrahim](https://sketchfab.com/mostafaebrahiem1998) | CC BY 4.0 | Sketchfab |

The hajj man listing states the models are free **for the purpose of aiding Islam**. Respect that intent if you reuse the character.

### Sky

Daytime atmosphere follows the Three.js **webgl_shaders_sky** example (Preetham model): [threejs.org/examples/#webgl_shaders_sky](https://threejs.org/examples/?q=sky#webgl_shaders_sky).

### Audio

The footstep and ambient clips in `public/audio/` are placeholders carried over from the original template. Swap in your own bed for a plaza; the file names (`fs_step1..5.mp3`, `ambient.mp3`) are wired in `src/components/character/CharacterAudio.tsx` and `src/ui/AudioButton.tsx`.

### Libraries

React Three Fiber, Three.js (WebGPU / TSL), Zustand, Leva, GSAP, Vite, r3f-perf.

## License

The original False Earth code is MIT. This repository is MIT as well ([`LICENSE`](LICENSE)).

**The Sketchfab models are not MIT.** They remain CC BY 4.0 (and the hajj man listing’s stated purpose). Keep author credit in any public fork or deploy.
