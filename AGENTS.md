# AGENTS.md — Kinetic Industrial Dashboard

## Build & Run

```bash
pnpm dev          # Next.js 16 dev server (Turbopack)
pnpm build        # TypeScript check + production build (runs tsc internally)
pnpm lint         # ESLint only — no typecheck
```

Type checking happens inside `pnpm build`, not as a separate script. If build fails on types, fix those before committing.

## Tailwind v4 — No tailwind.config

All design tokens live in `src/app/globals.css` via `@theme` blocks. There is **no** `tailwind.config.ts` or `tailwind.config.js`. Tailwind v4 reads `@theme` from CSS, not JS config. Custom colors, spacing, font sizes, and radii are defined there — do not add a config file.

---

## Design System — Color Scheme & Typography

All tokens are defined in `src/app/globals.css` under `@theme`. When creating new pages or components, use only these tokens — never hardcode hex values or arbitrary sizes.

### Palette (Material Design 3 — Dark Theme)

| CSS Variable / Tailwind Class | Hex | Usage |
|---|---|---|
| `--color-primary` | `#4CDDAF` | Primary actions, active nav items, headings |
| `--color-on-primary` | `#003A2A` | Text on primary buttons |
| `--color-primary-container` / `bg-primary-container` | fade of primary | Filled tonal buttons |
| `--color-secondary` | `#B1D0BF` | Secondary accents, pulse dots |
| `--color-on-secondary-container` | `#0B1F15` | Active nav item text |
| `--color-secondary-container` / `bg-secondary-container` | fade of secondary | Active nav background |
| `--color-surface` / `bg-surface` | `#141418` | Sidebar, cards, inputs |
| `--color-surface-dim` / `bg-surface-dim` | `#141418` | Login background |
| `--color-surface-container-lowest` / `bg-surface-container-lowest` | `#0F0F13` | Login form card |
| `--color-surface-container-high` / `bg-surface-container-high` | lighter surface | Nav hover, cards |
| `--color-surface-container-highest` / `bg-surface-container-highest` | lightest surface | Avatar background, glass panels |
| `--color-background` / `bg-background` | `#0C0C10` | Main content area |
| `--color-on-surface` / `text-on-surface` | `#E0E3DF` | Primary text, labels |
| `--color-on-surface-variant` / `text-on-surface-variant` | `#C1C7C1` | Secondary text, descriptions |
| `--color-outline` / `border-outline` | `#8B938F` | Input borders |
| `--color-outline-variant` / `border-outline-variant` | `#414941` | Card borders, dividers |
| `--color-error` / `text-error` | `#FFB4A9` | Error text, danger buttons |
| `--color-warning` / `text-warning` | `#FFD764` | Warning indicators, session countdown |
| `--color-success` | `#81C784` | Success badges |

### Typography Scale

| Tailwind Class | Usage | Font |
|---|---|---|
| `font-sans text-[48px] leading-[56px] tracking-[-0.02em] font-bold` | Hero headings | Inter |
| `font-sans text-[24px] leading-8 font-semibold` | Page titles | Inter |
| `font-sans text-[18px] leading-6 font-bold` | Card headings | Inter |
| `font-sans text-[16px] leading-6` | Body, nav items | Inter |
| `font-sans text-[14px] leading-5` | Secondary text, descriptions | Inter |
| `font-sans text-[13px] leading-5` | Dense body text | Inter |
| `font-mono text-[14px] leading-5 font-medium` | Input values, data fields | JetBrains Mono |
| `font-mono text-[12px] leading-4 tracking-[0.05em] font-bold` | Labels, buttons, status | JetBrains Mono |
| `font-mono text-[12px] leading-4 tracking-[0.05em] font-bold uppercase` | Section labels | JetBrains Mono |

### Spacing & Layout

| Token | Value | Usage |
|---|---|---|
| `p-margin-desktop` | `24px` | Main content padding |
| `p-margin-mobile` | `16px` | Mobile content padding |
| `p-gutter` | `16px` | Sidebar internal padding |
| `max-w-max-width` | `1440px` | Max content width |

