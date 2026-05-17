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

## Supabase Env Var Name

The anon key is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, **not** `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Supabase UI now calls it "publishable key". The client files (`src/lib/supabase/client.ts`, `server.ts`) and `.env.local.example` all use this name.

## Client vs Server Components

Most pages are `"use client"` because they use React hooks (useRouter, useState, Supabase hooks). The dashboard and auth layout files have `export const dynamic = "force-dynamic"` — this prevents Next.js from statically prerendering pages that import `@supabase/ssr`, which throws at build time without env vars.

Server components that don't import Supabase can still be static.

## Supabase RLS — Permissive for Dev

All RLS policies use `USING (true) WITH CHECK (true)`. This is intentional for development. Tighten before production.

## Seed & Schema

- **Schema**: `supabase/schema.sql` — Run in Supabase SQL Editor. Creates 4 tables + RLS + Realtime publication.
- **RPC**: `supabase/rpc.sql` — Creates `latest_telemetry_averages()` function for dashboard KPI cards.
- **Seed**: `npx tsx supabase/seed.ts` — Requires `.env.local` with Supabase creds. Generates 24h of telemetry.
- **Schema order matters**: Run `schema.sql` before `rpc.sql` before `seed.ts`.
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
- Logout clears Supabase session and pushes to `/login`.

## Middleware Deprecation

Next.js 16 warns that `middleware.ts` is deprecated in favor of `proxy.ts`. The current middleware still works (redirects `/` → `/dashboard`). When migrating, rename to `proxy.ts` and keep the same exports.
