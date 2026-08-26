# Tawaf

An open-source [WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) walk around the Kaaba. You stand on the mataf, move a pilgrim through the circuit, and stop at the sites that give tawaf its shape — the Black Stone, the door, Maqam Ibrahim, Hijr Ismail, and the Yemeni Corner.

It is a **forkable learning scene**, not a finished product. The Kaaba, floor, character, sky, and hotspot cards are already wired. The lesson itself is data: titles, copy, and stand-off points in one config file. Fork it, rewrite the notes, add stops, or rebuild the ritual as a classroom, a museum piece, or a personal study tool.

**This repository:** [github.com/ujji77/tawaf-gpu](https://github.com/ujji77/tawaf-gpu)

This is **not** a fiqh reference. The cards are short spatial notes to help someone recognise what they are looking at. For rulings, follow a teacher you trust.

---

Tawaf is the seven counterclockwise circuits around the Kaaba that open and close Hajj and Umrah. In this demo you do not complete seven laps on a timer. You walk the same ground, approach each site, and read why it is there. **N** and **P** will run the character to the next or previous stop if you would rather be guided.

The project started as a scene transplant of **[False Earth](https://github.com/momentchan/false-earth)** by [Ming-Jyun Hung](https://mingjyunhung.com/) — same WebGPU / TSL engine, character camera, and app shell, with the grass field replaced by the Haram plaza.

## What you can do here

- Walk the mataf in third person, first person, a free tripod, or bird’s-eye
- Trigger a glass card by walking into a site, or click a marker to run there
- Cycle the five stops in tawaf order with **N** / **P**
- Switch night (starmap) and day (Preetham sky + clouds) with **T**
- Capture a clean frame with **X** (HUD, Leva, and markers hide for the shot)
- Return to the intro card with **R** without reloading the page

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

## Tech stack

- **[React Three Fiber](https://r3f.docs.pmnd.rs/)** — React renderer for Three.js
- **Three.js WebGPU** — `WebGPURenderer` and node materials
- **TSL (Three Shading Language)** — sky, hotspot markers, and the post graph
- **Zustand** — camera, sky, HUD, screenshot, and hotspot guidance
- **Leva** — debug folders (press **H**)
- **Vite** — HTTPS via `@vitejs/plugin-basic-ssl`
- **`packages/three-core`** — git submodule from [momentchan/three-core](https://github.com/momentchan/three-core) (Leva wrapper, shortcuts, input, compile helpers)

## Getting started

You need a browser with WebGPU (Chrome, Edge, or a recent Safari) and Node.js.

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

## How it works

The app is a single R3F canvas. [`App.tsx`](src/app/App.tsx) creates the `WebGPURenderer`, checks `navigator.gpu`, registers shortcuts, and mounts the world, camera rig, lights, post stack, and UI.

### World

[`WorldController`](src/components/WorldController.tsx) is the scene root. It toggles floor, Kaaba, character, and environment from Leva, tracks which of those have finished compiling (so the intro progress bar can wait), and advances shared TSL uniforms (`uTime`, `uDeltaTime`).

Layout lives in [`src/core/worldConfig.ts`](src/core/worldConfig.ts):

| Constant | Role |
| --- | --- |
| `KAABA_COLLISION_RADIUS` (6.8) | Keep the pilgrim off the cube and Hateem |
| `CHARACTER_SPAWN_POSITION` | Left wall (−X), one metre outside collision |
| `FLOOR_TILE_SIZE` / `FLOOR_GRID_RADIUS` | 20 m Sketchfab tiles in a 5×5 grid |
| `FLOOR_BOUNDARY_RADIUS` (48) | Invisible outer wall at the plaza edge |

[`resolvePlayAreaCollision`](src/components/character/utils/collision.ts) treats both bounds as circles on the origin. The character cannot clip a Kaaba corner or walk off the marble.

The Kaaba GLB is photogrammetry from Sketchfab, scaled in [`Kaaba.tsx`](src/components/Kaaba.tsx). Named nodes in that mesh were used to place the sites (Hajjar Aswad, door cubes, Station of Ibrahim, Hateem).

### Learning hotspots

Sites are **only** data in [`src/components/hotspots/config.ts`](src/components/hotspots/config.ts). Array order is tawaf order:

1. Black Stone (`al-Hajar al-Aswad`) — eastern corner; circuit begins and ends here
2. Kaaba Door (`Bab al-Kaaba`) — northeast wall; the Multazam sits between door and stone
3. Maqam Ibrahim — glass pavilion facing the door; two rak‘ahs after tawaf
4. Hijr Ismail / Hateem — northwest semicircle; tawaf goes **around** it, not through it
5. Yemeni Corner (`Rukn al-Yamani`) — southern corner; the wall from here back to the Black Stone is where *Rabbana atina* is recited

Each entry has:

- `position` — where the pilgrim stands (often a radial stand-off just outside collision)
- `lookAt` — yaw target on arrival
- `radius` — proximity trigger
- `title` / `subtitle` / `body` — the glass card

[`Hotspots.tsx`](src/components/hotspots/Hotspots.tsx) draws a dim TSL marker at each point, picks the closest site in range (with a little extra radius so the card does not chatter on the edge), and writes `nearbyHotspotId` into the store. Clicking a marker calls `goToHotspot`. **N** / **P** call `cycleHotspot`.

While `guidedHotspotId` is set, character physics uses [`solveGuided`](src/components/character/utils/solveGuided.ts) instead of WASD/arrows: run toward `position`, slow on arrival, turn to `lookAt`. Arrow keys cancel the run.

[`HotspotPopup`](src/ui/HotspotPopup.tsx) reads the store and shows the card. Adding a lesson is almost entirely a new object in `HOTSPOTS`.

### Character and camera

The hajj-man GLB is a third-person pawn. Arrows are camera-relative in Follow mode ([`solveCam`](src/components/character/utils/solveCam.ts)) and tank-style in FPV ([`solveTank`](src/components/character/utils/solveTank.ts)). Shift runs.

[`CameraViewControl`](src/components/camera/CameraViewControl.tsx) owns four modes (**C**):

| Mode | Behaviour |
| --- | --- |
| Follow (3P) | Behind the pilgrim; **WASD** orbits, **Q** / **E** zoom |
| FPV | First person, tank move |
| Detached | Free tripod |
| BirdsEye | Top-down |

**V** (on by default) is view-lock: after you orbit in 3P, the camera eases back behind him (~1.6 s) so the Kaaba stays ahead as you walk.

### Sky, light, and post

**T** flips `skyMode` in the Zustand store.

- **Night** — HDRI + starfield ([`StarrySky`](src/components/background/StarrySky.tsx))
- **Day** — custom Preetham atmosphere in [`SkyAtmosphere.ts`](src/components/background/SkyAtmosphere.ts), following the [three.js sky example](https://threejs.org/examples/?q=sky#webgl_shaders_sky), plus a cloud layer. Sun elevation/azimuth drive the directional light ([`daySun.ts`](src/components/background/daySun.ts)). Tune under Leva **Day Sky** and **Day Sky.Clouds**.

[`Effects.tsx`](src/components/Effects/Effects.tsx) is a TSL post graph (bloom, DoF, tone mapping). Screenshots must wait until that pass has drawn. **X** sets `isHudHidden`, hides Leva and the 3D markers, then [`flushPendingScreenshot`](src/components/screenshot/flushPendingScreenshot.ts) grabs the canvas. Do not hang a positive-priority `useFrame` off the capture path — it will steal R3F’s render loop.

### State

[`src/core/store/gameStore.ts`](src/core/store/gameStore.ts) holds camera mode, view-lock, sky, HUD visibility, screenshot arming, nearby/guided hotspot ids, and `restartSession` (**R**), which returns to the intro card, snaps the pilgrim back to spawn, and cancels guidance without reloading assets.

Keyboard mapping for move/orbit/zoom is [`src/core/input/controls.ts`](src/core/input/controls.ts). One-shot keys (N, P, X, R, C, V, T, H) are registered in `App.tsx` via `useShortcut`.

## Project structure

```
src/
├── app/
│   └── App.tsx                 # Canvas, WebGPU init, shortcuts, DPR
├── components/
│   ├── WorldController.tsx     # Plaza root, compile targets
│   ├── Kaaba.tsx / Floor.tsx / Boundary.tsx
│   ├── hotspots/               # Learning sites
│   │   ├── config.ts           # HOTSPOTS data (edit this to add a stop)
│   │   └── Hotspots.tsx        # Markers + proximity
│   ├── character/              # Pilgrim mesh, physics, guided run
│   ├── camera/                 # Follow / FPV / detached / bird’s-eye
│   ├── background/             # Day sky (Preetham + clouds), night sky
│   ├── Effects/                # TSL post + screenshot flush
│   └── screenshot/
├── core/
│   ├── worldConfig.ts          # Radii, spawn, floor grid
│   ├── store/gameStore.ts      # Zustand
│   └── input/                  # Keyboard + touch
├── ui/
│   ├── LoadingScreen.tsx       # Intro card
│   ├── HotspotPopup.tsx        # Site notes
│   └── ControlHints.tsx        # Right-hand glass rail
└── debug/                      # Leva, perf

public/models/                  # Kaaba, floor tile, hajj man (CC-BY)
packages/three-core/            # Submodule — do not commit local edits here
```

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

## Extending

This demo is meant to be forked. The cheapest changes:

| You want to… | Touch |
| --- | --- |
| Rewrite a site note | `title` / `subtitle` / `body` in `src/components/hotspots/config.ts` |
| Add a stop | Append a `Hotspot` (and extend the `HotspotId` union). Place `position` outside `KAABA_COLLISION_RADIUS`. |
| Reorder the circuit | Reorder the `HOTSPOTS` array — **N** / **P** follow that order |
| Move spawn or plaza size | `src/core/worldConfig.ts` |
| Change walk / run feel | `src/components/character/config.ts` |
| Retune day sky | Leva folders **Day Sky** / **Day Sky.Clouds** |
| Swap the character or Kaaba | Drop a GLB in `public/models/` and point the loader at it. Keep Sketchfab CC-BY credit in this README. |

If you add a site, keep the card short. The popup is a glance, not an article.

## Credits

Please keep these credits if you fork or ship a build.

### Engine

The renderer loop, WebGPU / TSL stack, character camera, post path, and much of the app shell come from **[False Earth](https://github.com/momentchan/false-earth)** by [Ming-Jyun Hung](https://mingjyunhung.com/). False Earth asks that reuse credit the author. This repo does.

Shared helpers live in the [`three-core`](https://github.com/momentchan/three-core) submodule from the same author.

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

### Libraries

React Three Fiber, Three.js (WebGPU / TSL), Zustand, Leva, GSAP, Vite, r3f-perf.

## License

The original False Earth code is MIT. This repository is MIT as well ([`LICENSE`](LICENSE)).

**The Sketchfab models are not MIT.** They remain CC BY 4.0 (and the hajj man listing’s stated purpose). Keep author credit in any public fork or deploy.
