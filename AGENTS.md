# AGENTS.md — Kinetic Industrial Dashboard

## Build & Run

```bash
pnpm dev          # Next.js 16 dev server (Turbopack)
pnpm build        # TypeScript check + production build (runs tsc internally)
pnpm lint         # ESLint only — no typecheck
```

Type checking happens inside `pnpm build`, not as a separate script.

## Tailwind v4 — No tailwind.config

All design tokens live in `src/app/globals.css` via `@theme` blocks. There is **no** `tailwind.config.ts` or `tailwind.config.js`. Do not add one.

## Authentication — Supabase Auth + @supabase/ssr

Auth uses Supabase Auth (email/password), not the custom Passport.js stack that was previously here.

| Concern | Details |
|---|---|
| Login | `supabase.auth.signInWithPassword({ email, password })` in `useAuth` hook |
| Logout | `supabase.auth.signOut()` — clears Supabase cookies |
| Session | `sb-{ref}-auth-token` cookie managed by `@supabase/ssr` via middleware |
| User data | `operator_id` stored in `user_metadata.operator_id` during signup |
| Profiles | `public.profiles` table auto-created via `handle_new_user()` trigger on `auth.users` INSERT |
| Signup gate | Controlled by Supabase dashboard → Authentication → Settings → "Allow new users to sign up" toggle |

### Key auth files

| File | Purpose |
|---|---|
| `src/proxy.ts` | Supabase SSR middleware — calls `getUser()`, protects routes, syncs cookies |
| `src/lib/hooks/useAuth.ts` | Client hook — `signIn()`, `signOut()`, `user`, `loading` via Supabase browser client |
| `src/app/api/auth/signup/route.ts` | `POST` — calls `signUp()` with email, password, `user_metadata.operator_id` |
| `src/app/auth/confirm/route.ts` | `GET` — handles email confirmation redirects (`verifyOtp`) |
| `src/components/auth/activity-monitor.tsx` | 30-min inactivity auto-logout (client-side only, no server heartbeat) |

### Inactivity Auto-Logout (30 min)

`src/components/auth/activity-monitor.tsx` watches `mousemove`, `keydown`, `click`, `scroll`, `touchstart`:
- At 28 min: shows modal with live 2-min countdown and "Stay logged in" / "Logout now" buttons
- At 30 min: calls `supabase.auth.signOut()`, redirects to `/login`
- Mounted in `(dashboard)/layout.tsx` wrapping all protected routes

## Proxy (Route Protection) — Next.js 16

The file is `src/proxy.ts` (Next.js 16 convention, was `middleware.ts`). Uses Supabase SSR pattern:
- Creates `createServerClient` with cookie `getAll`/`setAll` from the request
- Calls `supabase.auth.getUser()` immediately — **do not add code between client creation and `getUser()`**
- Protects `/dashboard`, `/nodes`, `/health`, `/terminal`, `/motor`, `/preferences` — redirects to `/login` if no user
- Redirects authenticated users from `/login` → `/dashboard`
- Redirects `/` → `/dashboard`
- Must return the `supabaseResponse` object with synced cookies — never return a fresh `NextResponse.next()` without copying cookies

## Supabase Env Var Name

