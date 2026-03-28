# ruleWorker — Product Flaws & Improvement Plan

> Critical product analysis of the ruleWorker flood monitoring platform.  
> Hackathon context: Cassini Space Challenge #3 — Disaster Risk Monitoring.

---

## Part 1: Product Flaws

### 1. Mock Data Island — The Core Trust Problem

The most damaging flaw. The sidebar and `/projects` list pull real data from Prisma, but **every other page ignores the database** and renders the same hardcoded "Wrocław Flood Monitor" mock. A judge who creates "Kraków River Watch" will see it in the sidebar, click through, and land on a page titled "Wrocław Flood Monitor" with unrelated data. This destroys credibility instantly — it signals the product is a static mockup, not a working system.

**Impact:** Any live demo longer than 2 clicks exposes this.

### 2. Navigation Dead Ends Everywhere

| Element | What happens |
|---------|-------------|
| Home page — all 6 CTA buttons | `alert('Mock')` |
| "Create API Key" | `alert()` |
| "Edit Project" button | Toast stub |
| "New Rule" button | Toast stub |
| "New Workflow" button | Toast stub |
| "Delete Workflow" button | Toast stub |
| Monitor "Reset to Live" | Toast stub that doesn't reset |
| Sidebar → Monitor Settings | **404** |
| Sidebar → Monitor Logs | **404** |
| Sidebar search (⌘K) | Decorative, no handler |
| `/dashboard` | Empty boilerplate page with double sidebar bug |

More than 60% of clickable UI elements do nothing. A product demo turns into a minefield — every judge instinct to "explore" hits a dead end.

### 3. Single-Dataset Lock-In

Datasets and Rules views only recognize the filename `weather.csv`. The sidebar hardcodes this for every project. There is no upload flow, no file discovery, no multi-dataset support. The product presents itself as a platform ("upload data → train rules → monitor") but only the first step of the pipeline works.

### 4. Dark Mode Is Broken

The app ships with a theme toggle (clever "D" hotkey), but multiple pages have hardcoded light-mode colors:
- Timeline: `bg-white` on cards, stat boxes, and filter buttons → invisible in dark mode
- Rules: `bg-gradient-to-r from-blue-50 to-cyan-50`, `bg-amber-50` → harsh flash in dark mode
- Monitor proximity gauge: inline CSS custom properties with hardcoded hex → no adaptation
- Badge colors throughout: `bg-green-100 text-green-800` → unreadable on dark backgrounds

If a judge happens to toggle dark mode (or has system dark preference), multiple pages look broken.

### 5. No Real-Time Data Connection

