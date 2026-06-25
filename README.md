# HardenCheck

**Your personalized device-hardening checklist.** A static, client-side web app
(C-LAB / ARGUS Defense Network) for journalists, sources and human-rights
defenders. The operator describes their device and threat level; HardenCheck
returns a tailored, plain-language security checklist they can work through, tick
off, and export.

It is a **guide, not a scanner.** It does not inspect the device or verify
anything — it gives the right tasks, in priority order, with per-platform steps.
For active checks, see the C-LAB device tools (`computer-check`, `mobile-check`,
`wifi-check`).

## What it does

1. Asks a short profile: OS (macOS / Windows / Linux / iPhone-iPad / Android),
   who manages the device, exposure level (standard / elevated / high-targeted),
   and optional flags (travels across borders, shared device, holds sensitive
   sources).
2. Filters the task database (`tasks.js`) against that profile.
3. Renders a grouped, checkable checklist with **why it matters** + **how to do
   it** on the chosen OS, sorted by priority within nine categories (Accounts,
   Updates, Device, Apps, Network, Browser, Messaging, Backups, High-risk).
4. Tracks progress (a ring + bar), persists it, and exports to **Markdown**,
   **JSON**, or **print/PDF**.

Trilingual UI and content: **EN / ES / DE** (German uses the informal *Du*).

## Privacy

Runs **100% in the browser**. CSP `connect-src 'none'` — there is no server and
no network call of any kind. The profile and checkmark progress are stored only
in `localStorage` on the operator's own device. Nothing is ever transmitted.

## Files

```
index.html     shell (ARGUS node layout)
app.js         engine: profile form, checklist, progress, export, i18n
tasks.js       the checklist content (trilingual task database)
styles.css     tool-specific styling (C-LAB cyan accent)
node.css       ARGUS design system (vendored, shared across nodes)
node.js        ARGUS motion engine (clock, decode, motes, radar)  (vendored)
icons.js       ARGUS icon registry (vendored)
fonts/         Space Grotesk + IBM Plex Mono (latin subset, vendored)
_headers       Cloudflare Pages: CSP + no-cache for code
```

`node.css`, `node.js`, `icons.js` and `fonts/` are vendored from the shared
ARGUS node design system (same source as `wifi-check/guided`). Keep them in sync
with the canonical copy.

## Deploy (Cloudflare Pages)

It is a pure static site — no build step.

- **Build command:** *(none)*
- **Build output directory:** the repo root (the directory containing
  `index.html`)
- Cloudflare reads `_headers` automatically for CSP and caching.

Locally, serve the folder with any static server, e.g.
`python3 -m http.server` and open the printed URL.

## Conventions

Categories map to Luis's Marco de Seguridad vector prefixes
(A/O/F/M/N/W/E/C/H). Copy avoids em dashes. Honest about limits: this tool
recommends, it does not claim to have checked. See
`tools-cybersecurity/CONVENTIONS.md`.