### Component Conventions

- **Cards**: `bg-surface border border-outline-variant rounded-lg p-6` (or `p-8` for large cards)
- **Inputs**: `w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none transition-all`
- **Primary Buttons**: `h-12 bg-primary text-on-primary font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2`
- **Secondary Buttons**: `h-12 bg-surface border border-outline text-on-surface font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:bg-surface-container-high active:scale-95`

---

## Supabase Env Var Name

The anon key is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, **not** `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Supabase UI now calls it "publishable key". The client files (`src/lib/supabase/client.ts`, `server.ts`) and `.env.local.example` all use this name.

## Client vs Server Components

Most pages are `"use client"` because they use React hooks (useRouter, useState, Supabase hooks). The dashboard and auth layout files have `export const dynamic = "force-dynamic"` — this prevents Next.js from statically prerendering pages that import `@supabase/ssr`, which throws at build time without env vars.

Server components that don't import Supabase can still be static.

## Authentication — Passport.js + Argon2id + iron-session

Authentication has been moved off Supabase Auth to a custom stack:

### Architecture

| Layer | Technology |
|---|---|
| Password Hashing | argon2 (`argon2` npm) — Argon2id, 10 iterations, 64MB |
| Timing Defense | `crypto.timingSafeEqual` + dummy hash on missing users |
| Strategy | Passport.js (`passport-local`) — email/password local strategy |
| Session Store | `iron-session` — encrypted httpOnly cookie (`kinetic_session`), 8h max age |
| User Table | `operators` in Supabase — `id`, `email`, `operator_id`, `argon2_hash` |

### Key Files

| File | Purpose |
|---|---|
| `src/lib/auth/password.ts` | `hashPassword()`, `verifyPassword()`, `constantTimeEqual()`, `dummyVerify()` |
| `src/lib/auth/passport.ts` | Passport local strategy, `authenticate()` export |
| `src/lib/auth/session.ts` | `getSession()`, `saveSession()`, `touchSession()`, `destroySession()` |
| `src/app/api/auth/login/route.ts` | `POST` — authenticate + create session |
| `src/app/api/auth/logout/route.ts` | `POST` — destroy session |
| `src/app/api/auth/session/route.ts` | `GET` — return current user |
| `src/app/api/auth/touch/route.ts` | `POST` — refresh `lastActivity` timestamp |
| `src/lib/hooks/useAuth.ts` | Client hook — `signIn()`, `signOut()`, `user`, `loading` |

### Timing Attack Defense

- `verifyPassword()` uses argon2's internal constant-time comparison (no early exit on mismatch).
- When a user doesn't exist in the `operators` table, `passport.ts` calls `dummyVerify()` which hashes a dummy password with identical Argon2 parameters — matching the CPU cost of a real verify. This prevents user enumeration.
- `constantTimeEqual()` is exported for external use via `crypto.timingSafeEqual`.

### Inactivity Auto-Logout (30 min)

`src/components/auth/activity-monitor.tsx` watches user activity (`mousemove`, `keydown`, `click`, `scroll`, `touchstart`):
- Sends a heartbeat `POST /api/auth/touch` every 30s to refresh server-side `lastActivity`
- At 28 min: shows modal with live 2-min countdown and "Stay logged in" / "Logout now" buttons
- At 30 min: auto-logout, destroys session, redirects to `/login`
- Mounted in `(dashboard)/layout.tsx` wrapping all protected routes

### Env Vars

`SESSION_SECRET` (min 32 chars) required — added to `.env.local.example`.

## Supabase RLS — Permissive for Dev

All RLS policies use `USING (true) WITH CHECK (true)`. This is intentional for development. Tighten before production.

## Seed & Schema

- **Schema**: `supabase/schema.sql` — Creates 4 tables + RLS + Realtime publication.
- **RPC**: `supabase/rpc.sql` — Creates `latest_telemetry_averages()` function for dashboard KPI cards.
- **Operators**: `supabase/operators.sql` — Creates `operators` table for Argon2-hashed passwords. Run after `schema.sql`.
- **Seed**: `npx tsx supabase/seed.ts` — Requires `.env.local`. Generates 8 nodes + 24h of telemetry.
- **Operators Seed**: `npx tsx supabase/seed-operator.ts` — Creates `operator@kinetic.local` / `access-key-123` and `admin@kinetic.local` / `admin-key-456`.
- **Schema order**: `schema.sql` → `rpc.sql` → `operators.sql` → `seed.ts` → `seed-operator.ts`
- The `supabase/` directory is excluded from TypeScript compilation (`tsconfig.json`).
- `ALTER PUBLICATION supabase_realtime ADD TABLE telemetry_live` is wrapped in a `DO $$ ... EXCEPTION WHEN duplicate_object` block — running schema.sql twice is safe.

## Azure IoT Hub

- `azure-iothub` SDK is server-only (API route). Do not import it in client components.
- The library is at `src/lib/iot-hub/index.ts`.
- API route: `POST /api/devices/register` — creates Supabase record + registers device identity in Azure IoT Hub.
- The `registry.create` callback provides the device object directly, not wrapped in `responseBody`.
- Without `AZURE_IOT_HUB_CONNECTION_STRING`, devices are registered in Supabase only (graceful fallback).
- The connection string contains the shared access key — never commit to source control.

## Instrumentation

`src/instrumentation.ts` runs at server startup. It checks if `motor_nodes` table exists and logs status. Next.js 16 auto-detects this file — no config flag needed.

## Charts

Recharts `ResponsiveContainer` needs a parent with explicit height. If charts render blank, check that the parent has a height set (e.g. `h-64` on the card, `flex-1` on the chart wrapper). `min-h-0` on a flex child can collapse the Recharts container to zero dimensions.

## Icons

Material Symbols are loaded via the `material-symbols` npm package, imported once in `src/app/layout.tsx`. Use `<span className="material-symbols-outlined">icon_name</span>`. For filled variants, add `style={{ fontVariationSettings: "'FILL' 1" }}`.

## Fonts

Two fonts via `next/font/google`: Inter (UI text) and JetBrains Mono (data/metrics). Both are set as CSS variables `--font-inter` and `--font-jetbrains-mono`, referenced by Tailwind as `--font-sans` and `--font-mono` in `@theme`. Design convention: labels and data values use monospace, headings and body text use sans.

## Navigation Conventions

- Sidebar links use `<Link replace>` — no browser history push for tab switching.
- Motor detail back button uses `router.back()`.
- Login → dashboard uses `router.push()`.
- Logout calls `POST /api/auth/logout` (clears iron-session cookie) and pushes to `/login`.

## Middleware (Route Protection)

`src/middleware.ts` (deprecated, migrate to `proxy.ts`):
- Redirects `/` → `/dashboard`
- Checks for `kinetic_session` cookie on `/dashboard`, `/nodes`, `/health`, `/terminal`, `/motor/*` — redirects to `/login` if missing
- Redirects authenticated users from `/login` → `/dashboard`
- API routes (`/api/`) are excluded from protection

## Images

**All image paths live in `src/lib/images.ts` — one centralized registry.** Import `IMAGES` for static paths and `getNodeImage()` for per-node images. There is no `image_url` column in the database or `MotorNode` type.

```ts
import { IMAGES } from "@/lib/images";        // static: IMAGES.hero, IMAGES.motorInternals, IMAGES.node
import { getNodeImage } from "@/lib/images";   // per-node: getNodeImage(nodeId) → string | null
```

To add a node image, add one line to the `NODE_IMAGE_MAP`. Do not store image paths in the database.

## `argon2` Build Approval

After `pnpm install`, run `pnpm approve-builds argon2` and `pnpm install` again. pnpm blocks native build scripts by default.