The monitor page is the product's flagship — live flood monitoring. But it has:
- No WebSocket connection (spec'd but not built)
- No API fetch for sensor data
- `previousValues` hardcoded (trend arrows never actually change)
- Rule evaluation uses `new Function()` string eval (security risk if data source ever changes)

The "live" monitor is a manual slider form. For a disaster monitoring tool, the absence of any actual data feed is the biggest feature gap.

### 6. No Authentication / Multi-Tenancy

No login, no user model, no API keys, no RBAC. The `Authorization: Bearer <token>` is spec'd in the README but not implemented. Any visitor sees all projects. For a hackathon demo this is acceptable, but it makes the "Create API Key" step on the landing page dishonest.

### 7. The Dashboard Is an Empty Skeleton

`/dashboard` renders three grey rectangles with "Data Fetching" breadcrumbs — leftover scaffolding from shadcn init. It also nests a duplicate `SidebarProvider` + `AppSidebar`, producing a **double sidebar**. This page is not linked from the sidebar, but is reachable via URL.

### 8. Sidebar Uses `<a>` Instead of `<Link>`

Every sidebar navigation item causes a full page reload instead of client-side transition. With the Prisma query in the sidebar server component, this adds latency to every click. It also breaks React state — the monitor page's adjusted slider values vanish on any sidebar click.

### 9. No Error Boundaries or Loading States

- Zero `error.tsx` files → Prisma failures or invalid IDs crash the page with an unhandled exception
- Zero `loading.tsx` files → server components show blank until ready (no skeleton/spinner)
- Zero `not-found.tsx` files → invalid project IDs either show broken mock data or crash

### 10. Project Cards Don't Link to Projects

On `/projects`, each project renders as a static card. The only way to reach `/projects/[id]` is through the sidebar tree → users miss the primary navigation pattern.

### 11. Workflows Exist in Isolation

Workflows are a rich feature (6-step pipeline, execution history, logs) but:
- Cannot be created, edited, or deleted
- All hardcoded to a single `projectId`
- No connection between workflow execution and actual data processing
- No trigger from the monitor page

### 12. Timeline ≠ Alert History

The timeline has 13 hardcoded events (some referencing **future** dates beyond today). There's no mechanism to:
- Auto-generate timeline entries when rules trigger
- Import real IMGW disaster records
- Correlate alerts with disaster outcomes over time

It's a beautiful visualization with no data pipeline feeding it.

---

## Part 2: Improvement Plan

### Priority 1 — Demo Credibility (fix before any presentation)

#### 1A. Wire Project Detail to Prisma
Expand the `Project` model to store `area`, `target`, `webhookUrl`, `monitoringEnabled` etc. Make `/projects/[id]` pull from the database so the name, area, and settings match what the user created. Fall back to mock data only for fields not yet stored.

#### 1B. Make Project Cards Clickable
Wrap each card in `<Link href={/projects/${project.id}}>` — one line, huge impact.

#### 1C. Kill the Dead Ends
- Remove or hide buttons that aren't wired. A "Coming soon" tooltip is honest; a button that fires `alert('Mock')` is not.
- Create minimal placeholder pages for `/monitor/settings` and `/monitor/logs` (even a "Coming soon" card is better than a 404).
- Delete or redirect `/dashboard`.

#### 1D. Fix Dark Mode
Replace all `bg-white`, `from-blue-50`, `bg-amber-50`, etc. with Tailwind theme tokens (`bg-card`, `bg-muted`, `text-muted-foreground`). This is a bulk find-and-replace, not a redesign.

#### 1E. Switch Sidebar to `<Link>`
Replace `<a href=` with `<Link href=` in `app-sidebar.tsx`. One import, ~15 replacements.

---

### Priority 2 — Core Product Value (differentiators for judging)

#### 2A. Live Data Feed for the Monitor
Connect the monitor page to a real (or simulated-real) data source:
- Simplest: a `/api/projects/[id]/monitor/live` Next.js API route that reads the latest row from `imgw_cache/meteo_wroclaw_cache.csv` or calls the existing `fetch_api.py` script.
- Show the data refreshing on a 30-second interval with `setInterval` + `fetch`.
- Replace `new Function()` eval with a safe parser (regex-based condition evaluation).

#### 2B. Connect Backend ML to Frontend
The project already has `build_dataset.py`, `run_ripper_model.py`, and `train_multiclass_model.py`. Create thin API routes that:
1. Trigger `build_dataset.py --city <area>` → store the CSV → populate the datasets page
2. Trigger `run_ripper_model.py` → parse the output rules → populate the rules page
3. Return training status so the "Retrain" button actually does something

This connects the hackathon's ML work to the frontend — the most impactful integration for judges.

#### 2C. Multi-City / Multi-Project Support
The backend already supports `--city Wroclaw` and `--city Krakow`. Let users create projects for different cities, run the pipeline per city, and see distinct data per project. This demonstrates platform thinking, not a one-off demo.

#### 2D. Map View with Risk Zones
Replace the "Map visualization placeholder" with a Leaflet map showing:
- Station locations from `imgw_cache/dane_hydro/`
- Color-coded risk pins based on current alert level
- River basin overlay for the monitored area

Copernicus/satellite integration is the hackathon theme — a map is the most visual way to demonstrate it.

---

### Priority 3 — Product Completeness

#### 3A. Dataset Upload & Discovery
- Add a file upload endpoint (`POST /api/projects/[id]/datasets`, multipart)
- Store CSVs in a project-scoped directory
- Parse column names/types on upload
- Remove the `weather.csv` hardcode — make the sidebar discover actual files

#### 3B. Real Workflow Execution
- Wire "New Workflow" to create a DB record
- Implement at least one pipeline step end-to-end (data ingestion → RIPPER training)
- Show real execution logs instead of mock ones

#### 3C. Alert Pipeline
- When the monitor evaluates rules and one triggers, create an `Alert` record
- Send the webhook (user-configured URL) with the alert payload
- Auto-generate a `TimelineEvent` for each alert
- Show alert history on the project page

#### 3D. Notification System
- Webhook dispatch (already spec'd)
- Email via Resend or SendGrid
- In-app notification badge on the sidebar

---

### Priority 4 — Production Readiness

#### 4A. Authentication
Add NextAuth.js with GitHub/Google providers. Scope projects to users. Gate API routes with session checks.

#### 4B. Migrate to PostgreSQL
SQLite doesn't support concurrent writes from background workers. Switch to Postgres (the hackathon already has a PostgreSQL MCP server available).

#### 4C. Error Boundaries & Loading States
- Add `loading.tsx` with skeleton loaders per route segment
- Add `error.tsx` with retry buttons
- Add `not-found.tsx` for invalid IDs

#### 4D. Accessibility Pass
- `aria-label` on all sort/filter buttons
- `aria-pressed` on filter toggle buttons
- Skip-to-content link in layout
- `min`/`max`/`step` on monitor number inputs
- Keyboard navigation audit for sidebar and timeline

#### 4E. Performance
- Replace `<a>` with `<Link>` (Priority 1E) for client-side nav
- Add `Suspense` boundaries around server components
- Paginate timeline and workflow logs
- Memoize expensive components (proximity gauge, data tables)

---

## Summary Matrix

| Flaw | Severity | Effort | Priority |
|------|----------|--------|----------|
| Mock data disconnect (Prisma ≠ pages) | Critical | Medium | 1A |
| Navigation dead ends / 404s | Critical | Low | 1C |
| Project cards not clickable | High | Trivial | 1B |
| Dark mode broken | High | Low | 1D |
| Sidebar full reloads (`<a>`) | High | Trivial | 1E |
| No live data connection | High | Medium | 2A |
| Backend ML not connected to frontend | High | Medium | 2B |
| Single city / single dataset | Medium | Medium | 2C |
| Map view missing | Medium | Medium | 2D |
| No dataset upload | Medium | Medium | 3A |
| Workflows are inert | Medium | High | 3B |
| No alert pipeline | Medium | High | 3C |
| Empty dashboard page (double sidebar) | Low | Trivial | 1C |
| No auth | Low | Medium | 4A |
| No error/loading boundaries | Low | Low | 4C |
| Accessibility gaps | Low | Low | 4D |

---

*Generated from analysis of API_README.md, all page/component sources, mock data files, Prisma schema, sidebar structure, and the ML backend scripts.*
