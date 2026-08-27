# Deploy

Tawaf GPU is a static site. `npm run build` writes everything to `dist/` — HTML,
JS, textures, models, audio. Serve that folder from any static host.

```bash
npm ci
npm run build
# then upload ./dist to your host, or:
npm run preview   # serve the build locally to check it
```

There is no server, no database, and no build-time secrets. Nothing phones home.

## Notes per host

- **Any static host** (S3 + CloudFront, nginx, Caddy, GitHub Pages, Netlify,
  Cloudflare Pages, Vercel): point it at `dist/`. `vite.config.js` sets
  `base: "./"`, so the build works from a subpath without extra config.
- **`public/_headers`** is copied to `dist/_headers` on build. Cloudflare Pages and
  Netlify read it and apply the Content-Security-Policy and MIME-type rules.
  Other hosts ignore the file — translate the same rules into your host's header
  config if you want the CSP.
- **`public/robots.txt`** and **`public/sitemap.xml`** ship at the site root. Both
  hard-code `https://tawaf-gpu.pages.dev` — change that to your own domain if you
  deploy this fork somewhere else. `robots.txt` disallows AI/LLM crawlers; edit
  it if your policy differs.
- **HTTPS is required at runtime.** Browsers only expose WebGPU on a secure
  context. Every host above serves HTTPS by default; if you self-host, terminate
  TLS in front of the files.
- **Submodule.** CI and any build box must check out `packages/three-core`
  (`git clone --recurse-submodules`, or `git submodule update --init --recursive`).

## CI

`.github/workflows/ci.yml` runs `npm ci && npm test && npm run build` on push and
PR. It does not deploy anywhere — wire up your host's own deploy action or
connect the repo to your host's Git integration and let it build with
`npm run build`.