The anon key is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, **not** `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Client and server files both use this name.

## Client vs Server Components

Most pages are `"use client"` because they use React hooks. Dashboard and auth layout files have `export const dynamic = "force-dynamic"` — prevents static prerendering of pages that import `@supabase/ssr`.

## Supabase RLS — Permissive for Dev

All RLS policies use `USING (true) WITH CHECK (true)`. Tighten before production.

## Seed & Schema

- **Schema**: `supabase/schema.sql` — Creates `motor_nodes`, `telemetry_live`, `diagnostics_logs`, `terminal_logs`, `profiles` + RLS + Realtime publication + `handle_new_user()` trigger
- **RPC**: `supabase/rpc.sql` — Creates `latest_telemetry_averages()` function for dashboard KPI cards
- **Seed**: `supabase/seed.sql` (SQL) or `npx tsx supabase/seed.ts` (TypeScript) — 8 nodes + 8 diagnostics logs + 24h telemetry
- **Schema order**: `schema.sql` → `rpc.sql` → `seed.sql`
- `supabase/` is excluded from TypeScript compilation (`tsconfig.json`)
- `ALTER PUBLICATION supabase_realtime ADD TABLE telemetry_live` is wrapped in `DO $$ ... EXCEPTION WHEN duplicate_object` — running schema.sql twice is safe

## Design System — Material Design 3 Light Theme

All tokens in `src/app/globals.css` under `@theme`. Never hardcode hex values or arbitrary sizes.

### Component Conventions

- **Cards**: `bg-surface border border-outline-variant rounded-lg p-6` (or `p-8` for large cards)
- **Inputs**: `w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none transition-all`
- **Primary Buttons**: `h-12 bg-primary text-on-primary font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2`
- **Secondary Buttons**: `h-12 bg-surface border border-outline text-on-surface font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:bg-surface-container-high active:scale-95`

### Typography

| Class | Usage | Font |
|---|---|---|
| `font-sans text-[48px]/[56px] tracking-[-0.02em] font-bold` | Hero headings | Inter |
| `font-sans text-[24px] leading-8 font-semibold` | Page titles | Inter |
| `font-sans text-[16px] leading-6` | Body, nav items | Inter |
| `font-mono text-[14px] leading-5 font-medium` | Input values, data fields | JetBrains Mono |
| `font-mono text-[12px] leading-4 tracking-[0.05em] font-bold uppercase` | Labels, buttons | JetBrains Mono |

### Spacing

| Token | Value | Usage |
|---|---|---|
| `p-margin-desktop` | `32px` (2rem) | Main content padding |
| `p-margin-mobile` | `16px` | Mobile content padding |
| `p-gutter` | `16px` | Sidebar internal padding |

## Azure IoT Hub

- `azure-iothub` SDK is server-only. Do not import in client components.
- Library: `src/lib/iot-hub/index.ts`
- API route: `POST /api/devices/register` — Supabase insert + optional Azure IoT Hub identity
- Without `AZURE_IOT_HUB_CONNECTION_STRING`, devices are registered in Supabase only (graceful fallback)

## Charts

Recharts `ResponsiveContainer` needs a parent with explicit height. If charts render blank, check that the parent has `h-64` or similar. `min-h-0` on a flex child collapses the container to zero.

## Icons

Material Symbols via `material-symbols` npm package, imported in `src/app/layout.tsx`. Use `<span className="material-symbols-outlined">icon_name</span>`. Filled variant: `style={{ fontVariationSettings: "'FILL' 1" }}`.

## Fonts

Inter (sans) and JetBrains Mono (mono) via `next/font/google`. CSS variables `--font-inter` / `--font-jetbrains-mono`, mapped to `--font-sans` / `--font-mono` in `@theme`.

## Images

Centralized in `src/lib/images.ts`. Import `IMAGES` for static paths, `getNodeImage(nodeId)` for per-node images. Add node images via `NODE_IMAGE_MAP` — never store paths in the DB.

## Route Structure

| Route | Layout | Auth |
|---|------|-------|
| `/login`, `/signup` | `(auth)` — LoginHeader + LoginFooter | No |
| `/dashboard`, `/nodes`, `/health`, `/terminal`, `/preferences` | `(dashboard)` — Sidebar + Topbar + ActivityMonitor | Yes |
| `/motor/[id]` | Standalone (not in any group) — own header with back button | Yes |
| `/help`, `/contact`, `/privacy` | Standalone — minimal header with Dashboard/Login button | No |

`/motor/[id]` is deliberately outside `(dashboard)` — it does not render the sidebar or topbar. Standalone public pages (`/help`, `/contact`, `/privacy`) use `useAuth()` to conditionally link to `/dashboard` or `/login`.

## Navigation Conventions

- Sidebar links use `<Link replace>` — no browser history push for tab switching
- Motor detail back button uses `router.back()`
- Login → dashboard uses `router.push()`
- Logout calls `supabase.auth.signOut()` and pushes to `/login`

## Future TODOs

| # | Task | Notes |
|---|------|-------|
| 1 | Password reset | Supabase `resetPasswordForEmail` flow — needs reset page + email template |
| 2 | Security audit | RLS policies currently `USING (true)` — tighten per-role. Enforce email confirmation. |
| 3 | Terminal / Remote command | Expand `/terminal` with command history, per-node targeting, response streaming |
| 4 | Analytics / Health page | Add historical comparison, anomaly detection, export on `/health` |
| 5 | Account preferences | Password change, linked devices view, session activity (currently placeholder UI) |
